// Archivo: public/js/empezar_micro_steps.js
// Controlador 11 pasos Warm Glass, P1-P5 (exclusividad P3, sin enter hint en móvil) (< 145L)

window.TucuEmpezarMicroSteps = (function () {
  const TOTAL_STEPS = 11;
  const DRAFT_KEY = 'tucu_empezar_draft_v2';
  const STAGES = [
    { id: 1, label: '1. Tu Marca', steps: [1, 2] },
    { id: 2, label: '2. Tu Estilo', steps: [3, 4, 5] },
    { id: 3, label: '3. Tu Negocio', steps: [6, 7] },
    { id: 4, label: '4. Tu Lanzamiento', steps: [8, 9, 10, 11] }
  ];
  const RUBRO_ICONS = {
    peluqueria: '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.9" viewBox="0 0 24 24"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path stroke-linecap="round" d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12"/></svg>',
    estetica: '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.9" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.5 3.5 5 6.2 5 9.5a5 5 0 11-10 0C7 9.2 9.5 6.5 12 3z"/></svg>',
    deportes: '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.9" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path stroke-linecap="round" d="M5.6 5.6c2.8 2.8 2.8 10 0 12.8M18.4 5.6c-2.8 2.8-2.8 10 0 12.8"/></svg>',
    salud: '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.9" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M5 12h14"/><rect x="3" y="3" width="18" height="18" rx="4"/></svg>',
    servicios: '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.9" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>'
  };

  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const getStageForStep = (step) => STAGES.find((s) => s.steps.includes(Number(step))) || STAGES[0];
  const getHighlightSelector = (step) => ({
    1: '#preview-biz-name', 2: '#preview-biz-name', 3: '#preview-phone-chassis', 4: '#preview-cta-btn',
    5: '#preview-tagline', 6: '#preview-address', 7: '#preview-service-chip', 8: '#preview-domain-pill', 9: '#preview-phone-chassis'
  }[Number(step)] || '');

  function renderStageBar(step, submitted) {
    const activeStage = submitted || Number(step) >= 11 ? 5 : getStageForStep(step).id;
    const pills = STAGES.map((st) => {
      const done = st.id < activeStage, on = st.id === activeStage;
      const cls = on ? 'wg-option-active shadow-2xs' : (done ? 'bg-orange-50/90 text-orange-800 border-orange-200 border' : 'wg-option text-stone-500');
      return `<span class="px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold whitespace-nowrap transition-colors ${cls}">${esc(st.label)}</span>`;
    }).join('');
    const wrap = document.getElementById('emp-stage-bar'); if (wrap) wrap.innerHTML = pills;
  }

  function saveDraft(st) {
    if (!st || st.submitted) return;
    try {
      const copy = { ...st, submitting: false, submitted: false, error: '', aiLoading: false, aiFeedback: '', pricelistError: '' };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(copy));
    } catch {}
  }

  function loadDraft() {
    try { const raw = localStorage.getItem(DRAFT_KEY); return raw ? JSON.parse(raw) : null; }
    catch { return null; }
  }

  const clearDraft = () => { try { localStorage.removeItem(DRAFT_KEY); } catch {} };

  function validateStep(step, st) {
    if (step === 1 && !st.comercio.trim()) return 'Contanos cómo se llama tu negocio para empezar.';
    if (step === 2 && !st.rubroSelected) return 'Elegí el rubro principal de tu negocio para continuar.';
    if (step === 6) {
      if (!st.direccion.trim()) return 'Sumá la dirección de tu local para que tus clientes puedan encontrarte.';
      return window.TucuEmpezarState?.validateSchedule?.(st) || '';
    }
    if (step === 7) return window.TucuEmpezarServicesStep?.validate?.(st) || '';
    if (step === 8) {
      if ((st.slug || '').length < 3) return 'Elegí un link de al menos 3 caracteres para continuar.';
      if ((st.slug.match(/-/g) || []).length > 1) return 'Tu link puede tener como máximo 2 palabras separadas por 1 guion.';
      if (['taken', 'reserved', 'invalid_format'].includes(st.slugCheck?.status)) return 'Elegí un link disponible para continuar.';
    }
    if (step === 9) {
      if (!st.titularNombre.trim()) return 'Contanos tu nombre para personalizar tu alta.';
      if (!st.titularApellido.trim()) return 'Sumá tu apellido para completar tus datos.';
      if (st.whatsapp.length !== 10) return 'Necesitamos un WhatsApp válido de 10 dígitos (ej. 3815554321).';
    }
    if (step === 10 && !st.termsAccepted) return 'Aceptá los Términos y Condiciones antes de confirmar tu activación.';
    return '';
  }

  function renderStep2(st, S) {
    const cards = S.RUBROS.map((r) => {
      const on = st.rubroSelected && st.rubro === r.id;
      return `<button type="button" data-emp-rubro="${r.id}" aria-pressed="${on}" class="p-3.5 rounded-2xl text-left cursor-pointer flex items-center gap-3 ${on ? 'wg-option-active' : 'wg-option'}">
        <span class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${on ? 'bg-orange-100 text-[#EA580C]' : 'bg-white border border-[#E7DDD0] text-[#EA580C]'}">${RUBRO_ICONS[r.id] || ''}</span>
        <span class="text-xs sm:text-sm font-bold leading-tight">${esc(r.label)}</span>
      </button>`;
    }).join('');
    const specs = st.rubroSelected ? (S.RUBRO_SPECIALTIES[st.rubro] || []) : [];
    const specBlock = specs.length ? `<div class="space-y-1.5 pt-1"><p class="text-[11px] font-bold uppercase tracking-wider text-stone-500">Especialidades (opcional)</p><div class="flex flex-wrap gap-1.5">${specs.map((sp) => {
      const on = (st.specialties || []).includes(sp);
      return `<button type="button" data-emp-spec="${esc(sp)}" aria-pressed="${on}" class="px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${on ? 'wg-option-active' : 'wg-option'}">${esc(sp)}</button>`;
    }).join('')}</div></div>` : '';
    return `<div class="space-y-4"><div><h2 class="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900">¿Cuál es tu rubro?</h2><p class="text-xs text-stone-500 mt-1">Elegí tu actividad para adaptar portadas, servicios sugeridos y diseño.</p></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">${cards}</div>${specBlock}</div>`;
  }

  function renderBrandStyleStep(step, st, h) {
    const S = window.TucuEmpezarState, M = window.TucuEmpezarMedia, C = window.TucuEmpezarCovers, Assist = window.TucuEmpezarTaglineAssist;
    if (step === 1) {
      return `<div class="space-y-4">
        <div><h1 class="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900">¿Cómo se llama tu negocio?</h1><p class="text-xs text-stone-500 mt-1">Empecemos por el nombre con el que te buscan tus clientes.</p></div>
        <div><label for="emp-comercio" class="block text-xs font-bold text-stone-700 mb-1.5">Nombre comercial</label><input id="emp-comercio" type="text" maxlength="60" placeholder="Ej. Barbería Don Julio" value="${esc(st.comercio)}" class="w-full p-3.5 rounded-2xl bg-white/90 border border-[#E2D8CB] focus:border-[#EA580C] text-base font-semibold text-stone-900 outline-none" /><p class="emp-enter-hint text-[11px] text-stone-500 mt-1.5">Podés presionar Enter para pasar al siguiente paso.</p></div>
        ${h.errBox(st.error)}${h.navBtns(false, 'Continuar a Rubro', st)}
      </div>`;
    }
    if (step === 2) return `<div class="space-y-4">${renderStep2(st, S)}${h.errBox(st.error)}${h.navBtns(true, 'Continuar a Portada', st)}</div>`;
    if (step === 3) {
      return `<div class="space-y-4">
        <div><h2 class="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900">Elegí tu portada exclusiva</h2><p class="text-xs text-stone-500 mt-1">Cada portada disponible queda reservada solo para tu marca cuando confirmás el alta.</p></div>
        ${C.renderCoverGallery(st, M.getSlot('cover'))}
        ${h.errBox(st.error)}${h.navBtns(true, 'Continuar a Logo y Color', st)}
      </div>`;
    }
    if (step === 4) {
      const logoSlot = M.getSlot('logo'), effAcc = S.getEffectiveAccent(st), autoOn = st.accentMode === 'auto';
      const autoBtn = `<button type="button" data-emp-accent="auto" aria-pressed="${autoOn}" class="px-3.5 py-2 rounded-full text-xs font-bold inline-flex items-center gap-2 cursor-pointer ${autoOn ? 'wg-option-active' : 'wg-option'}"><span id="emp-auto-swatch" class="w-3.5 h-3.5 rounded-full border border-white/60 shrink-0" style="background-color:${esc(effAcc.bg)}"></span><span>Automático</span></button>`;
      const swatches = S.ACCENT_OPTIONS.map((a) => {
        const on = st.accentMode === 'manual' && !st.customAccentHex && st.accent === a.id;
        return `<button type="button" data-emp-accent="${a.id}" title="${esc(a.label)}" aria-label="${esc(a.label)}" style="background-color:${a.bg}" class="w-9 h-9 rounded-full flex items-center justify-center text-white cursor-pointer transition-transform ${on ? 'ring-2 ring-offset-2 ring-[#EA580C] scale-105' : 'opacity-85 hover:opacity-100'}">${on ? h.SVG.ok : ''}</button>`;
      }).join('');
      return `<div class="space-y-4">
        <div><h2 class="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900">Tu logo y color principal</h2><p class="text-xs text-stone-500 mt-1">Tu logo luce sobre blanco en el turnero y el color da vida al botón de reserva.</p></div>
        <div class="p-4 rounded-2xl bg-white/80 border border-[#E7DDD0] space-y-2">
          <div class="flex items-center justify-between gap-2"><span class="text-xs font-bold text-stone-800">Logo de tu local (mínimo 300px)</span>${logoSlot.file ? '<button type="button" id="btn-clear-logo" class="text-[11px] font-bold text-rose-600 cursor-pointer">Quitar</button>' : ''}</div>
          <label for="emp-logo-input" class="wg-btn-secondary w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer">${h.SVG.up}<span>${logoSlot.file ? 'Logo listo y optimizado (Cambiar)' : 'Subir mi logo'}</span></label>
          <input id="emp-logo-input" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" />
        </div>
        <div class="space-y-2"><span class="block text-xs font-bold text-stone-700">Color de los botones de tu turnero</span><div class="flex flex-wrap items-center gap-2">${autoBtn}${swatches}</div></div>
        ${h.errBox(st.error)}${h.navBtns(true, 'Continuar a Tu Frase', st)}
      </div>`;
    }
    return `<div class="space-y-4">
      <div><h2 class="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900">Tu frase de presentación</h2><p class="text-xs text-stone-500 mt-1">Elegí una idea lista, generá con IA o escribí una frase corta de tu negocio.</p></div>
      ${Assist?.renderStep5Controls?.(st) || ''}
      ${h.errBox(st.error)}${h.navBtns(true, 'Continuar a Ubicación y Horarios', st)}
    </div>`;
  }

  return { TOTAL_STEPS, STAGES, DRAFT_KEY, getStageForStep, getHighlightSelector, renderStageBar, saveDraft, loadDraft, clearDraft, validateStep, renderBrandStyleStep };
})();