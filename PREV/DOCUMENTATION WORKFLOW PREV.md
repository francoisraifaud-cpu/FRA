
# DOCUMENTATION WORKFLOW — PRÉVISIONS (PREV)

**Version courante** : moteur **MDSE legacy + DTC v18** (scoring prévisionnel, gelé) — narration **Gemini 3.1 Pro** — rapport technique **heatmap V4** — voir **Partie II (§§ 27–35)**.
**Plateforme** : n8n Cloud — workflow **PREV — PROD** (`szL522DJiXkppyt1`, actif), préprod **`jKwmxAm3HvjpHC5U`**
**Auteur** : François Raifaud

> **Doc rafraîchie 2026-07-07** : reconstruction du **socle structurel** (§§ 1–10 ci-dessous). Ce socle avait disparu du fichier, qui ne conservait plus que l'annexe moteur/bench DTC (§§ 27–35, désormais regroupée en « **Partie II** »). Socle recalé sur les **94 nœuds PROD réels**. **Source de vérité = workflow live n8n** ; le moteur `Super noeud1` correspond au fichier `FRA/PREV/N8N Prev` (MDSE + bloc DTC injecté). Snapshot canonique : `FRA/_workflow-backups-prod/2026-07-07/PREV-PROD.json` (branche `backup/workflows-prod-2026-07-07`), régénérable via `SITE/scripts/n8n-export-prod-workflows.mjs`.

> **⚠ Preprod ≠ iso PROD — run batch depuis Cursor** : un run lancé en **batch depuis Cursor** (POST webhook preprod, hors site) finit en `status=error` / `finished=false` (~40-60 s) car **aucun ID (order/Stripe/client) n'est mappé** — c'est **NORMAL, pas un bug**. Les nœuds moteur (calculs + `Super noeud1` → heatmap + prompts) s'exécutent **AVANT** l'erreur → leur sortie est dans `resultData.runData`. LLM **souvent coupés** en preprod (tests gratuits) ; bout-en-bout incluant les LLM = **PROD**. Détail gravé : `.cursor/rules/n8n-preprod-batch-runs.mdc`.

---

# PARTIE I — ARCHITECTURE DU WORKFLOW

## 1. VUE D'ENSEMBLE

Le workflow **PREV** produit les **prévisions astrologiques** d'une personne sur une période : calcul du thème natal + transits, progressions, éclipses, Lune et cycle Saros ; puis un moteur de scoring (**MDSE + DTC v18**) classe les **signatures événementielles** (mariage, carrière, etc.) ; un LLM les interprète maison par maison ; enfin génération de 3 rapports HTML/PDF et livraison site/email.

### Architecture des nœuds (PROD — 94 nœuds, snapshot 2026-07-07)

| Couche | Nœuds n8n | Rôle |
|---|---|---|
| **Entrée** | `Webhook`, `Gmail Trigger1`, `Get Full Message`, `Extract Variables` | Double déclencheur (commande site OU email) → extraction des variables (personne, période, langue) |
| **Géocodage / fuseau** | `1. Géocodage2`, `IF - Ville trouvée ?1`, `Extraction Coordonnées1`, `Gestion Erreur (Ville introuvable)1`, `1b. Prepare Timezone1`, `2. Préparation dynamique1` | Ville → coordonnées + fuseau + préparation des paramètres de calcul |
| **API natal + transits** | `3a. Calcul Planètes1`, `3b. Calcul Maisons`, `3c. Étoiles Fixes`, `Download Transits `, `Download Transits Progressés`, `Download Eclipses 1`, `Download Eclipses 2`, `Download Eclipses Progressées`, `Download Lune `, `Extract Transits1`, `Extract Transits Progressés`, `Extract Eclipses1`, `Extract Eclipses Progressées`, `Extract Lune1`, `Saros Enrichment`, `Enrichissement Astrologique`, `Merge 4 fichiers` (×5), `Merge8`, `Wait 2s1` | API Swiss Eph : natal, transits (+ progressés), éclipses (+ progressées), Lune, enrichissement Saros, puis fusion/enrichissement |
| **Moteur** | `Super noeud1` | **NŒUD CENTRAL** — MDSE legacy + DTC v18 inline : 19 signatures MDSE → rerank DTC sur 14 codes → Top-5 (détail Partie II) |
| **LLM interprétation** | `Maison 1`–`Maison 12`, `Synthèse` (+ modèles `Google Gemini Chat Model*`), `Merge`/`Merge1`/`Merge2`/`Merge3` | 12 agents Gemini 3.1 Pro (une par maison) + synthèse |
| **Récit / vulgarisation** | `1. Découpage Prévisions`, `2. Traducteur Prévisions` (+ `Google Gemini Chat Model16`) | Vulgarisation — inclut le garde-fou **POLARITÉ NODALE** (§5) |
| **Rapports HTML** | `Générateur HTML Prévisions3` (final), `Rapport Technique HTML v1` (+ **heatmap V4**), `Analyseur Technique v`, `Rapport HTML Sécurisé2`, `Prépare HTML → PDF` | Génération des rapports HTML |
| **Export PDF** | `Contrôle Données Prévisions`, `Convert HTML to PDF`/`PDF2`/`Convert HTML → PDF`, `Fix Nom & MIME PDF final`/`final2`/`Prévisions`, `Upload Google Drive3`/`4`/`Upload Drive PDF Prévisions`, `Merge PDF`, `Merge 4 fichiers1`–`4` | Conversion Gotenberg HTML→PDF + nommage + archivage Google Drive |
| **Livraison site & email** | `Prépare email 3 PDF`, `Envoi Email avec PDF1`, `PREV SITE 3 PDF tiers`, `PREV PUT Blob PDF`, `PREV merge Blob URL + meta`, `PREV POST site status`, `PREV POST delivered_email`, `Merge9` | Upload des 3 PDF vers Vercel Blob + callbacks statut/livraison au site + email (§9) |
| **Logs** | `Prev Logs` | Journalisation silencieuse (JSON dans les logs n8n) |

> ⚠️ Source de vérité = live n8n. Le moteur (`Super noeud1`) = fichier `FRA/PREV/N8N Prev`. Voir **Partie II §§ 27–29** pour l'architecture 3 couches et le pipeline de déploiement DTC.

## 2. PIPELINE D'ENRICHISSEMENT ASTRONOMIQUE

Calculé via le serveur privé Swiss Eph (voir doc `FRA/API SE`) puis recombiné par les nœuds `Merge 4 fichiers*` / `Merge8` avant l'entrée moteur :
- **Natal** : planètes (`3a. Calcul Planètes1`), maisons (`3b. Calcul Maisons`), étoiles fixes (`3c. Étoiles Fixes`)
- **Transits** de la période + **transits progressés**
- **Éclipses** de la période + **éclipses progressées**, avec enrichissement **Saros** (`Saros Enrichment`)
- **Lune** (`Download Lune`)
- `Enrichissement Astrologique` : dignités, configurations, modulations (socle harmonisé THEME/SYN)

## 3. MOTEUR DE SCORING (`Super noeud1`)

Le `Super noeud1` (fichier `FRA/PREV/N8N Prev`, >29 000 lignes) superpose 3 couches :
1. **MDSE legacy** — génère 19 signatures événementielles (scoring additif historique).
2. **DTC v18 inline** — intercepte le `sigPayload`, filtre 5 codes legacy, **rerank** 14 codes par score doctrinal, re-trie → **Top-5**.
3. **Post-DTC** — préparation du payload LLM (Top-5, dates, `principalDate ★`).

> Détail complet (doctrine, déploiement ISO, KPI release baseline 150) : **Partie II §§ 27–31**. Matière première (manifests, méthodologie) : **§§ 32–33**.

## 4. LLM INTERPRÉTATION

- **12 agents `Maison 1`–`Maison 12`** + **`Synthèse`**, chacun relié à un modèle `Google Gemini Chat Model*`.
- Modèle : **`models/gemini-3.1-pro-preview`**.
- Chaque agent reçoit les signatures Top-5 pertinentes + le contexte natal/transit ; recombinaison via `Merge`/`Merge1`/`Merge2`/`Merge3`.

## 5. RÉCIT / VULGARISATION — garde-fou POLARITÉ NODALE

Pipeline : `1. Découpage Prévisions` → `2. Traducteur Prévisions` (agent Gemini `Google Gemini Chat Model16`).

Le `systemMessage` du traducteur inclut le garde-fou **POLARITÉ NODALE** (harmonisé SYN/PREV/THEME, déployé live via `SITE/scripts/deploy-nodal-guardrail.mjs`, marqueur `POLARITÉ NODALE`, backup avant PUT) :

> **POLARITÉ NODALE (anti-inversion)** : n'intervertis JAMAIS le Nœud Nord et le Nœud Sud, ni les planètes qui leur sont associées. Nœud Nord = avenir / évolution ; Nœud Sud = passé / acquis. Si la source apparie une planète à un nœud précis, conserve STRICTEMENT cet appariement et sa polarité — jamais l'inverse.

Présence **vérifiée dans le snapshot PROD 2026-07-07** (`2. Traducteur Prévisions`, `systemMessage`).

## 6. VALIDATION / LOGS (`Prev Logs`)

PREV journalise via le nœud `Prev Logs` (sortie silencieuse dans les logs n8n). Contrairement à SYN (validateur `SYN Valideur` v4.2 déterministe), PREV **ne dispose pas encore** d'un validateur post-LLM équivalent ; l'anti-inversion nodale agit au niveau du prompt (§5). *Piste d'harmonisation future : porter un `nodal_polarity_error` déterministe vers PREV.*

## 7. RAPPORTS HTML (dont heatmap V4)

Trois rapports HTML :
- **Rapport final** (`Générateur HTML Prévisions3`) — client, texte vulgarisé.
- **Rapport technique** (`Rapport Technique HTML v1`) — inclut la **heatmap V4** (intensité des périodes) + `Analyseur Technique v`.
- **Rapport sécurisé** (`Rapport HTML Sécurisé2`).

## 8. EXPORT PDF

Chaîne Gotenberg : `Contrôle Données Prévisions` → `Prépare HTML → PDF` → `Convert HTML → PDF` (Gotenberg) → `Fix Nom & MIME PDF Prévisions` → `Upload Drive PDF Prévisions` (+ chaînes parallèles `Convert HTML to PDF`/`PDF2` pour les variantes de rapport).

## 9. LIVRAISON SITE & EMAIL

| Nœud | Rôle / endpoint |
|---|---|
| `Prépare email 3 PDF` + `Envoi Email avec PDF1` | Email client (3 PDF) |
| `PREV SITE 3 PDF tiers` | Liste des 3 PDF + métadonnées commande |
| `PREV PUT Blob PDF` | Upload vers **Vercel Blob** (`https://blob.vercel-storage.com/prev/<orderId>/…`) |
| `PREV merge Blob URL + meta` | Fusionne URLs Blob + métadonnées |
| `PREV POST site status` / `PREV POST delivered_email` | Callbacks → `https://site-rapports-astro.vercel.app/api/webhooks/n8n-order-status` |

> Les commandes par email (`Gmail Trigger1`) reçoivent les PDF directement, sans publication Blob.

## 10. PARAMÈTRES

| Paramètre | Description |
|---|---|
| `personne` | prénom, nom, date, heure, lieu, pays, genre, consigne_redaction |
| période / fenêtre de prévision | intervalle analysé |
| `langue` | Français / English |

---

# PARTIE II — MOTEUR DTC, BENCH & MANIFESTS

> Sections **§§ 27–35** : moteur de scoring (MDSE + DTC v18), méthodologie ISO, KPI release baseline 150 PREPROD, matière première (manifests). **Conservées telles quelles** (référence R&D moteur) — source d'autorité sur le scoring. La numérotation reprend à 27 pour continuité historique (les §§ 11–26 d'origine ne sont pas conservées).

## 27. CHANGELOG — PHASE DTC v18 (Mai 2026) — Doctrine Topique Compositionnelle

