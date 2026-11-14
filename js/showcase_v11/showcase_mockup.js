// Archivo: js/showcase_v11/showcase_mockup.js
/**
 * ⚡ TucuRed Showcase v11.1 - Mockup Smartphone Central Protagonista (Aura Light)
 * Flujo de 4 Pasos Canónicos, erradicación de redirecciones externas y Sandbox Local-First (< 160L).
 */

import { getActiveCatalogServices } from './showcase_state.js';
import { ShowcaseTemplatesL1 } from './showcase_templates_l1.js';
import { ShowcaseTemplatesL2 } from './showcase_templates_l2.js';
import { ShowcaseTemplatesL3 } from './showcase_templates_l3.js';
import { ShowcaseSelfServiceL2 } from './showcase_self_service_l2.js';
import { renderAdminPreview } from './showcase_admin_preview.js';
import { buildStep4WaUrl } from './showcase_booking_sync.js';

export const ShowcaseMockup = {
  render(containerId, state) {
    const container = document.getElementById(containerId);
    if (!container || !state) return;

    const curRubro = state.rubros[state.currentRubro] || state.rubros.barberia;
    const curLvl = state.levels[state.currentLevel] || state.levels.l2;
    const isAdmin = state.viewMode === 'admin';

    container.innerHTML = `
      <div class="flex flex-col items-center w-full max-w-[390px] mx-auto">
        <div class="w-full flex items-center justify-between p-1 rounded-2xl bg-slate-200/90 border border-slate-300/80 shadow-xs mb-3">
          <button type="button" onclick="window.ShowcaseCore ? window.ShowcaseCore.setViewMode('client') : window.ShowcaseState.setViewMode('client')" class="flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${!isAdmin ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}">
            <span class="material-symbols-outlined text-sm">smartphone</span><span>Ver Turnero del Cliente</span>
          </button>
          <button type="button" onclick="window.ShowcaseCore ? window.ShowcaseCore.setViewMode('admin') : window.ShowcaseState.setViewMode('admin')" class="flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${isAdmin ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}">
            <span class="material-symbols-outlined text-sm">tune</span><span>Ver Tu Panel de Dueño</span>
          </button>
        </div>

        <div class="relative w-full rounded-[2.5rem] border-[7px] border-slate-800 bg-slate-50 overflow-hidden shadow-2xl flex flex-col ring-1 ring-slate-900/10 min-h-[700px] transition-all duration-300">
          <div class="w-full h-full flex flex-col flex-1 animate-[fadeIn_0.25s_ease-out]">
            ${isAdmin ? renderAdminPreview(state, curRubro, curLvl) : this.renderClientView(state, curRubro, curLvl)}
          </div>
        </div>
      </div>
    `;
  },

  renderClientView(state, curRubro, curLvl) {
    return `
      <div class="h-36 sm:h-40 relative shrink-0 overflow-hidden bg-slate-100 rounded-t-[2.1rem]">
        <img src="${curRubro.heroImage}" alt="${curRubro.name}" class="w-full h-full object-cover object-center">
      </div>
      <div class="p-3.5 flex flex-col justify-between gap-3 overflow-y-auto no-scrollbar flex-1 bg-slate-50 text-slate-900">
        ${this.renderStepContent(state, curRubro, curLvl)}
      </div>
    `;
  },

  renderStepContent(state, rubro, lvl) {
    if (state.isSelfService) return ShowcaseSelfServiceL2.render(state, rubro);

    // PASO 1: Horarios y Días Operativos
    if (state.currentStep === 1) {
      if (state.currentLevel === 'l1') return ShowcaseTemplatesL1.render(rubro.id, state, rubro);
      if (state.currentLevel === 'l2') return ShowcaseTemplatesL2.render(rubro.id, state, rubro);
      return ShowcaseTemplatesL3.render(rubro.id, state, rubro);
    }

    // PASO 2: Datos de Contacto
    if (state.currentStep === 2) {
      return `
        <div class="space-y-2.5 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div class="flex items-center justify-between pb-1 border-b border-slate-100">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Paso 2 de 4</span>
            <span class="text-[10px] font-semibold text-indigo-600">Datos del Cliente</span>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-700 mb-0.5">WhatsApp de Contacto (Obligatorio)</label>
            <input type="tel" name="clientPhone" inputmode="numeric" maxlength="15" value="${state.clientPhone || '3815554321'}" oninput="window.ShowcaseCore.updateClientData('clientPhone', this.value, this)" class="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 outline-none">
          </div>
          <div class="grid grid-cols-2 gap-1.5">
            <div><label class="block text-[10px] font-bold text-slate-700 mb-0.5">Nombre</label><input type="text" name="clientFirstName" maxlength="40" value="${state.clientFirstName || 'Martín'}" oninput="window.ShowcaseCore.updateClientData('clientFirstName', this.value, this)" class="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 outline-none"></div>
            <div><label class="block text-[10px] font-bold text-slate-700 mb-0.5">Apellido</label><input type="text" name="clientLastName" maxlength="40" value="${state.clientLastName || 'Rodríguez'}" oninput="window.ShowcaseCore.updateClientData('clientLastName', this.value, this)" class="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 outline-none"></div>
          </div>
          ${rubro.requireInsurance ? `<div><label class="block text-[10px] font-bold text-[#0D9488] mb-0.5">Obra Social / Cobertura</label><select onchange="window.ShowcaseCore.updateClientData('clientInsurance', this.value, this)" class="w-full bg-slate-50 border border-slate-200 focus:border-teal-600 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 outline-none"><option value="OSDE">OSDE</option><option value="Swiss Medical">Swiss Medical</option><option value="Subsidio de Salud">Subsidio de Salud</option><option value="Particular">Particular</option></select></div>` : ''}
        </div>
        <div class="flex gap-2 mt-2">
          <button type="button" onclick="window.ShowcaseCore.prevStep()" class="w-1/3 py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 cursor-pointer">Volver</button>
          <button type="button" onclick="window.ShowcaseCore.nextStep()" class="flex-1 py-2 rounded-xl text-xs font-bold ${rubro.btnClass || 'bg-indigo-600 text-white'} flex items-center justify-center gap-1.5 cursor-pointer">
            <span>Continuar al Resumen</span><span class="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      `;
    }

    const isL3 = state.currentLevel === 'l3', isL1 = state.currentLevel === 'l1';
    const activeSrvs = getActiveCatalogServices(state, rubro);
    const serviceName = (activeSrvs[state.selectedOption || 0] || activeSrvs[0])?.name || rubro.options[state.selectedOption || 0] || 'Servicio';
    const clientName = `${state.clientFirstName || 'Martín'} ${state.clientLastName || 'Rodríguez'}`.trim();
    const dayLabel = state.getSelectedDayLabel();
    const phoneClean = (state.clientPhone || '3815554321').replace(/\D/g, '');

    // PASO 3: Resumen de Confirmación
    if (state.currentStep === 3) {
      return `
        <div class="space-y-2.5 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs animate-[fadeIn_0.25s_ease-out]">
          <div class="flex items-center justify-between pb-1.5 border-b border-slate-100">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Paso 3 de 4</span>
            <span class="text-[10px] font-semibold text-emerald-600">Resumen de Confirmación</span>
          </div>
          <div class="text-center py-0.5">
            <p class="text-[9px] uppercase tracking-widest text-slate-500 font-bold">${rubro.bizName}</p>
            <h5 class="text-xs font-bold text-slate-900">${serviceName}</h5>
          </div>
          <div class="rounded-xl bg-slate-50 border border-slate-200/80 p-2.5 space-y-1.5 text-[11px]">
            <div class="flex justify-between text-slate-600"><span>Fecha y Hora:</span><span class="text-slate-900 font-bold">${dayLabel} · ${state.selectedTime} hs</span></div>
            ${isL3 ? `<div class="flex justify-between text-slate-600"><span>Especialista:</span><span class="font-semibold text-slate-900">${rubro.staff[state.selectedStaff || 0]}</span></div>` : ''}
            ${rubro.requireInsurance ? `<div class="flex justify-between text-slate-600"><span>Cobertura:</span><span class="text-teal-700 font-medium">${state.clientInsurance || 'OSDE'}</span></div>` : ''}
            <div class="flex justify-between text-slate-600"><span>Cliente:</span><span class="text-slate-900 font-medium">${clientName}</span></div>
            <div class="flex justify-between text-slate-600"><span>WhatsApp:</span><span class="font-mono text-slate-900 font-medium">+${phoneClean}</span></div>
          </div>
          <div class="p-2 rounded-xl bg-indigo-50/70 border border-indigo-100 text-[10px] text-indigo-900 flex items-center gap-1.5">
            <span class="material-symbols-outlined text-xs text-indigo-600">verified_user</span>
            <span>Reserva garantizada · Bloqueo de horario en tiempo real</span>
          </div>
        </div>
        <div class="flex gap-2 mt-2">
          <button type="button" onclick="window.ShowcaseCore.prevStep()" class="w-1/3 py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 cursor-pointer">Volver</button>
          <button type="button" onclick="window.ShowcaseCore.confirmBooking()" class="flex-1 py-2 rounded-xl text-xs font-bold ${rubro.btnClass || 'bg-indigo-600 text-white'} flex items-center justify-center gap-1.5 cursor-pointer shadow-md">
            <span>Confirmar Reserva</span><span class="material-symbols-outlined text-sm">check</span>
          </button>
        </div>
      `;
    }

    // PASO 4: Ticket Digital Confirmado (#TK-XXXX)
    const rec = state.lastBookingRecord || {};
    const code = state.lastBookingCode || (isL3 ? 'TK-92C1' : (isL1 ? 'TK-71A0' : 'TK-84B2'));
    const needsDep = (Number(rec.depositAmount) || 0) > 0 && !rec.depositPaid;
    const statusBadge = needsDep
      ? `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">Pendiente Seña $${Number(rec.depositAmount).toLocaleString('es-AR')}</span>`
      : `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Turno Confirmado</span>`;
    const waHref = buildStep4WaUrl({ ...rec, id: code, client: clientName, service: serviceName, time: state.selectedTime }, state.currentLevel, rubro);

    return `
      <div class="space-y-2 text-center my-auto animate-[fadeIn_0.3s_ease-out]">
        <div class="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
          <span class="material-symbols-outlined text-lg">check_circle</span>
        </div>
        <h4 class="text-xs sm:text-sm font-bold text-slate-900 font-display tracking-tight">TURNO REGISTRADO EN AGENDA</h4>
        <div class="p-3 rounded-2xl bg-white border border-slate-200 text-left text-xs space-y-1.5 shadow-xs">
          <div class="text-center"><p class="text-[9px] uppercase tracking-widest text-slate-500 font-bold">${rubro.bizName}</p><h5 class="text-xs font-bold text-slate-900">${serviceName}</h5></div>
          <div class="flex items-center justify-center gap-1.5 flex-wrap my-1"><span class="font-mono text-xs tracking-wider font-bold bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200 text-slate-800">#${code}</span>${statusBadge}</div>
          <div class="border-t border-dashed border-slate-200 pt-1.5 space-y-1 text-[11px]">
            <div class="flex justify-between text-slate-600"><span>Fecha y Hora:</span><span class="text-slate-900 font-semibold">${dayLabel} · ${state.selectedTime} hs</span></div>
            ${isL3 ? `<div class="flex justify-between text-slate-600"><span>Especialista / Recurso:</span><span class="font-semibold text-slate-900">${rubro.staff[state.selectedStaff || 0]}</span></div>` : ''}
            ${rubro.requireInsurance ? `<div class="flex justify-between text-slate-600"><span>Cobertura:</span><span class="text-teal-700 font-medium">${state.clientInsurance || 'OSDE'}</span></div>` : ''}
            <div class="flex justify-between text-slate-600"><span>Cliente:</span><span class="text-slate-900 font-medium">${clientName}</span></div>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-1.5">
          <a href="/gestion_turno.html?token=${encodeURIComponent(code)}" target="_blank" rel="noopener" class="py-2 px-2 rounded-xl text-[11px] font-bold bg-[#800000] hover:bg-[#660000] text-white shadow-sm flex items-center justify-center gap-1"><span class="material-symbols-outlined text-xs">open_in_new</span><span>Ver Ticket Online</span></a>
          <a href="${waHref}" target="_blank" rel="noopener" class="py-2 px-2 rounded-xl text-[11px] font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm flex items-center justify-center gap-1"><span class="material-symbols-outlined text-xs">chat</span><span>Copia WhatsApp</span></a>
        </div>
        <button type="button" onclick="window.ShowcaseCore.addToCalendar()" class="w-full py-2 rounded-xl text-xs font-bold ${rubro.btnClass} shadow-md flex items-center justify-center gap-1.5 cursor-pointer"><span class="material-symbols-outlined text-sm">calendar_add_on</span><span>Agendar en mi Calendario</span></button>
        <button type="button" onclick="window.ShowcaseCore.toggleSelfService(true)" class="w-full py-1.5 rounded-xl text-[11px] font-medium bg-white border border-slate-200 text-slate-700 hover:text-slate-900 flex items-center justify-center gap-1 cursor-pointer"><span class="material-symbols-outlined text-xs">settings</span><span>Cancelar o Reprogramar Turno</span></button>
        <button type="button" onclick="window.ShowcaseCore.selectStep(1)" class="w-full py-1 rounded-xl text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 cursor-pointer flex items-center justify-center gap-1"><span class="material-symbols-outlined text-xs">refresh</span><span>Reiniciar Simulación</span></button>
      </div>
    `;
  }
};
