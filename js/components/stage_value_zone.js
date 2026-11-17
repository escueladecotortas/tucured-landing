// Archivo: js/components/stage_value_zone.js
/**
 * ⚡ Tucu Red Web V2 - Zona 3: Especificaciones Siempre Visibles (2 Bloques Canónicos) y CTA
 * Ficha técnica en 2 bloques: Para tus Clientes y Tu Panel de Control (/admin).
 * Restricción estricta: < 200 líneas (< 175L) y Protocolo PEAC.
 */

const LEVEL_MATRIX_V16 = {
  l1: {
    badge: 'Nivel 1: Autónomo • Agenda Web 24/7',
    themeBadge: 'bg-sky-50 text-sky-700 border-sky-200',
    architecture: 'Turnero Autónomo • Seña Configurable • Ticket Online #TK',
    microMetrica: 'Agenda web 24/7 • Dirección y .ics en ticket • Feriados 2026 por mes',
    clientFeatures: [
      { icon: 'touch_app', title: 'Agenda web autónoma sin registros ni apps', desc: 'Reserva ágil desde el celular en pasos simples con horarios reales en vivo.' },
      { icon: 'payments', title: 'Seña configurable por servicio a tu Alias', desc: 'Podés exigir seña en prestaciones clave o confirmar turnos directos sin seña.' },
      { icon: 'confirmation_number', title: 'Ticket Online con dirección y calendario (.ics)', desc: 'Incluye dirección del local, código QR y autogestión de cita en 1 clic.' }
    ],
    adminFeatures: [
      { icon: 'calendar_month', title: 'Panel de dueño y carga manual de citas', desc: 'Pausa o abre recepción al instante, acredita señas y edita duraciones.' },
      { icon: 'schedule', title: 'Turno partido y Feriados 2026 por mes', desc: 'Horarios de mañana y tarde con interruptor individual para abrir feriados puntuales.' },
      { icon: 'notifications_active', title: 'Recordatorios WhatsApp y vinculación QR', desc: 'Avisos automáticos 24h / 2h antes con tu propia línea vinculada.' }
    ]
  },
  l2: {
    badge: 'Nivel 2: Central Pro • CRM & Contactos',
    themeBadge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    architecture: 'Central Operativa • CRM & Contactos • Bloqueos y Vacaciones',
    microMetrica: 'Importación desde celular • Email y Cumpleaños • Papelera restaurable',
    clientFeatures: [
      { icon: 'verified', title: 'Todo lo de Nivel 1 con confirmación ágil', desc: 'Ticket Online con dirección del local, bloqueo en vivo y autogestión.' },
      { icon: 'notifications_active', title: 'Recordatorios WhatsApp y cobro directo', desc: 'Plantillas configurables, validación de seña y avisos automáticos.' }
    ],
    adminFeatures: [
      { icon: 'contacts', title: 'CRM & Contactos desde la agenda del celular', desc: 'Importa desde el celular o .vcf/.csv con Email y Fecha de Cumpleaños.' },
      { icon: 'shield', title: 'Bloqueo preventivo y papelera restaurable', desc: 'Restringe teléfonos cuando sea necesario y restaura fichas archivadas en 1 clic.' },
      { icon: 'event_busy', title: 'Historial de precios, bloqueos y vacaciones', desc: 'Control de ajustes de tarifas, cierres especiales y slots bloqueados.' }
    ]
  },
  l3: {
    badge: 'Nivel 3: Multi-Equipo • Staff, Boxes y 2hs',
    themeBadge: 'bg-amber-50 text-amber-800 border-amber-200',
    architecture: 'Multi-Staff • Horarios Partidos (Mañana / Tarde) • Confirmación 2hs',
    microMetrica: 'Sillones y boxes • Agendas en paralelo • Confirmación 2hs activable',
    clientFeatures: [
      { icon: 'group_work', title: 'Selección de profesional o primer turno libre', desc: 'El cliente elige especialista preferido o la primera disponibilidad real.' },
      { icon: 'more_time', title: 'Duraciones personalizadas por servicio', desc: 'Cálculo exacto de bloques contiguos según la prestación elegida.' }
    ],
    adminFeatures: [
      { icon: 'groups', title: 'Multi-Staff con horarios partidos Mañana / Tarde', desc: 'Agendas individuales por profesional sincronizadas en tiempo real.' },
      { icon: 'meeting_room', title: 'Asignación de sillones, boxes o canchas', desc: 'Organización simultánea de consultorios, gabinetes, sillones o pistas.' },
      { icon: 'alarm_on', title: 'Confirmación y Liberación Automática (2 hs antes)', desc: 'Activable o pausable con un toque para confirmar citas y liberar huecos.' }
    ]
  }
};

