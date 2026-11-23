// Archivo: public/js/admin_shared/turnero_ticket_inline.js
// Comprobante compacto sin scroll: Total|Seña|Saldo, logo protagonista (52-56px), alias demo por rubro y Obra Social solo salud (< 185L)

window.TucuTicketInline = (function () {
  const SVG = {
    cal: '<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="1.9" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>',
    pin: '<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="1.9" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><circle cx="12" cy="11" r="2.5"/></svg>',
    copy: '<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>',
    upload: '<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="1.9" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>',
    ok: '<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>'
  };

  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const cleanTok = (raw) => String(raw || '').replace(/^#/, '').trim().toUpperCase();
  const readJson = (k) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (_) { return null; } };
  const api = { lastCalendarAction: null };
  const isAppleDevice = (uaStr) => /iPhone|iPad|iPod|Macintosh|Mac OS X/i.test(String(uaStr || (typeof navigator !== 'undefined' ? navigator.userAgent : '')));

  function resolveBankData(level, rubro) {
    const norm = window.TucuTurneroCatalog?.normalizeRubro?.(rubro) || rubro || 'peluqueria';
    const meta = window.TucuTurneroCatalog?.RUBRO_META?.[norm] || {};
    const rL3 = meta.l3 || norm, defaultAlias = meta.alias || 'brava.barberia.mp';
    const payByR = readJson(`tucu_${level}_payment_cfg_${rL3}`) || readJson(`tucu_${level}_payment_cfg_${norm}`) || {};
    const payDef = readJson(`tucu_${level}_payment_cfg`) || readJson('tucu_l1_cfg_ext') || {};
    const pick = (lsKeys, cfgVals, fb) => {
      for (const k of lsKeys) { const v = localStorage.getItem(k); if (v !== null) return v.trim(); }
      for (const v of cfgVals) if (v !== undefined && v !== null) return String(v).trim();
      return fb;
    };
    const alias = pick([`tucu_${level}_alias_${rL3}`, `tucu_${level}_alias_${norm}`, `tucu_${level}_alias`, 'tucu_l1_alias'], [payByR.alias, payDef.alias], defaultAlias);
    const cbu = pick([`tucu_${level}_cbu_${rL3}`, `tucu_${level}_cbu_${norm}`, `tucu_${level}_cbu`, 'tucu_l1_cbu'], [payByR.cbu, payDef.cbu], '0000003100012345678901');
    return { alias, cbu };
  }

  function resolveCanon(b) {
    const st = String(b?.status || '').toUpperCase();
    if (st === 'CANCELLED' || st === 'CANCELADO') return 'CANCELLED';
    if (st === 'COMPLETED' || st === 'FINALIZADO') return 'COMPLETED';
    if ((st === 'PENDING_DEPOSIT' || st === 'PENDIENTE') && Number(b?.depositAmount) > 0 && !b?.depositPaid) return 'PENDING_DEPOSIT';
    return 'CONFIRMED';
  }

  function persistBooking(level, record) {
    if (!record) return;
    const ct = cleanTok(record.token || record.id), pref = `tucu_${level}_bookings`;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i) || ''; if (!k.startsWith(pref)) continue;
      const list = readJson(k), idx = Array.isArray(list) ? list.findIndex(b => cleanTok(b?.token || b?.id) === ct) : -1;
      if (idx >= 0) { list[idx] = record; try { localStorage.setItem(k, JSON.stringify(list)); } catch (_) {} }
    }
    if (window.ShowcaseState && cleanTok(window.ShowcaseState.lastBookingCode) === ct) {
      window.ShowcaseState.lastBookingRecord = { ...record }; window.ShowcaseState.notify?.();
    }
  }

  function findBooking(code, level) {
    const ct = cleanTok(code), pref = `tucu_${level}_bookings`;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i) || ''; if (!k.startsWith(pref)) continue;
      const list = readJson(k), hit = Array.isArray(list) ? list.find(b => b && !b.deletedAt && cleanTok(b.token || b.id) === ct) : null;
      if (hit) return hit;
    }
    return null;
  }

  function reportReceipt(level, record, fileName) {
    if (!record || !fileName) return null;
    Object.assign(record, { depositReceiptReported: true, depositReceiptName: fileName, depositReceiptAt: new Date().toISOString() });
    persistBooking(level, record); return record;
  }

  function rescheduleBooking(level, rubro, record, patch = {}) {
    if (!record) return null;
    const srv = patch.service, price = Number(srv?.price ?? record.price ?? 0);
    const eng = window.AdminBookingEngine, dep = eng ? eng.calcDeposit(price, level, srv?.requireDeposit !== false) : Math.round(price * 0.5);
    Object.assign(record, {
      date: patch.date || record.date, dateStr: patch.date || record.dateStr, day: patch.date || record.day, time: patch.time || record.time,
      service: srv?.name || record.service, serviceName: srv?.name || record.serviceName, serviceId: srv?.id || record.serviceId,
      duration: srv?.duration || record.duration, price, depositAmount: record.depositPaid ? (record.depositAmount || dep) : dep,
      staffId: patch.staff?.id || record.staffId, staffName: patch.staff?.name || record.staffName,
      resourceId: patch.resource?.id || record.resourceId, resourceName: patch.resource?.name || record.resourceName,
      clientName: patch.clientName || record.clientName, client: patch.clientName || record.client,
      clientPhone: patch.clientPhone || record.clientPhone, phone: patch.clientPhone || record.phone,
      coverage: rubro === 'salud' ? (patch.coverage ?? record.coverage) : '',
      clientBirthday: patch.clientBirthday ?? record.clientBirthday, clientEmail: patch.clientEmail ?? record.clientEmail, rescheduledAt: new Date().toISOString()
    });
    persistBooking(level, record); window.TucuTicketLookup?.saveSeed?.(record, { level, rubro });
    return { code: cleanTok(record.token || record.id), record };
  }

  function cancelBooking(level, rubro, record, cancelReason = '') {
    if (!record) return null;
    if (window.AdminBookingEngine) window.AdminBookingEngine.applyTransition(record, 'CANCELLED', level);
    else Object.assign(record, { prevStatus: record.status || 'CONFIRMED', status: level === 'l1' ? 'cancelado' : 'CANCELLED' });
    record.cancelReason = String(cancelReason || '').trim(); record.cancelledAt = new Date().toISOString();
    persistBooking(level, record);
    try { localStorage.removeItem(`tucu_client_seed_${level}_${rubro}`); } catch (_) {}
    window.TucuTicketLookup?.getActiveSeed?.(level, rubro); return record;
  }

  function openSmartCalendar(evt, code) {
    if (isAppleDevice()) {
      const ics = window.TucuCalendar?.downloadIcs?.(evt, `reserva_${cleanTok(code)}.ics`) || '';
      api.lastCalendarAction = { mode: 'ics', code: cleanTok(code), icsLen: ics.length }; return api.lastCalendarAction;
    }
    const url = window.TucuCalendar?.buildGoogleUrl?.(evt) || '#';
    api.lastCalendarAction = { mode: 'gcal', url };
    if (typeof window !== 'undefined' && url !== '#') window.open(url, '_blank', 'noopener,noreferrer');
    return api.lastCalendarAction;
  }

  function fmtDateNatural(iso) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(iso || ''))) return String(iso || 'Próxima fecha');
    const d = new Date(`${iso}T12:00:00`), days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return isNaN(d.getTime()) ? String(iso) : `${days[d.getDay()]} ${d.getDate()} de ${months[d.getMonth()]}`;
  }

  function renderBankSection(c, rec, bank) {
    const aliasRow = bank.alias ? `<div id="ticket-alias-row" class="w-full flex items-center justify-between gap-2 bg-white rounded-xl border border-stone-200/70 px-3 py-1.5"><div class="min-w-0 flex-1"><span class="block text-[10px] font-semibold uppercase tracking-wider text-stone-400">Alias para transferir la seña</span><p id="ticket-alias-val" class="text-xs sm:text-sm font-bold text-stone-900 break-all">${esc(bank.alias)}</p></div><button type="button" id="btn-copy-alias" onclick="TucuTurneroApp.copyBank('alias')" class="px-2.5 py-1 rounded-lg bg-[#FAF8F5] hover:bg-stone-100 border border-stone-200 text-[11px] font-semibold text-stone-800 inline-flex items-center gap-1 shrink-0 cursor-pointer">${SVG.copy}<span>${c.copiedKey === 'alias' ? 'Copiado' : 'Copiar'}</span></button></div>` : '';
    const cbuRow = bank.cbu && (!bank.alias || c.showCbu) ? `<div id="ticket-cbu-row" class="w-full flex items-center justify-between gap-2 bg-white rounded-xl border border-stone-200/70 px-3 py-1.5"><div class="min-w-0 flex-1"><span class="block text-[10px] font-semibold uppercase tracking-wider text-stone-400">CBU / CVU</span><p id="ticket-cbu-val" class="text-xs font-bold text-stone-900 tabular-nums break-all">${esc(bank.cbu)}</p></div><button type="button" id="btn-copy-cbu" onclick="TucuTurneroApp.copyBank('cbu')" class="px-2.5 py-1 rounded-lg bg-[#FAF8F5] hover:bg-stone-100 border border-stone-200 text-[11px] font-semibold text-stone-800 inline-flex items-center gap-1 shrink-0 cursor-pointer">${SVG.copy}<span>${c.copiedKey === 'cbu' ? 'Copiado' : 'Copiar'}</span></button></div>` : '';
    const cbuToggle = bank.alias && bank.cbu ? `<div class="text-right"><button type="button" id="btn-toggle-cbu" onclick="TucuTurneroApp.toggleCbu()" class="text-[11px] font-semibold tucu-primary-text hover:underline underline-offset-4 cursor-pointer">${c.showCbu ? 'Ocultar CBU/CVU' : 'Ver CBU/CVU'}</button></div>` : '';
    const receiptArea = rec.depositReceiptReported
      ? `<div id="inline-receipt-reported" class="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between gap-2"><span class="inline-flex items-center gap-1.5">${SVG.ok}<span>Comprobante informado · En validación</span></span>${rec.depositReceiptName ? `<span class="text-[11px] opacity-80 truncate max-w-[120px]">${esc(rec.depositReceiptName)}</span>` : ''}</div>`
      : `<div class="space-y-1.5 pt-0.5"><label for="inp-inline-receipt" class="flex items-center gap-2.5 p-2 border border-dashed border-stone-300 hover:border-stone-400 rounded-xl bg-white cursor-pointer transition-colors"><input id="inp-inline-receipt" type="file" accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf" onchange="TucuTurneroApp.onReceiptChange(this)" class="hidden"><span class="tucu-primary-text">${SVG.upload}</span><span id="inline-receipt-label" class="min-w-0 flex-1 text-xs font-medium text-stone-700 truncate">${c.receiptFileName ? esc(c.receiptFileName) : 'Adjuntar comprobante (JPG, PNG o PDF)'}</span></label><button type="button" id="btn-inline-report-receipt" ${c.receiptFileName ? '' : 'disabled'} onclick="TucuTurneroApp.reportInlineReceipt()" class="tucu-btn-primary w-full py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"><span>Informar transferencia</span><span aria-hidden="true">&#8594;</span></button></div>`;
    return `<section id="ticket-deposit-box" class="rounded-2xl bg-[#F4F0E8] border border-stone-200/80 p-3 space-y-1.5"><div class="space-y-1">${aliasRow}${cbuToggle}${cbuRow}</div>${receiptArea}</section>`;
  }

  function renderTicket(c) {
    const v = c.vocab || { singular: 'turno', docTitle: 'Comprobante de turno', cancelLabel: 'Cancelar turno', anotherLabel: 'Sacar otro turno', confirmedBadge: 'Turno confirmado', cancelledBadge: 'Turno cancelado' };
    const r = c.result || {}, rec = r.record || {}, code = cleanTok(r.code || rec.token || rec.id || 'TK-DEMO');
    const canon = resolveCanon(rec), dep = Number(rec.depositAmount) || 0, price = Number(rec.price ?? c.service?.price ?? 0);
    const bal = Math.max(0, price - (dep > 0 && (rec.depositPaid || canon === 'PENDING_DEPOSIT') ? dep : 0));
    const isActive = canon === 'PENDING_DEPOSIT' || canon === 'CONFIRMED', bank = resolveBankData(c.level, c.rubro);
    const srvName = rec.serviceName || rec.service || c.service?.name || 'Servicio reservado', dateTxt = fmtDateNatural(rec.dateStr || rec.date || c.selectedDate);
    const logoImg = c.logoUrl ? `<img id="turnero-header-logo" src="${esc(c.logoUrl)}" alt="Logo ${esc(rec.bizName || c.bizName)}" onerror="this.remove()" class="w-[52px] h-[52px] sm:w-14 sm:h-14 rounded-xl object-contain bg-white shrink-0">` : '';
    const badgeMap = { PENDING_DEPOSIT: ['bg-amber-50 text-amber-800 border-amber-200', `Pendiente de seña ${c.fmt(dep)}`], CANCELLED: ['bg-rose-50 text-rose-700 border-rose-200', v.cancelledBadge], COMPLETED: ['bg-stone-100 text-stone-700 border-stone-300', 'Finalizado'], CONFIRMED: ['bg-emerald-50 text-emerald-700 border-emerald-200', v.confirmedBadge] };
    const [bCls, bTxt] = badgeMap[canon] || badgeMap.CONFIRMED;
    const econGrid = dep > 0
      ? `<div id="ticket-econ-grid" class="grid grid-cols-3 gap-2 pt-2 border-t border-stone-200/70 tabular-nums"><div><span class="block text-[10px] font-semibold uppercase tracking-wider text-stone-400">Total</span><strong class="text-sm font-bold text-stone-900">${c.fmt(price)}</strong></div><div><span class="block text-[10px] font-semibold uppercase tracking-wider text-stone-400">Seña</span><strong class="text-sm font-bold tucu-primary-text">${c.fmt(dep)}</strong></div><div class="text-right"><span class="block text-[10px] font-semibold uppercase tracking-wider text-stone-400">Saldo en local</span><strong id="ticket-local-balance" class="text-sm font-bold text-stone-900">${c.fmt(bal)}</strong></div></div>`
      : `<div id="ticket-econ-grid" class="flex items-center justify-between pt-2 border-t border-stone-200/70 tabular-nums"><span class="text-[11px] font-semibold uppercase tracking-wider text-stone-400">Total</span><strong id="ticket-local-balance" class="text-sm font-bold text-stone-900">${c.fmt(price)}</strong></div>`;
    const transferBlock = canon === 'PENDING_DEPOSIT' ? renderBankSection(c, rec, bank) : '';
    const statusNotice = canon === 'CONFIRMED'
      ? `<div id="ticket-confirmed-notice" class="rounded-2xl bg-[#F4F0E8] border border-stone-200/80 p-2.5 text-xs text-stone-700"><p class="font-semibold text-stone-900 flex items-center gap-1.5"><span class="text-emerald-700">${SVG.ok}</span><span>${dep > 0 && rec.depositPaid ? `Seña acreditada (${c.fmt(dep)}) · ` : ''}Confirmación enviada a tu WhatsApp</span></p></div>`
      : (canon === 'CANCELLED' ? `<div id="inline-cancelled-banner" class="rounded-2xl bg-rose-50 border border-rose-200 p-2.5 text-xs font-semibold text-rose-800 text-center">Cancelación confirmada. El horario ya fue liberado.${rec.cancelReason ? ` Motivo: ${esc(rec.cancelReason)}.` : ''}</div>` : '');
    const actionsRow = isActive && !rec.isDemoSample
      ? `<div class="grid grid-cols-1 sm:grid-cols-2 gap-2"><button type="button" id="btn-smart-calendar" onclick="TucuTurneroApp.openSmartCalendar()" class="w-full py-2 px-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F4F0E8] border border-stone-200 text-stone-900 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"><span class="tucu-primary-text">${SVG.cal}</span><span>Agendar en mi calendario</span></button><button type="button" id="btn-reschedule-booking" onclick="TucuTurneroApp.startReschedule()" class="w-full py-2 px-3 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-800 cursor-pointer transition-colors">Cambiar día u horario</button></div><div class="flex items-center justify-center gap-4 text-xs"><button type="button" id="btn-cancel-booking" onclick="TucuTurneroApp.openCancelModal()" class="font-medium text-stone-500 hover:text-rose-700 cursor-pointer">${esc(v.cancelLabel)}</button><span aria-hidden="true" class="text-stone-300">·</span><button type="button" id="btn-turnero-reset" onclick="TucuTurneroApp.resetFlow()" class="font-medium text-stone-600 hover:text-stone-900 cursor-pointer">${esc(v.anotherLabel)}</button></div>`
      : `<div class="text-center pt-0.5"><button type="button" id="btn-turnero-reset" onclick="TucuTurneroApp.resetFlow()" class="text-xs font-semibold tucu-primary-text hover:underline cursor-pointer">${esc(v.anotherLabel)}</button></div>`;

    return `<div id="turnero-ticket-view" class="space-y-2.5">
      <header class="flex items-center justify-between gap-2 pb-2 border-b border-stone-200/70">
        <div class="flex items-center gap-3 min-w-0"><button type="button" id="btn-back-cover" onclick="TucuTurneroApp.backToCover()" class="lg:hidden px-2 py-1 rounded-lg bg-[#FAF8F5] border border-stone-200 text-[11px] font-semibold text-stone-700 shrink-0 cursor-pointer">&#8249; Portada</button>${logoImg}<div class="min-w-0"><span id="turnero-biz-name" class="block text-[11px] font-semibold text-stone-500 truncate">${esc(v.docTitle)} · ${esc(rec.bizName || c.bizName)}</span><span id="ticket-code-badge" class="text-base sm:text-lg font-bold text-stone-900 tabular-nums">#${code}</span></div></div>
        <span id="ticket-status-badge" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border shrink-0 tabular-nums ${bCls}">${esc(bTxt)}</span>
      </header>
      ${c.toastMsg ? `<div id="ticket-inline-toast" class="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5">${SVG.ok}<span>${esc(c.toastMsg)}</span></div>` : ''}
      <section class="rounded-2xl bg-[#FAF8F5] border border-stone-200/80 p-3 space-y-2">
        <div><p class="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-400">Servicio</p><h2 class="text-base sm:text-lg font-semibold text-stone-900 leading-tight mt-0.5 break-words">${esc(srvName)}</h2></div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
          <div class="flex items-start gap-2"><span class="tucu-primary-text mt-0.5">${SVG.cal}</span><div class="min-w-0"><span class="block text-[10px] font-semibold uppercase tracking-wider text-stone-400">Fecha y hora</span><strong class="font-semibold text-stone-900 tabular-nums">${esc(dateTxt)} · ${esc(rec.time || c.selectedTime)} hs</strong></div></div>
          <div class="flex items-start gap-2"><span class="tucu-primary-text mt-0.5">${SVG.pin}</span><div class="min-w-0"><span class="block text-[10px] font-semibold uppercase tracking-wider text-stone-400">Dirección</span><strong class="font-semibold text-stone-900 break-words">${esc(rec.address || c.address)}</strong></div></div>
          ${rec.staffName ? `<div><span class="text-stone-500">${c.rubro === 'deportes' ? 'Cancha' : 'Especialista'}:</span> <strong class="font-semibold text-stone-900">${esc(rec.staffName)}</strong></div>` : ''}
          ${c.rubro === 'salud' && rec.coverage ? `<div><span class="text-stone-500">Obra Social:</span> <strong class="font-semibold text-stone-900">${esc(rec.coverage)}</strong></div>` : ''}
          ${rec.clientName || rec.client ? `<div class="sm:col-span-2 text-stone-600">Titular: <strong class="font-semibold text-stone-900">${esc(rec.clientName || rec.client)}</strong></div>` : ''}
        </div>
        ${econGrid}
      </section>
      ${transferBlock}${statusNotice}${actionsRow}
    </div>`;
  }

  Object.assign(api, { isAppleDevice, resolveBankData, findBooking, reportReceipt, rescheduleBooking, cancelBooking, openSmartCalendar, renderTicket });
  return api;
})();
