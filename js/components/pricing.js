// Archivo: js/components/pricing.js
/**
 * Tucu Red Web V2 - Sección Oficial de Planes y Precios Transparentes (SSOT v16.0)
 * 3 Niveles (Esencial, Gestión y Equipos), gancho $4.999 ARS (Mes Fundador) y conexión a #funnel.
 * Restricción estricta: < 200 líneas (< 180L).
 */

export const PRICING_PLANS = [
  {
    id: 'l1',
    levelNumber: 1,
    title: 'Plan 1',
    subtitle: 'Esencial',
    badge: 'Agenda Independiente',
    themeClass: 'border-sky-300/80 shadow-sky-100 hover:border-sky-500',
    accentText: 'text-sky-700',
    accentBadge: 'bg-sky-50 text-sky-800 border-sky-200',
    hookPrice: '$4.999 ARS',
    hookPeriod: 'Mes Fundador - Primer Mes',
    regularPrice: '$14.900 ARS / mes',
    commission: '0% comisiones',
    ctaText: 'Elegir Plan Esencial',
    features: [
      'Turnero web en 2 pasos sin descargas ni contraseñas.',
      'Seña configurable por servicio directo a tu Alias/CBU con carga de comprobante.',
      'Comprobante online #TK con dirección del local, calendario .ics y autogestión.',
      'Horarios partidos y Feriados Nacionales 2026 configurables por mes.',
      'Gestión de 5 estados con reapertura de turno y recordatorios por WhatsApp.'
    ]
  },
  {
    id: 'l2',
    levelNumber: 2,
    title: 'Plan 2',
    subtitle: 'Gestión',
    badge: 'CRM & Gestión Operativa',
    themeClass: 'border-indigo-400 shadow-indigo-100/50 hover:border-indigo-600',
    accentText: 'text-indigo-700',
    accentBadge: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    hookPrice: '$4.999 ARS',
    hookPeriod: 'Mes Fundador - Primer Mes',
    regularPrice: '$24.900 ARS / mes',
    commission: '0% comisiones',
    ctaText: 'Elegir Plan Gestión',
    features: [
      'Todo lo de Esencial con turnos de mostrador, selector de cantidad de personas o lugares y % de ocupación.',
      'CRM & Contactos con importación directa desde la agenda del celular (.vcf/.csv).',
      'Ficha completa de clientes con Email, Fecha de Cumpleaños y notas.',
      'Bloqueo preventivo de teléfonos restringidos en Turnero Web y papelera restaurable.',
      'Historial de precios, cierres por vacaciones y bloqueos manuales de horarios.'
    ]
  },
  {
    id: 'l3',
    levelNumber: 3,
    title: 'Plan 3',
    subtitle: 'Equipos',
    badge: 'Equipos, Canchas y Clínicas',
    themeClass: 'border-amber-400 shadow-amber-100/50 hover:border-amber-600',
    accentText: 'text-amber-800',
    accentBadge: 'bg-amber-50 text-amber-900 border-amber-200',
    hookPrice: '$4.999 ARS',
    hookPeriod: 'Mes Fundador - Primer Mes',
    regularPrice: '$34.900 ARS / mes',
    commission: '0% comisiones',
    ctaText: 'Elegir Plan Equipos',
    features: [
      'Todo lo de Gestión con gestión por profesional y Agenda Dual (Especialista o Recurso).',
      'Horarios partidos (Mañana / Tarde) por profesional y bloqueos por servicio.',
      'Asignación de sillones, boxes, consultorios o canchas por servicio.',
      'Confirmación y Liberación Automática (2 hs antes) activable o pausable.',
      'CRM Financiero con historial de citas por cliente y elección de profesional.'
    ]
  }
];

export function handleSelectPlan(levelId, levelNumber) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tucured:level-selected', {
      detail: { level: levelId, levelNumber }
    }));
  }
  const funnelTarget = document.getElementById('funnel') || document.getElementById('app-funnel');
  if (funnelTarget) {
    funnelTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

export function renderPricing(containerId = 'app-pricing') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <section id="precios" class="py-20 lg:py-28 max-w-[1440px] mx-auto px-4 sm:px-8 component-enter">
      <div class="text-center max-w-3xl mx-auto mb-14 space-y-3">
        <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-bold uppercase tracking-widest font-headline">
          <span class="material-symbols-outlined text-sm">payments</span>
          <span>Planes y Precios Transparentes</span>
        </div>
        <h2 class="font-headline font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 tracking-tight leading-tight">
          Inversión clara y predecible. Activá tu Mes Fundador por $4.999.
        </h2>
        <p class="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
          0% comisiones por turno. Te lo entregamos 100% configurado y listo para usar, con soporte directo.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-7xl mx-auto">
        ${PRICING_PLANS.map(plan => `
          <div class="relative rounded-[2rem] bg-white p-7 sm:p-9 border-2 transition-all duration-300 flex flex-col justify-between shadow-lg ${plan.themeClass}">
            <div>
              <div class="flex items-center justify-between gap-2 mb-3">
                <div>
                  <span class="text-xs font-bold uppercase tracking-wider ${plan.accentText} font-headline block">${plan.title}</span>
                  <h3 class="font-headline font-extrabold text-xl sm:text-2xl text-slate-900">${plan.subtitle}</h3>
                </div>
                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold border ${plan.accentBadge} text-right">${plan.badge}</span>
              </div>

              <div class="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 my-4 space-y-1">
                <div class="flex items-baseline gap-1.5 flex-wrap">
                  <span class="font-headline font-extrabold text-3xl sm:text-4xl text-slate-900">${plan.hookPrice}</span>
                  <span class="text-xs font-extrabold text-emerald-700 uppercase tracking-wide">(${plan.hookPeriod})</span>
                </div>
                <div class="flex items-center justify-between text-xs text-slate-500 pt-1.5 border-t border-emerald-200/50">
                  <span>Abono regular: <strong class="text-slate-800">${plan.regularPrice}</strong></span>
                  <span class="font-bold text-emerald-700 flex items-center gap-0.5"><span class="material-symbols-outlined text-xs">verified</span> ${plan.commission}</span>
                </div>
              </div>

              <ul class="space-y-3 my-6 text-left">
                ${plan.features.map(f => `
                  <li class="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600">
                    <span class="material-symbols-outlined text-emerald-600 text-lg shrink-0 select-none">check_circle</span>
                    <span class="leading-snug">${f}</span>
                  </li>
                `).join('')}
              </ul>
            </div>

            <div class="pt-4 mt-auto">
              <button
                type="button"
                data-pricing-cta="${plan.id}"
                data-pricing-num="${plan.levelNumber}"
                class="w-full py-4 rounded-2xl font-headline font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer bg-slate-900 hover:bg-indigo-600 text-white shadow-md"
              >
                <span>${plan.ctaText}</span>
                <span class="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;

  container.querySelectorAll('[data-pricing-cta]').forEach(btn => {
    btn.addEventListener('click', () => {
      const levelId = btn.getAttribute('data-pricing-cta');
      const levelNum = parseInt(btn.getAttribute('data-pricing-num'), 10) || 1;
      handleSelectPlan(levelId, levelNum);
    });
  });
}
