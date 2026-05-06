// ==========================================
// ┌─────────────────────────────────────────────────────────────────────┐
// │  ⚠  GEL DU SCORING — v6.8.0 = dernière itération du moteur de score │
// │                                                                      │
// │  Décision astrologue Q51 = B (gel conditionnel, 2026-05-06) :       │
// │  À partir de la v7.x, plus aucune modification de l'algorithme de   │
// │  scoring (Harmony / Intensity / Adversity / bonus / pivots /        │
// │  modulateurs / seuils de bandes). v7.x = narration uniquement       │
// │  (synthPrompt, vocabulaire, structure, valorisation des marqueurs). │
// │                                                                      │
// │  Conditions de réouverture du scoring (clauses de sécurité) :       │
// │   1. Faille narrative majeure remontée par le bench textuel         │
// │      v7.x où un coefficient de scoring devient inévitable.          │
// │   2. Décision explicite de l'astrologue acceptant la dérogation.    │
// │   3. La modification doit être marquée « v7.x — déroge au gel »     │
// │      avec justification et bench de non-régression.                 │
// │                                                                      │
// │  Sans validation explicite : ne rien toucher au scoring.            │
// │  Performance gelée v6.8.0 (post Q52+Q53) : 30.4 % strict /          │
// │  96.2 % tolérant Q46 (réels), 0 sentinelle violée,                  │
// │  ~94.9 % précision astrale honnête.                                 │
// │                                                                      │
// │  NARRATION v7.0.0-β.3 (Q54 = D > B > A, post Q56 lexique contextuel) │
// │   • Bloc A — structure narrative obligatoire (5 sections nommées)   │
// │   • Bloc D — lexique TYPO_NARRATIVE_LEXICON (25 paires planétaires  │
// │              × 8 typologies × 2 natures) injecté dans chaque        │
// │              inter-aspect majeur de la SYNTHÈSE via                  │
// │              formatAspectRichTypo, ET dans les 12 prompts MAISONS    │
// │              via formatAspectsForHouse (cohérence narrative).        │
// │   • Bloc B — valorisation explicite des 4 marqueurs : Grand         │
// │              Bénéfique, Demi-Bénéfique, Mercure-Mercure,            │
// │              Signature typologique.                                  │
// │   • β.1 : +7 paires majeures (Lune-Pluton, Ascendant-Lune,          │
// │           Lune-Uranus, Ascendant-Soleil, MC-Soleil, Jupiter-Soleil, │
// │           Ascendant-Descendant) couvrant les paires les + fréquentes│
// │           du dataset jusqu'alors orphelines.                         │
// │   • β.2 (Q56-3) : Lune/Pluton hard ré-écrit pour 7 typologies hors   │
// │           Amour. La conjonction/carré/opposition Lune-Pluton ne     │
// │           déclenche plus systématiquement « toxique/manipulation » : │
// │           - Ami / Business : passion créative viscérale, complicité  │
// │             instinctive inséparable.                                │
// │           - Mentorat / Parent-Enfant : ascendant émotionnel viscéral │
// │             avec vigilance d'emprise (nuance, pas accusation).      │
// │           - Fratrie / Colocataire : intensité émotionnelle           │
// │             dévorante mais structurante.                            │
// │           Amour (toxique/possessif) et Rivalité (intensité           │
// │           narcissique) gardent la lecture sombre originale.         │
// │   • β.3 (bug fix Pertinence vs Harmonie, 2026-05-06) :              │
// │           Le score « pertinence » et T/S ne sont plus injectés       │
// │           numériquement dans le prompt LLM des sections maison.      │
// │           Ils sont remplacés par une qualification qualitative      │
// │           (très élevée / élevée / modérée / faible / très faible)    │
// │           + le mot de polarité (mixte / tension / soutien). Le LLM   │
// │           ne dispose plus d'aucun chiffre à recopier dans le texte   │
// │           des maisons → le seul score chiffré côté client est        │
// │           désormais l'« Harmonie » du cartouche (cohérence visuelle  │
// │           prompt↔HTML restaurée).                                    │
// │   Champ exposé : globalScoreResult.narrative_version = "v7.0.0-β.3" │
// └─────────────────────────────────────────────────────────────────────┘
// NOEUD CENTRAL SYNASTRIE v6.8.0 (= v6.7.0 + 2 décisions astrologue Q48-Q49)
// NARRATION v7.0.0-β.3 (= scoring figé v6.8.0 + narration enrichie Q54 + Q56-3 lexique contextuel + Q56-9 fix pertinence/harmonie)
// v6.8.0 (2026-05-06) : Affinement post-bench v6.7.0 (95 cas, Tier 2 Q45 = 0
//   match, 6/7 cas Q31 résiduels signent un Mercure-Mercure manqué).
//   NB : Q47 = renoncement astrologue (Edison/Tesla, Einstein/Bohr, Wagner/
//   Brahms restent en `tendu` — pas de pattern `fort_adversaire` viable sans
//   bricoler l'algorithme. L'astrologie ne tord pas le cou à l'Histoire.)
//   Q48 = Q45 (Tier 2 « Demi-Bénéfique ») élargi (option F = B+C) :
//         • Suppression de l'exigence luminaire-impliqué dans les 2 trigones
//         • Ciment Saturne Tier 2 : sextile OU trigone (orbe ≤ 4°)
//         Cible : FDR/Eleanor, Albert/Paola, Reagan/Nancy, Casals/Yo-Yo Ma.
//   Q49 = Bonus Mercure-Mercure harmonique (conj/trig/sext orbe ≤ 6°) :
//         • +3 max en Ami / Mentorat / Fratrie / Parent-Enfant
//         • +2 max en Amour (Q49-bis : universel mais réduit, Vénus/Mars/Lune
//           crée l'attraction, Mercure ne fait que la prolonger)
//         Cible : Bourdieu/Foucault, Tolkien/CSLewis, Cartier/Capa, S.Freud/
//         A.Freud, H.&T.Mann, Kerouac/Ginsberg, Wagner/Cosima.
// NOEUD CENTRAL SYNASTRIE v6.7.0 (= v6.6.0 + 3 décisions astrologue Q44-Q46)
// v6.7.0 (2026-05-06) : Affinement post-bench v6.6.0 (94 cas, Q31 inclus).
//   Q44 : Adversity Index étendu — 3 nouveaux patterns « rivalité intellectuelle »
//         à poids modéré (~3 pts effectifs chacun) :
//         • Mercure↔Saturne dur — contradiction systématique / mur intellectuel
//         • Soleil↔Soleil opposition — impossibilité de briller dans la même pièce
//         • MC↔Saturne dur — vouloir bloquer la reconnaissance publique
//         Cible : Edison/Tesla, Einstein/Bohr, Wagner/Brahms.
//   Q45 : Bonus Harmonique — Tier 2 « Demi-Bénéfique » (+4) pour 2 trigones
//         bénéfiques + ciment Saturne + pas de toxicité. Tier 1 (Grand Bénéfique
//         +7) reste rare (3 trigones + ciment + pas de toxicité). Cible :
//         FDR/Eleanor, Albert/Paola, Reagan/Nancy, Casals/Yo-Yo Ma.
//   Q46 : Manifeste — flag `astral_correct_despite_history` sur Bush/Barbara
//         et Trump/Merkel (cas où l'astrologue valide la position du moteur
//         malgré l'écart à la donnée biographique). Pas de modif moteur.
// NOEUD CENTRAL SYNASTRIE v6.6.0 (= v6.5.1 + 3 décisions astrologue Q41-Q43)
// v6.6.0 (2026-05-06) : Affinement post-bench v6.5.1.
//   Q41 : Seuil de bascule "fort" abaissé de 65 → 62 (62+ = excellente compat.)
//   Q42 : `fort_adversaire` analyseur : Adv ≥ 35 ET Harmony ≤ 55 (au lieu de 60)
//   Q43 : Bonus de signature harmonique « Grand Bénéfique » +7 si 3 trigones
//         bénéfiques + ciment Saturne + pas de toxicité saturnienne.
// NOEUD CENTRAL SYNASTRIE v6.5.1 (= v6.5.0 + recalibrage Q32 post-bench)
// v6.5.1 (2026-05-06) : Q32 — bonus Mentorat resserré pour éviter le
//   sur-boost de Buffett/Gates en v6.5.0 :
//   • Cap Mentorat ramené de +12 à +6 max (norme statistique pro)
//   • Sun-Saturne : orbe max 4° (au lieu de 8°)
//   • Jupiter-MC  : orbe max 3° (au lieu de 8°)
//   • Jupiter en M10 (présence physique) reste +3 (un signe direct).
// NOEUD CENTRAL SYNASTRIE v6.5.0 (= v6.4.0 + 6 décisions astrologue Q22-Q31)
// v6.5.0 (2026-05-06) : Affinement post-bench v6.4.0 (49 vrais + 16 témoins).
//   Q22 : Adversity Index ÉTENDU — Sun-Pluton, Asc-Mars, MC-MC, Mercure-Mars,
//         Vénus-Saturne (en plus de Mars-Pluton-Uranus). Capte les rivalités
//         modernes idéologiques/médiatiques/sportives (Trump, Federer/Nadal).
//   Q23 : Composite/Davison réactivés en Rivalité SI M10 ou M11 du Composite
//         contiennent au moins une planète personnelle (rivalité incarnée
//         dans la sphère publique : politique, sportive, médiatique).
//   Q24 : Bande spéciale « Indifférence astrale » en Rivalité quand
//         Adversity ≤ 5 ET Harmony < 50 (deux personnes qui se croisent
//         sans se voir, malgré le récit historique).
//   Q25 : Plafond-couperet à 55 sur Harmony si Indice Longévité < 2/15
//         ET typologie d'engagement (Amour, Business, P/E, Mentorat, Coloc).
//         Reflète le « belle façade, mais impossible à construire » (Diana/Charles).
//   Q27 : Bonus de signature Mentorat — Soleil(mentor) ↔ Saturne(élève) +
//         Jupiter(mentor) → M10/MC(élève). Capte transmission d'autorité
//         et ascenseur social inter-générationnel (De Gaulle/Chirac, etc.).
//   Q29 : Bonus de signature Fratrie — Lune ↔ Lune + Lune en M4 de l'autre.
//         Capte la matrice émotionnelle commune et le foyer originel partagé.
// NOEUD CENTRAL SYNASTRIE v6.4.0 (= v6.3.0 + 4 décisions astrologue Q16-Q21)
// v6.4.0 (2026-05-05) : Calibrages fins — pondération astrologique pro.
//   Q16 : Aspects génération-générationnels (P-P, N-N, U-U) si écart âge < 12 ans
//         → désactivés du scoring (bruit astronomique), conservés dans narratif
//   Q17 : status quo (dignités essentielles déjà capturées par RM)
//   Q18 : Maîtres de TOUTES les maisons clés croisés (étendu au-delà de M7)
//   Q19 : Matrice étoile × typologie (Algol = alert en Amour, major en Rivalité)
//   Q20 : status quo (heure inconnue = responsabilité utilisateur)
//   Q21 : Modulateur élémentaire (-3 / +2) selon dominantes opposées vs complémentaires
// NOEUD CENTRAL SYNASTRIE v6.3.0 (= v6.2.0 + 10 décisions astrologue multi-typo Q6-Q15)
// v6.3.0 (2026-05-05) : Couverture exhaustive des 8 typologies de synastrie.
//   Q6  : Business Saturne dur reframed structurant (sauf Vénus/Lune = red flag)
//   Q7  : Parent/Enfant asymétrique 70/30 via personne.role ou âge ≥15ans
//   Q8  : Mentorat — détection « guru complex » (patterns Neptune-M12+Pluton-Soleil OU Saturne-Lune+Pluton-M1)
//   Q9  : Rivalité — Indice d'Adversité séparé (intensité Mars/Pluton/Uranus durs)
//   Q10 : Vénus-Mars hors Amour — alerte « débordement du cadre initial »
//   Q11 : Modulateur Longévité étendu à Mentorat + Colocataire
//   Q12 : sharedNatalBlocks limité à Amour/Parent-Enfant/Business/Ami/Fratrie
//   Q13 : 3 vocabulaires de bandes (engagement/proximité/adversité)
//   Q14 : Blocages natals injectés dans synthPrompt seulement si Intensité ≥ 60
//   Q15 : Composite/Davison skippés pour Rivalité (pas de « Nous »)
// v6.2.0 (2026-05-05) : Q1-Q5 (affichage hybride, modulateur Longévité, Saturne
//                       conditionnel, Composite prioritaire, compensation intra-axe).
// v6.1.0 (2026-05-05) : Méthodologie astrologique pro respectée
//   • Étape 1 : assessNatalBlocks() — Saturne/Pluton afflige natals exposés
//   • Étape 3 : typologie Business M2/M6/M10 + Amour Soleil + ParentEnf M12
//   • Étape 4 : computeLongevityIndex() — Saturne ciment + Nœuds (0..15)
//   • synthPrompt restructuré en 5 étapes (Socle → Mécanique → Filtre →
//     Longévité → Composite) pour guider le LLM en remontant la pyramide
// v6.0.0 (2026-05-05) : Refonte Harmonie / Intensité (b — Intensité interne)
//   • classifyAspect() : 6 natures fines (fluid, tension_blocking,
//     fusion_neutral, transformative, karmic, destabilizing)
//   • computeHouseScoreHI() : (Hm, Im) baseline 50 = neutre
//   • computeGlobalHIScore() : score global = moyenne pondérée Hm
//   • computeQualitativeBandV6() : 8 bandes basées sur (H, I, signature)
// v5.0.0 SOCLE : Pilier 6 + veto + stretch asym (préservé pour debug)
// Superpositions en maisons (bidirectionnel)
// Inter-aspects B↔A et A↔B
// Contacts nodaux + Chiron
// Thème composite (mi-points)
// Grille typologique (8 typologies)
// Scoring composite v4.2.2 (B1-B6 fix, B7-B8 abandonnés)
// Génération prompts LLM par maison + synthèse
// ----- v4.2.2 (2026-05-03) — REVERT v4.4.0 (B8 abandonné) -------------------
//   v4.4.0 (B8) prévu pour libérer le signal `exact_bonus` du pilier 1 (caps
//   8→12 et 4→6). Simulation à froid prédisait +4.3 pts stricte. En réel :
//   3 cas borderline basculent moyen→fort à tort, 0 cas vraiment renforcé.
//   Cohérence stricte 45.7% → 41.3%. → Retour à v4.2.0.
// ----- v4.2.1 (2026-05-02) — REVERT v4.3.0 (B7/B7.1 abandonnés) ---------------
// ----- v4.2.0 (2026-05-02) — focus AMONT LLM, justesse moteur -----
//   B5 : `slot_X.score` exposait le brut weighted (mean=29.6, range -3.9..150.6).
//        Désormais : score = `normalized` (rapport au théorique de la maison,
//        borné [0,100] par construction, mean=56). `score_raw` conservé pour debug.
//   B6 : ajout d'un PILIER 5 « typology fitness » dans `global_score`. Avant,
//        les 4 piliers ignoraient totalement la grille typologique des maisons :
//        Beauvoir/Sartre Amour=Coloc=46/46. Désormais le score capture la
//        concentration de l'overlay sur les maisons typologiquement pertinentes
//        (poids ∈ [0,15], soit ~12.5% du final). Diviseur 105→120.
// ----- v4.1.0 (2026-05-02) -----
//   B1 : amplitude typologique amplifiée x2 dans P4 + bonus secondaires
//        + pénalité key_planets_absent (signal typologique discriminant).
//   B2 : intensité recalibrée (caps additifs revus, seuils labels relevés
//        70/55/35 vs 75/55/35) — distribution centrée ~50.
//   B3 : viability_correction bidirectionnelle — bonus si fluidité ≫ intensité.
//   B4 : scores de slots bornés [0,100] (Math.max/Math.min). Avant : -3.9 à +150.6.
// ==========================================

// ---- 0. CONFIGURATION ----
const NODE_ENRICHISSEMENT_A = "Enrichissement A";
const NODE_ENRICHISSEMENT_B = "Enrichissement B";

// ---- 1. DONNÉES ----
const enrichedA = $(NODE_ENRICHISSEMENT_A).first()?.json || {};
const enrichedB = $(NODE_ENRICHISSEMENT_B).first()?.json || {};

let synVars = {};
try { synVars = $("Extract Variables SYN").first()?.json || {}; } catch(e) {}

const personneA = synVars.personne_a || {};
const personneB = synVars.personne_b || {};
const typologie = (synVars.typologie || "Amour").trim();
const langue = synVars.langue || "Français";
const isEN = langue !== "Français";
const dateRelation = synVars.date_relation || null;
const AUDIT_MODE = !!(synVars.audit_mode || false);

const persoStrA = `${personneA.prenom || "A"} ${personneA.nom || ""}`.trim();
const persoStrB = `${personneB.prenom || "B"} ${personneB.nom || ""}`.trim();

function computeAge(dateStr) {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    const d = parseInt(parts[0]), m = parseInt(parts[1]) - 1, y = parseInt(parts[2]);
    if (isNaN(d) || isNaN(m) || isNaN(y)) return null;
    const now = new Date();
    let age = now.getFullYear() - y;
    if (now.getMonth() < m || (now.getMonth() === m && now.getDate() < d)) age--;
    return age >= 0 ? age : null;
}
const ageA = computeAge(personneA.date);
const ageB = computeAge(personneB.date);

function extractPlanets(enriched) {
    const p = enriched.planetes;
    if (Array.isArray(p)) return p;
    if (p?.output && Array.isArray(p.output)) return p.output;
    return [];
}
function extractHouses(enriched) {
    const m = enriched.maisons;
    if (Array.isArray(m)) return m;
    if (m?.output?.Houses && Array.isArray(m.output.Houses)) return m.output.Houses;
    if (m?.Houses && Array.isArray(m.Houses)) return m.Houses;
    return [];
}

const natalPlanetsA = extractPlanets(enrichedA);
const natalHousesA  = extractHouses(enrichedA);
const natalAspectsA  = enrichedA.aspects  || [];
const statsA         = enrichedA.stats    || {};
const chartRulerA    = enrichedA.chartRuler || null;
const configurationsA = enrichedA.configurations || [];
const etoileMatchesA      = enrichedA.etoileMatches     || [];
const etoileCuspMatchesA  = enrichedA.etoileCuspMatches || [];
const paranResultsA       = enrichedA.paranResults      || [];
const planeteOobA         = enrichedA.planeteOOB || [];
const parallelesNatA      = enrichedA.paralleles || [];
const cParallelesNatA     = enrichedA.contreParalleles || [];

const natalPlanetsB = extractPlanets(enrichedB);
const natalHousesB  = extractHouses(enrichedB);
const natalAspectsB  = enrichedB.aspects  || [];
const statsB         = enrichedB.stats    || {};
const chartRulerB    = enrichedB.chartRuler || null;
const configurationsB = enrichedB.configurations || [];
const etoileMatchesB      = enrichedB.etoileMatches     || [];
const etoileCuspMatchesB  = enrichedB.etoileCuspMatches || [];
const paranResultsB       = enrichedB.paranResults      || [];
const planeteOobB         = enrichedB.planeteOOB || [];
const parallelesNatB      = enrichedB.paralleles || [];
const cParallelesNatB     = enrichedB.contreParalleles || [];

const isDayChartA = (statsA.sect || "").toLowerCase().includes("diurne");
const isDayChartB = (statsB.sect || "").toLowerCase().includes("diurne");

// ========== BRADY — STAR_NATURE + PARAN ENRICHMENT ==========
const STAR_NATURE = {
    "Régulus":       { archetype: "Roi", theme: "Succès, noblesse, gloire — chute si arrogance" },
    "Spica":         { archetype: "Épi de blé", theme: "Dons, récolte, talents naturels, protection" },
    "Antarès":       { archetype: "Guerrier", theme: "Intensité, courage, obsession, extrêmes" },
    "Aldébaran":     { archetype: "Gardien de l'Est", theme: "Intégrité, honneur, succès par la vertu" },
    "Fomalhaut":     { archetype: "Gardien du Sud", theme: "Idéalisme, vision, succès par les rêves" },
    "Algol":         { archetype: "Méduse", theme: "Tabou, puissance brute, transformation radicale" },
    "Sirius":        { archetype: "Étoile Brillante", theme: "Ambition ardente, immortalité, brûlure" },
    "Véga":          { archetype: "Lyre", theme: "Charisme, art, enchantement, prestige culturel" },
    "Bételgeuse":    { archetype: "Épaule d'Orion", theme: "Succès sans complications, facilité naturelle" },
    "Rigel":         { archetype: "Pied d'Orion", theme: "Enseignement, transmission, ambition éducative" },
    "Procyon":       { archetype: "Petit Chien", theme: "Rapidité, succès éphémère, opportunisme" },
    "Canopus":       { archetype: "Navigateur", theme: "Pathfinder, innovation, voies nouvelles" },
    "Castor":        { archetype: "Jumeau mortel", theme: "Écriture, communication, narration" },
    "Pollux":        { archetype: "Jumeau immortel", theme: "Audace, sport, cruauté potentielle" },
    "Vindemiatrix":  { archetype: "Vendangeuse", theme: "Perte nécessaire, sagesse par le renoncement" },
    "Zubenelgenubi": { archetype: "Plateau Sud", theme: "Justice sociale, réforme, prix à payer" },
    "Zubeneschamali":{ archetype: "Plateau Nord", theme: "Récompense, justice favorable, succès mérité" },
    "Pléiades":      { archetype: "Les Sœurs", theme: "Deuil, vision mystique, jugement excessif" },
    "Deneb Algedi":  { archetype: "Queue de Chèvre", theme: "Droit, justice, intégrité administrative" },
    "Scheat":        { archetype: "Épaule de Pégase", theme: "Pensée libre, naufrage ou génie intellectuel" },
    "Achernar":      { archetype: "Fin du Fleuve", theme: "Risque en eaux inconnues, découverte, crise" },
    "Deneb":         { archetype: "Queue du Cygne", theme: "Subtilité, détails, recherche de la vérité" },
    "Arcturus":      { archetype: "Gardien de l'Ours", theme: "Apprentissage, garde, approche différente" }
};

// v6.4.0 — Q19 astrologue : matrice étoile × typologie. Permet de prioriser
// (« major »), modérer (« moderate ») ou alerter (« alert » = signal d'avertissement
// car l'étoile contredit la typologie). Si une étoile n'est pas listée pour
// une typologie, son poids reste neutre (« minor »). L'orbe pour considérer
// une étoile activée reste très strict (≤ 1° par défaut côté moteur).
const STAR_TYPOLOGY_PRIORITY = {
    "Régulus":       { Amour: "moderate", Business: "major",   "Parent / Enfant": "major", Mentorat: "major", Ami: "minor", Fratrie: "minor", Colocataire: "minor", "Rivalité": "alert" },
    "Spica":         { Amour: "major",    Business: "minor",   "Parent / Enfant": "moderate", Mentorat: "moderate", Ami: "moderate", Fratrie: "moderate", Colocataire: "minor", "Rivalité": "minor" },
    "Antarès":       { Amour: "moderate", Business: "alert",   "Parent / Enfant": "alert", Mentorat: "alert", Ami: "moderate", Fratrie: "moderate", Colocataire: "moderate", "Rivalité": "major" },
    "Aldébaran":     { Amour: "moderate", Business: "major",   "Parent / Enfant": "moderate", Mentorat: "major", Ami: "moderate", Fratrie: "minor", Colocataire: "minor", "Rivalité": "moderate" },
    "Fomalhaut":     { Amour: "major",    Business: "moderate", "Parent / Enfant": "moderate", Mentorat: "major", Ami: "moderate", Fratrie: "minor", Colocataire: "minor", "Rivalité": "minor" },
    "Algol":         { Amour: "alert",    Business: "alert",   "Parent / Enfant": "alert", Mentorat: "alert", Ami: "alert", Fratrie: "alert", Colocataire: "moderate", "Rivalité": "major" },
    "Sirius":        { Amour: "moderate", Business: "major",   "Parent / Enfant": "moderate", Mentorat: "major", Ami: "moderate", Fratrie: "moderate", Colocataire: "minor", "Rivalité": "moderate" },
    "Véga":          { Amour: "major",    Business: "moderate", "Parent / Enfant": "moderate", Mentorat: "major", Ami: "major", Fratrie: "moderate", Colocataire: "minor", "Rivalité": "minor" },
    "Bételgeuse":    { Amour: "moderate", Business: "moderate", "Parent / Enfant": "moderate", Mentorat: "moderate", Ami: "moderate", Fratrie: "moderate", Colocataire: "moderate", "Rivalité": "minor" },
    "Rigel":         { Amour: "minor",    Business: "moderate", "Parent / Enfant": "major", Mentorat: "major", Ami: "moderate", Fratrie: "minor", Colocataire: "minor", "Rivalité": "minor" },
    "Procyon":       { Amour: "alert",    Business: "alert",   "Parent / Enfant": "moderate", Mentorat: "moderate", Ami: "moderate", Fratrie: "moderate", Colocataire: "moderate", "Rivalité": "moderate" },
    "Canopus":       { Amour: "moderate", Business: "major",   "Parent / Enfant": "moderate", Mentorat: "major", Ami: "moderate", Fratrie: "minor", Colocataire: "minor", "Rivalité": "moderate" },
    "Castor":        { Amour: "moderate", Business: "moderate", "Parent / Enfant": "moderate", Mentorat: "major", Ami: "major", Fratrie: "major", Colocataire: "moderate", "Rivalité": "minor" },
    "Pollux":        { Amour: "moderate", Business: "moderate", "Parent / Enfant": "moderate", Mentorat: "moderate", Ami: "moderate", Fratrie: "major", Colocataire: "minor", "Rivalité": "major" },
    "Vindemiatrix":  { Amour: "alert",    Business: "moderate", "Parent / Enfant": "moderate", Mentorat: "moderate", Ami: "moderate", Fratrie: "moderate", Colocataire: "minor", "Rivalité": "moderate" },
    "Zubenelgenubi": { Amour: "moderate", Business: "alert",   "Parent / Enfant": "moderate", Mentorat: "moderate", Ami: "moderate", Fratrie: "moderate", Colocataire: "moderate", "Rivalité": "moderate" },
    "Zubeneschamali":{ Amour: "moderate", Business: "major",   "Parent / Enfant": "moderate", Mentorat: "major", Ami: "moderate", Fratrie: "moderate", Colocataire: "moderate", "Rivalité": "moderate" },
    "Pléiades":      { Amour: "alert",    Business: "moderate", "Parent / Enfant": "alert", Mentorat: "moderate", Ami: "moderate", Fratrie: "alert", Colocataire: "minor", "Rivalité": "minor" },
    "Deneb Algedi":  { Amour: "moderate", Business: "major",   "Parent / Enfant": "moderate", Mentorat: "moderate", Ami: "moderate", Fratrie: "moderate", Colocataire: "moderate", "Rivalité": "moderate" },
    "Scheat":        { Amour: "alert",    Business: "moderate", "Parent / Enfant": "alert", Mentorat: "moderate", Ami: "moderate", Fratrie: "moderate", Colocataire: "minor", "Rivalité": "minor" },
    "Achernar":      { Amour: "moderate", Business: "moderate", "Parent / Enfant": "moderate", Mentorat: "moderate", Ami: "moderate", Fratrie: "moderate", Colocataire: "moderate", "Rivalité": "moderate" },
    "Deneb":         { Amour: "minor",    Business: "moderate", "Parent / Enfant": "minor", Mentorat: "major", Ami: "moderate", Fratrie: "moderate", Colocataire: "minor", "Rivalité": "minor" },
    "Arcturus":      { Amour: "minor",    Business: "moderate", "Parent / Enfant": "major", Mentorat: "major", Ami: "moderate", Fratrie: "moderate", Colocataire: "minor", "Rivalité": "minor" }
};
function getStarPriorityForTypo(starName, typo) {
    return STAR_TYPOLOGY_PRIORITY[starName]?.[typo] || "minor";
}
const PARAN_PLANET_MODIFIERS = {
    "Soleil": "identité, vocation, égo",
    "Lune": "émotions, instinct, vie intérieure",
    "Mercure": "pensée, communication, échanges",
    "Vénus": "amour, valeurs, esthétique",
    "Mars": "action, courage, conflit",
    "Jupiter": "expansion, foi, générosité",
    "Saturne": "structure, limitation, maturité",
    "Uranus": "rupture, originalité, électricité",
    "Neptune": "dissolution, idéal, illusion",
    "Pluton": "transformation, pouvoir, profondeur",
    "Chiron": "blessure, guérison, enseignement",
    "Nœud Nord": "destinée, évolution, futur karmique",
    "Nœud Sud": "passé, acquis, mémoire karmique"
};
const PARAN_PHASE = {
    "Lever": "Jeunesse / Émergence — qualités qui se manifestent tôt",
    "Culmination": "Maturité / Zénith — expression la plus forte, vocation publique",
    "Coucher": "Maturité avancée / Récolte — sagesse acquise, transmission",
    "Anti-culmination": "Fondation / Héritage — ce qui est intime, caché, transmis inconsciemment"
};

function enrichParanBrady(paranList) {
    return paranList.map(pr => {
        const starInfo = STAR_NATURE[pr.etoile] || {};
        const planetMod = PARAN_PLANET_MODIFIERS[pr.planete] || "";
        const phase = PARAN_PHASE[pr.angle_planete] || "";
        const archStr = starInfo.archetype ? `${starInfo.archetype}` : pr.etoile;
        const interpBrady = [
            starInfo.theme || "",
            planetMod ? `Domaine planétaire : ${planetMod}` : "",
            phase || ""
        ].filter(Boolean).join(" · ");
        return { ...pr, star_archetype: starInfo.archetype || "", star_theme: starInfo.theme || "",
            planet_domain: planetMod, life_phase: phase, interpretation_brady: interpBrady };
    });
}
const enrichedParanA = enrichParanBrady(paranResultsA);
const enrichedParanB = enrichParanBrady(paranResultsB);

function computeCrossParanBridges(paranA, paranB, nameA, nameB) {
    const bridges = [];
    const starMapA = {};
    paranA.forEach(p => { if (!starMapA[p.etoile]) starMapA[p.etoile] = []; starMapA[p.etoile].push(p); });
    paranB.forEach(pb => {
        if (starMapA[pb.etoile]) {
            starMapA[pb.etoile].forEach(pa => {
                bridges.push({
                    etoile: pa.etoile, star_archetype: pa.star_archetype || "",
                    star_theme: pa.star_theme || "",
                    planete_a: pa.planete, personne_a: nameA,
                    angle_a: `${pa.angle_etoile}/${pa.angle_planete}`,
                    phase_a: pa.life_phase || "",
                    planete_b: pb.planete, personne_b: nameB,
                    angle_b: `${pb.angle_etoile}/${pb.angle_planete}`,
                    phase_b: pb.life_phase || "",
                    orbe_moyen: +((pa.orb + pb.orb) / 2).toFixed(2)
                });
            });
        }
    });
    return bridges.sort((a, b) => a.orbe_moyen - b.orbe_moyen);
}
const crossParanBridges = computeCrossParanBridges(enrichedParanA, enrichedParanB, persoStrA, persoStrB);

// ---- 2. CONSTANTES ASTROLOGIQUES ----
const SIGNES = [
    {id:0,fr:"Bélier",en:"Aries",element:"Feu",mode:"Cardinal",ruler:"Mars"},
    {id:1,fr:"Taureau",en:"Taurus",element:"Terre",mode:"Fixe",ruler:"Vénus"},
    {id:2,fr:"Gémeaux",en:"Gemini",element:"Air",mode:"Mutable",ruler:"Mercure"},
    {id:3,fr:"Cancer",en:"Cancer",element:"Eau",mode:"Cardinal",ruler:"Lune"},
    {id:4,fr:"Lion",en:"Leo",element:"Feu",mode:"Fixe",ruler:"Soleil"},
    {id:5,fr:"Vierge",en:"Virgo",element:"Terre",mode:"Mutable",ruler:"Mercure"},
    {id:6,fr:"Balance",en:"Libra",element:"Air",mode:"Cardinal",ruler:"Vénus"},
    {id:7,fr:"Scorpion",en:"Scorpio",element:"Eau",mode:"Fixe",ruler:"Pluton",traditionalRuler:"Mars"},
    {id:8,fr:"Sagittaire",en:"Sagittarius",element:"Feu",mode:"Mutable",ruler:"Jupiter"},
    {id:9,fr:"Capricorne",en:"Capricorn",element:"Terre",mode:"Cardinal",ruler:"Saturne"},
    {id:10,fr:"Verseau",en:"Aquarius",element:"Air",mode:"Fixe",ruler:"Uranus",traditionalRuler:"Saturne"},
    {id:11,fr:"Poissons",en:"Pisces",element:"Eau",mode:"Mutable",ruler:"Neptune",traditionalRuler:"Jupiter"}
];

const PLANETS_MAJEURS = ["Soleil","Lune","Mercure","Vénus","Mars","Jupiter","Saturne","Uranus","Neptune","Pluton"];
const PLANETS_TIER1 = [...PLANETS_MAJEURS, "Chiron", "Nœud Nord", "Nœud Sud", "Ascendant", "Descendant", "MC", "Milieu du Ciel", "Imum Coeli"];
const PLANETS_ASTEROIDS = ["Cérès", "Vesta", "Junon", "Pallas", "Lilith"];
const LOTS_ALL = [
    "Part de Fortune", "Lot de l'Esprit", "Lot de Nécessité", "Lot d'Éros", "Lot de Courage",
    "Lot de Némésis", "Lot de Basis", "Lot d'Exaltation", "Lot du Daemon", "Lot de Victoire",
    "Lot du Père", "Lot de la Mère", "Lot de Maladie", "Lot du Mariage", "Lot des Enfants", "Lot de Voyage"
];

const LOTS_PAR_TYPO = {
    "Amour":       ["Part de Fortune", "Lot d'Éros", "Lot du Mariage", "Lot des Enfants", "Lot de l'Esprit", "Lot du Daemon"],
    "Business":    ["Part de Fortune", "Lot de l'Esprit", "Lot de Victoire", "Lot du Mariage", "Lot de Courage", "Lot de Basis"],
    "Parent / Enfant": ["Part de Fortune", "Lot du Père", "Lot de la Mère", "Lot des Enfants", "Lot de Basis", "Lot de Nécessité"],
    "Fratrie":     ["Part de Fortune", "Lot de l'Esprit", "Lot de Basis", "Lot du Daemon"],
    "Ami":         ["Part de Fortune", "Lot de l'Esprit", "Lot de Victoire", "Lot du Daemon", "Lot de Voyage"],
    "Mentorat":    ["Part de Fortune", "Lot de l'Esprit", "Lot d'Exaltation", "Lot de Victoire", "Lot de Courage"],
    "Colocataire": ["Part de Fortune", "Lot de Basis", "Lot de Nécessité", "Lot de Maladie"],
    "Rivalité":    ["Part de Fortune", "Lot de Némésis", "Lot de Courage", "Lot de Victoire", "Lot du Daemon"]
};

const lotsRelevants = LOTS_PAR_TYPO[typologie] || LOTS_PAR_TYPO["Amour"];

function getPlanetTier(name) {
    if (PLANETS_TIER1.includes(name)) return 1;
    if (PLANETS_ASTEROIDS.includes(name)) return 2;
    if (lotsRelevants.includes(name)) return 2;
    if (LOTS_ALL.includes(name)) return 3;
    return 3;
}

const PLANETS_ALL = [...PLANETS_MAJEURS, "Chiron", "Nœud Nord", "Nœud Sud", "Ascendant", "Descendant", "Milieu du Ciel", "Imum Coeli"];

// Dignités essentielles
const DIGNITIES = {
    "Soleil":   { dom:["Lion"], exa:["Bélier"], exi:["Verseau"], chu:["Balance"] },
    "Lune":     { dom:["Cancer"], exa:["Taureau"], exi:["Capricorne"], chu:["Scorpion"] },
    "Mercure":  { dom:["Gémeaux","Vierge"], exa:["Vierge"], exi:["Sagittaire","Poissons"], chu:["Poissons"] },
    "Vénus":    { dom:["Taureau","Balance"], exa:["Poissons"], exi:["Scorpion","Bélier"], chu:["Vierge"] },
    "Mars":     { dom:["Bélier","Scorpion"], exa:["Capricorne"], exi:["Balance","Taureau"], chu:["Cancer"] },
    "Jupiter":  { dom:["Sagittaire","Poissons"], exa:["Cancer"], exi:["Gémeaux","Vierge"], chu:["Capricorne"] },
    "Saturne":  { dom:["Capricorne","Verseau"], exa:["Balance"], exi:["Cancer","Lion"], chu:["Bélier"] },
    "Uranus":   { dom:["Verseau"], exa:["Scorpion"], exi:["Lion"], chu:["Taureau"] },
    "Neptune":  { dom:["Poissons"], exa:["Cancer"], exi:["Vierge"], chu:["Capricorne"] },
    "Pluton":   { dom:["Scorpion"], exa:["Lion"], exi:["Taureau"], chu:["Verseau"] }
};

function getDignity(planetName, signFr) {
    const d = DIGNITIES[planetName];
    if (!d) return null;
    if (d.dom.includes(signFr)) return "Domicile";
    if (d.exa.includes(signFr)) return "Exaltation";
    if (d.exi.includes(signFr)) return "Exil";
    if (d.chu.includes(signFr)) return "Chute";
    return null;
}

// Maîtrises des signes
const SIGN_RULERS = {};
SIGNES.forEach(s => { SIGN_RULERS[s.fr] = s.ruler; });

const SIGN_TRADITIONAL_RULERS = {};
SIGNES.forEach(s => { SIGN_TRADITIONAL_RULERS[s.fr] = s.traditionalRuler || s.ruler; });

const SIGN_EXALTATIONS = {
    "Bélier": "Soleil", "Taureau": "Lune", "Gémeaux": null, "Cancer": "Jupiter",
    "Lion": null, "Vierge": "Mercure", "Balance": "Saturne", "Scorpion": null,
    "Sagittaire": null, "Capricorne": "Mars", "Verseau": null, "Poissons": "Vénus"
};

const SIGN_TRADITIONAL_EXALTATIONS = {
    "Bélier": "Soleil", "Taureau": "Lune", "Gémeaux": null, "Cancer": "Jupiter",
    "Lion": null, "Vierge": "Mercure", "Balance": "Saturne", "Scorpion": null,
    "Sagittaire": null, "Capricorne": "Mars", "Verseau": null, "Poissons": "Vénus"
};

// Décans Chaldéens (faces)
const CHALDEAN_DECANS = {
    "Bélier":["Mars","Soleil","Vénus"],"Taureau":["Mercure","Lune","Saturne"],
    "Gémeaux":["Jupiter","Mars","Soleil"],"Cancer":["Vénus","Mercure","Lune"],
    "Lion":["Saturne","Jupiter","Mars"],"Vierge":["Soleil","Vénus","Mercure"],
    "Balance":["Lune","Saturne","Jupiter"],"Scorpion":["Mars","Soleil","Vénus"],
    "Sagittaire":["Mercure","Lune","Saturne"],"Capricorne":["Jupiter","Mars","Soleil"],
    "Verseau":["Vénus","Mercure","Lune"],"Poissons":["Saturne","Jupiter","Mars"]
};

// Termes Égyptiens (Bounds)
const EGYPTIAN_TERMS = {
    "Bélier":[["Jupiter",6],["Vénus",12],["Mercure",20],["Mars",25],["Saturne",30]],
    "Taureau":[["Vénus",8],["Mercure",14],["Jupiter",22],["Saturne",27],["Mars",30]],
    "Gémeaux":[["Mercure",6],["Jupiter",12],["Vénus",17],["Mars",24],["Saturne",30]],
    "Cancer":[["Mars",7],["Vénus",13],["Mercure",19],["Jupiter",26],["Saturne",30]],
    "Lion":[["Jupiter",6],["Vénus",11],["Saturne",18],["Mercure",24],["Mars",30]],
    "Vierge":[["Mercure",7],["Vénus",17],["Jupiter",21],["Mars",28],["Saturne",30]],
    "Balance":[["Saturne",6],["Mercure",14],["Jupiter",21],["Vénus",28],["Mars",30]],
    "Scorpion":[["Mars",7],["Vénus",11],["Mercure",19],["Jupiter",24],["Saturne",30]],
    "Sagittaire":[["Jupiter",12],["Vénus",17],["Mercure",21],["Saturne",26],["Mars",30]],
    "Capricorne":[["Mercure",7],["Jupiter",14],["Vénus",22],["Saturne",26],["Mars",30]],
    "Verseau":[["Mercure",7],["Vénus",13],["Jupiter",20],["Mars",25],["Saturne",30]],
    "Poissons":[["Vénus",12],["Jupiter",16],["Mercure",19],["Mars",28],["Saturne",30]]
};
function getTermRuler(sign, deg) {
    const terms = EGYPTIAN_TERMS[sign];
    if (!terms) return null;
    const d = deg % 30;
    for (const [ruler, boundary] of terms) { if (d < boundary) return ruler; }
    return terms[terms.length - 1][0];
}
function getFaceRuler(sign, deg) {
    const decans = CHALDEAN_DECANS[sign];
    if (!decans) return null;
    return decans[Math.min(Math.floor((deg % 30) / 10), 2)];
}

// Triplicités Ptolémée/Dorothée (diurne, nocturne, participatif)
const TRIPLIC_DAY = {
    "Bélier":"Soleil","Lion":"Soleil","Sagittaire":"Soleil",
    "Taureau":"Vénus","Vierge":"Vénus","Capricorne":"Vénus",
    "Gémeaux":"Saturne","Balance":"Saturne","Verseau":"Saturne",
    "Cancer":"Vénus","Scorpion":"Vénus","Poissons":"Vénus"
};
const TRIPLIC_NIGHT = {
    "Bélier":"Jupiter","Lion":"Jupiter","Sagittaire":"Jupiter",
    "Taureau":"Lune","Vierge":"Lune","Capricorne":"Lune",
    "Gémeaux":"Mercure","Balance":"Mercure","Verseau":"Mercure",
    "Cancer":"Mars","Scorpion":"Mars","Poissons":"Mars"
};
const TRIPLIC_PART = {
    "Bélier":"Saturne","Lion":"Saturne","Sagittaire":"Saturne",
    "Taureau":"Mars","Vierge":"Mars","Capricorne":"Mars",
    "Gémeaux":"Jupiter","Balance":"Jupiter","Verseau":"Jupiter",
    "Cancer":"Lune","Scorpion":"Lune","Poissons":"Lune"
};

function getDignityFull(planetName, signFr, degInSign, isDayChart) {
    const base = getDignity(planetName, signFr);
    const term = getTermRuler(signFr, degInSign) === planetName ? "Terme" : null;
    const face = getFaceRuler(signFr, degInSign) === planetName ? "Face" : null;
    const triplDay = TRIPLIC_DAY[signFr] === planetName;
    const triplNight = TRIPLIC_NIGHT[signFr] === planetName;
    const triplPart = TRIPLIC_PART[signFr] === planetName;
    const tripliciteFlag = isDayChart ? triplDay : triplNight;
    const tripl = tripliciteFlag ? "Triplicité" : (triplPart ? "Tripl.Part." : null);
    const termeFlag = term ? true : false;
    const faceFlag = face ? true : false;
    const dignities = [base, tripl, term, face].filter(Boolean);
    if (termeFlag && !dignities.includes("Terme")) dignities.push("Terme");
    if (faceFlag && !dignities.includes("Face")) dignities.push("Face");
    return {
        primary: base,
        triplicite: tripliciteFlag,
        triplicite_participative: triplPart,
        terme: termeFlag,
        face: faceFlag,
        all: dignities,
        peregrine: !base && !tripliciteFlag && !termeFlag && !faceFlag
    };
}

// Obliquité écliptique et seuils
const OBLIQUITY = 23.4393;
const OOB_THRESHOLD = OBLIQUITY;
const DECL_ORB_STANDARD = 1.0;
const DECL_ORB_LUMINAIRE = 1.5;
const LUMINAIRES_DECL = new Set(["Soleil", "Lune"]);

// Signes masculins/féminins (Hayz)
const MASCULINE_SIGNS = new Set(["Bélier","Gémeaux","Lion","Balance","Sagittaire","Verseau"]);
const FEMININE_SIGNS = new Set(["Taureau","Cancer","Vierge","Scorpion","Capricorne","Poissons"]);
const DIURNAL_PLANETS = new Set(["Soleil","Jupiter","Saturne"]);
const NOCTURNAL_PLANETS = new Set(["Lune","Vénus","Mars"]);

// Antiscia
const ANTISCIA_ORB = 1.5;
const ANTISCIA_PLANETS = ["Soleil","Lune","Mercure","Vénus","Mars","Jupiter","Saturne","Uranus","Neptune","Pluton"];

const ASPECTS_DEF = [
    { name: "Conjonction", angle: 0,   symbol: "☌", nature: "fusion",   mult: 3.0 },
    { name: "Sextile",     angle: 60,  symbol: "⚹", nature: "harmonie", mult: 1.5 },
    { name: "Carré",       angle: 90,  symbol: "□", nature: "tension",  mult: 2.0 },
    { name: "Trigone",     angle: 120, symbol: "△", nature: "harmonie", mult: 2.0 },
    { name: "Quinconce",   angle: 150, symbol: "⚻", nature: "ajustement", mult: 1.0 },
    { name: "Opposition",  angle: 180, symbol: "☍", nature: "tension",  mult: 2.5 }
];

const ASPECTS_MINOR = [
    { name: "Semi-sextile",  angle: 30,  symbol: "⚺", nature: "ajustement", mult: 0.5, minor: true },
    { name: "Semi-carré",    angle: 45,  symbol: "∠", nature: "tension",    mult: 0.8, minor: true },
    { name: "Sesquicarré",   angle: 135, symbol: "⚼", nature: "tension",    mult: 0.8, minor: true }
];

const _LUMINAIRE_NAMES = new Set(["Soleil", "Lune"]);

const ORBS_SYNASTRY = {
    "Soleil": 7, "Lune": 7, "Ascendant": 6, "MC": 5,
    "Milieu du Ciel": 5, "Descendant": 6, "Imum Coeli": 4,
    "Mercure": 5, "Vénus": 6, "Mars": 6,
    "Jupiter": 5, "Saturne": 5,
    "Uranus": 4, "Neptune": 4, "Pluton": 4,
    "Chiron": 3, "Nœud Nord": 4, "Nœud Sud": 4,
    "default": 4
};

const PLANET_WEIGHT = {
    "Soleil": 10, "Lune": 10, "Ascendant": 8, "MC": 6,
    "Milieu du Ciel": 6, "Descendant": 8, "Imum Coeli": 4,
    "Vénus": 8, "Mars": 7, "Mercure": 6,
    "Jupiter": 6, "Saturne": 7,
    "Uranus": 5, "Neptune": 5, "Pluton": 7,
    "Chiron": 5, "Nœud Nord": 6, "Nœud Sud": 5,
    "Part de Fortune": 3, "default": 3
};

// ====== v6.0.0 — DOUBLE SCORING HARMONIE / INTENSITÉ ========================
// Validé avec un astrologue pro le 2026-05-05. Toute calibration future doit
// référencer les benchmarks ancrés (Newman/Woodward 85+, Curie 85+, Kahlo/
// Rivera 45-60, Depp/Heard <30). Documentation : SITE/scripts/SYN-FIABILITE-RAPPORT.md
//
// Convention :
//   harmony   : [-10..+10] signé. baseline 0 = aspect neutre. >0 = fluide,
//               <0 = bloquant. Sera projeté sur [0..100] côté maison/global
//               avec baseline 50.
//   intensity : [0..10] non signé. 0 = aspect tellement large qu'il est
//               périphérique, 10 = aspect majeur ultra-puissant (luminaire +
//               orbe serré + nature transformative). Reste invisible côté
//               client mais pondère la bande qualitative et bride Gemini.
//
// 6 classes d'aspects (`natureClass`) :
//   - fluid              : trigone/sextile entre planètes compatibles
//   - tension_blocking   : carré/opposition impliquant Saturne, Mars, ou
//                          deux planètes lentes — bloque la fluidité
//   - fusion_neutral     : conjonction non clairement bénéfique ni maléfique
//   - transformative     : Pluton dur, Uranus dur sur planète personnelle —
//                          paradoxal (clivant mais profondément transformateur)
//   - karmic             : contacts nodaux directs, Saturne-Saturne durable
//   - destabilizing      : Neptune dur sur luminaire, combust luminaire

const HARD_ASPECTS = new Set(["Carré", "Opposition", "Quinconce"]);
const SOFT_ASPECTS = new Set(["Trigone", "Sextile", "Demi-sextile"]);
const FUSION_ASPECT = "Conjonction";

const PLANET_NATURE = {
    benefic: new Set(["Vénus", "Jupiter"]),
    malefic_classical: new Set(["Mars", "Saturne"]),
    transformer: new Set(["Pluton", "Uranus"]),
    illusionist: new Set(["Neptune"]),
    luminary: new Set(["Soleil", "Lune"]),
    personal: new Set(["Soleil", "Lune", "Mercure", "Vénus", "Mars"]),
    nodes: new Set(["Nœud Nord", "Nœud Sud"]),
    angles: new Set(["Ascendant", "Descendant", "MC", "Milieu du Ciel", "Imum Coeli"])
};

// Intensité de base par aspect (avant pondération orbe et planète).
const ASPECT_INTENSITY_BASE = {
    "Conjonction": 9,
    "Opposition": 8,
    "Carré": 7,
    "Trigone": 6,
    "Sextile": 4,
    "Quinconce": 3,
    "Demi-sextile": 2
};

// classifyAspect — détermine la classe v6.0.0 et les valeurs de base
// signed (harmony) / unsigned (intensity) avant pondération.
//
// @param p1 / p2          : noms de planètes (string)
// @param aspectName       : "Conjonction", "Trigone", "Carré", etc.
// @param oldNature        : nature ancien moteur ("harmonie", "tension",
//                           "fusion", "ajustement") — utilisée comme fallback
// @returns { class, baseHarmony, baseIntensity, rationale }
function classifyAspect(p1, p2, aspectName, oldNature) {
    const PN = PLANET_NATURE;
    const isHard = HARD_ASPECTS.has(aspectName);
    const isSoft = SOFT_ASPECTS.has(aspectName);
    const isFusion = aspectName === FUSION_ASPECT;

    const involvesNode = PN.nodes.has(p1) || PN.nodes.has(p2);
    const involvesPluto = p1 === "Pluton" || p2 === "Pluton";
    const involvesUranus = p1 === "Uranus" || p2 === "Uranus";
    const involvesNeptune = p1 === "Neptune" || p2 === "Neptune";
    const involvesSaturn = p1 === "Saturne" || p2 === "Saturne";
    const involvesMars = p1 === "Mars" || p2 === "Mars";
    const involvesPersonal = PN.personal.has(p1) || PN.personal.has(p2);
    const involvesLuminary = PN.luminary.has(p1) || PN.luminary.has(p2);
    const involvesBenefic = PN.benefic.has(p1) || PN.benefic.has(p2);
    const involvesAngle = PN.angles.has(p1) || PN.angles.has(p2);

    const intensityBase = ASPECT_INTENSITY_BASE[aspectName] || 3;
    const luminaryBoost = involvesLuminary ? 1 : 0;
    const angleBoost = involvesAngle ? 1 : 0;

    // 1. KARMIQUE — contacts nodaux directs ou Saturne-Saturne
    if (involvesNode) {
        const isSouth = p1 === "Nœud Sud" || p2 === "Nœud Sud";
        const isNorth = p1 === "Nœud Nord" || p2 === "Nœud Nord";
        // Nœud Sud dominant = répétition karmique, légèrement régressive
        // Nœud Nord = chemin évolutif aligné, légèrement positive
        const baseH = isSouth ? -2 : (isNorth ? +2 : 0);
        return { class: "karmic", baseHarmony: baseH, baseIntensity: intensityBase + 1, rationale: "nodal_contact" };
    }
    if (p1 === "Saturne" && p2 === "Saturne") {
        const baseH = isSoft ? +3 : (isHard ? -2 : +1);
        return { class: "karmic", baseHarmony: baseH, baseIntensity: intensityBase, rationale: "saturn_durability" };
    }

    // 2. TRANSFORMATIVE — Pluton/Uranus en aspect dur ou conjoncteur de planète personnelle
    if ((involvesPluto || involvesUranus) && involvesPersonal && (isHard || isFusion)) {
        // Aspect dur Pluton/Uranus sur planète personnelle = transformatif
        // pas neutre arithmétiquement (-3 à -5) mais ultra-intense (+8/+10)
        const baseH = involvesPluto ? -4 : -3;       // Pluton un cran plus clivant
        const baseI = (involvesPluto ? 9 : 8) + luminaryBoost;
        return { class: "transformative", baseHarmony: baseH, baseIntensity: Math.min(10, baseI), rationale: involvesPluto ? "pluto_hard" : "uranus_hard" };
    }

    // 3. DESTABILIZING — Neptune dur sur luminaire ou combuste
    if (involvesNeptune && involvesLuminary && (isHard || isFusion)) {
        return { class: "destabilizing", baseHarmony: -5, baseIntensity: Math.min(10, intensityBase + 1), rationale: "neptune_hard_luminary" };
    }

    // 4. TENSION_BLOCKING — Saturne ou Mars en carré/opposition
    if ((involvesSaturn || involvesMars) && isHard) {
        // Saturne-Vénus carré = blocage affectif classique
        // Mars-Mars carré = friction explosive
        // Severity dépend de la planète touchée
        const sevH = involvesLuminary ? -7 : -5;
        return { class: "tension_blocking", baseHarmony: sevH, baseIntensity: intensityBase + luminaryBoost, rationale: involvesSaturn ? "saturn_blocking" : "mars_blocking" };
    }

    // 5. FUSION_NEUTRAL — conjonction sans qualifiant clair
    if (isFusion) {
        // Conjonction Soleil-Soleil, Lune-Lune, Mars-Mars, etc.
        // ou conjonction luminaire-bénéfique (Soleil-Vénus)
        let baseH = 0;
        if (involvesBenefic) baseH = +3;
        if (PN.malefic_classical.has(p1) && PN.malefic_classical.has(p2)) baseH = -3;
        // Soleil-Lune conjonction = très alignée
        if ((p1 === "Soleil" && p2 === "Lune") || (p1 === "Lune" && p2 === "Soleil")) baseH = +5;
        return { class: "fusion_neutral", baseHarmony: baseH, baseIntensity: intensityBase + luminaryBoost, rationale: "fusion" };
    }

    // 6. FLUID — trigone/sextile par défaut
    if (isSoft) {
        let baseH = +5;
        if (involvesBenefic && involvesLuminary) baseH = +7;
        if (involvesSaturn) baseH = +3;     // soft Saturne = stabilisateur mesuré
        if (involvesPluto || involvesUranus || involvesNeptune) baseH = +4;
        return { class: "fluid", baseHarmony: baseH, baseIntensity: intensityBase + angleBoost, rationale: "soft_aspect" };
    }

    // 7. TENSION par défaut (carré/opposition non-Mars/Saturne, quinconce)
    if (isHard) {
        const baseH = involvesLuminary ? -5 : -4;
        return { class: "tension_blocking", baseHarmony: baseH, baseIntensity: intensityBase, rationale: "hard_default" };
    }

    // Fallback ajustement / inconnu
    const fallbackH = oldNature === "harmonie" ? +2 : oldNature === "tension" ? -2 : 0;
    return { class: "fusion_neutral", baseHarmony: fallbackH, baseIntensity: 2, rationale: "fallback" };
}

// computeAspectScoreHI — pondération complète d'un aspect concret en (H, I)
// pour les besoins du moteur v6.0.0.
//
// Entrée : aspect (output de computeInterAspects ou similaire) avec
//   { planete_source, planete_cible, name|aspect, nature, orbe, score, applying }
// Contexte : sourceWeight, targetWeight (PLANET_WEIGHT), dignités optionnelles.
//
// Sortie : { harmony, intensity, class, contribution, debug }
//   harmony   : signed [-10..+10]
//   intensity : unsigned [0..10]
//   contribution : produit harmony × poids × dégressivité, utilisé directement
//                  dans l'agrégation maison
function computeAspectScoreHI(asp, ctx = {}) {
    // v6.4.0 — Q16 astrologue : aspect générationnel = bruit astronomique de
    // la décennie de naissance commune. Contribution nulle au scoring.
    if (asp && asp._generational_noise === true) {
        return {
            class: "generational_noise",
            harmony: 0,
            intensity: 0,
            rationale: "generational_noise_skipped",
            base_harmony: 0,
            base_intensity: 0,
            orbe_factor: 0,
            planet_weight: 0
        };
    }
    const aspectName = asp.name || asp.aspect || "?";
    const p1 = asp.planete_source || asp.from || "?";
    const p2 = asp.planete_cible || asp.to || "?";
    const oldNature = asp.nature || "?";
    const orbe = typeof asp.orbe === "number" ? asp.orbe : 5;
    const applying = asp.applying;

    const cls = classifyAspect(p1, p2, aspectName, oldNature);

    // Échelle d'orbe : luminaire/angle = 8°, perso = 6°, transgénérationnelle = 5°
    // Pour faire simple on prend 8° comme orbe max théorique tous aspects confondus.
    const orbeMaxTheoretical = 8;
    const orbeFactor = Math.max(0.15, 1 - (Math.min(orbe, orbeMaxTheoretical) / orbeMaxTheoretical));

    const w1 = (PLANET_WEIGHT[p1] || PLANET_WEIGHT.default) / 10; // [0.3..1.0]
    const w2 = (PLANET_WEIGHT[p2] || PLANET_WEIGHT.default) / 10;
    const planetWeight = (w1 + w2) / 2;

    // Applying / separating : applying = +25%, separating = -15%
    let applMult = 1.0;
    if (applying === true) applMult = 1.25;
    else if (applying === false) applMult = 0.85;

    // Pondération finale
    const harmony = +(cls.baseHarmony * orbeFactor * planetWeight * applMult).toFixed(2);
    const intensity = +Math.min(10, cls.baseIntensity * orbeFactor * (0.6 + 0.4 * planetWeight) * applMult).toFixed(2);

    return {
        harmony,
        intensity,
        class: cls.class,
        rationale: cls.rationale,
        debug: {
            p1, p2, aspectName, orbe,
            baseHarmony: cls.baseHarmony,
            baseIntensity: cls.baseIntensity,
            orbeFactor: +orbeFactor.toFixed(2),
            planetWeight: +planetWeight.toFixed(2),
            applMult
        }
    };
}

// ---- 3. UTILITAIRES ----
function angularDiff(a, b) {
    let d = ((b - a) % 360 + 360) % 360;
    return d > 180 ? d - 360 : d;
}

function absAngularDiff(a, b) {
    return Math.abs(angularDiff(a, b));
}

function signFromDegree(deg) {
    const idx = Math.floor(((deg % 360) + 360) % 360 / 30) % 12;
    return SIGNES[idx]?.fr || "?";
}

function getPlanetName(p) {
    return p.planet?.fr || p.planet?.en || p.name || "?";
}

function getPlanetDegree(p) {
    return p.fullDegree || p.degree_decimal || 0;
}

function getPlanetSign(p) {
    return p.zodiac_sign?.name?.fr || "";
}

function getPlanetRetro(p) {
    return p.isRetro === "True" || p.isRetro === true;
}

const SIGNE_TO_IDX = {};
SIGNES.forEach(s => { SIGNE_TO_IDX[s.fr] = s.id; SIGNE_TO_IDX[s.en] = s.id; });

function cuspFullDegree(seg) {
    const idx = SIGNE_TO_IDX[seg.signe];
    if (idx === undefined) return null;
    return (idx * 30 + (seg.degre_debut || 0)) % 360;
}

const _cuspCache = new WeakMap();
function extractCusps(houses) {
    if (!Array.isArray(houses)) return [];
    if (_cuspCache.has(houses)) return _cuspCache.get(houses);
    const cusps = [];
    for (const h of houses) {
        const houseNum = h.maison || h.house || h.House;
        if (houseNum === undefined) continue;
        let deg = null;

        if (h.segments && Array.isArray(h.segments)) {
            const cuspSeg = h.segments.find(s => s.type === "Cuspide");
            if (cuspSeg) deg = cuspFullDegree(cuspSeg);
        }
        if (deg === null && h.degree !== undefined) {
            deg = h.degree;
        }
        if (deg === null && h.cuspide !== undefined) {
            deg = h.cuspide;
        }

        if (deg !== null && !isNaN(deg)) {
            cusps.push({ house: Number(houseNum), degree: ((deg % 360) + 360) % 360 });
        }
    }
    cusps.sort((a, b) => a.house - b.house);
    _cuspCache.set(houses, cusps);
    return cusps;
}

function getHouseNumber(deg, houses) {
    const cusps = extractCusps(houses);
    const n = cusps.length;
    if (n < 12) return Math.floor(((deg % 360 + 360) % 360) / 30) + 1;

    const d = ((deg % 360) + 360) % 360;
    for (let i = 0; i < n; i++) {
        const h1 = cusps[i].degree;
        const h2 = cusps[(i + 1) % n].degree;
        if ((h1 < h2 && d >= h1 && d < h2) || (h1 >= h2 && (d >= h1 || d < h2))) {
            return cusps[i].house;
        }
    }
    return cusps[0]?.house || 1;
}

function getCuspDegree(houseNum, houses) {
    const cusps = extractCusps(houses);
    const found = cusps.find(c => c.house === houseNum);
    if (found) return found.degree;
    return (houseNum - 1) * 30;
}

function midpoint(deg1, deg2) {
    const d1 = ((deg1 % 360) + 360) % 360;
    const d2 = ((deg2 % 360) + 360) % 360;
    let diff = d2 - d1;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return ((d1 + diff / 2) % 360 + 360) % 360;
}

function normDegFromDegree(deg) {
    const d = ((deg % 360) + 360) % 360;
    return Math.round((d % 30) * 100) / 100;
}

// ---- 4. GRILLE TYPOLOGIQUE ----
const TYPOLOGY_GRID = {
    "Amour": {
        principales: [5, 7, 8],
        secondaires: [4, 1, 12],
        ombre: [12, 6],
        ombre_nuance: { 8: "tension_only" },
        // v6.1.0 — Soleil ajouté (méthodologie : Soleil = identité projetée
        // dans la relation, pas seulement Vénus/Mars/Lune)
        planetes_cles: ["Soleil", "Vénus", "Mars", "Lune", "Pluton", "Nœud Nord"],
        label_fr: "Relation romantique / amoureuse",
        label_en: "Romantic relationship"
    },
    "Business": {
        // v6.1.0 — M6 promue en principale (travail quotidien / opérations =
        // axe central d'un partenariat pro). M2/M6/M10 forment la triade
        // canonique business selon la méthodologie.
        principales: [2, 6, 7, 8, 10],
        secondaires: [11, 3],
        ombre: [12, 8, 1],
        ombre_nuance: { 6: "hierarchy_ok" },
        planetes_cles: ["Saturne", "Jupiter", "Mercure", "MC"],
        label_fr: "Partenariat professionnel / associé",
        label_en: "Business partnership"
    },
    "Parent / Enfant": {
        // v6.1.0 — M12 promue en principale (héritage karmique, transmission
        // inconsciente, schémas familiaux profonds = axe central parent/enfant).
        // M10 reste car autorité parentale.
        principales: [4, 5, 10, 12],
        secondaires: [8, 2],
        ombre: [12, 8, 6],
        ombre_nuance: { 12: "karmic_moderated", 8: "karmic_moderated" },
        planetes_cles: ["Saturne", "Lune", "Soleil", "Chiron"],
        label_fr: "Relation parent-enfant",
        label_en: "Parent-child relationship"
    },
    "Fratrie": {
        principales: [3, 4],
        secondaires: [11, 1],
        ombre: [12, 8, 6],
        ombre_nuance: { 8: "heritage_risk" },
        planetes_cles: ["Mercure", "Lune", "Mars"],
        label_fr: "Relation fraternelle (frère/sœur)",
        label_en: "Sibling relationship"
    },
    "Ami": {
        principales: [11, 3],
        secondaires: [9, 5, 1],
        ombre: [12, 8],
        ombre_nuance: {},
        planetes_cles: ["Mercure", "Jupiter", "Uranus", "Lune"],
        label_fr: "Amitié",
        label_en: "Friendship"
    },
    "Mentorat": {
        principales: [9, 3, 10],
        secondaires: [11, 1],
        ombre: [12, 1, 8],
        ombre_nuance: { 12: "guru_complex" },
        planetes_cles: ["Jupiter", "Saturne", "Mercure", "Soleil"],
        label_fr: "Relation de mentorat (professeur/élève, coach)",
        label_en: "Mentoring relationship"
    },
    "Colocataire": {
        principales: [4, 6, 2],
        secondaires: [1, 12],
        ombre: [12, 8],
        ombre_nuance: { 6: "routine_ok" },
        planetes_cles: ["Lune", "Saturne", "Mars", "Vénus"],
        label_fr: "Cohabitation (sans amour)",
        label_en: "Roommate / cohabitation"
    },
    "Rivalité": {
        principales: [7, 12],
        secondaires: [8, 1],
        ombre: [],
        ombre_nuance: {},
        planetes_cles: ["Mars", "Pluton", "Saturne", "Soleil"],
        label_fr: "Rivalité / concurrence / adversaire",
        label_en: "Rivalry / competition"
    }
};

const _typoBase = TYPOLOGY_GRID[typologie] || TYPOLOGY_GRID["Amour"];
const typoConfig = { ..._typoBase, _typologie: typologie };
const maisonsRelevantes = [...new Set([...typoConfig.principales, ...typoConfig.secondaires])];
const planetesClés = typoConfig.planetes_cles;

const MAISON_LABELS_FR = {
    1: "Identité, apparence, ego",
    2: "Ressources, finances, valeurs",
    3: "Communication, fratrie, environnement proche",
    4: "Foyer, racines, famille, sécurité intérieure",
    5: "Créativité, romance, enfants, plaisir",
    6: "Travail quotidien, santé, service, organisation",
    7: "Partenariats, mariage, contrats, ennemis déclarés",
    8: "Intimité profonde, sexualité, crises, transformation, héritages",
    9: "Voyages, philosophie, enseignement supérieur, spiritualité",
    10: "Carrière, réputation, statut social, autorité",
    11: "Amitiés, groupes, idéaux, projets collectifs",
    12: "Inconscient, secrets, sacrifice, ennemis cachés, karma"
};
const MAISON_LABELS_EN = {
    1: "Identity, appearance, ego",
    2: "Resources, finances, values",
    3: "Communication, siblings, local environment",
    4: "Home, roots, family, inner security",
    5: "Creativity, romance, children, pleasure",
    6: "Daily work, health, service, organization",
    7: "Partnerships, marriage, contracts, open enemies",
    8: "Deep intimacy, sexuality, crises, transformation, inheritances",
    9: "Travel, philosophy, higher education, spirituality",
    10: "Career, reputation, social status, authority",
    11: "Friendships, groups, ideals, collective projects",
    12: "Unconscious, secrets, sacrifice, hidden enemies, karma"
};
const MAISON_LABELS = isEN ? MAISON_LABELS_EN : MAISON_LABELS_FR;

const HOUSE_SIGNIF_FR = {
    1: "Lorsque les planètes d'une personne tombent dans la Maison 1 de l'autre, elles colorent immédiatement l'impression qu'elle dégage. C'est l'alchimie du premier regard.",
    2: "La Maison 2 en synastrie éclaire la manière dont l'autre influence le rapport à la stabilité financière, à l'estime personnelle et aux valeurs profondes.",
    3: "Cette maison régit la qualité des échanges verbaux, l'humour partagé, la fluidité de la communication entre deux personnes.",
    4: "La Maison 4 touche au cœur intime de la relation : le sentiment de « chez soi » que l'on ressent avec l'autre.",
    5: "Maison du flirt, de l'élan romantique et du plaisir partagé. Elle révèle l'intensité de l'attirance amoureuse initiale.",
    6: "Cette maison montre comment deux personnes gèrent la vie de tous les jours ensemble : les tâches, les habitudes, le rythme.",
    7: "Axe central de la synastrie : la Maison 7 montre comment l'autre est perçu en tant que partenaire officiel. C'est le miroir de la relation d'égal à égal.",
    8: "La maison de la fusion : sexualité, pouvoir partagé, secrets dévoilés. Elle montre la profondeur de la connexion intime et les luttes de pouvoir.",
    9: "Cette maison révèle si deux personnes partagent une même philosophie de vie, un même appétit d'exploration et de croissance intellectuelle.",
    10: "La Maison 10 en synastrie montre l'impact de l'autre sur la carrière, le statut social et les ambitions publiques.",
    11: "Maison de l'amitié véritable et des projets partagés. Elle montre si la relation s'inscrit dans une vision d'avenir commune.",
    12: "La maison la plus mystérieuse en synastrie : elle touche aux liens invisibles, karmiques, à ce qui se joue en coulisses."
};
const HOUSE_SIGNIF_EN = {
    1: "When one person's planets fall into the other's 1st House, they immediately color the impression projected. It's the alchemy of first contact.",
    2: "The 2nd House in synastry illuminates how the other person influences financial stability, self-esteem and core values.",
    3: "This house governs the quality of verbal exchanges, shared humor and communication flow between two people.",
    4: "The 4th House touches the intimate core of the relationship: the feeling of 'home' one experiences with the other.",
    5: "The house of flirtation, romantic impulse and shared pleasure. It reveals the intensity of initial romantic attraction.",
    6: "This house shows how two people manage everyday life together: tasks, habits, rhythm.",
    7: "The central axis of synastry: the 7th House shows how the other is perceived as an official partner. The mirror of an equal relationship.",
    8: "The house of fusion: sexuality, shared power, unveiled secrets. It shows the depth of intimate connection and power struggles.",
    9: "This house reveals whether two people share a common life philosophy, appetite for exploration and intellectual growth.",
    10: "The 10th House in synastry shows the other's impact on career, social status and public ambitions.",
    11: "The house of true friendship and shared projects. It shows whether the relationship fits into a common vision for the future.",
    12: "The most mysterious house in synastry: it touches invisible, karmic bonds, what plays out behind the scenes."
};
const HOUSE_SIGNIF = isEN ? HOUSE_SIGNIF_EN : HOUSE_SIGNIF_FR;

// ---- 5. SUPERPOSITIONS EN MAISONS ----
function computeOverlay(planetsSource, housesTarget, sourceName, targetName) {
    const result = {};
    for (let h = 1; h <= 12; h++) result[h] = [];

    if (!Array.isArray(planetsSource) || !Array.isArray(housesTarget)) {
        return result;
    }

    for (const planet of planetsSource) {
        const name = getPlanetName(planet);
        if (["Ascendant", "Descendant", "MC", "Milieu du Ciel", "Imum Coeli"].includes(name)) continue;
        const deg = getPlanetDegree(planet);
        const sign = getPlanetSign(planet);
        const house = getHouseNumber(deg, housesTarget);
        const weight = PLANET_WEIGHT[name] || PLANET_WEIGHT.default;
        const isPlaneteClé = planetesClés.includes(name);
        const tier = getPlanetTier(name);
        const dignity = getDignity(name, sign);
        const retro = getPlanetRetro(planet);

        result[house].push({
            planete: name,
            degre: Math.round(deg * 100) / 100,
            signe: sign,
            retrograde: retro,
            poids: weight,
            planete_cle_typo: isPlaneteClé,
            tier: tier,
            dignite: dignity,
            source: sourceName,
            cible: targetName
        });
    }
    for (let h = 1; h <= 12; h++) {
        result[h].sort((a, b) => a.tier - b.tier || b.poids - a.poids);
    }
    return result;
}

const overlayBinA = computeOverlay(natalPlanetsB, natalHousesA, persoStrB, persoStrA);
const overlayAinB = computeOverlay(natalPlanetsA, natalHousesB, persoStrA, persoStrB);

// ---- 6. INTER-ASPECTS ----
function computeInterAspects(planetsFrom, planetsTo, nameFrom, nameTo, aspectDefs, housesFrom, housesTo, isDayChartFrom, isDayChartTo) {
    const aspects = [];
    if (!Array.isArray(planetsFrom) || !Array.isArray(planetsTo)) return aspects;
    const ASPECTS_USE = aspectDefs || ASPECTS_DEF;
    for (const pFrom of planetsFrom) {
        const nFrom = getPlanetName(pFrom);
        const degFrom = getPlanetDegree(pFrom);

        for (const pTo of planetsTo) {
            const nTo = getPlanetName(pTo);
            const degTo = getPlanetDegree(pTo);
            const diff = absAngularDiff(degFrom, degTo);

            const orbA = ORBS_SYNASTRY[nFrom] || ORBS_SYNASTRY.default;
            const orbB = ORBS_SYNASTRY[nTo] || ORBS_SYNASTRY.default;
            const hasLuminary = _LUMINAIRE_NAMES.has(nFrom) || _LUMINAIRE_NAMES.has(nTo);
            const orbBase = hasLuminary ? Math.max(orbA, orbB) : (orbA + orbB) / 2;

            for (const asp of ASPECTS_USE) {
                const orbMax = asp.minor ? Math.min(orbBase * 0.5, 2) : orbBase;
                const ecart = Math.abs(diff - asp.angle);
                if (ecart <= orbMax) {
                    const wFrom = PLANET_WEIGHT[nFrom] || PLANET_WEIGHT.default;
                    const wTo = PLANET_WEIGHT[nTo] || PLANET_WEIGHT.default;
                    const score = Math.round(((wFrom + wTo) / 2) * asp.mult * (1 - ecart / orbMax) * 10) / 10;

                    const signFrom = getPlanetSign(pFrom);
                    const signTo = getPlanetSign(pTo);
                    const tierFrom = getPlanetTier(nFrom);
                    const tierTo = getPlanetTier(nTo);
                    const tierMax = Math.max(tierFrom, tierTo);

                    const degInSignFrom = (degFrom % 30 + 30) % 30;
                    const degInSignTo = (degTo % 30 + 30) % 30;
                    const digFullFrom = getDignityFull(nFrom, signFrom, degInSignFrom, isDayChartFrom !== undefined ? isDayChartFrom : isDayChartA);
                    const digFullTo = getDignityFull(nTo, signTo, degInSignTo, isDayChartTo !== undefined ? isDayChartTo : isDayChartB);

                    const formatDignity = (dFull) => {
                        if (!dFull) return null;
                        const parts = [];
                        if (dFull.primary) parts.push(dFull.primary);
                        if (dFull.triplicite) parts.push("Tripl.");
                        if (dFull.terme) parts.push("Terme");
                        if (dFull.face) parts.push("Face");
                        if (parts.length === 0) return dFull.peregrine ? "Pérégrine" : null;
                        return parts.join("+");
                    };

                    aspects.push({
                        planete_source: nFrom,
                        signe_source: signFrom,
                        retro_source: getPlanetRetro(pFrom),
                        dignite_source: formatDignity(digFullFrom),
                        dignite_full_source: digFullFrom,
                        tier_source: tierFrom,
                        degre_source: Math.round(degFrom * 100) / 100,
                        maison_source: housesFrom ? getHouseNumber(degFrom, housesFrom) : null,
                        planete_cible: nTo,
                        signe_cible: signTo,
                        retro_cible: getPlanetRetro(pTo),
                        dignite_cible: formatDignity(digFullTo),
                        dignite_full_cible: digFullTo,
                        tier_cible: tierTo,
                        degre_cible: Math.round(degTo * 100) / 100,
                        maison_cible: housesTo ? getHouseNumber(degTo, housesTo) : null,
                        tier_max: tierMax,
                        aspect: asp.name,
                        symbol: asp.symbol,
                        nature: asp.nature,
                        orbe: Math.round(ecart * 100) / 100,
                        exact: ecart < 1,
                        score: score,
                        source_personne: nameFrom,
                        cible_personne: nameTo,
                        planete_cle_source: planetesClés.includes(nFrom),
                        planete_cle_cible: planetesClés.includes(nTo)
                    });
                }
            }
        }
    }
    aspects.sort((a, b) => b.score - a.score);
    return aspects;
}

const interAspectsBtoA = computeInterAspects(natalPlanetsB, natalPlanetsA, persoStrB, persoStrA, undefined, natalHousesB, natalHousesA, isDayChartB, isDayChartA);
const interAspectsAtoB = computeInterAspects(natalPlanetsA, natalPlanetsB, persoStrA, persoStrB, undefined, natalHousesA, natalHousesB, isDayChartA, isDayChartB);

// v6.4.0 — Q16 astrologue : marquer les aspects génération-générationnels
// (Pluton/Neptune/Uranus mutuels) comme bruit de fond si écart d'âge < 12 ans.
// Le flag _generational_noise est lu par computeAspectScoreHI pour neutraliser
// la contribution au scoring. L'aspect reste visible dans le narratif comme
// « contexte générationnel partagé ».
const _OUTER_PLANETS = new Set(["Pluton", "Neptune", "Uranus"]);
function tagGenerationalNoise(aspects, ageGap) {
    if (typeof ageGap !== "number" || ageGap >= 12) return aspects;
    return aspects.map(a => {
        const sp = a.planete_source || a.from || a.source;
        const tp = a.planete_cible || a.to || a.cible;
        if (_OUTER_PLANETS.has(sp) && _OUTER_PLANETS.has(tp)) {
            return { ...a, _generational_noise: true };
        }
        return a;
    });
}
const _ageGap = (typeof ageA === "number" && typeof ageB === "number") ? Math.abs(ageA - ageB) : null;
if (_ageGap !== null && _ageGap < 12) {
    // Mutate in place : on garde les références mais on tague
    for (let i = 0; i < interAspectsBtoA.length; i++) {
        const a = interAspectsBtoA[i];
        const sp = a.planete_source || a.from || a.source;
        const tp = a.planete_cible || a.to || a.cible;
        if (_OUTER_PLANETS.has(sp) && _OUTER_PLANETS.has(tp)) a._generational_noise = true;
    }
    for (let i = 0; i < interAspectsAtoB.length; i++) {
        const a = interAspectsAtoB[i];
        const sp = a.planete_source || a.from || a.source;
        const tp = a.planete_cible || a.to || a.cible;
        if (_OUTER_PLANETS.has(sp) && _OUTER_PLANETS.has(tp)) a._generational_noise = true;
    }
}

// ---- 7. CONTACTS NODAUX ----
function extractNode(planets, nodeName) {
    return planets.find(p => {
        const n = getPlanetName(p);
        if (nodeName === "Nœud Nord") return n === "Nœud Nord" || n === "North Node";
        if (nodeName === "Nœud Sud") return n === "Nœud Sud" || n === "South Node";
        return false;
    });
}

function computeNodalContacts(nodesOwner, planetsOther, ownerName, otherName, housesOwner, housesOther) {
    const contacts = [];
    if (!Array.isArray(nodesOwner) || !Array.isArray(planetsOther)) return contacts;
    const nodeN = extractNode(nodesOwner, "Nœud Nord");
    const nodeS = extractNode(nodesOwner, "Nœud Sud");

    const ASP_ANGLE_N = {"Conjonction":0,"Sextile":60,"Carré":90,"Trigone":120,"Quinconce":150,"Opposition":180};

    for (const node of [nodeN, nodeS].filter(Boolean)) {
        const nodeName = getPlanetName(node);
        const nodeDeg = getPlanetDegree(node);

        for (const planet of planetsOther) {
            const pName = getPlanetName(planet);
            const pDeg = getPlanetDegree(planet);
            const diff = absAngularDiff(nodeDeg, pDeg);
            const pSpeed = getPlanetSpeed(planet);

            for (const asp of ASPECTS_DEF) {
                const orb = asp.name === "Conjonction" ? 6 : asp.name === "Opposition" ? 5 : asp.name === "Carré" ? 5 : asp.name === "Trigone" ? 4 : asp.name === "Sextile" ? 3 : 2;
                const ecart = Math.abs(diff - asp.angle);
                if (ecart <= orb) {
                    let applyingVal = null;
                    if (pSpeed !== null) {
                        const curOrb = Math.abs(absAngularDiff(pDeg, nodeDeg) - (ASP_ANGLE_N[asp.name] || 0));
                        const futOrb = Math.abs(absAngularDiff(pDeg + pSpeed, nodeDeg) - (ASP_ANGLE_N[asp.name] || 0));
                        applyingVal = futOrb < curOrb;
                    }
                    contacts.push({
                        noeud: nodeName,
                        noeud_personne: ownerName,
                        planete: pName,
                        planete_personne: otherName,
                        aspect: asp.name,
                        orbe: Math.round(ecart * 100) / 100,
                        exact: ecart < 1,
                        karmique: ["Conjonction", "Opposition", "Carré"].includes(asp.name),
                        is_chiron: false,
                        applying: applyingVal,
                        maison_aspect: housesOther ? getHouseNumber(pDeg, housesOther) : null,
                        dignite_planete: getDignity(pName, getPlanetSign(planet)),
                        score: Math.round((asp.name === "Conjonction" ? 15 : asp.name === "Opposition" ? 12 : asp.name === "Carré" ? 10 : 6) * (1 - ecart / orb) * 10) / 10
                    });
                }
            }
        }
    }

    const chiron = planetsOther.find(p => getPlanetName(p) === "Chiron");
    if (chiron) {
        const chironDeg = getPlanetDegree(chiron);
        const chironSpeed = getPlanetSpeed(chiron);
        for (const planet of nodesOwner) {
            const pName = getPlanetName(planet);
            if (!PLANETS_MAJEURS.includes(pName)) continue;
            const pDeg = getPlanetDegree(planet);
            const diff = absAngularDiff(chironDeg, pDeg);
            for (const asp of ASPECTS_DEF) {
                const chironOrb = asp.name === "Conjonction" ? 5 : 3;
                const ecart = Math.abs(diff - asp.angle);
                if (ecart <= chironOrb) {
                    const baseScore = asp.name === "Conjonction" ? 10 : asp.name === "Opposition" ? 8 : asp.name === "Carré" ? 7 : asp.name === "Trigone" ? 5 : 4;
                    let applyingVal = null;
                    if (chironSpeed !== null) {
                        const curOrb = Math.abs(absAngularDiff(chironDeg, pDeg) - (ASP_ANGLE_N[asp.name] || 0));
                        const futOrb = Math.abs(absAngularDiff(chironDeg + chironSpeed, pDeg) - (ASP_ANGLE_N[asp.name] || 0));
                        applyingVal = futOrb < curOrb;
                    }
                    contacts.push({
                        noeud: "Chiron",
                        noeud_personne: otherName,
                        planete: pName,
                        planete_personne: ownerName,
                        aspect: asp.name,
                        orbe: Math.round(ecart * 100) / 100,
                        exact: ecart < 1,
                        karmique: ["Conjonction", "Opposition", "Carré"].includes(asp.name),
                        is_chiron: true,
                        applying: applyingVal,
                        maison_aspect: housesOwner ? getHouseNumber(pDeg, housesOwner) : null,
                        dignite_planete: getDignity(pName, getPlanetSign(planet)),
                        score: Math.round(baseScore * (1 - ecart / chironOrb) * 10) / 10
                    });
                }
            }
        }
    }

    contacts.sort((a, b) => {
        if (a.noeud === "Nœud Nord" && b.noeud === "Nœud Sud") return -1;
        if (a.noeud === "Nœud Sud" && b.noeud === "Nœud Nord") return 1;
        return b.score - a.score;
    });
    const seenSquares = new Set();
    const deduped = contacts.filter(nc => {
        if (nc.aspect !== "Carré") return true;
        const key = `${nc.planete}|${nc.planete_personne}|Carré`;
        if (seenSquares.has(key)) return false;
        seenSquares.add(key);
        return true;
    });
    deduped.sort((a, b) => b.score - a.score);
    return deduped;
}

const nodalContactsA = computeNodalContacts(natalPlanetsA, natalPlanetsB, persoStrA, persoStrB, natalHousesA, natalHousesB);
const nodalContactsB = computeNodalContacts(natalPlanetsB, natalPlanetsA, persoStrB, persoStrA, natalHousesB, natalHousesA);

// ---- 8. THÈME COMPOSITE (mi-points) ----
function buildCompositeChart(planetsA, planetsB, housesA, housesB) {
    const composite = { planetes: [], maisons: [], aspects: [] };
    if (!Array.isArray(planetsA) || !Array.isArray(planetsB)) return composite;
    const mapA = {};
    const mapB = {};

    for (const p of planetsA) mapA[getPlanetName(p)] = getPlanetDegree(p);
    for (const p of planetsB) mapB[getPlanetName(p)] = getPlanetDegree(p);

    for (const name of PLANETS_ALL) {
        if (mapA[name] !== undefined && mapB[name] !== undefined) {
            const mid = midpoint(mapA[name], mapB[name]);
            composite.planetes.push({
                planete: name,
                degre: Math.round(mid * 100) / 100,
                signe: signFromDegree(mid),
                normDegre: normDegFromDegree(mid)
            });
        }
    }

    for (let h = 1; h <= 12; h++) {
        const cuspA = getCuspDegree(h, housesA);
        const cuspB = getCuspDegree(h, housesB);
        const mid = midpoint(cuspA, cuspB);
        composite.maisons.push({
            maison: h,
            cuspide: Math.round(mid * 100) / 100,
            signe: signFromDegree(mid)
        });
    }

    if (composite.maisons.length === 12) {
        composite.planetes.forEach(p => {
            p.maison_composite = getHouseNumber(p.degre, composite.maisons);
            p.dignite = getDignity(p.planete, p.signe);
        });
    }

    const compASC = composite.planetes.find(p => p.planete === "Ascendant");
    const compLune = composite.planetes.find(p => p.planete === "Lune");
    const compSoleil = composite.planetes.find(p => p.planete === "Soleil");
    if (compASC && compLune && compSoleil) {
        const sunDeg = compSoleil.degre;
        const ascDeg = compASC.degre;
        const isDayChart = (() => {
            let d = ((sunDeg - ascDeg) % 360 + 360) % 360;
            return d < 180;
        })();
        const pfDeg = isDayChart
            ? ((compASC.degre + compLune.degre - compSoleil.degre) % 360 + 360) % 360
            : ((compASC.degre + compSoleil.degre - compLune.degre) % 360 + 360) % 360;
        composite.part_de_fortune = {
            degre: Math.round(pfDeg * 100) / 100,
            signe: signFromDegree(pfDeg),
            maison: composite.maisons.length === 12 ? getHouseNumber(pfDeg, composite.maisons) : null
        };
    }

    const compositeAspects = [];
    const cp = composite.planetes;
    for (let i = 0; i < cp.length; i++) {
        for (let j = i + 1; j < cp.length; j++) {
            const diff = absAngularDiff(cp[i].degre, cp[j].degre);
            for (const asp of ASPECTS_DEF) {
                const isLum = _LUMINAIRE_NAMES.has(cp[i].planete) || _LUMINAIRE_NAMES.has(cp[j].planete);
                const orb = asp.name === "Conjonction" ? (isLum ? 8 : 6) : asp.name === "Opposition" ? (isLum ? 7 : 5) : asp.name === "Carré" ? 5 : asp.name === "Trigone" ? 5 : asp.name === "Sextile" ? 4 : 3;
                const ecart = Math.abs(diff - asp.angle);
                if (ecart <= orb) {
                    compositeAspects.push({
                        planete_1: cp[i].planete,
                        planete_2: cp[j].planete,
                        aspect: asp.name,
                        symbol: asp.symbol,
                        nature: asp.nature,
                        orbe: Math.round(ecart * 100) / 100
                    });
                }
            }
        }
    }
    composite.aspects = compositeAspects;

    const compDeclinations = { parallels: [], contra_parallels: [] };
    const declMapA = {}, declMapB = {};
    for (const p of planetsA) { const n = getPlanetName(p); const d = getPlanetDeclination(p); if (d !== null) declMapA[n] = d; }
    for (const p of planetsB) { const n = getPlanetName(p); const d = getPlanetDeclination(p); if (d !== null) declMapB[n] = d; }
    for (const cp1 of composite.planetes) {
        const dA = declMapA[cp1.planete], dB = declMapB[cp1.planete];
        if (dA !== undefined && dB !== undefined) {
            cp1.declination_composite = Math.round(((dA + dB) / 2) * 10000) / 10000;
        }
    }
    for (let i = 0; i < composite.planetes.length; i++) {
        for (let j = i + 1; j < composite.planetes.length; j++) {
            const d1 = composite.planetes[i].declination_composite, d2 = composite.planetes[j].declination_composite;
            if (d1 === undefined || d2 === undefined) continue;
            const same = Math.sign(d1) === Math.sign(d2);
            if (same) {
                const diff = Math.abs(d1 - d2);
                if (diff <= 1.5) compDeclinations.parallels.push({ p1: composite.planetes[i].planete, p2: composite.planetes[j].planete, decl1: d1, decl2: d2, orbe: +diff.toFixed(2) });
            } else {
                const diff = Math.abs(Math.abs(d1) - Math.abs(d2));
                if (diff <= 1.5) compDeclinations.contra_parallels.push({ p1: composite.planetes[i].planete, p2: composite.planetes[j].planete, decl1: d1, decl2: d2, orbe: +diff.toFixed(2) });
            }
        }
    }
    composite.declinations = compDeclinations;

    return composite;
}

const compositeChart = buildCompositeChart(natalPlanetsA, natalPlanetsB, natalHousesA, natalHousesB);

// ---- 8a-bis. ANTISCIA DANS LE COMPOSITE ----
function computeCompositeAntiscia(compositePlanets) {
    const results = [];
    if (!Array.isArray(compositePlanets) || compositePlanets.length < 2) return results;
    const eligible = compositePlanets.filter(p => ANTISCIA_PLANETS.includes(p.planete));
    for (let i = 0; i < eligible.length; i++) {
        const pA = eligible[i];
        const degA = pA.degre;
        const antisciaDeg = (180 - degA + 360) % 360;
        const contraAntisciaDeg = (360 - degA) % 360;
        for (let j = i + 1; j < eligible.length; j++) {
            const pB = eligible[j];
            const degB = pB.degre;
            const diffAnti = absAngularDiff(antisciaDeg, degB);
            const diffContra = absAngularDiff(contraAntisciaDeg, degB);
            if (diffAnti <= ANTISCIA_ORB) {
                results.push({
                    p1: pA.planete, p2: pB.planete,
                    type: "Antiscia", orbe: +diffAnti.toFixed(2),
                    degre_miroir: +antisciaDeg.toFixed(2), signe_miroir: signFromDegree(antisciaDeg)
                });
            }
            if (diffContra <= ANTISCIA_ORB) {
                results.push({
                    p1: pA.planete, p2: pB.planete,
                    type: "Contra-antiscia", orbe: +diffContra.toFixed(2),
                    degre_miroir: +contraAntisciaDeg.toFixed(2), signe_miroir: signFromDegree(contraAntisciaDeg)
                });
            }
        }
    }
    results.sort((a, b) => a.orbe - b.orbe);
    return results;
}
const compositeAntiscia = computeCompositeAntiscia(compositeChart.planetes || []);

// ---- 8b. RÉCEPTIONS MUTUELLES CROISÉES (domicile + exaltation + mixte) ----
function findCrossMutualReceptions(planetsA, planetsB) {
    const receptions = [];
    const eligible = ["Soleil","Lune","Mercure","Vénus","Mars","Jupiter","Saturne","Uranus","Neptune","Pluton"];
    const seen = new Set();

    const domSystems = [
        { rulers: SIGN_RULERS, label: "moderne" },
        { rulers: SIGN_TRADITIONAL_RULERS, label: "traditionnelle" }
    ];
    const exaSystems = [
        { exalt: SIGN_EXALTATIONS, label: "moderne" },
        { exalt: SIGN_TRADITIONAL_EXALTATIONS, label: "traditionnelle" }
    ];

    const RECEPTION_STRENGTH = { "dom": 10, "exa": 7, "mix": 5 };
    const addReception = (nA, sA, nB, sB, type, maitrise, desc) => {
        const pairKey = [nA, nB].sort().join("|") + "|" + type;
        if (seen.has(pairKey)) return;
        const category = type.startsWith("RM domicile") ? "dom" : type.startsWith("RM exaltation") ? "exa" : "mix";
        const broadKey = [nA, nB].sort().join("|") + "|" + category;
        if (seen.has(broadKey)) return;
        seen.add(pairKey);
        seen.add(broadKey);
        receptions.push({ planete_a: nA, signe_a: sA, planete_b: nB, signe_b: sB, maitrise, type, description: desc,
            score: RECEPTION_STRENGTH[category] || 5,
            category: category === "dom" ? "domicile" : category === "exa" ? "exaltation" : "mixte"
        });
    };

    for (const sys of domSystems) {
        for (const pA of planetsA) {
            const nA = getPlanetName(pA);
            if (!eligible.includes(nA)) continue;
            const sA = getPlanetSign(pA);
            const rulerA = sys.rulers[sA];
            if (!rulerA) continue;
            for (const pB of planetsB) {
                const nB = getPlanetName(pB);
                if (!eligible.includes(nB)) continue;
                if (nA === nB) continue;
                const sB = getPlanetSign(pB);
                const rulerB = sys.rulers[sB];
                if (nA === rulerB && nB === rulerA) {
                    addReception(nA, sA, nB, sB, `RM domicile (${sys.label})`, sys.label,
                        `${nA} (${persoStrA}) en ${sA} [dom. ${sys.label} ${rulerA}=${nB}] ↔ ${nB} (${persoStrB}) en ${sB} [dom. ${sys.label} ${rulerB}=${nA}]`);
                }
            }
        }
    }

    for (const sys of exaSystems) {
        for (const pA of planetsA) {
            const nA = getPlanetName(pA);
            if (!eligible.includes(nA)) continue;
            const sA = getPlanetSign(pA);
            const exaltA = sys.exalt[sA];
            if (!exaltA) continue;
            for (const pB of planetsB) {
                const nB = getPlanetName(pB);
                if (!eligible.includes(nB)) continue;
                if (nA === nB) continue;
                const sB = getPlanetSign(pB);
                const exaltB = sys.exalt[sB];
                if (nA === exaltB && nB === exaltA) {
                    addReception(nA, sA, nB, sB, `RM exaltation`, sys.label,
                        `${nA} (${persoStrA}) en ${sA} [exalt. ${exaltA}=${nB}] ↔ ${nB} (${persoStrB}) en ${sB} [exalt. ${exaltB}=${nA}]`);
                }
            }
        }
    }

    for (const domSys of domSystems) {
        for (const exaSys of exaSystems) {
            for (const pA of planetsA) {
                const nA = getPlanetName(pA);
                if (!eligible.includes(nA)) continue;
                const sA = getPlanetSign(pA);
                const rulerA = domSys.rulers[sA];
                for (const pB of planetsB) {
                    const nB = getPlanetName(pB);
                    if (!eligible.includes(nB)) continue;
                    if (nA === nB) continue;
                    const sB = getPlanetSign(pB);
                    const exaltB = exaSys.exalt[sB];
                    if (rulerA && exaltB && nB === rulerA && nA === exaltB) {
                        addReception(nA, sA, nB, sB, `RM mixte (dom/exalt)`, `${domSys.label}/${exaSys.label}`,
                            `${nA} (${persoStrA}) en ${sA} [dom. ${rulerA}=${nB}] ↔ ${nB} (${persoStrB}) en ${sB} [exalt. ${exaltB}=${nA}]`);
                    }
                    const exaltA = exaSys.exalt[sA];
                    const rulerB = domSys.rulers[sB];
                    if (exaltA && rulerB && nB === exaltA && nA === rulerB) {
                        addReception(nA, sA, nB, sB, `RM mixte (exalt/dom)`, `${exaSys.label}/${domSys.label}`,
                            `${nA} (${persoStrA}) en ${sA} [exalt. ${exaltA}=${nB}] ↔ ${nB} (${persoStrB}) en ${sB} [dom. ${rulerB}=${nA}]`);
                    }
                }
            }
        }
    }

    return receptions;
}
const crossReceptions = findCrossMutualReceptions(natalPlanetsA, natalPlanetsB);

// ---- 8c. COMPATIBILITÉ ÉLÉMENTAIRE / MODALE ----
function computeElementCompatibility(statsA, statsB, planetsA, planetsB) {
    const elA = statsA.elements || {};
    const elB = statsB.elements || {};
    const moA = statsA.modes || {};
    const moB = statsB.modes || {};

    const ELEM_WEIGHT = { "Soleil": 2, "Lune": 2, "Ascendant": 1.5, "Milieu du Ciel": 1.5 };
    const SIGN_TO_ELEM = {"Bélier":"Feu","Taureau":"Terre","Gémeaux":"Air","Cancer":"Eau","Lion":"Feu","Vierge":"Terre","Balance":"Air","Scorpion":"Eau","Sagittaire":"Feu","Capricorne":"Terre","Verseau":"Air","Poissons":"Eau"};

    const ELEM_COUNTED = new Set([...PLANETS_MAJEURS, "Ascendant", "Milieu du Ciel"]);
    function computeWeightedElements(planets) {
        const weighted = { "Feu": 0, "Terre": 0, "Air": 0, "Eau": 0 };
        if (!Array.isArray(planets)) return weighted;
        for (const p of planets) {
            const name = getPlanetName(p);
            if (!ELEM_COUNTED.has(name)) continue;
            const sign = getPlanetSign(p);
            const el = SIGN_TO_ELEM[sign];
            if (el) weighted[el] += (ELEM_WEIGHT[name] || 1);
        }
        return weighted;
    }
    const wElA = computeWeightedElements(planetsA);
    const wElB = computeWeightedElements(planetsB);

    const elements = ["Feu", "Terre", "Air", "Eau"];
    const modes = ["Cardinal", "Fixe", "Mutable"];

    const elCompat = {};
    let elCommon = 0, elTension = 0;
    for (const el of elements) {
        const a = elA[el] || 0, b = elB[el] || 0;
        elCompat[el] = { a, b, total: a + b, weighted_a: Math.round(wElA[el] * 10) / 10, weighted_b: Math.round(wElB[el] * 10) / 10 };
        if (a >= 2 && b >= 2) elCommon++;
        if ((a >= 3 && b === 0) || (b >= 3 && a === 0)) elTension++;
    }

    const moCompat = {};
    let moCommon = 0;
    let moMirrorCount = 0;
    for (const mo of modes) {
        const a = moA[mo] || 0, b = moB[mo] || 0;
        moCompat[mo] = { a, b, total: a + b };
        if (a >= 2 && b >= 2) moCommon++;
        if (Math.abs(a - b) <= 1) moMirrorCount++;
    }

    const dominantElA = elements.reduce((best, el) => (wElA[el] || 0) > (wElA[best] || 0) ? el : best, elements[0]);
    const dominantElB = elements.reduce((best, el) => (wElB[el] || 0) > (wElB[best] || 0) ? el : best, elements[0]);

    const COMPAT_ELEMENTS = {
        "Feu":   { harmonie: ["Feu", "Air"], tension: ["Eau"] },
        "Terre": { harmonie: ["Terre", "Eau"], tension: ["Air"] },
        "Air":   { harmonie: ["Air", "Feu"], tension: ["Terre"] },
        "Eau":   { harmonie: ["Eau", "Terre"], tension: ["Feu"] }
    };

    const elRelation = COMPAT_ELEMENTS[dominantElA]?.harmonie?.includes(dominantElB) ? "harmonie"
        : COMPAT_ELEMENTS[dominantElA]?.tension?.includes(dominantElB) ? "tension" : "neutre";

    return {
        elements: elCompat,
        modes: moCompat,
        dominant_a: dominantElA,
        dominant_b: dominantElB,
        element_relation: elRelation,
        elements_communs: elCommon,
        elements_tension: elTension,
        modes_communs: moCommon,
        modes_mirror: moMirrorCount,
        summary_fr: `${persoStrA} dominante ${dominantElA} — ${persoStrB} dominante ${dominantElB} → ${elRelation === "harmonie" ? "Affinité élémentaire naturelle" : elRelation === "tension" ? "Tension élémentaire (complémentarité ou friction)" : "Relation élémentaire neutre"}`
    };
}
const elementCompat = computeElementCompatibility(statsA, statsB, natalPlanetsA, natalPlanetsB);

// ---- 8c-bis. PROFECTIONS ANNUELLES ----
function computeAnnualProfections(personA, personB, refDate, housesA, housesB) {
    function parseDDMMYYYY(str) {
        if (!str) return null;
        const parts = str.split("/");
        if (parts.length !== 3) return null;
        return new Date(+parts[2], +parts[1] - 1, +parts[0]);
    }
    const ref = refDate ? new Date(refDate) : new Date();
    const bdA = parseDDMMYYYY(personA.date);
    const bdB = parseDDMMYYYY(personB.date);

    function profectionFor(bd, houses) {
        if (!bd || isNaN(bd.getTime())) return null;
        let age = ref.getFullYear() - bd.getFullYear();
        const hadBirthday = (ref.getMonth() > bd.getMonth()) ||
            (ref.getMonth() === bd.getMonth() && ref.getDate() >= bd.getDate());
        if (!hadBirthday) age--;
        if (age < 0) age = 0;
        const houseActivated = (age % 12) + 1;
        const cuspDeg = getCuspDegree(houseActivated, houses);
        const signActivated = signFromDegree(cuspDeg);
        const ruler = SIGN_RULERS[signActivated] || null;
        return { age, house_activated: houseActivated, sign_activated: signActivated, ruler };
    }

    const profA = profectionFor(bdA, housesA);
    const profB = profectionFor(bdB, housesB);

    let overlap = "";
    if (profA && profB) {
        if (profA.sign_activated === profB.sign_activated) {
            overlap = `Les deux profections activent le même signe (${profA.sign_activated}) — résonance annuelle forte`;
        } else if (profA.ruler === profB.ruler) {
            overlap = `Les profections partagent le même maître (${profA.ruler}) — lien thématique indirect cette année`;
        } else {
            const SIGN_TO_ELEM_P = {"Bélier":"Feu","Taureau":"Terre","Gémeaux":"Air","Cancer":"Eau","Lion":"Feu","Vierge":"Terre","Balance":"Air","Scorpion":"Eau","Sagittaire":"Feu","Capricorne":"Terre","Verseau":"Air","Poissons":"Eau"};
            const elA = SIGN_TO_ELEM_P[profA.sign_activated];
            const elB = SIGN_TO_ELEM_P[profB.sign_activated];
            if (elA === elB) {
                overlap = `Profections dans le même élément (${elA}) — affinité annuelle par tempérament`;
            } else {
                overlap = `Profections dans des signes différents (${profA.sign_activated} / ${profB.sign_activated}) — thèmes annuels distincts`;
            }
        }
    }

    return {
        profection_a: profA,
        profection_b: profB,
        reference_date: ref.toISOString().slice(0, 10),
        synastry_overlap: overlap
    };
}
const profections = computeAnnualProfections(personneA, personneB, dateRelation, natalHousesA, natalHousesB);

// ---- 8c-ter. COMPATIBILITÉ DES TERMES LUNAIRES ----
function computeMoonTermsCompatibility(planetsA, planetsB) {
    const moonA = planetsA.find(p => getPlanetName(p) === "Lune");
    const moonB = planetsB.find(p => getPlanetName(p) === "Lune");
    if (!moonA || !moonB) return { moon_term_a: null, moon_term_b: null, same_term_ruler: false, compatibility_note: "Données lunaires manquantes" };

    const signA = getPlanetSign(moonA);
    const signB = getPlanetSign(moonB);
    const degA = ((getPlanetDegree(moonA) % 30) + 30) % 30;
    const degB = ((getPlanetDegree(moonB) % 30) + 30) % 30;
    const termA = getTermRuler(signA, degA);
    const termB = getTermRuler(signB, degB);

    const sameRuler = !!(termA && termB && termA === termB);
    const digA_ruler = termA ? DIGNITIES[termA] : null;
    const digB_ruler = termB ? DIGNITIES[termB] : null;
    const mutualReception = !!(termA && termB && termA !== termB &&
        digA_ruler && digB_ruler &&
        digA_ruler.dom.includes(signB) && digB_ruler.dom.includes(signA));

    let note;
    if (sameRuler) {
        note = `Les Lunes partagent le même maître de terme (${termA}) — une affinité émotionnelle profonde et inconsciente`;
    } else if (mutualReception) {
        note = `Les maîtres de terme lunaires (${termA} / ${termB}) sont en réception mutuelle — un échange émotionnel subtil et complémentaire`;
    } else {
        note = "Les Lunes sont dans des termes différents — des besoins émotionnels qui s'expriment différemment";
    }

    return {
        moon_term_a: { sign: signA, degree: Math.round(degA * 100) / 100, term_ruler: termA },
        moon_term_b: { sign: signB, degree: Math.round(degB * 100) / 100, term_ruler: termB },
        same_term_ruler: sameRuler,
        mutual_reception: mutualReception,
        compatibility_note: note
    };
}
const moonTerms = computeMoonTermsCompatibility(natalPlanetsA, natalPlanetsB);

// ---- 8d. RÉSUMÉ NATAL (contexte pour les prompts LLM) ----
function buildNatalSummary(planets, houses, stats, name) {
    const soleil = planets.find(p => getPlanetName(p) === "Soleil");
    const lune = planets.find(p => getPlanetName(p) === "Lune");
    const asc = planets.find(p => getPlanetName(p) === "Ascendant");
    const mc = planets.find(p => ["MC", "Milieu du Ciel"].includes(getPlanetName(p)));

    const signeSoleil = soleil ? getPlanetSign(soleil) : "?";
    const signeLune = lune ? getPlanetSign(lune) : "?";
    const signeAsc = asc ? getPlanetSign(asc) : "?";
    const signeMC = mc ? getPlanetSign(mc) : "?";

    const chartRuler = stats.chart_ruler || SIGN_RULERS[signeAsc] || "?";
    const sect = stats.sect || "?";
    const dominant = stats.planete_dominante || "?";
    const almutem = stats.almutem_figuris || "?";

    const elStr = stats.elements ? Object.entries(stats.elements).map(([k,v]) => `${k}:${v}`).join(" ") : "?";
    const moStr = stats.modes ? Object.entries(stats.modes).map(([k,v]) => `${k}:${v}`).join(" ") : "?";

    return `${name} : Soleil ${signeSoleil}, Lune ${signeLune}, ASC ${signeAsc}, MC ${signeMC} | `
        + `Maître de thème: ${chartRuler} | Dominante: ${dominant} | Almutem: ${almutem} | `
        + `${sect} | Éléments: ${elStr} | Modes: ${moStr}`;
}

const natalSummaryA = buildNatalSummary(natalPlanetsA, natalHousesA, statsA, persoStrA);
const natalSummaryB = buildNatalSummary(natalPlanetsB, natalHousesB, statsB, persoStrB);

// ====== v6.1.0 — ÉTAPE 1 (SOCLE INDIVIDUEL) — Blocages natals ===============
// Évalue si Saturne ou Pluton sont « affligés » dans le thème individuel
// (carrés/oppositions à au moins 2 planètes personnelles : Soleil, Lune,
// Mercure, Vénus, Mars). Un Saturne afflige natal projette des peurs
// d'engagement et de rejet sur le partenaire. Un Pluton affligé projette
// des peurs de domination, de trahison ou de fusion toxique.
//
// Ces drapeaux sont exposés au narratif Gemini pour qu'il interprète
// correctement les frictions synastriques (ne pas tout attribuer au couple
// alors qu'une partie vient des verrous individuels préexistants).
function assessNatalBlocks(planets, aspects, name) {
    const PERSONAL = new Set(["Soleil", "Lune", "Mercure", "Vénus", "Mars"]);
    const HARD = new Set(["Carré", "Opposition"]);

    const evaluatePlanet = (planetName) => {
        const hardContacts = (aspects || []).filter(a => {
            const p1 = a.planete_1 || a.from || a.planete_source;
            const p2 = a.planete_2 || a.to || a.planete_cible;
            const aspName = a.aspect || a.name;
            if (!HARD.has(aspName)) return false;
            const involvesTarget = (p1 === planetName) || (p2 === planetName);
            if (!involvesTarget) return false;
            const otherP = (p1 === planetName) ? p2 : p1;
            return PERSONAL.has(otherP);
        });
        const hardOnLuminary = hardContacts.some(a => {
            const p1 = a.planete_1 || a.from || a.planete_source;
            const p2 = a.planete_2 || a.to || a.planete_cible;
            return p1 === "Soleil" || p2 === "Soleil" || p1 === "Lune" || p2 === "Lune";
        });
        return {
            count_hard_to_personal: hardContacts.length,
            hard_on_luminary: hardOnLuminary,
            afflicted: hardContacts.length >= 2 || (hardContacts.length >= 1 && hardOnLuminary),
            contacts: hardContacts.map(a => ({
                with: (a.planete_1 === planetName ? a.planete_2 : a.planete_1),
                aspect: a.aspect || a.name,
                orbe: a.orbe
            }))
        };
    };

    const saturn = evaluatePlanet("Saturne");
    const pluto = evaluatePlanet("Pluton");

    const blocks = [];
    if (saturn.afflicted) blocks.push("saturn_afflicted");
    if (pluto.afflicted) blocks.push("pluto_afflicted");

    return {
        person: name,
        saturn,
        pluto,
        blocks,
        afflicted_count: blocks.length,
        // Note interne pour le narratif :
        projection_risk: saturn.afflicted && pluto.afflicted ? "high"
            : (saturn.afflicted || pluto.afflicted) ? "moderate" : "low"
    };
}

const natalBlocksA = assessNatalBlocks(natalPlanetsA, natalAspectsA, persoStrA);
const natalBlocksB = assessNatalBlocks(natalPlanetsB, natalAspectsB, persoStrB);

// v6.2.0 — Lecture combinée des blocages partagés (Q3 astrologue) :
// Quand Saturne ou Pluton est affligé chez les DEUX, l'effet est conditionné
// par l'inter-aspect entre eux. Saturne A ↔ Saturne B en trigone =
// compensatoire (résilience commune face à la blessure). En carré/opposition
// = additif (déclenchement mutuel des blessures).
//
// On ne peut évaluer ça qu'après le calcul des inter-aspects (ce qui se fait
// plus bas dans le flux). On déclare une fonction utilitaire ici, l'appel
// est différé après les inter-aspects.
function assessSharedNatalBlocks(blocksA, blocksB, interAspects) {
    const result = {
        both_saturn_afflicted: blocksA.saturn?.afflicted && blocksB.saturn?.afflicted,
        both_pluto_afflicted: blocksA.pluto?.afflicted && blocksB.pluto?.afflicted,
        saturn_dynamic: null,         // "compensatory" | "additive" | "neutral"
        pluto_dynamic: null,
        narrative_hint: null
    };
    if (!result.both_saturn_afflicted && !result.both_pluto_afflicted) return result;

    const aspectBetween = (p1, p2) => {
        return (interAspects || []).find(a => {
            const f = a.planete_source || a.from;
            const t = a.planete_cible || a.to;
            return (f === p1 && t === p2) || (f === p2 && t === p1);
        });
    };

    const SOFT = new Set(["Trigone", "Sextile"]);
    const HARD = new Set(["Carré", "Opposition"]);

    if (result.both_saturn_afflicted) {
        const satSat = aspectBetween("Saturne", "Saturne");
        const aspName = satSat?.name || satSat?.aspect;
        if (aspName && SOFT.has(aspName)) result.saturn_dynamic = "compensatory";
        else if (aspName && HARD.has(aspName)) result.saturn_dynamic = "additive";
        else if (aspName === "Conjonction") result.saturn_dynamic = "compensatory";
        else result.saturn_dynamic = "neutral";
    }
    if (result.both_pluto_afflicted) {
        const pluPlu = aspectBetween("Pluton", "Pluton");
        const aspName = pluPlu?.name || pluPlu?.aspect;
        // Pluton-Pluton à orbe < 8° en trigone/sextile = générationnel positif partagé
        if (aspName && SOFT.has(aspName)) result.pluto_dynamic = "compensatory";
        else if (aspName && HARD.has(aspName)) result.pluto_dynamic = "additive";
        else result.pluto_dynamic = "neutral";
    }

    // Texte indicatif pour le narratif Gemini
    const parts = [];
    if (result.saturn_dynamic === "compensatory") parts.push("Saturne ↔ Saturne harmonique : la blessure d'inadéquation devient une force de résilience partagée");
    if (result.saturn_dynamic === "additive") parts.push("Saturne ↔ Saturne dur : forte amplification mutuelle des peurs d'engagement et de rejet");
    if (result.pluto_dynamic === "compensatory") parts.push("Pluton ↔ Pluton harmonique : transformation profonde possible ensemble");
    if (result.pluto_dynamic === "additive") parts.push("Pluton ↔ Pluton dur : risque de déclenchement mutuel de schémas de domination/trahison");
    if (parts.length) result.narrative_hint = parts.join(" ; ");

    return result;
}

// ====== v6.1.0 — ÉTAPE 4 (LONGÉVITÉ) — Indice « Saturne ciment » + Nœuds ====
// Mesure spécifique du potentiel de durée de la relation, indépendamment de
// la fluidité immédiate. Saturne harmonique aux planètes personnelles de
// l'autre = loyauté, capacité à traverser les épreuves. Saturne en aspect
// dur sur Soleil/Lune/Vénus de l'autre = fardeau, rapport de domination.
// Les Nœuds Lunaires en contact direct avec planètes personnelles ajoutent
// une dimension évolutive (fonction karmique de la rencontre).
//
// Score [0..15] aligné sur l'échelle des piliers existants. Exposé au
// narratif Gemini pour qualifier la « colle » de la relation, complément
// indispensable du score d'Harmonie qui ne mesure que l'instantané.
function computeLongevityIndex(interAspects, interAspectsT2, persName) {
    const PERSONAL = new Set(["Soleil", "Lune", "Vénus", "Mars", "Mercure"]);
    const SOFT = new Set(["Trigone", "Sextile"]);
    const HARD = new Set(["Carré", "Opposition"]);
    const FUSION = "Conjonction";

    const all = [...(interAspects || []), ...(interAspectsT2 || [])];

    let saturn_glue = 0;       // Saturne A↔personnelles B en aspect harmonique
    let saturn_burden = 0;      // Saturne A↔personnelles B en aspect dur
    let saturn_saturn = 0;      // Saturne ↔ Saturne (durabilité partagée)
    let nodes_evolutive = 0;    // NN ↔ personnelles
    let nodes_repetitive = 0;   // NS ↔ personnelles (boucle karmique)

    const detail = [];

    for (const a of all) {
        const p1 = a.planete_source || a.from;
        const p2 = a.planete_cible || a.to;
        const asp = a.name || a.aspect;
        const orbe = typeof a.orbe === "number" ? a.orbe : 5;
        if (!p1 || !p2 || !asp) continue;

        const orbeMult = orbe <= 1 ? 1.5 : orbe <= 3 ? 1.2 : orbe <= 5 ? 1.0 : 0.7;

        // Saturne ↔ personnelles
        const saturnTouchesPersonal =
            (p1 === "Saturne" && PERSONAL.has(p2)) ||
            (p2 === "Saturne" && PERSONAL.has(p1));
        if (saturnTouchesPersonal) {
            const otherIsLuminary = (p1 === "Soleil" || p1 === "Lune" || p2 === "Soleil" || p2 === "Lune");
            const baseW = otherIsLuminary ? 1.4 : 1.0;
            if (SOFT.has(asp) || asp === FUSION) {
                const v = +(2.0 * baseW * orbeMult).toFixed(2);
                saturn_glue += v;
                detail.push({ kind: "saturn_glue", with: (p1 === "Saturne" ? p2 : p1), aspect: asp, orbe, contribution: +v });
            } else if (HARD.has(asp)) {
                const v = +(1.6 * baseW * orbeMult).toFixed(2);
                saturn_burden += v;
                detail.push({ kind: "saturn_burden", with: (p1 === "Saturne" ? p2 : p1), aspect: asp, orbe, contribution: -v });
            }
        }
        // Saturne ↔ Saturne (durabilité existentielle)
        if (p1 === "Saturne" && p2 === "Saturne") {
            if (SOFT.has(asp)) saturn_saturn += +(1.5 * orbeMult).toFixed(2);
            else if (asp === FUSION) saturn_saturn += +(1.0 * orbeMult).toFixed(2);
            else if (HARD.has(asp)) saturn_saturn -= +(1.0 * orbeMult).toFixed(2);
            detail.push({ kind: "saturn_saturn", aspect: asp, orbe });
        }
        // Nœuds ↔ personnelles
        const isNN = (p1 === "Nœud Nord" || p2 === "Nœud Nord");
        const isNS = (p1 === "Nœud Sud" || p2 === "Nœud Sud");
        const otherFromNode = isNN
            ? (p1 === "Nœud Nord" ? p2 : p1)
            : (isNS ? (p1 === "Nœud Sud" ? p2 : p1) : null);
        if ((isNN || isNS) && otherFromNode && PERSONAL.has(otherFromNode)) {
            const otherIsLuminary = (otherFromNode === "Soleil" || otherFromNode === "Lune");
            const baseW = otherIsLuminary ? 1.3 : 1.0;
            // Conjonction et trigone surtout, opposition plus mitigée
            const aspMult = (asp === FUSION) ? 1.5 : SOFT.has(asp) ? 1.0 : (asp === "Opposition") ? 0.6 : 0.4;
            if (isNN) {
                const v = +(1.2 * baseW * aspMult * orbeMult).toFixed(2);
                nodes_evolutive += v;
                detail.push({ kind: "node_evolutive", with: otherFromNode, aspect: asp, orbe, contribution: +v });
            } else if (isNS) {
                const v = +(0.9 * baseW * aspMult * orbeMult).toFixed(2);
                nodes_repetitive += v;
                detail.push({ kind: "node_repetitive", with: otherFromNode, aspect: asp, orbe, contribution: +v * 0.5 });
            }
        }
    }

    // Composition du score [0..15]
    // saturn_glue jusqu'à 8 pts, saturn_saturn 3, nodes_evolutive 3, nodes_repetitive 1
    // saturn_burden réduit jusqu'à -6 pts
    const glueCapped = Math.min(saturn_glue, 8);
    const burdenCapped = Math.min(saturn_burden, 6);
    const saturnSatCapped = Math.max(-2, Math.min(saturn_saturn, 3));
    const nnCapped = Math.min(nodes_evolutive, 3);
    const nsCapped = Math.min(nodes_repetitive, 1.5);

    const raw = glueCapped - burdenCapped + saturnSatCapped + nnCapped + nsCapped;
    const score = Math.max(0, Math.min(15, +raw.toFixed(1)));

    let qualitative = "fragile";
    if (score >= 11) qualitative = "très solide";
    else if (score >= 8) qualitative = "solide";
    else if (score >= 5) qualitative = "modérée";
    else if (score >= 3) qualitative = "fragile";
    else qualitative = "absente";

    return {
        score,
        qualitative,
        breakdown: {
            saturn_glue: +saturn_glue.toFixed(2),
            saturn_burden: +saturn_burden.toFixed(2),
            saturn_saturn: +saturn_saturn.toFixed(2),
            nodes_evolutive: +nodes_evolutive.toFixed(2),
            nodes_repetitive: +nodes_repetitive.toFixed(2)
        },
        detail
    };
}

// ---- 8e. MAÎTRISES DES MAISONS (qui maîtrise quoi) ----
function buildHouseRulerships(houses) {
    const rulerships = {};
    for (const h of houses) {
        if (h.segments) {
            const cuspSeg = h.segments.find(s => s.type === "Cuspide");
            if (cuspSeg && cuspSeg.signe) {
                const modernRuler = SIGN_RULERS[cuspSeg.signe] || "?";
                const tradRuler = SIGN_TRADITIONAL_RULERS[cuspSeg.signe] || modernRuler;
                rulerships[h.maison] = {
                    signe: cuspSeg.signe,
                    maitre: modernRuler,
                    maitre_traditionnel: tradRuler,
                    double_maitrise: modernRuler !== tradRuler
                };
            }
        }
    }
    return rulerships;
}
const houseRulersA = buildHouseRulerships(natalHousesA);
const houseRulersB = buildHouseRulerships(natalHousesB);

// ---- 8f. SÉPARATION DES INTER-ASPECTS PAR TIER ----
const interAspectsTier1BtoA = interAspectsBtoA.filter(a => a.tier_max <= 1);
const interAspectsTier2BtoA = interAspectsBtoA.filter(a => a.tier_max === 2);
const interAspectsTier1AtoB = interAspectsAtoB.filter(a => a.tier_max <= 1);
const interAspectsTier2AtoB = interAspectsAtoB.filter(a => a.tier_max === 2);

// ---- 8g. DÉCLINAISONS INTER-CARTES, OOB, PARALLÈLES, CONTRA-PARALLÈLES ----
function getPlanetDeclination(p) {
    return typeof p.declinaison === "number" ? p.declinaison : null;
}

function computeInterDeclinations(planetsA, planetsB, nameA, nameB) {
    const parallels = [], contraParallels = [], oobA = [], oobB = [];
    const declinedA = planetsA.filter(p => getPlanetDeclination(p) !== null);
    const declinedB = planetsB.filter(p => getPlanetDeclination(p) !== null);

    declinedA.forEach(p => {
        const decl = getPlanetDeclination(p);
        if (Math.abs(decl) > OOB_THRESHOLD) {
            oobA.push({ planete: getPlanetName(p), declinaison: decl, hemisphere: decl > 0 ? "Nord" : "Sud", depassement: +(Math.abs(decl) - OOB_THRESHOLD).toFixed(2), personne: nameA });
        }
    });
    declinedB.forEach(p => {
        const decl = getPlanetDeclination(p);
        if (Math.abs(decl) > OOB_THRESHOLD) {
            oobB.push({ planete: getPlanetName(p), declinaison: decl, hemisphere: decl > 0 ? "Nord" : "Sud", depassement: +(Math.abs(decl) - OOB_THRESHOLD).toFixed(2), personne: nameB });
        }
    });

    for (const pA of declinedA) {
        for (const pB of declinedB) {
            const nA = getPlanetName(pA), nB = getPlanetName(pB);
            const dA = getPlanetDeclination(pA), dB = getPlanetDeclination(pB);
            const hasLum = LUMINAIRES_DECL.has(nA) || LUMINAIRES_DECL.has(nB);
            const orb = hasLum ? DECL_ORB_LUMINAIRE : DECL_ORB_STANDARD;
            const sameHemi = Math.sign(dA) === Math.sign(dB);

            if (sameHemi) {
                const diff = Math.abs(dA - dB);
                if (diff <= orb) parallels.push({
                    p1: nA, decl1: dA, personne1: nameA,
                    p2: nB, decl2: dB, personne2: nameB,
                    orbe: +diff.toFixed(2), hemisphere: dA > 0 ? "Nord" : "Sud",
                    hasLuminaire: hasLum
                });
            } else {
                const diff = Math.abs(Math.abs(dA) - Math.abs(dB));
                if (diff <= orb) contraParallels.push({
                    p1: nA, decl1: dA, personne1: nameA,
                    p2: nB, decl2: dB, personne2: nameB,
                    orbe: +diff.toFixed(2),
                    hasLuminaire: hasLum
                });
            }
        }
    }
    const declPlanetesA = declinedA.map(p => ({ planete: getPlanetName(p), declinaison: getPlanetDeclination(p), personne: nameA }));
    const declPlanetesB = declinedB.map(p => ({ planete: getPlanetName(p), declinaison: getPlanetDeclination(p), personne: nameB }));
    return { parallels, contraParallels, oob: [...oobA, ...oobB], decl_planetes_a: declPlanetesA, decl_planetes_b: declPlanetesB };
}

const declData = computeInterDeclinations(natalPlanetsA, natalPlanetsB, persoStrA, persoStrB);

// ---- 8h. ANTISCIA INTER-CARTES ----
function computeInterAntiscia(planetsA, planetsB, nameA, nameB) {
    const results = [];
    const findP = (planets, name) => planets.find(p => getPlanetName(p) === name);

    for (const nA of ANTISCIA_PLANETS) {
        const pA = findP(planetsA, nA);
        if (!pA) continue;
        const degA = getPlanetDegree(pA);
        const antisciaDeg = (180 - degA + 360) % 360;
        const contraAntisciaDeg = (antisciaDeg + 180) % 360;

        for (const nB of ANTISCIA_PLANETS) {
            const pB = findP(planetsB, nB);
            if (!pB) continue;
            const degB = getPlanetDegree(pB);
            const diffA = absAngularDiff(antisciaDeg, degB);
            const diffC = absAngularDiff(contraAntisciaDeg, degB);

            if (diffA <= ANTISCIA_ORB) results.push({
                p1: nA, personne1: nameA, p2: nB, personne2: nameB,
                type: "Antiscia", orbe: +diffA.toFixed(2),
                degre_miroir: +antisciaDeg.toFixed(2), signe_miroir: signFromDegree(antisciaDeg)
            });
            if (diffC <= ANTISCIA_ORB) results.push({
                p1: nA, personne1: nameA, p2: nB, personne2: nameB,
                type: "Contra-antiscia", orbe: +diffC.toFixed(2),
                degre_miroir: +contraAntisciaDeg.toFixed(2), signe_miroir: signFromDegree(contraAntisciaDeg)
            });
        }
    }
    return results;
}

const antisciaAtoB = computeInterAntiscia(natalPlanetsA, natalPlanetsB, persoStrA, persoStrB);
const antisciaBtoA = computeInterAntiscia(natalPlanetsB, natalPlanetsA, persoStrB, persoStrA);
const allAntiscia = [...antisciaAtoB, ...antisciaBtoA].sort((a, b) => a.orbe - b.orbe);

// ---- 8h-bis. PONTS STELLAIRES (ÉTOILES FIXES INTER-CARTES) ----
function computeFixedStarBridges(etoilesA, etoilesB, nameA, nameB) {
    const bridges = [];
    if (!etoilesA.length || !etoilesB.length) return bridges;

    const starMapA = {};
    etoilesA.forEach(em => {
        if (!starMapA[em.etoile]) starMapA[em.etoile] = [];
        starMapA[em.etoile].push(em);
    });

    etoilesB.forEach(emB => {
        const matchesA = starMapA[emB.etoile];
        if (matchesA && matchesA.length > 0) {
            matchesA.forEach(emA => {
                bridges.push({
                    etoile: emB.etoile,
                    planete_a: emA.planete, personne_a: nameA, maison_a: emA.maison, orbe_a: emA.orb,
                    planete_b: emB.planete, personne_b: nameB, maison_b: emB.maison, orbe_b: emB.orb,
                    nature_etoile: emA.nature || emB.nature || "",
                    description: `${emA.planete} (${nameA}) et ${emB.planete} (${nameB}) liés par ${emB.etoile} — résonance stellaire profonde`
                });
            });
        }
    });

    return bridges.sort((a, b) => (parseFloat(a.orbe_a) + parseFloat(a.orbe_b)) - (parseFloat(b.orbe_a) + parseFloat(b.orbe_b)));
}

const fixedStarBridges = computeFixedStarBridges(etoileMatchesA, etoileMatchesB, persoStrA, persoStrB);

// ---- 8i. HAYZ CROISÉ ----
function computeHayz(planets, isDayChart, personName, houses) {
    const results = [];
    for (const p of planets) {
        const name = getPlanetName(p);
        if (!DIURNAL_PLANETS.has(name) && !NOCTURNAL_PLANETS.has(name)) continue;
        const sign = getPlanetSign(p);
        const deg = getPlanetDegree(p);
        const house = getHouseNumber(deg, houses);
        const aboveHorizon = [7, 8, 9, 10, 11, 12].includes(house);
        const isMasc = MASCULINE_SIGNS.has(sign);
        const isDiurnal = DIURNAL_PLANETS.has(name);
        const isNocturnal = NOCTURNAL_PLANETS.has(name);

        let score = 0;
        const checks = [];

        let sectCorrect = false;
        if (isDayChart && isDiurnal) {
            score++;
            sectCorrect = true;
            checks.push("secte correcte (diurne de jour)");
            if (aboveHorizon) { score++; checks.push("au-dessus horizon"); }
            if (isMasc) { score++; checks.push("signe masculin"); }
        } else if (!isDayChart && isNocturnal) {
            score++;
            sectCorrect = true;
            checks.push("secte correcte (nocturne de nuit)");
            if (!aboveHorizon) { score++; checks.push("sous horizon"); }
            if (!isMasc) { score++; checks.push("signe féminin"); }
        }

        if (score >= 3) {
            results.push({ planete: name, personne: personName, level: "parfait", score: 3,
                condition: `HAYZ parfait (${checks.join(", ")})` });
        } else if (score >= 2 || sectCorrect) {
            results.push({ planete: name, personne: personName, level: "partiel", score: Math.max(score, 1),
                condition: `HAYZ partiel (${checks.join(", ")})` });
        } else {
            const antiChecks = [];
            if (isDayChart && isNocturnal) antiChecks.push("planète nocturne de jour");
            if (!isDayChart && isDiurnal) antiChecks.push("planète diurne de nuit");
            if (isDiurnal && !aboveHorizon) antiChecks.push("sous horizon");
            if (isNocturnal && aboveHorizon) antiChecks.push("au-dessus horizon");
            if (isDiurnal && !isMasc) antiChecks.push("signe féminin");
            if (isNocturnal && isMasc) antiChecks.push("signe masculin");
            if (antiChecks.length >= 2) {
                results.push({ planete: name, personne: personName, level: "anti-hayz", score: -1,
                    condition: `ANTI-HAYZ (${antiChecks.join(", ")})` });
            }
        }
    }
    return results;
}

const hayzA = computeHayz(natalPlanetsA, isDayChartA, persoStrA, natalHousesA);
const hayzB = computeHayz(natalPlanetsB, isDayChartB, persoStrB, natalHousesB);
const allHayz = [...hayzA, ...hayzB];

// ---- 8j. ASPECT APPLIQUANT vs SÉPARANT ----
function getPlanetSpeed(p) {
    return p.vitesse_longitude || p.speed || null;
}

function classifyApplyingSeparating(interAspects, planetsFrom, planetsTo) {
    const ASP_ANGLE = {"Conjonction":0,"Sextile":60,"Carré":90,"Trigone":120,"Quinconce":150,"Opposition":180};
    function circularOrb(deg1, deg2, aspAngle) {
        const diff = absAngularDiff(deg1, deg2);
        let orb = Math.abs(diff - aspAngle);
        if (orb > 180) orb = 360 - orb;
        return orb;
    }
    return interAspects.map(a => {
        const pFrom = planetsFrom.find(p => getPlanetName(p) === a.planete_source);
        const pTo = planetsTo.find(p => getPlanetName(p) === a.planete_cible);
        if (!pFrom || !pTo) return { ...a, applying: null, applying_mult: 1.0 };
        const speedFrom = getPlanetSpeed(pFrom);
        const speedTo = getPlanetSpeed(pTo);
        if (speedFrom === null || speedTo === null) return { ...a, applying: null, applying_mult: 1.0 };
        const degFrom = getPlanetDegree(pFrom);
        const degTo = getPlanetDegree(pTo);
        const aspAngle = ASP_ANGLE[a.aspect] || 0;
        const curOrb = circularOrb(degFrom, degTo, aspAngle);
        const futOrb = circularOrb(degFrom + speedFrom, degTo + speedTo, aspAngle);
        const isApplying = futOrb < curOrb;
        const appMult = isApplying ? 1.10 : 0.92;
        const adjustedScore = Math.round(a.score * appMult * 10) / 10;
        return { ...a, applying: isApplying, applying_mult: appMult, score: adjustedScore };
    });
}

const interAspectsTier1BtoA_enriched = classifyApplyingSeparating(interAspectsTier1BtoA, natalPlanetsB, natalPlanetsA);
const interAspectsTier1AtoB_enriched = classifyApplyingSeparating(interAspectsTier1AtoB, natalPlanetsA, natalPlanetsB);
const interAspectsTier2BtoA_enriched = classifyApplyingSeparating(interAspectsTier2BtoA, natalPlanetsB, natalPlanetsA);
const interAspectsTier2AtoB_enriched = classifyApplyingSeparating(interAspectsTier2AtoB, natalPlanetsA, natalPlanetsB);

// v6.1.0 — Indice de longévité : Saturne ciment + Nœuds vie commune
// Calculé sur la SOMME des inter-aspects (B→A et A→B) pour avoir une vue
// bidirectionnelle complète de la « colle » relationnelle.
const longevityIndex = (() => {
    const all = [...interAspectsBtoA, ...interAspectsAtoB];
    const allT2 = [...interAspectsTier2BtoA, ...interAspectsTier2AtoB];
    return computeLongevityIndex(all, allT2, persoStrA + " ↔ " + persoStrB);
})();

// v6.2.0 — Lecture combinée des blocages partagés (Q3 astrologue)
const sharedNatalBlocks = assessSharedNatalBlocks(
    natalBlocksA,
    natalBlocksB,
    [...interAspectsBtoA, ...interAspectsAtoB]
);

// v6.3.0 — Q10 astrologue : détection Vénus-Mars hors Amour. Cluster
// Vénus ↔ Mars entre 2 personnes = drive commun (synergie créative en
// Business, complicité en Ami...) MAIS tension magnétique latente. À
// signaler comme "risque de débordement du cadre initial" hors Amour.
const venusMarsContacts = (() => {
    const all = [...interAspectsBtoA, ...interAspectsAtoB];
    const VM = ({ planete_source: ps, planete_cible: pc }) =>
        (ps === "Vénus" && pc === "Mars") || (ps === "Mars" && pc === "Vénus");
    return all.filter(a => {
        const ps = a.planete_source || a.from || a.source;
        const pc = a.planete_cible || a.to || a.cible;
        return VM({ planete_source: ps, planete_cible: pc }) && Math.abs(a.orbe || 99) <= 6;
    }).map(a => ({
        source: a.planete_source || a.from || a.source,
        source_p: a.source_personne || a.personne_source,
        cible: a.planete_cible || a.to || a.cible,
        cible_p: a.cible_personne || a.personne_cible,
        aspect: a.name || a.aspect,
        orbe: a.orbe,
        nature: a.nature
    }));
})();
const _NON_LOVE_TYPOS_VM = new Set(["Business", "Ami", "Mentorat", "Colocataire", "Fratrie", "Parent / Enfant"]);
const venusMarsAlertActive = _NON_LOVE_TYPOS_VM.has(typologie) && venusMarsContacts.length > 0;

// v6.3.0 — Q8 astrologue : détection "guru complex" en Mentorat. Combinaison
// de deux patterns possibles (selon la directionnalité A → B ou B → A) :
//   Pattern A : Neptune A overlay en M12 B + Pluton A ↔ Soleil B carré/opp
//   Pattern B : Saturne A ↔ Lune B carré/opp + Pluton A overlay en M1 B
// La logique est symétrisée pour A et B (chaque sens étant testé).
function detectGuruComplex(overlayMentor, mentorPlanetsAspectsToStudent, mentorLabel, studentLabel) {
    // overlayMentor : tableau d'overlay (mentor → student) clé maison
    // mentorPlanetsAspectsToStudent : inter-aspects où la source est "mentor"
    const findOverlay = (planet, house) => {
        const list = overlayMentor[String(house)] || overlayMentor[house] || [];
        return list.some(p => p.planete === planet);
    };
    const findHardAsp = (sourcePlanet, targetPlanet) => {
        return mentorPlanetsAspectsToStudent.find(a => {
            const sp = a.planete_source || a.from || a.source;
            const tp = a.planete_cible || a.to || a.cible;
            const aspName = a.name || a.aspect;
            return sp === sourcePlanet && tp === targetPlanet
                && (aspName === "Carré" || aspName === "Opposition")
                && Math.abs(a.orbe || 99) <= 5;
        });
    };
    const patternA_neptune12 = findOverlay("Neptune", 12);
    const patternA_plutoSol = findHardAsp("Pluton", "Soleil");
    const patternB_satLun = findHardAsp("Saturne", "Lune");
    const patternB_pluton1 = findOverlay("Pluton", 1);
    const patternA_match = patternA_neptune12 && patternA_plutoSol;
    const patternB_match = patternB_satLun && patternB_pluton1;
    if (!patternA_match && !patternB_match) return null;
    return {
        mentor: mentorLabel,
        student: studentLabel,
        pattern_a: patternA_match
            ? { neptune_in_M12: true, pluto_sol_aspect: { aspect: patternA_plutoSol.name || patternA_plutoSol.aspect, orbe: patternA_plutoSol.orbe } }
            : null,
        pattern_b: patternB_match
            ? { saturn_lune_aspect: { aspect: patternB_satLun.name || patternB_satLun.aspect, orbe: patternB_satLun.orbe }, pluto_in_M1: true }
            : null
    };
}
let guruComplexAlerts = [];
if (typologie === "Mentorat") {
    const guruA = detectGuruComplex(overlayAinB, interAspectsAtoB, persoStrA, persoStrB);
    const guruB = detectGuruComplex(overlayBinA, interAspectsBtoA, persoStrB, persoStrA);
    if (guruA) guruComplexAlerts.push(guruA);
    if (guruB) guruComplexAlerts.push(guruB);
}

// v6.5.0 — Q22 astrologue : Indice d'Adversité ÉTENDU pour typologie Rivalité.
// v6.7.0 — Q44 astrologue : ajout de 3 patterns « rivalité intellectuelle »
//          pour capter Edison/Tesla, Einstein/Bohr, Wagner/Brahms (rivalités
//          de pensée plus que de combat) — poids modéré ~3 pts effectifs chacun.
// Capture 9 patterns astrologiques de rivalité moderne :
//   1. Mars/Pluton/Uranus inter (base v6.3.0) — friction physique/destructrice
//   2. Sun ↔ Pluton hard                       — bataille d'ego
//   3. Asc ↔ Mars hard                         — provocation directe
//   4. MC ↔ MC carré/opposition                — collision de carrière publique
//   5. Mercure ↔ Mars hard                     — joutes verbales destructrices
//   6. Vénus ↔ Saturne hard                    — mépris glacial / rejet froid
//   7. Mercure ↔ Saturne hard (Q44)            — contradiction systématique / mur intellectuel
//   8. Soleil ↔ Soleil opposition (Q44)        — impossibilité de briller dans la même pièce
//   9. MC ↔ Saturne hard (Q44)                 — vouloir bloquer la reconnaissance publique de l'autre
function computeAdversityIndex(allInterAspects) {
    const ADV_PLANETS = new Set(["Mars", "Pluton", "Uranus"]);
    const HARD_ASP = new Set(["Carré", "Opposition", "Conjonction"]);
    const HARD_ONLY = new Set(["Carré", "Opposition"]);

    // Couples de planètes/points pour les patterns ciblés (ordre indifférent)
    const _pairsetEqual = (a, b, x, y) => (a === x && b === y) || (a === y && b === x);
    const isSunPlutoHard = (a, b, asp) => _pairsetEqual(a, b, "Soleil", "Pluton") && HARD_ASP.has(asp);
    const isAscMarsHard  = (a, b, asp) => _pairsetEqual(a, b, "Ascendant", "Mars") && HARD_ASP.has(asp);
    const isMcMcHard     = (a, b, asp) => a === "Milieu du Ciel" && b === "Milieu du Ciel" && HARD_ONLY.has(asp);
    const isMercMarsHard = (a, b, asp) => _pairsetEqual(a, b, "Mercure", "Mars") && HARD_ASP.has(asp);
    const isVenSatHard   = (a, b, asp) => _pairsetEqual(a, b, "Vénus", "Saturne") && HARD_ASP.has(asp);
    // v6.7.0 — Q44 : nouveaux patterns (rivalité intellectuelle / réputation)
    const isMercSatHard  = (a, b, asp) => _pairsetEqual(a, b, "Mercure", "Saturne") && HARD_ASP.has(asp);
    const isSunSunOpp    = (a, b, asp) => a === "Soleil" && b === "Soleil" && asp === "Opposition";
    const isMcSatHard    = (a, b, asp) => _pairsetEqual(a, b, "Milieu du Ciel", "Saturne") && HARD_ASP.has(asp);

    let total = 0;
    const breakdown = [];
    const components = {
        mars_pluto_uranus: 0, sun_pluto: 0, asc_mars: 0,
        mc_mc: 0, merc_mars: 0, ven_saturn: 0,
        // v6.7.0 — Q44
        merc_saturn: 0, sun_sun_opp: 0, mc_saturn: 0
    };

    for (const a of allInterAspects) {
        const sp = a.planete_source || a.from || a.source;
        const tp = a.planete_cible || a.to || a.cible;
        const aspName = a.name || a.aspect;
        const orbe = Math.abs(a.orbe || 99);
        if (orbe > 8) continue;
        const orbeFactor = Math.max(0, 1 - orbe / 8);

        let category = null;
        let baseIntensity = 0;

        if (ADV_PLANETS.has(sp) && ADV_PLANETS.has(tp) && HARD_ASP.has(aspName)) {
            category = "mars_pluto_uranus";
            baseIntensity = (aspName === "Conjonction" || aspName === "Opposition") ? 18 : 14;
        } else if (isSunPlutoHard(sp, tp, aspName)) {
            category = "sun_pluto";
            baseIntensity = (aspName === "Conjonction" || aspName === "Opposition") ? 16 : 12;
        } else if (isAscMarsHard(sp, tp, aspName)) {
            category = "asc_mars";
            baseIntensity = (aspName === "Conjonction" || aspName === "Opposition") ? 14 : 10;
        } else if (isMcMcHard(sp, tp, aspName)) {
            category = "mc_mc";
            baseIntensity = 12;
        } else if (isMercMarsHard(sp, tp, aspName)) {
            category = "merc_mars";
            baseIntensity = (aspName === "Conjonction" || aspName === "Opposition") ? 14 : 11;
        } else if (isVenSatHard(sp, tp, aspName)) {
            category = "ven_saturn";
            baseIntensity = (aspName === "Conjonction" || aspName === "Opposition") ? 12 : 10;
        }
        // v6.7.0 — Q44 : 3 patterns « rivalité intellectuelle » à poids modéré
        // baseIntensity 6 pour conj/opp, 4 pour carré → ~3 pts effectifs à orbe
        // moyen. Évite de transformer un simple désaccord en rivalité mortelle.
        else if (isMercSatHard(sp, tp, aspName)) {
            category = "merc_saturn";
            baseIntensity = (aspName === "Conjonction" || aspName === "Opposition") ? 6 : 4;
        } else if (isSunSunOpp(sp, tp, aspName)) {
            category = "sun_sun_opp";
            baseIntensity = 6;
        } else if (isMcSatHard(sp, tp, aspName)) {
            category = "mc_saturn";
            baseIntensity = (aspName === "Conjonction" || aspName === "Opposition") ? 6 : 4;
        }
        if (!category) continue;

        const contribution = Math.round(baseIntensity * orbeFactor);
        if (contribution <= 0) continue;
        total += contribution;
        components[category] += contribution;
        breakdown.push({ pair: `${sp}-${tp}`, aspect: aspName, orbe, contribution, category });
    }
    const indexNorm = Math.max(0, Math.min(100, total));
    return {
        score: indexNorm,
        qualitative: indexNorm >= 70 ? "très intense"
                   : indexNorm >= 50 ? "intense"
                   : indexNorm >= 30 ? "modérée"
                   : indexNorm >= 15 ? "faible"
                   : "presque inexistante",
        components,
        breakdown: breakdown.sort((a, b) => b.contribution - a.contribution).slice(0, 8)
    };
}
let adversityIndex = null;
if (typologie === "Rivalité") {
    adversityIndex = computeAdversityIndex([...interAspectsBtoA, ...interAspectsAtoB]);
}

// v6.5.0 — Q27 & Q29 astrologue : bonus de signature typologique.
// Capte les patterns sous-pondérés par la grille typologique standard :
//   - Mentorat : Sun(mentor) ↔ Saturne(élève) + Jupiter(mentor) ↔ MC/M10(élève)
//                (transmission d'autorité paternelle + ascenseur social)
//   - Fratrie  : Lune ↔ Lune + Lune en M4 de l'autre
//                (matrice émotionnelle commune + foyer originel partagé)
// v6.5.1 — Q32 : recalibrage Mentorat (cap +6 max, orbes serrés à 4° en
// Sun-Saturne, orbe MC strict 3°). Évite la sur-correction de cas comme
// Buffett/Gates qui amplifiait artificiellement +9 pts sur des aspects faibles.
function computeTypologySignatureBonus(typologie, interAtoB, interBtoA, ageA, ageB) {
    if (typologie !== "Mentorat" && typologie !== "Fratrie") return { bonus: 0, signatures: [] };
    const HARD_SOFT = new Set(["Conjonction", "Trigone", "Sextile"]);
    const ALL_ASP = new Set(["Conjonction", "Trigone", "Sextile", "Carré", "Opposition"]);
    const orbeFactor = (orbe, max) => Math.max(0, Math.min(1, 1 - orbe / max));
    const findAspect = (asps, p1, p2, kinds, orbeMax) => {
        for (const a of asps) {
            const sp = a.planete_source, tp = a.planete_cible, asp = a.aspect;
            const orbe = Math.abs(a.orbe || 99);
            if (!kinds.has(asp)) continue;
            if (orbe > orbeMax) continue;
            if ((sp === p1 && tp === p2) || (sp === p2 && tp === p1)) return { ...a, _orbeFactor: orbeFactor(orbe, orbeMax) };
        }
        return null;
    };
    const findPlanetInHouse = (asps, planet, houseNum) => {
        for (const a of asps) {
            if (a.planete_source !== planet) continue;
            if (a.maison_cible === houseNum) return a;
        }
        return null;
    };

    const signatures = [];
    let bonus = 0;

    if (typologie === "Mentorat") {
        // v6.5.1 — Q32 : orbes resserrés à la norme pro (4° max sur Sun-Saturne,
        // 3° max sur Jupiter-MC). Cap final à +6 pour éviter la sur-correction.
        const ORBE_SUN_SAT = 4;
        const ORBE_JUP_MC = 3;
        let mentorIs = null;
        const mAtoB = interAtoB;
        const mBtoA = interBtoA;
        if (typeof ageA === "number" && typeof ageB === "number" && Math.abs(ageA - ageB) >= 10) {
            mentorIs = ageA > ageB ? "A" : "B";
        }
        // Pattern 1 : Soleil(mentor) ↔ Saturne(élève) avec orbe < 4°
        const checkSunSaturn = (asps, mentorLabel) => {
            const soft = findAspect(asps, "Soleil", "Saturne", HARD_SOFT, ORBE_SUN_SAT);
            if (soft) {
                const pts = Math.max(1, Math.round(4 * soft._orbeFactor));
                signatures.push({ pattern: "sun_saturn_soft", mentor: mentorLabel, aspect: soft.aspect, orbe: soft.orbe, pts });
                return pts;
            }
            const hard = findAspect(asps, "Soleil", "Saturne", new Set(["Carré", "Opposition"]), ORBE_SUN_SAT);
            if (hard) {
                const pts = Math.max(1, Math.round(2 * hard._orbeFactor));
                signatures.push({ pattern: "sun_saturn_hard", mentor: mentorLabel, aspect: hard.aspect, orbe: hard.orbe, pts });
                return pts;
            }
            return 0;
        };
        // Pattern 2 : Jupiter(mentor) → M10(élève) — orbe ≤ 3° pour Jupiter-MC,
        //              ou Jupiter physiquement en M10 (présence directe = +3 fixe)
        const checkJupiterM10 = (asps, mentorLabel) => {
            const inM10 = findPlanetInHouse(asps, "Jupiter", 10);
            if (inM10) {
                signatures.push({ pattern: "jupiter_in_m10", mentor: mentorLabel, pts: 3 });
                return 3;
            }
            const jupMc = findAspect(asps, "Jupiter", "Milieu du Ciel", HARD_SOFT, ORBE_JUP_MC);
            if (jupMc) {
                const pts = Math.max(1, Math.round(3 * jupMc._orbeFactor));
                signatures.push({ pattern: "jupiter_mc_soft", mentor: mentorLabel, aspect: jupMc.aspect, orbe: jupMc.orbe, pts });
                return pts;
            }
            return 0;
        };

        if (mentorIs === "A") {
            bonus += checkSunSaturn(mAtoB, "A");
            bonus += checkJupiterM10(mAtoB, "A");
        } else if (mentorIs === "B") {
            bonus += checkSunSaturn(mBtoA, "B");
            bonus += checkJupiterM10(mBtoA, "B");
        } else {
            const a1 = checkSunSaturn(mAtoB, "A_uncertain");
            const a2 = checkSunSaturn(mBtoA, "B_uncertain");
            const j1 = checkJupiterM10(mAtoB, "A_uncertain");
            const j2 = checkJupiterM10(mBtoA, "B_uncertain");
            bonus += Math.max(a1, a2) + Math.max(j1, j2);
        }
        // Q32 : cap Mentorat à +6 (au lieu de +12 v6.5.0)
        bonus = Math.min(bonus, 6);
    }

    if (typologie === "Fratrie") {
        // Pattern 1 : Lune ↔ Lune (matrice émotionnelle commune)
        // Conjonction/trigone +5, sextile +3, carré +2, opposition +2
        const moonMoonAll = [...interAtoB, ...interBtoA].find(a =>
            a.planete_source === "Lune" && a.planete_cible === "Lune" && ALL_ASP.has(a.aspect)
        );
        if (moonMoonAll) {
            const orbe = Math.abs(moonMoonAll.orbe || 99);
            const orbeFac = orbeFactor(orbe, 8);
            let basePts = 0;
            if (moonMoonAll.aspect === "Conjonction" || moonMoonAll.aspect === "Trigone") basePts = 5;
            else if (moonMoonAll.aspect === "Sextile") basePts = 3;
            else basePts = 2;
            const pts = Math.round(basePts * orbeFac);
            signatures.push({ pattern: "moon_moon", aspect: moonMoonAll.aspect, orbe, pts });
            bonus += pts;
        }

        // Pattern 2 : Lune en M4 de l'autre (foyer originel partagé)
        const moonAinM4ofB = findPlanetInHouse(interAtoB, "Lune", 4);
        const moonBinM4ofA = findPlanetInHouse(interBtoA, "Lune", 4);
        if (moonAinM4ofB) {
            signatures.push({ pattern: "moon_a_in_m4_b", pts: 3 });
            bonus += 3;
        }
        if (moonBinM4ofA) {
            signatures.push({ pattern: "moon_b_in_m4_a", pts: 3 });
            bonus += 3;
        }
        // Cap Fratrie inchangé à +12 (effet plus rare astralement)
        bonus = Math.min(bonus, 12);
    }

    return { bonus, signatures };
}
const _typologySignatureBonus = computeTypologySignatureBonus(
    typologie, interAspectsAtoB, interAspectsBtoA, ageA, ageB
);

// ─── v6.6.0 — Q43 astrologue : BONUS DE SIGNATURE HARMONIQUE (Grand Bénéfique) ──
// v6.7.0 — Q45 astrologue : ajout d'un Tier 2 « Demi-Bénéfique » (+4).
// v6.8.0 — Q48 astrologue (option F = B+C) : Tier 2 élargi pour qu'il déclenche
//          réellement (0 cas matché en v6.7.0) :
//            • Suppression de l'exigence luminaire-impliqué dans les 2 trigones
//              bénéfiques du Tier 2 (un trigone Vénus-Jupiter sans luminaire
//              reste une bénédiction majeure).
//            • Ciment Saturne du Tier 2 : accepter sextile OU trigone (orbe
//              ≤4°) au lieu de trigone seul. Le sextile Saturne est un aspect
//              de consolidation douce, très efficace sur le long terme.
//            • Tier 1 inchangé (rareté préservée).
//
// Capte la « grâce systémique » qu'un simple comptage d'inter-aspects ne
// modélise pas : la conjonction archétypale d'un Grand Trigone bénéfique
// + ciment Saturne positif + absence de toxicité saturnienne.
//
// Mathématiquement non-redondant avec l'Harmony de base :
//   - On NE re-comptabilise PAS les aspects individuels (ils sont déjà dans Harmony)
//   - On détecte un PATTERN GLOBAL booléen qui produit un effet synergique
//     supérieur à la somme des aspects (effet Gestalt astro)
//   - Bonus fixe (Tier 1 = +7, Tier 2 = +4) pour traduire la rareté
//
// Tier 1 (« Grand Bénéfique », +7) — toutes conditions requises :
//   (a1) ≥3 trigones lents (orbe ≤ 4°) impliquant les bénéfiques traditionnels
//        Vénus ou Jupiter, ET au moins un luminaire (Soleil ou Lune) impliqué
//   (b1) ≥1 trigone direct Saturne → Soleil/Lune/Vénus de l'autre (ciment +)
//   (c)  AUCUN carré ni opposition exact (orbe ≤ 2°) Saturne → Soleil/Lune
//        de l'autre (sinon le ciment est toxique)
//   (d)  Typologie ≠ Rivalité
//
// Tier 2 (« Demi-Bénéfique », +4) — Q48-F :
//   (a2) Exactement 2 trigones lents Vénus/Jupiter (PAS d'exigence luminaire)
//   (b2) ≥1 trigone OU sextile Saturne → Soleil/Lune/Vénus (orbe ≤ 4°)
//   (c)  pas de toxicité Saturne identique au Tier 1
//   (d)  Typologie ≠ Rivalité
//
// Si Tier 1 matche, Tier 2 est ignoré (un seul bonus appliqué).
function computeHarmonicSignatureBonus(typologie, interAtoB, interBtoA) {
    if (typologie === "Rivalité") return { bonus: 0, tier: null, signatures: [], conditions: { d_typology_ok: false } };

    const ORBE_TRIGONE = 4;
    const ORBE_CEMENT = 4;
    const ORBE_HARD_TOXIC = 2;
    const BENEFICS = new Set(["Vénus", "Jupiter"]);
    const LUMINARIES = new Set(["Soleil", "Lune"]);
    const SATURN_TARGETS = new Set(["Soleil", "Lune", "Vénus"]);
    const all = [...interAtoB, ...interBtoA];

    // Compter les trigones bénéfiques lents impliquant Vénus ou Jupiter
    const beneficTrigones = all.filter(a => {
        if (a.aspect !== "Trigone") return false;
        if (Math.abs(a.orbe || 99) > ORBE_TRIGONE) return false;
        const sp = a.planete_source, tp = a.planete_cible;
        return BENEFICS.has(sp) || BENEFICS.has(tp);
    });
    const luminaryInTrigones = beneficTrigones.some(a =>
        LUMINARIES.has(a.planete_source) || LUMINARIES.has(a.planete_cible)
    );
    const cond_a1 = beneficTrigones.length >= 3 && luminaryInTrigones;
    // v6.8.0 — Q48-F : Tier 2 ne demande plus de luminaire dans les trigones.
    // « Exactement 2 » est conservé pour ne pas marcher sur les pieds du Tier 1.
    const cond_a2 = beneficTrigones.length === 2;

    // (b1) ciment Saturne Tier 1 : trigone strict
    const saturnCementTrigone = all.find(a => {
        if (a.aspect !== "Trigone") return false;
        if (Math.abs(a.orbe || 99) > ORBE_TRIGONE) return false;
        const sp = a.planete_source, tp = a.planete_cible;
        const hasSaturn = sp === "Saturne" || tp === "Saturne";
        const target = sp === "Saturne" ? tp : sp;
        return hasSaturn && SATURN_TARGETS.has(target);
    });
    const cond_b1 = !!saturnCementTrigone;
    // v6.8.0 — Q48-F : ciment Saturne Tier 2 — sextile OU trigone (orbe ≤ 4°)
    const saturnCementSoft = saturnCementTrigone || all.find(a => {
        if (a.aspect !== "Sextile") return false;
        if (Math.abs(a.orbe || 99) > ORBE_CEMENT) return false;
        const sp = a.planete_source, tp = a.planete_cible;
        const hasSaturn = sp === "Saturne" || tp === "Saturne";
        const target = sp === "Saturne" ? tp : sp;
        return hasSaturn && SATURN_TARGETS.has(target);
    });
    const cond_b2 = !!saturnCementSoft;

    // (c) AUCUN carré/opposition exact Saturne → luminaire de l'autre (orbe ≤ 2°)
    const saturnToxic = all.find(a => {
        if (a.aspect !== "Carré" && a.aspect !== "Opposition") return false;
        if (Math.abs(a.orbe || 99) > ORBE_HARD_TOXIC) return false;
        const sp = a.planete_source, tp = a.planete_cible;
        const hasSaturn = sp === "Saturne" || tp === "Saturne";
        const target = sp === "Saturne" ? tp : sp;
        return hasSaturn && LUMINARIES.has(target);
    });
    const cond_c = !saturnToxic;
    const cond_d = true;

    const conditions = {
        a1_three_benefic_trigones_with_luminary: cond_a1,
        a2_two_benefic_trigones_no_luminary_required: cond_a2,
        b1_saturn_trigone_cement: cond_b1,
        b2_saturn_soft_cement: cond_b2,
        c_no_saturn_toxic_to_luminary: cond_c,
        d_typology_ok: cond_d
    };
    const tier1Ok = cond_a1 && cond_b1 && cond_c && cond_d;
    // Tier 2 ne se déclenche que si Tier 1 ne matche PAS
    const tier2Ok = !tier1Ok && cond_a2 && cond_b2 && cond_c && cond_d;

    const signatures = [];
    let bonus = 0;
    let tier = null;
    if (tier1Ok) {
        bonus = 7;
        tier = "grand_benefic";
        signatures.push({
            pattern: "grand_benefic_signature",
            tier: 1,
            benefic_trigone_count: beneficTrigones.length,
            saturn_cement: saturnCementTrigone ? `${saturnCementTrigone.planete_source}↔${saturnCementTrigone.planete_cible} ${saturnCementTrigone.aspect} (orbe ${Number(saturnCementTrigone.orbe).toFixed(2)}°)` : null,
            pts: 7
        });
    } else if (tier2Ok) {
        bonus = 4;
        tier = "half_benefic";
        signatures.push({
            pattern: "half_benefic_signature",
            tier: 2,
            benefic_trigone_count: beneficTrigones.length,
            saturn_cement: saturnCementSoft ? `${saturnCementSoft.planete_source}↔${saturnCementSoft.planete_cible} ${saturnCementSoft.aspect} (orbe ${Number(saturnCementSoft.orbe).toFixed(2)}°)` : null,
            pts: 4
        });
    }

    return {
        bonus,
        tier,
        signatures,
        conditions,
        debug: {
            benefic_trigones_count: beneficTrigones.length,
            luminary_in_trigones: luminaryInTrigones,
            saturn_cement_trigone_found: !!saturnCementTrigone,
            saturn_cement_soft_found: !!saturnCementSoft,
            saturn_toxic_blocker: saturnToxic ? `${saturnToxic.aspect} ${saturnToxic.planete_source}↔${saturnToxic.planete_cible} orbe ${Number(saturnToxic.orbe).toFixed(2)}°` : null
        }
    };
}
const _harmonicSignatureBonus = computeHarmonicSignatureBonus(
    typologie, interAspectsAtoB, interAspectsBtoA
);

// ─── v6.8.0 — Q49 astrologue : BONUS DE COMPATIBILITÉ INTELLECTUELLE ────
// Mercure ↔ Mercure harmonique (conjonction / trigone / sextile, orbe ≤ 6°)
// signe la complicité de pensée nécessaire pour qu'une amitié, une fratrie,
// un mentorat, une relation parent-enfant tienne des décennies. La grille
// typologique standard la sous-pondère.
//
// Astrologue (Q49-bis) : applicable aussi en Amour, mais à dose réduite —
// dans un couple, la communication AIDE mais ne crée pas l'attraction
// fondamentale (Vénus/Mars/Lune jouent ce rôle).
//
//   Typologies majeures (Ami, Mentorat, Fratrie, Parent / Enfant) : +3 max
//   Typologie mineure (Amour) : +2 max
//   Autres typologies (Business, Colocataire, Rivalité) : 0 (Mercure-Mercure
//     n'est pas le facteur structurant pour ces relations)
//
// Le bonus est modulé par l'orbe (orbeFactor) et par la nature de l'aspect :
//   Conjonction = trigone = 1.0 (poids plein)
//   Sextile = 0.75 (poids réduit)
function computeIntellectualSignatureBonus(typologie, interAtoB, interBtoA) {
    const TARGET_TYPOS_MAJOR = new Set(["Ami", "Mentorat", "Fratrie", "Parent / Enfant"]);
    const TARGET_TYPOS_MINOR = new Set(["Amour"]);

    let weightMax;
    if (TARGET_TYPOS_MAJOR.has(typologie)) weightMax = 3;
    else if (TARGET_TYPOS_MINOR.has(typologie)) weightMax = 2;
    else return { bonus: 0, signature: null, applicable: false };

    const HARMONIC = new Set(["Conjonction", "Trigone", "Sextile"]);
    const ORBE_MAX = 6;
    const all = [...interAtoB, ...interBtoA];

    // Trouver le meilleur aspect Mercure-Mercure harmonique
    let best = null;
    for (const a of all) {
        const sp = a.planete_source, tp = a.planete_cible;
        if (sp !== "Mercure" || tp !== "Mercure") continue;
        if (!HARMONIC.has(a.aspect)) continue;
        const orbe = Math.abs(a.orbe || 99);
        if (orbe > ORBE_MAX) continue;
        const orbeFactor = Math.max(0, 1 - orbe / ORBE_MAX);
        const aspectWeight = a.aspect === "Sextile" ? 0.75 : 1.0;
        const score = orbeFactor * aspectWeight;
        if (!best || score > best._score) {
            best = { aspect: a.aspect, orbe, _score: score };
        }
    }

    if (!best) return { bonus: 0, signature: null, applicable: true };

    const ptsRaw = weightMax * best._score;
    const pts = Math.round(ptsRaw);
    if (pts <= 0) return { bonus: 0, signature: null, applicable: true };

    return {
        bonus: pts,
        signature: { pattern: "merc_merc_harmonic", aspect: best.aspect, orbe: best.orbe, weight_max: weightMax, pts },
        applicable: true
    };
}
const _intellectualSignatureBonus = computeIntellectualSignatureBonus(
    typologie, interAspectsAtoB, interAspectsBtoA
);

// ---- 8k. CONFIGURATIONS DANS LE COMPOSITE / DAVISON ----
const AXIAL_PAIRS = new Set([
    "Ascendant|Descendant","Descendant|Ascendant",
    "Milieu du Ciel|Imum Coeli","Imum Coeli|Milieu du Ciel",
    "Nœud Nord|Nœud Sud","Nœud Sud|Nœud Nord"
]);
const isAxialOpp = (a, b) => AXIAL_PAIRS.has(`${a}|${b}`);

function detectCompositeConfigurations(compPlanetes) {
    if (!compPlanetes || compPlanetes.length < 3) return [];
    const configs = [];
    const cp = compPlanetes;

    const STELLIUM_MAX_ARC = 12;
    const sorted = [...cp].filter(p => p.degre != null).sort((a, b) => a.degre - b.degre);
    for (let i = 0; i < sorted.length; i++) {
        const group = [sorted[i]];
        for (let j = i + 1; j < sorted.length; j++) {
            let span = sorted[j].degre - sorted[i].degre;
            if (span > 180) span = 360 - span;
            if (span <= STELLIUM_MAX_ARC) group.push(sorted[j]);
            else break;
        }
        if (group.length >= 3) {
            const pNames = group.map(g => g.planete);
            const key = pNames.sort().join("|");
            if (!configs.some(c => c.type === "Stellium" && [...c.planets].sort().join("|") === key)) {
                const signs = [...new Set(group.map(g => g.signe))];
                const totalArc = Math.round(absAngularDiff(group[0].degre, group[group.length - 1].degre) * 10) / 10;
                configs.push({ type: "Stellium", planets: pNames, arc_degrees: totalArc,
                    description: `${pNames.join(", ")} regroupés en ${signs.join("/")} (arc ${totalArc}°) — concentration d'énergie relationnelle` });
            }
        }
    }

    for (let i = 0; i < cp.length; i++) {
        for (let j = i + 1; j < cp.length; j++) {
            for (let k = j + 1; k < cp.length; k++) {
                const d12 = absAngularDiff(cp[i].degre, cp[j].degre);
                const d23 = absAngularDiff(cp[j].degre, cp[k].degre);
                const d13 = absAngularDiff(cp[i].degre, cp[k].degre);

                if (Math.abs(d12 - 120) <= 8 && Math.abs(d23 - 120) <= 8 && Math.abs(d13 - 120) <= 8) {
                    const SIGN_ELEMENT = {"Bélier":"Feu","Lion":"Feu","Sagittaire":"Feu","Taureau":"Terre","Vierge":"Terre","Capricorne":"Terre","Gémeaux":"Air","Balance":"Air","Verseau":"Air","Cancer":"Eau","Scorpion":"Eau","Poissons":"Eau"};
                    const el1 = SIGN_ELEMENT[cp[i].signe], el2 = SIGN_ELEMENT[cp[j].signe], el3 = SIGN_ELEMENT[cp[k].signe];
                    const sameElement = el1 && el1 === el2 && el2 === el3;
                    const element = sameElement ? el1 : "mixte";
                    configs.push({ type: "Grand Trigone", planets: [cp[i].planete, cp[j].planete, cp[k].planete],
                        element: element, validated: sameElement,
                        description: `${cp[i].planete}–${cp[j].planete}–${cp[k].planete} : harmonie structurelle${sameElement ? ` (${element})` : ' (éléments mixtes — trigone géométrique)'}` });
                }
            }
        }
    }

    for (let i = 0; i < cp.length; i++) {
        for (let j = i + 1; j < cp.length; j++) {
            if (isAxialOpp(cp[i].planete, cp[j].planete)) continue;
            if (Math.abs(absAngularDiff(cp[i].degre, cp[j].degre) - 180) > 10) continue;
            for (let k = 0; k < cp.length; k++) {
                if (k === i || k === j) continue;
                const dik = absAngularDiff(cp[i].degre, cp[k].degre);
                const djk = absAngularDiff(cp[j].degre, cp[k].degre);
                if (Math.abs(dik - 90) <= 8 && Math.abs(djk - 90) <= 8) {
                    const key = [cp[i].planete, cp[j].planete, cp[k].planete].sort().join("|");
                    if (!configs.some(c => c.type === "T-Carré" && [...c.planets].sort().join("|") === key)) {
                        configs.push({ type: "T-Carré", planets: [cp[i].planete, cp[j].planete, cp[k].planete],
                            description: `${cp[i].planete} opp ${cp[j].planete}, carré à ${cp[k].planete} (apex) — tension motrice de la relation` });
                    }
                }
            }
        }
    }

    for (let i = 0; i < cp.length; i++) {
        for (let j = i + 1; j < cp.length; j++) {
            if (Math.abs(absAngularDiff(cp[i].degre, cp[j].degre) - 60) > 6) continue;
            for (let k = 0; k < cp.length; k++) {
                if (k === i || k === j) continue;
                const dik = absAngularDiff(cp[i].degre, cp[k].degre);
                const djk = absAngularDiff(cp[j].degre, cp[k].degre);
                if (Math.abs(dik - 150) <= 4 && Math.abs(djk - 150) <= 4) {
                    const key = [cp[i].planete, cp[j].planete, cp[k].planete].sort().join("|");
                    if (!configs.some(c => c.type === "Yod" && [...c.planets].sort().join("|") === key)) {
                        configs.push({ type: "Yod", planets: [cp[i].planete, cp[j].planete, cp[k].planete],
                            description: `${cp[i].planete} sextile ${cp[j].planete}, quinconce à ${cp[k].planete} (apex) — mission relationnelle karmique` });
                    }
                }
            }
        }
    }
    return configs;
}

const compositeConfigs = detectCompositeConfigurations(compositeChart.planetes);

// ---- 8l. MIDPOINTS RELATIONNELS (EBERTIN) — v2 Extended ----
const MIDPOINT_MEANINGS = {
    "Soleil/Lune": { theme: "Union vitale", kw: "Couple intérieur, harmonie émotion-volonté, partenariat fondamental" },
    "Soleil/Mercure": { theme: "Expression consciente", kw: "Communication volontaire, pensée dirigée, projets communs" },
    "Soleil/Vénus": { theme: "Harmonie affective", kw: "Amour, plaisir partagé, sens esthétique commun" },
    "Soleil/Mars": { theme: "Volonté d'action", kw: "Énergie conjointe, initiative, dynamique du couple" },
    "Soleil/Jupiter": { theme: "Expansion vitale", kw: "Confiance mutuelle, croissance, optimisme partagé" },
    "Soleil/Saturne": { theme: "Structure et discipline", kw: "Maturité, responsabilité, engagement durable" },
    "Soleil/Uranus": { theme: "Éveil et rupture", kw: "Originalité, indépendance, surprises dans la relation" },
    "Soleil/Neptune": { theme: "Idéalisation", kw: "Rêves partagés, inspiration, risque de confusion" },
    "Soleil/Pluton": { theme: "Transformation profonde", kw: "Pouvoir, régénération, intensité du lien" },
    "Lune/Mercure": { theme: "Pensée émotionnelle", kw: "Dialogue intime, compréhension intuitive mutuelle" },
    "Lune/Vénus": { theme: "Douceur émotionnelle", kw: "Tendresse, confort affectif, accueil mutuel" },
    "Lune/Mars": { theme: "Réactivité passionnelle", kw: "Impulsivité émotionnelle, désir, conflits domestiques" },
    "Lune/Jupiter": { theme: "Générosité émotionnelle", kw: "Bienveillance, protection, excès émotionnel" },
    "Lune/Saturne": { theme: "Retenue émotionnelle", kw: "Sérieux, froideur possible, devoir familial, loyauté" },
    "Lune/Uranus": { theme: "Émotions imprévisibles", kw: "Instabilité, excitation, besoin de liberté intime" },
    "Lune/Neptune": { theme: "Sensibilité fusionnelle", kw: "Empathie, idéalisation, confusion émotionnelle" },
    "Lune/Pluton": { theme: "Intensité émotionnelle", kw: "Possession, catharsis, transformation affective" },
    "Mercure/Vénus": { theme: "Communication gracieuse", kw: "Diplomatie, charme verbal, affinité intellectuelle" },
    "Mercure/Mars": { theme: "Pensée combative", kw: "Débat, esprit vif, disputes intellectuelles" },
    "Mercure/Jupiter": { theme: "Pensée expansive", kw: "Vision large, projets ambitieux, enseignement mutuel" },
    "Mercure/Saturne": { theme: "Pensée structurée", kw: "Sérieux mental, planification, pessimisme possible" },
    "Mercure/Uranus": { theme: "Pensée originale", kw: "Innovation, idées brillantes, nervosité" },
    "Mercure/Neptune": { theme: "Pensée imaginative", kw: "Intuition partagée, confusion, mensonge ou poésie" },
    "Mercure/Pluton": { theme: "Pensée pénétrante", kw: "Recherche de vérité, manipulation, psychologie profonde" },
    "Vénus/Mars": { theme: "Attraction érotique", kw: "Désir, passion, magnétisme, séduction" },
    "Vénus/Jupiter": { theme: "Abondance affective", kw: "Générosité amoureuse, largesse, joie partagée" },
    "Vénus/Saturne": { theme: "Amour mûr", kw: "Fidélité, retenue, engagement sérieux, frustration possible" },
    "Vénus/Uranus": { theme: "Amour électrique", kw: "Coup de foudre, liberté affective, instabilité" },
    "Vénus/Neptune": { theme: "Amour idéalisé", kw: "Romantisme, illusion, art, spiritualité du lien" },
    "Vénus/Pluton": { theme: "Passion obsessionnelle", kw: "Magnétisme profond, jalousie, transformation par l'amour" },
    "Mars/Jupiter": { theme: "Action expansive", kw: "Entreprise commune, ambition, excès d'énergie" },
    "Mars/Saturne": { theme: "Action contrôlée", kw: "Frustration, endurance, discipline partagée" },
    "Mars/Uranus": { theme: "Action explosive", kw: "Imprévisibilité, innovation radicale, accidents" },
    "Mars/Neptune": { theme: "Action inspirée", kw: "Idéalisme actif, confusion d'intention, sacrifice" },
    "Mars/Pluton": { theme: "Puissance brute", kw: "Domination, force transformatrice, conflit de pouvoir" },
    "Jupiter/Saturne": { theme: "Expansion structurée", kw: "Équilibre croissance/prudence, maturité sociale" },
    "Jupiter/Uranus": { theme: "Éveil soudain", kw: "Chance inattendue, révolution, percée" },
    "Jupiter/Neptune": { theme: "Idéalisme expansif", kw: "Spiritualité partagée, utopie, illusion grandiose" },
    "Jupiter/Pluton": { theme: "Pouvoir et expansion", kw: "Ambition profonde, influence, richesse transformatrice" },
    "Saturne/Uranus": { theme: "Tension ancien/nouveau", kw: "Réforme, cassure structurelle, modernisation forcée" },
    "Saturne/Neptune": { theme: "Dissolution des structures", kw: "Sacrifice, idéaux déçus, endurance spirituelle" },
    "Saturne/Pluton": { theme: "Pouvoir et contrôle", kw: "Épreuves, résilience, domination, reconstruction" },
    "Uranus/Neptune": { theme: "Vision transcendante", kw: "Éveil collectif, utopie, génie ou chaos" },
    "Uranus/Pluton": { theme: "Révolution profonde", kw: "Transformation radicale, crise générationnelle" },
    "Neptune/Pluton": { theme: "Courant générationnel", kw: "Fond collectif, mutations profondes invisibles" },
    "Soleil/Chiron": { theme: "Blessure d'identité", kw: "Guérison de l'égo, mentor par la souffrance" },
    "Lune/Chiron": { theme: "Blessure émotionnelle", kw: "Guérison affective, vulnérabilité partagée" },
    "Vénus/Chiron": { theme: "Blessure amoureuse", kw: "Amour qui guérit, cicatrice affective" },
    "Mars/Chiron": { theme: "Blessure d'action", kw: "Courage de guérir, énergie redirigée par la douleur" },
    "Saturne/Chiron": { theme: "Blessure structurelle", kw: "Limitation karmique, sagesse par l'épreuve" },
    "Jupiter/Chiron": { theme: "Blessure de sens", kw: "Quête de meaning, guérison par la foi" }
};

function getMidpointMeaning(p1, p2) {
    return MIDPOINT_MEANINGS[`${p1}/${p2}`] || MIDPOINT_MEANINGS[`${p2}/${p1}`] || null;
}

const MIDPOINT_MAJOR = ["Soleil","Lune","Mercure","Vénus","Mars","Jupiter","Saturne","Uranus","Neptune","Pluton"];
const MIDPOINT_EXTRA = ["Chiron","Nœud Nord","Nœud Sud"];

function computeRelationalMidpointsV2(planetsA, planetsB, nameA, nameB, housesRefA, housesRefB) {
    const results = [];
    const allNames = [...MIDPOINT_MAJOR, ...MIDPOINT_EXTRA];

    for (let i = 0; i < allNames.length; i++) {
        for (let j = i; j < allNames.length; j++) {
            const p1Name = allNames[i], p2Name = allNames[j];
            const p1A = planetsA.find(p => getPlanetName(p) === p1Name);
            const p2B = planetsB.find(p => getPlanetName(p) === p2Name);
            if (!p1A || !p2B) continue;
            const d1 = getPlanetDegree(p1A), d2 = getPlanetDegree(p2B);
            const mp = midpoint(d1, d2);
            const isHomonyme = (p1Name === p2Name);
            const meaning = isHomonyme ? { theme: `Axe ${p1Name} croisé`, kw: `Centre d'identité ${p1Name} du couple` } : getMidpointMeaning(p1Name, p2Name);

            for (const pCheck of [...planetsA, ...planetsB]) {
                const nCheck = getPlanetName(pCheck);
                if (!isHomonyme && (nCheck === p1Name || nCheck === p2Name)) continue;
                const dCheck = getPlanetDegree(pCheck);
                const diff = absAngularDiff(mp, dCheck);
                if (diff <= 2.0) {
                    const whoCheck = planetsA.includes(pCheck) ? nameA : nameB;
                    const targetHouses = planetsA.includes(pCheck) ? (housesRefA || null) : (housesRefB || null);
                    results.push({
                        midpoint_of: isHomonyme ? `${p1Name}(${nameA})/${p1Name}(${nameB})` : `${p1Name}(${nameA})/${p2Name}(${nameB})`,
                        pair_key: isHomonyme ? `${p1Name}/${p1Name}` : (p1Name < p2Name ? `${p1Name}/${p2Name}` : `${p2Name}/${p1Name}`),
                        degre_midpoint: +mp.toFixed(2),
                        signe_midpoint: signFromDegree(mp),
                        degre90: +((mp % 90).toFixed(2)),
                        activated_by: nCheck,
                        activated_personne: whoCheck,
                        orbe: +diff.toFixed(2),
                        is_homonyme: isHomonyme,
                        maison_midpoint: getHouseNumber(mp, targetHouses || []),
                        maison_activator: getHouseNumber(dCheck, targetHouses || []),
                        theme: meaning?.theme || "",
                        keywords: meaning?.kw || "",
                        description: `Mi-point ${p1Name}/${p2Name} activé par ${nCheck} (${whoCheck})${meaning ? ' — ' + meaning.theme : ''}`
                    });
                }
            }
        }
    }
    return results.sort((a, b) => a.orbe - b.orbe);
}

const midpointsAB = computeRelationalMidpointsV2(natalPlanetsA, natalPlanetsB, persoStrA, persoStrB, natalHousesA, natalHousesB);
const midpointsBA = computeRelationalMidpointsV2(natalPlanetsB, natalPlanetsA, persoStrB, persoStrA, natalHousesB, natalHousesA);
const allMidpoints = [...midpointsAB, ...midpointsBA]
    .map(mp => mp.theme ? mp : { ...mp, theme: `Axe ${mp.pair_key}`, keywords: `Activation du mi-point ${mp.pair_key}` })
    .sort((a, b) => a.orbe - b.orbe);

// Modulus 90° tree + Planetary Pictures
const midpointTree90 = {};
allMidpoints.forEach(mp => {
    const key90 = Math.round(mp.degre90 * 2) / 2;
    if (!midpointTree90[key90]) midpointTree90[key90] = [];
    midpointTree90[key90].push(mp);
});
const NODAL_SET = new Set(["Nœud Nord","Nœud Sud"]);
const planetaryPictures = Object.entries(midpointTree90)
    .map(([deg, mps]) => {
        const meaningful = mps.filter(m => {
            const parts = m.pair_key.split("/");
            return !(NODAL_SET.has(parts[0]) && NODAL_SET.has(parts[1]));
        });
        return { degre90: parseFloat(deg), count: meaningful.length, midpoints: meaningful, signe: signFromDegree(parseFloat(deg)) };
    })
    .filter(pp => pp.count >= 2)
    .sort((a, b) => b.count - a.count);

// ---- 8m. VERTEX / ANTI-VERTEX ----
function calculateVertexDegree(ascDeg, mcDeg) {
    const D2R = Math.PI / 180, R2D = 180 / Math.PI;
    const eps = 23.4393 * D2R;
    const mcRad = mcDeg * D2R;
    const ramc = Math.atan2(Math.sin(mcRad) * Math.cos(eps), Math.cos(mcRad));
    const sinR = Math.sin(ramc), cosR = Math.cos(ramc);
    const tanASC = Math.tan(ascDeg * D2R);
    if (Math.abs(tanASC) < 1e-10) return null;
    const tanLat = (-cosR / tanASC - Math.cos(eps) * sinR) / Math.sin(eps);
    const lat = Math.atan(tanLat);
    const coLat = -(Math.PI / 2 - lat);
    const denom = Math.sin(eps) * Math.tan(coLat) + Math.cos(eps) * sinR;
    if (Math.abs(denom) < 1e-10) return null;
    let vtx = Math.atan2(-cosR, denom) * R2D;
    return ((vtx % 360) + 360) % 360;
}

function computeVertexContacts(planetsSource, planetsTarget, nameSource, nameTarget) {
    const results = [];
    const vertex = planetsTarget.find(p => getPlanetName(p) === "Vertex");
    if (!vertex) return results;
    const vtxDeg = getPlanetDegree(vertex);
    const antiVtxDeg = (vtxDeg + 180) % 360;

    const VTX_ASPECTS = [
        { name: "Conjonction", angle: 0, orb: 3.0, nature: "fusion" },
        { name: "Opposition", angle: 180, orb: 2.5, nature: "tension" },
        { name: "Carré", angle: 90, orb: 2.0, nature: "tension" },
        { name: "Trigone", angle: 120, orb: 2.0, nature: "harmonie" },
        { name: "Sextile", angle: 60, orb: 1.5, nature: "harmonie" }
    ];
    for (const p of planetsSource) {
        const n = getPlanetName(p);
        const deg = getPlanetDegree(p);
        for (const va of VTX_ASPECTS) {
            const diffV = Math.abs(absAngularDiff(deg, vtxDeg) - va.angle);
            if (diffV <= va.orb) {
                results.push({
                    planete: n, personne_planete: nameSource,
                    point: "Vertex", personne_vertex: nameTarget,
                    aspect: va.name, nature: va.nature,
                    orbe: +diffV.toFixed(2), type: va.name.toLowerCase(),
                    description: `${n} (${nameSource}) ${va.name.toLowerCase()} le Vertex de ${nameTarget}`
                });
            }
            const diffAV = Math.abs(absAngularDiff(deg, antiVtxDeg) - va.angle);
            if (diffAV <= va.orb) {
                results.push({
                    planete: n, personne_planete: nameSource,
                    point: "Anti-Vertex", personne_vertex: nameTarget,
                    aspect: va.name, nature: va.nature,
                    orbe: +diffAV.toFixed(2), type: va.name.toLowerCase(),
                    description: `${n} (${nameSource}) ${va.name.toLowerCase()} l'Anti-Vertex de ${nameTarget}`
                });
            }
        }
    }
    return results.sort((a, b) => a.orbe - b.orbe);
}

const _findASC = (arr) => arr.find(p => getPlanetName(p) === "Ascendant");
const _findMC  = (arr) => arr.find(p => { const n = getPlanetName(p); return n === "Milieu du Ciel" || n === "MC"; });

const vtxDegA = calculateVertexDegree(
    getPlanetDegree(_findASC(natalPlanetsA)),
    getPlanetDegree(_findMC(natalPlanetsA))
);
if (vtxDegA !== null) {
    natalPlanetsA.push({ name: "Vertex", fullDegree: vtxDegA, zodiac_sign: { name: { fr: signFromDegree(vtxDegA) } }, isRetro: false, speed: null });
}

const vtxDegB = calculateVertexDegree(
    getPlanetDegree(_findASC(natalPlanetsB)),
    getPlanetDegree(_findMC(natalPlanetsB))
);
if (vtxDegB !== null) {
    natalPlanetsB.push({ name: "Vertex", fullDegree: vtxDegB, zodiac_sign: { name: { fr: signFromDegree(vtxDegB) } }, isRetro: false, speed: null });
}

const vertexContactsAB = computeVertexContacts(natalPlanetsA, natalPlanetsB, persoStrA, persoStrB);
const vertexContactsBA = computeVertexContacts(natalPlanetsB, natalPlanetsA, persoStrB, persoStrA);
const allVertexContacts = [...vertexContactsAB, ...vertexContactsBA];

// ---- 8n. PROFIL DE SENSIBILITÉ CROISÉ ----
const ELEMENT_TRANSIT_MAP = {
    "Feu": ["Mars", "Jupiter"], "Terre": ["Saturne", "Vénus"],
    "Air": ["Uranus", "Mercure"], "Eau": ["Neptune", "Pluton"]
};

function computeCrossSensitivity(statsA, statsB, nameA, nameB) {
    const lines = [];
    const elA = statsA.elements || {}, elB = statsB.elements || {};
    const totalA = Object.values(elA).reduce((a, b) => a + b, 0) || 12;
    const totalB = Object.values(elB).reduce((a, b) => a + b, 0) || 12;

    for (const [element, planets] of Object.entries(ELEMENT_TRANSIT_MAP)) {
        const ratioA = (elA[element] || 0) / totalA;
        const ratioB = (elB[element] || 0) / totalB;
        const planetsStr = planets.join("/");

        if (ratioA <= 0.15 && ratioB >= 0.35) {
            lines.push({ element, type: "vulnerabilite_activation", description: `${nameA} manque de ${element} (${elA[element] || 0}/${totalA}) mais ${nameB} en déborde (${elB[element] || 0}/${totalB}) — ${nameB} active un terrain inconfortable pour ${nameA} via ${planetsStr}` });
        }
        if (ratioB <= 0.15 && ratioA >= 0.35) {
            lines.push({ element, type: "vulnerabilite_activation", description: `${nameB} manque de ${element} (${elB[element] || 0}/${totalB}) mais ${nameA} en déborde (${elA[element] || 0}/${totalA}) — ${nameA} active un terrain inconfortable pour ${nameB} via ${planetsStr}` });
        }
        if (ratioA >= 0.35 && ratioB >= 0.35) {
            lines.push({ element, type: "resonance", description: `Les deux partenaires résonnent en ${element} (${nameA}: ${elA[element] || 0}, ${nameB}: ${elB[element] || 0}) — terrain commun puissant, amplifié` });
        }
    }
    return lines;
}

const crossSensitivity = computeCrossSensitivity(statsA, statsB, persoStrA, persoStrB);

// ---- 8o. SYMBOLES SABÉENS CROISÉS ----
function extractSabianArray(enriched) {
    const raw = enriched.sabianData;
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
        if (raw.symbols && Array.isArray(raw.symbols)) return raw.symbols;
        if (raw.data && Array.isArray(raw.data)) return raw.data;
        return Object.values(raw).filter(v => v && typeof v === "object" && v.planete);
    }
    return [];
}
const sabianA = extractSabianArray(enrichedA);
const sabianB = extractSabianArray(enrichedB);

function computeCrossSabian(sabA, sabB, nameA, nameB) {
    const results = [];
    if (!Array.isArray(sabA) || !Array.isArray(sabB)) return results;
    const keyPlanets = ["Soleil", "Lune", "Ascendant", "MC", "Vénus", "Mars"];

    for (const s of sabA) {
        if (!s || !keyPlanets.includes(s.planete)) continue;
        results.push({ planete: s.planete, personne: nameA, degre: s.degre, signe: s.signe, sabian_deg: s.sabian_deg, symbole: s.symbole || s.symbol || "", keynote: s.keynote || "" });
    }
    for (const s of sabB) {
        if (!s || !keyPlanets.includes(s.planete)) continue;
        results.push({ planete: s.planete, personne: nameB, degre: s.degre, signe: s.signe, sabian_deg: s.sabian_deg, symbole: s.symbole || s.symbol || "", keynote: s.keynote || "" });
    }
    return results;
}

const crossSabian = computeCrossSabian(sabianA, sabianB, persoStrA, persoStrB);

// ---- 8p. THÈME DAVISON (date/lieu mi-chemin) ----
let davisonChart = null;
try {
    const davisonPlanets = $("Planètes Davison").first()?.json;
    const davisonHouses = $("Maisons Davison").first()?.json;
    const davisonMeta = $("Préparation Davison").first()?.json;

    if (davisonPlanets?.output && davisonHouses?.output?.Houses) {
        const dPlanets = Array.isArray(davisonPlanets.output) ? davisonPlanets.output : [];
        const dHouses = Array.isArray(davisonHouses.output.Houses) ? davisonHouses.output.Houses : [];

        const dCuspsRaw = extractCusps(dHouses.map(h => ({ House: h.House, degree: h.degree })));
        const dCusps = dCuspsRaw.map(c => ({ ...c, signe: signFromDegree(c.degree || c.cuspide || 0) }));

        const davPlanetes = dPlanets.map(p => {
            const name = p.planet?.fr || p.planet?.en || "?";
            const deg = p.fullDegree || 0;
            const sign = p.zodiac_sign?.name?.fr || signFromDegree(deg);
            const normDeg = +(deg % 30).toFixed(2);
            const house = getHouseNumber(deg, dHouses.map(h => ({ House: h.House, degree: h.degree })));
            return { planete: name, degre: deg, normDegre: normDeg, signe: sign, maison: house, dignite: getDignity(name, sign) };
        });

        const davAspects = [];
        const davMajors = ["Soleil","Lune","Mercure","Vénus","Mars","Jupiter","Saturne","Uranus","Neptune","Pluton","Chiron"];
        for (let i = 0; i < davPlanetes.length; i++) {
            if (!davMajors.includes(davPlanetes[i].planete)) continue;
            for (let j = i + 1; j < davPlanetes.length; j++) {
                if (!davMajors.includes(davPlanetes[j].planete)) continue;
                const diff = absAngularDiff(davPlanetes[i].degre, davPlanetes[j].degre);
                for (const asp of ASPECTS_DEF) {
                    const ecart = Math.abs(diff - asp.angle);
                    const dOrbMap = { "Conjonction": 8, "Opposition": 7, "Carré": 6, "Trigone": 6, "Sextile": 5, "Quinconce": 3 };
                    const dOrb = dOrbMap[asp.name] || 4;
                    if (ecart <= dOrb) {
                        davAspects.push({
                            planete_1: davPlanetes[i].planete, planete_2: davPlanetes[j].planete,
                            aspect: asp.name, symbol: asp.symbol, nature: asp.nature,
                            orbe: +ecart.toFixed(2)
                        });
                    }
                }
            }
        }

        davisonChart = {
            planetes: davPlanetes,
            aspects: davAspects,
            maisons: dCusps,
            meta: davisonMeta || {},
            configurations: detectCompositeConfigurations(davPlanetes)
        };
    }
} catch (e) {
    davisonChart = null;
}

// ---- 8q. SCORE DE COMPATIBILITÉ GLOBAL v3 — Architecture 4 Piliers + Pénalités ----

const LUMINAIRE_SET = new Set(["Soleil","Lune"]);
const PERSONAL_PLANETS = new Set(["Soleil","Lune","Mercure","Vénus","Mars"]);
const SOCIAL_PLANETS = new Set(["Jupiter","Saturne"]);
const TRANS_PERSONAL = new Set(["Uranus","Neptune","Pluton"]);
const ANGLES_SET = new Set(["Ascendant","Descendant","MC","Milieu du Ciel","Imum Coeli"]);

function computeGlobalScoreV3(ctx) {
    const {
        aspects1, aspects2, nodal, receptions, decl, antis,
        starBridges, vertexC, midpoints, crossParans, planetaryPics,
        compositeAsp, compositeConf, davisonAsp, davisonConf,
        elemCompat, crossSens, crossDisp, stationary, oob, hayz,
        chartRulerA: crA, chartRulerB: crB, accDigA, accDigB,
        typoConf, planetsA, planetsB, housesA, housesB, statsA: sA, statsB: sB,
        overlayBinA: ovBA, overlayAinB: ovAB,
        aspectsT2_1, aspectsT2_2, compositePlanetes: compPlanets,
        houseTSBinA: tsBinA, houseTSAinB: tsAinB,
        nhriA: _nhriA, nhriB: _nhriB,
        houseRulersA: _hrA, houseRulersB: _hrB,
        nameA, nameB
    } = ctx;

    const detail = { pilier1: {}, pilier2: {}, pilier3: {}, pilier4: {}, penalties: {} };
    const penalties = { p1: [], p2: [], p3: [], p4: [] };
    const bonuses = { p1: [], p2: [], p3: [], p4: [] };

    // Lookup rétrogrades pour modulation
    const _retroSet = new Set();
    for (const p of [...(planetsA || []), ...(planetsB || [])]) {
        if (getPlanetRetro(p)) _retroSet.add(getPlanetName(p));
    }

    // Lookup vitesse pour stationnaire — min des deux thèmes pour détecter la station dans l'un OU l'autre
    const _speedMap = {};
    for (const p of [...(planetsA || []), ...(planetsB || [])]) {
        const n = getPlanetName(p);
        if (p.vitesse_longitude !== undefined) {
            const spd = Math.abs(p.vitesse_longitude);
            _speedMap[n] = _speedMap[n] !== undefined ? Math.min(_speedMap[n], spd) : spd;
        }
    }

    const allAsp_raw = [...(aspects1 || []), ...(aspects2 || [])];
    const _aspSeen = new Set();
    const allAsp = allAsp_raw.filter(a => {
        const k = [a.planete_source, a.planete_cible].sort().join("|") + "|" + (a.aspect || "");
        if (_aspSeen.has(k)) return false;
        _aspSeen.add(k);
        return true;
    });
    const BENEFIC_CONJ = new Set(["Vénus","Jupiter","Soleil","Lune"]);
    const MALEFIC_CONJ = new Set(["Saturne","Pluton","Mars"]);

    function tierWeight(a) {
        const maxT = a.tier_max || Math.max(a.tier_source || 3, a.tier_cible || 3);
        if (maxT <= 1) return 1.0;
        if (maxT === 2) return 0.65;
        return 0.35;
    }

    function aspKey(a) {
        return [a.planete_source, a.planete_cible].sort().join("|") + "|" + a.aspect;
    }

    // ── Helpers affinité élémentaire (utilisés dans P1 ET P4) ──
    const _SIGN_EL = {"Bélier":"Feu","Lion":"Feu","Sagittaire":"Feu","Taureau":"Terre","Vierge":"Terre","Capricorne":"Terre","Gémeaux":"Air","Balance":"Air","Verseau":"Air","Cancer":"Eau","Scorpion":"Eau","Poissons":"Eau"};
    const _SIGN_ORD = ["Bélier","Taureau","Gémeaux","Cancer","Lion","Vierge","Balance","Scorpion","Sagittaire","Capricorne","Verseau","Poissons"];
    const _EL_COMPAT = {"Feu":"Air","Air":"Feu","Terre":"Eau","Eau":"Terre"};

    function _findSign(name, pArr) {
        const alt = name === "MC" ? "Milieu du Ciel" : name;
        const p = (pArr || []).find(pp => { const n = getPlanetName(pp); return n === name || n === alt; });
        return p ? getPlanetSign(p) : null;
    }

    function _elemAffinity(signA, signB) {
        if (!signA || !signB) return { cat: "unknown", mBon: 1.0, mPen: 1.0, mAbs: 1.0 };
        const elA = _SIGN_EL[signA], elB = _SIGN_EL[signB];
        if (!elA || !elB) return { cat: "unknown", mBon: 1.0, mPen: 1.0, mAbs: 1.0 };
        const iA = _SIGN_ORD.indexOf(signA), iB = _SIGN_ORD.indexOf(signB);
        const diff = Math.abs(iA - iB);
        if (diff === 1 || diff === 11) return { cat: "aversion", mBon: 0.85, mPen: 1.2, mAbs: 1.5 };
        if (elA === elB) return { cat: "same_element", mBon: 1.2, mPen: 0.85, mAbs: 0.5 };
        if (_EL_COMPAT[elA] === elB) return { cat: "compatible", mBon: 1.1, mPen: 0.9, mAbs: 0.7 };
        return { cat: "incompatible", mBon: 0.9, mPen: 1.15, mAbs: 1.3 };
    }

    function _crossPairAff(pNameX, pNameY) {
        const sXA = _findSign(pNameX, planetsA), sYB = _findSign(pNameY, planetsB);
        const sXB = _findSign(pNameX, planetsB), sYA = _findSign(pNameY, planetsA);
        const aff1 = _elemAffinity(sXA, sYB);
        const aff2 = _elemAffinity(sXB, sYA);
        return {
            mPen: Math.max(aff1.mPen, aff2.mPen),
            mBon: Math.min(aff1.mBon, aff2.mBon),
            mAbs: Math.max(aff1.mAbs, aff2.mAbs),
            cat: aff1.cat === aff2.cat ? aff1.cat : `${aff1.cat}/${aff2.cat}`,
            signs: `${sXA||'?'}/${sYB||'?'}·${sXB||'?'}/${sYA||'?'}`
        };
    }

    // v4.0 — NATAL_IMPORTANCE (portage PREV) : pondération structurelle des planètes natales
    const _natalImportanceA = {}, _natalImportanceB = {};
    const _LUMSET = new Set(["Soleil","Lune"]);
    function _computeNatalImportance(planets, houses, chartRuler, accDig, outMap) {
        const angularHouses = new Set([1, 4, 7, 10]);
        const _getH = (deg) => {
            if (!houses || houses.length < 12) return 0;
            for (let i = 0; i < 12; i++) {
                const cStart = typeof houses[i] === 'object' ? houses[i].degree : houses[i];
                const cEnd = typeof houses[(i+1)%12] === 'object' ? houses[(i+1)%12].degree : houses[(i+1)%12];
                let s = cStart, e = cEnd; if (e < s) e += 360;
                let d = deg; if (d < s) d += 360;
                if (d >= s && d < e) return i + 1;
            }
            return 1;
        };
        for (const p of planets) {
            const name = getPlanetName(p);
            if (!PLANETS_MAJEURS.includes(name) && name !== "Chiron") continue;
            let imp = 0;
            if (name === chartRuler) imp += 3;
            if (_LUMSET.has(name)) imp += 1;
            const h = _getH(getPlanetDegree(p));
            if (angularHouses.has(h)) imp += 2;
            const ad = (accDig || []).find(d => d.planet === name);
            if (ad) {
                if (ad.score > 8) imp += 2;
                else if (ad.score > 3) imp += 1;
            }
            outMap[name] = imp;
        }
    }
    _computeNatalImportance(planetsA || [], housesA || [], crA, accDigA, _natalImportanceA);
    _computeNatalImportance(planetsB || [], housesB || [], crB, accDigB, _natalImportanceB);

    // ====== PILIER 1 : Qualité Aspectuelle (0–35) ======
    const allT2 = [...(aspectsT2_1 || []), ...(aspectsT2_2 || [])];
    const OOB_SET = new Set((oob || []).map(o => o.planet || o.planete));

    const isTransTransAspect = (a) => TRANS_PERSONAL.has(a.planete_source) && TRANS_PERSONAL.has(a.planete_cible);

    function dignityPenaltyMult(asp) {
        const dSrc = asp.dignite_full_source?.primary;
        const dCib = asp.dignite_full_cible?.primary;
        const srcStrong = dSrc === "Domicile" || dSrc === "Exaltation";
        const srcWeak = dSrc === "Exil" || dSrc === "Chute";
        const cibStrong = dCib === "Domicile" || dCib === "Exaltation";
        const cibWeak = dCib === "Exil" || dCib === "Chute";
        if (srcStrong && cibWeak) return 1.35;
        if (srcStrong || cibWeak) return 1.18;
        if (srcWeak && cibStrong) return 0.85;
        return 1.0;
    }

    if (allAsp.length === 0 && allT2.length === 0) {
        detail.pilier1 = { total: 17.5, ratio: 0.5, note: "Aucun aspect — score neutre" };
    } else {
        let positiveW = 0, negativeW = 0;

        const typoLbl = (typoConf?.label_fr || "").toLowerCase();
        const isParentChildCtx = typoLbl.includes("parent") || typoLbl.includes("enfant");

        for (const a of allAsp) {
            const baseScore = (a.applying_mult && a.applying_mult !== 1) ? Math.round(a.score / a.applying_mult * 10) / 10 : (a.score || 0);
            let w = Math.min(baseScore, 20) * tierWeight(a);
            if (isTransTransAspect(a)) w *= 0.35;
            if (isParentChildCtx) {
                if (a.applying === true) w *= 1.08;
                else if (a.applying === false) w *= 0.95;
            } else {
                if (a.applying === true) w *= 1.15;
                else if (a.applying === false) w *= 0.90;
            }
            if (a.exact) w *= 1.20;
            if (OOB_SET.has(a.planete_source) || OOB_SET.has(a.planete_cible)) w *= 1.10;

            // Modulation rétrogradation : planètes rétrogrades internalisent l'énergie
            const srcRetro = _retroSet.has(a.planete_source);
            const cibRetro = _retroSet.has(a.planete_cible);
            if (srcRetro || cibRetro) {
                if (a.nature === "tension" || a.nature === "ajustement") w *= (srcRetro && cibRetro) ? 1.20 : 1.10;
                else if (a.nature === "harmonie") w *= (srcRetro && cibRetro) ? 0.85 : 0.92;
            }

            // Modulation stationnaire : planète quasi-immobile = impact décuplé
            const srcSpeed = _speedMap[a.planete_source];
            const cibSpeed = _speedMap[a.planete_cible];
            const srcStationary = srcSpeed !== undefined && srcSpeed < 0.02;
            const cibStationary = cibSpeed !== undefined && cibSpeed < 0.02;
            if (srcStationary || cibStationary) {
                if (a.nature === "tension") w *= 1.25;
                else if (a.nature === "harmonie" || a.nature === "fusion") w *= 1.15;
            }

            const SLOW_PLANETS = new Set(["Jupiter","Saturne","Uranus","Neptune","Pluton","Chiron"]);
            const srcSlow = SLOW_PLANETS.has(a.planete_source);
            const cibSlow = SLOW_PLANETS.has(a.planete_cible);
            if (srcSlow && cibSlow) w *= 0.65;
            else if (srcSlow || cibSlow) w *= 1.08;

            // v4.0 — Importance structurelle natale (portage PREV) : max des deux thèmes pour chaque planète
            const _impSrc = Math.max(_natalImportanceA[a.planete_source] ?? 0, _natalImportanceB[a.planete_source] ?? 0);
            const _impCib = Math.max(_natalImportanceA[a.planete_cible] ?? 0, _natalImportanceB[a.planete_cible] ?? 0);
            const _impAvg = (_impSrc + _impCib) / 2;
            if (_impAvg >= 5) w *= 1.08;
            else if (_impAvg >= 3) w *= 1.04;

            const dignSrc = a.dignite_full_source;
            const dignCib = a.dignite_full_cible;
            const hasDomExaSrc = dignSrc && (dignSrc.primary === "Domicile" || dignSrc.primary === "Exaltation");
            const hasDomExaCib = dignCib && (dignCib.primary === "Domicile" || dignCib.primary === "Exaltation");
            const hasExilChuteSrc = dignSrc && (dignSrc.primary === "Exil" || dignSrc.primary === "Chute");
            const hasExilChuteCib = dignCib && (dignCib.primary === "Exil" || dignCib.primary === "Chute");

            if (a.nature === "harmonie") {
                if (hasDomExaSrc || hasDomExaCib) w *= 1.12;
                if (hasExilChuteSrc && hasExilChuteCib) w *= 0.85;
                positiveW += w;
            } else if (a.nature === "tension") {
                if (hasDomExaSrc && hasExilChuteCib) w *= 1.35;
                else if (hasDomExaSrc || hasExilChuteCib) w *= 1.20;
                else if (hasExilChuteSrc && hasDomExaCib) w *= 0.85;
                else if (hasDomExaCib) w *= 1.05;
                negativeW += w;
            } else if (a.nature === "fusion") {
                const src = a.planete_source, cib = a.planete_cible;
                const isBeneficConj = BENEFIC_CONJ.has(src) || BENEFIC_CONJ.has(cib);
                const isMaleficConj = MALEFIC_CONJ.has(src) && MALEFIC_CONJ.has(cib);
                if (isMaleficConj) {
                    const malMult = (hasDomExaSrc || hasDomExaCib) ? 1.25 : 1.0;
                    positiveW += w * 0.2;
                    negativeW += w * 0.3 * malMult;
                } else if (isBeneficConj) {
                    const benMult = (hasDomExaSrc || hasDomExaCib) ? 1.10 : 1.0;
                    positiveW += w * 0.85 * benMult;
                } else {
                    positiveW += w * 0.6;
                }
            } else if (a.nature === "ajustement") {
                negativeW += w * 0.35;
            }
        }

        // Tier 2 contribution (Lots/Astéroïdes) — 30% du poids T1
        for (const a of allT2) {
            let w = Math.min(a.score || 0, 15) * 0.30;
            if (a.applying === true) w *= 1.10;
            if (OOB_SET.has(a.planete_source) || OOB_SET.has(a.planete_cible)) w *= 1.08;

            if (a.nature === "harmonie") positiveW += w;
            else if (a.nature === "tension") negativeW += w;
            else if (a.nature === "fusion") positiveW += w * 0.55;
            else if (a.nature === "ajustement") negativeW += w * 0.3;
        }

        const totalW = positiveW + negativeW || 1;
        const ratio = positiveW / totalW;
        const exactBonusT1 = allAsp.filter(a => a.exact && (a.nature === "harmonie" || a.nature === "fusion")).length;
        const exactBonusT1Personal = allAsp.filter(a =>
            a.exact && (a.nature === "harmonie" || a.nature === "fusion") &&
            (PERSONAL_PLANETS.has(a.planete_source) || PERSONAL_PLANETS.has(a.planete_cible))
        ).length;

        // v4.2.x (B8 abandonné) : la simulation à froid prédisait +4.3 pts
        // strict en libérant les caps de exact_bonus (8→12 et 4→6) car ce
        // sous-composant a Cohen d=0.88 (vs ratio à d=0.13). Mais en réel sur
        // n=62 : 6 cas montent (+0.7 pts en moyenne sur global_score) sans
        // gain de discrimination → 3 cas borderline (Bezos/Buffett, Dali/
        // Chanel, Freud/Jung) basculent à tort moyen→fort par les seuils
        // rigides. Cohérence stricte 45.7%→41.3%. Voir SYN-FIABILITE-RAPPORT
        // §11. Caps remis à v4.2.0.
        let p1 = 10 + ratio * 20;
        p1 += Math.min(exactBonusT1, 8) * 0.5;
        p1 += Math.min(exactBonusT1Personal, 4) * 0.3;

        const stationaryInAsp = (stationary || []).filter(sp =>
            allAsp.some(a => a.planete_source === sp.planet || a.planete_cible === sp.planet)
        );
        // Stationary modulation now handled per-aspect in the main loop above
        const retroInAsp = allAsp.filter(a => _retroSet.has(a.planete_source) || _retroSet.has(a.planete_cible));
        detail.pilier1.retro_in_aspects = retroInAsp.length;

        detail.pilier1.tier2_count = allT2.length;
        detail.pilier1.oob_in_aspects = allAsp.filter(a => OOB_SET.has(a.planete_source) || OOB_SET.has(a.planete_cible)).length;

        // P1-PENALTY: Saturne hard aspects to luminaries/personal planets
        const saturnHardPersonal = allAsp.filter(a =>
            a.nature === "tension" &&
            ((a.planete_source === "Saturne" && PERSONAL_PLANETS.has(a.planete_cible)) ||
             (a.planete_cible === "Saturne" && PERSONAL_PLANETS.has(a.planete_source)))
        );
        if (saturnHardPersonal.length >= 2) {
            const dMult = Math.max(...saturnHardPersonal.map(dignityPenaltyMult));
            const pen = Math.min(saturnHardPersonal.length, 4) * 0.8 * dMult;
            p1 -= pen;
            penalties.p1.push({ id: "saturn_hard_personal", count: saturnHardPersonal.length, dignity_mult: +dMult.toFixed(2), malus: +(-pen).toFixed(1) });
        }

        // P1-PENALTY: Venus-Mars exact square/opposition (+ modulation élémentaire)
        const venusMarsHard = allAsp.filter(a =>
            a.nature === "tension" && a.orbe < 3 &&
            ((a.planete_source === "Vénus" && a.planete_cible === "Mars") ||
             (a.planete_source === "Mars" && a.planete_cible === "Vénus"))
        );
        if (venusMarsHard.length > 0) {
            const dMult = Math.max(...venusMarsHard.map(dignityPenaltyMult));
            const eAff = _crossPairAff("Vénus", "Mars");
            const pen = (venusMarsHard.some(a => a.exact) ? 1.5 : 0.8) * dMult * eAff.mPen;
            p1 -= pen;
            penalties.p1.push({ id: "venus_mars_hard", count: venusMarsHard.length, dignity_mult: +dMult.toFixed(2), elem: eAff.cat, signs: eAff.signs, malus: +(-pen).toFixed(1) });
        }

        // P1-PENALTY: Neptune hard aspects on angles/personal planets
        const neptuneHard = allAsp.filter(a =>
            a.nature === "tension" &&
            ((a.planete_source === "Neptune" && (PERSONAL_PLANETS.has(a.planete_cible) || ANGLES_SET.has(a.planete_cible))) ||
             (a.planete_cible === "Neptune" && (PERSONAL_PLANETS.has(a.planete_source) || ANGLES_SET.has(a.planete_source))))
        );
        if (neptuneHard.length >= 2) {
            const dMult = Math.max(...neptuneHard.map(dignityPenaltyMult));
            const pen = Math.min(neptuneHard.length, 3) * 0.6 * dMult;
            p1 -= pen;
            penalties.p1.push({ id: "neptune_hard_personal_angles", count: neptuneHard.length, dignity_mult: +dMult.toFixed(2), malus: +(-pen).toFixed(1) });
        }

        // P1-PENALTY: Pluton tension on personal planets (power dynamics, manipulation, obsession)
        const plutonHardPersonal = allAsp.filter(a =>
            a.nature === "tension" &&
            ((a.planete_source === "Pluton" && PERSONAL_PLANETS.has(a.planete_cible)) ||
             (a.planete_cible === "Pluton" && PERSONAL_PLANETS.has(a.planete_source)))
        );
        if (plutonHardPersonal.length >= 1) {
            const dMult = Math.max(...plutonHardPersonal.map(dignityPenaltyMult));
            // v5.0.0 — cap relevé 4 → 6 (aspect le plus destructeur en synastrie)
            const pen = Math.min(plutonHardPersonal.length, 6) * 0.9 * dMult;
            p1 -= pen;
            penalties.p1.push({ id: "pluton_hard_personal", count: plutonHardPersonal.length, dignity_mult: +dMult.toFixed(2), malus: +(-pen).toFixed(1) });
        }

        // P1-PENALTY: Mars tension on luminaries (aggression, anger toward identity/emotions)
        const marsHardLuminaires = allAsp.filter(a =>
            a.nature === "tension" &&
            ((a.planete_source === "Mars" && LUMINAIRE_SET.has(a.planete_cible)) ||
             (a.planete_cible === "Mars" && LUMINAIRE_SET.has(a.planete_source)))
        );
        if (marsHardLuminaires.length >= 1) {
            const dMult = Math.max(...marsHardLuminaires.map(dignityPenaltyMult));
            // v5.0.0 — cap relevé 3 → 4, facteur 0.7 → 0.8 (agression contre identité/émotions)
            const pen = Math.min(marsHardLuminaires.length, 4) * 0.8 * dMult;
            p1 -= pen;
            penalties.p1.push({ id: "mars_hard_luminaires", count: marsHardLuminaires.length, dignity_mult: +dMult.toFixed(2), malus: +(-pen).toFixed(1) });
        }

        // P1-PENALTY: Uranus tension on Venus/Moon (instability, disruption of emotional/affective bond)
        const uranusHardAffective = allAsp.filter(a =>
            a.nature === "tension" &&
            ((a.planete_source === "Uranus" && (a.planete_cible === "Vénus" || a.planete_cible === "Lune")) ||
             (a.planete_cible === "Uranus" && (a.planete_source === "Vénus" || a.planete_source === "Lune")))
        );
        if (uranusHardAffective.length >= 1) {
            const dMult = Math.max(...uranusHardAffective.map(dignityPenaltyMult));
            // v5.0.0 — cap relevé 3 → 4, facteur 0.6 → 0.7 (rupture du lien affectif)
            const pen = Math.min(uranusHardAffective.length, 4) * 0.7 * dMult;
            p1 -= pen;
            penalties.p1.push({ id: "uranus_hard_affective", count: uranusHardAffective.length, dignity_mult: +dMult.toFixed(2), malus: +(-pen).toFixed(1) });
        }

        // P1-PENALTY: No harmonious Venus cross-aspects at all (absence of pleasure/attraction bond)
        const venusSoftCross = allAsp.filter(a =>
            (a.nature === "harmonie" || a.nature === "fusion") &&
            (a.planete_source === "Vénus" || a.planete_cible === "Vénus")
        );
        if (venusSoftCross.length === 0) {
            const pen = 1.5;
            p1 -= pen;
            penalties.p1.push({ id: "no_venus_soft_cross", malus: +(-pen).toFixed(1) });
        }

        // P1-BONUS/PENALTY: Double-whammy (same pair in both directions)
        const normalizeAxisName = (name) => {
            if (name === "Imum Coeli") return "Milieu du Ciel";
            if (name === "Descendant") return "Ascendant";
            if (name === "Nœud Sud") return "Nœud Nord";
            return name;
        };
        const aspByPairAll = {};
        for (const a of allAsp_raw) {
            const pair = [normalizeAxisName(a.planete_source), normalizeAxisName(a.planete_cible)].sort().join("|");
            if (!aspByPairAll[pair]) aspByPairAll[pair] = [];
            aspByPairAll[pair].push(a);
        }
        let doubleWhammyTCount = 0, doubleWhammyHCount = 0;
        const dwHarmonyPairs = [];
        for (const pair of Object.keys(aspByPairAll)) {
            const group = aspByPairAll[pair];
            const hasBothDirs = group.some(a => a.source_personne !== group[0].source_personne);
            if (!hasBothDirs || group.length < 2) continue;
            const hasHarmony = group.some(a => a.nature === "harmonie" || a.nature === "fusion");
            const hasTension = group.some(a => a.nature === "tension");
            if (hasTension) doubleWhammyTCount++;
            if (hasHarmony) {
                doubleWhammyHCount++;
                const harmAsp = group.filter(a => a.nature === "harmonie" || a.nature === "fusion");
                dwHarmonyPairs.push({ pair, aspects: harmAsp.map(a => `${a.planete_source} ${a.aspect} ${a.planete_cible}`) });
            }
        }
        if (doubleWhammyTCount > 0) {
            // v5.0.0 — cap relevé 3 → 5 (en cas de DW tension >> harmonie, signal critique)
            const pen = Math.min(doubleWhammyTCount, 5) * 1.0;
            p1 -= pen;
            penalties.p1.push({ id: "double_whammy_tension", count: doubleWhammyTCount, malus: -pen });
        }
        if (doubleWhammyHCount > 0) {
            const bon = Math.min(doubleWhammyHCount, 5) * 0.8;
            p1 += bon;
            detail.pilier1.double_whammy_harmony = doubleWhammyHCount;
            detail.pilier1.double_whammy_harmony_bonus = +bon.toFixed(1);
            detail.pilier1.double_whammy_harmony_pairs = dwHarmonyPairs;
        }

        // P1-PENALTY: Mars-Pluton conjunction cross-chart (+ modulation élémentaire)
        const marsPlutoConj = allAsp.filter(a =>
            a.nature === "fusion" &&
            ((a.planete_source === "Mars" && a.planete_cible === "Pluton") ||
             (a.planete_source === "Pluton" && a.planete_cible === "Mars"))
        );
        if (marsPlutoConj.length > 0) {
            const eAff = _crossPairAff("Mars", "Pluton");
            const pen = (marsPlutoConj.some(a => a.exact) ? 1.5 : 1.0) * eAff.mPen;
            p1 -= pen;
            penalties.p1.push({ id: "mars_pluton_conj_cross", count: marsPlutoConj.length, elem: eAff.cat, signs: eAff.signs, malus: +(-pen).toFixed(1) });
        }

        // P1-PENALTY: Soleil carré Lune croisé (+ modulation élémentaire)
        const soleilLuneHard = allAsp.filter(a =>
            a.nature === "tension" &&
            ((a.planete_source === "Soleil" && a.planete_cible === "Lune") ||
             (a.planete_source === "Lune" && a.planete_cible === "Soleil"))
        );
        if (soleilLuneHard.length > 0) {
            const eAff = _crossPairAff("Soleil", "Lune");
            const pen = (soleilLuneHard.some(a => a.aspect === "Opposition") ? 1.2 : 0.8) * eAff.mPen;
            p1 -= pen;
            penalties.p1.push({ id: "soleil_lune_hard_cross", count: soleilLuneHard.length, elem: eAff.cat, signs: eAff.signs, malus: +(-pen).toFixed(1) });
        }

        // P1-PENALTY: Double malefic conjunction (both planets in exil/chute)
        const doubleMalConj = allAsp.filter(a => {
            if (a.nature !== "fusion") return false;
            const src = a.planete_source, cib = a.planete_cible;
            if (!MALEFIC_CONJ.has(src) || !MALEFIC_CONJ.has(cib)) return false;
            const exSrc = a.dignite_full_source && (a.dignite_full_source.primary === "Exil" || a.dignite_full_source.primary === "Chute");
            const exCib = a.dignite_full_cible && (a.dignite_full_cible.primary === "Exil" || a.dignite_full_cible.primary === "Chute");
            return exSrc && exCib;
        });
        if (doubleMalConj.length > 0) {
            const pen = doubleMalConj.length * 1.2;
            p1 -= pen;
            penalties.p1.push({ id: "double_malefic_conj_debilitated", count: doubleMalConj.length, malus: -pen });
        }

        // P1-PENALTY: Poisoned fusions (conj with planet in Exil/Chute) — weighted by planet nature
        const poisonedFusions = allAsp.filter(a => {
            if (a.nature !== "fusion") return false;
            const dSrc = a.dignite_full_source?.primary;
            const dCib = a.dignite_full_cible?.primary;
            const srcBad = dSrc === "Exil" || dSrc === "Chute";
            const cibBad = dCib === "Exil" || dCib === "Chute";
            return srcBad || cibBad;
        });
        if (poisonedFusions.length >= 2) {
            let pen = 0;
            for (const pf of poisonedFusions.slice(0, 5)) {
                const badPlanet = (pf.dignite_full_source?.primary === "Exil" || pf.dignite_full_source?.primary === "Chute") ? pf.planete_source : pf.planete_cible;
                if (badPlanet === "Mars" || badPlanet === "Saturne" || badPlanet === "Pluton") pen += 0.6;
                else if (badPlanet === "Neptune") pen += 0.4;
                else pen += 0.35;
            }
            p1 -= pen;
            penalties.p1.push({ id: "poisoned_fusions_debilitated", count: poisonedFusions.length, malus: +(-pen).toFixed(1) });
        }

        // P1-PENALTY: Neptune in Fall/Exile on angle (ASC/DSC/MC/IC)
        const neptFallAngle = allAsp.filter(a => {
            const isNept = a.planete_source === "Neptune" || a.planete_cible === "Neptune";
            if (!isNept) return false;
            const isAngle = ANGLES_SET.has(a.planete_source) || ANGLES_SET.has(a.planete_cible);
            if (!isAngle) return false;
            const neptDig = a.planete_source === "Neptune" ? a.dignite_full_source?.primary : a.dignite_full_cible?.primary;
            return neptDig === "Chute" || neptDig === "Exil";
        });
        if (neptFallAngle.length > 0) {
            const pen = Math.min(neptFallAngle.length, 2) * 0.8;
            p1 -= pen;
            penalties.p1.push({ id: "neptune_fall_on_angle", count: neptFallAngle.length, malus: +(-pen).toFixed(1) });
        }

        // P1-BONUS: Soleil-Lune soft cross-aspect (+ modulation élémentaire)
        const soleilLuneSoftP1 = allAsp.filter(a =>
            (a.nature === "harmonie" || a.nature === "fusion") &&
            ((a.planete_source === "Soleil" && a.planete_cible === "Lune") ||
             (a.planete_source === "Lune" && a.planete_cible === "Soleil"))
        );
        if (soleilLuneSoftP1.length > 0) {
            const eAff = _crossPairAff("Soleil", "Lune");
            const bon = (soleilLuneSoftP1.some(a => a.exact) ? 1.5 : 1.0) * eAff.mBon;
            p1 += bon;
            detail.pilier1.soleil_lune_soft_bonus = +bon.toFixed(2);
            detail.pilier1.soleil_lune_elem = eAff.cat;
        }

        // P1-PENALTY: Mars-Saturne hard cross (+ modulation élémentaire)
        const marsSatHardCross = allAsp.filter(a =>
            a.nature === "tension" &&
            ((a.planete_source === "Mars" && a.planete_cible === "Saturne") ||
             (a.planete_source === "Saturne" && a.planete_cible === "Mars"))
        );
        if (marsSatHardCross.length > 0) {
            const eAff = _crossPairAff("Mars", "Saturne");
            const pen = (marsSatHardCross.some(a => a.exact) ? 1.8 : 1.2) * eAff.mPen;
            p1 -= pen;
            penalties.p1.push({ id: "mars_saturne_hard_cross", count: marsSatHardCross.length, elem: eAff.cat, signs: eAff.signs, malus: +(-pen).toFixed(1) });
        }

        // P1-BONUS: Venus-Jupiter soft (+ modulation élémentaire)
        const venusJupiterSoft = allAsp.filter(a =>
            (a.nature === "harmonie" || a.nature === "fusion") &&
            ((a.planete_source === "Vénus" && a.planete_cible === "Jupiter") ||
             (a.planete_source === "Jupiter" && a.planete_cible === "Vénus"))
        );
        if (venusJupiterSoft.length > 0) {
            const eAff = _crossPairAff("Vénus", "Jupiter");
            const bon = (venusJupiterSoft.some(a => a.exact) ? 1.5 : 1.0) * eAff.mBon;
            p1 += bon;
            detail.pilier1.venus_jupiter_soft_bonus = +bon.toFixed(2);
            detail.pilier1.venus_jupiter_elem = eAff.cat;
        }

        const lilithMarsConj = allAsp.filter(a =>
            a.nature === "fusion" &&
            ((a.planete_source === "Lilith" && a.planete_cible === "Mars") ||
             (a.planete_source === "Mars" && a.planete_cible === "Lilith"))
        );
        if (lilithMarsConj.length > 0) {
            const pen = 0.8;
            p1 -= pen;
            penalties.p1.push({ id: "lilith_mars_conj_cross", count: lilithMarsConj.length, malus: -pen });
        }

        // P1-MODULATION: Typology-aware aspect reinterpretation
        const typoLabel = (typoConf?.label_fr || "").toLowerCase();
        const isParentChild = typoLabel.includes("parent") || typoLabel.includes("enfant");
        const isMentorship = typoLabel.includes("mentor");

        if (isParentChild || isMentorship) {
            // Saturn-NN conj/trine = structure toward destiny → bonus in parent-child
            const satNNPositive = allAsp.filter(a =>
                (a.nature === "fusion" || a.nature === "harmonie") &&
                ((a.planete_source === "Saturne" && (a.planete_cible === "Nœud Nord" || a.planete_cible === "Nœud Sud")) ||
                 (a.planete_cible === "Saturne" && (a.planete_source === "Nœud Nord" || a.planete_source === "Nœud Sud")))
            );
            if (satNNPositive.length > 0) {
                const bon = Math.min(satNNPositive.length, 2) * 0.5;
                p1 += bon;
                detail.pilier1.typo_saturn_nn_bonus = +bon.toFixed(1);
            }
            // Reduce saturn_hard_personal penalty by 15% in parent-child context
            const satPen = penalties.p1.find(p => p.id === "saturn_hard_personal");
            if (satPen) {
                const relief = Math.abs(satPen.malus) * 0.15;
                p1 += relief;
                detail.pilier1.typo_saturn_relief = +relief.toFixed(1);
            }
        }

        // P1-BONUS: Chiron harmonique with transpersonal (healing archetype)
        const chironHarmonicTrans = allAsp.filter(a =>
            (a.nature === "harmonie" || a.nature === "fusion") &&
            ((a.planete_source === "Chiron" && TRANS_PERSONAL.has(a.planete_cible)) ||
             (a.planete_cible === "Chiron" && TRANS_PERSONAL.has(a.planete_source)))
        );
        if (chironHarmonicTrans.length > 0) {
            const bon = Math.min(chironHarmonicTrans.length, 2) * 0.3;
            p1 += bon;
            detail.pilier1.chiron_harmonic_trans = chironHarmonicTrans.length;
        }

        // P1-L5: Vénus-Lune harmonique croisé (+ modulation élémentaire)
        const venusLuneSoft = allAsp.filter(a =>
            (a.nature === "harmonie" || a.nature === "fusion") &&
            ((a.planete_source === "Vénus" && a.planete_cible === "Lune") ||
             (a.planete_source === "Lune" && a.planete_cible === "Vénus"))
        );
        if (venusLuneSoft.length > 0) {
            const eAff = _crossPairAff("Vénus", "Lune");
            const bon = (venusLuneSoft.some(a => a.exact) ? 1.2 : 0.8) * eAff.mBon;
            p1 += bon;
            detail.pilier1.venus_lune_soft_bonus = +bon.toFixed(2);
            detail.pilier1.venus_lune_elem = eAff.cat;
        }

        // P1-L1: Contacts aux Axes — bonus pour planètes personnelles conj/trigone ASC/DSC/MC/IC
        const AXIS_NAMES = new Set(["Ascendant", "Descendant", "MC", "Milieu du Ciel", "Imum Coeli"]);
        const axisContactsSoft = allAsp.filter(a => {
            const srcIsPersonal = PERSONAL_PLANETS.has(a.planete_source);
            const cibIsPersonal = PERSONAL_PLANETS.has(a.planete_cible);
            const srcIsAxis = AXIS_NAMES.has(a.planete_source);
            const cibIsAxis = AXIS_NAMES.has(a.planete_cible);
            if (!((srcIsPersonal && cibIsAxis) || (cibIsPersonal && srcIsAxis))) return false;
            return a.nature === "harmonie" || a.nature === "fusion";
        });
        const axisContactsHard = allAsp.filter(a => {
            const srcIsPersonal = PERSONAL_PLANETS.has(a.planete_source);
            const cibIsPersonal = PERSONAL_PLANETS.has(a.planete_cible);
            const srcIsAxis = AXIS_NAMES.has(a.planete_source);
            const cibIsAxis = AXIS_NAMES.has(a.planete_cible);
            if (!((srcIsPersonal && cibIsAxis) || (cibIsPersonal && srcIsAxis))) return false;
            return a.nature === "tension";
        });
        if (axisContactsSoft.length > 0) {
            const conjCount = axisContactsSoft.filter(a => a.aspect === "Conjonction").length;
            const bon = Math.min(conjCount, 3) * 0.6 + Math.min(axisContactsSoft.length - conjCount, 4) * 0.3;
            p1 += bon;
            detail.pilier1.axis_soft_contacts = axisContactsSoft.length;
            detail.pilier1.axis_soft_bonus = +bon.toFixed(1);
        }
        if (axisContactsHard.length >= 2) {
            const pen = Math.min(axisContactsHard.length, 3) * 0.4;
            p1 -= pen;
            penalties.p1.push({ id: "axis_hard_contacts", count: axisContactsHard.length, malus: +(-pen).toFixed(1) });
        }

        // P1-L2: Densité d'aspects personnels-personnels (qualité de connexion)
        const personalToPersonal = allAsp.filter(a =>
            PERSONAL_PLANETS.has(a.planete_source) && PERSONAL_PLANETS.has(a.planete_cible)
        );
        const p2pCount = personalToPersonal.length;
        const p2pHarmony = personalToPersonal.filter(a => a.nature === "harmonie" || a.nature === "fusion").length;
        detail.pilier1.personal_to_personal_count = p2pCount;
        detail.pilier1.personal_to_personal_harmony = p2pHarmony;

        if (p2pCount >= 8) {
            const bon = Math.min(p2pCount - 7, 5) * 0.3;
            p1 += bon;
            detail.pilier1.p2p_density_bonus = +bon.toFixed(1);
        } else if (p2pCount <= 2) {
            const pen = (3 - p2pCount) * 0.8;
            p1 -= pen;
            penalties.p1.push({ id: "p2p_aspect_void", count: p2pCount, malus: +(-pen).toFixed(1) });
        }

        // P1-L4: Siège planétaire — convergence de 3+ aspects sur une même planète cible
        const targetHitCount = {};
        for (const a of allAsp) {
            if (!a.planete_cible) continue;
            const key = a.planete_cible + "|" + (a.cible_personne || "");
            if (!targetHitCount[key]) targetHitCount[key] = { planet: a.planete_cible, personne: a.cible_personne || "", harmony: 0, tension: 0, total: 0 };
            targetHitCount[key].total++;
            if (a.nature === "harmonie" || a.nature === "fusion") targetHitCount[key].harmony++;
            else if (a.nature === "tension") targetHitCount[key].tension++;
        }
        let siegeBonus = 0, siegePenalty = 0;
        const siegeDetails = [];
        for (const key of Object.keys(targetHitCount)) {
            const hit = targetHitCount[key];
            if (hit.total < 3 || !PERSONAL_PLANETS.has(hit.planet)) continue;
            if (hit.tension >= 3) {
                const pen = Math.min(hit.tension - 2, 3) * 0.5;
                siegePenalty += pen;
                siegeDetails.push({ planet: hit.planet, personne: hit.personne, type: "tension_siege", tension: hit.tension, penalty: +pen.toFixed(2) });
            } else if (hit.harmony >= 3) {
                const bon = Math.min(hit.harmony - 2, 2) * 0.3;
                siegeBonus += bon;
                siegeDetails.push({ planet: hit.planet, personne: hit.personne, type: "harmony_siege", harmony: hit.harmony, bonus: +bon.toFixed(2) });
            }
        }
        siegePenalty = Math.min(siegePenalty, 1.5);
        siegeBonus = Math.min(siegeBonus, 1.0);
        if (siegePenalty > 0) {
            p1 -= siegePenalty;
            penalties.p1.push({ id: "planetary_siege_tension", details: siegeDetails.filter(s => s.type === "tension_siege"), malus: +(-siegePenalty).toFixed(1) });
        }
        if (siegeBonus > 0) {
            p1 += siegeBonus;
            detail.pilier1.planetary_siege_harmony = siegeDetails.filter(s => s.type === "harmony_siege");
            detail.pilier1.planetary_siege_bonus = +siegeBonus.toFixed(1);
        }

        const exactBonusTotal = Math.min(exactBonusT1, 8) * 0.5 + Math.min(exactBonusT1Personal, 4) * 0.3;
        const p1Base = 10 + ratio * 20 + exactBonusTotal;
        const maxPenalty = p1Base * 0.6;
        let totalP1Penalty = penalties.p1.reduce((sum, p) => sum + (p.malus || 0), 0);
        if (totalP1Penalty < -maxPenalty) {
            const excess = -totalP1Penalty - maxPenalty;
            p1 += excess;
            detail.pilier1.penalty_cap_applied = +excess.toFixed(2);
        }

        // P1-RECEPTION: Réception dans les aspects — bonus quand planète en dignité du partenaire d'aspect
        {
            const SIGN_RULERS = {};
            for (const [pl, dig] of Object.entries(DIGNITIES)) {
                for (const s of dig.dom) { if (!SIGN_RULERS[s]) SIGN_RULERS[s] = []; SIGN_RULERS[s].push(pl); }
            }
            let receptionBonus = 0;
            const receptionDetails = [];
            for (const a of allAsp) {
                if (!a.planete_source || !a.planete_cible) continue;
                const signSrc = _findSign(a.planete_source, [...(planetsA || []), ...(planetsB || [])]);
                const signCib = _findSign(a.planete_cible, [...(planetsA || []), ...(planetsB || [])]);
                if (!signSrc || !signCib) continue;
                const rulersOfSrcSign = SIGN_RULERS[signSrc] || [];
                const rulersOfCibSign = SIGN_RULERS[signCib] || [];
                const cibReceivesSrc = rulersOfSrcSign.includes(a.planete_cible);
                const srcReceivesCib = rulersOfCibSign.includes(a.planete_source);
                if (cibReceivesSrc || srcReceivesCib) {
                    const isMutual = cibReceivesSrc && srcReceivesCib;
                    const pts = isMutual ? 0.6 : 0.3;
                    const mult = (a.nature === "harmonie" || a.nature === "fusion") ? 1.0 : (a.nature === "tension" ? 0.4 : 0.6);
                    receptionBonus += pts * mult;
                    receptionDetails.push({ aspect: `${a.planete_source} ${a.aspect} ${a.planete_cible}`, mutual: isMutual, nature: a.nature });
                }
            }
            receptionBonus = Math.min(receptionBonus, 2.5);
            if (receptionBonus > 0.05) {
                p1 += receptionBonus;
                detail.pilier1.aspect_reception_bonus = +receptionBonus.toFixed(2);
                detail.pilier1.aspect_reception_details = receptionDetails.slice(0, 8);
            }
        }

        // P1-COMBUST/CAZIMI: Planète personnelle conjointe au Soleil croisé
        {
            const soleilConj = allAsp.filter(a =>
                a.aspect === "Conjonction" &&
                ((a.planete_source === "Soleil" && PERSONAL_PLANETS.has(a.planete_cible) && a.planete_cible !== "Soleil") ||
                 (a.planete_cible === "Soleil" && PERSONAL_PLANETS.has(a.planete_source) && a.planete_source !== "Soleil"))
            );
            for (const sc of soleilConj) {
                const orb = Math.abs(sc.orbe || sc.orb || 99);
                if (orb <= 0.3) {
                    p1 += 1.0;
                    detail.pilier1.cazimi = detail.pilier1.cazimi || [];
                    detail.pilier1.cazimi.push({ planet: sc.planete_source === "Soleil" ? sc.planete_cible : sc.planete_source, orb: +orb.toFixed(2) });
                } else if (orb > 0.3 && orb <= 8) {
                    const pen = orb <= 3 ? 0.6 : 0.3;
                    p1 -= pen;
                    detail.pilier1.combust = detail.pilier1.combust || [];
                    detail.pilier1.combust.push({ planet: sc.planete_source === "Soleil" ? sc.planete_cible : sc.planete_source, orb: +orb.toFixed(2), malus: +(-pen).toFixed(2) });
                    penalties.p1.push({ id: "combust_cross", planet: sc.planete_source === "Soleil" ? sc.planete_cible : sc.planete_source, orb: +orb.toFixed(2), malus: +(-pen).toFixed(1) });
                }
            }
        }

        // P1-NHRI: Modulation structurelle — aspects touchant un maître de maison fragile/forte
        if (_nhriA && _nhriB && _hrA && _hrB) {
            const SHADOW_THRESHOLD_NHRI = 0.85;
            const STRONG_THRESHOLD_NHRI = 1.15;

            function findRuledHouses(planetName, houseRulers) {
                const ruled = [];
                for (let h = 1; h <= 12; h++) {
                    const r = houseRulers[h];
                    if (!r) continue;
                    if (r.maitre === planetName || r.maitre_traditionnel === planetName) ruled.push(h);
                }
                return ruled;
            }

            let nhriTensionAdj = 0, nhriHarmonyAdj = 0;
            const nhriAspDetails = [];

            for (const a of allAsp) {
                if (!a.planete_source || !a.planete_cible) continue;

                const srcRuledInB = findRuledHouses(a.planete_source, _hrB);
                const cibRuledInA = findRuledHouses(a.planete_cible, _hrA);

                const fragileHitsB = srcRuledInB.filter(h => (_nhriB[h]?.index || 1.0) < SHADOW_THRESHOLD_NHRI);
                const fragileHitsA = cibRuledInA.filter(h => (_nhriA[h]?.index || 1.0) < SHADOW_THRESHOLD_NHRI);
                const strongHitsB = srcRuledInB.filter(h => (_nhriB[h]?.index || 1.0) > STRONG_THRESHOLD_NHRI);
                const strongHitsA = cibRuledInA.filter(h => (_nhriA[h]?.index || 1.0) > STRONG_THRESHOLD_NHRI);

                const totalFragile = fragileHitsA.length + fragileHitsB.length;
                const totalStrong = strongHitsA.length + strongHitsB.length;

                if (a.nature === "tension" && totalFragile > 0) {
                    const adj = totalFragile * 0.12;
                    nhriTensionAdj += adj;
                    nhriAspDetails.push({ aspect: `${a.planete_source}→${a.planete_cible}`, nature: "tension", fragile_houses: [...fragileHitsA.map(h => `A:M${h}`), ...fragileHitsB.map(h => `B:M${h}`)], adj: +(-adj).toFixed(2) });
                } else if ((a.nature === "harmonie" || a.nature === "fusion") && totalStrong > 0) {
                    const adj = totalStrong * 0.08;
                    nhriHarmonyAdj += adj;
                    nhriAspDetails.push({ aspect: `${a.planete_source}→${a.planete_cible}`, nature: a.nature, strong_houses: [...strongHitsA.map(h => `A:M${h}`), ...strongHitsB.map(h => `B:M${h}`)], adj: +adj.toFixed(2) });
                }
            }

            nhriTensionAdj = Math.min(nhriTensionAdj, 2.0);
            nhriHarmonyAdj = Math.min(nhriHarmonyAdj, 1.5);
            const nhriP1Net = nhriHarmonyAdj - nhriTensionAdj;

            if (Math.abs(nhriP1Net) > 0.05) {
                p1 += nhriP1Net;
                detail.pilier1.nhri_structural_adj = +nhriP1Net.toFixed(2);
                detail.pilier1.nhri_tension_load = +nhriTensionAdj.toFixed(2);
                detail.pilier1.nhri_harmony_boost = +nhriHarmonyAdj.toFixed(2);
                detail.pilier1.nhri_asp_details = nhriAspDetails.slice(0, 10);
            }
        }

        p1 = Math.max(0, Math.min(35, p1));
        Object.assign(detail.pilier1, {
            total: +p1.toFixed(1), ratio: +ratio.toFixed(3),
            positiveW: +positiveW.toFixed(1), negativeW: +negativeW.toFixed(1),
            exact_bonus: exactBonusT1, exact_bonus_personal: exactBonusT1Personal,
            tier2_count: allT2.length,
            oob_in_aspects: detail.pilier1.oob_in_aspects || 0,
            stationary_in_aspect: stationaryInAsp.length,
            aspects_count: allAsp.length, penalties: penalties.p1,
            soleil_lune_soft_bonus: detail.pilier1.soleil_lune_soft_bonus || 0
        });
    }

    // ====== PILIER 2 : Profondeur Karmique & Couches Avancées (0–30) ======
    let p2 = 0;

    const LOT_NAMES = new Set(["Part de Fortune","Lot de l'Esprit","Lot de Nécessité","Lot d'Éros","Lot de Courage","Lot de Némésis","Lot de Basis","Lot d'Exaltation","Lot du Daemon","Lot de Victoire","Lot du Père","Lot de la Mère","Lot de Maladie","Lot du Mariage","Lot des Enfants","Lot de Voyage"]);
    const karmiques = (nodal || []).filter(n => n.karmique);
    const karmiqueExacts = karmiques.filter(n => n.exact);
    const karmPlanet = karmiques.filter(n => !LOT_NAMES.has(n.planete));
    const karmLot = karmiques.filter(n => LOT_NAMES.has(n.planete));

    // Pondération qualitative des contacts nodaux selon planète ET type d'aspect
    const NODAL_PLANET_WEIGHT = {
        "Soleil": 1.2, "Lune": 1.2, "Vénus": 1.0, "Mars": 0.9, "Mercure": 0.7,
        "Jupiter": 0.8, "Saturne": 0.8, "Pluton": 0.7, "Neptune": 0.6, "Uranus": 0.6, "Chiron": 0.9
    };
    const NODAL_ASPECT_WEIGHT = {
        "Conjonction": 1.3, "Opposition": 1.1, "Trigone": 0.9, "Carré": 0.8, "Sextile": 0.7, "Quinconce": 0.5
    };
    let nodalQualScore = 0;
    for (const nc of karmPlanet) {
        const plW = NODAL_PLANET_WEIGHT[nc.planete] || 0.5;
        const aspW = NODAL_ASPECT_WEIGHT[nc.aspect] || 0.6;
        const exactMult = nc.exact ? 1.3 : 1.0;
        nodalQualScore += 0.5 * plW * aspW * exactMult;
    }
    p2 += Math.min(nodalQualScore, 5.0);
    p2 += Math.min(karmLot.length, 4) * 0.15;
    detail.pilier2.nodal_karmique = karmiques.length;
    detail.pilier2.nodal_karmique_planet = karmPlanet.length;
    detail.pilier2.nodal_karmique_lot = karmLot.length;
    detail.pilier2.nodal_exact = karmiqueExacts.length;
    detail.pilier2.nodal_qual_score = +nodalQualScore.toFixed(2);

    // P2-PENALTY: South Node dominance (more South Node contacts than North Node)
    // v5.0.0 — Pénalité durcie : seuil abaissé (≥2 → ≥1) ET pondération par ratio.
    // Une relation où le SN domine = lien karmique « ancien », rejouant les patterns
    // du passé plutôt qu'évoluant vers le futur. Signal majeur pour typo Amour.
    const nnContacts = (nodal || []).filter(n => n.noeud && n.noeud.includes("Nord"));
    const snContacts = (nodal || []).filter(n => n.noeud && (n.noeud.includes("Sud") || n.noeud.includes("South")));
    const snDominance = snContacts.length - nnContacts.length;
    if (snDominance >= 1) {
        const ratio = nnContacts.length > 0 ? snContacts.length / nnContacts.length : 2;
        // base 0.6 + amplification par ratio (cap 2.5)
        const pen = Math.min(2.5, 0.6 + (ratio - 1) * 1.4 + Math.max(0, snDominance - 2) * 0.3);
        p2 -= pen;
        penalties.p2.push({ id: "south_node_dominance", nn: nnContacts.length, sn: snContacts.length, ratio: +ratio.toFixed(2), malus: +(-pen).toFixed(1) });
    }

    // P2-L3: Nœuds Lunaires sur Angles (marqueur de rencontre destinique)
    const NODAL_NAMES = new Set(["Nœud Nord", "Nœud Sud"]);
    const ANGLE_NAMES_P2 = new Set(["Ascendant", "Descendant", "MC", "Milieu du Ciel", "Imum Coeli"]);
    const nodalOnAngles = allAsp.filter(a => {
        const srcNodal = NODAL_NAMES.has(a.planete_source);
        const cibNodal = NODAL_NAMES.has(a.planete_cible);
        const srcAngle = ANGLE_NAMES_P2.has(a.planete_source);
        const cibAngle = ANGLE_NAMES_P2.has(a.planete_cible);
        if (!((srcNodal && cibAngle) || (cibNodal && srcAngle))) return false;
        return a.aspect === "Conjonction" || a.aspect === "Opposition";
    });
    const nodalOnAnglesHarmonic = allAsp.filter(a => {
        const srcNodal = NODAL_NAMES.has(a.planete_source);
        const cibNodal = NODAL_NAMES.has(a.planete_cible);
        const srcAngle = ANGLE_NAMES_P2.has(a.planete_source);
        const cibAngle = ANGLE_NAMES_P2.has(a.planete_cible);
        if (!((srcNodal && cibAngle) || (cibNodal && srcAngle))) return false;
        return a.aspect === "Trigone" || a.aspect === "Sextile";
    });
    if (nodalOnAngles.length > 0) {
        const nnOnAsc = nodalOnAngles.filter(a =>
            (a.planete_source === "Nœud Nord" || a.planete_cible === "Nœud Nord") &&
            (a.planete_source === "Ascendant" || a.planete_cible === "Ascendant" ||
             a.planete_source === "Descendant" || a.planete_cible === "Descendant")
        );
        const bon = Math.min(nodalOnAngles.length, 3) * 0.7 + (nnOnAsc.length > 0 ? 0.5 : 0);
        p2 += bon;
        detail.pilier2.nodal_on_angles = nodalOnAngles.length;
        detail.pilier2.nodal_on_angles_bonus = +bon.toFixed(1);
        detail.pilier2.nn_on_asc_dsc = nnOnAsc.length;
    }
    if (nodalOnAnglesHarmonic.length > 0) {
        const bon = Math.min(nodalOnAnglesHarmonic.length, 3) * 0.3;
        p2 += bon;
        detail.pilier2.nodal_on_angles_harmonic = nodalOnAnglesHarmonic.length;
    }

    // P2-PENALTY: Chiron hard aspects to personal planets
    const chironHard = allAsp.filter(a =>
        a.nature === "tension" &&
        ((a.planete_source === "Chiron" && PERSONAL_PLANETS.has(a.planete_cible)) ||
         (a.planete_cible === "Chiron" && PERSONAL_PLANETS.has(a.planete_source)))
    );
    if (chironHard.length >= 1) {
        const pen = Math.min(chironHard.length, 4) * 0.5;
        p2 -= pen;
        penalties.p2.push({ id: "chiron_hard_personal", count: chironHard.length, malus: +(-pen).toFixed(1) });
    }

    // P2-PENALTY: Lilith intense contacts (conj/opp to luminaries)
    const lilithIntense = allAsp.filter(a =>
        (a.aspect === "Conjonction" || a.aspect === "Opposition") &&
        ((a.planete_source === "Lilith" && LUMINAIRE_SET.has(a.planete_cible)) ||
         (a.planete_cible === "Lilith" && LUMINAIRE_SET.has(a.planete_source)))
    );
    if (lilithIntense.length > 0) {
        const pen = Math.min(lilithIntense.length, 2) * 0.7;
        p2 -= pen;
        penalties.p2.push({ id: "lilith_luminaire_intense", count: lilithIntense.length, malus: -pen });
    }

    const recCount = (receptions || []).length;
    p2 += Math.min(recCount, 4) * 1.0;
    const quasiRecCount = (crossDisp || []).filter(d => !d.mutual && (d.chain_length || d.depth || 2) === 2).length;
    p2 += Math.min(Math.max(quasiRecCount - recCount * 2, 0), 4) * 0.15;
    detail.pilier2.receptions = recCount;
    detail.pilier2.quasi_receptions = quasiRecCount;

    const pars = decl?.parallels || [];
    const cPars = decl?.contraParallels || [];
    const parCount = pars.length;
    const cParCount = cPars.length;
    const lumParallels = pars.filter(p => p.hasLuminaire);
    const personalParallels = pars.filter(p => PERSONAL_PLANETS.has(p.p1) || PERSONAL_PLANETS.has(p.p2));
    let parScore = 0;
    for (const pp of pars.slice(0, 12)) {
        const isPersonal = PERSONAL_PLANETS.has(pp.p1) || PERSONAL_PLANETS.has(pp.p2);
        const orb = Math.abs(pp.orbe || pp.orb || 1);
        parScore += isPersonal ? (orb < 0.2 ? 0.40 : 0.30) : 0.20;
    }
    parScore = Math.min(parScore, 3.0);
    p2 += parScore;
    p2 += Math.min(lumParallels.length, 3) * 0.2;
    if (parCount > 12) {
        const densityBonus = Math.min(parCount - 12, 8) * 0.08;
        p2 += densityBonus;
        detail.pilier2.parallels_density_bonus = +densityBonus.toFixed(2);
    }
    const cParPersonal = cPars.filter(cp =>
        PERSONAL_PLANETS.has(cp.p1) || PERSONAL_PLANETS.has(cp.p2)
    );
    p2 -= Math.min(cParPersonal.length, 3) * 0.25;

    const lumCrossParallels = pars.filter(p =>
        (LUMINAIRE_SET.has(p.p1) && PERSONAL_PLANETS.has(p.p2)) ||
        (LUMINAIRE_SET.has(p.p2) && PERSONAL_PLANETS.has(p.p1))
    );
    p2 += Math.min(lumCrossParallels.length, 4) * 0.25;
    detail.pilier2.personal_parallels = personalParallels.length;
    detail.pilier2.luminary_cross_parallels = lumCrossParallels.length;
    detail.pilier2.parallels = parCount;
    detail.pilier2.parallels_luminaire = lumParallels.length;
    detail.pilier2.contra_parallels = cParCount;
    detail.pilier2.contra_parallels_personal = cParPersonal.length;

    const midTop = (midpoints || []).slice(0, 15);
    const midHomonymes = midTop.filter(m => m.is_homonyme);
    let midScore = 0;
    for (const m of midTop.slice(0, 10)) {
        const orb = Math.abs(m.orbe || m.orb || 1);
        midScore += orb < 0.1 ? 0.25 : orb < 0.3 ? 0.18 : 0.12;
    }
    p2 += midScore;
    p2 += Math.min(midHomonymes.length, 4) * 0.25;
    detail.pilier2.midpoints_top = midTop.length;
    detail.pilier2.midpoints_homonymes = midHomonymes.length;
    detail.pilier2.midpoints_tight = midTop.filter(m => Math.abs(m.orbe || m.orb || 1) < 0.1).length;

    const crossPCount = (crossParans || []).length;
    p2 += Math.min(crossPCount, 5) * 0.35;
    detail.pilier2.cross_parans = crossPCount;

    const ppSorted = (planetaryPics || []).sort((a, b) => (b.count || 0) - (a.count || 0));
    let ppScore = 0;
    for (let i = 0; i < Math.min(ppSorted.length, 5); i++) {
        const cnt = ppSorted[i].count || 2;
        ppScore += cnt >= 6 ? 0.5 : cnt >= 4 ? 0.3 : 0.15;
    }
    p2 += ppScore;
    detail.pilier2.planetary_pictures = ppSorted.length;
    detail.pilier2.planetary_pictures_top_count = ppSorted[0]?.count || 0;

    const starBCount = (starBridges || []).length;
    p2 += Math.min(starBCount, 4) * 0.5;
    detail.pilier2.star_bridges = starBCount;

    const vtxCount = (vertexC || []).length;
    p2 += Math.min(vtxCount, 3) * 0.5;
    detail.pilier2.vertex = vtxCount;

    const antisAll = antis || [];
    const antisPersonal = antisAll.filter(a =>
        PERSONAL_PLANETS.has(a.p1 || a.planete_1) || PERSONAL_PLANETS.has(a.p2 || a.planete_2)
    );
    const antWeight = (name) => {
        const W = {"Soleil":0.5,"Lune":0.5,"Vénus":0.4,"Mars":0.4,"Mercure":0.3,"Jupiter":0.35,"Saturne":0.35};
        return W[name] || 0.12;
    };
    let antisciaScore = 0;
    for (const a of antisAll.slice(0, 7)) {
        const pName = a.p1 || a.planete_1 || a.p2 || a.planete_2;
        antisciaScore += antWeight(pName);
    }
    p2 += antisciaScore;
    detail.pilier2.antiscia = antisAll.length;
    detail.pilier2.antiscia_personal = antisPersonal.length;

    const mutualDisp = (crossDisp || []).filter(d => d.mutual);
    const simpleDisp = (crossDisp || []).filter(d => !d.mutual);
    const longChains = simpleDisp.filter(d => (d.chain_length || d.depth || 2) >= 3);
    p2 += Math.min(mutualDisp.length, 3) * 0.5;
    p2 += Math.min(simpleDisp.length, 5) * 0.12;
    p2 += Math.min(longChains.length, 3) * 0.10;
    detail.pilier2.dispositors_mutual = mutualDisp.length;
    detail.pilier2.dispositors_simple = simpleDisp.length;
    detail.pilier2.dispositors_long_chains = longChains.length;

    // P2-BONUS: Dispositor hub convergence (final dispositor)
    const dispChains = crossDisp || [];
    if (dispChains.length >= 3) {
        const terminalCount = {};
        for (const d of dispChains) {
            const chain = d.chain || [];
            if (chain.length >= 2) {
                const terminal = chain[chain.length - 1];
                const tName = typeof terminal === 'string' ? terminal : (terminal?.planet || terminal?.planete || "");
                if (tName) terminalCount[tName] = (terminalCount[tName] || 0) + 1;
            }
        }
        const maxHub = Math.max(...Object.values(terminalCount), 0);
        if (maxHub >= 5) {
            const bon = Math.min(maxHub - 4, 3) * 0.3;
            p2 += bon;
            detail.pilier2.dispositor_hub = Object.entries(terminalCount).sort((a,b) => b[1]-a[1])[0];
        }
    }

    const oobInter = (oob || []).length;
    p2 += Math.min(oobInter, 3) * 0.15;
    detail.pilier2.oob = oobInter;

    const hayzCount = (hayz || []).length;
    p2 += Math.min(hayzCount, 4) * 0.20;
    detail.pilier2.hayz = hayzCount;

    p2 = Math.max(0, Math.min(30, p2));
    detail.pilier2.total = +p2.toFixed(1);
    detail.pilier2.penalties = penalties.p2;

    // ====== PILIER 3 : Santé Composite & Davison (0–20) ======
    let p3 = 0;

    function chartHealthScore(aspects, configs) {
        if (!aspects || aspects.length === 0) return { ratio: 0.5, configBonus: 0, hardCount: 0 };
        const h = aspects.filter(a => a.nature === "harmonie").length;
        const t = aspects.filter(a => a.nature === "tension").length;
        const f = aspects.filter(a => a.nature === "fusion").length;
        const pos = h + f * 0.6;
        const neg = t;
        const total = pos + neg || 1;
        const ratio = pos / total;

        let cfgBonus = 0;
        let tCarreCount = 0;
        for (const c of (configs || [])) {
            const t = (c.type || "").toUpperCase();
            if (t.includes("GRAND TRIGONE")) cfgBonus += 2;
            else if (t.includes("CERF-VOLANT") || t.includes("KITE")) cfgBonus += 1.5;
            else if (t.includes("RECTANGLE MYSTIQUE")) cfgBonus += 1.0;
            else if (t.includes("STELLIUM")) cfgBonus += 0.5;
            else if (t.includes("YOD")) cfgBonus += 0.5;
            else if (t.includes("T-CARRÉ") || t.includes("T-CARRE")) { cfgBonus -= 1; tCarreCount++; }
            else if (t.includes("GRAND CARRÉ") || t.includes("GRAND CARRE") || t.includes("CROIX FIXE") || t.includes("CROIX CARDINAL") || t.includes("CROIX MUTABLE")) cfgBonus -= 1.5;
        }
        if (tCarreCount >= 3) cfgBonus -= 0.8;
        else if (tCarreCount >= 2) cfgBonus -= 0.4;
        return { ratio, configBonus: cfgBonus, hardCount: t, tCarreCount };
    }

    const compHealth = chartHealthScore(compositeAsp, compositeConf);
    let compScore = 5 + compHealth.ratio * 5 + Math.max(-3, Math.min(3, compHealth.configBonus));

    if (Array.isArray(compositeAsp)) {
        const lumAsp = compositeAsp.filter(a =>
            (LUMINAIRE_SET.has(a.planete_1) || LUMINAIRE_SET.has(a.planete_2)) &&
            (a.nature === "harmonie" || a.nature === "fusion")
        );
        compScore += Math.min(lumAsp.length, 3) * 0.5;
        detail.pilier3.composite_luminaire_aspects = lumAsp.length;

        const aspWeighted = compositeAsp.map(a => {
            const hasPersonal = PERSONAL_PLANETS.has(a.planete_1) || PERSONAL_PLANETS.has(a.planete_2);
            return { ...a, _weight: hasPersonal ? 1.3 : 1.0 };
        });
        const wPos = aspWeighted.filter(a => a.nature === "harmonie" || a.nature === "fusion").reduce((s, a) => s + a._weight, 0);
        const wNeg = aspWeighted.filter(a => a.nature === "tension").reduce((s, a) => s + a._weight, 0);
        const wTotal = wPos + wNeg || 1;
        detail.pilier3.composite_weighted_ratio = +(wPos / wTotal).toFixed(3);

        // P3-BONUS: Venus-Mars soft in composite (relational harmony)
        const compVenusMarsSoft = compositeAsp.filter(a =>
            (a.nature === "harmonie" || a.nature === "fusion") &&
            ((a.planete_1 === "Vénus" && a.planete_2 === "Mars") ||
             (a.planete_1 === "Mars" && a.planete_2 === "Vénus"))
        );
        if (compVenusMarsSoft.length > 0) {
            const bon = compVenusMarsSoft.some(a => (a.orbe || 99) < 1) ? 1.2 : 0.8;
            compScore += bon;
            detail.pilier3.composite_venus_mars_soft = bon;
        }

        // P3-PENALTY: Lune-Saturne hard in composite
        const compLuneSatHard = compositeAsp.filter(a =>
            a.nature === "tension" &&
            ((a.planete_1 === "Lune" && a.planete_2 === "Saturne") ||
             (a.planete_1 === "Saturne" && a.planete_2 === "Lune"))
        );
        if (compLuneSatHard.length > 0) {
            const pen = 1.5;
            compScore -= pen;
            penalties.p3.push({ id: "composite_lune_saturne_hard", count: compLuneSatHard.length, malus: -pen });
        }

        // P3-PENALTY: Venus-Pluton hard in composite
        const compVenusPlutoHard = compositeAsp.filter(a =>
            a.nature === "tension" &&
            ((a.planete_1 === "Vénus" && a.planete_2 === "Pluton") ||
             (a.planete_1 === "Pluton" && a.planete_2 === "Vénus"))
        );
        if (compVenusPlutoHard.length > 0) {
            const pen = 1.0;
            compScore -= pen;
            penalties.p3.push({ id: "composite_venus_pluton_hard", count: compVenusPlutoHard.length, malus: -pen });
        }

        // P3-PENALTY: Stellium in M8/M12 composite (if we have house data)
        for (const c of (compositeConf || [])) {
            if (c.type === "Stellium" && c.houses) {
                const inDifficult = c.houses.some(h => h === 8 || h === 12);
                if (inDifficult) {
                    const pen = 0.8;
                    compScore -= pen;
                    penalties.p3.push({ id: "composite_stellium_m8_m12", house: c.houses, malus: -pen });
                }
            }
        }

        // P3-PENALTY: Mars-Saturne hard in composite (structural frustration, blocked action)
        const compMarsSatHard = compositeAsp.filter(a =>
            (a.nature === "tension" || a.nature === "fusion") &&
            ((a.planete_1 === "Mars" && a.planete_2 === "Saturne") ||
             (a.planete_1 === "Saturne" && a.planete_2 === "Mars"))
        );
        if (compMarsSatHard.length > 0) {
            const isTight = compMarsSatHard.some(a => (a.orbe || 99) < 2);
            const pen = isTight ? 1.3 : 0.8;
            compScore -= pen;
            penalties.p3.push({ id: "composite_mars_saturne_hard", count: compMarsSatHard.length, malus: +(-pen).toFixed(1) });
        }

        // P3-PENALTY: Mars-Pluton hard in composite (power struggle, domination)
        const compMarsPlutoHard = compositeAsp.filter(a =>
            a.nature === "tension" &&
            ((a.planete_1 === "Mars" && a.planete_2 === "Pluton") ||
             (a.planete_1 === "Pluton" && a.planete_2 === "Mars"))
        );
        if (compMarsPlutoHard.length > 0) {
            const pen = compMarsPlutoHard.some(a => (a.orbe || 99) < 1) ? 1.5 : 1.0;
            compScore -= pen;
            penalties.p3.push({ id: "composite_mars_pluton_hard", count: compMarsPlutoHard.length, malus: +(-pen).toFixed(1) });
        }

        // P3-PENALTY: Soleil-Saturne conjunction in composite (restriction, lourdeur)
        const compSolSatConj = compositeAsp.filter(a =>
            a.nature === "fusion" &&
            ((a.planete_1 === "Soleil" && a.planete_2 === "Saturne") ||
             (a.planete_1 === "Saturne" && a.planete_2 === "Soleil"))
        );
        if (compSolSatConj.length > 0) {
            const pen = compSolSatConj.some(a => a.orbe < 2) ? 1.3 : 0.7;
            compScore -= pen;
            penalties.p3.push({ id: "composite_soleil_saturne_conj", orbe: compSolSatConj[0]?.orbe, malus: -pen });
        }

        // P3-PENALTY: Composite Sun-Moon quinconce/hard
        const compSolLuneHard = compositeAsp.filter(a =>
            ((a.planete_1 === "Soleil" && a.planete_2 === "Lune") ||
             (a.planete_1 === "Lune" && a.planete_2 === "Soleil")) &&
            (a.nature === "tension" || a.nature === "ajustement")
        );
        if (compSolLuneHard.length > 0) {
            const isTension = compSolLuneHard.some(a => a.nature === "tension");
            const pen = isTension ? 1.2 : 0.7;
            compScore -= pen;
            penalties.p3.push({ id: "composite_soleil_lune_hard", nature: isTension ? "tension" : "quinconce", malus: +(-pen).toFixed(1) });
        }

        // P3-PENALTY: Composite Moon square Nodes
        const compLuneNodes = compositeAsp.filter(a =>
            (a.nature === "tension") &&
            ((a.planete_1 === "Lune" && (a.planete_2 === "Nœud Nord" || a.planete_2 === "Nœud Sud")) ||
             (a.planete_2 === "Lune" && (a.planete_1 === "Nœud Nord" || a.planete_1 === "Nœud Sud")))
        );
        if (compLuneNodes.length > 0) {
            const pen = 0.8;
            compScore -= pen;
            penalties.p3.push({ id: "composite_lune_nodes_hard", count: compLuneNodes.length, malus: +(-pen).toFixed(1) });
        }

        // P3-BONUS: Composite luminaire on angle (ASC/MC)
        const compPlanetes = ctx.compositePlanetes || [];
        if (compPlanetes.length > 0) {
            const compAngles = compPlanetes.filter(p =>
                (p.planete === "Soleil" || p.planete === "Lune") &&
                (p.maison_composite === 1 || p.maison_composite === 10)
            );
            if (compAngles.length > 0) {
                const bon = Math.min(compAngles.length, 2) * 0.6;
                compScore += bon;
                detail.pilier3.composite_luminaire_on_angle = compAngles.map(p => `${p.planete} M${p.maison_composite}`);
            }
        }

        // P3-BONUS: Nœud Nord composite in principal house for typology
        if (compPlanetes.length > 0 && typoConf) {
            const nnComp = compPlanetes.find(p => p.planete === "Nœud Nord");
            if (nnComp && typoConf.principales.includes(nnComp.maison_composite)) {
                compScore += 0.5;
                detail.pilier3.composite_nn_in_principal = `M${nnComp.maison_composite}`;
            }
        }

        // P3-BONUS/MALUS: Composite Sun/Moon house placement
        if (compPlanetes.length > 0) {
            const ANGULAR = new Set([1, 7, 10, 4]);
            const DIFFICULT = new Set([6, 8, 12]);
            const EXALT_SIGNS = { "Soleil": "Bélier", "Lune": "Taureau" };
            const DOMICILE_SIGNS = { "Soleil": "Lion", "Lune": "Cancer" };
            for (const name of ["Soleil", "Lune"]) {
                const pl = compPlanetes.find(p => p.planete === name);
                if (!pl) continue;
                const h = pl.maison_composite;
                if (ANGULAR.has(h)) {
                    compScore += 0.5;
                    detail.pilier3[`composite_${name.toLowerCase()}_angular`] = `M${h}`;
                } else if (DIFFICULT.has(h)) {
                    compScore -= 0.4;
                    detail.pilier3[`composite_${name.toLowerCase()}_difficult`] = `M${h}`;
                }
                const sig = (pl.signe || "").toLowerCase();
                if (sig === (EXALT_SIGNS[name] || "").toLowerCase()) {
                    compScore += 0.6;
                    detail.pilier3[`composite_${name.toLowerCase()}_exalted`] = pl.signe;
                } else if (sig === (DOMICILE_SIGNS[name] || "").toLowerCase()) {
                    compScore += 0.5;
                    detail.pilier3[`composite_${name.toLowerCase()}_domicile`] = pl.signe;
                }
            }
        }

        // P3-PENALTY: Composite house concentration (4+ planets in a single difficult house)
        if (compPlanetes.length > 0) {
            const DIFFICULT_CONC = new Set([6, 8, 12]);
            const houseCount = {};
            for (const p of compPlanetes) {
                const h = p.maison_composite;
                if (h && DIFFICULT_CONC.has(h)) houseCount[h] = (houseCount[h] || 0) + 1;
            }
            for (const [house, cnt] of Object.entries(houseCount)) {
                if (cnt >= 4) {
                    const isParentCtx = (typoConf?.label_fr || "").toLowerCase().includes("parent");
                    const pen = isParentCtx ? 0.5 : 1.2;
                    compScore -= pen;
                    penalties.p3.push({ id: "composite_house_concentration", house: +house, count: cnt, malus: +(-pen).toFixed(1) });
                }
            }
        }

        // P3-PENALTY: Heavy stellium (>3 planets) in M8/M12
        for (const c of (compositeConf || [])) {
            const tp = (c.type || "").toUpperCase();
            if (tp.includes("STELLIUM") && c.planets && c.planets.length > 3) {
                const houses = c.houses || [];
                const inHeavy = houses.some(h => h === 8 || h === 12);
                if (inHeavy) {
                    const pen = 0.4 * (c.planets.length - 3);
                    compScore -= pen;
                    penalties.p3.push({ id: "composite_heavy_stellium_m8m12", planets: c.planets.length, malus: +(-pen).toFixed(1) });
                }
            }
        }
    }
    // v6.2.0 — Composite prioritaire (Q5 astrologue) : 14/20 du P3 vs 6/20 Davison
    // Justification : Robert Hand "Planets in Composite" est la norme industrielle
    // pour analyser la psychologie du « Nous ». Le Davison reste utile pour
    // les transits sur le couple, pas pour le narratif statique.
    compScore = Math.max(0, Math.min(14, compScore));

    let davScore = 0;
    if (davisonAsp && davisonAsp.length > 0) {
        const davHealth = chartHealthScore(davisonAsp, davisonConf);
        davScore = 2 + davHealth.ratio * 4 + Math.max(-2, Math.min(2, davHealth.configBonus));

        // P3-BONUS: Davison Sun/Moon on angular houses
        const davPlanets = ctx.davisonPlanets || [];
        if (davPlanets.length > 0) {
            const ANGULAR_DAV = new Set([1, 7, 10, 4]);
            for (const name of ["Soleil", "Lune"]) {
                const pl = davPlanets.find(p => p.planete === name);
                if (pl && ANGULAR_DAV.has(pl.maison)) {
                    davScore += 0.5;
                    detail.pilier3[`davison_${name.toLowerCase()}_angular`] = `M${pl.maison}`;
                }
            }
        }

        // P3-BONUS: Davison Venus-Mars soft
        const davVenusMarsSoft = davisonAsp.filter(a =>
            (a.nature === "harmonie" || a.nature === "fusion") &&
            ((a.planete_1 === "Vénus" && a.planete_2 === "Mars") ||
             (a.planete_1 === "Mars" && a.planete_2 === "Vénus"))
        );
        if (davVenusMarsSoft.length > 0) {
            davScore += 0.6;
            detail.pilier3.davison_venus_mars_soft = true;
        }

        // P3-PENALTY: Davison tight hard aspects between inner planets
        const DAV_INNER = new Set(["Soleil","Lune","Mercure","Vénus","Mars","Saturne","Neptune","Pluton"]);
        const davTightHard = davisonAsp.filter(a =>
            a.nature === "tension" &&
            DAV_INNER.has(a.planete_1) && DAV_INNER.has(a.planete_2) &&
            Math.abs(a.orbe || 99) < 1
        );
        if (davTightHard.length > 0) {
            const pen = Math.min(davTightHard.length, 3) * 0.5;
            davScore -= pen;
            penalties.p3.push({ id: "davison_tight_hard_inner", count: davTightHard.length, malus: +(- pen).toFixed(1) });
            detail.pilier3.davison_tight_hard = davTightHard.map(a => `${a.planete_1}-${a.planete_2} ${a.aspect} ${a.orbe}°`);
        }

        davScore = Math.max(0, Math.min(6, davScore));
        detail.pilier3.davison_ratio = +davHealth.ratio.toFixed(3);
        detail.pilier3.davison_config_bonus = davHealth.configBonus;
    } else {
        davScore = 3;
        detail.pilier3.davison_note = "Davison non disponible — score neutre";
    }

    p3 = compScore + davScore;
    p3 = Math.max(0, Math.min(20, p3));
    detail.pilier3.composite_ratio = +compHealth.ratio.toFixed(3);
    detail.pilier3.composite_config_bonus = compHealth.configBonus;
    detail.pilier3.composite_score = +compScore.toFixed(1);
    detail.pilier3.davison_score = +davScore.toFixed(1);
    detail.pilier3.total = +p3.toFixed(1);
    detail.pilier3.penalties = penalties.p3;

    // ====== PILIER 4 : Compatibilité Structurelle (0–20) ======
    let p4 = 0;

    if (elemCompat) {
        const domA = elemCompat.dominant_a;
        const domB = elemCompat.dominant_b;
        if (elemCompat.element_relation === "harmonie") p4 += 3;
        else if (elemCompat.element_relation === "tension") p4 -= 1;
        else p4 += 1;

        p4 += Math.min(elemCompat.elements_communs || 0, 3) * 0.8;
        p4 -= Math.min(elemCompat.elements_tension || 0, 2) * 0.5;
        p4 += Math.min(elemCompat.modes_communs || 0, 3) * 0.7;
        if ((elemCompat.modes_mirror || 0) === 3) {
            p4 += 1.5;
            detail.pilier4.perfect_modal_sync = true;
        }

        const elData = elemCompat.elements || {};
        let deepShared = 0;
        let deepSharedStrong = 0;
        for (const el of ["Feu","Terre","Air","Eau"]) {
            const eA = (elData[el] || {}).a || 0;
            const eB = (elData[el] || {}).b || 0;
            if (eA >= 3 && eB >= 3) {
                deepShared++;
                if (eA >= 4 && eB >= 4) deepSharedStrong++;
            }
        }
        p4 += Math.min(deepShared, 2) * 0.8;
        p4 += Math.min(deepSharedStrong, 1) * 0.6;

        detail.pilier4.element_relation = elemCompat.element_relation;
        detail.pilier4.elements_communs = elemCompat.elements_communs;
        detail.pilier4.modes_communs = elemCompat.modes_communs;
        detail.pilier4.deep_element_shared = deepShared;
        detail.pilier4.deep_element_strong = deepSharedStrong;

        // P4-BONUS: Sect complementarity (diurnal + nocturnal = complementary)
        const sectA = sA?.sect || "";
        const sectB = sB?.sect || "";
        if (sectA && sectB && sectA !== sectB) {
            p4 += 0.8;
            detail.pilier4.sect_complementarity = true;
        }

        // P4-BONUS: Malefics in sect (domesticated) — reduce harshness
        const hayzMalefics = (hayz || []).filter(h => h.planete === "Saturne" || h.planete === "Mars");
        if (hayzMalefics.length > 0) {
            const sectMaleficBonus = Math.min(hayzMalefics.length * 0.3, 0.6);
            p4 += sectMaleficBonus;
            detail.pilier4.sect_malefic_bonus = +sectMaleficBonus.toFixed(1);
            detail.pilier4.sect_malefic_planets = hayzMalefics.map(h => `${h.planete} (${h.personne})`);
        }

        // P4-PENALTY: Excess shared fixity
        const fixA = (sA?.modes || {}).Fixe || 0;
        const fixB = (sB?.modes || {}).Fixe || 0;
        if (fixA >= 4 && fixB >= 4) {
            const pen = 1.2;
            p4 -= pen;
            penalties.p4.push({ id: "excessive_shared_fixity", fixA, fixB, malus: -pen });
        }

        // P4-PENALTY: Dominant element pure tension
        if (elemCompat.element_relation === "tension" && elemCompat.elements_communs === 0) {
            const pen = 1.5;
            p4 -= pen;
            penalties.p4.push({ id: "element_pure_tension_no_common", malus: -pen });
        }

        // P4-PENALTY: Zero common elements AND incompatible modes (structural void)
        if ((elemCompat.elements_communs || 0) === 0 && (elemCompat.modes_communs || 0) === 0) {
            const pen = 2.0;
            p4 -= pen;
            penalties.p4.push({ id: "structural_void_elem_mode", malus: -pen });
        }
    }

    // P4-SIGN: Compatibilité de signe fondamentale des planètes personnelles
    {
        const SIGN_PAIRS = [
            { name: "Soleil", weight: 1.0 },
            { name: "Lune", weight: 1.0 },
            { name: "Mercure", weight: 0.7 },
            { name: "Vénus", weight: 0.9 },
            { name: "Mars", weight: 0.8 },
            { name: "Ascendant", weight: 0.8 },
            { name: "MC", altName: "Milieu du Ciel", weight: 0.5 }
        ];
        let signCompatScore = 0;
        const signCompatDetails = [];
        for (const pair of SIGN_PAIRS) {
            const sA = _findSign(pair.name, planetsA) || (pair.altName ? _findSign(pair.altName, planetsA) : null);
            const sB = _findSign(pair.name, planetsB) || (pair.altName ? _findSign(pair.altName, planetsB) : null);
            if (!sA || !sB) continue;
            const aff = _elemAffinity(sA, sB);
            let pts = 0;
            if (aff.cat === "same_element") pts = 0.5 * pair.weight;
            else if (aff.cat === "compatible") pts = 0.3 * pair.weight;
            else if (aff.cat === "incompatible") pts = -0.4 * pair.weight;
            else if (aff.cat === "aversion") pts = -0.6 * pair.weight;
            signCompatScore += pts;
            if (Math.abs(pts) > 0.01) signCompatDetails.push({ planet: pair.name, signA: sA, signB: sB, relation: aff.cat, pts: +pts.toFixed(2) });
        }
        signCompatScore = Math.max(-3.0, Math.min(3.0, signCompatScore));
        p4 += signCompatScore;
        detail.pilier4.sign_compatibility = { score: +signCompatScore.toFixed(2), pairs: signCompatDetails };
        if (signCompatScore <= -1.5) {
            penalties.p4.push({ id: "sign_fundamental_friction", score: +signCompatScore.toFixed(2), details: signCompatDetails.filter(d => d.pts < 0), malus: +signCompatScore.toFixed(1) });
        }
    }

    const resonances = (crossSens || []).filter(s => s.type === "resonance").length;
    const vulns = (crossSens || []).filter(s => s.type === "vulnerabilite_activation").length;
    p4 += Math.min(resonances, 3) * 0.5;
    p4 -= Math.min(vulns, 3) * 0.4;
    detail.pilier4.resonances = resonances;
    detail.pilier4.vulnerabilities = vulns;

    {
        const rulerNameA = sA?.chart_ruler || (crA && typeof crA === 'string' ? crA : null);
        const rulerNameB = sB?.chart_ruler || (crB && typeof crB === 'string' ? crB : null);
        if (rulerNameA && rulerNameB) {
            const rulerAsp = allAsp.filter(a =>
                (a.planete_source === rulerNameA && a.planete_cible === rulerNameB) ||
                (a.planete_source === rulerNameB && a.planete_cible === rulerNameA)
            );
            if (rulerAsp.length > 0) {
                rulerAsp.sort((a, b) => (b.score || 0) - (a.score || 0));
                const bestRulerAsp = rulerAsp[0];
                if (bestRulerAsp.nature === "harmonie" || bestRulerAsp.nature === "fusion") p4 += 2;
                else if (bestRulerAsp.nature === "tension") p4 += 0.5;
                else p4 += 1;
                detail.pilier4.chart_rulers_aspect = bestRulerAsp.aspect;
            } else {
                const pen = 1.0;
                p4 -= pen;
                penalties.p4.push({ id: "chart_rulers_no_aspect", rulerA: rulerNameA, rulerB: rulerNameB, malus: -pen });
            }
            detail.pilier4.chart_ruler_a = rulerNameA;
            detail.pilier4.chart_ruler_b = rulerNameB;
        }
    }

    if (typoConf) {
        const principalHouses = typoConf.principales || [];
        const secondaryHouses = typoConf.secondaires || [];
        const keyPlanets = typoConf.planetes_cles || [];
        const keyAsp = allAsp.filter(a =>
            keyPlanets.includes(a.planete_source) || keyPlanets.includes(a.planete_cible)
        );
        const keyHarmony = keyAsp.filter(a => a.nature === "harmonie" || a.nature === "fusion").length;
        const keyTension = keyAsp.filter(a => a.nature === "tension").length;
        // v4.1.0 — B1 : amplitude typologique x2 (avant 0.5/0.3, max ±2.5/-0.9)
        p4 += Math.min(keyHarmony, 5) * 1.0;
        p4 -= Math.min(keyTension, 3) * 0.6;
        detail.pilier4.typo_key_harmony = keyHarmony;
        detail.pilier4.typo_key_tension = keyTension;

        // P4-BONUS/PENALTY: Typological house activation (v4.1.0 amplifié)
        let activatedPrincipal = 0;
        let emptyPrincipal = 0;
        let activatedSecondary = 0;
        for (const h of principalHouses) {
            const countA = (ovBA && ovBA[h]) ? ovBA[h].length : 0;
            const countB = (ovAB && ovAB[h]) ? ovAB[h].length : 0;
            if (countA > 0 || countB > 0) activatedPrincipal++;
            else emptyPrincipal++;
        }
        for (const h of secondaryHouses) {
            const countA = (ovBA && ovBA[h]) ? ovBA[h].length : 0;
            const countB = (ovAB && ovAB[h]) ? ovAB[h].length : 0;
            if (countA > 0 || countB > 0) activatedSecondary++;
        }
        // v4.1.0 — bonus gradué (avant : binaire +1.5 si full house)
        p4 += activatedPrincipal * 0.5;
        p4 += activatedSecondary * 0.25;
        if (activatedPrincipal === principalHouses.length && principalHouses.length >= 3) {
            p4 += 1.5;
            detail.pilier4.typo_all_principal_activated = true;
        }
        if (emptyPrincipal >= 2 && principalHouses.length >= 3) {
            // v4.1.0 — pénalité maisons principales vides amplifiée x1.67 (avant 0.6)
            const pen = emptyPrincipal * 1.0;
            p4 -= pen;
            penalties.p4.push({ id: "principal_houses_empty", empty: emptyPrincipal, total: principalHouses.length, malus: -pen });
        }
        detail.pilier4.typo_principal_activated = activatedPrincipal;
        detail.pilier4.typo_secondary_activated = activatedSecondary;
        detail.pilier4.typo_principal_empty = emptyPrincipal;

        // v4.1.0 — B1 nouveauté : pénalité quand les planètes-clés typologiques
        // sont totalement absentes des inter-aspects (signal typologique faible).
        const keyPlanetsInAsp = new Set();
        for (const a of allAsp) {
            if (keyPlanets.includes(a.planete_source)) keyPlanetsInAsp.add(a.planete_source);
            if (keyPlanets.includes(a.planete_cible))  keyPlanetsInAsp.add(a.planete_cible);
        }
        const keyAbsent = keyPlanets.length - keyPlanetsInAsp.size;
        if (keyAbsent >= 2) {
            const pen = Math.min(keyAbsent, 4) * 0.5;
            p4 -= pen;
            penalties.p4.push({ id: "key_planets_absent", count: keyAbsent, malus: -pen });
        }
        detail.pilier4.typo_key_planets_in_aspects = keyPlanetsInAsp.size;
        detail.pilier4.typo_key_planets_total = keyPlanets.length;

        // P4-PENALTY: Overlay planets in exile in principal houses (inchangé)
        let exilInPrincipal = 0;
        for (const h of principalHouses) {
            for (const ov of [...(ovBA && ovBA[h] || []), ...(ovAB && ovAB[h] || [])]) {
                if (ov.dignite && (ov.dignite === "Exil" || ov.dignite === "Chute" ||
                    (typeof ov.dignite === "string" && (ov.dignite.startsWith("Exil") || ov.dignite.startsWith("Chute"))))) {
                    exilInPrincipal++;
                }
            }
        }
        if (exilInPrincipal >= 2) {
            const pen = Math.min(exilInPrincipal, 4) * 0.4;
            p4 -= pen;
            penalties.p4.push({ id: "exil_in_principal_houses", count: exilInPrincipal, malus: -pen });
        }
        detail.pilier4.exil_in_principal = exilInPrincipal;
    }

    // ── P4 : HOMOLOGUE CROSS-ASPECTS avec modulation élémentaire ──
    const _HOMO_DEFS = [
        { name: "Soleil",  id: "soleil_soleil",  penO: 1.2, penC: 0.8, bonX: 1.0, bonS: 0.8, absBase: 0 },
        { name: "Lune",    id: "lune_lune",      penO: 1.5, penC: 1.0, bonX: 1.0, bonS: 0.8, absBase: 0 },
        { name: "Mercure", id: "mercure_mercure", penO: 0.8, penC: 0.6, bonX: 0.9, bonS: 0.7, absBase: 0 },
        { name: "Vénus",   id: "venus_venus",     penO: 1.2, penC: 0.8, bonX: 1.0, bonS: 0.8, absBase: 0.6 },
        { name: "Mars",    id: "mars_mars",       penO: 1.0, penC: 0.7, bonX: 0.7, bonS: 0.5, absBase: 0 },
    ];

    for (const hd of _HOMO_DEFS) {
        const soft = allAsp.filter(a => (a.nature === "harmonie" || a.nature === "fusion") && a.planete_source === hd.name && a.planete_cible === hd.name);
        const hard = allAsp.filter(a => a.nature === "tension" && a.planete_source === hd.name && a.planete_cible === hd.name);
        const sA = _findSign(hd.name, planetsA), sB = _findSign(hd.name, planetsB);
        const aff = _elemAffinity(sA, sB);

        if (hard.length > 0) {
            const base = hard.some(a => a.aspect === "Opposition") ? hd.penO : hd.penC;
            const pen = +(base * aff.mPen).toFixed(2);
            p4 -= pen;
            penalties.p4.push({ id: hd.id + "_hard", aspect: hard[0].aspect, elem: aff.cat, signs: `${sA||'?'}/${sB||'?'}`, malus: +(-pen).toFixed(1) });
        } else if (soft.length > 0) {
            const base = soft.some(a => a.exact) ? hd.bonX : hd.bonS;
            const bon = +(base * aff.mBon).toFixed(2);
            p4 += bon;
            bonuses.p4.push({ id: hd.id + "_soft", aspect: soft[0].aspect, elem: aff.cat, signs: `${sA||'?'}/${sB||'?'}`, bonus: +bon.toFixed(1) });
        } else if (hd.absBase > 0) {
            const pen = +(hd.absBase * aff.mAbs).toFixed(2);
            p4 -= pen;
            penalties.p4.push({ id: "no_" + hd.id + "_soft", elem: aff.cat, signs: `${sA||'?'}/${sB||'?'}`, malus: +(-pen).toFixed(1) });
        }
    }

    // ASC-ASC (opposition exclue car = contact ASC-DSC)
    {
        const soft = allAsp.filter(a => (a.nature === "harmonie" || a.nature === "fusion") && a.planete_source === "Ascendant" && a.planete_cible === "Ascendant");
        const hard = allAsp.filter(a => a.nature === "tension" && a.aspect === "Carré" && a.planete_source === "Ascendant" && a.planete_cible === "Ascendant");
        const sA = _findSign("Ascendant", planetsA), sB = _findSign("Ascendant", planetsB);
        const aff = _elemAffinity(sA, sB);
        if (hard.length > 0) {
            const pen = +(0.7 * aff.mPen).toFixed(2);
            p4 -= pen;
            penalties.p4.push({ id: "asc_asc_hard", aspect: "Carré", elem: aff.cat, signs: `${sA||'?'}/${sB||'?'}`, malus: +(-pen).toFixed(1) });
        } else if (soft.length > 0) {
            const base = soft.some(a => a.nature === "fusion") ? 1.0 : 0.7;
            const bon = +(base * aff.mBon).toFixed(2);
            p4 += bon;
            bonuses.p4.push({ id: "asc_asc_soft", aspect: soft[0].aspect, elem: aff.cat, signs: `${sA||'?'}/${sB||'?'}`, bonus: +bon.toFixed(1) });
        }
    }

    // MC-MC
    {
        const soft = allAsp.filter(a => (a.nature === "harmonie" || a.nature === "fusion") &&
            (a.planete_source === "MC" || a.planete_source === "Milieu du Ciel") &&
            (a.planete_cible === "MC" || a.planete_cible === "Milieu du Ciel"));
        const hard = allAsp.filter(a => a.nature === "tension" && a.aspect === "Carré" &&
            (a.planete_source === "MC" || a.planete_source === "Milieu du Ciel") &&
            (a.planete_cible === "MC" || a.planete_cible === "Milieu du Ciel"));
        const sA = _findSign("MC", planetsA) || _findSign("Milieu du Ciel", planetsA);
        const sB = _findSign("MC", planetsB) || _findSign("Milieu du Ciel", planetsB);
        const aff = _elemAffinity(sA, sB);
        if (hard.length > 0) {
            const pen = +(0.5 * aff.mPen).toFixed(2);
            p4 -= pen;
            penalties.p4.push({ id: "mc_mc_hard", aspect: "Carré", elem: aff.cat, signs: `${sA||'?'}/${sB||'?'}`, malus: +(-pen).toFixed(1) });
        } else if (soft.length > 0) {
            const base = soft.some(a => a.nature === "fusion") ? 0.8 : 0.6;
            const bon = +(base * aff.mBon).toFixed(2);
            p4 += bon;
            bonuses.p4.push({ id: "mc_mc_soft", aspect: soft[0].aspect, elem: aff.cat, signs: `${sA||'?'}/${sB||'?'}`, bonus: +bon.toFixed(1) });
        }
    }

    // P4-PENALTY: No soft Soleil-Lune cross-aspect (+ modulation élémentaire)
    const soleilLuneSoft = allAsp.filter(a =>
        (a.nature === "harmonie" || a.nature === "fusion") &&
        ((a.planete_source === "Soleil" && a.planete_cible === "Lune") ||
         (a.planete_source === "Lune" && a.planete_cible === "Soleil"))
    );
    if (soleilLuneSoft.length === 0) {
        const eAff = _crossPairAff("Soleil", "Lune");
        const pen = +(1.0 * eAff.mAbs).toFixed(2);
        p4 -= pen;
        penalties.p4.push({ id: "no_soleil_lune_soft", elem: eAff.cat, signs: eAff.signs, malus: +(-pen).toFixed(1) });
    }

    const accDigTopA = (accDigA || []).slice(0, 5);
    const accDigTopB = (accDigB || []).slice(0, 5);
    const avgDigA = accDigTopA.length ? accDigTopA.reduce((s, d) => s + d.score, 0) / accDigTopA.length : 0;
    const avgDigB = accDigTopB.length ? accDigTopB.reduce((s, d) => s + d.score, 0) / accDigTopB.length : 0;
    const dignityScoreA = Math.min(Math.max(avgDigA, 0) / 18, 1) * 1.5;
    const dignityScoreB = Math.min(Math.max(avgDigB, 0) / 18, 1) * 1.5;
    const dignityBonus = dignityScoreA + dignityScoreB;
    p4 += dignityBonus;
    detail.pilier4.avg_dignity_a = +avgDigA.toFixed(1);
    detail.pilier4.avg_dignity_b = +avgDigB.toFixed(1);

    // P4-L6: Charge rétrograde cumulée dans les overlays
    if (ovBA && ovAB) {
        let retroCountBinA = 0, retroCountAinB = 0;
        for (let h = 1; h <= 12; h++) {
            for (const e of (ovBA[h] || [])) { if (e.retrograde) retroCountBinA++; }
            for (const e of (ovAB[h] || [])) { if (e.retrograde) retroCountAinB++; }
        }
        const totalRetroOverlay = retroCountBinA + retroCountAinB;
        detail.pilier4.retro_overlay_b_in_a = retroCountBinA;
        detail.pilier4.retro_overlay_a_in_b = retroCountAinB;

        if (totalRetroOverlay >= 6) {
            const pen = Math.min(totalRetroOverlay - 5, 4) * 0.25;
            p4 -= pen;
            penalties.p4.push({ id: "retrograde_overlay_load", count: totalRetroOverlay, b_in_a: retroCountBinA, a_in_b: retroCountAinB, malus: +(-pen).toFixed(1) });
        }
    }

    // P4-SHADOW: Activation qualitative des maisons d'ombre (avec NHRI + backoffice)
    if (typoConf && tsBinA && tsAinB) {
        const ombreHouses = typoConf.ombre || [];
        const ombreNuance = typoConf.ombre_nuance || {};
        const SHADOW_HEAVY_THRESHOLD = 40;
        const SHADOW_MASSIVE_THRESHOLD = 60;
        const typoLabelShadow = (typoConf.label_fr || "").toLowerCase();
        const isParentChildShadow = typoLabelShadow.includes("parent") || typoLabelShadow.includes("enfant");

        const UNIVERSAL_SHADOW_THEMES = {
            1:  { theme: "identity_erosion",  weight: 0.65 },
            6:  { theme: "subordination",     weight: 0.55 },
            7:  { theme: "confrontation",     weight: 0.70 },
            8:  { theme: "power_heritage",    weight: 0.85 },
            10: { theme: "authority_control", weight: 0.65 },
            12: { theme: "unconscious_karma", weight: 1.00 }
        };

        const allTypoHouses = new Set([
            ...(typoConf.principales || []),
            ...(typoConf.secondaires || []),
            ...ombreHouses
        ]);

        function evaluateShadowHouse(h, nuance, nhriReceiver, isForeground) {
            const tsBinAH = tsBinA[h] || { tension: 0, support: 0, total: 0, ratio: 0, polarite: "mixte" };
            const tsAinBH = tsAinB[h] || { tension: 0, support: 0, total: 0, ratio: 0, polarite: "mixte" };
            const results = [];

            const dirs = [
                { ts: tsBinAH, label: "B→A", nhri: (_nhriA || {})[h] },
                { ts: tsAinBH, label: "A→B", nhri: (_nhriB || {})[h] }
            ];

            for (const dir of dirs) {
                if (dir.ts.total < SHADOW_HEAVY_THRESHOLD) continue;

                const isMassive = dir.ts.total >= SHADOW_MASSIVE_THRESHOLD;
                const intensityFactor = isMassive ? 1.0 : 0.6;

                let polarityMult;
                if (nuance === "tension_only") {
                    polarityMult = dir.ts.polarite === "tension" ? 1.0 : (dir.ts.polarite === "mixte" ? 0.4 : 0);
                } else if (nuance === "karmic_moderated") {
                    polarityMult = dir.ts.polarite === "tension" ? 0.7 : (dir.ts.polarite === "mixte" ? 0.35 : 0.15);
                } else {
                    polarityMult = dir.ts.polarite === "tension" ? 1.0 : (dir.ts.polarite === "mixte" ? 0.5 : 0.2);
                }

                const ustTheme = UNIVERSAL_SHADOW_THEMES[h];
                const houseWeight = ustTheme ? ustTheme.weight : 0.5;

                const nhriIdx = dir.nhri ? dir.nhri.index : 1.0;
                const nhriMult = 2.0 - nhriIdx;

                const fgWeight = isForeground ? 1.2 : 0.7;
                const rawPen = intensityFactor * polarityMult * houseWeight * fgWeight * nhriMult;

                if (rawPen > 0.05) {
                    results.push({
                        house: h, direction: dir.label, total: dir.ts.total,
                        polarite: dir.ts.polarite, nuance, nhri: nhriIdx,
                        nhri_mult: +nhriMult.toFixed(2),
                        foreground: isForeground,
                        theme: ustTheme ? ustTheme.theme : "typo_shadow",
                        penalty: +rawPen.toFixed(2)
                    });
                }
            }
            return results;
        }

        let shadowPenForeground = 0;
        let shadowPenBackoffice = 0;
        const shadowDetailsForeground = [];
        const shadowDetailsBackoffice = [];

        // Foreground: explicit ombre houses from typology
        for (const h of ombreHouses) {
            const nuance = ombreNuance[h] || "standard";
            const results = evaluateShadowHouse(h, nuance, null, true);
            for (const r of results) {
                shadowPenForeground += r.penalty;
                shadowDetailsForeground.push(r);
            }
        }

        // Backoffice: universal shadow houses NOT already covered by typology
        for (const hStr of Object.keys(UNIVERSAL_SHADOW_THEMES)) {
            const h = +hStr;
            if (allTypoHouses.has(h)) continue;
            const results = evaluateShadowHouse(h, "standard", null, false);
            for (const r of results) {
                shadowPenBackoffice += r.penalty;
                shadowDetailsBackoffice.push(r);
            }
        }

        // Compounding across ALL shadow activations (foreground + backoffice)
        const allShadowDetails = [...shadowDetailsForeground, ...shadowDetailsBackoffice];
        const shadowByDir = {};
        for (const sd of allShadowDetails) {
            if (!shadowByDir[sd.direction]) shadowByDir[sd.direction] = [];
            shadowByDir[sd.direction].push(sd);
        }
        let compoundingPen = 0;
        for (const dir of Object.keys(shadowByDir)) {
            const heavyCount = shadowByDir[dir].length;
            if (heavyCount >= 2) {
                const massiveInDir = shadowByDir[dir].filter(sd => sd.total >= SHADOW_MASSIVE_THRESHOLD).length;
                compoundingPen += (heavyCount - 1) * 0.4 + massiveInDir * 0.3;
            }
        }

        const maxFgPen = isParentChildShadow ? 3.0 : 4.0;
        shadowPenForeground = Math.min(shadowPenForeground, maxFgPen);
        shadowPenBackoffice = Math.min(shadowPenBackoffice, 2.5);
        compoundingPen = Math.min(compoundingPen, 2.0);

        const totalShadowPen = shadowPenForeground + shadowPenBackoffice + compoundingPen;

        if (totalShadowPen > 0.1) {
            p4 -= totalShadowPen;
            penalties.p4.push({
                id: "shadow_house_activation",
                foreground_details: shadowDetailsForeground,
                backoffice_details: shadowDetailsBackoffice,
                foreground_penalty: +shadowPenForeground.toFixed(2),
                backoffice_penalty: +shadowPenBackoffice.toFixed(2),
                compounding: +compoundingPen.toFixed(2),
                malus: +(-totalShadowPen).toFixed(1)
            });
            detail.pilier4.shadow_foreground = shadowDetailsForeground;
            detail.pilier4.shadow_backoffice = shadowDetailsBackoffice;
            detail.pilier4.shadow_compounding = +compoundingPen.toFixed(2);
        }

        // P4-QUALITY: Qualité d'activation des maisons principales (modulée par NHRI)
        if (typoConf.principales) {
            let principalQuality = 0;
            const principalQualityDetails = [];
            for (const h of typoConf.principales) {
                const tsBinAP = tsBinA[h] || { tension: 0, support: 0, total: 0, polarite: "mixte" };
                const tsAinBP = tsAinB[h] || { tension: 0, support: 0, total: 0, polarite: "mixte" };
                const combinedTotal = tsBinAP.total + tsAinBP.total;
                if (combinedTotal < 15) continue;

                const combinedSupport = tsBinAP.support + tsAinBP.support;
                const combinedTension = tsBinAP.tension + tsAinBP.tension;
                const combinedAll = combinedSupport + combinedTension || 1;
                const qualityRatio = (combinedSupport - combinedTension) / combinedAll;

                const nhriAvg = (((_nhriA || {})[h]?.index || 1.0) + ((_nhriB || {})[h]?.index || 1.0)) / 2;

                if (qualityRatio > 0.3) {
                    const bon = Math.min(combinedTotal / 80, 1) * 0.4 * nhriAvg;
                    principalQuality += bon;
                    principalQualityDetails.push({ house: h, ratio: +qualityRatio.toFixed(2), nhri: +nhriAvg.toFixed(2), bonus: +bon.toFixed(2) });
                } else if (qualityRatio < -0.3) {
                    const nhriPenMult = 2.0 - nhriAvg;
                    const pen = Math.min(combinedTotal / 80, 1) * 0.3 * nhriPenMult;
                    principalQuality -= pen;
                    principalQualityDetails.push({ house: h, ratio: +qualityRatio.toFixed(2), nhri: +nhriAvg.toFixed(2), malus: +(-pen).toFixed(2) });
                }
            }
            principalQuality = Math.max(-2.0, Math.min(2.0, principalQuality));
            if (Math.abs(principalQuality) > 0.05) {
                p4 += principalQuality;
                detail.pilier4.principal_quality = +principalQuality.toFixed(2);
                detail.pilier4.principal_quality_details = principalQualityDetails;
            }
        }
    }

    // v4.0 — Planètes assiégées (portage THEME) : pénalité si planète personnelle clé assiégée entre deux maléfiques
    const _allBesieged = [...besiegedA.map(b => ({ ...b, chart: "A" })), ...besiegedB.map(b => ({ ...b, chart: "B" }))];
    const _besiegedPersonal = _allBesieged.filter(b => ["Soleil","Lune","Mercure","Vénus"].includes(b.planet));
    if (_besiegedPersonal.length > 0) {
        const besiegedMalus = +(-0.5 * _besiegedPersonal.filter(b => b.severity === "STRICTE").length + -0.25 * _besiegedPersonal.filter(b => b.severity === "ATTÉNUÉE").length).toFixed(1);
        if (besiegedMalus < 0) {
            p4 += besiegedMalus;
            penalties.p4.push({ id: "besieged_personal", malus: besiegedMalus, detail: _besiegedPersonal.map(b => `${b.planet}(${b.chart}) entre ${b.between.join("/")} [${b.severity}]`).join("; ") });
        }
    }
    detail.pilier4.besieged = _allBesieged;

    // v4.0 — Forme du thème Jones (portage THEME) : complémentarité des formes
    detail.pilier4.chart_shape_a = chartShapeA;
    detail.pilier4.chart_shape_b = chartShapeB;
    if (chartShapeA.singleton && chartShapeB.singleton) {
        const singletonOverlap = chartShapeA.singleton.split("/").some(s => chartShapeB.singleton.split("/").includes(s));
        if (singletonOverlap) {
            p4 += 0.5;
            bonuses.p4.push({ id: "singleton_overlap", bonus: 0.5, detail: `Singleton commun ${chartShapeA.singleton}` });
        }
    }

    p4 = Math.max(0, Math.min(20, p4));
    detail.pilier4.total = +p4.toFixed(1);
    detail.pilier4.penalties = penalties.p4;
    detail.pilier4.bonuses = bonuses.p4;

    // ====== PILIER 5 — TYPOLOGY FITNESS (v4.2.1 = revert v4.2.0) ===============
    // Diagnostic v4.1.0 : les 4 piliers ne consultent jamais la grille
    // typologique des maisons. Conséquence : Beauvoir/Sartre Amour et Coloc
    // sortent à 46/46 sur deux typologies pourtant très différentes
    // (princ Amour=[5,7,8] vs princ Coloc=[4,6,2]).
    //
    // v4.2.0 (B6) : ce pilier mesure la CONCENTRATION de l'overlay (poids des
    // planètes étrangères dans les maisons natales) sur les maisons typologi-
    // quement pertinentes. Une concentration forte sur les principales = bonne
    // adéquation à la typologie. Score ∈ [0,15], poids ~12.5% du final.
    //
    // v4.3.0 a tenté deux variantes (B7 symétrique × 50, B7.1 asymétrique
    // -60/+25) qui ont AMPLIFIÉ le pilier mais aussi sur-récompensé les
    // témoins fortuitement alignés. Cohérence stricte 45.7% → 42.2% sur n=62.
    // → REVERT v4.2.0 (cf. SYN-PATCH-PROPOSAL.md "v4.3.0 abandonné").
    //
    // Pour décompresser plus loin, l'amélioration ne passe PAS par sur-pondérer
    // le pilier 5 (l'effet rebondit sur les témoins) mais par d'autres pistes
    // documentées dans le rapport (typology-aware fluidite/intensite, etc.).
    function _computeTypoFitness(overlay1, overlay2, typoConf) {
        const princ = typoConf?.principales || [];
        const sec   = typoConf?.secondaires || [];
        if (!princ.length) {
            return { score: 12.5, wPrinc: 0, wSec: 0, wOth: 0, concentration: 0.5, note: "no_principal_houses" };
        }
        const all12 = [1,2,3,4,5,6,7,8,9,10,11,12];
        const others = all12.filter(h => !princ.includes(h) && !sec.includes(h));
        function avgOverlayWeight(overlay, houses) {
            if (!houses.length) return 0;
            let total = 0;
            for (const h of houses) {
                const entries = overlay[h] || [];
                for (const e of entries) {
                    let w = (e.poids || 0) * (e.planete_cle_typo ? 1.5 : 1.0);
                    if (e.dignite === "Domicile" || e.dignite === "Exaltation") w *= 1.20;
                    else if (e.dignite === "Exil" || e.dignite === "Chute") w *= 0.75;
                    if (BENEFIC_OVERLAY.has(e.planete)) w *= 1.10;
                    else if (MALEFIC_OVERLAY.has(e.planete)) w *= 0.85;
                    if (e.retrograde) w *= 0.90;
                    total += Math.max(0, w);
                }
            }
            return total / houses.length;
        }
        const wPrinc = (avgOverlayWeight(overlay1, princ)  + avgOverlayWeight(overlay2, princ))  / 2;
        const wSec   = (avgOverlayWeight(overlay1, sec)    + avgOverlayWeight(overlay2, sec))    / 2;
        const wOth   = (avgOverlayWeight(overlay1, others) + avgOverlayWeight(overlay2, others)) / 2;
        const totalRef = wPrinc + wSec + wOth + 0.001;
        const concentration = (wPrinc * 1.0 + wSec * 0.5) / totalRef;
        // v4.2.0/v4.2.1 : score = concentration × 15, range [0,15].
        return {
            score: +Math.max(0, Math.min(15, concentration * 15)).toFixed(1),
            wPrinc: +wPrinc.toFixed(1),
            wSec: +wSec.toFixed(1),
            wOth: +wOth.toFixed(1),
            concentration: +concentration.toFixed(3)
        };
    }
    const _p5Result = _computeTypoFitness(overlayBinA, overlayAinB, typoConf);
    const p5 = _p5Result.score;
    detail.pilier5_typology = _p5Result;

    // ====== SCORE FINAL (normalisation 120→100, pilier 5 v4.2.0) ============
    // Évolution diviseur : v4.1.0=105 (p1+p2+p3+p4) → v4.2.0=120 (+p5=15).
    // v4.3.0 (130, 125) abandonné. Retour stable à 120.
    const raw = (detail.pilier1.total || 0) + p2 + p3 + p4 + p5;
    const final = Math.max(0, Math.min(100, Math.round(raw * 100 / 120)));

    const totalPenalties = [...penalties.p1, ...penalties.p2, ...penalties.p3, ...penalties.p4]
        .map(p => ({ ...p, malus: +((typeof p.malus === 'number') ? p.malus.toFixed(1) : p.malus) * 1 }));
    const totalMalus = totalPenalties.reduce((s, p) => s + p.malus, 0);
    const totalBonuses = [...bonuses.p1, ...bonuses.p2, ...bonuses.p3, ...bonuses.p4]
        .map(b => ({ ...b, bonus: +((typeof b.bonus === 'number') ? (+b.bonus).toFixed(1) : b.bonus) * 1 }));
    const totalBonusSum = totalBonuses.reduce((s, b) => s + b.bonus, 0);

    // ====== DUAL SCORE : Fluidité & Intensité ======
    const _dsPosW = detail.pilier1.positiveW || 0;
    const _dsNegW = detail.pilier1.negativeW || 0;
    const _dsTotalW = _dsPosW + _dsNegW || 1;
    const _dsRatio = detail.pilier1.ratio || 0.5;
    const _dsElemRel = detail.pilier4.element_relation || "";
    const _dsCompRatio = detail.pilier3.composite_ratio || 0.5;
    const _dsExacts = (detail.pilier1.exact_bonus || 0) + (detail.pilier1.exact_bonus_personal || 0);
    const _dsKarmic = detail.pilier2.nodal_karmique || 0;
    const _dsDwH = detail.pilier1.double_whammy_harmony || 0;
    const _dsDwT = (penalties.p1.find(p => p.id === "double_whammy_tension") || {}).count || 0;
    const _dsP2P = detail.pilier1.personal_to_personal_count || 0;
    const _dsShadow = (detail.pilier4.shadow_foreground || []).length + (detail.pilier4.shadow_backoffice || []).length;

    let fluidite = 15 + _dsRatio * 55;
    if (_dsElemRel === "harmonie") fluidite += 8;
    else if (_dsElemRel === "complementaire" || _dsElemRel === "neutre") fluidite += 4;
    else if (_dsElemRel === "tension") fluidite -= 3;
    fluidite += Math.min(totalBonusSum, 6) * 1.5;
    fluidite += Math.max(totalMalus, -8) * 0.8;
    fluidite += (_dsCompRatio - 0.5) * 16;
    fluidite = Math.max(0, Math.min(100, Math.round(fluidite)));

    // v4.1.0 — B2 : recalibrer intensité. Avant, somme max = 97 → 99% des
    // couples sortaient ≥ 75 (« Très intense ») et la métrique n'était plus
    // discriminante. Caps revus à la baisse + pente plus douce sur _dsTotalW.
    // Nouvelle somme max théorique ≈ 84 (vs 97), distribution centrée ~50.
    let intensite = 8;
    intensite += Math.min(_dsTotalW / 3.5, 22);
    intensite += Math.min(_dsExacts, 8) * 1.8;
    intensite += Math.min(_dsKarmic, 8) * 1.0;
    intensite += Math.min(_dsDwH + _dsDwT, 5) * 2.0;
    intensite += Math.min(totalPenalties.length + totalBonuses.length, 12) * 0.8;
    intensite += Math.min(_dsP2P, 10) * 0.7;
    intensite += Math.min(_dsShadow, 4) * 1.3;
    intensite = Math.max(0, Math.min(100, Math.round(intensite)));

    // ====== CORRECTIF DE VIABILITÉ RELATIONNELLE (v4.1.0 bidirectionnel) ======
    // Quand l'intensité dépasse largement la fluidité, le score brut surestime
    // la qualité vécue de la relation → pénalité.
    // À l'inverse (v4.1.0), une fluidité ≫ intensité (relation paisible et
    // équilibrée) mérite un petit bonus de viabilité.
    // v5.0.0 — Correctif de viabilité durci : seuil 15 → 12, coef 0.25 → 0.35,
    // cap 15 → 16. Décision validée sur le bench : un profil "Très intense / Fluide
    // modéré" doit être pénalisé plus tôt, sinon les couples passionnels-instables
    // ressortent avec des scores trop élevés (faux positifs Amour observés en prod).
    const _viabDeltaPenal = Math.max(0, intensite - fluidite - 12);
    const _viabDeltaBonus = Math.max(0, fluidite - intensite - 15);
    const _viabCorrection = Math.min(_viabDeltaPenal * 0.35, 16) - Math.min(_viabDeltaBonus * 0.20, 8);
    const finalCorrected = Math.max(0, Math.min(100, Math.round(final - _viabCorrection)));

    // ====== ÉTIREMENT v5.0.0 — DIRE LA VÉRITÉ AVEC ASYMÉTRIE =================
    // v4.3.0 utilisait α=2.0 partout (pivot 60). Effet collatéral observé en
    // prod : couples « Fluide / Très intense » avec ground truth de séparation
    // (cf. Ludwig × Mélanie, 2 séparations) qui ressortaient à 84 → faux
    // positif clinique « Alchimie remarquable ».
    //
    // v5.0.0 — Stretch ASYMÉTRIQUE :
    //   - Sous le pivot (55) : α = 1.8 (les échecs restent des échecs)
    //   - Au-dessus du pivot : α = 1.4 (compresse le haut, évite les faux
    //     « exceptionnels » qui n'ont pas la fluidité associée)
    //   - Pivot abaissé à 55 (médiane bench corrigée).
    //
    // Formule :
    //   if (finalCorrected >= 55) score = clamp(50 + (finalCorrected − 55) × 1.4)
    //   else                       score = clamp(50 + (finalCorrected − 55) × 1.8)
    //
    // Combiné au veto qualitatif (cf. plus bas) qui cappe la bande supérieure
    // pour les profils à signaux d'échec critiques (M7 vide + SN dominant,
    // pluton+uranus+poisoned+SN, etc.).
    //
    // Traçabilité : score_brut et score_compressed conservés en sortie.
    const STRETCH_PIVOT = 55;
    const STRETCH_ALPHA_HIGH = 1.4;
    const STRETCH_ALPHA_LOW = 1.8;
    const _stretchAlpha = finalCorrected >= STRETCH_PIVOT ? STRETCH_ALPHA_HIGH : STRETCH_ALPHA_LOW;
    let finalStretched = Math.max(0, Math.min(100,
        Math.round(50 + (finalCorrected - STRETCH_PIVOT) * _stretchAlpha)
    ));

    const _dsFluidLabel = fluidite >= 70 ? "Très fluide" : fluidite >= 50 ? "Fluide" : fluidite >= 35 ? "Modéré" : "Tendu";
    const _dsFluidLabelEN = fluidite >= 70 ? "Very fluid" : fluidite >= 50 ? "Fluid" : fluidite >= 35 ? "Moderate" : "Tense";
    // v4.1.0 — B2 : seuils relevés (avant : ≥75 « Très intense », sortie 99%).
    const _dsIntenLabel = intensite >= 70 ? "Très intense" : intensite >= 55 ? "Intense" : intensite >= 35 ? "Modéré" : "Calme";
    const _dsIntenLabelEN = intensite >= 70 ? "Very intense" : intensite >= 55 ? "Intense" : intensite >= 35 ? "Moderate" : "Calm";

    // v5.0.0 — Le score étiré peut être abaissé par :
    //   (a) le Pilier 6 « Cohérence typologique des maisons » (calculé EN AVAL,
    //       car il a besoin de scores.houses_norm_*) → le score sera recalculé
    //       et substitué par finalizeWithPilier6Houses() dans le code principal
    //   (b) le veto qualitatif appliqué EN AVAL également (cap à 64 si signaux
    //       d'échec critiques pour la typologie)
    // Pour traçabilité, on expose ici les valeurs nécessaires au recalcul.
    return {
        score: finalStretched,
        score_brut: final,
        score_compressed: finalCorrected,
        stretch: { pivot: STRETCH_PIVOT, alpha_high: STRETCH_ALPHA_HIGH, alpha_low: STRETCH_ALPHA_LOW, alpha_used: _stretchAlpha },
        fluidite: fluidite,
        intensite: intensite,
        // Données nécessaires à la finalisation (P6 + veto)
        _finalize_ctx: {
            raw_no_p6: (detail.pilier1.total || 0) + p2 + p3 + p4 + p5,
            p1: detail.pilier1.total || 0, p2: p2, p3: p3, p4: p4, p5: p5,
            penalties_items: totalPenalties,
            double_whammy_harmony: detail.pilier1.double_whammy_harmony || 0,
            typoConf: typoConf
        },
        dual_score: {
            fluidite: { score: fluidite, label: _dsFluidLabel, label_en: _dsFluidLabelEN },
            intensite: { score: intensite, label: _dsIntenLabel, label_en: _dsIntenLabelEN },
            profil: `${_dsFluidLabel} / ${_dsIntenLabel}`,
            profil_en: `${_dsFluidLabelEN} / ${_dsIntenLabelEN}`,
            viability_correction: _viabCorrection !== 0 ? {
                delta_penal: _viabDeltaPenal,
                delta_bonus: _viabDeltaBonus,
                delta: _viabDeltaPenal,
                correction: -Math.round(_viabCorrection * 10) / 10,
                score_brut: final,
                score_corrige: finalCorrected,
                direction: _viabCorrection > 0 ? "penalty" : "bonus"
            } : null
        },
        version: "v5.0.0",
        qualitative_band: getQualitativeBand(finalStretched, typoConf?.label_fr || ""),
        detail: {
            pilier1_aspectual: detail.pilier1,
            pilier2_karmique: detail.pilier2,
            pilier3_composite: detail.pilier3,
            pilier4_structural: detail.pilier4,
            pilier5_typology: detail.pilier5_typology,
            penalties_summary: {
                total_penalties: totalPenalties.length,
                total_malus: +totalMalus.toFixed(1),
                items: totalPenalties
            },
            bonuses_summary: {
                total_bonuses: totalBonuses.length,
                total_bonus: +totalBonusSum.toFixed(1),
                items: totalBonuses
            }
        }
    };
}

function getQualitativeBand(score, typoLabel) {
    const tl = (typoLabel || "").toLowerCase();
    const isParent = tl.includes("parent") || tl.includes("enfant");
    const isAmour = tl.includes("amour") || tl.includes("romantique");
    const isBiz = tl.includes("business") || tl.includes("professionnel");

    // v5.0.0 — Toutes les bandes exposent désormais `band_en` et `desc_en` en
    // plus de `band` / `desc_fr`. Les rapports HTML/PDF (Tech, Final, Données
    // Techniques) doivent préférer la variante EN quand `isEN === true`.
    if (isParent) {
        if (score >= 78) return { band: "Harmonie naturelle", band_en: "Natural harmony", desc_fr: "Lien parent-enfant fluide, compréhension instinctive mutuelle", desc_en: "Smooth parent-child bond with instinctive mutual understanding", color: "#16a34a" };
        if (score >= 65) return { band: "Lien profond avec défis structurants", band_en: "Deep bond with formative challenges", desc_fr: "Relation formatrice, forte connexion karmique avec des zones de friction nécessaires à la croissance", desc_en: "Formative relationship with strong karmic connection and growth-essential friction areas", color: "#2563eb" };
        if (score >= 50) return { band: "Relation complexe mais transformatrice", band_en: "Complex but transformative bond", desc_fr: "Des incompréhensions fondamentales coexistent avec un lien profond — la relation forge le caractère", desc_en: "Fundamental misunderstandings coexist with a deep link — the relationship shapes character", color: "#d97706" };
        return { band: "Tensions structurelles profondes", band_en: "Deep structural tensions", desc_fr: "Des dynamiques lourdes nécessitant un travail conscient — le lien karmique existe mais avec des schémas répétitifs", desc_en: "Heavy dynamics requiring conscious work — the karmic link exists but with repetitive patterns", color: "#dc2626" };
    }
    if (isAmour) {
        // v5.0.0 — "Alchimie remarquable" renommé "Magnétisme fort" : la promesse
        // d'alchimie suggérait une longévité que le moteur ne peut pas garantir.
        // Le veto qualitatif + le P6 cohérence-typo des maisons rendent désormais
        // ce palier vraiment exigeant à atteindre.
        if (score >= 80) return { band: "Magnétisme fort", band_en: "Strong magnetism", desc_fr: "Compatibilité élevée — fort magnétisme, harmonie aspectuelle et fondations structurelles solides. La longévité dépend du travail conjoint des deux partenaires.", desc_en: "High compatibility — strong magnetism, aspectual harmony and solid structural foundations. Longevity depends on the joint work of both partners.", color: "#16a34a" };
        if (score >= 65) return { band: "Bonne compatibilité avec zones de croissance", band_en: "Good compatibility with growth zones", desc_fr: "Attrait réel et fondations solides, mais des ajustements nécessaires", desc_en: "Real attraction and solid foundations, but necessary adjustments", color: "#2563eb" };
        if (score >= 50) return { band: "Relation stimulante et exigeante", band_en: "Stimulating and demanding relationship", desc_fr: "La passion coexiste avec les frictions — potentiel de croissance mutuelle si les deux s'engagent", desc_en: "Passion coexists with friction — potential for mutual growth if both partners commit", color: "#d97706" };
        return { band: "Tensions dominantes", band_en: "Dominant tensions", desc_fr: "Les défis relationnels l'emportent — relation possible mais énergivore", desc_en: "Relational challenges prevail — relationship possible but energy-draining", color: "#dc2626" };
    }
    if (isBiz) {
        if (score >= 75) return { band: "Synergie professionnelle forte", band_en: "Strong professional synergy", desc_fr: "Compétences complémentaires, vision alignée", desc_en: "Complementary skills, aligned vision", color: "#16a34a" };
        if (score >= 60) return { band: "Partenariat viable avec ajustements", band_en: "Viable partnership with adjustments", desc_fr: "Base solide mais des domaines de friction à anticiper", desc_en: "Solid foundation but friction zones to anticipate", color: "#2563eb" };
        if (score >= 45) return { band: "Collaboration exigeante", band_en: "Demanding collaboration", desc_fr: "Nécessite des rôles bien définis et une communication structurée", desc_en: "Requires well-defined roles and structured communication", color: "#d97706" };
        return { band: "Risque de blocages", band_en: "Risk of deadlocks", desc_fr: "Les dynamiques de pouvoir et les incompatibilités structurelles dominent", desc_en: "Power dynamics and structural incompatibilities dominate", color: "#dc2626" };
    }
    if (score >= 75) return { band: "Compatibilité forte", band_en: "Strong compatibility", desc_fr: "Lien naturel et fluide", desc_en: "Natural and smooth bond", color: "#16a34a" };
    if (score >= 60) return { band: "Compatibilité modérée", band_en: "Moderate compatibility", desc_fr: "Des forces et des défis équilibrés", desc_en: "Balanced strengths and challenges", color: "#2563eb" };
    if (score >= 45) return { band: "Relation de croissance", band_en: "Growth relationship", desc_fr: "Des frictions formatrices coexistent avec un potentiel réel", desc_en: "Formative friction coexists with real potential", color: "#d97706" };
    return { band: "Compatibilité difficile", band_en: "Challenging compatibility", desc_fr: "Les tensions dominent — nécessite un effort conscient", desc_en: "Tensions prevail — conscious effort needed", color: "#dc2626" };
}

// ====== v5.0.0 — PILIER 6 : COHÉRENCE TYPOLOGIQUE DES MAISONS =================
// Mesure si l'activation des maisons clés de la typologie est COHÉRENTE avec
// la note globale. Comble la dissonance « note globale élevée + maisons typo
// faibles » identifiée comme principale cause de faux positifs cliniques.
//
// Calcul (cap [-2, +6]) :
//   - Moyenne pondérée des maisons normalisées (0-100), 70% principales / 30% secondaires
//   - Moyennée dans les 2 directions (A→B et B→A)
//   - Pénalité d'asymétrie : si l'une des deux directions est ≫ l'autre (>15 d'écart)
//   - Pénalité par maison clé en POLARITÉ TENSION (ratio support/tension < -0.25)
//   - Pénalité par maison d'OMBRE en foreground tendu
//
// Référence : doc workflow §3.5 "Score global — Architecture", note v5.0.0.
function computePilier6HousesCoherence(housesNormBinA, housesNormAinB, tensionBinA, tensionAinB, typoConf) {
    const principales = (typoConf?.principales || [5, 7]).slice();
    const secondaires = (typoConf?.secondaires || []).slice();
    const ombre = new Set(typoConf?.ombre || []);

    function avgOnSet(set, dirMap) {
        let s = 0, n = 0;
        for (const h of set) {
            const v = dirMap?.[h] ?? dirMap?.[String(h)];
            if (typeof v === "number") { s += v; n++; }
        }
        return n > 0 ? s / n : 0;
    }

    const aP_AB = avgOnSet(principales, housesNormAinB);
    const aP_BA = avgOnSet(principales, housesNormBinA);
    const aS_AB = secondaires.length ? avgOnSet(secondaires, housesNormAinB) : aP_AB;
    const aS_BA = secondaires.length ? avgOnSet(secondaires, housesNormBinA) : aP_BA;
    const avgAB = aP_AB * 0.7 + aS_AB * 0.3;
    const avgBA = aP_BA * 0.7 + aS_BA * 0.3;
    const avgGlobal = (avgAB + avgBA) / 2;

    const asym = Math.abs(avgAB - avgBA);
    const asymPenalty = Math.max(0, (asym - 15) * 0.15);

    let tensionCount = 0;
    for (const h of [...principales, ...secondaires]) {
        const tab = tensionAinB?.[h] || tensionAinB?.[String(h)];
        const tba = tensionBinA?.[h] || tensionBinA?.[String(h)];
        if (tab && tab.polarite === "tension") tensionCount++;
        if (tba && tba.polarite === "tension") tensionCount++;
    }
    const tensionPenalty = Math.min(tensionCount, 4) * 0.4;

    let shadowPenalty = 0;
    for (const h of ombre) {
        const tab = tensionAinB?.[h] || tensionAinB?.[String(h)];
        const tba = tensionBinA?.[h] || tensionBinA?.[String(h)];
        if (tab && tab.total > 50 && tab.polarite === "tension") shadowPenalty += 0.5;
        if (tba && tba.total > 50 && tba.polarite === "tension") shadowPenalty += 0.5;
    }
    shadowPenalty = Math.min(shadowPenalty, 2.5);

    let p6 = (avgGlobal / 100) * 8 - asymPenalty - tensionPenalty - shadowPenalty;
    p6 = Math.max(-2, Math.min(6, p6));

    return {
        score: +p6.toFixed(2),
        avg_principales_a_in_b: +aP_AB.toFixed(1),
        avg_principales_b_in_a: +aP_BA.toFixed(1),
        avg_secondaires_a_in_b: +aS_AB.toFixed(1),
        avg_secondaires_b_in_a: +aS_BA.toFixed(1),
        avg_a_in_b: +avgAB.toFixed(1),
        avg_b_in_a: +avgBA.toFixed(1),
        avg_global: +avgGlobal.toFixed(1),
        asymmetry: +asym.toFixed(1),
        asymmetry_penalty: +asymPenalty.toFixed(2),
        tension_count: tensionCount,
        tension_penalty: +tensionPenalty.toFixed(2),
        shadow_penalty: +shadowPenalty.toFixed(2),
        cap: [-2, 6]
    };
}

// ====== v5.0.0 — VETO QUALITATIF =============================================
// Détecte les configurations astrologiques fortement défavorables que le score
// quantitatif n'arrive pas à pénaliser suffisamment (effets de cap, asymétries
// invisibles). En cas de signaux d'échec critiques, le score étiré est CAPPÉ
// à 64 (haut de la bande "Stimulante exigeante" / "Modérée"), empêchant
// d'attribuer une étiquette fortement positive.
//
// Cas-école : Ludwig × Mélanie (typo Amour, séparé 2 fois) — score brut 79
// → étiré 84 (« Magnétisme fort ») en v4.3.0 alors que :
//   - Maison 7 (engagement) quasi-vide côté Mélanie (norm=19)
//   - South Node dominant + Pluton hard + Uranus affectif + 5 fusions empoisonnées
//   - Profil dual « Fluide / Très intense » (delta intensité-fluidité = 25)
//
// Application : EN AVAL de computeGlobalScoreV3, dans le code principal,
// après le calcul des house norm/tension support.
function detectSynVeto(globalScoreDetail, dualScore, scoresHouseObj, typoConf) {
    const typoLbl = (typoConf?.label_fr || "").toLowerCase();
    const isAmour = typoLbl.includes("amour") || typoLbl.includes("romantique");
    if (!isAmour) return { vetoed: false, reasons: [] };

    const gd = globalScoreDetail || {};
    const pen = (gd.penalties_summary?.items || []);
    const dwH = (gd.pilier1_aspectual?.double_whammy_harmony || 0);
    const find = id => pen.find(p => p.id === id);
    const pluton = find("pluton_hard_personal");
    const uranus = find("uranus_hard_affective");
    const poisoned = find("poisoned_fusions_debilitated");
    const sn_dom = find("south_node_dominance");
    const dw_t = find("double_whammy_tension");
    const reasons = [];

    // V1 — Maison 7 (engagement) faible/tendue + south node dominant
    if (sn_dom && scoresHouseObj) {
        const m7_ab = scoresHouseObj.houses_norm_a_in_b?.["7"];
        const m7_ba = scoresHouseObj.houses_norm_b_in_a?.["7"];
        const ts7_ab = scoresHouseObj.tension_support_a_in_b?.["7"];
        const ts7_ba = scoresHouseObj.tension_support_b_in_a?.["7"];
        const m7Empty = (typeof m7_ab === "number" && m7_ab < 25) || (typeof m7_ba === "number" && m7_ba < 25);
        const m7Tension = (ts7_ab?.polarite === "tension") || (ts7_ba?.polarite === "tension");
        if (m7Empty || m7Tension) reasons.push("M7_weak_with_SN_dominance");
    }
    // V2 — Quartet destructeur : Pluton + Uranus + Fusions empoisonnées + SN
    if (pluton && uranus && poisoned && sn_dom) reasons.push("destructive_quartet");
    // V3 — Explosion d'intensité avec fusions empoisonnées
    const F = dualScore?.fluidite?.score ?? 50;
    const I = dualScore?.intensite?.score ?? 50;
    if ((I - F) >= 30 && (poisoned?.count || 0) >= 4) reasons.push("intensity_explosion");
    // V4 — DW tension dominant en typologie Amour
    const dwT = dw_t?.count || 0;
    if (dwT > 0 && dwT >= dwH * 0.7 && (poisoned?.count || 0) >= 3) reasons.push("dw_tension_dominant");

    return { vetoed: reasons.length > 0, reasons };
}

// ====== v5.0.0 — FINALISATION DU SCORE GLOBAL =================================
// Intègre le Pilier 6 (cohérence typologique des maisons), recalcule la viability
// correction et l'étirement asymétrique, puis applique le veto qualitatif.
// Ré-écrit globalScoreResult.score, qualitative_band et detail.pilier6_typo_houses.
function finalizeGlobalScoreWithPilier6(globalScoreResult, housesNormBinA, housesNormAinB, tensionBinA, tensionAinB, scoresHouseObj, typoConf) {
    const ctx = globalScoreResult._finalize_ctx;
    if (!ctx) return globalScoreResult;

    const p6Result = computePilier6HousesCoherence(housesNormBinA, housesNormAinB, tensionBinA, tensionAinB, typoConf);
    const p6 = p6Result.score;

    // Score brut intégrant P6 — diviseur 126 (cap théorique max 35+30+20+20+15+6=126)
    const raw = ctx.raw_no_p6 + p6;
    const final = Math.max(0, Math.min(100, Math.round(raw * 100 / 126)));

    // Viability (mêmes paramètres que v5.0.0 dans computeGlobalScoreV3)
    const F = globalScoreResult.fluidite ?? 50;
    const I = globalScoreResult.intensite ?? 50;
    const _viabDeltaPenal = Math.max(0, I - F - 12);
    const _viabDeltaBonus = Math.max(0, F - I - 15);
    const _viabCorrection = Math.min(_viabDeltaPenal * 0.35, 16) - Math.min(_viabDeltaBonus * 0.20, 8);
    const finalCorrected = Math.max(0, Math.min(100, Math.round(final - _viabCorrection)));

    // Stretch asymétrique
    const STRETCH_PIVOT = 55, STRETCH_ALPHA_HIGH = 1.4, STRETCH_ALPHA_LOW = 1.8;
    const _alpha = finalCorrected >= STRETCH_PIVOT ? STRETCH_ALPHA_HIGH : STRETCH_ALPHA_LOW;
    let finalStretched = Math.max(0, Math.min(100,
        Math.round(50 + (finalCorrected - STRETCH_PIVOT) * _alpha)
    ));

    // Veto qualitatif
    const veto = detectSynVeto(globalScoreResult.detail, globalScoreResult.dual_score, scoresHouseObj, typoConf);
    let vetoApplied = null;
    if (veto.vetoed && finalStretched > 64) {
        vetoApplied = { capped_from: finalStretched, capped_to: 64, reasons: veto.reasons };
        finalStretched = 64;
    }

    // Mise à jour du résultat
    globalScoreResult.score = finalStretched;
    globalScoreResult.score_brut = final;
    globalScoreResult.score_compressed = finalCorrected;
    globalScoreResult.stretch = { pivot: STRETCH_PIVOT, alpha_high: STRETCH_ALPHA_HIGH, alpha_low: STRETCH_ALPHA_LOW, alpha_used: _alpha };
    if (globalScoreResult.dual_score) {
        globalScoreResult.dual_score.viability_correction = _viabCorrection !== 0 ? {
            delta_penal: _viabDeltaPenal,
            delta_bonus: _viabDeltaBonus,
            delta: _viabDeltaPenal,
            correction: -Math.round(_viabCorrection * 10) / 10,
            score_brut: final,
            score_corrige: finalCorrected,
            direction: _viabCorrection > 0 ? "penalty" : "bonus"
        } : null;
    }
    if (globalScoreResult.detail) {
        globalScoreResult.detail.pilier6_typo_houses = p6Result;
        if (vetoApplied) globalScoreResult.detail.qualitative_veto = vetoApplied;
    }
    globalScoreResult.qualitative_band = getQualitativeBand(finalStretched, typoConf?.label_fr || "");
    return globalScoreResult;
}

// ====== v6.0.0 — computeGlobalHIScore =======================================
// Score global v6 issu directement de l'agrégation des Hm/Im par maison,
// avec pondération typologique. Cohérent par construction avec les notes
// affichées dans les cartouches.
//
// Sortie :
//   harmony   : 0..100, source de vérité côté UI (= ce qu'on affiche au client)
//   intensity : 0..100, INTERNE — sert à choisir la bande qualitative et
//               brider Gemini, jamais affiché au client
//   qualitative_band_v6 : { band, desc, band_en, desc_en, color } selon (H, I)
//   dominant_signature_global : "fluid" | "tense" | "transformative" |
//                               "karmic" | "contrasted" | "lukewarm"
//   detail_v6 : breakdown pour debug
function computeGlobalHIScore(houseHIBinA, houseHIAinB, typoConf, langue, directionalWeights, extras = {}) {
    const principales = (typoConf?.principales) || [];
    const secondaires = (typoConf?.secondaires) || [];
    const isPrinc = (h) => principales.includes(h);
    const isSec = (h) => secondaires.includes(h);

    // v6.3.0 — Q7 astrologue : pondération directionnelle pour Parent/Enfant.
    // Par défaut symétrique 50/50. Pour Parent/Enfant, le rôle "parent" pèse
    // 70 %, le rôle "enfant" 30 % (la planète lourde du parent sculpte la
    // planète rapide de l'enfant, pas l'inverse).
    const wBA = (directionalWeights && typeof directionalWeights.b_in_a === "number") ? directionalWeights.b_in_a : 0.5;
    const wAB = (directionalWeights && typeof directionalWeights.a_in_b === "number") ? directionalWeights.a_in_b : 0.5;

    let sumH = 0, sumI = 0, sumW = 0;
    let sumH_princ = 0, sumW_princ = 0;
    const classCounts = { fluid: 0, tension_blocking: 0, fusion_neutral: 0, transformative: 0, karmic: 0, destabilizing: 0 };
    const perHouse = {};

    for (let h = 1; h <= 12; h++) {
        const a = houseHIBinA[h] || { harmony: 50, intensity: 0 };
        const b = houseHIAinB[h] || { harmony: 50, intensity: 0 };
        const Hm = Math.round((a.harmony * wBA + b.harmony * wAB) / (wBA + wAB) * 2) / 2;
        const Im = Math.round((a.intensity * wBA + b.intensity * wAB) / (wBA + wAB) * 2) / 2;
        // Pondération : principales 3, secondaires 1.5, autres 0.5
        const w = isPrinc(h) ? 3.0 : isSec(h) ? 1.5 : 0.5;
        sumH += Hm * w;
        sumI += Im * w;
        sumW += w;
        if (isPrinc(h)) {
            sumH_princ += Hm * w;
            sumW_princ += w;
        }
        // Aggrégation des classes
        const merged = a.class_counts || {};
        const merged2 = b.class_counts || {};
        for (const k of Object.keys(classCounts)) {
            classCounts[k] += (merged[k] || 0) + (merged2[k] || 0);
        }
        perHouse[h] = { Hm, Im, w, sigA: a.dominant_signature, sigB: b.dominant_signature };
    }

    const harmonyAvg = sumW > 0 ? sumH / sumW : 50;
    const intensityAvg = sumW > 0 ? sumI / sumW : 0;
    const harmonyPrinc = sumW_princ > 0 ? sumH_princ / sumW_princ : harmonyAvg;

    // Pondération finale : 65% principales, 35% moyenne globale
    let harmony_global = Math.round(harmonyPrinc * 0.65 + harmonyAvg * 0.35);

    // Bonus / pénalité selon la signature dominante
    const totalClass = Object.values(classCounts).reduce((a, b) => a + b, 0) || 1;
    const ratioFluid = classCounts.fluid / totalClass;
    const ratioBlocking = (classCounts.tension_blocking + classCounts.destabilizing) / totalClass;
    const ratioTransformative = classCounts.transformative / totalClass;

    if (ratioFluid >= 0.40) harmony_global += 3;
    if (ratioBlocking >= 0.35) harmony_global -= 4;
    if (ratioBlocking >= 0.50) harmony_global -= 4;        // double pénalité
    if (ratioTransformative >= 0.25) harmony_global -= 2;

    // Plafond v6 : 96 (réservé à des constellations exceptionnelles)
    harmony_global = Math.max(5, Math.min(96, harmony_global));

    const intensity_global = Math.max(0, Math.min(100, Math.round(intensityAvg)));

    // Signature dominante globale
    let dominant_signature_global = "lukewarm";
    if (harmony_global >= 70 && ratioFluid >= 0.35) dominant_signature_global = "fluid";
    else if (harmony_global < 45 && ratioBlocking >= 0.35) dominant_signature_global = "tense";
    else if (ratioTransformative >= 0.20 && intensity_global >= 60) dominant_signature_global = "transformative";
    else if (classCounts.karmic >= classCounts.fluid && classCounts.karmic >= 4) dominant_signature_global = "karmic";
    else if (Math.abs(ratioFluid - ratioBlocking) < 0.10) dominant_signature_global = "contrasted";

    // Bande qualitative v6 (H, I)
    const isEN = (langue || "fr").toLowerCase() === "en" || (langue || "").toLowerCase().startsWith("en");
    const band = computeQualitativeBandV6(harmony_global, intensity_global, dominant_signature_global, typoConf, extras);

    return {
        harmony: harmony_global,
        intensity: intensity_global,
        qualitative_band_v6: band,
        dominant_signature_global,
        per_house: perHouse,
        class_counts: classCounts,
        detail_v6: {
            harmony_avg: +harmonyAvg.toFixed(1),
            harmony_principales: +harmonyPrinc.toFixed(1),
            intensity_avg: +intensityAvg.toFixed(1),
            ratio_fluid: +ratioFluid.toFixed(2),
            ratio_blocking: +ratioBlocking.toFixed(2),
            ratio_transformative: +ratioTransformative.toFixed(2)
        },
        version: "v6.8.0"
    };
}

// ====== v6.2.0 — applyHouseCompensation ====================================
// Compensation intra-axe (suggestion astrologue) : quand une maison clé du
// groupe relationnel est vide (Hm ≈ baseline 50, empty=true), elle peut
// emprunter jusqu'à 15 points à une maison "sœur" du même axe qui est
// fortement activée. Exemple typique : couple fusionnel sans contrat formel
// → M7 vide mais M8 explosée. Le moteur compense la M7 pour refléter la
// réalité psychologique : il y a bien union, juste pas dans le cadre légal.
//
// Groupes définis par typologie. Mutuelle, donc on opère sur les deux
// directions (B in A et A in B) symétriquement.
const HOUSE_COMPENSATION_GROUPS = {
    "Amour": [
        { axis: "affectif", houses: [5, 7, 8], cap_borrow: 15 }
    ],
    "Business": [
        { axis: "pro_capital", houses: [2, 6, 10], cap_borrow: 12 },
        { axis: "pro_relation", houses: [7, 11], cap_borrow: 10 }
    ],
    "Parent / Enfant": [
        { axis: "filial", houses: [4, 5, 10], cap_borrow: 12 },
        { axis: "transmission", houses: [8, 12], cap_borrow: 10 }
    ],
    "Fratrie": [
        { axis: "lien", houses: [3, 11], cap_borrow: 10 }
    ],
    "Ami": [
        { axis: "complicite", houses: [3, 11, 5], cap_borrow: 10 }
    ],
    "Mentorat": [
        { axis: "transmission", houses: [3, 9, 10], cap_borrow: 10 }
    ],
    "Colocataire": [
        { axis: "quotidien", houses: [2, 4, 6], cap_borrow: 10 }
    ],
    "Rivalité": [
        { axis: "conflit", houses: [7, 12, 8], cap_borrow: 8 }
    ]
};

function applyHouseCompensation(houseHI, typoLabel) {
    const groups = HOUSE_COMPENSATION_GROUPS[typoLabel] || [];
    const log = [];
    if (!groups.length) return { compensated: { ...houseHI }, log };

    const compensated = JSON.parse(JSON.stringify(houseHI));

    for (const group of groups) {
        // Trouver la maison du groupe avec le Hm le plus élevé (le "donneur")
        let bestH = -Infinity, bestHouse = null;
        for (const h of group.houses) {
            const hi = compensated[h];
            if (hi && hi.harmony > bestH) {
                bestH = hi.harmony;
                bestHouse = h;
            }
        }
        if (bestHouse === null || bestH < 65) continue;     // pas de "donneur" assez fort

        // Pour chaque maison du groupe qui est vide / proche de la baseline,
        // emprunter une fraction du surplus du donneur
        for (const h of group.houses) {
            if (h === bestHouse) continue;
            const hi = compensated[h];
            if (!hi) continue;
            const isEmptyOrBaseline = hi.empty === true || (hi.harmony >= 45 && hi.harmony <= 55);
            if (!isEmptyOrBaseline) continue;
            // Fraction empruntée : 40% du surplus (bestH - 50), capée à `group.cap_borrow`
            const surplus = bestH - 50;
            const borrow = Math.min(group.cap_borrow, Math.round(surplus * 0.40));
            if (borrow <= 0) continue;
            const oldH = hi.harmony;
            hi.harmony = Math.min(96, oldH + borrow);
            hi.compensation = {
                axis: group.axis,
                from_house: bestHouse,
                from_harmony: bestH,
                borrowed: borrow,
                old_harmony: oldH
            };
            // L'intensité reflète aussi la compensation (proportionnellement)
            const oldI = hi.intensity;
            hi.intensity = Math.min(100, oldI + Math.round(borrow * 0.5));
            log.push({ axis: group.axis, donor: bestHouse, donor_h: bestH, recipient: h, borrowed: borrow, recipient_old_h: oldH, recipient_new_h: hi.harmony });
        }
    }

    return { compensated, log };
}

// v6.3.0 — Q13 astrologue : 3 catégories de vocabulaire qualitatif.
// Engagement (Amour/Business/Parent-Enfant/Mentorat) : registre intime
// Proximité (Ami/Fratrie/Colocataire) : registre social
// Adversité (Rivalité) : registre conflictuel inversé
function _getTypologyCategory(typologie) {
    if (!typologie) return "engagement";
    if (typologie === "Rivalité") return "adversity";
    if (typologie === "Ami" || typologie === "Fratrie" || typologie === "Colocataire") return "proximity";
    return "engagement";  // Amour, Business, Parent / Enfant, Mentorat
}
const _BAND_VOCABULARY = {
    engagement: {
        1: { band: "Alchimie exceptionnelle", band_en: "Exceptional alchemy", desc: "Compatibilité rare, tonalité fluide et puissamment magnétique. Les ressources astrologiques sont alignées sur la durée.", desc_en: "Rare compatibility, fluid and magnetically powerful tone. Astrological resources are aligned for the long term.", color: "#16a34a" },
        2: { band: "Entente fluide et apaisée", band_en: "Fluid, peaceful agreement", desc: "Le lien est doux, harmonieux mais énergétiquement modéré. Risque de manque de tonus avec le temps.", desc_en: "The bond is gentle and harmonious but energetically moderate. Possible lack of intensity over time.", color: "#22c55e" },
        3: { band: "Compatibilité solide", band_en: "Solid compatibility", desc: "Bonne harmonie générale, quelques zones de friction qui peuvent enrichir la relation.", desc_en: "Good general harmony, some friction zones that can enrich the relationship.", color: "#65a30d" },
        4: { band: "Relation intense et transformative", band_en: "Intense and transformative relationship", desc: "Lien magnétique mais éprouvant. Les énergies fortes peuvent sublimer ou éroder selon la maturité du couple.", desc_en: "Magnetic but demanding bond. Strong energies can either sublimate or erode depending on the couple's maturity.", color: "#f59e0b" },
        5: { band: "Relation contrastée", band_en: "Contrasted relationship", desc: "Mélange de fluidité et de friction. Demande des efforts conscients pour stabiliser la dynamique.", desc_en: "Mix of fluidity and friction. Requires conscious effort to stabilize the dynamic.", color: "#eab308" },
        6: { band: "Tension forte, dynamique éprouvante", band_en: "Strong tension, demanding dynamic", desc: "Charge émotionnelle élevée mais frictions dominantes. Instabilité probable sans accompagnement.", desc_en: "High emotional charge but dominant frictions. Likely instability without support.", color: "#ef4444" },
        7: { band: "Compatibilité limitée", band_en: "Limited compatibility", desc: "Peu de ressources astrologiques pour soutenir la relation. Tonalité atone.", desc_en: "Few astrological resources to sustain the relationship. Lukewarm tone.", color: "#dc2626" },
        8: { band: "Compatibilité critique", band_en: "Critical compatibility", desc: "Les frictions structurelles dominent largement les soutiens. Relation à fortes contraintes.", desc_en: "Structural frictions largely dominate the supports. Heavily constrained relationship.", color: "#991b1b" }
    },
    proximity: {
        1: { band: "Synergie remarquable", band_en: "Remarkable synergy", desc: "Complicité fluide et stimulante. Le lien social est facile, vivant, durable.", desc_en: "Fluid and stimulating complicity. The social bond is easy, lively, durable.", color: "#16a34a" },
        2: { band: "Bonne entente naturelle", band_en: "Natural easy bond", desc: "Lien doux et confortable, sans étincelle particulière. Idéal pour une relation paisible.", desc_en: "Gentle and comfortable bond, no particular spark. Ideal for a peaceful relationship.", color: "#22c55e" },
        3: { band: "Bonne compatibilité", band_en: "Good compatibility", desc: "Affinités solides avec quelques différences enrichissantes.", desc_en: "Solid affinities with some enriching differences.", color: "#65a30d" },
        4: { band: "Lien intense, parfois inconfortable", band_en: "Intense bond, sometimes uncomfortable", desc: "Beaucoup d'énergie partagée, mais des frictions qui demandent de la maturité pour être tenues.", desc_en: "Much shared energy, but frictions that require maturity to be held.", color: "#f59e0b" },
        5: { band: "Affinités contrastées", band_en: "Contrasted affinities", desc: "Mélange de complicité et de divergences. Le lien existe mais demande du compromis.", desc_en: "Mix of complicity and divergences. The bond exists but demands compromise.", color: "#eab308" },
        6: { band: "Tension manifeste", band_en: "Manifest tension", desc: "Beaucoup d'énergie, mais largement frictionnelle. Le lien fatigue plus qu'il ne nourrit.", desc_en: "Plenty of energy, but largely frictional. The bond drains more than it feeds.", color: "#ef4444" },
        7: { band: "Affinités tièdes", band_en: "Lukewarm affinities", desc: "Peu de carburant astrologique. Le lien tend à se diluer faute de moteur.", desc_en: "Little astrological fuel. The bond tends to dilute for lack of engine.", color: "#dc2626" },
        8: { band: "Incompatibilité de fond", band_en: "Fundamental mismatch", desc: "Différences structurelles majeures. La cohabitation sociale demanderait beaucoup de tolérance.", desc_en: "Major structural differences. Social cohabitation would demand much tolerance.", color: "#991b1b" }
    },
    adversity: {
        // v6.5.0 — Q24 astrologue : niveau 0 spécial « Indifférence astrale »
        // déclenché si Adversity = 0 ET Harmony < 50. Distingue un faux positif
        // pacifique (deux personnes qui se croisent sans se voir) d'une vraie
        // rivalité productive ou paisible.
        0: { band: "Indifférence astrale", band_en: "Astral indifference", desc: "Aucune mécanique de rivalité significative entre ces deux thèmes. La 'rivalité' n'existe pas astrologiquement : ils se croisent sans véritablement se voir, malgré le récit historique.", desc_en: "No significant rivalry mechanics between these two charts. The 'rivalry' does not exist astrologically: they pass each other without truly seeing one another, despite historical narrative.", color: "#94a3b8" },
        // Sémantique inversée : H haut = peu d'adversité (rivalité « molle »),
        // H bas = adversité forte (rivalité productive si I élevée)
        1: { band: "Rivalité paisible (faible friction)", band_en: "Peaceful rivalry (low friction)", desc: "Trop d'harmonie pour une vraie rivalité. Les deux personnes coexistent plus qu'elles ne s'affrontent.", desc_en: "Too much harmony for a genuine rivalry. The two coexist rather than confront.", color: "#16a34a" },
        2: { band: "Adversité molle", band_en: "Soft adversity", desc: "Très peu de friction structurelle. La rivalité reste théorique.", desc_en: "Very little structural friction. Rivalry stays theoretical.", color: "#22c55e" },
        3: { band: "Compétition cordiale", band_en: "Cordial competition", desc: "Adversité respectueuse, plus stimulante que destructrice.", desc_en: "Respectful adversity, more stimulating than destructive.", color: "#65a30d" },
        4: { band: "Émulation puissante", band_en: "Powerful emulation", desc: "Friction intense et magnétique : chacun élève l'autre par l'opposition. Vraie rivalité créatrice.", desc_en: "Intense and magnetic friction : each elevates the other through opposition. Genuine creative rivalry.", color: "#f59e0b" },
        5: { band: "Affrontement classique", band_en: "Classic confrontation", desc: "Tensions et points de friction équilibrés. Combat ouvert mais pas destructeur.", desc_en: "Balanced tensions and friction points. Open combat but not destructive.", color: "#eab308" },
        6: { band: "Friction destructrice", band_en: "Destructive friction", desc: "Adversité brûlante, peu de respect mutuel. Risque de conflit ouvert et durable.", desc_en: "Burning adversity, little mutual respect. Risk of open and lasting conflict.", color: "#ef4444" },
        7: { band: "Antagonisme stérile", band_en: "Sterile antagonism", desc: "Friction sans véritable enjeu. Combat épuisant sans rendement.", desc_en: "Friction without real stake. Exhausting combat without yield.", color: "#dc2626" },
        8: { band: "Adversité totale", band_en: "Total adversity", desc: "Confrontation à somme négative pour les deux parties. Destruction mutuelle probable.", desc_en: "Negative-sum confrontation for both parties. Mutual destruction probable.", color: "#991b1b" }
    }
};

// computeQualitativeBandV6 — table de bandes basée sur (H, I) et signature.
// Cible une cohérence narrative parfaite : H>=80 implique "très fluide",
// I élevée implique "intense" (peu importe la fluidité).
// v6.5.0 — Q24 : 5e param `extras` (adversityScore) pour la bande spéciale
//                « Indifférence astrale » en typologie Rivalité.
function computeQualitativeBandV6(H, I, signature, typoConf, extras = {}) {
    const typoLabel = (typoConf?.label_fr || "").toLowerCase();
    const isAmour = typoLabel.includes("amour");
    const isParent = typoLabel.includes("parent");
    const isBiz = typoLabel.includes("biz") || typoLabel.includes("pro") || typoLabel.includes("travail");
    const category = _getTypologyCategory(typoConf?.label_fr_norm || (typoConf?.principales ? null : null) || "");
    // Note : on récupère la typologie via typoConf._typologie si présent, sinon
    // on déduit du label_fr.
    let cat = "engagement";
    if (typoConf?._typologie) cat = _getTypologyCategory(typoConf._typologie);
    else if (typoLabel.includes("rivalité")) cat = "adversity";
    else if (typoLabel.includes("amitié") || typoLabel.includes("frater") || typoLabel.includes("cohabit")) cat = "proximity";

    let level;
    // Bandes communes engagement / proximity (H haut = bon)
    // v6.6.0 — Q41 astrologue : seuil de bascule "fort" abaissé de 65 → 62
    // (un score de 62+ sur un moteur rigoureux indique déjà une excellente
    // compatibilité ; 65 était statistiquement trop punitif).
    if (cat !== "adversity") {
        if (H >= 80 && I >= 55) level = 1;
        else if (H >= 75 && I < 55) level = 2;
        else if (H >= 62) level = 3;
        else if (H >= 45 && I >= 60) level = 4;
        else if (H >= 45) level = 5;
        else if (H >= 30 && I >= 55) level = 6;
        else if (H >= 30) level = 7;
        else level = 8;
    } else {
        // v6.5.0 — Q24 : Indifférence astrale (couperet prioritaire)
        // Si l'adversity_index est très faible ET l'harmony est aussi basse,
        // c'est qu'il n'y a aucune mécanique relationnelle réelle (ni rivalité
        // ni harmonie) — les deux personnes se croisent sans se voir.
        const advScore = (extras && typeof extras.adversityScore === "number") ? extras.adversityScore : null;
        if (advScore != null && advScore <= 5 && H < 50) {
            level = 0;                                   // Indifférence astrale
        }
        // Adversité : registre inversé (H haut = rivalité paisible, H bas + I haute = émulation puissante)
        else if (H >= 75) level = 1;                     // Rivalité paisible
        else if (H >= 60) level = 2;                     // Adversité molle
        else if (H >= 45 && I < 50) level = 3;           // Compétition cordiale
        else if (H >= 30 && I >= 60) level = 4;          // Émulation puissante
        else if (H >= 30) level = 5;                     // Affrontement classique
        else if (I >= 60) level = 6;                     // Friction destructrice
        else if (H >= 15) level = 7;                     // Antagonisme stérile
        else level = 8;                                  // Adversité totale
    }
    const v = _BAND_VOCABULARY[cat][level] || _BAND_VOCABULARY.engagement[level];
    let band = v.band, band_en = v.band_en, desc = v.desc, desc_en = v.desc_en, color = v.color;

    // Adaptation par typologie (parent / biz)
    if (isParent && (signature === "transformative" || signature === "tense")) {
        desc = desc.replace("relation", "lien parent-enfant");
        desc_en = desc_en.replace("relationship", "parent-child bond");
    } else if (isBiz) {
        desc = desc.replace("Compatibilité", "Compatibilité professionnelle");
        desc_en = desc_en.replace("compatibility", "professional compatibility");
    }

    return { band, band_en, desc, desc_en, color, signature };
}

// ---- 11b. DIGNITÉ ACCIDENTELLE (LILLY) ----
const ANGULAR_HOUSES_SET = new Set([1, 10]);
const STRONG_HOUSES_SET  = new Set([7, 4]);
const SUCCEDENT_HOUSES   = new Set([2, 5, 8, 11]);
const CADENT_WEAK_HOUSES = new Set([6, 12]);

function computeAccidentalDignity(planets, houses, isDayChart, persName, natalAspects) {
    const results = [];
    const SCORED_PLANETS = ["Soleil","Lune","Mercure","Vénus","Mars","Jupiter","Saturne","Uranus","Neptune","Pluton","Chiron"];
    const BENEFICS_L = new Set(["Jupiter","Vénus"]);
    const MALEFICS_L = new Set(["Saturne","Mars"]);
    const MAJOR_ASP = new Set(["Conjonction","Sextile","Carré","Trigone","Opposition"]);

    const sunObj = planets.find(p => getPlanetName(p) === "Soleil");
    const sunDeg = sunObj ? getPlanetDegree(sunObj) : null;

    const natalMR = [];
    for (const pA of planets) {
        const nA = getPlanetName(pA); const sA = getPlanetSign(pA);
        if (!SCORED_PLANETS.includes(nA) || nA === "Chiron") continue;
        const rulerA = SIGN_RULERS[sA];
        if (!rulerA) continue;
        for (const pB of planets) {
            const nB = getPlanetName(pB); const sB = getPlanetSign(pB);
            if (nB === nA || !SCORED_PLANETS.includes(nB) || nB === "Chiron") continue;
            const rulerB = SIGN_RULERS[sB];
            if (rulerA === nB && rulerB === nA) natalMR.push(nA, nB);
        }
    }

    for (const pObj of planets) {
        const pName = getPlanetName(pObj);
        if (!SCORED_PLANETS.includes(pName)) continue;
        const sign = getPlanetSign(pObj);
        const deg = getPlanetDegree(pObj);
        const hNum = getHouseNumber(deg, houses);
        const retro = getPlanetRetro(pObj);
        const speed = getPlanetSpeed(pObj);
        const details = [];
        let score = 0;

        const ess = getDignity(pName, sign);
        if (ess === "Domicile")    { score += 5; details.push("Domicile +5"); }
        else if (ess === "Exaltation") { score += 4; details.push("Exaltation +4"); }
        else if (ess === "Exil")   { score -= 5; details.push("Exil -5"); }
        else if (ess === "Chute")  { score -= 4; details.push("Chute -4"); }

        const degInSignAcc = (deg % 30 + 30) % 30;
        const dFullAcc = getDignityFull(pName, sign, degInSignAcc, isDayChart);
        if (dFullAcc && dFullAcc.face && !dFullAcc.primary) { score += 1; details.push("Face +1"); }

        if (ANGULAR_HOUSES_SET.has(hNum))  { score += 5; details.push(`M${hNum} angulaire +5`); }
        else if (STRONG_HOUSES_SET.has(hNum)) { score += 4; details.push(`M${hNum} angulaire +4`); }
        else if (SUCCEDENT_HOUSES.has(hNum))  { score += 3; details.push(`M${hNum} succédente +3`); }
        else if (CADENT_WEAK_HOUSES.has(hNum)){ score -= 5; details.push(`M${hNum} cadente faible -5`); }
        else if (hNum === 3) { details.push(`M${hNum} cadente +0`); }
        else { score += 2; details.push(`M${hNum} cadente +2`); }

        if (retro) { score -= 5; details.push("Rétrograde -5"); }
        else       { score += 4; details.push("Direct +4"); }

        if (sunDeg !== null && pName !== "Soleil" && pName !== "Lune") {
            let sep = Math.abs(deg - sunDeg);
            if (sep > 180) sep = 360 - sep;
            if (sep <= 0.28)      { score += 5; details.push("Cazimi +5"); }
            else if (sep <= 8.5)  { score -= 5; details.push("Combuste -5"); }
            else if (sep <= 17)   { score -= 4; details.push("Sous les rayons -4"); }
            else                  { score += 5; details.push("Libre du Soleil +5"); }
        }

        if (natalMR.includes(pName)) { score += 5; details.push("Réception mutuelle domicile +5"); }

        if (Array.isArray(natalAspects)) {
            const aspFromBen = natalAspects.filter(a => {
                const n1 = a.planete_1 || a.p1; const n2 = a.planete_2 || a.p2;
                const asp = a.aspect || a.type || '';
                return MAJOR_ASP.has(asp) && ((n1 === pName && BENEFICS_L.has(n2)) || (n2 === pName && BENEFICS_L.has(n1)));
            });
            const aspFromMal = natalAspects.filter(a => {
                const n1 = a.planete_1 || a.p1; const n2 = a.planete_2 || a.p2;
                const asp = a.aspect || a.type || '';
                return MAJOR_ASP.has(asp) && ((n1 === pName && MALEFICS_L.has(n2)) || (n2 === pName && MALEFICS_L.has(n1)));
            });
            if (aspFromBen.length > 0) { const b = Math.min(aspFromBen.length, 2) * 2; score += b; details.push(`Aspect(s) bénéfique(s) reçu(s) +${b}`); }
            if (aspFromMal.length > 0) { const m = Math.min(aspFromMal.length, 2) * -2; score += m; details.push(`Aspect(s) maléfique(s) reçu(s) ${m}`); }
        }

        const ST = {"Mercure":0.4,"Vénus":0.3,"Mars":0.08,"Jupiter":0.03,"Saturne":0.015,"Uranus":0.008,"Neptune":0.005,"Pluton":0.004,"Chiron":0.01};
        if (speed !== null) {
            if (ST[pName] && Math.abs(speed) < ST[pName]) { score += 3; details.push("Stationnaire +3"); }
        }

        const PLANETARY_JOYS = { "Mercure": 1, "Lune": 3, "Vénus": 5, "Mars": 6, "Soleil": 9, "Jupiter": 11, "Saturne": 12 };
        if (PLANETARY_JOYS[pName] === hNum) { score += 5; details.push(`Joie de ${pName} en M${hNum} +5`); }

        if (sunDeg !== null && pName !== "Soleil" && pName !== "Lune") {
            const isSuperior = ["Mars","Jupiter","Saturne"].includes(pName);
            const isInferior = ["Mercure","Vénus"].includes(pName);
            const orientalVal = (deg - sunDeg + 360) % 360;
            if (isSuperior) {
                if (orientalVal > 180) { score += 2; details.push("Oriental (supérieure) +2"); }
                else { score -= 2; details.push("Occidental (supérieure) -2"); }
            }
            if (isInferior) {
                if (orientalVal < 180) { score += 2; details.push("Occidental (inférieure) +2"); }
                else { score -= 2; details.push("Oriental (inférieure) -2"); }
            }
        }

        if (speed !== null && !retro) {
            const AVG_SPEEDS = {"Soleil":0.985,"Lune":13.2,"Mercure":1.2,"Vénus":1.0,"Mars":0.52,"Jupiter":0.083,"Saturne":0.033};
            const avg = AVG_SPEEDS[pName];
            if (avg && Math.abs(speed) > avg * 1.3) { score += 2; details.push("Vitesse rapide +2"); }
            else if (avg && Math.abs(speed) < avg * 0.5 && !ST[pName]) { score -= 1; details.push("Vitesse lente -1"); }
        }

        const sortedForBesiegement = [...planets].filter(q => SCORED_PLANETS.includes(getPlanetName(q))).sort((a, b) => getPlanetDegree(a) - getPlanetDegree(b));
        const bIdx = sortedForBesiegement.findIndex(q => getPlanetName(q) === pName);
        if (bIdx >= 1 && bIdx < sortedForBesiegement.length - 1) {
            const prevP = getPlanetName(sortedForBesiegement[bIdx - 1]);
            const nextP = getPlanetName(sortedForBesiegement[bIdx + 1]);
            if (MALEFICS_L.has(prevP) && MALEFICS_L.has(nextP)) {
                score -= 5; details.push("Assiègement (encadré par maléfiques) -5");
            }
        }

        const SIGN_GENDER = {"Bélier":"M","Taureau":"F","Gémeaux":"M","Cancer":"F","Lion":"M","Vierge":"F","Balance":"M","Scorpion":"F","Sagittaire":"M","Capricorne":"F","Verseau":"M","Poissons":"F"};
        const isDiurnal = ["Soleil","Jupiter","Saturne"].includes(pName);
        const isNocturnal = ["Lune","Vénus","Mars"].includes(pName);
        const signMasc = SIGN_GENDER[sign] === "M";
        const aboveHorizon = hNum >= 7 && hNum <= 12;
        if (isDiurnal || isNocturnal) {
            const sectOK = (isDiurnal && isDayChart) || (isNocturnal && !isDayChart);
            if (sectOK && aboveHorizon === isDiurnal && signMasc === isDiurnal) { score += 3; details.push("Hayz parfait +3"); }
            else if (sectOK && (aboveHorizon === isDiurnal || signMasc === isDiurnal)) { score += 1; details.push("Hayz partiel +1"); }
        }

        const essDetails = details.filter(d => /Domicile|Exaltation|Exil|Chute/.test(d));
        const accDetails = details.filter(d => !/Domicile|Exaltation|Exil|Chute/.test(d));
        const essScore = essDetails.reduce((s, d) => { const m = d.match(/([+-]?\d+)/); return s + (m ? parseInt(m[1]) : 0); }, 0);
        const accScore = score - essScore;
        results.push({ planet: pName, score, essential_score: essScore, accidental_score: accScore, essential_details: essDetails, accidental_details: accDetails, details, personne: persName });
    }
    return results.sort((a, b) => b.score - a.score);
}

const accDignityA = computeAccidentalDignity(natalPlanetsA, natalHousesA, isDayChartA, persoStrA, natalAspectsA);
const accDignityB = computeAccidentalDignity(natalPlanetsB, natalHousesB, isDayChartB, persoStrB, natalAspectsB);

// ---- 11b-bis. PLANÈTES ASSIÉGÉES (portage THEME v4.0) ----
function computeBesiegedPlanets(planets) {
    const CORE = ["Soleil","Lune","Mercure","Vénus","Mars","Jupiter","Saturne","Uranus","Neptune","Pluton"];
    const MALEFICS_T = new Set(["Mars","Saturne"]);
    const BENEFICS_T = new Set(["Jupiter","Vénus"]);
    const sorted = CORE.map(name => {
        const p = planets.find(x => getPlanetName(x) === name);
        return p ? { name, deg: getPlanetDegree(p) } : null;
    }).filter(Boolean).sort((a, b) => a.deg - b.deg);
    const result = [];
    sorted.forEach((p, idx) => {
        if (MALEFICS_T.has(p.name) || BENEFICS_T.has(p.name)) return;
        const prev = sorted[(idx - 1 + sorted.length) % sorted.length];
        const next = sorted[(idx + 1) % sorted.length];
        if (MALEFICS_T.has(prev.name) && MALEFICS_T.has(next.name)) {
            const beneficIntervenes = sorted.some(bp => {
                if (!BENEFICS_T.has(bp.name)) return false;
                if (prev.deg < next.deg) return bp.deg > prev.deg && bp.deg < next.deg;
                return bp.deg > prev.deg || bp.deg < next.deg;
            });
            result.push({ planet: p.name, between: [prev.name, next.name], severity: beneficIntervenes ? "ATTÉNUÉE" : "STRICTE" });
        }
    });
    return result;
}
const besiegedA = computeBesiegedPlanets(natalPlanetsA);
const besiegedB = computeBesiegedPlanets(natalPlanetsB);

// ---- 11b-ter. FORME DU THÈME — JONES (portage THEME v4.0) ----
function computeChartShape(planets) {
    const CORE = ["Soleil","Lune","Mercure","Vénus","Mars","Jupiter","Saturne","Uranus","Neptune","Pluton"];
    const pDegs = CORE.map(n => {
        const p = planets.find(x => getPlanetName(x) === n);
        return p ? { name: n, deg: getPlanetDegree(p) } : null;
    }).filter(Boolean).sort((a, b) => a.deg - b.deg);
    const n = pDegs.length;
    if (n < 7) return { shape: "Indéterminé" };
    const gaps = [];
    for (let i = 0; i < n; i++) gaps.push(((pDegs[(i + 1) % n].deg - pDegs[i].deg) + 360) % 360);
    const maxGap = Math.max(...gaps);
    const minGap = Math.min(...gaps);
    const spread = 360 - maxGap;
    const maxGapIdx = gaps.indexOf(maxGap);
    const findSingleton = () => {
        const sorted2 = gaps.map((g, i) => ({ g, i })).sort((a, b) => b.g - a.g);
        const g1i = sorted2[0].i, g2i = sorted2[1].i;
        let setA2 = [], idx2 = (g1i + 1) % n;
        while (idx2 !== (g2i + 1) % n) { setA2.push(pDegs[idx2].name); idx2 = (idx2 + 1) % n; }
        let setB2 = []; idx2 = (g2i + 1) % n;
        while (idx2 !== (g1i + 1) % n) { setB2.push(pDegs[idx2].name); idx2 = (idx2 + 1) % n; }
        return setA2.length <= setB2.length ? setA2 : setB2;
    };
    if (spread <= 120) return { shape: "Bundle" };
    if (spread <= 180) return { shape: "Bowl" };
    if (spread > 180 && maxGap >= 60 && maxGap <= 120) {
        const singleton = findSingleton();
        return { shape: "Bucket", singleton: singleton.join("/") };
    }
    if (maxGap <= 40 && minGap >= 15) return { shape: "Splash" };
    const largeGaps = gaps.filter(g => g >= 60);
    if (largeGaps.length === 2 && largeGaps.every(g => g <= 120)) return { shape: "Seesaw" };
    if (maxGap >= 60 && maxGap <= 90) return { shape: "Locomotive", leading: pDegs[(maxGapIdx + 1) % n].name };
    return { shape: "Splay" };
}
const chartShapeA = computeChartShape(natalPlanetsA);
const chartShapeB = computeChartShape(natalPlanetsB);

// ---- 11c. ARBRE DES DISPOSITIONS CROISÉ ----
function buildCrossDispositorChains(planetsA, planetsB, nameA, nameB, rulers) {
    const chains = [];
    const getSign = p => getPlanetSign(p);
    const getName = p => getPlanetName(p);
    const rulerMap = rulers || SIGN_RULERS;

    for (const pA of planetsA) {
        const pNameA = getName(pA);
        if (!PLANETS_MAJEURS.includes(pNameA)) continue;
        const signA = getSign(pA);
        const rulerOfSignA = rulerMap[signA];
        if (!rulerOfSignA) continue;

        const pBMatch = planetsB.find(p => getName(p) === rulerOfSignA);
        if (!pBMatch) continue;
        const signB = getSign(pBMatch);
        const rulerOfSignB = rulerMap[signB];
        if (!rulerOfSignB) continue;

        const chain = [
            { planet: pNameA, sign: signA, personne: nameA },
            { planet: rulerOfSignA, sign: signB, personne: nameB }
        ];

        const pAEnd = planetsA.find(p => getName(p) === rulerOfSignB);
        if (pAEnd) {
            chain.push({ planet: rulerOfSignB, sign: getSign(pAEnd), personne: nameA });
        }

        const isMutual = rulerOfSignB === pNameA;

        chains.push({
            chain,
            summary: chain.map(c => `${c.planet}(${c.personne.split(' ')[0]}) en ${c.sign}`).join(" → "),
            mutual: isMutual
        });
    }
    return chains;
}

const crossDispositors_modern = [
    ...buildCrossDispositorChains(natalPlanetsA, natalPlanetsB, persoStrA, persoStrB, SIGN_RULERS),
    ...buildCrossDispositorChains(natalPlanetsB, natalPlanetsA, persoStrB, persoStrA, SIGN_RULERS)
];
const crossDispositors_traditional = [
    ...buildCrossDispositorChains(natalPlanetsA, natalPlanetsB, persoStrA, persoStrB, SIGN_TRADITIONAL_RULERS),
    ...buildCrossDispositorChains(natalPlanetsB, natalPlanetsA, persoStrB, persoStrA, SIGN_TRADITIONAL_RULERS)
];
const crossDispositors_tradOnly = crossDispositors_traditional.filter(ct => {
    return !crossDispositors_modern.some(cm => cm.summary === ct.summary);
});
const crossDispositors = [
    ...crossDispositors_modern.map(c => ({ ...c, maitrise: "moderne" })),
    ...crossDispositors_tradOnly.map(c => ({ ...c, maitrise: "traditionnelle" }))
];

// ---- 11d. PLANÈTES STATIONNAIRES ----
const STATION_THRESHOLDS = {
    "Mercure": 0.4, "Vénus": 0.3, "Mars": 0.08,
    "Jupiter": 0.03, "Saturne": 0.015, "Uranus": 0.008,
    "Neptune": 0.005, "Pluton": 0.004, "Chiron": 0.01
};
function detectStationaryPlanets(planets, persName) {
    const results = [];
    for (const p of planets) {
        const pName = getPlanetName(p);
        const speed = getPlanetSpeed(p);
        const threshold = STATION_THRESHOLDS[pName];
        if (speed === null || !threshold) continue;
        if (Math.abs(speed) < threshold) {
            const dir = speed >= 0 ? "SD (station directe)" : "SR (station rétrograde)";
            results.push({
                planet: pName,
                personne: persName,
                speed: +speed.toFixed(4),
                threshold,
                direction: dir,
                sign: getPlanetSign(p),
                house: getHouseNumber(getPlanetDegree(p), planets === natalPlanetsA ? natalHousesA : natalHousesB)
            });
        }
    }
    return results;
}

const stationaryAll = [
    ...detectStationaryPlanets(natalPlanetsA, persoStrA),
    ...detectStationaryPlanets(natalPlanetsB, persoStrB)
];

// ---- 11e. ASPECTS MINEURS INTER-CARTES (additif, ne modifie pas le scoring) ----
const interMinorBtoA_raw = computeInterAspects(natalPlanetsB, natalPlanetsA, persoStrB, persoStrA, ASPECTS_MINOR, undefined, undefined, isDayChartB, isDayChartA);
const interMinorAtoB_raw = computeInterAspects(natalPlanetsA, natalPlanetsB, persoStrA, persoStrB, ASPECTS_MINOR, undefined, undefined, isDayChartA, isDayChartB);
const interMinorBtoA = classifyApplyingSeparating(interMinorBtoA_raw, natalPlanetsB, natalPlanetsA);
const interMinorAtoB = classifyApplyingSeparating(interMinorAtoB_raw, natalPlanetsA, natalPlanetsB);

// ---- 11e-bis. ASPECTS AUX CUSPIDES INTER-CARTES ----
function computeCuspAspects(planets, houses, nameFrom, nameTo) {
    const results = [];
    const cuspAspectDefs = [
        { name: "Conjonction", angle: 0, orbe: 2.5, nature: "fusion" },
        { name: "Opposition", angle: 180, orbe: 2.0, nature: "tension" },
        { name: "Carré", angle: 90, orbe: 2.0, nature: "tension" },
        { name: "Trigone", angle: 120, orbe: 2.0, nature: "harmonie" },
        { name: "Sextile", angle: 60, orbe: 1.5, nature: "harmonie" }
    ];
    for (let h = 1; h <= 12; h++) {
        const cuspDeg = getCuspDegree(h, houses);
        for (const p of planets) {
            const pName = getPlanetName(p);
            if (["Ascendant","Descendant","MC","Milieu du Ciel","Imum Coeli"].includes(pName)) continue;
            const pDeg = getPlanetDegree(p);
            const diff = absAngularDiff(pDeg, cuspDeg);
            for (const asp of cuspAspectDefs) {
                const ecart = Math.abs(diff - asp.angle);
                if (ecart <= asp.orbe) {
                    const score = +(((asp.orbe - ecart) / asp.orbe) * 8).toFixed(1);
                    results.push({
                        planete: pName, maison_cuspide: h, aspect: asp.name,
                        nature: asp.nature, orbe: +ecart.toFixed(2), score,
                        source: nameFrom, target: nameTo
                    });
                }
            }
        }
    }
    return results.sort((a, b) => b.score - a.score);
}
const cuspAspectsBtoA = computeCuspAspects(natalPlanetsB, natalHousesA, persoStrB, persoStrA);
const cuspAspectsAtoB = computeCuspAspects(natalPlanetsA, natalHousesB, persoStrA, persoStrB);

// ---- 11f. CONFIGURATIONS SYNASTRIQUE INTER-CARTES ----
function detectSynastricConfigurations(aspectsAtoB, aspectsBtoA) {
    const configs = [];
    const allAsp = [...aspectsAtoB, ...aspectsBtoA];
    const seen = new Set();

    for (const opp of allAsp) {
        if (opp.aspect !== "Opposition") continue;
        const srcOpp = opp.planete_source + "(" + opp.source_personne + ")";
        const tgtOpp = opp.planete_cible + "(" + opp.cible_personne + ")";
        for (const sq1 of allAsp) {
            if (sq1.aspect !== "Carré") continue;
            let apex = null, apexLabel = null;
            if (sq1.planete_source === opp.planete_source && sq1.source_personne === opp.source_personne) {
                apex = sq1.planete_cible; apexLabel = sq1.planete_cible + "(" + sq1.cible_personne + ")";
            } else if (sq1.planete_cible === opp.planete_source && sq1.cible_personne === opp.source_personne) {
                apex = sq1.planete_source; apexLabel = sq1.planete_source + "(" + sq1.source_personne + ")";
            } else continue;
            const sq2 = allAsp.find(a => a.aspect === "Carré" && (
                (a.planete_source === apex && a.planete_cible === opp.planete_cible && a.cible_personne === opp.cible_personne) ||
                (a.planete_cible === apex && a.planete_source === opp.planete_cible && a.source_personne === opp.cible_personne)
            ));
            if (sq2) {
                const key = [srcOpp, tgtOpp, apexLabel].sort().join("|");
                if (!seen.has("T|" + key)) {
                    seen.add("T|" + key);
                    configs.push({
                        type: "T-Carré Synastrique",
                        planets: [srcOpp, tgtOpp, apexLabel],
                        apex: apexLabel,
                        description: `${srcOpp} opp ${tgtOpp}, carré ${apexLabel} (apex) — tension inter-cartes structurante`
                    });
                }
            }
        }
    }

    const trines = allAsp.filter(a => a.aspect === "Trigone");
    for (let i = 0; i < trines.length; i++) {
        for (let j = i + 1; j < trines.length; j++) {
            const pi = [trines[i].planete_source + "(" + trines[i].source_personne + ")", trines[i].planete_cible + "(" + trines[i].cible_personne + ")"];
            const pj = [trines[j].planete_source + "(" + trines[j].source_personne + ")", trines[j].planete_cible + "(" + trines[j].cible_personne + ")"];
            const common = pi.filter(p => pj.includes(p));
            if (common.length !== 1) continue;
            const other_i = pi.find(p => p !== common[0]);
            const other_j = pj.find(p => p !== common[0]);
            if (other_i === other_j) continue;
            const third = trines.find(a => {
                const ta = a.planete_source + "(" + a.source_personne + ")";
                const tb = a.planete_cible + "(" + a.cible_personne + ")";
                return (ta === other_i && tb === other_j) || (ta === other_j && tb === other_i);
            });
            if (third) {
                const key = [common[0], other_i, other_j].sort().join("|");
                if (!seen.has("GT|" + key)) {
                    seen.add("GT|" + key);
                    configs.push({
                        type: "Grand Trigone Synastrique",
                        planets: [common[0], other_i, other_j],
                        description: `${common[0]}–${other_i}–${other_j} : harmonie inter-cartes structurelle`
                    });
                }
            }
        }
    }

    return configs;
}
const synastricConfigurations = detectSynastricConfigurations(interAspectsAtoB, interAspectsBtoA);

const BENEFIC_OVERLAY = new Set(["Vénus","Jupiter","Soleil","Lune","Nœud Nord"]);
const MALEFIC_OVERLAY = new Set(["Saturne","Pluton","Mars","Lilith","Nœud Sud"]);

const _preHouseTSBinA = {};
const _preHouseTSAinB = {};
for (let h = 1; h <= 12; h++) {
    _preHouseTSBinA[h] = computeHouseTensionSupport(h, overlayBinA, interAspectsBtoA, natalPlanetsB, natalHousesA, [...nodalContactsA, ...nodalContactsB], interMinorBtoA, cuspAspectsBtoA);
    _preHouseTSAinB[h] = computeHouseTensionSupport(h, overlayAinB, interAspectsAtoB, natalPlanetsA, natalHousesB, [...nodalContactsA, ...nodalContactsB], interMinorAtoB, cuspAspectsAtoB);
}

// ---- NHRI : Natal House Resilience Index (12 maisons × 2 personnes) ----
function computeNHRI(houseRulers, accDignity, planets, houses, natalAspects, isDayChart) {
    const nhri = {};
    const BENEFICS_NHRI = new Set(["Vénus", "Jupiter"]);
    const MALEFICS_NHRI = new Set(["Saturne", "Mars", "Pluton"]);
    const MAJOR_ASP_NHRI = new Set(["Conjonction", "Sextile", "Carré", "Trigone", "Opposition"]);

    for (let h = 1; h <= 12; h++) {
        const ruler = houseRulers[h];
        if (!ruler) { nhri[h] = { index: 1.0, detail: "no_ruler" }; continue; }

        const rulerName = ruler.maitre;
        const tradRulerName = ruler.double_maitrise ? ruler.maitre_traditionnel : null;

        // 1. Base ruler score from accidental dignity
        const rulerDig = accDignity.find(d => d.planet === rulerName);
        const tradDig = tradRulerName ? accDignity.find(d => d.planet === tradRulerName) : null;
        const bestDig = (tradDig && rulerDig)
            ? (tradDig.score > rulerDig.score ? tradDig : rulerDig)
            : (rulerDig || tradDig);
        const digScore = bestDig ? bestDig.score : 0;

        let baseRuler;
        if (digScore >= 15) baseRuler = 1.30;
        else if (digScore >= 8) baseRuler = 1.15;
        else if (digScore >= 3) baseRuler = 1.05;
        else if (digScore >= 0) baseRuler = 1.00;
        else if (digScore >= -5) baseRuler = 0.90;
        else if (digScore >= -10) baseRuler = 0.80;
        else baseRuler = 0.70;

        // 2. Resident planets in this natal house
        let residentAdj = 0;
        for (const p of planets) {
            const pName = getPlanetName(p);
            if (["Ascendant", "Descendant", "MC", "Milieu du Ciel", "Imum Coeli"].includes(pName)) continue;
            const pDeg = getPlanetDegree(p);
            const pHouse = getHouseNumber(pDeg, houses);
            if (pHouse !== h) continue;

            const pSign = getPlanetSign(p);
            const pDignity = getDignity(pName, pSign);
            const isBenefic = BENEFICS_NHRI.has(pName);
            const isMalefic = MALEFICS_NHRI.has(pName);
            const isStrong = pDignity === "Domicile" || pDignity === "Exaltation";
            const isWeak = pDignity === "Exil" || pDignity === "Chute";
            const isRetro = getPlanetRetro(p);

            if (isBenefic && isStrong) residentAdj += 0.10;
            else if (isBenefic && !isWeak) residentAdj += 0.05;
            else if (isBenefic && isWeak) residentAdj -= 0.05;
            else if (isMalefic && isStrong) residentAdj += 0.05;
            else if (isMalefic && isWeak) residentAdj -= 0.10;
            else if (isMalefic && isRetro) residentAdj -= 0.08;
            else if (isMalefic) residentAdj -= 0.03;
            else if (isStrong) residentAdj += 0.05;
            else if (isWeak) residentAdj -= 0.05;
        }
        residentAdj = Math.max(-0.15, Math.min(0.15, residentAdj));

        // 3. Natal aspects to house ruler
        let aspectAdj = 0;
        if (Array.isArray(natalAspects)) {
            for (const a of natalAspects) {
                const n1 = a.planete_1 || a.p1;
                const n2 = a.planete_2 || a.p2;
                const asp = a.aspect || a.type || '';
                if (!MAJOR_ASP_NHRI.has(asp)) continue;
                const otherPlanet = (n1 === rulerName) ? n2 : (n2 === rulerName) ? n1 : null;
                if (!otherPlanet) continue;

                if (BENEFICS_NHRI.has(otherPlanet)) {
                    if (asp === "Trigone" || asp === "Sextile" || asp === "Conjonction") aspectAdj += 0.06;
                    else aspectAdj += 0.02;
                } else if (MALEFICS_NHRI.has(otherPlanet)) {
                    if (asp === "Carré" || asp === "Opposition") aspectAdj -= 0.06;
                    else if (asp === "Conjonction") aspectAdj -= 0.03;
                    else aspectAdj -= 0.01;
                }
            }
        }
        aspectAdj = Math.max(-0.12, Math.min(0.12, aspectAdj));

        const raw = baseRuler + residentAdj + aspectAdj;
        const index = Math.max(0.50, Math.min(1.50, +raw.toFixed(2)));

        nhri[h] = {
            index,
            ruler: rulerName,
            ruler_dig_score: digScore,
            base: +baseRuler.toFixed(2),
            resident_adj: +residentAdj.toFixed(2),
            aspect_adj: +aspectAdj.toFixed(2),
            detail: `ruler=${rulerName}(${digScore}) base=${baseRuler} res=${residentAdj.toFixed(2)} asp=${aspectAdj.toFixed(2)}`
        };
    }
    return nhri;
}

const nhriA = computeNHRI(houseRulersA, accDignityA, natalPlanetsA, natalHousesA, natalAspectsA, isDayChartA);
const nhriB = computeNHRI(houseRulersB, accDignityB, natalPlanetsB, natalHousesB, natalAspectsB, isDayChartB);

const globalScoreResult = computeGlobalScoreV3({
    aspects1: interAspectsTier1BtoA_enriched,
    aspects2: interAspectsTier1AtoB_enriched,
    nodal: [...nodalContactsA, ...nodalContactsB],
    receptions: crossReceptions,
    decl: declData,
    antis: allAntiscia,
    starBridges: fixedStarBridges,
    vertexC: allVertexContacts,
    midpoints: allMidpoints,
    crossParans: crossParanBridges,
    planetaryPics: planetaryPictures,
    compositeAsp: compositeChart.aspects,
    compositeConf: compositeConfigs,
    davisonAsp: davisonChart?.aspects || [],
    davisonConf: davisonChart?.configurations || [],
    elemCompat: elementCompat,
    crossSens: crossSensitivity,
    crossDisp: crossDispositors,
    stationary: stationaryAll,
    oob: declData.oob,
    hayz: allHayz,
    chartRulerA: chartRulerA,
    chartRulerB: chartRulerB,
    accDigA: accDignityA,
    accDigB: accDignityB,
    typoConf: typoConfig,
    planetsA: natalPlanetsA,
    planetsB: natalPlanetsB,
    housesA: natalHousesA,
    housesB: natalHousesB,
    statsA: statsA,
    statsB: statsB,
    overlayBinA: overlayBinA,
    overlayAinB: overlayAinB,
    aspectsT2_1: interAspectsTier2BtoA,
    aspectsT2_2: interAspectsTier2AtoB,
    compositePlanetes: compositeChart.planetes || [],
    davisonPlanets: davisonChart?.planetes || [],
    houseTSBinA: _preHouseTSBinA,
    houseTSAinB: _preHouseTSAinB,
    nhriA: nhriA,
    nhriB: nhriB,
    houseRulersA: houseRulersA,
    houseRulersB: houseRulersB,
    nameA: persoStrA,
    nameB: persoStrB
});
// v5.0.0 — Le score "officiel" sera recalculé après la boucle de scoring des
// maisons (qui produit houseNormBinA/AinB nécessaires au Pilier 6 et au veto
// qualitatif). On utilise donc `let` pour permettre la réassignation.
let globalScore = globalScoreResult.score;
let globalScoreDetail = { ...globalScoreResult.detail, qualitative_band: globalScoreResult.qualitative_band };

// ---- 8f. SIGNATURE ASPECTS (natal repeated in synastry) ----
function findSignatureAspects(natalAspA, natalAspB, interAsp) {
    const sigs = [];
    const natalPairKeys = new Set();

    const aspectToNature = (asp) => {
        if (!asp) return "";
        const a = asp.toLowerCase();
        if (a === "conjonction") return "fusion";
        if (a === "trigone" || a === "sextile") return "harmonie";
        if (a === "carré" || a === "opposition") return "tension";
        if (a === "quinconce" || a === "semi-carré" || a === "sesqui-carré") return "ajustement";
        return "";
    };

    const natalPairNatures = {};
    for (const a of [...natalAspA, ...natalAspB]) {
        const p1 = a.p1 || a.planete_1 || a.planete_source || "";
        const p2 = a.p2 || a.planete_2 || a.planete_cible || "";
        if (!p1 || !p2) continue;
        const pairKey = [p1, p2].sort().join("|");
        natalPairKeys.add(pairKey);
        const nature = aspectToNature(a.aspect || a.type || "");
        if (!natalPairNatures[pairKey]) natalPairNatures[pairKey] = new Set();
        if (nature) natalPairNatures[pairKey].add(nature);
    }

    const seen = new Set();
    for (const ia of interAsp) {
        const pairKey = [ia.planete_source, ia.planete_cible].sort().join("|");
        if (natalPairKeys.has(pairKey) && !seen.has(pairKey)) {
            seen.add(pairKey);
            const iaNature = aspectToNature(ia.aspect);
            const natalNatures = natalPairNatures[pairKey] || new Set();
            const sameNature = natalNatures.has(iaNature);
            sigs.push({
                pair: `${ia.planete_source}–${ia.planete_cible}`,
                nature: ia.nature,
                aspect: ia.aspect,
                orbe: ia.orbe,
                score: sameNature ? +(ia.score * 1.3).toFixed(1) : ia.score,
                source_personne: ia.source_personne,
                natal_natures: [...natalNatures],
                same_nature: sameNature
            });
        }
    }
    return sigs;
}
const signatureAspects = findSignatureAspects(natalAspectsA, natalAspectsB, [...interAspectsTier1BtoA_enriched, ...interAspectsTier1AtoB_enriched]);

// ---- 8g. MAÎTRE DE LA M7 CROISÉ ----
function analyzeM7Rulers(housesA, housesB, planetsA, planetsB, interAspAll) {
    const getHouse7Ruler = (houses) => {
        const cusp7Sign = (() => {
            for (const h of houses) {
                const hNum = h.maison || h.house?.number || h.number || h.house;
                if (hNum === 7) {
                    if (h.segments && Array.isArray(h.segments)) {
                        const cuspSeg = h.segments.find(s => s.type === "Cuspide");
                        if (cuspSeg) return cuspSeg.signe || cuspSeg.sign || "";
                    }
                    return h.sign?.name?.fr || h.sign_name || h.signe || h.sign || "";
                }
            }
            return "";
        })();
        return { sign: cusp7Sign, ruler: SIGN_RULERS[cusp7Sign] || SIGN_TRADITIONAL_RULERS[cusp7Sign] || null };
    };
    const m7a = getHouse7Ruler(housesA);
    const m7b = getHouse7Ruler(housesB);
    const result = { ruler_a: m7a.ruler, sign_a: m7a.sign, ruler_b: m7b.ruler, sign_b: m7b.sign, cross_aspects: [] };

    if (m7a.ruler && m7b.ruler) {
        for (const asp of interAspAll) {
            const isCross = (asp.planete_source === m7a.ruler && asp.planete_cible === m7b.ruler) ||
                            (asp.planete_source === m7b.ruler && asp.planete_cible === m7a.ruler) ||
                            (asp.planete_source === m7a.ruler || asp.planete_cible === m7a.ruler ||
                             asp.planete_source === m7b.ruler || asp.planete_cible === m7b.ruler);
            if (isCross) result.cross_aspects.push({ aspect: asp.aspect, nature: asp.nature, orbe: asp.orbe, source: asp.planete_source, cible: asp.planete_cible });
        }
        result.cross_aspects = result.cross_aspects.slice(0, 8);
        const harmCount = result.cross_aspects.filter(a => a.nature === "harmonie" || a.nature === "fusion").length;
        const tensCount = result.cross_aspects.filter(a => a.nature === "tension").length;
        result.quality = harmCount > tensCount ? "favorable" : tensCount > harmCount ? "challenging" : "mixed";
    }
    return result;
}
const m7CrossAnalysis = analyzeM7Rulers(natalHousesA, natalHousesB, natalPlanetsA, natalPlanetsB, [...interAspectsTier1BtoA_enriched, ...interAspectsTier1AtoB_enriched]);

// v6.4.0 — Q18 astrologue : maîtres des maisons clés croisés selon typologie.
// Pour chaque maison principale de la typologie, on calcule :
//   1. Le maître (signe sur la cuspide → SIGN_RULERS)
//   2. Sa position dans le thème de l'autre (overlay : quelle maison ?)
//   3. Les aspects qu'il reçoit/émet vers les planètes de l'autre
// Cela donne "où le maître de la M2 d'A tombe dans le thème de B et comment B
// l'aspecte" — analyse classique en synastrie business notamment.
function analyzeKeyHouseRulersForTypo(typoConf, housesA, housesB, planetsA, planetsB, interAspAll) {
    const principales = (typoConf?.principales) || [];
    if (!principales.length) return [];
    const getCuspSign = (houses, hNum) => {
        for (const h of houses) {
            const n = h.maison || h.house?.number || h.number || h.house;
            if (n === hNum) {
                if (h.segments && Array.isArray(h.segments)) {
                    const cuspSeg = h.segments.find(s => s.type === "Cuspide");
                    if (cuspSeg) return cuspSeg.signe || cuspSeg.sign || "";
                }
                return h.sign?.name?.fr || h.sign_name || h.signe || h.sign || "";
            }
        }
        return "";
    };
    const getRulerOf = (sign) => SIGN_RULERS[sign] || SIGN_TRADITIONAL_RULERS[sign] || null;
    const findPlanetInHouse = (planets, otherHouses, planetName) => {
        const p = planets.find(pp => getPlanetName(pp) === planetName);
        if (!p) return null;
        return getHouseNumber(getPlanetDegree(p), otherHouses);
    };
    const result = [];
    for (const hNum of principales) {
        if (hNum === 7 && m7CrossAnalysis.ruler_a) continue; // déjà fait ailleurs

        const signA = getCuspSign(housesA, hNum);
        const signB = getCuspSign(housesB, hNum);
        const rulerA = getRulerOf(signA);
        const rulerB = getRulerOf(signB);
        if (!rulerA && !rulerB) continue;

        const entry = {
            house: hNum,
            ruler_a: rulerA, ruler_a_sign: signA,
            ruler_b: rulerB, ruler_b_sign: signB,
            // Position du maître de l'A dans le thème de B (overlay)
            ruler_a_in_house_b: rulerA ? findPlanetInHouse(planetsA, housesB, rulerA) : null,
            ruler_b_in_house_a: rulerB ? findPlanetInHouse(planetsB, housesA, rulerB) : null,
            cross_aspects: []
        };
        for (const asp of interAspAll) {
            const sp = asp.planete_source;
            const tp = asp.planete_cible;
            const sourceP = asp.source_personne || "";
            const cibleP = asp.cible_personne || "";
            const matchA = (rulerA && (sp === rulerA || tp === rulerA));
            const matchB = (rulerB && (sp === rulerB || tp === rulerB));
            if (matchA || matchB) {
                entry.cross_aspects.push({
                    pair: `${sp} (${sourceP}) ${asp.aspect} ${tp} (${cibleP})`,
                    nature: asp.nature,
                    orbe: asp.orbe
                });
            }
        }
        entry.cross_aspects = entry.cross_aspects.slice(0, 4);
        const harmCount = entry.cross_aspects.filter(a => a.nature === "harmonie" || a.nature === "fusion").length;
        const tensCount = entry.cross_aspects.filter(a => a.nature === "tension").length;
        entry.quality = harmCount > tensCount ? "favorable" : tensCount > harmCount ? "challenging" : "mixed";
        result.push(entry);
    }
    return result;
}
const keyHouseRulersAnalysis = analyzeKeyHouseRulersForTypo(
    typoConfig, natalHousesA, natalHousesB, natalPlanetsA, natalPlanetsB,
    [...interAspectsTier1BtoA_enriched, ...interAspectsTier1AtoB_enriched]
);

// ---- 8h. ALMUTEN DE LA SYNASTRIE ----
function computeSynastryAlmuten(accDigA, accDigB, planetsA, planetsB, housesA, housesB, isDayA, isDayB) {
    const combinedTotal = {}, combinedEss = {}, combinedAcc = {}, scoreA = {}, scoreB = {};
    for (const entry of accDigA) {
        const name = entry.planet || entry.planete || entry.name;
        if (!name) continue;
        scoreA[name] = entry.score || 0;
        combinedTotal[name] = (combinedTotal[name] || 0) + (entry.score || 0);
        combinedEss[name] = (combinedEss[name] || 0) + (entry.essential_score || 0);
        combinedAcc[name] = (combinedAcc[name] || 0) + (entry.accidental_score || 0);
    }
    for (const entry of accDigB) {
        const name = entry.planet || entry.planete || entry.name;
        if (!name) continue;
        scoreB[name] = entry.score || 0;
        combinedTotal[name] = (combinedTotal[name] || 0) + (entry.score || 0);
        combinedEss[name] = (combinedEss[name] || 0) + (entry.essential_score || 0);
        combinedAcc[name] = (combinedAcc[name] || 0) + (entry.accidental_score || 0);
    }
    const sorted = Object.entries(combinedTotal).sort((a, b) => b[1] - a[1]);
    const almName = sorted[0] ? sorted[0][0] : null;
    let almHouseA = null, almHouseB = null, almSect = null;
    if (almName) {
        const pA = planetsA.find(p => getPlanetName(p) === almName);
        const pB = planetsB.find(p => getPlanetName(p) === almName);
        if (pA) almHouseA = getHouseNumber(getPlanetDegree(pA), housesA);
        if (pB) almHouseB = getHouseNumber(getPlanetDegree(pB), housesB);
        const isDiurnal = DIURNAL_PLANETS.has(almName);
        const isNocturnal = NOCTURNAL_PLANETS.has(almName);
        if (isDiurnal) almSect = isDayA ? "en secte (A)" : isDayB ? "en secte (B)" : "hors secte";
        else if (isNocturnal) almSect = !isDayA ? "en secte (A)" : !isDayB ? "en secte (B)" : "hors secte";
    }
    return {
        almuten: almName,
        almuten_score: sorted[0] ? sorted[0][1] : 0,
        essential_score: almName ? (combinedEss[almName] || 0) : 0,
        accidental_score: almName ? (combinedAcc[almName] || 0) : 0,
        maison_a: almHouseA,
        maison_b: almHouseB,
        sect_condition: almSect,
        score_a: almName ? (scoreA[almName] || 0) : 0,
        score_b: almName ? (scoreB[almName] || 0) : 0,
        top5: sorted.slice(0, 5).map(([name, sc]) => ({
            planet: name, combined_score: sc,
            essential: combinedEss[name] || 0, accidental: combinedAcc[name] || 0,
            score_a: scoreA[name] || 0, score_b: scoreB[name] || 0
        }))
    };
}
const synastryAlmuten = computeSynastryAlmuten(accDignityA, accDignityB, natalPlanetsA, natalPlanetsB, natalHousesA, natalHousesB, isDayChartA, isDayChartB);

// ---- 8h-ter. ALMUTEN PAR MAISON SYNASTRIQUE ----
function computeHouseAlmuten(houseNum, houseCusps, isDayChart) {
    const cuspDeg = getCuspDegree(houseNum, houseCusps);
    const sign = signFromDegree(cuspDeg);
    const degInSign = ((cuspDeg % 30) + 30) % 30;
    const ALMUTEN_PLANETS = ["Soleil","Lune","Mercure","Vénus","Mars","Jupiter","Saturne"];
    const scores = {};
    for (const pl of ALMUTEN_PLANETS) scores[pl] = 0;

    const dig = DIGNITIES;
    for (const pl of ALMUTEN_PLANETS) {
        const d = dig[pl];
        if (!d) continue;
        if (d.dom.includes(sign)) scores[pl] += 5;
        if (d.exa.includes(sign)) scores[pl] += 4;
    }
    const triplRuler = isDayChart ? TRIPLIC_DAY[sign] : TRIPLIC_NIGHT[sign];
    if (triplRuler && scores[triplRuler] !== undefined) scores[triplRuler] += 3;
    const partRuler = TRIPLIC_PART[sign];
    if (partRuler && scores[partRuler] !== undefined) scores[partRuler] += 1;
    const termRuler = getTermRuler(sign, degInSign);
    if (termRuler && scores[termRuler] !== undefined) scores[termRuler] += 2;
    const faceRuler = getFaceRuler(sign, degInSign);
    if (faceRuler && scores[faceRuler] !== undefined) scores[faceRuler] += 1;

    const sorted = Object.entries(scores).filter(e => e[1] > 0).sort((a, b) => b[1] - a[1]);
    return {
        house: houseNum,
        sign,
        degree: Math.round(cuspDeg * 100) / 100,
        almuten: sorted[0] ? sorted[0][0] : null,
        almuten_score: sorted[0] ? sorted[0][1] : 0,
        runners_up: sorted.slice(1, 3).map(([p, s]) => ({ planet: p, score: s }))
    };
}

const houseAlmutenA = [];
const houseAlmutenB = [];
for (let h = 1; h <= 12; h++) {
    houseAlmutenA.push(computeHouseAlmuten(h, natalHousesA, isDayChartA));
    houseAlmutenB.push(computeHouseAlmuten(h, natalHousesB, isDayChartB));
}

// ---- 9. SCORING GLOBAL ----

function computeHouseScore(houseNum, overlay, interAspects, sourcePlanets, targetHouses, houseRulers, accDig, interAspectsT2, cuspAspects) {
    const isPrincipale = typoConfig.principales.includes(houseNum);
    const isSecondaire = typoConfig.secondaires.includes(houseNum);
    const entries = overlay[houseNum] || [];
    const typoPriority = isPrincipale ? 1.3 : isSecondaire ? 1.15 : 1.0;

    const ruler = houseRulers?.[houseNum];

    // v5.1.0 — Contribution des contacts à la cuspide (axe pour M1/4/7/10).
    // Avant : les conjonctions Soleil/Saturne/NN sur le DC (cuspide M7) ne
    // remontaient pas dans le score in-house de la M7, alors que ce sont des
    // activations majeures. Le narratif Gemini les voyait, mais le score
    // restait à ~19/100 (cas Ludwig × Mélanie M7 → dissonance utilisateur).
    // On agrège ici une contribution bornée des contacts à la cuspide de
    // cette maison, pondérée par la classe planétaire et la nature.
    const cuspsForHouse = (cuspAspects || []).filter(ca => ca.maison_cuspide === houseNum);
    const PERSONAL_WEIGHT = { Soleil: 1.5, Lune: 1.5, Mercure: 1.4, Vénus: 1.4, Mars: 1.4, Jupiter: 1.2, Saturne: 1.2, Uranus: 1.0, Neptune: 1.0, Pluton: 1.0, "Nœud Nord": 1.3, "Nœud Sud": 1.1, Chiron: 1.0 };
    let cuspPos = 0, cuspNeg = 0;
    const cuspDetails = [];
    for (const ca of cuspsForHouse) {
        const pw = PERSONAL_WEIGHT[ca.planete] || 1.0;
        let natW;
        if (ca.nature === "harmonie") natW = 0.85;
        else if (ca.nature === "tension") natW = -0.7;
        else if (ca.nature === "fusion") {
            const isBen = BENEFIC_OVERLAY.has(ca.planete);
            const isMal = MALEFIC_OVERLAY.has(ca.planete);
            natW = isMal ? 0.35 : isBen ? 0.85 : 0.65;
        } else natW = 0.4;
        const contrib = ca.score * natW * pw * 0.45; // 0.45 = échelle de mixage
        if (contrib >= 0) cuspPos += contrib; else cuspNeg += contrib;
        cuspDetails.push({ planete: ca.planete, aspect: ca.aspect, nature: ca.nature, orbe: ca.orbe, contrib: +contrib.toFixed(2) });
    }
    cuspPos = Math.min(cuspPos, 9);   // borne supérieure pour éviter un score qui explose
    cuspNeg = Math.max(cuspNeg, -7);

    if (entries.length === 0) {
        let rulerScore = 0;
        let rulerDetail = "empty";
        if (ruler && accDig) {
            const digModern = accDig.find(d => d.planet === ruler.maitre);
            const digTrad = ruler.double_maitrise ? accDig.find(d => d.planet === ruler.maitre_traditionnel) : null;
            const bestDig = digTrad && digModern
                ? (Math.abs(digTrad.score) > Math.abs(digModern.score) ? digTrad : digModern)
                : (digModern || digTrad);
            if (bestDig) {
                rulerScore = Math.max(-4, Math.min(6, bestDig.score * 0.3));
                rulerDetail = `empty_ruler_${bestDig.planet}(${bestDig.score})`;
            }
        }
        if (isPrincipale) rulerScore = Math.max(rulerScore, -3);
        // v5.1.0 — Si la maison est vide MAIS reçoit des contacts puissants à
        // la cuspide (ex. M7 vide mais Soleil cj DC + Saturne cj DC), on lève
        // le plafond de normalisation pour que le score reflète cette
        // activation angulaire. theoreticalCusp augmente avec cuspPos.
        const weighted = (rulerScore + cuspPos + cuspNeg) * typoPriority;
        const cuspBoost = Math.round(((cuspPos + cuspNeg) + 7) / 16 * 30); // 0..30
        const baseRuler = Math.max(0, Math.min(40, Math.round(((rulerScore + 5) / 12) * 40)));
        const norm = Math.max(0, Math.min(85, Math.max(baseRuler, baseRuler + cuspBoost - 10)));
        return {
            score: +(Math.round(weighted * 10) / 10),
            normalized: norm,
            empty: true,
            detail: rulerDetail + (cuspDetails.length ? `+cusp:${cuspDetails.length}` : ""),
            cuspContacts: cuspDetails,
            breakdown: { overlayPos: 0, overlayNeg: 0, aspPos: 0, aspNeg: 0, cuspPos, cuspNeg, rulerBonus: rulerScore, typoPriority, theoretical: 20, entryCount: 0 }
        };
    }

    let overlayPos = 0, overlayNeg = 0;
    for (const e of entries) {
        let base = e.poids * (e.planete_cle_typo ? 1.5 : 1.0);

        if (e.dignite === "Domicile" || e.dignite === "Exaltation") base *= 1.20;
        else if (e.dignite === "Exil" || e.dignite === "Chute") base *= 0.75;

        if (BENEFIC_OVERLAY.has(e.planete)) base *= 1.10;
        else if (MALEFIC_OVERLAY.has(e.planete)) base *= 0.85;

        if (e.retrograde) {
            base *= 0.90;
            if (isPrincipale && e.tier <= 1) base *= 0.92;
        }

        if (allHayz.some(hz => hz.planete === e.planete)) base *= 1.12;

        if (base >= 0) overlayPos += base; else overlayNeg += base;
    }

    let aspPos = 0, aspNeg = 0;
    const processAspects = (aspects, weight) => {
        for (const asp of (aspects || [])) {
            const pSource = sourcePlanets.find(p => getPlanetName(p) === asp.planete_source);
            if (!pSource) continue;
            const aspHouse = getHouseNumber(getPlanetDegree(pSource), targetHouses);
            if (aspHouse !== houseNum) continue;

            let aspW = asp.score * 0.3 * weight;
            if (asp.nature === "harmonie") aspW *= 1.2;
            else if (asp.nature === "tension") aspW *= -0.6;
            else if (asp.nature === "fusion") {
                const isBen = BENEFIC_OVERLAY.has(asp.planete_source) || BENEFIC_OVERLAY.has(asp.planete_cible);
                const isMal = MALEFIC_OVERLAY.has(asp.planete_source) && MALEFIC_OVERLAY.has(asp.planete_cible);
                aspW *= isMal ? -0.4 : isBen ? 1.0 : 0.6;
            } else if (asp.nature === "ajustement") {
                aspW *= -0.2;
            }
            if (asp.applying === true) aspW *= 1.25;
            else if (asp.applying === false) aspW *= 0.85;
            if (aspW >= 0) aspPos += aspW; else aspNeg += aspW;
        }
    };
    processAspects(interAspects, 1.0);
    processAspects(interAspectsT2, 0.3);

    const aspCap = Math.max(overlayPos, 15);
    aspPos = Math.min(aspPos, aspCap);
    aspNeg = Math.max(aspNeg, -aspCap * 0.5);

    let rulerBonus = 0;
    if (ruler && accDig) {
        const rulerDig = accDig.find(d => d.planet === ruler.maitre);
        if (rulerDig) {
            if (rulerDig.score > 8) rulerBonus = 1.5;
            else if (rulerDig.score > 3) rulerBonus = 0.7;
            else if (rulerDig.score < -5) rulerBonus = -1.2;
            else if (rulerDig.score < -2) rulerBonus = -0.5;
        }
        if (ruler.double_maitrise) {
            const tradDig = accDig.find(d => d.planet === ruler.maitre_traditionnel);
            if (tradDig) {
                const tradBonus = tradDig.score > 8 ? 0.8 : tradDig.score > 3 ? 0.4 : tradDig.score < -5 ? -0.6 : tradDig.score < -2 ? -0.3 : 0;
                rulerBonus += tradBonus * 0.5;
            }
        }
    }

    let clusterPenalty = 0;
    const retroExilEntries = entries.filter(e => e.retrograde && (e.dignite === "Exil" || e.dignite === "Chute"));
    if (retroExilEntries.length >= 2 && (isPrincipale || isSecondaire)) {
        clusterPenalty = retroExilEntries.length * -1.5;
    }

    const rawPositive = overlayPos + aspPos + cuspPos;
    const rawNegative = overlayNeg + aspNeg + cuspNeg;
    const rawTotal = rawPositive + rawNegative + rulerBonus + clusterPenalty;

    const weighted = rawTotal * typoPriority;

    const overlayTheoBase = entries.reduce((sum, e) => {
        if (e.tier <= 1) return sum + 18;
        if (e.tier <= 2) return sum + 8;
        return sum + 4;
    }, 0);
    const aspTheoBase = entries.length * 3;
    // v5.1.0 — Théorique tient aussi compte des cusp contacts (axe activé).
    // Sans ça, intégrer cuspPos sans bouger le théorique pousserait le score
    // à 100% trop facilement.
    const cuspTheoBase = cuspsForHouse.reduce((sum, ca) => sum + (ca.score >= 6 ? 4 : 2), 0);
    const theoreticalBase = overlayTheoBase + aspTheoBase + cuspTheoBase;
    const theoretical = Math.max(theoreticalBase * typoPriority, 20);
    const normalized = Math.max(0, Math.min(100, Math.round((weighted / theoretical) * 100)));

    return {
        score: +(Math.round(weighted * 10) / 10),
        normalized: normalized,
        empty: false,
        detail: null,
        cuspContacts: cuspDetails,
        breakdown: { overlayPos: +overlayPos.toFixed(1), overlayNeg: +overlayNeg.toFixed(1), aspPos: +aspPos.toFixed(1), aspNeg: +aspNeg.toFixed(1), cuspPos: +cuspPos.toFixed(1), cuspNeg: +cuspNeg.toFixed(1), rulerBonus: +rulerBonus.toFixed(2), typoPriority, theoretical: +theoretical.toFixed(1), entryCount: entries.length, cuspCount: cuspsForHouse.length }
    };
}

// ====== v6.0.0 — computeHouseScoreHI =======================================
// Version "double scoring" qui produit (Hm, Im) projetés sur [0..100] avec
// baseline 50 = neutre. La sortie expose aussi la signature dominante
// (fluid/tense/transformative/karmic/inactive/mixed) qui sera utilisée pour
// brider le narratif Gemini.
//
// Convention astrologue (validée 2026-05-05) :
//   - 50 = maison neutre (rien ne se passe ou équilibre parfait)
//   - <30 = maison clairement bloquée/conflictuelle
//   - >70 = maison clairement fluide/active positivement
//   - L'Intensité reste invisible côté client mais détermine la classification
//     "Relation transformative" / "Relation harmonique" / etc.
function computeHouseScoreHI(houseNum, overlay, interAspects, sourcePlanets, targetHouses, houseRulers, accDig, interAspectsT2, cuspAspects) {
    const isPrincipale = typoConfig.principales.includes(houseNum);
    const isSecondaire = typoConfig.secondaires.includes(houseNum);
    const entries = overlay[houseNum] || [];
    const ruler = houseRulers?.[houseNum];
    const isAngular = (houseNum === 1 || houseNum === 4 || houseNum === 7 || houseNum === 10);

    let H_acc = 0;     // accumulateur harmonie (signé), sera projeté sur [0..100]
    let I_acc = 0;     // accumulateur intensité (cumulé), sera projeté sur [0..100]
    const classCounts = { fluid: 0, tension_blocking: 0, fusion_neutral: 0, transformative: 0, karmic: 0, destabilizing: 0 };
    const contributors = [];

    // --- 1. Overlay in-house : présence des planètes de l'autre dans la maison
    // Chaque planète contribue à I_acc proportionnellement à son poids planète × tier × dignité
    // et à H_acc selon sa nature naturelle (Vénus +, Saturne -, etc.)
    for (const e of entries) {
        const pName = e.planete;
        const pWeight = (PLANET_WEIGHT[pName] || PLANET_WEIGHT.default) / 10;  // [0..1]
        const tierFactor = e.tier <= 1 ? 1.0 : e.tier <= 2 ? 0.6 : 0.3;
        let dignFactor = 1.0;
        if (e.dignite === "Domicile" || e.dignite === "Exaltation") dignFactor = 1.2;
        else if (e.dignite === "Exil" || e.dignite === "Chute") dignFactor = 0.8;
        const retroFactor = e.retrograde ? 0.85 : 1.0;

        const baseHByPlanet = PLANET_NATURE.benefic.has(pName) ? +2.5
            : PLANET_NATURE.malefic_classical.has(pName) ? -2.0
            : PLANET_NATURE.transformer.has(pName) ? -1.5
            : PLANET_NATURE.illusionist.has(pName) ? -1.0
            : PLANET_NATURE.luminary.has(pName) ? +2.0
            : 0;

        const weight = pWeight * tierFactor * dignFactor * retroFactor;
        H_acc += baseHByPlanet * weight;
        I_acc += weight * 12;        // intensité d'occupation : 12 pts max par planète tier-1
        contributors.push({ src: "overlay", planete: pName, contribH: +(baseHByPlanet * weight).toFixed(2), contribI: +(weight * 12).toFixed(2) });
    }

    // --- 2. Inter-aspects entre planètes in-house et planètes natales du natif
    const processAspectsHI = (aspects, weight = 1.0) => {
        for (const asp of (aspects || [])) {
            const pSource = sourcePlanets.find(p => getPlanetName(p) === asp.planete_source);
            if (!pSource) continue;
            const aspHouse = getHouseNumber(getPlanetDegree(pSource), targetHouses);
            if (aspHouse !== houseNum) continue;
            const r = computeAspectScoreHI(asp);
            classCounts[r.class] = (classCounts[r.class] || 0) + 1;
            H_acc += r.harmony * weight;
            I_acc += r.intensity * weight * 1.5;     // facteur d'amplification de l'intensité
            contributors.push({ src: "aspect", planete: asp.planete_source + "→" + asp.planete_cible, asp: asp.name || asp.aspect, class: r.class, contribH: +r.harmony.toFixed(2), contribI: +r.intensity.toFixed(2) });
        }
    };
    processAspectsHI(interAspects, 1.0);
    processAspectsHI(interAspectsT2, 0.3);

    // --- 3. Contacts à la cuspide / aux angles (M1/4/7/10 = boost angulaire)
    // Les contacts à un angle pèsent double car ce sont des points sensibles
    // d'expression directe du natif.
    const cuspsForHouse = (cuspAspects || []).filter(ca => ca.maison_cuspide === houseNum);
    const angularBoost = isAngular ? 1.6 : 1.0;
    for (const ca of cuspsForHouse) {
        const r = computeAspectScoreHI({
            planete_source: ca.planete,
            planete_cible: isAngular ? (houseNum === 1 ? "Ascendant" : houseNum === 4 ? "Imum Coeli" : houseNum === 7 ? "Descendant" : "MC") : ("Cuspide M" + houseNum),
            name: ca.aspect,
            nature: ca.nature,
            orbe: ca.orbe
        });
        classCounts[r.class] = (classCounts[r.class] || 0) + 1;
        H_acc += r.harmony * angularBoost;
        I_acc += r.intensity * angularBoost * 1.3;
        contributors.push({ src: "cusp", planete: ca.planete, asp: ca.aspect, class: r.class, contribH: +(r.harmony * angularBoost).toFixed(2), contribI: +(r.intensity * angularBoost).toFixed(2) });
    }

    // --- 4. Maître de la maison + dignité
    let rulerH = 0;
    if (ruler && accDig) {
        const dig = accDig.find(d => d.planet === ruler.maitre);
        if (dig) {
            if (dig.score > 8) rulerH = +3;
            else if (dig.score > 3) rulerH = +1.5;
            else if (dig.score < -5) rulerH = -3;
            else if (dig.score < -2) rulerH = -1.5;
        }
    }
    H_acc += rulerH;

    // --- 5. Cluster pénalité : retro+chute groupés
    const retroExilEntries = entries.filter(e => e.retrograde && (e.dignite === "Exil" || e.dignite === "Chute"));
    if (retroExilEntries.length >= 2) H_acc -= retroExilEntries.length * 1.5;

    // --- 6. Projection sur [0..100] avec baseline 50
    // H_acc est typiquement dans [-25..+25] pour une maison fortement chargée.
    // On utilise une projection sigmoïde douce pour ne pas saturer trop vite.
    const harmonyProjection = (h) => {
        // 50 + 2*h donne un range [0..100] pour h ∈ [-25..+25] (linéaire borné)
        // Plus doux : 50 + atan(h/15) * (50/π/2) * 1.7 environ
        const v = 50 + 1.8 * h;
        return Math.max(0, Math.min(100, Math.round(v)));
    };
    // Bonus de typologie sur l'harmonie pour valoriser les maisons clés mais
    // sans masquer les vraies notes basses (cap +/-3 points).
    const typoH_bonus = isPrincipale ? +1.5 : isSecondaire ? +0.5 : 0;
    const Hm = harmonyProjection(H_acc + typoH_bonus);

    // I_acc projection : ~80 pts d'accumulation = saturation
    // Cap inférieur 0, cap supérieur 100, courbe linéaire.
    const intensityProjection = (i) => Math.max(0, Math.min(100, Math.round((i / 80) * 100)));
    const Im = intensityProjection(I_acc);

    // --- 7. Signature dominante (pour Gemini)
    let dominantSignature = "inactive";
    const maxClass = Object.entries(classCounts).sort((a, b) => b[1] - a[1])[0];
    if (maxClass && maxClass[1] > 0) {
        const top = maxClass[0];
        const total = Object.values(classCounts).reduce((a, b) => a + b, 0);
        const ratio = total > 0 ? maxClass[1] / total : 0;
        if (ratio < 0.4) dominantSignature = "mixed";
        else if (top === "fluid") dominantSignature = "fluid";
        else if (top === "tension_blocking") dominantSignature = "tense";
        else if (top === "transformative") dominantSignature = "transformative";
        else if (top === "karmic") dominantSignature = "karmic";
        else if (top === "destabilizing") dominantSignature = "destabilizing";
        else if (top === "fusion_neutral") dominantSignature = Im >= 60 ? "intense_neutral" : "neutral";
    }
    if (entries.length === 0 && cuspsForHouse.length === 0) dominantSignature = "inactive";

    return {
        harmony: Hm,
        intensity: Im,
        dominant_signature: dominantSignature,
        class_counts: classCounts,
        H_acc: +H_acc.toFixed(2),
        I_acc: +I_acc.toFixed(2),
        is_principale: isPrincipale,
        is_secondaire: isSecondaire,
        is_angular: isAngular,
        empty: entries.length === 0,
        contributors_count: contributors.length,
        contributors_top: contributors.sort((a, b) => Math.abs((b.contribH || 0) + (b.contribI || 0)) - Math.abs((a.contribH || 0) + (a.contribI || 0))).slice(0, 8)
    };
}

function computeHouseTensionSupport(houseNum, overlay, interAspects, sourcePlanets, targetHouses, nodalContacts, interAspectsMinor, cuspAspects) {
    const entries = overlay[houseNum] || [];
    let tension = 0, support = 0;

    for (const e of entries) {
        const w = Math.abs(e.poids) * (e.planete_cle_typo ? 1.5 : 1.0);
        const digMult = (e.dignite === "Domicile" || e.dignite === "Exaltation") ? 1.2 : (e.dignite === "Exil" || e.dignite === "Chute") ? 0.75 : 1.0;
        const retroMult = e.retrograde ? 0.9 : 1.0;
        const score = w * digMult * retroMult;
        if (MALEFIC_OVERLAY.has(e.planete)) tension += score;
        else if (BENEFIC_OVERLAY.has(e.planete)) support += score;
        else { tension += score * 0.5; support += score * 0.5; }
    }

    const classifyAspects = (aspects, weight) => {
        for (const asp of (aspects || [])) {
            const pSource = sourcePlanets.find(p => getPlanetName(p) === asp.planete_source);
            if (!pSource) continue;
            const aspHouse = getHouseNumber(getPlanetDegree(pSource), targetHouses);
            if (aspHouse !== houseNum) continue;
            const w = Math.abs(asp.score) * 0.3 * weight;
            if (asp.nature === "tension") tension += w;
            else if (asp.nature === "harmonie") support += w;
            else if (asp.nature === "fusion") {
                const isBen = BENEFIC_OVERLAY.has(asp.planete_source) || BENEFIC_OVERLAY.has(asp.planete_cible);
                const isMal = MALEFIC_OVERLAY.has(asp.planete_source) && MALEFIC_OVERLAY.has(asp.planete_cible);
                if (isMal) tension += w;
                else if (isBen) support += w;
                else { tension += w * 0.5; support += w * 0.5; }
            } else if (asp.nature === "ajustement") {
                tension += w * 0.6; support += w * 0.4;
            }
        }
    };
    classifyAspects(interAspects, 1.0);
    classifyAspects(interAspectsMinor, 0.3);

    for (const nc of (nodalContacts || [])) {
        const ncHouse = (() => {
            const pMatch = sourcePlanets.find(p => getPlanetName(p) === nc.planete);
            if (!pMatch) return -1;
            return getHouseNumber(getPlanetDegree(pMatch), targetHouses);
        })();
        if (ncHouse !== houseNum) continue;
        const w = Math.abs(nc.score) * 0.25;
        if (nc.karmique && ["Carré", "Opposition"].includes(nc.aspect)) tension += w;
        else if (["Trigone", "Sextile"].includes(nc.aspect)) support += w;
        else if (nc.aspect === "Conjonction") { tension += w * 0.3; support += w * 0.7; }
        else { tension += w * 0.5; support += w * 0.5; }
    }

    for (const ca of (cuspAspects || [])) {
        if (ca.maison_cuspide !== houseNum) continue;
        const w = ca.score * 0.2;
        if (ca.nature === "tension") tension += w;
        else if (ca.nature === "harmonie") support += w;
        else { tension += w * 0.4; support += w * 0.6; }
    }

    const total = tension + support;
    const ratio = total > 0 ? +((support - tension) / total).toFixed(3) : 0;
    return {
        tension: +tension.toFixed(1),
        support: +support.toFixed(1),
        total: +total.toFixed(1),
        ratio,
        polarite: ratio > 0.25 ? "support" : ratio < -0.25 ? "tension" : "mixte"
    };
}

const houseScoresBinA = {};
const houseScoresAinB = {};
const houseNormBinA = {};
const houseNormAinB = {};
const houseDetailsBinA = {};
const houseDetailsAinB = {};
const houseTSBinA = {};
const houseTSAinB = {};
// v6.0.0 — double scoring (Hm, Im) en parallèle
const houseHIBinA = {};
const houseHIAinB = {};
for (let h = 1; h <= 12; h++) {
    const rBinA = computeHouseScore(h, overlayBinA, interAspectsBtoA, natalPlanetsB, natalHousesA, houseRulersA, accDignityA, interAspectsTier2BtoA, cuspAspectsBtoA);
    const rAinB = computeHouseScore(h, overlayAinB, interAspectsAtoB, natalPlanetsA, natalHousesB, houseRulersB, accDignityB, interAspectsTier2AtoB, cuspAspectsAtoB);
    houseScoresBinA[h] = rBinA.score;
    houseScoresAinB[h] = rAinB.score;
    houseNormBinA[h] = rBinA.normalized;
    houseNormAinB[h] = rAinB.normalized;
    houseDetailsBinA[h] = rBinA;
    houseDetailsAinB[h] = rAinB;
    houseTSBinA[h] = _preHouseTSBinA[h];
    houseTSAinB[h] = _preHouseTSAinB[h];
    // v6.0.0 — score Harmonie / Intensité (baseline 50)
    houseHIBinA[h] = computeHouseScoreHI(h, overlayBinA, interAspectsBtoA, natalPlanetsB, natalHousesA, houseRulersA, accDignityA, interAspectsTier2BtoA, cuspAspectsBtoA);
    houseHIAinB[h] = computeHouseScoreHI(h, overlayAinB, interAspectsAtoB, natalPlanetsA, natalHousesB, houseRulersB, accDignityB, interAspectsTier2AtoB, cuspAspectsAtoB);
}

// ====== v5.0.0 — FINALISATION SCORE GLOBAL AVEC PILIER 6 + VETO ============
// Maintenant que les maisons normalisées et leurs polarités tension/support
// sont calculées, on intègre le Pilier 6 « Cohérence typologique des maisons »
// et on applique le veto qualitatif sur les configurations d'échec critiques.
// Cela ré-écrit globalScoreResult.score, qualitative_band, dual_score et
// detail.pilier6_typo_houses (+ detail.qualitative_veto si applicable).
const _scoresHouseObjForVeto = {
    houses_norm_b_in_a: houseNormBinA,
    houses_norm_a_in_b: houseNormAinB,
    tension_support_b_in_a: houseTSBinA,
    tension_support_a_in_b: houseTSAinB
};
finalizeGlobalScoreWithPilier6(
    globalScoreResult,
    houseNormBinA, houseNormAinB,
    houseTSBinA, houseTSAinB,
    _scoresHouseObjForVeto,
    typoConfig
);
globalScore = globalScoreResult.score;
globalScoreDetail = { ...globalScoreResult.detail, qualitative_band: globalScoreResult.qualitative_band };

// ====== v6.0.0 — Score global Harmonie/Intensité (source de vérité UI) ======
// Calculé à partir des Hm/Im par maison (computeHouseScoreHI). Cohérent par
// construction avec les notes affichées dans les cartouches. Le score v5.0.0
// (globalScore) est conservé pour debug et continuité durant la transition.
//
// v6.2.0 — Compensation intra-axe (recommandation astrologue) appliquée AVANT
// le calcul du score global pour que la compensation se reflète à la fois
// dans les cartouches (HTML) et dans le score global. Bidirectionnelle.
const _compBinA = applyHouseCompensation(houseHIBinA, typologie);
const _compAinB = applyHouseCompensation(houseHIAinB, typologie);
Object.assign(houseHIBinA, _compBinA.compensated);
Object.assign(houseHIAinB, _compAinB.compensated);
const houseCompensationLog = {
    b_in_a: _compBinA.log,
    a_in_b: _compAinB.log,
    typology: typologie
};

// v6.3.0 — Q7 astrologue : pondération directionnelle Parent/Enfant.
// Si l'input fournit personne_a.role et personne_b.role explicitement
// (parent / enfant / child), on pondère 70/30. Sans rôle, symétrique.
const _directionalWeights = (() => {
    if (typologie !== "Parent / Enfant") return null;
    const _roleA = (personneA.role || "").toLowerCase();
    const _roleB = (personneB.role || "").toLowerCase();
    const isParentA = _roleA.includes("parent") || _roleA === "père" || _roleA === "mère" || _roleA === "father" || _roleA === "mother";
    const isParentB = _roleB.includes("parent") || _roleB === "père" || _roleB === "mère" || _roleB === "father" || _roleB === "mother";
    const isChildA = _roleA.includes("enfant") || _roleA.includes("child") || _roleA === "fils" || _roleA === "fille" || _roleA === "son" || _roleA === "daughter";
    const isChildB = _roleB.includes("enfant") || _roleB.includes("child") || _roleB === "fils" || _roleB === "fille" || _roleB === "son" || _roleB === "daughter";
    if (isParentA && isChildB) {
        // A=parent : impact A→B = 70 %, B→A = 30 %  (Hm = wBA*B-in-A + wAB*A-in-B)
        // a = B-in-A (impact de B sur A)  → wBA = 30 %
        // b = A-in-B (impact de A sur B)  → wAB = 70 %
        return { b_in_a: 0.30, a_in_b: 0.70, parent: persoStrA, child: persoStrB };
    }
    if (isParentB && isChildA) {
        return { b_in_a: 0.70, a_in_b: 0.30, parent: persoStrB, child: persoStrA };
    }
    // Fallback : utiliser l'âge si disponible (le plus âgé est présumé parent)
    if (typeof ageA === "number" && typeof ageB === "number" && Math.abs(ageA - ageB) >= 15) {
        if (ageA > ageB) return { b_in_a: 0.30, a_in_b: 0.70, parent: persoStrA, child: persoStrB, derived_from: "age" };
        return { b_in_a: 0.70, a_in_b: 0.30, parent: persoStrB, child: persoStrA, derived_from: "age" };
    }
    return null;
})();

// v6.5.0 — Q24 : on transmet adversityScore pour la bande spéciale
// « Indifférence astrale » en typologie Rivalité.
const _bandExtras = { adversityScore: (adversityIndex && typeof adversityIndex.score === "number") ? adversityIndex.score : null };
const _globalHI = computeGlobalHIScore(houseHIBinA, houseHIAinB, typoConfig, langue, _directionalWeights, _bandExtras);

// v6.2.0 — Modulateur Longévité (Q2 astrologue) : pour les typologies
// d'engagement, l'Harmonie globale est modulée par l'Indice de longévité.
// Un couple sans Saturne ciment ne peut pas afficher "Alchimie exceptionnelle"
// même si l'attraction immédiate est forte.
// v6.3.0 — Q11 astrologue : extension à Mentorat (besoin de durée pour
// l'infusion saturnienne) et Colocataire (bail, règles, durabilité matérielle).
const ENGAGEMENT_TYPOLOGIES = new Set([
    "Amour", "Business", "Parent / Enfant",
    "Mentorat", "Colocataire"
]);
const _longevityModulator = (() => {
    if (!ENGAGEMENT_TYPOLOGIES.has(typologie)) return 0;
    const li = (longevityIndex && typeof longevityIndex.score === "number") ? longevityIndex.score : 7.5;
    if (li <= 3) return -5;
    if (li <= 5) return -3;
    if (li <= 8) return 0;
    if (li <= 11) return +1;
    return +3;
})();
const _harmonyV6_pre_modulation = _globalHI.harmony;
_globalHI.harmony = Math.max(5, Math.min(96, _globalHI.harmony + _longevityModulator));

// v6.4.0 — Q21 astrologue : modulateur élémentaire léger.
// Profils diamétralement opposés (pur Feu ↔ pur Eau, pur Air ↔ pur Terre)
// = -3 ; profils complémentaires (Feu+Air OU Terre+Eau) avec dominantes
// nettes = +2 ; sinon neutre. Reflète le « bruit de fond » élémentaire.
const _elementalModulator = (() => {
    const ec = elementCompat || {};
    const wA = ec.elements ? Object.fromEntries(Object.entries(ec.elements).map(([k, v]) => [k, v.weighted_a || 0])) : null;
    const wB = ec.elements ? Object.fromEntries(Object.entries(ec.elements).map(([k, v]) => [k, v.weighted_b || 0])) : null;
    if (!wA || !wB) return 0;
    const totA = Object.values(wA).reduce((a, b) => a + b, 0) || 1;
    const totB = Object.values(wB).reduce((a, b) => a + b, 0) || 1;
    const dominantShareA = (wA[ec.dominant_a] || 0) / totA;
    const dominantShareB = (wB[ec.dominant_b] || 0) / totB;
    // « Profil pur » = dominant ≥ 50% des points élémentaires
    const isPurA = dominantShareA >= 0.50;
    const isPurB = dominantShareB >= 0.50;
    if (ec.element_relation === "tension" && isPurA && isPurB) return -3;
    if (ec.element_relation === "harmonie" && (isPurA || isPurB)) return +2;
    if (ec.element_relation === "tension") return -1;
    return 0;
})();
_globalHI.harmony = Math.max(5, Math.min(96, _globalHI.harmony + _elementalModulator));

// v6.5.0 — Q27 & Q29 : bonus de signature typologique (Mentorat / Fratrie).
// Capte les patterns sous-pondérés par la grille standard (Sun-Saturne,
// Jupiter-MC pour Mentorat ; Lune-Lune, Lune en M4 pour Fratrie).
_globalHI.harmony = Math.max(5, Math.min(96, _globalHI.harmony + (_typologySignatureBonus?.bonus || 0)));

// v6.6.0 — Q43 astrologue : bonus de signature harmonique « Grand Bénéfique ».
// Pattern booléen rare (4 conditions AND) qui capte la grâce systémique
// (Grand Trigone bénéfique + ciment Saturne positif + absence de toxicité).
// +7 fixe, appliqué AVANT le plafond Q25 pour ne pas court-circuiter celui-ci.
// v6.7.0 — Q45 : ajout d'un Tier 2 « Demi-Bénéfique » (+4) pour les patterns
//                moins archétypaux mais structurellement très bons.
_globalHI.harmony = Math.max(5, Math.min(96, _globalHI.harmony + (_harmonicSignatureBonus?.bonus || 0)));

// v6.8.0 — Q49 astrologue : bonus de compatibilité intellectuelle
// (Mercure-Mercure harmonique). Appliqué AVANT le plafond Q25.
_globalHI.harmony = Math.max(5, Math.min(96, _globalHI.harmony + (_intellectualSignatureBonus?.bonus || 0)));

// v6.5.0 — Q25 astrologue : plafond-couperet à 55 si l'Indice de Longévité
// est très faible (< 2/15) ET la typologie est d'engagement (Saturne ciment
// quasi nul → la relation ne peut pas tenir dans la durée). Reflète le
// « belle façade, mais impossible à construire dans la durée » (cas Diana/Charles).
const _engagementCeilingApplied = (() => {
    if (!ENGAGEMENT_TYPOLOGIES.has(typologie)) return null;
    const li = (longevityIndex && typeof longevityIndex.score === "number") ? longevityIndex.score : null;
    if (li == null || li >= 2) return null;
    if (_globalHI.harmony <= 55) return null;
    const before = _globalHI.harmony;
    _globalHI.harmony = 55;
    return { capped_from: before, capped_to: 55, longevity_score: li, reason: "longevity_below_2_engagement_typology" };
})();

// Recalcul de la bande qualitative après modulations
if (_longevityModulator !== 0 || _elementalModulator !== 0 || _engagementCeilingApplied || (_typologySignatureBonus?.bonus || 0) !== 0 || (_harmonicSignatureBonus?.bonus || 0) !== 0 || (_intellectualSignatureBonus?.bonus || 0) !== 0) {
    _globalHI.qualitative_band_v6 = computeQualitativeBandV6(_globalHI.harmony, _globalHI.intensity, _globalHI.dominant_signature_global, { ...typoConfig, _typologie: typologie }, _bandExtras);
}
_globalHI.detail_v6 = _globalHI.detail_v6 || {};
_globalHI.detail_v6.longevity_modulator = _longevityModulator;
_globalHI.detail_v6.elemental_modulator = _elementalModulator;
_globalHI.detail_v6.harmony_pre_modulation = _harmonyV6_pre_modulation;
_globalHI.detail_v6.engagement_typology = ENGAGEMENT_TYPOLOGIES.has(typologie);
_globalHI.detail_v6.engagement_ceiling = _engagementCeilingApplied;
_globalHI.detail_v6.typology_signature_bonus = _typologySignatureBonus;
_globalHI.detail_v6.harmonic_signature_bonus = _harmonicSignatureBonus;
_globalHI.detail_v6.intellectual_signature_bonus = _intellectualSignatureBonus;

globalScoreResult.harmony = _globalHI.harmony;
globalScoreResult.intensity = _globalHI.intensity;
globalScoreResult.qualitative_band_v6 = _globalHI.qualitative_band_v6;
globalScoreResult.dominant_signature_global = _globalHI.dominant_signature_global;
globalScoreResult.detail_v6 = _globalHI.detail_v6;
globalScoreResult.class_counts_global = _globalHI.class_counts;
globalScoreResult.version = "v6.8.0";
// v7.0.0-β.3 — la narration évolue ; le scoring reste figé v6.8.0.
//   • β.1 : +7 paires planétaires fréquentes (Lune-Pluton, Ascendant-Lune, Lune-Uranus,
//     Ascendant-Soleil, MC-Soleil, Jupiter-Soleil, Ascendant-Descendant) + lexique
//     typologique injecté dans les 12 prompts maisons (cohérence narrative).
//   • β.2 (Q56-3) : Lune/Pluton hard ré-écrit pour les 7 typologies hors Amour
//     (Ami / Business : passion créative viscérale, complicité instinctive
//     inséparable au lieu d'« amitié toxique » / « manipulation »). Amour et
//     Rivalité gardent la lecture sombre originale.
//   • β.3 (Q56-9 bug fix Pertinence vs Harmonie) : le score "pertinence" et
//     T/S ne sont plus injectés numériquement dans le prompt LLM des sections
//     maison ; le LLM ne voit plus qu'une qualification qualitative
//     (très élevée / élevée / modérée / faible / très faible) + le mot de
//     polarité (mixte / tension / soutien). Le seul score chiffré côté
//     client est désormais l'« Harmonie » du cartouche.
globalScoreResult.narrative_version = "v7.0.0-beta.3";
// Le score "principal" affiché devient harmony_global (v6).
// On expose aussi `score` (=v5 stretched) pour rétrocompatibilité immédiate.
globalScoreResult.score_v5 = globalScore;
globalScoreResult.score = _globalHI.harmony;       // <-- bascule UI
globalScoreResult.qualitative_band = _globalHI.qualitative_band_v6;  // <-- bascule UI
globalScore = _globalHI.harmony;
globalScoreDetail = {
    ...globalScoreResult.detail,
    qualitative_band: _globalHI.qualitative_band_v6,
    qualitative_band_v5: globalScoreResult.qualitative_band_v6 ? null : null,
    longevity_index: longevityIndex,
    natal_blocks: { a: natalBlocksA, b: natalBlocksB },
    harmony: _globalHI.harmony,
    intensity: _globalHI.intensity,
    detail_v6: _globalHI.detail_v6,
    class_counts_global: _globalHI.class_counts,
    dominant_signature_global: _globalHI.dominant_signature_global,
    score_v5: globalScoreResult.score_v5,
    version: "v6.8.0",
    narrative_version: "v7.0.0-beta.3"
};

const _relevantHouses = [...typoConfig.principales, ...typoConfig.secondaires];
const topHousesByActivationBinA = Object.entries(houseTSBinA)
    .filter(([h]) => _relevantHouses.includes(+h))
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 6)
    .map(([h, ts]) => ({ house: +h, ...ts }));
const topHousesByActivationAinB = Object.entries(houseTSAinB)
    .filter(([h]) => _relevantHouses.includes(+h))
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 6)
    .map(([h, ts]) => ({ house: +h, ...ts }));

const topHousesBinA = Object.entries(houseScoresBinA)
    .sort((a, b) => b[1] - a[1])
    .filter(([h]) => maisonsRelevantes.includes(parseInt(h)))
    .slice(0, 8);

const topHousesAinB = Object.entries(houseScoresAinB)
    .sort((a, b) => b[1] - a[1])
    .filter(([h]) => maisonsRelevantes.includes(parseInt(h)))
    .slice(0, 8);

const topInterAspectsBtoA = interAspectsBtoA.slice(0, 15);
const topInterAspectsAtoB = interAspectsAtoB.slice(0, 15);
const topNodalAll = [...nodalContactsA, ...nodalContactsB].sort((a, b) => b.score - a.score).slice(0, 10);

// ---- 10. GÉNÉRATION DES PROMPTS LLM ----
const langueInstr = isEN ? `[LANGUAGE INSTRUCTION — MANDATORY]\nWrite your ENTIRE response in ${langue}. All titles, subtitles, analyses and descriptions must be in ${langue}.\n\n` : '';

function formatOverlay(houseNum, overlay) {
    const entries = overlay[houseNum] || [];
    if (entries.length === 0) return "Aucune planète dans cette maison.";
    const tier1 = entries.filter(e => e.tier === 1);
    const tier2 = entries.filter(e => e.tier === 2);
    let lines = [];
    for (const e of tier1) {
        let s = `• ${e.planete} à ${e.degre}° ${e.signe}`;
        if (e.retrograde) s += " (R)";
        if (e.dignite) s += ` [${e.dignite}]`;
        if (e.planete_cle_typo) s += " ★ PLANÈTE CLÉ";
        lines.push(s);
    }
    if (tier2.length > 0) {
        lines.push("Points secondaires (Lots/Astéroïdes pertinents) :");
        for (const e of tier2) {
            let s = `  ◦ ${e.planete} à ${e.degre}° ${e.signe}`;
            if (e.retrograde) s += " (R)";
            if (e.planete_cle_typo) s += " ★";
            lines.push(s);
        }
    }
    return lines.join("\n");
}

function formatHouseRulership(houseNum, houseRulers) {
    const r = houseRulers[houseNum];
    if (!r) return "";
    if (r.double_maitrise) {
        return `Cuspide : ${r.signe} — Maître moderne : ${r.maitre}, Maître traditionnel : ${r.maitre_traditionnel}`;
    }
    return `Cuspide : ${r.signe} — Maître : ${r.maitre}`;
}

function formatAspectsForHouse(houseNum, interAspects, targetHouses) {
    const relevant = interAspects.filter(asp => {
        const srcPlanets = asp.source_personne === persoStrA ? natalPlanetsA : natalPlanetsB;
        const cibPlanets = asp.source_personne === persoStrA ? natalPlanetsB : natalPlanetsA;
        const pSource = srcPlanets.find(p => getPlanetName(p) === asp.planete_source);
        const pCible = cibPlanets.find(p => getPlanetName(p) === asp.planete_cible);
        if (!pSource || !pCible) return false;
        const hSource = getHouseNumber(getPlanetDegree(pSource), targetHouses);
        const hCible = getHouseNumber(getPlanetDegree(pCible), targetHouses);
        return hSource === houseNum || hCible === houseNum;
    });
    if (relevant.length === 0) return "";
    return relevant.slice(0, 5).map(a => {
        let s = `• ${a.planete_source}`;
        if (a.dignite_source) s += ` [${a.dignite_source}]`;
        if (a.retro_source) s += " (R)";
        s += ` ${a.symbol} ${a.planete_cible}`;
        if (a.dignite_cible) s += ` [${a.dignite_cible}]`;
        if (a.retro_cible) s += " (R)";
        s += ` — ${a.aspect} orbe ${a.orbe}° score ${a.score}`;
        if (a.exact) s += " ⚡EXACT";
        if (a.applying === true) s += " →APPLIQUANT";
        else if (a.applying === false) s += " ←SÉPARANT";
        // v7.0.0-β.1 — cohérence narrative : injection du lexique typologique
        // dans les prompts MAISONS (sinon dissonance de registre avec la synthèse).
        // Note : function declaration non hoistée pour _typoLexiconFor / typologie ;
        // on protège l'appel pour ne pas casser si non disponible.
        try {
            if (typeof _typoLexiconFor === "function" && typeof typologie === "string") {
                const lex = _typoLexiconFor(a.planete_source, a.planete_cible, a.aspect, typologie);
                if (lex) s += `\n  ↳ Lecture ${typologie} : ${lex}`;
            }
        } catch { /* fail-soft : si helper non encore défini, on n'enrichit pas */ }
        return s;
    }).join("\n");
}

function formatNodalForHouse(houseNum, nodalContacts, targetHouses) {
    const relevant = nodalContacts.filter(nc => {
        const nodePlanets = nc.noeud_personne === persoStrA ? natalPlanetsA : natalPlanetsB;
        const planetPlanets = nc.planete_personne === persoStrA ? natalPlanetsA : natalPlanetsB;
        const pNode = nodePlanets.find(p => getPlanetName(p) === nc.noeud)
            || planetPlanets.find(p => getPlanetName(p) === nc.planete);
        if (!pNode) return false;
        return getHouseNumber(getPlanetDegree(pNode), targetHouses) === houseNum;
    });
    if (relevant.length === 0) return "";
    return relevant.map(nc =>
        `• ${nc.noeud} ${nc.aspect} ${nc.planete} (orbe ${nc.orbe}°) ${nc.karmique ? "🔗 KARMIQUE" : ""}`
    ).join("\n");
}

const crossReceptionsStr = crossReceptions.length > 0
    ? `\nRÉCEPTIONS MUTUELLES CROISÉES (lien puissant) :\n` + crossReceptions.map(r => `• ${r.description}`).join("\n")
    : "";

// P1.1 — Formater les configurations natales pour les prompts
const configsAStr = (configurationsA || []).length > 0
    ? `\nCFG ${persoStrA.split(' ')[0]} : ` + configurationsA.slice(0, 5).map(c => `${c.type}(${c.planets?.join(",") || ""})`).join(" | ")
    : "";
const configsBStr = (configurationsB || []).length > 0
    ? `\nCFG ${persoStrB.split(' ')[0]} : ` + configurationsB.slice(0, 5).map(c => `${c.type}(${c.planets?.join(",") || ""})`).join(" | ")
    : "";

// P1.2 — Formater les parallèles/contra-parallèles pour les prompts
const declStr = (() => {
    let s = "";
    const topPar = declData.parallels.slice(0, 6);
    if (topPar.length > 0) {
        s += `\nPARALLÈLES DÉCLINAISON (top ${topPar.length}/${declData.parallels.length}, ≈ conj. cachée) :\n`;
        s += topPar.map(p => `${p.p1}(${p.personne1.split(' ')[0]})//${p.p2}(${p.personne2.split(' ')[0]}) orbe ${p.orbe}°`).join(" | ");
    }
    const topCP = declData.contraParallels.slice(0, 4);
    if (topCP.length > 0) {
        s += `\nCONTRA-PARALLÈLES (top ${topCP.length}/${declData.contraParallels.length}, ≈ opp. cachée) :\n`;
        s += topCP.map(p => `${p.p1}(${p.personne1.split(' ')[0]})#${p.p2}(${p.personne2.split(' ')[0]}) orbe ${p.orbe}°`).join(" | ");
    }
    return s;
})();

// P1.3 — Formater les planètes OOB
const oobStr = declData.oob.length > 0
    ? `\nOOB (>${OOB_THRESHOLD}°) : ` + declData.oob.map(o => `${o.planete}(${o.personne.split(' ')[0]}) ${o.declinaison.toFixed(1)}°${o.hemisphere[0]}`).join(" | ")
    : "";

// P1.4 — Formater les ponts stellaires
const starBridgeStr = fixedStarBridges.length > 0
    ? `\nPONTS STELLAIRES (top ${Math.min(5, fixedStarBridges.length)}/${fixedStarBridges.length}) :\n` + fixedStarBridges.slice(0, 5).map(b => `★ ${b.etoile}: ${b.planete_a}(${b.personne_a.split(' ')[0]},M${b.maison_a}) ↔ ${b.planete_b}(${b.personne_b.split(' ')[0]},M${b.maison_b})`).join(" | ")
    : "";

// P1.5 — Formater les antiscia
const antisciaStr = allAntiscia.length > 0
    ? `\nANTISCIA (top ${Math.min(6, allAntiscia.length)}/${allAntiscia.length}) : ` + allAntiscia.slice(0, 6).map(a => `${a.p1}(${a.personne1.split(' ')[0]}) ${a.type === "Antiscia" ? "↔" : "⊗"} ${a.p2}(${a.personne2.split(' ')[0]}) ${a.orbe}°`).join(" | ")
    : "";

// P2.3 — Formater le Hayz
const hayzStr = allHayz.length > 0
    ? `\nHAYZ : ` + allHayz.map(h => `${h.planete}(${h.personne.split(' ')[0]})`).join(", ")
    : "";

// P2.5 — Formater les configurations composites
const compConfigStr = compositeConfigs.length > 0
    ? `\nCONFIGURATIONS DU THÈME COMPOSITE :\n` + compositeConfigs.map(c => `• ${c.type} : ${c.planets.join(", ")} — ${c.description}`).join("\n")
    : "";

// ── MÉMO POSITIONS NATALES — Garde anti-hallucination à la source ──
const MEMO_PLANETS_SYN = ["Soleil","Lune","Mercure","Vénus","Mars","Jupiter","Saturne","Uranus","Neptune","Pluton","Chiron","Nœud Nord","Nœud Sud","Ascendant","Milieu du Ciel"];
function buildPositionMemo(planets, houses, name, oobList) {
    const oobSet = new Set((oobList || []).map(o => o.planete || o.planet));
    const lines = [];
    for (const pName of MEMO_PLANETS_SYN) {
        const p = planets.find(pl => getPlanetName(pl) === pName);
        if (!p) continue;
        const deg = getPlanetDegree(p);
        const sign = getPlanetSign(p);
        const h = getHouseNumber(deg, houses);
        const retro = getPlanetRetro(p) ? " (R)" : "";
        const ess = (pName !== "Nœud Nord" && pName !== "Nœud Sud" && pName !== "Ascendant" && pName !== "Milieu du Ciel") ? getDignity(pName, sign) : null;
        const digTag = ess === "Domicile" ? " [Domicile]" : ess === "Exaltation" ? " [Exaltation]" : ess === "Exil" ? " [Exil]" : ess === "Chute" ? " [Chute]" : "";
        const oobTag = oobSet.has(pName) ? " ⚡OOB" : "";
        lines.push(`${pName}: ${Math.min(29, Math.round(deg % 30))}° ${sign} M${h}${retro}${digTag}${oobTag}`);
    }
    return `[MÉMO POSITIONS ${name}]\n${lines.join(" | ")}`;
}
const memoA = buildPositionMemo(natalPlanetsA, natalHousesA, persoStrA, planeteOobA);
const memoB = buildPositionMemo(natalPlanetsB, natalHousesB, persoStrB, planeteOobB);

const dataFidelityInstr = isEN
    ? 'DATA FIDELITY: use EXCLUSIVELY the data provided. NEVER infer a position not provided. NEVER hallucinate an aspect, degree or house.'
    : 'FIDÉLITÉ AUX DONNÉES : utilise EXCLUSIVEMENT les données fournies. Ne déduis JAMAIS une position non fournie. Ne JAMAIS halluciner un aspect, un degré ou une maison.';

const charteAntiHallucination = isEN
    ? `\n[⛔ ANTI-HALLUCINATION CHARTER — STRICT OBLIGATIONS]
1. ORBS & ACCURACY: NEVER write "exact conjunction" if the orb is > 0.5°. Always state the actual orb.
2. HOUSES: NEVER place a planet in a house different from the POSITION MEMO above.
3. SIGNS: NEVER change a planet's sign from what is stated in the data.
4. ASPECTS: NEVER invent an aspect not present in the data. Only comment on provided aspects.
5. DEGREES: NEVER cite a precise zodiacal degree unless EXPLICITLY provided.
6. NO EXTRAPOLATION: Do NOT combine separate data points to create a link not provided.
7. ASPECT DIRECTION: CRITICAL — When data states "Planet of X aspect Planet of Y", NEVER reverse: the first planet belongs to X, the second to Y. Systematically verify direction before writing.
8. A/B ATTRIBUTION: NEVER attribute a planet of person A to person B or vice versa. Check the POSITION MEMO to verify ownership of each planet.
9. CONTRADICTIONS: If data points appear contradictory (e.g. an aspect listed as harmonic but involving difficult planets), SIGNAL the ambiguity explicitly rather than silently choosing one interpretation.
10. COMPOSITE vs SYNASTRY: NEVER mix composite chart aspects (the relational entity) with synastric inter-aspects (one person's planets in the other's chart). These are two distinct analytical levels: synastry describes the interaction between two individuals, the composite describes what the relationship creates beyond them.
11. APPLYING ≠ EXACT: An APPLYING aspect (→) is NOT an exact aspect. An aspect at 3° applying remains a 3° orb aspect. NEVER over-interpret the applying quality as indicating near-exactitude.
12. NO TEMPORAL PREDICTIONS: Synastry describes a TIMELESS potential between two natal charts. NEVER write "this year", "in 2026", "soon", "in the coming months". Only timing techniques (transits, profections, solar returns) allow dated predictions, and they are NOT part of this analysis.\n`
    : `\n[⛔ CHARTE ANTI-HALLUCINATION — OBLIGATIONS STRICTES]
1. ORBES & EXACTITUDE : Ne JAMAIS écrire "conjonction exacte" ou "exactement sur" si l'orbe fourni est > 0.5°. Toujours indiquer l'orbe réel.
2. MAISONS : Ne JAMAIS placer une planète dans une maison différente du MÉMO POSITIONS ci-dessus.
3. SIGNES : Ne JAMAIS changer le signe d'une planète par rapport aux données fournies.
4. ASPECTS : Ne JAMAIS inventer un aspect absent des données. Commente uniquement les aspects fournis.
5. DEGRÉS : Ne JAMAIS citer de degré zodiacal précis sauf s'il est EXPLICITEMENT fourni.
6. INTERDICTION D'EXTRAPOLATION : Ne PAS combiner des données séparées pour créer un lien non fourni.
7. DIRECTION DES ASPECTS : ATTENTION CRITIQUE — Quand les données indiquent "Planète de X aspect Planète de Y", ne JAMAIS inverser : la planète du premier est bien celle de X, celle du second est celle de Y. Vérifie systématiquement la direction avant d'écrire.
8. ATTRIBUTION A/B : Ne JAMAIS attribuer une planète de la personne A à la personne B ou inversement. Consulte le MÉMO POSITIONS pour vérifier à qui appartient chaque planète.
9. CONTRADICTIONS : Si des données semblent contradictoires (ex. un aspect listé comme harmonique mais impliquant des planètes difficiles), SIGNALE l'ambiguïté explicitement plutôt que de choisir silencieusement une interprétation.
10. COMPOSITE vs SYNASTRIE : Ne JAMAIS mélanger les aspects du thème composite (l'entité relationnelle) avec les inter-aspects synastiques (planètes d'une personne dans le thème de l'autre). Ce sont deux niveaux d'analyse distincts : la synastrie décrit l'interaction entre les deux individus, le composite décrit ce que la relation crée au-delà d'eux.
11. APPLIQUANT ≠ EXACT : Un aspect APPLIQUANT (→) n'est PAS un aspect exact. Un aspect à 3° appliquant reste un aspect à 3° d'orbe. Ne jamais surinterpréter le caractère appliquant comme indiquant une quasi-exactitude.
12. Aucune prédiction temporelle. La synastrie décrit un potentiel INTEMPOREL entre deux thèmes nataux. Ne jamais écrire « cette année », « en 2026 », « bientôt », « dans les mois à venir ». Seules les techniques de timing (transits, profections, révolutions solaires) permettent des prédictions datées, et elles ne font PAS partie de cette analyse.\n`;

const roleA = personneA.role || null;
const roleB = personneB.role || null;
let roleContextStr = "";
if (roleA || roleB) {
    const lines = [];
    if (roleA) lines.push(`${persoStrA} ${isEN ? 'has the role of' : 'a le rôle de'} **${roleA}**`);
    if (roleB) lines.push(`${persoStrB} ${isEN ? 'has the role of' : 'a le rôle de'} **${roleB}**`);
    roleContextStr = `\n${isEN ? 'ROLE CONTEXT:' : 'CONTEXTE DE RÔLE :'}\n${lines.join('\n')}\n${isEN ? 'Tailor your interpretation to reflect these specific roles within the relationship.' : 'Adapte ton interprétation pour refléter ces rôles spécifiques dans la relation.'}\n`;
}

const ageStrA = ageA !== null ? ` (${ageA} ${isEN ? 'y.o.' : 'ans'})` : '';
const ageStrB = ageB !== null ? ` (${ageB} ${isEN ? 'y.o.' : 'ans'})` : '';
const ageContextStr = (() => {
    if (ageA === null || ageB === null) return '';
    const avg = (ageA + ageB) / 2;
    if (avg < 30) return isEN
        ? '\n- AGE CONTEXT: Young couple — favor growth dynamics, self-construction and mutual discovery.'
        : '\n- CONTEXTE D\'ÂGE : Couple jeune — privilégier les dynamiques de croissance et de construction.';
    if (avg <= 50) return isEN
        ? '\n- AGE CONTEXT: Mature couple — emphasize consolidation, shared projects and deepening bonds.'
        : '\n- CONTEXTE D\'ÂGE : Couple mature — mettre en avant la consolidation et les projets communs.';
    return isEN
        ? '\n- AGE CONTEXT: Experienced couple — focus on acquired wisdom and mutual enrichment.'
        : '\n- CONTEXTE D\'ÂGE : Couple expérimenté — accent sur la sagesse acquise et l\'enrichissement mutuel.';
})();

const systemPromptBase = `${isEN ? 'You are a professional astrologer specializing in synastry (relationship compatibility).' : 'Tu es un astrologue professionnel spécialisé en synastrie (compatibilité relationnelle).'}
${isEN ? `You analyze the relationship between ${persoStrA}${ageStrA} and ${persoStrB}${ageStrB} in the context of: ${typoConfig.label_en || typoConfig.label_fr}.` : `Tu analyses la relation entre ${persoStrA}${ageStrA} et ${persoStrB}${ageStrB} dans le contexte d'une relation de type : ${typoConfig.label_fr}.`}
${roleContextStr}
${memoA}
${memoB}

${isEN ? 'NATAL PROFILES:' : 'PROFILS NATAUX :'}
${natalSummaryA}
${natalSummaryB}
${configsAStr}
${configsBStr}

${isEN ? 'ELEMENTAL COMPATIBILITY:' : 'COMPATIBILITÉ ÉLÉMENTAIRE :'} ${elementCompat.summary_fr}
${crossReceptionsStr}
${declStr}
${oobStr}
${antisciaStr}
${starBridgeStr}
${hayzStr}

${dataFidelityInstr}

${isEN ? 'ABSOLUTE RULES:' : 'RÈGLES ABSOLUES :'}
${isEN ? '- Base interpretations EXCLUSIVELY on provided data.' : '- Base tes interprétations UNIQUEMENT sur les données fournies.'}
${isEN ? '- NEVER invent planetary positions, aspects or degrees absent from the data.' : "- N'invente JAMAIS de positions planétaires, aspects ou degrés absents des données."}
${isEN ? '- A planet in Domicile or Exaltation is strengthened. In Exile or Fall, weakened. Minor dignities (Triplicity, Term, Face) modulate subtly.' : '- Quand une planète est en Domicile ou Exaltation, elle est renforcée. En Exil ou Chute, elle est affaiblie. Les dignités mineures (Triplicité, Terme, Face) modulent subtilement.'}
${isEN ? '- A retrograde planet (R) in synastry indicates internalized energy, a maturation process — not a total blockage.' : '- Une planète rétrograde (R) en synastrie indique une énergie intériorisée, un travail de maturation — pas un blocage total.'}
${isEN ? '- Arabic Lots are calculated points from Hellenistic tradition: interpret them as thematic sensitivity indicators, not physical planets.' : '- Les Lots arabes mentionnés sont des points calculés de la tradition hellénistique : interprète-les comme des indicateurs de sensibilité thématique, pas comme des planètes physiques.'}
${isEN ? '- A declination parallel (//) acts like a subtle conjunction. A contra-parallel (#) like a subtle opposition.' : '- Un parallèle de déclinaison (//) agit comme une conjonction subtile. Un contra-parallèle (#) comme une opposition subtile.'}
${isEN ? '- An OOB planet expresses unconventional, outsized energy — relevant for couple dynamics.' : "- Une planète OOB exprime une énergie hors norme, non conventionnelle — pertinent pour la dynamique du couple."}
${isEN ? '- An APPLYING aspect (→) is forming and intensifying. A SEPARATING aspect (←) has peaked and is fading.' : '- Un aspect APPLIQUANT (→) est en formation et s\'intensifie. Un aspect SÉPARANT (←) a atteint son pic et s\'estompe.'}
${isEN ? '- Be nuanced: a difficult aspect is not a condemnation, it is a growth challenge.' : "- Sois nuancé : un aspect difficile n'est pas une condamnation, c'est un défi de croissance."}
${isEN ? '- Adopt a professional, caring but honest tone.' : '- Adopte un ton professionnel, bienveillant mais honnête.'}
${globalScore >= 80
    ? (isEN ? '- TONE GUIDANCE: Overall compatibility is strong. You may express genuine enthusiasm about positive dynamics while remaining honest about challenges.' : '- GUIDAGE TONAL : La compatibilité globale est forte. Tu peux exprimer un enthousiasme réel pour les dynamiques positives tout en restant honnête sur les défis.')
    : globalScore >= 60
    ? (isEN ? '- TONE GUIDANCE: Compatibility is moderate with real strengths and challenges. Maintain a balanced and nuanced tone.' : '- GUIDAGE TONAL : Compatibilité modérée avec de vraies forces et défis. Maintiens un ton équilibré et nuancé.')
    : globalScore >= 40
    ? (isEN ? '- TONE GUIDANCE: Compatibility shows significant friction. Be diplomatic and constructive, emphasizing growth potential alongside challenges.' : '- GUIDAGE TONAL : La compatibilité montre des frictions significatives. Sois diplomatique et constructif, souligne le potentiel de croissance aux côtés des défis.')
    : (isEN ? '- TONE GUIDANCE: Compatibility is difficult. Exercise maximum diplomacy. Frame challenges as growth opportunities without minimizing them.' : '- GUIDAGE TONAL : Compatibilité difficile. Exerce une diplomatie maximale. Présente les défis comme des opportunités de croissance sans les minimiser.')}${ageContextStr}
${charteAntiHallucination}`;

const maisonsResultA = {};
const maisonsResultB = {};

for (const [hStr, score] of topHousesBinA) {
    const h = parseInt(hStr);
    const isPrinc = typoConfig.principales.includes(h);
    const consigneA = personneA.consigne_redaction || "Tu";
    const pronomB = personneB.pronom_tiers || "Elle";

    let narratifA = "";
    if (consigneA === "Il" || consigneA === "Elle") {
        narratifA = isEN
            ? `Refer to ${persoStrA} in the third person ("${consigneA}") and to ${persoStrB} also in the third person ("${pronomB}").`
            : `Parle de ${persoStrA} à la troisième personne ("${consigneA}") et de ${persoStrB} également ("${pronomB}").`;
    } else {
        narratifA = isEN
            ? `Address ${persoStrA} using "${consigneA}" and refer to ${persoStrB} in the third person ("${pronomB}").`
            : `Adresse-toi à ${persoStrA} en utilisant "${consigneA}" et parle de ${persoStrB} à la troisième personne ("${pronomB}").`;
    }

    const tokenBudgetA = score >= 30
        ? (isEN ? `\n[TOKEN BUDGET: LONG — Score ${score}. Write 30-50 lines of detailed analysis.]\n` : `\n[TOKEN BUDGET : LONG — Score ${score}. Rédige 30 à 50 lignes d'analyse détaillée.]\n`)
        : score >= 15
        ? (isEN ? `\n[TOKEN BUDGET: STANDARD — Score ${score}. Write 20-35 lines.]\n` : `\n[TOKEN BUDGET : STANDARD — Score ${score}. Rédige 20 à 35 lignes.]\n`)
        : (isEN ? `\n[TOKEN BUDGET: SHORT — Score ${score}. Write 10-20 lines.]\n` : `\n[TOKEN BUDGET : COURT — Score ${score}. Rédige 10 à 20 lignes.]\n`);

    let prompt_user = `${langueInstr}## ${isEN ? 'SYNASTRY ANALYSIS' : 'ANALYSE SYNASTRIQUE'} — ${isEN ? 'House' : 'Maison'} ${h} ${isEN ? 'of' : 'de'} ${persoStrA}\n`;
    prompt_user += `### ${isEN ? 'Meaning of House' : 'Signification de la Maison'} ${h} : ${MAISON_LABELS[h]}\n`;
    prompt_user += `### ${formatHouseRulership(h, houseRulersA)}\n`;
    prompt_user += `### ${isEN ? 'Typological context' : 'Contexte typologique'} : ${isEN ? (typoConfig.label_en || typoConfig.label_fr) : typoConfig.label_fr} (${isEN ? (isPrinc ? 'PRIMARY house' : 'secondary house') : (isPrinc ? 'maison PRINCIPALE' : 'maison secondaire')})\n\n`;
    prompt_user += `### ${isEN ? `Planets of ${persoStrB} in House ${h} of ${persoStrA}` : `Planètes de ${persoStrB} dans la Maison ${h} de ${persoStrA}`} :\n`;
    prompt_user += formatOverlay(h, overlayBinA) + "\n\n";

    const aspTxtEnriched = formatAspectsForHouse(h, interAspectsTier1BtoA_enriched, natalHousesA);
    if (aspTxtEnriched) prompt_user += `### Inter-aspects majeurs impliquant cette maison :\n${aspTxtEnriched}\n\n`;

    const aspTxt2 = formatAspectsForHouse(h, interAspectsTier2BtoA, natalHousesA);
    if (aspTxt2) prompt_user += `### Contacts Lots/Astéroïdes pertinents :\n${aspTxt2}\n\n`;

    const minorTxtA = formatAspectsForHouse(h, interMinorBtoA, natalHousesA);
    if (minorTxtA) prompt_user += `### ${isEN ? 'Minor aspects (semi-sextile, semi-square, sesquiquadrate)' : 'Aspects mineurs (semi-sextile, semi-carré, sesquicarré)'} :\n${minorTxtA}\n\n`;

    const cuspAspA = cuspAspectsBtoA.filter(ca => ca.maison_cuspide === h);
    if (cuspAspA.length > 0) {
        prompt_user += `### ${isEN ? 'Planet-to-cusp aspects' : 'Aspects planètes → cuspide'} :\n`;
        prompt_user += cuspAspA.map(ca => `• ${ca.planete} ${ca.aspect} cuspide M${ca.maison_cuspide} (${ca.nature}, orbe ${ca.orbe}°)`).join("\n") + "\n\n";
    }

    const nodalTxt = formatNodalForHouse(h, [...nodalContactsA, ...nodalContactsB], natalHousesA);
    if (nodalTxt) prompt_user += `### Contacts nodaux / karmiques :\n${nodalTxt}\n\n`;

    const houseMidpointsA = allMidpoints.filter(m => {
        const houseStart = getCuspDegree(h, natalHousesA);
        const houseEnd = getCuspDegree(h < 12 ? h + 1 : 1, natalHousesA);
        const mpDeg = m.degre_midpoint;
        if (houseStart < houseEnd) return mpDeg >= houseStart && mpDeg < houseEnd;
        return mpDeg >= houseStart || mpDeg < houseEnd;
    });
    if (houseMidpointsA.length > 0) {
        prompt_user += `### ${isEN ? 'Activated Midpoints (Ebertin) in this house' : 'Midpoints activés (Ebertin) dans cette maison'} :\n`;
        prompt_user += houseMidpointsA.slice(0, 4).map(m => `• ${m.midpoint_of} → ${m.activated_by} (${m.activated_personne}) orbe ${m.orbe}°${m.theme ? ` — ${m.theme}` : ""}`).join("\n") + "\n\n";
    }

    const overlayPlanetsA = (overlayBinA[h] || []).map(o => o.planete || o.planet);
    const houseParansA = enrichedParanB.filter(pr => overlayPlanetsA.some(op => op === pr.planete));
    if (houseParansA.length > 0) {
        prompt_user += `### ${isEN ? 'Fixed Star Parans (Brady) linked to overlay planets' : 'Parans d\'étoiles fixes (Brady) liés aux planètes en overlay'} :\n`;
        prompt_user += houseParansA.slice(0, 3).map(pr => `• ★ ${pr.etoile} (${pr.star_archetype || ""}) ↔ ${pr.planete} — ${pr.interpretation_brady || pr.interpretation}`).join("\n") + "\n\n";
    }

    prompt_user += `### ${isEN ? 'Writing instructions' : 'Consigne de rédaction'} :\n${narratifA}\n`;
    if (roleA || roleB) {
        prompt_user += isEN
            ? `Role reminder: ${roleA ? `${persoStrA} is the ${roleA}` : ''}${roleA && roleB ? ', ' : ''}${roleB ? `${persoStrB} is the ${roleB}` : ''}.\n`
            : `Rappel de rôle : ${roleA ? `${persoStrA} est le/la ${roleA}` : ''}${roleA && roleB ? ', ' : ''}${roleB ? `${persoStrB} est le/la ${roleB}` : ''}.\n`;
    }
    prompt_user += isEN
        ? `Explain the impact of ${persoStrB} on House ${h} of ${persoStrA} in the context of a ${typologie} relationship.\n`
        : `Explique l'impact de ${persoStrB} sur la Maison ${h} de ${persoStrA} dans le contexte de la relation ${typologie}.\n`;
    const normScoreA = houseNormBinA[h] || 0;
    const tsA = houseTSBinA[h] || { tension: 0, support: 0, total: 0, ratio: 0, polarite: "mixte" };
    const _qualifPertA = normScoreA >= 80 ? (isEN ? 'very high' : 'très élevée')
        : normScoreA >= 60 ? (isEN ? 'high' : 'élevée')
        : normScoreA >= 40 ? (isEN ? 'moderate' : 'modérée')
        : normScoreA >= 20 ? (isEN ? 'low' : 'faible')
        : (isEN ? 'very low' : 'très faible');
    prompt_user += isEN
        ? `House activation level (internal calibration — DO NOT cite numerically; the only numeric score visible to the client is the "Harmony" score on the cartouche, ranging 0=blocked / 50=neutral / 100=fluid) : ${_qualifPertA}.\n`
        : `Niveau d'activation de la maison (calibrage interne — NE PAS citer en chiffres ; le seul score chiffré visible côté client est la note d'« Harmonie » du cartouche, où 0=bloquée / 50=neutre / 100=fluide) : ${_qualifPertA}.\n`;
    prompt_user += isEN
        ? `Internal polarity (DO NOT cite T/S numerically) : ${tsA.polarite}.\n`
        : `Polarité interne (NE PAS citer T/S en chiffres) : ${tsA.polarite}.\n`;
    prompt_user += tokenBudgetA;

    maisonsResultA[h] = {
        prompt_system: systemPromptBase,
        prompt_user: prompt_user,
        overlay: overlayBinA[h] || [],
        score: score,
        normalized: normScoreA,
        is_principale: isPrinc
    };
}

for (const [hStr, score] of topHousesAinB) {
    const h = parseInt(hStr);
    const isPrinc = typoConfig.principales.includes(h);
    const consigneB = personneB.consigne_redaction || "Elle";
    const pronomA = personneA.pronom_tiers || "Il";

    let narratifB = "";
    if (consigneB === "Il" || consigneB === "Elle") {
        narratifB = isEN
            ? `Refer to ${persoStrB} in the third person ("${consigneB}") and to ${persoStrA} also in the third person ("${pronomA}").`
            : `Parle de ${persoStrB} à la troisième personne ("${consigneB}") et de ${persoStrA} également ("${pronomA}").`;
    } else {
        narratifB = isEN
            ? `Address ${persoStrB} using "${consigneB}" and refer to ${persoStrA} in the third person ("${pronomA}").`
            : `Adresse-toi à ${persoStrB} en utilisant "${consigneB}" et parle de ${persoStrA} à la troisième personne ("${pronomA}").`;
    }

    const tokenBudgetB = score >= 30
        ? (isEN ? `\n[TOKEN BUDGET: LONG — Score ${score}. Write 30-50 lines.]\n` : `\n[TOKEN BUDGET : LONG — Score ${score}. Rédige 30 à 50 lignes.]\n`)
        : score >= 15
        ? (isEN ? `\n[TOKEN BUDGET: STANDARD — Score ${score}. Write 20-35 lines.]\n` : `\n[TOKEN BUDGET : STANDARD — Score ${score}. Rédige 20 à 35 lignes.]\n`)
        : (isEN ? `\n[TOKEN BUDGET: SHORT — Score ${score}. Write 10-20 lines.]\n` : `\n[TOKEN BUDGET : COURT — Score ${score}. Rédige 10 à 20 lignes.]\n`);

    let prompt_user = `${langueInstr}## ${isEN ? 'SYNASTRY ANALYSIS' : 'ANALYSE SYNASTRIQUE'} — ${isEN ? 'House' : 'Maison'} ${h} ${isEN ? 'of' : 'de'} ${persoStrB}\n`;
    prompt_user += `### ${isEN ? 'Meaning of House' : 'Signification de la Maison'} ${h} : ${MAISON_LABELS[h]}\n`;
    prompt_user += `### ${formatHouseRulership(h, houseRulersB)}\n`;
    prompt_user += `### ${isEN ? 'Typological context' : 'Contexte typologique'} : ${isEN ? (typoConfig.label_en || typoConfig.label_fr) : typoConfig.label_fr} (${isEN ? (isPrinc ? 'PRIMARY house' : 'secondary house') : (isPrinc ? 'maison PRINCIPALE' : 'maison secondaire')})\n\n`;
    prompt_user += `### ${isEN ? `Planets of ${persoStrA} in House ${h} of ${persoStrB}` : `Planètes de ${persoStrA} dans la Maison ${h} de ${persoStrB}`} :\n`;
    prompt_user += formatOverlay(h, overlayAinB) + "\n\n";

    const aspTxtB = formatAspectsForHouse(h, interAspectsTier1AtoB_enriched, natalHousesB);
    if (aspTxtB) prompt_user += `### ${isEN ? 'Major inter-aspects involving this house' : 'Inter-aspects majeurs impliquant cette maison'} :\n${aspTxtB}\n\n`;

    const aspTxt2B = formatAspectsForHouse(h, interAspectsTier2AtoB, natalHousesB);
    if (aspTxt2B) prompt_user += `### ${isEN ? 'Relevant Lots/Asteroids contacts' : 'Contacts Lots/Astéroïdes pertinents'} :\n${aspTxt2B}\n\n`;

    const minorTxtB = formatAspectsForHouse(h, interMinorAtoB, natalHousesB);
    if (minorTxtB) prompt_user += `### ${isEN ? 'Minor aspects (semi-sextile, semi-square, sesquiquadrate)' : 'Aspects mineurs (semi-sextile, semi-carré, sesquicarré)'} :\n${minorTxtB}\n\n`;

    const cuspAspB = cuspAspectsAtoB.filter(ca => ca.maison_cuspide === h);
    if (cuspAspB.length > 0) {
        prompt_user += `### ${isEN ? 'Planet-to-cusp aspects' : 'Aspects planètes → cuspide'} :\n`;
        prompt_user += cuspAspB.map(ca => `• ${ca.planete} ${ca.aspect} cuspide M${ca.maison_cuspide} (${ca.nature}, orbe ${ca.orbe}°)`).join("\n") + "\n\n";
    }

    const nodalTxt = formatNodalForHouse(h, [...nodalContactsA, ...nodalContactsB], natalHousesB);
    if (nodalTxt) prompt_user += `### ${isEN ? 'Nodal / karmic contacts' : 'Contacts nodaux / karmiques'} :\n${nodalTxt}\n\n`;

    const houseMidpointsB = allMidpoints.filter(m => {
        const houseStart = getCuspDegree(h, natalHousesB);
        const houseEnd = getCuspDegree(h < 12 ? h + 1 : 1, natalHousesB);
        const mpDeg = m.degre_midpoint;
        if (houseStart < houseEnd) return mpDeg >= houseStart && mpDeg < houseEnd;
        return mpDeg >= houseStart || mpDeg < houseEnd;
    });
    if (houseMidpointsB.length > 0) {
        prompt_user += `### ${isEN ? 'Activated Midpoints (Ebertin) in this house' : 'Midpoints activés (Ebertin) dans cette maison'} :\n`;
        prompt_user += houseMidpointsB.slice(0, 4).map(m => `• ${m.midpoint_of} → ${m.activated_by} (${m.activated_personne}) orbe ${m.orbe}°${m.theme ? ` — ${m.theme}` : ""}`).join("\n") + "\n\n";
    }

    const overlayPlanetsB = (overlayAinB[h] || []).map(o => o.planete || o.planet);
    const houseParansB = enrichedParanA.filter(pr => overlayPlanetsB.some(op => op === pr.planete));
    if (houseParansB.length > 0) {
        prompt_user += `### ${isEN ? 'Fixed Star Parans (Brady) linked to overlay planets' : 'Parans d\'étoiles fixes (Brady) liés aux planètes en overlay'} :\n`;
        prompt_user += houseParansB.slice(0, 3).map(pr => `• ★ ${pr.etoile} (${pr.star_archetype || ""}) ↔ ${pr.planete} — ${pr.interpretation_brady || pr.interpretation}`).join("\n") + "\n\n";
    }

    prompt_user += `### ${isEN ? 'Writing instructions' : 'Consigne de rédaction'} :\n${narratifB}\n`;
    if (roleA || roleB) {
        prompt_user += isEN
            ? `Role reminder: ${roleA ? `${persoStrA} is the ${roleA}` : ''}${roleA && roleB ? ', ' : ''}${roleB ? `${persoStrB} is the ${roleB}` : ''}.\n`
            : `Rappel de rôle : ${roleA ? `${persoStrA} est le/la ${roleA}` : ''}${roleA && roleB ? ', ' : ''}${roleB ? `${persoStrB} est le/la ${roleB}` : ''}.\n`;
    }
    prompt_user += isEN
        ? `Explain the impact of ${persoStrA} on House ${h} of ${persoStrB} in the context of a ${typologie} relationship.\n`
        : `Explique l'impact de ${persoStrA} sur la Maison ${h} de ${persoStrB} dans le contexte de la relation ${typologie}.\n`;
    const normScoreB = houseNormAinB[h] || 0;
    const tsB = houseTSAinB[h] || { tension: 0, support: 0, total: 0, ratio: 0, polarite: "mixte" };
    const _qualifPertB = normScoreB >= 80 ? (isEN ? 'very high' : 'très élevée')
        : normScoreB >= 60 ? (isEN ? 'high' : 'élevée')
        : normScoreB >= 40 ? (isEN ? 'moderate' : 'modérée')
        : normScoreB >= 20 ? (isEN ? 'low' : 'faible')
        : (isEN ? 'very low' : 'très faible');
    prompt_user += isEN
        ? `House activation level (internal calibration — DO NOT cite numerically; the only numeric score visible to the client is the "Harmony" score on the cartouche, ranging 0=blocked / 50=neutral / 100=fluid) : ${_qualifPertB}.\n`
        : `Niveau d'activation de la maison (calibrage interne — NE PAS citer en chiffres ; le seul score chiffré visible côté client est la note d'« Harmonie » du cartouche, où 0=bloquée / 50=neutre / 100=fluide) : ${_qualifPertB}.\n`;
    prompt_user += isEN
        ? `Internal polarity (DO NOT cite T/S numerically) : ${tsB.polarite}.\n`
        : `Polarité interne (NE PAS citer T/S en chiffres) : ${tsB.polarite}.\n`;
    prompt_user += tokenBudgetB;

    maisonsResultB[h] = {
        prompt_system: systemPromptBase,
        prompt_user: prompt_user,
        overlay: overlayAinB[h] || [],
        score: score,
        normalized: normScoreB,
        is_principale: isPrinc
    };
}

// ---- 11. PROMPT SYNTHÈSE ----
function formatElements(el) {
    if (!el || typeof el !== "object") return "non calculé";
    return Object.entries(el).map(([k, v]) => `${k}: ${v}`).join(", ");
}
function formatModes(mo) {
    if (!mo || typeof mo !== "object") return "";
    return Object.entries(mo).map(([k, v]) => `${k}: ${v}`).join(", ");
}

function formatAspectRich(a, nameFrom, nameTo) {
    let s = `• ${a.planete_source}`;
    if (a.dignite_source) s += ` [${a.dignite_source}]`;
    if (a.retro_source) s += " (R)";
    s += ` (${nameFrom}) ${a.symbol} ${a.planete_cible}`;
    if (a.dignite_cible) s += ` [${a.dignite_cible}]`;
    if (a.retro_cible) s += " (R)";
    s += ` (${nameTo}) — ${a.aspect} orbe ${a.orbe}° — score ${a.score}`;
    if (a.exact) s += " ⚡";
    if (a.applying === true) s += " →APPLIQUANT";
    else if (a.applying === false) s += " ←SÉPARANT";
    return s;
}

// ╔═══════════════════════════════════════════════════════════════════════╗
// ║  v7.0.0-β — LEXIQUE NARRATIF TYPOLOGIQUE (Q54 priorité D)            ║
// ║                                                                        ║
// ║  Pour les paires planétaires majeures, le moteur impose au LLM une    ║
// ║  formulation typologique stricte. Le LLM peut broder autour, mais     ║
// ║  doit reprendre la formulation comme ancrage du registre.             ║
// ║                                                                        ║
// ║  v7.0.0-β.1 : helpers consolidés en function declarations (hoistées)  ║
// ║  pour pouvoir enrichir AUSSI les 12 prompts maisons en plus de la     ║
// ║  synthèse, sans dissonance de registre entre les sections.            ║
// ║                                                                        ║
// ║  Structure : LEXICON["Planet1-Planet2-nature"][typo]                  ║
// ║  Convention : paires triées alphabétiquement ; nature ∈ {harm,hard}.  ║
// ╚═══════════════════════════════════════════════════════════════════════╝
function _aspectNature(aspectName, planSource, planCible) {
    const HARM = (aspectName === "Trigone" || aspectName === "Sextile");
    const HARD = (aspectName === "Carré" || aspectName === "Opposition");
    if (HARM) return "harm";
    if (HARD) return "hard";
    if (aspectName === "Conjonction") {
        const malefics = new Set(["Mars", "Saturne", "Pluton"]);
        const benefics = new Set(["Vénus", "Jupiter", "Lune", "Soleil", "Mercure"]);
        const bothMalefic = malefics.has(planSource) && malefics.has(planCible);
        const oneMaleficOneBenefic = (malefics.has(planSource) && benefics.has(planCible))
                                  || (benefics.has(planSource) && malefics.has(planCible));
        return (bothMalefic || oneMaleficOneBenefic) ? "hard" : "harm";
    }
    return null;
}

function _normalizePlanetPair(p1, p2) {
    const ALIAS = { "Milieu du Ciel": "MC", "Nœud Nord": "NN", "Nœud Sud": "NS" };
    const a = ALIAS[p1] || p1;
    const b = ALIAS[p2] || p2;
    return [a, b].sort().join("-");
}

// v7.0.0-β.1 — function declaration mémoisée via cache de fonction.
// Hoisted, donc appelable depuis les prompts maisons (boucle ligne ~7721)
// ET depuis le synthPrompt — cohérence narrative garantie.
function _typoLexiconFor(planSource, planCible, aspectName, typo) {
    if (!_typoLexiconFor._cache) _typoLexiconFor._cache = _buildTypoNarrativeLexicon();
    const LEX = _typoLexiconFor._cache;
    const nature = _aspectNature(aspectName, planSource, planCible);
    if (!nature) return null;
    const key = _normalizePlanetPair(planSource, planCible) + "-" + nature;
    const entry = LEX[key];
    if (!entry) return null;
    return entry[typo] || null;
}

function _buildTypoNarrativeLexicon() {
    return {
    "Lune-Soleil-harm": {
        "Amour":            "couple-archétype : identité solaire de l'un et besoin lunaire de l'autre s'ajustent comme un cliché photographique",
        "Business":         "complémentarité dirigeant/opérateur : le Soleil pose le cap, la Lune capte le climat de l'équipe",
        "Mentorat":         "identification mentor/disciple : le Soleil rayonne un modèle, la Lune l'absorbe en profondeur",
        "Ami":              "reconnaissance mutuelle ensoleillée : on se sent vu et nourri par l'autre",
        "Fratrie":          "frère/sœur-miroir : l'un brille, l'autre nuance, sans concurrence narcissique",
        "Parent / Enfant":  "lien parent/enfant idéal : l'autorité solaire enveloppée par la chaleur lunaire",
        "Colocataire":      "bonne énergie domestique : le rythme de l'un porte le confort de l'autre",
        "Rivalité":         "respect du compétiteur : on reconnaît la lumière propre de l'adversaire"
    },
    "Lune-Soleil-hard": {
        "Amour":            "tension identité/affect : le besoin de briller heurte le besoin d'être consolé",
        "Business":         "leader vs gestionnaire : choc entre vision stratégique et pragmatisme opérationnel",
        "Mentorat":         "le maître éclipse l'élève (ou inversement) : l'identité de l'un absorbe l'émotion de l'autre",
        "Ami":              "frottement d'humeurs : l'optimisme solaire se cogne à la fragilité lunaire",
        "Fratrie":          "rivalité enfantine ravivée : qui est le préféré ?",
        "Parent / Enfant":  "autorité parentale qui blesse l'émotion de l'enfant (ou enfant qui défie l'identité du parent)",
        "Colocataire":      "rythmes incompatibles : couche-tôt vs couche-tard, rangé vs nourricier",
        "Rivalité":         "duel d'éclat : chacun veut être la lumière dominante du tableau"
    },
    "Soleil-Vénus-harm": {
        "Amour":            "attraction solaire douce, esthétique partagée, plaisir d'être ensemble",
        "Business":         "élégance de la collaboration : on travaille avec goût et bienveillance",
        "Mentorat":         "transmission gracieuse, l'enseignement est aimable",
        "Ami":              "amitié chaleureuse, l'autre nourrit ton estime",
        "Fratrie":          "tendresse fraternelle stable",
        "Parent / Enfant":  "affection structurante, le parent valorise l'enfant",
        "Colocataire":      "convivialité quotidienne, partage du beau",
        "Rivalité":         "adversaire estimé, on s'admire malgré l'opposition"
    },
    "Soleil-Vénus-hard": {
        "Amour":            "attirance qui irrite l'ego, vanité froissée, bouderies",
        "Business":         "désaccord sur les valeurs ou l'image de la marque",
        "Mentorat":         "favoritisme/jalousie autour de la séduction du mentor",
        "Ami":              "petite jalousie esthétique ou sentimentale",
        "Fratrie":          "comparaison de la beauté ou du charme",
        "Parent / Enfant":  "blessure narcissique : enfant pas assez valorisé ou trop comparé",
        "Colocataire":      "désaccord déco, frictions sur le confort partagé",
        "Rivalité":         "ego de l'un froissé par le charme de l'autre"
    },
    "Mars-Soleil-harm": {
        "Amour":            "complicité dynamique, l'autre booste ton vouloir",
        "Business":         "moteur d'action efficace, l'un commande, l'autre exécute avec brio",
        "Mentorat":         "mentor qui galvanise, élève qui se met en mouvement",
        "Ami":              "complicité d'aventure, on se challenge sainement",
        "Fratrie":          "stimulation fraternelle, défis communs",
        "Parent / Enfant":  "parent qui propulse l'enfant, élan d'autonomie sain",
        "Colocataire":      "co-organisation efficace, on se met en mouvement ensemble",
        "Rivalité":         "rivalité énergisante, chacun se dépasse"
    },
    "Mars-Soleil-hard": {
        "Amour":            "conflit d'ego et de désir, qui décide ?",
        "Business":         "conflit de leadership, choc des volontés stratégiques",
        "Mentorat":         "le maître se mesure à l'élève, défi d'autorité",
        "Ami":              "émulation virile qui peut basculer en bras de fer",
        "Fratrie":          "rivalité fraternelle classique, lutte de territoire",
        "Parent / Enfant":  "conflit générationnel, lutte d'autonomie",
        "Colocataire":      "frictions de leadership domestique",
        "Rivalité":         "moteur de l'affrontement, bras de fer structurant"
    },
    "Saturne-Soleil-harm": {
        "Amour":            "engagement mature, l'autre te structure sans t'écraser",
        "Business":         "pacte sérieux, gouvernance partagée fiable",
        "Mentorat":         "transmission rigoureuse, autorité légitime",
        "Ami":              "amitié-pierre, on se respecte dans la durée",
        "Fratrie":          "loyauté fraternelle structurante",
        "Parent / Enfant":  "autorité juste, le parent pose un cadre soutenant",
        "Colocataire":      "contrat tacite tenu, fiabilité quotidienne",
        "Rivalité":         "respect institutionnel de l'adversaire"
    },
    "Saturne-Soleil-hard": {
        "Amour":            "rigidité, peur de l'engagement, l'autre te bride ou t'éteint",
        "Business":         "blocage hiérarchique, cadre qui étouffe l'initiative",
        "Mentorat":         "maître autoritaire qui écrase, ou élève qui défie le cadre",
        "Ami":              "amitié grise, l'autre ramène à la dure réalité",
        "Fratrie":          "aîné rigide, cadet qui suffoque (ou inverse)",
        "Parent / Enfant":  "parent castrateur, autorité qui éteint l'enfant",
        "Colocataire":      "contrôle excessif du quotidien, ambiance pesante",
        "Rivalité":         "blocage frontal, mur infranchissable"
    },
    "Pluton-Soleil-harm": {
        "Amour":            "transformation profonde, l'autre te révèle à toi-même",
        "Business":         "alliance de pouvoir constructive, on co-bâtit en profondeur",
        "Mentorat":         "transformation initiatique, le mentor révèle des potentiels enfouis",
        "Ami":              "amitié transformatrice, on évolue ensemble",
        "Fratrie":          "relation qui sculpte l'identité fraternelle",
        "Parent / Enfant":  "transmission de pouvoir, héritage psychique",
        "Colocataire":      "cohabitation qui change la donne, partage d'une crise traversée",
        "Rivalité":         "adversaire qui te transforme par la friction"
    },
    "Pluton-Soleil-hard": {
        "Amour":            "emprise plutonienne, jeu de pouvoir, mort-renaissance du couple",
        "Business":         "lutte de pouvoir, prise d'otage stratégique",
        "Mentorat":         "emprise psychologique, capture identitaire (guru complex)",
        "Ami":              "amitié toxique qui dévore l'identité",
        "Fratrie":          "rivalité fratricide, écrasement par l'aîné",
        "Parent / Enfant":  "domination parentale qui annihile l'enfant",
        "Colocataire":      "cohabitation toxique, contrôle pathologique",
        "Rivalité":         "combat à mort, anéantissement réciproque visé"
    },
    "Lune-Vénus-harm": {
        "Amour":            "tendresse mutuelle, douceur quotidienne, foyer doux",
        "Business":         "ambiance de travail bienveillante, climat émotionnel positif",
        "Mentorat":         "transmission affective, mentor maternant",
        "Ami":              "amitié-cocon, on se nourrit affectivement",
        "Fratrie":          "chaleur du foyer, douceur de l'enfance partagée",
        "Parent / Enfant":  "affection nourricière, attachement sécure",
        "Colocataire":      "vivre-ensemble doux, attentions réciproques",
        "Rivalité":         "adversaires polis, civilité affective dans la friction"
    },
    "Lune-Vénus-hard": {
        "Amour":            "frustration tendresse vs séduction, dissonance sentimentale",
        "Business":         "ambiance émotionnellement contre-productive",
        "Mentorat":         "déception affective, mentor qui ne comble pas le besoin",
        "Ami":              "amitié qui décèvre émotionnellement",
        "Fratrie":          "jalousie affective, comparaison maternelle",
        "Parent / Enfant":  "lien affectif maladroit, attentes mal ajustées",
        "Colocataire":      "petites blessures émotionnelles répétées",
        "Rivalité":         "rivalité teintée de blessure affective ancienne"
    },
    "Lune-Mars-harm": {
        "Amour":            "désir spontané, passion organique, complicité physique-émotionnelle",
        "Business":         "drive émotionnel fluide, énergie d'équipe",
        "Mentorat":         "stimulation émotionnelle féconde, élève propulsé",
        "Ami":              "complicité d'humeur dynamique",
        "Fratrie":          "vivacité fraternelle, sens de la défense mutuelle",
        "Parent / Enfant":  "élan protecteur, défense parentale réactive",
        "Colocataire":      "réactivité saine au quotidien, on s'organise vite",
        "Rivalité":         "rivalité émotionnellement engagée, sans haine"
    },
    "Lune-Mars-hard": {
        "Amour":            "conflits émotionnels passionnels, susceptibilité à fleur de peau",
        "Business":         "explosivité d'humeur, climat d'équipe instable",
        "Mentorat":         "mentor brutal émotionnellement, ou élève hyper-réactif",
        "Ami":              "amitié-disputes, on se brouille puis se réconcilie",
        "Fratrie":          "bagarres fraternelles archétypales, jalousie de berceau",
        "Parent / Enfant":  "colères parent/enfant fréquentes, blessure réactive",
        "Colocataire":      "irritation domestique récurrente, quiproquos émotionnels",
        "Rivalité":         "rivalité émotionnellement chargée, susceptibilité réciproque"
    },
    "Lune-Saturne-harm": {
        "Amour":            "engagement émotionnel fiable, sécurité affective dans la durée",
        "Business":         "loyauté émotionnelle au pacte, équipe soudée",
        "Mentorat":         "mentor structurant émotionnellement, parent de substitution sain",
        "Ami":              "amitié-béton, l'autre est là émotionnellement quand il le faut",
        "Fratrie":          "loyauté de sang affective, on est responsable de l'autre",
        "Parent / Enfant":  "parent fiable émotionnellement, base sécure",
        "Colocataire":      "fiabilité émotionnelle dans la cohabitation",
        "Rivalité":         "respect mutuel de longue date, rivalité institutionnelle"
    },
    "Lune-Saturne-hard": {
        "Amour":            "froideur émotionnelle, peur d'aimer, distance dans l'attachement",
        "Business":         "climat émotionnel froid, équipe qui craint le management",
        "Mentorat":         "mentor distant ou écrasant émotionnellement",
        "Ami":              "amitié glaciale, peu de chaleur affective",
        "Fratrie":          "fratrie distante, lien obligé sans tendresse",
        "Parent / Enfant":  "parent froid, enfant qui doit mériter l'amour",
        "Colocataire":      "distance émotionnelle dans le foyer, vie côte à côte",
        "Rivalité":         "rivalité froide, mépris glacial"
    },
    "Mars-Vénus-harm": {
        "Amour":            "attraction sexuelle harmonieuse, désir fluide",
        "Business":         "drive créatif fécond, élan productif ensemble",
        "Mentorat":         "transmission stimulante, esthétique du geste enseigné",
        "Ami":              "complicité créative, on entreprend ensemble",
        "Fratrie":          "complicité dynamique, projets fraternels",
        "Parent / Enfant":  "élan parent-enfant créatif, encouragement à l'action",
        "Colocataire":      "convivialité dynamique, ambiance vivante",
        "Rivalité":         "rivalité élégante, fair-play dans la friction"
    },
    "Mars-Vénus-hard": {
        "Amour":            "attraction-répulsion, désir conflictuel, jeu sexuel ambivalent",
        "Business":         "conflit créatif tendu, désaccord sur la valeur produite",
        "Mentorat":         "mentor ambivalent dans son désir de transmettre, élève qui résiste",
        "Ami":              "tension latente sexuelle ou créative non résolue",
        "Fratrie":          "rivalité de séduction ou de talent",
        "Parent / Enfant":  "tension désir d'autonomie / désir de rapprochement",
        "Colocataire":      "tension latente sous-jacente à la cohabitation (alerte Vénus-Mars hors Amour)",
        "Rivalité":         "rivalité ambiguë où séduction et combat s'entremêlent"
    },
    "Saturne-Vénus-harm": {
        "Amour":            "engagement amoureux mature, pacte de durée affective",
        "Business":         "alliance solide sur les valeurs, gouvernance esthétique fiable",
        "Mentorat":         "transmission durable du goût, du sens, des valeurs",
        "Ami":              "amitié durable, sentiments stables",
        "Fratrie":          "loyauté affective dans le temps long",
        "Parent / Enfant":  "transmission de valeurs structurantes, affection cadrée",
        "Colocataire":      "engagement long sur les règles de vie commune",
        "Rivalité":         "respect mutuel de l'engagement de l'adversaire"
    },
    "Saturne-Vénus-hard": {
        "Amour":            "blocage affectif, peur d'aimer, sentiment de manque ou d'indignité",
        "Business":         "blocage sur les valeurs, désaccord financier ou éthique",
        "Mentorat":         "mentor avare de reconnaissance, élève en manque de validation",
        "Ami":              "amitié pesante, sensation d'obligation plus que de plaisir",
        "Fratrie":          "froideur affective entre frères/sœurs",
        "Parent / Enfant":  "parent peu démonstratif, enfant qui se sent mal-aimé",
        "Colocataire":      "rapport financier ou esthétique contraint",
        "Rivalité":         "rivalité longue où chacun se prive du plaisir de la victoire"
    },
    "Mars-Mars-harm": {
        "Amour":            "désir aligné, passion synchrone, sexualité énergique",
        "Business":         "drive aligné, énergie d'équipe galvanisante",
        "Mentorat":         "mentor et élève partagent le même feu",
        "Ami":              "complicité d'aventure, projets sportifs ou créatifs",
        "Fratrie":          "fratrie dynamique, défis communs",
        "Parent / Enfant":  "élan partagé, parent qui sait propulser l'enfant",
        "Colocataire":      "co-organisation efficace, on agit dans le même tempo",
        "Rivalité":         "compétition saine, émulation virile, vraie rivalité créatrice"
    },
    "Mars-Mars-hard": {
        "Amour":            "passion destructrice ou tension sexuelle non résolue",
        "Business":         "conflit de leadership, lutte pour le pilotage opérationnel",
        "Mentorat":         "le maître se mesure à l'élève, défi de transmission",
        "Ami":              "émulation virile qui peut basculer en bras de fer",
        "Fratrie":          "bagarre fraternelle archétypale, jalousie de berceau",
        "Parent / Enfant":  "conflit générationnel, lutte d'autonomie",
        "Colocataire":      "friction quotidienne, vaisselle et territoire",
        "Rivalité":         "moteur de l'affrontement, bras de fer structurant"
    },
    "Mars-Saturne-harm": {
        "Amour":            "désir maîtrisé, action conjointe construite dans la durée",
        "Business":         "exécution rigoureuse, action structurée et tenue",
        "Mentorat":         "mentor qui canalise l'énergie de l'élève vers la réalisation",
        "Ami":              "amitié de chantier, on construit ensemble dans la durée",
        "Fratrie":          "fratrie qui accomplit des projets ensemble",
        "Parent / Enfant":  "parent qui structure l'élan de l'enfant",
        "Colocataire":      "tâches ménagères réparties et tenues",
        "Rivalité":         "rivalité construite, longue, où chacun affûte l'autre"
    },
    "Mars-Saturne-hard": {
        "Amour":            "désir bloqué, frustration sexuelle, élan castré",
        "Business":         "exécution paralysée, action freinée par la hiérarchie",
        "Mentorat":         "mentor qui castre l'élève, ou élève frustré par les contraintes",
        "Ami":              "amitié frustrante, on n'arrive pas à entreprendre ensemble",
        "Fratrie":          "frustration fraternelle, blocage de l'élan",
        "Parent / Enfant":  "parent qui brise l'élan, enfant inhibé dans son action",
        "Colocataire":      "tensions quotidiennes sur l'organisation, blocages logistiques",
        "Rivalité":         "rivalité bloquée, mur structurel infranchissable"
    },
    "Mars-Pluton-harm": {
        "Amour":            "passion intense, sexualité transformatrice, désir total",
        "Business":         "force de frappe stratégique, capacité à déplacer des montagnes",
        "Mentorat":         "transformation de l'élève par l'exigence radicale du mentor",
        "Ami":              "amitié intense, on se challenge en profondeur",
        "Fratrie":          "fratrie qui transforme, alchimie fraternelle puissante",
        "Parent / Enfant":  "transmission d'un pouvoir, initiation à l'action décisive",
        "Colocataire":      "cohabitation intense, partage de combats existentiels",
        "Rivalité":         "rivalité transformatrice, l'adversaire t'oblige à muter"
    },
    "Mars-Pluton-hard": {
        "Amour":            "jeu de pouvoir sexuel, domination/soumission, violence latente",
        "Business":         "lutte de pouvoir féroce, prise d'otage stratégique",
        "Mentorat":         "emprise par l'autorité, capture par l'exigence",
        "Ami":              "dispute violente, amitié-combat",
        "Fratrie":          "rivalité fratricide, violence symbolique entre frères/sœurs",
        "Parent / Enfant":  "domination parentale, écrasement par la force",
        "Colocataire":      "cohabitation toxique, violence latente du quotidien",
        "Rivalité":         "combat à mort, anéantissement réciproque visé"
    },
    "Mercure-Mercure-harm": {
        "Amour":            "conversation amoureuse, on se comprend à demi-mot",
        "Business":         "entente intellectuelle au travail, communication fluide",
        "Mentorat":         "pédagogie efficace, l'élève capte vite le mentor",
        "Ami":              "conversation infinie, complicité intellectuelle",
        "Fratrie":          "langage partagé, codes fraternels qui marchent",
        "Parent / Enfant":  "transmission éducative, dialogue parent-enfant fluide",
        "Colocataire":      "vivre-ensemble fluide, communication quotidienne sans accroc",
        "Rivalité":         "joute oratoire intelligente, débat structurant"
    },
    "Mercure-Mercure-hard": {
        "Amour":            "incompréhensions verbales, dialogues de sourds amoureux",
        "Business":         "désaccords stratégiques permanents, malentendus opérationnels",
        "Mentorat":         "mentor et élève parlent des langues différentes",
        "Ami":              "amitié où l'on se comprend mal, malentendus récurrents",
        "Fratrie":          "fratrie qui ne se parle plus, langues étrangères",
        "Parent / Enfant":  "dialogue parent-enfant rompu, transmission ratée",
        "Colocataire":      "communication grippée, conflits de logistique verbaux",
        "Rivalité":         "guerre des mots, contradiction systématique, mur intellectuel"
    },
    "Mercure-Saturne-harm": {
        "Amour":            "communication sérieuse et constructive, paroles tenues",
        "Business":         "rigueur intellectuelle, raisonnements solides",
        "Mentorat":         "transmission rigoureuse de la pensée, structure pédagogique",
        "Ami":              "amitié intellectuelle de fond, conversations exigeantes",
        "Fratrie":          "fratrie qui partage une rigueur de pensée",
        "Parent / Enfant":  "pédagogie ferme et structurante",
        "Colocataire":      "communication directe et organisée",
        "Rivalité":         "rivalité intellectuelle de fond, adversaires qui structurent leur pensée mutuellement"
    },
    "Mercure-Saturne-hard": {
        "Amour":            "pensées qui se heurtent, mots qui blessent, jugement permanent",
        "Business":         "désaccord stratégique structurel, blocage de la communication",
        "Mentorat":         "mentor qui dévalorise la pensée de l'élève (ou inverse)",
        "Ami":              "amitié critique, conversations qui pèsent",
        "Fratrie":          "fratrie où l'un juge l'intelligence de l'autre",
        "Parent / Enfant":  "pédagogie écrasante, enfant qui se sent stupide face au parent",
        "Colocataire":      "communication grippée par la critique permanente",
        "Rivalité":         "contradiction systématique, mur intellectuel"
    },
    "Saturne-Saturne-harm": {
        "Amour":            "engagement sérieux, pacte de durée",
        "Business":         "pacte de durée, gouvernance partagée fiable",
        "Mentorat":         "transmission rigoureuse, passation responsable",
        "Ami":              "amitié-pierre, fidélité longue",
        "Fratrie":          "loyauté de sang, solidarité familiale durable",
        "Parent / Enfant":  "autorité juste, structure stable",
        "Colocataire":      "partage des charges, contrat tacite tenu",
        "Rivalité":         "respect de l'adversaire, longévité de la rivalité"
    },
    "Saturne-Saturne-hard": {
        "Amour":            "rigidités qui s'opposent, peur de l'engagement réciproque",
        "Business":         "blocage de gouvernance, conflit des règles",
        "Mentorat":         "rigidités hiérarchiques opposées",
        "Ami":              "amitié où chacun a peur de l'engagement de l'autre",
        "Fratrie":          "rigidité familiale, devoirs qui pèsent",
        "Parent / Enfant":  "rigidités générationnelles, blocages d'autorité",
        "Colocataire":      "règles incompatibles, contrats tacites brisés",
        "Rivalité":         "adversaires qui se sclérosent dans leur opposition"
    },
    "Jupiter-Saturne-harm": {
        "Amour":            "expansion encadrée, croissance du couple dans la sagesse",
        "Business":         "alliance Jupiter/Saturne archétypale : vision + structure, croissance maîtrisée",
        "Mentorat":         "mentor sage qui ouvre des horizons en posant un cadre solide",
        "Ami":              "amitié qui élargit la vision tout en gardant la maturité",
        "Fratrie":          "fratrie qui combine ambition et responsabilité",
        "Parent / Enfant":  "parent qui ouvre l'enfant au monde tout en l'encadrant",
        "Colocataire":      "cohabitation qui combine confort et sérieux",
        "Rivalité":         "rivalité d'envergure, adversaires de stature historique"
    },
    "Jupiter-Saturne-hard": {
        "Amour":            "expansion vs contraction, l'un veut grandir, l'autre veut consolider",
        "Business":         "tension croissance/prudence, conflit visionnaire vs gestionnaire",
        "Mentorat":         "mentor visionnaire ↔ élève prudent (ou inverse), choc de tempo",
        "Ami":              "tension entre l'aventureux et le sage",
        "Fratrie":          "frère/sœur expansif vs frère/sœur conservateur",
        "Parent / Enfant":  "parent qui freine ou enfant qui freine la vision parentale",
        "Colocataire":      "tension entre dépense et économie, tempo de vie incompatibles",
        "Rivalité":         "rivalité visionnaire vs rivalité conservatrice"
    },
    // ── v7.0.0-β.1 — Extension lexique sur 7 paires hautement fréquentes ──
    "Lune-Pluton-harm": {
        "Amour":            "intensité émotionnelle transformatrice, ressenti profond et cathartique",
        "Business":         "alliance émotionnelle puissante, capacité à porter des crises ensemble",
        "Mentorat":         "transformation émotionnelle de l'élève par le mentor (initiation)",
        "Ami":              "amitié-transformation, complicité créative profonde et durable",
        "Fratrie":          "lien fraternel transformateur, complicité émotionnelle radicale",
        "Parent / Enfant":  "transmission émotionnelle profonde, héritage psychique chargé",
        "Colocataire":      "cohabitation qui sculpte les émotions, épreuves traversées ensemble",
        "Rivalité":         "adversaire qui te sonde émotionnellement, rivalité qui mute"
    },
    "Lune-Pluton-hard": {
        "Amour":            "emprise affective, jeu de pouvoir émotionnel, jalousie possessive",
        "Business":         "intensité partagée jusqu'à l'obsession, alliance émotionnelle qui ne lâche pas sous pression",
        "Mentorat":         "ascendant émotionnel viscéral du mentor — peut basculer en emprise si le cadre saute",
        "Ami":              "passion créative dévorante, complicité instinctive inséparable",
        "Fratrie":          "lien fraternel viscéral, intensité émotionnelle qui obsède",
        "Parent / Enfant":  "ascendant émotionnel viscéral, attachement dévorant (vigilance parent dévorant)",
        "Colocataire":      "intensité émotionnelle viscérale au quotidien, fusion absorbante",
        "Rivalité":         "intensité viscérale de la rivalité, blessure narcissique réveillée par l'autre"
    },
    "Ascendant-Lune-harm": {
        "Amour":            "ressenti immédiat de proximité, l'autre te met à l'aise dans ton corps",
        "Business":         "climat émotionnel d'équipe favorable dès la première rencontre",
        "Mentorat":         "mentor qui te met à l'aise dès le premier contact",
        "Ami":              "amitié naturelle, on se sent chez soi avec l'autre tout de suite",
        "Fratrie":          "complicité instinctive, on se comprend sans parler",
        "Parent / Enfant":  "lien affectif spontané, l'enfant se sent en sécurité",
        "Colocataire":      "atmosphère naturellement détendue dans le foyer",
        "Rivalité":         "respect intuitif de l'adversaire, on sent sa carrure"
    },
    "Ascendant-Lune-hard": {
        "Amour":            "malaise corporel ou émotionnel, l'autre déclenche un inconfort viscéral",
        "Business":         "ambiance d'équipe instable, chacun met l'autre mal à l'aise",
        "Mentorat":         "blocage émotionnel face au mentor, élève qui se sent jugé",
        "Ami":              "amitié à éclipses, on se met mutuellement mal à l'aise par moments",
        "Fratrie":          "petit malaise fraternel récurrent, susceptibilités croisées",
        "Parent / Enfant":  "lien affectif maladroit, attentes mal ajustées au quotidien",
        "Colocataire":      "frictions d'humeur dans le foyer, on se marche sur les pieds",
        "Rivalité":         "agacement viscéral, l'autre t'irrite par sa présence même"
    },
    "Ascendant-Soleil-harm": {
        "Amour":            "identité valorisée par l'autre, on se sent vu et reconnu",
        "Business":         "le partenaire valorise ton identité professionnelle",
        "Mentorat":         "mentor qui révèle l'identité profonde de l'élève",
        "Ami":              "amitié qui te confirme dans ce que tu es",
        "Fratrie":          "fratrie qui valorise l'identité de chacun",
        "Parent / Enfant":  "parent qui voit et nomme l'enfant pour ce qu'il est",
        "Colocataire":      "vivre-ensemble respectueux de l'identité de chacun",
        "Rivalité":         "adversaire qui te reconnaît comme égal"
    },
    "Ascendant-Soleil-hard": {
        "Amour":            "identité froissée, l'autre éclipse ou contredit ce que tu es",
        "Business":         "désaccord sur l'image et le positionnement",
        "Mentorat":         "mentor qui écrase l'identité de l'élève (ou inverse)",
        "Ami":              "amitié où l'on se sent peu vu ou mal compris",
        "Fratrie":          "rivalité d'identité, ombre projetée sur l'autre",
        "Parent / Enfant":  "parent qui ne voit pas l'enfant tel qu'il est, blessure identitaire",
        "Colocataire":      "frottement d'identités, présences qui se gênent",
        "Rivalité":         "adversaire qui menace ton identité même"
    },
    "Lune-Uranus-harm": {
        "Amour":            "émotion électrique, attirance soudaine, fraîcheur affective",
        "Business":         "drive émotionnel innovant, équipe stimulée par le changement",
        "Mentorat":         "mentor qui éveille émotionnellement, sortie des conditionnements",
        "Ami":              "amitié rafraîchissante, l'autre te fait sortir de tes habitudes",
        "Fratrie":          "fratrie atypique, complicité originale",
        "Parent / Enfant":  "parent qui éveille l'enfant à la liberté émotionnelle",
        "Colocataire":      "cohabitation qui bouscule sainement les routines",
        "Rivalité":         "adversaire qui te sort de ton confort émotionnel"
    },
    "Lune-Uranus-hard": {
        "Amour":            "instabilité émotionnelle, ruptures soudaines, attachement-fuite",
        "Business":         "imprévisibilité émotionnelle dans l'équipe, climat erratique",
        "Mentorat":         "mentor erratique émotionnellement, ou élève qui rompt brutalement",
        "Ami":              "amitié à coup d'éclairs, on s'éloigne et se rapproche sans prévenir",
        "Fratrie":          "fratrie déconnectée par à-coups, ruptures inopinées",
        "Parent / Enfant":  "parent imprévisible émotionnellement, enfant en insécurité",
        "Colocataire":      "rythmes qui changent sans prévenir, foyer instable",
        "Rivalité":         "rivalité explosive et imprévisible"
    },
    "MC-Soleil-harm": {
        "Amour":            "le partenaire soutient ta vocation, ta carrière nourrit le couple",
        "Business":         "alignement vocationnel, l'un porte la mission de l'autre",
        "Mentorat":         "mentor qui éclaire la vocation de l'élève",
        "Ami":              "amitié qui valorise et soutient la trajectoire de chacun",
        "Fratrie":          "fratrie qui se soutient dans les ambitions",
        "Parent / Enfant":  "parent qui éclaire la vocation de l'enfant",
        "Colocataire":      "cohabitation qui soutient les ambitions individuelles",
        "Rivalité":         "rivalité publique structurante, deux carrières qui se nourrissent"
    },
    "MC-Soleil-hard": {
        "Amour":            "tension carrière vs couple, vocations qui se cannibalisent",
        "Business":         "désaccord sur les objectifs publics ou stratégiques",
        "Mentorat":         "mentor qui freine la vocation de l'élève (ou jalousie)",
        "Ami":              "amitié où les trajectoires entrent en concurrence",
        "Fratrie":          "rivalité d'ambition, qui réussit publiquement le premier ?",
        "Parent / Enfant":  "parent qui projette ses propres ambitions sur l'enfant",
        "Colocataire":      "incompatibilité entre les rythmes professionnels",
        "Rivalité":         "vouloir bloquer la reconnaissance publique de l'autre"
    },
    "Jupiter-Soleil-harm": {
        "Amour":            "expansion mutuelle, l'autre nourrit ta confiance et ton optimisme",
        "Business":         "alliance qui amplifie l'identité commerciale, croissance partagée",
        "Mentorat":         "mentor jupitérien qui élargit l'horizon de l'élève",
        "Ami":              "amitié-bienfaitrice, on s'aide à grandir mutuellement",
        "Fratrie":          "fratrie qui s'agrandit en présence l'un de l'autre",
        "Parent / Enfant":  "parent généreux, transmission de la confiance en soi",
        "Colocataire":      "cohabitation joviale, on se nourrit mutuellement de bonne humeur",
        "Rivalité":         "rivalité qui agrandit chacun, émulation noble"
    },
    "Jupiter-Soleil-hard": {
        "Amour":            "exagération de l'ego, promesses excessives, débordement",
        "Business":         "surenchère stratégique, prise de risque démesurée",
        "Mentorat":         "mentor moralisateur ou prosélyte, élève dépassé",
        "Ami":              "amitié inégale en générosité, l'un en fait trop",
        "Fratrie":          "comparaison de réussite, gonflement d'ego entre frères/sœurs",
        "Parent / Enfant":  "parent qui en fait trop, attentes excessives",
        "Colocataire":      "cohabitation où l'un dépense l'espace ou les ressources",
        "Rivalité":         "rivalité d'ego gonflé, surenchère narcissique"
    },
    "Ascendant-Descendant-harm": {
        "Amour":            "axe relationnel parfaitement aligné — vous incarnez l'un pour l'autre la projection idéale",
        "Business":         "complémentarité partenariale archétypale, vous occupez les rôles miroirs",
        "Mentorat":         "axe maître-disciple incarné dans la relation elle-même",
        "Ami":              "amitié qui occupe la place du partenaire-miroir",
        "Fratrie":          "fratrie qui joue le rôle du partenaire dans la vie de l'autre",
        "Parent / Enfant":  "lien parent-enfant qui occupe la place du partenaire (attention au transfert)",
        "Colocataire":      "cohabitation qui frôle la fonction de couple-pivot",
        "Rivalité":         "adversaire qui occupe la place du partenaire — opposition structurante"
    },
    "Ascendant-Descendant-hard": {
        "Amour":            "tension axe relation : projections croisées qui s'entrechoquent",
        "Business":         "désaccord sur le partage des rôles partenariaux",
        "Mentorat":         "tension sur l'incarnation des rôles maître-disciple",
        "Ami":              "amitié où chacun voudrait que l'autre joue un autre rôle",
        "Fratrie":          "tension sur la place de chacun dans la fratrie",
        "Parent / Enfant":  "parent qui place l'enfant dans le rôle du partenaire (parentification)",
        "Colocataire":      "frottement sur le partage de l'espace partenarial",
        "Rivalité":         "adversaire qui te projette dans le rôle de l'opposant absolu"
    }
    };
}
// fin de _buildTypoNarrativeLexicon — l'objet renvoyé est mémoisé dans
// _typoLexiconFor._cache au premier appel.

// v7.0.0-β — formatAspectRich enrichi : ajoute la formulation typologique
// stricte si la paire planétaire est dans le lexique. Le LLM doit ensuite
// reprendre cette formulation comme ancrage du registre narratif.
function formatAspectRichTypo(a, nameFrom, nameTo, typo) {
    let s = formatAspectRich(a, nameFrom, nameTo);
    const lex = _typoLexiconFor(a.planete_source, a.planete_cible, a.aspect, typo);
    if (lex) s += `\n  ↳ Lecture ${typo} : ${lex}`;
    return s;
}

let synthPrompt = `${langueInstr}## SYNTHÈSE DE COMPATIBILITÉ — ${persoStrA} & ${persoStrB}\n`;
synthPrompt += `### Type de relation analysé : ${typoConfig.label_fr}\n`;
if (roleA || roleB) {
    synthPrompt += `### Rôles : ${roleA ? `${persoStrA} = ${roleA}` : ''}${roleA && roleB ? ' · ' : ''}${roleB ? `${persoStrB} = ${roleB}` : ''}\n`;
}
synthPrompt += `\n`;

// ╔═══════════════════════════════════════════════════════════════════════╗
// ║  v7.0.0-β — 3 BLOCS NARRATIFS (Q54 : D > B > A)                      ║
// ║  L'ordre d'apparition (A → D → B) suit la lecture LLM, pas la         ║
// ║  hiérarchie de priorité de développement.                             ║
// ╚═══════════════════════════════════════════════════════════════════════╝

// ── BLOC A — STRUCTURE NARRATIVE OBLIGATOIRE ───────────────────────────
synthPrompt += isEN
  ? `## MANDATORY NARRATIVE STRUCTURE — output MUST contain these 5 sections, named and ordered :\n\n`
    + `### 1. Nature of the bond (Typology)\n`
    + `### 2. Interaction dynamics (Harmony / Tension)\n`
    + `### 3. The cement of time (Longevity)\n`
    + `### 4. The created entity (Composite)\n`
    + `### 5. Final verdict + Qualitative band\n\n`
    + `If a section has no significant content, write « Nothing salient at this layer. » — never skip the heading.\n\n`
  : `## STRUCTURE NARRATIVE OBLIGATOIRE — la sortie DOIT contenir ces 5 sections, nommées et ordonnées :\n\n`
    + `### 1. La nature du lien (Typologie)\n`
    + `### 2. La dynamique d'interaction (Harmonie / Tension)\n`
    + `### 3. Le ciment du temps (Longévité)\n`
    + `### 4. L'entité créée (Composite)\n`
    + `### 5. Verdict final + Bande qualitative\n\n`
    + `Si une section n'a aucun contenu saillant, écris « Rien de saillant à ce niveau. » — ne saute jamais l'en-tête.\n\n`;

// ── BLOC D — PROFONDEUR TYPOLOGIQUE (Q54 priorité 1) ───────────────────
synthPrompt += isEN
  ? `## TYPOLOGICAL DEPTH — vocabulary MUST adapt to "${typoConfig.label_en}".\n\n`
    + `Each top inter-aspect below is annotated with a "↳ Lecture ${typologie}" line — that is the typological reading the astrologer wants. You MUST anchor your narrative on these readings ; do not replace them with a generic romantic vocabulary or a one-size-fits-all interpretation.\n\n`
    + `Rule of thumb : a Mars-Mars hard aspect does NOT mean the same thing in Love (passion / tension), in Business (leadership conflict), in Rivalry (engine of confrontation), in Roommate (daily friction), in Sibling (archetypal sibling fight)... The narrative MUST reflect the typology's specific register.\n\n`
  : `## PROFONDEUR TYPOLOGIQUE — le vocabulaire DOIT s'adapter à "${typoConfig.label_fr}".\n\n`
    + `Chaque inter-aspect majeur ci-dessous est annoté d'une ligne « ↳ Lecture ${typologie} » — c'est la lecture typologique imposée par l'astrologue. Tu DOIS ancrer ton narratif sur ces lectures ; ne les remplace pas par un vocabulaire amoureux générique ou une interprétation universelle.\n\n`
    + `Règle d'or : un Mars-Mars dur ne veut PAS dire la même chose en Amour (passion/tension), en Business (conflit de leadership), en Rivalité (moteur de l'affrontement), en Coloc (friction quotidienne), en Fratrie (bagarre archétypale)... Le narratif DOIT refléter le registre propre à la typologie.\n\n`;

// ── BLOC B — VALORISATION DES MARQUEURS (Q54 priorité 2) ───────────────
let _markersBlock = "";
if (_harmonicSignatureBonus?.tier === "grand_benefic") {
    _markersBlock += isEN
      ? `\n### ⭐ THE GRACE OF THE RELATIONSHIP — Grand Benefic detected (+${_harmonicSignatureBonus.bonus} pts on Harmony)\n`
        + `The narrative MUST contain a dedicated paragraph titled "The Grace of the Relationship" (or "La Grâce de la Relation" if FR) explaining that a rare astrological signature is active : a cluster of beneficial trines involving the luminaries, sealed by a Saturn cement. Less than 10 % of couples in the dataset reach this tier. Name what it brings concretely (fluidity, longevity, ability to weather storms, trust as a default state).\n\n`
      : `\n### ⭐ LA GRÂCE DE LA RELATION — Grand Bénéfique détecté (+${_harmonicSignatureBonus.bonus} pts sur l'Harmonie)\n`
        + `Le narratif DOIT contenir un paragraphe dédié intitulé « La Grâce de la Relation » expliquant qu'une signature astrale rare s'active : un faisceau de trigones bénéfiques impliquant les luminaires, scellé par un ciment Saturne. Moins de 10 % des couples du dataset atteignent ce palier. Nomme ce que ça apporte concrètement (fluidité, longévité, capacité à traverser les tempêtes, confiance comme état par défaut).\n\n`;
}
if (_harmonicSignatureBonus?.tier === "half_benefic") {
    _markersBlock += isEN
      ? `\n### ✨ HALF BENEFIC DETECTED (+${_harmonicSignatureBonus.bonus} pts on Harmony)\n`
        + `The narrative MUST mention this signature without overselling it : 2 beneficial trines + a Saturn cement (sextile or trine). Less spectacular than the Grand Benefic but offers a real harmony quality. Frame it as "an underlying favourable layer" rather than a destiny.\n\n`
      : `\n### ✨ DEMI-BÉNÉFIQUE DÉTECTÉ (+${_harmonicSignatureBonus.bonus} pts sur l'Harmonie)\n`
        + `Le narratif DOIT mentionner cette signature sans la survendre : 2 trigones bénéfiques + ciment Saturne (sextile ou trigone). Moins spectaculaire que le Grand Bénéfique mais offre une vraie qualité d'harmonie. Présente-la comme « une couche favorable de fond » plutôt qu'une destinée.\n\n`;
}
if (_intellectualSignatureBonus?.applicable && (_intellectualSignatureBonus?.bonus || 0) > 0) {
    const sig = _intellectualSignatureBonus.signature;
    _markersBlock += isEN
      ? `\n### 🧠 INTELLECTUAL COMPATIBILITY — Mercury-Mercury harmonic detected (+${_intellectualSignatureBonus.bonus} pts on Harmony)\n`
        + `The narrative MUST cite this Mercury-Mercury contact (${sig?.aspect || "harmonic"}) and translate it into the "${typologie}" register : conversation infinie en Ami, pédagogie efficace en Mentorat, transmission éducative en Parent/Enfant, entente intellectuelle au travail en Business, etc.\n\n`
      : `\n### 🧠 COMPATIBILITÉ INTELLECTUELLE — Mercure-Mercure harmonique détecté (+${_intellectualSignatureBonus.bonus} pts sur l'Harmonie)\n`
        + `Le narratif DOIT citer ce contact Mercure-Mercure (${sig?.aspect || "harmonique"}) et le traduire dans le registre "${typologie}" : conversation infinie en Ami, pédagogie efficace en Mentorat, transmission éducative en Parent/Enfant, entente intellectuelle au travail en Business, etc.\n\n`;
}
if (_typologySignatureBonus?.bonus && _typologySignatureBonus.bonus > 0) {
    _markersBlock += isEN
      ? `\n### 🎯 TYPOLOGY SIGNATURE BONUS — archetypal pattern detected (+${_typologySignatureBonus.bonus} pts on Harmony)\n`
        + `The synastry contains an archetypal "${typologie}" pattern (typology signature). The narrative SHOULD honour this archetype : the relationship "fits" the typology in a textbook way at the astrological level.\n\n`
      : `\n### 🎯 BONUS DE SIGNATURE TYPOLOGIQUE — pattern archétypal détecté (+${_typologySignatureBonus.bonus} pts sur l'Harmonie)\n`
        + `La synastrie contient un pattern archétypal "${typologie}" (signature typologique). Le narratif DOIT honorer cet archétype : la relation « correspond » à la typologie de manière exemplaire au niveau astrologique.\n\n`;
}
if (_markersBlock) {
    synthPrompt += isEN
        ? `## ⚡ ASTROLOGICAL JEWELS DETECTED — these markers MUST be explicitly named in the narrative\n${_markersBlock}`
        : `## ⚡ JOYAUX ASTROLOGIQUES DÉTECTÉS — ces marqueurs DOIVENT être nommés explicitement dans le narratif\n${_markersBlock}`;
}


// ====== v6.1.0 — STRUCTURE EN ENTONNOIR (méthodologie astrologique pro) ====
// La synthèse suit la méthode rigoureuse en 5 étapes : 1) Socle individuel,
// 2) Mécanique synastrique, 3) Filtre typologique, 4) Longévité, 5) Composite.
// Le LLM doit construire son verdict en remontant la pyramide, pas en
// piochant des éléments isolés.
synthPrompt += isEN
    ? `### METHODOLOGY — Read the data below in funnel order :\n`
        + `  1. **Individual base** : each person's temperament, attachment style and personal blocks\n`
        + `  2. **Synastric mechanics** : house overlays, inter-aspects, angular activations\n`
        + `  3. **Typological filter** : key planets / houses adapted to "${typoConfig.label_en}"\n`
        + `  4. **Longevity / glue** : Saturn binding + lunar nodes → durability index\n`
        + `  5. **Relational chart** : Composite / Davison → the « We » as an entity\n`
        + `Do not skip levels. Build the verdict from base to summit.\n\n`
    : `### MÉTHODOLOGIE — Lis les données ci-dessous en suivant l'entonnoir :\n`
        + `  1. **Socle individuel** : tempérament, attentes relationnelles et blocages de chacun\n`
        + `  2. **Mécanique synastrique** : overlays maisons, inter-aspects, activations angulaires\n`
        + `  3. **Filtre typologique** : planètes / maisons clés adaptées à "${typoConfig.label_fr}"\n`
        + `  4. **Longévité / ciment** : Saturne ciment + Nœuds → indice de durabilité\n`
        + `  5. **Carte relationnelle** : Composite / Davison → le « Nous » comme entité\n`
        + `Ne saute aucun étage. Construis le verdict du socle vers le sommet.\n\n`;

// ===== ÉTAPE 1 — SOCLE INDIVIDUEL (tempérament + blocages natals) ==========
synthPrompt += isEN ? `## STEP 1 — INDIVIDUAL BASE\n\n` : `## ÉTAPE 1 — SOCLE INDIVIDUEL\n\n`;
synthPrompt += `### ${persoStrA}\n${natalSummaryA}\n`;
const _formatBlocks = (nb, name) => {
    if (!nb || nb.afflicted_count === 0) {
        return isEN
            ? `> Natal blocks: none significant — ${name} brings a relatively unobstructed structure.\n`
            : `> Blocages natals : aucun significatif — ${name} apporte une structure relativement libre.\n`;
    }
    const parts = [];
    if (nb.saturn?.afflicted) {
        const list = (nb.saturn.contacts || []).slice(0, 3).map(c => `${c.with} ${c.aspect}`).join(", ");
        parts.push(isEN
            ? `Saturn afflicted (${nb.saturn.count_hard_to_personal} hard contacts to personal planets : ${list}) → projects fears of rejection / commitment / inadequacy onto the partner`
            : `Saturne affligé (${nb.saturn.count_hard_to_personal} contacts durs aux planètes personnelles : ${list}) → projette des peurs de rejet / engagement / inadéquation sur le partenaire`);
    }
    if (nb.pluto?.afflicted) {
        const list = (nb.pluto.contacts || []).slice(0, 3).map(c => `${c.with} ${c.aspect}`).join(", ");
        parts.push(isEN
            ? `Pluto afflicted (${nb.pluto.count_hard_to_personal} hard contacts to personal planets : ${list}) → projects fears of betrayal / domination / fusion onto the partner`
            : `Pluton affligé (${nb.pluto.count_hard_to_personal} contacts durs aux planètes personnelles : ${list}) → projette des peurs de trahison / domination / fusion sur le partenaire`);
    }
    return isEN
        ? `> ⚠ Natal blocks (projection risk : ${nb.projection_risk}) :\n  • ${parts.join("\n  • ")}\n  Some friction in the synastry may stem from these pre-existing locks, not from the relational dynamic itself.\n`
        : `> ⚠ Blocages natals (risque de projection : ${nb.projection_risk}) :\n  • ${parts.join("\n  • ")}\n  Une partie des frictions synastriques peut provenir de ces verrous préexistants, pas de la dynamique relationnelle elle-même.\n`;
};
// v6.3.0 — Q14 astrologue : les blocages natals ne sont injectés au LLM
// que si l'Intensité globale est suffisante pour les déclencher. Sous le
// seuil 60, la relation reste superficielle — les traumas natals ne sont
// jamais grattés par l'autre, donc inutile de polluer le narratif.
// v6.3.0 — Q6 astrologue : en Business, un Saturne afflige des deux est
// reformulé comme « atout structurant » — sauf si le Saturne touche Vénus
// ou Lune (red flag confiance/cohésion équipe).
const _shouldInjectNatalBlocks = (_globalHI && _globalHI.intensity >= 60);
const _isBusiness = (typologie === "Business");
const _saturnHitsTrustPlanet = (nb) => {
    if (!nb?.saturn?.afflicted) return false;
    const TRUST = new Set(["Vénus", "Lune"]);
    return (nb.saturn.contacts || []).some(c => TRUST.has(c.with));
};
const _formatBlocksBusiness = (nb, name) => {
    if (!nb || nb.afflicted_count === 0) {
        return _formatBlocks(nb, name);
    }
    const parts = [];
    if (nb.saturn?.afflicted) {
        const hitsTrust = _saturnHitsTrustPlanet(nb);
        const list = (nb.saturn.contacts || []).slice(0, 3).map(c => `${c.with} ${c.aspect}`).join(", ");
        if (hitsTrust) {
            parts.push(isEN
                ? `Saturn afflicted hitting Venus/Moon (${list}) — RED FLAG for partnership : trust and team cohesion may erode under pressure`
                : `Saturne affligé touchant Vénus/Lune (${list}) — DRAPEAU ROUGE pour le partenariat : la confiance et la cohésion d'équipe risquent de s'éroder sous pression`);
        } else {
            parts.push(isEN
                ? `Saturn structurally loaded (${nb.saturn.count_hard_to_personal} hard contacts to personal planets : ${list}) — ASSET for business : carries weight, responsibility, long-term ambition`
                : `Saturne structurellement chargé (${nb.saturn.count_hard_to_personal} contacts durs aux planètes personnelles : ${list}) — ATOUT business : porte le poids, la responsabilité, l'ambition long terme`);
        }
    }
    if (nb.pluto?.afflicted) {
        const list = (nb.pluto.contacts || []).slice(0, 3).map(c => `${c.with} ${c.aspect}`).join(", ");
        parts.push(isEN
            ? `Pluto afflicted (${list}) — control issues / power struggles may emerge in management decisions`
            : `Pluton affligé (${list}) — enjeux de contrôle / luttes de pouvoir possibles dans les décisions de management`);
    }
    return isEN
        ? `> Natal structural marks (${name}) :\n  • ${parts.join("\n  • ")}\n`
        : `> Marques structurelles natales (${name}) :\n  • ${parts.join("\n  • ")}\n`;
};
const _emitBlocks = (nb, name) => _isBusiness ? _formatBlocksBusiness(nb, name) : _formatBlocks(nb, name);

if (_shouldInjectNatalBlocks) {
    synthPrompt += _emitBlocks(natalBlocksA, persoStrA);
    synthPrompt += `\n### ${persoStrB}\n${natalSummaryB}\n`;
    synthPrompt += _emitBlocks(natalBlocksB, persoStrB);
} else {
    synthPrompt += `\n### ${persoStrB}\n${natalSummaryB}\n`;
}

// v6.2.0 — Lecture combinée si blocages partagés (Q3 astrologue)
// v6.3.0 — Q12 astrologue : limité aux typologies à intimité émotionnelle
// suffisante pour déclencher la projection plutonienne / saturnienne. Coloc
// (utilitaire), Mentorat (hiérarchique) et Rivalité (adversaire) gardent
// leurs masques sociaux, donc les blessures projetées y sont moindres.
const _SHARED_BLOCKS_TYPOS = new Set(["Amour", "Parent / Enfant", "Business", "Ami", "Fratrie"]);
if (_SHARED_BLOCKS_TYPOS.has(typologie) && sharedNatalBlocks && (sharedNatalBlocks.saturn_dynamic || sharedNatalBlocks.pluto_dynamic)) {
    const isCompSat = sharedNatalBlocks.saturn_dynamic === "compensatory";
    const isAddSat = sharedNatalBlocks.saturn_dynamic === "additive";
    const isCompPlu = sharedNatalBlocks.pluto_dynamic === "compensatory";
    const isAddPlu = sharedNatalBlocks.pluto_dynamic === "additive";
    synthPrompt += isEN
        ? `\n> ⚠ **SHARED WOUND DYNAMIC** : ${sharedNatalBlocks.narrative_hint || ""}.\n`
            + `  ${(isCompSat || isCompPlu) ? "Use this as a RESOURCE in the narrative — they recognize each other in the wound." : ""}`
            + `  ${(isAddSat || isAddPlu) ? "Warn explicitly : the relationship may amplify rather than soothe these blocks. Conscious work is essential." : ""}\n`
        : `\n> ⚠ **DYNAMIQUE DE BLESSURE PARTAGÉE** : ${sharedNatalBlocks.narrative_hint || ""}.\n`
            + `  ${(isCompSat || isCompPlu) ? "Utilise cela comme une RESSOURCE dans le narratif — ils se reconnaissent dans la blessure." : ""}`
            + `  ${(isAddSat || isAddPlu) ? "Préviens explicitement : la relation peut amplifier plutôt qu'apaiser ces blocages. Un travail conscient est essentiel." : ""}\n`;
}

// v6.3.0 — Q8 astrologue : alerte "guru complex" en Mentorat
if (guruComplexAlerts.length > 0) {
    for (const g of guruComplexAlerts) {
        const lines = [];
        if (g.pattern_a) lines.push(isEN
            ? `  - Pattern A : Neptune of ${g.mentor} in House 12 of ${g.student} (savior/illusion) + Pluto of ${g.mentor} ${g.pattern_a.pluto_sol_aspect.aspect} Sun of ${g.student} (psychological power-over)`
            : `  - Pattern A : Neptune de ${g.mentor} en M12 de ${g.student} (sauveur/illusion) + Pluton de ${g.mentor} ${g.pattern_a.pluto_sol_aspect.aspect} Soleil de ${g.student} (prise de pouvoir psychologique)`);
        if (g.pattern_b) lines.push(isEN
            ? `  - Pattern B : Saturn of ${g.mentor} ${g.pattern_b.saturn_lune_aspect.aspect} Moon of ${g.student} (emotional crushing) + Pluto of ${g.mentor} in House 1 of ${g.student} (identity capture)`
            : `  - Pattern B : Saturne de ${g.mentor} ${g.pattern_b.saturn_lune_aspect.aspect} Lune de ${g.student} (écrasement émotionnel) + Pluton de ${g.mentor} en M1 de ${g.student} (capture d'identité)`);
        synthPrompt += isEN
            ? `\n> ⛔ **GURU-COMPLEX RISK** detected (${g.mentor} → ${g.student}) :\n${lines.join("\n")}\n`
                + `  This is the classic signature of a hold/captured-relationship. The narrative MUST warn explicitly about the risk of psychological influence, cult-like dynamics, loss of student's autonomy. Do not soften — name the risk.\n\n`
            : `\n> ⛔ **RISQUE DE GURU-COMPLEXE** détecté (${g.mentor} → ${g.student}) :\n${lines.join("\n")}\n`
                + `  C'est la signature classique d'une emprise. Le narratif DOIT alerter explicitement sur le risque d'influence psychologique, de dynamique sectaire, de perte d'autonomie de l'élève. N'adoucis pas — nomme le risque.\n\n`;
    }
}

// v6.3.0 — Q7 astrologue : signale au LLM la pondération asymétrique
// Parent/Enfant pour qu'il oriente le narratif côté "parent → enfant".
if (_directionalWeights && typologie === "Parent / Enfant") {
    synthPrompt += isEN
        ? `\n> 👨‍👧 **PARENT/CHILD ROLE WEIGHTING** : ${_directionalWeights.parent} = parent, ${_directionalWeights.child} = child${_directionalWeights.derived_from ? ` (derived from ${_directionalWeights.derived_from})` : ""}.\n`
            + `  The score is weighted 70 % parent → child / 30 % child → parent. Heavy planets of the parent (Saturn, Jupiter, Pluto) sculpt fast planets of the child (Moon, Mercury, Venus), not the other way around.\n`
            + `  Tailor the narrative accordingly : speak about how the parent transmits, how the child receives, and where projection blocks may operate.\n\n`
        : `\n> 👨‍👧 **PONDÉRATION DE RÔLE PARENT/ENFANT** : ${_directionalWeights.parent} = parent, ${_directionalWeights.child} = enfant${_directionalWeights.derived_from ? ` (déduit de ${_directionalWeights.derived_from})` : ""}.\n`
            + `  Le score est pondéré 70 % parent → enfant / 30 % enfant → parent. Les planètes lourdes du parent (Saturne, Jupiter, Pluton) sculptent les planètes rapides de l'enfant (Lune, Mercure, Vénus), pas l'inverse.\n`
            + `  Adapte le narratif en conséquence : parle de comment le parent transmet, comment l'enfant reçoit, et où des blocages de projection peuvent jouer.\n\n`;
}

// v6.3.0 — Q9 astrologue : Indice d'Adversité pour Rivalité
if (typologie === "Rivalité" && adversityIndex) {
    const top = adversityIndex.breakdown.slice(0, 4)
        .map(b => `${b.pair} ${b.aspect} (orbe ${b.orbe}°)`).join(" ; ");
    synthPrompt += isEN
        ? `\n> ⚔ **ADVERSITY INDEX** : **${adversityIndex.score}/100** (${adversityIndex.qualitative})\n`
            + `  Top adversarial contacts (Mars/Pluto/Uranus, hard) : ${top || 'none significant'}\n`
            + `  Use this index to calibrate the narrative : a high score = intense and creative rivalry (true emulation), a low score = mismatched adversaries (no real friction).\n\n`
        : `\n> ⚔ **INDICE D'ADVERSITÉ** : **${adversityIndex.score}/100** (${adversityIndex.qualitative})\n`
            + `  Top contacts adverses (Mars/Pluton/Uranus, durs) : ${top || 'aucun significatif'}\n`
            + `  Utilise cet indice pour calibrer le narratif : score haut = rivalité intense et créatrice (vraie émulation), score bas = adversaires mal assortis (pas de vraie friction).\n\n`;
}

// v6.3.0 — Q10 astrologue : alerte Vénus-Mars hors Amour
if (venusMarsAlertActive) {
    const list = venusMarsContacts.slice(0, 3).map(c => `${c.source} (${c.source_p}) ${c.aspect} ${c.cible} (${c.cible_p}) orbe ${c.orbe}°`).join(" ; ");
    synthPrompt += isEN
        ? `\n> ⚠ **VENUS-MARS CONTACTS DETECTED IN A NON-ROMANTIC TYPOLOGY** (${list}).\n`
            + `  This generates passion in the broad sense — a powerful creative drive in Business, complicity in Friendship, etc.\n`
            + `  Mention explicitly the LATENT MAGNETIC TENSION : the relationship may "exceed its initial framework" if not consciously contained. State this without dramatizing — it's just astrology speaking, not a deterministic prediction.\n\n`
        : `\n> ⚠ **CONTACTS VÉNUS-MARS DÉTECTÉS DANS UNE TYPOLOGIE NON-ROMANTIQUE** (${list}).\n`
            + `  Cela génère de la passion au sens large — drive créatif puissant en Business, complicité en Amitié, etc.\n`
            + `  Mentionne explicitement la TENSION MAGNÉTIQUE LATENTE : la relation peut « déborder de son cadre initial » si elle n'est pas consciemment contenue. Dis-le sans dramatiser — c'est juste l'astrologie qui parle, pas une prédiction déterministe.\n\n`;
}

// ===== ÉTAPE 2 — MÉCANIQUE SYNASTRIQUE ======================================
synthPrompt += isEN ? `\n## STEP 2 — SYNASTRIC MECHANICS\n\n` : `\n## ÉTAPE 2 — MÉCANIQUE SYNASTRIQUE\n\n`;

synthPrompt += `### TOP INTER-ASPECTS MAJEURS (impact de ${persoStrB} sur ${persoStrA}) :\n`;
synthPrompt += interAspectsTier1BtoA_enriched.slice(0, 10).map(a => formatAspectRichTypo(a, persoStrB, persoStrA, typologie)).join("\n") + "\n\n";

synthPrompt += `### TOP INTER-ASPECTS MAJEURS (impact de ${persoStrA} sur ${persoStrB}) :\n`;
synthPrompt += interAspectsTier1AtoB_enriched.slice(0, 10).map(a => formatAspectRichTypo(a, persoStrA, persoStrB, typologie)).join("\n") + "\n\n";

if (interAspectsTier2BtoA.length > 0 || interAspectsTier2AtoB.length > 0) {
    synthPrompt += `### CONTACTS LOTS ARABES / ASTÉROÏDES (pertinents pour ${typologie}) :\n`;
    const t2All = [...interAspectsTier2BtoA.slice(0, 5), ...interAspectsTier2AtoB.slice(0, 5)].sort((a,b) => b.score - a.score);
    synthPrompt += t2All.slice(0, 8).map(a => formatAspectRich(a, a.source_personne, a.cible_personne)).join("\n") + "\n\n";
}

if (topNodalAll.length > 0) {
    synthPrompt += `### LIENS KARMIQUES / NODAUX :\n`;
    synthPrompt += topNodalAll.map(nc =>
        `• ${nc.noeud} (${nc.noeud_personne}) ${nc.aspect} ${nc.planete} (${nc.planete_personne}) — orbe ${nc.orbe}° ${nc.karmique ? "🔗" : ""}`
    ).join("\n") + "\n\n";
}

if (crossReceptions.length > 0) {
    synthPrompt += `### RÉCEPTIONS MUTUELLES CROISÉES :\n`;
    const rmDom = crossReceptions.filter(r => r.type.startsWith("RM domicile"));
    const rmExa = crossReceptions.filter(r => r.type.startsWith("RM exaltation"));
    const rmMix = crossReceptions.filter(r => r.type.startsWith("RM mixte"));
    if (rmDom.length > 0) { synthPrompt += `Par domicile :\n` + rmDom.map(r => `• ${r.description}`).join("\n") + "\n"; }
    if (rmExa.length > 0) { synthPrompt += `Par exaltation :\n` + rmExa.map(r => `• ${r.description}`).join("\n") + "\n"; }
    if (rmMix.length > 0) { synthPrompt += `Mixtes (domicile/exaltation croisée) :\n` + rmMix.map(r => `• ${r.description}`).join("\n") + "\n"; }
    synthPrompt += "\n";
}

if (signatureAspects.length > 0) {
    synthPrompt += `### ASPECTS SIGNATURES (présents dans au moins un natal ET dans la synastrie) :\n`;
    synthPrompt += `Ces aspects sont amplifiés car ils résonent avec une dynamique natale préexistante :\n`;
    synthPrompt += signatureAspects.slice(0, 8).map(s => `• ${s.pair} — ${s.aspect} (${s.nature}, orbe ${s.orbe}°, score ${s.score})`).join("\n") + "\n\n";
}

// ===== ÉTAPE 3 — FILTRE TYPOLOGIQUE ========================================
synthPrompt += isEN
    ? `\n## STEP 3 — TYPOLOGICAL FILTER\n> Adjust focus for "${typoConfig.label_en}" — key planets : ${(typoConfig.planetes_cles || []).join(", ")} ; key houses : Principal ${(typoConfig.principales || []).join(", ")} | Secondary ${(typoConfig.secondaires || []).join(", ")}\n> Read the data below through this lens. Don't read love clues for a business partnership and vice versa.\n\n`
    : `\n## ÉTAPE 3 — FILTRE TYPOLOGIQUE\n> Ajuste la focale pour "${typoConfig.label_fr}" — planètes clés : ${(typoConfig.planetes_cles || []).join(", ")} ; maisons clés : Principales ${(typoConfig.principales || []).join(", ")} | Secondaires ${(typoConfig.secondaires || []).join(", ")}\n> Lis les éléments ci-dessous à travers ce prisme. Ne lis pas des indices d'amour pour un partenariat business et vice versa.\n\n`;

// v6.4.0 — Q18 astrologue : Maîtres de TOUTES les maisons clés de la typologie
if (keyHouseRulersAnalysis.length > 0) {
    synthPrompt += isEN
        ? `### KEY HOUSE RULERS — CROSS ANALYSIS (typology "${typoConfig.label_en || typologie}") :\n`
        : `### MAÎTRES DES MAISONS CLÉS — ANALYSE CROISÉE (typologie "${typoConfig.label_fr || typologie}") :\n`;
    for (const e of keyHouseRulersAnalysis) {
        synthPrompt += `\n**M${e.house}** (${persoStrA} : ${e.ruler_a_sign} → maître ${e.ruler_a || "?"} | ${persoStrB} : ${e.ruler_b_sign} → maître ${e.ruler_b || "?"})\n`;
        if (e.ruler_a_in_house_b) synthPrompt += `  · Maître de la M${e.house} de ${persoStrA} → tombe en M${e.ruler_a_in_house_b} de ${persoStrB}\n`;
        if (e.ruler_b_in_house_a) synthPrompt += `  · Maître de la M${e.house} de ${persoStrB} → tombe en M${e.ruler_b_in_house_a} de ${persoStrA}\n`;
        synthPrompt += `  · Qualité croisée : ${e.quality} (${e.cross_aspects.length} aspects entre maîtres)\n`;
        if (e.cross_aspects.length > 0) {
            synthPrompt += e.cross_aspects.slice(0, 3).map(c => `    • ${c.pair} (${c.nature}, orbe ${c.orbe}°)`).join("\n") + "\n";
        }
    }
    synthPrompt += `\n`;
}

if (m7CrossAnalysis.ruler_a && m7CrossAnalysis.ruler_b) {
    synthPrompt += `### MAÎTRES DE LA MAISON 7 CROISÉS :\n`;
    synthPrompt += `${persoStrA} : M7 en ${m7CrossAnalysis.sign_a} → maître ${m7CrossAnalysis.ruler_a}\n`;
    synthPrompt += `${persoStrB} : M7 en ${m7CrossAnalysis.sign_b} → maître ${m7CrossAnalysis.ruler_b}\n`;
    synthPrompt += `Qualité croisée : ${m7CrossAnalysis.quality} (${m7CrossAnalysis.cross_aspects.length} aspects entre les maîtres de M7)\n`;
    if (m7CrossAnalysis.cross_aspects.length > 0) {
        synthPrompt += m7CrossAnalysis.cross_aspects.slice(0, 4).map(a => `• ${a.source} ${a.aspect} ${a.cible} (${a.nature}, orbe ${a.orbe}°)`).join("\n") + "\n";
    }
    synthPrompt += "\n";
}

if (synastryAlmuten.almuten) {
    synthPrompt += `### ALMUTEN DE LA SYNASTRIE (gouverneur de la relation) :\n`;
    synthPrompt += `Planète dominante combinée : **${synastryAlmuten.almuten}** (score combiné ${synastryAlmuten.almuten_score})\n`;
    synthPrompt += `Top 5 : ${synastryAlmuten.top5.map(t => `${t.planet} (${t.combined_score})`).join(", ")}\n\n`;
}

// P1.2 — Déclinaisons inter-cartes dans la synthèse
if (declData.parallels.length > 0 || declData.contraParallels.length > 0) {
    synthPrompt += `### PARALLÈLES et CONTRA-PARALLÈLES DE DÉCLINAISON :\n`;
    if (declData.parallels.length > 0) {
        const topParallels = declData.parallels.slice(0, 10);
        synthPrompt += `Parallèles (≈ conjonction subtile) — top ${topParallels.length}/${declData.parallels.length} :\n`;
        synthPrompt += topParallels.map(p => `• ${p.p1} (${p.personne1}) // ${p.p2} (${p.personne2}) — orbe ${p.orbe}° ${p.hemisphere}`).join("\n") + "\n";
    }
    if (declData.contraParallels.length > 0) {
        const topContra = declData.contraParallels.slice(0, 10);
        synthPrompt += `Contra-parallèles (≈ opposition subtile) — top ${topContra.length}/${declData.contraParallels.length} :\n`;
        synthPrompt += topContra.map(p => `• ${p.p1} (${p.personne1}) # ${p.p2} (${p.personne2}) — orbe ${p.orbe}°`).join("\n") + "\n";
    }
    synthPrompt += "\n";
}

// P1.3 — OOB dans la synthèse
if (declData.oob.length > 0) {
    synthPrompt += `### PLANÈTES HORS LIMITES (OOB) :\n`;
    synthPrompt += declData.oob.map(o => `• ${o.planete} (${o.personne}) : ${o.declinaison.toFixed(2)}° ${o.hemisphere} (+${o.depassement}° au-delà du seuil)`).join("\n") + "\n\n";
}

// P1.4 — Ponts stellaires dans la synthèse
// v6.4.0 — Q19 astrologue : priorisation des étoiles selon la typologie.
// Trie d'abord par priorité typologique (major > moderate > alert > minor),
// puis affiche un tag visuel pour le LLM. Les "alert" sont signalées
// explicitement comme contradictoires avec la typologie.
if (fixedStarBridges.length > 0) {
    const _STAR_PRIO_RANK = { major: 0, alert: 1, moderate: 2, minor: 3 };
    const tagged = fixedStarBridges.map(b => ({
        ...b,
        _typo_priority: getStarPriorityForTypo(b.etoile, typologie)
    })).sort((a, b) => (_STAR_PRIO_RANK[a._typo_priority] || 9) - (_STAR_PRIO_RANK[b._typo_priority] || 9));
    const filtered = tagged.filter(b => b._typo_priority === "major" || b._typo_priority === "alert" || b._typo_priority === "moderate");
    const toShow = filtered.length > 0 ? filtered.slice(0, 6) : tagged.slice(0, 4);
    synthPrompt += isEN
        ? `### FIXED STAR BRIDGES (filtered by relevance for "${typoConfig.label_en || typologie}") :\n`
        : `### PONTS STELLAIRES (filtrés par pertinence pour "${typoConfig.label_fr || typologie}") :\n`;
    synthPrompt += toShow.map(b => {
        const tag = b._typo_priority === "major" ? "★★★ MAJEUR" :
                    b._typo_priority === "alert" ? "⚠ ALERTE" :
                    b._typo_priority === "moderate" ? "★★ Modéré" : "★ Mineur";
        const nature = b.nature_etoile || (STAR_NATURE[b.etoile]?.theme || '');
        return `• ${tag} — ★ ${b.etoile} : ${b.planete_a} (${b.personne_a}) ↔ ${b.planete_b} (${b.personne_b}) — ${nature}`;
    }).join("\n") + "\n";
    if (filtered.some(b => b._typo_priority === "alert")) {
        synthPrompt += isEN
            ? `> ⚠ At least one star bridge contradicts the typology — use it as a counter-current signal in the narrative (e.g. Algol on a love bond carries a destructive undertone, but on a rivalry it crystallizes raw power).\n`
            : `> ⚠ Au moins un pont stellaire contredit la typologie — utilise-le comme signal à contre-courant dans le narratif (ex: Algol sur un lien amoureux porte un sous-texte destructeur, mais sur une rivalité cristallise la puissance brute).\n`;
    }
    synthPrompt += `\n`;
}

// P1.5 — Antiscia dans la synthèse
if (allAntiscia.length > 0) {
    synthPrompt += `### ANTISCIA / CONTRA-ANTISCIA INTER-CARTES :\n`;
    synthPrompt += allAntiscia.slice(0, 8).map(a => `• ${a.p1} (${a.personne1}) ${a.type} ${a.p2} (${a.personne2}) — orbe ${a.orbe}° miroir en ${a.signe_miroir}`).join("\n") + "\n\n";
}

// v6.2.0 — Composite prioritaire (norme industrielle Robert Hand)
// v6.3.0 — Q15 astrologue : pas de Composite/Davison pour Rivalité (deux
// adversaires ne créent pas d'entité coopérative — la relation n'existe que
// par le prisme de leurs frictions individuelles).
// v6.5.0 — Q23 astrologue : EXCEPTION pour Rivalité publique. Si le Composite
// a au moins une planète personnelle en M10 (statut/carrière) ou M11 (public/
// société), la rivalité s'incarne dans une sphère commune (politique, sportive,
// médiatique). Dans ce cas seulement, on garde le Composite pour Rivalité.
const _PERSONAL_PLANETS = new Set(["Soleil","Lune","Mercure","Vénus","Mars","Jupiter","Saturne","Pluton"]);
const _hasM10orM11Activation = (compositeChart && Array.isArray(compositeChart.planetes))
    ? compositeChart.planetes.some(p => _PERSONAL_PLANETS.has(p.planete) && (p.maison_composite === 10 || p.maison_composite === 11))
    : false;
const _useRelationalChart = (typologie !== "Rivalité") || _hasM10orM11Activation;
const _rivalryPublicArena = (typologie === "Rivalité" && _hasM10orM11Activation);
if (_useRelationalChart) {
    if (_rivalryPublicArena) {
        synthPrompt += isEN
            ? `### COMPOSITE CHART (rivalry incarnated in public arena — M10/M11 activated) :\n`
              + `Note: this rivalry exists not just between the two individuals but in their shared public/political/sporting sphere. The Composite shows how the rivalry-entity is perceived externally.\n`
            : `### THÈME COMPOSITE (rivalité incarnée dans la sphère publique — M10/M11 activées) :\n`
              + `Note : cette rivalité ne vit pas qu'entre les deux personnes mais dans leur sphère commune (politique, sportive, médiatique). Le Composite montre comment l'entité-rivalité est perçue de l'extérieur.\n`;
    } else {
        synthPrompt += isEN
            ? `### COMPOSITE CHART (the « We » as an entity — primary source) :\n`
            : `### THÈME COMPOSITE (l'entité relationnelle — source principale) :\n`;
    }
    synthPrompt += compositeChart.planetes.map(p =>
        `• ${p.planete} composite : ${p.normDegre}° ${p.signe}${p.maison_composite ? " (M" + p.maison_composite + ")" : ""}`
    ).join("\n") + "\n";
    if (compositeChart.aspects.length > 0) {
        synthPrompt += `\nAspects composites majeurs :\n`;
        synthPrompt += compositeChart.aspects.slice(0, 10).map(a =>
            `• ${a.planete_1} ${a.symbol} ${a.planete_2} (${a.aspect}, orbe ${a.orbe}°)`
        ).join("\n") + "\n";
    }
    if (compositeConfigs.length > 0) {
        synthPrompt += `\nConfigurations du composite :\n`;
        synthPrompt += compositeConfigs.map(c => `• ${c.type} : ${c.planets.join(", ")} — ${c.description}`).join("\n") + "\n";
    }
} else {
    synthPrompt += isEN
        ? `### NO RELATIONAL CHART (Rivalry typology) :\n`
            + `Two adversaries do not create a cooperative third entity. Analyze the relationship purely through inter-aspects below — there is no "we", only the field of their friction.\n\n`
        : `### PAS DE CARTE RELATIONNELLE (typologie Rivalité) :\n`
            + `Deux adversaires ne créent pas une troisième entité coopérative. Analyse la relation uniquement via les inter-aspects ci-dessous — il n'y a pas de « nous », seulement le champ de leur friction.\n\n`;
}

// P2.4 — Midpoints enrichis dans la synthèse
if (allMidpoints.length > 0) {
    synthPrompt += `### MIDPOINTS RELATIONNELS (Ebertin) — top 8 :\n`;
    synthPrompt += allMidpoints.filter(m => m.is_homonyme || m.theme).slice(0, 8).map(m => {
        let line = `• ${m.midpoint_of} activé par ${m.activated_by} (${m.activated_personne}) — ${m.signe_midpoint} ${m.degre_midpoint}° orbe ${m.orbe}°`;
        if (m.theme) line += ` | Thème : ${m.theme}`;
        if (m.is_homonyme) line += ` [HOMONYME — axe synastrique]`;
        return line;
    }).join("\n") + "\n\n";
}

// P2.4b — Planetary Pictures (convergences mod90°)
if (planetaryPictures.length > 0) {
    const topPP = planetaryPictures.filter(pp => pp.count >= 2).slice(0, 5);
    if (topPP.length > 0) {
        synthPrompt += `### CONVERGENCES MIDPOINTS (Ebertin — mod. 90°) :\n`;
        synthPrompt += `Ces axes concentrent plusieurs midpoints au même degré (modulus 90°) — zones de très haute sensibilité relationnelle :\n`;
        topPP.forEach(pp => {
            synthPrompt += `• Axe ${pp.degre90}° (${pp.signe}) — ${pp.count} midpoints convergents : ${pp.midpoints.map(m => m.pair_key).join(", ")}\n`;
        });
        synthPrompt += "\n";
    }
}

// P2.5 — Ponts Paran Croisés (Brady)
if (crossParanBridges.length > 0) {
    synthPrompt += `### PONTS PARAN CROISÉS (Brady) :\n`;
    synthPrompt += `Étoiles fixes en paran simultané avec des planètes des deux personnes — lien stellaire profond par co-angularité :\n`;
    synthPrompt += crossParanBridges.slice(0, 6).map(b =>
        `• ★ ${b.etoile} (${b.star_archetype || ""}) : ${b.planete_a} de ${b.personne_a} (${b.angle_a}) ↔ ${b.planete_b} de ${b.personne_b} (${b.angle_b}) — orbe moy. ${b.orbe_moyen}°${b.star_theme ? ` | ${b.star_theme}` : ""}`
    ).join("\n") + "\n\n";
}

// P2.6 — Vertex dans la synthèse
if (allVertexContacts.length > 0) {
    synthPrompt += `### CONTACTS VERTEX / ANTI-VERTEX :\n`;
    synthPrompt += allVertexContacts.map(v => `• ${v.planete} (${v.personne_planete}) ${v.aspect || '☌'} ${v.point} (${v.personne_vertex}) — orbe ${v.orbe}° (${v.nature || 'fusion'})`).join("\n") + "\n\n";
}

synthPrompt += `\n### COMPATIBILITÉ ÉLÉMENTAIRE / MODALE :\n`;
synthPrompt += `${elementCompat.summary_fr}\n`;
synthPrompt += `${persoStrA} : Éléments [${formatElements(statsA.elements)}] — Modes [${formatModes(statsA.modes)}]\n`;
synthPrompt += `${persoStrB} : Éléments [${formatElements(statsB.elements)}] — Modes [${formatModes(statsB.modes)}]\n\n`;

// P3.3 — Profil de sensibilité croisé
if (crossSensitivity.length > 0) {
    synthPrompt += `### PROFIL DE SENSIBILITÉ CROISÉ :\n`;
    synthPrompt += crossSensitivity.map(cs => `• ${cs.description}`).join("\n") + "\n\n";
}

// ===== ÉTAPE 4 — LONGÉVITÉ (Saturne ciment + Nœuds vie commune) ============
// Nouveau pilier méthodologique v6.1.0 : indice dédié à la durabilité de la
// relation, complément indispensable du score d'Harmonie qui ne mesure que
// l'instantané. Saturne aux planètes personnelles = capacité à traverser les
// épreuves. Nœuds = fonction évolutive de la rencontre.
const _li = longevityIndex || {};
const _lib = _li.breakdown || {};
synthPrompt += isEN
    ? `\n## STEP 4 — LONGEVITY / RELATIONAL GLUE\n`
        + `### Longevity Index : **${_li.score ?? '?'}/15** — qualitative : *${_li.qualitative || '?'}*\n`
        + `  · Saturn glue (harmonious to partner's personal planets) : +${_lib.saturn_glue ?? 0}\n`
        + `  · Saturn burden (hard to partner's personal planets) : -${_lib.saturn_burden ?? 0}\n`
        + `  · Saturn ↔ Saturn (shared durability) : ${_lib.saturn_saturn >= 0 ? '+' : ''}${_lib.saturn_saturn ?? 0}\n`
        + `  · North Node ↔ personal planets (evolutive function) : +${_lib.nodes_evolutive ?? 0}\n`
        + `  · South Node ↔ personal planets (karmic loop) : +${_lib.nodes_repetitive ?? 0}\n`
        + `> A high Harmony with low Longevity = beautiful relationship that may not last (lacks Saturnian glue).\n`
        + `> A moderate Harmony with high Longevity = enduring relationship despite friction (Saturn binds the partners through the test of time).\n`
        + `> A low Longevity does NOT mean failure — it means the relationship requires conscious effort to last.\n\n`
    : `\n## ÉTAPE 4 — LONGÉVITÉ / CIMENT RELATIONNEL\n`
        + `### Indice de longévité : **${_li.score ?? '?'}/15** — qualitatif : *${_li.qualitative || '?'}*\n`
        + `  · Saturne ciment (harmonique aux planètes personnelles de l'autre) : +${_lib.saturn_glue ?? 0}\n`
        + `  · Saturne fardeau (dur aux planètes personnelles de l'autre) : -${_lib.saturn_burden ?? 0}\n`
        + `  · Saturne ↔ Saturne (durabilité partagée) : ${_lib.saturn_saturn >= 0 ? '+' : ''}${_lib.saturn_saturn ?? 0}\n`
        + `  · Nœud Nord ↔ planètes personnelles (fonction évolutive) : +${_lib.nodes_evolutive ?? 0}\n`
        + `  · Nœud Sud ↔ planètes personnelles (boucle karmique) : +${_lib.nodes_repetitive ?? 0}\n`
        + `> Une Harmonie élevée + Longévité faible = belle relation qui peut ne pas durer (manque de ciment saturnien).\n`
        + `> Une Harmonie moyenne + Longévité forte = relation qui dure malgré les frictions (Saturne lie les partenaires à travers l'épreuve du temps).\n`
        + `> Une Longévité basse ne signifie PAS échec — elle signifie que la relation demande un effort conscient pour durer.\n\n`;

// ===== ÉTAPE 5 — CARTE RELATIONNELLE (Composite + Davison) ================
// v6.3.0 — Q15 : skip total pour Rivalité (le « Nous » n'existe pas).
if (_useRelationalChart) {
synthPrompt += isEN
    ? `## STEP 5 — RELATIONAL CHART (Composite + Davison)\n> Below : the « We » as an entity — how the COUPLE / PARTNERSHIP appears to the outside world, beyond the individual contributions.\n\n`
    : `## ÉTAPE 5 — CARTE RELATIONNELLE (Composite + Davison)\n> Ci-dessous : le « Nous » comme entité — comment le COUPLE / PARTENARIAT apparaît au monde extérieur, au-delà des contributions individuelles.\n\n`;

// P3.1 — Davison dans la synthèse
if (davisonChart && davisonChart.planetes.length > 0) {
    synthPrompt += isEN
        ? `### DAVISON CHART (mid-time/mid-place — secondary source, useful for transits) :\n`
        : `### THÈME DAVISON (date/lieu mi-chemin — source secondaire, utile pour les transits) :\n`;
    if (davisonChart.meta?.date_davison) synthPrompt += `Date Davison : ${davisonChart.meta.date_davison}\n`;
    synthPrompt += davisonChart.planetes.slice(0, 12).map(p =>
        `• ${p.planete} Davison : ${p.normDegre}° ${p.signe} (M${p.maison || '?'})`
    ).join("\n") + "\n";
    if (davisonChart.aspects.length > 0) {
        synthPrompt += `Aspects Davison majeurs :\n`;
        synthPrompt += davisonChart.aspects.slice(0, 8).map(a =>
            `• ${a.planete_1} ${a.symbol} ${a.planete_2} (${a.aspect}, orbe ${a.orbe}°)`
        ).join("\n") + "\n";
    }
    if (davisonChart.configurations.length > 0) {
        const topDavCfg = davisonChart.configurations.sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 10);
        synthPrompt += `Configurations Davison (top ${topDavCfg.length}/${davisonChart.configurations.length}) :\n`;
        synthPrompt += topDavCfg.map(c => `• ${c.type} : ${c.planets.join(", ")}`).join("\n") + "\n";
    }
    synthPrompt += "\n";
}
}  // end if (_useRelationalChart) for Step 5

// ====== v6.0.0 — Score Harmonie / Intensité (source de vérité narrative) =====
// La bande qualitative et le score affiché viennent désormais de l'agrégation
// (Hm, Im) par maison. Le LLM doit s'aligner strictement sur (H, I) et la
// bande v6, et NON sur les piliers v5 ni sur la note v5 stretched.
const _harmonyV6 = globalScoreResult.harmony ?? globalScore;
const _intensityV6 = globalScoreResult.intensity ?? 0;
const _qualBandV6 = globalScoreResult.qualitative_band_v6 || globalScoreResult.qualitative_band || {};
const _domSigV6 = globalScoreResult.dominant_signature_global || "lukewarm";
const _classCountsV6 = globalScoreResult.class_counts_global || {};
const _versionLabel = globalScoreResult.version || "v6.0.0";

synthPrompt += isEN
    ? `### GLOBAL HARMONY SCORE: ${_harmonyV6}/100 (${_versionLabel})\n`
    : `### NOTE D'HARMONIE GLOBALE : ${_harmonyV6}/100 (${_versionLabel})\n`;
synthPrompt += isEN
    ? `Interpretation: **${_qualBandV6.band_en || _qualBandV6.band || "N/A"}** — ${_qualBandV6.desc_en || _qualBandV6.desc || ""}\n`
    : `Interprétation : **${_qualBandV6.band || "N/A"}** — ${_qualBandV6.desc || ""}\n`;
synthPrompt += isEN
    ? `> Internal indicator (DO NOT cite literally): Intensity = ${_intensityV6}/100 ; dominant signature = "${_domSigV6}" ; aspect class distribution = ${JSON.stringify(_classCountsV6)}.\n`
    : `> Indicateur interne (À NE PAS citer textuellement) : Intensité = ${_intensityV6}/100 ; signature dominante = "${_domSigV6}" ; distribution des classes d'aspects = ${JSON.stringify(_classCountsV6)}.\n`;

// Directives STRICTES par bande v6 (H, I) — le narratif DOIT s'aligner sur la note
const _toneDirective = (() => {
    const H = _harmonyV6, I = _intensityV6;
    if (H >= 80 && I >= 55) {
        return isEN
            ? "[TONE — Exceptional alchemy] Use a strongly positive, almost magnetic tone. Emphasize natural complementarity, ease, deep mutual understanding. Mention long-term resilience. Avoid dramatic warnings; only acknowledge minor friction zones in passing."
            : "[TON — Alchimie exceptionnelle] Adopte un ton franchement positif, presque magnétique. Souligne la complémentarité naturelle, la facilité, l'entente profonde. Mentionne la solidité dans la durée. Évite les avertissements dramatiques ; n'évoque les zones de friction qu'en passant.";
    }
    if (H >= 75) {
        return isEN
            ? "[TONE — Fluid, peaceful] Positive and warm tone. The relationship is harmonious but not fiery. Mention the calm, the understanding, the comfort. If intensity is low (<50), gently note that energy may be missing for transformation."
            : "[TON — Fluide et apaisée] Ton positif et chaleureux. La relation est harmonieuse mais sans flamme. Souligne le calme, la compréhension, le confort. Si l'intensité est basse (<50), évoque délicatement le risque d'un manque d'énergie pour transformer.";
    }
    if (H >= 65) {
        return isEN
            ? "[TONE — Solid] Confident but measured tone. Real harmony with some friction zones. Present strengths first (60% of the narrative), then constructive challenges (30%), then the path forward (10%)."
            : "[TON — Solide] Ton confiant mais mesuré. Vraie harmonie avec quelques zones de friction. Présente les forces en premier (60% du narratif), puis les défis constructifs (30%), puis le chemin (10%).";
    }
    if (H >= 50 && I >= 60) {
        return isEN
            ? "[TONE — Intense and transformative] Nuanced tone, lucid. The relationship is magnetic but demanding. NEVER use the word 'alchemy' or 'easy'. Highlight the intensity, the karmic/transformative dimension, then the real challenges. Mention that maturity and consciousness are required for this bond to thrive."
            : "[TON — Intense et transformative] Ton nuancé, lucide. La relation est magnétique mais éprouvante. N'utilise JAMAIS « alchimie » ni « facile ». Mets en avant l'intensité, la dimension karmique/transformative, puis les vrais défis. Précise que cette relation demande maturité et conscience pour s'épanouir.";
    }
    if (H >= 45) {
        return isEN
            ? "[TONE — Contrasted] Honest, balanced tone. Mix of fluidity and friction in equal proportion. NEVER write 'great compatibility' or 'natural understanding'. Phrase challenges as concrete points to work on, not as fate."
            : "[TON — Contrastée] Ton honnête, équilibré. Mélange de fluidité et de friction à parts égales. N'écris JAMAIS « grande compatibilité » ni « entente naturelle ». Formule les défis comme des points concrets à travailler, pas comme une fatalité.";
    }
    if (H >= 30 && I >= 55) {
        return isEN
            ? "[TONE — Strong tension, demanding] Lucid, careful tone. Strong energetic charge but dominant frictions. Acknowledge the magnetic attraction (which IS real here) but be CLEAR that without conscious work, the bond degrades. Offer concrete points of vigilance. NEVER promise harmony that isn't there."
            : "[TON — Tension forte, exigeante] Ton lucide, prudent. Charge énergétique forte mais frictions dominantes. Reconnais l'attirance magnétique (RÉELLE ici) mais sois CLAIR : sans travail conscient, le lien se dégrade. Propose des points de vigilance concrets. NE promets JAMAIS une harmonie absente.";
    }
    if (H >= 30) {
        return isEN
            ? "[TONE — Limited compatibility] Honest, sober tone. Few astrological resources to sustain the bond. Lukewarm, not catastrophic. Speak of effort required, of structural distance. Avoid drama but don't sugar-coat either."
            : "[TON — Compatibilité limitée] Ton honnête, sobre. Peu de ressources astrologiques pour soutenir le lien. Tiède, pas catastrophique. Parle d'efforts à fournir, de distance structurelle. Évite le drame, mais ne sucre pas la pilule.";
    }
    return isEN
        ? "[TONE — Critical compatibility] Caring but unambiguous tone. The bond carries heavy structural frictions. Acknowledge the courage required to be in this relationship. Avoid moralizing; offer realistic perspectives (couple's therapy, time apart, individual work). Never project an outcome."
        : "[TON — Compatibilité critique] Ton bienveillant mais sans ambiguïté. Le lien porte des frictions structurelles lourdes. Reconnais le courage nécessaire pour être dans cette relation. Évite la moralisation ; propose des perspectives réalistes (thérapie de couple, temps de recul, travail individuel). Ne projette jamais une issue.";
})();
synthPrompt += "\n" + _toneDirective + "\n";

// Directives spécifiques selon la signature dominante (paradoxe transformatif notamment)
if (_domSigV6 === "transformative") {
    synthPrompt += isEN
        ? "[ADDITIONAL — Transformative signature] The dominant aspects are Pluto/Uranus on personal planets. This produces intense, paradoxical bonds : highly magnetic but clivant. Honor BOTH dimensions in the same sentence, never split them apart.\n"
        : "[COMPLÉMENT — Signature transformative] Les aspects dominants sont Pluton/Uranus sur planètes personnelles. Ils produisent des liens intenses et paradoxaux : très magnétiques mais clivants. Honore les DEUX dimensions dans la même phrase, ne les sépare jamais.\n";
} else if (_domSigV6 === "karmic") {
    synthPrompt += isEN
        ? "[ADDITIONAL — Karmic signature] Strong nodal contacts dominate. Speak of « soul recognition », repetitive patterns, lessons to integrate. Balance with concrete relational work.\n"
        : "[COMPLÉMENT — Signature karmique] Les contacts nodaux dominent. Parle de « reconnaissance d'âme », de schémas répétitifs, de leçons à intégrer. Équilibre avec du travail relationnel concret.\n";
} else if (_domSigV6 === "tense") {
    synthPrompt += isEN
        ? "[ADDITIONAL — Tense signature] Hard aspects from Saturn/Mars dominate the structure. Frictions are durable, not circumstantial. Don't promise things will improve « naturally » : they require deliberate work.\n"
        : "[COMPLÉMENT — Signature tendue] Les aspects durs de Saturne/Mars dominent la structure. Les frictions sont durables, pas circonstancielles. Ne promets pas que ça s'arrangera « naturellement » : il faut un travail délibéré.\n";
} else if (_domSigV6 === "contrasted") {
    synthPrompt += isEN
        ? "[ADDITIONAL — Contrasted signature] Fluidity and friction balance each other. Avoid binary judgment ; the relationship oscillates and depends heavily on the moment, the context, the partners' state.\n"
        : "[COMPLÉMENT — Signature contrastée] Fluidité et friction s'équilibrent. Évite le jugement binaire ; la relation oscille et dépend beaucoup du moment, du contexte, de l'état des partenaires.\n";
}

// Anciens piliers v5 conservés pour CONTEXTE astrologique uniquement
synthPrompt += "\n";
const _ds = globalScoreResult.dual_score || {};
const _scoreV5 = globalScoreResult.score_v5;
synthPrompt += isEN
    ? `> Legacy v5 indicators (background context, do NOT cite as the score) : v5 stretched = ${_scoreV5}/100 ; v5 Fluidity = ${_ds.fluidite?.score || '?'}/100, v5 Intensity = ${_ds.intensite?.score || '?'}/100. The v6 Harmony score above is the ONLY one to mention.\n`
    : `> Indicateurs hérités v5 (contexte de fond, NE PAS citer comme score) : v5 étiré = ${_scoreV5}/100 ; Fluidité v5 = ${_ds.fluidite?.score || '?'}/100, Intensité v5 = ${_ds.intensite?.score || '?'}/100. La note d'Harmonie v6 ci-dessus est la SEULE à mentionner.\n`;
const _p1 = globalScoreDetail.pilier1_aspectual || {};
const _p2 = globalScoreDetail.pilier2_karmique || {};
const _p3 = globalScoreDetail.pilier3_composite || {};
const _p4 = globalScoreDetail.pilier4_structural || {};
const _p5 = globalScoreDetail.pilier5_typology || {};
const _penSum = globalScoreDetail.penalties_summary || {};
const _bonSum = globalScoreDetail.bonuses_summary || {};
synthPrompt += `— P1 Qualité Aspectuelle : ${_p1.total || 0}/35 (ratio ${((_p1.ratio || 0) * 100).toFixed(0)}%, ${_p1.aspects_count || 0} aspects, ${_p1.exact_bonus || 0} exacts, ${_p1.retro_in_aspects || 0} impliquant rétrograde${_p1.aspect_reception_bonus ? ', réception +' + _p1.aspect_reception_bonus : ''}${_p1.cazimi ? ', CAZIMI: ' + _p1.cazimi.map(c => c.planet).join('/') : ''}${_p1.combust ? ', combustes: ' + _p1.combust.map(c => c.planet).join('/') : ''})\n`;
synthPrompt += `— P2 Profondeur Karmique : ${_p2.total || 0}/30 (${_p2.nodal_karmique || 0} nodaux [qual. ${_p2.nodal_qual_score || 0}], ${_p2.receptions || 0} réceptions, ${_p2.star_bridges || 0} ponts stellaires, ${_p2.midpoints_top || 0} midpoints, ${_p2.cross_parans || 0} parans)\n`;
synthPrompt += `— P3 Composite/Davison : ${_p3.total || 0}/20 (comp. ratio ${((_p3.composite_ratio || 0) * 100).toFixed(0)}%, dav. ${_p3.davison_score || 0}/8)\n`;

const homoBonus = (_p4.bonuses || []).filter(b => ["soleil_soleil_soft","lune_lune_soft","mercure_mercure_soft","venus_venus_soft","mars_mars_soft","asc_asc_soft","mc_mc_soft"].includes(b.id));
const homoPen = (_p4.penalties || []).filter(p => ["soleil_soleil_hard","lune_lune_hard","mercure_mercure_hard","venus_venus_hard","mars_mars_hard","asc_asc_hard","mc_mc_hard","no_venus_venus_soft"].includes(p.id));
const homoStr = [...homoBonus.map(b => `${b.id.replace(/_soft$/,"").replace(/_/g,"↔")} ✓ ${b.aspect}${b.elem ? ' ['+b.elem+']' : ''}`), ...homoPen.map(p => `${p.id.replace(/_hard$/,"").replace(/^no_/,"∅ ").replace(/_/g,"↔")} ✗ ${p.aspect || ""}${p.elem ? ' ['+p.elem+']' : ''}`)].join(", ") || "aucun";

const _signCompat = _p4.sign_compatibility || {};
const _signStr = (_signCompat.pairs || []).map(p => `${p.planet}:${p.relation}(${p.pts > 0 ? '+' : ''}${p.pts})`).join(', ') || 'N/A';
synthPrompt += `— P4 Compat. Structurelle : ${_p4.total || 0}/20 (éléments: ${_p4.element_relation || '?'}, ${_p4.elements_communs || 0} communs, modes: ${_p4.modes_communs || 0} communs, signes personnels: [${_signStr}] total ${_signCompat.score || 0}, typo: ${_p4.typo_principal_activated || 0}/${(_p4.typo_principal_activated || 0) + (_p4.typo_principal_empty || 0)} maisons activées, homonymes: ${homoStr})\n`;
synthPrompt += `— P5 Adéquation Typologique : ${_p5.score || 0}/15 (concentration overlay sur maisons typologiques = ${(((_p5.concentration || 0) * 100).toFixed(0))}% — wPrinc=${_p5.wPrinc || 0}, wSec=${_p5.wSec || 0}, wOth=${_p5.wOth || 0}). Mesure la pertinence de la synastrie pour la typologie demandée (Amour, Business, etc.).\n`;
const _p6 = globalScoreDetail.pilier6_typo_houses || {};
if (typeof _p6.score === "number") {
    synthPrompt += `— P6 Cohérence Typologique des Maisons : ${_p6.score}/6 (avg principales A→B = ${_p6.avg_principales_a_in_b || '?'}/100, B→A = ${_p6.avg_principales_b_in_a || '?'}/100, asymétrie ${_p6.asymmetry || '?'}, ${_p6.tension_count || 0} maisons clés en polarité tension, pénalité ombre ${_p6.shadow_penalty || 0}). Mesure la cohérence entre activation des maisons clés et le score global ; un P6 négatif signale que le « tissu narratif » global ne se confirme pas dans les maisons clés de la typologie.\n`;
}
const _vetoApplied = globalScoreDetail.qualitative_veto;
if (_vetoApplied) {
    // v5.0.0 — Le veto est une donnée DE PILOTAGE pour l'astrologue/LLM, pas
    // une étiquette à exposer au lecteur. On donne les raisons en langage
    // humain et on interdit explicitement au LLM de les recopier sous forme
    // brute (codes machine, mention « VETO »). Le score lui-même + la bande
    // qualitative font office de signal pour le lecteur final.
    const _vetoReasonsHuman = {
        "M7_weak_with_SN_dominance": "engagement (Maison 7) fragile combiné à une dominance du Nœud Sud (boucle karmique répétitive)",
        "destructive_quartet": "convergence de plusieurs configurations destructrices (Pluton dur, fusions empoisonnées, contacts du Nœud Sud)",
        "intensity_explosion": "intensité émotionnelle disproportionnée par rapport à la fluidité",
        "dw_tension_dominant": "double-whammy en tension qui domine les double-whammies harmoniques"
    };
    const _humanList = (_vetoApplied.reasons || []).map(r => _vetoReasonsHuman[r] || r);
    synthPrompt += `\n[NOTE INTERNE astrologue — NE PAS recopier sous forme brute, intégrer dans le narratif] : malgré une arithmétique de piliers correcte, des signaux d'échec relationnel critiques sont présents (${_humanList.join(" ; ")}). Le score brut a été ajusté à la baisse (${_vetoApplied.capped_from} → ${_vetoApplied.capped_to}). NE mentionne JAMAIS le mot « veto », ni les codes techniques, ni l'arithmétique de l'ajustement. Reflète simplement cette fragilité dans le ton et la prudence du discours, sans alarmisme.\n`;
}
if (_penSum.total_penalties > 0) {
    synthPrompt += `\n⚠ PÉNALITÉS APPLIQUÉES (${_penSum.total_penalties}, total ${_penSum.total_malus || 0} pts) :\n`;
    for (const pen of (_penSum.items || [])) {
        const elemTag = pen.elem ? ` [${pen.elem}${pen.signs ? ' ' + pen.signs : ''}]` : '';
        synthPrompt += `  • ${pen.id} : ${pen.malus} pts${elemTag}\n`;
    }
}
if (_bonSum.total_bonuses > 0) {
    synthPrompt += `\n✦ BONUS APPLIQUÉS (${_bonSum.total_bonuses}, total +${_bonSum.total_bonus || 0} pts) :\n`;
    for (const bon of (_bonSum.items || [])) {
        const elemTag = bon.elem ? ` [${bon.elem}${bon.signs ? ' ' + bon.signs : ''}]` : '';
        synthPrompt += `  • ${bon.id} : +${bon.bonus} pts${elemTag}\n`;
    }
}
synthPrompt += `\nLes pénalités et bonus comportent une modulation élémentaire [elem] : « aversion » (signes adjacents, pas de qualité partagée → impact amplifié), « same_element » (résonance profonde → impact atténué), « compatible » (dialogue naturel), « incompatible » (cécité élémentaire → impact renforcé). Intègre cette nuance dans ton interprétation.\n`;
synthPrompt += `${_versionLabel} intègre : (1) compatibilité de signe fondamentale des planètes personnelles indépendamment des aspects, (2) modulation rétrogradation (planètes rétrogrades aggravent les tensions, atténuent les harmoniques), (3) réception dans les aspects (bonus quand une planète occupe la dignité de son partenaire d'aspect), (4) combuste/cazimi croisé (planète dans l'orbe du Soleil de l'autre), (5) modulation stationnaire intégrée par aspect, (6) pondération qualitative des contacts nodaux, (7) correctif de viabilité quand intensité >> fluidité (v5.0.0 durci : seuil 12 / coef 0.35 / cap 16), (8) pénalité structurelle renforcée quand 0 éléments ET 0 modes communs, (9) pilier 5 « adéquation typologique » qui mesure la pertinence de l'overlay pour la relation demandée (v4.2.0+), (10) étirement post-score asymétrique autour du pivot 55 (v5.0.0 : α=1.4 au-dessus, α=1.8 sous le pivot — empêche les faux positifs en haut de bande), (11) Pilier 6 « cohérence typologique des maisons » qui pénalise la dissonance entre score global et activation des maisons clés de la typologie (v5.0.0), (12) veto qualitatif qui cappe la bande supérieure pour les configurations d'échec critiques en typologie Amour (M7 vide + SN dominant, quartet destructeur, etc. — v5.0.0).\n`;
synthPrompt += `Utilise ce détail des 4 piliers, des pénalités ET des bonus pour structurer ta synthèse : commente les forces ET les faiblesses de chaque dimension de manière équilibrée et objective.\n\n`;

const dwPairsData = globalScoreDetail?.pilier1_aspectual?.double_whammy_harmony_pairs || [];
if (dwPairsData.length > 0) {
    synthPrompt += `### DOUBLE WHAMMIES HARMONIEUX (liens symétriques renforcés) :\n`;
    for (const dw of dwPairsData) {
        synthPrompt += `• ${dw.pair.replace("|", " ↔ ")} : ${dw.aspects.join(" / ")}\n`;
    }
    synthPrompt += `\n`;
}

synthPrompt += `### TENSION / SUPPORT PAR MAISON :\n`;
synthPrompt += `${persoStrB} → ${persoStrA} (top 6 par activation) :\n`;
for (const t of topHousesByActivationBinA) {
    const badge = typoConfig.principales.includes(t.house) ? "P" : typoConfig.secondaires.includes(t.house) ? "S" : "";
    synthPrompt += `• M${t.house}${badge ? ` [${badge}]` : ""} : T=${t.tension} / S=${t.support} (total ${t.total}, ${t.polarite})\n`;
}
synthPrompt += `${persoStrA} → ${persoStrB} (top 6 par activation) :\n`;
for (const t of topHousesByActivationAinB) {
    const badge = typoConfig.principales.includes(t.house) ? "P" : typoConfig.secondaires.includes(t.house) ? "S" : "";
    synthPrompt += `• M${t.house}${badge ? ` [${badge}]` : ""} : T=${t.tension} / S=${t.support} (total ${t.total}, ${t.polarite})\n`;
}
synthPrompt += `\n`;

if (synastricConfigurations.length > 0) {
    synthPrompt += `### CONFIGURATIONS SYNASTRIQUE INTER-CARTES :\n`;
    for (const cfg of synastricConfigurations) {
        synthPrompt += `• ${cfg.type} : ${cfg.description}\n`;
    }
    synthPrompt += `\n`;
}
if (interMinorBtoA.length > 0 || interMinorAtoB.length > 0) {
    const allMinors = [...interMinorBtoA, ...interMinorAtoB];
    const topMinors = allMinors.sort((a, b) => Math.abs(b.score) - Math.abs(a.score)).slice(0, 5);
    synthPrompt += `### ASPECTS MINEURS (résumé) : ${allMinors.length} aspects mineurs détectés.\n`;
    synthPrompt += `Top 5 : ` + topMinors.map(m => `${m.planete_source}(${m.source_personne}) ${m.aspect} ${m.planete_cible}(${m.cible_personne})`).join(" | ") + `\n`;
    synthPrompt += `[PRIORITÉ BASSE — ne développer que si pertinent pour la synthèse globale]\n\n`;
}

if (cuspAspectsBtoA.length > 0 || cuspAspectsAtoB.length > 0) {
    synthPrompt += `### ASPECTS PLANÈTES → CUSPIDES INTER-CARTES :\n`;
    const topCuspAll = [...cuspAspectsBtoA, ...cuspAspectsAtoB].sort((a, b) => b.score - a.score).slice(0, 12);
    for (const ca of topCuspAll) {
        synthPrompt += `• ${ca.planete} (${ca.source}) ${ca.aspect} cuspide M${ca.maison_cuspide} de ${ca.target} (${ca.nature}, orbe ${ca.orbe}°, score ${ca.score})\n`;
    }
    synthPrompt += `\n`;
}

synthPrompt += `### ${isEN ? 'Writing instructions' : 'Consigne de rédaction'} :\n`;
synthPrompt += isEN
    ? `Write a comprehensive synthesis of compatibility between ${persoStrA} and ${persoStrB} for a "${typologie}" relationship.\n`
    : `Rédige une synthèse globale de la compatibilité entre ${persoStrA} et ${persoStrB} pour une relation de type "${typologie}".\n`;
synthPrompt += isEN
    ? `Address ${persoStrA} using "${personneA.consigne_redaction || "Tu"}" and refer to ${persoStrB} as "${personneB.pronom_tiers || "Elle"}".\n`
    : `Adresse-toi à ${persoStrA} en "${personneA.consigne_redaction || "Tu"}" et parle de ${persoStrB} en "${personneB.pronom_tiers || "Elle"}".\n`;
synthPrompt += `${isEN ? 'Global compatibility score' : 'Le score de compatibilité global est'} ${globalScore}/100 — ${isEN ? 'contextualize this score in your synthesis.' : 'contextualise ce score dans la synthèse.'}\n`;

synthPrompt += isEN
    ? `\n[⚖ PRIORITY HIERARCHY — MANDATORY]\n`
    : `\n[⚖ HIÉRARCHIE DE PRIORITÉ — OBLIGATOIRE]\n`;
synthPrompt += isEN
    ? `TIER 1 (MUST discuss in depth): T1 inter-aspects between luminaries/personal planets, double whammies, mutual receptions, composite stelliums/T-squares.\n`
    : `NIVEAU 1 (OBLIGATOIRE, approfondir) : Inter-aspects T1 entre luminaires/planètes personnelles, double whammies, réceptions mutuelles, stelliums/T-carrés du composite.\n`;
synthPrompt += isEN
    ? `TIER 2 (Discuss if relevant): Nodal/karmic contacts, Tension/Support by house, elemental compatibility, Davison chart.\n`
    : `NIVEAU 2 (À traiter si pertinent) : Contacts nodaux/karmiques, Tension/Support par maison, compatibilité élémentaire, thème Davison.\n`;
synthPrompt += isEN
    ? `TIER 3 (Mention briefly): Declinations, antiscia, midpoints, stellar bridges, cusp aspects — illustrate but do NOT let them dominate.\n`
    : `NIVEAU 3 (Mentionner brièvement) : Déclinaisons, antiscia, midpoints, ponts stellaires, aspects cuspides — illustrer mais NE PAS laisser dominer.\n`;

synthPrompt += isEN
    ? `\n[🚫 ANTI-REDUNDANCY — CRITICAL]\nThe house-by-house analyses have ALREADY been written by separate agents. Your synthesis must NOT repeat planet-by-planet house interpretations. Focus on the GLOBAL picture: cross-cutting themes, overarching dynamics, and the relationship's narrative arc.\n`
    : `\n[🚫 ANTI-REDONDANCE — CRITIQUE]\nLes analyses maison par maison ont DÉJÀ été rédigées par des agents séparés. Ta synthèse ne doit PAS répéter les interprétations planète par planète par maison. Concentre-toi sur le TABLEAU GLOBAL : thèmes transversaux, dynamiques d'ensemble, et l'arc narratif de la relation.\n`;

synthPrompt += `\n${isEN ? 'Structure your response (funnel methodology, 5 sections) :' : 'Structure ta réponse (méthodologie en entonnoir, 5 sections) :'}\n`;
synthPrompt += isEN
    ? `1. **Individual base** (2-4 sentences) : what each person brings — temperament, attachment style, natal blocks (Saturn/Pluto afflicted) and how they may project onto the partner.\n`
        + `2. **Synastric mechanics** (3-5 key strengths + 3-5 friction zones) : house overlays, dominant inter-aspects, angular activations.\n`
        + `3. **Typological filter** : adapt the reading to "${typoConfig.label_en}" (key planets / houses) — answer only the questions that matter for THIS relationship type.\n`
        + `4. **Longevity / glue** : interpret the Longevity Index — does Saturn bind this couple ? Are there evolutive nodal contacts ? Will this last ?\n`
        + `5. **The "We" entity** (Composite + Davison) : how the relationship appears to the outside world, what it creates together, its narrative arc.\n`
        + `End with 3 concrete recommendations specific to this ${typologie} relationship — actionable, not generic.\n`
    : `1. **Socle individuel** (2-4 phrases) : ce que chacun apporte — tempérament, style d'attachement, blocages natals (Saturne/Pluton afflige) et comment ils peuvent se projeter sur le partenaire.\n`
        + `2. **Mécanique synastrique** (3-5 forces majeures + 3-5 zones de friction) : superpositions de maisons, inter-aspects dominants, activations angulaires.\n`
        + `3. **Filtre typologique** : adapte la lecture à "${typoConfig.label_fr}" (planètes / maisons clés) — réponds seulement aux questions qui comptent pour CE type de relation.\n`
        + `4. **Longévité / ciment** : interprète l'Indice de longévité — est-ce que Saturne lie ce couple ? Y a-t-il des contacts nodaux évolutifs ? Est-ce que ça va durer ?\n`
        + `5. **L'entité « Nous »** (Composite + Davison) : comment la relation apparaît au monde extérieur, ce qu'elle crée ensemble, son arc narratif.\n`
        + `Termine par 3 recommandations concrètes propres à cette relation ${typologie} — actionnables, pas génériques.\n`;
synthPrompt += isEN
    ? `\n[TOKEN BUDGET: 50-80 lines maximum. Be DENSE and STRUCTURED, not verbose. Every sentence must add analytical value.]\n`
    : `\n[TOKEN BUDGET : 50 à 80 lignes maximum. Sois DENSE et STRUCTURÉ, pas verbeux. Chaque phrase doit apporter une valeur analytique.]\n`;

const MAX_SYNTH_CHARS = 28000;
if (synthPrompt.length > MAX_SYNTH_CHARS) {
    const cutSections = [
        { tag: "NIVEAU 3", label: "T3 data" },
        { tag: "NIVEAU 2", label: "T2 data" },
        { tag: "MIDPOINTS", label: "midpoints" },
        { tag: "ANTISCIA", label: "antiscia" },
        { tag: "DÉCLINAISONS", label: "declinations" }
    ];
    for (const sec of cutSections) {
        if (synthPrompt.length <= MAX_SYNTH_CHARS) break;
        const idx = synthPrompt.lastIndexOf(sec.tag);
        if (idx > MAX_SYNTH_CHARS * 0.5) {
            synthPrompt = synthPrompt.substring(0, idx) + `[${sec.label} omitted for token budget]\n` + synthPrompt.substring(synthPrompt.indexOf("\n", idx + 200) + 1 || synthPrompt.length);
        }
    }
    if (synthPrompt.length > MAX_SYNTH_CHARS) {
        synthPrompt = synthPrompt.substring(0, MAX_SYNTH_CHARS) + `\n[... PROMPT TRONQUÉ — priorité T1/T2 préservée, T3 coupé]\n`;
    }
}

// ---- (Sections 11b/c/d déplacées avant computeGlobalScoreV3 pour éviter TDZ) ----

// ---- 12. SORTIE FUSIONNÉE (Calcul + Prepare Prompts) ----
function deriveNSSpeed(planets) {
    const nn = planets.find(p => getPlanetName(p) === "Nœud Nord");
    const ns = planets.find(p => getPlanetName(p) === "Nœud Sud");
    if (nn && ns) {
        const nnSpeed = getPlanetSpeed(nn);
        if (nnSpeed !== null) return nnSpeed;
    }
    return null;
}
const nsSpeedA = deriveNSSpeed(natalPlanetsA);
const nsSpeedB = deriveNSSpeed(natalPlanetsB);
const biWheelPlanetsA = natalPlanetsA.map(p => {
    const n = getPlanetName(p);
    let sp = getPlanetSpeed(p);
    if (n === "Nœud Sud" && sp === null && nsSpeedA !== null) sp = nsSpeedA;
    return { name: n, fullDeg: getPlanetDegree(p), sign: getPlanetSign(p), retro: getPlanetRetro(p), speed: sp, declination: getPlanetDeclination(p) };
});
const biWheelPlanetsB = natalPlanetsB.map(p => {
    const n = getPlanetName(p);
    let sp = getPlanetSpeed(p);
    if (n === "Nœud Sud" && sp === null && nsSpeedB !== null) sp = nsSpeedB;
    return { name: n, fullDeg: getPlanetDegree(p), sign: getPlanetSign(p), retro: getPlanetRetro(p), speed: sp, declination: getPlanetDeclination(p) };
});
const biWheelHousesA = extractCusps(natalHousesA);
const biWheelHousesB = extractCusps(natalHousesB);

const _inputFingerprint = (() => {
    const raw = JSON.stringify({
        a: { name: personneA.prenom, date: personneA.date_naissance, lieu: personneA.lieu_naissance },
        b: { name: personneB.prenom, date: personneB.date_naissance, lieu: personneB.lieu_naissance },
        typo: typologie,
        planetsA_count: natalPlanetsA.length,
        planetsB_count: natalPlanetsB.length,
        housesA_count: natalHousesA.length,
        housesB_count: natalHousesB.length
    });
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
        hash = ((hash << 5) - hash) + raw.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash).toString(36).toUpperCase();
})();

function detectInterceptions(houses) {
    const intercepted = [];
    const cusps = [];
    for (let h = 1; h <= 12; h++) cusps.push(((getCuspDegree(h, houses) % 360) + 360) % 360);
    for (let h = 0; h < 12; h++) {
        const c1 = cusps[h];
        const c2 = cusps[(h + 1) % 12];
        let span = c2 - c1;
        if (span <= 0) span += 360;
        for (let s = 0; s < 12; s++) {
            const signStart = s * 30;
            const signEnd = (s + 1) * 30;
            let d1 = ((signStart - c1) % 360 + 360) % 360;
            let d2 = ((signEnd - c1) % 360 + 360) % 360;
            if (d2 === 0) d2 = 360;
            if (d1 > 0 && d1 < span && d2 > d1 && d2 < span) {
                intercepted.push({ maison: h + 1, signe: SIGNES[s]?.fr || "?" });
            }
        }
    }
    return intercepted;
}
const interceptionsA = detectInterceptions(natalHousesA);
const interceptionsB = detectInterceptions(natalHousesB);

const doubleWhammyList = (() => {
    const list = [];
    const aspByPair = {};
    const _normAxis = (name) => {
        if (name === "Imum Coeli") return "Milieu du Ciel";
        if (name === "Descendant") return "Ascendant";
        if (name === "Nœud Sud") return "Nœud Nord";
        return name;
    };
    const allAsps = [...interAspectsTier1BtoA_enriched, ...interAspectsTier1AtoB_enriched];
    for (const a of allAsps) {
        const pair = [_normAxis(a.planete_source), _normAxis(a.planete_cible)].sort().join("|");
        if (!aspByPair[pair]) aspByPair[pair] = [];
        aspByPair[pair].push(a);
    }
    for (const [pair, group] of Object.entries(aspByPair)) {
        const hasBothDirs = group.some(a => a.source_personne !== group[0].source_personne);
        if (!hasBothDirs || group.length < 2) continue;
        const [p1, p2] = pair.split("|");
        const natures = [...new Set(group.map(a => a.nature))];
        list.push({ pair: `${p1}–${p2}`, planets: [p1, p2], aspects: group.map(a => ({ aspect: a.aspect, nature: a.nature, orbe: a.orbe, source: a.source_personne })), natures, count: group.length });
    }
    return list.sort((a, b) => b.count - a.count);
})();

const _fullSynData = {
    meta: {
        personne_a: personneA,
        personne_b: personneB,
        typologie: typologie,
        typoConfig: typoConfig,
        langue: langue,
        date_relation: dateRelation,
        maisons_relevantes: maisonsRelevantes,
        natal_summary_a: natalSummaryA,
        natal_summary_b: natalSummaryB,
        input_hash: _inputFingerprint,
        computed_at: new Date().toISOString(),
        orbs_table: ORBS_SYNASTRY,
        planet_weights: PLANET_WEIGHT,
        declination_orbs: { standard: typeof DECL_ORB_STANDARD !== 'undefined' ? DECL_ORB_STANDARD : 1, luminaire: typeof DECL_ORB_LUMINAIRE !== 'undefined' ? DECL_ORB_LUMINAIRE : 1.5 },
        antiscia_orb: typeof ANTISCIA_ORB !== 'undefined' ? ANTISCIA_ORB : 1.5,
        oob_threshold: typeof OOB_THRESHOLD !== 'undefined' ? OOB_THRESHOLD : 23.44
    },
    biwheel: {
        planets_a: biWheelPlanetsA,
        planets_b: biWheelPlanetsB,
        cusps_a: biWheelHousesA,
        cusps_b: biWheelHousesB
    },
    overlay_b_in_a: overlayBinA,
    overlay_a_in_b: overlayAinB,
    inter_aspects_tier1_b_to_a: interAspectsTier1BtoA_enriched,
    inter_aspects_tier1_a_to_b: interAspectsTier1AtoB_enriched,
    inter_aspects_tier2_b_to_a: interAspectsTier2BtoA_enriched,
    inter_aspects_tier2_a_to_b: interAspectsTier2AtoB_enriched,
    inter_aspects_all_b_to_a: [...interAspectsTier1BtoA_enriched, ...interAspectsTier2BtoA_enriched],
    inter_aspects_all_a_to_b: [...interAspectsTier1AtoB_enriched, ...interAspectsTier2AtoB_enriched],
    inter_aspects_minor_b_to_a: interMinorBtoA,
    inter_aspects_minor_a_to_b: interMinorAtoB,
    cusp_aspects_b_to_a: cuspAspectsBtoA,
    cusp_aspects_a_to_b: cuspAspectsAtoB,
    nodal_contacts_a: nodalContactsA,
    nodal_contacts_b: nodalContactsB,
    cross_receptions: crossReceptions,
    signature_aspects: signatureAspects,
    m7_cross_analysis: m7CrossAnalysis,
    synastry_almuten: synastryAlmuten,
    element_compatibility: elementCompat,
    profections: profections,
    moon_terms: moonTerms,
    house_almuten_a: houseAlmutenA,
    house_almuten_b: houseAlmutenB,
    composite: compositeChart,
    composite_antiscia: compositeAntiscia,
    composite_configurations: compositeConfigs,
    synastric_configurations: synastricConfigurations,
    declinations: {
        parallels: declData.parallels,
        contra_parallels: declData.contraParallels,
        oob: declData.oob,
        decl_planetes_a: declData.decl_planetes_a,
        decl_planetes_b: declData.decl_planetes_b
    },
    antiscia: allAntiscia,
    fixed_star_bridges: fixedStarBridges,
    etoile_matches_a: etoileMatchesA,
    etoile_matches_b: etoileMatchesB,
    etoile_cusp_matches_a: etoileCuspMatchesA,
    etoile_cusp_matches_b: etoileCuspMatchesB,
    paran_results_a: enrichedParanA,
    paran_results_b: enrichedParanB,
    cross_paran_bridges: crossParanBridges,
    hayz: allHayz,
    midpoints: allMidpoints,
    midpoint_convergence_clusters: planetaryPictures,
    vertex_contacts: allVertexContacts,
    cross_sensitivity: crossSensitivity,
    cross_sabian: crossSabian,
    davison: davisonChart,
    global_score: globalScore,
    global_score_detail: globalScoreDetail,
    dual_score: globalScoreResult.dual_score || {},
    natal_blocks_a: natalBlocksA,
    natal_blocks_b: natalBlocksB,
    shared_natal_blocks: sharedNatalBlocks,
    longevity_index: longevityIndex,
    house_compensation_log: houseCompensationLog,
    venus_mars_contacts: venusMarsContacts,
    venus_mars_alert_active: venusMarsAlertActive,
    guru_complex_alerts: guruComplexAlerts,
    adversity_index: adversityIndex,
    directional_weights: _directionalWeights,
    typology_signature_bonus: _typologySignatureBonus,
    harmonic_signature_bonus: _harmonicSignatureBonus,
    intellectual_signature_bonus: _intellectualSignatureBonus,
    key_house_rulers_analysis: keyHouseRulersAnalysis,
    accidental_dignity_a: accDignityA,
    accidental_dignity_b: accDignityB,
    nhri_a: nhriA,
    nhri_b: nhriB,
    cross_dispositors: crossDispositors,
    stationary_planets: stationaryAll,
    interceptions_a: interceptionsA,
    interceptions_b: interceptionsB,
    double_whammies: doubleWhammyList,
    house_rulers_a: houseRulersA,
    house_rulers_b: houseRulersB,
    scores: {
        houses_b_in_a: houseScoresBinA,
        houses_a_in_b: houseScoresAinB,
        houses_norm_b_in_a: houseNormBinA,
        houses_norm_a_in_b: houseNormAinB,
        top_houses_b_in_a: topHousesBinA,
        top_houses_a_in_b: topHousesAinB,
        house_details_b_in_a: houseDetailsBinA,
        house_details_a_in_b: houseDetailsAinB,
        tension_support_b_in_a: houseTSBinA,
        tension_support_a_in_b: houseTSAinB,
        top_activation_b_in_a: topHousesByActivationBinA,
        top_activation_a_in_b: topHousesByActivationAinB,
        // v6.0.0 — double scoring (Harmony, Intensity), source de vérité côté UI
        houses_hi_b_in_a: houseHIBinA,
        houses_hi_a_in_b: houseHIAinB
    },
    prompts_a: maisonsResultA,
    prompts_b: maisonsResultB,
    synthese_prompt: {
        prompt_system: systemPromptBase,
        prompt_user: synthPrompt
    },
    stats_a: statsA,
    stats_b: statsB,
    configurations_a: configurationsA,
    configurations_b: configurationsB
};

// ---- 12b. PREPARE PROMPTS — Distribution en 6+6+1 slots (ex N8N SYN2) ----
const _CONSIGNE_MAISON = `\n\n---\nCONSIGNE DE RÉDACTION\n- Rédige l'analyse astrologique complète et profonde de cette dimension synastrique.\n- Respecte scrupuleusement le pronom d'adresse (tu/vous/il/elle) et les accords de genre définis dans tes instructions système. Ne commence JAMAIS par une formule de salutation. Démarre immédiatement par l'analyse.\n\nSTRUCTURE DE TA REPONSE en utilisant OBLIGATOIREMENT les balises Markdown suivantes, sans exception :\n- ## Introduction ## — contexte et énergie globale de la maison dans la synastrie.\n- ## 1) Titre ##, ## 2) Titre ##... — pour chaque dynamique clé (superpositions, inter-aspects, contacts nodaux).\n- ### 1.1) Sous Titre ###, ### 1.2) Sous Titre ###... — pour les développements.\n- ## Conclusion ## — synthèse des enjeux relationnels et recommandations pratiques.\nRÈGLE ABSOLUE : tout titre commence par ## ET se termine par ##. Tout sous-titre commence par ### ET se termine par ###. N'utilise JAMAIS **gras** pour écrire un titre.\nN'écris JAMAIS un titre sans ses balises ouvrantes ET fermantes.`;

const _CONSIGNE_SYNTH = `\n\n---\nCONSIGNE DE RÉDACTION\n- Rédige la synthèse globale et finale de cette synastrie. Relie les dynamiques de l'ensemble des maisons pour dégager les grands axes de la compatibilité.\n- Respecte scrupuleusement le pronom d'adresse. Ne commence JAMAIS par une formule de salutation.\n\nSTRUCTURE :\n- ## Introduction ## — dynamique fondamentale de la relation et signature synastrique.\n- ## 1) Titre ##, ## 2) Titre ##... — grands thèmes transversaux (forces, défis, karma, composite, conseils).\n- ## Conclusion ## — trajectoire relationnelle, conseils centraux et ouverture.\nRÈGLE ABSOLUE : tout titre commence par ## ET se termine par ##. N'utilise JAMAIS **gras** pour un titre.`;

const _SKIP_SLOT = {
    active: false,
    prompt_system: 'Tu es un assistant.',
    prompt_user: 'Réponds uniquement : {"skipped": true}',
    house: 0, label: '—', score: 0, category: 'skip'
};

const _promptsA_sorted = Object.entries(maisonsResultA)
    .map(([h, d]) => ({ house: parseInt(h), ...d }))
    .sort((a, b) => (b.score || 0) - (a.score || 0));

const _promptsB_sorted = Object.entries(maisonsResultB)
    .map(([h, d]) => ({ house: parseInt(h), ...d }))
    .sort((a, b) => (b.score || 0) - (a.score || 0));

const _slotResult = {
    ..._fullSynData,
    _global_system_prompt: systemPromptBase,
    _meta: {
        typo: typologie,
        persoA: personneA.prenom,
        persoB: personneB.prenom,
        slots_a: Math.min(_promptsA_sorted.length, 6),
        slots_b: Math.min(_promptsB_sorted.length, 6),
        langue: langue
    },
    _synRef: {
        overlay_b_in_a: overlayBinA,
        overlay_a_in_b: overlayAinB,
        house_rulers_a: houseRulersA,
        house_rulers_b: houseRulersB,
        global_score: globalScore,
        global_score_detail: globalScoreDetail,
        // v5.0.0 — dual_score et version doivent être propagés à _synRef pour que
        // Reassemble SYN puis les rapports HTML (Tech, Final, Données techniques)
        // puissent afficher Fluidité/Intensité, la note de viabilité et la
        // version moteur correcte. Avant ce fix, dual_score n'existait que sur
        // l'output principal du Super noeud Syn (perdu après Reassemble SYN).
        dual_score: globalScoreResult.dual_score || {},
        version: globalScoreResult.version || "v6.1.0",
        // v6.1.0 — méthodologie en entonnoir : blocages natals + longévité
        natal_blocks_a: natalBlocksA,
        natal_blocks_b: natalBlocksB,
        shared_natal_blocks: sharedNatalBlocks,
        longevity_index: longevityIndex,
        house_compensation_log: houseCompensationLog,
        venus_mars_contacts: venusMarsContacts,
        venus_mars_alert_active: venusMarsAlertActive,
        guru_complex_alerts: guruComplexAlerts,
        adversity_index: adversityIndex,
        directional_weights: _directionalWeights,
        typology_signature_bonus: _typologySignatureBonus,
        scores_par_maison_a: houseScoresAinB,
        scores_par_maison_b: houseScoresBinA,
        etoile_matches_a: etoileMatchesA,
        etoile_matches_b: etoileMatchesB,
        etoile_cusp_matches_a: etoileCuspMatchesA,
        etoile_cusp_matches_b: etoileCuspMatchesB,
        scores: _fullSynData.scores,
        meta: _fullSynData.meta,
        inter_aspects_minor_b_to_a: interMinorBtoA,
        inter_aspects_minor_a_to_b: interMinorAtoB,
        cusp_aspects_b_to_a: cuspAspectsBtoA,
        cusp_aspects_a_to_b: cuspAspectsAtoB,
        synastric_configurations: synastricConfigurations,
        cross_dispositors: crossDispositors,
        cross_receptions: crossReceptions,
        signature_aspects: signatureAspects,
        m7_cross_analysis: m7CrossAnalysis,
        synastry_almuten: synastryAlmuten
    }
};

// v4.2.0 — B5 : exposer le score NORMALIZED (rapporté au théorique de la maison,
// déjà borné [0,100] par construction) au lieu du brut weighted. Le brut était
// non comparable entre couples et causait des saturations à 150+ ou des
// négatifs. La normalisation `weighted / theoretical * 100` est calculée par
// computeHouseScore dès l'origine ; elle reste relative au pool d'overlay
// effectif de chaque maison, donc plus juste pour comparer la qualité d'un
// activement entre deux couples. `score_raw` est conservé pour debug.
//
// Ancien code v4.1.0 (B4) : `_boundSlotScore(p.score)` qui bornait le brut.
// Nouveau code v4.2.0 (B5) : `p.normalized ?? 0`. Plus besoin de borner.
function _safeSlotScore(s) {
    if (typeof s !== "number" || !Number.isFinite(s)) return 0;
    return Math.max(0, Math.min(100, s));
}

for (let i = 0; i < 6; i++) {
    if (_promptsA_sorted[i]) {
        const p = _promptsA_sorted[i];
        _slotResult[`slot_a_${i+1}`] = {
            active: true,
            prompt_system: p.prompt_system,
            prompt_user: p.prompt_user + _CONSIGNE_MAISON,
            house: p.house,
            label: `Maison ${p.house} de ${personneA.prenom || 'A'} ${(personneA.nom || '').toUpperCase()}`,
            score: _safeSlotScore(p.normalized),
            score_raw: p.score,
            is_principale: p.is_principale,
            category: 'perspective_a'
        };
    } else {
        _slotResult[`slot_a_${i+1}`] = { ..._SKIP_SLOT };
    }
}

for (let i = 0; i < 6; i++) {
    if (_promptsB_sorted[i]) {
        const p = _promptsB_sorted[i];
        _slotResult[`slot_b_${i+1}`] = {
            active: true,
            prompt_system: p.prompt_system,
            prompt_user: p.prompt_user + _CONSIGNE_MAISON,
            house: p.house,
            label: `Maison ${p.house} de ${personneB.prenom || 'B'} ${(personneB.nom || '').toUpperCase()}`,
            score: _safeSlotScore(p.normalized),
            score_raw: p.score,
            is_principale: p.is_principale,
            category: 'perspective_b'
        };
    } else {
        _slotResult[`slot_b_${i+1}`] = { ..._SKIP_SLOT };
    }
}

_slotResult.slot_synth = {
    active: true,
    prompt_system: systemPromptBase,
    prompt_user: synthPrompt + _CONSIGNE_SYNTH,
    house: 0,
    label: `Synthèse ${personneA.prenom || 'A'} & ${personneB.prenom || 'B'}`,
    score: null,
    category: 'synthese'
};

if (AUDIT_MODE) {
    _slotResult._audit = {
        input_hash: _inputFingerprint,
        computed_at: new Date().toISOString(),
        counts: {
            natal_planets_a: natalPlanetsA.length,
            natal_planets_b: natalPlanetsB.length,
            natal_houses_a: natalHousesA.length,
            natal_houses_b: natalHousesB.length,
            inter_aspects_t1_total: interAspectsTier1BtoA_enriched.length + interAspectsTier1AtoB_enriched.length,
            inter_aspects_t2_total: (interAspectsTier2BtoA?.length || 0) + (interAspectsTier2AtoB?.length || 0),
            cross_receptions: crossReceptions.length,
            signature_aspects: signatureAspects.length,
            cusp_aspects_total: (cuspAspectsBtoA?.length || 0) + (cuspAspectsAtoB?.length || 0),
            nodal_contacts: (nodalContactsA?.length || 0) + (nodalContactsB?.length || 0),
            midpoints: allMidpoints.length,
            parallels: declData.parallels.length,
            contra_parallels: declData.contraParallels.length,
            oob: declData.oob.length,
            composite_configs: compositeConfigs.length
        },
        scoring_detail: globalScoreDetail,
        almuten: synastryAlmuten,
        m7_cross: m7CrossAnalysis,
        prompt_lengths: {
            synth_prompt_chars: synthPrompt.length,
            system_prompt_chars: systemPromptBase.length
        }
    };
}

return [{ json: _slotResult }];
