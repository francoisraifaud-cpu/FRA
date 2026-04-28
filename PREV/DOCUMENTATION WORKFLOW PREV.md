# DOCUMENTATION WORKFLOW — PRÉVISIONS ASTROLOGIQUES

**Version** : v18.1 (Sprint 23.1 — Harmonisation inter-workflows v4.0)
**Plateforme** : n8n Cloud
**Auteur** : François Raifaud

---

## 1. VUE D'ENSEMBLE

Le workflow **PREV** produit l'analyse complète des prévisions astrologiques d'un individu sur une période donnée (annuelle, mensuelle, hebdomadaire ou journalière). Il reçoit les données de transit et le thème natal enrichi, puis génère :

- Des **calculs prévisionnels avancés** (transits lents/rapides, progressions, éclipses, firdaria, profections, etc.)
- Des **prompts structurés** pour un LLM (Gemini) maison par maison + synthèse globale
- Des **rapports HTML/PDF** techniques et finaux

### Architecture des nœuds

| Nœud | Fichier | Rôle |
|---|---|---|
| **Extract Variables** | `N8N Prev Extract Variables` | Extraction variables formulaire (prénom, nom, date, dates entrée/sortie, type rapport, genre, langue) |
| **Prepare Data Theme** | `N8N Prev Prepare Data Theme Individuel` | Appel API pour le thème natal de base |
| **Prepare Data Transits** | `N8N Prev Prepare Data Transits` | Appel API pour les transits journaliers sur la période + progressions + éclipses |
| **Merge Datas** | `N8N Prev Merge Datas` | Fusion des données thème + transits |
| **Enrichissement Astrologique** | Copie intégrale de `N8N Theme` (v7.0) | Calculs nataux complets (identique au workflow Theme) — hébergé dans le sub-workflow `N8N Prev Prepare Data Transits` |
| **Super Nœud / Moteur de Prompts** | `N8N Prev` | **NŒUD CENTRAL** — Analyse des transits + scoring + génération des prompts LLM |
| **Analyseur Technique** | `N8N Prev Repport` | Traitement des données brutes pour le rapport technique + moteur MDSE ISO + heatmap |
| **LLM Interprétation** | `N8N Prev LLM` | Appel Gemini 3.1 Pro Preview — interprétation (1 appel par maison + synthèse) |
| **Traducteur / Vulgarisateur** | `N8N Prev Trad LLM` | Appel Gemini — vulgarisation du texte technique pour le client final |
| **Validateur** | `N8N Prev Validateur` | Validation silencieuse post-LLM (JSON) — détection d'hallucinations |
| **Rapport Données Techniques** | `N8N Prev Repport HTML` | Rapport HTML des données techniques (tableaux transits, heatmap, contexte natal avancé) |
| **Rapport HTML Tech** | `N8N Prev Repport HTML Tech` | Assemblage du rapport narratif technique (texte LLM brut + cartouches) |
| **Rapport HTML Final** | `N8N Prev Repport HTML Final` | Assemblage du rapport narratif final (texte vulgarisé + cartouches) |

---

## 2. TYPES DE RAPPORTS

| Type | Période | Planètes rapides | Granularité heatmap |
|---|---|---|---|
| **Annuel** | 1 an (01/01 — 31/12) | Non | 12 colonnes (mois) |
| **Mensuel** | ~1 mois | Soleil, Mercure, Vénus, Mars | ~4-5 colonnes (semaines) |
| **Hebdomadaire** | ~1 semaine | Soleil, Lune, Mercure, Vénus, Mars | 7 colonnes (jours) |
| **Journalier** | 1 jour | Soleil, Lune, Mercure, Vénus, Mars | 1 colonne (snapshot du jour) |

---

## 3. NŒUD CENTRAL — SUPER NŒUD v6 (`N8N Prev`)

### 3.1 Données d'entrée

- `transitsData` — Positions planétaires jour par jour sur la période
- `luneData` — Données lunaires (lunaisons, éclipses)
- `eclipsesData` — Éclipses de la période
- `progressionsData` — Progressions secondaires
- `eclipsesProgressees` — Éclipses progressées
- `enrichedData` — Thème natal complet (depuis le nœud Enrichissement, copie de `N8N Theme`)

### 3.2 Données natales récupérées depuis l'Enrichissement

