// Archivo: js/components/pricing.js
/**
 * 🏷️ Tucu Red Web V2 - Sección Oficial de Planes y Precios Transparentes
 * 3 Niveles comparativos con gancho $1.000 ARS (Mes 1) y conexión reactiva a #funnel.
 * Restricción estricta: < 200 líneas.
 */

export const PRICING_PLANS = [
  {
    id: 'l1',
    levelNumber: 1,
    title: 'Nivel 1',
    subtitle: 'Turnero Autónomo Express',
    badge: 'Solución Completa para Emprendedores',
    hookPrice: '$1.000 ARS',
    hookPeriod: 'Mes 1 - Lanzamiento',
    regularPrice: '$18.000 ARS / mes',
    commission: '0% comisiones',
    isFeatured: false,
    ctaText: 'Elegir Nivel 1',
    features: [
      'Reserva web en 3 toques con bloqueo en tiempo real.',
      'Comprobante digital #TK-... con cancelación en 1 clic.',
      'Cobro de seña flexible con alias/CBU copiable.',
      'Notificaciones WhatsApp por Baileys (confirmación + 2 recordatorios).',
      'Panel móvil biométrico (Huella / PIN).'
    ]
  },
  {
    id: 'l2',
    levelNumber: 2,
    title: 'Nivel 2',
    subtitle: 'Central Operativa & Agenda Pro',
    badge: 'Más Elegido por Negocios',
    hookPrice: '$1.000 ARS',
    hookPeriod: 'Mes 1 - Lanzamiento',
    regularPrice: '$32.000 ARS / mes',
    commission: '0% comisiones',
    isFeatured: true,
    ctaText: 'Elegir Nivel 2',
    features: [
      'Todo lo de Nivel 1 incluido.',
      'CRM con Lista Negra anti-ausencias (no-shows) y Lista Blanca VIP.',
      'Tablero de KPIs en vivo (ocupación y facturación estimada).',
      'Bloqueo manual quirúrgico de franjas y carga de turnos de mostrador.',
      'Feriados flexibles y multi-alias de cobro.'
    ]
  },
  {
    id: 'l3',
    levelNumber: 3,
    title: 'Nivel 3',
    subtitle: 'Multi-Staff & Franquicias',
    badge: 'Equipos y Complejos',
    hookPrice: '$1.000 ARS',
    hookPeriod: 'Mes 1 - Lanzamiento',
    regularPrice: '$58.000 ARS / mes',
    commission: '0% comisiones',
    isFeatured: false,
    ctaText: 'Elegir Nivel 3',
    features: [
      'Todo lo de Nivel 1 y Nivel 2 incluido.',
      'Selector de profesional / cancha con agendas simultáneas e independientes.',
      'Control de recurso físico (sillón/cabina) para evitar solapamientos.',
      'Reportes de rendimiento y liquidación de comisiones por staff.',
      'Soporte multi-sucursal.'
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
          Inversión clara y predecible. Lanzamiento por solo $1.000.
        </h2>
        <p class="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
          Elegí la potencia que tu comercio necesita. 0% comisiones por turno y puesta en marcha guiada en el día.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-7xl mx-auto">
        ${PRICING_PLANS.map(plan => `
          <div class="relative rounded-[2rem] transition-all duration-300 flex flex-col justify-between ${
            plan.isFeatured
              ? 'bg-white p-7 sm:p-9 border-2 border-indigo-600 shadow-2xl shadow-indigo-200/50 lg:-translate-y-2 z-10'
              : 'bg-white/95 p-6 sm:p-8 border border-slate-200/90 shadow-md hover:shadow-xl'
          }">
            ${plan.isFeatured ? `
              <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[11px] font-extrabold tracking-wider uppercase shadow-md flex items-center gap-1.5 whitespace-nowrap">
                <span class="material-symbols-outlined text-sm">auto_awesome</span>
                <span>${plan.badge}</span>
              </div>
            ` : ''}

            <div>
              <div class="flex items-center justify-between gap-2 mb-3 ${plan.isFeatured ? 'pt-1' : ''}">
                <div>
                  <span class="text-xs font-bold uppercase tracking-wider text-indigo-600 font-headline block">${plan.title}</span>
                  <h3 class="font-headline font-extrabold text-xl sm:text-2xl text-slate-900">${plan.subtitle}</h3>
                </div>
                ${!plan.isFeatured ? `<span class="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200/70 text-right">${plan.badge}</span>` : ''}
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
                class="w-full py-4 rounded-2xl font-headline font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  plan.isFeatured
                    ? 'btn-aura-cta shadow-lg'
                    : 'bg-indigo-50/80 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200/80 hover:border-indigo-600'
                }"
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

