// ==========================================
// NOEUD CENTRAL SYNASTRIE v1.0
// Superpositions en maisons (bidirectionnel)
// Inter-aspects B↔A et A↔B
// Contacts nodaux + Chiron
// Thème composite (mi-points)
// Grille typologique (8 typologies)
// Scoring composite
// Génération prompts LLM par maison + synthèse
// =========================-=================

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
        planetes_cles: ["Vénus", "Mars", "Lune", "Pluton", "Nœud Nord"],
        label_fr: "Relation romantique / amoureuse",
        label_en: "Romantic relationship"
    },
    "Business": {
        principales: [7, 2, 8, 10],
        secondaires: [6, 11],
        ombre: [12, 8, 1],
        ombre_nuance: { 6: "hierarchy_ok" },
        planetes_cles: ["Saturne", "Jupiter", "Mercure", "MC"],
        label_fr: "Partenariat professionnel / associé",
        label_en: "Business partnership"
    },
    "Parent / Enfant": {
        principales: [4, 10, 5],
        secondaires: [12, 8, 2],
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

const typoConfig = TYPOLOGY_GRID[typologie] || TYPOLOGY_GRID["Amour"];
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
            const pen = Math.min(plutonHardPersonal.length, 4) * 0.9 * dMult;
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
            const pen = Math.min(marsHardLuminaires.length, 3) * 0.7 * dMult;
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
            const pen = Math.min(uranusHardAffective.length, 3) * 0.6 * dMult;
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
            const pen = Math.min(doubleWhammyTCount, 3) * 1.0;
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
    const nnContacts = (nodal || []).filter(n => n.noeud && n.noeud.includes("Nord"));
    const snContacts = (nodal || []).filter(n => n.noeud && (n.noeud.includes("Sud") || n.noeud.includes("South")));
    const snDominance = snContacts.length - nnContacts.length;
    if (snDominance >= 2) {
        const pen = Math.min(snDominance, 4) * 0.5;
        p2 -= pen;
        penalties.p2.push({ id: "south_node_dominance", nn: nnContacts.length, sn: snContacts.length, malus: -pen });
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
    compScore = Math.max(0, Math.min(12, compScore));

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

        davScore = Math.max(0, Math.min(8, davScore));
        detail.pilier3.davison_ratio = +davHealth.ratio.toFixed(3);
        detail.pilier3.davison_config_bonus = davHealth.configBonus;
    } else {
        davScore = 4;
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
        const keyPlanets = typoConf.planetes_cles || [];
        const keyAsp = allAsp.filter(a =>
            keyPlanets.includes(a.planete_source) || keyPlanets.includes(a.planete_cible)
        );
        const keyHarmony = keyAsp.filter(a => a.nature === "harmonie" || a.nature === "fusion").length;
        const keyTension = keyAsp.filter(a => a.nature === "tension").length;
        p4 += Math.min(keyHarmony, 5) * 0.5;
        p4 -= Math.min(keyTension, 3) * 0.3;
        detail.pilier4.typo_key_harmony = keyHarmony;
        detail.pilier4.typo_key_tension = keyTension;

        // P4-BONUS/PENALTY: Typological house activation
        let activatedPrincipal = 0;
        let emptyPrincipal = 0;
        for (const h of principalHouses) {
            const countA = (ovBA && ovBA[h]) ? ovBA[h].length : 0;
            const countB = (ovAB && ovAB[h]) ? ovAB[h].length : 0;
            if (countA > 0 || countB > 0) activatedPrincipal++;
            else emptyPrincipal++;
        }
        if (activatedPrincipal === principalHouses.length) {
            p4 += 1.5;
            detail.pilier4.typo_all_principal_activated = true;
        }
        if (emptyPrincipal >= 2 && principalHouses.length >= 3) {
            const pen = emptyPrincipal * 0.6;
            p4 -= pen;
            penalties.p4.push({ id: "principal_houses_empty", empty: emptyPrincipal, total: principalHouses.length, malus: -pen });
        }
        detail.pilier4.typo_principal_activated = activatedPrincipal;
        detail.pilier4.typo_principal_empty = emptyPrincipal;

        // P4-PENALTY: Overlay planets in exile in principal houses
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

    // ====== SCORE FINAL (normalisation 105→100) ======
    const raw = (detail.pilier1.total || 0) + p2 + p3 + p4;
    const final = Math.max(0, Math.min(100, Math.round(raw * 100 / 105)));

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

    let intensite = 8;
    intensite += Math.min(_dsTotalW / 2.5, 25);
    intensite += Math.min(_dsExacts, 8) * 2;
    intensite += Math.min(_dsKarmic, 8) * 1.2;
    intensite += Math.min(_dsDwH + _dsDwT, 5) * 2.5;
    intensite += Math.min(totalPenalties.length + totalBonuses.length, 12) * 1.0;
    intensite += Math.min(_dsP2P, 10) * 0.8;
    intensite += Math.min(_dsShadow, 4) * 1.5;
    intensite = Math.max(0, Math.min(100, Math.round(intensite)));

    // ====== CORRECTIF DE VIABILITÉ RELATIONNELLE ======
    // Quand l'intensité dépasse largement la fluidité, le score brut
    // surestime la qualité vécue de la relation. On applique une correction
    // proportionnelle au déséquilibre, toutes typologies confondues.
    const _viabDelta = Math.max(0, intensite - fluidite - 15);
    const _viabCorrection = Math.min(_viabDelta * 0.25, 15);
    const finalCorrected = Math.max(0, Math.min(100, Math.round(final - _viabCorrection)));

    const _dsFluidLabel = fluidite >= 70 ? "Très fluide" : fluidite >= 50 ? "Fluide" : fluidite >= 35 ? "Modéré" : "Tendu";
    const _dsFluidLabelEN = fluidite >= 70 ? "Very fluid" : fluidite >= 50 ? "Fluid" : fluidite >= 35 ? "Moderate" : "Tense";
    const _dsIntenLabel = intensite >= 75 ? "Très intense" : intensite >= 55 ? "Intense" : intensite >= 35 ? "Modéré" : "Calme";
    const _dsIntenLabelEN = intensite >= 75 ? "Very intense" : intensite >= 55 ? "Intense" : intensite >= 35 ? "Moderate" : "Calm";

    return {
        score: finalCorrected,
        score_brut: final,
        fluidite: fluidite,
        intensite: intensite,
        dual_score: {
            fluidite: { score: fluidite, label: _dsFluidLabel, label_en: _dsFluidLabelEN },
            intensite: { score: intensite, label: _dsIntenLabel, label_en: _dsIntenLabelEN },
            profil: `${_dsFluidLabel} / ${_dsIntenLabel}`,
            profil_en: `${_dsFluidLabelEN} / ${_dsIntenLabelEN}`,
            viability_correction: _viabCorrection > 0 ? { delta: _viabDelta, correction: -Math.round(_viabCorrection * 10) / 10, score_brut: final, score_corrige: finalCorrected } : null
        },
        version: "v4.0.0",
        qualitative_band: getQualitativeBand(finalCorrected, typoConf?.label_fr || ""),
        detail: {
            pilier1_aspectual: detail.pilier1,
            pilier2_karmique: detail.pilier2,
            pilier3_composite: detail.pilier3,
            pilier4_structural: detail.pilier4,
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

    if (isParent) {
        if (score >= 78) return { band: "Harmonie naturelle", desc_fr: "Lien parent-enfant fluide, compréhension instinctive mutuelle", color: "#16a34a" };
        if (score >= 65) return { band: "Lien profond avec défis structurants", desc_fr: "Relation formatrice, forte connexion karmique avec des zones de friction nécessaires à la croissance", color: "#2563eb" };
        if (score >= 50) return { band: "Relation complexe mais transformatrice", desc_fr: "Des incompréhensions fondamentales coexistent avec un lien profond — la relation forge le caractère", color: "#d97706" };
        return { band: "Tensions structurelles profondes", desc_fr: "Des dynamiques lourdes nécessitant un travail conscient — le lien karmique existe mais avec des schémas répétitifs", color: "#dc2626" };
    }
    if (isAmour) {
        if (score >= 80) return { band: "Alchimie remarquable", desc_fr: "Compatibilité exceptionnelle sur tous les plans — magnétisme, harmonie, profondeur", color: "#16a34a" };
        if (score >= 65) return { band: "Bonne compatibilité avec zones de croissance", desc_fr: "Attrait réel et fondations solides, mais des ajustements nécessaires", color: "#2563eb" };
        if (score >= 50) return { band: "Relation stimulante et exigeante", desc_fr: "La passion coexiste avec les frictions — potentiel de croissance mutuelle si les deux s'engagent", color: "#d97706" };
        return { band: "Tensions dominantes", desc_fr: "Les défis relationnels l'emportent — relation possible mais énergivore", color: "#dc2626" };
    }
    if (isBiz) {
        if (score >= 75) return { band: "Synergie professionnelle forte", desc_fr: "Compétences complémentaires, vision alignée", color: "#16a34a" };
        if (score >= 60) return { band: "Partenariat viable avec ajustements", desc_fr: "Base solide mais des domaines de friction à anticiper", color: "#2563eb" };
        if (score >= 45) return { band: "Collaboration exigeante", desc_fr: "Nécessite des rôles bien définis et une communication structurée", color: "#d97706" };
        return { band: "Risque de blocages", desc_fr: "Les dynamiques de pouvoir et les incompatibilités structurelles dominent", color: "#dc2626" };
    }
    if (score >= 75) return { band: "Compatibilité forte", desc_fr: "Lien naturel et fluide", color: "#16a34a" };
    if (score >= 60) return { band: "Compatibilité modérée", desc_fr: "Des forces et des défis équilibrés", color: "#2563eb" };
    if (score >= 45) return { band: "Relation de croissance", desc_fr: "Des frictions formatrices coexistent avec un potentiel réel", color: "#d97706" };
    return { band: "Compatibilité difficile", desc_fr: "Les tensions dominent — nécessite un effort conscient", color: "#dc2626" };
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
const globalScore = globalScoreResult.score;
const globalScoreDetail = { ...globalScoreResult.detail, qualitative_band: globalScoreResult.qualitative_band };

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

function computeHouseScore(houseNum, overlay, interAspects, sourcePlanets, targetHouses, houseRulers, accDig, interAspectsT2) {
    const isPrincipale = typoConfig.principales.includes(houseNum);
    const isSecondaire = typoConfig.secondaires.includes(houseNum);
    const entries = overlay[houseNum] || [];
    const typoPriority = isPrincipale ? 1.3 : isSecondaire ? 1.15 : 1.0;

    const ruler = houseRulers?.[houseNum];

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
        const weighted = rulerScore * typoPriority;
        const norm = Math.max(0, Math.min(40, Math.round(((rulerScore + 5) / 12) * 40)));
        return {
            score: +(Math.round(weighted * 10) / 10),
            normalized: norm,
            empty: true,
            detail: rulerDetail,
            breakdown: { overlayPos: 0, overlayNeg: 0, aspPos: 0, aspNeg: 0, rulerBonus: rulerScore, typoPriority, theoretical: 20, entryCount: 0 }
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

    const rawPositive = overlayPos + aspPos;
    const rawNegative = overlayNeg + aspNeg;
    const rawTotal = rawPositive + rawNegative + rulerBonus + clusterPenalty;

    const weighted = rawTotal * typoPriority;

    const overlayTheoBase = entries.reduce((sum, e) => {
        if (e.tier <= 1) return sum + 18;
        if (e.tier <= 2) return sum + 8;
        return sum + 4;
    }, 0);
    const aspTheoBase = entries.length * 3;
    const theoreticalBase = overlayTheoBase + aspTheoBase;
    const theoretical = Math.max(theoreticalBase * typoPriority, 20);
    const normalized = Math.max(0, Math.min(100, Math.round((weighted / theoretical) * 100)));

    return {
        score: +(Math.round(weighted * 10) / 10),
        normalized: normalized,
        empty: false,
        detail: null,
        breakdown: { overlayPos: +overlayPos.toFixed(1), overlayNeg: +overlayNeg.toFixed(1), aspPos: +aspPos.toFixed(1), aspNeg: +aspNeg.toFixed(1), rulerBonus: +rulerBonus.toFixed(2), typoPriority, theoretical: +theoretical.toFixed(1), entryCount: entries.length }
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
for (let h = 1; h <= 12; h++) {
    const rBinA = computeHouseScore(h, overlayBinA, interAspectsBtoA, natalPlanetsB, natalHousesA, houseRulersA, accDignityA, interAspectsTier2BtoA);
    const rAinB = computeHouseScore(h, overlayAinB, interAspectsAtoB, natalPlanetsA, natalHousesB, houseRulersB, accDignityB, interAspectsTier2AtoB);
    houseScoresBinA[h] = rBinA.score;
    houseScoresAinB[h] = rAinB.score;
    houseNormBinA[h] = rBinA.normalized;
    houseNormAinB[h] = rAinB.normalized;
    houseDetailsBinA[h] = rBinA;
    houseDetailsAinB[h] = rAinB;
    houseTSBinA[h] = _preHouseTSBinA[h];
    houseTSAinB[h] = _preHouseTSAinB[h];
}

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
    prompt_user += `${isEN ? 'Relevance score for this house' : 'Score de pertinence de cette maison'} : ${normScoreA}/100\n`;
    prompt_user += `${isEN ? 'Tension/Support' : 'Tension/Support'} : T=${tsA.tension} / S=${tsA.support} (${isEN ? 'polarity' : 'polarité'}: ${tsA.polarite})\n`;
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
    prompt_user += `${isEN ? 'Relevance score' : 'Score de pertinence'} : ${normScoreB}/100\n`;
    prompt_user += `${isEN ? 'Tension/Support' : 'Tension/Support'} : T=${tsB.tension} / S=${tsB.support} (${isEN ? 'polarity' : 'polarité'}: ${tsB.polarite})\n`;
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

let synthPrompt = `${langueInstr}## SYNTHÈSE DE COMPATIBILITÉ — ${persoStrA} & ${persoStrB}\n`;
synthPrompt += `### Type de relation analysé : ${typoConfig.label_fr}\n`;
if (roleA || roleB) {
    synthPrompt += `### Rôles : ${roleA ? `${persoStrA} = ${roleA}` : ''}${roleA && roleB ? ' · ' : ''}${roleB ? `${persoStrB} = ${roleB}` : ''}\n`;
}
synthPrompt += `\n`;

synthPrompt += `### TOP INTER-ASPECTS MAJEURS (impact de ${persoStrB} sur ${persoStrA}) :\n`;
synthPrompt += interAspectsTier1BtoA_enriched.slice(0, 10).map(a => formatAspectRich(a, persoStrB, persoStrA)).join("\n") + "\n\n";

synthPrompt += `### TOP INTER-ASPECTS MAJEURS (impact de ${persoStrA} sur ${persoStrB}) :\n`;
synthPrompt += interAspectsTier1AtoB_enriched.slice(0, 10).map(a => formatAspectRich(a, persoStrA, persoStrB)).join("\n") + "\n\n";

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
if (fixedStarBridges.length > 0) {
    synthPrompt += `### PONTS STELLAIRES (Étoiles Fixes Communes) :\n`;
    synthPrompt += fixedStarBridges.slice(0, 6).map(b => `• ★ ${b.etoile} : ${b.planete_a} (${b.personne_a}) ↔ ${b.planete_b} (${b.personne_b}) — résonance stellaire ${b.nature_etoile || ''}`).join("\n") + "\n\n";
}

// P1.5 — Antiscia dans la synthèse
if (allAntiscia.length > 0) {
    synthPrompt += `### ANTISCIA / CONTRA-ANTISCIA INTER-CARTES :\n`;
    synthPrompt += allAntiscia.slice(0, 8).map(a => `• ${a.p1} (${a.personne1}) ${a.type} ${a.p2} (${a.personne2}) — orbe ${a.orbe}° miroir en ${a.signe_miroir}`).join("\n") + "\n\n";
}

synthPrompt += `### THÈME COMPOSITE (l'entité relationnelle) :\n`;
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

// P3.1 — Davison dans la synthèse
if (davisonChart && davisonChart.planetes.length > 0) {
    synthPrompt += `### THÈME DAVISON (date/lieu mi-chemin) :\n`;
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

// P3.2 — Score global v3 avec détail piliers + pénalités
const qualBand = globalScoreResult.qualitative_band || {};
const _ds = globalScoreResult.dual_score || {};
synthPrompt += isEN
    ? `### GLOBAL COMPATIBILITY SCORE: ${globalScore}/100 (${globalScoreResult.version || "v4.0.0"})\n`
    : `### SCORE DE COMPATIBILITÉ GLOBAL : ${globalScore}/100 (${globalScoreResult.version || "v4.0.0"})\n`;
synthPrompt += isEN
    ? `Interpretation: **${qualBand.band || "N/A"}** — ${qualBand.desc_en || qualBand.desc_fr || ""}\n`
    : `Interprétation : **${qualBand.band || "N/A"}** — ${qualBand.desc_fr || ""}\n`;
synthPrompt += isEN
    ? `### RELATIONAL PROFILE: Fluidity ${_ds.fluidite?.score || '?'}/100 (${_ds.fluidite?.label_en || '?'}) — Intensity ${_ds.intensite?.score || '?'}/100 (${_ds.intensite?.label_en || '?'})\n`
    : `### PROFIL RELATIONNEL : Fluidité ${_ds.fluidite?.score || '?'}/100 (${_ds.fluidite?.label || '?'}) — Intensité ${_ds.intensite?.score || '?'}/100 (${_ds.intensite?.label || '?'})\n`;
synthPrompt += isEN
    ? `→ Fluidity measures the natural harmony and relational comfort. Intensity measures the total energetic charge (passion, karma, transformation). High scores in both = alchemy. High intensity + low fluidity = transformative but demanding relationship. Low intensity + high fluidity = comfortable but not transformative.\n`
    : `→ La Fluidité mesure l'harmonie naturelle et le confort relationnel. L'Intensité mesure la charge énergétique totale (passion, karma, transformation). Un score élevé des deux = alchimie. Haute intensité + faible fluidité = relation transformatrice mais exigeante. Faible intensité + haute fluidité = relation confortable mais peu transformatrice.\n`;
if (_ds.viability_correction) {
    synthPrompt += isEN
        ? `⚠ VIABILITY CORRECTION: The raw score (${_ds.viability_correction.score_brut}) was reduced by ${_ds.viability_correction.correction} pts due to the intensity/fluidity imbalance (delta=${_ds.viability_correction.delta}). The corrected score better reflects the lived reality of this relationship.\n`
        : `⚠ CORRECTIF DE VIABILITÉ : Le score brut (${_ds.viability_correction.score_brut}) a été réduit de ${_ds.viability_correction.correction} pts en raison du déséquilibre intensité/fluidité (delta=${_ds.viability_correction.delta}). Le score corrigé reflète mieux la réalité vécue de cette relation.\n`;
}
const _p1 = globalScoreDetail.pilier1_aspectual || {};
const _p2 = globalScoreDetail.pilier2_karmique || {};
const _p3 = globalScoreDetail.pilier3_composite || {};
const _p4 = globalScoreDetail.pilier4_structural || {};
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
synthPrompt += `v4.0.0 intègre : (1) compatibilité de signe fondamentale des planètes personnelles indépendamment des aspects, (2) modulation rétrogradation (planètes rétrogrades aggravent les tensions, atténuent les harmoniques), (3) réception dans les aspects (bonus quand une planète occupe la dignité de son partenaire d'aspect), (4) combuste/cazimi croisé (planète dans l'orbe du Soleil de l'autre), (5) modulation stationnaire intégrée par aspect, (6) pondération qualitative des contacts nodaux, (7) correctif de viabilité quand intensité >> fluidité, (8) pénalité structurelle renforcée quand 0 éléments ET 0 modes communs.\n`;
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

synthPrompt += `\n${isEN ? 'Structure your response:' : 'Structure ta réponse :'}\n`;
synthPrompt += isEN
    ? `1. Core strengths (3-5 key points, based on T1 aspects and activated houses)\n2. Friction zones (3-5 key points, based on tense aspects and penalties)\n3. Karmic & evolutionary dimension (nodal, Chiron, receptions — concise)\n4. The composite entity (what the relationship creates together)\n5. Concrete recommendations (3 actionable points for this ${typologie} relationship)\n`
    : `1. Forces fondamentales (3-5 points clés, basés sur les aspects T1 et maisons activées)\n2. Zones de friction (3-5 points clés, basés sur les aspects tendus et pénalités)\n3. Dimension karmique & évolutive (nodal, Chiron, réceptions — concis)\n4. L'entité composite (ce que la relation crée ensemble)\n5. Recommandations concrètes (3 points actionnables pour cette relation ${typologie})\n`;
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
        top_activation_a_in_b: topHousesByActivationAinB
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

for (let i = 0; i < 6; i++) {
    if (_promptsA_sorted[i]) {
        const p = _promptsA_sorted[i];
        _slotResult[`slot_a_${i+1}`] = {
            active: true,
            prompt_system: p.prompt_system,
            prompt_user: p.prompt_user + _CONSIGNE_MAISON,
            house: p.house,
            label: `Maison ${p.house} de ${personneA.prenom || 'A'} ${(personneA.nom || '').toUpperCase()}`,
            score: p.score,
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
            score: p.score,
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
