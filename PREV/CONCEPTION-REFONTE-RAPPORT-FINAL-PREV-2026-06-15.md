# Conception — Refonte du rapport final PREV (récit thématique + 4 granularités)
> Statut : 🟢 ACTIF (document de conception — à valider AVANT tout code)
> Lié à : modèle THEME/SYN récit (`SITE/scripts/_recit/`), `FRA/PREV/N8N Prev`, `FRA/PREV/N8N Prev Trad LLM`
> Date : 2026-06-15
> ⚠️ Révision 2 : corrige une 1ʳᵉ analyse erronée (le rapport final THEME n'est PAS maison-par-maison ; voir §1).

---

## 0. Objet et cadrage

Porter au **rapport final client PREV** la **restructuration thématique** déjà faite sur THEME et SYN : remplacer la structure « 12 maisons en file » par un **récit regroupant les maisons en quelques chapitres thématiques digestes**, vulgarisé, et adapté aux **4 granularités** (Annuel / Mensuel / Hebdomadaire / Journalier).

Exigences validées avec l'utilisateur :
- dates du récit = **phénomènes célestes réels uniquement** (éclipses/Saros, transits lents exacts, stations) — jamais les peak dates de signatures (falsifiables ~23 %, cf. pivot moteur `celeste_keep` 2026-06-04) ;
- **réflexion d'impact sur la FORME** (sommaire + chapitres + pagination PDF) car ce fut le point dur sur THEME/SYN ;
- **document de conception d'abord**, pas de code tant qu'il n'est pas validé.

Hors périmètre : moteur de scoring DTC, `eventSignatures` client, KPI baseline 150, **rapport technique** (maison-par-maison, conservé).

---

## 1. CORRECTION — ce qu'est réellement le récit THEME/SYN (le modèle à copier)

> Les exports `FRA/THEME/N8N Theme Repport HTML Final` et `FRA/PREV/N8N Prev Repport HTML Final` sont des **snapshots obsolètes** (encore maison-par-maison). La version déployée du récit vit dans **`SITE/scripts/_recit/`**.

Le récit THEME n'est **pas** une refonte de présentation : c'est une **2ᵉ passe LLM de ré-écriture**. Pipeline réel :

1. **Matière brute** : les 12 LLM `Maison N` + `Synthèse` sont toujours générés (analyse technique).
2. **Découpage** (`decoupage.mjs` → `buildRecitItems()`) : fabrique **~9 items de récit** auto-portés (prompt + faits + ancrage), envoyés à une **2ᵉ passe LLM** (prompt « astrologue-écrivain », `_drivers/recit-system.txt`) :
   - `portrait` (5-6 § d'ouverture, depuis la synthèse + « spine »),
   - `forces` (4-6 puces), `defis` (3-5 puces),
   - **4 chapitres thématiques** `c1..c4` — chacun **fusionne 3 maisons en UN seul récit tissé** (sous-titres `## …` + un « ## En pratique » final),
   - `cloture` (mot de fin tourné vers l'avenir).
3. **Rendu** (`_node-gen-recit.js` / `theme-recit-render.mjs`) : HTML final = portrait + forces/défis + 4 chapitres (conditionnels) + clôture + **sommaire dynamique** + bi-roue éventuelle.
4. **Pagination PDF** : feuille `print-rules.css` injectée en live (`_deploy-print-css.mjs`) sur les 6 workflows — corrige les sauts de page Gotenberg (cf. `DEPLOIEMENT-SAUTS-DE-PAGE-2026-06-14.md`).

### Regroupement thématique de référence
- **THEME** (`labels.mjs` → `CHAP_STRUCT`) — 4 chapitres :
  - c1 🪞 maisons **1,7,12** — *Identité · Lien à l'autre · Monde intérieur* → « Qui tu es vraiment »
  - c2 🧭 maisons **2,6,10** — *Ressources · Quotidien · Vocation* → « Ce qui te fait avancer »
  - c3 ❤️‍🔥 maisons **4,5,8** — *Racines · Désir · Transformation* → « Ton cœur et tes liens »
  - c4 🌅 maisons **3,9,11** — *Pensée · Quête de sens · Élans collectifs* → « Ton élan et ton sens »
- **SYN** (`_syn-thematic-block.js` → `SYN_CHAPTERS`) — 4 chapitres relationnels (intime 5,8,1 / quotidien 4,2,6 / engagement 7,10,11 / âme 3,9,12), **chapitres conditionnels** (rendus seulement si une maison est activée), sommaire reconstruit à partir des chapitres rendus.

**Conséquence de périmètre** : transposer cela à PREV ≠ « option A présentation seule ». C'est **construire un pipeline récit PREV** (découpage thématique + 2ᵉ passe LLM + rendu), comme THEME/SYN. C'est le bon niveau pour atteindre la même qualité.

---

## 2. Spécificités PREV par rapport à THEME/SYN

| Dimension | THEME (natal) | PREV (prévisions) |
|---|---|---|
| Objet | qui est la personne | ce qui bouge dans sa vie sur une période |
| Temporalité | aucune | **centrale** : 4 granularités + dates réelles |
| Dates | — | **éclipses, stations, transits lents exacts** (faits) |
| Données activation | locataires natals | **heatmap d'intensité** par maison × sous-période |
| Matière LLM | 12 maisons + synthèse | **identique** (12 maisons + synthèse) — réutilisable |

Deux apports propres à PREV à intégrer au récit :
1. **Le calendrier des temps forts** (dates réelles → maison → sens en clair).
2. **La heatmap d'intensité** — aujourd'hui **maison-par-maison**, à **ré-agréger par thème** pour rester cohérente avec les chapitres (point soulevé par l'utilisateur : on ne veut pas réintroduire du maison-par-maison par la bande).

---

## 3. Proposition de structure du récit PREV (cas ANNUEL, référence)

> Reprend le squelette THEME (portrait → chapitres → clôture) en y greffant la temporalité PREV.

1. **Intro** (titre, période, luminaires).
2. **Sommaire dynamique**.
3. **Votre période en bref** — *portrait de période* (re-tissage de la Synthèse) : le climat global, sans jargon, sans date d'événement.
4. **🗓️ Les temps forts de la période** — calendrier des **dates réelles** (éclipses/stations/transits lents exacts) → maison touchée → sens en clair. Aucun %, aucun label d'événement.
5. **Chapitres thématiques** (mêmes 4 regroupements que THEME, ou variante PREV — cf. §4), **conditionnels et ordonnés par intensité** (heatmap) : chacun fusionne les maisons de son thème en un récit « ce qui se joue dans ce domaine sur la période + quand (renvoi aux dates réelles concernées) ».
6. **🔥 Vos zones de vie les plus actives** — heatmap **ré-agrégée par thème** (4 lignes) + éventuel détail repliable.
7. **Clôture** — mot tourné vers la suite de la période.

---

## 4. Le regroupement thématique PREV — à arbitrer (réflexion, pas tranché)

Trois pistes, à départager ensemble :

- **Piste A — Réutiliser tel quel `CHAP_STRUCT` THEME** (1,7,12 / 2,6,10 / 4,5,8 / 3,9,11).
  - ✅ cohérence inter-produits, code/labels déjà écrits et conjugués (tu/vous/il/elle).
  - ⚠️ regroupement pensé pour le natal (« qui tu es »), pas pour « ce qui bouge ».
- **Piste B — Regroupement PREV dédié** orienté « domaines de vie qui évoluent » (ex. : *Vous & votre élan* / *Travail & matériel* / *Amour & liens* / *Sens & transformation*), même maisons mais titres tournés « période ».
  - ✅ angle prévisionnel juste.
  - ⚠️ nouveau jeu de labels à écrire + valider (FR/EN, 4 modes d'adresse).
- **Piste C — Chapitres pilotés par l'activation** : on ne fixe pas les thèmes a priori ; on génère un chapitre par **cluster de maisons les plus actives** (depuis la heatmap), titré par le domaine dominant.
  - ✅ colle au réel de la période, court quand peu de choses bougent.
  - ⚠️ plus complexe (titres dynamiques), risque d'incohérence d'une période à l'autre.

> Recommandation provisoire : **Piste B** (qualité éditoriale prévisionnelle) avec rendu **conditionnel + ordonné par intensité** (emprunt à SYN/Piste C). À valider.

---

## 5. Adaptation aux 4 granularités

| Cas | Portrait | Temps forts | Chapitres thématiques | Heatmap |
|---|---|---|---|---|
| **Annuel** | complet | éclipses + stations de l'année | 4 chapitres (conditionnels) | mensuelle, ré-agrégée par thème |
| **Mensuel** | court | temps forts du mois | chapitres activés seulement | hebdomadaire |
| **Hebdomadaire** | bref | frise jour par jour | 1-2 thèmes dominants | journalière |
| **Journalier** | 1 § « brief du jour » | phénomène(s) du jour | 1 récit court | snapshot du jour |

Le degré d'activation se lit dans `heatmapData.top3`/`normalized` (déjà calculé). **Décision de fond** : en Hebdo/Journalier, faut-il quand même générer les 12 maisons en amont (coût LLM) puis n'en restituer qu'une partie, ou réduire la génération ? (cf. §7, impact moteur).

---

## 6. Impacts FORME (le point dur THEME/SYN) — à traiter explicitement

1. **Sommaire dynamique** : invariant « chapitre rendu ⇔ entrée sommaire ⇔ ancre existante ». Pas d'ancre morte (liens cassés en PDF). Géré côté THEME par reconstruction depuis les chapitres effectivement rendus → à répliquer.
2. **Chapitres conditionnels** : ne rendre que les thèmes activés ; gérer le cas « aucun thème activé » (fallback).
3. **Pagination PDF Gotenberg** : réutiliser/étendre `print-rules.css` (déjà injecté sur PREV : `Rapport HTML Sécurisé2`, `Générateur HTML Prévisions3`, `Rapport Technique HTML v1`, `Prépare HTML → PDF`). Cartouches en styles inline → sélecteurs d'attribut (`div[style*="background:#…"]`) pour éviter orphelins. Tester sur **plusieurs runs** (pagination = fonction du texte LLM).
4. **Libellés clients** : remplacer « Maison N » par le domaine de vie (déjà fait dans `decoupage.mjs` via `MAISON_LABEL`).
5. **i18n FR/EN + 4 modes d'adresse** (tu/vous/il/elle) : réutiliser `labels.mjs` (`getMode`, `addressInstruction`) si Piste A ; sinon écrire l'équivalent PREV.
6. **Calendrier + heatmap par thème** : nouveaux blocs à intégrer dans le découpage sans casser la pagination.

---

## 7. Périmètre technique & points à confirmer

- **Nouveau pipeline récit PREV** (à créer, analogue THEME) : un nœud découpage (`buildRecitItems` PREV) + une 2ᵉ passe LLM récit + un nœud rendu + branchement dans le workflow. → c'est la charge principale.
- **Fichier moteur `N8N Prev`** : à priori **non modifié** pour la structure récit (le découpage lit les sorties `Maison N`/`Synthèse` déjà produites). MAIS :
  - si on réduit la génération LLM en Hebdo/Journalier → modification moteur (prompts), donc **branche `dtc/*` + règles de séparation** (cf. `.cursor/rules/dtc-branches-separation.mdc`).
  - les champs dates réelles (`_mdseEclipseNatalHits`, `_eclipsesData`, `_mdseStations`…) sont **déjà exposés** par `N8N Prev` → consommables par le découpage/rendu sans toucher le moteur (à confirmer : accès depuis le nœud récit).
- **Données calendrier** : socle propre = éclipses + stations (date + maison). Transits lents exacts = V2 (vérifier disponibilité d'une date de perfection structurée).
- **Heatmap par thème** : ré-agrégation = somme/moyenne des intensités des maisons d'un chapitre (calcul présentation, pas moteur).
- **Snapshots FRA obsolètes** : travailler sur la base déployée (n8n live / `_recit`), pas sur les exports FRA périmés.

---

## 8. Risques & garde-fous

| Risque | Garde-fou |
|---|---|
| Réintroduire du maison-par-maison (heatmap) | Ré-agréger la heatmap par thème |
| Prédictions d'événements déguisées | Calendrier = faits astronomiques only, 0 % / 0 label (pivot `celeste_keep`) |
| Liens sommaire cassés en PDF | Invariant chapitre ⇔ entrée ⇔ ancre (modèle THEME) |
| Sauts de page catastrophiques | `print-rules.css` + test multi-runs Gotenberg |
| Toucher le moteur par mégarde | Découpage/rendu = nœuds dédiés ; `N8N Prev` non modifié sauf décision §5 (alors branche `dtc/*`) |
| Coût LLM (2ᵉ passe) | Mesurer ; arbitrer génération conditionnelle par granularité |

---

## 9. Plan de livraison proposé (validation à chaque palier)

- **Étape 0 (ce doc)** : valider le modèle (récit thématique = 2ᵉ passe LLM) + le regroupement PREV (§4) + l'adaptation 4 cas (§5). ⬅️ *ici*
- **Étape 1** : figer la `CHAP_STRUCT` PREV + libellés FR/EN + 4 modes d'adresse ; définir le calendrier (sources de dates) et la heatmap par thème.
- **Étape 2** : écrire le découpage PREV (`buildRecitItems` adapté) + prompts 2ᵉ passe + nœud rendu, sur **données d'un cas réel** (1 granularité d'abord : Annuel).
- **Étape 3** : intégrer calendrier (éclipses+stations) + heatmap par thème + sommaire dynamique.
- **Étape 4** : décliner les 4 granularités + pagination PDF (test multi-runs Gotenberg).
- **Étape 5** : i18n complet, recette, déploiement PREPROD puis PROD.

---

## 11. IMPACT HEATMAP — full (technique) vs simplifiée (final) — investigué

### 11.1 Constat (vérifié)
- `heatmapData` (grille **12 maisons × N colonnes** : mois/semaines/jours selon granularité) est produit **une seule fois** dans `N8N Prev` (Super noeud1), avec `colLabels`, `granularity`, `tensionTotals`, `supportTotals`, `normalized`, `top3`.
- Il est **consommé tel quel** par les rapports narratifs ; le rendu heatmap est aujourd'hui **dupliqué (copié-collé)** dans chaque nœud rapport (Final, Technique, narratif). C'est la dette d'harmonisation actuelle.
- Le rapport « données techniques » tabulaire n'embarque pas la heatmap.
- **La matière dates réelles existe déjà** : le LLM Synthèse génère déjà « L'Axe du Destin : Éclipses » (dates + Saros + maisons) et un « Calendrier des Temps Forts » par trimestre (vérifié sur le rendu François RAIFAUD 2026).

### 11.2 Design proposé (robuste, sans toucher le moteur)
1. **Source unique inchangée** : `heatmapData` (12×N) reste la seule vérité, produite par `N8N Prev`. **Aucune modification moteur.** → zéro risque pour technique/données.
2. **Heatmap simplifiée (final) = simple ré-agrégation de présentation** : sommer/moyenner les lignes des maisons de chaque chapitre → **heatmap à 4 lignes** (une par thème), mêmes colonnes temporelles. Les chiffres se réconcilient toujours avec la version 12 maisons (ce sont des agrégats).
3. **Garde-fou anti-divergence** : le mapping maison→thème vient d'**une seule source partagée** (`CHAP_STRUCT_PREV`), la **même** que celle des chapitres du récit. Conséquence : la heatmap thématique et les chapitres du récit **ne peuvent pas diverger** (une maison déplacée de thème met à jour les deux d'un coup).
4. **Rapports technique/données** : on **ne les touche pas** (principe THEME) → ils gardent la heatmap 12 maisons actuelle.

### 11.3 Risque résiduel à arbitrer
- **Triplication du rendu** : si on ne touche pas technique/données, leur rendu heatmap 12 maisons reste du code dupliqué (statu quo). Option « propre » = centraliser le rendu heatmap dans un fichier source partagé inliné au déploiement (modèle `labels.mjs`), mais cela imposerait d'éditer aussi technique/données (contre le principe « ne pas toucher »). → **trade-off : statu quo dupliqué (sûr) vs centralisation (plus propre mais touche les 3 rapports)**.

---

## 12. HARMONISATION « BY DESIGN » des 3 rapports — le modèle THEME à répliquer

Le `deploy.mjs` THEME montre la recette qui évite la galère de drift :

1. **Le refactor récit ne touche QUE la chaîne du rapport final.** THEME édite `Découpage → Traducteur → Assemble → Générateur final` et **laisse intacts** `6. Génération HTML3` (technique) et `5. Générer Fichier HTML1` (données). → pour PREV : on n'édite que la chaîne finale (équivalent : `N8N Prev Trad LLM` + nœud rendu final), **jamais** les rapports technique/données.
2. **Fichiers sources partagés** (`labels.mjs`, render libs, `validator.mjs`, `facts`) = **source unique de vérité** ; inlinés dans les nœuds au déploiement (`strip()` retire import/export + concat + `node --check`). → pour PREV : un `labels-prev.mjs` (CHAP_STRUCT PREV + libellés FR/EN + modes d'adresse) partagé par le découpage ET la heatmap thématique ET le rendu.
3. **`print-rules.css` commun** déjà injecté sur les 3 rapports PREV (`_deploy-print-css.mjs`). → le **nouveau** nœud rendu récit devra être **ajouté à ce déploiement** (sinon pas de durcissement page-break).
4. **Contrats amont communs** (période, granularité, header luminaires, couleurs de thème, `heatmapData`, `eventSignatures`) produits dans `N8N Prev` et consommés à l'identique → ne pas changer l'amont = les 3 rapports restent cohérents par construction.

### 12.1 Décisions figées (2026-06-15)
- **Heatmap** : statu quo dupliqué. On NE touche PAS technique/données (ils gardent la heatmap 12 maisons). On écrit UNIQUEMENT le rendu thématique 4 lignes dans le nœud rapport final.
- **Harmonisation** : on n'édite QUE la chaîne du rapport final (modèle THEME). Source unique `CHAP_STRUCT_PREV` partagée récit + heatmap thématique. Ajouter le nœud final au `_deploy-print-css.mjs`.

---

## 13. TOPOLOGIE RÉELLE PREV (workflow `szL522DJiXkppyt1` — PROD, dump 2026-06-04, vérifiée)

### 13.1 Les 3 rapports = 3 PDF livrés (`PREV SITE 3 PDF tiers`)

| Rôle (vocabulaire client) | Nœud rendu HTML n8n | Alimenté par | → PDF | Toucher ? |
|---|---|---|---|---|
| **Données techniques** (brut maison/maison) | `Rapport HTML Sécurisé2` | `Merge2` (= Merge + Merge1 + Synthèse) | `Convert HTML to PDF2` | ❌ NON |
| **Technique** (analyse maison/maison) | `Rapport Technique HTML v1` | `Analyseur Technique v` | `Convert HTML to PDF` | ❌ NON |
| **Final client** (vulgarisé → à refondre en récit) | `Générateur HTML Prévisions3` | `2. Traducteur Prévisions` | `Contrôle Données Prévisions → Prépare HTML → PDF → Merge PDF → Convert HTML → PDF` | ✅ OUI |

### 13.2 La chaîne du rapport final est DÉJÀ structurée comme le récit THEME

```
Merge2 → Merge3 → 1. Découpage Prévisions → 2. Traducteur Prévisions → Générateur HTML Prévisions3 → Contrôle Données Prévisions → Prépare HTML → PDF
```

Correspondance **directe** avec le `deploy.mjs` THEME (`Découpage → Traducteur → [Assemble] → Générateur final`) :

| THEME | PREV (équivalent) | Action récit |
|---|---|---|
| `1. Découpage (Boucle)2` | `1. Découpage Prévisions` | injecter prompts par chapitre thématique (CHAP_STRUCT_PREV) |
| `2. Traducteur (1 par 1)` | `2. Traducteur Prévisions` | systemMessage = prompt récit-écrivain |
| `Assemble Récit + Validateur` (inséré) | *(à insérer entre Traducteur et Générateur)* | assemble + validateur (anti-hallucination) |
| `Générateur de rapport final1` | `Générateur HTML Prévisions3` | rendu récit + sommaire dynamique + heatmap thématique 4 lignes |

> **Conséquence majeure** : la migration PREV ne crée presque aucune plomberie nouvelle. On réutilise les nœuds existants `1. Découpage Prévisions` / `2. Traducteur Prévisions` / `Générateur HTML Prévisions3`, on insère un `Assemble`, et on laisse les 2 autres rapports + tout l'amont (`N8N Prev`, heatmapData, Synthèse) **strictement intacts**. C'est l'harmonisation by-design.

### 13.3 À confirmer en début d'implémentation (lecture jsCode, pas de risque)
- Mapping fichiers `FRA/PREV/N8N Prev Repport HTML*` ↔ noms de nœuds (titres `<h1>` distinctifs).
- Localiser le bloc rendu heatmap dans `Générateur HTML Prévisions3` (le remplacer par la version 4 lignes).

---

## 14. MÉTHODO DEV — préprod only + tampon données + harmonisation de forme (figé 2026-06-15)

### 14.1 Garanties de cadrage
- **Préprod uniquement** : `N8N_PREV_WORKFLOW_ID_PREPROD = jKwmxAm3HvjpHC5U`, webhook `prev-site-order-preprod`. La PROD `szL522DJiXkppyt1` n'est JAMAIS éditée pendant la R&D.
- **Jeu de données** : François Raifaud (12/11/1987, 13H15, Nantes), `rapport=Annuel, annee=2026` (01/01→31/12). Granularités fines testées via le même trigger (`Mensuel`/`Hebdomadaire`/`Journalier`).
- **Harmonisation de forme by-design** : le générateur récit réutilise **verbatim** le shell visuel commun aux 3 rapports (police `Playfair Display`+`Source Sans 3`, header `#1F3864`, conteneur `max-width:820px`) et est ajouté au `_deploy-print-css.mjs`. Aucune divergence de CSS/typo possible.

### 14.2 Tampon = capture une fois, itère gratuitement (modèle THEME `recit-local.mjs`)
1. **Run #1 (capture)** : `npx dotenv -e .env.local -- node scripts/_recit/_prev-trigger-francois.mjs`
   → déclenche 1 prévision préprod, capture **toutes** les sorties de nœuds dans `scripts/_wheel-fixtures/prev-francois-raifaud-2026.json` (Synthèse, 12 Maisons, Traducteur, heatmapData, Extract Variables…).
2. **Itération locale** (zéro LLM, zéro n8n, ~9 s) : on rejoue le code du générateur final sur la fixture via `prev-recit-local.mjs` (à créer après run #1, clone de `recit-local.mjs`), injection `print-rules.css`, rendu PDF Gotenberg + pages PNG.
3. **Run #2 (une seule fois)** : après avoir construit+déployé la chaîne récit (découpage→traducteur→assemble) sur la préprod, on re-capture pour figer la sortie `Assemble` → ensuite itération render/CSS infinie sans run.

> Budget : ~2 runs de ~30 min au total, puis itérations instantanées. C'est exactement la « mise en tampon » demandée.

### 14.3 Ordre d'exécution
- [ ] Run #1 capture (fixture François 2026 Annuel).
- [ ] Créer `prev-recit-local.mjs` + extraire le code actuel de `Générateur HTML Prévisions3` en `_prev-node-gen.js` (base d'itération).
- [ ] Valider la boucle locale sur le rendu ACTUEL (avant refonte) = sanity check.
- [ ] Coder la refonte récit en local, itérer.
- [ ] Run #2 (récit déployé préprod) → re-capture → finitions render/CSS.

---

## 15. DÉCISION CHAPITRAGE PREV — verrouillée 2026-06-15 (§10.1 tranché)

Réponse §10.1 = **Piste B (chapitres dédiés prévisions)**, orientés domaines de vie (pas le découpage natal THEME, car une prévision parle d'évolution dans le temps) :

```js
const CHAP_PREV = [
  { id:'c1', titre:'Toi, ton cap, ton énergie',        maisons:[1,10,9],  icone:'🧭' },
  { id:'c2', titre:'Cœur, liens & proches',            maisons:[7,5,4],   icone:'❤️' },
  { id:'c3', titre:'Argent, travail & quotidien',      maisons:[2,6,11],  icone:'💼' },
  { id:'c4', titre:'Profondeurs & transformations',    maisons:[8,12,3],  icone:'🌑' },
];
```

- **Source unique** : ce `CHAP_PREV` sert à la fois au regroupement narratif ET à la heatmap thématique 4 lignes (garantie anti-divergence, cf. §11.2).
- **Calendrier des temps forts** (§10.2) : chapitre d'ouverture autonome (éclipses + fenêtres de pics datées, déjà produits par la Synthèse + `heatmapData.eventSignatures`), PUIS rappel des dates dans chaque chapitre.
- **Granularités fines** (§10.4) : on garde la génération 12 maisons (pas de modif moteur) ; le récit module la profondeur au rendu (Annuel = 4 chapitres pleins ; Hebdo/Journalier = format resserré).

### 15.1 Stratégie V1 (local, sans LLM) → V2 (2e passe LLM)
- **V1** : le générateur récit **regroupe les textes maison déjà vulgarisés** (fixture) sous les 4 chapitres + intro Synthèse + calendrier + heatmap 4 lignes + sommaire dynamique. Entièrement local, valide la FORME.
- **V2** : 2e passe LLM (découpage→traducteur→assemble) qui **ré-écrit** les 4 chapitres en récit fluide (run #2 préprod), puis itération render finale.

---

## 16. GARDE-FOU ANTI-HALLUCINATION V2 (construit + testé 2026-06-15)

La 2ᵉ passe LLM (fusion/condensation) est le point de risque d'hallucination. Double garde, modèle THEME (`validator.mjs` + `assemble.mjs`) transposé en **temporel** :

### 16.1 Faits réels opposables (`_prev-facts.mjs` → `buildPrevFacts`)
Liste fermée extraite des nœuds n8n / fixture :
- **Éclipses** (`Analyseur Technique v.eclipses`) : date + signe + type + Saros (2026 : 17/02 Annulaire Verseau, 28/08 Partielle Poissons).
- **Stations** (`stations_retro`) : date + planète + signe (21/03 Mercure, 07/05 Pluton, 06/06 Junon, 16/10 Pluton).
- **Signes réellement transités** par planète (depuis `Download Transits`, 365 j) → garde « planète en signe ».
- ⚠️ Les `peakWindow.peakDates` des `eventSignatures` sont **VOLONTAIREMENT exclues** (falsifiables ~23 %, pivot `celeste_keep`).

### 16.2 Garde PAR CONSTRUCTION (entrée) — `_prev-decoupage.mjs`
- `sanitizeFakeDates()` : dans la Synthèse + les 12 analyses techniques sources, toute date jour-précise **hors liste réelle** est rabaissée au mois (« le 14 janvier » → « en janvier »). Le LLM n'a donc **aucune fausse date à recopier**.
- Seules les **6 dates célestes réelles** sont fournies, via un bloc « CALENDRIER RÉEL » par chapitre (filtré par maison touchée).
- Règle de prompt « GARDE TEMPORELLE » : citer uniquement ces dates, sinon parler en mois/saisons.
- **Audit** (`_prev-test-decoupage.mjs`) : 0 fuite de peakDate falsifiable dans les prompts (les 3 dates restantes = les vraies dates injectées).

### 16.3 Garde PAR VALIDATION (sortie) — `_prev-validator.mjs` + `_prev-assemble.mjs`
`validatePrevRecit()` signale (sans bloquer, loggué dans `Prev Logs`) :
- `invented_date` : date jour-précise (FR/EN/numérique) hors liste réelle (±2 j tolérance) ;
- `eclipse_sign_mismatch` : « éclipse … en <signe> » incohérent avec les éclipses réelles ;
- `transit_sign_mismatch` : « <planète> en <signe> » jamais transité sur la période.
- **Red-team 7/7** : dates inventées et incohérences détectées, dates/éclipses/transits réels laissés passer.

### 16.4 Constat collatéral majeur
Le rapport PREV **actuel** (Traducteur 1:1, prompt « ne jamais résumer / aussi long que l'original ») injecte **~120 dates jour-précises falsifiables** au client (12 maisons). La V2 les supprime par construction. → argument fort pour la migration, au-delà du gain de pages.

---

## 10. Questions de fond à trancher ensemble (réflexion, pas sur un coin de table)

1. **Regroupement thématique PREV** (§4) : Piste A (réutiliser THEME), B (dédié prévisions), ou C (piloté par activation) ?
2. **Place du calendrier des temps forts** : chapitre d'ouverture autonome, ou dates réelles **tissées dans chaque chapitre thématique** (ex. « ce printemps, une éclipse réveille votre sphère du couple ») ?
3. **Heatmap** : la garder (ré-agrégée par thème) ou la retirer du rapport final client (et la laisser au technique) ?
4. **Granularités fines** : accepte-t-on de garder la génération des 12 maisons en amont même pour Journalier (coût LLM, zéro modif moteur), ou vise-t-on une génération réduite (modif moteur, branche dtc/*) ?
