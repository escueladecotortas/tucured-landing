// Archivo: public/js/admin_l1/admin_l1_config.js
// Horarios 2 Bloques (Mañana/Tarde), Feriados Oficiales & Gateway Baileys (Nexus OS v11.1 - < 165 líneas)

(function (global) {
  const dayNames = { 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 0: 'Domingo' };
  const dSched = (en, s, c2) => ({ enabled: en, open: '09:00', close: '13:00', isSplit: s, open2: '17:00', close2: c2 || '21:30' });
  const defaultSchedule = { 1: dSched(true, true), 2: dSched(true, true), 3: dSched(true, true), 4: dSched(true, true), 5: dSched(true, true), 6: dSched(true, true, '21:00'), 0: dSched(false, false) };

  let schedule = {}, configData = {
    requireDeposit: true, depositType: 'percentage', depositValue: 50,
    alias: 'peluqueria.central.mp', cbu: '0000003100012345678901', waNumber: '5493815551234',
    reminders: { h24: true, h2: true }, blockHolidays: true,
    template: '¡Hola {{cliente}}! Cita en {{comercio}} para el {{fecha}} a las {{hora}} hs. Seña requerida: {{monto_seña}} (Alias: {{alias}}, CBU: {{cbu}}).'
  };

  function loadLocal() {
    try { schedule = JSON.parse(localStorage.getItem('tucu_schedule')) || defaultSchedule; } catch (_) { schedule = defaultSchedule; }
    try { configData = { ...configData, ...JSON.parse(localStorage.getItem('tucu_l1_cfg_ext') || '{}') }; } catch (_) {}
  }

  function renderSchedule() {
    const box = document.getElementById('weekly-schedule-compact-container');
    if (!box) return;
    box.innerHTML = [1, 2, 3, 4, 5, 6, 0].map(d => {
      const s = schedule[d] || { enabled: false, open: '09:00', close: '13:00', isSplit: false, open2: '17:00', close2: '21:30' };
      const cardBg = s.enabled ? 'bg-white dark:bg-[#1C1A19]' : 'bg-[#FBFBF9]/60 dark:bg-[#121110]/60 opacity-40 grayscale';
      return `<div class="p-3.5 rounded-2xl border border-[#E8E6DF] dark:border-[#2D2A28] ${cardBg} shadow-xs space-y-2 transition-all">
        <div class="flex items-center justify-between">
          <label class="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" onchange="adminL1Config.toggleDay(${d}, this.checked)" ${s.enabled ? 'checked' : ''} class="w-4 h-4 rounded accent-[#800000] focus:ring-0">
            <span class="text-xs font-bold text-[#1C1A17] dark:text-[#F5F3EF]">${dayNames[d]}</span>
          </label>
          <span class="text-[10px] font-semibold text-[#7A766E] dark:text-[#9E9A93]">${s.enabled ? (s.isSplit ? '2 Turnos' : '1 Turno') : 'Cerrado'}</span>
        </div>
        ${s.enabled ? `<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
          <div class="bg-[#FBFBF9] dark:bg-[#121110] p-2 rounded-xl border border-[#E8E6DF]/70 dark:border-[#2D2A28]/70">
            <span class="block text-[9px] text-[#7A766E] dark:text-[#9E9A93] uppercase font-bold mb-1">Mañana</span>
            <div class="flex items-center gap-1">
              <input type="time" value="${s.open || '09:00'}" onchange="adminL1Config.updateHour(${d}, 'open', this.value)" class="w-full min-w-[85px] bg-white dark:bg-[#1C1A19] border border-[#E8E6DF] dark:border-[#2D2A28] rounded-lg px-2 py-1 text-xs text-center font-mono outline-none">
              <span class="text-[#7A766E]">-</span>
              <input type="time" value="${s.close || '13:00'}" onchange="adminL1Config.updateHour(${d}, 'close', this.value)" class="w-full min-w-[85px] bg-white dark:bg-[#1C1A19] border border-[#E8E6DF] dark:border-[#2D2A28] rounded-lg px-2 py-1 text-xs text-center font-mono outline-none">
            </div>
          </div>
          <div class="bg-[#FBFBF9] dark:bg-[#121110] p-2 rounded-xl border border-[#E8E6DF]/70 dark:border-[#2D2A28]/70 ${s.isSplit ? '' : 'opacity-40'}">
            <div class="flex items-center justify-between mb-1"><span class="text-[9px] text-[#7A766E] dark:text-[#9E9A93] uppercase font-bold">Tarde</span><button type="button" onclick="adminL1Config.toggleSplit(${d})" class="text-[9px] text-red-900 dark:text-red-400 font-bold cursor-pointer hover:underline">${s.isSplit ? 'Activo' : 'Activar'}</button></div>
            <div class="flex items-center gap-1">
              <input type="time" value="${s.open2 || '17:00'}" ${s.isSplit ? '' : 'disabled'} onchange="adminL1Config.updateHour(${d}, 'open2', this.value)" class="w-full min-w-[85px] bg-white dark:bg-[#1C1A19] border border-[#E8E6DF] dark:border-[#2D2A28] rounded-lg px-2 py-1 text-xs text-center font-mono outline-none disabled:opacity-40">
              <span class="text-[#7A766E]">-</span>
              <input type="time" value="${s.close2 || '21:30'}" ${s.isSplit ? '' : 'disabled'} onchange="adminL1Config.updateHour(${d}, 'close2', this.value)" class="w-full min-w-[85px] bg-white dark:bg-[#1C1A19] border border-[#E8E6DF] dark:border-[#2D2A28] rounded-lg px-2 py-1 text-xs text-center font-mono outline-none disabled:opacity-40">
            </div>
          </div>
        </div>` : ''}
      </div>`;
    }).join('');
  }

  function populateInputs() {
    const v = (id) => document.getElementById(id);
    if (v('cfg-deposit-toggle')) v('cfg-deposit-toggle').checked = configData.requireDeposit !== false;
    if (v('cfg-deposit-type')) v('cfg-deposit-type').value = configData.depositType || 'percentage';
    if (v('cfg-deposit-value')) v('cfg-deposit-value').value = configData.depositValue || 50;
    if (v('inputAlias')) v('inputAlias').value = localStorage.getItem('tucu_l1_alias') || configData.alias;
    if (v('inputCbu')) v('inputCbu').value = localStorage.getItem('tucu_l1_cbu') || configData.cbu;
    if (v('cfg-wa-number')) v('cfg-wa-number').value = localStorage.getItem('tucu_l1_wa_number') || configData.waNumber;
    if (v('chk-remind-24h')) v('chk-remind-24h').checked = configData.reminders?.h24 !== false;
    if (v('chk-remind-2h')) v('chk-remind-2h').checked = configData.reminders?.h2 !== false;
    if (v('cfg-feriados-toggle')) v('cfg-feriados-toggle').checked = localStorage.getItem('tucu_l1_feriados') !== 'false';
    if (v('cfg-msg-template')) v('cfg-msg-template').value = localStorage.getItem('tucu_l1_template') || configData.template;
    updatePreview();
  }

  function saveConfig() {
    const v = (id) => document.getElementById(id);
    const prevExt = global.AdminBookingEngine ? global.AdminBookingEngine.getConfig('l1') : {};
    configData = {
      ...prevExt,
      requireDeposit: v('cfg-deposit-toggle')?.checked ?? true,
      depositType: v('cfg-deposit-type')?.value || 'percentage',
      depositValue: Math.max(0, parseInt(v('cfg-deposit-value')?.value, 10) || 0),
      alias: v('inputAlias')?.value.trim() || configData.alias,
      cbu: v('inputCbu')?.value.trim().replace(/\D/g, '') || configData.cbu,
      waNumber: v('cfg-wa-number')?.value.trim().replace(/\D/g, '') || configData.waNumber,
      reminders: { h24: v('chk-remind-24h')?.checked ?? true, h2: v('chk-remind-2h')?.checked ?? true },
      blockHolidays: v('cfg-feriados-toggle')?.checked ?? true,
      template: v('cfg-msg-template')?.value || configData.template,
      schedule
    };
    localStorage.setItem('tucu_schedule', JSON.stringify(schedule));
    if (global.AdminBookingEngine) global.AdminBookingEngine.saveConfig('l1', configData);
    else localStorage.setItem('tucu_l1_cfg_ext', JSON.stringify(configData));
    if (global.adminL1Pricing?.renderPricing) global.adminL1Pricing.renderPricing();
    localStorage.setItem('tucu_l1_alias', configData.alias);
    localStorage.setItem('tucu_l1_cbu', configData.cbu);
    localStorage.setItem('tucu_l1_wa_number', configData.waNumber);
    localStorage.setItem('tucu_l1_template', configData.template);
    localStorage.setItem('tucu_l1_feriados', configData.blockHolidays ? 'true' : 'false');
    const slug = localStorage.getItem('tucu_l1_slug') || 'demo-peluqueria';
    if (slug && !slug.startsWith('demo') && window.location.port !== '5174') {
      fetch(`/api/portal/${slug}/config`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(configData) }).catch(() => {});
    }
    updatePreview();
    const toast = document.getElementById('saveToast');
    if (toast) { toast.classList.remove('hidden'); setTimeout(() => toast.classList.add('hidden'), 2200); }
  }

  function updatePreview() {
    const tplEl = document.getElementById('cfg-msg-template'), prevEl = document.getElementById('wa-bubble-preview');
    if (!tplEl || !prevEl) return;
    const biz = localStorage.getItem('tucu_l1_biz_name') || 'Peluquería & Barbería Central';
    const alias = document.getElementById('inputAlias')?.value || configData.alias;
    const cbu = document.getElementById('inputCbu')?.value || configData.cbu;
    prevEl.innerText = tplEl.value
      .replace(/\{\{cliente\}\}/g, 'Martín').replace(/\{\{comercio\}\}/g, biz)
      .replace(/\{\{fecha\}\}/g, 'Hoy').replace(/\{\{hora\}\}/g, '17:30')
      .replace(/\{\{monto_seña\}\}/g, configData.depositType === 'percentage' ? '$4.000 (50%)' : `$${configData.depositValue}`)
      .replace(/\{\{alias\}\}/g, alias).replace(/\{\{cbu\}\}/g, cbu);
  }

  function copyAlias() {
    const a = document.getElementById('inputAlias')?.value || configData.alias;
    if (navigator.clipboard) navigator.clipboard.writeText(a).catch(() => {});
    const t = document.getElementById('saveToast'); if (t) { t.classList.remove('hidden'); setTimeout(() => t.classList.add('hidden'), 2000); }
  }

  function openBaileysModal() {
    const root = document.getElementById('dynamicModalRoot');
    if (!root) return;
    const wa = localStorage.getItem('tucu_l1_wa_number') || configData.waNumber || '5493815551234';
    root.innerHTML = `<div id="baileysModal" class="fixed inset-0 z-50 bg-[#121110]/85 backdrop-blur-md flex items-center justify-center p-4">
      <div class="w-full max-w-sm rounded-2xl border border-[#E8E6DF] dark:border-[#2D2A28] bg-white dark:bg-[#1C1A19] p-6 shadow-2xl text-center space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-[#E8E6DF] dark:border-[#2D2A28]">
          <h3 class="text-sm font-bold text-[#1C1A17] dark:text-[#F5F3EF] flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span><span>Gateway WhatsApp (Baileys)</span></h3>
          <button type="button" onclick="adminL1Config.closeBaileysModal()" aria-label="Cerrar" class="p-1 text-[#7A766E] hover:text-[#1C1A17] dark:hover:text-white cursor-pointer"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button>
        </div>
        <div class="p-3 bg-white rounded-xl border border-slate-200 inline-block shadow-inner mx-auto">
          <svg class="w-36 h-36 mx-auto" viewBox="0 0 120 120" fill="currentColor"><rect width="120" height="120" fill="white" /><path d="M10,10 h35 v35 h-35 z M15,15 v25 h25 v-25 z M20,20 h15 v15 h-15 z M75,10 h35 v35 h-35 z M80,15 v25 h25 v-25 z M85,20 h15 v15 h-15 z M10,75 h35 v35 h-35 z M15,80 v25 h25 v-25 z M20,85 h15 v15 h-15 z M50,15 h5 v10 h-5 z M60,10 h5 v5 h-5 z M50,30 h10 v5 h-10 z M65,25 h5 v15 h-5 z M10,50 h10 v5 h-10 z M25,50 h15 v5 h-15 z M50,50 h20 v5 h-20 z M80,50 h10 v5 h-10 z M100,50 h10 v10 h-10 z M50,60 h5 v15 h-5 z M60,65 h15 v5 h-15 z M80,60 h5 v10 h-5 z M95,65 h15 v5 h-15 z M50,80 h10 v10 h-10 z M65,80 h10 v5 h-10 z M80,75 h20 v5 h-20 z M105,80 h5 v25 h-5 z M50,95 h5 v15 h-5 z M60,100 h15 v5 h-15 z M80,95 h15 v15 h-15 z" fill="#0f172a" /></svg>
        </div>
        <div class="space-y-1">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span><span>WhatsApp Conectado · ${wa}</span></span>
          <p class="text-[11px] text-[#7A766E] dark:text-[#9E9A93] pt-1 leading-relaxed">Dispositivos vinculados > Escanear QR para sincronizar el bot despachador.</p>
        </div>
        <button type="button" onclick="adminL1Config.closeBaileysModal()" class="w-full py-2 rounded-xl text-xs font-bold admin-glass-primary">Listo / Cerrar</button>
      </div>
    </div>`;
  }

  function closeBaileysModal() { const root = document.getElementById('dynamicModalRoot'); if (root) root.innerHTML = ''; }

  function init() {
    loadLocal(); renderSchedule(); populateInputs();
    if (global.AdminHolidays) { global.AdminHolidays.renderLabel('l1-holidays-label'); global.AdminHolidays.loadHolidays(); }
    if (global.AdminBookingEngine?.mountPaymentConfigPanel) {
      global.AdminBookingEngine.mountPaymentConfigPanel({
        mountId: 'l1-payment-methods-mount', level: 'l1', includeDepositRule: false,
        onChange: () => { configData = { ...configData, ...global.AdminBookingEngine.getConfig('l1') }; },
        onResetDemo: () => { const slug = localStorage.getItem('tucu_l1_slug') || 'demo-peluqueria'; global.adminL1Agenda?.resetDemoBookings(slug); }
      });
    }
    ['cfg-deposit-toggle', 'cfg-deposit-type', 'cfg-deposit-value', 'inputAlias', 'inputCbu', 'cfg-wa-number', 'chk-remind-24h', 'chk-remind-2h', 'cfg-feriados-toggle', 'cfg-msg-template'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.addEventListener('input', saveConfig); el.addEventListener('change', saveConfig); }
    });
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else setTimeout(init, 50);
  }

  global.adminL1Config = {
    toggleDay: (d, en) => { schedule[d].enabled = en; saveConfig(); renderSchedule(); },
    toggleSplit: (d) => { schedule[d].isSplit = !schedule[d].isSplit; saveConfig(); renderSchedule(); },
    updateHour: (d, f, v) => { schedule[d][f] = v; saveConfig(); },
    cloneLunVie: () => { const ref = schedule[2] || schedule[1]; [1,2,3,4,5].forEach(d => { if (schedule[d]) schedule[d] = JSON.parse(JSON.stringify(ref)); }); saveConfig(); renderSchedule(); },
    saveConfig, copyAlias, updatePreview, openBaileysModal, closeBaileysModal, getConfigData: () => configData
  };
})(typeof window !== 'undefined' ? window : global);
