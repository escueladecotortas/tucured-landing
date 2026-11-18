// Archivo: js/components/features.js
/**
 * 🛡️ Tucu Red Web V2 - Certezas Reales del Sistema (Aura Light · Grilla Simétrica 3x2)
 * 6 certezas operativas alineadas 100% con el motor L1/L2/L3 real.
 * Restricción estricta: < 200 líneas (< 180L).
 */

const CERTEZAS = [
  {
    icon: 'schedule',
    badge: 'Horarios y Feriados',
    accent: 'from-amber-500/10 to-amber-500/5 text-amber-600 border-amber-200/60',
    title: 'Horarios corridos, partidos y feriados 2026',
    desc: 'Configuración de mañana y tarde con calendario nacional 2026 de 16 feriados y excepción individual editable por mes (Bloqueado o Abierto).'
  },
  {
    icon: 'payments',
    badge: 'Cobro Directo',
    accent: 'from-emerald-500/10 to-emerald-500/5 text-emerald-600 border-emerald-200/60',
    title: 'Señas directo a tu alias sin comisiones',
    desc: 'Configurá seña por servicio (% o monto fijo) directo a tu Alias/CBU, con carga y reporte de comprobante desde el Ticket Online #TK.'
  },
  {
    icon: 'timer',
    badge: 'Agenda Precisa',
    accent: 'from-indigo-500/10 to-indigo-500/5 text-indigo-600 border-indigo-200/60',
    title: 'Turnos sin superposición',
    desc: 'El motor calcula y reserva los bloques contiguos según la duración real de cada prestación (de 15 a 480 min), asegurando una agenda ordenada.'
  },
  {
    icon: 'event_repeat',
    badge: 'Autogestión Web',
    accent: 'from-rose-500/10 to-rose-500/5 text-rose-600 border-rose-200/60',
    title: 'Autogestión y cancelación ágil',
    desc: 'Tu cliente consulta la dirección del local, descarga el evento .ics o libera su turno desde /t/TK-XXXX, y vos podés reabrir turnos desde el panel.'
  },
  {
    icon: 'contacts',
    badge: 'CRM Unificado',
    accent: 'from-sky-500/10 to-sky-500/5 text-sky-600 border-sky-200/60',
    title: 'Clientes y contactos desde tu celular',
    desc: 'Importá contactos directo desde la agenda de tu smartphone o archivos .vcf/.csv, registrá cumpleaños y gestioná teléfonos restringidos.'
  },
  {
    icon: 'tune',
    badge: 'Adaptado al Rubro',
    accent: 'from-teal-500/10 to-teal-500/5 text-teal-600 border-teal-200/60',
    title: 'Datos específicos por rubro',
    desc: 'Solicita Obra Social en consultorios de salud, permite elegir profesional o primer horario libre y asigna boxes, sillones o canchas.'
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
          Tu turnero opera con las reglas reales de tu comercio desde el primer día.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${CERTEZAS.map(item => `
          <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-4">
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
