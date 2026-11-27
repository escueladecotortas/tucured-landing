// Archivo: public/js/empezar_tagline_assist.js
// Paso 5 en 4 bloques: 3 ideas curadas + Ver otras 3, IA en casilla separada (avoidPhrases), input y Sin frase (< 180L)

window.TucuEmpezarTaglineAssist = (function () {
  const MAX_LEN = 55;
  const MAX_USES = 5;
  const SID_KEY = 'tucu_emp_ai_sid';
  const REM_KEY = 'tucu_emp_ai_rem';
  const DEFAULT_ENGINE = 'https://engine.tucured.com.ar';

  const resolveEngineBase = () => (window.TUCU_ENGINE_URL ? String(window.TUCU_ENGINE_URL).replace(/\/$/, '') : DEFAULT_ENGINE);
  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const clipTagline = (raw) => String(raw || '').replace(/\s+/g, ' ').trim().slice(0, MAX_LEN);

  function getKeywordsForState(st) {
    const mod = window.TucuEmpezarSpecialtyData;
    return mod ? mod.getKeywords(st?.rubro, st?.specialties) : ['Atención directa', 'Calidad real', 'Espacio cómodo', 'Profesionales', 'A tu medida'];
  }

  function getSessionId() {
    try {
      let sid = sessionStorage.getItem(SID_KEY);
      if (!sid) { sid = `emp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`; sessionStorage.setItem(SID_KEY, sid); }
      return sid;
    } catch { return `emp_${Date.now().toString(36)}`; }
  }

  function getRemaining() {
    try {
      const raw = sessionStorage.getItem(REM_KEY);
      if (raw === null) return MAX_USES;
      const n = Number(raw);
      return Number.isFinite(n) ? Math.max(0, Math.min(MAX_USES, n)) : MAX_USES;
    } catch { return MAX_USES; }
  }

  function setRemaining(n) {
    const clean = Math.max(0, Math.min(MAX_USES, Number(n) || 0));
    try { sessionStorage.setItem(REM_KEY, String(clean)); } catch {}
    return clean;
  }

  function buildFallback(st, avoid = []) {
    const pool = window.TucuEmpezarPhrasesBank?.getPool?.(st?.rubro, st?.specialties) || [];
    const kws = Array.isArray(st?.keywords) ? st.keywords : [];
    const candidates = [];
    if (kws.length >= 2) candidates.push(clipTagline(`${kws[0]} y ${kws[1].toLowerCase()} para vos.`));
    if (kws.length >= 1) candidates.push(clipTagline(`${kws[0]} con atención dedicada.`));
    pool.forEach((p) => candidates.push(p));
    const avoidSet = new Set((avoid || []).map((x) => String(x || '').toLowerCase().trim()));
    return candidates.find((c) => c && !avoidSet.has(c.toLowerCase())) || candidates[0] || 'Calidad y dedicación en cada encuentro.';
  }

  async function requestAiTagline(st) {
    const rem = getRemaining();
    if (rem <= 0) return { ok: false, error: 'LIMIT_REACHED', remaining: 0 };
    const sid = getSessionId(), ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 15000);
    const kws = Array.isArray(st.keywords) ? st.keywords : [];
    const avoid = [...new Set([...(st.aiHistory || []), st.bajada, st.aiSuggestion].filter(Boolean))];
    const specCtx = window.TucuEmpezarSpecialtyData?.getSpecialtyContext?.(st.specialties) || '';
    try {
      const res = await fetch(`${resolveEngineBase()}/api/ai/tagline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-session-id': sid },
        signal: ctrl.signal,
        body: JSON.stringify({
          rubro: st.rubro || 'peluqueria',
          tono: st.tonoVoz || 'cercano',
          comercio: st.comercio || '',
          especialidad: specCtx,
          keywords: kws,
          intention: kws.join(', ') || getKeywordsForState(st)[0],
          draftText: st.bajada || '',
          avoidPhrases: avoid,
          sessionId: sid
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 429 || data?.error === 'LIMIT_REACHED') { setRemaining(0); return { ok: false, error: 'LIMIT_REACHED', remaining: 0 }; }
      if (res.ok && data?.ok && data?.tagline) {
        const nextRem = setRemaining(typeof data.remaining === 'number' ? data.remaining : rem - 1);
        return { ok: true, tagline: clipTagline(data.tagline), remaining: nextRem, source: data.source || 'ai' };
      }
      throw new Error('AI_UNAVAILABLE');
    } catch (_) {
      const nextRem = setRemaining(rem - 1);
      return { ok: true, tagline: buildFallback(st, avoid), remaining: nextRem, source: 'fallback' };
    } finally { clearTimeout(timer); }
  }

  function adoptCurrentTagline(st) {
    if (!st?.bajada?.trim() || st.noTagline) return;
    try {
      const ctrl = new AbortController(); setTimeout(() => ctrl.abort(), 5000);
      fetch(`${resolveEngineBase()}/api/ai/tagline/adopt`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true, signal: ctrl.signal,
        body: JSON.stringify({ rubro: st.rubro || 'peluqueria', tono: st.tonoVoz || 'cercano', tagline: st.bajada.trim(), comercio: st.comercio || '' })
      }).catch(() => {});
    } catch {}
  }

  function renderStep5Controls(st) {
    const keywords = getKeywordsForState(st), chosen = Array.isArray(st.keywords) ? st.keywords : [];
    const current = clipTagline(st.bajada || ''), disabled = Boolean(st.noTagline), rem = getRemaining();
    const bankPage = window.TucuEmpezarPhrasesBank?.getPage?.(st.rubro, st.specialties, st.phrasePage || 0) || { items: [], page: 0, totalPages: 1 };
    const aiTxt = rem <= 0 ? '0 de 5 ideas IA disponibles' : (st.aiLoading ? 'Pensando frase...' : `Generar con IA · ${rem} de ${MAX_USES} disponibles`);

    const bankHtml = bankPage.items.map((idea) => {
      const active = !disabled && current === idea;
      return `<button type="button" data-emp-tagline-idea="${esc(idea)}" class="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium cursor-pointer flex items-center justify-between gap-2 ${active ? 'wg-option-active' : 'wg-option'}">
        <span>${esc(idea)}</span><span class="text-[10px] font-bold shrink-0 text-[#EA580C]">${active ? 'Elegida' : 'Elegir'}</span>
      </button>`;
    }).join('');

    const aiResultHtml = st.aiSuggestion ? `
      <div id="emp-ai-result-box" class="mt-2.5 p-3 rounded-xl bg-white border border-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <p class="text-xs font-semibold text-stone-800 leading-snug">"${esc(st.aiSuggestion)}"</p>
        <button type="button" id="btn-emp-ai-use" class="wg-btn-primary px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 cursor-pointer">Usar esta frase</button>
      </div>` : '';

    return `<div class="space-y-4">
      <div class="p-3.5 rounded-2xl bg-white/75 border border-[#E7DDD0] space-y-2.5">
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <span class="text-xs font-extrabold text-stone-800">1. Ideas listas para tu negocio</span>
          <button type="button" id="btn-emp-phrases-next" class="text-[11px] font-bold text-[#EA580C] hover:underline cursor-pointer">Ver otras 3</button>
        </div>
        <div id="emp-tagline-ideas-drawer" class="space-y-1.5">${bankHtml}</div>
      </div>

      <div class="p-3.5 rounded-2xl bg-orange-50/55 border border-orange-200/80 space-y-2.5">
        <span class="block text-xs font-extrabold text-stone-800">2. Crear con IA</span>
        <div class="flex flex-wrap gap-1.5">
          ${keywords.map((kw) => {
            const on = chosen.includes(kw);
            return `<button type="button" data-emp-tagline-kw="${esc(kw)}" aria-pressed="${on}" class="px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${on ? 'wg-option-active' : 'wg-option'}">${esc(kw)}</button>`;
          }).join('')}
        </div>
        <button type="button" id="btn-emp-ai-run" ${disabled || st.aiLoading || rem <= 0 ? 'disabled' : ''} class="wg-btn-ai px-4 py-2 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-45">${esc(aiTxt)}</button>
        ${aiResultHtml}
        ${st.aiFeedback ? `<p id="emp-ai-feedback" class="text-[11px] font-medium text-[#C2410C]">${esc(st.aiFeedback)}</p>` : ''}
      </div>

      <div class="space-y-1.5">
        <div class="flex items-center justify-between text-xs"><label for="emp-bajada" class="font-bold text-stone-800">3. Tu propia frase / eslogan</label><span id="emp-tagline-counter" class="font-semibold text-stone-500 tabular-nums">${current.length}/${MAX_LEN}</span></div>
        <input id="emp-bajada" type="text" maxlength="${MAX_LEN}" value="${esc(current)}" ${disabled ? 'disabled' : ''} placeholder="Escribí una frase corta que identifique tu lugar" class="w-full px-3.5 py-2.5 rounded-2xl bg-white/90 border border-[#E2D8CB] text-sm text-stone-900 focus:outline-none focus:border-[#EA580C] disabled:opacity-50" />
      </div>

      <div class="pt-0.5 flex items-center justify-between gap-2">
        <button type="button" id="btn-emp-no-tagline" class="px-3.5 py-2 rounded-2xl text-xs font-semibold cursor-pointer ${disabled ? 'wg-option-active' : 'wg-btn-secondary'}">${disabled ? 'Volver a incluir frase' : 'Sin frase'}</button>
      </div>
    </div>`;
  }

  return { MAX_LEN, MAX_USES, clipTagline, getKeywordsForRubro: (r) => getKeywordsForState({ rubro: r }), getRemaining, setRemaining, requestAiTagline, adoptCurrentTagline, renderStep5Controls };
})();