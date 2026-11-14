// Archivo: public/js/admin_shared/admin_wa_templates.js
// WA Demo Readonly + 3 Plantillas (1A Seña, 1B Confirmado, 2 Recordatorio) (< 180 líneas)

(function (global) {
  const DEMO_WA_NUMBER = '5493815551234';
  const DAYS_ES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const VARS = ['{{cliente}}', '{{comercio}}', '{{servicio}}', '{{fecha}}', '{{hora}}', '{{codigo}}', '{{sena}}', '{{porcentaje}}', '{{alias}}', '{{cbu}}', '{{link_ticket}}'];
  const TPL_1A = '¡Hola {{cliente}}! Registramos tu reserva en {{comercio}} para el {{fecha}} a las {{hora}} hs ({{servicio}}). Para confirmar tu lugar, aboná la seña de {{sena}} por transferencia: Alias: {{alias}} · CBU: {{cbu}}. Enviá el comprobante por este mismo chat para acreditarlo. Podés ver el estado de tu reserva desde tu ticket online: {{link_ticket}}';
  const TPL_1B = '¡Hola {{cliente}}! Tu turno en {{comercio}} quedó confirmado para el {{fecha}} a las {{hora}} hs ({{servicio}}). Podés consultar los datos o gestionar tu reserva desde tu ticket online: {{link_ticket}}';
  const TPL_2 = 'Hola {{cliente}}, te recordamos tu turno en {{comercio}} el {{fecha}} a las {{hora}} hs ({{servicio}}). Ingresá a tu ticket online para confirmar asistencia o cancelar si surgió un imprevisto: {{link_ticket}}';

  let activeTab = '1a';

  function formatNaturalDate(raw) {
    let d;
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(raw || ''))) d = new Date(`${raw}T12:00:00`);
    else if (raw instanceof Date) d = raw;
    else { d = new Date(); d.setDate(d.getDate() + 1); }
    const dd = String(d.getDate()).padStart(2, '0'), mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${DAYS_ES[d.getDay()]} ${dd}/${mm}`;
  }

  function storageKey(level) { return `tucu_${level}_wa_templates_v2`; }

  function getTemplates(level = 'l1') {
    try {
      const s = JSON.parse(localStorage.getItem(storageKey(level)) || 'null');
      if (s && (s.t1a || s.t1b || s.t2)) return { waNumber: DEMO_WA_NUMBER, t1a: s.t1a || TPL_1A, t1b: s.t1b || TPL_1B, t2: s.t2 || TPL_2 };
    } catch (_) {}
    return { waNumber: DEMO_WA_NUMBER, t1a: TPL_1A, t1b: TPL_1B, t2: TPL_2 };
  }

  function saveTemplates(level = 'l1') {
    const g = (id, def) => document.getElementById(id)?.value || def;
    const payload = { waNumber: DEMO_WA_NUMBER, t1a: g('cfg-msg-confirm1a', TPL_1A), t1b: g('cfg-msg-confirm1b', TPL_1B), t2: g('cfg-msg-reminder', TPL_2) };
    try { localStorage.setItem(storageKey(level), JSON.stringify(payload)); localStorage.setItem(`tucu_${level}_wa_number`, DEMO_WA_NUMBER); } catch (_) {}
    return payload;
  }

  function resolveLevelConfig(level = 'l1', opts = {}) {
    const ext = global.AdminBookingEngine?.getConfig?.(level) || { requireDeposit: true, depositType: 'percentage', depositValue: 50 };
    const bizInput = opts.bizInputId ? document.getElementById(opts.bizInputId)?.value?.trim() : document.getElementById('cfg-biz-name')?.value?.trim();
    const aliasInput = opts.aliasInputId ? document.getElementById(opts.aliasInputId)?.value?.trim() : document.getElementById('inputAlias')?.value?.trim();
    const cbuInput = document.getElementById('inputCbu')?.value?.trim();
    const defBiz = level === 'l3' ? 'Estudio Multi-Staff TucuRed' : (level === 'l2' ? 'TucuRed Central' : 'Peluquería & Barbería Central');
    const biz = bizInput || localStorage.getItem(`tucu_${level}_biz_name`) || localStorage.getItem('tucu_biz_name') || defBiz;
    const alias = aliasInput || localStorage.getItem(`tucu_${level}_alias`) || ext.alias || 'tucured.estudio.mp';
    const cbu = cbuInput || localStorage.getItem(`tucu_${level}_cbu`) || ext.cbu || '0000003100012345678901';
    const pct = ext.depositType === 'fixed' ? `$${Number(ext.depositValue || 4000).toLocaleString('es-AR')} fijo` : `${ext.depositValue ?? 50}%`;
    return { ext, biz, alias, cbu, pct };
  }

  function getContext(opts = {}, booking = null) {
    const level = opts.level || 'l1', cfg = resolveLevelConfig(level, opts);
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const codeRaw = booking?.id || booking?.token || 'TK-8492';
    const cleanCode = String(codeRaw).replace(/^#/, '');
    const depNum = booking ? (Number(booking.depositAmount) || 0) : (cfg.ext.depositType === 'fixed' ? Number(cfg.ext.depositValue || 4000) : Math.round(12000 * ((cfg.ext.depositValue ?? 50) / 100)));
    return {
      cliente: booking?.clientName || booking?.client || booking?.name || 'Martín Gómez',
      comercio: cfg.biz,
      servicio: booking?.serviceName || booking?.service || (level === 'l3' ? 'Corte Clásico & Fade' : (level === 'l2' ? 'Sesión Central Pro' : 'Corte & Barba Premium')),
      fecha: formatNaturalDate(booking?.dateStr || booking?.date || tomorrow),
      hora: booking?.time || '17:30',
      codigo: cleanCode,
      sena: '$' + depNum.toLocaleString('es-AR'),
      porcentaje: cfg.pct,
      alias: cfg.alias,
      cbu: cfg.cbu,
      link_ticket: `https://tucured.ar/t/${cleanCode}`
    };
  }

  function interpolate(text, ctx) {
    return String(text || '')
      .replace(/\{\{cliente\}\}/g, ctx.cliente).replace(/\{\{comercio\}\}/g, ctx.comercio)
      .replace(/\{\{servicio\}\}/g, ctx.servicio).replace(/\{\{fecha\}\}/g, ctx.fecha)
      .replace(/\{\{hora\}\}/g, ctx.hora).replace(/\{\{codigo\}\}/g, ctx.codigo).replace(/\{\{id\}\}/g, ctx.codigo)
      .replace(/\{\{sena\}\}/g, ctx.sena).replace(/\{\{monto_seña\}\}/g, ctx.sena).replace(/\{\{porcentaje\}\}/g, ctx.porcentaje)
      .replace(/\{\{alias\}\}/g, ctx.alias).replace(/\{\{cbu\}\}/g, ctx.cbu)
      .replace(/\{\{link_ticket\}\}/g, ctx.link_ticket).replace(/\{\{link\}\}/g, ctx.link_ticket);
  }

  function renderPreview(opts = {}) {
    const ctx = getContext(opts), tpl = getTemplates(opts.level || 'l1');
    const map = [['cfg-msg-confirm1a', 'cfg-preview-1a', tpl.t1a], ['cfg-msg-confirm1b', 'cfg-preview-1b', tpl.t1b], ['cfg-msg-reminder', 'cfg-preview-2', tpl.t2]];
    map.forEach(([inId, outId, def]) => {
      const p = document.getElementById(outId);
      if (p) p.textContent = interpolate(document.getElementById(inId)?.value ?? def, ctx);
    });
  }

  function switchTab(next) {
    activeTab = next;
    document.querySelectorAll('[data-watab]').forEach(b => {
      const on = b.dataset.watab === next;
      b.className = `admin-glass-pill ${on ? 'is-active font-bold' : 'font-semibold'} px-3 py-1.5 rounded-xl text-[11px]`;
    });
    ['1a', '1b', '2'].forEach(k => document.getElementById(`wa-panel-${k}`)?.classList.toggle('hidden', k !== next));
  }

  function buildBookingMessage(booking, level = 'l1', forcedKey = null) {
    const tpl = getTemplates(level);
    const canon = global.AdminBookingEngine?.normalizeKey?.(booking?.status) || 'CONFIRMED';
    const key = forcedKey || (canon === 'PENDING_DEPOSIT' ? '1a' : '1b');
    const raw = key === '1a' ? tpl.t1a : (key === '2' ? tpl.t2 : tpl.t1b);
    return interpolate(raw, getContext({ level }, booking));
  }

  function buildWaUrl(booking, level = 'l1', forcedKey = null) {
    const rawPhone = String(booking?.clientPhone || booking?.phone || DEMO_WA_NUMBER).replace(/\D/g, '') || DEMO_WA_NUMBER;
    const phone = rawPhone.startsWith('54') ? rawPhone : `549${rawPhone}`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(buildBookingMessage(booking, level, forcedKey))}`;
  }

  function mount(opts = {}) {
    const box = document.getElementById(opts.mountId);
    if (!box) return;
    const level = opts.level || 'l1', tpl = getTemplates(level);
    const chips = VARS.map(v => `<button type="button" data-wa-var="${v}" class="admin-glass-pill px-2 py-0.5 rounded-lg text-[10px] font-mono cursor-pointer">${v}</button>`).join('');
    const panel = (key, title, badge, inId, outId, val, cls) => `
      <div id="wa-panel-${key}" class="${key === activeTab ? '' : 'hidden'} p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-[#D5CEC2] dark:border-stone-800 space-y-2.5">
        <div class="flex items-center justify-between gap-2 flex-wrap"><h4 class="text-xs font-bold text-stone-900 dark:text-stone-100">${title}</h4><span class="text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cls}">${badge}</span></div>
        <textarea id="${inId}" rows="4" class="w-full bg-white dark:bg-stone-950 border border-[#D5CEC2] dark:border-stone-800 rounded-xl p-2.5 text-xs text-stone-800 dark:text-stone-100 font-mono outline-none">${val}</textarea>
        <div class="space-y-1"><span class="text-[10px] font-bold uppercase text-stone-500">Vista previa en vivo</span><div id="${outId}" class="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/35 border border-emerald-200 dark:border-emerald-900 text-[11px] text-emerald-900 dark:text-emerald-100 whitespace-pre-line leading-relaxed"></div></div>
      </div>`;

    box.innerHTML = `<div class="space-y-4">
      <div class="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900/70 border border-[#D5CEC2] dark:border-stone-800 space-y-1.5">
        <div class="flex items-center justify-between flex-wrap gap-2"><label for="cfg-wa-number" class="text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">WhatsApp del Comercio</label><span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-200/80 dark:bg-stone-800 text-stone-600 dark:text-stone-300">Solo lectura</span></div>
        <input type="text" id="cfg-wa-number" value="${DEMO_WA_NUMBER}" readonly disabled class="w-full bg-stone-200/60 dark:bg-stone-950/60 border border-[#D5CEC2] dark:border-stone-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-stone-500 dark:text-stone-400 cursor-not-allowed opacity-85 outline-none">
        <p class="text-[11px] text-stone-500 dark:text-stone-400">Número de ejemplo (solo lectura en entorno demo)</p>
      </div>
      <div class="flex flex-wrap gap-1.5"><button type="button" data-watab="1a" class="admin-glass-pill ${activeTab === '1a' ? 'is-active font-bold' : 'font-semibold'} px-3 py-1.5 rounded-xl text-[11px]">1A · Con Seña</button><button type="button" data-watab="1b" class="admin-glass-pill ${activeTab === '1b' ? 'is-active font-bold' : 'font-semibold'} px-3 py-1.5 rounded-xl text-[11px]">1B · Confirmada</button><button type="button" data-watab="2" class="admin-glass-pill ${activeTab === '2' ? 'is-active font-bold' : 'font-semibold'} px-3 py-1.5 rounded-xl text-[11px]">2 · Recordatorio</button></div>
      <div class="flex flex-wrap gap-1.5">${chips}</div>
      ${panel('1a', 'Plantilla 1A — Reserva con Seña', 'Pendiente Seña', 'cfg-msg-confirm1a', 'cfg-preview-1a', tpl.t1a, 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300')}
      ${panel('1b', 'Plantilla 1B — Reserva Directa sin Seña', 'Confirmado', 'cfg-msg-confirm1b', 'cfg-preview-1b', tpl.t1b, 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300')}
      ${panel('2', 'Plantilla 2 — Recordatorio Previo (24 hs / 2 hs antes)', 'Cron Automático', 'cfg-msg-reminder', 'cfg-preview-2', tpl.t2, 'bg-stone-100 text-stone-700 border-stone-300 dark:bg-stone-800 dark:text-stone-300')}
    </div>`;

    box.querySelectorAll('[data-watab]').forEach(b => b.addEventListener('click', () => switchTab(b.dataset.watab)));
    ['cfg-msg-confirm1a', 'cfg-msg-confirm1b', 'cfg-msg-reminder'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', () => { saveTemplates(level); renderPreview(opts); opts.onChange?.(); });
    });
    box.querySelectorAll('[data-wa-var]').forEach(b => b.addEventListener('click', () => {
      const id = activeTab === '1a' ? 'cfg-msg-confirm1a' : (activeTab === '1b' ? 'cfg-msg-confirm1b' : 'cfg-msg-reminder');
      const el = document.getElementById(id); if (!el) return;
      const st = el.selectionStart ?? el.value.length;
      el.value = el.value.slice(0, st) + b.dataset.waVar + el.value.slice(el.selectionEnd ?? st);
      saveTemplates(level); renderPreview(opts); opts.onChange?.();
    }));
    renderPreview(opts);
  }

  global.AdminWaTemplates = { DEMO_WA_NUMBER, TPL_1A, TPL_1B, TPL_2, formatNaturalDate, getTemplates, saveTemplates, renderPreview, buildBookingMessage, buildWaUrl, mount, switchTab };
})(typeof window !== 'undefined' ? window : global);
