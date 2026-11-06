// Archivo: public/js/admin_l1/admin_l1_baileys.js
// Motor L1 Core: Cronograma Semanal, Cierres Especiales & Baileys QR (< 180 líneas)
(function (global) {
  const defaultSchedule = {
    1: { enabled: true, open: '09:00', close: '13:00', isSplit: true, open2: '17:00', close2: '21:00' },
    2: { enabled: true, open: '09:00', close: '13:00', isSplit: true, open2: '17:00', close2: '21:00' },
    3: { enabled: true, open: '09:00', close: '13:00', isSplit: true, open2: '17:00', close2: '21:00' },
    4: { enabled: true, open: '09:00', close: '13:00', isSplit: true, open2: '17:00', close2: '21:00' },
    5: { enabled: true, open: '09:00', close: '13:00', isSplit: true, open2: '17:00', close2: '21:00' },
    6: { enabled: true, open: '09:00', close: '13:00', isSplit: false, open2: '17:00', close2: '21:00' },
    0: { enabled: false, open: '09:00', close: '13:00', isSplit: false, open2: '17:00', close2: '21:00' }
  };
  const dayNames = { 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 0: 'Domingo' };
  let schedule = {}, vacations = [];

  function loadStorage() {
    try { schedule = JSON.parse(localStorage.getItem('tucu_schedule')) || defaultSchedule; } catch (e) { schedule = defaultSchedule; }
    try { vacations = JSON.parse(localStorage.getItem('tucu_l1_vacations')) || []; } catch (e) { vacations = []; }
  }
  function saveSchedule() { try { localStorage.setItem('tucu_schedule', JSON.stringify(schedule)); } catch (e) {} }
  function saveVacations() { try { localStorage.setItem('tucu_l1_vacations', JSON.stringify(vacations)); } catch (e) {} }

  function renderSchedule() {
    const box = document.getElementById('weekly-schedule-container'); if (!box) return;
    box.innerHTML = [1, 2, 3, 4, 5, 6, 0].map(d => {
      const s = schedule[d] || { enabled: false, open: '09:00', close: '13:00', isSplit: false, open2: '17:00', close2: '21:00' };
      return `<div class="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-2.5">
        <div class="flex items-center justify-between">
          <label class="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" onchange="adminL1Baileys.toggleDay(${d}, this.checked)" ${s.enabled ? 'checked' : ''} class="w-4 h-4 rounded bg-zinc-900 text-blue-600 focus:ring-blue-500">
            <span class="text-xs font-bold ${s.enabled ? 'text-zinc-100' : 'text-zinc-500'}">${dayNames[d]}</span>
          </label>
          <button type="button" onclick="adminL1Baileys.toggleSplit(${d})" class="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${s.isSplit ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-zinc-800 text-zinc-400'}">
            ${s.isSplit ? '☀️ Horario Partido' : '🔄 Horario Corrido'}
          </button>
        </div>
        ${s.enabled ? `<div class="grid grid-cols-2 ${s.isSplit ? 'sm:grid-cols-4' : 'sm:grid-cols-2'} gap-2 pt-1">
          <div><span class="block text-[10px] text-zinc-400 mb-0.5">Apertura Mañana</span><input type="time" value="${s.open}" onchange="adminL1Baileys.updateHour(${d}, 'open', this.value)" class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-100"></div>
          <div><span class="block text-[10px] text-zinc-400 mb-0.5">Cierre Mañana</span><input type="time" value="${s.close}" onchange="adminL1Baileys.updateHour(${d}, 'close', this.value)" class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-100"></div>
          ${s.isSplit ? `<div><span class="block text-[10px] text-zinc-400 mb-0.5">Apertura Tarde</span><input type="time" value="${s.open2 || '17:00'}" onchange="adminL1Baileys.updateHour(${d}, 'open2', this.value)" class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-100"></div>
          <div><span class="block text-[10px] text-zinc-400 mb-0.5">Cierre Noche</span><input type="time" value="${s.close2 || '21:00'}" onchange="adminL1Baileys.updateHour(${d}, 'close2', this.value)" class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-100"></div>` : ''}
        </div>` : ''}
      </div>`;
    }).join('');
  }

  function renderVacationsList() {
    const c = document.getElementById('vacations-list-container'); if (!c) return;
    if (vacations.length === 0) return c.innerHTML = '<p class="text-xs text-zinc-500 italic py-2">Sin cierres especiales programados.</p>';
    c.innerHTML = vacations.map((v, i) => `<div class="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
      <div class="flex items-center gap-2"><span class="text-amber-400 font-bold">${v.reason}</span><span class="text-zinc-400 font-mono">${v.from} al ${v.to}</span></div>
      <button type="button" onclick="adminL1Baileys.deleteVacation(${i})" class="text-rose-400 hover:text-rose-300 font-bold px-2 py-1 cursor-pointer">Eliminar</button>
    </div>`).join('');
  }

  function addVacation() {
    const f = document.getElementById('vacation-start')?.value, t = document.getElementById('vacation-end')?.value, r = (document.getElementById('vacation-reason')?.value || '').trim() || 'Feriado / Cierre';
    if (!f || !t) return;
    vacations.push({ from: f, to: t, reason: r }); saveVacations(); renderVacationsList();
    if (document.getElementById('vacation-start')) document.getElementById('vacation-start').value = '';
    if (document.getElementById('vacation-end')) document.getElementById('vacation-end').value = '';
    if (document.getElementById('vacation-reason')) document.getElementById('vacation-reason').value = '';
  }

  async function checkBaileysStatus() {
    const badge = document.getElementById('wa-connection-status'), nameEl = document.getElementById('wa-account-name');
    const emitterEl = document.getElementById('wa-emitter-phone'), receiverEl = document.getElementById('wa-receiver-phone');
    try {
      const res = await fetch('/api/wa/status'); const data = await res.json();
      const isOnline = data && (data.status === 'OPEN' || data.connected === true);
      if (badge) {
        badge.textContent = isOnline ? '● En Línea' : (data.status === 'QR_READY' ? '● QR Listo' : '○ Desconectado');
        badge.className = `px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all ${isOnline ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : (data.status === 'QR_READY' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'bg-zinc-800 text-zinc-400 border-zinc-700')}`;
      }
      if (nameEl && data.user?.id) nameEl.textContent = (localStorage.getItem('tucu_l1_biz_name') || 'Comercio L1') + ' (' + data.user.id.split(':')[0] + ')';
      if (emitterEl) {
        if (isOnline && data.user?.id) emitterEl.textContent = '+' + data.user.id.split(':')[0].replace(/\D/g, '');
        else emitterEl.textContent = 'Desconectado (Sin sesión activa)';
      }
      if (receiverEl) {
        const waNum = localStorage.getItem('tucu_l1_wa_number') || localStorage.getItem('tucu_wa_number') || '5493815551234';
        receiverEl.textContent = '+' + waNum.replace(/\D/g, '');
      }
      return { online: isOnline, status: data.status || 'CLOSE' };
    } catch (e) {
      if (badge) { badge.textContent = '○ Desconectado (Offline)'; badge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-500 border border-zinc-700'; }
      if (emitterEl) emitterEl.textContent = 'Desconectado (Error de red)';
      return { online: false, status: 'CLOSE' };
    }
  }

  function openQrModal() {
    const modal = document.getElementById('waQrModal'), frame = document.getElementById('waQrFrame');
    fetch('/api/wa/init', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ silent: true }) }).catch(() => {});
    if (frame) frame.src = '/api/wa/qr?t=' + Date.now();
    if (modal) modal.classList.remove('hidden');
  }
  function closeQrModal() {
    const modal = document.getElementById('waQrModal'); if (modal) modal.classList.add('hidden');
    checkBaileysStatus();
  }

  async function disconnectBaileys() {
    try { await fetch('/api/wa/logout', { method: 'POST' }); } catch (e) {}
    checkBaileysStatus();
  }

  function init() {
    loadStorage(); renderSchedule(); renderVacationsList(); checkBaileysStatus();
    setInterval(checkBaileysStatus, 10000);
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else setTimeout(init, 50);
  }

  global.adminL1Baileys = {
    toggleDay: (d, en) => { schedule[d].enabled = en; saveSchedule(); renderSchedule(); },
    toggleSplit: (d) => { schedule[d].isSplit = !schedule[d].isSplit; saveSchedule(); renderSchedule(); },
    updateHour: (d, f, v) => { schedule[d][f] = v; saveSchedule(); },
    cloneLunVie: () => { const ref = schedule[1]; [2,3,4,5].forEach(d => schedule[d] = JSON.parse(JSON.stringify(ref))); saveSchedule(); renderSchedule(); },
    addVacation, deleteVacation: (i) => { vacations.splice(i, 1); saveVacations(); renderVacationsList(); },
    checkBaileysStatus, openQrModal, closeQrModal, disconnectBaileys
  };
})(typeof window !== 'undefined' ? window : global);
