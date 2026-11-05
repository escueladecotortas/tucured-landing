// Archivo: js/showcase_v11/showcase_templates_l2.js
/**
 * ⚡ TucuRed Showcase v11.1 - Pieles Temáticas Stitch L2 (Aura Light)
 * Prevención de colisiones en vivo con slots bloqueados, fechas dinámicas y piel clara.
 * Restricción estricta: < 200 líneas (< 180L) y Protocolo PEAC.
 */

import { getSystemCalendar } from './showcase_state.js';

export const ShowcaseTemplatesL2 = {
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

  renderTimeGrid(times, blockedTime, selectedTime, activeBorder, activeText) {
    return `<div class="grid grid-cols-2 gap-1.5">
      ${times.map(t => t === blockedTime 
        ? `<button type="button" disabled class="py-2 px-2.5 rounded-xl border border-slate-100 bg-slate-100 text-slate-400 opacity-60 line-through flex items-center justify-between text-xs font-mono cursor-not-allowed"><span>${t} hs</span><span class="text-[9px] no-underline bg-red-50 text-red-600 px-1 py-0.5 rounded font-sans font-bold">Bloqueado</span></button>`
        : `<button type="button" onclick="window.ShowcaseCore.selectTime('${t}')" class="py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-mono cursor-pointer transition-all ${selectedTime === t ? `${activeBorder} bg-slate-100 ${activeText} font-bold shadow-xs` : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs'}"><span class="material-symbols-outlined text-xs">schedule</span><span>${t} hs</span></button>`
      ).join('')}
    </div>`;
  },

  renderSubmitBtn(r) {
    return `<button type="button" onclick="window.ShowcaseCore.nextStep()" class="w-full mt-2 ${r.btnClass} font-bold text-xs py-2.5 rounded-xl shadow-md flex justify-center items-center gap-1.5 cursor-pointer"><span>Continuar con mis Datos</span><span class="material-symbols-outlined text-sm">arrow_forward</span></button>`;
  },

  renderEstetica(state, r) {
    return `
      <div class="space-y-3">
        <div>
          <h4 class="text-[12px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">1. Seleccionar Servicio</h4>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
            ${['Lifting Pestañas', 'Semipermanente', 'Limpieza Facial'].map((s, idx) => `
              <button type="button" onclick="window.ShowcaseCore.selectOption(${idx})" class="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border cursor-pointer transition-all ${state.selectedOption === idx ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#9A7D0A] font-bold shadow-xs' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs'}">${s}</button>
            `).join('')}
          </div>
        </div>
        <div>
          ${this.renderDateHeader('2. Fecha', 'text-[#D4AF37]', state)}
          <div class="flex justify-center items-center gap-2 overflow-x-auto no-scrollbar py-1">${this.renderDates(state, 'bg-[#D4AF37]/15 border-2 border-[#D4AF37] text-[#9A7D0A] font-bold shadow-xs')}</div>
        </div>
        <div>
          <div class="flex items-center justify-between mb-1.5"><h4 class="text-[12px] font-bold tracking-wider uppercase text-slate-500">3. Horario (Bloqueo en Vivo)</h4><span class="text-[10px] text-emerald-600 font-mono font-bold">1 slot reservado</span></div>
          ${this.renderTimeGrid(['09:30', '11:00', '16:30', '18:00'], '11:00', state.selectedTime, 'border-[#D4AF37]', 'text-[#9A7D0A]')}
        </div>
      </div>
      ${this.renderSubmitBtn(r)}
    `;
  },

  renderSalud(state, r) {
    return `
      <div class="space-y-3">
        <div>
          <h4 class="text-[12px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">1. Tipo de Consulta</h4>
          <div class="flex flex-col gap-1.5">
            ${r.options.map((s, idx) => `<button type="button" onclick="window.ShowcaseCore.selectOption(${idx})" class="p-2 text-left rounded-xl text-xs border cursor-pointer transition-all ${state.selectedOption === idx ? 'border-[#0D9488] bg-[#0D9488]/15 text-[#0F766E] font-bold shadow-xs' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs'}">${s}</button>`).join('')}
          </div>
        </div>
        <div>
          ${this.renderDateHeader('2. Fecha', 'text-[#0D9488]', state)}
          <div class="flex justify-center items-center gap-2 overflow-x-auto no-scrollbar py-1">${this.renderDates(state, 'bg-[#0D9488]/15 border-2 border-[#0D9488] text-[#0F766E] font-bold shadow-xs')}</div>
        </div>
        <div>
          <div class="flex items-center justify-between mb-1.5"><h4 class="text-[12px] font-bold tracking-wider uppercase text-slate-500">3. Horario (Colisión Bloqueada)</h4><span class="text-[10px] text-[#0D9488] font-mono font-bold">10:30 hs ocupado</span></div>
          ${this.renderTimeGrid(['09:00', '10:30', '11:30', '17:00'], '10:30', state.selectedTime, 'border-[#0D9488]', 'text-[#0F766E]')}
        </div>
      </div>
      ${this.renderSubmitBtn(r)}
    `;
  },

  renderResto(state, r) {
    return `
      <div class="space-y-2.5">
        <div>
          <h4 class="text-[12px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">Tipo de Experiencia</h4>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
            ${['Cena Gourmet', 'Degustación', 'Menú Ejecutivo'].map((exp, idx) => `<button type="button" onclick="window.ShowcaseCore.selectOption(${idx})" class="px-2.5 py-1.5 rounded-full text-[11px] font-medium border cursor-pointer ${state.selectedOption === idx ? 'border-[#E07A5F] bg-[#E07A5F]/15 text-[#C85A3F] font-bold shadow-xs' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-2xs'}">${exp}</button>`).join('')}
          </div>
        </div>
        <div>
          ${this.renderDateHeader('Fecha', 'text-[#E07A5F]', state)}
          <div class="flex justify-center items-center gap-2 overflow-x-auto no-scrollbar py-1">${this.renderDates(state, 'bg-[#E07A5F]/15 border-2 border-[#E07A5F] text-[#C85A3F] font-bold shadow-xs')}</div>
        </div>
        <div>
          <div class="flex items-center justify-between mb-1.5"><h4 class="text-[12px] font-bold tracking-wider uppercase text-slate-500">Mesa Noche (Bloqueo en Vivo)</h4><span class="text-[10px] text-[#C85A3F] font-mono font-bold">22:30 reservada</span></div>
          ${this.renderTimeGrid(['21:00', '22:30', '23:15', '00:00'], '22:30', state.selectedTime, 'border-[#E07A5F]', 'text-[#C85A3F]')}
        </div>
      </div>
      ${this.renderSubmitBtn(r)}
    `;
  },

  renderBarberia(state, r) {
    const services = [{ name: 'Corte Tradicional', dur: '45 min' }, { name: 'Corte + Barba', dur: '60 min' }, { name: 'Servicio VIP Premium', dur: '90 min' }];
    return `
      <div class="space-y-2.5">
        <div>
          <h4 class="text-[12px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">Servicio</h4>
          <div class="flex flex-col gap-1.5">
            ${services.map((s, idx) => `<div onclick="window.ShowcaseCore.selectOption(${idx})" class="rounded-xl p-2 flex items-center justify-between border cursor-pointer ${state.selectedOption === idx ? 'border-[#D97706] bg-[#D97706]/15 text-[#B45309] font-bold shadow-xs' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs'}"><span class="text-xs text-slate-900">${s.name}</span><span class="text-[10px] text-[#B45309] font-mono">${s.dur}</span></div>`).join('')}
          </div>
        </div>
        <div>
          ${this.renderDateHeader('Fecha', 'text-[#D97706]', state)}
          <div class="flex justify-center items-center gap-2 overflow-x-auto no-scrollbar py-1">${this.renderDates(state, 'bg-[#D97706]/15 border-2 border-[#D97706] text-[#B45309] font-bold shadow-xs')}</div>
        </div>
        <div>
          <div class="flex items-center justify-between mb-1.5"><h4 class="text-[12px] font-bold tracking-wider uppercase text-slate-500">Sillón Horario (En Vivo)</h4><span class="text-[10px] text-[#B45309] font-mono font-bold">16:00 ocupado</span></div>
          ${this.renderTimeGrid(['15:00', '16:00', '16:30', '18:00'], '16:00', state.selectedTime, 'border-[#D97706]', 'text-[#B45309]')}
        </div>
      </div>
      ${this.renderSubmitBtn(r)}
    `;
  },

  renderDeportes(state, r) {
    return `
      <div class="space-y-2.5">
        <div>
          <h4 class="text-[12px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">Turno</h4>
          <div class="grid grid-cols-2 gap-2">
            <button type="button" onclick="window.ShowcaseCore.selectOption(0)" class="rounded-xl p-2 border cursor-pointer ${state.selectedOption === 0 ? 'bg-[#84CC16]/20 border-[#65A30D] text-[#4D7C0F] font-bold shadow-xs' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-2xs'}"><span class="text-xs font-bold text-slate-900 block">60 MIN</span><span class="text-[9px] text-slate-500">Estándar</span></button>
            <button type="button" onclick="window.ShowcaseCore.selectOption(1)" class="rounded-xl p-2 border cursor-pointer ${state.selectedOption === 1 ? 'bg-[#84CC16]/20 border-[#65A30D] text-[#4D7C0F] font-bold shadow-xs' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-2xs'}"><span class="text-xs font-bold text-slate-900 block">90 MIN</span><span class="text-[9px] text-[#4D7C0F] font-bold">Recomendado</span></button>
          </div>
        </div>
        <div>
          ${this.renderDateHeader('Fecha', 'text-[#4D7C0F]', state)}
          <div class="flex justify-center items-center gap-2 overflow-x-auto no-scrollbar py-1">${this.renderDates(state, 'bg-[#84CC16]/20 border-2 border-[#65A30D] text-[#4D7C0F] font-bold shadow-xs')}</div>
        </div>
        <div>
          <div class="flex items-center justify-between mb-1.5"><h4 class="text-[12px] font-bold tracking-wider uppercase text-slate-500">Horario de Cancha</h4><span class="text-[10px] text-[#4D7C0F] font-mono font-bold">19:30 ocupado</span></div>
          ${this.renderTimeGrid(['18:00', '19:30', '21:00', '22:30'], '19:30', state.selectedTime, 'border-[#65A30D]', 'text-[#4D7C0F]')}
        </div>
      </div>
      ${this.renderSubmitBtn(r)}
    `;
  }
};
