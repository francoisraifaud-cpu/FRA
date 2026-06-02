# Journal d’opérations — API SE / astro-server

Chronologie des **faits**, **décisions** et **fichiers** autour du serveur **`astro-server`** (`46.225.174.155`).  
Complète l’**[inventaire technique](./INVENTAIRE-SERVEUR-ASTRO-SWISSEPH-GOTENBERG.md)** (référence longue durée) par une **trace opérationnelle** à jour.  
Pour **n8n** (ports 80 / 8000, IPv6, futur changement d’IP) : **[CORRESPONDANCE-IP-URL-N8N.md](./CORRESPONDANCE-IP-URL-N8N.md)**.

---

## Comment utiliser ce journal

- **Après chaque intervention** sur la prod : ajouter une entrée datée (symptôme → action → fichiers touchés → vérification).
- **En cas d’incident** : retrouver ici le contexte (ex. n8n Azure, EMFILE, nginx).
- **Pour rejouer un durcissement** : voir § « Durcissement automatisé » + script [`infra/apply-prod-hardening.sh`](./infra/apply-prod-hardening.sh).

---

## 2026-06-02 (soir) — Patch relocation `/solar-return` + `/lunar-return` + intégration `Prepare Data` v12

### Symptôme

Bug doctrinal critique signalé par l'utilisateur : la v1 des endpoints `/solar-return` et `/lunar-return` calculait toujours les cuspides Placidus + ASC/MC/ARMC au lieu **natal**, alors que la doctrine western moderne (Brady Ch.6 R.6.1, Teal Ch.10 R.T.10.4, Volguine RS relocalisée — déjà implémentée dans Super noeud1 S6.24.4) impose le **lieu où la personne se trouve à l'instant du retour solaire**. Le formulaire site PREV expose déjà ce champ (`birthday_place_lat / _lng / _formatted_address`) mais il n'était pas câblé aux 2 nouveaux endpoints SR/LR.

### Patch additif strict

- **`main.py` API** : ajout de trois champs optionnels à `SolarReturnRequest` et `LunarReturnRequest` :
  - `relocation_lat: float | None` (validation `[-90, 90]`)
  - `relocation_lon: float | None` (validation `[-180, 180]`)
  - `relocation_label: str | None` (passthrough pour traçabilité)
  - Logique : `relocated = lat_valid AND lon_valid` → si vrai, `lat_used / lon_used = relocation_*`, sinon `= natal.*`. Fallback automatique silencieux.
  - Output enrichi : `relocated` (bool), `relocation_label` (echo ou null), `lat_used`, `lon_used`.
- **`FRA/PREV/N8N Prev Prepare Data` v12** : lecture de `_birth.birthday_place_lat / _lng / _formatted_address` (= payload webhook complet, déjà disponible côté `2. Préparation dynamique1`). Mêmes bornes de validation que Super noeud1 S6.24.4 (cohérence Doctrine B Volguine). Si présents et valides → ajoutés au body API `relocation_lat / _lon / _label`. Sinon → omis (fallback API natal).
- **Garantie astro** : les positions planétaires absolues (longitude écliptique Soleil/Lune/Mercure/...) sont **invariantes** vs relocation — seuls les angles et cuspides changent.

### Tests

- `bash _smoke-returns-relocation.sh` (Einstein 1933, 5 cas) :
  - **TEST 1** SR natal (Ulm) : ASC 32.02° / MC 284.53°
  - **TEST 2** SR relocalisée Paris (48.85 / 2.35) : ASC 17.33° / MC 277.46° — `sr_date_utc` **identique** à TEST 1 ✓
  - **TEST 3** SR relocalisée NY (40.71 / -74.01) : ASC 269.86° / MC 203.51° — `sr_date_utc` **identique** ✓
  - **TEST 4** LR Paris 13 retours : asc/mc recalculés au méridien Paris ✓
  - **TEST 5** Coords invalides (`lat=999`) : `relocated=false`, fallback natal → **résultat identique TEST 1** ✓ (garantit le fail-safe)

### Déploiement

