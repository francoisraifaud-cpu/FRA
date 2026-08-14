# BRIEFING — Refonte DHN → « Polaris maison » (Marr / Starkman)

> Statut : 🟢 ACTIF — cadrage V1 (amendé et validé 2026-08-14)
> Date : 2026-08-14
> Auteur session : Cursor + François
> Amendements V1 (validés) : (1) Sprint A = **test de falsification**, pas une démo ;
> (2) Sprint A **100 % local**, zéro serveur ; (3) **une seule** route neuve, calcul
> côté serveur en une passe ; (4) date d'événement exacte **obligatoire** (sinon
> événement exclu) ; (5) positionnement **atelier / Lab**, le DHN client reste l'étage 0.
> Lié à :
> - Doctrine : `FRA/BOOKS/Maar rectif`, `Maar 1`, `Maar 2` (Marr + Starkman)
> - Canvas : `canvases/dhn-polaris-maison-marr.canvas.tsx`
> - Bilans NO-GO : `FRA/DHN/BILAN-DP-RERANK-NIVEAU-A-2026-07-12.md`, `SPEC-ECLIPSE-MONDAINE-…`
> - API : `FRA/API SE/DOCUMENTATION-REFERENCE-API-ET-SERVEUR.md`, `JOURNAL-OPERATIONS.md`
> - Workflows : `DHN — PREPROD` (`Z9JgGaLoJhKNo8mB`) / `DHN — PROD` (`uA6jTzmayt2OXByY`)

---

## 0. Objet

Refondre le **workflow DHN** (préprod d’abord) pour intégrer une rectification de type
**Polaris** (lignée Marr → Starkman) : reverse-RAMC multi-événements en **Topocentric /
Naibod**, Dual Test, sortie **fenêtres + grade a–d**.

**Ce document ne autorise aucun déploiement.** Aucune ligne de code serveur ni PUT n8n
tant que le brief n’est pas validé explicitement (« OK code » / « OK sprint A »).

---

## 1. Promesse produit (nouvelle)

| Avant (DHN actuel) | Après (Polaris maison) |
|---|---|
| Questionnaire + arcs/prog/RS → **1 heure** | Étage 0 (Q) → fenêtres ; Étage 1 (Marr) → **clusters RAMC** |
| Confiance Faible/Moyenne/Forte | Grade Marr **a / b / c / d** + fenêtres alternatives |
| Placidus, scan 5 min | Topocentric pour le moteur Polaris ; Placidus **inchangé** pour le reste du parc |

Le B2C « bouton magique » peut rester un **étage 0 honnête** (signe + fenêtre) tant que
l’étage Polaris n’a pas passé ses gates bench. L’atelier Polaris = surface **préprod /
Lab** avant toute promesse client.

---

## 2. Contrainte ABSOLUE — non-régression API Hetzner

### 2.1 Fait opérationnel

- Serveur astro Hetzner : `46.225.174.155` — accès canonique **`https://api.spikka.eu`** (TLS).
- Auth : header **`X-API-Key`** (= `ASTRO_API_KEY` côté service), middleware dans `main.py`.
- Consommateurs : THEME / PREV / SYN / DHN / ESPACE CLIENT (prod **et** préprod) + scripts.
- Incident déjà vécu : patch additif sur `/western/planets` (cuspides) → crash workflows
  (journal 2026-04-21). **Règle API** : ne jamais casser le shape des routes existantes.

### 2.2 Interdits (bloquants)

1. **Modifier** le comportement ou le JSON de réponse des routes actuelles :
   `/western/planets`, `/batch/western/planets`, `/western/houses`, `/transits`, `/moon`,
   `/eclipses`, `/progressions`, `/progressions/eclipses`, `/directions/primary`,
   `/solar-return`, `/lunar-return`, `/health`, `/pdf/*`.
2. Réintroduire des items **sans** `planet` dans `output[]` de `/western/planets`.
3. Changer le défaut Placidus (`b"P"`) des routes existantes.
4. Déployer un `main.py` incomplet / divergé du live (cf. audit 2026-07 — endpoints manquants).
5. Exposer une **nouvelle** route sans la même chaîne de sécurité que l’existant
   (voir §3).
