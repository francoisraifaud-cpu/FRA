# Inventaire serveur « astro-server » — Swiss Ephemeris + Gotenberg

Document généré pour permettre une **reconstruction à zéro** du serveur critique (API astro + PDF).  
**Dernière mise à jour des faits techniques** : 2026-04-21 (référence API exhaustive, correction §8.6 `/eclipses`, contrat §8.2 `/western/planets` ; faits 2026-04-19 inchangés : durcissement, nginx port 80).

**Référence contrats API** : [`DOCUMENTATION-REFERENCE-API-ET-SERVEUR.md`](./DOCUMENTATION-REFERENCE-API-ET-SERVEUR.md).  
**Chronologie des opérations** : [`JOURNAL-OPERATIONS.md`](./JOURNAL-OPERATIONS.md).  
**URLs n8n (port 80 vs 8000, IPv6, migration IP)** : [`CORRESPONDANCE-IP-URL-N8N.md`](./CORRESPONDANCE-IP-URL-N8N.md).

---

## 1. Rôle du serveur

| Composant | Port | Fonction |
|-----------|------|----------|
| **API Astro** (FastAPI + `pyswisseph`) | **8000** | Accès **direct** uvicorn (compat historique n8n). Calculs astrologiques (planètes, maisons, progressions, transits, éclipses, Lune). |
| **nginx** (reverse proxy) | **80** | Même API que le **8000**, avec **limitation de débit** par IP ; chemins identiques (`/western/planets`, etc.). |
| **Gotenberg** (Docker) | **3000** | Conversion HTML → PDF (Chromium headless), utilisé pour les rapports PDF. |
| **SSH** | **22** | Administration. |
| **DNS local** | 127.0.0.53 / 127.0.0.54 | `systemd-resolved` (standard Ubuntu). |

**Sécurité** : **UFW** ouvre **22, 80, 3000, 8000** (voir §4). **TLS** : pas encore sur ce serveur (§2.4). **Authentification API** : optionnelle via **`ASTRO_API_KEY`** + **`X-API-Key`** (§2.5) ; sans clé, l’API reste publique. **Rate limit** : nginx sur le **port 80** uniquement.

---

## 2. Identité machine et adresses IP

### 2.1 Hôte

| Champ | Valeur |
|--------|--------|
| Hostname | `astro-server` |
| OS | **Ubuntu 24.04.4 LTS** (Noble), noyau **6.8.0-106-generic** |
| Architecture | x86_64 |
| Disque racine | `/dev/sda1` — **38 Go** total, **~23 Go** utilisés (ordre de grandeur au 2026-04-19) |

### 2.2 Adresses IP (interfaces)

| Interface | Adresse | Usage |
|-----------|---------|--------|
| **eth0 (public IPv4)** | **`46.225.174.155/32`** | Adresse **principale** utilisée par n8n et les scripts (`http://46.225.174.155:8000/...`, `:3000/...`). |
| **eth0 (public IPv6)** | **`2a01:4f8:1c1e:d9aa::1/64`** | Accès v6 (Hetzner typique). `curl ifconfig.me` peut renvoyer l’IPv6. |
| lo | `127.0.0.1`, `::1` | Localhost |
| **docker bridge** `br-8a40a68b6d16` | **`172.18.0.1/16`** | Réseau du conteneur Gotenberg. |
| docker0 | `172.17.0.1/16` | Pont par défaut Docker (état **DOWN** sur l’instantané inspecté — normal si non utilisé). |
| eth0 link-local | `fe80::…` | IPv6 lien local |

### 2.3 IP « client » observée (incident avril 2026)

Lors d’un incident de saturation (timeouts, fuites de descripteurs de fichiers), le trafic dominant vers `:8000` provenait de :

| IP source | Rôle probable |
|-----------|----------------|
| **`51.116.119.68`** | Hébergement **Microsoft Azure** (région **Frankfurt**). Correspond très probablement à une instance **n8n** qui appelle l’API en boucle / retry. |
| `83.202.99.64` | Trafic test / admin (France). |

