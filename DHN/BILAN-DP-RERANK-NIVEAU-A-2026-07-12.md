# BILAN — Directions Primaires comme arbitre des top-3 signes (Niveau A)

> Statut : 🔴 NO-GO (arbitre dur) — signal réel mais non net à n=8
> Date : 2026-07-12
> Lié à : `dhn-rectif-gate.mjs` (NO-GO intra-signe), `dhn-preprod-lean-ab.mjs` (A/B moteur), `SPEC-QUESTIONNAIRE-ASC-ALLEGE-2026-07-12.md`
> Outil : `SITE/scripts/_enprat/dhn-dp-rerank.mjs`

## Question

Idée utilisateur : ne PAS chercher l'heure à l'aveugle (NO-GO déjà acté), mais partir
des **top-3 signes du moteur DHN** et laisser les **directions primaires (DP, rigoureux
Naibod)** désigner le bon signe. 1 créneau représentatif par signe = milieu de la
fenêtre ASC du signe le jour J. Baseline = choix par défaut du moteur (top3[0]).

## Résultat (8 cas AA, moteur = A/B preprod lean 5-Q)

| cas | vrai ASC | moteur #1 | DP mid | DP best3 |
|---|---|---|---|---|
| bardot | Sagittaire | Lion ✗ | Lion ✗ | Balance ✗ |
| gainsbourg | Poissons | Poissons ✓ | Sagittaire ✗ | Cancer ✗ |
| ysl | Verseau | Gemeaux ✗ | **Verseau ✓** | **Verseau ✓** |
| beauvoir | Sagittaire | Sagittaire ✓ | Sagittaire ✓ | Balance ✗ |
| degaulle | Balance | Vierge ✗ | **Balance ✓** | **Balance ✓** |
| hugo | Scorpion | Scorpion ✓ | Balance ✗ | Balance ✗ |
| proust | Bélier | Vierge ✗ | Verseau ✗ | Verseau ✗ (hors top-3, irrécupérable) |
| deneuve | Capricorne | Capricorne ✓ | Capricorne ✓ | Capricorne ✓ |

| | signe #1 correct |
|---|---|
| **Moteur seul** | 4/8 |
| **DP re-rank (mid)** | 4/8 |
| DP re-rank (best3) | 3/8 |
| Plafond (vrai ∈ top-3) | 7/8 |

- **Récupérés par DP** (moteur faux → DP juste) : **ysl, de Gaulle** (2/3 des cas récupérables).
- **Cassés par DP** (moteur juste → DP faux) : **gainsbourg, hugo**.
- Net = **+0**. `best3` (max sur ±40 min) fait PIRE (3/8) → donner plus de liberté à la DP amplifie les faux positifs.

## Lecture honnête

1. **NO-GO comme arbitre DUR.** La DP échange autant de bons que de mauvais → aucun gain net. Elle ne doit **pas** écraser le choix du moteur.
2. **MAIS signal réel, décorrélé du moteur.** La DP récupère 2/3 des ratés récupérables du moteur (ysl, de Gaulle = les cas carrière/MC), au-dessus du hasard (2,33/7 attendu si tirage). Elle est ~équivalente au moteur (4/7 sur les récupérables) mais sur des cas DIFFÉRENTS.
3. **Cohérent avec le gate intra-signe** : la DP ne résout pas l'heure DANS un signe ; ici le créneau représentatif est donc bruité, d'où les faux positifs (gainsbourg/hugo).

## Suite possible (si poursuite)

La décorrélation moteur↔DP est exactement ce qui rend un **ensemble additif** (DP en
bonus, pas en remplacement) potentiellement utile — mais :

- **n=8 = trop petit pour calibrer** un ensemble ou un tie-break gaté sans overfitter
  (les 4 récupérations/casses sont 4 points). Toute pondération réglée ici serait du
  sur-apprentissage.
- **Prérequis avant tout ensemble** : élargir aux ~150 personnalités AA du JDD, puis
  tester DP **en bonus additif** (jamais en override), avec gate GO = gain net signe #1
  ≥ +1σ sans casse, mesuré hors échantillon.

**Décision par défaut** : le moteur (arcs + prog + RS) capte déjà l'essentiel du signal
directionnel ; la DP n'apporte pas de gain net à n=8 comme arbitre. Gel de la piste
« DP arbitre » ; ré-ouvrir seulement en mode **ensemble additif sur JDD élargi**.

---

## ADDENDUM — v2 VALENCE-AWARE (2026-07-12, `dhn-dp-rerank-valence.mjs`)

Test de l'idée utilisateur : filtrer chaque événement par la **valence de la DP**
(favorable/exigeante, réutilisant nature planète × aspect de PREV) + **domaine =
significateur (angle)**, pas seulement la planète. Poids figés (non tunés).

| cas | vrai | moteur | DP planète (v1) | DP valence (v2) |
|---|---|---|---|---|
| gainsbourg | Poissons | Poissons ✓ | Sagittaire ✗ | **Poissons ✓ (réparé)** |
| ysl | Verseau | Gemeaux ✗ | Verseau ✓ | Sagittaire ✗ (perdu) |
| degaulle | Balance | Vierge ✗ | Balance ✓ | Vierge ✗ (perdu) |
| hugo | Scorpion | Scorpion ✓ | Balance ✗ | Cancer ✗ |
| *(autres)* | | 4/8 | 4/8 | |

**Moteur 4/8 · DP planète 4/8 · DP valence 3/8.**

### Ce que la valence apporte / coûte
- ✅ **Réduit les faux positifs** : Gainsbourg réparé ; casse 2 → 1.
- ❌ **Étouffe des vrais positifs carrière** : ysl, de Gaulle perdus. La restriction de
  domaine (significateur = angle exact) est le facteur bloquant (la relabel carrière
  valence-agnostique n'a rien changé → c'est le domaine, pas la valence).

### Diagnostic fin (scores par signe, `_dp-rerank-valence.json`)
1. **Le vrai signe est dans le DP-top-2 (sur 3) dans 7/7 cas récupérables** (jamais
   dernier). DP « sait » quelque chose : le vrai signe score toujours haut.
2. **Les marges sont au niveau du bruit** : ysl Verseau 1.19 vs Sagittaire 1.81 ;
   de Gaulle Balance 1.88 vs Vierge 2.25. Le #1 bascule sur des écarts minuscules.
3. **Signal d'abstention** : Gainsbourg top DP ≈ 0.12 (quasi nul) → DP n'a rien à dire ;
   un gate « DP s'abstient si score faible » garderait le moteur (Poissons ✓).
4. **Les 4 désaccords nets moteur↔DP se répartissent 2-2** (moteur juste : gainsbourg,
   hugo ; DP juste : ysl, de Gaulle) → aucun méta-signal per-cas pour trancher à n=8.

