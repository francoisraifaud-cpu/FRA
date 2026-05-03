# DOCUMENTATION WORKFLOW — THÈME ASTRAL NATAL

**Version** : v8.3 (Sprints 8.2 + 8.3 — Calibrage `computeChartShape` + orbes Yod resserrés ; déployé 2026-05-03)
**Plateforme** : n8n Cloud
**Auteur** : François Raifaud
**Bench de référence** : 100 thèmes natals de personnalités (sources Astro-Databank / Astrothème, audit Rodden Rating AA/A/B). Détail complet : `SITE/scripts/THEME-FIABILITE-RAPPORT.md`. Synthèse publique : fiche produit `/rapports/theme` du site (section « Validation et fiabilité »).

---

## 1. VUE D'ENSEMBLE

Le workflow **THEME** produit l'analyse complète du thème astral natal d'un individu. Il reçoit les données astronomiques brutes (positions planétaires, maisons) et génère :

- Des **calculs astrologiques avancés** (dignités, aspects, configurations, lots, etc.)
- Des **prompts structurés** pour un LLM (Gemini) qui rédige l'interprétation narrative maison par maison + synthèse globale
- Des **rapports HTML/PDF** techniques et finaux

### Architecture des nœuds

| Nœud | Fichier | Rôle |
|---|---|---|
| **Extract Variables** | `N8N Theme Extract Variables` | Extraction des variables du formulaire (prénom, nom, date, lieu, genre, langue, consigne de rédaction) |
| **Prepare Data** | `N8N Theme Prepare Data` | Préparation et appels API (positions planétaires, maisons, étoiles fixes) |
| **PrepareLL** | `N8N Theme PrepareLL` | Préparation des données pour le LLM |
| **Restructure Merge** | `N8N Theme Restructure Merge` | Fusion et restructuration des données API |
| **Enrichissement Astrologique** | `N8N Theme` | **NŒUD CENTRAL** — Tous les calculs astrologiques + génération des prompts LLM. Ce code est également répliqué dans le workflow PREV (nœud `Enrichissement Astrologique` de `N8N Prev Prepare Data Transits`) |
| **LLM Interprétation** | `N8N Theme LLM` | Appel Gemini 3.1 Pro Preview — interprétation brute (1 appel par maison + synthèse = 13 appels) |
| **Traducteur / Vulgarisateur** | `N8N Theme Trad LLM` | Appel Gemini — vulgarisation du texte technique pour le client final |
| **Validateur** | `N8N Theme Validateur` | Validation silencieuse post-LLM (JSON) — détection d'hallucinations |
| **Rapport Données Techniques** | `N8N Theme Repport` | Génération du rapport HTML des données techniques (roue, tableaux, légendes) |
| **Rapport HTML Tech** | `N8N Theme Repport HTML Tech` | Assemblage du rapport narratif technique (texte LLM brut + cartouches maisons) |
| **Rapport HTML Final** | `N8N Theme Repport HTML Final` | Assemblage du rapport narratif final (texte vulgarisé + cartouches maisons) |

---

## 2. NŒUD CENTRAL — ENRICHISSEMENT ASTROLOGIQUE (`N8N Theme`)

### 2.1 Données d'entrée

- `input.planetes.output` — Tableau des positions planétaires (API)
- `input.maisons.output.Houses` — Tableau des 12 maisons (Placidus)
- `input.etoilesFixes.output` — Étoiles fixes (API)
- `input.eclipseNatal` — Éclipse à la naissance (optionnel)
- Variables personnelles : prénom, nom, date, lieu, genre, langue, consigne rédaction

### 2.2 Calculs astrologiques — Liste exhaustive

#### Section 1 — Filtrage et normalisation
- Filtrage Nœud Vrai vs Nœud Moyen (priorité au Vrai)
- Normalisation des noms de planètes (fr/en)
- Calcul automatique du Nœud Sud (opposition au Nœud Nord)

#### Section 2 — Statistiques élémentaires
- **Balance Éléments** : Feu / Terre / Air / Eau (12 points majeurs)
- **Balance Modes** : Cardinal / Fixe / Mutable

#### Section 3 — Utilitaires maisons
- `getHouseNumber(deg)` — Localisation en maison par degré zodiacal
- `angularDiff(a, b)` — Différence angulaire normalisée

#### Section 4 — Secte et Lots hermétiques
- **Secte (Diurne/Nocturne)** : calcul géométrique arc ASC→Soleil (pas par numéro de maison)
- **Luminaires de secte** : Soleil (diurne) / Lune (nocturne)
- **Bénéfique/Maléfique de secte** : Jupiter/Saturne (diurne) — Vénus/Mars (nocturne)
- **16 Lots hermétiques** :
  1. Part de Fortune (Tyche)
  2. Lot de l'Esprit (Daimon)
  3. Lot de Nécessité (Ananke)
  4. Lot d'Éros
  5. Lot de Courage (Tolma)
  6. Lot de Némésis
  7. Lot de Basis
  8. Lot d'Exaltation
  9. Lot du Daemon
  10. Lot de Victoire (Nikè)
  11. Lot du Père
  12. Lot de la Mère
  13. Lot de Maladie
  14. Lot du Mariage
  15. Lot des Enfants
  16. Lot de Voyage
