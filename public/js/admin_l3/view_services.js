// Archivo: public/js/admin_l3/view_services.js
// Catálogo L3: Duración Libre, Soft-Delete, Pausado e Historial de Precios (< 170 líneas)

window.AdminL3Services = (function () {
  let selectedCategory = 'ALL';
  const STD_DUR = ['15', '30', '45', '60', '90'];

  function render(container, state) {
    const svg = window.AdminL3Core.svg, p = state.presets[state.rubro] || {};
    const services = (state.services || []).filter(s => !s.deletedAt);
    const categories = (state.categories || []).filter(c => !c.deletedAt);
    const catPills = [
      `<button onclick="AdminL3Services.setCategory('ALL')" class="admin-glass-pill ${selectedCategory === 'ALL' ? 'is-active' : ''} px-3 py-1 rounded-xl text-xs font-bold">Todas</button>`,
      ...categories.map(c => `<button onclick="AdminL3Services.setCategory('${c.name}')" class="admin-glass-pill ${selectedCategory === c.name ? 'is-active' : ''} px-3 py-1 rounded-xl text-xs font-bold">${c.name}</button>`)
    ].join(' ');

    const filtered = selectedCategory === 'ALL' ? services : services.filter(s => s.category === selectedCategory);
    const rows = filtered.map(s => {
      const code = (s.icon && /^[A-Za-z0-9]{1,3}$/.test(s.icon)) ? s.icon : s.name.slice(0, 2).toUpperCase();
      const isAct = s.active !== false && s.isActive !== false;
      const hist = s.priceHistory || [], adjBtn = hist.length ? `<button onclick="AdminL3Services.showPriceHistory('${s.id}')" class="mt-0.5 text-[10px] px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 font-semibold cursor-pointer">Historial (${hist.length})</button>` : '';
      return `<tr class="border-b border-stone-100 dark:border-stone-800/60 hover:bg-stone-50 dark:hover:bg-stone-900/40 text-xs ${isAct ? '' : 'opacity-55'}">
        <td class="py-3 px-4 font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2.5"><span class="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800 border border-[#D5CEC2] dark:border-stone-700 flex items-center justify-center text-[11px] font-black text-red-900 dark:text-red-300">${code}</span><div><p class="font-bold text-stone-900 dark:text-stone-100 text-xs ${isAct ? '' : 'line-through'}">${s.name}</p><span class="text-[10px] text-red-900 dark:text-red-400 font-semibold uppercase">${s.category || 'General'}</span></div></td>
        <td class="py-3 px-4 font-mono text-stone-600 dark:text-stone-300 font-semibold">${s.duration || 30} min</td>
        <td class="py-3 px-4 font-bold text-emerald-700 dark:text-emerald-400">$${(s.price || 0).toLocaleString('es-AR')}<div class="text-[10px] font-normal text-stone-500">Seña: $${(window.AdminBookingEngine ? window.AdminBookingEngine.calcDeposit(s.price || 0, 'l3') : 0).toLocaleString('es-AR')}</div>${adjBtn}</td>
        <td class="py-3 px-4 font-mono text-stone-500 text-[11px]">${s.advanceHours || 2} hs previas</td>
        <td class="py-3 px-4"><div class="flex items-center gap-1.5"><span class="px-2 py-0.5 rounded text-[9px] font-bold ${isAct ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-100 text-stone-500'}">${isAct ? 'Activo' : 'Pausado'}</span></div></td>
        <td class="py-3 px-4 text-right whitespace-nowrap"><button onclick="AdminL3Services.toggleActive('${s.id}')" class="px-2.5 py-1 rounded-lg admin-glass-btn text-[11px] font-semibold mr-1">${isAct ? 'Pausar' : 'Activar'}</button><button onclick="AdminL3Services.openEditModal('${s.id}')" class="p-1.5 rounded-lg admin-glass-btn text-xs mr-1" title="Editar">${svg('edit')}</button><button onclick="AdminL3Services.deleteService('${s.id}')" class="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs cursor-pointer" title="Archivar">${svg('trash')}</button></td>
      </tr>`;
    }).join('');

    container.innerHTML = `<div class="space-y-5">
      <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#D5CEC2] dark:border-stone-800">
        <div><h2 class="text-base font-bold text-stone-900 dark:text-stone-100 font-title flex items-center gap-2">${svg('tag')}<span>Catálogo de ${p.labels?.servicePlural || 'Servicios'}</span><span class="text-xs px-2 py-0.5 rounded-full bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-mono">${services.length} prestaciones</span></h2><p class="text-xs text-stone-500">Duración libre, trazabilidad de precios, pausa instantánea y visibilidad web.</p></div>
        <div class="flex items-center gap-2"><button onclick="AdminL3Services.openCategoryModal()" class="py-2 px-3 rounded-xl admin-glass-btn font-bold text-xs flex items-center gap-1.5">${svg('tag')}<span>Categorías</span></button><button onclick="AdminL3Services.openEditModal()" class="py-2 px-4 rounded-xl admin-glass-primary font-bold text-xs flex items-center gap-1.5">${svg('plus')}<span>Nuevo ${p.labels?.serviceSingular || 'Servicio'}</span></button></div>
      </div>
      <div class="flex flex-wrap gap-2 pt-1">${catPills}</div>
      <div class="admin-card !p-0 overflow-x-auto"><table class="w-full text-left"><thead class="bg-stone-50 dark:bg-stone-950/70 border-b border-[#D5CEC2] dark:border-stone-800 text-[11px] text-stone-500 uppercase font-semibold"><tr><th class="py-3 px-4">Prestación</th><th class="py-3 px-4">Duración</th><th class="py-3 px-4">Precio (ARS)</th><th class="py-3 px-4">Antelación</th><th class="py-3 px-4">Estado</th><th class="py-3 px-4 text-right">Acciones</th></tr></thead><tbody>${rows || '<tr><td colspan="6" class="p-8 text-center text-stone-400 italic">No hay servicios activos</td></tr>'}</tbody></table></div>
    </div>`;
  }

  function setCategory(cat) { selectedCategory = cat; window.AdminL3Core.renderActiveView(); }

  function toggleActive(srvId) {
    const state = window.AdminL3Core.state;
    state.services = state.services.map(s => {
      if (s.id !== srvId) return s;
      const nextAct = s.active === false || s.isActive === false;
      return { ...s, active: nextAct, isActive: nextAct };
    });
    window.AdminL3Core.setStorage(`tucu_l3_services_${state.rubro}`, state.services);
    window.AdminL3Core.renderActiveView();
  }

  function deleteService(srvId) {
    const state = window.AdminL3Core.state;
    const activeCount = (state.services || []).filter(s => !s.deletedAt).length;
    if (activeCount <= 1) return window.AdminL3Core.showToast('Conserva al menos un servicio activo', 'error');
    const now = new Date().toISOString();
    state.services = (state.services || []).map(s => s.id === srvId ? { ...s, deletedAt: now, active: false, isActive: false } : s);
    window.AdminL3Core.setStorage(`tucu_l3_services_${state.rubro}`, state.services);
    window.AdminL3Core.showToast('Servicio archivado en histórico');
    window.AdminL3Core.renderActiveView();
  }

  function onDurChange(v) { document.getElementById('sv-dur-custom-wrap')?.classList.toggle('hidden', v !== 'custom'); }

  function openEditModal(srvId = null) {
    const modal = document.getElementById('admin-modal-root'), svg = window.AdminL3Core.svg;
    if (!modal) return;
    const state = window.AdminL3Core.state, srv = srvId ? state.services.find(s => s.id === srvId && !s.deletedAt) : null;
    const categories = (state.categories || []).filter(c => !c.deletedAt);
    const catOptions = categories.map(c => `<option value="${c.name}" ${srv?.category === c.name ? 'selected' : ''}>${c.name}</option>`).join('');
    const durVal = srv?.duration || 30, isStd = STD_DUR.includes(String(durVal));
    modal.innerHTML = `<div class="w-full max-w-md bg-white dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-800 rounded-3xl p-6 space-y-3.5 shadow-2xl text-xs"><div class="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800"><h3 class="font-bold text-sm text-stone-900 dark:text-stone-100 font-title">${srv ? 'Editar Servicio' : 'Nuevo Servicio'}</h3><button onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="text-stone-400 cursor-pointer">${svg('close')}</button></div><div class="space-y-2.5"><div><label class="block text-stone-500 mb-1 font-semibold">Nombre Comercial:</label><input type="text" id="sv-name" value="${srv?.name || ''}" placeholder="Corte Clásico" class="w-full bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 outline-none"></div><div class="grid grid-cols-2 gap-2"><div><label class="block text-stone-500 mb-1 font-semibold">Categoría:</label><select id="sv-cat" class="w-full bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 outline-none">${catOptions || '<option value="General">General</option>'}</select></div><div><label class="block text-stone-500 mb-1 font-semibold">Código:</label><input type="text" id="sv-icon" maxlength="3" value="${srv?.icon || 'SR'}" class="w-full bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 outline-none"></div></div><div class="grid grid-cols-3 gap-2"><div><label class="block text-stone-500 mb-1 font-semibold">Precio ($):</label><input type="number" id="sv-price" min="1" value="${srv?.price || 12000}" class="w-full bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 font-mono outline-none"></div><div><label class="block text-stone-500 mb-1 font-semibold">Duración:</label><select id="sv-dur-sel" onchange="AdminL3Services.onDurChange(this.value)" class="w-full bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 outline-none">${STD_DUR.map(m => `<option value="${m}" ${isStd && String(durVal) === m ? 'selected' : ''}>${m} min</option>`).join('')}<option value="custom" ${!isStd ? 'selected' : ''}>Personalizada (min)</option></select></div><div><label class="block text-stone-500 mb-1 font-semibold">Antelación (h):</label><input type="number" id="sv-adv" value="${srv?.advanceHours || 2}" class="w-full bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 font-mono outline-none"></div></div><div id="sv-dur-custom-wrap" class="${isStd ? 'hidden' : ''}"><label class="block text-stone-500 mb-1 font-semibold">Duración Personalizada (5 a 480 min):</label><input type="number" id="sv-dur" min="5" max="480" step="5" value="${durVal}" class="w-full bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 font-mono outline-none"></div><div class="grid grid-cols-2 gap-2 pt-1"><label class="flex items-center gap-2 p-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 font-bold cursor-pointer"><input type="checkbox" id="sv-showprice" ${srv?.showPrice !== false ? 'checked' : ''} class="accent-[#800000]"><span>Ver Precio Web</span></label><label class="flex items-center gap-2 p-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 font-bold cursor-pointer"><input type="checkbox" id="sv-showdur" ${srv?.showDuration !== false ? 'checked' : ''} class="accent-[#800000]"><span>Ver Duración Web</span></label></div></div><div class="flex gap-2 pt-2 border-t border-stone-200 dark:border-stone-800"><button onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="w-1/3 py-2.5 rounded-xl admin-glass-btn font-bold">Cancelar</button><button onclick="AdminL3Services.saveService('${srvId || ''}')" class="w-2/3 py-2.5 rounded-xl admin-glass-primary font-bold">Guardar Servicio</button></div></div>`;
    modal.classList.remove('hidden');
  }

  function saveService(srvId) {
    const name = document.getElementById('sv-name')?.value?.trim(), category = document.getElementById('sv-cat')?.value || 'General';
    const icon = document.getElementById('sv-icon')?.value || (name || 'SR').slice(0, 2).toUpperCase();
    const price = parseInt(document.getElementById('sv-price')?.value, 10) || 0;
    const selDur = document.getElementById('sv-dur-sel')?.value;
    const duration = parseInt(selDur === 'custom' ? document.getElementById('sv-dur')?.value : selDur, 10);
    const advanceHours = parseFloat(document.getElementById('sv-adv')?.value) || 2;
    const showPrice = document.getElementById('sv-showprice')?.checked !== false, showDuration = document.getElementById('sv-showdur')?.checked !== false;
    if (!name || price <= 0 || isNaN(duration) || duration < 5 || duration > 480) return window.AdminL3Core.showToast('Verifica nombre, precio (>0) y duración (5-480 min)', 'error');
    const state = window.AdminL3Core.state;
    let services = state.services || [];
    if (srvId) {
      services = services.map(s => {
        if (s.id !== srvId) return s;
        const priceHistory = Array.isArray(s.priceHistory) ? [...s.priceHistory] : [];
        if (s.price !== price) priceHistory.push({ previousPrice: s.price, newPrice: price, changedAt: new Date().toISOString() });
        return { ...s, name, category, icon, price, duration, advanceHours, showPrice, showDuration, priceHistory };
      });
    } else {
      services.push({ id: 'srv-' + Math.random().toString(36).substring(2, 6), name, category, icon, price, duration, advanceHours, showPrice, showDuration, active: true, isActive: true, priceHistory: [] });
    }
    window.AdminL3Core.setStorage(`tucu_l3_services_${state.rubro}`, services); state.services = services;
    document.getElementById('admin-modal-root')?.classList.add('hidden');
    window.AdminL3Core.showToast(srvId ? 'Servicio actualizado' : 'Servicio creado'); window.AdminL3Core.renderActiveView();
  }

  function showPriceHistory(srvId) {
    const modal = document.getElementById('admin-modal-root'), svg = window.AdminL3Core.svg;
    const srv = (window.AdminL3Core.state.services || []).find(s => s.id === srvId);
    if (!modal || !srv) return;
    const hist = [...(srv.priceHistory || [])].reverse();
    modal.innerHTML = `<div class="w-full max-w-sm bg-white dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-800 rounded-3xl p-5 space-y-3 shadow-2xl text-xs"><div class="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800"><h3 class="font-bold font-title">Historial · ${srv.name}</h3><button onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="text-stone-400 cursor-pointer">${svg('close')}</button></div><div class="space-y-1.5 max-h-56 overflow-y-auto">${hist.map(h => `<div class="p-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 flex justify-between"><span>$${(h.previousPrice || 0).toLocaleString('es-AR')} &rarr; <strong>$${(h.newPrice || 0).toLocaleString('es-AR')}</strong></span><span class="font-mono text-stone-500">${String(h.changedAt).slice(0, 10)}</span></div>`).join('')}</div></div>`;
    modal.classList.remove('hidden');
  }

  function openCategoryModal() {
    const modal = document.getElementById('admin-modal-root'), svg = window.AdminL3Core.svg;
    if (!modal) return;
    const categories = (window.AdminL3Core.state.categories || []).filter(c => !c.deletedAt);
    const listHtml = categories.map(c => `<div class="flex items-center justify-between p-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 text-xs"><span class="font-bold">${c.name}</span><button onclick="AdminL3Services.deleteCategory('${c.id}')" class="text-rose-600 cursor-pointer">${svg('trash')}</button></div>`).join('');
    modal.innerHTML = `<div class="w-full max-w-sm bg-white dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-800 rounded-3xl p-5 space-y-3 shadow-2xl text-xs"><div class="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800"><h3 class="font-bold font-title">Administrar Categorías</h3><button onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="text-stone-400 cursor-pointer">${svg('close')}</button></div><div class="space-y-1.5 max-h-40 overflow-y-auto pr-1 hide-scrollbar">${listHtml}</div><div class="flex gap-2 pt-2 border-t border-stone-200 dark:border-stone-800"><input type="text" id="new-cat-name" placeholder="Nueva categoría..." class="flex-1 bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl px-2.5 py-1.5 outline-none"><button onclick="AdminL3Services.addCategory()" class="px-3 py-1.5 rounded-xl admin-glass-primary font-bold">Agregar</button></div></div>`;
    modal.classList.remove('hidden');
  }

  function addCategory() {
    const name = document.getElementById('new-cat-name')?.value?.trim(); if (!name) return;
    const state = window.AdminL3Core.state, categories = state.categories || [];
    categories.push({ id: 'cat-' + Math.random().toString(36).substring(2, 6), name });
    window.AdminL3Core.setStorage(`tucu_l3_categories_${state.rubro}`, categories); state.categories = categories; openCategoryModal();
  }

  function deleteCategory(catId) {
    const state = window.AdminL3Core.state, now = new Date().toISOString();
    state.categories = (state.categories || []).map(c => c.id === catId ? { ...c, deletedAt: now } : c);
    window.AdminL3Core.setStorage(`tucu_l3_categories_${state.rubro}`, state.categories); openCategoryModal();
  }

  return { render, setCategory, toggleActive, deleteService, openEditModal, saveService, onDurChange, showPriceHistory, openCategoryModal, addCategory, deleteCategory };
})();
