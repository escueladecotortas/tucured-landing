// Archivo: scripts/verify_task085_audit_features_inventory.js
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ROOT = path.resolve('.');
const ENGINE = 'C:\\Users\\leola\\Downloads\\tucured-engine';
const FILES = [
  path.join(ROOT, '.agent', 'audit', 'audit_features_l1_l2_l3.md'),
  path.join(ENGINE, '.agent', 'audit', 'audit_features_l1_l2_l3.md'),
  path.join(ROOT, '.agent', 'docs', 'audit_features_l1_l2_l3.md'),
  path.join(ENGINE, '.agent', 'docs', 'audit_features_l1_l2_l3.md')
];

let pass = 0;
let fail = 0;
const ok = (cond, msg) => (cond ? (console.log(`  [PASS] ${msg}`), pass++) : (console.error(`  [FAIL] ${msg}`), fail++));
const sha256 = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex').toUpperCase();

console.log('\n=== AUDITORÍA PEAC & PARIDAD SHA-256: audit_features_l1_l2_l3.md (TASK-085) ===');

for (const filePath of FILES) {
  ok(fs.existsSync(filePath), `Existe en disco: ${filePath}`);
}

const mainPath = FILES[0];
const raw = fs.readFileSync(mainPath, 'utf8');
const lines = raw.split(/\r?\n/);

ok(lines[0].trim() === '// Archivo: .agent/audit/audit_features_l1_l2_l3.md', `Encabezado PEAC exacto en línea 1`);
ok(lines.length <= 180, `Ley de 200L cumplida (${lines.length}L <= 180L)`);

const baseHash = sha256(mainPath);
for (const filePath of FILES.slice(1)) {
  const h = sha256(filePath);
  ok(h === baseHash, `Paridad SHA-256 idéntica (${h.slice(0, 12)}...): ${filePath}`);
}

const REQUIRED_SECTIONS = [
  ['Multi-rubro 6 rubros', /6 rubros canónicos/i],
  ['Aislamiento estricto localStorage', /Particionado estricto en `localStorage`/i],
  ['Turnero Autónomo 3 pasos', /Turnero Autónomo en 3 Pasos/i],
  ['Ticket Online in-place + /t/:token', /Ticket Online In-Place/i],
  ['Carga/reporte de comprobante', /Carga y Reporte de Comprobante/i],
  ['Máquina de 5 estados canónicos', /PENDING_DEPOSIT[\s\S]*CONFIRMED[\s\S]*COMPLETED[\s\S]*CANCELLED[\s\S]*NO_SHOW/],
  ['Cobro de seña directo al alias', /Cobro de Seña Directo al Alias/i],
  ['Toggles de seña y duración por servicio', /Exige seña web/i],
  ['Historial de precios', /priceHistory/i],
  ['Plantillas WhatsApp + Baileys QR', /Plantillas Estructuradas de WhatsApp.*Baileys/i],
  ['Dirección física del local end-to-end', /#cfg-biz-address/i],
  ['Feriados 2026 con excepción individual', /16 feriados en 11 meses/i],
  ['Importador de contactos mamatila + E.164', /\\mamatila[\s\S]*E\.164/i],
  ['Manual de Uso interactivo NFD', /Manual de Uso Interactivo/i],
  ['Matriz L1 Profesional Independiente', /Nivel 1: Profesional Independiente/i],
  ['Matriz L2 Local Multi-Box', /Nivel 2: Local Multi-Box/i],
  ['Matriz L3 Clínica / Salón Multi-Staff', /Nivel 3: Clínica \/ Salón Multi-Staff/i],
  ['Telemetría Cron T-2hs', /Cron T-2hs/i]
];

for (const [label, rx] of REQUIRED_SECTIONS) {
  ok(rx.test(raw), `Cobertura documental verificada: ${label}`);
}

const AUDITED_PATHS = [
  'public/turnero.html', 'public/gestion_turno.html', 'public/admin_l1.html',
  'public/admin_l2.html', 'public/admin_l3.html', 'public/css/admin_unified.css',
  'public/js/admin_shared/admin_booking_engine.js', 'public/js/admin_shared/admin_demo_seed.js',
  'public/js/admin_shared/admin_shell.js', 'public/js/admin_shared/ticket_modal.js',
  'public/js/admin_shared/ticket_portal.js', 'public/js/admin_shared/turnero_app.js',
  'public/js/admin_shared/turnero_catalog.js', 'public/js/admin_shared/admin_holidays.js',
  'public/js/admin_shared/admin_contacts_parser.js', 'public/js/admin_shared/admin_contacts_manager.js',
  'public/js/admin_shared/admin_wa_templates.js', 'public/js/admin_shared/admin_manual_viewer.js',
  'js/showcase_v11/showcase_core.js', 'js/showcase_v11/showcase_state.js'
];

for (const rel of AUDITED_PATHS) {
  ok(fs.existsSync(path.join(ROOT, rel)), `Archivo auditado existente en disco: ${rel}`);
}

console.log('\n--- RECIBO DE HASH SHA-256 ---');
for (const filePath of FILES) {
  console.log(`SHA256 | ${sha256(filePath)} | ${filePath}`);
}
console.log(`\nRESULTADO TASK-085: ${pass}/${pass + fail} PASS | FAIL=${fail}\n`);
process.exit(fail > 0 ? 1 : 0);
