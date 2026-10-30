// Archivo: js/showcase_v11/showcase_mockup.js
/**
 * ⚡ TucuRed Showcase v11.1 - Smartphone Interactivo Stitch Parity (Aura Design System)
 * Teclado numérico, validación de inputs, preservación de foco y copys ergonómicos.
 */

import { ShowcaseTemplatesL1 } from './showcase_templates_l1.js';
import { ShowcaseTemplatesL2 } from './showcase_templates_l2.js';
import { ShowcaseTemplatesL3 } from './showcase_templates_l3.js';
import { ShowcaseSelfServiceL2 } from './showcase_self_service_l2.js';

export const ShowcaseMockup = {
  render(containerId, state) {
    const container = document.getElementById(containerId);
    if (!container || !state) return;

    const rubros = Object.values(state.rubros);
    const curRubro = state.rubros[state.currentRubro];
    const curLvl = state.levels[state.currentLevel];

    container.innerHTML = `
      <div class="flex flex-col items-center w-full max-w-[400px] mx-auto gap-2.5">
        <div class="rubro-tabs-container w-full">
          ${rubros.map(r => `
            <button 
              type="button" 
              data-showroom-rubro="${r.id}"
              data-rubro="${r.id}"
              onclick="window.ShowcaseCore.selectRubro('${r.id}')" 
              class="rubro-tab ${state.currentRubro === r.id ? 'active' : ''}"
            >
              <span class="material-symbols-outlined text-sm" style="color: ${r.accentColor};">${r.iconSymbol}</span>
              <span>${r.name}</span>
            </button>
          `).join('')}
        </div>
        <div class="showroom-mockup-viewport relative w-full rounded-[2rem] border-[6px] border-surface-container-high bg-background overflow-hidden shadow-2xl flex flex-col ring-1 ring-white/10 shadow-[0_0_40px_rgba(212,175,55,0.12)]">
          <div class="h-36 relative shrink-0">
            <img src="${curRubro.heroImage}" alt="${curRubro.bizName}" class="w-full h-full object-cover brightness-75">
            <div class="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
            <div class="absolute top-3 left-3.5"><span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container/80 backdrop-blur-md border border-white/10 text-[9px] font-bold tracking-widest uppercase" style="color: ${curRubro.accentColor};">${curRubro.badgeL1 || '★ DESTACADO'}</span></div>
            <div class="absolute bottom-2.5 left-3.5 right-3.5 flex justify-between items-end">
              <div>
                <h3 class="text-sm sm:text-base font-bold text-on-surface leading-tight font-display">${curRubro.bizName}</h3>
                <p class="text-[10px] text-on-surface-variant flex items-center gap-1 mt-0.5"><span class="material-symbols-outlined text-xs" style="color: ${curRubro.accentColor};">${curRubro.iconSymbol}</span><span>${curRubro.subCategory || curRubro.name}</span></p>
              </div>
            </div>
          </div>
          <div class="p-3.5 flex flex-col justify-between gap-3 overflow-y-auto no-scrollbar">
            ${this.renderStepContent(state, curRubro, curLvl)}
          </div>
        </div>
      </div>
    `;
  },

  renderStepContent(state, rubro, lvl) {
    if (state.currentStep === 1) {
      if (state.currentLevel === 'l1') return ShowcaseTemplatesL1.render(rubro.id, state, rubro);
      if (state.currentLevel === 'l2') return ShowcaseTemplatesL2.render(rubro.id, state, rubro);
      return ShowcaseTemplatesL3.render(rubro.id, state, rubro);
    }

    if (state.currentStep === 2) {
      const isL1 = state.currentLevel === 'l1';
      const isL3 = state.currentLevel === 'l3';
      const btnLabel = isL1 ? 'Enviar Reserva a WhatsApp' : (isL3 ? 'Confirmar Turno con Especialista' : 'Confirmar Reserva Web');
      const btnIcon = isL1 ? 'send' : 'arrow_forward';
      const submitAction = isL1 ? 'window.ShowcaseCore.submitL1WhatsApp()' : 'window.ShowcaseCore.nextStep()';

      return `
        <div class="space-y-2">
          <div>
            <label class="block text-[10px] font-semibold text-white/70 mb-0.5">WhatsApp de Contacto (Obligatorio)</label>
            <input type="tel" name="clientPhone" inputmode="numeric" pattern="[0-9]*" maxlength="15" value="${state.clientPhone || '3815554321'}" oninput="window.ShowcaseCore.updateClientData('clientPhone', this.value, this)" class="w-full bg-white/[0.04] border border-white/10 ${rubro.focusBorder || 'focus:border-primary'} rounded-xl px-2.5 py-1.5 text-xs text-white outline-none">
          </div>
          <div class="grid grid-cols-2 gap-1.5">
            <div>
              <label class="block text-[10px] font-semibold text-white/70 mb-0.5">Nombre</label>
              <input type="text" name="clientFirstName" maxlength="40" value="${state.clientFirstName || 'Martín'}" oninput="window.ShowcaseCore.updateClientData('clientFirstName', this.value, this)" class="w-full bg-white/[0.04] border border-white/10 ${rubro.focusBorder || 'focus:border-primary'} rounded-xl px-2.5 py-1.5 text-xs text-white outline-none">
            </div>
            <div>
              <label class="block text-[10px] font-semibold text-white/70 mb-0.5">Apellido</label>
              <input type="text" name="clientLastName" maxlength="40" value="${state.clientLastName || 'Rodríguez'}" oninput="window.ShowcaseCore.updateClientData('clientLastName', this.value, this)" class="w-full bg-white/[0.04] border border-white/10 ${rubro.focusBorder || 'focus:border-primary'} rounded-xl px-2.5 py-1.5 text-xs text-white outline-none">
            </div>
          </div>
          ${rubro.requireInsurance ? `
            <div>
              <label class="block text-[10px] font-semibold text-[#2dd4bf] mb-0.5">Obra Social / Cobertura Médica</label>
              <select onchange="window.ShowcaseCore.updateClientData('clientInsurance', this.value, this)" class="w-full bg-zinc-900 border border-[#2dd4bf]/40 focus:border-[#2dd4bf] rounded-xl px-2.5 py-1.5 text-xs text-white outline-none">
                <option value="OSDE" class="bg-zinc-900 text-white" ${state.clientInsurance === 'OSDE' ? 'selected' : ''}>OSDE</option>
                <option value="Swiss Medical" class="bg-zinc-900 text-white" ${state.clientInsurance === 'Swiss Medical' ? 'selected' : ''}>Swiss Medical</option>
                <option value="Subsidio de Salud" class="bg-zinc-900 text-white" ${state.clientInsurance === 'Subsidio de Salud' ? 'selected' : ''}>Subsidio de Salud</option>
                <option value="Particular" class="bg-zinc-900 text-white" ${state.clientInsurance === 'Particular' ? 'selected' : ''}>Particular (Sin Cobertura)</option>
              </select>
            </div>
          ` : ''}
        </div>
        <div class="flex gap-2 mt-3">
          <button type="button" onclick="window.ShowcaseCore.prevStep()" class="w-1/3 py-2 rounded-xl text-xs font-semibold bg-white/[0.04] text-white/70 border border-white/10 hover:bg-white/[0.08] cursor-pointer">Volver</button>
          <button type="button" onclick="${submitAction}" class="w-2/3 py-2 rounded-xl text-xs font-bold ${rubro.btnClass} shadow-md flex items-center justify-center gap-1.5 cursor-pointer"><span>${btnLabel}</span><span class="material-symbols-outlined text-sm">${btnIcon}</span></button>
        </div>
      `;
    }

    if (state.isSelfService) {
      return ShowcaseSelfServiceL2.render(state, rubro);
    }

    const isL3 = state.currentLevel === 'l3';
    const isL1 = state.currentLevel === 'l1';
    const token = isL3 ? '#TK-92C1' : '#TK-84B2';
    const serviceName = isL3 && rubro.catalogL3 ? rubro.catalogL3[state.selectedOption || 0].name : rubro.options[state.selectedOption || 0];
    const clientName = `${state.clientFirstName} ${state.clientLastName}`.trim() || 'Martín Rodríguez';
    const dayLabel = state.getSelectedDayLabel();

    return `
      <div class="space-y-2.5 text-center my-auto">
        <div class="w-9 h-9 rounded-full bg-secondary/15 text-secondary border border-secondary/30 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(65,229,117,0.2)]">
          <span class="material-symbols-outlined text-xl" style="font-variation-settings: 'FILL' 1;">check_circle</span>
        </div>
        <h4 class="text-xs sm:text-sm font-bold text-primary font-display tracking-tight">${isL1 ? '✓ RESERVA ENVIADA A WHATSAPP' : '✓ TURNO CONFIRMADO EN AGENDA'}</h4>
        <div class="p-3 rounded-xl bg-surface-container border border-white/5 text-left text-xs space-y-2 relative overflow-hidden">
          <div class="text-center"><p class="text-[9px] uppercase tracking-widest text-on-surface-variant">${rubro.bizName}</p><h5 class="text-xs font-bold text-white">${serviceName}</h5></div>
          ${!isL1 ? `<div class="flex justify-center my-1"><span class="font-mono text-sm tracking-wider font-bold bg-surface-container-low px-4 py-1.5 rounded-lg border border-white/10 shadow-inner" style="color: ${rubro.accentColor};">${token}</span></div>` : ''}
          <div class="border-t border-dashed border-white/10 pt-2 space-y-1 text-[11px]">
            <div class="flex justify-between text-on-surface-variant"><span>Fecha y Hora:</span><span class="text-white font-medium">${dayLabel} • ${state.selectedTime} hs</span></div>
            ${isL3 ? `<div class="flex justify-between text-on-surface-variant"><span>Especialista:</span><span class="font-semibold" style="color: ${rubro.accentColor};">${rubro.staff[state.selectedStaff || 0]}</span></div>` : ''}
            ${rubro.requireInsurance ? `<div class="flex justify-between text-on-surface-variant"><span>Cobertura:</span><span class="text-[#2dd4bf] font-medium">${state.clientInsurance || 'OSDE'}</span></div>` : ''}
            <div class="flex justify-between text-on-surface-variant"><span>Cliente:</span><span class="text-white font-medium">${clientName}</span></div>
          </div>
        </div>
        ${!isL1 ? `
          <button type="button" class="w-full py-2.5 rounded-xl text-xs font-bold ${rubro.btnClass} shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"><span class="material-symbols-outlined text-sm">calendar_add_on</span><span>Agendar en mi Calendario</span></button>
          <button type="button" onclick="window.ShowcaseCore.toggleSelfService(true)" class="w-full py-1.5 rounded-xl text-[11px] font-medium bg-transparent border border-white/10 text-on-surface-variant hover:text-white flex items-center justify-center gap-1 cursor-pointer"><span class="material-symbols-outlined text-xs">settings</span><span>✕ Cancelar o Reprogramar Turno</span></button>
          <p class="text-[10px] text-white/60 text-center flex items-center justify-center gap-1 pt-0.5"><span class="material-symbols-outlined text-xs text-secondary">chat</span><span>Recibirás la confirmación y recordatorio por WhatsApp previo a tu turno.</span></p>
        ` : `
          <button type="button" onclick="window.ShowcaseCore.selectStep(1)" class="w-full py-2.5 rounded-xl text-xs font-bold ${rubro.btnClass} shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"><span class="material-symbols-outlined text-sm">replay</span><span>Realizar Otra Simulación</span></button>
          <p class="text-[10px] text-white/70 text-center flex items-center justify-center gap-1 pt-0.5"><span class="material-symbols-outlined text-xs text-secondary">check_circle</span><span>✓ Tu mensaje está listo para ser enviado por WhatsApp al comercio.</span></p>
        `}
      </div>
      <button type="button" onclick="window.ShowcaseCore.selectStep(1)" class="w-full mt-1 py-1 rounded-xl text-[10px] font-bold bg-white/5 hover:bg-white/10 text-on-surface-variant hover:text-white border border-white/5 cursor-pointer">Reiniciar Simulación ↻</button>
    `;
  }
};
