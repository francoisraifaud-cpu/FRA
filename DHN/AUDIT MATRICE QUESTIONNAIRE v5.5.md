# Audit quantitatif — Matrice questionnaire DHN (v5.5)

**Source** : `FRA/DHN/N8N DHN Scan fin Planetes` → nœud `Scorer1` → variable `M`
**Libellés** : `SITE/lib/dhn-questions-data.ts` → `DHN_QUESTION_SPECS`
**Date audit** : 2026-04-19

Ce rapport est **descriptif** : il décrit l'état actuel de la matrice. Aucune correction n'est appliquée.
Une seconde phase proposera des ajustements à valider explicitement avant implémentation.

---

## 1. Équilibrage par signe — score max théorique

Pour chaque signe, score max si l'utilisateur répondait toujours l'option qui le maximise.
Idéal recherché : tous les signes ≈ même plafond (matrice non biaisée vers un signe particulier).

| Signe | Apparitions* | Points cumulés** | Score max théorique | Δ vs moyenne |
|---|---:|---:|---:|---:|
| Capricorne | 23 | 75 | **48** ⚠ | +12.833333333333336 (36.5%) |
| Scorpion | 19 | 51 | **38** | +2.8333333333333357 (8.1%) |
| Belier | 16 | 42 | **37** | +1.8333333333333357 (5.2%) |
| Gemeaux | 15 | 44 | **37** | +1.8333333333333357 (5.2%) |
| Lion | 15 | 42 | **36** | +0.8333333333333357 (2.4%) |
| Poissons | 16 | 45 | **36** | +0.8333333333333357 (2.4%) |
| Verseau | 13 | 37 | **34** | -1.1666666666666643 (-3.3%) |
| Cancer | 16 | 40 | **33** | -2.1666666666666643 (-6.2%) |
| Sagittaire | 18 | 43 | **32** | -3.1666666666666643 (-9.0%) |
| Taureau | 12 | 35 | **31** | -4.166666666666664 (-11.8%) |
| Vierge | 11 | 31 | **31** | -4.166666666666664 (-11.8%) |
| Balance | 13 | 33 | **29** ⚠ | -6.166666666666664 (-17.5%) |

*Apparitions = nombre de fois où le signe est cité dans une option (toutes questions confondues, 187 mentions au total).
**Points cumulés = somme des points attribués à ce signe dans toutes les options de toutes les questions.
Moyenne du score max théorique : **35.2** ; min/max : 29 / 48.
Écart-type : **4.7** (idéalement < 3.5 = 10% de la moyenne).

## 2. Puissance & discriminance par question

- **Options** : nombre de choix proposés (6 à 9 selon les questions).
- **Σ pts toutes options** : somme totale des points distribués (option 1 + 2 + …) — proxy "puissance" de la question.
- **Best opt** : meilleur cumul d'une option seule (= score max possible si on tombe sur la réponse la plus "chargée").
- **Discriminance** : score moyen "best" disponible par signe (cumul ÷ 12 signes). Plus c'est élevé, plus la question départage.
- **Signes couverts** : nombre de signes (sur 12) qui peuvent recevoir > 0 point via cette question.

| Q | Options | Σ pts toutes opts | Best opt | Discriminance | Signes couverts |
|---|---:|---:|---:|---:|---:|
| q1 | 6 | 44 | 8 | 2.92 | 12/12 |
| q2 | 6 | 40 | 7 | 2.75 | 12/12 |
| q3 | 8 | 50 | 7 | 3.42 | 12/12 |
| q4 | 6 | 40 | 8 | 2.75 | 11/12 |
| q5 | 6 | 39 | 8 | 2.92 | 12/12 |
| q6 | 8 | 50 | 8 | 3.33 | 12/12 |
| q7 | 9 | 56 | 7 | 3.58 | 12/12 |
| q8 | 6 | 39 | 7 | 2.75 | 11/12 |
| q9 | 6 | 41 | 8 | 2.42 | 10/12 |
| q10 | 6 | 40 | 8 | 2.67 | 11/12 |
| q11 | 6 | 40 | 8 | 2.75 | 10/12 |
| q12 | 6 | 39 | 8 | 2.92 | 12/12 |

