// Archivo: js/components/cases.js
/**
 * 🏆 Tucu Red Web V2 - Vidriera Editorial de Comercios Reales & Métricas Tangibles
 * Conecta cada caso real directamente con su simulación en vivo dentro del Showroom.
 */

const REAL_CASES = [
  {
    id: 'barberia',
    category: 'Peluquería & Salón Unisex',
    title: 'The Barber Club',
    location: 'Yerba Buena, Tucumán',
    metric: '+180 turnos/semana',
    metricColor: 'bg-indigo-600 text-white',
    description: 'Agenda multi-barbero con bloqueo inteligente de solapamientos y recordatorios automáticos por WhatsApp.',
    image: '/assets/showcase/hero_peluqueria.webp',
    levelId: 'l3',
    spanClass: 'col-span-1 md:col-span-6 lg:col-span-7 h-[380px] sm:h-[420px]'
  },
  {
    id: 'resto',
    category: 'Gastronomía & Restó',
    title: 'Don Fuego Parrilla',
    location: 'Barrio Norte, S.M. de Tucumán',
    metric: '3.4x rotación de mesas',
    metricColor: 'bg-orange-500 text-white',
    description: 'Reserva de mesas por sector (Salón Climatizado, Terraza, Cava VIP) con confirmación en 3 toques.',
    image: '/assets/showcase/hero_resto.png',
    levelId: 'l2',
    spanClass: 'col-span-1 md:col-span-6 lg:col-span-5 h-[380px] sm:h-[420px]'
  },
  {
    id: 'estetica',
    category: 'Estética & Spa',
    title: 'Lumina Estudio de Uñas & Pestañas',
    location: 'Centro, S.M. de Tucumán',
    metric: 'Cero llamadas perdidas',
    metricColor: 'bg-emerald-600 text-white',
    description: 'Catálogo de servicios de manicuría y pestañas con turnos sin superposiciones y recordatorios por WhatsApp.',
    image: '/assets/showcase/hero_unas.webp',
    levelId: 'l3',
    spanClass: 'col-span-1 md:col-span-6 lg:col-span-4 h-[360px] sm:h-[400px]'
  },
  {
    id: 'deportes',
    category: 'Complejos Deportivos',
    title: 'La Redonda Padel & Fútbol',
    location: 'Tafí Viejo, Tucumán',
    metric: '98% ocupación nocturna',
    metricColor: 'bg-indigo-600 text-white',
    description: 'Grilla de canchas en tiempo real que elimina los huecos libres de último momento desde el celular.',
    image: '/assets/showcase/hero_sports.png',
    levelId: 'l2',
    spanClass: 'col-span-1 md:col-span-6 lg:col-span-4 h-[360px] sm:h-[400px]'
  },
  {
    id: 'salud',
    category: 'Salud & Consultorios',
    title: 'Centro Médico San Martín',
    location: 'Barrio Norte, S.M. de Tucumán',
    metric: 'Turnos organizados',
    metricColor: 'bg-teal-600 text-white',
    description: 'Agenda médica por especialista con registro obligatorio de obra social y tiempos de consulta ordenados.',
    image: '/assets/showcase/hero_salud.webp',
    levelId: 'l3',
    spanClass: 'col-span-1 md:col-span-12 lg:col-span-4 h-[360px] sm:h-[400px]'
  }
];

export function renderCases(containerId = 'app-cases') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <section id="cases" class="py-20 lg:py-24 max-w-[1440px] mx-auto px-4 sm:px-8">
      
      <!-- Encabezado Editorial -->
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div class="space-y-3 max-w-2xl">
          <span class="text-xs font-bold tracking-widest uppercase text-indigo-600 font-headline block">
            COMERCIOS EN ACCIÓN
          </span>
          <h2 class="font-headline font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 tracking-tight leading-tight">
            Negocios reales que resuelven su día a día con Tucu Red.
          </h2>
        </div>
        <p class="text-slate-500 text-sm md:text-base font-normal max-w-xl leading-relaxed">
          Mirá cómo se adapta la experiencia según el ritmo y la atención de cada rubro.
        </p>
      </div>

      <!-- Grilla Editorial Fluida -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
        ${REAL_CASES.map((item) => `
          <article class="${item.spanClass} case-editorial-card group cursor-pointer" data-case-rubro="${item.id}" data-case-level="${item.levelId}">
            <img
              src="${item.image}"
              alt="${item.title}"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent flex flex-col justify-end p-6 sm:p-8">
              <div class="flex flex-wrap items-center gap-2 mb-3">
                <span class="px-3.5 py-1 rounded-full ${item.metricColor} text-xs font-extrabold tracking-wide shadow-md">
                  ${item.metric}
                </span>
                <span class="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold border border-white/15">
                  ${item.category}
                </span>
              </div>
              <h3 class="text-2xl sm:text-3xl font-headline font-bold text-white mb-1.5">
                ${item.title}
              </h3>
              <p class="text-slate-200 text-xs sm:text-sm max-w-xl leading-relaxed mb-4">
                ${item.description}
              </p>
              <div class="flex items-center justify-between pt-3 border-t border-white/15 text-xs text-white/90 font-semibold">
                <span class="flex items-center gap-1 text-slate-300">
                  <span class="material-symbols-outlined text-sm text-orange-400">location_on</span>
                  <span>${item.location}</span>
                </span>
                <span class="inline-flex items-center gap-1.5 text-orange-400 group-hover:translate-x-1 transition-transform font-bold">
                  <span>Probar este rubro en vivo</span>
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