6. Expérimenter Polaris en **écrasant** le process unique qui sert toute la prod n8n
   sans filet (smoke + rollback documenté).

### 2.3 Seule stratégie autorisée pour le backoffice

| Option | Description | Statut |
|---|---|---|
| **A — UNE route neuve auto-suffisante** | `POST /rectification/reverse-ramc` : naissance + timeline → candidats RAMC + grades. Tout le calcul **côté serveur, en une passe**. | ✅ **Tranché (V1)** |
| **B — Paramètres opt-in** | Ex. `house_system` **absent** = comportement **bit-identique** actuel | 🟡 Repli si A insuffisant, tests d'égalité stricts exigés |
| **C — Patch in-place des routes** | Changer houses/DP « pour tout le monde » | ❌ Interdit |

Toute option B exige un **test de non-régression** : même payload historique → même
réponse (hash / diff JSON) sur un panel de fixtures THEME/PREV/SYN/DHN.

### 2.4 Amendement V1 — pourquoi UNE seule route (et pas trois)

1. **Budget d'appels.** Le DHN fait déjà **288 `/western/planets` + 288 `/western/houses`**
   par exécution. Un fan-out n8n « événements × cuspides × direct/converse × aspects »
   ferait exploser les timeouts. Le reverse-RAMC doit être une **boucle Python
   server-side**, pas une orchestration HTTP.
2. **Surface de sécurité.** 1 route = 1 audit 401/TLS, 1 entrée doc, 1 rollback.
3. **Non-régression.** Aucune route existante n'est touchée, même en lecture de schéma.

### 2.5 Primitives déjà présentes (à réutiliser, ne rien réinventer)

Vérifié dans `FRA/API SE/main.py` :

| Primitive | Où | Usage Polaris |
|---|---|---|
| `swe.houses_armc(ramc, lat, eps, hsys)` | `/progressions` (l. ~543) | **Cœur du reverse** : cuspides pour un RAMC donné, sans heure de naissance. `hsys` accepte `b"T"` (Polich/Page = Topocentric) |
| `swe.house_pos(armc, lat, eps, lonlat, hsys)` | `/directions/primary` frame `mundane` | Directions mundane (validé vs Morinus < 0,01°) |
| `_DP_NAIBOD = 0.985647` | `/directions/primary` | **Exactement** la clé Naibod de Marr (59′08,33″/an) |
| `_dp_eq`, `_dp_ad` | idem | RA/déclinaison, ascensional difference (OA/OD) |

Conséquence : le travail API est **plus petit** que le gap brut du §4 le suggère — mais
il reste réel (aspects mineurs, date exacte, boucle reverse, `hsys=T`).

---

## 3. Sécurité des nouvelles routes (iso existant)

Toute nouvelle route Polaris **doit** :

1. Passer par le **même gateway** `https://api.spikka.eu` (TLS — échanges chiffrés en transit).
2. Être couverte par le **même middleware** `api_key_guard` (`X-API-Key` obligatoire) —
   **pas** d’exception `/health`-like pour les routes de calcul.
3. Ne **jamais** être publiée en clair sur `:8000` / `:80` hors UFW (n8n + IP dev) —
   le canonique reste le domaine TLS.
4. Ne pas logger la clé API, ni les payloads complets de naissance en clair dans des
   canaux non maîtrisés (Sentry / journal public).
5. Être documentée dans `DOCUMENTATION-REFERENCE-API-ET-SERVEUR.md` + entrée
   `JOURNAL-OPERATIONS.md` **avant** consommation n8n.
6. Être branchée dans n8n **uniquement** via credentials / variables déjà utilisées pour
   les autres appels astro (même secret `X-API-Key`), jamais une clé « ouverte ».

> « Chiffré » ici = **TLS bout-en-bout client→gateway** + **authentification par clé**,
> comme les API actuelles. Pas de second protocole parallèle non authentifié.

