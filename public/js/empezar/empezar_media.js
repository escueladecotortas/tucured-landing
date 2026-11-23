// Archivo: public/js/empezar/empezar_media.js
// Compresor Canvas a WebP liviano (<= 120KB) para Logo y Portada en /empezar.html (< 120L)

window.TucuEmpezarMedia = (function () {
  const MAX_INPUT_BYTES = 5 * 1024 * 1024;
  const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
  const store = {
    logo: { file: null, url: '', kb: 0 },
    cover: { file: null, url: '', kb: 0 }
  };

  function revoke(slot) {
    if (store[slot]?.url) {
      try { URL.revokeObjectURL(store[slot].url); } catch {}
      store[slot].url = '';
    }
  }

  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('No pudimos leer el archivo seleccionado.'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('El archivo no corresponde a una imagen válida.'));
        img.onload = () => resolve(img);
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function canvasToBlob(canvas, quality) {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error('No pudimos optimizar la imagen a WebP.'));
        resolve(blob);
      }, 'image/webp', quality);
    });
  }

  async function compressToWebP(file, { maxSide = 512, maxBytes = 120 * 1024, filename = 'imagen.webp' } = {}) {
    if (!file) throw new Error('Seleccioná un archivo de imagen.');
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Formato no compatible. Usá una imagen PNG, JPG o WebP.');
    }
    if (file.size > MAX_INPUT_BYTES) {
      throw new Error('La imagen supera el límite de 5 MB.');
    }
    const img = await loadImage(file);
    const w = img.naturalWidth || img.width || maxSide;
    const h = img.naturalHeight || img.height || maxSide;
    const scale = Math.min(1, maxSide / Math.max(w, h));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(w * scale));
    canvas.height = Math.max(1, Math.round(h * scale));
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    let bestBlob = null;
    for (const q of [0.82, 0.68, 0.54, 0.40]) {
      bestBlob = await canvasToBlob(canvas, q);
      if (bestBlob.size <= maxBytes) break;
    }
    return new File([bestBlob], filename, { type: 'image/webp' });
  }

  async function setMedia(slot, file) {
    const cfg = slot === 'cover'
      ? { maxSide: 1080, maxBytes: 120 * 1024, filename: 'portada-comercio.webp' }
      : { maxSide: 512, maxBytes: 120 * 1024, filename: 'logo-comercio.webp' };
    const webp = await compressToWebP(file, cfg);
    revoke(slot);
    store[slot] = {
      file: webp,
      url: URL.createObjectURL(webp),
      kb: Math.max(1, Math.round(webp.size / 1024))
    };
    return store[slot];
  }

  function clearMedia(slot) {
    revoke(slot);
    store[slot] = { file: null, url: '', kb: 0 };
  }

  return {
    compressToWebP,
    setMedia,
    clearMedia,
    getSlot: (slot) => store[slot] || { file: null, url: '', kb: 0 },
    getFiles: () => ({ logo: store.logo.file, cover: store.cover.file })
  };
})();