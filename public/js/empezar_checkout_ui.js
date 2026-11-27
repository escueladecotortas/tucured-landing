// Archivo: public/js/empezar_checkout_ui.js
// Paso 10 Activación: selector de Estilo Visual, mini-preview móvil, modal interno T&C v1.1 y botón esmeralda (< 170L)

window.TucuEmpezarCheckoutUI = (function () {
  const CHECKOUT = { pricePromo: '$4.999 ARS primer mes', alias: 'tucured', titular: 'Leonardo Laricchiuta', mpUrl: 'https://mpago.la/2CTGHu2' };
  const STYLES = [
    { id: 'editorial', label: 'Lámina Editorial' },
    { id: 'poster', label: 'Póster Cristal' },
    { id: 'bento', label: 'Bento Boutique' }
  ];
  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  function buildWizardSnapshot(st) {
    const S = window.TucuEmpezarState;
    const cover = window.TucuEmpezarCovers?.getCoverById?.(st.coverId) || window.TucuEmpezarCovers?.getDefaultCoverForRubro?.(st.rubro || 'peluqueria');
    const effAccent = S?.getEffectiveAccent?.(st);
    const fullAddr = `${(st.direccion || '').trim()}${st.pisoDepto?.trim() ? ', ' + st.pisoDepto.trim() : ''}`;
    const servicios = window.TucuEmpezarServicesStep?.cleanServices?.(st.servicios) || [];
    return {
      comercio: (st.comercio || '').trim(), nombre: (st.comercio || '').trim(),
      rubro: st.rubro || 'peluqueria', specialties: st.specialties || [],
      plan: st.plan || 'l2', level: st.plan || 'l2',
      bajada: (st.bajada || '').trim(), accent: effAccent?.bg || '#EA580C', accent_mode: st.accentMode || 'auto',
      cover_id: st.coverMode === 'custom' ? 'custom' : (st.coverMode === 'temp' ? st.coverId : (cover?.id || st.coverId || '')),
      cover_style: st.coverStyle || 'editorial',
      slug: (st.slug || '').trim(), localidad: (st.localidad || '').trim(), direccion: fullAddr, piso_depto: (st.pisoDepto || '').trim(),
      horario: st.horarioModalidad === 'partido' ? 'cortado' : 'corrido', horario_resumen: S?.buildScheduleSummary?.(st) || '',
      servicios: st.asistenciaCarga === 'whatsapp_email' ? [] : servicios, asistencia_carga: st.asistenciaCarga || '',
      titular_nombre: (st.titularNombre || '').trim(), titular_apellido: (st.titularApellido || '').trim(),
      whatsapp: S?.toE164Whatsapp?.(st.whatsapp) || (st.whatsapp || '').trim(), instagram: (st.instagram || '').trim(),
      payment_method: st.paymentMethod || 'transfer', terms_version: st.termsVersion || 'v1.1', terms_accepted_at: st.termsAcceptedAt || '',
      fromEmpezar: true, updatedAt: new Date().toISOString()
    };
  }

  function saveWizardSnapshot(st) {
    if (!st) return null;
    const snap = buildWizardSnapshot(st);
    try { localStorage.setItem('local_db_wizard', JSON.stringify(snap)); } catch {}
    return snap;
  }

  async function copyAlias(btnEl) {
    let copied = false;
    try { if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(CHECKOUT.alias); copied = true; } } catch {}
    if (!copied) { try { const inp = document.getElementById('emp-checkout-alias'); if (inp) { inp.select(); document.execCommand('copy'); } } catch {} }
    const labelEl = btnEl?.querySelector?.('[data-copy-label]') || document.getElementById('emp-copy-alias-label');
    if (labelEl) { labelEl.textContent = 'Alias copiado'; setTimeout(() => { if (document.body.contains(labelEl)) labelEl.textContent = 'Copiar Alias'; }, 2200); }
  }

  function summaryRow(lbl, val, stepTarget) {
    return `<div class="flex items-start justify-between gap-2 py-1.5 border-b border-[#E2D8CB]/70 last:border-b-0">
      <div class="min-w-0"><span class="block text-[10px] font-bold uppercase tracking-wider text-stone-500">${esc(lbl)}</span><strong class="block text-xs text-stone-900 break-words">${esc(val)}</strong></div>
      <button type="button" data-emp-jump-step="${stepTarget}" class="text-[11px] font-bold text-[#EA580C] hover:underline shrink-0 cursor-pointer pt-1">Cambiar</button>
    </div>`;
  }

  function renderStep10(st, errHtml) {
    const S = window.TucuEmpezarState, plan = S.getPlanMeta(st.plan, st.rubro), rub = S.getRubroMeta(st.rubro || 'peluqueria');
    const cleanSrvs = window.TucuEmpezarServicesStep?.cleanServices?.(st.servicios) || [];
    const srvTxt = st.asistenciaCarga === 'whatsapp_email' ? 'Envío de lista por WhatsApp' : `${cleanSrvs.length} ${cleanSrvs.length === 1 ? 'servicio inicial' : 'servicios iniciales'}`;
    const addrTxt = `${st.direccion || ''}${st.pisoDepto?.trim() ? `, ${st.pisoDepto.trim()}` : ''}, ${st.localidad || ''}`;
    const covTxt = st.coverMode === 'custom' ? 'Foto propia' : (st.coverMode === 'temp' ? 'Portada temporal' : 'Portada exclusiva');
    const curStyle = st.coverStyle || 'editorial';
    const styleNames = { editorial: 'Lámina Editorial', poster: 'Póster Cristal', bento: 'Bento Boutique' };
    const isMp = st.paymentMethod === 'mp';

    const styleChips = STYLES.map((s) => `<button type="button" data-emp-cover-style="${s.id}" aria-pressed="${curStyle === s.id}" class="px-2.5 py-2.5 rounded-2xl text-[11px] sm:text-xs font-bold cursor-pointer ${curStyle === s.id ? 'wg-option-active' : 'wg-option'}">${esc(s.label)}</button>`).join('');
    const styleSection = `<div id="emp-step10-style-selector" class="p-3.5 rounded-2xl bg-white/80 border border-[#E2D8CB] space-y-2.5">
      <div class="flex items-center justify-between gap-2"><span class="text-xs font-extrabold text-stone-900">Estilo visual de tu portada</span><span class="text-[11px] font-semibold text-stone-500">1 toque para comparar</span></div>
      <div class="grid grid-cols-3 gap-2">${styleChips}</div>
      <div class="lg:hidden flex justify-center pt-1">
        <div class="emp-mini-phone-shell">
          <div id="emp-step10-mobile-style-preview" class="emp-mini-phone-canvas"></div>
        </div>
      </div>
    </div>`;

    const rows = [
      summaryRow('Negocio', st.comercio, 1),
      summaryRow('Link de reservas', `https://${st.slug}.tucured.com.ar`, 8),
      summaryRow('Plan elegido', plan.name, 8),
      summaryRow('Rubro y portada', `${rub.short}${st.specialties?.length ? ' · ' + st.specialties.join(', ') : ''} · ${covTxt} (${styleNames[curStyle] || 'Lámina Editorial'})`, 3),
      summaryRow('Dirección', addrTxt, 6),
      summaryRow('Horarios', S.buildScheduleSummary(st), 6),
      summaryRow('Servicios', srvTxt, 7),
      summaryRow('Titular y WhatsApp', `${st.titularNombre} ${st.titularApellido} · +549 ${st.whatsapp}`, 9)
    ].join('');

    const transferCard = `
      <div id="emp-transfer-panel" class="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E2D8CB] space-y-3">
        <div class="flex items-center justify-between gap-2"><span class="text-xs font-bold text-stone-900">Transferencia Directa</span><span class="text-[11px] font-bold text-emerald-700">Reserva por 24 hs</span></div>
        <div class="flex gap-1.5">
          <input id="emp-checkout-alias" type="text" readonly value="${esc(CHECKOUT.alias)}" class="w-full min-w-0 px-3 py-2 rounded-xl bg-white border border-[#E2D8CB] text-xs font-bold text-stone-900 tabular-nums outline-none" />
          <button type="button" id="btn-emp-copy-alias" class="wg-btn-secondary px-3 py-2 rounded-xl text-[11px] font-bold shrink-0 cursor-pointer"><span id="emp-copy-alias-label" data-copy-label="1">Copiar Alias</span></button>
        </div>
        <p class="text-[11px] text-stone-600">Titular: <strong class="text-stone-900">${esc(CHECKOUT.titular)}</strong>. Al confirmar reservás tu diseño y link por 24 hs para enviar el comprobante.</p>
        <div class="space-y-1.5 pt-1">
          <p class="text-[11px] font-semibold text-emerald-800 text-center">Último paso para completar tu reserva</p>
          <button type="button" id="btn-empezar-submit" ${st.submitting ? 'disabled' : ''} class="wg-btn-emerald w-full py-3.5 px-4 rounded-2xl text-sm font-bold cursor-pointer">${st.submitting ? 'Confirmando reserva...' : 'Confirmar y reservar mi App'}</button>
        </div>
      </div>`;

    const mpPanel = `
      <div id="emp-mp-panel" class="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E2D8CB] space-y-2">
        <p class="text-[11px] font-semibold text-emerald-800">Último paso para completar tu reserva e iniciar la activación inmediata.</p>
        <p id="emp-mp-status" class="text-xs font-semibold text-[#C2410C] min-h-[1rem]"></p>
        <div id="emp-mp-brick-container" class="min-h-[240px]"></div>
      </div>`;

    return `<div class="space-y-4">
      <div><h2 class="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900">Activación Mes Fundador</h2><p class="text-xs text-stone-500 mt-1">Elegí el estilo de tu portada, revisá cada dato y completá tu reserva.</p></div>
      ${styleSection}
      <div class="rounded-2xl bg-[#F1EBE3] border border-[#E2D8CB] px-4 py-2">${rows}</div>
      <div class="p-3.5 rounded-2xl bg-orange-50/75 border border-orange-200 flex flex-wrap items-center justify-between gap-2 tabular-nums">
        <div><span class="block text-xs font-extrabold text-stone-900">Activación Mes Fundador</span><span class="block text-[11px] text-stone-600">Luego ${esc(plan.regular)}</span></div>
        <span class="px-3 py-1 rounded-full bg-white border border-orange-200 text-xs font-extrabold text-[#C2410C]">${esc(CHECKOUT.pricePromo)}</span>
      </div>
      <label class="flex items-start gap-2.5 text-xs text-stone-700 cursor-pointer p-3 rounded-2xl wg-option">
        <input id="emp-terms" type="checkbox" ${st.termsAccepted ? 'checked' : ''} class="mt-0.5 w-4 h-4 rounded border-stone-300 accent-[#EA580C] cursor-pointer" />
        <span>Acepto los <button type="button" id="btn-open-terms-modal" class="underline font-bold text-stone-900 cursor-pointer">Términos y Condiciones</button> del servicio TucuRed.</span>
      </label>
      <div class="grid grid-cols-2 gap-2 p-1 rounded-2xl wg-pill">
        <button type="button" data-emp-pay-method="transfer" class="py-2 px-3 rounded-xl text-xs font-bold cursor-pointer ${!isMp ? 'wg-option-active' : 'text-stone-600'}">Transferencia</button>
        <button type="button" data-emp-pay-method="mp" class="py-2 px-3 rounded-xl text-xs font-bold cursor-pointer ${isMp ? 'wg-option-active' : 'text-stone-600'}">Mercado Pago</button>
      </div>
      ${isMp ? mpPanel : transferCard}
      ${errHtml}
      <div class="flex"><button type="button" id="btn-emp-prev" class="wg-btn-secondary w-full py-2.5 rounded-2xl text-xs font-bold cursor-pointer">Volver al paso anterior</button></div>
    </div>`;
  }

  window.TucuCheckoutAdapter = {
    mode: 'founder_checkout', alias: CHECKOUT.alias, mpPaymentUrl: CHECKOUT.mpUrl,
    async afterLeadAccepted({ state }) { return { ok: true, snapshot: saveWizardSnapshot(state) }; }
  };

  return { CHECKOUT, buildWizardSnapshot, saveWizardSnapshot, copyAlias, renderStep10 };
})();