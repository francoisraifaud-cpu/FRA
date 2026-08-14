# AUDIT DHN — Échec ASC hors top-3 (Bangalter / Sinclar)
> Statut : 🟢 ACTIF
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
- Q_PRIOR_WEIGHT = 2.0 → le prior Capricorne est doublé dans le ranking signe.
- Même les **techniques** (scoreMean) préfèrent Capricorne (122) à Scorpion (103).

→ **Double échec** : Q *et* arc/prog/RS. Ce n’est pas « juste le prior Q ».

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

Les runs `dhn-preprod-aa-batch.mjs` récents sont en plus en **fenêtre ±1 h**
autour de l’heure civile : protocole **plus facile**, non comparable au 24 h.

## Hypothèses sous test (script `dhn-audit-asc-miss.mjs`)

| Id | Protocole | Ce que ça tranche |
|---|---|---|
| H2 | ±1 h autour 04:50, **même** Q Capri-biaisé | La plage sauve-t-elle le Scorpion malgré un mauvais Q ? |
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
| **H2** ±1 h (03:50–05:50) + **même** Q Capri | **Scorpion 05:25** | **#1** | ✓ |
| **H3** 24 h + Q plat (`a`) | Bélier 12:15 | **#5** | ✗ |
| **H2∩H3** ±1 h + Q plat | Sagittaire 05:35 | **#2** | ✓ |

### Verdicts

1. **H2 confirmée** — Dès que la plage **exclut** Capricorne (matin), le Scorpion
   remonte **#1** même avec un Q qui vote encore Capricorne 21 pts. Le top-3 ASC
   « marche » surtout comme **filtre géographique horaire**, pas comme détecteur
   24 h.
2. **H3 infirmée (dans cette forme)** — Sans prior Capri, le Q plat (`a`) devient
   un prior **Bélier** (33 pts). Les techniques ne sauvent pas le Scorpion (#5).
   Donc : ce n’est pas « enlever le biais Capri ⇒ les arcs trouvent ». En 24 h,
   **quelque chose** tire toujours ailleurs.
3. **Heure toujours approximative** — Même H2 (bon signe) centre à **05:25** vs
   vérité **04:50** (Δ 35 min) — cohérent avec ±45 min et hasard horaire.

### Conséquence produit (non négociable tant que non contredit)

> **Ne pas promettre un top-3 ASC fiable sur scan 24 h libre.**
> Exiger une plage client (souvenir, « nuit », « matin », ±1–2 h). Sans plage,
> le classement signe est un **artefact de Q + paysage technique**, pas une
> lecture d’acte.

Les 88 % de juillet restent valables **seulement** sous Q biographique soigné du
manuel (et même là, Proust = plafond intrinsèque). Bangalter avec Q « image
publique » est le contre-exemple qui devait arriver.

## Suites (après résultats H2/H3)

1. ~~Si H2 ✓ et H3 ✗~~ **→ cas mesuré** : produit = **exiger une plage** ;
   message UX honnête si 00–24 ; éventuellement refuser le run ou afficher
   « confiance fenêtre insuffisante ».
2. Anti-fuite Soleil : consignes Q (« ne décrivez pas votre signe solaire ») +
   audit Sinclar en ±1 h autour 14:30 (même protocole H2).
3. Rejouer les 8 AA lean **en 24 h** sur le moteur **actuel** (post v5.7 TZ/fenêtre)
   pour voir si le 88 % tient encore — hors Bangalter.
4. Ne **pas** rouvrir DP / reverse-RAMC sans mesure nouvelle (`BILAN-PRECISION-HEURE`).

## Outillage

- Diagnostic ranking : sidecars `_out-dhn-bangalter-suresnes-*.json`
- A/B : `SITE/scripts/_enprat/audit/DHN/dhn-audit-asc-miss.mjs`
- Récap : `_out-dhn-audit-asc-miss-summary.json`
