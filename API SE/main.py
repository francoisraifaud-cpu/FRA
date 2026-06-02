from contextlib import asynccontextmanager
import os
import threading

from fastapi import FastAPI, Query, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict
import swisseph as swe
from datetime import datetime, timedelta

# SwissEph : le chemin semble lié au thread courant. Les routes sync FastAPI s'exécutent dans
# le threadpool → set_ephe_path au import / lifespan (boucle asyncio) ne suffit pas.
# On initialise une fois par thread worker (pas une fois par requête → évite fuites de FD).
EPHE_PATH = "/opt/astro/api/ephe"
_ephe_tls = threading.local()


def ensure_ephe_path():
    if getattr(_ephe_tls, "ready", False):
        return
    swe.set_ephe_path(EPHE_PATH)
    _ephe_tls.ready = True


@asynccontextmanager
async def lifespan(app: FastAPI):
    ensure_ephe_path()
    yield


app = FastAPI(lifespan=lifespan)


@app.middleware("http")
async def api_key_guard(request: Request, call_next):
    """Si ASTRO_API_KEY est défini dans l'environnement du service, exiger le header X-API-Key."""
    expected = (os.environ.get("ASTRO_API_KEY") or "").strip()
    if not expected:
        return await call_next(request)
    path = request.url.path
    if path in ("/health", "/docs", "/redoc", "/openapi.json") or path.startswith("/docs"):
        return await call_next(request)
    if request.headers.get("x-api-key") != expected:
        return JSONResponse({"detail": "Unauthorized"}, status_code=401)
    return await call_next(request)


ZODIAC_SIGNS = [
    {"number": 1,  "name": {"en": "Aries",       "fr": "Bélier"}},
    {"number": 2,  "name": {"en": "Taurus",      "fr": "Taureau"}},
    {"number": 3,  "name": {"en": "Gemini",      "fr": "Gémeaux"}},
    {"number": 4,  "name": {"en": "Cancer",      "fr": "Cancer"}},
    {"number": 5,  "name": {"en": "Leo",         "fr": "Lion"}},
    {"number": 6,  "name": {"en": "Virgo",       "fr": "Vierge"}},
    {"number": 7,  "name": {"en": "Libra",       "fr": "Balance"}},
    {"number": 8,  "name": {"en": "Scorpio",     "fr": "Scorpion"}},
    {"number": 9,  "name": {"en": "Sagittarius", "fr": "Sagittaire"}},
    {"number": 10, "name": {"en": "Capricorn",   "fr": "Capricorne"}},
    {"number": 11, "name": {"en": "Aquarius",    "fr": "Verseau"}},
    {"number": 12, "name": {"en": "Pisces",      "fr": "Poissons"}},
]

PLANETS = [
    {"id": swe.SUN,       "en": "Sun",       "fr": "Soleil"},
    {"id": swe.MOON,      "en": "Moon",      "fr": "Lune"},
    {"id": swe.MARS,      "en": "Mars",      "fr": "Mars"},
    {"id": swe.MERCURY,   "en": "Mercury",   "fr": "Mercure"},
    {"id": swe.JUPITER,   "en": "Jupiter",   "fr": "Jupiter"},
    {"id": swe.VENUS,     "en": "Venus",     "fr": "Vénus"},
    {"id": swe.SATURN,    "en": "Saturn",    "fr": "Saturne"},
    {"id": swe.URANUS,    "en": "Uranus",    "fr": "Uranus"},
    {"id": swe.NEPTUNE,   "en": "Neptune",   "fr": "Neptune"},
    {"id": swe.PLUTO,     "en": "Pluto",     "fr": "Pluton"},
    {"id": swe.CERES,     "en": "Ceres",     "fr": "Cérès"},
    {"id": swe.VESTA,     "en": "Vesta",     "fr": "Vesta"},
    {"id": swe.JUNO,      "en": "Juno",      "fr": "Junon"},
    {"id": swe.PALLAS,    "en": "Pallas",    "fr": "Pallas"},
    {"id": swe.CHIRON,    "en": "Chiron",    "fr": "Chiron"},
    {"id": swe.MEAN_APOG, "en": "Lilith",    "fr": "Lilith"},
    {"id": swe.MEAN_NODE, "en": "Mean Node", "fr": "Nœud moyen"},
    {"id": swe.TRUE_NODE, "en": "True Node", "fr": "Nœud vrai"},
]

ZODIAC_SIGNS_LIST = [
    "Bélier", "Taureau", "Gémeaux", "Cancer",
    "Lion", "Vierge", "Balance", "Scorpion",
    "Sagittaire", "Capricorne", "Verseau", "Poissons"
]

TRANSIT_OBJECTS = {
    "Soleil":     {"id": swe.SUN,       "moseph": True},
    "Mercure":    {"id": swe.MERCURY,   "moseph": True},
    "Vénus":      {"id": swe.VENUS,     "moseph": True},
    "Mars":       {"id": swe.MARS,      "moseph": True},
    "Jupiter":    {"id": swe.JUPITER,   "moseph": True},
    "Saturne":    {"id": swe.SATURN,    "moseph": True},
    "Uranus":     {"id": swe.URANUS,    "moseph": True},
    "Neptune":    {"id": swe.NEPTUNE,   "moseph": True},
    "Pluton":     {"id": swe.PLUTO,     "moseph": True},
    "Chiron":     {"id": swe.CHIRON,    "moseph": False},
    "Ceres":      {"id": swe.CERES,     "moseph": False},
    "Pallas":     {"id": swe.PALLAS,    "moseph": False},
    "Junon":      {"id": swe.JUNO,      "moseph": False},
    "Vesta":      {"id": swe.VESTA,     "moseph": False},
    "Lilith":     {"id": swe.MEAN_APOG, "moseph": True},
    "Noeud_Nord": {"id": swe.MEAN_NODE, "moseph": True},
}

# ─── Cache obliquité (change ~47"/siècle — stable à la journée) ──────────────
_epsilon_cache: dict = {}

def get_obliquity(jd: float) -> float:
    """Obliquité de l'écliptique, cachée par JD entier pour éviter les recalculs."""
    ensure_ephe_path()
    key = int(jd)
    if key not in _epsilon_cache:
        # Vider *avant* d'insérer : l'ancien code faisait clear() après l'insert,
        # ce qui supprimait la clé courante puis provoquait KeyError au return.
        if len(_epsilon_cache) >= 1000:
            _epsilon_cache.clear()
        res, _ = swe.calc_ut(jd, swe.ECL_NUT, swe.FLG_SWIEPH)
        _epsilon_cache[key] = res[0]
    return _epsilon_cache[key]

