// Archivo: scripts/verify_task055_pure_typography_deploy.js
/**
 * 🧪 Test-Driven Validation Script - TASK-055: Tipografía Pura en Rubros y Despeje de Marcas en Ficha
 * Certificación de Argus QA: Rubros sin emojis, Ficha de Valor sin marcas de fantasía y Ley de 200L.
 * Restricción estricta: < 200 líneas (< 180L) y Protocolo PEAC.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const targetFiles = [
  'js/components/stage_rubros_zone.js',
  'js/components/stage_value_zone.js'
];

console.log('🔍 [ARGUS QA] Certificación TASK-055: Tipografía Pura y Despeje de Ficha...\n');

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

// COMPUERTA 2: Tipografía Pura en Botones de Rubro (Zona 1)
console.log('\n🏛️ COMPUERTA 2: Tipografía Pura en Botones de Rubro (Zona 1)');
const rubrosZoneCode = fs.readFileSync(path.join(rootDir, 'js/components/stage_rubros_zone.js'), 'utf8');
const rubroChecks = [
  { name: 'Erradicación de emojis en el render HTML de botones (${item.emoji} eliminado)', test: !rubrosZoneCode.includes('${item.emoji}') },
  { name: 'Botones con tipografía pura (tracking-tight con item.name)', test: rubrosZoneCode.includes('<span class="tracking-tight">${item.name}</span>') },
  { name: 'Presencia de los 5 rubros canónicos [Barbería, Gastronomía, Estética, Deportes, Salud]', test: ['Barbería', 'Gastronomía', 'Estética', 'Deportes', 'Salud'].every(r => rubrosZoneCode.includes(r)) },
  { name: 'Grilla adaptativa fija 3/2 en mobile preservada (grid-cols-6 con col-start-2)', test: rubrosZoneCode.includes('grid-cols-6') && rubrosZoneCode.includes('col-start-2') }
];
rubroChecks.forEach(c => {
  if (c.test) {
    console.log(`  ✅ [PASS] ${c.name}`);
  } else {
    console.error(`  ❌ [FAIL] ${c.name}`);
    allPassed = false;
  }
});

// COMPUERTA 3: Despeje de Marcas en Ficha de Valor (Zona 3)
console.log('\n🎛️ COMPUERTA 3: Despeje de Marcas en Ficha de Valor (Zona 3)');
const valueZoneCode = fs.readFileSync(path.join(rootDir, 'js/components/stage_value_zone.js'), 'utf8');
const valueChecks = [
  { name: 'Erradicación de marcas de comercio en cabecera de ficha (${curRubro.bizName} eliminado)', test: !valueZoneCode.includes('${curRubro.bizName}') },
  { name: 'Exhibición limpia y soberana de la píldora de nivel', test: valueZoneCode.includes("${matrix.badge.split('•')[0].trim()}") },
  { name: 'Preservación de las 3 Certezas Técnicas de la Matriz v15.0', test: valueZoneCode.includes('LEVEL_MATRIX_V15') && valueZoneCode.includes('matrix.specs.map') }
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
  console.log('🏆 [CERTIFICACIÓN TASK-055 EXITOSA AL 100%]');
  console.log('Tipografía Pura en Rubros y Despeje de Ficha certificados.');
  process.exit(0);
} else {
  console.error('💥 [CERTIFICACIÓN TASK-055 FALLIDA]: Revisar discrepancias.');
  process.exit(1);
}