Ce ne sont **pas** des IP du serveur : ce sont des **appelants externes**. Utiles pour corréler logs et firewall.

### 2.4 URLs de base (prod)

- API Astro (direct uvicorn) : **`http://46.225.174.155:8000`**
- API Astro (**nginx**, rate limiting ~25 req/s par IP, burst 60) : **`http://46.225.174.155/`** (port **80**, mêmes chemins que sur `:8000`, ex. `/western/planets`)
- Gotenberg : **`http://46.225.174.155:3000`**

**TLS** : pas encore terminé sur ce serveur. Étape suivante recommandée : **Caddy** ou **nginx + Let’s Encrypt** derrière un **nom de domaine** pointant vers l’IP, puis basculer n8n en `https://…`.

### 2.5 Authentification API (optionnelle)

Si la variable d’environnement **`ASTRO_API_KEY`** est définie pour le service `astro-api` (fichier **`/etc/default/astro-api`**, voir commentaires dedans), toutes les routes exigent le header **`X-API-Key`** (sauf `/health`, `/docs`, `/openapi.json`, `/redoc`). **Tant que la clé n’est pas définie**, le comportement reste **identique** à avant (accès libre).

---

## 3. Arborescence et fichiers clés sur le serveur

**Compose Gotenberg (versionné dans le dépôt)** : [`FRA/API SE/docker-compose.yml`](./docker-compose.yml) — à maintenir aligné avec `/opt/astro/docker-compose.yml` sur la machine.

**Code API (versionné dans le dépôt)** : [`FRA/API SE/main.py`](./main.py) — à maintenir aligné avec `/opt/astro/api/main.py` sur la machine (correction fuites `set_ephe_path`, voir §10.2).

```
/opt/astro/
├── docker-compose.yml          # Service Gotenberg (copie déployée du fichier versionné ci-dessus)
└── api/
    ├── main.py                 # Application FastAPI (point d’entrée uvicorn : main:app)
    ├── main.py.bak             # Sauvegarde locale
    ├── main.py.backup.20260313_155501
    ├── ephe/                   # Fichiers Swiss Ephemeris (SWIEPH)
    │   ├── se00001s.se1 … se00004s.se1   # Fichiers minuscules (stub / entête)
    │   ├── seas_18.se1         # Astéroïdes (fichier ~223 Ko)
    │   ├── semo_18.se1         # Lune (~1,3 Mo)
    │   └── sepl_18.se1         # Planètes (~484 Ko)
    └── venv/                   # Environnement Python 3.12 dédié
```

- Chemin éphemeris : constante **`EPHE_PATH`** + **`ensure_ephe_path()`** (une fois par thread) ; **`GET /eclipses`** utilise **`FLG_MOSEPH`** sans vider le chemin global (voir §10.2).
- **Pas de `requirements.txt`** sur le serveur au moment de l’audit ; le gel pip est dans ce dépôt : **`requirements-api-astro.txt`**.

---

## 4. Pare-feu (UFW)

État observé : **actif**, politique **entrant par défaut deny**.

| Port / règle | Action |
|----------------|--------|
| **22/tcp** | ALLOW (IPv4 + IPv6) |
| **80/tcp** | ALLOW (nginx → API) |
| **3000** | ALLOW (Gotenberg) |
| **8000** | ALLOW (API Astro direct) |

---

## 5. Service systemd — API Astro

**Fichier unit** : `/etc/systemd/system/astro-api.service`

Contenu **effectif** après correctif incident (2026-04-19) :

```ini
[Unit]
Description=Astro API
After=network.target

[Service]
WorkingDirectory=/opt/astro/api
ExecStart=/opt/astro/api/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2 --timeout-keep-alive 5
LimitNOFILE=65536
Restart=on-failure
RestartSec=5
StartLimitIntervalSec=60
StartLimitBurst=5

[Install]
WantedBy=multi-user.target
```

Commandes utiles :

```bash
systemctl daemon-reload
systemctl restart astro-api.service
systemctl status astro-api.service --no-pager
journalctl -u astro-api.service -f
```