export function renderStageValueZone(containerId, state) {
  const container = document.getElementById(containerId);
  if (!container || !state) return;

  const curLvlId = state.currentLevel || 'l2';
  const matrix = LEVEL_MATRIX_V16[curLvlId] || LEVEL_MATRIX_V16.l2;

  container.innerHTML = `
    <div class="space-y-4">
      <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4 relative overflow-hidden">
        <div class="pb-3 border-b border-slate-100 flex items-center justify-between">
          <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full font-mono border ${matrix.themeBadge}">
            ${matrix.badge.split('•')[0].trim()}
          </span>
        </div>

        <p class="text-[11px] text-slate-500 font-medium leading-tight">
          ${matrix.architecture}
        </p>

        <!-- Bloque 1: Para tus Clientes -->
        <div class="space-y-2 pt-1 border-t border-slate-100">
          <div class="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider font-headline">
            <span class="material-symbols-outlined text-sm text-indigo-600">smartphone</span>
            <span>Para tus Clientes</span>
          </div>
          <ul class="space-y-2.5">
            ${matrix.clientFeatures.map(item => `
              <li class="flex items-start gap-2.5 text-xs">
                <span class="material-symbols-outlined text-indigo-600 text-sm mt-0.5 shrink-0 select-none">${item.icon}</span>
                <div class="leading-snug">
                  <strong class="text-slate-900 block font-semibold text-xs">${item.title}</strong>
                  <span class="text-slate-600 text-[11px]">${item.desc}</span>
                </div>
              </li>
            `).join('')}
          </ul>
        </div>

        <!-- Bloque 2: Tu Panel de Control (/admin) -->
        <div class="space-y-2 pt-3 border-t border-slate-100">
          <div class="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider font-headline">
            <span class="material-symbols-outlined text-sm text-emerald-600">admin_panel_settings</span>
            <span>Tu Panel de Control (/admin)</span>
          </div>
          <ul class="space-y-2.5">
            ${matrix.adminFeatures.map(item => `
              <li class="flex items-start gap-2.5 text-xs">
                <span class="material-symbols-outlined text-emerald-600 text-sm mt-0.5 shrink-0 select-none">${item.icon}</span>
                <div class="leading-snug">
                  <strong class="text-slate-900 block font-semibold text-xs">${item.title}</strong>
                  <span class="text-slate-600 text-[11px]">${item.desc}</span>
                </div>
              </li>
            `).join('')}
          </ul>
        </div>

        <!-- Micro-Métrica en Trastienda -->
        <div class="pt-3 border-t border-slate-100">
          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2">
            <span class="material-symbols-outlined text-emerald-600 text-sm shrink-0">insights</span>
            <p class="text-[11px] font-mono font-medium text-slate-700 leading-tight">
              ${matrix.microMetrica}
            </p>
          </div>
        </div>
      </div>

      <!-- Botón de Conversión Inmediatamente Accesible -->
      <div class="pt-1">
        <button
          type="button"
          onclick="window.activateFromShowroom && window.activateFromShowroom('${state.currentRubro}', '${curLvlId}')"
          class="w-full py-4 px-6 rounded-2xl btn-aura-cta font-headline font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg group cursor-pointer"
        >
          <span>Activar este Turnero por $4.999*</span>
          <span class="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </button>
        <p class="text-[11px] text-center text-slate-500 mt-2 font-medium">
          *Promoción Mes Fundador (primer mes para cualquier nivel). Luego abono regular según nivel.
        </p>
      </div>
    </div>
  `;
}
