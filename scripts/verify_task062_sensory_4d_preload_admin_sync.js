// Archivo: scripts/verify_task062_sensory_4d_preload_admin_sync.js
/**
 * 🧪 Test de Certificación QA: Task-062
 * Experiencia Sensorial 4D, Preload WebP, Sincronización Admin L1/L2/L3 y Pulido Editorial.
 */

import fs from 'fs';
import path from 'path';

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failCount++;
  }
}

console.log('🧪 Iniciando verificación forense TASK-062...\n');

// 1. sound_fx.js
console.log('--- 1. sound_fx.js (Haptics & Web Audio Nativo) ---');
const soundFxPath = path.resolve('js/utils/sound_fx.js');
assert(fs.existsSync(soundFxPath), 'sound_fx.js existe en js/utils/');
const soundFxContent = fs.readFileSync(soundFxPath, 'utf8');
const soundFxLines = soundFxContent.split('\n').length;
assert(soundFxLines < 60, `sound_fx.js tiene ${soundFxLines} líneas (< 60L)`);
assert(soundFxContent.includes('AudioContext'), 'sound_fx.js implementa AudioContext');
assert(soundFxContent.includes('650'), 'sound_fx.js oscila en 650Hz');
assert(soundFxContent.includes('0.04'), 'sound_fx.js decay a 0.04s');
assert(soundFxContent.includes('vibrate'), 'sound_fx.js implementa navigator.vibrate(12)');
assert(soundFxContent.includes('triggerSensoryFeedback'), 'Exporta triggerSensoryFeedback()');

// 2. showcase_state.js & Assets WebP
console.log('\n--- 2. showcase_state.js & Preload WebP ---');
const statePath = path.resolve('js/showcase_v11/showcase_state.js');
const stateContent = fs.readFileSync(statePath, 'utf8');
const stateLines = stateContent.split('\n').length;
assert(stateLines < 180, `showcase_state.js tiene ${stateLines} líneas (< 180L)`);
assert(stateContent.includes('preloadShowcaseAssets'), 'showcase_state.js exporta preloadShowcaseAssets()');
const webpAssets = [
  'public/assets/showcase/hero_unas.webp',
  'public/assets/showcase/gastronomia.webp',
  'public/assets/showcase/hero_peluqueria.webp',
  'public/assets/showcase/deportes.webp',
  'public/assets/showcase/hero_salud.webp'
];
webpAssets.forEach(asset => {
  assert(fs.existsSync(path.resolve(asset)), `Asset existe: ${asset}`);
});

// 3. showcase_core.js
console.log('\n--- 3. showcase_core.js (Sensory Hooks & Preload) ---');
const corePath = path.resolve('js/showcase_v11/showcase_core.js');
const coreContent = fs.readFileSync(corePath, 'utf8');
const coreLines = coreContent.split('\n').length;
assert(coreLines < 180, `showcase_core.js tiene ${coreLines} líneas (< 180L)`);
assert(coreContent.includes("import { triggerSensoryFeedback } from '../utils/sound_fx.js'"), 'Importa triggerSensoryFeedback');
assert(coreContent.includes('preloadShowcaseAssets();'), 'Ejecuta preloadShowcaseAssets() en init');
assert(coreContent.includes('selectLevel: (lvl) => {') && coreContent.includes('triggerSensoryFeedback();'), 'selectLevel dispara haptics');
assert(coreContent.includes('selectRubro: (rubro) => {') && coreContent.includes('triggerSensoryFeedback();'), 'selectRubro dispara haptics');

// 4. hero.js (Touch 4D Mobile & Chip Feedback)
console.log('\n--- 4. hero.js (Touch 4D Mobile) ---');
const heroPath = path.resolve('js/components/hero.js');
const heroContent = fs.readFileSync(heroPath, 'utf8');
const heroLines = heroContent.split('\n').length;
assert(heroLines < 180, `hero.js tiene ${heroLines} líneas (< 180L)`);
assert(heroContent.includes('touchstart'), 'hero.js escucha touchstart');
assert(heroContent.includes('touchmove'), 'hero.js escucha touchmove');
assert(heroContent.includes('touchend'), 'hero.js escucha touchend');
assert(heroContent.includes('perspective(800px)'), 'hero.js aplica perspective(800px)');
assert(heroContent.includes('{ passive: true }'), 'hero.js usa passive: true para no bloquear scroll');
assert(heroContent.includes('triggerSensoryFeedback();'), 'hero.js dispara haptic en chips');

