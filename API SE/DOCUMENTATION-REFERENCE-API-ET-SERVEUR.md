# Référence exhaustive — API Astro (`main.py`) et serveur `astro-server`

**Rôle de ce document** : consolider en un seul endroit **tous les contrats HTTP**, le **comportement interne** du code, l’**arborescence serveur**, l’**infra** (systemd, nginx, Docker Gotenberg) et les **règles de non-régression**. Les détails opérationnels longs (reconstruction VM, UFW, fail2ban, runbook incidents) restent dans **[INVENTAIRE-SERVEUR-ASTRO-SWISSEPH-GOTENBERG.md](./INVENTAIRE-SERVEUR-ASTRO-SWISSEPH-GOTENBERG.md)** ; le **fil des interventions** dans **[JOURNAL-OPERATIONS.md](./JOURNAL-OPERATIONS.md)** ; les **URLs n8n** dans **[CORRESPONDANCE-IP-URL-N8N.md](./CORRESPONDANCE-IP-URL-N8N.md)**.

**Dernière mise à jour rédactionnelle** : 2026-06-02 (ajout `POST /solar-return`, `POST /lunar-return` avec **relocation Volguine** + intégration `Prepare Data` v12, `POST /directions/primary`, `POST /batch/western/planets` — exhaustivité 12/12 endpoints serveur).

---

## 1. Carte des documents `FRA/API SE`

| Document | Contenu principal |
|----------|-------------------|
| **Ce fichier** | Contrats API exhaustifs, garanties de schéma, implémentation, checklist smoke, index fichiers dossier |
| `INVENTAIRE-SERVEUR-…md` | IP, ports, UFW, systemd, Gotenberg, stack pip, runbook EMFILE, reconstruction serveur |
| `JOURNAL-OPERATIONS.md` | Chronologie des patchs (ex. 2026-04-19 durcissement, 2026-04-21 rollback) |
| `README.md` | Index rapide et liens |
| `main.py` | **Source de vérité** application FastAPI |
| `docker-compose.yml` | **Source de vérité** conteneur Gotenberg |
| `requirements-api-astro.txt` | Gel pip du venv |
| `infra/apply-prod-hardening.sh` | Durcissement rejouable (nginx, sysctl, drop-in systemd, déploiement) |
| `infra/nginx-astro-api.conf` | Modèle site nginx (proxy `:80` → `:8000`) |
| `main.py.server-copy` / `docker-compose.yml.server-copy` | Archives / alignement ponctuel avec la prod |

---

## 2. Identité machine et accès réseau (résumé)

| Élément | Valeur usuelle |
|---------|----------------|
| Hôte | `astro-server` |
| IPv4 publique | `46.225.174.155` |
| API FastAPI (uvicorn) | `http://46.225.174.155:8000` (et `http://127.0.0.1:8000` sur la VM) |
| API derrière nginx (rate limit) | `http://46.225.174.155` (port **80**, mêmes chemins que `:8000`) |
| Gotenberg | `http://46.225.174.155:3000` |
| Répertoire application | `/opt/astro/api` |
| Fichiers éphemeris Swiss | `/opt/astro/api/ephe` |
| Service systemd | `astro-api.service` |
| Commande typique | `systemctl restart astro-api.service` |

Détail disque, IPv6, pare-feu, versions pip : inventaire §2–§7.

---

## 3. Inventaire exhaustif des fichiers du dossier `FRA/API SE`

| Chemin relatif | Description |
|----------------|-------------|
| `main.py` | Application FastAPI : routes §4, middleware clé API, Swiss Ephem, thread-local éphemeris |
| `requirements-api-astro.txt` | Versions gelées FastAPI, uvicorn, pydantic, pyswisseph, etc. |
| `docker-compose.yml` | Service `gotenberg` (image 8, port 3000, `mem_limit`, rotation logs) |
| `README.md` | Index du dossier |
| `INVENTAIRE-SERVEUR-ASTRO-SWISSEPH-GOTENBERG.md` | Bible reconstruction + routes (§8) + incidents |
| `DOCUMENTATION-REFERENCE-API-ET-SERVEUR.md` | **Ce document** — contrats et garanties |
| `JOURNAL-OPERATIONS.md` | Trace datée des opérations |
| `CORRESPONDANCE-IP-URL-N8N.md` | Tableaux migration URL pour workflows n8n |
| `infra/apply-prod-hardening.sh` | Script bash : apt, swap, journald, sysctl, nginx, UFW 80, systemd drop-in, compose |
| `infra/nginx-astro-api.conf` | `proxy_pass` vers `127.0.0.1:8000`, `limit_req` |
| `main.py.server-copy` | Copie de référence / alignement prod |
| `docker-compose.yml.server-copy` | Idem pour Compose |

