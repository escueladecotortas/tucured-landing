// Archivo: public/js/empezar_covers.js
// Galería de 12 portadas vivas con filtro de clima (Día/Nocturno) y subida universal (< 130L)

window.TucuEmpezarCovers = (function () {
  const DEFAULT_COVERS = [
    { id: 'peluqueria-salon-luminoso-02', rubro: 'peluqueria', nombre: 'Salón Luminoso', estilo: 'dia', poster: '/assets/covers/peluqueria/salon_luminoso_02.webp', motion: '/assets/covers/peluqueria/salon_luminoso_02.mp4' },
    { id: 'estetica-brillo-natural-02', rubro: 'estetica', nombre: 'Brillo Natural', estilo: 'dia', poster: '/assets/covers/estetica/brillo_natural_02.webp', motion: '/assets/covers/estetica/brillo_natural_02.mp4' },
    { id: 'gastronomia-cafe-sol-02', rubro: 'gastronomia', nombre: 'Café & Sol', estilo: 'dia', poster: '/assets/covers/gastronomia/cafe_sol_02.webp', motion: '/assets/covers/gastronomia/cafe_sol_02.mp4' },
    { id: 'deportes-padel-sol-02', rubro: 'deportes', nombre: 'Pádel al Sol', estilo: 'dia', poster: '/assets/covers/deportes/padel_sol_02.webp', motion: '/assets/covers/deportes/padel_sol_02.mp4' },
    { id: 'salud-clinica-luminosa-02', rubro: 'salud', nombre: 'Clínica Luminosa', estilo: 'dia', poster: '/assets/covers/salud/clinica_luminosa_02.webp', motion: '/assets/covers/salud/clinica_luminosa_02.mp4' },
    { id: 'servicios-estudio-moderno-02', rubro: 'servicios', nombre: 'Estudio Moderno', estilo: 'dia', poster: '/assets/covers/servicios/estudio_moderno_02.webp', motion: '/assets/covers/servicios/estudio_moderno_02.mp4' },
    { id: 'peluqueria-oficio-vapor-01', rubro: 'peluqueria', nombre: 'Oficio y Vapor', estilo: 'nocturno', poster: '/assets/covers/peluqueria/oficio_vapor_01.webp', motion: '/assets/covers/peluqueria/oficio_vapor_01.mp4' },
    { id: 'estetica-calma-vela-01', rubro: 'estetica', nombre: 'Calma de Vela', estilo: 'nocturno', poster: '/assets/covers/estetica/calma_vela_01.webp', motion: '/assets/covers/estetica/calma_vela_01.mp4' },
    { id: 'gastronomia-mesa-calida-01', rubro: 'gastronomia', nombre: 'Mesa Cálida', estilo: 'nocturno', poster: '/assets/covers/gastronomia/mesa_calida_01.webp', motion: '/assets/covers/gastronomia/mesa_calida_01.mp4' },
    { id: 'deportes-cancha-nocturna-01', rubro: 'deportes', nombre: 'Cancha Nocturna', estilo: 'nocturno', poster: '/assets/covers/deportes/cancha_nocturna_01.webp', motion: '/assets/covers/deportes/cancha_nocturna_01.mp4' },
    { id: 'salud-luz-manana-01', rubro: 'salud', nombre: 'Luz de Mañana', estilo: 'nocturno', poster: '/assets/covers/salud/luz_manana_01.webp', motion: '/assets/covers/salud/luz_manana_01.mp4' },
    { id: 'servicios-claridad-cafe-01', rubro: 'servicios', nombre: 'Claridad de Estudio', estilo: 'nocturno', poster: '/assets/covers/servicios/claridad_cafe_01.webp', motion: '/assets/covers/servicios/claridad_cafe_01.mp4' }
  ];

  let catalog = DEFAULT_COVERS.slice();
  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const getAllCovers = () => catalog.slice();
  const getCoversForRubro = (rubro) => catalog.filter(c => c.rubro === rubro);
  const getCoverById = (id) => catalog.find(c => c.id === id) || null;
  const getDefaultCoverForRubro = (rubro) => catalog.find(c => c.rubro === rubro && c.estilo === 'dia') || catalog.find(c => c.rubro === rubro) || catalog[0];

  async function hydrateFromCatalog() {
    try {
      const res = await fetch('/assets/covers/cover_catalog.json');
      if (!res.ok) return catalog;
      const data = await res.json();
      if (Array.isArray(data?.covers) && data.covers.length >= 12) {
        catalog = data.covers.map(c => ({ id: c.id, rubro: c.rubro, nombre: c.nombre, estilo: c.estilo, poster: c.poster, motion: c.motion }));
      }
    } catch {}
    return catalog;
  }

  function renderCoverTile(cover, isSelected) {
    const isDay = cover.estilo === 'dia';
    const badgeCls = isDay ? 'bg-amber-50/95 text-amber-900 border-amber-200' : 'bg-stone-900/90 text-white border-stone-700';
    return `<button type="button" data-emp-cover-id="${esc(cover.id)}" aria-pressed="${isSelected}" class="group relative rounded-2xl overflow-hidden border text-left cursor-pointer transition-all ${isSelected ? 'border-stone-900 ring-2 ring-stone-900 shadow-sm' : 'border-stone-200 hover:border-stone-400'}">
      <div class="relative aspect-[4/3] bg-stone-900 overflow-hidden">
        <img src="${esc(cover.poster)}" alt="${esc(cover.nombre)}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent"></div>
        <span class="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeCls}">${isDay ? 'Día' : 'Nocturno'}</span>
        <span class="absolute bottom-1.5 left-2 right-2 text-[11px] font-bold text-white leading-tight truncate">${esc(cover.nombre)}</span>
      </div>
    </button>`;
  }

  function filterList(tab, rubro) {
    if (tab === 'dia') return catalog.filter(c => c.estilo === 'dia');
    if (tab === 'nocturno') return catalog.filter(c => c.estilo === 'nocturno');
    if (tab === 'all') return getAllCovers();
    return getCoversForRubro(rubro);
  }

  function renderCoverGallery(state, customSlot = {}) {
    const tab = state.coverTab || 'rubro';
    const tabs = [
      ['rubro', 'Recomendadas del rubro'],
      ['dia', 'Día / Luminoso'],
      ['nocturno', 'Nocturno / Íntimo'],
      ['all', 'Ver las 12'],
      ['custom', 'Subir mi foto']
    ].map(([id, label]) => {
      const on = tab === id;
      return `<button type="button" data-emp-cover-tab="${id}" class="px-2.5 py-1.5 rounded-xl text-[11px] font-bold border cursor-pointer transition-colors ${on ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'}">${esc(label)}</button>`;
    }).join('');

    let body = '';
    if (tab === 'custom') {
      body = `<div class="p-3 rounded-xl bg-white border border-stone-200 space-y-2">
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs font-bold text-stone-800">Subir mi foto de portada</span>
          ${customSlot.file ? '<button type="button" id="btn-clear-cover" class="text-[11px] font-bold text-rose-600 cursor-pointer">Quitar foto</button>' : ''}
        </div>
        <label for="emp-cover-input" class="w-full py-2.5 px-3 rounded-xl bg-[#FAF8F5] hover:bg-stone-100 border border-dashed border-stone-300 text-xs font-semibold text-stone-700 flex items-center justify-center gap-1.5 cursor-pointer">
          <span>${customSlot.file ? `Foto optimizada · ${customSlot.kb} KB (Cambiar)` : 'Elegir imagen JPG, PNG o WebP (mín. 800x450 px)'}</span>
        </label>
        <input id="emp-cover-input" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" />
      </div>`;
    } else {
      const list = filterList(tab, state.rubro);
      const wrapCls = list.length > 2 ? 'grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1' : 'grid grid-cols-2 gap-2.5';
      const activeId = state.coverMode === 'custom' ? '' : (state.coverId || getDefaultCoverForRubro(state.rubro).id);
      body = `<div class="${wrapCls}">${list.map(c => renderCoverTile(c, c.id === activeId)).join('')}</div>`;
    }

    return `<div class="p-3 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-2.5">
      <div class="flex items-center justify-between gap-2 flex-wrap">
        <span class="text-xs font-bold text-stone-800">Portada viva de tu App</span>
        <span class="text-[11px] text-stone-500">Video loop en vivo o foto propia</span>
      </div>
      <div class="flex flex-wrap gap-1.5">${tabs}</div>
      ${body}
    </div>`;
  }

  function renderPreviewBackdrop(state, customSlot, bizName) {
    if (state.coverMode === 'custom' && customSlot?.url) {
      return `<img id="preview-cover-img" src="${esc(customSlot.url)}" alt="${esc(bizName)}" class="absolute inset-0 w-full h-full object-cover object-center pointer-events-none" />`;
    }
    const cover = getCoverById(state.coverId) || getDefaultCoverForRubro(state.rubro);
    const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !cover.motion) {
      return `<img id="preview-cover-img" src="${esc(cover.poster)}" alt="${esc(bizName)}" class="absolute inset-0 w-full h-full object-cover object-center pointer-events-none" />`;
    }
    return `<video id="preview-cover-video" autoplay loop muted playsinline poster="${esc(cover.poster)}" class="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"><source src="${esc(cover.motion)}" type="video/mp4" /></video>`;
  }

  return {
    getAllCovers, getCoversForRubro, getCoverById, getDefaultCoverForRubro,
    hydrateFromCatalog, renderCoverGallery, renderPreviewBackdrop
  };
})();
