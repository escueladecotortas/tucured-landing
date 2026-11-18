// Archivo: js/components/funnel.js
/**
 * 🧙 Tucu Red Web V2 - Wizard Transaccional de 4 Pasos (Local-First Controller)
 * Flujo de alta comercial, validaciones inline, alias tucured, MP y rutas reales de éxito.
 * Restricción estricta: < 200 líneas (< 180L).
 */

import { getFunnelMarkup, EXPANDED_RUBROS, FUNNEL_LEVELS } from './funnel_markup.js';
import { getLeadWhatsAppUrl } from '../utils/whatsapp_link.js';
import { TUCURED_CHECKOUT_CONFIG, sanitizeArgentinePhone } from './funnel_data.js';

const RUBRO_ALIASES = { barberia: 'peluqueria', resto: 'gastronomia' };
const normalizeFunnelRubro = (raw) => {
  const mapped = RUBRO_ALIASES[raw] || raw;
  return EXPANDED_RUBROS.some(r => r.id === mapped) ? mapped : 'estetica';
};

export function renderFunnel(containerId = 'app-funnel') {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (window._funnelAbort) window._funnelAbort.abort();
  const abortCtrl = new AbortController();
  window._funnelAbort = abortCtrl;
  const { signal } = abortCtrl;

  const draft = JSON.parse(sessionStorage.getItem('tucured_funnel_draft') || '{}');
  let currentStep = draft.step || 1, selectedRubro = normalizeFunnelRubro(draft.rubro);
  let selectedLevel = FUNNEL_LEVELS.some(l => l.id === draft.level) ? draft.level : 'l2';
  let selectedSchedule = draft.schedule || 'corrido', selectedCity = draft.ciudad || 'Yerba Buena';

  container.innerHTML = getFunnelMarkup(draft, selectedRubro, selectedLevel, selectedSchedule, selectedCity);

  const [phoneInp, nameInp, titularInp, emailInp, citySel, pdfChk] = ['fn-phone', 'fn-nombre', 'fn-titular', 'fn-email', 'fn-ciudad-select', 'fn-material-pdf'].map(id => document.getElementById(id));
  const [s1, s2, s3, s4] = ['funnel-step-1', 'funnel-step-2', 'funnel-step-3', 'funnel-step-4'].map(id => document.getElementById(id));
  const [b1, b2, b3, b4] = ['step-badge-1', 'step-badge-2', 'step-badge-3', 'step-badge-4'].map(id => document.getElementById(id));
  const [err1, err3] = ['funnel-step1-error', 'funnel-step3-error'].map(id => document.getElementById(id));
  const progressLabel = document.getElementById('step-progress-label'), progressBar = document.getElementById('step-progress-bar');

  const slugify = (t) => (t || 'comercio').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'comercio';
  const showErr = (el, msg) => { if (!el) return; el.textContent = msg; el.classList.toggle('hidden', !msg); };

  const persistLocalDB = (isFinal = false) => {
    const payload = {
      nombre: nameInp?.value.trim() || '', ciudad: selectedCity, rubro: selectedRubro,
      level: selectedLevel, horario: selectedSchedule, titular: titularInp?.value.trim() || '',
      email: emailInp?.value.trim() || '', whatsapp: sanitizeArgentinePhone(phoneInp?.value),
      materialPdf: pdfChk?.checked ?? true, step: currentStep, isFinal, slug: slugify(nameInp?.value), updatedAt: new Date().toISOString()
    };
    sessionStorage.setItem('tucured_funnel_draft', JSON.stringify(payload));
    try {
      localStorage.setItem('local_db_wizard', JSON.stringify(payload));
      if (isFinal) {
        const leads = JSON.parse(localStorage.getItem('local_db_leads') || '[]');
        leads.push(payload); localStorage.setItem('local_db_leads', JSON.stringify(leads));
      }
    } catch (_) {}
    return payload;
  };

  const setBadge = (b, num, isDone, isActive) => {
    if (!b) return;
    b.textContent = isDone ? '✓' : String(num);
    b.className = `w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${isDone ? 'funnel-step-completed' : (isActive ? 'funnel-step-active' : 'bg-slate-200 text-slate-600')}`;
  };

  const updateUI = () => {
    document.getElementById('funnel-input-rubro').value = selectedRubro;
    document.getElementById('funnel-input-level').value = selectedLevel;
    document.getElementById('funnel-input-schedule').value = selectedSchedule;
    document.getElementById('funnel-input-ciudad').value = selectedCity;
    [s1, s2, s3, s4].forEach((s, idx) => s?.classList.toggle('hidden', currentStep !== idx + 1));
    container.querySelectorAll('[data-f-rubro]').forEach(el => el.classList.toggle('funnel-option-active', el.getAttribute('data-f-rubro') === selectedRubro));
    container.querySelectorAll('[data-f-level]').forEach(el => el.classList.toggle('funnel-option-active', el.getAttribute('data-f-level') === selectedLevel));
    container.querySelectorAll('[data-f-schedule]').forEach(el => el.classList.toggle('funnel-option-active', el.getAttribute('data-f-schedule') === selectedSchedule));
    setBadge(b1, 1, currentStep > 1, currentStep === 1); setBadge(b2, 2, currentStep > 2, currentStep === 2);
    setBadge(b3, 3, currentStep > 3, currentStep === 3); setBadge(b4, 4, false, currentStep === 4);
    if (progressLabel) progressLabel.textContent = `Paso ${currentStep} de 4`;
    if (progressBar) progressBar.style.width = `${(currentStep / 4) * 100}%`;

    const lObj = FUNNEL_LEVELS.find(l => l.id === selectedLevel) || FUNNEL_LEVELS[1];
    const rObj = EXPANDED_RUBROS.find(r => r.id === selectedRubro);
    const planBadge = document.getElementById('funnel-preselected-plan-badge');
    if (planBadge) planBadge.querySelector('span:last-child').textContent = `Plan seleccionado: ${lObj.badge} (ajustable en Paso 2)`;
    const [sumLvl, sumName, sumCity, sumRubro] = ['checkout-summary-level', 'checkout-summary-name', 'checkout-summary-city', 'checkout-summary-rubro'].map(id => document.getElementById(id));
    if (sumLvl) sumLvl.textContent = lObj.badge;
    if (sumName) sumName.textContent = nameInp?.value.trim() || 'Tu Comercio';
    if (sumCity) sumCity.textContent = selectedCity;
    if (sumRubro) sumRubro.textContent = rObj ? rObj.label : 'Comercio';
    persistLocalDB(false);
  };

  document.getElementById('btn-goto-step-2')?.addEventListener('click', () => {
    if (!nameInp?.value.trim()) { showErr(err1, 'Por favor, ingresá el nombre de tu comercio para continuar.'); nameInp?.focus(); return; }
    if (!EXPANDED_RUBROS.some(r => r.id === selectedRubro)) { showErr(err1, 'Seleccioná un rubro comercial válido.'); return; }
    showErr(err1, ''); currentStep = 2; updateUI(); container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, { signal });

  document.getElementById('btn-goto-step-3')?.addEventListener('click', () => {
    currentStep = 3; updateUI(); titularInp?.focus(); container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, { signal });

  document.getElementById('btn-goto-step-4')?.addEventListener('click', () => {
    if (!titularInp?.value.trim()) { showErr(err3, 'Ingresá el nombre del titular o responsable.'); titularInp?.focus(); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInp?.value.trim() || '')) { showErr(err3, 'Ingresá un correo electrónico válido (ej: contacto@tulocal.com).'); emailInp?.focus(); return; }
    if (sanitizeArgentinePhone(phoneInp?.value).length < 10) { showErr(err3, 'Ingresá un número de WhatsApp válido de 10 dígitos (ej: 3815554321).'); phoneInp?.focus(); return; }
    showErr(err3, ''); currentStep = 4; updateUI(); container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, { signal });

  ['btn-back-to-1', 'btn-back-to-2', 'btn-back-to-3'].forEach((id, i) =>
    document.getElementById(id)?.addEventListener('click', () => { showErr(err1, ''); showErr(err3, ''); currentStep = i + 1; updateUI(); }, { signal })
  );

  citySel?.addEventListener('change', (e) => { selectedCity = e.target.value; updateUI(); }, { signal });
  phoneInp?.addEventListener('input', (e) => {
    const clean = sanitizeArgentinePhone(e.target.value); e.target.value = clean; showErr(err3, '');
    const hint = document.getElementById('phone-valid-hint');
    if (hint) hint.className = `absolute right-3.5 top-3.5 text-xs font-mono ${clean.length === 10 ? 'text-emerald-600 font-bold' : 'text-slate-400'}`;
    persistLocalDB(false);
  }, { signal });

  document.getElementById('btn-copy-alias')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(TUCURED_CHECKOUT_CONFIG.aliasCbu);
      const icon = document.getElementById('copy-alias-icon'), text = document.getElementById('copy-alias-text');
      if (icon) icon.textContent = 'check'; if (text) text.textContent = '¡Alias Copiado!';
      setTimeout(() => { if (icon) icon.textContent = 'content_copy'; if (text) text.textContent = 'Copiar Alias'; }, 2200);
    } catch (_) {}
  }, { signal });

  nameInp?.addEventListener('input', () => { showErr(err1, ''); persistLocalDB(false); }, { signal });
  [titularInp, emailInp].forEach(inp => inp?.addEventListener('input', () => { showErr(err3, ''); persistLocalDB(false); }, { signal }));
  pdfChk?.addEventListener('change', () => persistLocalDB(false), { signal });
  container.querySelectorAll('[data-f-rubro]').forEach(b => b.addEventListener('click', () => { selectedRubro = normalizeFunnelRubro(b.getAttribute('data-f-rubro')); showErr(err1, ''); updateUI(); }, { signal }));
  container.querySelectorAll('[data-f-level]').forEach(b => b.addEventListener('click', () => { selectedLevel = b.getAttribute('data-f-level'); updateUI(); }, { signal }));
  container.querySelectorAll('[data-f-schedule]').forEach(b => b.addEventListener('click', () => { selectedSchedule = b.getAttribute('data-f-schedule'); updateUI(); }, { signal }));

  const form = document.getElementById('tucured-funnel-form'), successCard = document.getElementById('funnel-success-card');
  const restoreFromSuccessIfClosed = () => {
    if (form?.classList.contains('hidden')) { form.classList.remove('hidden'); successCard?.classList.add('hidden'); currentStep = 1; }
  };
  window.addEventListener('tucured:rubro-selected', (e) => { if (e.detail?.rubro) { restoreFromSuccessIfClosed(); selectedRubro = normalizeFunnelRubro(e.detail.rubro); updateUI(); } }, { signal });
  window.addEventListener('tucured:level-selected', (e) => {
    if (e.detail?.level) { restoreFromSuccessIfClosed(); const raw = String(e.detail.level).toLowerCase(); selectedLevel = raw.startsWith('l') ? raw : `l${raw}`; updateUI(); }
  }, { signal });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = persistLocalDB(true);
    try {
      if (!['localhost', '127.0.0.1'].includes(window.location.hostname)) {
        await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(form)).toString() });
      }
    } catch (_) {}
    sessionStorage.removeItem('tucured_funnel_draft');
    setBadge(b4, 4, true, false); form.classList.add('hidden');
    if (successCard) {
      successCard.classList.remove('hidden');
      const waUrl = getLeadWhatsAppUrl(payload), host = window.location.origin;
      const turneroLink = `${host}/turnero.html?level=${payload.level}&rubro=${payload.rubro}&slug=${payload.slug}`;
      const adminLink = `${host}/admin_${payload.level}.html?rubro=${payload.rubro}&slug=${payload.slug}`;
      successCard.innerHTML = `<div class="space-y-5 max-w-lg mx-auto py-4">
        <div class="w-20 h-20 mx-auto rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-600 shadow-xl shadow-emerald-500/10"><span class="material-symbols-outlined text-4xl">check_circle</span></div>
        <h4 class="font-headline font-extrabold text-2xl text-emerald-950">¡Excelente! El sistema para ${payload.nombre} está registrado.</h4>
        <p class="text-sm text-emerald-800 leading-relaxed">Verificamos tu transferencia de $4.999 para habilitar tu dominio y turnero oficial en el día.</p>
        <div class="p-3.5 rounded-2xl bg-white border border-emerald-200 text-left space-y-2 text-xs">
          <div class="flex justify-between gap-2"><span class="text-slate-500 shrink-0">Turnero Público:</span><a id="success-turnero-link" href="${turneroLink}" target="_blank" class="font-mono text-indigo-600 font-bold underline truncate max-w-[260px]">${turneroLink}</a></div>
          <div class="flex justify-between gap-2"><span class="text-slate-500 shrink-0">Panel de Control:</span><a id="success-admin-link" href="${adminLink}" target="_blank" class="font-mono text-indigo-600 font-bold underline truncate max-w-[260px]">${adminLink}</a></div>
        </div>
        <div class="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-headline font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"><span class="material-symbols-outlined text-lg">chat</span><span>Avisar a Tucu Red por WhatsApp</span></a>
        </div>
        <div class="pt-1"><span class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold font-mono">✓ Aprovisionado en base local (Local-First)</span></div>
      </div>`;
    }
  }, { signal });
  updateUI();
}
