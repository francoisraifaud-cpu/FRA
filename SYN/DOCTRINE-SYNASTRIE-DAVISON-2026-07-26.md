# Doctrine synastrie — DAVISON → 8 axes (source de vérité durable)

> Statut : 🟢 ACTIF
> Source primaire : **R. C. Davison, _Synastry: Understanding Human Relations through Astrology_** (`FRA/BOOKS/DAVISON`, git-ignoré — cf. `.cursor/rules/doctrine-books-inspection.mdc`)
> Lié à : `FRA/SYN/N8N SYN` (Super noeud Syn), `SITE/lib/syn-dashboard-html.ts` (port Connect), `DOCUMENTATION WORKFLOW SYN.md`
> Date : 2026-07-26

But : ancrer le moteur de synastrie (rapports SYN Essentiel/Expert, chatbot synastrie,
métriques SPIKKA Connect) sur une **source dédiée à la synastrie** — Davison — et non sur
des préceptes de prédiction généraliste. Ce document est la référence à relire avant toute
retouche du scoring relationnel. Il ne remplace pas la lecture du livre ; il en fixe les
verbatim utiles et leur traduction en code.

---

## 1. Les 8 axes du dashboard et ce qu'ils mesurent (rappel)

| Groupe | Axe | Mesure | Signaux moteur (source) |
|---|---|---|---|
| Lien | **Fluidité** (Harmonie) | confort / fluidité des échanges | `globalScoreDetail.harmony` |
| Lien | **Intensité** | charge, magnétisme, puissance émotionnelle | `globalScoreDetail.intensity` |
| Lien | **Durabilité / Solidité** | aptitude du lien à **tenir dans le temps** | `longevityIndex.binding_score` (⇒ V3, ci-dessous) |
| Lien | **Karmique** | fil « d'âme », répétition de schémas | Nœuds lunaires, contacts karmiques (Teal) |
| Domaines | **Connexion mentale** | échange intellectuel, compréhension | Mercure, Air, aspects mentaux |
| Domaines | **Sécurité émotionnelle** | sentiment de sûreté affective | Lune, Cancer/Eau, Vénus-Lune |
| Domaines | **Alignement des valeurs** | valeurs, projets, foi partagés | Jupiter, Soleil, maisons II/IX |
| Domaines | **Résonance publique** | image du couple, rôle social | maisons VII/X, angles |

Chaque axe est **display-only** : il n'altère pas le `global_score` gelé. La note vue par le
client (`relationship_dashboard.metrics.<axe>.score`) est émise **par le moteur** et lue
telle quelle par tous les renderers (rapports n8n + port Connect `syn-dashboard-html.ts`,
l.94-96 : `m.label` / `m.desc` / `m.score`). **Un seul changement moteur suffit** ; aucun
renderer ne recalcule un axe.

---

## 2. Durabilité = modèle « 2 moteurs » (Davison) — cœur de la refonte

### 2.1 Le problème résolu

L'ancien calcul (v7.5.0, `bindingRaw` Saturne **+ Nœuds**, saturation `/12`) gonflait la note
(médiane ~76, 49/85 couples en « très solide ») et notait la durabilité **quasi uniquement**
sur Saturne + Nœuds. Deux dérives doctrinales :
- **Nœuds comptés en durabilité** alors que Teal les rattache au **karmique** (fil d'âme,
  répétition), pas à la capacité de tenir.
- **Aucune affinité de fond** : un couple durable à **Saturne faible mais forte affinité
  luminaires** (ex. Bush/Barbara, 73 ans de mariage, Soleil-Lune trigone orbe 0,5°) était
  sous-évalué par la logique, ou au contraire un éphémère à Nœuds forts était surévalué.

### 2.2 La doctrine Davison — deux moteurs distincts

**MOTEUR 1 — ENGAGEMENT (Soleil/Saturne : devoir, continuité).** Davison, _Synastry_ (p.~) :

> _« The Sun's natural integrity, Saturn's strong sense of duty and a mutual determination to
> fulfill their responsibilities can combine to forge a link that **guarantees the continuity
> and durability of the partnership, even if there are strongly adverse cross-aspects** in
> other sectors of the two horoscopes. »_ (`FRA/BOOKS/DAVISON`, l.3065-3067)

