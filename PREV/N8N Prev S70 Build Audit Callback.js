// S70 Build Audit Callback (Sprint 6.18 retour 78 — D1-A proactif)
// Calcule le payload de télémétrie LLM (aucune PII).
// Émet { _s70Audit: null } si pas de rerank applicable, sinon
//   { _s70Audit: { url, body } } prêt à brancher dans HTTP Request.
const items = $input.all();
const out = [];
for (const it of items) {
  const j = it.json || {};
  const rerank = j._s60Rerank || null;
  const profilType = (j.profil_type === "public") ? "public" : "prive";

  if (!rerank || typeof rerank !== "object") {
    out.push({ json: { ...j, _s70Audit: null } });
    continue;
  }

  const mathTop1Code = String(rerank.originalTop1Code || rerank.mathTop1Code || "").toUpperCase();
  const llmChosenCode = String(rerank.chosenCode || "").toUpperCase();
  const mathTop1Score = Number(rerank.originalTop1Score ?? rerank.mathTop1Score ?? 0) | 0;
  const llmChosenScore = Number(rerank.chosenScore ?? rerank.confidence_in_choice ?? 0) | 0;

  if (!mathTop1Code || !llmChosenCode) {
    out.push({ json: { ...j, _s70Audit: null } });
    continue;
  }

  // On n'audite QUE les vraies révocations (codes différents et delta > 0).
  if (mathTop1Code === llmChosenCode || mathTop1Score <= llmChosenScore) {
    out.push({ json: { ...j, _s70Audit: null } });
    continue;
  }

  const reasonRaw = String(rerank.primary_reason || "").trim();
  const orderRefRaw = String(j.order_id || j.orderId || j.commande_ref || "").trim();
  const orderRefSafe = /^[A-Za-z0-9_\-:]{1,64}$/.test(orderRefRaw) ? orderRefRaw : null;
  const execId = String($execution?.id || "").slice(0, 64) || null;

  const body = {
    profil_type: profilType,
    math_top1_code: mathTop1Code,
    math_top1_score: mathTop1Score,
    llm_chosen_code: llmChosenCode,
    llm_chosen_score: llmChosenScore,
    primary_reason: reasonRaw ? reasonRaw.slice(0, 512) : null,
    order_ref: orderRefSafe,
    n8n_execution_id: execId,
  };

  out.push({
    json: {
      ...j,
      _s70Audit: {
        url: $env.SITE_PREV_LLM_AUDIT_URL || "https://tedwarehouseastro.example/api/internal/prev-llm-audit",
        body,
      },
    },
  });
}
return out;