## 3. Matrice de couverture signe × question

Cellule = score max qu'un signe peut obtenir via cette question (0 = signe absent de toutes les options).

| Signe | q1 | q2 | q3 | q4 | q5 | q6 | q7 | q8 | q9 | q10 | q11 | q12 | Total |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Capricorne | 3 | 3 | 4 | 3 | 4 | 5 | 3 | 3 | 5 | 5 | 5 | 5 | **48** |
| Scorpion | 2 | 3 | 4 | 3 | 4 | 4 | 4 | 3 | 4 | 3 | · | 4 | **38** |
| Belier | 4 | 3 | 4 | 3 | 3 | 1 | 4 | 4 | 2 | 4 | 3 | 2 | **37** |
| Gemeaux | 4 | 3 | 3 | 3 | 2 | 2 | 4 | 3 | 4 | 3 | 3 | 3 | **37** |
| Lion | 4 | 4 | 4 | 3 | 4 | 4 | 4 | 1 | 2 | · | 4 | 2 | **36** |
| Poissons | 4 | 3 | 4 | 2 | 3 | 2 | 2 | 4 | 3 | 3 | 2 | 4 | **36** |
| Verseau | 2 | 1 | 3 | 3 | 4 | 4 | 4 | 3 | 1 | 3 | 3 | 3 | **34** |
| Cancer | 2 | 3 | 4 | 3 | 2 | 4 | 4 | 2 | 4 | 3 | · | 2 | **33** |
| Sagittaire | 2 | 3 | 2 | 3 | 3 | 4 | 2 | 2 | 2 | 2 | 3 | 4 | **32** |
| Taureau | 4 | 3 | 3 | · | 3 | 2 | 4 | 4 | · | 1 | 4 | 3 | **31** |
| Vierge | 3 | 3 | 4 | 3 | 1 | 4 | 4 | · | 2 | 3 | 3 | 1 | **31** |
| Balance | 1 | 1 | 2 | 4 | 2 | 4 | 4 | 4 | · | 2 | 3 | 2 | **29** |

## 4. Alertes — anomalies à examiner

### 4.1 Signes "absents" d'une question (7 cas)

Aucun chemin de réponse ne donne de point à ces couples signe/question. Cela signifie qu'un utilisateur pleinement de ce signe peut perdre la totalité de la question. Pas forcément un défaut (la matrice peut volontairement réserver une question à certains signes), mais à examiner.

- **Balance** : absent de q9 (1 question(s) sur 12)
- **Cancer** : absent de q11 (1 question(s) sur 12)
- **Lion** : absent de q10 (1 question(s) sur 12)
- **Scorpion** : absent de q11 (1 question(s) sur 12)
- **Taureau** : absent de q4, q9 (2 question(s) sur 12)
- **Vierge** : absent de q8 (1 question(s) sur 12)

### 4.3 Top 3 signes sur-représentés vs sous-représentés

**Top 3 plafonds les plus hauts** (avantagés) :
- Capricorne : score max **48** pts (apparitions=23)
- Scorpion : score max **38** pts (apparitions=19)
- Belier : score max **37** pts (apparitions=16)

**Bottom 3 plafonds** (désavantagés) :
- Balance : score max **29** pts (apparitions=13)
- Vierge : score max **31** pts (apparitions=11)
- Taureau : score max **31** pts (apparitions=12)

## 5. Détail par question (libellé × options × scoring)

### q1 — *En société, on vous perçoit comme…*

| Opt | Libellé front | Scoring matrice (signe : pts) |
|---|---|---|
| a | Énergique / fonceur | Belier:4 · Sagittaire:2 · Lion:1 |
| b | Calme / rassurant | Taureau:4 · Cancer:2 · Capricorne:2 |
| c | Vif / curieux | Gemeaux:4 · Verseau:2 · Balance:1 |
| d | Réservé / distant | Vierge:3 · Capricorne:3 · Scorpion:2 |
| e | Charismatique / lumineux | Lion:4 · Sagittaire:2 · Belier:1 |
| f | Doux / empathique | Poissons:4 · Cancer:2 · Scorpion:1 |

### q2 — *Physiquement, on vous décrit plutôt…*

