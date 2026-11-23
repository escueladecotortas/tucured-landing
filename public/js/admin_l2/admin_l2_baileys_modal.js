// Archivo: public/js/admin_l2/admin_l2_baileys_modal.js
// Modal QR WhatsApp SVG Inline Offline & Gestión de Sesión L2 (< 80 líneas)

(function (global) {
  const QR_SVG = '<svg class="w-36 h-36 mx-auto" viewBox="0 0 120 120" fill="currentColor" aria-label="Código QR de WhatsApp"><rect width="120" height="120" fill="white"/><path d="M10,10 h35 v35 h-35 z M15,15 v25 h25 v-25 z M20,20 h15 v15 h-15 z M75,10 h35 v35 h-35 z M80,15 v25 h25 v-25 z M85,20 h15 v15 h-15 z M10,75 h35 v35 h-35 z M15,80 v25 h25 v-25 z M20,85 h15 v15 h-15 z M50,15 h5 v10 h-5 z M60,10 h5 v5 h-5 z M50,30 h10 v5 h-10 z M65,25 h5 v15 h-5 z M10,50 h10 v5 h-10 z M25,50 h15 v5 h-15 z M50,50 h20 v5 h-20 z M80,50 h10 v5 h-10 z M100,50 h10 v10 h-10 z M50,60 h5 v15 h-5 z M60,65 h15 v5 h-15 z M80,60 h5 v10 h-5 z M95,65 h15 v5 h-15 z M50,80 h10 v10 h-10 z M65,80 h10 v5 h-10 z M80,75 h20 v5 h-20 z M105,80 h5 v25 h-5 z M50,95 h5 v15 h-5 z M60,100 h15 v5 h-15 z M80,95 h15 v15 h-15 z" fill="#0f172a"/></svg>';

  function showQrStep(step) {
    [1, 2, 3].forEach(s => document.getElementById('qr-wizard-step-' + s)?.classList.toggle('hidden', s !== step));
    const slot = document.getElementById('l2-qr-svg-container');
    if (step === 2 && slot && !slot.dataset.rendered) { slot.innerHTML = QR_SVG; slot.dataset.rendered = '1'; }
  }

  function openQrWizard(initialStep = 1) {
    const m = document.getElementById('wa-qr-wizard-modal');
    if (m) { m.classList.remove('hidden'); m.classList.add('flex'); showQrStep(initialStep); }
  }

  function closeQrWizard() {
    const m = document.getElementById('wa-qr-wizard-modal');
    if (m) { m.classList.add('hidden'); m.classList.remove('flex'); }
  }

  function init() {
    const slot = document.getElementById('l2-qr-svg-container');
    if (slot) { slot.innerHTML = QR_SVG; slot.dataset.rendered = '1'; }
    document.getElementById('btn-open-qr-modal')?.addEventListener('click', () => openQrWizard(1));
    document.getElementById('btn-close-qr-wizard')?.addEventListener('click', closeQrWizard);
    document.getElementById('btn-wizard-go-qr')?.addEventListener('click', () => showQrStep(2));
    document.getElementById('btn-wizard-simulate-success')?.addEventListener('click', () => showQrStep(3));
    document.getElementById('btn-wizard-finish')?.addEventListener('click', () => {
      closeQrWizard();
      const b = document.getElementById('wa-node-status-badge');
      if (b) { b.textContent = 'ONLINE'; b.className = 'px-2.5 py-1 rounded-full text-[10px] tabular-nums font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'; }
      global.adminL2Core?.showToast('Sesión de WhatsApp vinculada correctamente');
    });

    const mLogout = document.getElementById('wa-logout-modal');
    document.getElementById('btn-open-logout-modal')?.addEventListener('click', () => { mLogout?.classList.remove('hidden'); mLogout?.classList.add('flex'); });
    document.getElementById('btn-cancel-logout')?.addEventListener('click', () => { mLogout?.classList.add('hidden'); mLogout?.classList.remove('flex'); });
    document.getElementById('btn-confirm-logout')?.addEventListener('click', () => {
      mLogout?.classList.add('hidden'); mLogout?.classList.remove('flex');
      const b = document.getElementById('wa-node-status-badge');
      if (b) { b.textContent = 'OFFLINE'; b.className = 'px-2.5 py-1 rounded-full text-[10px] tabular-nums font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'; }
      global.adminL2Core?.showToast('Sesión desvinculada');
    });
  }

  global.adminL2BaileysModal = { QR_SVG, showQrStep, openQrWizard, openBaileysModalL2: () => openQrWizard(2), closeQrWizard, init };
})(typeof window !== 'undefined' ? window : global);