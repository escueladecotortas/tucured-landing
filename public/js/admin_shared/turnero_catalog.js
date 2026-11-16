// Archivo: public/js/admin_shared/turnero_catalog.js
// Catálogo en vivo, seeds por rubro y persistencia para Turnero Autónomo (< 180 líneas)

window.TucuTurneroCatalog = (function () {
  const RUBRO_META = {
    peluqueria: { label: 'Peluquería & Barbería', biz: 'Peluquería & Barbería Central', l3: 'barberia', defaultDesc: 'Atención profesional en salón con productos incluidos.' },
    estetica: { label: 'Estética & Bienestar', biz: 'Aura Estética & Spa', l3: 'peluqueria_estetica', defaultDesc: 'Sesión personalizada en gabinete equipado.' },
    gastronomia: { label: 'Gastronomía & Restó', biz: 'Bistró & Parrilla El Encuentro', l3: 'gastronomia', defaultDesc: 'Reserva garantizada de mesa o experiencia gastronómica.' },
    salud: { label: 'Salud & Consultorios', biz: 'Consultorios Médicos San Martín', l3: 'salud_consultorio', requireInsurance: true, defaultDesc: 'Atención médica programada sin demoras en sala.' },
    servicios: { label: 'Servicios & Consultorios', biz: 'Estudio Jurídico & Contable Norte', l3: 'servicios', defaultDesc: 'Asesoramiento profesional o turno de servicio técnico.' },
    deportes: { label: 'Deportes & Clubes', biz: 'Complejo Deportivo & Pádel Norte', l3: 'deportes_clubes', defaultDesc: 'Reserva de cancha o clase programada con profesor.' }
  };

  const SEEDS = {
    peluqueria: [
      { id: 'srv-pel-1', name: 'Corte Clásico', duration: 30, price: 8000, description: 'Corte tradicional a tijera y terminación prolija.', isActive: true },
      { id: 'srv-pel-2', name: 'Corte Degradé / Fade', duration: 45, price: 10000, description: 'Degradado preciso con terminación a navaja.', isActive: true },
      { id: 'srv-pel-3', name: 'Barba Toalla Caliente', duration: 30, price: 6000, description: 'Perfilado de barba con vapor y aceites esenciales.', isActive: true }
    ],
    estetica: [
      { id: 'srv-est-1', name: 'Limpieza Facial Profunda', duration: 60, price: 18000, description: 'Higiene facial, exfoliación e hidratación.', isActive: true },
      { id: 'srv-est-2', name: 'Esculpido de Cejas & Pestañas', duration: 45, price: 14000, description: 'Diseño de cejas, laminado y lifting.', isActive: true },
      { id: 'srv-est-3', name: 'Masaje Descontracturante', duration: 50, price: 20000, description: 'Sesión terapéutica para liberar tensión.', isActive: true }
    ],
    gastronomia: [
      { id: 'srv-gas-1', name: 'Reserva Mesa 2 Personas', duration: 90, price: 10000, description: 'Mesa reservada en sector salón o galería.', isActive: true },
      { id: 'srv-gas-2', name: 'Mesa Salón Principal (4 pers.)', duration: 120, price: 16000, description: 'Ubicación preferencial para almuerzo o cena.', isActive: true },
      { id: 'srv-gas-3', name: 'Degustación Nocturna', duration: 120, price: 28000, description: 'Menú de pasos con maridaje sugerido.', isActive: true }
    ],
    salud: [
      { id: 'srv-sal-1', name: 'Consulta Clínica General', duration: 30, price: 20000, description: 'Evaluación integral y seguimiento clínico.', isActive: true },
      { id: 'srv-sal-2', name: 'Control Odontológico', duration: 30, price: 18000, description: 'Diagnóstico bucal y limpieza preventiva.', isActive: true },
      { id: 'srv-sal-3', name: 'Sesión Kinesiología', duration: 45, price: 16000, description: 'Rehabilitación física personalizada.', isActive: true }
    ],
    servicios: [
      { id: 'srv-ser-1', name: 'Asesoría Inicial 45 min', duration: 45, price: 22000, description: 'Diagnóstico profesional y plan de acción.', isActive: true },
      { id: 'srv-ser-2', name: 'Gestión Impositiva Mensual', duration: 60, price: 26000, description: 'Revisión fiscal, vencimientos y balances.', isActive: true },
      { id: 'srv-ser-3', name: 'Auditoría Documental', duration: 60, price: 30000, description: 'Control técnico de contratos y legajos.', isActive: true }
    ],
    deportes: [
      { id: 'srv-dep-1', name: 'Alquiler Cancha Pádel Cristal', duration: 90, price: 24000, description: 'Turno reglamentario con iluminación LED incluida.', isActive: true },
      { id: 'srv-dep-2', name: 'Cancha Fútbol 5 Sintético', duration: 60, price: 32000, description: 'Césped profesional con vestuarios y pecheras.', isActive: true },
      { id: 'srv-dep-3', name: 'Clase Grupal Funcional', duration: 60, price: 14000, description: 'Sesión guiada de preparación física deportiva.', isActive: true }
    ]
  };

  function normalizeRubro(raw) {
    const r = String(raw || '').toLowerCase().trim();
    if (r === 'barberia' || r === 'peluqueria' || r.includes('barber') || r.includes('peluq')) {
      return r.includes('estet') ? 'estetica' : 'peluqueria';
    }
    if (r === 'peluqueria_estetica' || r.includes('estet')) return 'estetica';
    if (r === 'resto' || r === 'gastronomia' || r.includes('gastro')) return 'gastronomia';
    if (r === 'salud_consultorio' || r.includes('salud') || r.includes('medic')) return 'salud';
    if (r === 'deportes_clubes' || r.includes('deport') || r.includes('club')) return 'deportes';
    if (r.includes('servic') || r.includes('consultor')) return 'servicios';
    return 'peluqueria';
  }

  const readJson = (k) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (_) { return null; } };
  const isAvailable = (s) => (window.AdminShell?.isServiceAvailable ? window.AdminShell.isServiceAvailable(s) : Boolean(s && !s.deletedAt && s.isActive !== false && s.activo !== false && s.active !== false));

  function getActiveServices({ level = 'l1', slug = '', rubro = '' } = {}) {
    const isCustom = Boolean(slug && !slug.startsWith('demo-') && slug !== 'mi-comercio');
    const norm = normalizeRubro(rubro || (!isCustom ? slug : ''));
    const meta = RUBRO_META[norm] || RUBRO_META.peluqueria;
    const lvl = ['l1', 'l2', 'l3'].includes(level) ? level : 'l1';
    let list = null;
    if (lvl === 'l1') {
      const bySlug = isCustom ? readJson(`tucu_l1_services_${slug}`) : null;
      const byRubro = readJson(`tucu_l1_services_${norm}`), defL1 = readJson('tucu_l1_services');
      if (Array.isArray(bySlug)) list = bySlug;
      else if (Array.isArray(byRubro)) list = byRubro;
      else if (Array.isArray(defL1) && norm === 'peluqueria') list = defL1;
    } else if (lvl === 'l2') {
      const bySlug = isCustom ? readJson(`tucu_l2_services_${slug}`) : null;
      const byRubro = readJson(`tucu_l2_services_${norm}`), defL2 = readJson('tucu_l2_services');
      if (Array.isArray(bySlug)) list = bySlug;
      else if (Array.isArray(byRubro)) list = byRubro;
      else if (Array.isArray(defL2) && norm === (localStorage.getItem('tucu_l2_rubro') || 'estetica')) list = defL2;
    } else {
      const stored = readJson(`tucu_l3_services_${meta.l3}`);
      if (Array.isArray(stored)) list = stored;
    }
    if (!Array.isArray(list)) list = SEEDS[norm] || SEEDS.peluqueria;
    return list.filter(isAvailable).map((s, idx) => ({
      id: s.id || `srv_${idx + 1}`, name: s.name || s.title || 'Servicio',
      duration: Math.max(5, Number(s.durationMinutes || s.duration || 30)),
      price: Math.max(0, Number(s.priceNumeric ?? s.price ?? 10000)),
      description: s.description || (s.category ? `Categoría: ${s.category}` : meta.defaultDesc),
      requireDeposit: s.requireDeposit !== false
    }));
  }

  function getStaffAndResources({ level = 'l1', rubro = '' } = {}) {
    const norm = normalizeRubro(rubro), meta = RUBRO_META[norm] || RUBRO_META.peluqueria;
    if (level === 'l1') return { staff: [], resources: [] };
    if (level === 'l2') return { staff: [{ id: 'st-central', name: 'Atención Central / Primer Turno Libre' }], resources: [{ id: 'res-central', name: 'Puesto Principal' }] };
    const st = readJson(`tucu_l3_staff_${meta.l3}`);
    const rs = readJson(`tucu_l3_resources_${meta.l3}`);
    const staff = Array.isArray(st) && st.length ? st.filter(x => !x.deletedAt && x.active !== false) : [{ id: 'st-1', name: 'Especialista Titular', role: meta.label }, { id: 'st-2', name: 'Primer Profesional Disponible', role: 'Asignación automática' }];
    const resources = Array.isArray(rs) && rs.length ? rs.filter(x => !x.deletedAt && x.active !== false) : [{ id: 'res-1', name: 'Espacio / Box Principal' }];
    return { staff, resources };
  }

  function resolveBizInfo({ level = 'l1', rubro = '' } = {}) {
    const norm = normalizeRubro(rubro), meta = RUBRO_META[norm] || RUBRO_META.peluqueria;
    const lvl = ['l1', 'l2', 'l3'].includes(level) ? level : 'l1';
    const bizName = localStorage.getItem(`tucu_${lvl}_biz_name`) || (lvl === 'l2' ? localStorage.getItem('tucu_biz_name') : '') || meta.biz;
    return { normRubro: norm, meta, bizName };
  }

  function saveBooking({ level = 'l1', slug = 'demo-peluqueria', rubro = 'peluqueria', service, staff, resource, date, selectedDate, time, selectedTime, clientName, clientPhone, coverage = '' }) {
    const eng = window.AdminBookingEngine, isCustom = Boolean(slug && !slug.startsWith('demo-') && slug !== 'mi-comercio');
    const norm = normalizeRubro(rubro || (!isCustom ? slug : '')), meta = RUBRO_META[norm] || RUBRO_META.peluqueria;
    const bkDate = date || selectedDate || window.AdminShell?.localTodayStr?.() || new Date().toISOString().slice(0, 10);
    const bkTime = time || selectedTime || '10:00';
    const code = 'TK-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const price = Number(service?.price || 10000);
    const dep = eng ? eng.calcDeposit(price, level, service?.requireDeposit !== false) : Math.round(price * 0.5);
    const needsDep = dep > 0, targetSlug = isCustom ? slug : `demo-${norm}`;
    const originTurneroUrl = `/turnero.html?level=${encodeURIComponent(level)}&slug=${encodeURIComponent(slug || targetSlug)}&rubro=${encodeURIComponent(norm)}`;
    const pushKey = (k, rec) => { const p = readJson(k) || []; localStorage.setItem(k, JSON.stringify([rec, ...p.filter(x => x.id !== rec.id)])); };
    let record;
    if (level === 'l1') {
      record = { id: code, token: `#${code}`, rubroId: norm, clientName, clientPhone, service: service.name, duration: service.duration, price, depositAmount: dep, depositPaid: !needsDep, day: bkDate, dateStr: bkDate, time: bkTime, status: needsDep ? 'pendiente' : 'confirmado', prevStatus: null, originTurneroUrl, createdFromTurnero: true };
      pushKey(`tucu_l1_bookings_${norm}`, record); pushKey(`tucu_l1_bookings_${targetSlug}`, record);
    } else if (level === 'l2') {
      record = { id: code, rubroId: norm, client: clientName, phone: clientPhone, pax: norm === 'gastronomia' ? '2' : '1', service: service.name, duration: service.duration, date: bkDate, time: bkTime, price, depositAmount: dep, depositPaid: !needsDep, status: needsDep ? 'PENDING_DEPOSIT' : 'CONFIRMED', prevStatus: null, originTurneroUrl, createdAt: new Date().toISOString(), createdFromTurnero: true };
      pushKey(`tucu_l2_bookings_${norm}`, record); pushKey('tucu_l2_bookings', record);
    } else {
      record = { id: code, rubroId: meta.l3, staffId: staff?.id || 'st-1', staffName: staff?.name || 'Especialista', resourceId: resource?.id || 'res-1', resourceName: resource?.name || 'Box Principal', serviceId: service.id, serviceName: service.name, duration: service.duration, price, depositAmount: dep, depositPaid: !needsDep, date: bkDate, time: bkTime, client: clientName, phone: clientPhone, coverage, status: needsDep ? 'PENDING_DEPOSIT' : 'CONFIRMED', prevStatus: null, originTurneroUrl, createdFromTurnero: true };
      pushKey(`tucu_l3_bookings_${meta.l3}`, record); pushKey('tucu_l3_bookings', record);
    }
    return { code, record, ticketUrl: `/t/${code}`, portalUrl: `/t/${code}`, originTurneroUrl };
  }

  function buildAdminReturnUrl(level, slug, rubro) {
    const norm = normalizeRubro(rubro || slug);
    if (level === 'l2') return `/admin_l2.html?slug=${encodeURIComponent(slug || `demo-${norm}`)}&rubro=${encodeURIComponent(norm)}`;
    if (level === 'l3') return `/admin_l3.html?rubro=${encodeURIComponent(RUBRO_META[norm]?.l3 || 'barberia')}`;
    return `/admin_l1.html?slug=${encodeURIComponent(slug || `demo-${norm}`)}&rubro=${encodeURIComponent(norm)}`;
  }

  return { RUBRO_META, SEEDS, normalizeRubro, getActiveServices, getStaffAndResources, resolveBizInfo, saveBooking, buildAdminReturnUrl };
})();
