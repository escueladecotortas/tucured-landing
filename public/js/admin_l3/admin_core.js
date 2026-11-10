// Archivo: public/js/admin_l3/admin_core.js
/**
 * ⚡ NEXUS ADMIN L3: ORQUESTADOR PRINCIPAL AURA LIGHT (< 175 líneas)
 * - Estado reactivo, switch de rubros, navegación SPA de 7 pestañas
 * - Modelado dual: Staff Humano y Recursos Físicos (Canchas, Consultorios, Sillones)
 * - Motor de telemetría Daemon Cron T-2hs, Local-First Storage y Audio Chime
 */

window.AdminL3Core = (function () {
  const DEFAULT_PRESETS = {
    barberia: {
      id: "barberia", name: "Barbería & Spa", icon: "💈",
      labels: { staffSingular: "Barbero", staffPlural: "Barberos", resourceSingular: "Sillón / Box", resourcePlural: "Sillones & Boxes", serviceSingular: "Servicio", servicePlural: "Servicios" },
      staff: [{ id: "st-1", name: "Mateo Silva", role: "Master Barber", photo: "✂️", phone: "3815111111", email: "mateo@nexus.ar", active: true, serviceIds: ["srv-1", "srv-2"] }, { id: "st-2", name: "Lucas Gómez", role: "Fade & Estilo", photo: "🪒", phone: "3815222222", email: "lucas@nexus.ar", active: true, serviceIds: ["srv-1"] }, { id: "st-3", name: "Juan Bianchi", role: "Color & Spa", photo: "💈", phone: "3815333333", email: "juan@nexus.ar", active: true, serviceIds: ["srv-3"] }],
      resources: [{ id: "res-1", name: "Sillón Principal #1", type: "Sillón", icon: "💺", active: true }, { id: "res-2", name: "Sillón Secundario #2", type: "Sillón", icon: "💺", active: true }, { id: "res-3", name: "Box VIP Lavado & Spa", type: "Box", icon: "🚿", active: true }],
      services: [{ id: "srv-1", name: "Corte Clásico & Fade", duration: 30, price: 12000, resourceType: "Sillón", icon: "✂️" }, { id: "srv-2", name: "Ritual de Barba", duration: 20, price: 9000, resourceType: "Sillón", icon: "🪒" }, { id: "srv-3", name: "Spa Capilar VIP", duration: 45, price: 18000, resourceType: "Box", icon: "💈" }]
    },
    peluqueria_estetica: {
      id: "peluqueria_estetica", name: "Peluquería & Estética", icon: "💇‍♀️",
      labels: { staffSingular: "Estilista", staffPlural: "Estilistas", resourceSingular: "Puesto / Gabinete", resourcePlural: "Puestos & Gabinetes", serviceSingular: "Tratamiento", servicePlural: "Tratamientos" },
      staff: [{ id: "st-1", name: "Valeria Rossi", role: "Estilista Senior", photo: "💇‍♀️", phone: "3815444444", email: "valeria@nexus.ar", active: true, serviceIds: ["srv-1", "srv-2"] }, { id: "st-2", name: "Micaela Flores", role: "Color & Lash", photo: "💅", phone: "3815555555", email: "mica@nexus.ar", active: true, serviceIds: ["srv-2", "srv-3"] }],
      resources: [{ id: "res-1", name: "Estación Peinado A", type: "Sillón", icon: "💺", active: true }, { id: "res-2", name: "Estación Peinado B", type: "Sillón", icon: "💺", active: true }, { id: "res-3", name: "Gabinete Facial & Láser", type: "Gabinete", icon: "✨", active: true }],
      services: [{ id: "srv-1", name: "Corte & Brushing", duration: 45, price: 16000, resourceType: "Sillón", icon: "💇‍♀️" }, { id: "srv-2", name: "Color & Nutrición", duration: 90, price: 28000, resourceType: "Sillón", icon: "🎨" }, { id: "srv-3", name: "Lifting de Pestañas", duration: 60, price: 14000, resourceType: "Gabinete", icon: "✨" }]
    },
    salud_consultorio: {
      id: "salud_consultorio", name: "Consultorio Médico & Salud", icon: "🩺",
      labels: { staffSingular: "Profesional", staffPlural: "Profesionales Médicos", resourceSingular: "Consultorio", resourcePlural: "Consultorios Físicos", serviceSingular: "Consulta", servicePlural: "Consultas & Prácticas" },
      staff: [{ id: "st-1", name: "Dra. Sofía Mendoza", role: "Médica Clínica", photo: "🩺", phone: "3815666666", email: "dra.mendoza@nexus.ar", active: true, serviceIds: ["srv-1"] }, { id: "st-2", name: "Dr. Alejandro Rossi", role: "Traumatólogo", photo: "👨‍⚕️", phone: "3815777777", email: "dr.rossi@nexus.ar", active: true, serviceIds: ["srv-2"] }],
      resources: [{ id: "res-1", name: "Consultorio 101 - Clínica", type: "Consultorio", icon: "🚪", active: true }, { id: "res-2", name: "Consultorio 102 - Traumatología", type: "Consultorio", icon: "🚪", active: true }, { id: "res-3", name: "Sala de Yesos & Curaciones", type: "Sala", icon: "🏥", active: true }],
      services: [{ id: "srv-1", name: "Consulta Clínica General", duration: 20, price: 22000, resourceType: "Consultorio", icon: "🩺" }, { id: "srv-2", name: "Consulta Traumatología", duration: 30, price: 25000, resourceType: "Consultorio", icon: "🦴" }]
    },
    deportes_clubes: {
      id: "deportes_clubes", name: "Club Deportivo & Canchas", icon: "🎾",
      labels: { staffSingular: "Profesor / Árbitro", staffPlural: "Staff Deportivo", resourceSingular: "Cancha", resourcePlural: "Canchas & Espacios", serviceSingular: "Turno / Clase", servicePlural: "Turnos de Cancha" },
      staff: [{ id: "st-1", name: "Prof. Carlos Vega", role: "Instructor Pádel", photo: "🎾", phone: "3815888888", email: "vega@nexus.ar", active: true, serviceIds: ["srv-2"] }, { id: "st-2", name: "Prof. Ignacio Ruiz", role: "Coordinador Turnos", photo: "⚽", phone: "3815999999", email: "ruiz@nexus.ar", active: true, serviceIds: ["srv-1", "srv-3"] }],
      resources: [{ id: "res-1", name: "Cancha Pádel Vidrio #1", type: "Cancha", icon: "🎾", active: true }, { id: "res-2", name: "Cancha Pádel Césped #2", type: "Cancha", icon: "🎾", active: true }, { id: "res-3", name: "Cancha Fútbol 5 Sintético", type: "Cancha", icon: "⚽", active: true }],
      services: [{ id: "srv-1", name: "Alquiler Cancha Pádel 90m", duration: 90, price: 24000, resourceType: "Cancha", icon: "🎾" }, { id: "srv-2", name: "Clase Particular Pádel 60m", duration: 60, price: 18000, resourceType: "Cancha", icon: "🎾" }, { id: "srv-3", name: "Alquiler Fútbol 5 (60m)", duration: 60, price: 32000, resourceType: "Cancha", icon: "⚽" }]
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const state = {
    rubro: 'barberia', activeTab: 'agenda', selectedDate: todayStr, agendaViewTarget: 'staff',
    presets: DEFAULT_PRESETS, staff: [], resources: [], services: [], bookings: [],
    telemetry: { daemonStatus: 'ACTIVE', lastSweep: 'Hace 4 minutos', inspected: 18, confirmed: 16, released: 2, logs: [] }
  };

  const getStorage = (k, f) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch (_) { return f; } };
  const setStorage = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} };

  function playDingSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(650, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.08);
    } catch (_) {}
  }

  function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast-notification'), msgEl = document.getElementById('toast-message'), iconEl = document.getElementById('toast-icon');
    if (!toast) return;
    if (msgEl) msgEl.textContent = msg;
    if (iconEl) iconEl.textContent = type === 'success' ? '✓' : '⚡';
    toast.className = `fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl text-xs font-semibold transition-all duration-300 pointer-events-auto ${type === 'success' ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400' : 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-200 dark:border-indigo-800 text-indigo-700'}`;
    setTimeout(() => { toast.className = 'fixed bottom-6 right-6 z-50 transform translate-y-24 opacity-0 transition-all duration-300 pointer-events-none flex items-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800'; }, 3000);
  }

  function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    try { localStorage.setItem('tucu_theme', isDark ? 'dark' : 'light'); } catch (_) {}
    updateThemeIcons(isDark);
  }

  function updateThemeIcons(isDark) {
    const sun = document.getElementById('icon-theme-sun'), moon = document.getElementById('icon-theme-moon');
    if (sun) sun.classList.toggle('hidden', !isDark);
    if (moon) moon.classList.toggle('hidden', isDark);
  }

  function initTheme() {
    const saved = localStorage.getItem('tucu_theme') || 'light';
    const isDark = saved === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    updateThemeIcons(isDark);
  }

  function syncRubroData() {
    const p = state.presets[state.rubro] || DEFAULT_PRESETS.barberia;
    state.staff = getStorage(`tucu_l3_staff_${state.rubro}`, p.staff || []);
    state.resources = getStorage(`tucu_l3_resources_${state.rubro}`, p.resources || []);
    state.services = getStorage(`tucu_l3_services_${state.rubro}`, p.services || []);
    state.bookings = getStorage('tucu_l3_bookings', [
      { id: 'TK-8492', rubroId: 'barberia', staffId: 'st-1', staffName: 'Mateo Silva', resourceId: 'res-1', resourceName: 'Sillón Principal #1', serviceId: 'srv-1', serviceName: 'Corte Clásico & Fade', duration: 30, price: 12000, date: todayStr, time: '10:00', client: 'Lucas Domínguez', phone: '3815551234', status: 'CONFIRMED' },
      { id: 'TK-8493', rubroId: 'barberia', staffId: 'st-2', staffName: 'Lucas Gómez', resourceId: 'res-2', resourceName: 'Sillón Secundario #2', serviceId: 'srv-2', serviceName: 'Ritual de Barba', duration: 20, price: 9000, date: todayStr, time: '11:00', client: 'Esteban Morales', phone: '3815555678', status: 'CONFIRMED' },
      { id: 'TK-8494', rubroId: 'barberia', staffId: 'st-1', staffName: 'Mateo Silva', resourceId: 'res-3', resourceName: 'Box VIP Lavado & Spa', serviceId: 'srv-3', serviceName: 'Spa Capilar VIP', duration: 45, price: 18000, date: todayStr, time: '12:00', client: 'Gastón Ibarra', phone: '3815559012', status: 'RELEASED' }
    ]);
    state.telemetry = getStorage('tucu_l3_telemetry', state.telemetry);
    setStorage(`tucu_l3_staff_${state.rubro}`, state.staff); setStorage(`tucu_l3_resources_${state.rubro}`, state.resources);
    setStorage(`tucu_l3_services_${state.rubro}`, state.services); setStorage('tucu_l3_bookings', state.bookings);
    const ind = document.getElementById('rubro-indicator'); if (ind) ind.innerText = `${p.icon} ${p.name}`;
    const sLbl = document.getElementById('tab-staff-label'); if (sLbl) sLbl.innerText = `${p.labels?.staffPlural || 'Personal Humano'}`;
    const rLbl = document.getElementById('tab-resources-label'); if (rLbl) rLbl.innerText = `${p.labels?.resourcePlural || 'Recursos Físicos'}`;
    const svLbl = document.getElementById('tab-services-label'); if (svLbl) svLbl.innerText = `${p.labels?.servicePlural || 'Servicios'}`;
  }

  function renderActiveView() {
    const root = document.getElementById('admin-view-root');
    if (!root) return;
    const views = { agenda: window.AdminL3Agenda, staff: window.AdminL3Staff, resources: window.AdminL3Resources, services: window.AdminL3Services, clients: window.AdminL3Clients, telemetry: window.AdminL3Telemetry, system: window.AdminL3System };
    views[state.activeTab]?.render(root, state);
  }

  function switchRubro(newRubro) {
    state.rubro = newRubro;
    document.querySelectorAll('.rubro-tab').forEach(b => {
      const isCur = b.dataset.rubro === newRubro;
      b.className = isCur
        ? 'rubro-tab px-3 py-1.5 rounded-xl font-bold transition-all bg-indigo-600 text-white shadow-xs flex items-center gap-1.5'
        : 'rubro-tab px-3 py-1.5 rounded-xl font-semibold transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1.5';
    });
    syncRubroData();
    renderActiveView();
  }

  function switchTab(newTab) {
    state.activeTab = newTab;
    document.querySelectorAll('.nav-tab').forEach(b => {
      const isCur = b.dataset.tab === newTab;
      b.className = isCur
        ? 'nav-tab py-3 px-3 text-xs sm:text-sm font-bold border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer'
        : 'nav-tab py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer';
    });
    renderActiveView();
  }

  function executeCronSweep() {
    playDingSound();
    state.telemetry.lastSweep = 'Recién ejecutado';
    state.telemetry.inspected += 3;
    state.telemetry.confirmed += 2;
    state.telemetry.released += 1;
    state.telemetry.logs.unshift({ time: new Date().toLocaleTimeString(), inspected: 3, confirmed: 2, released: 1, hash: '#CRON-' + Math.random().toString(36).substring(2, 7).toUpperCase() });
    setStorage('tucu_l3_telemetry', state.telemetry);
    showToast('⚡ Barrido Cron T-2hs completado con éxito (Slots auditados e idempotentes)', 'telemetry');
    renderActiveView();
  }

  async function init() {
    initTheme();
    const datePicker = document.getElementById('admin-date-picker');
    if (datePicker) {
      datePicker.value = state.selectedDate;
      datePicker.addEventListener('change', (e) => { state.selectedDate = e.target.value; renderActiveView(); });
    }
    document.querySelectorAll('.rubro-tab').forEach(b => b.addEventListener('click', (e) => switchRubro(e.currentTarget.dataset.rubro)));
    document.querySelectorAll('.nav-tab').forEach(b => b.addEventListener('click', (e) => switchTab(e.currentTarget.dataset.tab)));
    syncRubroData();
    renderActiveView();
  }

  document.addEventListener('DOMContentLoaded', init);
  return { state, switchRubro, switchTab, syncRubroData, renderActiveView, toggleTheme, showToast, playDingSound, getStorage, setStorage, executeCronSweep };
})();
