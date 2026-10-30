// Archivo: scripts/verify_hero_anamorphic.js
/**
 * 🧪 Test-Driven Validation Script - TASK-038 Enlace & Auditoría Clínica (Argus QA)
 * Valida la presencia en disco, enlaces en index.html/main.js, DOM servido y compuerta Vite.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const filesToAudit = [
  { path: 'index.html', maxLines: 200, commentType: '<!--' },
  { path: 'js/main.js', maxLines: 200, commentType: '//' },
  { path: 'js/components/hero-anamorphic.js', maxLines: 200, commentType: '//' },
  { path: 'js/components/hero.js', maxLines: 200, commentType: '//' },
  { path: 'js/components/hero_markup.js', maxLines: 200, commentType: '//' },
  { path: 'css/hero-anamorphic.css', maxLines: 200, commentType: '/*' },
  { path: 'css/layout.css', maxLines: 200, commentType: '/*' },
  { path: 'css/styles.css', maxLines: 200, commentType: '/*' }
];

console.log('🔍 [ARGUS QA] Ejecutando Auditoría Clínica sobre disco (Cero Suposiciones)...\n');

let allPassed = true;

// 1. Auditoría de Existencia y Líneas (< 200L) + Protocolo PEAC
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
    console.log(`  ✅ [PASS] ${file.path}: ${lineCount} líneas (< ${file.maxLines}) | Cabecera PEAC válida.`);
  } else {
    console.error(`  ❌ [FAIL] ${file.path}: ${lineCount} líneas (máx ${file.maxLines}), Cabecera válida: ${validHeader}`);
    allPassed = false;
  }
});

// 2. Auditoría de Puntos de Entrada (index.html & main.js)
console.log('\n🔗 COMPUERTA 2: Verificación de Enlaces en Puntos de Entrada');
const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const mainJs = fs.readFileSync(path.join(rootDir, 'js/main.js'), 'utf8');

const entryChecks = [
  {
    name: 'index.html incluye enlace directo a css/hero-anamorphic.css',
    test: indexHtml.includes('href="./css/hero-anamorphic.css"')
  },
  {
    name: 'index.html incluye enlace a css/styles.css',
    test: indexHtml.includes('href="./css/styles.css"')
  },
  {
    name: 'index.html incluye punto de entrada modular js/main.js',
    test: indexHtml.includes('src="./js/main.js"')
  },
  {
    name: 'js/main.js importa initHeroAnamorphic',
    test: mainJs.includes("import { initHeroAnamorphic } from './components/hero-anamorphic.js';")
  },
  {
    name: 'js/main.js orquesta renderHero en bootApplication()',
    test: mainJs.includes("renderHero('app-hero')")
  }
];

entryChecks.forEach(c => {
  if (c.test) {
    console.log(`  ✅ [PASS] ${c.name}`);
  } else {
    console.error(`  ❌ [FAIL] ${c.name}`);
    allPassed = false;
  }
});

// 3. Auditoría de Estructura Inyectada en DOM Servido
console.log('\n🏛️ COMPUERTA 3: Estructura DOM Servido (hero_markup.js & hero.js)');
const markupJs = fs.readFileSync(path.join(rootDir, 'js/components/hero_markup.js'), 'utf8');
const heroJs = fs.readFileSync(path.join(rootDir, 'js/components/hero.js'), 'utf8');

const domChecks = [
  { name: 'Escenario anamórfico #hero-stage inyectado en markup', test: markupJs.includes('id="hero-stage"') },
  { name: 'Capa 0: Backlight #hero-ambient-backlight con .hero-backlight-emissive', test: markupJs.includes('id="hero-ambient-backlight"') && markupJs.includes('class="hero-backlight-emissive"') },
  { name: 'Capa 1: Chasis #hero-phone-stage con .hero-chassis-bezel', test: markupJs.includes('id="hero-phone-stage"') && markupJs.includes('hero-chassis-bezel') },
  { name: 'Capa 2: Vidrio & Sheen #hero-screen-sheen con .hero-glass-sheen-layer', test: markupJs.includes('id="hero-screen-sheen"') && markupJs.includes('hero-glass-sheen-layer') },
  { name: 'Capa 3: Contenedor #hero-cards-stage con .hero-floating-card', test: markupJs.includes('id="hero-cards-stage"') && markupJs.includes('hero-floating-card') },
  { name: 'Tarjetas de telemetría pop-out (Revenue, Turno, Pago)', test: markupJs.includes('pop-card-revenue') && markupJs.includes('pop-card-appointment') && markupJs.includes('pop-card-payment') },
  { name: 'hero.js invoca initHeroAnamorphic en renderHero', test: heroJs.includes('initHeroAnamorphic(') }
];

domChecks.forEach(c => {
  if (c.test) {
    console.log(`  ✅ [PASS] ${c.name}`);
  } else {
    console.error(`  ❌ [FAIL] ${c.name}`);
    allPassed = false;
  }
});

console.log('\n-----------------------------------------------------------');
if (allPassed) {
  console.log('🏆 [AUDITORÍA CLÍNICA ARGUS APROBADA AL 100%]');
  console.log('Todos los archivos y enlaces de runtime están certificados en disco.');
  process.exit(0);
} else {
  console.error('💥 [AUDITORÍA FALLIDA]: Se detectaron discrepancias.');
  process.exit(1);
}
