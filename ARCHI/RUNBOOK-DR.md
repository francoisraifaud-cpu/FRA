# Runbook — Reprise après sinistre (DR) Spikka

> Statut : 🟢 ACTIF
> Date : 2026-07-18
> Objectif : **remonter la production en un temps record** après incident majeur (cyberattaque, destruction VM, compromission de secrets, perte de données).
> Liés : [`ARCHITECTURE-STACK.md`](./ARCHITECTURE-STACK.md), [`AUDIT-CYBERSECURITE-2026-07-18.md`](./AUDIT-CYBERSECURITE-2026-07-18.md), [`../API SE/INVENTAIRE-SERVEUR-ASTRO-SWISSEPH-GOTENBERG.md`](../API%20SE/INVENTAIRE-SERVEUR-ASTRO-SWISSEPH-GOTENBERG.md) §11.

---

## 0. Priorités & objectifs de temps

| Brique | Criticité | RTO cible | Reconstruction depuis |
|---|---|---|---|
| **astro-server** (moteur) | Vitale (propriétaire, VM unique) | **< 2 h** | `FRA/API SE/` (+ snapshot Hetzner si activé) |
| Base Neon (prod) | Vitale (données clients/commandes) | < 1 h | PITR/snapshot Neon |
| Site (Vercel) | Haute | < 15 min | redeploy depuis Git `main` |
| n8n workflows | Haute | < 1 h | `FRA/_workflow-backups-prod/` + `FRA/{ZONE}/` |
| DNS (IONOS) | Haute | variable (TTL) | zone à re-pointer |

Ordre recommandé en sinistre total : **secrets (confinement) → astro-server → Neon → n8n → site → DNS → smoke**.

---

## 1. Cas A — Compromission (cyberattaque) : confinement d'abord

1. **Isoler** : couper l'accès public compromis.
   - astro-server : `ufw default deny incoming` (garder SSH depuis IP dev) ou snapshot + reprovision sur nouvelle IP.
   - Vercel : activer/maintenir `SITE_GATE_PASSWORD` (portail) pour bloquer le public.
2. **Rotation de TOUS les secrets** (considérer tout secret comme compromis) :
   - `ASTRO_API_KEY` (`X-API-Key`) : `openssl rand -hex 32` → `/root/astro-api-key.txt` + `astro-gateway.conf` (`__APIKEY__`) + `nginx -t && reload` + propager n8n (`SITE/scripts/_enprat/astro-https-migrate.mjs --force-key`).
   - `N8N_WEBHOOK_SECRET` (+ `_PREPROD`), `STRIPE_WEBHOOK_SECRET`, `AUTH_SECRET`, `CRON_SECRET`, `BLOB_READ_WRITE_TOKEN`, tokens Upstash, clés Google/Turnstile.
   - `DATABASE_URL` : régénérer le mot de passe Neon (rôle) → mettre à jour Vercel.
   - `N8N_API_KEY` : régénérer dans n8n.
3. **Révoquer** les sessions : rotation `AUTH_SECRET` invalide tous les JWT.
4. **Journaliser** l'incident (`FRA/API SE/JOURNAL-OPERATIONS.md` + ce dossier).

---

## 2. Reconstruction `astro-server` (moteur astro) — cœur du DR

**Chemin rapide (si snapshot Hetzner dispo)** : restaurer le snapshot, vérifier §5 smoke, re-pointer DNS si l'IP change. Sinon, from-scratch :

1. **VM** Ubuntu 24.04 LTS, **2 vCPU**, **≥ 4 Go RAM** (le live tourne sur ~23 Go, mais 4 Go suffisent pour redémarrer), disque **≥ 40 Go**, root.
2. **Paquets** : `apt update && apt install -y python3 python3-venv python3-pip git curl ufw fail2ban nginx certbot python3-certbot-nginx` + Docker Engine + plugin Compose.
3. **Arborescence** `/opt/astro/` :
   ```bash
   mkdir -p /opt/astro/api/ephe /opt/astro/fontconfig
   ```
   Copier depuis le dépôt `FRA/API SE/` :
   - `main.py` → `/opt/astro/api/main.py`
   - `docker-compose.yml` → `/opt/astro/docker-compose.yml`
   - `fontconfig/local.conf` → `/opt/astro/fontconfig/local.conf`
   - `ephe-backup/*.se1` → `/opt/astro/api/ephe/`  ← **éphémérides versionnées (plus besoin de re-télécharger)**
4. **Venv** :
   ```bash
   cd /opt/astro/api && python3 -m venv venv
   ./venv/bin/pip install -r <chemin>/FRA/API\ SE/requirements-api-astro.txt
   ```
5. **Gotenberg** :
   ```bash
   cd /opt/astro && docker compose pull && docker compose up -d
   ```
