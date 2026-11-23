// Archivo: public/js/admin_l2/admin_l2_services.js
// Catálogo de Servicios L2: Seña Individual, Duración Estándar/Libre, Orden e Historial (< 175L)

(function (global) {
  const DEFAULT_L2_SERVICES = [
    { id: 'srv-l2-1', order: 1, name: 'Sesión Central Pro', duration: 45, price: 16000, description: 'Atención integral con bloqueo automático de horario.', isActive: true, requireDeposit: true, priceHistory: [] },
    { id: 'srv-l2-2', order: 2, name: 'Tratamiento Integral', duration: 60, price: 12000, description: 'Prestación completa con seguimiento en agenda.', isActive: true, requireDeposit: true, priceHistory: [] },
    { id: 'srv-l2-3', order: 3, name: 'Atención Express', duration: 30, price: 9000, description: 'Turno rápido en franja prioritaria.', isActive: true, requireDeposit: true, priceHistory: [] }
  ];
  const STD_DUR = ['15', '30', '45', '60', '90'];
  const eng = () => global.AdminBookingEngine;
  const fmt = (n) => (eng() ? eng().fmt(n) : '$' + Number(n || 0).toLocaleString('es-AR'));
  let editingId = null;

  function srvCtx() {
    const p = new URLSearchParams(window.location.search), slug = p.get('slug') || '';
    const isCustom = Boolean(slug && !slug.startsWith('demo-') && slug !== 'mi-comercio');
    const rawR = p.get('rubro') || (slug.startsWith('demo-') && slug !== 'demo-central' ? slug : '') || localStorage.getItem('tucu_l2_rubro') || 'estetica';
    const rubro = global.AdminDemoSeed?.resolveRubro ? global.AdminDemoSeed.resolveRubro(rawR) : 'estetica';
    return { isCustom, rubro, key: isCustom ? `tucu_l2_services_${slug}` : `tucu_l2_services_${rubro}` };
  }

  function normalizeList(list) {
    return (list || []).map((s, idx) => ({ ...s, order: Number(s.order) || idx + 1, duration: Math.max(5, Number(s.duration || s.durationMinutes || 30)), price: Math.max(0, Number(s.price ?? s.priceNumeric ?? 10000)), requireDeposit: s.requireDeposit !== false, priceHistory: Array.isArray(s.priceHistory) ? s.priceHistory : [] })).sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  function getServices(includeDeleted = false) {
    const { isCustom, rubro, key } = srvCtx();
    try {
      const raw = JSON.parse(localStorage.getItem(key) || 'null') || (!isCustom && rubro === (localStorage.getItem('tucu_l2_rubro') || 'estetica') ? JSON.parse(localStorage.getItem('tucu_l2_services') || 'null') : null);
      if (Array.isArray(raw) && raw.length) {
        const norm = normalizeList(raw);
        return includeDeleted ? norm : norm.filter(s => !s.deletedAt);
      }
    } catch (_) {}
    const seed = global.AdminDemoSeed?.getServicesSeed ? global.AdminDemoSeed.getServicesSeed(rubro, 'l2') : DEFAULT_L2_SERVICES.map(s => ({ ...s }));
    return normalizeList(seed);
  }

  function saveServices(list, msg = 'Catálogo L2 actualizado') {
    const { key, rubro, isCustom } = srvCtx();
    const sorted = normalizeList(list);
    try {
      localStorage.setItem(key, JSON.stringify(sorted));
      if (!isCustom) {
        localStorage.setItem(`tucu_l2_services_demo-${rubro}`, JSON.stringify(sorted));
        localStorage.setItem('tucu_l2_services', JSON.stringify(sorted));
      }
    } catch (_) {}
    renderServices();
    global.adminL2Calendar?.populateServiceSelect?.();
    global.adminL2Core?.showToast(msg);
  }

  function toggleActive(id) {
    const all = getServices(true), item = all.find(s => s.id === id);
    if (!item) return;
    item.isActive = item.isActive === false;
    saveServices(all, item.isActive ? 'Servicio reactivado' : 'Servicio pausado');
  }

  function updateOrder(id, newOrder) {
    const all = getServices(true), item = all.find(s => s.id === id);
    if (item) { item.order = Math.max(1, parseInt(newOrder, 10) || 1); saveServices(all, 'Orden actualizado'); }
  }

  async function deleteService(id) {
    if (getServices(false).length <= 1) return global.adminL2Core?.showToast('Conserva al menos un servicio activo', 'error');
    if (global.AdminShell?.confirmAsync) {
      const ok = await global.AdminShell.confirmAsync({ title: '¿Archivar servicio?', message: 'El servicio dejará de ofrecerse al público manteniendo intacto su historial.', confirmLabel: 'Sí, archivar' });
      if (!ok) return;
    }
    const all = getServices(true), item = all.find(s => s.id === id);
    if (item) { item.deletedAt = new Date().toISOString(); item.isActive = false; saveServices(all, 'Servicio archivado'); }
  }

  function onDurationChange(val) {
    document.getElementById('l2-srv-dur-custom-wrap')?.classList.toggle('hidden', val !== 'custom');
  }

  function setModalDuration(mins) {
    const sel = document.getElementById('l2-srv-dur-sel'), inp = document.getElementById('l2-srv-dur'), str = String(mins || 30);
    if (STD_DUR.includes(str)) { if (sel) sel.value = str; if (inp) inp.value = str; onDurationChange(str); }
    else { if (sel) sel.value = 'custom'; if (inp) inp.value = String(mins || 45); onDurationChange('custom'); }
  }

  function openModal(id = null) {
    editingId = id;
    const item = id ? getServices(false).find(s => s.id === id) : null;
    const m = document.getElementById('l2-service-modal'); if (!m) return;
    document.getElementById('l2-srv-modal-title').textContent = item ? 'Editar Servicio' : 'Nuevo Servicio';
    document.getElementById('l2-srv-name').value = item?.name || '';
    document.getElementById('l2-srv-price').value = item?.price || 12000;
    document.getElementById('l2-srv-order').value = item?.order || (getServices(false).length + 1);
    setModalDuration(item?.duration || 45);
    document.getElementById('l2-srv-desc').value = item?.description || '';
    document.getElementById('l2-srv-require-deposit').checked = item ? item.requireDeposit !== false : true;
    m.classList.remove('hidden'); m.classList.add('flex');
  }

  function closeModal() {
    const m = document.getElementById('l2-service-modal');
    if (m) { m.classList.add('hidden'); m.classList.remove('flex'); }
    editingId = null;
  }

  function saveModal() {
    const name = document.getElementById('l2-srv-name')?.value.trim();
    const price = parseInt(String(document.getElementById('l2-srv-price')?.value || '').replace(/\D/g, ''), 10) || 0;
    const selDur = document.getElementById('l2-srv-dur-sel')?.value;
    const duration = parseInt(selDur === 'custom' ? document.getElementById('l2-srv-dur')?.value : selDur, 10);
    const order = Math.max(1, parseInt(document.getElementById('l2-srv-order')?.value, 10) || 1);
    const description = document.getElementById('l2-srv-desc')?.value.trim() || 'Prestación profesional reservable online.';
    const requireDeposit = document.getElementById('l2-srv-require-deposit')?.checked !== false;
    if (!name || price <= 0 || isNaN(duration) || duration < 5 || duration > 480) return global.adminL2Core?.showToast('Verifica nombre, precio (>0) y duración (5-480 min)', 'error');
    const all = getServices(true);
    if (editingId) {
      const it = all.find(s => s.id === editingId);
      if (it) {
        it.priceHistory = Array.isArray(it.priceHistory) ? it.priceHistory : [];
        if (Number(it.price) !== price) it.priceHistory.push({ previousPrice: Number(it.price), newPrice: price, changedAt: new Date().toISOString() });
        Object.assign(it, { name, price, priceNumeric: price, duration, durationMinutes: duration, order, description, requireDeposit });
      }
    } else {
      all.push({ id: 'srv-l2-' + Date.now(), order, name, price, priceNumeric: price, duration, durationMinutes: duration, description, isActive: true, requireDeposit, priceHistory: [] });
    }
    saveServices(all, editingId ? 'Servicio actualizado' : 'Servicio creado');
    closeModal();
  }

  function showPriceHistory(id) {
    const item = getServices(false).find(s => s.id === id), root = document.getElementById('l2-dynamic-modal-root');
    if (!item || !root) return;
    const hist = [...(item.priceHistory || [])].reverse();
    root.innerHTML = `<div id="l2-price-history-modal" class="fixed inset-0 z-50 bg-stone-900/75 backdrop-blur-sm flex items-center justify-center p-4"><div class="w-full max-w-sm rounded-2xl border border-[#D5CEC2] dark:border-stone-800 bg-white dark:bg-[#181B22] p-5 space-y-3 shadow-2xl text-xs"><div class="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2"><h3 class="font-bold text-sm font-title">Historial · ${item.name}</h3><button type="button" onclick="document.getElementById('l2-dynamic-modal-root').innerHTML=''" class="text-stone-400 cursor-pointer">Cerrar</button></div><div class="space-y-1.5 max-h-60 overflow-y-auto">${hist.map(h => `<div class="p-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-800 flex justify-between"><span>${fmt(h.previousPrice)} &rarr; <strong>${fmt(h.newPrice)}</strong></span><span class="text-stone-500 tabular-nums">${String(h.changedAt).slice(0, 10)}</span></div>`).join('') || '<p class="text-stone-500">Sin cambios registrados.</p>'}</div></div></div>`;
  }

  function renderServices() {
    const box = document.getElementById('l2-services-container'), badge = document.getElementById('l2-services-count');
    if (!box) return;
    const list = getServices(false);
    if (badge) badge.textContent = `${list.length} servicios`;
    box.innerHTML = list.map(s => {
      const act = s.isActive !== false, req = s.requireDeposit !== false;
      const dep = eng() ? eng().calcDeposit(s.price, 'l2', req) : (req ? Math.round(s.price * 0.5) : 0);
      const depTxt = req && dep > 0 ? `Seña: ${fmt(dep)}` : 'Sin seña';
      const hist = s.priceHistory || [], lastAdj = hist.length ? `<button type="button" onclick="adminL2Services.showPriceHistory('${s.id}')" class="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-semibold cursor-pointer">Últ. ajuste: ${fmt(hist[hist.length - 1].previousPrice)} &rarr; ${fmt(hist[hist.length - 1].newPrice)} (${hist.length})</button>` : '';
      return `<div class="admin-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${act ? '' : 'opacity-55'}">
        <div class="flex items-center gap-3 min-w-0">
          <div class="flex flex-col items-center shrink-0 w-12"><span class="text-[9px] uppercase text-stone-400 font-bold">Orden</span><input type="number" min="1" value="${s.order || 1}" onchange="adminL2Services.updateOrder('${s.id}', this.value)" class="w-10 text-center text-xs bg-stone-100 dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-800 rounded-lg py-1 tabular-nums font-bold outline-none"></div>
          <div class="min-w-0 space-y-0.5">
            <div class="flex items-center gap-2 flex-wrap"><h4 class="text-sm font-bold text-stone-900 dark:text-stone-100 ${act ? '' : 'line-through'}">${s.name}</h4><span class="text-[10px] px-2 py-0.5 rounded-full font-semibold ${act ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-100 text-stone-500'}">${act ? 'Activo' : 'Pausado'}</span>${lastAdj}</div>
            <p class="text-xs text-stone-500">${s.description || ''}</p>
            <p class="text-xs font-semibold text-stone-700 dark:text-stone-300">${fmt(s.price)} · ${s.duration} min · <span class="${req && dep > 0 ? 'tucu-primary-text' : 'text-emerald-700 dark:text-emerald-400'}">${depTxt}</span></p>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button type="button" onclick="adminL2Services.toggleActive('${s.id}')" class="px-3 py-1.5 rounded-xl admin-glass-btn text-xs font-semibold">${act ? 'Pausar' : 'Activar'}</button>
          <button type="button" onclick="adminL2Services.openModal('${s.id}')" class="px-3 py-1.5 rounded-xl admin-glass-primary text-xs font-bold">Editar</button>
          <button type="button" onclick="adminL2Services.deleteService('${s.id}')" class="px-2.5 py-1.5 rounded-xl bg-rose-50 text-rose-600 text-xs font-semibold cursor-pointer">Archivar</button>
        </div>
      </div>`;
    }).join('');
  }

  function init() {
    document.getElementById('btn-l2-new-service')?.addEventListener('click', () => openModal(null));
    document.getElementById('btn-l2-srv-cancel')?.addEventListener('click', closeModal);
    document.getElementById('btn-l2-srv-save')?.addEventListener('click', saveModal);
    renderServices();
  }
  global.adminL2Services = { init, getServices, saveServices, toggleActive, updateOrder, deleteService, openModal, closeModal, saveModal, onDurationChange, showPriceHistory, renderServices };
})(typeof window !== 'undefined' ? window : global);