import fs from "fs";

const p = new URL("./N8N PREV SUCCES", import.meta.url);
const j = JSON.parse(fs.readFileSync(p, "utf8"));

const newJs = `/**
 * PREV — après merge 3 branches : regroupe en 1 item (data, data1, data2) pour Gmail.
 * Classement par fileName : mêmes préfixes que les flux amont
 * (Repport HTML données, HTML Tech, HTML Final — desiredFilename / Fix PDF).
 */
function pickPdfBinary(item) {
  const bin = item.binary || {};
  for (const key of Object.keys(bin)) {
    const b = bin[key];
    if (!b) continue;
    const mime = String(b.mimeType || "").toLowerCase();
    const ext = String(b.fileExtension || "").toLowerCase();
    if (mime.includes("pdf") || ext === "pdf") return b;
  }
  const keys = Object.keys(bin);
  if (keys.length) return bin[keys[0]];
  return null;
}

function normName(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\\p{M}/gu, "");
}

/**
 * Ordre : technique (sous-chaîne la plus spécifique) → données → rapport final.
 */
function bucketForFileName(fileName) {
  const n = normName(fileName);
  if (n.includes("rapport technique previsions")) return "tech";
  if (
    n.includes("donnees techniques previsions") ||
    n.includes("technical forecast data")
  )
    return "donnees";
  if (n.includes("forecast report")) return "main";
  if (n.includes("rapport") && n.includes("previsions") && !n.includes("technique"))
    return "main";
  return null;
}

const items = $input.all();
if (items.length === 0) return [];

const buckets = { main: null, tech: null, donnees: null };
const orphans = [];

for (const item of items) {
  const pdf = pickPdfBinary(item);
  if (!pdf) continue;
  const b = bucketForFileName(pdf.fileName);
  if (b && !buckets[b]) buckets[b] = pdf;
  else orphans.push(pdf);
}

for (const o of orphans) {
  if (!buckets.main) buckets.main = o;
  else if (!buckets.tech) buckets.tech = o;
  else if (!buckets.donnees) buckets.donnees = o;
}

if (!buckets.main || !buckets.tech || !buckets.donnees) {
  throw new Error(
    "Prépare email 3 PDF PREV : 3 PDF attendus (données, technique, rapport final). " +
      "Reçu : " +
      [buckets.main, buckets.tech, buckets.donnees].filter(Boolean).length +
      ". Vérifie les fileName : " +
      items
        .map((i) => pickPdfBinary(i)?.fileName || "(sans pdf)")
        .join(" | "),
  );
}

let extract = {};
try {
  extract = $("Extract Variables").first().json || {};
} catch (e) {
  /* nœud absent en test isolé */
}

const mailClient =
  extract.mail ||
  items.find((i) => i.json?.mail)?.json?.mail ||
  items[0].json?.mailClient ||
  items[0].json?.mail ||
  null;

const prenom = extract.prenom ?? items[0].json?.prenom ?? null;
const nomRaw =
  extract.nom != null
    ? String(extract.nom)
    : items[0].json?.nom != null
      ? String(items[0].json.nom)
      : "";
const nomStr = nomRaw.trim();

function isEnglishLang(raw) {
  const s = String(raw ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\\p{M}/gu, "");
  if (!s) return false;
  if (s === "en" || s === "english" || s === "anglais") return true;
  if (s.includes("english") || s.includes("anglais")) return true;
  return false;
}

const en = isEnglishLang(extract.langue);
const prenomStr = prenom != null ? String(prenom).trim() : "";
const fullName =
  [prenomStr, nomStr].filter(Boolean).join(" ").trim() || "Client";

const rapportFr = String(extract.rapport || "").trim() || "—";
const rapportEnMap = {
  Annuel: "Annual",
  Mensuel: "Monthly",
  Hebdomadaire: "Weekly",
  Journalier: "Daily",
};
const rapportEn = rapportEnMap[rapportFr] || rapportFr;

const de = String(extract.date_entree || "").trim();
const a = String(extract.date_sortie || "").trim();
const periodeFr =
  de && a
    ? \`<p>Pour la période du <strong>\${de}</strong> au <strong>\${a}</strong>.</p>\`
    : "";
const periodeEn =
  de && a
    ? \`<p>For the period from <strong>\${de}</strong> to <strong>\${a}</strong>.</p>\`
    : "";

const dateSpanSubject = de && a ? \`\${de} – \${a}\`.trim() : "";
const subjectPieces = en
  ? ["🌟 Forecasts", rapportEn, dateSpanSubject, fullName]
  : ["🌟 Prévisions", rapportFr, dateSpanSubject, fullName];
const emailSubject = subjectPieces.filter(Boolean).join(" — ");

const greetHtml = en ? "<p>Hello,</p>" : "<p>Bonjour,</p>";

const emailHtml = en
  ? \`\${greetHtml}\${periodeEn}<p>Your three forecast documents (<strong>\${rapportEn}</strong>) are attached as PDFs: technical report, narrative report, and data tables.</p><p>Clear skies! 🌟</p>\`
  : \`\${greetHtml}\${periodeFr}<p>Vos trois documents de prévisions (<strong>\${rapportFr}</strong>) sont en pièces jointes au format PDF : rapport technique, rapport narratif et données.</p><p>Bonnes étoiles ! 🌟</p>\`;

return [
  {
    json: {
      mailClient: mailClient || "votre.adresse.test@gmail.com",
      prenom,
      nom: nomStr || null,
      emailSubject,
      emailHtml,
    },
    binary: {
      data: buckets.main,
      data1: buckets.tech,
      data2: buckets.donnees,
    },
  },
];
`;

const node = j.nodes.find((n) => n.name === "Prépare email 3 PDF");
if (!node) throw new Error("node Prépare email 3 PDF introuvable");
node.parameters.jsCode = newJs;

fs.writeFileSync(p, JSON.stringify(j, null, 2), "utf8");
console.log("ok");
