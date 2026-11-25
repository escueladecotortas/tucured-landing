// Archivo: public/js/empezar/empezar_media.js
// Gestor de slots WebP en /empezar.html delegado al procesador universal con resolución mínima (< 55L)

window.TucuEmpezarMedia = (function () {
  const store = {
    logo: { file: null, url: '', kb: 0, width: 0, height: 0 },
    cover: { file: null, url: '', kb: 0, width: 0, height: 0 }
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

  return {
    setMedia,
    clearMedia,
    getSlot: (slot) => store[slot] || { file: null, url: '', kb: 0, width: 0, height: 0 },
    getFiles: () => ({ logo: store.logo.file, cover: store.cover.file })
  };
})();