6. **systemd** : installer `FRA/API SE/infra/astro-api.service` → `/etc/systemd/system/`, puis `systemctl daemon-reload && systemctl enable --now astro-api`.
7. **Env clé** : créer `/etc/default/astro-api` depuis `infra/astro-api.default.template` (renseigner `ASTRO_API_KEY`).
8. **nginx** :
   - `infra/nginx-astro-api-443.conf` → `/etc/nginx/sites-available/astro-api-443` (+ symlink `sites-enabled`).
   - `infra/astro-gateway.conf.template` → `/etc/nginx/conf.d/astro-gateway.conf` (remplacer `__APIKEY__` par la vraie clé).
   - `infra/nginx-astro-api-80.hardened.conf` → `/etc/nginx/sites-available/astro-api-proxy` (**version durcie**, cf. audit F1).
   - `nginx -t && systemctl reload nginx`.
9. **TLS** : `certbot --nginx -d api.spikka.eu` (DNS A `api.spikka.eu` doit pointer la nouvelle IP au préalable).
10. **UFW** : `ufw allow 22,80,443/tcp` ; activer ; (8000/3000 restent loopback, pas de règle publique nécessaire).
11. **Durcissement complet** (optionnel, rejouable) : `infra/apply-prod-hardening.sh`.

> Détail bas niveau : `FRA/API SE/INVENTAIRE-...md` §3, §5, §11 et `JOURNAL-OPERATIONS.md`.

---

## 3. Base de données (Neon)

- **PITR / snapshot** : restaurer la prod via la console Neon (projet `bold-shape-92238262`, région `eu-central-1`, PG17) à un point antérieur à l'incident. Créer une branche de restauration, valider, promouvoir.
- **Reconnecter le site** : mettre `DATABASE_URL` (pooled) à jour dans Vercel (`spikka-prod`), redeploy. Pour les migrations, URL directe.
- **Vérifier** : `GET https://spikka.ai/api/health?deep=1` (doit faire `SELECT 1`).

---

## 4. n8n workflows

- Le **live n8n est la vérité** ; `FRA/` est le miroir. Si l'instance n8n est intacte, rien à faire.
- En cas de perte : ré-importer depuis `FRA/_workflow-backups-prod/<date>/` (backups datés, **`X-API-Key` caviardé** → **re-renseigner la clé** dans les nœuds HTTP après import) et `FRA/{THEME,PREV,SYN,DHN}/`.
- Re-vérifier le câblage : webhooks PROD ↔ `spikka-prod`, `-preprod` ↔ staging (cf. `.cursor/rules/n8n-isolation-preprod-prod.mdc`).

---

## 5. Site (Vercel) & smoke final

1. **Redeploy** : `main` → `spikka-prod` (prod), `preprod` → `site-rapports-astro` (staging). Vérifier variables d'env (secrets rotés).
2. **Smoke moteur** :
   ```bash
   curl -s https://api.spikka.eu/health                       # {"status":"ok"}
   curl -s -H "X-API-Key: <clé>" -X POST https://api.spikka.eu/western/planets -d '{...BirthData...}'
   ```
3. **Smoke site** : `GET https://spikka.ai/api/health?deep=1`.
4. **Smoke bout-en-bout** : une commande test par rapport (THEME/PREV/SYN/DHN) → vérifier PDF livré + callback `/api/webhooks/n8n-order-status`.
5. **DNS** : si l'IP astro a changé, mettre à jour l'enregistrement A `api.spikka.eu` (IONOS) et attendre la propagation.

---

## 6. Inventaire des secrets à re-provisionner (checklist)

- [ ] `ASTRO_API_KEY` (serveur + n8n + `.env.local`)
- [ ] `N8N_WEBHOOK_SECRET` (+ `_PREPROD`) — Vercel (2 projets) + n8n
- [ ] `N8N_API_KEY`
- [ ] `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- [ ] `DATABASE_URL` (pooled + directe)
- [ ] `AUTH_SECRET` + OAuth Google
- [ ] `CRON_SECRET`, `BLOB_READ_WRITE_TOKEN`, tokens Upstash, clés Google Places / Turnstile
- [ ] `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN`
- [ ] `SITE_GATE_PASSWORD` (prod, tant que pas go-live public)

---

## 7. Livrables DR disponibles dans le dépôt (à jour 2026-07-18)

| Livrable | Emplacement |
|---|---|
| Code API FastAPI | `FRA/API SE/main.py` (= live, réaligné) |
| Compose Gotenberg | `FRA/API SE/docker-compose.yml` (= live) |
| Config polices PDF | `FRA/API SE/fontconfig/local.conf` |
| **Éphémérides Swiss Ephemeris** | `FRA/API SE/ephe-backup/*.se1` |
| Gel pip | `FRA/API SE/requirements-api-astro.txt` |
| nginx gateway 443 | `FRA/API SE/infra/nginx-astro-api-443.conf` |
| nginx map clé (caviardée) | `FRA/API SE/infra/astro-gateway.conf.template` |
| nginx 80 (durci) | `FRA/API SE/infra/nginx-astro-api-80.hardened.conf` |
| unit systemd | `FRA/API SE/infra/astro-api.service` |
| env service (template) | `FRA/API SE/infra/astro-api.default.template` |
| Script durcissement | `FRA/API SE/infra/apply-prod-hardening.sh` |
| Backups workflows n8n | `FRA/_workflow-backups-prod/<date>/` |

> **Lacune résiduelle** : snapshot serveur automatisé (Hetzner) non confirmé actif — cf. audit F3. À activer pour ramener le RTO astro-server sous 15 min.
