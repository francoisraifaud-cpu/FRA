// Audit quantitatif de la matrice questionnaire DHN v5.5 (Scorer1).
// Produit un rapport markdown détaillé sur stdout (à rediriger vers AUDIT MATRICE QUESTIONNAIRE v5.5.md).
// Aucun side-effect : lecture pure du Scan fin Planetes + dhn-questions-data.

'use strict';
const fs = require('fs');
const path = require('path');

// ─── 1. Charger la matrice du Scorer1 ────────────────────────────────────────
// Le fichier "N8N DHN Scan fin Planetes" est un export JSON n8n ; le code JS est dans
// le champ jsCode du nœud Scorer1. On parse le JSON, on récupère la chaîne, puis on
// extrait la définition `const M = { ... };` par regex et on l'évalue.
const scoreJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'N8N DHN Scan fin Planetes'), 'utf8'),
);
const scorerNode = scoreJson.nodes.find(n => n.name === 'Scorer1');
if (!scorerNode) throw new Error('Nœud Scorer1 introuvable');
const jsCode = scorerNode.parameters.jsCode;
const mMatch = jsCode.match(/const M=\{([\s\S]*?)\};\s*\nfor\(let q=1/);
if (!mMatch) throw new Error('Matrice M introuvable dans le jsCode du Scorer1');
const M = (new Function('return {' + mMatch[1] + '};'))();

// ─── 2. Charger les libellés côté site ───────────────────────────────────────
const specsFile = fs.readFileSync(
  path.join(__dirname, '..', '..', 'SITE', 'lib', 'dhn-questions-data.ts'),
  'utf8',
);
// Parsing très léger : extraire les blocs { value: "x", label: "..." } par question
const specs = {};
const qBlocks = specsFile.split(/\{\s*key:\s*"(q\d+)",/);
for (let i = 1; i < qBlocks.length; i += 2) {
  const qKey = qBlocks[i];
  const body = qBlocks[i + 1];
  const labelMatch = body.match(/label:\s*"([^"]+)"/);
  const choices = [];
  const choiceRegex = /\{\s*value:\s*"(\w+)",\s*label:\s*"([^"]+)"\s*\}/g;
  let cm;
  while ((cm = choiceRegex.exec(body))) choices.push({ value: cm[1], label: cm[2] });
  specs[qKey] = { label: labelMatch ? labelMatch[1] : '?', choices };
}

const SIGNS = [
  'Belier', 'Taureau', 'Gemeaux', 'Cancer', 'Lion', 'Vierge',
  'Balance', 'Scorpion', 'Sagittaire', 'Capricorne', 'Verseau', 'Poissons',
];

// ─── 3. Métriques ────────────────────────────────────────────────────────────

// Signature par signe : combien de fois apparaît, points cumulés tous mentions confondues
const signApparitions = {};
const signPointsCumules = {};
for (const s of SIGNS) { signApparitions[s] = 0; signPointsCumules[s] = 0; }

for (const qKey of Object.keys(M)) {
  for (const opt of Object.keys(M[qKey])) {
    for (const [sign, pts] of Object.entries(M[qKey][opt])) {
      signApparitions[sign] = (signApparitions[sign] || 0) + 1;
      signPointsCumules[sign] = (signPointsCumules[sign] || 0) + pts;
    }
  }
}

// Score max théorique par signe : si on choisit pour chaque question l'option qui maximise ce signe
const signMax = {};
for (const s of SIGNS) {
  let total = 0;
  for (const qKey of Object.keys(M)) {
    let bestOptPts = 0;
    for (const opt of Object.keys(M[qKey])) {
      const v = M[qKey][opt][s] || 0;
      if (v > bestOptPts) bestOptPts = v;
    }
    total += bestOptPts;
  }
  signMax[s] = total;
}