Checklist sécu avant activation n8n :

- [ ] `curl` sans `X-API-Key` → **401**
- [ ] `curl` avec mauvaise clé → **401**
- [ ] `curl` HTTPS `api.spikka.eu` avec bonne clé → **200** + schéma attendu
- [ ] Accès IP direct public `:8000` toujours refusé / hors scope
- [ ] Aucune nouvelle entrée OpenAPI « publique » sans clé (même règle que le parc)

---

## 4. Écart doctrine Marr vs API actuelle (rappel)

| Besoin Polaris | API aujourd’hui |
|---|---|
| Maisons **Topocentric** | `/western/houses` = Placidus only |
| RAMC explicite | Non exposé sur houses |
| DP à **date d’événement exacte** | `/directions/primary` = `target_year` → 1er juillet midi |
| Aspects mineurs Marr (semi-carré, sesqui, semi-sextile, quinconce) | 5 majeurs seulement |
| Cuspides intermédiaires dirigées | Non |
| **Reverse RAMC** (cœur) | Absent |
| Dual Test / prenatal epoch | Absent |

Les helpers OA/AD/Naibod/dir·conv existent déjà dans `/directions/primary` — **réutilisables
en interne** pour de nouvelles routes, sans changer la route publique actuelle.

---

## 5. Architecture cible (3 étages)

```
[Site / webhook DHN préprod]
        │
        ▼
┌─────────────────────────┐
│ Étage 0 — Dégrossissage │  Q allégé → top-3 signes → fenêtres 2–4 h
│ (code DHN existant)     │  Routes API EXISTANTES uniquement
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ Étage 1 — Polaris Marr  │  Timeline events typés → reverse-RAMC Topocentric
│ (NOUVEAU, préprod)      │  Routes API NEUVES (§2.3 A)
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ Étage 2 — Preuve        │  Dual Test + grade a–d + (option) couches Spikka
│                         │  Jamais somme naïve de scores (NO-GO juillet)
└─────────────────────────┘
```

**Isolation n8n** : tout développement sur `DHN — PREPROD` uniquement. PROD inchangé
jusqu’à GO utilisateur + backup FRA (`n8n-export-prod-workflows.mjs`).

---

## 6. Plan de travail (sprints) — ordre imposé

### Sprint 0 — Cadrage (ce brief) ✅ en cours

- [x] Doctrine Marr lue (3 livres)
- [x] Gap API inventorié
- [ ] Validation utilisateur du brief (« OK on part sur ce cadre »)

### Sprint A — TEST DE FALSIFICATION (100 % local, zéro serveur) ⚠ amendement V1

> **C'est le sprint qui décide de tout.** Marr suppose un **jugement d'expert** sur le
> symbolisme (« a doubtful symbolism has been used » = grade d). Le bilan du 2026-07-12 a
> conclu qu'un **comptage automatique** de convergences ne sépare pas le vrai thème de ses
> voisins plausibles. Marr publie 300+ rectifications **qu'il a lui-même jugées** — aucune
> n'est une prédiction **en aveugle** contre une heure d'état civil connue.
> Sprint A doit donc **tenter de réfuter** la méthode automatisée, pas la mettre en scène.

Environnement : **local uniquement** (`pyswisseph 2.10.03` présent ; pas de `.se1` →
repli Moshier `FLG_MOSEPH`, suffisant face à des orbes de 2,5′–10′).
**Zéro** appel serveur Hetzner, **zéro** PUT n8n (même préprod).

1. Contrat **events Marr** : type → cuspides suitables (mariage, naissance, décès proche…),
   avec **date exacte obligatoire** (cf. amendement 4, §6bis).
2. **Golden test Lennon** : reproduire le cas du livre (RAMC cible **276°15,5′**) — c'est
   un test d'implémentation (la math est-elle juste ?), **pas** une preuve de méthode.
