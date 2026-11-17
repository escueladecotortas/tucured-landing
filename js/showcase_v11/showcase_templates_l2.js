// Archivo: js/showcase_v11/showcase_templates_l2.js
// TucuRed Showcase v11.1 - Pieles Temáticas Stitch L2 (Aura Light) con Feriados Granulares (< 145L)

import { getSystemCalendar, getVisibleDays, isSelectedDaySunday, isTimePast, getActiveCatalogServices, normalizeShowroomRubro } from './showcase_state.js';

const HOL_MM_DD = new Set(['01-01', '02-16', '02-17', '03-24', '04-02', '04-03', '05-01', '05-25', '06-15', '06-20', '07-09', '08-17', '10-12', '11-23', '12-08', '12-25']);
function readJson(k, fb) {
  try { const v = typeof localStorage !== 'undefined' ? localStorage.getItem(k) : null; return v ? JSON.parse(v) : fb; } catch (_) { return fb; }
}
function isNatHoliday(dateStr) {
  if (!dateStr) return false;
  if (HOL_MM_DD.has(dateStr.slice(5, 10))) return true;
  const cached = readJson(`tucured_holidays_${dateStr.slice(0, 4)}`, []);
  return Array.isArray(cached) && cached.some(h => h && h.fecha === dateStr);
}
function getSelectedDateIso(state) {
  const cal = (state && state.systemCalendar) ? state.systemCalendar : getSystemCalendar();
  return cal.diasReales?.[state?.selectedDay || 0]?.dateStr || '';
}

function getL2BlockedContext(state, rubroId) {
  const norm = normalizeShowroomRubro(rubroId), dateStr = getSelectedDateIso(state);
  const activeR = typeof localStorage !== 'undefined' ? (localStorage.getItem('tucu_l2_rubro') || '') : '';
  const sameR = !activeR || activeR === norm;
  const globalHolOff = typeof localStorage !== 'undefined' && localStorage.getItem('tucu_l2_block_holidays') === 'false';
  const holMap = readJson(`tucu_l2_holidays_state_${norm}`, {});
  const onHoliday = Boolean(dateStr && !globalHolOff && isNatHoliday(dateStr) && holMap[dateStr] !== false);
  const vacs = readJson(`tucu_l2_vacations_${norm}`, sameR ? readJson('tucu_l2_vacations', []) : []);
  const onVacation = Boolean(dateStr && Array.isArray(vacs) && vacs.some(v => v && !v.deletedAt && dateStr >= v.from && dateStr <= v.to));
  const occSlots = readJson(`tucu_l2_occupied_slots_${norm}`, sameR ? readJson('tucu_l2_occupied_slots', []) : []);
  const bksPart = readJson(`tucu_l2_bookings_${norm}`, []), bksAll = readJson('tucu_l2_bookings', []);
  const bks = [...(Array.isArray(bksPart) ? bksPart : []), ...(Array.isArray(bksAll) ? bksAll.filter(b => b && (b.rubroId === norm || (!b.rubroId && sameR))) : [])];
  const bookedTimes = new Set(bks.filter(b => b && !b.deletedAt && (b.date || b.dateStr) === dateStr && !['CANCELLED', 'CANCELADO'].includes(String(b.status || '').toUpperCase())).map(b => b.time));
  const blockedSet = new Set([...(Array.isArray(occSlots) ? occSlots : []), ...bookedTimes]);
  return { onHoliday, onVacation, blockedSet };
}

