// Archivo: public/js/admin_l3/view_system.js
// Configuración L3: Identidad, Horarios/Bloqueos/Feriados 2026 por Mes, Pagos & QR SVG Inline (< 165 líneas)

window.AdminL3System = (function () {
  const normR = (r) => window.AdminL3Core.NORM_RUBRO?.[r] || r;
  const waOpts = () => ({ mountId: 'l3-wa-config-mount', level: 'l3', bizInputId: 'cfg-biz-name', addressInputId: 'cfg-biz-address', aliasInputId: 'l3-input-alias', cbuInputId: 'l3-input-cbu' });

  function renderMonthlyHolidays(rubro) {
    window.AdminHolidays?.renderMonthlyList?.('l3-holidays-monthly-container', 'l3', rubro, (_, blk) => {
      window.AdminL3Core.showToast(blk ? 'Feriado bloqueado en agenda' : 'Feriado abierto para atender');
    });
  }

  function render(container, state) {
    const svg = window.AdminL3Core.svg, cfg = state.config || { maxAdvanceDays: 14, maxActivePerUser: 2 };
    const blocks = (state.blocks || []).filter(b => !b.deletedAt);
    const services = (state.services || []).filter(s => (window.AdminShell ? window.AdminShell.isServiceAvailable(s) : !s.deletedAt && s.active !== false));
    const curYear = window.AdminHolidays ? window.AdminHolidays.getCurrentYear() : new Date().getFullYear();
    const today = window.AdminShell ? window.AdminShell.localTodayStr() : '', nr = normR(state.rubro);
    const payCfg = window.AdminL3Core.getStorage(`tucu_l3_pay_cfg_${state.rubro}`, window.AdminL3Core.getStorage(`tucu_l3_pay_cfg_${nr}`, {}));
    const engCfg = window.AdminBookingEngine?.getConfig?.('l3') || {};
    const aliasVal = payCfg.alias || localStorage.getItem(`tucu_l3_alias_${state.rubro}`) || engCfg.alias || 'estudio.central.mp';
    const cbuVal = payCfg.cbu || localStorage.getItem(`tucu_l3_cbu_${state.rubro}`) || engCfg.cbu || '0000003100012345678901';
    const rem24 = payCfg.reminders?.h24 ?? engCfg.reminders?.h24 ?? true, rem2 = payCfg.rem2h ?? payCfg.reminders?.h2 ?? engCfg.reminders?.h2 ?? true;

    const blockRows = blocks.map(b => `<tr class="border-b border-stone-100 dark:border-stone-800/60 text-xs"><td class="py-2 px-4 font-bold text-red-900 dark:text-red-400">${b.serviceName}</td><td class="py-2 px-4 font-mono text-stone-600 dark:text-stone-300">${b.date}</td><td class="py-2 px-4 font-mono font-bold text-stone-800 dark:text-stone-200">${b.start} a ${b.end} hs</td><td class="py-2 px-4 text-right"><button onclick="AdminL3System.deleteBlock('${b.id}')" class="text-rose-500 hover:text-rose-700 cursor-pointer" title="Archivar">${svg('trash')}</button></td></tr>`).join('');
    const srvOptions = services.map(s => `<option value="${s.id}">${s.name}</option>`).join(''), p = state.presets[state.rubro] || {};
    const bizName = localStorage.getItem(`tucu_l3_biz_name_${state.rubro}`) || localStorage.getItem('tucu_l3_biz_name') || p.name || 'Estudio Multi-Staff TucuRed';
    const bizAddr = localStorage.getItem(`tucu_l3_address_${state.rubro}`) || localStorage.getItem('tucu_l3_address') || p.address || '25 de Mayo 480, S. M. de Tucumán';

    container.innerHTML = `<div class="space-y-6">
      <div class="admin-card space-y-4">
        <div class="pb-3 border-b border-stone-200 dark:border-stone-800"><h3 class="font-bold text-sm text-stone-900 dark:text-stone-100 font-title">Identidad & Parámetros del Comercio</h3><p class="text-xs text-stone-500">Nombre, dirección y reglas generales visibles en tickets online y WhatsApp.</p></div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><label for="cfg-biz-name" class="block text-stone-500 text-xs mb-1 font-semibold">Nombre del Comercio:</label><input type="text" id="cfg-biz-name" value="${bizName}" class="w-full bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 text-xs outline-none"></div><div><label for="cfg-biz-address" class="block text-stone-500 text-xs mb-1 font-semibold">Dirección del Local:</label><input type="text" id="cfg-biz-address" value="${bizAddr}" class="w-full bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 text-xs outline-none"></div></div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><label class="block text-stone-500 text-xs mb-1 font-semibold">Días Máx. Anticipación:</label><input type="number" id="cfg-days" value="${cfg.maxAdvanceDays || 14}" class="w-full bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 text-xs font-mono outline-none"></div><div><label class="block text-stone-500 text-xs mb-1 font-semibold">Límite Turnos por Cliente:</label><input type="number" id="cfg-maxuser" value="${cfg.maxActivePerUser || 2}" class="w-full bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 text-xs font-mono outline-none"></div></div>
        <button onclick="AdminL3System.saveConfig()" class="w-full py-2.5 rounded-2xl admin-glass-primary font-bold text-xs">Guardar Identidad y Parámetros</button>
      </div>
      <div class="admin-card space-y-5">
        <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-200 dark:border-stone-800">
          <div><h3 id="l3-holidays-label" class="font-bold text-sm text-stone-900 dark:text-stone-100 font-title flex items-center gap-2">${svg('cal')}<span>Horarios, Bloqueos y Feriados Nacionales ${curYear}</span></h3><p class="text-xs text-stone-500">Bloqueo por franja/prestación y feriados agrupados por mes con toggle individual.</p></div>
          <button onclick="AdminL3System.syncArgHolidays()" class="px-3.5 py-1.5 rounded-xl admin-glass-primary font-bold text-xs">Sincronizar Feriados ${curYear}</button>
        </div>
        <div class="space-y-2.5"><h4 class="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">${svg('lock')}<span>Bloqueo de Horarios por Prestación</span></h4>
          <div class="grid grid-cols-1 sm:grid-cols-5 gap-2"><select id="sb-srv" class="bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 text-xs outline-none">${srvOptions || '<option value="">Sin servicios</option>'}</select><input type="date" id="sb-date" min="${today}" class="bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 text-xs outline-none"><input type="time" id="sb-start" value="12:00" class="bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 text-xs outline-none"><input type="time" id="sb-end" value="16:00" class="bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 text-xs outline-none"><button onclick="AdminL3System.addServiceBlock()" class="py-2 px-3 rounded-xl admin-glass-btn font-bold text-xs flex items-center justify-center gap-1.5">${svg('lock')}<span>Bloquear Rango</span></button></div>
          <div class="bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-2xl overflow-hidden max-h-40 overflow-y-auto hide-scrollbar"><table class="w-full text-left"><thead class="bg-stone-100 dark:bg-stone-900 text-[10px] text-stone-500 uppercase"><tr><th class="py-2 px-4">Servicio</th><th class="py-2 px-4">Fecha</th><th class="py-2 px-4">Horario</th><th class="py-2 px-4 text-right">Acción</th></tr></thead><tbody>${blockRows || '<tr><td colspan="4" class="p-4 text-center text-stone-400 italic">No hay bloqueos activos</td></tr>'}</tbody></table></div>
        </div>
        <div class="pt-3 border-t border-stone-200 dark:border-stone-800 space-y-3">
          <div class="grid grid-cols-1 sm:grid-cols-4 gap-2"><input type="date" id="new-hol-date" min="${today}" class="bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 text-xs outline-none"><input type="text" id="new-hol-desc" placeholder="Motivo (ej. Mantenimiento)..." class="sm:col-span-2 bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 text-xs outline-none"><button onclick="AdminL3System.addCustomHoliday()" class="py-2 px-3 rounded-xl admin-glass-btn font-bold text-xs flex items-center justify-center gap-1.5">${svg('plus')}<span>Bloquear Fecha</span></button></div>
          <div id="l3-holidays-monthly-container" class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs"></div>
        </div>
      </div>
      <div class="admin-card space-y-4"><div class="pb-3 border-b border-stone-200 dark:border-stone-800"><h3 class="font-bold text-sm text-stone-900 dark:text-stone-100 font-title">Señas & Medios de Pago Activos</h3><p class="text-xs text-stone-500">Alias/CBU por rubro, porcentaje o monto fijo de seña y medios habilitados.</p></div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><label for="l3-input-alias" class="block text-stone-500 text-xs mb-1 font-semibold">Alias Transferencia (MP / Banco):</label><div class="flex gap-1.5"><input type="text" id="l3-input-alias" value="${aliasVal}" class="flex-1 min-w-0 bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 text-xs font-mono outline-none"><button type="button" id="btn-l3-copy-alias" onclick="AdminL3System.copyAlias()" class="px-3 py-1.5 rounded-xl admin-glass-btn text-xs font-bold shrink-0">Copiar</button></div></div><div><label for="l3-input-cbu" class="block text-stone-500 text-xs mb-1 font-semibold">CBU / CVU (22 dígitos):</label><input type="text" id="l3-input-cbu" maxlength="22" value="${cbuVal}" class="w-full bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2 text-xs font-mono outline-none"></div></div>
        <div id="l3-payment-config-mount"></div>
      </div>
      <div class="admin-card space-y-4"><div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-200 dark:border-stone-800"><div><h3 class="font-bold text-sm text-stone-900 dark:text-stone-100 font-title">WhatsApp & Plantillas de Notificación</h3><p class="text-xs text-stone-500">Recordatorios automáticos, vinculación QR de WhatsApp y plantillas por reserva.</p></div><button type="button" id="btn-l3-open-qr" onclick="AdminL3System.openBaileysModal()" class="px-3 py-1.5 rounded-xl admin-glass-btn text-xs font-bold">Vincular QR de WhatsApp</button></div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2"><label class="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 text-xs font-semibold cursor-pointer"><input type="checkbox" id="l3-rem-24h" ${rem24 ? 'checked' : ''} class="accent-[#800000]"><span>Recordatorio 24 hs antes</span></label><label class="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 text-xs font-semibold cursor-pointer"><input type="checkbox" id="l3-rem-2h" ${rem2 ? 'checked' : ''} class="accent-[#800000]"><span>Recordatorio 2 hs antes</span></label></div>
        <div id="l3-wa-config-mount"></div>
      </div>
    </div>`;

    renderMonthlyHolidays(state.rubro);
    window.AdminHolidays?.loadHolidays?.(curYear).then(() => renderMonthlyHolidays(state.rubro));
    window.AdminBookingEngine?.mountPaymentConfigPanel({ mountId: 'l3-payment-config-mount', level: 'l3', includeDepositRule: true, onChange: () => { window.AdminL3Core.showToast('Reglas de seña actualizadas'); window.AdminWaTemplates?.renderPreview?.(waOpts()); }, onResetDemo: () => window.AdminL3Core.resetDemoBookings() });
    window.AdminWaTemplates?.mount?.(waOpts());
    ['cfg-biz-name', 'cfg-biz-address', 'l3-input-alias', 'l3-input-cbu', 'l3-rem-24h', 'l3-rem-2h'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.addEventListener('input', () => { syncPayKeys(); window.AdminWaTemplates?.renderPreview?.(waOpts()); }); el.addEventListener('change', () => { syncPayKeys(); window.AdminWaTemplates?.renderPreview?.(waOpts()); }); }
    });
  }

  function syncPayKeys() {
    const state = window.AdminL3Core.state, nr = normR(state.rubro);
    const alias = document.getElementById('l3-input-alias')?.value?.trim() || 'estudio.central.mp';
    const cbu = (document.getElementById('l3-input-cbu')?.value || '').replace(/\D/g, '').slice(0, 22) || '0000003100012345678901';
    const reminders = { h24: document.getElementById('l3-rem-24h')?.checked !== false, h2: document.getElementById('l3-rem-2h')?.checked !== false };
    const payCfg = { alias, cbu, rem2h: reminders.h2, reminders };
    try {
      window.AdminL3Core.setStorage(`tucu_l3_pay_cfg_${state.rubro}`, payCfg); window.AdminL3Core.setStorage(`tucu_l3_pay_cfg_${nr}`, payCfg);
      localStorage.setItem(`tucu_l3_alias_${state.rubro}`, alias); localStorage.setItem(`tucu_l3_alias_${nr}`, alias); localStorage.setItem('tucu_l3_alias', alias);
      localStorage.setItem(`tucu_l3_cbu_${state.rubro}`, cbu); localStorage.setItem(`tucu_l3_cbu_${nr}`, cbu); localStorage.setItem('tucu_l3_cbu', cbu);
      window.AdminBookingEngine?.saveConfig?.('l3', { ...(window.AdminBookingEngine?.getConfig?.('l3') || {}), alias, cbu, reminders });
      window.AdminL3Telemetry?.renderAutoConfirmBadge?.();
    } catch (_) {}
    return payCfg;
  }

  function copyAlias() {
    const val = document.getElementById('l3-input-alias')?.value?.trim() || 'estudio.central.mp';
    if (navigator.clipboard) navigator.clipboard.writeText(val).catch(() => {});
    window.AdminL3Core.showToast('Alias copiado al portapapeles');
  }

  function openBaileysModal() {
    const modal = document.getElementById('admin-modal-root'), svg = window.AdminL3Core.svg; if (!modal) return;
    modal.innerHTML = `<div id="l3-qr-modal" class="w-full max-w-sm bg-white dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl text-xs"><div class="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800"><h3 class="font-bold text-sm font-title">Vinculación QR de WhatsApp</h3><button type="button" id="btn-l3-close-qr" onclick="AdminL3System.closeBaileysModal()" class="text-stone-400 cursor-pointer">${svg('close')}</button></div><div id="l3-qr-svg-container" class="p-3 bg-white rounded-2xl border border-stone-200 inline-block shadow-inner mx-auto"><svg class="w-36 h-36 mx-auto" viewBox="0 0 120 120" fill="currentColor" aria-label="Código QR de WhatsApp"><rect width="120" height="120" fill="#ffffff"/><path d="M10,10 h35 v35 h-35 z M15,15 v25 h25 v-25 z M20,20 h15 v15 h-15 z M75,10 h35 v35 h-35 z M80,15 v25 h25 v-25 z M85,20 h15 v15 h-15 z M10,75 h35 v35 h-35 z M15,80 v25 h25 v-25 z M20,85 h15 v15 h-15 z M50,15 h5 v10 h-5 z M60,10 h5 v5 h-5 z M50,30 h10 v5 h-10 z M65,25 h5 v15 h-5 z M10,50 h10 v5 h-10 z M25,50 h15 v5 h-15 z M50,50 h20 v5 h-20 z M80,50 h10 v5 h-10 z M100,50 h10 v10 h-10 z M50,60 h5 v15 h-5 z M60,65 h15 v5 h-15 z M80,60 h5 v10 h-5 z M95,65 h15 v5 h-15 z M50,80 h10 v10 h-10 z M65,80 h10 v5 h-10 z M80,75 h20 v5 h-20 z M105,80 h5 v25 h-5 z M50,95 h5 v15 h-5 z M60,100 h15 v5 h-15 z M80,95 h15 v15 h-15 z" fill="#0f172a"/></svg></div><p class="text-[11px] text-stone-500">Escaneá desde WhatsApp > Dispositivos vinculados para operar en producción.</p><button type="button" onclick="AdminL3System.closeBaileysModal()" class="w-full py-2.5 rounded-xl admin-glass-primary font-bold">Listo / Cerrar</button></div>`;
    modal.classList.remove('hidden');
  }
  function closeBaileysModal() { document.getElementById('admin-modal-root')?.classList.add('hidden'); }

  function addCustomHoliday() {
    const date = document.getElementById('new-hol-date')?.value, desc = document.getElementById('new-hol-desc')?.value?.trim() || 'Cerrado';
    const today = window.AdminShell?.localTodayStr?.() || '';
    if (!date || (today && date < today)) return window.AdminL3Core.showToast('Selecciona una fecha válida (hoy o futura)', 'error');
    const h = (window.AdminL3Core.state.holidays || []).filter(x => x.date !== date);
    h.push({ date, desc, isException: false });
    window.AdminL3Core.setStorage('tucu_l3_holidays', h); window.AdminL3Core.state.holidays = h;
    renderMonthlyHolidays(window.AdminL3Core.state.rubro);
    window.AdminL3Core.showToast('Fecha bloqueada en feriados');
  }

  async function syncArgHolidays() {
    const year = window.AdminHolidays ? window.AdminHolidays.getCurrentYear() : new Date().getFullYear();
    await window.AdminHolidays?.loadHolidays?.(year);
    renderMonthlyHolidays(window.AdminL3Core.state.rubro);
    window.AdminL3Core.showToast(`Feriados argentinos ${year} sincronizados`);
  }

  function addServiceBlock() {
    const srvId = document.getElementById('sb-srv')?.value, date = document.getElementById('sb-date')?.value, start = document.getElementById('sb-start')?.value || '12:00', end = document.getElementById('sb-end')?.value || '16:00';
    const today = window.AdminShell?.localTodayStr?.() || '';
    if (!srvId || !date || (today && date < today)) return window.AdminL3Core.showToast('Completa servicio y fecha futura', 'error');
    const state = window.AdminL3Core.state, srv = state.services.find(s => s.id === srvId), blocks = state.blocks || [];
    blocks.push({ id: 'sb-' + Math.random().toString(36).substring(2, 6), serviceId: srvId, serviceName: srv ? srv.name : 'Servicio', date, start, end });
    window.AdminL3Core.setStorage(`tucu_l3_blocks_${state.rubro}`, blocks); state.blocks = blocks; window.AdminL3Core.renderActiveView();
  }

  async function deleteBlock(id) {
    const state = window.AdminL3Core.state;
    if (window.AdminShell?.confirmAsync) {
      const ok = await window.AdminShell.confirmAsync({ title: '¿Archivar bloqueo de rango?', message: 'La franja volverá a estar disponible conservando el historial de bloqueos.', confirmLabel: 'Sí, archivar' });
      if (!ok) return;
    }
    const now = new Date().toISOString();
    state.blocks = (state.blocks || []).map(b => b.id === id ? { ...b, deletedAt: now } : b);
    window.AdminL3Core.setStorage(`tucu_l3_blocks_${state.rubro}`, state.blocks); window.AdminL3Core.showToast('Bloqueo archivado'); window.AdminL3Core.renderActiveView();
  }

  function saveConfig() {
    const state = window.AdminL3Core.state, p = state.presets[state.rubro] || {};
    const biz = document.getElementById('cfg-biz-name')?.value?.trim() || p.name || 'Estudio Multi-Staff TucuRed';
    const addr = document.getElementById('cfg-biz-address')?.value?.trim() || p.address || '25 de Mayo 480, S. M. de Tucumán';
    try { localStorage.setItem('tucu_l3_biz_name', biz); localStorage.setItem(`tucu_l3_biz_name_${state.rubro}`, biz); localStorage.setItem('tucu_l3_address', addr); localStorage.setItem(`tucu_l3_address_${state.rubro}`, addr); } catch (_) {}
    const bt = document.getElementById('l3-brand-title'), bi = document.getElementById('rubro-indicator');
    if (bt) bt.innerText = biz; if (bi) bi.innerText = biz;
    syncPayKeys();
    const config = { maxAdvanceDays: parseInt(document.getElementById('cfg-days')?.value, 10) || 14, maxActivePerUser: parseInt(document.getElementById('cfg-maxuser')?.value, 10) || 2 };
    window.AdminL3Core.setStorage(`tucu_l3_config_${state.rubro}`, config); state.config = config;
    window.AdminWaTemplates?.renderPreview?.(waOpts());
    window.AdminL3Core.showToast('Parámetros guardados con éxito');
  }

  return { render, copyAlias, openBaileysModal, closeBaileysModal, addCustomHoliday, syncArgHolidays, addServiceBlock, deleteBlock, saveConfig };
})();