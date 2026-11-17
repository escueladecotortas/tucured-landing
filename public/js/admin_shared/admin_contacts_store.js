// Archivo: public/js/admin_shared/admin_contacts_store.js
// Persistencia Canónica Firestore-Ready de Clientes, Bloqueo y Restauración (<= 140 líneas)

(function (global) {
  const parser = () => global.AdminContactsParser;
  const readJson = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch (_) { return fb; } };
  const writeJson = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} };
  const getKey = (lvl, rubro) => `tucu_${lvl}_contacts_${rubro}`;
  const getDelKey = (lvl, rubro) => `tucu_${lvl}_contacts_deleted_${rubro}`;

  function toCanon(rec, normObj) {
    const now = new Date().toISOString();
    const e164 = normObj?.isValid ? normObj.e164 : (rec.phoneE164 || rec.phone || '');
    return {
      id: rec.id || e164 || ('ct-' + Date.now()),
      name: String(rec.name || 'Cliente').trim(),
      phone: e164,
      phoneE164: e164,
      displayPhone: normObj?.display || rec.displayPhone || e164,
      email: String(rec.email || '').trim(),
      birthday: String(rec.birthday || '').trim(),
      notes: String(rec.notes || '').trim(),
      source: rec.source || 'Manual',
      isRestricted: Boolean(rec.isRestricted),
      deletedAt: rec.deletedAt || null,
      createdAt: rec.createdAt || now,
      updatedAt: rec.updatedAt || now
    };
  }

  function loadAll(lvl, rubro) {
    const stored = readJson(getKey(lvl, rubro), []);
    const legacyDel = new Set(readJson(getDelKey(lvl, rubro), []));
    const map = new Map();
    const put = (raw, fromBooking = false) => {
      const normObj = parser()?.normalizePhone?.(raw.phoneE164 || raw.phone || '');
      const key = normObj?.isValid ? normObj.e164 : (raw.id || raw.name);
      if (!key) return;
      if (fromBooking && map.has(key)) return;
      const rec = toCanon(raw, normObj);
      if (legacyDel.has(key) || legacyDel.has(rec.id)) rec.deletedAt = rec.deletedAt || new Date().toISOString();
      map.set(key, rec);
    };
    (Array.isArray(stored) ? stored : []).forEach(c => c && put(c, false));
    const bks = readJson(`tucu_${lvl}_bookings_${rubro}`, []);
    (Array.isArray(bks) ? bks : []).filter(b => b && !b.deletedAt && (b.phone || b.clientPhone)).forEach(b => {
      put({ id: '', name: b.client || b.clientName || 'Cliente', phone: b.phone || b.clientPhone, notes: 'Detectado desde reservas', source: 'Reserva' }, true);
    });
    return Array.from(map.values());
  }

  function saveRecord(lvl, rubro, data) {
    const norm = parser()?.normalizePhone?.(data.phone);
    if (!data.name || !norm?.isValid) return { ok: false, error: 'Ingresa nombre y un teléfono válido' };
    const stored = readJson(getKey(lvl, rubro), []), now = new Date().toISOString();
    const delSet = new Set(readJson(getDelKey(lvl, rubro), []));
    delSet.delete(norm.e164); if (data.id) delSet.delete(data.id);
    writeJson(getDelKey(lvl, rubro), Array.from(delSet));
    const idx = stored.findIndex(c => (data.id && c.id === data.id) || c.phoneE164 === norm.e164 || c.phone === norm.e164);
    const prev = idx !== -1 ? stored[idx] : null;
    const rec = toCanon({
      ...(prev || {}), id: data.id || prev?.id || norm.e164, name: data.name, phone: norm.e164,
      email: data.email, birthday: data.birthday, notes: data.notes,
      source: prev?.source && prev.source !== 'Reserva' ? prev.source : 'Manual',
      isRestricted: prev?.isRestricted ?? false, deletedAt: null, createdAt: prev?.createdAt || now, updatedAt: now
    }, norm);
    if (idx !== -1) stored[idx] = rec; else stored.unshift(rec);
    writeJson(getKey(lvl, rubro), stored);
    return { ok: true, record: rec };
  }

  function mutateById(lvl, rubro, id, mutator) {
    const all = loadAll(lvl, rubro), stored = readJson(getKey(lvl, rubro), []);
    const target = all.find(c => c.id === id || c.phoneE164 === id || c.phone === id);
    if (!target) return null;
    const updated = mutator({ ...target, updatedAt: new Date().toISOString() });
    const idx = stored.findIndex(c => c.id === updated.id || c.phoneE164 === updated.phoneE164);
    if (idx !== -1) stored[idx] = updated; else stored.unshift(updated);
    writeJson(getKey(lvl, rubro), stored);
    if (!updated.deletedAt) {
      const delSet = new Set(readJson(getDelKey(lvl, rubro), []));
      delSet.delete(updated.id); delSet.delete(updated.phoneE164);
      writeJson(getDelKey(lvl, rubro), Array.from(delSet));
    }
    return updated;
  }

  function importBatch(lvl, rubro, rawContacts) {
    const current = loadAll(lvl, rubro).filter(c => !c.deletedAt);
    const { unique, duplicatesCount } = parser().deduplicateContacts(rawContacts, current);
    if (!unique.length) return { ok: false, added: 0, updated: 0, duplicatesCount };
    const stored = readJson(getKey(lvl, rubro), []), delSet = new Set(readJson(getDelKey(lvl, rubro), []));
    const now = new Date().toISOString();
    let added = 0, updated = 0;
    for (const item of unique) {
      delSet.delete(item.phone);
      const id = item.existingId || item.phone, src = item.notes === 'Agenda del celular' ? 'Celular' : 'Archivo';
      const idx = stored.findIndex(c => c.id === id || c.phoneE164 === item.phone || c.phone === item.phone);
      if (idx !== -1) {
        const prev = stored[idx];
        const keepName = prev.name && !/^(Cliente|Contacto)/i.test(prev.name) ? prev.name : item.name;
        stored[idx] = toCanon({ ...prev, name: keepName, email: prev.email || item.email, birthday: prev.birthday || item.birthday, notes: prev.notes || item.notes, source: prev.source || src, deletedAt: null, updatedAt: now }, item.norm);
        updated++;
      } else {
        stored.unshift(toCanon({ id, name: item.name, phone: item.phone, email: item.email, birthday: item.birthday, notes: item.notes || 'Importado', source: src, createdAt: now, updatedAt: now }, item.norm));
        added++;
      }
    }
    writeJson(getDelKey(lvl, rubro), Array.from(delSet)); writeJson(getKey(lvl, rubro), stored);
    return { ok: true, added, updated, duplicatesCount };
  }

  function isRestrictedPhone(lvl, rubro, rawPhone) {
    const norm = parser()?.normalizePhone?.(rawPhone);
    if (!norm?.isValid) return false;
    const keys = new Set([getKey(lvl, rubro)]);
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i) || '';
        if (k.startsWith(`tucu_${lvl}_contacts_`) && !k.includes('_deleted_')) keys.add(k);
      }
    } catch (_) {}
    for (const k of keys) {
      const list = readJson(k, []);
      if (Array.isArray(list) && list.some(c => c && !c.deletedAt && c.isRestricted && (c.phoneE164 === norm.e164 || c.phone === norm.e164))) return true;
    }
    return false;
  }

  global.AdminContactsStore = { loadAll, saveRecord, mutateById, importBatch, isRestrictedPhone };
})(typeof window !== 'undefined' ? window : global);
