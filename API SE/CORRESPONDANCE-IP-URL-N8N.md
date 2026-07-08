# Correspondance IP / URL — n8n et clients (API SE)

Ce fichier sert à **paramétrer n8n** (et scripts) quand l’accès à l’API change : **port**, **protocole**, **IPv6**, ou **nouvelle machine**.

---

## 1. Point important (état actuel au 2026-07-08)

> **⚠ MISE À JOUR 2026-07-08 — Accès canonique = HTTPS + clé API.**
> n8n appelle désormais l’API via le **gateway TLS `https://api.spikka.eu`** (voir §6), avec le header **`X-API-Key`** obligatoire (§5). Les **12 workflows** (THEME/PREV/SYN/DHN + ESPACE CLIENT, prod & préprod) ont été migrés. Les accès directs `http://46.225.174.155:8000` / `:3000` sont **fermés au public par UFW** (seuls n8n Cloud `51.116.119.68` + IP dev) et **destinés à passer en localhost**. Détails : `JOURNAL-OPERATIONS.md` (entrée 2026-07-08).

Dans ce dépôt, **l’adresse IPv4 publique du serveur astro n’a pas changé** : tout pointe vers **`46.225.174.155`** (désormais derrière le domaine `api.spikka.eu`).

Si tu migres plus tard vers **une autre VM / une autre IP**, utilise le **§4** (modèle à remplir) et mets à jour ce fichier.

---

## 2. Correspondance « ancien accès » → « nouvel accès » (même serveur, même IPv4)

> **Note 2026-07-08 :** cette table (port 80 direct) est **historique**. L’accès **recommandé/canonique** est maintenant le **gateway HTTPS `https://api.spikka.eu` + `X-API-Key`** (voir **§6**). Le port 80 en clair reste un fallback legacy.

| Ancien (avant nginx) | Nouveau (recommandé sous charge) | Remarque |
|----------------------|-----------------------------------|----------|
| `http://46.225.174.155:8000` | `http://46.225.174.155` (port **80** implicite) | Même hôte, même chemins (`/western/planets`, etc.). **Rate limit** nginx côté 80 uniquement. |
| `http://46.225.174.155:8000/western/planets` | `http://46.225.174.155/western/planets` | Remplacer **base URL** : enlever **`:8000`**. |
| `http://46.225.174.155:8000/western/houses` | `http://46.225.174.155/western/houses` | Idem. |
| `http://46.225.174.155:8000/progressions?...` | `http://46.225.174.155/progressions?...` | Idem (query string inchangée). |
| `http://46.225.174.155:8000/transits?...` | `http://46.225.174.155/transits?...` | Idem. |
| `http://46.225.174.155:8000/moon?...` | `http://46.225.174.155/moon?...` | Idem. |
| `http://46.225.174.155:8000/eclipses?...` | `http://46.225.174.155/eclipses?...` | Idem. |
| `http://46.225.174.155:8000/health` | `http://46.225.174.155/health` | Smoke / uptime. |

**Gotenberg** :

| Usage | URL canonique (2026-07-08) | Direct (UFW n8n+dev only) |
|--------|-----------------------------|----------------------------|
| PDF | `https://api.spikka.eu/pdf/...` (+ `X-API-Key`) | `http://46.225.174.155:3000` |

---

## 3. IPv6 (optionnel)

Si tu veux appeler le serveur en **IPv6** (même machine, autre littéral d’hôte) :

| IPv4 (habituel) | IPv6 (exemple relevé sur le serveur) |
|-----------------|----------------------------------------|
| `46.225.174.155` | `2a01:4f8:1c1e:d9aa::1` |

Exemple d’URL API (chemins identiques) :

- `http://[2a01:4f8:1c1e:d9aa::1]:8000/western/planets`
- `http://[2a01:4f8:1c1e:d9aa::1]/western/planets` (port 80, si UFW et DNS le permettent)

Les nœuds HTTP n8n doivent accepter les **crochets** `[]` autour de l’IPv6.

---

## 4. Modèle « changement de serveur » (à remplir le jour J)

