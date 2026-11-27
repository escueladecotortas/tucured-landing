// Archivo: public/js/empezar/empezar_preview.js
// Vista previa progresiva: marco celular, tabs P4+, selector de estilo en modal móvil y .tucured.com.ar (< 95L)

window.TucuEmpezarPreview = (function () {
  const esc = (str) => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const MODAL_STYLES = [
    { id: 'editorial', label: 'Lámina Editorial' },
    { id: 'poster', label: 'Póster Cristal' },
    { id: 'bento', label: 'Bento Boutique' }
  ];

  function buildPhoneMarkup(st, opts = {}) {
    const showSlug = st.step >= 8 && st.slug;
    const domain = showSlug ? `${st.slug}.tucured.com.ar` : 'Vista previa en vivo';
    const mode = (st.step >= 4 && st.previewMode === 'turnero') ? 'turnero' : 'cover';
    const stylesMod = window.TucuEmpezarPreviewStyles;
    const bodyHtml = mode === 'turnero'
      ? (stylesMod?.renderTurneroPreview?.(st) || '')
      : (stylesMod?.renderCoverStyle?.(st) || '');
    const plan = st.step >= 8 ? window.TucuEmpezarState?.getPlanMeta?.(st.plan) : null;
    const planBadge = plan ? `<span id="preview-plan-badge" class="wg-pill px-3 py-1 rounded-full text-[11px] font-bold">${esc(plan.name)}</span>` : '';
    const tabsBar = st.step >= 4 ? `
      <div id="preview-mode-tabs" class="inline-flex p-1 rounded-2xl wg-pill gap-1 mx-auto">
        <button type="button" data-emp-preview-mode="cover" class="px-3.5 py-1 rounded-xl text-[11px] font-bold cursor-pointer ${mode === 'cover' ? 'wg-option-active' : 'text-stone-600 hover:text-stone-900'}">Portada</button>
        <button type="button" data-emp-preview-mode="turnero" class="px-3.5 py-1 rounded-xl text-[11px] font-bold cursor-pointer ${mode === 'turnero' ? 'wg-option-active' : 'text-stone-600 hover:text-stone-900'}">Turnero</button>
      </div>` : '';
    const curStyle = st.coverStyle || 'editorial';
    const showModalStyles = Boolean(opts.inModal && st.step >= 3 && (st.step >= 10 || mode === 'cover'));
    const modalStyleBar = showModalStyles ? `
      <div id="emp-modal-style-bar" class="w-full max-w-[344px] grid grid-cols-3 gap-1.5">
        ${MODAL_STYLES.map((s) => `<button type="button" data-emp-modal-cover-style="${s.id}" aria-pressed="${curStyle === s.id}" class="px-2 py-1.5 rounded-xl text-[10.5px] font-bold cursor-pointer ${curStyle === s.id ? 'wg-option-active' : 'bg-white/90 text-stone-700 border border-stone-200'}">${esc(s.label)}</button>`).join('')}
      </div>` : '';

    return `
      <div class="flex flex-col items-center space-y-2.5">
        <div class="w-full max-w-[344px] flex flex-wrap items-center justify-between gap-2">
          <div id="preview-domain-pill" class="wg-pill px-3 py-1 rounded-full text-xs font-semibold truncate max-w-[230px]">${esc(domain)}</div>
          ${planBadge}
        </div>
        ${tabsBar}
        ${modalStyleBar}
        <div id="preview-phone-chassis" class="emp-phone-frame flex flex-col">
          <div class="flex-1 min-h-0 overflow-hidden">${bodyHtml}</div>
        </div>
      </div>`;
  }

  function render(mountEl, st, highlightSel = '', opts = {}) {
    if (!mountEl || !st) return;
    mountEl.innerHTML = buildPhoneMarkup(st, opts);
    if (highlightSel) {
      const target = mountEl.querySelector(highlightSel);
      if (target) { target.classList.remove('live-highlight'); void target.offsetWidth; target.classList.add('live-highlight'); }
    }
    syncMobileBar(st);
  }

  function syncMobileBar(st) {
    const titleEl = document.getElementById('emp-float-title'), subEl = document.getElementById('emp-float-sub'), dotEl = document.getElementById('emp-float-dot');
    if (titleEl) titleEl.textContent = (st.comercio || '').trim() || 'Tu negocio';
    if (subEl) { const plan = st.step >= 8 ? window.TucuEmpezarState?.getPlanMeta?.(st.plan)?.name : 'Vista previa en vivo'; subEl.textContent = plan || 'Vista previa en vivo'; }
    if (dotEl) dotEl.style.backgroundColor = window.TucuEmpezarState?.getEffectiveAccent?.(st)?.bg || '#EA580C';
  }

  return { render };
})();