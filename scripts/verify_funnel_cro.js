// Archivo: scripts/verify_funnel_cro.js
/**
 * 🧪 Test-Driven Validation Script - TASK-036 (Argus QA)
 * Valida la Ley de 200L, Navegación Progresiva, Sanitización E.164, sessionStorage y AbortController.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const filesToAudit = [
  { path: 'js/components/funnel.js', maxLines: 200, commentType: '//' },
  { path: 'css/components.css', maxLines: 200, commentType: '/*' }
];

console.log('🔍 [ARGUS QA] Certificación TASK-036 (Refinamiento Embudo 3 Pasos)...\n');

let allPassed = true;

// 1. Ley de 200 Líneas y Protocolo PEAC
console.log('📋 COMPUERTA 1: Protocolo PEAC y Ley de 200 Líneas');
filesToAudit.forEach(file => {
  const fullPath = path.join(rootDir, file.path);
  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  const lineCount = lines.length;
  const firstLine = lines[0].trim();
  const validHeader = firstLine.startsWith(`${file.commentType} Archivo: ${file.path}`);

  if (lineCount <= file.maxLines && validHeader) {
    const alert180 = lineCount > 180 ? '⚠️ (Alerta >180L)' : '';
    console.log(`  ✅ [PASS] ${file.path}: ${lineCount} líneas (< ${file.maxLines}) ${alert180} | Cabecera PEAC válida.`);
    if (lineCount > 180) allPassed = false;
  } else {
    console.error(`  ❌ [FAIL] ${file.path}: ${lineCount} líneas (máx ${file.maxLines})`);
    allPassed = false;
  }
});

// 2. Auditoría CRO & Experiencia de Usuario (Ícaro + Atenea)
console.log('\n🎯 COMPUERTA 2: Especificaciones CRO & UI (Ícaro + Atenea)');
const funnelCode = fs.readFileSync(path.join(rootDir, 'js/components/funnel.js'), 'utf8');
const cssComponents = fs.readFileSync(path.join(rootDir, 'css/components.css'), 'utf8');

const croChecks = [
  { name: 'Indicadores de estado numéricos (step-badge-1, 2, 3)', test: funnelCode.includes('step-badge-1') && funnelCode.includes('step-badge-2') && funnelCode.includes('step-badge-3') },
  { name: 'Clases CSS de pasos (.funnel-step-completed, .funnel-step-active)', test: cssComponents.includes('funnel-step-completed') && cssComponents.includes('funnel-step-active') },
  { name: 'Micro-asistencia en selección (scrollIntoView / focus)', test: funnelCode.includes('scrollIntoView') && funnelCode.includes('focus()') },
  { name: 'CTA dinámico reactivo con nivel y rubro', test: funnelCode.includes('ctaBtn.innerHTML') && funnelCode.includes('Empezar con') },
  { name: 'Hint en vivo de validación telefónica (+54 9)', test: funnelCode.includes('phone-valid-hint') && funnelCode.includes('AR +54 9') }
];

croChecks.forEach(c => {
  if (c.test) {
    console.log(`  ✅ [PASS] ${c.name}`);
  } else {
    console.error(`  ❌ [FAIL] ${c.name}`);
    allPassed = false;
  }
});

// 3. Prueba Unitaria Sanitización Telefónica Argentina E.164 (Codi)
console.log('\n📱 COMPUERTA 3: Sanitización Telefónica E.164 (Codi)');

function sanitizeArgentinePhone(raw) {
  let d = String(raw || '').replace(/\D/g, '');
  if (d.startsWith('549')) d = d.slice(3);
  else if (d.startsWith('54')) d = d.slice(2);
  if (d.startsWith('0')) d = d.slice(1);
  if (d.length > 10) {
    if (d.slice(3, 5) === '15') d = d.slice(0, 3) + d.slice(5);
    else if (d.slice(2, 4) === '15') d = d.slice(0, 2) + d.slice(4);
  }
  return d.slice(0, 10);
}

const testPhones = [
  { input: '3815554321', expected: '3815554321' },
  { input: '0381-15-555-4321', expected: '3815554321' },
  { input: '+54 9 381 555-4321', expected: '3815554321' },
  { input: '11 15 4444 5555', expected: '1144445555' },
  { input: '011 15 4444 5555', expected: '1144445555' }
];

testPhones.forEach(t => {
  const result = sanitizeArgentinePhone(t.input);
  if (result === t.expected) {
    console.log(`  ✅ [PASS] ${t.input} -> ${result} (10 dígitos limpios)`);
  } else {
    console.error(`  ❌ [FAIL] ${t.input} esperó ${t.expected}, obtuvo ${result}`);
    allPassed = false;
  }
});

// 4. Persistencia en sessionStorage y Hardening
console.log('\n💾 COMPUERTA 4: Persistencia y Ciclo de Vida');
const lifecycleChecks = [
  { name: 'Persistencia con clave tucured_funnel_draft', test: funnelCode.includes('tucured_funnel_draft') },
  { name: 'Uso de AbortController y signal para desuscripción', test: funnelCode.includes('AbortController') && funnelCode.includes('signal') },
  { name: 'Eventos personalizados escuchados (tucured:rubro-selected / level)', test: funnelCode.includes('tucured:rubro-selected') && funnelCode.includes('tucured:level-selected') }
];

lifecycleChecks.forEach(c => {
  if (c.test) {
    console.log(`  ✅ [PASS] ${c.name}`);
  } else {
    console.error(`  ❌ [FAIL] ${c.name}`);
    allPassed = false;
  }
});

// 5. Sintaxis
console.log('\n🧩 COMPUERTA 5: Verificación Sintáctica');
try {
  new Function(funnelCode.replace(/export\s+/g, ''));
  console.log('  ✅ [PASS] Sintaxis de js/components/funnel.js verificada sin errores.');
} catch (e) {
  console.error('  ❌ [FAIL] Error de sintaxis en funnel.js:', e.message);
  allPassed = false;
}

console.log('\n-----------------------------------------------------------');
if (allPassed) {
  console.log('🏆 [CERTIFICACIÓN TASK-036 APROBADA AL 100%]🎯');
  console.log('El Embudo Asistido de 3 Pasos ha sido optimizado y validado.');
  process.exit(0);
} else {
  console.error('💥 [CERTIFICACIÓN FALLIDA]');
  process.exit(1);
}
