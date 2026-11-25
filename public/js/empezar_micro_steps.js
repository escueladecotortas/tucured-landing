// Archivo: public/js/empezar_micro_steps.js
// Controlador de 10 micro-pantallas en 4 etapas humanas, borrador automático y pantallas 1-5 (< 190L)

window.TucuEmpezarMicroSteps = (function () {
  const TOTAL_STEPS = 10;
  const DRAFT_KEY = 'tucu_empezar_draft_v2';
  const STAGES = [
    { id: 1, label: '1. Tu Marca', steps: [1, 2] },
    { id: 2, label: '2. Tu Estilo', steps: [3, 4, 5] },
    { id: 3, label: '3. Tu Negocio', steps: [6, 7] },
    { id: 4, label: '4. Tu Lanzamiento', steps: [8, 9, 10] }
  ];
  const RUBRO_ICONS = {
    peluqueria: '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.9" viewBox="0 0 24 24"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path stroke-linecap="round" d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12"/></svg>',
    estetica: '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.9" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.5 3.5 5 6.2 5 9.5a5 5 0 11-10 0C7 9.2 9.5 6.5 12 3z"/></svg>',
    gastronomia: '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.9" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 3v7a4 4 0 004 4v7m4-18v18m4-18v6a3 3 0 003 3v9"/></svg>',
    deportes: '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.9" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path stroke-linecap="round" d="M5.6 5.6c2.8 2.8 2.8 10 0 12.8M18.4 5.6c-2.8 2.8-2.8 10 0 12.8"/></svg>',
    salud: '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.9" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M5 12h14"/><rect x="3" y="3" width="18" height="18" rx="4"/></svg>',
    servicios: '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.9" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>'
  };

  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const getStageForStep = (step) => STAGES.find(s => s.steps.includes(Number(step))) || STAGES[0];
  const getHighlightSelector = (step) => ({
    1: '#preview-biz-name', 2: '#preview-cta-btn', 3: '#preview-phone-chassis', 4: '#preview-cta-btn',
    5: '#preview-tagline', 6: '#preview-schedule', 7: '#preview-service-chip', 8: '#preview-domain-pill', 10: '#preview-plan-badge'
  }[Number(step)] || '');

  function renderStageBar(step, submitted) {
    const activeStage = submitted ? 5 : getStageForStep(step).id;
    const pills = STAGES.map(st => {
      const done = st.id < activeStage;
      const on = st.id === activeStage;
      const cls = on
        ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
        : (done ? 'bg-orange-50 text-orange-800 border-orange-200' : 'bg-[#FAF8F5] text-stone-500 border-stone-200');
      return `<span class="px-2 py-1 rounded-full border text-[10px] sm:text-[11px] font-bold whitespace-nowrap transition-colors ${cls}">${esc(st.label)}</span>`;
    }).join('');
    const wrap = document.getElementById('emp-stage-bar');
    if (wrap) wrap.innerHTML = pills;
    const bar = document.getElementById('emp-progress-bar');
    if (bar) bar.style.width = `${submitted ? 100 : Math.round((Number(step) / TOTAL_STEPS) * 100)}%`;
  }

  function saveDraft(st) {
    if (!st || st.submitted) return;
    try {
      const copy = { ...st, submitting: false, submitted: false, error: '', aiLoading: false, aiFeedback: '' };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(copy));
    } catch {}
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch { return null; }
  }

  function clearDraft() {
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
  }

  function validateStep(step, st) {
    if (step === 1 && !st.comercio.trim()) return 'Contanos cómo se llama tu comercio para empezar a armar tu App.';
    if (step === 6 && !st.direccion.trim()) return 'Sumá la dirección de tu local para que tus clientes sepan dónde encontrarte.';
    if (step === 7) return window.TucuEmpezarServicesStep?.validate?.(st) || '';
    if (step === 8) {
      if ((st.slug || '').length < 3) return 'Elegí una dirección web de al menos 3 caracteres para continuar.';
      if (['taken', 'reserved', 'invalid_format'].includes(st.slugCheck?.status)) return 'Elegí una dirección web disponible para continuar.';
    }
    if (step === 9) {
      if (!st.titularNombre.trim()) return 'Contanos tu nombre para personalizar tu alta.';
      if (!st.titularApellido.trim()) return 'Sumá tu apellido para completar tus datos.';
      if (st.whatsapp.length !== 10) return 'Necesitamos un WhatsApp válido de 10 dígitos (ej. 3815554321) para enviarte tus accesos.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(st.email.trim())) return 'Revisá el correo electrónico para poder enviarte tu comprobante.';
    }
    if (step === 10 && !st.termsAccepted) return 'Marcá los Términos y Condiciones para confirmar tu lanzamiento.';
    return '';
  }

  function renderBrandStyleStep(step, st, h) {
    const S = window.TucuEmpezarState, M = window.TucuEmpezarMedia, C = window.TucuEmpezarCovers;
    const T = window.TucuEmpezarTones, Assist = window.TucuEmpezarTaglineAssist;
    if (step === 1) {
      return `<div class="space-y-4">
        <div><h1 class="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900">¿Cómo se llama tu comercio?</h1><p class="text-xs text-stone-500 mt-1">Empecemos por el nombre con el que tus clientes ya te conocen.</p></div>
        <div><label for="emp-comercio" class="block text-xs font-bold text-stone-700 mb-1.5">Nombre de tu comercio</label><input id="emp-comercio" type="text" maxlength="60" placeholder="Ej. Barbería Don Julio" value="${esc(st.comercio)}" class="w-full p-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200 focus:border-stone-900 text-base font-semibold text-stone-900 outline-none" /><p class="text-[11px] text-stone-500 mt-1.5">Podés presionar Enter para pasar rápido al siguiente paso.</p></div>
        ${h.errBox(st.error)}${h.navBtns(false, 'Continuar a Rubro')}
      </div>`;
    }
    if (step === 2) {
      const cards = S.RUBROS.map(r => `<button type="button" data-emp-rubro="${r.id}" aria-pressed="${st.rubro === r.id}" class="p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex items-center gap-3 ${st.rubro === r.id ? 'bg-stone-900 border-stone-900 text-white shadow-sm' : 'bg-[#FAF8F5] border-stone-200 text-stone-800 hover:bg-stone-100'}"><span class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${st.rubro === r.id ? 'bg-white/15 text-orange-300' : 'bg-white border border-stone-200 text-orange-600'}">${RUBRO_ICONS[r.id] || ''}</span><span class="text-xs sm:text-sm font-bold leading-tight">${esc(r.label)}</span></button>`).join('');
      return `<div class="space-y-4">
        <div><h2 class="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900">¿Cuál es tu rubro principal?</h2><p class="text-xs text-stone-500 mt-1">Adaptamos la estética, los textos y los primeros servicios sugeridos a tu actividad.</p></div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">${cards}</div>
        ${h.errBox(st.error)}${h.navBtns(true, 'Continuar a Portada')}
      </div>`;
    }
    if (step === 3) {
      return `<div class="space-y-4">
        <div><h2 class="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900">El clima y portada de tu App</h2><p class="text-xs text-stone-500 mt-1">Elegí una de nuestras 12 portadas en movimiento o subí tu foto propia.</p></div>
        ${C.renderCoverGallery(st, M.getSlot('cover'))}
        <p class="text-[11px] text-stone-600 bg-[#FAF8F5] border border-stone-200 rounded-xl px-3 py-2">Si ahora no tenés tu foto a mano, podés elegir una portada de muestra y mandarnos la tuya por WhatsApp cuando quieras.</p>
        ${h.errBox(st.error)}${h.navBtns(true, 'Continuar a Logo y Color')}
      </div>`;
    }
    if (step === 4) {
      const logoSlot = M.getSlot('logo'), effAcc = S.getEffectiveAccent(st), autoOn = st.accentMode === 'auto';
      const autoBtn = `<button type="button" data-emp-accent="auto" aria-pressed="${autoOn}" class="px-3.5 py-2 rounded-full border text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition-all ${autoOn ? 'bg-stone-900 text-white border-stone-900 shadow-xs' : 'bg-[#FAF8F5] text-stone-700 border-stone-200 hover:bg-stone-100'}"><span id="emp-auto-swatch" class="w-3.5 h-3.5 rounded-full border border-white/50 shrink-0" style="background-color:${esc(effAcc.bg)}"></span><span>Automático</span></button>`;
      const swatches = S.ACCENT_OPTIONS.map(a => {
        const on = st.accentMode === 'manual' && st.accent === a.id;
        return `<button type="button" data-emp-accent="${a.id}" title="${esc(a.label)}" aria-label="${esc(a.label)}" style="background-color:${a.bg}" class="w-9 h-9 rounded-full flex items-center justify-center text-white cursor-pointer transition-transform ${on ? 'ring-2 ring-offset-2 ring-stone-900 scale-105' : 'opacity-85 hover:opacity-100'}">${on ? h.SVG.ok : ''}</button>`;
      }).join('');
      return `<div class="space-y-4">
        <div><h2 class="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900">Tu logo y color principal</h2><p class="text-xs text-stone-500 mt-1">Con el modo Automático combinamos el color con tu logo o portada en segundos.</p></div>
        <div class="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-2">
          <div class="flex items-center justify-between gap-2"><span class="text-xs font-bold text-stone-800">Logo de tu local (opcional · mín. 300px)</span>${logoSlot.file ? '<button type="button" id="btn-clear-logo" class="text-[11px] font-bold text-rose-600 cursor-pointer">Quitar</button>' : ''}</div>
          <label for="emp-logo-input" class="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-xs font-semibold text-stone-700 flex items-center justify-center gap-1.5 cursor-pointer">${h.SVG.up}<span>${logoSlot.file ? `Logo listo · ${logoSlot.kb} KB (Cambiar)` : 'Subir mi logo'}</span></label>
          <input id="emp-logo-input" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" />
        </div>
        <div class="space-y-2"><span class="block text-xs font-bold text-stone-700">Color de los botones de tu App</span><div class="flex flex-wrap items-center gap-2">${autoBtn}${swatches}</div></div>
        ${h.errBox(st.error)}${h.navBtns(true, 'Continuar a Tono y Frase')}
      </div>`;
    }
    const bajadaHint = st.taglineFromAi ? 'Generada con IA' : (st.bajadaManual ? 'Editada por vos' : 'Sugerida según tono');
    return `<div class="space-y-4">
      <div><h2 class="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900">Tono de voz y bienvenida</h2><p class="text-xs text-stone-500 mt-1">Definí cómo suena tu negocio cuando alguien entra a reservar su turno.</p></div>
      ${T.renderToneSelector(st.tonoVoz)}
      <div><div class="flex items-center justify-between gap-2 mb-1"><label for="emp-bajada" class="block text-xs font-bold text-stone-700">Frase de bienvenida</label><span id="emp-bajada-hint" class="text-[11px] font-medium text-stone-500">${bajadaHint}</span></div><input id="emp-bajada" type="text" maxlength="110" placeholder="Presentación breve de tu comercio" value="${esc(st.bajada)}" class="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200 focus:border-stone-900 text-xs sm:text-sm text-stone-900 outline-none" />${Assist?.renderAssistControls?.(st) || ''}</div>
      ${h.errBox(st.error)}${h.navBtns(true, 'Continuar a Ubicación y Horarios')}
    </div>`;
  }

  return {
    TOTAL_STEPS, STAGES, DRAFT_KEY,
    getStageForStep, getHighlightSelector, renderStageBar,
    saveDraft, loadDraft, clearDraft, validateStep, renderBrandStyleStep
  };
})();
