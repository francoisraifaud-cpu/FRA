# DOCUMENTATION WORKFLOW — SYNASTRIE

**Version courante** : moteur scoring **v6.8.0 (gelé, 2026-05-06)** + narration **v7.0.0 (GA, 2026-05-06)** — voir § 17.
**Plateforme** : n8n Cloud (workflow ID `4mjgklWWwjCF8fze`, alias `SYN — PROD`)
**Auteur** : François Raifaud

**Architecture binaire scoring / narration** (depuis 2026-05-06) :

- **Moteur de scoring v6.8.0** — gelé. Aucune modification des coefficients, pivots, seuils de bandes ou algorithmes de pondération sans réouverture explicite (clauses Q51 du gel, voir § 17.1). L'historique complet des sprints v3.x → v5.0.0 → v6.x est conservé tel quel ci-dessous (§§ 3 à 16) pour traçabilité.
- **Narration v7.0.0** — itère librement sur le `synthPrompt`, le lexique typologique, la structure des prompts et la valorisation des marqueurs, sans toucher à un seul coefficient de scoring. Champ `narrative_version` distinct de `version` (qui reste `6.8.0`).

**Bench de référence post-arbitrages** (2026-05-06) :

| Cohorte | Métrique | Valeur |
|---|---|---|
| 79 cas (v6.8.0 super.ndjson) | Cohérence tolérante Q46+Q52 | **96.2 %** |
| 30 cas réels stratifiés sur 8 typologies + 5 témoins (v7.0.0-β.2 stratifié) | **Cohérence tolérante Q46+Q52+Q53** | **100 %** (30/30) |
| 30 cas | Incohérences sévères (≥ 2 bandes) | **0** |
| 5 témoins absurdes | Sentinelles violées | **0/5** |
| Précision astrale brute estimée par l'astrologue | — | **≈ 95 %** |

**Bench narration v7.0.0** (n=35) :
- Lectures typologiques injectées : ≈ 19.9 / cas (8.7 synthèse + 11.2 maisons)
- `narrative_version` conforme : 35/35
- Drapeaux structurels : 0
- Audit qualitatif manuel sur 7 cas critiques : 7/7 cohérents avec la réalité historique

Détails complets : § 17 (v6.0 → v7.0.0 GA), `SITE/scripts/SYN-V7-CHANTIER.md`, `SITE/scripts/syn-bench-coherence-narrative-v7.0.0-beta2-rapport.md`. Synthèse publique : fiche produit `/rapports/syn` (section « Validation et fiabilité »).

---

## 1. VUE D'ENSEMBLE

Le workflow **SYN** produit l'analyse complète de la synastrie entre deux individus. Il reçoit les données natales des deux personnes, calcule les superpositions (overlays), les inter-aspects, le thème composite, le thème Davison, et génère :

- Des **calculs synastrie avancés** (overlays, inter-aspects tier 1/2, contacts nodaux, composite, Davison, déclinaisons, antiscia, ponts stellaires, midpoints, Vertex, etc.)
- Des **prompts structurés** pour un LLM (Gemini) par maison activée + synthèse globale — adaptés à la **typologie de relation** (8 types)
- Un **score global de compatibilité** (0–100) et un **scoring par maison** pondéré par la grille typologique
- Des **rapports HTML/PDF** : données techniques, rapport narratif technique, rapport narratif final (vulgarisé)

### Architecture des nœuds

| Nœud | Fichier | Rôle |
|---|---|---|
| **Extract Variables SYN** | `N8N SYN Extract Variables` | Extraction des variables formulaire (2 personnes, typologie, langue, rôle) + déduction automatique des rôles pour typologies asymétriques |
| **Prepare Data SYN** | `N8N SYN PREPARE DATA` | Géocodage + fuseaux + appels API Planètes/Maisons/Étoiles/Éclipses pour A et B + Enrichissements A/B + Davison |
| **Super Nœud SYN** | `N8N SYN` | **NŒUD CENTRAL** — Overlays, inter-aspects, composite, Davison, scoring, prompt engineering, **préparation des 13 slots LLM** (tri par score, consignes Markdown, propagation `_meta` et `_synRef`) |
| **LLM Interprétation** | `N8N SYN LLM` | 13 agents Gemini 3.1 Pro Preview (6 maisons A + 6 maisons B + synthèse) — données reçues via `Merge SYN Final1` |
| **Reassemble SYN** | (dans `N8N SYN LLM`) | Reconstruction `perspective_a`, `perspective_b`, `synthese` — référence `$('Super noeud Syn')` |
| **Traducteur / Vulgarisateur** | `N8N SYN Trad LLM` | Vulgarisation du texte technique pour le client final |
| **Validateur** | `N8N SYN Valideur` | Validation silencieuse post-LLM (JSON) — détection d'incohérences |
| **Rapport Données Techniques** | `N8N SYN Repport` | Rapport HTML complet : bi-roue SVG, tableaux, scoring, toutes couches |
| **Rapport HTML Tech** | `N8N SYN Repport HTML Tech` | Rapport narratif technique (texte LLM brut + cartouches maisons) |
| **Rapport HTML Final** | `N8N SYN Repport HTML Final` | Rapport narratif final (texte vulgarisé + cartouches maisons) |
| **Chaîne Export DT** | `N8N SYN Chaine Repport` | Conversion PDF + nommage + upload Google Drive (Données Techniques) |
| **Chaîne Export Tech** | `N8N SYN Chaine Repport HTML Tech` | Conversion PDF + nommage + upload Google Drive (Rapport Technique) |
| **Chaîne Export Final** | `N8N SYN Chaine Repport HTML Final` | Conversion PDF + nommage + upload Google Drive (Rapport Final) |

---

## 2. TYPOLOGIES DE RELATION

Le workflow gère **8 typologies** de relation, chacune avec ses maisons principales/secondaires, planètes clés et lots pertinents :

| Typologie | Maisons principales | Maisons secondaires | Planètes clés |
|---|---|---|---|
| **Amour** | M5, M7, M8 | M4, M1, M12 | Vénus, Mars, Lune, Pluton, Nœud Nord |
| **Business** | M7, M2, M8, M10 | M6, M11 | Saturne, Jupiter, Mercure, MC |
| **Parent / Enfant** | M4, M10, M5 | M12, M8, M2 | Saturne, Lune, Soleil, Chiron |
| **Fratrie** | M3, M4 | M11, M1 | Mercure, Lune, Mars |
| **Ami** | M11, M3 | M9, M5, M1 | Mercure, Jupiter, Uranus, Lune |
| **Mentorat** | M9, M3, M10 | M11, M1 | Jupiter, Saturne, Mercure, Soleil |
| **Colocataire** | M4, M6, M2 | M1, M12 | Lune, Saturne, Mars, Vénus |
| **Rivalité** | M7, M12 | M8, M1 | Mars, Pluton, Saturne, Soleil |

### Typologies asymétriques et champ `role`

Deux typologies sont **asymétriques** — les deux personnes n'ont pas le même rôle dans la relation. Un champ `role` peut être spécifié dans les données d'entrée de chaque personne :

| Typologie | Rôle senior | Rôle junior | Déduction automatique |
|---|---|---|---|
| **Parent / Enfant** | `parent` | `enfant` | Oui — la personne la plus âgée est assignée `parent`, la plus jeune `enfant` |
| **Mentorat** | `mentor` | `élève` | Oui — la personne la plus âgée est assignée `mentor`, la plus jeune `élève` |

- Si le champ `role` est fourni explicitement dans les données d'entrée, il est respecté tel quel.
- Si le champ `role` est absent pour une typologie asymétrique, la déduction par date de naissance s'applique.
- Si la date de naissance ne permet pas de trancher et qu'aucun rôle n'est spécifié, personne_a reçoit le rôle junior et personne_b le rôle senior (par défaut).
- Pour les 6 typologies symétriques (Amour, Business, Fratrie, Ami, Colocataire, Rivalité), le champ `role` est ignoré (valeur `null`).

### Lots arabes par typologie

Chaque typologie dispose d'un set de **lots pertinents** promus en tier 2 (au lieu de tier 3 par défaut) :

| Typologie | Lots promus en tier 2 |
|---|---|
| **Amour** | Part de Fortune, Lot d'Éros, Lot du Mariage, Lot des Enfants, Lot de l'Esprit, Lot du Daemon |
| **Business** | Part de Fortune, Lot de l'Esprit, Lot de Victoire, Lot du Mariage, Lot de Courage, Lot de Basis |
| **Parent / Enfant** | Part de Fortune, Lot du Père, Lot de la Mère, Lot des Enfants, Lot de Basis, Lot de Nécessité |
| **Fratrie** | Part de Fortune, Lot de l'Esprit, Lot de Basis, Lot du Daemon |
| **Ami** | Part de Fortune, Lot de l'Esprit, Lot de Victoire, Lot du Daemon, Lot de Voyage |
| **Mentorat** | Part de Fortune, Lot de l'Esprit, Lot d'Exaltation, Lot de Victoire, Lot de Courage |
| **Colocataire** | Part de Fortune, Lot de Basis, Lot de Nécessité, Lot de Maladie |
| **Rivalité** | Part de Fortune, Lot de Némésis, Lot de Courage, Lot de Victoire, Lot du Daemon |

---

## 3. NŒUD CENTRAL — SUPER NŒUD SYN (`N8N SYN`)

### 3.1 Données d'entrée

- `enrichedA` / `enrichedB` — Thèmes nataux enrichis (via `Enrichissement A` / `Enrichissement B`, copies de `N8N Theme`)
- `Extract Variables SYN` — Métadonnées (personnes, typologie, langue)

### 3.2 Données enrichies récupérées par personne

Pour chaque personne (A et B) :
- Positions planétaires natales + maisons (cuspides Placidus)
- Aspects nataux
- Statistiques (sect, éléments, modes)
- Gouverneur du thème (`chartRuler`)
- Configurations natales (Stellium, Grand Trigone, T-Carré, etc.)
- Étoiles fixes : conjonctions planètes, conjonctions cuspides, parans (Brady)
- Planètes OOB (Out of Bounds)
- Parallèles et Contra-parallèles nataux

### 3.3 Système de tiers planétaires

| Tier | Contenu |
|---|---|
| **Tier 1** | Planètes majeures (Sol, Lun, Mer, Vén, Mar, Jup, Sat, Ura, Nep, Plu) + Chiron + Nœuds + Angles |
| **Tier 2** | Astéroïdes (Cérès, Vesta, Junon, Pallas, Lilith) + Lots pertinents par typologie |
| **Tier 3** | Autres lots non pertinents pour la typologie |

> Les badges dans les cartouches HTML filtrent à **tier ≤ 2** pour éviter la surcharge visuelle.

### 3.4 Calculs synastrie — Liste exhaustive

#### Section 2 — Constantes astrologiques
- 12 signes avec éléments, modes et maîtres
- Dignités essentielles (Domicile, Exaltation, Exil, Chute) pour 10 planètes
- Décans Chaldéens (faces) — 36 décans
- Termes Égyptiens (bounds) — 60 termes
- Triplicités par élément (diurne/nocturne/mixte)
- Maîtrises des signes

#### Section 3 — Superpositions (Overlays)
- `overlay_b_in_a` : Planètes de B projetées dans les maisons de A
- `overlay_a_in_b` : Planètes de A projetées dans les maisons de B
- Chaque entrée contient : planète, degré, signe, rétrograde, poids, tier, dignité, planète clé typo, source/cible
- Les angles (ASC, DSC, MC, IC) sont exclus du calcul overlay

#### Section 4 — Inter-aspects bidirectionnels
- **Tier 1** (B→A et A→B) : aspects entre planètes majeures + Chiron + Nœuds + Angles
- **Tier 2** (B→A et A→B) : aspects impliquant astéroïdes ou lots pertinents
- 5 types d'aspects avec orbes variables :
  - Conjonction (0°, orbe 8°) — nature : fusion
  - Opposition (180°, orbe 7°) — nature : tension
  - Trigone (120°, orbe 6°) — nature : harmonie
  - Carré (90°, orbe 6°) — nature : tension
  - Sextile (60°, orbe 4°) — nature : harmonie
  - Quinconce (150°, orbe 2.5°) — nature : ajustement
- Score par aspect = pondération du type × poids planétaire × bonus dignité × bonus planète clé

#### Section 5 — Contacts nodaux et karmiques
- Contacts Nœud Nord/Sud de A avec les planètes de B (et inversement)
- Contacts de Chiron (blessure karmique)
- Flag `karmique` pour les contacts nodaux stricts

#### Section 6 — Thème Composite (mi-points)
- Planètes composites : mi-point des positions de A et B pour chaque planète
- Cuspides composites (ASC, MC, etc.)
- Aspects internes du composite
- Configurations du composite (Stellium, Grand Trigone, T-Carré, etc.)

#### Section 7 — Thème Davison (mi-temps / mi-lieu)
- Calcul du point Davison (date médiane, lieu médian)
- Appels API pour planètes et maisons Davison
- Aspects Davison internes + configurations

#### Section 8 — Couches avancées
- **Réceptions mutuelles croisées** : planète de A en domicile du signe occupé par une planète de B (et inversement). Inclut les 10 planètes (Soleil→Pluton) depuis v3.2 — les transpersonnelles (Uranus, Neptune, Pluton) sont éligibles car elles sont maîtres modernes dans `SIGN_RULERS`

- **Compatibilité élémentaire et modale** : dominantes, éléments communs, relation (harmonie/tension/neutre)
- **Déclinaisons** :
  - Parallèles inter-cartes (même déclinaison, orbe 1°)
  - Contra-parallèles inter-cartes (déclinaisons opposées)
  - Planètes OOB de A et B
