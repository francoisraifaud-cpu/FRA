import fs from "fs";

const p = new URL("./N8N PREV SUCCES", import.meta.url);
const j = JSON.parse(fs.readFileSync(p, "utf8"));
const node = j.nodes.find((n) => n.name === "Prépare email 3 PDF");
if (!node) throw new Error("node Prépare email 3 PDF introuvable");

let c = node.parameters.jsCode;
if (c.includes("const dateSpanSubject")) {
  console.log("skip (déjà appliqué)");
  process.exit(0);
}
const start = c.indexOf("const namePart");
const end = c.indexOf("const emailHtml = en");
if (start < 0 || end < 0)
  throw new Error(`markers not found: ${start} ${end}`);

const neu = `const fullName =
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

`;

node.parameters.jsCode = c.slice(0, start) + neu + c.slice(end);
fs.writeFileSync(p, JSON.stringify(j, null, 2), "utf8");
console.log("ok");
