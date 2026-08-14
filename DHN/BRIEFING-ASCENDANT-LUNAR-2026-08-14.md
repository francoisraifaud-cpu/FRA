# DHN — Briefing étape 2 : Ascendant-Lunar de Marr comme détecteur d'heure

> Statut : 🟢 ACTIF — briefing préalable, **aucun code écrit avant validation utilisateur**
> Lié à : `BILAN-SPRINT-A-POLARIS-FALSIFICATION-2026-08-14.md`, `LECTURE-PREDICTION-III-DUAL-TEST-2026-08-14.md`
> Date : 2026-08-14

## Pourquoi cette piste, et pourquoi elle seule

Deux pistes de *détection* sont déjà fermées, chacune par une mesure et non par une
impression :

| Piste | Cause de fermeture |
|---|---|
| Reverse-RAMC par directions primaires (Sprint A) | Le score au RAMC vrai n'est pas distinguable du bruit : percentile de l'heure vraie non significatif, y compris avec le signe d'ASC donné en oracle et en faisant varier le nombre d'événements. |
| Dual Test (règles 1 et 2) | **100 %** des créneaux candidats passent. L'Époque prénatale est un paramètre libre : pour toute heure fausse il existe une Époque qui satisfait la règle. Le test ajoute des degrés de liberté au lieu d'en retirer. |

L'Ascendant-Lunar est structurellement différent des deux : il ne comporte **aucun
paramètre libre**. Une fois l'heure de naissance posée, la longitude de l'Ascendant est
fixée, donc l'instant du retour lunaire sidéral est fixé, donc le thème de retour est
entièrement déterminé. Rien à ajuster, rien à choisir. C'est la seule raison pour
laquelle cette piste mérite encore d'être mesurée.

## Ce que dit Marr (verbatim)

*A. Marr, Prediction III, ch. « The Ascendant-Lunar Horoscope », p. 28-37.*

Sur la nature de la méthode et son rang :

> *« It is, after the rectification method with Primary Directions, the most reliable
> method for authenticating birth times within a few minutes of arc (of RAMC). »*

Sur la procédure de détection — c'est bien un détecteur, pas seulement un validateur :

> *« In all cases where the Ascendant-Lunars do not produce characteristic charts for
> corresponding events, it is possible to experiment with Ascendant positions (Lunars)
> for earlier or later birth times. This method of rectification does not need any
> trigonometrical knowledge but requires some caution and patience. »*

Sur la règle de lecture, réduite à deux points :

> *« Misinterpretation and false conclusions can be excluded from workable Lunars if
> these simple rules are observed: (a) Consider only those Luminaries and planets that
> are near the Angles of the chart. (b) Draw conclusions from the shape (structure) of
> the map, i.e. planets above or below the Horizon, accumulations in certain Quadrants,
> etc. »*

Sur le facteur d'amplification — **le chiffre décisif de tout ce briefing** :

> *« The Ascendant-Lunar may be compared to a magnifying glass, where the multiplier is
> 30 to 1, i.e. one minute of changed birth time corresponds to thirty minutes in the
> Ascendant-Lunar time (average). This is because the Ascendant moves 15' of arc in one
> minute of time and it takes the Moon 30 minutes in time to travel this 15' of arc. »*

> *« Even a difference of 5' of arc in the Ascendant's Longitude alters the Universal
> Time of an Ascendant Lunar by 10 minutes in time. Accordingly a difference of 15' of
> arc between the true Ascendant and the Ascendant originating from records, changes the
> U.T. and consequently the RAMC of our Ascendant-Lunar by 30 minutes. »*

Sur son propre taux de réussite — à lire avec précaution, voir plus bas :

> *« In order to confirm our research results, the author has used 15 rectified birth
> charts and, as the Ascendant-Lunars revealed, with only one failure. »*

## Spécification algorithmique

Entièrement déterminée, sans paramètre d'ajustement.

