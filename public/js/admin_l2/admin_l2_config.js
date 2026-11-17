// Archivo: public/js/admin_l2/admin_l2_config.js
// Config L2: Identidad, Alias/CBU, Recordatorios, Slots Bloqueados, Contactos & Baileys (<= 135 líneas)

(function (global) {
  const curRubro = () => localStorage.getItem('tucu_l2_rubro') || 'estetica';
  const loadOcc = () => { try { return JSON.parse(localStorage.getItem(`tucu_l2_occupied_slots_${curRubro()}`) || localStorage.getItem('tucu_l2_occupied_slots') || '["09:30","11:30","17:00"]'); } catch (_) { return ['09:30', '11:30', '17:00']; } };
  let occupiedSlots = loadOcc();
  const configTabs = ['identidad', 'agenda', 'wa'];

  function switchConfigTab(target) {
    configTabs.forEach(t => {
      const btn = document.getElementById('tab-btn-' + t), sec = document.getElementById('config-content-' + t), isAct = t === target;
      if (btn) btn.className = isAct ? 'config-tab-btn admin-glass-pill is-active px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5' : 'config-tab-btn admin-glass-pill px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5';
      if (sec) sec.classList.toggle('hidden', !isAct);
    });
  }

  function updatePreview() {
    global.AdminWaTemplates?.renderPreview?.({ mountId: 'l2-wa-config-mount', level: 'l2', bizInputId: 'cfg-biz-name', addressInputId: 'cfg-biz-address', aliasInputId: 'l2-input-alias', cbuInputId: 'l2-input-cbu' });
  }

  function saveOcc() {
    localStorage.setItem(`tucu_l2_occupied_slots_${curRubro()}`, JSON.stringify(occupiedSlots));
    localStorage.setItem('tucu_l2_occupied_slots', JSON.stringify(occupiedSlots));
  }

  function renderOccupiedSlots() {
    const c = document.getElementById('occupied-chips-container'); if (!c) return;
    c.innerHTML = occupiedSlots.map((t, idx) => `<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-[#D5CEC2] dark:border-stone-700 text-xs font-mono text-stone-800 dark:text-stone-200"><span>${t}</span><button type="button" onclick="adminL2Config.removeOccupiedSlot(${idx})" class="text-stone-400 hover:text-rose-600 cursor-pointer text-xs font-bold">x</button></span>`).join('');
  }
  function logDeletedOcc(slotsToLog) {
    const r = curRubro(), now = new Date().toISOString(), k = `tucu_l2_occupied_slots_history_${r}`;
    let hist = []; try { hist = JSON.parse(localStorage.getItem(k) || '[]'); } catch (_) {}
    if (!Array.isArray(hist)) hist = [];
    slotsToLog.forEach(t => hist.push({ time: t, deletedAt: now }));
    localStorage.setItem(k, JSON.stringify(hist));
  }
  async function removeOccupiedSlot(idx) {
    const t = occupiedSlots[idx]; if (!t) return;
    if (global.AdminShell?.confirmAsync) {
      const ok = await global.AdminShell.confirmAsync({ title: '¿Desbloquear horario?', message: `El slot ${t} hs volverá a estar disponible conservando el registro histórico.`, confirmLabel: 'Sí, desbloquear' });
      if (!ok) return;
    }
    logDeletedOcc([t]); occupiedSlots.splice(idx, 1); saveOcc(); renderOccupiedSlots(); global.adminL2Core?.showToast('Horario archivado y desbloqueado');
  }
  function addOccupiedSlot() {
    const t = document.getElementById('new-occupied-time')?.value;
    if (!t || occupiedSlots.includes(t)) return global.adminL2Core?.showToast('Horario ya bloqueado o inválido', 'error');
    occupiedSlots.push(t); occupiedSlots.sort(); saveOcc(); renderOccupiedSlots(); global.adminL2Core?.showToast(`Horario ${t} bloqueado`);
  }
  async function resetOccupiedSlots() {
    if (global.AdminShell?.confirmAsync) {
      const ok = await global.AdminShell.confirmAsync({ title: '¿Restablecer horarios bloqueados?', message: 'Los slots actuales pasarán al histórico antes de restaurar los valores iniciales.', confirmLabel: 'Sí, restablecer' });
      if (!ok) return;
    }
    if (occupiedSlots.length) logDeletedOcc(occupiedSlots);
    occupiedSlots = ['09:30', '11:30', '17:00']; saveOcc(); renderOccupiedSlots(); global.adminL2Core?.showToast('Slots restablecidos a valores por defecto');
  }

  function saveGlobalConfig(silent = false) {
    const g = (id) => document.getElementById(id), r = curRubro(), meta = global.AdminDemoSeed?.getRubroMeta?.(r);
    const biz = g('cfg-biz-name')?.value.trim() || meta?.bizName || 'TucuRed Central';
    const addr = g('cfg-biz-address')?.value.trim() || meta?.address || 'Av. Aconquija 1320, Yerba Buena';
    const alias = g('l2-input-alias')?.value.trim() || 'tucured.central.mp';
    const cbu = (g('l2-input-cbu')?.value || '').replace(/\D/g, '').slice(0, 22) || '0000003100012345678901';
    const reminders = { h24: g('l2-rem-24h')?.checked ?? true, h2: g('l2-rem-2h')?.checked ?? true };
    const waTpls = global.AdminWaTemplates?.saveTemplates?.('l2') || {}, wa = global.AdminWaTemplates?.DEMO_WA_NUMBER || '5493815551234';
    localStorage.setItem('tucu_l2_biz_name', biz); localStorage.setItem(`tucu_l2_biz_name_${r}`, biz); localStorage.setItem('tucu_biz_name', biz);
    localStorage.setItem('tucu_l2_address', addr); localStorage.setItem(`tucu_l2_address_${r}`, addr);
    localStorage.setItem('tucu_l2_alias', alias); localStorage.setItem(`tucu_l2_alias_${r}`, alias);
    localStorage.setItem('tucu_l2_cbu', cbu); localStorage.setItem(`tucu_l2_cbu_${r}`, cbu);
    localStorage.setItem(`tucu_l2_pay_cfg_${r}`, JSON.stringify({ alias, cbu, reminders }));
    global.AdminBookingEngine?.saveConfig?.('l2', { alias, cbu, reminders });
    if (g('l2-brand-title')) g('l2-brand-title').textContent = biz;
    localStorage.setItem('tucu_l2_wa_number', wa); localStorage.setItem('tucu_wa_number', wa);
    localStorage.setItem('tucu_l2_days', g('cfg-max-days')?.value || '14');
    if (waTpls.t1a) localStorage.setItem('tucu_l2_template', waTpls.t1a);
    localStorage.setItem('tucu_l2_block_holidays', String(g('cfg-block-holidays')?.checked !== false));
    updatePreview();
    if (!silent) global.adminL2Core?.showToast('Configuración sincronizada con éxito');
  }

  function copyAlias() {
    const a = document.getElementById('l2-input-alias')?.value || 'tucured.central.mp';
    if (navigator.clipboard) navigator.clipboard.writeText(a).catch(() => {});
    global.adminL2Core?.showToast('Alias copiado al portapapeles');
  }

  function init() {
    occupiedSlots = loadOcc();
    configTabs.forEach(t => document.getElementById('tab-btn-' + t)?.addEventListener('click', () => switchConfigTab(t)));
    renderOccupiedSlots();
    document.getElementById('btn-add-occupied-slot')?.addEventListener('click', addOccupiedSlot);
    document.getElementById('btn-reset-occupied')?.addEventListener('click', resetOccupiedSlots);
    document.getElementById('btn-save-global-config')?.addEventListener('click', () => saveGlobalConfig(false));

    if (global.AdminBookingEngine?.mountPaymentConfigPanel) {
      global.AdminBookingEngine.mountPaymentConfigPanel({
        mountId: 'l2-payment-config-mount', level: 'l2', includeDepositRule: true,
        onChange: () => { global.adminL2Services?.renderServices(); global.adminL2Calendar?.renderCalendar(); updatePreview(); },
        onResetDemo: () => { global.adminL2Calendar?.resetDemoBookings(); }
      });
    }

    const r = curRubro(), meta = global.AdminDemoSeed?.getRubroMeta?.(r);
    let payR = {}; try { payR = JSON.parse(localStorage.getItem(`tucu_l2_pay_cfg_${r}`) || '{}'); } catch (_) {}
    const engCfg = global.AdminBookingEngine?.getConfig?.('l2') || {};
    const setV = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    setV('cfg-biz-name', localStorage.getItem(`tucu_l2_biz_name_${r}`) || localStorage.getItem('tucu_l2_biz_name') || meta?.bizName || 'TucuRed Central');
    setV('cfg-biz-address', localStorage.getItem(`tucu_l2_address_${r}`) || localStorage.getItem('tucu_l2_address') || meta?.address || '');
    setV('l2-input-alias', localStorage.getItem(`tucu_l2_alias_${r}`) || payR.alias || localStorage.getItem('tucu_l2_alias') || engCfg.alias || 'tucured.central.mp');
    setV('l2-input-cbu', localStorage.getItem(`tucu_l2_cbu_${r}`) || payR.cbu || localStorage.getItem('tucu_l2_cbu') || engCfg.cbu || '0000003100012345678901');
    const rem = payR.reminders || engCfg.reminders || { h24: true, h2: true };
    if (document.getElementById('l2-rem-24h')) document.getElementById('l2-rem-24h').checked = rem.h24 !== false;
    if (document.getElementById('l2-rem-2h')) document.getElementById('l2-rem-2h').checked = rem.h2 !== false;

    ['cfg-biz-name', 'cfg-biz-address', 'l2-input-alias', 'l2-input-cbu', 'l2-rem-24h', 'l2-rem-2h', 'cfg-max-days'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.addEventListener('input', () => saveGlobalConfig(true)); el.addEventListener('change', () => saveGlobalConfig(true)); }
    });
    global.AdminWaTemplates?.mount?.({ mountId: 'l2-wa-config-mount', level: 'l2', bizInputId: 'cfg-biz-name', addressInputId: 'cfg-biz-address', aliasInputId: 'l2-input-alias', cbuInputId: 'l2-input-cbu', onChange: () => updatePreview() });
  }

  global.adminL2Config = {
    init, switchConfigTab, updatePreview, copyAlias, renderOccupiedSlots, addOccupiedSlot, removeOccupiedSlot, resetOccupiedSlots, saveGlobalConfig,
    openQrWizard: (s) => global.adminL2BaileysModal?.openQrWizard?.(s), closeQrWizard: () => global.adminL2BaileysModal?.closeQrWizard?.(),
    showQrStep: (s) => global.adminL2BaileysModal?.showQrStep?.(s), openBaileysModalL2: () => global.adminL2BaileysModal?.openBaileysModalL2?.()
  };
})(typeof window !== 'undefined' ? window : global);