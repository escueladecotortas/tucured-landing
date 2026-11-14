// Archivo: scripts/verify_task068_admin_unification.js
// Test Suite Integral: Unificación Visual Consolas Admin L1, L2 y L3 (TASK-068)
// Protocolo: Nexus OS v11.1 - Argus Gatekeeper (< 180 líneas)

import fs from 'fs';
import path from 'path';
import http from 'http';

let pass = 0;
let fail = 0;

function assert(cond, desc) {
  if (cond) { pass++; console.log(`  [PASS] ${desc}`); }
  else { fail++; console.error(`  [FAIL] ${desc}`); }
}

const root = process.cwd();
const files = [
  'public/css/admin_unified.css',
  'public/js/admin_shared/admin_shell.js',
  'public/admin_l1.html',
  'public/admin_l2.html',
  'public/admin_l3.html',
  'public/js/admin_l2/admin_l2_core.js',
  'public/js/admin_l3/admin_core.js'
];

console.log('\n=============================================================');
console.log('--- TEST SUITE: TASK-068 UNIFICACIÓN VISUAL ADMIN L1/L2/L3 ---');
console.log('=============================================================\n');

// 1. COMPUERTA LEY DE 200 LÍNEAS (< 180L) & INTEGRIDAD PEAC
console.log('1. COMPUERTA LEY DE 200 LÍNEAS (< 180L) & PEAC:');
files.forEach(f => {
  const p = path.join(root, f);
  assert(fs.existsSync(p), `Existe: ${f}`);
  if (fs.existsSync(p)) {
    const lines = fs.readFileSync(p, 'utf8').split('\n').length;
    assert(lines <= 180, `${f} dentro de umbral preventivo (${lines}L <= 180L)`);
  }
});

// 2. COMPUERTA DISEÑO & PALETA WARM STUDIO (LA FACHADA)
console.log('\n2. COMPUERTA DISEÑO & PALETA WARM STUDIO (LA FACHADA):');
const css = fs.readFileSync(path.join(root, 'public/css/admin_unified.css'), 'utf8');
assert(css.includes('--bg-canvas: #FDFBF7'), 'CSS define marfil cálido #FDFBF7 en Tema Día');
assert(css.includes('--color-primary: #800000'), 'CSS define acento primario bordó #800000');
assert(css.includes('--border-subtle: #E8E3D9'), 'CSS define bordes sutiles #E8E3D9');
assert(css.includes('--bg-canvas: #0F1115'), 'CSS define fondo carbón #0F1115 en Modo Noche');
assert(css.includes('--color-primary: #A82222'), 'CSS define acento bordó nítido #A82222 en Modo Noche');
assert(css.includes('.admin-sidebar') && css.includes('width: 250px'), 'Sidebar estandarizada en 250px');
assert(css.includes('.admin-main-content') && css.includes('margin-left: 250px'), 'Área operativa alineada a 250px');

// 3. COMPUERTA TIPOGRAFÍA MODERNA (PLUS JAKARTA SANS & INTER, CERO SERIF)
console.log('\n3. COMPUERTA TIPOGRAFÍA MODERNA & RECURSOS COMPARTIDOS:');
const htmls = ['admin_l1.html', 'admin_l2.html', 'admin_l3.html'].map(name => ({
  name, content: fs.readFileSync(path.join(root, 'public', name), 'utf8')
}));

htmls.forEach(({ name, content }) => {
  assert(content.includes('Plus+Jakarta+Sans') && content.includes('Inter'), `${name} carga Plus Jakarta Sans e Inter`);
  assert(!content.toLowerCase().includes('font-serif') && !content.includes('Playfair'), `${name} libre de tipografías serif`);
  assert(content.includes('/css/admin_unified.css'), `${name} importa CSS unificado`);
  assert(content.includes('/js/admin_shared/admin_shell.js'), `${name} importa Shell JS compartido`);
  assert(content.includes('id="btn-open-sidebar"'), `${name} posee disparador hamburguesa móvil`);
  assert(content.includes('id="admin-sidebar"'), `${name} posee sidebar unificada 250px`);
  assert(content.includes('id="sidebar-backdrop"'), `${name} posee backdrop off-canvas`);
  assert(content.includes('id="btnThemeToggle"'), `${name} posee conmutador Día/Noche`);
  assert(!content.includes('md:hidden fixed bottom-0'), `${name} erradicó barra de navegación inferior`);
});