def calc_declinaison(lon: float, lat: float, epsilon: float) -> float:
    """Conversion écliptique → déclinaison équatoriale (cotrans, microsecondes)."""
    eq = swe.cotrans([lon, lat, 1.0], -epsilon)
    return round(eq[1], 4)

# ─── Utilitaires ─────────────────────────────────────────────────────────────

class BirthData(BaseModel):
    """Champs suisseph + optionnels (ex. config n8n) ignorés."""

    model_config = ConfigDict(extra="ignore")

    year: int
    month: int
    date: int
    hours: float
    minutes: float
    seconds: float
    latitude: float
    longitude: float
    timezone: float


class BatchPlanetsBody(BaseModel):
    """A.3 — un seul POST pour N créneaux (même sémantique que N× /western/planets)."""

    model_config = ConfigDict(extra="ignore")

    slots: list[BirthData]

def get_zodiac(degree: float):
    idx = int(degree / 30) % 12
    return ZODIAC_SIGNS[idx]

def to_julian(data: BirthData):
    ensure_ephe_path()
    ut = data.hours + data.minutes / 60 + data.seconds / 3600 - data.timezone
    return swe.julday(data.year, data.month, data.date, ut)

def parse_date(date_str: str) -> datetime:
    for fmt in ("%d/%m/%Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue
    raise ValueError(f"Format de date non reconnu : {date_str}")

# ─── /western/planets ─────────────────────────────────────────────────────────

_BATCH_PLANETS_MAX_SLOTS = 400


def planet_output_list(data: BirthData) -> list:
    """Liste `output` (planètes + angles) pour une naissance — même schéma que l’historique."""
    jd = to_julian(data)
    epsilon = get_obliquity(jd)
    houses, ascmc = swe.houses(jd, data.latitude, data.longitude, b"P")
    result = []

    asc_deg = ascmc[0]
    result.append({
        "planet":     {"en": "Ascendant", "fr": "Ascendant"},
        "fullDegree": asc_deg,
        "normDegree": asc_deg % 30,
        "isRetro":    "False",
        "zodiac_sign": get_zodiac(asc_deg),
    })

    for p in PLANETS:
        # FLG_SPEED ajouté — corrige la détection rétrograde (bug original)
        pos, _ = swe.calc_ut(jd, p["id"], swe.FLG_SWIEPH | swe.FLG_SPEED)
        full  = pos[0]
        lat   = pos[1]
        dist  = pos[2]
        speed = pos[3]
        retro = "True" if speed < 0 else "False"
        dec   = calc_declinaison(full, lat, epsilon)
        result.append({
            "planet":     {"en": p["en"], "fr": p["fr"]},
            "fullDegree": full,
            "normDegree": full % 30,
            "isRetro":    retro,
            "zodiac_sign": get_zodiac(full),
            "latitude":         round(lat, 4),
            "distance_ua":      round(dist, 6),
            "vitesse_longitude": round(speed, 4),
            "declinaison":      dec,
        })

    for deg, en, fr in [
        ((ascmc[0] + 180) % 360, "Descendant", "Descendant"),
        (ascmc[1],               "MC",          "Milieu du Ciel"),
        ((ascmc[1] + 180) % 360, "IC",          "Imum Coeli"),
    ]:
        result.append({
            "planet":     {"en": en, "fr": fr},
            "fullDegree": deg,
            "normDegree": deg % 30,
            "isRetro":    "False",
            "zodiac_sign": get_zodiac(deg),
        })

    return result


@app.post("/western/planets")
def calc_planets(data: BirthData):
    ensure_ephe_path()
    return {"statusCode": 200, "output": planet_output_list(data)}


@app.post("/batch/western/planets")
def calc_planets_batch(body: BatchPlanetsBody):
    """N créneaux en une requête — ordre de `outputs` = ordre de `slots` (pour n8n / DHN)."""
    n = len(body.slots)
    if n > _BATCH_PLANETS_MAX_SLOTS:
        return JSONResponse(
            {"detail": f"Maximum {_BATCH_PLANETS_MAX_SLOTS} slots, reçu {n}"},
            status_code=400,
        )
    if n == 0:
        return {"statusCode": 200, "outputs": []}
    ensure_ephe_path()
    outputs = []
    for slot in body.slots:
        try:
            outputs.append({"statusCode": 200, "output": planet_output_list(slot)})
        except Exception as ex:
            outputs.append({"statusCode": 500, "output": [], "error": str(ex)})
    return {"statusCode": 200, "outputs": outputs}

# ─── /western/houses ──────────────────────────────────────────────────────────

@app.post("/western/houses")
def calc_houses(data: BirthData):
    jd = to_julian(data)
    houses, ascmc = swe.houses(jd, data.latitude, data.longitude, b"P")
    result = []
    for i, deg in enumerate(houses):
        result.append({
            "House":      i + 1,
            "degree":     deg,
            "normDegree": deg % 30,
            "zodiac_sign": get_zodiac(deg),
        })
    return {"statusCode": 200, "output": {"Houses": result}}

# ─── /transits ────────────────────────────────────────────────────────────────

def calc_planet_transit(jd: float, planet_id: int, use_moseph: bool, epsilon: float):
    """Calcule position + déclinaison d'une planète en transit."""
    ensure_ephe_path()
    flags_list = (
        [swe.FLG_MOSEPH | swe.FLG_SPEED]
        if use_moseph
        else [swe.FLG_SWIEPH | swe.FLG_SPEED, swe.FLG_MOSEPH | swe.FLG_SPEED]
    )
    for flag in flags_list:
        try:
            res, _ = swe.calc_ut(jd, planet_id, flag)
            lon, lat, dist, speed = res[0], res[1], res[2], res[3]
            source = "Moshier" if (flag & swe.FLG_MOSEPH) else "SwissEph"
            dec = calc_declinaison(lon, lat, epsilon)
            return {
                # Champs existants — inchangés
                "longitude_absolue": round(lon, 4),
                "signe":             ZODIAC_SIGNS_LIST[int(lon / 30) % 12],
                "degre_dans_signe":  round(lon % 30, 4),
                "est_retrograde":    speed < 0,
                "source":            source,
                # Nouveaux champs
                "latitude":          round(lat, 4),
                "distance_ua":       round(dist, 6),
                "vitesse_longitude":  round(speed, 4),
                "declinaison":       dec,
            }
        except Exception:
            continue
    return None

@app.get("/transits")
def get_transits(
    date_debut: str = Query(..., description="dd/mm/yyyy ou yyyy-mm-dd"),
    date_fin:   str = Query(..., description="dd/mm/yyyy ou yyyy-mm-dd"),
):
    start = parse_date(date_debut)
    end   = parse_date(date_fin)
    results = []
    current = start
    while current <= end:
        jd      = swe.julday(current.year, current.month, current.day, 12.0)
        epsilon = get_obliquity(jd)  # une fois par jour, partagé entre toutes les planètes
        day_data = {"date": current.strftime("%Y-%m-%d"), "planetes": {}}
        for nom, cfg in TRANSIT_OBJECTS.items():
            result = calc_planet_transit(jd, cfg["id"], cfg["moseph"], epsilon)
            if result:
                day_data["planetes"][nom] = result
                if nom == "Noeud_Nord":
                    lon_sud = (result["longitude_absolue"] + 180) % 360
                    lat_sud = -result["latitude"]
                    dec_sud = calc_declinaison(lon_sud, lat_sud, epsilon)
                    day_data["planetes"]["Noeud_Sud"] = {
                        # Champs existants
                        "longitude_absolue": round(lon_sud, 4),
                        "signe":             ZODIAC_SIGNS_LIST[int(lon_sud / 30) % 12],
                        "degre_dans_signe":  round(lon_sud % 30, 4),
                        "est_retrograde":    result["est_retrograde"],
                        "source":            "calculé (opposition Noeud Nord)",
                        # Nouveaux champs
                        "latitude":          round(lat_sud, 4),
                        "distance_ua":       result["distance_ua"],
                        "vitesse_longitude":  round(-result["vitesse_longitude"], 4),
                        "declinaison":       dec_sud,
                    }
        results.append(day_data)
        current += timedelta(days=1)
    return results

# ─── /moon ────────────────────────────────────────────────────────────────────

@app.get("/moon")
def get_moon(
    date_debut: str = Query(..., description="dd/mm/yyyy ou yyyy-mm-dd"),
    date_fin:   str = Query(..., description="dd/mm/yyyy ou yyyy-mm-dd"),
):
    start  = parse_date(date_debut)
    end    = parse_date(date_fin)
    results = []
    current = datetime(start.year, start.month, start.day, 0, 0)
    end_dt  = datetime(end.year, end.month, end.day, 12, 0)
    while current <= end_dt:
        hour_decimal = current.hour + current.minute / 60.0
        jd = swe.julday(current.year, current.month, current.day, hour_decimal)
        epsilon = get_obliquity(jd)
        try:
            res, _ = swe.calc_ut(jd, swe.MOON, swe.FLG_MOSEPH | swe.FLG_SPEED)
            lon, lat, dist, speed = res[0], res[1], res[2], res[3]
            dec = calc_declinaison(lon, lat, epsilon)
            results.append({
                "date_heure": current.strftime("%Y-%m-%d %H:%M"),
                "lune": {
                    # Champs existants — inchangés
                    "longitude_absolue": round(lon, 4),
                    "signe":             ZODIAC_SIGNS_LIST[int(lon / 30) % 12],
                    "degre_dans_signe":  round(lon % 30, 4),
                    "vitesse_journaliere": round(speed, 4),
                    # Nouveaux champs
                    "latitude":    round(lat, 4),
                    "distance_ua": round(dist, 6),
                    "declinaison": dec,
                },
            })
        except Exception:
            pass
        current += timedelta(hours=12)
    return results

# ─── /eclipses ────────────────────────────────────────────────────────────────

@app.get("/eclipses")
def get_eclipses(
    date_debut: str = Query(..., description="dd/mm/yyyy ou yyyy-mm-dd"),
    date_fin:   str = Query(..., description="dd/mm/yyyy ou yyyy-mm-dd"),
):
    # Ne pas appeler set_ephe_path("") ici : le processus sert d'autres routes en parallèle
    # (threadpool FastAPI) et le chemin global n'est pas thread-safe. FLG_MOSEPH suffit pour
    # sol_eclipse_when_glob / lun_eclipse_when.
    ensure_ephe_path()
    start    = parse_date(date_debut)
    end      = parse_date(date_fin)
    start_jd = swe.julday(start.year, start.month, start.day, 0.0)
    end_jd   = swe.julday(end.year, end.month, end.day, 23.99)
    eclipses = []

    def jd_to_str(jd):
        y, m, d, h = swe.revjul(jd)
        hours = int(h); minutes = int((h - hours) * 60)
        if minutes == 60:
            hours += 1; minutes = 0
        return datetime(y, m, d, hours, minutes).strftime("%Y-%m-%d %H:%M UTC")

    def get_type(flags, lunar=False):
        if flags & swe.ECL_TOTAL:          return "Totale"
        if flags & swe.ECL_ANNULAR:        return "Annulaire"
        if flags & swe.ECL_ANNULAR_TOTAL:  return "Hybride"
        if flags & swe.ECL_PARTIAL:        return "Partielle"
        if flags & swe.ECL_PENUMBRAL and lunar: return "Pénombrale"
        return "Inconnue"

    # Calcul des positions écliptiques au JD du maximum (patch 2026-05-23).
    # Champs ajoutés en ADDITIF strict pour ne pas casser les consommateurs existants
    # (workflows THEME/PREV) qui lisaient astre/type/date_maximum.
    # Le workflow THEME (`N8N Theme`, lignes 1969-1972) lit déjà eclipseNatal.fullDegree
    # || .degree || .degre — d'où l'alias fullDegree pour activation immédiate.
    def get_eclipse_pos(jd: float, astre_swe_id: int) -> dict:
        try:
            res, _ = swe.calc_ut(jd, astre_swe_id, swe.FLG_MOSEPH)
            lon, lat = res[0], res[1]
            return {
                "longitude_absolue": round(lon, 4),
                "fullDegree":        round(lon, 4),  # alias compat THEME workflow
                "signe":             ZODIAC_SIGNS_LIST[int(lon / 30) % 12],
                "degre_dans_signe":  round(lon % 30, 4),
                "latitude":          round(lat, 4),
                "declinaison":       calc_declinaison(lon, lat, get_obliquity(jd)),
            }
        except Exception:
            return {
                "longitude_absolue": None, "fullDegree": None, "signe": None,
                "degre_dans_signe":  None, "latitude":   None, "declinaison": None,
            }

    cur = start_jd
    while cur < end_jd:
        try:
            res = swe.sol_eclipse_when_glob(cur, swe.FLG_MOSEPH)
            flags, tret = res[0], res[1]
            ejd = tret[0]
            if ejd > end_jd: break
            pos = get_eclipse_pos(ejd, swe.SUN)
            eclipses.append({"astre": "Soleil", "type": get_type(flags), "date_maximum": jd_to_str(ejd), **pos, "_jd": ejd})
            cur = ejd + 10
        except Exception:
            break

    cur = start_jd
    while cur < end_jd:
        try:
            res = swe.lun_eclipse_when(cur, swe.FLG_MOSEPH)
            flags, tret = res[0], res[1]
            ejd = tret[0]
            if ejd > end_jd: break
            pos = get_eclipse_pos(ejd, swe.MOON)
            eclipses.append({"astre": "Lune", "type": get_type(flags, lunar=True), "date_maximum": jd_to_str(ejd), **pos, "_jd": ejd})
            cur = ejd + 10
        except Exception:
            break

    eclipses.sort(key=lambda x: x["_jd"])
    for e in eclipses:
        del e["_jd"]
    return eclipses

# ─── /health ──────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok"}

# ─── /progressions ────────────────────────────────────────────────────────────
import calendar

def next_month(dt: datetime) -> datetime:
    month = dt.month % 12 + 1
    year  = dt.year + (dt.month // 12)
    day   = min(dt.day, calendar.monthrange(year, month)[1])
    return dt.replace(year=year, month=month, day=day)

@app.get("/progressions")
def get_progressions(
    date_debut: str = Query(...),
    date_fin:   str = Query(...),
    year: int = Query(...), month: int = Query(...), date: int = Query(...),
    hours: float = Query(...), minutes: float = Query(...), seconds: float = Query(0),
    latitude: float = Query(...), longitude: float = Query(...), timezone: float = Query(...),
):
    data = BirthData(year=year, month=month, date=date, hours=hours, minutes=minutes,
                     seconds=seconds, latitude=latitude, longitude=longitude, timezone=timezone)
    natal_jd = to_julian(data)
    birth_dt = datetime(data.year, data.month, data.date)
    start    = parse_date(date_debut)
    end      = parse_date(date_fin)
    results  = []
    # Arc Solaire : calculer MC natal et Soleil natal une seule fois
    natal_sun_pos, _ = swe.calc_ut(natal_jd, swe.SUN, swe.FLG_SWIEPH)
    natal_sun_lon     = natal_sun_pos[0]
    _, natal_ascmc    = swe.houses(natal_jd, data.latitude, data.longitude, b"P")
    natal_mc          = natal_ascmc[1]
    current  = start

    while current <= end:
        days_elapsed = (current - birth_dt).days
        age_years    = days_elapsed / 365.25
        prog_jd      = natal_jd + age_years
        epsilon      = get_obliquity(prog_jd)
        planetes     = {}

        for p in PLANETS:
            try:
                pos, _ = swe.calc_ut(prog_jd, p["id"], swe.FLG_SWIEPH | swe.FLG_SPEED)
                lon, lat, dist, speed = pos[0], pos[1], pos[2], pos[3]
                dec = calc_declinaison(lon, lat, epsilon)
                planetes[p["fr"]] = {
                    "longitude_absolue": round(lon, 4),
                    "signe":             ZODIAC_SIGNS_LIST[int(lon / 30) % 12],
                    "degre_dans_signe":  round(lon % 30, 4),
                    "est_retrograde":    speed < 0,
                    "latitude":          round(lat, 4),
                    "distance_ua":       round(dist, 6),
                    "vitesse_longitude": round(speed, 4),
                    "declinaison":       round(dec, 4),
                }
            except Exception:
                pass

        try:
            # ── Arc Solaire pour MC et ASC progressés ──
            prog_sun_pos, _ = swe.calc_ut(prog_jd, swe.SUN, swe.FLG_SWIEPH)
            arc = prog_sun_pos[0] - natal_sun_lon
            if arc >  180: arc -= 360
            if arc < -180: arc += 360
            prog_mc   = (natal_mc + arc) % 360
            # MC écliptique → RAMC
            eps_p     = get_obliquity(prog_jd)
            eq        = swe.cotrans([prog_mc, 0.0, 1.0], -eps_p)
            prog_ramc = eq[0] % 360
            # RAMC + latitude → cuspides Placidus
            _, prog_ascmc = swe.houses_armc(prog_ramc, data.latitude, eps_p, b"P")
            prog_asc  = prog_ascmc[0]
            for deg, key in [
                (prog_asc,               "Ascendant"),
                (prog_mc,                "MC"),
                ((prog_asc + 180) % 360, "Descendant"),
                ((prog_mc  + 180) % 360, "IC"),
            ]:
                planetes[key] = {
                    "longitude_absolue": round(deg, 4),
                    "signe":             ZODIAC_SIGNS_LIST[int(deg / 30) % 12],
                    "degre_dans_signe":  round(deg % 30, 4),
                    "est_retrograde":    False,
                    "declinaison":       None,
                }
        except Exception:
            pass

        results.append({
            "date":         current.strftime("%Y-%m-%d"),
            "age_annees":   round(age_years, 4),
            "jd_progresse": round(prog_jd, 6),
            "planetes":     planetes,
        })
        current = next_month(current)

    return results

# ─── /progressions/eclipses ───────────────────────────────────────────────────

def _check_local_sol(ejd_global: float, geopos: list) -> dict:
    """Vérifie la visibilité locale d'une éclipse solaire déjà trouvée globalement."""
    try:
        retflag, tret, attr = swe.sol_eclipse_when_loc(
            ejd_global - 0.5, geopos, False, swe.FLG_MOSEPH
        )
        ECL_VISIBLE = 0x100
        if abs(tret[0] - ejd_global) < 1.0:
            return {
                "visible": bool(retflag & ECL_VISIBLE),
                "magnitude": round(attr[0], 3),
                "heure_locale_max": tret[0],
            }
        return {"visible": False, "magnitude": 0.0, "heure_locale_max": None}
    except Exception:
        return {"visible": False, "magnitude": 0.0, "heure_locale_max": None}


def _check_local_lun(ejd_global: float, geopos: list) -> dict:
    """Vérifie la visibilité locale d'une éclipse lunaire déjà trouvée globalement."""
    try:
        retflag, tret, attr = swe.lun_eclipse_when_loc(
            ejd_global - 0.5, geopos, False, swe.FLG_MOSEPH
        )
        ECL_VISIBLE = 0x100
        if abs(tret[0] - ejd_global) < 1.0:
            return {
                "visible": bool(retflag & ECL_VISIBLE),
                "magnitude": round(attr[0], 3) if attr else 0.0,
                "heure_locale_max": tret[0],
            }
        return {"visible": False, "magnitude": 0.0, "heure_locale_max": None}
    except Exception:
        return {"visible": False, "magnitude": 0.0, "heure_locale_max": None}


@app.get("/progressions/eclipses")
def get_progressions_eclipses(
    date_debut: str = Query(...),
    date_fin:   str = Query(...),
    year: int = Query(...), month: int = Query(...), date: int = Query(...),
    hours: float = Query(...), minutes: float = Query(...), seconds: float = Query(0),
    latitude: float = Query(...), longitude: float = Query(...), timezone: float = Query(...),
):
    data = BirthData(year=year, month=month, date=date, hours=hours, minutes=minutes,
                     seconds=seconds, latitude=latitude, longitude=longitude, timezone=timezone)
    """
    Éclipses dans la fenêtre progressée (1 jour = 1 an).
    Recherche via when_glob (fiable), visibilité locale via when_loc.
    Retourne la date de vie réelle où chaque éclipse se manifeste.
    """
    natal_jd = to_julian(data)
    birth_dt = datetime(data.year, data.month, data.date)

    start = parse_date(date_debut)
    end   = parse_date(date_fin)

    age_start     = (start - birth_dt).days / 365.25
    age_end       = (end   - birth_dt).days / 365.25
    prog_jd_start = natal_jd + age_start
    prog_jd_end   = natal_jd + age_end

    geopos = [data.longitude, data.latitude, 0.0]

    def jd_to_str(jd):
        y, m, d, h = swe.revjul(jd)
        hh = int(h); mm = int((h - hh) * 60)
        if mm == 60: hh += 1; mm = 0
        return datetime(y, m, d, min(hh, 23), mm).strftime("%Y-%m-%d %H:%M UTC")

    def jd_to_life(ejd):
        years = ejd - natal_jd
        life_dt = birth_dt + timedelta(days=years * 365.25)
        return life_dt.strftime("%Y-%m-%d"), round(years, 4)

    def get_pos(jd, planet_id):
        try:
            pos, _ = swe.calc_ut(jd, planet_id, swe.FLG_MOSEPH)
            lon, lat = pos[0], pos[1]
            dec = calc_declinaison(lon, lat, get_obliquity(jd))
            return {
                "longitude_absolue": round(lon, 4),
                "signe":             ZODIAC_SIGNS_LIST[int(lon / 30) % 12],
                "degre_dans_signe":  round(lon % 30, 4),
                "declinaison":       round(dec, 4),
            }
        except Exception:
            return None

    def type_sol(f):
        if f & swe.ECL_TOTAL:         return "Totale"
        if f & swe.ECL_ANNULAR:       return "Annulaire"
        if f & swe.ECL_ANNULAR_TOTAL: return "Hybride"
        if f & swe.ECL_PARTIAL:       return "Partielle"
        return "Inconnue"

    def type_lun(f):
        if f & swe.ECL_TOTAL:     return "Totale"
        if f & swe.ECL_PARTIAL:   return "Partielle"
        if f & swe.ECL_PENUMBRAL: return "Pénombrale"
        return "Inconnue"

    eclipses = []
    MAX_ITER  = 50  # garde-fou anti-boucle infinie

    # ── Éclipses solaires ────────────────────────────────────────────────────
    cur, n = prog_jd_start, 0
    while cur < prog_jd_end and n < MAX_ITER:
        n += 1
        try:
            res = swe.sol_eclipse_when_glob(cur, swe.FLG_MOSEPH)
            flags, tret = res[0], res[1]
            ejd = tret[0]
            if ejd == 0 or ejd > prog_jd_end:
                break
            life_date, age = jd_to_life(ejd)
            local = _check_local_sol(ejd, geopos)
            pos   = get_pos(ejd, swe.SUN)
            eclipses.append({
                "astre":                 "Soleil",
                "type":                  type_sol(flags),
                "date_progresse":        jd_to_str(ejd),
                "date_vie":              life_date,
                "age_annees":            age,
                "visible_lieu_naissance": local["visible"],
                "magnitude":             local["magnitude"],
                "longitude_absolue":     pos["longitude_absolue"] if pos else None,
                "signe":                 pos["signe"] if pos else None,
                "degre_dans_signe":      pos["degre_dans_signe"] if pos else None,
                "declinaison":           pos["declinaison"] if pos else None,
                "_jd":                   ejd,
            })
            cur = ejd + 10
        except Exception:
            break

    # ── Éclipses lunaires ────────────────────────────────────────────────────
    cur, n = prog_jd_start, 0
    while cur < prog_jd_end and n < MAX_ITER:
        n += 1
        try:
            res = swe.lun_eclipse_when(cur, swe.FLG_MOSEPH)
            flags, tret = res[0], res[1]
            ejd = tret[0]
            if ejd == 0 or ejd > prog_jd_end:
                break
            life_date, age = jd_to_life(ejd)
            local = _check_local_lun(ejd, geopos)
            pos   = get_pos(ejd, swe.MOON)
            eclipses.append({
                "astre":                 "Lune",
                "type":                  type_lun(flags),
                "date_progresse":        jd_to_str(ejd),
                "date_vie":              life_date,
                "age_annees":            age,
                "visible_lieu_naissance": local["visible"],
                "magnitude":             local["magnitude"],
                "longitude_absolue":     pos["longitude_absolue"] if pos else None,
                "signe":                 pos["signe"] if pos else None,
                "degre_dans_signe":      pos["degre_dans_signe"] if pos else None,
                "declinaison":           pos["declinaison"] if pos else None,
                "_jd":                   ejd,
            })
            cur = ejd + 10
        except Exception:
            break

    eclipses.sort(key=lambda x: x["_jd"])
    for e in eclipses:
        del e["_jd"]

    return eclipses


# ─── /directions/primary ──────────────────────────────────────────────────────
# Ajout 2026-05-24 (Phase B P0) : route Naibod rigoureuse Swiss Eph pour
# fiabiliser les directions primaires (β réel + ε variable + lat géo réelle).
# Diff vs JS Super noeud1 actuel (β=0, ε=23.4393°) → −39 modulators DP nets sur
# baseline 150 cas (cf. SITE/scripts/dtc/PHASE-A-DIAG-2026-05-24.md).
import math as _math


class PrimaryDirectionsBody(BaseModel):
    """Input route /directions/primary.
    `mode` :
      - "rigoureux" (défaut) : β écliptique réel des planètes natales (Swiss Eph), ε variable T
      - "strict"             : β=0, ε fixe 23.4393° (= comportement JS Super noeud1, fallback bit-identique)
    `dp_orb_yr` : fenêtre orbe en années (default 1.0, idem JS).
    `aspects` : sous-ensemble des 5 aspects majeurs (default = tous).
    `natal_positions_override` : optionnel — utiliser des positions natales pré-calculées
      (par /western/planets) au lieu de re-calculer ; utile pour ISO-tests.
    """

    model_config = ConfigDict(extra="ignore")
    birth: BirthData
    target_year: int
    mode: str = "rigoureux"
    dp_orb_yr: float = 1.0
    aspects: list[str] | None = None


_DP_NAIBOD = 0.985647  # ° d'AR par an
_DP_ASPECTS = {"Conjonction": 0, "Opposition": 180, "Carré": 90, "Trigone": 120, "Sextile": 60}
_DP_PROMS = ["Soleil", "Lune", "Mercure", "Vénus", "Mars", "Jupiter",
             "Saturne", "Uranus", "Neptune", "Pluton"]
_DP_NODES = ["Nœud Nord", "Nœud Sud"]
_DP_SIG_PLANETS = ["Soleil", "Lune"]

_DP_SWE_BODY = {
    "Soleil": swe.SUN, "Lune": swe.MOON,
    "Mercure": swe.MERCURY, "Vénus": swe.VENUS, "Mars": swe.MARS,
    "Jupiter": swe.JUPITER, "Saturne": swe.SATURN,
    "Uranus": swe.URANUS, "Neptune": swe.NEPTUNE, "Pluton": swe.PLUTO,
    "Nœud Nord": swe.MEAN_NODE, "Nœud Sud": swe.MEAN_NODE,
}


def _dp_eq(lon_deg: float, lat_deg: float, eps_rad: float):
    """(λ, β) écliptique → (RA, δ) équatorial en degrés."""
    L = lon_deg * _math.pi / 180.0
    B = lat_deg * _math.pi / 180.0
    sinL, cosL = _math.sin(L), _math.cos(L)
    sinB, cosB = _math.sin(B), _math.cos(B)
    cosE, sinE = _math.cos(eps_rad), _math.sin(eps_rad)
    if cosB == 0:
        # cas dégénéré
        ra = (lon_deg) % 360
        dec = 90.0 if sinB > 0 else -90.0
        return ra, dec
    ra = _math.atan2(sinL * cosE - _math.tan(B) * sinE, cosL)
    dec = _math.asin(sinB * cosE + cosB * sinE * sinL)
    ra_deg = (_math.degrees(ra) % 360 + 360) % 360
    return ra_deg, _math.degrees(dec)


def _dp_ad(dec_rad: float, lat_rad: float):
    """Ascensional difference (degrés). None si circumpolaire."""
    v = _math.tan(dec_rad) * _math.tan(lat_rad)
    if abs(v) >= 1:
        return None
    return _math.degrees(_math.asin(v))


def _dp_axis_norm(prom: str, asp: str, sig: str):
    np_, na_, ns_ = prom, asp, sig
    if prom == "Nœud Sud":
        np_ = "Nœud Nord"
        if asp == "Conjonction":
            na_ = "Opposition"
        elif asp == "Opposition":
            na_ = "Conjonction"
    if sig == "DSC":
        ns_ = "ASC"
        if na_ == "Conjonction":
            na_ = "Opposition"
        elif na_ == "Opposition":
            na_ = "Conjonction"
    if sig == "IC":
        ns_ = "MC"
        if na_ == "Conjonction":
            na_ = "Opposition"
        elif na_ == "Opposition":
            na_ = "Conjonction"
    return f"{np_}|{na_}|{ns_}"


@app.post("/directions/primary")
def calc_primary_directions(body: PrimaryDirectionsBody):
    """Directions primaires Naibod (semi-arc) Swiss Eph.

    Output :
      {
        "statusCode": 200,
        "output": {
          "age_years": <float>,
          "jd_birth": <float>,
          "jd_year_mid": <float>,
          "epsilon_deg": <float>,
          "lat_geo": <float>,
          "mode": "rigoureux" | "strict",
          "natal_positions": { "<nom>": {"lon": ..., "lat_ecl": ..., "ra": ..., "dec": ...}, ... },
          "hits": [
            {"promissor": "...", "significator": "...", "aspect": "...",
             "orbYears": <float>, "direction": "directe"|"converse", "exactAge": <float>},
            ...
          ]
        }
      }
    """
    ensure_ephe_path()

    # ─ Étape 0 : JD birth + JD year_mid (1er juillet 12h UT cohérent avec _diag-dp-swisseph.py)
    jd_birth = to_julian(body.birth)
    jd_year_mid = swe.julday(int(body.target_year), 7, 1, 12.0)
    age = (jd_year_mid - jd_birth) / 365.25
    if age <= 0 or age > 130:
        return JSONResponse(
            {"statusCode": 400, "detail": f"Âge invalide: {age:.2f} (target_year={body.target_year}, birth_year={body.birth.year})"},
            status_code=400,
        )

    # ─ Étape 1 : obliquité + mode
    if body.mode == "strict":
        eps_deg = 23.4393
    else:
        eps_deg = get_obliquity(jd_birth)
    eps_rad = eps_deg * _math.pi / 180.0
    lat_rad = body.birth.latitude * _math.pi / 180.0

    # ─ Étape 2 : positions natales planètes (lon, β écliptique selon mode)
    natal_positions = {}
    for name, body_id in _DP_SWE_BODY.items():
        try:
            xx, _flg = swe.calc_ut(jd_birth, body_id, swe.FLG_SWIEPH | swe.FLG_SPEED)
            lon = xx[0]
            lat_ecl = xx[1] if body.mode == "rigoureux" else 0.0
            if name == "Nœud Sud":
                lon = (lon + 180.0) % 360.0
                lat_ecl = -lat_ecl
            ra, dec = _dp_eq(lon, lat_ecl, eps_rad)
            natal_positions[name] = {
                "lon": round(lon, 6),
                "lat_ecl": round(lat_ecl, 6),
                "ra": round(ra, 6),
                "dec": round(dec, 6),
            }
        except Exception:
            continue

    # ─ Étape 3 : angles via swe.houses (Placidus comme JS)
    houses, ascmc = swe.houses(jd_birth, body.birth.latitude, body.birth.longitude, b"P")
    angles_deg = {
        "Ascendant":      ascmc[0] % 360.0,
        "Milieu du Ciel": ascmc[1] % 360.0,
        "Descendant":     (ascmc[0] + 180.0) % 360.0,
        "Imum Coeli":     (ascmc[1] + 180.0) % 360.0,
    }

    # ─ Étape 4 : significators (cf. JS Super noeud1 lignes 6027-6031)
    sigs = []
    ra_mc, _dec_mc = _dp_eq(angles_deg["Milieu du Ciel"], 0.0, eps_rad)
    sigs.append({"name": "MC", "ref": ra_mc, "mode": "ra"})
    ra_ic, _dec_ic = _dp_eq(angles_deg["Imum Coeli"], 0.0, eps_rad)
    sigs.append({"name": "IC", "ref": ra_ic, "mode": "ra"})
    ra_asc, dec_asc = _dp_eq(angles_deg["Ascendant"], 0.0, eps_rad)
    ad_asc = _dp_ad(dec_asc * _math.pi / 180.0, lat_rad)
    if ad_asc is not None:
        sigs.append({"name": "ASC", "ref": ra_asc - ad_asc, "mode": "oa"})
    ra_dsc, dec_dsc = _dp_eq(angles_deg["Descendant"], 0.0, eps_rad)
    ad_dsc = _dp_ad(dec_dsc * _math.pi / 180.0, lat_rad)
    if ad_dsc is not None:
        sigs.append({"name": "DSC", "ref": ra_dsc + ad_dsc, "mode": "od"})
    for sN in _DP_SIG_PLANETS:
        if sN not in natal_positions:
            continue
        np_pos = natal_positions[sN]
        ad_p = _dp_ad(np_pos["dec"] * _math.pi / 180.0, lat_rad)
        if ad_p is None:
            continue
        sigs.append({"name": sN, "ref": np_pos["ra"] - ad_p, "mode": "oa"})

    # ─ Étape 5 : promissors
    proms = []
    for pN in _DP_PROMS + _DP_NODES:
        if pN not in natal_positions:
            continue
        np_pos = natal_positions[pN]
        ad_p = _dp_ad(np_pos["dec"] * _math.pi / 180.0, lat_rad)
        if ad_p is None:
            continue
        proms.append({"name": pN, "lon": np_pos["lon"], "lat_ecl": np_pos["lat_ecl"],
                      "ra": np_pos["ra"], "dec": np_pos["dec"],
                      "oa": np_pos["ra"] - ad_p, "od": np_pos["ra"] + ad_p})
    for aN, aDeg in angles_deg.items():
        ra_a, dec_a = _dp_eq(aDeg, 0.0, eps_rad)
        ad_a = _dp_ad(dec_a * _math.pi / 180.0, lat_rad)
        if ad_a is None:
            continue
        proms.append({"name": aN, "lon": aDeg, "lat_ecl": 0.0,
                      "ra": ra_a, "dec": dec_a,
                      "oa": ra_a - ad_a, "od": ra_a + ad_a})

    # ─ Étape 6 : matching aspects → arc Naibod → orb_years
    aspects_filter = body.aspects if body.aspects else list(_DP_ASPECTS.keys())
    hits_raw = []
    for sig in sigs:
        for prom in proms:
            if sig["name"] == prom["name"]:
                continue
            for asp_name in aspects_filter:
                if asp_name not in _DP_ASPECTS:
                    continue
                asp_a = _DP_ASPECTS[asp_name]
                asp_lon = (prom["lon"] + asp_a) % 360.0
                ra_asp, dec_asp = _dp_eq(asp_lon, 0.0, eps_rad)  # aspect projeté β=0 (idem JS)
                if sig["mode"] == "ra":
                    prom_ref = ra_asp
                else:
                    ad_a = _dp_ad(dec_asp * _math.pi / 180.0, lat_rad)
                    if ad_a is None:
                        continue
                    prom_ref = ra_asp - ad_a if sig["mode"] == "oa" else ra_asp + ad_a
                arc = prom_ref - sig["ref"]
                arc = ((arc + 540.0) % 360.0) - 180.0
                dir_age = abs(arc) / _DP_NAIBOD
                diff = dir_age - age
                if abs(diff) <= body.dp_orb_yr:
                    orb_y = abs(diff)
                    hits_raw.append({
                        "promissor": prom["name"],
                        "significator": sig["name"],
                        "aspect": asp_name,
                        "orbYears": round(orb_y, 4),
                        "orbDeg": round(orb_y * _DP_NAIBOD, 4),
                        "direction": "directe" if arc >= 0 else "converse",
                        "exactAge": round(dir_age, 4),
                    })

    # ─ Étape 7 : dédup axial (idem JS Super noeud1 lignes 6062-6086)
    seen = set()
    hits = []
    for h in sorted(hits_raw, key=lambda x: x["orbYears"]):
        k = _dp_axis_norm(h["promissor"], h["aspect"], h["significator"])
        if k not in seen:
            seen.add(k)
            hits.append(h)

    return {
        "statusCode": 200,
        "output": {
            "age_years": round(age, 4),
            "jd_birth": round(jd_birth, 6),
            "jd_year_mid": round(jd_year_mid, 6),
            "epsilon_deg": round(eps_deg, 6),
            "lat_geo": body.birth.latitude,
            "mode": body.mode,
            "n_hits": len(hits),
            "natal_positions": natal_positions,
            "hits": hits,
        },
    }


# ============================================================================
# ─── /solar-return + /lunar-return  (TRANCHE 3 V23 — 2026-06-02)
# ============================================================================
# Doctrines : Brady Ch.6 R.6.1 (SR stand-alone chart of the year)
#           : Rushman Ch.5 R.5.1 (most powerful technique year ahead)
#           : Teal Ch.10 R.T.10.1-10.6 (SR + LR + matching + retrograde)
# OQ.T.4    : precessed-only MVP (precession 50.29 arcsec/an)
# ============================================================================

def _normalize_lon(lon):
    return ((lon % 360) + 360) % 360


def _lon_diff_signed(a, b):
    """Signed shortest angular distance a -> b, in [-180, 180]."""
    d = (b - a) % 360
    if d > 180:
        d -= 360
    return d


def _calc_planet_lon_speed(jd, planet_id):
    """Retourne (lon, speed) d'une planete a jd UT."""
    ensure_ephe_path()
    flags_list = [swe.FLG_SWIEPH | swe.FLG_SPEED, swe.FLG_MOSEPH | swe.FLG_SPEED]
    last_err = None
    for flag in flags_list:
        try:
            res, _ = swe.calc_ut(jd, planet_id, flag)
            return res[0], res[3]
        except Exception as e:
            last_err = e
            continue
    raise RuntimeError(f"calc_ut failed for planet {planet_id}: {last_err}")


def _find_return_jd(jd_start, target_lon, planet_id, max_iter=25, tol_deg=1e-5):
    """Recherche dichotomique/Newton de jd tel que lon(planet, jd) = target.
    Cherche le PROCHAIN retour apres jd_start.
    """
    lon0, speed0 = _calc_planet_lon_speed(jd_start, planet_id)
    diff = _lon_diff_signed(lon0, target_lon)
    # Si la planete avance et est passe au-dela : prochain retour = ajouter cycle
    if speed0 > 0 and diff < 0:
        diff += 360
    elif speed0 < 0 and diff > 0:
        diff -= 360
    jd_approx = jd_start + diff / speed0

    for _ in range(max_iter):
        lon_i, speed_i = _calc_planet_lon_speed(jd_approx, planet_id)
        diff_i = _lon_diff_signed(lon_i, target_lon)
        if abs(diff_i) < tol_deg:
            break
        if speed_i == 0:
            break
        jd_approx += diff_i / speed_i
    return jd_approx


def _fmt_jd_iso(jd):
    """Formate JD UT en chaine ISO 8601 UTC."""
    y, m, d, h = swe.revjul(jd)
    hour_int = int(h)
    minute_f = (h - hour_int) * 60.0
    minute_int = int(minute_f)
    second_int = int(round((minute_f - minute_int) * 60.0))
    if second_int >= 60:
        second_int = 0
        minute_int += 1
    if minute_int >= 60:
        minute_int = 0
        hour_int += 1
    return f"{int(y):04d}-{int(m):02d}-{int(d):02d}T{hour_int:02d}:{minute_int:02d}:{second_int:02d}Z"


def _planet_block(jd, planet_def, epsilon, detailed=True):
    """Retourne un bloc planete formate comme TRANSIT_OBJECTS."""
    try:
        lon, speed = _calc_planet_lon_speed(jd, planet_def["id"])
        flags_list = [swe.FLG_SWIEPH | swe.FLG_SPEED, swe.FLG_MOSEPH | swe.FLG_SPEED]
        for flag in flags_list:
            try:
                res, _ = swe.calc_ut(jd, planet_def["id"], flag)
                lat = res[1]
                dist = res[2]
                break
            except Exception:
                continue
        block = {
            "longitude_absolue": round(lon, 4),
            "signe": ZODIAC_SIGNS_LIST[int(lon / 30) % 12],
            "degre_dans_signe": round(lon % 30, 4),
            "est_retrograde": speed < 0,
        }
        if detailed:
            block["latitude"] = round(lat, 4)
            block["distance_ua"] = round(dist, 6)
            block["vitesse_longitude"] = round(speed, 4)
            block["declinaison"] = calc_declinaison(lon, lat, epsilon)
        return block
    except Exception:
        return None


def _cusps_block(jd, lat, lon):
    """Retourne 12 cuspides Placidus + ASC/MC/ARMC."""
    ensure_ephe_path()
    cusps, ascmc = swe.houses(jd, lat, lon, b"P")
    cusps_list = []
    for i, c in enumerate(cusps):
        cusps_list.append({
            "house": i + 1,
            "longitude": round(c, 4),
            "signe": ZODIAC_SIGNS_LIST[int(c / 30) % 12],
            "degre_dans_signe": round(c % 30, 4),
        })
    return {
        "cusps": cusps_list,
        "asc": round(ascmc[0], 4),
        "mc": round(ascmc[1], 4),
        "armc": round(ascmc[2], 4),
    }


# ----------------------------------------------------------------------------
# /solar-return
# ----------------------------------------------------------------------------

class SolarReturnRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    natal: BirthData
    year: int
    precessed: bool = True


@app.post("/solar-return")
def solar_return(req: SolarReturnRequest):
    ensure_ephe_path()
    jd_natal = to_julian(req.natal)
    sun_natal_lon, _ = _calc_planet_lon_speed(jd_natal, swe.SUN)

    # OQ.T.4 : precession 50.29 arcsec/an (precessed return = standard western moderne)
    if req.precessed:
        age_years = req.year - req.natal.year
        target_lon = _normalize_lon(sun_natal_lon + age_years * (50.29 / 3600.0))
    else:
        target_lon = sun_natal_lon

    # Recherche brackette : on commence au 1er jan de l'annee cible
    jd_anchor = swe.julday(req.year, 1, 1, 0.0)
    jd_sr = _find_return_jd(jd_anchor, target_lon, swe.SUN)

    epsilon = get_obliquity(jd_sr)
    planets = {}
    for p in PLANETS:
        block = _planet_block(jd_sr, p, epsilon, detailed=True)
        if block:
            planets[p["fr"]] = block
    houses_data = _cusps_block(jd_sr, req.natal.latitude, req.natal.longitude)

    return {
        "statusCode": 200,
        "output": {
            "sr_date_utc": _fmt_jd_iso(jd_sr),
            "sr_julian": round(jd_sr, 6),
            "year": req.year,
            "sun_natal_lon": round(sun_natal_lon, 4),
            "sun_target_lon": round(target_lon, 4),
            "precessed": req.precessed,
            "lat_used": req.natal.latitude,
            "lon_used": req.natal.longitude,
            "planets": planets,
            **houses_data,
        },
    }


# ----------------------------------------------------------------------------
# /lunar-return
# ----------------------------------------------------------------------------

class LunarReturnRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    natal: BirthData
    period_start: str  # "yyyy-mm-dd" ou "dd/mm/yyyy"
    period_end: str
    precessed: bool = True


@app.post("/lunar-return")
def lunar_return(req: LunarReturnRequest):
    ensure_ephe_path()
    jd_natal = to_julian(req.natal)
    moon_natal_lon, _ = _calc_planet_lon_speed(jd_natal, swe.MOON)

    start = parse_date(req.period_start)
    end = parse_date(req.period_end)

    if req.precessed:
        age_years = start.year - req.natal.year
        target_lon = _normalize_lon(moon_natal_lon + age_years * (50.29 / 3600.0))
    else:
        target_lon = moon_natal_lon

    jd_start = swe.julday(start.year, start.month, start.day, 0.0)
    jd_end = swe.julday(end.year, end.month, end.day, 23.99)

    returns = []
    jd_cursor = jd_start
    max_returns = 50  # ~3.5 ans max
    while jd_cursor < jd_end and len(returns) < max_returns:
        jd_lr = _find_return_jd(jd_cursor, target_lon, swe.MOON)
        if jd_lr > jd_end:
            break
        if jd_lr <= jd_cursor:
            jd_cursor += 1.0
            continue

        epsilon = get_obliquity(jd_lr)
        planets = {}
        for p in PLANETS:
            block = _planet_block(jd_lr, p, epsilon, detailed=False)
            if block:
                planets[p["fr"]] = block
        houses_data = _cusps_block(jd_lr, req.natal.latitude, req.natal.longitude)

        returns.append({
            "lr_date_utc": _fmt_jd_iso(jd_lr),
            "lr_julian": round(jd_lr, 6),
            "moon_target_lon": round(target_lon, 4),
            "planets": planets,
            **houses_data,
        })

        # Avancer le curseur : Moon LR cycle = ~27.3 jours, on saute 25j
        jd_cursor = jd_lr + 25.0

    return {
        "statusCode": 200,
        "output": {
            "moon_natal_lon": round(moon_natal_lon, 4),
            "moon_target_lon": round(target_lon, 4),
            "precessed": req.precessed,
            "lat_used": req.natal.latitude,
            "lon_used": req.natal.longitude,
            "count": len(returns),
            "returns": returns,
        },
    }