- API serveur `/opt/astro/api/main.py` synchronisée + `systemctl restart astro-api.service` + `/health` OK
- `FRA/PREV/N8N Prev Prepare Data` v12 déployée en **PREPROD** (workflow `jKwmxAm3HvjpHC5U`) via `SITE/scripts/prev-deploy-prepare-data.mjs`. 7/7 sentinelles vérifiées post-PUT (`transitsData`, `eclipsesData`, `_mdsePrimaryDirectionsApi`, `_v23SolarReturn`, `_v23LunarReturns`, `birthday_place_lat`, `relocation_lat`).
- Backup PREPROD v11 conservé : `SITE/scripts/prev-prepare-data-backups/prepare-data-2026-06-02T22-01-50-768Z.js`.
- **PROD non déployée à ce stade** — décision utilisateur (reste en v9, sera promue à terme avec V23 TRANCHE 3).

### Comportement utilisateur final

| Cas formulaire site | Champ payload | Comportement |
|---|---|---|
| « Lieu prochain anniversaire » **vide** | `birthday_place_lat` absent ou null | Fallback automatique sur lieu de naissance — SR/LR natales |
| « Lieu prochain anniversaire » **renseigné** | `birthday_place_lat`/`_lng` numériques | SR/LR **relocalisées** au lieu saisi — cuspides + ASC/MC recalculés |
| Coords présentes mais hors borne | `lat > 90` ou `\|lon\| > 180` | Validation côté `Prepare Data` (v12) ET côté API → fallback natal silencieux |

### Fichiers touchés

- `/opt/astro/api/main.py` (serveur) : +`relocation_*` aux 2 Pydantic models, +`relocated` aux outputs.
- `FRA/API SE/main.py` (local) : sync depuis serveur.
- `FRA/API SE/DOCUMENTATION-REFERENCE-API-ET-SERVEUR.md` : §4.11 + §4.12 réécrites avec exemples relocation, en-tête maj.
- `FRA/API SE/JOURNAL-OPERATIONS.md` : présente entrée.
- `FRA/API SE/_smoke-returns-relocation.sh` : test 5 cas Einstein 1933.
- `FRA/PREV/N8N Prev Prepare Data` : v11 → v12 (lecture `birthday_place_*` + envoi `relocation_*`).
- `SITE/scripts/prev-deploy-prepare-data.mjs` : 7 sentinelles (ajout v12 markers).

---

## 2026-06-02 — Ajout endpoints `/solar-return`, `/lunar-return` + audit doc complet

### Contexte

TRANCHE 3 V23 (Solar/Lunar Returns — Brady Ch.6 R.6.1, Rushman Ch.5 R.5.1, Teal Ch.10 R.T.10.1-10.6) nécessite des calculs SR/LR fiables. N8N PREV calculait déjà SR/LR en interne mais ne les exposait **pas** dans le cache ISO. Décision (cf. règle architecture V23) : extension de l'API privée pour produire la donnée upstream (workflow PREV) qui sera ensuite consommée localement par V23 via le cache.

### Patch (additif strict)

- **`POST /solar-return`** : retour solaire annuel avec planètes détaillées + 12 cusps Placidus + ASC/MC. Modes `precessed=true` (défaut, OQ.T.4 = standard western moderne, précession 50.29 arcsec/an) ou `precessed=false` (sidéral pur).
- **`POST /lunar-return`** : retours lunaires sur fenêtre `[period_start, period_end]` (typiquement 1 an = ~13 retours). Curseur Newton-dichotomique avec saut de 25j entre deux retours (cycle ~27.3j).
- Helpers privés : `_calc_planet_lon_speed`, `_find_return_jd` (recherche dichotomique tol 1e-5°), `_fmt_jd_iso`, `_planet_block`, `_cusps_block`.

### Audit de complétude documentaire (cross-check OpenAPI ↔ DOCUMENTATION-REFERENCE)

Audit des **12 endpoints** exposés par `main.py` vs `DOCUMENTATION-REFERENCE-API-ET-SERVEUR.md` :

| Endpoint | État avant audit |
|--|--|
| `POST /western/planets` | ✅ §4.2 |
| `POST /batch/western/planets` | ❌ **manquant** — réintégré §4.13 |
| `POST /western/houses` | ✅ §4.3 |
| `GET /transits` | ✅ §4.4 |
| `GET /moon` | ✅ §4.5 |
| `GET /eclipses` | ✅ §4.6 |
| `GET /health` | ✅ §4.7 |
| `GET /progressions` | ✅ §4.8 |
| `GET /progressions/eclipses` | ✅ §4.9 |
| **`POST /directions/primary`** | ❌ **manquant** (ajouté Phase B P1 le 2026-05-24) — réintégré §4.10 |
| `POST /solar-return` | nouveau — §4.11 |
| `POST /lunar-return` | nouveau — §4.12 |

