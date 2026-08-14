# DHN — Bilan : l'heure fine n'est pas établie, l'ascendant l'est

> Statut : 🟢 ACTIF
> Lié à : `BILAN-SPRINT-A-POLARIS-FALSIFICATION-2026-08-14.md`,
> `LECTURE-PREDICTION-III-DUAL-TEST-2026-08-14.md`,
> `SPEC-QUESTIONNAIRE-ASC-ALLEGE-2026-07-12.md`
> Date : 2026-08-14

## Ce qui a été mesuré

8 cas AA certifiés passés en preprod avec le protocole « fenêtre informée » (le
client donne une fourchette autour d'une heure d'état civil) et des
questionnaires sincères rédigés d'après la biographie, jamais d'après
l'ascendant attendu.

Outillage, tout en lecture seule sur les runs sauvegardés :

| Script | Ce qu'il mesure |
|---|---|
| `dhn-audit-confiance.mjs` | le succès ASC est-il une prédiction ou un effet de la fenêtre ; la confiance annoncée sur l'heure prédit-elle l'erreur |
| `dhn-check-timezone.mjs` | décalage appliqué par le moteur contre l'heure légale historique (base IANA) |
| `dhn-diag-pic.mjs` | quelle couche déplace le pic ; pouvoir discriminant de chaque couche sur la fenêtre |
| `dhn-ab-classement.mjs` | A/B hors ligne de plusieurs scores, **contre modèle nul** |

## Résultat principal : l'heure fine est au niveau du hasard

| Score | Erreur moyenne | Rang relatif du créneau vrai | Écart au modèle nul |
|---|---|---|---|
| Total actuel | 36 min | 46 % | −0,37 σ |
| Total − rs | 32 min | 47 % | −0,32 σ |
| arc + prog | 37 min | 56 % | +0,54 σ |
| arc seul | 29 min | 56 % | +0,56 σ |
| prog seul | 25 min | 55 % | +0,45 σ |
| **tirage au hasard dans la même fenêtre** | **38 min** | 50 % | — |

Aucune variante ne sort du bruit. Le meilleur rang relatif est à **0,37 σ** du
modèle nul sur 7 cas exploitables : indécidable.

Le piège à ne pas répéter : `prog seul` affiche la meilleure **erreur moyenne**
(25 min contre 36) mais un **rang moyen pire** (55 % contre 46 %). Les deux
métriques se contredisent parce que l'erreur moyenne, sur 7 cas, est portée par
un ou deux d'entre eux. Reponderer une couche sur cette base reproduirait à
l'identique les quatre NO-GO du moteur PREV.

## Ce qui reste solide : l'ascendant

| Mesure | Valeur |
|---|---|
| ASC top-1 correct, cas où plusieurs signes étaient réellement en compétition | **6/8** |
| Cas où la fenêtre n'offrait qu'un seul signe (succès non significatif) | 1 (Bardot) |
| Échecs top-1, tous deux rattrapés en top-3 | Hugo, Proust |

Proust confirme la limite intrinsèque déjà documentée : un ascendant Bélier qui
ne se manifeste ni en persona ni en physique reste introuvable au questionnaire.
Hugo tombe dans le biais Lion/Balance de sa persona publique.

**Conséquence produit** : on vend l'ascendant (et la fenêtre), avec une heure
présentée comme estimation. Jamais une heure sèche.

## Défauts structurels relevés

**1. La couche `rs` ne discrimine rien.** Les retours solaires pèsent le plus en
niveau — jusqu'à 48 points sur 117 chez Lennon — mais ne portent que **13 %** de
la variation d'un créneau à l'autre, avec une corrélation au total parfois
négative. Elle gonfle le total et la marge de confiance affichée sans informer
sur l'heure. À retirer du **calcul de confiance**, pas nécessairement du rapport.

| Couche | Part de la variation (moyenne 8 cas) |
|---|---|
| prog | 48 % |
| arc | 38 % |
| rs | **13 %** |

