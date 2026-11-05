// Archivo: js/components/funnel.js
/**
 * 🧙 Tucu Red Web V2 - Wizard Transaccional de 4 Pasos (Local-First Controller)
 * Flujo de alta comercial, checkout QR $1.000, alias copiable y pasarela WhatsApp.
 * Restricción estricta: < 200 líneas (< 180L).
 */

import { getFunnelMarkup, EXPANDED_RUBROS, FUNNEL_LEVELS } from './funnel_markup.js';
import { getLeadWhatsAppUrl } from '../utils/whatsapp_link.js';
import { TUCURED_CHECKOUT_CONFIG, sanitizeArgentinePhone } from './funnel_data.js';

export function renderFunnel(containerId = 'app-funnel') {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (window._funnelAbort) window._funnelAbort.abort();
  const abortCtrl = new AbortController();
  window._funnelAbort = abortCtrl;
  const { signal } = abortCtrl;

  const draft = JSON.parse(sessionStorage.getItem('tucured_funnel_draft') || '{}');
  let currentStep = draft.step || 1, selectedRubro = draft.rubro || 'estetica';
  let selectedLevel = draft.level || 'l2', selectedSchedule = draft.schedule || 'corrido', selectedCity = draft.ciudad || 'Yerba Buena';

  container.innerHTML = getFunnelMarkup(draft, selectedRubro, selectedLevel, selectedSchedule, selectedCity);

  const [phoneInp, nameInp, titularInp, emailInp, citySel] = ['fn-phone', 'fn-nombre', 'fn-titular', 'fn-email', 'fn-ciudad-select'].map(id => document.getElementById(id));
  const [s1, s2, s3, s4] = ['funnel-step-1', 'funnel-step-2', 'funnel-step-3', 'funnel-step-4'].map(id => document.getElementById(id));
  const [b1, b2, b3, b4] = ['step-badge-1', 'step-badge-2', 'step-badge-3', 'step-badge-4'].map(id => document.getElementById(id));
  const progressLabel = document.getElementById('step-progress-label'), progressBar = document.getElementById('step-progress-bar');

  const slugify = (t) => (t || 'comercio').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'comercio';

  const persistLocalDB = (isFinal = false) => {
    const payload = {
      nombre: nameInp?.value.trim() || '', ciudad: selectedCity, rubro: selectedRubro,
      level: selectedLevel, horario: selectedSchedule, titular: titularInp?.value.trim() || '',
      email: emailInp?.value.trim() || '', whatsapp: sanitizeArgentinePhone(phoneInp?.value),
      materialPdf: document.getElementById('fn-material-pdf')?.checked ?? true,
      step: currentStep, isFinal, slug: slugify(nameInp?.value), updatedAt: new Date().toISOString()
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

    setBadge(b1, 1, currentStep > 1, currentStep === 1);
    setBadge(b2, 2, currentStep > 2, currentStep === 2);
    setBadge(b3, 3, currentStep > 3, currentStep === 3);
    setBadge(b4, 4, false, currentStep === 4);

    if (progressLabel) progressLabel.textContent = `Paso ${currentStep} de 4`;
    if (progressBar) progressBar.style.width = `${(currentStep / 4) * 100}%`;

    const summaryLvl = document.getElementById('checkout-summary-level'), sumName = document.getElementById('checkout-summary-name');
    const sumCity = document.getElementById('checkout-summary-city'), sumRubro = document.getElementById('checkout-summary-rubro');
    if (summaryLvl) { const lObj = FUNNEL_LEVELS.find(l => l.id === selectedLevel); summaryLvl.textContent = lObj ? lObj.badge : 'Nivel 2'; }
    if (sumName) sumName.textContent = nameInp?.value.trim() || 'Tu Comercio';
    if (sumCity) sumCity.textContent = selectedCity;
    if (sumRubro) { const rObj = EXPANDED_RUBROS.find(r => r.id === selectedRubro); sumRubro.textContent = rObj ? rObj.label : 'Comercio'; }

    persistLocalDB(false);
  };

  document.getElementById('btn-goto-step-2')?.addEventListener('click', () => {
    if (!nameInp?.value.trim()) { nameInp?.focus(); return; }
    currentStep = 2; updateUI(); container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, { signal });

  document.getElementById('btn-goto-step-3')?.addEventListener('click', () => {
    currentStep = 3; updateUI(); titularInp?.focus(); container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, { signal });

  document.getElementById('btn-goto-step-4')?.addEventListener('click', () => {
    if (!titularInp?.value.trim()) { titularInp?.focus(); return; }
    if (sanitizeArgentinePhone(phoneInp?.value).length < 10) { phoneInp?.focus(); return; }
    currentStep = 4; updateUI(); container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, { signal });

  ['btn-back-to-1', 'btn-back-to-2', 'btn-back-to-3'].forEach((id, i) =>
    document.getElementById(id)?.addEventListener('click', () => { currentStep = i + 1; updateUI(); }, { signal })
  );

  citySel?.addEventListener('change', (e) => { selectedCity = e.target.value; updateUI(); }, { signal });
  phoneInp?.addEventListener('input', (e) => {
    const clean = sanitizeArgentinePhone(e.target.value);
    e.target.value = clean;
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

  [nameInp, titularInp, emailInp].forEach(inp => inp?.addEventListener('input', () => persistLocalDB(false), { signal }));
  container.querySelectorAll('[data-f-rubro]').forEach(b => b.addEventListener('click', () => { selectedRubro = b.getAttribute('data-f-rubro'); updateUI(); }, { signal }));
  container.querySelectorAll('[data-f-level]').forEach(b => b.addEventListener('click', () => { selectedLevel = b.getAttribute('data-f-level'); updateUI(); }, { signal }));
  container.querySelectorAll('[data-f-schedule]').forEach(b => b.addEventListener('click', () => { selectedSchedule = b.getAttribute('data-f-schedule'); updateUI(); }, { signal }));

  window.addEventListener('tucured:rubro-selected', (e) => { if (e.detail?.rubro) { selectedRubro = e.detail.rubro; updateUI(); } }, { signal });
  window.addEventListener('tucured:level-selected', (e) => {
    if (e.detail?.level) { const raw = String(e.detail.level).toLowerCase(); selectedLevel = raw.startsWith('l') ? raw : `l${raw}`; updateUI(); }
  }, { signal });

  const form = document.getElementById('tucured-funnel-form'), successCard = document.getElementById('funnel-success-card');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = persistLocalDB(true);
    try {
      await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(form)).toString() });
    } catch (_) {}
    sessionStorage.removeItem('tucured_funnel_draft');
    setBadge(b4, 4, true, false); form.classList.add('hidden');
    if (successCard) {
      successCard.classList.remove('hidden');
      const waUrl = getLeadWhatsAppUrl(payload);
      const host = window.location.origin;
      const turneroLink = `${host}/clients/${payload.slug}`;
      const adminLink = `${host}/admin_${payload.level}.html?slug=${payload.slug}`;
      successCard.innerHTML = `<div class="space-y-5 max-w-lg mx-auto py-4">
        <div class="w-20 h-20 mx-auto rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-600 shadow-xl shadow-emerald-500/10">
          <span class="material-symbols-outlined text-4xl">check_circle</span>
        </div>
        <h4 class="font-headline font-extrabold text-2xl text-emerald-950">¡Excelente! El sistema para ${payload.nombre} está registrado.</h4>
        <p class="text-sm text-emerald-800 leading-relaxed">Verificamos tu transferencia de $1.000 para habilitar tu dominio y turnero oficial en el día.</p>
        <div class="p-3.5 rounded-2xl bg-white border border-emerald-200 text-left space-y-1.5 text-xs">
          <div class="flex justify-between"><span class="text-slate-500">Turnero Público:</span><a href="${turneroLink}" target="_blank" class="font-mono text-indigo-600 font-bold underline truncate max-w-[240px]">${turneroLink}</a></div>
          <div class="flex justify-between"><span class="text-slate-500">Panel de Control:</span><a href="${adminLink}" target="_blank" class="font-mono text-indigo-600 font-bold underline truncate max-w-[240px]">${adminLink}</a></div>
        </div>
        <div class="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-headline font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer">
            <span class="material-symbols-outlined text-lg">chat</span><span>Avisar a Tucu Red por WhatsApp</span>
          </a>
        </div>
        <div class="pt-1"><span class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold font-mono">✓ Aprovisionado en base local (Local-First)</span></div>
      </div>`;
    }
  }, { signal });

  updateUI();
}
