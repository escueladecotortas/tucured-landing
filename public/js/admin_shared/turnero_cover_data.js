// Archivo: public/js/admin_shared/turnero_cover_data.js
// Catálogo dual 12 portadas, 6 logos WebP, bajadas 1 renglón y vocabulario nativo por rubro (< 195L)

window.TucuCoverData = (function () {
  const RUBRO_THEMES = {
    peluqueria: { id: 'peluqueria', bg: '#B45309', hover: '#92400E', text: '#FFFFFF', softBg: '#FFFBEB', softText: '#92400E', softBorder: '#FCD34D', panelBg: '#F1EBE3', accentLight: '#FCD34D', demoLogo: '/assets/logos/demo_peluqueria.webp', displayFont: "'Instrument Serif', Georgia, serif", letterSpacing: '0.02em', serviceHeading: 'Elegir Servicio', serviceQuestion: '¿Qué te querés hacer?', slots: ['09:30', '11:00', '15:00', '16:30', '18:00', '19:30'] },
    estetica: { id: 'estetica', bg: '#8C6D46', hover: '#725736', text: '#FFFFFF', softBg: 'rgba(140,109,70,0.10)', softText: '#6F5535', softBorder: 'rgba(140,109,70,0.40)', panelBg: '#EFEAE1', accentLight: '#E7D3B7', demoLogo: '/assets/logos/demo_estetica.webp', displayFont: "'Cormorant Garamond', Georgia, serif", letterSpacing: '0em', serviceHeading: 'Elegir Servicio', serviceQuestion: '¿Qué te querés hacer?', slots: ['09:30', '11:00', '14:30', '16:30', '18:00', '19:30'] },
    gastronomia: { id: 'gastronomia', bg: '#C85A3F', hover: '#A8462E', text: '#FFFFFF', softBg: '#FFF7ED', softText: '#A8462E', softBorder: 'rgba(200,90,63,0.40)', panelBg: '#F2EAE4', accentLight: '#FDBA74', demoLogo: '/assets/logos/demo_gastronomia.webp', displayFont: "'Bricolage Grotesque', sans-serif", letterSpacing: '0em', serviceHeading: 'Experiencia / Mesa', serviceQuestion: '¿Qué reservamos?', slots: ['12:30', '13:30', '20:30', '21:30', '22:15', '23:00'] },
    deportes: { id: 'deportes', bg: '#15803D', hover: '#166534', text: '#FFFFFF', softBg: '#ECFDF5', softText: '#065F46', softBorder: '#6EE7B7', panelBg: '#EAEFE9', accentLight: '#86EFAC', demoLogo: '/assets/logos/demo_deportes.webp', displayFont: "'Barlow Condensed', sans-serif", letterSpacing: '0em', serviceHeading: 'Modalidad / Horario', serviceQuestion: '¿Qué reservamos?', slots: ['16:00', '17:30', '19:00', '20:30', '21:30', '22:30'] },
    salud: { id: 'salud', bg: '#0F766E', hover: '#115E59', text: '#FFFFFF', softBg: '#F0FDFA', softText: '#115E59', softBorder: '#5EEAD4', panelBg: '#EBF1F0', accentLight: '#99F6E4', demoLogo: '/assets/logos/demo_salud.webp', displayFont: "'Outfit', sans-serif", letterSpacing: '0em', serviceHeading: 'Especialidad / Consulta', serviceQuestion: '¿Qué consulta necesitás?', requireInsurance: true, slots: ['09:00', '10:30', '11:30', '16:00', '17:30', '18:30'] },
    servicios: { id: 'servicios', bg: '#4338CA', hover: '#3730A3', text: '#FFFFFF', softBg: '#EEF2FF', softText: '#3730A3', softBorder: '#A5B4FC', panelBg: '#ECEEF4', accentLight: '#C7D2FE', demoLogo: '/assets/logos/demo_servicios.webp', displayFont: "'Newsreader', Georgia, serif", letterSpacing: '0em', serviceHeading: 'Elegir Servicio', serviceQuestion: '¿Qué consulta necesitás?', slots: ['09:00', '10:30', '12:00', '15:00', '16:30', '18:00'] }
  };

  const T_DEF = { singular: 'turno', plural: 'turnos', nextLabel: 'Tu próximo turno', historyLabel: 'Mis turnos', ctaLabel: 'Reservar turno', docTitle: 'Comprobante de turno', cancelLabel: 'Cancelar turno', anotherLabel: 'Sacar otro turno', confirmedBadge: 'Turno confirmado', cancelledBadge: 'Turno cancelado' };
  const VOCAB = {
    peluqueria: T_DEF, estetica: T_DEF, salud: T_DEF,
    gastronomia: { singular: 'reserva', plural: 'reservas', nextLabel: 'Tu próxima reserva', historyLabel: 'Mis reservas', ctaLabel: 'Reservar mesa', docTitle: 'Comprobante de reserva', cancelLabel: 'Cancelar reserva', anotherLabel: 'Hacer otra reserva', confirmedBadge: 'Reserva confirmada', cancelledBadge: 'Reserva cancelada' },
    deportes: { singular: 'reserva', plural: 'reservas', nextLabel: 'Tu próxima reserva', historyLabel: 'Mis reservas', ctaLabel: 'Reservar cancha', docTitle: 'Comprobante de reserva', cancelLabel: 'Cancelar reserva', anotherLabel: 'Hacer otra reserva', confirmedBadge: 'Reserva confirmada', cancelledBadge: 'Reserva cancelada' },
    servicios: { singular: 'consulta', plural: 'consultas', nextLabel: 'Tu próxima consulta', historyLabel: 'Mis consultas', ctaLabel: 'Agendar consulta', docTitle: 'Comprobante de consulta', cancelLabel: 'Cancelar consulta', anotherLabel: 'Agendar otra consulta', confirmedBadge: 'Consulta confirmada', cancelledBadge: 'Consulta cancelada' }
  };

  const ACCENTS = {
    gold: { id: 'gold', label: 'Ámbar', bg: '#B45309', hover: '#92400E', text: '#FFFFFF', softBg: '#FFFBEB', softText: '#92400E', softBorder: '#FCD34D', accentLight: '#FCD34D' },
    emerald: { id: 'emerald', label: 'Esmeralda', bg: '#15803D', hover: '#166534', text: '#FFFFFF', softBg: '#ECFDF5', softText: '#065F46', softBorder: '#6EE7B7', accentLight: '#86EFAC' },
    terracotta: { id: 'terracotta', label: 'Terracota', bg: '#C85A3F', hover: '#A8462E', text: '#FFFFFF', softBg: '#FFF7ED', softText: '#A8462E', softBorder: 'rgba(200,90,63,0.40)', accentLight: '#FDBA74' },
    indigo: { id: 'indigo', label: 'Índigo', bg: '#4338CA', hover: '#3730A3', text: '#FFFFFF', softBg: '#EEF2FF', softText: '#3730A3', softBorder: '#A5B4FC', accentLight: '#C7D2FE' },
    charcoal: { id: 'charcoal', label: 'Grafito', bg: '#18181B', hover: '#27272A', text: '#FFFFFF', softBg: '#F4F4F5', softText: '#18181B', softBorder: '#D4D4D8', accentLight: '#E4E4E7' },
    rose: { id: 'rose', label: 'Borgoña', bg: '#9F1239', hover: '#881337', text: '#FFFFFF', softBg: '#FFF1F2', softText: '#9F1239', softBorder: '#FECDD3', accentLight: '#FDA4AF' }
  };

  const makePair = (rubro, diaSlug, diaId, nocSlug, nocId) => ({
    dia: { id: diaId, estilo: 'dia', poster: `/assets/covers/${rubro}/${diaSlug}.webp`, motion: `/assets/covers/${rubro}/${diaSlug}.mp4` },
    nocturno: { id: nocId, estilo: 'nocturno', poster: `/assets/covers/${rubro}/${nocSlug}.webp`, motion: `/assets/covers/${rubro}/${nocSlug}.mp4` }
  });

  const RUBRO_COVERS = {
    peluqueria: { variants: makePair('peluqueria', 'salon_luminoso_02', 'peluqueria-salon-luminoso-02', 'oficio_vapor_01', 'peluqueria-oficio-vapor-01'), tagline: 'Cortes y barba · Reservá tu silla en 20 segundos.', scheduleLabel: 'Lunes a sábado, 09:00 a 20:00', hours: { days: [1, 2, 3, 4, 5, 6], open: '09:00', close: '20:00' }, instagram: 'bravabarberia.tuc', whatsapp: '5493815551234' },
    estetica: { variants: makePair('estetica', 'brillo_natural_02', 'estetica-brillo-natural-02', 'calma_vela_01', 'estetica-calma-vela-01'), tagline: 'Facial, uñas y spa · Elegí tu horario sin esperar.', scheduleLabel: 'Lunes a sábado, 09:30 a 20:30', hours: { days: [1, 2, 3, 4, 5, 6], open: '09:30', close: '20:30' }, instagram: 'sienaestetica.yb', whatsapp: '5493815551234' },
    gastronomia: { variants: makePair('gastronomia', 'cafe_sol_02', 'gastronomia-cafe-sol-02', 'mesa_calida_01', 'gastronomia-mesa-calida-01'), tagline: 'Café y cocina de autor · Reservá tu mesa al toque.', scheduleLabel: 'Todos los días, 12:00 a 23:30', hours: { days: [0, 1, 2, 3, 4, 5, 6], open: '12:00', close: '23:30' }, instagram: 'bramacafe.tuc', whatsapp: '5493815551234' },
    deportes: { variants: makePair('deportes', 'padel_sol_02', 'deportes-padel-sol-02', 'cancha_nocturna_01', 'deportes-cancha-nocturna-01'), tagline: 'Canchas de blindex · Reservá tu cancha en 2 toques.', scheduleLabel: 'Todos los días, 08:00 a 23:00', hours: { days: [0, 1, 2, 3, 4, 5, 6], open: '08:00', close: '23:00' }, instagram: 'nortepadel.yb', whatsapp: '5493815551234' },
    salud: { variants: makePair('salud', 'clinica_luminosa_02', 'salud-clinica-luminosa-02', 'luz_manana_01', 'salud-luz-manana-01'), tagline: 'Atención programada · Turnos con tu obra social.', scheduleLabel: 'Lunes a viernes, 08:30 a 20:00', hours: { days: [1, 2, 3, 4, 5], open: '08:30', close: '20:00' }, instagram: 'albacentromedico.tuc', whatsapp: '5493815551234' },
    servicios: { variants: makePair('servicios', 'estudio_moderno_02', 'servicios-estudio-moderno-02', 'claridad_cafe_01', 'servicios-claridad-cafe-01'), tagline: 'Asesoramiento integral · Agendá tu consulta hoy.', scheduleLabel: 'Lunes a viernes, 09:00 a 18:30', hours: { days: [1, 2, 3, 4, 5], open: '09:00', close: '18:30' }, instagram: 'verticeestudio.tuc', whatsapp: '5493815551234' }
  };
  Object.values(RUBRO_COVERS).forEach(d => { const v = d.variants.dia; d.coverId = v.id; d.bg = d.poster = v.poster; d.motion = v.motion; });

  function findCoverById(rawId) {
    const q = String(rawId || '').trim().toLowerCase(); if (!q) return null;
    for (const [rubro, def] of Object.entries(RUBRO_COVERS)) {
      for (const variant of Object.values(def.variants || {})) if (variant.id.toLowerCase() === q) return { rubro, def, variant };
    }
    return null;
  }

  function normRubroFallback(raw) {
    const r = String(raw || '').toLowerCase().trim();
    if (r.includes('estet')) return 'estetica';
    if (r.includes('barber') || r.includes('peluq')) return 'peluqueria';
    if (r === 'resto' || r.includes('gastro')) return 'gastronomia';
    if (r.includes('deport') || r.includes('club')) return 'deportes';
    if (r.includes('salud') || r.includes('medic')) return 'salud';
    if (r.includes('servic') || r.includes('consultor')) return 'servicios';
    return 'peluqueria';
  }

  function sanitizeAssetUrl(raw) {
    const s = String(raw || '').trim();
    if (!s || s.toLowerCase() === 'none') return '';
    if (s.startsWith('/') && !s.startsWith('//')) return s;
    if (/^https?:\/\//i.test(s) || /^data:image\/(png|jpeg|jpg|webp);base64,/i.test(s)) return s;
    return '';
  }

  const readJson = (k) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (_) { return null; } };

  function toMinutes(hhmm, isClose) {
    const m = String(hhmm || '').match(/^(\d{1,2}):(\d{2})$/); if (!m) return isClose ? 1200 : 540;
    const h = Math.min(23, Math.max(0, parseInt(m[1], 10))), min = Math.min(59, Math.max(0, parseInt(m[2], 10)));
    return isClose && h === 0 && min === 0 ? 1440 : h * 60 + min;
  }

  function computeOpenStatus(hours, nowDate) {
    const cfg = hours || { days: [1, 2, 3, 4, 5, 6], open: '09:00', close: '20:00' };
    const now = nowDate instanceof Date && !isNaN(nowDate.getTime()) ? nowDate : new Date();
    const day = now.getDay(), mins = now.getHours() * 60 + now.getMinutes();
    const days = Array.isArray(cfg.days) ? cfg.days : [1, 2, 3, 4, 5, 6], openStr = cfg.open || '09:00', closeStr = cfg.close || '20:00';
    const open1 = toMinutes(openStr, false), close1 = toMinutes(closeStr, true);
    if (days.includes(day)) {
      if (mins >= open1 && mins < close1) return { isOpen: true, editorialText: `ABIERTO HASTA LAS ${closeStr}`, pillText: `Abierto hasta las ${closeStr}` };
      if (cfg.open2 && cfg.close2) {
        const open2 = toMinutes(cfg.open2, false), close2 = toMinutes(cfg.close2, true);
        if (mins >= open2 && mins < close2) return { isOpen: true, editorialText: `ABIERTO HASTA LAS ${cfg.close2}`, pillText: `Abierto hasta las ${cfg.close2}` };
        if (mins >= close1 && mins < open2) return { isOpen: false, editorialText: `ABRE A LAS ${cfg.open2}`, pillText: `Abre a las ${cfg.open2}` };
      }
    }
    return { isOpen: false, editorialText: `ABRE A LAS ${openStr}`, pillText: `Abre a las ${openStr}` };
  }

  function resolveCoverConfig(rubro, lvl = 'l1', searchStr) {
    const qStr = typeof searchStr === 'string' ? searchStr : (typeof window !== 'undefined' ? window.location.search : '');
    const p = new URLSearchParams(qStr), pRubro = p.get('rubro'), hit = findCoverById(p.get('cover'));
    const norm = (!pRubro && hit) ? hit.rubro : (window.TucuTurneroCatalog?.normalizeRubro || normRubroFallback)(rubro || pRubro || 'peluqueria');
    const level = ['l1', 'l2', 'l3'].includes(String(lvl || '').toLowerCase()) ? String(lvl).toLowerCase() : 'l1';
    const theme = RUBRO_THEMES[norm] || RUBRO_THEMES.peluqueria, ls = readJson(`tucu_${level}_cover_${norm}`) || {};
    const def = hit ? hit.def : (RUBRO_COVERS[norm] || RUBRO_COVERS.peluqueria), bizInfo = window.TucuTurneroCatalog?.resolveBizInfo?.({ level, rubro: norm }) || {};
    let cleanLsBiz = String(ls.bizName || '').trim();
    if (cleanLsBiz && window.TucuTurneroCatalog?.isLegacyDemoName?.(cleanLsBiz)) {
      cleanLsBiz = '';
      try { ls.bizName = bizInfo.bizName || ''; localStorage.setItem(`tucu_${level}_cover_${norm}`, JSON.stringify(ls)); } catch (_) {}
    }
    const pEstilo = (p.get('estilo') || '').trim().toLowerCase(), estilo = hit ? hit.variant.estilo : (['nocturno', 'dia'].includes(pEstilo) ? pEstilo : (['nocturno', 'dia'].includes(ls.estilo) ? ls.estilo : 'dia'));
    const variant = hit ? hit.variant : (def.variants[estilo] || def.variants.dia), pAcc = (p.get('accent') || '').trim().toLowerCase(), pBg = sanitizeAssetUrl(p.get('bg'));
    const pLogo = (p.get('logo') || '').trim(), pIg = (p.get('ig') || '').trim(), pWa = (p.get('wa') || '').trim(), noMotion = p.get('motion') === '0';
    const accent = ACCENTS[pAcc] || RUBRO_THEMES[pAcc] || ACCENTS[ls.accent] || RUBRO_THEMES[ls.accent] || theme;
    const poster = pBg || sanitizeAssetUrl(ls.bg) || variant.poster, motion = noMotion || pBg ? null : (sanitizeAssetUrl(ls.motion) || variant.motion || null);
    const logo = pLogo.toLowerCase() === 'none' ? '' : (sanitizeAssetUrl(pLogo) || sanitizeAssetUrl(ls.logo) || theme.demoLogo || '');
    const hours = ls.hours || def.hours;
    return {
      rubro: norm, level, coverId: variant.id, estilo, rubroLabel: bizInfo.meta?.label || 'Turnero Web',
      bizName: (p.get('biz') || '').trim() || cleanLsBiz || bizInfo.bizName || 'Tucu Red',
      tagline: (p.get('tagline') || '').trim() || ls.tagline || def.tagline, vocab: VOCAB[norm] || T_DEF,
      displayFont: theme.displayFont, letterSpacing: theme.letterSpacing || '0em', accentLight: accent.accentLight || theme.accentLight,
      theme, accent, panelBg: ls.panelBg || theme.panelBg || '#F1EBE3', bg: poster, poster, motion, noMotion, logo,
      address: (p.get('address') || '').trim() || ls.address || bizInfo.address || '25 de Mayo 480, S. M. de Tucumán',
      scheduleLabel: (p.get('schedule') || '').trim() || ls.scheduleLabel || def.scheduleLabel, hours,
      instagram: pIg === 'none' ? '' : (pIg || (ls.instagram !== undefined ? ls.instagram : def.instagram)),
      whatsapp: pWa === 'none' ? '' : (pWa || (ls.whatsapp !== undefined ? ls.whatsapp : def.whatsapp)), status: computeOpenStatus(hours)
    };
  }

  return { ACCENTS, RUBRO_THEMES, RUBRO_COVERS, VOCAB, computeOpenStatus, findCoverById, resolveCoverConfig };
})();
