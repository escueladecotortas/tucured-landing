// Archivo: public/js/admin_l3/view_clients.js
// Directorio CRM L3 Warm Studio v2 con Buscador sin Acentos (< 115 líneas)

window.AdminL3Clients = (function () {
  let searchClientTerm = '';

  function render(container, state) {
    const svg = window.AdminL3Core.svg, norm = window.AdminL3Core.normStr;
    const bookings = state.bookings || [], clientsMap = {};
    bookings.forEach(b => {
      const key = (b.phone || b.client || 'anon').replace(/\D/g, '') || b.client;
      if (!clientsMap[key]) clientsMap[key] = { id: key, name: b.client || 'Cliente', phone: b.phone || '', totalVisits: 0, totalSpent: 0, lastVisit: b.date, bookings: [] };
      clientsMap[key].bookings.push(b);
      const canon = window.AdminBookingEngine ? window.AdminBookingEngine.normalizeKey(b.status) : b.status;
      if (canon !== 'CANCELLED' && canon !== 'NO_SHOW') {
        clientsMap[key].totalVisits += 1;
        clientsMap[key].totalSpent += (b.price || 0);
      }
      if (b.date > clientsMap[key].lastVisit) clientsMap[key].lastVisit = b.date;
    });

    const clientsList = Object.values(clientsMap).sort((a, b) => b.totalSpent - a.totalSpent);
    const q = norm(searchClientTerm);
    const filteredClients = clientsList.filter(c => !q || norm(c.name).includes(q) || norm(c.phone).includes(q));
    const totalClients = clientsList.length, vipClients = clientsList.filter(c => c.totalVisits >= 3).length, globalRevenue = clientsList.reduce((acc, c) => acc + c.totalSpent, 0);
    const vipPct = totalClients ? Math.round((vipClients / totalClients) * 100) : 0;

    const rows = filteredClients.map(c => `
      <tr class="border-b border-stone-100 dark:border-stone-800/60 hover:bg-stone-50 dark:hover:bg-stone-900/40 text-xs">
        <td class="py-3 px-4 font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800 border border-[#D5CEC2] dark:border-stone-700 flex items-center justify-center text-xs font-bold text-red-900 dark:text-red-300 shadow-xs">${c.name.slice(0,2).toUpperCase()}</div>
          <div><p class="font-bold text-stone-900 dark:text-stone-100 text-xs">${c.name}</p><span class="text-[10px] text-stone-400 font-mono">ID: ${c.id.substring(0, 10)}</span></div>
        </td>
        <td class="py-3 px-4"><span class="text-xs text-emerald-700 dark:text-emerald-400 font-bold inline-flex items-center gap-1">${svg('tel')} ${c.phone || 'Sin tel'}</span></td>
        <td class="py-3 px-4 font-mono font-bold text-red-900 dark:text-red-400">${c.totalVisits} ${c.totalVisits === 1 ? 'cita' : 'citas'}</td>
        <td class="py-3 px-4 font-bold text-stone-800 dark:text-stone-100">$${c.totalSpent.toLocaleString('es-AR')}</td>
        <td class="py-3 px-4 font-mono text-stone-500 text-xs">${c.lastVisit || 'N/A'}</td>
        <td class="py-3 px-4 text-right"><button onclick="AdminL3Clients.openHistoryModal('${c.id}')" class="px-3 py-1 rounded-xl admin-glass-btn text-xs font-bold">Ver Historial</button></td>
      </tr>`).join('');

    container.innerHTML = `
      <div class="space-y-5">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div class="admin-card"><p class="text-[10px] uppercase font-bold text-stone-500">Total Clientes</p><p class="font-title text-xl font-extrabold text-stone-900 dark:text-stone-100 mt-0.5">${totalClients}</p><div class="admin-kpi-track"><div class="admin-kpi-fill bg-[#800000]" style="width:${totalClients ? 100 : 0}%"></div></div></div>
          <div class="admin-card"><p class="text-[10px] uppercase font-bold text-red-900 dark:text-red-400">Clientes VIP (>= 3 citas)</p><p class="font-title text-xl font-extrabold text-red-900 dark:text-red-300 mt-0.5">${vipClients}</p><div class="admin-kpi-track"><div class="admin-kpi-fill bg-amber-600" style="width:${vipPct}%"></div></div></div>
          <div class="admin-card"><p class="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">Volumen Acumulado</p><p class="font-title text-xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-0.5">$${globalRevenue.toLocaleString('es-AR')}</p><div class="admin-kpi-track"><div class="admin-kpi-fill bg-emerald-600" style="width:${globalRevenue > 0 ? 90 : 0}%"></div></div></div>
        </div>
        <div class="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[#D5CEC2] dark:border-stone-800">
          <div><h2 class="text-base font-bold text-stone-900 dark:text-stone-100 font-title flex items-center gap-2">${svg('users')}<span>Directorio CRM de Clientes</span><span class="text-xs px-2 py-0.5 rounded-full bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-mono">${filteredClients.length} registros</span></h2><p class="text-xs text-stone-500">Historial completo, recurrencia y valor de vida del cliente.</p></div>
          <input type="text" placeholder="Buscar por nombre o teléfono..." value="${searchClientTerm}" oninput="AdminL3Clients.setSearch(this.value)" class="bg-white dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-800 px-3 py-2 rounded-xl text-xs text-stone-800 dark:text-stone-100 outline-none w-56 sm:w-72">
        </div>
        <div class="admin-card !p-0 overflow-hidden">
          <table class="w-full text-left"><thead class="bg-stone-50 dark:bg-stone-950/70 border-b border-[#D5CEC2] dark:border-stone-800 text-[11px] text-stone-500 uppercase font-semibold"><tr><th class="py-3 px-4">Cliente</th><th class="py-3 px-4">Teléfono</th><th class="py-3 px-4">Citas Asistidas</th><th class="py-3 px-4">Gasto Total</th><th class="py-3 px-4">Última Cita</th><th class="py-3 px-4 text-right">Acción</th></tr></thead><tbody>${rows.length > 0 ? rows : `<tr><td colspan="6" class="p-8 text-center text-stone-400 italic">No hay clientes registrados</td></tr>`}</tbody></table>
        </div>
      </div>`;
  }

  function setSearch(term) { searchClientTerm = term; window.AdminL3Core.renderActiveView(); }

  function openHistoryModal(clientId) {
    const modal = document.getElementById('admin-modal-root'), svg = window.AdminL3Core.svg;
    if (!modal) return;
    const bookings = (window.AdminL3Core.state.bookings || []).filter(b => ((b.phone || b.client || 'anon').replace(/\D/g, '') || b.client) === clientId).sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
    const clientName = bookings[0]?.client || 'Cliente', clientPhone = bookings[0]?.phone || '';
    const historyRows = bookings.map(b => {
      const meta = window.AdminBookingEngine ? window.AdminBookingEngine.getMeta(b.status) : { badge: 'bg-emerald-50 text-emerald-700', label: b.status || 'Confirmado' };
      return `
      <div class="p-3 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 space-y-1 text-xs">
        <div class="flex items-center justify-between"><span class="font-mono font-bold text-red-900 dark:text-red-400 inline-flex items-center gap-1">${svg('cal')} ${b.date} - ${b.time} hs</span><span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${meta.badge}">${meta.label}</span></div>
        <div class="flex items-center justify-between text-stone-600 dark:text-stone-300"><span>${b.serviceName} con <b>${b.staffName}</b> (${b.resourceName || 'Recurso'})</span><span class="font-bold text-stone-800 dark:text-stone-100">$${(b.price||0).toLocaleString('es-AR')}</span></div>
      </div>`;
    }).join('');

    modal.innerHTML = `<div class="w-full max-w-lg bg-white dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-800 rounded-3xl p-6 space-y-4 shadow-2xl text-xs max-h-[85vh] overflow-y-auto hide-scrollbar"><div class="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800"><div><h3 class="font-bold text-sm text-stone-900 dark:text-stone-100 font-title">Historial de ${clientName}</h3><p class="text-stone-500 text-[11px] flex items-center gap-1">${svg('tel')} ${clientPhone} · ${bookings.length} turnos registrados</p></div><button onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="text-stone-400 cursor-pointer">${svg('close')}</button></div><div class="space-y-2 max-h-80 overflow-y-auto pr-1 hide-scrollbar">${historyRows}</div><div class="pt-2 border-t border-stone-200 dark:border-stone-800"><button onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="w-full py-2.5 rounded-xl admin-glass-btn font-bold">Cerrar Historial</button></div></div>`;
    modal.classList.remove('hidden');
  }

  return { render, setSearch, openHistoryModal };
})();