# Correspondance IP / URL — n8n et clients (API SE)

Ce fichier sert à **paramétrer n8n** (et scripts) quand l’accès à l’API change : **port**, **protocole**, **IPv6**, ou **nouvelle machine**.

---

## 1. Point important (état actuel au 2026-04-19)

Dans ce dépôt, **l’adresse IPv4 publique du serveur astro n’a pas changé** : tout pointe déjà vers **`46.225.174.155`**.  
Les travaux récents ont ajouté un **accès par le port 80 (nginx)** en plus du **port 8000 (direct)** — **même IP**, pas « ancienne IP → nouvelle IP ».

Si tu migres plus tard vers **une autre VM / une autre IP**, utilise le **§4** (modèle à remplir) et mets à jour ce fichier.

---

## 2. Correspondance « ancien accès » → « nouvel accès » (même serveur, même IPv4)

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

**Gotenberg (inchangé dans nos travaux)** :

| Usage | URL (inchangée si même serveur) |
|--------|----------------------------------|
| PDF | `http://46.225.174.155:3000` |

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

## 5. Authentification API (optionnelle)

Si tu actives **`ASTRO_API_KEY`** sur le serveur (`/etc/default/astro-api`), chaque requête n8n vers l’API doit envoyer le header **`X-API-Key`**.  
Cela ne change **pas** l’IP ni le port, mais il faut **ajouter le header** dans chaque nœud HTTP concerné.

---

## 6. TLS / nom de domaine (futur)

Quand tu auras un **nom de domaine** + HTTPS, la correspondance deviendra du type :

| Avant (HTTP + IP) | Après (HTTPS + domaine) |
|-------------------|---------------------------|
| `http://46.225.174.155:8000/...` | `https://api.example.com/...` (selon ton vhost) |

À documenter ici le jour du basculement.

---

*Référence croisée : [`README.md`](./README.md), [`INVENTAIRE-SERVEUR-ASTRO-SWISSEPH-GOTENBERG.md`](./INVENTAIRE-SERVEUR-ASTRO-SWISSEPH-GOTENBERG.md), [`JOURNAL-OPERATIONS.md`](./JOURNAL-OPERATIONS.md).*
