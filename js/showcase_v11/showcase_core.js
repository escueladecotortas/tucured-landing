// Archivo: js/showcase_v11/showcase_core.js
// Orquestador Central del Escenario 3 Zonas: Cancelación Real vía TucuTicketModal (< 120L)

import { ShowcaseState, preloadShowcaseAssets, getActiveCatalogServices } from './showcase_state.js';
import { ShowcaseLevels } from './showcase_levels.js';
import { ShowcaseMockup } from './showcase_mockup.js';
import { ShowcaseBenefits } from './showcase_benefits.js';
import { renderStageRubrosZone } from '../components/stage_rubros_zone.js';
import { renderStageValueZone } from '../components/stage_value_zone.js';
import { triggerSensoryFeedback } from '../utils/sound_fx.js';
import { persistShowcaseBooking, buildStep4WaUrl } from './showcase_booking_sync.js';

function openRealTicketModal(askCancel = false) {
  if (!ShowcaseState.lastBookingCode || !ShowcaseState.lastBookingRecord) {
    persistShowcaseBooking(ShowcaseState);
  }
  const code = ShowcaseState.lastBookingCode;
  if (window.TucuTicketModal) {
    window.TucuTicketModal.open(code, ShowcaseState.currentLevel, ShowcaseState.currentRubro, {
      origin: 'showroom',
      immediate: true,
      askCancel: !!askCancel
    });
  }
}

function isShowcasePhoneRestricted(phone, level, rubro) {
  const digits = String(phone || '').replace(/\D/g, '').replace(/^549?/, '').replace(/^0/, '');
  if (digits.length < 6) return false;
  try {
    const lvl = ['l1', 'l2', 'l3'].includes(level) ? level : 'l1';
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i) || '';
      if (!k.startsWith(`tucu_${lvl}_contacts_`) || k.includes('_deleted_')) continue;
      const list = JSON.parse(localStorage.getItem(k) || '[]');
      if (Array.isArray(list) && list.some(c => c && !c.deletedAt && c.isRestricted && String(c.phoneE164 || c.phone || '').replace(/\D/g, '').endsWith(digits.slice(-7)))) return true;
    }
  } catch (_) {}
  return false;
}

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
        if (field === 'clientPhone') ShowcaseState.restrictedWarning = '';
        renderStageValueZone('stage-value-container', ShowcaseState);
      },
      selectReason: (reasonIdx) => { ShowcaseState.selectedReason = reasonIdx; ShowcaseState.notify(); },
      openTicketForCancel: () => { triggerSensoryFeedback(); openRealTicketModal(true); },
      toggleSelfService: (show) => { if (show) openRealTicketModal(true); else window.TucuTicketModal?.close(); },
      confirmBooking: () => {
        triggerSensoryFeedback();
        if (isShowcasePhoneRestricted(ShowcaseState.clientPhone, ShowcaseState.currentLevel, ShowcaseState.currentRubro)) {
          ShowcaseState.restrictedWarning = 'Para coordinar este turno, comunicate directamente con el local.';
          ShowcaseState.notify();
          return;
        }
        ShowcaseState.restrictedWarning = '';
        persistShowcaseBooking(ShowcaseState); ShowcaseState.setStep(4);
      },
      getLastWaUrl: () => {
        const r = ShowcaseState.rubros[ShowcaseState.currentRubro] || ShowcaseState.rubros.barberia;
        return ShowcaseState.lastBookingRecord ? buildStep4WaUrl(ShowcaseState.lastBookingRecord, ShowcaseState.currentLevel, r) : '';
      },
      addToCalendar: () => {
        try {
          const s = ShowcaseState, r = s.rubros[s.currentRubro] || s.rubros.barberia;
          const activeSrvs = getActiveCatalogServices(s, r);
          const srv = (activeSrvs[s.selectedOption || 0] || activeSrvs[0])?.name || r.options[s.selectedOption || 0] || 'Servicio';
          const day = s.getSelectedDayLabel();
          const token = s.lastBookingCode ? `#${s.lastBookingCode}` : '#TK-DEMO';
          const ics = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//TucuRed//Turnero Autonomo//ES\r\nBEGIN:VEVENT\r\nSUMMARY:${srv} - ${r.bizName}\r\nLOCATION:${r.address || ''}\r\nDESCRIPTION:Turno ${token} para ${s.clientFirstName} ${s.clientLastName}. Fecha: ${day} a las ${s.selectedTime} hs.\r\nSTATUS:CONFIRMED\r\nEND:VEVENT\r\nEND:VCALENDAR`;
          const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8;' });
          const url = URL.createObjectURL(blob), a = document.createElement('a');
          a.href = url; a.setAttribute('download', `turno_${token.replace('#', '')}.ics`);
          document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        } catch (_) {}
      },
      submitL1WhatsApp: () => ShowcaseState.setStep(3),
      cancelTurno: () => { if (ShowcaseState.lastBookingCode) window.TucuTicketModal?.confirmCancel?.(ShowcaseState.lastBookingCode); },
      cancelL2Turno: () => { if (ShowcaseState.lastBookingCode) window.TucuTicketModal?.confirmCancel?.(ShowcaseState.lastBookingCode); },
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