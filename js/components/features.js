// Archivo: js/components/features.js
/**
 * 🛡️ Tucu Red Web V2 - Certezas Reales del Sistema (Aura Light)
 * Reglas comerciales concretas: siesta, feriados argentinos, anti-solapamiento y autogestión.
 * Restricción estricta: < 200 líneas (< 180L).
 */

const CERTEZAS = [
  {
    icon: 'schedule',
    badge: 'Horarios Locales',
    accent: 'from-amber-500/10 to-amber-500/5 text-amber-600 border-amber-200/60',
    title: 'Respeta tu horario y el corte de siesta',
    desc: 'Configuración flexible de horarios corridos o partidos. Tus clientes solo ven horarios cuando tu local está realmente abierto.'
  },
  {
    icon: 'event_available',
    badge: 'Feriados Oficiales',
    accent: 'from-indigo-500/10 to-indigo-500/5 text-indigo-600 border-indigo-200/60',
    title: 'Feriados nacionales incorporados',
    desc: 'Calendario argentino 2026–2027 sincronizado. Saltea feriados y días no laborables automáticamente sin intervención manual.'
  },
  {
    icon: 'timer',
    badge: 'Sincronización Continua',
    accent: 'from-emerald-500/10 to-emerald-500/5 text-emerald-600 border-emerald-200/60',
    title: 'Horarios perfectamente sincronizados',
    desc: 'Si un servicio requiere más tiempo, el sistema asegura los bloques contiguos exactos para garantizar una atención puntual y ordenada.'
  },
  {
    icon: 'event_repeat',
    badge: 'Autogestión Web',
    accent: 'from-rose-500/10 to-rose-500/5 text-rose-600 border-rose-200/60',
    title: 'Autogestión y cancelación ágil',
    desc: 'Tus clientes pueden consultar o liberar su turno desde el celular con su comprobante #TK, habilitando el lugar al instante para otro cliente.'
  },
  {
    icon: 'tune',
    badge: 'Campos por Rubro',
    accent: 'from-teal-500/10 to-teal-500/5 text-teal-600 border-teal-200/60',
    title: 'Campos específicos para tu rubro',
    desc: 'Pide la Obra Social en consultorios médicos, sillones en barberías o cantidad de comensales en gastronomía.'
  }
];

export function renderFeatures(containerId = 'app-features') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <section id="certezas" class="py-20 lg:py-24 max-w-[1440px] mx-auto px-4 sm:px-8 component-enter">
      <div class="max-w-3xl mb-12 space-y-3">
        <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-bold uppercase tracking-widest font-headline">
          <span class="material-symbols-outlined text-sm">verified</span>
          <span>Detalles que importan</span>
        </div>
        <h2 class="font-headline font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 tracking-tight leading-tight">
          Un sistema que entiende cómo trabaja tu negocio todos los días
        </h2>
        <p class="text-slate-600 text-base sm:text-lg">
          Sin configuraciones complejas. Tu turnero opera con la lógica real de tu comercio desde el primer minuto.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${CERTEZAS.map((item, idx) => `
          <div class="bg-gradient-to-br bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-4 ${idx === 3 || idx === 4 ? 'lg:col-span-1' : ''}">
            <div class="flex items-center justify-between">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br ${item.accent} flex items-center justify-center border shadow-xs">
                <span class="material-symbols-outlined text-2xl">${item.icon}</span>
              </div>
              <span class="text-[10px] font-extrabold font-mono tracking-wider uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                ${item.badge}
              </span>
            </div>
            <h3 class="font-headline font-bold text-lg text-slate-900 leading-snug">
              ${item.title}
            </h3>
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              ${item.desc}
            </p>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}
