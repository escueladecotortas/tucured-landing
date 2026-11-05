// Archivo: js/showcase_v11/showcase_self_service_l2.js
/**
 * ⚡ TucuRed Showcase v11.1 - Portal de Autogestión L2 & L3 (Aura Light)
 * Detalle del turno con especialista asignado, reprogramación interactiva y motivos de cancelación.
 * Restricción estricta: < 200 líneas (< 150L) y Protocolo PEAC.
 */

export const ShowcaseSelfServiceL2 = {
  render(state, rubro) {
    const reasons = ['Motivo Personal', 'Incompatibilidad Horaria', 'Otro'];
    const isL3 = state.currentLevel === 'l3';
    const token = isL3 ? '#TK-92C1' : '#TK-84B2';
    const serviceName = isL3 && rubro.catalogL3 ? rubro.catalogL3[state.selectedOption || 0].name : rubro.options[state.selectedOption || 0];
    const clientName = `${state.clientFirstName} ${state.clientLastName}`.trim() || 'Martín Rodríguez';
    const dayLabel = state.getSelectedDayLabel();

    return `
      <div class="space-y-2.5 text-left animate-[fadeIn_0.3s_ease-out] text-slate-900">
        
        <!-- Header con Badge de Autogestión -->
        <div class="text-center">
          <div class="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200/80 rounded-full px-3 py-0.5 mb-1">
            <span class="material-symbols-outlined text-xs text-indigo-600">settings</span>
            <span class="text-[9px] font-bold tracking-wider uppercase text-indigo-700">AUTOGESTIÓN DE RESERVA</span>
          </div>
          <h4 class="text-xs sm:text-sm font-bold text-slate-900 font-display">Detalle del Turno</h4>
        </div>

        <!-- Tarjeta de Turno Activo -->
        <div class="rounded-xl p-3 bg-white border border-slate-200 shadow-2xs space-y-2 relative overflow-hidden">
          <div class="flex justify-between items-start">
            <div>
              <h5 class="text-xs font-bold text-slate-900">${rubro.bizName}</h5>
              <p class="text-[10px] text-slate-500">${serviceName}</p>
            </div>
            <span class="font-mono text-xs font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-800">${token}</span>
          </div>
          <div class="border-t border-dashed border-slate-200 pt-2 space-y-1 text-[11px]">
            <div class="flex items-center gap-1.5 text-slate-800">
              <span class="material-symbols-outlined text-xs text-slate-400">calendar_month</span>
              <span>${dayLabel} • ${state.selectedTime} hs</span>
            </div>
            ${isL3 ? `
              <div class="flex items-center gap-1.5 text-slate-800">
                <span class="material-symbols-outlined text-xs text-indigo-600">badge</span>
                <span>${rubro.staff[state.selectedStaff || 0]}</span>
              </div>
            ` : ''}
            <div class="flex items-center gap-1.5 text-slate-800">
              <span class="material-symbols-outlined text-xs text-slate-400">person</span>
              <span>${clientName}</span>
            </div>
          </div>
          <div class="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
            <div class="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></div>
            <span class="text-[9px] font-semibold text-emerald-800">Confirmado en Agenda</span>
          </div>
        </div>

        <!-- Opción 1: Reprogramar Fecha y Hora -->
        <button type="button" onclick="window.ShowcaseCore.selectStep(1)" class="w-full rounded-xl p-2.5 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs flex items-center justify-between text-left cursor-pointer transition-colors group">
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
              <span class="material-symbols-outlined text-sm">event_repeat</span>
            </div>
            <div>
              <h6 class="text-xs font-semibold text-slate-900">Reprogramar Fecha y Hora</h6>
              <p class="text-[9px] text-slate-500">Elegir un nuevo horario disponible</p>
            </div>
          </div>
          <span class="material-symbols-outlined text-xs text-slate-400 group-hover:text-slate-700">chevron_right</span>
        </button>

        <!-- Opción 2: Cancelación de Turno -->
        <div class="rounded-xl p-2.5 bg-white border border-slate-200 shadow-2xs space-y-2">
          <div>
            <h6 class="text-xs font-semibold text-slate-900">Cancelar Turno</h6>
            <p class="text-[9px] text-slate-500">¿Por qué deseas cancelar?</p>
          </div>
          <div class="flex flex-wrap gap-1">
            ${reasons.map((rs, idx) => `
              <button type="button" onclick="window.ShowcaseCore.selectReason(${idx})" class="px-2.5 py-1 rounded-full text-[10px] font-medium border cursor-pointer transition-all ${state.selectedReason === idx ? 'border-slate-800 bg-slate-900 text-white font-bold' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'}">${rs}</button>
            `).join('')}
          </div>
          <button type="button" onclick="window.ShowcaseCore.cancelL2Turno()" class="w-full py-2 rounded-lg text-xs font-semibold border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
            <span class="material-symbols-outlined text-sm">close</span>
            <span>Cancelar Turno Definitivamente</span>
          </button>
        </div>

        <p class="text-[9px] text-slate-500 text-center leading-tight">
          Al cancelar, el horario se libera automáticamente en la agenda del comercio.
        </p>

        <button type="button" onclick="window.ShowcaseCore.toggleSelfService(false)" class="w-full py-1.5 rounded-xl text-[10px] font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1 cursor-pointer">
          <span class="material-symbols-outlined text-xs">arrow_back</span>
          <span>Volver al Comprobante</span>
        </button>

      </div>
    `;
  }
};
