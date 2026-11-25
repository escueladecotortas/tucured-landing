// Archivo: public/js/empezar/empezar_preview.js
// Vista previa Turnero V2 auténtica: tipografía display, servicios en vivo, highlight y barra móvil (< 145L)

window.TucuEmpezarPreview = (function () {
  const SVG = {
    cal: '<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>',
    pin: '<svg class="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
    clk: '<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 7v5l3 2"/></svg>',
    ig: '<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="1.9" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
    wa: '<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="1.9" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>',
    lock: '<svg class="w-3 h-3 shrink-0 text-emerald-600" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 118 0v4"/></svg>'
  };

  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  function getActiveThumb(state) {
    const coverSlot = window.TucuEmpezarMedia?.getSlot?.('cover');
    if (state.coverMode === 'custom' && coverSlot?.url) return coverSlot.url;
    const cov = window.TucuEmpezarCovers?.getCoverById?.(state.coverId) || window.TucuEmpezarCovers?.getDefaultCoverForRubro?.(state.rubro);
    return cov?.poster || '/assets/covers/peluqueria/salon_luminoso_02.webp';
  }

  function renderServiceChip(state) {
    const srvs = window.TucuEmpezarServicesStep?.cleanServices?.(state.servicios) || [];
    if (srvs.length > 0) {
      const first = srvs[0];
      const priceTxt = first.price > 0 ? ` · $${first.price.toLocaleString('es-AR')}` : '';
      const extra = srvs.length > 1 ? ` (+${srvs.length - 1})` : '';
      return `<div id="preview-service-chip" class="inline-flex items-center gap-1.5 max-w-full px-2.5 py-1 rounded-full bg-white/15 border border-white/25 backdrop-blur-md text-[10px] font-semibold text-white/95 tabular-nums"><span class="truncate">${esc(first.name)} · ${first.duration} min${esc(priceTxt)}${extra}</span></div>`;
    }
    if (state.asistenciaCarga === 'whatsapp_email') {
      return '<div id="preview-service-chip" class="inline-flex items-center px-2.5 py-1 rounded-full bg-white/15 border border-white/25 backdrop-blur-md text-[10px] font-semibold text-white/95">Lista asistida por WhatsApp</div>';
    }
    return '';
  }

  function renderMarkup(state) {
    const S = window.TucuEmpezarState, M = window.TucuEmpezarMedia, C = window.TucuEmpezarCovers;
    const theme = window.TucuCoverData?.RUBRO_THEMES?.[state.rubro];
    const rubro = S.getRubroMeta(state.rubro);
    const accent = S.getEffectiveAccent(state);
    const plan = S.getPlanMeta(state.plan);
    const logoSlot = M?.getSlot('logo'), coverSlot = M?.getSlot('cover');
    const bizName = (state.comercio || '').trim() || 'Tu Comercio';
    const tagline = (state.bajada || '').trim() || rubro.tagline;
    const slug = S.slugifySubdomain(state.slug || bizName);
    const addr = (state.direccion || '').trim() ? `${state.direccion.trim()}, ${state.localidad}` : `25 de Mayo 480, ${state.localidad}`;
    const sched = S.buildScheduleSummary(state);
    const closeTime = state.horarioModalidad === 'partido' ? (state.close2 || '21:00') : (state.close1 || '20:00');
    const ctaLabel = window.TucuCoverData?.VOCAB?.[state.rubro]?.ctaLabel || 'Reservar turno';
    const dispFont = theme?.displayFont || "'Instrument Serif', Georgia, serif";
    const dispTrack = theme?.letterSpacing || '0em';
    const accentLight = theme?.accentLight || '#FCD34D';
    const backdropHtml = C?.renderPreviewBackdrop
      ? C.renderPreviewBackdrop(state, coverSlot, bizName)
      : `<img id="preview-cover-img" src="${esc(rubro.bg)}" alt="${esc(bizName)}" class="absolute inset-0 w-full h-full object-cover object-center pointer-events-none" />`;

    const logoBadge = logoSlot?.url
      ? `<div class="w-10 h-10 rounded-full border border-white/30 bg-black/30 backdrop-blur-md shadow-md overflow-hidden shrink-0"><img src="${esc(logoSlot.url)}" alt="${esc(bizName)}" class="w-full h-full object-cover" /></div>`
      : '<span></span>';

    return `
      <div class="w-full max-w-[340px] mx-auto space-y-2.5">
        <div id="preview-domain-pill" class="px-3 py-1.5 rounded-full bg-white border border-stone-200 shadow-2xs flex items-center justify-between gap-2 text-[11px] font-semibold text-stone-700 tabular-nums">
          <span class="inline-flex items-center gap-1.5 min-w-0 truncate">${SVG.lock}<span class="truncate">${esc(slug)}.tucured.com.ar</span></span>
          <span id="preview-plan-badge" class="px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-stone-200 text-[10px] font-extrabold text-stone-800 shrink-0">${esc(plan.name)}</span>
        </div>

        <div id="preview-phone-chassis" class="relative w-full rounded-[2.25rem] border-[7px] border-stone-800 bg-stone-950 overflow-hidden shadow-xl aspect-[9/16] max-h-[590px] flex flex-col justify-between text-white">
          ${backdropHtml}
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/15 pointer-events-none"></div>

          <div class="relative z-10 px-4 pt-4 flex items-center justify-between gap-2">
            ${logoBadge}
            <div class="flex items-center gap-1.5 shrink-0">
              <span class="w-8 h-8 rounded-full bg-black/35 border border-white/25 backdrop-blur-md text-white flex items-center justify-center">${SVG.ig}</span>
              <span class="w-8 h-8 rounded-full bg-black/35 border border-white/25 backdrop-blur-md text-white flex items-center justify-center">${SVG.wa}</span>
            </div>
          </div>

          <div class="relative z-10 px-4 pb-4 space-y-2.5">
            <div class="space-y-1">
              <p id="preview-status-line" style="color:${esc(accentLight)}" class="text-[10px] font-bold uppercase tracking-[0.2em] tabular-nums">ABIERTO HASTA LAS ${esc(closeTime)}</p>
              <h3 id="preview-biz-name" style="font-family:${esc(dispFont)};letter-spacing:${esc(dispTrack)}" class="font-display-editorial text-[26px] font-semibold text-white leading-[1.06] break-words">${esc(bizName)}</h3>
              <p id="preview-tagline" class="text-xs text-white/80 leading-snug line-clamp-2">${esc(tagline)}</p>
            </div>
            ${renderServiceChip(state)}
            <button type="button" id="preview-cta-btn" data-accent="${esc(accent.bg)}" style="background-color:${esc(accent.bg)};color:${esc(accent.text || '#FFFFFF')}" class="w-full py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-xl cursor-default transition-colors">
              ${SVG.cal}
              <span>${esc(ctaLabel)}</span>
            </button>
            <div class="space-y-1 text-[11px] text-white/75 tabular-nums">
              <p id="preview-address" class="flex items-start gap-1.5 leading-snug underline decoration-white/30 underline-offset-2">${SVG.pin}<span class="truncate">${esc(addr)}</span></p>
              <p id="preview-schedule" class="flex items-center gap-1.5 text-white/70 leading-snug">${SVG.clk}<span class="truncate">${esc(sched)}</span></p>
            </div>
            <div class="flex items-center justify-between pt-0.5 text-[10px] text-white/80">
              <span class="underline decoration-white/35 underline-offset-4">¿Ya reservaste?</span>
              <span class="text-white/60 font-medium">Tucu Red · Conectamos tu negocio</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function syncFloatingBar(state) {
    const thumb = document.getElementById('emp-float-thumb');
    const dot = document.getElementById('emp-float-dot');
    const title = document.getElementById('emp-float-title');
    const sub = document.getElementById('emp-float-sub');
    if (!state) return;
    const accent = window.TucuEmpezarState.getEffectiveAccent(state);
    const plan = window.TucuEmpezarState.getPlanMeta(state.plan);
    if (thumb) thumb.src = getActiveThumb(state);
    if (dot) dot.style.backgroundColor = accent.bg;
    if (title) title.textContent = (state.comercio || '').trim() || 'Tu Comercio';
    if (sub) sub.textContent = `${plan.name} · ${state.accentMode === 'auto' ? 'Color automático' : 'Color manual'}`;
  }

  function render(el, state, highlightSelector = '') {
    if (!el || !state) return;
    el.innerHTML = renderMarkup(state);
    syncFloatingBar(state);
    if (highlightSelector) {
      const target = el.querySelector(highlightSelector);
      if (target) {
        target.classList.add('live-highlight');
        setTimeout(() => target.classList.remove('live-highlight'), 800);
      }
    }
  }

  return { render, syncFloatingBar };
})();