export const ShowcaseTemplatesL2 = {
  render(rubroId, state, rubro) {
    if (rubroId === 'salud') return this.renderSalud(state, rubro);
    if (rubroId === 'resto') return this.renderResto(state, rubro);
    if (rubroId === 'barberia') return this.renderBarberia(state, rubro);
    if (rubroId === 'deportes') return this.renderDeportes(state, rubro);
    return this.renderEstetica(state, rubro);
  },

  renderDateHeader(title, colorClass, state) {
    const cal = (state && state.systemCalendar) ? state.systemCalendar : getSystemCalendar();
    const page = state ? (state.calendarPage || 0) : 0, maxPage = Math.max(0, Math.floor(((cal.diasReales || []).length - 1) / 4));
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

  renderTimeGrid(times, rubroId, selectedTime, activeBorder, activeText, state) {
    if (isSelectedDaySunday(state)) return '<div class="p-4 text-center bg-slate-100 rounded-xl text-slate-500 font-medium text-xs sm:text-sm border border-slate-200">Local cerrado los domingos</div>';
    const { onHoliday, onVacation, blockedSet } = getL2BlockedContext(state, rubroId);
    if (onHoliday) return '<div class="p-4 text-center bg-rose-50 rounded-xl text-rose-800 font-medium text-xs border border-rose-200">Fecha cerrada por feriado nacional</div>';
    if (onVacation) return '<div class="p-4 text-center bg-amber-50 rounded-xl text-amber-800 font-medium text-xs border border-amber-200">Fecha cerrada por vacaciones o mantenimiento</div>';
    return `<div class="grid grid-cols-2 gap-1.5">
      ${times.map(t => {
        if (isTimePast(t, state)) return `<button type="button" disabled class="py-2 px-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 opacity-30 line-through pointer-events-none cursor-not-allowed border-dashed flex items-center justify-center text-xs font-mono"><span>${t} hs</span></button>`;
        if (blockedSet.has(t)) return `<button type="button" disabled class="py-2 px-2.5 rounded-xl border border-slate-100 bg-slate-100 text-slate-400 opacity-60 line-through flex items-center justify-between text-xs font-mono cursor-not-allowed"><span>${t} hs</span><span class="text-[9px] no-underline bg-red-50 text-red-600 px-1 py-0.5 rounded font-sans font-bold">Bloqueado</span></button>`;
        return `<button type="button" onclick="window.ShowcaseCore.selectTime('${t}')" class="py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-mono cursor-pointer transition-all ${selectedTime === t ? `${activeBorder} bg-slate-100 ${activeText} font-bold shadow-xs` : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs'}"><span class="material-symbols-outlined text-xs">schedule</span><span>${t} hs</span></button>`;
      }).join('')}
    </div>`;
  },

  renderServiceSelector(r, state, activeColorClass, title = 'Elegir Servicio') {
    const items = getActiveCatalogServices(state, r);
    const listHtml = items.length === 0 ? '<div class="col-span-2 p-3 text-center text-xs text-slate-500 bg-slate-100 rounded-xl border border-slate-200">Sin servicios disponibles actualmente</div>' : items.map((cat, idx) => `<button type="button" onclick="window.ShowcaseCore.selectOption(${idx})" class="p-2 rounded-xl text-left border cursor-pointer transition-all ${(state.selectedOption || 0) === idx ? `${activeColorClass} font-bold shadow-xs` : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-2xs'}"><span class="block text-xs text-slate-900 truncate">${cat.name}</span>${cat.dur ? `<span class="block text-[10px] text-slate-500 font-mono mt-0.5 truncate">${cat.dur}</span>` : ''}</button>`).join('');
    return `<div><h4 class="text-[12px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">${title}</h4><div class="grid grid-cols-2 gap-1.5">${listHtml}</div></div>`;
  },

  renderSubmitBtn(r) { return `<button type="button" onclick="window.ShowcaseCore.nextStep()" class="w-full mt-2 ${r.btnClass} py-2.5 rounded-xl text-xs flex justify-center items-center gap-1.5 cursor-pointer"><span>Continuar con la Reserva</span><span class="material-symbols-outlined text-sm">arrow_forward</span></button>`; },

  renderRubroBlock(state, r, { title = 'Elegir Servicio', timeLabel = 'Horarios', border, text, dateActive, times }) {
    return `<div class="space-y-2.5">${this.renderServiceSelector(r, state, `${border} bg-slate-100 ${text}`, title)}
      <div>${this.renderDateHeader('Fecha', text, state)}<div class="flex justify-center items-center gap-2.5 overflow-x-auto no-scrollbar py-1">${this.renderDates(state, dateActive)}</div></div>
      <div><div class="flex items-center justify-between mb-1.5"><h4 class="text-[12px] font-bold tracking-wider uppercase text-slate-500">${timeLabel}</h4><span class="text-[10px] text-slate-500">En vivo</span></div>
        ${this.renderTimeGrid(times, r.id, state.selectedTime, border, text, state)}</div>
    </div>${this.renderSubmitBtn(r)}`;
  },

  renderEstetica(state, r) { return this.renderRubroBlock(state, r, { border: 'border-[#D4AF37]', text: 'text-[#9A7D0A]', dateActive: 'bg-[#D4AF37]/15 border-2 border-[#D4AF37] text-[#9A7D0A] font-bold shadow-xs', times: ['09:30', '11:00', '16:30', '18:00'] }); },
  renderResto(state, r) { return this.renderRubroBlock(state, r, { title: 'Experiencia / Mesa', timeLabel: 'Horario de Noche', border: 'border-[#E07A5F]', text: 'text-[#C85A3F]', dateActive: 'bg-[#E07A5F]/15 border-2 border-[#E07A5F] text-[#C85A3F] font-bold shadow-xs', times: ['21:00', '22:00', '22:30', '23:15'] }); },
  renderBarberia(state, r) { return this.renderRubroBlock(state, r, { timeLabel: 'Horario', border: 'border-[#D97706]', text: 'text-[#B45309]', dateActive: 'bg-[#D97706]/15 border-2 border-[#D97706] text-[#B45309] font-bold shadow-xs', times: ['15:00', '16:30', '17:00', '18:30'] }); },
  renderDeportes(state, r) { return this.renderRubroBlock(state, r, { title: 'Modalidad / Turno', timeLabel: 'Horarios Disponibles', border: 'border-[#65A30D]', text: 'text-[#4D7C0F]', dateActive: 'bg-[#84CC16]/20 border-2 border-[#65A30D] text-[#4D7C0F] font-bold shadow-xs', times: ['18:00', '19:30', '21:00', '22:30'] }); },
  renderSalud(state, r) { return this.renderRubroBlock(state, r, { title: 'Especialidad / Consulta', timeLabel: 'Horarios Disponibles', border: 'border-[#0D9488]', text: 'text-[#0F766E]', dateActive: 'bg-[#0D9488]/15 border-2 border-[#0D9488] text-[#0F766E] font-bold shadow-xs', times: ['09:00', '11:30', '17:00', '18:30'] }); }
};