// Archivo: public/js/admin_shared/admin_manual_data_l3.js
// Diccionario Operativo del Manual de Uso para Consola L3 Multi-Equipo (<= 180 líneas)

(function (global) {
  global.AdminManualData = global.AdminManualData || {};
  global.AdminManualData.l3 = [
    {
      id: 'l3-agenda',
      title: '1. Agenda Multi-Staff, Filtros de Fecha & Sobreturnos',
      intro: 'Coordina múltiples especialistas y sillones/boxes en paralelo desde vistas Grilla o Tabla con filtros temporales integrados.',
      subsections: [
        {
          subtitle: 'Tablero por profesional y control diario',
          steps: [
            'En Agenda Multi-Staff alterna entre vista Por Especialista o Por Recurso Físico, y cambia entre Grilla o Tabla según tu operación.',
            'Usa el selector de fecha en la barra de filtros, las píldoras rápidas (Hoy, Esta Semana, Este Mes, Rango) y el buscador para ubicar citas al instante.',
            'Pulsa Sobreturno para cargar turnos manuales asignando profesional, sillón/box, servicio, fecha y estado de seña acreditada.'
          ]
        }
      ]
    },
    {
      id: 'l3-staff-recursos',
      title: '2. Profesionales, Horarios Partidos & Sillones / Boxes',
      intro: 'Configura especialistas con servicios habilitados, jornada simple o partida (Mañana / Tarde) y recursos físicos del centro.',
      subsections: [
        {
          subtitle: 'Equipo, turnos partidos y recursos físicos',
          steps: [
            'En Personal Humano edita cada profesional para asignar servicios habilitados y sus 7 días laborales; usa Clonar Lun a Vie para replicar horarios.',
            'Marca 2do T. en cualquier día para definir franjas simétricas de Mañana: y Tarde:, sincronizadas al instante con la disponibilidad del Turnero web.',
            'En Sillones / Boxes gestiona consultorios, gabinetes, sillones o canchas; archivar con confirmación conserva intactas las citas históricas.'
          ]
        }
      ]
    },
    {
      id: 'l3-servicios',
      title: '3. Catálogo de Servicios, Seña Opcional & Ordenamiento',
      intro: 'Administra categorías, orden de aparición, duración estándar o personalizada, descripción y exigencia de seña por servicio.',
      subsections: [
        {
          subtitle: 'Catálogo multi-servicio y cobro de seña',
          steps: [
            'Desde Servicios define precios, orden numérico, duración personalizada y descripción visible para tus clientes en el Turnero.',
            'Activa o desactiva Exige seña web de forma individual para combinar prestaciones con seña previa y turnos de confirmación directa.',
            'Las bajas utilizan confirmación segura y registro lógico para mantener íntegras las métricas de tu clínica o salón.'
          ]
        }
      ]
    },
    {
      id: 'l3-contactos',
      title: '4. Contactos & CRM: Celular, Cumpleaños, Bloqueo y Restauración',
      intro: 'Unifica tus clientes con importación desde el celular o .vcf/.csv, Email, fecha de cumpleaños, bloqueo preventivo y papelera restaurable.',
      subsections: [
        {
          subtitle: 'Directorio unificado sin etiquetas artificiales',
          steps: [
            'En Clientes y Contactos filtra por Activos, Restringidos o Archivados y completa Email y Fecha de Cumpleaños en cada ficha.',
            'Importa contactos directamente desde la agenda de tu celular o mediante archivos .vcf / .csv sin duplicar teléfonos.',
            'Usa Bloquear / Desbloquear para restringir reservas web cuando corresponda y recupera clientes archivados en 1 clic con Restaurar.'
          ]
        }
      ]
    },
    {
      id: 'l3-sistema',
      title: '5. Confirmación Automática (2 hs antes), Feriados 2026 & WhatsApp QR',
      intro: 'Evita huecos muertos con confirmación y liberación automática 2 hs antes, administra feriados por mes, bloqueos, dirección y cobros.',
      subsections: [
        {
          subtitle: 'Switch Maestro 2hs, Dirección, Feriados y QR',
          steps: [
            'En Confirmación 2hs gestiona la Confirmación y Liberación Automática con su Switch Maestro superior (sincronizado con Configuración) para activarla o pausarla.',
            'Esta herramienta complementa los recordatorios de WhatsApp revisando respuestas antes del turno y liberando automáticamente los horarios no confirmados.',
            'En Configuración completa Dirección del Local (visible en ticket y mensajes), Alias/CBU, Feriados Nacionales 2026 por mes, bloqueos manuales y vinculación WhatsApp QR.'
          ]
        }
      ]
    }
  ];
})(typeof window !== 'undefined' ? window : global);
