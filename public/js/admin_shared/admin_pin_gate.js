// Archivo: public/js/admin_shared/admin_pin_gate.js
// Compuerta Universal PIN 4 Dígitos (L1/L2/L3 + Showroom Embed) (Nexus OS v11.1 < 150 líneas)

(function (global) {
  const AUTH_KEY = 'tucu_admin_auth';
  const LEGACY_KEY = 'tucu_l1_auth';
  const MODAL_ID = 'pinAuthModal';
  const SVG_LOCK = '<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>';
  const SVG_DEL = '<svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414-6.414A2 2 0 0110.828 5H19a2 2 0 012 2v10a2 2 0 01-2 2h-8.172a2 2 0 01-1.414-.586L3 12z"/></svg>';

  let pinBuffer = '';
  let keyListenerBound = false;

  function isAuthenticated() {
    try { return sessionStorage.getItem(AUTH_KEY) === '1' || sessionStorage.getItem(LEGACY_KEY) === '1'; }
    catch (_) { return false; }
  }

  function setAuthenticated(flag) {
    try {
      if (flag) {
        sessionStorage.setItem(AUTH_KEY, '1');
        sessionStorage.setItem(LEGACY_KEY, '1');
      } else {
        sessionStorage.removeItem(AUTH_KEY);
        sessionStorage.removeItem(LEGACY_KEY);
      }
    } catch (_) {}
  }

  function updateDots() {
    for (let i = 0; i < 4; i++) {
      const dot = document.getElementById(`pin-dot-${i}`);
      if (!dot) continue;
      const filled = i < pinBuffer.length;
      dot.className = filled
        ? 'w-3.5 h-3.5 rounded-full bg-[#800000] dark:bg-red-500 border-2 border-[#800000] dark:border-red-400 scale-110 transition-all shadow-sm'
        : 'w-3.5 h-3.5 rounded-full border-2 border-stone-300 dark:border-stone-600 bg-transparent transition-all';
    }
  }

  function buildKeypadHtml() {
    const numBtn = (n) => `<button type="button" data-pin-digit="${n}" onclick="window.AdminPinGate.press('${n}')" class="pin-key-btn h-12 rounded-2xl bg-white dark:bg-[#1C1A19] border border-[#D5CEC2] dark:border-stone-700 text-stone-900 dark:text-stone-100 font-bold text-base hover:bg-stone-100 dark:hover:bg-stone-800 active:scale-95 transition-all shadow-xs cursor-pointer">${n}</button>`;
    return `
      <div class="w-full max-w-[300px] rounded-3xl bg-[#FBFBF9] dark:bg-[#121110] border border-[#D5CEC2] dark:border-stone-800 p-6 shadow-2xl space-y-5 text-center">
        <div class="space-y-1.5">
          <div class="w-12 h-12 mx-auto rounded-2xl bg-[#800000]/10 dark:bg-red-950/60 text-[#800000] dark:text-red-300 border border-[#800000]/20 dark:border-red-800 flex items-center justify-center">${SVG_LOCK}</div>
          <h2 class="font-title text-base font-extrabold text-stone-900 dark:text-stone-100">Acceso Administrativo</h2>
          <p class="text-[11px] text-stone-500 dark:text-stone-400 leading-snug">Ingresá cualquier PIN de 4 dígitos para desbloquear</p>
        </div>
        <div class="flex items-center justify-center gap-3.5 py-1" aria-label="Indicador de PIN">
          <span id="pin-dot-0" class="w-3.5 h-3.5 rounded-full border-2 border-stone-300 dark:border-stone-600"></span>
          <span id="pin-dot-1" class="w-3.5 h-3.5 rounded-full border-2 border-stone-300 dark:border-stone-600"></span>
          <span id="pin-dot-2" class="w-3.5 h-3.5 rounded-full border-2 border-stone-300 dark:border-stone-600"></span>
          <span id="pin-dot-3" class="w-3.5 h-3.5 rounded-full border-2 border-stone-300 dark:border-stone-600"></span>
        </div>
        <div class="grid grid-cols-3 gap-2.5">
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(numBtn).join('')}
          <button type="button" onclick="window.AdminPinGate.clear()" class="h-12 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-800 text-stone-600 dark:text-stone-400 font-bold text-xs hover:text-stone-900 dark:hover:text-white active:scale-95 transition-all cursor-pointer">Limpiar</button>
          ${numBtn(0)}
          <button type="button" onclick="window.AdminPinGate.del()" aria-label="Borrar último dígito" class="h-12 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white active:scale-95 transition-all cursor-pointer">${SVG_DEL}</button>
        </div>
        <p class="text-[10px] font-medium text-stone-400 dark:text-stone-500">Entorno demo: cualquier clave de 4 dígitos habilita la sesión</p>
      </div>`;
  }

  function ensureModal() {
    let modal = document.getElementById(MODAL_ID);
    if (!modal) {
      modal = document.createElement('div');
      modal.id = MODAL_ID;
      document.body.appendChild(modal);
    }
    modal.className = 'fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 transition-opacity duration-200';
    modal.innerHTML = buildKeypadHtml();
    return modal;
  }

  function openModal() {
    pinBuffer = '';
    const modal = ensureModal();
    modal.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
    document.body.style.overflow = 'hidden';
    updateDots();
  }

  function closeModal() {
    const modal = document.getElementById(MODAL_ID);
    if (!modal) return;
    modal.classList.add('opacity-0', 'pointer-events-none');
    document.body.style.overflow = '';
    setTimeout(() => { modal.classList.add('hidden'); }, 150);
  }

  function press(digit) {
    if (pinBuffer.length >= 4) return;
    const clean = String(digit).replace(/\D/g, '').slice(0, 1);
    if (!clean) return;
    pinBuffer += clean;
    updateDots();
    if (/^\d{4}$/.test(pinBuffer)) {
      setAuthenticated(true);
      setTimeout(() => { pinBuffer = ''; closeModal(); }, 90);
    }
  }

  function del() {
    if (!pinBuffer.length) return;
    pinBuffer = pinBuffer.slice(0, -1);
    updateDots();
  }

  function clear() {
    pinBuffer = '';
    updateDots();
  }

  function logout() {
    setAuthenticated(false);
    global.AdminShell?.closeSidebar?.();
    openModal();
  }

  function bindKeys() {
    if (keyListenerBound) return;
    keyListenerBound = true;
    document.addEventListener('keydown', (e) => {
      const m = document.getElementById(MODAL_ID);
      if (!m || m.classList.contains('hidden')) return;
      if (/^[0-9]$/.test(e.key)) { e.preventDefault(); press(e.key); }
      else if (e.key === 'Backspace') { e.preventDefault(); del(); }
      else if (e.key === 'Escape') { e.preventDefault(); clear(); }
    });
  }

  function init() {
    bindKeys();
    if (isAuthenticated()) {
      const m = document.getElementById(MODAL_ID);
      if (m) m.classList.add('hidden');
      document.body.style.overflow = '';
    } else {
      openModal();
    }
  }

  global.AdminPinGate = { init, press, del, clear, logout, isAuthenticated, openModal, closeModal };
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }
})(typeof window !== 'undefined' ? window : global);

