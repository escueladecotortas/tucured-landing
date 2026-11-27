// Archivo: public/js/empezar/empezar_media.js
// Gestor de slots WebP persistentes en localStorage, moderación visual (AbortController 8000ms) y lista <= 8 MB (< 130L)

window.TucuEmpezarMedia = (function () {
  const MAX_PRICELIST_BYTES = 8 * 1024 * 1024;
  const MEDIA_CACHE_KEY = 'tucu_empezar_media_v1';
  const DEFAULT_ENGINE = 'https://engine.tucured.com.ar';
  const store = {
    logo: { file: null, url: '', kb: 0, width: 0, height: 0 },
    cover: { file: null, url: '', kb: 0, width: 0, height: 0 },
    pricelist: { file: null, name: '', kb: 0 }
  };

  const resolveEngine = () => (window.TUCU_ENGINE_URL ? String(window.TUCU_ENGINE_URL).replace(/\/$/, '') : DEFAULT_ENGINE);

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onerror = () => reject(new Error('No pudimos leer la imagen procesada.'));
      r.onload = () => resolve(String(r.result || ''));
      r.readAsDataURL(file);
    });
  }

  function dataUrlToFile(dataUrl, filename) {
    try {
      const [hdr, b64] = String(dataUrl || '').split(',');
      if (!b64) return null;
      const mime = (hdr.match(/data:([^;]+)/i) || [])[1] || 'image/webp';
      const bin = atob(b64), len = bin.length, arr = new Uint8Array(len);
      for (let i = 0; i < len; i++) arr[i] = bin.charCodeAt(i);
      return new File([arr], filename || 'imagen.webp', { type: mime });
    } catch { return null; }
  }

  function readMediaCache() {
    try { const raw = localStorage.getItem(MEDIA_CACHE_KEY); return raw ? JSON.parse(raw) : {}; }
    catch { return {}; }
  }

  function persistSlot(slot, entry) {
    if (slot !== 'logo' && slot !== 'cover') return;
    try {
      const cache = readMediaCache();
      cache[slot] = { dataUrl: entry.url, kb: entry.kb || 0, width: entry.width || 0, height: entry.height || 0, name: entry.file?.name || `${slot}.webp` };
      localStorage.setItem(MEDIA_CACHE_KEY, JSON.stringify(cache));
    } catch {}
  }

  function removePersistedSlot(slot) {
    try {
      const cache = readMediaCache();
      if (cache[slot]) { delete cache[slot]; localStorage.setItem(MEDIA_CACHE_KEY, JSON.stringify(cache)); }
    } catch {}
  }

  function clearStorage() {
    try { localStorage.removeItem(MEDIA_CACHE_KEY); } catch {}
  }

  function restoreFromStorage() {
    const cache = readMediaCache();
    ['logo', 'cover'].forEach((slot) => {
      const c = cache[slot];
      if (!c?.dataUrl || !/^data:image\//i.test(c.dataUrl)) return;
      const file = dataUrlToFile(c.dataUrl, c.name || `${slot}-comercio.webp`);
      if (file) store[slot] = { file, url: c.dataUrl, kb: c.kb || 0, width: c.width || 0, height: c.height || 0 };
    });
    return { logo: Boolean(store.logo.url), cover: Boolean(store.cover.url) };
  }

  async function moderateWebpFile(slot, dataUrl) {
    if (typeof window !== 'undefined' && window.TUCU_SKIP_MODERATION) return true;
    const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 8000);
    try {
      const imageBase64 = String(dataUrl || '').replace(/^data:image\/[a-z0-9.+-]+;base64,/i, '');
      const res = await fetch(`${resolveEngine()}/api/media/moderate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ctrl.signal,
        body: JSON.stringify({ imageBase64, mimeType: 'image/webp', kind: slot === 'logo' ? 'logo' : 'cover' })
      });
      if (!res.ok) return true;
      const data = await res.json().catch(() => ({}));
      if (data && data.safe === false) throw new Error(data.message || 'Esta imagen no cumple con las políticas de seguridad visual. Elegí otra foto.');
      return true;
    } catch (err) {
      if (err?.message && /pol[ií]ticas|seguridad visual|rechazada/i.test(err.message)) throw err;
      return true;
    } finally { clearTimeout(timer); }
  }

  async function setMedia(slot, file) {
    const proc = window.TucuEmpezarImageProcessor;
    if (!proc?.processImage) throw new Error('Procesador de imágenes no disponible.');
    const res = await proc.processImage(slot, file);
    const dataUrl = await fileToDataUrl(res.file);
    if (res?.url) { try { URL.revokeObjectURL(res.url); } catch {} }
    await moderateWebpFile(slot, dataUrl);
    store[slot] = { file: res.file, url: dataUrl, kb: res.kb, width: res.width, height: res.height };
    persistSlot(slot, store[slot]);
    return store[slot];
  }

  function clearMedia(slot) {
    removePersistedSlot(slot);
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
    MEDIA_CACHE_KEY, setMedia, clearMedia, restoreFromStorage, clearStorage, setPriceList, clearPriceList,
    getSlot: (slot) => store[slot] || { file: null, url: '', name: '', kb: 0, width: 0, height: 0 },
    getFiles: () => ({ logo: store.logo.file, cover: store.cover.file, pricelist: store.pricelist.file })
  };
})();