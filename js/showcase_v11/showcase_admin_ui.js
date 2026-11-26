// Archivo: js/showcase_v11/showcase_admin_ui.js
// Seccion 2 del Showroom V2: Selector de Paneles de Dueno (Turnos / Gestion / Equipos) (< 140L)

import { SVG, esc } from './showcase_v2_ui.js';

export function renderAdminSelectorMarkup(state) {
  const curLvl = state.currentLevel, r = state.getCurrentRubro();
  const levels = Object.values(state.levels);
  return `
    <div id="showroom-admin-selector-bar" class="max-w-5xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      <div class="inline-flex items-center justify-center md:justify-start gap-2.5 px-4 py-2 rounded-2xl bg-white border border-stone-200/90 shadow-2xs min-w-0">
        <img src="${esc(r.logo)}" alt="Logo ${esc(r.bizName)}" class="w-7 h-7 rounded-lg object-contain bg-stone-50 shrink-0">
        <div class="min-w-0 text-left">
          <span class="block text-xs font-bold text-slate-900 truncate">${esc(r.bizName)}</span>
          <span class="block text-[10px] text-slate-500 truncate">${esc(r.shortLabel)} · Paleta y logo sincronizados</span>
        </div>
      </div>
      <div id="showroom-level-tabs" role="tablist" aria-label="Elegir Panel de Dueño" class="flex-1 p-1 rounded-2xl bg-stone-200/80 border border-stone-300/70 grid grid-cols-3 gap-1">
        ${levels.map((l) => {
          const on = curLvl === l.id;
          return `<button type="button" id="btn-showroom-level-${l.id}" data-showroom-level="${l.id}" role="tab" aria-selected="${on}" class="py-2.5 px-2 rounded-xl text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer truncate ${on ? 'bg-stone-900 text-white font-bold shadow-xs' : 'text-stone-700 hover:text-stone-900 font-semibold'}">
            <span class="w-2 h-2 rounded-full shrink-0" style="background-color:${on ? esc(r.accent) : '#A8A29E'}"></span>
            <span class="truncate">${esc(l.shortLabel)}</span>
          </button>`;
        }).join('')}
      </div>
    </div>`;
}

