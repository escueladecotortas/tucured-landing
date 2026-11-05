// Archivo: js/components/stage_unified.js
/**
 * ⚡ Tucu Red Web V2 - Escenario Interactivo Central Unificado (Jerarquía Árbol Natural)
 * [1. Rubro] -> [2. Nivel] -> [3. Teléfono Piel Clara] -> [4. Especificaciones 100% Visibles] -> [5. CTA]
 * Restricción estricta: < 200 líneas (< 150L) y Protocolo PEAC.
 */

import { renderStageRubrosZone } from './stage_rubros_zone.js';
import { renderStageValueZone } from './stage_value_zone.js';
import { ShowcaseMockup } from '../showcase_v11/showcase_mockup.js';
import { ShowcaseState } from '../showcase_v11/showcase_state.js';

export function renderStageUnified(containerId = 'app-stage') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <section id="showroom" class="py-10 sm:py-14 lg:py-20 relative component-enter">
      <!-- Ancla de compatibilidad para navegación #cases -->
      <div id="cases" class="absolute -top-12"></div>
      
      <div class="max-w-[1440px] mx-auto px-4 sm:px-8">
        <!-- Encabezado Editorial Limpio y Luminoso -->
        <div class="text-center max-w-3xl mx-auto mb-6 sm:mb-8 space-y-2">
          <h2 class="font-headline font-extrabold text-2xl sm:text-3xl lg:text-4xl text-slate-900 tracking-tight leading-tight">
            Probá tu Turnero en Vivo
          </h2>
          <p class="text-slate-600 text-xs sm:text-sm lg:text-base leading-relaxed max-w-2xl mx-auto">
            Elegí tu rubro para probar cómo tus clientes reservan turno en segundos y cómo se ve tu panel de control.
          </p>
        </div>

        <!-- Jerarquía Superior: Paso 1 (Rubro) y Paso 2 (Nivel de Turnero) -->
        <div id="stage-rubros-container" class="max-w-4xl mx-auto mb-8 sm:mb-10"></div>

        <!-- Cuerpo Central: Smartphone Protagonista (Piel Clara) + Especificaciones 100% Visibles -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start max-w-6xl mx-auto">
          <!-- Zona 2: Smartphone Central Protagonista -->
          <div id="mockup-container" class="lg:col-span-5 xl:col-span-5 flex justify-center"></div>

          <!-- Zona 3: Especificaciones Siempre Visibles (Chau Acordeón) y CTA Directo -->
          <div id="stage-value-container" class="lg:col-span-7 xl:col-span-7"></div>
        </div>
      </div>
    </section>
  `;

  renderStageComponents();
}

export function renderStageComponents() {
  renderStageRubrosZone('stage-rubros-container', ShowcaseState);
  ShowcaseMockup.render('mockup-container', ShowcaseState);
  renderStageValueZone('stage-value-container', ShowcaseState);
}
