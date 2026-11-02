// Archivo: scripts/verify_whatsapp_ctas.js
/**
 * 🧪 Test-Driven Validation Script - Pasarelas y CTAs WhatsApp (Argus QA & Codi)
 * Valida generación de URLs con pre-llenado, fallback global y número oficial Tucu Red.
 * Cumplimiento estricto: Ley de 200 Líneas (< 180L) y Protocolo PEAC.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  TUCU_RED_PHONE,
  WA_FALLBACK_URL,
  WA_FALLBACK_TEXT,
  getLeadWhatsAppUrl
} from '../js/utils/whatsapp_link.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🔍 [ARGUS QA] Certificación de Pasarelas & CTAs WhatsApp (TASK-037)...\n');
let allPassed = true;

// 1. Ley de 200 Líneas y Protocolo PEAC en Módulos Modificados
console.log('📋 COMPUERTA 1: Protocolo PEAC y Ley de 200 Líneas');
const filesToAudit = [
  'js/utils/whatsapp_link.js',
  'js/components/funnel.js',
  'js/components/navbar.js',
  'js/components/footer.js',
  'js/showcase_v11/showcase_benefits.js'
];

filesToAudit.forEach(relPath => {
  const fullPath = path.join(rootDir, relPath);
  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  const lineCount = lines.length;
  const validHeader = lines[0].trim().startsWith(`// Archivo: ${relPath}`);

  if (lineCount <= 200 && validHeader) {
    const alert = lineCount > 180 ? ' ⚠️ (Alerta >180L)' : '';
    console.log(`  ✅ [PASS] ${relPath}: ${lineCount}L (< 200L)${alert} | PEAC válido.`);
    if (lineCount > 180) allPassed = false;
  } else {
    console.error(`  ❌ [FAIL] ${relPath}: ${lineCount}L (máx 200), header: ${validHeader}`);
    allPassed = false;
  }
});

// 2. Validación de Línea Oficial Tucu Red (5493814132154) y Cero Números Falsos
console.log('\n📱 COMPUERTA 2: Validación de Línea Oficial Tucu Red & Cero Fakes');
if (TUCU_RED_PHONE === '5493814132154') {
  console.log(`  ✅ [PASS] Target oficial Tucu Red certificado: ${TUCU_RED_PHONE}`);
} else {
  console.error(`  ❌ [FAIL] Número inesperado: ${TUCU_RED_PHONE}`);
  allPassed = false;
}

// Búsqueda exhaustiva de números fake en codebase js/
const fakePattern = /5493815551234/;
let fakeFound = false;
filesToAudit.forEach(relPath => {
  const code = fs.readFileSync(path.join(rootDir, relPath), 'utf8');
  if (fakePattern.test(code)) {
    console.error(`  ❌ [FAIL] Número fake detectado en: ${relPath}`);
    fakeFound = true;
    allPassed = false;
  }
});
if (!fakeFound) {
  console.log('  ✅ [PASS] Cero números simulados (5493815551234) en los módulos auditados.');
}

// 3. Fallback Estándar de Contacto Directo
console.log('\n🔗 COMPUERTA 3: URL de Fallback Global');
const expectedFallback = `https://wa.me/5493814132154?text=${encodeURIComponent(WA_FALLBACK_TEXT)}`;
if (WA_FALLBACK_URL === expectedFallback && WA_FALLBACK_URL.includes('5493814132154')) {
  console.log(`  ✅ [PASS] URL de fallback válida: ${WA_FALLBACK_URL}`);
} else {
  console.error(`  ❌ [FAIL] URL de fallback inconsistente: ${WA_FALLBACK_URL}`);
  allPassed = false;
}

// 4. Generación Dinámica con Pre-llenado de Lead en Wizard
console.log('\n🧙 COMPUERTA 4: Generación Dinámica de Enlace con Datos del Wizard');
const sampleLead = {
  nombre: 'Barbería San Martín',
  ciudad: 'Yerba Buena',
  rubro: 'barberia',
  level: 'l2',
  horario: 'cortado'
};

const generatedUrl = getLeadWhatsAppUrl(sampleLead);
const parsedUrl = new URL(generatedUrl);
const textParam = parsedUrl.searchParams.get('text');

const hasRequiredStrings = textParam.includes('Barbería San Martín') &&
  textParam.includes('Yerba Buena') &&
  textParam.includes('Barbería') &&
  textParam.includes('Nivel 2 (Central Pro)') &&
  textParam.includes('$1.000 Mes 1');

if (generatedUrl.startsWith('https://wa.me/5493814132154') && hasRequiredStrings) {
  console.log(`  ✅ [PASS] URL dinámica generada correctamente: ${generatedUrl}`);
  console.log(`  📝 [SNAPSHOT TEXT]: "${textParam}"`);
} else {
  console.error(`  ❌ [FAIL] Parámetros incompletos en URL generada: ${generatedUrl}`);
  allPassed = false;
}

// 5. Verificación de Inyección en Wizard y CTAs de Navbar/Footer
console.log('\n🏛️ COMPUERTA 5: Integración en Componentes (Wizard, Navbar & Footer)');
const funnelCode = fs.readFileSync(path.join(rootDir, 'js/components/funnel.js'), 'utf8');
const navbarCode = fs.readFileSync(path.join(rootDir, 'js/components/navbar.js'), 'utf8');
const footerCode = fs.readFileSync(path.join(rootDir, 'js/components/footer.js'), 'utf8');

const checks = [
  { name: 'Funnel importa getLeadWhatsAppUrl', test: funnelCode.includes('getLeadWhatsAppUrl') },
  { name: 'Funnel incluye botón #btn-lead-wa-confirm con target="_blank"', test: funnelCode.includes('btn-lead-wa-confirm') && funnelCode.includes('target="_blank"') && funnelCode.includes('rel="noopener noreferrer"') },
  { name: 'Navbar importa e integra WA_FALLBACK_URL', test: navbarCode.includes('WA_FALLBACK_URL') && navbarCode.includes('target="_blank"') },
  { name: 'Footer importa e integra WA_FALLBACK_URL', test: footerCode.includes('WA_FALLBACK_URL') && footerCode.includes('target="_blank"') }
];

checks.forEach(c => {
  if (c.test) {
    console.log(`  ✅ [PASS] ${c.name}`);
  } else {
    console.error(`  ❌ [FAIL] ${c.name}`);
    allPassed = false;
  }
});

console.log('\n-----------------------------------------------------------');
if (allPassed) {
  console.log('🏆 [CERTIFICACIÓN CTAs WHATSAPP APROBADA AL 100%]');
  console.log('Pasarelas a WhatsApp con pre-llenado y línea oficial 5493814132154 validadas.');
  process.exit(0);
} else {
  console.error('💥 [CERTIFICACIÓN FALLIDA]: Se detectaron incidencias.');
  process.exit(1);
}

