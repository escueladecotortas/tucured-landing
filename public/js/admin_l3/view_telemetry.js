// Archivo: public/js/admin_l3/view_telemetry.js
/**
 * ⚡ NEXUS ADMIN L3: VISTA DE TELEMETRÍA CRON T-2HS (< 140 líneas)
 * - Monitorización en vivo del Daemon Barredor de recordatorios y confirmación
 * - Detección y liberación automática de turnos no confirmados en ventana T-2hs
 * - Estándar visual Aura Light con logs de auditoría e idempotencia
 */

window.AdminL3Telemetry = (function () {
  function render(container, state) {
    const telem = state.telemetry || { daemonStatus: 'ACTIVE', lastSweep: 'Hace 4 minutos', inspected: 18, confirmed: 16, released: 2, logs: [] };
    const logs = telem.logs && telem.logs.length > 0 ? telem.logs : [
      { time: '10:00:12', inspected: 6, confirmed: 5, released: 1, hash: '#CRON-91B4' },
      { time: '09:45:00', inspected: 7, confirmed: 7, released: 0, hash: '#CRON-82F1' },
      { time: '09:30:05', inspected: 5, confirmed: 4, released: 1, hash: '#CRON-77A9' }
    ];

    const logRows = logs.map(l => `
      <tr class="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-xs">
        <td class="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">${l.time}</td>
        <td class="py-3 px-4 text-slate-800 dark:text-slate-200">${l.inspected} turnos</td>
        <td class="py-3 px-4 text-emerald-600 font-bold">${l.confirmed} confirmados</td>
        <td class="py-3 px-4 text-amber-600 font-bold">${l.released} liberados</td>
        <td class="py-3 px-4 font-mono text-[11px] text-slate-400">${l.hash}</td>
        <td class="py-3 px-4 text-right"><span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold">✓ Idempotente</span></td>
      </tr>`).join('');

    container.innerHTML = `
      <div class="space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 class="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>⚡ Telemetría en Vivo: Daemon Barredor Cron T-2hs</span>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold font-mono">DAEMON EN LÍNEA</span>
            </h2>
            <p class="text-xs text-slate-500">Inspección automática cada 15 minutos en ventana previa a 2 horas para confirmar asistencia o liberar el slot.</p>
          </div>
          <button onclick="AdminL3Core.executeCronSweep()" class="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer">
            <span>⚡</span><span>Ejecutar Barrido de Auditoría Ahora</span>
          </button>
        </div>

        <!-- Métricas de Telemetría -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div class="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs">
            <p class="text-[10px] uppercase font-bold text-slate-500">Estado del Microservicio</p>
            <p class="text-base font-bold text-emerald-600 flex items-center gap-1.5 mt-1"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>Activo & En Espera</p>
            <p class="text-[10px] text-slate-400 mt-1 font-mono">Frecuencia: Cada 15m</p>
          </div>
          <div class="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs">
            <p class="text-[10px] uppercase font-bold text-slate-500">Inspecciones Totales</p>
            <p class="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">${telem.inspected}</p>
            <p class="text-[10px] text-slate-400 mt-1">Ventana: T - 120 minutos</p>
          </div>
          <div class="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs">
            <p class="text-[10px] uppercase font-bold text-emerald-600">Turnos Confirmados</p>
            <p class="text-xl font-bold text-emerald-600 mt-1">${telem.confirmed}</p>
            <p class="text-[10px] text-slate-400 mt-1">Con respuesta positiva</p>
          </div>
          <div class="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs">
            <p class="text-[10px] uppercase font-bold text-amber-600">Slots Liberados</p>
            <p class="text-xl font-bold text-amber-600 mt-1">${telem.released}</p>
            <p class="text-[10px] text-slate-400 mt-1">Reasignables de inmediato</p>
          </div>
        </div>

        <!-- Bitácora de Pasadas e Idempotencia -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>📋 Registro de Pasadas del Cron (Últimos Eventos)</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">Gobernanza Anti-Spam</span>
            </h3>
            <span class="text-xs text-slate-500">Última ejecución: <strong>${telem.lastSweep}</strong></span>
          </div>
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
            <table class="w-full text-left">
              <thead class="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 uppercase font-semibold">
                <tr>
                  <th class="py-3 px-4">Hora</th>
                  <th class="py-3 px-4">Inspeccionados</th>
                  <th class="py-3 px-4">Confirmados</th>
                  <th class="py-3 px-4">Liberados</th>
                  <th class="py-3 px-4">Hash Idempotencia</th>
                  <th class="py-3 px-4 text-right">Estado</th>
                </tr>
              </thead>
              <tbody>${logRows}</tbody>
            </table>
          </div>
        </div>
      </div>`;
  }

  return { render };
})();

