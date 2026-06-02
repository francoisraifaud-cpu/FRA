// P8 — TZ historique (Luxon IANA) + mode LMT (Astro-Databank AA).
// Source canonique — injecté dans n8n via SITE/scripts/n8n-deploy-preparation-dynamique-tz.mjs
// CONFIG.varsNode / CONFIG.geoNode sont remplacés par le script de deploy.

const CONFIG = {
  varsNode: "__VARS_NODE__",
  geoNode: "__GEO_NODE__",
  product: "__PRODUCT__",
};

function gn(name) {
  try {
    return $(name).first()?.json || null;
  } catch (e) {
    return null;
  }
}

const vars = gn(CONFIG.varsNode);
const geo = gn(CONFIG.geoNode);

if (!geo || geo.lat === undefined || geo.lat === null || String(geo.lat).trim() === "") {
  throw new Error("Coordonnées GPS introuvables (" + CONFIG.product + ").");
}
if (!vars || !vars.date) {
  throw new Error("Variables introuvables (" + CONFIG.product + ").");
}
if (!vars.heure) {
  throw new Error("Heure introuvable (" + CONFIG.product + ").");
}

const lat = parseFloat(geo.lat);
const lon = parseFloat(geo.lon);
if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
  throw new Error("Coordonnées GPS invalides (" + CONFIG.product + ").");
}

const d = vars.date.split("/");
const h = vars.heure.split(/[:Hh]/);
const yy = parseInt(d[2], 10);
const mo = parseInt(d[1], 10);
const da = parseInt(d[0], 10);
const hh = parseInt(h[0], 10);
const mi = parseInt(h[1] || "0", 10);

function resolveTzMode(v, year) {
  const m = String(v.tz_mode || v.birth_tz_mode || "").toLowerCase();
  if (m === "lmt") return "lmt";
  if (m === "civil" || m === "iana" || m === "standard") return "iana";
  const notes = String(v.notes_heure || v.notes || "").toUpperCase();
  if (notes.includes("LMT")) return "lmt";
  // Astro-Databank : chartes AA pré-1910 souvent en LMT (ex. Kahlo 1907, Curie 1867)
  if (year < 1910) return "lmt";
  return "iana";
}

const tzMode = resolveTzMode(vars, yy);
let tz = 0;
let gmtOffsetSec = 0;
let source = "lmt";
let zoneNameUsed = null;
let tzWarn = null;

if (tzMode === "lmt") {
  // UT = heure_locale - timezone  →  timezone = longitude/15 (Est +, Ouest -)
  tz = lon / 15;
  gmtOffsetSec = Math.round(tz * 3600);
  source = "lmt";
  zoneNameUsed = "LMT";
  tzWarn =
    yy < 1910 && !String(vars.tz_mode || "").toLowerCase()
      ? "LMT auto (naissance < 1910) — alignement Astro-Databank AA"
      : null;
} else {
  const localNaiveUtcSec = Math.floor(Date.UTC(yy, mo - 1, da, hh, mi, 0) / 1000);
  const TZ_KEY =
    typeof $vars !== "undefined" && $vars && $vars.TIMEZONEDB_KEY
      ? String($vars.TIMEZONEDB_KEY)
      : "UV443YWQRYUC";

  let U = localNaiveUtcSec;
  let zoneName = null;
  let tzdbOffsetSec = null;

  for (let iter = 0; iter < 4; iter++) {
    if (iter > 0) await new Promise((r) => setTimeout(r, 200));
    const tzData = await this.helpers.httpRequest({
      method: "GET",
      url: "http://api.timezonedb.com/v2.1/get-time-zone",
      qs: {
        key: TZ_KEY,
        format: "json",
        by: "position",
        lat: String(lat),
        lng: String(lon),
        time: String(U),
      },
      json: true,
    });

    if (!tzData || tzData.gmtOffset === undefined) {
      throw new Error(
        "Fuseau horaire introuvable (" +
          CONFIG.product +
          "). tzData=" +
          JSON.stringify(tzData),
      );
    }
    zoneName = tzData.zoneName || zoneName;
    tzdbOffsetSec = tzData.gmtOffset;
    const nextU = localNaiveUtcSec - tzData.gmtOffset;
    if (Math.abs(nextU - U) <= 1) {
      U = nextU;
      break;
    }
    U = nextU;
  }

  zoneNameUsed = zoneName;
  source = "timezonedb";
  gmtOffsetSec = tzdbOffsetSec;

  try {
    if (zoneName && typeof DateTime !== "undefined") {
      const dt = DateTime.fromObject(
        { year: yy, month: mo, day: da, hour: hh, minute: mi },
        { zone: zoneName },
      );
      if (dt.isValid) {
        const luxSec = dt.offset * 60;
        if (tzdbOffsetSec !== null && Math.abs(luxSec - tzdbOffsetSec) >= 60) {
          tzWarn =
            "Δ TimezoneDB vs luxon = " +
            Math.round((luxSec - tzdbOffsetSec) / 60) +
            " min sur " +
            zoneName +
            " — luxon (IANA) prioritaire";
        }
        gmtOffsetSec = luxSec;
        source = "luxon";
      } else {
        tzWarn = "luxon invalide pour " + zoneName + " — fallback TimezoneDB";
      }
    } else if (!zoneName) {
      tzWarn = "TimezoneDB sans zoneName — gmtOffset brut";
    } else {
      tzWarn = "luxon indisponible — fallback TimezoneDB";
    }
  } catch (eLux) {
    tzWarn = "Erreur luxon: " + (eLux.message || eLux) + " — fallback TimezoneDB";
  }

  tz = gmtOffsetSec / 3600;
}

const payload = {
  year: yy,
  month: mo,
  date: da,
  hours: hh,
  minutes: mi,
  seconds: 0,
  latitude: lat,
  longitude: lon,
  timezone: tz,
  config: {
    observation_point: "geocentric",
    ayanamsha: "tropical",
    language: "fr",
    tz_meta: {
      product: CONFIG.product,
      tz_mode: tzMode,
      gmtOffsetSource: source,
      zoneNameUsed,
      gmtOffsetSec,
      tzWarn,
    },
  },
};

const out = { body: JSON.stringify(payload), gmtOffset: gmtOffsetSec, tz_meta: payload.config.tz_meta };
return [{ json: out }];
