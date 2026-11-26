// Archivo: public/js/empezar/empezar_submit.js
// Envio resiliente (AbortController), E.164 WhatsApp, terms audit y soporte local Paso 11 (< 125L)

window.TucuEmpezarSubmit = (function () {
  const S = () => window.TucuEmpezarState;

  function buildActivarParams(st) {
    const p = new URLSearchParams();
    if (st.comercio) p.set('comercio', st.comercio.trim());
    if (st.rubro) p.set('rubro', st.rubro);
    if (st.plan) p.set('plan', st.plan);
    if (st.titularNombre) p.set('nombre', st.titularNombre.trim());
    if (st.titularApellido) p.set('apellido', st.titularApellido.trim());
    if (st.localidad) p.set('localidad', st.localidad.trim());
    if (st.whatsapp) p.set('whatsapp', S().toE164Whatsapp(st.whatsapp) || st.whatsapp.trim());
    p.set('horario', st.horarioModalidad === 'partido' ? 'cortado' : 'corrido');
    if (st.tonoVoz) p.set('tono_voz', st.tonoVoz);
    p.set('cover_id', st.coverMode === 'custom' ? 'custom' : (st.coverId || ''));
    if (st.slug) p.set('slug', st.slug.trim());
    const fullDir = `${(st.direccion || '').trim()}${st.pisoDepto?.trim() ? ', ' + st.pisoDepto.trim() : ''}`;
    if (fullDir) p.set('direccion', fullDir);
    if (st.instagram) p.set('instagram', st.instagram.trim());
    return p;
  }

  const buildActivarUrl = (st) => `https://tucured.ar/activar.html?${buildActivarParams(st).toString()}`;
  function buildLocalActivarHref(st) {
    const qs = buildActivarParams(st).toString();
    const isLocal = typeof window !== 'undefined' && ['localhost', '127.0.0.1', ''].includes(window.location.hostname);
    return isLocal ? `/activar.html?${qs}` : buildActivarUrl(st);
  }

  function buildFormData(st, files = {}) {
    const fd = new FormData(), stS = S(), effAccent = stS.getEffectiveAccent?.(st)?.bg || '#EA580C';
    const fullDir = `${(st.direccion || '').trim()}${st.pisoDepto?.trim() ? ', ' + st.pisoDepto.trim() : ''}`;
    fd.append('form-name', 'alta-empezar-tucured');
    fd.append('name', `${st.comercio || ''} — ${st.titularNombre || ''} ${st.titularApellido || ''}`.replace(/\s+/g, ' ').trim());
    const fields = {
      comercio: st.comercio, slug: st.slug, rubro: st.rubro, bajada: st.noTagline ? '' : st.bajada,
      accent: effAccent, plan: st.plan, localidad: st.localidad, direccion: fullDir, piso_depto: st.pisoDepto,
      direccion_lat: st.direccionLat, direccion_lng: st.direccionLng, horario_modalidad: st.horarioModalidad,
      horario_resumen: stS.buildScheduleSummary(st), titular_nombre: st.titularNombre, titular_apellido: st.titularApellido,
      whatsapp: stS.toE164Whatsapp(st.whatsapp) || st.whatsapp, email: '', instagram: st.instagram,
      tono_voz: st.tonoVoz || 'cercano', cover_id: st.coverMode === 'custom' ? 'custom' : (st.coverId || ''),
      servicios_iniciales: window.TucuEmpezarServicesStep?.serializeServices?.(st) || '[]',
      asistencia_carga: st.asistenciaCarga || '', terms_accepted_at: st.termsAcceptedAt || new Date().toISOString(),
      terms_version: st.termsVersion || 'v1-2026', payment_method: st.paymentMethod || 'transfer', mp_payment_id: st.mpPaymentId || ''
    };
    Object.entries(fields).forEach(([k, v]) => fd.append(k, String(v ?? '').trim()));
    if (files.logo) fd.append('logo_file', files.logo, files.logo.name || 'logo-comercio.webp');
    if (files.cover) fd.append('cover_file', files.cover, files.cover.name || 'portada-comercio.webp');
    if (files.pricelist) fd.append('pricelist_file', files.pricelist, files.pricelist.name || 'lista-precios');
    return fd;
  }

  function buildWaWelcomePayload(st, activarUrl) {
    return {
      nombre: st.comercio.trim(), ciudad: st.localidad.trim(), rubro: st.rubro, level: st.plan,
      horario: st.horarioModalidad === 'partido' ? 'cortado' : 'corrido',
      nombreTitular: st.titularNombre.trim(), apellidoTitular: st.titularApellido.trim(),
      whatsapp: S().toE164Whatsapp(st.whatsapp) || st.whatsapp.trim(), email: '', activarUrl
    };
  }

  async function submitLead(st, files = {}) {
    const formData = buildFormData(st, files), activarUrl = buildActivarUrl(st), localActivarHref = buildLocalActivarHref(st);
    const isLocal = typeof window !== 'undefined' && ['localhost', '127.0.0.1', ''].includes(window.location.hostname);
    const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 5000);
    try {
      const res = await fetch('/empezar-ok.html', { method: 'POST', body: formData, signal: ctrl.signal });
      const respText = await res.text();
      if (!isLocal && (!res.ok || !respText.includes('NETLIFY_FORM_ACCEPTED'))) throw new Error(`No pudimos confirmar el registro (HTTP ${res.status}).`);
    } catch (err) {
      if (!isLocal) throw err;
    } finally { clearTimeout(timer); }

    window.TucuEmpezarCheckoutUI?.saveWizardSnapshot?.(st);
    window.TucuEmpezarTaglineAssist?.adoptCurrentTagline?.(st);
    window.TucuEmpezarMicroSteps?.clearDraft?.();
    const waPayload = buildWaWelcomePayload(st, activarUrl);
    if (!isLocal) {
      try { const c = new AbortController(); setTimeout(() => c.abort(), 5000); fetch('/api/wa-welcome', { method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true, signal: c.signal, body: JSON.stringify(waPayload) }).catch(() => {}); } catch {}
    }
    await window.TucuCheckoutAdapter?.afterLeadAccepted?.({ state: st, activarUrl, waPayload });
    return { ok: true, activarUrl, localActivarHref, waPayload };
  }

  return { buildActivarUrl, buildLocalActivarHref, buildFormData, buildWaWelcomePayload, submitLead };
})();