---

## 4. Référence API — toutes les routes exposées

Schéma interactif : **`GET /docs`** (Swagger), **`GET /openapi.json`**.

### 4.0 Authentification optionnelle (middleware)

- Si la variable d’environnement **`ASTRO_API_KEY`** est définie (fichier serveur typique **`/etc/default/astro-api`**, chargé par le drop-in systemd), toutes les routes **sauf** les chemins suivants exigent le header **`X-API-Key: <valeur>`** :
  - `/health`, `/docs`, `/redoc`, `/openapi.json`, et tout chemin commençant par `/docs`
- Sinon : réponse **401** `{"detail":"Unauthorized"}`.
- Si **`ASTRO_API_KEY`** est vide ou absent : l’API reste **ouverte** (comportement historique).

### 4.1 Modèle `BirthData` (JSON corps POST)

Utilisé par **`POST /western/planets`** et **`POST /western/houses`**.

| Champ | Type | Rôle |
|-------|------|------|
| `year` | int | Année grégorienne |
| `month` | int | 1–12 |
| `date` | int | Jour du mois |
| `hours` | float | Heure locale (peut être fractionnaire) |
| `minutes` | float | Minutes |
| `seconds` | float | Secondes (souvent `0`) |
| `latitude` | float | Latitude ° (nord +) |
| `longitude` | float | Longitude ° (est +) |
| `timezone` | float | **Heures** à **soustraire** pour obtenir l’UT : `UT = h + m/60 + s/3600 - timezone` |

---

### 4.2 `POST /western/planets`

| | |
|--|--|
| **Chemin** | `/western/planets` |
| **Corps** | JSON `BirthData` |
| **Réponse** | `{"statusCode": 200, "output": [ ... ]}` |

**Garantie de schéma (contrat consommateurs n8n / scripts)** :

- Chaque élément de **`output`** possède une clé **`planet`** avec sous-objets **`en`** et **`fr`** (libellés bilingues — **ce n’est pas** la langue du rapport client).
- **Longueur attendue** : **22** entrées, dans cet ordre logique :
  1. **Ascendant** (premier élément ; `swe.houses` Placidus `b"P"`).
  2. **18 corps** dans l’ordre interne `PLANETS` : Soleil, Lune, Mars, Mercure, Jupiter, Vénus, Saturne, Uranus, Neptune, Pluton, Cérès, Vesta, Junon, Pallas, Chiron, Lilith, Nœud moyen, Nœud vrai — chacun avec `FLG_SWIEPH | FLG_SPEED`.
  3. **3 angles dérivés** : Descendant, MC, IC (calculés à partir de `ascmc` ; pas de champs `latitude` / `distance_ua` / `vitesse_longitude` / `declinaison` pour ces trois-là ni pour l’Ascendant).

**Champs par type d’entrée** :

- **Tous** : `planet`, `fullDegree`, `normDegree`, `isRetro` (**chaîne** `"True"` ou `"False"`, pas un booléen JSON), `zodiac_sign` (`number` 1–12, `name.en` / `name.fr`).
- **Planètes de la liste `PLANETS` uniquement** : `latitude`, `distance_ua`, `vitesse_longitude`, `declinaison` (arrondis).

**Interdit (régression avril 2026)** : ajouter dans **`output`** des objets **sans** `planet` (ex. cuspides avec seulement `house`). Les workflows THEME/PREV font `p.planet.en` sans garde. Si des cuspides sont nécessaires ailleurs : **nouvelle route** dédiée (voir journal **règle API**).

---

### 4.3 `POST /western/houses`

| | |
|--|--|
| **Chemin** | `/western/houses` |
| **Corps** | JSON `BirthData` |
| **Réponse** | `{"statusCode": 200, "output": {"Houses": [ ... ]}}` |

