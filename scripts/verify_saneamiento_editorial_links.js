// Archivo: scripts/verify_saneamiento_editorial_links.js
import fs from 'fs';
import path from 'path';

console.log('=============================================================');
console.log('--- TEST SUITE: SANEAMIENTO EDITORIAL & ENLACES BACKOFFICE ---');
console.log('=============================================================\n');

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${message}`);
  } else {
    console.error(`  [FAIL] ${message}`);
  }
}

const rootDir = process.cwd();

// 1. COMPUERTA LEY DE 200 LÍNEAS (< 180L UMBRAL PREVENTIVO)
console.log('1. COMPUERTA LEY DE 200 LÍNEAS (< 180L) & INTEGRIDAD PEAC:');
const monitoredFiles = [
  'js/components/funnel_data.js',
  'js/components/pricing.js',
  'js/components/stage_value_zone.js',
  'js/showcase_v11/showcase_benefits.js',
  'js/showcase_v11/showcase_state.js',
  'public/admin_l2.html',
  'public/admin_l3.html'
];

monitoredFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  assert(fs.existsSync(filePath), `Archivo existe: ${file}`);
  const lines = fs.readFileSync(filePath, 'utf8').split('\n').length;
  assert(lines <= 180, `${file} cumple umbral preventivo (líneas: ${lines} <= 180L)`);
});

// 2. COMPUERTA SANEAMIENTO EDITORIAL & LENGUAJE DE SOLUCIÓN
console.log('\n2. COMPUERTA SANEAMIENTO EDITORIAL & LENGUAJE DE SOLUCIÓN:');
const funnelData = fs.readFileSync(path.join(rootDir, 'js/components/funnel_data.js'), 'utf8');
assert(!funnelData.includes('despacho wa.me sin backend'), 'funnel_data.js erradicó "despacho wa.me sin backend"');
assert(funnelData.includes('Turnero Autónomo Express'), 'funnel_data.js presenta Nivel 1 canónico');

const pricing = fs.readFileSync(path.join(rootDir, 'js/components/pricing.js'), 'utf8');
assert(!pricing.includes('despacho wa.me sin backend'), 'pricing.js erradicó jerga técnica de despacho');
assert(pricing.includes('Reserva ágil en 4 pasos'), 'pricing.js describe flujo ágil de 4 pasos');
assert(pricing.includes('Comprobante digital #TK'), 'pricing.js describe comprobante digital');
assert(pricing.includes('Gestión Inteligente de Asistencias') || pricing.includes('Gobernanza Anti-No-Show'), 'pricing.js describe gestión inteligente de asistencias');

const stageValue = fs.readFileSync(path.join(rootDir, 'js/components/stage_value_zone.js'), 'utf8');
assert(!stageValue.includes("Base Multitenant 'tucured-clients'"), 'stage_value_zone.js erradicó mención de BBDD técnica');
assert(!stageValue.includes('vía Gateway'), 'stage_value_zone.js erradicó jerga de gateway');

const state = fs.readFileSync(path.join(rootDir, 'js/showcase_v11/showcase_state.js'), 'utf8');
assert(!state.includes('Zero Server Runtime'), 'showcase_state.js erradicó "Zero Server Runtime"');
assert(state.includes('Reserva ágil 24/7 sin esperas'), 'showcase_state.js alineado a lenguaje de solución');

// 3. COMPUERTA TICKET DIGITAL EN BENEFICIOS L1
console.log('\n3. COMPUERTA VISUAL BENEFICIOS L1 (TICKET DIGITAL):');
const benefits = fs.readFileSync(path.join(rootDir, 'js/showcase_v11/showcase_benefits.js'), 'utf8');
assert(!benefits.includes('chat-bubble-tail'), 'showcase_benefits.js erradicó burbuja de chat WhatsApp antigua');
assert(benefits.includes('#TK-71A0'), 'showcase_benefits.js renderiza Ticket Digital #TK-71A0');
assert(benefits.includes('.ics'), 'showcase_benefits.js incluye botón de descarga .ics');
assert(benefits.includes('autogestión'), 'showcase_benefits.js incluye portal de autogestión');

// 4. COMPUERTA ENLACES BACKOFFICE
console.log('\n4. COMPUERTA REPARACIÓN DE ENLACES BACKOFFICE:');
const adminL2 = fs.readFileSync(path.join(rootDir, 'public/admin_l2.html'), 'utf8');
assert(!adminL2.includes('href="/demo_l2_cliente.html"'), 'admin_l2.html erradicó enlace roto a demo_l2_cliente.html');
assert(adminL2.includes('href="/#showroom"'), 'admin_l2.html enlaza Turnero Cliente a /#showroom');
assert(!adminL2.includes('href="/tucu_widgets.html"'), 'admin_l2.html erradicó enlace a tucu_widgets.html');
assert(adminL2.includes('href="/"'), 'admin_l2.html enlaza botón Volver a /');

const adminL3 = fs.readFileSync(path.join(rootDir, 'public/admin_l3.html'), 'utf8');
assert(!adminL3.includes('href="/tucu_widgets.html"'), 'admin_l3.html erradicó enlace a tucu_widgets.html');
assert(adminL3.includes('href="/"'), 'admin_l3.html enlaza botón Volver a /');

console.log('\n=============================================================');
console.log(`📊 RESULTADO FINAL: ${passedTests}/${totalTests} PRUEBAS APROBADAS`);
console.log('=============================================================');

if (passedTests === totalTests) {
  console.log('🎉 CERTIFICACIÓN QA ARGUS EXITOSA (100% OK)');
  process.exit(0);
} else {
  console.error('💥 VETO ACTIVO DE QA: Pruebas fallidas.');
  process.exit(1);
}
