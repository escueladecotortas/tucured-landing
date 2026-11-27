// Archivo: public/js/empezar_specialty_data.js
// Mapa de las 20 especialidades: servicios iniciales, palabras clave y verbo CTA por rubro (< 145L)

window.TucuEmpezarSpecialtyData = (function () {
  const MAP = {
    Cortes: {
      keywords: ['Cortes modernos', 'Degradé y tijera', 'Estilo clásico', 'Atención directa', 'Sin esperas'],
      services: [{ name: 'Corte clásico', duration: 30, price: 8500 }, { name: 'Corte y lavado', duration: 40, price: 10500 }, { name: 'Corte infantil', duration: 30, price: 7000 }]
    },
    Barbería: {
      keywords: ['Barbería clásica', 'Fade y navaja', 'Perfilado de barba', 'Toalla caliente', 'Estilo masculino'],
      services: [{ name: 'Corte y barba', duration: 45, price: 12000 }, { name: 'Perfilado de barba', duration: 25, price: 6500 }, { name: 'Fade + ritual', duration: 50, price: 14000 }]
    },
    Coloración: {
      keywords: ['Coloración cuidada', 'Iluminación', 'Balayage', 'Nutrición capilar', 'Diagnóstico de color'],
      services: [{ name: 'Color completo', duration: 90, price: 28000 }, { name: 'Iluminación / mechas', duration: 120, price: 36000 }, { name: 'Baño de luz', duration: 45, price: 16000 }]
    },
    Alisados: {
      keywords: ['Alisado progresivo', 'Keratina', 'Brillo y suavidad', 'Cuidado capilar', 'Sin frizz'],
      services: [{ name: 'Alisado orgánico', duration: 120, price: 32000 }, { name: 'Shock de keratina', duration: 60, price: 18000 }, { name: 'Botox capilar', duration: 60, price: 16500 }]
    },
    Uñas: {
      keywords: ['Uñas esculpidas', 'Semipermanente', 'Kapping gel', 'Diseños a medida', 'Cuidado de manos'],
      services: [{ name: 'Esmaltado semipermanente', duration: 45, price: 14000 }, { name: 'Kapping gel', duration: 60, price: 17500 }, { name: 'Esculpidas', duration: 90, price: 23000 }]
    },
    Facial: {
      keywords: ['Limpieza facial', 'Renovación de piel', 'Hidratación profunda', 'Diagnóstico facial', 'Bienestar'],
      services: [{ name: 'Limpieza facial profunda', duration: 60, price: 18500 }, { name: 'Peeling suave', duration: 45, price: 21000 }, { name: 'Hidratación intensiva', duration: 50, price: 17000 }]
    },
    Pestañas: {
      keywords: ['Lifting de pestañas', 'Perfilado de cejas', 'Laminado', 'Mirada natural', 'Extensión sutil'],
      services: [{ name: 'Lifting y tinte', duration: 60, price: 16500 }, { name: 'Laminado de cejas', duration: 45, price: 14000 }, { name: 'Perfilado de cejas', duration: 30, price: 9500 }]
    },
    Masajes: {
      keywords: ['Masajes descontracturantes', 'Relajación total', 'Alivio muscular', 'Ambiente calmo', 'Bienestar'],
      services: [{ name: 'Masaje descontracturante', duration: 60, price: 19500 }, { name: 'Masaje relajante', duration: 60, price: 18000 }, { name: 'Sesión focalizada', duration: 30, price: 12500 }]
    },
    Pádel: {
      keywords: ['Canchas de pádel', 'Blindex e iluminación', 'Partidos nocturnos', 'Alquiler de paletas', 'Torneos'],
      services: [{ name: 'Cancha de pádel 60 min', duration: 60, price: 24000 }, { name: 'Cancha de pádel 90 min', duration: 90, price: 34000 }, { name: 'Clase de pádel', duration: 60, price: 16000 }]
    },
    Fútbol: {
      keywords: ['Canchas de fútbol', 'Césped sintético', 'Iluminación LED', 'Tercer tiempo', 'Torneos semanales'],
      services: [{ name: 'Fútbol 5 — 60 min', duration: 60, price: 28000 }, { name: 'Fútbol 7 — 60 min', duration: 60, price: 38000 }, { name: 'Turno doble 90 min', duration: 90, price: 42000 }]
    },
    Funcional: {
      keywords: ['Entrenamiento funcional', 'Grupos reducidos', 'Fuerza y movilidad', 'Seguimiento cercano', 'Energía'],
      services: [{ name: 'Clase grupal funcional', duration: 60, price: 9000 }, { name: 'Sesión personalizada', duration: 60, price: 16000 }, { name: 'Evaluación física', duration: 45, price: 12000 }]
    },
    Tenis: {
      keywords: ['Polvo de ladrillo', 'Clases individuales', 'Alquiler por hora', 'Escuelita', 'Canchas iluminadas'],
      services: [{ name: 'Cancha de tenis 60 min', duration: 60, price: 20000 }, { name: 'Clase particular', duration: 60, price: 18000 }, { name: 'Cancha doble 90 min', duration: 90, price: 28000 }]
    },
    Kinesiología: {
      keywords: ['Rehabilitación', 'Fisioterapia', 'Obras sociales', 'Tratamiento personalizado', 'Recuperación'],
      services: [{ name: 'Evaluación kinesiológica', duration: 45, price: 20000 }, { name: 'Sesión de rehabilitación', duration: 45, price: 18000 }, { name: 'Terapia manual', duration: 45, price: 21000 }]
    },
    Odontología: {
      keywords: ['Odontología general', 'Limpieza dental', 'Ortodoncia', 'Atención cuidada', 'Diagnóstico claro'],
      services: [{ name: 'Consulta y diagnóstico', duration: 30, price: 18000 }, { name: 'Limpieza y control', duration: 40, price: 22000 }, { name: 'Blanqueamiento dental', duration: 60, price: 45000 }]
    },
    Psicología: {
      keywords: ['Espacio de escucha', 'Sesiones presenciales', 'Atención confidencial', 'Acompañamiento', 'Bienestar'],
      services: [{ name: 'Primera entrevista', duration: 45, price: 20000 }, { name: 'Sesión individual', duration: 45, price: 18000 }, { name: 'Sesión de orientación', duration: 45, price: 19000 }]
    },
    Nutrición: {
      keywords: ['Plan alimentario real', 'Antropometría', 'Hábitos sostenibles', 'Nutrición deportiva', 'Seguimiento'],
      services: [{ name: 'Primera consulta nutricional', duration: 45, price: 20000 }, { name: 'Control y antropometría', duration: 30, price: 15000 }, { name: 'Plan deportivo', duration: 45, price: 22000 }]
    },
    Contable: {
      keywords: ['Monotributo e impuestos', 'Sueldos y balances', 'Asesoría impositiva', 'Pymes y comercios', 'Claridad'],
      services: [{ name: 'Consulta impositiva', duration: 45, price: 22000 }, { name: 'Asesoría monotributo', duration: 30, price: 15000 }, { name: 'Revisión contable', duration: 60, price: 30000 }]
    },
    Abogacía: {
      keywords: ['Asesoramiento legal', 'Contratos y acuerdos', 'Derecho laboral', 'Atención confidencial', 'Criterio claro'],
      services: [{ name: 'Consulta jurídica inicial', duration: 45, price: 25000 }, { name: 'Revisión de contrato', duration: 45, price: 28000 }, { name: 'Mediación y acuerdo', duration: 60, price: 32000 }]
    },
    Diseño: {
      keywords: ['Identidad de marca', 'Diseño a medida', 'Espacios funcionales', 'Dirección creativa', 'Detalles'],
      services: [{ name: 'Reunión de diagnóstico', duration: 45, price: 18000 }, { name: 'Asesoría de proyecto', duration: 60, price: 25000 }, { name: 'Revisión de propuesta', duration: 45, price: 16000 }]
    },
    Técnico: {
      keywords: ['Diagnóstico preciso', 'Reparación garantida', 'Repuestos originales', 'Presupuesto claro', 'Service'],
      services: [{ name: 'Diagnóstico técnico', duration: 30, price: 10000 }, { name: 'Mantenimiento preventivo', duration: 60, price: 22000 }, { name: 'Revisión completa', duration: 45, price: 16000 }]
    }
  };

  const RUBRO_DEFAULTS = {
    peluqueria: [{ name: 'Corte clásico', duration: 30, price: 8500 }, { name: 'Corte y barba', duration: 45, price: 12000 }, { name: 'Perfilado de barba', duration: 20, price: 6000 }],
    estetica: [{ name: 'Limpieza facial profunda', duration: 60, price: 18000 }, { name: 'Esmaltado semipermanente', duration: 45, price: 14000 }, { name: 'Masaje descontracturante', duration: 60, price: 19500 }],
    deportes: [{ name: 'Alquiler de cancha 60 min', duration: 60, price: 24000 }, { name: 'Turno doble 90 min', duration: 90, price: 34000 }, { name: 'Clase personalizada', duration: 60, price: 15000 }],
    salud: [{ name: 'Consulta inicial', duration: 30, price: 20000 }, { name: 'Control y seguimiento', duration: 20, price: 15000 }, { name: 'Sesión terapéutica', duration: 45, price: 22000 }],
    servicios: [{ name: 'Asesoramiento inicial', duration: 30, price: 12000 }, { name: 'Servicio estándar', duration: 60, price: 20000 }, { name: 'Revisión técnica', duration: 45, price: 16000 }]
  };

  const RUBRO_KW = {
    peluqueria: ['Corte y estilo', 'Barbería', 'Coloración', 'Alisados', 'Atención directa'],
    estetica: ['Uñas esculpidas', 'Limpieza facial', 'Pestañas y cejas', 'Masajes', 'Bienestar'],
    deportes: ['Canchas de pádel', 'Fútbol 5 y 7', 'Entrenamiento', 'Torneos', 'Iluminación LED'],
    salud: ['Atención médica', 'Consultorio privado', 'Obras sociales', 'Evaluación integral', 'Seguimiento'],
    servicios: ['Asesoría 1 a 1', 'Presupuestos claros', 'Soporte técnico', 'Atención dedicada', 'Seguimiento']
  };

  const getCtaVerb = (rubro) => (rubro === 'salud' ? 'Reservar consulta' : (rubro === 'deportes' ? 'Reservar cancha' : 'Reservar turno'));

  function getInitialServices(rubro, specialties = []) {
    const firstSpec = Array.isArray(specialties) ? specialties.find((sp) => MAP[sp]) : '';
    const base = firstSpec ? MAP[firstSpec].services : (RUBRO_DEFAULTS[rubro] || RUBRO_DEFAULTS.peluqueria);
    return base.map((s) => ({ ...s, noPrice: false, noTime: false }));
  }

  function getKeywords(rubro, specialties = []) {
    const list = [];
    (Array.isArray(specialties) ? specialties : []).forEach((sp) => {
      (MAP[sp]?.keywords || []).forEach((kw) => { if (!list.includes(kw)) list.push(kw); });
    });
    (RUBRO_KW[rubro] || RUBRO_KW.servicios).forEach((kw) => { if (!list.includes(kw)) list.push(kw); });
    return list.slice(0, 6);
  }

  const getSpecialtyContext = (specialties = []) => (Array.isArray(specialties) ? specialties.filter(Boolean).join(', ') : '');

  return { MAP, getCtaVerb, getInitialServices, getKeywords, getSpecialtyContext };
})();