⇒ Saturne = **ciment structurel** : il fait tenir le lien même sans confort. C'est le socle
de la durabilité, à condition de ne pas le confondre avec le « bonheur » (mesuré, lui, par
Fluidité/Intensité).

**MOTEUR 2 — AFFINITÉ DE FOND (luminaires : compatibilité naturelle).**

> _« This is the **classic compatibility combination**, with the masculine and positive Sun
> joined to his natural mate, the feminine, receptive and passive Moon. »_ (Soleil-Lune,
> `FRA/BOOKS/DAVISON`, l.2883-2884)

> _« …patterns of feeling and response encourages that sense of well-being in each other's
> company which can form the **basis of a lifelong relationship**. »_ (Lune-Lune,
> `FRA/BOOKS/DAVISON`, l.3256-3257)

⇒ Soleil-Lune, Lune-Lune, Lune-Vénus (+ Descendant/VII) = **affinité qui fait durer par
élan**, indépendamment de Saturne. C'est ce qui manquait au modèle Saturne-seul.

**FACTEUR CORROSIF — Uranus (instabilité / divorce).** Noté pour mémoire (non pénalisé en
V3, piste future) :

> _« aspects from Uranus introduce a tendency to succumb to sudden attractions … sudden
> changes of emotional allegiance that may well **disrupt an existing partnership**. »_
> (`FRA/BOOKS/DAVISON`, l.164-166) ; _« Uranus has been identified, and rightly so, as one of
> the **main indicators of divorce** »_ (l.553). Attention : l'attraction physique
> Vénus-Uranus **n'est pas** de la durabilité (l.131-133 : « physical charms … possibility of
> divorce »).

### 2.3 Formule V3 gravée (flag `DTC_SYN_DURAB_V3`, défaut OFF)

Dosage **« spread »** calibré sur cohorte 85 couples (famous + entourage preprod), lecture
inter-aspects **tier1** (majeurs), = exactement la config offline `scripts/_tmp-syn-calib/calib.mjs` :

```
ENGAGEMENT = 1.0·min(saturn_glue,20) + 0.55·min(saturn_burden,12) + 0.7·min(|saturn_saturn|,6)

AFFINITÉ   = Σ  poids_paire · proximité   (dédup par TYPE de paire, meilleure proximité)
             · 4.0     [proximité = max(0, 1 − |orbe|/8) ; contacts SOFT luminaires/Vénus]
           + 0.8 · max(0, bonus_éléments)          (harmonie élémentaire Davison)
           puis plafonné à 9                        (attraction ≠ durabilité : lift borné)

  poids_paire : Soleil-Lune 1.0 · Lune-Lune 0.9 · Lune-Vénus 0.9 · Soleil-Vénus 0.75
              · Soleil-Soleil 0.6 · Vénus-Vénus 0.6 · Descendant-{Sol/Lun/Vén} 0.7
              · Ascendant-{Sol/Lun/Vén} 0.55

binding_score = round( 100 · (1 − exp(−(ENGAGEMENT + AFFINITÉ) / 20)) )   [saturation /20 dégonflée]

tonalité      = AFFINITÉ > ENGAGEMENT ? « par élan » (through attraction)
                                       : « par engagement » (through commitment)
bandes        = ≥75 très solide · ≥60 solide · ≥45 modérée · ≥30 à consolider · <30 ténue
```

