// Archivo: public/js/activar/activar_app.js
// Orquestador Ficha Rápida v2: Geo, Logo WebP, 7 Días, Herencia de Servicios, Bloque 5 Dinámico y FormData (< 180L)

(function () {
  const D = () => window.TucuActivarData;
  const M = () => window.TucuActivarMarkup;
  const G = () => window.TucuActivarGeo;
  const L = () => window.TucuActivarLogo;
  const S = () => window.TucuActivarSchedule;
  const val = (id) => (document.getElementById(id)?.value || '').trim();

  const showErr = (msg) => {
    const el = document.getElementById('activar-error');
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('hidden', !msg);
    if (msg) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  function collectServices() {
    return [...document.querySelectorAll('.act-service-row')].map(row => ({
      name: (row.querySelector('.act-srv-name')?.value || '').trim(),
      price: Number(row.querySelector('.act-srv-price')?.value || 0),
      duration: row.querySelector('.act-srv-dur')?.value || '30',
      sena: Boolean(row.querySelector('.act-srv-sena')?.checked)
    })).filter(s => s.name || s.price > 0);
  }

  function collectStaff() {
    return [...document.querySelectorAll('.act-staff-row')].map(row => ({
      name: (row.querySelector('.act-st-name')?.value || '').trim(),
      spec: (row.querySelector('.act-st-spec')?.value || '').trim(),
      sched: (row.querySelector('.act-st-sched')?.value || 'Horario general del local').trim()
    })).filter(s => s.name || s.spec);
  }

  function bindStaffList() {
    const stList = document.getElementById('act-staff-list');
    document.getElementById('btn-add-staff')?.addEventListener('click', () => {
      if (!stList) return;
      const idx = stList.querySelectorAll('.act-staff-row').length;
      stList.insertAdjacentHTML('beforeend', M().renderStaffRow(idx, {}));
    });
    stList?.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-del-staff');
      if (btn && stList.querySelectorAll('.act-staff-row').length > 1) btn.closest('.act-staff-row')?.remove();
    });
  }

  function syncSenaVisibility() {
    const isNoSena = val('act-sena-mode') === 'sin_sena';
    document.getElementById('act-sena-fields-wrap')?.classList.toggle('hidden', isNoSena);
  }

  function buildValidatedPayload() {
    const d = D(), comercio = val('act-comercio'), nombreTitular = val('act-nombre-titular'), apellidoTitular = val('act-apellido-titular');
    const email = val('act-email'), rubro = val('act-rubro'), localidad = val('act-localidad');
    const direccion = val('act-dir-norm') || val('act-direccion'), sched = S().serializeSchedule(), srvs = collectServices();
    const senaMode = val('act-sena-mode'), isNoSena = senaMode === 'sin_sena';
    const senaVal = isNoSena ? '' : val('act-sena-val'), alias = isNoSena ? '' : val('act-alias'), cbu = isNoSena ? '' : val('act-cbu');
    const pms = [...document.querySelectorAll('[data-act-pm]:checked')].map(el => el.dataset.actPm);
    const waInfo = d.formatE164Ar(val('act-whatsapp')), plan = val('act-plan') || 'l2';
    const spaceCfg = d.RUBRO_SPACE_CONFIG[rubro] || d.RUBRO_SPACE_CONFIG.servicios, staff = collectStaff();

    if (!comercio) return { err: 'Ingresá el nombre comercial de tu local.' };
    if (!nombreTitular) return { err: 'Ingresá el nombre del titular.' };
    if (!apellidoTitular) return { err: 'Ingresá el apellido del titular.' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { err: 'Ingresá un email válido para el local.' };
    if (!val('act-direccion')) return { err: 'Ingresá la dirección física exacta del local.' };
    if (!sched.valid) return { err: 'Dejá al menos un día abierto en los horarios del local.' };
    if (srvs.length === 0 || srvs.some(s => !s.name || s.price <= 0)) return { err: 'Completá al menos 1 servicio con nombre y precio mayor a cero.' };
    if (!isNoSena && (!Number(senaVal) || !alias)) return { err: 'Indicá el valor de la seña y tu Alias para recibir transferencias.' };
    if (!waInfo.e164) return { err: 'Ingresá un número de WhatsApp válido de 10 dígitos (ej: 3815554321).' };
    if (plan === 'l2' && Number(val('act-l2-spaces')) < 1) return { err: `Indicá la cantidad de ${spaceCfg.plural}.` };
    if ((plan === 'l1' || plan === 'l2') && spaceCfg.needsCapacity && Number(val('act-cap-turno')) < 1) return { err: `Indicá ${spaceCfg.capLabel.toLowerCase()}.` };
    if (plan === 'l3' && (staff.length === 0 || staff.some(s => !s.name))) return { err: 'Cargá al menos 1 profesional en el equipo para Plan Equipos.' };

    return {
      payload: {
        'form-name': 'ficha-activacion-tucured', 'bot-field': '', comercio,
        nombre_titular: nombreTitular, apellido_titular: apellidoTitular, email, instagram: val('act-instagram'),
        rubro, localidad, direccion, direccion_referencia: val('act-dir-ref'),
        direccion_lat: val('act-dir-lat'), direccion_lng: val('act-dir-lng'),
        horarios_detalle: sched.text, intervalo_minutos: sched.intervalo,
        servicios_detalle: srvs.map(s => `${s.name} | $${s.price} | ${s.duration} min | ${s.sena ? 'Con seña' : 'Sin seña'}`).join('\n'),
        modalidad_sena: senaMode, valor_sena: senaVal, alias_pago: alias, cbu_cvu: cbu,
        medios_pago: pms.join(', '), whatsapp_local: waInfo.e164, plan,
        cantidad_espacios: plan === 'l2' ? val('act-l2-spaces') : '',
        nombres_espacios: plan === 'l2' ? val('act-l2-names') : '',
        capacidad_turno: (plan === 'l1' || plan === 'l2') && spaceCfg.needsCapacity ? val('act-cap-turno') : '',
        profesionales_detalle: plan === 'l3' ? staff.map(s => `${s.name}${s.spec ? ` — ${s.spec}` : ''} (${s.sched})`).join('\n') : ''
      }
    };
  }

  function init() {
    const root = document.getElementById('activar-form-root'), succRoot = document.getElementById('activar-success-root');
    if (!root || !D() || !M() || !G() || !L() || !S()) return;
    const prefill = D().resolvePrefillData(window.location.search);
    root.innerHTML = M().renderForm(prefill);

    const srvList = document.getElementById('act-services-list');
    if (srvList && Array.isArray(prefill.servicios) && prefill.servicios.length > 0) {
      srvList.innerHTML = prefill.servicios.map((s, idx) => M().renderServiceRow(idx, {
        name: s.name || s.nombre || '',
        price: s.price ?? s.precio ?? '',
        duration: Number(s.duration ?? s.duracion ?? 30) || 30,
        sena: s.sena !== false
      })).join('');
    }

    G().attach('act-direccion');
    L().mount(document.getElementById('act-logo-mount'));
    S().mount(document.getElementById('act-schedule-mount'), prefill.horario);
    syncSenaVisibility();
    bindStaffList();

    document.getElementById('btn-add-service')?.addEventListener('click', () => {
      if (!srvList) return;
      srvList.insertAdjacentHTML('beforeend', M().renderServiceRow(srvList.querySelectorAll('.act-service-row').length, {}));
    });
    srvList?.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-del-srv');
      if (btn && srvList.querySelectorAll('.act-service-row').length > 1) btn.closest('.act-service-row')?.remove();
    });

    document.getElementById('act-rubro')?.addEventListener('change', (e) => {
      const box = document.getElementById('act-block5-body');
      if (box) { box.innerHTML = M().renderBlock5Body(val('act-plan') || prefill.plan, e.target.value); bindStaffList(); }
    });
    document.getElementById('act-sena-mode')?.addEventListener('change', syncSenaVisibility);
    document.getElementById('act-cbu')?.addEventListener('input', (e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 22); });
    document.getElementById('act-whatsapp')?.addEventListener('input', (e) => {
      const info = D().formatE164Ar(e.target.value), badge = document.getElementById('act-wa-e164');
      if (badge) { badge.textContent = info.e164 || '+549...'; badge.className = `text-[11px] tabular-nums font-bold shrink-0 ${info.e164 ? 'text-emerald-700' : 'text-stone-400'}`; }
    });

    const form = document.getElementById('activar-live-form'), submitBtn = document.getElementById('btn-activar-submit');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault(); showErr('');
      const { err, payload } = buildValidatedPayload();
      if (err) return showErr(err);

      const formData = new FormData();
      const senderName = `${payload.comercio || ''} — ${payload.nombre_titular || ''} ${payload.apellido_titular || ''}`.replace(/\s+/g, ' ').trim();
      formData.append('form-name', 'ficha-activacion-tucured');
      formData.append('name', senderName);
      Object.entries(payload).forEach(([k, v]) => {
        if (k === 'form-name' || k === 'name' || k === 'bot-field') return;
        formData.append(k, v ?? '');
      });
      const logoFile = L().getLogoFile();
      if (logoFile) formData.append('logo_archivo', logoFile, logoFile.name);
      window.__lastActivarFormData = formData;

      const isLocal = !window.__forceRemoteActivar && ['localhost', '127.0.0.1', ''].includes(window.location.hostname);
      if (isLocal) {
        console.info('[TucuRed Activar Local FormData]', { ...payload, logo_archivo: logoFile ? `${logoFile.name} (${Math.round(logoFile.size / 1024)} KB, ${logoFile.type})` : null });
      } else {
        if (submitBtn) submitBtn.disabled = true;
        try {
          const res = await fetch('/', { method: 'POST', body: formData });
          const respText = await res.text();
          if (!res.ok || !respText.includes('NETLIFY_FORM_ACCEPTED')) {
            throw new Error(`Netlify no confirmó la recepción (HTTP ${res.status})`);
          }
        } catch (ex) {
          console.error('[TucuRed Activar] Error Netlify Forms:', ex);
          if (submitBtn) submitBtn.disabled = false;
          return showErr('No pudimos confirmar el envío en el servidor. Verificá tu conexión e intentá nuevamente.');
        }
        if (submitBtn) submitBtn.disabled = false;
      }
      root.classList.add('hidden');
      if (succRoot) { succRoot.classList.remove('hidden'); succRoot.innerHTML = M().renderSuccessCard(payload, D().buildWhatsAppConfirmUrl(payload)); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
