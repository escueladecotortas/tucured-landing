// Archivo: public/js/empezar_preview_styles.js
// Encendido progresivo P1-P10: 0 badges fantasma, 0 logos en portada, .webp temporal, glass social y Turnero blanco (< 195L)

window.TucuEmpezarPreviewStyles = (function () {
  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const SVG = {
    pin: '<svg class="w-3.5 h-3.5 shrink-0 text-stone-500 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><circle cx="12" cy="11" r="2.5"/></svg>',
    clk: '<svg class="w-3.5 h-3.5 shrink-0 text-stone-500 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 7v5l3 2"/></svg>',
    cal: '<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2.1" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>',
    ig: '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="1.9" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
    wa: '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="1.9" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>'
  };

  const RUBRO_TYPO = {
    peluqueria: { font: "'Instrument Serif', Georgia, serif", track: '0.01em' },
    estetica: { font: "'Cormorant Garamond', Georgia, serif", track: '0em' },
    deportes: { font: "'Barlow Condensed', sans-serif", track: '0.01em' },
    salud: { font: "'Outfit', sans-serif", track: '-0.01em' },
    servicios: { font: "'Space Grotesk', sans-serif", track: '-0.01em' }
  };

  const initials = (name) => String(name || 'TR').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'TR';
  const getCtaLabel = (rubro) => window.TucuEmpezarSpecialtyData?.getCtaVerb?.(rubro) || (rubro === 'salud' ? 'Reservar consulta' : (rubro === 'deportes' ? 'Reservar cancha' : 'Reservar turno'));

  function resolveMedia(st) {
    const covSlot = window.TucuEmpezarMedia?.getSlot?.('cover');
    const covObj = window.TucuEmpezarCovers?.getCoverById?.(st.coverId);
    if (st.coverMode === 'custom' && covSlot?.url) return { poster: covSlot.url, motion: '', isTemp: false };
    if (st.coverMode === 'temp' || String(st.coverId || '').startsWith('temp_')) {
      const tempPath = window.TucuEmpezarCovers?.getTempCoverPath?.(st.rubro || 'peluqueria') || '/assets/covers/temp/temp_peluqueria.webp';
      return { poster: tempPath, motion: '', isTemp: true };
    }
    const chosen = covObj || window.TucuEmpezarCovers?.getDefaultCoverForRubro?.(st.rubro || 'peluqueria');
    return { poster: chosen?.poster || '', motion: (st.coverMode !== 'still' && chosen?.motion) ? chosen.motion : '', isTemp: false };
  }

  function mediaTag(st, cls) {
    const m = resolveMedia(st);
    if (!m.poster && !m.motion) return `<div class="${cls} bg-[#F1EBE3]"></div>`;
    if (m.motion) return `<video src="${esc(m.motion)}" poster="${esc(m.poster)}" autoplay loop muted playsinline class="${cls} object-cover object-center"></video>`;
    return `<img src="${esc(m.poster)}" alt="${m.isTemp ? 'Portada temporal' : 'Portada'}" data-temp-cover="${m.isTemp ? '1' : '0'}" class="${cls} object-cover object-center" />`;
  }

  function socialChips(st) {
    if (st.step < 9) return '';
    const cls = 'w-8 h-8 rounded-full wg-social-glass flex items-center justify-center text-stone-800 shadow-xs';
    const ig = st.instagram?.trim() ? `<span data-preview-ig="1" class="${cls}">${SVG.ig}</span>` : '';
    const wa = st.whatsapp?.trim().length >= 8 ? `<span data-preview-wa="1" class="${cls}">${SVG.wa}</span>` : '';
    return (ig || wa) ? `<div class="flex items-center gap-1.5 shrink-0">${ig}${wa}</div>` : '';
  }

  function infoBlock(st) {
    if (st.step < 6) return '';
    const fullAddr = st.direccion?.trim() ? `${st.direccion.trim()}${st.pisoDepto?.trim() ? ', ' + st.pisoDepto.trim() : ''}, ${st.localidad || 'Tucumán'}` : '';
    const sched = window.TucuEmpezarState?.buildScheduleSummary?.(st) || '';
    const soc = socialChips(st);
    return `<div class="flex items-end justify-between gap-2 text-[10.5px] text-stone-700 tabular-nums">
      <div class="min-w-0 flex-1 space-y-1">
        ${fullAddr ? `<p id="preview-address" class="flex items-start gap-1.5 leading-snug break-words">${SVG.pin}<span>${esc(fullAddr)}</span></p>` : ''}
        ${sched ? `<p id="preview-schedule" class="flex items-start gap-1.5 leading-snug break-words">${SVG.clk}<span>${esc(sched)}</span></p>` : ''}
      </div>
      ${soc}
    </div>`;
  }

  function renderCoverStyle(st) {
    const name = String(st.comercio || '').trim() || 'Tu negocio';
    const typo = RUBRO_TYPO[st.rubro] || { font: "'Plus Jakarta Sans', sans-serif", track: '0em' };
    if (st.step <= 2) {
      const fontStyle = st.rubroSelected ? `--emp-display-font:${typo.font};--emp-display-tracking:${typo.track}` : "--emp-display-font:'Plus Jakarta Sans', sans-serif;--emp-display-tracking:-0.01em";
      return `<div class="h-full flex flex-col items-center justify-center bg-[#FAF8F5] text-[#292524] p-6 text-center">
        <h4 id="preview-biz-name" class="emp-display text-3xl font-bold leading-tight text-[#292524] break-words" style="${fontStyle}">${esc(name)}</h4>
      </div>`;
    }

    const accent = st.step >= 4 ? (window.TucuEmpezarState?.getEffectiveAccent?.(st)?.bg || '#EA580C') : '#EA580C';
    const tag = (st.step >= 5 && !st.noTagline && st.bajada?.trim()) ? st.bajada.trim().slice(0, 55) : '';
    const fontStyle = `--emp-display-font:${typo.font};--emp-display-tracking:${typo.track}`;
    const style = st.coverStyle || 'editorial';
    const ctaText = getCtaLabel(st.rubro);
    const info = infoBlock(st);

    if (style === 'poster') {
      const tone = st.posterTone === 'light' ? 'light' : 'dark';
      const veil = tone === 'light' ? 'from-[#FAF8F5]/92 via-[#FAF8F5]/68 to-transparent' : 'from-[#1C1917]/74 via-[#1C1917]/40 to-transparent';
      const inkCls = tone === 'light' ? 'text-[#292524]' : 'text-[#FAF8F5]';
      const subInkCls = tone === 'light' ? 'text-stone-700' : 'text-white/90';
      const linkCls = tone === 'light' ? 'text-stone-700' : 'text-white/90';
      return `<div class="h-full emp-passe-partout flex flex-col text-[#292524]">
        <div id="preview-poster-card" data-poster-tone="${tone}" class="relative flex-1 rounded-[24px] overflow-hidden border border-stone-300/70 shadow-2xs">
          ${mediaTag(st, 'absolute inset-0 w-full h-full')}
          <div class="absolute inset-x-0 top-0 h-40 bg-gradient-to-b ${veil} pointer-events-none"></div>
          <div class="relative z-10 p-4 space-y-1">
            <div class="flex items-center justify-between gap-2">
              <span class="px-2.5 py-0.5 rounded-full bg-white/90 border border-stone-200 text-[9.5px] font-bold uppercase tracking-wider text-emerald-700">Abierto hoy</span>
              <span class="text-[10.5px] font-semibold ${linkCls} underline underline-offset-4">¿Ya reservaste?</span>
            </div>
            <h4 id="preview-biz-name" class="emp-display text-[26px] font-bold leading-[1.04] ${inkCls}" style="${fontStyle}">${esc(name)}</h4>
            ${tag ? `<p id="preview-tagline" class="text-[11.5px] font-medium ${subInkCls} leading-snug">${esc(tag)}</p>` : ''}
          </div>
          <div class="wg-dock-glass absolute inset-x-2.5 bottom-2.5 z-10 rounded-2xl p-3 space-y-2">
            <span id="preview-cta-btn" style="background-color:${esc(accent)}" class="w-full py-2.5 px-3 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs">${SVG.cal}<span>${esc(ctaText)}</span></span>
            ${info}
          </div>
        </div>
      </div>`;
    }

    if (style === 'bento') {
      return `<div class="h-full flex flex-col justify-between bg-[#FAF8F5] p-3.5 text-[#292524]">
        <div class="flex items-center justify-between gap-2">
          <h4 id="preview-biz-name" class="emp-display text-[22px] font-bold leading-tight text-[#292524] break-words min-w-0" style="${fontStyle}">${esc(name)}</h4>
          <span class="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[9.5px] font-bold text-emerald-700 shrink-0">Abierto</span>
        </div>
        <div class="relative flex-1 my-2.5 rounded-[20px] overflow-hidden border border-stone-200/90 shadow-2xs min-h-[170px]">
          ${mediaTag(st, 'w-full h-full')}
        </div>
        <div class="space-y-2">
          ${tag ? `<p id="preview-tagline" class="text-xs font-medium text-stone-700 leading-snug break-words">${esc(tag)}</p>` : ''}
          <span id="preview-cta-btn" style="background-color:${esc(accent)}" class="w-full py-2.5 px-4 rounded-2xl text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs">${SVG.cal}<span>${esc(ctaText)}</span></span>
          ${info ? `<div class="p-2.5 rounded-2xl bg-[#F1EBE3] border border-stone-200/80">${info}</div>` : ''}
          <p class="text-center text-[10.5px] font-semibold text-stone-500 underline underline-offset-4">¿Ya reservaste?</p>
        </div>
      </div>`;
    }

    return `<div class="h-full flex flex-col bg-[#FAF8F5] text-[#292524]">
      <div class="relative h-[56%] w-full overflow-hidden shrink-0">${mediaTag(st, 'w-full h-full')}</div>
      <div class="relative z-10 -mt-6 flex-1 rounded-t-[26px] bg-[#FAF8F5] px-4 pt-3.5 pb-3.5 flex flex-col justify-between shadow-[0_-12px_28px_-14px_rgba(41,37,36,0.2)]">
        <div class="space-y-1">
          <div class="flex items-center justify-between gap-2">
            <span class="text-[9.5px] font-bold uppercase tracking-[0.16em] text-emerald-700">Abierto hoy</span>
            <span class="text-[10.5px] font-semibold text-stone-500 underline underline-offset-4">¿Ya reservaste?</span>
          </div>
          <h4 id="preview-biz-name" class="emp-display text-[25px] font-bold leading-[1.05] text-[#292524]" style="${fontStyle}">${esc(name)}</h4>
          ${tag ? `<p id="preview-tagline" class="text-xs text-stone-600 leading-snug break-words">${esc(tag)}</p>` : ''}
        </div>
        <span id="preview-cta-btn" style="background-color:${esc(accent)}" class="w-full py-2.5 px-4 rounded-2xl text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs">${SVG.cal}<span>${esc(ctaText)}</span></span>
        ${info}
      </div>
    </div>`;
  }

  function renderTurneroPreview(st) {
    const accent = window.TucuEmpezarState?.getEffectiveAccent?.(st)?.bg || '#EA580C';
    const logoUrl = window.TucuEmpezarMedia?.getSlot?.('logo')?.url || '';
    const name = String(st.comercio || '').trim() || 'Tu negocio';
    const logoNode = logoUrl
      ? `<img src="${esc(logoUrl)}" alt="" class="w-[52px] h-[52px] rounded-xl object-contain bg-white border border-stone-200/70 p-1 shrink-0" />`
      : `<div style="background-color:${esc(accent)}" class="w-[52px] h-[52px] rounded-xl text-white font-bold text-xs flex items-center justify-center shrink-0">${esc(initials(name))}</div>`;
    const isWaList = st.asistenciaCarga === 'whatsapp_email';
    const list = window.TucuEmpezarServicesStep?.cleanServices?.(st.servicios) || [];
    const items = list.length ? list.slice(0, 3) : [{ name: 'Servicio principal', duration: 30, price: 8500, noPrice: false, noTime: false }];
    const srvBlock = isWaList
      ? `<div class="p-3.5 rounded-2xl bg-white/95 border border-[#DFD7CA] text-xs text-stone-700 leading-snug"><strong class="block text-stone-900 mb-0.5">Lista por WhatsApp</strong>Tus servicios aparecerán acá apenas nuestro equipo los cargue.</div>`
      : items.map((sv) => `<div class="p-2.5 rounded-2xl bg-white/95 border border-[#DFD7CA] flex items-center justify-between gap-2"><div class="min-w-0"><span class="block text-xs font-bold text-stone-900 truncate">${esc(sv.name)}</span>${sv.noTime ? '' : `<span class="block text-[10px] text-stone-500">${Number(sv.duration || 30)} min</span>`}</div><span class="text-xs font-bold text-stone-800 shrink-0 tabular-nums">${sv.noPrice ? 'Consultar' : `$${Number(sv.price || 0).toLocaleString('es-AR')}`}</span></div>`).join('');
    return `<div class="h-full bg-[#F1EBE3] text-[#292524] flex flex-col justify-between">
      <div>
        <div id="preview-turnero-header-band" class="bg-white px-4 pt-3.5 pb-3 border-b border-stone-200/90 flex items-center justify-between gap-2">
          <div class="flex items-center gap-2.5 min-w-0">${logoNode}<span class="text-sm font-semibold text-stone-800 truncate">${esc(name)}</span></div>
          <span class="text-[10px] font-bold uppercase tracking-wider shrink-0" style="color:${esc(accent)}">PASO 1 DE 2</span>
        </div>
        <div class="px-4 pt-3 space-y-3">
          <div class="w-full h-1 rounded-full bg-stone-300/60 overflow-hidden"><div style="background-color:${esc(accent)};width:50%" class="h-full rounded-full"></div></div>
          <div id="preview-service-chip" class="space-y-2">${srvBlock}</div>
        </div>
      </div>
      <div class="p-4 pt-2"><span id="preview-cta-btn" style="background-color:${esc(accent)}" class="block w-full py-2.5 rounded-xl text-center text-xs font-bold text-white shadow-2xs">Continuar a tus datos →</span></div>
    </div>`;
  }

  return { renderCoverStyle, renderTurneroPreview };
})();