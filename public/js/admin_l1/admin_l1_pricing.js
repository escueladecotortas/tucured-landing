// Archivo: public/js/admin_l1/admin_l1_pricing.js
// Catálogo & Precios L1: Modal Unificado, Duración Libre, Soft-Delete e Historial (< 180 líneas)

(function (global) {
  const DEFAULT_SERVICES = [
    { id: 'srv_1', order: 1, name: 'Corte Clásico', priceNumeric: 8000, durationMinutes: 30, depositAmount: 4000, isActive: true, requireDeposit: true, priceHistory: [] },
    { id: 'srv_2', order: 2, name: 'Corte Degradé / Fade', priceNumeric: 10000, durationMinutes: 45, depositAmount: 5000, isActive: true, requireDeposit: true, priceHistory: [] },
    { id: 'srv_3', order: 3, name: 'Corte + Barba', priceNumeric: 14000, durationMinutes: 60, depositAmount: 7000, isActive: true, requireDeposit: true, priceHistory: [] },
    { id: 'srv_4', order: 4, name: 'Barba Toalla Caliente', priceNumeric: 6000, durationMinutes: 30, depositAmount: 3000, isActive: true, requireDeposit: true, priceHistory: [] },
    { id: 'srv_5', order: 5, name: 'Coloración / Claritos', priceNumeric: 22000, durationMinutes: 90, depositAmount: 11000, isActive: true, requireDeposit: true, priceHistory: [] }
  ];
  const STD_DUR = ['15', '30', '45', '60', '90'];
  const fmt = (n) => '$' + Number(n || 0).toLocaleString('es-AR');
  let editingId = null;
  const calcDep = (p, req = true) => (global.AdminBookingEngine ? global.AdminBookingEngine.calcDeposit(p, 'l1', req) : (req ? Math.round(p * 0.5) : 0));

  function getServices(includeDeleted = false) {
    try {
      const raw = localStorage.getItem('tucu_l1_services');
      if (raw) {
        const p = JSON.parse(raw);
        if (Array.isArray(p) && p.length > 0 && !p.some(s => s.name?.includes('Atención Estándar'))) {
          const norm = p.map(s => ({ ...s, depositAmount: calcDep(s.priceNumeric, s.requireDeposit !== false) })).sort((a, b) => (a.order || 0) - (b.order || 0));
          return includeDeleted ? norm : norm.filter(s => !s.deletedAt);
        }
      }
    } catch (_) {}
    return DEFAULT_SERVICES.map(s => ({ ...s, depositAmount: calcDep(s.priceNumeric, s.requireDeposit !== false) }));
  }

  function syncFromBrand(brandServices) {
    if (localStorage.getItem('tucu_l1_services') || !Array.isArray(brandServices) || !brandServices.length) return;
    const mapped = brandServices.map((s, idx) => {
      const p = parseInt(String(s.priceNumeric || s.price || 8000).replace(/\D/g, ''), 10) || 8000;
      const d = parseInt(String(s.duration || s.durationMinutes || 30).replace(/\D/g, ''), 10) || 30;
      return { id: s.id || `srv_${idx + 1}`, order: s.order || idx + 1, name: s.name || s.title || 'Servicio', priceNumeric: p, durationMinutes: d, depositAmount: calcDep(p, s.requireDeposit !== false), isActive: s.isActive !== false, requireDeposit: s.requireDeposit !== false, priceHistory: [] };
    });
    localStorage.setItem('tucu_l1_services', JSON.stringify(mapped));
    renderPricing();
  }

  function showToast(msg) {
    const t = document.getElementById('saveToast');
    if (t) { const sp = t.querySelector('span'); if (sp) sp.textContent = msg; t.classList.remove('hidden'); setTimeout(() => t.classList.add('hidden'), 2200); }
  }

  async function saveServices(list, toastMsg = 'Catálogo sincronizado') {
    try {
      localStorage.setItem('tucu_l1_services', JSON.stringify(list));
      const slug = localStorage.getItem('tucu_l1_slug') || 'demo-peluqueria';
      if (slug && !slug.startsWith('demo') && window.location.port !== '5174') {
        fetch(`/api/portal/${slug}/config`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ services: list }) }).catch(() => {});
      }
      showToast(toastMsg);
    } catch (_) {}
    renderPricing();
  }

  function toggleServiceActive(id) {
    const all = getServices(true), item = all.find(s => s.id === id);
    if (item) { item.isActive = !item.isActive; saveServices(all, item.isActive ? 'Servicio reactivado' : 'Servicio pausado'); }
  }

  function updateOrder(id, newOrder) {
    const all = getServices(true), item = all.find(s => s.id === id);
    if (item) { item.order = parseInt(newOrder, 10) || 1; all.sort((a, b) => (a.order || 0) - (b.order || 0)); saveServices(all); }
  }

  function deleteService(id) {
    const activeList = getServices(false);
    if (activeList.length <= 1) return showToast('Debe conservar al menos un servicio activo');
    const all = getServices(true), item = all.find(s => s.id === id);
    if (item) { item.deletedAt = new Date().toISOString(); item.isActive = false; saveServices(all, 'Servicio archivado en histórico'); }
  }

  function onDurationSelectChange(val) {
    const inp = document.getElementById('edit-srv-duration-custom');
    if (inp) inp.classList.toggle('hidden', val !== 'custom');
  }

  function setModalDuration(mins) {
    const sel = document.getElementById('edit-srv-duration'), inp = document.getElementById('edit-srv-duration-custom');
    const str = String(mins || 30);
    if (STD_DUR.includes(str)) { if (sel) sel.value = str; inp?.classList.add('hidden'); }
    else { if (sel) sel.value = 'custom'; if (inp) { inp.value = String(mins); inp.classList.remove('hidden'); } }
  }

  function openEditModal(id) {
    const item = getServices(false).find(s => s.id === id), modal = document.getElementById('serviceEditModal');
    if (!item || !modal) return;
    editingId = id;
    const ttl = document.getElementById('service-modal-title'); if (ttl) ttl.textContent = 'Editar Servicio';
    document.getElementById('edit-srv-name').value = item.name;
    document.getElementById('edit-srv-price').value = item.priceNumeric;
    document.getElementById('edit-srv-order').value = item.order || 1;
    setModalDuration(item.durationMinutes);
    document.getElementById('edit-srv-deposit-toggle').checked = item.requireDeposit !== false;
    modal.classList.remove('hidden'); modal.style.display = 'flex';
  }

  function openNewServiceModal() {
    const modal = document.getElementById('serviceEditModal'); if (!modal) return;
    editingId = null;
    const ttl = document.getElementById('service-modal-title'); if (ttl) ttl.textContent = 'Nuevo Servicio';
    document.getElementById('edit-srv-name').value = '';
    document.getElementById('edit-srv-price').value = '8000';
    document.getElementById('edit-srv-order').value = String(getServices(false).length + 1);
    setModalDuration(45);
    document.getElementById('edit-srv-deposit-toggle').checked = true;
    modal.classList.remove('hidden'); modal.style.display = 'flex';
  }

  function closeEditModal() {
    const modal = document.getElementById('serviceEditModal');
    if (modal) { modal.classList.add('hidden'); modal.style.display = 'none'; }
    editingId = null;
  }

  function saveEditModal() {
    const name = document.getElementById('edit-srv-name')?.value.trim();
    const price = parseInt(document.getElementById('edit-srv-price')?.value.replace(/\D/g, ''), 10);
    const selDur = document.getElementById('edit-srv-duration')?.value;
    const rawDur = selDur === 'custom' ? document.getElementById('edit-srv-duration-custom')?.value : selDur;
    const dur = parseInt(rawDur, 10);
    const ord = parseInt(document.getElementById('edit-srv-order')?.value, 10) || 1;
    const reqDep = document.getElementById('edit-srv-deposit-toggle')?.checked;
    if (!name || isNaN(price) || price <= 0 || isNaN(dur) || dur < 5 || dur > 480) return showToast('Verifica nombre, precio (>0) y duración (5-480 min)');
    const all = getServices(true);
    if (editingId) {
      const item = all.find(s => s.id === editingId);
      if (!item) return;
      if (item.priceNumeric !== price) {
        item.priceHistory = Array.isArray(item.priceHistory) ? item.priceHistory : [];
        item.priceHistory.push({ previousPrice: item.priceNumeric, newPrice: price, changedAt: new Date().toISOString() });
      }
      item.name = name; item.priceNumeric = price; item.durationMinutes = dur; item.order = ord;
      item.requireDeposit = reqDep; item.depositAmount = calcDep(price, reqDep);
    } else {
      all.push({ id: 'srv_' + Date.now(), order: ord, name, priceNumeric: price, durationMinutes: dur, depositAmount: calcDep(price, reqDep), isActive: true, requireDeposit: reqDep, priceHistory: [] });
    }
    all.sort((a, b) => (a.order || 0) - (b.order || 0));
    saveServices(all, editingId ? 'Servicio actualizado' : 'Servicio creado');
    closeEditModal();
  }

  function showPriceHistory(id) {
    const item = getServices(false).find(s => s.id === id), root = document.getElementById('dynamicModalRoot');
    if (!item || !root) return;
    const hist = [...(item.priceHistory || [])].reverse();
    root.innerHTML = `<div class="fixed inset-0 z-50 bg-stone-900/75 backdrop-blur-sm flex items-center justify-center p-4"><div class="w-full max-w-sm rounded-2xl border border-[#D5CEC2] dark:border-stone-800 bg-white dark:bg-[#181B22] p-5 space-y-3 shadow-2xl text-xs"><div class="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2"><h3 class="font-bold text-sm font-title">Historial · ${item.name}</h3><button onclick="document.getElementById('dynamicModalRoot').innerHTML=''" class="text-stone-400 cursor-pointer">Cerrar</button></div><div class="space-y-1.5 max-h-60 overflow-y-auto">${hist.map(h => `<div class="p-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-800 flex justify-between"><span>${fmt(h.previousPrice)} &rarr; <strong>${fmt(h.newPrice)}</strong></span><span class="text-stone-500 font-mono">${String(h.changedAt).slice(0, 10)}</span></div>`).join('') || '<p class="text-stone-500">Sin cambios registrados.</p>'}</div></div></div>`;
  }

  function renderPricing() {
    const container = document.getElementById('services-pricing-container'), countBadge = document.getElementById('pricingCountBadge');
    if (!container) return;
    const services = getServices(false);
    if (countBadge) countBadge.textContent = `${services.length} servicios`;
    container.innerHTML = services.map((s) => {
      const isAct = s.isActive !== false, depTxt = s.requireDeposit !== false ? `Seña: ${fmt(s.depositAmount)}` : 'Sin seña';
      const hist = s.priceHistory || [], lastAdj = hist.length ? `<button type="button" onclick="adminL1Pricing.showPriceHistory('${s.id}')" class="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-semibold cursor-pointer">Últ. ajuste: ${fmt(hist[hist.length - 1].previousPrice)} &rarr; ${fmt(hist[hist.length - 1].newPrice)} (${hist.length})</button>` : '';
      return `<div class="admin-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${isAct ? '' : 'opacity-55 grayscale'}"><div class="flex items-center gap-3"><div class="flex flex-col items-center shrink-0 w-12"><span class="text-[9px] uppercase text-stone-400 font-bold">Orden</span><input type="number" min="1" value="${s.order || 1}" onchange="adminL1Pricing.updateOrder('${s.id}', this.value)" class="w-10 text-center text-xs bg-stone-100 dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-800 rounded-lg py-1 font-mono font-bold outline-none"></div><div><div class="flex items-center gap-2 flex-wrap"><h4 class="text-sm font-bold text-stone-900 dark:text-stone-100 ${isAct ? '' : 'line-through'}">${s.name}</h4><span class="text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${isAct ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20' : 'bg-stone-100 dark:bg-stone-800 text-stone-500'}">${isAct ? 'Activo' : 'Pausado'}</span>${lastAdj}</div><p class="text-xs text-stone-500 dark:text-stone-400 mt-1"><span class="font-bold text-stone-900 dark:text-stone-100">${fmt(s.priceNumeric)}</span> · <span>${s.durationMinutes} min</span> · <span class="text-red-900 dark:text-red-400 font-semibold">${depTxt}</span></p></div></div><div class="flex items-center gap-2 self-end sm:self-center"><button type="button" onclick="adminL1Pricing.toggleServiceActive('${s.id}')" class="rounded-full px-3.5 py-1.5 admin-glass-btn text-xs font-medium">${isAct ? 'Pausar' : 'Activar'}</button><button type="button" onclick="adminL1Pricing.openEditModal('${s.id}')" class="rounded-full px-4 py-1.5 text-xs font-bold admin-glass-primary">Editar</button><button type="button" onclick="adminL1Pricing.deleteService('${s.id}')" title="Archivar servicio" class="p-1.5 rounded-full text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button></div></div>`;
    }).join('');
  }

  function init() { renderPricing(); }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else setTimeout(init, 50);
  }
  global.adminL1Pricing = { getServices, syncFromBrand, saveServices, toggleServiceActive, updateOrder, deleteService, openEditModal, closeEditModal, saveEditModal, openNewServiceModal, onDurationSelectChange, showPriceHistory, renderPricing, fmt, DEFAULT_SERVICES };
})(typeof window !== 'undefined' ? window : global);
