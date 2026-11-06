// Archivo: js/showcase_v11/showcase_admin_preview.js
/**
 * ⚡ TucuRed Showcase v11.1 - Previsualización de Trastienda /Admin Real por Iframe
 * Sincronizado con L1 (Autónomo), L2 (Central Pro) y L3 (Multi-Equipo).
 * Restricción estricta: < 200 líneas (< 180L) y Protocolo PEAC.
 */

export function getAdminUrlForLevel(level) {
  const lvl = String(level || 'l1').toLowerCase();
  if (lvl === 'l3' || lvl === 'multi_equipo' || lvl === 'multi-equipo') {
    return '/admin_l3.html?slug=demo-staff&embed=true';
  }
  if (lvl === 'l2' || lvl === 'central_pro' || lvl === 'central-pro') {
    return '/admin_l2.html?slug=demo-central&embed=true';
  }
  return '/admin_l1.html?slug=demo-peluqueria&embed=true';
}

export function renderAdminPreview(state, curRubro, curLvl) {
  const lvlId = state?.currentLevel || 'l1';
  const adminUrl = getAdminUrlForLevel(lvlId);

  return `
    <div class="relative w-full h-[540px] sm:h-[580px] overflow-hidden rounded-b-[2rem] bg-slate-50">
      <!-- Spinner sutil mientras carga el iframe -->
      <div id="admin-iframe-loader" class="absolute inset-0 flex items-center justify-center bg-slate-50 z-10 transition-opacity duration-300">
        <div class="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <iframe 
        id="showcase-admin-frame"
        src="${adminUrl}" 
        class="w-full h-full border-0 select-none"
        loading="lazy"
        title="Panel de Control Tucu Red"
        onload="(function(f){const l=document.getElementById('admin-iframe-loader');if(l){l.classList.add('opacity-0');setTimeout(()=>l.remove(),300);}})(this)"
      ></iframe>
    </div>
  `;
}
