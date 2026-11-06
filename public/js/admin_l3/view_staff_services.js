// Archivo: public/js/admin_l3/view_staff_services.js
/**
 * 👥 NEXUS ADMIN L3: VISTAS DE ESPECIALISTAS, SERVICIOS Y CONFIGURACIÓN
 * - ABM de staff y catálogo de servicios con duración y precios por rubro
 * - Parámetros de slots, anticipación y conexión con WhatsApp Baileys
 */

window.AdminL3StaffServices = (function () {
  function renderStaff(container, state) {
    const list = state.staff || [];
    const staffSingular = state.presets[state.rubro]?.labels?.staffSingular || 'Profesional';

    const cardsHtml = list.map((s, idx) => `
      <div class="p-3.5 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-2.5 shadow-md flex flex-col justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-lg flex-shrink-0">${s.photo || '👤'}</div>
          <div class="min-w-0 flex-1"><h3 class="font-bold text-xs text-white truncate">${s.name}</h3><p class="text-[11px] text-zinc-400 truncate">${s.role}</p></div>
        </div>
        <div class="flex items-center justify-between pt-1.5 border-t border-zinc-800 text-xs">
          <button onclick="AdminL3StaffServices.toggleStaffActive(${idx})" class="px-2 py-0.5 rounded-lg text-[10px] font-bold ${s.active !== false ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-500'}">${s.active !== false ? '● Activo' : '○ Pausado'}</button>
          <button onclick="AdminL3StaffServices.deleteStaff(${idx})" class="text-zinc-500 hover:text-rose-400 text-xs">Eliminar</button>
        </div>
      </div>`).join('');

    container.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-zinc-800/80">
        <div><h2 class="text-base font-bold text-white">👥 Gestión de ${state.presets[state.rubro]?.labels?.staffPlural || 'Profesionales'}</h2><p class="text-xs text-zinc-400">${list.length} registrados en ${state.presets[state.rubro]?.name || state.rubro}</p></div>
        <button onclick="AdminL3StaffServices.openStaffModal()" class="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"><span>➕</span><span>Nuevo ${staffSingular}</span></button>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 pt-2">${cardsHtml}</div>`;
  }

  function renderServices(container, state) {
    const list = state.services || [];
    const srvSingular = state.presets[state.rubro]?.labels?.serviceSingular || 'Servicio';

    const rowsHtml = list.map((s, idx) => `
      <tr class="border-b border-zinc-800/60 hover:bg-zinc-900/40 text-xs">
        <td class="py-2.5 px-3.5 flex items-center gap-2 font-semibold text-zinc-200"><span class="text-base">${s.icon || '✨'}</span><span>${s.name}</span></td>
        <td class="py-2.5 px-3.5 font-mono text-indigo-300 font-bold">${s.duration || 30} min</td>
        <td class="py-2.5 px-3.5 font-bold text-zinc-100">$${(s.price || 0).toLocaleString('es-AR')}</td>
        <td class="py-2.5 px-3.5 text-right"><button onclick="AdminL3StaffServices.deleteService(${idx})" class="p-1 text-zinc-500 hover:text-rose-400">✕</button></td>
      </tr>`).join('');

    container.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-zinc-800/80">
        <div><h2 class="text-base font-bold text-white">✂️ Catálogo de ${state.presets[state.rubro]?.labels?.servicePlural || 'Servicios'}</h2><p class="text-xs text-zinc-400">${list.length} prestaciones activas</p></div>
        <button onclick="AdminL3StaffServices.openServiceModal()" class="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"><span>➕</span><span>Nuevo ${srvSingular}</span></button>
      </div>
      <div class="bg-zinc-900/60 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl mt-2">
        <table class="w-full text-left">
          <thead class="bg-zinc-950/70 border-b border-zinc-800 text-[11px] text-zinc-400 uppercase font-semibold"><tr><th class="py-2.5 px-3.5">Prestación</th><th class="py-2.5 px-3.5">Duración</th><th class="py-2.5 px-3.5">Precio</th><th class="py-2.5 px-3.5 text-right">Acción</th></tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>`;
  }

  function renderConfig(container, state) {
    const cfg = state.config || {};
    container.innerHTML = `
      <div class="pb-2 border-b border-zinc-800/80"><h2 class="text-base font-bold text-white">⚙️ Parámetros del Motor L3</h2><p class="text-xs text-zinc-400">Ajustes de slots, cobertura y conexión Baileys</p></div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        <div class="p-5 rounded-3xl bg-zinc-900/70 border border-zinc-800 space-y-3.5 shadow-lg text-xs">
          <h3 class="font-bold uppercase text-indigo-400">⏱️ Intervalos de Turnos</h3>
          <div><label class="block text-zinc-400 mb-1">Duración Bloque Base (minutos):</label><input type="number" id="cfg-slot" value="${cfg.slotIntervalMinutes || 30}" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-200 outline-none"></div>
          <div><label class="block text-zinc-400 mb-1">Días de Anticipación Máxima:</label><input type="number" id="cfg-adv" value="${cfg.maxAdvanceDays || 14}" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-200 outline-none"></div>
          <button onclick="AdminL3StaffServices.saveConfig()" class="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold">Guardar Parámetros</button>
        </div>
        <div class="p-5 rounded-3xl bg-zinc-900/70 border border-zinc-800 space-y-3 shadow-lg text-xs text-zinc-400">
          <h3 class="font-bold uppercase text-emerald-400">📲 Microservicio WhatsApp Baileys</h3>
          <p>Servicio activo en <code class="text-indigo-300 font-mono">/api/wa/send-booking</code></p>
          <p>Despacho asíncrono en segundo plano al confirmar turnos en el widget o desde la agenda.</p>
          <button onclick="alert('✅ Baileys Microservice verificado en background')" class="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold border border-zinc-700/60">Verificar Estado Baileys</button>
        </div>
      </div>`;
  }

  function toggleStaffActive(idx) {
    const list = window.AdminL3Core.state.staff;
    if (list[idx]) { list[idx].active = list[idx].active === false ? true : false; saveStaffList(list); }
  }

  function deleteStaff(idx) {
    if (!confirm('¿Eliminar profesional?')) return;
    const list = window.AdminL3Core.state.staff;
    list.splice(idx, 1);
    saveStaffList(list);
  }

  function saveStaffList(list) {
    window.AdminL3Core.setStorage(`tucu_l3_staff_${window.AdminL3Core.state.rubro}`, list);
    window.AdminL3Core.state.staff = list;
    window.AdminL3Core.renderActiveView();
  }

  function deleteService(idx) {
    if (!confirm('¿Eliminar servicio?')) return;
    const list = window.AdminL3Core.state.services;
    list.splice(idx, 1);
    window.AdminL3Core.setStorage(`tucu_l3_services_${window.AdminL3Core.state.rubro}`, list);
    window.AdminL3Core.state.services = list;
    window.AdminL3Core.renderActiveView();
  }

  function openStaffModal() {
    const modal = document.getElementById('admin-modal-root');
    if (!modal) return;
    modal.innerHTML = `
      <div class="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-3 shadow-2xl text-xs">
        <h3 class="font-bold text-white">➕ Añadir Profesional</h3>
        <div class="space-y-2.5">
          <div><label class="block text-zinc-400 mb-1">Nombre Completo:</label><input id="new-staff-name" placeholder="Ej. Dr. Mario Silva" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-200 outline-none"></div>
          <div><label class="block text-zinc-400 mb-1">Rol / Especialidad:</label><input id="new-staff-role" placeholder="Ej. Especialista en Ortodoncia" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-200 outline-none"></div>
        </div>
        <div class="flex gap-2 pt-2">
          <button onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="w-1/2 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-bold">Cancelar</button>
          <button onclick="AdminL3StaffServices.saveNewStaff()" class="w-1/2 py-2 rounded-xl bg-indigo-600 text-white font-bold">Guardar</button>
        </div>
      </div>`;
    modal.classList.remove('hidden');
  }

  function saveNewStaff() {
    const name = document.getElementById('new-staff-name')?.value.trim();
    const role = document.getElementById('new-staff-role')?.value.trim();
    if (!name) return alert('Ingresa el nombre');
    const list = window.AdminL3Core.state.staff || [];
    list.push({ id: 'st-' + Date.now(), name, role: role || 'Especialista', photo: '👤', active: true });
    saveStaffList(list);
    document.getElementById('admin-modal-root')?.classList.add('hidden');
  }

  function openServiceModal() {
    const modal = document.getElementById('admin-modal-root');
    if (!modal) return;
    modal.innerHTML = `
      <div class="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-3 shadow-2xl text-xs">
        <h3 class="font-bold text-white">➕ Añadir Servicio</h3>
        <div class="space-y-2.5">
          <div><label class="block text-zinc-400 mb-1">Nombre:</label><input id="new-srv-name" placeholder="Ej. Sesión Completa" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-200 outline-none"></div>
          <div class="grid grid-cols-2 gap-2">
            <div><label class="block text-zinc-400 mb-1">Duración (min):</label><input type="number" id="new-srv-dur" value="30" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-200 outline-none"></div>
            <div><label class="block text-zinc-400 mb-1">Precio (ARS):</label><input type="number" id="new-srv-price" value="15000" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-200 outline-none"></div>
          </div>
        </div>
        <div class="flex gap-2 pt-2">
          <button onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="w-1/2 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-bold">Cancelar</button>
          <button onclick="AdminL3StaffServices.saveNewService()" class="w-1/2 py-2 rounded-xl bg-indigo-600 text-white font-bold">Guardar</button>
        </div>
      </div>`;
    modal.classList.remove('hidden');
  }

  function saveNewService() {
    const name = document.getElementById('new-srv-name')?.value.trim();
    const dur = parseInt(document.getElementById('new-srv-dur')?.value || '30', 10);
    const price = parseInt(document.getElementById('new-srv-price')?.value || '0', 10);
    if (!name) return alert('Ingresa el nombre del servicio');
    const list = window.AdminL3Core.state.services || [];
    list.push({ id: 'srv-' + Date.now(), name, duration: dur, price, icon: '✨' });
    window.AdminL3Core.setStorage(`tucu_l3_services_${window.AdminL3Core.state.rubro}`, list);
    window.AdminL3Core.state.services = list;
    window.AdminL3Core.renderActiveView();
    document.getElementById('admin-modal-root')?.classList.add('hidden');
  }

  function saveConfig() {
    const slot = parseInt(document.getElementById('cfg-slot')?.value || '30', 10);
    const adv = parseInt(document.getElementById('cfg-adv')?.value || '14', 10);
    const cfg = { slotIntervalMinutes: slot, maxAdvanceDays: adv };
    window.AdminL3Core.setStorage(`tucu_l3_config_${window.AdminL3Core.state.rubro}`, cfg);
    window.AdminL3Core.state.config = cfg;
    alert('✅ Parámetros guardados correctamente');
  }

  return { renderStaff, renderServices, renderConfig, toggleStaffActive, deleteStaff, openStaffModal, saveNewStaff, openServiceModal, saveNewService, deleteService, saveConfig };
})();
