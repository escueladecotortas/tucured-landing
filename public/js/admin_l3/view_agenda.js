// Archivo: public/js/admin_l3/view_agenda.js
/**
 * 📅 NEXUS ADMIN L3: VISTA DE AGENDA MULTI-STAFF & TABULAR
 * - Grilla multi-columna de profesionales + vista alternativa DesktopTable
 * - Filtros rápidos por estado, buscador reactivo y métricas/stats diarias
 * - Modal de sobreturno y disparador de WhatsApp con template editable
 */

window.AdminL3Agenda = (function () {
  let viewMode = 'grid', filterStatus = 'ALL', searchTerm = '';
  const statusColors = { CONFIRMED: 'bg-emerald-950 text-emerald-300 border-emerald-500/30', ATTENDED: 'bg-blue-950 text-blue-300 border-blue-500/30', CANCELLED: 'bg-rose-950 text-rose-300 border-rose-500/30', NO_SHOW: 'bg-amber-950 text-amber-300 border-amber-500/30' };

  function render(container, state) {
    const activeStaff = (state.staff || []).filter(s => s.active !== false);
    const dayBookings = (state.bookings || []).filter(b => b.date === state.selectedDate && (b.rubroId === state.rubro || !b.rubroId));
    const isSalud = state.rubro === 'salud_consultorio', totalCount = dayBookings.length;
    const confirmedCount = dayBookings.filter(b => b.status === 'CONFIRMED' || !b.status).length;
    const attendedCount = dayBookings.filter(b => b.status === 'ATTENDED').length;
    const totalRevenue = dayBookings.filter(b => b.status !== 'CANCELLED').reduce((acc, b) => acc + (b.price || 0), 0);

    const filteredBks = dayBookings.filter(b => {
      const matchStatus = filterStatus === 'ALL' || b.status === filterStatus;
      const matchSearch = !searchTerm || (b.client || '').toLowerCase().includes(searchTerm.toLowerCase()) || (b.phone || '').includes(searchTerm);
      return matchStatus && matchSearch;
    });

    const headerHtml = `
      <div class="space-y-4 pb-2 border-b border-zinc-800/80">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="p-3 bg-zinc-900/80 border border-zinc-800 rounded-2xl"><p class="text-[10px] uppercase font-bold text-zinc-400">Total Turnos</p><p class="text-lg font-bold text-white">${totalCount}</p></div>
          <div class="p-3 bg-emerald-950/40 border border-emerald-500/20 rounded-2xl"><p class="text-[10px] uppercase font-bold text-emerald-400">Confirmados</p><p class="text-lg font-bold text-emerald-300">${confirmedCount}</p></div>
          <div class="p-3 bg-blue-950/40 border border-blue-500/20 rounded-2xl"><p class="text-[10px] uppercase font-bold text-blue-400">Atendidos</p><p class="text-lg font-bold text-blue-300">${attendedCount}</p></div>
          <div class="p-3 bg-indigo-950/40 border border-indigo-500/20 rounded-2xl"><p class="text-[10px] uppercase font-bold text-indigo-400">Recaudación</p><p class="text-lg font-bold text-indigo-300">$${totalRevenue.toLocaleString('es-AR')}</p></div>
        </div>
        <div class="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div class="flex items-center gap-2">
            <div class="flex bg-zinc-900 border border-zinc-800 p-1 rounded-xl text-xs font-bold">
              <button onclick="AdminL3Agenda.setViewMode('grid')" class="px-2.5 py-1 rounded-lg ${viewMode==='grid'?'bg-indigo-600 text-white':'text-zinc-400'}">⊞ Grilla</button>
              <button onclick="AdminL3Agenda.setViewMode('table')" class="px-2.5 py-1 rounded-lg ${viewMode==='table'?'bg-indigo-600 text-white':'text-zinc-400'}">☰ Tabla</button>
            </div>
            <select onchange="AdminL3Agenda.setFilterStatus(this.value)" class="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs px-2.5 py-1.5 rounded-xl font-semibold outline-none">
              <option value="ALL" ${filterStatus==='ALL'?'selected':''}>Todos</option><option value="CONFIRMED" ${filterStatus==='CONFIRMED'?'selected':''}>Confirmados</option><option value="ATTENDED" ${filterStatus==='ATTENDED'?'selected':''}>Atendidos</option><option value="CANCELLED" ${filterStatus==='CANCELLED'?'selected':''}>Cancelados</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <input type="text" placeholder="Buscar..." value="${searchTerm}" oninput="AdminL3Agenda.setSearch(this.value)" class="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl text-xs text-zinc-200 outline-none w-40 sm:w-52">
            <button onclick="AdminL3Agenda.openSobreturnoModal()" class="py-1.5 px-3 rounded-xl bg-emerald-600 text-white font-bold text-xs">➕ Sobreturno</button>
          </div>
        </div>
      </div>`;

    let bodyHtml = '';
    if (viewMode === 'grid') {
      const gridColumns = activeStaff.map(staff => {
        const staffBks = filteredBks.filter(b => b.staffId === staff.id || (b.staffId === 'any' && b.staffName === staff.name)).sort((a, b) => a.time.localeCompare(b.time));
        const cardsHtml = staffBks.length === 0
          ? `<div class="p-4 text-center text-zinc-500 text-xs italic bg-zinc-950/40 rounded-2xl border border-dashed border-zinc-800/80 my-2">Sin turnos</div>`
          : staffBks.map(b => `
            <div class="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-1.5 shadow-md">
              <div class="flex items-center justify-between"><span class="font-mono font-bold text-xs text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded-lg border border-indigo-500/20">⏰ ${b.time} hs</span><select onchange="AdminL3Agenda.changeStatus('${b.id}', this.value)" class="text-[10px] font-bold px-1 py-0.5 rounded border outline-none ${statusColors[b.status] || statusColors.CONFIRMED}"><option value="CONFIRMED" ${b.status==='CONFIRMED'?'selected':''}>Confirmado</option><option value="ATTENDED" ${b.status==='ATTENDED'?'selected':''}>Atendido</option><option value="CANCELLED" ${b.status==='CANCELLED'?'selected':''}>Cancelado</option><option value="NO_SHOW" ${b.status==='NO_SHOW'?'selected':''}>Ausente</option></select></div>
              <div><p class="font-bold text-xs text-zinc-100">${b.client || 'Cliente'}</p><p class="text-[11px] text-zinc-400">${b.serviceName} (${b.duration || 30}m)</p>${(isSalud && b.insurance) ? `<p class="text-[11px] text-sky-400 font-medium">🩺 ${b.insurance}</p>` : ''}</div>
              <div class="flex items-center justify-between pt-1 border-t border-zinc-800/60 text-[11px]"><span class="font-mono text-zinc-500 text-[10px]">#${b.id}</span><div class="flex items-center gap-1.5"><button onclick="AdminL3Agenda.openWhatsAppModal('${b.id}')" class="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/40 text-[10px] font-bold">💬 WA</button><button onclick="AdminL3Agenda.deleteBooking('${b.id}')" class="text-zinc-500 hover:text-rose-400 text-xs">✕</button></div></div>
            </div>`).join('');

        return `
          <div class="flex flex-col bg-zinc-900/50 rounded-3xl border border-zinc-800/80 p-3.5 space-y-2.5 min-w-[260px] flex-1">
            <div class="flex items-center justify-between pb-2 border-b border-zinc-800"><div class="flex items-center gap-2"><div class="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center text-sm">${staff.photo || '👤'}</div><div><h3 class="font-bold text-xs text-white truncate">${staff.name}</h3><p class="text-[10px] text-zinc-400 truncate">${staff.role}</p></div></div><button onclick="AdminL3Agenda.openSobreturnoModal('${staff.id}')" class="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-300 text-xs flex items-center justify-center">+</button></div>
            <div class="space-y-2 max-h-[550px] overflow-y-auto pr-1 hide-scrollbar">${cardsHtml}</div>
          </div>`;
      }).join('');
      bodyHtml = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-x-auto pb-4">${gridColumns}</div>`;
    } else {
      const rows = filteredBks.sort((a,b) => a.time.localeCompare(b.time)).map(b => `
        <tr class="border-b border-zinc-800/60 hover:bg-zinc-900/40 text-xs"><td class="py-3 px-4 font-mono font-bold text-indigo-300">${b.time} hs</td><td class="py-3 px-4"><p class="font-bold text-zinc-100">${b.client || 'Cliente'}</p><a href="https://wa.me/${b.phone}" target="_blank" class="text-[10px] text-emerald-400 hover:underline">📞 ${b.phone}</a></td><td class="py-3 px-4"><p class="text-zinc-200 font-semibold">${b.serviceName}</p><span class="text-[10px] text-zinc-400">${b.staffName}</span></td><td class="py-3 px-4 font-bold text-zinc-100">$${(b.price||0).toLocaleString('es-AR')}</td><td class="py-3 px-4"><select onchange="AdminL3Agenda.changeStatus('${b.id}', this.value)" class="text-[10px] font-bold px-1.5 py-0.5 rounded border ${statusColors[b.status]||statusColors.CONFIRMED}"><option value="CONFIRMED" ${b.status==='CONFIRMED'?'selected':''}>Confirmado</option><option value="ATTENDED" ${b.status==='ATTENDED'?'selected':''}>Atendido</option><option value="CANCELLED" ${b.status==='CANCELLED'?'selected':''}>Cancelado</option></select></td><td class="py-3 px-4 text-right"><button onclick="AdminL3Agenda.openWhatsAppModal('${b.id}')" class="px-2 py-1 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold">💬 WA</button></td></tr>`).join('');
      bodyHtml = `<div class="bg-zinc-900/60 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl mt-2"><table class="w-full text-left"><thead class="bg-zinc-950/70 border-b border-zinc-800 text-[11px] text-zinc-400 uppercase font-semibold"><tr><th class="py-3 px-4">Horario</th><th class="py-3 px-4">Cliente</th><th class="py-3 px-4">Servicio & Staff</th><th class="py-3 px-4">Precio</th><th class="py-3 px-4">Estado</th><th class="py-3 px-4 text-right">Acción</th></tr></thead><tbody>${rows}</tbody></table></div>`;
    }
    container.innerHTML = headerHtml + bodyHtml;
  }

  function setViewMode(m) { viewMode = m; window.AdminL3Core.renderActiveView(); }
  function setFilterStatus(s) { filterStatus = s; window.AdminL3Core.renderActiveView(); }
  function setSearch(v) { searchTerm = v; window.AdminL3Core.renderActiveView(); }

  function changeStatus(id, newStatus) {
    const bookings = window.AdminL3Core.getStorage('tucu_l3_bookings', []);
    const idx = bookings.findIndex(b => b.id === id);
    if (idx !== -1) {
      bookings[idx].status = newStatus;
      window.AdminL3Core.setStorage('tucu_l3_bookings', bookings);
      window.AdminL3Core.state.bookings = bookings;
      window.AdminL3Core.renderActiveView();
    }
  }

  function deleteBooking(id) {
    if (!confirm(`¿Eliminar la reserva #${id}?`)) return;
    const bookings = window.AdminL3Core.getStorage('tucu_l3_bookings', []).filter(b => b.id !== id);
    window.AdminL3Core.setStorage('tucu_l3_bookings', bookings);
    window.AdminL3Core.state.bookings = bookings;
    window.AdminL3Core.renderActiveView();
  }

  function openSobreturnoModal(preselectedStaffId = null) {
    const modal = document.getElementById('admin-modal-root');
    if (!modal) return;
    const state = window.AdminL3Core.state;
    const staffOptions = state.staff.filter(s => s.active !== false).map(s => `<option value="${s.id}" ${s.id===preselectedStaffId?'selected':''}>${s.name} (${s.role})</option>`).join('');
    const srvOptions = state.services.map(s => `<option value="${s.id}">${s.name} - $${s.price || 0} (${s.duration || 30}m)</option>`).join('');
    const isSalud = state.rubro === 'salud_consultorio';

    modal.innerHTML = `
      <div class="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-3 shadow-2xl text-xs">
        <div class="flex items-center justify-between pb-2 border-b border-zinc-800"><h3 class="font-bold text-white">➕ Sobreturno</h3><button onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="text-zinc-400 hover:text-white">✕</button></div>
        <div class="space-y-2">
          <div><label class="block text-zinc-400 mb-1">Profesional:</label><select id="mbk-staff" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-200 outline-none">${staffOptions}</select></div>
          <div><label class="block text-zinc-400 mb-1">Servicio:</label><select id="mbk-srv" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-200 outline-none">${srvOptions}</select></div>
          <div class="grid grid-cols-2 gap-2"><div><label class="block text-zinc-400 mb-1">Hora:</label><input type="text" id="mbk-time" value="10:00" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-200 font-mono outline-none"></div><div><label class="block text-zinc-400 mb-1">Teléfono:</label><input type="tel" id="mbk-phone" placeholder="3811234567" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-200 outline-none"></div></div>
          <div><label class="block text-zinc-400 mb-1">Cliente:</label><input type="text" id="mbk-client" placeholder="Juan Pérez" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-200 outline-none"></div>
          ${isSalud ? `<div><label class="block text-sky-400 mb-1">Obra Social:</label><input type="text" id="mbk-ins" placeholder="OSDE" class="w-full bg-zinc-950 border border-sky-600/40 rounded-xl p-2 text-zinc-200 outline-none"></div>` : ''}
        </div>
        <div class="flex gap-2 pt-2"><button onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="w-1/3 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-bold">Cancelar</button><button onclick="AdminL3Agenda.saveSobreturno()" class="w-2/3 py-2 rounded-xl bg-emerald-600 text-white font-bold">Agendar</button></div>
      </div>`;
    modal.classList.remove('hidden');
  }

  function saveSobreturno() {
    const staffId = document.getElementById('mbk-staff')?.value, srvId = document.getElementById('mbk-srv')?.value;
    const time = document.getElementById('mbk-time')?.value || '10:00', phone = (document.getElementById('mbk-phone')?.value || '5493815551234').replace(/\D/g, '');
    const client = document.getElementById('mbk-client')?.value || 'Cliente Sobreturno', insurance = document.getElementById('mbk-ins')?.value || '';
    const state = window.AdminL3Core.state, staffObj = state.staff.find(s => s.id === staffId), srvObj = state.services.find(s => s.id === srvId);

    const newBooking = { id: 'TK-' + Math.random().toString(36).substring(2, 6).toUpperCase(), rubroId: state.rubro, staffId, staffName: staffObj ? staffObj.name : 'Profesional', serviceId: srvId, serviceName: srvObj ? srvObj.name : 'Servicio', duration: srvObj ? srvObj.duration : 30, price: srvObj ? srvObj.price : 0, date: state.selectedDate, time, client, phone, insurance, status: 'CONFIRMED', createdAt: new Date().toISOString() };
    const bookings = window.AdminL3Core.getStorage('tucu_l3_bookings', []);
    bookings.push(newBooking);
    window.AdminL3Core.setStorage('tucu_l3_bookings', bookings);
    window.AdminL3Core.state.bookings = bookings;
    window.AdminL3Core.playDingSound();
    document.getElementById('admin-modal-root')?.classList.add('hidden');
    window.AdminL3Core.renderActiveView();
  }

  function openWhatsAppModal(bookingId) {
    const b = window.AdminL3Core.getStorage('tucu_l3_bookings', []).find(x => x.id === bookingId);
    if (!b) return;
    const modal = document.getElementById('admin-modal-root');
    if (!modal) return;
    const defaultMsg = `¡Hola ${b.client}! Te confirmamos tu turno en Nexus L3 el día ${b.date} a las ${b.time} hs con ${b.staffName} para ${b.serviceName} (ID: #${b.id}).`;

    modal.innerHTML = `
      <div class="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-3 shadow-2xl text-xs">
        <div class="flex items-center justify-between pb-2 border-b border-zinc-800"><h3 class="font-bold text-white">💬 Despachar WhatsApp</h3><button onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="text-zinc-400 hover:text-white">✕</button></div>
        <div><label class="block text-zinc-400 mb-1">Destinatario:</label><input readonly value="${b.client} (${b.phone})" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-300 font-bold"></div>
        <div><label class="block text-zinc-400 mb-1">Mensaje Editable:</label><textarea id="wa-modal-msg" rows="4" class="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-200 outline-none">${defaultMsg}</textarea></div>
        <div class="flex gap-2 pt-2"><button onclick="document.getElementById('admin-modal-root').classList.add('hidden')" class="w-1/3 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-bold">Cerrar</button><button onclick="AdminL3Agenda.dispatchWhatsApp('${b.phone}')" class="w-2/3 py-2 rounded-xl bg-emerald-600 text-white font-bold">🚀 Enviar WhatsApp</button></div>
      </div>`;
    modal.classList.remove('hidden');
  }

  async function dispatchWhatsApp(phone) {
    const msg = document.getElementById('wa-modal-msg')?.value || '';
    try {
      const res = await fetch('/api/wa/send-booking', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone, message: msg }) });
      const data = await res.json();
      if (data.success) alert('✅ Mensaje despachado.');
      else window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    } catch (e) {
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    }
    document.getElementById('admin-modal-root')?.classList.add('hidden');
  }

  return { render, setViewMode, setFilterStatus, setSearch, changeStatus, deleteBooking, openSobreturnoModal, saveSobreturno, openWhatsAppModal, dispatchWhatsApp };
})();