### 27.1 Origine et Objectif
Le moteur MDSE (Moteur de Signatures Événementielles) historique a atteint ses limites (M5 plafonnant autour de 70%, beaucoup de faux positifs, logique additive simple). La **DTC v18** (Doctrine Topique Compositionnelle) est un nouveau moteur de scoring prévisionnel développé en local (`SITE/scripts/dtc/poc-dtc-local.mjs`) qui remplace le scoring MDSE pour 14 des 19 signatures événementielles.

L'objectif est d'atteindre une précision clinique sur le Top-1 (M1) et le Top-5 (M5) en utilisant des règles doctrinales strictes (convergences, profections, firdaria, aspects exacts).

### 27.2 Architecture du "Bouchon" (Adapter)
Pour éviter de réécrire l'intégralité du `Super noeud1` (qui fait plus de 12 000 lignes et gère l'extraction des données astronomiques), une architecture en "bouchon" (adapter) a été mise en place.

1. **Moteur Local (`poc-dtc-local.mjs`)** : C'est la source canonique de la doctrine. Tout le code de scoring est encapsulé entre les balises `// __DTC_INLINE_BEGIN__` et `// __DTC_INLINE_END__`.
2. **Script de Synchronisation (`dtc-sync-to-supernode.mjs`)** : Ce script extrait le bloc de code DTC du fichier local et l'injecte automatiquement dans le fichier source du nœud n8n (`FRA/PREV/N8N Prev`), juste avant le tri final de `sigPayload`.
3. **Exécution ISO (LOCAL <-> PREPROD)** :
   - Le moteur MDSE historique continue de tourner en amont pour générer les 19 signatures de base.
   - Le bloc DTC injecté intercepte le `sigPayload` généré par le MDSE.
   - **Filtrage Legacy** : Le bloc DTC supprime explicitement 5 codes "legacy" du MDSE qui ne sont pas gérés par la DTC (`SANTE_UP`, `SPIRITUEL`, `JURIDIQUE_UP`, `VOYAGE`, `CYCLE_INTEGRATION`). Ces codes sont stockés dans `_dtcDroppedLegacyCodes` pour traçabilité.
   - **Reranking** : Pour les 14 codes restants, la confiance (`confidence`) calculée par le MDSE est écrasée par le score calculé par la DTC.
   - Le tableau est ensuite re-trié selon les nouveaux scores DTC. Le LLM en aval ne reçoit donc que le Top 5 issu de la DTC pure.

### 27.3 Pipeline de Déploiement Automatisé
Pour éviter toute divergence entre le code local (où les tests sont effectués) et la PREPROD n8n, un pipeline automatisé a été mis en place via la commande :

```bash
npm run dtc:deploy
```

Ce pipeline exécute séquentiellement :
1. **Sync** : Exécute `dtc-sync-to-supernode.mjs` pour injecter le code local dans `FRA/PREV/N8N Prev`.
2. **Deploy** : Exécute `prev-deploy-supernode1-preprod.mjs` pour pousser le fichier mis à jour vers le webhook n8n de PREPROD.
3. **Smoke Test (optionnel)** : Vérifie que le moteur tourne bien en PREPROD et que la version correspond.

**Sécurité (Hook Cursor)** : Un hook Cursor (`.cursor/hooks/dtc-deploy-check.mjs`) s'exécute à la fin de chaque tour de l'agent. Il vérifie le hash du code DTC local par rapport à celui injecté dans `FRA/PREV/N8N Prev`. Si une modification locale a été faite sans être déployée, le hook force l'agent à proposer le redéploiement.

### 27.4 Variables exposées par la DTC (Note 314 — bench ISO)
Le payload final JSON en sortie du `Super noeud1` inclut désormais :
- `_dtcEngineVersion` : Version du moteur (ex: `v18-phaseT`).
- `_dtcHash` : Hash du bloc DTC injecté (parité code local ↔ n8n).
- `_dtcPayloadSnapshotForBench` : **Entrée exacte** passée à `computeScores` (snapshot PREPROD).
- `_sigPayloadPreDtc` : `sigPayload` **avant** rerank DTC (état MDSE post-filtrage, pré-DTC).
- `_dtcFinalScoresForBench` : Scores DTC bruts **avant** rerank affiché client.
- `_dtcDroppedLegacyCodes` : Codes MDSE legacy exclus du classement final.
- `eventSignatures` : Sortie **client** (après rerank + rescue DTC) — **seule vérité KPI release**.
- Par signature : `_dtcConfidence`, `_mdseConfidence`, `_dtcRawScore`.

---

## 28. Architecture détaillée du moteur (3 couches)

Le `Super noeud1` n'est PAS un moteur monolithique. C'est une superposition de 3 couches qui s'exécutent séquentiellement, chacune ajoutant un raffinement à la précédente. Cette section donne la cartographie complète, indispensable pour comprendre où se trouve quoi.

### 28.1 Couche 1 — MDSE legacy (lignes 1 à 23398, ~75% du fichier `FRA/PREV/N8N Prev`)

Le **MDSE** (Moteur De Signatures Événementielles) est le moteur DE BASE. Il calcule l'intégralité des données astronomiques et produit les 19 signatures candidates avec leurs scores baseline.

**Responsabilités** :
- Calculs astronomiques natifs : positions planétaires natales, transits, progressions secondaires, arcs solaires, profections annuelles + bound profections (termes égyptiens / ptolémaïques), Révolution Solaire (RS) avec relocalisation Volguine, Révolutions Lunaires (RL), antiscia, midpoints, étoiles fixes, déclinaisons (parallèles / contre-parallèles / out-of-bounds).
- Gestion des dignités natales et en transit, des réceptions mutuelles, des configurations natales (Grand Trigone, T-carré, Yod, etc.).
- Calculs des aspects natal-natal, natal-transit, transit-progression (T->P), progression-natal (P->N).
- Pré-scans MDSE PRO v1 à v6 (P1 à P63) qui détectent les signaux astrologiques élémentaires de chaque signature (ex : `P15 Mars-Saturne dur` = candidat ACCIDENT).
- Construction du `_natalPromises` (PNA v15 — Profil Natal Archétypal) : sans promesse natale, une signature ne peut pas se déclencher.
- Calcul du `sigPayload` baseline : 19 signatures avec un `confidence` initial entre 0 et 95.
- Application des verrous anti-hallucination Q179/Q180/Q181/Q187 (caps `profil_type`).
- Construction des prompts narratifs pour les 13 LLM (12 Maisons + 1 Synthèse) : RS + RL + transits significatifs + ancres natales.

