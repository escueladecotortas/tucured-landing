// Archivo: public/js/admin_l2/admin_l2_schedule.js
// Cronograma L2: Horarios Semanales, Feriados & Vacaciones (Nexus OS v11.1 - < 160 líneas)

(function (global) {
  const defaultSchedule = {
    1: { enabled: true, open: "09:00", close: "18:00", isSplit: false, open2: "17:00", close2: "21:00" },
    2: { enabled: true, open: "09:00", close: "18:00", isSplit: false, open2: "17:00", close2: "21:00" },
    3: { enabled: true, open: "09:00", close: "18:00", isSplit: false, open2: "17:00", close2: "21:00" },
    4: { enabled: true, open: "09:00", close: "18:00", isSplit: false, open2: "17:00", close2: "21:00" },
    5: { enabled: true, open: "09:00", close: "18:00", isSplit: false, open2: "17:00", close2: "21:00" },
    6: { enabled: true, open: "09:00", close: "13:00", isSplit: false, open2: "17:00", close2: "21:00" },
    0: { enabled: false, open: "09:00", close: "13:00", isSplit: false, open2: "17:00", close2: "21:00" }
  };

  const dayNames = { 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 0: 'Domingo' };

  const HOLIDAYS_CATALOG = [
    { date: "2026-01-01", name: "Año Nuevo" }, { date: "2026-02-16", name: "Carnaval (Lunes)" },
    { date: "2026-02-17", name: "Carnaval (Martes)" }, { date: "2026-03-24", name: "Día de la Memoria" },
    { date: "2026-04-02", name: "Día del Veterano" }, { date: "2026-04-03", name: "Viernes Santo" },
    { date: "2026-05-01", name: "Día del Trabajador" }, { date: "2026-05-25", name: "Revolución de Mayo" },
    { date: "2026-06-17", name: "Paso a la Inmortalidad de Güemes" }, { date: "2026-06-20", name: "Día de la Bandera" },
    { date: "2026-07-09", name: "Día de la Independencia" }, { date: "2026-08-17", name: "San Martín" },
    { date: "2026-10-12", name: "Diversidad Cultural" }, { date: "2026-11-20", name: "Soberanía Nacional" },
    { date: "2026-12-08", name: "Inmaculada Concepción" }, { date: "2026-12-25", name: "Navidad" }
  ];

  let weeklySchedule = JSON.parse(localStorage.getItem('tucu_schedule') || JSON.stringify(defaultSchedule));
  let vacations = JSON.parse(localStorage.getItem('tucu_l2_vacations') || '[]');

  function renderScheduleMatrix() {
    const container = document.getElementById('weekly-schedule-container');
    if (!container) return;

    container.innerHTML = [1, 2, 3, 4, 5, 6, 0].map(day => {
      const d = weeklySchedule[day] || { enabled: false, open: '09:00', close: '18:00', isSplit: false, open2: '17:00', close2: '21:00' };
      return `
        <div class="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <input type="checkbox" onchange="adminL2Schedule.toggleDay(${day}, this.checked)" ${d.enabled ? 'checked' : ''} class="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer">
              <span class="text-xs font-bold ${d.enabled ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}">${dayNames[day]}</span>
            </div>
            <button type="button" onclick="adminL2Schedule.toggleSplit(${day})" class="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${d.isSplit ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}">
              ${d.isSplit ? '☀️ Horario Partido' : '🔄 Horario Corrido'}
            </button>
          </div>
          ${d.enabled ? `
            <div class="grid grid-cols-2 ${d.isSplit ? 'sm:grid-cols-4' : 'sm:grid-cols-2'} gap-2 pt-1">
              <div><label class="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">Apertura</label><input type="time" value="${d.open}" onchange="adminL2Schedule.updateHour(${day}, 'open', this.value)" class="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500"></div>
              <div><label class="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">Cierre</label><input type="time" value="${d.close}" onchange="adminL2Schedule.updateHour(${day}, 'close', this.value)" class="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500"></div>
              ${d.isSplit ? `
                <div><label class="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">Reapertura</label><input type="time" value="${d.open2 || '17:00'}" onchange="adminL2Schedule.updateHour(${day}, 'open2', this.value)" class="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500"></div>
                <div><label class="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">Cierre Tarde</label><input type="time" value="${d.close2 || '21:00'}" onchange="adminL2Schedule.updateHour(${day}, 'close2', this.value)" class="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500"></div>
              ` : ''}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  function toggleDay(day, enabled) {
    weeklySchedule[day].enabled = enabled;
    localStorage.setItem('tucu_schedule', JSON.stringify(weeklySchedule));
    renderScheduleMatrix();
  }

  function toggleSplit(day) {
    weeklySchedule[day].isSplit = !weeklySchedule[day].isSplit;
    localStorage.setItem('tucu_schedule', JSON.stringify(weeklySchedule));
    renderScheduleMatrix();
  }

  function updateHour(day, field, val) {
    weeklySchedule[day][field] = val;
    localStorage.setItem('tucu_schedule', JSON.stringify(weeklySchedule));
  }

  function copyMonToAll() {
    const mon = weeklySchedule[1];
    [2, 3, 4, 5].forEach(d => { weeklySchedule[d] = JSON.parse(JSON.stringify(mon)); });
    localStorage.setItem('tucu_schedule', JSON.stringify(weeklySchedule));
    renderScheduleMatrix();
    global.adminL2Core?.showToast('Horarios de Lunes copiados a días hábiles');
  }

  function renderHolidays() {
    const container = document.getElementById('holidays-container');
    if (!container) return;
    container.innerHTML = HOLIDAYS_CATALOG.map(h => `
      <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shadow-xs">
        <div class="min-w-0">
          <span class="font-bold text-slate-800 dark:text-slate-200 block truncate text-xs">${h.name}</span>
          <span class="text-[10px] text-slate-500 dark:text-slate-400 font-mono">${h.date}</span>
        </div>
        <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shrink-0">Feriado</span>
      </div>
    `).join('');
  }

  function renderVacations() {
    const c = document.getElementById('vacations-list-container');
    if (!c) return;
    c.innerHTML = vacations.length === 0 ? '<p class="text-xs text-slate-400 italic py-2">No hay vacaciones ni cierres programados.</p>' : vacations.map((v, i) => `
      <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs shadow-xs">
        <div>
          <span class="font-bold text-amber-700 dark:text-amber-400">${v.reason || 'Cierre Temporal'}</span>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 font-mono">📅 ${v.from} al ${v.to}</p>
        </div>
        <button type="button" onclick="adminL2Schedule.removeVacation(${i})" class="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40">Eliminar</button>
      </div>
    `).join('');
  }

  function removeVacation(i) {
    vacations.splice(i, 1);
    localStorage.setItem('tucu_l2_vacations', JSON.stringify(vacations));
    renderVacations();
    global.adminL2Core?.showToast('Cierre eliminado');
  }

  function addVacation() {
    const fromEl = document.getElementById('vacation-start-date');
    const toEl = document.getElementById('vacation-end-date');
    const reasonEl = document.getElementById('vacation-reason');
    const from = fromEl?.value;
    const to = toEl?.value;
    const reason = reasonEl?.value.trim() || 'Cierre Temporal';

    if (!from || !to || from > to) return global.adminL2Core?.showToast('Rango de fechas inválido', 'error');

    vacations.push({ from, to, reason });
    localStorage.setItem('tucu_l2_vacations', JSON.stringify(vacations));
    if (fromEl) fromEl.value = '';
    if (toEl) toEl.value = '';
    if (reasonEl) reasonEl.value = '';
    renderVacations();
    global.adminL2Core?.showToast('Rango de vacaciones guardado');
  }

  function init() {
    renderScheduleMatrix();
    renderHolidays();
    renderVacations();

    document.getElementById('btn-copy-mon-to-all')?.addEventListener('click', copyMonToAll);
    document.getElementById('btn-add-vacation')?.addEventListener('click', addVacation);
  }

  global.adminL2Schedule = { init, renderScheduleMatrix, toggleDay, toggleSplit, updateHour, copyMonToAll, renderHolidays, renderVacations, addVacation, removeVacation, getSchedule: () => weeklySchedule };
})(typeof window !== 'undefined' ? window : global);

