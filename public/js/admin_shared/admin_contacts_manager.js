// Archivo: public/js/admin_shared/admin_contacts_manager.js
// Gestor Unificado de Clientes L2/L3: Bloqueo, Restauración, Email, Cumpleaños & E.164 (<= 175L)

(function (global) {
  const parser = () => global.AdminContactsParser;
  const store = () => global.AdminContactsStore;
  const normTxt = (s) => (global.AdminShell?.normStr ? global.AdminShell.normStr(s) : String(s || '').toLowerCase());
  const instances = {};

  function renderFilterPills(lvl, all, activeFilter) {
    const box = document.getElementById(`contacts-filters-${lvl}`); if (!box) return;
    const archivedCnt = all.filter(c => c.deletedAt).length;
    const restrictedCnt = all.filter(c => !c.deletedAt && c.isRestricted).length;
    const activeCnt = all.filter(c => !c.deletedAt).length;
    const pills = [
      ['active', `Activos (${activeCnt - restrictedCnt})`],
      ['restricted', `Restringidos (${restrictedCnt})`],
      ['archived', `Archivados (${archivedCnt})`]
    ];
    box.innerHTML = pills.map(([k, lbl]) => {
      const on = activeFilter === k;
      return `<button type="button" data-ct-filter="${k}" onclick="AdminContactsManager.setFilter('${lvl}','${k}')" class="admin-glass-pill ${on ? 'is-active font-bold' : 'font-semibold'} px-3 py-1 rounded-full text-[11px] cursor-pointer">${lbl}</button>`;
    }).join('');
  }

  function renderList(lvl) {
    const inst = instances[lvl]; if (!inst) return;
    const rubro = inst.getRubro(), all = store().loadAll(lvl, rubro), q = normTxt(inst.search || '');
    const f = inst.filter || 'active';
    renderFilterPills(lvl, all, f);
    const byStatus = all.filter(c => f === 'archived' ? Boolean(c.deletedAt) : (!c.deletedAt && (f === 'restricted' ? c.isRestricted : !c.isRestricted)));
    const filtered = byStatus.filter(c => !q || normTxt(c.name).includes(q) || normTxt(c.phone).includes(q) || normTxt(c.email).includes(q) || normTxt(c.notes).includes(q));
    const cnt = document.getElementById(`contacts-count-${lvl}`), box = document.getElementById(`contacts-list-${lvl}`);
    if (cnt) cnt.textContent = `${all.filter(c => !c.deletedAt).length} clientes`;
    if (!box) return;
    box.innerHTML = filtered.length === 0
      ? `<p class="text-xs text-stone-500 text-center py-6">${f === 'archived' ? 'No hay clientes archivados.' : 'No hay clientes que coincidan.'}</p>`
      : filtered.map(c => {
        const restBadge = c.isRestricted ? '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800">Restringido</span>' : '';
        const emailChip = c.email ? `<span class="text-[10px] px-2 py-0.5 rounded-lg bg-white dark:bg-stone-800 border border-[#D5CEC2] dark:border-stone-700 text-stone-600 dark:text-stone-300">${c.email}</span>` : '';
        const bdayChip = c.birthday ? `<span class="text-[10px] px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 tabular-nums">Cumple: ${c.birthday}</span>` : '';
        const actions = c.deletedAt
          ? `<button type="button" data-ct-restore="${c.id}" onclick="AdminContactsManager.restoreContact('${lvl}','${c.id}')" class="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold cursor-pointer">Restaurar</button>`
          : `<button type="button" data-ct-edit="${c.id}" onclick="AdminContactsManager.openForm('${lvl}','${c.id}')" class="px-2.5 py-1 rounded-lg admin-glass-btn text-[11px] font-semibold">Editar</button>
             <button type="button" data-ct-restrict="${c.id}" onclick="AdminContactsManager.toggleRestrict('${lvl}','${c.id}')" class="px-2.5 py-1 rounded-lg text-[11px] font-semibold border cursor-pointer ${c.isRestricted ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'}">${c.isRestricted ? 'Desbloquear' : 'Bloquear'}</button>
             <button type="button" data-ct-del="${c.id}" onclick="AdminContactsManager.deleteContact('${lvl}','${c.id}')" class="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[11px] font-semibold cursor-pointer">Archivar</button>`;
        return `<div class="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/70 border border-[#D5CEC2] dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div class="min-w-0 space-y-1"><div class="flex items-center gap-2 flex-wrap"><strong class="text-stone-900 dark:text-stone-100">${c.name}</strong>${restBadge}${c.source ? `<span class="text-[10px] px-2 py-0.5 rounded-full bg-white dark:bg-stone-800 border border-[#D5CEC2] dark:border-stone-700 text-stone-500">${c.source}</span>` : ''}</div>
            <p class="tabular-nums text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">${c.displayPhone || c.phone}</p>
            ${(emailChip || bdayChip) ? `<div class="flex items-center gap-1.5 flex-wrap">${emailChip}${bdayChip}</div>` : ''}
            ${c.notes ? `<p class="text-[11px] text-stone-500 truncate">${c.notes}</p>` : ''}</div>
          <div class="flex items-center gap-1.5 shrink-0 self-end sm:self-center">${actions}</div></div>`;
      }).join('');
  }

  function openForm(lvl, id = '') {
    const inst = instances[lvl], wrap = document.getElementById(`contacts-form-wrap-${lvl}`);
    if (!inst || !wrap) return;
    const item = id ? store().loadAll(lvl, inst.getRubro()).find(c => c.id === id) : null;
    const s = (k, v) => { const el = document.getElementById(`ct-${k}-${lvl}`); if (el) el.value = v || ''; };
    s('id', item?.id); s('name', item?.name); s('phone', item?.phone); s('email', item?.email); s('birthday', item?.birthday); s('notes', item?.notes);
    wrap.classList.remove('hidden');
  }

  function closeForm(lvl) { document.getElementById(`contacts-form-wrap-${lvl}`)?.classList.add('hidden'); }

  function saveContact(lvl) {
    const inst = instances[lvl]; if (!inst) return;
    const g = (k) => document.getElementById(`ct-${k}-${lvl}`)?.value?.trim() || '';
    const res = store().saveRecord(lvl, inst.getRubro(), { id: g('id'), name: g('name'), phone: g('phone'), email: g('email'), birthday: g('birthday'), notes: g('notes') });
    if (!res.ok) return inst.onToast(res.error, 'error');
    closeForm(lvl); renderList(lvl); inst.onToast(`Cliente ${res.record.name} (${res.record.phoneE164}) guardado`);
  }

  function toggleRestrict(lvl, id) {
    const inst = instances[lvl]; if (!inst || !id) return;
    const upd = store().mutateById(lvl, inst.getRubro(), id, (c) => ({ ...c, isRestricted: !c.isRestricted }));
    if (upd) { renderList(lvl); inst.onToast(upd.isRestricted ? `${upd.name} marcado como Restringido` : `${upd.name} desbloqueado`); }
  }

  async function deleteContact(lvl, id) {
    const inst = instances[lvl]; if (!inst || !id) return;
    if (global.AdminShell?.confirmAsync) {
      const ok = await global.AdminShell.confirmAsync({ title: '¿Archivar cliente?', message: 'El cliente pasará a Archivados y podrás restaurarlo cuando lo necesites.', confirmLabel: 'Sí, archivar' });
      if (!ok) return;
    }
    store().mutateById(lvl, inst.getRubro(), id, (c) => ({ ...c, deletedAt: new Date().toISOString() }));
    renderList(lvl); inst.onToast('Cliente archivado (restaurable desde Archivados)');
  }

  function restoreContact(lvl, id) {
    const inst = instances[lvl]; if (!inst || !id) return;
    const upd = store().mutateById(lvl, inst.getRubro(), id, (c) => ({ ...c, deletedAt: null }));
    if (upd) { inst.filter = 'active'; renderList(lvl); inst.onToast(`${upd.name} restaurado a clientes activos`); }
  }

  function processBatch(lvl, rawContacts) {
    const inst = instances[lvl]; if (!inst) return;
    const res = store().importBatch(lvl, inst.getRubro(), rawContacts);
    if (!res.ok) return inst.onToast('No se detectaron teléfonos válidos', 'error');
    renderList(lvl); inst.onToast(`Importación: ${res.added} nuevos, ${res.updated} actualizados (${res.duplicatesCount} dup)`);
  }

  async function importFromDevice(lvl) {
    const inst = instances[lvl]; if (!inst) return;
    if (!parser()?.isDevicePickerSupported?.()) return inst.onToast('Selector nativo disponible en Android/Chrome; usá .vcf o .csv en Desktop', 'error');
    try { const list = await parser().pickDeviceContacts(); if (list?.length) processBatch(lvl, list); }
    catch (e) { inst.onToast('No se pudieron importar contactos: ' + (e.message || 'cancelado'), 'error'); }
  }

  function handleFile(lvl, file) {
    const inst = instances[lvl]; if (!inst || !file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const txt = ev.target?.result || '', list = file.name.toLowerCase().endsWith('.vcf') ? parser().parseVcf(txt) : parser().parseCsv(txt);
      if (!list.length) return inst.onToast('Sin contactos válidos en el archivo', 'error');
      processBatch(lvl, list);
    };
    reader.readAsText(file);
  }

  function mount({ containerId, level, getRubro, onToast }) {
    const box = document.getElementById(containerId); if (!box) return;
    const lvl = level || 'l2';
    instances[lvl] = { containerId, getRubro: getRubro || (() => 'estetica'), onToast: onToast || (() => {}), search: '', filter: 'active' };
    const pickerOk = parser()?.isDevicePickerSupported?.();
    box.innerHTML = `<div class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-stone-100 dark:border-stone-800">
        <div><h4 class="text-sm font-bold text-stone-900 dark:text-stone-100 font-title">Clientes y Contactos <span id="contacts-count-${lvl}" class="ml-1.5 text-[11px] tabular-nums text-stone-500">0 clientes</span></h4><p class="text-[11px] text-stone-500">Gestioná tu base de clientes, datos de contacto y promociones.</p></div>
        <div class="flex flex-wrap gap-2">
          <button type="button" id="btn-contacts-device-${lvl}" onclick="AdminContactsManager.importFromDevice('${lvl}')" class="px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${pickerOk ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' : 'admin-glass-btn text-stone-600'}">Importar desde Contactos del Celular</button>
          <label class="px-3 py-1.5 rounded-xl admin-glass-btn text-xs font-semibold cursor-pointer"><span>Subir .vcf / .csv</span><input type="file" id="inp-contacts-file-${lvl}" accept=".vcf,.csv,text/vcard,text/csv" class="hidden"></label>
          <button type="button" id="btn-contacts-new-${lvl}" onclick="AdminContactsManager.openForm('${lvl}')" class="px-3 py-1.5 rounded-xl admin-glass-primary text-xs font-bold">Nuevo Contacto</button>
        </div>
      </div>
      <div id="contacts-form-wrap-${lvl}" class="hidden p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-800 space-y-2.5 text-xs">
        <input type="hidden" id="ct-id-${lvl}">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5"><div><label class="block text-[10px] font-bold uppercase text-stone-500 mb-1">Nombre y Apellido</label><input type="text" id="ct-name-${lvl}" placeholder="Ej. Sofía Núñez" class="w-full bg-white dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl px-3 py-1.5 outline-none"></div><div><label class="block text-[10px] font-bold uppercase text-stone-500 mb-1">Teléfono / WhatsApp</label><input type="tel" id="ct-phone-${lvl}" placeholder="Ej. 3815551234" class="w-full bg-white dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl px-3 py-1.5 tabular-nums outline-none"></div></div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5"><div><label class="block text-[10px] font-bold uppercase text-stone-500 mb-1">Correo Electrónico</label><input type="email" id="ct-email-${lvl}" placeholder="cliente@correo.com" class="w-full bg-white dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl px-3 py-1.5 outline-none"></div><div><label class="block text-[10px] font-bold uppercase text-stone-500 mb-1">Cumpleaños</label><input type="date" id="ct-birthday-${lvl}" class="w-full bg-white dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl px-3 py-1.5 outline-none"></div><div><label class="block text-[10px] font-bold uppercase text-stone-500 mb-1">Notas</label><input type="text" id="ct-notes-${lvl}" placeholder="Preferencias o referencia" class="w-full bg-white dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl px-3 py-1.5 outline-none"></div></div>
        <div class="flex justify-end gap-2"><button type="button" onclick="AdminContactsManager.closeForm('${lvl}')" class="px-3 py-1.5 rounded-xl admin-glass-btn font-semibold">Cancelar</button><button type="button" id="btn-ct-save-${lvl}" onclick="AdminContactsManager.saveContact('${lvl}')" class="px-4 py-1.5 rounded-xl admin-glass-primary font-bold">Guardar Contacto</button></div>
      </div>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"><div id="contacts-filters-${lvl}" class="flex flex-wrap gap-1.5"></div><input type="text" id="contacts-search-${lvl}" placeholder="Buscar por nombre, teléfono o email..." class="w-full sm:w-72 bg-stone-50 dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-800 rounded-xl px-3 py-1.5 text-xs outline-none"></div>
      <div id="contacts-list-${lvl}" class="space-y-2 max-h-[420px] overflow-y-auto pr-1.5 custom-scrollbar"></div>
    </div>`;
    document.getElementById(`contacts-search-${lvl}`)?.addEventListener('input', (e) => { instances[lvl].search = e.target.value; renderList(lvl); });
    document.getElementById(`inp-contacts-file-${lvl}`)?.addEventListener('change', (e) => { if (e.target.files?.[0]) handleFile(lvl, e.target.files[0]); });
    renderList(lvl);
  }

  global.AdminContactsManager = { mount, renderList, setFilter: (lvl, f) => { if (instances[lvl]) { instances[lvl].filter = f; renderList(lvl); } }, openForm, closeForm, saveContact, toggleRestrict, deleteContact, restoreContact, processBatch, importFromDevice, handleFile };
})(typeof window !== 'undefined' ? window : global);
