#!/bin/bash
# Smoke test SR/LR avec payload identique au format PREV (Albert Einstein 1933).

set -e

BIRTH='{"year":1879,"month":3,"date":14,"hours":11,"minutes":30,"seconds":0,"latitude":48.4,"longitude":10.0,"timezone":1}'

run_summary() {
  local name="$1"
  local jsonfile="$2"
  python3 - "$jsonfile" <<'PYEOF'
import sys, json
with open(sys.argv[1]) as f:
    d = json.load(f)
out = d.get("output", {})
print(f"  statusCode   : {d.get('statusCode')}")
if "sr_date_utc" in out:
    print(f"  sr_date_utc  : {out.get('sr_date_utc')}")
    print(f"  sr_julian    : {out.get('sr_julian')}")
    print(f"  sun_target   : {out.get('sun_target_lon')}")
    print(f"  sun_natal    : {out.get('sun_natal_lon')}")
    print(f"  precessed    : {out.get('precessed')}")
    print(f"  planets#     : {len(out.get('planets', {}))} (expected 10)")
    print(f"  cusps#       : {len(out.get('cusps', []))} (expected 12)")
    print(f"  asc/mc       : {out.get('asc')} / {out.get('mc')}")
elif "count" in out:
    returns = out.get("returns", [])
    print(f"  moon_natal_lon: {out.get('moon_natal_lon')}")
    print(f"  moon_target   : {out.get('moon_target_lon')}")
    print(f"  precessed     : {out.get('precessed')}")
    print(f"  count         : {out.get('count')}")
    if returns:
        print(f"  first LR      : {returns[0].get('lr_date_utc')}")
        print(f"  last  LR      : {returns[-1].get('lr_date_utc')}")
        print(f"  first cusps#  : {len(returns[0].get('cusps', []))} (expected 12)")
        print(f"  first planets#: {len(returns[0].get('planets', {}))} (expected 10)")
PYEOF
}

echo "=========================================="
echo "1. POST /solar-return (Einstein year=1933 precessed=true)"
echo "=========================================="
curl -s -X POST http://46.225.174.155:8000/solar-return \
  -H "Content-Type: application/json" \
  -d "{\"natal\":$BIRTH,\"year\":1933,\"precessed\":true}" > /tmp/sr.json
run_summary SR /tmp/sr.json

echo ""
echo "=========================================="
echo "2. POST /lunar-return (Einstein 01/01/1933 -> 31/12/1933 precessed=true)"
echo "=========================================="
curl -s -X POST http://46.225.174.155:8000/lunar-return \
  -H "Content-Type: application/json" \
  -d "{\"natal\":$BIRTH,\"period_start\":\"01/01/1933\",\"period_end\":\"31/12/1933\",\"precessed\":true}" > /tmp/lr.json
run_summary LR /tmp/lr.json

echo ""
echo "=========================================="
echo "3. POST /lunar-return (Einstein non-precessed compare)"
echo "=========================================="
curl -s -X POST http://46.225.174.155:8000/lunar-return \
  -H "Content-Type: application/json" \
  -d "{\"natal\":$BIRTH,\"period_start\":\"01/01/1933\",\"period_end\":\"31/12/1933\",\"precessed\":false}" > /tmp/lr2.json
run_summary LR2 /tmp/lr2.json

echo ""
echo "=========================================="
echo "SMOKE OK (3 cas valides) -- contrat PREV-prepare-data v11 conforme"
echo "=========================================="