| Opt | Libellé front | Scoring matrice (signe : pts) |
|---|---|---|
| a | Sportif / musclé | Belier:3 · Sagittaire:3 · Scorpion:1 |
| b | Solide / carré | Taureau:3 · Capricorne:3 · Cancer:1 |
| c | Mince / nerveux | Gemeaux:3 · Vierge:3 · Verseau:1 |
| d | Doux / arrondi | Cancer:3 · Poissons:3 · Balance:1 |
| e | Imposant / marquant | Lion:4 · Sagittaire:2 |
| f | Anguleux / osseux | Scorpion:3 · Capricorne:2 · Belier:1 |

### q3 — *Face à l’inconnu, votre première réaction visible…*

| Opt | Libellé front | Scoring matrice (signe : pts) |
|---|---|---|
| a | Foncer | Belier:4 · Sagittaire:2 |
| b | Observer puis construire | Capricorne:4 · Taureau:3 |
| c | Questionner / explorer | Gemeaux:3 · Verseau:3 |
| d | Se protéger | Cancer:4 · Taureau:2 |
| e | Prendre le lead | Lion:4 · Balance:2 |
| f | Analyser méthodiquement | Vierge:4 · Capricorne:3 |
| g | Sonder en profondeur | Scorpion:4 · Poissons:2 |
| h | Se laisser porter | Poissons:4 · Cancer:2 |

### q4 — *En groupe, les autres vous voient comme…*

| Opt | Libellé front | Scoring matrice (signe : pts) |
|---|---|---|
| a | Le leader naturel | Belier:3 · Lion:3 · Capricorne:2 |
| b | Le diplomate | Balance:4 · Poissons:2 |
| c | L’indépendant | Verseau:3 · Sagittaire:3 |
| d | Le confident | Scorpion:3 · Cancer:3 |
| e | L’animateur | Gemeaux:3 · Lion:2 · Balance:2 |
| f | Le sélectif | Vierge:3 · Capricorne:3 · Scorpion:1 |

### q5 — *Votre look au quotidien, selon vos proches…*

| Opt | Libellé front | Scoring matrice (signe : pts) |
|---|---|---|
| a | Sportif / décontracté | Belier:3 · Sagittaire:3 |
| b | Classique / soigné | Capricorne:4 · Taureau:3 · Vierge:1 |
| c | Original / décalé | Verseau:4 · Gemeaux:2 |
| d | Élégant / glamour | Lion:4 · Balance:2 |
| e | Sombre / sobre | Scorpion:4 · Capricorne:2 |
| f | Bohème / artiste | Poissons:3 · Cancer:2 · Balance:2 |

### q6 — *Ce que les gens remarquent en premier chez vous…*

| Opt | Libellé front | Scoring matrice (signe : pts) |
|---|---|---|
| a | Votre ambition | Capricorne:5 · Lion:2 · Belier:1 |
| b | Votre bienveillance | Cancer:4 · Taureau:2 |
| c | Votre charme | Balance:4 · Poissons:2 |
| d | Votre humour | Sagittaire:4 · Gemeaux:2 |
| e | Votre intensité | Scorpion:4 · Poissons:2 |
| f | Votre créativité | Lion:4 · Gemeaux:2 |
| g | Votre rigueur | Vierge:4 · Capricorne:2 |
| h | Votre liberté | Verseau:4 · Sagittaire:2 |

### q7 — *Le défaut que vos proches vous reprochent le plus…*

| Opt | Libellé front | Scoring matrice (signe : pts) |
|---|---|---|
| a | Impatience | Belier:4 · Scorpion:2 |
| b | Rigidité | Taureau:4 · Capricorne:3 |
| c | Éparpillement | Gemeaux:4 · Sagittaire:2 |
| d | Hypersensibilité | Cancer:4 · Poissons:2 |
| e | Orgueil | Lion:4 · Belier:2 |
| f | Perfectionnisme | Vierge:4 · Capricorne:3 |
| g | Indécision | Balance:4 · Poissons:2 |
| h | Méfiance | Scorpion:4 · Capricorne:2 |
| i | Détachement | Verseau:4 · Gemeaux:2 |

### q8 — *À première vue, dans un nouveau groupe, vous semblez motivé par…*

