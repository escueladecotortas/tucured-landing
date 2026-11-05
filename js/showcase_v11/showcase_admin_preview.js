// Archivo: js/showcase_v11/showcase_admin_preview.js
/**
 * ⚡ TucuRed Showcase v11.1 - Previsualización de Trastienda /Admin (Aura Light)
 * Panel de dueño en piel clara con métricas operativas canónicas Matriz v16.
 * Restricción estricta: < 200 líneas (< 150L) y Protocolo PEAC.
 */

export function renderAdminPreview(state, curRubro, curLvl) {
  const lvlId = state.currentLevel || 'l2';

  const ADMIN_METRICS = {
    l1: {
      badge: 'L1 • AUTÓNOMO V16',
      micro: 'Base multitenant tucured-clients conectada • Bloqueo en tiempo real • Cancelación en 1 clic',
      kpis: [
        { label: 'HOY', val: '6 Turnos', color: 'text-emerald-600' },
        { label: 'OCUPACIÓN', val: '85%', color: 'text-indigo-600' },
        { label: 'BBDD', val: 'Conectada', color: 'text-emerald-600', isLive: true }
      ],
      turnos: [
        { time: '16:30', client: 'Martín Gómez', detail: '#TK-4821 • Seña Acreditada ($7.500)', badge: 'Confirmado', badgeCls: 'bg-emerald-100 text-emerald-800' },
        { time: '17:30', client: 'Sofía Álvarez', detail: '#TK-9304 • Esperando Seña (Alias tucured.mp)', badge: 'Pendiente', badgeCls: 'bg-amber-100 text-amber-800' }
      ]
    },
    l2: {
      badge: 'L2 • CENTRAL PRO V16',
      micro: '8 Turnos Confirmados • Ocupación 92% • Gobernanza CRM Anti-No-Show activa',
      kpis: [
        { label: 'HOY', val: '8 Turnos', color: 'text-emerald-600' },
        { label: 'OCUPACIÓN', val: '92%', color: 'text-indigo-600' },
        { label: 'SEÑAS', val: '$48.000', color: 'text-sky-600' }
      ],
      turnos: [
        { time: '16:30', client: 'Juan Pérez', detail: '#TK-84B2 • Autogestión y Portal de Cancelación', badge: 'Confirmado', badgeCls: 'bg-emerald-100 text-emerald-800' },
        { time: '17:30', client: 'Mateo Ruiz', detail: '#TK-77C1 • Gateway Baileys • WhatsApp OK', badge: 'En Curso', badgeCls: 'bg-indigo-100 text-indigo-800' }
      ]
    },
    l3: {
      badge: 'L3 • MULTI-EQUIPO V16',
      micro: '3 Profesionales en simultáneo • Facturación acumulada • Cron T-2hs activo',
      kpis: [
        { label: 'STAFF', val: '3 Activos', color: 'text-amber-600' },
        { label: 'FACTURACIÓN', val: '$142.000', color: 'text-emerald-600' },
        { label: 'CRON T-2HS', val: 'En Línea', color: 'text-emerald-600', isLive: true }
      ],
      turnos: [
        { time: '16:30', client: 'Franco (Sillón 1)', detail: '#TK-109A • Corte + Barba (60 min contiguos)', badge: 'En Curso', badgeCls: 'bg-amber-100 text-amber-800' },
        { time: '17:30', client: 'Lucas (Sillón 2)', detail: '#TK-332B • Recordatorio Cron T-2hs despachado', badge: 'Avisado', badgeCls: 'bg-emerald-100 text-emerald-800' }
      ]
    }
  };

  const adm = ADMIN_METRICS[lvlId] || ADMIN_METRICS.l2;

  return `
    <div class="p-4 flex flex-col justify-between flex-1 space-y-3.5 bg-slate-50 text-slate-900">
      <!-- Header de la Trastienda con Badge de Nivel -->
      <div class="flex items-center justify-between pb-2.5 border-b border-slate-200">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="text-xs font-mono font-bold text-emerald-700">/admin en línea</span>
        </div>
        <span class="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
          ${adm.badge}
        </span>
      </div>

      <!-- KPIs Operativos del Nivel -->
      <div class="grid grid-cols-3 gap-2 text-center">
        ${adm.kpis.map(k => `
          <div class="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <p class="text-[8px] text-slate-500 font-mono font-bold tracking-wider">${k.label}</p>
            <p class="text-xs sm:text-sm font-black ${k.color} font-mono flex items-center justify-center gap-1">
              ${k.isLive ? '<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>' : ''}
              <span>${k.val}</span>
            </p>
          </div>
        `).join('')}
      </div>

      <!-- Lista Rápida de Próximos Turnos de la Trastienda -->
      <div class="space-y-1.5 flex-1">
        <div class="flex items-center justify-between text-[10px] text-slate-500 font-mono font-bold">
          <span>AGENDA • ${curRubro.name.toUpperCase()}</span>
          <span>HOY</span>
        </div>
        <div class="space-y-1.5 text-xs">
          ${adm.turnos.map(t => `
            <div class="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <p class="font-bold text-slate-900 text-[11px]">${t.time} • ${t.client}</p>
                <p class="text-[9px] text-slate-500">${t.detail}</p>
              </div>
              <span class="px-2 py-0.5 rounded-md text-[9px] font-bold ${t.badgeCls}">${t.badge}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Micro-Métrica Canónica v16.0 -->
      <div class="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200/80 text-indigo-900 text-[10px] leading-relaxed text-center font-mono font-medium">
        ${adm.micro}
      </div>
    </div>
  `;
}
