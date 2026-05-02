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
