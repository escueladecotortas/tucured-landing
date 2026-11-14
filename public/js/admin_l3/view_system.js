// Archivo: public/js/admin_l3/view_system.js
// Configuración, Feriados Dinámicos por Año, Soft-Delete & Bloqueos L3 (< 130 líneas)

window.AdminL3System = (function () {
  function render(container, state) {
    const svg = window.AdminL3Core.svg, config = state.config || { slotIntervalMinutes: 30, maxAdvanceDays: 14, maxActivePerUser: 2 };
    const holidays = (state.holidays || []).filter(h => !h.deletedAt);
    const blocks = (state.blocks || []).filter(b => !b.deletedAt);
    const services = (state.services || []).filter(s => (window.AdminShell ? window.AdminShell.isServiceAvailable(s) : !s.deletedAt && s.active !== false));
    const curYear = window.AdminHolidays ? window.AdminHolidays.getCurrentYear() : new Date().getFullYear();
    const today = window.AdminShell ? window.AdminShell.localTodayStr() : '';

    const holidayRows = holidays.map(h => `
      <tr class="border-b border-stone-100 dark:border-stone-800/60 text-xs">
        <td class="py-2.5 px-4 font-mono font-bold text-stone-800 dark:text-stone-200">${h.date}</td>
        <td class="py-2.5 px-4 font-bold text-stone-900 dark:text-stone-100">${h.desc}</td>
        <td class="py-2.5 px-4"><button onclick="AdminL3System.toggleHolidayException('${h.date}')" class="px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${h.isException ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}">${h.isException ? 'Excepción (Abierto)' : 'Cerrado'}</button></td>
        <td class="py-2.5 px-4 text-right"><button onclick="AdminL3System.deleteHoliday('${h.date}')" class="text-rose-500 hover:text-rose-700 cursor-pointer" title="Archivar">${svg('trash')}</button></td>
      </tr>`).join('');

    const blockRows = blocks.map(b => `
      <tr class="border-b border-stone-100 dark:border-stone-800/60 text-xs">
        <td class="py-2.5 px-4 font-bold text-red-900 dark:text-red-400">${b.serviceName}</td>
        <td class="py-2.5 px-4 font-mono text-stone-600 dark:text-stone-300">${b.date}</td>
        <td class="py-2.5 px-4 font-mono font-bold text-stone-800 dark:text-stone-200">${b.start} a ${b.end} hs</td>
        <td class="py-2.5 px-4 text-right"><button onclick="AdminL3System.deleteBlock('${b.id}')" class="text-rose-500 hover:text-rose-700 cursor-pointer" title="Archivar">${svg('trash')}</button></td>
      </tr>`).join('');

    const srvOptions = services.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    container.innerHTML = `<div class="space-y-6">
      <div class="admin-card space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-200 dark:border-stone-800">
          <div><h3 id="l3-holidays-label" class="font-bold text-sm text-stone-900 dark:text-stone-100 font-title flex items-center gap-2">${svg('cal')}<span>Feriados Nacionales ${curYear}</span></h3><p class="text-xs text-stone-500">Sincroniza feriados oficiales de Argentina (${curYear}) o bloquea fechas manuales.</p></div>
          <button onclick="AdminL3System.syncArgHolidays()" class="px-3.5 py-1.5 rounded-xl admin-glass-primary font-bold text-xs">Sincronizar Feriados ${curYear}</button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-2"><input type="date" id="new-hol-date" min="${today}" class="bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 text-xs outline-none"><input type="text" id="new-hol-desc" placeholder="Motivo (ej. Mantenimiento)..." class="sm:col-span-2 bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 text-xs outline-none"><button onclick="AdminL3System.addCustomHoliday()" class="py-2 px-3 rounded-xl admin-glass-btn font-bold text-xs flex items-center justify-center gap-1.5">${svg('plus')}<span>Bloquear Fecha</span></button></div>
        <div class="bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-2xl overflow-hidden max-h-48 overflow-y-auto hide-scrollbar"><table class="w-full text-left"><thead class="bg-stone-100 dark:bg-stone-900 text-[10px] text-stone-500 uppercase"><tr><th class="py-2 px-4">Fecha</th><th class="py-2 px-4">Motivo</th><th class="py-2 px-4">Estado</th><th class="py-2 px-4 text-right">Acción</th></tr></thead><tbody>${holidayRows || '<tr><td colspan="4" class="p-4 text-center text-stone-400 italic">Sin feriados cargados</td></tr>'}</tbody></table></div>
      </div>
      <div class="admin-card space-y-4">
        <div class="pb-3 border-b border-stone-200 dark:border-stone-800"><h3 class="font-bold text-sm text-stone-900 dark:text-stone-100 font-title flex items-center gap-2">${svg('lock')}<span>Bloqueo de Horarios por Prestación</span></h3><p class="text-xs text-stone-500">Inhabilita un servicio puntual en un rango horario específico.</p></div>
        <div class="grid grid-cols-1 sm:grid-cols-5 gap-2"><select id="sb-srv" class="bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 text-xs outline-none">${srvOptions || '<option value="">Sin servicios</option>'}</select><input type="date" id="sb-date" min="${today}" class="bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 text-xs outline-none"><input type="time" id="sb-start" value="12:00" class="bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 text-xs outline-none"><input type="time" id="sb-end" value="16:00" class="bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 text-xs outline-none"><button onclick="AdminL3System.addServiceBlock()" class="py-2 px-3 rounded-xl admin-glass-btn font-bold text-xs flex items-center justify-center gap-1.5">${svg('lock')}<span>Bloquear Rango</span></button></div>
        <div class="bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-2xl overflow-hidden max-h-40 overflow-y-auto hide-scrollbar"><table class="w-full text-left"><thead class="bg-stone-100 dark:bg-stone-900 text-[10px] text-stone-500 uppercase"><tr><th class="py-2 px-4">Servicio</th><th class="py-2 px-4">Fecha</th><th class="py-2 px-4">Horario</th><th class="py-2 px-4 text-right">Acción</th></tr></thead><tbody>${blockRows || '<tr><td colspan="4" class="p-4 text-center text-stone-400 italic">No hay bloqueos activos</td></tr>'}</tbody></table></div>
      </div>
      <div class="admin-card space-y-4">
        <div class="pb-3 border-b border-stone-200 dark:border-stone-800"><h3 class="font-bold text-sm text-stone-900 dark:text-stone-100 font-title">Parámetros Operativos del Negocio</h3><p class="text-xs text-stone-500">Configuración global de duración de turnos y ventanas de reserva.</p></div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3"><div><label class="block text-stone-500 text-xs mb-1 font-semibold">Intervalo de Slots (min):</label><input type="number" id="cfg-interval" min="5" max="480" value="${config.slotIntervalMinutes || 30}" class="w-full bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 text-xs font-mono outline-none"></div><div><label class="block text-stone-500 text-xs mb-1 font-semibold">Días Máx. Anticipación:</label><input type="number" id="cfg-days" value="${config.maxAdvanceDays || 14}" class="w-full bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 text-xs font-mono outline-none"></div><div><label class="block text-stone-500 text-xs mb-1 font-semibold">Límite Turnos por Cliente:</label><input type="number" id="cfg-maxuser" value="${config.maxActivePerUser || 2}" class="w-full bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 text-xs font-mono outline-none"></div></div>
        <button onclick="AdminL3System.saveConfig()" class="w-full py-3 rounded-2xl admin-glass-primary font-bold text-xs">Guardar Parámetros de Operación</button>
      </div>
      <div class="admin-card space-y-4"><div class="pb-3 border-b border-stone-200 dark:border-stone-800"><h3 class="font-bold text-sm text-stone-900 dark:text-stone-100 font-title">Señas & Medios de Pago Activos</h3><p class="text-xs text-stone-500">Define el porcentaje o monto fijo de seña, medios habilitados y base de práctica.</p></div><div id="l3-payment-config-mount"></div></div>
    </div>`;
    window.AdminBookingEngine?.mountPaymentConfigPanel({ mountId: 'l3-payment-config-mount', level: 'l3', includeDepositRule: true, onChange: () => window.AdminL3Core.showToast('Reglas de seña actualizadas'), onResetDemo: () => window.AdminL3Core.resetDemoBookings() });
  }

  function toggleHolidayException(date) { const h = (window.AdminL3Core.state.holidays || []).map(x => x.date === date ? { ...x, isException: !x.isException } : x); window.AdminL3Core.setStorage('tucu_l3_holidays', h); window.AdminL3Core.state.holidays = h; window.AdminL3Core.renderActiveView(); }
  function deleteHoliday(date) { const now = new Date().toISOString(); const h = (window.AdminL3Core.state.holidays || []).map(x => x.date === date ? { ...x, deletedAt: now } : x); window.AdminL3Core.setStorage('tucu_l3_holidays', h); window.AdminL3Core.state.holidays = h; window.AdminL3Core.showToast('Feriado archivado'); window.AdminL3Core.renderActiveView(); }

  function addCustomHoliday() {
    const date = document.getElementById('new-hol-date')?.value, desc = document.getElementById('new-hol-desc')?.value?.trim() || 'Cerrado';
    const today = window.AdminShell?.localTodayStr?.() || '';
    if (!date || (today && date < today)) return window.AdminL3Core.showToast('Selecciona una fecha válida (hoy o futura)', 'error');
    const h = window.AdminL3Core.state.holidays || []; h.push({ date, desc, isException: false });
    window.AdminL3Core.setStorage('tucu_l3_holidays', h); window.AdminL3Core.state.holidays = h; window.AdminL3Core.renderActiveView();
  }

  async function syncArgHolidays() {
    const year = window.AdminHolidays ? window.AdminHolidays.getCurrentYear() : new Date().getFullYear();
    const raw = window.AdminHolidays ? await window.AdminHolidays.loadHolidays(year) : [];
    const current = window.AdminL3Core.state.holidays || [];
    raw.forEach(h => {
      const date = h.fecha || h.date, desc = h.nombre || h.desc || 'Feriado Nacional';
      if (date && !current.some(x => x.date === date && !x.deletedAt)) current.push({ date, desc, isException: false });
    });
    current.sort((a, b) => a.date.localeCompare(b.date));
    window.AdminL3Core.setStorage('tucu_l3_holidays', current); window.AdminL3Core.state.holidays = current;
    window.AdminL3Core.showToast(`Feriados argentinos ${year} sincronizados`); window.AdminL3Core.renderActiveView();
  }

  function addServiceBlock() {
    const srvId = document.getElementById('sb-srv')?.value, date = document.getElementById('sb-date')?.value, start = document.getElementById('sb-start')?.value || '12:00', end = document.getElementById('sb-end')?.value || '16:00';
    const today = window.AdminShell?.localTodayStr?.() || '';
    if (!srvId || !date || (today && date < today)) return window.AdminL3Core.showToast('Completa servicio y fecha futura', 'error');
    const state = window.AdminL3Core.state, srv = state.services.find(s => s.id === srvId), blocks = state.blocks || [];
    blocks.push({ id: 'sb-' + Math.random().toString(36).substring(2, 6), serviceId: srvId, serviceName: srv ? srv.name : 'Servicio', date, start, end });
    window.AdminL3Core.setStorage(`tucu_l3_blocks_${state.rubro}`, blocks); state.blocks = blocks; window.AdminL3Core.renderActiveView();
  }

  function deleteBlock(id) {
    const state = window.AdminL3Core.state, now = new Date().toISOString();
    state.blocks = (state.blocks || []).map(b => b.id === id ? { ...b, deletedAt: now } : b);
    window.AdminL3Core.setStorage(`tucu_l3_blocks_${state.rubro}`, state.blocks); window.AdminL3Core.showToast('Bloqueo archivado'); window.AdminL3Core.renderActiveView();
  }

  function saveConfig() {
    const state = window.AdminL3Core.state;
    const iv = Math.min(480, Math.max(5, parseInt(document.getElementById('cfg-interval')?.value, 10) || 30));
    const config = { slotIntervalMinutes: iv, maxAdvanceDays: parseInt(document.getElementById('cfg-days')?.value, 10) || 14, maxActivePerUser: parseInt(document.getElementById('cfg-maxuser')?.value, 10) || 2 };
    window.AdminL3Core.setStorage(`tucu_l3_config_${state.rubro}`, config); state.config = config;
    window.AdminL3Core.showToast('Parámetros guardados con éxito');
  }

  return { render, toggleHolidayException, deleteHoliday, addCustomHoliday, syncArgHolidays, addServiceBlock, deleteBlock, saveConfig };
})();