- Formules inversées selon la secte (diurne ≠ nocturne) conformes à Vettius Valens / Paulus Alexandrinus / Firmicus Maternus

#### Section 5 — Aspects nataux
- **10 types d'aspects** : Conjonction, Sextile, Carré, Trigone, Opposition (majeurs) + Quinconce, Semi-Sextile, Semi-Carré, Quintile, Biquintile, Sesqui-Carré (mineurs)
- **Orbes différenciés** : standard / nodal / petits corps
- **Exclusion des paires axiales** : ASC/DSC, MC/IC, NN/NS (pas d'aspects car axiome géométrique)
- **Qualificatif d'orbe** : exact (<1°), serré (<3°), moyen (<5°), large (≥5°)
- **Natures planétaires** : bénéfique, maléfique, luminaire, dissolvant, neutre — tags interprétatifs par paire
- **Appliquant / Séparant** : basé sur la vitesse planétaire (Lune la plus rapide → Pluton la plus lente)
- **Significations des aspects mineurs** : Quintile (harmonie créatrice), Quinconce (ajustement obligatoire), etc.

#### Section 6a — Conditions héliocentriques
- **Cazimi** : ≤0°17' du Soleil — force exceptionnelle
- **Combuste** : ≤8° du Soleil — principe planétaire neutralisé
- **Sous les rayons** : ≤15° du Soleil — agit en coulisse
- **Libre du Soleil** : >15° — pleine autonomie
- **Phases lunaires spécifiques** : Cazimi Lunaire, Nouvelle Lune, Lune Croissant, Lune Balsamique
- **Oriental / Occidental** : Mercure et Vénus — étoile du matin / étoile du soir

#### Section 6b — Planètes angulaires
- Détection à ≤5° de ASC, DSC, MC, IC
- Priorité maximale d'interprétation

#### Section 6c — Degrés critiques
- **29° Anarète** : tension, urgence, fin de cycle
- **0° Ingress** : énergie brute, commencement absolu
- **Degrés critiques par modalité** : Cardinal (0°, 13°, 26°), Fixe (8-9°, 21-22°), Mutable (4°, 17°)

#### Section 6d — Réceptions mutuelles
- **Par domicile** : coopération structurelle maximale
- **Par exaltation** : élan créateur mutuel
- **Mixte** : domicile + exaltation croisés

#### Section 6e — Configurations natales (7 types)
1. **Stellium** (par signe ET par maison) : 3+ planètes concentrées
2. **Grand Trigone** : 3 planètes à ~120° — harmonie, facilité
3. **T-Carré** : opposition + carré à l'apex — tension, moteur de dépassement
4. **Grand Carré** : 4 planètes en carré/opposition mutuels — défi structurant
5. **Yod (Doigt de Dieu)** : sextile + double quinconce — mission karmique
6. **Cerf-Volant (Kite)** : Grand Trigone + opposition + 2 sextiles — talent canalisé
7. **Croix Modale** (Cardinale / Fixe / Mutable) : 4+ planètes en mode activé

- **Score de puissance multi-critères** : base hiérarchique + bonus Luminaires (+50), Angles (+40), Étoile fixe (+30), OOB (+20), Parallèle (+20), exactitude d'orbe (0-10)
- **Déduplication post-calcul** : marquage des sous-configurations (T-Carré ⊂ Grand Carré, Grand Trigone ⊂ Kite) et des variantes (planètes communes)

#### Section 6e-bis — Forme du thème / Jones Patterns (v7.0)
- **`computeChartShape`** : détecte le pattern de distribution planétaire (Bucket, Bowl, Locomotive, Seesaw, Splash, Splay, Bundle, Fan)
- **Identification du Singleton** : en cas de pattern Bucket, la planète isolée (handle) est identifiée par son nom et sa maison
- **Injection dans le prompt** : tag `SINGLETON` dans les prompts per-house et synthèse avec instructions d'interprétation spécifiques

#### Section 6f — Antiscia et Contra-Antiscia
- Miroir sur l'axe 0° Cancer / 0° Capricorne
- Orbe ±1.5°
- 10 planètes majeures

#### Section 6g — Midpoints
- 45 midpoints (10 planètes, combinaisons 2 à 2)
- Détection des activateurs (planète sur un midpoint à ≤1.5°)
- Types : direct / miroir

#### Section 6h — Étoiles fixes (26 étoiles)
- **5 Étoiles Royales** (orbe ±2°) : Aldébaran, Sirius, Régulus, Spica, Antarès
- **21 autres étoiles** (orbe ±1° à ±1.5°) : Algol, Pléiades/Alcyone, Véga/Wega, Fomalhaut, Rigel, Bételgeuse, Castor, Pollux, Procyon, Canopus, Arcturus, Deneb Algedi, Vindemiatrix, Scheat, Zubenelgenubi, Zubeneschamali, Achernar, Deneb
- Descriptions détaillées (nature planétaire, signification traditionnelle)
- Conjonctions aux **planètes** ET aux **4 angles** (ASC, IC, DSC, MC)
- Exclusion des Lots mathématiques

#### Section 6i — Déclinaisons
- **Hors Limites (OOB)** : déclinaison > ±23.44° — énergie décuplée, électron libre
- **Parallèles (//)** : même hémisphère, orbe 1° (1.5° si luminaire) — agissent comme des conjonctions profondes en 3D
- **Contre-Parallèles (#)** : hémisphères opposés — agissent comme des oppositions profondes

#### Section 6j — Score de puissance des configurations
- Tri multi-critères : base + luminaires + angles + étoiles + OOB + parallèles + exactitude
- Labels : PRIORITÉ ABSOLUE (≥120), Majeure (≥80), Significative (≥50), Mineure (<50)

#### Section 6k — Score de puissance des aspects individuels
- Base par type d'aspect (Conjonction 10, Opposition 9, ... Semi-Sextile 1)
- Bonus exactitude + luminaires + angles + OOB + étoiles + natures planétaires
- Labels : CAPITAL (≥30), FORT (≥20), MODÉRÉ (≥12), MINEUR (<12)
- **Promotion d'aspects mineurs** : seuil 20 (planètes majeures) / 28 (petits corps) — traitement équivalent majeur

#### Section 7 — Fiches maisons et locataires
- **12 fiches** avec segments (Cuspide / Intercepté / Fin de Maison)
- Par segment : signe, maître, patron, dignité, conditions héliocentriques
- Par locataire : planète, degré, dignité, sac à dos (maîtrises), patron, décan chaldéen, terme égyptien, triplicité, aspects majeurs/mineurs/promus, conditions héliocentriques, angularité, degrés critiques, OOB, parallèles/contra-parallèles, étoiles fixes conjointes

#### Section 8 — Profil de sensibilité
- Vulnérabilité élémentaire (<15% d'un élément)
- Familiarité élémentaire (>35% d'un élément)
- Résistance au changement (Fixe ≥5)
- Adaptabilité élevée (Mutable ≥5)

#### Section 9 — Prompt Synthèse globale
- Identité du thème (secte, éléments, modes)
- Profil de sensibilité
- Configurations natales triées par puissance
- Planètes angulaires
- Degrés critiques
- Réceptions mutuelles
- Antiscia et Contra-Antiscia
- Midpoints activés
- Conditions héliocentriques
- Planètes OOB
- Parallèles et Contre-Parallèles
- Piliers du thème (Soleil, Lune, ASC, MC, Gouverneur, Almutem)
- Lots hermétiques
- Axe karmique (NN/NS)
- Étoiles fixes (planètes + angles)
- Arbre des dispositions
- Force planétaire (Lilly)
- Hayz
- Planètes assiégées
- Lune Vide de Course
- Degrés Sabian

#### Section 10 — Éclipse à la naissance
- Détection et injection dans le prompt de la maison concernée + synthèse
- Signature karmique centrale

#### Section 11 — Emphase hémisphérique
- Nord / Sud / Est / Ouest (répartition des 10 planètes)

#### Section 12 — Planète dominante
- Score multi-critères : angularité (+3), dignité (+2/+1), Cazimi (+2), aspects majeurs (max +5), OOB (+3), gouverneur (+2/+1), maîtrises de maisons (+1)

#### Section 12 — Almutem Figuris
- 5 points clés : ASC, Soleil, Lune, Part de Fortune, MC
- 5 niveaux de dignité : Domicile (+5), Exaltation (+4), Triplicité (+3), Terme égyptien (+2), Décan chaldéen (+1)
- **v7.0** : `ALMUTEM_PLANETS` inclut les planètes modernes (Uranus, Neptune, Pluton) + bonus triplicité dans le scoring

#### Section 12b — Techniques avancées
- **Arbre des dispositions** : chaîne de maîtrise planète → maître du signe → maître du maître... jusqu'au dispositeur final (planète en domicile) ou détection de boucle
- **Dignité accidentelle (Lilly)** : scoring par maison (angulaire +5/+4, succédente +3, cadente +2, cadente faible -5), rétrogradation (-5/+4), conditions héliocentriques (Cazimi +5 / Combuste -5 / Sous les rayons -4 / Libre +5), réception mutuelle (+5), dignité essentielle (Domicile +5 / Exaltation +4 / Exil -5 / Chute -4)
- **Hayz** : condition de secte optimale — planète diurne au-dessus de l'horizon en signe masculin (jour), planète nocturne sous l'horizon en signe féminin (nuit)
- **Planètes assiégées** : planète entre Mars et Saturne (maléfiques traditionnels)
- **Lune Vide de Course** : la Lune ne forme plus d'aspect majeur appliquant avant de quitter son signe
- **Degrés Sabian** : 360 symboles poétiques (un par degré zodiacal) — nuance interprétative

### 2.3 Système de prompts LLM

#### Prompt System (`SYSTEM_NATAL`)
- Astrologue expert de renommée mondiale
- Maîtrise des techniques classiques (hellénistique, chaldéenne, arabe) et modernes
- Règles de fidélité aux données (pas de déplacement de planètes, pas d'invention d'aspects)
- Hiérarchie aspects majeurs > mineurs
- Distinction Pérégrin ≠ Exil ≠ Chute
- Déclinaison ≠ longitude (parallèle ≠ conjonction)
- Triplicité = soutien secondaire, pas au même niveau que le maître du signe

#### Prompt User (par maison)
1. Mémo positions natales (garde anti-hallucination)
2. Tags Gouverneur / Almutem / **Singleton** (v7.0) si applicable
3. Configurations natales actives dans cette maison
4. Segments par signe (Cuspide → Suite → Fin)
5. Étoiles fixes sur la cuspide
6. Maître de la maison + chaîne de maîtrise
7. Locataires avec tous leurs attributs
8. Éclipse natale (si dans cette maison)
9. **Rappel contextuel** (v7.0) : `rappelLines` généré dynamiquement dans la boucle per-house

#### Prompt Synthèse (Maison 13)
- Identité complète du thème + toutes les techniques avancées
- **Singleton** (v7.0) : instruction explicite d'interprétation du singleton comme point focal du thème
- **Terminologie secte** (v7.0) : instructions précises pour distinguer in-sect malefic vs out-of-sect malefic (ex: Saturne vs Mars en secte diurne)
- Instruction : identifier 3-5 grandes thématiques de vie

### 2.4 Données de sortie

```json
{
  "planetes": [...],
  "maisons": [...],
  "aspects": [...],
  "configurations": [...],
  "angularPlanets": [...],
  "criticalPlanets": [...],
  "mutualReceptions": [...],
  "antiscia": [...],
  "midpoints": {...},
  "midpointActivations": [...],
  "helioConditions": {...},
  "stats": {...},
  "prompts": {...},
  "prompts_llm": {...},
  "perso": {...},
  "eclipseNatal": {...},
  "etoileMatches": [...],
  "etoileCuspMatches": [...],
  "planeteOOB": [...],
  "paralleles": [...],
  "contreParalleles": [...],
  "dispositorTree": {...},
  "accidentalDignity": [...],
  "hayzPlanets": [...],
  "besiegedPlanets": [...],
  "moonVOC": {...},
  "sabianData": {...}
}
```

---

## 3. RAPPORT DONNÉES TECHNIQUES (`N8N Theme Repport`)

Génère un rapport HTML/PDF de ~20 pages contenant :

1. **Roue du thème astral** (SVG) — 12 maisons, planètes positionnées, lots, aspects majeurs
2. **Légende complète** (planètes + lots + aspects) — sur 1 page
3. **Positions planétaires** — tableau détaillé (signe, degré, maison, dignité, décan, terme, triplicité, rétrogradation, déclinaison)
4. **Maisons** — tableau des 12 maisons (signe cuspide, degré, maître)
5. **Aspects nataux** — tableau avec orbe, type, score
6. **Configurations natales** — avec score de puissance et description
7. **Réceptions mutuelles** — par domicile, exaltation, mixte
8. **Conditions héliocentriques** — Cazimi, Combuste, Sous les rayons, Oriental/Occidental
9. **Antiscia et Contra-Antiscia**
10. **Midpoints activés**
11. **Étoiles fixes** — conjonctions planètes + angles
12. **Déclinaisons** — OOB, parallèles, contra-parallèles
13. **Lots hermétiques** — 16 lots avec position, signe, maison
14. **Statistiques** — éléments, modes, hémisphères, secte, gouverneur, almutem, planète dominante
15. **Arbre des dispositions** — chaîne de maîtrise + dispositeur final
16. **Force planétaire (Lilly)** — tableau avec détail du scoring
17. **Hayz** — planètes en condition optimale
18. **Planètes assiégées**
19. **Lune Vide de Course**
20. **Degrés Sabian** — symboles par planète

---

## 4. RAPPORT HTML TECHNIQUE (`N8N Theme Repport HTML Tech`)

Rapport narratif destiné aux **astrologues professionnels** :

- Structure : 12 cartouches de maisons + synthèse globale
- Chaque cartouche contient :
  - Numéro de maison + signe(s) + degré cuspide
  - Locataires (planètes résidentes) avec badges
  - Lots hermétiques présents (badges colorés)
  - Étoiles fixes conjointes aux planètes et à la cuspide (badges dorés ★/★★)
  - **Texte LLM BRUT** (non vulgarisé) — termes techniques conservés
- Pas de validation anti-hallucination visible (bandeaux supprimés)

---

## 5. RAPPORT HTML FINAL (`N8N Theme Repport HTML Final`)

Rapport narratif destiné au **client final** :

- Structure identique au rapport Tech (mêmes cartouches, mêmes badges)
- **Seule différence** : le texte LLM est passé par le **Traducteur/Vulgarisateur** qui :
  - Supprime le jargon technique (Trigone, Carré, Cuspide, Orbe, Décan, etc.)
  - Conserve les noms de planètes, signes zodiacaux, étoiles fixes et le mot "éclipse"
  - Remplace "Maison X" par sa signification en langage courant
  - Préserve 100% de la longueur et de l'architecture du texte original

---

## 6. VALIDATEUR SILENCIEUX (`N8N Theme Validateur`)

Nœud de validation post-LLM qui produit un **JSON de logs** (pas de bandeaux visuels) :

### Validations effectuées :
1. **`house_mismatch`** : vérification que le LLM ne place pas une planète dans une maison incorrecte (matching avec boundary pour éviter m1↔m11)
2. **`sign_mismatch`** : vérification que le LLM ne place pas une planète natale dans un signe incorrect (limité aux mentions explicites "natal/natale")
3. **`invented_aspect`** : détection d'aspects inexistants dans les données

### Mesures anti-faux-positifs :
- `matchWithBoundary` : frontières de mots pour les numéros de maison
- `TRANSIT_VERBS` : liste étendue de verbes/expressions de contexte transit exclus (traversée, formera, activera, cette année, en 2026, etc.)
- Splitting par phrase avant analyse

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

## 7. TRADUCTEUR LLM (`N8N Theme Trad LLM`)

### Rôle
Réécriture du texte technique en récit fluide, poétique et intelligible.

### Règles de vulgarisation
- **Termes SUPPRIMÉS** : Trigone, Carré, Opposition, Sextile, Quinconce, Cuspide, Décan, Terme égyptien, Triplicité, Orbe, Domicile, Exaltation, Exil, Chute, Pérégrin, Angulaire, Succédente, Cadente, Midpoint, Antiscia, Dignité, Cazimi, Combuste
- **Termes CONSERVÉS** : noms de planètes (Soleil, Lune, Mercure...), noms de signes (Bélier, Taureau...), noms d'étoiles fixes (Régulus, Sirius...), le mot "éclipse"
- **Remplacement** : "Maison X" → signification (ex: "Maison 7" → "sphère du couple et des partenariats")
- **Contrainte** : 100% de la longueur et de l'architecture conservées — pas de résumé

### Garde genre grammatical (v7.0)
- Instruction explicite interdisant de modifier le genre grammatical du texte source
- Exemples fournis au LLM : masculin (passionné, déterminé, porté) / féminin (passionnée, déterminée, portée)
- Appliqué dans le **prompt user** (point 5 des règles) ET le **prompt system**
- Résout le bug de genre féminin appliqué à un client masculin (hallucination LLM récurrente)

---

## 8. PARAMÈTRES DE PERSONNALISATION

| Paramètre | Valeurs | Impact |
|---|---|---|
| `consigne_redaction` | Tu / Vous / Il / Elle | Pronom dans le texte LLM |
| `genre` | M / F | Accords grammaticaux |
| `langue` | Français / English / ... | Langue de rédaction du LLM |

---

## 9. TABLES DE RÉFÉRENCE UTILISÉES

| Table | Source | Usage |
|---|---|---|
| Dignités essentielles | Ptolémée + modernes | Domicile, Exaltation, Exil, Chute |
| Décans Chaldéens | Tradition chaldéenne | Co-gouvernance des 3 décans par signe |
| Termes Égyptiens | Ptolémée (Boundaries) | 5 termes par signe — dignité fine |
| Triplicités | Ptolémée/Dorothée | Seigneurs diurne/nocturne par élément |
| Natures planétaires | Tradition classique | Bénéfique/Maléfique/Luminaire/Dissolvant/Neutre |
| Vitesses planétaires | Référence standard | Appliquant/Séparant (Lune=1 → Pluton=10) |
| 26 étoiles fixes | Tradition ptolémaïque | Natures, descriptions, orbes différenciés |
| 360 degrés Sabian | Marc Edmund Jones / Dane Rudhyar | Symboles imagés par degré zodiacal |
| Maîtrises modernes | Convention contemporaine | Pluton→Scorpion, Uranus→Verseau, Neptune→Poissons |
| Maîtrises traditionnelles | Pré-1781 | Mars→Scorpion, Saturne→Verseau, Jupiter→Poissons |

---

## 10. COHÉRENCE INTER-WORKFLOWS (v7.0)

Le code de `N8N Theme` sert de **source unique** pour les calculs nataux dans les deux workflows :

| Workflow | Nœud | Code source |
|---|---|---|
| **THEME** | Enrichissement Astrologique | `N8N Theme` (original) |
| **PREV** | Enrichissement Astrologique (dans `N8N Prev Prepare Data Transits`) | Copie intégrale de `N8N Theme` v7.0 |

> **Règle de maintenance** : toute modification de `N8N Theme` doit être répliquée dans le nœud `Enrichissement Astrologique` du sub-workflow `N8N Prev Prepare Data Transits` pour maintenir la cohérence. Les prompts nataux générés par ce code dans le contexte PREV sont des données inertes (non lues par les nœuds en aval du workflow PREV).

De même, les garde-fous LLM (genre grammatical, anti-hallucination) sont appliqués de manière cohérente entre `N8N Theme Trad LLM` et `N8N Prev Trad LLM`.

---

## 11. CHANGELOG — SPRINT 8 (v7.0)

### Bugs corrigés
| Bug | Nœud | Cause racine | Correctif |
|---|---|---|---|
| `ReferenceError: memoLines before initialization` | `N8N Theme` | Variable utilisée dans un rappel final avant sa déclaration (boucle per-house) | Construction de `rappelLines` directement dans la boucle per-house |
| Singleton non nommé ("Bucket" sans mention de la planète isolée) | `N8N Theme` | `computeChartShape` ne renvoyait pas le nom du singleton | Refactoring de `computeChartShape` pour identifier et nommer le singleton + sa maison |
| Genre féminin pour un client masculin dans rapport vulgarisé | `N8N Theme Trad LLM` | Hallucination LLM lors de la réécriture | Garde genre explicite dans prompt user + system (exemples masculin/féminin) |
| Terminologie Mars "maléfique de secte diurne" incorrecte | `N8N Theme` | LLM confond in-sect et out-of-sect malefics | Instructions explicites dans `pSynth` et prompts per-house |

### Améliorations
| Amélioration | Nœud | Détail |
|---|---|---|
| Almutem Figuris renforcé | `N8N Theme` | `ALMUTEM_PLANETS` inclut planètes modernes + bonus triplicité |
| Forme du thème avec singleton nommé | `N8N Theme` | `computeChartShape` identifie le handle du Bucket (nom + maison) |
| Singleton dans les prompts | `N8N Theme` | Instructions interprétatives dans prompts per-house + synthèse |
| Terminologie secte in/out | `N8N Theme` | Distinction claire in-sect vs contra-sect malefic dans la synthèse |
| Garde genre Trad LLM | `N8N Theme Trad LLM` | Protection contre l'inversion de genre lors de la vulgarisation |

---

## 12. CHANGELOG — SPRINT 9 (v8.0) — Anti-hallucinations systémiques

### Audit exhaustif et corrections

Audit complet des 4 rapports narratifs (RT THEME, RF THEME, RT PREV, RF PREV) vs Données Techniques.

| Hallucination | Gravité | Cause racine | Correctif |
|---|---|---|---|
| "Uranus maître de M2" (vrai : Neptune/Poissons) | CRITIQUE | `positionMemo` ne listait pas les maîtrises de maisons | Ajout `[MAÎTRISES DE MAISONS]` dynamique dans `positionMemo` |
| "Vulnérabilité Terre" au lieu de "Air" (8 occurrences per-house) | CRITIQUE | `sensitivityProfileTheme` absent des prompts per-house | Injection dans chaque prompt per-house via passe post-`prompts_llm` |
| "Stellium Vénus/Saturne/Uranus en M11" (Vénus en M10) | MOYENNE | Confusion stellium par signe vs résidence par maison | Disclaimer dans section CONFIGURATIONS per-house |
| "Bételgeuse = étoile royale" | MINEURE | Pas de garde-fou sur le terme "Royale" | Instruction dans tous les prompts (synthèse + per-house) |

### Gardes préventives

| Garde | Portée | Détail |
|---|---|---|
| Maîtrises de maisons | `positionMemo` (tous prompts) | M1=X(signe)...M12=Y(signe) + "maître = ruler CUSPIDE, pas interception" |
| Profil sensibilité per-house | 12 prompts maison | FAMILIARITÉ/VULNÉRABILITÉ avec chiffres exacts |
| OOB exclusif | `positionMemo` | Liste fermée — empêche attribution OOB erronée |
| Signes interceptés | `positionMemo` | "NE GOUVERNE PAS la maison" |
| Disclaimer configurations | Per-house | "Stellium par signe ≠ résidence par maison" |
| Étoiles Royales | Tous prompts | Liste fermée : Aldébaran, Régulus, Antarès, Fomalhaut |

### Fichiers modifiés
- `N8N Theme` : positionMemo enrichi, sensitivityProfile per-house, disclaimer configs, garde étoiles
- `N8N Prev Prepare Data Transits` : Enrichissement Astrologique mis à jour avec N8N Theme v8.0

---

## SPRINT 8.1 — HARMONISATION INTER-WORKFLOWS (v4.0)

### Modulations du score de puissance des aspects (bloc 6k)

Quatre modulations portées depuis le moteur SYN v4.0.0 enrichissent le score de puissance des aspects nataux individuels :

| Modulation | Bonus | Justification astrologique |
|---|---|---|
| **Rétrogradation** | +2 (une planète rétro), +3 (deux) | L'énergie rétrograde est internalisée — l'aspect est vécu plus intensément au plan psychologique, augmentant sa signification |
| **Stationnaire** | +4 (une planète stationnaire), +6 (deux) | Une planète quasi-immobile concentre son énergie de manière exceptionnelle — l'aspect est « figé » et extrêmement puissant |
| **Dignité essentielle** | +2 par planète en Domicile/Exaltation, +1 par planète en Exil/Chute (sans contrepartie forte) | Une planète dignifiée exprime l'aspect avec plénitude ; une planète débilitée rend l'aspect plus difficile et donc plus significatif |
| **Réception dans l'aspect** | +3 (réception mutuelle domicile), +1 (réception unilatérale) | Deux planètes en réception partagent un lien de dignité croisé — l'aspect est qualitativement adouci et constructif. Détection par-aspect (pas seulement globale) via `_uniReceptionMap` |

**Impact sur le scoring** : ces modulations sont additives au score existant (base + exactBonus + luminaire + angle + OOB + étoile + nature). Les seuils de labels (CAPITAL ≥30, FORT ≥20, MODÉRÉ ≥12, MINEUR <12) et de promotion (`isPromoted`) restent inchangés. Certains aspects montent naturellement d'un tier.

**Non-régression** : aucun score existant n'est diminué. Seules des additions conditionnelles sont appliquées.

### Fichiers modifiés
- `N8N Theme` : bloc 6k enrichi avec 4 modulations v4.0

---

## SPRINT 8.2 — CALIBRAGE `computeChartShape` (v8.2, 2026-05-03)

### Bug détecté lors du bench n=100

L'audit `theme-bench-volume-analysis.md` (Bench v8.0, n=100, NDJSON `theme-bench-volume-super.ndjson`) a relevé une incohérence majeure dans la classification des **Jones Patterns** :

| Forme | Prévalence v8.0 (n=100) | Prévalence attendue | Diagnostic |
|---|---:|---:|---|
| Bucket | 50/100 (50 %) | ~10–15 % | **Sur-classification** |
| Locomotive | 0/100 (0 %) | ~25–30 % | **Jamais détectée** |

### Cause racine

Dans `computeChartShape`, la borne `maxGap ≤ 120` du **Bucket** interceptait toute la fenêtre `[60, 90]` réservée à la **Locomotive**, et la définition Bucket acceptait un nombre quelconque de singletons (sans contrainte 1–2). Tout thème avec un gap ≥ 60° tombait en Bucket avant que la branche Locomotive ne soit testée.

### Correctif

Dans `N8N Theme`, fonction `computeChartShape` :

| Forme | Avant v8.0 | Après v8.2 |
|---|---|---|
| **Bucket** | Singletons quelconques + `maxGap ∈ [60, 120]` | **1–2 singletons** + **2 gaps ≥ 60°** + maxGap < 180 |
| **Locomotive** | `maxGap ∈ [60, 90]` (jamais atteinte à cause du Bucket) | `maxGap ∈ [60, 120]` (priorité dans l'ordre des tests, après Bowl/Bundle/Splash) |

### Validation post-déploiement (bench n=100)

- 22/100 cas reclassifiés (principalement Bucket → Locomotive).
- Prévalences post-fix : Bucket ~12 %, Locomotive ~28 % — alignement attendu sur la littérature (Jones, Rudhyar).
- 14/14 invariants structurels à 100/100 PASS, **1 400 / 1 400 contrôles** sur la cohorte.
- Audit narratif E3 (3 cas LLMs activés) : Bardot (Bucket préservé) + Jobs (Locomotive nouvellement détectée) + Beauvoir — 17/17 contrôles d'absence d'hallucination, le narratif Gemini cite désormais l'élan Locomotive sans plus mentionner par erreur de « singleton focalisateur ».

### Fichiers modifiés

- `N8N Theme` : `computeChartShape` (Bucket strict 1–2 singletons + 2 gaps ; Locomotive [60,120])
- `SITE/scripts/theme-bench-simulate-fixes.mjs` : simulateur de patches sur NDJSON existant (sans PROD)

---

## SPRINT 8.3 — ORBES YOD RESSERRÉS AU STANDARD ASTROLOGIQUE (v8.3, 2026-05-03)

### Bug détecté lors du bench n=100

Sur le NDJSON post-Sprint 8.2, le détecteur de **Yod (Doigt de Dieu)** affichait une prévalence de **50/100** thèmes — bien au-dessus de la prévalence astrologique attendue (5–10 % d'après Robert Hand, Karen Hamaker-Zondag).

### Cause racine

Le détecteur Yod (`N8N Theme`, ligne ~740) réutilisait l'orbe **sextile global ±6°** (suffisant pour les aspects ordinaires) et l'orbe **quinconce global ±3°**. Pour la figure Yod (sextile à la base + 2 quinconces convergents), ces orbes sont trop permissifs : ils captent des configurations approximatives qui n'ont pas l'intensité d'un Yod réel.

### Correctif

Orbes Yod resserrés au standard publié par Robert Hand et Karen Hamaker-Zondag :

| Aspect dans le Yod | Avant v8.2 | Après v8.3 |
|---|---:|---:|
| Sextile (base) | ±6° | **±3°** |
| Quinconce (jambes) | ±3° | **±2°** |

Implémentation : variables locales `YOD_SEXTILE_ORB = 3` et `YOD_QUINCONCE_ORB = 2` dans la fonction de détection (n'affecte que le détecteur Yod ; les aspects nataux ordinaires conservent leurs orbes globaux).

### Validation post-déploiement (bench n=100)

- Yods détectés : **50 → 21** sur 100 thèmes (alignement sur la prévalence astrologique attendue).
- 19 cas affectés par le retrait de Yod ; 0 cas avec ajout (le resserrement ne crée jamais de faux positif nouveau).
- Cas iconiques préservés : Steve Jobs (Yod culminant Vénus/Mars/Pluton, orbe sextile 0,15°), Marilyn Monroe (Yod Mercure/Soleil/Pluton).
- Audit narratif Jobs : le Yod est cité **5 fois** dans le narratif Gemini avec mention de l'orbe exact 0,15° — pas de mention parasite des Yods supprimés.

### Fichiers modifiés

- `N8N Theme` : constantes `YOD_SEXTILE_ORB` / `YOD_QUINCONCE_ORB` dans la branche `detectYods`

---

## SYNCHRONISATION INTER-PRODUITS (Fan-out 8.2 + 8.3)

Conformément à la règle de cohérence inter-workflows (§ 10), les patches Sprint 8.2 + 8.3 ont été **propagés à l'identique** dans les copies clonées du moteur natal :

| Workflow cible | Nœud(s) | Outil |
|---|---|---|
| **PREV** | `Enrichissement Astrologique` (sub-workflow `N8N Prev Prepare Data Transits`) | `npm run theme:fan-out-deploy` (script `theme-fan-out-deploy.mjs`) |
| **SYN** | `Enrichissement Astrologique A` + `Enrichissement Astrologique B` (sub-workflow `N8N SYN PREPARE DATA`) | idem |
| **SYN** | `Super noeud Syn` (composite chartShape + Yod composite) | idem |

**Vérification** : `npm run theme:coherence-scan` (script `workflows-astro-coherence-scan.mjs`) parcourt tous les workflows actifs et compare le code des clones contre `FRA/THEME/N8N Theme` (source de vérité). Toute divergence est listée. À lancer après chaque `theme:deploy-supernode`.

**Bench post fan-out** : `npm run bench:fanout-analyze` agrège un NDJSON (PREV n=10 + SYN n=10) pour vérifier la prévalence Locomotive et Yod sur les clones — invariants Sprint 8.2 / 8.3 préservés (Locomotive Reagan détecté côté PREV, 4 Locomotive natals + 5 Yods composite côté SYN).

---

## OUTILS DE BENCH & DÉPLOIEMENT THEME

| Script (npm) | Rôle | Sortie |
|---|---|---|
| `bench:theme-build-manifest` | Dérive le manifest 100 cas depuis le manifest PREV | `theme-bench-volume-100-manifest.json` |
| `bench:theme-volume` | POST 100 cas vers `theme-site-order` (`TVJVzhKmUdfgPmRd`), poll API n8n, extrait Super noeud | `theme-bench-volume-super.ndjson` |
| `bench:theme-analyze` | Calcule 14 invariants + 8 distributions | `theme-bench-volume-analysis.{md,json}` |
| `bench:theme-simulate-fixes` | Simule un patch sur NDJSON existant (sans PROD) | `theme-bench-simulate-fixes.{md,json}` |
| `theme:deploy-supernode{,-dry}` | Déploie `FRA/THEME/N8N Theme` dans le Super noeud n8n PROD avec backup et vérification post-PUT (sentinelles `almutemScore`, `computeChartShape`, etc.) | `scripts/theme-supernode-backups/*.js` |
| `theme:fan-out-deploy{,-dry}` | Propage les patches sur tous les clones (PREV + SYN, normalisation CRLF→LF) | log + backups |
| `theme:coherence-scan` | Liste les divergences vs source de vérité | console + JSON |

> **Mode opératoire bench cold** : désactiver `Maison 1`–`Maison 12`, `Synthèse Globale1`, `2. Traducteur (1 par 1)`, `Convert HTML to PDF*`, `Upload Google Drive*`, `Envoi Email avec PDF` côté workflow PROD avant le bench — économie d'environ 1 300 appels Gemini par run de 100 cas.
