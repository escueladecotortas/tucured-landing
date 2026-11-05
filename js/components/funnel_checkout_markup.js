// Archivo: js/components/funnel_checkout_markup.js
/**
 * 💳 Tucu Red Web V2 - Markup del Paso 4 (Checkout QR & Alias Interoperable)
 * Resumen de alta comercial, código QR, alias copiable y activación $1.000.
 * Restricción estricta: < 200 líneas (< 180L) y Protocolo PEAC.
 */

import { TUCURED_CHECKOUT_CONFIG } from './funnel_data.js';

export function getCheckoutStepMarkup() {
  const cfg = TUCURED_CHECKOUT_CONFIG;
  return `
    <div id="funnel-step-4" class="space-y-6 hidden">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 class="font-headline font-bold text-xl text-slate-900 flex items-center gap-2">
          <span class="material-symbols-outlined text-indigo-600">qr_code_2</span>
          <span>Paso 4: Activación y Cierre Transaccional</span>
        </h3>
        <span class="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold font-mono border border-emerald-200">
          PROMO $1.000 ARS
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <!-- Columna QR Interoperable -->
        <div class="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-50 border border-slate-200/80 text-center space-y-3">
          <div class="w-44 h-44 p-3 bg-white rounded-2xl shadow-md border border-slate-200 flex items-center justify-center relative group">
            <svg class="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
              <path d="M0,0 h30 v30 h-30 z M6,6 h18 v18 h-18 z M10,10 h10 v10 h-10 z" />
              <path d="M70,0 h30 v30 h-30 z M76,6 h18 v18 h-18 z M80,10 h10 v10 h-10 z" />
              <path d="M0,70 h30 v30 h-30 z M6,76 h18 v18 h-18 z M10,80 h10 v10 h-10 z" />
              <rect x="40" y="10" width="10" height="20" />
              <rect x="10" y="40" width="20" height="10" />
              <rect x="40" y="40" width="20" height="20" />
              <rect x="70" y="40" width="10" height="15" />
              <rect x="40" y="70" width="15" height="20" />
              <rect x="70" y="70" width="20" height="20" />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div class="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-lg font-bold text-xs font-mono">TR</div>
            </div>
          </div>
          <p class="text-xs text-slate-500 font-medium">Escaneá desde Mercado Pago, Ualá o cualquier app bancaria</p>
        </div>

        <!-- Columna Datos de Transferencia y Resumen del Local -->
        <div class="md:col-span-7 space-y-4">
          <div class="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-indigo-900 uppercase font-headline">Resumen de Activación</span>
              <span id="checkout-summary-level" class="text-xs font-bold text-indigo-700 font-mono px-2 py-0.5 rounded-full bg-white border border-indigo-200">Nivel 2</span>
            </div>
            <div class="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-indigo-200/60">
              <div><span class="text-slate-500 block text-[11px]">Comercio:</span><strong id="checkout-summary-name" class="text-slate-900 font-bold">Tu Comercio</strong></div>
              <div><span class="text-slate-500 block text-[11px]">Localidad:</span><strong id="checkout-summary-city" class="text-slate-900 font-bold">Yerba Buena</strong></div>
              <div><span class="text-slate-500 block text-[11px]">Rubro:</span><strong id="checkout-summary-rubro" class="text-slate-900 font-bold">Estética & Spa</strong></div>
              <div><span class="text-slate-500 block text-[11px]">Total Mes 1:</span><strong class="text-emerald-700 font-black text-sm font-mono">${cfg.pricePromo}</strong></div>
            </div>
          </div>

          <!-- Caja de Alias Copiable -->
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-slate-500">Alias CBU / CVU oficial:</span>
              <span class="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                <span class="material-symbols-outlined text-xs">bolt</span> Transferencia Inmediata
              </span>
            </div>
            <div class="flex items-center gap-2">
              <input type="text" id="checkout-alias-input" readonly value="${cfg.aliasCbu}" class="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-mono font-bold text-slate-800 outline-none" />
              <button type="button" id="btn-copy-alias" class="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm">
                <span class="material-symbols-outlined text-sm" id="copy-alias-icon">content_copy</span>
                <span id="copy-alias-text">Copiar Alias</span>
              </button>
            </div>
            <p class="text-[11px] text-slate-400">Titular: <strong class="text-slate-600 font-medium">${cfg.titular}</strong></p>
          </div>
        </div>
      </div>

      <div class="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
        <button type="button" id="btn-back-to-3" class="px-5 py-3 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-bold flex items-center gap-1 cursor-pointer">
          <span class="material-symbols-outlined text-base">arrow_back</span>
          <span>Volver a Contacto</span>
        </button>
        <div class="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <a href="https://mpago.la/pos/tucured" target="_blank" rel="noopener noreferrer" class="text-xs text-indigo-600 hover:text-indigo-800 underline font-medium text-center">
            Pagar con tarjeta o saldo de Mercado Pago (Link directo)
          </a>
          <button type="submit" id="funnel-submit-btn" class="w-full sm:w-auto px-8 py-3.5 rounded-2xl btn-aura-cta font-headline font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer shadow-lg">
            <span>Ya transferí $1.000 • Activar mi local</span>
            <span class="material-symbols-outlined text-lg">check_circle</span>
          </button>
        </div>
      </div>
    </div>
  `;
}
