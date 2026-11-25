// Archivo: public/js/empezar_tagline_assist.js
// Banco curado taglines_pool.json + Asistente IA (/api/ai/tagline y /adopt, tope 5 usos) (< 170L)

window.TucuEmpezarTaglineAssist = (function () {
  const MAX_USES = 5;
  const SID_KEY = 'tucu_emp_ai_sid';
  const REM_KEY = 'tucu_emp_ai_rem';
  const INTENTIONS = ['Sin esperas', 'Atención personalizada', 'Ambiente cálido', 'Mejorar lo que escribí'];

  let poolCache = null;
  let poolPromise = null;
  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  function resolveEngineBase() {
    if (typeof window !== 'undefined' && window.TUCU_ENGINE_URL) return String(window.TUCU_ENGINE_URL).replace(/\/+$/, '');
    const host = typeof window !== 'undefined' ? window.location.hostname : '';
    return ['localhost', '127.0.0.1', ''].includes(host) ? 'http://127.0.0.1:5006' : 'https://engine.tucured.com.ar';
  }

  function getSessionId() {
    try {
      let sid = sessionStorage.getItem(SID_KEY);
      if (!sid) {
        sid = `emp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
        sessionStorage.setItem(SID_KEY, sid);
      }
      return sid;
    } catch {
      return 'emp_session';
    }
  }

  function getRemaining() {
    try {
      const raw = sessionStorage.getItem(REM_KEY);
      if (raw === null) return MAX_USES;
      const n = Number(raw);
      return Number.isFinite(n) ? Math.max(0, Math.min(MAX_USES, n)) : MAX_USES;
    } catch {
      return MAX_USES;
    }
  }

  function setRemaining(n) {
    const clean = Math.max(0, Math.min(MAX_USES, Number(n) || 0));
    try { sessionStorage.setItem(REM_KEY, String(clean)); } catch {}
    return clean;
  }

  async function loadPool() {
    if (poolCache) return poolCache;
    if (!poolPromise) {
      poolPromise = fetch('/assets/data/taglines_pool.json')
        .then(r => (r.ok ? r.json() : null))
        .then(data => { if (data && typeof data === 'object') poolCache = data; return poolCache; })
        .catch(() => null);
    }
    return poolPromise;
  }

  function pickNextPhrase(rubro, tono, currentText = '') {
    const list = poolCache?.[rubro]?.[tono] || poolCache?.[rubro]?.cercano || [];
    if (!list.length) {
      return window.TucuEmpezarTones?.getSuggestedTagline?.(rubro, tono) || 'Reservá tu turno online en segundos.';
    }
    const cleanCur = String(currentText || '').trim();
    const idx = list.indexOf(cleanCur);
    if (idx !== -1) return list[(idx + 1) % list.length];
    const filtered = list.filter(p => p !== cleanCur);
    return filtered[Math.floor(Math.random() * filtered.length)] || list[0];
  }

  async function requestAiTagline({ rubro, tono, comercio, intention, draftText }) {
    const rem = getRemaining();
    if (rem <= 0) return { ok: false, error: 'LIMIT_REACHED', remaining: 0 };

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    const sid = getSessionId();
    try {
      const res = await fetch(`${resolveEngineBase()}/api/ai/tagline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-session-id': sid },
        signal: ctrl.signal,
        body: JSON.stringify({ rubro, tono, comercio, intention, draftText, sessionId: sid })
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 429 || data?.error === 'LIMIT_REACHED') {
        setRemaining(0);
        return { ok: false, error: 'LIMIT_REACHED', remaining: 0 };
      }
      if (res.ok && data?.ok && data?.tagline) {
        const nextRem = setRemaining(typeof data.remaining === 'number' ? data.remaining : rem - 1);
        return { ok: true, tagline: data.tagline, remaining: nextRem, source: data.source || 'ai' };
      }
      throw new Error(data?.error || 'AI_UNAVAILABLE');
    } catch {
      await loadPool();
      const nextRem = setRemaining(rem - 1);
      return { ok: true, tagline: pickNextPhrase(rubro, tono, draftText), remaining: nextRem, source: 'local_pool' };
    } finally {
      clearTimeout(timer);
    }
  }

  function adoptCurrentTagline(state) {
    if (!state?.taglineFromAi || !state?.bajada || state.bajada.trim().length < 6) return;
    try {
      const ctrl = new AbortController();
      setTimeout(() => ctrl.abort(), 5000);
      fetch(`${resolveEngineBase()}/api/ai/tagline/adopt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        signal: ctrl.signal,
        body: JSON.stringify({ rubro: state.rubro, tono: state.tonoVoz, tagline: state.bajada.trim(), comercio: state.comercio || '' })
      }).catch(() => {});
    } catch {}
  }

  function renderAssistControls(state) {
    const rem = getRemaining();
    const chips = INTENTIONS.map(label => {
      const on = (state.aiIntention || INTENTIONS[0]) === label;
      return `<button type="button" data-emp-ai-chip="${esc(label)}" class="px-2.5 py-1 rounded-full text-[11px] font-bold border cursor-pointer transition-colors ${on ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'}">${esc(label)}</button>`;
    }).join('');
    const panel = state.aiPanelOpen ? `<div id="emp-ai-panel" class="mt-2 p-3 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-2.5">
      <div class="flex items-center justify-between gap-2 flex-wrap">
        <span class="text-xs font-bold text-stone-800">Elegí qué destacar en tu frase</span>
        <span id="emp-ai-remaining" class="text-[11px] font-bold tabular-nums ${rem > 0 ? 'text-emerald-700' : 'text-rose-700'}">Te quedan ${rem} de ${MAX_USES} generaciones IA</span>
      </div>
      <div class="flex flex-wrap gap-1.5">${chips}</div>
      <div class="flex items-center gap-2 flex-wrap">
        <button type="button" id="btn-emp-ai-run" ${rem <= 0 || state.aiLoading ? 'disabled' : ''} class="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold cursor-pointer disabled:opacity-50">${state.aiLoading ? 'Redactando frase...' : (rem <= 0 ? 'Límite de 5 usos alcanzado' : 'Generar frase ahora')}</button>
        ${state.aiFeedback ? `<span id="emp-ai-feedback" class="text-[11px] font-semibold text-stone-600">${esc(state.aiFeedback)}</span>` : ''}
      </div>
    </div>` : '';

    return `<div class="pt-1.5 space-y-1">
      <div class="flex items-center gap-2 flex-wrap">
        <button type="button" id="btn-emp-next-phrase" class="px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-stone-100 border border-stone-200 text-[11px] font-bold text-stone-800 cursor-pointer">Probar otra frase</button>
        <button type="button" id="btn-emp-toggle-ai" class="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-[11px] font-bold text-amber-900 cursor-pointer">${state.aiPanelOpen ? 'Ocultar asistente IA' : 'Crear o mejorar con IA'}</button>
      </div>${panel}
    </div>`;
  }

  return { MAX_USES, INTENTIONS, resolveEngineBase, loadPool, pickNextPhrase, getRemaining, setRemaining, requestAiTagline, adoptCurrentTagline, renderAssistControls };
})();