3. **Test de falsification (le vrai gate)** : reverse-RAMC **en aveugle** sur cas AA
   (heure d'état civil connue, jamais donnée au moteur) **avec leurres** — RAMC voisins
   et lointains. Question binaire : l'histogramme RAMC se concentre-t-il près du vrai
   RAMC **mieux que le hasard**, et de façon **reproductible hors échantillon** ?
4. **Si NON → STOP.** On n'entre pas en Sprint B. Coût total : quelques jours de script
   local, aucun risque prod. C'est le but.

### Sprint A bis — Exigence de précision des données ⚠ amendement V1

Marr chiffre l'orbe théorique optimal à **2,5′**, dégradé à **6′ (MC)** et **> 10′ (ASC)**
dès que les coordonnées sont des moyennes de grande ville. Nos entrées réelles sont
Nominatim (centroïde) + dates client approximatives.

Règles qui en découlent, **en dur** dans le contrat events :

- Date d'événement **exacte (jour) obligatoire** → sinon l'événement est **EXCLU** du
  reverse, **jamais** pondéré à la baisse (un événement flou déplace le pic, il ne le
  « dilue » pas proprement).
- Coordonnées : préférer coordonnées précises (arrondissement / maternité si connue) ;
  tracer l'incertitude de longitude en **minutes d'arc de RAMC** dans la sortie.
- Orbes Marr **durs** : ≤ 10′ conjonction/opposition, ≤ 5′ autres aspects retenus ;
  tout le reste **ignoré** (pas de score continu).

**Conséquence produit assumée (amendement 5)** : ces exigences sont incompatibles avec un
parcours B2C one-shot. Polaris = **atelier / Lab (pro)**. Le DHN client reste l'**étage 0**
honnête (signe + fenêtre + confiance) tant que le grade n'est pas ≥ b.

### Sprint B — API additif only (Hetzner, haute vigilance) — **conditionné au GO Sprint A**

0. **Pré-requis bloquant** : Sprint A a passé le test de falsification (§7).
1. Spec OpenAPI de **LA route neuve** `POST /rectification/reverse-ramc` (§2.3 option A).
2. Implémentation derrière le **même** `api_key_guard` + TLS.
3. Smoke **parc existant** (panel fixtures) : 0 diff sur routes anciennes.
4. Smoke **nouvelles** : 401 sans clé ; golden Lennon.
5. Entrée journal + doc référence.
6. Rollback documenté (`main.py.bak…` + restart service) **avant** branchement n8n.

### Sprint C — Moteur reverse-RAMC dans DHN préprod

1. Nœud(s) Code / HTTP sur `DHN — PREPROD` uniquement.
2. Consomme **uniquement** les routes neuves (+ routes stables existantes pour étage 0).
3. Bench 18–30 cas AA, split train/test ; gates chiffrés avant élargissement.

### Sprint D — Dual Test + UX sortie grade a–d

1. Filet anti-hasard Marr.
2. Rapport HTML : clusters + grades ; pas de minute affichée si grade ≤ c.
3. GO utilisateur → miroir FRA → seulement alors discussion PROD.

---

## 7. Gates GO / NO-GO (produit + technique)

### Technique (API)

| Gate | Critère |
|---|---|
| NO-GO | Toute diff non nulle sur fixtures des routes existantes |
| NO-GO | Nouvelle route joignable sans `X-API-Key` ou hors TLS canonique |
| GO Sprint B | 401 sans clé + golden Lennon + smoke parc vert |

### Sprint A — falsification (gate bloquant, amendement V1)

| Gate | Critère |
|---|---|
| **Implémentation** | Golden Lennon : RAMC retrouvé ≈ **276°15,5′** (tolérance à fixer, ordre de grandeur ±2′) |
| **GO Sprint B** | En aveugle sur cas AA + leurres : concentration du pic RAMC près du vrai RAMC **> hasard**, **reproductible hors échantillon** |
| **NO-GO ferme** | Pic au niveau du hasard sur **leurres adjacents** (= le régime qui compte, déjà fatal en juillet) → arrêt du chantier, aucun travail serveur |
| **NO-GO** | Résultat obtenu seulement après réglage de poids sur les mêmes cas (= sur-apprentissage) |

### Produit (moteur Polaris)

| Gate | Critère |
|---|---|
| NO-GO | Réintroduire DP comme **arbitre de signe** ou **somme** de couches (déjà réfuté) |
| NO-GO | Promettre ±10 min sans grade **a** |
| NO-GO | Accepter un événement à **date approximative** dans le reverse (§Sprint A bis) |
| GO Sprint C | Métrique RAMC / fenêtre hors échantillon ≥ seuil fixé en fin de Sprint A |
| GO Sprint D | Grade calibré (pas de « Forte » sur faux cluster) |

Les seuils chiffrés exacts du Sprint C sont **fixés après** le golden Lennon + panel AA
(éviter de sur-promettre avant mesure).

---

## 8. Périmètre n8n / site (couplage)

| Objet | Action |
|---|---|
| `DHN — PREPROD` | Seul workflow modifié pendant le chantier |
| `DHN — PROD` | **Gel** jusqu’à GO |
| THEME / PREV / SYN / ESPACE CLIENT | **Aucun** changement requis pour Polaris ; ne doivent **pas** appeler les routes neuves par erreur |
| Site checkout DHN | Plus tard : UX atelier / timeline ; hors Sprint A–B |
| Backup FRA | Obligatoire après tout PUT préprod structurant et après tout deploy API |

Scan d’impact avant branchement : greper l’instance n8n pour s’assurer qu’**aucune**
autre workflow n’appelle les nouveaux chemins (MCP `search_workflows` / dump).

---

## 9. Risques & mitigations

| Risque | Mitigation |
|---|---|
| Régression THEME/PREV/SYN | Routes neuves only + smoke fixtures + pas de changement de défaut |
| Deploy API qui casse le process | Backup `main.py` daté, restart contrôlé, smoke immédiat, rollback écrit |
| Sur-apprentissage n=8 | JDD AA élargi + split ; golden livre ≠ bench marketing |
| Confusion « on a déjà DP » | Documenter : DP actuelle ≠ reverse-RAMC Marr |
| Fuite de clé / route ouverte | Même middleware ; test 401 obligatoire ; pas d’exception path |

---

## 10. Décisions à trancher (utilisateur)

Tranché en V1 (2026-08-14) :

1. ~~Noms des routes~~ → **`POST /rectification/reverse-ramc`**, route unique.
2. ~~Option A vs B~~ → **Option A** (route neuve auto-suffisante), B en repli seulement.
3. ~~Surface produit V1~~ → **Lab / atelier**, pas de promesse B2C avant grade ≥ b.

Restant à trancher, mais **seulement si Sprint A passe** :

4. Qui opère le deploy Hetzner (François / runbook) et fenêtre horaire ?
5. Seuils chiffrés définitifs du Sprint C (fixés à la lumière des mesures Sprint A).

---

## 11. Prochaine action demandée

**Cadre V1 validé par l'utilisateur le 2026-08-14** (5 amendements + route unique).

En cours : **Sprint A** — implémentation locale du reverse-RAMC, golden Lennon, puis test
de falisification en aveugle sur cas AA + leurres.

Rappel des verrous encore actifs :

- **Aucun** deploy Hetzner, **aucun** PUT n8n (même préprod) pendant le Sprint A.
- Sprint B ouvert **uniquement** si le gate de falsification §7 est franchi.
- Sans GO explicite : **aucun** commit serveur, **aucun** call MCP d'update workflow.

---

## 12. Références express

- Marr, *Prediction II — Directions and the Art of Rectification* (1985) — méthode Lennon / reverse RAMC.
- Marr, *Notable Nativities* I (1990) & II + Starkman (1995) — Dual Test, orbes 10′/5′, grades a–d.
- `FRA/API SE/main.py` — `api_key_guard`, `swe.houses(..., b"P")`, `/directions/primary`.
- `.cursor/rules/n8n-isolation-preprod-prod.mdc`, `prod-deploy-github-backup.mdc`.
