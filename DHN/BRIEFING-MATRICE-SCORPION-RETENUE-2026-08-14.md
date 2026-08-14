# BRIEFING — Patch matrice Q v5.12 (couverture Scorpion / retenue)

> Statut : 🟢 ACTIF — GO utilisateur 2026-08-14 (« ok go » sur banc élargi + couverture)
> Lié à : `AUDIT-ASC-TOP3-ECHEC-2026-08-14.md`, `SPEC-QUESTIONNAIRE-ASC-ALLEGE-2026-07-12.md`
> Date : 2026-08-14

## Problème mesuré

Sur la baseline aveugle 8 AA, le vrai signe part parfois de **0–2 pts** :
Hugo (Scorpion) 1,37 · Bangalter (Scorpion) 2,95 · Proust (Bélier) 0.
Les **deux** Ascendants Scorpion du corpus échouent. Cause : la discrétion est cotée
Vierge/Capricorne avant Scorpion, et q6 n’a **aucune** option pour l’illisibilité.

## Protocole de cotation (banc élargi)

1. **Vérité** : uniquement rating **AA** (acte / Astro-Databank AA).
2. **Q** : première impression physique / comportementale — **jamais** le métier ni le
   Soleil. Si le Q « iconique » pointe le Soleil, le cas est un **contrôle négatif**
   (Hugo), pas un succès attendu.
3. **Mesure** : `--blind` uniquement (24 h, 12 signes).
4. **Gate GO** : top-1 ≥ 5/8 sur le noyau historique **ET** aucune régression parmi les
   5 justes actuels ; sur le banc élargi, Δ top-1 ≥ 0 et Bangalter (Scorpion coté
   ASC-first) passe en top-1 ou top-3.

## Patch technique (minimal)

| Cible | Avant | Après |
|---|---|---|
| `q1.d` Réservé / distant | Vierge 3, Scorpion **2**, Capri **3** | Vierge 3, Scorpion **3**, Capri **2** |
| `q12.b` Sérieux / fermé | Capri **4**, Scorpion **2**, Vierge 1 | Capri **3**, Scorpion **3**, Vierge 1 |
| `q12.f` Neutre / impassible | Taureau 3, Balance 2, Capri 1 | Taureau 2, **Scorpion 3**, Balance 2, Capri 1 |
| `q6.i` **nouvelle** | — | « Votre discrétion / qu’on ne vous lit pas » → Scorpion 4, Vierge 2, Capri 1 |

Surfaces : `Scorer1` (n8n, preprod puis prod) + `SITE/lib/dhn-questions-data.ts`.

## Simulation hors ligne (avant tout PUT)

`dhn-sim-matrix-patch.mjs` sur 13 cas (8 + Bangalter/Sinclar/Delon/Chirac/François) :

| | PRE | POST |
|---|---|---|
| TOP1 | 6/13 | **7/13** (+ Bangalter 2→1) |
| TOP3 | 10/13 | 10/13 |
| Régressions top-1 | — | **0** (Deneuve Capri 27→25, reste #1) |

## Résultats live preprod (2026-08-14, `--blind`)

Batch : Deneuve + 5 AA nouveaux, matrice v5.12 déjà sur Scorer1 preprod.

| Cas | Vérité | Trouvé | Rang ASC | Verdict |
|---|---|---|---|---|
| Deneuve | Capricorne | Capricorne | 1 | ✓ anti-régression |
| **Bangalter** | **Scorpion** | **Scorpion** | **1** | ✓ **gain patch** (était hors top-3) |
| Delon | Balance | Balance | 1 | ✓ |
| Chirac | Verseau | Gémeaux | top-3 | ~ |
| François | Cancer | Poissons | top-3 | ~ |
| Sinclar | Vierge | Bélier | hors top-3 | ✗ (Q showman ≠ Vierge) |

**Gate** : Deneuve préservée · Bangalter top-1 · 0 régression sur le cas Capri sensible.

⚠ Prod **pas encore** patchée — attendre GO pour `dhn-patch-matrix-v512.mjs --env=prod`.

## Hors scope


- Ne pas toucher `SIGN_FROM_Q_ONLY`.
- Ne pas « sauver » Hugo via Q Lion-iconique (contrôle négatif assumé).
- Ne pas patcher l’heure / Marr.
