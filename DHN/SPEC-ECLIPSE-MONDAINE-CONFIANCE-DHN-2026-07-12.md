# SPEC — Couche « éclipse mondaine = confiance + fenêtre » (DHN Phase B)
> Statut : 🔴 NO-GO (réfutée par la mesure produit AVANT code — 2026-07-12)
> Lié à : `FRA/DHN/BILAN-DP-RERANK-NIVEAU-A-2026-07-12.md` (preuves), `FRA/DHN/N8N DHN` (cible)
> Date : 2026-07-12

## ⛔ VERDICT (mesure produit sur 28 cas AA, AVANT toute ligne de code)

La feature est **REFUSÉE**. Le gate SPEC §8.1 (rétention vraie minute ≥ 85 %, largeur
≤ 60 min) **échoue sur toutes les variantes** :

| Bande | largeur médiane | rétention (ALL 22 firing / TEST 8) |
|---|---|---|
| UNION (ecl>0) | 60-69 min | **59 % / 50 %** |
| STRONG (ecl ≥ ½max) | 48-51 min | **36 % / 50 %** |
| **HIGH (corroboration ≥ 2)** | **9 min** | **33 % / 0 %** |

**Cause racine** : le percentile 17-22 % (bon *classeur moyen*) est un **mirage au niveau
produit**. Par cas, l'éclipse mondaine tombe sur le **bon** angle ~55-60 % du temps
seulement ; sinon elle allume une **fausse bande**. La règle « corroboration ≥ 2 »,
censée sécuriser la haute confiance, produit au contraire de la **fausse précision**
(fenêtre 9 min affichée « confiante » mais juste 0-33 % du temps). Annoncer une fenêtre
resserrée serait **trompeur ~1 fois sur 2**. Inacceptable pour un produit payant.

