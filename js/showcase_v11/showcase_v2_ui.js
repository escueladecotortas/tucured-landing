// Archivo: js/showcase_v11/showcase_v2_ui.js
// Seccion 1 del Showroom V2: Turnero Unico del Cliente (#showroom-cliente) y utilidades UI compartidas (< 150L)

import { CLIENT_EXPERIENCE_BENEFITS } from './showcase_state.js';

export const SVG = {
  check: '<svg class="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>',
  phone: '<svg class="w-4 h-4 shrink-0 text-indigo-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="7" y="2" width="10" height="20" rx="2"/><path stroke-linecap="round" d="M11 18h2"/></svg>',
  store: '<svg class="w-4 h-4 shrink-0 text-amber-700" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 9l1.5-4.5h15L21 9v1a2 2 0 01-4 0 2 2 0 01-4 0 2 2 0 01-4 0V9zm2 3v7h14v-7"/></svg>',
  puzzle: '<svg class="w-4 h-4 shrink-0 text-indigo-600 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"/></svg>',
  expand: '<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2.1" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
  arrow: '<svg class="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" stroke-width="2.3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-6-6l6 6-6 6"/></svg>'
};

export const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function renderClientToggleMarkup(state) {
  const on = Boolean(state.clientMultiStaff);
  return `
    <div class="flex justify-center">
      <label for="chk-client-multistaff" class="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/95 border border-stone-200/90 shadow-2xs text-xs sm:text-sm text-stone-700 hover:border-stone-300 cursor-pointer select-none transition-colors max-w-full">
        <input type="checkbox" id="chk-client-multistaff" ${on ? 'checked' : ''} class="w-4 h-4 rounded border-stone-300 text-indigo-600 focus:ring-indigo-500 shrink-0 cursor-pointer">
        <span class="font-semibold text-stone-800">Incluir elección de profesional o cancha <span class="text-stone-500 font-medium">(Modo Equipos)</span></span>
      </label>
    </div>`;
}

export function renderClientMobileCard(state) {
  const r = state.getCurrentRubro(), on = Boolean(state.clientMultiStaff);
  return `
    <div id="showroom-mobile-client-card" class="relative w-full rounded-3xl overflow-hidden shadow-lg aspect-[4/5] max-h-[520px] bg-stone-950 text-white flex flex-col justify-between">
      <img src="${esc(r.poster)}" alt="${esc(r.bizName)}" class="absolute inset-0 w-full h-full object-cover object-center pointer-events-none" loading="eager">
      <video id="showroom-mobile-video" class="absolute inset-0 w-full h-full object-cover object-center pointer-events-none" autoplay muted loop playsinline preload="metadata" poster="${esc(r.poster)}">
        <source src="${esc(r.video)}" type="video/mp4">
      </video>
      <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/20 pointer-events-none"></div>
      <div class="relative z-10 p-4 flex items-center justify-between gap-2">
        <span class="px-3 py-1 rounded-full bg-black/45 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-white/95">${esc(r.shortLabel)}</span>
        <span class="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-white">${on ? 'Modo Equipos' : 'Turnero Único'}</span>
      </div>
      <div class="relative z-10 p-5 space-y-3">
        <div class="flex items-center gap-3 min-w-0">
          <img src="${esc(r.logo)}" alt="Logo ${esc(r.bizName)}" class="w-11 h-11 rounded-xl object-contain bg-white p-1 shrink-0 shadow-sm">
          <div class="min-w-0">
            <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">PORTADA EN VIVO</p>
            <h3 class="text-xl font-bold text-white leading-tight truncate">${esc(r.bizName)}</h3>
            <p class="text-xs text-white/85 truncate">${esc(r.tagline)}</p>
          </div>
        </div>
        <button type="button" id="btn-open-client-fullscreen" data-open-fullscreen="client" style="background-color:${esc(r.accent)}" class="w-full py-3.5 px-4 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl cursor-pointer transition-transform active:scale-[0.99]">
          ${SVG.expand}
          <span>Probar Turnero en pantalla completa</span>
        </button>
      </div>
    </div>`;
}

