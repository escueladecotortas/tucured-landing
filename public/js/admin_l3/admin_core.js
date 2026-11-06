// Archivo: public/js/admin_l3/admin_core.js
/**
 * ⚡ NEXUS ADMIN L3: ORQUESTADOR PRINCIPAL DEL PANEL OPERATIVO
 * - Gestión reactiva del estado, switch de rubros y navegación por 5 pestañas SPA
 * - Aislamiento de namespaces de persistencia Local-First (tucu_l3_*)
 * - Audio Chime sintético con Web Audio API y sincronización Baileys
 */

window.AdminL3Core = (function () {
  const state = {
    rubro: 'barberia',
    activeTab: 'agenda',
    selectedDate: new Date().toISOString().split('T')[0],
    presets: {},
    staff: [],
    services: [],
    categories: [],
    bookings: [],
    config: {},
    holidays: [],
    blocks: []
  };

  const DEFAULT_PRESETS = {
    barberia: { id: "barberia", name: "Barbería & Estudio", icon: "💈", labels: { staffSingular: "Barbero", staffPlural: "Barberos", serviceSingular: "Servicio", servicePlural: "Servicios" }, config: { slotIntervalMinutes: 30, requireInsuranceField: false, maxAdvanceDays: 14 }, categories: [{ id: "cat-1", name: "Cortes", icon: "✂️" }, { id: "cat-2", name: "Barba & Afeitado", icon: "🪒" }], staff: [{ id: "st-1", name: "Mateo Silva", role: "Master Barber", photo: "✂️", email: "mateo@nexus.ar", phone: "3815111111", active: true, serviceIds: ["srv-1", "srv-2"], workingHours: { 1: { active: true, start: "09:00", end: "19:00" }, 2: { active: true, start: "09:00", end: "19:00" }, 3: { active: true, start: "09:00", end: "19:00" }, 4: { active: true, start: "09:00", end: "19:00" }, 5: { active: true, start: "09:00", end: "19:00" }, 6: { active: true, start: "09:00", end: "14:00" }, 0: { active: false, start: "09:00", end: "13:00" } } }, { id: "st-2", name: "Lucas Gómez", role: "Fade & Estilo", photo: "🪒", email: "lucas@nexus.ar", phone: "3815222222", active: true, serviceIds: ["srv-1"], workingHours: { 1: { active: true, start: "10:00", end: "20:00" }, 2: { active: true, start: "10:00", end: "20:00" }, 3: { active: true, start: "10:00", end: "20:00" }, 4: { active: true, start: "10:00", end: "20:00" }, 5: { active: true, start: "10:00", end: "20:00" }, 6: { active: true, start: "10:00", end: "16:00" }, 0: { active: false, start: "09:00", end: "13:00" } } }], services: [{ id: "srv-1", name: "Corte Clásico & Fade", category: "Cortes", duration: 30, price: 12000, advanceHours: 2, icon: "✂️", showPrice: true, showDuration: true }, { id: "srv-2", name: "Ritual de Barba", category: "Barba & Afeitado", duration: 20, price: 9000, advanceHours: 1, icon: "🪒", showPrice: true, showDuration: true }] },
    peluqueria_estetica: { id: "peluqueria_estetica", name: "Peluquería & Estética", icon: "💇‍♀️", labels: { staffSingular: "Estilista", staffPlural: "Estilistas", serviceSingular: "Tratamiento", servicePlural: "Tratamientos" }, config: { slotIntervalMinutes: 30, requireInsuranceField: false, maxAdvanceDays: 21 }, categories: [{ id: "cat-1", name: "Peluquería", icon: "💇‍♀️" }, { id: "cat-2", name: "Color & Nutrición", icon: "🎨" }], staff: [{ id: "st-1", name: "Valeria Rossi", role: "Estilista Senior", photo: "💇‍♀️", active: true, serviceIds: ["srv-1"], workingHours: { 1: { active: true, start: "09:00", end: "19:00" }, 2: { active: true, start: "09:00", end: "19:00" }, 3: { active: true, start: "09:00", end: "19:00" }, 4: { active: true, start: "09:00", end: "19:00" }, 5: { active: true, start: "09:00", end: "19:00" }, 6: { active: true, start: "09:00", end: "15:00" }, 0: { active: false, start: "09:00", end: "13:00" } } }], services: [{ id: "srv-1", name: "Corte & Brushing", category: "Peluquería", duration: 45, price: 16000, advanceHours: 2, icon: "💇‍♀️", showPrice: true, showDuration: true }] },
    salud_consultorio: { id: "salud_consultorio", name: "Consultorio Médico & Salud", icon: "🩺", labels: { staffSingular: "Profesional", staffPlural: "Profesionales Médicos", serviceSingular: "Consulta / Estudio", servicePlural: "Consultas & Prácticas" }, config: { slotIntervalMinutes: 20, requireInsuranceField: true, maxAdvanceDays: 30 }, categories: [{ id: "cat-1", name: "Consultas Médicas", icon: "🩺" }, { id: "cat-2", name: "Estudios Clínicos", icon: "🔬" }], staff: [{ id: "st-1", name: "Dra. Sofía Mendoza", role: "Médica Clínica", photo: "🩺", active: true, serviceIds: ["srv-1"], workingHours: { 1: { active: true, start: "08:00", end: "16:00" }, 2: { active: true, start: "08:00", end: "16:00" }, 3: { active: true, start: "08:00", end: "16:00" }, 4: { active: true, start: "08:00", end: "16:00" }, 5: { active: true, start: "08:00", end: "16:00" }, 6: { active: false, start: "08:00", end: "12:00" }, 0: { active: false, start: "08:00", end: "12:00" } } }], services: [{ id: "srv-1", name: "Consulta Clínica General", category: "Consultas Médicas", duration: 20, price: 20000, advanceHours: 4, icon: "🩺", showPrice: true, showDuration: true }] },
    profesional_servicios: { id: "profesional_servicios", name: "Estudio Profesional & Consultoría", icon: "⚖️", labels: { staffSingular: "Consultor", staffPlural: "Consultores", serviceSingular: "Asesoría", servicePlural: "Servicios" }, config: { slotIntervalMinutes: 60, requireInsuranceField: false, maxAdvanceDays: 30 }, categories: [{ id: "cat-1", name: "Asesoría Legal", icon: "⚖️" }, { id: "cat-2", name: "Estrategia", icon: "📊" }], staff: [{ id: "st-1", name: "Lic. Martín Paz", role: "Consultor Senior", photo: "⚖️", active: true, serviceIds: ["srv-1"], workingHours: { 1: { active: true, start: "09:00", end: "18:00" }, 2: { active: true, start: "09:00", end: "18:00" }, 3: { active: true, start: "09:00", end: "18:00" }, 4: { active: true, start: "09:00", end: "18:00" }, 5: { active: true, start: "09:00", end: "18:00" }, 6: { active: false, start: "09:00", end: "13:00" }, 0: { active: false, start: "09:00", end: "13:00" } } }], services: [{ id: "srv-1", name: "Asesoría Inicial", category: "Asesoría Legal", duration: 60, price: 40000, advanceHours: 6, icon: "⚖️", showPrice: true, showDuration: true }] }
  };

  const getStorage = (k, f) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch (e) { return f; } };
  const setStorage = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  function playDingSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {}
  }

  async function loadPresets() {
    try {
      const res = await fetch('/api/stitch/presets');
      const data = await res.json();
      state.presets = (data && data.presets) ? data.presets : DEFAULT_PRESETS;
    } catch (e) {
      state.presets = DEFAULT_PRESETS;
    }
  }

  function syncRubroData() {
    const p = state.presets[state.rubro] || DEFAULT_PRESETS[state.rubro] || DEFAULT_PRESETS.barberia;
    state.staff = getStorage(`tucu_l3_staff_${state.rubro}`, p.staff || []);
    state.services = getStorage(`tucu_l3_services_${state.rubro}`, p.services || []);
    state.categories = getStorage(`tucu_l3_categories_${state.rubro}`, p.categories || []);
    state.config = getStorage(`tucu_l3_config_${state.rubro}`, p.config || {});
    state.bookings = getStorage('tucu_l3_bookings', []);
    state.holidays = getStorage('tucu_l3_holidays', []);
    state.blocks = getStorage(`tucu_l3_blocks_${state.rubro}`, []);

    setStorage(`tucu_l3_staff_${state.rubro}`, state.staff);
    setStorage(`tucu_l3_services_${state.rubro}`, state.services);
    setStorage(`tucu_l3_categories_${state.rubro}`, state.categories);
    setStorage(`tucu_l3_config_${state.rubro}`, state.config);

    const ind = document.getElementById('rubro-indicator');
    if (ind) ind.innerText = `${p.icon} ${p.name}`;
    const sLbl = document.getElementById('tab-staff-label');
    if (sLbl) sLbl.innerText = `${p.labels?.staffPlural || 'Personal'}`;
    const svLbl = document.getElementById('tab-services-label');
    if (svLbl) svLbl.innerText = `${p.labels?.servicePlural || 'Servicios'}`;
  }

  function renderActiveView() {
    const root = document.getElementById('admin-view-root');
    if (!root) return;
    if (state.activeTab === 'agenda') window.AdminL3Agenda?.render(root, state);
    else if (state.activeTab === 'staff') window.AdminL3Staff?.render(root, state);
    else if (state.activeTab === 'services') window.AdminL3Services?.render(root, state);
    else if (state.activeTab === 'clients') window.AdminL3Clients?.render(root, state);
    else if (state.activeTab === 'system') window.AdminL3System?.render(root, state);
  }

  function switchRubro(newRubro) {
    state.rubro = newRubro;
    document.querySelectorAll('.rubro-tab').forEach(b => {
      const isCur = b.dataset.rubro === newRubro;
      b.className = isCur
        ? 'rubro-tab px-2.5 py-1.5 rounded-lg font-semibold transition-all bg-indigo-600 text-white shadow-sm flex items-center gap-1'
        : 'rubro-tab px-2.5 py-1.5 rounded-lg font-semibold transition-all text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 flex items-center gap-1';
    });
    syncRubroData();
    renderActiveView();
  }

  function switchTab(newTab) {
    state.activeTab = newTab;
    document.querySelectorAll('.nav-tab').forEach(b => {
      const isCur = b.dataset.tab === newTab;
      b.className = isCur
        ? 'nav-tab py-3 px-3 text-xs sm:text-sm font-bold border-b-2 border-indigo-500 text-indigo-400 transition-all flex items-center gap-2 flex-shrink-0'
        : 'nav-tab py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 border-transparent text-zinc-400 hover:text-zinc-200 transition-all flex items-center gap-2 flex-shrink-0';
    });
    renderActiveView();
  }

  async function checkBaileysHealth() {
    const badge = document.getElementById('wa-badge');
    if (!badge) return;
    try {
      const res = await fetch('/health');
      const data = await res.json();
      const isOnline = data.status === 'online' && data.baileys?.active;
      badge.innerHTML = isOnline
        ? `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span><span class="font-mono text-[11px]">Baileys: ONLINE</span>`
        : `<span class="w-2 h-2 rounded-full bg-amber-400"></span><span class="font-mono text-[11px]">Baileys: STANDBY</span>`;
    } catch (e) {
      badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-zinc-500"></span><span class="font-mono text-[11px]">Baileys: LOCAL</span>`;
    }
  }

  async function init() {
    await loadPresets();
    const datePicker = document.getElementById('admin-date-picker');
    if (datePicker) {
      datePicker.value = state.selectedDate;
      datePicker.addEventListener('change', (e) => {
        state.selectedDate = e.target.value;
        renderActiveView();
      });
    }
    document.querySelectorAll('.rubro-tab').forEach(b => b.addEventListener('click', (e) => switchRubro(e.currentTarget.dataset.rubro)));
    document.querySelectorAll('.nav-tab').forEach(b => b.addEventListener('click', (e) => switchTab(e.currentTarget.dataset.tab)));
    syncRubroData();
    renderActiveView();
    checkBaileysHealth();
  }

  document.addEventListener('DOMContentLoaded', init);
  return { state, switchRubro, switchTab, syncRubroData, renderActiveView, getStorage, setStorage, playDingSound };
})();
