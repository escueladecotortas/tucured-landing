// Archivo: public/js/admin_shared/admin_demo_seed.js
// Mini-Base Multi-Rubro Local-First homologada con nombres demo definitivos (< 165L)

window.AdminDemoSeed = (function () {
  const isoDay = (offset = 0) => {
    if (window.AdminShell?.localTodayStr) return window.AdminShell.localTodayStr(offset);
    const d = new Date(Date.now() + offset * 86400000);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const eng = () => window.AdminBookingEngine;

  const RUBROS_SEED = {
    peluqueria: {
      id: 'peluqueria', l3: 'barberia', slug: 'demo-peluqueria', initials: 'BB',
      bizName: 'Brava Barbería', subtitle: 'Cortes Clásicos, Fades y Cuidado de Barba', address: '25 de Mayo 480, S. M. de Tucumán',
      services: [
        { name: 'Corte Clásico', price: 8000, dur: 30, desc: 'Corte tradicional a tijera y terminación prolija.' },
        { name: 'Corte Degradé / Fade', price: 10000, dur: 45, desc: 'Degradado preciso con terminación a navaja.' },
        { name: 'Barba Toalla Caliente', price: 6000, dur: 30, desc: 'Perfilado de barba con vapor y aceites esenciales.' }
      ]
    },
    estetica: {
      id: 'estetica', l3: 'peluqueria_estetica', slug: 'demo-estetica', initials: 'SE',
      bizName: 'Siena Estética', subtitle: 'Cuidado Facial, Corporal y Mirada', address: 'Av. Aconquija 1320, Yerba Buena',
      services: [
        { name: 'Limpieza Facial Profunda', price: 18000, dur: 60, desc: 'Higiene facial, exfoliación e hidratación.' },
        { name: 'Esculpido de Cejas & Pestañas', price: 14000, dur: 45, desc: 'Diseño de cejas, laminado y lifting.' },
        { name: 'Masaje Descontracturante', price: 20000, dur: 50, desc: 'Sesión terapéutica para liberar tensión.' }
      ]
    },
    gastronomia: {
      id: 'gastronomia', l3: 'gastronomia', slug: 'demo-gastronomia', initials: 'BC',
      bizName: 'Brama Café & Bistró', subtitle: 'Reservas de Mesas, Salón y Experiencias', address: 'Crisóstomo Álvarez 615, S. M. de Tucumán',
      services: [
        { name: 'Reserva Mesa 2 Personas', price: 10000, dur: 90, desc: 'Mesa reservada en sector salón o galería.' },
        { name: 'Mesa Salón Principal (4 pers.)', price: 16000, dur: 120, desc: 'Ubicación preferencial para almuerzo o cena.' },
        { name: 'Degustación Nocturna', price: 28000, dur: 120, desc: 'Menú de pasos con maridaje sugerido.' }
      ]
    },
    salud: {
      id: 'salud', l3: 'salud_consultorio', slug: 'demo-salud', initials: 'AC',
      bizName: 'Alba Centro Médico', subtitle: 'Atención Médica, Odontología y Rehabilitación', address: 'San Martín 845, S. M. de Tucumán',
      services: [
        { name: 'Consulta Clínica General', price: 20000, dur: 30, desc: 'Evaluación integral y seguimiento clínico.' },
        { name: 'Control Odontológico', price: 18000, dur: 30, desc: 'Diagnóstico bucal y limpieza preventiva.' },
        { name: 'Sesión Kinesiología', price: 16000, dur: 45, desc: 'Rehabilitación física personalizada.' }
      ]
    },
    servicios: {
      id: 'servicios', l3: 'servicios', slug: 'demo-servicios', initials: 'VE',
      bizName: 'Vértice Estudio', subtitle: 'Asesoría Legal, Impositiva y Auditoría', address: 'Laprida 310, S. M. de Tucumán',
      services: [
        { name: 'Asesoría Inicial 45 min', price: 22000, dur: 45, desc: 'Diagnóstico profesional y plan de acción.' },
        { name: 'Gestión Impositiva Mensual', price: 26000, dur: 60, desc: 'Revisión fiscal, vencimientos y balances.' },
        { name: 'Auditoría Documental', price: 30000, dur: 60, desc: 'Control técnico de contratos y legajos.' }
      ]
    },
    deportes: {
      id: 'deportes', l3: 'deportes_clubes', slug: 'demo-deportes', initials: 'NP',
      bizName: 'Norte Pádel Club', subtitle: 'Canchas cristal, fútbol sintético y clases grupales', address: 'Av. Perón 1850, Yerba Buena',
      services: [
        { name: 'Alquiler Cancha Pádel Cristal', price: 24000, dur: 90, desc: 'Turno reglamentario con iluminación LED incluida.' },
        { name: 'Cancha Fútbol 5 Sintético', price: 32000, dur: 60, desc: 'Césped profesional con vestuarios y pecheras.' },
        { name: 'Clase Grupal Funcional', price: 14000, dur: 60, desc: 'Sesión guiada de preparación física deportiva.' }
      ]
    }
  };

  function resolveRubro(raw) {
    const s = String(raw || '').toLowerCase().trim();
    if (s.includes('deport') || s.includes('club')) return 'deportes';
    if (s.includes('estetica') || s === 'peluqueria_estetica') return 'estetica';
    if (s.includes('gastro') || s.includes('resto')) return 'gastronomia';
    if (s.includes('salud')) return 'salud';
    if (s.includes('servicio') || s.includes('estudio')) return 'servicios';
    if (s.includes('peluq') || s.includes('barber')) return 'peluqueria';
    return 'peluqueria';
  }

  function getRubroMeta(raw) { return RUBROS_SEED[resolveRubro(raw)] || RUBROS_SEED.peluqueria; }

  function makeDep(price, cfg, paid) {
    const amount = eng() ? eng().calcDeposit(price, cfg) : Math.round(price * 0.5);
    return { price, depositAmount: amount, depositPaid: !!paid };
  }

  function getServicesSeed(raw, level = 'l1') {
    const meta = getRubroMeta(raw), c = eng() ? eng().getConfig(level) : null;
    return meta.services.map((s, idx) => ({
      id: `srv-${meta.id}-${idx + 1}`, order: idx + 1, name: s.name,
      priceNumeric: s.price, price: s.price, durationMinutes: s.dur, duration: s.dur,
      description: s.desc, depositAmount: eng() ? eng().calcDeposit(s.price, c, true) : Math.round(s.price * 0.5),
      isActive: true, requireDeposit: true, priceHistory: []
    }));
  }

  function getL1Seed(cfg, rawRubro) {
    const today = isoDay(0), tom = isoDay(1), yest = isoDay(-1), meta = getRubroMeta(rawRubro || localStorage.getItem('tucu_l1_rubro') || 'peluqueria'), srvs = meta.services;
    return [
      { id: 'b_1', token: '#TK-8421', rubroId: meta.id, bizName: meta.bizName, address: meta.address, clientName: 'Martín Gómez', clientPhone: '3815112233', service: srvs[1].name, ...makeDep(srvs[1].price, cfg, true), paymentMethod: 'Mercado Pago', paidAt: new Date().toISOString(), day: 'Hoy', time: '15:00', status: 'confirmado', dateStr: today, prevStatus: null },
      { id: 'b_2', token: '#TK-3319', rubroId: meta.id, bizName: meta.bizName, address: meta.address, clientName: 'Sofía Núñez', clientPhone: '3814998877', service: srvs[0].name, ...makeDep(srvs[0].price, cfg, false), paymentMethod: null, paidAt: null, day: 'Hoy', time: '16:30', status: 'pendiente', dateStr: today, prevStatus: null },
      { id: 'b_3', token: '#TK-9012', rubroId: meta.id, bizName: meta.bizName, address: meta.address, clientName: 'Lucía Fernández', clientPhone: '3816223344', service: srvs[2].name, ...makeDep(srvs[2].price, cfg, true), paymentMethod: 'Transferencia / Alias', paidAt: new Date().toISOString(), day: 'Hoy', time: '11:30', status: 'finalizado', dateStr: today, prevStatus: 'confirmado' },
      { id: 'b_4', token: '#TK-5520', rubroId: meta.id, bizName: meta.bizName, address: meta.address, clientName: 'Javier Soto', clientPhone: '3813445566', service: srvs[2].name, ...makeDep(srvs[2].price, cfg, false), paymentMethod: null, paidAt: null, day: 'Hoy', time: '19:00', status: 'cancelado', dateStr: today, prevStatus: 'pendiente' },
      { id: 'b_5', token: '#TK-7741', rubroId: meta.id, bizName: meta.bizName, address: meta.address, clientName: 'Facundo Ruiz', clientPhone: '3815778899', service: srvs[1].name, ...makeDep(srvs[1].price, cfg, true), paymentMethod: 'Efectivo', paidAt: new Date().toISOString(), day: 'Hoy', time: '10:00', status: 'ausente', dateStr: today, prevStatus: 'confirmado' },
      { id: 'b_6', token: '#TK-9981', rubroId: meta.id, bizName: meta.bizName, address: meta.address, clientName: 'Valentín Castro', clientPhone: '3814661122', service: srvs[0].name, ...makeDep(srvs[0].price, cfg, false), paymentMethod: null, paidAt: null, day: 'Mañana', time: '17:00', status: 'pendiente', dateStr: tom, prevStatus: null },
      { id: 'b_7', token: '#TK-6102', rubroId: meta.id, bizName: meta.bizName, address: meta.address, clientName: 'Camila Pereyra', clientPhone: '3815229900', service: srvs[0].name, ...makeDep(srvs[0].price, cfg, true), paymentMethod: 'Efectivo', paidAt: new Date().toISOString(), day: 'Ayer', time: '18:00', status: 'finalizado', dateStr: yest, prevStatus: 'confirmado' }
    ];
  }

  function getL2Seed(cfg, rawRubro) {
    const today = isoDay(0), tom = isoDay(1), meta = getRubroMeta(rawRubro || localStorage.getItem('tucu_l2_rubro') || 'estetica'), srvs = meta.services;
    const pax = meta.id === 'gastronomia' ? '2' : '1';
    return [
      { id: 'TK-8492', rubroId: meta.id, bizName: meta.bizName, address: meta.address, client: 'Martín Gómez', phone: '5493815559988', date: today, time: '10:00', pax, service: srvs[0].name, ...makeDep(srvs[0].price, cfg, true), paymentMethod: 'Transferencia / Alias', paidAt: new Date().toISOString(), status: 'CONFIRMED', prevStatus: null, createdAt: new Date().toISOString() },
      { id: 'TK-8493', rubroId: meta.id, bizName: meta.bizName, address: meta.address, client: 'Sofía Navarro', phone: '5493814442211', date: today, time: '11:30', pax, service: srvs[1].name, ...makeDep(srvs[1].price, cfg, false), paymentMethod: null, paidAt: null, status: 'PENDING_DEPOSIT', prevStatus: null, createdAt: new Date().toISOString() },
      { id: 'TK-8494', rubroId: meta.id, bizName: meta.bizName, address: meta.address, client: 'Lucía Fernández', phone: '5493816663344', date: today, time: '15:00', pax, service: srvs[2].name, ...makeDep(srvs[2].price, cfg, true), paymentMethod: 'Mercado Pago', paidAt: new Date().toISOString(), status: 'COMPLETED', prevStatus: 'CONFIRMED', createdAt: new Date().toISOString() },
      { id: 'TK-8495', rubroId: meta.id, bizName: meta.bizName, address: meta.address, client: 'Sofía Núñez', phone: '5493815123456', date: today, time: '17:00', pax, service: srvs[1].name, ...makeDep(srvs[1].price, cfg, true), paymentMethod: 'Efectivo', paidAt: new Date().toISOString(), status: 'NO_SHOW', prevStatus: 'CONFIRMED', createdAt: new Date().toISOString() },
      { id: 'TK-8496', rubroId: meta.id, bizName: meta.bizName, address: meta.address, client: 'Leandro Arturi', phone: '5493815774411', date: today, time: '18:30', pax, service: srvs[0].name, ...makeDep(srvs[0].price, cfg, false), paymentMethod: null, paidAt: null, status: 'CANCELLED', prevStatus: 'PENDING_DEPOSIT', createdAt: new Date().toISOString() },
      { id: 'TK-8497', rubroId: meta.id, bizName: meta.bizName, address: meta.address, client: 'Valentín Paz', phone: '5493814889922', date: tom, time: '10:30', pax, service: srvs[0].name, ...makeDep(srvs[0].price, cfg, false), paymentMethod: null, paidAt: null, status: 'PENDING_DEPOSIT', prevStatus: null, createdAt: new Date().toISOString() }
    ];
  }

  function getL3Seed(cfg, rawRubro) {
    const today = isoDay(0), tom = isoDay(1), meta = getRubroMeta(rawRubro || 'peluqueria'), srvs = meta.services;
    return [
      { id: 'TK-8492', rubroId: meta.l3, bizName: meta.bizName, address: meta.address, staffId: 'st-1', staffName: 'Especialista #1', resourceId: 'res-1', resourceName: 'Box #1', serviceId: 'srv-1', serviceName: srvs[0].name, duration: srvs[0].dur, ...makeDep(srvs[0].price, cfg, true), paymentMethod: 'Mercado Pago', paidAt: new Date().toISOString(), date: today, time: '10:00', client: 'Martín Gómez', phone: '3815551234', status: 'CONFIRMED', prevStatus: null },
      { id: 'TK-8493', rubroId: meta.l3, bizName: meta.bizName, address: meta.address, staffId: 'st-2', staffName: 'Especialista #2', resourceId: 'res-2', resourceName: 'Box #2', serviceId: 'srv-2', serviceName: srvs[1].name, duration: srvs[1].dur, ...makeDep(srvs[1].price, cfg, false), paymentMethod: null, paidAt: null, date: today, time: '11:00', client: 'Sofía Núñez', phone: '3815555678', status: 'PENDING_DEPOSIT', prevStatus: null },
      { id: 'TK-8494', rubroId: meta.l3, bizName: meta.bizName, address: meta.address, staffId: 'st-1', staffName: 'Especialista #1', resourceId: 'res-3', resourceName: 'Box #3', serviceId: 'srv-3', serviceName: srvs[2].name, duration: srvs[2].dur, ...makeDep(srvs[2].price, cfg, true), paymentMethod: 'Transferencia / Alias', paidAt: new Date().toISOString(), date: today, time: '12:00', client: 'Gastón Ibarra', phone: '3815559012', status: 'COMPLETED', prevStatus: 'CONFIRMED' },
      { id: 'TK-8495', rubroId: meta.l3, bizName: meta.bizName, address: meta.address, staffId: 'st-2', staffName: 'Especialista #2', resourceId: 'res-1', resourceName: 'Box #1', serviceId: 'srv-2', serviceName: srvs[1].name, duration: srvs[1].dur, ...makeDep(srvs[1].price, cfg, true), paymentMethod: 'Efectivo', paidAt: new Date().toISOString(), date: today, time: '16:00', client: 'Lucía Fernández', phone: '3815553311', status: 'NO_SHOW', prevStatus: 'CONFIRMED' },
      { id: 'TK-8496', rubroId: meta.l3, bizName: meta.bizName, address: meta.address, staffId: 'st-2', staffName: 'Especialista #2', resourceId: 'res-2', resourceName: 'Box #2', serviceId: 'srv-1', serviceName: srvs[0].name, duration: srvs[0].dur, ...makeDep(srvs[0].price, cfg, false), paymentMethod: null, paidAt: null, date: tom, time: '10:30', client: 'Esteban Morales', phone: '3815557700', status: 'CANCELLED', prevStatus: 'PENDING_DEPOSIT' }
    ];
  }

  function resetLevel(level, slug = 'demo-peluqueria', rawRubro = '') {
    const cfg = eng() ? eng().getConfig(level) : { requireDeposit: true, depositType: 'percentage', depositValue: 50 };
    const r = resolveRubro(rawRubro || slug);
    if (level === 'l1') {
      const seed = getL1Seed(cfg, r);
      localStorage.setItem(`tucu_l1_bookings_${slug}`, JSON.stringify(seed));
      localStorage.setItem(`tucu_l1_bookings_${r}`, JSON.stringify(seed));
      return seed;
    }
    if (level === 'l2') {
      const seed = getL2Seed(cfg, r);
      localStorage.setItem(`tucu_l2_bookings_${r}`, JSON.stringify(seed));
      localStorage.setItem('tucu_l2_bookings', JSON.stringify(seed));
      return seed;
    }
    const seed = getL3Seed(cfg, r);
    localStorage.setItem(`tucu_l3_bookings_${r}`, JSON.stringify(seed));
    localStorage.setItem('tucu_l3_bookings', JSON.stringify(seed));
    return seed;
  }

  return { RUBROS_SEED, isoDay, resolveRubro, getRubroMeta, getServicesSeed, getL1Seed, getL2Seed, getL3Seed, resetLevel };
})();
