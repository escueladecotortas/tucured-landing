// Archivo: public/js/empezar_slug_check.js
// Validación de subdominio (3..24 chars), chequeo debounced contra BFF y sugerencias clicables (< 145L)

window.TucuEmpezarSlugCheck = (function () {
  const MIN_LEN = 3;
  const MAX_LEN = 24;
  const SLUG_RX = /^[a-z0-9](?:[a-z0-9-]{1,22}[a-z0-9])$/;
  const RESERVED = new Set([
    'www', 'admin', 'api', 'app', 'empezar', 'activar', 'turnero', 'tucured',
    'soporte', 'ayuda', 'login', 'panel', 'demo', 'mail', 'status', 'blog'
  ]);

  let debounceTimer = null;
  let activeCtrl = null;
  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  function resolveEngineBase() {
    if (typeof window !== 'undefined' && window.TUCU_ENGINE_URL) return String(window.TUCU_ENGINE_URL).replace(/\/+$/, '');
    const host = typeof window !== 'undefined' ? window.location.hostname : '';
    return ['localhost', '127.0.0.1', ''].includes(host) ? 'http://127.0.0.1:5006' : 'https://engine.tucured.com.ar';
  }

  function sanitizeSlug(raw) {
    return String(raw || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/-{2,}/g, '-')
      .replace(/^-+/, '')
      .slice(0, MAX_LEN)
      .replace(/-+$/, '');
  }

  function buildLocalSuggestions(slug) {
    const clean = sanitizeSlug(slug) || 'mi-local';
    return ['-tuc', '-ar', '-turnos']
      .map(sfx => `${clean.slice(0, MAX_LEN - sfx.length).replace(/-+$/, '')}${sfx}`)
      .filter(s => SLUG_RX.test(s) && !RESERVED.has(s));
  }

  function localCheck(slug) {
    if (!slug || slug.length < MIN_LEN || slug.length > MAX_LEN || !SLUG_RX.test(slug)) {
      return { status: 'invalid_format', slug, available: false, suggestions: [] };
    }
    if (RESERVED.has(slug)) {
      return { status: 'reserved', slug, available: false, suggestions: buildLocalSuggestions(slug) };
    }
    return { status: 'available', slug, available: true, suggestions: [] };
  }

  async function fetchRemoteSlug(slug) {
    if (activeCtrl) activeCtrl.abort();
    const ctrl = new AbortController();
    activeCtrl = ctrl;
    const timer = setTimeout(() => ctrl.abort(), 5000);
    try {
      const res = await fetch(`${resolveEngineBase()}/api/portal/check-slug/${encodeURIComponent(slug)}`, { signal: ctrl.signal });
      if (!res.ok) throw new Error(`HTTP_${res.status}`);
      const data = await res.json();
      if (data?.available) return { status: 'available', slug: data.slug || slug, available: true, suggestions: [] };
      const reason = data?.reason || 'taken';
      if (reason === 'check_unavailable') return { status: 'available', slug, available: true, suggestions: [] };
      return { status: reason, slug: data.slug || slug, available: false, suggestions: Array.isArray(data?.suggestions) ? data.suggestions : [] };
    } catch {
      return localCheck(slug);
    } finally {
      clearTimeout(timer);
    }
  }

  function scheduleCheck(rawSlug, onUpdate) {
    clearTimeout(debounceTimer);
    const slug = sanitizeSlug(rawSlug);
    const pre = localCheck(slug);
    if (!pre.available) {
      onUpdate?.(pre);
      return;
    }
    onUpdate?.({ status: 'checking', slug, available: true, suggestions: [] });
    debounceTimer = setTimeout(async () => {
      const result = await fetchRemoteSlug(slug);
      onUpdate?.(result);
    }, 400);
  }

  function renderSlugStatus(checkState = {}, slug = '') {
    const clean = sanitizeSlug(slug);
    const st = checkState.status || 'idle';
    const labels = {
      checking: ['Verificando disponibilidad...', 'text-stone-500'],
      available: ['Disponible para tu comercio', 'text-emerald-700'],
      taken: ['Ya está en uso. Probá una sugerencia:', 'text-rose-700'],
      reserved: ['Nombre reservado del sistema. Probá otro:', 'text-amber-700'],
      invalid_format: ['Usá entre 3 y 24 letras minúsculas, números o guiones.', 'text-rose-700'],
      idle: [`Enlace: https://${clean || 'tu-comercio'}.tucured.com.ar`, 'text-emerald-700']
    };
    const [msg, cls] = labels[st] || labels.idle;
    const sugg = (checkState.suggestions || []).map(s => `<button type="button" data-emp-slug-suggestion="${esc(s)}" class="px-2.5 py-1 rounded-full bg-white hover:bg-stone-100 border border-stone-300 text-[11px] font-bold text-stone-800 cursor-pointer tabular-nums">${esc(s)}.tucured.com.ar</button>`).join('');
    return `<div class="space-y-1.5">
      <div class="flex items-center justify-between gap-2 text-[11px] font-semibold tabular-nums">
        <span id="emp-slug-status" class="${cls}">${esc(msg)}</span>
        <span id="emp-slug-counter" class="text-stone-500 shrink-0">${clean.length}/${MAX_LEN}</span>
      </div>
      ${sugg ? `<div id="emp-slug-suggestions" class="flex flex-wrap gap-1.5">${sugg}</div>` : ''}
    </div>`;
  }

  return { MIN_LEN, MAX_LEN, sanitizeSlug, scheduleCheck, renderSlugStatus };
})();