// Score max GLOBAL d'une réponse (somme des max par option, indicateur de "puissance" question)
const qPotency = {};
for (const qKey of Object.keys(M)) {
  let totalAllOpts = 0;
  let maxOptScore = 0;
  for (const opt of Object.keys(M[qKey])) {
    const sumThisOpt = Object.values(M[qKey][opt]).reduce((a, b) => a + b, 0);
    totalAllOpts += sumThisOpt;
    if (sumThisOpt > maxOptScore) maxOptScore = sumThisOpt;
  }
  qPotency[qKey] = {
    optCount: Object.keys(M[qKey]).length,
    totalAllOpts,
    maxOptScore,
    avgOptScore: totalAllOpts / Object.keys(M[qKey]).length,
  };
}

// Discriminance d'une question : pour chaque signe, écart entre réponse "best" et "0"
// Plus l'écart moyen est élevé, plus la question départage. Indicateur de pouvoir discriminant.
const qDiscriminance = {};
for (const qKey of Object.keys(M)) {
  let cumulSpread = 0;
  for (const s of SIGNS) {
    let bestForSign = 0;
    for (const opt of Object.keys(M[qKey])) {
      const v = M[qKey][opt][s] || 0;
      if (v > bestForSign) bestForSign = v;
    }
    cumulSpread += bestForSign;
  }
  qDiscriminance[qKey] = {
    avgBestPerSign: cumulSpread / SIGNS.length,
    signsCovered: SIGNS.filter(s => {
      for (const opt of Object.keys(M[qKey])) {
        if ((M[qKey][opt][s] || 0) > 0) return true;
      }
      return false;
    }).length,
  };
}

// Couverture signe par question : matrice booléenne signe x question
const coverageMatrix = {};
for (const s of SIGNS) coverageMatrix[s] = {};
for (const qKey of Object.keys(M)) {
  for (const s of SIGNS) {
    let bestForSign = 0;
    for (const opt of Object.keys(M[qKey])) {
      const v = M[qKey][opt][s] || 0;
      if (v > bestForSign) bestForSign = v;
    }
    coverageMatrix[s][qKey] = bestForSign;
  }
}

// ─── 4. Génération du rapport markdown ───────────────────────────────────────

const out = [];
const push = (...l) => out.push(...l);

push('# Audit quantitatif — Matrice questionnaire DHN (v5.5)');
push('');
push('**Source** : `FRA/DHN/N8N DHN Scan fin Planetes` → nœud `Scorer1` → variable `M`');
push('**Libellés** : `SITE/lib/dhn-questions-data.ts` → `DHN_QUESTION_SPECS`');
push('**Date audit** : ' + new Date().toISOString().slice(0, 10));
push('');
push('Ce rapport est **descriptif** : il décrit l\'état actuel de la matrice. Aucune correction n\'est appliquée.');
push('Une seconde phase proposera des ajustements à valider explicitement avant implémentation.');
push('');
push('---');
push('');

// ── Section 1 : équilibrage signes ──
push('## 1. Équilibrage par signe — score max théorique');
push('');
push('Pour chaque signe, score max si l\'utilisateur répondait toujours l\'option qui le maximise.');
push('Idéal recherché : tous les signes ≈ même plafond (matrice non biaisée vers un signe particulier).');
push('');
push('| Signe | Apparitions* | Points cumulés** | Score max théorique | Δ vs moyenne |');
push('|---|---:|---:|---:|---:|');
const maxValues = SIGNS.map(s => signMax[s]);
const avgMax = maxValues.reduce((a, b) => a + b, 0) / maxValues.length;
const sortedSigns = [...SIGNS].sort((a, b) => signMax[b] - signMax[a]);
for (const s of sortedSigns) {
  const delta = signMax[s] - avgMax;
  const deltaPct = ((delta / avgMax) * 100).toFixed(1);
  const tag = Math.abs(delta) > avgMax * 0.15 ? ' ⚠' : '';
  push(`| ${s} | ${signApparitions[s]} | ${signPointsCumules[s]} | **${signMax[s]}**${tag} | ${delta > 0 ? '+' : ''}${delta} (${deltaPct}%) |`);
}
push('');
push(`*Apparitions = nombre de fois où le signe est cité dans une option (toutes questions confondues, ${SIGNS.reduce((a, s) => a + signApparitions[s], 0)} mentions au total).`);
push(`**Points cumulés = somme des points attribués à ce signe dans toutes les options de toutes les questions.`);
push(`Moyenne du score max théorique : **${avgMax.toFixed(1)}** ; min/max : ${Math.min(...maxValues)} / ${Math.max(...maxValues)}.`);
const stdDev = Math.sqrt(maxValues.reduce((a, x) => a + (x - avgMax) ** 2, 0) / maxValues.length);
push(`Écart-type : **${stdDev.toFixed(1)}** (idéalement < ${(avgMax * 0.1).toFixed(1)} = 10% de la moyenne).`);
push('');

