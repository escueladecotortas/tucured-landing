// Archivo: public/js/admin_l3/view_clients.js
// Directorio CRM & Contactos L3 (Importador Celular/VCF/CSV, ABM Manual e Historial < 110 líneas)

window.AdminL3Clients = (function () {
  function render(container, state) {
    const svg = window.AdminL3Core.svg, bookings = state.bookings || [], clientsMap = {};
    bookings.filter(b => !b.deletedAt && (!b.rubroId || b.rubroId === state.rubro)).forEach(b => {
      const key = (b.phone || b.client || 'anon').replace(/\D/g, '') || b.client;
      if (!clientsMap[key]) clientsMap[key] = { id: key, name: b.client || 'Cliente', phone: b.phone || '', totalVisits: 0, totalSpent: 0, lastVisit: b.date };
      const canon = window.AdminBookingEngine ? window.AdminBookingEngine.normalizeKey(b.status) : b.status;
      if (canon !== 'CANCELLED' && canon !== 'NO_SHOW') {
        clientsMap[key].totalVisits += 1; clientsMap[key].totalSpent += (b.price || 0);
      }
      if (b.date > clientsMap[key].lastVisit) clientsMap[key].lastVisit = b.date;
    });

    const clientsList = Object.values(clientsMap).sort((a, b) => b.totalSpent - a.totalSpent);
    const totalClients = clientsList.length, globalRevenue = clientsList.reduce((acc, c) => acc + c.totalSpent, 0);
    const rows = clientsList.map(c => `
      <tr class="border-b border-stone-100 dark:border-stone-800/60 hover:bg-stone-50 dark:hover:bg-stone-900/40 text-xs">
        <td class="py-3 px-4 font-bold text-stone-800 dark:text-stone-100">${c.name}</td>
        <td class="py-3 px-4 tabular-nums text-emerald-700 dark:text-emerald-400 font-semibold">${c.phone || 'Sin tel'}</td>
        <td class="py-3 px-4 tabular-nums font-bold tucu-primary-text">${c.totalVisits} ${c.totalVisits === 1 ? 'cita' : 'citas'}</td>
        <td class="py-3 px-4 font-bold">$${c.totalSpent.toLocaleString('es-AR')}</td>
        <td class="py-3 px-4 text-right"><button onclick="AdminL3Clients.openHistoryModal('${c.id}')" class="px-3 py-1 rounded-xl admin-glass-btn text-xs font-bold">Historial</button></td>
      </tr>`).join('');

    container.innerHTML = `<div class="space-y-5">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div class="admin-card"><p class="text-[10px] uppercase font-bold text-stone-500">Clientes en Reservas</p><p class="font-title text-xl font-extrabold text-stone-900 dark:text-stone-100 mt-0.5">${totalClients}</p><div class="admin-kpi-track"><div class="admin-kpi-fill tucu-primary-bg" style="width:${totalClients ? 100 : 0}%"></div></div></div>
        <div class="admin-card"><p class="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">Volumen Acumulado</p><p class="font-title text-xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-0.5">$${globalRevenue.toLocaleString('es-AR')}</p><div class="admin-kpi-track"><div class="admin-kpi-fill bg-emerald-600" style="width:${globalRevenue > 0 ? 90 : 0}%"></div></div></div>
      </div>
      <div id="l3-contacts-mount" class="admin-card"></div>
      <div class="admin-card !p-0 overflow-x-auto">
        <div class="p-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between"><h3 class="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-2">${svg('users')}<span>Historial de Atenciones por Cliente</span></h3><span class="text-[11px] tabular-nums text-stone-500">${clientsList.length} registros</span></div>
        <table class="w-full text-left"><thead class="bg-stone-50 dark:bg-stone-950/70 border-b border-[#D5CEC2] dark:border-stone-800 text-[11px] text-stone-500 uppercase font-semibold"><tr><th class="py-2.5 px-4">Cliente</th><th class="py-2.5 px-4">Teléfono</th><th class="py-2.5 px-4">Asistencia</th><th class="py-2.5 px-4">Facturado</th><th class="py-2.5 px-4 text-right">Detalle</th></tr></thead><tbody>${rows || '<tr><td colspan="5" class="p-6 text-center text-stone-400 italic">Sin reservas registradas aún</td></tr>'}</tbody></table>
      </div>
    </div>`;

    window.AdminContactsManager?.mount?.({
      containerId: 'l3-contacts-mount', level: 'l3',
      getRubro: () => window.AdminL3Core.state.rubro,
      onToast: (m, t) => window.AdminL3Core.showToast(m, t)
    });
  }

  function openHistoryModal(clientId) {
    const modal = document.getElementById('admin-modal-root'), svg = window.AdminL3Core.svg; if (!modal) return;
    const bookings = (window.AdminL3Core.state.bookings || []).filter(b => ((b.phone || b.client || 'anon').replace(/\D/g, '') || b.client) === clientId).sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
    const clientName = bookings[0]?.client || 'Cliente', clientPhone = bookings[0]?.phone || '';
    const historyRows = bookings.map(b => {
      const meta = window.AdminBookingEngine ? window.AdminBookingEngine.getMeta(b.status) : { badge: 'bg-emerald-50 text-emerald-700', label: b.status || 'Confirmado' };
      return `<div class="p-3 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 space-y-1 text-xs"><div class="flex items-center justify-between"><span class="tabular-nums font-bold tucu-primary-text inline-flex items-center gap-1">${svg('cal')} ${b.date} - ${b.time} hs</span><span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${meta.badge}">${meta.label}</span></div><div class="flex items-center justify-between text-stone-600 dark:text-stone-300"><span>${b.serviceName} con <b>${b.staffName}</b></span><span class="font-bold text-stone-800 dark:text-stone-100">$${(b.price || 0).toLocaleString('es-AR')}</span></div></div>`;
    }).join('');
    modal.innerHTML = `<div class="w-full max-w-lg bg-white dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-800 rounded-3xl p-6 space-y-4 shadow-2xl text-xs max-h-[85vh] overflow-y-auto hide-scrollbar"><div class="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800"><div><h3 class="font-bold text-sm text-stone-900 dark:text-stone-100 font-title">Historial de ${clientName}</h3><p class="text-stone-500 text-[11px] flex items-center gap-1">${svg('tel')} ${clientPhone} · ${bookings.length} turnos</p></div><button onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="text-stone-400 cursor-pointer">${svg('close')}</button></div><div class="space-y-2 max-h-80 overflow-y-auto pr-1 hide-scrollbar">${historyRows}</div><button onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="w-full py-2.5 rounded-xl admin-glass-btn font-bold">Cerrar Historial</button></div>`;
    modal.classList.remove('hidden');
  }

  return { render, openHistoryModal };
})();
