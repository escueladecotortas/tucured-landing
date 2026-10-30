// Archivo: js/components/features.js
/**
 * 🛡️ Tucu Red Web V2 - Certezas Reales del Sistema (Aura Light)
 * Reglas comerciales concretas: siesta, feriados argentinos, anti-solapamiento y autogestión.
 */

const CERTEZAS = [
  {
    icon: 'schedule',
    iconColor: 'bg-amber-50 text-amber-600',
    title: 'Respeta tu horario y el corte de siesta',
    desc: 'Configuración de turnos corridos o partidos. Tus clientes solo ven horarios cuando tu local está realmente abierto.'
  },
  {
    icon: 'event_available',
    iconColor: 'bg-indigo-50 text-indigo-600',
    title: 'Feriados nacionales incorporados',
    desc: 'Calendario argentino 2026–2027 integrado. Saltea feriados y días no laborables automáticamente.'
  },
  {
    icon: 'timer',
    iconColor: 'bg-emerald-50 text-emerald-600',
    title: 'Cero turnos superpuestos',
    desc: 'Si un servicio requiere más tiempo, el sistema calcula los bloques contiguos necesarios para que nadie espere de más.'
  },
  {
    icon: 'event_repeat',
    iconColor: 'bg-rose-50 text-rose-600',
    title: 'Autogestión para cancelaciones',
    desc: 'Tus clientes pueden reprogramar o cancelar con su código desde el celular, liberando el lugar automáticamente.'
  },
  {
    icon: 'tune',
    iconColor: 'bg-teal-50 text-teal-600',
    title: 'Campos específicos para tu rubro',
    desc: 'Pide la Obra Social en consultorios médicos, sillones en barberías o cantidad de personas en gastronomía.'
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
          Sin configuraciones complejas. Tu turnero opera con la lógica real del comercio local desde el primer minuto.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${CERTEZAS.map((item, idx) => `
          <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow space-y-3.5 ${idx === 3 || idx === 4 ? 'lg:col-span-1' : ''}">
            <div class="w-12 h-12 rounded-2xl ${item.iconColor} flex items-center justify-center">
              <span class="material-symbols-outlined text-2xl">${item.icon}</span>
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