// 5. navbar.js (Editorial "Qué Incluye")
console.log('\n--- 5. navbar.js (Editorial "Qué Incluye") ---');
const navPath = path.resolve('js/components/navbar.js');
const navContent = fs.readFileSync(navPath, 'utf8');
const navLines = navContent.split('\n').length;
assert(navLines < 180, `navbar.js tiene ${navLines} líneas (< 180L)`);
assert(navContent.includes('Qué Incluye'), 'navbar.js muestra "Qué Incluye"');
assert(!navContent.includes('Certezas del Sistema'), 'navbar.js erradicó "Certezas del Sistema"');

// 6. pricing.js (Editorial Promesa Configurado)
console.log('\n--- 6. pricing.js (Editorial Promesa Configurado) ---');
const pricingPath = path.resolve('js/components/pricing.js');
const pricingContent = fs.readFileSync(pricingPath, 'utf8');
const pricingLines = pricingContent.split('\n').length;
assert(pricingLines < 180, `pricing.js tiene ${pricingLines} líneas (< 180L)`);
assert(!pricingContent.includes('puesta en marcha guiada en el día'), 'pricing.js erradicó "puesta en marcha guiada en el día"');
assert(pricingContent.includes('0% comisiones por turno. Te lo entregamos 100% configurado y listo para usar, con soporte directo.'), 'pricing.js tiene el copy canónico aprobado');

// 7. stage_value_zone.js (2 Bloques Canónicos)
console.log('\n--- 7. stage_value_zone.js (2 Bloques Canónicos) ---');
const valuePath = path.resolve('js/components/stage_value_zone.js');
const valueContent = fs.readFileSync(valuePath, 'utf8');
const valueLines = valueContent.split('\n').length;
assert(valueLines < 180, `stage_value_zone.js tiene ${valueLines} líneas (< 180L)`);
assert(valueContent.includes('Para tus Clientes'), 'stage_value_zone.js incluye bloque "Para tus Clientes"');
assert(valueContent.includes('Tu Panel de Control (/admin)'), 'stage_value_zone.js incluye bloque "Tu Panel de Control (/admin)"');
assert(valueContent.includes('Turnero web de 3 toques'), 'Detalla Turnero web de 3 toques en L1');
assert(valueContent.includes('Turno partido (siesta)'), 'Detalla Turno partido en L1');
assert(valueContent.includes('Gobernanza CRM Anti-No-Show y Lista VIP'), 'Detalla CRM Anti-No-Show en L2');
assert(valueContent.includes('Barredora Cron automática T-2hs'), 'Detalla Barredora Cron en L3');

// 8. showcase_admin_preview.js (Sincronización L1/L2/L3)
console.log('\n--- 8. showcase_admin_preview.js (Sincronización L1/L2/L3) ---');
const adminPath = path.resolve('js/showcase_v11/showcase_admin_preview.js');
const adminContent = fs.readFileSync(adminPath, 'utf8');
const adminLines = adminContent.split('\n').length;
assert(adminLines < 180, `showcase_admin_preview.js tiene ${adminLines} líneas (< 180L)`);
assert(adminContent.includes('Recepción Online: Abierta'), 'L1 incluye switch de recepción abierta');
assert(adminContent.includes('$15.000'), 'L1 incluye señas ($15.000)');
assert(adminContent.includes('#TK-4821'), 'L1 incluye token hash');
assert(adminContent.includes('+ Turno Mostrador'), 'L2 incluye botón + Turno Mostrador');
assert(adminContent.includes('92%'), 'L2 incluye 92% de ocupación');
assert(adminContent.includes('★ VIP'), 'L2 incluye badge VIP');
assert(adminContent.includes('Lista Negra'), 'L2 incluye badge Lista Negra');
assert(adminContent.includes('⚡ Cron T-2hs Activo'), 'L3 incluye badge Cron T-2hs Activo');
assert(adminContent.includes('STAFF 1: Franco'), 'L3 incluye columna Staff 1');
assert(adminContent.includes('STAFF 2: Lucas'), 'L3 incluye columna Staff 2');

console.log(`\n========================================`);
console.log(`RESULTADO FINAL: ${passCount} PASSED / ${failCount} FAILED`);
console.log(`========================================\n`);

if (failCount > 0) {
  process.exit(1);
}

