# ARCHI — Architecture & résilience Spikka

Dossier de référence pour l'**architecture technique**, la **cybersécurité** et la **reprise après sinistre** de la stack Spikka (site, base, moteur astro, orchestration, paiement).

## Documents

| Document | Contenu |
|---|---|
| **[ARCHITECTURE-STACK.md](./ARCHITECTURE-STACK.md)** | Cartographie complète (schémas Mermaid) : Vercel, Neon, API SE, n8n, Stripe, Sentry, auth ; câblage PREPROD ↔ PROD ; flux d'une commande ; secrets ; SPOF. |
| **[AUDIT-CYBERSECURITE-2026-07-18.md](./AUDIT-CYBERSECURITE-2026-07-18.md)** | Audit toutes briques : findings priorisés (F1→F7), preuves live, remédiations, posture forte. |
| **[RUNBOOK-DR.md](./RUNBOOK-DR.md)** | Reprise après sinistre : confinement, rotation secrets, reconstruction `astro-server`, restauration Neon, redeploy site, smoke, checklist secrets. |

## Voir aussi

- Moteur astro (détail serveur) : [`../API SE/`](../API%20SE/)
- Specs workflows : `../THEME/`, `../PREV/`, `../SYN/`, `../DHN/` (`DOCUMENTATION WORKFLOW *.md`)
- Câblage n8n & mise en prod : `SITE/docs/RUNBOOK-MISE-EN-PROD.md`, `.cursor/rules/*`

> Convention : toute évolution majeure de la stack met à jour `ARCHITECTURE-STACK.md` et, si sécurité, un nouvel audit daté. Le live reste la vérité ; ces docs en sont le miroir à jour.
