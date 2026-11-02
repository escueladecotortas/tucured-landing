// Archivo: services/baileys_dispatcher.js
/**
 * 🚀 Tucu Red Web V2 - Despachador de Mensajes Baileys (Sandbox First & Local-First)
 * Módulo de encolado, control de jitter humano, sanitización JID y bienvenida empática.
 * Doctrina: PEAC y Ley de 200 Líneas (< 175L).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export const RUBRO_LABELS = {
  barberia: 'Barbería', resto: 'Gastronomía', estetica: 'Estética & Spa',
  deportes: 'Deportes / Pádel', salud: 'Salud & Bienestar'
};

export const LEVEL_LABELS = {
  l1: 'Nivel 1 (Turnero Autónomo Express)',
  l2: 'Nivel 2 (Central Operativa & Agenda Pro)',
  l3: 'Nivel 3 (Multi-Staff & Franquicias)'
};

export function sanitizeArgentineJid(raw) {
  let digits = String(raw || '').replace(/\D/g, '');
  if (digits.startsWith('549')) digits = digits.slice(3);
  else if (digits.startsWith('54')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = digits.slice(1);
  if (digits.length > 10) {
    if (digits.slice(3, 5) === '15') digits = digits.slice(0, 3) + digits.slice(5);
    else if (digits.slice(2, 4) === '15') digits = digits.slice(0, 2) + digits.slice(4);
  }
  const clean10 = digits.slice(0, 10);
  return `549${clean10}@s.whatsapp.net`;
}

export function buildWelcomeMessage(lead) {
  const rubro = RUBRO_LABELS[lead.rubro] || lead.rubro || 'Comercio Local';
  const level = LEVEL_LABELS[lead.level] || lead.level || 'Nivel 2 (Lanzamiento)';
  const horario = lead.horario === 'cortado' ? 'Turno cortado (pausa de siesta)' : 'Horario corrido';

  return [
    `¡Hola, *${lead.nombre}*! 👋 Bienvenido a la red de *Tucu Red*.`,
    '',
    'Tu configuración inicial ha quedado reservada con éxito:',
    `📍 *Localidad:* ${lead.ciudad}`,
    `✂️ *Rubro:* ${rubro}`,
    `🚀 *Plan:* ${level} — *$1.000 ARS (Mes 1 Lanzamiento)*`,
    `⏰ *Ritmo:* ${horario}`,
    '',
    'Nuestro equipo técnico en Tucumán está preparando tu panel y cartel QR.',
    'En breve nos pondremos en contacto para coordinar la entrega y puesta en marcha.',
    '',
    '_Tucu Red • Infraestructura digital transparente sin comisiones_'
  ].join('\n');
}

export function calculateHumanJitter(minMs = 3500, maxMs = 6800) {
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}

export class BaileysDispatcher {
  constructor(opts = {}) {
    this.sandboxMode = opts.sandboxMode ?? (process.env.SANDBOX_MODE !== 'false');
    this.targetMasterJid = sanitizeArgentineJid(opts.targetMaster || '5493814132154');
    this.queuePath = opts.queuePath || path.resolve(rootDir, 'logs/baileys_queue.json');
    this.errorLogPath = opts.errorLogPath || path.resolve(rootDir, 'logs/baileys_errors.log');
    this.maxRetries = opts.maxRetries || 3;
    this._ensureDirectories();
  }

  _ensureDirectories() {
    const logsDir = path.dirname(this.queuePath);
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
    if (!fs.existsSync(this.queuePath)) fs.writeFileSync(this.queuePath, '[]', 'utf8');
  }

  getQueue() {
    try {
      return JSON.parse(fs.readFileSync(this.queuePath, 'utf8') || '[]');
    } catch (_) {
      return [];
    }
  }

  saveQueue(queue) {
    fs.writeFileSync(this.queuePath, JSON.stringify(queue, null, 2), 'utf8');
  }

  enqueue(lead) {
    const queue = this.getQueue();
    const entry = {
      id: `LEAD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      lead,
      recipientJid: sanitizeArgentineJid(lead.whatsapp),
      status: 'queued',
      attempts: 0,
      createdAt: new Date().toISOString()
    };
    queue.push(entry);
    this.saveQueue(queue);
    return entry;
  }

  async dispatch(entryId, opts = {}) {
    const queue = this.getQueue();
    const item = queue.find(q => q.id === entryId);
    if (!item) throw new Error(`Entrada ${entryId} no encontrada en cola.`);

    const messageText = buildWelcomeMessage(item.lead);
    const delayMs = opts.skipDelay ? 0 : calculateHumanJitter();

    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }

    let success = false;
    let lastError = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      item.attempts = attempt;
      try {
        if (opts.simulateError || (!this.sandboxMode && opts.failReal)) {
          throw new Error('Simulación de desconexión de socket Baileys');
        }
        item.status = 'dispatched';
        item.dispatchedAt = new Date().toISOString();
        item.delayAppliedMs = delayMs;
        item.messageId = `BAILEYS_SBX_${Date.now()}`;
        item.renderedPreview = messageText.slice(0, 80) + '...';
        success = true;
        break;
      } catch (err) {
        lastError = err;
        item.status = attempt < this.maxRetries ? 'retrying' : 'failed';
        item.lastError = err.message;
        if (attempt < this.maxRetries) {
          const backoff = Math.pow(2, attempt) * 100;
          await new Promise(resolve => setTimeout(resolve, backoff));
        }
      }
    }

    if (!success) {
      const errEntry = `[${new Date().toISOString()}] Error despachando ${item.id} a ${item.recipientJid}: ${lastError?.message}\n`;
      fs.appendFileSync(this.errorLogPath, errEntry, 'utf8');
    }

    this.saveQueue(queue);
    return { success, item, messageText, delayMs };
  }
}

