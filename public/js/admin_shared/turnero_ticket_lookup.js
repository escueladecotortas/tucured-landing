// Archivo: public/js/admin_shared/turnero_ticket_lookup.js
// Consulta externa por Apellido + últimos 4 dígitos, historial con demos variadas y semillita cliente (< 195L)

window.TucuTicketResendAdapter = window.TucuTicketResendAdapter || {
  mode: 'noop',
  async requestResend() { return { ok: true }; }
};

window.TucuTicketLookup = (function () {
  const MODAL_ID = 'tucu-lookup-modal';
  const PROFILE_KEY = 'tucu_client_profile_v1';
  const L3_MAP = { peluqueria: 'barberia', estetica: 'peluqueria_estetica', salud: 'salud_consultorio', deportes: 'deportes_clubes', gastronomia: 'gastronomia', servicios: 'servicios' };
  const INACTIVE_ST = new Set(['CANCELLED', 'CANCELADO', 'COMPLETED', 'FINALIZADO', 'NO_SHOW', 'AUSENTE']);
  const cleanTok = (raw) => String(raw || '').replace(/^#/, '').trim().toUpperCase();
  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const normText = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const normLvl = (l) => (['l1', 'l2', 'l3'].includes(String(l || '').toLowerCase()) ? String(l).toLowerCase() : 'l1');
  const normRub = (r) => (window.TucuTurneroCatalog?.normalizeRubro ? window.TucuTurneroCatalog.normalizeRubro(r) : String(r || 'peluqueria').toLowerCase());
  const seedKey = (lvl, norm) => `tucu_client_seed_${normLvl(lvl)}_${normRub(norm)}`;
  const isoShift = (offset = 0) => {
    if (window.AdminShell?.localTodayStr) return window.AdminShell.localTodayStr(offset);
    const d = new Date(); d.setDate(d.getDate() + offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  function isBookingActive(b) {
    if (!b || b.deletedAt || INACTIVE_ST.has(String(b.status || '').toUpperCase())) return false;
    const d = String(b.dateStr || b.date || b.day || '');
    return !/^\d{4}-\d{2}-\d{2}$/.test(d) || d >= isoShift(0);
  }

  function collectBookings(lvl, norm) {
    const level = normLvl(lvl), rNorm = normRub(norm), rL3 = L3_MAP[rNorm] || rNorm;
    const keys = new Set([`tucu_${level}_bookings_${rNorm}`, `tucu_${level}_bookings_${rL3}`, `tucu_${level}_bookings`]);
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i) || ''; if (k.startsWith(`tucu_${level}_bookings`)) keys.add(k); }
    const out = [], seen = new Set();
    keys.forEach(k => {
      try {
        const list = JSON.parse(localStorage.getItem(k) || 'null'); if (!Array.isArray(list)) return;
        list.forEach(b => {
          const tok = cleanTok(b?.token || b?.id); if (!tok || seen.has(tok)) return;
          const bR = String(b.rubroId || '').toLowerCase();
          if (bR && bR !== rNorm && bR !== rL3 && normRub(bR) !== rNorm) return;
          seen.add(tok); out.push(b);
        });
      } catch (_) {}
    });
    return out;
  }

  function saveSeed(booking, ctx = {}) {
    if (!booking) return null;
    const lvl = normLvl(ctx.level || ctx.lvl), norm = normRub(ctx.rubro || booking.rubroId);
    const seed = { token: cleanTok(booking.token || booking.id), date: booking.dateStr || booking.date || isoShift(0), time: booking.time || '', service: booking.serviceName || booking.service || 'Servicio', rubro: norm, lvl };
    try { localStorage.setItem(seedKey(lvl, norm), JSON.stringify(seed)); } catch (_) {}
    return seed;
  }

  function getActiveSeed(lvl, norm) {
    const key = seedKey(lvl, norm); let seed = null;
    try { seed = JSON.parse(localStorage.getItem(key) || 'null'); } catch (_) { seed = null; }
    if (!seed || !seed.token) return null;
    const match = collectBookings(lvl, norm).find(b => cleanTok(b.token || b.id) === cleanTok(seed.token));
    if (!match || !isBookingActive(match)) { try { localStorage.removeItem(key); } catch (_) {} return null; }
    return { ...seed, date: match.dateStr || match.date || seed.date, time: match.time || seed.time };
  }

  function saveClientProfile({ nombre, apellido, whatsapp, cumpleanos, email, obraSocial } = {}) {
    const prev = getClientProfile() || {};
    const profile = {
      nombre: String(nombre || '').trim().slice(0, 60), apellido: String(apellido || '').trim().slice(0, 60),
      whatsapp: String(whatsapp || '').replace(/\D/g, '').slice(0, 20),
      cumpleanos: String(cumpleanos ?? prev.cumpleanos ?? '').trim().slice(0, 20),
      email: String(email ?? prev.email ?? '').trim().slice(0, 80),
      obraSocial: String(obraSocial ?? prev.obraSocial ?? '').trim().slice(0, 40)
    };
    if (!profile.nombre || !profile.whatsapp) return null;
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch (_) {}
    return profile;
  }

  function getClientProfile() { try { const raw = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null'); return raw && raw.nombre && raw.whatsapp ? raw : null; } catch (_) { return null; } }
  function clearClientProfile() { try { localStorage.removeItem(PROFILE_KEY); } catch (_) {} }

  function buildDemoSamples(lvl, norm, prof) {
    const seeds = window.TucuTurneroCatalog?.SEEDS?.[norm] || [];
    const info = window.TucuTurneroCatalog?.resolveBizInfo?.({ level: lvl, rubro: norm }) || {};
    const client = `${prof.nombre} ${prof.apellido || ''}`.trim();
    return [
      { id: 'TK-DM01', status: 'CONFIRMED', date: isoShift(3), time: '18:00', service: seeds[0]?.name || 'Servicio destacado', price: seeds[0]?.price || 10000, depositAmount: 0, depositPaid: true },
      { id: 'TK-DM02', status: 'COMPLETED', date: isoShift(-9), time: '16:30', service: seeds[1]?.name || seeds[0]?.name || 'Atención anterior', price: seeds[1]?.price || 12000, depositAmount: 0, depositPaid: true },
      { id: 'TK-DM03', status: 'CANCELLED', date: isoShift(-18), time: '11:00', service: seeds[2]?.name || seeds[0]?.name || 'Sesión previa', price: seeds[2]?.price || 8000, depositAmount: 0, cancelReason: 'Me surgió un imprevisto' }
    ].map(x => ({ ...x, token: `#${x.id}`, rubroId: norm, bizName: info.bizName, address: info.address, clientName: client, clientPhone: prof.whatsapp, dateStr: x.date, serviceName: x.service, isDemoSample: true }));
  }

  function getClientHistory(lvl, norm) {
    const prof = getClientProfile(), myDigits = String(prof?.whatsapp || '').replace(/\D/g, ''), rNorm = normRub(norm);
    if (myDigits.length < 6) return [];
    const tail = myDigits.slice(-8);
    const real = collectBookings(lvl, rNorm).filter(b => {
      if (!b || b.deletedAt) return false;
      const p = String(b.clientPhone || b.phone || '').replace(/\D/g, '');
      return p === myDigits || (tail.length >= 8 && p.endsWith(tail));
    }).sort((a, b) => {
      const aAct = isBookingActive(a) ? 1 : 0, bAct = isBookingActive(b) ? 1 : 0;
      return aAct !== bAct ? bAct - aAct : `${b.dateStr || b.date || ''} ${b.time || ''}`.localeCompare(`${a.dateStr || a.date || ''} ${a.time || ''}`);
    });
    const stKinds = new Set(real.map(b => String(b.status || '').toUpperCase()));
    if (real.length === 0 || stKinds.size < 2) {
      const seen = new Set(real.map(b => cleanTok(b.token || b.id)));
      return [...real, ...buildDemoSamples(lvl, rNorm, prof).filter(s => !seen.has(cleanTok(s.id)))];
    }
    return real;
  }

  function verifyByLastNameAndLast4(lvl, norm, rawLastName, rawLast4) {
    const qLast = normText(rawLastName), last4 = String(rawLast4 || '').replace(/\D/g, '').slice(-4);
    if (qLast.length < 2 || last4.length !== 4) return [];
    return collectBookings(lvl, norm).filter(b => {
      if (!isBookingActive(b)) return false;
      const phone = String(b.clientPhone || b.phone || '').replace(/\D/g, '');
      if (phone.length < 4 || phone.slice(-4) !== last4) return false;
      const full = normText(b.clientName || b.client || ''), parts = full.split(/\s+/).filter(Boolean);
      return full === qLast || parts.slice(1).join(' ') === qLast || parts.slice(1).includes(qLast);
    });
  }

  function openLookupModal({ lvl = 'l1', norm = 'peluqueria', accent = '#18181B', vocab, onFoundBooking } = {}) {
    document.getElementById(MODAL_ID)?.remove();
    const v = vocab || { singular: 'turno' }; let tab = 'search';
    const ov = document.createElement('div'); ov.id = MODAL_ID;
    ov.className = 'fixed inset-0 z-[95] bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-4';
    ov.innerHTML = `<div class="w-full max-w-sm rounded-3xl bg-white border border-stone-200 p-5 shadow-2xl space-y-4 text-stone-900">
      <div class="flex items-start justify-between gap-2"><div><h2 class="text-base font-semibold text-stone-900">Consultar tu ${esc(v.singular)}</h2><p class="text-xs text-stone-500 mt-0.5">Accedé a tu comprobante desde cualquier dispositivo.</p></div><button type="button" id="btn-close-lookup" aria-label="Cerrar" class="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 flex items-center justify-center shrink-0 cursor-pointer"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button></div>
      <div class="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#F5F2EC] border border-stone-200">
        <button type="button" id="tab-lookup-search" class="py-2 px-2 rounded-lg text-xs font-bold bg-white text-stone-900 shadow-2xs cursor-pointer">Buscar mi ${esc(v.singular)}</button>
        <button type="button" id="tab-lookup-resend" class="py-2 px-2 rounded-lg text-xs font-semibold text-stone-600 cursor-pointer">Reenviar por WhatsApp</button>
      </div>
      <form id="form-lookup-search" class="space-y-3">
        <div><label for="inp-lookup-lastname" class="block text-xs font-semibold text-stone-700 mb-1">Apellido</label><input id="inp-lookup-lastname" type="text" required placeholder="Ej. Rodríguez" class="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200 text-xs outline-none" /></div>
        <div><label for="inp-lookup-last4" class="block text-xs font-semibold text-stone-700 mb-1">Últimos 4 dígitos de tu celular</label><input id="inp-lookup-last4" type="tel" required inputmode="numeric" maxlength="4" placeholder="Ej. 4321" class="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200 text-xs tabular-nums outline-none" /></div>
        <p id="lookup-search-error" class="hidden text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2"></p>
        <div id="lookup-multi-results" class="hidden space-y-1.5 max-h-40 overflow-y-auto"></div>
        <button type="submit" id="btn-lookup-submit" style="background-color:${esc(accent)}" class="w-full py-2.5 rounded-xl text-white text-xs font-bold cursor-pointer">Ver mi comprobante</button>
      </form>
      <form id="form-lookup-resend" class="hidden space-y-3">
        <div><label for="inp-resend-lastname" class="block text-xs font-semibold text-stone-700 mb-1">Apellido</label><input id="inp-resend-lastname" type="text" required placeholder="Ej. Rodríguez" class="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200 text-xs outline-none" /></div>
        <div><label for="inp-resend-last4" class="block text-xs font-semibold text-stone-700 mb-1">Últimos 4 dígitos de tu celular</label><input id="inp-resend-last4" type="tel" required inputmode="numeric" maxlength="4" placeholder="Ej. 4321" class="w-full p-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200 text-xs tabular-nums outline-none" /></div>
        <p id="lookup-resend-notice" class="hidden text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2"></p>
        <button type="submit" id="btn-lookup-resend" class="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold cursor-pointer">Reenviar a mi WhatsApp</button>
      </form>
    </div>`;

    document.body.appendChild(ov); const close = () => ov.remove();
    ov.addEventListener('click', (e) => { if (e.target === ov) close(); }); ov.querySelector('#btn-close-lookup').onclick = close;
    const tSearch = ov.querySelector('#tab-lookup-search'), tRes = ov.querySelector('#tab-lookup-resend'), fSearch = ov.querySelector('#form-lookup-search'), fRes = ov.querySelector('#form-lookup-resend');
    const switchTab = (next) => {
      tab = next;
      tSearch.className = `py-2 px-2 rounded-lg text-xs cursor-pointer ${tab === 'search' ? 'font-bold bg-white text-stone-900 shadow-2xs' : 'font-semibold text-stone-600'}`;
      tRes.className = `py-2 px-2 rounded-lg text-xs cursor-pointer ${tab === 'resend' ? 'font-bold bg-white text-stone-900 shadow-2xs' : 'font-semibold text-stone-600'}`;
      fSearch.classList.toggle('hidden', tab !== 'search'); fRes.classList.toggle('hidden', tab !== 'resend');
    };
    tSearch.onclick = () => switchTab('search'); tRes.onclick = () => switchTab('resend');

    fSearch.onsubmit = (e) => {
      e.preventDefault();
      const errEl = ov.querySelector('#lookup-search-error'), multi = ov.querySelector('#lookup-multi-results');
      const matches = verifyByLastNameAndLast4(lvl, norm, ov.querySelector('#inp-lookup-lastname')?.value, ov.querySelector('#inp-lookup-last4')?.value);
      multi.innerHTML = ''; multi.classList.add('hidden');
      if (!matches.length) { errEl.textContent = 'No encontramos registros activos con ese apellido y terminación.'; errEl.classList.remove('hidden'); return; }
      errEl.classList.add('hidden');
      if (matches.length === 1) { close(); if (typeof onFoundBooking === 'function') onFoundBooking(matches[0]); return; }
      multi.classList.remove('hidden');
      multi.innerHTML = matches.map(m => `<button type="button" data-pick-tok="${esc(cleanTok(m.token || m.id))}" class="w-full p-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F4F0E8] border border-stone-200 text-left text-xs cursor-pointer"><strong class="text-stone-900">#${esc(cleanTok(m.token || m.id))} · ${esc(m.serviceName || m.service)}</strong><span class="block text-[11px] text-stone-600 tabular-nums">${esc(m.dateStr || m.date)} · ${esc(m.time)} hs</span></button>`).join('');
      multi.querySelectorAll('[data-pick-tok]').forEach(b => b.addEventListener('click', () => {
        const hit = matches.find(m => cleanTok(m.token || m.id) === b.getAttribute('data-pick-tok')); close(); if (hit && typeof onFoundBooking === 'function') onFoundBooking(hit);
      }));
    };

    fRes.onsubmit = (e) => {
      e.preventDefault();
      const matches = verifyByLastNameAndLast4(lvl, norm, ov.querySelector('#inp-resend-lastname')?.value, ov.querySelector('#inp-resend-last4')?.value);
      const note = ov.querySelector('#lookup-resend-notice');
      if (matches.length) {
        const regPhone = String(matches[0].clientPhone || matches[0].phone || '').replace(/\D/g, '');
        try { window.TucuTicketResendAdapter?.requestResend?.({ lvl, norm, phone: regPhone, code: cleanTok(matches[0].token || matches[0].id) }); } catch (_) {}
      }
      note.textContent = 'Si encontramos registros activos con esos datos, te reenviamos el comprobante a tu WhatsApp registrado.';
      note.classList.remove('hidden');
    };
  }

  return { saveSeed, getActiveSeed, saveClientProfile, getClientProfile, clearClientProfile, getClientHistory, verifyByLastNameAndLast4, openLookupModal };
})();