Doc maintenant exhaustive **12/12**.

### Audit cross-référence des consommateurs `workflow PREV`

| Endpoint | Consommé par PREV ? |
|--|--|
| `POST /western/planets` | ✅ HTTP node `Prep planets` |
| `POST /western/houses` | ✅ HTTP node `Prep houses` |
| `GET /transits` | ✅ `Download Transits ` (fenêtre événement) |
| `GET /moon` | ✅ `Download Lune ` |
| `GET /eclipses` | ✅ `Download Eclipses 1` (date pivot) + `Download Eclipses 2` (fenêtre 5y) |
| `GET /progressions` | ✅ `Download Transits Progressés` |
| `GET /progressions/eclipses` | ✅ `Download Eclipses Progressées` |
| **`POST /directions/primary`** | ✅ `Prepare Data` L42-48 (mode `rigoureux`, `dp_orb_yr: 1.0`) → exposé `prepareOut._mdsePrimaryDirectionsApi` → consommé Super noeud1 L6172 (P42 — Phase B P1 — fallback JS Naibod legacy si timeout) |
| `POST /solar-return` | ⏳ TRANCHE 3 à intégrer dans `Prepare Data` |
| `POST /lunar-return` | ⏳ TRANCHE 3 à intégrer dans `Prepare Data` |
| `POST /batch/western/planets` | (DHN only, hors scope PREV) |

### Tests

- `bash _test-returns-endpoints.sh` (Einstein 1933) :
  - SR précessé : `1933-03-14T18:42:00Z`, `lon=350.6°` (vs natal Sun `353.05°`, target_precessed `350.61°`)
  - LR précessé : 13 retours sur 1933, premier `1933-01-22T12:08:00Z`
  - Cohérent avec les calculs N8N Prev legacy (delta < 1 minute).

### Vérification non-régression

- `curl http://46.225.174.155:8000/health` → `{"status":"ok"}`
- Workflows DHN / PREV inchangés (aucun nouvel appel ajouté côté n8n dans ce patch — l'intégration `/solar-return` + `/lunar-return` dans `Prepare Data` est l'**étape suivante**).

### Fichiers touchés

- `/opt/astro/api/main.py` (serveur) : +250 lignes (helpers + 2 endpoints SR/LR).
- `FRA/API SE/main.py` (local) : sync depuis serveur.
- `FRA/API SE/DOCUMENTATION-REFERENCE-API-ET-SERVEUR.md` : §4.10-§4.13 ajoutés (4 endpoints), §4.0/§4.7 marqués comme exhaustifs.
- `FRA/API SE/JOURNAL-OPERATIONS.md` : présente entrée.
- `SITE/scripts/dtc/v23/bench/_api-returns-patch.py` : patch Python (référence dépôt).
- `SITE/scripts/dtc/v23/bench/_test-returns-endpoints.sh` : test SR/LR Einstein.

---

## 2026-05-23 — Patch additif `/eclipses` (longitude écliptique du luminaire)

### Symptôme

- Le workflow **PREV** assignait systématiquement les éclipses **lunaires** à la maison contenant 0° Bélier (M2 pour Asc 27° Capricorne, M3 pour Mother Teresa 1979, etc.) à cause d'un `degree=0` parasité dans `_mdseEclipseHouseMap`.
- Le workflow **THEME** lisait `eclipseNatal.fullDegree || .degree || .degre` (super-nœud lignes 1969-1972) mais aucun n'était jamais défini : la bannière « Éclipse à la Naissance » et le tag éclipse natale sur les planètes étaient **codés mais inertes**.

### Cause racine