1. **Cible.** Longitude écliptique de l'Ascendant radical, corrigée de la précession
   entre la naissance et l'événement. Marr calcule explicitement `10° Capricorne 58'`
   (ASC radical) `+ 31'` (précession pour 37 ans) `= 11° Capricorne 29'`.
2. **Instant du retour.** Dernier instant, **avant** la date de l'événement, où la Lune
   atteint cette longitude cible. Marr prend le retour en vigueur au moment de
   l'événement (dans son exemple, entré en fonction 25 jours avant).
3. **Thème de retour.** Érigé pour cet instant. Marr utilise le lieu de l'événement
   (`RAMC BOSTON` pour Chappaquiddick).
4. **Variantes.** `DESC-Lunar` = même construction sur le Descendant radical.
   `Demi-Lunar` = érigée sur l'opposition de la Lune. À **ne pas** tester dans un
   premier temps : chaque variante ajoutée multiplie les chances de trouver un « hit »
   par hasard, ce qui est précisément le piège du Dual Test.
5. **Critère de lecture.** Un astre symboliquement approprié à l'événement se trouve
   près d'un angle du thème de retour.

### Deux points de spécification à trancher explicitement

**Le lieu.** DHN collecte les événements datés mais **pas leurs lieux**. On utilisera
donc le lieu de naissance. C'est une divergence assumée avec l'exemple de Marr, et elle
est sans effet sur la validité du test de falsification : changer de lieu applique une
**rotation constante** à tous les angles d'un cas donné, identique pour l'heure vraie et
pour tous les créneaux faux. Le classement relatif est donc préservé. En revanche cela
peut décaler le taux de réussite absolu, et il faudra s'en souvenir avant d'annoncer un
quelconque taux au client.

**La table symbolique.** C'est le seul endroit où du jugement s'introduit. Elle doit être
**figée avant** de regarder le moindre résultat, et reprise telle quelle de la table
d'événements déjà utilisée par le narrateur Marr (`MARR_EVENT_CUSPS`), sans retouche. Une
table ajustée après coup pour améliorer le score transformerait la mesure en
surapprentissage sur 8 cas.

## Le risque structurel, énoncé avant de coder

L'amplification 30:1 revendiquée par Marr est une lame à double tranchant, et il faut en
tirer les conséquences arithmétiques **avant** de coder, pas après :

- 1 minute d'erreur sur l'heure ⇒ 15′ d'erreur sur l'ASC ⇒ ~30 minutes de décalage de
  l'instant du retour ⇒ **~7,5° de rotation des angles** du thème de retour.
- DHN balaie 24 h sur une grille de 5 minutes, soit 288 créneaux. Entre deux créneaux
  voisins, les angles du retour tournent de **37,5°**.

Autrement dit, deux créneaux adjacents produisent des thèmes de retour **sans aucune
corrélation entre eux**. Sur 24 h, les angles font une trentaine de tours complets.

**Conséquence.** Cette méthode ne peut pas produire un paysage de score avec un pic
progressif ; elle produit un bruit blanc, dans lequel on espère une pointe isolée à
l'heure vraie. Il n'y a donc aucun gradient exploitable, et surtout : le meilleur de 288
tirages aléatoires se situe par construction au 99,65ᵉ percentile. Un « excellent score à
l'heure vraie » sur un cas isolé ne prouvera donc **rien du tout**. Seule la
reproductibilité **inter-cas** peut trancher.

C'est aussi ce qui doit faire lire la statistique « 15 thèmes, un seul échec » de Marr
avec prudence : elle porte sur des thèmes **déjà rectifiés** dont il connaissait l'heure,
et le critère de succès y est son propre jugement de « thème caractéristique ». Ce n'est
pas une mesure aveugle.

## Protocole de mesure

Identique dans l'esprit à celui qui a fermé les deux pistes précédentes — c'est
volontaire, pour que les résultats soient comparables.

1. **Corpus** : les 8 cas AA certifiés du benchmark DHN (heure connue, source AA stricte).
2. **Balayage** : les 288 créneaux de 5 minutes sur 24 h, pour chaque cas.
3. **Score par créneau** : pour chacun des événements datés du cas, construire
   l'Ascendant-Lunar et mesurer l'écart angulaire minimal entre un astre
   symboliquement approprié et un angle. Agréger sur les événements.
4. **Statistique** : rang (percentile) du score de l'heure vraie parmi les 288.
5. **Modèle nul** : distribution des rangs obtenus en substituant à la table symbolique
   des affectations astre↔événement tirées au hasard, pour mesurer le taux de base.
6. **Contrôle négatif obligatoire** : rejouer sur des dates d'événements aléatoires. Le
   signal doit **disparaître**. S'il subsiste, c'est un artefact de construction et non
   de l'astrologie.

## Gate, chiffré, arrêté à l'avance

Gate strict retenu par l'utilisateur :

> **GO** si le **rang médian** de l'heure vraie sur les 8 cas tombe dans le **top 10 %**
> des créneaux, **ET** si l'écart au modèle nul dépasse **2 σ**.

Ce gate n'est pas arbitraire : si la méthode était sans valeur, les 8 rangs seraient
uniformes et indépendants, et la probabilité que leur médiane tombe dans le top 10 % est
d'environ **0,5 %**. Une médiane dans le top 10 % n'est donc pas explicable par la chance,
là où un pic sur un cas isolé le serait entièrement.

Toute autre issue — y compris « prometteur mais juste en dessous » — est un **NO-GO**.
Les quatre NO-GO du moteur PREV ont tous commencé par un résultat tiède accepté comme
encourageant.

## Décision selon l'issue

| Issue | Suite |
|---|---|
| **GO** | Industrialisation : l'Ascendant-Lunar devient l'étage 2 du DHN, après le questionnaire (étage 0) et l'arbitrage astrologue du signe d'ASC. Livraison en fenêtre + confiance, jamais en heure sèche. |
| **NO-GO** | Gel définitif de la détection d'heure par Marr. Les trois pistes structurellement distinctes auront été mesurées et fermées. Le narrateur Marr (étape 1, déjà livré) reste le livrable, et il est honnête : il documente l'heure retenue sans prétendre l'avoir trouvée. |

Dans les deux cas, le résultat est publié chiffré dans un `BILAN-ASCENDANT-LUNAR-*.md`,
avec les tableaux bruts avant toute interprétation.

## Coût et périmètre

- Calculs **locaux uniquement** (Python + Swiss Ephemeris), sur les 8 cas AA.
- **Aucune** touche à l'API backoffice, **aucune** nouvelle route, **aucun** déploiement
  n8n pendant la phase de mesure.
- Rien ne part en preprod ni en prod avant que le gate soit franchi.
