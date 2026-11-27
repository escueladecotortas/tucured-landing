// Archivo: public/js/empezar/empezar_media.js
// Gestor de slots WebP, moderación visual (AbortController 8000ms) y lista <= 8 MB (< 95L)

window.TucuEmpezarMedia = (function () {
  const MAX_PRICELIST_BYTES = 8 * 1024 * 1024;
  const DEFAULT_ENGINE = 'https://engine.tucured.com.ar';
  const store = {
    logo: { file: null, url: '', kb: 0, width: 0, height: 0 },
    cover: { file: null, url: '', kb: 0, width: 0, height: 0 },
    pricelist: { file: null, name: '', kb: 0 }
  };

  const resolveEngine = () => (window.TUCU_ENGINE_URL ? String(window.TUCU_ENGINE_URL).replace(/\/$/, '') : DEFAULT_ENGINE);

  function revoke(slot) {
    if (store[slot]?.url) {
      try { URL.revokeObjectURL(store[slot].url); } catch {}
      store[slot].url = '';
    }
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onerror = () => reject(new Error('No pudimos leer la imagen procesada.'));
      r.onload = () => resolve(String(r.result || '').replace(/^data:image\/[a-z0-9.+-]+;base64,/i, ''));
      r.readAsDataURL(file);
    });
  }

  async function moderateWebpFile(slot, file) {
    if (typeof window !== 'undefined' && window.TUCU_SKIP_MODERATION) return true;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    try {
      const imageBase64 = await fileToBase64(file);
      const res = await fetch(`${resolveEngine()}/api/media/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: ctrl.signal,
        body: JSON.stringify({ imageBase64, mimeType: 'image/webp', kind: slot === 'logo' ? 'logo' : 'cover' })
      });
      if (!res.ok) return true;
      const data = await res.json().catch(() => ({}));
      if (data && data.safe === false) {
        throw new Error(data.message || 'Esta imagen no cumple con las políticas de seguridad visual. Elegí otra foto.');
      }
      return true;
    } catch (err) {
      if (err?.message && /pol[ií]ticas|seguridad visual|rechazada/i.test(err.message)) throw err;
      return true;
    } finally {
      clearTimeout(timer);
    }
  }

  async function setMedia(slot, file) {
    const proc = window.TucuEmpezarImageProcessor;
    if (!proc?.processImage) throw new Error('Procesador de imágenes no disponible.');
    const res = await proc.processImage(slot, file);
    try {
      await moderateWebpFile(slot, res.file);
    } catch (modErr) {
      if (res?.url) { try { URL.revokeObjectURL(res.url); } catch {} }
      throw modErr;
    }
    revoke(slot);
    store[slot] = res;
    return store[slot];
  }

  function clearMedia(slot) {
    revoke(slot);
    store[slot] = { file: null, url: '', kb: 0, width: 0, height: 0 };
  }

  function setPriceList(file) {
    if (!file) return store.pricelist;
    if (file.size > MAX_PRICELIST_BYTES) throw new Error('El archivo supera los 8 MB permitidos. Podés mandarlo más liviano o por WhatsApp.');
    store.pricelist = { file, name: file.name || 'lista-precios', kb: Math.max(1, Math.round(file.size / 1024)) };
    return store.pricelist;
  }

  function clearPriceList() { store.pricelist = { file: null, name: '', kb: 0 }; }

  return {
    setMedia, clearMedia, setPriceList, clearPriceList,
    getSlot: (slot) => store[slot] || { file: null, url: '', name: '', kb: 0, width: 0, height: 0 },
    getFiles: () => ({ logo: store.logo.file, cover: store.cover.file, pricelist: store.pricelist.file })
  };
})();