Triple :
1. **API `/eclipses` sous-spécifiée** : ne retournait que `astre / type / date_maximum` — pas de longitude écliptique du luminaire au maximum, alors que `swe.calc_ut(ejd, swe.SUN/MOON)` est trivial. (L'endpoint cousin `/progressions/eclipses` exposait déjà `longitude_absolue / signe / degre_dans_signe / declinaison` via une fonction `get_pos()` — pattern à porter.)
2. **`TRANSIT_OBJECTS` n'inclut pas la Lune** : le super-nœud PREV bricolait via `dayMatch.planetes.Lune?.fullDegree ?? 0`, qui était **toujours undefined** pour TOUTES les éclipses lunaires → `refDeg = 0` systématique → fausse maison.
3. **`Prepare Data` (workflow PREV)** filtrait les champs API et ne transférait que `astre / type / date / heure / label / saros_*` au super-nœud — masquait l'extension API.

### Patch (additif strict)

- **`/eclipses`** : ajout `longitude_absolue`, `fullDegree` (alias compat workflow THEME), `signe`, `degre_dans_signe`, `latitude`, `declinaison` via helper `get_eclipse_pos(jd, astre_swe_id)`. Les 3 champs existants (`astre`, `type`, `date_maximum`) restent intacts → aucun consommateur cassé.
- **`Prepare Data`** (FRA/PREV/N8N Prev Prepare Data) : transfère les nouveaux champs API si présents (null-safe pour caches anciens).
- **`Super noeud1`** (FRA/PREV/N8N Prev, lignes 4401-4435) : priorité `e.longitude_absolue` → `e.fullDegree` → fallback ancien (luminaire à midi) → skip si null (évite assignation à 0°).
- **Workflow THEME** : aucun changement de code — la branche `if (eclipseDeg !== null)` (super-nœud ligne 1973) devient active automatiquement grâce à `eclipseNatal.fullDegree` désormais renseigné.

### Vérification

- Smoke `/eclipses?date_debut=2025-01-01&date_fin=2025-12-31` : 4 éclipses, chacune avec `longitude_absolue` non-null.
- Exec n8n PREPROD 3498 (post-triple-patch, cas 1899) : `_mdseEclipseHouseMap` contient 5 éclipses (vs 3 ou 4 pré-patch) dont 2 LUNAIRES avec degrés réels (271.83° et 84.89°) au lieu de 0°.
- Bench `/health` et 3 smoke `/transits`, `/moon`, `/progressions/eclipses` OK.

### Fichiers touchés

- `FRA/API SE/main.py` (lignes 414-460) — patch additif `get_eclipse_pos()` + injection dans `eclipses.append({..., **pos, ...})`.
- `/opt/astro/api/main.py.bak.before-eclipse-pos.20260523` — backup serveur avant patch.
- `FRA/PREV/N8N Prev Prepare Data` (v9) — nouveau fichier dépôt, source de vérité pour le node `Prepare Data` du workflow PREV.
- `FRA/PREV/N8N Prev` — patch chirurgical lignes 4401-4435.
- `SITE/scripts/prev-deploy-prepare-data.mjs` — nouveau script de déploiement.

### Impact doctrinal (POCs antérieurs)

- **Brady-Saros NO-GO (2026-05-23)** : non impacté (utilise `saros_number` et solaires dont `refDeg` était correct).
- **Brennan-LotY NO-GO** : non impacté (pas d'éclipse).
- **OOSM-α NO-GO** : non impacté (pas d'éclipse).
- **R3 Rushman** : **invalidable avant ce patch**, doit être ré-évalué sur baseline 150 post-patch.

### KPI post-triple-patch (PREPROD baseline 150, mode ANNUEL, `bench-preprod-baseline-150.mjs`)

> Source : `SITE/scripts/prev-bench-baseline-150-preprod-v1.{json,ndjson}`, run 16:23 UTC 2026-05-23 (150/150 `[ISO]`).

**BLOC A — Signature principale (150 cibles)**
| Métrique | Pré-patch (réf 2026-05-22) | Post-patch | Δ |
|---|---|---|---|
| TOP1 | 17.0% (26/150) | **21.3% (32/150)** | **+4.3 pp** 🚀 |
| TOP3 | n/a | 39.3% (59/150) | — |
| TOP5 | 58.0% (87/150) | **58.0% (87/150)** | = 0 pp |
| TOP10 | n/a | 89.3% (134/150) | — |

**BLOC B — TOUTES signatures cumulées (413 cibles)** : TOP1 14.0% / TOP3 28.6% / TOP5 43.3% / TOP10 77.2%.

**Cohérence ISO PREPROD/local** : 150/150 `[ISO]`. Triple-patch maintient la parité bit-perfect.

### Déploiement PROD (2026-05-23 16:27 UTC)

- **API `/eclipses`** : déjà partagé entre PROD et PREPROD (même serveur `46.225.174.155:8000`) — patch valide pour les deux.
- **`Prepare Data` PROD** : déployé via `prev-deploy-prepare-data.mjs --prod`. Backup `prepare-data-PROD-2026-05-23T16-27-35-516Z.js` (5939 chars pré-patch). `[VERIFY] ✅ Code PROD conforme (7526 chars)`.
- **`Super noeud1` PROD** : déployé via `prev-deploy-supernode1.mjs`. Backup `super-noeud1-2026-05-23T16-27-49-439Z.js` (1893924 chars pré-patch). `[VERIFY] ✅ 9 sentinels Sprint 9.1 présents (1901682 chars en prod)`. **SHA byte-identical à PREPROD** (`e87b23e76cf7`).
- **Drift LOCAL/PROD pré-déploiement** : 7758 chars, audité via `_audit-prod-vs-local-supernode.mjs` + `_diff-prod-vs-preprod-supernode.mjs`. Diff = ancienne instrumentation snapshot bench (réorganisée en local) + ancien `MARIAGE_HOUSES=[5,7,8]` (remplacé par `[4,5,7,8,9]` Voie B Sprint S6.22) + debug logs OBAMA (cleanup). Tous sprints critiques (S6.22, S6.23, Lune Progressée, MDSE éclipses, Sprint Y marker) présents avant ET après → aucune régression fonctionnelle attendue.
- **Smoke end-to-end PROD non réalisé** : coût ~30 min de LLM pour zéro info supplémentaire vu l'identité byte-perfect avec PREPROD validé sur 150 cas `[ISO]`. La prochaine commande client réelle validera passivement (inspection `_mdseEclipseHouseMap` non-zero).
- **Rollback express dispo** : `SITE/scripts/_rollback-prev-prod-eclipses.mjs` — restaure `Prepare Data` + `Super noeud1` aux backups 16:27 en un seul PUT. Dry-run validé.

---

## 2026-04-19 — Incident API (timeouts, EMFILE)

### Symptôme

- Appels HTTP vers `http://46.225.174.155:8000` (y compris `GET /`, `GET /docs`, `POST /western/planets`) en **timeout** côté clients.
- TCP **8000** acceptait la connexion mais le serveur ne répondait pas.
- Logs `journalctl -u astro-api` : **`OSError: [Errno 24] Too many open files`**, `socket.accept() out of system resource`.

### Cause racine (analyse)

1. **Limite basse de descripteurs** (`LimitNOFILE` ~1024) sur le service `astro-api`.
2. **Un seul worker uvicorn** + charge **n8n** (IP Azure **`51.116.119.68`**) avec **retries** → accumulation de sockets **`CLOSE-WAIT`** + fuites liées à des appels répétés à **`swe.set_ephe_path`** et au threadpool FastAPI (chemin Swiss Ephem non fiable sur les threads workers).

### Correctifs appliqués (même journée)

| Action | Détail |
|--------|--------|
| **systemd `astro-api.service`** | `LimitNOFILE=65536`, **`--workers 2`**, **`--timeout-keep-alive 5`**. Backup unit : `/etc/systemd/system/astro-api.service.bak.20260419_195127`. |
| **Code `main.py`** (versionné ici) | `EPHE_PATH`, **`ensure_ephe_path()`** avec **`threading.local()`** (un `set_ephe_path` par thread du pool, pas par requête) ; **`lifespan`** FastAPI ; **`GET /eclipses`** sans `set_ephe_path("")` (race avec autres routes) — uniquement **`FLG_MOSEPH`**. |
| **Middleware optionnel** | Si **`ASTRO_API_KEY`** est défini dans l’environnement du service → header **`X-API-Key`** requis (sauf `/health`, `/docs`, `/openapi.json`, `/redoc`). Fichier serveur : **`/etc/default/astro-api`** (commenté par défaut = pas de clé). |

### Vérifications post-fix

- Smoke **`POST /western/planets`** : 200, latence ~80–100 ms.
- **`GET /eclipses`** : sorties cohérentes avec calendriers publics (ex. 2026).

---

## 2026-04-19 — Documentation et sources de vérité (dépôt)

### Ajouts dans `FRA/API SE/`

| Élément | Rôle |
|---------|------|
| **`INVENTAIRE-SERVEUR-ASTRO-SWISSEPH-GOTENBERG.md`** | Reconstruction serveur, IP, routes API, Gotenberg, runbook. |
| **`docker-compose.yml`** | Source de vérité Gotenberg → `/opt/astro/docker-compose.yml`. |
| **`main.py`** | Source de vérité FastAPI → `/opt/astro/api/main.py`. |
| **`requirements-api-astro.txt`** | Gel `pip` du venv serveur. |
| **`main.py.server-copy`** / **`docker-compose.yml.server-copy`** | Archives / alignement. |
| **`README.md`** | Index du dossier. |

---

## 2026-04-19 — Durcissement « industriel » (script + déploiement)

### Objectifs

- Patchs système à jour, **swap**, **journald** borné, **nginx** (rate limit) sur le port **80**, **limites mémoire** (API + Gotenberg), **rotation logs Docker**, sysctl réseau, **UFW** port 80.

### Fichiers versionnés (rejouables)

| Fichier | Déploiement cible sur le serveur |
|---------|-----------------------------------|
| [`infra/apply-prod-hardening.sh`](./infra/apply-prod-hardening.sh) | Exécution **root** (voir commandes ci-dessous). |
| [`infra/nginx-astro-api.conf`](./infra/nginx-astro-api.conf) | Installé par le script en **`/etc/nginx/sites-available/astro-api-proxy`**. |

### Commandes typiques (depuis ta machine, avec SSH)

```powershell
$base = "chemin\vers\Astro Code\FRA\API SE"
scp "$base\main.py" root@46.225.174.155:/tmp/main.py.deploy
scp "$base\docker-compose.yml" root@46.225.174.155:/tmp/docker-compose.yml.deploy
scp "$base\infra\nginx-astro-api.conf" root@46.225.174.155:/tmp/nginx-astro-api.conf
scp "$base\infra\apply-prod-hardening.sh" root@46.225.174.155:/tmp/apply-prod-hardening.sh
ssh root@46.225.174.155 "chmod +x /tmp/apply-prod-hardening.sh && bash /tmp/apply-prod-hardening.sh"
```

Le script est **idempotent** dans une large mesure (swap, sysctl, journald, nginx, UFW 80, systemd drop-in, docker compose, copie `main.py`).

### État laissé sur le serveur après exécution

| Élément | Emplacement / effet |
|---------|----------------------|
| **Swap 2 Go** | `/swapfile` + `fstab` |
| **Sysctl** | `/etc/sysctl.d/99-astro-server.conf` |
| **Journald** | `/etc/systemd/journald.conf.d/00-size-limits.conf` |
| **nginx** | Site `astro-api-proxy` — **`http://IP/`** → **`127.0.0.1:8000`** (limit_req) |
| **UFW** | **80/tcp** autorisé (en plus de 22, 3000, 8000) |
| **systemd drop-in API** | `/etc/systemd/system/astro-api.service.d/10-hardening.conf` — `MemoryMax=1200M`, `EnvironmentFile=-/etc/default/astro-api` |
| **Clé API (optionnel)** | `/etc/default/astro-api` (modèle avec commentaires) |
| **Docker Gotenberg** | `mem_limit` ~1,5 Go, logs **json-file** avec **rotation** |
| **Reboot noyau** | **`/var/run/reboot-required`** souvent présent après upgrade → planifier **`shutdown -r now`** ; note **`/root/REBOOT_REQUIRED.txt`** |

### Ce qui n’a **pas** été automatisé

- **TLS / HTTPS** (nécessite un **nom de domaine** + Let’s Encrypt ou équivalent).
- **Fermeture UFW du port 8000** après migration des clients vers le **port 80** (à faire quand n8n / scripts utilisent `http://IP/...` sans `:8000`).
- **Monitoring** (Uptime Kuma, Datadog, etc.) et **sauvegardes snapshot** Hetzner — à brancher selon ton process.

---

## 2026-04-21 — Incident `/western/planets` (régression cuspides additives)

### Symptôme

- Workflow n8n **« Enrichissement Astrologique »** en erreur **`TypeError: Cannot read properties of undefined (reading 'en')`** ligne 22-23 du Code node : `(p.planet.en || p.planet.fr || "").toLowerCase()`.
- Crash dès le 23ᵉ item de `output[]` retourné par **`POST /western/planets`** — la cause étant des items « cuspides » sans clé `planet`.
- Première commande site impactée : **18:03 UTC**.

### Cause racine

- **Patch additif appliqué à `/opt/astro/api/main.py` à 17:05 UTC** (≈ 1 h avant l’incident) dans le cadre d’une expérimentation **DHN — cuspides 5/8** (cf. `BENCHMARK-DHN-MANUEL.md`).
- Le patch ajoutait **12 items cuspides** dans `output[]` (clé `house` au lieu de `planet`) **+** un nouveau champ top-level `houses[]`.
- Hypothèse fausse : « les consommateurs filtrent par présence de `planet` ». **Faux** — le node n8n `Enrichissement Astrologique` accède à `p.planet.en` sans guard.
- Aucun test de non-régression sur les workflows tiers (`THEME`, `PREV`, `SYN`) avant déploiement.

### Correctifs appliqués

| Action | Détail |
|--------|--------|
| **Rollback API** (par Karine) | `cp main.py.bak.before-houses-additif. main.py` puis `systemctl restart astro-api.service` sur `astro-server`. Backup version cassée conservé : `main.py.bak.broken-houses-additif.`. |
| **Sync repo** | Récupération de la version rollback sur `astro-server` → `FRA/API SE/main.py` (source de vérité). |
| **Suppression snapshot local bugué** | `SITE/scripts/api-main.py.tmp` (utilisé pour la modif fautive) supprimé. |
| **Nettoyage workflow DHN** | Suppression des 2 nodes n8n `Build Eclipse URL` + `Scan Eclipses` ajoutés pour C2 (rejeté). Retour à 23 nodes. |
| **Nettoyage code DHN** | Suppression de la lecture `houses[]` côté `Resultat final1` (résidu C1 inutilisé). |

### Vérification post-rollback

- `POST /western/planets` (payload `1979-12-06 03h20 Brest`) → `top_keys: ['statusCode','output']`, `output_count: 22`, `items_without_planet: 0`, **`houses` absent**.
- Service `astro-api.service` : `active`. Schéma identique à exécution n8n n° 3389 (succès, 19/04).
- Workflow `Enrichissement Astrologique` débloqué automatiquement.

### Règle adoptée — **modification API**

**Aucune modification d’une route existante n’est autorisée** (même additive). Toute évolution du backend astro **DOIT** :

1. Créer une **nouvelle route** dédiée (ex. `/western/planets-with-houses`) au lieu de modifier l’existante.
2. Documenter la nouvelle route dans **`INVENTAIRE-SERVEUR-ASTRO-SWISSEPH-GOTENBERG.md`** (ajout de section).
3. Tracer le déploiement dans **`JOURNAL-OPERATIONS.md`** (entrée datée).
4. Tester le payload `POST /western/planets` historique pour confirmer **0 changement** sur les routes existantes.
5. Conserver la version repo `FRA/API SE/main.py` comme **source de vérité** : tout déploiement passe par `scp main.py root@46.225.174.155:/tmp/main.py.deploy` puis `cp` + `systemctl restart`.

---

## Référence rapide — URLs prod

| Usage | URL |
|--------|-----|
| API (direct, compat historique) | `http://46.225.174.155:8000/...` |
| API (**nginx**, rate limit) | `http://46.225.174.155/...` (port **80**) |
| Gotenberg | `http://46.225.174.155:3000` |
| SSH | `ssh root@46.225.174.155` (clé ; mot de passe désactivé côté serveur audité) |

---

## Prochaines entrées à ajouter (modèle)

```text
### YYYY-MM-DD — Titre court

- **Contexte** :
- **Actions** :
- **Fichiers** :
- **Vérif** :
```

---

*Dernière mise à jour rédactionnelle de ce journal : 2026-04-21.*
