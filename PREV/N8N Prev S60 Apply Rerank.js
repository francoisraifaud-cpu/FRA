// S60 Apply Rerank — applique le choix LLM ou fallback math.
//
// Doctrine astrologue (retour 58 Q47-B) :
//   • Si LLM répond confidence_in_choice="low" → fallback top-1 math
//   • Si LLM JSON invalide ou index hors [0,1,2] → fallback top-1 math
//   • Si LLM OK → réordonne eventSignatures selon chosen_index
//
// Trace : on logge _s60Rerank dans le payload pour audit (chosen_index, reason, fallback).

const llmInput = $input.first();
const llmOutput = llmInput?.json?.output || llmInput?.json?.text || llmInput?.json?.response || '';

// Récupère TOUS les items de Super noeud1 (13 items typiquement)
const superItems = $('Super noeud1').all();
const skipItem = $('S60 Prepare Rerank').first();
const isSkip = skipItem?.json?._s60Skip === true;

// Parse JSON LLM — extrait le contenu entre la première { et la dernière } trouvées,
// ce qui gère robustement les markdown fences \`\`\`json ... \`\`\` ou tout préfixe/suffixe textuel.
function _s60ParseLLM(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const text = raw.trim();
  const openBrace = text.indexOf('{');
  const closeBrace = text.lastIndexOf('}');
  if (openBrace === -1 || closeBrace === -1 || closeBrace <= openBrace) return null;
  const slice = text.slice(openBrace, closeBrace + 1);
  try { return JSON.parse(slice); } catch (e) {
    console.log('[S6.0 Apply] JSON.parse échec sur:', slice.slice(0, 200), '| err:', e.message);
    return null;
  }
}

const parsed = isSkip ? null : _s60ParseLLM(llmOutput);

// Validation du choix LLM (Q51-B : index ∈ [0, 4] avec Top-5)
let rerankApplied = false;
let rerankReason = 'fallback_math';
let chosenCode = null;
let chosenIndex = 0;
let llmJson = null;
let llmConfidence = null;
let llmPrimaryReason = null;
let originalTop1Code = null;

if (parsed && typeof parsed.chosen_index === 'number' && parsed.chosen_index >= 0 && parsed.chosen_index <= 4) {
  llmJson = parsed;
  llmConfidence = parsed.confidence_in_choice;
  llmPrimaryReason = parsed.primary_reason;
  // Q47-B : si LLM dit "low", on bascule sur fallback math
  if (parsed.confidence_in_choice === 'low') {
    rerankReason = 'llm_abstained_low_confidence';
  } else {
    rerankApplied = true;
    rerankReason = 'llm_chose_index_' + parsed.chosen_index;
    chosenIndex = parsed.chosen_index;
  }
} else if (isSkip) {
  rerankReason = skipItem.json._s60SkipReason || 'skip';
} else {
  rerankReason = 'llm_invalid_json';
}

// Construit la liste de sortie (= items Super noeud1 avec patch sur item synthèse)
const output = [];
let q50bFallbackTriggered = false;
let q50bFallbackDetail = null;

for (let i = 0; i < superItems.length; i++) {
  const item = superItems[i];
  const newJson = { ...item.json };

  // Patch eventSignatures uniquement sur l'item qui en contient (= synthèse, item index 12 typiquement)
  if (Array.isArray(newJson.eventSignatures) && newJson.eventSignatures.length > 0) {
    const sigs = newJson.eventSignatures;
    const sortKey = (s) => Math.min(95, s.confidence ?? 0) * 1000 + (s.isStellarApex ? 100 : 0);
    const sorted = [...sigs].sort((a, b) => sortKey(b) - sortKey(a));

    originalTop1Code = sorted[0]?.code || null;

    // Q63-A (Sprint 6.2 round 1) : Q50-B auto-fallback DÉSACTIVÉ.
    // Le bench S6.1 a montré -8 corrections / 0 régressions sauvées : le system prompt
    // humble (Q50-A) suffit. On laisse le LLM décider, il est calibré.
    // (code Q50-B retiré ; q50bFallbackTriggered/q50bFallbackDetail conservés à null pour audit)

    if (rerankApplied && chosenIndex !== 0) {
      // Réordonner : mettre l'index choisi en top-1, garder le reste comme avant (sans dupliquer)
      const newTop1 = sorted[chosenIndex];
      const rest = sorted.filter((_, idx) => idx !== chosenIndex);
      const reordered = [newTop1, ...rest];
      newJson.eventSignatures = reordered;
      chosenCode = newTop1?.code || null;
    } else {
      // Fallback ou index 0 = pas de changement
      chosenCode = sorted[0]?.code || null;
    }

    // Trace audit
    newJson._s60Rerank = {
      version: 'S6.1',
      applied: rerankApplied,
      reason: rerankReason,
      chosenIndex: rerankApplied ? chosenIndex : 0,
      chosenCode,
      originalTop1Code,
      llm: llmJson ? {
        chosen_index: llmJson.chosen_index,
        confidence_in_choice: llmConfidence,
        primary_reason: (llmPrimaryReason || '').slice(0, 280),
        rejected_reason: llmJson.rejected_reason || null
      } : null,
      llmRawSnippet: (llmOutput || '').slice(0, 200),
      q50bFallback: q50bFallbackDetail,
      isSkip,
      meta: skipItem?.json?.meta || null
    };

    console.log(`[S6.1 Apply] ${rerankApplied ? '✓' : '✗'} ${rerankReason} | top-1: ${originalTop1Code} → ${chosenCode}${q50bFallbackTriggered ? ' [Q50-B]' : ''}`);
  }

  output.push({ json: newJson });
}

return output;