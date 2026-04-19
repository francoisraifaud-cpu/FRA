# DOCUMENTATION WORKFLOW — DÉDUCTION DE L'HEURE DE NAISSANCE (DHN)

**Version** : v5.11 (R2 plafond matrice M Capricorne 5→4, R1 ajout questions physiques q13/q14/q15 morphologie+démarche+élocution ; v5.10 cap arcs + dégradation conf désaccord Q + tri alts par rang Q ; v5.5 Phase 3 — UX & robustesse : presets fourchette horaire front, 3 événements minimum obligatoires, Error Trigger → callback `failed`, mail DHN traduit FR/EN ; v5.4 : TZ historique luxon ; v5.3 : confiance, anti-circulaire, typage événements, plage horaire effective)
**Plateforme** : n8n Cloud
**Auteur** : François Raifaud

---

## 1. VUE D'ENSEMBLE

Le workflow **DHN** déduit l'heure de naissance d'un individu (précision cible ±10-15 minutes) à partir de sa date et son lieu de naissance, **sans connaître l'heure**. Il combine plusieurs niveaux de validation :

1. **Niveau 1 — Questionnaire ASC** : 7 questions actives sur la perception extérieure (q1, q3, q6, q7, q8, q10, q12) + 3 questions physiques v5.11.R1 (q13 morphologie, q14 démarche, q15 élocution) → score par signe ascendant via matrice `M[q1..q15]` (max 15 questions exposées)
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
| **Get Timezone** | `N8N DHN PrepareLL` | API TimezoneDB → `zoneName` IANA (`Africa/Tunis`, etc.) + `gmtOffset` brut (utilisé en fallback uniquement depuis v5.4) |
| **TZ Historique** *(v5.4)* | `N8N DHN PrepareLL` | Code Node — recalcule `gmtOffset` via **luxon** (TZDB IANA officielle) à 12:00 locale du jour de naissance. TimezoneDB en fallback si zone manquante ou luxon indisponible. Trace `tzWarn` si écart ≥ 1 min |
| **Preparer scan 24h** | `N8N DHN Extract Variables` | Génération de 24 corps de requêtes API (1 par heure, 00h→23h) |
| **Scan Planetes** | `N8N DHN Extract Variables` | API `/western/planets` ×24 → positions planétaires horaires |
| **Analyser fenetres ASC** | `N8N DHN Extract Variables` | Détection des transitions de signe ASC → fenêtres temporelles |
| **Reponses Questionnaire** | `N8N DHN Questions générales` | Jusqu'à 15 réponses pinnées sur la perception extérieure et physique (QCM). Boucle de propagation `i<=15` depuis v5.11.R1. |
| **Evenements de vie** | `N8N DHN Questions dates` | Jusqu'à 10 événements datés (1 à 3 dates par événement) |
| **Scorer** | `N8N DHN Scan fin Planetes` | **NŒUD CENTRAL** — Matrice questionnaire, recalcul des fenêtres ASC (échantillon horaire), **grille 5 min sur toute la journée** (288 slots), score Q par slot. Depuis v5.0 ne construit plus l'URL progressions (déléguée à `Build Prog URL`). |
| **Build Prog URL** *(v5.0)* | `N8N DHN Scan fin Planetes` | Nœud Code dédié — construit l'URL unique `/progressions` à partir de `Evenements de vie` + `Extract Variables` + timezone. Sort **1 seul item** (ou 0 si aucun événement). |
| **Scan fin planetes** | `N8N DHN Scan fin Planetes` | API `/western/planets` par slot de 5 min (batch ×6) |
| **Scan fin maisons** | `N8N DHN Scan fin Planetes` | API `/western/houses` par slot de 5 min (batch ×6) |
| **Scan progressions** | `N8N DHN Scan fin Planetes` | API `/progressions` — **1 seul appel HTTP** depuis v5.0 (vs 288 dont 287 silencieusement en erreur dans v4.x) |
| **Merge** | `N8N DHN Scan fin Planetes` | Fusion planètes + maisons + progressions |
| **Resultat final** | `N8N DHN Repport` | **Assemblage final** — scoring arcs + progressions + génération HTML |
| **Envoyer resultat** | `N8N DHN Repport` | Envoi du rapport par Gmail |

**Site (Stripe → webhook)** : le sous-workflow `WEBHOOK DHN` nomme le nœud Code **`Extract Variables`** (sans « DHN »). Les nœuds Code **Prepare Timezone**, **Preparer scan 24h**, **Scorer** / **Scorer1** et le rapport HTML lisent le profil via `Extract Variables DHN` **ou** `Extract Variables` (fichiers mis à jour dans le dépôt). **Scorer** fusionne en outre les champs `q1`…`q15` et `evt1`…`evt10` de cet objet avec les sorties optionnelles **Reponses Questionnaire** / **Evenements de vie** (e-mail ou données pinnées). Depuis v5.11.R1, les boucles d'extraction (WEBHOOK DHN, Reponses Questionnaire, Scorer1) bornent toutes à `q<=15` ; les champs q13/q14/q15 sont silencieusement ignorés s'ils ne sont pas envoyés (front 7 questions actives par défaut, pas de régression).

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
[Prepare Timezone] ──► [Get Timezone] ──► TimezoneDB API (zoneName)
       │
       ▼
[TZ Historique] ──► luxon (TZDB IANA officielle) — autorité sur gmtOffset
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
[Scorer] ──► Scoring questionnaire + génération 288 slots 5 min
       │
       ├──► [Scan fin planetes] ──► API /western/planets (batch ×6, 288 appels)
       └──► [Scan fin maisons]  ──► API /western/houses  (batch ×6, 288 appels)

[Evenements de vie] ──► [Build Prog URL] ──► [Scan progressions] ──► API /progressions (1 appel)
                                                       │
                              ┌────────────────────────┘
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
- `plage_naissance` (optionnel) : plage texte du type `8:00 - 14:00` ; sinon `heure_naissance_min` / `heure_naissance_max` si disponibles (formats reconnus : `08H00`, `8:00`, `08:00`). Le contrat site (`SITE/lib/dhn-order.ts`) impose que **les deux soient fournis ensemble**, ou aucun (auquel cas le site applique le défaut `00H00`/`24H00`). Depuis **v5.3 (P-window)**, la plage **restreint effectivement la grille de scan fin** : les slots hors fenêtre ne sont **plus générés** (au lieu d'être générés puis ignorés à l'affichage). Cf. §6.3 et §14.

### 4.2 Questionnaire ASC (matrice M `q1`…`q15`, 7+3 questions actives front)

La matrice M côté n8n (`Scorer1`) définit `q1`…`q15` complètes. Le frontend (`SITE/lib/dhn-questions-data.ts`) en expose un sous-ensemble actif aux utilisateurs : depuis v5.11.R1, **10 questions actives** (7 comportementales + 3 physiques). Les 5 questions retirées au front (`q2`, `q4`, `q5`, `q9`, `q11`) restent dans la matrice M côté n8n pour rétrocompatibilité, mais ne sont jamais soumises ; n8n ignore silencieusement les questions absentes du payload.

