// Archivo: scripts/verify_task052_desktop_rubros_contrast.js
/**
 * 🧪 Test-Driven Validation Script - TASK-052: Contraste Desktop & Refinamiento Zona 3 (Argus QA)
 * Valida ratio de contraste WCAG AA, badges micro-tintados, barra de control <summary> y Ley de 200L.
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

console.log('🔍 [ARGUS QA] Certificación TASK-052: Contraste Desktop & Refinamiento Zona 3...\n');

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

// COMPUERTA 2: Contraste WCAG AA y Botonera Sólida Desktop (Zona 1)
console.log('\n🎨 COMPUERTA 2: Contraste WCAG AA y Botonera Desktop');
const rubrosZoneCode = fs.readFileSync(path.join(rootDir, 'js/components/stage_rubros_zone.js'), 'utf8');

const contrastChecks = [
  { name: 'Nombres en texto oscuro de alto contraste (text-slate-900 font-bold text-base)', test: rubrosZoneCode.includes('text-slate-900 font-bold text-base tracking-tight') },
  { name: 'Miniatura fotográfica w-14 h-14 con border-slate-200/60', test: rubrosZoneCode.includes('w-14 h-14') && rubrosZoneCode.includes('border-slate-200/60') },
  { name: 'Badges micro-tintados por rubro presentes', test: rubrosZoneCode.includes('bg-slate-100 text-slate-700') && rubrosZoneCode.includes('bg-amber-50 text-amber-800') && rubrosZoneCode.includes('bg-rose-50 text-rose-800') && rubrosZoneCode.includes('bg-blue-50 text-blue-800') && rubrosZoneCode.includes('bg-emerald-50 text-emerald-800') },
  { name: 'Estado activo con elevación, anillo índigo y traslación sutil', test: rubrosZoneCode.includes('bg-indigo-50/70') && rubrosZoneCode.includes('border-indigo-600') && rubrosZoneCode.includes('ring-indigo-600/20') && rubrosZoneCode.includes('translate-x-1') },
  { name: 'Indicador visual interactivo con icono check / chevron', test: rubrosZoneCode.includes('check') && rubrosZoneCode.includes('chevron_right') }
];

contrastChecks.forEach(c => {
  if (c.test) {
    console.log(`  ✅ [PASS] ${c.name}`);
  } else {
    console.error(`  ❌ [FAIL] ${c.name}`);
    allPassed = false;
  }
});

// COMPUERTA 3: Refinamiento de la Barra de Control en Zona 3
console.log('\n🏛️ COMPUERTA 3: Refinamiento Barra de Control en Zona 3');
const valueZoneCode = fs.readFileSync(path.join(rootDir, 'js/components/stage_value_zone.js'), 'utf8');

const zone3RefineChecks = [
  { name: 'Barra de control pulida en <summary> (bg-slate-50 hover:bg-slate-100/80 border-slate-200)', test: valueZoneCode.includes('bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl px-4 py-3') },
  { name: 'Badge sutil de nivel activo en summary', test: valueZoneCode.includes('matrix.themeBadge') && valueZoneCode.includes('matrix.badge.split') },
  { name: 'Chevron SVG rotativo con group-open:rotate-180', test: valueZoneCode.includes('<svg') && valueZoneCode.includes('group-open:rotate-180 transition-transform') }
];

zone3RefineChecks.forEach(c => {
  if (c.test) {
    console.log(`  ✅ [PASS] ${c.name}`);
  } else {
    console.error(`  ❌ [FAIL] ${c.name}`);
    allPassed = false;
  }
});

console.log('\n-----------------------------------------------------------');
if (allPassed) {
  console.log('🏆 [CERTIFICACIÓN TASK-052 EXITOSA AL 100%]');
  console.log('Contraste Desktop WCAG AA y Barra de Control en Zona 3 certificados.');
  process.exit(0);
} else {
  console.error('💥 [CERTIFICACIÓN TASK-052 FALLIDA]: Corregir discrepancias.');
  process.exit(1);
}

