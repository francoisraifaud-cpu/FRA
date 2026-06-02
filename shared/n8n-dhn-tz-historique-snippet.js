// P8 — DHN TZ Historique : P7 Luxon + mode LMT (aligné PREV/THÈME/SYN).
// Source : FRA/shared/n8n-dhn-tz-historique-snippet.js

function gn(n) {
  try {
    return $(n).first()?.json || null;
  } catch (e) {
    return null;
  }
}
const vars =
  gn("Extract Variables DHN") || gn("Extract Variables DHN1") || gn("Extract Variables");
if (!vars?.date) throw new Error("DHN P8 : date introuvable — Extract Variables.");
const tzdb = $input.first().json || {};
const prep = gn("Prepare Timezone") || gn("Prepare Timezone1");
const lon = prep ? parseFloat(prep.lon) : NaN;

const d = vars.date.split("/");
const yr = parseInt(d[2], 10);
const mo = parseInt(d[1], 10);
const da = parseInt(d[0], 10);

function resolveTzMode(v, year) {
  const m = String(v.tz_mode || v.birth_tz_mode || "").toLowerCase();
  if (m === "lmt") return "lmt";
  if (m === "civil" || m === "iana" || m === "standard") return "iana";
  const notes = String(v.notes_heure || v.notes || "").toUpperCase();
  if (notes.includes("LMT")) return "lmt";
  if (year < 1910) return "lmt";
  return "iana";
}

const tzMode = resolveTzMode(vars, yr);

if (tzMode === "lmt" && Number.isFinite(lon)) {
  const tzHours = lon / 15;
  const offsetSec = Math.round(tzHours * 3600);
  return [
    {
      json: Object.assign({}, tzdb, {
        gmtOffset: offsetSec,
        gmtOffsetSource: "lmt",
        zoneNameUsed: "LMT",
        tz_mode: "lmt",
        tzWarn:
          yr < 1910 && !String(vars.tz_mode || "").toLowerCase()
            ? "LMT auto (naissance < 1910)"
            : null,
      }),
    },
  ];
}

const zoneName = tzdb.zoneName || null;
const tzdbOffsetSec = Number.isFinite(tzdb.gmtOffset) ? tzdb.gmtOffset : null;

let offsetSec = tzdbOffsetSec;
let source = "timezonedb";
let tzWarn = null;

try {
  if (zoneName && typeof DateTime !== "undefined") {
    const dt = DateTime.fromObject({ year: yr, month: mo, day: da, hour: 12 }, { zone: zoneName });
    if (dt.isValid) {
      const luxOffsetSec = dt.offset * 60;
      if (tzdbOffsetSec !== null && Math.abs(luxOffsetSec - tzdbOffsetSec) >= 60) {
        tzWarn =
          "Δ TimezoneDB vs luxon = " +
          Math.round((luxOffsetSec - tzdbOffsetSec) / 60) +
          " min sur " +
          zoneName +
          " — luxon prioritaire";
      }
      offsetSec = luxOffsetSec;
      source = "luxon";
    } else {
      tzWarn = "luxon DateTime invalide pour zone " + zoneName + " — fallback TimezoneDB";
    }
  } else if (!zoneName) {
    tzWarn = "TimezoneDB ne retourne pas zoneName — gmtOffset brut";
  } else {
    tzWarn = "luxon DateTime non disponible — fallback TimezoneDB";
  }
} catch (e) {
  tzWarn = "Erreur luxon : " + (e.message || e) + " — fallback TimezoneDB";
}

return [
  {
    json: Object.assign({}, tzdb, {
      gmtOffset: offsetSec,
      gmtOffsetSource: source,
      zoneNameUsed: zoneName,
      tz_mode: "iana",
      tzWarn: tzWarn,
    }),
  },
];
