// Archivo: public/js/admin_l1/delivery_l1.js
// Submódulo Táctico Mobile L1: Gestión Rápida de Citas y Mostrador (< 180 líneas)
(function (global) {
  function getBookings() {
    try { return JSON.parse(localStorage.getItem('tucu_l1_bookings')) || []; } catch (e) { return []; }
  }

  function saveBookings(bks) {
    try { localStorage.setItem('tucu_l1_bookings', JSON.stringify(bks)); } catch (e) {}
    renderUI();
  }

  function advanceStatus(id, nextStatus) {
    const bookings = getBookings();
    const bk = bookings.find(b => b.id === id);
    if (bk) {
      bk.status = nextStatus;
      if (nextStatus === 'completado') {
        bk.completedAt = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) + ' hs';
      }
      saveBookings(bookings);
      const phone = bk.clientPhone ? bk.clientPhone.replace(/\D/g, '') : null;
      if (phone && nextStatus === 'completado') {
        const bizName = localStorage.getItem('tucu_l1_biz_name') || 'Comercio L1';
        fetch('/api/wa/send-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, message: `✅ ¡Hola ${bk.clientName}! Tu cita en ${bizName} fue completada exitosamente.` })
        }).catch(() => {});
      }
    }
  }

  function renderUI() {
    const bookings = getBookings();
    const container = document.getElementById('tacticalBookingsList');
    const countEl = document.getElementById('activeCountBadge');
    const totalEl = document.getElementById('totalTodayBadge');

    const active = bookings.filter(b => b.status !== 'completado');
    if (countEl) countEl.textContent = `${active.length} pendientes`;
    if (totalEl) totalEl.textContent = `${bookings.length} totales`;

    if (!container) return;

    if (bookings.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center bg-zinc-900/50 border border-zinc-800 rounded-3xl space-y-2">
          <p class="text-sm text-zinc-400">Sin citas ni turnos registrados en este dispositivo.</p>
        </div>`;
      return;
    }

    container.innerHTML = bookings.map(bk => {
      const isDone = bk.status === 'completado';
      const isProg = bk.status === 'en_atencion';
      const phoneClean = (bk.clientPhone || '').replace(/\D/g, '');
      const badgeClass = isDone ? 'bg-zinc-800 text-zinc-400 border-zinc-700' : (isProg ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30');
      const badgeText = isDone ? '✓ Completado' : (isProg ? '👤 En Atención' : '🟡 Pendiente');

      return `
        <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-3 transition-all ${isDone ? 'opacity-50 bg-zinc-950/60' : ''}">
          <div class="flex items-start justify-between gap-2 border-b border-zinc-800 pb-2.5">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-black text-white text-base">${bk.clientName || 'Cliente'}</h3>
                <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${badgeClass}">${badgeText}</span>
              </div>
              <p class="text-xs text-zinc-400 font-mono mt-0.5">📞 +${phoneClean}</p>
            </div>
            <div class="text-right">
              <span class="text-base font-black text-amber-400 font-mono block">${bk.time || '--:--'}</span>
              <span class="text-[10px] text-zinc-400">${bk.day || 'Hoy'}</span>
            </div>
          </div>

          <div class="flex items-center gap-2 pt-1">
            <a href="tel:${phoneClean}" class="flex-1 py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold text-center border border-zinc-700 transition-all flex items-center justify-center gap-1.5 active:scale-95">
              <span>📞 Llamar</span>
            </a>
            <a href="https://wa.me/${phoneClean}" target="_blank" class="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-bold text-center border border-emerald-500/30 transition-all flex items-center justify-center gap-1.5 active:scale-95">
              <span>💬 WhatsApp</span>
            </a>
            ${!isDone ? `
              <button onclick="deliveryL1.advanceStatus('${bk.id}', 'completado')" class="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold text-center border border-blue-500/40 shadow transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer">
                <span>✔ Atendido</span>
              </button>` : `
              <span class="text-[10px] text-zinc-500 font-bold px-2 py-1">Finalizado</span>`}
          </div>
        </div>`;
    }).join('');
  }

  function init() {
    renderUI();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else setTimeout(init, 50);
  }

  global.deliveryL1 = { advanceStatus, renderUI };
})(typeof window !== 'undefined' ? window : global);