**Sauvegarde unit** créée sur le serveur lors du correctif :  
`/etc/systemd/system/astro-api.service.bak.20260419_195127` (conserver ce genre de fichier avant toute modification).

### 5.1 Drop-in durcissement (`/etc/systemd/system/astro-api.service.d/10-hardening.conf`)

Déployé par le script [`infra/apply-prod-hardening.sh`](./infra/apply-prod-hardening.sh) :

```ini
[Service]
MemoryMax=1200M
EnvironmentFile=-/etc/default/astro-api
```

- **`MemoryMax`** : évite qu’un pic sur l’API consomme toute la RAM de la VM (~3,7 Go) partagée avec Gotenberg.
- **`EnvironmentFile=-/etc/default/astro-api`** : le tiret final rend le fichier **optionnel** ; s’il manque, le service démarre quand même. Y placer **`ASTRO_API_KEY=...`** pour activer le middleware (voir §2.5).

---

## 6. Docker — Gotenberg

La définition **canonique** du stack Gotenberg vit dans le dépôt : **`FRA/API SE/docker-compose.yml`**. Sur le serveur, elle est déployée sous **`/opt/astro/docker-compose.yml`** (même contenu, hors commentaires éventuels).

### 6.1 Contenu attendu sur le serveur (`/opt/astro/docker-compose.yml`)

Aligné sur le dépôt [`docker-compose.yml`](./docker-compose.yml) :

```yaml
services:
  gotenberg:
    image: gotenberg/gotenberg:8
    restart: always
    ports:
      - "3000:3000"
    mem_limit: "1536m"
    logging:
      driver: json-file
      options:
        max-size: "20m"
        max-file: "4"
    command:
      - "gotenberg"
      - "--chromium-disable-javascript=false"
      - "--chromium-allow-list=.*"
```

### 6.2 Conteneur observé

| Champ | Valeur |
|--------|--------|
| Nom conteneur | `astro-gotenberg-1` |
| Image | `gotenberg/gotenberg:8` |
| Version API | **8.27.0** (endpoint `/version`, texte brut) |
| Publication ports | `0.0.0.0:3000->3000/tcp` (et IPv6) |

### 6.3 Santé Gotenberg

`GET http://127.0.0.1:3000/health` (ou depuis l’extérieur sur `:3000`) renvoie un JSON du type :

```json
{
  "status": "up",
  "details": {
    "chromium": { "status": "up", "timestamp": "…" },
    "libreoffice": { "status": "up", "timestamp": "…" }
  }
}
```

### 6.4 API Gotenberg (référence)

Gotenberg expose de nombreuses routes **multipart** (formulaires) pour convertir HTML, URL, Markdown, fusionner des PDF, etc. La documentation officielle est la source de vérité pour les chemins exacts et paramètres :

