// Archivo: scripts/verify_task054_fixed_glass_control.js
/**
 * 🧪 Test-Driven Validation Script - TASK-054: Barra Control Glass Fija (3/2), Segmented Control & Foto Limpia
 * Certificación de Argus QA: Grilla 3/2 sin scroll, Segmented Control de 38px, Foto 100% limpia y Ley de 200L.
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
  'js/components/stage_value_zone.js',
  'js/showcase_v11/showcase_mockup.js',
  'js/showcase_v11/showcase_admin_preview.js'
];

console.log('🔍 [ARGUS QA] Certificación TASK-054: Control Glass Fijo, Segmented Nivel & Foto Limpia...\n');

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

// COMPUERTA 2: Selector de Rubros Glass Fijo (Grilla 3/2 sin scroll)
console.log('\n🏛️ COMPUERTA 2: Selector de Rubros Glass Fijo (Grilla 3/2 Mobile / Fila Desktop)');
const rubrosZoneCode = fs.readFileSync(path.join(rootDir, 'js/components/stage_rubros_zone.js'), 'utf8');
const rubroChecks = [
  { name: 'Erradicación de leyendas "Paso 1:" y "Paso 2:"', test: !rubrosZoneCode.includes('Paso 1:') && !rubrosZoneCode.includes('Paso 2:') },
  { name: 'Erradicación de "Deslizá ↔" y scroll horizontal/overflow', test: !rubrosZoneCode.includes('Deslizá') && !rubrosZoneCode.includes('overflow-x-auto') && !rubrosZoneCode.includes('snap-x') },
  { name: 'Grilla fija adaptativa 3/2 en mobile (grid-cols-6 con col-start-2)', test: rubrosZoneCode.includes('grid-cols-6') && rubrosZoneCode.includes('col-start-2') },
  { name: 'Fila continua armónica en desktop (sm:flex sm:justify-center)', test: rubrosZoneCode.includes('sm:flex') && rubrosZoneCode.includes('sm:justify-center') },
  { name: 'Estilo Glassmorphism translúcido (backdrop-blur-md bg-white/70)', test: rubrosZoneCode.includes('backdrop-blur-md bg-white/70') },
  { name: 'Estado activo tenue y elegante (bg-indigo-50/90 border-indigo-500)', test: rubrosZoneCode.includes('bg-indigo-50/90 border-indigo-500') },
  { name: 'Presencia de los 5 rubros canónicos [Barbería, Gastro, Estética, Deportes, Salud]', test: ['barberia', 'resto', 'estetica', 'deportes', 'salud'].every(r => rubrosZoneCode.includes(r)) }
];
rubroChecks.forEach(c => {
  if (c.test) {
    console.log(`  ✅ [PASS] ${c.name}`);
  } else {
    console.error(`  ❌ [FAIL] ${c.name}`);
    allPassed = false;
  }
});

// COMPUERTA 3: Segmented Control de Nivel Compacto (~38px)
console.log('\n🎛️ COMPUERTA 3: Segmented Control de Nivel Compacto (~38px)');
const segmentChecks = [
  { name: 'Altura ultra-compacta (~38px a 40px: h-[38px] sm:h-10)', test: rubrosZoneCode.includes('h-[38px] sm:h-10') },
  { name: 'Contenedor Segmented Control estilo iOS (inline-flex, bg-slate-200/80 o bg-slate-100/90)', test: rubrosZoneCode.includes('inline-flex') && (rubrosZoneCode.includes('bg-slate-200/80') || rubrosZoneCode.includes('bg-slate-100/90')) },
  { name: '3 Opciones concisas en fila única: Autónomo / Individual, Central Pro / Con Turnos Web, Multi-Equipo / Para Equipos', test: (rubrosZoneCode.includes('Autónomo') || rubrosZoneCode.includes('Individual')) && (rubrosZoneCode.includes('Central Pro') || rubrosZoneCode.includes('Con Turnos Web')) && (rubrosZoneCode.includes('Multi-Equipo') || rubrosZoneCode.includes('Para Equipos')) },
  { name: 'Cero subtítulos largos abultados en la cabecera', test: !rubrosZoneCode.includes('Monousuario, zero backend') }
];
segmentChecks.forEach(c => {
  if (c.test) {
    console.log(`  ✅ [PASS] ${c.name}`);
  } else {
    console.error(`  ❌ [FAIL] ${c.name}`);
    allPassed = false;
  }
});

// COMPUERTA 4: Smartphone con Foto 100% Limpia (Aura Light)
console.log('\n📱 COMPUERTA 4: Smartphone con Foto 100% Limpia (Aura Light)');
const mockupCode = fs.readFileSync(path.join(rootDir, 'js/showcase_v11/showcase_mockup.js'), 'utf8');
const mockupChecks = [
  { name: 'Erradicación de gradientes oscuros sobre la fotografía', test: !mockupCode.includes('from-slate-950') },
  { name: 'Erradicación de nombres de fantasía o títulos sobre la foto', test: !mockupCode.includes('drop-shadow-sm') && !mockupCode.includes('subCategory') },
  { name: 'Fotografía protagónica con esquinas superiores redondeadas', test: mockupCode.includes('rounded-t-[2.1rem]') },
  { name: 'Chasis en Aura Light (bg-slate-50, sin fondos oscuros en cliente)', test: mockupCode.includes('bg-slate-50') && !mockupCode.includes('bg-slate-950') },
  { name: 'Switch de vistas preservado: [ Ver Turnero del Cliente ] | [ Ver Tu Panel de Dueño ]', test: mockupCode.includes('Ver Turnero del Cliente') && mockupCode.includes('Ver Tu Panel de Dueño') }
];
mockupChecks.forEach(c => {
  if (c.test) {
    console.log(`  ✅ [PASS] ${c.name}`);
  } else {
    console.error(`  ❌ [FAIL] ${c.name}`);
    allPassed = false;
  }
});

console.log('\n-----------------------------------------------------------');
if (allPassed) {
  console.log('🏆 [CERTIFICACIÓN TASK-054 EXITOSA AL 100%]');
  console.log('Barra Glass fija 3/2, Segmented Control de 38px y Foto Limpia certificados.');
  process.exit(0);
} else {
  console.error('💥 [CERTIFICACIÓN TASK-054 FALLIDA]: Revisar discrepancias.');
  process.exit(1);
}
