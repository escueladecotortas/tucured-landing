// Archivo: js/components/funnel_markup.js
// Lanzador limpio de #funnel hacia /empezar.html con la nueva mascota flotante transparente (< 65L)

import { EXPANDED_RUBROS, FUNNEL_LEVELS } from './funnel_data.js';
import { WA_FALLBACK_URL } from '../utils/whatsapp_link.js';

export { EXPANDED_RUBROS, EXPANDED_RUBROS as FUNNEL_RUBROS, FUNNEL_LEVELS };

export function getFunnelMarkup() {
  return `
    <section id="funnel" class="py-16 lg:py-24 max-w-[1040px] mx-auto px-4 sm:px-8">
      <div class="bg-white rounded-[2.25rem] p-6 sm:p-10 lg:p-12 shadow-xl border border-stone-200/90">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-7">
          <div class="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-5 max-w-xl text-center sm:text-left">
            <div id="funnel-mascot-mount" class="w-24 h-24 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center pointer-events-none">
              <video id="funnel-mascot-video" class="tucu-funnel-mascot w-full h-full object-contain" autoplay loop muted playsinline poster="/assets/mascot/mascot_poster.webp" aria-hidden="true">
                <source src="/assets/mascot/idle.webm" type="video/webm" />
              </video>
            </div>
            <div class="space-y-1.5">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-[11px] font-bold uppercase tracking-wider">
                <span>Estudio Guiado TucuRed</span>
              </span>
              <h2 class="font-headline font-extrabold text-2xl sm:text-3xl text-stone-900 tracking-tight leading-tight">
                Armá tu App de turnos en 2 minutos y mirala cobrar vida paso a paso
              </h2>
              <p class="text-sm text-stone-600 leading-relaxed">
                Elegís tu portada, color, frase y primeros servicios con vista previa en vivo. Activás tu Mes Fundador por $4.999 el primer mes.
              </p>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 lg:min-w-[270px]">
            <a id="btn-funnel-launch" href="/empezar.html" class="px-6 py-4 rounded-2xl bg-stone-900 hover:bg-orange-600 text-white font-headline font-extrabold text-sm sm:text-base text-center transition-colors shadow-md">
              Crear mi App de turnos ahora →
            </a>
            <a id="btn-funnel-wa" href="${WA_FALLBACK_URL}" target="_blank" rel="noopener noreferrer" class="px-5 py-3 rounded-2xl bg-[#FAF8F5] hover:bg-stone-100 border border-stone-200 text-stone-800 text-xs sm:text-sm font-bold text-center transition-colors">
              ¿Preferís hablar por WhatsApp?
            </a>
          </div>
        </div>
      </div>
    </section>
  `;
}