// Archivo: public/js/admin_l2/admin_l2_services.js
// Catálogo de Servicios L2: Alta, Edición, Pausa y Soft-Delete (< 150 líneas)

(function (global) {
  const DEFAULT_L2_SERVICES = [
    { id: 'srv-l2-1', name: 'Sesión Central Pro', duration: 45, price: 16000, description: 'Atención integral con bloqueo automático de horario.', isActive: true, requireDeposit: true },
    { id: 'srv-l2-2', name: 'Tratamiento Integral', duration: 60, price: 12000, description: 'Prestación completa con seguimiento en agenda.', isActive: true, requireDeposit: true },
    { id: 'srv-l2-3', name: 'Atención Express', duration: 30, price: 9000, description: 'Turno rápido en franja prioritaria.', isActive: true, requireDeposit: true }
  ];
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

  function getServices(includeDeleted = false) {
    const { isCustom, rubro, key } = srvCtx();
    try {
      const raw = JSON.parse(localStorage.getItem(key) || 'null') || (!isCustom && rubro === (localStorage.getItem('tucu_l2_rubro') || 'estetica') ? JSON.parse(localStorage.getItem('tucu_l2_services') || 'null') : null);
      if (Array.isArray(raw) && raw.length) return includeDeleted ? raw : raw.filter(s => !s.deletedAt);
    } catch (_) {}
    return global.AdminDemoSeed?.getServicesSeed ? global.AdminDemoSeed.getServicesSeed(rubro, 'l2') : DEFAULT_L2_SERVICES.map(s => ({ ...s }));
  }

  function saveServices(list, msg = 'Catálogo L2 actualizado') {
    const { key } = srvCtx();
    try { localStorage.setItem(key, JSON.stringify(list)); } catch (_) {}
    renderServices();
    global.adminL2Core?.showToast(msg);
  }

  function toggleActive(id) {
    const all = getServices(true), item = all.find(s => s.id === id);
    if (!item) return;
    item.isActive = item.isActive === false;
    saveServices(all, item.isActive ? 'Servicio reactivado' : 'Servicio pausado');
  }

  function deleteService(id) {
    if (getServices(false).length <= 1) return global.adminL2Core?.showToast('Conserva al menos un servicio activo', 'error');
    const all = getServices(true), item = all.find(s => s.id === id);
    if (item) { item.deletedAt = new Date().toISOString(); item.isActive = false; saveServices(all, 'Servicio archivado'); }
  }

  function openModal(id = null) {
    editingId = id;
    const item = id ? getServices(false).find(s => s.id === id) : null;
    const m = document.getElementById('l2-service-modal'); if (!m) return;
    document.getElementById('l2-srv-modal-title').textContent = item ? 'Editar Servicio' : 'Nuevo Servicio';
    document.getElementById('l2-srv-name').value = item?.name || '';
    document.getElementById('l2-srv-price').value = item?.price || 12000;
    document.getElementById('l2-srv-dur').value = item?.duration || 45;
    document.getElementById('l2-srv-desc').value = item?.description || '';
    m.classList.remove('hidden'); m.classList.add('flex');
  }

  function closeModal() {
    const m = document.getElementById('l2-service-modal');
    if (m) { m.classList.add('hidden'); m.classList.remove('flex'); }
    editingId = null;
  }

  function saveModal() {
    const name = document.getElementById('l2-srv-name')?.value.trim();
    const price = parseInt(document.getElementById('l2-srv-price')?.value, 10) || 0;
    const duration = parseInt(document.getElementById('l2-srv-dur')?.value, 10) || 30;
    const description = document.getElementById('l2-srv-desc')?.value.trim() || 'Prestación profesional reservable online.';
    if (!name || price <= 0 || duration < 5 || duration > 480) return global.adminL2Core?.showToast('Verifica nombre, precio (>0) y duración', 'error');
    const all = getServices(true);
    if (editingId) {
      const it = all.find(s => s.id === editingId);
      if (it) { it.name = name; it.price = price; it.duration = duration; it.description = description; }
    } else {
      all.push({ id: 'srv-l2-' + Date.now(), name, price, duration, description, isActive: true, requireDeposit: true });
    }
    saveServices(all, editingId ? 'Servicio actualizado' : 'Servicio creado');
    closeModal();
  }

  function renderServices() {
    const box = document.getElementById('l2-services-container'), badge = document.getElementById('l2-services-count');
    if (!box) return;
    const list = getServices(false);
    if (badge) badge.textContent = `${list.length} servicios`;
    box.innerHTML = list.map(s => {
      const act = s.isActive !== false, dep = eng() ? eng().calcDeposit(s.price, 'l2', s.requireDeposit !== false) : Math.round(s.price * 0.5);
      return `<div class="admin-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${act ? '' : 'opacity-55'}">
        <div class="min-w-0 space-y-0.5">
          <div class="flex items-center gap-2 flex-wrap"><h4 class="text-sm font-bold text-stone-900 dark:text-stone-100 ${act ? '' : 'line-through'}">${s.name}</h4><span class="text-[10px] px-2 py-0.5 rounded-full font-semibold ${act ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-100 text-stone-500'}">${act ? 'Activo' : 'Pausado'}</span></div>
          <p class="text-xs text-stone-500">${s.description || ''}</p>
          <p class="text-xs font-semibold text-stone-700 dark:text-stone-300">${fmt(s.price)} · ${s.duration} min · <span class="text-[#800000] dark:text-red-300">Seña ${fmt(dep)}</span></p>
        </div>
        <div class="flex items-center gap-2 shrink-0">
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

  global.adminL2Services = { init, getServices, saveServices, toggleActive, deleteService, openModal, closeModal, saveModal, renderServices };
})(typeof window !== 'undefined' ? window : global);