### Conséquence
DP = signal **réel, décorrélé, mais faible et domaine-dépendant**. Ni « planète seule »
ni « valence » ne bat le moteur à n=8. **Tout réglage supplémentaire (seuil
d'abstention, poids d'ensemble, table de valence) = overfit sur 8 points** — interdit
par `dtc-patch-conformite` (POC < 10 cas non représentatif). Le seul verdict valable
= **JDD ~150 AA avec split train/test**. À défaut : geler DP, livrer questionnaire
allégé + sortie honnête top-3.

---

## PHASE 0 — Batch élargi 18 cas AA VÉRIFIÉS (2026-07-12, `dhn-phase0-*.mjs`)

### Constitution du lot (réponse au doute JDD utilisateur)
Le manifeste `prev-bench-baseline-150` est un banc de **prédiction** : **1 seul
événement daté par personne** (150 runs = 150 personnes, 0 multi-année), events
souvent sur un **tiers** (17 DEUIL/HÉRITAGE) ou à **âge < 12** (Athina Onassis 3 a,
Caroline Kennedy 6 a → exclues). **Inexploitable en l'état pour la rectification.**
On en réutilise donc **uniquement les naissances AA** + on **source les timelines
multi-événements** (web, cités). DSK : heure corrigée **11H10** (note + champ
structuré ligne 4935) ✓.

10 nouveaux cas (Monroe, Grace Kelly, E. Taylor, Elvis, Connery, Ali,
Schwarzenegger, Diana, Kidman, Jolie), 4-6 events sourcés chacun.
**Vérité-terrain ASC recalculée** (tz historique) et **recoupée** : Monroe Lion 13.1°,
Elvis Sag 12.4°, Diana Sag 18.4°, Jolie Cancer 28.9° = **4/4 match sub-degré** ⇒ tz
et pipeline API validés.

### Mesure décorrélée : la DP désigne-t-elle le VRAI signe parmi {vrai + 2 leurres} ?
(On écarte le top-3 moteur des nouveaux : il dépend du questionnaire non sourçable.)

| Régime leurres | DP planète (v1) | DP valence (v2) | hasard |
|---|---|---|---|
| **ADJACENTS** (signes voisins, cas réaliste) | **7/18 = 39 %** | 5/18 = 28 % | 33 % |
| **ALÉATOIRES** (signes zodiacalement loin) | **9.7/18 = 54 %** | 6.2/18 = 34 % | 33 % |

Seuil signal (+1.6 σ) ≈ 9.9/18. **Meilleur DP = 9.7/18 → sous le seuil.**

### Verdict Phase 0 (robuste, n=18 propres)
1. **Sur leurres ADJACENTS — le cas qui compte — la DP est AU NIVEAU DU HASARD**
   (39 %/28 %). Quand les hypothèses d'heure sont proches (voisins de signe), la DP
   **ne sait pas trancher** — cohérent avec le NO-GO « DP trouveur d'heure » (gate).
2. **La DP ne porte du signal que sur leurres LOINTAINS** (54 %) — c.-à-d. le cas
   FACILE que le moteur gère déjà. Là où l'aide serait utile (signes proches), rien.
3. **v2 valence < v1 planète partout** : le raffinement valence **dégrade** au niveau
   signe (sur-filtrage domaine). → **ne pas promouvoir v2.**
4. Confirme le net-zéro du DHN-8 sur données propres et indépendantes.

### Décision
**NO-GO DP-arbitre du SIGNE ascendant.** L'approche « moteur dégrossit top-3 → DP
filtre » échoue parce que les confusions du moteur sont surtout entre **signes
proches**, régime où la DP est nulle. Livrable retenu = **questionnaire allégé
(q1,q3,q6,q8,q12) + sortie honnête top-3 + confiance**, **sans couche DP**.
Niche DP résiduelle éventuelle (dormante, non prioritaire) : départage **seulement**
si candidats zodiacalement **loin** ET marge DP forte, sinon abstention.

---

## PHASE 0 bis — CONVERGENCE MULTI-TECHNIQUE (2026-07-12, `dhn-phase0-converge.mjs`)

Test de la méthode que **la doctrine endosse** (DESIGN-CONVERGENCE-DP-TRANSIT) :
un événement est crédible si **plusieurs techniques indépendantes convergent sur le
même angle du domaine**. 4 couches, toutes pivotant sur l'angle natal (seule quantité
sensible à l'heure) : **DP + Arc solaire + progressions secondaires + transits lents**.
Orbe angle 1.5°, aspects majeurs, convergence = nb de techniques. Params **figés**.

| Régime leurres | CONVERGENCE (4 techniques) | DP seule | hasard |
|---|---|---|---|
| **Adjacents** (le cas réel) | 6/18 = 33 % | 7/18 = 39 % | 33 % |
| Aléatoires (loin) | 7.8/18 = 44 % | 9.7/18 = 54 % | 33 % |

**NO-GO : la convergence ne bat PAS la DP seule — elle la dégrade (Δ=-1 adjacents,
-1.9 aléatoires).**

### Le diagnostic profond (colonne `vrai:Σconv vsAutresMax`)
Le point crucial : **à la VRAIE heure, la convergence est bien présente et forte** —
Diana 5/6 events ≥2 couches (4/6 ≥3), Connery/Arnold/Jolie 6/6, Grace Kelly 5/6.
La doctrine dit vrai : *le vrai thème converge*. **MAIS les signes-leurres convergent
tout autant, voire plus** : beauvoir vrai Σ9 vs autre Σ18 ; monroe Σ8 vs Σ12 ;
kidman Σ10 vs Σ15 ; bardot Σ13 vs Σ15.

**Cause racine** : avec 4 techniques × 4 angles × ~12 corps × 5 aspects × orbe 1.5°,
le ciel est **saturé** — n'importe quelle heure trouve 2-3 couches sur un angle près
de n'importe quel événement. La convergence est **nécessaire mais NON UNIQUE** au vrai
temps. Ajouter des techniques ajoute des **coïncidences**, pas de la **spécificité** →
discrimination **pire**, pas meilleure.

### Conséquence doctrinale (réponse définitive)
La rectification pro exige un **jugement d'expert** (quel événement → quel angle/planète
précis, pondéré par la qualité), pas un **comptage**. Un comptage automatique de
convergences ne sépare pas le vrai thème de ses voisins plausibles. Cohérent avec la
cotation **DD (« dirty data »)** des heures rectifiées chez Rodden : la tradition
elle-même ne fait pas confiance à l'heure rectifiée.

**Verdict final (triangulé sur 3 approches × 18 cas AA propres)** :
- DP seule → hasard (adjacents). DP valence → pire. Convergence 4-techniques → pire.
- **Le SIGNE n'est PAS récupérable** contre ses voisins par ces techniques.
- **Acquis solide** : le **questionnaire** place le signe en **top-3 ~88 %** (fenêtre
  ~2-4 h). C'est le produit honnête : **signe + fenêtre + confiance**, sans heure exacte.

