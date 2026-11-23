// Archivo: public/js/admin_l3/view_services.js
// Catálogo L3 Responsive en Tarjetas .tucu-card: Seña Individual, Orden, Duración Libre e Historial (< 170L)

window.AdminL3Services = (function () {
  let selectedCategory = 'ALL';
  const STD_DUR = ['15', '30', '45', '60', '90'];
  const sortList = (arr) => [...(arr || [])].sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99));

  function render(container, state) {
    const svg = window.AdminL3Core.svg, p = state.presets[state.rubro] || {};
    const services = sortList(state.services).filter(s => !s.deletedAt);
    const categories = (state.categories || []).filter(c => !c.deletedAt);
    const catPills = [
      `<button type="button" onclick="AdminL3Services.setCategory('ALL')" class="tucu-chip ${selectedCategory === 'ALL' ? 'is-active' : ''}">Todas</button>`,
      ...categories.map(c => `<button type="button" onclick="AdminL3Services.setCategory('${c.name}')" class="tucu-chip ${selectedCategory === c.name ? 'is-active' : ''}">${c.name}</button>`)
    ].join('');

    const filtered = selectedCategory === 'ALL' ? services : services.filter(s => s.category === selectedCategory);
    const cards = filtered.map((s, idx) => {
      const code = (s.icon && /^[A-Za-z0-9]{1,3}$/.test(s.icon)) ? s.icon : s.name.slice(0, 2).toUpperCase();
      const isAct = s.active !== false && s.isActive !== false, reqDep = s.requireDeposit !== false;
      const dep = window.AdminBookingEngine ? window.AdminBookingEngine.calcDeposit(s.price || 0, 'l3', reqDep) : (reqDep ? Math.round((s.price || 0) * 0.5) : 0);
      const depBadge = (reqDep && dep > 0) ? `<span class="tucu-primary-text font-semibold">Seña: $${dep.toLocaleString('es-AR')}</span>` : `<span class="tucu-badge bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">Sin seña</span>`;
      const hist = s.priceHistory || [], adjBtn = hist.length ? `<button type="button" onclick="AdminL3Services.showPriceHistory('${s.id}')" class="tucu-badge bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 cursor-pointer">Historial (${hist.length})</button>` : '';
      return `<div data-service-card="${s.id}" class="admin-card tucu-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${isAct ? '' : 'opacity-60'}">
        <div class="flex items-start gap-3 min-w-0 flex-1">
          <div class="flex flex-col items-center shrink-0 w-11"><span class="text-[9px] uppercase text-stone-400 font-bold mb-0.5">Orden</span><input type="number" min="1" value="${s.order || idx + 1}" title="Orden" onchange="AdminL3Services.updateOrder('${s.id}', this.value)" class="w-10 text-center text-xs bg-stone-100 dark:bg-stone-800 border border-[#D5CEC2] dark:border-stone-700 rounded-lg py-1 tabular-nums font-bold outline-none"></div>
          <div class="min-w-0 flex-1 space-y-1">
            <div class="flex items-center gap-1.5 flex-wrap"><span class="w-6 h-6 rounded-lg bg-stone-100 dark:bg-stone-800 border border-[#D5CEC2] dark:border-stone-700 inline-flex items-center justify-center text-[10px] font-black tucu-primary-text shrink-0">${code}</span><h4 class="text-sm font-bold text-stone-900 dark:text-stone-100 ${isAct ? '' : 'line-through'}">${s.name}</h4><span class="tucu-badge border ${isAct ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' : 'bg-stone-100 text-stone-500 border-stone-200'}">${isAct ? 'Activo' : 'Pausado'}</span><span class="tucu-badge tucu-primary-soft border">${s.category || 'General'}</span>${adjBtn}</div>
            ${s.description ? `<p class="text-xs text-stone-500 leading-relaxed">${s.description}</p>` : ''}
            <div class="flex items-center gap-x-2.5 gap-y-1 flex-wrap text-xs text-stone-600 dark:text-stone-300"><strong class="tabular-nums text-emerald-700 dark:text-emerald-400">$${(s.price || 0).toLocaleString('es-AR')}</strong><span class="tabular-nums">${s.duration || 30} min</span>${depBadge}<span class="tabular-nums text-stone-500 text-[11px]">${s.advanceHours || 2} hs previas</span></div>
          </div>
        </div>
        <div class="flex items-center gap-1.5 shrink-0 flex-wrap justify-end sm:self-center">
          <button type="button" onclick="AdminL3Services.toggleActive('${s.id}')" class="tucu-btn admin-glass-btn">${isAct ? 'Pausar' : 'Activar'}</button>
          <button type="button" onclick="AdminL3Services.openEditModal('${s.id}')" class="tucu-btn admin-glass-primary">${svg('edit')}<span>Editar</span></button>
          <button type="button" onclick="AdminL3Services.deleteService('${s.id}')" class="tucu-btn bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300" title="Archivar">${svg('trash')}</button>
        </div>
      </div>`;
    }).join('');

    container.innerHTML = `<div class="space-y-4">
      <div class="admin-card tucu-card flex flex-wrap items-center justify-between gap-3">
        <div class="min-w-0"><h2 class="text-base font-bold text-stone-900 dark:text-stone-100 font-title flex items-center gap-2 flex-wrap">${svg('tag')}<span>Catálogo de Servicios</span><span class="tucu-badge tabular-nums bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">${services.length} prestaciones</span></h2><p class="text-xs text-stone-500 mt-0.5">Seña individual, orden de catálogo, duración libre y trazabilidad de precios.</p></div>
        <div class="flex items-center gap-2 flex-wrap"><button type="button" onclick="AdminL3Services.openCategoryModal()" class="tucu-btn admin-glass-btn">${svg('tag')}<span>Categorías</span></button><button type="button" onclick="AdminL3Services.openEditModal()" class="tucu-btn admin-glass-primary">${svg('plus')}<span>Nuevo ${p.labels?.serviceSingular || 'Servicio'}</span></button></div>
      </div>
      <div class="tucu-quick-strip">${catPills}</div>
      <div id="l3-services-list" class="space-y-3">${cards || '<div class="admin-card tucu-card p-6 text-center text-xs text-stone-400 italic">No hay servicios activos en esta categoría</div>'}</div>
    </div>`;
  }

  function setCategory(cat) { selectedCategory = cat; window.AdminL3Core.renderActiveView(); }

  function updateOrder(srvId, newOrder) {
    const state = window.AdminL3Core.state, orderVal = Math.max(1, parseInt(newOrder, 10) || 1);
    state.services = sortList((state.services || []).map(s => s.id === srvId ? { ...s, order: orderVal } : s));
    window.AdminL3Core.setStorage(`tucu_l3_services_${state.rubro}`, state.services);
    window.AdminL3Core.showToast('Orden actualizado');
    window.AdminL3Core.renderActiveView();
  }

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

  async function deleteService(srvId) {
    const state = window.AdminL3Core.state;
    if ((state.services || []).filter(s => !s.deletedAt).length <= 1) return window.AdminL3Core.showToast('Conserva al menos un servicio activo', 'error');
    if (window.AdminShell?.confirmAsync) {
      const ok = await window.AdminShell.confirmAsync({ title: '¿Archivar servicio?', message: 'El servicio se ocultará del catálogo público manteniendo su historial previo.', confirmLabel: 'Sí, archivar' });
      if (!ok) return;
    }
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
    const state = window.AdminL3Core.state, activeSrvs = (state.services || []).filter(s => !s.deletedAt);
    const srv = srvId ? state.services.find(s => s.id === srvId && !s.deletedAt) : null;
    const categories = (state.categories || []).filter(c => !c.deletedAt);
    const catOptions = categories.map(c => `<option value="${c.name}" ${srv?.category === c.name ? 'selected' : ''}>${c.name}</option>`).join('');
    const durVal = srv?.duration || 30, isStd = STD_DUR.includes(String(durVal)), reqDep = srv ? srv.requireDeposit !== false : true;
    modal.innerHTML = `<div class="w-full max-w-md bg-white dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-800 rounded-3xl p-5 space-y-3 shadow-2xl text-xs max-h-[90vh] overflow-y-auto overflow-x-hidden"><div class="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800"><h3 class="font-bold text-sm text-stone-900 dark:text-stone-100 font-title">${srv ? 'Editar Servicio' : 'Nuevo Servicio'}</h3><button type="button" onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="text-stone-400 cursor-pointer">${svg('close')}</button></div><div class="space-y-2.5"><div class="grid grid-cols-4 gap-2"><div class="col-span-3"><label class="block text-stone-500 mb-1 font-semibold">Nombre Comercial:</label><input type="text" id="sv-name" value="${srv?.name || ''}" placeholder="Corte Clásico" class="tucu-input w-full"></div><div><label class="block text-stone-500 mb-1 font-semibold">Orden:</label><input type="number" id="sv-order" min="1" value="${srv?.order || (activeSrvs.length + 1)}" class="tucu-input w-full tabular-nums"></div></div><div><label class="block text-stone-500 mb-1 font-semibold">Descripción breve:</label><input type="text" id="sv-desc" value="${srv?.description || ''}" placeholder="Detalle visible en el turnero..." class="tucu-input w-full"></div><div class="grid grid-cols-2 gap-2"><div><label class="block text-stone-500 mb-1 font-semibold">Categoría:</label><select id="sv-cat" class="tucu-input w-full">${catOptions || '<option value="General">General</option>'}</select></div><div><label class="block text-stone-500 mb-1 font-semibold">Código:</label><input type="text" id="sv-icon" maxlength="3" value="${srv?.icon || 'SR'}" class="tucu-input w-full"></div></div><div class="grid grid-cols-1 sm:grid-cols-3 gap-2"><div><label class="block text-stone-500 mb-1 font-semibold">Precio ($):</label><input type="number" id="sv-price" min="1" value="${srv?.price || 12000}" class="tucu-input w-full tabular-nums"></div><div><label class="block text-stone-500 mb-1 font-semibold">Duración:</label><select id="sv-dur-sel" onchange="AdminL3Services.onDurChange(this.value)" class="tucu-input w-full">${STD_DUR.map(m => `<option value="${m}" ${isStd && String(durVal) === m ? 'selected' : ''}>${m} min</option>`).join('')}<option value="custom" ${!isStd ? 'selected' : ''}>Personalizada (min)</option></select></div><div><label class="block text-stone-500 mb-1 font-semibold">Antelación (h):</label><input type="number" id="sv-adv" value="${srv?.advanceHours || 2}" class="tucu-input w-full tabular-nums"></div></div><div id="sv-dur-custom-wrap" class="${isStd ? 'hidden' : ''}"><label class="block text-stone-500 mb-1 font-semibold">Duración Personalizada (5 a 480 min):</label><input type="number" id="sv-dur" min="5" max="480" step="5" value="${durVal}" class="tucu-input w-full tabular-nums"></div><label class="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 font-bold text-stone-800 dark:text-stone-200 cursor-pointer"><input type="checkbox" id="sv-require-deposit" ${reqDep ? 'checked' : ''} class="tucu-accent-input"><span>Exige seña web</span></label></div><div class="flex gap-2 pt-2 border-t border-stone-200 dark:border-stone-800"><button type="button" onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="tucu-btn w-1/3 admin-glass-btn">Cancelar</button><button type="button" onclick="AdminL3Services.saveService('${srvId || ''}')" class="tucu-btn w-2/3 admin-glass-primary">Guardar Servicio</button></div></div>`;
    modal.classList.remove('hidden');
  }

  function saveService(srvId) {
    const name = document.getElementById('sv-name')?.value?.trim(), category = document.getElementById('sv-cat')?.value || 'General';
    const order = Math.max(1, parseInt(document.getElementById('sv-order')?.value, 10) || 1);
    const description = document.getElementById('sv-desc')?.value?.trim() || 'Prestación profesional reservable online.';
    const icon = document.getElementById('sv-icon')?.value || (name || 'SR').slice(0, 2).toUpperCase();
    const price = parseInt(document.getElementById('sv-price')?.value, 10) || 0, selDur = document.getElementById('sv-dur-sel')?.value;
    const duration = parseInt(selDur === 'custom' ? document.getElementById('sv-dur')?.value : selDur, 10);
    const advanceHours = parseFloat(document.getElementById('sv-adv')?.value) || 2;
    const requireDeposit = document.getElementById('sv-require-deposit')?.checked !== false;
    if (!name || price <= 0 || isNaN(duration) || duration < 5 || duration > 480) return window.AdminL3Core.showToast('Verifica nombre, precio (>0) y duración (5-480 min)', 'error');
    const state = window.AdminL3Core.state;
    let services = state.services || [];
    if (srvId) {
      services = services.map(s => {
        if (s.id !== srvId) return s;
        const priceHistory = Array.isArray(s.priceHistory) ? [...s.priceHistory] : [];
        if (s.price !== price) priceHistory.push({ previousPrice: s.price, newPrice: price, changedAt: new Date().toISOString() });
        return { ...s, order, name, description, category, icon, price, duration, advanceHours, requireDeposit, priceHistory };
      });
    } else {
      services.push({ id: 'srv-' + Math.random().toString(36).substring(2, 6), order, name, description, category, icon, price, duration, advanceHours, requireDeposit, active: true, isActive: true, priceHistory: [] });
    }
    services = sortList(services);
    window.AdminL3Core.setStorage(`tucu_l3_services_${state.rubro}`, services); state.services = services;
    document.getElementById('admin-modal-root')?.classList.add('hidden');
    window.AdminL3Core.showToast(srvId ? 'Servicio actualizado' : 'Servicio creado'); window.AdminL3Core.renderActiveView();
  }

  function showPriceHistory(srvId) {
    const modal = document.getElementById('admin-modal-root'), svg = window.AdminL3Core.svg;
    const srv = (window.AdminL3Core.state.services || []).find(s => s.id === srvId);
    if (!modal || !srv) return;
    const hist = [...(srv.priceHistory || [])].reverse();
    modal.innerHTML = `<div class="w-full max-w-sm bg-white dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-800 rounded-3xl p-5 space-y-3 shadow-2xl text-xs"><div class="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800"><h3 class="font-bold font-title">Historial · ${srv.name}</h3><button type="button" onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="text-stone-400 cursor-pointer">${svg('close')}</button></div><div class="space-y-1.5 max-h-56 overflow-y-auto">${hist.map(h => `<div class="p-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 flex justify-between"><span>$${(h.previousPrice || 0).toLocaleString('es-AR')} &rarr; <strong>$${(h.newPrice || 0).toLocaleString('es-AR')}</strong></span><span class="tabular-nums text-stone-500">${String(h.changedAt).slice(0, 10)}</span></div>`).join('')}</div></div>`;
    modal.classList.remove('hidden');
  }

  function openCategoryModal() {
    const modal = document.getElementById('admin-modal-root'), svg = window.AdminL3Core.svg;
    if (!modal) return;
    const categories = (window.AdminL3Core.state.categories || []).filter(c => !c.deletedAt);
    const listHtml = categories.map(c => `<div class="flex items-center justify-between p-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 text-xs"><span class="font-bold">${c.name}</span><button type="button" onclick="AdminL3Services.deleteCategory('${c.id}')" class="text-rose-600 cursor-pointer">${svg('trash')}</button></div>`).join('');
    modal.innerHTML = `<div class="w-full max-w-sm bg-white dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-800 rounded-3xl p-5 space-y-3 shadow-2xl text-xs"><div class="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800"><h3 class="font-bold font-title">Administrar Categorías</h3><button type="button" onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="text-stone-400 cursor-pointer">${svg('close')}</button></div><div class="space-y-1.5 max-h-40 overflow-y-auto pr-1 hide-scrollbar">${listHtml}</div><div class="flex gap-2 pt-2 border-t border-stone-200 dark:border-stone-800"><input type="text" id="new-cat-name" placeholder="Nueva categoría..." class="tucu-input flex-1 min-w-0"><button type="button" onclick="AdminL3Services.addCategory()" class="tucu-btn admin-glass-primary shrink-0">Agregar</button></div></div>`;
    modal.classList.remove('hidden');
  }

  function addCategory() {
    const name = document.getElementById('new-cat-name')?.value?.trim(); if (!name) return;
    const state = window.AdminL3Core.state, categories = state.categories || [];
    categories.push({ id: 'cat-' + Math.random().toString(36).substring(2, 6), name });
    window.AdminL3Core.setStorage(`tucu_l3_categories_${state.rubro}`, categories); state.categories = categories; openCategoryModal();
  }

  async function deleteCategory(catId) {
    const state = window.AdminL3Core.state;
    if (window.AdminShell?.confirmAsync) {
      const ok = await window.AdminShell.confirmAsync({ title: '¿Archivar categoría?', message: 'La categoría se archivará en el historial sin afectar los servicios ya prestados.', confirmLabel: 'Sí, archivar' });
      if (!ok) return;
    }
    const now = new Date().toISOString();
    state.categories = (state.categories || []).map(c => c.id === catId ? { ...c, deletedAt: now } : c);
    window.AdminL3Core.setStorage(`tucu_l3_categories_${state.rubro}`, state.categories); openCategoryModal();
  }

  return { render, setCategory, updateOrder, toggleActive, deleteService, openEditModal, saveService, onDurChange, showPriceHistory, openCategoryModal, addCategory, deleteCategory };
})();
