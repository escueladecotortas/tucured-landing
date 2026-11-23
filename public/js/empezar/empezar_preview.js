// Archivo: public/js/empezar/empezar_preview.js
// Celular de Vista Previa en Vivo estilo Portada App TASK-104 con Playfair Display (< 130L)

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

  function getMonogram(name) {
    const words = String(name || '').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, ' ').trim().split(/\s+/).filter(Boolean);
    if (!words.length) return 'TC';
    return words.length === 1 ? words[0].slice(0, 2).toUpperCase() : (words[0][0] + words[1][0]).toUpperCase();
  }

  function renderMarkup(state) {
    const S = window.TucuEmpezarState, M = window.TucuEmpezarMedia;
    const rubro = S.getRubroMeta(state.rubro);
    const accent = S.getAccentMeta(state.accent, state.rubro);
    const logoSlot = M?.getSlot('logo'), coverSlot = M?.getSlot('cover');
    const bgSrc = state.coverMode === 'custom' && coverSlot?.url ? coverSlot.url : rubro.bg;
    const bizName = (state.comercio || '').trim() || 'Tu Comercio';
    const tagline = (state.bajada || '').trim() || rubro.tagline;
    const slug = S.slugifySubdomain(state.slug || bizName);
    const addr = (state.direccion || '').trim() ? `${state.direccion.trim()}, ${state.localidad}` : `Av. Principal 480, ${state.localidad}`;
    const sched = S.buildScheduleSummary(state);

    const brandCircle = logoSlot?.url
      ? `<img src="${esc(logoSlot.url)}" alt="${esc(bizName)}" class="w-full h-full object-cover" />`
      : `<span class="text-xs font-extrabold tracking-tight text-white">${esc(getMonogram(bizName))}</span>`;

    return `
      <div class="w-full max-w-[340px] mx-auto space-y-2.5">
        <div id="preview-domain-pill" class="px-3 py-1.5 rounded-full bg-white border border-stone-200 shadow-2xs flex items-center justify-center gap-1.5 text-[11px] font-semibold text-stone-700 tabular-nums">
          ${SVG.lock}
          <span class="truncate">${esc(slug)}.tucured.com.ar</span>
        </div>

        <div class="relative w-full rounded-[2.25rem] border-[7px] border-stone-800 bg-stone-950 overflow-hidden shadow-xl aspect-[9/16] max-h-[580px] flex flex-col justify-between text-white">
          <img id="preview-cover-img" src="${esc(bgSrc)}" alt="${esc(bizName)}" class="absolute inset-0 w-full h-full object-cover object-center pointer-events-none" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20 pointer-events-none"></div>

          <div class="relative z-10 px-4 pt-4 flex items-center justify-between gap-2">
            <div class="w-10 h-10 rounded-full border border-white/25 bg-white/15 backdrop-blur-md shadow-md overflow-hidden flex items-center justify-center shrink-0">${brandCircle}</div>
            <div class="flex items-center gap-1.5 shrink-0">
              <span class="w-8 h-8 rounded-full bg-white/15 border border-white/25 backdrop-blur-md text-white flex items-center justify-center">${SVG.ig}</span>
              <span class="w-8 h-8 rounded-full bg-white/15 border border-white/25 backdrop-blur-md text-white flex items-center justify-center">${SVG.wa}</span>
            </div>
          </div>

          <div class="relative z-10 px-4 pb-5 space-y-3">
            <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 border border-white/25 backdrop-blur-md text-[11px] font-semibold text-white/95 tabular-nums">
              <span class="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
              <span>Abierto ahora · hasta las ${esc(state.horarioModalidad === 'partido' ? (state.close2 || '21:00') : (state.close1 || '20:00'))}</span>
            </div>
            <div class="space-y-1">
              <h3 id="preview-biz-name" class="font-serif-editorial text-2xl font-bold tracking-tight text-white leading-[1.1] break-words">${esc(bizName)}</h3>
              <p id="preview-tagline" class="text-xs text-white/80 leading-snug line-clamp-2">${esc(tagline)}</p>
            </div>
            <button type="button" id="preview-cta-btn" data-accent="${esc(accent.bg)}" style="background-color:${esc(accent.bg)};color:${esc(accent.text)}" class="w-full py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg cursor-default">
              ${SVG.cal}
              <span>Reservar turno</span>
            </button>
            <div class="space-y-1 text-[11px] text-white/80 tabular-nums">
              <p id="preview-address" class="flex items-start gap-1.5 leading-snug">${SVG.pin}<span class="truncate">${esc(addr)}</span></p>
              <p id="preview-schedule" class="flex items-center gap-1.5 text-white/75 leading-snug">${SVG.clk}<span class="truncate">${esc(sched)}</span></p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function render(el, state) {
    if (!el || !state) return;
    el.innerHTML = renderMarkup(state);
  }

  return { render };
})();