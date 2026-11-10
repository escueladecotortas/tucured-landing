// Archivo: public/js/admin_l2/admin_l2_crm.js
// CRM & Gobernanza L2: Lista Blanca (VIP) & Lista Negra (Nexus OS v11.1 - < 160 líneas)

(function (global) {
  let whitelist = [];
  let blacklist = [];
  let searchQuery = '';

  function loadData() {
    try {
      whitelist = JSON.parse(localStorage.getItem('tucu_l2_whitelist') || '[{"name":"Mariana López","phone":"3814123456","category":"VIP"},{"name":"Facundo Gómez","phone":"3815987654","category":"VIP"}]');
      blacklist = JSON.parse(localStorage.getItem('tucu_l2_blacklist') || '[{"name":"Spam / Inasistencias","phone":"3810001122","reason":"3 ausencias consecutivas"}]');
    } catch (_) {
      whitelist = [];
      blacklist = [];
    }
  }

  function renderCRM() {
    const wlTable = document.getElementById('crm-whitelist-table');
    const blTable = document.getElementById('crm-blacklist-table');
    const q = searchQuery.toLowerCase();

    if (wlTable) {
      const filteredWl = whitelist.filter(c => (c.name || '').toLowerCase().includes(q) || (c.phone || '').includes(q));
      wlTable.innerHTML = filteredWl.length === 0
        ? '<div class="p-6 text-xs text-slate-500 dark:text-slate-400 text-center">No hay clientes VIP que coincidan con la búsqueda.</div>'
        : filteredWl.map((c, i) => `
          <div class="p-3.5 px-4 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800 text-amber-700 dark:text-amber-400 flex items-center justify-center text-xs font-bold">★</div>
              <div>
                <span class="text-xs font-bold text-slate-900 dark:text-slate-100">${c.name}</span>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 font-mono">📞 ${c.phone}</p>
              </div>
            </div>
            <button type="button" onclick="adminL2CRM.removeWhitelist(${i})" class="text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer px-2.5 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40">Eliminar</button>
          </div>
        `).join('');
      const countEl = document.getElementById('crm-wl-count');
      if (countEl) countEl.textContent = whitelist.length;
    }

    if (blTable) {
      const filteredBl = blacklist.filter(c => (c.name || '').toLowerCase().includes(q) || (c.phone || '').includes(q));
      blTable.innerHTML = filteredBl.length === 0
        ? '<div class="p-6 text-xs text-slate-500 dark:text-slate-400 text-center">No hay números restringidos.</div>'
        : filteredBl.map((c, i) => `
          <div class="p-3.5 px-4 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800 text-rose-700 dark:text-rose-400 flex items-center justify-center text-xs font-bold">🚫</div>
              <div>
                <span class="text-xs font-bold text-rose-600 dark:text-rose-400">${c.name || 'Restringido'}</span>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 font-mono">📞 ${c.phone} ${c.reason ? '• ' + c.reason : ''}</p>
              </div>
            </div>
            <button type="button" onclick="adminL2CRM.removeBlacklist(${i})" class="text-xs font-semibold text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer px-2.5 py-1 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40">Desbloquear</button>
          </div>
        `).join('');
      const countEl = document.getElementById('crm-bl-count');
      if (countEl) countEl.textContent = blacklist.length;
    }
  }

  function removeWhitelist(i) {
    whitelist.splice(i, 1);
    localStorage.setItem('tucu_l2_whitelist', JSON.stringify(whitelist));
    renderCRM();
    global.adminL2Core?.showToast('Cliente removido de Lista Blanca');
  }

  function removeBlacklist(i) {
    blacklist.splice(i, 1);
    localStorage.setItem('tucu_l2_blacklist', JSON.stringify(blacklist));
    renderCRM();
    global.adminL2Core?.showToast('Número desbloqueado de Lista Negra');
  }

  function addWhitelist() {
    const nameEl = document.getElementById('new-wl-name');
    const phoneEl = document.getElementById('new-wl-phone');
    const name = nameEl?.value.trim();
    const phone = global.adminL2Core?.sanitizeCleanPhone(phoneEl?.value);
    if (!name || !phone) return global.adminL2Core?.showToast('Completa nombre y teléfono', 'error');

    whitelist.push({ name, phone, category: 'VIP' });
    localStorage.setItem('tucu_l2_whitelist', JSON.stringify(whitelist));
    if (nameEl) nameEl.value = '';
    if (phoneEl) phoneEl.value = '';
    renderCRM();
    global.adminL2Core?.showToast('Cliente VIP guardado');
  }

  function addBlacklist() {
    const nameEl = document.getElementById('new-bl-name');
    const phoneEl = document.getElementById('new-bl-phone');
    const name = nameEl?.value.trim() || 'Bloqueo Manual';
    const phone = global.adminL2Core?.sanitizeCleanPhone(phoneEl?.value);
    if (!phone || phone.length < 8) return global.adminL2Core?.showToast('Ingresa un teléfono válido', 'error');

    blacklist.push({ name, phone, reason: 'Restricción preventiva' });
    localStorage.setItem('tucu_l2_blacklist', JSON.stringify(blacklist));
    if (nameEl) nameEl.value = '';
    if (phoneEl) phoneEl.value = '';
    renderCRM();
    global.adminL2Core?.showToast('Número bloqueado en Lista Negra');
  }

  function switchCrmTab(tab) {
    const isWl = tab === 'whitelist';
    const cWl = document.getElementById('crm-container-whitelist');
    const cBl = document.getElementById('crm-container-blacklist');
    const bWl = document.getElementById('crm-tab-whitelist');
    const bBl = document.getElementById('crm-tab-blacklist');

    if (cWl) cWl.classList.toggle('hidden', !isWl);
    if (cBl) cBl.classList.toggle('hidden', isWl);

    if (bWl) {
      bWl.className = isWl
        ? 'crm-subtab px-4 py-2 rounded-xl text-xs font-bold transition-all bg-indigo-600 text-white shadow-xs flex items-center gap-2 cursor-pointer'
        : 'crm-subtab px-4 py-2 rounded-xl text-xs font-semibold transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-2 cursor-pointer';
    }

    if (bBl) {
      bBl.className = !isWl
        ? 'crm-subtab px-4 py-2 rounded-xl text-xs font-bold transition-all bg-rose-600 text-white shadow-xs flex items-center gap-2 cursor-pointer'
        : 'crm-subtab px-4 py-2 rounded-xl text-xs font-semibold transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-2 cursor-pointer';
    }
  }

  function init() {
    loadData();
    renderCRM();

    document.getElementById('crm-search-input')?.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      renderCRM();
    });

    document.getElementById('btn-add-whitelist')?.addEventListener('click', addWhitelist);
    document.getElementById('btn-add-blacklist')?.addEventListener('click', addBlacklist);
    document.getElementById('crm-tab-whitelist')?.addEventListener('click', () => switchCrmTab('whitelist'));
    document.getElementById('crm-tab-blacklist')?.addEventListener('click', () => switchCrmTab('blacklist'));
  }

  global.adminL2CRM = { init, renderCRM, addWhitelist, removeWhitelist, addBlacklist, removeBlacklist, switchCrmTab };
})(typeof window !== 'undefined' ? window : global);

