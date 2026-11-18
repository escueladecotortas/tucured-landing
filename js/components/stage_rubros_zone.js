// Archivo: js/components/stage_rubros_zone.js
/**
 * 🎨 Tucu Red Web V2 - Zona 1: Barra de Control Glass Fija (3/3) & Segmented Control de Nivel
 * Diferenciación cromática contundente: 6 rubros en Glass translúcido y nivel en pastilla índigo.
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
  },
  {
    id: 'servicios',
    name: 'Servicios',
    emoji: '💼',
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
      <!-- Selector de 6 Rubros: Grilla Fija 3x2 en Mobile y Fila Completa en Desktop -->
      <div class="grid grid-cols-3 gap-2 sm:flex sm:justify-center sm:items-center sm:gap-2.5 max-w-4xl mx-auto px-1">
        ${STAGE_RUBROS.map(item => {
          const isActive = curRubroId === item.id;
          return `
            <button
              type="button"
              onclick="window.ShowcaseCore.selectRubro('${item.id}')"
              class="sm:flex-initial py-2 sm:py-2.5 px-2.5 sm:px-4 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center cursor-pointer transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-50/90 border-indigo-500 text-indigo-900 font-extrabold ring-1 ring-indigo-500/20 shadow-xs'
                  : 'backdrop-blur-md bg-white/70 border-slate-200/80 text-slate-700 shadow-xs hover:border-slate-300 hover:bg-white/90'
              }"
            >
              <span class="tracking-tight truncate">${item.name}</span>
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
