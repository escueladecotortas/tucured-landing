// Archivo: js/showcase_v11/showcase_benefits.js
/**
 * ⚡ TucuRed Showcase v11.1 - Columna de Ventajas & Vista Diferenciada L1/L2/L3 (Aura Design System)
 * Burbuja WhatsApp reactiva con sincronización en tiempo real y Material Symbols.
 */

export const ShowcaseBenefits = {
  render(containerId, state) {
    const container = document.getElementById(containerId);
    if (!container || !state) return;

    const curLvl = state.levels[state.currentLevel];
    const curRubro = state.rubros[state.currentRubro];

    container.innerHTML = `
      <div class="flex flex-col gap-3.5">
        
        <!-- Checklist Card Oficial Stitch -->
        <div class="bg-surface-container-low/80 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-white/5 shadow-lg relative overflow-hidden group">
          <div class="absolute -right-10 -top-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
          
          <h3 class="text-sm sm:text-base font-bold font-display text-on-surface mb-3 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-xl">verified</span>
            <span>Ventajas del ${curLvl.name}</span>
          </h3>

          <ul class="flex flex-col gap-2.5 text-xs text-on-surface-variant leading-relaxed">
            ${curLvl.benefits.map(b => `
              <li class="flex items-start gap-2">
                <span class="material-symbols-outlined text-secondary mt-0.5 text-sm shrink-0" style="font-variation-settings: 'FILL' 1;">check_circle</span>
                <span>${b}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <!-- Vista Diferenciada por Nivel (Reactiva en Tiempo Real) -->
        ${this.renderLevelFeatureCard(state, curRubro)}

        <!-- Acciones Comerciales & Motor Dinámico con Iconos SVG -->
        <div class="flex flex-col gap-2 pt-0.5">
          <button 
            type="button"
            onclick="window.activateFromShowroom && window.activateFromShowroom('${state.currentRubro}', '${state.currentLevel}')"
            class="w-full bg-gold-gradient text-[#0f0f10] font-bold text-xs py-3 rounded-xl shadow-[0_4px_20px_rgba(212,175,55,0.2)] hover:opacity-90 transition-opacity flex justify-center items-center gap-2 cursor-pointer"
          >
            <span class="material-symbols-outlined text-base">rocket_launch</span>
            <span>Quiero este Turnero en mi negocio</span>
          </button>

          <a 
            href="https://wa.me/5493815551234?text=Hola,%20quiero%20probar%20el%20panel%20de%20administracion%20del%20${encodeURIComponent(curLvl.name)}%20para%20${encodeURIComponent(curRubro.name)}" 
            target="_blank"
            rel="noopener noreferrer"
            class="w-full bg-surface-container hover:bg-surface-variant text-primary font-semibold text-xs py-2.5 rounded-xl border border-primary/20 hover:border-primary/50 transition-all flex justify-center items-center gap-2 cursor-pointer"
          >
            <span class="material-symbols-outlined text-base">${curLvl.adminIcon || 'settings'}</span>
            <span>${curLvl.adminButtonLabel}</span>
          </a>
        </div>

      </div>
    `;
  },

  renderLevelFeatureCard(state, rubro) {
    const serviceName = state.currentLevel === 'l3' && rubro.catalogL3 ? rubro.catalogL3[state.selectedOption || 0].name : rubro.options[state.selectedOption || 0];
    const clientName = `${state.clientFirstName} ${state.clientLastName}`.trim() || 'Martín Rodríguez';
    const dayLabel = state.getSelectedDayLabel();

    if (state.currentLevel === 'l1') {
      return `
        <div class="bg-surface-container-low/80 backdrop-blur-xl rounded-2xl p-4 border border-white/5 shadow-lg flex flex-col gap-2.5">
          <h4 class="text-xs sm:text-sm font-bold font-display text-on-surface flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-base">notifications_active</span>
            <span>Mensaje listo en tu WhatsApp</span>
          </h4>
          <div class="bg-[#0b141a] rounded-xl p-3 border border-white/5 flex flex-col gap-2 shadow-inner">
            <div class="text-center text-[10px] text-white/40 uppercase tracking-wider font-mono">Hoy</div>
            <div class="bg-[#005c4b] text-[#e9edef] p-3 rounded-2xl rounded-tr-xs max-w-[88%] ml-auto text-xs shadow-sm border border-white/5 whitespace-pre-line leading-relaxed transition-all">
              ${state.getFormattedWhatsAppMessage()}
              <div class="text-[10px] text-white/70 text-right mt-1.5 flex justify-end items-center gap-1">
                <span>10:42 AM</span>
                <span class="material-symbols-outlined text-sm text-[#53bdeb]">done_all</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    if (state.currentLevel === 'l2') {
      return `
        <div class="bg-surface-container-low/80 backdrop-blur-xl rounded-2xl p-4 border border-white/5 shadow-lg flex flex-col gap-2.5">
          <h4 class="text-xs sm:text-sm font-bold font-display text-on-surface flex items-center gap-2">
            <span class="material-symbols-outlined text-secondary text-base">confirmation_number</span>
            <span>Comprobante Digital & Autogestión</span>
          </h4>
          <div class="bg-surface-container-lowest rounded-xl p-3.5 border border-white/10 space-y-2">
            <div class="flex justify-between items-center pb-2 border-b border-white/5">
              <span class="text-xs font-bold text-secondary">✓ Reserva Confirmada</span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-primary-container/20 text-primary font-bold">#TK-84B2</span>
            </div>
            <div class="text-xs text-on-surface-variant space-y-1">
              <p class="text-on-surface font-semibold">${rubro.bizName} • ${serviceName}</p>
              <p class="text-white">${dayLabel} • ${state.selectedTime} hs</p>
              <p class="text-[11px] text-white/60">Cliente: <span class="text-white">${clientName}</span></p>
              ${rubro.requireInsurance ? `<p class="text-[11px] text-[#2dd4bf]">Cobertura: <span class="text-white">${state.clientInsurance || 'OSDE'}</span></p>` : ''}
              <p class="text-[11px] text-primary">El cliente autogestiona o cancela su turno con 1 clic</p>
            </div>
            <div class="pt-1 flex gap-2">
              <span class="w-full py-1.5 rounded-lg text-center text-[10px] font-medium bg-surface-container text-on-surface border border-white/5">Agendar en mi Calendario</span>
            </div>
          </div>
        </div>
      `;
    }

    // Nivel 3: Agenda Multi-Staff en Vivo
    const curStaff = rubro.staff[state.selectedStaff || 0];
    return `
      <div class="bg-surface-container-low/80 backdrop-blur-xl rounded-2xl p-4 border border-white/5 shadow-lg flex flex-col gap-2.5">
        <h4 class="text-xs sm:text-sm font-bold font-display text-on-surface flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-base">calendar_view_week</span>
          <span>Agenda Multi-Staff en Tiempo Real</span>
        </h4>
        <div class="bg-surface-container-lowest rounded-xl p-3 border border-white/10 space-y-2">
          <div class="grid grid-cols-2 gap-2 text-center text-[10px]">
            <div class="p-2 rounded-lg bg-surface-container border border-white/5 ${state.selectedStaff === 0 ? 'border-primary/40 bg-primary/10' : ''}">
              <p class="font-bold text-primary">${rubro.staff[0]}</p>
              <span class="text-[9px] text-secondary font-semibold">● 3 Turnos Ocupados</span>
            </div>
            <div class="p-2 rounded-lg bg-surface-container border border-white/5 ${state.selectedStaff === 1 ? 'border-primary/40 bg-primary/10' : ''}">
              <p class="font-bold text-primary">${rubro.staff[1]}</p>
              <span class="text-[9px] text-secondary font-semibold">● 2 Libres</span>
            </div>
          </div>
          <div class="text-[10px] text-white/70 text-center pt-1 border-t border-white/5">
            Turno seleccionado con <span class="font-semibold text-primary">${curStaff}</span> (${serviceName})
          </div>
        </div>
      </div>
    `;
  }
};
