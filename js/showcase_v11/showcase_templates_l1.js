// Archivo: js/showcase_v11/showcase_templates_l1.js
/**
 * ⚡ TucuRed Showcase v11.1 - Pieles Temáticas Stitch L1 (Aura Design System)
 * Glass/Border de acento en estados activos, tipografía homogénea y copys de embudo.
 */

export const ShowcaseTemplatesL1 = {
  render(rubroId, state, rubro) {
    if (rubroId === 'salud') return this.renderSalud(state, rubro);
    if (rubroId === 'resto') return this.renderResto(state, rubro);
    if (rubroId === 'barberia') return this.renderBarberia(state, rubro);
    if (rubroId === 'deportes') return this.renderDeportes(state, rubro);
    return this.renderEstetica(state, rubro);
  },

  renderDates(state, activeClass, days) {
    return (days || ['Vie 24', 'Sáb 25', 'Dom 26', 'Lun 27']).map((d, i) => `
      <button type="button" onclick="window.ShowcaseCore.selectDay(${i})" class="shrink-0 min-w-[58px] min-h-[64px] rounded-xl flex flex-col items-center justify-center p-2 cursor-pointer transition-all ${state.selectedDay === i ? activeClass : 'bg-white/[0.04] text-white/70 border border-white/[0.08] hover:bg-white/[0.08]'}">
        <span class="text-[12px] opacity-70">${d.split(' ')[0]}</span><span class="text-[16px] font-bold">${d.split(' ')[1]}</span>
      </button>
    `).join('');
  },

  renderEstetica(state, r) {
    return `
      <div class="space-y-3">
        <div>
          <div class="flex items-center justify-between mb-1.5"><h4 class="text-[12px] font-semibold tracking-wider uppercase text-white/60">Fecha</h4><span class="text-[#D4AF37] text-[11px] font-semibold">Octubre</span></div>
          <div class="flex justify-center items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
            ${this.renderDates(state, 'bg-[#D4AF37]/15 border-2 border-[#D4AF37] text-[#D4AF37] font-bold shadow-[0_0_12px_rgba(212,175,55,0.25)]')}
          </div>
        </div>
        <div>
          <h4 class="text-[12px] font-semibold tracking-wider uppercase text-white/60 mb-1.5">Horarios Disponibles</h4>
          <div class="grid grid-cols-2 gap-1.5">
            <button type="button" onclick="window.ShowcaseCore.selectTime('09:30')" class="py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-mono transition-all cursor-pointer ${state.selectedTime === '09:30' ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37] font-bold shadow-[0_0_12px_rgba(212,175,55,0.2)]' : 'border-white/[0.08] bg-white/[0.04] text-white/70 hover:bg-white/[0.08]'}"><span class="material-symbols-outlined text-xs">schedule</span><span>09:30 hs</span></button>
            <button type="button" disabled class="py-2 px-3 rounded-xl border-transparent bg-white/[0.02] text-white/30 opacity-30 flex items-center justify-center gap-1.5 text-xs font-mono line-through cursor-not-allowed"><span class="material-symbols-outlined text-xs">schedule</span><span>11:00 hs</span></button>
            <button type="button" onclick="window.ShowcaseCore.selectTime('16:30')" class="py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-mono transition-all cursor-pointer ${state.selectedTime === '16:30' ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37] font-bold shadow-[0_0_12px_rgba(212,175,55,0.2)]' : 'border-white/[0.08] bg-white/[0.04] text-white/70 hover:bg-white/[0.08]'}"><span class="material-symbols-outlined text-xs">schedule</span><span>16:30 hs</span></button>
            <button type="button" onclick="window.ShowcaseCore.selectTime('18:00')" class="py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-mono transition-all cursor-pointer ${state.selectedTime === '18:00' ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37] font-bold shadow-[0_0_12px_rgba(212,175,55,0.2)]' : 'border-white/[0.08] bg-white/[0.04] text-white/70 hover:bg-white/[0.08]'}"><span class="material-symbols-outlined text-xs">schedule</span><span>18:00 hs</span></button>
          </div>
        </div>
      </div>
      <button type="button" onclick="window.ShowcaseCore.nextStep()" class="w-full mt-2 bg-gradient-to-r from-[#D4AF37] to-[#B18D28] text-[#0F0F10] font-bold text-xs py-2.5 rounded-xl shadow-lg shadow-[#D4AF37]/20 flex justify-center items-center gap-1.5 cursor-pointer">
        <span>Continuar con la Reserva</span><span class="material-symbols-outlined text-sm">arrow_forward</span>
      </button>
    `;
  },

  renderResto(state, r) {
    return `
      <div class="space-y-2.5">
        <div>
          <h4 class="text-[12px] font-semibold tracking-wider uppercase text-white/60 mb-1.5">Cantidad de comensales</h4>
          <div class="grid grid-cols-2 gap-1.5">
            ${['2 Personas', '4 Personas', '6 Personas', '+8 Grupo'].map((p, idx) => `
              <button type="button" onclick="window.ShowcaseCore.selectOption(${idx})" class="py-2 rounded-xl text-xs font-medium border cursor-pointer transition-all ${state.selectedOption === idx ? 'border-[#E07A5F] bg-[#E07A5F]/15 text-[#E07A5F] font-bold shadow-[0_0_15px_rgba(224,122,95,0.2)]' : 'bg-white/[0.04] text-white/70 border-white/[0.08] hover:bg-white/[0.08]'}">${p}</button>
            `).join('')}
          </div>
        </div>
        <div>
          <div class="flex items-center justify-between mb-1.5"><h4 class="text-[12px] font-semibold tracking-wider uppercase text-white/60">Fecha</h4><span class="text-[#E07A5F] text-[11px] font-semibold">Octubre</span></div>
          <div class="flex justify-center items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
            ${this.renderDates(state, 'bg-[#E07A5F]/15 border-2 border-[#E07A5F] text-[#E07A5F] font-bold shadow-[0_0_12px_rgba(224,122,95,0.25)]', ['Jue 23', 'Vie 24', 'Sáb 25', 'Dom 26'])}
          </div>
        </div>
        <div>
          <h4 class="text-[12px] font-semibold tracking-wider uppercase text-white/60 mb-1.5 flex items-center justify-between"><span>Horario de Noche</span><span class="material-symbols-outlined text-xs text-[#E07A5F]">schedule</span></h4>
          <div class="flex justify-center gap-1.5 overflow-x-auto no-scrollbar">
            <button type="button" onclick="window.ShowcaseCore.selectTime('21:00')" class="shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-medium border cursor-pointer ${state.selectedTime === '21:00' ? 'border-[#E07A5F] bg-[#E07A5F]/15 text-[#E07A5F] font-bold shadow-[0_0_12px_rgba(224,122,95,0.2)]' : 'bg-white/[0.04] text-white/70 border-white/[0.08] hover:bg-white/[0.08]'}">21:00 hs</button>
            <button type="button" disabled class="shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-medium border-transparent bg-white/[0.02] text-white/30 opacity-30 line-through cursor-not-allowed">22:30 hs</button>
            <button type="button" onclick="window.ShowcaseCore.selectTime('23:15')" class="shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-medium border cursor-pointer ${state.selectedTime === '23:15' ? 'border-[#E07A5F] bg-[#E07A5F]/15 text-[#E07A5F] font-bold shadow-[0_0_12px_rgba(224,122,95,0.2)]' : 'bg-white/[0.04] text-white/70 border-white/[0.08] hover:bg-white/[0.08]'}">23:15 hs</button>
          </div>
        </div>
      </div>
      <button type="button" onclick="window.ShowcaseCore.nextStep()" class="w-full mt-2 bg-gradient-to-r from-[#E07A5F] to-[#C85A3F] text-white font-bold text-xs py-2.5 rounded-xl shadow-lg shadow-[#E07A5F]/20 flex justify-center items-center gap-1.5 cursor-pointer">
        <span>Continuar con la Reserva</span><span class="material-symbols-outlined text-sm">arrow_forward</span>
      </button>
    `;
  },

  renderBarberia(state, r) {
    return `
      <div class="space-y-2.5">
        <div>
          <div class="flex items-center justify-between mb-1.5"><h4 class="text-[12px] font-semibold tracking-wider uppercase text-white/60">Fecha</h4><span class="text-[#D97706] text-[11px] font-semibold">Octubre</span></div>
          <div class="flex justify-center items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
            ${this.renderDates(state, 'bg-[#D97706]/15 border-2 border-[#D97706] text-[#D97706] font-bold shadow-[0_0_12px_rgba(217,119,6,0.25)]', ['Lun 14', 'Mar 15', 'Mié 16', 'Jue 17'])}
          </div>
        </div>
        <div>
          <h4 class="text-[12px] font-semibold tracking-wider uppercase text-white/60 mb-1.5 flex items-center justify-between"><span>Horario</span><span class="material-symbols-outlined text-xs text-[#D97706]">schedule</span></h4>
          <div class="grid grid-cols-2 gap-1.5">
            <button type="button" onclick="window.ShowcaseCore.selectTime('15:00')" class="py-1.5 rounded-lg text-xs font-mono border cursor-pointer ${state.selectedTime === '15:00' ? 'border-[#D97706] bg-[#D97706]/15 text-[#D97706] font-bold shadow-[0_0_12px_rgba(217,119,6,0.2)]' : 'border-white/[0.08] bg-white/[0.04] text-white/70 hover:bg-white/[0.08]'}">15:00 hs</button>
            <button type="button" disabled class="py-1.5 rounded-lg text-xs font-mono border-transparent bg-white/[0.02] text-white/30 opacity-30 line-through cursor-not-allowed">16:30 hs</button>
            <button type="button" onclick="window.ShowcaseCore.selectTime('17:00')" class="py-1.5 rounded-lg text-xs font-mono border cursor-pointer ${state.selectedTime === '17:00' ? 'border-[#D97706] bg-[#D97706]/15 text-[#D97706] font-bold shadow-[0_0_12px_rgba(217,119,6,0.2)]' : 'border-white/[0.08] bg-white/[0.04] text-white/70 hover:bg-white/[0.08]'}">17:00 hs</button>
            <button type="button" onclick="window.ShowcaseCore.selectTime('18:30')" class="py-1.5 rounded-lg text-xs font-mono border cursor-pointer ${state.selectedTime === '18:30' ? 'border-[#D97706] bg-[#D97706]/15 text-[#D97706] font-bold shadow-[0_0_12px_rgba(217,119,6,0.2)]' : 'border-white/[0.08] bg-white/[0.04] text-white/70 hover:bg-white/[0.08]'}">18:30 hs</button>
          </div>
        </div>
      </div>
      <button type="button" onclick="window.ShowcaseCore.nextStep()" class="w-full mt-2 bg-gradient-to-r from-[#D97706] to-[#B45309] text-white font-bold text-xs py-2.5 rounded-xl shadow-lg shadow-[#D97706]/20 flex justify-center items-center gap-1.5 cursor-pointer">
        <span>Continuar con la Reserva</span><span class="material-symbols-outlined text-sm">arrow_forward</span>
      </button>
    `;
  },

  renderDeportes(state, r) {
    return `
      <div class="space-y-2.5">
        <div>
          <h4 class="text-[12px] font-semibold tracking-wider uppercase text-white/60 mb-1.5">Duración del Turno</h4>
          <div class="grid grid-cols-2 gap-1.5">
            <button type="button" onclick="window.ShowcaseCore.selectOption(0)" class="p-2 rounded-xl border flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all ${state.selectedOption === 0 ? 'bg-[#84CC16]/15 border-[#84CC16] text-[#84CC16] font-bold shadow-[0_0_12px_rgba(132,204,22,0.25)]' : 'bg-white/[0.04] text-white/70 border-white/[0.08] hover:bg-white/[0.08]'}"><span class="material-symbols-outlined text-base">timer</span><span class="text-xs">60 MIN</span></button>
            <button type="button" onclick="window.ShowcaseCore.selectOption(1)" class="p-2 rounded-xl border flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all ${state.selectedOption === 1 ? 'bg-[#84CC16]/15 border-[#84CC16] text-[#84CC16] font-bold shadow-[0_0_12px_rgba(132,204,22,0.25)]' : 'bg-white/[0.04] text-white/70 border-white/[0.08] hover:bg-white/[0.08]'}"><span class="material-symbols-outlined text-base">timer_play</span><span class="text-xs">90 MIN</span></button>
          </div>
        </div>
        <div>
          <div class="flex items-center justify-between mb-1.5"><h4 class="text-[12px] font-semibold tracking-wider uppercase text-white/60">Fecha</h4><span class="text-[#84CC16] text-[11px] font-semibold">Octubre</span></div>
          <div class="flex justify-center items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
            ${this.renderDates(state, 'bg-[#84CC16]/15 border-2 border-[#84CC16] text-[#84CC16] font-bold shadow-[0_0_12px_rgba(132,204,22,0.25)]', ['Mié 22', 'Jue 23', 'Vie 24', 'Sáb 25'])}
          </div>
        </div>
        <div>
          <h4 class="text-[12px] font-semibold tracking-wider uppercase text-white/60 mb-1.5">Horarios Disponibles</h4>
          <div class="grid grid-cols-3 gap-1">
            <button type="button" onclick="window.ShowcaseCore.selectTime('18:00')" class="py-1.5 rounded-lg text-xs font-mono font-medium border cursor-pointer ${state.selectedTime === '18:00' ? 'border-[#84CC16] bg-[#84CC16]/15 text-[#84CC16] font-bold shadow-[0_0_12px_rgba(132,204,22,0.2)]' : 'bg-white/[0.04] text-white/70 border-white/[0.08] hover:bg-white/[0.08]'}">18:00</button>
            <button type="button" disabled class="py-1.5 rounded-lg text-xs font-mono font-medium border-transparent bg-white/[0.02] text-white/30 opacity-30 line-through cursor-not-allowed">19:30</button>
            <button type="button" onclick="window.ShowcaseCore.selectTime('21:00')" class="py-1.5 rounded-lg text-xs font-mono font-medium border cursor-pointer ${state.selectedTime === '21:00' ? 'border-[#84CC16] bg-[#84CC16]/15 text-[#84CC16] font-bold shadow-[0_0_12px_rgba(132,204,22,0.2)]' : 'bg-white/[0.04] text-white/70 border-white/[0.08] hover:bg-white/[0.08]'}">21:00</button>
          </div>
        </div>
      </div>
      <button type="button" onclick="window.ShowcaseCore.nextStep()" class="w-full mt-2 bg-gradient-to-r from-[#84CC16] to-[#65A30D] text-[#0F0F10] font-bold text-xs py-2.5 rounded-xl shadow-lg shadow-[#84CC16]/20 flex justify-center items-center gap-1.5 cursor-pointer">
        <span>Continuar con la Reserva</span><span class="material-symbols-outlined text-sm">arrow_forward</span>
      </button>
    `;
  },

  renderSalud(state, r) {
    return `
      <div class="space-y-2.5">
        <div>
          <h4 class="text-[12px] font-semibold tracking-wider uppercase text-white/60 mb-1.5">Especialidad / Consulta</h4>
          <div class="flex flex-col gap-1">
            ${r.options.map((opt, idx) => `
              <button type="button" onclick="window.ShowcaseCore.selectOption(${idx})" class="p-2 rounded-xl text-left text-xs border transition-all cursor-pointer ${state.selectedOption === idx ? 'border-[#0D9488] bg-[#0D9488]/15 text-[#2dd4bf] font-bold shadow-[0_0_12px_rgba(13,148,136,0.25)]' : 'bg-white/[0.04] text-white/70 border-white/[0.08] hover:bg-white/[0.08]'}">${opt}</button>
            `).join('')}
          </div>
        </div>
        <div>
          <div class="flex items-center justify-between mb-1.5"><h4 class="text-[12px] font-semibold tracking-wider uppercase text-white/60">Fecha</h4><span class="text-[#2dd4bf] text-[11px] font-semibold">Octubre</span></div>
          <div class="flex justify-center items-center gap-2 overflow-x-auto no-scrollbar py-1">
            ${this.renderDates(state, 'bg-[#0D9488]/15 border-2 border-[#0D9488] text-[#2dd4bf] font-bold shadow-[0_0_12px_rgba(13,148,136,0.25)]', ['Lun 20', 'Mar 21', 'Mié 22', 'Jue 23'])}
          </div>
        </div>
        <div>
          <h4 class="text-[12px] font-semibold tracking-wider uppercase text-white/60 mb-1.5">Horarios Disponibles</h4>
          <div class="grid grid-cols-2 gap-1.5">
            <button type="button" onclick="window.ShowcaseCore.selectTime('09:00')" class="py-1.5 rounded-lg text-xs font-mono border cursor-pointer ${state.selectedTime === '09:00' ? 'border-[#0D9488] bg-[#0D9488]/15 text-[#2dd4bf] font-bold' : 'border-white/[0.08] bg-white/[0.04] text-white/70'}">09:00 hs</button>
            <button type="button" onclick="window.ShowcaseCore.selectTime('11:30')" class="py-1.5 rounded-lg text-xs font-mono border cursor-pointer ${state.selectedTime === '11:30' ? 'border-[#0D9488] bg-[#0D9488]/15 text-[#2dd4bf] font-bold' : 'border-white/[0.08] bg-white/[0.04] text-white/70'}">11:30 hs</button>
            <button type="button" onclick="window.ShowcaseCore.selectTime('17:00')" class="py-1.5 rounded-lg text-xs font-mono border cursor-pointer ${state.selectedTime === '17:00' ? 'border-[#0D9488] bg-[#0D9488]/15 text-[#2dd4bf] font-bold' : 'border-white/[0.08] bg-white/[0.04] text-white/70'}">17:00 hs</button>
            <button type="button" onclick="window.ShowcaseCore.selectTime('18:30')" class="py-1.5 rounded-lg text-xs font-mono border cursor-pointer ${state.selectedTime === '18:30' ? 'border-[#0D9488] bg-[#0D9488]/15 text-[#2dd4bf] font-bold' : 'border-white/[0.08] bg-white/[0.04] text-white/70'}">18:30 hs</button>
          </div>
        </div>
      </div>
      <button type="button" onclick="window.ShowcaseCore.nextStep()" class="w-full mt-2 bg-gradient-to-r from-[#0D9488] to-[#0F766E] text-white font-bold text-xs py-2.5 rounded-xl shadow-lg shadow-[#0D9488]/20 flex justify-center items-center gap-1.5 cursor-pointer">
        <span>Continuar con la Reserva</span><span class="material-symbols-outlined text-sm">arrow_forward</span>
      </button>
    `;
  }
};
