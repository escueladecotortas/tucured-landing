// Archivo: js/showcase_v11/showcase_templates_l3.js
/**
 * ⚡ TucuRed Showcase v11.1 - Pieles Temáticas Stitch L3 (Aura Light)
 * Avatares y recursos en piel clara con catálogo dinámico, regla de domingo y filtro horario.
 * Restricción estricta: < 200 líneas (< 180L) y Protocolo PEAC.
 */

import { getSystemCalendar, getVisibleDays, isSelectedDaySunday, isTimePast } from './showcase_state.js';

export const ShowcaseTemplatesL3 = {
  render(rubroId, state, rubro) {
    if (rubroId === 'salud') return this.renderSalud(state, rubro);
    if (rubroId === 'resto') return this.renderResto(state, rubro);
    if (rubroId === 'barberia') return this.renderBarberia(state, rubro);
    if (rubroId === 'deportes') return this.renderDeportes(state, rubro);
    return this.renderEstetica(state, rubro);
  },

  renderDateHeader(title, colorClass, state) {
    const cal = (state && state.systemCalendar) ? state.systemCalendar : getSystemCalendar();
    const page = state ? (state.calendarPage || 0) : 0;
    const maxPage = Math.max(0, Math.floor(((cal.diasReales || []).length - 1) / 4));
    const canPrev = page > 0, canNext = page < maxPage;
    return `
      <div class="flex items-center justify-between mb-1.5">
        <div class="flex items-center gap-2"><h4 class="text-[12px] font-bold tracking-wider uppercase text-slate-500">${title}</h4><span class="${colorClass} text-[11px] font-semibold">${cal.mesActual}</span></div>
        <div class="flex items-center gap-1">
          <button type="button" onclick="window.ShowcaseCore.prevDayPage()" ${canPrev ? '' : 'disabled'} class="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${canPrev ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs cursor-pointer' : 'bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed opacity-40'}">‹</button>
          <button type="button" onclick="window.ShowcaseCore.nextDayPage()" ${canNext ? '' : 'disabled'} class="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${canNext ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs cursor-pointer' : 'bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed opacity-40'}">›</button>
        </div>
      </div>`;
  },

  renderDates(state, activeClass) {
    return getVisibleDays(state).map(d => `
      <button type="button" onclick="window.ShowcaseCore.selectDay(${d.globalIndex})" class="shrink-0 min-w-[58px] min-h-[64px] rounded-xl flex flex-col items-center justify-center p-2 cursor-pointer transition-all ${state.selectedDay === d.globalIndex ? activeClass : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-2xs'}">
        <span class="text-[12px] opacity-70">${d.diaNombre}</span><span class="text-[16px] font-bold text-slate-900">${d.diaNumero}</span>
      </button>`).join('');
  },

  renderTimeGrid(times, state, activeBorder, activeText) {
    if (isSelectedDaySunday(state)) {
      return '<div class="p-4 text-center bg-slate-100 rounded-xl text-slate-500 font-medium text-xs sm:text-sm border border-slate-200">Local cerrado los domingos</div>';
    }
    return `<div class="grid grid-cols-2 gap-1.5">
      ${times.map(t => {
        if (isTimePast(t, state)) {
          return `<button type="button" disabled class="py-2 px-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 opacity-30 line-through pointer-events-none cursor-not-allowed border-dashed flex items-center justify-center text-xs font-mono"><span>${t} hs</span></button>`;
        }
        const isSel = state.selectedTime === t;
        return `<button type="button" onclick="window.ShowcaseCore.selectTime('${t}')" class="py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-mono cursor-pointer transition-all ${isSel ? `${activeBorder} bg-slate-100 ${activeText} font-bold shadow-xs` : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs'}"><span class="material-symbols-outlined text-xs">schedule</span><span>${t} hs</span></button>`;
      }).join('')}
    </div>`;
  },

  renderStaffSelector(r, state, borderClass) {
    return `<div><h4 class="text-[12px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">Especialista</h4>
      <div class="grid grid-cols-1 gap-1.5">${r.staff.map((st, idx) => `
        <button type="button" onclick="window.ShowcaseCore.selectStaff(${idx})" class="p-2 rounded-xl text-left text-xs border flex items-center justify-between cursor-pointer transition-all ${state.selectedStaff === idx ? `${borderClass} bg-slate-100 text-slate-900 font-bold shadow-xs` : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-2xs'}">
          <span class="flex items-center gap-2"><span class="material-symbols-outlined text-sm opacity-70">person</span><span>${st}</span></span>
          ${state.selectedStaff === idx ? '<span class="material-symbols-outlined text-xs">check</span>' : ''}
        </button>`).join('')}</div></div>`;
  },

  renderCatalog(r, state, activeColor) {
    return `<div><h4 class="text-[12px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">Catálogo con Duración</h4>
      <div class="grid grid-cols-2 gap-1.5">${r.catalogL3.map((cat, idx) => `
        <button type="button" onclick="window.ShowcaseCore.selectOption(${idx})" class="p-2 rounded-xl text-left border cursor-pointer transition-all ${state.selectedOption === idx ? `${activeColor} bg-slate-100 font-bold shadow-xs` : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-2xs'}">
          <span class="block text-xs text-slate-900">${cat.name}</span><span class="block text-[10px] text-slate-500 font-mono mt-0.5">${cat.dur}</span>
        </button>`).join('')}</div></div>`;
  },

  renderSubmitBtn(r) {
    return `<button type="button" onclick="window.ShowcaseCore.nextStep()" class="w-full mt-2 ${r.btnClass} py-2.5 rounded-xl text-xs flex justify-center items-center gap-1.5 cursor-pointer"><span>Continuar con la Reserva</span><span class="material-symbols-outlined text-sm">arrow_forward</span></button>`;
  },

  renderEstetica(state, r) {
    return `<div class="space-y-2.5">${this.renderStaffSelector(r, state, 'border-[#D4AF37]')}${this.renderCatalog(r, state, 'border-[#D4AF37] text-[#9A7D0A]')}
      <div>${this.renderDateHeader('Fecha', 'text-[#D4AF37]', state)}<div class="flex justify-center items-center gap-2.5 overflow-x-auto no-scrollbar py-1">${this.renderDates(state, 'bg-[#D4AF37]/15 border-2 border-[#D4AF37] text-[#9A7D0A] font-bold shadow-xs')}</div></div>
      <div><h4 class="text-[12px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">Horarios</h4>${this.renderTimeGrid(['09:30', '11:00', '16:30', '18:00'], state, 'border-[#D4AF37]', 'text-[#9A7D0A]')}</div>
    </div>${this.renderSubmitBtn(r)}`;
  },

  renderResto(state, r) {
    return `<div class="space-y-2.5">${this.renderStaffSelector(r, state, 'border-[#E07A5F]')}${this.renderCatalog(r, state, 'border-[#E07A5F] text-[#C85A3F]')}
      <div>${this.renderDateHeader('Fecha', 'text-[#E07A5F]', state)}<div class="flex justify-center items-center gap-2.5 overflow-x-auto no-scrollbar py-1">${this.renderDates(state, 'bg-[#E07A5F]/15 border-2 border-[#E07A5F] text-[#C85A3F] font-bold shadow-xs')}</div></div>
      <div><h4 class="text-[12px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">Horarios</h4>${this.renderTimeGrid(['21:00', '22:00', '22:30', '23:15'], state, 'border-[#E07A5F]', 'text-[#C85A3F]')}</div>
    </div>${this.renderSubmitBtn(r)}`;
  },

  renderBarberia(state, r) {
    return `<div class="space-y-2.5">${this.renderStaffSelector(r, state, 'border-[#D97706]')}${this.renderCatalog(r, state, 'border-[#D97706] text-[#B45309]')}
      <div>${this.renderDateHeader('Fecha', 'text-[#D97706]', state)}<div class="flex justify-center items-center gap-2.5 overflow-x-auto no-scrollbar py-1">${this.renderDates(state, 'bg-[#D97706]/15 border-2 border-[#D97706] text-[#B45309] font-bold shadow-xs')}</div></div>
      <div><h4 class="text-[12px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">Horarios</h4>${this.renderTimeGrid(['15:00', '16:30', '17:00', '18:30'], state, 'border-[#D97706]', 'text-[#B45309]')}</div>
    </div>${this.renderSubmitBtn(r)}`;
  },

  renderDeportes(state, r) {
    return `<div class="space-y-2.5">${this.renderStaffSelector(r, state, 'border-[#65A30D]')}${this.renderCatalog(r, state, 'border-[#65A30D] text-[#4D7C0F]')}
      <div>${this.renderDateHeader('Fecha', 'text-[#65A30D]', state)}<div class="flex justify-center items-center gap-2.5 overflow-x-auto no-scrollbar py-1">${this.renderDates(state, 'bg-[#84CC16]/20 border-2 border-[#65A30D] text-[#4D7C0F] font-bold shadow-xs')}</div></div>
      <div><h4 class="text-[12px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">Horarios</h4>${this.renderTimeGrid(['18:00', '19:30', '21:00', '22:30'], state, 'border-[#65A30D]', 'text-[#4D7C0F]')}</div>
    </div>${this.renderSubmitBtn(r)}`;
  },

  renderSalud(state, r) {
    return `<div class="space-y-2.5">${this.renderStaffSelector(r, state, 'border-[#0D9488]')}${this.renderCatalog(r, state, 'border-[#0D9488] text-[#0F766E]')}
      <div>${this.renderDateHeader('Fecha', 'text-[#0D9488]', state)}<div class="flex justify-center items-center gap-2 overflow-x-auto no-scrollbar py-1">${this.renderDates(state, 'bg-[#0D9488]/15 border-2 border-[#0D9488] text-[#0F766E] font-bold shadow-xs')}</div></div>
      <div><h4 class="text-[12px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">Horarios</h4>${this.renderTimeGrid(['09:00', '11:30', '17:00', '18:30'], state, 'border-[#0D9488]', 'text-[#0F766E]')}</div>
    </div>${this.renderSubmitBtn(r)}`;
  }
};