Remplace **`ANCIENNE_IP`** / **`NOUVELLE_IP`** par les valeurs réelles ; garde une ligne par service.

| Service | Ancienne base URL | Nouvelle base URL |
|---------|-------------------|-------------------|
| API (port 8000) | `http://ANCIENNE_IP:8000` | `http://NOUVELLE_IP:8000` |
| API (port 80 / nginx) | `http://ANCIENNE_IP` | `http://NOUVELLE_IP` |
| Gotenberg | `http://ANCIENNE_IP:3000` | `http://NOUVELLE_IP:3000` |

**Fichiers / emplacements typiques à mettre à jour dans le dépôt** (rechercher l’ancienne IP) :

- `FRA/DHN/GLOBAL DHN.json` (URLs des nœuds HTTP, code « Build Prog URL » si IP en dur)
- `FRA/DHN/DOCUMENTATION WORKFLOW DHN.md`
- `SITE/scripts/dhn-benchmark-asc-local.mjs`
- autres workflows `FRA/SYN`, `FRA/PREV`, `FRA/THEME` si référence à la même API

---

## 5. Authentification API (ACTIVE depuis 2026-07-08)

Le **gateway `https://api.spikka.eu` (:443) exige le header `X-API-Key`** sur toutes les routes **sauf `/health`** (validation nginx via `map $http_x_api_key`, cf. `/etc/nginx/conf.d/astro-gateway.conf`). Une requête sans clé (ou mauvaise clé) reçoit **401**.

- Clé côté serveur : `/root/astro-api-key.txt` (chmod 600). Côté site/scripts : `SITE/.env.local` → **`ASTRO_API_KEY`** (gitignored). **Ne jamais coller la clé dans le chat ni un commit.**
- Chaque nœud HTTP n8n vers `api.spikka.eu` porte le header `X-API-Key`. Les nœuds **Code** faisant `helpers.httpRequest` l’incluent dans leur objet `headers`.
- **Rotation** : régénérer (`openssl rand -hex 32`), mettre à jour `astro-gateway.conf` (placeholder `__APIKEY__`) + `nginx -t && systemctl reload nginx`, puis relancer `SITE/scripts/_enprat/astro-https-migrate.mjs --wf=<ids> --apply` pour propager la nouvelle clé dans n8n.

---

## 6. TLS / nom de domaine (EN PLACE depuis 2026-07-08)

Le basculement HTTPS est **fait**. Domaine **`api.spikka.eu`** (DNS A → `46.225.174.155`, IONOS), certificat **Let’s Encrypt** (`/etc/letsencrypt/live/api.spikka.eu/`), TLS 1.2/1.3, vhost `/etc/nginx/sites-available/astro-api-443` (`/` → `127.0.0.1:8000`, `/pdf/` → `127.0.0.1:3000`, `/health` ouvert).

| Avant (HTTP + IP) | Après (HTTPS + domaine) — **canonique** |
|-------------------|------------------------------------------|
| `http://46.225.174.155:8000/western/planets` | `https://api.spikka.eu/western/planets` (+ `X-API-Key`) |
| `http://46.225.174.155:8000/transits?...` | `https://api.spikka.eu/transits?...` (+ `X-API-Key`) |
| `http://46.225.174.155:8000/progressions?...` | `https://api.spikka.eu/progressions?...` (+ `X-API-Key`) |
| `http://46.225.174.155:8000/health` | `https://api.spikka.eu/health` (sans clé) |
| `http://46.225.174.155:3000` (Gotenberg) | `https://api.spikka.eu/pdf/...` (+ `X-API-Key`) |

**Renouvellement Let’s Encrypt** : certbot timer automatique → **garder le port 80 ouvert** (challenge ACME).

---

*Référence croisée : [`README.md`](./README.md), [`INVENTAIRE-SERVEUR-ASTRO-SWISSEPH-GOTENBERG.md`](./INVENTAIRE-SERVEUR-ASTRO-SWISSEPH-GOTENBERG.md), [`JOURNAL-OPERATIONS.md`](./JOURNAL-OPERATIONS.md).*