**Entrées** : payload Webhook n8n (date/heure/lieu de naissance, période d'analyse, langue, genre, `profil_type`, `lieu_prochain_anniversaire`, etc.).

**Sortie** : `sigPayload` (19 signatures pré-cappées), `maisonsResult` (texte par maison), `_natalPromises`, et une centaine d'objets diagnostics (`_mdseRSCusps`, `_mdseRLPlanetHouse`, etc.).

### 28.2 Couche 2 — DTC v18 inline (lignes 23399 à 29781)

La **DTC v18** (Doctrine Topique Compositionnelle) est une couche de RAFFINEMENT injectée par script (`dtc-sync-to-supernode.mjs`) entre les marqueurs `// __DTC_BEGIN__` et `// __DTC_END__`. Elle ne calcule rien d'astronomique : elle prend le `sigPayload` produit par le MDSE et l'arbitre selon une doctrine d'empilement.

**Responsabilités** :
- **Phase T (snapshot)** : capture l'état pré-DTC du `sigPayload` pour traçabilité (`_dtcSnapshotPreDTC`).
- **Phase W (Doctrine d'empilement)** : pour chaque signature, vérifie que les "permissions" sont satisfaites (significateur thématique présent + déclencheur math actif + promesse natale concordante). Si une seule des 3 conditions manque, la signature est `stackOk = false` et perd son ranking.
- **Phase X (v19 empilement)** : calcule un `_phxEmpilementTier` (0 à 4) basé sur la qualité de l'empilement, le `_phxSignificator` (significateur retenu), le `_phxCorpsMaxScore` (cap par corps planétaire pour éviter la saturation thématique), et le `_phxSpreadScoresByRank` (étalement des scores entre Top-1 et Top-10 pour éviter "tout à 95%").
- **Sélection des peakWindows + algorithme H-balanced-v1** : pour chaque signature retenue, identifie une fenêtre de pics (typiquement 30 à 90 jours) et y sélectionne 5 dates `displayDates` selon un score de convergence astrologique. La date la mieux notée est marquée `principalDate` (affichée avec une étoile dans les rapports et prompts LLM).
- **Filtrage Legacy** : élimine les 5 codes `SANTE_UP`, `SPIRITUEL`, `JURIDIQUE_UP`, `VOYAGE`, `CYCLE_INTEGRATION` qui ne sont pas gérés par la DTC (stockés dans `_dtcDroppedLegacyCodes`).
- **Reranking final** : les confidences DTC écrasent les confidences MDSE. Le `sigPayload` est re-trié.

**Flags A/B** (PROD-safe via `typeof process !== "undefined"`) :
- `DTC_NO_PHASEW=1` : désactive la doctrine d'empilement (signatures notées comme avant).
- `DTC_NO_PHASEX=1` : désactive v19 (legacy pur).
- `DTC_NO_V19_SCORE=1` : empilement en observation seulement (scores legacy conservés mais Phase W tourne quand même pour audit).

Ces flags sont utilisés par le moteur local pour les benchs A/B (ex : "qu'est-ce que rapporte la Phase W ?").

### 28.3 Couche 3 — Post-DTC (lignes 29782 et suivantes)

Après le `__DTC_END__`, plusieurs étapes finales préparent le payload pour les downstream consumers (les 13 LLM + les 3 rapports HTML).

**Responsabilités** :
- **Sprint TOP5** : extrait les 5 signatures les mieux classées (filtrées par `reportable !== false`, triées par `confidence` décroissant, `slice(0, 5)`) et les expose comme `_top5Sigs`. Ces 5 signatures sont injectées dans les 13 prompts LLM via le bloc `🎯 TOP-5 SIGNATURES DU MOTEUR` (avec leurs peak dates et le marqueur `★` sur la `principalDate`).
- **Sprint 5.5 diag** : objet `_s55Diag` synthétique pour piloter les caps appliqués (utile en bench).
- **Sérialisation `sigJourney`** : trajectoire complète de chaque signature à travers tous les snapshots (RAW -> S5p3 -> S52 -> ... -> FINAL) — uniquement si `INSTR_PREV_4_3=1`.
- **Exposition des compounds** (`compoundEvents`) si l'ablation Sprint 4.4.1 l'a généré.
- Exposition des tags qualitatifs natals (`natalQualitativeTags`, `natalStellarTags`).

### 28.4 Pourquoi cette architecture en 3 couches ?

C'est le résultat d'une **stratification historique** : le MDSE existe depuis fin 2024, la DTC est venue en 2026 pour résoudre deux problèmes spécifiques (les noyades — signatures qui devraient être Top-5 et qui finissent en rang 12 — et la précision événementielle — les peak dates étalées sur toute l'année). Plutôt que de réécrire 23 000 lignes de calculs astronomiques, la DTC s'est insérée comme une couche de re-ranking pure.

**Conséquence pratique** : le MDSE n'est PAS l'"ancien moteur désuet" qu'on pourrait supprimer. C'est le SOCLE astronomique. Sans MDSE, le `sigPayload` arriverait vide à la DTC. Le DTC v18 ne peut pas fonctionner seul. Toute évolution doctrinale future (v19, v20…) se fera par incrément sur cette architecture.

---

## 29. Pipeline d'exécution end-to-end (commande PREV)

Une commande PREV traverse un pipeline n8n complet, du webhook initial jusqu'à l'envoi de l'email avec PDF en pièce jointe. Voici la séquence canonique.

### 29.1 Étapes principales

1. **Webhook PREV** : le site appelle `/webhook/prev` (PROD) ou `/webhook-test/prev` (PREPROD). Payload minimal : nom, prénom, date/heure/lieu de naissance, période, langue, genre. Champs optionnels : `profil_type`, `lieu_prochain_anniversaire`, `domaine_activite`, `consigne_redaction`.
2. **Extract Variables** : node de normalisation du payload (parsing dates, mapping locale, fallback `profil_type=prive`).
3. **APIs astronomiques** : 4 appels parallèles à AstrologyAPI / VedicAstroAPI / ProKerala / Swiss Ephemeris pour récupérer thème natal + transits + progressions + RS/RL.
4. **Super noeud1 (cœur du moteur)** : exécute les 3 couches MDSE -> DTC -> Post-DTC décrites en section 28. Sortie : `eventSignatures` (top-5 reranké), `_top5Sigs`, `maisonsResult`, prompts pour les 13 LLM.
5. **13 LLM (Gemini 2.5 Flash)** : 12 nodes Maison + 1 node Synthèse, exécutés en parallèle. Chaque LLM reçoit son prompt enrichi du bloc TOP-5 (avec étoile sur `principalDate`).
6. **Merge 4 fichiers4** : récupère les 13 sorties LLM et les regroupe.
7. **Générateur HTML Prévisions3** : assemble le rapport narratif (PDF client) à partir des 13 textes LLM + `eventSignatures` (filtré top-5 + étoile).
8. **Rapport HTML Sécurisé2** : génère le PDF client (version simplifiée des signatures, pas de techniques internes).
9. **Rapport Technique HTML v1** : génère le PDF debug (version technique simplifiée des signatures, sans badges PNA / S27 / Pyramid).
10. **Conversion PDF + Upload Drive + Email** : 3 PDFs convertis et uploadés sur Drive, lien envoyé par email au client.
11. **PREV POST site status** : informe le site que la commande est terminée.

### 29.2 Connexions critiques

Le pipeline ne fonctionne que si certaines connexions sont câblées :
- `Super noeud1 -> Merge 4 fichiers4` : sinon les 13 LLM n'ont pas leur input.
- `Merge 4 fichiers3 -> Analyseur Technique v` : sinon le rapport technique ne se génère pas.

Ces connexions sont vérifiables via le script `SITE/scripts/dtc/_inspect-rapport-nodes.mjs` et restaurables via `_reconnect-pipeline.mjs` si nécessaire.

### 29.3 Timeout d'exécution

Le pipeline complet (avec 13 LLM Gemini + génération PDFs + upload + email) peut durer **15 à 25 minutes** par commande. Le paramètre `executionTimeout` du workflow n8n est fixé à **1800 secondes (30 minutes)** pour PREPROD comme pour PROD. Le script `SITE/scripts/dtc/_set-timeout.mjs` permet de l'ajuster.

---

## 30. Note 314 — Mesure ISO client (standard obligatoire depuis 2026-05-22)

### 30.1 Problème résolu

Avant Note 314, trois pourcentages coexistaient pour la « même » métrique TOP5 primaire :
- **~69 %** : `poc-dtc-local.mjs` + proxy `finalizeClientScores` sur cache reconstruit (VM locale).
- **~65 %** : `_dtcFinalScoresForBench` exporté par la même exec PREPROD.
- **~60 %** : `eventSignatures` réellement livré au client.

**Cet écart est interdit comme KPI.** Toute présentation d'un % local différent de PREPROD sans colonne PREPROD côte à côte = erreur de process.

### 30.2 Principe ISO (par construction)

Chaque exec PREPROD exporte trois artefacts dans `Super noeud1` :
1. `_dtcPayloadSnapshotForBench` — entrée exacte de `computeScores`.
2. `_sigPayloadPreDtc` — liste MDSE avant rerank DTC.
3. `_dtcFinalScoresForBench` + `eventSignatures` — scores bruts et sortie client.

`bench-preprod-baseline-150.mjs` les stocke dans `SITE/scripts/dtc/payloads-cache-iso/<caseId>.json`.

`bench-iso-150.mjs` rejoue en local :
- `computeScores(snapshot)` avec le `poc-dtc-local.mjs` du dépôt ;
- `replayClientEventSignatures(sigPayloadPreDtc, scores)` — logique **miroir** de `dtc-sync-to-supernode.mjs` § 2c (`dtc-client-replay.mjs`).

**À hash moteur égal** : `eventSignatures` local = `eventSignatures` PREPROD (**gate parité 100 %**).

### 30.3 ⛔ Interdictions formelles (KPI release)

| Interdit | Pourquoi |
|----------|----------|
| Publier un % issu de `poc-dtc-local.mjs` seul comme perf **client** | Input cache ≠ snapshot PREPROD ; proxy ≠ rerank n8n |
| `DTC_BENCH_HONNETE` / `finalizeClientScores` comme KPI client | Simulation Node, pas `eventSignatures` |
| `_juge-de-paix.mjs` avec `_dtc_meta` (phases 309/310/311) en slide release | Gonfle ~+30 pp TOP1 vs client ; **LABO R&D uniquement** |
| `build-payload-cache.mjs` seul comme preuve parité | Reconstruit la VM ; n'utilise pas le snapshot exec |
| Valider un patch sans `dtc:bench-iso-gate` ou sans jalon PREPROD | Risque de déployer une régression invisible |

**Une seule vérité client** : `eventSignatures` PREPROD (webhook réel ou replay ISO bit-identical).

### 30.4 Commandes canoniques (baseline 150)

Depuis `SITE/` :

```bash
# ── KPI client (lecture NDJSON PREPROD existant, ~2 s) ──
npm run dtc:juge-preprod

# ── Bench ISO local = même chiffres que PREPROD (~30 s sur 150 cas ISO) ──
npm run dtc:bench-iso              # état actuel
npm run dtc:bench-iso-save         # snapshot avant patch
npm run dtc:bench-iso-diff         # Δ pp après patch (30 s)
npm run dtc:bench-iso-gate         # exit 1 si parité < 100 %

# ── Amorcer / rafraîchir le cache ISO (~1h40 pour 150 cas) ──
npm run dtc:juge-preprod-run       # POST PREPROD + remplit payloads-cache-iso/

# ── Deploy moteur ──
npm run dtc:deploy-smoke
```

### 30.5 Workflow obligatoire après chaque modif moteur

```
1. npm run dtc:bench-iso-save        # référence ISO
2. (éditer poc-dtc-local.mjs — bloc __DTC_INLINE_BEGIN__/END__ uniquement)
3. npm run dtc:bench-iso-diff        # Δ pp client ISO
4. Si Δ TOP5 ≥ 0 → npm run dtc:deploy-smoke
5. npm run dtc:bench-iso-gate        # parité 100 % sur cache ISO
6. (optionnel palier) npm run dtc:juge-preprod-run  # rejoue 150 exec + refresh cache ISO
```

**Loi** : pas de deploy PROD si `bench-iso-gate` échoue ou si Δ TOP5 BLOC A < 0.

### 30.6 Moteur local (`poc-dtc-local.mjs`) — rôles légitimes

| Usage | Autorisé |
|-------|----------|
| Édition doctrine (`__DTC_INLINE_*`) + sync `dtc-sync-to-supernode.mjs` | ✅ |
| Ablations R&D (`DTC_NO_PHASEW=1`, etc.) avec label **LABO** | ✅ |
| Bench ISO via `bench-iso-150.mjs` sur `payloads-cache-iso/` | ✅ |
| KPI release sans passer par bench-iso ou PREPROD | ❌ |

**PROD-safety** (bloc inline injecté n8n) : pas de `process` nu, `require`, `fs`, `console.error`. Voir `dtc:deploy-smoke` après tout changement inline.

Doc détaillée : `SITE/scripts/dtc/PARITE-LOCAL-PREPROD.md`.

---

## 31. KPI release — baseline 150 PREPROD (vérité client)

### 31.1 Définition (non négociable)

- **Périmètre** : 150 cas (`scripts/prev-bench-baseline-150-v1-manifest.json`).
- **Source** : `eventSignatures` après passage n8n PREPROD (rerank DTC + rescue).
- **Tableaux** :
  - **BLOC A** : signature principale (150 cibles).
  - **BLOC B** : toutes signatures cumulées (~413 cibles).
- **Métriques** : TOP1 / TOP3 / TOP5 / TOP10 en % (1 décimale) + n/dénominateur.

### 31.2 Format-type reporting release

```
✅ VÉRITÉ CLIENT — baseline 150 PREPROD (eventSignatures)

📌 BLOC A — Signature principale (150 cibles)
 TOP1  : nn/150 = nn.n%
 TOP3  : nn/150 = nn.n%
 TOP5  : nn/150 = nn.n%
 TOP10 : nn/150 = nn.n%

🎯 BLOC B — TOUTES signatures cumulées (413 cibles)
 TOP1  : nn/413 = nn.n%
 TOP5  : nn/413 = nn.n%
```

Après patch moteur, ajouter le bloc **BENCH ISO** (même chiffres que PREPROD si gate OK) :

```
🧪 BENCH ISO — Δ vs snapshot (hash <hash>)

📌 BLOC A — Δ TOP5 : ±n.n pp
```

### 31.3 Diagnostic interne (pas KPI)

Sur une même exec PREPROD, on peut lire **en complément** (jamais en remplacement du client) :
- `_dtcFinalScoresForBench` : capacité moteur avant perte aval MDSE (~+5 pp TOP5 vs client typiquement).
- Écart = codes notés par DTC mais absents ou noyés dans `eventSignatures` → chantier pipeline aval (rescue / sigPayload).

### 31.4 LABO R&D uniquement — Juge de Paix JDD (historique)

`_juge-de-paix.mjs` sur `poc-dtc-local.mjs` avec `_dtc_meta` et phases 309/310/311 :
- Utile pour guerre FP, audits doctrinaux, A/B par phase.
- **Interdit** comme preuve release ou slide client (écart ~+30 pp TOP1 observé vs PREPROD).
- Commande : `node SITE/scripts/dtc/_juge-de-paix.mjs` (label obligatoire : **LABO**).

### 31.5 Règles d'or (release)

1. **KPI release** = `npm run dtc:juge-preprod` ou `npm run dtc:bench-iso` (équivalents à parité 100 %).
2. **Après chaque patch** : `bench-iso-diff` puis `bench-iso-gate` avant deploy.
3. **JAMAIS** deux % client différents dans le même compte-rendu.
4. **JAMAIS** deploy PROD si Δ TOP5 client < 0 sur le jalon ISO ou PREPROD.
5. Snapshot daté : `scripts/prev-bench-baseline-150-preprod-vN.json` + `bench-iso-snapshot.json`.

---

## 32. Jeux de données (manifests) — la matière première du moteur

Tout le travail doctrinal du moteur DTC repose sur la qualité des jeux de données. Sans cas étiquetés rigoureusement, on ne peut ni mesurer une régression, ni valider une amélioration. Cette section recense les manifests existants et explique ce qu'ils servent.

### 32.1 Inventaire des manifests

Tous les manifests vivent dans `SITE/scripts/prev-bench-*-manifest.json`. Liste (mai 2026) :

| Manifest | Cas | Rôle |
|---|---|---|
| `prev-bench-r30-73-manifest.json` | 73 (63 stars + 10 Mme Dupont) | Baseline historique R30 — bench unifié S6.22 |
| `prev-bench-mini-extension-271-v1-manifest.json` | 166 (multi-événements / natif) | **Extension 271** — cas atypiques, Note 271, signatures rares |
| `prev-bench-mme-dupont-10cas-manifest.json` | 10 | Profils privés fictifs (anti-hallucination) |
| `prev-bench-temoins-10cas-2026-manifest.json` | 10 | Témoins 2026 (cas suivis en temps réel pour validation) |
| `prev-bench-mini10-s6247-phase4-r2-manifest.json` | 10 | Mini-bench Sprint 6.24.7 Phase 4 |
| `prev-bench-mini30-aa-extension-v2-manifest.json` | 30 | Extension AA Sprint 6 (heures de naissance AA strict) |
| `prev-bench-mini15-aa-extension-v1-manifest.json` | 15 | Extension AA v1 |
| `prev-bench-volume-100-manifest.json` | 100 | Volume run pour stress-tests |
| `prev-bench-volume-50-manifest.json` | 50 | Volume run intermédiaire |
| `prev-bench-volume-18-manifest.json` | 18 | Volume run light |
| `prev-bench-mini10-s6248-phase6-r9-v2-manifest.json` | 10 | Mini-bench Sprint 6.24.8 Phase 6 |
| `prev-bench-mixte-200-manifest.json` | 200 | Bench mixte (stars + extensions + Mme Dupont) |
| `prev-bench-baseline-150-v1-manifest.json` | 150 | Baseline Juge de Paix (100 core + 50 extension BC) — enrichi FP-V1 |
| `prev-bench-baseline-150-fp-v1.json` | 150 | Registre faux positifs moteur (généré, mode annuel) |

### 32.2 Le manifest BASELINE (57 personnes)

Le manifest de référence du Juge de Paix. Il contient 57 personnalités publiques avec un événement majeur étiqueté pour chaque (mariage, deuil, accident, élection, scandale, accession au trône, naissance d'enfant, etc.).

**Composition typique** : Brigitte Bardot 1952 (mariage Vadim), Charles de Gaulle 1940 (Appel du 18 juin = CARRIERE_UP), Tiger Woods 2010 (scandale Elin), Donald Trump 2016 (élection présidentielle), Princess Diana 1996 (divorce), Marilyn Monroe 1956 (mariage Arthur Miller), Edward VIII 1936 (abdication = CARRIERE_DOWN + MARIAGE Wallis), Robin Williams 2014 (suicide), etc.

Pour chaque cas : 1 ligne par événement majeur de l'année cible. Une personne peut avoir 1, 2 ou 3 événements (signature principale + alternatifs), ce qui explique les **154 cibles cumulées du BLOC B** vs **57 cibles principales du BLOC A**.

### 32.3 Le manifest EXTENSION 271

Construit par l'astrologue référent (Note 271, mai 2026), enrichi automatiquement par le modèle (Opus 4.7), avec validation des dates événement par sub-agent (Wikipedia / Britannica / IMDb / Billboard / royal.uk).

**Objectif** : faire passer le bench de 57 à 119 voire 271 cas pour stabiliser les benchs DTC v18-phaseT et tester la robustesse hors baseline. Inclut beaucoup de cas multi-événements par natif (Robin Williams 1989 + 1998 + 2008 + 2011, Marilyn Monroe 1953 + 1954 + 1956 + 1961, etc.).

**Codes représentés** (extrait) : CARRIERE_UP (35 cas), MARIAGE (41), SEPARATION (21), SANTE_DOWN (21), ENFANT (13), DEUIL (9), CARRIERE_DOWN (9), JURIDIQUE_DOWN (6), ACCIDENT (4), SCANDALE (2), HÉRITAGE (2), RELOCATION (2), ANTI_CAS (1).

**Arbitrages doctrinaux** : certains cas sont commentés dans `_meta.arbitrages_opus`, par exemple "Einstein 1921 reclassé en 1922 (Nobel annoncé 10/11/1922 pour travaux 1921 — cohérence transits)" ou "Magic Johnson 2009 retiré (signal faible business sans événement-jour)".

### 32.4 Le manifest Mme Dupont (anti-hallucination)

10 profils PRIVÉS fictifs (vraies dates de naissance + lieux + heures, mais sans événement public marquant en année cible). Sert de **garde-fou anti-hallucination** : le moteur ne doit PAS remonter `SCANDALE 80%`, `ASSASSINAT 75%` ou `PRESIDENT_ELU 70%` pour Mme Dupont. Si le bench Mme Dupont régresse (faux positifs), c'est un signal fort de relâchement des verrous Q179/Q180/Q181/Q187.

### 32.5 La cohorte Volguine (RS relocalisée)

Cohorte spécifique constituée pour valider la feature **Révolution Solaire RELOCALISÉE** (Sprint 6.24.4, école Volguine). Documents associés :
- `SITE/scripts/PREV-DEMANDE-ASTROLOGUE-111-RS-RELOCALISEE-SCOPE.md`
- `SITE/scripts/PREV-DEMANDE-ASTROLOGUE-112-RS-RELOCALISEE-ARBITRAGE.md`
- `SITE/scripts/PREV-DEMANDE-ASTROLOGUE-113-COHORTE-VOLGUINE.md`
- `SITE/scripts/PREV-DEMANDE-ASTROLOGUE-114-COHORTE-VOLGUINE-PROPOSITIONS.md`

Composée de natifs ayant **objectivement voyagé** le jour de leur anniversaire (sources biographiques fiables) avec un événement marquant dans l'année. Permet de mesurer si la RS calculée au lieu de séjour annuel rapproche le moteur du bon foyer dominant (vs RS au lieu de naissance par défaut).

---

## 33. Méthodologie de construction des manifests (rigueur absolue)

La fiabilité des benchs dépend entièrement de la rigueur des manifests. Cette section documente le protocole utilisé.

### 33.1 Heures de naissance — Rating Astro-Databank obligatoire

L'heure de naissance est la donnée la plus critique pour tout le moteur. Une erreur de 30 minutes peut décaler l'ASC d'un signe entier, casser toutes les profections, et invalider les calculs de RS / RL / progressions (sensibilité minute).

**Source canonique** : [Astro-Databank](https://www.astro-databank.astro.com) (base Wikipedia astrologique, ratings systématiques par bibliographe).

**Échelle de rating Astro-Databank** :

| Rating | Signification | Acceptable bench ? |
|---|---|---|
| **AA** | Acte de naissance officiel ou télégramme du bureau d'état civil. | ✅ OUI (gold standard) |
| **A** | Mémoire de la mère / du natif. Très fiable mais pas d'acte. | ✅ OUI (avec mention) |
| **B** | Biographie ou autobiographie publiée. | ⚠️ Tolérable, à confirmer |
| **C** | Rectifié par astrologue (heure non documentée). | ❌ Refusé |
| **DD** | Données contradictoires non résolues. | ❌ Refusé |
| **X** | Pas d'heure connue. | ❌ Refusé |

**Règle pour les manifests bench** : seuls les ratings **AA** et **A** sont retenus. Chaque cas a un champ `validation.notes_heure` qui stipule explicitement le rating, par exemple :
- `"Rating Astro-Databank: AA (1:15 PM)"` (Brigitte Bardot)
- `"Rating Astro-Databank: AA (04:00 AM) (corrigé avec le bon profil Astro-Databank)"` (Charles de Gaulle)

Pour les manifests AA-strict (`prev-bench-mini30-aa-extension-v2-manifest.json`, `prev-bench-mini15-aa-extension-v1-manifest.json`), seul le rating AA est accepté — c'est le filet le plus serré.

### 33.2 Format du `prev_business_fields`

Le format est strictement aligné sur le payload webhook PROD. Pas de raccourci. Exemple :

```json
{
  "prev_business_fields": {
    "nom": "Bardot",
    "prenom": "Brigitte",
    "date": "28/09/1934",
    "heure": "13H15",
    "lieu": "Paris 15e",
    "pays": "France",
    "mail": "benchmark+bardot@example.com",
    "langue": "Français",
    "consigne_redaction": "Vous",
    "genre": "F",
    "rapport": "Annuel",
    "annee": "1952",
    "date_entree": "01/01/1952",
    "date_sortie": "31/12/1952",
    "birth_place_lat": 48.8566,
    "birth_place_lng": 2.3522,
    "birth_place_place_id": "ChIJD7fiBh9u5kcRYJSMaMOCCwQ",
    "birth_place_formatted_address": "Paris, France",
    "birth_time_reference": "civil_at_birth_place"
  }
}
```

Notes :
- `heure` au format `HHHmm` (ex `13H15`) — c'est la convention PROD pour distinguer heures et minutes même si saisies sans séparateur clair.
- `birth_place_place_id` : ID Google Places officiel — garantit que le géocodage est reproductible et identique à celui qu'aurait obtenu le formulaire site.
- `birth_time_reference: "civil_at_birth_place"` : explicite que l'heure est l'heure civile au lieu de naissance (et non UTC ou autre).

### 33.3 Étiquetage des événements — protocole 4 niveaux

Chaque cas est étiqueté dans son bloc `validation`. Le protocole en 4 niveaux garantit qu'on sait toujours **quoi** est attendu, **quand**, **avec quelle confiance** et **pourquoi**.

```json
{
  "validation": {
    "resume": "Premier mariage (fin d'année 1952).",
    "evt_bench_ref": "evt1",
    "evt_bench_brut": "mariage 21/12/1952",
    "indices_redactionnels": ["union", "mariage", "couple", "fin décembre 1952"],
    "notes_heure": "Rating Astro-Databank: AA (1:15 PM)",
    "code_attendu": "MARIAGE",
    "code_attendu_alt": ["RELOCATION"],
    "compound_hypothese": null,
    "audit_status": "validé",
    "audit_notes": "Mariage Roger Vadim 21/12/1952. Pas d'autre événement marquant (Et Dieu créa la femme = 1956).",
    "event_date": "1952-12-21"
  }
}
```

**Niveau 1 — Code attendu principal** (`code_attendu`) : la signature qui DOIT être dans le top-N. C'est ce que mesure le BLOC A du Juge de Paix.

**Niveau 2 — Codes alternatifs** (`codes_attendus_alt`) : signatures secondaires acceptables (ex : un mariage à l'étranger compte aussi comme RELOCATION). Ces codes alimentent le BLOC B (154 cibles cumulées) du Juge de Paix.

**Niveau 3 — Compound hypothesis** (`compound_hypothese`) : pour les cas où plusieurs signatures se cumulent en un seul événement (ex : ASSASSINAT + DEUIL + SCANDALE pour un assassinat politique). Sert à valider la doctrine compound-aware (Sprint 4.4.1).

**Niveau 4 — Audit** (`audit_status` + `audit_notes`) : statut "validé" / "à revoir" / "litigieux" + notes biographiques pour traçabilité. Permet de relancer l'arbitrage si une régression est détectée plus tard.

### 33.4 `event_date` — la date événement précise

Champ critique pour le mode **WINDOWED** : la date exacte de l'événement (ISO `YYYY-MM-DD`). Sources autorisées :
- Acte officiel (mariage, naissance, décès) — gold standard.
- Article de presse contemporain (Le Monde, NY Times, Times, Le Figaro) — fiable si la date apparaît textuellement.
- Wikipedia (avec source vérifiable) / Britannica / IMDb (films, prix) / Billboard (charts) / royal.uk (familles royales) — fiable pour les figures publiques.
- Biographie publiée référencée — bon, à recouper si possible.

Si la date précise est incertaine (mois connu mais pas le jour), on retient le **15 du mois** par convention et on l'indique dans `audit_notes`. Si seule l'année est connue, le cas est étiqueté `event_date: null` et il bascule en fallback annuel pour le mode windowed.

### 33.5 Indices rédactionnels (`indices_redactionnels`)

Tableau de mots-clés que le LLM rédacteur DEVRAIT évoquer dans le rapport narratif si la signature attendue est correctement détectée. Sert au scoring qualitatif des LLM (vérifier qu'au moins N indices sur M sont mentionnés). Exemple Bardot : `["union", "mariage", "couple", "fin décembre 1952"]` — le rapport narratif Bardot 1952 doit évoquer le mariage, l'union, le couple et un timing fin d'année.

### 33.6 Anti-cas (`ANTI_CAS`)

Cas spécialement construits pour piéger le moteur : configuration astrologique en apparence forte, mais SANS événement réel cette année-là. Si le moteur remonte une signature haute, c'est un faux positif. Sert à mesurer la solidité de la doctrine anti-bruit. Quelques cas seulement (1 dans l'extension 271), mais leur impact diagnostic est élevé.

### 33.7 Pipeline de construction d'un nouveau cas

1. **Sélection du natif** : figure publique avec événement majeur documenté.
2. **Récupération des données natales** : Astro-Databank pour heure/lieu (AA ou A obligatoire).
3. **Identification de l'événement cible** : date précise (Wikipedia/Britannica/etc.), code attendu, codes alternatifs.
4. **Construction du `prev_business_fields`** : format strict aligné sur le webhook PROD.
5. **Construction du `validation`** : 4 niveaux (résumé, code attendu, audit, event_date).
6. **Sub-agent de validation** (en mode batch sur des extensions) : un agent Opus 4.7 vérifie chaque date et chaque rating, et propose des corrections (ex : Einstein 1921 -> 1922).
7. **Ajout au manifest** : insertion dans `runs[]`, mise à jour de `_meta.total` et `_meta.breakdown_codes`.
8. **Build du payload cache** : `node SITE/scripts/dtc/build-payload-cache.mjs --case={caseId}` interroge la PROD n8n pour générer le payload MDSE et le mettre en cache.
9. **Bench de validation** : `node SITE/scripts/dtc/poc-dtc-local.mjs --only={caseId} --debug` vérifie que le moteur détecte bien le code attendu.
10. **Intégration au Juge de Paix** : si le cas est en baseline, il pèse 1/57 sur le BLOC A et 1-3/154 sur le BLOC B.

Ce pipeline garantit qu'aucun cas n'entre en bench sans :
- Heure de naissance fiable (AA ou A).
- Date événement vérifiée.
- Code attendu arbitré et documenté.
- Audit retraçable.

---

## 34. Changelog post-DTC v18 (Mai-Juin 2026)

### 34.1 Suppression du LLM Reranker S60 et de la chaîne d'audit S70/S71

Le LLM Reranker (Gemini 2.5 Flash) qui re-classait le top-5 du moteur a été désactivé en mai 2026 puis intégralement supprimé. Raison : la doctrine d'empilement DTC v18 (Phase W) rend le re-ranking LLM redondant et apporte plus de bruit que de signal.

Nodes supprimés (7) : `S60 Prepare Rerank`, `S60 LLM Reranker`, `S60 Gemini Flash`, `S60 Apply Rerank`, `S70 Build Audit Callback`, `S70 Audit Required?`, `S71 POST Audit Callback`.

Script associé : `SITE/scripts/dtc/_cleanup-s60-s70.mjs`. Backups : `SITE/scripts/prev-supernode-backups/workflow-{id}-CLEANUP-S60S70-{ts}.json`.

### 34.2 Reconnexion du pipeline downstream

Pendant les phases de test, certaines connexions critiques avaient été manuellement débranchées. Restauration via `SITE/scripts/dtc/_reconnect-pipeline.mjs` :
- `Super noeud1 -> Merge 4 fichiers4` : alimente les 13 LLM Maisons + Synthèse.
- `Merge 4 fichiers3 -> Analyseur Technique v` : alimente le rapport technique.

### 34.3 Sprint TOP5 — Top-5 du moteur dans les prompts et les rapports

Avant : les prompts des 13 LLM contenaient `_yReliable` (top-3 ultra-fiables, signatures avec confidence très haute).

Après : les prompts contiennent `_top5Sigs` (top-5 du moteur, filtré `reportable !== false`, trié par confidence décroissante, slice(0, 5)). Le bloc injecté est intitulé `🎯 TOP-5 SIGNATURES DU MOTEUR`.

**Cohérence end-to-end** : les 5 signatures injectées dans les prompts LLM sont **les mêmes** que celles affichées dans les 3 rapports HTML. La source canonique est le `sigPayload` POST-DTC (ligne `finalOutput[0].json.eventSignatures = sigPayload`), pas le `_mdseResults` pré-DTC. Sans cette synchronisation, on observait des mismatch de scores entre prompts et rapports.

### 34.4 Algorithme `H-balanced-v1` + marqueur `★` sur la `principalDate`

L'algorithme de sélection des `displayDates` (5 dates de pic dans la `peakWindow` de chaque signature) a été enrichi pour identifier la **date la mieux notée par convergence** et la stocker dans `peakWindow.principalDate`. Cette date est marquée d'un `★` dans :
- Les prompts LLM (bloc TOP-5).
- Le rapport client `Rapport HTML Sécurisé2`.
- Le rapport narratif `Générateur HTML Prévisions3`.
- Le rapport technique `Rapport Technique HTML v1`.

Justification doctrinale : un événement astrologique majeur ne tient pas sur UN jour, mais sur une fenêtre de convergence (typiquement 30 à 90 jours). Afficher 5 dates donne au lecteur la nuance du processus, et marquer la principale donne le repère de pic (fonction d'aimant).

### 34.5 Simplification des 3 rapports HTML

Les 3 templates HTML de rapport ont été allégés (script `_patch-rapports-simplify.mjs`) :
- Suppression des badges techniques verbeux : PNA tier, Natal Promise, Structural Promotion, divers prognoses, aspects, directions, Firdaria, Pyramid Level, contre-indicateurs.
- Conservation : icône, label, confidence%, robustness, peakWindow, displayDates (avec `★` sur principalDate), guidance.

Cette simplification s'applique aussi au **rapport technique de debug** — le test du moteur en local couvre désormais ce besoin technique.

### 34.6 Timeout étendu à 30 minutes

Le `executionTimeout` du workflow PREV a été étendu de 600s à **1800s (30 min)** pour PREPROD comme PROD afin de laisser de la marge aux 13 LLM + génération PDFs + upload Drive + email. Script : `SITE/scripts/dtc/_set-timeout.mjs`.

### 34.7 Simplification du formulaire site (commande PREV)

Les 2 champs **Type de profil** (Privé / Public) et **Ville où vous serez le jour de votre anniversaire en N+1** ont été déplacés dans une section repliable **"Options avancées (recommandé : ne pas modifier)"** du formulaire `https://site-rapports-astro.vercel.app/commander/prev`.

**Décision technique** : ces 2 champs restent **conservés** côté backend et côté moteur (verrous Q179/Q180/Q181/Q187 et RS Volguine). Les fallbacks par défaut sont conservateurs :
- `profil_type` absent -> moteur lit `"prive"` -> Q180 cap @ 50% sur signatures sensibles -> aucune hallucination.
- `lieu_prochain_anniversaire` absent -> RS calculée au lieu de naissance (`birthLat / birthLon`) -> précision Volguine perdue mais résultat correct.

Justification UX : 99% des clients commerciaux sont en profil privé et n'ont pas de stratégie de relocalisation anniversaire. L'affichage en "options avancées" évite de leur poser des questions techniques superflues, sans pour autant désactiver les protections moteur.

Fichier modifié : `SITE/app/components/prev-checkout-form.tsx`. Clés i18n ajoutées : `forms.prev.advancedOptionsLabel` + `forms.prev.advancedOptionsHint` (FR + EN).

### 34.8 Nettoyage MDSE — suppression du bloc S6.1 (LLM Reranker prep)

Le bloc `SPRINT 6.1 - Préparation prompt LLM Reranker (V2)` (lignes 29803 à 30613 dans l'ancien `FRA/PREV/N8N Prev`) a été supprimé. Ce bloc construisait le prompt destiné au LLM Reranker S60 (Gemini Flash), ainsi que les variables `_s60Top3`, `_s60ScandaleBlock`, `_s60LilithBlock`, `_s60FixedStarV2Block`, `_s60ProtectionBlock`, `_s60UserPrompt`, et l'objet final `_s60RerankInput`.

Depuis le bypass S60 (mai 2026), `_s60RerankInput` était **systématiquement nullifié** en fin de bloc, et les 7 nodes consommateurs (S60/S70/S71) ont été supprimés (cf. 34.1). Le bloc était donc 100% orphelin (~810 lignes mortes).

Script de nettoyage : `SITE/scripts/dtc/_cleanup-mdse-s61-deadcode.mjs`. Vérifications automatiques :
- Aucune variable déclarée dans le bloc supprimé n'est référencée ailleurs dans le code restant.
- Vérification syntaxique JavaScript (`new Function(cleaned)`) après suppression.
- Backup automatique dans `SITE/scripts/prev-supernode-backups/N8N-Prev-CLEANUP-S61-DEADCODE-{ts}.txt`.

Effet collatéral : le champ `domaine_activite` du formulaire site n'est désormais plus consommé par aucune partie du moteur (il ne servait qu'au prompt LLM Reranker). Décision : le champ est **conservé** dans le formulaire (UX informative pour l'utilisateur, pas de régression côté moteur). Si un nouvel usage moteur émerge (ex : modulation typologique LLM Maison), la donnée est déjà disponible dans le payload webhook.

---

## 35. Sprints AV (Affinement Vertical) — Helpers natals doctrinaux par code (mai-juin 2026)

À partir de mai 2026, le moteur DTC v18 a été enrichi par une série de **sprints AV.X** — chacun ciblant un code événementiel spécifique (CARRIERE_UP, MARIAGE, ENFANT, DEUIL, SANTE_DOWN, SEPARATION, etc.) avec un helper de pré-calcul natal indépendant, branché sur le pipeline de scoring v19.

### 35.1 Principe : helpers `_phxXxxSignals`

Pour chaque code traité, un helper `_phxXxxSignals(payload, eventDate)` détecte une signature **doctrinalement strict** au natal pour l'année événement. Si la signature `strong` est confirmée :

1. **Promotion `stackOk`** : si l'empilement DTC v18 n'avait pas suffi (stackOk=false), la signature natale promote stackOk=true pour permettre au code de scorer via le pipeline tier+spread.
2. **Bump de tier** dans `_phxEmpilementTier` (tier 95-96 selon helper) : casse le cap 92 du `stackOk && !codeSpecific`.
3. **Boost de qualité** (`q += 1500` typique + bonus orbe serrée) dans `stackQualityRank` pour départager les concurrents à tier égal.

Chaque helper expose **trois fonctions de bypass** :
- `DTC_NO_PHASEAV=1` : désactive TOUS les sprints AV (audit global).
- `DTC_NO_PHASEAVx=1` (x ∈ {A, B, C, F, G, I, ...}) : désactive l'helper spécifique (mesure isolée A/B).
- Variantes ad-hoc selon helper (ex `DTC_NO_AVA_ARC=1` pour la route α ARC d'AV.A).

Toutes les bypass utilisent `typeof process !== "undefined"` pour rester PROD-safe (en PROD elles valent toujours false ; en local CLI elles sont modulables via env).

### 35.2 Inventaire des sprints AV

| Sprint | Code | Pattern doctrinal | Effet TOP5 BLOC A | Statut |
|---|---|---|---|---|
| **AV.A** (Note 285) | `CARRIERE_UP` | V1 transits : Jupiter ET Saturne partiles sur Sol/MC/Asc + profession M2/M6/M10/M11. **V2 ARC (note 304, Sprint B 21/05/2026)** : MAL_HARD ARC partile (≤0.3°) sur Hyleg-Carrière + dignité Sol/MC `isStrong` (Lilly +3 minimum) — Bonatti DA t.8 / Morin AG XXIII. | V1 +X pp / **V2 +0.7 pp BLOC A TOP5** (0 régression) | ✅ Actif |
| **AV.B** (Note 286) | `MARIAGE` | Jupiter ULTRA-partile (≤0.2°) + Saturne partile (≤0.5°) sur Lune/Vén/Desc/Lot Mariage + profession M5/M7/M8 | +1.3 pp | ✅ Actif |
| **AV.C** (Note 287) | `ENFANT` | 3 clauses (A/B/C selon orbe Jup/Sat sur Cérès/Lot Enfants) + profession M5 ou seigneur an = Vén/Lune/Jup | +2.0 pp | ✅ Actif |
| **AV.D** (Note 288/305) | `FINANCE_UP` | V1 Jup+Sat PdF/Basis ; **V2 B-full** profection mensuelle event_date branchée dans helper | V1 -3.3 pp / V2 **-2.0 pp TOP5** (pré-calcul OFF, helper actif) | ❌ Archivé — reprise V3 (profMens-only + clause C retirée) |
| **AV.E** | (testé puis abandonné) | — | — | ❌ Archivé |
| **AV.F** (Note 290) | `DEUIL` | 6 clauses (A profession M8, B M5, C M7, D M4, E compound, F axe IC-MC) | +3.3 pp | ✅ Actif |
| **AV.G** (Note 291) | `SANTE_DOWN` | 3 clauses strictes (A profession M6, B compound moderne, C Sat+Mars ULTRA sans prof) | +X pp | ✅ Actif |
| **AV.H** (Note 292) | `CARRIERE_DOWN` | V1 Mars compound MC + Sat/Plut sur axe métier ; V2 3 clauses ULTRA-strictes ; **V3 (Sprint B 21/05/2026)** : DP MAL_HARD partile sur Hyleg + dignité Sol/MC NOT isStrong + profM10/M12 — Morin AG XXIII "in defectu dignitatis = chute" | V1 -6.0 pp / V2 -1.3 pp / **V3 non déployé** : scan baseline-150 = 0 vrai positif sur 4 candidats profCareer (gibson exclu car profM3, 3 CARRIERE_UP fdr/woods/mother-teresa + 1 MARIAGE beckham) | ❌ Archivé (3 itérations) |
| **AV.I** (Note 294-295) | `SEPARATION` | 4 clauses (α ARC partile, β transits lents Sat/Ura/Nep/Plut, γ Vénus afflictée natale, δ profession M5/M7/M8 ou seig=Vénus) | +0.7 pp (0 FP) | ✅ Actif |
| **AV.J** (Notes 296-300) | `SCANDALE` | α arc partile + β-modern (≥2 Plut/Ura) + γ-modern (Sol/MC↔Plut/Ura/Nep) + δ ULTRA-strict (profM10/M12) | 0 pp net | ❌ Archivé (doctrinalement solide, gain net Juge de Paix nul) |
| **Hyleg DEUIL** | `DEUIL` (sub-helper) | Détection axe parental/conjugal + suddenEnd Pluto/Uranus | bump tier 98 si suddenEnd | ✅ Actif |

### 35.3 Doctrine du "PAS DE BRICOLAGE NI DE RUSTINE"

Critère d'acceptation d'un sprint AV (gravé dans le marbre) :

1. **Source doctrinale identifiée** : Ptolémée Tetrabiblos, Lilly CA III, Morin AG XXI/XXIII, Bonatti DA, Valens, Firmicus pour la tradition ; Ebertin (Combination), Reinhold pour le moderne sourcé. Citations explicites en note d'en-tête du helper.
2. **Validation Juge de Paix** : BLOC A TOP5 baseline-150 ANNUEL **strictement positif** (jamais 0 pp ni négatif). BLOC B confirme et étend.
3. **Pas de veto arithmétique ad-hoc** : aucune "rustine" qui élimine un FP par condition trop spécifique (ex : "tuer MARIAGE quand DEUIL est primary" → refusé, c'est du bricolage).
4. **Pas de filtre commit-based** : `DTC_NO_PHASEAVx` toujours dispo pour mesurer l'effet propre. Jamais de comparaison à un HEAD ancien qui mélangerait plusieurs phases.

Quand un sprint ne passe pas (cf. AV.D, AV.E, AV.H, AV.J) :
- **Helper conservé en code mort** (fonction `_phxXxxSignals` reste définie pour reprise future).
- **Pré-calcul désactivé** dans `applyV19EmpilementFinalScores` (assignation `stacks.X._phxX` retirée).
- **Bump tier / q boost gardés** dans `_phxEmpilementTier` / `stackQualityRank` (gardes `emp._phxX` toujours falsy → no-op).
- **Note d'archivage exhaustive** : diagnostic doctrinal, résultats bench, raisons de l'échec, conditions de reprise éventuelle (ex : profection mensuelle, DP étendues, filtre de dignité).

### 35.4 Revue doctrinale globale (21 mai 2026) — citations sourcées + audit ARC

À l'issue des sprints AV.I et AV.J, une **revue doctrinale globale** a été menée pour :

1. **Citations doctrinales sourcées** ajoutées en notes d'en-tête de chaque helper actif (AV.A note 285, AV.B note 286, AV.C note 287, AV.F note 290, AV.G note 291, AV.I note 295). Sources tradition : Ptolémée Tetrabiblos, Lilly Christian Astrology III, Morin AG XXI-XXIII, Bonatti De Astronomia, Valens Anthologies, Firmicus Mathesis. Sources moderne : Ebertin Combination of Stellar Influences, Reinhold (séries thématiques en allemand).
2. **Audit ARC** systématique sur les miss top5 de chaque helper actif :
   - **AV.A CARRIERE_UP** (2 miss : watson 1928 Pluton☐MC 0.00°, woods 1975 Mars☍Sol 0.20°) — implémentation clause α ARC MAL_HARD testée → **net négatif** (−1 TOP1 BLOC A, 2 FP top1 caroline-monaco/jfk-jr). Doctrinal Bonatti DA t.8 et Morin AG XXIII : MAL_HARD sur Hyleg = mutation ambivalente (consécration OU destitution selon dignité Sol/MC), non discriminable sans filtre de dignité intégré. **Clause α ARC archivée pour AV.A**, code mort conservé. Reprise future possible si extraction de dignité Sol/MC ajoutée au payload.
   - **AV.B MARIAGE** (3 miss) : 0 arc partile ≤ 0.3° sur miss → pas de potentiel ARC.
   - **AV.C ENFANT** (3 miss) : 1 cas borderline (jolie Vénus△Lot Enfants 0.245°), filtre STRICT v2 (≤0.15°) tue le gain. Pas d'enrichissement.
   - **AV.F DEUIL** (2 miss : jung 1875, mccartney 1942) : pas d'arc viable.

**Conclusion** : l'ARC est intrinsèquement déjà couvert par AV.I (SEPARATION clause α) ; les autres helpers fonctionnent par signature transit Jup+Sat partile + profession qui est **doctrinalement complète**. Pas d'enrichissement ARC supplémentaire viable sur baseline-150 sans intégration de la dignité Sol/MC pour lever l'ambivalence MAL_HARD.

### 35.5 Sprint B post-revue (21/05/2026) — helpers natals utilitaires + reprise AV.A V2

À l'issue de la revue doctrinale du 21/05/2026, un **Sprint B** a été lancé pour exploiter la piste identifiée en § 35.4 : intégration de la dignité essentielle Sol/MC pour lever l'ambivalence MAL_HARD.

**Phase 1 — Helpers utilitaires PROD-safe** (notes 301-302, cf. § 36.3)
- `_phxDigniteEssentielleScore(natalDict, planet)` + `_phxDigniteSolMC(payload)` : mapping de l'étiquette `natalDict[p].dignite` vers un score Lilly CA III ch. 12 (+5/+4/+3/-4/-5) et indicateurs `isStrong/isWeak/isAmbivalent`. Doctrine : Bonatti DA t.3, Morin AG XVI, Lilly CA III.
- `_phxDPActivesPourEvent(payload, eventDate)` + `_phxBestDPHit(payload, prom, asp, sig)` : filtrage des directions primaires (`_mdsePrimaryDirections`) actives à event_date avec orbe configurable. Système MDSE : semi-arc équatorial RA/OA/OD avec clé Naibod (≈ Régiomontanus), cf. Lilly CA III "Of Directions" et Morin AG XXIII.
- **Décision profection mensuelle** : reportée à un Sprint B-full ultérieur (exige date de naissance dans payload-cache → rebuild). Non bloquant pour AV.A V2 / AV.H V3.

**Phase 2 — Reprise AV.A clause α-V2 ARC** (note 304) ✅ KEEP
- Logique : MAL_HARD ARC partile (≤0.3°) sur Hyleg-Carrière (Sol/MC/Asc/Jup/LotFortune) + `_phxDigniteSolMC(...).isStrong` (Sol OR Maître MC en triplicité/exaltation/domicile) → CONSÉCRATION (route activée). Sinon (Sol/MC pérégrin/débilité) → s'abstient.
- **Variante BEN_SOFT testée puis archivée** (route trop large : 5 cas matchent dont 2 délogent du TOP5 BLOC A — princess-anne-1950 ACCIDENT, bernard-arnault-1949). Restriction à **MAL_HARD only** doctrinalement plus pure (Bonatti DA t.8 "directio Martis super Solem").
- Cible récupérée : **watson-1928** (Sol Exaltation Bélier, Pluton☐MC ARC 0.004°) → CARRIERE_UP M3p ❌→✅ et M5p ❌→✅.
- Pronostic FP évités par filtre dignité : caroline-monaco-1957 (Sol Exil), jfk-jr-1960 (pérégrins), woods-1975 (pérégrins) → V2 s'abstient.
- Bypass : `DTC_NO_AVA_ARC_V2=1`.
- Diff cas-par-cas baseline-150 : **3 GAINS / 0 LOSSES / 0 SWAPS** (watson + julia-child-1912 CARRIERE_UP secondaire + vangogh-1853 top1 swap conforme à la promesse natale).

**Phase 3 — Reprise AV.H V3 CARRIERE_DOWN** ❌ Archivée (cf. note 292 du moteur)
- Hypothèse : DP MAL_HARD partile + Sol/MC NOT isStrong → "chute par défaut de dignité" (Morin AG XXIII "in defectu dignitatis, malefici significant suam naturam").
- Scan baseline-150 : 12 cas matchent "DP MAL_HARD partile sur Hyleg + Sol/MC NOT isStrong" dont **1 seul est primary CARRIERE_DOWN** (mel-gibson-1956 Sat☌Sol 0.03°) et 11 sont des primaries variées (CARRIERE_UP × 4 fdr/woods/mother-teresa/pasteur, MARIAGE × 2 beckham/streisand, DEUIL yoko-ono, ACCIDENT kahlo, JURIDIQUE_DOWN berlusconi, ENFANT aguilera, SEPARATION bruce-willis).
- Restriction additionnelle profCareer (M10/M12) : 4 candidats mais **0 vrai positif** (gibson exclu car prof M3 en 2006, sa cible V2 historique était Pluton☐MC transit + lord_in_M10).
- **Diagnostic** : "Saturne dur sur Soleil" est doctrinalement valide chez Morin mais empiriquement polyvalent (chute, effort consacré FDR 1933, deuil saturnien Yoko 1980, accident Kahlo 1925). Non-discriminant pour CARRIERE_DOWN seul.
- Conditions de reprise V4+ : profection mensuelle (sprint B-full), pré-calcul SCANDAL_TAG (Plut/Ura sur Sol/Vén/Mer simultanés), ou extension JDD 150 → 200/271 pour stabiliser la signature.

### 35.6 État Juge de Paix post-Sprint B (21/05/2026)

```
🎯 JUGE DE PAIX — Baseline 150 cas, ANNUEL

📌 BLOC A — Signature principale (150 cibles)
   TOP1  :  44/150  =  29.3%   (Δ 0 pp vs pré-Sprint B)
   TOP3  :  88/150  =  58.7%   (Δ +0.7 pp)
   TOP5  : 123/150  =  82.0%   (Δ +0.7 pp) ◀ strictement positif
   TOP10 : 144/150  =  96.0%   (Δ 0 pp)

🎯 BLOC B — TOUTES signatures cumulées (413 cibles) ◀ JUGE DE PAIX ULTIME
   TOP1  :  84/413 =  20.3%    (Δ +0.2 pp)
   TOP3  : 151/413 =  36.6%    (Δ +0.2 pp)
   TOP5  : 227/413 =  55.0%    (Δ +0.5 pp)
   TOP10 : 357/413 =  86.4%    (Δ +0.2 pp)
```

Hash PROD : `d65089faf742` (deploy-smoke ✅, _dtcError ✓ aucune, Kate top1=MARIAGE conservé).

---

## 36. Enrichissement du payload DTC — `_phxArcHits` et données runtime (juin 2026)

À mesure que les sprints AV s'étoffent, le moteur DTC consomme des **données natales auxiliaires** qui n'étaient pas exposées historiquement par le MDSE. Pour préserver l'ISO-exécution LOCAL ↔ PROD et la reproductibilité des benchs, ces données sont :

- soit **calculées runtime dans le bloc inline DTC** (depuis le `_natalDict` exposé par MDSE),
- soit **ajoutées au build du cache** (script `build-payload-cache.mjs`) en exposant la variable correspondante du `N8N Prev` MDSE dans `finalOutput[0].json`.

### 36.1 `_phxArcHits` — Arcs solaires Naibod (Sprint AV.I et suivants)

**Calcul** : `_phxComputeNatalArcHits(payload)` dans `poc-dtc-local.mjs` (ligne ~7128). Formule Naibod (`360°/365.2422 ≈ 0.9856°/an`), promissors = 10 planètes traditionnelles + Asc/MC, significators = mêmes points + lots arabes (Fortune, Esprit, Basis, Père, Mère, Mariage, Enfants, Maladie, Voyage) + maîtres natals des 12 maisons. Orbe max 1° (≈ 1 an d'arc).

**Consommation par les helpers** :
- AV.I SEPARATION clause α (Note 294) : arc partile harmful ↔ Vénus/M7/LotMariage/Descendant.
- AV.J SCANDALE clause α (Note 296) : arc partile harmful ↔ Sol/MC/Vén/Lot Mariage.
- AV.A CARRIERE_UP route ARC (Note 285bis, **archivée**) : arc partile MAL_HARD ou BEN_SOFT sur Sol/MC/Asc/Jup/Lot Fortune.

**Stockage** : `payload._phxArcHits` indexé par `"arc_PROM|||ASPECT|||SIG"`. Calculé une seule fois en début de `applyV19EmpilementFinalScores` (ligne ~8876), avant les pré-calculs AV.

**Bypass** : `DTC_NO_PHASEARC=1` (CLI local seulement).

### 36.2 Variables natales requises par les helpers AV

Pour qu'un nouveau cas soit benchmarkable et consommable par les helpers AV.X, son payload doit contenir **toutes** les variables suivantes (déjà exposées par `build-payload-cache.mjs` à condition que le `N8N Prev` MDSE les calcule) :

| Champ | Source MDSE | Helpers consommateurs |
|---|---|---|
| `_natalDict` | `natalDict` (positions + signs + houses + dignites) | TOUS |
| `_aspectsSuiviLent` | `aspectsSuiviLent` (transits Sat/Ura/Nep/Plut + Jup, avec `waves`) | TOUS |
| `_aspectsSuiviRap` | `aspectsSuiviRap` | accidents, scandales |
| `_houseLords` | dérivé de `natalHouses` (cuspides) | TOUS |
| `_profections.annuelle` | `profections` (maison, seigneur, maison_seigneur, dignite, signe_cuspide) | TOUS |
| `_profections.mensuelle` | `profections` enrichi Sprint B-full (idem annuelle, pas seulement `{ maison }`) | AV.D FINANCE_UP V2, AV.H V4 |
| `_profectionMensuelleEvent` | post-build `build-payload-cache.mjs` (mois de `event_date` du manifest) | AV.D, AV.H (préféré en bench) |
| `_dateNaissance` | `perso.date` | `_phxProfectionMensuelleAtEvent` (note 303) |
| `_dateEntree` / `_dateSortie` | `perso.date_entree` / `perso.date_sortie` | debug période |
| `_mdseMonthlyProfByMonth` | MDSE P16 (`calMonth` 0-11 → maison) | filtres mensuels |
| `_mdseMonthlyProfActive` | MDSE P16 (maisons actives sur la période rapport) | filtres mensuels |
| `progressionsRaw.age` | `progressionsRaw` (âge décimal à event_date) | `_phxComputeNatalArcHits` (calcul Naibod) |
| `_natalHouses` | `natalHouses` (cuspides + segments) | helpers de promotion (M4/M5/M7/M8/M10/M12) |
| `_isDayChart` | `isDayChart` | calculs lots arabes |
| `_firdariaActive` / `firdariaActive` | `firdariaActive` | Phase T |
| `_mdsePrimaryDirections` | `_mdsePrimaryDirections` | helpers DP (futur) |
| `_mdseRSCusps` / `_mdseRSHouses` / `_mdseRSAngleCrosses` / `_mdseRSDate` | RS Volguine | helpers RS |
| `_mdseStations` | `_mdseStations` | détection stationnaires |
| `_mdseEclipseNatalHits` / `_mdseEclipseDegreeReactivations` / `eclipsesProgressees` | calculs éclipses MDSE | helpers éclipses |
| `_configs` | `natalConfigurations` (stelliums, T-carrés, Yods…) | climat natal |
| `_etoileMatchesNatal` | `etoileMatchesNatal` | tags stellaires |
| `eventSignatures` (sigPayload PRE-DTC) | `globalThis._sigPayloadPreDtc` | input des Phases W/X |
| `_climatNatalSnapshot` | `sigPayload.map(climat...)` | climat |
| `periode` | `periodeLabel` | helpers temporels |

**Toute nouvelle variable consommée par un helper AV doit être ajoutée au patch `buildScript()` de `build-payload-cache.mjs`** (lignes ~192-270). Sans ça, le bench local diverge silencieusement de la PROD : le helper voit `undefined` en local et tourne avec son fallback, alors qu'en PROD n8n la variable existe et le helper s'active normalement.

### 36.3 Helpers utilitaires Sprint B (notes 301-302, 21/05/2026)

Outre les pré-calculs spécifiques par sprint AV.X (`_phxXxxSignals`), le moteur expose désormais des **helpers de lecture utilitaires** appelables par n'importe quel sprint AV. Ces helpers ne modifient pas le scoring directement : ils encapsulent des conversions doctrinales (étiquettes → scores, filtres temporels, etc.) en restant PROD-safe (self-contained, pas de `process`/`require`/`fs`).

#### Note 301 — Dignité essentielle (`_phxDigniteEssentielleScore`, `_phxDigniteSolMC`)

`_phxDigniteEssentielleScore(natalDict, planetName)` convertit `natalDict[planète].dignite` (string "Domicile" / "Exaltation" / "Triplicité" / "Pérégrin" / "Exil" / "Chute") en un objet `{ score, label, isStrong, isWeak, isAmbivalent }` selon la table Lilly CA III ch. 12 :

| Étiquette MDSE | Score | Tag |
|---|---|---|
| Domicile (Rulership) | +5 | isStrong |
| Exaltation | +4 | isStrong |
| Triplicité | +3 | isStrong |
| Terme (Bound) | +2 | — (non exposé par natalDict.dignite simple) |
| Face (Decanate) | +1 | — (idem) |
| Pérégrin | 0 | isAmbivalent |
| Chute (Fall) | -4 | isWeak |
| Exil (Detriment) | -5 | isWeak |

`_phxDigniteSolMC(payload)` agrège la dignité du Soleil et du Maître M10 (via `_houseLords[10].maitre`) et retourne `{ soleil, maitreM10, maitreM10Dignite, scoreMax, scoreMin, isStrong, isWeak, isAmbivalent }`. Convention :
- `isStrong = scoreMax >= 3` (au moins l'un des deux significateurs solaires en triplicité+)
- `isWeak = score(Sol) <= -4 AND score(MaîtreM10) <= -4` (les deux en débilité, prudent Morin AG XVI)
- `isAmbivalent = !isStrong && !isWeak`

**Sources** : Lilly CA III ch. 12 ; Bonatti DA tract. 3 ch. 5 ; Morin AG XVI Determinatio ; Dykes (Bonatti tr., Cazimi Press 2007).

**Consommation** : AV.A clause α-V2 ARC (note 304) — lève l'ambivalence MAL_HARD ARC sur Hyleg. Réutilisable pour tout helper futur nécessitant un score de dignité (AV.D FINANCE_UP, AV.H V4, etc.).

#### Note 302 — Directions Primaires runtime (`_phxDPActivesPourEvent`, `_phxBestDPHit`)

`_phxDPActivesPourEvent(payload, eventDate, opts)` filtre `payload._mdsePrimaryDirections` (pré-calculé MDSE bloc P42 ligne ~5954 du `N8N Prev`) sur `orbDegMax` (défaut 0.3°) ou `orbYearsMax` (défaut 0.5 an). Retourne le tableau trié par orbe croissant.

`_phxBestDPHit(payload, promissor, aspect, significator, opts)` recherche la meilleure DP partile pour un (promissor/aspect/significator) donné, listes acceptées. Normalisation automatique "Carré" / "Carre". Retourne `null` si absent.

**Système de calcul MDSE** : semi-arc équatorial avec clé Naibod (0.9856°/an), ascension droite (RA) pour MC/IC, ascension oblique (OA) pour Asc/Sol/Lune au pôle géographique, descension oblique (OD) pour DSC. C'est doctrinalement **proche du Régiomontanus** (pôle géographique constant), pas du **Placidus mundane strict** (qui exigerait un pôle propre par promissor). Le commentaire MDSE ligne 30656 qui mentionne "Placidus mundane" est trompeur — la réalité du code P42 est Régiomontanus-Naibod. Accepté par la tradition (Lilly CA III "Of Directions").

**Sources** : Ptolémée Tetrabiblos III.10-14 ; Lilly CA III "Of Directions" ; Morin AG XXIII ; Bonatti DA tract. 8 ; Naibod, Enarratio elementorum astrologiae (1574).

**Consommation** : aucune dans le moteur en date du 21/05/2026 (V3 AV.H archivée). Disponible pour reprises futures (AV.H V4+, AV.D, etc.) sans rebuild de cache.

#### Note 303 — Profection mensuelle à event_date (`_phxProfectionMensuelleAtEvent`)

`_phxProfectionMensuelleAtEvent(payload, eventDate)` retourne la profection mensuelle au **mois calendaire de l'événement** (pas seulement le début de période dans `_profections.mensuelle`). Priorité au cache `_profectionMensuelleEvent` ; sinon calcul inline depuis `_dateNaissance` + `_profections.annuelle.maison` + `_houseLords`.

**Sources** : Valens Anthologies IV ; Paulus Alexandrinus ch. 29 ; Brennan "Hellenistic Astrology" ch. 9.

**Consommation prévue** : reprise AV.D FINANCE_UP (profession M2/M8 **mensuelle**), AV.H V4 (M10/M12 mensuelle).

**Vérification cache** :
```bash
node scripts/dtc/verify-payload-cache-bfull.mjs --only={caseId}
```

### 36.4 Procédure d'ajout d'une nouvelle variable au cache

1. **Identifier la variable globale du MDSE** dans `FRA/PREV/N8N Prev` (ex : `progressionsRaw`, `natalHouses`, etc.).
2. **Ajouter une ligne d'exposition** dans le patch `buildScript()` de `build-payload-cache.mjs` :
   ```js
   finalOutput[0].json._maNouvelleVar = typeof maNouvelleVar !== 'undefined' ? maNouvelleVar : null;
   ```
3. **Rebuild les payloads concernés** :
   ```bash
   cd SITE && npx dotenv -e .env.local -- node scripts/dtc/build-payload-cache.mjs --force --only={caseId}
   ```
   ou bench complet (4-5h pour 150 cas) :
   ```bash
   cd SITE && npx dotenv -e .env.local -- node scripts/dtc/build-payload-cache.mjs --force --baseline-100
   cd SITE && npx dotenv -e .env.local -- node scripts/dtc/build-payload-cache.mjs --force --baseline-150-extension
   ```
4. **Vérifier la présence en cache** :
   ```bash
   node -e "const p=JSON.parse(require('fs').readFileSync('scripts/dtc/payloads-cache/{caseId}.json'));console.log(typeof p._maNouvelleVar)"
   ```
5. **Vérifier la consommation locale** : lancer `node scripts/dtc/poc-dtc-local.mjs --only={caseId} --debug` et confirmer que le helper voit la variable.
6. **Smoke deploy PROD-safe** : `npm run dtc:deploy-smoke` pour confirmer que `_dtcError : ✓ aucune erreur` (PROD reçoit déjà la variable via n8n natif, pas besoin de la modifier).
7. **Bench Juge de Paix** : `node scripts/dtc/_juge-de-paix.mjs --diff` pour mesurer l'effet.

### 36.5 Sprint B-full — rebuild cache (21/05/2026)

Extension `build-payload-cache.mjs` (patch `buildScript()` + post-build `enrichProfectionMensuelleEvent`). **Rebuild obligatoire** pour les 150 cas baseline Juge de Paix :

```bash
cd SITE && npx dotenv -e .env.local -- node scripts/dtc/build-payload-cache.mjs --force --baseline-100
cd SITE && npx dotenv -e .env.local -- node scripts/dtc/build-payload-cache.mjs --force --baseline-150-extension
node scripts/dtc/verify-payload-cache-bfull.mjs   # doit afficher 0 KO sur les 150
```

Durée estimée : ~20-40 min (API n8n + VM locale par cas), jusqu'à 4-5h si erreurs/re-fetch.

---

## 37. Méthodologie d'ajout d'un nouveau JDD (jeu de données)

À mesure que les sprints AV se multiplient et que la doctrine se raffine, **étendre la baseline avec de nouveaux cas devient régulièrement nécessaire** (ex : passer de 150 à 200 cas pour stabiliser les statistiques sur les codes rares comme SCANDALE/HÉRITAGE/RELOCATION).

### 37.1 Étapes obligatoires

1. **Identifier les natifs candidats** : figures publiques avec événement majeur documenté, rating Astro-Databank AA ou A obligatoire (cf. section 33.1).
2. **Construire les blocs `prev_business_fields` + `validation`** (cf. sections 33.2 et 33.3) : event_date précise, code_attendu arbitré, codes_attendus_alt, audit_notes.
3. **Sub-agent de validation** (Opus 4.7) : vérification croisée des dates événement (Wikipedia / Britannica / IMDb / Billboard / royal.uk) et des ratings AA/A.
4. **Ajout au manifest** : insertion dans `runs[]`, mise à jour de `_meta.total` et `_meta.breakdown_codes`.
5. **Exécution PROD n8n une fois par cas** (pour générer les exec IDs et les NDJSON sources) :
   ```bash
   # Via mini-bench batch (recommandé) ou commande PREV individuelle.
   # L'exec doit être complète (status=success) pour que build-payload-cache.mjs trouve les données.
   ```
6. **Build du cache local** :
   ```bash
   cd SITE && npx dotenv -e .env.local -- node scripts/dtc/build-payload-cache.mjs --only={caseId}
   ```
   ⚠️ **Important depuis juin 2026** : le payload doit inclure **toutes les variables consommées par les helpers AV** (cf. section 36.2). Si on ajoute un cas en cache sans une de ces variables, le helper AV correspondant verra `undefined` et tournera en mode dégradé sur ce cas (silencieusement). Vérifier après build :
   ```bash
   node -e "const p=JSON.parse(require('fs').readFileSync('scripts/dtc/payloads-cache/{caseId}.json'));console.log('arc-ready:',typeof p.progressionsRaw?.age==='number','| profections:',!!p._profections?.annuelle,'| natalDict:',Object.keys(p._natalDict||{}).length>10,'| lent:',Object.keys(p._aspectsSuiviLent||{}).length>50,'| lords:',!!p._houseLords?.[7]?.maitre)"
   ```
   Tous les booléens doivent être `true`.
7. **Bench de validation** unitaire : `node scripts/dtc/poc-dtc-local.mjs --only={caseId} --debug` — vérifier que le top-5 contient le code attendu (ou comprendre pourquoi pas).
8. **Bench Juge de Paix** : si le cas entre en baseline, le Juge de Paix doit être relancé pour mesurer l'impact sur les agrégats BLOC A / BLOC B.

### 37.2 Variables critiques du cache (à vérifier systématiquement)

Pour un cas baseline post-juin 2026, ces champs **doivent** être présents et non-vides dans le payload-cache JSON :

| Champ requis | Vérification |
|---|---|
| `_natalDict` | ≥ 10 entrées avec `.deg` numérique (10 planètes + Asc/MC minimum) |
| `_aspectsSuiviLent` | ≥ 50 clés (transits Sat/Ura/Nep/Plut + Jup, avec `waves` non vides) |
| `_houseLords[N].maitre` | Renseigné pour N ∈ {1, 4, 5, 7, 8, 10} minimum |
| `_profections.annuelle.maison` | Entier 1-12 |
| `_profections.annuelle.seigneur` | Nom planète tradition (Sat/Jup/Mars/Sol/Vén/Merc/Lune) |
| `_profections.annuelle.maison_seigneur` | Entier 1-12 |
| `_profections.mensuelle.seigneur` | Renseigné (Sprint B-full) |
| `_profectionMensuelleEvent.maison` | Renseigné si `event_date` dans manifest |
| `_dateNaissance` | Chaîne non vide (JJ/MM/AAAA ou ISO) |
| `_mdseMonthlyProfActive` | Tableau 1-12 entiers |
| `progressionsRaw.age` | Décimal cohérent avec event_year - birth_year (typiquement ±0.5) |
| `_isDayChart` | Booléen |
| `_natalHouses` | Tableau 12 entrées avec `segments[].type === "Cuspide"` |
| `eventSignatures` | Tableau d'objets `{code, confidence, ...}` ≥ 14 codes |
| `periode` | Chaîne "01 janvier YYYY au 31 décembre YYYY" |

### 37.3 Conséquence pratique : ne PAS construire un cache "à la main"

Le payload-cache est un objet d'**~500 KB par cas** avec des centaines de champs interdépendants. Il est techniquement impossible de le construire manuellement sans casser quelque chose. **La seule voie reproductible est `build-payload-cache.mjs`** qui fait tourner le `N8N Prev` MDSE en VM locale sur les données brutes de l'exec n8n PROD.

Si `build-payload-cache.mjs` échoue pour un cas (variable globale `xxx is not defined`, structure inattendue, etc.), la cause est soit :
1. **L'exec PROD est incomplète** (timeout, erreur middleware) → relancer la commande PREV en PROD avant de rebuilder.
2. **Le `N8N Prev` MDSE a évolué** et expose des variables différemment → mettre à jour `buildScript()` patch dans `build-payload-cache.mjs`.
3. **Une nouvelle variable est consommée par DTC** sans être exposée dans le patch → ajouter au patch (cf. section 36.3).

Le test ultime de cohérence cache ↔ PROD est le `smoke deploy` :
```bash
npm run dtc:deploy-smoke
```
qui exécute un cas réel en PREPROD n8n et vérifie que `_dtcError : ✓ aucune erreur`, `DTC moteur tourne : ✅`, `Rerank DTC appliqué : ✅`. Si le smoke passe et que le bench local diverge, c'est un bug du build-payload-cache, pas un bug du moteur.

---

## 38. Registre des faux positifs — baseline 150 (FP-V1, juin 2026)

Le Juge de Paix mesure si la **signature primaire** est en top-N, mais le moteur remonte souvent **3 à 5 codes crisis ou génériques** dans le top5 (DEUIL, SANTE_DOWN, ACCIDENT, HÉRITAGE, SEPARATION…) alors que l'événement JDD est positif (mariage, carrière, enfant). Ces codes polluent le reranker LLM et masquent le diagnostic.

### 38.1 Fichiers

| Fichier | Rôle |
|---|---|
| `SITE/scripts/prev-bench-baseline-150-fp-v1.json` | Registre autonome (150 entrées, généré) |
| `SITE/scripts/prev-bench-baseline-150-fp-README.md` | Schéma + commandes |
| `SITE/scripts/prev-bench-baseline-150-v1-manifest.json` | Manifest enrichi : `validation.faux_positifs_probables[]` par run |

### 38.2 Génération et fusion

```bash
cd SITE
node scripts/dtc/build-baseline-150-fp-audit.mjs      # DTC annuel + détection FP
node scripts/dtc/merge-fp-audit-into-manifest.mjs     # injection manifest (+ .bak)
node scripts/dtc/build-baseline-150-fp-audit.mjs --stats-only
```

Critère auto V1 : tout code du **top10 moteur** absent de `{code_attendu, codes_attendus_alt, compound}` → FP `certain` (top5) ou `probable` (rang 6-10). Chaque entrée documente `justification_jdd`, `mecanismes_moteur` (criseFloor, aggressorLock, empilement_tier_eleve…), `declencheurs_cles`, `pistes_correctif`. `revue_humaine: a_faire` tant que non validé.

### 38.3 Première mesure (mai 2026, moteur hash ~910b7a24)

- **100 %** des 150 runs ont ≥1 FP en top5 (bruit structurel du spread v19).
- **570** entrées FP top5 cumulées ; codes les plus fréquents : **HÉRITAGE**, **DEUIL**, **SANTE_DOWN**, **SEPARATION**, **ACCIDENT**.
- Mécanismes dominants : `empilement_tier_eleve`, `stationBoost`, `ceremonial_MARIAGE_bleed`, `eclipseHouseBoost`, `ACCIDENT_sans_agresseur`.

Exemple **prince-william-1982 / 2011** (mariage) : top5 moteur = `MARIAGE, SEPARATION, DEUIL, RELOCATION, SANTE_DOWN` — seul MARIAGE est JDD ; les quatre autres sont des FP documentés.

### 38.4 Phase FP-V1 livrée (21/05/2026, hash `fec06f9a0a44`)

**Moteur** (`DTC_NO_PHASEFP=1` pour bench A/B) :

1. **criseFloor DEUIL** resserré : Saturne/Pluton sur Lune + maître M4/M8 **et** (profection deuil M4/M8/M12 ou hit sur maître M4/M8) — plus Lune+Mars seuls sur année mariage.
2. **fpV1CeremonyCap** : si `MARIAGE` top1 ≥ 95 → plafond 90 sur `DEUIL`, `SANTE_DOWN`, `ACCIDENT` (exempt si `_phxProfDEuilActive` strict M8/M12, pas lord-in-M4).
3. Plafond ACCIDENT post-empilement **archivé** (régression TOP5 −4 pp) ; haircut ×0.3 agresseur conservé en legacy.

**Juge de Paix** (baseline 150 annuel) :

| Métrique | Avant FP-V1 | Après FP-V1 | Δ |
|----------|-------------|-------------|---|
| BLOC A TOP5 | 123/150 (82,0 %) | **125/150 (83,3 %)** | **+2,0 pp** |
| BLOC B TOP5 | 227/413 (55,0 %) | 230/413 (55,7 %) | +0,7 pp |

Ex. **Kate / William 2011** : top5 sans `DEUIL`/`SANTE_DOWN` parasites (`MARIAGE` + alts cohérents).

**Suite** : revue humaine registre FP → sprint FP-V2 (HÉRITAGE, SEPARATION, spread v19).

---

## 39. CHANGELOG — Note 314 Mesure ISO (2026-05-22)

### 39.1 Standard release

- **KPI client unique** : `eventSignatures` PREPROD (`npm run dtc:juge-preprod` ou `npm run dtc:bench-iso` à parité 100 %).
- **Interdiction** : tout % « client » issu de `poc-dtc-local` seul, `finalizeClientScores`, ou Juge de Paix JDD avec `_dtc_meta`.
- **Exports n8n** : `_dtcPayloadSnapshotForBench`, `_sigPayloadPreDtc`, `_dtcFinalScoresForBench` (via `dtc-sync-to-supernode.mjs`).
- **Cache** : `SITE/scripts/dtc/payloads-cache-iso/` alimenté par `dtc:juge-preprod-run`.
- **Replay local** : `SITE/scripts/dtc/dtc-client-replay.mjs` + `bench-iso-150.mjs`.

### 39.2 Jalonnage baseline 150 (PREPROD, hash `af4bc09b3173`, 2026-05-22)

| Métrique | BLOC A (primaire) | BLOC B (cumulé) |
|----------|-------------------|-----------------|
| TOP1 client | 30/150 = **20,0 %** | 56/413 = **13,6 %** |
| TOP5 client | 88/150 = **58,7 %** | 178/413 = **43,1 %** |
| TOP5 DTC exec (diag.) | 97/150 = 64,7 % | 201/413 = 48,7 % |

Source : `npm run dtc:juge-preprod` sur `prev-bench-baseline-150-preprod-v1.ndjson`.  
Gate ISO validée : **10/10** cas bit-identical (`npm run dtc:bench-iso-gate` sur cache partiel).  
Refresh complet 150 en cours : `npm run dtc:juge-preprod-run --force`.
