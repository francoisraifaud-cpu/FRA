#!/bin/bash
# Smoke test SR/LR avec relocation Doctrine B Volguine.
# Comparaison Einstein 1933 : naissance Ulm vs anniv Paris vs anniv New York.

set -e

BIRTH='{"year":1879,"month":3,"date":14,"hours":11,"minutes":30,"seconds":0,"latitude":48.4,"longitude":10.0,"timezone":1}'

print_sr() {
  local jsonfile="$1"
  python3 - "$jsonfile" <<'PYEOF'
import sys, json
with open(sys.argv[1]) as f:
    d = json.load(f)
out = d.get("output", {})
print(f"  status        : {d.get('statusCode')}")
print(f"  sr_date_utc   : {out.get('sr_date_utc')}")
print(f"  relocated     : {out.get('relocated')}")
print(f"  reloc_label   : {out.get('relocation_label')}")
print(f"  lat/lon used  : {out.get('lat_used')} / {out.get('lon_used')}")
print(f"  asc / mc      : {out.get('asc')} / {out.get('mc')}")
print(f"  cusp_1        : {out.get('cusps', [{}])[0].get('longitude') if out.get('cusps') else 'N/A'}")
PYEOF
}

print_lr() {
  local jsonfile="$1"
  python3 - "$jsonfile" <<'PYEOF'
import sys, json
with open(sys.argv[1]) as f:
    d = json.load(f)
out = d.get("output", {})
returns = out.get("returns", [])
print(f"  status        : {d.get('statusCode')}")
print(f"  relocated     : {out.get('relocated')}")
print(f"  reloc_label   : {out.get('relocation_label')}")
print(f"  lat/lon used  : {out.get('lat_used')} / {out.get('lon_used')}")
print(f"  count         : {out.get('count')}")
if returns:
    print(f"  first LR date : {returns[0].get('lr_date_utc')}")
    print(f"  first asc/mc  : {returns[0].get('asc')} / {returns[0].get('mc')}")
PYEOF
}

echo "=========================================="
echo "TEST 1. SR Einstein 1933 SANS relocation (= natal Ulm fallback)"
echo "=========================================="
curl -s -X POST http://46.225.174.155:8000/solar-return \
  -H "Content-Type: application/json" \
  -d "{\"natal\":$BIRTH,\"year\":1933,\"precessed\":true}" > /tmp/sr_natal.json
print_sr /tmp/sr_natal.json

echo ""
echo "=========================================="
echo "TEST 2. SR Einstein 1933 RELOCATION Paris (48.85 / 2.35)"
echo "=========================================="
curl -s -X POST http://46.225.174.155:8000/solar-return \
  -H "Content-Type: application/json" \
  -d "{\"natal\":$BIRTH,\"year\":1933,\"precessed\":true,\"relocation_lat\":48.85,\"relocation_lon\":2.35,\"relocation_label\":\"Paris, France\"}" > /tmp/sr_paris.json
print_sr /tmp/sr_paris.json

echo ""
echo "=========================================="
echo "TEST 3. SR Einstein 1933 RELOCATION New York (40.71 / -74.01)"
echo "=========================================="
curl -s -X POST http://46.225.174.155:8000/solar-return \
  -H "Content-Type: application/json" \
  -d "{\"natal\":$BIRTH,\"year\":1933,\"precessed\":true,\"relocation_lat\":40.71,\"relocation_lon\":-74.01,\"relocation_label\":\"New York, USA\"}" > /tmp/sr_ny.json
print_sr /tmp/sr_ny.json

echo ""
echo "=========================================="
echo "TEST 4. LR Einstein 1933 RELOCATION Paris (premiere LR)"
echo "=========================================="
curl -s -X POST http://46.225.174.155:8000/lunar-return \
  -H "Content-Type: application/json" \
  -d "{\"natal\":$BIRTH,\"period_start\":\"01/01/1933\",\"period_end\":\"31/12/1933\",\"precessed\":true,\"relocation_lat\":48.85,\"relocation_lon\":2.35,\"relocation_label\":\"Paris, France\"}" > /tmp/lr_paris.json
print_lr /tmp/lr_paris.json

echo ""
echo "=========================================="
echo "TEST 5. Coordonnees relocation INVALIDES (lat=999) -> fallback natal"
echo "=========================================="
curl -s -X POST http://46.225.174.155:8000/solar-return \
  -H "Content-Type: application/json" \
  -d "{\"natal\":$BIRTH,\"year\":1933,\"precessed\":true,\"relocation_lat\":999.0,\"relocation_lon\":2.35}" > /tmp/sr_invalid.json
print_sr /tmp/sr_invalid.json

echo ""
echo "=========================================="
echo "ATTENDU :"
echo " - TEST 1 == TEST 5 (fallback natal car coords invalides)"
echo " - TEST 1 != TEST 2 != TEST 3 (asc/mc tres differents selon lieu)"
echo " - TEST 1 vs TEST 2 : sr_date_utc identique (Sun = global), seul asc/mc/cusps changent"
echo "=========================================="
