# Sprint 6.18 — Patch n8n PROD : callback proactif Audit LLM (D1-A)

## Objectif

Ajouter un callback HTTP **proactif** (D1-A retour 78) à chaque exécution PREV
PROD qui contient un rerank LLM, vers l'endpoint
`POST https://<SITE>/api/internal/prev-llm-audit`.

Le SITE persiste l'événement (table `prev_llm_audit_events`) et déclenche
Sentry (warn / error selon la granularité D3-tiered) **uniquement** si :

- `profil_type === "prive"`, ET
- le LLM a effectivement révoqué (codes différents et delta de score > 0).

Aucune donnée personnelle n'est envoyée — uniquement de la télémétrie
algorithmique (codes événement, scores, écart, raison primaire, ref commande).

---

## 1. Pré-requis

- Variable d'environnement n8n PROD : `N8N_WEBHOOK_SECRET` (déjà utilisée par
  les autres callbacks). Vérifier dans les secrets du workflow.
- Endpoint SITE déployé (`/api/internal/prev-llm-audit`).
- Migration Prisma `20260511171500_prev_llm_audit_events` appliquée :

```powershell
cd SITE
npx dotenv -e .env.production -- npx prisma migrate deploy
```

---

## 2. Pose dans l'éditeur n8n PROD (workflow `PREV — PROD`, ID `Qp8WkBhPEvYbdb9j`)

Insérer **2 nœuds en série** juste **après** `S60 Apply Rerank` et **avant**
les nœuds de livraison finale (formatage rapport, mail, callback statut).

### 2.1 Node Code — `S70 Build Audit Callback`

Type : **Code** (mode "Run Once for All Items"), langage JavaScript.

```javascript
// S70 Build Audit Callback (Sprint 6.18 retour 78 — D1-A proactif)
// Calcule le payload de télémétrie LLM (aucune PII).
// Émet { _s70Audit: null } si pas de rerank applicable, sinon
//   { _s70Audit: { url, headers, body } } prêt à brancher dans HTTP Request.
const items = $input.all();
const out = [];
for (const it of items) {
  const j = it.json || {};
  const rerank = j._s60Rerank || null;
  const profilType = (j.profil_type === "public") ? "public" : "prive";

  // Pas de rerank LLM → pas d'audit (rien à reporter).
  if (!rerank || typeof rerank !== "object") {
    out.push({ json: { ...j, _s70Audit: null } });
    continue;
  }

  const mathTop1Code = String(rerank.originalTop1Code || rerank.mathTop1Code || "").toUpperCase();
  const llmChosenCode = String(rerank.chosenCode || "").toUpperCase();
  const mathTop1Score = Number(rerank.originalTop1Score ?? rerank.mathTop1Score ?? 0) | 0;
  const llmChosenScore = Number(rerank.chosenScore ?? rerank.confidence_in_choice ?? 0) | 0;

  if (!mathTop1Code || !llmChosenCode) {
    out.push({ json: { ...j, _s70Audit: null } });
    continue;
  }

  // Filtre : on n'audite QUE les vraies révocations (codes différents et delta > 0).
  // Cela limite drastiquement le volume (les "non-révocations" inondent sinon).
  if (mathTop1Code === llmChosenCode || mathTop1Score <= llmChosenScore) {
    out.push({ json: { ...j, _s70Audit: null } });
    continue;
  }

  const reasonRaw = String(rerank.primary_reason || "").trim();
  const orderRefRaw = String(j.order_id || j.orderId || j.commande_ref || "").trim();
  const orderRefSafe = /^[A-Za-z0-9_\-:]{1,64}$/.test(orderRefRaw) ? orderRefRaw : null;
  const execId = String($execution?.id || "").slice(0, 64) || null;

  const body = {
    profil_type: profilType,
    math_top1_code: mathTop1Code,
    math_top1_score: mathTop1Score,
    llm_chosen_code: llmChosenCode,
    llm_chosen_score: llmChosenScore,
    primary_reason: reasonRaw ? reasonRaw.slice(0, 512) : null,
    order_ref: orderRefSafe,
    n8n_execution_id: execId,
  };

  out.push({
    json: {
      ...j,
      _s70Audit: {
        url: $env.SITE_PREV_LLM_AUDIT_URL || "https://<SITE>/api/internal/prev-llm-audit",
        body,
      },
    },
  });
}
return out;
```

> Ajouter une variable d'environnement n8n `SITE_PREV_LLM_AUDIT_URL` pointant
> sur l'URL de production (ex. `https://tedwarehouseastro.example/api/internal/prev-llm-audit`).
> Sans cette variable, le code utilise un placeholder sans effet.

### 2.2 Node IF — `S70 Audit Required?`

Type : **IF**, condition unique :

- `{{ $json._s70Audit }}` **is not empty**

Branche `true` → `S71 POST Audit Callback`
Branche `false` → continue le pipeline normal (vers la suite).

### 2.3 Node HTTP Request — `S71 POST Audit Callback`

Type : **HTTP Request**.

| Champ | Valeur |
|------|-------|
| Method | `POST` |
| URL | `={{ $json._s70Audit.url }}` |
| Authentication | `None` |
| Send Headers | `On` |
| Header `x-site-webhook-secret` | `={{ $env.N8N_WEBHOOK_SECRET }}` |
| Header `content-type` | `application/json` |
| Send Body | `On` |
| Body Content Type | `JSON` |
| Specify Body | `Using JSON` |
| JSON Body | `={{ $json._s70Audit.body }}` |
| Options → Timeout | `5000` (5 s — non-bloquant) |
| Options → Continue On Fail | `On` (un audit raté ne doit JAMAIS casser la livraison du rapport) |

Connecter le retour de `S71` au reste du pipeline (même branche que la sortie
`false` du IF).

---

## 3. Smoke test après pose

### 3.1 Cas privé sans révocation (Madame Dupont)

```powershell
cd SITE
npx dotenv -e .env.local -- node scripts/prev-smoke-client-lambda.mjs
```

Attendu :

- Aucune ligne `prev_llm_audit_events` créée (pas de révocation).
- Aucune alerte Sentry.

### 3.2 Cas public avec révocation (bench Mandela 1990)

Lancer un cas du manifest avec `profil_type: "public"` connu pour déclencher
une révocation (ex. Mandela ou Lincoln).

Attendu :

- 1 ligne `prev_llm_audit_events` avec `profil_type = "public"`,
  `severity = warn` ou `error`.
- 0 alerte Sentry (le filtrage est sur `profil_type = "prive"`).

### 3.3 Cas privé avec révocation forcée (test négatif)

Injecter manuellement une commande `profil_type=prive` avec un cas
historiquement reranké (Mandela/Lincoln). Attendu :

- 1 ligne `prev_llm_audit_events` avec `profil_type = "prive"`.
- 1 alerte Sentry avec tag `kpi=prev_llm_audit`, niveau `warning` ou `error`.

---

## 4. Rollback

Désactiver les 3 nœuds (`S70`, `S70 IF`, `S71`) dans l'éditeur n8n. La
livraison du rapport reste intacte (le pipeline reprend après le `IF false`).

Au pire, mettre l'URL `SITE_PREV_LLM_AUDIT_URL` sur une valeur invalide :
grâce à `Continue On Fail = On`, le workflow continuera sans lever d'erreur.
