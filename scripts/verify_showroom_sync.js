// Archivo: scripts/verify_showroom_sync.js
/**
 * 🧪 Test-Driven Validation Script - TASK-035 (Argus QA)
 * Valida la Ley de 200 Líneas, Protocolo PEAC, Sincronización 5 Rubros / 3 Niveles y Eventos.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const filesToAudit = [
  { path: 'js/components/showroom.js', maxLines: 200, commentType: '//' },
  { path: 'css/showroom.css', maxLines: 200, commentType: '/*' },
  { path: 'js/showcase_v11/showcase_state.js', maxLines: 200, commentType: '//' },
  { path: 'js/showcase_v11/showcase_mockup.js', maxLines: 200, commentType: '//' },
  { path: 'js/showcase_v11/showcase_benefits.js', maxLines: 200, commentType: '//' },
  { path: 'js/showcase_v11/showcase_levels.js', maxLines: 200, commentType: '//' },
  { path: 'js/components/funnel.js', maxLines: 200, commentType: '//' },
  { path: 'js/main.js', maxLines: 200, commentType: '//' },
  { path: 'index.html', maxLines: 200, commentType: '<!--' }
];

console.log('🔍 [ARGUS QA] Iniciando certificación TASK-035 (Sincronización Showroom 5 Rubros)...\n');

let allPassed = true;

// 1. Auditoría de Líneas y Protocolo PEAC
console.log('📋 COMPUERTA 1: Protocolo PEAC y Ley de 200 Líneas');
filesToAudit.forEach(file => {
  const fullPath = path.join(rootDir, file.path);
  if (!fs.existsSync(fullPath)) {
    console.error(`  ❌ [FAIL] Archivo no encontrado: ${file.path}`);
    allPassed = false;
    return;
  }
  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  const lineCount = lines.length;

  const firstLine = lines[0].trim();
  const validHeader = firstLine.startsWith(`${file.commentType} Archivo: ${file.path}`);

  if (lineCount <= file.maxLines && validHeader) {
    const alert180 = lineCount > 180 ? '⚠️ (Alerta >180L)' : '';
    console.log(`  ✅ [PASS] ${file.path}: ${lineCount} líneas (< ${file.maxLines}) ${alert180} | Cabecera PEAC válida.`);
    if (lineCount > 180) allPassed = false;
  } else {
    console.error(`  ❌ [FAIL] ${file.path}: ${lineCount} líneas (máx ${file.maxLines}), Cabecera válida: ${validHeader}`);
    allPassed = false;
  }
});

// 2. Auditoría de Estructura de Datos (5 Rubros & 3 Niveles)
console.log('\n📊 COMPUERTA 2: Integridad del Diccionario de Datos (Codi)');
const showroomJs = fs.readFileSync(path.join(rootDir, 'js/components/showroom.js'), 'utf8');
const stateJs = fs.readFileSync(path.join(rootDir, 'js/showcase_v11/showcase_state.js'), 'utf8');

const rubrosRequired = ['barberia', 'gastronomia', 'estetica', 'deportes', 'salud'];
const hasAllRubros = rubrosRequired.every(r => showroomJs.includes(r));
const stateHasAllRubros = ['barberia', 'resto', 'estetica', 'deportes', 'salud'].every(r => stateJs.includes(r));

if (hasAllRubros && stateHasAllRubros) {
  console.log('  ✅ [PASS] 5 rubros comerciales formalizados en SHOWROOM_DATA y ShowcaseState.');
} else {
  console.error('  ❌ [FAIL] Discrepancia en rubros comerciales.');
  allPassed = false;
}

// 3. Auditoría de Transiciones y Estilos Visuales (Atenea)
console.log('\n🎨 COMPUERTA 3: Transiciones Fluida Cross-Fade & UI (Atenea)');
const cssShowroom = fs.readFileSync(path.join(rootDir, 'css/showroom.css'), 'utf8');
const mockupJs = fs.readFileSync(path.join(rootDir, 'js/showcase_v11/showcase_mockup.js'), 'utf8');
const benefitsJs = fs.readFileSync(path.join(rootDir, 'js/showcase_v11/showcase_benefits.js'), 'utf8');

const uiChecks = [
  { name: 'Transición Cross-Fade GPU en CSS (160ms scale 0.98)', test: cssShowroom.includes('showroom-mockup-viewport') && cssShowroom.includes('160ms') && cssShowroom.includes('scale(0.98)') },
  { name: 'Mockup inyecta clase showroom-mockup-viewport', test: mockupJs.includes('showroom-mockup-viewport') },
  { name: 'Tabs superiores con clase .rubro-tab y .active', test: mockupJs.includes('rubro-tab') && cssShowroom.includes('.rubro-tab.active') },
  { name: 'Selector de niveles con clase .level-selector-tab.active', test: cssShowroom.includes('.level-selector-tab.active') },
  { name: 'Burbuja WhatsApp interactiva con clase wa-bubble-preview', test: benefitsJs.includes('wa-bubble-preview') && cssShowroom.includes('.wa-bubble-preview') }
];

uiChecks.forEach(c => {
  if (c.test) {
    console.log(`  ✅ [PASS] ${c.name}`);
  } else {
    console.error(`  ❌ [FAIL] ${c.name}`);
    allPassed = false;
  }
});

// 4. Auditoría de Eventos Reactivos & Sincronización con Funnel
console.log('\n⚡ COMPUERTA 4: Propagación de Eventos y Enlace con #funnel');
const funnelJs = fs.readFileSync(path.join(rootDir, 'js/components/funnel.js'), 'utf8');

const eventChecks = [
  { name: 'showroom.js emite tucured:rubro-selected', test: showroomJs.includes("tucured:rubro-selected") },
  { name: 'showcase_state.js emite tucured:rubro-selected en setRubro()', test: stateJs.includes("tucured:rubro-selected") },
  { name: 'funnel.js escucha tucured:rubro-selected y actualiza selección', test: funnelJs.includes("tucured:rubro-selected") },
  { name: 'AbortController implementado en showroom.js para cleanup seguro', test: showroomJs.includes('AbortController') && showroomJs.includes('abort()') }
];

eventChecks.forEach(c => {
  if (c.test) {
    console.log(`  ✅ [PASS] ${c.name}`);
  } else {
    console.error(`  ❌ [FAIL] ${c.name}`);
    allPassed = false;
  }
});

// 5. Verificación Sintáctica
console.log('\n🧩 COMPUERTA 5: Verificación Sintáctica ES6');
try {
  new Function(showroomJs.replace(/import\s+.*?;/g, '').replace(/export\s+/g, ''));
  console.log('  ✅ [PASS] Sintaxis de js/components/showroom.js verificada sin errores.');
} catch (e) {
  console.error('  ❌ [FAIL] Error de sintaxis en showroom.js:', e.message);
  allPassed = false;
}

console.log('\n-----------------------------------------------------------');
if (allPassed) {
  console.log('🏆 [CERTIFICACIÓN TASK-035 APROBADA AL 100%]');
  console.log('El Showroom interactivo y la sincronización con el Embudo están validados.');
  process.exit(0);
} else {
  console.error('💥 [CERTIFICACIÓN FALLIDA]: Se encontraron anomalías.');
  process.exit(1);
}

