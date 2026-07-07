// Coller TOUT ce fichier dans le nœud Code « Extract Variables SYN » sur n8n.
// Désactiver toute donnée épinglée (pin) sur ce nœud — sinon n8n ignore le code et renvoie un vieux JSON.
// WEBHOOK-SYN-EXTRACT-v1 — readSitePayload + ASYMMETRIC_ROLES ; branche Gmail conservée par symétrie THEME/PREV/DHN.

const item = $input.all()[0].json;

const body =
  item.body !== undefined && item.body !== null && typeof item.body === "object" && !Array.isArray(item.body)
    ? item.body
    : item;

// A) Webhook site — personne_a / personne_b en JSON propre.
if (body.event === "order.paid" || body.orderId || body.personne_a || body.personne_b) {
  const a = { ...(body.personne_a || {}) };
  const b = { ...(body.personne_b || {}) };

  const mail =
    (typeof body.mail === "string" && body.mail.trim() ? body.mail.trim() : null) ||
    (typeof body.customerEmail === "string" && body.customerEmail.trim() ? body.customerEmail.trim() : null);
  const langue = (typeof body.langue === "string" && body.langue.trim()) ? body.langue.trim() : "Français";
  const typologie = (typeof body.typologie === "string" && body.typologie.trim()) ? body.typologie.trim() : "Amour";
  const date_relation = body.date_relation ?? null;

  if (!a.consigne_redaction) a.consigne_redaction = "Tu";
  if (!a.genre) a.genre = "M";
  if (!b.consigne_redaction) b.consigne_redaction = b.genre === "F" ? "Elle" : "Il";
  if (!b.genre) b.genre = "M";
  a.pronom_tiers = a.genre === "F" ? "Elle" : "Il";
  b.pronom_tiers = b.genre === "F" ? "Elle" : "Il";

  const ASYMMETRIC_ROLES = {
    "Parent / Enfant": { senior: "parent", junior: "enfant" },
    "Mentorat":        { senior: "mentor", junior: "élève" }
  };
  const asymDef = ASYMMETRIC_ROLES[typologie];
  if (asymDef) {
    if (!a.role && !b.role && a.date && b.date) {
      const pD = s => { const p = String(s).split("/"); return p.length === 3 ? new Date(+p[2], +p[1]-1, +p[0]) : null; };
      const dA = pD(a.date), dB = pD(b.date);
      if (dA && dB) {
        if (dA < dB) { a.role = asymDef.senior; b.role = asymDef.junior; }
        else         { a.role = asymDef.junior; b.role = asymDef.senior; }
      }
    }
    if (!a.role) a.role = asymDef.junior;
    if (!b.role) b.role = asymDef.senior;
  } else {
    a.role = a.role || null;
    b.role = b.role || null;
  }

  return [{ json: { personne_a: a, personne_b: b, mail, langue, typologie, date_relation } }];
}

// B) Gmail / formulaire (ancien flux — code mort tant qu'aucun Gmail Trigger n'alimente ce nœud).
function findPlainText(payload) {
  if (!payload) return null;
  if (payload.mimeType === "text/plain" && payload.body && payload.body.data) return payload.body.data;
  if (payload.parts) {
    for (const part of payload.parts) {
      const found = findPlainText(part);
      if (found) return found;
    }
  }
  return null;
}
const b64 = findPlainText(item.payload);
let text = b64
  ? Buffer.from(b64.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8")
  : (item.snippet || "");
const normalized = text.replace(/\r?\n/g, ";");
const parts = normalized.split(";").map(p => p.trim()).filter(p => p.length > 0);
function decodeQP(str) { return str.replace(/=([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16))); }

const a2 = {}, b2 = {};
let mail = null, langue = null, typologie = null, date_relation = null, inPartnerBlock = false;
for (const part of parts) {
  const eqIndex = part.indexOf("=");
  if (eqIndex === -1) continue;
  const rawLabel = part.slice(0, eqIndex).trim();
  let val = part.slice(eqIndex + 1).trim().replace(/;$/, "").trim();
  const label = decodeQP(rawLabel).toLowerCase().trim();
  const nl = label.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const hasPartenaire = nl.includes("partenaire");
  if (hasPartenaire) inPartnerBlock = true;
  const cl = hasPartenaire ? nl.replace(/\s*partenaire\s*/, "").trim() : nl;
  if (nl === "langue") { langue = val || null; continue; }
  if (nl === "typologie relation" || nl === "typologie") { typologie = val || null; continue; }
  if (nl === "date relation" || nl === "date de la relation" || nl === "date debut relation") { date_relation = val || null; continue; }
  if (cl === "mail") { const em = val.match(/[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/); mail = em ? em[0] : (val || null); continue; }
  const target = (hasPartenaire || inPartnerBlock) ? b2 : a2;
  if (cl === "nom") target.nom = val || null;
  else if (cl === "prenom") target.prenom = val || null;
  else if (cl === "date de naissance") target.date = val || null;
  else if (cl === "heure de naissance") target.heure = val || null;
  else if (cl === "lieu de naissance") target.lieu = val || null;
  else if (cl === "pays de naissance") target.pays = val || null;
  else if (cl === "consigne redaction") target.consigne_redaction = val || null;
  else if (cl === "genre") target.genre = val || null;
  else if (cl === "role") target.role = val || null;
}
if (!langue) langue = "Français";
if (!a2.consigne_redaction) a2.consigne_redaction = "Tu";
if (!a2.genre) a2.genre = "M";
if (!b2.consigne_redaction) b2.consigne_redaction = b2.genre === "F" ? "Elle" : "Il";
if (!b2.genre) b2.genre = "M";
if (!typologie) typologie = "Amour";
a2.pronom_tiers = a2.genre === "F" ? "Elle" : "Il";
b2.pronom_tiers = b2.genre === "F" ? "Elle" : "Il";
const ASYMMETRIC_ROLES = { "Parent / Enfant": { senior: "parent", junior: "enfant" }, "Mentorat": { senior: "mentor", junior: "élève" } };
const asymDef = ASYMMETRIC_ROLES[typologie];
if (asymDef) {
  if (!a2.role && !b2.role && a2.date && b2.date) {
    const pD = s => { const p = s.split("/"); return p.length === 3 ? new Date(+p[2], +p[1]-1, +p[0]) : null; };
    const dA = pD(a2.date), dB = pD(b2.date);
    if (dA && dB) {
      if (dA < dB) { a2.role = asymDef.senior; b2.role = asymDef.junior; }
      else { a2.role = asymDef.junior; b2.role = asymDef.senior; }
    }
  }
  if (!a2.role) a2.role = asymDef.junior;
  if (!b2.role) b2.role = asymDef.senior;
} else { a2.role = a2.role || null; b2.role = b2.role || null; }

return [{ json: { personne_a: a2, personne_b: b2, mail, langue, typologie, date_relation } }];
