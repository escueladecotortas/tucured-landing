// Archivo: js/showcase_v11/showcase_admin_preview.js
/**
 * ⚡ TucuRed Showcase v11.1 - Previsualización de Trastienda /Admin (Aura Light)
 * Sincronizado con Matriz v16: L1 (Switch + Señas), L2 (+Turno Mostrador + CRM), L3 (Multi-Staff + Cron T-2hs).
 * Restricción estricta: < 200 líneas (< 175L) y Protocolo PEAC.
 */

function renderHeader(badgeText, badgeColor) {
  return `
    <div class="flex items-center justify-between pb-2 border-b border-slate-200">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span class="text-xs font-mono font-bold text-emerald-700">/admin en línea</span>
      </div>
      <span class="text-[9px] font-extrabold px-2 py-0.5 rounded-md ${badgeColor} font-mono">${badgeText}</span>
    </div>
  `;
}

function renderL1View() {
  return `
    <div class="p-4 flex flex-col justify-between flex-1 space-y-3 bg-slate-50 text-slate-900">
      ${renderHeader('L1 • AUTÓNOMO V16', 'bg-sky-50 text-sky-700 border border-sky-200')}
      <div class="flex items-center justify-between p-2 rounded-xl bg-emerald-50 border border-emerald-200 shadow-2xs">
        <div class="flex items-center gap-1.5 text-[11px] font-bold text-emerald-900">
          <span class="material-symbols-outlined text-xs text-emerald-600">radio_button_checked</span>
          <span>Recepción Online: Abierta</span>
        </div>
        <span class="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-600 text-white select-none">[ON] Abierta</span>
      </div>
      <div class="grid grid-cols-3 gap-2 text-center">
        <div class="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs"><p class="text-[8px] text-slate-500 font-mono font-bold">CITAS HOY</p><p class="text-xs font-black text-slate-900 font-mono">6 Citas</p></div>
        <div class="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs"><p class="text-[8px] text-slate-500 font-mono font-bold">SEÑAS HOY</p><p class="text-xs font-black text-emerald-600 font-mono">$15.000</p></div>
        <div class="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs"><p class="text-[8px] text-slate-500 font-mono font-bold">BBDD MULTI</p><p class="text-xs font-black text-sky-600 font-mono">OK</p></div>
      </div>
      <div class="space-y-1.5 flex-1 text-xs">
        <div class="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div><p class="font-bold text-slate-900 text-[11px]">16:30 • Martín Rodríguez</p><p class="text-[9px] text-slate-500 font-mono">#TK-4821 • Seña $7.500 acreditada</p></div>
          <span class="px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-100 text-emerald-800">Confirmado</span>
        </div>
        <div class="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div><p class="font-bold text-slate-900 text-[11px]">17:30 • Sofía Álvarez</p><p class="text-[9px] text-slate-500 font-mono">#TK-9304 • Esperando Seña (Alias)</p></div>
          <span class="px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-100 text-amber-800">Pendiente</span>
        </div>
      </div>
      <div class="p-2 rounded-xl bg-sky-50 border border-sky-200/80 text-sky-900 text-[10px] text-center font-mono font-medium">Base tucured-clients conectada • Bloqueo en vivo • Cancelación en 1 clic</div>
    </div>
  `;
}

