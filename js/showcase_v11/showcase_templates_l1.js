// Archivo: js/showcase_v11/showcase_templates_l1.js
/**
 * ⚡ TucuRed Showcase v11.1 - Pieles Temáticas Stitch L1 (Aura Light)
 * Piel clara profesional, fechas dinámicas del sistema, regla de domingo y filtro horario.
 * Restricción estricta: < 200 líneas (< 180L) y Protocolo PEAC.
 */

import { getSystemCalendar, isSelectedDaySunday, isTimePast } from './showcase_state.js';

export const ShowcaseTemplatesL1 = {
  render(rubroId, state, rubro) {
    if (rubroId === 'salud') return this.renderSalud(state, rubro);
    if (rubroId === 'resto') return this.renderResto(state, rubro);
    if (rubroId === 'barberia') return this.renderBarberia(state, rubro);
    if (rubroId === 'deportes') return this.renderDeportes(state, rubro);
    return this.renderEstetica(state, rubro);
  },

  renderDateHeader(title, colorClass, state) {
    const mes = (state && state.systemCalendar) ? state.systemCalendar.mesActual : getSystemCalendar().mesActual;
    return `<div class="flex items-center justify-between mb-1.5"><h4 class="text-[12px] font-bold tracking-wider uppercase text-slate-500">${title}</h4><span class="${colorClass} text-[11px] font-semibold">${mes}</span></div>`;
  },

  renderDates(state, activeClass) {
    const cal = (state && state.systemCalendar) ? state.systemCalendar : getSystemCalendar();
    return cal.diasReales.map((d, i) => `
      <button type="button" onclick="window.ShowcaseCore.selectDay(${i})" class="shrink-0 min-w-[58px] min-h-[64px] rounded-xl flex flex-col items-center justify-center p-2 cursor-pointer transition-all ${state.selectedDay === i ? activeClass : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-2xs'}">
        <span class="text-[12px] opacity-70">${d.diaNombre}</span><span class="text-[16px] font-bold text-slate-900">${d.diaNumero}</span>
      </button>
    `).join('');
  },

  renderTimeSlots(times, state, activeClass) {
    if (isSelectedDaySunday(state)) {
      return '<div class="p-4 text-center bg-slate-100 rounded-xl text-slate-500 font-medium text-xs sm:text-sm border border-slate-200">Local cerrado los domingos</div>';
    }
    return `<div class="grid grid-cols-2 gap-1.5">
      ${times.map(t => {
        if (isTimePast(t, state)) {
          return `<button type="button" disabled class="py-2 px-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 opacity-30 line-through pointer-events-none cursor-not-allowed border-dashed flex items-center justify-center gap-1.5 text-xs font-mono"><span class="material-symbols-outlined text-xs">schedule</span><span>${t} hs</span></button>`;
        }
        const isSel = state.selectedTime === t;
        return `<button type="button" onclick="window.ShowcaseCore.selectTime('${t}')" class="py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-mono transition-all cursor-pointer ${isSel ? activeClass : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs'}"><span class="material-symbols-outlined text-xs">schedule</span><span>${t} hs</span></button>`;
      }).join('')}
    </div>`;
  },

  renderEstetica(state, r) {
    return `
      <div class="space-y-3">
        <div>
          ${this.renderDateHeader('Fecha', 'text-[#D4AF37]', state)}
          <div class="flex justify-center items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
            ${this.renderDates(state, 'bg-[#D4AF37]/15 border-2 border-[#D4AF37] text-[#9A7D0A] font-bold shadow-xs')}
          </div>
        </div>
        <div>
          <h4 class="text-[12px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">Horarios Disponibles</h4>
          ${this.renderTimeSlots(['09:30', '11:00', '16:30', '18:00'], state, 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#9A7D0A] font-bold shadow-xs')}
        </div>
      </div>
      <button type="button" onclick="window.ShowcaseCore.nextStep()" class="w-full mt-2 bg-gradient-to-r from-[#D4AF37] to-[#B18D28] text-[#0F0F10] font-bold text-xs py-2.5 rounded-xl shadow-md flex justify-center items-center gap-1.5 cursor-pointer">
        <span>Continuar con la Reserva</span><span class="material-symbols-outlined text-sm">arrow_forward</span>
      </button>
    `;
  },

  renderResto(state, r) {
    return `
      <div class="space-y-2.5">
        <div>
          <h4 class="text-[12px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">Cantidad de comensales</h4>
          <div class="grid grid-cols-2 gap-1.5">
            ${['2 Personas', '4 Personas', '6 Personas', '+8 Grupo'].map((p, idx) => `
              <button type="button" onclick="window.ShowcaseCore.selectOption(${idx})" class="py-2 rounded-xl text-xs font-semibold border cursor-pointer transition-all ${state.selectedOption === idx ? 'border-[#E07A5F] bg-[#E07A5F]/15 text-[#C85A3F] font-bold shadow-xs' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-2xs'}">${p}</button>
            `).join('')}
          </div>
        </div>
        <div>
          ${this.renderDateHeader('Fecha', 'text-[#E07A5F]', state)}
          <div class="flex justify-center items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
            ${this.renderDates(state, 'bg-[#E07A5F]/15 border-2 border-[#E07A5F] text-[#C85A3F] font-bold shadow-xs')}
          </div>
        </div>
        <div>
          <h4 class="text-[12px] font-bold tracking-wider uppercase text-slate-500 mb-1.5 flex items-center justify-between"><span>Horario de Noche</span><span class="material-symbols-outlined text-xs text-[#E07A5F]">schedule</span></h4>
          ${this.renderTimeSlots(['21:00', '22:00', '22:30', '23:15'], state, 'border-[#E07A5F] bg-[#E07A5F]/15 text-[#C85A3F] font-bold shadow-xs')}
        </div>
      </div>
      <button type="button" onclick="window.ShowcaseCore.nextStep()" class="w-full mt-2 bg-gradient-to-r from-[#E07A5F] to-[#C85A3F] text-white font-bold text-xs py-2.5 rounded-xl shadow-md flex justify-center items-center gap-1.5 cursor-pointer">
        <span>Continuar con la Reserva</span><span class="material-symbols-outlined text-sm">arrow_forward</span>
      </button>
    `;
  },

  renderBarberia(state, r) {
    return `
      <div class="space-y-2.5">
        <div>
          ${this.renderDateHeader('Fecha', 'text-[#D97706]', state)}
          <div class="flex justify-center items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
            ${this.renderDates(state, 'bg-[#D97706]/15 border-2 border-[#D97706] text-[#B45309] font-bold shadow-xs')}
          </div>
        </div>
        <div>
          <h4 class="text-[12px] font-bold tracking-wider uppercase text-slate-500 mb-1.5 flex items-center justify-between"><span>Horario</span><span class="material-symbols-outlined text-xs text-[#D97706]">schedule</span></h4>
          ${this.renderTimeSlots(['15:00', '16:30', '17:00', '18:30'], state, 'border-[#D97706] bg-[#D97706]/15 text-[#B45309] font-bold shadow-xs')}
        </div>
      </div>
      <button type="button" onclick="window.ShowcaseCore.nextStep()" class="w-full mt-2 bg-gradient-to-r from-[#D97706] to-[#B45309] text-white font-bold text-xs py-2.5 rounded-xl shadow-md flex justify-center items-center gap-1.5 cursor-pointer">
        <span>Continuar con la Reserva</span><span class="material-symbols-outlined text-sm">arrow_forward</span>
      </button>
    `;
  },

  renderDeportes(state, r) {
    return `
      <div class="space-y-2.5">
        <div>
          <h4 class="text-[12px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">Duración del Turno</h4>
          <div class="grid grid-cols-2 gap-1.5">
            <button type="button" onclick="window.ShowcaseCore.selectOption(0)" class="p-2 rounded-xl border flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all ${state.selectedOption === 0 ? 'bg-[#84CC16]/20 border-[#65A30D] text-[#4D7C0F] font-bold shadow-xs' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-2xs'}"><span class="material-symbols-outlined text-base">timer</span><span class="text-xs">60 MIN</span></button>
            <button type="button" onclick="window.ShowcaseCore.selectOption(1)" class="p-2 rounded-xl border flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all ${state.selectedOption === 1 ? 'bg-[#84CC16]/20 border-[#65A30D] text-[#4D7C0F] font-bold shadow-xs' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-2xs'}"><span class="material-symbols-outlined text-base">timer_play</span><span class="text-xs">90 MIN</span></button>
          </div>
        </div>
        <div>
          ${this.renderDateHeader('Fecha', 'text-[#65A30D]', state)}
          <div class="flex justify-center items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
            ${this.renderDates(state, 'bg-[#84CC16]/20 border-2 border-[#65A30D] text-[#4D7C0F] font-bold shadow-xs')}
          </div>
        </div>
        <div>
          <h4 class="text-[12px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">Horarios Disponibles</h4>
          ${this.renderTimeSlots(['18:00', '19:30', '21:00', '22:30'], state, 'border-[#65A30D] bg-[#84CC16]/20 text-[#4D7C0F] font-bold shadow-xs')}
        </div>
      </div>
      <button type="button" onclick="window.ShowcaseCore.nextStep()" class="w-full mt-2 bg-gradient-to-r from-[#84CC16] to-[#65A30D] text-[#0F0F10] font-bold text-xs py-2.5 rounded-xl shadow-md flex justify-center items-center gap-1.5 cursor-pointer">
        <span>Continuar con la Reserva</span><span class="material-symbols-outlined text-sm">arrow_forward</span>
      </button>
    `;
  },

  renderSalud(state, r) {
    return `
      <div class="space-y-2.5">
        <div>
          <h4 class="text-[12px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">Especialidad / Consulta</h4>
          <div class="flex flex-col gap-1">
            ${r.options.map((opt, idx) => `
              <button type="button" onclick="window.ShowcaseCore.selectOption(${idx})" class="p-2 rounded-xl text-left text-xs border transition-all cursor-pointer ${state.selectedOption === idx ? 'border-[#0D9488] bg-[#0D9488]/15 text-[#0F766E] font-bold shadow-xs' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-2xs'}">${opt}</button>
            `).join('')}
          </div>
        </div>
        <div>
          ${this.renderDateHeader('Fecha', 'text-[#0D9488]', state)}
          <div class="flex justify-center items-center gap-2 overflow-x-auto no-scrollbar py-1">
            ${this.renderDates(state, 'bg-[#0D9488]/15 border-2 border-[#0D9488] text-[#0F766E] font-bold shadow-xs')}
          </div>
        </div>
        <div>
          <h4 class="text-[12px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">Horarios Disponibles</h4>
          ${this.renderTimeSlots(['09:00', '11:30', '17:00', '18:30'], state, 'border-[#0D9488] bg-[#0D9488]/15 text-[#0F766E] font-bold shadow-xs')}
        </div>
      </div>
      <button type="button" onclick="window.ShowcaseCore.nextStep()" class="w-full mt-2 bg-gradient-to-r from-[#0D9488] to-[#0F766E] text-white font-bold text-xs py-2.5 rounded-xl shadow-md flex justify-center items-center gap-1.5 cursor-pointer">
        <span>Continuar con la Reserva</span><span class="material-symbols-outlined text-sm">arrow_forward</span>
      </button>
    `;
  }
};
