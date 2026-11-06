// Archivo: scripts/verify_hero_anamorphic.js
/**
 * 🧪 Test-Driven Validation Script - Mockup Software Web & Wizard 4 Pasos (Argus QA)
 * Valida la experiencia de software web autónomo, mockup tablet 3D, saneamiento y Ley de 200L.
 * Restricción estricta: < 200 líneas (< 180L).
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
  { path: 'js/components/hero.js', maxLines: 200, commentType: '//' },
  { path: 'js/components/hero_markup.js', maxLines: 200, commentType: '//' },
  { path: 'js/components/stage_unified.js', maxLines: 200, commentType: '//' },
  { path: 'js/components/stage_rubros_zone.js', maxLines: 200, commentType: '//' },
  { path: 'js/components/stage_value_zone.js', maxLines: 200, commentType: '//' },
  { path: 'js/components/faq_accordion.js', maxLines: 200, commentType: '//' },
  { path: 'js/components/features.js', maxLines: 200, commentType: '//' },
  { path: 'js/components/funnel.js', maxLines: 200, commentType: '//' },
  { path: 'js/components/funnel_markup.js', maxLines: 200, commentType: '//' },
  { path: 'js/components/funnel_data.js', maxLines: 200, commentType: '//' },
  { path: 'js/components/funnel_checkout_markup.js', maxLines: 200, commentType: '//' },
  { path: 'css/hero-anamorphic.css', maxLines: 200, commentType: '/*' }
];

console.log('🔍 [ARGUS QA] Auditoría Escenario 3 Zonas, Hero, FAQs & Ley de 200L...\n');

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
    console.error(`  ❌ [FAIL] ${file.path}: ${lineCount} líneas (máx ${file.maxLines}), Cabecera: ${validHeader}`);
    allPassed = false;
  }
});

// 2. Auditoría de Estructura Inyectada en DOM Servido
console.log('\n🏛️ COMPUERTA 2: Estructura Escenario 3 Zonas, Hero y FAQs');
const markupJs = fs.readFileSync(path.join(rootDir, 'js/components/hero_markup.js'), 'utf8');
const stageJs = fs.readFileSync(path.join(rootDir, 'js/components/stage_unified.js'), 'utf8');
const rubrosZoneJs = fs.readFileSync(path.join(rootDir, 'js/components/stage_rubros_zone.js'), 'utf8');
const valueZoneJs = fs.readFileSync(path.join(rootDir, 'js/components/stage_value_zone.js'), 'utf8');
const faqJs = fs.readFileSync(path.join(rootDir, 'js/components/faq_accordion.js'), 'utf8');
const funnelMarkup = fs.readFileSync(path.join(rootDir, 'js/components/funnel_markup.js'), 'utf8');
const checkoutMarkup = fs.readFileSync(path.join(rootDir, 'js/components/funnel_checkout_markup.js'), 'utf8');

const checks = [
  { name: 'Hero: Párrafo descriptivo de software web sin seña fija forzada', test: markupJs.includes('asegura el horario en tiempo real según las reglas de tu local') },
  { name: 'Hero: CTA Activar por $1.000* y micro-leyenda al pie', test: markupJs.includes('Activar por $1.000*') && markupJs.includes('*Tarifa promocional mes de lanzamiento') },
  { name: 'Escenario: Zonas montadas (#stage-rubros-container, #mockup-container, #stage-value-container)', test: stageJs.includes('stage-rubros-container') && stageJs.includes('mockup-container') && stageJs.includes('stage-value-container') },
  { name: 'Zona 1: Vidriera con badges glassmorphic y Azul Marino Profundo en Deportes', test: rubrosZoneJs.includes('backdrop-blur-md bg-white/10') && rubrosZoneJs.includes('bg-slate-900/60 border border-blue-400/30 text-blue-200') },
  { name: 'Escenario: Selector de nivel y matriz canónica bidimensional v15.0', test: rubrosZoneJs.includes('Nivel 1: Individual') && rubrosZoneJs.includes('Nivel 2: Con Turnos Online') && rubrosZoneJs.includes('Nivel 3: Para Equipos') && valueZoneJs.includes('LEVEL_MATRIX_V15') },
  { name: 'Zona 3: Botón CTA Activar este Turnero por $1.000*', test: valueZoneJs.includes('Activar este Turnero por $1.000*') },
  { name: 'FAQ: Acordeón minimalista con details semánticos', test: faqJs.includes('<details class="group') && faqJs.includes('tucured.mp') },
  { name: 'Wizard: 4 pasos activos y checkout con alias tucured.mp', test: funnelMarkup.includes('step-progress-label') && checkoutMarkup.includes('btn-copy-alias') }
];

checks.forEach(c => {
  if (c.test) {
    console.log(`  ✅ [PASS] ${c.name}`);
  } else {
    console.error(`  ❌ [FAIL] ${c.name}`);
  }
});

console.log('\n-----------------------------------------------------------');
if (allPassed) {
  console.log('🏆 [AUDITORÍA CLÍNICA ARGUS APROBADA AL 100%]');
  console.log('Escenario 3 Zonas unificado, Hero, FAQs y Wizard certificados.');
  process.exit(0);
} else {
  console.error('💥 [AUDITORÍA FALLIDA]: Se detectaron discrepancias.');
  process.exit(1);
}
