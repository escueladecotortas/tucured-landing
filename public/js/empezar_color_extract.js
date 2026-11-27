// Archivo: public/js/empezar_color_extract.js
// Extractor de color dominante WCAG >= 4.5:1 y luminancia del tercio superior para Póster Cristal (< 150L)

window.TucuEmpezarColorExtract = (function () {
  const cache = new Map();
  const lumCache = new Map();

  function relLum(r, g, b) {
    const ch = [r, g, b].map(v => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  }

  const contrastWithWhite = (r, g, b) => 1.05 / (relLum(r, g, b) + 0.05);
  const toHex = (r, g, b) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('').toUpperCase();

  function parseHex(hex) {
    const m = String(hex || '').replace('#', '').match(/^([0-9a-f]{6})$/i);
    if (!m) return { r: 180, g: 83, b: 9 };
    const n = parseInt(m[1], 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function enforceWhiteContrast(r, g, b) {
    let cr = r, cg = g, cb = b;
    for (let i = 0; i < 24 && contrastWithWhite(cr, cg, cb) < 4.55; i++) {
      cr = Math.floor(cr * 0.9); cg = Math.floor(cg * 0.9); cb = Math.floor(cb * 0.9);
    }
    const bg = toHex(cr, cg, cb), hover = toHex(cr * 0.84, cg * 0.84, cb * 0.84);
    return { bg, hover, text: '#FFFFFF', contrast: Number(contrastWithWhite(cr, cg, cb).toFixed(2)) };
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      if (/^https?:/i.test(src)) img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('IMAGE_LOAD_ERROR'));
      img.src = src;
    });
  }

  function pickDominantRgb(img) {
    const canvas = document.createElement('canvas');
    canvas.width = 32; canvas.height = 32;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.clearRect(0, 0, 32, 32); ctx.drawImage(img, 0, 0, 32, 32);
    const data = ctx.getImageData(0, 0, 32, 32).data, buckets = new Map();
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 180) continue;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const max = Math.max(r, g, b), min = Math.min(r, g, b), lum = (max + min) / 510;
      const sat = max === min ? 0 : (max - min) / (lum > 0.5 ? (510 - max - min) : (max + min));
      if (lum > 0.88 || lum < 0.06 || sat < 0.16) continue;
      const key = `${r >> 4}_${g >> 4}_${b >> 4}`, weight = 1 + sat * 3.5;
      const cur = buckets.get(key) || { w: 0, rs: 0, gs: 0, bs: 0 };
      cur.w += weight; cur.rs += r * weight; cur.gs += g * weight; cur.bs += b * weight;
      buckets.set(key, cur);
    }
    let best = null;
    for (const b of buckets.values()) if (!best || b.w > best.w) best = b;
    return (!best || best.w <= 0) ? null : { r: best.rs / best.w, g: best.gs / best.w, b: best.bs / best.w };
  }

  // Mide luminancia del tercio superior para elegir contraste claro/oscuro en Póster Cristal
  async function measureTopLuminance(src, fallbackTone = 'dark') {
    if (!src) return fallbackTone;
    if (lumCache.has(src)) return lumCache.get(src);
    try {
      const img = await loadImage(src);
      const canvas = document.createElement('canvas');
      canvas.width = 32; canvas.height = 32;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, 32, 32);
      const data = ctx.getImageData(0, 0, 32, 11).data;
      let sum = 0, cnt = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 80) continue;
        sum += relLum(data[i], data[i + 1], data[i + 2]);
        cnt++;
      }
      const tone = (cnt > 0 ? sum / cnt : 0.25) >= 0.42 ? 'light' : 'dark';
      lumCache.set(src, tone);
      return tone;
    } catch {
      return fallbackTone;
    }
  }

  async function extractFromImageUrl(src) {
    if (!src) return null;
    if (cache.has(src)) return cache.get(src);
    try {
      const img = await loadImage(src), rgb = pickDominantRgb(img);
      if (!rgb) return null;
      const result = enforceWhiteContrast(rgb.r, rgb.g, rgb.b);
      cache.set(src, result);
      return result;
    } catch { return null; }
  }

  async function resolveAutoAccent({ logoUrl, coverPosterUrl, fallbackHex = '#B45309' } = {}) {
    if (logoUrl) {
      const fromLogo = await extractFromImageUrl(logoUrl);
      if (fromLogo) return { ...fromLogo, source: 'logo' };
    }
    if (coverPosterUrl) {
      const fromCover = await extractFromImageUrl(coverPosterUrl);
      if (fromCover) return { ...fromCover, source: 'cover' };
    }
    const fb = parseHex(fallbackHex);
    return { ...enforceWhiteContrast(fb.r, fb.g, fb.b), source: 'rubro' };
  }

  return { contrastWithWhite, enforceWhiteContrast, extractFromImageUrl, resolveAutoAccent, measureTopLuminance };
})();