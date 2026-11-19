// Archivo: public/js/admin_shared/calendar_links.js
// Generador Unificado RFC 5545 (.ics CRLF) y Enlace Google Calendar (L1/L2/L3 + Showroom < 80L)

window.TucuCalendar = (function () {
  const pad = (n) => String(n).padStart(2, '0');

  function fmtUtc(d) {
    return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
  }

  function todayIsoAr() {
    if (window.AdminShell?.localTodayStr) return window.AdminShell.localTodayStr(0);
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function resolveRange(dateStr, timeStr, durationMin = 45) {
    const iso = /^\d{4}-\d{2}-\d{2}$/.test(String(dateStr || '')) ? String(dateStr) : todayIsoAr();
    const m = String(timeStr || '').match(/(\d{1,2}):(\d{2})/);
    const hh = pad(Math.min(23, Math.max(0, parseInt(m?.[1] || '10', 10) || 10)));
    const mm = pad(Math.min(59, Math.max(0, parseInt(m?.[2] || '0', 10) || 0)));
    const dur = Math.max(5, parseInt(durationMin, 10) || 45);
    const start = new Date(`${iso}T${hh}:${mm}:00-03:00`);
    const safeStart = isNaN(start.getTime()) ? new Date() : start;
    const safeEnd = new Date(safeStart.getTime() + dur * 60000);
    return { startUtc: fmtUtc(safeStart), endUtc: fmtUtc(safeEnd), stampUtc: fmtUtc(new Date()) };
  }

  function escapeIcs(str) {
    return String(str || '').replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
  }

  function buildIcsContent(evt = {}) {
    const r = resolveRange(evt.dateStr, evt.timeStr, evt.durationMin);
    const rawUid = evt.uid || `tk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const safeUid = `${String(rawUid).replace(/[^a-zA-Z0-9_.-]/g, '')}@tucured.ar`;
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//TucuRed//Turnero Web//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${safeUid}`,
      `DTSTAMP:${r.stampUtc}`,
      `DTSTART:${r.startUtc}`,
      `DTEND:${r.endUtc}`,
      `SUMMARY:${escapeIcs(evt.title || 'Turno TucuRed')}`,
      `LOCATION:${escapeIcs(evt.location || '')}`,
      `DESCRIPTION:${escapeIcs(evt.description || '')}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ];
    return lines.join('\r\n') + '\r\n';
  }

  function buildGoogleUrl(evt = {}) {
    const r = resolveRange(evt.dateStr, evt.timeStr, evt.durationMin);
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: evt.title || 'Turno TucuRed',
      dates: `${r.startUtc}/${r.endUtc}`,
      details: evt.description || '',
      location: evt.location || '',
      ctz: 'America/Argentina/Tucuman'
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  const api = { lastGeneratedIcs: '', resolveRange, escapeIcs, buildIcsContent, buildGoogleUrl, downloadIcs };

  function downloadIcs(evt = {}, filename = 'turno_tucured.ics') {
    const ics = buildIcsContent(evt);
    api.lastGeneratedIcs = ics;
    try {
      const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob), a = document.createElement('a');
      a.href = url; a.setAttribute('download', filename);
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (_) {}
    return ics;
  }

  return api;
})();
