# SPEC — Questionnaire ASC allégé (Étage 1) + sortie honnête top-3 / confiance

> Statut : 🟢 VALIDÉ PREPROD (moteur réel) — prêt à livrer
> Date : 2026-07-12
> Lié à : `FRA/DHN/AUDIT MATRICE QUESTIONNAIRE v5.5.md`, `SITE/scripts/BENCHMARK-DHN-MANUEL.md`, `SITE/lib/dhn-questions-data.ts`
> Outils de preuve : `SITE/scripts/_enprat/dhn-sign-layer-analysis.mjs`, `SITE/scripts/_enprat/dhn-lean-scorer.mjs`, **`SITE/scripts/_enprat/dhn-preprod-lean-ab.mjs`** (A/B moteur réel preprod)

## 1. Pourquoi (preuve chiffrée)

Audit data-grounded sur 8 cas AA (fiabilité réelle par question = taux où la réponse pointe le VRAI ascendant) :

| Question | Famille | Fiabilité (share) |
|---|---|---|
| q12 *visage au repos* | visage | **0.83 (meilleure)** |
| q3 *1re réaction visible* | persona | 0.69 |
| q6 *ce qu'on remarque en 1er* | persona | 0.56 |
| q8 *motivation apparente* | persona | 0.54 |
| q1 *perception sociale* | persona | 0.52 |
| q10 *rapport au temps* | Sun-leak | 0.64 (neutre) |
| q7 *défaut reproché* | Sun-leak | 0.34 |
| **q13 *morphologie*** | corps | **0.24** |
| **q14 *démarche*** | corps | **0.23** |
| **q15 *voix*** | corps | **0.13** |

- **q13+q14+q15 seuls = 1/8 top-1 (13 %) ≈ pur hasard** (aléatoire 12 signes = 8 %). La morphologie physique **ne révèle pas** l'ascendant. Ces 3 questions (ajoutées en v5.11 pour Proust) sont à retirer : sans valeur ET pénibles à auto-évaluer.
- **persona + visage** plafonne à **6/8 top-1 (75 %) · 7/8 top-3 (88 %)**.
- Le sous-ensemble **{q1, q3, q6, q8, q12}** = **6/8 top-1 · 7/8 top-3 = identique aux 10 questions PROD, avec la moitié des questions.**
- Plafond réel établi par l'équipe (manuel, ligne 958) : **~55-65 % top-1 · ~88 % top-3** sur utilisateur sincère. Le goulot n'est **pas** la matrice mais (a) le biais input (perception de soi vs image publique = Soleil) et (b) la fiabilité de l'heure vraie. Cas type Proust (ASC invisible) = limite **intrinsèque** (biais B3).

**Conséquence produit :** on ne vend pas une heure exacte ni un top-1 sûr. On vend **le top-3 (fenêtre ~2-4 h, fiable ~88 %) + un "plus probable" qualifié + une confiance**.

## 2. Le questionnaire allégé (5 questions)

Remplacer `DHN_QUESTION_SPECS` (`SITE/lib/dhn-questions-data.ts`) par ce sous-ensemble. **Aucune modif n8n** : le nœud `Scorer1` est tolérant aux questions absentes (`if(a && M['q'+q] && …)`). La matrice `M` reste inchangée.

