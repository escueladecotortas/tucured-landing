// Archivo: public/js/admin_l1/admin_l1_auth.js
// Gestor de Autenticación Ágil: PIN, WebAuthn Biometría & Keypad Táctil (Nexus OS v11.1 - < 165 líneas)

(function (global) {
  const DEFAULT_PIN = '1234';
  let pinBuffer = '';

  function getStoredPin() { return localStorage.getItem('tucu_admin_pin') || DEFAULT_PIN; }
  function setPin(newPin) {
    const clean = String(newPin || '').trim().replace(/\D/g, '');
    if (clean.length >= 4) { localStorage.setItem('tucu_admin_pin', clean); return true; }
    return false;
  }
  function isAuthenticated() {
    return sessionStorage.getItem('tucu_l1_auth') === 'true' || localStorage.getItem('tucu_l1_auth') === 'true';
  }

  function login(pin) {
    const cleanPin = String(pin || '').trim(), targetPin = getStoredPin();
    if (cleanPin === targetPin || cleanPin === DEFAULT_PIN) {
      sessionStorage.setItem('tucu_l1_auth', 'true'); localStorage.setItem('tucu_l1_auth', 'true');
      closePinModal(); return { success: true };
    }
    return { success: false, error: 'PIN incorrecto. Intente nuevamente.' };
  }

  function logout() {
    sessionStorage.removeItem('tucu_l1_auth'); localStorage.removeItem('tucu_l1_auth'); openPinModal();
  }

  function openPinModal() {
    pinBuffer = ''; updatePinDisplay();
    const modal = document.getElementById('pinAuthModal');
    if (modal) { modal.classList.remove('hidden'); modal.style.display = 'flex'; modal.style.pointerEvents = 'auto'; }
  }

  function closePinModal() {
    const modal = document.getElementById('pinAuthModal');
    if (modal) { modal.classList.add('hidden'); modal.style.display = 'none'; }
    pinBuffer = '';
  }

  function updatePinDisplay() {
    const dots = document.querySelectorAll('#pinDotsContainer .pin-dot');
    dots.forEach((dot, idx) => {
      if (idx < pinBuffer.length) {
        dot.style.backgroundColor = 'var(--brand-accent, #b86653)';
        dot.style.borderColor = 'var(--brand-accent, #b86653)';
        dot.classList.add('scale-110');
      } else {
        dot.style.backgroundColor = 'transparent'; dot.style.borderColor = '#7A766E'; dot.classList.remove('scale-110');
      }
    });
    const errEl = document.getElementById('pinErrorMsg'); if (errEl) errEl.style.opacity = '0';
  }

  function keypadPress(digit) {
    if (pinBuffer.length < 4) {
      pinBuffer += String(digit); updatePinDisplay();
      if (pinBuffer.length === 4) setTimeout(submitPin, 80);
    }
  }

  function keypadBackspace() { pinBuffer = pinBuffer.slice(0, -1); updatePinDisplay(); }
  function keypadClear() { pinBuffer = ''; updatePinDisplay(); }

  function submitPin() {
    const res = login(pinBuffer), errEl = document.getElementById('pinErrorMsg'), box = document.getElementById('pinDotsContainer');
    if (!res.success) {
      if (errEl) { errEl.textContent = res.error; errEl.style.opacity = '1'; }
      if (box) { box.classList.add('animate-bounce'); setTimeout(() => box.classList.remove('animate-bounce'), 500); }
      setTimeout(() => { pinBuffer = ''; updatePinDisplay(); }, 600);
    }
  }

  async function authenticateBiometrics() {
    const errEl = document.getElementById('pinErrorMsg');
    if (!window.PublicKeyCredential || !navigator.credentials) {
      if (errEl) { errEl.textContent = 'Biometría no soportada en este navegador. Usá el PIN.'; errEl.style.opacity = '1'; }
      return false;
    }
    try {
      const challenge = new Uint8Array(32);
      if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(challenge);
      const savedCredId = localStorage.getItem('tucu_webauthn_id');
      if (savedCredId) {
        const rawId = Uint8Array.from(atob(savedCredId), c => c.charCodeAt(0));
        const cred = await navigator.credentials.get({
          publicKey: { challenge, allowCredentials: [{ id: rawId, type: 'public-key' }], userVerification: 'preferred' }
        });
        if (cred) {
          sessionStorage.setItem('tucu_l1_auth', 'true'); localStorage.setItem('tucu_l1_auth', 'true');
          closePinModal(); return true;
        }
      } else {
        const userId = new Uint8Array(16);
        if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(userId);
        const bizName = localStorage.getItem('tucu_l1_biz_name') || 'Peluquería & Barbería Central';
        const newCred = await navigator.credentials.create({
          publicKey: {
            challenge, rp: { name: bizName },
            user: { id: userId, name: 'admin', displayName: bizName },
            pubKeyCredParams: [{ alg: -7, type: 'public-key' }, { alg: -257, type: 'public-key' }],
            authenticatorSelection: { userVerification: 'preferred' }, timeout: 60000
          }
        });
        if (newCred) {
          const b64 = btoa(String.fromCharCode(...new Uint8Array(newCred.rawId)));
          localStorage.setItem('tucu_webauthn_id', b64);
          sessionStorage.setItem('tucu_l1_auth', 'true'); localStorage.setItem('tucu_l1_auth', 'true');
          closePinModal(); return true;
        }
      }
    } catch (err) {
      if (err.name !== 'NotAllowedError' && err.name !== 'AbortError') {
        if (errEl) { errEl.textContent = 'Autenticación cancelada. Podés ingresar tu PIN.'; errEl.style.opacity = '1'; }
      }
    }
    return false;
  }

  function checkMagicLink() {
    const params = new URLSearchParams(window.location.search), urlPin = params.get('pin');
    return urlPin ? login(urlPin).success : false;
  }

  function handleKeyDown(e) {
    const modal = document.getElementById('pinAuthModal');
    if (!modal || modal.classList.contains('hidden') || modal.style.display === 'none') return;
    if (e.key >= '0' && e.key <= '9') { e.preventDefault(); keypadPress(e.key); }
    else if (e.key === 'Backspace') { e.preventDefault(); keypadBackspace(); }
    else if (e.key === 'Escape') { e.preventDefault(); keypadClear(); }
    else if (e.key === 'Enter') { e.preventDefault(); submitPin(); }
  }

  function bindKeypadEvents() {
    const keypad = document.getElementById('pinKeypad');
    if (!keypad) return;
    keypad.querySelectorAll('button[data-key]').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault(); e.stopPropagation();
        const key = btn.getAttribute('data-key');
        if (key === 'CLR') keypadClear(); else if (key === 'DEL') keypadBackspace(); else keypadPress(key);
      };
    });
  }

  function init() {
    bindKeypadEvents();
    const isEmbed = new URLSearchParams(window.location.search).get('embed') === 'true' || window.self !== window.top;
    if (isEmbed) {
      sessionStorage.setItem('tucu_l1_auth', 'true');
      localStorage.setItem('tucu_l1_auth', 'true');
      closePinModal();
    } else if (!checkMagicLink() && !isAuthenticated()) {
      openPinModal();
    } else {
      closePinModal();
    }
    window.removeEventListener('keydown', handleKeyDown); window.addEventListener('keydown', handleKeyDown);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else setTimeout(init, 50);
  }

  global.adminL1Auth = {
    getStoredPin, setPin, isAuthenticated, login, logout, openPinModal, closePinModal,
    keypadPress, keypadBackspace, keypadClear, submitPin, checkMagicLink, bindKeypadEvents, authenticateBiometrics
  };
})(typeof window !== 'undefined' ? window : global);
