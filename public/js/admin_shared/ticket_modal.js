// Archivo: public/js/admin_shared/ticket_modal.js
// Modal Superpuesto In-Place de Ticket Online Warm Studio (L1/L2/L3 + Showroom <= 175L)

window.TucuTicketModal = (function () {
  const MODAL_ID = 'tucu-ticket-modal-overlay';
  const ADDR_DEF = {
    peluqueria: '25 de Mayo 480, S. M. de Tucumán', barberia: '25 de Mayo 480, S. M. de Tucumán',
    estetica: 'Av. Aconquija 1320, Yerba Buena', peluqueria_estetica: 'Av. Aconquija 1320, Yerba Buena',
    gastronomia: 'Crisóstomo Álvarez 615, S. M. de Tucumán', resto: 'Crisóstomo Álvarez 615, S. M. de Tucumán',
    salud: 'San Martín 845, S. M. de Tucumán', salud_consultorio: 'San Martín 845, S. M. de Tucumán',
    servicios: 'Laprida 310, S. M. de Tucumán', deportes: 'Av. Perón 1850, Yerba Buena', deportes_clubes: 'Av. Perón 1850, Yerba Buena'
  };
  const SVG = {
    x: '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>',
    cal: '<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>',
    copy: '<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>',
    ok: '<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>',
    upload: '<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>'
  };

  let curToken = '', curOpts = { immediate: true }, askCancel = false, toastMsg = '';
  const cleanTok = (raw) => String(raw || '').replace(/^#/, '').trim().toUpperCase();
  const fmtMoney = (n) => '$' + (Number(n) || 0).toLocaleString('es-AR');

  function fmtDate(dStr) {
    if (window.AdminWaTemplates?.formatNaturalDate) return window.AdminWaTemplates.formatNaturalDate(dStr);
    if (!dStr || !/^\d{4}-\d{2}-\d{2}$/.test(String(dStr))) return String(dStr || 'Próximo turno');
    const d = new Date(`${dStr}T12:00:00`), names = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    return isNaN(d.getTime()) ? String(dStr) : `${names[d.getDay()]} ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  function findRecord(tok) {
    const keys = [], seen = new Set(), add = (k, level) => { if (k && !seen.has(k)) { seen.add(k); keys.push({ k, level }); } };
    const pref = curOpts.level;
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i) || ''; if (pref && k.startsWith(`tucu_${pref}_bookings`)) add(k, pref); }
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i) || '';
      if (k.startsWith('tucu_l1_bookings')) add(k, 'l1'); else if (k.startsWith('tucu_l2_bookings')) add(k, 'l2'); else if (k.startsWith('tucu_l3_bookings')) add(k, 'l3');
    }
    add('tucu_l2_bookings', 'l2'); add('tucu_l3_bookings', 'l3');
    for (const { k, level } of keys) {
      try {
        const list = JSON.parse(localStorage.getItem(k) || 'null');
        const idx = Array.isArray(list) ? list.findIndex(b => !b.deletedAt && (cleanTok(b.token) === tok || cleanTok(b.id) === tok)) : -1;
        if (idx >= 0) return { key: k, level, list, booking: list[idx] };
      } catch (_) {}
    }
    return null;
  }

  function resolveCanon(b) {
    const st = String(b?.status || '').toUpperCase();
    if (st === 'CANCELLED' || st === 'CANCELADO') return 'CANCELLED';
    if ((st === 'PENDING_DEPOSIT' || st === 'PENDIENTE') && Number(b?.depositAmount) > 0 && !b?.depositPaid) return 'PENDING_DEPOSIT';
    return 'CONFIRMED';
  }

  function resolveAddress(b, lvl) {
    const rKey = String(b?.rubroId || curOpts.rubro || '').toLowerCase().trim();
    const byRubro = rKey ? localStorage.getItem(`tucu_${lvl}_address_${rKey}`) : '';
    return b?.address || byRubro || localStorage.getItem(`tucu_${lvl}_address`) || ADDR_DEF[rKey] || '25 de Mayo 480, S. M. de Tucumán';
  }

  function persist(rec) {
    const ct = cleanTok(rec.booking.token || rec.booking.id), pref = `tucu_${rec.level}_bookings`;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i) || '';
      if (!k.startsWith(pref)) continue;
      try { const l = JSON.parse(localStorage.getItem(k) || 'null'), idx = Array.isArray(l) ? l.findIndex(b => cleanTok(b.token) === ct || cleanTok(b.id) === ct) : -1; if (idx >= 0) { l[idx] = rec.booking; localStorage.setItem(k, JSON.stringify(l)); } } catch (_) {}
    }
    if (window.ShowcaseState && cleanTok(window.ShowcaseState.lastBookingCode) === ct) {
      window.ShowcaseState.lastBookingRecord = { ...rec.booking };
      window.ShowcaseState.notify?.();
    }
  }
  function close() { document.getElementById(MODAL_ID)?.remove(); askCancel = false; toastMsg = ''; }
  function copyVal(text, label) { if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {}); toastMsg = `${label} copiado al portapapeles`; render(); }

  function reportReceipt(tok) {
    const rec = findRecord(tok); if (!rec) return;
    const file = document.getElementById('inp-receipt-file')?.files?.[0];
    Object.assign(rec.booking, { depositReceiptReported: true, depositReceiptName: file?.name || 'Comprobante informado en portal', depositReceiptAt: new Date().toISOString() });
    persist(rec); toastMsg = 'Comprobante informado — en validación por el comercio'; render();
  }
  function confirmAttendance(tok) {
    const rec = findRecord(tok); if (!rec) return;
    rec.booking.clientConfirmed = true; rec.booking.clientConfirmedAt = new Date().toISOString();
    persist(rec); toastMsg = 'Asistencia confirmada'; render();
  }
  function confirmCancel(tok) {
    const ct = cleanTok(tok || curToken), rec = findRecord(ct); if (!rec) return;
    if (window.AdminBookingEngine) window.AdminBookingEngine.applyTransition(rec.booking, 'CANCELLED', rec.level);
    else Object.assign(rec.booking, { prevStatus: rec.booking.status || (rec.level === 'l1' ? 'confirmado' : 'CONFIRMED'), prevDepositPaid: !!rec.booking.depositPaid, prevPaymentMethod: rec.booking.paymentMethod || null, prevPaidAt: rec.booking.paidAt || null, status: rec.level === 'l1' ? 'cancelado' : 'CANCELLED' });
    rec.booking.cancelledAt = new Date().toISOString();
    persist(rec); askCancel = false; toastMsg = 'Turno cancelado y horario liberado'; render();
  }

  function buildStatusBadge(canon) {
    if (canon === 'PENDING_DEPOSIT') return { text: 'Pendiente Seña', cls: 'bg-amber-100 text-amber-800 border border-amber-300' };
    if (canon === 'CANCELLED') return { text: 'Cancelado', cls: 'bg-rose-50 text-rose-700 border border-rose-200' };
    return { text: 'Reserva Confirmada', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' };
  }

  function renderDepositSection(b, code, lvl, depNum) {
    const r = String(b?.rubroId || '').toLowerCase().trim();
    const alias = (r && localStorage.getItem(`tucu_${lvl}_alias_${r}`)) || localStorage.getItem(`tucu_${lvl}_alias`) || localStorage.getItem('tucu_l1_alias') || 'tucured.estudio.mp';
    const cbu = (r && localStorage.getItem(`tucu_${lvl}_cbu_${r}`)) || localStorage.getItem(`tucu_${lvl}_cbu`) || localStorage.getItem('tucu_l1_cbu') || '0000003100012345678901';
    const banner = b.depositReceiptReported ? `<div id="receipt-reported-banner" class="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between gap-2"><span class="inline-flex items-center gap-1.5">${SVG.ok}<span>Comprobante informado — en validación por el comercio</span></span>${b.depositReceiptName ? `<span class="font-mono text-[10px] opacity-80 truncate max-w-[110px]">${b.depositReceiptName}</span>` : ''}</div>` : '';
    return `<div class="rounded-2xl bg-amber-50/70 border border-amber-200 p-3.5 space-y-2.5 text-xs"><div class="flex items-center justify-between"><span class="font-bold text-amber-900">Seña pendiente para confirmar</span><strong class="font-mono text-sm text-[#800000]">${fmtMoney(depNum)}</strong></div><div class="grid grid-cols-1 gap-1.5"><div class="flex items-center justify-between bg-white px-3 py-1.5 rounded-xl border border-amber-200/70"><div class="min-w-0 truncate"><span class="text-[10px] text-stone-400 block">Alias</span><span class="font-mono font-bold text-stone-800">${alias}</span></div><button type="button" id="btn-copy-alias" onclick="TucuTicketModal.copyVal('${alias}','Alias')" class="px-2 py-1 rounded-lg bg-stone-100 border border-[#D5CEC2] text-stone-700 text-[10px] font-bold inline-flex items-center gap-1 shrink-0 cursor-pointer">${SVG.copy}<span>Copiar</span></button></div><div class="flex items-center justify-between bg-white px-3 py-1.5 rounded-xl border border-amber-200/70"><div class="min-w-0 truncate"><span class="text-[10px] text-stone-400 block">CBU / CVU</span><span class="font-mono font-bold text-stone-800">${cbu}</span></div><button type="button" id="btn-copy-cbu" onclick="TucuTicketModal.copyVal('${cbu}','CBU')" class="px-2 py-1 rounded-lg bg-stone-100 border border-[#D5CEC2] text-stone-700 text-[10px] font-bold inline-flex items-center gap-1 shrink-0 cursor-pointer">${SVG.copy}<span>Copiar</span></button></div></div>${banner}<div class="space-y-2 pt-1.5 border-t border-amber-200/60"><label for="inp-receipt-file" class="block text-[10px] font-bold uppercase tracking-wider text-amber-900">Adjuntar comprobante (opcional)</label><input id="inp-receipt-file" type="file" accept="image/*,.pdf" class="w-full text-[11px] text-stone-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-stone-200/80 file:text-stone-800"><button type="button" id="btn-report-receipt" onclick="TucuTicketModal.reportReceipt('${code}')" class="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors">${SVG.upload}<span>Informar transferencia realizada</span></button></div></div>`;
  }

  function renderConfirmedState(b, code) {
    if (b.clientConfirmed) return `<div class="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5">${SVG.ok}<span>Asistencia confirmada por cliente</span></div>`;
    if (curOpts.mode === 'reminder' || curOpts.immediate === false) return `<div class="space-y-1.5"><p class="text-[11px] font-semibold text-stone-600 text-center">¿Confirmás que vas a asistir a tu turno?</p><button type="button" id="btn-confirm-attendance" onclick="TucuTicketModal.confirmAttendance('${code}')" class="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors">${SVG.ok}<span>Confirmar asistencia</span></button></div>`;
    return `<div id="immediate-confirmed-banner" class="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 text-center">${SVG.ok}<span>Reserva confirmada — te esperamos en el día y horario acordados</span></div>`;
  }

  function render() {
    let ov = document.getElementById(MODAL_ID);
    if (!ov) {
      ov = document.createElement('div'); ov.id = MODAL_ID;
      ov.className = 'fixed inset-0 z-[90] bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4';
      ov.onclick = (e) => { if (e.target.id === MODAL_ID) close(); };
      document.body.appendChild(ov);
    }
    const rec = findRecord(curToken);
    if (!rec) {
      ov.innerHTML = `<div class="w-full max-w-md rounded-3xl bg-[#FBFBF9] border border-[#D5CEC2] p-5 shadow-2xl text-center space-y-3 text-stone-900"><p class="text-sm font-bold">Ticket #${curToken} no encontrado</p><button type="button" id="btn-modal-return-turnero" onclick="TucuTicketModal.close()" class="w-full py-2.5 rounded-xl bg-stone-100 border border-[#D5CEC2] text-xs font-semibold cursor-pointer">Volver al Turnero</button></div>`;
      return;
    }
    const b = rec.booking, code = cleanTok(b.token || b.id), lvl = rec.level, canon = resolveCanon(b), badge = buildStatusBadge(canon);
    const biz = b.bizName || localStorage.getItem(`tucu_${lvl}_biz_name`) || localStorage.getItem('tucu_biz_name') || 'Estudio Central TucuRed';
    const addr = resolveAddress(b, lvl), srv = b.serviceName || b.service || 'Servicio Reservado', client = b.clientName || b.client || 'Cliente';
    const priceNum = Number(b.price) || 0, depNum = Number(b.depositAmount) || 0, balance = Math.max(0, priceNum - (b.depositPaid ? depNum : 0));
    const isActive = canon === 'PENDING_DEPOSIT' || canon === 'CONFIRMED';

    ov.innerHTML = `<div class="w-full max-w-md rounded-3xl bg-[#FBFBF9] border border-[#D5CEC2] p-4 sm:p-5 shadow-2xl max-h-[92vh] overflow-y-auto space-y-3.5 text-stone-900">
      <div class="flex items-start justify-between gap-2 pb-3 border-b border-stone-200">
        <div><p class="text-[10px] font-bold uppercase tracking-wider text-stone-400">Ticket Online</p><h2 class="text-base font-extrabold text-stone-900">${biz}</h2><div class="flex items-center gap-1.5 mt-1 flex-wrap"><span class="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-stone-100 border border-[#D5CEC2] text-stone-800">#${code}</span><span id="modal-status-badge" class="text-[10px] font-bold px-2.5 py-0.5 rounded-full ${badge.cls}">${badge.text}</span></div></div>
        <button type="button" id="btn-close-ticket-modal" aria-label="Cerrar ticket" onclick="TucuTicketModal.close()" class="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 border border-[#D5CEC2] text-stone-700 flex items-center justify-center shrink-0 cursor-pointer">${SVG.x}</button>
      </div>
      ${toastMsg ? `<div id="modal-toast" class="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5">${SVG.ok}<span>${toastMsg}</span></div>` : ''}
      <div class="rounded-2xl bg-stone-50 border border-[#D5CEC2] p-3.5 space-y-2 text-xs">
        <div class="flex justify-between gap-2"><span class="text-stone-500">Servicio</span><strong class="text-stone-900 text-right">${srv}</strong></div>
        <div class="flex justify-between gap-2"><span class="text-stone-500 flex items-center gap-1">${SVG.cal} Fecha y hora</span><strong class="text-stone-900 capitalize">${fmtDate(b.dateStr || b.date)} · ${b.time || '--:--'} hs</strong></div>
        <div class="flex justify-between gap-2"><span class="text-stone-500">Dirección</span><strong id="modal-ticket-address" class="text-stone-900 text-right">${addr}</strong></div>
        ${b.staffName ? `<div class="flex justify-between gap-2"><span class="text-stone-500">Especialista</span><strong class="text-stone-900">${b.staffName}</strong></div>` : ''}
        <div class="flex justify-between gap-2"><span class="text-stone-500">Titular</span><span class="font-semibold text-stone-800">${client}</span></div>
        <div class="flex justify-between gap-2 pt-1.5 border-t border-stone-200/80"><span class="text-stone-500">Saldo en local</span><strong class="font-mono text-stone-900">${fmtMoney(balance)}</strong></div>
      </div>
      ${canon === 'PENDING_DEPOSIT' && depNum > 0 ? renderDepositSection(b, code, lvl, depNum) : ''}
      ${canon === 'CONFIRMED' ? renderConfirmedState(b, code) : ''}
      <div class="space-y-2 pt-1">
        ${isActive && !askCancel ? `<button type="button" id="btn-ask-cancel" onclick="TucuTicketModal.toggleCancel(true)" class="w-full py-2 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center justify-center gap-1.5 cursor-pointer">${SVG.x}<span>Cancelar turno</span></button>` : ''}
        ${isActive && askCancel ? `<div class="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-2 text-center"><p class="text-xs font-semibold text-rose-800">¿Confirmás cancelar el turno #${code}? El horario se liberará al instante.</p><div class="flex gap-2"><button type="button" onclick="TucuTicketModal.toggleCancel(false)" class="w-1/2 py-2 rounded-xl bg-white border border-[#D5CEC2] text-xs font-semibold cursor-pointer">Volver</button><button type="button" id="btn-confirm-cancel" onclick="TucuTicketModal.confirmCancel('${code}')" class="w-1/2 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold cursor-pointer">Sí, cancelar</button></div></div>` : ''}
        <button type="button" id="btn-modal-return-turnero" onclick="TucuTicketModal.close()" class="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 border border-[#D5CEC2] text-stone-800 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer">Volver al Turnero</button>
      </div>
    </div>`;
  }

  function open(tok, levelOrOpts = { immediate: true }, rubroOpt = '', extraOpts = {}) {
    curToken = cleanTok(tok);
    curOpts = typeof levelOrOpts === 'string' ? { origin: 'showroom', immediate: true, level: levelOrOpts, rubro: rubroOpt, ...extraOpts } : (levelOrOpts || { immediate: true });
    askCancel = !!curOpts.askCancel; toastMsg = ''; render();
  }
  return { open, openForCancel: (tok, lvl, rubro) => open(tok, lvl, rubro, { askCancel: true }), close, copyVal, reportReceipt, confirmAttendance, confirmCancel, toggleCancel: (v) => { askCancel = v; render(); } };
})();