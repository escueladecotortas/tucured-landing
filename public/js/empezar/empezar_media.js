// Archivo: public/js/empezar/empezar_media.js
// Gestor de slots WebP y lista de precios <= 8 MB en /empezar.html (< 60L)

window.TucuEmpezarMedia = (function () {
  const MAX_PRICELIST_BYTES = 8 * 1024 * 1024;
  const store = {
    logo: { file: null, url: '', kb: 0, width: 0, height: 0 },
    cover: { file: null, url: '', kb: 0, width: 0, height: 0 },
    pricelist: { file: null, name: '', kb: 0 }
  };

  function revoke(slot) {
    if (store[slot]?.url) {
      try { URL.revokeObjectURL(store[slot].url); } catch {}
      store[slot].url = '';
    }
  }

  async function setMedia(slot, file) {
    const proc = window.TucuEmpezarImageProcessor;
    if (!proc?.processImage) throw new Error('Procesador de imágenes no disponible.');
    const res = await proc.processImage(slot, file);
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
    if (file.size > MAX_PRICELIST_BYTES) {
      throw new Error('El archivo supera los 8 MB permitidos. Podés mandarlo más liviano o por WhatsApp.');
    }
    store.pricelist = { file, name: file.name || 'lista-precios', kb: Math.max(1, Math.round(file.size / 1024)) };
    return store.pricelist;
  }

  function clearPriceList() {
    store.pricelist = { file: null, name: '', kb: 0 };
  }

  return {
    setMedia, clearMedia, setPriceList, clearPriceList,
    getSlot: (slot) => store[slot] || { file: null, url: '', name: '', kb: 0, width: 0, height: 0 },
    getFiles: () => ({ logo: store.logo.file, cover: store.cover.file, pricelist: store.pricelist.file })
  };
})();
