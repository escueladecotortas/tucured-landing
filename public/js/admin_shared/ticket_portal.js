// Archivo: public/js/admin_shared/ticket_portal.js
// Portal Unificado de Autogestión Post-Reserva Warm Studio (L1/L2/L3 < 178 líneas)

window.TucuTicketPortal = (function () {
  const eng = () => window.AdminBookingEngine;
  const wa = () => window.AdminWaTemplates;
  const SVG = {
    ticket: '<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>',
    cal: '<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>',
    copy: '<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>',
    ok: '<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>',
    msg: '<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>',
    x: '<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>'
  };

  let askCancel = false;
  const cleanTok = (raw) => String(raw || '').replace(/^#/, '').trim().toUpperCase();

  function parseTokenFromLocation() {
    const q = new URLSearchParams(window.location.search).get('token');
    if (q) return cleanTok(q);
    const m = window.location.pathname.match(/\/t\/([^/?#]+)/i);
    return m ? cleanTok(decodeURIComponent(m[1])) : '';
  }

  function scanStorageEntries() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('tucu_l1_bookings_')) keys.push({ key: k, level: 'l1' });
    }
    keys.push({ key: 'tucu_l2_bookings', level: 'l2' }, { key: 'tucu_l3_bookings', level: 'l3' });
    return keys;
  }

  function findRecord(targetToken) {
    const entries = scanStorageEntries();
    for (const { key, level } of entries) {
      try {
        const list = JSON.parse(localStorage.getItem(key) || 'null');
        if (!Array.isArray(list)) continue;
        const idx = list.findIndex(b => !b.deletedAt && (cleanTok(b.token) === targetToken || cleanTok(b.id) === targetToken));
        if (idx >= 0) return { key, level, list, index: idx, booking: list[idx] };
      } catch (_) {}
    }
    if (!targetToken && window.AdminDemoSeed) {
      const seed = window.AdminDemoSeed.getL2Seed(eng()?.getConfig('l2'));
      if (seed.length) {
        try { localStorage.setItem('tucu_l2_bookings', JSON.stringify(seed)); } catch (_) {}
        return { key: 'tucu_l2_bookings', level: 'l2', list: seed, index: 0, booking: seed[0], isSample: true };
      }
    }
    return null;
  }

  function toast(msg) {
    const t = document.getElementById('portal-toast');
    if (!t) return;
    t.querySelector('span').textContent = msg;
    t.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
    setTimeout(() => t.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none'), 2200);
  }

  function copyVal(text, label) {
    if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {});
    toast(`${label} copiado al portapapeles`);
  }

  function confirmAttendance(tok) {
    const rec = findRecord(tok); if (!rec) return;
    rec.booking.clientConfirmed = true;
    rec.booking.clientConfirmedAt = new Date().toISOString();
    try { localStorage.setItem(rec.key, JSON.stringify(rec.list)); } catch (_) {}
    toast('Asistencia confirmada');
    render(tok);
  }

  function confirmCancel(tok) {
    const rec = findRecord(tok); if (!rec || !eng()) return;
    eng().applyTransition(rec.booking, 'CANCELLED', rec.level);
    try { localStorage.setItem(rec.key, JSON.stringify(rec.list)); } catch (_) {}
    askCancel = false;
    toast('Turno cancelado y horario liberado');
    render(tok);
  }

  function lookupToken(ev) {
    ev.preventDefault();
    const val = cleanTok(document.getElementById('portal-search-token')?.value);
    if (!val) return;
    window.history.replaceState({}, '', `/gestion_turno.html?token=${encodeURIComponent(val)}`);
    askCancel = false;
    render(val);
  }

  function render(forcedToken) {
    const root = document.getElementById('portal-card-root'); if (!root) return;
    const token = cleanTok(forcedToken ?? parseTokenFromLocation());
    const rec = findRecord(token);
    if (!rec) {
      root.innerHTML = `<div class="text-center py-6 space-y-4">
        <div class="w-12 h-12 rounded-2xl bg-[#800000]/10 text-[#800000] border border-[#800000]/20 flex items-center justify-center mx-auto">${SVG.ticket}</div>
        <div class="space-y-1"><h2 class="font-title text-base font-extrabold text-stone-900 dark:text-stone-100">${token ? `Ticket #${token} no encontrado` : 'Consultar Ticket de Turno'}</h2><p class="text-xs text-stone-500">Ingresá tu código de reserva (ej. TK-8492) o volvé al turnero.</p></div>
        <form onsubmit="TucuTicketPortal.lookupToken(event)" class="flex gap-2"><input id="portal-search-token" type="text" placeholder="Ej. TK-8492" value="${token}" class="flex-1 bg-stone-50 dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl px-3 py-2 text-xs font-mono outline-none"><button type="submit" class="px-4 py-2 rounded-xl admin-glass-primary text-xs font-bold">Buscar</button></form>
        <a href="/#showroom" class="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl admin-glass-btn text-xs font-semibold">Volver al Turnero</a>
      </div>`;
      return;
    }

    const b = rec.booking, code = cleanTok(b.token || b.id), lvl = rec.level;
    const meta = eng().getMeta(b.status), canon = meta.key;
    const biz = b.bizName || localStorage.getItem(`tucu_${lvl}_biz_name`) || localStorage.getItem('tucu_biz_name') || 'Estudio Central TucuRed';
    const alias = localStorage.getItem(`tucu_${lvl}_alias`) || localStorage.getItem('tucu_l1_alias') || 'tucured.estudio.mp';
    const cbu = localStorage.getItem(`tucu_${lvl}_cbu`) || localStorage.getItem('tucu_l1_cbu') || '0000003100012345678901';
    const dateNat = wa()?.formatNaturalDate?.(b.dateStr || b.date) || (b.dateStr || b.date || 'Próximo turno');
    const srv = b.serviceName || b.service || 'Servicio Reservado', client = b.clientName || b.client || 'Cliente';
    const priceNum = Number(b.price) || 0, depNum = Number(b.depositAmount) || 0, balance = Math.max(0, priceNum - (b.depositPaid ? depNum : 0));
    const waComprobante = `https://wa.me/${wa()?.DEMO_WA_NUMBER || '5493815551234'}?text=${encodeURIComponent(`Hola ${biz}, te envío el comprobante de la seña (${eng().fmt(depNum)}) para mi reserva #${code} (${client}, ${dateNat} a las ${b.time} hs).`)}`;
    const isActive = canon === 'PENDING_DEPOSIT' || canon === 'CONFIRMED';

    root.innerHTML = `<div class="space-y-4">
      ${rec.isSample ? '<p class="text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3 py-1.5 rounded-xl text-center">Mostrando ticket de ejemplo (#TK-' + code.replace(/^TK-/, '') + ')</p>' : ''}
      <div class="flex items-center justify-between gap-2 pb-3 border-b border-stone-200 dark:border-stone-800">
        <div><p class="text-[10px] font-bold uppercase tracking-wider text-stone-400">Comercio</p><h2 class="font-title text-base font-extrabold text-stone-900 dark:text-stone-100">${biz}</h2></div>
        <div class="text-right space-y-1"><span class="inline-block font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 border border-[#D5CEC2] dark:border-stone-700 text-stone-800 dark:text-stone-200">#${code}</span><div><span class="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full ${meta.badge}">${meta.label}</span></div></div>
      </div>

      <div class="rounded-2xl bg-stone-50 dark:bg-stone-950/60 border border-[#D5CEC2] dark:border-stone-800 p-3.5 space-y-2 text-xs">
        <div class="flex justify-between gap-2"><span class="text-stone-500">Servicio</span><strong class="text-stone-900 dark:text-stone-100 text-right">${srv}</strong></div>
        <div class="flex justify-between gap-2"><span class="text-stone-500 flex items-center gap-1">${SVG.cal} Fecha y hora</span><strong class="text-stone-900 dark:text-stone-100 capitalize">${dateNat} · ${b.time || '--:--'} hs</strong></div>
        ${b.staffName ? `<div class="flex justify-between gap-2"><span class="text-stone-500">Especialista</span><strong class="text-stone-900 dark:text-stone-100">${b.staffName}</strong></div>` : ''}
        <div class="flex justify-between gap-2"><span class="text-stone-500">Titular</span><span class="font-semibold text-stone-800 dark:text-stone-200">${client}</span></div>
        <div class="flex justify-between gap-2 pt-1.5 border-t border-stone-200/80 dark:border-stone-800"><span class="text-stone-500">Saldo en local</span><strong class="font-mono text-stone-900 dark:text-stone-100">${eng().fmt(balance)}</strong></div>
      </div>

      ${canon === 'PENDING_DEPOSIT' && depNum > 0 ? `<div class="rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 p-3.5 space-y-2.5 text-xs">
        <div class="flex items-center justify-between"><span class="font-bold text-amber-900 dark:text-amber-200">Seña pendiente para confirmar</span><strong class="font-mono text-sm text-[#800000] dark:text-red-300">${eng().fmt(depNum)}</strong></div>
        <div class="grid grid-cols-1 gap-1.5">
          <div class="flex items-center justify-between bg-white dark:bg-stone-900 px-3 py-1.5 rounded-xl border border-amber-200/70 dark:border-stone-700"><div class="min-w-0 truncate"><span class="text-[10px] text-stone-400 block">Alias</span><span class="font-mono font-bold text-stone-800 dark:text-stone-100">${alias}</span></div><button type="button" id="btn-copy-alias" onclick="TucuTicketPortal.copyVal('${alias}','Alias')" class="px-2 py-1 rounded-lg admin-glass-btn text-[10px] font-bold inline-flex items-center gap-1 shrink-0">${SVG.copy}<span>Copiar</span></button></div>
          <div class="flex items-center justify-between bg-white dark:bg-stone-900 px-3 py-1.5 rounded-xl border border-amber-200/70 dark:border-stone-700"><div class="min-w-0 truncate"><span class="text-[10px] text-stone-400 block">CBU / CVU</span><span class="font-mono font-bold text-stone-800 dark:text-stone-100">${cbu}</span></div><button type="button" id="btn-copy-cbu" onclick="TucuTicketPortal.copyVal('${cbu}','CBU')" class="px-2 py-1 rounded-lg admin-glass-btn text-[10px] font-bold inline-flex items-center gap-1 shrink-0">${SVG.copy}<span>Copiar</span></button></div>
        </div>
        <a id="btn-send-receipt" href="${waComprobante}" target="_blank" rel="noopener" class="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5">${SVG.msg}<span>Enviar comprobante por WhatsApp</span></a>
      </div>` : ''}

      ${b.clientConfirmed ? `<div class="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/35 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-center gap-1.5">${SVG.ok}<span>Asistencia confirmada por cliente</span></div>` : ''}

      <div class="space-y-2 pt-1">
        ${isActive && !b.clientConfirmed ? `<button type="button" id="btn-confirm-attendance" onclick="TucuTicketPortal.confirmAttendance('${code}')" class="w-full py-2.5 rounded-xl admin-glass-primary text-xs font-bold flex items-center justify-center gap-1.5">${SVG.ok}<span>Confirmar asistencia</span></button>` : ''}
        ${isActive && !askCancel ? `<button type="button" id="btn-ask-cancel" onclick="TucuTicketPortal.toggleCancel(true,'${code}')" class="w-full py-2 rounded-xl admin-glass-btn text-xs font-semibold text-rose-700 dark:text-rose-400 flex items-center justify-center gap-1.5">${SVG.x}<span>Cancelar turno</span></button>` : ''}
        ${isActive && askCancel ? `<div class="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-2 text-center"><p class="text-xs font-semibold text-rose-800 dark:text-rose-200">¿Confirmás cancelar el turno #${code}? El horario se liberará al instante.</p><div class="flex gap-2"><button type="button" onclick="TucuTicketPortal.toggleCancel(false,'${code}')" class="w-1/2 py-2 rounded-xl admin-glass-btn text-xs font-semibold">Volver</button><button type="button" id="btn-confirm-cancel" onclick="TucuTicketPortal.confirmCancel('${code}')" class="w-1/2 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold cursor-pointer">Sí, cancelar</button></div></div>` : ''}
        <a href="/#showroom" class="w-full py-2 rounded-xl admin-glass-btn text-xs font-semibold flex items-center justify-center gap-1.5">Volver al Turnero</a>
      </div>
    </div>`;
  }

  if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', () => render());
  return { render, lookupToken, copyVal, confirmAttendance, confirmCancel, toggleCancel: (v, tok) => { askCancel = v; render(tok); }, parseTokenFromLocation };
})();

