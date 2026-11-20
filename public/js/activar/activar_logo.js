// Archivo: public/js/activar/activar_logo.js
// Carga de Logo Local + Validación 5MB + Conversión Automática Canvas a WebP (< 130L)

window.TucuActivarLogo = (function () {
  const MAX_BYTES = 5 * 1024 * 1024;
  const MAX_SIDE = 512;
  const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
  let currentFile = null;
  let currentPreviewUrl = '';

  function revokePreview() {
    if (currentPreviewUrl) {
      try { URL.revokeObjectURL(currentPreviewUrl); } catch {}
      currentPreviewUrl = '';
    }
  }

  function convertToWebP(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('No pudimos leer la imagen seleccionada.'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('El archivo no es una imagen válida.'));
        img.onload = () => {
          const w = img.naturalWidth || img.width || MAX_SIDE;
          const h = img.naturalHeight || img.height || MAX_SIDE;
          const scale = Math.min(1, MAX_SIDE / Math.max(w, h));
          const tw = Math.max(1, Math.round(w * scale));
          const th = Math.max(1, Math.round(h * scale));
          const canvas = document.createElement('canvas');
          canvas.width = tw;
          canvas.height = th;
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, tw, th);
          ctx.drawImage(img, 0, 0, tw, th);
          canvas.toBlob((blob) => {
            if (!blob) return reject(new Error('No pudimos optimizar la imagen a WebP.'));
            const webpFile = new File([blob], 'logo-comercio.webp', { type: 'image/webp' });
            resolve(webpFile);
          }, 'image/webp', 0.85);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function mount(containerEl) {
    if (!containerEl) return;
    containerEl.innerHTML = `
      <div class="p-3.5 rounded-2xl bg-[#FAF7F2] border border-dashed border-[#D5CEC2] space-y-2.5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span class="block text-xs font-bold text-[#1C1917]">Logo del local (opcional)</span>
            <span class="block text-[11px] text-stone-500">PNG, JPG, WebP o SVG · Máx. 5 MB · Se optimiza automáticamente a WebP</span>
          </div>
          <label for="act-logo-input" class="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-orange-50 border border-[#D5CEC2] hover:border-orange-300 text-xs font-bold text-[#1C1917] cursor-pointer transition-colors shrink-0">
            <span class="material-symbols-outlined text-base text-[#EA580C]">upload</span>
            <span>Subir imagen</span>
          </label>
          <input id="act-logo-input" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" class="hidden" />
        </div>
        <p id="act-logo-error" class="hidden text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2"></p>
        <div id="act-logo-preview-wrap" class="hidden flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white border border-[#D5CEC2]">
          <div class="flex items-center gap-3 min-w-0">
            <img id="act-logo-preview" alt="Vista previa del logo" class="w-12 h-12 rounded-xl object-contain bg-[#FAF7F2] border border-[#D5CEC2] shrink-0" />
            <div class="min-w-0">
              <p id="act-logo-meta" class="text-xs font-bold text-emerald-700 truncate"></p>
              <p class="text-[11px] text-stone-500 truncate">Listo para adjuntar al enviar la ficha</p>
            </div>
          </div>
          <button type="button" id="btn-logo-clear" class="px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-rose-50 border border-[#D5CEC2] text-rose-600 text-xs font-bold cursor-pointer shrink-0">
            Quitar / Cambiar
          </button>
        </div>
      </div>`;

    const input = containerEl.querySelector('#act-logo-input');
    const errEl = containerEl.querySelector('#act-logo-error');
    const wrap = containerEl.querySelector('#act-logo-preview-wrap');
    const imgEl = containerEl.querySelector('#act-logo-preview');
    const metaEl = containerEl.querySelector('#act-logo-meta');
    const clearBtn = containerEl.querySelector('#btn-logo-clear');

    const setErr = (m) => { if (errEl) { errEl.textContent = m; errEl.classList.toggle('hidden', !m); } };
    const clear = () => {
      currentFile = null;
      revokePreview();
      if (input) input.value = '';
      wrap?.classList.add('hidden');
      setErr('');
    };

    const handleFile = async (file) => {
      setErr('');
      if (!file) return;
      if (!ALLOWED_TYPES.includes(file.type)) {
        clear();
        return setErr('Formato no soportado. Subí PNG, JPG, WebP o SVG.');
      }
      if (file.size > MAX_BYTES) {
        clear();
        return setErr('La imagen supera el límite de 5 MB.');
      }
      try {
        const webp = await convertToWebP(file);
        revokePreview();
        currentFile = webp;
        currentPreviewUrl = URL.createObjectURL(webp);
        if (imgEl) imgEl.src = currentPreviewUrl;
        const kb = Math.max(1, Math.round(webp.size / 1024));
        if (metaEl) metaEl.textContent = `Logo optimizado (WebP · ${kb} KB)`;
        wrap?.classList.remove('hidden');
      } catch (e) {
        clear();
        setErr(e?.message || 'Error al procesar la imagen.');
      }
    };

    input?.addEventListener('change', () => handleFile(input.files?.[0]));
    clearBtn?.addEventListener('click', clear);
  }

  return { mount, convertToWebP, getLogoFile: () => currentFile, clear: () => { currentFile = null; revokePreview(); } };
})();
