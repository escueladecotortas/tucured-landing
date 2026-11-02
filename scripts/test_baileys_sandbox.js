// Archivo: scripts/test_baileys_sandbox.js
/**
 * 🧪 Test-Driven Validation Script - Sandbox Baileys Dispatcher (Argus QA & Vitalis)
 * Valida sanitización JID, jitter humano, template de bienvenida, cola y resiliencia.
 * Cumplimiento estricto: Ley de 200 Líneas (< 180L) y Protocolo PEAC.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  BaileysDispatcher,
  sanitizeArgentineJid,
  buildWelcomeMessage,
  calculateHumanJitter
} from '../services/baileys_dispatcher.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🩺 [VITALIS & ARGUS] Iniciando Smoke Test Sandbox Baileys (TASK-044)...\n');
let allPassed = true;

// 1. Compuerta 1: Protocolo PEAC y Ley de 200L en services/baileys_dispatcher.js
console.log('📋 COMPUERTA 1: Protocolo PEAC y Ley de 200 Líneas');
const servicePath = path.join(rootDir, 'services/baileys_dispatcher.js');
const serviceContent = fs.readFileSync(servicePath, 'utf8');
const lines = serviceContent.split('\n');
const validHeader = lines[0].trim().startsWith('// Archivo: services/baileys_dispatcher.js');

if (lines.length <= 200 && validHeader) {
  console.log(`  ✅ [PASS] services/baileys_dispatcher.js: ${lines.length}L (< 200L) | Cabecera PEAC válida.`);
} else {
  console.error(`  ❌ [FAIL] Discrepancia en baileys_dispatcher.js: ${lines.length}L, header: ${validHeader}`);
  allPassed = false;
}

// 2. Compuerta 2: Sanitización de JID WhatsApp (Línea Tucu Red: 5493814132154)
console.log('\n📱 COMPUERTA 2: Sanitización JID WhatsApp E.164');
const testJids = [
  { raw: '5493814132154', expected: '5493814132154@s.whatsapp.net' },
  { raw: '3814132154', expected: '5493814132154@s.whatsapp.net' },
  { raw: '+54 9 381 413-2154', expected: '5493814132154@s.whatsapp.net' },
  { raw: '0381-15-413-2154', expected: '5493814132154@s.whatsapp.net' }
];

testJids.forEach(t => {
  const result = sanitizeArgentineJid(t.raw);
  if (result === t.expected) {
    console.log(`  ✅ [PASS] ${t.raw} -> ${result}`);
  } else {
    console.error(`  ❌ [FAIL] ${t.raw} esperó ${t.expected}, obtuvo ${result}`);
    allPassed = false;
  }
});

// 3. Compuerta 3: Jitter Humano Anti-Spam
console.log('\n⏱️ COMPUERTA 3: Cadencia con Jitter Humano (3500ms - 6800ms)');
let jitterOk = true;
for (let i = 0; i < 5; i++) {
  const j = calculateHumanJitter();
  if (j < 3500 || j > 6800) jitterOk = false;
}
if (jitterOk) {
  console.log('  ✅ [PASS] 5 muestras de jitter humano dentro del rango [3500ms, 6800ms].');
} else {
  console.error('  ❌ [FAIL] Jitter humano fuera del rango permitido.');
  allPassed = false;
}

// 4. Compuerta 4: Template de Mensaje Empático y Cero Undefined
console.log('\n📝 COMPUERTA 4: Template de Bienvenida y Cero Undefined');
const sampleLead = {
  nombre: 'Barbería Tucumán Centro',
  ciudad: 'San Miguel de Tucumán',
  rubro: 'barberia',
  level: 'l2',
  horario: 'cortado',
  whatsapp: '5493814132154'
};

const message = buildWelcomeMessage(sampleLead);
const hasUndefined = message.includes('undefined') || message.includes('null') || message.includes('NaN');
const hasRequiredDetails = message.includes('Barbería Tucumán Centro') &&
  message.includes('San Miguel de Tucumán') &&
  message.includes('Barbería') &&
  message.includes('$1.000 ARS (Mes 1 Lanzamiento)') &&
  message.includes('Turno cortado (pausa de siesta)');

if (!hasUndefined && hasRequiredDetails) {
  console.log('  ✅ [PASS] Mensaje generado con éxito sin campos undefined ni placeholders.');
} else {
  console.error('  ❌ [FAIL] El template contiene undefined o carece de datos clave.');
  allPassed = false;
}

// 5. Compuerta 5: Ciclo de Vida de Cola y Despacho Sandbox
console.log('\n⚡ COMPUERTA 5: Encolado, Despacho Sandbox y Resiliencia');
const sandboxQueuePath = path.join(rootDir, 'logs/baileys_queue_test.json');
const sandboxErrorPath = path.join(rootDir, 'logs/baileys_errors_test.log');

if (fs.existsSync(sandboxQueuePath)) fs.unlinkSync(sandboxQueuePath);
if (fs.existsSync(sandboxErrorPath)) fs.unlinkSync(sandboxErrorPath);

const dispatcher = new BaileysDispatcher({
  sandboxMode: true,
  queuePath: sandboxQueuePath,
  errorLogPath: sandboxErrorPath,
  maxRetries: 3
});

// A. Encolar y Despachar Caso Nominal (omitimos delay para el smoke test rápido)
const queuedItem = dispatcher.enqueue(sampleLead);
if (queuedItem.status === 'queued' && queuedItem.recipientJid === '5493814132154@s.whatsapp.net') {
  console.log(`  ✅ [PASS] Lead encolado nominalmente con ID: ${queuedItem.id}`);
} else {
  console.error('  ❌ [FAIL] Error encolando lead.');
  allPassed = false;
}

const dispatchResult = await dispatcher.dispatch(queuedItem.id, { skipDelay: true });
if (dispatchResult.success && dispatchResult.item.status === 'dispatched' && dispatchResult.item.messageId) {
  console.log(`  ✅ [PASS] Despacho sandbox exitoso. MessageId: ${dispatchResult.item.messageId}`);
} else {
  console.error('  ❌ [FAIL] Falló el despacho en sandbox.');
  allPassed = false;
}

// B. Simular Resiliencia ante Desconexión de Socket (Backoff y Logging de Errores)
const failLead = { ...sampleLead, nombre: 'Comercio Fallo Controlado' };
const failItem = dispatcher.enqueue(failLead);
const failResult = await dispatcher.dispatch(failItem.id, { skipDelay: true, simulateError: true });

if (!failResult.success && failResult.item.status === 'failed' && failResult.item.attempts === 3) {
  console.log('  ✅ [PASS] Resiliencia validada: 3 reintentos con backoff agotados.');
} else {
  console.error('  ❌ [FAIL] La resiliencia no ejecutó los reintentos esperados.');
  allPassed = false;
}

if (fs.existsSync(sandboxErrorPath)) {
  const errLog = fs.readFileSync(sandboxErrorPath, 'utf8');
  if (errLog.includes('Simulación de desconexión de socket Baileys')) {
    console.log('  ✅ [PASS] Alerta registrada correctamente en log de errores.');
  } else {
    console.error('  ❌ [FAIL] Log de errores no contiene el mensaje esperado.');
    allPassed = false;
  }
} else {
  console.error('  ❌ [FAIL] Archivo de log de errores no fue creado.');
  allPassed = false;
}

// Limpiar archivos temporales de test
if (fs.existsSync(sandboxQueuePath)) fs.unlinkSync(sandboxQueuePath);
if (fs.existsSync(sandboxErrorPath)) fs.unlinkSync(sandboxErrorPath);

console.log('\n-----------------------------------------------------------');
if (allPassed) {
  console.log('🏆 [SMOKE TEST SANDBOX BAILEYS APROBADO AL 100%]');
  console.log('Despachador Baileys validado en Sandbox con target 5493814132154.');
  process.exit(0);
} else {
  console.error('💥 [SMOKE TEST FALLIDO]: Se detectaron discrepancias.');
  process.exit(1);
}

