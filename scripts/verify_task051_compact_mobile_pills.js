// Archivo: scripts/verify_task051_compact_mobile_pills.js
/**
 * 🧪 Test-Driven Validation Script - TASK-051: Compactación Mobile & Menú Desktop (Argus QA)
 * Valida chips de 44px en mobile, despeje desktop, acordeón <details> y Ley de 200L.
 * Restricción estricta: < 200 líneas (< 180L) y Protocolo PEAC.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const targetFiles = [
  'js/components/stage_unified.js',
  'js/components/stage_rubros_zone.js',
  'js/components/stage_value_zone.js'
];

console.log('🔍 [ARGUS QA] Certificación TASK-051: Compactación Mobile y Menú Desktop...\n');

let allPassed = true;

// COMPUERTA 1: Protocolo PEAC y Ley de 200L (< 180L)
console.log('📋 COMPUERTA 1: Protocolo PEAC y Ley de 200L (< 180L)');
targetFiles.forEach(relPath => {
  const fullPath = path.join(rootDir, relPath);
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

// COMPUERTA 2: Cabecera y Copy Real en stage_unified.js
console.log('\n🏛️ COMPUERTA 2: Cabecera y Copy Real');
const stageUnifiedCode = fs.readFileSync(path.join(rootDir, 'js/components/stage_unified.js'), 'utf8');
const unifiedChecks = [
  { name: 'Erradicación de tag flotante "Simulador Interactivo v15.0"', test: !stageUnifiedCode.includes('Simulador Interactivo v15.0') },
  { name: 'Copy directo y concreto de bajada', test: stageUnifiedCode.includes('Elegí tu rubro para probar cómo tus clientes reservan turno en segundos y cómo se ve tu panel de control.') }
];
unifiedChecks.forEach(c => {
  if (c.test) {
    console.log(`  ✅ [PASS] ${c.name}`);
  } else {
    console.error(`  ❌ [FAIL] ${c.name}`);
    allPassed = false;
  }
});

// COMPUERTA 3: Menú Desktop Minimalista y Píldoras Mobile 44px
console.log('\n🎨 COMPUERTA 3: Menú Desktop Despejado y Píldoras Mobile');
const rubrosZoneCode = fs.readFileSync(path.join(rootDir, 'js/components/stage_rubros_zone.js'), 'utf8');
const rubroChecks = [
  { name: 'Mobile: Tira de chips de 44px (h-11) en fila única', test: rubrosZoneCode.includes('h-11') && rubrosZoneCode.includes('rounded-full') },
  { name: 'Mobile: Presencia de emojis en chips (💈, 🍖, 💅, 🎾, 🩺)', test: rubrosZoneCode.includes('💈') && rubrosZoneCode.includes('🍖') && rubrosZoneCode.includes('💅') && rubrosZoneCode.includes('🎾') && rubrosZoneCode.includes('🩺') },
  { name: 'Desktop: Erradicación de nombres de fantasía ("The Barber Club")', test: !rubrosZoneCode.includes('The Barber Club') },
  { name: 'Desktop: Erradicación de localidades ("Yerba Buena", "Barrio Norte")', test: !rubrosZoneCode.includes('Yerba Buena') && !rubrosZoneCode.includes('Barrio Norte') },
  { name: 'Desktop: Erradicación de enlaces secundarios ("Ver simulación")', test: !rubrosZoneCode.includes('Ver simulación') }
];
rubroChecks.forEach(c => {
  if (c.test) {
    console.log(`  ✅ [PASS] ${c.name}`);
  } else {
    console.error(`  ❌ [FAIL] ${c.name}`);
    allPassed = false;
  }
});

// COMPUERTA 4: Ficha Técnica Colapsable <details> y CTA Directo
console.log('\n📱 COMPUERTA 4: Ficha Técnica Colapsable y Accesibilidad CTA');
const valueZoneCode = fs.readFileSync(path.join(rootDir, 'js/components/stage_value_zone.js'), 'utf8');
const valueChecks = [
  { name: 'Acordeón colapsable nativo <details class="group">', test: valueZoneCode.includes('<details class="group') },
  { name: 'Summary con texto "Ver especificaciones técnicas del nivel ▾"', test: valueZoneCode.includes('Ver especificaciones técnicas del nivel ▾') },
  { name: 'Selector de potencia L1/L2/L3 compacto conservado', test: valueZoneCode.includes('L1 Express') && valueZoneCode.includes('L2 Pro') && valueZoneCode.includes('L3 Multi-Staff') },
  { name: 'CTA "Activar este Turnero por $1.000*" inmediatamente accesible', test: valueZoneCode.includes('Activar este Turnero por $1.000*') }
];
valueChecks.forEach(c => {
  if (c.test) {
    console.log(`  ✅ [PASS] ${c.name}`);
  } else {
    console.error(`  ❌ [FAIL] ${c.name}`);
    allPassed = false;
  }
});

console.log('\n-----------------------------------------------------------');
if (allPassed) {
  console.log('🏆 [CERTIFICACIÓN TASK-051 EXITOSA AL 100%]');
  console.log('Compactación Mobile, Píldoras de Rubro y Despeje Desktop certificados.');
  process.exit(0);
} else {
  console.error('💥 [CERTIFICACIÓN TASK-051 FALLIDA]: Corregir discrepancias.');
  process.exit(1);
}

