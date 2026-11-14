// Archivo: js/showcase_v11/showcase_core.js
/**
 * ⚡ TucuRed Showcase v11.1 - Orquestador Central del Escenario 3 Zonas
 * Paginación semanal, conversión 4 pasos, Local-First y Protocolo PEAC (< 150L).
 */

import { ShowcaseState, preloadShowcaseAssets, getActiveCatalogServices } from './showcase_state.js';
import { ShowcaseLevels } from './showcase_levels.js';
import { ShowcaseMockup } from './showcase_mockup.js';
import { ShowcaseBenefits } from './showcase_benefits.js';
import { renderStageRubrosZone } from '../components/stage_rubros_zone.js';
import { renderStageValueZone } from '../components/stage_value_zone.js';
import { triggerSensoryFeedback } from '../utils/sound_fx.js';

export const ShowcaseCore = {
  _initialized: false,

  init() {
    if (!this._initialized) {
      ShowcaseState.subscribe(() => this.renderAll());
      this._initialized = true;
    }

    preloadShowcaseAssets();

    window.ShowcaseState = ShowcaseState;
    window.ShowcaseLevels = ShowcaseLevels;
    window.ShowcaseCore = {
      getState: () => ShowcaseState,
      selectLevel: (lvl) => { triggerSensoryFeedback(); ShowcaseState.setLevel(lvl); },
      selectRubro: (rubro) => { triggerSensoryFeedback(); ShowcaseState.setRubro(rubro); },
      setViewMode: (mode) => { triggerSensoryFeedback(); ShowcaseState.setViewMode(mode); },
      selectStep: (step) => { ShowcaseState.setSelfService(false); ShowcaseState.setStep(step); },
      selectOption: (optIdx) => { triggerSensoryFeedback(); ShowcaseState.selectedOption = optIdx; ShowcaseState.notify(); },
      selectStaff: (staffIdx) => { triggerSensoryFeedback(); ShowcaseState.selectedStaff = staffIdx; ShowcaseState.notify(); },
      selectDay: (dayIdx) => { triggerSensoryFeedback(); ShowcaseState.selectDay(dayIdx); },
      prevDayPage: () => { triggerSensoryFeedback(); ShowcaseState.prevDayPage(); },
      nextDayPage: () => { triggerSensoryFeedback(); ShowcaseState.nextDayPage(); },
      selectTime: (time) => { triggerSensoryFeedback(); ShowcaseState.selectedTime = time; ShowcaseState.notify(); },
      updateClientData: (field, val, inputEl) => {
        if (!field) return;
        let cleanVal = String(val || '');
        if (field === 'clientPhone') {
          cleanVal = cleanVal.replace(/\D/g, '').slice(0, 15);
          if (inputEl && inputEl.value !== cleanVal) inputEl.value = cleanVal;
        } else {
          cleanVal = cleanVal.replace(/[<>]/g, '').slice(0, 40);
          if (inputEl && inputEl.value !== cleanVal) inputEl.value = cleanVal;
        }
        ShowcaseState[field] = cleanVal;
        renderStageValueZone('stage-value-container', ShowcaseState);
      },
      selectReason: (reasonIdx) => { ShowcaseState.selectedReason = reasonIdx; ShowcaseState.notify(); },
      toggleSelfService: (show) => ShowcaseState.setSelfService(show),
      confirmBooking: () => { triggerSensoryFeedback(); ShowcaseState.setStep(4); },
      addToCalendar: () => {
        try {
          const s = ShowcaseState, r = s.rubros[s.currentRubro] || s.rubros.barberia;
          const activeSrvs = getActiveCatalogServices(s, r);
          const srv = (activeSrvs[s.selectedOption || 0] || activeSrvs[0])?.name || r.options[s.selectedOption || 0] || 'Servicio';
          const day = s.getSelectedDayLabel();
          const token = s.currentLevel === 'l3' ? '#TK-92C1' : (s.currentLevel === 'l1' ? '#TK-71A0' : '#TK-84B2');
          const ics = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//TucuRed//Turnero Autonomo//ES\r\nBEGIN:VEVENT\r\nSUMMARY:${srv} - ${r.bizName}\r\nDESCRIPTION:Turno ${token} para ${s.clientFirstName} ${s.clientLastName}. Fecha: ${day} a las ${s.selectedTime} hs.\r\nSTATUS:CONFIRMED\r\nEND:VEVENT\r\nEND:VCALENDAR`;
          const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8;' });
          const url = URL.createObjectURL(blob), a = document.createElement('a');
          a.href = url; a.setAttribute('download', `turno_${token.replace('#', '')}.ics`);
          document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        } catch (_) {}
      },
      submitL1WhatsApp: () => ShowcaseState.setStep(3),
      cancelTurno: () => { ShowcaseState.setSelfService(false); ShowcaseState.setStep(1); },
      cancelL2Turno: () => { ShowcaseState.setSelfService(false); ShowcaseState.setStep(1); },
      nextStep: () => ShowcaseState.setStep(ShowcaseState.currentStep + 1),
      prevStep: () => ShowcaseState.setStep(ShowcaseState.currentStep - 1)
    };

    this.renderAll();
  },

  renderAll() {
    renderStageRubrosZone('stage-rubros-container', ShowcaseState);
    ShowcaseMockup.render('mockup-container', ShowcaseState);
    renderStageValueZone('stage-value-container', ShowcaseState);

    if (document.getElementById('levels-container')) ShowcaseLevels.render('levels-container', ShowcaseState);
    if (document.getElementById('benefits-container')) ShowcaseBenefits.render('benefits-container', ShowcaseState);
  }
};

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ShowcaseCore.init());
  } else {
    ShowcaseCore.init();
  }
}
