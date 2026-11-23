// Archivo: public/js/admin_l3/view_telemetry.js
// Vista Confirmación Automática 2 hs L3: Barra Apilable en Móvil & Historial en Tarjetas Responsive (< 110L)

window.AdminL3Telemetry = (function () {
  function isAutoConfirmEnabled() {
    const core = window.AdminL3Core, r = core?.state?.rubro || 'barberia', nr = core?.NORM_RUBRO?.[r] || r;
    const pay = core?.getStorage?.(`tucu_l3_pay_cfg_${r}`, core?.getStorage?.(`tucu_l3_pay_cfg_${nr}`, {})) || {};
    const eng = window.AdminBookingEngine?.getConfig?.('l3') || {};
    return pay.rem2h ?? pay.reminders?.h2 ?? eng.reminders?.h2 ?? true;
  }

  function renderAutoConfirmBadge() {
    const el = document.getElementById('cron-telemetry-badge'), on = isAutoConfirmEnabled(); if (!el) return;
    el.className = `tucu-badge border cursor-pointer transition-colors ${on ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60 hover:bg-emerald-100/70' : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:bg-stone-200/70'}`;
    el.innerHTML = `<span class="w-1.5 h-1.5 rounded-full ${on ? 'bg-emerald-600 animate-pulse' : 'bg-stone-400'}"></span><span>Confirmación 2 hs: ${on ? 'Activo' : 'Pausado'}</span>`;
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
    const logCards = logs.map(l => {
      const code = String(l.hash || '').replace('#CRON-', '#REV-');
      return `<div class="admin-card tucu-card space-y-2.5 text-xs">
        <div class="flex items-center justify-between gap-2 pb-2 border-b border-stone-100 dark:border-stone-800">
          <div class="flex items-center gap-2 min-w-0"><span class="tabular-nums font-bold tucu-primary-text">${l.time}</span><span class="tabular-nums text-[11px] text-stone-400 truncate">${code}</span></div>
          <span class="tucu-badge bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">Registrado</span>
        </div>
        <div class="grid grid-cols-3 gap-2 text-center">
          <div class="p-2 rounded-xl bg-stone-50 dark:bg-stone-900/70"><span class="block text-[10px] uppercase text-stone-400 font-semibold">Revisados</span><strong class="tabular-nums text-stone-800 dark:text-stone-100">${l.inspected}</strong></div>
          <div class="p-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30"><span class="block text-[10px] uppercase text-emerald-700 dark:text-emerald-400 font-semibold">Confirmados</span><strong class="tabular-nums text-emerald-700 dark:text-emerald-300">${l.confirmed}</strong></div>
          <div class="p-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/30"><span class="block text-[10px] uppercase text-amber-700 dark:text-amber-400 font-semibold">Liberados</span><strong class="tabular-nums text-amber-700 dark:text-amber-300">${l.released}</strong></div>
        </div>
      </div>`;
    }).join('');
    const logRows = logs.map(l => `<tr class="border-b border-stone-100 dark:border-stone-800/60 hover:bg-stone-50 dark:hover:bg-stone-900/40 text-xs"><td class="py-3 px-4 tabular-nums font-bold tucu-primary-text">${l.time}</td><td class="py-3 px-4 text-stone-800 dark:text-stone-200">${l.inspected} turnos</td><td class="py-3 px-4 text-emerald-700 dark:text-emerald-400 font-bold">${l.confirmed} confirmados</td><td class="py-3 px-4 text-amber-700 dark:text-amber-400 font-bold">${l.released} liberados</td><td class="py-3 px-4 tabular-nums text-[11px] text-stone-400">${String(l.hash || '').replace('#CRON-', '#REV-')}</td><td class="py-3 px-4 text-right"><span class="tucu-badge bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">Registrado</span></td></tr>`).join('');
    const confPct = telem.inspected ? Math.round((telem.confirmed / telem.inspected) * 100) : 0;
    const relPct = telem.inspected ? Math.round((telem.released / telem.inspected) * 100) : 0;

    container.innerHTML = `<div class="space-y-5">
      <div class="admin-card tucu-card space-y-3">
        <div class="space-y-1">
          <h2 class="text-base font-bold text-stone-900 dark:text-stone-100 font-title flex items-center gap-2 flex-wrap">${svg('bolt')}<span>Confirmación Automática (2 hs antes)</span><span id="l3-auto-confirm-badge" class="tucu-badge tabular-nums border ${enabled ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300 border-stone-300 dark:border-stone-700'}">${enabled ? 'AUTOMATIZACIÓN ACTIVA' : 'AUTOMATIZACIÓN PAUSADA'}</span></h2>
          <p class="text-xs text-stone-500 leading-relaxed">Complementa los avisos de WhatsApp revisando respuestas antes del turno y liberando automáticamente horarios no confirmados.</p>
        </div>
        <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button type="button" id="btn-l3-auto-confirm-toggle" role="switch" aria-checked="${enabled}" onclick="AdminL3Telemetry.setAutoConfirmEnabled(!AdminL3Telemetry.isAutoConfirmEnabled())" class="w-full sm:w-auto justify-between px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${enabled ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200' : 'bg-stone-100 border-[#D5CEC2] text-stone-700 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-300'}"><span class="text-left leading-snug">Confirmación y Liberación Automática</span><span class="w-8 h-4 rounded-full p-0.5 flex items-center shrink-0 transition-colors ${enabled ? 'bg-emerald-600 justify-end' : 'bg-stone-400 justify-start'}"><span class="w-3 h-3 rounded-full bg-white shadow-xs"></span></span></button>
          <button type="button" id="btn-l3-run-review-now" ${enabled ? '' : 'disabled'} onclick="AdminL3Core.executeCronSweep()" class="tucu-btn admin-glass-primary w-full sm:w-auto justify-center disabled:opacity-40 disabled:cursor-not-allowed">${svg('bolt')}<span>Ejecutar Revisión Ahora</span></button>
        </div>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="admin-card tucu-card"><p class="text-[10px] uppercase font-bold text-stone-500">Estado del Asistente</p><p class="text-sm font-bold flex items-center gap-1.5 mt-1 ${enabled ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-300'}"><span class="w-2.5 h-2.5 rounded-full shrink-0 ${enabled ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}"></span><span class="truncate">${enabled ? 'Activo' : 'En Pausa'}</span></p><p class="text-[10px] text-stone-400 mt-1 tabular-nums">${enabled ? 'Cada 15 min' : 'Gestión manual'}</p></div>
        <div class="admin-card tucu-card"><p class="text-[10px] uppercase font-bold text-stone-500">Turnos Revisados</p><p class="font-title text-xl font-extrabold text-stone-900 dark:text-stone-100 mt-0.5 tabular-nums">${telem.inspected}</p><div class="admin-kpi-track"><div class="admin-kpi-fill tucu-primary-bg" style="width:100%"></div></div></div>
        <div class="admin-card tucu-card"><p class="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">Confirmados</p><p class="font-title text-xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-0.5 tabular-nums">${telem.confirmed}</p><div class="admin-kpi-track"><div class="admin-kpi-fill bg-emerald-600" style="width:${confPct}%"></div></div></div>
        <div class="admin-card tucu-card"><p class="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">Liberados</p><p class="font-title text-xl font-extrabold text-amber-700 dark:text-amber-300 mt-0.5 tabular-nums">${telem.released}</p><div class="admin-kpi-track"><div class="admin-kpi-fill bg-amber-600" style="width:${relPct}%"></div></div></div>
      </div>
      <div class="space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-1.5"><h3 class="font-bold text-sm text-stone-900 dark:text-stone-100 font-title">Historial de Revisiones Automáticas</h3><span class="text-xs text-stone-500">Última ejecución: <strong>${telem.lastSweep}</strong></span></div>
        <div id="l3-telemetry-cards-mobile" class="md:hidden space-y-2.5">${logCards}</div>
        <div id="l3-telemetry-table-desktop" class="hidden md:block admin-card tucu-card !p-0 overflow-hidden"><table class="w-full text-left"><thead class="bg-stone-50 dark:bg-stone-950/70 border-b border-[#D5CEC2] dark:border-stone-800 text-[11px] text-stone-500 uppercase font-semibold"><tr><th class="py-3 px-4">Hora</th><th class="py-3 px-4">Turnos Revisados</th><th class="py-3 px-4">Confirmados</th><th class="py-3 px-4">Liberados</th><th class="py-3 px-4">Código de Control</th><th class="py-3 px-4 text-right">Estado</th></tr></thead><tbody>${logRows}</tbody></table></div>
      </div>
    </div>`;
  }

  return { isAutoConfirmEnabled, renderAutoConfirmBadge, setAutoConfirmEnabled, render };
})();
