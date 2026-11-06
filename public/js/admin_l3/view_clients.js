// Archivo: public/js/admin_l3/view_clients.js
/**
 * 👤 NEXUS ADMIN L3: DIRECTORIO CRM DE CLIENTES & HISTORIAL DE TURNOS
 * - Cruce reactivo de reservas (tucu_l3_bookings) para derivar métricas de fidelización
 * - Total de visitas, gasto acumulado ($ ARS), última fecha de atención y búsqueda instantánea
 * - Modal con historial cronológico completo de turnos por cliente
 */

window.AdminL3Clients = (function () {
  let searchClientTerm = '';

  function render(container, state) {
    const bookings = state.bookings || [];

    // Derivar clientes agregados
    const clientsMap = {};
    bookings.forEach(b => {
      const key = (b.phone || b.client || 'anon').replace(/\D/g, '') || b.client;
      if (!clientsMap[key]) {
        clientsMap[key] = { id: key, name: b.client || 'Cliente', phone: b.phone || '', totalVisits: 0, totalSpent: 0, lastVisit: b.date, bookings: [] };
      }
      clientsMap[key].bookings.push(b);
      if (b.status !== 'CANCELLED') {
        clientsMap[key].totalVisits += 1;
        clientsMap[key].totalSpent += (b.price || 0);
      }
      if (b.date > clientsMap[key].lastVisit) {
        clientsMap[key].lastVisit = b.date;
      }
    });

    const clientsList = Object.values(clientsMap).sort((a, b) => b.totalSpent - a.totalSpent);
    const filteredClients = clientsList.filter(c => {
      return !searchClientTerm || c.name.toLowerCase().includes(searchClientTerm.toLowerCase()) || c.phone.includes(searchClientTerm);
    });

    const totalClients = clientsList.length;
    const vipClients = clientsList.filter(c => c.totalVisits >= 3).length;
    const globalRevenue = clientsList.reduce((acc, c) => acc + c.totalSpent, 0);

    const rows = filteredClients.map(c => `
      <tr class="border-b border-zinc-800/60 hover:bg-zinc-900/40 text-xs">
        <td class="py-3 px-4 font-bold text-zinc-100 flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center text-sm">👤</div>
          <div><p class="font-bold text-white text-xs">${c.name}</p><span class="text-[10px] text-zinc-500 font-mono">ID: ${c.id.substring(0, 10)}</span></div>
        </td>
        <td class="py-3 px-4"><a href="https://wa.me/${c.phone}" target="_blank" class="text-xs text-emerald-400 font-bold hover:underline">📞 ${c.phone || 'Sin tel'}</a></td>
        <td class="py-3 px-4 font-mono font-bold text-indigo-300">${c.totalVisits} ${c.totalVisits === 1 ? 'cita' : 'citas'}</td>
        <td class="py-3 px-4 font-bold text-emerald-400">$${c.totalSpent.toLocaleString('es-AR')}</td>
        <td class="py-3 px-4 font-mono text-zinc-400 text-xs">${c.lastVisit || 'N/A'}</td>
        <td class="py-3 px-4 text-right">
          <button onclick="AdminL3Clients.openHistoryModal('${c.id}')" class="px-3 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all">📋 Ver Historial</button>
        </td>
      </tr>`).join('');

    container.innerHTML = `
      <div class="space-y-5">
        <!-- Métricas CRM -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="p-4 bg-zinc-900/80 border border-zinc-800 rounded-3xl"><p class="text-[10px] uppercase font-bold text-zinc-400">Total Clientes Únicos</p><p class="text-xl font-bold text-white">${totalClients}</p></div>
          <div class="p-4 bg-indigo-950/40 border border-indigo-500/20 rounded-3xl"><p class="text-[10px] uppercase font-bold text-indigo-400">Clientes Frecuentes (≥ 3 citas)</p><p class="text-xl font-bold text-indigo-300">${vipClients}</p></div>
          <div class="p-4 bg-emerald-950/40 border border-emerald-500/20 rounded-3xl"><p class="text-[10px] uppercase font-bold text-emerald-400">Volumen Facturado Acumulado</p><p class="text-xl font-bold text-emerald-300">$${globalRevenue.toLocaleString('es-AR')}</p></div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-zinc-800">
          <div>
            <h2 class="text-base font-bold text-white flex items-center gap-2"><span>👤 Directorio CRM de Clientes</span><span class="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">${filteredClients.length} registros</span></h2>
            <p class="text-xs text-zinc-400">Historial completo, fidelización y seguimiento individual por cliente.</p>
          </div>
          <input type="text" placeholder="Buscar por nombre o teléfono..." value="${searchClientTerm}" oninput="AdminL3Clients.setSearch(this.value)" class="bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl text-xs text-zinc-200 outline-none w-56 sm:w-72 focus:border-indigo-500">
        </div>

        <div class="bg-zinc-900/60 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
          <table class="w-full text-left">
            <thead class="bg-zinc-950/70 border-b border-zinc-800 text-[11px] text-zinc-400 uppercase font-semibold">
              <tr><th class="py-3 px-4">Cliente</th><th class="py-3 px-4">Teléfono / WhatsApp</th><th class="py-3 px-4">Citas Asistidas</th><th class="py-3 px-4">Gasto Total</th><th class="py-3 px-4">Última Visita</th><th class="py-3 px-4 text-right">Historial</th></tr>
            </thead>
            <tbody>${rows.length > 0 ? rows : `<tr><td colspan="6" class="p-8 text-center text-zinc-500 italic">No hay clientes registrados en las reservas</td></tr>`}</tbody>
          </table>
        </div>
      </div>`;
  }

  function setSearch(term) { searchClientTerm = term; window.AdminL3Core.renderActiveView(); }

  function openHistoryModal(clientId) {
    const modal = document.getElementById('admin-modal-root');
    if (!modal) return;
    const bookings = (window.AdminL3Core.state.bookings || []).filter(b => {
      const key = (b.phone || b.client || 'anon').replace(/\D/g, '') || b.client;
      return key === clientId;
    }).sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));

    const clientName = bookings[0]?.client || 'Cliente';
    const clientPhone = bookings[0]?.phone || '';

    const historyRows = bookings.map(b => `
      <div class="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1 text-xs">
        <div class="flex items-center justify-between">
          <span class="font-mono font-bold text-indigo-300">📅 ${b.date} - ${b.time} hs</span>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${b.status==='CANCELLED'?'bg-rose-950 text-rose-300':'bg-emerald-950 text-emerald-300'}">${b.status || 'CONFIRMED'}</span>
        </div>
        <div class="flex items-center justify-between text-zinc-300">
          <span>${b.serviceName} con <b>${b.staffName}</b></span>
          <span class="font-bold text-emerald-400">$${(b.price||0).toLocaleString('es-AR')}</span>
        </div>
      </div>`).join('');

    modal.innerHTML = `
      <div class="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-2xl text-xs max-h-[85vh] overflow-y-auto hide-scrollbar">
        <div class="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div><h3 class="font-bold text-sm text-white">📋 Historial de ${clientName}</h3><p class="text-zinc-400 text-[11px]">📞 ${clientPhone} · ${bookings.length} turnos registrados</p></div>
          <button onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="text-zinc-400 hover:text-white">✕</button>
        </div>
        <div class="space-y-2 max-h-80 overflow-y-auto pr-1 hide-scrollbar">${historyRows}</div>
        <div class="pt-2 border-t border-zinc-800">
          <button onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="w-full py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-bold">Cerrar Historial</button>
        </div>
      </div>`;
    modal.classList.remove('hidden');
  }

  return { render, setSearch, openHistoryModal };
})();