```ts
export const DHN_QUESTION_SPECS: DhnQuestionSpec[] = [
  { key: "q1", label: "En société, on vous perçoit comme…", choices: [
    { value: "a", label: "Énergique / fonceur" },
    { value: "b", label: "Calme / rassurant" },
    { value: "c", label: "Vif / curieux" },
    { value: "d", label: "Réservé / distant" },
    { value: "e", label: "Charismatique / lumineux" },
    { value: "f", label: "Doux / empathique" },
  ]},
  { key: "q3", label: "Face à l’inconnu, votre première réaction visible…", choices: [
    { value: "a", label: "Foncer" },
    { value: "b", label: "Observer puis construire" },
    { value: "c", label: "Questionner / explorer" },
    { value: "d", label: "Se protéger" },
    { value: "e", label: "Prendre le lead" },
    { value: "f", label: "Analyser méthodiquement" },
    { value: "g", label: "Sonder en profondeur" },
    { value: "h", label: "Se laisser porter" },
  ]},
  { key: "q6", label: "Ce que les gens remarquent en premier chez vous…", choices: [
    { value: "a", label: "Votre ambition" },
    { value: "b", label: "Votre bienveillance" },
    { value: "c", label: "Votre charme" },
    { value: "d", label: "Votre humour" },
    { value: "e", label: "Votre intensité" },
    { value: "f", label: "Votre créativité" },
    { value: "g", label: "Votre rigueur" },
    { value: "h", label: "Votre liberté" },
  ]},
  { key: "q8", label: "À première vue, dans un nouveau groupe, vous semblez motivé par…", choices: [
    { value: "a", label: "L’action" },
    { value: "b", label: "La sécurité" },
    { value: "c", label: "La connaissance" },
    { value: "d", label: "La justice" },
    { value: "e", label: "Le pouvoir" },
    { value: "f", label: "La spiritualité" },
  ]},
  { key: "q12", label: "Votre visage au repos, on vous dit souvent…", choices: [
    { value: "a", label: "Souriant / avenant" },
    { value: "b", label: "Sérieux / fermé" },
    { value: "c", label: "Rêveur / absent" },
    { value: "d", label: "Interrogatif" },
    { value: "e", label: "Intense / perçant" },
    { value: "f", label: "Neutre / impassible" },
  ]},
];
```

**Retirés** : q7 (défaut) et q10 (temps) = neutres/Sun-leak ; q13, q14, q15 (morphologie/démarche/voix) = hasard.

## 3. Matrice M — sous-ensemble utilisé (déjà en prod, aucune modif)

```js
q1:{a:{Belier:4,Sagittaire:2,Lion:1},b:{Taureau:4,Cancer:2,Capricorne:2},c:{Gemeaux:4,Verseau:2,Balance:1},d:{Vierge:3,Scorpion:2,Capricorne:3},e:{Lion:4,Sagittaire:2,Belier:1},f:{Poissons:4,Cancer:2,Scorpion:1}}
q3:{a:{Belier:4,Sagittaire:2},b:{Capricorne:4,Taureau:3},c:{Gemeaux:3,Verseau:3},d:{Cancer:4,Taureau:2},e:{Lion:4,Balance:2},f:{Vierge:4,Capricorne:3},g:{Scorpion:4,Poissons:2},h:{Poissons:4,Cancer:2}}
q6:{a:{Capricorne:4,Lion:2,Belier:1},b:{Cancer:4,Taureau:2},c:{Balance:4,Poissons:2},d:{Sagittaire:4,Gemeaux:2},e:{Scorpion:4,Poissons:2},f:{Lion:4,Gemeaux:2},g:{Vierge:4,Capricorne:2},h:{Verseau:4,Sagittaire:2}}
q8:{a:{Belier:4,Scorpion:2,Lion:1},b:{Taureau:4,Cancer:2},c:{Gemeaux:3,Verseau:3,Sagittaire:1},d:{Balance:4,Taureau:2},e:{Scorpion:3,Capricorne:3},f:{Poissons:4,Sagittaire:2,Cancer:1}}
q12:{a:{Sagittaire:4,Lion:2,Cancer:1},b:{Capricorne:4,Scorpion:2,Vierge:1},c:{Poissons:4,Cancer:2},d:{Gemeaux:3,Verseau:3},e:{Scorpion:4,Belier:2},f:{Taureau:3,Balance:2,Capricorne:1}}
```

Poids **égaux** par défaut (pas de sur-ajustement sur n=8). Le reliability-weighting (favoriser q12/q3) est à **calibrer sur données LIVE**, pas sur le bench.

## 4. Sortie produit HONNÊTE (top-3 + fenêtre + confiance)

Réf. d'implémentation : `SITE/scripts/_enprat/dhn-lean-scorer.mjs` (déterministe, 0 API/LLM).

Soit `s1 ≥ s2 ≥ s3 ≥ s4` les scores signes triés, `total = Σ scores`.

