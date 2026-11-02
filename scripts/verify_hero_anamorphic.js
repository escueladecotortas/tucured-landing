// Archivo: scripts/verify_hero_anamorphic.js
/**
 * 🧪 Test-Driven Validation Script - Hero Anamórfico 3D Kiro & Audio (Argus QA)
 * Valida la presencia en disco del video Kiro, fallback poster, audio interactivo y compuerta Vite.
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

console.log('🔍 [ARGUS QA] Ejecutando Auditoría Hero Anamórfico 3D (Kiro) & Audio...\n');

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

// 2. Auditoría de Assets Físicos en Disco (Video Kiro + Poster WebP)
console.log('\n🎬 COMPUERTA 2: Assets Físicos Kiro (Video & Poster Fallback)');
const videoPath = path.join(rootDir, 'public/assets/video/kiro_hero_loop.mp4');
const posterPath = path.join(rootDir, 'public/assets/video/kiro_hero_poster.webp');

const assetChecks = [
  { name: 'Video MP4 en public/assets/video/kiro_hero_loop.mp4', test: fs.existsSync(videoPath) && fs.statSync(videoPath).size > 1000000 },
  { name: 'Poster WebP en public/assets/video/kiro_hero_poster.webp', test: fs.existsSync(posterPath) && fs.statSync(posterPath).size > 5000 }
];

assetChecks.forEach(c => {
  if (c.test) {
    console.log(`  ✅ [PASS] ${c.name}`);
  } else {
    console.error(`  ❌ [FAIL] ${c.name}`);
    allPassed = false;
  }
});

// 3. Auditoría de Estructura Inyectada en DOM Servido y Copys Positivos
console.log('\n🏛️ COMPUERTA 3: Estructura DOM Servido (hero_markup.js & hero.js)');
const markupJs = fs.readFileSync(path.join(rootDir, 'js/components/hero_markup.js'), 'utf8');
const heroJs = fs.readFileSync(path.join(rootDir, 'js/components/hero.js'), 'utf8');

const domChecks = [
  { name: 'Escenario anamórfico #hero-stage inyectado en markup', test: markupJs.includes('id="hero-stage"') },
  { name: 'Capa 0: Backlight #hero-ambient-backlight con .hero-backlight-emissive', test: markupJs.includes('id="hero-ambient-backlight"') && markupJs.includes('class="hero-backlight-emissive"') },
  { name: 'Capa 1: Chasis #hero-phone-stage con marco cúbico', test: markupJs.includes('id="hero-phone-stage"') },
  { name: 'Elemento video #kiro-hero-video con loop y poster', test: markupJs.includes('id="kiro-hero-video"') && markupJs.includes('kiro_hero_loop.mp4') && markupJs.includes('kiro_hero_poster.webp') },
  { name: 'Control de audio interactivo #kiro-audio-toggle', test: markupJs.includes('id="kiro-audio-toggle"') && heroJs.includes('video.muted = !video.muted') },
  { name: 'Badge: Tecnología Local de Alta Gama', test: markupJs.includes('Tecnología Local de Alta Gama') },
  { name: 'H1: La tecnología que pone tu negocio a operar con orden y precisión.', test: markupJs.includes('La tecnología que pone tu negocio a operar con') && markupJs.includes('orden y precisión.') },
  { name: 'CTA Primario: Activar por $1.000 (Mes 1) con enlace a #precios', test: markupJs.includes('Activar por $1.000 (Mes 1)') && heroJs.includes('tucured:level-selected') },
  { name: 'Stats Grid Positivo: 24/7, 0% tarifa plana y 100% control directo', test: markupJs.includes('Atención y reservas continuas') && markupJs.includes('Tarifa plana sin comisiones') && markupJs.includes('Control directo en tu celular') },
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
  console.log('Hero Anamórfico 3D de Kiro con Audio Interactivo validado en disco.');
  process.exit(0);
} else {
  console.error('💥 [AUDITORÍA FALLIDA]: Se detectaron discrepancias.');
  process.exit(1);
}
