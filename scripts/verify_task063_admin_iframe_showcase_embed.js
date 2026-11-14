// Archivo: scripts/verify_task063_admin_iframe_showcase_embed.js
/**
 * 🧪 Test de Certificación QA: Task-063
 * Embebido Real por Iframe de /admin (L1, L2, L3) en Showcase Smartphone,
 * Parámetros embed=true, Aislamiento CSS, Spinner Loader y Ley de 200L.
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

console.log('🧪 Iniciando verificación forense TASK-063...\n');

// 1. showcase_admin_preview.js (Iframe Dinámico & Mapeo de URLs)
console.log('--- 1. showcase_admin_preview.js (Iframe Dinámico & Ley de 200L) ---');
const adminPreviewPath = path.resolve('js/showcase_v11/showcase_admin_preview.js');
assert(fs.existsSync(adminPreviewPath), 'showcase_admin_preview.js existe en js/showcase_v11/');
const adminPreviewContent = fs.readFileSync(adminPreviewPath, 'utf8');
const adminPreviewLines = adminPreviewContent.split('\n').length;
assert(adminPreviewLines < 180, `Cumple Ley de 200L (< 180L umbral): ${adminPreviewLines} líneas`);
assert(adminPreviewContent.includes('iframe'), 'showcase_admin_preview.js contiene elemento <iframe>');
assert(adminPreviewContent.includes('showcase-admin-frame'), 'Iframe posee ID showcase-admin-frame');
assert(adminPreviewContent.includes('admin-iframe-loader'), 'Posee spinner loader admin-iframe-loader');
assert(adminPreviewContent.includes('getAdminUrlForLevel'), 'Exporta o contiene lógica getAdminUrlForLevel');
assert(adminPreviewContent.includes('admin_l1.html?slug=demo-peluqueria&embed=true'), 'Mapeo Nivel 1 a /admin_l1.html?slug=demo-peluqueria&embed=true');
assert(adminPreviewContent.includes('admin_l2.html?slug=demo-central&embed=true'), 'Mapeo Nivel 2 a /admin_l2.html?slug=demo-central&embed=true');
assert(adminPreviewContent.includes('admin_l3.html?slug=demo-staff&embed=true'), 'Mapeo Nivel 3 a /admin_l3.html?slug=demo-staff&embed=true');
assert(adminPreviewContent.includes('h-[540px] sm:h-[580px]'), 'Dimensiones adaptativas h-[540px] sm:h-[580px]');

// 2. Erradicación de HTML simulado anterior en showcase_admin_preview.js
console.log('\n--- 2. Erradicación de Mockup Estático Antiguo ---');
assert(!adminPreviewContent.includes('renderL1View'), 'Erradicado renderL1View estático');
assert(!adminPreviewContent.includes('renderL2View'), 'Erradicado renderL2View estático');
assert(!adminPreviewContent.includes('renderL3View'), 'Erradicado renderL3View estático');
assert(!adminPreviewContent.includes('BBDD MULTI'), 'Erradicado texto simulado de tarjetas L1');

// 3. Verificación de Archivos Admin en public/
console.log('\n--- 3. Integridad de Archivos Admin en public/ ---');
const l1Path = path.resolve('public/admin_l1.html');
const l2Path = path.resolve('public/admin_l2.html');
const l3Path = path.resolve('public/admin_l3.html');
assert(fs.existsSync(l1Path), 'public/admin_l1.html existe');
assert(fs.existsSync(l2Path), 'public/admin_l2.html existe');
assert(fs.existsSync(l3Path), 'public/admin_l3.html existe');

// 4. Aislamiento y CSS Embebido en admin_l1.html
console.log('\n--- 4. Aislamiento y CSS Embebido en admin_l1.html ---');
const l1Content = fs.readFileSync(l1Path, 'utf8');
const unifiedCss = fs.readFileSync(path.resolve('public/css/admin_unified.css'), 'utf8');
assert(l1Content.includes('is-embedded'), 'admin_l1.html detecta y asigna clase is-embedded');
assert(l1Content.includes('embed') || l1Content.includes('window.self !== window.top'), 'admin_l1.html detecta embed=true o iframe embedding');
assert(l1Content.includes('admin_unified.css') && unifiedCss.includes('is-embedded'), 'Aplica hoja de estilos unificada con soporte is-embedded');
assert(unifiedCss.includes('#pinAuthModal') || l1Content.includes('pinAuthModal'), 'Oculta o gestiona modal de PIN en modo embebido');

// 5. Aislamiento y CSS Embebido en admin_l2.html
console.log('\n--- 5. Aislamiento y CSS Embebido en admin_l2.html ---');
const l2Content = fs.readFileSync(l2Path, 'utf8');
assert(l2Content.includes('is-embedded'), 'admin_l2.html detecta y asigna clase is-embedded');
assert(l2Content.includes('embed') || l2Content.includes('window.self !== window.top'), 'admin_l2.html detecta embed=true o iframe embedding');
assert(l2Content.includes('admin_unified.css'), 'admin_l2.html importa hoja de estilos unificada');
assert(l2Content.includes('admin_shell.js') || l2Content.includes('admin-sidebar'), 'admin_l2.html implementa arquitectura de shell unificado');

// 6. Aislamiento y CSS Embebido en admin_l3.html
console.log('\n--- 6. Aislamiento y CSS Embebido en admin_l3.html ---');
const l3Content = fs.readFileSync(l3Path, 'utf8');
assert(l3Content.includes('is-embedded'), 'admin_l3.html detecta y asigna clase is-embedded');
assert(l3Content.includes('embed') || l3Content.includes('window.self !== window.top'), 'admin_l3.html detecta embed=true o iframe embedding');
assert(l3Content.includes('admin_unified.css'), 'admin_l3.html importa hoja de estilos unificada');
assert(l3Content.includes('admin_shell.js') || l3Content.includes('admin-sidebar'), 'admin_l3.html implementa arquitectura de shell unificado');

// 7. Scripts de soporte en public/js/
console.log('\n--- 7. Scripts de Soporte en public/js/ ---');
assert(fs.existsSync(path.resolve('public/js/admin_l1/admin_l1_auth.js')), 'public/js/admin_l1/admin_l1_auth.js existe');
assert(fs.existsSync(path.resolve('public/js/admin_l1/admin_l1_agenda.js')), 'public/js/admin_l1/admin_l1_agenda.js existe');
assert(fs.existsSync(path.resolve('public/js/admin_l3/admin_core.js')), 'public/js/admin_l3/admin_core.js existe');

// 8. showcase_mockup.js & showcase_core.js (Switch Reactivo con Sensorial)
console.log('\n--- 8. showcase_mockup.js & showcase_core.js (Switcher Reactivo) ---');
const mockupContent = fs.readFileSync(path.resolve('js/showcase_v11/showcase_mockup.js'), 'utf8');
assert(mockupContent.includes('renderAdminPreview'), 'showcase_mockup.js invoca renderAdminPreview');
assert(mockupContent.includes('Ver Tu Panel de Dueño'), 'Switcher incluye Ver Tu Panel de Dueño');
const coreContent = fs.readFileSync(path.resolve('js/showcase_v11/showcase_core.js'), 'utf8');
assert(coreContent.includes('setViewMode'), 'showcase_core.js implementa setViewMode con feedback sensorial');

console.log('\n========================================');
console.log(`RESULTADO FINAL: ${passCount} PASSED / ${failCount} FAILED`);
console.log('========================================\n');

if (failCount > 0) {
  process.exit(1);
}

