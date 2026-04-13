/**
 * Génère WEBHOOK PREV / SYN / DHN (import n8n) : branche site order.paid + flux Gmail inchangé.
 * Usage : node build-webhooks-site.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function uuid() {
  return crypto.randomUUID();
}

function loadThemeWebhook() {
  const p = path.join(__dirname, "THEME", "WEBHOOK Theme");
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function prevSiteAndGmail() {
  const prev = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "PREV", "N8N Prev Extract Variables"),
      "utf8",
    ),
  );
  const gmailOnly = prev.nodes.find((n) => n.name === "Extract Variables")
    .parameters.jsCode;
  const stripped = gmailOnly.replace(
    /^const item = \$input\.all\(\)\[0\]\.json;\s*\n+/,
    "",
  );
  const site = `const item = $input.all()[0].json;

const body =
  item.body !== undefined && item.body !== null && typeof item.body === "object" && !Array.isArray(item.body)
    ? item.body
    : item;

if (body.event === "order.paid" || body.orderId) {
  const mail = body.customerEmail || body.mail || null;
  return [
    {
      json: {
        nom: body.nom ?? null,
        prenom: body.prenom ?? null,
        date: body.date ?? null,
        heure: body.heure ?? null,
        lieu: body.lieu ?? null,
        pays: body.pays ?? null,
        mail,
        rapport: body.rapport ?? null,
        annee: body.annee ?? null,
        date_entree: body.date_entree ?? null,
        date_sortie: body.date_sortie ?? null,
        langue: body.langue ?? "Français",
        consigne_redaction: body.consigne_redaction ?? "Tu",
        genre: body.genre ?? "M",
        orderId: body.orderId ?? null,
        stripeCheckoutSessionId: body.stripeCheckoutSessionId ?? null,
        stripePaymentIntentId: body.stripePaymentIntentId ?? null,
        amountTotal: body.amountTotal ?? null,
        currency: body.currency ?? null,
        stripeEventId: body.stripeEventId ?? null,
        source: "site",
      },
    },
  ];
}

// B) Gmail (sujet Prev)
`;
  return site + stripped;
}

function synSiteAndGmail() {
  const syn = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "SYN", "N8N SYN Extract Variables"),
      "utf8",
    ),
  );
  const gmailOnly = syn.nodes.find((n) => n.name === "Extract Variables SYN")
    .parameters.jsCode;
  const stripped = gmailOnly.replace(
    /^const item = \$input\.all\(\)\[0\]\.json;\s*\n+/,
    "",
  );
  const site = `const item = $input.all()[0].json;

const body =
  item.body !== undefined && item.body !== null && typeof item.body === "object" && !Array.isArray(item.body)
    ? item.body
    : item;

if (body.event === "order.paid" || body.orderId) {
  const mail = body.customerEmail || body.mail || null;
  const langue = body.langue ?? "Français";
  const typologie = body.typologie ?? "Amour";
  const date_relation = body.date_relation ?? null;
  const ra = body.personne_a && typeof body.personne_a === "object" ? body.personne_a : {};
  const rb = body.personne_b && typeof body.personne_b === "object" ? body.personne_b : {};
  const a = {
    nom: ra.nom ?? null,
    prenom: ra.prenom ?? null,
    date: ra.date ?? null,
    heure: ra.heure ?? null,
    lieu: ra.lieu ?? null,
    pays: ra.pays ?? null,
    consigne_redaction: ra.consigne_redaction ?? "Tu",
    genre: ra.genre ?? "M",
    role: ra.role ?? null,
  };
  const b = {
    nom: rb.nom ?? null,
    prenom: rb.prenom ?? null,
    date: rb.date ?? null,
    heure: rb.heure ?? null,
    lieu: rb.lieu ?? null,
    pays: rb.pays ?? null,
    consigne_redaction: rb.consigne_redaction ?? undefined,
    genre: rb.genre ?? "M",
    role: rb.role ?? null,
  };
  if (!b.consigne_redaction) b.consigne_redaction = b.genre === "F" ? "Elle" : "Il";
  a.pronom_tiers = a.genre === "F" ? "Elle" : "Il";
  b.pronom_tiers = b.genre === "F" ? "Elle" : "Il";
  const ASYMMETRIC_ROLES = {
    "Parent / Enfant": { senior: "parent", junior: "enfant" },
    Mentorat: { senior: "mentor", junior: "élève" },
  };
  const asymDef = ASYMMETRIC_ROLES[typologie];
  if (asymDef) {
    if (!a.role && !b.role && a.date && b.date) {
      const pD = (s) => {
        const p = s.split("/");
        return p.length === 3 ? new Date(+p[2], +p[1] - 1, +p[0]) : null;
      };
      const dA = pD(a.date);
      const dB = pD(b.date);
      if (dA && dB) {
        if (dA < dB) {
          a.role = asymDef.senior;
          b.role = asymDef.junior;
        } else {
          a.role = asymDef.junior;
          b.role = asymDef.senior;
        }
      }
    }
    if (!a.role) a.role = asymDef.junior;
    if (!b.role) b.role = asymDef.senior;
  } else {
    a.role = a.role || null;
    b.role = b.role || null;
  }
  return [
    {
      json: {
        personne_a: a,
        personne_b: b,
        mail,
        langue,
        typologie,
        date_relation,
        orderId: body.orderId ?? null,
        stripeCheckoutSessionId: body.stripeCheckoutSessionId ?? null,
        stripePaymentIntentId: body.stripePaymentIntentId ?? null,
        amountTotal: body.amountTotal ?? null,
        currency: body.currency ?? null,
        stripeEventId: body.stripeEventId ?? null,
        source: "site",
      },
    },
  ];
}

// B) Gmail (sujet SYN)
`;
  return site + stripped;
}

function dhnSiteAndGmail() {
  const dhn = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "DHN", "N8N DHN Extract Variables"),
      "utf8",
    ),
  );
  const gmailOnly = dhn.nodes.find((n) => n.name === "Parse Email DHN").parameters
    .jsCode;
  const stripped = gmailOnly.replace(
    /^const item = \$input\.all\(\)\[0\]\.json;\s*\n+/,
    "",
  );
  const site = `const item = $input.all()[0].json;

const body =
  item.body !== undefined && item.body !== null && typeof item.body === "object" && !Array.isArray(item.body)
    ? item.body
    : item;

if (body.event === "order.paid" || body.orderId) {
  const mail = body.customerEmail || body.mail || null;
  const out = {
    nom: body.nom ?? null,
    prenom: body.prenom ?? null,
    date: body.date ?? null,
    lieu: body.lieu ?? null,
    pays: body.pays ?? null,
    mail,
    langue: body.langue ?? "Français",
    genre: body.genre ?? "M",
    plage_naissance: body.plage_naissance ?? null,
    heure_naissance_min: body.heure_naissance_min ?? null,
    heure_naissance_max: body.heure_naissance_max ?? null,
    orderId: body.orderId ?? null,
    stripeCheckoutSessionId: body.stripeCheckoutSessionId ?? null,
    stripePaymentIntentId: body.stripePaymentIntentId ?? null,
    amountTotal: body.amountTotal ?? null,
    currency: body.currency ?? null,
    stripeEventId: body.stripeEventId ?? null,
    source: "site",
  };
  for (let i = 1; i <= 12; i++) {
    const k = "q" + i;
    if (body[k] !== undefined && body[k] !== null) out[k] = body[k];
  }
  for (let i = 1; i <= 10; i++) {
    const k = "evt" + i;
    if (body[k] !== undefined && body[k] !== null) out[k] = body[k];
  }
  return [{ json: out }];
}

`;
  return site + stripped;
}

function buildWorkflow({ name, pathSegment, jsCode, pinData }) {
  const theme = loadThemeWebhook();
  const whId = uuid();
  const codeId = uuid();
  const webhook = {
    ...theme.nodes[0],
    id: whId,
    name: "Webhook",
    webhookId: uuid(),
    parameters: {
      ...theme.nodes[0].parameters,
      path: pathSegment,
    },
  };
  const code = {
    ...theme.nodes[1],
    id: codeId,
    name: theme.nodes[1].name,
    parameters: { jsCode },
  };
  return {
    name,
    active: false,
    settings: { executionOrder: "v1" },
    nodes: [webhook, code],
    connections: {
      Webhook: {
        main: [[{ node: code.name, type: "main", index: 0 }]],
      },
    },
    pinData,
    meta: { templateCredsSetupCompleted: true },
  };
}

const prevPin = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "PREV", "N8N Prev Extract Variables"),
    "utf8",
  ),
).pinData;

const synPin = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "SYN", "N8N SYN Extract Variables"),
    "utf8",
  ),
).pinData;

const dhnPin = {
  "Extract Variables": [
    {
      nom: "Test",
      prenom: "Site",
      date: "01/01/1990",
      lieu: "Paris",
      pays: "France",
      mail: "test@example.com",
      langue: "Français",
      genre: "M",
      q1: "a",
      evt1: "naissance 15/06/1995",
      source: "site",
    },
  ],
};

const prevWf = buildWorkflow({
  name: "PREV — WEBHOOK entrée (site + Gmail)",
  pathSegment: "prev-site-order",
  jsCode: prevSiteAndGmail(),
  pinData: { "Extract Variables": prevPin["Extract Variables"] },
});

const synWf = buildWorkflow({
  name: "SYN — WEBHOOK entrée (site + Gmail)",
  pathSegment: "syn-site-order",
  jsCode: synSiteAndGmail(),
  pinData: { "Extract Variables": synPin["Extract Variables SYN"] },
});

const dhnWf = buildWorkflow({
  name: "DHN — WEBHOOK entrée (site + Gmail)",
  pathSegment: "dhn-site-order",
  jsCode: dhnSiteAndGmail(),
  pinData: dhnPin,
});

fs.writeFileSync(
  path.join(__dirname, "PREV", "WEBHOOK PREV"),
  JSON.stringify(prevWf, null, 2),
  "utf8",
);
fs.writeFileSync(
  path.join(__dirname, "SYN", "WEBHOOK SYN"),
  JSON.stringify(synWf, null, 2),
  "utf8",
);
fs.writeFileSync(
  path.join(__dirname, "DHN", "WEBHOOK DHN"),
  JSON.stringify(dhnWf, null, 2),
  "utf8",
);

console.log("OK → PREV/WEBHOOK PREV, SYN/WEBHOOK SYN, DHN/WEBHOOK DHN");