export function renderClientEditorialCard(state) {
  const r = state.getCurrentRubro(), on = Boolean(state.clientMultiStaff);
  return `
    <div id="showroom-client-editorial-card" class="rounded-3xl bg-white border border-stone-200/90 shadow-sm p-5 sm:p-6 space-y-4">
      <div class="flex items-center justify-between gap-3 pb-3 border-b border-stone-100">
        <div class="flex items-center gap-3 min-w-0">
          <img src="${esc(r.logo)}" alt="Logo ${esc(r.bizName)}" class="w-11 h-11 rounded-xl object-contain bg-stone-50 border border-stone-200/80 p-1 shrink-0">
          <div class="min-w-0">
            <h3 class="font-headline font-bold text-base text-slate-900 truncate">${esc(r.bizName)}</h3>
            <p class="text-xs text-slate-500 truncate">${esc(r.shortLabel)} · ${on ? 'Con elección de especialista/cancha' : 'Turnero editorial directo'}</p>
          </div>
        </div>
        <span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold shrink-0">Experiencia Única</span>
      </div>
      <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
        Elijas el plan que elijas, tus clientes reservan siempre en este Turnero V2 editorial luminoso, sin descargar apps ni crear cuentas.
      </p>
      <div class="space-y-2">
        <div class="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-800">${SVG.phone}<span>Lo que vive tu cliente</span></div>
        <ul class="space-y-2.5">${CLIENT_EXPERIENCE_BENEFITS.map(t => `<li class="flex items-start gap-2 text-xs sm:text-sm text-slate-700 leading-snug">${SVG.check}<span>${esc(t)}</span></li>`).join('')}</ul>
      </div>
      <div class="pt-2 space-y-2.5">
        <a href="#showroom-admin" id="btn-scroll-to-admin" class="group w-full py-3.5 px-5 rounded-2xl bg-slate-900 hover:bg-indigo-600 text-white font-headline font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all">
          <span>Elegí tu Panel de Dueño</span>
          ${SVG.arrow}
        </a>
        <div class="text-center">
          <a href="/empezar.html" class="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">¿Ya lo conocés? Configurar mi local en /empezar &rarr;</a>
        </div>
      </div>
    </div>`;
}

export function renderClientSectionShell(state) {
  return `
    <section id="showroom-cliente" class="py-10 sm:py-14 lg:py-20">
      <div class="max-w-[1440px] mx-auto px-4 sm:px-8 space-y-6 sm:space-y-7">
        <div class="text-center max-w-3xl mx-auto space-y-2">
          <span class="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/70 text-indigo-700 text-[11px] font-bold uppercase tracking-widest">Paso 1 · Vista de tus Clientes</span>
          <h2 class="font-headline font-extrabold text-2xl sm:text-3xl lg:text-4xl text-slate-900 tracking-tight leading-tight">
            Probá el Turnero de tus Clientes
          </h2>
          <p class="text-slate-600 text-xs sm:text-sm lg:text-base leading-relaxed max-w-2xl mx-auto">
            Elegí tu rubro y comprobá la experiencia única de reserva online que entregamos en todos los planes.
          </p>
        </div>
        <div class="space-y-3.5">
          <div id="showroom-carousel-host"></div>
          <div id="showroom-client-toggle-host">${renderClientToggleMarkup(state)}</div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start max-w-6xl mx-auto">
          <div class="lg:col-span-7">
            <div id="showroom-client-desktop-viewer" class="hidden lg:block relative w-full h-[680px] rounded-3xl border border-stone-200 shadow-xl overflow-hidden bg-white">
              <div id="showroom-client-desktop-loader" class="absolute inset-0 flex items-center justify-center bg-white z-10 pointer-events-none">
                <div class="w-6 h-6 border-2 border-stone-900 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <iframe id="showroom-client-iframe" src="about:blank" title="Turnero de tus clientes en vivo" class="w-full h-full border-0 bg-white block"></iframe>
            </div>
            <div id="showroom-client-mobile-host" class="lg:hidden">${renderClientMobileCard(state)}</div>
          </div>
          <div id="showroom-client-editorial-host" class="lg:col-span-5">${renderClientEditorialCard(state)}</div>
        </div>
      </div>
    </section>`;
}
