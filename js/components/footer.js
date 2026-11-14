// Archivo: js/components/footer.js
/**
 * 🏛️ Tucu Red Web V2 - Footer Institucional & Créditos
 * Incluye identidad oficial SVG (/assets/tucu_red_logo_full.svg) y pasarela WhatsApp.
 * Restricción estricta: < 200 líneas (< 180L).
 */

import { WA_FALLBACK_URL } from '../utils/whatsapp_link.js';

export function renderFooter(containerId = 'app-footer') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const year = new Date().getFullYear();

  container.innerHTML = `
    <footer class="w-full py-12 px-4 sm:px-8 border-t border-slate-200/80 bg-white component-enter">
      <div class="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        
        <!-- Logo Oficial SVG -->
        <a href="#" class="flex items-center focus:outline-none group">
          <img
            src="/assets/tucu_red_logo_full.svg"
            alt="TucuRed"
            class="h-10 w-auto object-contain group-hover:scale-105 transition-transform"
          />
        </a>

        <!-- Enlaces Rápidos -->
        <div class="flex flex-wrap justify-center items-center gap-6 text-xs font-semibold text-slate-500">
          <a href="#soluciones" class="hover:text-indigo-600 transition-colors">Soluciones</a>
          <a href="#cases" class="hover:text-indigo-600 transition-colors">Comercios Reales</a>
          <a href="#showroom" class="hover:text-indigo-600 transition-colors">Showroom en Vivo</a>
          <a href="#funnel" class="hover:text-indigo-600 transition-colors">Sumar mi negocio</a>
          <a href="${WA_FALLBACK_URL}" target="_blank" rel="noopener noreferrer" class="hover:text-emerald-600 text-emerald-700 transition-colors flex items-center gap-1 font-bold">
            <span class="material-symbols-outlined text-sm">chat</span>
            <span>WhatsApp Directo</span>
          </a>
        </div>

        <!-- Créditos y Cumplimiento Legal -->
        <div class="text-xs text-slate-400 text-center md:text-right space-y-1">
          <p>© ${year} Tucu Red — Herramientas Digitales para Negocios. Tucumán, Argentina.</p>
          <p class="text-[11px] text-slate-400/90 font-medium">
            Conforme a la Ley 25.326 de Protección de Datos Personales (Rep. Argentina).
          </p>
        </div>

      </div>
    </footer>
  `;
}
