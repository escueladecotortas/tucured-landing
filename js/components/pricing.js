// Archivo: js/components/pricing.js
/**
 * 🏷️ Tucu Red Web V2 - Sección Oficial de Planes y Precios Transparentes (SSOT v16.0)
 * 3 Niveles con identidad técnica diferenciada, gancho $1.000 ARS y conexión a #funnel.
 * Restricción estricta: < 200 líneas (< 180L).
 */

export const PRICING_PLANS = [
  {
    id: 'l1',
    levelNumber: 1,
    title: 'Nivel 1',
    subtitle: 'Turnero Autónomo Completo',
    badge: 'Bloqueo en Vivo • Token Hash',
    themeClass: 'border-sky-300/80 shadow-sky-100 hover:border-sky-500',
    accentText: 'text-sky-700',
    accentBadge: 'bg-sky-50 text-sky-800 border-sky-200',
    hookPrice: '$1.000 ARS',
    hookPeriod: 'Mes 1 - Lanzamiento',
    regularPrice: '$18.000 ARS / mes',
    commission: '0% comisiones',
    ctaText: 'Elegir Nivel 1',
    features: [
      'Alojado en base multitenant tucured-clients con bloqueo en tiempo real.',
      'Reserva directa en 3 toques con comprobante digital Hash #TK-XXXX.',
      'Portal de autogestión y cancelación en 1 clic para tus clientes.',
      'Catálogo con duración variable por servicio y cobro de señas (Alias tucured.mp).',
      'Despacho de confirmación directo y aviso a tu WhatsApp.'
    ]
  },
  {
    id: 'l2',
    levelNumber: 2,
    title: 'Nivel 2',
    subtitle: 'Central Operativa & Agenda Pro',
    badge: 'Gobernanza CRM • Turnos Mostrador',
    themeClass: 'border-indigo-400 shadow-indigo-100/50 hover:border-indigo-600',
    accentText: 'text-indigo-700',
    accentBadge: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    hookPrice: '$1.000 ARS',
    hookPeriod: 'Mes 1 - Lanzamiento',
    regularPrice: '$32.000 ARS / mes',
    commission: '0% comisiones',
    ctaText: 'Elegir Nivel 2',
    features: [
      'Todo lo de Nivel 1 en instancia de alto rendimiento dedicada.',
      'Panel de control SPA avanzado con 3 vistas operativas en vivo.',
      'Carga ágil de turnos manuales y telefónicos de mostrador sin fricción.',
      'Gobernanza Anti-No-Show: Lista Negra de ausencias y Lista VIP de clientes fieles.',
      'Historial de turnos y métricas de ocupación comercial en tiempo real.'
    ]
  },
  {
    id: 'l3',
    levelNumber: 3,
    title: 'Nivel 3',
    subtitle: 'Multi-Staff & Franquicias',
    badge: 'Equipos, Canchas y Consultorios',
    themeClass: 'border-amber-400 shadow-amber-100/50 hover:border-amber-600',
    accentText: 'text-amber-800',
    accentBadge: 'bg-amber-50 text-amber-900 border-amber-200',
    hookPrice: '$1.000 ARS',
    hookPeriod: 'Mes 1 - Lanzamiento',
    regularPrice: '$58.000 ARS / mes',
    commission: '0% comisiones',
    ctaText: 'Elegir Nivel 3',
    features: [
      'Todo lo de Nivel 1 y Nivel 2 con arquitectura multi-recurso.',
      'Agendas simultáneas independientes para staff y colaboradores ilimitados.',
      'Gestión de recursos físicos: canchas, sillones, gabinetes o consultorios.',
      'Microservicio Cron T-2hs para recordatorios automáticos con idempotencia.',
      'CRM financiero con facturación acumulada e historial por cliente.'
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
