// Archivo: public/js/admin_l3/view_system.js
/**
 * ⚙️ NEXUS ADMIN L3: CONFIGURACIÓN, FERIADOS AR & BLOQUEOS (< 165 líneas)
 * - Feriados Nacionales con sincronización API / Fallback 2026
 * - Bloqueo de rangos horarios por prestación y parámetros del motor
 * - Estándar visual Aura Light con contenedores claros y bordes suaves
 */

window.AdminL3System = (function () {
  const ARG_2026_FALLBACK = [
    { date: "2026-01-01", desc: "Año Nuevo", isException: false },
    { date: "2026-03-24", desc: "Memoria por la Verdad", isException: false },
    { date: "2026-04-02", desc: "Veteranos de Malvinas", isException: false },
    { date: "2026-05-01", desc: "Día del Trabajador", isException: false },
    { date: "2026-05-25", desc: "Revolución de Mayo", isException: false },
    { date: "2026-07-09", desc: "Día de la Independencia", isException: false },
    { date: "2026-12-25", desc: "Navidad", isException: false }
  ];

  function render(container, state) {
    const config = state.config || { slotIntervalMinutes: 30, maxAdvanceDays: 14, allowSameDay: true, maxActivePerUser: 2, tplConfirm: "¡Hola {{cliente}}! Turno confirmado para {{servicio}} con {{staff}} el {{fecha}} a las {{hora}} hs.", tplCancel: "¡Hola {{cliente}}! Tu turno ha sido cancelado.", tplReminder: "¡Hola {{cliente}}! Te recordamos tu turno de mañana {{fecha}} a las {{hora}} hs." };
    const holidays = state.holidays || [], blocks = state.blocks || [], services = state.services || [];

    const holidayRows = holidays.map(h => `
      <tr class="border-b border-slate-100 dark:border-slate-800/60 text-xs">
        <td class="py-2.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">${h.date}</td>
        <td class="py-2.5 px-4 font-bold text-slate-900 dark:text-slate-100">${h.desc}</td>
        <td class="py-2.5 px-4"><button onclick="AdminL3System.toggleHolidayException('${h.date}')" class="px-2 py-0.5 rounded text-[10px] font-bold ${h.isException ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}">${h.isException ? '🔓 Excepción (Abierto)' : '🔒 Cerrado'}</button></td>
        <td class="py-2.5 px-4 text-right"><button onclick="AdminL3System.deleteHoliday('${h.date}')" class="text-rose-500 hover:text-rose-700">🗑️</button></td>
      </tr>`).join('');

    const blockRows = blocks.map(b => `
      <tr class="border-b border-slate-100 dark:border-slate-800/60 text-xs">
        <td class="py-2.5 px-4 font-bold text-indigo-600 dark:text-indigo-400">${b.serviceName}</td>
        <td class="py-2.5 px-4 font-mono text-slate-600 dark:text-slate-300">${b.date}</td>
        <td class="py-2.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">${b.start} a ${b.end} hs</td>
        <td class="py-2.5 px-4 text-right"><button onclick="AdminL3System.deleteBlock('${b.id}')" class="text-rose-500 hover:text-rose-700">🗑️</button></td>
      </tr>`).join('');

    const srvOptions = services.map(s => `<option value="${s.id}">${s.name}</option>`).join('');

    container.innerHTML = `
      <div class="space-y-6">
        <!-- 1. Feriados y Cierres -->
        <div class="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-xs">
          <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div><h3 class="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2"><span>📅 Feriados Nacionales & Días No Laborables</span></h3><p class="text-xs text-slate-500">Sincroniza feriados oficiales de Argentina o bloquea fechas manuales.</p></div>
            <button onclick="AdminL3System.syncArgHolidays()" class="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all">🔄 Sincronizar Feriados AR</button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <input type="date" id="new-hol-date" class="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-800 dark:text-slate-200 outline-none">
            <input type="text" id="new-hol-desc" placeholder="Motivo (ej. Mantenimiento)..." class="sm:col-span-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-800 dark:text-slate-200 outline-none">
            <button onclick="AdminL3System.addCustomHoliday()" class="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs shadow-xs">➕ Bloquear Fecha</button>
          </div>
          <div class="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-48 overflow-y-auto hide-scrollbar"><table class="w-full text-left"><thead class="bg-slate-100 dark:bg-slate-900 text-[10px] text-slate-500 uppercase"><tr><th class="py-2 px-4">Fecha</th><th class="py-2 px-4">Motivo</th><th class="py-2 px-4">Estado</th><th class="py-2 px-4 text-right">Acción</th></tr></thead><tbody>${holidayRows || '<tr><td colspan="4" class="p-4 text-center text-slate-400 italic">Sin feriados cargados</td></tr>'}</tbody></table></div>
        </div>

        <!-- 2. Bloqueo de Horarios por Servicio -->
        <div class="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-xs">
          <div class="pb-3 border-b border-slate-200 dark:border-slate-800"><h3 class="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2"><span>🔒 Bloqueo de Horarios por Prestación</span></h3><p class="text-xs text-slate-500">Inhabilita un servicio puntual en un rango horario específico.</p></div>
          <div class="grid grid-cols-1 sm:grid-cols-5 gap-2">
            <select id="sb-srv" class="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-800 dark:text-slate-200 outline-none">${srvOptions || '<option value="">Sin servicios</option>'}</select>
            <input type="date" id="sb-date" class="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-800 dark:text-slate-200 outline-none">
            <input type="time" id="sb-start" value="12:00" class="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-800 dark:text-slate-200 outline-none">
            <input type="time" id="sb-end" value="16:00" class="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-800 dark:text-slate-200 outline-none">
            <button onclick="AdminL3System.addServiceBlock()" class="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs shadow-xs">🔒 Bloquear Rango</button>
          </div>
          <div class="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-40 overflow-y-auto hide-scrollbar"><table class="w-full text-left"><thead class="bg-slate-100 dark:bg-slate-900 text-[10px] text-slate-500 uppercase"><tr><th class="py-2 px-4">Servicio</th><th class="py-2 px-4">Fecha</th><th class="py-2 px-4">Horario</th><th class="py-2 px-4 text-right">Acción</th></tr></thead><tbody>${blockRows || '<tr><td colspan="4" class="p-4 text-center text-slate-400 italic">No hay bloqueos activos</td></tr>'}</tbody></table></div>
        </div>

        <!-- 3. Parámetros del Motor -->
        <div class="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-xs">
          <div class="pb-3 border-b border-slate-200 dark:border-slate-800"><h3 class="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2"><span>⚙️ Parámetros Operativos del Negocio</span></h3><p class="text-xs text-slate-500">Configuración global de duración de turnos y ventanas de reserva.</p></div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div><label class="block text-slate-500 text-xs mb-1 font-semibold">Intervalo de Slots (min):</label><input type="number" id="cfg-interval" value="${config.slotIntervalMinutes || 30}" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-800 dark:text-slate-200 font-mono outline-none"></div>
            <div><label class="block text-slate-500 text-xs mb-1 font-semibold">Días Máx. Anticipación:</label><input type="number" id="cfg-days" value="${config.maxAdvanceDays || 14}" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-800 dark:text-slate-200 font-mono outline-none"></div>
            <div><label class="block text-slate-500 text-xs mb-1 font-semibold">Límite Turnos por Cliente:</label><input type="number" id="cfg-maxuser" value="${config.maxActivePerUser || 2}" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-800 dark:text-slate-200 font-mono outline-none"></div>
          </div>
          <button onclick="AdminL3System.saveConfig()" class="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all">💾 Guardar Parámetros de Operación</button>
        </div>
      </div>`;
  }

  function toggleHolidayException(date) {
    const holidays = (window.AdminL3Core.state.holidays || []).map(h => h.date === date ? { ...h, isException: !h.isException } : h);
    window.AdminL3Core.setStorage('tucu_l3_holidays', holidays);
    window.AdminL3Core.state.holidays = holidays;
    window.AdminL3Core.renderActiveView();
  }

  function deleteHoliday(date) {
    const holidays = (window.AdminL3Core.state.holidays || []).filter(h => h.date !== date);
    window.AdminL3Core.setStorage('tucu_l3_holidays', holidays);
    window.AdminL3Core.state.holidays = holidays;
    window.AdminL3Core.renderActiveView();
  }

  function addCustomHoliday() {
    const date = document.getElementById('new-hol-date')?.value, desc = document.getElementById('new-hol-desc')?.value?.trim() || 'Cerrado';
    if (!date) return alert('Selecciona una fecha');
    const holidays = window.AdminL3Core.state.holidays || [];
    holidays.push({ date, desc, isException: false });
    window.AdminL3Core.setStorage('tucu_l3_holidays', holidays);
    window.AdminL3Core.state.holidays = holidays;
    window.AdminL3Core.renderActiveView();
  }

  async function syncArgHolidays() {
    let apiHolidays = [];
    try {
      const res = await fetch('https://nolaborables.com.ar/api/v1/feriados/2026');
      if (res.ok) {
        const data = await res.json();
        apiHolidays = data.map(i => ({ date: `2026-${String(i.mes).padStart(2, '0')}-${String(i.dia).padStart(2, '0')}`, desc: i.motivo, isException: false }));
      }
    } catch (_) {}
    if (apiHolidays.length === 0) apiHolidays = ARG_2026_FALLBACK;
    const current = window.AdminL3Core.state.holidays || [];
    apiHolidays.forEach(h => { if (!current.some(x => x.date === h.date)) current.push(h); });
    current.sort((a, b) => a.date.localeCompare(b.date));
    window.AdminL3Core.setStorage('tucu_l3_holidays', current);
    window.AdminL3Core.state.holidays = current;
    window.AdminL3Core.showToast('Feriados argentinos sincronizados');
    window.AdminL3Core.renderActiveView();
  }

  function addServiceBlock() {
    const srvId = document.getElementById('sb-srv')?.value, date = document.getElementById('sb-date')?.value;
    const start = document.getElementById('sb-start')?.value || '12:00', end = document.getElementById('sb-end')?.value || '16:00';
    if (!srvId || !date) return alert('Completa el servicio y la fecha');
    const state = window.AdminL3Core.state, srv = state.services.find(s => s.id === srvId), blocks = state.blocks || [];
    blocks.push({ id: 'sb-' + Math.random().toString(36).substring(2, 6), serviceId: srvId, serviceName: srv ? srv.name : 'Servicio', date, start, end });
    window.AdminL3Core.setStorage(`tucu_l3_blocks_${state.rubro}`, blocks);
    state.blocks = blocks;
    window.AdminL3Core.renderActiveView();
  }

  function deleteBlock(id) {
    const state = window.AdminL3Core.state;
    state.blocks = (state.blocks || []).filter(b => b.id !== id);
    window.AdminL3Core.setStorage(`tucu_l3_blocks_${state.rubro}`, state.blocks);
    window.AdminL3Core.renderActiveView();
  }

  function saveConfig() {
    const state = window.AdminL3Core.state;
    const config = {
      slotIntervalMinutes: parseInt(document.getElementById('cfg-interval')?.value) || 30,
      maxAdvanceDays: parseInt(document.getElementById('cfg-days')?.value) || 14,
      maxActivePerUser: parseInt(document.getElementById('cfg-maxuser')?.value) || 2
    };
    window.AdminL3Core.setStorage(`tucu_l3_config_${state.rubro}`, config);
    state.config = config;
    window.AdminL3Core.showToast('Parámetros guardados con éxito');
  }

  return { render, toggleHolidayException, deleteHoliday, addCustomHoliday, syncArgHolidays, addServiceBlock, deleteBlock, saveConfig };
})();
