import { readFileSync, writeFileSync } from "node:fs";

const file = "c:/Users/fraif/Documents/Astro Code/FRA/PREV/N8N Prev";
let content = readFileSync(file, "utf8");

const badRegex = /const ramcRad = Math\.atan2\(Math\.sin\(mcRad\) \* Math\.cos\(eps\), Math\.cos\(mcRad\)\);\\n    const ramcOpp = ramcRad \+ Math\.PI;\\n    const coLat = 90 - _s64Lat;\\n    const tanCoLat = Math\.tan\(coLat \* _S64_RAD\);\\n    const vRad = Math\.atan2\(Math\.cos\(ramcOpp\), -Math\.sin\(ramcOpp\) \* Math\.cos\(eps\) - tanCoLat \* Math\.sin\(eps\)\);\\n    const vertexDeg = \(\(vRad \/ _S64_RAD \+ 360\) % 360\);/;

const goodStr = `const ramcRad = Math.atan2(Math.sin(mcRad) * Math.cos(eps), Math.cos(mcRad));
    const ramcOpp = ramcRad + Math.PI;
    const coLat = 90 - _s64Lat;
    const tanCoLat = Math.tan(coLat * _S64_RAD);
    const vRad = Math.atan2(Math.cos(ramcOpp), -Math.sin(ramcOpp) * Math.cos(eps) - tanCoLat * Math.sin(eps));
    const vertexDeg = ((vRad / _S64_RAD + 360) % 360);`;

if (badRegex.test(content)) {
  content = content.replace(badRegex, goodStr);
  writeFileSync(file, content, "utf8");
  console.log("Fixed newlines!");
} else {
  console.log("Not found!");
}
