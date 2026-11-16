// Archivo: public/js/admin_l3/admin_core.js
// Orquestador Principal L3 Warm Studio v2 (< 160 líneas)

window.AdminL3Core = (function () {
  const ICONS = {
    bolt: '<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',
    plus: '<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>',
    users: '<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
    space: '<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"/></svg>',
    clock: '<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke-width="2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 7v5l3 2"/></svg>',
    tel: '<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>',
    edit: '<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>',
    trash: '<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>',
    close: '<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>',
    cal: '<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>',
    tag: '<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>',
    lock: '<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>',
    check: '<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>',
    list: '<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>',
    grid: '<svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/></svg>'
  };

  const RUBRO_ALIASES = { peluqueria: 'barberia', barberia: 'barberia', estetica: 'peluqueria_estetica', peluqueria_estetica: 'peluqueria_estetica', salud: 'salud_consultorio', salud_consultorio: 'salud_consultorio', deportes: 'deportes_clubes', deportes_clubes: 'deportes_clubes', resto: 'gastronomia', gastronomia: 'gastronomia', servicios: 'servicios' };
  const DEFAULT_PRESETS = {
    barberia: {
      id: "barberia", name: "Peluquería & Barbería Central", code: "PB",
      labels: { staffSingular: "Barbero", staffPlural: "Barberos", resourceSingular: "Sillón / Box", resourcePlural: "Sillones & Boxes", serviceSingular: "Servicio", servicePlural: "Servicios" },
      staff: [{ id: "st-1", name: "Mateo Silva", role: "Master Barber", photo: "MS", phone: "3815111111", email: "mateo@nexus.ar", active: true, serviceIds: ["srv-1", "srv-2"] }, { id: "st-2", name: "Lucas Gómez", role: "Fade & Estilo", photo: "LG", phone: "3815222222", email: "lucas@nexus.ar", active: true, serviceIds: ["srv-1"] }, { id: "st-3", name: "Juan Bianchi", role: "Color & Spa", photo: "JB", phone: "3815333333", email: "juan@nexus.ar", active: true, serviceIds: ["srv-3"] }],
      resources: [{ id: "res-1", name: "Sillón Principal #1", type: "Sillón", icon: "S1", active: true }, { id: "res-2", name: "Sillón Secundario #2", type: "Sillón", icon: "S2", active: true }, { id: "res-3", name: "Box VIP Lavado & Spa", type: "Box", icon: "BX", active: true }],
      services: [{ id: "srv-1", name: "Corte Clásico", duration: 30, price: 8000, resourceType: "Sillón", icon: "CC" }, { id: "srv-2", name: "Corte Degradé / Fade", duration: 45, price: 10000, resourceType: "Sillón", icon: "CF" }, { id: "srv-3", name: "Barba Toalla Caliente", duration: 30, price: 6000, resourceType: "Box", icon: "BT" }]
    },
    peluqueria_estetica: {
      id: "peluqueria_estetica", name: "Aura Estética & Spa", code: "AE",
      labels: { staffSingular: "Especialista", staffPlural: "Especialistas", resourceSingular: "Gabinete / Box", resourcePlural: "Gabinetes & Boxes", serviceSingular: "Tratamiento", servicePlural: "Tratamientos" },
      staff: [{ id: "st-1", name: "Valeria Rossi", role: "Cosmiatra Senior", photo: "VR", phone: "3815444444", email: "valeria@nexus.ar", active: true, serviceIds: ["srv-1", "srv-2"] }, { id: "st-2", name: "Micaela Flores", role: "Cejas & Masajes", photo: "MF", phone: "3815555555", email: "mica@nexus.ar", active: true, serviceIds: ["srv-2", "srv-3"] }],
      resources: [{ id: "res-1", name: "Gabinete Facial A", type: "Gabinete", icon: "GA", active: true }, { id: "res-2", name: "Gabinete Corporal B", type: "Gabinete", icon: "GB", active: true }, { id: "res-3", name: "Box Mirada & Spa", type: "Box", icon: "BM", active: true }],
      services: [{ id: "srv-1", name: "Limpieza Facial Profunda", duration: 60, price: 18000, resourceType: "Gabinete", icon: "LF" }, { id: "srv-2", name: "Esculpido de Cejas & Pestañas", duration: 45, price: 14000, resourceType: "Box", icon: "EC" }, { id: "srv-3", name: "Masaje Descontracturante", duration: 50, price: 20000, resourceType: "Gabinete", icon: "MD" }]
    },
    salud_consultorio: {
      id: "salud_consultorio", name: "Consultorios Médicos San Martín", code: "CM",
      labels: { staffSingular: "Profesional", staffPlural: "Profesionales Médicos", resourceSingular: "Consultorio", resourcePlural: "Consultorios Físicos", serviceSingular: "Consulta", servicePlural: "Consultas & Prácticas" },
      staff: [{ id: "st-1", name: "Dra. Sofía Mendoza", role: "Médica Clínica", photo: "SM", phone: "3815666666", email: "dra.mendoza@nexus.ar", active: true, serviceIds: ["srv-1"] }, { id: "st-2", name: "Dr. Alejandro Rossi", role: "Odontología & Kine", photo: "AR", phone: "3815777777", email: "dr.rossi@nexus.ar", active: true, serviceIds: ["srv-2", "srv-3"] }],
      resources: [{ id: "res-1", name: "Consultorio 101 - Clínica", type: "Consultorio", icon: "C1", active: true }, { id: "res-2", name: "Consultorio 102 - Odontología", type: "Consultorio", icon: "C2", active: true }, { id: "res-3", name: "Box Kinesiología", type: "Box", icon: "BK", active: true }],
      services: [{ id: "srv-1", name: "Consulta Clínica General", duration: 30, price: 20000, resourceType: "Consultorio", icon: "CG" }, { id: "srv-2", name: "Control Odontológico", duration: 30, price: 18000, resourceType: "Consultorio", icon: "CO" }, { id: "srv-3", name: "Sesión Kinesiología", duration: 45, price: 16000, resourceType: "Box", icon: "SK" }]
    },
    deportes_clubes: {
      id: "deportes_clubes", name: "Complejo Deportivo & Pádel Norte", code: "CD",
      labels: { staffSingular: "Profesor / Cancha", staffPlural: "Staff & Canchas", resourceSingular: "Cancha", resourcePlural: "Canchas & Espacios", serviceSingular: "Turno / Clase", servicePlural: "Turnos & Clases" },
      staff: [{ id: "st-1", name: "Prof. Carlos Vega", role: "Instructor Pádel", photo: "CV", phone: "3815888888", email: "vega@nexus.ar", active: true, serviceIds: ["srv-1", "srv-3"] }, { id: "st-2", name: "Prof. Ignacio Ruiz", role: "Coordinador Turnos", photo: "IR", phone: "3815999999", email: "ruiz@nexus.ar", active: true, serviceIds: ["srv-1", "srv-2"] }],
      resources: [{ id: "res-1", name: "Cancha Pádel Cristal #1", type: "Cancha", icon: "P1", active: true }, { id: "res-2", name: "Cancha Fútbol 5 Sintético", type: "Cancha", icon: "F5", active: true }, { id: "res-3", name: "Salón Funcional #3", type: "Salón", icon: "SF", active: true }],
      services: [{ id: "srv-1", name: "Alquiler Cancha Pádel Cristal", duration: 90, price: 24000, resourceType: "Cancha", icon: "PC" }, { id: "srv-2", name: "Cancha Fútbol 5 Sintético", duration: 60, price: 32000, resourceType: "Cancha", icon: "F5" }, { id: "srv-3", name: "Clase Grupal Funcional", duration: 60, price: 14000, resourceType: "Salón", icon: "CF" }]
    },
    gastronomia: {
      id: "gastronomia", name: "Bistró & Parrilla El Encuentro", code: "BE",
      labels: { staffSingular: "Anfitrión", staffPlural: "Equipo de Salón", resourceSingular: "Mesa / Sector", resourcePlural: "Mesas & Sectores", serviceSingular: "Experiencia", servicePlural: "Mesas & Menús" },
      staff: [{ id: "st-1", name: "Julián Pereyra", role: "Maître Salón", photo: "JP", phone: "3815123123", email: "salon@nexus.ar", active: true }, { id: "st-2", name: "Camila Soraire", role: "Anfitriona Galería", photo: "CS", phone: "3815321321", email: "galeria@nexus.ar", active: true }],
      resources: [{ id: "res-1", name: "Mesa Salón #1", type: "Salón", icon: "M1", active: true }, { id: "res-2", name: "Galería Norte #2", type: "Galería", icon: "M2", active: true }, { id: "res-3", name: "Mesa VIP Cava #3", type: "VIP", icon: "M3", active: true }],
      services: [{ id: "srv-1", name: "Reserva Mesa 2 Personas", duration: 90, price: 10000, resourceType: "Salón", icon: "M2" }, { id: "srv-2", name: "Mesa Salón Principal (4 pers.)", duration: 120, price: 16000, resourceType: "Salón", icon: "M4" }, { id: "srv-3", name: "Degustación Nocturna", duration: 120, price: 28000, resourceType: "VIP", icon: "DN" }]
    },
    servicios: {
      id: "servicios", name: "Estudio Jurídico & Contable Norte", code: "EN",
      labels: { staffSingular: "Consultor", staffPlural: "Profesionales", resourceSingular: "Sala / Oficina", resourcePlural: "Salas & Oficinas", serviceSingular: "Servicio", servicePlural: "Servicios" },
      staff: [{ id: "st-1", name: "Cr. Mariano Luján", role: "Impositivo Senior", photo: "ML", phone: "3815789789", email: "estudio@nexus.ar", active: true }, { id: "st-2", name: "Dra. Paula Paz", role: "Derecho Corporativo", photo: "PP", phone: "3815987987", email: "legal@nexus.ar", active: true }],
      resources: [{ id: "res-1", name: "Oficina Central #1", type: "Oficina", icon: "O1", active: true }, { id: "res-2", name: "Sala Reuniones #2", type: "Sala", icon: "O2", active: true }, { id: "res-3", name: "Box Virtual / Meet", type: "Box", icon: "BV", active: true }],
      services: [{ id: "srv-1", name: "Asesoría Inicial 45 min", duration: 45, price: 22000, resourceType: "Oficina", icon: "AI" }, { id: "srv-2", name: "Gestión Impositiva Mensual", duration: 60, price: 26000, resourceType: "Sala", icon: "GI" }, { id: "srv-3", name: "Auditoría Documental", duration: 60, price: 30000, resourceType: "Sala", icon: "AD" }]
    }
  };

  const todayStr = (window.AdminShell ? window.AdminShell.localTodayStr() : new Date().toISOString().split('T')[0]);
  const state = {
    rubro: 'barberia', activeTab: 'agenda', selectedDate: todayStr, dateRangeEnabled: false, dateFrom: todayStr, dateTo: todayStr, agendaViewTarget: 'staff',
    presets: DEFAULT_PRESETS, staff: [], resources: [], services: [], bookings: [],
    telemetry: { daemonStatus: 'ACTIVE', lastSweep: 'Hace 4 minutos', inspected: 18, confirmed: 16, released: 2, logs: [] }
  };

  const normStr = (s) => (window.AdminShell ? window.AdminShell.normStr(s) : String(s || '').toLowerCase());
  const svg = (k) => ICONS[k] || '';
  const getStorage = (k, f) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch (_) { return f; } };
  const setStorage = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} };

  function playDingSound() { try { const ctx = new (window.AudioContext || window.webkitAudioContext)(), osc = ctx.createOscillator(), g = ctx.createGain(); osc.type = 'sine'; osc.frequency.setValueAtTime(650, ctx.currentTime); g.gain.setValueAtTime(0.2, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08); osc.connect(g); g.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.08); } catch (_) {} }

  function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast-notification'), msgEl = document.getElementById('toast-message'), iconEl = document.getElementById('toast-icon');
    if (!toast) return;
    if (msgEl) msgEl.textContent = msg;
    if (iconEl) iconEl.innerHTML = type === 'success' ? ICONS.check : ICONS.bolt;
    toast.className = `fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl text-xs font-semibold transition-all duration-300 pointer-events-auto bg-white dark:bg-stone-900 border-[#D5CEC2] dark:border-stone-800 text-red-900 dark:text-red-400`;
    setTimeout(() => { toast.className = 'fixed bottom-6 right-6 z-50 transform translate-y-24 opacity-0 transition-all duration-300 pointer-events-none flex items-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-stone-900 border border-[#D5CEC2] dark:border-stone-800 text-xs font-medium text-stone-800'; }, 3000);
  }

  function toggleTheme() { if (window.AdminShell?.toggleTheme) return window.AdminShell.toggleTheme(); const d = document.documentElement.classList.toggle('dark'); try { localStorage.setItem('tucu_theme', d ? 'dark' : 'light'); } catch (_) {} updateThemeIcons(d); }
  function updateThemeIcons(isDark) { document.getElementById('icon-theme-sun')?.classList.toggle('hidden', !isDark); document.getElementById('icon-theme-moon')?.classList.toggle('hidden', isDark); }
  function initTheme() { const d = (localStorage.getItem('tucu_theme') || 'light') === 'dark'; document.documentElement.classList.toggle('dark', d); updateThemeIcons(d); }

  function syncRubroData() {
    const p = state.presets[state.rubro] || DEFAULT_PRESETS.barberia;
    state.staff = getStorage(`tucu_l3_staff_${state.rubro}`, p.staff || []);
    state.resources = getStorage(`tucu_l3_resources_${state.rubro}`, p.resources || []);
    state.services = getStorage(`tucu_l3_services_${state.rubro}`, p.services || []);
    const eng = window.AdminBookingEngine, seed = window.AdminDemoSeed;
    const rawBks = getStorage('tucu_l3_bookings', []), partBks = getStorage(`tucu_l3_bookings_${state.rubro}`, []);
    let list = [...(Array.isArray(partBks) ? partBks : []), ...(Array.isArray(rawBks) ? rawBks : [])].filter((b, i, a) => b && a.findIndex(x => x.id === b.id) === i);
    if (!list.some(b => b.rubroId === state.rubro) && seed) list = [...list, ...seed.getL3Seed(eng?.getConfig('l3'), state.rubro)];
    state.bookings = eng ? list.map(b => eng.hydrateBooking(b, 'l3', b.price || 12000)) : list;
    state.telemetry = getStorage('tucu_l3_telemetry', state.telemetry);
    setStorage(`tucu_l3_staff_${state.rubro}`, state.staff); setStorage(`tucu_l3_resources_${state.rubro}`, state.resources);
    setStorage(`tucu_l3_services_${state.rubro}`, state.services); setStorage('tucu_l3_bookings', state.bookings);
    setStorage(`tucu_l3_bookings_${state.rubro}`, state.bookings.filter(b => b.rubroId === state.rubro));
    const setT = (id, v) => { const el = document.getElementById(id); if (el) el.innerText = v; };
    setT('rubro-indicator', p.name); setT('l3-brand-title', p.name); setT('l3-brand-initials', p.code || 'T3');
    setT('tab-staff-label', p.labels?.staffPlural || 'Personal Humano');
    setT('tab-resources-label', p.labels?.resourcePlural || 'Recursos Físicos');
    setT('tab-services-label', p.labels?.servicePlural || 'Servicios');
  }

  function resetDemoBookings() {
    const others = (state.bookings || []).filter(b => b.rubroId && b.rubroId !== state.rubro);
    const fresh = window.AdminDemoSeed ? window.AdminDemoSeed.getL3Seed(window.AdminBookingEngine?.getConfig('l3'), state.rubro) : [];
    state.bookings = [...others, ...fresh]; setStorage('tucu_l3_bookings', state.bookings);
    showToast('Base de práctica L3 restaurada'); renderActiveView();
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
      b.className = isCur ? 'rubro-tab admin-glass-pill is-active px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5' : 'rubro-tab admin-glass-pill px-2.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5';
    });
    syncRubroData(); renderActiveView();
  }

  function switchTab(newTab) {
    state.activeTab = newTab;
    document.querySelectorAll('.nav-tab').forEach(b => { b.className = b.dataset.tab === newTab ? 'nav-tab admin-nav-item active' : 'nav-tab admin-nav-item'; });
    renderActiveView();
  }

  function executeCronSweep() {
    playDingSound();
    state.telemetry.lastSweep = 'Recién ejecutado'; state.telemetry.inspected += 3; state.telemetry.confirmed += 2; state.telemetry.released += 1;
    state.telemetry.logs.unshift({ time: new Date().toLocaleTimeString(), inspected: 3, confirmed: 2, released: 1, hash: '#CRON-' + Math.random().toString(36).substring(2, 7).toUpperCase() });
    setStorage('tucu_l3_telemetry', state.telemetry);
    showToast('Barrido Cron T-2hs completado con éxito', 'telemetry');
    renderActiveView();
  }

  async function init() {
    initTheme();
    const qParams = new URLSearchParams(window.location.search);
    const qRubro = qParams.get('rubro'), qDate = qParams.get('date');
    const mappedRubro = RUBRO_ALIASES[String(qRubro || '').toLowerCase()] || qRubro;
    if (mappedRubro && DEFAULT_PRESETS[mappedRubro]) state.rubro = mappedRubro;
    if (qDate && /^\d{4}-\d{2}-\d{2}$/.test(qDate)) state.selectedDate = qDate;
    const datePicker = document.getElementById('admin-date-picker');
    if (datePicker) {
      datePicker.value = state.selectedDate;
      datePicker.addEventListener('change', (e) => { state.selectedDate = e.target.value; state.dateRangeEnabled = false; renderActiveView(); });
    }
    document.querySelectorAll('.rubro-tab').forEach(b => {
      const isCur = b.dataset.rubro === state.rubro;
      b.className = isCur ? 'rubro-tab admin-glass-pill is-active px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5' : 'rubro-tab admin-glass-pill px-2.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5';
      b.addEventListener('click', (e) => switchRubro(e.currentTarget.dataset.rubro));
    });
    document.querySelectorAll('.nav-tab').forEach(b => b.addEventListener('click', (e) => switchTab(e.currentTarget.dataset.tab)));
    syncRubroData(); renderActiveView();
  }

  document.addEventListener('DOMContentLoaded', init);
  return { state, normStr, svg, switchRubro, switchTab, syncRubroData, resetDemoBookings, renderActiveView, toggleTheme, showToast, playDingSound, getStorage, setStorage, executeCronSweep };
})();