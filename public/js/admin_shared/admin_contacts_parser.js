// Archivo: public/js/admin_shared/admin_contacts_parser.js
// Normalización Telefónica Argentina/Tucumán E.164, Parsers VCF/CSV & Contact Picker API (<= 155 líneas)

(function (global) {
  function normalizePhone(rawInput, defaultAreaCode = '381') {
    if (!rawInput) return { raw: '', clean: '', e164: '', whatsapp: '', display: '', isMobile: false, isValid: false };
    const raw = String(rawInput).trim();
    let digits = raw.replace(/\D/g, '');
    if (!digits || digits.length < 6) {
      return { raw, clean: digits, e164: raw, whatsapp: digits, display: raw, isMobile: false, isValid: false };
    }
    let explicitMobile = false;
    if (digits.startsWith('549')) { digits = digits.slice(3); explicitMobile = true; }
    else if (digits.startsWith('54')) digits = digits.slice(2);
    if (digits.startsWith('0')) digits = digits.slice(1);

    let areaCode = defaultAreaCode, localNumber = '', isMobile = explicitMobile;
    if (digits.startsWith('15') && (digits.length === 8 || digits.length === 9)) {
      areaCode = defaultAreaCode; localNumber = digits.slice(2); isMobile = true;
    } else if (digits.length === 7) {
      areaCode = defaultAreaCode; localNumber = digits;
      if (!isMobile) isMobile = digits.startsWith('5') || digits.startsWith('6') || digits.startsWith('3') || digits.startsWith('4');
    } else if (digits.length === 10) {
      areaCode = digits.slice(0, 3); localNumber = digits.slice(3);
      isMobile = true;
    } else if (digits.length > 10 && digits.startsWith(defaultAreaCode)) {
      areaCode = defaultAreaCode; localNumber = digits.slice(defaultAreaCode.length);
      if (localNumber.startsWith('15')) { localNumber = localNumber.slice(2); }
      isMobile = true;
    } else {
      localNumber = digits;
      if (digits.length === 8 || digits.length === 9) isMobile = true;
    }

    const whatsapp = `${isMobile ? `549${areaCode}` : `54${areaCode}`}${localNumber}`;
    const e164 = `+${whatsapp}`;
    const fmtLoc = localNumber.length === 7 ? `${localNumber.slice(0, 3)}-${localNumber.slice(3)}` : localNumber;
    const display = isMobile ? `+54 9 ${areaCode} ${fmtLoc}` : `+54 ${areaCode} ${fmtLoc}`;
    return { raw, clean: `${areaCode}${localNumber}`, e164, whatsapp, display, isMobile, isValid: localNumber.length >= 6 };
  }

  function parseVcf(vcfText) {
    if (!vcfText || typeof vcfText !== 'string') return [];
    const cards = vcfText.split(/BEGIN:VCARD/i).slice(1), contacts = [];
    for (const card of cards) {
      let name = '', phone = '', email = '', birthday = '', notes = '';
      for (const rawLine of card.split(/\r\n|\r|\n/)) {
        const line = rawLine.trim();
        if (/^FN/i.test(line)) name = line.replace(/^FN[^:]*:/i, '').trim();
        else if (!name && /^N/i.test(line)) name = line.replace(/^N[^:]*:/i, '').split(';').map(p => p.trim()).filter(Boolean).reverse().join(' ');
        else if (/^TEL/i.test(line)) { const t = line.replace(/^TEL[^:]*:/i, '').trim(); if (!phone || t.includes('+54') || t.length > phone.length) phone = t; }
        else if (/^EMAIL/i.test(line)) email = line.replace(/^EMAIL[^:]*:/i, '').trim();
        else if (/^BDAY/i.test(line)) { const b = line.replace(/^BDAY[^:]*:/i, '').trim(); if (/^\d{4}-\d{2}-\d{2}/.test(b)) birthday = b.slice(0, 10); }
        else if (/^NOTE/i.test(line)) notes = line.replace(/^NOTE[^:]*:/i, '').trim();
      }
      const norm = normalizePhone(phone);
      if (norm.isValid) contacts.push({ name: name || 'Contacto VCF', phone: norm.e164, phoneE164: norm.e164, rawPhone: phone, norm, email, birthday, notes });
    }
    return contacts;
  }

  function parseCsv(csvText) {
    if (!csvText || typeof csvText !== 'string') return [];
    const lines = csvText.split(/\r\n|\r|\n/).map(l => l.trim()).filter(Boolean);
    if (!lines.length) return [];
    const sep = lines[0].includes(';') ? ';' : ',', splitRow = (r) => r.split(sep).map(c => c.replace(/^["']|["']$/g, '').trim());
    const header = splitRow(lines[0]).map(h => h.toLowerCase());
    const nameIdx = header.findIndex(h => /nombre|name|cliente|contacto/i.test(h));
    const phoneIdx = header.findIndex(h => /tel|phone|cel|whatsapp|movil/i.test(h));
    const emailIdx = header.findIndex(h => /email|correo|mail/i.test(h));
    const bdayIdx = header.findIndex(h => /cumple|birth|nac/i.test(h));
    const noteIdx = header.findIndex(h => /not|obs|comment/i.test(h));
    const startIdx = (nameIdx !== -1 || phoneIdx !== -1) ? 1 : 0, contacts = [];

    for (let i = startIdx; i < lines.length; i++) {
      const cols = splitRow(lines[i]); if (!cols.length) continue;
      let rawName = '', rawPhone = '', rawEmail = '', rawBday = '', rawNotes = '';
      if (phoneIdx !== -1) {
        rawPhone = cols[phoneIdx] || ''; rawName = nameIdx !== -1 ? cols[nameIdx] : (cols[0] || 'Cliente');
        rawEmail = emailIdx !== -1 ? (cols[emailIdx] || '') : '';
        rawBday = bdayIdx !== -1 ? (cols[bdayIdx] || '') : '';
        rawNotes = noteIdx !== -1 ? (cols[noteIdx] || '') : '';
      } else {
        rawPhone = cols.find(c => c.replace(/\D/g, '').length >= 6) || '';
        rawName = cols.find(c => c !== rawPhone && isNaN(Number(c))) || 'Cliente CSV';
      }
      const norm = normalizePhone(rawPhone);
      if (norm.isValid) contacts.push({ name: rawName || 'Cliente CSV', phone: norm.e164, phoneE164: norm.e164, rawPhone, norm, email: rawEmail, birthday: rawBday, notes: rawNotes });
    }
    return contacts;
  }

  function isDevicePickerSupported() {
    return Boolean(typeof navigator !== 'undefined' && navigator.contacts && typeof navigator.contacts.select === 'function');
  }

  async function pickDeviceContacts() {
    if (!isDevicePickerSupported()) throw new Error('Contact Picker API disponible solo en Android / Chrome móvil');
    const rawContacts = await navigator.contacts.select(['name', 'tel'], { multiple: true });
    const results = [];
    for (const c of rawContacts || []) {
      const name = Array.isArray(c.name) ? c.name[0] : (c.name || 'Contacto');
      const phones = Array.isArray(c.tel) ? c.tel : [c.tel];
      for (const p of phones) {
        const norm = normalizePhone(p);
        if (norm.isValid) results.push({ name, phone: norm.e164, phoneE164: norm.e164, rawPhone: p, norm, email: '', birthday: '', notes: 'Agenda del celular' });
      }
    }
    return results;
  }

  function deduplicateContacts(contacts, existingCustomers = []) {
    const existingMap = new Map();
    (existingCustomers || []).filter(c => c && !c.deletedAt).forEach(c => {
      const norm = normalizePhone(c.phoneE164 || c.phone || c.rawPhone || c.id);
      if (norm.isValid) existingMap.set(norm.e164, c);
    });
    const uniqueMap = new Map();
    let duplicatesCount = 0;
    for (const item of contacts || []) {
      const key = item.phoneE164 || item.phone || item.norm?.e164; if (!key) continue;
      if (uniqueMap.has(key)) {
        duplicatesCount++;
        const prev = uniqueMap.get(key);
        if (item.name && item.name.length > prev.name.length && prev.name.startsWith('Contacto')) prev.name = item.name;
        if (item.email && !prev.email) prev.email = item.email;
        if (item.birthday && !prev.birthday) prev.birthday = item.birthday;
        if (item.notes && !prev.notes) prev.notes = item.notes;
      } else {
        const ex = existingMap.get(key);
        uniqueMap.set(key, { ...item, isExisting: Boolean(ex), existingId: ex ? ex.id : null });
      }
    }
    return { unique: Array.from(uniqueMap.values()), duplicatesCount, totalProcessed: (contacts || []).length };
  }

  global.AdminContactsParser = { normalizePhone, parseVcf, parseCsv, isDevicePickerSupported, pickDeviceContacts, deduplicateContacts };
})(typeof window !== 'undefined' ? window : global);