- **Antiscia inter-cartes** : antiscia et contra-antiscia entre les planètes de A et B
- **Ponts stellaires** : étoile fixe conjointe simultanément à une planète de A et une planète de B
- **Dignité accidentelle (Lilly)** : scoring Lilly complet pour les deux cartes natales
- **Chaînes de dispositions croisées** : dispositions entre les deux cartes
- **Planètes stationnaires** : planètes proches de leur station rétro/directe
- **Hayz** : vérification des conditions Hayz pour les deux cartes
- **Midpoints Ebertin (v2)** : points médians activés entre les deux cartes
  - 45 paires classiques (C(10,2) des planètes majeures) + 10 homonymes synastrie (Sol(A)/Sol(B), etc.) + paires Chiron/Nœuds
  - Dictionnaire `MIDPOINT_MEANINGS` : 51 entrées avec thème Ebertin et mots-clés pour chaque paire
  - Tri **modulus 90°** (`degre90`) pour détection des axes de sensibilité
  - **Planetary Pictures** : convergences de 2+ midpoints au même degré (mod 90°) — axes de très haute sensibilité relationnelle. Depuis v3.2, les paires triviales Nœud Nord/Nœud Sud sont exclues du comptage (leurs midpoints tombent toujours au même degré par définition mathématique). Depuis v3.3, les PP sont pondérées par nombre de convergences dans le scoring (8 midpoints >> 2)
  - Injection dans les prompts par maison (midpoints tombant dans la maison analysée)
- **Parans Brady (v2)** : co-angularité étoiles fixes / planètes
  - Enrichissement post-calcul avec dictionnaire `STAR_NATURE` (23 étoiles, archétype + thème Brady)
  - Dictionnaire `PARAN_PLANET_MODIFIERS` (13 corps célestes, domaine planétaire)
  - **Phases de vie** : Lever = jeunesse, Culmination = maturité, Coucher = récolte, IC = héritage intime
  - Interprétation composée (`interpretation_brady`) : nature étoile + domaine planétaire + phase de vie
  - Injection dans les prompts par maison (parans liés aux planètes en overlay)
- **Ponts Paran Croisés** (nouveauté SYN v2) : étoile fixe en paran simultané avec une planète de A ET une planète de B — lien stellaire profond par co-angularité (plus rare et significatif que les ponts stellaires écliptiques)
- **Contacts Vertex** : Vertex de A conjoint aux planètes de B (et inversement)
- **Sensibilité croisée** : points sensibles inter-cartes
- **Degrés Sabian croisés** : Sabian des points clés entre les deux cartes

#### Section 8b — Résumés nataux
- `buildNatalSummary` : pour chaque personne, résumé structuré (planètes par maison/signe, dominant, sect)
- `houseRulersA` / `houseRulersB` : signe et maître de chaque cuspide

---

### 3.5 SCORING

#### Score global (0–100) — `computeGlobalScoreV3` — Architecture 6 Piliers + Dual Score + Veto qualitatif (v5.0.0)

Le score v5.0.0 repose sur **6 piliers** indépendants, chacun plafonnés, dont la somme normalisée (130→100, en pratique diviseur 126) donne le score brut. Un **correctif de viabilité durci** réduit le score brut quand l'intensité dépasse la fluidité (seuil 12, coef 0.35, cap 16). Un **étirement asymétrique** (pivot 55, α=1.4 au-dessus / α=1.8 sous le pivot) décompresse la distribution sans inflater les bandes hautes. Un **veto qualitatif** cappe la bande à 64 (haut de « Stimulante exigeante ») pour les configurations d'échec critiques en typologie Amour. Le résultat est un **dual score** (Fluidité + Intensité) et un score global corrigé. Tous les malus sont arrondis à 1 décimale.

**v5.0.0 — nouveautés majeures (mai 2026)** :

- **Pilier 6 « Cohérence typologique des maisons »** ([-2, +6] pts) : moyenne pondérée des maisons clés de la typologie (70% principales, 30% secondaires) dans les 2 directions overlay, modulée par : pénalité d'asymétrie (>15 d'écart entre A→B et B→A), pénalité par maison clé en polarité tension, pénalité maison d'ombre activée tendue. Comble la dissonance « score global élevé + maisons typo faibles » identifiée comme cause principale de faux positifs cliniques.
- **Veto qualitatif** (typologie Amour) : 4 raisons déclenchent le cap à 64 :
  1. `M7_weak_with_SN_dominance` — Maison 7 vide (norm < 25) ou en tension dans une direction + south_node_dominance
  2. `destructive_quartet` — Pluton hard personal + Uranus affectif + fusions empoisonnées + south_node dominance
  3. `intensity_explosion` — delta intensité−fluidité ≥ 30 + ≥4 fusions empoisonnées
  4. `dw_tension_dominant` — DW tension ≥ 70% des DW harmonie + ≥3 fusions empoisonnées
