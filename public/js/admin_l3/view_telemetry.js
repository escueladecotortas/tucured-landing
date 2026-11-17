// Archivo: public/js/admin_l3/view_telemetry.js
// Vista de Confirmación Automática (2 hs antes) L3 con Switch Maestro Sincronizado (< 85L)

window.AdminL3Telemetry = (function () {
  function isAutoConfirmEnabled() {
    const core = window.AdminL3Core, r = core?.state?.rubro || 'barberia', nr = core?.NORM_RUBRO?.[r] || r;
    const pay = core?.getStorage?.(`tucu_l3_pay_cfg_${r}`, core?.getStorage?.(`tucu_l3_pay_cfg_${nr}`, {})) || {};
    const eng = window.AdminBookingEngine?.getConfig?.('l3') || {};
    return pay.rem2h ?? pay.reminders?.h2 ?? eng.reminders?.h2 ?? true;
  }

  function renderAutoConfirmBadge() {
    const el = document.getElementById('cron-telemetry-badge'), on = isAutoConfirmEnabled(); if (!el) return;
    el.innerHTML = `<span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full ${on ? 'bg-red-800 animate-pulse' : 'bg-stone-400'}"></span><span>Confirmación 2hs</span></span><span class="font-mono text-[10px] font-bold ${on ? 'text-red-900 dark:text-red-400' : 'text-stone-500'}">${on ? 'ACTIVO' : 'PAUSADO'}</span>`;
  }

  function setAutoConfirmEnabled(next) {
    const core = window.AdminL3Core, r = core?.state?.rubro || 'barberia', nr = core?.NORM_RUBRO?.[r] || r;
    const prev = core?.getStorage?.(`tucu_l3_pay_cfg_${r}`, {}) || {};
    const upd = { ...prev, rem2h: !!next, reminders: { ...(prev.reminders || { h24: true }), h2: !!next } };
    core?.setStorage?.(`tucu_l3_pay_cfg_${r}`, upd); core?.setStorage?.(`tucu_l3_pay_cfg_${nr}`, upd);
    const eng = window.AdminBookingEngine?.getConfig?.('l3') || {};
    window.AdminBookingEngine?.saveConfig?.('l3', { ...eng, reminders: { ...(eng.reminders || { h24: true }), h2: !!next } });
    renderAutoConfirmBadge(); core?.showToast?.(next ? 'Confirmación automática activada' : 'Confirmación automática pausada'); core?.renderActiveView?.();
  }

  function render(container, state) {
    const svg = window.AdminL3Core.svg, enabled = isAutoConfirmEnabled();
    const telem = state.telemetry || { lastSweep: 'Hace 4 minutos', inspected: 18, confirmed: 16, released: 2, logs: [] };
    const logs = telem.logs && telem.logs.length > 0 ? telem.logs : [
      { time: '10:00:12', inspected: 6, confirmed: 5, released: 1, hash: '#REV-91B4' },
      { time: '09:45:00', inspected: 7, confirmed: 7, released: 0, hash: '#REV-82F1' },
      { time: '09:30:05', inspected: 5, confirmed: 4, released: 1, hash: '#REV-77A9' }
    ];
    const logRows = logs.map(l => `
      <tr class="border-b border-stone-100 dark:border-stone-800/60 hover:bg-stone-50 dark:hover:bg-stone-900/40 text-xs">
        <td class="py-3 px-4 font-mono font-bold text-red-900 dark:text-red-400">${l.time}</td>
        <td class="py-3 px-4 text-stone-800 dark:text-stone-200">${l.inspected} turnos</td>
        <td class="py-3 px-4 text-emerald-700 dark:text-emerald-400 font-bold">${l.confirmed} confirmados</td>
        <td class="py-3 px-4 text-amber-700 dark:text-amber-400 font-bold">${l.released} liberados</td>
        <td class="py-3 px-4 font-mono text-[11px] text-stone-400">${String(l.hash || '').replace('#CRON-', '#REV-')}</td>
        <td class="py-3 px-4 text-right"><span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold">Registrado</span></td>
      </tr>`).join('');
    const confPct = telem.inspected ? Math.round((telem.confirmed / telem.inspected) * 100) : 0;
    const relPct = telem.inspected ? Math.round((telem.released / telem.inspected) * 100) : 0;

    container.innerHTML = `
      <div class="space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#D5CEC2] dark:border-stone-800">
          <div class="max-w-2xl">
            <h2 class="text-base font-bold text-stone-900 dark:text-stone-100 font-title flex items-center gap-2 flex-wrap">${svg('bolt')}<span>Confirmación Automática de Turnos (2 hs antes)</span><span id="l3-auto-confirm-badge" class="text-xs px-2.5 py-0.5 rounded-full font-bold font-mono border ${enabled ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300 border-stone-300 dark:border-stone-700'}">${enabled ? 'AUTOMATIZACIÓN ACTIVA' : 'AUTOMATIZACIÓN PAUSADA'}</span></h2>
            <p class="text-xs text-stone-500 mt-1">Complementa los avisos de WhatsApp de Configuración revisando respuestas antes del turno y liberando automáticamente los horarios no confirmados. Puedes pausarlo en cualquier momento si prefieres gestión manual.</p>
          </div>
          <div class="flex items-center gap-2.5 flex-wrap shrink-0">
            <button type="button" id="btn-l3-auto-confirm-toggle" role="switch" aria-checked="${enabled}" onclick="AdminL3Telemetry.setAutoConfirmEnabled(!AdminL3Telemetry.isAutoConfirmEnabled())" class="px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${enabled ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200' : 'bg-stone-100 border-[#D5CEC2] text-stone-700 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-300'}">
              <span>Confirmación y Liberación Automática</span>
              <span class="w-8 h-4 rounded-full p-0.5 flex items-center transition-colors ${enabled ? 'bg-emerald-600 justify-end' : 'bg-stone-400 justify-start'}"><span class="w-3 h-3 rounded-full bg-white shadow-xs"></span></span>
            </button>
            <button type="button" id="btn-l3-run-review-now" ${enabled ? '' : 'disabled'} onclick="AdminL3Core.executeCronSweep()" class="py-2 px-4 rounded-xl admin-glass-primary font-bold text-xs flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed">${svg('bolt')}<span>Ejecutar Revisión Ahora</span></button>
          </div>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div class="admin-card"><p class="text-[10px] uppercase font-bold text-stone-500">Estado del Asistente</p><p class="text-sm font-bold flex items-center gap-1.5 mt-1 ${enabled ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-300'}"><span class="w-2.5 h-2.5 rounded-full ${enabled ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}"></span>${enabled ? 'Activo y Monitoreando' : 'Pausada por el usuario'}</p><p class="text-[10px] text-stone-400 mt-1 font-mono">${enabled ? 'Cada 15 min' : 'Gestión manual'}</p></div>
          <div class="admin-card"><p class="text-[10px] uppercase font-bold text-stone-500">Turnos Revisados</p><p class="font-title text-xl font-extrabold text-stone-900 dark:text-stone-100 mt-0.5">${telem.inspected}</p><div class="admin-kpi-track"><div class="admin-kpi-fill bg-[#800000]" style="width:100%"></div></div></div>
          <div class="admin-card"><p class="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">Asistencia Confirmada</p><p class="font-title text-xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-0.5">${telem.confirmed}</p><div class="admin-kpi-track"><div class="admin-kpi-fill bg-emerald-600" style="width:${confPct}%"></div></div></div>
          <div class="admin-card"><p class="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">Horarios Liberados</p><p class="font-title text-xl font-extrabold text-amber-700 dark:text-amber-300 mt-0.5">${telem.released}</p><div class="admin-kpi-track"><div class="admin-kpi-fill bg-amber-600" style="width:${relPct}%"></div></div></div>
        </div>
        <div class="space-y-3">
          <div class="flex items-center justify-between"><h3 class="font-bold text-sm text-stone-900 dark:text-stone-100 font-title">Historial de Revisiones Automáticas</h3><span class="text-xs text-stone-500">Última ejecución: <strong>${telem.lastSweep}</strong></span></div>
          <div class="admin-card !p-0 overflow-x-auto"><table class="w-full text-left"><thead class="bg-stone-50 dark:bg-stone-950/70 border-b border-[#D5CEC2] dark:border-stone-800 text-[11px] text-stone-500 uppercase font-semibold"><tr><th class="py-3 px-4">Hora</th><th class="py-3 px-4">Turnos Revisados</th><th class="py-3 px-4">Confirmados</th><th class="py-3 px-4">Liberados</th><th class="py-3 px-4">Código de Control</th><th class="py-3 px-4 text-right">Estado</th></tr></thead><tbody>${logRows}</tbody></table></div>
        </div>
      </div>`;
  }

  return { isAutoConfirmEnabled, renderAutoConfirmBadge, setAutoConfirmEnabled, render };
})();
