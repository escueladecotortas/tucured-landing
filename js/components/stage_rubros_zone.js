// Archivo: js/components/stage_rubros_zone.js
/**
 * 🎨 Tucu Red Web V2 - Zona 1: Barra de Control Glass Fija (3/2) & Segmented Control de Nivel
 * Diferenciación cromática contundente: rubros en Glass translúcido y nivel en pastilla sólida índigo.
 * Restricción estricta: < 200 líneas (< 150L) y Protocolo PEAC.
 */

export const STAGE_RUBROS = [
  {
    id: 'barberia',
    name: 'Peluquería',
    emoji: '✂️',
    image: '/assets/showcase/hero_peluqueria.webp',
    titleFont: 'font-mono tracking-tight font-black uppercase text-slate-900',
    badgeClass: 'backdrop-blur-md bg-white/10 border border-white/20 text-white shadow-sm'
  },
  {
    id: 'resto',
    name: 'Gastronomía',
    emoji: '🍖',
    image: '/assets/showcase/gastronomia.webp',
    titleFont: 'font-headline font-extrabold tracking-tight text-slate-900',
    badgeClass: 'backdrop-blur-md bg-white/10 border border-white/20 text-white shadow-sm'
  },
  {
    id: 'estetica',
    name: 'Estética',
    emoji: '💅',
    image: '/assets/showcase/hero_unas.webp',
    titleFont: 'font-serif tracking-normal font-bold text-slate-900',
    badgeClass: 'backdrop-blur-md bg-white/10 border border-white/20 text-white shadow-sm'
  },
  {
    id: 'deportes',
    name: 'Deportes',
    emoji: '🎾',
    image: '/assets/showcase/deportes.webp',
    titleFont: 'font-headline font-black tracking-tighter uppercase italic text-slate-900',
    badgeClass: 'backdrop-blur-md bg-slate-900/60 border border-blue-400/30 text-blue-200 shadow-sm'
  },
  {
    id: 'salud',
    name: 'Salud',
    emoji: '🩺',
    image: '/assets/showcase/hero_salud.webp',
    titleFont: 'font-headline font-bold tracking-tight text-slate-900',
    badgeClass: 'backdrop-blur-md bg-white/10 border border-white/20 text-white shadow-sm'
  }
];

export const LEVEL_SEGMENTS = [
  { id: 'l1', label: 'Autónomo', fullLabel: 'Nivel 1: Autónomo' },
  { id: 'l2', label: 'Central Pro', fullLabel: 'Nivel 2: Central Pro' },
  { id: 'l3', label: 'Multi-Equipo', fullLabel: 'Nivel 3: Multi-Equipo' }
];

export function renderStageRubrosZone(containerId, state) {
  const container = document.getElementById(containerId);
  if (!container || !state) return;

  const curRubroId = state.currentRubro || 'barberia';
  const curLvlId = state.currentLevel || 'l2';

  container.innerHTML = `
    <div class="space-y-3 sm:space-y-4">
      <!-- Selector de Rubros: Grilla Fija 3/2 en Mobile y Fila Completa en Desktop -->
      <div class="grid grid-cols-6 gap-2 sm:flex sm:justify-center sm:items-center sm:gap-2.5 max-w-3xl mx-auto px-1">
        ${STAGE_RUBROS.map((item, idx) => {
          const isActive = curRubroId === item.id;
          let colClasses = 'col-span-2 sm:col-auto sm:flex-initial';
          if (idx === 3) colClasses = 'col-span-2 col-start-2 sm:col-auto sm:col-start-auto sm:flex-initial';
          if (idx === 4) colClasses = 'col-span-2 sm:col-auto sm:flex-initial';

          return `
            <button
              type="button"
              onclick="window.ShowcaseCore.selectRubro('${item.id}')"
              class="${colClasses} py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center cursor-pointer transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-50/90 border-indigo-500 text-indigo-900 font-extrabold ring-1 ring-indigo-500/20 shadow-xs'
                  : 'backdrop-blur-md bg-white/70 border-slate-200/80 text-slate-700 shadow-xs hover:border-slate-300 hover:bg-white/90'
              }"
            >
              <span class="tracking-tight">${item.name}</span>
            </button>
          `;
        }).join('')}
      </div>

      <!-- Selector de Nivel: Segmented Control Compacto Horizontal (~38px) -->
      <div class="flex justify-center w-full px-1">
        <div class="inline-flex items-center justify-between p-1 rounded-2xl bg-slate-200/80 border border-slate-300/60 h-[38px] sm:h-10 w-full max-w-md gap-1 shadow-inner">
          ${LEVEL_SEGMENTS.map(lvl => {
            const isActive = curLvlId === lvl.id;
            return `
              <button
                type="button"
                onclick="window.ShowcaseCore.selectLevel('${lvl.id}')"
                class="flex-1 h-full px-3 py-1.5 text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white font-bold shadow-sm scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }"
              >
                <span class="truncate">${lvl.label}</span>
              </button>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}
