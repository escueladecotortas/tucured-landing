// Archivo: public/js/empezar_checkout_ui.js
// Bloque Checkout Mes Fundador ($4.999), copia Alias 'tucured', Mercado Pago y snapshot local_db_wizard (< 135L)

window.TucuEmpezarCheckoutUI = (function () {
  const CHECKOUT = {
    pricePromo: '$4.999 ARS',
    alias: 'tucured',
    titular: 'Tucu Red Tecnología Digital',
    mpUrl: 'https://mpago.la/2CTGHu2'
  };

  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  function buildWizardSnapshot(st) {
    const cover = window.TucuEmpezarCovers?.getCoverById?.(st.coverId) || window.TucuEmpezarCovers?.getDefaultCoverForRubro?.(st.rubro);
    const toneMeta = window.TucuEmpezarTones?.getToneMeta?.(st.tonoVoz);
    const effAccent = window.TucuEmpezarState?.getEffectiveAccent?.(st);
    const horarioMode = st.horarioModalidad === 'partido' ? 'cortado' : 'corrido';
    const coverWebp = st.coverMode === 'custom' ? 'custom-webp' : (cover?.poster || '');
    const coverMp4 = st.coverMode === 'custom' ? '' : (cover?.motion || '');
    const fullTitular = `${(st.titularNombre || '').trim()} ${(st.titularApellido || '').trim()}`.trim();
    const servicios = window.TucuEmpezarServicesStep?.cleanServices?.(st.servicios) || [];

    return {
      comercio: (st.comercio || '').trim(),
      nombre: (st.comercio || '').trim(),
      rubro: st.rubro || 'peluqueria',
      plan: st.plan || 'l2',
      level: st.plan || 'l2',
      tono_voz: st.tonoVoz || 'cercano',
      tono_label: toneMeta?.label || 'Cercano & Barrial',
      bajada: (st.bajada || '').trim(),
      accent: effAccent?.bg || st.accent || 'peluqueria',
      accent_mode: st.accentMode || 'auto',
      cover_id: st.coverMode === 'custom' ? 'custom' : (cover?.id || st.coverId || ''),
      cover_nombre: st.coverMode === 'custom' ? 'Foto propia' : (cover?.nombre || ''),
      cover_mp4: coverMp4,
      cover_webp: coverWebp,
      slug: (st.slug || '').trim(),
      localidad: (st.localidad || '').trim(),
      ciudad: (st.localidad || '').trim(),
      direccion: (st.direccion || '').trim(),
      horario: horarioMode,
      servicios,
      asistencia_carga: st.asistenciaCarga || '',
      titular_nombre: (st.titularNombre || '').trim(),
      titular_apellido: (st.titularApellido || '').trim(),
      nombreTitular: (st.titularNombre || '').trim(),
      apellidoTitular: (st.titularApellido || '').trim(),
      titular: fullTitular,
      whatsapp: (st.whatsapp || '').trim(),
      email: (st.email || '').trim(),
      instagram: (st.instagram || '').trim(),
      fromEmpezar: true,
      updatedAt: new Date().toISOString()
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
    try {
      if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(CHECKOUT.alias); copied = true; }
    } catch {}
    if (!copied) {
      try {
        const inp = document.getElementById('emp-checkout-alias');
        if (inp) { inp.select(); document.execCommand('copy'); copied = true; }
      } catch {}
    }
    const labelEl = btnEl?.querySelector?.('[data-copy-label]') || document.getElementById('emp-copy-alias-label');
    if (labelEl) {
      labelEl.textContent = 'Alias copiado';
      setTimeout(() => { if (document.body.contains(labelEl)) labelEl.textContent = 'Copiar Alias'; }, 2200);
    }
    return copied;
  }

  function renderPaymentCards() {
    return `<div class="space-y-3 pt-1">
      <div class="flex items-center justify-between gap-2 flex-wrap">
        <span class="text-xs font-extrabold uppercase tracking-wider text-stone-700">Activación Mes Fundador · 0% comisiones</span>
        <span class="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800 tabular-nums">${esc(CHECKOUT.pricePromo)} primer mes</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="p-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-2">
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-bold text-stone-900">Transferencia Directa</span>
            <span class="text-[11px] font-bold text-emerald-700">0% comisión</span>
          </div>
          <div class="flex gap-1.5">
            <input id="emp-checkout-alias" type="text" readonly value="${esc(CHECKOUT.alias)}" class="w-full min-w-0 px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs font-bold text-stone-900 tabular-nums outline-none" />
            <button type="button" id="btn-emp-copy-alias" class="px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-bold shrink-0 cursor-pointer transition-colors">
              <span id="emp-copy-alias-label" data-copy-label="1">Copiar Alias</span>
            </button>
          </div>
          <p class="text-[11px] text-stone-500">Titular: <strong class="text-stone-800">${esc(CHECKOUT.titular)}</strong></p>
        </div>

        <div class="p-3.5 rounded-2xl bg-sky-50/75 border border-sky-200 flex flex-col justify-between gap-2.5">
          <div>
            <span class="block text-xs font-bold text-stone-900">Tarjeta o saldo Mercado Pago</span>
            <p class="text-[11px] text-stone-600 mt-0.5 leading-snug">Aboná al instante en la web oficial y confirmá tu alta aquí mismo.</p>
          </div>
          <a id="btn-emp-mp-pay" href="${esc(CHECKOUT.mpUrl)}" target="_blank" rel="noopener noreferrer" class="w-full py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold text-center transition-colors">
            Pagar con Mercado Pago
          </a>
        </div>
      </div>
    </div>`;
  }

  window.TucuCheckoutAdapter = {
    mode: 'founder_checkout',
    alias: CHECKOUT.alias,
    mpPaymentUrl: CHECKOUT.mpUrl,
    async afterLeadAccepted({ state }) {
      return { ok: true, snapshot: saveWizardSnapshot(state) };
    }
  };

  return { CHECKOUT, buildWizardSnapshot, saveWizardSnapshot, copyAlias, renderPaymentCards };
})();
