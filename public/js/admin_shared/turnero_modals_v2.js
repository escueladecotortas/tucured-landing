// Archivo: public/js/admin_shared/turnero_modals_v2.js
// Modales V2 en Plus Jakarta Sans: cancelación KPI en 1 toque e historial con estados variados (< 130L)

window.TucuModalsV2 = (function () {
  const CANCEL_MODAL_ID = 'tucu-cancel-reason-modal';
  const HISTORY_MODAL_ID = 'tucu-history-modal';
  const REASONS = ['Me surgió un imprevisto', 'Me equivoqué de horario', 'Necesito otro servicio', 'Otro motivo'];
  const SVG_X = '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>';
  const SVG_CAL = '<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="1.9" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>';

  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const cleanTok = (raw) => String(raw || '').replace(/^#/, '').trim().toUpperCase();

  function statusMeta(b) {
    const st = String(b?.status || '').toUpperCase();
    if (st === 'CANCELLED' || st === 'CANCELADO') return { label: 'Cancelado', cls: 'bg-rose-50 text-rose-700 border-rose-200' };
    if (st === 'COMPLETED' || st === 'FINALIZADO') return { label: 'Finalizado', cls: 'bg-stone-100 text-stone-700 border-stone-300' };
    if ((st === 'PENDING_DEPOSIT' || st === 'PENDIENTE') && Number(b?.depositAmount) > 0 && !b?.depositPaid) return { label: 'Pendiente de seña', cls: 'bg-amber-50 text-amber-800 border-amber-200' };
    return { label: 'Confirmado', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  }

  function openCancelReasonModal({ booking, vocab, onConfirmCancel } = {}) {
    document.getElementById(CANCEL_MODAL_ID)?.remove();
    const v = vocab || { singular: 'turno' }, code = cleanTok(booking?.token || booking?.id || '0000');
    const ov = document.createElement('div');
    ov.id = CANCEL_MODAL_ID;
    ov.className = 'fixed inset-0 z-[96] bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-4';
    ov.innerHTML = `<div class="w-full max-w-sm rounded-3xl bg-white border border-stone-200 p-5 shadow-2xl space-y-4 text-stone-900">
      <div class="flex items-start justify-between gap-2">
        <div><h2 class="text-base font-semibold text-stone-900">¿Por qué cancelás tu ${esc(v.singular)}?</h2><p class="text-xs text-stone-500 mt-0.5 tabular-nums">#${esc(code)} · Tocá un motivo para liberar el horario.</p></div>
        <button type="button" id="btn-close-cancel-modal" aria-label="Cerrar" class="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 flex items-center justify-center shrink-0 cursor-pointer">${SVG_X}</button>
      </div>
      <div class="space-y-2">${REASONS.map((r, i) => `<button type="button" data-cancel-reason="${esc(r)}" id="btn-cancel-reason-${i}" class="w-full py-3 px-3.5 rounded-xl bg-[#FAF8F5] hover:bg-rose-50 border border-stone-200 hover:border-rose-200 text-left text-xs font-semibold text-stone-800 hover:text-rose-800 transition-colors cursor-pointer">${esc(r)}</button>`).join('')}</div>
      <button type="button" id="btn-keep-booking" class="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-semibold text-stone-700 cursor-pointer">Volver, mantener mi ${esc(v.singular)}</button>
    </div>`;

    document.body.appendChild(ov);
    const close = () => ov.remove();
    ov.addEventListener('click', (e) => { if (e.target === ov) close(); });
    ov.querySelector('#btn-close-cancel-modal').onclick = close;
    ov.querySelector('#btn-keep-booking').onclick = close;
    ov.querySelectorAll('[data-cancel-reason]').forEach(btn => btn.addEventListener('click', () => {
      const reason = btn.getAttribute('data-cancel-reason') || 'Otro motivo'; close();
      if (typeof onConfirmCancel === 'function') onConfirmCancel(reason);
    }));
  }

  function openHistoryModal({ bookings = [], vocab, fmt = (n) => `$${n}`, onSelectBooking } = {}) {
    document.getElementById(HISTORY_MODAL_ID)?.remove();
    const v = vocab || { plural: 'turnos', historyLabel: 'Mis turnos' };
    const ov = document.createElement('div');
    ov.id = HISTORY_MODAL_ID;
    ov.className = 'fixed inset-0 z-[95] bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-4';
    const itemsHtml = bookings.length
      ? bookings.map(b => {
        const tok = cleanTok(b.token || b.id), st = statusMeta(b), dStr = b.dateStr || b.date || b.day || '', srv = b.serviceName || b.service || 'Servicio';
        return `<button type="button" data-hist-code="${esc(tok)}" class="w-full p-3.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#F4F0E8] border border-stone-200 text-left transition-colors cursor-pointer space-y-1.5">
          <div class="flex items-center justify-between gap-2"><span class="text-xs font-bold text-stone-900 tabular-nums">#${esc(tok)}</span><span class="px-2 py-0.5 rounded-full text-[10px] font-bold border ${st.cls}">${st.label}</span></div>
          <p class="text-xs font-semibold text-stone-900 truncate">${esc(srv)}</p>
          <div class="flex items-center justify-between gap-2 text-[11px] text-stone-600 tabular-nums"><span class="inline-flex items-center gap-1">${SVG_CAL}<span>${esc(dStr)} · ${esc(b.time || '')} hs</span></span><span class="font-semibold text-stone-800">${fmt(b.price || 0)}</span></div>
        </button>`;
      }).join('')
      : `<div class="p-4 text-center text-xs text-stone-500 bg-[#FAF8F5] rounded-2xl border border-stone-200">Todavía no tenés ${esc(v.plural)} registrados en este comercio.</div>`;

    ov.innerHTML = `<div class="w-full max-w-sm rounded-3xl bg-white border border-stone-200 p-5 shadow-2xl space-y-4 text-stone-900 max-h-[85vh] flex flex-col">
      <div class="flex items-start justify-between gap-2 shrink-0">
        <div><h2 class="text-base font-semibold text-stone-900">${esc(v.historyLabel)}</h2><p class="text-xs text-stone-500 mt-0.5">Historial de ${esc(v.plural)} asociados a tu celular.</p></div>
        <button type="button" id="btn-close-history-modal" aria-label="Cerrar" class="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 flex items-center justify-center shrink-0 cursor-pointer">${SVG_X}</button>
      </div>
      <div id="history-bookings-list" class="space-y-2 overflow-y-auto pr-0.5">${itemsHtml}</div>
    </div>`;

    document.body.appendChild(ov);
    const close = () => ov.remove();
    ov.addEventListener('click', (e) => { if (e.target === ov) close(); });
    ov.querySelector('#btn-close-history-modal').onclick = close;
    ov.querySelectorAll('[data-hist-code]').forEach(btn => btn.addEventListener('click', () => {
      const code = btn.getAttribute('data-hist-code'), hit = bookings.find(b => cleanTok(b.token || b.id) === code); close();
      if (hit && typeof onSelectBooking === 'function') onSelectBooking(hit);
    }));
  }

  return { REASONS, openCancelReasonModal, openHistoryModal };
})();