| Opt | Libellé front | Scoring matrice (signe : pts) |
|---|---|---|
| a | L’action | Belier:4 · Scorpion:2 · Lion:1 |
| b | La sécurité | Taureau:4 · Cancer:2 |
| c | La connaissance | Gemeaux:3 · Verseau:3 · Sagittaire:1 |
| d | La justice | Balance:4 · Taureau:2 |
| e | Le pouvoir | Scorpion:3 · Capricorne:3 |
| f | La spiritualité | Poissons:4 · Sagittaire:2 · Cancer:1 |

### q9 — *On vous dit souvent que vous paraissez…*

| Opt | Libellé front | Scoring matrice (signe : pts) |
|---|---|---|
| a | Plus jeune que votre âge | Gemeaux:4 · Lion:2 · Belier:1 |
| b | Plus mûr / sérieux que votre âge | Capricorne:5 · Vierge:2 · Scorpion:1 |
| c | Changeant / insaisissable | Gemeaux:3 · Poissons:3 |
| d | Difficile à cerner | Scorpion:3 · Poissons:3 · Verseau:1 |
| e | Chaleureux / accessible | Cancer:4 · Sagittaire:2 · Lion:1 |
| f | Magnétique / intense | Scorpion:4 · Belier:2 |

### q10 — *Votre rapport au temps, selon votre entourage…*

| Opt | Libellé front | Scoring matrice (signe : pts) |
|---|---|---|
| a | Toujours pressé | Belier:4 · Sagittaire:2 |
| b | Très ponctuel / organisé | Capricorne:5 · Vierge:3 |
| c | Flexible / cool | Gemeaux:3 · Sagittaire:2 · Balance:2 |
| d | Cyclique | Cancer:3 · Poissons:3 |
| e | Hors du temps | Verseau:3 · Sagittaire:2 |
| f | Planificateur long terme | Capricorne:4 · Scorpion:3 · Taureau:1 |

### q11 — *Pour un rendez-vous important, vous vous habillez…*

| Opt | Libellé front | Scoring matrice (signe : pts) |
|---|---|---|
| a | Décontracté / naturel | Sagittaire:3 · Belier:3 |
| b | Classique / sobre | Capricorne:4 · Taureau:4 |
| c | Tendance / mode | Gemeaux:3 · Verseau:3 |
| d | Élégant / raffiné | Lion:4 · Balance:3 |
| e | Personnel / unique | Verseau:3 · Poissons:2 |
| f | Strict / professionnel | Capricorne:5 · Vierge:3 |

### q12 — *Votre visage au repos, on vous dit souvent…*

| Opt | Libellé front | Scoring matrice (signe : pts) |
|---|---|---|
| a | Souriant / avenant | Sagittaire:4 · Lion:2 · Cancer:1 |
| b | Sérieux / fermé | Capricorne:5 · Scorpion:2 · Vierge:1 |
| c | Rêveur / absent | Poissons:4 · Cancer:2 |
| d | Interrogatif | Gemeaux:3 · Verseau:3 |
| e | Intense / perçant | Scorpion:4 · Belier:2 |
| f | Neutre / impassible | Taureau:3 · Balance:2 · Capricorne:1 |

## 6. Pistes de rééquilibrage (à valider avant impl)

Synthèse automatique basée sur les sections 1-4 ; à pondérer par le sens métier.

1. **Rééquilibrage des plafonds** : ramener tous les signes dans une fourchette ±10% de la moyenne (≈ ±4 pts).
2. **Combler les trous** identifiés en §4.1 : pour chaque signe absent d'une question, ajouter au moins 1 mention 1-2 pts dans une option cohérente sémantiquement.
3. **Renforcer la discriminance** des questions § 4.2 (couverture < 10 signes).
4. **Vérifier la cohérence label ↔ scoring** des options listées en § 5 (revue éditoriale, pas automatisable).
5. **Audit redondance** : identifier les paires de questions trop corrélées (q5 vs q11 = look ; q4 vs q6 = perception sociale) — non couvert ici, nécessite données réelles ou simulation.

---

*Rapport généré automatiquement par `FRA/DHN/.audit-matrice.js`. Re-générer après chaque modification de la matrice.*
