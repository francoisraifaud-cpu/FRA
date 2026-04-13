# DOCUMENTATION WORKFLOW — DÉDUCTION DE L'HEURE DE NAISSANCE (DHN)

**Version** : v4.1
**Plateforme** : n8n Cloud
**Auteur** : François Raifaud

---

## 1. VUE D'ENSEMBLE

Le workflow **DHN** déduit l'heure de naissance d'un individu (précision cible ±10-15 minutes) à partir de sa date et son lieu de naissance, **sans connaître l'heure**. Il combine plusieurs niveaux de validation :

1. **Niveau 1 — Questionnaire ASC** : 12 questions sur la perception extérieure → score par signe ascendant
2. **Niveau 2 — Arcs solaires** : validation par événements de vie datés → directions solaires
3. **Niveau 3 — Progressions secondaires** : progressions API → correspondances avec les angles candidats
4. **Niveau 4 — Révolutions solaires** : ASC/MC de la RS vs thème natal du slot (voir §10)

Le résultat est envoyé par email avec un rapport HTML détaillé incluant l'heure estimée, l'Ascendant déduit, et la ventilation des scores par méthode.

### Principe fondamental

Aucun LLM n'est utilisé. Toute la logique est en **JavaScript pur** dans des nœuds `Code` N8N. Le scoring repose sur des matrices de correspondance et des calculs astronomiques.

---

## 2. ARCHITECTURE DES NŒUDS

| Nœud | Fichier | Rôle |
|---|---|---|
| **Gmail Trigger DHN** | `N8N DHN Extract Variables` | Déclenchement par email (sujet "DHN", INBOX, non lu) |
| **Get Full Message DHN** | `N8N DHN Extract Variables` | Récupération du corps complet du message Gmail |
| **Parse Email DHN** | `N8N DHN Extract Variables` | Extraction des variables (nom, prénom, date, lieu, pays, mail, langue, genre) depuis le texte brut |
| **Test Manuel** | `N8N DHN Extract Variables` | Déclencheur alternatif pour tests avec données pinnées |
| **Extract Variables DHN** | `N8N DHN Extract Variables` | Pass-through des variables (pinned data pour le mode test) |
| **Geocodage** | `N8N DHN Extract Variables` | API Nominatim → latitude/longitude du lieu de naissance |
| **Prepare Timezone** | `N8N DHN Extract Variables` | Calcul du timestamp UTC à midi pour le jour de naissance |
| **Get Timezone** | `N8N DHN Extract Variables` | API TimezoneDB → `gmtOffset` en secondes |
| **Preparer scan 24h** | `N8N DHN Extract Variables` | Génération de 24 corps de requêtes API (1 par heure, 00h→23h) |
| **Scan Planetes** | `N8N DHN Extract Variables` | API `/western/planets` ×24 → positions planétaires horaires |
| **Analyser fenetres ASC** | `N8N DHN Extract Variables` | Détection des transitions de signe ASC → fenêtres temporelles |
| **Reponses Questionnaire** | `N8N DHN Questions générales` | 12 réponses pinnées sur la perception extérieure (QCM) |
| **Evenements de vie** | `N8N DHN Questions dates` | Jusqu'à 10 événements datés (1 à 3 dates par événement) |
| **Scorer** | `N8N DHN Scan fin Planetes` | **NŒUD CENTRAL** — Matrice questionnaire, recalcul des fenêtres ASC (échantillon horaire), **grille 5 min sur toute la journée** (288 slots), score Q par slot, URL progressions |
| **Scan fin planetes** | `N8N DHN Scan fin Planetes` | API `/western/planets` par slot de 5 min (batch ×6) |
| **Scan fin maisons** | `N8N DHN Scan fin Planetes` | API `/western/houses` par slot de 5 min (batch ×6) |
| **Scan progressions** | `N8N DHN Scan fin Planetes` | API `/progressions` (appel unique, plage dates événements) |
| **Merge** | `N8N DHN Scan fin Planetes` | Fusion planètes + maisons + progressions |
| **Resultat final** | `N8N DHN Repport` | **Assemblage final** — scoring arcs + progressions + génération HTML |
| **Envoyer resultat** | `N8N DHN Repport` | Envoi du rapport par Gmail |

