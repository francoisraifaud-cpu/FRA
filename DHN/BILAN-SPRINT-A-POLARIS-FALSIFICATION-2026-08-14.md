# BILAN Sprint A — Polaris maison : test de falsification

> Statut : 🟢 ACTIF — verdict de gate
> Lié à : `BRIEFING-DHN-POLARIS-MAISON-2026-08-14.md` (cadre V1, amendements 1-5)
> Supersede : rien (première mesure du reverse-RAMC de Marr)
> Date : 2026-08-14
> Périmètre : **100 % local**. Aucun appel serveur Hetzner, aucun PUT n8n, aucune
> route API créée ou modifiée.

---

## Verdict en une ligne

**NO-GO pour le Sprint B tel que spécifié** (route serveur + moteur de précision).
Le moteur de Marr est implémenté et **prouvé conforme au livre**, mais appliqué en
aveugle il **ne désigne jamais l'heure** : sur 8 cas d'état civil, le vrai RAMC
n'est jamais dans les 5 meilleurs candidats sur 10 800. Il reste un **signal
résiduel réel mais faible** (le vrai RAMC est systématiquement dans le top ~10 %),
cohérent avec le NO-GO DP du 2026-07-12.

---

## 1. Ce qui est PROUVÉ : l'implémentation est fidèle à Marr

Le livre publie, pour cinq directions précises de Lennon, le RAMC radical qu'il en
déduit. Le moteur les reproduit **toutes à moins de 0,5′ d'arc** :

| Événement | Direction | RAMC livre | RAMC calculé | Écart |
|---|---|---|---|---|
| 1er mariage | V conv. sextile Vénus | 276°15,0′ | 276°15,47′ | 0,47′ |
| Décès Epstein | DESC conv. carré Saturne | 276°15,0′ | 276°15,02′ | 0,02′ |
| Décès Epstein | VIII dir. carré Neptune | 276°20,0′ | 276°20,48′ | 0,48′ |
| Mariage Yoko | ASC conv. trigone Nœud | 276°20,0′ | 276°20,16′ | 0,16′ |
| Naissance fils 2 | ASC dir. trigone Soleil | 276°14,0′ | 276°14,13′ | 0,13′ |

Et **14 des 15 arcs Naibod** publiés tombent à moins de 0,1′ (le 15ᵉ a ses minutes
illisibles dans l'OCR). Sont donc validés : clé Naibod (0,985647°/an), pôles
topocentriques par trisection de la tangente
(`tan φ_XI = tan(lat)/3`, `tan φ_XII = 2·tan(lat)/3`), ascensions obliques,
offsets `OA(cuspide) = RAMC + 30·k`, miroir de cuspide opposée.

**Effet de bord utile** : l'arc permet d'**inverser la date** d'un événement. Trois
dates que l'OCR du livre avait rendues illisibles ont ainsi été retrouvées (green
card de Lennon = 27/07/1976, et non 21/07).

---

## 2. Ce qui ÉCHOUE : la méthode en aveugle

### Protocole

- **Cohorte** : les 8 cas AA du bench DHN (heure attestée par acte d'état civil ou
  rating Astrothème AA), timelines identiques à celles envoyées au workflow.
  Source : `SITE/scripts/BENCHMARK-DHN-MANUEL.md` (commit `c2f01d10`).
- **Statistique** : rang du vrai RAMC parmi **10 800 créneaux de 2′** sur 360°.
  Le hasard donne un rang médian de 5400.
- **Fenêtre cible ± 15′** de RAMC : l'heure d'état civil est arrondie à la minute
  (± 7,5′) et le lieu est un centroïde de ville (Paris ≈ 9′ de RAMC d'étalement).
- **Modèle nul** : mêmes événements, années décalées de ± 4 ans, 200 tirages par
  cas et par configuration, **même fenêtre cible** (comparaison équitable).
- **Fuseaux** : conversion civile → UT via `zoneinfo` (gère l'heure d'été 1934,
  Paris Mean Time +9′21″ avant 1911, heure allemande 1943) ; Hugo 1802 en temps
  moyen local de Besançon (+24′06″), **incertain**.

### Résultats (amendement 4 actif : événements à date arrondie exclus)

| Configuration | Rang médian | Cas rang ≤ 5 | Cas p < 0,05 |
|---|---|---|---|
| **marr9 / toutes cuspides** | **1042** / 10 800 | 0/8 | 2/8 |
| marr9 / symbolisme | 3622 | 1/8 | 1/8 |
| majeurs5 / symbolisme | 2206 | 0/8 | 0/8 |
| majeurs5 / symb / significateurs | 1026 | 0/8 | 0/8 |

Gate du brief (§7) : **rang ≤ 5 ET p < 0,05**. Échoué sur **8/8 cas**.

### Trois enseignements négatifs, chacun coûteux à ignorer

**Le filtre de symbolisme dégrade.** Contre-intuitif, mais mesuré : passer de
« toutes cuspides » à « cuspides pertinentes par type d'événement » fait passer le
rang médian de 1042 à 3622. Ma table type → cuspides est une **extrapolation** de
l'unique exemple documenté par Marr (le mariage). Soit la table est fausse, soit le
symbolisme doit être jugé **cas par cas** comme le fait Marr — et alors il n'est pas
automatisable en l'état.

**Resserrer aux conjonctions/oppositions détruit le signal.** Plus aucun candidat ne
tombe sur la cible : les convergences de Marr sur Lennon sont des sextiles, carrés
et trigones. Ce levier de réduction combinatoire est donc fermé.

**Le test sur Lennon est biaisé en faveur de Marr et échoue quand même** (p = 0,060).
La « vérité » de Lennon est la rectification de Marr elle-même, obtenue par cette
méthode : le critère automatisé **ne resélectionne pas nettement la réponse de son
propre auteur**. C'est le signe que le livre ne publie pas tout — le choix expert de
la cuspide, de la planète et de l'aspect « caractéristiques » effondre la
combinatoire d'environ deux ordres de grandeur, et ce choix n'est pas formalisé.

---

## 3. Le signal résiduel, mesuré honnêtement

Rang médian 1042/10 800 = le vrai RAMC est dans le **top ~10 %**, très loin des 50 %
attendus par hasard. Ce n'est pas rien. Mais 1042 créneaux × 2′ ≈ **35° de RAMC**,
soit ~2 h 20 de temps d'horloge **en fragments dispersés** — pas une fenêtre.

C'est exactement la même forme de signal que le NO-GO DP du 2026-07-12 (« signal
réel, décorrélé, mais faible et domaine-dépendant »), mesuré cette fois sur une
statistique beaucoup plus fine. Deux approches indépendantes convergent vers le même
plafond : **les directions primaires éliminent une grande partie de la journée sans
jamais pointer l'heure.**

