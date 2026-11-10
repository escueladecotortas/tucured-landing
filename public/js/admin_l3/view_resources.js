// Archivo: public/js/admin_l3/view_resources.js
/**
 * 🏟️ NEXUS ADMIN L3: GESTIÓN DE RECURSOS FÍSICOS & ESPACIOS (< 150 líneas)
 * - ABM de Canchas (Pádel/Fútbol), Consultorios Médicos, Boxes y Sillones
 * - Control de capacidad física para erradicar colisiones operativas
 * - Estándar visual Aura Light con tarjetas luminosas y bordes suaves
 */

window.AdminL3Resources = (function () {
  function render(container, state) {
    const p = state.presets[state.rubro] || {}, resourceList = state.resources || [], dayBookings = state.bookings || [];
    const cards = resourceList.map(r => {
      const assignedBookings = dayBookings.filter(b => b.date === state.selectedDate && b.resourceId === r.id && b.status !== 'CANCELLED');
      return `
        <div class="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3 shadow-xs hover:border-indigo-300 transition-all">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-xl shadow-xs">${r.icon || '🏟️'}</div>
              <div><h4 class="font-bold text-sm text-slate-900 dark:text-slate-100">${r.name}</h4><p class="text-xs text-indigo-600 dark:text-indigo-400 font-medium">${r.type || 'Recurso Físico'}</p><p class="text-[10px] text-slate-500 font-mono">Espacio Operativo</p></div>
            </div>
            <button onclick="AdminL3Resources.toggleActive('${r.id}')" class="px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all ${r.active !== false ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 text-slate-500 border-slate-200'}">
              ${r.active !== false ? '● ACTIVO' : '○ EN MANTENIMIENTO'}
            </button>
          </div>
          <div class="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
            <p class="text-[10px] uppercase font-bold text-slate-500">Ocupación Hoy:</p>
            <p class="text-xs font-semibold text-slate-700 dark:text-slate-300"><strong>${assignedBookings.length}</strong> turnos programados en este espacio</p>
          </div>
          <div class="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <button onclick="AdminL3Resources.openEditModal('${r.id}')" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-xs">✏️ Editar Recurso</button>
            <button onclick="AdminL3Resources.deleteResource('${r.id}')" class="p-1.5 text-slate-400 hover:text-rose-500 text-xs">🗑️</button>
          </div>
        </div>`;
    }).join('');

    container.innerHTML = `
      <div class="space-y-5">
        <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 class="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>🏟️ Modelado de ${p.labels?.resourcePlural || 'Recursos Físicos'}</span>
              <span class="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">${resourceList.length} registrados</span>
            </h2>
            <p class="text-xs text-slate-500">Gestión de espacios físicos (canchas, consultorios, boxes y sillones) para evitar colisiones operativas.</p>
          </div>
          <button onclick="AdminL3Resources.openEditModal()" class="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"><span>➕</span><span>Nuevo ${p.labels?.resourceSingular || 'Recurso Físico'}</span></button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${cards}</div>
      </div>`;
  }

  function toggleActive(resId) {
    const state = window.AdminL3Core.state;
    const resources = state.resources.map(r => r.id === resId ? { ...r, active: r.active === false ? true : false } : r);
    window.AdminL3Core.setStorage(`tucu_l3_resources_${state.rubro}`, resources);
    state.resources = resources;
    window.AdminL3Core.renderActiveView();
  }

  function deleteResource(resId) {
    if (!confirm('¿Eliminar este recurso físico?')) return;
    const state = window.AdminL3Core.state;
    const resources = state.resources.filter(r => r.id !== resId);
    window.AdminL3Core.setStorage(`tucu_l3_resources_${state.rubro}`, resources);
    state.resources = resources;
    window.AdminL3Core.renderActiveView();
  }

  function openEditModal(resId = null) {
    const modal = document.getElementById('admin-modal-root'); if (!modal) return;
    const state = window.AdminL3Core.state, res = resId ? state.resources.find(r => r.id === resId) : null;
    modal.innerHTML = `
      <div class="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3.5 shadow-2xl text-xs">
        <div class="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800"><h3 class="font-bold text-sm text-slate-900 dark:text-slate-100">${res ? '✏️ Editar Recurso Físico' : '➕ Alta de Recurso Físico'}</h3><button onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="text-slate-400">✕</button></div>
        <div class="space-y-2.5">
          <div><label class="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Nombre del Espacio / Recurso:</label><input type="text" id="rf-name" value="${res?.name || ''}" placeholder="Ej: Cancha Pádel Vidrio #1 / Consultorio 101" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-slate-800 dark:text-slate-200 outline-none"></div>
          <div class="grid grid-cols-2 gap-2">
            <div><label class="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Tipo de Recurso:</label><input type="text" id="rf-type" value="${res?.type || 'Cancha'}" placeholder="Cancha / Consultorio / Sillón" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-slate-800 dark:text-slate-200 outline-none"></div>
            <div><label class="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Ícono:</label><input type="text" id="rf-icon" value="${res?.icon || '🏟️'}" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-slate-800 dark:text-slate-200 outline-none"></div>
          </div>
        </div>
        <div class="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800"><button onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="w-1/3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">Cancelar</button><button onclick="AdminL3Resources.saveResource('${resId || ''}')" class="w-2/3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold">Guardar Recurso</button></div>
      </div>`;
    modal.classList.remove('hidden');
  }

  function saveResource(resId) {
    const name = document.getElementById('rf-name')?.value || 'Recurso Físico', type = document.getElementById('rf-type')?.value || 'Espacio', icon = document.getElementById('rf-icon')?.value || '🏟️';
    const state = window.AdminL3Core.state;
    let resources = state.resources || [];
    if (resId) resources = resources.map(r => r.id === resId ? { ...r, name, type, icon } : r);
    else resources.push({ id: 'res-' + Math.random().toString(36).substring(2, 6), name, type, icon, active: true });
    window.AdminL3Core.setStorage(`tucu_l3_resources_${state.rubro}`, resources);
    state.resources = resources;
    document.getElementById('admin-modal-root')?.classList.add('hidden');
    window.AdminL3Core.renderActiveView();
  }

  return { render, toggleActive, deleteResource, openEditModal, saveResource };
})();

