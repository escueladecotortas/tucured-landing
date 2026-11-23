// Archivo: public/js/admin_l3/view_staff.js
// Gestión de Personal, Horario Partido Responsive sin Solapamientos & Clonado Semanal L3 (< 145L)

window.AdminL3Staff = (function () {
  const DAYS = [{ key: '1', label: 'Lunes' }, { key: '2', label: 'Martes' }, { key: '3', label: 'Miércoles' }, { key: '4', label: 'Jueves' }, { key: '5', label: 'Viernes' }, { key: '6', label: 'Sábado' }, { key: '0', label: 'Domingo' }];
  const defHours = () => ({
    1: { active: true, start: '09:00', end: '19:00', isSplit: false, open2: '16:00', close2: '20:30' },
    2: { active: true, start: '09:00', end: '19:00', isSplit: false, open2: '16:00', close2: '20:30' },
    3: { active: true, start: '09:00', end: '19:00', isSplit: false, open2: '16:00', close2: '20:30' },
    4: { active: true, start: '09:00', end: '19:00', isSplit: false, open2: '16:00', close2: '20:30' },
    5: { active: true, start: '09:00', end: '19:00', isSplit: false, open2: '16:00', close2: '20:30' },
    6: { active: true, start: '09:00', end: '15:00', isSplit: false, open2: '16:00', close2: '20:00' },
    0: { active: false, start: '09:00', end: '13:00', isSplit: false, open2: '16:00', close2: '20:00' }
  });

  function render(container, state) {
    const svg = window.AdminL3Core.svg;
    const staffList = (state.staff || []).filter(s => !s.deletedAt), servicesList = (state.services || []).filter(s => !s.deletedAt);
    const cards = staffList.map(s => {
      const assignedServices = servicesList.filter(srv => (s.serviceIds || []).includes(srv.id));
      const srvBadges = assignedServices.length > 0
        ? assignedServices.map(srv => `<span class="px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-[10px] font-semibold text-stone-700 dark:text-stone-300 border border-[#D5CEC2] dark:border-stone-700">${srv.name}</span>`).join(' ')
        : '<span class="text-stone-400 text-[10px] italic">Todos los servicios habilitados</span>';
      const hasSplit = Object.values(s.workingHours || {}).some(h => h && h.active && h.isSplit);
      const splitBadge = hasSplit ? '<span class="tucu-badge bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">Turno partido</span>' : '';
      const initials = (s.photo && /^[A-Za-z0-9]{1,3}$/.test(s.photo)) ? s.photo : s.name.slice(0, 2).toUpperCase();
      return `<div class="admin-card tucu-card flex flex-col justify-between space-y-3 transition-all">
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-11 h-11 rounded-2xl tucu-primary-soft border flex items-center justify-center text-sm font-black shadow-xs shrink-0">${initials}</div>
            <div class="min-w-0"><h4 class="font-bold text-sm text-stone-900 dark:text-stone-100 truncate">${s.name}</h4><p class="text-xs tucu-primary-text font-medium truncate">${s.role}</p><p class="text-[10px] text-stone-500 tabular-nums truncate">${s.phone || 'Sin tel'} · ${s.email || 'Sin email'}</p></div>
          </div>
          <button type="button" onclick="AdminL3Staff.toggleActive('${s.id}')" class="tucu-badge border cursor-pointer shrink-0 ${s.active !== false ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' : 'bg-stone-100 text-stone-500 border-stone-200'}"><span class="w-1.5 h-1.5 rounded-full ${s.active !== false ? 'bg-emerald-600' : 'bg-stone-400'}"></span><span>${s.active !== false ? 'ACTIVO' : 'PAUSA'}</span></button>
        </div>
        <div class="space-y-1.5 pt-2 border-t border-stone-100 dark:border-stone-800"><div class="flex items-center justify-between gap-2"><p class="text-[10px] uppercase font-bold text-stone-500">Servicios Asignados:</p>${splitBadge}</div><div class="flex flex-wrap gap-1">${srvBadges}</div></div>
        <div class="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 gap-2"><button type="button" onclick="AdminL3Staff.openEditModal('${s.id}')" class="tucu-btn admin-glass-btn">${svg('edit')}<span>Editar Horarios & Servicios</span></button><button type="button" onclick="AdminL3Staff.deleteStaff('${s.id}')" class="p-1.5 text-stone-400 hover:text-rose-600 cursor-pointer shrink-0" title="Eliminar">${svg('trash')}</button></div>
      </div>`;
    }).join('');

    container.innerHTML = `<div class="space-y-4">
      <div class="admin-card tucu-card flex flex-wrap items-center justify-between gap-3">
        <div class="min-w-0"><h2 class="text-base font-bold text-stone-900 dark:text-stone-100 font-title flex items-center gap-2 flex-wrap">${svg('users')}<span>Directorio de Personal</span><span class="tucu-badge tabular-nums bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">${staffList.length} activos</span></h2><p class="text-xs text-stone-500 mt-0.5">Disponibilidad semanal con turno partido, clonación rápida y servicios asignados.</p></div>
        <button type="button" onclick="AdminL3Staff.openEditModal()" class="tucu-btn admin-glass-primary">${svg('plus')}<span>Nuevo Integrante</span></button>
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

  async function deleteStaff(staffId) {
    const state = window.AdminL3Core.state;
    if (window.AdminShell?.confirmAsync) {
      const ok = await window.AdminShell.confirmAsync({ title: '¿Archivar integrante?', message: 'Dejará de aparecer para nuevos turnos web preservando sus citas previas.', confirmLabel: 'Sí, archivar' });
      if (!ok) return;
    }
    const now = new Date().toISOString();
    state.staff = (state.staff || []).map(s => s.id === staffId ? { ...s, deletedAt: now, active: false } : s);
    window.AdminL3Core.setStorage(`tucu_l3_staff_${state.rubro}`, state.staff);
    window.AdminL3Core.showToast('Integrante archivado en histórico');
    window.AdminL3Core.renderActiveView();
  }

  function toggleDaySplit(dayKey, isSplit) {
    document.getElementById(`dh-split-wrap-${dayKey}`)?.classList.toggle('hidden', !isSplit);
    const lbl = document.getElementById(`dh-lbl1-${dayKey}`);
    if (lbl) lbl.textContent = isSplit ? 'Mañana' : 'Horario';
  }

  function cloneLunVie() {
    const g = (id) => document.getElementById(id);
    const active = !!g('dh-active-1')?.checked, start = g('dh-start-1')?.value || '09:00', end = g('dh-end-1')?.value || '13:00';
    const isSplit = !!g('dh-split-1')?.checked, open2 = g('dh-open2-1')?.value || '16:00', close2 = g('dh-close2-1')?.value || '20:30';
    ['2', '3', '4', '5'].forEach(k => {
      if (g(`dh-active-${k}`)) g(`dh-active-${k}`).checked = active;
      if (g(`dh-start-${k}`)) g(`dh-start-${k}`).value = start;
      if (g(`dh-end-${k}`)) g(`dh-end-${k}`).value = end;
      if (g(`dh-split-${k}`)) g(`dh-split-${k}`).checked = isSplit;
      if (g(`dh-open2-${k}`)) g(`dh-open2-${k}`).value = open2;
      if (g(`dh-close2-${k}`)) g(`dh-close2-${k}`).value = close2;
      toggleDaySplit(k, isSplit);
    });
    window.AdminL3Core.showToast('Horario de Lunes clonado a Lun-Vie');
  }

  function openEditModal(staffId = null) {
    const modal = document.getElementById('admin-modal-root'), svg = window.AdminL3Core.svg;
    if (!modal) return;
    const state = window.AdminL3Core.state, staff = staffId ? state.staff.find(s => s.id === staffId) : null, srvs = (state.services || []).filter(s => !s.deletedAt);
    const assignedIds = staff?.serviceIds || srvs.map(s => s.id), hours = staff?.workingHours || defHours();
    const srvCheckboxes = srvs.map(s => `<label class="flex items-center gap-2 p-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 text-xs font-bold text-stone-700 dark:text-stone-300 cursor-pointer"><input type="checkbox" name="staff_srv" value="${s.id}" ${assignedIds.includes(s.id) ? 'checked' : ''} class="tucu-accent-input w-3.5 h-3.5"><span>${s.name} ($${s.price || 0})</span></label>`).join('');
    const daysRows = DAYS.map(d => {
      const cfg = hours[d.key] || { active: true, start: '09:00', end: '19:00', isSplit: false, open2: '16:00', close2: '20:30' };
      return `<div data-staff-day="${d.key}" class="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 text-xs space-y-2 min-w-0">
        <div class="flex items-center justify-between gap-2">
          <label class="flex items-center gap-1.5 font-bold text-stone-700 dark:text-stone-300 cursor-pointer"><input type="checkbox" id="dh-active-${d.key}" ${cfg.active ? 'checked' : ''} class="tucu-accent-input"><span>${d.label}</span></label>
          <label class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[10px] font-bold text-amber-800 dark:text-amber-300 cursor-pointer shrink-0"><input type="checkbox" id="dh-split-${d.key}" onchange="AdminL3Staff.toggleDaySplit('${d.key}', this.checked)" ${cfg.isSplit ? 'checked' : ''} class="tucu-accent-input"><span>2do T.</span></label>
        </div>
        <div class="grid grid-cols-[50px_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1.5 tabular-nums">
          <span id="dh-lbl1-${d.key}" class="font-sans text-[10px] font-semibold text-stone-500 truncate">${cfg.isSplit ? 'Mañana' : 'Horario'}</span>
          <input type="time" id="dh-start-${d.key}" value="${cfg.start || '09:00'}" class="w-full min-w-0 bg-white dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-700 rounded-lg px-1.5 py-1 text-xs outline-none">
          <span class="text-stone-400 text-center">-</span>
          <input type="time" id="dh-end-${d.key}" value="${cfg.end || '19:00'}" class="w-full min-w-0 bg-white dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-700 rounded-lg px-1.5 py-1 text-xs outline-none">
        </div>
        <div id="dh-split-wrap-${d.key}" class="${cfg.isSplit ? '' : 'hidden'} grid grid-cols-[50px_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1.5 tabular-nums">
          <span class="font-sans text-[10px] font-semibold text-stone-500 truncate">Tarde</span>
          <input type="time" id="dh-open2-${d.key}" value="${cfg.open2 || '16:00'}" class="w-full min-w-0 bg-white dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-700 rounded-lg px-1.5 py-1 text-xs outline-none">
          <span class="text-stone-400 text-center">-</span>
          <input type="time" id="dh-close2-${d.key}" value="${cfg.close2 || '20:30'}" class="w-full min-w-0 bg-white dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-700 rounded-lg px-1.5 py-1 text-xs outline-none">
        </div>
      </div>`;
    }).join('');
    modal.innerHTML = `<div class="w-full max-w-4xl bg-white dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-800 rounded-3xl p-4 sm:p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden text-xs hide-scrollbar"><div class="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800"><h3 class="font-bold text-sm text-stone-900 dark:text-stone-100 font-title">${staff ? 'Editar Integrante' : 'Alta de Personal'}</h3><button type="button" onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="text-stone-400 cursor-pointer">${svg('close')}</button></div><div class="grid grid-cols-1 lg:grid-cols-12 gap-5"><div class="lg:col-span-5 min-w-0 space-y-2.5"><div><label class="block text-stone-600 dark:text-stone-400 mb-1">Nombre Completo:</label><input type="text" id="sf-name" value="${staff?.name || ''}" placeholder="Dr. Lucas Ruiz" class="tucu-input w-full"></div><div class="grid grid-cols-2 gap-2"><div><label class="block text-stone-600 dark:text-stone-400 mb-1">Rol / Especialidad:</label><input type="text" id="sf-role" value="${staff?.role || ''}" placeholder="Especialista" class="tucu-input w-full"></div><div><label class="block text-stone-600 dark:text-stone-400 mb-1">Iniciales:</label><input type="text" id="sf-photo" maxlength="2" value="${(staff?.photo || 'ST').replace(/[^A-Za-z0-9]/g, '').slice(0, 2) || 'ST'}" class="tucu-input w-full tabular-nums uppercase"></div></div><div class="grid grid-cols-2 gap-2"><div><label class="block text-stone-600 dark:text-stone-400 mb-1">WhatsApp:</label><input type="tel" id="sf-phone" value="${staff?.phone || ''}" placeholder="3815123456" class="tucu-input w-full"></div><div><label class="block text-stone-600 dark:text-stone-400 mb-1">Email:</label><input type="email" id="sf-email" value="${staff?.email || ''}" placeholder="staff@nexus.ar" class="tucu-input w-full"></div></div><div><label class="block text-stone-600 dark:text-stone-400 mb-1 font-bold">Servicios Habilitados:</label><div class="space-y-1 max-h-36 overflow-y-auto pr-1 hide-scrollbar">${srvCheckboxes}</div></div></div><div class="lg:col-span-7 min-w-0 space-y-2"><div class="flex items-center justify-between gap-2 mb-1"><label class="tucu-primary-text font-bold flex items-center gap-1.5">${svg('cal')}<span>Horarios Semanales</span></label><button type="button" id="btn-l3-clone-lun-vie" onclick="AdminL3Staff.cloneLunVie()" class="tucu-btn admin-glass-btn">Clonar Lun a Vie</button></div><div id="staff-hours-list" class="space-y-1.5 min-w-0">${daysRows}</div></div></div><div class="flex gap-2 pt-2 border-t border-stone-200 dark:border-stone-800"><button type="button" onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="tucu-btn w-1/3 admin-glass-btn">Cancelar</button><button type="button" onclick="AdminL3Staff.saveStaff('${staffId || ''}')" class="tucu-btn w-2/3 admin-glass-primary">Guardar Integrante</button></div></div>`;
    modal.classList.remove('hidden');
  }

  function saveStaff(staffId) {
    const name = document.getElementById('sf-name')?.value?.trim() || 'Integrante', role = document.getElementById('sf-role')?.value?.trim() || 'Especialista';
    const photo = document.getElementById('sf-photo')?.value?.trim() || name.slice(0, 2).toUpperCase(), phone = document.getElementById('sf-phone')?.value?.trim() || '', email = document.getElementById('sf-email')?.value?.trim() || '';
    const selectedSrvs = Array.from(document.querySelectorAll('input[name="staff_srv"]:checked')).map(el => el.value);
    const workingHours = {};
    DAYS.forEach(d => {
      workingHours[d.key] = {
        active: !!document.getElementById(`dh-active-${d.key}`)?.checked,
        start: document.getElementById(`dh-start-${d.key}`)?.value || '09:00',
        end: document.getElementById(`dh-end-${d.key}`)?.value || '19:00',
        isSplit: !!document.getElementById(`dh-split-${d.key}`)?.checked,
        open2: document.getElementById(`dh-open2-${d.key}`)?.value || '16:00',
        close2: document.getElementById(`dh-close2-${d.key}`)?.value || '20:30'
      };
    });
    const state = window.AdminL3Core.state;
    let staff = state.staff || [];
    if (staffId) staff = staff.map(s => s.id === staffId ? { ...s, name, role, photo, phone, email, serviceIds: selectedSrvs, workingHours } : s);
    else staff.push({ id: 'st-' + Math.random().toString(36).substring(2, 6), name, role, photo, phone, email, active: true, serviceIds: selectedSrvs, workingHours });
    window.AdminL3Core.setStorage(`tucu_l3_staff_${state.rubro}`, staff); state.staff = staff;
    document.getElementById('admin-modal-root')?.classList.add('hidden');
    window.AdminL3Core.showToast(staffId ? 'Integrante actualizado' : 'Integrante agregado');
    window.AdminL3Core.renderActiveView();
  }

  return { render, toggleActive, deleteStaff, toggleDaySplit, cloneLunVie, openEditModal, saveStaff };
})();