### Limites du test à connaître avant de le rejouer

1. **n = 8**. Faible pour trancher finement ; suffisant pour exclure un effet fort.
2. **Ma table de symbolisme n'est pas de Marr** au-delà du cas mariage.
3. **Hugo 1802** : le temps de référence de Besançon avant l'unification est
   incertain (temps local vs temps de Paris) → cas à considérer comme bruité.
4. **Le modèle nul décale les années en gardant mois/jour** : nul relativement
   conservateur (une part de structure saisonnière est préservée).
5. Plusieurs événements du bench restent des **approximations** (dates
   d'anniversaire médiatiques, mois arrondis) même après le filtre `day ≠ 1`.

---

## 4. Conséquence sur le brief

| Élément du brief | Statut après Sprint A |
|---|---|
| Sprint A (falsification locale) | ✅ **FAIT** — verdict NO-GO |
| Sprint B (route `POST /rectification/reverse-ramc`) | ⛔ **FERMÉ** — le gate n'est pas franchi |
| Étage 0 (DHN client : signe + fenêtre + confiance) | ✅ inchangé, reste le produit |
| Étage 1 (moteur Polaris de précision) | ⛔ non justifié par la mesure |
| Étage 2 (Dual Test, grades a/b/c/d) | ⛔ sans objet sans étage 1 |
| Amendement 5 (positionnement atelier/Lab) | confirmé — et même l'atelier n'a pas de moteur fiable à offrir |

**Aucune ligne de code serveur n'a été écrite.** C'est le résultat attendu du
garde-fou : le chantier a coûté une session au lieu de plusieurs semaines.

---

## 5. Seule piste que la mesure autorise encore

Le signal existe mais est **global et fragmenté**. La seule hypothèse compatible avec
les deux mesures (celle-ci et le NO-GO DP de juillet) est d'utiliser la convergence de
Marr **non pas comme moteur de recherche global, mais comme re-classeur à l'intérieur
d'une fenêtre de signe déjà choisie par le questionnaire** (étage 0). Le bilan de
juillet dit que la DP « ne résout pas l'heure DANS un signe » ; la présente mesure dit
qu'elle élimine ~90 % de la journée. Les deux ensemble suggèrent une complémentarité —
**à vérifier, pas à supposer.**

Si cette piste est ouverte, elle reste **100 % locale** et doit passer le même type de
gate (modèle nul, cohorte AA, p < 0,05 sur ≥ 6/8 cas) **avant** toute considération
serveur. Sinon : gel du chantier Polaris, l'étage 0 reste le produit.

---

## Outillage produit (local, réutilisable)

| Fichier | Rôle |
|---|---|
| `SITE/scripts/_enprat/audit/DHN/marr_reverse_ramc.py` | moteur reverse-RAMC topocentrique + `--selftest` (golden livre) + `--falsify` (Lennon) |
| `SITE/scripts/_enprat/audit/DHN/aa_cases.py` | cohorte 8 cas AA + test décisif + modèle nul (`--strict-dates`) |

```bash
cd SITE/scripts/_enprat/audit/DHN
python marr_reverse_ramc.py --selftest        # conformité au livre (doit être vert)
python marr_reverse_ramc.py --falsify         # Lennon (référence circulaire)
python aa_cases.py --strict-dates --null 200  # test décisif 8 cas AA
```

Dépendance : `pyswisseph` (2.10.03 en local, repli Moshier — précision très
supérieure aux orbes de Marr de 5′-10′).