---

## PHASE B — AFFINER L'HEURE DANS LE SIGNE (2026-07-12, `dhn-phaseB-hour.mjs`)

Question re-cadrée (≠ Phase 0) : on suppose l'Étage 1 **signe correct** (top-3 ~88 %) et
on cherche à **classer l'heure DANS la fenêtre du vrai signe** (~140 min médiane).
Audit préalable : **DHN Phase B utilise déjà** les angles progressés par créneau
(`countProgHits`) + un tie-break **éclipses PROGRESSÉES** (par `date_vie`). Il **n'utilise
PAS** : (a) les **directions primaires**, (b) les **éclipses MONDAINES conj un angle natal**.

Harness : scan fenêtre vrai signe (pas 3 min), 3 couches ancrées sur l'angle du domaine —
**PROG** (≈ DHN), **DP** (`/directions/primary` rigoureux), **ECL mondaine** (degré réel du
luminaire à ±N mois, conj angle). Métrique = **percentile de la vraie minute** (0 % = top)
+ |argmax−vrai|. Hasard ≈ 50 % / ~47 min.

### Résultats (18 cas)
| Estimateur | median percentile | median \|argmax−vrai\| | actif |
|---|---|---|---|
| **PROG** (≈ DHN actuel) | 43 % | 32 min | 18/18 |
| DP seule (orbe ≤0.5 an) | 46 % | 32 min | 18/18 |
| **ECL mondaine serrée** (±2 mo, 2°) | **17 %** (meilleur classeur) | 36 min | 14/18 |
| **TR transit lent** (matrice PREV) | 29 % | **24 min** (meilleur point) | 18/18 |
| PROG+DP | 44 % | 25 min | 18/18 |
| FULL (somme 4 couches) | 43 % | 51 min | 18/18 |
| SMART / CONV (blend naïf) | 43-48 % | 48-56 min | 18/18 |
| éclipse-gate → prog+DP | 67 % | 37 min | 18/18 |

**Piège majeur : le BLEND NAÏF (somme) détruit le signal** (FULL/CONV 43-56 min vs TR
seul 24 min). Additionner les bonnes couches sparse (ecl, tr) avec les bruitées (prog, dp)
crée plusieurs pics → l'info se noie. **Toute combinaison doit être un re-ranker
séquentiel/pondéré validé, jamais une somme.** Idem « éclipse-gate → prog+DP » régresse
(67 %) : le gate jette le bon classeur éclipse. Les deux leviers marchent **séparément**.

### Le fait tangible (levier inexploité par DHN)
L'**éclipse mondaine serrée conj un angle du domaine** est le **meilleur localisateur** de
la vraie heure : median percentile **17 %**, et **13/14** cas où elle existe ont la vraie
heure dans le **top-30 % du classement éclipse** (sous H0 : ~30 % attendus → binomiale
p ≪ 0.001). **Concrètement : quand une telle éclipse existe (14/18 = 78 % des cas), se
restreindre au top-30 % éclipse resserre la fenêtre de ~140 min à ~45 min en gardant la
vérité 93 % du temps.** C'est un signal **réel, sensible à l'heure, doctrinal** (Brady :
l'éclipse = déclencheur daté) que DHN **ignore** (il ne voit que les éclipses *progressées*
appariées par date, jamais l'éclipse réelle au degré d'un angle).

### Ce que ça n'est PAS
- Pas un oracle de la **minute** : même tous leviers réunis, l'estimateur ponctuel reste
  à ~25-37 min d'erreur dans une fenêtre de 140 min. Plusieurs éclipses = plusieurs
  sous-zones → la vraie heure est **haute** (bon percentile) mais pas toujours **LA** plus
  haute (argmax bruité). La bonne combinaison est un **re-ranker pondéré par l'éclipse**,
  pas un « gate puis prog/DP » (qui régresse à 67 %).
- DP seule reste un **lavage** pour l'heure (aide ~5 cas, nuit ~5) ; utile seulement en
  appoint dans un blend (PROG+DP : erreur ponctuelle 32→25 min).

### Piste produit (NON un NO-GO)
Deux couches inexploitées par DHN, complémentaires :
- **Éclipse mondaine sur angle** = **classeur/confiance** (top-30 % → fenêtre ~45 min, 13/14).
- **Transit lent sur angle** (matrice PREV) = **estimateur ponctuel** (24 min, dispo 18/18).

Intégration DHN Phase B envisagée : (a) point d'heure via **transit lent sur angle** ;
(b) **fenêtre resserrée + confiance** via l'éclipse mondaine quand elle existe ;
(c) combiner par **re-ranker séquentiel/pondéré** (JAMAIS somme — prouvé régressif).

**Garde-fou méthodo** : ~10 estimateurs testés sur les mêmes 18 cas → sur-ajustement
possible. Avant tout patch moteur : **confirmer ecl (17 %) + transit (24 min) hors
échantillon** (~15 cas AA multi-événements de plus), puis formaliser le re-ranker
(règles `dtc-patch-conformite`, branche `dtc/*`).

### VALIDATION HORS ÉCHANTILLON (2026-07-12, 10 cas neufs jamais vus)

10 nouvelles personnalités **AA/A**, ASC recoupé **10/10** à l'API (degrés = astro.com,
tz historiques validés, cf. `dhn-phaseB-validate-asc.mjs`) : JFK, Obama, Madonna,
Charles III, Elizabeth II, Whitney Houston, Cobain, Spielberg, Fonda, Nicolas Cage.
Cas rejetés pour données douteuses : **Lennon (DD)**, **Tom Cruise (X)**. Harness rejoué
avec **paramètres GELÉS** (ECL ±2 mo/2°, DP ≤0.5 an) — aucun réglage a posteriori.

| Estimateur | 18 cas (in) | 10 cas neufs (out) | tient ? |
|---|---|---|---|
| **ECL mondaine** (classeur) | **17 %** pct | **22 %** pct · actif 8/10 | ✅ **OUI** (meilleur classeur out aussi) |
| **TR transit lent** (point) | **24 min** | **26 min** · actif 10/10 | ✅ **OUI** (meilleur point 1-couche out aussi) |
| PROG+DP (point) | 25 min | **20 min** | ✅ OUI (meilleur point global out) |
| PROG (≈ DHN actuel) | 32 min / 43 % | 65 min / 38 % | référence (dégrade en point) |
| FULL / SMART (blend naïf) | 48-56 min | 27-33 min / 55 % pct | ❌ régressif (classeur ≈ hasard) |

