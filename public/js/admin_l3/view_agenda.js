// Archivo: public/js/admin_l3/view_agenda.js
/**
 * 📅 NEXUS ADMIN L3: VISTA DE AGENDA MULTI-STAFF & RECURSOS FÍSICOS (< 175 líneas)
 * - Grilla dual interactiva: Por Especialista vs. Por Recurso Físico
 * - Telemetría visual en vivo Daemon Cron T-2hs, métricas y modal de sobreturno
 */

window.AdminL3Agenda = (function () {
  let viewTarget = 'staff', viewMode = 'grid', filterStatus = 'ALL', searchTerm = '';
  const statusStyles = {
    CONFIRMED: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    ATTENDED: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    RELEASED: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    CANCELLED: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800'
  };

  function render(container, state) {
    const activeStaff = (state.staff || []).filter(s => s.active !== false);
    const activeResources = (state.resources || []).filter(r => r.active !== false);
    const dayBookings = (state.bookings || []).filter(b => b.date === state.selectedDate && (b.rubroId === state.rubro || !b.rubroId));
    const totalCount = dayBookings.length, confirmedCount = dayBookings.filter(b => b.status === 'CONFIRMED' || !b.status).length;
    const releasedCount = dayBookings.filter(b => b.status === 'RELEASED').length;
    const totalRevenue = dayBookings.filter(b => b.status !== 'CANCELLED' && b.status !== 'RELEASED').reduce((acc, b) => acc + (b.price || 0), 0);

    const filteredBks = dayBookings.filter(b => {
      const matchStatus = filterStatus === 'ALL' || b.status === filterStatus;
      const matchSearch = !searchTerm || (b.client || '').toLowerCase().includes(searchTerm.toLowerCase()) || (b.id || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    });

    const telem = state.telemetry || { daemonStatus: 'ACTIVE', lastSweep: 'Hace 4m', inspected: 18, confirmed: 16, released: 2 };
    const headerHtml = `
      <div class="space-y-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div class="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50 via-white to-slate-50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900 border border-indigo-100 dark:border-indigo-900/40 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div class="flex items-center gap-2.5">
            <span class="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping"></span>
            <div>
              <p class="text-xs font-bold text-slate-900 dark:text-slate-100">⚡ Daemon Cron T-2hs: <span class="text-indigo-600 dark:text-indigo-400 font-mono">${telem.daemonStatus}</span> <span class="text-[11px] font-normal text-slate-500">· Última pasada: <strong>${telem.lastSweep}</strong></span></p>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">Inspeccionados: <strong>${telem.inspected}</strong> | Confirmados: <strong class="text-emerald-600">${telem.confirmed}</strong> | Liberados por inasistencia: <strong class="text-amber-600">${telem.released}</strong></p>
            </div>
          </div>
          <button onclick="AdminL3Core.executeCronSweep()" class="py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"><span>⚡</span><span>Ejecutar Barrido Ahora</span></button>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs"><p class="text-[10px] uppercase font-bold text-slate-500">Total Turnos</p><p class="text-lg font-bold text-slate-900 dark:text-slate-100">${totalCount}</p></div>
          <div class="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl shadow-xs"><p class="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">Confirmados</p><p class="text-lg font-bold text-emerald-700 dark:text-emerald-300">${confirmedCount}</p></div>
          <div class="p-3.5 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-2xl shadow-xs"><p class="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">Liberados (Cron)</p><p class="text-lg font-bold text-amber-700 dark:text-amber-300">${releasedCount}</p></div>
          <div class="p-3.5 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 rounded-2xl shadow-xs"><p class="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-400">Recaudación Estimada</p><p class="text-lg font-bold text-indigo-700 dark:text-indigo-300">$${totalRevenue.toLocaleString('es-AR')}</p></div>
        </div>
        <div class="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div class="flex items-center gap-2 flex-wrap">
            <div class="flex bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl text-xs font-bold">
              <button onclick="AdminL3Agenda.setViewTarget('staff')" class="px-2.5 py-1 rounded-lg transition-all ${viewTarget==='staff'?'bg-indigo-600 text-white shadow-xs':'text-slate-600 dark:text-slate-400'}">👥 Por Especialista</button>
              <button onclick="AdminL3Agenda.setViewTarget('resource')" class="px-2.5 py-1 rounded-lg transition-all ${viewTarget==='resource'?'bg-indigo-600 text-white shadow-xs':'text-slate-600 dark:text-slate-400'}">🏟️ Por Recurso Físico</button>
            </div>
            <div class="flex bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl text-xs font-bold">
              <button onclick="AdminL3Agenda.setViewMode('grid')" class="px-2 py-1 rounded-lg ${viewMode==='grid'?'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs':'text-slate-600 dark:text-slate-400'}">⊞</button>
              <button onclick="AdminL3Agenda.setViewMode('table')" class="px-2 py-1 rounded-lg ${viewMode==='table'?'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs':'text-slate-600 dark:text-slate-400'}">☰</button>
            </div>
            <select onchange="AdminL3Agenda.setFilterStatus(this.value)" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs px-2.5 py-1.5 rounded-xl font-semibold outline-none shadow-xs">
              <option value="ALL" ${filterStatus==='ALL'?'selected':''}>Todos los estados</option><option value="CONFIRMED" ${filterStatus==='CONFIRMED'?'selected':''}>Confirmados</option><option value="RELEASED" ${filterStatus==='RELEASED'?'selected':''}>Liberados (Cron T-2hs)</option><option value="ATTENDED" ${filterStatus==='ATTENDED'?'selected':''}>Atendidos</option><option value="CANCELLED" ${filterStatus==='CANCELLED'?'selected':''}>Cancelados</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <input type="text" placeholder="Buscar cliente o #TK..." value="${searchTerm}" oninput="AdminL3Agenda.setSearch(this.value)" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-800 dark:text-slate-100 outline-none w-44 sm:w-56 shadow-xs">
            <button onclick="AdminL3Agenda.openSobreturnoModal()" class="py-1.5 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1 cursor-pointer"><span>➕</span><span>Sobreturno</span></button>
          </div>
        </div>
      </div>`;

    const columns = viewTarget === 'staff' ? activeStaff : activeResources;
    let bodyHtml = '';

    if (viewMode === 'grid') {
      const gridColumns = columns.map(item => {
        const itemBks = filteredBks.filter(b => (viewTarget === 'staff' ? b.staffId === item.id : b.resourceId === item.id)).sort((a,b) => a.time.localeCompare(b.time));
        const cardsHtml = itemBks.length === 0
          ? `<div class="p-4 text-center text-slate-400 text-xs italic bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 my-2">Sin reservas</div>`
          : itemBks.map(b => `
            <div class="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-xs">
              <div class="flex items-center justify-between"><span class="font-mono font-bold text-xs text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-800">⏰ ${b.time} hs</span><span class="text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusStyles[b.status] || statusStyles.CONFIRMED}">${b.status === 'RELEASED' ? '⚡ Liberado' : (b.status || 'Confirmado')}</span></div>
              <div><p class="font-bold text-xs text-slate-900 dark:text-slate-100">${b.client || 'Cliente'}</p><p class="text-[11px] text-slate-500 dark:text-slate-400">${b.serviceName} (${b.duration || 30}m)</p><p class="text-[10px] font-semibold text-slate-600 dark:text-slate-300 mt-0.5">${viewTarget === 'staff' ? `🏟️ ${b.resourceName || 'Recurso'}` : `👤 ${b.staffName || 'Staff'}`}</p></div>
              <div class="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]"><span class="font-mono text-slate-400 text-[10px]">#${b.id}</span><div class="flex items-center gap-1.5"><button onclick="AdminL3Agenda.openWhatsAppModal('${b.id}')" class="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold">💬 WA</button><button onclick="AdminL3Agenda.deleteBooking('${b.id}')" class="text-slate-400 hover:text-rose-500 text-xs">✕</button></div></div>
            </div>`).join('');

        return `
          <div class="flex flex-col bg-slate-100/60 dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800 p-3.5 space-y-2.5 min-w-[270px] flex-1">
            <div class="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800"><div class="flex items-center gap-2"><div class="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-sm shadow-xs">${item.photo || item.icon || '📌'}</div><div><h3 class="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">${item.name}</h3><p class="text-[10px] text-slate-500 dark:text-slate-400 truncate">${item.role || item.type}</p></div></div><button onclick="AdminL3Agenda.openSobreturnoModal('${viewTarget==='staff'?item.id:''}', '${viewTarget==='resource'?item.id:''}')" class="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold shadow-xs cursor-pointer">+</button></div>
            <div class="space-y-2 max-h-[550px] overflow-y-auto pr-1 hide-scrollbar">${cardsHtml}</div>
          </div>`;
      }).join('');
      bodyHtml = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-x-auto pb-4">${gridColumns}</div>`;
    } else {
      const rows = filteredBks.sort((a,b) => a.time.localeCompare(b.time)).map(b => `
        <tr class="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-xs">
          <td class="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">${b.time} hs</td>
          <td class="py-3 px-4"><p class="font-bold text-slate-800 dark:text-slate-100">${b.client || 'Cliente'}</p><span class="text-[10px] text-slate-500">📞 ${b.phone}</span></td>
          <td class="py-3 px-4"><p class="text-slate-800 dark:text-slate-200 font-semibold">${b.serviceName}</p><span class="text-[10px] text-slate-500">${b.staffName} · ${b.resourceName || 'Recurso'}</span></td>
          <td class="py-3 px-4 font-bold text-slate-800 dark:text-slate-100">$${(b.price||0).toLocaleString('es-AR')}</td>
          <td class="py-3 px-4"><span class="text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusStyles[b.status]||statusStyles.CONFIRMED}">${b.status === 'RELEASED' ? '⚡ Liberado' : (b.status||'Confirmado')}</span></td>
          <td class="py-3 px-4 text-right"><button onclick="AdminL3Agenda.openWhatsAppModal('${b.id}')" class="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold">💬 WA</button></td>
        </tr>`).join('');
      bodyHtml = `<div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs mt-2"><table class="w-full text-left"><thead class="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 uppercase font-semibold"><tr><th class="py-3 px-4">Horario</th><th class="py-3 px-4">Cliente</th><th class="py-3 px-4">Servicio, Staff & Espacio</th><th class="py-3 px-4">Precio</th><th class="py-3 px-4">Estado</th><th class="py-3 px-4 text-right">Acción</th></tr></thead><tbody>${rows}</tbody></table></div>`;
    }
    container.innerHTML = headerHtml + bodyHtml;
  }

  function setViewTarget(t) { viewTarget = t; window.AdminL3Core.renderActiveView(); }
  function setViewMode(m) { viewMode = m; window.AdminL3Core.renderActiveView(); }
  function setFilterStatus(s) { filterStatus = s; window.AdminL3Core.renderActiveView(); }
  function setSearch(v) { searchTerm = v; window.AdminL3Core.renderActiveView(); }

  function deleteBooking(id) {
    if (!confirm(`¿Eliminar la reserva #${id}?`)) return;
    const bookings = window.AdminL3Core.getStorage('tucu_l3_bookings', []).filter(b => b.id !== id);
    window.AdminL3Core.setStorage('tucu_l3_bookings', bookings);
    window.AdminL3Core.state.bookings = bookings;
    window.AdminL3Core.renderActiveView();
  }

  function openSobreturnoModal(preselectedStaffId = '', preselectedResId = '') {
    const modal = document.getElementById('admin-modal-root'); if (!modal) return;
    const state = window.AdminL3Core.state;
    const staffOpts = state.staff.filter(s => s.active !== false).map(s => `<option value="${s.id}" ${s.id===preselectedStaffId?'selected':''}>${s.name} (${s.role})</option>`).join('');
    const resOpts = state.resources.filter(r => r.active !== false).map(r => `<option value="${r.id}" ${r.id===preselectedResId?'selected':''}>${r.name} (${r.type})</option>`).join('');
    const srvOpts = state.services.map(s => `<option value="${s.id}">${s.name} - $${s.price || 0}</option>`).join('');

    modal.innerHTML = `
      <div class="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3 shadow-2xl text-xs">
        <div class="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800"><h3 class="font-bold text-slate-900 dark:text-slate-100 text-sm">➕ Cargar Sobreturno Dual</h3><button onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="text-slate-400">✕</button></div>
        <div class="space-y-2">
          <div><label class="block text-slate-500 mb-1 font-semibold">1. Especialista:</label><select id="mbk-staff" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-slate-800 dark:text-slate-200 outline-none">${staffOpts}</select></div>
          <div><label class="block text-slate-500 mb-1 font-semibold">2. Recurso Físico:</label><select id="mbk-resource" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-slate-800 dark:text-slate-200 outline-none">${resOpts}</select></div>
          <div><label class="block text-slate-500 mb-1 font-semibold">3. Servicio:</label><select id="mbk-srv" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-slate-800 dark:text-slate-200 outline-none">${srvOpts}</select></div>
          <div class="grid grid-cols-2 gap-2"><div><label class="block text-slate-500 mb-1 font-semibold">Hora:</label><input type="text" id="mbk-time" value="11:30" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 font-mono outline-none"></div><div><label class="block text-slate-500 mb-1 font-semibold">WhatsApp:</label><input type="tel" id="mbk-phone" value="3815554321" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 outline-none"></div></div>
          <div><label class="block text-slate-500 mb-1 font-semibold">Cliente:</label><input type="text" id="mbk-client" value="Martín Rodríguez" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 outline-none"></div>
        </div>
        <div class="flex gap-2 pt-2"><button onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="w-1/3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">Cancelar</button><button onclick="AdminL3Agenda.saveSobreturno()" class="w-2/3 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700">Confirmar Turno</button></div>
      </div>`;
    modal.classList.remove('hidden');
  }

  function saveSobreturno() {
    const staffId = document.getElementById('mbk-staff')?.value, resId = document.getElementById('mbk-resource')?.value, srvId = document.getElementById('mbk-srv')?.value;
    const time = document.getElementById('mbk-time')?.value || '11:30', phone = (document.getElementById('mbk-phone')?.value || '3815554321').replace(/\D/g, '');
    const client = document.getElementById('mbk-client')?.value || 'Cliente Sobreturno';
    const state = window.AdminL3Core.state, staffObj = state.staff.find(s => s.id === staffId), resObj = state.resources.find(r => r.id === resId), srvObj = state.services.find(s => s.id === srvId);
    const newBooking = { id: 'TK-' + Math.random().toString(36).substring(2, 6).toUpperCase(), rubroId: state.rubro, staffId, staffName: staffObj ? staffObj.name : 'Staff', resourceId: resId, resourceName: resObj ? resObj.name : 'Recurso', serviceId: srvId, serviceName: srvObj ? srvObj.name : 'Servicio', duration: srvObj ? srvObj.duration : 30, price: srvObj ? srvObj.price : 0, date: state.selectedDate, time, client, phone, status: 'CONFIRMED' };
    const bookings = window.AdminL3Core.getStorage('tucu_l3_bookings', []);
    bookings.push(newBooking);
    window.AdminL3Core.setStorage('tucu_l3_bookings', bookings);
    window.AdminL3Core.state.bookings = bookings;
    window.AdminL3Core.playDingSound();
    window.AdminL3Core.showToast(`Turno agendado en ${resObj?.name || 'Recurso'}`);
    document.getElementById('admin-modal-root')?.classList.add('hidden');
    window.AdminL3Core.renderActiveView();
  }

  function openWhatsAppModal(bookingId) {
    const b = window.AdminL3Core.getStorage('tucu_l3_bookings', []).find(x => x.id === bookingId); if (!b) return;
    const modal = document.getElementById('admin-modal-root'); if (!modal) return;
    const msg = `¡Hola ${b.client}! Te confirmamos tu turno en Nexus L3 el día ${b.date} a las ${b.time} hs con ${b.staffName} en ${b.resourceName || 'nuestro espacio'} para ${b.serviceName} (Comprobante: #${b.id}).`;
    modal.innerHTML = `
      <div class="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3.5 shadow-2xl text-xs">
        <div class="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800"><h3 class="font-bold text-slate-900 dark:text-slate-100 text-sm">💬 Notificación WhatsApp</h3><button onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="text-slate-400">✕</button></div>
        <div><label class="block text-slate-500 mb-1">Destinatario:</label><input readonly value="${b.client} (${b.phone})" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 font-bold text-slate-800 dark:text-slate-200"></div>
        <div><label class="block text-slate-500 mb-1">Mensaje:</label><textarea id="wa-modal-msg" rows="3" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-slate-800 dark:text-slate-200 outline-none">${msg}</textarea></div>
        <div class="flex gap-2 pt-2"><button onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="w-1/3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">Cerrar</button><button onclick="window.AdminL3Core.showToast('Mensaje despachado'); document.getElementById('admin-modal-root').classList.add('hidden');" class="w-2/3 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700">🚀 Despachar</button></div>
      </div>`;
    modal.classList.remove('hidden');
  }

  return { render, setViewTarget, setViewMode, setFilterStatus, setSearch, deleteBooking, openSobreturnoModal, saveSobreturno, openWhatsAppModal };
})();