**2. Le libellé de confiance sur l'heure ne discrimine pas.** La marge numérique
brute est faiblement informative (corrélation −0,689 avec l'erreur réelle,
n = 9), mais les libellés se recouvrent : « Forte » contient un écart de 39 min,
« Moyenne » contient le meilleur cas à 5 min. Le seuil est mal placé, pas le
score. Corollaire mesuré : le pic est **toujours** unique et net (un seul créneau
à moins d'un point du sommet) — la netteté du pic ne dit donc rien de sa
justesse, et c'est précisément ce que la confiance actuelle mesure.

**3. La confiance sur le signe peut se tromper avec assurance.** Elle est honnête
quand elle ne peut pas juger (« Inconnue » sur les fenêtres à signe unique), mais
Proust ressort « Forte » avec un ascendant faux.

**4. Fuseau horaire des naissances anciennes.** Le moteur applique **+60 min** à
de Gaulle (1890) là où l'heure légale française était UT+0h09m21s : **51 minutes**
d'erreur. Il est en revanche correct sur Paris 1908 (+9m21s) et sur l'heure d'été
de septembre 1934. Le seuil de bascule est entre 1890 et 1908.

Portée à peser honnêtement : un client vivant est né après 1911, donc le
**produit** n'est quasiment pas concerné. C'est notre **banc de mesure** qui
l'était, puisqu'il est bâti sur des personnages historiques. Le runner corrige
désormais en exprimant l'heure vraie dans la convention du moteur.

**5. Deux défauts de l'instrument.** La fenêtre est bornée à 23H55 au lieu de
passer minuit — ce qui a invalidé Proust, dont l'heure vraie tombe à 00:21 dans
la convention du moteur. Et la largeur de la fenêtre change la réponse : de
Gaulle donne 03:20 avec ±60 min, 05:30 avec ±90 min. Le paysage de score comporte
donc plusieurs sommets comparables à quelques heures d'écart.

## Le test du modèle direct — le prérequis qui avait été sauté

Toutes les tentatives précédentes attaquaient l'**inversion** : « quelle heure rend
les directions cohérentes avec les événements ? ». Personne n'avait vérifié le
prérequis logique, le **modèle direct** :

> l'heure de naissance étant **connue et exacte**, les directions primaires
> tombent-elles sur les dates des événements mieux que sur des dates tirées au
> hasard dans la même vie ?

Si non, inverser cette fonction est sans espoir : on inverserait une fonction sans
information. Mesuré sur les 8 cas AA, avec l'heure d'état civil comme vérité et
300 dates nulles par cas (`marr_forward_test.py`) :

| Configuration | directions/an | écart médian réel | écart médian nul | < 3 mois réel | < 3 mois nul |
|---|---|---|---|---|---|
| narrateur (tout) | 3,0 | 1,2 mois | 1,4 mois | **84 %** | **77 %** |
| 5 aspects, angles | 1,0 | 4,0 mois | 3,4 mois | 45 % | 45 % |
| conj+opp, 12 cuspides | 0,8 | 4,2 mois | 3,8 mois | 34 % | 42 % |
| conj+opp, angles | 0,3 | 6,1 mois | 5,3 mois | 27 % | 31 % |
| conj+opp, angles, directes | 0,2 | 7,9 mois | 5,9 mois | 11 % | 29 % |
| symbolique, conj+opp | 0,3 | 5,1 mois | 4,6 mois | 31 % | 33 % |

**Aucune configuration ne distingue les vrais événements du hasard.**

Deux lectures s'imposent :

1. **La densité rend la méthode infalsifiable.** À 3 directions par an, il en tombe
   une tous les quatre mois : n'importe quelle date a une direction « exacte » à
   côté. Les 84 % de coïncidences à moins de 3 mois du narrateur ne sont donc pas
   une preuve — le hasard en produit 77 %.
2. **Resserrer ne révèle rien.** S'il y avait du signal, durcir les critères
   tuerait les coïncidences fortuites en gardant les vraies : le rapport
   réel/hasard grandirait. Il ne grandit pas — les vraies disparaissent au même
   rythme que les fausses.

### Réserve à énoncer honnêtement

Le test a une limite de puissance : **1 minute d'erreur d'heure déplace une
direction de 3 mois** (l'angle horaire avance de 15°/h, la clé de Naibod de
0,9856°/an). Nos heures « vraies » sont des heures d'état civil arrondies à la
minute, donc porteuses de ±1,5 mois de flou directionnel, et nos dates
d'événements sont des dates légales dont la correspondance astrologique peut être
diffuse. Un signal faible pourrait être masqué.

Mais cette réserve n'explique pas le résultat : sur les configurations
restrictives, le réel est **moins bon** que le nul (7,9 mois contre 5,9). Ce n'est
pas un signal masqué, c'est une absence de signal.

## Corpus élargi — la question est tranchée

Les deux faiblesses de puissance du premier test ont été levées avec un corpus
reconstitué depuis les manifestes déjà audités du moteur PREV
(`prev-bench-baseline-100/150`), qui apportent rating Rodden, date d'événement
exacte et coordonnées (`aa_corpus.py`) :

- **événements instantanés uniquement** — mariage, naissance d'un enfant,
  accident, décès d'un proche. Écartés : carrière, santé, relocation, scandale,
  finance, dont le « moment » astrologique est discutable ;
- **heures d'état civil réelles** — sous-ensemble PREMIUM dont la minute n'est pas
  ronde (hors 00/15/30/45), signe d'un relevé effectif et non d'un arrondi ;
- **effectif** : 54 cas instantanés, dont 35 PREMIUM.

Modèle nul **apparié** : même personne, même type d'événement, même tranche d'âge
(± 15 ans), seule la date change. Fuseaux horaires calculés depuis les coordonnées
via tzdata, donc historiquement exacts (Paris UT+0h09 avant 1911, Mexico UT−6h37
en 1907, etc.).

### Le test de puissance, et c'est lui qui tranche

Deux configurations paraissaient prometteuses sur les 35 cas PREMIUM. En passant à
54 cas, leur z **baisse** au lieu de monter :

| Configuration | seuil | z sur 35 cas | z sur 54 cas | z attendu si l'effet était réel |
|---|---|---|---|---|
| symbolique, conj+opp | 1 mois | +1,64 | **+0,90** | ≈ +2,0 |
| conj+opp, 12 cuspides | 3 mois | +1,28 | **+1,00** | ≈ +1,6 |

Un effet réel grandit comme √n : ajouter 54 % de données devait multiplier z par
1,24. Il a été divisé. **C'est la signature d'une fluctuation, pas d'un signal.**
Sur 28 comparaisons (7 configurations × 4 seuils), aucune n'atteint 2 σ, et le
gate était fixé à 3 σ pour tenir compte de la multiplicité.

### Ce que ce résultat exclut, chiffré

Avec 54 événements, l'intervalle de confiance borne tout effet réel restant à
environ **13 points de pourcentage** de taux de coïncidence. Or la rectification
doit désigner **un** créneau parmi ~288 : cela exige un rapport de vraisemblance de
l'ordre de plusieurs centaines, pas un écart de 13 points sur un tirage à ~40 %.

Même en prenant la **borne haute** de l'effet qu'on ne parvient pas à détecter
(1,3× par événement), dix événements indépendants ne donneraient que 1,3¹⁰ ≈ 13×.
On reste à plus d'un ordre de grandeur du pouvoir discriminant nécessaire.

**La rectification par directions primaires ne peut pas retrouver une heure de
naissance. Ce n'est pas un manque d'outillage, de finesse d'orbe ou de puissance
statistique : l'information n'est pas là.**

## La doctrine des deux temps ne rattrape pas la méthode

Objection doctrinale légitime : une direction primaire ne produit pas l'événement
seule, elle **pose le décor** ; c'est un transit, une éclipse ou une lunaison qui
**déclenche** (Rushman, L577 + ch. 2, repris par Marr). Les tests ci-dessus ne
mesuraient qu'une moitié de la doctrine. Mesure de la doctrine complète
(`marr_trigger_test.py`, 35 cas PREMIUM, déclencheur = aspect dur d'un transitant
lent à 1°, fenêtre ±45 jours) :

| Ce qui est testé | réel | hasard | z |
|---|---|---|---|
| Déclencheur seul sur **angle** natal (ASC/MC) — dépend de l'heure | 86 % | 86 % | **−0,05** |
| Déclencheur seul sur **Soleil** natal — témoin, ne dépend pas de l'heure | 74 % | 70 % | +0,50 |
| Direction seule (conj+opp, 12 cuspides) | 40 % | 32 % | +0,96 |
| **Deux temps** — direction + déclencheur | 34 % | 28 % | **+0,86** |

**Le déclencheur est présent 86 % du temps, sur n'importe quelle date.** Avec
6 transitants lents × 3 aspects durs × 2 angles = 36 points d'aspect et une fenêtre
de ±45 jours, la condition est presque toujours satisfaite. Elle n'exclut donc
rien, et son z est nul (−0,05).

Conséquence : exiger un déclencheur réduit le taux réel et le taux du hasard **dans
la même proportion**. Le z de la doctrine complète (+0,86) est même légèrement
inférieur à celui de la direction seule (+0,96). Le conditionnement est un filtre,
pas une preuve.

### La raison de fond, et elle vaut pour toute couche qu'on ajouterait

Chaque couche invoquée est **quasi saturée** : 3 directions par an, un transit lourd
aux angles présent 86 % du temps. Faire converger deux quasi-certitudes ne crée
aucun pouvoir discriminant. Or désigner **un** créneau parmi 288 exige d'en
**exclure 287**. Les facteurs astrologiques, tels qu'utilisés ici, n'excluent
presque rien — c'est un problème d'information, pas de doctrine ni de code.

À noter, car la distinction est importante et la doctrine n'est pas en cause : la
convergence de couches **fonctionne** pour hiérarchiser des périodes à heure
**connue** — c'est le produit « temps forts » de PREV, mûr et audité. Elle échoue
seulement à hiérarchiser des **heures**, parce que les couches ne varient pas assez
avec l'heure.

### Ce que cela dit de « les autres y arrivent »

Les thèmes publiés par Marr (*Notable Nativities*, 106 vies) sont rectifiés **sur**
les événements : les directions y tombent juste par construction. Aucun cas publié
ne montre une heure inconnue retrouvée en aveugle, et la rectification d'Assad par
Starkman (16 h 43) n'est pas vérifiable puisque personne ne connaît l'heure vraie.

Ce n'est pas un procès fait à la tradition : c'est la nature de la revendication.
Une rectification est une **construction cohérente**, pas la récupération d'un fait
caché. Ce qui est vérifiable, c'est sa cohérence interne — pas son exactitude.

## Ce qui est mort, et ne doit pas être rouvert sans mesure nouvelle

| Piste | Cause de fermeture |
|---|---|
| Reverse-RAMC de Marr comme détecteur | percentile de l'heure vraie non significatif (Sprint A) |
| Dual Test comme validateur | 100 % des créneaux passent : l'Époque est un paramètre libre |
| « prog est la couche fautive » | ne porte l'écart que sur 4 cas sur 7 |
| Reponderer une couche pour gagner des minutes | aucune variante ne sort du modèle nul |
| Affiner l'orbe / le pas de balayage des directions primaires | le **modèle direct** lui-même ne distingue pas les vrais événements du hasard : il n'y a rien à affiner |
| **La rectification par directions primaires, sous toute forme** | mesurée sur 54 événements instantanés (35 à minute d'état civil réelle), 7 configurations doctrinales, modèle nul apparié : aucun z ≥ 2, et le z **baisse** quand l'effectif monte. Tout effet résiduel est borné à ~13 pp, soit un ordre de grandeur sous ce qu'exige le choix d'un créneau parmi 288 |

## Suites recommandées, dans l'ordre

1. **Aligner la promesse sur la mesure.** L'ascendant + la fenêtre sont le
   livrable ; l'heure est une estimation. C'est le seul levier qui ne dépend
   d'aucune découverte.
2. **Retirer `rs` du calcul de confiance** et replacer les seuils du libellé sur
   la marge réellement discriminante (arc + prog). Correctif d'hygiène de
   scoring, sans changement de doctrine.
3. **Retirer q13/q14/q15 du formulaire.** Fiabilités mesurées 0,24 / 0,23 / 0,13
   (le hasard est à 0,08), et le jeu réduit à 5 questions donne un top-3
   identique. La réduction avait été appliquée en local le 2026-07-12 mais n'est
   jamais partie : le fichier en contient toujours 10.
4. **Corriger les deux défauts de l'instrument** (fenêtre passant minuit ;
   sensibilité à la largeur documentée) avant toute nouvelle campagne.
5. **Élargir le corpus** si l'on veut trancher l'heure : 7 cas exploitables ne
   permettent de détecter que des effets énormes. Sans corpus plus large, toute
   conclusion sur l'heure restera indécidable.
6. **Ascendant-Lunar** : briefing prêt avec gate strict. À traiter comme
   expérience locale bornée, jamais mêlée à une livraison.
