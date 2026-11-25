// Archivo: public/js/empezar_image_processor.js
// Validador de resolución mínima y compresor universal (JPG/PNG/WebP -> WebP <= 120 KB) (< 115L)

window.TucuEmpezarImageProcessor = (function () {
  const MAX_RAW_BYTES = 8 * 1024 * 1024;
  const MAX_OUTPUT_BYTES = 120 * 1024;
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  const SLOT_RULES = {
    cover: { minW: 800, minH: 450, maxSide: 1080, filename: 'portada-comercio.webp', label: 'portada' },
    logo: { minW: 300, minH: 300, maxSide: 512, filename: 'logo-comercio.webp', label: 'logo' }
  };

  function readAndMeasure(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('No pudimos leer la imagen seleccionada.'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('El archivo no corresponde a una imagen válida.'));
        img.onload = () => resolve(img);
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function renderScaledBlob(img, width, height, quality) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width));
    canvas.height = Math.max(1, Math.round(height));
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error('No pudimos optimizar la imagen a WebP.'));
        resolve(blob);
      }, 'image/webp', quality);
    });
  }

  async function processImage(slot, file) {
    const rule = SLOT_RULES[slot] || SLOT_RULES.logo;
    if (!file) throw new Error('Seleccioná un archivo de imagen.');
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Formato no compatible. Usá una imagen JPG, PNG o WebP.');
    }
    if (file.size > MAX_RAW_BYTES) {
      throw new Error('La imagen supera el máximo de 8 MB.');
    }

    const img = await readAndMeasure(file);
    const w = img.naturalWidth || img.width || 0;
    const h = img.naturalHeight || img.height || 0;
    if (w < rule.minW || h < rule.minH) {
      throw new Error(`Tu ${rule.label} mide ${w}x${h} px y se vería pixelado. Usá una imagen de al menos ${rule.minW}x${rule.minH} px.`);
    }

    let scale = Math.min(1, rule.maxSide / Math.max(w, h));
    let bestBlob = null;

    for (const shrink of [1, 0.82, 0.68]) {
      const tw = w * scale * shrink;
      const th = h * scale * shrink;
      for (const q of [0.84, 0.72, 0.60, 0.48, 0.36]) {
        bestBlob = await renderScaledBlob(img, tw, th, q);
        if (bestBlob.size <= MAX_OUTPUT_BYTES) break;
      }
      if (bestBlob && bestBlob.size <= MAX_OUTPUT_BYTES) break;
    }

    const webp = new File([bestBlob], rule.filename, { type: 'image/webp' });
    return {
      file: webp,
      url: URL.createObjectURL(webp),
      kb: Math.max(1, Math.round(webp.size / 1024)),
      width: w,
      height: h
    };
  }

  return { SLOT_RULES, MAX_OUTPUT_BYTES, processImage };
})();