function renderL2View() {
  return `
    <div class="p-4 flex flex-col justify-between flex-1 space-y-3 bg-slate-50 text-slate-900">
      ${renderHeader('L2 • CENTRAL PRO V16', 'bg-indigo-50 text-indigo-700 border border-indigo-200')}
      <div class="flex items-center justify-between">
        <span class="text-[10px] font-mono font-bold text-slate-500">AGENDA & MOSTRADOR</span>
        <button type="button" class="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-bold shadow-xs hover:bg-indigo-700 transition-colors flex items-center gap-1 select-none">
          <span class="material-symbols-outlined text-xs">add</span><span>+ Turno Mostrador</span>
        </button>
      </div>
      <div class="grid grid-cols-3 gap-2 text-center">
        <div class="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs"><p class="text-[8px] text-slate-500 font-mono font-bold">HOY</p><p class="text-xs font-black text-slate-900 font-mono">8 Citas</p></div>
        <div class="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs"><p class="text-[8px] text-slate-500 font-mono font-bold">OCUPACIÓN</p><p class="text-xs font-black text-indigo-600 font-mono">92%</p></div>
        <div class="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs"><p class="text-[8px] text-slate-500 font-mono font-bold">CRM STATUS</p><p class="text-xs font-black text-emerald-600 font-mono">Activo</p></div>
      </div>
      <div class="space-y-1.5 flex-1 text-xs">
        <div class="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div><div class="flex items-center gap-1.5"><p class="font-bold text-slate-900 text-[11px]">16:30 • Juan Pérez</p><span class="px-1.5 py-0.2 rounded text-[8px] font-bold bg-amber-100 text-amber-800 border border-amber-200">★ VIP</span></div><p class="text-[9px] text-slate-500 font-mono">#TK-84B2 • Autogestión Activa</p></div>
          <span class="px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-100 text-emerald-800">Confirmado</span>
        </div>
        <div class="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div><div class="flex items-center gap-1.5"><p class="font-bold text-slate-900 text-[11px]">17:30 • Carlos Sosa</p><span class="px-1.5 py-0.2 rounded text-[8px] font-bold bg-rose-100 text-rose-800 border border-rose-200">Lista Negra</span></div><p class="text-[9px] text-slate-500 font-mono">Bloqueo Preventivo • No-Show</p></div>
          <span class="px-2 py-0.5 rounded-md text-[9px] font-bold bg-rose-50 text-rose-700">Rechazado</span>
        </div>
      </div>
      <div class="p-2 rounded-xl bg-indigo-50 border border-indigo-200/80 text-indigo-900 text-[10px] text-center font-mono font-medium">Gobernanza CRM Anti-No-Show • Carga de Mostrador • Gateway WhatsApp</div>
    </div>
  `;
}

function renderL3View() {
  return `
    <div class="p-4 flex flex-col justify-between flex-1 space-y-3 bg-slate-50 text-slate-900">
      ${renderHeader('L3 • MULTI-EQUIPO V16', 'bg-amber-50 text-amber-800 border border-amber-200')}
      <div class="flex items-center justify-between p-2 rounded-xl bg-amber-50 border border-amber-200 shadow-2xs">
        <div class="flex items-center gap-1.5 text-[11px] font-bold text-amber-900">
          <span class="material-symbols-outlined text-amber-600 text-xs">alarm_on</span><span>Barredora Cron T-2hs</span>
        </div>
        <span class="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-600 text-white animate-pulse">⚡ Cron T-2hs Activo</span>
      </div>
      <div class="grid grid-cols-3 gap-2 text-center">
        <div class="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs"><p class="text-[8px] text-slate-500 font-mono font-bold">STAFF</p><p class="text-xs font-black text-amber-600 font-mono">3 Activos</p></div>
        <div class="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs"><p class="text-[8px] text-slate-500 font-mono font-bold">FACTURADO</p><p class="text-xs font-black text-emerald-600 font-mono">$142.000</p></div>
        <div class="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs"><p class="text-[8px] text-slate-500 font-mono font-bold">RECURSOS</p><p class="text-xs font-black text-indigo-600 font-mono">En Línea</p></div>
      </div>
      <div class="space-y-1.5 flex-1 text-xs">
        <div class="flex items-center justify-between text-[10px] text-slate-500 font-mono font-bold"><span>STAFF 1: Franco (Sillón 1)</span><span>STAFF 2: Lucas (Sillón 2)</span></div>
        <div class="grid grid-cols-2 gap-1.5">
          <div class="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs"><p class="font-bold text-slate-900 text-[10px]">16:30 • #TK-109A</p><p class="text-[8px] text-slate-500">Corte + Barba (45 min)</p><span class="inline-block mt-1 px-1.5 py-0.2 rounded text-[8px] font-bold bg-amber-100 text-amber-800">En Curso</span></div>
          <div class="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs"><p class="font-bold text-slate-900 text-[10px]">17:15 • #TK-332B</p><p class="text-[8px] text-slate-500">Aviso T-2hs OK</p><span class="inline-block mt-1 px-1.5 py-0.2 rounded text-[8px] font-bold bg-emerald-100 text-emerald-800">Notificado</span></div>
        </div>
      </div>
      <div class="p-2 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-[10px] text-center font-mono font-medium">3 Profesionales en simultáneo • Multi-Recurso • Barredora Cron T-2hs activa</div>
    </div>
  `;
}

export function renderAdminPreview(state, curRubro, curLvl) {
  const lvlId = state.currentLevel || 'l2';
  if (lvlId === 'l1') return renderL1View();
  if (lvlId === 'l3') return renderL3View();
  return renderL2View();
}
