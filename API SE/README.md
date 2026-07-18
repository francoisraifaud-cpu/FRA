# API SE — espace documentation « Swiss Ephemeris + Gotenberg »

Ce dossier est la **référence unique** dans le dépôt pour le serveur privé **`astro-server`** (API FastAPI + `pyswisseph`, Gotenberg PDF, nginx, durcissement).

---

## Par où commencer ?

| Besoin | Document |
|--------|----------|
| **Architecture globale, audit cyber, reprise après sinistre (DR)** | **[../ARCHI/](../ARCHI/)** (`ARCHITECTURE-STACK.md`, `AUDIT-CYBERSECURITE-2026-07-18.md`, `RUNBOOK-DR.md`) |
| **Contrats API exhaustifs** (schémas, garanties, smoke, implémentation `main.py`) | **[DOCUMENTATION-REFERENCE-API-ET-SERVEUR.md](./DOCUMENTATION-REFERENCE-API-ET-SERVEUR.md)** |
| **Comprendre le serveur** (IP, ports, routes HTTP, reconstruction à zéro) | **[INVENTAIRE-SERVEUR-ASTRO-SWISSEPH-GOTENBERG.md](./INVENTAIRE-SERVEUR-ASTRO-SWISSEPH-GOTENBERG.md)** |
| **Fil de l’eau des opérations** (incidents, patchs, durcissement, commandes de déploiement) | **[JOURNAL-OPERATIONS.md](./JOURNAL-OPERATIONS.md)** |
| **Correspondance IP / URL pour n8n** (port 80 vs 8000, IPv6, modèle changement de serveur) | **[CORRESPONDANCE-IP-URL-N8N.md](./CORRESPONDANCE-IP-URL-N8N.md)** |
| **Workflows n8n / SITE** qui appellent l’API | `FRA/DHN/DOCUMENTATION WORKFLOW DHN.md`, `SITE/scripts/dhn-benchmark-asc-local.mjs` |

---

## Fichiers versionnés (sources de vérité → prod)

| Fichier | Rôle | Cible sur le serveur |
|---------|------|----------------------|
| [`main.py`](./main.py) | Application FastAPI (Swiss Ephem, middleware clé API optionnelle) ; inclut **`POST /batch/western/planets`** (A.3 DHN, N créneaux / une requête) | `/opt/astro/api/main.py` |
| [`docker-compose.yml`](./docker-compose.yml) | Gotenberg : image, ports, **mem_limit**, **rotation logs** | `/opt/astro/docker-compose.yml` |
| [`requirements-api-astro.txt`](./requirements-api-astro.txt) | Gel `pip` pour recréer le venv | `/opt/astro/api/venv` (via `pip install -r`) |

**Archives / copies** : `main.py.server-copy`, `docker-compose.yml.server-copy` (snapshots ou alignement).

**Sauvegardes de reconstruction (DR, ajoutées 2026-07-18)** :

| Fichier | Rôle | Cible sur le serveur |
|---------|------|----------------------|
| `ephe-backup/*.se1` | Fichiers Swiss Ephemeris sauvegardés (plus besoin de re-télécharger) | `/opt/astro/api/ephe/` |
| `fontconfig/local.conf` | Alias polices symboles → glyphes astro nets en PDF | `/opt/astro/fontconfig/local.conf` |
| `infra/nginx-astro-api-443.conf` | vhost gateway TLS `:443` | `/etc/nginx/sites-available/astro-api-443` |
| `infra/astro-gateway.conf.template` | map clé `X-API-Key` (**clé caviardée**) | `/etc/nginx/conf.d/astro-gateway.conf` |
| `infra/astro-api.service` | unit systemd | `/etc/systemd/system/astro-api.service` |
| `infra/astro-api.default.template` | env service (**clé caviardée**) | `/etc/default/astro-api` |
| `infra/nginx-astro-api-80.hardened.conf` | port 80 durci (301→HTTPS, remédiation audit F1) | `/etc/nginx/sites-available/astro-api-proxy` |

---

## Infra et durcissement

| Fichier | Rôle |
|--------|------|
| [`infra/apply-prod-hardening.sh`](./infra/apply-prod-hardening.sh) | **Script rejouable** : `apt upgrade`, swap, journald, sysctl, **nginx** (port 80 → API), UFW 80, drop-in **systemd** (`MemoryMax`, `EnvironmentFile`), déploiement compose + `main.py` depuis `/tmp/*.deploy` |
| [`infra/nginx-astro-api.conf`](./infra/nginx-astro-api.conf) | Modèle installé en **`/etc/nginx/sites-available/astro-api-proxy`** |

**Après durcissement (état 2026-07-08)** :

- **Accès canonique n8n = `https://api.spikka.eu`** (TLS Let’s Encrypt) + header **`X-API-Key`** (toutes routes sauf `/health`). Route `/pdf/` → Gotenberg. Voir `CORRESPONDANCE-IP-URL-N8N.md` §5-§6 et le journal **2026-07-08**.
- **`:8000` (API) et `:3000` (Gotenberg)** : **fermés au public par UFW** (seuls n8n Cloud `51.116.119.68` + IP dev), destinés à passer en **localhost** après le verrouillage final.
- Le port **80** (nginx en clair) subsiste en legacy + pour le challenge **ACME** (renouvellement Let’s Encrypt).
- **Reboot noyau** : effectué le 2026-07-08 (MàJ noyau appliquée).

**Clé API** : **ACTIVE** au niveau du gateway nginx `:443` (`/etc/nginx/conf.d/astro-gateway.conf`, `map $http_x_api_key`). Clé : `/root/astro-api-key.txt` (serveur) + `SITE/.env.local` → `ASTRO_API_KEY` (site/scripts, gitignored). Détail : inventaire **§2.5**, journal **2026-07-08**.

---

## TLS / suite « industrielle »

- **HTTPS** : ✅ en place (`api.spikka.eu`, Let’s Encrypt, TLS 1.2/1.3, vhost nginx `:443`).
- **Allowlist IP** : ✅ UFW restreint `:8000`/`:3000` à n8n Cloud + IP dev.
- **Clé API** : ✅ exigée par le gateway (`X-API-Key`), sauf `/health`.
- **Reste** : passage `:8000`/`:3000` en **localhost** (verrouillage final), **monitoring** (Uptime Kuma/Datadog), **backups snapshot** Hetzner — à consigner dans **`JOURNAL-OPERATIONS.md`**.

---

*Index maintenu avec le journal et l’inventaire — toute évolution importante doit mettre à jour **`JOURNAL-OPERATIONS.md`** en priorité.*
