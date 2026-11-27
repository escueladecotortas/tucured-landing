// Archivo: public/js/empezar_terms_modal.js
// Modal interno de Términos y Condiciones v1.1 dentro de /empezar.html (sin salir del flujo) (< 120L)

window.TucuEmpezarTermsModal = (function () {
  const VERSION = 'v1.1';
  const MODAL_ID = 'emp-terms-modal';

  function formatNow() {
    try {
      return new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date());
    } catch {
      return new Date().toISOString().slice(0, 16).replace('T', ' ');
    }
  }

  function close() {
    const el = document.getElementById(MODAL_ID);
    if (el) el.remove();
    document.body.style.overflow = '';
  }

  function open() {
    close();
    const wrap = document.createElement('div');
    wrap.id = MODAL_ID;
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-labelledby', 'emp-terms-modal-title');
    wrap.className = 'fixed inset-0 z-50 bg-[#292524]/60 backdrop-blur-sm p-4 flex items-center justify-center';
    wrap.innerHTML = `
      <div class="wg-card bg-[#FAF8F5] w-full max-w-lg rounded-3xl border border-[#E2D8CB] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div class="px-5 py-4 border-b border-[#E2D8CB] flex items-center justify-between gap-3 bg-white/80">
          <div>
            <span class="block text-[10px] font-bold uppercase tracking-wider text-[#EA580C]">Contrato digital TucuRed</span>
            <h3 id="emp-terms-modal-title" class="text-base font-extrabold text-stone-900">Términos y Condiciones del Servicio</h3>
          </div>
          <button type="button" id="btn-close-terms-top" aria-label="Cerrar términos" class="w-8 h-8 rounded-full wg-btn-secondary text-sm font-bold flex items-center justify-center cursor-pointer">&times;</button>
        </div>
        <div class="p-5 overflow-y-auto space-y-3.5 text-xs text-stone-700 leading-relaxed">
          <div>
            <h4 class="font-bold text-stone-900 mb-1">1. Comunicaciones operativas por WhatsApp</h4>
            <p>Al confirmar tu reserva, autorizás expresamente a TucuRed a contactarte y enviarte accesos de activación, avisos operativos y recordatorios vinculados a tu cuenta al número WhatsApp declarado.</p>
          </div>
          <div>
            <h4 class="font-bold text-stone-900 mb-1">2. Propiedad intelectual y contenido subido</h4>
            <p>El titular del comercio declara contar con derechos y licencias legítimas sobre los logos, fotografías, textos y marcas que cargue en la plataforma. Todo archivo subido atraviesa controles automáticos de seguridad visual contra contenido prohibido o ilícito.</p>
          </div>
          <div>
            <h4 class="font-bold text-stone-900 mb-1">3. Reserva por transferencia bancaria (plazo 24 hs)</h4>
            <p>Si elegís abonar mediante transferencia directa, tu link propio y la portada exclusiva seleccionada quedan reservados por <strong>24 horas corridas</strong> para acreditar el pago al Alias <strong>tucured</strong> (Titular: Leonardo Laricchiuta) y enviar el comprobante por WhatsApp. Vencido ese plazo sin acreditación, tanto el subdominio como la portada vuelven a quedar disponibles automáticamente.</p>
          </div>
          <div>
            <h4 class="font-bold text-stone-900 mb-1">4. Derecho de arrepentimiento online</h4>
            <p>Conforme a la Ley 24.240 y la Resolución 424/2020 de Defensa del Consumidor, contás con un plazo de <strong>10 días corridos</strong> desde la contratación para revocar la operación sin costo escribiéndonos por WhatsApp oficial.</p>
          </div>
        </div>
        <div class="px-5 py-3.5 border-t border-[#E2D8CB] bg-white/80 flex flex-wrap items-center justify-between gap-2">
          <span id="emp-terms-version-footer" class="text-[11px] font-semibold text-stone-500 tabular-nums">Versión ${VERSION} · ${formatNow()}</span>
          <button type="button" id="btn-close-terms-modal" class="wg-btn-primary px-5 py-2 rounded-xl text-xs font-bold cursor-pointer">Cerrar</button>
        </div>
      </div>`;

    document.body.appendChild(wrap);
    document.body.style.overflow = 'hidden';
    wrap.addEventListener('click', (e) => { if (e.target === wrap) close(); });
    document.getElementById('btn-close-terms-modal')?.addEventListener('click', close);
    document.getElementById('btn-close-terms-top')?.addEventListener('click', close);
  }

  return { VERSION, open, close };
})();