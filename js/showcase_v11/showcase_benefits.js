// Archivo: js/showcase_v11/showcase_benefits.js
/**
 * ⚡ TucuRed Showcase v11.1 - Columna de Ventajas & Vista Diferenciada L1/L2/L3 (Aura Design System)
 * Sincronizado estrictamente con .agent/specs/turneros_v15_matrix.md.
 * Restricción estricta: < 200 líneas (< 180L).
 */

export const ShowcaseBenefits = {
  render(containerId, state) {
    const container = document.getElementById(containerId);
    if (!container || !state) return;

    const curLvl = state.levels[state.currentLevel];
    const curRubro = state.rubros[state.currentRubro];
    const isAdmin = state.viewMode === 'admin';

    container.innerHTML = `
      <div class="flex flex-col gap-3.5">
        
        <!-- Checklist Card Oficial Sincronizado con Matriz v15.0 -->
        <div class="bg-surface-container-low/80 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-white/5 shadow-lg relative overflow-hidden group">
          <div class="absolute -right-10 -top-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
          
          <h3 class="text-sm sm:text-base font-bold font-display text-on-surface mb-3 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-xl">verified</span>
            <span>Ventajas Clave • ${curLvl.name}</span>
          </h3>

          <ul class="flex flex-col gap-2.5 text-xs text-on-surface-variant leading-relaxed">
            ${curLvl.benefits.map(b => `
              <li class="flex items-start gap-2">
                <span class="material-symbols-outlined text-secondary mt-0.5 text-sm shrink-0" style="font-variation-settings: 'FILL' 1;">check_circle</span>
                <span>${b}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <!-- Vista Diferenciada por Nivel (Reactiva en Tiempo Real) -->
        ${this.renderLevelFeatureCard(state, curRubro)}

        <!-- Acciones Comerciales Directas hacia el Wizard -->
        <div class="flex flex-col gap-2 pt-0.5">
          <button 
            type="button"
            onclick="window.activateFromShowroom && window.activateFromShowroom('${state.currentRubro}', '${state.currentLevel}')"
            class="w-full bg-gold-gradient text-[#0f0f10] font-bold text-xs py-3 rounded-xl shadow-[0_4px_20px_rgba(212,175,55,0.2)] hover:opacity-90 transition-opacity flex justify-center items-center gap-2 cursor-pointer"
          >
            <span class="material-symbols-outlined text-base">rocket_launch</span>
            <span>Activar este Turnero por $1.000</span>
          </button>

          <button 
            type="button"
            onclick="window.ShowcaseState.setViewMode(window.ShowcaseState.viewMode === 'admin' ? 'client' : 'admin')"
            class="w-full bg-surface-container hover:bg-surface-variant text-primary font-semibold text-xs py-2.5 rounded-xl border border-primary/20 hover:border-primary/50 transition-all flex justify-center items-center gap-2 cursor-pointer"
          >
            <span class="material-symbols-outlined text-base">${isAdmin ? 'smartphone' : 'tune'}</span>
            <span>${isAdmin ? 'Volver a Vista Cliente ⇄' : 'Ver Trastienda /admin en Vivo ⇄'}</span>
          </button>
        </div>

      </div>
    `;
  },

  renderLevelFeatureCard(state, rubro) {
    if (state.currentLevel === 'l1') {
      return `
        <div class="bg-surface-container-low/80 backdrop-blur-xl rounded-2xl p-4 border border-white/5 shadow-lg flex flex-col gap-2.5">
          <h4 class="text-xs sm:text-sm font-bold font-display text-on-surface flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-base">confirmation_number</span>
            <span>Ticket Digital Confirmado #TK-71A0</span>
          </h4>
          <div class="bg-surface-container-lowest rounded-xl p-3.5 border border-white/10 space-y-2 wa-bubble-preview">
            <div class="flex justify-between items-center pb-2 border-b border-white/5 text-xs text-slate-300">
              <span class="font-bold text-white">${rubro.bizName}</span>
              <span class="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">CONFIRMADO</span>
            </div>
            <p class="text-[11px] text-slate-400">Reserva 100% confirmada sin colisiones. Tu cliente recibe su comprobante digital con botón de calendario y portal de autogestión.</p>
            <div class="flex items-center gap-2 pt-1 text-[11px]">
              <span class="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 flex items-center gap-1 font-medium">
                <span class="material-symbols-outlined text-xs text-primary">calendar_month</span><span>Agendar (.ics)</span>
              </span>
              <span class="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 flex items-center gap-1 font-medium">
                <span class="material-symbols-outlined text-xs text-secondary">event_repeat</span><span>Autogestión 1 Clic</span>
              </span>
            </div>
          </div>
        </div>
      `;
    }

    if (state.currentLevel === 'l2') {
      return `
        <div class="bg-surface-container-low/80 backdrop-blur-xl rounded-2xl p-4 border border-white/5 shadow-lg flex flex-col gap-2.5">
          <h4 class="text-xs sm:text-sm font-bold font-display text-on-surface flex items-center gap-2">
            <span class="material-symbols-outlined text-secondary text-base">confirmation_number</span>
            <span>Comprobante Digital #TK-84B2</span>
          </h4>
          <div class="bg-surface-container-lowest rounded-xl p-3.5 border border-white/10 space-y-2">
            <div class="flex justify-between items-center pb-2 border-b border-white/5 text-xs text-slate-300">
              <span class="font-bold text-white">${rubro.bizName}</span>
              <span class="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">CONFIRMADO</span>
            </div>
            <p class="text-[11px] text-slate-400">Horario asegurado en tiempo real sin solapamientos. El cliente puede consultar o cancelar con su link de autogestión.</p>
          </div>
        </div>
      `;
    }

    return `
      <div class="bg-surface-container-low/80 backdrop-blur-xl rounded-2xl p-4 border border-white/5 shadow-lg flex flex-col gap-2.5">
        <h4 class="text-xs sm:text-sm font-bold font-display text-on-surface flex items-center gap-2">
          <span class="material-symbols-outlined text-primary-fixed text-base">groups</span>
          <span>Multi-Staff & Cron T-2hs</span>
        </h4>
        <div class="bg-surface-container-lowest rounded-xl p-3 border border-white/10 space-y-1.5 text-xs text-slate-300">
          <div class="flex items-center justify-between">
            <span class="text-slate-400 font-mono text-[10px]">RECORDATORIO AUTOMÁTICO</span>
            <span class="text-indigo-400 font-mono text-[10px]">T-2hs WhatsApp</span>
          </div>
          <p class="text-[11px] text-slate-300 leading-relaxed">Barredora desatendida que avisa al cliente 2 horas antes de su turno evitando ausencias.</p>
        </div>
      </div>
    `;
  }
};
