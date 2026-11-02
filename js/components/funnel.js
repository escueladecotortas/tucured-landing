// Archivo: js/components/funnel.js
/**
 * 🧙 Tucu Red Web V2 - Wizard Empático de 3 Pantallas (Kiro Local-First Controller)
 * Asistente visual Kiro, persistencia silenciosa en local_db y cero recarga.
 * Restricción estricta: < 200 líneas.
 */

import { getFunnelMarkup, FUNNEL_RUBROS, FUNNEL_LEVELS } from './funnel_markup.js';

function sanitizeArgentinePhone(raw) {
  let d = String(raw || '').replace(/\D/g, '');
  if (d.startsWith('549')) d = d.slice(3);
  else if (d.startsWith('54')) d = d.slice(2);
  if (d.startsWith('0')) d = d.slice(1);
  if (d.length > 10) {
    if (d.slice(3, 5) === '15') d = d.slice(0, 3) + d.slice(5);
    else if (d.slice(2, 4) === '15') d = d.slice(0, 2) + d.slice(4);
  }
  return d.slice(0, 10);
}

export function renderFunnel(containerId = 'app-funnel') {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (window._funnelAbort) window._funnelAbort.abort();
  const abortCtrl = new AbortController();
  window._funnelAbort = abortCtrl;
  const { signal } = abortCtrl;

  const draft = JSON.parse(sessionStorage.getItem('tucured_funnel_draft') || '{}');
  let currentStep = draft.step || 1;
  let selectedRubro = draft.rubro || 'estetica';
  let selectedLevel = draft.level || 'l2';
  let selectedSchedule = draft.schedule || 'corrido';

  container.innerHTML = getFunnelMarkup(draft, selectedRubro, selectedLevel, selectedSchedule);

  const [phoneInput, nombreInput, ciudadInput, ctaBtn] = ['fn-phone', 'fn-nombre', 'fn-ciudad', 'funnel-submit-btn'].map(id => document.getElementById(id));
  const [s1, s2, s3] = ['funnel-step-1', 'funnel-step-2', 'funnel-step-3'].map(id => document.getElementById(id));
  const [b1, b2, b3] = ['step-badge-1', 'step-badge-2', 'step-badge-3'].map(id => document.getElementById(id));

  const persistLocalDB = (isFinal = false) => {
    const payload = {
      nombre: nombreInput?.value.trim() || '',
      ciudad: ciudadInput?.value.trim() || '',
      rubro: selectedRubro,
      level: selectedLevel,
      horario: selectedSchedule,
      whatsapp: sanitizeArgentinePhone(phoneInput?.value),
      step: currentStep,
      isFinal,
      updatedAt: new Date().toISOString()
    };
    sessionStorage.setItem('tucured_funnel_draft', JSON.stringify(payload));
    try {
      localStorage.setItem('local_db_wizard', JSON.stringify(payload));
      if (isFinal) {
        const leads = JSON.parse(localStorage.getItem('local_db_leads') || '[]');
        leads.push(payload);
        localStorage.setItem('local_db_leads', JSON.stringify(leads));
      }
    } catch (_) { /* Local-First Fallback */ }
    return payload;
  };

  const setBadge = (b, num, isCompleted, isActive) => {
    if (!b) return;
    b.textContent = isCompleted ? '✓' : String(num);
    b.className = `w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${isCompleted ? 'funnel-step-completed' : (isActive ? 'funnel-step-active' : 'bg-slate-200 text-slate-600')}`;
  };

  const updateUI = () => {
    document.getElementById('funnel-input-rubro').value = selectedRubro;
    document.getElementById('funnel-input-level').value = selectedLevel;
    document.getElementById('funnel-input-schedule').value = selectedSchedule;

    s1?.classList.toggle('hidden', currentStep !== 1);
    s2?.classList.toggle('hidden', currentStep !== 2);
    s3?.classList.toggle('hidden', currentStep !== 3);

    container.querySelectorAll('[data-f-rubro]').forEach(el => el.classList.toggle('funnel-option-active', el.getAttribute('data-f-rubro') === selectedRubro));
    container.querySelectorAll('[data-f-level]').forEach(el => el.classList.toggle('funnel-option-active', el.getAttribute('data-f-level') === selectedLevel));
    container.querySelectorAll('[data-f-schedule]').forEach(el => el.classList.toggle('funnel-option-active', el.getAttribute('data-f-schedule') === selectedSchedule));

    setBadge(b1, 1, currentStep > 1, currentStep === 1);
    setBadge(b2, 2, currentStep > 2, currentStep === 2);
    setBadge(b3, 3, false, currentStep === 3);

    if (ctaBtn) {
      const lBadge = FUNNEL_LEVELS.find(l => l.id === selectedLevel)?.badge || 'Nivel 2';
      ctaBtn.innerHTML = `<span>Activar ${lBadge} por $1.000 (Mes 1)</span><span class="material-symbols-outlined text-xl">arrow_forward</span>`;
    }
    persistLocalDB(false);
  };

  document.getElementById('btn-goto-step-2')?.addEventListener('click', () => {
    if (!nombreInput?.value.trim()) { nombreInput?.focus(); return; }
    if (!ciudadInput?.value.trim()) { ciudadInput?.focus(); return; }
    currentStep = 2; updateUI(); container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, { signal });

  document.getElementById('btn-goto-step-3')?.addEventListener('click', () => {
    currentStep = 3; updateUI(); phoneInput?.focus(); container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, { signal });

  document.getElementById('btn-back-to-1')?.addEventListener('click', () => { currentStep = 1; updateUI(); }, { signal });
  document.getElementById('btn-back-to-2')?.addEventListener('click', () => { currentStep = 2; updateUI(); }, { signal });

  phoneInput?.addEventListener('input', (e) => {
    const clean = sanitizeArgentinePhone(e.target.value);
    e.target.value = clean;
    const hint = document.getElementById('phone-valid-hint');
    if (hint) hint.className = `absolute right-3.5 top-3.5 text-xs font-mono ${clean.length === 10 ? 'text-emerald-600 font-bold' : 'text-slate-400'}`;
    persistLocalDB(false);
  }, { signal });

  [nombreInput, ciudadInput].forEach(inp => inp?.addEventListener('input', () => persistLocalDB(false), { signal }));
  container.querySelectorAll('[data-f-rubro]').forEach(btn => btn.addEventListener('click', () => { selectedRubro = btn.getAttribute('data-f-rubro'); updateUI(); }, { signal }));
  container.querySelectorAll('[data-f-level]').forEach(btn => btn.addEventListener('click', () => { selectedLevel = btn.getAttribute('data-f-level'); updateUI(); }, { signal }));
  container.querySelectorAll('[data-f-schedule]').forEach(btn => btn.addEventListener('click', () => { selectedSchedule = btn.getAttribute('data-f-schedule'); updateUI(); }, { signal }));

  window.addEventListener('tucured:rubro-selected', (e) => { if (e.detail?.rubro) { selectedRubro = e.detail.rubro === 'gastronomia' ? 'resto' : e.detail.rubro; updateUI(); } }, { signal });
  window.addEventListener('tucured:level-selected', (e) => {
    if (e.detail?.level) {
      const raw = String(e.detail.level).toLowerCase();
      selectedLevel = raw.startsWith('l') ? raw : `l${raw}`;
      updateUI();
    }
  }, { signal });

  const form = document.getElementById('tucured-funnel-form');
  const successCard = document.getElementById('funnel-success-card');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = persistLocalDB(true);
    try {
      await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(form)).toString() });
    } catch (_) { /* Local-First Fallback */ }
    sessionStorage.removeItem('tucured_funnel_draft');
    setBadge(b3, 3, true, false);
    form.classList.add('hidden');
    if (successCard) {
      successCard.classList.remove('hidden');
      const rName = FUNNEL_RUBROS.find(r => r.id === selectedRubro)?.label || selectedRubro;
      successCard.innerHTML = `
        <div class="space-y-4 max-w-lg mx-auto py-4">
          <img src="/assets/images/kiro/kiro_exito.webp" alt="Kiro Éxito" class="w-24 h-24 sm:w-28 sm:h-28 mx-auto object-contain drop-shadow-xl animate-bounce" />
          <h4 class="font-headline font-extrabold text-2xl sm:text-3xl text-emerald-950">¡Felicitaciones! El sistema para ${payload.nombre} está en marcha.</h4>
          <p class="text-sm text-emerald-800 leading-relaxed">Registramos tus preferencias para ${rName} en ${payload.ciudad}. En breve nos contactaremos para entregarte tu acceso y cartel de mostrador.</p>
          <div class="pt-2">
            <span class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">✓ Guardado en base local (Local-First)</span>
          </div>
        </div>
      `;
    }
  }, { signal });

  updateUI();
}
