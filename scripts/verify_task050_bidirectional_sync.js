// Archivo: scripts/verify_task050_bidirectional_sync.js
/**
 * 🧪 Test-Driven Validation Script - Sincronización Bidimensional v15.0 (Argus QA)
 * Valida la matriz [Nivel x Rubro], slots bloqueados en L2, recursos en L3 y Ley de 200L.
 * Restricción estricta: < 200 líneas (< 180L).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const auditedFiles = [
  'js/components/stage_value_zone.js',
  'js/showcase_v11/showcase_mockup.js',
  'js/showcase_v11/showcase_admin_preview.js',
  'js/showcase_v11/showcase_templates_l1.js',
  'js/showcase_v11/showcase_templates_l2.js',
  'js/showcase_v11/showcase_templates_l3.js',
  'js/showcase_v11/showcase_state.js'
];

console.log('🔍 [ARGUS QA] Certificación TASK-050: Sincronización Bidimensional v15.0...\n');

let allPassed = true;

// COMPUERTA 1: Protocolo PEAC y Ley de 200L (< 180L)
console.log('📋 COMPUERTA 1: Protocolo PEAC y Ley de 200L (< 180L)');
auditedFiles.forEach(relPath => {
  const fullPath = path.join(rootDir, relPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`  ❌ [FAIL] Archivo ausente: ${relPath}`);
    allPassed = false;
    return;
  }
  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  const lineCount = lines.length;
  const headerOk = lines[0].trim().startsWith(`// Archivo: ${relPath}`);

  if (lineCount <= 180 && headerOk) {
    console.log(`  ✅ [PASS] ${relPath}: ${lineCount}L (< 180L) | PEAC válido.`);
  } else {
    console.error(`  ❌ [FAIL] ${relPath}: ${lineCount}L (máx 180L), Header: ${headerOk}`);
    allPassed = false;
  }
});

// COMPUERTA 2: Integridad Matriz Canónica v15.0 en Zona 3
console.log('\n🏛️ COMPUERTA 2: Integridad Matriz Canónica v15.0 en Zona 3');
const valueZoneCode = fs.readFileSync(path.join(rootDir, 'js/components/stage_value_zone.js'), 'utf8');
const adminPreviewCode = fs.readFileSync(path.join(rootDir, 'js/showcase_v11/showcase_admin_preview.js'), 'utf8');

const zone3Checks = [
  { name: 'Nivel 1 Express en LEVEL_MATRIX_V15', test: valueZoneCode.includes('Turnero Autónomo Express v15.0') && valueZoneCode.includes('Zero Server Runtime') },
  { name: 'Nivel 2 Pro en LEVEL_MATRIX_V15', test: valueZoneCode.includes('Central Operativa & Agenda Pro v15.0') && valueZoneCode.includes('Prevención Activa de Colisiones') },
  { name: 'Nivel 3 Multi-Staff en LEVEL_MATRIX_V15', test: valueZoneCode.includes('Multi-Staff & Franquicias v15.0') && valueZoneCode.includes('Multi-Staff Ilimitado') },
  { name: '3 Micro-métricas de trastienda exactas', test: valueZoneCode.includes('Disponibilidad 100% offline') && valueZoneCode.includes('Ocupación 92%') && valueZoneCode.includes('Cron T-2hs activo') },
  { name: 'Admin Preview soporta KPIs por nivel L1/L2/L3', test: adminPreviewCode.includes('ADMIN_METRICS') && adminPreviewCode.includes('kpis') && adminPreviewCode.includes('turnos') }
];

zone3Checks.forEach(c => {
  if (c.test) {
    console.log(`  ✅ [PASS] ${c.name}`);
  } else {
    console.error(`  ❌ [FAIL] ${c.name}`);
    allPassed = false;
  }
});

// COMPUERTA 3: Simulación Zona 2 (Smartphone Central)
console.log('\n📱 COMPUERTA 3: Simulación Zona 2 (Smartphone Central)');
const templatesL1Code = fs.readFileSync(path.join(rootDir, 'js/showcase_v11/showcase_templates_l1.js'), 'utf8');
const templatesL2Code = fs.readFileSync(path.join(rootDir, 'js/showcase_v11/showcase_templates_l2.js'), 'utf8');
const templatesL3Code = fs.readFileSync(path.join(rootDir, 'js/showcase_v11/showcase_templates_l3.js'), 'utf8');
const mockupCode = fs.readFileSync(path.join(rootDir, 'js/showcase_v11/showcase_mockup.js'), 'utf8');

const zone2Checks = [
  { name: 'L1: Monousuario limpio sin selector de staff', test: !templatesL1Code.includes('selectStaff') },
  { name: 'L2: Horarios con colisión bloqueada (line-through opacity-25)', test: templatesL2Code.includes('line-through') && templatesL2Code.includes('opacity-25') && templatesL2Code.includes('Bloqueado') },
  { name: 'L3: Modelado de recursos (Franco/Lucas, Dra. Mendoza/Dr. Ruiz, Cancha 1/Cancha 2)', test: templatesL3Code.includes('Franco') && templatesL3Code.includes('Lucas') && templatesL3Code.includes('Dra. Mendoza') && templatesL3Code.includes('Cancha 1') && templatesL3Code.includes('Cancha 2') },
  { name: 'L3: Catálogo con duración dinámica (cat.dur)', test: templatesL3Code.includes('cat.dur') },
  { name: 'Mockup: Comprobante Hash #TK-84B2 y autogestión en Paso 3', test: mockupCode.includes('#TK-84B2') && mockupCode.includes('ShowcaseSelfServiceL2') && mockupCode.includes('toggleSelfService') }
];

zone2Checks.forEach(c => {
  if (c.test) {
    console.log(`  ✅ [PASS] ${c.name}`);
  } else {
    console.error(`  ❌ [FAIL] ${c.name}`);
    allPassed = false;
  }
});

console.log('\n-----------------------------------------------------------');
if (allPassed) {
  console.log('🏆 [CERTIFICACIÓN TASK-050 EXITOSA AL 100%]');
  console.log('Sincronización Bidimensional [Nivel x Rubro] certificada por Argus QA.');
  process.exit(0);
} else {
  console.error('💥 [CERTIFICACIÓN TASK-050 FALLIDA]: Corregir discrepancias.');
  process.exit(1);
}