Toutes les données calculées par `N8N Theme` (v7.0) sont récupérées :
- Positions planétaires natales + maisons
- Prompts nataux (générés mais non utilisés par le workflow PREV — données inertes)
- Étoiles fixes (conjonctions planètes + angles)
- Éclipse natale
- Arbre des dispositions + dispositeur final
- Dignité accidentelle (Lilly)
- Hayz
- Planètes assiégées
- Lune Vide de Course
- Degrés Sabian
- Statistiques (secte, éléments, modes)
- **Almutem Figuris** (calcul complet 5 niveaux, incluant planètes modernes + bonus triplicité)
- **Forme du thème** (Jones Patterns) avec **identification du singleton** (nom + maison)
- **Gouverneur du thème** (maître de l'Ascendant)
- **Signes interceptés** (avec locataires piégés)

> **Note architecturale (v7.0)** : Le nœud `Enrichissement Astrologique` exécute le code intégral de `N8N Theme`. Celui-ci génère également des prompts nataux (propriétés `prompts` et `prompts_llm` dans le JSON de sortie), mais ces prompts ne sont lus par aucun nœud en aval dans le workflow PREV. Ils constituent des données inertes sans impact fonctionnel. Les prompts prévisionnels sont générés exclusivement par le Super Nœud (`N8N Prev`).

### 3.3 Calculs prévisionnels — Liste exhaustive

#### Section 2 — Utilitaires centralisés
- `parseDate` / `parseDateNaiss` — Parsing de dates unifié (dd/mm/yyyy ou ISO)
- `getOrb(deg1, deg2)` — Distance angulaire normalisée
- `PLANETS_MAJEURS` — Set des planètes prises en compte

#### Section 3 — Planètes en transit
- **Planètes lentes** (tout type de rapport) : Jupiter, Saturne, Uranus, Neptune, Pluton, Nœud Nord, Nœud Sud, Chiron, Lilith, Ceres, Pallas, Junon, Vesta
- **Planètes rapides** (mensuel/hebdo/journalier) : Soleil, Mercure, Vénus, Mars + Lune (hebdo/journalier)
- **Correction rétrograde** : exclusion Lune, Soleil, Nœuds des calculs de rétrogradation

#### Section 4 — Angles nataux
- ASC, IC, DSC, MC — degrés nataux pour détection des transits sur les angles

#### Section 5 — Filtrage des jours
- Restriction aux jours dans la période [date_entree, date_sortie]
- Auto-calcul du Nœud Sud en transit (opposition Nœud Nord)

#### Section 6 — Localisation
- Système de maisons Placidus (depuis les données natales)
- `findNatalHouse(deg)` — Localisation par cuspides Placidus
- `findWholeSignHouse(deg)` — Localisation en Signes Entiers (pour profections)

#### Section 7 — Dictionnaire natal
- `natalDict` : carte complète des positions natales (degré, signe, maison, déclinaison)
- Auto-calcul du Nœud Sud natal
- **Réplique des 9 Lots hermétiques** (Part de Fortune, Lot de l'Esprit, Nécessité, Éros, Courage, Némésis, Basis, Exaltation, Daemon) — calcul local indépendant du nœud Enrichissement

#### Section 7b — Carte des aspects nataux N→N
- Orbes variables par classe planétaire :
  - **Luminaires** (Soleil, Lune) : orbes larges (Conjonction/Opposition 12°)
  - **Personnelles** (Mercure, Vénus, Mars) : orbes standards (Conjonction/Opposition 10°)
  - **Lentes** (Jupiter → Pluton) : orbes réduits (Conjonction/Opposition 8°)
- Générateur de texte cascade N→N : réseau d'aspects activés en chaîne

#### Section 7c — Maîtrises et dignités en transit
- `getDignite(planete, signe)` — 5 niveaux (Domicile, Exaltation, Pérégrin, Exil, Chute)
- `formatDigniteTransit` — Force/faiblesse de la planète en mouvement
- `formatDigniteCompound` — Dignité composite Transit × Natal (Double force, Transit fort sur planète fragilisée, etc.)

#### Section 7d — Réceptions mutuelles natales
- Par domicile, par exaltation, semi-mutuelles
- Indexation par planète pour injection contextuelle

#### Section 7e — Translation de lumière
- Détection quand une planète rapide forme un aspect avec deux planètes lentes successivement
- Orbe ±2°, 5 types d'aspects

#### Section 7f — Midpoints nataux
- 45 midpoints (planètes majeures uniquement)
- Suivi des activations par transit

#### Section 7g — Degrés critiques
- Anarète (29°), Ingress (0°)
- Degrés critiques par mode (Cardinal, Fixe, Mutable)

#### Section 7h — Profections annuelles et mensuelles
- **Système configurable** : Signes Entiers (whole_sign) ou depuis les données (from_data)
- Calcul de l'âge → maison profectée → signe → seigneur de l'année
- Dignité du seigneur + sa maison natale
- Profection mensuelle de début de période

#### Section 7i — Antiscia nataux
- Antiscion et Contra-antiscion pour chaque planète natale
- Suivi des activations par transit (orbe ±1.5°)

#### Section 7j — Cycles de vie planétaires
- **Saturne** : quadratures, opposition, retours (~7, 15, 22, 30, 37, 44, 51, 59 ans)
- **Jupiter** : oppositions et retours (~6, 12, 18, 24, 30, 36, 42, 48 ans)
- **Uranus** : carrés et opposition (~21, 42, 63, 84 ans)
- **Nœud Nord** : oppositions et retours (~9, 19, 28, 37, 46, 56 ans)
- **Chiron** : opposition et retour (~25, 51 ans)

#### Section 7k — Ingress planétaires
- Détection des changements de signe des planètes lentes
- Inscription de la dignité au moment de l'ingress

#### Section 7l — Configurations natales
- Détection complète : Stellium, Grand Trigone, T-Carré, Grand Carré, Yod, Cerf-Volant, Croix Modale
- Indexation par planète pour contextualisation dans les prompts

#### Section 7m — Conditions héliocentriques natales
- Cazimi, Combuste, Sous les rayons, Oriental/Occidental (réplique du calcul Theme)

#### Section 7n — Maître du thème
- Double maîtrise : moderne + traditionnelle
- Contexte narratif enrichi pour le prompt

#### Section 7o — Almutem Figuris
- Calcul complet à 5 niveaux de dignité (Domicile +5, Exaltation +4, Triplicité +3, Terme +2, Décan +1)
- 5 points clés : ASC, Soleil, Lune, Part de Fortune, MC
- **v7.0** : inclut les planètes modernes (Uranus, Neptune, Pluton) dans `ALMUTEM_PLANETS` + bonus triplicité — résultat aligné avec le workflow Theme

#### Section 7p — Planètes angulaires natales
- Orbe ±5° sur ASC, IC, DSC, MC

#### Section 7q — Sect du thème
- Calcul géométrique (arc ASC→Soleil)
- Contexte sect complet (bénéfique/maléfique principal/secondaire/constructif/destructif)

#### Section 7r — Firdaria
- Chronocrateurs actifs : période majeure + sous-période
- Ordre diurne vs nocturne (7 planètes + NN/NS)
- Calcul du seigneur de la sous-période

---

### 3.4 SMART SCORING (v6 → v9)

#### `NATAL_IMPORTANCE[]`
Score structurel par planète natale :
- Gouverneur du thème : +30
- Almutem Figuris : +20
- Planète angulaire : +25
- Étoile fixe conjointe : +15
- Configuration natale : +10
- Luminaire : +10
- Dignité forte : +5
- **Singleton** (v7.0) : +3 bonus

#### `computeTransitScore()` — v9.1 : pondération orbe continue + harmonisation v4.0

Score individuel par transit T→Natal :
- Base par type d'aspect (Conjonction ×3, Opposition ×2.5, Carré ×2, Trigone ×1.5, Sextile ×1)
- Multiplicateur par planète de transit (Pluton ×5, Neptune ×4, Uranus ×4, Saturne ×3, Jupiter ×2.5, Chiron ×2, Nœud Nord ×2)
- **v9.0 — Pondération orbe continue** : remplacement du bonus par paliers (+3/<0.5°, +2/<1°, +1/<2°) par une fonction continue `4 × (1 - peakOrb / maxOrbForAspect)`. Le `maxOrbForAspect` est spécifique à chaque combinaison planète/aspect via `getTransitOrbSlow()`. Résultat : un transit exact (0°) reçoit +4, un transit à mi-orbe +2, un transit à la limite +0.
- **v4.0 — Dignité asymétrique transit → natal** : remplace l'ancien bonus plat (+2/-1 sur la dignité du transit) par un système asymétrique tenant compte des dignités des DEUX planètes :
  - Transit fort → natal faible : +3 (transformation forcée)
  - Transit fort → natal fort : +2.5 (double puissance)
  - Transit fort → natal neutre : +2 (standard)
  - Transit faible → natal fort : +0.5 (impact atténué)
  - Transit faible → natal neutre : -1 (énergie dispersée)
- **v4.0 — Planète natale stationnaire** : +2 si la planète natale touchée est stationnaire dans le radix. Tout transit la touchant est vécu avec une intensité amplifiée.
- **v4.0 — Réception transit ↔ natal** : bonus si le transit est dans le signe de domicile de la planète natale (ou inversement). +3 si réception mutuelle, +1.5 si réception unilatérale. Adoucit qualitativement les transits difficiles.
- **Singleton** (v7.0) : +1.5 bonus lorsque le transit touche la planète singleton
- Bonus : éclipse conjointe (+20), convergence temporelle (+15)
- **v9.0 — Double Activation modulée par poids** : au lieu de ×2 fixe, le multiplicateur est `1.5 + 0.5 × min(bestWeight, 1.0)`. Un arc/progression quasi-exact (weight ~1.0) donne ×2.0, un arc large (weight ~0.3) donne ×1.65.
- **v9.0 — Triple Activation modulée par poids** : au lieu de ×3 fixe, le multiplicateur est `2.0 + min(bestProgW + bestArcW, 1.0)`. Si progression ET arc sont exacts, ×3.0 (identique à avant). Si les deux sont larges, ×2.3.

#### Filtre Top N par maison
- Top 5 transits par maison dans le prompt LLM (anti-infobésité)
- Top 10 global dans la synthèse
- **v9.0** : dates de pic exact (`bestPeakDate`) et orbe au pic (`bestPeakOrb`) affichés dans les classements. Transit avec orbe < 0.3° tagué `📌 PIC EXACT`.

---

### 3.5 Techniques prévisionnelles spécifiques au workflow PREV

#### Progressions secondaires (Sprint 2 → v9.0)
- Extraction des positions progressées (Soleil, Lune, Mercure, Vénus, Mars, Jupiter, Saturne + ASC/MC progressés)
- Aspects Progression→Natal (orbe strict 1°)
- Stations progressées (inversion rétro)
- Changement de signe ASC/MC progressé vs natal
- Éclipses progressées (Tier 1)
- **v9.0 — Pondération vitesse (`PROG_SPEED`)** : chaque planète progressée reçoit un facteur de vitesse reflétant son rythme de déplacement réel. Lune ×1.5, Soleil/Mercure/Vénus ×1.0, Mars ×0.7, Jupiter/Saturne ×0.3, Uranus/Neptune/Pluton ×0.15, Angles (ASC/MC/DSC/IC) ×1.2.
- **v9.0 — Poids composite (`pWeight`)** : calculé comme `PROG_SPEED[planète] × (1 - orbe / 1.0°)`. Ce poids continu (0 → ~1.5) est inscrit dans le texte `[poids X.XX]` et stocké dans `progressedActivations` pour moduler les multiplicateurs de Double/Triple Activation.
- **v9.0 — Tags de précision** : progression avec orbe < 0.15° → `📌 ASPECT QUASI-EXACT — date significative` ; orbe < 0.4° → `★ aspect serré`. Tags de vitesse : axe rapide / mouvement lent.

#### Arcs solaires (Sprint D5 → v9.0)
- Calcul : degré natal + (âge × arc solaire annuel moyen)
- Aspects Arc→Natal (orbe configurable `SA_ORB`)
- **v9.0 — Pondération planétaire (`SA_PW`)** : facteurs par planète/angle — Angles (ASC, MC) ×2, Luminaires (Soleil, Lune) ×1.5, Planètes personnelles et lentes ×1, Chiron ×0.8.
- **v9.0 — Poids composite (`arcWeight`)** : calculé comme `SA_PW[planète] × (1 - orbe / SA_ORB)`. Ce poids est inscrit dans le texte et stocké dans `progressedActivations`.
- **v9.0 — Tags de précision** : arc avec orbe < 0.15° → `📌 ARC QUASI-EXACT — événement datable avec précision` ; orbe < 0.4° → `★ arc serré — événement probable`.

#### Double Activation (Sprint 2 → v9.0)
- Transit + Progression OU Arc Solaire sur le même point natal simultanément
- Flag ⚡DA dans les classements
- **v9.0** : multiplicateur dynamique `1.5 + 0.5 × min(bestWeight, 1.0)` au lieu de ×2 fixe

#### Triple Activation (Sprint D5 → v9.0)
- Transit + Progression + Arc Solaire sur le même point natal
- Flag ⚡⚡TA dans les classements
- **v9.0** : multiplicateur dynamique `2.0 + min(bestProgW + bestArcW, 1.0)` au lieu de ×3 fixe

#### Transit → Progressé (T→P) — v10.0
- Quand une planète en transit forme un aspect exact avec une planète **progressée**, elle "déclenche" concrètement la maturation intérieure indiquée par la progression.
- **Cibles progressées** : Soleil, Lune, Mercure, Vénus, Mars, ASC, MC progressés
- **Orbes** : Conjonction/Opposition 2°, Carré/Trigone 1.5°, Sextile 1° (plus serré que T→N)
- **Scoring** : `poids_aspect × (TRANSIT_POIDS[planète] / 3) × tightness`
- **Tags de précision** : `📌 TRANSIT→PROGRESSÉ QUASI-EXACT` (orbe < 0.15°), `★ transit serré sur progression` (orbe < 0.5°)
- **Multi-activation** : les T→P sont injectés dans `progressedActivations` pour contribuer aux mécanismes de Double/Triple Activation
- **Aucun appel API supplémentaire** — les données de transit et de progression sont déjà disponibles

#### Révolution Solaire (RS) — v10.0
- Date exacte du retour solaire (jour où le Soleil transit repasse sur le degré natal du Soleil)
- **Heure exacte** interpolée entre deux jours consécutifs pour précision infra-journalière
- **ASC et MC de la RS** calculés mathématiquement (Jour Julien + Temps Sidéral Local + conversion écliptique) à partir de lat/lon/tz récupérés depuis `$("2. Préparation dynamique1")`
- **ASC RS → maison natale** = **domaine dominant de l'année solaire** (donnée structurante majeure)
- Catalogue des positions planétaires au moment de la RS (maisons natales, dignités)
- Détection des conjonctions RS→Natal + ASC RS→Natal + MC RS→Natal (orbe ≤ 3°)
- Thème dominant identifié (planètes lentes par maison + maison de l'ASC RS)
- Injecté dans le prompt de la maison du Soleil natal + maison de l'ASC RS + synthèse globale

#### Révolutions Lunaires (RL) — v10.0
- Détection de tous les retours lunaires sur la période (~13 par an, ~1 tous les 27.3 jours)
- Pour chaque retour : positions des planètes lentes dans les maisons natales
- Rythme émotionnel mensuel identifié
- Injecté dans le prompt de la maison natale de la Lune + synthèse globale

#### Déclinaisons en transit (Sprint 3)
- OOB natal + OOB en transit
- Parallèles et Contra-Parallèles Transit→Natal
- Parallèles et Contra-Parallèles Progression→Natal
- Suivi des vagues (apparition / disparition)

#### Éclipses et lunations
- Nouvelles Lunes et Pleines Lunes dans chaque maison
- Éclipses solaires et lunaires
- Éclipses conjonctes aux planètes natales (événements rares, impact maximal)
- Résonance écliptique natale (transit sur le degré de l'éclipse de naissance)
- Enrichissement SAROS (optionnel)

#### Fenêtres de convergence temporelle
- Détection de multiples transits lents actifs simultanément sur la même maison
- Score haute intensité

#### Écho natal / Retour partiel
- Planète de transit revenant sur son propre degré natal (orbe strict)

#### Réceptions mutuelles en transit (T↔T)
- Coopérations planétaires temporaires entre planètes en transit

#### Syzygie prénatale de période
- Dernière Nouvelle Lune ou Pleine Lune avant le début de la période

#### Fenêtres stellaires
- Transits passant à ≤1° d'une étoile fixe natale
- Précalcul des distances transit/étoile sur toute la période

#### Stations rétrogrades et directes
- Détection des changements de direction (rétro→direct, direct→rétro)
- Calcul de la distance au degré natal le plus proche

#### Ombres rétrogrades (Pre/Post-shadow)
- Pré-ombre : planète entre degré de station directe et degré de station rétro (avant rétro)
- Post-ombre : idem après le retour direct

#### Passages aux angles
- Transits traversant ASC, IC, DSC, MC nataux

#### Aspects mondiaux T→T
- Aspects entre planètes de transit — climat collectif

#### Aspects Lune haute précision
- Pour rapports courts (hebdo/journalier) — aspects lunaires avec heure exacte

---

### 3.6 Prompt Engineering avancé (Sprint 4)

#### Charte éthique astrologie évolutive
- Préambule injecté dans chaque prompt
- Interdiction de fatalisme, prédictions médicales/juridiques, déterminisme absolu

#### Notice d'intensité hiérarchisée
- 4 niveaux : **ABSOLUS** (Pluton, Neptune, Uranus, éclipses conjonctes, Triple Activation) / **FORTS** (Saturne, Jupiter, Double Activation) / **STRUCTURANTS** (Chiron, Nœuds, convergences) / **NUANCES** (planètes rapides, midpoints, antiscia)

#### Token budgeting dynamique (E2)
- Score intensité par maison → calibrage de la longueur LLM :
  - Score ≥15 : LONG (30-50 lignes)
  - Score ≥8 : STANDARD (20-35 lignes)
  - Score ≥3 : COURT (12-20 lignes)
  - Score <3 : MINIMAL (5-10 lignes)
  - Maison vide : 2-3 phrases max

#### Contextual Bridging (E4)
- Résonances inter-maisons algorithmiques
- Sources : maîtrise de signe (maître d'un signe = pont vers sa maison), aspects nataux (cascades N→N), configurations natales activées, dispositor cascade (dispositeur final touché), dignité accidentelle forte

#### Profil de sensibilité
- Vulnérabilité/Familiarité élémentaire
- Résistance au changement / Adaptabilité

#### Anti-infobésité (v9.0 enrichi)
- Seuil `MINOR_TECH_SUPPRESS_THRESHOLD` (12) : au-delà, les techniques mineures (midpoints, antiscia, translations) sont masquées du prompt
- Note moteur injectée pour expliquer la suppression au LLM
- **v9.0 — Tri et plafonnement des progressions/arcs** :
  - Les textes de progressions et arcs solaires sont triés par **poids décroissant** (les aspects les plus serrés et les plus rapides en premier)
  - Plafonnement à **10 lignes par maison** et **15 lignes dans la synthèse globale**
  - Au-delà du plafond, note ajoutée : `→ X progression(s) mineure(s) supprimée(s) (poids < seuil)`

#### Mémo positions natales (B1)
- Injection en tête de chaque prompt : positions exactes maison + signe de chaque planète
- **Gouverneur du thème** (v7.0) : tag `⚠ GOUVERNEUR DU THÈME` ajouté dans `positionMemoPrev`
- Garde anti-hallucination : le LLM ne peut pas déplacer une planète

#### Fidélité aux données (v7.0)
- Instruction `FIDÉLITÉ AUX DONNÉES` injectée dans `cfg.sys` et `cfg.sysSynth`
- Interdit toute hallucination ou modification de données numériques (ex: familiarité 5/12 ne doit pas devenir 6/12)
- Garde anti-infobésité LLM renforcée

#### Charte anti-hallucination étendue (v9.0)
- **Règle 7 — Dates précises (📌)** : quand un transit, une progression ou un arc solaire porte le marqueur `📌`, la date fournie est astronomiquement exacte (orbe < 0.3°). Le LLM DOIT mentionner cette date explicitement. Interdit d'inventer des dates — uniquement les dates des pics fournies.
- **Règle 8 — Poids & priorité** : les aspects avec un `[poids]` élevé (> 0.8) sont plus fiables et discriminants que ceux à poids faible (< 0.4). Le LLM doit prioriser les aspects à poids élevé et ne pas donner la même importance à un aspect serré (poids 1.2) et un aspect large (poids 0.3).

---

### 3.7 Système de prompts LLM

#### Prompt System (`cfg.sys`)
- 4 profils typologiques selon le type de rapport :
  - **Annuel** : stratège / planificateur à long terme
  - **Mensuel** : coach de période intermédiaire
  - **Hebdomadaire** : guide tactique de la semaine
  - **Journalier** : compagnon du quotidien

#### Prompt User (par maison)
1. Mémo positions natales (garde anti-hallucination)
2. Charte éthique + Notice d'intensité + Disclaimer rétrograde
3. Contexte sect + Gouverneur + Almutem
4. Profection + Firdaria
5. Configurations natales actives dans cette maison
6. Locataires nataux (planètes, lots, étoiles fixes)
7. Degrés critiques nataux
8. Axe de maîtrise
9. Réceptions mutuelles natales + en transit
10. Syzygie prénatale
11. **Sections événementielles** :
    - Fenêtres de haute intensité (convergences)
    - Résonances écliptiques natales
    - Fenêtres stellaires
    - Éclipses conjonctes / dans le secteur
    - Lunaisons
    - Passages aux angles
    - Cycles rétrogrades complets (pré-ombre / rétro / post-ombre)
    - Translations de lumière (si score ≤ seuil)
    - Midpoints activés (si score ≤ seuil)
    - Antiscia (si score ≤ seuil)
    - Ingress planétaires
    - Cycles de vie
    - Degrés critiques
    - Écho natal
    - Configurations natales activées
    - Dignités en transit / composites
    - Stations rétrogrades et directes
    - Aspects mondiaux T→T
    - Aspects Lune précis
12. Classement transits prioritaires (Top 5)
13. Présence planètes lentes / Dynamiques d'activation / Ce que tu envoies
14. Planètes rapides (si applicable)
15. Déclinaisons
16. Progressions secondaires
17. Double Activation
18. **Signatures événementielles MDSE** (v13.0) — section `[SIGNATURES ÉVÉNEMENTIELLES]` si patterns matchent pour cette maison (hebdo/journalier)
19. Token budget

#### Prompt Synthèse
- Terrain natal complet
- Sect + Gouverneur + Almutem + **Singleton** (v7.0) + Firdaria + Profections
- **Seigneur de l'année** (v7.0 : corrigé `profections.annuelle?.seigneur` au lieu de `.maitre`)
- **Clarification Signes Entiers** (v7.0) : instruction explicite que les profections utilisent le système Signes Entiers, pas Placidus
- Parcours des planètes en maisons
- Grands cycles de la période
- Techniques avancées natales (Dispositions, Lilly, Hayz, Assiégées, VOC)
- Configurations natales
- Planètes angulaires
- Syzygie prénatale
- Convergences + Éclipses conjonctes + Échos nataux
- Cycles de vie + Ingress + Rétrogrades
- Midpoints + Degrés critiques + Antiscia
- Réceptions mutuelles
- Nœuds d'activation (planètes sous pression multiple)
- Éclipses de la période
- Axe nodal natal
- Étoiles fixes + Fenêtres stellaires
- Signature écliptique natale
- Profil de sensibilité
- Déclinaisons + Progressions + Double Activation
- Top 10 global des transits
- Consigne de rédaction

---

### 3.x Moteur de Signatures Événementielles — MDSE (`N8N Prev`, section 12b)

Le MDSE détecte des combinaisons astrologiques classiques multi-technique, multi-maison et génère des alertes thématiques.

> **⚠ Mise à jour avril 2026 — audit ISO Priorité 1 (`SITE/scripts/PREV-ISO-AUDIT.md`)** : contrairement à ce qu'affirmait la documentation pré-Sprint 14, le MDSE n'est **plus codé ISO** dans les deux nœuds. La situation réelle est :
> - **`N8N Prev` (Super noeud1)** = moteur principal complet, contient les Paliers 1 → 10B (`EVENT_SIGNATURES`, `_MDSE_TEMPORAL_TYPES`, `_MDSE_REPECHE_TYPES`, `_mdsePickPeaksByDensity`, `_mdsePickByConvergence`, etc.). Variables sans suffixe (`_mdseResults`, `aspectsSuiviLent`, …).
> - **`N8N Prev Repport` (Super noeud2 / "Analyseur Technique v")** = **fallback de secours uniquement**. Contient un MDSE ancien (variables suffixées `A` : `_mdseResultsA`, `_allSlowAspA`, …) qui n'est utilisé que si `_prevEventSignatures` (S1) est vide en runtime — ce qui ne se produit jamais en régime nominal.
>
> Le tableau ci-dessous décrit la convention de nommage des variables résiduelles dans S2 (utiles pour comprendre les fallbacks), mais la logique métier vivante (Paliers 1 → 10B) est strictement dans S1.

#### 14 catégories de signatures

| Code | Label | Seuil minConfidence |
|---|---|---|
| ACCIDENT | Risque physique / Accident | 40 |
| SANTE | Crise de santé / Chirurgie | 40 |
| CARRIERE_UP | Ascension professionnelle | 38 |
| CARRIERE_DOWN | Crise professionnelle | 40 |
| FINANCE_UP | Gain financier / Héritage | 38 |
| FINANCE_DOWN | Crise financière | 40 |
| MARIAGE | Mariage / Engagement | 40 |
| SEPARATION | Séparation / Divorce | 42 |
| ENFANT | Naissance d'un enfant | 38 |
| DEUIL | Deuil / Perte | 42 |
| RELOCATION | Déménagement / Relocation | 38 |
| SPIRITUEL | Crise existentielle / Éveil | 35 |
| JURIDIQUE | Problèmes juridiques / Litiges | 40 |
| VOYAGE | Voyage transformateur | 38 |

#### Composants du moteur

| Composant | Rôle | Variable `N8N Prev` | Variable `N8N Prev Repport` |
|---|---|---|---|
| Slow aspect tracker | Suivi jour-par-jour des aspects lents | `aspectsSuiviLent` | `_allSlowAspA` |
| Fast planet scan | Suivi vagues Mars/Vénus/Soleil (annuel) | `_mdseFastScan` | `_mdseFastScanA` |
| Progression tracker | Progressions + arcs solaires | `progressedActivations` | `_progActsA` |
| House scores | Score d'activité par maison | `houseScores` via `computeHouseScore()` | `_houseScoresA` |
| Declination pairs | Parallèles/contra-parallèles | `maisonsResult[h].declinaisons_texte` | `_declPairsA` |
| Eval condition | Évaluation d'une condition unitaire | `_mdseEvalCondition()` | `_mdseEvalCondA()` |
| Superposition | Boost mutuel entre signatures liées | Paires symétriques (+10/+8) | Idem |
| Temporalisation | Fenêtre pic (`peakWindow`) | Depuis `peakDate` des vagues | Idem |
| Natal boost | Pondération par sensibilité natale | `chartRuler`, `natalBoost` | `_chartRulerA`, `natalBoost` |

#### 13 types de conditions

`transit_in_house`, `transit_aspect`, `transit_on_angle`, `progression`, `solar_arc`, `eclipse_in_house`, `double_activation`, `declination_match`, `multi_house_active`, `house_axis_active`, `profection_house`, `firdaria_planet`, `station_on_natal`, `nodes_in_houses`

#### Orbes transit lent (identiques dans les deux nœuds — `TRANSIT_ORBES_SLOW`)

| Planète | Conj/Opp | Carré | Trigone | Sextile | Quinconce |
|---|---|---|---|---|---|
| Pluton | 1.5° | 1.5° | 1.5° | 1.0° | 1.0° |
| Neptune | 2.0° | 1.5° | 1.5° | 1.0° | 1.0° |
| Uranus | 2.0° | 2.0° | 1.5° | 1.0° | 1.0° |
| Saturne | 2.5° | 2.0° | 2.0° | 1.5° | 1.2° |
| Jupiter | 2.5° | 2.0° | 2.0° | 1.5° | 1.2° |
| Chiron/Nœuds | 2.0° | 1.5° | 1.5° | 1.0° | 1.0° |
| Lilith/Astéroïdes | 1.5° | 1.0° | 1.0° | 0.8° | 0.8° |

#### Anti-hallucination LLM

Les signatures MDSE avec `confidence < 50` ne sont **jamais** injectées dans les prompts LLM pour les catégories sensibles (ACCIDENT, DEUIL, SEPARATION, SANTE). Pour les catégories non-sensibles, seul le niveau `guidance` est fourni.

---

## 4. NŒUD ANALYSEUR TECHNIQUE (`N8N Prev Repport`)

Traitement des données brutes pour le rapport technique :

- Extraction de tous les aspects Transit→Natal avec suivi des vagues (dates, pics, scores)
- Indexation par maison natale et par maison de transit
- Propagation des données avancées natales (`natalDispositorTreeAT`, `natalAccDignityAT`, `natalHayzAT`, `natalBesiegedAT`, `natalMoonVOCAT`, `natalSabianAT`)
- Suivi stellaire (fenêtres étoiles fixes en transit)
- **v11.0 — Moteur heatmap autonome** : calcul complet et indépendant de la heatmap à partir de données 100% structurées (ISO avec `N8N Prev`). Inclut les 16 catégories d'événements + arcs solaires + transit→progressé.
- **v11.0 — Calcul des arcs solaires** : section SA→N portée depuis `N8N Prev` — aspects arcs solaires → natal avec orbe ≤ 1°, push structuré dans `rapportMaisons`
- **v11.0 — Transit → Progressé structuré** : détection T→P jour-par-jour avec injection dans `rapportMaisons.transit_progresse` (dates, aspects, vagues)
- **v13.0 — MDSE ISO** : moteur de signatures événementielles complet, aligné avec `N8N Prev`. Inclut suivi jour-par-jour des aspects lents avec orbes par planète, scan déclinaisons, double activation per-natal-planet, et toutes les 14 catégories de signatures.
- Construction du JSON `finalOutput` pour les rapports HTML

### Correctifs v7.0 :
- **Calcul de l'âge pour les profections** : formule corrigée (`ageA = anneeRpA - dateNaissA.getFullYear()`) — alignée avec le calcul de `N8N Prev` pour garantir la cohérence Seigneur de l'année entre les rapports
- **Suppression du code mort** : retrait des blocs d'override `$("Super noeud2")` pour Almutem, Singleton et Gouverneur, rendus obsolètes par la correction de fond du nœud `Enrichissement Astrologique`

---

## 5. RAPPORT DONNÉES TECHNIQUES (`N8N Prev Repport HTML`)

Rapport HTML/PDF contenant :

1. **Heatmap d'intensité adaptative** (v11.0 — moteur 100% structuré) :
   - Annuel : 12 colonnes (mois) × 12 lignes (maisons)
   - Mensuel : ~4-5 colonnes (semaines)
   - Hebdomadaire : 7 colonnes (jours)
   - Journalier : 1 colonne (snapshot du jour)
   - Échelle de couleur : blanc → jaune → orange → rouge → violet
   - Colonnes Tension / Support / Score (0-100)
   - Top 3 maisons les plus sollicitées
   - Texte pédagogique bilingue (FR/EN) adapté au type de rapport
2. **Synthèse par maison** : transits actifs avec dates, aspects, scores
3. **Tableau des aspects Transit→Natal** : détail avec vagues, pics, dignités
4. **Filtres de dignités actives** : uniquement pour les transits majeurs (Jupiter, Saturne, Uranus, Neptune, Pluton, Chiron)
5. **Progressions secondaires** : positions progressées + aspects Progression→Natal
6. **Structure du Thème Natal** (v7.0) :
   - **Gouverneur** du thème (maître de l'Ascendant)
   - **Almutem Figuris** (planète ayant le plus de dignités essentielles sur les 5 points clés)
   - **Sect** (Diurne/Nocturne)
   - Forme du thème (Jones Patterns) avec **singleton nommé**
7. **Contexte natal avancé** :
   - Arbre des dispositions + Dispositeur final
   - Dignité accidentelle (Lilly) — Top 10
   - Hayz
   - Planètes assiégées
   - Lune Vide de Course
8. **Éclipses et lunaisons**
9. **Firdaria** : chronocrateur actif
10. **Profections** : maison activée + seigneur de l'année
11. **Signatures événementielles MDSE** (v13.0) :
    - Badges colorés dans la heatmap : `haute` (≥65%, rouge), `moyenne` (≥50%, orange), `modérée` (<50%, gris)
    - Affichage : label + pourcentage de confiance + maisons impliquées
    - Seuil d'affichage : `confidence ≥ minConfidence` de chaque signature
    - Données ISO avec `N8N Prev` (mêmes orbes, mêmes formules, mêmes signatures déclaratives)

### Correctifs v7.0 :
- **Affichage Gouverneur / Almutem / Sect** : section "Structure du Thème Natal" enrichie pour afficher explicitement ces données stratégiques
- **Suppression du code mort** : retrait des blocs d'override `$("Super noeud2")` — idem que `N8N Prev Repport`

---

## 6. RAPPORT HTML TECHNIQUE (`N8N Prev Repport HTML Tech`)

Rapport narratif destiné aux **astrologues professionnels** :

- Structure : 12 cartouches de maisons + synthèse globale
- **v11.0 — Heatmap consolidée** insérée à la fin de la synthèse, avant le cartouche Maison 1
- Chaque cartouche contient :
  - Numéro de maison + signe(s) + degré cuspide
  - Locataires nataux (badges)
  - Lots hermétiques présents (badges colorés) — 16 lots calculés localement
  - Étoiles fixes conjointes aux planètes et à la cuspide (badges dorés ★/★★)
  - **Texte LLM BRUT** (non vulgarisé) — termes techniques conservés
- Texte pédagogique heatmap : explication technique détaillée (bilingue FR/EN)

---

## 7. RAPPORT HTML FINAL (`N8N Prev Repport HTML Final`)

Rapport narratif destiné au **client final** :

- Structure identique au rapport Tech (mêmes cartouches, mêmes badges)
- **Seule différence texte** : texte LLM vulgarisé par le Traducteur
- **v11.0 — Heatmap consolidée** insérée à la fin de la synthèse (même position que le rapport Tech)
- **v11.0 — Texte pédagogique vulgarisé** : explication simplifiée et accessible pour un utilisateur non-astrologue (bilingue FR/EN). L'explication technique reste uniquement dans les rapports DT et Tech.
- Lots hermétiques calculés localement (16 lots, harmonisés avec le workflow Theme)

---

## 8. VALIDATEUR SILENCIEUX (`N8N Prev Validateur`)

### Validations effectuées :
1. **`house_mismatch`** : planète attribuée à la mauvaise maison (boundary matching)
2. **`sign_mismatch`** : planète natale dans le mauvais signe — uniquement si mention explicite "natal/natale" (évite les faux positifs sur les positions de transit)
3. **`invented_aspect`** : aspect inexistant

### Mesures anti-faux-positifs :
- `matchWithBoundary` : frontières de mots pour numéros de maison
- `TRANSIT_VERBS` : liste étendue incluant verbes au futur, marqueurs temporels (cette année, en 2026...), expressions de transit (traversée, fait son entrée, visite de...), formes verbales (sera, formera, activera...)
- `validateSignText` : ne flag que si le contexte contient "natal/natale" — les positions de transit en signe différent ne sont pas des erreurs

### Sortie :
```json
{
  "warnings": [...],
  "totalWarnings": 0,
  "houseCount": 13,
  "timestamp": "..."
}
```

---

## 9. TRADUCTEUR LLM (`N8N Prev Trad LLM`)

### Règles de vulgarisation (identiques au Theme)
- **Termes SUPPRIMÉS** : Trigone, Carré, Opposition, Sextile, Quinconce, Cuspide, Décan, Terme, Triplicité, Orbe, Domicile, Exaltation, Exil, Chute, Pérégrin, Angulaire, Succédente, Cadente, Midpoint, Antiscia, Dignité, Cazimi, Combuste
- **Termes CONSERVÉS** : noms de planètes, noms de signes, noms d'étoiles fixes, "éclipse"
- **Remplacement** : "Maison X" → signification en langage courant
- **Contrainte** : 100% de la longueur et architecture conservées
- **Distinction NATAL / TRANSIT** : instruction spécifique au workflow PREV pour que le LLM ne confonde pas les interprétations natales et transitaires

### Garde genre grammatical (v7.0)
- Instruction explicite interdisant de modifier le genre grammatical du texte source
- Exemples fournis au LLM : masculin (passionné, déterminé, porté) / féminin (passionnée, déterminée, portée)
- Appliqué dans le prompt user ET le prompt system — cohérent avec `N8N Theme Trad LLM`

---

## 10. PARAMÈTRES DE PERSONNALISATION

| Paramètre | Valeurs | Impact |
|---|---|---|
| `consigne_redaction` | Tu / Vous / Il / Elle | Pronom dans le texte LLM |
| `genre` | M / F | Accords grammaticaux |
| `langue` | Français / English / ... | Langue de rédaction du LLM |
| `rapport` | Annuel / Mensuel / Hebdomadaire / Journalier | Granularité de l'analyse |
| `date_entree` | Date de début | Début de la période analysée |
| `date_sortie` | Date de fin | Fin de la période analysée |
| `annee` | Année cible | Année de référence pour profections/cycles |

---

## 11. CONFIGURATION AVANCÉE

| Constante | Valeur par défaut | Description |
|---|---|---|
| `PROFECTION_HOUSE_SYSTEM` | `"whole_sign"` | Système de maisons pour profections (whole_sign / from_data) |
| `MINOR_TECH_SUPPRESS_THRESHOLD` | `12` | Seuil de score au-delà duquel midpoints/antiscia/translations sont masqués |
| `TOP_TRANSIT_N` | `5` | Nombre de transits prioritaires par maison dans le prompt |
| `ORBE_ANGULAIRE` | `5.0` | Orbe pour détecter les planètes angulaires |
| `ORBE_STELL_AT` | `1.0` | Orbe pour fenêtres stellaires en transit |
| `ORBE_ECL_RES_AT` | `3.0` | Orbe pour résonance écliptique natale |
| `ORBE_MIDPOINT` | `1.5` | Orbe pour activation de midpoints |
| `ORBE_ANTISCIA` | `1.5` | Orbe pour antiscia en transit |
| `ORBE_TL` | `2.0` | Orbe pour translations de lumière |
| `NODE_PREP_DYNAMIQUE` | `"2. Préparation dynamique1"` | Nom du nœud upstream pour lat/lon/tz (RS) — externalisé v13.0 |

---

## 12. DIFFÉRENCES CLÉS ENTRE WORKFLOW THEME ET PREV

| Aspect | THEME | PREV |
|---|---|---|
| **Objet** | Thème natal (snapshot) | Prévisions sur une période (dynamique) |
| **Calculs propres** | Positions natales, dignités, configurations, lots | Transits T→N, progressions, éclipses, firdaria, profections, scoring |
| **Scoring** | Score de puissance des configurations et aspects | Smart Scoring : NATAL_IMPORTANCE × computeTransitScore |
| **Token budgeting** | Non (chaque maison a un volume similaire) | Oui (calibré par score d'intensité) |
| **Anti-infobésité** | Non nécessaire | Seuil de suppression des techniques mineures |
| **Progressions** | Non | Oui (secondaires + éclipses progressées) |
| **Double/Triple Activation** | Non applicable | Oui (Transit + Progression + Arc Solaire) |
| **Firdaria** | Non | Oui (chronocrateur actif sur la période) |
| **Profections** | Non | Oui (annuelles + mensuelles) |
| **Cycles de vie** | Non | Oui (Saturne, Jupiter, Uranus, Nœud Nord, Chiron) |
| **Heatmap** | Non | Oui (intensité par maison, adaptative selon type de rapport) |
| **Signatures événementielles (MDSE)** | Non | Oui (14 catégories, detection combinatoire multi-technique) |

---

## 13. FLUX DE DONNÉES — SCHÉMA SIMPLIFIÉ

```
[Formulaire Utilisateur]
       │
       ▼
[Extract Variables]
       │
       ├──────────────────────────────────────────────┐
       ▼                                               ▼
[Prepare Data Theme]                    [Prepare Data Transits]
       │                                    │
       ▼                                    ├── [Enrichissement Astrologique]
   (données API thème)                      │      (= copie intégrale N8N Theme v7.0)
       │                                    │      hébergé dans ce sub-workflow
       │                                    ▼
       └──────────┬────────────────────────┘
                  │
                  ▼
           [Merge Datas]
                  │
        ┌────────┼────────────────────────────┐
        ▼        ▼                             ▼
 [Super Nœud]  [Analyseur Technique]    [Rapport Données]
 (= N8N Prev)  (= N8N Prev Repport)    (= N8N Prev Repport HTML)
        │              │                       │
        │              ▼                       ▼
        │     [Rapport Données           [DT PREV PDF]
        │      Techniques PDF]
        │
        ├─── [LLM ×13] ──► [Texte brut] ──► [Rapport HTML Tech]
        │
        └─── [Traducteur LLM ×13]
                  │
                  ├──► [Rapport HTML Final]
                  │
                  └──► [Validateur] ──► [Logs JSON]
```

> **Note d'architecture (v7.0)** : Le nœud `Enrichissement Astrologique` est hébergé dans le sub-workflow `N8N Prev Prepare Data Transits`, et non directement visible dans `GLOBAL PREV`. Le `Super Nœud`, l'`Analyseur Technique` et le `Rapport Données` s'exécutent en **branches parallèles** depuis `Merge Datas`. Conséquence : `$("Super noeud2")` ne peut pas être référencé depuis les nœuds de reporting — toutes les données natales doivent transiter via `enrichedData` (provenant de l'Enrichissement).

---

## 14. CHANGELOG — SPRINT 8 (v7.0)

### Correction de fond
| Composant | Correction | Impact |
|---|---|---|
| **Enrichissement Astrologique** (`N8N Prev Prepare Data Transits`) | Remplacement intégral du code par `N8N Theme` v7.0 | Almutem, Singleton, Gouverneur, Sect, Forme du thème désormais corrects à la source pour tout le workflow PREV |

### Bugs corrigés
| Bug | Nœud | Cause racine | Correctif |
|---|---|---|---|
| Almutem = Mars au lieu de Pluton dans DT PREV | Enrichissement Astrologique | Code obsolète sans planètes modernes ni bonus triplicité | Mise à jour code Enrichissement |
| Singleton non nommé ("Bucket" sans mention Jupiter) | Enrichissement Astrologique | `computeChartShape` ne renvoyait pas le nom du singleton | Refactoring dans `N8N Theme` + propagation via Enrichissement |
| Seigneur de l'année incohérent (Neptune/M3 vs Mars/M4) dans DT PREV | `N8N Prev Repport` | Calcul d'âge divergent avec `N8N Prev` (`hasBirthdayPassed` vs formule directe) | Alignement formule `ageA = anneeRpA - dateNaissA.getFullYear()` |
| Genre féminin pour un client masculin dans rapport vulgarisé | `N8N Theme Trad LLM` + `N8N Prev Trad LLM` | Hallucination LLM lors de la réécriture | Garde genre explicite dans prompt user + system (exemples masculin/féminin) |
| Familiarité Feu 6/12 au lieu de 5/12 | `N8N Prev` | Hallucination LLM sur données numériques | Instruction anti-hallucination numérique dans `promptSynth` |
| `profections.annuelle?.maitre` renvoyait `(?)` | `N8N Prev` | Propriété inexistante (`.maitre` au lieu de `.seigneur`) | Correction en `.seigneur` |
| Gouverneur absent du DT PREV | `N8N Prev Repport HTML` | Champ non affiché dans la section Structure du Thème | Ajout Gouverneur + Almutem + Sect dans la section dédiée |
| `memoLines` avant initialisation | `N8N Theme` | Variable utilisée dans un rappel final avant déclaration (boucle per-house) | Construction de `rappelLines` directement dans la boucle |

### Améliorations prompts LLM
| Amélioration | Nœud | Détail |
|---|---|---|
| Singleton dans le scoring PREV | `N8N Prev` | +3 dans `NATAL_IMPORTANCE`, +1.5 dans `computeTransitScore`, tags `SINGLETON` / `→SINGLETON` dans `synthGroups` et `roleTagsArr` |
| Singleton dans les prompts | `N8N Prev` | Instructions explicites dans `promptSynth` + prompts par maison |
| Gouverneur dans le mémo positions | `N8N Prev` | Tag `⚠ GOUVERNEUR DU THÈME` dans `positionMemoPrev` |
| Fidélité aux données | `N8N Prev` | Instruction `FIDÉLITÉ AUX DONNÉES` dans `cfg.sys` et `cfg.sysSynth` |
| Clarification profections | `N8N Prev` | Instruction explicite : système Signes Entiers ≠ Placidus |
| Terminologie secte Mars/Saturne | `N8N Theme` | Instructions dans `pSynth` et prompts per-house pour in-sect vs contra-sect |

### Nettoyage du code
| Action | Nœuds concernés |
|---|---|
| Suppression des blocs d'override `$("Super noeud2")` (code mort) | `N8N Prev Repport`, `N8N Prev Repport HTML` |
| Blocs try/catch inutiles retirés | `N8N Prev Repport`, `N8N Prev Repport HTML` |

---

## 12. CHANGELOG — SPRINT 9 (v8.0) — Anti-hallucinations systémiques

### Audit exhaustif et corrections

Audit complet des 4 rapports narratifs vs Données Techniques — chaque affirmation vérifiable cross-référencée.

| Hallucination | Gravité | Cause racine | Correctif |
|---|---|---|---|
| "Uranus maître de M2" (vrai : Neptune/Poissons) | CRITIQUE | `positionMemo` ne listait pas les maîtrises de maisons | Ajout `[MAÎTRISES DE MAISONS]` dans `positionMemoPrev` |
| "Vulnérabilité Terre" au lieu de "Air" (8 occ. per-house) | CRITIQUE | `sensitivityProfile` absent des prompts per-house | Injection `natalSensitivityProfile` dans chaque prompt per-house |
| "Stellium Vénus/Saturne/Uranus en M11" (Vénus en M10) | MOYENNE | Confusion stellium par signe vs résidence | Disclaimer dans `promptSynth` section CONFIGURATIONS |
| "Bételgeuse = étoile royale" | MINEURE | Pas de garde-fou | Instruction dans tous prompts (synthèse + per-house) |

### Gardes préventives

| Garde | Portée | Détail |
|---|---|---|
| Maîtrises de maisons | `positionMemoPrev` (tous prompts) | M1=X(signe)...M12=Y(signe) + "maître = ruler CUSPIDE, pas interception" |
| Profil sensibilité per-house | 12 prompts maison | FAMILIARITÉ/VULNÉRABILITÉ injectés avant memoRappel |
| OOB exclusif | `positionMemoPrev` | Liste fermée OOB natales |
| Signes interceptés | `positionMemoPrev` | "NE GOUVERNE PAS la maison" |
| Disclaimer configurations | `promptSynth` | "Stellium par signe ≠ résidence par maison" |
| Étoiles Royales | Tous prompts | Aldébaran, Régulus, Antarès, Fomalhaut uniquement |

### Fichiers modifiés
- `N8N Prev` : positionMemoPrev enrichi, sensitivityProfile per-house, garde étoiles, disclaimer configs
- `N8N Prev Prepare Data Transits` : Enrichissement Astrologique mis à jour avec N8N Theme v8.0

---

## 14. CHANGELOG — SPRINT 10 (v9.0) — Portage innovations DHN

### Origine

Toutes les innovations développées et validées dans le workflow **DHN** (Déduction de l'Heure de Naissance) ont été portées vers PREV. L'objectif : améliorer la précision du scoring, la fiabilité des prédictions et l'exploitation des dates exactes.

### Innovations scoring

| Innovation | Détail technique | Impact |
|---|---|---|
| **Orbe continue (`computeTransitScore`)** | `4 × (1 - peakOrb / maxOrbForAspect)` remplace les paliers +3/+2/+1 | Scoring plus fin : un transit exact vaut +4, à mi-orbe +2, au bord +0. Élimine les effets de seuil artificiels |
| **Vitesse progressions (`PROG_SPEED`)** | Dictionnaire de 16 entrées : Lune ×1.5 → Pluton ×0.15 | La Lune progressée (rapide, observable) pèse 10× plus qu'un Neptune progressé (quasi-immobile) |
| **Pondération arcs solaires (`SA_PW`)** | Angles ×2, Luminaires ×1.5, Chiron ×0.8 | Un arc sur l'Ascendant pèse 2× plus qu'un arc sur une planète lente |
| **Poids composite (weight)** | `vitesse × (1 - orbe / maxOrbe)` pour progressions et arcs | Score continu combinant la pertinence astronomique (vitesse) et la précision géométrique (orbe) |
| **Double Activation modulée** | `1.5 + 0.5 × min(bestWeight, 1.0)` | Le multiplicateur varie entre ×1.65 (aspects larges) et ×2.0 (aspects exacts) |
| **Triple Activation modulée** | `2.0 + min(bestProgW + bestArcW, 1.0)` | Le multiplicateur varie entre ×2.3 et ×3.0 selon la qualité des aspects de support |

### Innovations textualisation & reporting

| Innovation | Détail | Portée |
|---|---|---|
| **Tags de précision progressions** | `📌 ASPECT QUASI-EXACT — date significative` (orbe < 0.15°), `★ aspect serré` (orbe < 0.4°) | Texte progression per-house + synthèse |
| **Tags de précision arcs** | `📌 ARC QUASI-EXACT — événement datable avec précision` (orbe < 0.15°), `★ arc serré — événement probable` (orbe < 0.4°) | Texte arc per-house + synthèse |
| **Tags de vitesse** | `(axe rapide)` pour speed ≥ 1.2, `(mouvement lent — effet de fond)` pour speed ≤ 0.3 | Texte progression |
| **Pic exact transits** | `📌 PIC EXACT le {date} ({orbe}°)` pour orbe < 0.3° dans `synthGroups` et classements | Texte transit + Top N per-house + Top 10 global |
| **Date de pic dans les vagues** | `📌 DATE PRÉCISE : pic le {date}` dans chaque vague de transit avec orbe < 0.3° | Texte détaillé `phrEnvoie` / `phrRecoit` |
| **Poids visible** | `[poids X.XX]` inscrit dans chaque texte de progression et d'arc solaire | Transparence algorithmique pour le LLM |

### Anti-infobésité

| Mécanisme | Paramètre | Effet |
|---|---|---|
| Tri par poids décroissant | Progressions + arcs dans les prompts | Les activations les plus discriminantes apparaissent en premier |
| Plafonnement per-house | 10 lignes max | Limite l'injection de progressions/arcs mineures dans le prompt maison |
| Plafonnement synthèse | 15 lignes max | Limite dans le prompt de synthèse globale |
| Note de suppression | Insérée automatiquement si dépassement | `→ X progression(s) mineure(s) supprimée(s) (poids < seuil)` |

### Anti-hallucination

| Règle | Contenu |
|---|---|
| **Règle 7 — Dates précises** | Le marqueur `📌` signifie une date astronomiquement exacte (orbe < 0.3°). Le LLM DOIT la mentionner. Interdit d'inventer des dates. |
| **Règle 8 — Poids & priorité** | Aspects à poids élevé (> 0.8) = fiables et discriminants. Aspects à poids faible (< 0.4) = de fond. Le LLM doit hiérarchiser en conséquence. |

### Fichiers modifiés
- **`N8N Prev`** uniquement (Super Nœud) — toutes les modifications sont concentrées dans ce fichier
- `N8N Prev Repport`, `N8N Prev Repport HTML`, `N8N Prev Repport HTML Final` : **inchangés** — ils héritent automatiquement des textes enrichis (poids, tags 📌) générés par le Super Nœud

### Configuration ajoutée

| Constante | Valeur | Description |
|---|---|---|
| `PROG_SPEED` | Dictionnaire 16 entrées | Facteur de vitesse par planète/angle progressé |
| `SA_PW` | Dictionnaire 13 entrées | Facteur de poids par planète/angle en arc solaire |
| `PROG_ORB` | 1.0° | Orbe max pour les progressions (utilisé dans le calcul de tightness) |
| `SA_ORB` | (existant) | Orbe max pour les arcs solaires (utilisé dans le calcul de tightness) |

---

## 15. CHANGELOG — SPRINT 11 (v10.0) — Transit→Progressé, Révolution Solaire, Révolutions Lunaires

### Origine

Trois techniques prévisionnelles manquantes ont été identifiées et implémentées pour compléter le système à 4 couches d'activation. L'objectif : transformer "activation du domaine X en 2026" en "**déclenchement précis le J/M/A, confirmé par 4 couches indépendantes**".

### Nouvelles techniques

| Technique | Section | Appels API | Impact |
|---|---|---|---|
| **Transit → Progressé (T→P)** | 10d | 0 (zéro) | Le chaînon manquant : quand un transit touche une planète PROGRESSÉE, il déclenche concrètement la maturation. Ajoute une 4ème couche d'activation. |
| **Révolution Solaire (RS)** | 10e | 0 (zéro) | Date du retour solaire annuel + catalogue complet des positions planétaires → thème dominant de l'année. |
| **Révolutions Lunaires (RL)** | 10f | 0 (zéro) | ~13 retours lunaires par an avec positions planétaires → rythme émotionnel mensuel. |

**Aucun appel API supplémentaire** — les trois techniques exploitent les données déjà disponibles (`daysArray`, `progClosestEntry`).

### Détails techniques — Transit → Progressé

| Paramètre | Valeur |
|---|---|
| Cibles progressées | Soleil, Lune, Mercure, Vénus, Mars, ASC, MC |
| Planètes de transit | Planètes lentes (Jupiter → Pluton + Chiron + Nœuds + Lilith) |
| Orbes | Conj/Opp 2°, Carré/Trigone 1.5°, Sextile 1° |
| Scoring | `poids_aspect × (TRANSIT_POIDS / 3) × tightness` |
| Suivi des vagues | Oui (entrée/sortie d'orbe, pic, date pic) |
| Tags précision | `📌` (orbe < 0.15°), `★` (orbe < 0.5°) |
| Multi-activation | Injecté dans `progressedActivations` → alimente DA/TA |
| Texte injecté dans | `progressions_texte` (emoji 🎯) |

### Détails techniques — Révolution Solaire

| Paramètre | Valeur |
|---|---|
| Détection | Jour où `getOrb(SoleilTransit, SoleilNatal)` est minimal sur la période |
| Données générées | Positions de 10 planètes dans les maisons natales + dignités |
| Conjonctions RS→Natal | Détectées avec orbe ≤ 3° pour chaque planète RS vs chaque point natal |
| Thème dominant | Liste des planètes lentes par maison |
| Prompt per-house | Injecté dans la maison du Soleil natal |
| Prompt synthèse | Section dédiée `[🌞 RÉVOLUTION SOLAIRE]` |

### Détails techniques — Révolutions Lunaires

| Paramètre | Valeur |
|---|---|
| Détection | Jours où `getOrb(LuneTransit, LuneNatale)` est minimal avec espacement > 20 jours |
| Données par retour | Date + Lune (maison, signe) + 5 planètes lentes (maisons) |
| Prompt per-house | Injecté dans la maison natale de la Lune |
| Prompt synthèse | Section dédiée `[🌙 RÉVOLUTIONS LUNAIRES]` avec les 13 retours |

### Système à 4 couches d'activation

| Couche | Technique | Ce qu'elle montre | Précision temporelle |
|---|---|---|---|
| 1 | Transit → Natal | Quel domaine est activé | Mois (vagues) |
| 2 | Progression → Natal | Quelle maturation intérieure | Année |
| 3 | Arc Solaire → Natal | Quel événement concret | Année |
| 4 | **Transit → Progressé** | **Quand exactement ça se déclenche** | **Jour (pic)** |
| Contexte | Révolution Solaire | Décor planétaire de l'année | Annuel |
| Contexte | Révolutions Lunaires | Rythme émotionnel mensuel | ~27 jours |

### Fichiers modifiés
- **`N8N Prev`** uniquement — 3 nouvelles sections (10d, 10e, 10f), 2 nouveaux champs `maisonsResult` (`revolution_solaire_texte`, `revolution_lunaire_texte`), injection dans prompts per-house et synthèse
- **Aucun autre fichier modifié**

### Limites connues

| Limite | Détail | Solution future |
|---|---|---|
| ~~Pas d'ASC de Révolution Solaire~~ | **RÉSOLU v10.1** — ASC et MC de la RS calculés mathématiquement via lat/lon/tz récupérés depuis `$("2. Préparation dynamique1")` | ✅ |
| Pas d'ASC de Révolution Lunaire | Le calcul de l'ASC au moment exact de la RL nécessite lat/lon + heure exacte | Appliquer le même calcul mathématique que pour la RS (interpolation heure + JD + LST) |
| Résolution Lune = 1 jour | `daysArray` a une résolution quotidienne ; la Lune bouge ~13°/jour → les retours lunaires sont approximatifs (±0.5 jour) | API dédiée ou interpolation infra-journalière |
| Progressions = snapshot statique | `progClosestEntry` est la progression la plus proche du milieu de période ; la Lune progressée bouge ~12°/an | Interpolation entre `closestProg` et `secondProg` pour les rapports < annuels |

---

## 16. CHANGELOG — SPRINT 11.1 (v10.1) — ASC/MC de la Révolution Solaire

### Problème résolu
L'ASC de la Révolution Solaire était identifié comme non calculable car `lat/lon` n'étaient pas disponibles dans le Super Nœud.

### Solution implémentée
Les coordonnées géographiques (latitude, longitude) et le fuseau horaire (`timezone`) sont récupérés depuis le nœud `$("2. Préparation dynamique1")` qui est en amont dans le même workflow GLOBAL PREV. Son output `body` contient un JSON stringifié avec toutes les données nécessaires.

### Calcul mathématique de l'ASC/MC de la RS
1. **Interpolation horaire** : entre le jour précédent et le jour du retour solaire, fraction linéaire → heure TU du retour exact
2. **Jour Julien** : calcul complet (JD) pour la date de la RS
3. **Temps sidéral** : GST à 0h UT + correction pour l'heure exacte + longitude → LST (Local Sidereal Time)
4. **ASC** : `atan2(-cos(ARAMC), sin(ARAMC)*cos(ε) + tan(lat)*sin(ε))` — formule standard en coordonnées écliptiques
5. **MC** : `atan2(sin(ARAMC), cos(ARAMC)*cos(ε))` — Medium Coeli

### Données injectées
- `✦ ASC RS` : degré, signe, maison natale — affiché en tête des positions RS
- `✦ MC RS` : idem
- **Conjonctions ASC RS / MC RS → planètes natales** (orbe ≤ 3°)
- **Maison de l'ASC RS** utilisée comme **domaine dominant de l'année** (texte dédié injecté dans la maison correspondante)
- Synthèse globale enrichie avec instruction de croiser ASC RS et transits

### Fichier modifié
- **`N8N Prev`** : section 10e réécrite (+72 lignes nettes), prompt synthèse enrichi

### Précision attendue
- ±0.5° sur l'ASC (vs Swiss Ephemeris) — validé par la même méthode que le calcul ASC natal dans DHN

---

## 17. CHANGELOG — SPRINT 12 (v11.0) — Heatmap Consolidée ISO, Arcs Solaires, Moteur 100% Structuré

### Origine

La heatmap d'intensité, initialement présente uniquement dans le rapport Données Techniques, présentait deux problèmes majeurs :
1. **Incohérence des scores** entre les 3 rapports (DT vs Tech vs Final) due à des moteurs de calcul différents (texte/regex dans `N8N Prev` vs structuré dans `N8N Prev Repport`)
2. **Catégories manquantes** : arcs solaires, progressions P→N et transit→progressé non intégrés dans le scoring

### Architecture heatmap v11.0

Deux moteurs de calcul **identiques et indépendants** (imposé par l'architecture N8N en branches parallèles) :

| Moteur | Nœud | Alimente | Source de données |
|---|---|---|---|
| **Moteur A** | `N8N Prev` (Super Nœud) | Rapport Tech + Rapport Final | Données structurées `_hm_*` dans `maisonsResult` |
| **Moteur B** | `N8N Prev Repport` (Analyseur Technique) | Rapport Données Techniques | Données structurées dans `rapportMaisons` |

> **Contrainte architecturale** : `N8N Prev` et `N8N Prev Repport` s'exécutent en branches parallèles depuis `Merge Datas`. Ils ne communiquent pas entre eux. Le moteur de calcul doit donc être codé **deux fois**, de manière ISO, à partir des mêmes données structurées.

### 16 catégories d'événements — 100% données structurées

| # | Catégorie | Champ structuré (`N8N Prev`) | Champ structuré (`N8N Prev Repport`) | Poids (formule) | Type score |
|---|---|---|---|---|---|
| 1 | Aspects lents reçus (T→N) | `_hm_aspects_lents` | `aspects_lentes` | `PLANET_W × amp × ASP_MULT × HOUSE_MULT × passMult × frac` | Smart (T/S) |
| 2 | Aspects rapides reçus (T→N) | `_hm_aspects_rapides` | `aspects_rapides` | `(PLANET_W × 0.3) × amp × ASP_MULT × HOUSE_MULT × frac` | Smart (T/S) |
| 3 | Éclipses | `_hm_eclipses` | `eclipses` | `5 × HOUSE_MULT` (cap 2/bucket) | Tension |
| 4 | Stations rétrogrades | `_hm_stations` | `stations_retro` | `(PLANET_W × 0.7) × HOUSE_MULT` | Tension |
| 5 | Lunaisons | `_hm_lunaisons` | `lunaisons` | `1 × HOUSE_MULT` | Support |
| 6 | Aspects mondiaux T→T | `_hm_aspects_mondiaux` | `aspects_mondiaux` | `0.5 × ASP_MULT × HOUSE_MULT` | Smart (T/S) |
| 7 | Passages aux angles | `_hm_passages_angles` | `passages_angles` | `(PLANET_W × 0.8) × amp × passMult × ASP_MULT × HOUSE_MULT × frac` | Smart (T/S) |
| 8 | Progressions P→N | `_hm_progressions` (sans dates) | `progressions_aspects` | `2.5 × ASP_MULT × HOUSE_MULT / numCols` | Smart (T/S) — distribution uniforme |
| 9 | **Arcs solaires SA→N** | `_hm_progressions` (isSA=true) | `_hm_arcs_solaires` | `(PLANET_W × tightness × 1.2) × ASP_MULT × HOUSE_MULT / numCols` | Smart (T/S) — distribution uniforme |
| 10 | **Transit → Progressé T→P** | `_hm_progressions` (avec dates) | `transit_progresse` | `(PLANET_W × 1.2) × amp × ASP_MULT × HOUSE_MULT × frac` | Smart (T/S) |
| 11 | Étoiles fixes / fenêtres stellaires | `_hm_etoiles` | `_hm_etoiles` | `(royale ? 4 : 2.5) × HOUSE_MULT` | Support |
| 12 | Résonance éclipse natale | `_hm_eclipse_natal_active` | `_hm_eclipse_natal_active` | `4 × HOUSE_MULT` (cap 2/bucket) | Tension |
| 13 | Ingress planétaires | `_hm_ingress` | `_hm_ingress` | `1.5 × HOUSE_MULT` | Support |
| 14 | Translations de lumière | `_hm_translations` | `translations_lumiere` | `1 × HOUSE_MULT` | Support |
| 15 | Midpoints | `_hm_midpoints` | `_hm_midpoints` | `0.03 × HOUSE_MULT × 0.5` (T) + `0.03 × HOUSE_MULT × 0.5` (S) | 50/50 |
| 16 | Antiscia | `_hm_antiscia` | `_hm_antiscia` | `1.0 × HOUSE_MULT` | Support |

### Pondérations transversales

| Pondération | Constante | Valeurs | Portée |
|---|---|---|---|
| **Poids planétaire** | `_PLANET_W` | Pluton 5, Neptune/Uranus/Saturne 4, Jupiter/Chiron/Nœuds 2, Mars/Soleil 1, Vénus/Mercure 0.5, Lune 0.3, Ceres/Pallas/Junon/Vesta 1, Lilith 1.5 | Toutes catégories avec planète identifiée |
| **Multiplicateur d'aspect** | `_ASP_MULT` | Conj 1.3, Opp/Carré 1.2, Quinc 1.0, Semi-Carré/Sesqui 0.9, Trigone 0.8, Sextile/Quintile/Biquintile 0.7, Semi-Sextile 0.6 | Toutes catégories avec aspect identifié |
| **Bonus maison angulaire** | `_HOUSE_MULT` | M1/4/7/10 → ×1.2 ; M2/5/8/11 → ×1.0 ; M3/6/9/12 → ×0.85 | Toutes catégories |
| **Amplification Profection** | `_ampFactor` | Seigneur de l'année → ×1.5 | Catégories avec planète identifiée |
| **Amplification Firdaria** | `_ampFactor` | Chronocrator majeur ou sous-période → ×1.3 | Catégories avec planète identifiée |
| **Nuance Conjonction** | `_addScoreSmart` | Maléfique → Tension ; Bénéfique → Support ; Neutre → 50/50 | Catégories "Smart" |
| **Dépondération passages** | `_getPassMult` | Passage 1 → ×1.0, Passage 2 → ×0.6, Passage 3+ → ×0.4 | Aspects lents, passages angles |

### Classification Tension / Support

| Type | Règle |
|---|---|
| **Aspects durs** (Tension) | Opposition, Carré, Quinconce, Semi-Carré, Sesqui-Carré |
| **Aspects doux** (Support) | Trigone, Sextile, Semi-Sextile, Quintile, Biquintile |
| **Conjonction maléfique** (Tension) | Saturne, Mars, Pluton, Neptune, Uranus, Chiron, Lilith, Nœud Sud |
| **Conjonction bénéfique** (Support) | Jupiter, Vénus, Soleil, Nœud Nord |
| **Conjonction neutre** (50/50) | Mercure, Lune, Ceres, Pallas, Junon, Vesta |

### Distribution des arcs solaires et progressions P→N

Les arcs solaires et progressions secondaires P→N n'ont pas de date ponctuelle (mouvement ~1°/an). Leur poids est distribué **uniformément sur tous les buckets** de la période :
- `perBucket = totalWeight / numCols`
- Un arc serré (tightness proche de 1) contribue plus qu'un arc large
- Cette approche est astrologi quement exacte : un arc actif colore TOUTE la période
- La précision de la **détection** (aspect, orbe, maison, nature) est élevée ; seule la date du pic est incertaine (±2-6 mois), ce qui rend la distribution uniforme plus honnête qu'une estimation imprécise

### Heatmap dans les 3 rapports

| Rapport | Position | Texte pédagogique | Source données |
|---|---|---|---|
| **Données Techniques** (DT) | Fin de synthèse | Technique (détaillé) — bilingue FR/EN | Moteur B (`N8N Prev Repport`) |
| **Rapport Technique** | Après synthèse, avant M1 | Technique (détaillé) — bilingue FR/EN | Moteur A (`N8N Prev`) |
| **Rapport Final** | Après synthèse, avant M1 | **Vulgarisé** (accessible non-astrologue) — bilingue FR/EN | Moteur A (`N8N Prev`) |

### Adaptativité par granularité

| Type rapport | Colonnes | Labels | Titre |
|---|---|---|---|
| Annuel | 12 | Jan, Fév, ... Déc | Heatmap d'Intensité Mensuelle |
| Mensuel | ~4-5 | Sem 1, Sem 2, ... | Heatmap d'Intensité Hebdomadaire |
| Hebdomadaire | 7 | Lun, Mar, ... Dim | Heatmap d'Intensité Journalière |
| Journalier | 1 | Date du jour | Heatmap d'Intensité du Jour |

### Fichiers modifiés

> **⚠ Mise à jour avril 2026 — audit ISO Priorité 1 (`SITE/scripts/PREV-ISO-AUDIT.md`)** : la note Sprint 14 ci-dessous est partiellement obsolète. Le calcul heatmap a été *remis* dans `N8N Prev` ultérieurement, et **enrichi de 5 amplificateurs pyramidaux** (DIRECTIONS PRIMAIRES, FIRDARIA, RS ASC HOUSE, RETOUR NODAL, CASCADE — lignes 10402-10501). `N8N Prev Repport` exécute toujours son calcul local mais l'**écrase ensuite par celui de S1** via le **callback upstream ISO v10.4** (lignes 2298-2321). Cinq tests live (bardot, einstein, curie, hawking, ali) confirment que la heatmap finale consommée = S1 (top3 et max identiques, écarts ≤ 0.1 = arrondi quantifié à 1 décimale).
>
> **Conséquence pratique** : ne PAS supprimer le calcul heatmap de `N8N Prev`. Si vous le faites, le callback upstream ne récupérera plus rien et la heatmap retombera à sa version « pauvre » de `N8N Prev Repport` (sans amplificateurs pyramidaux).

| Fichier | Modifications |
|---|---|
| **`N8N Prev`** | **Sprint 14 (obsolète)** : Suppression du moteur heatmap dupliqué (~624 lignes). **Avril 2026** : moteur heatmap **réintroduit et enrichi** des 5 amplificateurs pyramidaux (DP / Firdaria / RS ASC / Retour Nodal / Cascade). Cette heatmap est désormais la **source réelle** consommée par les rapports via le callback upstream depuis `N8N Prev Repport`. |
| **`N8N Prev Repport`** | **Sprint 13** : Correction séquence Firdaria diurne. **Sprint 14** : "source heatmap" déclarée. **Avril 2026** : reste publisher, mais son calcul local est écrasé par celui de `N8N Prev` via le callback **ISO v10.4** (lignes 2298-2321) — c'est ce qui arrive en pipeline normal. Sa heatmap locale ne sert plus que de **fallback de secours** si `N8N Prev` n'a pas publié `heatmapData`. |
| **`N8N Prev Repport HTML`** | **Sprint 14** : Ajout de `"N8N Prev Repport"` en tête de la liste de fallback pour `heatmapData`. |
| **`N8N Prev Repport HTML Tech`** | **Sprint 13** : Page breaks par maison. **Sprint 14** : Ajout de `"N8N Prev Repport"` en tête de la liste de fallback pour `heatmapData`. |
| **`N8N Prev Repport HTML Final`** | **Sprint 13** : Page breaks par maison. **Sprint 14** : Idem — fallback `heatmapData` prioritaire vers `N8N Prev Repport`. |

### Architecture Heatmap (Sprint 14)

| Aspect | Détail |
|---|---|
| **Source unique** | `N8N Prev Repport` calcule la heatmap sur `rapportMaisons` (données structurées directes) |
| **Moteur dupliqué** | **Supprimé** de `N8N Prev` — ~624 lignes retirées |
| **Raison** | Malgré un code logique verbatim, des écarts persistaient à cause de : (1) mutation de `natalPlanets` par `N8N Prev` (injection lots hermétiques via `pushLot`), (2) `$input` potentiellement différent entre branches parallèles N8N |
| **Fallback HTML** | Les 3 nœuds HTML (`DT`, `Tech`, `Final`) cherchent `heatmapData` dans cet ordre : `$input.all()` → `$("N8N Prev Repport")` → autres nœuds |
| **Conformité astro** | Le moteur de `N8N Prev Repport` reste le plus fiable : itération directe sur les données structurées, pas de mutation partagée, calculs autonomes de Firdaria/Profection |
| **Structure `_rmHM` identique** à `rapportMaisons` : mêmes 17 arrays par maison | ✅ |
| **Boucle principale des jours identique** : même ordre d'appel (processGroup lent, rapide, angles, TT, TL, stations, lunaisons, stellaires, éclipses) | ✅ |
| **Clôtures identiques** : même fermeture de tous les suivis ouverts | ✅ |
| **Boucles secondaires identiques** : ingress, midpoints (`MP_` key format), antiscia (`ANT_` key format) | ✅ |
| **Progressions P→N identiques** : mêmes planètes, orbes, lots exclus, `getLocation` pour house | ✅ |
| **Arcs solaires identiques** : même arc, mêmes cibles, orbe 1.0° | ✅ |
| **T→P identiques** : mêmes targets `["Soleil","Lune","Mercure","Vénus","Mars","Ascendant","MC"]`, mêmes orbes par aspect | ✅ |
| **Formule heatmap identique** : itère `_rmHM` exactement comme Repport itère `rapportMaisons` | ✅ |
| Même séquence Firdaria diurne (Abū Maʿshar traditionnel) | ✅ |
| Mêmes constantes `_PLANET_W`, `_ASP_MULT`, `_HOUSE_MULT` | ✅ |
| Même détection Arcs Solaires (orbe 1.0°, tightness) | ✅ |
| Même détection T→P (mêmes planètes transit + cibles progressées) | ✅ |
| Saut de page par maison dans Tech + Final | ✅ |

---

## 18. CHANGELOG — SPRINT 15 (v13.0) — Moteur MDSE + Alignement ISO eventSignatures

### Origine

L'analyse du cas Matthieu GALLAIS (accident 8 mars 2000) a révélé l'absence de détection combinatoire multi-technique. Les transits individuels étaient bien identifiés, mais aucun système ne faisait la **synthèse** pour reconnaître une signature d'accident, de deuil, de mariage, etc.

### Moteur de Signatures Événementielles (MDSE)

#### Architecture

Le MDSE évalue des **signatures déclaratives** composées de conditions multiples. Chaque signature est un objet JSON contenant :
- `label` : nom affiché (ex. "Risque physique / Accident")
- `conditions` : tableau de conditions typées (`transit_in_house`, `transit_aspect`, `progression`, etc.)
- `weights` : poids par condition pour le calcul de confiance
- `minConfidence` : seuil de déclenchement (35–42%)

#### Calcul de la confiance

```
rawConfidence = Σ (condition_i.strength × weight_i) / Σ weight_i × 100
+ bonus superposition (+10/+8 pour paires liées : ex. ACCIDENT↔SANTE)
+ bonus natal (chartRuler, natalBoost)
```

Seules les signatures avec `confidence ≥ minConfidence` sont retenues.

#### Fast Planet Scan (rapports annuels)

Les rapports annuels ne traitent que les transits lents. Pour maintenir la fiabilité MDSE, un scan complémentaire de Mars, Vénus et Soleil est effectué :
- Suivi jour-par-jour des vagues (start/end/peakDate/minOrb)
- Calcul de `tightness` et bonus `multiWave`
- Alimenté par les données `transitsData.days` (même source que les transits lents)

#### Temporalisation (v2-A)

Chaque signature inclut un `peakWindow` dérivé de la `peakDate` de la condition la plus discriminante. Cela permet d'estimer **quand** dans l'année la signature a le plus de chances de se manifester.

#### Pondération natale (v2-C)

Le thème natal booste ou atténue les signatures :
- Gouverneur du thème (chartRuler) dans les planètes impliquées → +5 points
- Sensibilité natale (ex. Mars angulaire booste ACCIDENT) → configurable par signature

### Alignement ISO — `N8N Prev` ↔ `N8N Prev Repport`

L'architecture N8N impose deux exécutions parallèles et indépendantes. Le MDSE a été entièrement dupliqué dans `N8N Prev Repport` avec un alignement strict vérifié sur 9 axes :

| # | Divergence identifiée | Impact | Correctif appliqué |
|---|---|---|---|
| 1 | `_allSlowAspA.natalHouse` utilisait la maison du transit au lieu de la maison natale | CRITIQUE — filtrages `transit_in_house`, `double_activation` faux | Reconstruction complète de `_allSlowAspA` jour-par-jour |
| 2 | Orbes fixes (`ORBE_L = 2.0°`) pour tous les aspects lents au lieu d'orbes par planète/aspect | CRITIQUE — aspects manqués/faux | Implémentation de `TRANSIT_ORBES_SLOW_A` avec orbes différenciés |
| 3 | `_progActsA.weight` utilisait une formule simplifiée (`1 - orbe`) | MOYEN — confidences décalées | Alignement sur `PROG_SPEED × tightness` et `SA_PW × tightness` |
| 4 | `declination_match` vide (données absentes) | MOYEN — signatures incomplètes | Ajout `declinaison` dans `natalDictLoc` + calcul `_declPairsA` |
| 5 | `_houseScoresA` sans convergences ni stations on natal | FAIBLE — scoring maisons décalé | Ajout scoring convergences (+4) et stations sur planète natale (+4, orbe 2°) |
| 6 | `station_on_natal` matchait toute station du bon type | MOYEN — faux positifs | Ajout `fullDegree` aux stations + vérification proximité natale ≤ 2° |
| 7 | `double_activation` par maison au lieu de per-natal-planet | MOYEN — détections trop larges | Réécriture pour vérifier transit + progression/arc sur le **même** point natal |
| 8 | `eclipse_in_house` incomplet | MOYEN — éclipses manquées | Vérification éclipse conjoncte natal dans la maison physique OU la maison du natal |
| 9 | `nodes_in_houses` double-comptage (`suiviTL` + `rapportMaisons`) | FAIBLE — scores gonflés | Utilisation exclusive de `rapportMaisons.transits_lentes` |

### Données livrées

| Champ | Contenu | Consommateurs |
|---|---|---|
| `eventSignatures` | Tableau des signatures matchées (`code`, `label`, `confidence`, `houses`, `peakWindow`, `polarity`, `qualifiedLabel`) | `N8N Prev Repport HTML` (badges heatmap), prompts LLM (hebdo/journalier) |
| `heatmapData.eventSignatures` | Mêmes données injectées dans l'objet heatmap | Les 3 rapports HTML |

### Anti-hallucination MDSE

| Garde | Détail |
|---|---|
| Seuil `minConfidence` | Chaque signature a un seuil propre (38–45%), sous lequel elle n'est jamais affichée |
| Catégories sensibles | ACCIDENT, DEUIL, SEPARATION, SANTE_DOWN, JURIDIQUE_DOWN : jamais injectées dans le prompt si `confidence < 50` |
| Niveau de guidance | Pour les rapports annuels (fiabilité réduite), seul un `guidance` est fourni, pas une prédiction |
| Fast planet attenuation | Supprimée (v13.0) : le scan complet remplace le fallback approché |
| Anti-corrélation (Q3) | Pénalité mutuelle -10/-12 points quand deux signatures opposées (UP/DOWN) sont détectées simultanément |

### `EVENT_SIGNATURES` — 16 signatures, identiques dans les deux nœuds

Les 16 signatures déclaratives (`EVENT_SIGNATURES` dans `N8N Prev` et `EVENT_SIGNATURES_A` dans `N8N Prev Repport`) sont maintenues en **copie verbatim** pour garantir l'ISO. Toute modification doit être répliquée manuellement dans les deux fichiers.

#### Signatures v2 — Architecture en 3 niveaux

**Niveau 1 — Paires UP/DOWN explicites** (conditions différentes pour chaque pôle) :
| Paire UP | Paire DOWN | Existait v1 |
|---|---|---|
| CARRIERE_UP | CARRIERE_DOWN | Oui |
| FINANCE_UP | FINANCE_DOWN | Oui |
| **SANTE_UP** | **SANTE_DOWN** | Non — ajouté v2 |
| **JURIDIQUE_UP** | **JURIDIQUE_DOWN** | Non — ajouté v2 |

**Niveau 2 — Polarité calculée** (champ `polarity` de -1 à +1) :
- SPIRITUEL → pos: "Éveil intérieur", neg: "Crise existentielle"
- RELOCATION → pos: "Déménagement choisi", neg: "Déracinement subi"
- VOYAGE → pos: "Voyage enrichissant", neg: "Voyage perturbateur"

**Niveau 3 — Signatures unipolaires** : ACCIDENT, DEUIL, MARIAGE, SEPARATION, ENFANT

#### Modificateurs universels MDSE v2.2

| Code | Nom | Portée | Mode | Effet |
|---|---|---|---|---|
| **P0** | Ratio Tension/Support | Toutes les signatures | **Multiplicatif** | Facteur ×0.55→×1.18 selon le ratio T/S des maisons-clés. Sig positive + tension forte → ×0.55 à ×0.70. Sig négative + support fort → ×0.55 à ×0.70. |
| **P0b** | Seigneur de l'année | Toutes les signatures | **Multiplicatif** | Facteur ×0.88→×1.12 selon la dignité natale du profectional lord. **Pérégrin** : ×0.96 (positive) / ×1.04 (negative). |
| **P1** | Dignité transit | Par signature | Multiplicatif | ×0.80→×1.25 selon la dignité du transit dans son signe |
| **P2** | Sect-aware | Par signature | Multiplicatif | ×0.90→×1.20 selon la sect et le type de planète |
| **P5** | **Transit → Progressé (T→P)** | Par condition (v2.2) | Condition directe | Nouveau type `transit_to_progressed` dans l'évaluateur. Exploite `_mdseTPAspects` exposé depuis la section 10d. Tightness exponentiel `(1 - orb/2)^1.5`, bonus multi-passage. Poids élevés (9-12) pour les aspects serrés T→P sur points personnels (Soleil P, Lune P, MC P, ASC P). |
| **P6** | **Cluster RS maléfique/bénéfique** | Post-heatmap (v2.2) | Multiplicatif | Comptage des maléfiques (Mars, Saturne, Uranus, Neptune, Pluton, Chiron) et bénéfiques (Jupiter, Vénus) par maison-clé dans la Révolution Solaire. ≥3 maléfiques sur maisons-clés d'une signature positive → ×0.50. ≥2 maléfiques sans bénéfiques → ×0.70. Symétrique pour les négatives. |
| **P7** | **Inhibiteur Jupiter T→P** | Post-heatmap (v2.2) | Multiplicatif | Si Jupiter forme des aspects durs (Carré/Opposition, orbe < 1°) en T→P, réduit la confidence des signatures positives qui reposent sur Jupiter. ×0.70 si Jupiter frappe Soleil/Lune/MC/ASC progressés, ×0.85 sinon. |
| **P8** | **RS planet/cluster conditions** | Par condition (v2.2) | Condition directe | Nouveaux types `rs_planet_in_house` et `rs_malefic_cluster` dans l'évaluateur. Exploite `_mdseRSHouses` exposé depuis la section 10e. Confirme ou infirme une signature selon les placements RS dans les maisons-clés. |
| **Q1** | Tightness exponentiel | Par condition | Multiplicatif | `(1 - orb/3)^1.5` |
| **Q3** | Anti-corrélation asymétrique | **Post-heatmap** | T/S-aware | Arbitrage directionnel sur 5 paires. Quand T/S > 1.15 : UP ×0.60, DOWN ×1.06. Quand T/S < 0.85 : DOWN ×0.60, UP ×1.06. |
| **A5** | Cap de cohérence | Post-Q3 | Plafond | Signature positive plafonnée à 52% si T/S maisons-clés > 1.20. Symétrique pour les négatives si T/S < 0.80. |

#### Nouveaux types de conditions MDSE v2.2

| Type | Paramètres | Source de données | Description |
|---|---|---|---|
| `transit_to_progressed` | `pTransit`, `pProg`, `aspects`, `maxOrb` (opt.) | `_mdseTPAspects` / `_mdseTPAspectsA` | Un transit lent forme un aspect avec une planète progressée. Tightness exponentiel sur orbe max 2°. Bonus ×1.15/×1.30 si multi-passage. |
| `rs_planet_in_house` | `planets`, `houses` | `_mdseRSHouses` / `_mdseRSHousesA` | Planète(s) spécifique(s) présente(s) dans des maisons natales données dans la Révolution Solaire. Strength progressive (0.6 + 0.2 par planète trouvée). |
| `rs_malefic_cluster` | `houses`, `direction` ("positive"/"negative"), `minCount` | `_mdseRSHouses` / `_mdseRSHousesA` | N maléfiques ou bénéfiques convergent dans les maisons-clés de la signature dans la RS. Strength progressive (0.5 + 0.2 par planète). |

#### Pipeline post-heatmap MDSE v2.2 (7 phases)

1. **Phase A** — P0 (×) + P0b (×) : ajustement multiplicatif de la confidence par le ratio T/S et la dignité du seigneur de l'année
2. **Phase B** — Q3 asymétrique : arbitrage directionnel T/S-aware sur les 5 paires UP/DOWN
3. **Phase B2** — P6 Cluster RS : ajustement multiplicatif selon la concentration de maléfiques/bénéfiques dans les maisons-clés de la Révolution Solaire
4. **Phase B3** — P7 Inhibiteur Jupiter : réduction de la confidence des signatures positives si Jupiter forme des aspects durs en T→P
5. **Phase C** — Polarity : calcul du champ `polarity` (-1 à +1) et `qualifiedLabel` pour les signatures ambipolaires
6. **Phase D** — Cap de cohérence : plafonnement à 52% des signatures positives en zone tension et des négatives en zone support
7. **Phase E** — Filtrage minConfidence + tri final

#### Paires UP/DOWN traitées par Q3 asymétrique

| Paire | Maisons-clés partagées | Domaine |
|---|---|---|
| CARRIERE_UP / CARRIERE_DOWN | M2, M6, M10 | Professionnel |
| FINANCE_UP / FINANCE_DOWN | M2, M8 | Financier |
| SANTE_UP / SANTE_DOWN | M1, M6 | Santé |
| JURIDIQUE_UP / JURIDIQUE_DOWN | M7, M9 | Juridique |
| MARIAGE / SEPARATION | M5, M7, M8 | Relationnel |

#### Variables exposées pour le MDSE (v2.2)

| Variable | Déclarée avant | Peuplée dans | Accessible dans |
|---|---|---|---|
| `_mdseTPAspects` / `_mdseTPAspectsA` | Section T→P | Boucle `tpSuivi` | `_mdseEvalCondition`, post-heatmap |
| `_mdseRSHouses` / `_mdseRSHousesA` | Section RS | Boucle `srPlanetList` | `_mdseEvalCondition`, post-heatmap |

### Fichiers modifiés

| Fichier | Modifications Sprint 18 (v2.2) |
|---|---|
| **`N8N Prev`** | `_mdseTPAspects` exposé hors scope T→P. `_mdseRSHouses` exposé hors scope RS. 3 nouveaux case (`transit_to_progressed`, `rs_planet_in_house`, `rs_malefic_cluster`) dans `_mdseEvalCondition`. Conditions T→P et RS ajoutées dans les 16 signatures EVENT_SIGNATURES. Phase B2 (P6 cluster RS) et Phase B3 (P7 inhibiteur Jupiter) insérées dans le post-heatmap. Log d'erreur amélioré avec stack trace. |
| **`N8N Prev Repport`** | Transposition ISO complète (`_mdseTPAspectsA`, `_mdseRSHousesA`, 3 case dans `_mdseEvalCondA`, conditions T→P/RS dans EVENT_SIGNATURES_A, Phases B2/B3 dans le post-heatmap). |
| **`N8N Prev Repport HTML`** | Inchangé — consomme `eventSignatures` en affichage pur. |
| **`N8N Prev Repport HTML Tech`** | Inchangé — consomme `eventSignatures` en affichage pur. |
| **`N8N Prev Repport HTML Final`** | Inchangé — consomme `eventSignatures` en affichage pur. |

| Fichier | Modifications Sprint 19 (v2.2.1 — Fix ISO structurel) |
|---|---|
| **`N8N Prev`** | Fix bug `w.bestOrb` → `parseFloat(w.minOrb)` dans `transit_in_house` et `transit_aspect` (tightness redevient une vraie mesure au lieu du fallback 0.5). Heatmap : progressions alignées avec MDSE (ajout Descendant/IC, Mars orb 1.0°, whitelist natale, mapping MC→Milieu du Ciel). |
| **`N8N Prev Repport`** | Fix bug `w.bestOrb` → `w._minOrb` dans `transit_in_house` et `transit_aspect`. Progressions : ajout Descendant/IC comme planètes progressées, Mars orb aligné 1.0° (était 0.5°), `pProg = "MC"` au lieu de `"Milieu du Ciel"` (ISO avec N8N Prev). Whitelist natale PROG_NATAL_TARGETS identique au N8N Prev. |

### Limites connues

| Limite | Détail | Solution future |
|---|---|---|
| Duplication manuelle | `EVENT_SIGNATURES` doit être copié manuellement entre `N8N Prev` et `N8N Prev Repport` | Extraction dans un nœud partagé upstream de `Merge Datas` |
| Fiabilité annuelle réduite | Fast planet scan couvre Mars/Vénus/Soleil, mais pas Mercure ni Lune | Acceptable : signatures conçues pour être robustes sans rapides |
| Résolution temporelle annuelle | `peakWindow` basé sur le pic de la vague la plus discriminante — précision ±1-2 mois | Utiliser les rapports mensuel/hebdo pour affiner |
| Transit sign map approximatif | Utilise le signe dominant de la période (mid-point pour Repport) — peut manquer un changement de signe en cours de période | Impact marginal pour les lentes (un signe par période longue) |
| Données RS limitées | La RS ne calcule pas de maisons RS (uniquement les positions projetées dans le thème natal) | Ajouter le calcul des maisons RS pour une exploitation P8 plus fine |
| `double_activation` — logique divergente | `N8N Prev` utilise les drapeaux `houseTransitScored`, `N8N Prev Repport` reconstruit depuis `_allSlowAspA` + `_progActsA` | Aligner sur une même approche ou factoriser en amont |
| `eclipse_in_house` — critère divergent | `N8N Prev` utilise `eclipses_conjonctes_texte.length`, Repport utilise un calcul d'orbe à 3° | Impact faible (poids éclipse ≤7 dans les signatures) |

---

## 19. CHANGELOG — SPRINT 20 (v18.0) — Pyramide Prédictive, Confidence dynamique, Synergie Firdaria natale

### Origine

L'audit croisé avec l'analyse Gemini 3.1 Pro a révélé trois écarts structurels :
1. **Plafonnement rigide à 85%** : toutes les signatures MDSE étaient bridées à `Math.min(85, ...)` quel que soit le nombre de techniques convergentes
2. **Absence de synergie Firdaria/natal** : la résonance entre le chronocrateur actif et le thème natal n'était pas exploitée dans le scoring
3. **Détection trop restrictive des Nouvelles Lunes Progressées** : orbe de 3° insuffisant pour capter les cycles de ~30 ans

### Pyramide Prédictive — Système `_pyramidLevel` (0-3)

La confiance maximale d'une signature MDSE est désormais modulée par le nombre de couches techniques de haut niveau qui la corroborent :

| Niveau | Critère | Cap maximal | Signification |
|---|---|---|---|
| 0 | Transits seuls | 85% | Activation de base |
| 1 | + Progression OU Arc Solaire | 85% | Confirmation par technique secondaire |
| 2 | + Direction Primaire confirmée | 93% | Trame du destin confirmée |
| 3 | Pyramide complète (DP + Firdaria + Profection alignés) | 95% | Convergence maximale multi-technique |

### Fonction `_mdseDynCap(sig)`

Remplace les 15 appels `Math.min(85, ...)` hardcodés. Calcul :
1. Détermine `_pyramidLevel` à partir de `sig.dpConfirmed`, `sig.firdConfirmed`, `sig.profLordActive`
2. Applique le plafond correspondant : `[85, 85, 93, 95][level]`
3. Le niveau est inscrit dans `sig.pyramidLevel` pour traçabilité

### Post-processeurs Firdaria

#### `P42quater` — Synchronisation Lune progressée / Firdaria

Détecte si le signe de la Lune progressée correspond au signe natal du seigneur Firdaria actif. Si oui :
- Boost de +4 points de confiance
- Tag `progMoonFirdSync: true` dans la signature
- Donnée injectée dans le prompt via `_firdSynergyBlock`

#### `P42quinquies` — Synergie Firdaria natale globale

Post-processeur global appliqué à **toutes** les signatures MDSE (pas uniquement MARIAGE). Pour chaque signature :
1. Vérifie si les planètes impliquées incluent le seigneur Firdaria actif
2. Si oui, calcule un bonus/malus sensible à la polarité :
   - Signature positive + seigneur Firdaria bénéfique : boost +5
   - Signature négative + seigneur Firdaria maléfique : boost +4
   - Signature positive + seigneur Firdaria maléfique : malus -3
   - Signature négative + seigneur Firdaria bénéfique : malus -3
3. Tag `firdNatalSynergy: true` + type de synergie dans la signature

### Bloc dynamique `_firdSynergyBlock`

Bloc de prompt contextuel injecté dans :
- Chaque prompt per-house (si la maison est liée au chronocrateur)
- Le prompt de synthèse globale

Contenu :
- Identification du chronocrateur majeur et du sous-seigneur
- Signe natal et maison natale du seigneur Firdaria
- Synchronisation avec la Lune progressée (si détectée)
- Instructions de hiérarchisation pour le LLM

### Fichiers modifiés

| Fichier | Modifications |
|---|---|
| **`N8N Prev`** | `_mdseDynCap` (remplacement de 15 `Math.min`), `P42quater`, `P42quinquies`, `_firdSynergyBlock`, métadonnées `progMoonFirdSync` et `firdNatalSynergy` dans les JSON de sortie |

---

## 20. CHANGELOG — SPRINT 21 (v18.1) — Anti-hallucination v2 (Garde renforcée des pourcentages)

### Origine

Les rapports générés présentaient des **pourcentages incorrects** dans les textes narratifs (ex. VOYAGE 85% dans les données, 82% dans le rapport LLM). L'audit a identifié un **bug architectural de timing** : les valeurs `sig.confidence` étaient modifiées par les post-processeurs MDSE (P0, Q3, P6, P7, etc.) **après** la génération initiale des prompts LLM mais **avant** la construction du payload JSON final.

### Cause racine

1. Les prompts LLM (`prompt_user`) sont construits avec les valeurs de confiance **initiales**
2. Les post-processeurs MDSE modifient ensuite ces valeurs (parfois de +10/-15 points)
3. Le payload JSON final (`eventSignatures`) contient les valeurs **finales**
4. Résultat : le LLM reçoit des pourcentages périmés dans le texte du prompt, puis les reproduit fidèlement — **hallucination de bonne foi**

### Architecture de la correction

#### Phase 1 — Neutralisation de la table de référence initiale

La variable `_pctRefTable` est vidée au moment de la construction des prompts pour éviter que des valeurs périmées soient injectées.

#### Phase 2 — Construction de `_finalPctTable` (après TOUS les post-processeurs)

Après tous les ajustements de confiance, un nouveau bloc :
1. Itère sur `_mdseResults` finalisés
2. Construit une table de correspondance `{ code -> confidence_finale }`
3. Génère une chaîne `_finalPctTable` contenant les pourcentages officiels avec directive "INTERDIT ABSOLU de modifier"

#### Phase 3 — Remplacement chirurgical dans les prompts

Pour chaque item de `finalOutput` :
1. Regex `/(force\s+)\d+(%)/g` détecte les anciennes valeurs `(force XX%)`
2. Remplacement par les valeurs finales de `_finalPctTable`
3. Append de `_finalPctTable` avec directive "INTERDIT ABSOLU" à la fin de chaque `prompt_user`

### Garanties

| Garde | Mécanisme |
|---|---|
| Pas de valeur périmée | Regex find-and-replace sur les chaînes `(force XX%)` |
| Table autoritaire | `_finalPctTable` injectée EN DERNIER dans chaque prompt |
| Directive impérative | "INTERDIT ABSOLU de modifier ces pourcentages" |
| Vérification possible | La table est visible dans `DATA PREV LLM` pour audit |

### Fichier modifié

| Fichier | Modifications |
|---|---|
| **`N8N Prev`** | `_pctRefTable` vidé, nouveau bloc `_finalPctTable` après les post-processeurs, regex remplacement dans `prompt_user`, append de la table finale |

---

## 21. CHANGELOG — SPRINT 21b (v18.1) — Extension des orbes Nouvelle Lune Progressée (NLP)

### Origine

Le croisement avec l'analyse Gemini 3.1 Pro a révélé qu'une Nouvelle Lune Progressée (NLP) à 5.21° d'orbe — un cycle de ~30 ans fondamental en astrologie prédictive — n'était pas détectée par le système (orbe de détection fixée à 3°).

### Corrections

| Paramètre | Avant | Après | Justification |
|---|---|---|---|
| Orbe de détection NLP/PLP/PQ/DQ | 3° | 10° | La Lune progressée se déplace de ~12°/an. Un orbe de 10° couvre ~10 mois, compatible avec un rapport annuel |
| Scoring `orbF` (dans `_mdseEvalCondition`) | Binaire | Gradué : `1.0` (<=3°), `0.7` (<=5°), `0.4` (<=7°), `0.25` (<=10°) |
| Boost global P14 | Fixe | Modulé par `_nlOrbMod` |

### Échelle `_nlOrbMod`

| Orbe NLP | `_nlOrbMod` | Interprétation |
|---|---|---|
| <= 3° | 1.0 | NLP dans l'orbe serré — impact maximal |
| 3° < orbe <= 5° | 0.7 | NLP approchante — impact significatif |
| 5° < orbe <= 7° | 0.4 | NLP en formation — influence de fond |
| 7° < orbe <= 10° | 0.25 | NLP lointaine — tonalité subtile |

### Fichier modifié

| Fichier | Modifications |
|---|---|
| **`N8N Prev`** | Orbe détection NLP élargi (ligne 3739), `orbF` gradué dans `_mdseEvalCondition` (ligne 6242), `_nlOrbMod` dans P14 (lignes 6862-6873) |

---

## 22. CHANGELOG — SPRINT 22 (v18.2) — Optimisation mémoire production (Fix OOM récurrent)

### Origine

Le noeud `N8N Prev Repport HTML` crashait avec l'erreur `Execution stopped at this node — n8n may have run out of memory` sur n8n Cloud. Le diagnostic a révélé une consommation mémoire excessive due à la duplication de données volumineuses sur les 13 items de sortie et à l'absence de nettoyage dans les noeuds de reporting.

### Diagnostic — Sources de fuite mémoire

| Source | Noeud | Impact estimé |
|---|---|---|
| `heatmapData` dupliqué 13x | `N8N Prev` | ~5-15 Mo x 13 = ~65-195 Mo de copies profondes |
| `eventSignatures` broadcasté 13x | `N8N Prev` + `N8N Prev Repport` | ~2-5 Mo x 13 |
| `_primaryDirections` broadcasté 13x | `N8N Prev Repport` | ~1-3 Mo x 13 |
| `prompt_user` non supprimé | `N8N Prev Repport HTML` | ~50-100 Ko x 13 items conservés en RAM |
| HTML brut dans `json.html` | `N8N Prev Repport HTML Final` | ~5-10 Mo stocké en RAM (pas sur disque) |
| Absence de pruning | `N8N Prev Repport HTML Tech` + `Final` | Items d'entrée intégralement conservés |

### Fix A — `N8N Prev` : Suppression des broadcasts

| Avant | Après | Économie |
|---|---|---|
| `finalOutput.forEach(item => { item.json.heatmapData = {...} })` | `finalOutput[0].json.heatmapData = {...}` | x12 copies profondes supprimées |
| Boucle broadcast `eventSignatures` sur tous les items | `finalOutput[0].json.eventSignatures = sigPayload` | x12 références supprimées |

### Fix B — `N8N Prev Repport` : Suppression des broadcasts

| Avant | Après |
|---|---|
| `finalOutput.forEach(item => { item.json.eventSignatures = ... })` | `finalOutput[0].json.eventSignatures = ...` |
| `finalOutput.forEach(item => { item.json._primaryDirections = ... })` | `finalOutput[0].json._primaryDirections = ...` |

### Fix C — `N8N Prev Repport HTML` : Pruning agressif en 2 phases

**Phase 1 — Nettoyage immédiat** (avant tout rendu) :
- Extraction de `_heatData` depuis le premier item disponible
- Suppression de 30+ champs lourds de chaque item : `prompt_user`, `prompt_system`, `contexte_natal_prompt`, `heatmapData`, `eventSignatures`, `compoundEvents`, `ageMilestones`, `_planetaryReturns`, `_boundProfection`, `_lunarReturnsScoring`, `reponse_texte`, `natalAspects`, `natalHouses`, `sensitivityProfile`, `chartShape`, `interceptedSigns`, `sabianData`, `dispositorTree`, `accidentalDignity`, `paranResults`, `stats`, `progressionsRaw`, `_rsRaw`, `_rlRaw`, `_tpRaw`, etc.

**Phase 2 — Post-rendu** (après `blocsMaisons`) :
- Suppression de 17 champs transit/aspect de chaque objet `maisons`

**Nullification `_heatData`** : `_heatData = null` immédiatement après le rendu de la heatmap HTML.

### Fix D — `N8N Prev Repport HTML Tech` : Pruning des items d'entrée

Ajout d'un bloc de nettoyage mémoire en tout début de noeud (~30 champs lourds supprimés).

### Fix E — `N8N Prev Repport HTML Final` : Sortie binary + Pruning

| Avant | Après | Économie |
|---|---|---|
| `return [{ json: { html, ... } }]` | `return [{ json: {...}, binary: { html_file: { data: base64 } } }]` | Le HTML (~5-10 Mo) est stocké sur disque (`binaryDataMode: "filesystem"`) au lieu de la RAM |

Mise à jour du noeud aval "Prépare HTML -> PDF" (dans `N8N Prev Chaine Repport HTML Final` et `GLOBAL PREV`) pour gérer les deux formats.

### Impact estimé

Réduction de l'empreinte mémoire de **~60-70%** sur l'ensemble de l'exécution workflow.

### Fichiers modifiés

| Fichier | Modifications |
|---|---|
| **`N8N Prev`** | `heatmapData` uniquement sur `finalOutput[0]`, suppression boucle broadcast `eventSignatures`, `_codeVersion` aligné `PREV_v18_mem_opt` |
| **`N8N Prev Repport`** | `eventSignatures` et `_primaryDirections` uniquement sur `finalOutput[0]` |
| **`N8N Prev Repport HTML`** | Phase 1 pruning (30+ champs dont `prompt_user`/`prompt_system`), Phase 2 pruning post-rendu (17 champs transit), nullification `_heatData` |
| **`N8N Prev Repport HTML Tech`** | Bloc pruning mémoire ajouté (30+ champs) |
| **`N8N Prev Repport HTML Final`** | Sortie convertie de `json.html` vers `binary.html_file`, bloc pruning mémoire ajouté |
| **`N8N Prev Chaine Repport HTML Final`** | "Prépare HTML -> PDF" mis à jour pour gérer le format binary |
| **`GLOBAL PREV`** | "Prépare HTML -> PDF" idem |

### Architecture mémoire — Flux de données optimisé

```
[N8N Prev] --> 13 items
  |  heatmapData    -> item[0] UNIQUEMENT
  |  eventSignatures -> item[0] UNIQUEMENT
  |  prompt_user     -> chaque item (consommé par LLM, purgé par les rapports)
  |
  |---> [N8N Prev Repport] --> N items
  |       heatmapData       -> item[0] UNIQUEMENT
  |       eventSignatures   -> item[0] UNIQUEMENT
  |       _primaryDirections -> item[0] UNIQUEMENT
  |       prompt_user        -> SUPPRIMÉ dès l'entrée
  |
  |---> [N8N Prev Repport HTML] --> 1 item (binary)
  |       Phase 1 : purge 30+ champs de chaque item dès l'entrée
  |       Phase 2 : purge 17 champs transit après rendu
  |       _heatData = null après rendu heatmap
  |
  |---> [N8N Prev Repport HTML Tech] --> 1 item (binary)
  |       Purge 30+ champs de chaque item dès l'entrée
  |       Données lues via $() — items d'entrée non utilisés
  |
  +---> [N8N Prev Repport HTML Final] --> 1 item (binary, PAS json)
          Purge 30+ champs de chaque item dès l'entrée
          Données lues via $() — items d'entrée non utilisés
          HTML stocké sur DISQUE (binaryDataMode: "filesystem")
```

> **Règle de production** : tout champ lourd (>10 Ko) ne doit être assigné qu'à `finalOutput[0]`. Les noeuds de reporting HTML doivent purger les items d'entrée en priorité Phase 1 (avant tout rendu) et les données intermédiaires en Phase 2 (après rendu).

---

## 23. LIMITES CONNUES GLOBALES (v18.2)

| Limite | Détail | Solution future |
|---|---|---|
| Duplication manuelle `EVENT_SIGNATURES` | Doit être copié manuellement entre `N8N Prev` et `N8N Prev Repport` | Extraction dans un noeud partagé upstream |
| `GLOBAL PREV` non synchronisé | Les noeuds inlinés dans `GLOBAL PREV` peuvent diverger des fichiers standalone | Re-export systématique après chaque sprint |
| Mémoire n8n Cloud | Budget limité (~256-512 Mo) — tout payload >10 Ko doit être traité avec précaution | Monitoring, binary systématique pour les sorties HTML |
| NLP résolution Lune | Progressed Moon calculée à partir d'un snapshot statique — la Lune prog. bouge ~12°/an | Interpolation entre `closestProg` et `secondProg` |
| RS sans maisons RS | La Révolution Solaire ne calcule pas de maisons RS propres | Calcul mathématique des maisons RS |
