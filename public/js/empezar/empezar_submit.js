// Archivo: public/js/empezar/empezar_submit.js
// Envío resiliente (AbortController 5000ms), link corto /api/portal/activations y wa-welcome diferenciado (< 130L)

window.TucuEmpezarSubmit = (function () {
  const S = () => window.TucuEmpezarState;
  const DEFAULT_ENGINE = 'https://engine.tucured.com.ar';
  const resolveEngine = () => (window.TUCU_ENGINE_URL ? String(window.TUCU_ENGINE_URL).replace(/\/$/, '') : DEFAULT_ENGINE);

  function buildActivarParams(st) {
    const p = new URLSearchParams();
    if (st.slug) p.set('s', st.slug.trim());
    if (st.comercio) p.set('comercio', st.comercio.trim());
    if (st.rubro) p.set('rubro', st.rubro);
    if (st.plan) p.set('plan', st.plan);
    return p;
  }

  const buildActivarUrl = (st) => st.shortActivarUrl || `https://tucured.ar/activar.html?s=${encodeURIComponent((st.slug || '').trim())}`;
  function buildLocalActivarHref(st) {
    const isLocal = typeof window !== 'undefined' && ['localhost', '127.0.0.1', ''].includes(window.location.hostname);
    return isLocal ? `/activar.html?${buildActivarParams(st).toString()}` : buildActivarUrl(st);
  }

  async function saveActivationDraft(st) {
    const isLocal = typeof window !== 'undefined' && ['localhost', '127.0.0.1', ''].includes(window.location.hostname);
    const fallbackShort = `https://tucured.ar/activar.html?s=${encodeURIComponent((st.slug || '').trim())}`;
    if (isLocal && !window.__forceRemoteActivation) return { ok: true, shortUrl: fallbackShort };
    const stS = S(), ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 5000);
    try {
      const res = await fetch(`${resolveEngine()}/api/portal/activations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: ctrl.signal,
        body: JSON.stringify({
          slug: st.slug, comercio: st.comercio, rubro: st.rubro,
          especialidad: window.TucuEmpezarSpecialtyData?.getSpecialtyContext?.(st.specialties) || '',
          plan: st.plan, localidad: st.localidad, direccion: st.direccion, pisoDepto: st.pisoDepto,
          horarioModalidad: st.horarioModalidad, horarioDias: st.horarioDias, horarioResumen: stS.buildScheduleSummary(st),
          coverId: st.coverMode === 'custom' ? 'custom' : (st.coverId || ''), coverStyle: st.coverStyle || 'editorial',
          accent: stS.getEffectiveAccent(st).bg, bajada: st.noTagline ? '' : (st.bajada || ''),
          titularNombre: st.titularNombre, titularApellido: st.titularApellido,
          whatsapp: stS.toE164Whatsapp(st.whatsapp) || st.whatsapp, instagram: st.instagram || '',
          paymentMethod: st.paymentMethod || 'transfer', paymentStatus: st.paidViaMp ? 'paid' : 'pending_transfer',
          asistenciaCarga: st.asistenciaCarga || '', termsAcceptedAt: st.termsAcceptedAt || new Date().toISOString(),
          termsVersion: st.termsVersion || 'v1.1'
        })
      });
      const data = await res.json().catch(() => ({}));
      return { ok: res.ok, shortUrl: data?.shortUrl || fallbackShort };
    } catch { return { ok: false, shortUrl: fallbackShort }; } finally { clearTimeout(timer); }
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
      terms_version: st.termsVersion || 'v1.1', payment_method: st.paymentMethod || 'transfer', mp_payment_id: st.mpPaymentId || ''
    };
    Object.entries(fields).forEach(([k, v]) => fd.append(k, String(v ?? '').trim()));
    if (files.logo) fd.append('logo_file', files.logo, files.logo.name || 'logo-comercio.webp');
    if (files.cover) fd.append('cover_file', files.cover, files.cover.name || 'portada-comercio.webp');
    if (files.pricelist) fd.append('pricelist_file', files.pricelist, files.pricelist.name || 'lista-precios');
    return fd;
  }

  function buildWaWelcomePayload(st, shortUrl) {
    return {
      nombre: st.comercio.trim(), ciudad: st.localidad.trim(), rubro: st.rubro, level: st.plan, plan: st.plan,
      horario: st.horarioModalidad === 'partido' ? 'cortado' : 'corrido',
      nombreTitular: st.titularNombre.trim(), apellidoTitular: st.titularApellido.trim(),
      whatsapp: S().toE164Whatsapp(st.whatsapp) || st.whatsapp.trim(), email: '',
      activarUrl: shortUrl, shortUrl, slug: st.slug.trim(),
      paymentMethod: st.paymentMethod || 'transfer',
      paymentStatus: st.paidViaMp ? 'paid' : 'pending_transfer',
      asistenciaCarga: st.asistenciaCarga || ''
    };
  }

  async function submitLead(st, files = {}) {
    const formData = buildFormData(st, files);
    const isLocal = typeof window !== 'undefined' && ['localhost', '127.0.0.1', ''].includes(window.location.hostname);
    const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 5000);
    try {
      const res = await fetch('/empezar-ok.html', { method: 'POST', body: formData, signal: ctrl.signal });
      const respText = await res.text();
      if (!isLocal && (!res.ok || !respText.includes('NETLIFY_FORM_ACCEPTED'))) throw new Error(`No pudimos confirmar el registro (HTTP ${res.status}).`);
    } catch (err) { if (!isLocal) throw err; } finally { clearTimeout(timer); }

    const actRes = await saveActivationDraft(st);
    st.shortActivarUrl = actRes.shortUrl;
    const activarUrl = actRes.shortUrl, localActivarHref = buildLocalActivarHref(st);

    window.TucuEmpezarCheckoutUI?.saveWizardSnapshot?.(st);
    window.TucuEmpezarTaglineAssist?.adoptCurrentTagline?.(st);
    window.TucuEmpezarMicroSteps?.clearDraft?.();
    const waPayload = buildWaWelcomePayload(st, activarUrl);
    if (!isLocal) {
      try { const c = new AbortController(); setTimeout(() => c.abort(), 5000); fetch('/api/wa-welcome', { method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true, signal: c.signal, body: JSON.stringify(waPayload) }).catch(() => {}); } catch {}
    }
    await window.TucuCheckoutAdapter?.afterLeadAccepted?.({ state: st, activarUrl, waPayload });
    return { ok: true, activarUrl, shortUrl: activarUrl, localActivarHref, waPayload };
  }

  return { buildActivarUrl, buildLocalActivarHref, buildFormData, buildWaWelcomePayload, saveActivationDraft, submitLead };
})();