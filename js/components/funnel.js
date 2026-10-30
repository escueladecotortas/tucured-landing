// Archivo: js/components/funnel.js
/**
 * 🚀 Tucu Red Web V2 - Embudo de Puesta en Marcha en 3 Pasos
 * Sincronizado con el Showroom, Netlify Forms, LocalStorage y eventos GA4.
 */

const FUNNEL_RUBROS = [
  { id: 'barberia', label: 'Barbería', icon: 'content_cut' },
  { id: 'resto', label: 'Gastronomía', icon: 'restaurant' },
  { id: 'estetica', label: 'Estética & Spa', icon: 'spa' },
  { id: 'deportes', label: 'Deportes / Padel', icon: 'sports_tennis' },
  { id: 'salud', label: 'Salud / Médico', icon: 'medical_services' }
];

const FUNNEL_LEVELS = [
  { id: 'l1', title: 'Nivel 1: Turnero Express', desc: 'Recepción rápida estructurada directo a tu WhatsApp.', badge: 'Ágil' },
  { id: 'l2', title: 'Nivel 2: Agenda Inteligente', desc: 'Bloqueo automático de horarios y autogestión 24/7.', badge: 'Más elegido' },
  { id: 'l3', title: 'Nivel 3: Multi-Staff & Catálogo Pro', desc: 'Agenda multi-profesional, catálogo con duración y panel de métricas.', badge: 'Pro' }
];

