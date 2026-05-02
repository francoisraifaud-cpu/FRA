# API SE — espace documentation « Swiss Ephemeris + Gotenberg »

Ce dossier est la **référence unique** dans le dépôt pour le serveur privé **`astro-server`** (API FastAPI + `pyswisseph`, Gotenberg PDF, nginx, durcissement).

---

## Par où commencer ?

| Besoin | Document |
|--------|----------|
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

---

## Infra et durcissement

| Fichier | Rôle |
|--------|------|
| [`infra/apply-prod-hardening.sh`](./infra/apply-prod-hardening.sh) | **Script rejouable** : `apt upgrade`, swap, journald, sysctl, **nginx** (port 80 → API), UFW 80, drop-in **systemd** (`MemoryMax`, `EnvironmentFile`), déploiement compose + `main.py` depuis `/tmp/*.deploy` |
| [`infra/nginx-astro-api.conf`](./infra/nginx-astro-api.conf) | Modèle installé en **`/etc/nginx/sites-available/astro-api-proxy`** |

**Après durcissement** :

- **`http://46.225.174.155/`** (port **80**) = même API que **`http://46.225.174.155:8000/`**, avec **rate limiting** nginx.
- Le port **8000** reste ouvert pour la **compatibilité** n8n existante ; migration possible vers le **80** puis resserrement UFW (voir inventaire §2.4, §14).
- **Reboot noyau** : si `/var/run/reboot-required` sur le serveur → planifier `shutdown -r now` ; voir **`/root/REBOOT_REQUIRED.txt`**.

**Clé API optionnelle** : fichier serveur **`/etc/default/astro-api`** — tant que **`ASTRO_API_KEY`** n’y est pas défini, l’API reste ouverte comme avant. Détail : inventaire **§2.5**, journal **2026-04-19**.

---

## TLS / suite « industrielle »

Non couvert automatiquement ici : **HTTPS** (domaine + Caddy ou nginx + Let’s Encrypt), **allowlist IP**, **monitoring**, **backups snapshot**. Pistes décrites dans l’inventaire **§14** et à consigner dans **`JOURNAL-OPERATIONS.md`** au fil des mises en prod.

---

*Index maintenu avec le journal et l’inventaire — toute évolution importante doit mettre à jour **`JOURNAL-OPERATIONS.md`** en priorité.*