**Site (Stripe → webhook)** : le sous-workflow `WEBHOOK DHN` nomme le nœud Code **`Extract Variables`** (sans « DHN »). Les nœuds Code **Prepare Timezone**, **Preparer scan 24h**, **Scorer** / **Scorer1** et le rapport HTML lisent le profil via `Extract Variables DHN` **ou** `Extract Variables` (fichiers mis à jour dans le dépôt). **Scorer** fusionne en outre les champs `q1`…`q12` et `evt1`…`evt10` de cet objet avec les sorties optionnelles **Reponses Questionnaire** / **Evenements de vie** (e-mail ou données pinnées).

---

## 3. FLUX DE DONNÉES — SCHÉMA

```
[Gmail Trigger / Test Manuel]
       │
       ▼
[Parse Email] ──► [Extract Variables DHN] (pinned data en mode test)
       │
       ▼
[Geocodage] ──► Nominatim API
       │
       ▼
[Prepare Timezone] ──► [Get Timezone] ──► TimezoneDB API
       │
       ▼
[Preparer scan 24h] ──► 24 requêtes (00h→23h)
       │
       ▼
[Scan Planetes] ──► API /western/planets ×24
       │
       ▼
[Analyser fenetres ASC] ──► Transitions de signe → fenêtres temporelles
       │
       ▼
[Reponses Questionnaire] (pinned, 12 QCM)
       │
       ▼
[Evenements de vie] (pinned, jusqu'à 10 événements)
       │
       ▼
[Scorer] ──► Scoring questionnaire + génération slots 5 min
       │
       ├──► [Scan fin planetes] ──► API /western/planets (batch ×6)
       ├──► [Scan fin maisons]  ──► API /western/houses  (batch ×6)
       └──► [Scan progressions] ──► API /progressions    (appel unique)
                   │
                   ▼
              [Merge 3 inputs]
                   │
                   ▼
            [Resultat final] ──► Scoring arcs + prog + HTML
                   │
                   ▼
          [Envoyer resultat] ──► Gmail
```

---

## 4. ENTRÉE DES DONNÉES

### 4.1 Variables de naissance

Extraites de l'email ou pinnées :
- `nom`, `prenom` : identité
- `date` : format `dd/mm/yyyy`
- `lieu`, `pays` : localisation → géocodage
- `mail` : adresse de retour du rapport
- `langue` : défaut `Français`
- `genre` : M/F
- `plage_naissance` (optionnel) : plage texte du type `8:00 - 14:00` ; sinon `heure_naissance_min` / `heure_naissance_max` si disponibles. Si une plage est fournie et qu’elle recoupe au moins une fenêtre ASC calculée dans le Scorer, les **métadonnées** de fenêtres (`fenUse`, `_fen`, `_allWindows`) sont restreintes à ces recoupements. **Le scan fin API reste une grille complète 00:00→23:55** (voir §6.3) : l’absence de recoupement ne supprime pas les appels ; `plageMeta.ignored` indique alors que la plage n’a pu être appliquée aux fenêtres.

### 4.2 Questionnaire ASC (12 questions)

Les 12 questions portent exclusivement sur la **perception extérieure** de l'individu (comment les autres le voient), ce qui correspond à l'Ascendant en astrologie :

| Q | Thème | Options |
|---|---|---|
| q1 | En société, on vous perçoit comme... | Énergique, Calme, Vif, Réservé, Charismatique, Doux |
| q2 | Physiquement on vous décrit plutôt... | Sportif, Solide, Mince, Doux, Imposant, Anguleux |
| q3 | Face à l'inconnu, votre réaction visible... | Foncer, Observer, Questionner, Se protéger, Prendre le lead, Analyser, Sonder, Se laisser porter |
| q4 | En groupe, on vous voit comme... | Leader, Diplomate, Indépendant, Confident, Animateur, Sélectif |
| q5 | Votre look au quotidien... | Sportif, Classique, Original, Élégant, Sombre, Bohème |
| q6 | Ce qu'on remarque en premier... | Ambition, Bienveillance, Charme, Humour, Intensité, Créativité, Rigueur, Liberté |
| q7 | Le défaut qu'on vous reproche... | Impatience, Rigidité, Éparpillement, Hypersensibilité, Orgueil, Perfectionnisme, Indécision, Méfiance, Détachement |
| q8 | Vous donnez l'impression d'être motivé par... | Action, Sécurité, Connaissance, Justice, Pouvoir, Spiritualité |
| q9 | On vous dit souvent que vous paraissez... | Plus jeune, Plus mûr, Changeant, Difficile à cerner, Chaleureux, Magnétique |
| q10 | Votre rapport au temps... | Pressé, Ponctuel, Flexible, Cyclique, Hors du temps, Planificateur |
| q11 | Pour un RDV important... | Décontracté, Classique, Tendance, Élégant, Personnel, Strict |
| q12 | Votre visage au repos... | Souriant, Sérieux, Rêveur, Interrogatif, Intense, Neutre |

