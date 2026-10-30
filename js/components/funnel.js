// Archivo: js/components/funnel.js
/**
 * 🚀 Tucu Red Web V2 - Embudo Asistido de 3 Pasos (Aura CRO Engine)
 * Sincronización reactiva con Showroom, máscara E.164, sessionStorage y AbortController.
 * Restricción estricta: < 200 líneas.
 */

const FUNNEL_RUBROS = [
  { id: 'barberia', label: 'Barbería', icon: 'content_cut' },
  { id: 'resto', label: 'Gastronomía', icon: 'restaurant' },
  { id: 'estetica', label: 'Estética & Spa', icon: 'spa' },
  { id: 'deportes', label: 'Deportes / Padel', icon: 'sports_tennis' },
  { id: 'salud', label: 'Salud / Médico', icon: 'medical_services' }
];

const FUNNEL_LEVELS = [
  { id: 'l1', title: 'Turnero Express', desc: 'Recepción rápida a WhatsApp.', badge: 'Nivel 1' },
  { id: 'l2', title: 'Agenda Inteligente', desc: 'Bloqueo y autogestión 24/7.', badge: 'Nivel 2' },
  { id: 'l3', title: 'Multi-Staff & Catálogo Pro', desc: 'Agenda multi-profesional y métricas.', badge: 'Nivel 3' }
];

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
  let selectedRubro = draft.rubro || 'estetica';
  let selectedLevel = draft.level || 'l2';

  container.innerHTML = `
    <section id="funnel" class="py-20 lg:py-28 max-w-[1140px] mx-auto px-4 sm:px-8">
      <div class="bg-white rounded-[2.5rem] p-6 sm:p-12 lg:p-14 shadow-2xl border border-slate-200/80 relative overflow-hidden">
        <div class="max-w-2xl mb-10 space-y-2">
          <span class="text-xs font-bold uppercase tracking-widest text-indigo-600 font-headline block">Onboarding Guiado Asistido</span>
          <h2 class="font-headline font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">Configurá tu propuesta en 3 pasos.</h2>
          <p class="text-slate-600 text-sm sm:text-base">Seleccioná tu rubro y nivel para que nuestro equipo deje tu vidriera operativa hoy mismo.</p>
        </div>
        <form id="tucured-funnel-form" name="contacto-tucured" method="POST" data-netlify="true" class="space-y-9">
          <input type="hidden" name="form-name" value="contacto-tucured" />
          <input type="hidden" name="rubro" id="funnel-input-rubro" value="${selectedRubro}" />
          <input type="hidden" name="plan" id="funnel-input-level" value="${selectedLevel}" />
          <!-- Paso 1 -->
          <div id="funnel-step-1" class="space-y-3.5 transition-all">
            <div class="flex items-center gap-3"><span id="step-badge-1" class="w-7 h-7 rounded-full text-white font-bold text-xs flex items-center justify-center transition-all">1</span><h3 class="font-headline font-bold text-lg text-slate-900">Elegí tu Rubro Comercial</h3></div>
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-3" id="funnel-rubros-grid">
              ${FUNNEL_RUBROS.map(r => `<button type="button" data-f-rubro="${r.id}" class="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-all flex flex-col items-center gap-1.5 cursor-pointer"><span class="material-symbols-outlined text-2xl text-indigo-600">${r.icon}</span><span class="text-xs font-bold text-slate-800">${r.label}</span></button>`).join('')}
            </div>
          </div>
          <!-- Paso 2 -->
          <div id="funnel-step-2" class="space-y-3.5 transition-all">
            <div class="flex items-center gap-3"><span id="step-badge-2" class="w-7 h-7 rounded-full text-white font-bold text-xs flex items-center justify-center transition-all">2</span><h3 class="font-headline font-bold text-lg text-slate-900">Seleccioná tu Nivel de Potencia</h3></div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4" id="funnel-levels-grid">
              ${FUNNEL_LEVELS.map(l => `<button type="button" data-f-level="${l.id}" class="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white text-left transition-all flex flex-col justify-between gap-2 cursor-pointer"><div class="flex items-center justify-between w-full"><span class="font-headline font-bold text-sm text-slate-900">${l.title}</span><span class="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-extrabold uppercase">${l.badge}</span></div><p class="text-xs text-slate-500 leading-relaxed">${l.desc}</p></button>`).join('')}
            </div>
          </div>
          <!-- Paso 3 -->
          <div id="funnel-step-3" class="space-y-3.5 transition-all">
            <div class="flex items-center gap-3"><span id="step-badge-3" class="w-7 h-7 rounded-full text-white font-bold text-xs flex items-center justify-center transition-all">3</span><h3 class="font-headline font-bold text-lg text-slate-900">Datos de tu Comercio</h3></div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input type="text" id="fn-nombre" name="nombre" value="${draft.nombre || ''}" required placeholder="Nombre de tu comercio" class="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white outline-none text-sm font-medium" />
              <input type="text" id="fn-ciudad" name="ciudad" value="${draft.ciudad || ''}" required placeholder="Ciudad o Barrio (ej: Yerba Buena)" class="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white outline-none text-sm font-medium" />
              <div class="relative">
                <input type="tel" id="fn-phone" name="whatsapp" value="${draft.whatsapp || ''}" required placeholder="WhatsApp (ej: 381 555-4321)" class="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white outline-none text-sm font-medium" />
                <span id="phone-valid-hint" class="absolute right-3.5 top-3.5 text-xs text-slate-400 font-mono">AR +54 9</span>
              </div>
            </div>
          </div>
          <div class="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p class="text-xs text-slate-500 flex items-center gap-1.5"><span class="material-symbols-outlined text-emerald-600 text-base">verified_user</span><span>Puesta en marcha guiada • Sin contratos de permanencia</span></p>
            <button type="submit" id="funnel-submit-btn" class="w-full sm:w-auto px-9 py-4 rounded-2xl btn-aura-cta font-headline font-extrabold text-base flex items-center justify-center gap-2.5 cursor-pointer"><span>Configurar Propuesta</span><span class="material-symbols-outlined text-xl">rocket_launch</span></button>
          </div>
        </form>
        <div id="funnel-success-card" class="hidden mt-6 p-6 rounded-2xl bg-emerald-50 border border-emerald-500/30 text-emerald-950 space-y-3"></div>
      </div>
    </section>
  `;

  const [phoneInput, nombreInput, ciudadInput, ctaBtn] = ['fn-phone', 'fn-nombre', 'fn-ciudad', 'funnel-submit-btn'].map(id => document.getElementById(id));
  const saveDraft = () => sessionStorage.setItem('tucured_funnel_draft', JSON.stringify({ rubro: selectedRubro, level: selectedLevel, nombre: nombreInput?.value || '', ciudad: ciudadInput?.value || '', whatsapp: phoneInput?.value || '' }));

  const updateUI = () => {
    document.getElementById('funnel-input-rubro').value = selectedRubro;
    document.getElementById('funnel-input-level').value = selectedLevel;
    container.querySelectorAll('[data-f-rubro]').forEach(el => el.classList.toggle('funnel-option-active', el.getAttribute('data-f-rubro') === selectedRubro));
    container.querySelectorAll('[data-f-level]').forEach(el => el.classList.toggle('funnel-option-active', el.getAttribute('data-f-level') === selectedLevel));

    const [b1, b2, b3] = ['step-badge-1', 'step-badge-2', 'step-badge-3'].map(id => document.getElementById(id));
    if (b1) { b1.textContent = selectedRubro ? '✓' : '1'; b1.className = `w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${selectedRubro ? 'funnel-step-completed' : 'funnel-step-active'}`; }
    if (b2) { b2.textContent = selectedLevel ? '✓' : '2'; b2.className = `w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${selectedLevel ? 'funnel-step-completed' : 'funnel-step-active'}`; }
    const isS3Valid = (nombreInput?.value.trim().length > 1) && (sanitizeArgentinePhone(phoneInput?.value).length >= 10);
    if (b3) { b3.textContent = isS3Valid ? '✓' : '3'; b3.className = `w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${isS3Valid ? 'funnel-step-completed' : 'bg-slate-300 text-slate-700'}`; }

    if (ctaBtn) {
      const rName = FUNNEL_RUBROS.find(r => r.id === selectedRubro)?.label || 'mi Comercio';
      const lBadge = FUNNEL_LEVELS.find(l => l.id === selectedLevel)?.badge || 'Nivel 2';
      ctaBtn.innerHTML = `<span>Empezar con ${lBadge} para ${rName}</span><span class="material-symbols-outlined text-xl">rocket_launch</span>`;
    }
    saveDraft();
  };

  phoneInput?.addEventListener('input', (e) => {
    const clean = sanitizeArgentinePhone(e.target.value);
    e.target.value = clean;
    const hint = document.getElementById('phone-valid-hint');
    if (hint) hint.className = `absolute right-3.5 top-3.5 text-xs font-mono ${clean.length === 10 ? 'text-emerald-600 font-bold' : 'text-slate-400'}`;
    updateUI();
  }, { signal });

  [nombreInput, ciudadInput].forEach(inp => inp?.addEventListener('input', updateUI, { signal }));
  container.querySelectorAll('[data-f-rubro]').forEach(btn => btn.addEventListener('click', () => { selectedRubro = btn.getAttribute('data-f-rubro'); updateUI(); document.getElementById('funnel-step-2')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, { signal }));
  container.querySelectorAll('[data-f-level]').forEach(btn => btn.addEventListener('click', () => { selectedLevel = btn.getAttribute('data-f-level'); updateUI(); nombreInput?.focus(); }, { signal }));

  window.addEventListener('tucured:rubro-selected', (e) => { if (e.detail?.rubro) { selectedRubro = e.detail.rubro === 'gastronomia' ? 'resto' : e.detail.rubro; updateUI(); } }, { signal });
  window.addEventListener('tucured:level-selected', (e) => { if (e.detail?.level) { selectedLevel = e.detail.level; updateUI(); } }, { signal });
  window.activateFromShowroom = (rubroId, levelId) => { if (rubroId) selectedRubro = rubroId === 'gastronomia' ? 'resto' : rubroId; if (levelId) selectedLevel = levelId; updateUI(); container.scrollIntoView({ behavior: 'smooth' }); };

  const form = document.getElementById('tucured-funnel-form');
  const successCard = document.getElementById('funnel-success-card');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const cleanPhone = sanitizeArgentinePhone(phoneInput?.value);
    const payload = { ...Object.fromEntries(formData.entries()), whatsapp: cleanPhone };
    try {
      const saved = JSON.parse(localStorage.getItem('tucured_leads_v2') || '[]');
      saved.push({ ...payload, createdAt: new Date().toISOString() });
      localStorage.setItem('tucured_leads_v2', JSON.stringify(saved));
      await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(formData).toString() });
    } catch (_) { /* Local-First Fallback */ }
    sessionStorage.removeItem('tucured_funnel_draft');
    if (typeof window.gtag === 'function') window.gtag('event', 'generate_lead', { rubro: selectedRubro, level: selectedLevel });
    const waText = encodeURIComponent(`¡Hola Tucu Red! Quiero poner en marcha el ${selectedLevel.toUpperCase()} para "${payload.nombre}" (${selectedRubro}) en ${payload.ciudad}. Tel: +54 9 ${cleanPhone}`);
    if (successCard) {
      successCard.classList.remove('hidden');
      successCard.innerHTML = `<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><h4 class="font-headline font-bold text-base text-emerald-900">✓ Propuesta guardada para ${payload.nombre}</h4><p class="text-xs text-emerald-800 mt-0.5">${selectedLevel.toUpperCase()} • ${selectedRubro} (${payload.ciudad}). Continuá por WhatsApp para coordinar la entrega.</p></div><a href="https://wa.me/5493815551234?text=${waText}" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 text-center">Confirmar por WhatsApp →</a></div>`;
    }
    form.reset();
    updateUI();
  }, { signal });

  updateUI();
}
