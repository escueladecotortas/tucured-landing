// Archivo: public/js/empezar_step11.js
// Paso 11 Finalización: 2 estados reales (MP acreditado vs Transferencia 24hs), link completo móvil y WA target=_blank (< 150L)

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
      x: Math.random() * canvas.width, y: -20 - Math.random() * 140,
      w: 6 + Math.random() * 6, h: 4 + Math.random() * 5,
      vx: (Math.random() - 0.5) * 3.4, vy: 2.6 + Math.random() * 3.8,
      rot: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * 0.16,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    const start = performance.now();
    function tick(now) {
      if (now - start > 2600) { ctx.clearRect(0, 0, canvas.width, canvas.height); return; }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      parts.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
      });
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function buildWhatsAppHref(st, planName, isPaid) {
    const lines = [
      isPaid
        ? `¡Hola Tucu Red! Acabo de activar *${st.comercio || 'mi negocio'}* en el ${planName}.`
        : `¡Hola Tucu Red! Acabo de reservar *${st.comercio || 'mi negocio'}* en el ${planName}.`,
      `Link elegido: https://${st.slug}.tucured.com.ar`,
      isPaid ? 'Pago procesado por Mercado Pago.' : 'Te envío mi comprobante de transferencia ($4.999 al Alias tucured).',
      st.asistenciaCarga === 'whatsapp_email' ? 'También te paso mi lista de servicios y precios.' : ''
    ].filter(Boolean);
    return `https://wa.me/${TUCU_WA_PHONE}?text=${encodeURIComponent(lines.join('\n'))}`;
  }

  function render(st, activarHref) {
    const S = window.TucuEmpezarState;
    const plan = S.getPlanMeta(st.plan, st.rubro);
    const url = `https://${st.slug}.tucured.com.ar`;
    const isPaid = Boolean(st.paidViaMp || st.paymentStatus === 'paid');
    const waHref = buildWhatsAppHref(st, plan.name, isPaid);
    const shortHref = st.shortActivarUrl || activarHref || '/activar.html';

    const badge = isPaid
      ? '<span id="emp-p11-badge" class="inline-block px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700">Pago acreditado · Alta confirmada</span>'
      : '<span id="emp-p11-badge" class="inline-block px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-[11px] font-bold text-amber-800">Reserva pendiente · 24 hs</span>';

    const heading = isPaid ? '¡Tu App ya está en marcha!' : '¡Tu diseño y link están reservados!';
    const subtitle = isPaid
      ? `Tu espacio para <strong>${esc(st.comercio)}</strong> quedó activo en <strong>${esc(plan.name)}</strong>.`
      : `Guardamos el diseño y tu link para <strong>${esc(st.comercio)}</strong> en <strong>${esc(plan.name)}</strong>.`;

    const transferNotice = !isPaid ? `
      <div id="emp-transfer-24h-box" class="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs text-stone-800 space-y-1.5 leading-relaxed">
        <p class="font-extrabold text-amber-900">Importante: tenés 24 horas para confirmar tu transferencia</p>
        <p>Transferí <strong>$4.999</strong> al Alias <strong class="tabular-nums">tucured</strong> (Titular: <strong>Leonardo Laricchiuta</strong>) y enviá el comprobante por WhatsApp. Vencido ese plazo sin acreditación, el link y la portada exclusiva vuelven a liberarse automáticamente.</p>
      </div>` : '';

    const steps = isPaid
      ? ['Recibimos tu diseño, portada exclusiva y pago acreditado.', 'Dejamos tu link listo para recibir reservas.', st.asistenciaCarga === 'whatsapp_email' ? 'Podés mandarnos tu lista de precios por WhatsApp ahora.' : 'Podés sumar más detalles cuando quieras en la Ficha Rápida.']
      : ['Tu diseño, portada y link quedaron reservados por 24 horas.', 'Aboná $4.999 al Alias tucured (Leonardo Laricchiuta) y mandá el comprobante por WhatsApp.', 'Apenas lo validemos, activamos tu App y te enviamos los accesos finales.'];

    return `
      ${isPaid ? '<canvas id="emp-confetti-canvas" class="fixed inset-0 pointer-events-none z-50"></canvas>' : ''}
      <div id="emp-success-view" class="space-y-4 py-1">
        <div class="text-center space-y-1.5">${badge}<h2 class="text-2xl font-extrabold text-stone-900">${heading}</h2><p class="text-xs text-stone-600">${subtitle}</p></div>

        <div class="p-3.5 rounded-2xl bg-[#F1EBE3] border border-[#E2D8CB] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <div class="min-w-0">
            <span class="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Tu link de reservas</span>
            <strong id="emp-success-domain" class="block text-xs sm:text-sm font-extrabold text-emerald-700 break-all tabular-nums">${esc(url)}</strong>
          </div>
          <button type="button" id="btn-emp-copy-link" class="wg-btn-secondary px-3 py-2 rounded-xl text-xs font-bold shrink-0 cursor-pointer self-start sm:self-center">
            <span id="emp-copy-link-label">Copiar mi link</span>
          </button>
        </div>

        ${transferNotice}

        <div class="p-4 rounded-2xl wg-option space-y-2">
          <p class="text-xs font-bold uppercase tracking-wider text-[#EA580C]">¿Qué pasa ahora?</p>
          <ol class="space-y-1.5 text-xs text-stone-700">${steps.map((txt, idx) => `<li class="flex items-start gap-2"><span class="w-5 h-5 rounded-full bg-orange-100 text-[#EA580C] font-bold text-[11px] flex items-center justify-center shrink-0">${idx + 1}</span><span>${esc(txt)}</span></li>`).join('')}</ol>
        </div>

        <div class="flex flex-col sm:flex-row gap-2.5">
          <a id="btn-open-wa-now" href="${esc(waHref)}" target="_blank" rel="noopener noreferrer" class="wg-btn-emerald flex-1 py-3 px-4 rounded-2xl text-xs font-bold text-center">Abrir WhatsApp ahora</a>
          <a id="btn-goto-activar" href="${esc(shortHref)}" class="wg-btn-secondary flex-1 py-3 px-4 rounded-2xl text-xs font-bold text-center">Personalizar más detalles ahora</a>
        </div>
        <div class="text-center pt-1 space-y-1">
          <p class="text-[11px] text-stone-500">Tu reserva ya quedó registrada.</p>
          <a id="btn-emp-back-home" href="/" class="inline-block text-xs font-bold text-stone-700 hover:text-[#EA580C] underline">Volver a tucured.ar</a>
        </div>
      </div>`;
  }

  return { render, launchConfetti };
})();