- **12** maisons Placidus (`swe.houses`, `b"P"`).
- Chaque maison : `House` (1–12), `degree`, `normDegree`, `zodiac_sign` (même forme que §4.2).

---

### 4.4 `GET /transits`

| | |
|--|--|
| **Query obligatoires** | `date_debut`, `date_fin` — formats **`dd/mm/yyyy`** ou **`yyyy-mm-dd`** |
| **Réponse** | **Tableau** JSON (racine = liste), un objet par **jour civil** entre les deux bornes incluses |

**Comportement** :

- Pour chaque jour : JD à **midi** (`swe.julday(..., 12.0)`).
- Pour chaque entrée de la table interne **`TRANSIT_OBJECTS`** (clés françaises côté JSON) : calcul via `calc_planet_transit` — repli **Moshier** (`FLG_MOSEPH`) puis Swiss (`FLG_SWIEPH`) selon le drapeau `moseph` par corps.
- Clés dans chaque `planetes` : `Soleil`, `Mercure`, `Vénus`, `Mars`, `Jupiter`, `Saturne`, `Uranus`, `Neptune`, `Pluton`, `Chiron`, `Ceres`, `Pallas`, `Junon`, `Vesta`, `Lilith`, `Noeud_Nord` ; **`Noeud_Sud`** est **dérivé** du Nord (longitude +180°, latitude inversée, etc.).

**Objet jour** :

```json
{
  "date": "YYYY-MM-DD",
  "planetes": {
    "Soleil": {
      "longitude_absolue": 0.0,
      "signe": "…",
      "degre_dans_signe": 0.0,
      "est_retrograde": true,
      "source": "SwissEph" | "Moshier",
      "latitude": 0.0,
      "distance_ua": 0.0,
      "vitesse_longitude": 0.0,
      "declinaison": 0.0
    }
  }
}
```

---

### 4.5 `GET /moon`

| | |
|--|--|
| **Query obligatoires** | `date_debut`, `date_fin` (mêmes formats que §4.4) |
| **Réponse** | **Tableau** à la racine |

**Comportement** : premier instant = **00:00** du jour `date_debut` ; borne haute = **12:00** du jour `date_fin` ; à chaque itération on avance de **12 heures** (`current += timedelta(hours=12)`). Lune : **`FLG_MOSEPH | FLG_SPEED`**.

Élément typique :

```json
{
  "date_heure": "YYYY-MM-DD HH:MM",
  "lune": {
    "longitude_absolue": 0.0,
    "signe": "…",
    "degre_dans_signe": 0.0,
    "vitesse_journaliere": 0.0,
    "latitude": 0.0,
    "distance_ua": 0.0,
    "declinaison": 0.0
  }
}
```

---

### 4.6 `GET /eclipses`

| | |
|--|--|
| **Query obligatoires** | `date_debut`, `date_fin` |
| **Réponse** | **Tableau** trié chronologiquement (fusion Soleil + Lune) |

**Implémentation** :

- `ensure_ephe_path()` au début (pas de `set_ephe_path("")` — supprimé pour éviter les courses avec d’autres routes threadées ; voir inventaire §10.2).
- Soleil : boucle `swe.sol_eclipse_when_glob(cur, swe.FLG_MOSEPH)`.
- Lune : boucle `swe.lun_eclipse_when(cur, swe.FLG_MOSEPH)`.
- Types renvoyés : `Totale`, `Annulaire`, `Hybride`, `Partielle`, `Pénombrale` (lune), `Inconnue` si aucun flag connu.

Élément :

```json
{
  "astre": "Soleil" | "Lune",
  "type": "Totale" | "…",
  "date_maximum": "YYYY-MM-DD HH:MM UTC"
}
```

---

### 4.7 `GET /health`

| | |
|--|--|
| **Réponse** | `{"status": "ok"}` |
| **Auth** | Toujours accessible sans `X-API-Key` (même si clé activée). |

---

### 4.8 `GET /progressions`

| | |
|--|--|
| **Query obligatoires** | `date_debut`, `date_fin`, `year`, `month`, `date`, `hours`, `minutes`, `latitude`, `longitude`, `timezone` |
| **Query optionnelle** | `seconds` (défaut **0**) |
| **Réponse** | **Tableau** — un élément par **mois civil** entre `date_debut` et `date_fin` (fonction interne `next_month`) |

