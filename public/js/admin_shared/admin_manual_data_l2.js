// Archivo: public/js/admin_shared/admin_manual_data_l2.js
// Diccionario Operativo del Manual de Uso para Consola L2 Central Pro (<= 180 líneas)

(function (global) {
  global.AdminManualData = global.AdminManualData || {};
  global.AdminManualData.l2 = [
    {
      id: 'l2-agenda',
      title: '1. Agenda Operativa, Filtros & Turnos Manuales',
      intro: 'Supervisa las reservas de tu local en tiempo real con filtros rápidos, carga manual desde el catálogo y acreditación o cancelación efectiva.',
      subsections: [
        {
          subtitle: 'Operación diaria de turnos',
          steps: [
            'En Agenda Operativa combina filtros temporales (Hoy, Esta Semana, Este Mes, Rango), selector de fecha y estados de turno.',
            'Pulsa Nuevo Turno para agendar citas presenciales o telefónicas seleccionando el servicio del catálogo y si la seña ya fue cobrada.',
            'Desde cada tarjeta puedes acreditar seña, marcar asistencia o ejecutar una cancelación real sincronizada con el Ticket Online del cliente.'
          ]
        }
      ]
    },
    {
      id: 'l2-crm',
      title: '2. CRM & Clientes: Contactos, Cumpleaños, Bloqueo y Restauración',
      intro: 'Administra un directorio único de clientes con importación desde el celular, Email, fecha de cumpleaños, bloqueo preventivo y papelera restaurable.',
      subsections: [
        {
          subtitle: 'Directorio único e importación multicanal',
          steps: [
            'En Clientes y Contactos visualiza tu base filtrando por Activos, Restringidos o Archivados, y registra Email y Fecha de Cumpleaños en cada ficha.',
            'Importa clientes directamente desde Contactos del Celular o mediante carga masiva de archivos .vcf / .csv sin generar duplicados.',
            'Usa Bloquear / Desbloquear en cualquier fila para impedir reservas online de teléfonos restringidos y utiliza Restaurar desde Archivados para recuperar fichas en 1 clic.'
          ]
        }
      ]
    },
    {
      id: 'l2-catalogo',
      title: '3. Catálogo de Servicios, Seña Opcional & Historial de Precios',
      intro: 'Configura prestaciones con duración flexible, exigencia individual de seña web, ordenamiento visual e historial de tarifas.',
      subsections: [
        {
          subtitle: 'Prestaciones, orden y tarifas',
          steps: [
            'En Catálogo Servicios crea o edita prestaciones definiendo importe, Orden (#), duración estándar o personalizada y descripción.',
            'Activa o desactiva Exige seña web por servicio para ofrecer reservas con seña anticipada o confirmación directa sin seña previa.',
            'Revisa el historial de precios para consultar ajustes anteriores y utiliza Archivar con confirmación para resguardar tus estadísticas.'
          ]
        }
      ]
    },
    {
      id: 'l2-horarios',
      title: '4. Horarios, Feriados 2026 por Mes, Vacaciones y Bloqueos',
      intro: 'Organiza turnos corridos o partidos, administra feriados nacionales 2026 mes por mes y gestiona cierres o slots bloqueados.',
      subsections: [
        {
          subtitle: 'Grilla semanal, feriados y slots manuales',
          steps: [
            'En Configuración -> Horarios configura días hábiles o jornada partida (Mañana / Tarde) y usa Copiar Lun a Vie para acelerar la carga.',
            'En Feriados Nacionales 2026 por Mes alterna cada feriado individualmente entre Bloqueado y Abierto según la atención de tu local.',
            'Registra períodos en Cierres Especiales / Vacaciones y administra tus Slots Bloqueados Manualmente dentro de la misma pestaña Horarios.'
          ]
        }
      ]
    },
    {
      id: 'l2-identidad-wa',
      title: '5. Identidad, Cobros Directos, Mensajes & WhatsApp QR',
      intro: 'Define la dirección del local visible en tickets y mensajes estructurados, reglas de seña, recordatorios y conexión QR.',
      subsections: [
        {
          subtitle: 'Dirección, Alias/CBU y confirmación automática',
          steps: [
            'En Configuración -> Identidad completa Nombre del Comercio, Dirección del Local, Alias / CBU / CVU y reglas de seña directa sin intermediarios.',
            'En WhatsApp y Plantillas pulsa Vincular QR para conectar tu línea desde WhatsApp > Dispositivos vinculados en tu celular.',
            'Activa recordatorios automáticos 24 hs y 2 hs antes para reforzar la confirmación de citas y personaliza tus plantillas con vista previa en vivo.'
          ]
        }
      ]
    }
  ];
})(typeof window !== 'undefined' ? window : global);
