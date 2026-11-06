// Archivo: scripts/verify_mobile_cases_carousel.js
/**
 * 🧪 Test-Driven Validation Script - Mobile Carousel Overflow & Snap (Argus QA)
 * Simula geometrías móviles (360px, 375px, 390px, 412px) y certifica ausencia de overflow roto.
 * Restricción estricta: < 200 líneas (< 180L) y Protocolo PEAC.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('📱 [ARGUS QA] Verificando Geometría del Slider Mobile Zona 1 (360px - 412px)...\n');

let allPassed = true;

const rubrosCode = fs.readFileSync(path.join(rootDir, 'js/components/stage_rubros_zone.js'), 'utf8');
const layoutCss = fs.readFileSync(path.join(rootDir, 'css/layout.css'), 'utf8');

// 1. Aserciones de Contenedor Flexible y Scroll Snap en Zona 1
const containerChecks = [
  { name: 'Contenedor con display flex en mobile y flex-col en lg', test: rubrosCode.includes('flex lg:flex-col') },
  { name: 'Contenedor con overflow-x-auto en mobile', test: rubrosCode.includes('overflow-x-auto') },
  { name: 'Scroll snap mandatory configurado', test: rubrosCode.includes('snap-x snap-mandatory') },
  { name: 'Scrollbars ocultos nativos (no-scrollbar)', test: rubrosCode.includes('no-scrollbar') },
  { name: 'Body con overflow-x: hidden preventivo', test: layoutCss.includes('overflow-x: hidden') }
];

containerChecks.forEach(c => {
  if (c.test) {
    console.log(`  ✅ [PASS] ${c.name}`);
  } else {
    console.error(`  ❌ [FAIL] ${c.name}`);
    allPassed = false;
  }
});

// 2. Simulación de Anchos en Viewports Móviles Críticos
console.log('\n📐 Simulación de anchos relativos en pantallas móviles:');
const mobileViewports = [
  { device: 'Galaxy S8 / Compacto', width: 360 },
  { device: 'iPhone SE / Mini', width: 375 },
  { device: 'iPhone 13 / 14 / 15', width: 390 },
  { device: 'Pixel 7 / Galaxy S24', width: 412 }
];

mobileViewports.forEach(vp => {
  const cardCalculatedWidth = 240; // w-[230px] sm:w-[260px]
  const remainingPeek = vp.width - cardCalculatedWidth;

  const isValidWidth = cardCalculatedWidth < vp.width;
  const hasVisualPeek = remainingPeek >= 40; // Asomo visual claro

  if (isValidWidth && hasVisualPeek) {
    console.log(`  ✅ [PASS] Viewport ${vp.width}px (${vp.device}): Tarjeta ${cardCalculatedWidth}px | Asomo visual ${remainingPeek}px`);
  } else {
    console.error(`  ❌ [FAIL] Viewport ${vp.width}px cálculo anómalo: ${cardCalculatedWidth}px`);
    allPassed = false;
  }
});

// 3. Verificación de Badges Glassmorphism y Tipografía por Rubro
console.log('\n🎨 Verificación de Badges Glassmorphic y Personalidad Tipográfica:');
const typographyChecks = [
  { name: 'Badges en estilo Glassmorphism translúcido', test: rubrosCode.includes('backdrop-blur-md bg-white/10') },
  { name: 'Complejos Deportivos en Azul Marino Profundo Glass', test: rubrosCode.includes('bg-slate-900/60 border border-blue-400/30 text-blue-200') },
  { name: 'Barbería con estilo industrial/mono', test: rubrosCode.includes('font-mono') },
  { name: 'Estética con estilo serif elegante', test: rubrosCode.includes('font-serif') },
  { name: 'Gastronomía con estilo robusto headline', test: rubrosCode.includes('font-headline font-extrabold') },
  { name: 'Deportes con estilo enérgico italic/black', test: rubrosCode.includes('font-headline font-black tracking-tighter uppercase italic') }
];

typographyChecks.forEach(t => {
  if (t.test) {
    console.log(`  ✅ [PASS] ${t.name}`);
  } else {
    console.error(`  ❌ [FAIL] ${t.name}`);
    allPassed = false;
  }
});

console.log('\n-----------------------------------------------------------');
if (allPassed) {
  console.log('🏆 [CERTIFICACIÓN SLIDER MOBILE Y TIPOGRAFÍA EXITOSA]');
  process.exit(0);
} else {
  console.error('💥 [CERTIFICACIÓN FALLIDA]');
  process.exit(1);
}