// 4. COMPUERTA CERO ICONOS EMOJI O ASCII EN BOTONES/HEADERS
console.log('\n4. COMPUERTA CERO ICONOS EMOJI / ASCII (100% SVG):');
const bannedChars = ['📅', '➕', '⭐', '🚫', '💬', '⚡', '💈', '💇‍♀️', '🩺', '🎾'];
htmls.forEach(({ name, content }) => {
  // Verificamos que botones y cabeceras de navegación usen SVG
  const hasSvgInButtons = content.includes('<svg') && content.includes('viewBox="0 0 24 24"');
  assert(hasSvgInButtons, `${name} utiliza iconografía vectorial SVG nativa`);
  const emojiLeaks = bannedChars.filter(char => {
    // Buscar si aparece dentro de etiquetas button o h1/h2
    const regex = new RegExp(`<(button|nav|h1|h2)[^>]*>[^<]*${char}`, 'i');
    return regex.test(content);
  });
  assert(emojiLeaks.length === 0, `${name} libre de emojis en botones y títulos (${emojiLeaks.length} fugas)`);
});

// 5. COMPUERTA INTEGRIDAD DE LÓGICA Y RETENCIÓN DE DOM HOOKS
console.log('\n5. COMPUERTA RETENCIÓN DE DOM HOOKS & COMPATIBILIDAD OPERATIVA:');
const l1 = htmls[0].content;
const l2 = htmls[1].content;
const l3 = htmls[2].content;

// L1 hooks
assert(l1.includes('pinAuthModal') && l1.includes('btn-quick-new-booking') && l1.includes('view-section-citas'), 'L1 preserva hooks clave (auth, new booking, agenda view)');
// L2 hooks
assert(l2.includes('main-view-btn-calendar') && l2.includes('main-view-btn-crm') && l2.includes('main-view-btn-config'), 'L2 preserva botones principales de navegación');
assert(l2.includes('view-section-calendar') && l2.includes('view-section-crm') && l2.includes('view-section-config'), 'L2 preserva secciones de vista');
assert(l2.includes('wa-qr-wizard-modal') && l2.includes('manual-booking-modal') && l2.includes('crm-search-input'), 'L2 preserva modales y buscador CRM');
// L3 hooks
assert(l3.includes('data-rubro="barberia"') && l3.includes('data-rubro="peluqueria_estetica"'), 'L3 preserva selectores data-rubro');
assert(l3.includes('data-tab="agenda"') && l3.includes('data-tab="staff"') && l3.includes('data-tab="resources"'), 'L3 preserva tabs SPA data-tab');
assert(l3.includes('rubro-indicator') && l3.includes('cron-telemetry-badge') && l3.includes('admin-view-root'), 'L3 preserva badges de telemetría y view root');

// 6. COMPUERTA DISPONIBILIDAD HTTP EN VITE (:5174)
console.log('\n6. COMPUERTA DISPONIBILIDAD HTTP EN VITE (:5174):');
const checkUrl = (urlPath) => new Promise(resolve => {
  http.get(`http://localhost:5174${urlPath}`, (res) => {
    assert(res.statusCode === 200, `HTTP 200 OK: ${urlPath}`);
    resolve();
  }).on('error', (err) => {
    assert(false, `Fallo conexión a ${urlPath}: ${err.message}`);
    resolve();
  });
});

await checkUrl('/admin_l1.html?slug=demo-peluqueria');
await checkUrl('/admin_l2.html?slug=demo-central');
await checkUrl('/admin_l3.html?slug=demo-staff');
await checkUrl('/css/admin_unified.css');
await checkUrl('/js/admin_shared/admin_shell.js');

console.log('\n=============================================================');
console.log(`📊 RESULTADO FINAL: ${pass} PASSED / ${fail} FAILED`);
console.log('=============================================================');

if (fail > 0) {
  console.error('\n💥 VETO ACTIVO DE QA: Errores detectados en TASK-068.');
  process.exit(1);
} else {
  console.log('\n🎉 CERTIFICACIÓN QA ARGUS EXITOSA (TASK-068 100% OK)');
  process.exit(0);
}
