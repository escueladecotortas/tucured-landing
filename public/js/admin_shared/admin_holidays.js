// Archivo: public/js/admin_shared/admin_holidays.js
// Módulo compartido de Feriados Nacionales dinámicos por año con caché local y fallback seguro.
(function (root) {
  const getYear = () => new Date().getFullYear();

  const buildFallback = (year) => ([
    { fecha: `${year}-01-01`, nombre: 'Año Nuevo', tipo: 'inamovible' },
    { fecha: `${year}-03-24`, nombre: 'Día de la Memoria', tipo: 'inamovible' },
    { fecha: `${year}-04-02`, nombre: 'Día de los Caídos en Malvinas', tipo: 'inamovible' },
    { fecha: `${year}-05-01`, nombre: 'Día del Trabajador', tipo: 'inamovible' },
    { fecha: `${year}-05-25`, nombre: 'Revolución de Mayo', tipo: 'inamovible' },
    { fecha: `${year}-06-20`, nombre: 'Paso a la Inmortalidad de Belgrano', tipo: 'inamovible' },
    { fecha: `${year}-07-09`, nombre: 'Día de la Independencia', tipo: 'inamovible' },
    { fecha: `${year}-12-08`, nombre: 'Inmaculada Concepción', tipo: 'inamovible' },
    { fecha: `${year}-12-25`, nombre: 'Navidad', tipo: 'inamovible' }
  ]);

  const normalizeItems = (raw, year) => {
    if (!Array.isArray(raw) || !raw.length) return buildFallback(year);
    return raw.map((h) => {
      if (h.fecha) return { fecha: String(h.fecha).slice(0, 10), nombre: h.nombre || 'Feriado Nacional', tipo: h.tipo || 'nacional' };
      const mm = String(h.mes || 1).padStart(2, '0');
      const dd = String(h.dia || 1).padStart(2, '0');
      return { fecha: `${year}-${mm}-${dd}`, nombre: h.motivo || h.nombre || 'Feriado Nacional', tipo: h.tipo || 'nacional' };
    });
  };

  const memoryCache = {};

  async function loadHolidays(targetYear) {
    const year = Number(targetYear) || getYear();
    if (memoryCache[year]) return memoryCache[year];
    const cacheKey = `tucured_holidays_${year}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length) {
          memoryCache[year] = parsed;
          return parsed;
        }
      }
    } catch (_) {}

    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), 3000) : null;
    try {
      const res = await fetch(`https://api.argentinadatos.com/v1/feriados/${year}`, controller ? { signal: controller.signal } : {});
      if (timer) clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        const normalized = normalizeItems(data, year);
        memoryCache[year] = normalized;
        try { localStorage.setItem(cacheKey, JSON.stringify(normalized)); } catch (_) {}
        return normalized;
      }
    } catch (_) {
      if (timer) clearTimeout(timer);
    }

    const fallback = buildFallback(year);
    memoryCache[year] = fallback;
    return fallback;
  }

  function getCachedHolidays(targetYear) {
    const year = Number(targetYear) || getYear();
    if (memoryCache[year]) return memoryCache[year];
    try {
      const raw = localStorage.getItem(`tucured_holidays_${year}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          memoryCache[year] = parsed;
          return parsed;
        }
      }
    } catch (_) {}
    return buildFallback(year);
  }

  function renderLabel(elementOrId, prefix = 'Feriados Nacionales') {
    const el = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;
    if (!el) return;
    el.textContent = `${prefix} ${getYear()}`;
  }

  function isHoliday(dateStr) {
    const target = String(dateStr || '').slice(0, 10);
    if (!target) return false;
    const year = Number(target.slice(0, 4)) || getYear();
    return getCachedHolidays(year).some((h) => h.fecha === target);
  }

  root.AdminHolidays = {
    getCurrentYear: getYear,
    loadHolidays,
    getCachedHolidays,
    renderLabel,
    isHoliday,
    buildFallback
  };
})(window);