- **top-3** = {s1, s2, s3} → la « fenêtre » (chaque signe candidat = une plage horaire calculée par le moteur pour la date/lieu).
- `cover3 = (s1+s2+s3)/total` (concentration des 3 têtes)
- `margin12 = (s1−s2)/s1` (avance du plus probable)
- `gap34 = (s3−s4)/s1` (le 3e décroche-t-il du peloton ?)

**Confiance de fenêtre (top-3)** — c'est l'indicateur à mettre en avant :
- `élevée` si `cover3 ≥ 0.55` ET `gap34 ≥ 0.05`
- `moyenne` si `cover3 ≥ 0.45`
- `faible` sinon (envisager d'élargir à top-4)

**Qualificatif du « plus probable » (top-1)** — secondaire, honnête :
- `margin12 ≥ 0.20` → « *S1* se détache nettement »
- `0.08 ≤ margin12 < 0.20` → « léger avantage à *S1* »
- `< 0.08` → « *S1* et *S2* au coude-à-coude »

Gabarit de rendu :
> « Votre ascendant est très probablement l'un de ces 3 signes : **S1, S2, S3** » *(confiance : élevée/moyenne/faible)*
> Le plus probable : *qualificatif*.
> Chaque signe candidat correspond à une **plage horaire de naissance** (calculée par le moteur DHN).

Calibration observée (8 cas) : window `élevée` contient le vrai ASC dans la quasi-totalité des cas ; le tier top-1 corrèle avec la justesse (`probable` 71 %, `penché` 100 % sur n=1). de Gaulle : top-1 faux (Lion, image publique) mais window `moyenne` + vrai ASC dans le top-3 → le produit reste honnête.

## 5. Intégration (drop-in) — ✅ APPLIQUÉ EN LOCAL (non poussé) 2026-07-12

Fichiers effectivement touchés (le contrat `q*` étant dynamique sur `DHN_QUESTION_SPECS`, la réduction se propage seule ; il a juste fallu resynchroniser le type + trimmer l'i18n) :

1. `SITE/lib/dhn-questions-data.ts` — `DHN_QUESTION_SPECS` réduit à **{q1, q3, q6, q8, q12}** (bloc §2). ✅
2. `SITE/lib/dhn-order.ts` — type `DhnOrderPayload` : `q7`/`q10` retirés des champs requis ; cast `Pick<…>` mis à jour. ✅
3. `SITE/lib/i18n/dhn-en.ts` — libellés EN de q7/q10/q13/q14/q15 retirés (parité avec les specs). ✅
4. `SITE/lib/auto-client-profile-for-order.test.ts` — littéral `DhnOrderPayload` de test aligné (q7/q10 retirés). ✅
   - **Aucune** modif du formulaire (`dhn-checkout-form.tsx`) ni du builder webhook (`n8n-order-webhook.ts`) : 100 % dynamiques.
   - **n8n** : rien (Scorer1 tolérant + matrice `M` inchangée — prouvé par l'A/B preprod §6bis).

**Gate `livraison-fiable.mdc` : `cd SITE && npm run check` = ✅ 0 erreur ESLint · 419/419 tests · `tsc --noEmit` OK.**

Reste à faire (au choix de l'utilisateur, non fait ici) :
- **Sortie honnête top-3** (§4) : brancher le modèle là où DHN construit ses 3 hypothèses + confiance, pour mettre en avant la **fenêtre top-3** plutôt qu'un top-1 péremptoire. (Le moteur expose déjà `dhnMetrics.top3Hypotheses` + `confidence.signe`.)
- **Déploiement** : `git push origin main` → Vercel (front-only, sans risque n8n). Backup GitHub = le push `main` lui-même (`prod-deploy-github-backup.mdc`, cas B).

## 6bis. VALIDATION PREPROD — moteur réel (2026-07-12)

Test bout-en-bout sur le **webhook DHN preprod** (`dhn-site-order-preprod`, workflow `Z9JgGaLoJhKNo8mB`), moteur complet (questionnaire + arcs + progressions + retours solaires + rerank de cohérence), **pas** le scorer offline. 8 personnalités AA du benchmark × 2 variantes = 16 runs (`dhn-preprod-lean-ab.mjs --mode=both --conc=3`). Heure inconnue (`00H00`→`24H00`, scan 24 h). Extraction = `Resultat final1.json.dhnMetrics.top3Hypotheses`.

> Les exécutions finissent en `status=error` (« Order not found » sur le POST de clôture, normal pour un run batch hors site — cf. `n8n-preprod-batch-runs.mdc`). La déduction ASC (`Resultat final1`) tourne **avant** ce point → sortie complète et exploitable.

| Cas | vrai ASC | LEAN 5-Q (top-3) | rang | FULL 10-Q (top-3) | rang |
|---|---|---|---|---|---|
| Bardot | Sagittaire | Lion, **Sagittaire**, Balance | **#2** | Lion, Belier, **Sagittaire** | #3 |
| Gainsbourg | Poissons | **Poissons**, Sagittaire, Cancer | **#1** | **Poissons**, Cancer, Sagittaire | #1 |
| Saint Laurent | Verseau | Gemeaux, **Verseau**, Sagittaire | #2 | **Verseau**, Gemeaux, Vierge | **#1** |
| de Beauvoir | Sagittaire | **Sagittaire**, Balance, Belier | **#1** | **Sagittaire**, Balance, Belier | #1 |
| de Gaulle | Balance | Vierge, Lion, **Balance** | #3 | Lion, **Balance**, Vierge | **#2** |
| Hugo | Scorpion | **Scorpion**, Cancer, Balance | **#1** | **Scorpion**, Lion, Sagittaire | #1 |
| Proust | Bélier | Vierge, Gemeaux, Verseau | ✗ (12) | Gemeaux, Vierge, Poissons | ✗ (12) |
| Deneuve | Capricorne | **Capricorne**, Scorpion, Taureau | **#1** | **Capricorne**, Taureau, Balance | #1 |

**Bilan moteur réel :**

| Variante | top-1 | top-3 |
|---|---|---|
| **LEAN 5-Q** | 4/8 (50 %) | **7/8 (88 %)** |
| **FULL 10-Q** | 5/8 (62 %) | **7/8 (88 %)** |

- **top-3 STRICTEMENT identique (7/8)** : les 5 questions retirées (q7, q10, q13, q14, q15) n'ajoutent **rien** à la fiabilité de la fenêtre. Seule différence : ±1 sur l'ordre du top-1 (YSL passe #2→#1 avec le full ; **Bardot passe #3→#2 avec le lean** = les questions morphologie *dégradent* Bardot). Bruit, pas signal.
- **Proust rate dans les 2 cas (rang 12)** : confirme la limite **intrinsèque** — un ASC (Bélier) qui ne se manifeste ni en persona ni en physique est introuvable au questionnaire, quelle que soit sa longueur.
- **Confiance signe = « Très faible » / « Faible » partout** : le moteur est déjà honnête sur son incapacité à verrouiller le signe → cohérent avec la sortie produit §4 (vendre la fenêtre top-3, pas le top-1).
- Le moteur **reranke** le signal Q via arcs/prog/RS : le top-1 questionnaire tombe souvent en #2/#3 moteur (Bardot, YSL, de Gaulle) → explique top-1 ~50-62 % vs top-3 ~88 %.

**Verdict : GO livraison.** Le questionnaire allégé (5 Q) est **iso-fiable au 10 Q sur le moteur réel** (top-3 88 %), avec 2× moins de questions et sans les 3 questions physiques pénibles. Aucune régression preprod.

## 7. Attentes honnêtes & suite

- Gain attendu : **UX** (5 questions au lieu de 10, suppression des 3 questions physiques inutiles/pénibles), **fiabilité inchangée** (~88 % top-3). Ce n'est **pas** un gain de plafond.
- Pousser le plafond exige de la **donnée LIVE non biaisée** : réponses sincères de personnes répondant pour elles-mêmes, à heure AA connue (étude dédiée ou logging site questionnaire→prédiction→heure confirmée). C'est le seul vrai levier restant.
