// Archivo: public/js/activar/activar_app.js
// Controlador Interactivo de Ficha Rápida + Validación + Netlify Forms (< 160L)

(function () {
  const D = () => window.TucuActivarData;
  const M = () => window.TucuActivarMarkup;
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
      hours: (row.querySelector('.act-st-hours')?.value || '').trim()
    })).filter(s => s.name || s.hours);
  }

  function syncConditionalBlocks() {
    const mod = document.querySelector('input[name="modalidad_horario"]:checked')?.value || 'corrido';
    const isPartido = mod === 'partido';
    document.getElementById('act-tarde-wrap')?.classList.toggle('hidden', !isPartido);
    const mTo = document.getElementById('act-m-to');
    if (mTo && !mTo.dataset.touched) mTo.value = isPartido ? '13:00' : '18:00';

    const senaMode = val('act-sena-mode');
    document.getElementById('act-sena-val-wrap')?.classList.toggle('hidden', senaMode === 'sin_sena');

    const plan = val('act-plan');
    document.getElementById('act-l2-box')?.classList.toggle('hidden', plan !== 'l2');
    document.getElementById('act-l3-box')?.classList.toggle('hidden', plan !== 'l3');
  }

  function bindDynamicLists() {
    const srvList = document.getElementById('act-services-list');
    const stList = document.getElementById('act-staff-list');
    document.getElementById('btn-add-service')?.addEventListener('click', () => {
      if (!srvList) return;
      const idx = srvList.querySelectorAll('.act-service-row').length;
      srvList.insertAdjacentHTML('beforeend', M().renderServiceRow(idx, {}));
    });
    document.getElementById('btn-add-staff')?.addEventListener('click', () => {
      if (!stList) return;
      const idx = stList.querySelectorAll('.act-staff-row').length;
      stList.insertAdjacentHTML('beforeend', M().renderStaffRow(idx, {}));
    });
    srvList?.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-del-srv');
      if (btn && srvList.querySelectorAll('.act-service-row').length > 1) btn.closest('.act-service-row')?.remove();
    });
    stList?.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-del-staff');
      if (btn && stList.querySelectorAll('.act-staff-row').length > 1) btn.closest('.act-staff-row')?.remove();
    });
  }

  function buildValidatedPayload() {
    const d = D();
    const comercio = val('act-comercio'), titular = val('act-titular'), direccion = val('act-direccion'), pin = val('act-pin');
    const days = [...document.querySelectorAll('[data-act-day]:checked')].map(el => el.dataset.actDay);
    const modH = document.querySelector('input[name="modalidad_horario"]:checked')?.value || 'corrido';
    const srvs = collectServices();
    const senaMode = val('act-sena-mode'), senaVal = senaMode === 'sin_sena' ? '0' : val('act-sena-val'), alias = val('act-alias');
    const pms = [...document.querySelectorAll('[data-act-pm]:checked')].map(el => el.dataset.actPm);
    const waInfo = d.formatE164Ar(val('act-whatsapp'));
    const plan = val('act-plan'), staff = collectStaff();

    if (!comercio) return { err: 'Ingresá el nombre comercial de tu local.' };
    if (!titular) return { err: 'Ingresá el nombre del titular o responsable.' };
    if (!direccion) return { err: 'Ingresá la dirección física exacta del local.' };
    if (!/^\d{4}$/.test(pin)) return { err: 'El PIN de acceso debe tener exactamente 4 números.' };
    if (days.length === 0) return { err: 'Seleccioná al menos un día de atención.' };
    if (srvs.length === 0 || srvs.some(s => !s.name || s.price <= 0)) return { err: 'Completá al menos 1 servicio con nombre y precio mayor a cero.' };
    if (senaMode !== 'sin_sena' && (!Number(senaVal) || !alias)) return { err: 'Indicá el valor de la seña y tu Alias para recibir transferencias.' };
    if (!waInfo.e164) return { err: 'Ingresá un número de WhatsApp válido de 10 dígitos (ej: 3815554321).' };
    if (plan === 'l2' && (Number(val('act-l2-spaces')) < 1 || Number(val('act-l2-cap')) < 1)) return { err: 'Indicá la cantidad de espacios y capacidad por turno.' };
    if (plan === 'l3' && (staff.length === 0 || staff.some(s => !s.name))) return { err: 'Cargá al menos 1 profesional en el equipo para Nivel 3.' };

    return {
      payload: {
        'form-name': 'ficha-activacion-tucured', 'bot-field': '',
        comercio, titular, rubro: val('act-rubro'), localidad: val('act-localidad'), direccion, pin_acceso: pin,
        logo_url: val('act-logo-url'), logo_nota: val('act-logo-nota'),
        dias_atencion: days.join(', '), modalidad_horario: modH,
        horario_manana_desde: val('act-m-from'), horario_manana_hasta: val('act-m-to'),
        horario_tarde_desde: modH === 'partido' ? val('act-t-from') : '', horario_tarde_hasta: modH === 'partido' ? val('act-t-to') : '',
        intervalo_minutos: val('act-intervalo'),
        servicios_detalle: srvs.map(s => `${s.name} | $${s.price} | ${s.duration} min | ${s.sena ? 'Con seña' : 'Sin seña'}`).join('\n'),
        modalidad_sena: senaMode, valor_sena: senaVal, alias_pago: alias, cbu_cvu: val('act-cbu'),
        medios_pago: pms.join(', '), whatsapp_local: waInfo.e164, plan,
        cantidad_espacios: plan === 'l2' ? val('act-l2-spaces') : '', capacidad_turno: plan === 'l2' ? val('act-l2-cap') : '',
        profesionales_detalle: plan === 'l3' ? staff.map(s => `${s.name}${s.hours ? ` (${s.hours})` : ''}`).join('\n') : ''
      }
    };
  }

  function init() {
    const root = document.getElementById('activar-form-root'), succRoot = document.getElementById('activar-success-root');
    if (!root || !D() || !M()) return;
    const prefill = D().parseQueryPrefill(window.location.search);
    root.innerHTML = M().renderForm(prefill);
    syncConditionalBlocks(); bindDynamicLists();

    document.querySelectorAll('input[name="modalidad_horario"]').forEach(r => r.addEventListener('change', syncConditionalBlocks));
    ['act-sena-mode', 'act-plan'].forEach(id => document.getElementById(id)?.addEventListener('change', syncConditionalBlocks));
    document.getElementById('act-m-to')?.addEventListener('input', (e) => { e.target.dataset.touched = '1'; });
    document.getElementById('act-pin')?.addEventListener('input', (e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4); });
    document.getElementById('act-cbu')?.addEventListener('input', (e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 22); });
    document.getElementById('act-whatsapp')?.addEventListener('input', (e) => {
      const info = D().formatE164Ar(e.target.value), badge = document.getElementById('act-wa-e164');
      if (badge) { badge.textContent = info.e164 || '+549...'; badge.className = `text-[11px] font-mono font-bold shrink-0 ${info.e164 ? 'text-emerald-700' : 'text-stone-400'}`; }
    });

    const form = document.getElementById('activar-live-form'), submitBtn = document.getElementById('btn-activar-submit');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault(); showErr('');
      const { err, payload } = buildValidatedPayload();
      if (err) return showErr(err);
      const isLocal = ['localhost', '127.0.0.1', ''].includes(window.location.hostname);
      if (!isLocal) {
        if (submitBtn) submitBtn.disabled = true;
        try {
          const res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(payload).toString() });
          if (!res.ok) throw new Error(`Netlify Forms HTTP ${res.status}`);
        } catch (ex) {
          console.error('[TucuRed Activar] Error Netlify Forms:', ex);
          if (submitBtn) submitBtn.disabled = false;
          return showErr('No pudimos enviar la ficha al servidor. Verificá tu conexión e intentá nuevamente.');
        }
        if (submitBtn) submitBtn.disabled = false;
      }
      root.classList.add('hidden');
      if (succRoot) { succRoot.classList.remove('hidden'); succRoot.innerHTML = M().renderSuccessCard(payload, D().buildWhatsAppConfirmUrl(payload)); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
