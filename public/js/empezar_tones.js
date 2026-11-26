// Archivo: public/js/empezar_tones.js
// Selector de 4 tonos de voz y matriz positiva de bajadas por rubro para /empezar.html (< 130L)

window.TucuEmpezarTones = (function () {
  const TONES = [
    { id: 'cercano', label: 'Cercano & Barrial', hint: 'Cálido, directo y de confianza' },
    { id: 'boutique', label: 'Boutique & Elegante', hint: 'Cuidado y experiencia a medida' },
    { id: 'agil', label: 'Directo & Ágil', hint: 'Rápido y con turnos al toque' },
    { id: 'profesional', label: 'Profesional & Clínico', hint: 'Claro, ordenado y con respaldo' }
  ];

  // Bajadas sugeridas en voz positiva por combinación (rubro, tono)
  const TAGLINES = {
    peluqueria: {
      cercano: 'Tu corte de siempre, con la atención cálida de tu barbería de confianza.',
      boutique: 'Cortes de precisión, barba clásica y ritual pensado especialmente para vos.',
      agil: 'Elegí tu horario, reservá en dos pasos y vení directo sin esperar.',
      profesional: 'Asesoramiento de imagen, puntualidad y agenda organizada para cada visita.'
    },
    estetica: {
      cercano: 'Un espacio cálido para cuidarte, renovar tu energía y sentirte bien.',
      boutique: 'Cuidado facial, uñas y bienestar diseñados con dedicación en cada detalle.',
      agil: 'Tu próximo turno de estética confirmado online al instante y sin demoras.',
      profesional: 'Tratamientos estéticos personalizados con seguimiento y horarios puntuales.'
    },
    gastronomia: {
      cercano: 'Mesa lista para compartir sabores ricos, buena charla y momentos de disfrute.',
      boutique: 'Cocina de autor, café de especialidad y tu mesa reservada para vivirla.',
      agil: 'Elegí día, horario y asegurá tu mesa al instante desde el celular.',
      profesional: 'Reservas organizadas por salón y horario para recibirte siempre a punto.'
    },
    deportes: {
      cercano: 'Sumate a jugar con tus amigos en canchas cuidadas y el mejor ambiente.',
      boutique: 'Canchas iluminadas de primer nivel y todo listo desde que llegás.',
      agil: 'Consultá horarios libres y reservá tu cancha en segundos al instante.',
      profesional: 'Disponibilidad clara por cancha y franja horaria con confirmación inmediata.'
    },
    salud: {
      cercano: 'Atención cercana y humana para cuidar tu bienestar con total tranquilidad.',
      boutique: 'Consultorios confortables y tiempo dedicado en cada consulta programada.',
      agil: 'Sacá tu turno médico online en pocos clics y elegí el horario ideal.',
      profesional: 'Agenda médica ordenada, puntualidad garantizada y atención con tu obra social.'
    },
    servicios: {
      cercano: 'Te acompañamos con trato directo y soluciones prácticas para lo que necesitás.',
      boutique: 'Atención personalizada y asesoramiento cuidado desde la primera consulta.',
      agil: 'Agendá tu consulta online en minutos según la disponibilidad que mejor te quede.',
      profesional: 'Asesoramiento integral, agenda precisa y seguimiento claro de cada gestión.'
    }
  };

  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  function normalizeTone(raw) {
    const k = String(raw || '').toLowerCase().trim();
    return TONES.some(t => t.id === k) ? k : 'cercano';
  }

  function getToneMeta(id) {
    return TONES.find(t => t.id === normalizeTone(id)) || TONES[0];
  }

  function getSuggestedTagline(rubro, toneId) {
    const byRubro = TAGLINES[rubro] || TAGLINES.peluqueria;
    return byRubro[normalizeTone(toneId)] || byRubro.cercano;
  }

  function renderToneSelector(activeTone) {
    const current = normalizeTone(activeTone);
    const items = TONES.map(t => {
      const on = t.id === current;
      return `<button type="button" data-emp-tone="${t.id}" aria-pressed="${on}" class="p-2.5 rounded-xl text-left cursor-pointer transition-all ${on ? 'wg-option-active' : 'wg-option'}">
        <span class="block text-xs font-bold leading-tight">${esc(t.label)}</span>
        <span class="block text-[11px] mt-0.5 leading-snug text-stone-600">${esc(t.hint)}</span>
      </button>`;
    }).join('');
    return `<div class="space-y-1.5">
      <div class="flex items-center justify-between gap-2">
        <span class="block text-xs font-bold text-stone-700">Tono de voz de tu portada</span>
        <span class="text-[11px] font-medium text-stone-500">Sugiere la frase de presentación</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">${items}</div>
    </div>`;
  }

  return { TONES, TAGLINES, normalizeTone, getToneMeta, getSuggestedTagline, renderToneSelector };
})();