### 4.3 Événements de vie (jusqu'à 10)

Format : `type date1 [date2] [date3]`

Types reconnus : mariage, enfant, accident, carrière, déménagement, rupture, promotion, décès_proche, maladie, voyage_important...

Chaque événement peut contenir 1 à 3 dates (ex: `carriere 01/09/2011 15/09/2011`). Le type `enfant` est dédupliqué.

---

## 5. PHASE 1 — SCAN GROSSIER (24h)

### 5.1 Scan horaire

24 appels API `/western/planets` (un par heure entière, 00h→23h) avec les coordonnées de naissance et le fuseau horaire local.

### 5.2 Détection des fenêtres ASC

L'Ascendant change de signe environ toutes les 2 heures (variable selon la latitude et le signe). Le nœud `Analyser fenetres ASC` :

1. Extrait le signe de l'ASC pour chaque heure
2. Détecte les transitions (changements de signe)
3. Construit des **fenêtres temporelles** : plage horaire continue où l'ASC reste dans le même signe

Résultat : typiquement 6-12 fenêtres de 1-3 heures chacune.

---

## 6. PHASE 2 — SCORING QUESTIONNAIRE

### 6.1 Calcul mathématique de l'ASC

En parallèle du scan API, le Scorer calcule l'ASC par **formule astronomique** (Jour Julien + Temps Sidéral Local + conversion écliptique) :

```
JD = floor(365.25 × (y+4716)) + floor(30.6001 × (m+1)) + d + 2 - A + floor(A/4) - 1524.5
T = (JD - 2451545) / 36525
GST = 280.46061837 + 360.98564736629 × (JD - 2451545)
LST = GST + UT × 1.00273790935 × 15 + longitude
ASC = atan2(-cos(LST), sin(LST)×cos(ε) + tan(lat)×sin(ε))
```

