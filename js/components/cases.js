// Archivo: js/components/cases.js
/**
 * 🏆 Tucu Red Web V2 - Vidriera Editorial de 5 Rubros Comerciales
 * Fotos despejadas, tipografía identitaria por rubro y carrusel mobile fluido.
 * Restricción estricta: < 200 líneas (< 180L).
 */

const REAL_CASES = [
  {
    id: 'barberia',
    category: 'Peluquería & Barbería',
    title: 'The Barber Club',
    location: 'Yerba Buena, Tucumán',
    description: 'Agenda multi-barbero con bloqueo inteligente de solapamientos y recordatorios automáticos por WhatsApp.',
    image: '/assets/showcase/hero_peluqueria.webp',
    levelId: 'l3',
    spanClass: 'col-span-12 md:col-span-6 lg:col-span-7',
    titleFont: 'font-mono tracking-tight font-black uppercase text-slate-900 text-xl sm:text-2xl',
    badgeClass: 'bg-slate-900/90 text-white'
  },
  {
    id: 'resto',
    category: 'Gastronomía & Restó',
    title: 'Don Fuego Parrilla',
    location: 'Barrio Norte, S.M. de Tucumán',
    description: 'Reserva de mesas por sector (Salón Climatizado, Terraza, Cava VIP) con confirmación en 3 toques.',
    image: '/assets/showcase/hero_resto.png',
    levelId: 'l2',
    spanClass: 'col-span-12 md:col-span-6 lg:col-span-5',
    titleFont: 'font-headline font-extrabold tracking-tight text-slate-900 text-xl sm:text-2xl',
    badgeClass: 'bg-amber-600/90 text-white'
  },
  {
    id: 'estetica',
    category: 'Estética & Spa',
    title: 'Lumina Estudio de Uñas & Pestañas',
    location: 'Centro, S.M. de Tucumán',
    description: 'Catálogo de servicios de manicuría y pestañas con turnos sincronizados y recordatorios por WhatsApp.',
    image: '/assets/showcase/hero_unas.webp',
    levelId: 'l3',
    spanClass: 'col-span-12 md:col-span-6 lg:col-span-4',
    titleFont: 'font-serif tracking-normal font-bold text-slate-900 text-xl sm:text-2xl',
    badgeClass: 'bg-rose-600/90 text-white'
  },
  {
    id: 'deportes',
    category: 'Complejos Deportivos',
    title: 'La Redonda Padel & Fútbol',
    location: 'Tafí Viejo, Tucumán',
    description: 'Grilla de canchas en tiempo real con ocupación máxima y reservas inmediatas desde el celular.',
    image: '/assets/showcase/hero_sports.png',
    levelId: 'l2',
    spanClass: 'col-span-12 md:col-span-6 lg:col-span-4',
    titleFont: 'font-headline font-black tracking-tighter uppercase italic text-slate-900 text-xl sm:text-2xl',
    badgeClass: 'bg-emerald-600/90 text-white'
  },
  {
    id: 'salud',
    category: 'Salud & Consultorios',
    title: 'Centro Médico San Martín',
    location: 'Barrio Norte, S.M. de Tucumán',
    description: 'Agenda médica por especialista con registro obligatorio de obra social y tiempos de consulta ordenados.',
    image: '/assets/showcase/hero_salud.webp',
    levelId: 'l3',
    spanClass: 'col-span-12 md:col-span-12 lg:col-span-4',
    titleFont: 'font-headline font-bold tracking-tight text-slate-900 text-xl sm:text-2xl',
    badgeClass: 'bg-teal-700/90 text-white'
  }
];

export function renderCases(containerId = 'app-cases') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <section id="cases" class="py-20 lg:py-24 max-w-[1440px] mx-auto px-4 sm:px-8">
      
      <!-- Encabezado Editorial con Bajada de Jerarquía Clara -->
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div class="space-y-3 max-w-2xl">
          <span class="text-xs font-bold tracking-widest uppercase text-indigo-600 font-headline block">
            EXPERIENCIA POR RUBRO
          </span>
          <h2 class="font-headline font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 tracking-tight leading-tight">
            Diseñado a la medida del comercio tucumano.
          </h2>
        </div>
        <p class="text-slate-600 text-sm md:text-base font-medium max-w-xl leading-relaxed">
          Mirá cómo se adapta la experiencia al ritmo operativo y comercial de cada rubro.
        </p>
      </div>

      <!-- Grilla Desktop y Carrusel Horizontal Swipeable en Mobile (<768px) -->
      <div class="flex md:grid md:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 overflow-x-auto snap-x snap-mandatory md:overflow-visible pb-6 md:pb-0 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        ${REAL_CASES.map((item) => `
          <article 
            class="${item.spanClass} w-[85vw] max-w-[340px] sm:w-[380px] sm:max-w-none md:w-auto shrink-0 md:shrink snap-center rounded-[2rem] bg-white border border-slate-200/90 shadow-sm hover:shadow-xl transition-all p-3.5 sm:p-4 flex flex-col justify-between group cursor-pointer" 
            data-case-rubro="${item.id}" 
            data-case-level="${item.levelId}"
          >
            <!-- Fotografía Limpia como Protagonista con Badge Sutil -->
            <div class="relative w-full h-48 sm:h-56 rounded-[1.4rem] overflow-hidden bg-slate-100 shrink-0">
              <img
                src="${item.image}"
                alt="${item.title}"
                class="w-full h-full object-cover brightness-[0.95] contrast-[1.02] group-hover:scale-105 group-hover:brightness-100 transition-all duration-700"
              />
              <div class="absolute top-3 left-3">
                <span class="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm border border-white/20 ${item.badgeClass}">
                  ${item.category}
                </span>
              </div>
            </div>
            
            <!-- Contenedor Despejado por Fuera de la Foto -->
            <div class="pt-4 pb-1 px-1.5 flex flex-col justify-between flex-1 gap-2">
              <div>
                <h3 class="${item.titleFont} mb-1.5 leading-snug">
                  ${item.title}
                </h3>
                <p class="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal">
                  ${item.description}
                </p>
              </div>
              
              <div class="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 text-xs font-semibold">
                <span class="flex items-center gap-1 text-slate-400">
                  <span class="material-symbols-outlined text-sm text-indigo-500">location_on</span>
                  <span>${item.location}</span>
                </span>
                <span class="inline-flex items-center gap-1 text-indigo-600 group-hover:translate-x-1 transition-transform font-bold font-headline">
                  <span>Probar en vivo</span>
                  <span class="material-symbols-outlined text-sm">arrow_forward</span>
                </span>
              </div>
            </div>
          </article>
        `).join('')}
      </div>
    </section>
  `;

  container.querySelectorAll('[data-case-rubro]').forEach((card) => {
    card.addEventListener('click', () => {
      const rubro = card.getAttribute('data-case-rubro');
      const level = card.getAttribute('data-case-level') || 'l2';
      if (window.ShowcaseCore) {
        window.ShowcaseCore.selectRubro(rubro);
        window.ShowcaseCore.selectLevel(level);
      }
      const showroomEl = document.getElementById('showroom');
      if (showroomEl) {
        showroomEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}