export function renderAdminMobileCard(state) {
  const r = state.getCurrentRubro(), l = state.getCurrentLevel(), m = l.mobileMeta;
  return `
    <div id="showroom-mobile-admin-card" class="w-full rounded-3xl border border-stone-200 bg-[#FAF8F5] shadow-lg p-5 space-y-4 text-stone-900">
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <img src="${esc(r.logo)}" alt="Logo ${esc(r.bizName)}" class="w-12 h-12 rounded-xl object-contain bg-white border border-stone-200/80 p-1 shrink-0">
          <div class="min-w-0">
            <p class="text-[10px] font-bold uppercase tracking-wider text-stone-500">PANEL DE DUEÑO · ${esc(m.badge)}</p>
            <h3 class="text-base font-bold text-stone-900 truncate">${esc(m.title)}</h3>
            <p class="text-xs font-medium text-stone-600 truncate">${esc(r.bizName)}</p>
          </div>
        </div>
        <span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold shrink-0">Recepción abierta</span>
      </div>
      <div class="grid grid-cols-3 gap-2 tabular-nums">
        ${m.kpis.map(([k, v]) => `<div class="p-2.5 rounded-2xl bg-white border border-stone-200/80"><span class="block text-[10px] font-semibold text-stone-500 truncate">${esc(k)}</span><strong class="block text-sm font-bold text-stone-900 mt-0.5 truncate">${esc(v)}</strong></div>`).join('')}
      </div>
      <div class="rounded-2xl bg-white border border-stone-200/80 divide-y divide-stone-100">
        ${m.rows.map(([tm, sub, st]) => `<div class="px-3 py-2 flex items-center justify-between gap-2 text-xs tabular-nums"><div class="min-w-0"><strong class="font-semibold text-stone-900">${esc(tm)}</strong><span class="text-stone-500 ml-1.5 truncate">${esc(sub)}</span></div><span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 shrink-0">${esc(st)}</span></div>`).join('')}
      </div>
      <div class="flex flex-wrap gap-1.5">
        ${m.chips.map(ch => `<span class="px-2.5 py-1 rounded-full bg-white border border-stone-200 text-[11px] font-semibold text-stone-700">${esc(ch)}</span>`).join('')}
      </div>
      <button type="button" id="btn-open-admin-fullscreen" data-open-fullscreen="admin" style="background-color:${esc(r.accent)}" class="w-full py-3.5 px-4 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl cursor-pointer transition-all active:scale-[0.99]">
        ${SVG.expand}
        <span>Probar Panel ${esc(l.shortLabel)} en pantalla completa</span>
      </button>
    </div>`;
}

export function renderAdminValueCard(state) {
  const l = state.getCurrentLevel(), r = state.getCurrentRubro();
  return `
    <div id="showroom-admin-value-card" class="rounded-3xl bg-white border border-stone-200/90 shadow-sm p-5 sm:p-6 space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-100">
        <span class="text-xs font-bold px-3 py-1 rounded-full border tabular-nums ${l.badgeClass}">${esc(l.badge)}</span>
        <span class="text-xs font-semibold text-stone-500 truncate">${esc(r.bizName)}</span>
      </div>
      <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">${esc(l.summary)}</p>
      <div class="space-y-2 pt-1">
        <div class="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-800">${SVG.store}<span>Qué suma el Plan ${esc(l.shortLabel)}</span></div>
        <ul class="space-y-2">${l.ownerBenefits.map(t => `<li class="flex items-start gap-2 text-xs text-stone-700 leading-snug">${SVG.check}<span>${esc(t)}</span></li>`).join('')}</ul>
      </div>
      <div class="pt-1 space-y-2">
        <button type="button" id="btn-showroom-activate" class="group w-full py-4 px-5 rounded-2xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-headline font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer tabular-nums">
          <span>Activar Plan ${esc(l.shortLabel)} por $4.999</span>
          ${SVG.arrow}
        </button>
        <p class="text-[11px] text-center text-stone-500 tabular-nums">Mes Fundador $4.999 el primer mes · Luego ${esc(l.regularPrice)} · Sin comisiones.</p>
      </div>
    </div>`;
}

export function renderAdminSectionShell(state) {
  return `
    <section id="showroom-admin" class="py-12 sm:py-16 lg:py-20 border-t border-slate-200/80 bg-white/60">
      <div class="max-w-[1440px] mx-auto px-4 sm:px-8 space-y-6 sm:space-y-7">
        <div class="text-center max-w-3xl mx-auto space-y-2">
          <span class="inline-flex items-center px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-[11px] font-bold uppercase tracking-widest">Paso 2 · Consola de Administración</span>
          <h2 class="font-headline font-extrabold text-2xl sm:text-3xl lg:text-4xl text-slate-900 tracking-tight leading-tight">
            Elegí tu Panel de Dueño
          </h2>
          <p class="text-slate-600 text-xs sm:text-sm lg:text-base leading-relaxed max-w-2xl mx-auto">
            Misma estética Warm Studio y paleta de tu rubro en los tres planes. Cambiá entre Turnos, Gestión y Equipos para probarlos en vivo.
          </p>
        </div>
        <div id="showroom-admin-selector-host">${renderAdminSelectorMarkup(state)}</div>
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start max-w-6xl mx-auto">
          <div class="lg:col-span-7">
            <div id="showroom-admin-desktop-viewer" class="hidden lg:block relative w-full h-[680px] rounded-3xl border border-stone-200 shadow-xl overflow-hidden bg-white">
              <div id="showroom-admin-desktop-loader" class="absolute inset-0 flex items-center justify-center bg-white z-10 pointer-events-none">
                <div class="w-6 h-6 border-2 border-stone-900 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <iframe id="showroom-admin-iframe" src="about:blank" title="Panel de Dueño en vivo" class="w-full h-full border-0 bg-white block"></iframe>
            </div>
            <div id="showroom-admin-mobile-host" class="lg:hidden">${renderAdminMobileCard(state)}</div>
          </div>
          <div id="showroom-admin-value-host" class="lg:col-span-5">${renderAdminValueCard(state)}</div>
        </div>
      </div>
    </section>`;
}