**Modèle** : progressions **secondaires** — `age_annees = jours_écoulés_depuis_naissance / 365.25`, `prog_jd = natal_jd + age_annees`.

Pour chaque mois, objet `planetes` :

- Clés **françaises** alignées sur `PLANETS["fr"]` pour les corps calculés.
- Angles **Arc solaire** + `swe.houses_armc` : `Ascendant`, `MC`, `Descendant`, `IC` — pour ces entrées, **`declinaison`** peut être **`null`**.

---

### 4.9 `GET /progressions/eclipses`

| | |
|--|--|
| **Query** | Identique à §4.8 |
| **Réponse** | **Tableau** d’éclipses dans la fenêtre **JD progressée**, avec correspondance « date de vie » |

- Garde-fou : **50** itérations max par famille (soleil / lune).
- Champs : voir inventaire §8.9 (tableau `astre`, `type`, `date_progresse`, `date_vie`, `age_annees`, `visible_lieu_naissance`, `magnitude`, positions).

---

### 4.10 `POST /directions/primary` *(ajouté 2026-05-24 — Phase B P1 DTC)*

| | |
|--|--|
| **Verbe** | `POST` |
| **Body JSON** | `{ "birth": BirthData, "target_year": int, "mode": "rigoureux"\|"strict", "dp_orb_yr": float, "aspects": ["Conjonction", "Carré", ...] }` |
| **Réponse** | Directions primaires Naibod (semi-arc) Swiss Eph (β réel + ε variable en mode rigoureux) |

**Doctrine source** : Brady *Predictive Astrology* Ch.6 R.6.9 (Solar Arc + Primary Directions Naibod key). Audit Phase A DP `SITE/scripts/dtc/PHASE-A-DIAG-2026-05-24.md` : mode `rigoureux` (β écliptique réel des planètes natales via swisseph, obliquité variable à l'année cible) corrige −39 modulateurs DP nets vs le calcul JS Super noeud1 historique (β=0, ε=23.4393° fixe). Mode `strict` = fallback bit-identique au calcul JS legacy (utilisé en cas d'audit ISO).

