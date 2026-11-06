// Archivo: js/showcase_v11/showcase_core.js
/**
 * ⚡ TucuRed Showcase v11.1 - Orquestador Central del Escenario 3 Zonas
 * Sincronización reactiva de Vidriera, Smartphone Central y Columna de Valor con Haptics y Preload.
 * Restricción estricta: < 200 líneas (< 150L) y Protocolo PEAC.
 */

import { ShowcaseState, preloadShowcaseAssets } from './showcase_state.js';
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
      selectLevel: (lvl) => {
        triggerSensoryFeedback();
        ShowcaseState.setLevel(lvl);
      },
      selectRubro: (rubro) => {
        triggerSensoryFeedback();
        ShowcaseState.setRubro(rubro);
      },
      selectStep: (step) => ShowcaseState.setStep(step),
      selectOption: (optIdx) => {
        triggerSensoryFeedback();
        ShowcaseState.selectedOption = optIdx;
        ShowcaseState.notify();
      },
      selectStaff: (staffIdx) => {
        triggerSensoryFeedback();
        ShowcaseState.selectedStaff = staffIdx;
        ShowcaseState.notify();
      },
      selectDay: (dayIdx) => {
        triggerSensoryFeedback();
        ShowcaseState.selectedDay = dayIdx;
        ShowcaseState.notify();
      },
      selectTime: (time) => {
        triggerSensoryFeedback();
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
        renderStageValueZone('stage-value-container', ShowcaseState);
      },
      selectReason: (reasonIdx) => {
        ShowcaseState.selectedReason = reasonIdx;
        ShowcaseState.notify();
      },
      toggleSelfService: (show) => ShowcaseState.setSelfService(show),
      submitL1WhatsApp: () => ShowcaseState.setStep(3),
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
    renderStageRubrosZone('stage-rubros-container', ShowcaseState);
    ShowcaseMockup.render('mockup-container', ShowcaseState);
    renderStageValueZone('stage-value-container', ShowcaseState);

    // Compatibilidad en nodos residuales si existieran
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
