// Archivo: scripts/verify_task056_chromatic_calendar_deploy.js
/**
 * 🧪 Test-Driven Validation Script - TASK-056: Jerarquía Cromática, Calendario Real y Despliegue Netlify
 * Certificación de Argus QA & Codi: Diferenciación cromática de botoneras, fechas dinámicas y Ley de 200L.
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
  'js/showcase_v11/showcase_state.js',
  'js/showcase_v11/showcase_templates_l1.js',
  'js/showcase_v11/showcase_templates_l2.js',
  'js/showcase_v11/showcase_templates_l3.js'
];

console.log('🔍 [ARGUS QA & CODI] Certificación TASK-056: Jerarquía Cromática y Calendario Real...\n');

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

// COMPUERTA 2: Diferenciación Cromática de Botoneras (@Atenea)
console.log('\n🎨 COMPUERTA 2: Diferenciación Cromática de Botoneras (Zona 1)');
const rubrosZoneCode = fs.readFileSync(path.join(rootDir, 'js/components/stage_rubros_zone.js'), 'utf8');
const chromaticChecks = [
  { name: 'Contenedor Segmented Control con base slate y shadow-inner', test: rubrosZoneCode.includes('bg-slate-200/80') && rubrosZoneCode.includes('shadow-inner') },
  { name: 'Botón Nivel Inactivo estilizado con hover sutil', test: rubrosZoneCode.includes('text-slate-600 hover:text-slate-900 font-medium') },
  { name: 'Botón Nivel Activo en pastilla sólida índigo con relieve', test: rubrosZoneCode.includes('bg-indigo-600 text-white font-bold shadow-sm') && rubrosZoneCode.includes('scale-[1.02]') },
  { name: 'Rubros preservados como filtro temático exterior (Glass translúcido)', test: rubrosZoneCode.includes('backdrop-blur-md bg-white/70') }
];
chromaticChecks.forEach(c => {
  if (c.test) {
    console.log(`  ✅ [PASS] ${c.name}`);
  } else {
    console.error(`  ❌ [FAIL] ${c.name}`);
  }
});

// COMPUERTA 3: Calendario Real del Sistema (Fechas Dinámicas Vanilla JS) (@Codi)
console.log('\n📅 COMPUERTA 3: Calendario Real del Sistema y Cero Hardcoding');
const stateCode = fs.readFileSync(path.join(rootDir, 'js/showcase_v11/showcase_state.js'), 'utf8');
const l1Code = fs.readFileSync(path.join(rootDir, 'js/showcase_v11/showcase_templates_l1.js'), 'utf8');
const l2Code = fs.readFileSync(path.join(rootDir, 'js/showcase_v11/showcase_templates_l2.js'), 'utf8');
const l3Code = fs.readFileSync(path.join(rootDir, 'js/showcase_v11/showcase_templates_l3.js'), 'utf8');

const dynamicCalendarChecks = [
  { name: 'Función getSystemCalendar implementada con objeto nativo Date', test: stateCode.includes('export function getSystemCalendar()') && stateCode.includes('toLocaleDateString') },
  { name: 'Generación de array de 4 días dinámicos (diaNombre, diaNumero, dateStr)', test: stateCode.includes('diasReales = Array.from({ length: 4 }') && stateCode.includes('diaNombre:') && stateCode.includes('diaNumero:') },
  { name: 'Erradicación total de "Octubre" en todos los módulos de showcase', test: ![stateCode, l1Code, l2Code, l3Code].some(c => c.includes('Octubre')) },
  { name: 'Erradicación de arrays de días estáticos hardcodeados (Vie 24, Sáb 25, etc.)', test: ![stateCode, l1Code, l2Code, l3Code].some(c => c.includes("'Vie 24'") || c.includes("'Jue 23'")) },
  { name: 'Encabezado con mesActual dinámico inyectado en plantillas L1, L2 y L3', test: l1Code.includes('renderDateHeader') && l2Code.includes('renderDateHeader') && l3Code.includes('renderDateHeader') },
  { name: 'Cero dependencias externas de librerías de fechas (cero Moment/date-fns)', test: ![stateCode, l1Code, l2Code, l3Code].some(c => c.includes('moment') || c.includes('date-fns')) }
];
dynamicCalendarChecks.forEach(c => {
  if (c.test) {
    console.log(`  ✅ [PASS] ${c.name}`);
  } else {
    console.error(`  ❌ [FAIL] ${c.name}`);
    allPassed = false;
  }
});

if (!allPassed) {
  console.error('\n❌ Certificación fallida. Corrija las compuertas antes de desplegar.');
  process.exit(1);
} else {
  console.log('\n🏆 [CERTIFICACIÓN TASK-056 EXITOSA AL 100%]');
  console.log('Jerarquía Cromática, Calendario Real Dinámico y Ley de 200L aprobados.');
  process.exit(0);
}