- **Nœuds RETIRÉS** de la durabilité (bascule doctrinale vers l'axe **Karmique**, Teal).
- Émis en plus pour la narration Expert : `binding_engagement`, `binding_affinity`,
  `durab_model = "v3-2engine"`.
- **N'altère PAS** `longevityIndex.score` /15 gelé (modulateur du score global).

### 2.4 Calibration « spread » — résultats offline (cohorte 85 couples, tier1)

| Modèle | méd | moy | σ | max | très solide | solide | modérée | à consolider | ténue |
|---|---|---|---|---|---|---|---|---|---|
| OLD (Saturne+Nœuds /12) | 76 | 73.2 | 13.6 | 92 | 49 | 24 | 7 | 4 | 1 |
| **V3 spread (/20)** | **63** | **60.6** | **13.0** | **79** | **10** | **42** | **21** | **9** | **3** |

Face-validity (OLD → V3 spread) :

| Couple | Vécu | OLD → V3 | Lecture |
|---|---|---|---|
| Louis XVI / M.-Antoinette | mariés jusqu'à la mort | 73 → **75** très solide | ✔ |
| F.D. / Eleanor Roosevelt | mariés jusqu'à la mort | 74 → **66** solide | ✔ |
| Reagan / Nancy | mariés jusqu'à la mort | 73 → **67** solide | ✔ |
| **Bush / Barbara** | **73 ans (Saturne faible, affinité forte)** | 40 → **48** modérée | ✔ le moteur 2 rattrape |
| P. Curie / M. Curie | jusqu'au décès | 76 → **61** solide | ✔ |
| Macron | 30+ ans | 68 → **59** modérée/solide | ✔ |
| Diana / Charles | **long ET malheureux** (Saturne) | 88 → **78** très solide | ✔ durable ≠ heureux |
| Bardot (~1 an) | éphémère (OLD gonflé Nœuds) | 88 → **69** solide | ⚠ potentiel de lien réel, dégonflé |
| Kahlo / Rivera | divorce + remariage | 31 → **27** ténue | ✔ |
| Picasso | amitié brève | 55 → **42** à consolider | ✔ |
| Blair | éphémère (OLD gonflé Nœuds) | 85 → **62** solide | ↓ nettement dégonflé |

> Nuance doctrinale importante à garder : la durabilité mesure la **capacité structurelle** à
> tenir (potentiel de lien), pas l'issue réelle (dépend du libre arbitre / circonstances).
> D'où Diana=78 (lien durable mais éprouvant) et Bardot=69 (fort potentiel de liaison, vécu
> court). Ce n'est pas une contradiction : Fluidité/Intensité disent le confort, Durabilité
> dit la solidité du ciment.

---

## 3. Les autres axes exposent-ils assez de signaux techniques ? (audit rapide)

Réponse courte : **oui, le moteur produit et expose les signaux** pour chaque axe (breakdown
dans `longevityIndex`, `globalScoreDetail`, `element_compatibility`, contacts par planète). La
narration Expert (STEP 1→8 du `synthPrompt`) détaille signe par signe. **Aucune correction
n'est requise ici** tant qu'elle n'est pas confirmée par la doctrine (consigne utilisateur).
Pistes Davison **notées, non ouvertes** (à instruire avant tout code) :
- **Uranus corrosif** en durabilité/résonance (indicateur de divorce, §2.2) — piste future.
- **7ᵉ maison / Descendant** comme marqueur d'engagement (déjà partiellement dans l'affinité
  V3 via Descendant ; Davison ch.10 « seventh house »).
- **« Divorce prone »** (Davison l.28-29) comme drapeau explicite plutôt que dilué.

---

## 4. Propagation & déploiement (data-driven, un seul point)

1. **Moteur** `FRA/SYN/N8N SYN` (nœud _Super noeud Syn_) : seul endroit à modifier. `binding_score`
   ⇒ `durabiliteScore` (l.9806) ⇒ `relationship_dashboard.metrics.durabilite`.
2. **Rapports SYN** (Essentiel `Générateur de rapport final1`, Expert `5. Générer Fichier HTML1`,
   `6. Génération HTML3`) : lisent les métriques + narration STEP 4 (dans le moteur).
3. **Connect** : `SITE/lib/syn-dashboard-html.ts` = **port fidèle data-driven** (lit `m.score`
   / `m.label` / `m.desc`) → **aucun patch SITE** requis.
4. **Chatbot** : `SYN. Build chatBrief` lit `longevityIndex.qualitative` (V3 : « solide · par engagement »).

**Procédure (flag OFF par défaut) :**
- Deploy moteur preprod (safe : V3 OFF) → bench LIVE preprod avec `DTC_SYN_DURAB_V3=1` →
  présenter chiffres avant/après → **validation utilisateur** → bascule ON en prod (env var) +
  deploy prod + **backup FRA** (`scripts/n8n-export-prod-workflows.mjs`).
- Rappels règles : séparation moteur (`dtc-branches-separation.mdc`), couplage
  (`couplage-prev-syn-site.mdc`), backup prod (`prod-deploy-github-backup.mdc`).
