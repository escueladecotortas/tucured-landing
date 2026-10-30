// Archivo: js/components/navbar.js
/**
 * 🧭 Tucu Red Web V2 - Header Glassmorphic Sticky & Navegación Principal
 * Incluye logo oficial SVG, menú desktop, botón de conversión y menú móvil.
 */

export function renderNavbar(containerId = 'app-navbar') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <header class="sticky top-0 z-50 w-full glass-optic border-b border-slate-900/5 transition-all component-enter">
      <div class="max-w-[1440px] mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
        
        <!-- Identidad Oficial de Marca (SVG Original) -->
        <a href="#" class="flex items-center gap-3 group focus:outline-none">
          <img
            src="/assets/tucu_red_logo_full.svg"
            alt="TucuRed — Herramientas Digitales para Negocios"
            class="h-10 sm:h-11 w-auto object-contain group-hover:scale-105 transition-transform"
          />
        </a>

        <!-- Navegación Desktop (Sin enlace Infraestructura) -->
        <nav class="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <a href="#soluciones" class="text-indigo-600 hover:text-indigo-700 transition-colors">Soluciones</a>
          <a href="#cases" class="hover:text-indigo-600 transition-colors">Comercios Reales</a>
          <a href="#showroom" class="hover:text-indigo-600 transition-colors flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Showroom en Vivo</span>
          </a>
        </nav>

        <!-- Acciones de Conversión -->
        <div class="hidden sm:flex items-center gap-3">
          <a href="#showroom" class="px-4 py-2.5 text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors">
            Probar Turnero
          </a>
          <a href="#funnel" class="px-5 py-2.5 rounded-xl btn-aura-cta text-sm font-bold flex items-center gap-2">
            <span>Sumar mi negocio</span>
            <span class="material-symbols-outlined text-sm">arrow_forward</span>
          </a>
        </div>

        <!-- Botón Menú Mobile -->
        <button
          id="mobile-menu-toggle"
          type="button"
          aria-label="Abrir menú de navegación"
          class="md:hidden p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
        >
          <span class="material-symbols-outlined text-xl" id="mobile-menu-icon">menu</span>
        </button>
      </div>

      <!-- Menú Desplegable Mobile -->
      <div id="mobile-menu-drawer" class="hidden md:hidden border-t border-slate-900/5 bg-white/95 backdrop-blur-xl px-6 py-5 space-y-3 shadow-xl">
        <a href="#soluciones" class="block py-2 text-sm font-bold text-slate-800 hover:text-indigo-600">Soluciones</a>
        <a href="#cases" class="block py-2 text-sm font-bold text-slate-800 hover:text-indigo-600">Comercios Reales</a>
        <a href="#showroom" class="block py-2 text-sm font-bold text-indigo-600">⚡ Showroom Interactivo en Vivo</a>
        <div class="pt-2">
          <a href="#funnel" class="w-full py-3 rounded-xl btn-aura-cta text-sm font-bold flex items-center justify-center gap-2">
            <span>Sumar mi negocio</span>
            <span class="material-symbols-outlined text-sm">rocket_launch</span>
          </a>
        </div>
      </div>
    </header>
  `;

  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const drawer = document.getElementById('mobile-menu-drawer');
  const icon = document.getElementById('mobile-menu-icon');

  if (toggleBtn && drawer && icon) {
    toggleBtn.addEventListener('click', () => {
      const isHidden = drawer.classList.toggle('hidden');
      icon.textContent = isHidden ? 'menu' : 'close';
    });

    drawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        drawer.classList.add('hidden');
        icon.textContent = 'menu';
      });
    });
  }
}
