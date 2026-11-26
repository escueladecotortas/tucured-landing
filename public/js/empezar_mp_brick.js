// Archivo: public/js/empezar_mp_brick.js
// Carga diferida Mercado Pago SDK v2, montaje Payment Brick Sandbox, mp-process y retorno (?mp_return=1) (< 170L)

window.TucuEmpezarMpBrick = (function () {
  const DEFAULT_ENGINE = 'https://engine.tucured.com.ar';
  let sdkPromise = null;
  let brickCtrl = null;

  const resolveEngineBase = () => (window.TUCU_ENGINE_URL ? String(window.TUCU_ENGINE_URL).replace(/\/$/, '') : DEFAULT_ENGINE);

  async function fetchJsonTimeout(url, opts, ms) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms);
    try {
      const res = await fetch(url, { ...(opts || {}), signal: ctrl.signal });
      const data = await res.json().catch(() => ({}));
      return { ok: res.ok, status: res.status, data };
    } finally {
      clearTimeout(timer);
    }
  }

  function ensureSdkLoaded() {
    if (window.MercadoPago) return Promise.resolve(window.MercadoPago);
    if (sdkPromise) return sdkPromise;
    sdkPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://sdk.mercadopago.com/js/v2';
      s.async = true;
      s.onload = () => (window.MercadoPago ? resolve(window.MercadoPago) : reject(new Error('SDK Mercado Pago no inicializó.')));
      s.onerror = () => reject(new Error('No pudimos cargar el SDK de Mercado Pago.'));
      document.head.appendChild(s);
    });
    return sdkPromise;
  }

  async function unmount() {
    if (brickCtrl && typeof brickCtrl.unmount === 'function') {
      try { await brickCtrl.unmount(); } catch {}
    }
    brickCtrl = null;
  }

  async function mountPaymentBrick({ containerId, getState, onTermsMissing, onApproved, onCoverConflict, onError }) {
    const host = document.getElementById(containerId);
    if (!host) return;
    const statusEl = document.getElementById('emp-mp-status');
    const setStatus = (msg) => { if (statusEl) statusEl.textContent = msg || ''; };
    setStatus('Conectando checkout seguro de Mercado Pago...');
    await unmount();

    try {
      const st = getState();
      const [cfgRes, prefRes] = await Promise.all([
        fetchJsonTimeout(`${resolveEngineBase()}/api/payments/mp-config`, null, 15000),
        fetchJsonTimeout(`${resolveEngineBase()}/api/payments/mp-preference`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug: st.slug,
            comercio: st.comercio,
            plan: st.plan,
            returnUrl: `${window.location.origin}/empezar.html?mp_return=1&slug=${encodeURIComponent(st.slug)}`
          })
        }, 15000)
      ]);
      if (!cfgRes.ok || !cfgRes.data?.publicKey) throw new Error('Configuración de Mercado Pago no disponible.');
      if (!prefRes.ok || !prefRes.data?.preferenceId) throw new Error('No pudimos iniciar la preferencia de pago.');

      await ensureSdkLoaded();
      const mp = new window.MercadoPago(cfgRes.data.publicKey, { locale: 'es-AR' });
      const bricks = mp.bricks();
      brickCtrl = await bricks.create('payment', containerId, {
        initialization: {
          amount: Number(cfgRes.data.amount || prefRes.data.amount || 4999),
          preferenceId: prefRes.data.preferenceId
        },
        customization: {
          visual: {
            style: {
              theme: 'default',
              customVariables: {
                baseColor: '#EA580C',
                formBackgroundColor: '#FAF8F5',
                textPrimaryColor: '#292524'
              }
            }
          },
          paymentMethods: { creditCard: 'all', debitCard: 'all', mercadoPago: 'all' }
        },
        callbacks: {
          onReady: () => setStatus(''),
          onError: (err) => {
            setStatus('No pudimos completar ese medio de pago. Podés reintentar o usar Transferencia.');
            onError?.(err);
          },
          onSubmit: async ({ formData }) => {
            const cur = getState();
            if (!cur.termsAccepted) {
              onTermsMissing?.();
              throw new Error('TERMS_REQUIRED');
            }
            setStatus('Procesando tu activación...');
            const procRes = await fetchJsonTimeout(`${resolveEngineBase()}/api/payments/mp-process`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...formData,
                formData,
                slug: cur.slug,
                comercio: cur.comercio,
                plan: cur.plan,
                coverId: cur.coverMode === 'custom' ? 'custom' : (cur.coverId || ''),
                amount: Number(cfgRes.data.amount || 4999),
                whatsapp: window.TucuEmpezarState?.toE164Whatsapp?.(cur.whatsapp) || cur.whatsapp,
                termsAccepted: true,
                termsAcceptedAt: cur.termsAcceptedAt,
                termsVersion: cur.termsVersion || 'v1-2026'
              })
            }, 15000);
            if (procRes.status === 409 || procRes.data?.error === 'COVER_ALREADY_TAKEN') {
              onCoverConflict?.();
              throw new Error('COVER_ALREADY_TAKEN');
            }
            if (!procRes.ok || !procRes.data?.approved) {
              const msg = procRes.data?.message || 'El pago no se aprobó. Revisá los datos o probá Transferencia.';
              setStatus(msg);
              throw new Error(msg);
            }
            setStatus('');
            await onApproved?.(procRes.data);
          }
        }
      });
    } catch (err) {
      setStatus(err?.message || 'No pudimos cargar Mercado Pago. Podés continuar por Transferencia.');
      onError?.(err);
    }
  }

  async function checkReturnStatus(slug) {
    if (!slug) return { ok: false, paid: false };
    try {
      const r = await fetchJsonTimeout(`${resolveEngineBase()}/api/payments/mp-status/${encodeURIComponent(slug)}`, null, 15000);
      return r.ok ? r.data : { ok: false, paid: false };
    } catch {
      return { ok: false, paid: false };
    }
  }

  return { mountPaymentBrick, unmount, checkReturnStatus };
})();
