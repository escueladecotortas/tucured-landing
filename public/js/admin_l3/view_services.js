// Archivo: public/js/admin_l3/view_services.js
/**
 * ✂️ NEXUS ADMIN L3: CATÁLOGO DE SERVICIOS & CATEGORÍAS
 * - ABM de prestaciones, precios, duración y antelación mínima requerida (advanceHours)
 * - Agrupación por categorías y flags de visibilidad web (showPrice, showDuration)
 * - Persistencia soberana en tucu_l3_services_${rubro} y tucu_l3_categories_${rubro}
 */

window.AdminL3Services = (function () {
  let selectedCategory = 'ALL';

  function render(container, state) {
    const p = state.presets[state.rubro] || {}, services = state.services || [], categories = state.categories || [];
    const catPills = [
      `<button onclick="AdminL3Services.setCategory('ALL')" class="px-3 py-1 rounded-xl text-xs font-bold transition-all ${selectedCategory==='ALL'?'bg-indigo-600 text-white shadow-sm':'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'}">Todas</button>`,
      ...categories.map(c => `<button onclick="AdminL3Services.setCategory('${c.name}')" class="px-3 py-1 rounded-xl text-xs font-bold transition-all ${selectedCategory===c.name?'bg-indigo-600 text-white shadow-sm':'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'}">${c.icon || '🏷️'} ${c.name}</button>`)
    ].join(' ');

    const filtered = selectedCategory === 'ALL' ? services : services.filter(s => s.category === selectedCategory);
    const rows = filtered.map(s => `
      <tr class="border-b border-zinc-800/60 hover:bg-zinc-900/40 text-xs">
        <td class="py-3 px-4 font-bold text-zinc-100 flex items-center gap-2.5">
          <span class="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center text-sm">${s.icon || '✂️'}</span>
          <div><p class="font-bold text-white text-xs">${s.name}</p><span class="text-[10px] text-indigo-400 font-semibold uppercase">${s.category || 'General'}</span></div>
        </td>
        <td class="py-3 px-4 font-mono text-zinc-300 font-semibold">${s.duration || 30} min</td>
        <td class="py-3 px-4 font-bold text-emerald-400">$${(s.price || 0).toLocaleString('es-AR')}</td>
        <td class="py-3 px-4 font-mono text-zinc-400 text-[11px]">${s.advanceHours || 2} hs previas</td>
        <td class="py-3 px-4">
          <div class="flex items-center gap-1.5">
            <span class="px-1.5 py-0.5 rounded text-[9px] font-bold ${s.showPrice !== false ? 'bg-emerald-950 text-emerald-300' : 'bg-zinc-800 text-zinc-500'}">Precio ${s.showPrice !== false ? '✓' : '✗'}</span>
            <span class="px-1.5 py-0.5 rounded text-[9px] font-bold ${s.showDuration !== false ? 'bg-emerald-950 text-emerald-300' : 'bg-zinc-800 text-zinc-500'}">Duración ${s.showDuration !== false ? '✓' : '✗'}</span>
          </div>
        </td>
        <td class="py-3 px-4 text-right">
          <button onclick="AdminL3Services.openEditModal('${s.id}')" class="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold mr-1">✏️</button>
          <button onclick="AdminL3Services.deleteService('${s.id}')" class="px-2 py-1 rounded bg-zinc-900 hover:bg-rose-950 text-zinc-400 hover:text-rose-300 text-xs font-bold">🗑️</button>
        </td>
      </tr>`).join('');

    container.innerHTML = `
      <div class="space-y-5">
        <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
          <div><h2 class="text-base font-bold text-white flex items-center gap-2"><span>✂️ Catálogo de ${p.labels?.servicePlural || 'Servicios'}</span><span class="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">${services.length} prestaciones</span></h2><p class="text-xs text-zinc-400">Duración, precios, horas de anticipación mínima y visibilidad web.</p></div>
          <div class="flex items-center gap-2">
            <button onclick="AdminL3Services.openCategoryModal()" class="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs">🏷️ Categorías</button>
            <button onclick="AdminL3Services.openEditModal()" class="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg"><span>➕</span><span>Nuevo ${p.labels?.serviceSingular || 'Servicio'}</span></button>
          </div>
        </div>
        <div class="flex flex-wrap gap-2 pt-1">${catPills}</div>
        <div class="bg-zinc-900/60 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
          <table class="w-full text-left"><thead class="bg-zinc-950/70 border-b border-zinc-800 text-[11px] text-zinc-400 uppercase font-semibold"><tr><th class="py-3 px-4">Prestación</th><th class="py-3 px-4">Duración</th><th class="py-3 px-4">Precio (ARS)</th><th class="py-3 px-4">Antelación Mín.</th><th class="py-3 px-4">Visibilidad Web</th><th class="py-3 px-4 text-right">Acciones</th></tr></thead><tbody>${rows.length > 0 ? rows : `<tr><td colspan="6" class="p-8 text-center text-zinc-500 italic">No hay servicios</td></tr>`}</tbody></table>
        </div>
      </div>`;
  }

  function setCategory(cat) { selectedCategory = cat; window.AdminL3Core.renderActiveView(); }

  function deleteService(srvId) {
    if (!confirm('¿Eliminar esta prestación?')) return;
    const state = window.AdminL3Core.state;
    const services = state.services.filter(s => s.id !== srvId);
    window.AdminL3Core.setStorage(`tucu_l3_services_${state.rubro}`, services);
    state.services = services;
    window.AdminL3Core.renderActiveView();
  }

  function openEditModal(srvId = null) {
    const modal = document.getElementById('admin-modal-root');
    if (!modal) return;
    const state = window.AdminL3Core.state, srv = srvId ? state.services.find(s => s.id === srvId) : null, categories = state.categories || [];
    const catOptions = categories.map(c => `<option value="${c.name}" ${srv?.category===c.name?'selected':''}>${c.name}</option>`).join('');

    modal.innerHTML = `
      <div class="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-3 shadow-2xl text-xs">
        <div class="flex items-center justify-between pb-2 border-b border-zinc-800"><h3 class="font-bold text-sm text-white">${srv ? '✏️ Editar Servicio' : '➕ Nuevo Servicio'}</h3><button onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="text-zinc-400 hover:text-white">✕</button></div>
        <div class="space-y-2.5">
          <div><label class="block text-zinc-400 mb-1">Nombre Comercial:</label><input type="text" id="sv-name" value="${srv?.name || ''}" placeholder="Corte Clásico" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-200 outline-none"></div>
          <div class="grid grid-cols-2 gap-2">
            <div><label class="block text-zinc-400 mb-1">Categoría:</label><select id="sv-cat" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-200 outline-none">${catOptions || '<option value="General">General</option>'}</select></div>
            <div><label class="block text-zinc-400 mb-1">Icono:</label><input type="text" id="sv-icon" value="${srv?.icon || '✂️'}" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-200 outline-none"></div>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <div><label class="block text-zinc-400 mb-1">Precio ($):</label><input type="number" id="sv-price" value="${srv?.price || 12000}" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-200 font-mono outline-none"></div>
            <div><label class="block text-zinc-400 mb-1">Duración (m):</label><input type="number" id="sv-dur" value="${srv?.duration || 30}" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-200 font-mono outline-none"></div>
            <div><label class="block text-zinc-400 mb-1">Antelación (h):</label><input type="number" id="sv-adv" value="${srv?.advanceHours || 2}" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-200 font-mono outline-none"></div>
          </div>
          <div class="grid grid-cols-2 gap-2 pt-1">
            <label class="flex items-center gap-2 p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 font-bold cursor-pointer"><input type="checkbox" id="sv-showprice" ${srv?.showPrice !== false ? 'checked' : ''} class="accent-indigo-500"><span>Ver Precio Web</span></label>
            <label class="flex items-center gap-2 p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 font-bold cursor-pointer"><input type="checkbox" id="sv-showdur" ${srv?.showDuration !== false ? 'checked' : ''} class="accent-indigo-500"><span>Ver Duración Web</span></label>
          </div>
        </div>
        <div class="flex gap-2 pt-2 border-t border-zinc-800"><button onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="w-1/3 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-bold">Cancelar</button><button onclick="AdminL3Services.saveService('${srvId || ''}')" class="w-2/3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold">Guardar Servicio</button></div>
      </div>`;
    modal.classList.remove('hidden');
  }

  function saveService(srvId) {
    const name = document.getElementById('sv-name')?.value || 'Servicio', category = document.getElementById('sv-cat')?.value || 'General';
    const icon = document.getElementById('sv-icon')?.value || '✂️', price = parseInt(document.getElementById('sv-price')?.value) || 0;
    const duration = parseInt(document.getElementById('sv-dur')?.value) || 30, advanceHours = parseFloat(document.getElementById('sv-adv')?.value) || 2;
    const showPrice = document.getElementById('sv-showprice')?.checked !== false, showDuration = document.getElementById('sv-showdur')?.checked !== false;

    const state = window.AdminL3Core.state;
    let services = state.services || [];
    if (srvId) services = services.map(s => s.id === srvId ? { ...s, name, category, icon, price, duration, advanceHours, showPrice, showDuration } : s);
    else services.push({ id: 'srv-' + Math.random().toString(36).substring(2, 6), name, category, icon, price, duration, advanceHours, showPrice, showDuration });

    window.AdminL3Core.setStorage(`tucu_l3_services_${state.rubro}`, services);
    state.services = services;
    document.getElementById('admin-modal-root')?.classList.add('hidden');
    window.AdminL3Core.renderActiveView();
  }

  function openCategoryModal() {
    const modal = document.getElementById('admin-modal-root');
    if (!modal) return;
    const state = window.AdminL3Core.state, categories = state.categories || [];
    const listHtml = categories.map(c => `
      <div class="flex items-center justify-between p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs">
        <span class="font-bold text-zinc-200">${c.icon || '🏷️'} ${c.name}</span>
        <button onclick="AdminL3Services.deleteCategory('${c.id}')" class="text-rose-400 hover:text-rose-300">🗑️</button>
      </div>`).join('');

    modal.innerHTML = `
      <div class="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-3 shadow-2xl text-xs">
        <div class="flex items-center justify-between pb-2 border-b border-zinc-800"><h3 class="font-bold text-white">🏷️ Administrar Categorías</h3><button onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="text-zinc-400 hover:text-white">✕</button></div>
        <div class="space-y-1.5 max-h-40 overflow-y-auto pr-1 hide-scrollbar">${listHtml}</div>
        <div class="flex gap-2 pt-2 border-t border-zinc-800">
          <input type="text" id="new-cat-name" placeholder="Nueva categoría..." class="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-zinc-200 outline-none">
          <button onclick="AdminL3Services.addCategory()" class="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold">Agregar</button>
        </div>
      </div>`;
    modal.classList.remove('hidden');
  }

  function addCategory() {
    const name = document.getElementById('new-cat-name')?.value?.trim();
    if (!name) return;
    const state = window.AdminL3Core.state, categories = state.categories || [];
    categories.push({ id: 'cat-' + Math.random().toString(36).substring(2, 6), name, icon: '🏷️' });
    window.AdminL3Core.setStorage(`tucu_l3_categories_${state.rubro}`, categories);
    state.categories = categories;
    openCategoryModal();
  }

  function deleteCategory(catId) {
    const state = window.AdminL3Core.state;
    state.categories = (state.categories || []).filter(c => c.id !== catId);
    window.AdminL3Core.setStorage(`tucu_l3_categories_${state.rubro}`, state.categories);
    openCategoryModal();
  }

  return { render, setCategory, deleteService, openEditModal, saveService, openCategoryModal, addCategory, deleteCategory };
})();
