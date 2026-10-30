// Archivo: js/showcase_v11/showcase_core.js
/**
 * ⚡ TucuRed Showcase v11.1 - Orquestador Central (Aura Design System)
 * Preservación estricta de foco en inputs, sanitización en vivo y sincronización dirigida.
 */

import { ShowcaseState } from './showcase_state.js';
import { ShowcaseLevels } from './showcase_levels.js';
import { ShowcaseMockup } from './showcase_mockup.js';
import { ShowcaseBenefits } from './showcase_benefits.js';

export const ShowcaseCore = {
  _initialized: false,

  init() {
    if (!this._initialized) {
      ShowcaseState.subscribe(() => this.renderAll());
      this._initialized = true;
    }

    window.ShowcaseLevels = ShowcaseLevels;
    window.ShowcaseCore = {
      getState: () => ShowcaseState,
      selectLevel: (lvl) => ShowcaseState.setLevel(lvl),
      selectRubro: (rubro) => ShowcaseState.setRubro(rubro),
      selectStep: (step) => ShowcaseState.setStep(step),
      selectOption: (optIdx) => {
        ShowcaseState.selectedOption = optIdx;
        ShowcaseState.notify();
      },
      selectStaff: (staffIdx) => {
        ShowcaseState.selectedStaff = staffIdx;
        ShowcaseState.notify();
      },
      selectDay: (dayIdx) => {
        ShowcaseState.selectedDay = dayIdx;
        ShowcaseState.notify();
      },
      selectTime: (time) => {
        ShowcaseState.selectedTime = time;
        ShowcaseState.notify();
      },
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
        ShowcaseBenefits.render('benefits-container', ShowcaseState);
      },
      selectReason: (reasonIdx) => {
        ShowcaseState.selectedReason = reasonIdx;
        ShowcaseState.notify();
      },
      toggleSelfService: (show) => ShowcaseState.setSelfService(show),
      submitL1WhatsApp: () => {
        ShowcaseState.setStep(3);
      },
      cancelL2Turno: () => {
        ShowcaseState.setSelfService(false);
        ShowcaseState.setStep(1);
      },
      nextStep: () => ShowcaseState.setStep(ShowcaseState.currentStep + 1),
      prevStep: () => ShowcaseState.setStep(ShowcaseState.currentStep - 1)
    };

    this.renderAll();
  },

  renderAll() {
    ShowcaseLevels.render('levels-container', ShowcaseState);
    ShowcaseMockup.render('mockup-container', ShowcaseState);
    ShowcaseBenefits.render('benefits-container', ShowcaseState);
  }
};

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ShowcaseCore.init());
  } else {
    ShowcaseCore.init();
  }
}
