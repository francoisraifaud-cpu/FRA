# Référence exhaustive — API Astro (`main.py`) et serveur `astro-server`

**Rôle de ce document** : consolider en un seul endroit **tous les contrats HTTP**, le **comportement interne** du code, l’**arborescence serveur**, l’**infra** (systemd, nginx, Docker Gotenberg) et les **règles de non-régression**. Les détails opérationnels longs (reconstruction VM, UFW, fail2ban, runbook incidents) restent dans **[INVENTAIRE-SERVEUR-ASTRO-SWISSEPH-GOTENBERG.md](./INVENTAIRE-SERVEUR-ASTRO-SWISSEPH-GOTENBERG.md)** ; le **fil des interventions** dans **[JOURNAL-OPERATIONS.md](./JOURNAL-OPERATIONS.md)** ; les **URLs n8n** dans **[CORRESPONDANCE-IP-URL-N8N.md](./CORRESPONDANCE-IP-URL-N8N.md)**.

**Dernière mise à jour rédactionnelle** : 2026-04-21 (alignée sur `main.py` du dépôt et rollback incident `/western/planets`).

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

---

## 9. Consommateurs connus dans le monorepo

| Zone | Usage typique |
|------|----------------|
| Workflows n8n THEME / PREV | `POST /western/planets`, `POST /western/houses`, parfois éclipses / lune / transits |
| `FRA/DHN/GLOBAL DHN.json` | `POST /western/planets`, `POST /western/houses`, `GET /progressions` |
| `SITE/scripts/*.sh`, benchmarks | Tests `POST /western/planets` |

Toute nouvelle route ou extension doit respecter la **règle** du journal (2026-04-21) : **pas de modification additive** des routes existantes sans migration explicite des consommateurs.

---

## 10. Incident et leçon (2026-04-21)

Une modification **additive** de **`POST /western/planets`** avait ajouté 12 cuspides dans **`output`** sans clé `planet`, ce qui a cassé le nœud n8n « Enrichissement Astrologique ». **Rollback** immédiat côté serveur ; règle documentée dans **`JOURNAL-OPERATIONS.md`**. Ce document §4.2 fige le **contrat** pour éviter toute ambiguïté future.

---

*Fin du document. En cas de divergence entre ce fichier et le code, **`main.py` prime**.*
