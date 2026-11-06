// Archivo: js/components/stage_value_zone.js
/**
 * ⚡ Tucu Red Web V2 - Zona 3: Especificaciones Siempre Visibles (2 Bloques Canónicos) y CTA
 * Ficha técnica en 2 bloques: Para tus Clientes y Tu Panel de Control (/admin).
 * Restricción estricta: < 200 líneas (< 175L) y Protocolo PEAC.
 */

const LEVEL_MATRIX_V16 = {
  l1: {
    badge: 'Nivel 1: Autónomo • Turnero Express Completo v16.0',
    themeBadge: 'bg-sky-50 text-sky-700 border-sky-200',
    architecture: "Base Multitenant 'tucured-clients' • Bloqueo en Tiempo Real • Token Hash",
    microMetrica: 'Turnero autónomo listo • Bloqueo de colisiones • Cancelación en 1 clic',
    clientFeatures: [
      { icon: 'touch_app', title: 'Turnero web de 3 toques', desc: 'Reserva ágil desde el celular sin descargas ni contraseñas.' },
      { icon: 'block', title: 'Bloqueo automático de turnos ocupados en tiempo real', desc: 'Previene colisiones y solapamientos en vivo con base multitenant.' },
      { icon: 'confirmation_number', title: 'Ticket digital con código Hash #TK-XXXX', desc: 'Comprobante y portal de cancelación/autogestión en 1 clic.' }
    ],
    adminFeatures: [
      { icon: 'calendar_month', title: 'Agenda operativa en vivo y citas manuales', desc: 'Alta de mostrador, botón para pausar/abrir recepción y catálogo con duración.' },
      { icon: 'schedule', title: 'Turno partido (siesta) y feriados oficiales', desc: 'Horarios configurables con salteo automático de feriados nacionales.' },
      { icon: 'chat', title: 'WhatsApp oficial conectado vía Gateway', desc: 'Despacho directo de confirmaciones y cobro de seña al Alias oficial.' }
    ]
  },
  l2: {
    badge: 'Nivel 2: Central Pro • Gobernanza & Agenda v16.0',
    themeBadge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    architecture: 'Instancia de Alto Rendimiento • Turnos de Mostrador • CRM Anti-No-Show',
    microMetrica: '8 Turnos Confirmados • Ocupación 92% • Lista Negra activa',
    clientFeatures: [
      { icon: 'verified', title: 'Todo lo de Nivel 1 optimizado', desc: 'Bloqueo en vivo, comprobante Hash y enlace público de autogestión.' },
      { icon: 'notifications_active', title: 'Confirmación y recordatorios por WhatsApp', desc: 'Avisos directos sin fricción y validación de seña en línea.' }
    ],
    adminFeatures: [
      { icon: 'dashboard', title: 'SPA Administrativa avanzada de 3 vistas', desc: 'Control en tiempo real de agenda diaria, catálogo de precios y configuración.' },
      { icon: 'point_of_sale', title: 'Gestión ágil de turnos telefónicos y mostrador', desc: 'Carga inmediata de citas presenciales con bloqueo instantáneo.' },
      { icon: 'shield', title: 'Gobernanza CRM Anti-No-Show y Lista VIP', desc: 'Lista Negra para clientes ausentes y fidelización de clientes VIP.' }
    ]
  },
  l3: {
    badge: 'Nivel 3: Multi-Equipo • Franquicias & Recursos v16.0',
    themeBadge: 'bg-amber-50 text-amber-800 border-amber-200',
    architecture: 'Multi-Staff Ilimitado • Recursos Físicos • Barredora Cron T-2hs',
    microMetrica: '3 Profesionales en simultáneo • Facturación acumulada • Cron T-2hs activo',
    clientFeatures: [
      { icon: 'group_work', title: 'Selección de especialista o primer libre', desc: 'El cliente elige a su profesional preferido o el turno más próximo disponible.' },
      { icon: 'more_time', title: 'Cálculo de bloques contiguos por servicio', desc: 'Disponibilidad exacta según la duración acumulada del catálogo.' }
    ],
    adminFeatures: [
      { icon: 'groups', title: 'Múltiples profesionales con agendas individuales', desc: 'Horarios semanales diferenciados para staff, terapeutas o colaboradores.' },
      { icon: 'meeting_room', title: 'Modelado de recursos físicos por rubro', desc: 'Sillones, gabinetes, consultorios médicos o canchas deportivas.' },
      { icon: 'alarm_on', title: 'Barredora Cron automática T-2hs por WhatsApp', desc: 'Recordatorio desatendido con idempotencia 2 horas antes de cada cita.' }
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
          <span>Activar este Turnero por $1.000*</span>
          <span class="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </button>
        <p class="text-[11px] text-center text-slate-500 mt-2 font-medium">
          *Tarifa promocional mes de lanzamiento. Luego abono regular según nivel.
        </p>
      </div>
    </div>
  `;
}
