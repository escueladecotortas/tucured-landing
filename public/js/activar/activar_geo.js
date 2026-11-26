// Archivo: public/js/activar/activar_geo.js
// Autocompletado Predictivo Photon/OSM filtrado por localidad + Calle + Altura (< 168L)

window.TucuActivarGeo = (function () {
  const BASE_LAT = -26.8241;
  const BASE_LNG = -65.2226;
  const TUCUMAN_STREETS = [
    'Av. 24 de Septiembre', 'Av. Mate de Luna', 'Av. Sarmiento', 'Av. Roca', 'Av. Avellaneda', 'Av. Colón',
    'Av. Alem', 'Av. Salta', 'Av. Jujuy', 'Av. Belgrano', 'Av. Mitre', 'Av. Ejército del Norte',
    'Av. Juan B. Justo', 'Av. Siria', 'Av. Benjamín Aráoz', 'Av. Brígido Terán', 'Av. Soldati',
    'Av. Independencia', 'Av. Néstor Kirchner', 'Av. América', 'Av. Aconquija', 'Av. Perón',
    'San Martín', '25 de Mayo', 'Laprida', 'Maipú', 'Muñecas', 'Mendoza', 'Córdoba', 'San Juan',
    'Santiago del Estero', 'Corrientes', 'Marcos Paz', 'Santa Fe', 'España', 'Italia', 'Junín',
    'Alberdi', 'General Paz', 'Lavalle', 'Bolívar', 'Rondeau', 'Chacabuco', 'Ayacucho'
  ];

  let activeAbort = null;
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  function buildFallback(streetOnly, num, q, localidad = '') {
    const needle = (streetOnly || q).toLowerCase();
    const city = localidad || 'San Miguel de Tucumán';
    return TUCUMAN_STREETS.filter((s) => s.toLowerCase().includes(needle)).slice(0, 5).map((s) => {
      const clean = `${s}${num ? ' ' + num : ''}`;
      return { label: `${clean}, ${city}`, formattedAddress: `${clean}, ${city}`, address: clean, streetOnly: s, num, city, lat: BASE_LAT, lng: BASE_LNG, isFallback: true };
    });
  }

  async function fetchPhoton(queryStr) {
    if (activeAbort) activeAbort.abort();
    const ctrl = new AbortController();
    activeAbort = ctrl;
    const timer = setTimeout(() => ctrl.abort(), 4500);
    try {
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(queryStr)}&lat=${BASE_LAT}&lon=${BASE_LNG}&limit=8`;
      const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: ctrl.signal });
      return res.ok ? ((await res.json()).features || []) : [];
    } catch { return []; }
    finally { clearTimeout(timer); }
  }

  async function queryPhoton(text, localidad = '') {
    const q = String(text || '').trim();
    if (q.length < 2) return [];
    const numMatch = q.match(/^(.*?)(?:\s+(\d+))$/);
    const streetOnly = numMatch ? numMatch[1].trim() : q;
    const num = numMatch ? numMatch[2] : '';
    const locNorm = norm(localidad);

    const isTucuman = (f) => {
      const p = f.properties || {}, c = f.geometry?.coordinates || [];
      return (p.state || '').includes('Tucum') || Math.hypot((c[1] || 0) - BASE_LAT, (c[0] || 0) - BASE_LNG) < 0.55;
    };

    let features = await fetchPhoton(localidad ? `${q}, ${localidad}, Tucumán` : q);
    let local = features.filter(isTucuman);
    if (!local.length && localidad) local = (await fetchPhoton(q)).filter(isTucuman);
    if (!local.length && streetOnly !== q) local = (await fetchPhoton(streetOnly)).filter(isTucuman);
    if (!local.length) return buildFallback(streetOnly, num, q, localidad);

    const seen = new Set(), results = [];
    local.forEach((f) => {
      const p = f.properties || {}, c = f.geometry?.coordinates || [];
      const street = p.name || p.street || streetOnly;
      const house = p.housenumber || num;
      const city = p.city || p.town || p.village || p.county || localidad || 'San Miguel de Tucumán';
      const clean = `${street}${house ? ' ' + house : ''}`.trim();
      const full = `${clean}, ${city}`;
      if (!seen.has(full.toLowerCase())) {
        seen.add(full.toLowerCase());
        const matchesLoc = Boolean(locNorm && (norm(city).includes(locNorm) || norm(p.district).includes(locNorm) || norm(p.county).includes(locNorm)));
        results.push({ label: full, formattedAddress: full, address: clean, streetOnly: street, num: house, city, lat: typeof c[1] === 'number' ? c[1] : BASE_LAT, lng: typeof c[0] === 'number' ? c[0] : BASE_LNG, matchesLoc });
      }
    });
    results.sort((a, b) => Number(b.matchesLoc) - Number(a.matchesLoc));
    return results;
  }

  function attach(inputId) {
    const el = document.getElementById(inputId), dropdown = document.getElementById('act-geo-dropdown');
    const notice = document.getElementById('act-geo-height-notice'), badge = document.getElementById('act-geo-badge');
    const normEl = document.getElementById('act-dir-norm'), latEl = document.getElementById('act-dir-lat'), lngEl = document.getElementById('act-dir-lng');
    if (!el || !dropdown) return null;
    let timer = null;
    const hide = () => { dropdown.classList.add('hidden'); dropdown.innerHTML = ''; };
    const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const updateHeightNotice = () => { if (notice) notice.classList.toggle('hidden', !(el.value.trim().length >= 3 && !/\d+/.test(el.value.trim()))); };
    const clearVerified = () => { if (normEl) normEl.value = ''; if (latEl) latEl.value = ''; if (lngEl) lngEl.value = ''; badge?.classList.add('hidden'); };
    const selectItem = (item) => {
      el.value = item.address || item.formattedAddress;
      if (normEl) normEl.value = item.formattedAddress || item.address;
      if (latEl) latEl.value = String(item.lat);
      if (lngEl) lngEl.value = String(item.lng);
      if (badge) { badge.textContent = `✓ Ubicación verificada (${Number(item.lat).toFixed(4)}, ${Number(item.lng).toFixed(4)})`; badge.classList.remove('hidden'); }
      hide(); updateHeightNotice();
    };
    el.addEventListener('input', () => {
      clearTimeout(timer); clearVerified(); updateHeightNotice();
      const v = el.value.trim(); if (v.length < 2) { hide(); return; }
      timer = setTimeout(async () => {
        const items = await queryPhoton(v);
        if (!items.length) { hide(); return; }
        dropdown.innerHTML = items.map((it, i) => `<button type="button" data-geo-idx="${i}" class="w-full text-left px-3.5 py-2.5 text-xs text-[#1C1917] hover:bg-orange-50 hover:text-[#EA580C] border-b border-[#D5CEC2]/50 last:border-b-0 transition-colors cursor-pointer block">${esc(it.label)}</button>`).join('');
        dropdown.classList.remove('hidden');
        dropdown.querySelectorAll('[data-geo-idx]').forEach((btn, idx) => btn.addEventListener('mousedown', (e) => { e.preventDefault(); selectItem(items[idx]); }));
      }, 250);
    });
    el.addEventListener('blur', () => { setTimeout(hide, 220); updateHeightNotice(); });
    document.addEventListener('click', (e) => { if (!el.parentElement?.contains(e.target)) hide(); });
    return { queryPhoton, selectItem, hide };
  }

  return { attach, queryPhoton, TUCUMAN_STREETS };
})();
