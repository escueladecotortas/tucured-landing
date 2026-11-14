// Archivo: public/js/admin_l2/admin_l2_crm.js
// CRM & Gobernanza L2: Lista Blanca (VIP) & Lista Restringida sin Acentos (Nexus OS v11.1 - < 130 líneas)

(function (global) {
  let whitelist = [], blacklist = [], searchQuery = '';
  const norm = (s) => (global.AdminShell ? global.AdminShell.normStr(s) : String(s || '').toLowerCase());
  const SVG_STAR = '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>';
  const SVG_BAN = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>';
  const SVG_TEL = '<svg class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>';

  function loadData() {
    try {
      whitelist = JSON.parse(localStorage.getItem('tucu_l2_whitelist') || '[{"name":"Mariana López","phone":"3814123456","category":"VIP"},{"name":"Facundo Gómez","phone":"3815987654","category":"VIP"}]');
      blacklist = JSON.parse(localStorage.getItem('tucu_l2_blacklist') || '[{"name":"Inasistencias reiteradas","phone":"3810001122","reason":"3 ausencias consecutivas"}]');
    } catch (_) { whitelist = []; blacklist = []; }
  }

  function renderCRM() {
    const wlTable = document.getElementById('crm-whitelist-table'), blTable = document.getElementById('crm-blacklist-table');
    const q = norm(searchQuery);

    if (wlTable) {
      const activeWl = whitelist.map((c, idx) => ({ c, idx })).filter(({ c }) => !c.deletedAt);
      const filteredWl = activeWl.filter(({ c }) => norm(c.name).includes(q) || norm(c.phone).includes(q));
      wlTable.innerHTML = filteredWl.length === 0
        ? '<div class="p-6 text-xs text-stone-500 text-center">No hay clientes VIP que coincidan con la búsqueda.</div>'
        : filteredWl.map(({ c, idx }) => `
          <div class="p-3.5 px-4 flex items-center justify-between hover:bg-stone-50/80 dark:hover:bg-stone-900/40 transition-colors">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800 text-amber-700 dark:text-amber-400 flex items-center justify-center">${SVG_STAR}</div>
              <div><span class="text-xs font-bold text-stone-900 dark:text-stone-100">${c.name}</span><p class="text-[11px] text-stone-500 dark:text-stone-400 font-mono flex items-center gap-1">${SVG_TEL}<span>${c.phone}</span></p></div>
            </div>
            <button type="button" onclick="adminL2CRM.removeWhitelist(${idx})" class="text-xs font-semibold text-stone-500 hover:text-rose-600 px-2.5 py-1 rounded-lg admin-glass-btn">Eliminar</button>
          </div>`).join('');
      const cnt = document.getElementById('crm-wl-count'); if (cnt) cnt.textContent = activeWl.length;
    }

    if (blTable) {
      const activeBl = blacklist.map((c, idx) => ({ c, idx })).filter(({ c }) => !c.deletedAt);
      const filteredBl = activeBl.filter(({ c }) => norm(c.name).includes(q) || norm(c.phone).includes(q) || norm(c.reason).includes(q));
      blTable.innerHTML = filteredBl.length === 0
        ? '<div class="p-6 text-xs text-stone-500 text-center">No hay números restringidos.</div>'
        : filteredBl.map(({ c, idx }) => `
          <div class="p-3.5 px-4 flex items-center justify-between hover:bg-stone-50/80 dark:hover:bg-stone-900/40 transition-colors">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800 text-rose-700 dark:text-rose-400 flex items-center justify-center">${SVG_BAN}</div>
              <div><span class="text-xs font-bold text-rose-600 dark:text-rose-400">${c.name || 'Restringido'}</span><p class="text-[11px] text-stone-500 dark:text-stone-400 font-mono flex items-center gap-1">${SVG_TEL}<span>${c.phone}${c.reason ? ' · ' + c.reason : ''}</span></p></div>
            </div>
            <button type="button" onclick="adminL2CRM.removeBlacklist(${idx})" class="text-xs font-semibold text-stone-500 hover:text-emerald-600 px-2.5 py-1 rounded-lg admin-glass-btn">Desbloquear</button>
          </div>`).join('');
      const cnt = document.getElementById('crm-bl-count'); if (cnt) cnt.textContent = activeBl.length;
    }
  }

  function removeWhitelist(i) { if (whitelist[i]) { whitelist[i].deletedAt = new Date().toISOString(); localStorage.setItem('tucu_l2_whitelist', JSON.stringify(whitelist)); renderCRM(); global.adminL2Core?.showToast('Cliente archivado de Lista Blanca'); } }
  function removeBlacklist(i) { if (blacklist[i]) { blacklist[i].deletedAt = new Date().toISOString(); localStorage.setItem('tucu_l2_blacklist', JSON.stringify(blacklist)); renderCRM(); global.adminL2Core?.showToast('Número desbloqueado de Lista Negra'); } }

  function addWhitelist() {
    const nameEl = document.getElementById('new-wl-name'), phoneEl = document.getElementById('new-wl-phone');
    const name = nameEl?.value.trim(), phone = global.adminL2Core?.sanitizeCleanPhone(phoneEl?.value);
    if (!name || !phone) return global.adminL2Core?.showToast('Completa nombre y teléfono', 'error');
    whitelist.push({ name, phone, category: 'VIP' }); localStorage.setItem('tucu_l2_whitelist', JSON.stringify(whitelist));
    if (nameEl) nameEl.value = ''; if (phoneEl) phoneEl.value = '';
    renderCRM(); global.adminL2Core?.showToast('Cliente VIP guardado');
  }

  function addBlacklist() {
    const nameEl = document.getElementById('new-bl-name'), phoneEl = document.getElementById('new-bl-phone');
    const name = nameEl?.value.trim() || 'Bloqueo Manual', phone = global.adminL2Core?.sanitizeCleanPhone(phoneEl?.value);
    if (!phone || phone.length < 8) return global.adminL2Core?.showToast('Ingresa un teléfono válido', 'error');
    blacklist.push({ name, phone, reason: 'Restricción preventiva' }); localStorage.setItem('tucu_l2_blacklist', JSON.stringify(blacklist));
    if (nameEl) nameEl.value = ''; if (phoneEl) phoneEl.value = '';
    renderCRM(); global.adminL2Core?.showToast('Número bloqueado en Lista Negra');
  }

  function switchCrmTab(tab) {
    const isWl = tab === 'whitelist';
    document.getElementById('crm-container-whitelist')?.classList.toggle('hidden', !isWl);
    document.getElementById('crm-container-blacklist')?.classList.toggle('hidden', isWl);
    const bWl = document.getElementById('crm-tab-whitelist'), bBl = document.getElementById('crm-tab-blacklist');
    if (bWl) bWl.className = isWl ? 'crm-subtab admin-glass-pill is-active px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2' : 'crm-subtab admin-glass-pill px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2';
    if (bBl) bBl.className = !isWl ? 'crm-subtab px-4 py-2 rounded-xl text-xs font-bold bg-rose-700 text-white shadow-xs flex items-center gap-2 cursor-pointer' : 'crm-subtab admin-glass-pill px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2';
  }

  function init() {
    loadData(); renderCRM();
    document.getElementById('crm-search-input')?.addEventListener('input', (e) => { searchQuery = e.target.value.trim(); renderCRM(); });
    document.getElementById('btn-add-whitelist')?.addEventListener('click', addWhitelist);
    document.getElementById('btn-add-blacklist')?.addEventListener('click', addBlacklist);
    document.getElementById('crm-tab-whitelist')?.addEventListener('click', () => switchCrmTab('whitelist'));
    document.getElementById('crm-tab-blacklist')?.addEventListener('click', () => switchCrmTab('blacklist'));
  }

  global.adminL2CRM = { init, renderCRM, addWhitelist, removeWhitelist, addBlacklist, removeBlacklist, switchCrmTab };
})(typeof window !== 'undefined' ? window : global);