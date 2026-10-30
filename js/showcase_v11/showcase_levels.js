// Archivo: js/showcase_v11/showcase_levels.js
/**
 * ⚡ TucuRed Showcase v11.1 - Selector de Niveles & FAQ Interactivo
 * Orden responsive optimizado, estilos translúcidos y sin botones redundantes.
 */

export const ShowcaseLevels = {
  faqOpenIndex: null,

  toggleFaq(index) {
    this.faqOpenIndex = this.faqOpenIndex === index ? null : index;
    const state = window.ShowcaseCore ? window.ShowcaseCore.getState() : null;
    this.render('levels-container', state);
  },

  render(containerId, state) {
    const container = document.getElementById(containerId);
    if (!container || !state) return;

    const levels = Object.values(state.levels);
    const faqs = [
      { q: '¿Puedo cambiar de nivel más adelante?', a: 'Sí, la migración entre niveles es instantánea y conserva tus datos y configuración.' },
      { q: '¿Requiere servidores o descargas?', a: 'No, opera 100% en la nube con tecnología local-first sin descargas ni instalaciones.' },
      { q: '¿Mis clientes deben crearse una cuenta?', a: 'No, tus clientes reservan en 3 toques directamente con su número de WhatsApp.' }
    ];

    container.innerHTML = `
      <div class="bg-surface-container-low shadow-lg rounded-2xl border border-white/5 p-3.5 sm:p-4 flex flex-col gap-3">
        
        <!-- Encabezado de Columna -->
        <div>
          <h2 class="text-sm sm:text-base font-bold font-display text-primary tracking-tight">Niveles del Sistema</h2>
          <p class="text-[11px] text-on-surface-variant mt-0.5">Seleccioná una opción para verla en vivo</p>
        </div>

        <!-- Lista de Niveles Stitch Style con Acento Translúcido -->
        <nav class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2">
          ${levels.map(lvl => {
            const isActive = state.currentLevel === lvl.id;
            return `
              <button 
                type="button" 
                onclick="window.ShowcaseCore.selectLevel('${lvl.id}')"
                class="w-full text-left p-2.5 rounded-xl transition-all relative overflow-hidden group cursor-pointer flex items-center justify-between gap-2.5 ${
                  isActive 
                    ? 'bg-[#06c85d]/15 text-[#41e575] border border-[#06c85d]/30 font-semibold shadow-md rim-light' 
                    : 'text-on-surface-variant hover:bg-surface-variant/60 hover:text-on-surface border border-transparent'
                }"
              >
                <div class="flex items-center gap-2.5">
                  <span class="material-symbols-outlined text-lg" style="font-variation-settings: 'FILL' ${isActive ? '1' : '0'};">
                    ${lvl.iconSymbol || 'bolt'}
                  </span>
                  <div>
                    <h3 class="text-xs sm:text-sm font-bold tracking-tight leading-tight">
                      ${lvl.name}
                    </h3>
                    <span class="text-[10px] opacity-80 block mt-0.5">
                      ${lvl.popularBadge || 'Disponible'}
                    </span>
                  </div>
                </div>

                <span class="text-xs font-mono opacity-60 group-hover:translate-x-0.5 transition-transform">
                  ${isActive ? '●' : '→'}
                </span>
              </button>
            `;
          }).join('')}
        </nav>

        <!-- Acordeón FAQ en Desktop (dentro de la barra lateral izquierda) -->
        <div class="hidden lg:block pt-2.5 border-t border-white/5 space-y-1.5">
          ${this.renderFaqAccordion(faqs)}
        </div>

      </div>
    `;

    // Renderizar FAQ en Mobile al fondo del flujo
    const mobileFaqContainer = document.getElementById('faq-mobile-container');
    if (mobileFaqContainer) {
      mobileFaqContainer.innerHTML = `
        <div class="bg-surface-container-low shadow-lg rounded-2xl border border-white/5 p-4 space-y-2">
          ${this.renderFaqAccordion(faqs)}
        </div>
      `;
    }
  },

  renderFaqAccordion(faqs) {
    return `
      <div class="flex items-center gap-1.5 text-xs font-bold text-on-surface mb-1.5">
        <span class="material-symbols-outlined text-primary text-sm">help</span>
        <span>Preguntas Frecuentes</span>
      </div>

      <div class="space-y-1.5">
        ${faqs.map((faq, idx) => {
          const isOpen = this.faqOpenIndex === idx;
          return `
            <div class="border border-white/5 rounded-xl bg-surface-container-lowest/60 overflow-hidden transition-all">
              <button 
                type="button" 
                onclick="window.ShowcaseLevels.toggleFaq(${idx})" 
                class="w-full p-2 text-left text-[11px] font-medium text-on-surface-variant hover:text-on-surface flex justify-between items-center cursor-pointer gap-2"
              >
                <span>${faq.q}</span>
                <span class="material-symbols-outlined text-xs text-primary transition-transform ${isOpen ? 'rotate-180' : ''}">expand_more</span>
              </button>
              ${isOpen ? `
                <div class="px-2 pb-2 pt-0 text-[10px] text-on-surface-variant/90 leading-relaxed border-t border-white/5">
                  ${faq.a}
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
};
