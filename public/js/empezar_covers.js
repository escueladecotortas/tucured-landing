// Archivo: public/js/empezar_covers.js
// Selector Paso 3: portadas exclusivas, foto propia seleccionable con tilde y temporal .webp real (< 170L)

window.TucuEmpezarCovers = (function () {
  const DEFAULT_ENGINE = 'https://engine.tucured.com.ar';
  const TEMP_FILES = {
    peluqueria: '/assets/covers/temp/temp_peluqueria.webp',
    estetica: '/assets/covers/temp/temp_estetica.webp',
    deportes: '/assets/covers/temp/temp_deportes.webp',
    salud: '/assets/covers/temp/temp_salud.webp',
    servicios: '/assets/covers/temp/temp_servicios.webp'
  };
  let catalog = [], takenSet = new Set(), pageIndex = 0;

  const resolveEngineBase = () => (window.TUCU_ENGINE_URL ? String(window.TUCU_ENGINE_URL).replace(/\/$/, '') : DEFAULT_ENGINE);
  const getTempCoverPath = (rubro) => TEMP_FILES[rubro] || TEMP_FILES.peluqueria;

  async function fetchJsonTimeout(url, opts, ms) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms);
    try {
      const res = await fetch(url, { ...(opts || {}), signal: ctrl.signal });
      const data = await res.json().catch(() => null);
      return { ok: res.ok, status: res.status, data };
    } catch (_) {
      return { ok: false, status: 0, data: null };
    } finally { clearTimeout(timer); }
  }

  async function hydrateFromCatalog() {
    if (!catalog.length) {
      const r = await fetchJsonTimeout('/assets/covers/cover_catalog.json', null, 5000);
      catalog = Array.isArray(r.data?.covers) ? r.data.covers : [];
    }
    const s = await fetchJsonTimeout(`${resolveEngineBase()}/api/portal/covers/status`, null, 5000);
    const locked = s.data?.lockedIds || s.data?.takenIds;
    if (Array.isArray(locked)) takenSet = new Set(locked);
    else if (s.data?.covers && typeof s.data.covers === 'object') {
      Object.entries(s.data.covers).forEach(([id, st]) => { if (st && st !== 'available') takenSet.add(id); });
    }
    return catalog;
  }

  const isTaken = (cover) => Boolean(cover && ((cover.status && cover.status !== 'available') || takenSet.has(cover.id)));
  const getCoverById = (id) => (!id || String(id).startsWith('temp_') || id === 'custom') ? null : (catalog.find((c) => c.id === id) || null);
  const getDefaultCoverForRubro = (rubro) => catalog.find((c) => c.rubro === (rubro || 'peluqueria') && !isTaken(c)) || catalog.find((c) => c.rubro !== 'gastronomia' && !isTaken(c)) || null;

  function getOrderedCovers(rubro, specialties = []) {
    const specs = (Array.isArray(specialties) ? specialties : []).map((x) => x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
    const free = catalog.filter((c) => c.rubro !== 'gastronomia' && !isTaken(c));
    const score = (c) => {
      let n = c.rubro === rubro ? 100 : 0;
      const tags = (Array.isArray(c.tags) ? c.tags : []).map((t) => String(t).toLowerCase());
      specs.forEach((sp) => { if (tags.some((t) => t.includes(sp) || sp.includes(t))) n += 10; });
      return n;
    };
    return [...free].sort((a, b) => score(b) - score(a));
  }

  function stepPage(delta, rubro, specialties) {
    const total = Math.max(1, Math.ceil(getOrderedCovers(rubro, specialties).length / 2));
    pageIndex = (pageIndex + delta + total) % total;
  }
  const resetPage = () => { pageIndex = 0; };

  async function lockCover(coverId, slug, comercio, rubro = '', paymentMode = 'transfer') {
    if (!coverId || coverId === 'custom' || String(coverId).startsWith('temp_')) return { ok: true };
    const res = await fetchJsonTimeout(`${resolveEngineBase()}/api/portal/covers/lock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coverId, slug, comercio, rubro, paymentMode })
    }, 5000);
    if (res.status === 409 || res.data?.error === 'COVER_ALREADY_TAKEN') { takenSet.add(coverId); return { ok: false, conflict: true }; }
    return { ok: true };
  }

  function renderCoverGallery(state, customSlot) {
    const list = getOrderedCovers(state.rubro, state.specialties);
    const totalPages = Math.max(1, Math.ceil(list.length / 2));
    const safePage = pageIndex % totalPages;
    const pair = list.slice(safePage * 2, safePage * 2 + 2);
    const isMotion = state.coverMode !== 'still';
    const isTemp = state.coverMode === 'temp' || String(state.coverId || '').startsWith('temp_');
    const isCustom = state.coverMode === 'custom';
    const slot = customSlot || window.TucuEmpezarMedia?.getSlot?.('cover');
    const hasCustom = Boolean(slot?.url);

    const cardsHtml = pair.map((c) => {
      const selected = !isTemp && !isCustom && state.coverId === c.id;
      const ring = selected ? 'ring-2 ring-[#EA580C] ring-offset-2 ring-offset-[#FAF8F5]' : 'hover:opacity-95';
      const media = isMotion && c.motion
        ? `<video src="${c.motion}" poster="${c.poster}" autoplay loop muted playsinline class="w-full h-full object-cover"></video>`
        : `<img src="${c.poster}" alt="" class="w-full h-full object-cover" />`;
      return `<button type="button" data-emp-cover-id="${c.id}" aria-pressed="${selected}" aria-label="Elegir portada ${c.rubro}" class="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-[#EFE8DF] transition-all cursor-pointer ${ring}">${media}${selected ? '<span class="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-[#EA580C] text-white text-xs font-bold flex items-center justify-center shadow-md">&#10003;</span>' : ''}</button>`;
    }).join('');

    const customCard = hasCustom ? `
      <button type="button" id="btn-emp-select-custom-cover" data-emp-select-custom="1" aria-pressed="${isCustom}" class="w-full p-2.5 rounded-2xl flex items-center gap-3 text-left transition-all cursor-pointer ${isCustom ? 'bg-emerald-50/85 border-2 border-emerald-500' : 'wg-option'}">
        <img src="${slot.url}" alt="Tu foto cargada" class="w-12 h-16 rounded-xl object-cover shrink-0 border border-stone-200" />
        <div class="min-w-0 flex-1">
          <span class="inline-flex items-center gap-1 text-xs font-extrabold ${isCustom ? 'text-emerald-700' : 'text-stone-800'}">&#10003; Tu foto cargada</span>
          <span class="block text-[11px] text-stone-500 truncate">${isCustom ? 'Activa en tu portada (podés alternar con el catálogo)' : 'Tocá para volver a usar tu foto propia'}</span>
        </div>
      </button>` : '';

    return `<div class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="inline-flex p-1 rounded-2xl wg-pill gap-1" role="group" aria-label="Formato de portada">
          <button type="button" data-emp-cover-media="live" class="px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${isMotion ? 'wg-option-active' : 'text-stone-600'}">Con movimiento</button>
          <button type="button" data-emp-cover-media="still" class="px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${!isMotion ? 'wg-option-active' : 'text-stone-600'}">Imagen fija</button>
        </div>
        <div class="inline-flex items-center gap-1.5">
          <button type="button" id="btn-emp-cover-prev" aria-label="Portadas anteriores" class="wg-btn-secondary w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center cursor-pointer">&#8592;</button>
          <span class="text-[11px] font-semibold text-stone-500 px-1">${safePage + 1} / ${totalPages}</span>
          <button type="button" id="btn-emp-cover-next" aria-label="Siguientes portadas" class="wg-btn-secondary w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center cursor-pointer">&#8594;</button>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">${cardsHtml || '<div class="col-span-2 py-8 text-center text-xs text-stone-500">Cargando portadas...</div>'}</div>
      ${customCard}
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        <label for="emp-cover-input" class="p-3 rounded-2xl bg-white/85 border border-[#E2D8CB] hover:border-[#EA580C]/60 flex items-center gap-2.5 cursor-pointer transition-colors">
          <span class="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 text-[#EA580C] flex items-center justify-center shrink-0"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg></span>
          <span class="min-w-0"><strong class="block text-xs font-bold text-stone-800">${hasCustom ? 'Cambiar foto propia' : 'Subir foto propia'}</strong><span class="block text-[10.5px] text-stone-500">JPG, PNG o WebP</span></span>
          <input type="file" id="emp-cover-input" accept="image/jpeg,image/png,image/webp" class="hidden" />
        </label>
        <button type="button" id="btn-emp-cover-temp" class="p-3 rounded-2xl text-left flex items-center justify-between gap-2 cursor-pointer transition-colors ${isTemp ? 'wg-option-active' : 'bg-[#F5EFE7]/80 border border-[#E2D8CB] text-stone-700 hover:bg-[#EFE7DC]'}">
          <span class="min-w-0"><strong class="block text-xs font-bold">Usar portada temporal por ahora</strong><span class="block text-[10.5px] text-stone-500">Podés cambiarla después de activar</span></span>
        </button>
      </div>
    </div>`;
  }

  return { hydrateFromCatalog, loadCatalog: hydrateFromCatalog, getTempCoverPath, getCoverById, getDefaultCoverForRubro, getOrderedCovers, stepPage, resetPage, lockCover, renderCoverGallery };
})();