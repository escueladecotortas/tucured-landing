// Archivo: public/js/empezar_step11.js
// Paso 11 Finalizacion: canvas confetti nativo liviano, URL .tucured.com.ar y acciones reales (< 130L)

window.TucuEmpezarStep11 = (function () {
  const TUCU_WA_PHONE = '5493814132154';
  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  function launchConfetti(accentHex = '#EA580C') {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = document.getElementById('emp-confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const colors = [accentHex || '#EA580C', '#F97316', '#FBBF24', '#10B981', '#292524'];
    const parts = Array.from({ length: 68 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 140,
      w: 6 + Math.random() * 6,
      h: 4 + Math.random() * 5,
      vx: (Math.random() - 0.5) * 3.4,
      vy: 2.6 + Math.random() * 3.8,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.16,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    const start = performance.now();
    function tick(now) {
      if (now - start > 2600) { ctx.clearRect(0, 0, canvas.width, canvas.height); return; }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      parts.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function buildWhatsAppHref(st, planName) {
    const lines = [
      `¡Hola Tucu Red! Acabo de activar *${st.comercio || 'mi negocio'}* en el ${planName}.`,
      `Link elegido: https://${st.slug}.tucured.com.ar`,
      st.paymentMethod === 'transfer' ? 'Te adjunto mi comprobante de transferencia.' : 'Pago procesado por Mercado Pago.',
      st.asistenciaCarga === 'whatsapp_email' ? 'También te paso mi lista de servicios y precios.' : ''
    ].filter(Boolean);
    return `https://wa.me/${TUCU_WA_PHONE}?text=${encodeURIComponent(lines.join('\n'))}`;
  }

  function render(st, activarHref) {
    const S = window.TucuEmpezarState;
    const plan = S.getPlanMeta(st.plan, st.rubro);
    const url = `https://${st.slug}.tucured.com.ar`;
    const waHref = buildWhatsAppHref(st, plan.name);
    const steps = [
      'Recibimos tu diseño, portada exclusiva y configuración elegida.',
      'Validamos tu alta y dejamos tu link listo para recibir reservas.',
      'Si abonaste por transferencia o elegiste enviar precios por WhatsApp, podés mandarlos ahora.'
    ];

    return `
      <canvas id="emp-confetti-canvas" class="fixed inset-0 pointer-events-none z-50"></canvas>
      <div id="emp-success-view" class="space-y-4 py-1">
        <div class="text-center space-y-1.5">
          <span class="inline-block px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700">Alta confirmada</span>
          <h2 class="text-2xl font-extrabold text-stone-900">¡Tu App ya está en marcha!</h2>
          <p class="text-xs text-stone-600">Tu espacio para <strong>${esc(st.comercio)}</strong> quedó reservado en <strong>${esc(plan.name)}</strong>.</p>
        </div>

        <div class="p-3.5 rounded-2xl bg-[#F1EBE3] border border-[#E2D8CB] flex items-center justify-between gap-2">
          <div class="min-w-0">
            <span class="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Tu link de reservas</span>
            <strong id="emp-success-domain" class="block text-xs sm:text-sm font-extrabold text-emerald-700 truncate">${esc(url)}</strong>
          </div>
          <button type="button" id="btn-emp-copy-link" class="wg-btn-secondary px-3 py-2 rounded-xl text-xs font-bold shrink-0 cursor-pointer">
            <span id="emp-copy-link-label">Copiar mi link</span>
          </button>
        </div>

        <div class="p-4 rounded-2xl wg-option space-y-2">
          <p class="text-xs font-bold uppercase tracking-wider text-[#EA580C]">¿Qué pasa ahora?</p>
          <ol class="space-y-1.5 text-xs text-stone-700">
            ${steps.map((txt, idx) => `<li class="flex items-start gap-2"><span class="w-5 h-5 rounded-full bg-orange-100 text-[#EA580C] font-bold text-[11px] flex items-center justify-center shrink-0">${idx + 1}</span><span>${esc(txt)}</span></li>`).join('')}
          </ol>
        </div>

        <div class="flex flex-col sm:flex-row gap-2.5">
          <a id="btn-goto-activar" href="${esc(activarHref || '/activar.html')}" class="wg-btn-primary flex-1 py-3 px-4 rounded-2xl text-xs font-bold text-center">Personalizar más detalles ahora</a>
          <a id="btn-open-wa-now" href="${esc(waHref)}" target="_blank" rel="noopener noreferrer" class="wg-btn-secondary flex-1 py-3 px-4 rounded-2xl text-xs font-bold text-center">Abrir WhatsApp ahora</a>
        </div>
        <div class="text-center">
          <button type="button" id="btn-emp-later" class="text-xs font-semibold text-stone-500 hover:text-stone-800 underline cursor-pointer">Seguir más tarde</button>
        </div>
        <p id="emp-later-notice" class="hidden text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5">Guardamos tu avance y tu link ${esc(url)} para que sigas cuando quieras.</p>
      </div>`;
  }

  return { render, launchConfetti };
})();
