# AUDIT DHN — Échec ASC hors top-3 (Bangalter / Sinclar)
> Statut : 🟢 ACTIF
> **Révisé 2026-08-14 (soir)** — trois conclusions de la première rédaction sont retirées :
> le « double échec Q + techniques » (les techniques ne votent pas sur le signe),
> « la plage récupère le bon signe » (test circulaire) et « exiger une plage » comme
> correctif de qualité. Le banc AA lui-même recevait l’heure vraie ; une **baseline
> aveugle** a donc été produite (**5/8 top-1, 6/8 top-3 sur 12 signes**) et montre que le
> modèle fonctionne. Seule piste restée ouverte : la **couverture de la matrice
> questionnaire** (le vrai signe part parfois de 0 point).
> Lié à : `BILAN-PRECISION-HEURE-2026-08-14.md`, `SPEC-QUESTIONNAIRE-ASC-ALLEGE-2026-07-12.md`,
> `BRIEFING-DHN-POLARIS-MAISON-2026-08-14.md`
> Date : 2026-08-14

## Pourquoi cet audit (et pas « encore Marr »)

Les 6 ouvrages (Marr 1–3, Vendel, Ebertin, + corpus fixed stars) ont servi à tester la
**rectification par directions primaires**. Verdict déjà acté : le modèle direct ne
bat pas le hasard → **Polaris-minute est hors portée**. Ce n’est **pas** ce qui
inquiète ici.

Ce qui casse la confiance produit aujourd’hui : sur 2 cas **AA** (acte), en scan
**24 h**, le **vrai Ascendant n’est même pas dans le top 3**. Les bouquins Marr
n’étaient pas censés sauver ça : le livrable ASC repose sur **questionnaire +
arcs/prog/RS**, pas sur les DP.

## Ce que disent les références AA

| Cas | Source | Heure | ASC | Lieu |
|---|---|---|---|---|
| Bangalter | Astro-Databank **AA** (Geslain) = Astrotheme acte | **04:50** | **Scorpion** | Suresnes (92) |
| Sinclar | Astrotheme acte / ADB | **14:30** | **Vierge** | Paris 11e |

Astro-Databank AA et Astrotheme ne « calculent » pas : ils **affichent l’acte**.
Nous, on **devine**.

## Mesure baseline (runs du 2026-08-14)

### Bangalter — 24 h, Suresnes, Q « persona discrète »

| Rang `scoreFinal` | Signe | scoreFinal | scoreMean tech |
|---|---|---|---|
| 1 | **Capricorne** | 13.75 | 122.5 |
| 2 | Gémeaux | 7.43 | 108.4 |
| 3 | Taureau | 6.60 | 108.7 |
| **7** | **Scorpion** | **2.95** | **103.5** |

- Pic grille Scorpion : **03:20** (score slot 106) — proche de 04:50, mais **noyé**.
- Questionnaire top-5 : Capricorne **21**, Gémeaux 9, Taureau 8… **Scorpion absent**.
- La colonne `scoreFinal` du ranking **est** le questionnaire pondéré (`wMean`), pas un
  mélange Q + astro : voir la cause racine ci-dessous.

### Cause racine — le signe ne vient QUE du questionnaire (`SIGN_FROM_Q_ONLY`)

Correction d’une affirmation antérieure de cet audit (« même les techniques préfèrent
Capricorne, donc double échec Q + arcs ») : **fausse**. Les techniques ne votent pas du
tout sur le signe. Depuis la v9.0 de `Resultat final1` :

```js
const SIGN_FROM_Q_ONLY = true;   // tri des signes sur wMean (questionnaire)
// signScoreFinal = scoreMean_topK + (Q_PRIOR_WEIGHT-1)*wMean  → utilisé SEULEMENT en tie-break
```

Conséquences vérifiées sur les sidecars :

- Le classement des 12 signes suit `wMean` ; arcs / progressions / retours solaires ne
  tranchent que les **égalités strictes**, puis ne servent qu’à placer l’**heure** dans
  le signe retenu.
- Contre-exemple mesuré (run `banga-informed-flat`) : les techniques donnaient
  **Scorpion 103,1 > Sagittaire 98,7**, et c’est **Sagittaire** qui sort #1 parce que son
  score questionnaire est plus haut (13 vs 4). Les techniques avaient raison et n’ont pas
  été écoutées.