**Conséquence** : aucun code. La spec ci-dessous est conservée pour trace (ce qui a été
tenté et pourquoi c'est refusé). Ne pas rouvrir sans un mécanisme qui passe le gate
rétention ≥ 85 % sur données hors échantillon.

---

_(spec initiale ci-dessous, à titre documentaire)_

## 0. Résumé exécutif

Ajouter à DHN **un seul** signal nouveau : l'**éclipse mondaine (réelle) conjointe à un
angle natal** du domaine d'un événement, utilisée comme **indicateur de confiance +
resserrement de la fenêtre horaire annoncée**. **Ce n'est PAS un contributeur de score**
(pas d'ajout dans `totalScore`) et **ça ne touche NI l'étage signe NI le classement des
slots**. C'est une **lecture géométrique parallèle** qui enrichit la sortie produit.

Tout le reste a été testé et **écarté** (voir bilan) : directions primaires (NO-GO,
inférieures à l'arc solaire déjà présent, à la résolution DHN), re-ranker fusionné
(NO-GO, ≈ hasard), ajout de couche dans la somme (dilution prouvée).

## 1. Pourquoi (preuves, cf. bilan)

- L'éclipse mondaine sur angle est le **meilleur classeur** mesuré de la vraie minute :
  **percentile médian 17-22 %** (train/test hors échantillon) vs ~34-49 % pour les
  couches-score de DHN (proche du hasard 50 %).
- Elle **s'allume dans 78 % des cas** (22/28 cas AA testés).
- Elle est **absente de DHN** : le moteur n'a qu'un tie-break sur éclipses **progressées**
  (`/progressions/eclipses`, apparié par *date de vie*), jamais l'éclipse **réelle au degré**
  conjointe à un **angle natal**.
- Doctrine : l'éclipse est un **déclencheur daté** (Brady, *Predictive Astrology*) ; une
  éclipse au degré d'un angle natal marque une **période-clé** liée à cet angle.

## 2. Principe géométrique (ce qui rend le signal exploitable)

Une éclipse a un **degré fixe** sur l'écliptique (≈ longitude du Soleil à la date ;
+180° pour une éclipse lunaire). Un **angle natal** (ASC/MC/DSC/IC) balaie ~1°/4 min selon
l'heure de naissance. Donc « éclipse conj angle » n'est vrai que sur une **bande étroite
d'heures de naissance** (~±orbe → **±8 min** pour l'ASC à 2° d'orbe).

⇒ Chaque (éclipse × événement × angle-du-domaine) qui « tombe juste » désigne une **bande
horaire candidate** de ~15-30 min. **La confiance vient de la CORROBORATION** : plusieurs
événements dont l'éclipse marque le **même** angle-heure pointent la même bande.

## 3. Périmètre

**DANS le périmètre :**
- Calcul d'un objet `mundaneEclipse` : bandes horaires favorisées + niveau de confiance.
- Enrichissement de la **sortie** (JSON + HTML) : badge confiance + fenêtre resserrée.

**HORS périmètre (ne pas toucher) :**
- `totalScore` et ses 5 couches (`wScore+arcScore+progScore+srScore+transitScore`, L941).
- L'étage **signe** (classement `signScoreMean`, top-K).
- Le tie-break **éclipse progressée** existant (`[v8.0 ECLIPSE TIE-BREAK]`, L1084-1290) :
  il **reste inchangé** (voir §5, coexistence).
- Aucune direction primaire, aucun re-ranker fusionné (NO-GO actés).

## 4. Distinction claire vs l'existant

| | Tie-break existant (v8.0) | NOUVELLE couche (cette spec) |
|---|---|---|
| Éclipse | **progressée** (jour-pour-an) | **mondaine / réelle** (date calendaire) |
| Endpoint | `/progressions/eclipses` | `/eclipses` + `/transits` (degré) |
| Appariement | par **date de vie** ±N j | par **degré conj angle natal** (±orbe) |
| Effet | **ajoute** `eclipsScore×2.5` au score, **trie** slots/signes | **n'ajoute rien** au score ; **confiance + fenêtre** seulement |
| Rôle | départage (score) | lecture produit (confiance) |

Les deux **coexistent** : l'un trie (score), l'autre qualifie (confiance/fenêtre). Ils ne
se recouvrent pas (progressé ≠ mondain).

## 5. Algorithme (self-contained, PROD-safe n8n)

Entrées disponibles dans le nœud `Resultat final1` : `events` (avec `type`,`year`,`month`,
`day`,`label`), `birthY/M/D`, `lat/lon/tz`, la liste `validDetail` (slots avec `time`,
`ascDeg`,`mcDeg`,`ascSign`,`wSign`), le signe gagnant et son best slot.

### 5.1 Domaine angulaire par type d'événement (repris du harness validé)
```
mariage/rupture/separation → [DSC, ASC]     enfant → [DSC, IC, ASC]
carriere/promotion         → [MC, ASC]      deces  → [IC, ASC]
maladie                    → [ASC, IC]      accident → [ASC, MC]
demenagement               → [IC, MC]
```
(angle → degré du slot : ASC=`ascDeg`, MC=`mcDeg`, DSC=`ascDeg+180`, IC=`mcDeg+180`.)

### 5.2 Récupération des éclipses mondaines (1 appel liste + N degrés, cachés)
1. `GET http://46.225.174.155:8000/eclipses?date_debut=DD/MM/YYYY&date_fin=DD/MM/YYYY`
   sur `[minYear-1 ; maxYear+1]` des events. Récupère `{date_maximum, astre}`.
   ⚠ concat manuelle + `encodeURIComponent` (pas d'`URLSearchParams` en vm2, cf. L1130).
2. Ne garder que les éclipses à **±`ECL_MONTHS` (=2) mois** d'un event.
3. Pour chaque éclipse retenue, obtenir le **degré du luminaire** :
   `GET .../transits?date_debut=YYYY-MM-DD&date_fin=YYYY-MM-DD` (même date), lire
   `planetes.Soleil.longitude_absolue`. **Degré éclipse** = Soleil (solaire) ou
   Soleil+180 (lunaire). **Cacher** par date (une éclipse peut servir plusieurs events).
   *Optimisation possible* : si `/eclipses` renvoie déjà une longitude, l'utiliser et
   éviter l'appel `/transits`. **Budget appels ≤ ~12/cas** (1 liste + ~10 degrés).

### 5.3 Bandes horaires favorisées (par balayage de la fenêtre du signe gagnant)
Pour chaque slot de la fenêtre du **signe gagnant** (déjà calculés dans `validDetail`,
filtrés `wSign===signeGagnant`) :
```
eclScore(slot) = max sur (events e, angles a∈domaine(e), éclipses el de e) de :
                 conjTight(el.deg, angleDeg(slot,a))    // 0 si |Δ| > ORB_ECL, sinon 1−|Δ|/ORB_ECL
corrob(slot)   = nb d'ÉVÉNEMENTS DISTINCTS dont une éclipse conj un angle du slot (orbe)
```
- **Bande favorisée** = plage de slots contigus où `eclScore>0` autour de chaque pic.
- **ORB_ECL = 2.0°** (conjonction seule ; validé).

### 5.4 Niveau de confiance (règles, pas de score)
- **HIGH** : `corrob ≥ 2` (≥ 2 événements marquent le même angle-heure) **OU** 1 événement
  avec orbe ≤ 1° sur un angle **cardinal du domaine principal**. → fenêtre = bande resserrée.
- **MEDIUM** : exactement 1 corroboration, orbe ∈ ]1° ; 2°]. → fenêtre modérément resserrée.
- **LOW / N-A** : aucune éclipse ne s'allume (≈ 22 % des cas). → **fenêtre inchangée**
  (fenêtre du signe), confiance = celle du questionnaire seul.

### 5.5 Fenêtre annoncée
- HIGH/MEDIUM : `[min(slot.time), max(slot.time)]` de la bande favorisée (⋃ des bandes si
  plusieurs pics cohérents). Typiquement ~30-60 min (vs ~140 min du signe entier).
- Le **best slot (heure probable)** **reste celui de DHN** (`totalScore` argmax) — la couche
  éclipse **ne déplace pas** le point ; elle **encadre** et **qualifie**. Si le best slot
  DHN tombe **hors** de la bande HIGH, le signaler (`bestOutsideBand=true`) sans le déplacer.

## 6. Sortie produit

### 6.1 JSON (objet ajouté au résultat final, à côté de `eclipseAudit`)
```json
"mundaneEclipse": {
  "confidence": "HIGH|MEDIUM|LOW|NA",
  "window": {"start":"HH:MM","end":"HH:MM","widthMin":45},
  "corroboration": 2,
  "bestSlotInsideBand": true,
  "hits": [
    {"event":"mariage 1959","angle":"DSC","eclipseDate":"1959-04-08",
     "eclipseType":"solaire","orbDeg":0.7,"bandStart":"04:10","bandEnd":"04:34"}
  ],
  "note": "Éclipse mondaine sur DSC corroborée par 2 événements → fenêtre resserrée."
}
```
### 6.2 HTML (bloc dédié, sous la fenêtre horaire)
- Badge confiance (HIGH = vert / MEDIUM = orange / LOW = gris).
- Phrase pédagogique : « Une éclipse du <date> tombe sur votre <angle> au moment d'un
  événement marquant (<label>), ce qui renforce la fenêtre <start–end>. »
- ⚠ Ne jamais promettre l'heure exacte : parler de **fenêtre** et de **confiance**.

## 7. PROD-safety (sandbox n8n vm2) — bloquant

- **Pas d'`URLSearchParams`** → concat manuelle + `encodeURIComponent` (cf. L1130-1138).
- **Pas de** `process`, `require`, `fs`, `Buffer`, `__dirname`. Self-contained.
- Logs : `console.log` uniquement.
- **Dégradation gracieuse** : tout échec réseau/parse `/eclipses` ou `/transits` ⇒
  `mundaneEclipse.confidence="NA"` + `note` d'erreur, **le rapport se génère normalement**
  (jamais d'exception qui casse le nœud). Envelopper dans `try/catch`, timeouts courts.
- **Budget & idempotence** : cache par date d'éclipse ; `≤ ~12` requêtes/cas ; réutiliser
  `transitsByDate` si la date coïncide.
- **Adaptatif** (optionnel, aligné v8.0) : ne lancer la couche que si le produit affiche
  déjà une fenêtre (toujours le cas) — pas de gain à la couper, coût faible.

## 8. Plan de validation (GATES — dans l'ordre, aucun skip)

1. **Rejouer la mesure produit** sur les 28 cas AA (`dhn-phaseB-hour.mjs` étendu) :
   - **GATE GO** : quand une éclipse s'allume (~78 % des cas), la **bande HIGH/MEDIUM
     retient la vraie minute** dans **≥ 85 %** des cas, pour une largeur médiane **≤ 60 min**
     (vs ~140 min). (En interne : la vraie minute est au top-17-22 % de `eclScore`.)
   - **GATE NO-GO** : rétention < 75 % OU largeur médiane > 90 min → la couche n'apporte
     pas assez, on n'implémente pas.
2. **Smoke preprod** : lancer DHN preprod sur 2-3 cas connus (ex. Bardot, un cas AA neuf) ;
   vérifier que `mundaneEclipse` se calcule, s'affiche, et que **le rapport ne casse pas**
   même en coupant le réseau éclipse (test de dégradation).
3. **Non-régression** : `totalScore`, classement signe et best slot **identiques** avec/sans
   la couche (elle ne touche pas le score) — diff bit-à-bit sur un cas témoin.

## 9. Points d'intégration (nœud `Resultat final1`)

- **Fetch + calcul** : après le tie-break existant (~L1290) et après que le signe gagnant
  + sa fenêtre de slots sont connus ; réutiliser `validDetail`, `_eclipseFetchWindow()`,
  le pattern `fetch(url,{method:'GET',headers:{Accept:'application/json'}})` (L1193).
- **Sortie JSON** : ajouter `mundaneEclipse` à l'objet résultat final (près de L1747).
- **HTML** : nouveau bloc après la fenêtre horaire (près de L1651, méthode/fenêtre).

## 10. Livraison (règles workspace)

- **Branche** : `dhn/eclipse-confiance-2026-07-12` (⚠ **PAS `dtc/*`** : `FRA/DHN/*` et
  `scripts/_enprat/*` sont interdits sur `dtc/*`, réservé au moteur PREV —
  `dtc-branches-separation.mdc`).
- **Déploiement** : DHN a un script dédié → `npx dotenv -e .env.local -- node
  scripts/dhn-deploy-code.mjs` (nœud `Resultat final1`), cf. `n8n-prod-tedwarehouse.mdc`.
- **Backup GitHub OBLIGATOIRE même session** (`prod-deploy-github-backup.mdc`) : après PUT
  prod OK, committer le miroir `FRA/DHN/N8N DHN` + cette spec + le bilan sur `FRA`.
- **Doc** : mettre à jour `FRA/DHN/DOCUMENTATION WORKFLOW *` si la structure de sortie change.

## 11. Risques & limites (honnêteté produit)

- **Sparse** : ~22 % des cas sans éclipse → confiance LOW, aucune amélioration (fallback
  propre, pas de régression).
- **Pas un oracle de la minute** : encadre/qualifie, ne pointe pas la minute (le point reste
  celui de DHN). Erreur ponctuelle inchangée ; le gain est **fenêtre + confiance**.
- **Dépendance API** (`/eclipses`, `/transits`) : géré par dégradation gracieuse.
- **Faux positif possible** : une éclipse peut conj un angle par coïncidence. La règle de
  **corroboration ≥ 2** pour HIGH limite ce risque.

## 12. Checklist validation utilisateur (avant code)

- [ ] Périmètre OK : couche **confiance/fenêtre**, **jamais** dans le score, tie-break v8.0 intact.
- [ ] Modèle de confiance OK (HIGH/MEDIUM/LOW, corroboration ≥ 2).
- [ ] Gates de validation OK (rétention ≥ 85 %, largeur ≤ 60 min) avant tout déploiement.
- [ ] Branche `dhn/*` + backup FRA même session : OK.
- [ ] **« OK code »** explicite ⇒ implémentation ; sinon, ajustements de la spec.
