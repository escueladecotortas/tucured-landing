// Archivo: public/js/admin_shared/turnero_cover_ui.js
// Portada Editorial V2: foto limpia sin logo arriba, título display, bajada 1 renglón, borde champagne y vocabulario por rubro (< 150L)

window.TucuCoverUI = (function () {
  const SVG = {
    calendar: '<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>',
    pin: '<svg class="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
    clock: '<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 7v5l3 2"/></svg>',
    instagram: '<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="1.9" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
    whatsapp: '<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="1.9" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>'
  };

  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  function normalizeIgUrl(raw) {
    const s = String(raw || '').trim(); if (!s) return '';
    if (/^https?:\/\//i.test(s)) return s;
    const handle = s.replace(/^@+/, '').split('/')[0].trim();
    return handle ? `https://instagram.com/${encodeURIComponent(handle)}` : '';
  }

  function normalizeWaUrl(raw) {
    const s = String(raw || '').trim(); if (!s) return '';
    if (/^https?:\/\/wa\.me\//i.test(s)) return s;
    const digits = s.replace(/\D/g, '');
    return digits.length < 6 ? '' : `https://wa.me/${digits.startsWith('54') ? digits : `549${digits}`}`;
  }

  function canUseMotion(config) {
    if (!config?.motion || config.noMotion) return false;
    const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    const saveData = typeof navigator !== 'undefined' && Boolean(navigator.connection?.saveData);
    return !reduced && !saveData;
  }

  function mount(containerEl, config, onEnterBooking, opts = {}) {
    if (!containerEl || !config) return;
    containerEl.classList.remove('is-leaving');

    const v = config.vocab || { singular: 'turno', plural: 'turnos', nextLabel: 'Tu próximo turno', historyLabel: 'Mis turnos', ctaLabel: 'Reservar turno' };
    const igUrl = normalizeIgUrl(config.instagram), waUrl = normalizeWaUrl(config.whatsapp);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.address || config.bizName)}`;
    const accent = config.accent || { bg: '#B45309', hover: '#92400E', text: '#FFFFFF' };
    const posterUrl = config.poster || config.bg, useMotion = canUseMotion(config);
    const seed = opts.activeSeed, prof = opts.clientProfile || window.TucuTicketLookup?.getClientProfile?.() || null;
    const hasSeedState = Boolean(seed || prof?.nombre);
    const seedWhen = seed ? `${String(seed.date || '').slice(5).replace('-', '/')} · ${seed.time || ''} hs` : '';
    const glassCls = 'bg-black/35 hover:bg-black/50 border border-white/25 backdrop-blur-md text-white transition-colors shadow-sm';

    const igBtn = igUrl ? `<a id="cover-btn-ig" href="${esc(igUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Instagram" class="w-10 h-10 rounded-full ${glassCls} flex items-center justify-center">${SVG.instagram}</a>` : '';
    const waBtn = waUrl ? `<a id="cover-btn-wa" href="${esc(waUrl)}" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" class="w-10 h-10 rounded-full ${glassCls} flex items-center justify-center">${SVG.whatsapp}</a>` : '';
    const videoTag = useMotion
      ? `<video id="cover-bg-video" class="tucu-cover-video absolute inset-0 w-full h-full object-cover object-center pointer-events-none opacity-0 transition-opacity duration-500" autoplay muted loop playsinline preload="metadata" poster="${esc(posterUrl)}"><source src="${esc(config.motion)}" type="video/mp4"></video>`
      : '';
    const greetHtml = prof?.nombre
      ? `<div class="mb-2"><span id="cover-client-greeting" class="inline-flex items-center px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-xs sm:text-sm font-semibold text-white shadow-sm">Hola, ${esc(prof.nombre)}</span></div>`
      : '';
    const seedHtml = seed
      ? `<button type="button" id="btn-cover-active-ticket" style="border-color:rgba(212,175,55,0.45)" class="w-full py-3 px-4 rounded-2xl bg-black/45 hover:bg-black/60 border border-[rgba(212,175,55,0.45)] backdrop-blur-md text-xs text-white flex items-center justify-between gap-3 cursor-pointer transition-colors shadow-lg tabular-nums"><span class="min-w-0 text-left"><span style="color:#E8D499" class="block text-[10px] font-bold uppercase tracking-wider">${esc(v.nextLabel)}</span><span class="block text-xs sm:text-sm font-semibold text-white truncate mt-0.5">${esc(seedWhen)}</span></span><span class="shrink-0 font-bold inline-flex items-center gap-1 text-white"><span>Ver detalle</span><span aria-hidden="true">&#8594;</span></span></button>`
      : '';
    const bottomActionHtml = hasSeedState
      ? `<button type="button" id="btn-cover-history" class="text-white/90 hover:text-white underline decoration-white/40 underline-offset-4 font-semibold cursor-pointer">${esc(v.historyLabel)}</button>`
      : `<button type="button" id="btn-cover-lookup" class="text-white/85 hover:text-white underline decoration-white/35 underline-offset-4 font-medium cursor-pointer text-left">¿Ya reservaste?</button>`;

    containerEl.innerHTML = `
      <div class="relative w-full min-h-[100dvh] h-[100dvh] lg:h-screen lg:min-h-0 overflow-hidden flex flex-col justify-between bg-stone-950 text-white">
        <img id="cover-bg-img" src="${esc(posterUrl)}" alt="${esc(config.bizName)}" class="absolute inset-0 w-full h-full object-cover object-center pointer-events-none" loading="eager" decoding="async">
        ${videoTag}
        <div id="cover-scrim" class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/15 pointer-events-none"></div>
        <div class="relative z-10 w-full max-w-lg lg:max-w-xl mx-auto px-5 lg:px-10 pt-5 sm:pt-7 lg:pt-8 flex items-start justify-end gap-2">${igBtn}${waBtn}</div>
        <div class="relative z-10 w-full max-w-lg lg:max-w-xl mx-auto px-5 lg:px-10 pb-5 sm:pb-8 space-y-3.5">
          ${greetHtml}
          <div class="space-y-1.5">
            <p id="cover-status-line" style="color:var(--tucu-accent-light,#FCD34D)" class="text-[11px] font-bold uppercase tracking-[0.22em] tabular-nums">${esc(config.status?.editorialText || 'RESERVAS ONLINE')}</p>
            <h1 id="cover-biz-name" class="font-display-editorial text-3xl sm:text-4xl lg:text-5xl font-semibold text-white leading-[1.06] break-words">${esc(config.bizName)}</h1>
            <p id="cover-tagline" class="text-[13px] sm:text-sm text-white/80 leading-snug sm:whitespace-nowrap sm:truncate max-w-full pt-0.5">${esc(config.tagline)}</p>
          </div>
          <button type="button" id="btn-cover-reservar" style="--cover-cta-bg:${esc(accent.bg)};--cover-cta-hover:${esc(accent.hover)};--cover-cta-text:${esc(accent.text)}" class="cover-cta-btn lg:hidden w-full py-3.5 px-5 rounded-2xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 shadow-xl cursor-pointer transition-all active:scale-[0.99]">${SVG.calendar}<span>${esc(v.ctaLabel)}</span></button>
          <div class="space-y-1.5 text-xs text-white/75 tabular-nums">
            <a id="cover-maps-link" href="${esc(mapsUrl)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-start gap-1.5 max-w-full hover:text-white transition-colors underline decoration-white/30 underline-offset-2">${SVG.pin}<span class="leading-snug break-words">${esc(config.address)}</span></a>
            <p id="cover-schedule-label" class="flex items-center gap-1.5 text-white/70">${SVG.clock}<span class="leading-snug">${esc(config.scheduleLabel)}</span></p>
          </div>
          ${seedHtml}
          <div class="flex items-center gap-4 pt-0.5 text-xs">${bottomActionHtml}</div>
        </div>
      </div>`;

    const videoEl = containerEl.querySelector('#cover-bg-video');
    if (videoEl) {
      videoEl.muted = true; videoEl.defaultMuted = true;
      videoEl.addEventListener('canplay', () => videoEl.classList.remove('opacity-0'), { once: true });
      videoEl.addEventListener('error', () => videoEl.remove(), { once: true });
      videoEl.play?.().catch(() => {});
    }

    const ctaBtn = containerEl.querySelector('#btn-cover-reservar');
    let leaving = false;
    ctaBtn?.addEventListener('click', () => {
      if (leaving) return; leaving = true;
      containerEl.classList.add('is-leaving');
      const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
      setTimeout(() => { if (typeof onEnterBooking === 'function') onEnterBooking(); }, reduced ? 0 : 200);
    });
    containerEl.querySelector('#btn-cover-active-ticket')?.addEventListener('click', () => opts.onOpenSeed?.(seed));
    containerEl.querySelector('#btn-cover-history')?.addEventListener('click', () => opts.onOpenHistory?.());
    containerEl.querySelector('#btn-cover-lookup')?.addEventListener('click', () => opts.onOpenLookup?.());
  }

  return { mount, normalizeIgUrl, normalizeWaUrl };
})();