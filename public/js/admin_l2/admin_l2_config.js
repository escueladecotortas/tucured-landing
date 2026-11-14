// Archivo: public/js/admin_l2/admin_l2_config.js
// Config L2: WhatsApp Baileys, Tokens, Importador L2 & Guardado Global (Nexus OS v11.1 - < 160 líneas)

(function (global) {
  let occupiedSlots = JSON.parse(localStorage.getItem('tucu_l2_occupied_slots') || '["09:30", "11:30", "17:00"]');
  const configTabs = ['identidad', 'agenda', 'wa', 'l2'];

  function switchConfigTab(target) {
    configTabs.forEach(t => {
      const btn = document.getElementById('tab-btn-' + t), sec = document.getElementById('config-content-' + t);
      const isAct = t === target;
      if (btn) btn.className = isAct
        ? 'config-tab-btn admin-glass-pill is-active px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5'
        : 'config-tab-btn admin-glass-pill px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5';
      if (sec) sec.classList.toggle('hidden', !isAct);
    });
  }

  function insertToken(tok) {
    const t = document.getElementById('cfg-msg-template');
    if (t) { t.value += tok; updatePreview(); }
  }

  function updatePreview() {
    const t = document.getElementById('cfg-msg-template'), p = document.getElementById('wa-bubble-preview');
    if (!t || !p) return;
    const biz = document.getElementById('cfg-biz-name')?.value || 'TucuRed Central';
    p.textContent = (t.value || '')
      .replace(/\{\{id\}\}/g, 'TK-8492').replace(/\{\{cliente\}\}/g, 'Juan Pérez')
      .replace(/\{\{fecha\}\}/g, 'Lunes 24 de Agosto').replace(/\{\{hora\}\}/g, '10:30')
      .replace(/\{\{personas\}\}/g, '2').replace(/\{\{comercio\}\}/g, biz)
      .replace(/\{\{telefono\}\}/g, '3811234567').replace(/\{\{link\}\}/g, `${window.location.origin}/gestion_turno.html?token=TK-8492`);
  }

  function showQrStep(step) {
    [1, 2, 3].forEach(s => document.getElementById('qr-wizard-step-' + s)?.classList.toggle('hidden', s !== step));
  }
  function openQrWizard() { const m = document.getElementById('wa-qr-wizard-modal'); if (m) { m.classList.remove('hidden'); m.classList.add('flex'); showQrStep(1); } }
  function closeQrWizard() { const m = document.getElementById('wa-qr-wizard-modal'); if (m) { m.classList.add('hidden'); m.classList.remove('flex'); } }

  function renderOccupiedSlots() {
    const c = document.getElementById('occupied-chips-container');
    if (!c) return;
    c.innerHTML = occupiedSlots.map((t, idx) => `
      <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-[#D5CEC2] dark:border-stone-700 text-xs font-mono text-stone-800 dark:text-stone-200">
        <span>${t}</span><button type="button" onclick="adminL2Config.removeOccupiedSlot(${idx})" class="text-stone-400 hover:text-rose-600 cursor-pointer text-xs font-bold">x</button>
      </span>
    `).join('');
  }

  function removeOccupiedSlot(idx) {
    occupiedSlots.splice(idx, 1);
    localStorage.setItem('tucu_l2_occupied_slots', JSON.stringify(occupiedSlots));
    renderOccupiedSlots();
    global.adminL2Core?.showToast('Horario desbloqueado');
  }

  function addOccupiedSlot() {
    const t = document.getElementById('new-occupied-time')?.value;
    if (!t || occupiedSlots.includes(t)) return global.adminL2Core?.showToast('Horario ya bloqueado o inválido', 'error');
    occupiedSlots.push(t); occupiedSlots.sort();
    localStorage.setItem('tucu_l2_occupied_slots', JSON.stringify(occupiedSlots));
    renderOccupiedSlots();
    global.adminL2Core?.showToast(`Horario ${t} bloqueado`);
  }

  function resetOccupiedSlots() {
    occupiedSlots = ["09:30", "11:30", "17:00"];
    localStorage.setItem('tucu_l2_occupied_slots', JSON.stringify(occupiedSlots));
    renderOccupiedSlots();
    global.adminL2Core?.showToast('Slots restablecidos a valores por defecto');
  }

  function handleImportFile(file) {
    const name = (file?.name || '').toLowerCase(), reader = new FileReader();
    reader.onload = function(evt) {
      const content = evt.target.result;
      if (name.endsWith('.csv') || name.endsWith('.vcf')) {
        let added = 0; const wl = JSON.parse(localStorage.getItem('tucu_l2_whitelist') || '[]');
        content.split('\n').filter(l => l.trim().length > 0).forEach(l => {
          const parts = l.split(/[,;]/);
          if (parts.length >= 2) {
            const cName = parts[0].trim(), cPhone = global.adminL2Core?.sanitizeCleanPhone(parts[1]);
            if (cName && cPhone.length >= 8) { wl.push({ name: cName, phone: cPhone, category: 'VIP Importado' }); added++; }
          }
        });
        localStorage.setItem('tucu_l2_whitelist', JSON.stringify(wl));
        if (global.adminL2CRM?.renderCRM) global.adminL2CRM.renderCRM();
        global.adminL2Core?.showToast(`Se importaron ${added} contactos a Lista Blanca`);
      } else if (name.endsWith('.ics')) {
        occupiedSlots.push('14:30', '15:30');
        occupiedSlots = Array.from(new Set(occupiedSlots)).sort();
        localStorage.setItem('tucu_l2_occupied_slots', JSON.stringify(occupiedSlots));
        renderOccupiedSlots();
        global.adminL2Core?.showToast('Agenda .ics importada con éxito');
      } else {
        global.adminL2Core?.showToast('Formato no soportado (.csv, .vcf, .ics)', 'error');
      }
    };
    reader.readAsText(file);
  }

  function saveGlobalConfig() {
    const g = (id) => document.getElementById(id);
    const biz = g('cfg-biz-name')?.value.trim() || 'TucuRed Central';
    const wa = global.adminL2Core?.sanitizeCleanPhone(g('cfg-wa-number')?.value);
    localStorage.setItem('tucu_l2_biz_name', biz); localStorage.setItem('tucu_biz_name', biz);
    localStorage.setItem('tucu_l2_wa_number', wa); localStorage.setItem('tucu_wa_number', wa);
    const ivSel = g('cfg-interval')?.value || '30';
    const ivCustom = parseInt(g('cfg-interval-custom')?.value, 10);
    const interval = ivSel === 'custom' ? Math.min(480, Math.max(5, isNaN(ivCustom) ? 30 : ivCustom)) : ivSel;
    localStorage.setItem('tucu_l2_interval', String(interval));
    localStorage.setItem('tucu_l2_days', g('cfg-max-days')?.value || '14');
    localStorage.setItem('tucu_l2_template', g('cfg-msg-template')?.value || '');
    localStorage.setItem('tucu_l2_block_holidays', String(g('cfg-block-holidays')?.checked));
    global.adminL2Core?.showToast('Configuración sincronizada con éxito');
  }

  function init() {
    configTabs.forEach(t => document.getElementById('tab-btn-' + t)?.addEventListener('click', () => switchConfigTab(t)));
    document.getElementById('cfg-msg-template')?.addEventListener('input', updatePreview);
    document.getElementById('btn-open-qr-modal')?.addEventListener('click', openQrWizard);
    document.getElementById('btn-close-qr-wizard')?.addEventListener('click', closeQrWizard);
    document.getElementById('btn-wizard-go-qr')?.addEventListener('click', () => showQrStep(2));
    document.getElementById('btn-wizard-simulate-success')?.addEventListener('click', () => showQrStep(3));
    document.getElementById('btn-wizard-finish')?.addEventListener('click', () => {
      closeQrWizard();
      const b = document.getElementById('wa-node-status-badge');
      if (b) { b.textContent = 'ONLINE'; b.className = 'px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'; }
      global.adminL2Core?.showToast('Sesión de Baileys vinculada correctamente');
    });

    const mLogout = document.getElementById('wa-logout-modal');
    document.getElementById('btn-open-logout-modal')?.addEventListener('click', () => { mLogout?.classList.remove('hidden'); mLogout?.classList.add('flex'); });
    document.getElementById('btn-cancel-logout')?.addEventListener('click', () => { mLogout?.classList.add('hidden'); mLogout?.classList.remove('flex'); });
    document.getElementById('btn-confirm-logout')?.addEventListener('click', () => {
      mLogout?.classList.add('hidden'); mLogout?.classList.remove('flex');
      const b = document.getElementById('wa-node-status-badge');
      if (b) { b.textContent = 'OFFLINE'; b.className = 'px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'; }
      global.adminL2Core?.showToast('Sesión desvinculada');
    });

    renderOccupiedSlots();
    document.getElementById('btn-add-occupied-slot')?.addEventListener('click', addOccupiedSlot);
    document.getElementById('btn-reset-occupied')?.addEventListener('click', resetOccupiedSlots);

    const drop = document.getElementById('drop-zone-l2'), inpF = document.getElementById('file-input-l2');
    drop?.addEventListener('click', () => inpF?.click());
    drop?.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('border-red-900', 'bg-red-50/40'); });
    drop?.addEventListener('dragleave', () => drop.classList.remove('border-red-900', 'bg-red-50/40'));
    drop?.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('border-red-900', 'bg-red-50/40'); if (e.dataTransfer.files.length) handleImportFile(e.dataTransfer.files[0]); });
    inpF?.addEventListener('change', (e) => { if (e.target.files.length) handleImportFile(e.target.files[0]); });
    document.getElementById('btn-save-global-config')?.addEventListener('click', saveGlobalConfig);
    if (global.AdminBookingEngine?.mountPaymentConfigPanel) {
      global.AdminBookingEngine.mountPaymentConfigPanel({
        mountId: 'l2-payment-config-mount', level: 'l2', includeDepositRule: true,
        onChange: () => { global.adminL2Calendar?.renderCalendar(); },
        onResetDemo: () => { global.adminL2Calendar?.resetDemoBookings(); }
      });
    }

    const ivEl = document.getElementById('cfg-interval'), ivCust = document.getElementById('cfg-interval-custom');
    if (ivEl) {
      const savedIv = localStorage.getItem('tucu_l2_interval') || '30';
      if (['15', '30', '45', '60'].includes(savedIv)) { ivEl.value = savedIv; ivCust?.classList.add('hidden'); }
      else { ivEl.value = 'custom'; if (ivCust) { ivCust.value = savedIv; ivCust.classList.remove('hidden'); } }
      ivEl.addEventListener('change', () => ivCust?.classList.toggle('hidden', ivEl.value !== 'custom'));
    }
    const savedName = localStorage.getItem('tucu_l2_biz_name') || localStorage.getItem('tucu_biz_name');
    if (savedName && document.getElementById('cfg-biz-name')) document.getElementById('cfg-biz-name').value = savedName;
    const defaultTpl = "¡Hola! Quiero confirmar mi reserva en {{comercio}}:\n- 🎟️ ID: #{{id}}\n- 👤 Nombre: {{cliente}}\n- 📅 Día: {{fecha}}\n- ⏰ Hora: {{hora}}\n- 👥 Personas: {{personas}}\n- 📞 Tel: {{telefono}}\n- 🔗 Autogestión: {{link}}\n¿Me confirman disponibilidad?";
    const savedTpl = localStorage.getItem('tucu_l2_template') || defaultTpl;
    if (document.getElementById('cfg-msg-template')) { document.getElementById('cfg-msg-template').value = savedTpl; updatePreview(); }
  }

  global.adminL2Config = { init, switchConfigTab, insertToken, updatePreview, openQrWizard, closeQrWizard, showQrStep, renderOccupiedSlots, addOccupiedSlot, removeOccupiedSlot, resetOccupiedSlots, handleImportFile, saveGlobalConfig };
})(typeof window !== 'undefined' ? window : global);
