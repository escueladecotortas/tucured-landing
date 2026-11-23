// Archivo: public/js/empezar/empezar_submit.js
// Envío multipart Akismet-safe con centinela anti falso-200, hook /api/wa-welcome y adaptador MP (< 120L)

window.TucuCheckoutAdapter = window.TucuCheckoutAdapter || {
  mode: 'lead_only',
  async afterLeadAccepted() {
    return { ok: true };
  }
};

window.TucuEmpezarSubmit = (function () {
  const S = () => window.TucuEmpezarState;

  function buildActivarUrl(st) {
    const p = new URLSearchParams();
    if (st.comercio) p.set('comercio', st.comercio.trim());
    if (st.rubro) p.set('rubro', st.rubro);
    if (st.plan) p.set('plan', st.plan);
    if (st.titularNombre) p.set('nombre', st.titularNombre.trim());
    if (st.titularApellido) p.set('apellido', st.titularApellido.trim());
    if (st.localidad) p.set('localidad', st.localidad.trim());
    if (st.whatsapp) p.set('whatsapp', st.whatsapp.trim());
    if (st.email) p.set('email', st.email.trim());
    p.set('horario', st.horarioModalidad === 'partido' ? 'cortado' : 'corrido');
    return `https://tucured.ar/activar.html?${p.toString()}`;
  }

  function buildFormData(st, files = {}) {
    const fd = new FormData();
    const senderName = `${st.comercio || ''} — ${st.titularNombre || ''} ${st.titularApellido || ''}`.replace(/\s+/g, ' ').trim();
    fd.append('form-name', 'alta-empezar-tucured');
    fd.append('name', senderName);
    const fields = {
      comercio: st.comercio,
      slug: st.slug,
      rubro: st.rubro,
      bajada: st.bajada,
      accent: st.accent,
      plan: st.plan,
      localidad: st.localidad,
      direccion: st.direccion,
      direccion_lat: st.direccionLat,
      direccion_lng: st.direccionLng,
      horario_modalidad: st.horarioModalidad,
      horario_resumen: S().buildScheduleSummary(st),
      titular_nombre: st.titularNombre,
      titular_apellido: st.titularApellido,
      whatsapp: st.whatsapp,
      email: st.email,
      instagram: st.instagram
    };
    Object.entries(fields).forEach(([k, v]) => fd.append(k, String(v ?? '').trim()));
    if (files.logo) fd.append('logo_file', files.logo, files.logo.name || 'logo-comercio.webp');
    if (files.cover) fd.append('cover_file', files.cover, files.cover.name || 'portada-comercio.webp');
    return fd;
  }

  function buildWaWelcomePayload(st, activarUrl) {
    return {
      nombre: st.comercio.trim(),
      ciudad: st.localidad.trim(),
      rubro: st.rubro,
      level: st.plan,
      horario: st.horarioModalidad === 'partido' ? 'cortado' : 'corrido',
      nombreTitular: st.titularNombre.trim(),
      apellidoTitular: st.titularApellido.trim(),
      whatsapp: st.whatsapp.trim(),
      email: st.email.trim(),
      activarUrl
    };
  }

  async function submitLead(st, files = {}) {
    const formData = buildFormData(st, files);
    const activarUrl = buildActivarUrl(st);
    const res = await fetch('/empezar-ok.html', { method: 'POST', body: formData });
    const respText = await res.text();
    if (!res.ok || !respText.includes('NETLIFY_FORM_ACCEPTED')) {
      throw new Error(`No pudimos confirmar el registro (HTTP ${res.status}). Intentá nuevamente.`);
    }

    const waPayload = buildWaWelcomePayload(st, activarUrl);
    try {
      fetch('/api/wa-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify(waPayload)
      }).catch(() => {});
    } catch (_) {}

    await window.TucuCheckoutAdapter?.afterLeadAccepted?.({ state: st, activarUrl, waPayload });
    return { ok: true, activarUrl, waPayload };
  }

  return { buildActivarUrl, buildFormData, buildWaWelcomePayload, submitLead };
})();