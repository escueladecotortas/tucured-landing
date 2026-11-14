// Archivo: public/js/admin_l3/view_staff.js
// Gestión de Personal Humano & Disponibilidad L3 Warm Studio v2 (< 120 líneas)

window.AdminL3Staff = (function () {
  const DAYS = [{ key: '1', label: 'Lunes' }, { key: '2', label: 'Martes' }, { key: '3', label: 'Miércoles' }, { key: '4', label: 'Jueves' }, { key: '5', label: 'Viernes' }, { key: '6', label: 'Sábado' }, { key: '0', label: 'Domingo' }];

  function render(container, state) {
    const svg = window.AdminL3Core.svg, p = state.presets[state.rubro] || {};
    const staffList = (state.staff || []).filter(s => !s.deletedAt), servicesList = (state.services || []).filter(s => !s.deletedAt);
    const cards = staffList.map(s => {
      const assignedServices = servicesList.filter(srv => (s.serviceIds || []).includes(srv.id));
      const srvBadges = assignedServices.length > 0
        ? assignedServices.map(srv => `<span class="px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-[10px] font-semibold text-stone-700 dark:text-stone-300 border border-[#D5CEC2] dark:border-stone-700">${srv.name}</span>`).join(' ')
        : `<span class="text-stone-400 text-[10px] italic">Todos los servicios habilitados</span>`;
      const initials = (s.photo && /^[A-Za-z0-9]{1,3}$/.test(s.photo)) ? s.photo : s.name.slice(0, 2).toUpperCase();
      return `
        <div class="admin-card flex flex-col justify-between space-y-3 hover:border-red-900/40 transition-all">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 flex items-center justify-center text-sm font-black text-red-900 dark:text-red-300 shadow-xs">${initials}</div>
              <div><h4 class="font-bold text-sm text-stone-900 dark:text-stone-100">${s.name}</h4><p class="text-xs text-red-900 dark:text-red-400 font-medium">${s.role}</p><p class="text-[10px] text-stone-500 font-mono">${s.phone || 'Sin tel'} · ${s.email || 'Sin email'}</p></div>
            </div>
            <button onclick="AdminL3Staff.toggleActive('${s.id}')" class="px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${s.active !== false ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' : 'bg-stone-100 text-stone-500 border-stone-200'}">
              <span class="w-1.5 h-1.5 rounded-full ${s.active !== false ? 'bg-emerald-600' : 'bg-stone-400'}"></span><span>${s.active !== false ? 'ACTIVO' : 'PAUSA'}</span>
            </button>
          </div>
          <div class="space-y-1.5 pt-2 border-t border-stone-100 dark:border-stone-800"><p class="text-[10px] uppercase font-bold text-stone-500">Servicios Asignados:</p><div class="flex flex-wrap gap-1">${srvBadges}</div></div>
          <div class="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
            <button onclick="AdminL3Staff.openEditModal('${s.id}')" class="px-3 py-1.5 rounded-xl admin-glass-btn text-xs font-bold flex items-center gap-1.5">${svg('edit')}<span>Editar Horarios & Servicios</span></button>
            <button onclick="AdminL3Staff.deleteStaff('${s.id}')" class="p-1.5 text-stone-400 hover:text-rose-600 cursor-pointer" title="Eliminar">${svg('trash')}</button>
          </div>
        </div>`;
    }).join('');

    container.innerHTML = `
      <div class="space-y-5">
        <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#D5CEC2] dark:border-stone-800">
          <div><h2 class="text-base font-bold text-stone-900 dark:text-stone-100 font-title flex items-center gap-2">${svg('users')}<span>Directorio de ${p.labels?.staffPlural || 'Personal Humano'}</span><span class="text-xs px-2 py-0.5 rounded-full bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-mono">${staffList.length} activos</span></h2><p class="text-xs text-stone-500">Disponibilidad semanal y asignación individual de turnos por especialista.</p></div>
          <button onclick="AdminL3Staff.openEditModal()" class="py-2 px-4 rounded-xl admin-glass-primary font-bold text-xs flex items-center gap-1.5">${svg('plus')}<span>Nuevo ${p.labels?.staffSingular || 'Profesional'}</span></button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${cards}</div>
      </div>`;
  }

  function toggleActive(staffId) {
    const state = window.AdminL3Core.state;
    state.staff = state.staff.map(s => s.id === staffId ? { ...s, active: s.active === false } : s);
    window.AdminL3Core.setStorage(`tucu_l3_staff_${state.rubro}`, state.staff);
    window.AdminL3Core.renderActiveView();
  }

  function deleteStaff(staffId) {
    const state = window.AdminL3Core.state, now = new Date().toISOString();
    state.staff = (state.staff || []).map(s => s.id === staffId ? { ...s, deletedAt: now, active: false } : s);
    window.AdminL3Core.setStorage(`tucu_l3_staff_${state.rubro}`, state.staff);
    window.AdminL3Core.showToast('Profesional archivado en histórico');
    window.AdminL3Core.renderActiveView();
  }

  function openEditModal(staffId = null) {
    const modal = document.getElementById('admin-modal-root'), svg = window.AdminL3Core.svg;
    if (!modal) return;
    const state = window.AdminL3Core.state, staff = staffId ? state.staff.find(s => s.id === staffId) : null, srvs = state.services || [];
    const assignedIds = staff?.serviceIds || srvs.map(s => s.id);
    const hours = staff?.workingHours || { 1: { active: true, start: "09:00", end: "19:00" }, 2: { active: true, start: "09:00", end: "19:00" }, 3: { active: true, start: "09:00", end: "19:00" }, 4: { active: true, start: "09:00", end: "19:00" }, 5: { active: true, start: "09:00", end: "19:00" }, 6: { active: true, start: "09:00", end: "15:00" }, 0: { active: false, start: "09:00", end: "13:00" } };
    const srvCheckboxes = srvs.map(s => `<label class="flex items-center gap-2 p-1.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 text-xs font-bold text-stone-700 dark:text-stone-300 cursor-pointer"><input type="checkbox" name="staff_srv" value="${s.id}" ${assignedIds.includes(s.id)?'checked':''} class="accent-[#800000] w-3.5 h-3.5"><span>${s.name} ($${s.price||0})</span></label>`).join('');
    const daysRows = DAYS.map(d => {
      const cfg = hours[d.key] || { active: true, start: "09:00", end: "19:00" };
      return `<div class="flex items-center justify-between p-1.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 text-xs"><label class="flex items-center gap-1.5 font-bold text-stone-700 dark:text-stone-300 w-24"><input type="checkbox" id="dh-active-${d.key}" ${cfg.active?'checked':''} class="accent-[#800000]"><span>${d.label}</span></label><div class="flex items-center gap-1 font-mono"><input type="time" id="dh-start-${d.key}" value="${cfg.start||'09:00'}" class="bg-white dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-700 rounded px-1.5 py-0.5 text-[11px] outline-none"><span class="text-stone-400">-</span><input type="time" id="dh-end-${d.key}" value="${cfg.end||'19:00'}" class="bg-white dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-700 rounded px-1.5 py-0.5 text-[11px] outline-none"></div></div>`;
    }).join('');
    modal.innerHTML = `<div class="w-full max-w-2xl bg-white dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-800 rounded-3xl p-6 space-y-3.5 shadow-2xl max-h-[90vh] overflow-y-auto text-xs hide-scrollbar"><div class="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800"><h3 class="font-bold text-sm text-stone-900 dark:text-stone-100 font-title">${staff ? 'Editar Profesional' : 'Alta de Profesional'}</h3><button onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="text-stone-400 cursor-pointer">${svg('close')}</button></div><div class="grid grid-cols-1 md:grid-cols-2 gap-3.5"><div class="space-y-2.5"><div><label class="block text-stone-600 dark:text-stone-400 mb-1">Nombre Completo:</label><input type="text" id="sf-name" value="${staff?.name || ''}" placeholder="Dr. Lucas Ruiz" class="w-full bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 outline-none"></div><div class="grid grid-cols-2 gap-2"><div><label class="block text-stone-600 dark:text-stone-400 mb-1">Rol / Especialidad:</label><input type="text" id="sf-role" value="${staff?.role || ''}" placeholder="Especialista" class="w-full bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 outline-none"></div><div><label class="block text-stone-600 dark:text-stone-400 mb-1">Iniciales:</label><input type="text" id="sf-photo" maxlength="3" value="${staff?.photo || 'ST'}" class="w-full bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 outline-none"></div></div><div class="grid grid-cols-2 gap-2"><div><label class="block text-stone-600 dark:text-stone-400 mb-1">WhatsApp:</label><input type="tel" id="sf-phone" value="${staff?.phone || ''}" placeholder="3815123456" class="w-full bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 outline-none"></div><div><label class="block text-stone-600 dark:text-stone-400 mb-1">Email:</label><input type="email" id="sf-email" value="${staff?.email || ''}" placeholder="staff@nexus.ar" class="w-full bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 outline-none"></div></div><div><label class="block text-stone-600 dark:text-stone-400 mb-1 font-bold">Servicios Habilitados:</label><div class="space-y-1 max-h-32 overflow-y-auto pr-1 hide-scrollbar">${srvCheckboxes}</div></div></div><div class="space-y-1.5"><label class="block text-red-900 dark:text-red-400 mb-1 font-bold flex items-center gap-1.5">${svg('cal')}<span>Horarios Semanales (7 Días):</span></label><div class="space-y-1">${daysRows}</div></div></div><div class="flex gap-2 pt-2 border-t border-stone-200 dark:border-stone-800"><button onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="w-1/3 py-2.5 rounded-xl admin-glass-btn font-bold">Cancelar</button><button onclick="AdminL3Staff.saveStaff('${staffId || ''}')" class="w-2/3 py-2.5 rounded-xl admin-glass-primary font-bold">Guardar Profesional</button></div></div>`;
    modal.classList.remove('hidden');
  }

  function saveStaff(staffId) {
    const name = document.getElementById('sf-name')?.value || 'Profesional', role = document.getElementById('sf-role')?.value || 'Especialista';
    const photo = document.getElementById('sf-photo')?.value || name.slice(0, 2).toUpperCase(), phone = document.getElementById('sf-phone')?.value || '', email = document.getElementById('sf-email')?.value || '';
    const selectedSrvs = Array.from(document.querySelectorAll('input[name="staff_srv"]:checked')).map(el => el.value);
    const workingHours = {};
    DAYS.forEach(d => { workingHours[d.key] = { active: document.getElementById(`dh-active-${d.key}`)?.checked || false, start: document.getElementById(`dh-start-${d.key}`)?.value || '09:00', end: document.getElementById(`dh-end-${d.key}`)?.value || '19:00' }; });
    const state = window.AdminL3Core.state;
    let staff = state.staff || [];
    if (staffId) staff = staff.map(s => s.id === staffId ? { ...s, name, role, photo, phone, email, serviceIds: selectedSrvs, workingHours } : s);
    else staff.push({ id: 'st-' + Math.random().toString(36).substring(2, 6), name, role, photo, phone, email, active: true, serviceIds: selectedSrvs, workingHours });
    window.AdminL3Core.setStorage(`tucu_l3_staff_${state.rubro}`, staff); state.staff = staff;
    document.getElementById('admin-modal-root')?.classList.add('hidden'); window.AdminL3Core.renderActiveView();
  }

  return { render, toggleActive, deleteStaff, openEditModal, saveStaff };
})();