export function renderFunnel(containerId = 'app-funnel') {
  const container = document.getElementById(containerId);
  if (!container) return;

  let selectedRubro = 'estetica';
  let selectedLevel = 'l2';

  container.innerHTML = `
    <section id="funnel" class="py-20 lg:py-28 max-w-[1140px] mx-auto px-4 sm:px-8">
      <div class="bg-white rounded-[2.5rem] p-6 sm:p-12 lg:p-14 shadow-2xl border border-slate-200/80 relative overflow-hidden">
        <div class="max-w-2xl mb-10 space-y-2">
          <span class="text-xs font-bold uppercase tracking-widest text-indigo-600 font-headline block">
            Puesta en marcha sin comisiones
          </span>
          <h2 class="font-headline font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Configurá tu propuesta en 3 pasos.
          </h2>
          <p class="text-slate-600 text-sm sm:text-base">
            Seleccioná tu rubro y nivel para que nuestro equipo deje tu vidriera operativa hoy mismo.
          </p>
        </div>

        <form id="tucured-funnel-form" name="contacto-tucured" method="POST" data-netlify="true" class="space-y-9">
          <input type="hidden" name="form-name" value="contacto-tucured" />
          <input type="hidden" name="rubro" id="funnel-input-rubro" value="${selectedRubro}" />
          <input type="hidden" name="plan" id="funnel-input-level" value="${selectedLevel}" />

          <!-- Paso 1: Rubro -->
          <div class="space-y-3.5">
            <div class="flex items-center gap-3">
              <span class="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">1</span>
              <h3 class="font-headline font-bold text-lg text-slate-900">Elegí tu Rubro Comercial</h3>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-3" id="funnel-rubros-grid">
              ${FUNNEL_RUBROS.map(r => `
                <button type="button" data-f-rubro="${r.id}" class="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-all flex flex-col items-center gap-1.5 cursor-pointer">
                  <span class="material-symbols-outlined text-2xl text-indigo-600">${r.icon}</span>
                  <span class="text-xs font-bold text-slate-800">${r.label}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Paso 2: Nivel -->
          <div class="space-y-3.5">
            <div class="flex items-center gap-3">
              <span class="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">2</span>
              <h3 class="font-headline font-bold text-lg text-slate-900">Seleccioná tu Nivel de Potencia</h3>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4" id="funnel-levels-grid">
              ${FUNNEL_LEVELS.map(l => `
                <button type="button" data-f-level="${l.id}" class="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white text-left transition-all flex flex-col justify-between gap-2 cursor-pointer">
                  <div class="flex items-center justify-between w-full">
                    <span class="font-headline font-bold text-sm text-slate-900">${l.title}</span>
                    <span class="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-extrabold uppercase">${l.badge}</span>
                  </div>
                  <p class="text-xs text-slate-500 leading-relaxed">${l.desc}</p>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Paso 3: Datos del Comercio -->
          <div class="space-y-3.5">
            <div class="flex items-center gap-3">
              <span class="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">3</span>
              <h3 class="font-headline font-bold text-lg text-slate-900">Datos de tu Comercio</h3>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input type="text" name="nombre" required placeholder="Nombre de tu comercio" class="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white outline-none text-sm font-medium" />
              <input type="text" name="ciudad" required placeholder="Ciudad o Barrio (ej: Yerba Buena)" class="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white outline-none text-sm font-medium" />
              <input type="tel" name="whatsapp" required placeholder="Tu WhatsApp (ej: 3815551234)" class="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white outline-none text-sm font-medium" />
            </div>
          </div>

          <div class="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p class="text-xs text-slate-500 flex items-center gap-1.5">
              <span class="material-symbols-outlined text-emerald-600 text-base">verified_user</span>
              <span>Configuración guiada • Sin contratos de permanencia</span>
            </p>
            <button type="submit" id="funnel-submit-btn" class="w-full sm:w-auto px-9 py-4 rounded-2xl btn-aura-cta font-headline font-extrabold text-base flex items-center justify-center gap-2.5 cursor-pointer">
              <span>Quiero empezar ahora</span>
              <span class="material-symbols-outlined text-xl">rocket_launch</span>
            </button>
          </div>
        </form>

        <!-- Estado de Confirmación In-Line -->
        <div id="funnel-success-card" class="hidden mt-6 p-6 rounded-2xl bg-emerald-50 border border-emerald-500/30 text-emerald-950 space-y-3"></div>
      </div>
    </section>
  `;

  const updateSelectionUI = () => {
    document.getElementById('funnel-input-rubro').value = selectedRubro;
    document.getElementById('funnel-input-level').value = selectedLevel;
    container.querySelectorAll('[data-f-rubro]').forEach(el => el.classList.toggle('funnel-option-active', el.getAttribute('data-f-rubro') === selectedRubro));
    container.querySelectorAll('[data-f-level]').forEach(el => el.classList.toggle('funnel-option-active', el.getAttribute('data-f-level') === selectedLevel));
  };

  container.querySelectorAll('[data-f-rubro]').forEach(btn => btn.addEventListener('click', () => { selectedRubro = btn.getAttribute('data-f-rubro'); updateSelectionUI(); }));
  container.querySelectorAll('[data-f-level]').forEach(btn => btn.addEventListener('click', () => { selectedLevel = btn.getAttribute('data-f-level'); updateSelectionUI(); }));

  window.activateFromShowroom = (rubroId, levelId) => {
    if (rubroId) selectedRubro = rubroId;
    if (levelId) selectedLevel = levelId;
    updateSelectionUI();
    container.scrollIntoView({ behavior: 'smooth' });
  };

  const form = document.getElementById('tucured-funnel-form');
  const successCard = document.getElementById('funnel-success-card');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    try {
      const saved = JSON.parse(localStorage.getItem('tucured_leads_v2') || '[]');
      saved.push({ ...payload, createdAt: new Date().toISOString() });
      localStorage.setItem('tucured_leads_v2', JSON.stringify(saved));
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString()
      });
    } catch (_) { /* Fallback Local-First */ }
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'generate_lead', { rubro: selectedRubro, level: selectedLevel });
    }
    const waText = encodeURIComponent(`Hola Tucu Red! Quiero poner en marcha el ${selectedLevel.toUpperCase()} para mi comercio "${payload.nombre}" (${selectedRubro}) en ${payload.ciudad}. Mi WhatsApp: ${payload.whatsapp}`);
    successCard.classList.remove('hidden');
    successCard.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 class="font-headline font-bold text-base text-emerald-900">✓ Solicitud registrada para ${payload.nombre}</h4>
          <p class="text-xs text-emerald-800 mt-0.5">Guardamos tu configuración (${selectedLevel.toUpperCase()} • ${selectedRubro}). Continuá por WhatsApp para coordinar los detalles.</p>
        </div>
        <a href="https://wa.me/5493815551234?text=${waText}" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 text-center">
          Confirmar por WhatsApp →
        </a>
      </div>
    `;
    form.reset();
    updateSelectionUI();
  });

  updateSelectionUI();
}
