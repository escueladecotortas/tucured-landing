// Archivo: public/js/admin_l3/view_staff.js
/**
 * 👥 NEXUS ADMIN L3: GESTIÓN DE PERSONAL & DISPONIBILIDAD INDIVIDUAL 7 DÍAS
 * - ABM de profesionales con asignación de servicios específicos
 * - Configuración por especialista de días laborables (Lunes a Domingo) e inicio/fin
 * - Persistencia soberana en tucu_l3_staff_${rubro}
 */

window.AdminL3Staff = (function () {
  const DAYS = [{ key: '1', label: 'Lunes' }, { key: '2', label: 'Martes' }, { key: '3', label: 'Miércoles' }, { key: '4', label: 'Jueves' }, { key: '5', label: 'Viernes' }, { key: '6', label: 'Sábado' }, { key: '0', label: 'Domingo' }];

  function render(container, state) {
    const p = state.presets[state.rubro] || {}, staffList = state.staff || [], servicesList = state.services || [];
    const cards = staffList.map(s => {
      const assignedServices = servicesList.filter(srv => (s.serviceIds || []).includes(srv.id));
      const srvBadges = assignedServices.length > 0
        ? assignedServices.map(srv => `<span class="px-2 py-0.5 rounded-lg bg-zinc-800 text-[10px] font-semibold text-zinc-300 border border-zinc-700/60">${srv.name}</span>`).join(' ')
        : `<span class="text-zinc-500 text-[10px] italic">Todos los servicios habilitados</span>`;

      return `
        <div class="p-4 rounded-3xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between space-y-3 shadow-lg hover:border-zinc-700 transition-all">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-xl">${s.photo || '👤'}</div>
              <div><h4 class="font-bold text-sm text-white">${s.name}</h4><p class="text-xs text-indigo-400 font-medium">${s.role}</p><p class="text-[10px] text-zinc-400 font-mono">${s.phone || 'Sin tel'} · ${s.email || 'Sin email'}</p></div>
            </div>
            <button onclick="AdminL3Staff.toggleActive('${s.id}')" class="px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all ${s.active !== false ? 'bg-emerald-950 text-emerald-300 border-emerald-600/40' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}">
              ${s.active !== false ? '● ACTIVO' : '○ PAUSA'}
            </button>
          </div>
          <div class="space-y-1.5 pt-2 border-t border-zinc-800/80"><p class="text-[10px] uppercase font-bold text-zinc-400">Servicios Asignados:</p><div class="flex flex-wrap gap-1">${srvBadges}</div></div>
          <div class="flex items-center justify-between pt-2 border-t border-zinc-800/80">
            <button onclick="AdminL3Staff.openEditModal('${s.id}')" class="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold">✏️ Editar Horarios & Servicios</button>
            <button onclick="AdminL3Staff.deleteStaff('${s.id}')" class="p-1.5 text-zinc-500 hover:text-rose-400 text-xs">🗑️</button>
          </div>
        </div>`;
    }).join('');

    container.innerHTML = `
      <div class="space-y-5">
        <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
          <div><h2 class="text-base font-bold text-white flex items-center gap-2"><span>👥 Directorio de ${p.labels?.staffPlural || 'Personal'}</span><span class="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">${staffList.length} activos</span></h2><p class="text-xs text-zinc-400">Disponibilidad semanal y especialidades individuales por staff.</p></div>
          <button onclick="AdminL3Staff.openEditModal()" class="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg"><span>➕</span><span>Nuevo ${p.labels?.staffSingular || 'Profesional'}</span></button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${cards}</div>
      </div>`;
  }

  function toggleActive(staffId) {
    const state = window.AdminL3Core.state;
    const staff = state.staff.map(s => s.id === staffId ? { ...s, active: s.active === false ? true : false } : s);
    window.AdminL3Core.setStorage(`tucu_l3_staff_${state.rubro}`, staff);
    state.staff = staff;
    window.AdminL3Core.renderActiveView();
  }

  function deleteStaff(staffId) {
    if (!confirm('¿Eliminar este profesional?')) return;
    const state = window.AdminL3Core.state;
    const staff = state.staff.filter(s => s.id !== staffId);
    window.AdminL3Core.setStorage(`tucu_l3_staff_${state.rubro}`, staff);
    state.staff = staff;
    window.AdminL3Core.renderActiveView();
  }

  function openEditModal(staffId = null) {
    const modal = document.getElementById('admin-modal-root');
    if (!modal) return;
    const state = window.AdminL3Core.state, staff = staffId ? state.staff.find(s => s.id === staffId) : null, srvs = state.services || [];
    const assignedIds = staff?.serviceIds || srvs.map(s => s.id);
    const hours = staff?.workingHours || { 1: { active: true, start: "09:00", end: "19:00" }, 2: { active: true, start: "09:00", end: "19:00" }, 3: { active: true, start: "09:00", end: "19:00" }, 4: { active: true, start: "09:00", end: "19:00" }, 5: { active: true, start: "09:00", end: "19:00" }, 6: { active: true, start: "09:00", end: "15:00" }, 0: { active: false, start: "09:00", end: "13:00" } };

    const srvCheckboxes = srvs.map(s => `
      <label class="flex items-center gap-2 p-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-bold text-zinc-300 cursor-pointer">
        <input type="checkbox" name="staff_srv" value="${s.id}" ${assignedIds.includes(s.id)?'checked':''} class="accent-indigo-500 w-3.5 h-3.5">
        <span>${s.name} ($${s.price||0})</span>
      </label>`).join('');

    const daysRows = DAYS.map(d => {
      const cfg = hours[d.key] || { active: true, start: "09:00", end: "19:00" };
      return `
        <div class="flex items-center justify-between p-1.5 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs">
          <label class="flex items-center gap-1.5 font-bold text-zinc-300 w-24"><input type="checkbox" id="dh-active-${d.key}" ${cfg.active?'checked':''} class="accent-indigo-500"><span>${d.label}</span></label>
          <div class="flex items-center gap-1 font-mono"><input type="time" id="dh-start-${d.key}" value="${cfg.start || '09:00'}" class="bg-zinc-900 border border-zinc-700 rounded px-1.5 py-0.5 text-[11px] text-zinc-200 outline-none"><span class="text-zinc-500">-</span><input type="time" id="dh-end-${d.key}" value="${cfg.end || '19:00'}" class="bg-zinc-900 border border-zinc-700 rounded px-1.5 py-0.5 text-[11px] text-zinc-200 outline-none"></div>
        </div>`;
    }).join('');

    modal.innerHTML = `
      <div class="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-3 shadow-2xl max-h-[90vh] overflow-y-auto text-xs hide-scrollbar">
        <div class="flex items-center justify-between pb-2 border-b border-zinc-800"><h3 class="font-bold text-sm text-white">${staff ? '✏️ Editar Profesional' : '➕ Alta de Profesional'}</h3><button onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="text-zinc-400 hover:text-white">✕</button></div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="space-y-2.5">
            <div><label class="block text-zinc-400 mb-1">Nombre:</label><input type="text" id="sf-name" value="${staff?.name || ''}" placeholder="Dr. Lucas Ruiz" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-200 outline-none"></div>
            <div class="grid grid-cols-2 gap-2"><div><label class="block text-zinc-400 mb-1">Rol:</label><input type="text" id="sf-role" value="${staff?.role || ''}" placeholder="Especialista" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-200 outline-none"></div><div><label class="block text-zinc-400 mb-1">Avatar:</label><input type="text" id="sf-photo" value="${staff?.photo || '👤'}" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-200 outline-none"></div></div>
            <div class="grid grid-cols-2 gap-2"><div><label class="block text-zinc-400 mb-1">Tel:</label><input type="tel" id="sf-phone" value="${staff?.phone || ''}" placeholder="3815123456" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-200 outline-none"></div><div><label class="block text-zinc-400 mb-1">Email:</label><input type="email" id="sf-email" value="${staff?.email || ''}" placeholder="staff@nexus.ar" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-200 outline-none"></div></div>
            <div><label class="block text-zinc-400 mb-1 font-bold">Servicios Habilitados:</label><div class="space-y-1 max-h-32 overflow-y-auto pr-1 hide-scrollbar">${srvCheckboxes}</div></div>
          </div>
          <div class="space-y-1.5"><label class="block text-indigo-400 mb-1 font-bold">📅 Horarios Semanales (7 Días):</label><div class="space-y-1">${daysRows}</div></div>
        </div>
        <div class="flex gap-2 pt-2 border-t border-zinc-800"><button onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="w-1/3 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-bold">Cancelar</button><button onclick="AdminL3Staff.saveStaff('${staffId || ''}')" class="w-2/3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold">Guardar Profesional</button></div>
      </div>`;
    modal.classList.remove('hidden');
  }

  function saveStaff(staffId) {
    const name = document.getElementById('sf-name')?.value || 'Profesional', role = document.getElementById('sf-role')?.value || 'Especialista';
    const photo = document.getElementById('sf-photo')?.value || '👤', phone = document.getElementById('sf-phone')?.value || '', email = document.getElementById('sf-email')?.value || '';
    const selectedSrvs = Array.from(document.querySelectorAll('input[name="staff_srv"]:checked')).map(el => el.value);

    const workingHours = {};
    DAYS.forEach(d => {
      workingHours[d.key] = { active: document.getElementById(`dh-active-${d.key}`)?.checked || false, start: document.getElementById(`dh-start-${d.key}`)?.value || '09:00', end: document.getElementById(`dh-end-${d.key}`)?.value || '19:00' };
    });

    const state = window.AdminL3Core.state;
    let staff = state.staff || [];
    if (staffId) staff = staff.map(s => s.id === staffId ? { ...s, name, role, photo, phone, email, serviceIds: selectedSrvs, workingHours } : s);
    else staff.push({ id: 'st-' + Math.random().toString(36).substring(2, 6), name, role, photo, phone, email, active: true, serviceIds: selectedSrvs, workingHours });

    window.AdminL3Core.setStorage(`tucu_l3_staff_${state.rubro}`, staff);
    state.staff = staff;
    document.getElementById('admin-modal-root')?.classList.add('hidden');
    window.AdminL3Core.renderActiveView();
  }

  return { render, toggleActive, deleteStaff, openEditModal, saveStaff };
})();
