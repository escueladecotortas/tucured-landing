// Archivo: public/js/admin_l3/view_clients.js
/**
 * 👤 NEXUS ADMIN L3: DIRECTORIO CRM DE CLIENTES & HISTORIAL (< 130 líneas)
 * - Derivación reactiva de métricas de fidelización y valor de cliente
 * - Total de visitas, gasto acumulado ($ ARS), última fecha e historial completo
 * - Estándar visual Aura Light con tarjetas luminosas y modales elegantes
 */

window.AdminL3Clients = (function () {
  let searchClientTerm = '';

  function render(container, state) {
    const bookings = state.bookings || [];
    const clientsMap = {};
    bookings.forEach(b => {
      const key = (b.phone || b.client || 'anon').replace(/\D/g, '') || b.client;
      if (!clientsMap[key]) {
        clientsMap[key] = { id: key, name: b.client || 'Cliente', phone: b.phone || '', totalVisits: 0, totalSpent: 0, lastVisit: b.date, bookings: [] };
      }
      clientsMap[key].bookings.push(b);
      if (b.status !== 'CANCELLED' && b.status !== 'RELEASED') {
        clientsMap[key].totalVisits += 1;
        clientsMap[key].totalSpent += (b.price || 0);
      }
      if (b.date > clientsMap[key].lastVisit) clientsMap[key].lastVisit = b.date;
    });

    const clientsList = Object.values(clientsMap).sort((a, b) => b.totalSpent - a.totalSpent);
    const filteredClients = clientsList.filter(c => !searchClientTerm || c.name.toLowerCase().includes(searchClientTerm.toLowerCase()) || c.phone.includes(searchClientTerm));
    const totalClients = clientsList.length, vipClients = clientsList.filter(c => c.totalVisits >= 3).length, globalRevenue = clientsList.reduce((acc, c) => acc + c.totalSpent, 0);

    const rows = filteredClients.map(c => `
      <tr class="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-xs">
        <td class="py-3 px-4 font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-sm shadow-xs">👤</div>
          <div><p class="font-bold text-slate-900 dark:text-slate-100 text-xs">${c.name}</p><span class="text-[10px] text-slate-400 font-mono">ID: ${c.id.substring(0, 10)}</span></div>
        </td>
        <td class="py-3 px-4"><span class="text-xs text-emerald-600 dark:text-emerald-400 font-bold">📞 ${c.phone || 'Sin tel'}</span></td>
        <td class="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">${c.totalVisits} ${c.totalVisits === 1 ? 'cita' : 'citas'}</td>
        <td class="py-3 px-4 font-bold text-slate-800 dark:text-slate-100">$${c.totalSpent.toLocaleString('es-AR')}</td>
        <td class="py-3 px-4 font-mono text-slate-500 text-xs">${c.lastVisit || 'N/A'}</td>
        <td class="py-3 px-4 text-right">
          <button onclick="AdminL3Clients.openHistoryModal('${c.id}')" class="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all shadow-xs">📋 Ver Historial</button>
        </td>
      </tr>`).join('');

    container.innerHTML = `
      <div class="space-y-5">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs"><p class="text-[10px] uppercase font-bold text-slate-500">Total Clientes Registrados</p><p class="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">${totalClients}</p></div>
          <div class="p-4 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 rounded-3xl shadow-xs"><p class="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-400">Clientes VIP (≥ 3 citas)</p><p class="text-xl font-bold text-indigo-700 dark:text-indigo-300 mt-0.5">${vipClients}</p></div>
          <div class="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-3xl shadow-xs"><p class="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">Volumen Facturado Acumulado</p><p class="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">$${globalRevenue.toLocaleString('es-AR')}</p></div>
        </div>
        <div class="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div><h2 class="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"><span>👤 Directorio CRM de Clientes</span><span class="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">${filteredClients.length} registros</span></h2><p class="text-xs text-slate-500">Historial completo, recurrencia y valor de vida del cliente.</p></div>
          <input type="text" placeholder="Buscar por nombre o teléfono..." value="${searchClientTerm}" oninput="AdminL3Clients.setSearch(this.value)" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-800 dark:text-slate-100 outline-none w-56 sm:w-72 shadow-xs">
        </div>
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
          <table class="w-full text-left"><thead class="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 uppercase font-semibold"><tr><th class="py-3 px-4">Cliente</th><th class="py-3 px-4">Teléfono</th><th class="py-3 px-4">Citas Asistidas</th><th class="py-3 px-4">Gasto Total</th><th class="py-3 px-4">Última Cita</th><th class="py-3 px-4 text-right">Acción</th></tr></thead><tbody>${rows.length > 0 ? rows : `<tr><td colspan="6" class="p-8 text-center text-slate-400 italic">No hay clientes registrados</td></tr>`}</tbody></table>
        </div>
      </div>`;
  }

  function setSearch(term) { searchClientTerm = term; window.AdminL3Core.renderActiveView(); }

  function openHistoryModal(clientId) {
    const modal = document.getElementById('admin-modal-root'); if (!modal) return;
    const bookings = (window.AdminL3Core.state.bookings || []).filter(b => {
      const key = (b.phone || b.client || 'anon').replace(/\D/g, '') || b.client;
      return key === clientId;
    }).sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
    const clientName = bookings[0]?.client || 'Cliente', clientPhone = bookings[0]?.phone || '';

    const historyRows = bookings.map(b => `
      <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
        <div class="flex items-center justify-between">
          <span class="font-mono font-bold text-indigo-600 dark:text-indigo-400">📅 ${b.date} - ${b.time} hs</span>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${b.status==='CANCELLED'?'bg-rose-50 text-rose-700':b.status==='RELEASED'?'bg-amber-50 text-amber-700':'bg-emerald-50 text-emerald-700'}">${b.status || 'CONFIRMED'}</span>
        </div>
        <div class="flex items-center justify-between text-slate-600 dark:text-slate-300">
          <span>${b.serviceName} con <b>${b.staffName}</b> (${b.resourceName || 'Recurso'})</span>
          <span class="font-bold text-slate-800 dark:text-slate-100">$${(b.price||0).toLocaleString('es-AR')}</span>
        </div>
      </div>`).join('');

    modal.innerHTML = `
      <div class="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl text-xs max-h-[85vh] overflow-y-auto hide-scrollbar">
        <div class="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div><h3 class="font-bold text-sm text-slate-900 dark:text-slate-100">📋 Historial de ${clientName}</h3><p class="text-slate-500 text-[11px]">📞 ${clientPhone} · ${bookings.length} turnos registrados</p></div>
          <button onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="text-slate-400">✕</button>
        </div>
        <div class="space-y-2 max-h-80 overflow-y-auto pr-1 hide-scrollbar">${historyRows}</div>
        <div class="pt-2 border-t border-slate-200 dark:border-slate-800">
          <button onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold">Cerrar Historial</button>
        </div>
      </div>`;
    modal.classList.remove('hidden');
  }

  return { render, setSearch, openHistoryModal };
})();