Les questions **comportementales/sociales** (q1 à q12) portent sur la **perception extérieure** (comment les autres voient l'individu). Les questions **physiques** v5.11.R1 (q13, q14, q15) portent sur l'**apparence et l'énergie corporelle/verbale**, traditionnellement très liées à l'Ascendant en astrologie.

| Q | Front actif | Thème | Options |
|---|---|---|---|
| q1 | ✅ | En société, on vous perçoit comme... | Énergique, Calme, Vif, Réservé, Charismatique, Doux |
| q2 | ❌ (retirée v5.7) | Physiquement on vous décrit plutôt... | Sportif, Solide, Mince, Doux, Imposant, Anguleux |
| q3 | ✅ | Face à l'inconnu, votre réaction visible... | Foncer, Observer, Questionner, Se protéger, Prendre le lead, Analyser, Sonder, Se laisser porter |
| q4 | ❌ (retirée v5.7) | En groupe, on vous voit comme... | Leader, Diplomate, Indépendant, Confident, Animateur, Sélectif |
| q5 | ❌ (retirée v5.7) | Votre look au quotidien... | Sportif, Classique, Original, Élégant, Sombre, Bohème |
| q6 | ✅ | Ce qu'on remarque en premier... | Ambition, Bienveillance, Charme, Humour, Intensité, Créativité, Rigueur, Liberté |
| q7 | ✅ | Le défaut qu'on vous reproche... | Impatience, Rigidité, Éparpillement, Hypersensibilité, Orgueil, Perfectionnisme, Indécision, Méfiance, Détachement |
| q8 | ✅ | Vous donnez l'impression d'être motivé par... | Action, Sécurité, Connaissance, Justice, Pouvoir, Spiritualité |
| q9 | ❌ (retirée v5.7) | On vous dit souvent que vous paraissez... | Plus jeune, Plus mûr, Changeant, Difficile à cerner, Chaleureux, Magnétique |
| q10 | ✅ | Votre rapport au temps... | Pressé, Ponctuel, Flexible, Cyclique, Hors du temps, Planificateur |
| q11 | ❌ (retirée v5.7) | Pour un RDV important... | Décontracté, Classique, Tendance, Élégant, Personnel, Strict |
| q12 | ✅ | Votre visage au repos... | Souriant, Sérieux, Rêveur, Interrogatif, Intense, Neutre |
| **q13** *(v5.11.R1)* | ✅ | Votre morphologie naturelle (vers 25-30 ans)... | Athlétique, Trapue, Longiligne, Ronde, Imposante, Nette, Harmonieuse, Dense, Fluide |
| **q14** *(v5.11.R1)* | ✅ | Votre démarche (sans y faire attention)... | Vive et conquérante, Posée et lente, Aérienne saccadée, Oscillante, Majestueuse, Élégante dansante, Feutrée, Glissée |
| **q15** *(v5.11.R1)* | ✅ | Votre rythme d'élocution naturel... | Rapide incisif, Lent posé, Volubile bavard, Doux hésitant, Sonore théâtral, Précis analytique, Mélodique nuancé, Bas grave, Détaché cassé |

**Invariant matrice M (v5.11.R2)** : aucun signe ne dépasse 4 pts par option ; aucun signe n'a plus de 3 options à 4 pts sur l'ensemble du questionnaire actif ; cumul théorique max ≤ 16 pts par signe. Lion désaturé à 3 sur les options "imposante / majestueuse / sonore" (q13.e, q14.e, q15.e) pour éviter de re-créer un biais Lion équivalent à l'ancien biais Capricorne (cf. cas Hugo).

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

15 matrices de correspondance `q1`→`q15`, chaque réponse distribuant des points sur 2-3 signes (max 4 pts par signe par option, cf. invariant v5.11.R2). Exemple pour q1 :

```
q1: {
  a: { Belier:4, Sagittaire:2, Lion:1 },      // Énergique/fonceur
  b: { Taureau:4, Cancer:2, Capricorne:2 },    // Calme/rassurant
  c: { Gemeaux:4, Verseau:2, Balance:1 },      // Vif/curieux
  ...
}
```

Score total par signe = somme des questions effectivement répondues (le code n8n est tolérant aux questions absentes via `if(a&&M['q'+q]&&M['q'+q][a])`). En pratique, le front actif soumet 10 questions (7+3 v5.11.R1), mais l'algo accepte n'importe quel sous-ensemble de q1…q15.

Le classement des signes par ce total sert au **Top 5 ASC (questionnaire)** dans le rapport — ce n'est **pas** la liste des ASC retenus par le score global (arcs + progressions + RS + Q par créneau). Un signe peut être fort au questionnaire mais ne pas correspondre au créneau horaire maximal au total.

### 6.3 Grille de scan fin et rôle du questionnaire par slot

Le nœud **Scorer** ne limite **pas** le scan fin aux « deux meilleures fenêtres » : il génère **un item par pas de 5 minutes** sur la plage active (`m = 0, 5, …, 1435` minutes). Si aucune plage n'est fournie (ou plage = `00H00`–`24H00`), il génère **288 slots** (24 h complètes).

Depuis **v5.3 (P-window)**, si une plage `[lo, hiInc]` est issue de `heure_naissance_min`/`max` (ou parsée depuis `plage_naissance`), la boucle de génération **skippe les slots hors fenêtre** : seuls les `(hiInc - lo)/5 + 1` slots intra-fenêtre sont scorés et envoyés aux APIs `/western/planets` + `/western/houses`. Économie HTTP proportionnelle (ex. plage `20H00`–`24H00` → 49 slots au lieu de 288, soit ~83 % de réduction).

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

### 8.6 Bonus d'affinité sémantique (v5.2 — P8)

Voir §15 (matrice complète `EVT_AFFINITY`). Lorsqu'une cible natale (planète ou angle) figure dans la liste d'affinité du **type d'événement** (ex. `accident → Mars/Uranus/Pluton/Saturne`, `voyage_important → Jupiter/Mercure/Neptune`), le score de l'aspect est multiplié par `AFFINITY_BONUS = 1.5` et marqué `⊕` dans le rapport. Pas de pénalité pour les cibles non listées (×1) : on renforce le signal cohérent sans éliminer les coïncidences.

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

### 9.5 Pénalité auto-référente angle↔angle (v5.1 — P-circular-asp)

Les aspects `pASC`/`pMC` ↔ `nASC`/`nMC`/`nDSC`/`nIC` sont **mathématiquement auto-référents** : `pASC = ASC_midi + nbJoursProgressés` (constante par rapport au slot, car l'URL `/progressions` est appelée une seule fois pour `hours=12&minutes=0` ou le milieu de la fenêtre — voir §7.0), et `nASC` dépend du slot. Donc l'aspect `pASC conj nASC` à 0° ne valide pas l'événement, il valide seulement le slot où `nASC ≈ ASC_midi + δ_jours` — équation auto-réalisatrice qui tend mécaniquement vers le slot de l'heure de référence.

**Correction** : multiplicateur `CIRC_PEN = 0.2` appliqué à ces aspects (marqués `↻` dans le rapport). Les autres aspects (`pPlanète` ↔ `nAngle`, `pAngle` ↔ `nPlanète`, `pPlanète` ↔ `nPlanète`) ne sont pas pénalisés car ils discriminent réellement entre slots.

### 9.6 Bonus d'affinité sémantique (v5.2 — P8)

Pour `pPlanète` ↔ `nAngle` : bonus appliqué sur la **planète progressée** (la "source" qui porte la sémantique de l'événement). Pour `pAngle` ↔ `nPlanète` : bonus appliqué sur la **cible natale**. Empilable avec `CIRC_PEN` (un voyage avec `pASC conj nDSC` reste pénalisé ↻ même si l'événement matche l'angle).

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

### 10.4bis Pénalité auto-référente angle↔angle (v5.1 — P-circular-asp)

Même logique qu'en §9.5 appliquée aux RS : `srASC`/`srMC` dépendent quasi exclusivement du moment du retour solaire (calculable sans connaître le slot natal), donc `srASC conj nASC` est une équation auto-réalisatrice du slot. Multiplicateur `SR_CIRC_PEN = 0.2` sur ces aspects (marqués `↻`).

**Effet de bord observé sur le test Tunis 1989** : avant P-circular-asp, les RS contribuaient ~56 pts au slot vainqueur dont ~40 pts d'aspects auto-référents ; après, ~22-30 pts dont la quasi-totalité de discrimination vient maintenant de `srASC/MC` ↔ `nPlanète` (Mars/Soleil/Lune/etc.). Les RS gardent un pouvoir discriminant inter-slots mais réduit (planètes natales lentes → peu de variation entre slots) ; c'est honnête et attendu.

### 10.5 Bonus d'affinité sémantique (v5.2 — P8)

Pour les RS, le bonus est appliqué si **au moins un type d'événement de l'année** a une affinité avec la cible (collecte `yearTypes` puis `yearAffin(name)`). Ex. en 2008 = `accident + deces_proche`, la cible `Pluton` est bonifiée car les deux types l'incluent.

### 10.6 Pouvoir discriminant

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

#### Garde-fou anti-désalignement (v5.0 — P3)

Avant la v5.0, l'ancien code comparait le signe de l'ASC API au signe `mathSign` calculé en interne via la même formule astronomique que `_windowSign` ; le booléen `trustApi` était donc structurellement faux dès qu'il y avait la moindre divergence, et l'ASC API était systématiquement écrasé par la valeur math (suffixe `+t` dans la colonne « Src » du rapport).

Depuis v5.0, on conserve l'ASC API par défaut et on ne bascule sur le calcul mathématique que si l'**écart angulaire dépasse 5°** :

```
absDiff = |ascDeg_API - ascDeg_math|
dist    = min(absDiff, 360 - absDiff)
si dist > 5° → on jette l'API et on prend math (marqué +t)
sinon         → on garde l'API
```

Un écart > 5° indique typiquement un **désalignement d'items** entre `Scan fin planetes`, `Scan fin maisons` et `Merge` (un slot a reçu les planètes d'un autre slot). C'est désormais un signal d'alerte plutôt qu'un comportement par défaut.

### 11.3 Score de confiance (v5.1 — P2)

Trois indicateurs sont calculés à partir de la distribution `Total(slot)` sur la grille effectivement scorée et exposés en tête du rapport :

| Indicateur | Calcul | Échelle |
|---|---|---|
| **Confiance signe** | écart en points (et %) entre le meilleur signe et le 2e signe (chacun représenté par son slot max) | Très faible / Faible / Moyenne / Forte |
| **Confiance heure** | écart entre le slot vainqueur et le 2e meilleur slot **du même signe** | idem |
| **Confiance globale** | min(signe, heure) | idem |

Seuils (en pourcentage relatif au top) :

```
≥ 20 %   → Forte
10-20 %  → Moyenne
3-10 %   → Faible
< 3 %    → Très faible
```

Si la confiance globale est **Faible** ou **Très faible**, un avertissement explicite est ajouté au rapport (cf. §12.1bis et phase D ci-après) : « les techniques ne convergent pas clairement ; considérer le Top 3 des pics par signe comme alternatives plausibles ».

---

## 12. RAPPORT HTML

Le rapport envoyé par email contient :

### 12.1 En-tête
- Identité et date/lieu de naissance
- **Heure estimée** (grande taille, couleur accent)
- **Ascendant déduit** (signe)
- Méthode utilisée : `Arcs(X) + Prog(Y) + RS(Z) + Quest(W)` ou `Questionnaire (signe Npts)`
- **(v5.3 — P-window)** Si une plage est fournie : encadré « Plage indiquée : `XXhYY — XXhYY` (heure locale). Scan restreint à cette fenêtre (grille 5 min) ». Pour explorer 24 h : indiquer `00H00–24H00`.

### 12.1bis Bandeau confiance (v5.1 — P2)
Affiché juste sous l'en-tête :
- Score de confiance global : `Très faible / Faible / Moyenne / Forte`
- Détail signe : niveau + écart au 2e signe (pt + %)
- Détail heure : niveau + écart au 2e meilleur créneau du même signe (pt + %)
- Bandeau d'alerte conditionnel si confiance ≤ Faible (cf. §11.3)

### 12.2 Top 5 ASC (questionnaire)
- Classement des 5 meilleurs **signes** par **somme des 12 questions uniquement** (pas par score total arcs/prog/RS).
- L’**heure estimée** et l’**ASC déduit** viennent du **meilleur créneau 5 min** au sens `totalScore` global ; l’ASC affiché peut donc être un signe absent de ce Top 5 si les techniques temporelles dominent (voir §6.3).

### 12.3 Section Validation (si événements fournis)
- Liste des événements utilisés
- Légende de pondération :
  - Orbe : exact = 100%, large = faible
  - Arcs : Angles ×2, Personnelles ×1.5, `*` = dédup ×0.5
  - Progressions : Lune ×1.5, Personnelles ×1, Lentes ×0.3, `*` = dédup ×0.25, `↻` = auto-référent angle↔angle ×0.2 *(v5.1)*
  - RS : ASC/MC RS vs natal, orbe 3°, `*` = dédup ×0.5, `↻` = auto-référent ×0.2 *(v5.1)*
  - `⊕` = affinité sémantique événement↔planète ×1.5 *(v5.2 — ex. voyage↔Jupiter, accident↔Mars, deces↔Saturne/Pluton)*

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
| **TimezoneDB** | `api.timezonedb.com/v2.1/get-time-zone` | **Lookup lat/lon → IANA `zoneName`** (le `gmtOffset` n'est utilisé qu'en fallback depuis v5.4 — P7) | Clé API → variable n8n `$vars.TIMEZONEDB_KEY` *(v5.0 — P6b)* |
| **luxon** *(embarqué n8n)* | — | Calcul de l'offset DST historique via TZDB IANA officielle *(v5.4 — P7)* | Aucune (lib intégrée à n8n Cloud) |
| **Astro Planets** *(privée)* | `46.225.174.155:8000/western/planets` | Positions planétaires (Swiss Eph) | Aucune |
| **Astro Houses** *(privée)* | `46.225.174.155:8000/western/houses` | Cuspides des maisons (Swiss Eph) | Aucune |
| **Astro Progressions** *(privée)* | `46.225.174.155:8000/progressions` | Progressions secondaires (Swiss Eph) | Aucune |
| **Site (callback)** | `https://<site>/api/dhn/callback` | Notification de fin (succès / échec) au site Vercel | Header `X-Site-Webhook-Secret` → variable n8n `$vars.N8N_WEBHOOK_SECRET` *(v5.0 — P6a)* |

### 13.1 Variables n8n requises (v5.0)

À configurer dans **n8n Cloud → Settings → Variables** avant import des fragments v5.0.

> ⚠️ **n8n Cloud bloque `$env` par défaut** (`N8N_BLOCK_ENV_ACCESS_IN_NODE` est forcé à `true` côté Cloud et n'est pas modifiable par le client). On utilise donc **`$vars.NOM_VARIABLE`** (Settings → Variables) plutôt que `$env`.

| Variable n8n | Valeur | Référencée par | Expression à mettre dans le nœud |
|---|---|---|---|
| `TIMEZONEDB_KEY` | clé TimezoneDB (ex: `UV443YWQRYUC`) | Nœud HTTP `Get Timezone` (query param `key`) | `={{ $vars.TIMEZONEDB_KEY }}` |
| `N8N_WEBHOOK_SECRET` | secret partagé avec Vercel `site-rapports-astro` | Nœud HTTP `POST SUCCES DHN` (header `X-Site-Webhook-Secret`) | `={{ $vars.N8N_WEBHOOK_SECRET }}` |

**Procédure** : n8n Cloud → menu utilisateur (en bas à gauche) → **Variables** → **Add variable** → renseigner Key + Value pour chacune.

⚠️ Recommandation v5.0 : profiter de la migration vers `$vars` pour **régénérer** ces deux secrets, qui ont été commités en clair dans le dépôt avant la v5.0.

---

## 14. OPTIMISATION PERFORMANCE

| Paramètre | Valeur | Justification |
|---|---|---|
| Scan grossier | 24 appels (1/heure) | Détection des transitions ASC côté pipeline amont ; le Scorer recalcule aussi des fenêtres pour le rapport |
| Scan fin — intervalle | **5 minutes** | Compromis précision / volume d’appels |
| Scan fin — couverture | **288 slots** (24 h) ou **N slots intra-fenêtre** (v5.3 — P-window) | Chaque créneau reçoit son `Q[ASC]` + scoring arcs/prog/RS dans `Resultat final`. Si `heure_naissance_min/max` ≠ 00H–24H, seuls les slots intra-fenêtre sont générés et appelés en API (économie HTTP proportionnelle, ex. 49 slots pour 4 h). |
| Batch planètes/maisons | **×6** | Parallélisme N8N optimisé |
| Batch progressions | **×24** | Paramètre batch côté nœud HTTP (l’API est invoquée une fois pour la plage d’événements) |
| Progressions — appel unique | 1 appel, heure de référence = **milieu de la fenêtre** (v5.3) ou `12:00` par défaut | Même jeu de données progressées pour tous les slots (naissance inchangée) ; aligner la référence sur la fenêtre minimise l'écart `pASC` ↔ `nASC` (utile pour P-circular-asp) |
| Retry planètes/maisons | 2 tentatives, 1s entre | Robustesse sans surcharge |
| Timeout progressions | 90s | L'API progressions est plus lente |

**Charge indicative** : 288 requêtes `/western/planets` + 288 `/western/houses` par exécution (hors scan grossier 24h).

---

## 15. ALGORITHME DE SCORING — RÉSUMÉ MATHÉMATIQUE

### Variables

- `Q[signe]` = score questionnaire pour un signe (somme des matrices q1…q15 effectivement répondues, 10 actives front depuis v5.11.R1)
- `T = tightness = max(0, 1 - orbe / orbe_max)` — facteur continu [0, 1]
- `PW[p]` = poids planétaire cible (0.5 → 2.0)
- `PS[p]` = vitesse progressée source (0.15 → 1.5)
- `W[asp]` = poids de l'aspect (0.5 → 4)
- `A(evt, cible) = AFFINITY_BONUS = 1.5` si `cible ∈ EVT_AFFINITY[evt.type]`, sinon `1` *(v5.2)*
- `C = CIRC_PEN = 0.2` si aspect angle progressé/RS ↔ angle natal, sinon `1` *(v5.1)*

### Matrice `EVT_AFFINITY` (v5.2 — extrait)

```
mariage          → p:[Vénus,Lune,Jupiter,Soleil]      a:[DSC]
enfant           → p:[Lune,Vénus,Jupiter,Cérès]       a:[IC,DSC]
accident         → p:[Mars,Uranus,Pluton,Saturne]     a:[ASC]
carriere         → p:[Soleil,Saturne,Jupiter,Mars]    a:[MC]
demenagement     → p:[Lune,Uranus,Mercure]            a:[IC]
voyage_important → p:[Jupiter,Mercure,Neptune,Uranus] a:[DSC,MC]
deces_proche     → p:[Saturne,Pluton,Lune,Soleil]     a:[IC]
maladie          → p:[Mars,Saturne,Neptune,Pluton]    a:[ASC,IC]
rupture          → p:[Vénus,Mars,Pluton,Saturne]      a:[DSC]
promotion        → p:[Soleil,Jupiter,Saturne]         a:[MC]
```

`p` = planètes ; `a` = angles. La constante complète vit dans le code de `Resultat final1` (`N8N DHN`).

### Score arc pour un slot donné *(v5.2)*

```
ArcScore(slot) = Σ_evt Σ_cible W[asp] × PW[cible] × T × dédup_factor × A(evt, cible)
```

Où `dédup_factor` = 1.0 (premier hit) ou 0.5 (doublon).

### Score progression pour un slot donné *(v5.1 + v5.2)*

```
ProgScore(slot) = Σ_evt Σ_cible W[asp] × PW[cible] × PS[source] × T × dédup_factor × C × A(evt, source_or_cible)
```

Où `dédup_factor` = 1.0 (premier hit) ou 0.25 (doublon), `C` = 1 (cas général) ou 0.2 (auto-référent angle↔angle).

### Score RS pour un slot donné *(v5.1 + v5.2)*

```
RSScore(slot) = Σ_année Σ_cible W[asp] × PW[cible] × T × dédup_factor × C × A(année_types, cible)
```

Où :
- L'aspect est calculé entre `ASC_RS(année)` ou `MC_RS(année)` et les planètes/angles nataux du slot
- Orbe max = 3.0°
- `dédup_factor` = 1.0 (premier hit) ou 0.5 (doublon inter-années)
- `C` = 1 ou `SR_CIRC_PEN = 0.2` si la cible natale est un angle (auto-référence)
- `A` = 1 ou 1.5 si **au moins un type d'événement de l'année** matche la cible

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
| Slots scan fin | **288** par défaut, **N intra-fenêtre** si plage fournie *(v5.3)* | 1440 min ÷ 5 min ; grille journalière complète ou restreinte à `[lo, hiInc]` |
| Intervalle scan fin | 5 min | Résolution temporelle du scan |
| `CIRC_PEN` *(v5.1)* | 0.2 | Pénalité aspect angle progressé ↔ angle natal (auto-référent) |
| `SR_CIRC_PEN` *(v5.1)* | 0.2 | Idem pour Révolutions Solaires (`srASC/MC` ↔ `nASC/MC/DSC/IC`) |
| `AFFINITY_BONUS` *(v5.2)* | 1.5 | Bonus si cible ∈ matrice `EVT_AFFINITY[evt.type]` |
| Seuils confiance *(v5.1)* | ≥20%/10–20%/3–10%/<3% | Forte / Moyenne / Faible / Très faible (% du top score) |

---

## 17. FICHIERS DU WORKFLOW

| Fichier | Contenu | Nœuds |
|---|---|---|
| `N8N DHN Extract Variables` | Pipeline d'entrée complet (trigger → scan grossier → fenêtres) | Gmail Trigger, Get Full Message, Parse Email, Test Manuel, Extract Variables, Geocodage, Prepare Timezone, Get Timezone, Preparer scan 24h, Scan Planetes, Analyser fenetres ASC |
| `N8N DHN Questions générales` | Questionnaire ASC (jusqu'à 15 QCM, données pinnées). Boucle de propagation `i<=15` depuis v5.11.R1. | Reponses Questionnaire |
| `N8N DHN Questions dates` | Événements de vie (10 entrées, données pinnées, 1-3 dates/événement) | Evenements de vie |
| `N8N DHN Scan fin Planetes` | Scorer + scan fin + progressions + merge | Scorer, **Build Prog URL** *(v5.0)*, Scan fin planetes, Scan fin maisons, Scan progressions, Merge |
| `N8N DHN` | Code du nœud `Resultat final1` — moteur scoring arcs/prog/RS, score de confiance, HTML | Resultat final1 |
| `N8N DHN SEND` | Envoi du rapport HTML par Gmail | Envoyer resultat |
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

### v5.11 — Re-équilibrage matrice M (avril 2026)

#### R2 — Plafond Capricorne 5 → 4 (cf. §4.2 invariant)

**Symptôme** : Catherine Deneuve (ASC Capricorne validé) ressortait correctement, mais le score brut Capricorne plafonnait à 25 pts là où les autres signes plafonnaient à 20 pts (5 occurrences `Capricorne:5` dans la matrice : q3.b, q3.c, q3.d, q5.b, q6.h). Risque : faux positifs Capricorne sur des profils sérieux/réservés sans ASC Capricorne réel.

**Correction** (`FRA/DHN/N8N DHN Scan fin Planetes`, nœud `Scorer1`) : 5 occurrences `Capricorne:5` → `Capricorne:4`. Aucun changement de la formule ni du loop. Plafond théorique Capricorne ramené à 20 pts, en cohérence avec les autres signes.

**Validation bench (4/8 cas critiques)** :
- Deneuve : Capricorne reste #1 brut (16 pts post-R2), ASC Capricorne déduit OK ✅
- Beauvoir : Sagittaire #1 inchangé (15 pts), Capricorne #2 (12 pts post-R2 vs 17 pré) — ASC Sagittaire validé ✅
- De Gaulle : Vierge ASC déduit OK ; Capricorne plus contenu en Top Q ✅
- Bardot : Sagittaire #1 inchangé, R2 sans effet (pas de Capricorne dans son Top) ✅

#### R1 — Ajout questions physiques q13/q14/q15 (cf. §4.2)

**Motivation** : sur le bench v5.10, plusieurs cas avec ASC physiquement marqué (Bélier athlétique de Proust, Vierge anguleuse de De Gaulle, Balance harmonieuse de Hugo, Cancer rond de Deneuve) n'étaient pas captés par les seules questions sociales/comportementales. Les biographies fournissent souvent des indices physiques très fiables (morphologie, démarche, élocution) qui correspondent traditionnellement à l'Ascendant.

**Correction** :
1. **`FRA/DHN/N8N DHN Scan fin Planetes`** (`Scorer1`) : ajout de `q13` (morphologie), `q14` (démarche), `q15` (élocution) à la matrice `M` avec mapping astrologique respectant l'invariant v5.11.R2 (max 4 pts par option, désaturation Lion à 3 sur les options "majestueuses"). Boucle de scoring `for(let q=1;q<=12;q++)` → `for(let q=1;q<=15;q++)`.
2. **`FRA/DHN/WEBHOOK DHN`** (`Extract Variables`) : boucle d'extraction `for(let i=1;i<=12;i++)` → `for(let i=1;i<=15;i++)` pour propager q13/q14/q15 du payload site vers `out`.
3. **`FRA/DHN/N8N DHN Questions générales`** (`Reponses Questionnaire`) : boucle de relais `for(let i=1;i<=12;i++)` → `for(let i=1;i<=15;i++)` ; pinData test enrichi de `q13/q14/q15: "a"` par défaut.
4. **`SITE/lib/dhn-questions-data.ts`** : ajout des 3 spécifications `DhnQuestionSpec` pour q13/q14/q15 avec libellés et options finalisés.
5. **`SITE/scripts/BENCHMARK-DHN-MANUEL.md`** : recodage des 8 profils célèbres avec réponses biographiques q13/q14/q15, justifications physiques, recalcul du Top Q attendu.

**Cohérence chaîne complète** : webhook site → `Extract Variables` (i<=15) → `Reponses Questionnaire` (i<=15) → `Scorer1` (q<=15 dans le loop de scoring). Toute boucle laissée à `i<=12` aurait jeté silencieusement q13/q14/q15.

**Robustesse** : l'algo reste tolérant aux questions absentes (`if(a&&M['q'+q]&&M['q'+q][a])`). Aucune régression possible si le front n'envoie pas q13/q14/q15.

**Validation bench (prédictions)** :
- De Gaulle : Balance attendue en Q-rang #2 (cible R1, Vierge reste #1)
- Proust : Bélier reste à 0 (limite intrinsèque assumée — ses réponses biographiques honnêtes ne pointent pas Bélier)
- Hugo : Scorpion reste #1 même avec Lion gagnant des points (désaturation Lion fonctionne)
- Deneuve : Capricorne reste #1 (R2+R1 cumul OK)

Bench live à exécuter post-déploiement sur les 4 cas pour confirmation.

---

### v5.5 — Phase 3 : UX form, robustesse erreur, i18n mail (avril 2026)

#### Extension P-window front — presets de fourchette horaire (`SITE/app/components/dhn-checkout-form.tsx`)

**Symptôme** : avant v5.5, le formulaire DHN obligeait l'utilisateur à saisir les bornes `heure_naissance_min` / `heure_naissance_max` au format `HHHMM` (ex. `20H00`). Beaucoup d'utilisateurs **savent dans quel quart de journée** ils sont nés mais ne pensent pas à utiliser ce champ, ce qui produit des scans 24 h aboutissant régulièrement en confiance « Faible » ou « Très faible ».

**Correction** : ajout d'un menu déroulant « Quart de journée approximatif » avec 5 presets (`Nuit profonde 00H-06H`, `Matin 06H-12H`, `Après-midi 12H-18H`, `Soir/nuit 18H-24H`, `Je ne sais pas`) plus une option `Je préfère préciser` qui rouvre les inputs manuels (mode `custom`). Sélectionner un preset auto-remplit `heure_naissance_min/max`, qui sont ensuite **désactivés visuellement** mais **toujours envoyés** dans le webhook au format historique.

**Ce qui ne change pas** : aucun changement du contrat webhook (`heure_naissance_min/max` continuent d'être envoyés tels quels). Le moteur n8n traite la fourchette via la **P-window v5.3** déjà déployée — pas de modification côté workflow.

#### C — Front : 3 événements minimum obligatoires (`SITE/app/components/dhn-checkout-form.tsx`)

**Symptôme** : le formulaire DHN acceptait jusqu'ici 0 événement de vie. Or `arcs / progressions / RS` ont besoin d'au moins **3 événements complets** (1 type + ≥1 date) pour produire un signal exploitable. Sous ce seuil, le scoring tombe quasi systématiquement en confiance « Faible » / « Très faible ».

**Correction** :
- Constante `DHN_MIN_REQUIRED_EVENTS = 3` (modifiable si besoin).
- Helper `countValidEvents()` + extension de `validateEvents()` qui rejette le submit si `< 3` événements complets, avec message `errMinEvents`.
- Compteur live `{have} / {min}` au-dessus de la liste, vert quand le minimum est atteint, ambre sinon (`aria-live="polite"` pour l'accessibilité).
- Wording mis à jour dans `eventsLegend` et `eventsHelp` (FR/EN).

#### C — n8n : Error Trigger → callback `failed` (`FRA/DHN/N8N DHN ERROR HANDLER`)

**Symptôme** : si un nœud du workflow DHN plantait (API down, JS error, timeout), la commande restait bloquée en `processing` côté site et l'utilisateur n'était **jamais notifié**. Le seul retour possible était un débit qui semblait sans contrepartie.

**Correction** : nouveau **fragment 3 nœuds** à coller dans le workflow DHN principal :
1. **Error Trigger DHN** (`n8n-nodes-base.errorTrigger`) — se déclenche automatiquement à toute erreur du workflow conteneur ; ne nécessite aucune connexion en amont.
2. **Build Failed Payload** (Code node) — lit `$json.execution.error.message` + tente de récupérer `$('Extract Variables').first().json.orderId` (accessible car l'Error Trigger est inline). Construit `{ orderId, status: 'failed', error, n8nExecutionId }` (message tronqué à 500 caractères).
3. **POST FAILED DHN** (HTTP Request) — POST le payload au callback site `https://site-rapports-astro.vercel.app/api/webhooks/n8n-order-status` avec le header `X-Site-Webhook-Secret` (variable n8n `$vars.N8N_WEBHOOK_SECRET`). `neverError: true` pour éviter une boucle infinie d'erreurs.

**Contrat callback** : voir `SITE/lib/n8n-order-status-callback.ts`. Le serveur passe la commande en `status='failed'` et stocke le message dans `orders.last_error`.

**Mode opératoire d'intégration C-n8n** :
1. Dans n8n, ouvrir `GLOBAL DHN`.
2. **Import from File** ou copier-coller les 3 nœuds du fragment `FRA/DHN/N8N DHN ERROR HANDLER`.
3. Vérifier que `$vars.N8N_WEBHOOK_SECRET` est bien configurée (déjà le cas si le callback `delivered` fonctionne).
4. Aucun branchement à faire : Error Trigger se déclenche tout seul à la moindre erreur.
5. Test : forcer un échec en dégradant temporairement une URL d'API (ex. `/western/planets` → `/western/planetes`) puis relancer le webhook avec un payload valide. Vérifier que la commande passe en `failed` côté site avec `lastError` rempli.

#### i18n mail DHN — sortie FR ou EN selon `vars.langue` (`FRA/DHN/N8N DHN`, nœud `Resultat final1`)

**Symptôme** : avant v5.5, le rapport HTML envoyé par mail était systématiquement en français, même si l'utilisateur avait choisi « English » dans le formulaire (`form.langue = "English"`).

**Correction** : ajout d'un helper i18n minimal dans `Resultat final1` :
- Détection : `isEN = vars.langue.toLowerCase() === 'english'` (accepte aussi `'en'`, `'anglais'`).
- Table `STR.fr` / `STR.en` exhaustive pour tous les textes éditoriaux du mail (~60 clés) : titres, intro, carte d'estimation, encadré confiance, alternatives, meilleur global, Top 5, Pic par signe, Validation, en-têtes de tableau, footer (couverture / scan partiel / appariement).
- Helper `T(key, vars)` avec interpolation `{nom}` ; helper `TConfLabel` pour traduire `Forte / Moyenne / Faible / Très faible / Inconnue` → `Strong / Medium / Low / Very low / Unknown`.
- `method` (Arcs+Prog+RS+Quest), `picScopeTxt` et `scanMetaNote` reconstruits via `T()`.

**Ce qui ne change pas (note de scope)** :
- Les **noms de planètes** (`Soleil`, `Lune`, `Mercure`…) et **noms de signes** (`Balance`, `Sagittaire`…) restent en FR car ils sont produits par le moteur swiss-eph côté API privée.
- Les **types d'événements** (`accident`, `voyage_important`, `deces_proche`…) restent en FR car ils sont issus du payload utilisateur.
- Une traduction complète (planètes/signes/types) demanderait un mapping côté API + côté front-back — chantier séparé si demandé.

**Test fonctionnel** : un smoke-test (mock `Extract Variables` + `Scorer`) a vérifié que le HTML est bien généré sans erreur en FR comme en EN, avec présence des marqueurs attendus (`Resultat de Rectification` / `Birth Time Rectification`, `Couverture` / `Coverage`, `Score de confiance global` / `Overall confidence`, etc.).

---

### v5.4 — Phase 2 (1/3) : TZ historique précise via luxon (avril 2026)

#### P7 — Calcul DST historique via TZDB IANA

**Symptôme** : TimezoneDB est connu pour des **inexactitudes sur les transitions DST historiques**, notamment :
- Afrique du Nord avant 1990 (Tunisie : DST en 1939-1944, 1977-1978, **1988-1990** puis abandonné)
- Amérique latine (Argentine, Brésil, Chili : règles changeantes)
- Anciens blocs soviétiques (avant 1990, transitions pré-Pertinent)
- Ex-bloc soviétique (anciennes républiques, Russie pré-1991)

Sur ces cas, TimezoneDB peut renvoyer un `gmtOffset` décalé d'**1 heure** vs la TZDB IANA officielle, ce qui décale **toutes les positions astronomiques** d'un slot ASC entier (~15° en signe).

**Cas concret — Ghassen Tunis 1989** : la Tunisie appliquait CEST (UTC+2) du 26/03/1989 au 24/09/1989. TimezoneDB peut retourner CET (UTC+1) sur cette période → tous les ASC du scan 24h étaient décalés d'1h, et donc le slot vainqueur de l'analyse aussi.

**Correction** : nouveau nœud Code **`TZ Historique`** (entre `Get Timezone` et `Preparer scan 24h` dans `N8N DHN PrepareLL`) :

1. **Lit** : `tzdb.zoneName` (lookup IANA fournie par TimezoneDB, fiable sur lat/lon → zone) + date de naissance
2. **Calcule** : `DateTime.fromObject({year, month, day, hour: 12}, {zone}).offset` via **luxon** (TZDB IANA officielle, mise à jour à chaque release n8n)
3. **Compare** : si écart ≥ 1 minute vs TimezoneDB, log `tzWarn` avec le delta et la zone
4. **Sort** : `gmtOffset` autoritaire (luxon par défaut, TimezoneDB en fallback si zone manquante ou luxon KO), enrichi de `gmtOffsetSource` (`luxon` / `timezonedb`), `zoneNameUsed`, `tzWarn`

**Ce qui ne change pas** :
- TimezoneDB reste appelé (utile pour le mapping lat/lon → IANA, que luxon ne fait pas seul)
- `Preparer scan 24h` lit toujours `gmtOffset` du nœud précédent (compatibilité ascendante : le champ existe, juste plus précis)
- Aucun changement dans le moteur de scoring ni dans le rapport HTML

**Schéma cible** :

```
Get Timezone (TimezoneDB → zoneName) ──► TZ Historique (luxon autoritaire) ──► Preparer scan 24h
```

**Pourquoi luxon et pas tz-lookup + luxon** : `tz-lookup` (npm) ferait le mapping lat/lon → IANA en local, économisant l'appel TimezoneDB. Mais en n8n Cloud les modules npm tiers ne sont pas autorisés sans configuration serveur. En revanche **luxon est embarqué nativement** dans n8n Cloud (cf. `docs.n8n.io/code/cookbook/luxon/` — `DateTime` exposé globalement dans les Code nodes). On garde donc TimezoneDB pour le mapping (1 appel HTTP, déjà en place) et on utilise luxon pour la précision DST.

#### Mode opératoire d'intégration v5.4

1. Dans n8n, ouvrir le sous-workflow contenant `Get Timezone` (issu de `N8N DHN PrepareLL`).
2. Créer un nouveau nœud **Code** (typeVersion ≥ 2) nommé exactement **`TZ Historique`**, position approximative (9416, 4032).
3. Coller le contenu `jsCode` du nœud `TZ Historique` du fichier `N8N DHN PrepareLL` à jour.
4. **Recâbler** :
   - Supprimer la flèche `Get Timezone → Preparer scan 24h`
   - Ajouter `Get Timezone → TZ Historique`
   - Ajouter `TZ Historique → Preparer scan 24h`
5. Sauvegarder + Run.

#### Validation post-import

| Cas test | Comportement attendu |
|---|---|
| Naissance moderne (>2000) dans pays mono-fuseau (France, UK, Allemagne) | `gmtOffsetSource: 'luxon'`, `tzWarn: null` (TimezoneDB et luxon convergent) |
| **Tunis 11/07/1989** | `gmtOffsetSource: 'luxon'`, `gmtOffset: 7200` (UTC+2). Si TimezoneDB renvoie 3600 → `tzWarn: 'Δ TimezoneDB vs luxon = 60 min sur Africa/Tunis…'`. **Les positions ASC du scan 24h vont changer vs v5.3** (décalage temporel de 1h en faveur de la précision) |
| Buenos Aires 1980 | Idem : Argentine a alterné DST de manière chaotique, écart probable |
| Ville sans `zoneName` retourné par TimezoneDB | `gmtOffsetSource: 'timezonedb'`, `tzWarn: 'TimezoneDB ne retourne pas zoneName…'` (fallback propre) |

⚠️ **Attention régression** : si tes tests précédents (Ghassen 1989) ont été faits sans P7, le résultat post-P7 va changer (décalage temporel des slots). C'est **attendu et correct** : v5.3 calculait sur un fuseau erroné, v5.4 calcule sur le vrai fuseau historique. Refaire les tests de référence après import.

#### Restant à faire (Phase 2 et au-delà — mis à jour)

| Code | Phase | Sujet |
|---|---|---|
| — | 2 | Géocodage strict (vérification cohérence pays Nominatim) |
| **C** | 3 | Front : 3 dates d'événements obligatoires + branchement `Error Trigger` → callback `failed` |
| P10 | 4 | Audit quantitatif et rééquilibrage des matrices questionnaire |
| P9 | 5 | Persistance `{payload, résultat, candidats, feedback}` + boucle d'apprentissage J+30 |

---

### v5.3 — Phase 1.5 : Fiabilisation du scoring (avril 2026)

Cette release **n'invalide pas v5.0** : elle ajoute 4 lots (P2, P-circular-asp, P8, P-window) qui s'empilent sur l'existant. Toujours **aucune modification du `GLOBAL DHN.json`** ; livraison par fragments.

| Lot | Fichier impacté | Nature |
|---|---|---|
| **P2** | `N8N DHN` (`Resultat final1`) | Score de confiance global / signe / heure + bandeau d'alerte si ≤ Faible |
| **P-circular-asp** | `N8N DHN` (`Resultat final1`) | Pénalité ×0.2 sur aspects auto-référents `pASC/pMC ↔ nASC/nMC/nDSC/nIC` (progressions et RS), marqués `↻` |
| **P8** | `N8N DHN` (`Resultat final1`) + `WEBHOOK DHN` (`Extract Variables`) | Typage des événements (1er token alphanum du label) + matrice `EVT_AFFINITY` + bonus ×1.5 sur cibles affines, marqués `⊕` |
| **P-window** | `N8N DHN Scan fin Planetes` (`Scorer1` + `Build Prog URL`) + `N8N DHN` (`Resultat final1`) | Scan **réellement restreint** à `[heure_naissance_min, heure_naissance_max]` (économie HTTP proportionnelle) ; `/progressions` calé sur le milieu de la fenêtre |

#### Test de régression — Tunis 11/07/1989 (Ghassen Abdedayem, 5 événements)

| Configuration | ASC retenu | Heure | Confiance signe | Confiance heure | Slots scorés | Notes |
|---|---|---|---|---|---|---|
| v5.0 (avant Phase 1.5) | Balance | 13:30 | Moyenne | Moyenne | 288 | RS auto-référents gonflaient artificiellement le score |
| v5.1 (P2 + P-circular-asp) | Balance | 13:30 | Faible (1.9 pt / 2.7 %) | Faible | 288 | RS dégonflées (56→27 pts) → top devient incertain, alerte affichée |
| v5.2 (+ P8) | Gémeaux | 04:10 | Très faible (0.2 pt / 0.3 %) | Forte | 288 | Affinité voyage↔Mercure/Jupiter rééquilibre vers la nuit, mais ambiguïté Gémeaux/Balance |
| v5.3 plage `00H00–24H00` | Gémeaux | 04:10 | Très faible | Forte | 288 | Régression OK : identique à v5.2 |
| v5.3 plage `20H00–24H00` (info user : « carrément la nuit ») | Poissons | 23:20 | Moyenne (9.8 pt / 14.4 %) | Forte (5.7 pt / 8.35 %) | 49 | Convergence claire ; -83 % d'appels HTTP |

**Lecture** : sans connaissance a priori du créneau, le moteur reste indécis (3 candidats à <5 % d'écart) → la confiance reflète honnêtement cette incertitude. Avec la plage utilisateur, le moteur converge vers un slot crédible. Les 3 candidats v5.2 (Balance 13:30, Gémeaux 04:10, Poissons 23:20) restent les pics dominants par signe — d'où l'intérêt de la **phase D** (Top 3 dans le mail si confiance ≤ Faible).

#### P2 — Score de confiance

Trois indicateurs (cf. §11.3) calculés sur la grille effectivement scorée. Seuils relatifs au top : `≥20 % Forte / 10–20 % Moyenne / 3–10 % Faible / <3 % Très faible`. Un bandeau d'alerte est ajouté au rapport si confiance globale ≤ Faible.

#### P-circular-asp — Pénalité auto-référents

Constantes `CIRC_PEN = 0.2` (progressions §9.5) et `SR_CIRC_PEN = 0.2` (RS §10.4bis). Marqueur `↻` dans le rapport. Justification mathématique : `pASC = ASC_référence + δ_jours` (constante par rapport au slot car `/progressions` est appelée 1× pour `hours = milieu_fenêtre`), donc `pASC conj nASC` est une équation auto-réalisatrice qui converge mécaniquement vers le slot de l'heure de référence. Idem RS : `srASC` dépend principalement du moment du retour solaire, pas du slot natal.

#### P8 — Typage événements + affinité sémantique

Extraction `evt.type` = premier token `[a-z_]+` du label (`accident_grave 13/12/2008` → `accident_grave`). Matrice `EVT_AFFINITY` (§15) liste les planètes/angles attendus pour chaque type. Bonus `AFFINITY_BONUS = 1.5` appliqué une seule fois par aspect (sur source ou cible selon le contexte, cf. §8.6 / §9.6 / §10.5). Marqueur `⊕`. Pas de pénalité pour les non-matches (×1) : on renforce, on ne supprime pas.

#### P-window — Plage horaire effective

**Avant v5.3** : la plage filtrait les **métadonnées de fenêtres** mais pas la grille d'appels API → 288 slots scorés/appelés quel que soit `[min, max]`.

**Après v5.3** :
1. `Scorer1` : boucle `for (m=0; m<1440; m+=5)` augmentée de `if (plage && (m < plage.lo || m > plage.hiInc)) continue` → seuls les slots intra-fenêtre génèrent des items HTTP.
2. `Build Prog URL` : `hours/minutes` = milieu de la fenêtre (au lieu de `12:00` fixe). Bénéfice : minimise l'écart `pASC` ↔ `nASC` candidat → réduit l'amplitude des aspects auto-référents (déjà pénalisés par P-circular-asp, mais c'est mieux à la source).
3. `Resultat final1` : libellé HTML mis à jour (« Scan restreint à cette fenêtre… ») + note bas de rapport « scan partiel : seuls les signes présents dans ces créneaux apparaissent en table ; le “Pic par signe” compare les totaux uniquement sur cet ensemble ».

**Économie HTTP indicative** :
| Plage | Slots scorés | Appels `/western/planets` + `/houses` |
|---|---|---|
| `00H00–24H00` (défaut) | 288 | 576 |
| `08H00–14H00` (6 h) | 73 | 146 (-75 %) |
| `20H00–24H00` (4 h) | 49 | 98 (-83 %) |
| `12H00–14H00` (2 h) | 25 | 50 (-91 %) |

L'appel `/progressions` reste à 1, indépendamment de la plage.

#### Mode opératoire d'intégration v5.3

Pré-requis : v5.0 déjà importée et stable.

1. **P2 + P-circular-asp + P8** : remplacer le code du nœud `Resultat final1` par le contenu de `N8N DHN` à jour (un seul nœud, comportement local). Tester sur un cas avec ≥3 événements.
2. **P8 (extraction type)** : remplacer le code du nœud `Extract Variables` (sous-workflow `WEBHOOK DHN`) par le contenu à jour (ajoute simplement `type` à chaque event).
3. **P-window** : mettre à jour les nœuds `Scorer1` et `Build Prog URL` (fragment `N8N DHN Scan fin Planetes`). Tester deux cas : (a) plage `00H00–24H00` → doit scorer 288 slots (régression v5.2) ; (b) plage restreinte → doit scorer N < 288 et afficher l'encadré « Scan restreint ».

Validation post-import :
- Rapport contient le bandeau « Score de confiance global : … »
- Légende contient `↻=auto-référent…` et `⊕=affinité sémantique…`
- Cas plage restreinte : note bas de rapport « scan partiel… N créneau(x) »

#### Restant à faire (Phase 2+ — inchangé / mis à jour)

| Code | Phase | Sujet |
|---|---|---|
| P7 | 2 | TZ historique précise (`luxon` + `tz-lookup`) |
| — | 2 | Géocodage strict (vérification cohérence pays Nominatim) |
| **D** | 3 (UX) | **Top 3 candidats dans le mail** quand confiance ≤ Faible (au lieu d'un seul) |
| P1 | 3 | Mail "complément requis" + callback `awaiting_data` si confiance faible / 0 événement |
| P10 | 4 | Audit quantitatif et rééquilibrage des matrices questionnaire |
| P5 | 4 | Lien "voir 2 alternatives" + endpoint `/api/dhn/refine` (si D ne suffit pas) |
| P9 | 5 | Persistance `{payload, résultat, candidats, feedback}` en DB + boucle d'apprentissage |

---

### v5.0 — Phase 1 : Stabilisation du moteur existant (avril 2026)

Cette release fiabilise le moteur sans toucher à la logique de scoring. **Aucune modification du `GLOBAL DHN.json`** : les changements sont livrés sous forme de **fragments à intégrer manuellement** dans n8n (cf. mode opératoire ci-dessous).

| Lot | Code | Fichier impacté | Nature |
|---|---|---|---|
| **P3** | Fix fallback ASC circulaire | `N8N DHN` (nœud `Resultat final1`) | Logique JS — seuil 5° avant override math |
| **P4** | Refactor Scan progressions | `N8N DHN Scan fin Planetes` | Architecture — sortie de la grille 288 slots, ajout du nœud `Build Prog URL` |
| **P6a** | Migration secret webhook callback | `N8N DHN SUCCES.json` (nœud `POST SUCCES DHN`) | Sécurité — `={{ $env.N8N_WEBHOOK_SECRET }}` |
| **P6b** | Migration clé TimezoneDB | `N8N DHN PrepareLL` (nœud `Get Timezone`) | Sécurité — `={{ $env.TIMEZONEDB_KEY }}` |
| **P11** | Commentaire `birth_time_reference` | `WEBHOOK DHN` (nœud `Extract Variables`) | Documentation inline — champ réservé usage futur (mode UT) |

#### P3 — Fix fallback ASC circulaire

**Symptôme** : la colonne « Src » du tableau récapitulatif montrait majoritairement `houses+t` ou `planets+t`, signe que l'ASC API était écrasé par le calcul math interne presque à chaque slot.

**Cause** : le booléen `trustApi = sgn.includes(win) && ascSign === win && win !== mathSign` comparait l'ASC API à la fenêtre construite par la même formule que `mathSign`, donc `win === mathSign` était quasi toujours vrai → `trustApi` quasi toujours faux → override systématique.

**Correction** : on conserve l'ASC API par défaut. On ne bascule sur math que si l'écart angulaire dépasse **5°** (signe d'un vrai désalignement d'items après merge). Cf. §11.2.

#### P4 — Refactor Scan progressions

**Symptôme** : 287 erreurs HTTP silencieuses sur `Scan progressions` à chaque exécution (URL vide pour tous les slots sauf le 1er).

**Cause** : `Scorer1` produisait 288 items (grille 5 min) mais ne renseignait `_progUrl` que sur `items[0]`. Les 287 autres items déclenchaient un appel HTTP avec `_progUrl=''` → 404/erreur consommée silencieusement par `onError: continueRegularOutput`.

**Correction** : extraction de la construction d'URL dans un nœud Code dédié `Build Prog URL`, branché en parallèle sur `Evenements de vie`. Ce nœud sort **1 seul item** (ou 0 si aucun événement, ce qui skippe proprement `Scan progressions`).

**Schéma cible** :

```
Evenements de vie ─┬─→ Scorer ─┬─→ Scan fin planetes ─→ Merge (in 0)
                   │           └─→ Scan fin maisons  ─→ Merge (in 1)
                   └─→ Build Prog URL ─→ Scan progressions ─→ Merge (in 2)
```

**Effet de bord intentionnel** : l'URL `/progressions` utilise désormais `hours=12&minutes=0` fixe au lieu de l'heure du slot médian. Différence négligeable car les progressions secondaires varient extrêmement lentement (< 0,01° par heure de naissance).

#### P6a/P6b — Migration secrets vers `$env`

Avant v5.0 : la clé TimezoneDB et le secret du webhook callback site étaient hard-codés en clair dans les exports JSON commités au dépôt.

Après v5.0 : référencés via `={{ $env.TIMEZONEDB_KEY }}` et `={{ $env.N8N_WEBHOOK_SECRET }}`. Cf. §13.1 pour la configuration.

#### P11 — Commentaire `birth_time_reference`

Champ optionnel du payload site, déjà extrait par `Extract Variables` mais non interprété en aval. Désormais documenté en inline comme **réservé pour usage futur** (mode UT pour cas particuliers type carnets de santé marine/militaire).

#### Mode opératoire d'intégration v5.0

Procédure recommandée (du moins risqué au plus risqué) :

1. **P11** + **P6a** + **P6b** (changements minuscules, sans risque) — créer d'abord les variables `TIMEZONEDB_KEY` et `N8N_WEBHOOK_SECRET` dans n8n.
2. **P3** (1 seul nœud à mettre à jour, comportement local).
3. **P4** (3 actions : modifier `Scorer1`, créer `Build Prog URL`, recâbler 3 flèches). Tester sur 1 cas avec événements et 1 cas sans.

Validation après import :
- Logs `Scan progressions` : **1 seul appel** (au lieu de 288).
- Colonne « Src » dans le mail : majoritairement `houses` (sans `+t`).
- Cas sans événement : `Build Prog URL` retourne 0 item, `Scan progressions` skippé proprement.

#### Restant à faire (Phase 2 et au-delà)

| Code | Phase | Sujet |
|---|---|---|
| P7 | 2 | TZ historique précise (`luxon` + `tz-lookup` au lieu de TimezoneDB pour les dates < 1980) |
| — | 2 | Géocodage strict (vérification cohérence pays Nominatim) |
| P2 | 3 | Score de confiance global affiché dans le mail |
| P1 | 3 | Mail "complément requis" + callback `awaiting_data` si confiance faible / 0 événement |
| P10 | 4 | Audit quantitatif et rééquilibrage des matrices questionnaire |
| P8 | 4 | Typage des événements de vie + bonus/malus planétaires spécifiques |
| P5 | 4 | Top 1 + lien "voir 2 alternatives" + endpoint `/api/dhn/refine` |
| P9 | 5 | Persistance `{payload, résultat, candidats, feedback}` en DB + boucle d'apprentissage |

---

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
