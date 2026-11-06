// Archivo: public/js/admin_l1/admin_l1_pricing.js
// Catálogo & Precios Peluquería & Barbería Central (Nexus OS v11.1 - < 170 líneas)

(function (global) {
  const DEFAULT_SERVICES = [
    { id: 'srv_1', order: 1, name: 'Corte Clásico', priceNumeric: 8000, durationMinutes: 30, depositAmount: 4000, isActive: true, requireDeposit: true },
    { id: 'srv_2', order: 2, name: 'Corte Degradé / Fade', priceNumeric: 10000, durationMinutes: 45, depositAmount: 5000, isActive: true, requireDeposit: true },
    { id: 'srv_3', order: 3, name: 'Corte + Barba', priceNumeric: 14000, durationMinutes: 60, depositAmount: 7000, isActive: true, requireDeposit: true },
    { id: 'srv_4', order: 4, name: 'Barba Toalla Caliente', priceNumeric: 6000, durationMinutes: 30, depositAmount: 3000, isActive: true, requireDeposit: true },
    { id: 'srv_5', order: 5, name: 'Coloración / Claritos', priceNumeric: 22000, durationMinutes: 90, depositAmount: 11000, isActive: true, requireDeposit: true }
  ];

  const fmt = (n) => '$' + Number(n || 0).toLocaleString('es-AR');
  let editingId = null;

  function getServices() {
    try {
      const raw = localStorage.getItem('tucu_l1_services');
      if (raw) {
        const p = JSON.parse(raw);
        const isLegacy = Array.isArray(p) && p.some(s => s.name?.includes('Lash') || s.name?.includes('Atención Estándar'));
        if (!isLegacy && Array.isArray(p) && p.length >= 3) return p.sort((a, b) => (a.order || 0) - (b.order || 0));
      }
    } catch (_) {}
    return DEFAULT_SERVICES;
  }

  function syncFromBrand(brandServices) {
    if (localStorage.getItem('tucu_l1_services') || !Array.isArray(brandServices) || brandServices.length === 0) return;
    const mapped = brandServices.map((s, idx) => {
      const p = parseInt(String(s.priceNumeric || s.price || 8000).replace(/\D/g, ''), 10) || 8000;
      const d = parseInt(String(s.duration || s.durationMinutes || 30).replace(/\D/g, ''), 10) || 30;
      return {
        id: s.id || `srv_${idx + 1}`, order: s.order || (idx + 1), name: s.name || s.title || 'Servicio',
        priceNumeric: p, durationMinutes: d, depositAmount: Math.round(p * 0.5),
        isActive: s.isActive !== false, requireDeposit: s.requireDeposit !== false
      };
    });
    localStorage.setItem('tucu_l1_services', JSON.stringify(mapped));
    renderPricing();
  }

  async function saveServices(list) {
    try {
      localStorage.setItem('tucu_l1_services', JSON.stringify(list));
      const slug = localStorage.getItem('tucu_l1_slug') || 'demo-peluqueria';
      fetch(`/api/portal/${slug}/config`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ services: list }) }).catch(() => {});
      showToast('Catálogo sincronizado');
    } catch (_) {}
    renderPricing();
  }

  function showToast(msg) {
    const toast = document.getElementById('saveToast');
    if (toast) {
      const sp = toast.querySelector('span'); if (sp) sp.textContent = msg;
      toast.classList.remove('hidden'); setTimeout(() => toast.classList.add('hidden'), 2200);
    }
  }

  function toggleServiceActive(id) {
    const list = getServices(), item = list.find(s => s.id === id);
    if (item) { item.isActive = !item.isActive; saveServices(list); }
  }

  function updateOrder(id, newOrder) {
    const list = getServices(), item = list.find(s => s.id === id);
    if (item) {
      item.order = parseInt(newOrder, 10) || 1;
      list.sort((a, b) => (a.order || 0) - (b.order || 0));
      saveServices(list);
    }
  }

  function deleteService(id) {
    const list = getServices();
    if (list.length <= 1) return alert('Debe conservar al menos un servicio en el catálogo.');
    if (confirm('¿Eliminar este servicio del catálogo?')) saveServices(list.filter(s => s.id !== id));
  }

  function openEditModal(id) {
    const list = getServices(), item = list.find(s => s.id === id);
    if (!item) return;
    editingId = id;
    const modal = document.getElementById('serviceEditModal');
    if (!modal) return;
    document.getElementById('edit-srv-name').value = item.name;
    document.getElementById('edit-srv-price').value = item.priceNumeric;
    document.getElementById('edit-srv-duration').value = String(item.durationMinutes);
    document.getElementById('edit-srv-order').value = item.order || 1;
    document.getElementById('edit-srv-deposit-toggle').checked = item.requireDeposit !== false;
    modal.classList.remove('hidden'); modal.style.display = 'flex';
  }

  function closeEditModal() {
    const modal = document.getElementById('serviceEditModal');
    if (modal) { modal.classList.add('hidden'); modal.style.display = 'none'; }
    editingId = null;
  }

  function saveEditModal() {
    const list = getServices(), item = list.find(s => s.id === editingId);
    if (!item) return;
    const name = document.getElementById('edit-srv-name')?.value.trim();
    const price = parseInt(document.getElementById('edit-srv-price')?.value.replace(/\D/g, ''), 10);
    const dur = parseInt(document.getElementById('edit-srv-duration')?.value, 10) || 30;
    const ord = parseInt(document.getElementById('edit-srv-order')?.value, 10) || item.order;
    const reqDep = document.getElementById('edit-srv-deposit-toggle')?.checked;
    if (!name || isNaN(price) || price <= 0) return alert('Ingrese nombre y precio válidos.');
    item.name = name; item.priceNumeric = price; item.durationMinutes = dur;
    item.order = ord; item.requireDeposit = reqDep;
    item.depositAmount = reqDep ? Math.round(price * 0.5) : 0;
    list.sort((a, b) => (a.order || 0) - (b.order || 0));
    saveServices(list); closeEditModal();
  }

  function openNewServiceModal() {
    const name = prompt('Nombre del nuevo servicio:');
    if (!name || !name.trim()) return;
    const rawPrice = prompt('Precio total (ARS):', '8000');
    const price = parseInt(String(rawPrice).replace(/\D/g, ''), 10) || 8000;
    const list = getServices();
    list.push({ id: 'srv_' + Date.now(), order: list.length + 1, name: name.trim(), priceNumeric: price, durationMinutes: 45, depositAmount: Math.round(price * 0.5), isActive: true, requireDeposit: true });
    saveServices(list);
  }

  function renderPricing() {
    const container = document.getElementById('services-pricing-container'), countBadge = document.getElementById('pricingCountBadge');
    if (!container) return;
    const services = getServices();
    if (countBadge) countBadge.textContent = `${services.length} servicios`;

    container.innerHTML = services.map((s) => {
      const isAct = s.isActive !== false;
      const depTxt = s.requireDeposit !== false ? `Seña: ${fmt(s.depositAmount)}` : 'Sin seña';
      return `<div class="p-4 sm:p-5 rounded-2xl border border-[#E8E6DF] dark:border-[#2D2A28] bg-white dark:bg-[#1C1A19] shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${isAct ? '' : 'opacity-50 grayscale'}">
        <div class="flex items-center gap-3">
          <div class="flex flex-col items-center justify-center shrink-0 w-12">
            <span class="text-[9px] uppercase tracking-wider text-[#7A766E] dark:text-[#9E9A93] font-bold">Orden</span>
            <input type="number" min="1" value="${s.order || 1}" onchange="adminL1Pricing.updateOrder('${s.id}', this.value)" class="w-10 text-center text-xs bg-[#EFECE6] dark:bg-[#262422] text-[#7A766E] dark:text-[#F5F3EF] border border-[#E8E6DF] dark:border-[#2D2A28] rounded-lg py-1 font-mono font-bold outline-none">
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h4 class="text-sm font-bold text-[#1C1A17] dark:text-[#F5F3EF] ${isAct ? '' : 'line-through'}">${s.name}</h4>
              <span class="text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${isAct ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20' : 'bg-[#EFECE6] dark:bg-[#262422] text-[#7A766E] dark:text-[#9E9A93]'}">${isAct ? 'Activo' : 'Pausado'}</span>
            </div>
            <p class="text-xs text-[#7A766E] dark:text-[#9E9A93] mt-1">
              <span class="font-bold text-[#1C1A17] dark:text-[#F5F3EF]">${fmt(s.priceNumeric)}</span> · <span>${s.durationMinutes} min</span> · <span style="color:var(--brand-accent)" class="font-semibold">${depTxt}</span>
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2 self-end sm:self-center">
          <button type="button" onclick="adminL1Pricing.toggleServiceActive('${s.id}')" title="${isAct ? 'Pausar' : 'Activar'}" class="rounded-full px-3.5 py-1.5 border border-[#E8E6DF] dark:border-[#2D2A28] bg-[#FBFBF9] dark:bg-[#262422] text-xs font-medium text-[#7A766E] dark:text-[#9E9A93] hover:text-[#1C1A17] dark:hover:text-[#F5F3EF] cursor-pointer transition-all">${isAct ? 'Pausar' : 'Activar'}</button>
          <button type="button" onclick="adminL1Pricing.openEditModal('${s.id}')" class="rounded-full px-4 py-1.5 text-xs font-medium text-white cursor-pointer shadow-xs transition-all hover:opacity-95" style="background:var(--brand-accent)">Editar</button>
          <button type="button" onclick="adminL1Pricing.deleteService('${s.id}')" title="Eliminar servicio" class="p-1.5 rounded-full text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer flex items-center justify-center transition-all"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
        </div>
      </div>`;
    }).join('');
  }

  function init() { renderPricing(); }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else setTimeout(init, 50);
  }
  global.adminL1Pricing = {
    getServices, syncFromBrand, saveServices, toggleServiceActive, updateOrder,
    deleteService, openEditModal, closeEditModal, saveEditModal, openNewServiceModal, renderPricing, fmt,
    DEFAULT_SERVICES
  };
})(typeof window !== 'undefined' ? window : global);
