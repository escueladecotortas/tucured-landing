// Archivo: public/js/admin_shared/admin_manual_data_l1.js
// Diccionario Operativo del Manual de Uso para Consola L1 Autónomo (<= 180 líneas)

(function (global) {
  global.AdminManualData = global.AdminManualData || {};
  global.AdminManualData.l1 = [
    {
      id: 'l1-agenda',
      title: '1. Agenda, Recepción Web & Turnos Manuales',
      intro: 'Controla la recepción online de tu negocio, filtra turnos por período, acredita señas o registra citas presenciales y telefónicas.',
      subsections: [
        {
          subtitle: 'Recepción web y gestión diaria',
          steps: [
            'En la barra lateral izquierda ubica el recuadro Recepción Web y pulsa el interruptor para alternar entre Recepción Abierta y En Pausa.',
            'Usa los filtros temporales (Hoy, Esta Semana, Este Mes, Rango) y el buscador superior para localizar citas por cliente, servicio o teléfono.',
            'Pulsa Nueva Cita para cargar reservas telefónicas o de mostrador eligiendo servicio, fecha y horario disponible.',
            'En turnos con Pendiente Seña, pulsa Acreditar Seña para pasarlos a Confirmado o usa Cancelar para liberar el horario con baja lógica.'
          ]
        }
      ]
    },
    {
      id: 'l1-catalogo',
      title: '2. Catálogo de Servicios, Señas & Orden Visual',
      intro: 'Configura tus prestaciones con duración estándar o personalizada, exigencia opcional de seña web, historial de precios y orden visible.',
      subsections: [
        {
          subtitle: 'Precios, duración y seña opcional',
          steps: [
            'Ingresa a Catálogo & Precios y pulsa Nuevo Servicio o Editar para definir nombre, importe, orden de aparición y duración (5 a 480 min).',
            'Activa o desactiva la casilla Exige seña web en cada servicio; las prestaciones sin seña previa se confirman de forma directa para el cliente.',
            'Consulta el historial de ajustes de precio cuando actualices tarifas y utiliza Archivar con confirmación para preservar tus registros.'
          ]
        }
      ]
    },
    {
      id: 'l1-horarios',
      title: '3. Horarios Partidos & Feriados Nacionales 2026',
      intro: 'Organiza tu jornada semanal continua o con corte de siesta y administra los feriados nacionales 2026 agrupados por mes.',
      subsections: [
        {
          subtitle: 'Jornada laboral, clonado y excepción de feriados',
          steps: [
            'En Configuración -> Horarios de Atención activa cada día laboral y marca Horario partido para definir franja Mañana y franja Tarde.',
            'Configura el día Lunes y presiona Clonar Lun a Vie para replicar tu esquema semanal en un solo paso.',
            'Revisa los Feriados Nacionales 2026 agrupados por mes y usa el interruptor individual de cada fecha si necesitás abrir atención en un feriado puntual.'
          ]
        }
      ]
    },
    {
      id: 'l1-identidad-wa',
      title: '4. Identidad, Dirección del Local, Ticket & WhatsApp QR',
      intro: 'Personaliza los datos de tu negocio visibles en el Ticket Online (/t/TK-XXXX), tus cobros directos y los recordatorios automáticos.',
      subsections: [
        {
          subtitle: 'Dirección, Alias/CBU y vinculación desde el celular',
          steps: [
            'Completa Nombre del Comercio y Dirección del Local en Identidad & Ubicación para que figuren en el Ticket Online y en cada mensaje de WhatsApp.',
            'En Señas & Datos Bancarios carga tu Alias / CBU / CVU para recibir transferencias directas sin intermediarios y configura recordatorios 24h / 2h antes.',
            'Pulsa Vincular Sesión QR y escanea el código desde WhatsApp > Dispositivos vinculados en tu celular para activar la confirmación y avisos automáticos.',
            'Cuando tu comercio sume base CRM con Email, fecha de cumpleaños e importación directa desde el celular, podrás escalar a Nivel 2 conservando tu historial.'
          ]
        }
      ]
    }
  ];
})(typeof window !== 'undefined' ? window : global);
