// Archivo: public/js/admin_l3/view_telemetry.js
// Vista de Telemetría Cron T-2hs L3 Warm Studio v2 (< 85 líneas)

window.AdminL3Telemetry = (function () {
  function render(container, state) {
    const svg = window.AdminL3Core.svg;
    const telem = state.telemetry || { daemonStatus: 'ACTIVE', lastSweep: 'Hace 4 minutos', inspected: 18, confirmed: 16, released: 2, logs: [] };
    const logs = telem.logs && telem.logs.length > 0 ? telem.logs : [
      { time: '10:00:12', inspected: 6, confirmed: 5, released: 1, hash: '#CRON-91B4' },
      { time: '09:45:00', inspected: 7, confirmed: 7, released: 0, hash: '#CRON-82F1' },
      { time: '09:30:05', inspected: 5, confirmed: 4, released: 1, hash: '#CRON-77A9' }
    ];

    const logRows = logs.map(l => `
      <tr class="border-b border-stone-100 dark:border-stone-800/60 hover:bg-stone-50 dark:hover:bg-stone-900/40 text-xs">
        <td class="py-3 px-4 font-mono font-bold text-red-900 dark:text-red-400">${l.time}</td>
        <td class="py-3 px-4 text-stone-800 dark:text-stone-200">${l.inspected} turnos</td>
        <td class="py-3 px-4 text-emerald-700 dark:text-emerald-400 font-bold">${l.confirmed} confirmados</td>
        <td class="py-3 px-4 text-amber-700 dark:text-amber-400 font-bold">${l.released} liberados</td>
        <td class="py-3 px-4 font-mono text-[11px] text-stone-400">${l.hash}</td>
        <td class="py-3 px-4 text-right"><span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold">Idempotente</span></td>
      </tr>`).join('');

    const confPct = telem.inspected ? Math.round((telem.confirmed / telem.inspected) * 100) : 0;
    const relPct = telem.inspected ? Math.round((telem.released / telem.inspected) * 100) : 0;

    container.innerHTML = `
      <div class="space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#D5CEC2] dark:border-stone-800">
          <div>
            <h2 class="text-base font-bold text-stone-900 dark:text-stone-100 font-title flex items-center gap-2">${svg('bolt')}<span>Telemetría en Vivo: Daemon Barredor Cron T-2hs</span><span class="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold font-mono">DAEMON EN LÍNEA</span></h2>
            <p class="text-xs text-stone-500">Inspección automática cada 15 minutos en ventana previa a 2 horas para confirmar asistencia o liberar el slot.</p>
          </div>
          <button onclick="AdminL3Core.executeCronSweep()" class="py-2 px-4 rounded-xl admin-glass-primary font-bold text-xs flex items-center gap-1.5">${svg('bolt')}<span>Ejecutar Barrido Ahora</span></button>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div class="admin-card"><p class="text-[10px] uppercase font-bold text-stone-500">Microservicio</p><p class="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mt-1"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>Activo & En Espera</p><p class="text-[10px] text-stone-400 mt-1 font-mono">Cada 15m</p></div>
          <div class="admin-card"><p class="text-[10px] uppercase font-bold text-stone-500">Inspecciones</p><p class="font-title text-xl font-extrabold text-stone-900 dark:text-stone-100 mt-0.5">${telem.inspected}</p><div class="admin-kpi-track"><div class="admin-kpi-fill bg-[#800000]" style="width:100%"></div></div></div>
          <div class="admin-card"><p class="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">Confirmados</p><p class="font-title text-xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-0.5">${telem.confirmed}</p><div class="admin-kpi-track"><div class="admin-kpi-fill bg-emerald-600" style="width:${confPct}%"></div></div></div>
          <div class="admin-card"><p class="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">Liberados</p><p class="font-title text-xl font-extrabold text-amber-700 dark:text-amber-300 mt-0.5">${telem.released}</p><div class="admin-kpi-track"><div class="admin-kpi-fill bg-amber-600" style="width:${relPct}%"></div></div></div>
        </div>
        <div class="space-y-3">
          <div class="flex items-center justify-between"><h3 class="font-bold text-sm text-stone-900 dark:text-stone-100 font-title">Registro de Pasadas del Cron</h3><span class="text-xs text-stone-500">Última ejecución: <strong>${telem.lastSweep}</strong></span></div>
          <div class="admin-card !p-0 overflow-hidden"><table class="w-full text-left"><thead class="bg-stone-50 dark:bg-stone-950/70 border-b border-[#D5CEC2] dark:border-stone-800 text-[11px] text-stone-500 uppercase font-semibold"><tr><th class="py-3 px-4">Hora</th><th class="py-3 px-4">Inspeccionados</th><th class="py-3 px-4">Confirmados</th><th class="py-3 px-4">Liberados</th><th class="py-3 px-4">Hash Idempotencia</th><th class="py-3 px-4 text-right">Estado</th></tr></thead><tbody>${logRows}</tbody></table></div>
        </div>
      </div>`;
  }

  return { render };
})();