- **Documentation** : [https://gotenberg.dev/](https://gotenberg.dev/)

Exemples courants (Gotenberg 7/8 — vérifier la doc de la v8 pour le préfixe exact) :

- Conversion HTML → PDF : route sous **`/forms/chromium/convert/html`** (multipart : fichier `index.html`, assets optionnels).
- `GET /health`, `GET /version` pour supervision.

Les détails des champs (`paper-size`, `margin`, etc.) dépendent de la version ; ne pas les figer ici sans recoller à la doc **8.x**.

---

## 7. Stack Python (API Astro)

| Composant | Version (venv) |
|-----------|------------------|
| Python | **3.12.3** |
| fastapi | 0.135.1 |
| uvicorn | 0.41.0 |
| pyswisseph | **2.10.3.2** |
| pydantic | 2.12.5 |
| starlette | 0.52.1 |

Liste complète : **`requirements-api-astro.txt`** dans ce dossier.

---

## 8. API FastAPI — inventaire des routes

Schéma interactif OpenAPI sur le serveur : **`GET http://46.225.174.155:8000/docs`** (Swagger UI).

### 8.1 Modèle commun `BirthData` (corps JSON)

Utilisé par **`POST /western/planets`** et **`POST /western/houses`**.

| Champ | Type | Description |
|--------|------|-------------|
| `year` | int | Année (ex. 1934) |
| `month` | int | Mois 1–12 |
| `date` | int | Jour du mois |
| `hours` | float | Heure (peut être décimale) |
| `minutes` | float | Minutes |
| `seconds` | float | Secondes |
| `latitude` | float | Latitude géographique (degrés) |
| `longitude` | float | Longitude (degrés) |
| `timezone` | float | **Décalage fuseau en heures** (ex. `1` pour UTC+1), **soustrait** dans le calcul : `UT = heure_locale - timezone` |

**Note métier** : le workflow DHN calcule souvent `timezone` comme offset à midi local (voir benchmarks SITE) pour l’historique DST.

---

### 8.2 `POST /western/planets`

- **URL** : `http://46.225.174.155:8000/western/planets`
- **Entrée** : JSON **`BirthData`** (voir §8.1).
- **Sortie** : JSON

```json
{
  "statusCode": 200,
  "output": [
    {
      "planet": { "en": "…", "fr": "…" },
      "fullDegree": 0.0,
      "normDegree": 0.0,
      "isRetro": "True" | "False",
      "zodiac_sign": { "number": 1, "name": { "en": "…", "fr": "…" } },
      "latitude": 0.0,
      "distance_ua": 0.0,
      "vitesse_longitude": 0.0,
      "declinaison": 0.0
    }
  ]
}
```

**Contenu de `output` (ordre logique)** :

1. **Ascendant** (depuis `swe.houses`, système **Placidus** `b"P"`).
2. Une entrée par élément de la liste interne `PLANETS` (Soleil → Nœud vrai), avec champs extra astrométriques.
3. Points dérivés : **Descendant**, **MC** (Milieu du Ciel), **IC** (Imum Coeli).

**Contrat stable** : exactement **22** objets dans `output`, chacun avec une clé **`planet`**. Ne pas y fusionner d’autres structures (ex. cuspides par clé `house`) sans mettre à jour tous les consommateurs — voir **[DOCUMENTATION-REFERENCE-API-ET-SERVEUR.md](./DOCUMENTATION-REFERENCE-API-ET-SERVEUR.md)** §4.2 et **`JOURNAL-OPERATIONS.md`** (2026-04-21).

Les planètes utilisent **`FLG_SWIEPH | FLG_SPEED`**. `isRetro` est la chaîne `"True"` ou `"False"` (pas un booléen JSON).

---

### 8.3 `POST /western/houses`

- **URL** : `http://46.225.174.155:8000/western/houses`
- **Entrée** : JSON **`BirthData`**.
- **Sortie** :

```json
{
  "statusCode": 200,
  "output": {
    "Houses": [
      {
        "House": 1,
        "degree": 0.0,
        "normDegree": 0.0,
        "zodiac_sign": { "number": 1, "name": { "en": "…", "fr": "…" } }
      }
    ]
  }
}
```

12 maisons, Placidus (`swe.houses` avec `b"P"`).

---

### 8.4 `GET /transits`

- **URL** : `http://46.225.174.155:8000/transits`
- **Query (obligatoires)** :
  - `date_debut` : `dd/mm/yyyy` ou `yyyy-mm-dd`
  - `date_fin` : idem  
- **Comportement** : pour **chaque jour** entre les deux dates (pas d’heure fine : JD à **12h**), calcule toutes les entrées de `TRANSIT_OBJECTS` (Soleil, Mercure, … Noeud_Nord). Ajoute **Noeud_Sud** dérivé du Nord.
- **Sortie** : **tableau JSON** (liste), un élément par jour :

```json
[
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
]
```

Astéroïdes / Chiron : logique **Moshier** vs **Swiss Ephemeris** avec repli (voir `calc_planet_transit` dans `main.py`).

---

### 8.5 `GET /moon`

- **URL** : `http://46.225.174.155:8000/moon`
- **Query** : `date_debut`, `date_fin` (mêmes formats que §8.4).
- **Comportement** : échantillonnage **toutes les 12 heures** entre minuit du début et midi de la fin.
- **Sortie** : liste d’objets :

```json
[
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
]
```

Calcul Lune avec **`FLG_MOSEPH | FLG_SPEED`**.

---

### 8.6 `GET /eclipses`

- **URL** : `http://46.225.174.155:8000/eclipses`
- **Query** : `date_debut`, `date_fin`.
- **Particularité** : au début de la route, appel à **`ensure_ephe_path()`** (chemin Swiss Ephem thread-safe, voir §10.2). **Ne plus** utiliser `set_ephe_path("")` ici (historique, supprimé : course avec d’autres requêtes concurrentes sur le chemin global). Les calculs utilisent **`FLG_MOSEPH`** sur `sol_eclipse_when_glob` / `lun_eclipse_when`.
- **Sortie** : liste triée chronologiquement après fusion soleil + lune :

```json
[
  {
    "astre": "Soleil" | "Lune",
    "type": "Totale" | "Annulaire" | "Hybride" | "Partielle" | "Pénombrale" | "Inconnue",
    "date_maximum": "YYYY-MM-DD HH:MM UTC"
  }
]
```

---

### 8.7 `GET /health`

- **URL** : `http://46.225.174.155:8000/health`
- **Sortie** : `{ "status": "ok" }`

---

### 8.8 `GET /progressions`

- **URL** : `http://46.225.174.155:8000/progressions`
- **Query (tous requis sauf note)** :
  - `date_debut`, `date_fin` : bornes de la **vie réelle** à parcourir (formats §8.4).
  - `year`, `month`, `date` : date de naissance.
  - `hours`, `minutes` : heure de naissance ; `seconds` optionnel (défaut **0**).
  - `latitude`, `longitude`, `timezone` : comme `BirthData`.

- **Modèle de progression** : **secondaires** : un **jour écoulé depuis la naissance ≈ un an** ; `prog_jd = natal_jd + age_années` ; boucle par **pas de un mois civil** (`next_month`) entre `date_debut` et `date_fin`.

- **Sortie** : liste de mois :

```json
[
  {
    "date": "YYYY-MM-DD",
    "age_annees": 0.0,
    "jd_progresse": 0.0,
    "planetes": {
      "Soleil": { "longitude_absolue": 0.0, "signe": "…", "degre_dans_signe": 0.0, "est_retrograde": false, "latitude": 0.0, "distance_ua": 0.0, "vitesse_longitude": 0.0, "declinaison": 0.0 },
      "Ascendant": { "…", "declinaison": null },
      "MC": { "…" },
      "Descendant": { "…" },
      "IC": { "…" }
    }
  }
]
```

Les angles progressés utilisent **arc solaire** + `swe.houses_armc` (Placidus sur RAMC dérivé du MC progressé).

---

### 8.9 `GET /progressions/eclipses`

- **URL** : `http://46.225.174.155:8000/progressions/eclipses`
- **Query** : identique à §8.8 (`date_debut`, `date_fin`, naissance + lieu + fuseau).
- **Sortie** : liste d’éclipses dans la fenêtre **JD progressée**, avec correspondance « date de vie » et visibilité au lieu de naissance :

Champs typiques par élément :

| Champ | Signification |
|--------|----------------|
| `astre` | `Soleil` ou `Lune` |
| `type` | Totale, Partielle, etc. |
| `date_progresse` | Instant de l’éclipse en **temps progressé** (chaîne UTC) |
| `date_vie` | Date « réelle » associée (approximation `365.25` j/an) |
| `age_annees` | Âge progressé |
| `visible_lieu_naissance` | bool |
| `magnitude` | float |
| `longitude_absolue`, `signe`, `degre_dans_signe`, `declinaison` | Position astre à l’instant (ou `null`) |

Garde-fou interne : **50** itérations max par famille (soleil / lune).

---

## 9. Fail2ban

- Service **actif**.
- Jail observée : **`sshd`** uniquement (pas de jail dédiée pour 8000/3000).

---

## 10. Runbook — incidents déjà rencontrés

### 10.1 Symptôme : timeouts HTTP, alors que `Test-NetConnection -Port 8000` réussit

Cause observée : process uvicorn en **EMFILE** (`Too many open files`), accept socket en échec, clients (n8n avec **retry**) qui empilent des centaines de connexions en **CLOSE-WAIT**.

**Correctifs appliqués (2026-04-19)** :

- `LimitNOFILE=65536` sur le service.
- `uvicorn … --workers 2 --timeout-keep-alive 5`.

### 10.2 Swiss Ephemeris : fuites `set_ephe_path` et threads (corrigé dans [`main.py`](./main.py))

**Fuite historique** : des appels à `swe.set_ephe_path` **à chaque requête** (`to_julian`, `get_transits`, etc.) contribuaient à une **fuite de descripteurs de fichiers** sur `sepl_*.se1` / `semo_*.se1` / `seas_*.se1` sous forte charge.

**Threadpool FastAPI** : les routes `def` synchrones s’exécutent dans le **thread pool** AnyIO. Le chemin éphemeris côté `pyswisseph` / lib C n’est pas fiable si on ne fait `set_ephe_path` que dans le **thread principal** (import, `lifespan`, etc.) : les workers HTTP voyaient encore le chemin par défaut (`seas_18.se1` introuvable).

**Correction actuelle** :

- Constante **`EPHE_PATH`** et fonction **`ensure_ephe_path()`** basée sur **`threading.local()`** : au plus **un** `set_ephe_path(EPHE_PATH)` par **thread** du pool (pas par requête).
- Appels à `ensure_ephe_path()` dans **`get_obliquity`**, **`to_julian`**, **`calc_planet_transit`** et au début de **`GET /eclipses`** (couvre tous les chemins d’accès à `swe.*`).
- Un **`lifespan`** FastAPI appelle aussi `ensure_ephe_path()` pour le thread asyncio.
- **`GET /eclipses`** : ne plus utiliser `set_ephe_path("")` (non thread-safe avec d’autres requêtes concurrentes) ; les appels utilisent déjà **`FLG_MOSEPH`** sur `sol_eclipse_when_glob` / `lun_eclipse_when`.

### 10.3 n8n

Sur les nœuds HTTP vers cette API : **timeout modéré** (10–15 s), **peu de retries** avec backoff, éviter les boucles infinies sur erreur.

---

## 11. Reconstruction du serveur à zéro (checklist)

1. **VM** Ubuntu 24.04 LTS, **2 vCPU**, **≥ 4 Go RAM**, disque **≥ 40 Go**, accès root.
2. **`apt update`** puis paquets de base : `python3`, `python3-venv`, `python3-pip`, `git`, `curl`, `ufw`, `fail2ban` (optionnel mais présent sur l’actuel), dépendances build si compilation (`build-essential`) si besoin pour `pyswisseph` depuis source (sinon wheel).
3. **Docker Engine** + plugin Compose, selon [documentation Docker Ubuntu](https://docs.docker.com/engine/install/ubuntu/).
4. Copier depuis ce dépôt **`FRA/API SE/docker-compose.yml`** vers **`/opt/astro/docker-compose.yml`**, puis :
   ```bash
   cd /opt/astro && docker compose pull && docker compose up -d
   ```
5. Créer **`/opt/astro/api`**, copier **`ephe/`** (fichiers listés §3), copier **`FRA/API SE/main.py`** vers **`/opt/astro/api/main.py`**.
6. Venv :
   ```bash
   cd /opt/astro/api
   python3 -m venv venv
   ./venv/bin/pip install -r /chemin/vers/requirements-api-astro.txt
   ```
7. Tester en local sur le serveur :
   ```bash
   ./venv/bin/python -c "import swisseph as swe; swe.set_ephe_path('/opt/astro/api/ephe'); print('ok', swe.version)"
   curl -s http://127.0.0.1:8000/health   # après démarrage uvicorn
   curl -s http://127.0.0.1:3000/health
   ```
8. Installer le **unit systemd** (§5), `systemctl enable --now astro-api.service`.
9. **UFW** : autoriser 22, **80** (nginx), 3000, 8000 ; activer (`ufw enable`). Une fois n8n migré vers le port 80, retirer l’accès public à **8000** si souhaité.
10. Mettre à jour les **workflows n8n** et variables d’environnement du **SITE** avec la nouvelle IP si elle change.

---

## 12. Fichiers dans ce dossier (dépôt Git)

| Fichier | Description |
|---------|-------------|
| `INVENTAIRE-SERVEUR-ASTRO-SWISSEPH-GOTENBERG.md` | Ce document |
| `DOCUMENTATION-REFERENCE-API-ET-SERVEUR.md` | Référence exhaustive contrats API + implémentation + smoke |
| `README.md` | Index rapide |
| `docker-compose.yml` | **Source de vérité** Gotenberg (déployer vers `/opt/astro/docker-compose.yml`) |
| `main.py` | **Source de vérité** API FastAPI (déployer vers `/opt/astro/api/main.py`) |
| `infra/apply-prod-hardening.sh` | Script durcissement (rejouable sur la VM) |
| `infra/nginx-astro-api.conf` | Modèle site nginx (installé en `/etc/nginx/sites-available/astro-api-proxy`) |
| `JOURNAL-OPERATIONS.md` | **Chronologie** des interventions et commandes (fil de l’eau) |
| `CORRESPONDANCE-IP-URL-N8N.md` | Tableaux **ancienne URL → nouvelle URL** pour n8n (même IP ou changement de serveur) |
| `requirements-api-astro.txt` | Gel pip pour reconstruction du venv |
| `main.py.server-copy` | Copie alignée avec `main.py` (même contenu après correctifs) |
| `docker-compose.yml.server-copy` | Archive snapshot du compose sur le serveur (2026-04-19) |

---

## 13. Références croisées dans le monorepo

- Benchmark ASC local : `SITE/scripts/dhn-benchmark-asc-local.mjs` (URL `http://46.225.174.155:8000/western/planets`).
- Workflows n8n DHN : `FRA/DHN/GLOBAL DHN.json`, `FRA/DHN/DOCUMENTATION WORKFLOW DHN.md` (URLs planètes / maisons / progressions).

---

## 14. Durcissement production (état après script `infra/apply-prod-hardening.sh`)

| Mesure | Détail |
|--------|--------|
| **Paquets** | `apt upgrade` exécuté (systemd, Docker, noyau installé, etc.). |
| **Reboot noyau** | **À faire manuellement** quand tu peux : `shutdown -r now` (fichier serveur `/root/REBOOT_REQUIRED.txt` si `/var/run/reboot-required` existe). Sans reboot, le noyau **actif** peut rester une ligne plus ancienne que l’image installée. |
| **Swap** | Fichier **`/swapfile`** 2 Go, `fstab`, `vm.swappiness=10`. |
| **Journald** | Plafond disque **`SystemMaxUse=500M`** (`/etc/systemd/journald.conf.d/00-size-limits.conf`). |
| **Sysctl** | `fs.file-max`, `net.core.somaxconn`, `vm.swappiness` (`/etc/sysctl.d/99-astro-server.conf`). |
| **nginx** | Port **80** → `127.0.0.1:8000`, **limit_req** par IP. UFW ouvre **80/tcp**. |
| **astro-api (systemd)** | **`MemoryMax=1200M`**, **`EnvironmentFile=-/etc/default/astro-api`** (clé API optionnelle, voir §2.5). |
| **Gotenberg** | **`mem_limit` ~1,5 Go**, logs Docker **rotation** `max-size` / `max-file` (`docker-compose.yml`). |

**Pas encore fait automatiquement** : TLS (HTTPS), allowlist IP stricte sur 8000/3000, monitoring externe, sauvegardes snapshot Hetzner — à planifier selon ton domaine et ton budget temps.

---

*Fin du document.*
