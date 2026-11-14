// Archivo: public/js/admin_l3/view_resources.js
// Gestión de Recursos Físicos & Espacios L3 Warm Studio v2 (< 95 líneas)

window.AdminL3Resources = (function () {
  function render(container, state) {
    const svg = window.AdminL3Core.svg, p = state.presets[state.rubro] || {};
    const resourceList = (state.resources || []).filter(r => !r.deletedAt), dayBookings = (state.bookings || []).filter(b => !b.deletedAt);
    const cards = resourceList.map(r => {
      const assignedBookings = dayBookings.filter(b => b.date === state.selectedDate && b.resourceId === r.id && b.status !== 'CANCELLED');
      const code = (r.icon && /^[A-Za-z0-9]{1,3}$/.test(r.icon)) ? r.icon : r.name.slice(0, 2).toUpperCase();
      return `
        <div class="admin-card flex flex-col justify-between space-y-3 hover:border-red-900/40 transition-all">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 flex items-center justify-center text-sm font-black text-red-900 dark:text-red-300 shadow-xs">${code}</div>
              <div><h4 class="font-bold text-sm text-stone-900 dark:text-stone-100">${r.name}</h4><p class="text-xs text-red-900 dark:text-red-400 font-medium">${r.type || 'Recurso Físico'}</p><p class="text-[10px] text-stone-500 font-mono">Espacio Operativo</p></div>
            </div>
            <button onclick="AdminL3Resources.toggleActive('${r.id}')" class="px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${r.active !== false ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' : 'bg-stone-100 text-stone-500 border-stone-200'}">
              <span class="w-1.5 h-1.5 rounded-full ${r.active !== false ? 'bg-emerald-600' : 'bg-stone-400'}"></span><span>${r.active !== false ? 'ACTIVO' : 'PAUSA'}</span>
            </button>
          </div>
          <div class="space-y-1 pt-2 border-t border-stone-100 dark:border-stone-800"><p class="text-[10px] uppercase font-bold text-stone-500">Ocupación Hoy:</p><p class="text-xs font-semibold text-stone-700 dark:text-stone-300"><strong>${assignedBookings.length}</strong> turnos programados en este espacio</p></div>
          <div class="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
            <button onclick="AdminL3Resources.openEditModal('${r.id}')" class="px-3 py-1.5 rounded-xl admin-glass-btn text-xs font-bold flex items-center gap-1.5">${svg('edit')}<span>Editar Recurso</span></button>
            <button onclick="AdminL3Resources.deleteResource('${r.id}')" class="p-1.5 text-stone-400 hover:text-rose-600 cursor-pointer" title="Eliminar">${svg('trash')}</button>
          </div>
        </div>`;
    }).join('');

    container.innerHTML = `
      <div class="space-y-5">
        <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#D5CEC2] dark:border-stone-800">
          <div><h2 class="text-base font-bold text-stone-900 dark:text-stone-100 font-title flex items-center gap-2">${svg('space')}<span>Modelado de ${p.labels?.resourcePlural || 'Recursos Físicos'}</span><span class="text-xs px-2 py-0.5 rounded-full bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-mono">${resourceList.length} registrados</span></h2><p class="text-xs text-stone-500">Gestión de espacios físicos (canchas, consultorios, boxes y sillones).</p></div>
          <button onclick="AdminL3Resources.openEditModal()" class="py-2 px-4 rounded-xl admin-glass-primary font-bold text-xs flex items-center gap-1.5">${svg('plus')}<span>Nuevo ${p.labels?.resourceSingular || 'Recurso'}</span></button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${cards}</div>
      </div>`;
  }

  function toggleActive(resId) {
    const state = window.AdminL3Core.state;
    state.resources = state.resources.map(r => r.id === resId ? { ...r, active: r.active === false } : r);
    window.AdminL3Core.setStorage(`tucu_l3_resources_${state.rubro}`, state.resources);
    window.AdminL3Core.renderActiveView();
  }

  function deleteResource(resId) {
    const state = window.AdminL3Core.state, now = new Date().toISOString();
    state.resources = (state.resources || []).map(r => r.id === resId ? { ...r, deletedAt: now, active: false } : r);
    window.AdminL3Core.setStorage(`tucu_l3_resources_${state.rubro}`, state.resources);
    window.AdminL3Core.showToast('Recurso archivado en histórico');
    window.AdminL3Core.renderActiveView();
  }

  function openEditModal(resId = null) {
    const modal = document.getElementById('admin-modal-root'), svg = window.AdminL3Core.svg;
    if (!modal) return;
    const state = window.AdminL3Core.state, res = resId ? state.resources.find(r => r.id === resId) : null;
    modal.innerHTML = `<div class="w-full max-w-md bg-white dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-800 rounded-3xl p-6 space-y-3.5 shadow-2xl text-xs"><div class="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800"><h3 class="font-bold text-sm text-stone-900 dark:text-stone-100 font-title">${res ? 'Editar Recurso Físico' : 'Alta de Recurso Físico'}</h3><button onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="text-stone-400 cursor-pointer">${svg('close')}</button></div><div class="space-y-2.5"><div><label class="block text-stone-600 dark:text-stone-400 mb-1 font-semibold">Nombre del Espacio / Recurso:</label><input type="text" id="rf-name" value="${res?.name || ''}" placeholder="Ej: Cancha Pádel Vidrio #1" class="w-full bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 outline-none"></div><div class="grid grid-cols-2 gap-2"><div><label class="block text-stone-600 dark:text-stone-400 mb-1 font-semibold">Tipo de Recurso:</label><input type="text" id="rf-type" value="${res?.type || 'Cancha'}" placeholder="Cancha / Consultorio / Sillón" class="w-full bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 outline-none"></div><div><label class="block text-stone-600 dark:text-stone-400 mb-1 font-semibold">Código:</label><input type="text" id="rf-icon" maxlength="3" value="${res?.icon || 'SP'}" class="w-full bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 outline-none"></div></div></div><div class="flex gap-2 pt-2 border-t border-stone-200 dark:border-stone-800"><button onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="w-1/3 py-2.5 rounded-xl admin-glass-btn font-bold">Cancelar</button><button onclick="AdminL3Resources.saveResource('${resId || ''}')" class="w-2/3 py-2.5 rounded-xl admin-glass-primary font-bold">Guardar Recurso</button></div></div>`;
    modal.classList.remove('hidden');
  }

  function saveResource(resId) {
    const name = document.getElementById('rf-name')?.value || 'Recurso Físico', type = document.getElementById('rf-type')?.value || 'Espacio', icon = document.getElementById('rf-icon')?.value || name.slice(0, 2).toUpperCase();
    const state = window.AdminL3Core.state;
    let resources = state.resources || [];
    if (resId) resources = resources.map(r => r.id === resId ? { ...r, name, type, icon } : r);
    else resources.push({ id: 'res-' + Math.random().toString(36).substring(2, 6), name, type, icon, active: true });
    window.AdminL3Core.setStorage(`tucu_l3_resources_${state.rubro}`, resources); state.resources = resources;
    document.getElementById('admin-modal-root')?.classList.add('hidden'); window.AdminL3Core.renderActiveView();
  }

  return { render, toggleActive, deleteResource, openEditModal, saveResource };
})();