**Conclusion validation :** les **deux leviers répliquent** sur données propres jamais
vues. L'**éclipse mondaine** reste le **meilleur classeur** (17 %→22 %, ≪ hasard 50 %) ;
le **transit lent** + **PROG+DP** restent les **meilleurs estimateurs ponctuels**
(24→26 min / 25→20 min). Le **blend naïf reste régressif** (confirmé). DHN n'exploite
NI l'éclipse mondaine NI le transit/DP sur angle → **gisement réel et validé**.
Le signal n'est PAS du sur-ajustement. **GO pour formaliser un re-ranker pondéré**
(éclipse = classeur/confiance ; transit+progDP = point), branche `dtc/*`, gates
`dtc-patch-conformite`. Ce n'est pas un oracle de la minute (~20-26 min résiduels dans
140 min) mais un **resserrement ×2.5-3 doctrinalement fondé**.

### RE-RANKER FUSIONNÉ — testé & REFUSÉ (2026-07-12, split train 18 / test 10)

On a formalisé et mesuré un **re-ranker rank-fusion** (chaque couche → rang intra-fenêtre
∈[0,1], puis somme pondérée — normalise l'échelle, cense éviter la dilution de la somme
brute). 3 profils de poids `[ecl, progDp, tr]` conçus sur TRAIN, **gelés** pour TEST :
rrEcl `[.60/.25/.15]`, rrBal `[.40/.35/.25]`, rrPt `[.25/.45/.30]`.

| Estimateur | TRAIN pct/err | TEST pct/err | rôle |
|---|---|---|---|
| **ecl** (mondaine) | **17 %** / 36 min | **22 %** / 50 min | meilleur CLASSEUR (sparse 22/28) |
| **progDp** (prog+DP) | 44 % / **25 min** | 41 % / **20 min** | meilleur POINT |
| **tr** (transit lent) | 29 % / **24 min** | 56 % / 26 min | bon point, mauvais classeur |
| prog (≈ DHN actuel) | 43 % / 32 min | 38 % / **65 min** | baseline |
| dpTr (dp+tr) | 44 % / 40 min | 45 % / 32 min | ❌ dilue |
| point (prog+dp+tr) | 46 % / 48 min | 57 % / 37 min | ❌ dilue |
| rrEcl / rrBal / rrPt | 42-47 % / 35-39 min | 51-52 % / 28-29 min | ❌ **NO-GO** |

**VERDICT re-ranker fusionné : NO-GO ferme.** Tout score qui **fusionne** ces couches
(somme brute `full`/`smart`, OU rank-fusion `rr*`, OU sommes partielles `dpTr`/`point`)
retombe à **45-57 % pct / 28-48 min** — jamais mieux, souvent pire, que la **meilleure
couche seule**. Prouvé sur DEUX familles de fusion (somme de scores ET somme de rangs),
avec split train/test. Raison : l'éclipse est un classeur **sparse** (ne s'allume que sur
quelques créneaux) ; la noyer dans une fusion linéaire avec des pointeurs qui piquent à
d'autres minutes détruit sa netteté. **Une seule information par usage, jamais fusionnée.**

### CE QUI EST DÉPLOYABLE (mesuré, hors échantillon, additif — PAS un score fusionné)

1. **POINT d'heure** : DHN pointe aujourd'hui via `prog` seul (**32 min TRAIN / 65 min
   TEST**). Ajouter les **hits de directions primaires** (progDp) abaisse à **25/20 min**
   — gain **out-of-sample validé** (−7 min train, −45 min test), et c'est exactement
   l'intuition initiale « DP challenge l'heure ». C'est un **ajout additif** au
   `countProgHits` existant, sans changement de paradigme. ⚠ Ne PAS y sommer `tr` ni
   `ecl` (dilue : `point` 48/37 min). progDp est le point le plus robuste.
2. **CONFIANCE / fenêtre** : l'**éclipse mondaine** sur angle = classeur (17-22 %).
   Usage **conditionnel** (jamais sommé) : quand elle s'allume (78 % des cas), elle
   **corrobore une zone** → relever la confiance + resserrer la fenêtre annoncée.

**Design produit (modulaire, non fusionné)** : (a) point = `prog + DP` (additif) ;
(b) flag confiance/fenêtre = éclipse mondaine si présente ; (c) `tr` en simple
corroboration affichée, jamais dans le score. **Limite honnête** : ~20-25 min résiduels
dans 138 min — resserrement réel (×1.5-3 sur le point) mais pas un oracle de la minute.

### ⚠ CORRECTION MAJEURE (2026-07-12, audit code DHN ligne 941)

**Erreur consignée ci-dessus : le harness comparait à `prog` seul — un HOMME DE PAILLE.**
Audit du nœud `Resultat final1` : DHN calcule déjà par créneau
`totalScore = wScore + arcScore + progScore + srScore + transitScore` (ligne 941).
Donc DHN somme **DÉJÀ** 4 couches d'heure :
- `arcScore` — **directions par arc solaire** (dirASC/dirMC → corps+angles natals, cap 35) ;
- `progScore` — **progressions secondaires** (`countProgHits`) ;
- `srScore` — **retour solaire** (srASC/srMC) ;
- `transitScore` — **transits lents sur angle** (v6.8 : Saturne/Uranus/Neptune/Pluton,
  conj/opp/carré, orbe 1°, dédup 1/planète-angle, ×0.5). **⇒ le « transit lent » que
  j'ai présenté comme absent est DÉJÀ dans DHN.** Nuance mineure : DHN n'y met pas
  Jupiter/Nœud (PREV oui), mais le cœur du levier est présent.

**Seuls DEUX leviers sont réellement absents** : (1) directions primaires (DP),
(2) éclipse mondaine conj un angle natal.

### TEST DÉCISIF — DP a-t-il une valeur MARGINALE sur la vraie baseline ? NON.

Proxy de la baseline DHN = `progTr` (prog+transit ; arc/sr non modélisés mais même
famille). Question : ajouter DP améliore-t-il ?

| Estimateur | TRAIN pct/err | TEST pct/err | ALL pct/err |
|---|---|---|---|
| `progTr` (proxy baseline DHN) | 44 % / 43 min | 51 % / 40 min | 49 % / 42 min |
| `progTr + DP` | 46 % / 48 min | 57 % / 37 min | 50 % / 42 min |

**VERDICT DP : NO-GO.** DP n'apporte **aucun gain marginal** par-dessus une baseline
contenant déjà le transit — il **dilue** (pct ⬆ = pire, err stable/pire). Le « gain
progDp 20 min » n'existe que face à `prog` seul (strawman). Corollaire général confirmé :
**empiler une couche de plus dans la somme DHN (déjà 4 couches) dégrade.** `progTr` seul
(40-43 min) est déjà pire que `tr` ou `progDp` isolés (20-26 min) → DHN somme peut-être
déjà trop de couches pour le POINT.

