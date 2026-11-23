// Archivo: js/components/stage_unified.js
// Contenedor editorial de Showroom V2 en 2 Secciones Independientes (< 25L)

export function renderStageUnified(containerId = 'app-stage') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div id="showroom" class="relative component-enter">
      <div id="cases" class="absolute -top-12"></div>
      <div id="showroom-v2-root"></div>
    </div>
  `;
}
