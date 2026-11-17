// Archivo: public/js/admin_shared/admin_manual_viewer.js
// Visor Interactivo de Manual de Uso: 1 Columna Full-Width, Pills Horizontales & Buscador NFD (<= 115L)

(function (global) {
  const instances = {};
  const MAP_DIA = { a: '[aáàä]', e: '[eéèë]', i: '[iíìï]', o: '[oóòö]', u: '[uúùü]', n: '[nñ]', c: '[cç]' };
  const escHtml = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const norm = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

  function buildAccentRegex(query) {
    const clean = norm(query); if (!clean) return null;
    const pat = Array.from(clean).map(ch => MAP_DIA[ch] || ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('');
    try { return new RegExp(`(${pat})`, 'gi'); } catch (_) { return null; }
  }

  function highlight(text, query) {
    const safe = escHtml(text), rx = buildAccentRegex(query);
    return rx ? safe.replace(rx, '<mark class="bg-amber-200/85 dark:bg-amber-500/35 text-stone-900 dark:text-amber-100 font-bold px-0.5 rounded-sm">$1</mark>') : safe;
  }

  function filterModules(modules, query) {
    const q = norm(query); if (!q) return modules;
    return modules.filter(m => norm(m.title).includes(q) || norm(m.intro).includes(q) || (m.subsections || []).some(sub => norm(sub.subtitle).includes(q) || (sub.steps || []).some(st => norm(st).includes(q))));
  }

  function renderArticle(m, level, q, footerHtml = '') {
    return `<article id="manual-mod-${m.id}" class="admin-card w-full space-y-4">
      <div class="pb-3 border-b border-stone-200/80 dark:border-stone-800 space-y-1">
        <span class="text-[10px] font-bold uppercase tracking-wider text-red-900 dark:text-red-400">Guía Operativa ${level.toUpperCase()}</span>
        <h3 class="text-base font-extrabold text-stone-900 dark:text-stone-100 font-title">${highlight(m.title, q)}</h3>
        <p class="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">${highlight(m.intro, q)}</p>
      </div>
      <div class="space-y-4">${(m.subsections || []).map(sub => `
        <div class="space-y-2">
          <h4 class="text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-[#800000]"></span><span>${highlight(sub.subtitle, q)}</span></h4>
          <div class="space-y-2">${(sub.steps || []).map((st, idx) => `
            <div class="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/70 border border-[#D5CEC2]/80 dark:border-stone-800 flex items-start gap-3">
              <span class="w-6 h-6 rounded-full bg-red-900/10 dark:bg-red-900/30 border border-red-900/20 text-red-900 dark:text-red-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">${idx + 1}</span>
              <p class="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">${highlight(st, q)}</p>
            </div>`).join('')}
          </div>
        </div>`).join('')}
      </div>${footerHtml}
    </article>`;
  }

  function renderBody(level) {
    const inst = instances[level]; if (!inst) return;
    const all = global.AdminManualData?.[level] || [], q = inst.search || '', hasQ = Boolean(norm(q));
    const filtered = filterModules(all, q);
    if (!inst.activeId || !all.some(m => m.id === inst.activeId)) inst.activeId = all[0]?.id || '';
    const cnt = document.getElementById(`manual-active-count-${level}`), nav = document.getElementById(`manual-nav-${level}`), box = document.getElementById(`manual-content-${level}`);
    if (cnt) cnt.textContent = `${filtered.length} / ${all.length} Secciones Activas`;

    if (nav) {
      nav.classList.toggle('hidden', hasQ);
      nav.innerHTML = filtered.map(m => {
        const act = !hasQ && inst.activeId === m.id;
        return `<button type="button" data-manual-nav="${m.id}" onclick="AdminManualViewer.selectModule('${level}','${m.id}')" class="px-3.5 py-2 rounded-xl text-xs transition-all cursor-pointer inline-flex items-center gap-2 ${act ? 'bg-[#800000] text-white font-bold shadow-xs' : 'admin-glass-pill font-semibold text-stone-700 dark:text-stone-300'}"><span class="truncate">${escHtml(m.title)}</span><span class="font-mono text-[10px] opacity-75 shrink-0">${(m.subsections || []).reduce((acc, s) => acc + (s.steps || []).length, 0)}</span></button>`;
      }).join('');
    }
    if (!box) return;
    if (!filtered.length) {
      box.innerHTML = `<div class="admin-card w-full text-center py-10 space-y-2"><p class="text-sm font-bold text-red-900 dark:text-red-400">No encontramos coincidencias para "${escHtml(q)}"</p><p class="text-xs text-stone-500">Prueba buscando "feriados", "whatsapp", "seña" o "agenda".</p></div>`;
      return;
    }
    if (hasQ) { box.innerHTML = filtered.map(m => renderArticle(m, level, q)).join(''); return; }
    const idx = Math.max(0, all.findIndex(m => m.id === inst.activeId)), current = all[idx] || all[0];
    const prevId = idx > 0 ? all[idx - 1].id : '', nextId = idx < all.length - 1 ? all[idx + 1].id : '';
    const navFooter = `<div class="pt-4 mt-2 border-t border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-2 flex-wrap">
      <button type="button" data-manual-prev="${level}" ${prevId ? `onclick="AdminManualViewer.selectModule('${level}','${prevId}')"` : 'disabled'} class="px-3.5 py-2 rounded-xl admin-glass-btn text-xs font-semibold disabled:opacity-40 cursor-pointer">&larr; Sección Anterior</button>
      <span class="text-[11px] font-mono text-stone-500">Sección ${idx + 1} de ${all.length}</span>
      <button type="button" data-manual-next="${level}" ${nextId ? `onclick="AdminManualViewer.selectModule('${level}','${nextId}')"` : 'disabled'} class="px-3.5 py-2 rounded-xl admin-glass-primary text-xs font-bold disabled:opacity-40 cursor-pointer">Siguiente Sección &rarr;</button>
    </div>`;
    box.innerHTML = renderArticle(current, level, '', navFooter);
  }

  function setSearch(level, value) { if (instances[level]) { instances[level].search = value; renderBody(level); } }
  function selectModule(level, modId) {
    if (!instances[level]) return;
    instances[level].activeId = modId; instances[level].search = '';
    const inp = document.getElementById(`manual-search-input-${level}`); if (inp) inp.value = '';
    renderBody(level);
  }

  function mount({ containerId, level }) {
    const root = document.getElementById(containerId); if (!root) return;
    const lvl = (level || 'l1').toLowerCase(), all = global.AdminManualData?.[lvl] || [];
    instances[lvl] = { containerId, search: '', activeId: all[0]?.id || '' };
    root.innerHTML = `<div class="w-full space-y-4">
      <div class="admin-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="space-y-1"><span class="text-[10px] font-bold uppercase tracking-wider text-red-900 dark:text-red-400">Centro de Ayuda TucuRed · Nivel ${lvl.toUpperCase()}</span><h2 class="text-lg font-extrabold text-stone-900 dark:text-stone-100 font-title">Manual de Uso</h2><p class="text-xs text-stone-500">Procedimientos paso a paso para operar tu panel sin fricción.</p></div>
        <div class="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div class="relative flex-1 md:w-72"><input type="text" id="manual-search-input-${lvl}" placeholder="Buscar (ej. seña, feriados, whatsapp)..." class="w-full bg-stone-50 dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-800 rounded-xl pl-8 pr-3 py-2 text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-[#800000]"><svg class="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg></div>
          <span id="manual-active-count-${lvl}" class="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-[#D5CEC2] dark:border-stone-700 text-[11px] font-bold text-red-900 dark:text-red-400 shrink-0">${all.length} / ${all.length} Secciones Activas</span>
        </div>
      </div>
      <nav id="manual-nav-${lvl}" aria-label="Secciones del Manual" class="w-full flex flex-wrap gap-2"></nav>
      <div id="manual-content-${lvl}" class="w-full space-y-4"></div>
    </div>`;
    document.getElementById(`manual-search-input-${lvl}`)?.addEventListener('input', (e) => setSearch(lvl, e.target.value));
    renderBody(lvl);
  }

  global.AdminManualViewer = { mount, setSearch, selectModule };
})(typeof window !== 'undefined' ? window : global);
