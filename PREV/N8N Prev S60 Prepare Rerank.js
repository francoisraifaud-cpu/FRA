// S60 Prepare Rerank — réduit les items Super noeud1 à 1 item avec le prompt LLM.
// Si aucun item n'a _s60RerankInput (cas où S6.0 désactivé ou erreur amont), on ne fait
// rien et on retourne un item "skip" qui désactivera le rerank en aval.

const allItems = $input.all();
let rerankItem = null;
let rerankIdx = -1;
for (let i = 0; i < allItems.length; i++) {
  if (allItems[i]?.json?._s60RerankInput && typeof allItems[i].json._s60RerankInput.userPrompt === 'string') {
    rerankItem = allItems[i].json._s60RerankInput;
    rerankIdx = i;
    break;
  }
}

if (!rerankItem) {
  console.log('[S6.0 Prepare] Aucun _s60RerankInput trouvé — skip rerank (fallback math)');
  return [{ json: { _s60Skip: true, _s60SkipReason: 'no_rerank_input' } }];
}

console.log(`[S6.0 Prepare] Item ${rerankIdx} : top-3=[${rerankItem.top3.map(s => s.code+':'+s.confidence).join(', ')}]`);
return [{
  json: {
    _s60Skip: false,
    _s60ItemIndex: rerankIdx,
    systemPrompt: rerankItem.systemPrompt,
    userPrompt: rerankItem.userPrompt,
    top3: rerankItem.top3,
    meta: rerankItem.meta
  }
}];