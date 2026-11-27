// Archivo: public/js/empezar_phrases_bank.js
// Banco curado de 12-15 eslóganes reales por rubro y especialidad (<=55 chars, sin jerga de software) (< 145L)

window.TucuEmpezarPhrasesBank = (function () {
  const MAX_LEN = 55;
  const clip = (s) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, MAX_LEN);

  const SPEC_PHRASES = {
    Cortes: ['Cortes a tu medida y estilo propio.', 'Precisión en cada tijera y detalle.'],
    Barbería: ['Oficio de barbería clásica en cada detalle.', 'Navaja, toalla caliente y estilo auténtico.'],
    Coloración: ['Color luminoso cuidando la salud de tu pelo.', 'Tonos naturales y asesoramiento real.'],
    Alisados: ['Cabello dócil, sano y con brillo natural.', 'Cuidado profundo para un lacio duradero.'],
    Uñas: ['Manos prolijas con diseños pensados para vos.', 'Detalles delicados que duran semanas.'],
    Facial: ['Piel luminosa y cuidado facial personalizado.', 'Tratamientos suaves para renovar tu rostro.'],
    Pestañas: ['Realzá tu mirada con naturalidad y precisión.', 'Cejas y pestañas cuidadas al detalle.'],
    Masajes: ['Desconectá tensiones y recuperá tu bienestar.', 'Pausa real para aliviar cuerpo y mente.'],
    Pádel: ['Canchas de blindex listas para grandes partidos.', 'Vení a disfrutar el mejor pádel del barrio.'],
    Fútbol: ['Césped impecable para jugar con amigos.', 'La cancha lista para dejar todo en el partido.'],
    Funcional: ['Entrenamiento cuidado en grupos reducidos.', 'Movete mejor con seguimiento cercano.'],
    Tenis: ['Polvo de ladrillo y pasión por cada punto.', 'Entrená tu juego en canchas cuidadas.'],
    Kinesiología: ['Recuperá movimiento con atención personalizada.', 'Rehabilitación cercana paso a paso.'],
    Odontología: ['Cuidamos tu sonrisa con calma y precisión.', 'Odontología cercana y diagnóstico claro.'],
    Psicología: ['Un espacio cuidado de escucha y bienestar.', 'Acompañamiento profesional en tu proceso.'],
    Nutrición: ['Hábitos reales pensados para tu vida diaria.', 'Nutrición práctica sin fórmulas rígidas.'],
    Contable: ['Orden impositivo claro para tu negocio.', 'Acompañamiento contable cercano y serio.'],
    Abogacía: ['Criterio legal claro para defender lo tuyo.', 'Asesoramiento jurídico serio y confidencial.'],
    Diseño: ['Ideas funcionales con identidad propia.', 'Diseño pensado para destacar tu proyecto.'],
    Técnico: ['Diagnóstico honesto y reparación garantida.', 'Soluciones técnicas claras y duraderas.']
  };

  const RUBRO_POOLS = {
    peluqueria: [
      'Cortes y color pensados para tu estilo.',
      'Tu lugar de confianza para renovar tu look.',
      'Cuidamos tu pelo con dedicación y criterio.',
      'Estilo auténtico y atención sin apuros.',
      'Tradición de barbería y tendencia actual.',
      'Detalles que marcan la diferencia en tu imagen.',
      'Asesoramiento real para encontrar tu mejor corte.',
      'Un espacio cómodo pensado para vos.',
      'Cabello sano, corte prolijo y buena energía.',
      'Años de oficio al servicio de tu estilo.',
      'Cada visita pensada para que salgas mejor.',
      'Calidad profesional en cada tijera y trazo.'
    ],
    estetica: [
      'Un momento de cuidado pensado para vos.',
      'Estética integral en un ambiente tranquilo.',
      'Bienestar, calma y resultados visibles.',
      'Manos, rostro y cuerpo en buenas manos.',
      'Cuidado real con productos seleccionados.',
      'Tu pausa semanal para sentirte bien.',
      'Belleza natural con atención dedicada.',
      'Tratamientos personalizados para cada piel.',
      'Armonía y detalle en cada sesión.',
      'Espacio íntimo para renovar tu energía.',
      'Calidez profesional en cada tratamiento.',
      'Elegí cuidarte con tiempo y dedicación.'
    ],
    deportes: [
      'Canchas cuidadas para disfrutar cada partido.',
      'Tu punto de encuentro para entrenar y jugar.',
      'Instalaciones listas para rendir al máximo.',
      'El mejor clima deportivo con amigos.',
      'Césped, luz y pasión en cada jornada.',
      'Entrená fuerte en un espacio preparado.',
      'Deporte todos los días en tu zona.',
      'Buena iluminación y canchas siempre a punto.',
      'Vení a compartir el tercer tiempo en el club.',
      'Equipamiento cuidado para entrenar cómodo.',
      'Energía, equipo y juego en cada encuentro.',
      'Tu espacio deportivo de confianza.'
    ],
    salud: [
      'Atención profesional cercana y cuidada.',
      'Tu salud acompañada con criterio y calidez.',
      'Consultorio pensado para escucharte con tiempo.',
      'Evaluación integral y seguimiento continuo.',
      'Profesionales comprometidos con tu bienestar.',
      'Diagnóstico claro y trato humano.',
      'Cuidado de la salud en un entorno sereno.',
      'Trabajamos para mejorar tu calidad de vida.',
      'Atención seria, puntual y personalizada.',
      'Acompañamiento médico adaptado a vos.',
      'Prevención y tratamiento en un solo lugar.',
      'Confianza profesional en cada consulta.'
    ],
    servicios: [
      'Asesoramiento claro para resolver con certeza.',
      'Soluciones a medida con trato directo.',
      'Compromiso profesional en cada proyecto.',
      'Acompañamos tus decisiones con respaldo real.',
      'Trabajo prolijo, serio y sin vueltas.',
      'Respuestas concretas para tu empresa o hogar.',
      'Criterio técnico y atención personalizada.',
      'Tu aliado de confianza para cada gestión.',
      'Transparencia y dedicación en cada caso.',
      'Experiencia práctica al servicio de tus metas.',
      'Cuidamos cada detalle de principio a fin.',
      'Calidad y cumplimiento en cada trabajo.'
    ]
  };

  function getPool(rubro, specialties = []) {
    const out = [];
    (Array.isArray(specialties) ? specialties : []).forEach((sp) => {
      (SPEC_PHRASES[sp] || []).forEach((p) => { const c = clip(p); if (c && !out.includes(c)) out.push(c); });
    });
    (RUBRO_POOLS[rubro] || RUBRO_POOLS.servicios).forEach((p) => {
      const c = clip(p);
      if (c && !out.includes(c)) out.push(c);
    });
    return out;
  }

  function getPage(rubro, specialties = [], pageIdx = 0) {
    const pool = getPool(rubro, specialties);
    const totalPages = Math.max(1, Math.ceil(pool.length / 3));
    const safePage = ((Number(pageIdx) || 0) % totalPages + totalPages) % totalPages;
    return { items: pool.slice(safePage * 3, safePage * 3 + 3), page: safePage, totalPages };
  }

  return { getPool, getPage };
})();