### CE QUI RESTE VRAIMENT DÉPLOYABLE : l'ÉCLIPSE MONDAINE (confiance), rien d'autre

Le seul levier à la fois **absent de DHN** ET **informatif** est l'**éclipse mondaine
sur angle**, comme **CLASSEUR/CONFIANCE** :
- meilleur classeur mesuré (pct **17-22 %**) vs couches-score DHN (~39-49 %, ≈ hasard) ;
- s'allume dans **78 %** des cas (22/28), doctrinal (Brady, déclencheur daté) ;
- **usage conditionnel** : relever confiance + resserrer fenêtre annoncée quand elle
  s'allume. **JAMAIS sommée** dans `totalScore` (dilution prouvée).
- ⚠ Ce n'est PAS un pointeur de minute (err 39-50 min : plusieurs éclipses = plusieurs
  zones). C'est un **signal de confiance/fenêtre**, pas d'heure exacte.

**État net** : DHN est un moteur MATURE (5 couches, nombreux essais versionnés rejetés
v6.1/v6.5/v6.8) proche de son plafond sur le POINT. Le seul ajout défendable est la
**couche éclipse-mondaine = confiance/fenêtre** (nouvelle, conditionnelle, non fusionnée).
DP = NO-GO (déjà couvert par arc + redondant). Re-ranker fusionné = NO-GO.

### TEST DÉCISIF #2 — DP vs ARC SOLAIRE à armes égales (SWAP, pas ajout) — 2026-07-12

Question posée par l'utilisateur (doctrinalement fondée) : les **directions primaires**
sont réputées **plus solides** que l'**arc solaire**. Donc la bonne question n'est pas
« ajouter DP » mais « **remplacer l'arc solaire par DP** ». Modélisation d'une couche
arc solaire (`arc` = promisseur natal dirigé de `progSun−natalSun`, même filtre promisseur
que DP) et comparaison en swap dans la pile.

| Estimateur | TRAIN pct/err | TEST pct/err | ALL pct/err |
|---|---|---|---|
| **`progTrArc`** (prog+transit+**arc** ≈ DHN réel) | **33 % / 35 min** | **34 % / 25 min** | **34 % / 31 min** |
| `progTrDp` (swap arc→**DP**) | 46 % / 48 min | 57 % / 37 min | 50 % / 42 min |
| arc (standalone) | 48 % / 51 min | 31 % / 18 min | 44 % / 37 min |
| dp (standalone) | 46 % / 32 min | 58 % / 34 min | 51 % / 34 min |

**VERDICT : l'arc solaire BAT DP dans la pile DHN, nettement et constamment** (progTrArc
34 %/31 min vs progTrDp 50 %/42 min, train+test+all concordants). **Remplacer l'arc par
DP régresserait DHN.**

