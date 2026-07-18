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

## 2026-07-08 — Sécurisation pré-lancement : pare-feu, HTTPS (`api.spikka.eu`), clé API, migration n8n

### Contexte

Audit sécurité avant mise en prod commerciale. Constat : l'API `:8000` et Gotenberg `:3000` étaient **exposés publiquement sans authentification** (exfiltration de données perso, SSRF, DoS possibles) et le trafic n8n↔serveur circulait **en clair** (HTTP). Mise à jour noyau en attente (~77 j).

### Actions

**1. Pare-feu (UFW) — fermeture au monde**
- `:8000` et `:3000` restreints aux **seules** IP légitimes : n8n Cloud (`51.116.119.68`) + IP dev. Plus aucun accès public direct.
- `:22` (SSH), `:80` (ACME/renew Let's Encrypt), `:443` (gateway) conservés.

**2. Durcissement + reboot noyau**
- X11Forwarding off (`/etc/ssh/sshd_config.d/50-hardening.conf`) ; fail2ban jail `recidive` (`/etc/fail2ban/jail.d/99-recidive.local`, ban 1 semaine).
- Reboot pour appliquer la MàJ noyau (auto-start vérifié : `astro-api`, Docker/Gotenberg `restart=always`, UFW persistant).

**3. Gateway HTTPS `api.spikka.eu`**
- DNS A `api.spikka.eu` → `46.225.174.155` (IONOS). Certbot + Let's Encrypt (`/etc/letsencrypt/live/api.spikka.eu/`), TLS 1.2/1.3.
- nginx `:443` (`/etc/nginx/sites-available/astro-api-443`) : `/` → `127.0.0.1:8000` (API), `/pdf/` → `127.0.0.1:3000` (Gotenberg), `/health` ouvert.
- **Clé `X-API-Key` exigée** sur toutes les routes sauf `/health`, via `map $http_x_api_key` (`/etc/nginx/conf.d/astro-gateway.conf`, `map_hash_bucket_size 128`). Rate limit `astro_tls` 25 r/s, burst 60.
- Clé générée `openssl rand -hex 32` → `/root/astro-api-key.txt` (chmod 600) + `SITE/.env.local` (`ASTRO_API_KEY`, gitignored). **Ne jamais coller la clé dans le chat / un commit.**

**4. Migration n8n → gateway (12 workflows référençant l'IP)**
- Outil : `SITE/scripts/_enprat/astro-https-migrate.mjs` (modes `--scan-all` / `--inspect` / `--verify` / `--force-key`, dry-run + backups auto).
- Repointage `http://46.225.174.155:8000` → `https://api.spikka.eu`, `:3000` → `https://api.spikka.eu/pdf`, + header `X-API-Key` sur chaque nœud HTTP.
- **Nœuds Code** aussi : `Prepare Data` (PREV / ESPACE CLIENT TRANSITS — `helpers.httpRequest` inline, clé injectée dans `headers`), `Build Prog URL` + `Resultat final1` (DHN — build-string d'URL ; clé posée sur le nœud aval `Scan progressions`).
- **Préprod** (THEME/PREV/SYN/DHN) migrée + **smoke 24/24 en 200, 0×401** (planets, houses, transits, moon, eclipses, progressions, directions/primary, solar-return, lunar-return, Gotenberg `/pdf`).
- **Prod** : 7 workflows actifs migrés + `--verify` OK (`THEME`, `PREV`, `SYN`, `DHN`, `ESPACE CLIENT`, `ESPACE CLIENT SPIKKA CONNECT SYN`, `ESPACE CLIENT TRANSITS DAILY`). `ESPACE CLIENT TRANSITS` (**archivé**) non migré (ne s'exécute pas ; à migrer s'il est désarchivé).
- Le PUT via l'API publique n8n retire `binaryMode`/`availableInMCP` de `settings` (liste blanche API) — sans impact (PDF OK au smoke).

**5. Incident fuite clé `X-API-Key` (GitGuardian) + rotation zéro-coupure**
- Alerte GitGuardian : la clé du gateway figurait **en clair** dans les JSON `FRA/_workflow-backups-prod/2026-07-08/` (backup `ce874df`, poussé). Cause racine : l'export de backup relit les workflows **live**, qui portent désormais le header `X-API-Key` inline. Dépôt **privé** (GitGuardian scanne aussi le privé) → pas d'exposition publique, mais clé traitée comme compromise.
- **Rotation** : nouvelle clé `openssl rand -hex 32`. Gateway passé en **double-clé** (ancienne + nouvelle acceptées simultanément) → repointage des **81 nœuds** (HTTP + Code) des 11 workflows porteurs via `astro-https-migrate.mjs --rotate-all --apply` → smoke THEME préprod **0×401** (Calcul/Download/PDF en 200) → **invalidation de l'ancienne** (gateway = nouvelle clé seule ; `/root/astro-api-key.new` promu en `/root/astro-api-key.txt`). Vérif finale : nouvelle clé **acceptée (404 sur `/`)**, ancienne **rejetée (401)**. **Aucune coupure.**
- **Récidive empêchée** : `n8n-export-prod-workflows.mjs` caviarde désormais toute valeur `X-API-Key` (**walk récursif** — attrape aussi la copie dupliquée dans `activeVersion.nodes` renvoyée par l'API) et **strip** les champs dupliqués/volatils (`activeVersion`, `shared`, `updatedAt`, `versionCounter`…). Backup 2026-07-08 régénéré : **0 clé**, `__REDACTED__` partout.
- **Historique git** : la clé fuitée n'existait que dans le commit `ce874df` → purge ciblée (`git filter-repo --replace-text`) sur la branche `backup/workflows-prod-2026-07-08` + force-push. Clé déjà rotée (inerte) → purge = hygiène complémentaire.
- **`SITE/.env.local`** mis à jour avec la nouvelle clé (gitignored). **Ne jamais coller de clé dans le chat / un commit.**

### Fichiers (dépôt)

- `SITE/scripts/_enprat/astro-https-migrate.mjs` — migration/scan/verify + **`--rotate-key` / `--rotate-all`** (rotation de la valeur `X-API-Key` sur nœuds déjà migrés).
- `SITE/scripts/n8n-export-prod-workflows.mjs` — export/backup + **caviardage récursif** `X-API-Key` et strip `activeVersion`/`shared` (aucun secret en backup).
- Backups pré-migration : `SITE/scripts/_enprat/_https-migrate-backups/` + `FRA/_workflow-backups-prod/2026-07-08/` (caviardés).

### Vérif

- `--verify` des 7 prod : `✅ aucune IP résiduelle ; gateway+clé cohérents`. Les ⚠ (Vercel Blob, Gmail API) = appels externes légitimes non keyés → **normal**.
- Smoke préprod : 24/24 en 200 via `:443` (dont nœuds Code inline + Gotenberg).

**6. Verrouillage final — `:8000`/`:3000` en localhost (FAIT 2026-07-08)**
- `astro-api` (uvicorn) : `--host 0.0.0.0` → **`--host 127.0.0.1`** (unit `/etc/systemd/system/astro-api.service`, backup `.bak.localhost.20260708`).
- Gotenberg (compose `/opt/astro/docker-compose.yml`) : `"3000:3000"` → **`"127.0.0.1:3000:3000"`** (backup `.bak.localhost.20260708`, copie dépôt `FRA/API SE/docker-compose.yml` alignée).
- `ss -tlnp` : plus aucun `0.0.0.0`/`[::]` sur 8000/3000 → **écoute loopback uniquement**. nginx `:443` tape sur `127.0.0.1` → inchangé.
- Smoke : accès direct externe `:8000`/`:3000` = **000 (refusé)** ; gateway `/health` = **200**, gateway+clé = **404** ; run THEME préprod e2e = calcul/PDF **200, 0×(401/403/502)**.

### Reste à faire

- Garder `:80` ouvert pour le renouvellement Let's Encrypt (certbot timer).
- Les règles UFW `:8000`/`:3000` (n8n + dev) sont désormais **redondantes** (rien n'écoute côté public) — nettoyage optionnel.
- Workflow archivé `ESPACE CLIENT TRANSITS - PROD` : pointe encore l'IP directe `:8000` → **à migrer vers le gateway s'il est un jour désarchivé** (sinon il échouera, le port n'étant plus exposé).

---

## 2026-07-18 — État des lieux live + réalignement dépôt↔live + audit résilience

- **Contexte** : industrialisation de la mise en prod → documentation d'architecture (`FRA/ARCHI/`), audit cyber, et vérification que les livrables permettent une reconstruction rapide.
- **État des lieux SSH (read-only)** : VM **~23 Go RAM** (upgradée vs 3,7 Go historique), disque 58 %, uptime 10 j, services `astro-api`/`nginx`/`docker`/`fail2ban` **actifs**, `:8000`/`:3000` **loopback** confirmé, cert Let's Encrypt **valide 79 j**, fail2ban 968 IP bannies. **Reboot noyau en attente** (`6.8.0-134` actif / `6.8.0-136` installé).
- **Dérive détectée & corrigée** : `main.py` dépôt **718 l.** vs live **1473 l.** → **3 endpoints manquants** au dépôt (`/directions/primary`, `/solar-return`, `/lunar-return`). `main.py`, `main.py.server-copy`, `docker-compose.yml` **réalignés sur le live** (sha256 identiques).
- **Livrables DR ajoutés au dépôt** : `ephe-backup/*.se1` (éphémérides), `fontconfig/local.conf`, `infra/nginx-astro-api-443.conf`, `infra/astro-gateway.conf.template` (clé **caviardée**), `infra/astro-api.service`, `infra/astro-api.default.template`, `infra/nginx-astro-api-80.hardened.conf`.
- **Finding cyber F1 — CORRIGÉ le 2026-07-18** : `http://46.225.174.155/openapi.json` et `/transits` répondaient **200 sans clé** (le `:80` proxifiait l'API en clair) tandis que `:443` renvoie 401. Config `:80` durcie déployée (`infra/nginx-astro-api-80.hardened.conf`, 301→HTTPS ; backup serveur `astro-api-proxy.bak.*`, `nginx -t` OK, reload OK). Vérif : `/openapi.json` et `/transits` → **301 vers HTTPS**, `/health` → 200. `certbot renew --dry-run` → *« all simulated renewals succeeded »*.
- **Fichiers** : `FRA/ARCHI/{ARCHITECTURE-STACK,AUDIT-CYBERSECURITE-2026-07-18,RUNBOOK-DR,README}.md` ; `FRA/API SE/` (inventaire, ce journal, README, `main.py`, `docker-compose.yml`, `fontconfig/`, `ephe-backup/`, `infra/`).
- **Vérif** : `https://api.spikka.eu/health` = 200 ; hashes dépôt = serveur pour `main.py`/`docker-compose.yml`/`fontconfig`.

---

## Référence rapide — URLs prod

| Usage | URL |
|--------|-----|
| **API (canonique, n8n)** | **`https://api.spikka.eu/...`** (TLS + header `X-API-Key`) |
| **Gotenberg (canonique)** | **`https://api.spikka.eu/pdf/...`** (TLS + `X-API-Key`) |
| Health (sans clé) | `https://api.spikka.eu/health` |
| API directe `:8000` | **`127.0.0.1:8000` (loopback only)** — plus d'accès externe ; nginx `:443` uniquement |
| Gotenberg direct `:3000` | **`127.0.0.1:3000` (loopback only)** — plus d'accès externe ; via `:443/pdf/` uniquement |
| API port 80 (nginx, sans TLS) | `http://46.225.174.155/...` (legacy ; préférer `:443`) |
| SSH | `ssh root@46.225.174.155` (clé ; mot de passe désactivé) |

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

*Dernière mise à jour rédactionnelle de ce journal : 2026-07-08.*