**Paramètres** :
- `birth` : `BirthData` (§4.1) — coordonnées + date de naissance
- `target_year` : int — année cible (l'API fixe la date à 1er juillet 12h UT)
- `mode` : `"rigoureux"` (défaut) ou `"strict"`
- `dp_orb_yr` : float (défaut **1.0**) — fenêtre orbe en années Naibod (`_DP_NAIBOD = 0.985647°` d'AR/an)
- `aspects` : optionnel, sous-ensemble parmi `Conjonction` (0°) / `Opposition` (180°) / `Carré` (90°) / `Trigone` (120°) / `Sextile` (60°). Défaut = tous les 5.

**Garanties contrat** :
- `output.age_years` : âge approximatif (years to target_year, granularité 1er juillet)
- `output.jd_birth`, `output.jd_year_mid`, `output.epsilon_deg`, `output.lat_geo`, `output.mode` : metadonnées
- `output.natal_positions` : dict FR `{Soleil|Lune|...|Pluton|Nœud Nord|Nœud Sud}` chacun avec `lon` (longitude écliptique), `lat_ecl` (latitude écliptique β, 0 en mode `strict`), `ra` (Right Ascension), `dec` (déclinaison)
- `output.n_hits` : nombre de hits après dédup axial
- `output.hits` : tableau de directions primaires actives dans la fenêtre orbe :
  - `promissor` : planète ou angle qui dirige (10 planètes + 2 nœuds + 4 angles)
  - `significator` : angle ou luminaire qui reçoit (MC/IC/ASC/DSC + Soleil/Lune)
  - `aspect` : un des 5 ptolémaïques
  - `orbYears` : orbe résiduel en années Naibod
  - `orbDeg` : orbe résiduel en degrés AR
  - `direction` : `directe` ou `converse`
  - `exactAge` : âge exact où le hit est juste (peut être < `age_years` si la DP est déjà passée)

**Consommateurs** :
- `FRA/PREV/N8N Prev Prepare Data` L42-48 — appel POST avec `mode: "rigoureux"`, `dp_orb_yr: 1.0`. Le résultat est exposé sous `prepareOut._mdsePrimaryDirectionsApi` consommé par `FRA/PREV/N8N Prev` L6172-6175 (P42 — Phase B P1).
- Fail-safe : si l'API échoue/timeout (>15s), le Super noeud1 bascule automatiquement sur le calcul JS Naibod legacy conservé en fallback (β=0, ε fixe) — voir `FRA/PREV/N8N Prev` L6126-6211.
- Le type `primary_direction` est consommé par les 14 matrices MDSE DTC v20 avec poids 14-18 (cf. `FRA/PREV/N8N Prev` L6894/L6963/L7014/etc.).

### 4.11 `POST /solar-return` *(ajouté 2026-06-02 — TRANCHE 3 V23, relocation patch v12)*

| | |
|--|--|
| **Verbe** | `POST` |
| **Body JSON** | `{ "natal": BirthData, "year": int, "precessed": bool, "relocation_lat": float?, "relocation_lon": float?, "relocation_label": str? }` |
| **Réponse** | Carte de Révolution Solaire (SR) precessed-only par défaut, **relocalisée au lieu fourni** ou fallback lieu natal |

**Doctrine source** : Brady *Predictive Astrology* Ch.6 R.6.1 ("Solar Return read as stand-alone chart of the year") + Rushman *Art of Predictive Astrology* Ch.5 R.5.1 + Teal *Predictive Astrology* Ch.10 R.T.10.1.

**Méthode** : recherche dichotomique Newton sur longitude solaire (`swe.calc_ut(SUN)` itéré ~5-15 fois jusqu'à tolérance `1e-5°`). Précession (`precessed: true`, défaut) = ajustement de cible par `age_years × 50.29″/an` (OQ.T.4 verdict utilisateur 2026-06-02 — voir `SITE/scripts/dtc/doctrines/oq-decisions-2026-06-02.json`).

**Relocation Doctrine B Volguine (patch 2026-06-02 v12)** : Brady Ch.6 R.6.1 et Teal Ch.10 R.T.10.4 stipulent que les cuspides Placidus + ASC/MC/ARMC d'une SR doivent être calculés au **lieu où la personne se trouve à l'instant du retour solaire**, pas au lieu natal.
- Si `relocation_lat` ∈ [-90, 90] **et** `relocation_lon` ∈ [-180, 180] sont fournis → cuspides recalculées au lieu de relocation.
- Sinon (null/absent/hors borne) → fallback automatique sur `natal.latitude / natal.longitude` (SR natale stricte).
- **Important** : les positions planétaires absolues (longitude Soleil/Lune/Mercure/...) sont **globales** et identiques dans les deux cas. Seuls les angles et cuspides changent.

**Garanties contrat** :

- `output.sr_date_utc` : ISO 8601 UTC `YYYY-MM-DDTHH:MM:SSZ` (instant exact du retour)
- `output.sr_julian` : Julian Day UT (6 décimales)
- `output.sun_natal_lon`, `output.sun_target_lon` : longitude écliptique Soleil natal et cible précessée (degrés)
- `output.precessed` : booléen (echo de la requête)
- `output.relocated` : booléen — `true` si la SR a été relocalisée, `false` si fallback natal
- `output.relocation_label` : string ou `null` — label transmis (ex. "Paris, France") ou null si fallback
- `output.lat_used`, `output.lon_used` : coordonnées effectivement utilisées (relocation si fournie, sinon natal)
- `output.planets` : dict FR `{"Soleil"|"Lune"|...|"Pluton"|"Cérès"|"Lilith"|"Nœud moyen"|"Nœud vrai"}` chacune avec `longitude_absolue`/`signe`/`degre_dans_signe`/`est_retrograde`/`latitude`/`distance_ua`/`vitesse_longitude`/`declinaison` (mêmes champs que `/transits`) — **invariants vs relocation**
- `output.cusps` : tableau de 12 cuspides Placidus `{house, longitude, signe, degre_dans_signe}` — **dépend du lieu**
- `output.asc`, `output.mc`, `output.armc` : angles SR (degrés écliptiques + ARMC degrés) — **dépendent du lieu**

**Exemple — SR natale (relocation absente)** :
```bash
curl -X POST http://46.225.174.155:8000/solar-return \
  -H "Content-Type: application/json" \
  -d '{
    "natal": {"year":1879,"month":3,"date":14,"hours":11,"minutes":30,"seconds":0,"latitude":48.4,"longitude":10.0,"timezone":1},
    "year": 1933,
    "precessed": true
  }'
```

→ `sr_date_utc: "1933-03-15T06:53:22Z"`, `relocated: false`, ASC SR = 32.02°, MC SR = 284.53° (Ulm).

**Exemple — SR relocalisée à Paris** :
```bash
curl -X POST http://46.225.174.155:8000/solar-return \
  -H "Content-Type: application/json" \
  -d '{
    "natal": {"year":1879,"month":3,"date":14,"hours":11,"minutes":30,"seconds":0,"latitude":48.4,"longitude":10.0,"timezone":1},
    "year": 1933,
    "precessed": true,
    "relocation_lat": 48.85,
    "relocation_lon": 2.35,
    "relocation_label": "Paris, France"
  }'
```

→ `sr_date_utc: "1933-03-15T06:53:22Z"` (identique), `relocated: true`, ASC SR = 17.33°, MC SR = 277.46° (Paris). Le Soleil reste au même degré (354.25°), seuls les angles et maisons changent.

**Consommateurs** :
- `FRA/PREV/N8N Prev Prepare Data` v12 (2026-06-02) : lit `birthday_place_lat / _lng / _formatted_address` depuis le payload webhook (formulaire site « lieu prochain anniversaire ») et les passe en `relocation_lat / _lon / _label`. Exposé en aval comme `prepareOut._v23SolarReturn`.

### 4.12 `POST /lunar-return` *(ajouté 2026-06-02 — TRANCHE 3 V23, relocation patch v12)*

| | |
|--|--|
| **Verbe** | `POST` |
| **Body JSON** | `{ "natal": BirthData, "period_start": "YYYY-MM-DD"\|"DD/MM/YYYY", "period_end": same, "precessed": bool, "relocation_lat": float?, "relocation_lon": float?, "relocation_label": str? }` |
| **Réponse** | Tableau de tous les **retours lunaires** dans la fenêtre temporelle (typiquement ~13 par an, cycle ~27.3 jours), precessed-only par défaut, **relocalisés au lieu fourni** ou fallback lieu natal |

**Doctrine source** : Teal Ch.10 R.T.10.3 ("LR matches SR on a point = trigger month for the year's themes") + R.T.10.4 (relocation) + Brady R.6.1 (Returns lus en stand-alone).

**Méthode** : itération `swe.calc_ut(MOON)` avec recherche Newton (Moon avance ~13°/jour, convergence rapide en ~5-10 itérations). Le curseur avance de 25 jours après chaque retour trouvé pour éviter les doublons. Garde-fou : **50** retours max par appel.

**Relocation Doctrine B Volguine (patch 2026-06-02 v12)** : même comportement que `/solar-return` (cf. §4.11) — paramètres `relocation_lat / _lon / _label` optionnels, validation `[-90, 90]` / `[-180, 180]`, fallback automatique sur natal si invalides. Toutes les 13 LR de la fenêtre utilisent le **même** lieu de relocation (hypothèse : la personne reste dans la même ville sur la période demandée). Si un voyage entre deux LR est attendu, faire deux appels distincts avec deux `relocation_*` différents.

**Garanties contrat** :

- `output.moon_natal_lon`, `output.moon_target_lon` : longitude écliptique Lune natale et cible précessée
- `output.precessed` : echo
- `output.relocated`, `output.relocation_label` : `true`/label si relocation effective, `false`/null sinon
- `output.lat_used`, `output.lon_used` : coordonnées effectives (relocation si fournie, sinon natal)
- `output.count` : nombre de LR trouvées dans la fenêtre
- `output.returns` : tableau d'objets, chacun :
  - `lr_date_utc` : ISO 8601 UTC
  - `lr_julian` : Julian Day UT
  - `moon_target_lon` : echo de la cible
  - `planets` : dict FR (mêmes clés que SR mais sans `declinaison`/`latitude`/`distance_ua`/`vitesse_longitude` — light pour réduire payload size, contient juste `longitude_absolue`/`signe`/`degre_dans_signe`/`est_retrograde`) — **invariants vs relocation**
  - `cusps`, `asc`, `mc`, `armc` : maisons Placidus au **lieu de relocation** (ou natal si fallback) à l'instant du retour — **dépendent du lieu**

**Exemple — LR natale** :
```bash
curl -X POST http://46.225.174.155:8000/lunar-return \
  -H "Content-Type: application/json" \
  -d '{
    "natal": {"year":1879,"month":3,"date":14,"hours":11,"minutes":30,"seconds":0,"latitude":48.4,"longitude":10.0,"timezone":1},
    "period_start": "01/01/1933",
    "period_end": "31/12/1933",
    "precessed": true
  }'
```

→ `count: 13` retours, premier `1933-01-22T11:48:32Z`, `relocated: false`.

**Exemple — LR relocalisées à Paris** :
```bash
curl -X POST http://46.225.174.155:8000/lunar-return \
  -H "Content-Type: application/json" \
  -d '{
    "natal": {"year":1879,"month":3,"date":14,"hours":11,"minutes":30,"seconds":0,"latitude":48.4,"longitude":10.0,"timezone":1},
    "period_start": "01/01/1933",
    "period_end": "31/12/1933",
    "precessed": true,
    "relocation_lat": 48.85,
    "relocation_lon": 2.35,
    "relocation_label": "Paris, France"
  }'
```

→ `count: 13`, `relocated: true`, dates identiques mais asc/mc/cusps recalculés au méridien de Paris.

**Consommateurs** :
- `FRA/PREV/N8N Prev Prepare Data` v12 (2026-06-02) : même logique que SR (lit `birthday_place_*` du payload webhook). Exposé en aval comme `prepareOut._v23LunarReturns.returns[]`.

### 4.13 `POST /batch/western/planets` *(helper batch)*

| | |
|--|--|
| **Verbe** | `POST` |
| **Body JSON** | `{ "slots": [BirthData, BirthData, ...] }` (max **400** slots) |
| **Réponse** | `{ "statusCode": 200, "outputs": [ <output_planets>, ... ] }` (ordre des `outputs` = ordre des `slots`) |

**Usage** : éviter N allers-retours HTTP quand on a beaucoup de créneaux (workflow DHN, scan fin minute par minute). Sémantique strictement équivalente à N appels successifs à `/western/planets` (§4.2).

**Garanties contrat** :
- `outputs[i]` est exactement le `output` de `/western/planets` appliqué à `slots[i]` (mêmes 15 entrées : Ascendant + 10 planètes + 2 nœuds + Descendant + MC + IC).
- Validation préalable : si `len(slots) > 400` → HTTP 400 (`Maximum 400 slots, reçu N`).
- En cas d'erreur sur un slot, l'API tente quand même les autres slots (best-effort), tagués `error: <message>`.

**Consommateurs** :
- `FRA/DHN/N8N DHN` L5 : node `Split batch planetes1` (mode A.3) — déplie ensuite les `outputs` dans le workflow DHN.
- **Non utilisé** par `FRA/PREV/N8N Prev` (les créneaux PREV sont jour-par-jour via `/transits`).

---

## 5. Implémentation interne (`main.py`) — points critiques

| Sujet | Détail |
|-------|--------|
| **Chemin éphemeris** | Constante `EPHE_PATH = "/opt/astro/api/ephe"` |
| **Threads** | `ensure_ephe_path()` utilise `threading.local()` : un seul `swe.set_ephe_path(EPHE_PATH)` par thread du pool FastAPI (évite fuites FD et chemins absents sur workers). |
| **Lifespan** | `lifespan` appelle `ensure_ephe_path()` pour le thread asyncio. |
| **Obliquité** | `get_obliquity(jd)` avec cache par jour entier (`swe.calc_ut` + `ECL_NUT`). |
| **Déclinaison** | `calc_declinaison` via `swe.cotrans` et obliquité du jour. |
| **Signes** | Table `ZODIAC_SIGNS` (noms en / fr) ; listes françaises `ZODIAC_SIGNS_LIST` pour routes « transit / lune / progressions ». |

---

## 6. Gotenberg (PDF)

- Définition : **`docker-compose.yml`** → sur serveur **`/opt/astro/docker-compose.yml`**.
- Port **3000**, image **`gotenberg/gotenberg:8`**, limites mémoire et rotation logs : voir inventaire §6.
- L’API Gotenberg (multipart, chemins `/forms/...`) est documentée officiellement sur [gotenberg.dev](https://gotenberg.dev/) — ne pas dupliquer ici les paramètres versionnés.

---

## 7. Déploiement code API (checklist courte)

1. Modifier **`FRA/API SE/main.py`** dans le dépôt (PR / commit).
2. Copier vers la VM :  
   `scp FRA/API SE/main.py root@46.225.174.155:/tmp/main.py.deploy`
3. Sur la VM :  
   `cp /tmp/main.py.deploy /opt/astro/api/main.py && systemctl restart astro-api.service`
4. Smoke §8 ci-dessous.
5. Mettre à jour **`JOURNAL-OPERATIONS.md`** (entrée datée).

**Alignement dépôt ← prod** : après correctif direct sur le serveur, rapatrier le fichier vers `FRA/API SE/main.py` pour que le MD5 du dépôt reflète la prod.

---

## 8. Smoke tests minimaux (sur la VM ou avec `curl` vers l’IP)

Exécuter après tout `restart` de `astro-api` :

1. **`GET /health`** → 200, `{"status":"ok"}`.
2. **`POST /western/planets`** avec un JSON `BirthData` valide → `statusCode` 200, **`len(output) == 22`**, tous les items ont **`planet`**.
3. **`POST /western/houses`** → `output.Houses` longueur 12.
4. **`GET /transits?date_debut=2026-04-21&date_fin=2026-04-22`** → liste (éventuellement vide de transits « intéressants » mais structure jour + `planetes`).
5. **`GET /moon?date_debut=2026-04-21&date_fin=2026-04-22`** → liste non vide sur 2 jours.
6. **`GET /eclipses?date_debut=2026-04-01&date_fin=2026-05-01`** → 200, liste (peut être vide selon calendrier).
7. **`GET /progressions`** avec **tous** les paramètres requis incl. `date_debut` / `date_fin` (sinon **422** FastAPI).
8. **`GET /progressions/eclipses`** — idem.
9. **`POST /solar-return`** avec un JSON `{natal: BirthData, year: int, precessed: true}` → `output.sr_date_utc` (ISO 8601 UTC), `output.cusps` longueur 12, `output.planets` ≥ 18 clés FR.
10. **`POST /lunar-return`** avec un JSON `{natal, period_start, period_end, precessed: true}` couvrant 1 an → `output.count` ∈ [12 ; 14] (typiquement 13 LR/an), chaque entrée `returns[i]` a `lr_date_utc` + `cusps` (12) + `asc/mc/armc`.

---

## 9. Consommateurs connus dans le monorepo

| Zone | Usage typique |
|------|----------------|
| Workflows n8n THEME / PREV | `POST /western/planets`, `POST /western/houses`, parfois éclipses / lune / transits |
| `FRA/PREV/N8N Prev` (TRANCHE 3 V23) | **`POST /solar-return`** + **`POST /lunar-return`** — HTTP nodes `Download Solar Return` et `Download Lunar Returns`, exposition `prepareData.srData` + `prepareData.lrData` pour consommation par moteur V23 from-scratch |
| `FRA/DHN/GLOBAL DHN.json` | `POST /western/planets`, `POST /western/houses`, `GET /progressions` |
| `SITE/scripts/*.sh`, benchmarks | Tests `POST /western/planets` |

Toute nouvelle route ou extension doit respecter la **règle** du journal (2026-04-21) : **pas de modification additive** des routes existantes sans migration explicite des consommateurs.

---

## 10. Incident et leçon (2026-04-21)

Une modification **additive** de **`POST /western/planets`** avait ajouté 12 cuspides dans **`output`** sans clé `planet`, ce qui a cassé le nœud n8n « Enrichissement Astrologique ». **Rollback** immédiat côté serveur ; règle documentée dans **`JOURNAL-OPERATIONS.md`**. Ce document §4.2 fige le **contrat** pour éviter toute ambiguïté future.

---

*Fin du document. En cas de divergence entre ce fichier et le code, **`main.py` prime**.*