Où `ε = 23.4393 - 0.013T` (obliquité de l'écliptique).

### 6.2 Matrice de scoring

12 matrices de correspondance `q1`→`q12`, chaque réponse distribuant des points sur 2-3 signes. Exemple pour q1 :

```
q1: {
  a: { Belier:4, Sagittaire:2, Lion:1 },      // Énergique/fonceur
  b: { Taureau:4, Cancer:2, Capricorne:2 },    // Calme/rassurant
  c: { Gemeaux:4, Verseau:2, Balance:1 },      // Vif/curieux
  ...
}
```

Score total par signe = somme des 12 questions. Le classement des signes par ce total seul sert au **Top 5 ASC (questionnaire)** dans le rapport — ce n’est **pas** la liste des ASC retenus par le score global (arcs + progressions + RS + Q par créneau). Un signe peut être fort au questionnaire mais ne pas correspondre au créneau horaire maximal au total.

### 6.3 Grille de scan fin et rôle du questionnaire par slot

Le nœud **Scorer** ne limite **pas** le scan fin aux « deux meilleures fenêtres » : il génère **un item par pas de 5 minutes sur les 24 h**, soit **288 slots** (`m = 0, 5, …, 1435` minutes).

Pour chaque slot :

1. Calcul de l’ASC (même formule astronomique qu’en §6.1) à l’heure décimale `m/60`.
2. `scoreQuestionnaire` du slot = **`Q[signe_ASC_à_cette_heure]`** — les points du questionnaire s’appliquent donc au **signe d’ASC de ce créneau**, pas au cumul « Sagittaire » sur un créneau « Balance ».

Les **fenêtres ASC** (continuité de signe entre transitions détectées sur un échantillon horaire 0h→23h) sont toujours construites dans le Scorer pour les métadonnées et le rapport : elles sont triées par score questionnaire (`fenScores`), et la **fenêtre la mieux notée au Q** est exposée dans `_top` (`refTopFen`). Cela **n’filtre pas** la liste des 288 appels planètes/maisons.

Résumé : le questionnaire **pèse sur chaque slot** via `Q[ASC du slot]` et fournit le **Top 5** + les infos de fenêtres ; le **vainqueur final** est `argmax` du total `Q + Arcs + Prog + RS` (§11).

---

## 7. PHASE 3 — SCAN FIN (5 min)

### 7.0 Volume

**288 slots** par exécution (planètes + maisons) ; **un** appel `/progressions` pour la plage des événements (référence : slot médian de la journée, comme en implémentation actuelle).

### 7.1 Appels API parallèles

Pour chaque slot de 5 minutes, trois appels API sont lancés en parallèle :

| API | Endpoint | Batch | Timeout |
|---|---|---|---|
| Planètes | `/western/planets` | ×6 | 30s |
| Maisons | `/western/houses` | ×6 | 30s |
| Progressions | `/progressions` | ×24 (appel unique) | 90s |

L'appel progressions est **unique** (1 seul appel pour la plage date début → date fin des événements). Le slot médian est utilisé comme heure de référence.

### 7.2 Données récupérées par slot

- **ASC exact** (degré, signe) — priorité : maisons API > planètes API > calcul mathématique
- **MC exact** (degré) — depuis l'API maisons
- **DSC et IC** calculés (ASC+180°, MC+180°)
- Positions de toutes les planètes au degré près

---

## 8. PHASE 4 — SCORING ARCS SOLAIRES

### 8.1 Principe

L'arc solaire est la technique de **direction** la plus simple : chaque planète et angle natal avance d'environ 1° par année de vie. Pour chaque événement daté :

```
âge = date_événement - date_naissance (en décimal)
ASC dirigé = ASC natal + âge
MC dirigé = MC natal + âge
```

### 8.2 Aspects détectés

| Aspect | Angle | Orbe | Poids base |
|---|---|---|---|
| Conjonction | 0° | 1.5° | 4 |
| Opposition | 180° | 1.5° | 3 |
| Carré | 90° | 1.5° | 2 |
| Trigone | 120° | 1.5° | 1 |
| Sextile | 60° | 1.5° | 1 |
| Quinconce | 150° | 1.0° | 0.5 |
| Semi-sextile | 30° | 1.0° | 0.5 |

### 8.3 Pondération planétaire (`PW`)

Les cibles natales sont pondérées selon leur importance :

| Catégorie | Planètes | Facteur |
|---|---|---|
| Angles | ASC, DSC, MC, IC | ×2.0 |
| Personnelles | Soleil, Lune, Mercure, Vénus, Mars | ×1.5 |
| Lentes | Jupiter → Pluton | ×1.0 |
| Autres | (défaut) | ×0.5 |

### 8.4 Calcul du score

Pour chaque aspect arc→natal détecté :

```
tightness = 1 - orbe_réel / orbe_max
score = poids_aspect × PW[cible] × tightness × (dédup ? 0.5 : 1.0)
```

Seuil minimum : score ≥ 0.3 pour être comptabilisé.

### 8.5 Déduplication

Si un même couple (arc_source, aspect, cible_natale) apparaît pour plusieurs événements, les occurrences suivantes sont pondérées à **×0.5** (marquées `*` dans le rapport).

---

## 9. PHASE 5 — SCORING PROGRESSIONS SECONDAIRES

### 9.1 Données API

Un seul appel `/progressions` couvre toute la plage temporelle des événements. L'API retourne les positions progressées jour par jour (en temps progressé, soit ~1 jour = 1 an de vie).

### 9.2 Pondération vitesse (`PS`)

Les planètes progressées sont pondérées par leur vitesse réelle de déplacement :

| Planète | Facteur |
|---|---|
| Lune | ×1.5 |
| Soleil, Mercure, Vénus | ×1.0 |
| Mars | ×0.7 |
| Jupiter, Saturne | ×0.3 |
| Uranus, Neptune, Pluton | ×0.15 |

### 9.3 Types d'aspects testés

Pour chaque événement, la progression la plus proche temporellement est sélectionnée, puis on teste :

1. **Planète progressée → ASC natal du slot** (orbe 1.0°)
2. **Planète progressée → MC natal du slot** (orbe 1.0°)
3. **ASC progressé → planète natale** (orbe 1.0°, facteur ×1.5)
4. **MC progressé → planète natale** (orbe 1.0°)

### 9.4 Calcul du score

```
tightness = 1 - orbe_réel / 1.0°
score = poids_aspect × PW[cible] × PS[source] × tightness × (dédup ? 0.25 : 1.0)
```

Seuil minimum : score ≥ 0.3. La déduplication pour les progressions est plus agressive (**×0.25**) car l'API renvoie les mêmes progressions pour le même individu quel que soit le slot.

---

## 10. PHASE 5bis — SCORING RÉVOLUTIONS SOLAIRES

### 10.1 Principe

Pour chaque année où un événement de vie est rapporté, le système calcule la **Révolution Solaire** (RS) — le thème du ciel au moment exact où le Soleil de transit repasse sur le degré natal du Soleil. L'ASC et le MC de cette RS sont calculés mathématiquement, puis testés en aspect contre les planètes et angles nataux du slot candidat.

C'est un discriminateur puissant : le moment exact de la RS est quasi identique pour tous les slots (le Soleil natal bouge à peine en 24h), mais les **angles nataux du slot** (ASC, MC, DSC, IC) diffèrent — donc les aspects RS→Natal diffèrent.

### 10.2 Calcul mathématique du moment de la RS

1. **Position du Soleil** — Formule basse précision (~0.01°) :
```
L₀ = 280.46646 + 36000.76983·T + 0.0003032·T²
M = 357.52911 + 35999.05029·T − 0.0001537·T²
C = 1.9146·sin(M) + 0.019993·sin(2M) + 0.00029·sin(3M)
☉ = L₀ + C
```

2. **Recherche du retour** — Bisection sur 3 jours (anniversaire ± 1.5j), 25 itérations → précision ~1 seconde.

3. **ASC/MC de la RS** — Même formule astronomique que pour l'ASC natal (JD → GMST → LST → conversion écliptique), appliquée au JD exact du retour solaire.

### 10.3 Aspects testés

Pour chaque année d'événement :
- **ASC RS → planètes/angles nataux du slot** (orbe 3.0°)
- **MC RS → planètes/angles nataux du slot** (orbe 3.0°)

### 10.4 Calcul du score

```
tightness = 1 - orbe_réel / 3.0°
score = poids_aspect × PW[cible] × tightness × (dédup ? 0.5 : 1.0)
```

Seuil minimum : score ≥ 0.3. Déduplication par clé `srASC/MC_aspect_cible` (×0.5 pour doublons inter-années).

### 10.5 Pouvoir discriminant

La RS offre un levier de discrimination **orthogonal** aux arcs et progressions :
- **Arcs** : dépendent de l'âge au moment de l'événement + angles nataux
- **Progressions** : dépendent des positions progressées + angles nataux
- **RS** : dépendent du ciel de transit au moment exact de l'anniversaire + angles nataux

Les trois techniques partagent la sensibilité aux angles nataux (qui changent avec le slot), mais exploitent des données temporelles différentes.

---

## 11. PHASE 6 — ASSEMBLAGE & SÉLECTION

### 11.1 Score total par slot

```
totalScore = scoreQuestionnaire + scoreArcs + scoreProgressions + scoreRS
```

Le slot avec le `totalScore` le plus élevé est déclaré vainqueur. En cas d'égalité, priorité au score `arcs + progressions + RS` (validation objective vs. questionnaire subjectif).

### 11.2 Sources de l'ASC

L'ASC exact du slot vainqueur est récupéré avec cette priorité :

1. **API `/western/houses`** (donnée la plus fiable)
2. **API `/western/planets`** (si houses indisponible)
3. **Calcul mathématique** (fallback)

La source est indiquée dans le rapport (`houses` / `planets` / `math`).

---

## 12. RAPPORT HTML

Le rapport envoyé par email contient :

### 12.1 En-tête
- Identité et date/lieu de naissance
- **Heure estimée** (grande taille, couleur accent)
- **Ascendant déduit** (signe)
- Méthode utilisée : `Arcs(X) + Prog(Y) + RS(Z) + Quest(W)` ou `Questionnaire (signe Npts)`

### 12.2 Top 5 ASC (questionnaire)
- Classement des 5 meilleurs **signes** par **somme des 12 questions uniquement** (pas par score total arcs/prog/RS).
- L’**heure estimée** et l’**ASC déduit** viennent du **meilleur créneau 5 min** au sens `totalScore` global ; l’ASC affiché peut donc être un signe absent de ce Top 5 si les techniques temporelles dominent (voir §6.3).

### 12.3 Section Validation (si événements fournis)
- Liste des événements utilisés
- Légende de pondération :
  - Orbe : exact = 100%, large = faible
  - Arcs : Angles ×2, Personnelles ×1.5, `*` = dédup ×0.5
  - Progressions : Lune ×1.5, Personnelles ×1, Lentes ×0.3, `*` = dédup ×0.25
  - RS : ASC/MC RS vs natal, orbe 3°, `*` = dédup ×0.5

#### Arcs solaires
- Liste détaillée : `événement: dirASC/dirMC aspect cible (score orbe°)`

#### Progressions API
- Liste détaillée : `événement: pPlanète aspect cible (score orbe°)`

#### Révolutions Solaires
- Liste détaillée : `année: srASC/srMC aspect cible (score)`

### 12.4 Tableau détaillé par fenêtre ASC
- Chaque fenêtre = un tableau avec :
  - Heure | Signe ASC | Degré ASC | Source | Score Arcs | Score Prog | **Score RS** | Score Total
  - Le slot vainqueur est surligné (★)

### 12.5 Pied de page
- Positions natales de référence (planètes au degré)

---

## 13. APIS EXTERNES

| API | URL | Usage | Auth |
|---|---|---|---|
| **Nominatim** | `nominatim.openstreetmap.org/search` | Géocodage ville → lat/lon | User-Agent `n8n-dhn-2026` |
| **TimezoneDB** | `api.timezonedb.com/v2.1/get-time-zone` | Fuseau horaire à la naissance | Clé API `UV443YWQRYUC` |
| **Astro Planets** | `46.225.174.155:8000/western/planets` | Positions planétaires | Aucune |
| **Astro Houses** | `46.225.174.155:8000/western/houses` | Cuspides des maisons | Aucune |
| **Astro Progressions** | `46.225.174.155:8000/progressions` | Progressions secondaires | Aucune |

---

## 14. OPTIMISATION PERFORMANCE

| Paramètre | Valeur | Justification |
|---|---|---|
| Scan grossier | 24 appels (1/heure) | Détection des transitions ASC côté pipeline amont ; le Scorer recalcule aussi des fenêtres pour le rapport |
| Scan fin — intervalle | **5 minutes** | Compromis précision / volume d’appels |
| Scan fin — couverture | **288 slots** (toute la journée) | Chaque créneau reçoit son `Q[ASC]` + scoring arcs/prog/RS dans `Resultat final` |
| Batch planètes/maisons | **×6** | Parallélisme N8N optimisé |
| Batch progressions | **×24** | Paramètre batch côté nœud HTTP (l’API est invoquée une fois pour la plage d’événements) |
| Progressions — appel unique | 1 appel, heure de référence = **slot médian** (~12:00) | Même jeu de données progressées pour tous les slots (naissance inchangée) |
| Retry planètes/maisons | 2 tentatives, 1s entre | Robustesse sans surcharge |
| Timeout progressions | 90s | L'API progressions est plus lente |

**Charge indicative** : 288 requêtes `/western/planets` + 288 `/western/houses` par exécution (hors scan grossier 24h).

---

## 15. ALGORITHME DE SCORING — RÉSUMÉ MATHÉMATIQUE

### Variables

- `Q[signe]` = score questionnaire pour un signe (somme des 12 matrices)
- `T = tightness = max(0, 1 - orbe / orbe_max)` — facteur continu [0, 1]
- `PW[p]` = poids planétaire cible (0.5 → 2.0)
- `PS[p]` = vitesse progressée source (0.15 → 1.5)
- `W[asp]` = poids de l'aspect (0.5 → 4)

### Score arc pour un slot donné

```
ArcScore(slot) = Σ_evt Σ_cible W[asp] × PW[cible] × T × dédup_factor
```

Où `dédup_factor` = 1.0 (premier hit) ou 0.5 (doublon).

### Score progression pour un slot donné

```
ProgScore(slot) = Σ_evt Σ_cible W[asp] × PW[cible] × PS[source] × T × dédup_factor
```

Où `dédup_factor` = 1.0 (premier hit) ou 0.25 (doublon).

### Score RS pour un slot donné

```
RSScore(slot) = Σ_année Σ_cible W[asp] × PW[cible] × T × dédup_factor
```

Où :
- L'aspect est calculé entre `ASC_RS(année)` ou `MC_RS(année)` et les planètes/angles nataux du slot
- Orbe max = 3.0°
- `dédup_factor` = 1.0 (premier hit) ou 0.5 (doublon inter-années)

### Score total

```
Total(slot) = Q[ASC_sign(slot)] + ArcScore(slot) + ProgScore(slot) + RSScore(slot)
```

### Sélection

```
best = argmax_slot Total(slot)
      en cas d'égalité : max(ArcScore + ProgScore + RSScore)
```

---

## 16. CONSTANTES DE CONFIGURATION

| Constante | Valeur | Description |
|---|---|---|
| `ASPECTS` | 7 entrées | Conjonction, Opposition, Carré, Trigone, Sextile, Quinconce, Semi-sextile |
| `PW` | 16 entrées | Poids planétaire cible (Angles ×2.0, Personnelles ×1.5, Lentes ×1.0) |
| `PS` | 10 entrées | Vitesse progressée source (Lune ×1.5 → Pluton ×0.15) |
| Orbe arcs | 1.5° (majeurs), 1.0° (mineurs) | Orbe par type d'aspect |
| Orbe progressions | 1.0° | Orbe uniforme pour tous les aspects progressés |
| Orbe RS | 3.0° | Orbe élargi pour ASC/MC RS vs natal (position interpolée, ±0.5° d'incertitude) |
| Seuil score min | 0.3 | En-dessous, l'aspect est ignoré |
| Slots scan fin | **288** | 1440 min ÷ 5 min ; grille journalière complète |
| Intervalle scan fin | 5 min | Résolution temporelle du scan |

---

## 17. FICHIERS DU WORKFLOW

| Fichier | Contenu | Nœuds |
|---|---|---|
| `N8N DHN Extract Variables` | Pipeline d'entrée complet (trigger → scan grossier → fenêtres) | Gmail Trigger, Get Full Message, Parse Email, Test Manuel, Extract Variables, Geocodage, Prepare Timezone, Get Timezone, Preparer scan 24h, Scan Planetes, Analyser fenetres ASC |
| `N8N DHN Questions générales` | Questionnaire ASC (12 QCM, données pinnées) | Reponses Questionnaire |
| `N8N DHN Questions dates` | Événements de vie (10 entrées, données pinnées, 1-3 dates/événement) | Evenements de vie |
| `N8N DHN Scan fin Planetes` | Scorer + scan fin + progressions + merge | Scorer, Scan fin planetes, Scan fin maisons, Scan progressions, Merge |
| `N8N DHN Repport` | Assemblage final + scoring arcs/prog/RS + HTML + envoi email | Resultat final, Envoyer resultat |
| `DATA SCAN` | Données brutes du scan 24h (cache, ~7 Mo) | — |

---

## 18. INNOVATIONS TECHNIQUES

### Portées vers le workflow PREV (v9.0)

Les innovations suivantes, développées et validées dans DHN, ont été intégrées au workflow PREV :

| Innovation | DHN | PREV |
|---|---|---|
| Pondération orbe continue (tightness) | `1 - orbe/maxOrb` dans arcs et progressions | `4 × (1 - peakOrb/maxOrbForAspect)` dans `computeTransitScore` |
| Vitesse progressée (`PS` / `PROG_SPEED`) | Lune ×1.5 → Pluton ×0.15 | Identique |
| Poids planétaire arcs (`PW` / `SA_PW`) | Angles ×2, Luminaires ×1.5 | Identique |
| Aspects mineurs (quinconce, semi-sextile) | Inclus avec orbe réduit (1.0°) | Non applicable (PREV utilise son propre système d'aspects) |
| Déduplication pondérée | ×0.5 arcs, ×0.25 progressions | ×0.5 arcs, ×0.25 progressions (identique) |
| Double/Triple Activation modulée par poids | N/A (DHN n'a pas de transits) | `1.5 + 0.5×min(w,1)` / `2.0 + min(w1+w2,1)` |
| Tags de précision (📌, ★) | N/A | Orbe < 0.15° → 📌, Orbe < 0.4° → ★ |

---

## 19. LIMITES ET PRÉCAUTIONS

1. **Précision géographique** : la qualité du géocodage Nominatim affecte directement le calcul de l'ASC. Les petites localités peuvent avoir des coordonnées imprécises.
2. **Latitude extrême** : au-delà de 60°N/S, certains signes ASC ne se lèvent pas (problème astronomique réel). Le calcul mathématique peut donner des résultats incohérents.
3. **Qualité du questionnaire** : les réponses sont subjectives. Un individu qui se perçoit différemment de la façon dont les autres le perçoivent faussera les résultats.
4. **Nombre d'événements** : plus il y a d'événements datés, plus la validation par arcs et progressions est fiable. Avec 0 événement, seul le questionnaire est utilisé.
5. **Heure d'été** : gérée automatiquement par TimezoneDB (`gmtOffset` inclut le DST).
6. **Résolution de 5 minutes** : la précision maximale est de ±2.5 minutes. Pour une rectification plus fine, un travail manuel reste nécessaire.
7. **Précision RS** : la longitude solaire est calculée par formule basse précision (~0.01°). L'ASC RS a une incertitude de ±0.5° environ, d'où l'orbe élargi à 3.0°.

---

## 20. CHANGELOG

### v4.1 — Documentation alignée sur le Scorer (grille 288)

| Élément | Détail |
|---|---|
| **Scan fin** | La doc décrivait une sélection des **2 fenêtres** et ~**40 slots** ; l’implémentation du nœud **Scorer** (`N8N DHN Scan fin Planetes`) génère **288 slots** (pas de 5 min sur 24 h). |
| **Questionnaire** | Précision : `Total(slot) = Q[ASC du slot] + …` ; distinction explicite avec le **Top 5** (classement Q seul). |
| **Plage horaire** | Documenté : `plage_naissance` / `heure_naissance_min`–`max` filtrent les **métadonnées** de fenêtres (`fenUse`), pas la grille d’appels API. |
| **Sections** | §6.3, §7, §12.1 (titre corrigé), §12.2, §14, §16, vue d’ensemble §1. |

### v4.0 — Révolutions Solaires (scoring)

**Ajout** : 4e couche de validation — scoring par Révolutions Solaires.

| Composant | Détail |
|---|---|
| **Fonctions ajoutées** | `sunLong(jd)` — longitude écliptique du Soleil par formule astronomique |
| | `jdFull(y,m,d,h)` — Jour Julien avec heures décimales |
| | `findSRjd(nSDeg,eY,bm,bd)` — recherche par bisection du JD exact du retour solaire |
| | `calcASCjd(jd)` — ASC pour un JD arbitraire (formule astronomique) |
| | `calcMCjd(jd)` — MC pour un JD arbitraire |
| **Scoring** | Pour chaque année d'événement, ASC RS et MC RS testés vs planètes/angles nataux du slot |
| **Orbe** | 3.0° (élargi vs 1.5° arcs / 1.0° prog, car position interpolée) |
| **Déduplication** | ×0.5 si même couple aspect+cible dans plusieurs années |
| **Score total** | `Q + Arcs + Prog + RS` (4 couches au lieu de 3) |
| **Rapport HTML** | Nouvelle section "Révolutions Solaires", nouvelle colonne RS dans le tableau, pondération mise à jour |
| **Fichier modifié** | `N8N DHN Repport` (nœud `Resultat final`) — +3125 caractères |
| **Aucun appel API** | Tout le calcul est fait en JavaScript pur (formules astronomiques) |

**Pourquoi la RS est un bon discriminateur pour DHN** :
- Le moment de la RS est quasi identique pour tous les slots (le Soleil natal bouge de ~1° en 24h)
- Mais l'ASC RS tombe dans des **maisons natales différentes** selon le slot candidat
- Les aspects ASC RS → angles nataux sont sensibles au slot car ASC/MC/DSC/IC changent avec l'heure de naissance
- C'est un axe de validation **orthogonal** aux arcs (qui dépendent de l'âge) et aux progressions (qui dépendent des positions progressées)