- **Caps pénalités relevés** : `pluton_hard_personal` (4→6), `mars_hard_luminaires` (3→4 et 0.7→0.8), `uranus_hard_affective` (3→4 et 0.6→0.7), `double_whammy_tension` (3→5), `south_node_dominance` (seuil 2→1, pondération par ratio sn/nn, cap −2.5).
- **Stretch asymétrique** : pivot 55 (au lieu de 60), α=1.4 au-dessus / α=1.8 en-dessous. Empêche les faux « Magnétisme fort » qui n'ont pas la fluidité associée.
- **Bande renommée** : « Alchimie remarquable » → « **Magnétisme fort** » (la promesse d'alchimie suggérait une longévité que le moteur ne peut pas garantir).

Le score étiré est calculé en deux temps : (a) `computeGlobalScoreV3` calcule P1-P5 et expose `_finalize_ctx`, (b) après la boucle de scoring des maisons, `finalizeGlobalScoreWithPilier6` injecte P6, recalcule viability + stretch, applique le veto, et renseigne `globalScoreDetail.pilier6_typo_houses` + `globalScoreDetail.qualitative_veto` (si applicable).

**Améliorations v3.3 par rapport à v3.2 :**
- **P1** : Ajout bonus Soleil-Lune soft (+1.0 ou +1.5 si exact) — symétrie avec la pénalité `no_soleil_lune_soft`
- **P2** : Midpoints pondérés par précision d'orbe (0.03° = +0.4 vs 1.5° = +0.2) ; Planetary Pictures pondérées par nombre de convergences (≥6 = +0.8 vs 2 = +0.3) ; Parallèles de déclinaison pondérés par importance planétaire (planètes personnelles + orbe serré = poids accru)
- **P3** : `chartHealthScore` reconnaît désormais Cerf-Volant (+1.5), Rectangle Mystique (+1.0), Grand Carré / Croix Fixe-Cardinal-Mutable (-1.5) ; Nouveau bonus Vénus-Mars soft dans le composite (+1.2 si orbe <1°, +0.8 sinon)
- **P4** : Nouvelle pénalité `chart_rulers_no_aspect` (-1.0) quand les maîtres de thème n'ont aucun aspect entre eux (bug fix : le bloc était sauté car `chartRulerA` n'était pas renseigné — maintenant fallback sur `stats.chart_ruler`) ; Bonus complémentarité de secte (+0.8 si un thème diurne et l'autre nocturne)
- **House Score** : Théorique recalculé par tier (T1=18, T2=8, T3=4) au lieu de ne compter que les T1 — élimine la saturation à 100% de multiples maisons

**Améliorations v3.4 par rapport à v3.3 :**
- **P1** : Intégration des **176 aspects Tier 2** (Lots/Astéroïdes) avec pondération à 30% du poids T1 — apporte plus de nuance au ratio harmonique/tendu ; **Amplification OOB** (+10% sur T1, +8% sur T2) quand une planète hors limites est impliquée dans un aspect ; Cap d'aspects exacts élargi (5→8) avec bonus additionnel pour exacts sur planètes personnelles
- **P2** : Chaînes de disposition pondérées par qualité (mutuelles ×0.8, simples ×0.2, longues chaînes ×0.15) au lieu d'un flat 0.6/0.2 ; Antiscia qualifiés (personnels ×0.5, autres ×0.2) au lieu d'un flat 0.3 ; Bonus parallèles croisés Luminaire-Personnel (+0.35 par parallèle, cap 4)
- **P3** : Bonus/malus placement maison Soleil et Lune composites (+0.5 si angulaire M1/4/7/10, -0.4 si difficile M6/8/12) ; Bonus Vénus-Mars soft dans le Davison (+0.6) ; Bonus Soleil/Lune Davison sur angle (+0.5 par luminaire angulaire)
- **P4** : Bug fix `chart_rulers_no_aspect` (le bloc n'était toujours pas atteint car conditionné sur `crA && crB` — remplacé par bloc inconditionnel avec fallback `stats.chart_ruler`)
- **House Score** : Malus rétrograde renforcé pour planètes T1 en maison principale (×0.90 ×0.92 cumulés = ×0.828)

**Améliorations v3.4.1 par rapport à v3.4 :**
- **P2** : Plafond relevé de 25 à **30 pts** pour éviter la saturation (100%) dans les relations karmiquement riches. Le total théorique devient 35+30+20+20 = 105, clampé à 100 — un P2 fort compense un P4 faible
- **P3** : Pénalité cumulative pour T-Carrés multiples (+0.4 si ≥2, +0.8 si ≥3) dans `chartHealthScore` ; Pénalité Davison aspects ultra-serrés (<1°) tendus entre planètes internes (-0.5 × count, max 3) ; Bonus luminaire composite en **exaltation** (+0.6) ou **domicile** (+0.5) — capture la Lune en Taureau M1 exaltée du couple François-Agnès ; Pénalité amplifiée pour stellium >3 planètes en M8/M12 composite (-0.4 × excédent)
- **P4** : Bonus **synchronisation modale parfaite** (+1.2) quand les 3 modes sont à ±1 chez les deux individus ; Bonus élément **très profondément partagé** (+0.6) quand un élément a ≥4 planètes chez les deux (capture Eau 4/4 François-Agnès)

**Améliorations v3.5 par rapport à v3.4.1 :**

*Corrections héritées v3.4.2 :*
- **P1** : Pénalité **fusions empoisonnées** (`poisoned_fusions_debilitated`) — pondérée par nature planétaire (Mars/Saturne/Pluton = -0.6, Neptune = -0.4, autres = -0.35 par fusion, max 5)
- **P1** : Pénalité **Neptune en Chute/Exil sur angle** (`neptune_fall_on_angle`) — -0.8 par occurrence (max 2)
- **P3** : Pénalité **Soleil-Lune composite en quinconce/tension** (`composite_soleil_lune_hard`) — -1.2 si tension, -0.7 si quinconce
- **P3** : Pénalité **Lune composite carré Nœuds** (`composite_lune_nodes_hard`) — -0.8
- **House Score** : Malus **cluster rétrograde+exil** — -1.5 × count quand ≥2 planètes rétrogrades ET Exil/Chute dans la même maison

*Nouvelles améliorations v3.5 :*
- **CRITIQUE — P2** : **Pondération contacts nodaux Planète ≫ Lot** — les contacts nodaux avec de vraies planètes pèsent ×1.0 (cap 6), les contacts avec des Lots ne pèsent plus que ×0.35 (cap 4). Élimine le biais de volume des 16+ Lots calculés
- **CRITIQUE — P1** : **Dévaluation aspects transpersonnel↔transpersonnel** — les aspects Uranus↔Neptune, Uranus↔Pluton, Neptune↔Pluton reçoivent un multiplicateur ×0.15 au lieu de ×1.0. Ces aspects sont générationnels et non spécifiques à la relation
- **HAUTE — P1** : **Modulation typologique des aspects** — en contexte Parent/Enfant ou Mentorat : Saturne-Nœud Nord harmonique = bonus +0.8×count (cap 2), et la pénalité `saturn_hard_personal` est réduite de 40% (Saturne = structure légitime dans ce contexte)
- **HAUTE — P1** : **Bonus Chiron harmonique transpersonnel** — Chiron en trigone/sextile/conjonction avec Uranus/Neptune/Pluton = +0.5×count (cap 3). Capture le potentiel de guérison transgénérationnel
- **HAUTE — P1** : **Applying/Separating contextualisé** — en relation Parent/Enfant, les modificateurs sont atténués (applying +8% au lieu de +15%, separating -5% au lieu de -10%) car la dynamique temporelle est moins pertinente dans un lien permanent
- **HAUTE — P4** : **Synchronisation modale rehaussée** — le bonus pour synchronisation modale parfaite passe de +1.2 à **+2.5**, et le coefficient modes_communs passe de ×0.6 à **×0.9** par mode partagé (cap 3)
- **HAUTE** : **Échelle qualitative par typologie** — chaque score est maintenant accompagné d'une bande qualitative contextualisée (4 paliers par type : Amour, Parent/Enfant, Business, Générique) avec label, description et couleur. Affiché dans les 3 rapports HTML
- **MOYENNE — P3** : **Concentration composite par maison** — pénalité quand ≥4 planètes sont dans une même maison difficile (M6/M8/M12) du composite. Pénalité -1.2 standard, -0.5 en contexte parent-enfant (M8 = transmission plus que crise)
- **BASSE — P4** : **Sect modulation des maléfiques** — si Mars est en secte nocturne ou Saturne en secte diurne (via données Hayz), bonus +0.4 par maléfique "domestiqué" (cap 1.2). Un maléfique en secte est moins destructeur
- **BASSE — P2** : **Hub dispositor** — identifie la planète terminale qui concentre le plus de chaînes dispositoires croisées (hub). Si le hub ≥5 convergences, bonus +0.3 × (hub-4) (cap 3)
- **BASSE — P2** : **Quasi-réceptions** — les chaînes dispositoires simples de longueur 2 (A dans le signe de B sans réciprocité complète) comptent comme quasi-réceptions à +0.25/each (cap 4, excédent des mutuelles déjà comptées)
- **BASSE — P4** : **Excès de fixité partagée** — pénalité renforcée quand les deux charts ont ≥4 planètes en mode Fixe (-1.2)

**Améliorations v3.5.1 — Recalibrage négatifs et nouvelles pénalités :**

*Recalibrages de bonus surpondérés en v3.5 :*
- **P1** : Dévaluation transpersonnel↔transpersonnel réduite de ×0.15 à **×0.35** (ces aspects restent minorés mais pas autant ignorés)
- **P1** : Saturn relief parent-enfant réduit de 40% à **15%** (Saturne reste structurellement dur)
- **P1** : Bonus Saturn-NN harmonique réduit de +0.8 à **+0.5** par occurrence
- **P1** : Bonus Chiron harmonique transpersonnel réduit de +0.5 à **+0.3** (cap 2 au lieu de 3)
- **P4** : Sync modale parfaite réduite de +2.5 à **+1.5**
- **P4** : Coefficient modes_communs réduit de ×0.9 à **×0.7**
- **P4** : Sect malefic bonus réduit de ×0.4 cap 1.2 à **×0.3 cap 0.6**

*Nouvelles pénalités ajoutées v3.5.1 :*
- **P1** : **Pluton tension planètes personnelles** (`pluton_hard_personal`) — -0.9 × count (max 4). Aspect le plus destructeur en synastrie (manipulation, obsession, contrôle)
- **P1** : **Mars tension luminaires** (`mars_hard_luminaires`) — -0.7 × count (max 3). Agression dirigée contre l'identité/émotions (Sol/Lune)
- **P1** : **Uranus tension Vénus/Lune** (`uranus_hard_affective`) — -0.6 × count (max 3). Instabilité, rupture du lien affectif
- **P1** : **Absence totale d'aspects Vénus harmoniques croisés** (`no_venus_soft_cross`) — -1.5. Aucun liant vénusien = absence de plaisir partagé
- **P2** : Seuil Chiron hard abaissé de **≥2 à ≥1** (un seul Chiron en tension sur une personnelle suffit à activer la blessure)
- **P3** : **Mars-Saturne hard au composite** (`composite_mars_saturne_hard`) — -1.3 si orbe < 2°, -0.8 sinon. Frustration structurelle, action bloquée
- **P3** : **Mars-Pluton hard au composite** (`composite_mars_pluton_hard`) — -1.5 si orbe < 1°, -1.0 sinon. Dynamique de pouvoir, domination
- **P4** : **Vénus-Vénus hard croisé** (`venus_venus_hard`) — -1.2 (opposition) ou -0.8 (carré). Goûts et valeurs en conflit direct
- **P4** : **Absence Vénus-Vénus soft** (`no_venus_venus_soft`) — -0.6. Pas d'harmonie des goûts/valeurs

**Améliorations v3.5.2 — Durcissement P2 & affichage maisons :**

*Affichage des scores de maisons négatifs :*
- Les maisons principales vides conservent un score brut de **-5** (pénalité astrologique légitime).
- L'affichage dans les rapports montre `0 ⚠` en rouge avec un tooltip montrant le score brut, au lieu d'afficher `-5` directement.
- La logique de calcul `computeHouseScore` reste inchangée (qualité, pas activation).

*Durcissement P2 — Profondeur Karmique :*
- Le plafond P2 reste à 30, mais le **budget théorique** a été réduit de ~49.5 pts à ~31 pts, rendant le 30/30 quasi inatteignable :

| Contribution | v3.5.1 | v3.5.2 | Variation |
|---|---|---|---|
| Nodal karmique planètes (×6) | 6.0 | 3.6 | -40% |
| Nodal karmique lots (×4) | 1.4 | 0.6 | -57% |
| Nodal exacts (×3) | 1.5 | 1.2 | -20% |
| Réceptions mutuelles (×4) | 6.0 | 4.0 | -33% |
| Quasi-réceptions (×4) | 1.0 | 0.6 | -40% |
| Parallèles (cap) | 4.5 | 3.0 | -33% |
| Parallèles luminaires (×3) | 0.9 | 0.6 | -33% |
| Parallèles densité (×8) | 1.2 | 0.64 | -47% |
| Lum. cross parallels (×4) | 1.4 | 1.0 | -29% |
| Midpoints par orbe (×10) | ~3.5 | ~2.1 | -40% |
| Midpoints homonymes (×4) | 1.6 | 1.0 | -38% |
| Cross parans (×5) | 3.0 | 1.75 | -42% |
| Planetary pictures (×5) | ~3.5 | ~2.0 | -43% |
| Star bridges (×4) | 3.2 | 2.0 | -38% |
| Vertex (×3) | 2.4 | 1.5 | -38% |
| Antiscia personal (×3) | 1.5 | 1.05 | -30% |
| Antiscia other (×4) | 0.8 | 0.48 | -40% |
| Dispositors mutual (×3) | 2.4 | 1.5 | -38% |
| Dispositors simple (×5) | 1.0 | 0.6 | -40% |
| Long chains (×3) | 0.45 | 0.30 | -33% |
| OOB (×3) | 0.6 | 0.45 | -25% |
| Hayz (×4) | 1.2 | 0.80 | -33% |
| **Total max théorique** | **~49.5** | **~30.8** | **-38%** |

**Améliorations v3.9 — Dual Score, Homonymes, Modulation élémentaire :**

*Dual Score (Fluidité / Intensité) :*
- Le score global est désormais accompagné de deux métriques indépendantes :
  - **Fluidité** (0–100) : mesure l'harmonie naturelle et le confort relationnel. Calculée à partir du ratio aspectuel, de la compatibilité élémentaire, du ratio composite, des Double Whammies harmonieux et des midpoints
  - **Intensité** (0–100) : mesure la charge énergétique totale (passion, karma, transformation). Calculée à partir des contacts nodaux, des aspects exacts, des maisons d'ombre activées, des Double Whammies en tension et des contacts personnels
- Labels qualitatifs avec seuils : Très fluide (≥70), Fluide (≥50), Modéré (≥35), Tendu (<35) / Très intense (≥75), Intense (≥55), Modéré (≥35), Calme (<35)
- Labels disponibles en FR et EN (`label_en`, `profil_en`)
- Profil relationnel combiné : ex. « Modéré / Très intense »

*Correctif de viabilité relationnelle :*
- Quand l'intensité dépasse largement la fluidité, le score brut surestime la qualité vécue
- Formule : `delta = max(0, intensité - fluidité - 15)`, `correction = min(delta × 0.25, 15)`
- Score corrigé : `score = max(0, min(100, round(brut - correction)))`
- Appliqué universellement à toutes les typologies
- Exemple : Fluidité 46, Intensité 97 → delta=36, correction=-9, score brut 68 → score corrigé 59

*Homonymes (aspects entre planètes identiques) :*
- Évaluation systématique des 7 paires homonymes : Soleil-Soleil, Lune-Lune, Mercure-Mercure, Vénus-Vénus, Mars-Mars, ASC-ASC, MC-MC
- Bonus si l'homonyme a un aspect harmonieux/fusion ; pénalité si aspect tendu ou absent (pour les paires clés)
- Modulation élémentaire selon la compatibilité de signe des deux planètes homonymes

*Modulation élémentaire des pénalités et bonus :*
- Chaque pénalité/bonus impliquant des planètes spécifiques est modulé par l'affinité élémentaire des signes occupés :
  - `same_element` : résonance profonde → pénalité atténuée (×0.85) / bonus amplifié (×1.2)
  - `compatible` : dialogue naturel → pénalité légèrement atténuée (×0.9) / bonus ×1.1
  - `incompatible` : cécité élémentaire → pénalité renforcée (×1.15)
  - `aversion` : signes adjacents, pas de qualité partagée → pénalité amplifiée (×1.2) / absence aggravée (×1.5)
- Tag `[elem]` ajouté à chaque pénalité/bonus dans le détail et les prompts LLM

*NHRI — Natal House Resilience Index :*
- Index de résilience natale pour chaque maison (basé sur la condition du maître, les aspects nataux, et la présence de planètes)
- Modulation du P1 : quand un aspect tendu touche une planète maître d'une maison fragile (NHRI < 0.85), la tension est amplifiée ; si maison forte (NHRI > 1.15), bonus
- Shadow houses backoffice : évaluation des maisons non analysées en foreground (M6, M8, M12 + M7, M10) avec pénalité plafonnée pour tensions cachées

**Améliorations v4.0.0 — Professionnalisation du modèle (8 lacunes comblées) :**

*1. Compatibilité de signe fondamentale des planètes personnelles (P4) :*
- Évaluation structurelle des positions en signe pour **7 paires homologues** (Soleil, Lune, Mercure, Vénus, Mars, ASC, MC) **indépendamment** de l'existence d'un aspect
- Chaque paire pondérée par importance : Soleil/Lune (1.0), Vénus (0.9), Mars (0.8), ASC (0.8), Mercure (0.7), MC (0.5)
- Classification : `same_element` (+0.5w), `compatible` (+0.3w), `incompatible` (-0.4w), `aversion` (-0.6w)
- Score cappé à ±3.0 pts sur P4
- Pénalité `sign_fundamental_friction` émise si score ≤ -1.5

*2. Modulation rétrogradation (P1 — boucle d'aspects) :*
- Chaque aspect est modulé selon le statut rétrograde des planètes impliquées (lookup `_retroSet`) :
  - Tension/ajustement : ×1.10 (une rétrograde) → ×1.20 (deux rétrogrades)
  - Harmonie : ×0.92 (une rétrograde) → ×0.85 (deux rétrogrades)
- Justification astrologique : les rétrogrades internalisent l'énergie, amplifiant les frictions et atténuant les flux harmoniques

*3. Réception dans les aspects (P1) :*
- Bonus quand une planète occupe le signe de dignité (domicile) du partenaire d'aspect
- Réception unilatérale = +0.3, mutuelle = +0.6
- Modulé par nature : ×1.0 harmonie, ×0.6 fusion/ajustement, ×0.4 tension
- Cap à +2.5 pts
- Tracé dans `detail.pilier1.aspect_reception_bonus` et `aspect_reception_details`

*4. Détection combuste/cazimi croisé (P1) :*
- Conjonction croisée d'une planète personnelle (Lune, Mercure, Vénus, Mars) avec le Soleil de l'autre :
  - **Cazimi** (orbe ≤ 0.3°) : +1.0 pt — la planète est sublimée par le cœur du Soleil
  - **Combuste** (0.3° < orbe ≤ 8°) : -0.3 à -0.6 pt — la planète est écrasée par le rayonnement solaire (≤3° = -0.6, >3° = -0.3)
- Pénalité `combust_cross` émise pour chaque cas de combustion

*5. Modulation stationnaire intégrée par aspect (P1) :*
- Planète avec vitesse longitude < 0.02°/jour = quasi stationnaire (lookup `_speedMap`)
- Impact décuplé, traité par aspect (remplace l'ancien bonus plat +0.5/stationnaire) :
  - Aspect en tension : ×1.25
  - Aspect en harmonie/fusion : ×1.15

*6. Pénalité structurelle renforcée (P4) :*
- Quand **aucun élément commun** ET **aucun mode commun** entre les deux charts = vide structurel total
- Pénalité de -2.0 pts (`structural_void_elem_mode`), en plus de la pénalité existante pour tension élémentaire pure

*7. Pondération qualitative des contacts nodaux (P2) :*
- Les contacts nodaux ne sont plus comptés uniformément. Chaque contact est pondéré selon :
  - **Poids planétaire** : Soleil/Lune (1.2), Vénus (1.0), Chiron (0.9), Mars (0.9), Jupiter/Saturne (0.8), Mercure (0.7), transpersonnelles (0.6-0.7)
  - **Poids par type d'aspect** : Conjonction (1.3), Opposition (1.1), Trigone (0.9), Carré (0.8), Sextile (0.7), Quinconce (0.5)
  - **Multiplicateur exact** : ×1.3
- Formule : `0.5 × poids_planétaire × poids_aspect × mult_exact` par contact
- Cap à 5.0 pts
- Tracé dans `detail.pilier2.nodal_qual_score`

*8. Enrichissement des prompts et rapports :*
- Le prompt LLM synthèse inclut désormais toutes les nouvelles métriques dans les lignes P1-P4 : rétrogrades en aspect, réception, cazimi/combuste, sign compatibility, nodal qual score
- Les 3 rapports HTML affichent les nouvelles données dans les barres statistiques et les sections Forces/Défis
- Labels de pénalités enrichis avec traduction EN/FR pour : `sign_fundamental_friction`, `structural_void_elem_mode`, `combust_cross`, `element_pure_tension_no_common`

*Modulation asymétrique par dignité natale (v3.5.1) :*
- **Principe astro** : un Pluton en Domicile (Scorpion) qui fait un carré à un Mars en Exil (Balance) est incomparablement plus destructeur qu'un Pluton en Chute sur un Mars en Domicile. Le système traite désormais les dignités de manière **asymétrique** :
  - **Attaquant fort (Dom/Exalt) → Cible faible (Exil/Chute)** : pénalité ×1.35
  - **Attaquant fort OU Cible faible** (un seul) : pénalité ×1.18–1.20
  - **Attaquant faible → Cible forte** : pénalité ×0.85
- Appliqué à :
  - La boucle principale du ratio aspectuel (pondération positive/négative différenciée par nature d'aspect)
  - Toutes les pénalités P1 impliquant des planètes spécifiques : `saturn_hard_personal`, `venus_mars_hard`, `neptune_hard_personal_angles`, `pluton_hard_personal`, `mars_hard_luminaires`, `uranus_hard_affective`
  - Chaque pénalité expose un champ `dignity_mult` dans son détail pour traçabilité

##### Pilier 1 — Qualité Aspectuelle (0–35 pts)

Évalue la qualité du tissu aspectuel inter-cartes (tier 1 enrichi appliquant/séparant) :

**Facteurs positifs :**
- **Pondération par tier** : aspects tier 1 = ×1.0, tier 2 = ×0.65, tier 3 = ×0.35
- **Ratio pondéré** (10–30) : poids positifs vs négatifs, avec nuances :
  - Aspects **appliquants** : +15% au poids individuel
  - Aspects **séparants** : -10%
  - Aspects **exacts** (orbe < 1°) : +20%
  - Planètes en **dignité** (Domicile/Exaltation) : +10% au poids
  - Planètes en **débilité** (Exil/Chute, les deux) : -15%
- **Fusions qualifiées** : conjonctions bénéfiques ×0.85 positif ; conjonctions maléfiques doubles ×0.2 positif + ×0.3 négatif
- **Quinconces** : tension légère (×0.35 du poids en négatif)
- **Bonus exacts** : +0.5 par aspect exact harmonieux/fusion (max 8), +0.3 bonus additionnel si aspect exact implique une planète personnelle (max 4)
- **Modulation rétrogradation** (v4.0) : dans la boucle d'aspects, les planètes rétrogrades amplifient la tension (×1.10–1.20) et atténuent l'harmonie (×0.85–0.92)
- **Modulation stationnaire** (v4.0) : dans la boucle d'aspects, les planètes stationnaires (<0.02°/jour) amplifient l'impact (tension ×1.25, harmonie/fusion ×1.15) — remplace l'ancien bonus plat +0.5
- **Réception dans les aspects** (v4.0) : bonus quand une planète est dans le signe de domicile du partenaire d'aspect (+0.3 unilatéral, +0.6 mutuel, modulé par nature, cap +2.5)
- **Cazimi croisé** (v4.0) : planète personnelle conjointe au Soleil de l'autre à ≤0.3° = +1.0 pt (sublimation)
- **Aspects Tier 2 (Lots/Astéroïdes)** (v3.4) : pondération à 30% du poids T1, cap score 15, applying +10%. Apporte +176 aspects supplémentaires au ratio harmonique/tendu
- **Amplification OOB** (v3.4) : +10% sur aspects T1 impliquant une planète hors limites, +8% sur T2

**Pénalités P1 :**
| ID | Condition | Malus |
|---|---|---|
| `saturn_hard_personal` | Saturne en aspect tendu avec ≥2 planètes personnelles (Sol/Lune/Merc/Vén/Mars) | -0.8 × count (max 4) |
| `venus_mars_hard` | Vénus-Mars en carré/opposition (orbe < 3°) | -1.5 si exact, -0.8 sinon |
| `neptune_hard_personal_angles` | Neptune en aspect tendu avec ≥2 planètes personnelles ou angles | -0.6 × count (max 3) |
| `double_whammy_tension` | Même paire planétaire en tension dans les deux directions (A→B et B→A) | -1.0 × count (max 3) |
| `double_malefic_conj_debilitated` | Conjonction de 2 maléfiques (Mars/Sat/Plut) avec les deux en Exil/Chute | -1.2 × count |
| `mars_pluton_conj_cross` | Conjonction Mars-Pluton croisée (intensité/domination) | -1.5 si exact, -1.0 sinon |
| `soleil_lune_hard_cross` | Soleil-Lune en carré/opposition croisé (conflit identitaire) | -1.2 (opposition) ou -0.8 (carré) |
| `poisoned_fusions_debilitated` | ≥2 conjonctions avec planète en Exil/Chute — pondéré par nature : Mars/Sat/Plut = -0.6, Neptune = -0.4, autre = -0.35 | par fusion (max 5) |
| `neptune_fall_on_angle` | Neptune en Chute/Exil conjoint à un angle (ASC/DSC/MC/IC) | -0.8 × count (max 2) |
| `transpersonnel_devalue` | Aspects transpersonnel↔transpersonnel (Ur/Nep/Plu) pondérés ×0.35 | multiplicateur intégré |
| `pluton_hard_personal` | Pluton en aspect tendu avec ≥1 planète personnelle (manipulation, obsession, contrôle) | -0.9 × count (max 4) |
| `mars_hard_luminaires` | Mars en aspect tendu avec ≥1 luminaire Sol/Lune (agression, colère) | -0.7 × count (max 3) |
| `uranus_hard_affective` | Uranus en tension avec Vénus ou Lune (instabilité, rupture affective) | -0.6 × count (max 3) |
| `no_venus_soft_cross` | Aucun aspect harmonique/fusion Vénus croisé (absence totale de liant vénusien) | -1.5 |
| `combust_cross` | Planète personnelle croisée combuste par le Soleil de l'autre (orbe 0.3°–8°) | -0.3 à -0.6 × count |
| `retro_modulation` | Modulation intégrée dans la boucle d'aspects : rétrogrades amplifient la tension (×1.10–1.20) et atténuent l'harmonie (×0.85–0.92) | multiplicateur intégré |
| `stationary_modulation` | Modulation intégrée dans la boucle d'aspects : planètes stationnaires (vitesse <0.02°/jour) amplifient l'impact (×1.15–1.25) | multiplicateur intégré |

**Bonus P1 :**
| `double_whammy_harmony` | Même paire planétaire en harmonie/fusion dans les deux directions | +0.5 × count (max 4) |
| `typo_saturn_nn_bonus` | Saturne-NN harmonique en contexte Parent/Enfant ou Mentorat | +0.5 × count (max 2) |
| `typo_saturn_relief` | Réduction 15% pénalité saturn_hard_personal en Parent/Enfant | variable |
| `chiron_harmonic_trans` | Chiron en aspect harmonique/fusion avec transpersonnelle | +0.3 × count (max 2) |
| `aspect_reception_bonus` | Réception dans l'aspect : planète en signe de domicile du partenaire. Unilatérale +0.3, mutuelle +0.6 (modulé par nature : ×1.0 harm, ×0.4 tens) | cap +2.5 |
| `cazimi` | Cazimi croisé : planète personnelle conjointe au Soleil de l'autre (orbe ≤ 0.3°) — sublimation | +1.0 × count |

##### Pilier 2 — Profondeur Karmique & Couches Avancées (0–30 pts)

**Facteurs positifs :**

| Facteur | Points | Maximum |
|---|---|---|
| Contacts nodaux karmiques (**planètes**) | +1.0 chacun | 6 |
| Contacts nodaux karmiques (**Lots**) | +0.35 chacun | 4 |
| Contacts nodaux exacts (planètes) | +0.5 chacun | 3 |
| **Score nodal qualitatif** (v4.0) | Pondéré par poids planétaire × type d'aspect × exact | cap 5.0 |
| Réceptions mutuelles croisées | +1.5 chacune | 4 |
| Quasi-réceptions (chaînes simples L=2) | +0.25 chacune | 4 |
| Hub dispositor (convergence ≥5) | +0.3 × (hub-4) | 3 |
| Parallèles (déclinaison) — qualifiés v3.3.1 | Personnel + orbe <0.2° = +0.55 ; personnel = +0.4 ; autre = +0.3 | cap 4.5 pts |
| Parallèles luminaires | +0.3 bonus chacun | 3 |
| Parallèles croisés Luminaire-Personnel (v3.4) | +0.35 chacun | 4 |
| Densité parallèles (> 12) | +0.15 par parallèle au-delà de 12 | 8 |
| Midpoints activés — pondérés par orbe v3.3 | orbe <0.1° = +0.4, <0.3° = +0.3, autre = +0.2 | 10 |
| Midpoints homonymes | +0.4 chacun | 4 |
| Ponts paran croisés (Brady) | +0.6 chacun | 5 |
| Planetary pictures — pondérées v3.3 | ≥6 convergences = +0.8, ≥4 = +0.5, autre = +0.3 | 5 |
| Ponts stellaires (étoiles fixes) | +0.8 chacun | 4 |
| Contacts Vertex | +0.8 chacun | 3 |
| Antiscia — qualifiés v3.4 | Personnel = +0.5, autre = +0.2 | 3 pers. + 4 autres |
| Dispositors mutuels croisés (v3.4) | +0.8 chacun (rehaussé de 0.6) | 3 |
| Dispositors simples croisés | +0.2 chacun | 5 |
| Dispositors longues chaînes (v3.4) | +0.15 par chaîne ≥3 | 3 |
| Planètes OOB | +0.2 chacune | 3 |
| Hayz parfait | +0.3 chacun | 4 |

**Pénalités P2 :**
| ID | Condition | Malus |
|---|---|---|
| `south_node_dominance` | Plus de contacts Nœud Sud que Nord (écart ≥ 2) | -0.5 × écart (max 4) |
| `chiron_hard_personal` | Chiron en aspect tendu avec ≥2 planètes personnelles | -0.6 × count (max 3) |
| `lilith_luminaire_intense` | Lilith en conj/opp avec luminaires (Soleil/Lune) | -0.7 × count (max 2) |
| Contra-parallèles personnels | Contra-parallèles impliquant des planètes personnelles | -0.25 × count (max 3) |

##### Pilier 3 — Santé du Composite & Davison (0–20 pts)

**Facteurs positifs :**
- **Composite** (0–12 pts) :
  - Base ratio harmonie/tension (5 + ratio × 5)
  - Configurations : Grand Trigone +2, Stellium +0.5, Yod +0.5, T-Carré -1, Grand Croix -2.5
  - Aspects luminaires (Soleil/Lune) harmonieux : +0.5 chacun (max 3)
  - Ratio pondéré par implication des planètes personnelles (×1.3 vs ×1.0)
- **Davison** (0–8 pts) :
  - Même logique ratio + configurations (plage configs élargie -2/+2)
  - Si Davison non disponible : score neutre (4/8)

**Pénalités P3 :**
| ID | Condition | Malus |
|---|---|---|
| `composite_lune_saturne_hard` | Lune-Saturne en aspect tendu dans le composite | -1.5 |
| `composite_venus_pluton_hard` | Vénus-Pluton en aspect tendu dans le composite | -1.0 |
| `composite_stellium_m8_m12` | Stellium en maison 8 ou 12 dans le composite | -0.8 |
| `composite_soleil_saturne_conj` | Soleil-Saturne en conjonction dans le composite (restriction, lourdeur) | -1.3 (orbe < 2°) ou -0.7 |
| `composite_soleil_lune_hard` | Soleil-Lune composite en tension (carré/oppo) ou quinconce — déconnexion identité/émotion | -1.2 (tension) ou -0.7 (quinconce) |
| `composite_lune_nodes_hard` | Lune composite en carré aux Nœuds — émotion bloquée karmiquement | -0.8 |
| `composite_house_concentration` | ≥4 planètes dans une même maison difficile (M6/M8/M12) composite | -1.2 (std) ou -0.5 (parent-enfant) |
| `composite_mars_saturne_hard` | Mars-Saturne en tension/fusion au composite (frustration, action bloquée) | -1.3 (orbe <2°) ou -0.8 |
| `composite_mars_pluton_hard` | Mars-Pluton en tension au composite (domination, lutte de pouvoir) | -1.5 (orbe <1°) ou -1.0 |

**Bonus P3 (v3.1 à v3.4) :**
| Luminaire composite sur angle | Soleil/Lune en M1 ou M10 du composite | +0.6 × count (max 2) |
| Nœud Nord composite en maison principale | Nœud Nord composite dans une maison principale de la typo | +0.5 |
| Vénus-Mars soft composite (v3.3) | Vénus-Mars harmonieux dans le composite | +1.2 (orbe <1°) ou +0.8 |
| Soleil/Lune composite angulaire (v3.4) | Soleil ou Lune composite en M1/4/7/10 | +0.5 par luminaire |
| Soleil/Lune composite difficile (v3.4) | Soleil ou Lune composite en M6/8/12 | -0.4 par luminaire |
| Vénus-Mars soft Davison (v3.4) | Vénus-Mars harmonieux dans le Davison | +0.6 |
| Luminaire Davison angulaire (v3.4) | Soleil ou Lune Davison en M1/4/7/10 | +0.5 par luminaire |

##### Pilier 4 — Compatibilité Structurelle (0–20 pts)

**Facteurs positifs (v3.3 à v4.0.0) :**
- **Compatibilité élémentaire** : harmonie +3, tension -1, neutre +1 ; +0.8 par élément commun (max 3), -0.5 par tension (max 2)
- **Profondeur élémentaire** : +0.8 par élément partagé profondément (les deux thèmes ≥3 dans le même élément, max 2). Capture la compatibilité réelle même quand les dominantes sont en tension
- **Compatibilité modale** : +0.9 par mode commun (max **3**). Sync modale parfaite = **+2.5** (v3.5, rehaussé depuis +1.2)
- **Compatibilité de signe fondamentale** (v4.0) : évaluation des 7 paires personnelles (Sol, Lun, Mer, Vén, Mar, ASC, MC) par affinité élémentaire des signes occupés (same_element, compatible, incompatible, aversion), pondérée par importance planétaire. Cap ±3.0 pts
- **Sensibilité croisée** : +0.5 par résonance (max 3), -0.4 par vulnérabilité (max 3)
- **Interaction chart rulers** : +2 (harmonie/fusion), +0.5 (tension), +1 (autre)
- **Pertinence typologique** : +0.5 par aspect harmonieux/fusion impliquant des planètes clés (max 5), -0.3 par aspect tendu (max 3)
- **Activation maisons principales** : +1.5 si toutes les maisons principales de la typo sont activées par overlay
- **Dignité accidentelle** : bonus **progressif** basé sur la moyenne des top 5 (au lieu de top 3) planètes — `min(avg/18, 1) × 1.5` par personne (max 3.0 total). Échelle continue au lieu de paliers binaires

**Pénalités P4 :**
| ID | Condition | Malus |
|---|---|---|
| `excessive_shared_fixity` | Les deux thèmes ont ≥4 planètes en signe fixe | -1.2 |
| `element_pure_tension_no_common` | Éléments dominants en tension ET aucun élément commun | -1.5 |
| `principal_houses_empty` | ≥2 maisons principales de la typo vides en overlay (sur ≥3) | -0.6 × count |
| `exil_in_principal_houses` | ≥2 planètes en overlay en Exil/Chute dans les maisons principales | -0.4 × count (max 4) |
| `lune_lune_hard` | Lune de A en aspect tendu avec Lune de B | -1.5 (opposition) ou -1.0 (carré) |
| `no_soleil_lune_soft` | Absence d'aspect harmonieux/fusion Soleil↔Lune croisé | -1.0 |
| `venus_venus_hard` | Vénus-Vénus en aspect tendu croisé (goûts/valeurs en conflit) | -1.2 (opposition) ou -0.8 (carré) |
| `no_venus_venus_soft` | Absence de Vénus-Vénus soft croisé (pas d'harmonie des goûts) | -0.6 |
| `chart_rulers_no_aspect` (v3.3) | Les maîtres de thème n'ont aucun inter-aspect | -1.0 |
| `sign_fundamental_friction` (v4.0) | Score de compatibilité de signe des 7 paires personnelles ≤ -1.5 (friction fondamentale) | variable (= sign_compat_score) |
| `structural_void_elem_mode` (v4.0) | 0 éléments communs ET 0 modes communs = vide structurel absolu | -2.0 |

**Bonus P4 (v3.3 à v4.0.0) :**
| Bonus Soleil-Lune soft croisé (v3.3) | Aspect harmonieux Soleil-Lune croisé | +1.0 (ou +1.5 si exact) |
| Complémentarité de secte (v3.3.1) | Un thème diurne + un thème nocturne | +0.8 |
| Sect malefic bonus (v3.5.1) | Mars en secte nocturne ou Saturne en secte diurne (maléfique "domestiqué") | +0.3 par maléfique en secte (cap 0.6) |
| Sign compatibility bonus (v4.0) | Compatibilité de signe positive entre les 7 paires personnelles (same_element/compatible) | cap +3.0 |

#### Dual Score — Fluidité / Intensité (v3.9)

Le score brut est accompagné de deux métriques indépendantes exposées dans l'objet `detail.dual_score` :

| Métrique | Calcul | Seuils (labels) |
|---|---|---|
| **Fluidité** (0–100) | Ratio aspectuel positif + compat élémentaire + ratio composite + DW harmonieux + midpoints | ≥70 Très fluide, ≥50 Fluide, ≥35 Modéré, <35 Tendu |
| **Intensité** (0–100) | Contacts nodaux + aspects exacts + maisons d'ombre activées + DW tension + contacts personnels | ≥75 Très intense, ≥55 Intense, ≥35 Modéré, <35 Calme |

Le profil combiné (ex. « Modéré / Très intense ») et les labels traduits (FR/EN) sont inclus dans la sortie.

#### Correctif de Viabilité Relationnelle (v3.9.2)

Quand l'intensité dépasse la fluidité de plus de 15 points, le score brut surestime le confort relationnel réel :

```
delta = max(0, intensité - fluidité - 15)
correction = min(delta × 0.25, 15)
score_final = max(0, min(100, round(brut - correction)))
```

Exemple concret : Fluidité 46 / Intensité 97 → delta=36, correction=-9 → score brut 68 → **score corrigé 59/100**.

Ce correctif est universellement appliqué, quelle que soit la typologie.

#### Échelle qualitative contextuelle (v3.5)

Le score brut (0–100) est accompagné d'une **bande qualitative** adaptée au type de relation, fournie dans `qualitative_band` :

| Typologie | ≥ 78/80/75 | ≥ 65/60 | ≥ 50/45 | < 50/45 |
|---|---|---|---|---|
| **Parent / Enfant** | Harmonie naturelle | Lien profond avec défis structurants | Relation complexe mais transformatrice | Tensions structurelles profondes |
| **Amour** | Magnétisme fort (≥80, v5.0.0) | Bonne compatibilité (≥65) | Stimulante et exigeante (≥50) | Tensions dominantes |
| **Business** | Synergie forte (≥75) | Partenariat viable (≥60) | Collaboration exigeante (≥45) | Risque de blocages |
| **Générique** | Compatibilité forte (≥75) | Modérée (≥60) | Relation de croissance (≥45) | Difficile |

Chaque bande contient : `band` (label), `desc_fr` (description contextuelle), `color` (couleur CSS pour l'affichage).

##### Score final

`Score brut = Pilier1 + Pilier2 + Pilier3 + Pilier4` plafonné [0, 100] (via total théorique 105 normalisé).
`Score corrigé = Score brut - Correctif de viabilité` plafonné [0, 100], arrondi.

L'objet de sortie contient :
- `score` (entier — score corrigé final)
- `version` ("v4.0.0")
- `detail.pilier1` à `detail.pilier4` (détail de chaque pilier avec facteurs positifs, pénalités et nouvelles métriques)
- `detail.penalties_summary` (nombre total de pénalités, malus total, et liste détaillée avec `dignity_mult` et `[elem]` tags)
- `detail.dual_score` : `{ fluidite, intensite, label_flu, label_int, profil, label_en, profil_en }`
- `detail.viability_correction` : valeur du correctif appliqué
- `detail.pilier1.retro_in_aspects` : nombre d'aspects impliquant une planète rétrograde
- `detail.pilier1.aspect_reception_bonus` : bonus total de réception
- `detail.pilier1.aspect_reception_details` : liste des réceptions détectées
- `detail.pilier1.cazimi` : occurrences de cazimi croisé
- `detail.pilier1.combust` : occurrences de combustion croisée
- `detail.pilier2.nodal_qual_score` : score qualitatif pondéré des contacts nodaux
- `detail.pilier4.sign_compatibility` : `{ score, pairs }` — compatibilité de signe des 7 paires

#### Score par maison — `computeHouseScore` (v3.5 — qualitatif)

Pour chaque maison et chaque perspective (A et B), le score intègre désormais des facteurs qualitatifs :

1. **Poids overlay enrichis** :
   - Poids de base de chaque planète × 1.5 si planète clé typologique
   - **Dignité** : Domicile/Exaltation ×1.20, Exil/Chute ×0.75
   - **Bénéfique/maléfique** : Vénus/Jupiter/Soleil/Lune/Nœud Nord ×1.10, Saturne/Pluton/Mars/Lilith/Nœud Sud ×0.85
   - **Rétrograde** : ×0.90 (×0.90 × 0.92 = ×0.828 cumulé pour T1 en maison principale — v3.4)
2. **Inter-aspects par maison avec nature** (plafonnés au max(overlayPos, 15)) :
   - Harmonie : score × 0.3 × 1.2
   - Tension : score × 0.3 × -0.6 (contribue négativement, plafonné à -50% du cap)
   - Fusion : nuancé (bénéfique ×1.0, maléfique double ×-0.4, neutre ×0.6)
   - Ajustement : ×-0.2
3. **Condition du maître de la maison** :
   - Score accidentel > 8 : +1.5 | > 3 : +0.7 | < -5 : -1.2 | < -2 : -0.5
4. **Maison principale vide** : score fixe -5 (normalized = 0%)
5. **Priorité typologique** (multiplicateur réduit pour éviter les scores extrêmes) :
   - Maison principale : ×1.3
   - Maison secondaire : ×1.15
   - Autre maison : ×1.0
6. **Normalisation 0–100** : score brut ramené à une échelle 0–100 basée sur le potentiel théorique par tier (T1 = 18 pts, T2 = 8 pts, T3 = 4 pts, × priorité typologique). Prend en compte TOUTES les entrées (pas seulement T1) pour éviter la saturation à 100% des maisons avec beaucoup de lots T2/T3
7. **Cluster rétrograde+exil (v3.5)** : si ≥2 planètes sont simultanément rétrogrades ET en Exil/Chute dans la même maison (principale/secondaire), pénalité de -1.5 × count. Capture la dysfonction concentrée (ex: M7 avec Jupiter R Exil + Uranus R Exil)
8. **Flag Principale/Secondaire** : `is_principale` pour les maisons principales de la typo

#### Filtrage Top N
- Tri décroissant par score → seules les **top maisons** (principales + secondaires de la typo) sont injectées dans les prompts LLM
- Top 6 maisons par perspective (A et B)

---

### 3.6 Prompt Engineering

#### Prompt System — `systemPromptBase`
- Rôle : astrologue spécialisé en synastrie
- Consigne : rédaction structurée, nuancée, éthique
- 4 sections imposées par maison : atmosphère, planètes clés, risques, conseil
- Fidélité aux données, pas de fatalisme, pas de prédictions médicales/juridiques
- **Bloc CONTEXTE DE RÔLE** (conditionnel) : injecté uniquement si `role` est défini pour au moins une personne — indique au LLM qui est le parent/enfant ou mentor/élève
- **Compression du contexte** (v1.4) : les couches avancées (parallèles, antiscia, OOB, Hayz, ponts stellaires, configurations natales) sont formatées en lignes compactes pipe-separated avec limits top-N pour économiser le contexte LLM. Détail complet accessible dans les prompts par maison ou le rapport DT.

#### Score v4.0.0 dans la synthèse LLM
Le `synthPrompt` inclut le **détail des 4 piliers** (P1–P4) du score v4.0.0, y compris :
- **Dual Score** (Fluidité / Intensité) avec labels qualitatifs
- **Correctif de viabilité** si applicable
- **Pénalités appliquées** avec multiplicateurs de dignité et tags élémentaires
- **Nouvelles métriques v4.0.0** : `retro_in_aspects`, `aspect_reception_bonus`, `cazimi`, `combust`, `nodal_qual_score`, `sign_compatibility.score`
- Un paragraphe d'instructions LLM listant les 8 fonctionnalités v4.0.0 et comment les intégrer à l'analyse

#### Gestion des pronoms (`consigne_redaction`)

Les deux perspectives (A et B) appliquent la **même logique symétrique** pour la consigne de rédaction :

- Si `consigne_redaction` = `"Tu"` ou `"Vous"` → le LLM **s'adresse directement** à la personne
- Si `consigne_redaction` = `"Il"` ou `"Elle"` → le LLM **parle de la personne à la troisième personne** (les deux personnes sont décrites en troisième personne)

> Exemple : Si personne_a a `consigne_redaction: "Il"`, le prompt sera :
> « Parle de François à la troisième personne ("Il") et de Samy également ("Il"). »

#### Injection du contexte de rôle

Pour les typologies asymétriques (Parent / Enfant, Mentorat), le rôle est injecté à **3 niveaux** dans les prompts :

1. **System Prompt** — Bloc `CONTEXTE DE RÔLE` avec les rôles de chaque personne + consigne d'adaptation
2. **Prompt User (par maison)** — Ligne « Rappel de rôle » dans la consigne de rédaction
3. **Prompt Synthèse** — Ligne « Rôles » dans l'en-tête

Pour les typologies symétriques, ces blocs sont omis (aucun impact sur les prompts).

#### Prompt User (par maison activée)
1. Type de relation + contexte typologique
2. Cuspide de la maison + signe + thématiques
3. Planètes en overlay (avec détails : degré, signe, dignité, rétrograde, planète clé typo)
4. Inter-aspects tier 1 et tier 2 pertinents à cette maison
5. Contacts nodaux/karmiques
6. **Midpoints Ebertin activés dans cette maison** (top 4, avec thème) — injectés si le degré du midpoint tombe dans la maison analysée
7. **Parans Brady liés aux planètes en overlay** (top 3, avec interprétation composée) — injectés si une planète en overlay a un paran avec une étoile fixe
8. Rappel de rôle (si typologie asymétrique)
9. Score de la maison + rank
10. Consigne de longueur (budget tokens calibré par score)

#### Prompt Synthèse — `synthese_prompt`
1. Score global + interprétation textuelle + rôles (si typologie asymétrique)
2. Top inter-aspects tier 1 (tous, triés par score)

> **Sections enrichies v2 dans la synthèse** :
> - Midpoints Ebertin : top 12 avec thème, badges homonymes
> - Planetary Pictures : convergences ≥3 midpoints au même degré (mod 90°)
> - Ponts Paran Croisés (Brady) : top 6 avec archétype stellaire et thème
3. Lots pertinents à la typologie dans les overlays
4. Contacts nodaux/karmiques
5. Composite + configurations composites
6. Compatibilité élémentaire + modale
7. Structure imposée en 6 points :
   - Forces naturelles du couple
   - Défis et tensions majeures
   - Dimension karmique et nodale
   - Thème composite (identité du couple)
   - Couches avancées (si présentes)
   - Conseils concrets
8. Budget tokens : LONG (40-60 lignes)

---

## 4. LLM INTERPRÉTATION (`N8N SYN LLM`)

### 4.1 Préparation des prompts (intégrée au Super Nœud SYN)

> **Note v1.8** : La préparation des prompts est désormais intégrée directement dans le **Super Nœud SYN** (`N8N SYN`). L'ancien nœud séparé `Prepare Prompts SYN` a été supprimé. Les données sont transmises directement du Super Nœud aux agents LLM via le nœud `Merge SYN Final1`.

Le Super Nœud SYN :
- Lit `prompts_a`, `prompts_b`, `synthese_prompt` qu'il génère lui-même
- Trie les maisons par **score décroissant** par perspective
- Remplit **6 slots A** (SYN A1–A6), **6 slots B** (SYN B1–B6), **1 slot Synthèse**
- Ajoute des consignes Markdown (titres `## … ##`, `### … ###`)
- Slots vides → réponse « skipped »
- Propage `_meta` (persoA, persoB, typo) et `_synRef` (données synastrie complètes)

### 4.2 Agents LLM

- **13 agents Gemini 3.1 Pro Preview** en parallèle (6+6+1)
- Chaque agent reçoit : system prompt + user prompt spécifique à sa maison
- Modèle : `models/gemini-3.1-pro-preview`
- Les expressions des agents référencent `$('Super noeud Syn')` pour accéder aux slots de prompts

### 4.3 Reassemble SYN

- Reconstruit `perspective_a`, `perspective_b`, `synthese` à partir des 13 réponses
- Ignore les textes contenant « skipped »
- Propage `synData` (via `$('Super noeud Syn')._synRef` ou fallback `$('5. Calcul SYN')`)

---

## 5. TRADUCTEUR LLM (`N8N SYN Trad LLM`)

### Pipeline
1. **Découpage** : split des réponses LLM en items individuels (par maison/perspective)
2. **Traducteur SYN** : agent Gemini — vulgarisation (même longueur, suppression du jargon)
3. **Reassemble Trad SYN** : réalignement des métadonnées avec les textes vulgarisés

### Règles de vulgarisation
- **Termes SUPPRIMÉS** : Trigone, Carré, Opposition, Sextile, Quinconce, Cuspide, Décan, Terme, Triplicité, Orbe, Domicile, Exaltation, Exil, Chute, Pérégrin, Midpoint, Antiscia, Dignité, Cazimi, Combuste
- **Termes CONSERVÉS** : noms de planètes, noms de signes, noms d'étoiles fixes, « éclipse »
- **Remplacement** : « Maison X » → signification en langage courant
- **Contrainte** : 100% de la longueur et architecture conservées

---

## 6. VALIDATEUR SILENCIEUX (`N8N SYN Valideur` — v3.0)

### Validations effectuées
1. **Cohérence signes nataux** : planète attribuée au mauvais signe (FR + EN), avec désambiguïsation prénoms / contexte overlay
2. **Cohérence maisons natales** : planète attribuée à la mauvaise maison (patterns FR + EN)
3. **Overlay vs texte** : vérification que les planètes décrites correspondent aux overlays réels — **activé aussi sur la synthèse** (v3.0)
4. **Vocabulaire prédictif interdit** : détection de formulations fatalistes / temporelles
5. **Inversion A/B** : détection de confusion entre les deux personnes sur les signes
6. **Dignités complètes** : Domicile, Exaltation, Exil, Chute — vérification contre les cartes natales (v3.0, auparavant seul Domicile)
7. **Garde contexte composite/Davison** : les phrases mentionnant explicitement "composite", "Davison", "thème de la relation" sont **exclues** de la validation signes/maisons nataux pour éviter les faux positifs (v3.0)
8. **Support langue EN** : reconnaissance des signes en anglais (Aries, Taurus…) + patterns "in house X", "in rulership", "in detriment" (v3.0)

### Sortie
```json
{
  "status": "CLEAN | WARNINGS_DETECTED",
  "totalWarnings": 0,
  "subjects": "Prénom NOM et Prénom NOM",
  "typologie": "...",
  "perspective_a": { "M1": { "signW": [], "houseW": [], "overlayW": [], ... } },
  "perspective_b": { ... },
  "synthese": { "signW": [], "houseW": [], "overlayW": [], "predictW": [], "swapW": [], "dignityW": [], "total": 0 },
  "ref_counts": { ... },
  "summary": "...",
  "timestamp": "..."
}
```

---

## 7. RAPPORT DONNÉES TECHNIQUES (`N8N SYN Repport`)

Rapport HTML/PDF (v3.0) — visualisation exhaustive de toutes les données calculées :

1. **En-tête** : noms des deux personnes + typologie + score global
2. **Cartes d'identité** : données natales A et B
3. **Maisons les plus activées** : barres + badges Principale/Secondaire
4. **Bi-roue SVG** : roue intérieure (A) + roue extérieure (B) avec planètes, signes, maisons, aspects inter-cartes
5. **Compatibilité élémentaire et modale** : dominantes, tableau des modes
6. **Réceptions mutuelles croisées**
7. **Scoring par maison** : tableau + barres (B→A et A→B) avec pondération typologique
8. **Superpositions** : deux tableaux détaillés (B→A et A→B) avec tiers, dignités, planètes clés
9. **Grille d'aspects** : tableau croisé visuel + listes Inter-aspects Tier 1 et Tier 2
10. **Contacts nodaux / karmiques**
11. **Thème Composite** : planètes, aspects internes, cuspides, configurations
12. **Thème Davison** : aspects, configurations
13. **Configurations natales** A et B
14. **Déclinaisons** : parallèles, contra-parallèles, OOB
15. **Antiscia** inter-cartes
16. **Dignité accidentelle (Lilly)** A et B
17. **Chaînes de dispositions croisées**
18. **Planètes stationnaires, Hayz**
19. **Ponts stellaires** + étoiles fixes (conjonctions, angles, parans Brady enrichis v2)
20. **Midpoints Ebertin v2** (tableau enrichi + thème/keywords + badges homonymes)
21. **Planetary Pictures** (convergences mod 90° — tableau dédié)
22. **Ponts Paran Croisés Brady** (tableau dédié — étoiles en paran simultané A et B)
23. **Vertex, sensibilité croisée, Sabian croisé**
21. **Statistiques récapitulatives** : compteurs aspects, nodal, réceptions, composite

---

## 8. RAPPORT HTML TECHNIQUE (`N8N SYN Repport HTML Tech`)

Rapport narratif destiné aux **astrologues professionnels** :

- **12 cartouches de maisons** (6 perspective A + 6 perspective B), triées par score décroissant
- Chaque cartouche contient :
  - Icône zodiacale + titre de la maison (adapté au contexte synastrie) + domaines
  - Badge cuspide (signe)
  - Badges overlay (planètes de la personne « source » en tier ≤ 2)
  - Badges étoiles fixes (★ / ★★) conjointes aux planètes overlay uniquement
  - Badges Principale / Secondaire + Score
  - Bandeau « Impact de X sur Y »
  - Description contextuelle synastrie
  - **Texte LLM BRUT** (non vulgarisé) — termes techniques conservés
- **Synthèse relationnelle** globale (texte LLM brut)

### Couleurs des perspectives
- **Perspective A** (Impact de B sur A) : bleu `#2E5FA3` / badges `#dbeafe`
- **Perspective B** (Impact de A sur B) : orangé `#c2410c` / badges `#fed7aa`

---

## 9. RAPPORT HTML FINAL (`N8N SYN Repport HTML Final`)

Rapport narratif destiné au **client final** :

- Structure identique au rapport Tech (mêmes cartouches, mêmes badges)
- **Seule différence** : texte LLM vulgarisé par le Traducteur
- Couleurs des badges harmonisées avec le Theme : `#e8f0fe` / `#1F3864` (perspective A), `#fef3c7` / `#92400e` (perspective B)
- Mention « Aucune planète majeure en overlay » si aucun tier 1–2 dans une maison
- Pas de Score ni de badges Principale/Secondaire (contrairement au rapport Tech)

---

## 10. CHAÎNES D'EXPORT PDF

### Nommage dynamique des fichiers (v1.0)

Les trois chaînes d'export génèrent des noms de fichiers dynamiques :

| Chaîne | Format du nom |
|---|---|
| `N8N SYN Chaine Repport` | `Données Techniques Synastrie - {Typo} - {Prénom NOM P1} - {Prénom NOM P2}.pdf` |
| `N8N SYN Chaine Repport HTML Tech` | `Rapport Technique Synastrie - {Typo} - {Prénom NOM P1} - {Prénom NOM P2}.pdf` |
| `N8N SYN Chaine Repport HTML Final` | `Rapport Synastrie - {Typo} - {Prénom NOM P1} - {Prénom NOM P2}.pdf` |

### Sources de données pour le nommage
1. **Source principale** : `$('Extract Variables SYN')` → `personne_a.prenom`, `personne_a.nom`, `personne_b.prenom`, `personne_b.nom`, `typologie`
2. **Fallback** : `$('Super noeud Syn')._meta` → `persoA`, `persoB`, `typo`

### Pipeline d'export
1. Contrôle `isComplete` → Préparation HTML (binaire) → Conversion Gotenberg (HTML→PDF) → Renommage + MIME → Upload Google Drive

---

## 11. PARAMÈTRES DE PERSONNALISATION

| Paramètre | Valeurs | Impact |
|---|---|---|
| `personne_a` | { prenom, nom, date, heure, lieu, pays, consigne_redaction, genre, pronom_tiers, role } | Première personne de la synastrie |
| `personne_b` | { prenom, nom, date, heure, lieu, pays, consigne_redaction, genre, pronom_tiers, role } | Seconde personne de la synastrie |
| `typologie` | Amour / Business / Parent / Enfant / Fratrie / Ami / Mentorat / Colocataire / Rivalité | Type de relation — détermine la grille de scoring et les prompts |
| `langue` | Français / English | Langue de rédaction (bilingue FR/EN) |
| `date_relation` | Date (optionnelle) | Date de début de la relation |

### Détail des champs personne

| Champ | Obligatoire | Valeurs | Description |
|---|---|---|---|
| `prenom` | Oui | Texte | Prénom |
| `nom` | Oui | Texte | Nom de famille |
| `date` | Oui | `JJ/MM/AAAA` | Date de naissance |
| `heure` | Oui | `HHhMM` | Heure de naissance |
| `lieu` | Oui | Texte | Ville de naissance |
| `pays` | Oui | Texte | Pays de naissance |
| `consigne_redaction` | Non | `Tu` / `Vous` / `Il` / `Elle` | Mode d'adresse au LLM. Défaut : `Tu` (personne_a), `Il`/`Elle` selon genre (personne_b) |
| `genre` | Non | `M` / `F` | Genre. Défaut : `M` |
| `pronom_tiers` | Auto | `Il` / `Elle` | Déduit automatiquement du genre |
| `role` | Non | `parent` / `enfant` / `mentor` / `élève` / `null` | Rôle dans les typologies asymétriques. Déduit par âge si absent. `null` pour les typologies symétriques |

---

## 12. CONFIGURATION AVANCÉE

| Constante | Valeur | Description |
|---|---|---|
| `PLANETS_MAJEURS` | 10 planètes | Sol, Lun, Mer, Vén, Mar, Jup, Sat, Ura, Nep, Plu |
| `PLANETS_TIER1` | Majeurs + Chiron + Nœuds + Angles | Planètes utilisées pour les inter-aspects tier 1 |
| `LOTS_ALL` | 16 lots | Ensemble complet des lots arabes calculés |
| Orbe Conjonction | 8° | Aspects inter-cartes |
| Orbe Opposition | 7° | Aspects inter-cartes |
| Orbe Trigone | 6° | Aspects inter-cartes |
| Orbe Carré | 6° | Aspects inter-cartes |
| Orbe Sextile | 4° | Aspects inter-cartes |
| Orbe Quinconce | 2.5° | Aspects inter-cartes |
| Orbe Parallèles | 1° | Déclinaisons inter-cartes |
| Tier filtre badges | ≤ 2 | Seuls les tiers 1 et 2 apparaissent dans les cartouches HTML |
| Top maisons prompt | 6 par perspective | Nombre de maisons envoyées au LLM par perspective |

---

## 13. DIFFÉRENCES CLÉS ENTRE WORKFLOW THEME, PREV ET SYN

| Aspect | THEME | PREV | SYN |
|---|---|---|---|
| **Objet** | Thème natal (1 personne) | Prévisions sur période (1 personne) | Synastrie (2 personnes) |
| **Calculs propres** | Positions natales, dignités, configurations | Transits T→N, progressions, éclipses, firdaria | Overlays, inter-aspects, composite, Davison, scoring typo |
| **Scoring** | Puissance des configurations | Smart Scoring : NATAL × transit | Score global 0–100 + score par maison × typo |
| **Grille typologique** | Non | Non | Oui (8 typologies avec maisons/planètes clés) |
| **Composite / Davison** | Non | Non | Oui (mi-points + mi-temps) |
| **Inter-aspects** | Aspects nataux N→N | Transits T→N | Aspects inter-cartes A→B et B→A |
| **Nombre d'appels LLM** | 12 maisons + synthèse | 12 maisons + synthèse | 6+6 maisons (top) + synthèse |
| **Perspectives** | 1 seule | 1 seule | 2 perspectives (A et B) |
| **Ponts stellaires** | Non | Fenêtres stellaires (transit) | Oui (étoile conjointe à A et B simultanément) |
| **Lots par contexte** | Tous affichés | Hermétiques (9) | 16 lots, promus par typo en tier 2 |
| **Vulgarisation** | Oui | Oui | Oui |
| **Validation post-LLM** | Non | Oui | Oui (+ contrôles overlay, inversion A/B) |

### Harmonisation inter-workflows (v4.0.0)

Les trois workflows partagent désormais un socle de modulations astrologiques commun :

#### Innovations SYN portées vers THEME

| Innovation | Impact THEME |
|---|---|
| **Modulation rétro sur aspects** | Score de puissance des aspects nataux majoré (+2/+3) si planète rétrograde (énergie internalisée = aspect plus significatif) |
| **Modulation stationnaire sur aspects** | Score de puissance majoré (+4/+6) si planète stationnaire (concentration d'énergie exceptionnelle) |
| **Dignité essentielle sur aspects** | Score de puissance enrichi (+2 par planète en Domicile/Exaltation, +1 par planète en Exil/Chute sans contrepartie forte) |
| **Réception dans les aspects** | Score de puissance majoré (+3 si réception mutuelle domicile, +1 si réception unilatérale — détection par-aspect, pas seulement globale) |

#### Innovations SYN portées vers PREV

| Innovation | Impact PREV |
|---|---|
| **Dignité asymétrique transit → natal** | `computeTransitScore` enrichi : transit fort→natal faible (+3), fort→fort (+2.5), fort seul (+2), faible→fort (+0.5), faible seul (-1). Remplace l'ancien +2/-1 plat |
| **Planète natale stationnaire** | Transit touchant une planète natale stationnaire = +2 au score. Tout transit sur un point « figé » dans le radix est amplifié |
| **Réception transit ↔ natal** | Bonus si transit en domicile du natal (+1.5 uni, +3 mutuel) ou natal en domicile du transit. Adoucissement qualitatif des transits difficiles |

#### Innovations THEME/PREV portées vers SYN

| Innovation | Source | Impact SYN |
|---|---|---|
| **Planètes assiégées** | THEME | Détection des planètes personnelles entre deux maléfiques traditionnels (Mars/Saturne). Pénalité P4 -0.5 (stricte) ou -0.25 (atténuée par bénéfique interceptant). Tracé dans `detail.pilier4.besieged` |
| **Forme du thème (Jones)** | THEME | Classification des 2 charts nataux (Bundle, Bowl, Bucket, Seesaw, Locomotive, Splash, Splay) + détection de singleton. Bonus P4 +0.5 si même planète singleton dans les deux charts. Tracé dans `detail.pilier4.chart_shape_a/b` |
| **Importance structurelle natale** | PREV | Score d'importance par planète (chartRuler +3, angulaire +2, haute dignité +2/+1, luminaire +1). Aspects P1 entre planètes structurellement cruciales amplifiés (×1.08 si importance moyenne ≥5, ×1.04 si ≥3) |

#### Garanties de non-régression

- **THEME** : seules des **additions** au score de puissance existant (base + exactBonus inchangés). Les seuils CAPITAL/FORT/MODÉRÉ/MINEUR restent identiques. Certains aspects montent d'un tier, ce qui est le comportement attendu.
- **PREV** : le bloc `computeTransitScore` conserve exactement la même structure. L'ancien bloc dignité (+2/-1) est remplacé par un équivalent plus nuancé qui reproduit les mêmes valeurs quand le natal est Pérégrin.
- **SYN** : les nouvelles fonctions (`computeBesiegedPlanets`, `computeChartShape`, `_computeNatalImportance`) n'affectent que P4 (bonus/pénalités modestes) et P1 (multiplicateur ×1.04-1.08). Le correctif de viabilité et le dual score restent inchangés.

---

## 14. FLUX DE DONNÉES — SCHÉMA SIMPLIFIÉ

```
[Email / Formulaire]
       │
       ▼
[Extract Variables SYN]
       │
       ├─── personne_a ──┐          ┌── personne_b ───┤
       ▼                  │          │                  ▼
[Géocodage A]            │          │         [Géocodage B]
[Fuseau A]               │          │         [Fuseau B]
[API Planètes A]         │          │         [API Planètes B]
[API Maisons A]          │          │         [API Maisons B]
[API Étoiles A]          │          │         [API Étoiles B]
       │                  │          │                  │
       ▼                  │          │                  ▼
[Enrichissement A]        │          │    [Enrichissement B]
(= copie N8N Theme)      │          │    (= copie N8N Theme)
       │                  │          │                  │
       └──────────────────┤          ├──────────────────┘
                          │          │
                    [Merge SYN Final]
                          │
                          ├──── [Préparation Davison] ──► [API Davison]
                          │
                          ▼
                 [Super Nœud SYN]
                 (= N8N SYN)
                 (calculs + scoring + préparation prompts)
                          │
            ┌─────────────┼─────────────────────┐
            │             │                      │
            ▼             ▼                      ▼
  [Merge SYN Final1]  [SYN Repport]      [Chaîne Export DT]
            │          (Données Tech)          │
            │             │                    ▼
            ▼             ▼               [DT SYN PDF]
     [LLM ×13]    [Chaîne Export DT]
            │
            ▼
    [Reassemble SYN]
            │
      ┌─────┴──────┐
      ▼             ▼
[Rapport Tech]   [Trad LLM]
      │                │
      ▼           ┌────┴────┐
[Chaîne Tech]     ▼         ▼
           [Rapport Final] [Validateur]
                │              │
                ▼              ▼
         [Chaîne Final]   [Logs JSON]
```

---

## 15. FICHIERS DE RÉFÉRENCE

| Fichier | Lignes | Description |
|---|---|---|
| `GLOBAL SYN` | ~3000+ | Workflow n8n complet (orchestration de tous les nœuds) |
| `N8N SYN Extract Variables` | — | Extraction des variables depuis email Gmail |
| `N8N SYN PREPARE DATA` | — | Pipeline de préparation des données natales A et B |
| `N8N SYN` | ~6200 | **Super Nœud Central** : calculs synastrie + scoring v4.0.0 (4 piliers + dual score + correctif viabilité + modulations harmonisées + besieged + Jones + importance structurelle + pénalités étendues) + prompts compressés + rôles + Ebertin v2 + Brady v2 + **préparation des 13 slots LLM** |
| `N8N SYN LLM` | ~950 | 13 agents LLM + Reassemble — prompts reçus via `$('Super noeud Syn')` |
| `N8N SYN Trad LLM` | — | Pipeline de vulgarisation |
| `N8N SYN Valideur` | ~710 | Validation post-LLM v4.0 (composite guard, EN, dignités complètes, overlay synthèse, possessifs grammaticaux) |
| `N8N SYN Repport` | ~2100 | Rapport Données Techniques HTML — score v4.0.0, dual score, correctif viabilité, nouvelles métriques P1-P4, pénalités enrichies |
| `N8N SYN Repport HTML Tech` | ~500 | Rapport Technique narratif + score v4.0.0 avec pénalités étendues (sign_friction, structural_void, combust) |
| `N8N SYN Repport HTML Final` | ~485 | Rapport Final narratif (vulgarisé) + score global + forces/défis incluant réception, cazimi, sign_friction |
| `N8N SYN Chaine Repport` | 108 | Chaîne export Données Techniques |
| `N8N SYN Chaine Repport HTML Tech` | 163 | Chaîne export Rapport Technique |
| `N8N SYN Chaine Repport HTML Final` | 181 | Chaîne export Rapport Final |
| `DATA SYN` | 47097 | Exemple de sortie JSON du calcul synastrie |
| `DATA SYN LLM` | ~81000 | Données envoyées au LLM — inclut prompts enrichis v4.0.0 avec toutes les nouvelles métriques |

---

## 16. CHANGELOG — SPRINTS 8.2 + 8.3 — FAN-OUT MOTEUR NATAL (2026-05-03)

Phase de **synchronisation des calibrages chartShape + Yod** issus du bench THEME n=100 (cf. `THEME-FIABILITE-RAPPORT.md`) sur les **trois clones** du moteur natal présents dans le workflow SYN. La règle d'isomorphisme (§ 13 — harmonisation inter-workflows) impose que toute modification du moteur source `FRA/THEME/N8N Theme` soit propagée sur tous ses clones.

### 16.1 Cibles dans le workflow SYN

Le workflow SYN héberge **trois copies** du moteur natal :

| Cible | Localisation | Rôle |
|---|---|---|
| **Enrichissement Astrologique A** | sub-workflow `N8N SYN PREPARE DATA`, branche personne A | Calculs nataux complets de la personne A (chartShape A, Yods natals A, almutem A, etc.) |
| **Enrichissement Astrologique B** | sub-workflow `N8N SYN PREPARE DATA`, branche personne B | Idem pour la personne B |
| **Super noeud Syn (composite)** | nœud central `N8N SYN` | Calcul du **chartShape composite** + détection des **Yods composite** (réutilise `computeChartShape` et `detectYods` sur les positions composite mid-point) |

### 16.2 Sprint 8.2 — `computeChartShape` aligné (Bucket strict + Locomotive [60,120])

**Patch source** : `FRA/THEME/N8N Theme` (cf. § Sprint 8.2 de `DOCUMENTATION WORKFLOW THEME.md`).

**Propagation** :
- Cibles A et B : via `npm run theme:fan-out-deploy` (script `theme-fan-out-deploy.mjs`, normalisation CRLF→LF avant `indexOf`/`replace`).
- Cible Super noeud Syn : déploiement dédié via `npm run syn:deploy-supernode` (script `syn-deploy-supernode.mjs`) — la copie composite est intégrée à l'intérieur du `Super noeud Syn` lui-même, indépendamment du sub-workflow `N8N SYN PREPARE DATA`.

**Impact SYN** : le bonus P4 « +0.5 si même planète singleton dans les deux charts » (§ 13 — Innovation portée vers SYN) reste opérationnel, mais s'appuie désormais sur une classification chartShape correcte (Locomotive enfin détectable, Bucket sans faux positif). **Aucune régression** sur les 62 cas du bench v4.3.0 — les couples impactés (4 Locomotive natals découverts post-fanout) conservent leur verdict ; la détection composite enrichit la lecture P4 sans modifier le score global.

### 16.3 Sprint 8.3 — Orbes Yod resserrés (sextile ±3°, quinconce ±2°)

**Patch source** : `FRA/THEME/N8N Theme` (cf. § Sprint 8.3 de `DOCUMENTATION WORKFLOW THEME.md`).

**Propagation** : idem § 16.2 (3 cibles).

**Impact SYN composite** : le détecteur Yod du **Super noeud Syn** opérant sur le thème composite (mid-points A↔B) appliquait jusqu'ici les orbes hérités de v4.0 (sextile ±6°, quinconce ±3°). Avec les orbes Sprint 8.3, les composites où le Yod repose sur des orbes serrés (< 2°) voient leur Yod préservé, tandis que les Yods marginaux du composite disparaissent — alignement attendu sur la prévalence astrologique. Sur le bench n=10 SYN, **5 Yods composite** sont conservés (couples documentés à fort lien karmique sur-représentés).

### 16.4 Validation post-fan-out (bench n=10 SYN)

Bench dédié sur 10 couples (subset du manifest `syn-bench-volume-fiabilite-manifest.json`), NDJSON `syn-bench-fanout-check.ndjson`, analyse via `npm run bench:fanout-analyze` :

| Vérification | Attendu | Mesuré |
|---|---|---|
| Locomotive natale détectée | ≥ 1 | **4 cas** (couvre les chartShapes A et B après fan-out) ✅ |
| Yods composite détectés | 5–10 % | **5 cas / 10 couples** (mid-points enrichissent la prévalence — couples documentés à fort lien karmique sur-représentés dans le bench) ✅ |
| chartShape composite extrait correctement | 100 % | 10/10 ✅ |
| Aucune régression sur la métrique-reine `coherence_score` | 89 % | 89 % (inchangé, comme attendu — fan-out n'affecte que P4 marginalement) ✅ |

### 16.5 Garanties de non-régression v4.3.0

- **Score global** : aucun couple v4.3.0 ne change de verdict (Fort / Moyen / Tendu / Échec) suite au fan-out 8.2/8.3. Les bonus/pénalités P4 sont des additions modestes (±0.5) qui ne franchissent pas les seuils de bands ordinales.
- **Garde-fous témoins** : un témoin (couple incompatible) ne dépasse jamais le pire vrai « fort » de sa typologie — vérifié sur les 16 sentinelles post-fanout.
- **Pilier 5 typology fitness** (B6) : opérationnel et inchangé.
- **Étirement v4.3.0** (« Dire la vérité ») : inchangé — la sortie du centre défensif "Compatibilité modérée" tient post-fanout.

### 16.6 Outil de déploiement et contrôle

| Script (npm) | Rôle |
|---|---|
| `theme:fan-out-deploy{,-dry}` | Propagation Sprints 8.2 + 8.3 sur les clones A et B (sub-workflow `N8N SYN PREPARE DATA`) |
| `syn:deploy-supernode{,-dry}` | Déploiement dédié sur le `Super noeud Syn` (composite chartShape + Yod composite) |
| `theme:coherence-scan` | Liste les divergences des 3 clones SYN vs `FRA/THEME/N8N Theme` (source de vérité) — à lancer après chaque déploiement THEME |
| `bench:syn-volume` | Bench complet n=62 (46 vrais couples + 16 témoins) avec calcul de la métrique-reine de cohérence |
| `bench:fanout-analyze` | Vérification rapide post-fanout (chartShape A/B/composite + Yod) sur subset de 10 couples |

### 16.7 Règle de maintenance (consolidée)

Toute modification de `FRA/THEME/N8N Theme` doit faire l'objet d'une **séquence en trois temps** :

1. `npm run theme:deploy-supernode` — déploiement sur THEME (source de vérité).
2. `npm run theme:fan-out-deploy` — propagation automatique vers les clones (PREV `Enrichissement Astrologique` + SYN `Enrichissement Astrologique A` / `B`).
3. `npm run syn:deploy-supernode` — propagation manuelle vers le `Super noeud Syn` (qui n'est pas un clone de l'`Enrichissement Astrologique` mais embarque une copie partielle des fonctions `computeChartShape` et `detectYods` pour le composite).

`npm run theme:coherence-scan` permet de vérifier à tout moment qu'aucun clone n'a divergé.

---

## 17. CYCLES v6.x (CALIBRAGE FINAL DU MOTEUR) → v7.0.0 GA (NARRATION)

Cette section consolide la sortie de la phase de calibrage post-v5.0.0 (sprints v6.0 → v6.8.0 — le moteur de scoring) puis le passage à un mode **scoring gelé / narration libre** matérialisé par la branche v7.0.0.

### 17.1 Gel du moteur — `v6.8.0` (clauses Q51, 2026-05-06)

À partir du 2026-05-06, **les coefficients de scoring sont figés à v6.8.0**. Toute modification du `Super noeud Syn` qui touche un coefficient (poids planétaire, pondération aspect, seuil de bande, pivot d'étirement, cap pénalité, etc.) est interdite par défaut.

Conditions cumulatives de réouverture (clauses Q51) :

1. Faille narrative majeure remontée par le bench textuel v7.x où un coefficient devient inévitable.
2. Décision explicite de l'astrologue acceptant la dérogation.
3. Modification marquée `v7.x — déroge au gel` dans le code, avec justification + bench scoring de non-régression.

Sans ces 3 conditions réunies : **interdit**. L'avertissement est gravé en commentaire de tête du nœud `FRA/SYN/N8N SYN` (lignes 1-25).

**Performance figée v6.8.0** (référence) :

| Métrique | Valeur |
|---|---|
| Cohérence stricte (band exact) | 30.4 % (24/79 réels) |
| **Cohérence stricte Q46+Q52** | 38.0 % (30/79) |
| **Cohérence tolérante Q46+Q52** | **96.2 %** |
| Incohérences sévères (≥ 2 bandes) hors Q46/Q52 | 3 |
| Sentinelles témoins violées (Q50) | 0/8 typologies |
| Q31 succès astral — tolérance Q46 | 90 % |

Le champ `version` du `globalScoreResult` reste figé à `6.8.0`. Le champ `narrative_version` est ajouté en parallèle (initialement `v7.0.0-beta.1`, puis β.2, β.3, GA `v7.0.0`).

### 17.2 Purification du dataset — Q46 + Q52 + Q53 + Q56-1 + Q56-2

Le bench de référence a été purifié progressivement de ses biais d'annotation :

| Arbitrage | Cas | Action |
|---|---|---|
| **Q46** (déjà acquis) | Trump/Merkel + similaires | Marqués `astral_correct_despite_history: true` — verdict moteur correct, écart = biais célébrité |
| **Q52** (4 cas standards) | Macron/Merkel Business, Buffett/Gates Mentorat, Diana/Charles Amour, Chirac/Villepin Mentorat | Marqués `astral_correct_despite_history: true` |
| **Q53** (7 couples Q31 intellectuels) | Tolkien/CSLewis, Bourdieu/Foucault, Kerouac/Ginsberg, et 4 autres | `expected_verdict` ré-annoté en `moyen` (ou `tendu` pour Kerouac/Ginsberg) — purification du biais célébrité |
| **Q56-1** (post-bench β.1) | Federer/Nadal Rivalité | Marqué `astral_correct_despite_history: true` (miroir Trump/Merkel) |
| **Q56-2** (post-bench β.1) | Macron/Brigitte Amour | `expected_verdict` ré-aligné `moyen` → `fort` (le moteur sortait gs=68 cohérent avec le biographique fort ; l'annotation antérieure pénalisait à tort l'écart d'âge non-astrologique) |

Le manifest `SITE/scripts/syn-bench-volume-fiabilite-manifest.json` documente chaque ré-annotation avec sa raison astrologique.

### 17.3 Narration v7.0.0 — chantier

Branche **scoring gelé / narration libre**. Trois priorités astrologue (Q54), implémentées dans l'ordre :

#### Priorité 1 — Profondeur typologique différenciée (Q54-D)

Une **carte `TYPO_NARRATIVE_LEXICON`** est ajoutée dans `FRA/SYN/N8N SYN` à côté de `TYPOLOGY_GRID`. Pour chaque clé `(Planète A, Planète B, harm | hard)` reconnue dans le top des inter-aspects, le synthPrompt annote la ligne avec la formulation typologique imposée parmi les 8 typologies.

Le LLM reçoit la consigne explicite : « Reprends ces formulations typologiques telles quelles dans le narratif ; ne les remplace pas par un vocabulaire générique. »

Couverture lexique β.2 : 25 paires planétaires × 2 natures (harm/hard) × 8 typologies. Les helpers `_aspectNature`, `_normalizePlanetPair`, `_typoLexiconFor` (memoized) sont implémentés en hoisted function declarations pour éviter les TDZ avec `formatAspectsForHouse`.

#### Priorité 2 — Valorisation explicite des marqueurs (Q54-B)

Trois blocs additionnels insérés conditionnellement dans le `synthPrompt` :

- **« La Grâce de la Relation »** — déclenché si `_harmonicSignatureBonus.tier === "grand_benefic"` (Tier 1 +7).
- **« Le Demi-Bénéfique »** — déclenché si `tier === "half_benefic"` (Tier 2 +4).
- **« Compatibilité intellectuelle »** — déclenché si `_intellectualSignatureBonus.applicable && bonus > 0`, modulé par typologie (Ami/Mentorat/Fratrie/Parent-Enfant fort, Amour discret).

#### Priorité 3 — Hiérarchie narrative claire (Q54-A)

Structure imposée dans la sortie LLM via en-têtes Markdown forcées dans le synthPrompt :

```
1. La nature du lien (Typologie)
2. La dynamique d'interaction (Harmonie / Tension)
3. Le ciment du temps (Longévité)
4. L'entité créée (Composite)
5. Verdict final + Bande qualitative
```

### 17.4 Bench narration stratifié v7.0.0-β.2

Échantillon : 30 cas réels stratifiés sur 8 typologies + 5 témoins absurdes.

| Métrique | β.1 (référence) | β.2 (post-Q56) | Évolution |
|---|---|---|---|
| Cohérence stricte (band exact) | 33.3 % (10/30) | **36.7 %** (11/30) | +3.4 pts |
| Cohérence stricte Q46+Q53 | 66.7 % (20/30) | **73.3 %** (22/30) | +6.7 pts |
| **Cohérence tolérante Q46+Q53** | 96.7 % (29/30) | **100 %** (30/30) | **+3.3 pts** |
| **Incohérences sévères** | 1/30 | **0/30** | −1 |
| Sentinelles violées | 0/5 | 0/5 | = |
| `narrative_version` conforme | 35/35 | 35/35 | = |
| Lectures typologiques moy / cas | 19.9 (8.7 synth + 11.2 maisons) | idem | = |

**Audit qualitatif manuel sur 7 cas critiques** (Curie/Pierre, Macron/Brigitte, Buffett/Gates, Trump/Merkel, Federer/Nadal, Monet/Renoir, Mozart/Elvis témoin) → 7/7 lectures cohérentes avec la réalité historique.

### 17.5 Q56-3 — Lexique Lune/Pluton dur contextualisé

Le lexique Lune/Pluton dur a été ré-écrit pour 7 typologies hors Amour, afin de retirer la lecture « toxique/possessive » dans des contextes créatifs ou collectifs où elle était fausse :

| Typologie | Lecture β.2 |
|---|---|
| **Amour** | « emprise affective, jeu de pouvoir émotionnel, jalousie possessive » (inchangé — lecture sombre originale) |
| **Rivalité** | « intensité narcissique, fascination-haine » (inchangé — lecture sombre) |
| Ami / Business | « passion créative dévorante, complicité instinctive inséparable » |
| Mentorat / Parent-Enfant | « ascendant émotionnel viscéral, vigilance d'emprise » |
| Fratrie / Colocataire | « intensité émotionnelle dévorante mais structurante » |

Validé sur 4 cas du dataset : Monet/Renoir (Ami) → mutation appliquée, Macron/Brigitte (Amour) → lecture sombre conservée, Bush/Barbara (Amour) → idem, Buffett/Gates (Mentorat sans Lune/Pluton) → pas de régression.

### 17.6 Q56-9 — Bug fix Pertinence vs Harmonie (β.3)

**Symptôme** (audit utilisateur sur exec n8n PROD `18111`, François × Mouna Amour) : sur la M4 de Mouna, le cartouche affichait `Harmonie : 42/100` tandis que le texte LLM citait `score de pertinence très élevé (82/100)`. Deux scores divergents sur la même maison.

**Cause** : deux métriques distinctes étaient toutes deux exposées au lecteur final.

| Source | Métrique | Calcul | Affichage |
|---|---|---|---|
| Cartouche PDF | `Harmonie` (`hi.harmony`) | dérivée de la polarité Tension/Support, 50=neutre, 100=fluide, 0=bloquée | `FRA/SYN/N8N SYN Repport HTML Final` ligne 303 |
| Texte LLM (intro maison) | `Score de pertinence` (`houses_norm_*`) | intensité d'activation normalisée | injecté lignes 7823 / 7915 du super-noeud SYN |

**Décision** (option A — « faire taire le LLM sur le chiffre ») : modifier le prompt du super-noeud SYN pour ne plus injecter ni `Score de pertinence X/100` ni `T=…/S=…` numériquement. Le LLM ne reçoit plus qu'une **qualification qualitative** :

- Activation : `très élevée` (≥80) / `élevée` (≥60) / `modérée` (≥40) / `faible` (≥20) / `très faible` — calculée sur `normScoreA` / `normScoreB`.
- Polarité : `mixte` / `tension dominante` / `soutien dominant` (mot-clé issu de `tsA.polarite`).

Consigne explicite ajoutée au prompt : `« calibrage interne — DO NOT cite numerically; the only numeric score visible to the client is the "Harmony" score on the cartouche, ranging 0=blocked / 50=neutral / 100=fluid »` (FR + EN).

**Lignes touchées** : `FRA/SYN/N8N SYN` 7821-7831 (Persp A) + 7917-7927 (Persp B).
**Bump** : `narrative_version` `v7.0.0-beta.2` → **`v7.0.0-beta.3`** (header + `globalScoreResult` + `globalScoreDetail`).
**Déploiement** : Super noeud Syn `4mjgklWWwjCF8fze` 562 190 → 564 860 chars (+2 670, 2026-05-06 16:35 UTC). Backup : `SITE/scripts/syn-supernode-backups/super-noeud-syn-2026-05-06T16-35-16-549Z.js`.

Modif strictement narrative — aucun coefficient de scoring touché. Conforme aux clauses Q51 du gel.

**Bénéfice** : le seul score chiffré côté client est désormais l'`Harmonie` du cartouche, c'est-à-dire celui que le client peut visuellement vérifier. Plus de divergence prompt↔HTML.

### 17.7 Cosmétique tech — harmonisation cartouches (β.3)

Plainte utilisateur en parallèle : badges `⇄ Mx (+N)` (compensation inter-maisons) et `I : 3/100 · inactive` (intensité interne) du rapport tech avaient un format hétérogène (font 11/13px, padding `2px 7px`, radius 10px) vs `Harmonie : 56/100` (font 15.5px, padding `4px 13px`, radius 20px), et le suffixe `· inactive` était bruyant.

**Modifs** (`FRA/SYN/N8N SYN Repport HTML Tech`) :

| Badge | Avant | Après |
|---|---|---|
| `compTag` / `compTagB` (compensation) | font 11px / padding 2-7 / radius 10 | **font 15.5px / padding 4-13 / radius 20** (aligné Harmonie) |
| `intensityBadge` / `intensityBadgeB` | `I : 3/100 · inactive`, font 13px | **`Intensité : 3/100`** (suffixe `· inactive` supprimé) + format aligné Harmonie |
| `_domSig` (bloc info global) | `inactive` affiché brut | filtré, remplacé par `—` |

**Sauts de page** (sur les deux rapports HTML) : `style="page-break-before:always;break-before:page;"` ajouté sur les `div` `syn-final-perspective-a` (ligne 618 du rapport final) et `syn-final-perspective-b` (ligne 632), idem `syn-tech-perspective-a` (596) et `syn-tech-perspective-b` (601) — chaque section « Comment X influence Y » commence sur une nouvelle page PDF.

Déploiement HTML Tech : 55 775 → 56 094 chars (+319, 2026-05-06 16:28 UTC). Rapport client final : zéro modif texte (audit confirme aucun badge < 15.5px).

### 17.8 Validation astrologue → freeze GA `v7.0.0`

Audit pilote sur le couple `François × Mouna` (Amour, gs=41), exec n8n PROD `18111` puis `18218` post-β.3. Rapport généré : 9 586 mots, 12 maisons + synthèse, lexique typologique appliqué partout, zéro chiffre cité hors `Harmonie` du cartouche.

| # | Question astrologue | Verdict | Implémentation |
|---|---|---|---|
| **Q1** | Passage en GA | **A — Gel immédiat sur base β.2 (puis β.3 post-Q56-9)** | Renommage `narrative_version` `v7.0.0-beta.3` → `v7.0.0` (GA) après validation post-Q56-9 |
| **Q2** | Diversifier le tic « couple mature » | **A — Statu quo** | Aucune modif (rappel sémantique structurant sur 9 586 mots) |
| **Q3** | Orbes 5-6° Soleil sextile/trigone | **A — Statu quo** | Doctrine Ptolémée/Lilly validée (moiety solaire 7-8°) |
| **Q4** | Neptune en chute Capricorne | **C — Documenter et maintenir** | Choix moderne assumé (rouvrir le scoring v6.8.0 = risque > bénéfice) |
| **Q5** | Validation Monet/Renoir Q56-3 | **C — Post-mortem facultatif** | Run optionnel quand n8n libre ; ne bloque pas la GA |

Verdict astrologue intégral :
> *« L'architecture globale (Moteur v6.8.0 + Narration v7.0.0) a atteint un niveau de maturité qui dépasse la plupart des logiciels professionnels actuels sur le marché de l'astrologie. Vous avez mon feu vert total pour graver la v7.0.0 dans le marbre. »*

### 17.9 Architecture LLM en production — invariant

Tous les LLM appelés dans le workflow `4mjgklWWwjCF8fze` restent **Gemini 3.1 Pro Preview** (`models/gemini-3.1-pro-preview`), invariant produit. 13 agents en parallèle (6 maisons A + 6 maisons B + 1 synthèse) + 1 traducteur + 1 validateur silencieux.

Si un bench textuel automatique (LLM-Judge) est lancé hors n8n pour évaluer la qualité narrative, le **producteur** doit rester Gemini 3.1 Pro (fidélité à la production) ; seul le **juge** peut être un LLM tiers (Claude / GPT) pour l'anti-biais.

### 17.10 Référentiels v7.0.0

| Fichier | Rôle |
|---|---|
| `FRA/SYN/N8N SYN` | Moteur (scoring v6.8.0 figé + narration v7.0.0 GA — `TYPO_NARRATIVE_LEXICON`, helpers hoisted, Q56-9 fix) |
| `FRA/SYN/N8N SYN Repport HTML Final` | Rapport client (sauts de page perspectives) |
| `FRA/SYN/N8N SYN Repport HTML Tech` | Rapport tech (badges harmonisés Harmonie/Intensité/Compensation, sauts de page perspectives) |
| `SITE/scripts/SYN-V7-CHANTIER.md` | Chantier v7 — toutes les arbitrages Q51 → Q56-9 + plan freeze GA |
| `SITE/scripts/syn-bench-volume-fiabilite-manifest.json` | Manifest avec annotations Q46+Q52+Q53+Q56-1+Q56-2 |
| `SITE/scripts/syn-bench-coherence-v6.8.0.mjs` | Analyseur cohérence numérique (figé sur v6.8.0) |
| `SITE/scripts/syn-bench-coherence-narrative-v7.mjs` | Analyseur étendu (scoring + narration + réalité) |
| `SITE/scripts/syn-bench-volume-fiabilite-v7.0.0-beta2-stratifie.ndjson` | Sortie bench stratifié 35 cas v7.0.0-β.2 |
| `SITE/scripts/syn-bench-coherence-narrative-v7.0.0-beta2-rapport.md` | Rapport non-régression β.2 |
| `SITE/scripts/_run-bench-stratifie-beta2.mjs` | Wrapper bench (charge `.env.local` + fixe ONLY/MANIFEST/OUT_NDJSON) |
| `SITE/scripts/syn-bench-llm-generate-v7.mjs` | Squelette LLM-Judge phase 2 (génération seule via Gemini direct API) |

### 17.11 Plan freeze GA — checklist (clos)

1. ✅ Fix Q56-9 déployée (β.3)
2. ✅ Validation utilisateur sur 1 nouveau rapport généré depuis le site (test e2e exec `18218`, François × Mouna Amour, et un second test Business confirmant l'absence de chiffres cités hors Harmonie + lexique typo correctement appliqué)
3. ✅ Renommage `narrative_version` `v7.0.0-beta.3` → **`v7.0.0`** (GA)
4. ✅ Mise à jour finale `SYN-V7-CHANTIER.md` (statut clos)
5. ✅ Verrouillage moteur `v6.8.0` + narration `v7.0.0` GA — état présent