- Corollaire produit : les **dates d’événements** saisies par le client n’influencent
  **plus le signe** (elles ne pèsent que sur l’heure ; `qFactor` est un facteur uniforme
  qui ne change aucun ordre).

Le flag avait été posé pour une raison documentée dans le code : le bruit inter-runs des
techniques (±5–10 pts sur `arcMean`) rendait le classement instable (de Gaulle basculait
Balance→Lion pour 0,46 pt). Ce n’est donc pas une négligence, mais un arbitrage
**stabilité contre pouvoir discriminant** — à re-mesurer depuis les correctifs v5.7
(fuseau historique, plages passant minuit).

→ Il n’y a **pas** de double échec. Il y a **un seul** organe de décision du signe : le
questionnaire.

### Sinclar — 24 h, Paris, Q « showman »

Top 3 : Lion · Bélier · Sagittaire — **Vierge absente**. Même pattern.

### Bangalter — plage 01–05 h (hypothèse « nuit années 70 »)

Top : Balance @ 01:05 · **Scorpion @ 03:20 (#2)**. Le bon signe **réapparaît** dès
que Capricorne (matin) est hors fenêtre. Confiance « Très faible ».

## Clarification sur le « 88 % top-3 »

Mesuré le 2026-07-12 (`SPEC-QUESTIONNAIRE-ASC-ALLEGE`) : **7/8** sur le banc
célébrités AA, scan 24 h, **Q biographiques soignés du manuel** — pas Q « image
Soleil ». Proust reste irrécupérable (rang 12).

Bangalter/Sinclar montrent le trou : **Q construit depuis la persona publique**
(= fuite Soleil / métier) → le plafond 88 % **ne se reproduit pas**.

### Le banc AA était circulaire — l’instrument de mesure est en cause

Mesuré le 2026-08-14 sur les sidecars (script `dhn-ab-sign-from-q.mjs`) : le banc
`dhn-preprod-aa-batch.mjs` envoyait une fenêtre **centrée sur l’heure vraie**
(`windowAround(centre, ±60 min`, ±90 si décalage de fuseau anticipé`)`). Le moteur
recevait donc une partie de la réponse.

Nombre de signes réellement en compétition dans le classement, par cas :

| Cas | Signes candidats | Rang du vrai ASC |
|---|---|---|
| bardot | **1** | 1 |
| beauvoir / degaulle / deneuve / hugo / ysl | 2 | 1 · 1 · 1 · 2 · 1 |
| gainsbourg / proust | 3 | 1 · 3 |

- **Top-3 = 8/8 (100 %) mécaniquement** : il n’y avait jamais plus de 3 signes possibles.
  Ce chiffre ne mesurait rien.
- **Top-1 = 6/8 (75 %)** à comparer non pas à 1/12 (8 %) mais au tirage parmi les candidats
  réellement présents : espérance **≈ 52 %**, soit z ≈ **1,3** — sous 2 σ. Ce protocole ne
  pouvait donc **rien établir** sur le pouvoir discriminant.
- Bardot n’était pas un succès mais un cas **« Imposé par la plage »** (1 seul signe), ce
  que l’étiquette de confiance dit déjà correctement.

**Correctif de l’instrument** : `dhn-preprod-aa-batch.mjs --blind` (ajouté 2026-08-14)
force un scan 00H00–24H00 sans rien tirer de l’heure vraie, et écrit ses sorties sous
`_out-dhn-aa-blind-*`. Toute calibration future de la matrice se juge **là**.

## BASELINE AVEUGLE — la vraie référence (2026-08-14, 8 cas AA, 24 h, 12 signes)

| Cas | Vérité | Trouvé | Rang du vrai ASC | Q du vrai signe | Q du signe gagnant |
|---|---|---|---|---|---|
| Bardot | 13:15 Sagittaire | 14:20 Sagittaire | **1** | 6,53 | 6,53 |
| Beauvoir | 04:30 Sagittaire | 05:15 Sagittaire | **1** | 8,55 | 8,55 |
| Deneuve | 13:35 Capricorne | 13:05 Capricorne | **1** | 16,20 | 16,20 |
| YSL | 19:45 Verseau | 18:40 Verseau | **1** | 12,61 | 12,61 |
| Gainsbourg | 04:55 Poissons | 04:40 Poissons | **1** | 15,50 | 15,50 |
| de Gaulle | 04:00 Balance | 20:20 Lion | 2 | 7,62 | Lion 11,56 |
| Hugo | 22:30 **Scorpion** | 16:40 Lion | 8 | **1,37** | Lion 10,92 |
| Proust | 23:30 Bélier | 21:50 Poissons | 12 | **0** | Poissons 9,44 |

- **TOP1 = 5/8 = 62,5 %** contre 8,3 % au hasard → z ≈ **5,5 σ**.
- **TOP3 = 6/8 = 75,0 %** contre 25,0 % au hasard → z ≈ **3,3 σ**.
- Heure : **0/8** à ±5 min, **2/8** à ±30 min — conforme au verdict horaire déjà acté.

**Cette mesure infirme la crainte formulée plus haut** (« aucun pouvoir discriminant ») :
à l’aveugle, sur 12 signes, le questionnaire trouve le bon Ascendant 5 fois sur 8. Le
modèle **fonctionne**. Bangalter et Sinclar ne sont donc pas la preuve d’un moteur cassé :
ils appartiennent à la **queue d’échec**, aux côtés de Hugo et Proust.

### Le signalement le plus exploitable : le vrai signe part parfois de zéro

Dans les 3 cas ratés, le problème n’est pas qu’un concurrent soit survalorisé — c’est que
le **vrai signe ne reçoit presque aucun point** : Hugo (Scorpion) **1,37**, Proust (Bélier)
**0**, Bangalter (Scorpion) **2,95**. Un signe à 0 ne peut pas gagner, quel que soit le
reste du moteur.

Les deux cas Scorpion connus du corpus (Hugo, Bangalter) sont **tous les deux** ratés avec
un Q quasi nul, ce qui confirme l’objection doctrinale : **la matrice ne sait pas coter un
Ascendant Scorpion**. C’est un défaut **général et reproductible**, pas un cas nominatif.

## A/B `SIGN_FROM_Q_ONLY` — piste FERMÉE (mesurée 2026-08-14)

Rejoué **hors ligne** sur la baseline aveugle (`dhn-ab-sign-from-q.mjs` reconstruit les
deux branches depuis les sidecars, sans relancer un seul run) :

| | Branche A (live, `true`) | Branche B (`false`, astro réintégrée) |
|---|---|---|
| TOP1 | 5/8 = 62,5 % | 5/8 = 62,5 % |
| TOP3 | 6/8 = 75,0 % | 6/8 = 75,0 % |
| Rangs déplacés | — | **1/8** (Hugo 8 → 7), 0 dégradé |

→ **Neutre**. Réintégrer arcs/prog/RS dans le classement du signe n’apporte rien, donc le
choix v9.0 (stabilité) est **confirmé** : ne pas y toucher. Piste close, ne pas rouvrir
sans élément nouveau.

Note de diagnostic tout de même utile : les techniques seules désigneraient le bon signe
**3/8** (Deneuve, Gainsbourg, de Gaulle), et elles ont raison **contre** le questionnaire
sur de Gaulle (tech max = Balance = vérité, Q max = Lion). Mais elles montrent aussi un
**biais Balance** (max tech = Balance sur 3 cas dont 2 faux), ce qui explique qu’elles
n’améliorent pas l’agrégat.

## Hypothèses sous test (script `dhn-audit-asc-miss.mjs`)

| Id | Protocole | Ce que ça tranche |
|---|---|---|
| H2 | ±1 h autour 04:50, **même** Q Capri-biaisé | ⚠ **circulaire** : la fenêtre part de l’heure vraie et ne laisse que 2 signes — ne tranche rien (voir verdicts) |
| H3 | 24 h, Q plat (tout `a`) | Sans prior Capri, les techniques sortent-elles le Scorpion ? |
| H2∩H3 | ±1 h + Q plat | Plafond local quand Q ne nuit pas et fenêtre resserrée |

## Ce que les bouquins n’expliquent pas (et c’est normal)

| Attente | Réalité mesurée |
|---|---|
| Marr / DP → heure exacte | Falsifié (modèle direct ≤ hasard) |
| Marr / Dual Test → valider un créneau | 100 % des créneaux passent |
| Doctrine → meilleur ASC | L’ASC DHN ne vient **pas** de Marr ; il vient de Q + SA/prog/RS |

Relire Marr ne corrige pas un **biais de questionnaire** ni un **paysage de scores**
où le créneau vrai (Scorpion ~03–05 h) perd 30 pts de total face à Capricorne 09:00.

## Résultats A/B (preprod, 2026-08-14)

| Protocole | ASC retenu | Rang Scorpion | Top 3 ? |
|---|---|---|---|
| Baseline 24 h + Q Capri | Capricorne 09:00 | **#7** | ✗ |
| **H2** ±1 h (03:50–05:50) + **même** Q Capri | **Scorpion 05:25** | **#1** | ✓ *(sur 2 signes possibles)* |
| **H3** 24 h + Q plat (`a`) | Bélier 12:15 | **#5** | ✗ |
| **H2∩H3** ±1 h + Q plat | Sagittaire 05:35 | **#2** | ✓ *(sur 2 signes possibles)* |

### Verdicts

1. **H2 : test circulaire, verdict retiré** — la fenêtre ±1 h était construite **autour
   de l’heure vraie**, ce qui ne laissait que **2 signes** candidats (Scorpion,
   Sagittaire). Le moteur a eu raison **1 fois sur 2** selon le questionnaire employé
   (Scorpion #1 avec le Q Capri-biaisé ; Sagittaire #1 avec le Q plat) — soit exactement
   le hasard sur 2 candidats. La plage n’a donc rien « sauvé » : elle a **réduit le
   champ**. La formulation initiale (« la plage récupère le bon signe malgré un mauvais
   Q ») surestimait le moteur et est **retirée**.
2. **H3 infirmée (dans cette forme)** — Sans prior Capri, le Q plat (`a`) devient
   un prior **Bélier** (33 pts). Les techniques ne sauvent pas le Scorpion (#5).
   Donc : ce n’est pas « enlever le biais Capri ⇒ les arcs trouvent ». En 24 h,
   **quelque chose** tire toujours ailleurs.
3. **Heure toujours approximative** — Même H2 (bon signe) centre à **05:25** vs
   vérité **04:50** (Δ 35 min) — cohérent avec ±45 min et hasard horaire.

### Conséquence produit (non négociable tant que non contredit)

> Chiffres à annoncer, désormais **mesurés à l’aveugle** sur 8 cas AA (24 h, 12 signes) :
> **top-1 ≈ 62 %, top-3 ≈ 75 %**. Les anciens 88 % / 7-8 sur 8 provenaient d’un protocole
> qui recevait l’heure vraie et ne doivent plus être cités.

Nuance importante par rapport à la version précédente de ce document : « exiger une
plage » n’est **pas** démontré comme un correctif de qualité. Une plage aide
**mécaniquement** (moins de signes possibles, jusqu’à l’étiquette « Imposé par la
plage »), mais elle ne rend pas le moteur plus discriminant, et le scan 24 h se défend
seul (5/8 top-1). La réclamer relève du choix produit, pas d’un gain mesuré.

Sur le questionnaire lui-même, l’objection doctrinale de l’utilisateur est **confirmée
factuellement** : la matrice fait passer la discrétion par la Terre avant le Scorpion.

| Réponse cochée | Attribution matrice |
|---|---|
| q1 « Réservé / distant » | Vierge 3, **Capricorne 3**, Scorpion 2 |
| q12 « Sérieux / fermé » | **Capricorne 4**, Scorpion 2, Vierge 1 |
| q6 « ce qu’on remarque en premier » | aucune option ne dit la retenue, l’opacité ou l’anonymat |

Un Ascendant Scorpion qui se dissimule (Bangalter derrière son casque) n’a **pas de case
à cocher** en q6 : le choix est entre ambition, bienveillance, charme, humour, intensité,
créativité, rigueur, liberté. C’est un défaut de **couverture** de la matrice, pas
seulement de pondération.

## L’étiquette de fiabilité était inutilisable — corrigée (preprod 2026-08-14)

Troisième mesure du jour, sur les mêmes runs aveugles : **l’étiquette affichée au client
ne dit rien**.

| Cas | Signe | Étiquette affichée | Écart (pts) |
|---|---|---|---|
| Bardot, Beauvoir, Deneuve, YSL | **juste** | « Très faible » | 1,23 · 1,80 · 1,25 · 2,07 |
| Gainsbourg | **juste** | « Faible » | 7,60 |
| de Gaulle, Hugo, Proust | faux | « Très faible » | 1,43 · 0,07 · 1,19 |

Trois défauts cumulés :

1. Elle est calculée sur l’écart relatif entre les deux meilleurs **pics techniques**
   (`ascPeaksSorted`, `totalScore`), alors que le signe est choisi par le **questionnaire** :
   elle notait un classement qui ne prend pas la décision.
2. En scan 24 h, cet écart reste sous les 4 % du seuil le plus bas → **plancher
   systématique** : 7 cas sur 8 en « Très faible », dont les 5 **justes**. On sous-vendait
   un résultat correct.
3. Aucun substitut ne fonctionne : marge absolue, marge relative, score absolu et
   `qConvergence` **chevauchent tous** entre justes et faux
   (`dhn-separabilite-confiance.mjs`). Le moteur ne peut pas savoir qu’il se trompe.

**Correction appliquée** (`Resultat final1` v9.2, même parti que `_HOUR_BAND_MIN` pour
l’heure) : la gradation reste **calculée et exportée** dans `dhnMetrics.confidence` pour le
diagnostic, mais n’est plus **affichée**. Le mail porte désormais un libellé unique —
« Signe estimé », ou « Imposé par la plage » quand un seul signe est possible — et l’énoncé
factuel du banc aveugle (5 sur 8 pour le signe, 6 sur 8 pour les trois hypothèses). Le
renvoi vers les **trois pistes** n’est plus conditionné à un grade bas : c’est le livrable
le mieux établi, il s’affiche toujours (sauf signe imposé par la plage, où il n’y a rien à
arbitrer).

Vérifié en preprod sur deux runs : scan 24 h → « Signe estimé » + taux + trois pistes ;
plage étroite → « Imposé par la plage », sans taux ni pistes. Plus aucune occurrence de
« Très faible » ni de « Fiabilité du signe Ascendant ».

⚠ Ce volet ne change **aucun calcul astro** : il aligne l’annonce sur ce qui est mesuré.
Le taux lui-même ne bougera qu’avec le volet matrice ci-dessous.

## Suites — ordre imposé par ce qui précède

1. ✅ **Fait — baseline aveugle** : 5/8 top-1, 6/8 top-3 (voir ci-dessus). C’est la
   référence de non-régression de tout patch futur.
2. ✅ **Fait — A/B `SIGN_FROM_Q_ONLY`** : neutre, piste **close**.
3. **→ Seule piste ouverte : la couverture de la matrice questionnaire.** Cible mesurée :
   les signes qui **partent de zéro** alors qu’ils sont la vérité (Scorpion 1,37 / 2,95 ;
   Bélier 0). Deux défauts constatés, à traiter comme un patch doctrinal avec briefing
   préalable et gate chiffré :
   - **couverture** : aucune option ne dit la retenue, l’opacité, l’anonymat (q6 en
     particulier n’offre que des traits saillants) ;
   - **répartition** : la discrétion est cotée Vierge/Capricorne avant Scorpion (q1, q12).

   Gate proposé (à valider avant tout code) : sur la baseline aveugle, **top-1 ≥ 5/8 ET
   top-3 ≥ 7/8**, sans perdre aucun des 5 cas actuellement corrects. Sur n = 8 un cas vaut
   12,5 pp : **élargir le banc** (viser 20–30 AA, dont ≥ 3 Ascendants Scorpion) est un
   préalable raisonnable, sinon le patch s’ajuste au bruit.
4. Anti-fuite Soleil : consigne explicite au client de ne pas décrire son signe solaire
   (Bangalter/Sinclar ont été cotés depuis l’image publique).
5. Ne **pas** rouvrir DP / reverse-RAMC ni le toggle du signe sans mesure nouvelle.

## Outillage

- Diagnostic ranking : sidecars `_out-dhn-bangalter-suresnes-*.json`
- A/B toggle signe, **hors ligne** (rejoue les deux branches sur les sidecars, sans
  relancer n8n) : `SITE/scripts/_enprat/audit/DHN/dhn-ab-sign-from-q.mjs`
- Banc aveugle : `dhn-preprod-aa-batch.mjs --blind` → `_out-dhn-aa-blind-*`
- A/B Bangalter : `SITE/scripts/_enprat/audit/DHN/dhn-audit-asc-miss.mjs`
- Récap : `_out-dhn-audit-asc-miss-summary.json`
