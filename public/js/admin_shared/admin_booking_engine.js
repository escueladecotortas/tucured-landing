// Archivo: public/js/admin_shared/admin_booking_engine.js
// Motor Unificado de Estados (5 Canónicos), Señas Dinámicas y Reversión Explícita (L1/L2/L3 < 180L)

window.AdminBookingEngine = (function () {
  const DEFAULT_METHODS = [
    { id: 'efectivo', label: 'Efectivo' },
    { id: 'transferencia', label: 'Transferencia / Alias' },
    { id: 'mercadopago', label: 'Mercado Pago' },
    { id: 'tarjeta', label: 'Tarjeta Débito / Crédito' }
  ];
  const DEFAULT_ENABLED = { efectivo: true, transferencia: true, mercadopago: true, tarjeta: false };
  const STATES = {
    PENDING_DEPOSIT: { key: 'PENDING_DEPOSIT', l1: 'pendiente', label: 'Pendiente Seña', badge: 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800' },
    CONFIRMED: { key: 'CONFIRMED', l1: 'confirmado', label: 'Confirmado', badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' },
    COMPLETED: { key: 'COMPLETED', l1: 'finalizado', label: 'Finalizado', badge: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border border-stone-300 dark:border-stone-700' },
    CANCELLED: { key: 'CANCELLED', l1: 'cancelado', label: 'Cancelado', badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800' },
    NO_SHOW: { key: 'NO_SHOW', l1: 'ausente', label: 'Ausente', badge: 'bg-orange-50 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300 border border-orange-200 dark:border-orange-800' }
  };
  const SVG_UNDO = '<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a5 5 0 015 5v2M3 10l4-4m-4 4l4 4"/></svg>';
  const SVG_OK = '<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';
  const SVG_X = '<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>';
  const SVG_RST = '<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>';
  const fmt = (n) => '$' + Math.max(0, Math.round(Number(n) || 0)).toLocaleString('es-AR');
  const parseMoney = (v) => (typeof v === 'number' ? v : parseInt(String(v || '0').replace(/\D/g, ''), 10) || 0);

  function cfgKey(level) { return level === 'l1' ? 'tucu_l1_cfg_ext' : `tucu_${level}_payment_cfg`; }
  function getConfig(level) {
    const def = { requireDeposit: true, depositType: 'percentage', depositValue: 50, paymentMethods: { ...DEFAULT_ENABLED } };
    try {
      const saved = JSON.parse(localStorage.getItem(cfgKey(level)) || '{}');
      return { ...def, ...saved, paymentMethods: { ...DEFAULT_ENABLED, ...(saved.paymentMethods || {}) } };
    } catch (_) { return def; }
  }
  function saveConfig(level, patch) {
    const next = { ...getConfig(level), ...patch };
    next.paymentMethods = { ...DEFAULT_ENABLED, ...(next.paymentMethods || {}) };
    try { localStorage.setItem(cfgKey(level), JSON.stringify(next)); } catch (_) {}
    return next;
  }
  function getEnabledMethods(level) {
    const pm = getConfig(level).paymentMethods || DEFAULT_ENABLED;
    const list = DEFAULT_METHODS.filter(m => pm[m.id] !== false);
    return list.length > 0 ? list : [{ id: 'efectivo', label: 'Efectivo (Mostrador)' }];
  }
  function calcDeposit(price, levelOrCfg, srvReq = true) {
    const cfg = typeof levelOrCfg === 'string' ? getConfig(levelOrCfg) : (levelOrCfg || getConfig('l1'));
    const p = Math.max(0, Number(price) || 0);
    if (!cfg.requireDeposit || srvReq === false || p <= 0) return 0;
    const val = Math.max(0, Number(cfg.depositValue) || 0);
    return cfg.depositType === 'fixed' ? Math.min(p, val) : Math.round(p * (val / 100));
  }

  function normalizeKey(raw) {
    const s = String(raw || '').trim();
    if (s === 'pendiente' || s === 'PENDING_DEPOSIT') return 'PENDING_DEPOSIT';
    if (s === 'finalizado' || s === 'completado' || s === 'COMPLETED' || s === 'ATTENDED') return 'COMPLETED';
    if (s === 'cancelado' || s === 'CANCELLED' || s === 'RELEASED') return 'CANCELLED';
    if (s === 'ausente' || s === 'no_show' || s === 'NO_SHOW') return 'NO_SHOW';
    return 'CONFIRMED';
  }
  function levelCode(level, canonKey) { const meta = STATES[canonKey] || STATES.CONFIRMED; return level === 'l1' ? meta.l1 : meta.key; }
  function getMeta(raw) { return STATES[normalizeKey(raw)] || STATES.CONFIRMED; }

  function hydrateBooking(b, level, fallbackPrice = 10000) {
    const canon = normalizeKey(b.status), price = parseMoney(b.price) || fallbackPrice;
    const depAmt = typeof b.depositAmount === 'number' ? b.depositAmount : (parseMoney(b.deposit) || calcDeposit(price, level));
    const paid = typeof b.depositPaid === 'boolean' ? b.depositPaid : (canon !== 'PENDING_DEPOSIT' && depAmt > 0);
    return {
      ...b, status: levelCode(level, canon), price, depositAmount: depAmt, depositPaid: paid,
      paymentMethod: paid ? (b.paymentMethod || 'Efectivo') : null,
      paidAt: paid ? (b.paidAt || b.createdAt || new Date().toISOString()) : null,
      prevStatus: b.prevStatus ? levelCode(level, normalizeKey(b.prevStatus)) : null
    };
  }

  function applyTransition(b, nextCanon, level, method = null) {
    b.prevStatus = b.status; b.prevDepositPaid = !!b.depositPaid;
    b.prevPaymentMethod = b.paymentMethod || null; b.prevPaidAt = b.paidAt || null;
    b.status = levelCode(level, nextCanon);
    if (nextCanon === 'CONFIRMED' && method) { b.depositPaid = true; b.paymentMethod = method; b.paidAt = new Date().toISOString(); }
    return b;
  }
  function undoTransition(b, level) {
    const target = b.prevStatus || levelCode(level, 'CONFIRMED'), prevCanon = normalizeKey(target);
    b.status = target;
    if (prevCanon === 'PENDING_DEPOSIT' || b.prevDepositPaid === false) { b.depositPaid = false; b.paymentMethod = null; b.paidAt = null; }
    else { b.depositPaid = !!b.prevDepositPaid; b.paymentMethod = b.prevPaymentMethod || null; b.paidAt = b.prevPaidAt || null; }
    b.prevStatus = null; delete b.prevDepositPaid; delete b.prevPaymentMethod; delete b.prevPaidAt;
    return b;
  }

  function computeKpis(list) {
    const clean = (list || []).filter(b => !b.deletedAt);
    const active = clean.filter(b => { const k = normalizeKey(b.status); return k === 'PENDING_DEPOSIT' || k === 'CONFIRMED'; });
    const credited = clean.filter(b => b.depositPaid === true && normalizeKey(b.status) !== 'CANCELLED').reduce((s, b) => s + (Number(b.depositAmount) || 0), 0);
    const potential = clean.filter(b => normalizeKey(b.status) !== 'CANCELLED').reduce((s, b) => s + (Number(b.depositAmount) || 0), 0);
    const done = clean.filter(b => normalizeKey(b.status) === 'COMPLETED').length, noShow = clean.filter(b => normalizeKey(b.status) === 'NO_SHOW').length;
    const confirmed = clean.filter(b => normalizeKey(b.status) === 'CONFIRMED').length, cancelled = clean.filter(b => normalizeKey(b.status) === 'CANCELLED').length;
    return { activeCount: active.length, confirmedCount: confirmed, cancelledCount: cancelled, creditedDeposits: credited, potentialDeposits: potential, doneCount: done, noShowCount: noShow };
  }

  function renderDepositHtml(b) {
    const price = Number(b.price) || 0, dep = Number(b.depositAmount) || 0, paid = !!b.depositPaid;
    const balance = Math.max(0, price - (paid ? dep : 0));
    const depBadge = dep === 0 ? '<span class="text-stone-500">Sin seña</span>'
      : (paid ? `<span class="text-emerald-700 dark:text-emerald-400 font-bold">Seña ${fmt(dep)} · Acreditada (${b.paymentMethod || 'Efectivo'})</span>`
        : `<span class="text-amber-700 dark:text-amber-400 font-bold">Seña ${fmt(dep)} · Pendiente</span>`);
    return `<div class="text-[11px] flex flex-wrap items-center gap-x-2.5 gap-y-0.5">${depBadge}<span class="text-stone-500 dark:text-stone-400">Saldo en local: <strong class="text-stone-800 dark:text-stone-100">${fmt(balance)}</strong></span></div>`;
  }

  function renderUndoLabel(rawStatus, prevStatus = null) {
    const k = normalizeKey(rawStatus);
    if (k !== 'COMPLETED' && k !== 'CANCELLED' && k !== 'NO_SHOW') return '';
    return `<span class="text-[10px] font-medium text-stone-500 dark:text-stone-400 whitespace-nowrap">Anterior: ${getMeta(prevStatus || 'CONFIRMED').label}</span>`;
  }

  function renderActionButtons(id, rawStatus, ns, prevStatus = null) {
    const k = normalizeKey(rawStatus);
    if (k === 'PENDING_DEPOSIT') return `<button type="button" onclick="${ns}.creditDeposit('${id}')" class="rounded-xl px-3 py-1.5 text-xs font-bold admin-glass-primary inline-flex items-center gap-1">${SVG_OK}<span>Acreditar Seña</span></button><button type="button" onclick="${ns}.setStatus('${id}','CANCELLED')" class="rounded-xl px-2.5 py-1.5 text-xs font-semibold admin-glass-btn hover:text-rose-600 inline-flex items-center gap-1">${SVG_X}<span>Cancelar</span></button>`;
    if (k === 'CONFIRMED') return `<button type="button" onclick="${ns}.setStatus('${id}','COMPLETED')" class="rounded-xl px-3 py-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer inline-flex items-center gap-1">${SVG_OK}<span>Marcar Finalizado</span></button><button type="button" onclick="${ns}.setStatus('${id}','NO_SHOW')" class="rounded-xl px-2.5 py-1.5 text-xs font-semibold admin-glass-btn text-amber-800 dark:text-amber-300">Ausente</button><button type="button" onclick="${ns}.setStatus('${id}','CANCELLED')" class="rounded-xl px-2.5 py-1.5 text-xs font-semibold admin-glass-btn hover:text-rose-600">Cancelar</button>`;
    const prevLabel = getMeta(prevStatus || 'CONFIRMED').label;
    return `<button type="button" onclick="${ns}.undoStatus('${id}')" class="rounded-xl px-2.5 py-1.5 text-xs font-semibold admin-glass-btn text-red-900 dark:text-red-300 inline-flex items-center gap-1 whitespace-nowrap">${SVG_UNDO}<span>\u21A9 A ${prevLabel}</span></button>`;
  }

  function openPaymentPicker({ title = 'Acreditar Seña', amount = 0, level = 'l1', onConfirm }) {
    document.getElementById('tucuPaymentModal')?.remove();
    const methods = getEnabledMethods(level), wrap = document.createElement('div');
    wrap.id = 'tucuPaymentModal';
    wrap.className = 'fixed inset-0 z-[70] bg-stone-900/75 backdrop-blur-sm flex items-center justify-center p-4';
    wrap.innerHTML = `<div class="w-full max-w-sm rounded-2xl border border-[#D5CEC2] dark:border-stone-800 bg-white dark:bg-[#181B22] p-5 space-y-4 shadow-2xl text-xs">
      <div class="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2"><h3 class="font-bold text-sm text-stone-900 dark:text-stone-100 font-title">${title}</h3><button type="button" id="pm-close" class="text-stone-400 hover:text-stone-700 cursor-pointer">${SVG_X}</button></div>
      <p class="text-stone-600 dark:text-stone-300">Importe de seña a registrar: <strong class="text-emerald-700 dark:text-emerald-400 font-mono text-sm">${fmt(amount)}</strong></p>
      <div class="space-y-1.5"><span class="block text-[10px] uppercase font-bold text-stone-400">Medio de pago habilitado</span>${methods.map((m, i) => `<label class="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-800 cursor-pointer"><input type="radio" name="tucu-pm" value="${m.label}" ${i === 0 ? 'checked' : ''} class="accent-[#800000]"><span class="font-semibold text-stone-800 dark:text-stone-100">${m.label}</span></label>`).join('')}</div>
      <div class="flex gap-2 pt-1"><button type="button" id="pm-cancel" class="w-1/2 py-2 rounded-xl admin-glass-btn font-semibold">Cancelar</button><button type="button" id="pm-confirm" class="w-1/2 py-2 rounded-xl admin-glass-primary font-bold">Confirmar Cobro</button></div>
    </div>`;
    document.body.appendChild(wrap);
    const close = () => wrap.remove();
    wrap.querySelector('#pm-close').onclick = close; wrap.querySelector('#pm-cancel').onclick = close;
    wrap.querySelector('#pm-confirm').onclick = () => { const sel = wrap.querySelector('input[name="tucu-pm"]:checked')?.value || methods[0].label; close(); if (onConfirm) onConfirm(sel); };
  }

  function mountPaymentConfigPanel({ mountId, level, includeDepositRule = true, onChange, onResetDemo }) {
    const box = document.getElementById(mountId); if (!box) return;
    const cfg = getConfig(level);
    const ruleHtml = includeDepositRule ? `<div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pb-3 border-b border-stone-100 dark:border-stone-800 items-center">
      <label class="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-800 cursor-pointer text-xs font-semibold"><input type="checkbox" id="pm-req-${level}" ${cfg.requireDeposit !== false ? 'checked' : ''} class="w-4 h-4 accent-[#800000]"><span>Exigir Seña Web</span></label>
      <select id="pm-type-${level}" class="bg-stone-50 dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-800 rounded-xl px-2.5 py-2 text-xs outline-none"><option value="percentage" ${cfg.depositType === 'percentage' ? 'selected' : ''}>% Porcentaje</option><option value="fixed" ${cfg.depositType === 'fixed' ? 'selected' : ''}>$ Monto Fijo</option></select>
      <input type="number" id="pm-val-${level}" min="0" value="${cfg.depositValue ?? 50}" class="bg-stone-50 dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-800 rounded-xl px-2.5 py-2 text-xs font-mono outline-none">
    </div>` : '';
    box.innerHTML = `<div class="space-y-3">${ruleHtml}<div><p class="text-[11px] font-bold text-stone-600 dark:text-stone-300 mb-2">Medios de pago habilitados en el local</p><div class="grid grid-cols-1 sm:grid-cols-2 gap-2">${DEFAULT_METHODS.map(m => `<label class="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-800 cursor-pointer text-xs"><span class="font-semibold text-stone-800 dark:text-stone-100">${m.label}</span><input type="checkbox" data-pm-method="${m.id}" ${cfg.paymentMethods[m.id] !== false ? 'checked' : ''} class="w-4 h-4 accent-[#800000]"></label>`).join('')}</div></div><div class="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end gap-2"><button type="button" id="btn-reset-demo-${level}" class="px-3 py-1.5 rounded-xl admin-glass-btn text-xs font-semibold text-red-900 dark:text-red-300 inline-flex items-center gap-1.5">${SVG_RST}<span>Restaurar Datos Demo</span></button></div></div>`;
    const sync = () => {
      const pm = {}; box.querySelectorAll('[data-pm-method]').forEach(el => { pm[el.dataset.pmMethod] = el.checked; });
      const patch = { paymentMethods: pm };
      if (includeDepositRule) {
        patch.requireDeposit = document.getElementById(`pm-req-${level}`)?.checked ?? true;
        patch.depositType = document.getElementById(`pm-type-${level}`)?.value || 'percentage';
        patch.depositValue = parseInt(document.getElementById(`pm-val-${level}`)?.value, 10) || 0;
      }
      saveConfig(level, patch); if (onChange) onChange(getConfig(level));
    };
    box.querySelectorAll('input, select').forEach(el => { el.addEventListener('change', sync); el.addEventListener('input', sync); });
    document.getElementById(`btn-reset-demo-${level}`)?.addEventListener('click', () => { if (onResetDemo) onResetDemo(); });
  }

  return { DEFAULT_METHODS, STATES, fmt, parseMoney, getConfig, saveConfig, getEnabledMethods, calcDeposit, normalizeKey, levelCode, getMeta, hydrateBooking, applyTransition, undoTransition, computeKpis, renderDepositHtml, renderUndoLabel, renderActionButtons, openPaymentPicker, mountPaymentConfigPanel };
})();
