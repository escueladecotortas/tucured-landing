// Archivo: public/js/admin_shared/admin_demo_seed.js
// Mini-Base de Práctica Local-First para L1, L2 y L3 (< 130 líneas)

window.AdminDemoSeed = (function () {
  const isoDay = (offset = 0) => {
    if (window.AdminShell?.localTodayStr) return window.AdminShell.localTodayStr(offset);
    const d = new Date(Date.now() + offset * 86400000);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const eng = () => window.AdminBookingEngine;

  function makeDep(price, cfg, paid) {
    const amount = eng() ? eng().calcDeposit(price, cfg) : Math.round(price * 0.5);
    return { price, depositAmount: amount, depositPaid: !!paid };
  }

  function getL1Seed(cfg) {
    const today = isoDay(0), tom = isoDay(1), yest = isoDay(-1);
    const items = [
      { id: 'b_1', token: '#TK-8421', clientName: 'Martín Gómez', clientPhone: '3815112233', service: 'Corte Degradé / Fade', ...makeDep(10000, cfg, true), paymentMethod: 'Mercado Pago', paidAt: new Date().toISOString(), day: 'Hoy', time: '15:00', status: 'confirmado', dateStr: today, prevStatus: null },
      { id: 'b_2', token: '#TK-3319', clientName: 'Sofía Núñez', clientPhone: '3814998877', service: 'Corte Clásico', ...makeDep(8000, cfg, false), paymentMethod: null, paidAt: null, day: 'Hoy', time: '16:30', status: 'pendiente', dateStr: today, prevStatus: null },
      { id: 'b_3', token: '#TK-9012', clientName: 'Lucía Fernández', clientPhone: '3816223344', service: 'Corte + Barba', ...makeDep(14000, cfg, true), paymentMethod: 'Transferencia / Alias', paidAt: new Date().toISOString(), day: 'Hoy', time: '11:30', status: 'finalizado', dateStr: today, prevStatus: 'confirmado' },
      { id: 'b_4', token: '#TK-5520', clientName: 'Javier Soto', clientPhone: '3813445566', service: 'Barba Toalla Caliente', ...makeDep(6000, cfg, false), paymentMethod: null, paidAt: null, day: 'Hoy', time: '19:00', status: 'cancelado', dateStr: today, prevStatus: 'pendiente' },
      { id: 'b_5', token: '#TK-7741', clientName: 'Facundo Ruiz', clientPhone: '3815778899', service: 'Corte Degradé / Fade', ...makeDep(10000, cfg, true), paymentMethod: 'Efectivo', paidAt: new Date().toISOString(), day: 'Hoy', time: '10:00', status: 'ausente', dateStr: today, prevStatus: 'confirmado' },
      { id: 'b_6', token: '#TK-9981', clientName: 'Valentín Castro', clientPhone: '3814661122', service: 'Coloración / Claritos', ...makeDep(22000, cfg, false), paymentMethod: null, paidAt: null, day: 'Mañana', time: '17:00', status: 'pendiente', dateStr: tom, prevStatus: null },
      { id: 'b_7', token: '#TK-6102', clientName: 'Camila Pereyra', clientPhone: '3815229900', service: 'Corte Clásico', ...makeDep(8000, cfg, true), paymentMethod: 'Efectivo', paidAt: new Date().toISOString(), day: 'Ayer', time: '18:00', status: 'finalizado', dateStr: yest, prevStatus: 'confirmado' }
    ];
    return items;
  }

  function getL2Seed(cfg) {
    const today = isoDay(0), tom = isoDay(1);
    return [
      { id: 'TK-8492', client: 'Martín Gómez', phone: '5493815559988', date: today, time: '10:00', pax: '2', service: 'Sesión Central Pro', ...makeDep(16000, cfg, true), paymentMethod: 'Transferencia / Alias', paidAt: new Date().toISOString(), status: 'CONFIRMED', prevStatus: null, createdAt: new Date().toISOString() },
      { id: 'TK-8493', client: 'Sofía Navarro', phone: '5493814442211', date: today, time: '11:30', pax: '1', service: 'Tratamiento Integral', ...makeDep(12000, cfg, false), paymentMethod: null, paidAt: null, status: 'PENDING_DEPOSIT', prevStatus: null, createdAt: new Date().toISOString() },
      { id: 'TK-8494', client: 'Lucía Fernández', phone: '5493816663344', date: today, time: '15:00', pax: '1', service: 'Atención Express', ...makeDep(9000, cfg, true), paymentMethod: 'Mercado Pago', paidAt: new Date().toISOString(), status: 'COMPLETED', prevStatus: 'CONFIRMED', createdAt: new Date().toISOString() },
      { id: 'TK-8495', client: 'Sofía Núñez', phone: '5493815123456', date: today, time: '17:00', pax: '2', service: 'Turno Estándar', ...makeDep(14000, cfg, true), paymentMethod: 'Efectivo', paidAt: new Date().toISOString(), status: 'NO_SHOW', prevStatus: 'CONFIRMED', createdAt: new Date().toISOString() },
      { id: 'TK-8496', client: 'Leandro Arturi', phone: '5493815774411', date: today, time: '18:30', pax: '1', service: 'Turno Central', ...makeDep(10000, cfg, false), paymentMethod: null, paidAt: null, status: 'CANCELLED', prevStatus: 'PENDING_DEPOSIT', createdAt: new Date().toISOString() },
      { id: 'TK-8497', client: 'Valentín Paz', phone: '5493814889922', date: tom, time: '10:30', pax: '2', service: 'Sesión Central Pro', ...makeDep(16000, cfg, false), paymentMethod: null, paidAt: null, status: 'PENDING_DEPOSIT', prevStatus: null, createdAt: new Date().toISOString() }
    ];
  }

  function getL3Seed(cfg) {
    const today = isoDay(0), tom = isoDay(1);
    return [
      { id: 'TK-8492', rubroId: 'barberia', staffId: 'st-1', staffName: 'Mateo Silva', resourceId: 'res-1', resourceName: 'Sillón Principal #1', serviceId: 'srv-1', serviceName: 'Corte Clásico & Fade', duration: 30, ...makeDep(12000, cfg, true), paymentMethod: 'Mercado Pago', paidAt: new Date().toISOString(), date: today, time: '10:00', client: 'Martín Gómez', phone: '3815551234', status: 'CONFIRMED', prevStatus: null },
      { id: 'TK-8493', rubroId: 'barberia', staffId: 'st-2', staffName: 'Lucas Gómez', resourceId: 'res-2', resourceName: 'Sillón Secundario #2', serviceId: 'srv-2', serviceName: 'Ritual de Barba', duration: 20, ...makeDep(9000, cfg, false), paymentMethod: null, paidAt: null, date: today, time: '11:00', client: 'Sofía Núñez', phone: '3815555678', status: 'PENDING_DEPOSIT', prevStatus: null },
      { id: 'TK-8494', rubroId: 'barberia', staffId: 'st-1', staffName: 'Mateo Silva', resourceId: 'res-3', resourceName: 'Box VIP Lavado & Spa', serviceId: 'srv-3', serviceName: 'Spa Capilar VIP', duration: 45, ...makeDep(18000, cfg, true), paymentMethod: 'Transferencia / Alias', paidAt: new Date().toISOString(), date: today, time: '12:00', client: 'Gastón Ibarra', phone: '3815559012', status: 'COMPLETED', prevStatus: 'CONFIRMED' },
      { id: 'TK-8495', rubroId: 'barberia', staffId: 'st-3', staffName: 'Juan Bianchi', resourceId: 'res-3', resourceName: 'Box VIP Lavado & Spa', serviceId: 'srv-3', serviceName: 'Spa Capilar VIP', duration: 45, ...makeDep(18000, cfg, true), paymentMethod: 'Efectivo', paidAt: new Date().toISOString(), date: today, time: '16:00', client: 'Lucía Fernández', phone: '3815553311', status: 'NO_SHOW', prevStatus: 'CONFIRMED' },
      { id: 'TK-8496', rubroId: 'barberia', staffId: 'st-2', staffName: 'Lucas Gómez', resourceId: 'res-2', resourceName: 'Sillón Secundario #2', serviceId: 'srv-1', serviceName: 'Corte Clásico & Fade', duration: 30, ...makeDep(12000, cfg, false), paymentMethod: null, paidAt: null, date: tom, time: '10:30', client: 'Esteban Morales', phone: '3815557700', status: 'CANCELLED', prevStatus: 'PENDING_DEPOSIT' }
    ];
  }

  function resetLevel(level, slug = 'demo-peluqueria') {
    const cfg = eng() ? eng().getConfig(level) : { requireDeposit: true, depositType: 'percentage', depositValue: 50 };
    if (level === 'l1') {
      const seed = getL1Seed(cfg);
      localStorage.setItem(`tucu_l1_bookings_${slug}`, JSON.stringify(seed));
      return seed;
    }
    if (level === 'l2') {
      const seed = getL2Seed(cfg);
      localStorage.setItem('tucu_l2_bookings', JSON.stringify(seed));
      return seed;
    }
    const seed = getL3Seed(cfg);
    localStorage.setItem('tucu_l3_bookings', JSON.stringify(seed));
    return seed;
  }

  return { isoDay, getL1Seed, getL2Seed, getL3Seed, resetLevel };
})();

