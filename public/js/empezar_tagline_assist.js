// Archivo: public/js/empezar_tagline_assist.js
// Frase corta <= 55 chars sincronizada al rubro, chips activos y cupo real 5/5 de IA (< 190L)

window.TucuEmpezarTaglineAssist = (function () {
  const MAX_LEN = 55;
  const MAX_USES = 5;
  const SID_KEY = 'tucu_emp_ai_sid';
  const REM_KEY = 'tucu_emp_ai_rem';
  const DEFAULT_ENGINE = 'https://engine.tucured.com.ar';

  const RUBRO_CFG = {
    peluqueria: {
      keywords: ['Corte y estilo', 'Barbería', 'Coloración', 'Alisados', 'Atención directa'],
      placeholder: 'Ej: Cortes clásicos y barba sin esperas.',
      ideas: ['Cortes y color pensados para vos.', 'Tu look cuidado y tu turno sin esperas.', 'Barbería clásica con reserva en segundos.']
    },
    estetica: {
      keywords: ['Uñas esculpidas', 'Limpieza facial', 'Pestañas y cejas', 'Depilación', 'Bienestar'],
      placeholder: 'Ej: Estética integral con horarios a tu medida.',
      ideas: ['Un momento de cuidado pensado para vos.', 'Estética integral con horarios a tu medida.', 'Manos, rostro y bienestar en un solo lugar.']
    },
    deportes: {
      keywords: ['Canchas de pádel', 'Fútbol 5 y 7', 'Clases grupales', 'Torneos', 'Alquiler por hora'],
      placeholder: 'Ej: Reservá tu cancha y armá el partido.',
      ideas: ['Tu cancha lista para jugar sin llamadas.', 'Reservá tu turno y armá el partido.', 'Espacios preparados para entrenar mejor.']
    },
    salud: {
      keywords: ['Turnos claros', 'Consultorio privado', 'Obras sociales', 'Evaluación integral', 'Seguimiento'],
      placeholder: 'Ej: Atención profesional con horarios claros.',
      ideas: ['Atención profesional con horarios claros.', 'Tu consulta programada de forma simple.', 'Cuidado cercano y turnos organizados.']
    },
    servicios: {
      keywords: ['Asesoría 1 a 1', 'Presupuestos', 'Soporte técnico', 'Atención por cita', 'Seguimiento'],
      placeholder: 'Ej: Asesoramiento claro en tu horario elegido.',
      ideas: ['Asesoramiento claro en tu horario elegido.', 'Soluciones a medida con cita previa.', 'Consultas ágiles para resolver hoy.']
    }
  };

  const resolveEngineBase = () => (window.TUCU_ENGINE_URL ? String(window.TUCU_ENGINE_URL).replace(/\/$/, '') : DEFAULT_ENGINE);
  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const clipTagline = (raw) => String(raw || '').replace(/\s+/g, ' ').trim().slice(0, MAX_LEN);
  const getCfg = (rubro) => RUBRO_CFG[rubro] || RUBRO_CFG.servicios;
  const getKeywordsForRubro = (rubro) => getCfg(rubro).keywords;
  const getIdeasForRubro = (rubro) => getCfg(rubro).ideas.map(clipTagline);

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

  function buildFallback(st) {
    const kws = Array.isArray(st?.keywords) ? st.keywords : [];
    if (kws.length >= 2) return clipTagline(`${kws[0]} y ${kws[1].toLowerCase()} sin esperas.`);
    if (kws.length === 1) return clipTagline(`${kws[0]} con reserva rápida online.`);
    return getIdeasForRubro(st?.rubro)[0];
  }

  async function requestAiTagline(st) {
    const rem = getRemaining();
    if (rem <= 0) return { ok: false, error: 'LIMIT_REACHED', remaining: 0 };
    const sid = getSessionId(), ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 15000);
    const kws = Array.isArray(st.keywords) ? st.keywords : [];
    try {
      const res = await fetch(`${resolveEngineBase()}/api/ai/tagline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-session-id': sid },
        signal: ctrl.signal,
        body: JSON.stringify({ rubro: st.rubro || 'peluqueria', tono: st.tonoVoz || 'cercano', comercio: st.comercio || '', keywords: kws, intention: kws.join(', ') || getCfg(st.rubro).keywords[0], draftText: st.bajada || '', sessionId: sid })
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
      return { ok: true, tagline: buildFallback(st), remaining: nextRem, source: 'fallback' };
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
    const cfg = getCfg(st.rubro), chosen = Array.isArray(st.keywords) ? st.keywords : [];
    const current = clipTagline(st.bajada || ''), disabled = Boolean(st.noTagline), rem = getRemaining();
    const aiTxt = rem <= 0 ? '0 de 5 ideas IA disponibles' : (st.aiLoading ? 'Pensando frase...' : `${current.trim() ? 'Mejorar mi frase con IA' : 'Crear frase con IA'} · ${rem} de ${MAX_USES} disponibles`);
    return `
      <div class="space-y-4">
        <div class="space-y-1.5">
          <p class="text-[11px] font-bold uppercase tracking-wider text-stone-500">Elegí 1 a 3 palabras clave de tu rubro</p>
          <div class="flex flex-wrap gap-1.5">
            ${cfg.keywords.map((kw) => {
              const on = chosen.includes(kw);
              return `<button type="button" data-emp-tagline-kw="${esc(kw)}" aria-pressed="${on}" class="px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${on ? 'wg-option-active' : 'wg-option'}">${esc(kw)}</button>`;
            }).join('')}
          </div>
        </div>
        <div class="space-y-1.5">
          <div class="flex items-center justify-between text-xs"><label for="emp-bajada" class="font-semibold text-stone-700">Frase corta (una sola línea)</label><span id="emp-tagline-counter" class="font-semibold text-stone-500 tabular-nums">${current.length}/${MAX_LEN}</span></div>
          <input id="emp-bajada" type="text" maxlength="${MAX_LEN}" value="${esc(current)}" ${disabled ? 'disabled' : ''} placeholder="${esc(cfg.placeholder)}" class="w-full px-3.5 py-2.5 rounded-2xl bg-white/90 border border-[#E2D8CB] text-sm text-stone-900 focus:outline-none focus:border-[#EA580C] disabled:opacity-50" />
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button type="button" id="btn-emp-ai-run" ${disabled || st.aiLoading || rem <= 0 ? 'disabled' : ''} class="wg-btn-ai px-4 py-2.5 rounded-2xl text-xs font-bold cursor-pointer disabled:opacity-45">${esc(aiTxt)}</button>
          ${st.previousBajada ? '<button type="button" id="btn-emp-ai-revert" class="wg-btn-secondary px-3.5 py-2 rounded-2xl text-xs font-semibold cursor-pointer">Volver a mi versión</button>' : ''}
          <button type="button" id="btn-emp-no-tagline" class="px-3.5 py-2 rounded-2xl text-xs font-semibold cursor-pointer ${disabled ? 'wg-option-active' : 'wg-btn-secondary'}">${disabled ? 'Volver a incluir frase' : 'Sin frase'}</button>
        </div>
        <div>
          <button type="button" id="btn-emp-tagline-ideas" class="text-xs font-semibold text-[#EA580C] hover:underline cursor-pointer">Ver ideas sugeridas</button>
          <div id="emp-tagline-ideas-drawer" class="${st.ideasOpen ? '' : 'hidden '}mt-2 space-y-1.5">${cfg.ideas.map((idea) => `<button type="button" data-emp-tagline-idea="${esc(clipTagline(idea))}" class="w-full text-left px-3 py-2 rounded-xl wg-option text-xs font-medium cursor-pointer">${esc(clipTagline(idea))}</button>`).join('')}</div>
        </div>
        ${st.aiFeedback ? `<p id="emp-ai-feedback" class="text-[11px] font-medium text-[#C2410C]">${esc(st.aiFeedback)}</p>` : ''}
      </div>`;
  }

  return { MAX_LEN, MAX_USES, clipTagline, getKeywordsForRubro, getIdeasForRubro, getRemaining, setRemaining, requestAiTagline, adoptCurrentTagline, renderStep5Controls, loadPool: async () => true };
})();
