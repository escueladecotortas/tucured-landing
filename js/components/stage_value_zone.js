// Archivo: js/components/stage_value_zone.js
/**
 * ⚡ Tucu Red Web V2 - Zona 3: Especificaciones Siempre Visibles (Chau Acordeón) y CTA Directo
 * 3 Certezas técnicas 100% visibles en pantalla en todo momento y botón de activación directa.
 * Restricción estricta: < 200 líneas (< 180L) y Protocolo PEAC.
 */

const LEVEL_MATRIX_V16 = {
  l1: {
    badge: 'Nivel 1: Individual • Turnero Autónomo Completo v16.0',
    themeBadge: 'bg-sky-50 text-sky-700 border-sky-200',
    architecture: "Base Multitenant 'tucured-clients' • Bloqueo en Tiempo Real • Token Hash",
    microMetrica: 'Turnero autónomo listo • Bloqueo de colisiones • Cancelación en 1 clic',
    specs: [
      { icon: 'block', title: 'Bloqueo automático de turnos ocupados en tiempo real', desc: 'Evita colisiones y solapamientos garantizando disponibilidad en tiempo real.' },
      { icon: 'confirmation_number', title: 'Comprobante digital con enlace de autogestión', desc: 'Ticket con Hash #TK-XXXX y portal para consultar o cancelar en 1 clic.' },
      { icon: 'payments', title: 'Catálogo con duración variable y cobro de seña', desc: 'Precios, tiempos de atención por servicio y seña configurable al Alias oficial.' }
    ]
  },
  l2: {
    badge: 'Nivel 2: Central Operativa Pro • Gobernanza & Agenda v16.0',
    themeBadge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    architecture: 'Instancia de Alto Rendimiento • Turnos de Mostrador • CRM Anti-No-Show',
    microMetrica: '8 Turnos Confirmados • Ocupación 92% • Lista Negra activa',
    specs: [
      { icon: 'dashboard', title: 'Panel SPA Administrativo avanzado con 3 vistas', desc: 'Control en vivo de agenda diaria, catálogo de precios y configuración operativa.' },
      { icon: 'edit_calendar', title: 'Carga ágil de turnos manuales de mostrador', desc: 'Asignación rápida de turnos presenciales o telefónicos sin fricción.' },
      { icon: 'shield', title: 'CRM con Lista Negra Anti-No-Show y Lista VIP', desc: 'Gobernanza para erradicar ausencias reiteradas y fidelizar clientes VIP.' }
    ]
  },
  l3: {
    badge: 'Nivel 3: Para Equipos • Multi-Staff & Franquicias v16.0',
    themeBadge: 'bg-amber-50 text-amber-800 border-amber-200',
    architecture: 'Multi-Staff Ilimitado • Recursos Físicos • Barredora Cron T-2hs',
    microMetrica: '3 Profesionales en simultáneo • Facturación acumulada • Cron T-2hs activo',
    specs: [
      { icon: 'groups', title: 'Agendas independientes para múltiples profesionales', desc: 'Horarios semanales y agendas separadas para staff ilimitado y sucursales.' },
      { icon: 'meeting_room', title: 'Modelado de recursos físicos por rubro', desc: 'Gestión simultánea de sillones, gabinetes, consultorios médicos o canchas.' },
      { icon: 'alarm_on', title: 'Microservicio Cron T-2hs con aviso WhatsApp', desc: 'Recordatorio desatendido con idempotencia 2 horas antes de cada turno agendado.' }
    ]
  }
};

export function renderStageValueZone(containerId, state) {
  const container = document.getElementById(containerId);
  if (!container || !state) return;

  const curRubro = state.rubros[state.currentRubro] || state.rubros.barberia;
  const curLvlId = state.currentLevel || 'l2';
  const matrix = LEVEL_MATRIX_V16[curLvlId] || LEVEL_MATRIX_V16.l2;

  container.innerHTML = `
    <div class="space-y-4">
      <!-- Tarjeta de Especificaciones Técnicas 100% Visibles en Pantalla -->
      <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4 relative overflow-hidden">
        <div class="pb-3 border-b border-slate-100 flex items-center justify-between">
          <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full font-mono border ${matrix.themeBadge}">
            ${matrix.badge.split('•')[0].trim()}
          </span>
        </div>

        <p class="text-[11px] text-slate-500 font-medium leading-tight">
          ${matrix.architecture}
        </p>

        <!-- 3 Certezas Técnicas Siempre Visibles -->
        <ul class="space-y-3 pt-1">
          ${matrix.specs.map(sp => `
            <li class="flex items-start gap-3">
              <span class="material-symbols-outlined text-indigo-600 text-base mt-0.5 shrink-0">${sp.icon}</span>
              <div class="text-xs leading-relaxed">
                <strong class="text-slate-900 block font-semibold text-xs sm:text-sm mb-0.5">${sp.title}</strong>
                <span class="text-slate-600">${sp.desc}</span>
              </div>
            </li>
          `).join('')}
        </ul>

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