**Position doctrinale vs empirie (réponse honnête à l'utilisateur) :**
- **Doctrine** : oui, les directions primaires (Ptolémée, Placidus, Morin) sont la
  technique prédictive **historiquement première et la plus estimée** ; l'arc solaire est
  une **simplification du XXᵉ s.** (tous les points avancent du même arc). *En principe*,
  DP > arc solaire. **L'utilisateur a raison sur la doctrine.**
- **Empirie (DHN)** : à la **résolution de scan de DHN** (grille ~5-6 min, orbe tolérant),
  la **sensibilité-rasoir de DP (1° ≈ 4 min de temps)** est **floutée** — exactement ce qui
  fait sa force devient inexploitable en scan grossier. À l'inverse, la propriété « tous
  les points bougent du même arc » de l'arc solaire est **plus robuste** pour *classer* une
  fenêtre de 140 min. Résultat : **arc ≥ DP dans CE pipeline**. Le choix historique de DHN
  (arc solaire) est donc **empiriquement justifié** à sa résolution.
- **Nuance** : ceci ne réfute pas DP *en principe* (lecture de thème à l'heure exacte, avec
  promisseur/significateur et clé Naibod/Ptolémée identifiés). Ça montre que DP **n'est pas
  exploitable comme couche de scan** dans DHN. Pour exploiter DP il faudrait une **2ᵉ passe
  fine** (grille 1 min) autour d'un slot déjà cerné — chantier lourd, hors périmètre, ROI
  incertain (le gain resterait borné par la fenêtre éclipse).

**Conclusion inchangée et renforcée** : DP = NO-GO (pas seulement redondant — **inférieur**
à l'arc qu'il remplacerait, à la résolution DHN). Le seul levier neuf ET utile reste
l'**éclipse mondaine en confiance/fenêtre**.

### TEST DÉCISIF #3 — l'éclipse-confiance au niveau PRODUIT : NO-GO (2026-07-12)

Avant d'écrire une ligne de code, mesure produit de la couche éclipse-confiance sur les
28 cas AA (`dhn-phaseB-hour.mjs`, métrique = la **bande resserrée retient-elle la vraie
minute ?**). Gate : rétention ≥ 85 % ET largeur ≤ 60 min.

| Bande | largeur médiane | rétention (ALL / TEST) |
|---|---|---|
| UNION (ecl>0) | 60-69 min | **59 % / 50 %** |
| STRONG (ecl ≥ ½max) | 48-51 min | **36 % / 50 %** |
| **HIGH (corroboration ≥ 2)** | **9 min** | **33 % / 0 %** |

**VERDICT : NO-GO.** Le percentile 17-22 % (bon classeur *moyen*) **ne se traduit pas**
en fenêtre fiable *par cas* : l'éclipse tombe sur le bon angle ~55-60 % du temps, sinon
elle allume une fausse bande. La corroboration ≥ 2 produit de la **fausse précision**
(9 min « confiants » mais justes 0-33 %). Réfuté sur données hors échantillon. Spec
`SPEC-ECLIPSE-MONDAINE-CONFIANCE-DHN-2026-07-12.md` passée en 🔴 NO-GO **sans code**.

### 🏁 SYNTHÈSE FINALE (toutes techniques testées) — DHN est à son plafond

Après exploration exhaustive (DP, arc solaire, progressions, retour solaire, transit lent,
éclipse mondaine, fusion, rank-fusion, corroboration ; split train/test ; 28 cas AA ;
mesures classement ET produit) :

| Technique | dans DHN ? | verdict mesuré |
|---|---|---|
| Arc solaire, progressions, retour solaire, transit lent | ✅ déjà là | pile mature, choix validés empiriquement |
| Directions primaires (DP) | ❌ | NO-GO — **inférieures à l'arc** à la résolution DHN |
| Éclipse mondaine (confiance/fenêtre) | ❌ | NO-GO — rétention 33-59 %, fausse précision |
| Re-ranker / fusion (toute forme) | — | NO-GO — ≈ hasard, dilution (2 familles) |

**Aucun levier candidat n'est déployable.** DHN est **empiriquement à son plafond** pour la
résolution horaire automatique — ce qui **concorde avec la doctrine** (la rectification fine
relève du jugement expert, pas d'un score sur questions+dates). Le produit honnête reste :
**signe (top-3 ~88 %) + fenêtre (~2 h) + confiance issue du questionnaire**, sans promesse
de minute. Cette étude fait **référence** (anti-drift) : ne pas rouvrir ces pistes sans un
mécanisme passant le gate hors échantillon.

### TEST DÉCISIF #4 — L'ENTONNOIR (arc rideau 1 → DP/transit/éclipse rideau 2) : NO-GO honnête (2026-07-12)

Demande utilisateur explicite : tester l'**entonnoir** doctrinal — arc solaire (robuste) en
premier rideau pour resserrer, puis DP/transit/éclipse en passe fine dans la zone. J'ai en plus
répliqué la **vraie règle de convergence PREV** (`DESIGN-CONVERGENCE-DP-TRANSIT-2026-07-08.md`) :
promesse (DP ou progression) + déclencheur (transit lourd OU éclipse) sur le **MÊME angle**
(`convF`), au lieu de sommer les couches.

**⚠ Leçon de méthode (intégrité)** : une première mesure donnait arc→éclipse = 23 min (ALL) /
14 min (TEST), *meilleur que DHN*. **C'était un biais** : mon `argmax` cassait les égalités en se
rapprochant de la vraie minute. Corrigé en tie-break **neutre** (centre de zone, aucun peek) :

| Entonnoir (tie-break NEUTRE) | ALL 28 | TEST 10 |
|---|---|---|
| DHN actuel (arc+prog+transit, seul) | 31 min | 25 min |
| arc → éclipse | 31 min | 22 min |
| arc → progDP | 32 min | 16 min |
| arc → convergence fidèle PREV | 28 min | 18 min |
| progTrArc → transit | 24 min | 26 min |
| progTrArc → progDP | 25 min | 20 min |

**Aucun entonnoir ne bat DHN de façon robuste** (~24-32 min partout, dans le bruit sur n=28).

**LE POURQUOI, TANGIBLE (réponse à « pourquoi le cumul ne marche pas »)** — les surfaces de
score sont des **PLATEAUX, pas des pics**, et il y a un **arbitrage de fer rétention ⇄ finesse** :

| Couche | largeur du « haut » | retient la vraie minute |
|---|---|---|
| prog+transit+arc (≥½max) | **122-126 min** (≈ toute la fenêtre) | 89-100 % |
| arc (≥½max) | 92-95 min | 71-90 % |
| éclipse large (ecl>0) | 60-69 min | 50-59 % |
| éclipse serrée (≥½max) | 48-51 min | 36-50 % |
| éclipse corrob≥2 | **9 min** | **0-33 %** |

Ce qui **retient** la vérité (89-100 %) a un plateau ≈ fenêtre entière → **ne resserre pas**. Ce
qui **resserre** (9 min) **rate la vérité 2 fois sur 3**. Cause physique : un angle bouge ~1°/4 min
et les orbes valent 1-2° → **chaque contact s'étale sur ~15-30 min** ; avec plusieurs
événements × plusieurs angles, ces bandes se **chevauchent en plateaux ~1 h**, dont le maximum
global tombe à ±20-30 min de la vérité au mieux, souvent sur un chevauchement fortuit.
**Cumuler des techniques AJOUTE des bandes → plateau plus large/plat, jamais un pic plus fin.**
C'est de l'astronomie (vitesse d'angle × orbe), pas un manque de code — et c'est exactement
pourquoi la doctrine réserve la rectification fine au **jugement expert** (qui tranche *quel*
chevauchement est réel pour CE thème ; un argmax global ne le peut pas).

**Audit PREV complet (réponse à « a-t-on tout exploité ? »)** : les techniques PREV
**sensibles à l'heure** (donc utiles pour l'heure) sont uniquement celles qui touchent un
**angle** : DP→angle, transit→angle, éclipse→angle, progression→angle, arc→angle. **Toutes
testées.** Les autres (profections, seigneur de l'année, firdaria, lots, étoiles fixes sur
planètes) ne dépendent de l'heure que via la **maison/le signe** → elles aident le **SIGNE**
(déjà couvert par le questionnaire+scorer DHN), pas la minute. Même API privée
(`46.225.174.155:8000`) : DHN utilise déjà `/progressions`, `/transits`,
`/progressions/eclipses` ; le seul endpoint PREV en plus est `/directions` (DP) — testé, plateau
lui aussi. **Aucune API ne change la physique vitesse-d'angle × orbe.**

**VERDICT : NO-GO honnête sur l'entonnoir automatique.** Le plafond n'est pas un manque de
techniques : c'est la **résolution intrinsèque** (~±20-30 min) d'un argmax multi-événements sur
des angles. Ce qui reste **vrai et exploitable** : l'éclipse mondaine est un bon *classeur de
FENÊTRE* (met la bonne zone dans le top ~18 %) — utile pour **resserrer la fenêtre affichée**,
jamais pour afficher une minute.

### TEST DÉCISIF #5 — Trutine d'Hermès (épok prénatale) : NO-GO (2026-07-12)

Seul levier d'heure de principe DIFFÉRENT (non-angle, non-événementiel) : Lune à l'épok
(naissance − 273 j, épok « régulier » Ptolémée/Hermès) = ASC ou DSC natal. Implémenté (Lune
via `/western/planets` — `/transits` ne renvoie pas la Lune), tie-break neutre, 28 cas.

| | ALL 28 | TRAIN 18 | TEST 10 |
|---|---|---|---|
| percentile vraie minute | **61 %** | 55 % | 66 % |

**Percentile > 50 % = PIRE que le hasard.** L'épok ne retrouve pas l'heure (Lune floue à
~0,5°/h + heure d'épok inconnue → bruit). Conforme à la réputation de fragilité. NO-GO.

### TEST DÉCISIF #6 — Critère de COUVERTURE (doctrine « 80-90 % des events résonnent ») : le plafond est un goulot DATA (2026-07-12)

Méthodo utilisateur (texte 2026-07-12), point 5 : l'heure juste doit « résonner » avec 80-90 %
des événements (critère **conjonctif** = chaque event a ≥1 contact sur un angle), pas maximiser
une somme. Testé (métrique `cov` = nb d'events avec ≥1 hit toute technique).

| Critère | Orbes larges (1,5-2°) | Orbes serrés (0,5-1°, « à 1° près ») |
|---|---|---|
| Couverture à la VRAIE minute | **83 %** ✓ (doctrine confirmée) | 64 % (sous le seuil) |
| Largeur zone couverture-MAX | 114 min (≈ fenêtre) | **47 min** (resserre) |
| Zone retient la vraie minute | 93 % | 57 % (perdue 43 %) |

**Double lecture capitale :**
1. **La doctrine est JUSTE** : à la vraie heure, ~83 % des events résonnent (= « 80-90 % »). ✓
2. **Mais le même 80-100 % est atteint sur ~±1 h** (zone couverture-max ≈ fenêtre entière) → le
   critère **valide une FENÊTRE, pas une minute**, tant que les orbes sont larges.
3. **Resserrer les orbes narrows la zone (114→47 min) MAIS** avec seulement **3-6 events/personne**
   la couverture vraie chute à 64 % et on perd la vérité 43 % du temps → **trop peu d'événements
   pour l'exactitude**.

**CONCLUSION (non-défaitiste, sourcée) : le plafond n'est PAS un manque de technique** (les 4 de
la doctrine — transits, arc solaire, progressions, DP — sont TOUTES implémentées sur les angles,
+ éclipse mondaine + Hermès testés) **ni d'API** (mêmes endpoints que PREV). **C'est un goulot de
DONNÉES** : la rectification fine (expert) exige (a) des contacts EXACTS « à 1° près » ET (b)
**10-20 événements** exacts, personnels, datés (les 4 catégories du point 1). Avec 3-6 events,
l'exactitude laisse des trous. **Le levier pour pousser la finesse = densité d'événements
sourcés**, exactement ce que dit le point 1 de la doctrine — pas une nouvelle technique.

**Test décisif à faire (data-driven)** : sourcer **15-20 événements exacts** sur 2-3 personnes AA
et re-mesurer la couverture orbes-serrés → attendu si l'hypothèse tient : couverture vraie
≥ 80 % ET zone couverture-max < 30 min ET rétention ≥ 85 %. C'est le seul chemin mesuré vers la
minute.

### TEST DÉCISIF #7 — Densité d'événements RÉFUTÉE comme levier de finesse (2026-07-12)

Hypothèse du #6 exécutée. 3 cas **AA** ultra-documentés, événements EXACTS sourcés/vérifiés web
(Astro-Databank + presse), ASC recoupé (tz validé) :

| Cas | ASC (vérifié) | # events exacts |
|---|---|---|
| Marilyn Monroe | Lion 13° | **15** |
| Muhammad Ali | Lion 19° | **17** |
| Angelina Jolie | Cancer 29° | **10** |

Scripts : `SITE/scripts/_enprat/dhn-datatest-asc.mjs` (vérité ASC) →
`dhn-phaseB-hour.mjs --cases=dhn-datatest-computed.json --only-computed` (couverture, cache
réutilisé entre orbes). Balayage d'orbes :

| Critère (médiane 3 cas) | orbe 1,5° | orbe 1,0° (« à 1° près ») | orbe 0,5° |
|---|---|---|---|
| Couverture à la VRAIE minute | 67 % | 50 % | 50 % |
| Largeur zone couverture-MAX | 84 min | 51 min | **3 min** |
| Zone-MAX retient la vraie minute | 1/3 | 1/3 | **0/3** |

Détail orbe 0,5° : Monroe cov@vrai **20 %** (3/15), pic 93 % ailleurs ; Ali 59 % (10/17), pic
94 % à 1 min FAUSSE ; Jolie 50 % (5/10), pic 90 % à 54 min de la vérité.

**HYPOTHÈSE #6 RÉFUTÉE — trois constats verrouillés :**
1. **Plus d'événements BAISSE la couverture-à-la-vraie-minute** (83 % avec 3-6 events au #6 →
   67 % avec 10-17 events ici, orbe large). Logique : un vrai thème n'a PAS tous ses événements
   sur un angle par aspect majeur ; plus on en ajoute, plus il y a de « trous ». Le 80-90 %
   doctrinal est un **artefact humain** (vocabulaire de contacts bien plus large — aspects
   mineurs, planète-planète, cuspides des 12 maisons, mi-points, antisces, étoiles fixes,
   directions converses — + biais de confirmation : l'astrologue s'arrête quand ça colle).
2. **Resserrer les orbes resserre la zone (3 min !) mais la place TOUJOURS au mauvais endroit**
   (0/3). L'argmax de couverture n'est pas piqué sur la vérité : il est bruité.
3. **Application Harry Kane (heure inconnue, 8 events exacts, `dhn-kane-apply.mjs`)** : la
   couverture **sature à 8/8 pour les 12 signes** — l'union de 5 techniques sur 2-3 angles est si
   permissive qu'*aucune* fenêtre ascendante n'est exclue. Couverture = **0 pouvoir discriminant**.
   Le signal fin (convergence fidèle) pointe faiblement Taureau 23:36 puis Cancer 03:36, mais
   #7-pt.2 dit qu'on ne peut pas s'y fier.

**VERDICT FINAL (data-driven, non-défaitiste) :** le plafond de DHN n'est ni un manque de
technique (7 testées sur les angles) ni d'API (mêmes endpoints que PREV) ni de données
d'événements (10-17 exacts ne suffisent pas). C'est la **résolution intrinsèque** d'un argmax
angle × orbe, plus le fait que la rectification « à la minute » repose sur un vocabulaire de
contacts non-falsifiable propre à l'expert humain. **Livrable robuste et honnête = SIGNE
ascendant (top-3 questionnaire DHN ~88 %) + fenêtre ~2 h**, jamais une minute certifiée.

Fichiers : `SITE/scripts/_enprat/dhn-datatest-asc.mjs`, `dhn-datatest-computed.json`,
`out/_datatest-cov-{05,1,15}deg.txt` ; `dhn-kane-apply.mjs`, `out/_kane-apply.{txt,json}`.

---

## TEST DÉCISIF #8 — DÉCOUPLAGE signe/heure : le rerank astro DÉGRADE le SIGNE (2026-07-12)

Après le NO-GO minute (#1→#7), pivot sur la fiabilité du **SIGNE** (métrique produit). Constat
d'entrée : `top-1 55-65 %` mais `top-3 88 %` → le bon signe **est** dans les 3, mal classé #1.

### Diagnostic — l'astro n'aide pas le SIGNE, il le pollue

Le nœud `Resultat final1` classait les signes par `signScoreFinal = scoreMean_topK(astro) +
(Q_PRIOR-1)·wMean(questionnaire)`. Or :

- **Preuve indépendante** (tests #1-#7) : l'astro ne discrimine PAS le signe (couverture sature,
  DP & Phase-0 NO-GO sur signes voisins).
- **Audit `techBreakdown` de l'équipe** (BENCHMARK v6.4, l.1032-1039) : les **progressions**
  « mentent » 3/5 cas, poussant le mauvais signe de **+4 à +10 pts** (Chirac Verseau→rang 7 par
  prog Gémeaux +10 ; Delon ; Napoléon). C'est l'astro qui éjecte le bon signe du top-3.
- **Sweep `Q_PRIOR`** (v6.4) : QP=3 donnait top-3 88 % en simu MAIS instable en réel (de Gaulle
  bascule par 0.46 pt) — car il **gardait** `scoreMean_topK` (bruit ±5-10 pts) DANS le classement.

### De-risk 16 cas (batch1 lisibles + batch2 politiques, données documentées)

| Métrique (16 cas) | Questionnaire seul (découplé) | Moteur rerank (QP=2) |
|---|---|---|
| top-1 | 9/16 (56 %) | 8-9/16 (50-56 %) → **égalité** |
| **top-3** | **14/16 (88 %)** | 11-12/16 (69-75 %) |

Le gain top-3 vient des cas durs (Chirac Q#2, Delon Q#3 : le questionnaire les garde en top-3,
l'astro les enterre rang 7/8). Sur batch1 « lisible », les deux sont à 88 % (pas de perte).

### Le fix — `SIGN_FROM_Q_ONLY` (toggle réversible)

`FRA/DHN/N8N DHN` : le classement des SIGNES se fait désormais par `wMean` (questionnaire,
quasi-déterministe → stable), l'astro ne tranchant que les **égalités strictes**. La Phase A
éclipse (qui reclassait le signe) est coupée sous le toggle. **L'astro reste pleinement actif
pour l'HEURE** (`bestByAsc` + éclipse Phase B). Différence clé avec QP=3 : on **retire**
`scoreMean_topK` du classement (plus de bruit), au lieu de juste sur-pondérer Q.

### Validation LIVE preprod (batch1, moteur réel, lean 5-Q) — `dhn-preprod-lean-ab.mjs`

`dhnMetrics.questionnaire.rankedTop5` expose le classement questionnaire → mesure directe
rerank vs découplé sur le même run (moteur actuel) :

| Cas | rerank #1 | découplé #1 | vrai ASC |
|---|---|---|---|
| Bardot | Lion (#2) | **Sagittaire ✓** | Sagittaire |
| Saint Laurent | Gémeaux (#2) | **Verseau ✓** | Verseau |
| Gainsbourg | Poissons ✓ | Poissons ✓ | Poissons |
| Hugo | Scorpion ✓ | Scorpion ✓ | Scorpion |
| de Beauvoir | Sagittaire ✓ | Sagittaire ✓ | Sagittaire |
| Deneuve | Capricorne ✓ | Capricorne ✓ | Capricorne |
| de Gaulle | Balance (#3) | Balance (#2) | Balance (biais input Lion, échec top-1 des 2) |
| Proust | ✗ (12) | ✗ (12) | Bélier (ASC invisible, intrinsèque) |

| | top-1 | top-3 |
|---|---|---|
| **Moteur actuel (rerank astro)** | **4/8 (50 %)** | 7/8 (88 %) |
| **Découplé (signe = questionnaire)** | **6/8 (75 %)** | 7/8 (88 %) |

**+25 pts top-1 en direct, zéro régression** (Bardot & YSL récupérés ; aucun cas où l'astro
faisait mieux). Cohérent avec l'offline. Le top-3 batch1 est déjà saturé → le +13 pts top-3
est un phénomène batch2 (offline + audit techBreakdown).

### Confirmation LIVE post-déploiement (run `mri31lrk`, toggle réellement actif)

Toggle déployé en preprod (`Resultat final1`) via `dhn-deploy-preprod.mjs`, puis re-run complet :

| | top-1 | top-3 |
|---|---|---|
| Moteur **avant** toggle (run `mri2c01w`) | 4/8 | 7/8 |
| Moteur **après** toggle (run `mri31lrk`) | **6/8** | 7/8 |
| Découplé (référence questionnaire) | 6/8 | 7/8 |

Par cas post-toggle : Bardot #1, Gainsbourg #1, YSL #1, Beauvoir #1, Hugo #1, Deneuve #1,
de Gaulle #2, Proust manqué. **Le moteur = le découplé** (le classement suit `wMean`) →
**+25 pts top-1 confirmés en live, zéro régression.** Bardot & YSL passent bien de #2 à #1 ;
de Gaulle de #3 à #2. Objectif atteint.

### Statut — LIVRÉ EN PROD (2026-07-12)

- Toggle **déployé et validé en preprod** (top-1 6/8), puis **déployé en PROD** (`uA6jTzmayt2OXByY`,
  node `Resultat final1`, `SIGN_FROM_Q_ONLY=true`). Vérif post-PUT OK.
- **Backup GitHub poussé** : `FRA` branche `backup/workflows-prod-2026-07-12`, commit `f378d09`
  (snapshot `_workflow-backups-prod/2026-07-12/DHN-PROD.json` contient le toggle ✓).
- **Rollback** : `FRA/DHN/prod-backups/RESULTAT-FINAL1-prod-PRE-*.js` (local, gitignore car clé en clair)
  ou remettre `SIGN_FROM_Q_ONLY=false`.

> ⚠ **Drift miroir découvert au déploiement** : `FRA/DHN/N8N DHN` (miroir) pointait l'endpoint
> éclipses sur `http://46.225.174.155:8000` **sans clé**, alors que la PROD utilise
> `https://api.spikka.eu` **avec** clé. Déployer le miroir tel quel aurait cassé l'appel éclipses.
> → déploiement prod fait en **transform-from-prod** (`dhn-deploy-prod.mjs` : greffe le toggle sur
> le code prod live, préserve l'endpoint). **La preprod, elle, a reçu le miroir drifté** (endpoint
> éclipses cassé) — sans impact sur la mesure SIGNE (toggle coupe la Phase A éclipse), mais à
> **réconcilier** avant toute mesure HEURE en preprod.

Fichiers : `FRA/DHN/N8N DHN` (toggle), `SITE/scripts/_enprat/dhn-deploy-prod.mjs` (transform-from-prod),
`dhn-deploy-preprod.mjs`, `dhn-preprod-lean-ab.mjs` (capture `rankedTop5`),
`out/dhn-lean-ab-{mri2c01w,mri31lrk}.json`, `dhn-kane-preprod-run.mjs` + `out/dhn-kane-preprod-mri3krik.json`.

### Application Kane post-toggle (heure inconnue, sans vérité-terrain)

Kane (28/07/1993 Leytonstone) via webhook preprod post-toggle : **Lion #1 robuste** (lean ET full),
top-3 Lion/Scorpion/Capricorne, confiance signe « Très faible » (questionnaire rempli via infos
publiques → honnête). Heure 06:40 « Forte » = métrique moteur, mais **indicative** (validation AA :
l'heure n'est jamais certifiée). Lion à l'ASC ≈ lever du soleil pour un Soleil fin-juillet (cohérent).