// ── Section 2 : puissance & discriminance par question ──
push('## 2. Puissance & discriminance par question');
push('');
push('- **Options** : nombre de choix proposés (6 à 9 selon les questions).');
push('- **Σ pts toutes options** : somme totale des points distribués (option 1 + 2 + …) — proxy "puissance" de la question.');
push('- **Best opt** : meilleur cumul d\'une option seule (= score max possible si on tombe sur la réponse la plus "chargée").');
push('- **Discriminance** : score moyen "best" disponible par signe (cumul ÷ 12 signes). Plus c\'est élevé, plus la question départage.');
push('- **Signes couverts** : nombre de signes (sur 12) qui peuvent recevoir > 0 point via cette question.');
push('');
push('| Q | Options | Σ pts toutes opts | Best opt | Discriminance | Signes couverts |');
push('|---|---:|---:|---:|---:|---:|');
for (const qKey of Object.keys(M).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)))) {
  const p = qPotency[qKey];
  const d = qDiscriminance[qKey];
  const tag = d.signsCovered < 10 ? ' ⚠' : '';
  push(`| ${qKey} | ${p.optCount} | ${p.totalAllOpts} | ${p.maxOptScore} | ${d.avgBestPerSign.toFixed(2)} | ${d.signsCovered}/12${tag} |`);
}
push('');

// ── Section 3 : couverture matrice signe × question ──
push('## 3. Matrice de couverture signe × question');
push('');
push('Cellule = score max qu\'un signe peut obtenir via cette question (0 = signe absent de toutes les options).');
push('');
const headers = ['Signe', ...Object.keys(M).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)))];
push('| ' + headers.join(' | ') + ' | Total |');
push('|' + headers.map(() => '---').join('|') + '|---|');
for (const s of sortedSigns) {
  const row = [s];
  let total = 0;
  for (const qKey of Object.keys(M).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)))) {
    const v = coverageMatrix[s][qKey];
    row.push(v === 0 ? '·' : String(v));
    total += v;
  }
  row.push('**' + total + '**');
  push('| ' + row.join(' | ') + ' |');
}
push('');

// ── Section 4 : alertes / anomalies détectées ──
push('## 4. Alertes — anomalies à examiner');
push('');

// 4.1 signes avec un trou (zéro sur une question)
const trous = [];
for (const s of SIGNS) {
  for (const qKey of Object.keys(M)) {
    if (coverageMatrix[s][qKey] === 0) trous.push(`${s} → ${qKey}`);
  }
}
if (trous.length > 0) {
  push(`### 4.1 Signes "absents" d'une question (${trous.length} cas)`);
  push('');
  push('Aucun chemin de réponse ne donne de point à ces couples signe/question. Cela signifie qu\'un utilisateur pleinement de ce signe peut perdre la totalité de la question. Pas forcément un défaut (la matrice peut volontairement réserver une question à certains signes), mais à examiner.');
  push('');
  // Grouper par signe
  const trousBySign = {};
  for (const t of trous) {
    const [s, q] = t.split(' → ');
    (trousBySign[s] = trousBySign[s] || []).push(q);
  }
  for (const s of Object.keys(trousBySign).sort()) {
    push(`- **${s}** : absent de ${trousBySign[s].join(', ')} (${trousBySign[s].length} question(s) sur 12)`);
  }
  push('');
}

