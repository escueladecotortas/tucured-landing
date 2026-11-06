// Archivo: scripts/verify_task057_matrix16_admin_clean_checkout.js
/**
 * 🧪 Test de Certificación QA: Matriz v16, Admin L1 Limpio y Checkout Zero-Friction
 * Tarea: [TASK-057] (Nexus OS v11.1)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const landingRoot = path.resolve(__dirname, '..');
const engineRoot = path.resolve(landingRoot, '../tucured-engine');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
  }
}

console.log('\n======================================================');
console.log('🛡️  SUITE DE VERIFICACIÓN QA: TASK-057 (MATRIZ V16 & CHECKOUT)');
console.log('======================================================\n');

// 1. Verificación de Ley de 200L (< 180L) y PEAC
const filesToCheck = [
  { p: path.join(engineRoot, 'public/js/admin_l1/admin_l1_core.js'), max: 180, expectedHeader: '// Archivo: public/js/admin_l1/admin_l1_core.js' },
  { p: path.join(engineRoot, 'public/js/admin_l1/admin_l1_pricing.js'), max: 180, expectedHeader: '// Archivo: public/js/admin_l1/admin_l1_pricing.js' },
  { p: path.join(engineRoot, 'public/js/admin_l1/admin_l1_config.js'), max: 180, expectedHeader: '// Archivo: public/js/admin_l1/admin_l1_config.js' },
  { p: path.join(engineRoot, 'backend/services/TenantFirestoreService.js'), max: 180, expectedHeader: '// Archivo: backend/services/TenantFirestoreService.js' },
  { p: path.join(landingRoot, 'js/components/funnel_checkout_markup.js'), max: 180, expectedHeader: '// Archivo: js/components/funnel_checkout_markup.js' },
  { p: path.join(landingRoot, 'js/components/funnel.js'), max: 180, expectedHeader: '// Archivo: js/components/funnel.js' },
  { p: path.join(landingRoot, 'js/components/stage_value_zone.js'), max: 180, expectedHeader: '// Archivo: js/components/stage_value_zone.js' },
  { p: path.join(landingRoot, 'js/components/pricing.js'), max: 180, expectedHeader: '// Archivo: js/components/pricing.js' },
  { p: path.join(engineRoot, 'public/admin_l1.html'), max: 180, expectedHeader: '<!-- Archivo: public/admin_l1.html -->' }
];

console.log('📌 1. Ley de 200L (< 180L) y Protocolo PEAC:');
filesToCheck.forEach(f => {
  const exists = fs.existsSync(f.p);
  const rel = path.basename(f.p);
  assert(exists, `Archivo existe: ${rel}`);
  if (exists) {
    const content = fs.readFileSync(f.p, 'utf8');
    const lines = content.split('\n').length;
    assert(lines <= f.max, `${rel} cumple Ley de 200L (${lines} líneas <= ${f.max}L)`);
    const firstLine = content.split('\n')[0].trim();
    assert(firstLine === f.expectedHeader, `${rel} tiene cabecera PEAC válida: '${firstLine}'`);
  }
});

// 2. Descontaminación de Admin L1: Ninguna referencia fija a Lucía Juárez como default
console.log('\n📌 2. Descontaminación de Admin L1:');
const adminCoreContent = fs.readFileSync(path.join(engineRoot, 'public/js/admin_l1/admin_l1_core.js'), 'utf8');
assert(!adminCoreContent.includes("slug: 'lucia-juarez'"), "admin_l1_core.js no tiene 'lucia-juarez' en DEFAULT_CONFIG");
assert(adminCoreContent.includes("slug: 'demo-peluqueria'") || adminCoreContent.includes("slug: 'mi-comercio'"), "admin_l1_core.js tiene default neutral");

const adminPricingContent = fs.readFileSync(path.join(engineRoot, 'public/js/admin_l1/admin_l1_pricing.js'), 'utf8');
assert(!adminPricingContent.includes("Diseño y Perfilado de Cejas"), "admin_l1_pricing.js no tiene servicios de estética quemados como default");
assert(adminPricingContent.includes("Corte Clásico") || adminPricingContent.includes("Atención Estándar"), "admin_l1_pricing.js contiene servicios neutros");

const adminConfigContent = fs.readFileSync(path.join(engineRoot, 'public/js/admin_l1/admin_l1_config.js'), 'utf8');
assert(!adminConfigContent.includes("alias: 'lucia.juarez.mp'"), "admin_l1_config.js no tiene 'lucia.juarez.mp'");
assert(adminConfigContent.includes("alias: 'peluqueria.central.mp'") || adminConfigContent.includes("alias: 'tucured.mp'"), "admin_l1_config.js usa alias neutral u oficial");

const tenantServiceContent = fs.readFileSync(path.join(engineRoot, 'backend/services/TenantFirestoreService.js'), 'utf8');
assert(!tenantServiceContent.includes("'Lucía Juárez Beauty Studio'"), "TenantFirestoreService.js no quema 'Lucía Juárez' como fallback");
assert(tenantServiceContent.includes("alias: assets.alias || 'tucured.mp'"), "TenantFirestoreService.js usa 'tucured.mp' como fallback");

const adminHtmlContent = fs.readFileSync(path.join(engineRoot, 'public/admin_l1.html'), 'utf8');
assert(!adminHtmlContent.includes("Lucía Juárez"), "admin_l1.html no tiene 'Lucía Juárez' hardcodeado");

// 3. Checkout Zero-Friction y Wizard
console.log('\n📌 3. Reingeniería Wizard Paso 4 (Checkout):');
const checkoutMarkupContent = fs.readFileSync(path.join(landingRoot, 'js/components/funnel_checkout_markup.js'), 'utf8');
assert(checkoutMarkupContent.includes('checkout-summary-name'), 'funnel_checkout_markup.js incluye checkout-summary-name');
assert(checkoutMarkupContent.includes('checkout-summary-city'), 'funnel_checkout_markup.js incluye checkout-summary-city');
assert(checkoutMarkupContent.includes('checkout-summary-rubro'), 'funnel_checkout_markup.js incluye checkout-summary-rubro');
assert(checkoutMarkupContent.includes('checkout-summary-level'), 'funnel_checkout_markup.js incluye checkout-summary-level');
assert(checkoutMarkupContent.includes('Ya transferí $1.000 • Activar mi local'), 'funnel_checkout_markup.js incluye botón contundente de activación');
assert(checkoutMarkupContent.includes('Pagar con tarjeta o saldo de Mercado Pago (Link directo)'), 'funnel_checkout_markup.js incluye link directo secundario MP');

const funnelJsContent = fs.readFileSync(path.join(landingRoot, 'js/components/funnel.js'), 'utf8');
assert(funnelJsContent.includes('slugify'), 'funnel.js implementa generación canónica de slug');
assert(funnelJsContent.includes('turneroLink'), 'funnel.js genera enlace directo al turnero público');
assert(funnelJsContent.includes('adminLink'), 'funnel.js genera enlace directo al panel admin');

// 4. Sincronización de Textos con Matriz v16
console.log('\n📌 4. Sincronización Landing con Matriz v16:');
const stageValueContent = fs.readFileSync(path.join(landingRoot, 'js/components/stage_value_zone.js'), 'utf8');
assert(stageValueContent.includes('LEVEL_MATRIX_V16'), 'stage_value_zone.js define matriz v16');
assert(stageValueContent.includes('Bloqueo automático de turnos ocupados en tiempo real'), 'stage_value_zone.js comunica bloqueo en tiempo real en L1');
assert(stageValueContent.includes('Hash #TK-XXXX'), 'stage_value_zone.js comunica token hash en L1');

const pricingContent = fs.readFileSync(path.join(landingRoot, 'js/components/pricing.js'), 'utf8');
assert(pricingContent.includes("Turnero Autónomo Completo"), 'pricing.js titula L1 como Turnero Autónomo Completo');
assert(pricingContent.includes("tucured-clients con bloqueo en tiempo real"), 'pricing.js destaca bloqueo en tiempo real en L1');

// 5. Matriz Canónica turneros_v15_matrix.md
console.log('\n📌 5. Matriz Canónica turneros_v15_matrix.md:');
const matrixDoc = fs.readFileSync(path.join(landingRoot, '.agent/specs/turneros_v15_matrix.md'), 'utf8');
assert(matrixDoc.includes('MATRIZ CANÓNICA DE CAPACIDADES: TURNEROS V16.0') || matrixDoc.includes('MATRIZ CANÓNICA DE CAPACIDADES Y NIVELES (v16.0)'), 'turneros_v15_matrix.md actualizado a v16.0');
assert(matrixDoc.includes('tucured-clients'), 'turneros_v15_matrix.md documenta base tucured-clients para Nivel 1');

console.log('\n======================================================');
console.log(`📊 RESULTADO: ${passedTests}/${totalTests} pruebas pasadas.`);
if (passedTests === totalTests) {
  console.log('🎉 CERTIFICACIÓN QA EXITOSA (100% OK)');
  console.log('======================================================\n');
  process.exit(0);
} else {
  console.error('⚠️ ALGUNAS PRUEBAS FALLARON');
  console.log('======================================================\n');
  process.exit(1);
}
