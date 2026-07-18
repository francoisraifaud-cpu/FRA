# Audit cybersécurité — stack Spikka (2026-07-18)

> Statut : 🟢 ACTIF
> Date : 2026-07-18
> Portée : toutes les briques (site Vercel, base Neon, orchestration n8n, moteur `astro-server`/API SE, paiement Stripe, DNS, secrets).
> Méthode : revue de configuration + **tests live read-only** (SSH état des lieux serveur, requêtes HTTP de contrôle, revue code SITE). Aucune modification de prod appliquée.
> Liés : [`ARCHITECTURE-STACK.md`](./ARCHITECTURE-STACK.md), [`RUNBOOK-DR.md`](./RUNBOOK-DR.md).

---

## 1. Synthèse

| # | Finding | Brique | Sévérité | État |
|---|---|---|---|---|
| **F1** | Port 80 expose l'API astro **en clair, sans clé, à tout Internet** | astro-server | 🔴 **ÉLEVÉ** | ✅ **corrigé 2026-07-18** |
| **F2** | Reboot noyau en attente (patchs sécurité inactifs) | astro-server | 🟠 MOYEN | ✅ **corrigé 2026-07-18** |
| **F3** | Pas de snapshot/backup serveur hors-machine confirmé | astro-server | 🟠 MOYEN | ✅ **corrigé 2026-07-18** |
| **F4** | Pas de monitoring/alerte de disponibilité externe | transverse | 🟠 MOYEN | à activer (compte requis) |
| **F5** | Dérive « source de vérité » `main.py` dépôt ↔ live (718 vs 1473 l.) | API SE | 🟡 FAIBLE | ✅ **corrigé 2026-07-18** |
| **F6** | Règles UFW 8000/3000 redondantes (rien n'écoute en public) | astro-server | ⚪ INFO | ✅ **nettoyé 2026-07-18** |
| **F7** | SSH (22) ouvert à tout Internet | astro-server | 🟡 FAIBLE | atténué (fail2ban + clé) |

**Posture globale : correcte et en durcissement.** Les fondations sont saines (TLS + clé API sur le canal canonique, secrets hors Git, signatures webhook, fail2ban, mises à jour auto, binding loopback). Le seul risque **élevé** est le contournement par le port 80, simple à corriger.

---

## 2. Findings détaillés

### 🔴 F1 — Port 80 : API astro en clair, sans authentification, exposée à tout Internet

**Preuve (tests live 2026-07-18)** :

| Requête | Résultat | Attendu |
|---|---|---|
| `GET https://api.spikka.eu/openapi.json` | **401** ✅ | clé exigée |
| `GET https://api.spikka.eu/western/planets` | **401** ✅ | clé exigée |
| `GET http://46.225.174.155/openapi.json` | **200** ❌ | schéma API exposé |
| `GET http://46.225.174.155/transits?...` | **200** ❌ | calcul complet sans clé |

Le gateway `:443` impose bien `X-API-Key`, mais le vhost **`:80`** (`/etc/nginx/sites-available/astro-api-proxy`, UFW `80/tcp ALLOW Anywhere`) proxifie **tout** `location /` vers `127.0.0.1:8000` **sans contrôle de clé, en HTTP clair**.

**Impact** :
- Énumération complète de l'API (`/openapi.json`, `/docs`).
- **Calculs illimités gratuits** (abus CPU, vecteur de DoS ciblé, vol de compute).
- Trafic **non chiffré** (MITM).
- Contourne totalement le rate-limit/clé du `:443`.

**Remédiation** (sûre — certbot utilise le plugin nginx, pas de webroot requis sur `:80`) : réduire le `:80` à une **redirection 301 vers HTTPS** (le challenge ACME reste géré par le plugin nginx lors du renouvellement). Config prête : [`../API SE/infra/nginx-astro-api-80.hardened.conf`](../API%20SE/infra/nginx-astro-api-80.hardened.conf).

```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    location = /health { proxy_pass http://127.0.0.1:8000/health; }  # smoke/uptime en clair OK
    location / { return 301 https://api.spikka.eu$request_uri; }      # plus d'API en clair
}
```

Déploiement (à valider avant application) :
```bash
scp "FRA/API SE/infra/nginx-astro-api-80.hardened.conf" root@46.225.174.155:/etc/nginx/sites-available/astro-api-proxy
ssh root@46.225.174.155 "nginx -t && systemctl reload nginx && certbot renew --dry-run"
```

**✅ CORRIGÉ 2026-07-18** (backup serveur `astro-api-proxy.bak.*`, `nginx -t` OK, reload OK). Vérification live :

| Requête | Avant | Après |
|---|---|---|
| `http://46.225.174.155/openapi.json` | 200 ❌ | **301 → `https://api.spikka.eu/openapi.json`** ✅ |
| `http://46.225.174.155/transits?...` | 200 ❌ | **301 → HTTPS** ✅ |
| `http://46.225.174.155/health` | 200 | 200 (conservé, smoke) |
| `https://api.spikka.eu/openapi.json` | 401 | 401 (inchangé) |

Renouvellement TLS revérifié : `certbot renew --dry-run` → *« all simulated renewals succeeded »*.

---

### 🟠 F2 — Reboot noyau en attente

État live : noyau **actif `6.8.0-134`**, noyau **installé `6.8.0-136`**, `/var/run/reboot-required` présent. Les correctifs de sécurité du noyau ne sont **pas actifs** tant que le serveur n'a pas redémarré (uptime 10 j). `unattended-upgrades` est actif (bien), mais un reboot est nécessaire pour activer le noyau patché.

**Remédiation** : planifier une fenêtre + `shutdown -r now`. Après reboot, vérifier `uname -r` = `6.8.0-136` et relancer le smoke (`/health`, un `POST /western/planets` via `:443`).

**✅ CORRIGÉ 2026-07-18** : reboot effectué (fenêtre : site derrière portail). Après redémarrage — `uname -r` = **`6.8.0-136-generic`**, `/var/run/reboot-required` **absent**, services `astro-api`/`nginx`/`docker`/`fail2ban` **actifs**, `:8000`/`:3000` loopback, gotenberg up, `https://api.spikka.eu/health` = 200, durcissement F1 (301 port 80) **persisté**.

---

### 🟠 F3 — Pas de sauvegarde serveur hors-machine confirmée

Le journal (`API SE/JOURNAL-OPERATIONS.md`) listait « sauvegardes snapshot Hetzner » en *reste à faire*. En cas de compromission/chiffrement de la VM, la reconstruction reposait uniquement sur le dépôt.

**✅ CORRIGÉ 2026-07-18** (via API Hetzner Cloud, `astro-server` id `123032910`) :
- **Backups automatiques activés** — fenêtre **02-06 UTC**, rétention Hetzner **7 backups quotidiens** (`enable_backup` = success ; `backup_window` = `02-06`).
- **Snapshot manuel « known-good » de référence créé** — image id `409950172`, `astro-server DR baseline 2026-07-18`, 4,68 GB, status `available`.
- RTO fortement réduit : restauration directe d'image Hetzner (~minutes) plutôt que reconstruction from-scratch.

**Atténuation complémentaire (déjà en place)** : `main.py`, `docker-compose.yml`, `fontconfig/local.conf`, **fichiers d'éphémérides** (`ephe-backup/`) et **configs nginx/systemd** sont versionnés dans `FRA/API SE/` (voir F5). Reconstruction complète décrite dans [`RUNBOOK-DR.md`](./RUNBOOK-DR.md).

> ⚠️ Le token Hetzner utilisé pour cette activation a été transmis en clair dans le chat → **à révoquer/régénérer** dans la console Hetzner (Security → API Tokens). Aucun token n'est versionné dans le dépôt.

---

### 🟠 F4 — Pas de monitoring/alerte externe

Aucune supervision externe de `api.spikka.eu/health` ni des callbacks. Une panne moteur passerait inaperçue jusqu'à échec de commande client.

**Remédiation** : sonde externe (Better Uptime / Uptime Kuma / cron Vercel) sur `https://api.spikka.eu/health` et `https://spikka.ai/api/health` + alerte (mail/Slack). Sentry couvre déjà les erreurs applicatives du site, pas la disponibilité du moteur.

---

### 🟡 F5 — Dérive « source de vérité » dépôt ↔ live (CORRIGÉ ce jour)

Constat : `FRA/API SE/main.py` (censé source de vérité) faisait **718 lignes** contre **1473** sur le serveur live — **3 endpoints manquants** dans le dépôt (`/directions/primary`, `/solar-return`, `/lunar-return`), plus le volume `fontconfig` du `docker-compose`. En cas de sinistre, la reconstruction aurait perdu ~la moitié du code moteur.

**Corrigé 2026-07-18** : `main.py`, `main.py.server-copy`, `docker-compose.yml` **réalignés sur le live** (hashes identiques), `fontconfig/local.conf` et `ephe-backup/` ajoutés, configs `infra/` (gateway 443, map clé caviardée, unit systemd, env template) versionnées.

**Remédiation pérenne** : contrôle de dérive régulier —
```bash
ssh root@46.225.174.155 "sha256sum /opt/astro/api/main.py /opt/astro/docker-compose.yml"
# comparer aux fichiers FRA/API SE/ (EOL normalisés)
```

---

### ⚪ F6 — Règles UFW redondantes (info)

`8000/tcp` et `3000/tcp` sont encore autorisés pour n8n Cloud + IP dev, alors que **rien n'écoute plus en public** (binding loopback confirmé par `ss -tlnp`). Sans danger, mais nettoyable pour la clarté (`ufw delete` des 4 règles).

**✅ NETTOYÉ 2026-07-18** : les 4 règles `8000/3000` (n8n + dev) supprimées. Restent uniquement `22`, `80`, `443` (public) + `443` restreint n8n/dev.

---

### 🟡 F7 — SSH ouvert à tout Internet

`22/tcp ALLOW Anywhere` (v4+v6). Atténué : **authentification par clé uniquement** (mot de passe désactivé) + **fail2ban** actif (13 084 tentatives, 968 IP bannies). Le bruit de brute-force est normal et absorbé.

**Remédiation optionnelle** (défense en profondeur) : restreindre `22` à l'IP dev (`ufw allow from <IP_dev> to any port 22 ; ufw delete allow 22/tcp`), au prix de la souplesse d'accès.

---

## 3. Posture forte (à conserver)

- ✅ **TLS + clé API** sur le canal canonique `:443` (Let's Encrypt, renouvellement auto, cert valide 79 j au 2026-07-18).
- ✅ **Binding loopback** de l'API `:8000` et de Gotenberg `:3000` (plus d'exposition directe).
- ✅ **fail2ban** (jail sshd) + **auth SSH par clé** + `unattended-upgrades` actif.
- ✅ **Secrets hors Git** (env Vercel/`.env.local` gitignorés) ; **caviardage récursif** `X-API-Key` dans les backups n8n (post-incident GitGuardian 2026-07-08).
- ✅ **Webhooks signés** site↔n8n (`X-Site-Webhook-Secret`) et **signature Stripe** vérifiée (`STRIPE_WEBHOOK_SECRET`).
- ✅ **Rate-limiting** (nginx `:443` 25 r/s ; Upstash Redis côté site ; `enforce*` par route).
- ✅ **Auth** : Auth.js JWT, **TOTP admin**, **Turnstile** anti-bot, portail `SITE_GATE_PASSWORD` en prod.
- ✅ **Isolation preprod/prod** : bases Neon séparées, workflows n8n dédoublés, secrets par projet Vercel.
- ✅ `/.well-known/security.txt` (`SECURITY_TXT_CONTACT`).

---

## 4. Plan d'action priorisé

| Priorité | Action | Effort | État |
|---|---|---|---|
| ~~F1~~ | ~~Durcir le port 80 (301 → HTTPS)~~ | — | ✅ fait 2026-07-18 |
| ~~F2~~ | ~~Reboot noyau (6.8.0-136)~~ | — | ✅ fait 2026-07-18 |
| ~~F5~~ | ~~Réalignement dépôt ↔ live~~ | — | ✅ fait 2026-07-18 |
| ~~F6~~ | ~~Nettoyer règles UFW redondantes~~ | — | ✅ fait 2026-07-18 |
| ~~F3~~ | ~~Activer backups Hetzner quotidiens + snapshot baseline~~ | — | ✅ fait 2026-07-18 |
| **1** | **F4** — Sonde uptime `/health` + alerte | 30 min | ⏳ **compte monitoring requis** |
| 3 | F7 — Allowlist SSH (option) | 5 min | non fait (risque lockout ; fail2ban suffit) |

### F3 — Snapshots Hetzner ✅ fait

Activé 2026-07-18 par API Hetzner Cloud : backups automatiques (fenêtre `02-06` UTC, 7 quotidiens) + snapshot manuel de référence (`409950172`). Voir détail dans la section F3 ci-dessus.

> Atténué : tous les livrables de reconstruction sont déjà versionnés (`FRA/API SE/` : code, éphémérides, configs). Le snapshot ne fait que réduire encore le RTO.

### F4 — Monitoring disponibilité (compte requis)

Options concrètes :
- **UptimeRobot / Better Uptime (gratuit)** : 2 monitors HTTP(s) — `https://api.spikka.eu/health` et `https://spikka.ai/api/health` — alerte mail. 5 min de setup, compte requis.
- **Ou** étendre le cron Vercel existant (`/api/cron/monitor-orders`) pour pinger `api.spikka.eu/health` et alerter via Sentry (`captureMessage`) si non-200 — livraison SITE (branche `preprod` → `main`).