// 4.2 questions à faible discriminance
const lowDiscr = [];
for (const qKey of Object.keys(qDiscriminance)) {
  if (qDiscriminance[qKey].signsCovered < 10) {
    lowDiscr.push({ q: qKey, ...qDiscriminance[qKey] });
  }
}
if (lowDiscr.length > 0) {
  push('### 4.2 Questions à faible couverture (< 10 signes / 12)');
  push('');
  for (const l of lowDiscr) {
    push(`- **${l.q}** : ${l.signsCovered} signes couverts seulement, discriminance moyenne ${l.avgBestPerSign.toFixed(2)}`);
  }
  push('');
}

// 4.3 signes sur/sous-représentés
push('### 4.3 Top 3 signes sur-représentés vs sous-représentés');
push('');
push('**Top 3 plafonds les plus hauts** (avantagés) :');
for (const s of sortedSigns.slice(0, 3)) {
  push(`- ${s} : score max **${signMax[s]}** pts (apparitions=${signApparitions[s]})`);
}
push('');
push('**Bottom 3 plafonds** (désavantagés) :');
for (const s of sortedSigns.slice(-3).reverse()) {
  push(`- ${s} : score max **${signMax[s]}** pts (apparitions=${signApparitions[s]})`);
}
push('');

// ── Section 5 : détail par question avec libellés ──
push('## 5. Détail par question (libellé × options × scoring)');
push('');
for (const qKey of Object.keys(M).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)))) {
  const spec = specs[qKey];
  push(`### ${qKey} — *${spec ? spec.label : '?'}*`);
  push('');
  push('| Opt | Libellé front | Scoring matrice (signe : pts) |');
  push('|---|---|---|');
  for (const opt of Object.keys(M[qKey])) {
    const choice = spec && spec.choices.find(c => c.value === opt);
    const scoring = Object.entries(M[qKey][opt])
      .sort((a, b) => b[1] - a[1])
      .map(([s, p]) => `${s}:${p}`).join(' · ');
    push(`| ${opt} | ${choice ? choice.label : '?'} | ${scoring} |`);
  }
  push('');
  // Coherence checks
  const optsInSpec = spec ? spec.choices.map(c => c.value) : [];
  const optsInMatrix = Object.keys(M[qKey]);
  const missingInMatrix = optsInSpec.filter(o => !optsInMatrix.includes(o));
  const missingInFront = optsInMatrix.filter(o => !optsInSpec.includes(o));
  if (missingInMatrix.length > 0) push(`⚠ Options présentes dans le formulaire mais sans entrée dans la matrice : ${missingInMatrix.join(', ')} → toujours 0 pt si choisies`);
  if (missingInFront.length > 0) push(`⚠ Options dans la matrice mais ABSENTES du formulaire : ${missingInFront.join(', ')} → mortes`);
  if (missingInMatrix.length > 0 || missingInFront.length > 0) push('');
}

// ── Section 6 : conclusion / pistes ──
push('## 6. Pistes de rééquilibrage (à valider avant impl)');
push('');
push('Synthèse automatique basée sur les sections 1-4 ; à pondérer par le sens métier.');
push('');
push('1. **Rééquilibrage des plafonds** : ramener tous les signes dans une fourchette ±10% de la moyenne (≈ ±' + (avgMax * 0.1).toFixed(0) + ' pts).');
push('2. **Combler les trous** identifiés en §4.1 : pour chaque signe absent d\'une question, ajouter au moins 1 mention 1-2 pts dans une option cohérente sémantiquement.');
push('3. **Renforcer la discriminance** des questions § 4.2 (couverture < 10 signes).');
push('4. **Vérifier la cohérence label ↔ scoring** des options listées en § 5 (revue éditoriale, pas automatisable).');
push('5. **Audit redondance** : identifier les paires de questions trop corrélées (q5 vs q11 = look ; q4 vs q6 = perception sociale) — non couvert ici, nécessite données réelles ou simulation.');
push('');
push('---');
push('');
push('*Rapport généré automatiquement par `FRA/DHN/.audit-matrice.js`. Re-générer après chaque modification de la matrice.*');

console.log(out.join('\n'));
