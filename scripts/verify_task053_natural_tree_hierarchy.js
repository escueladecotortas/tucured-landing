// Archivo: scripts/verify_task053_natural_tree_hierarchy.js
/**
 * 🧪 Test-Driven Validation Script - TASK-053: Jerarquía Árbol Natural, Piel Clara & Especificaciones Visibles (Argus QA)
 * Valida la cabecera superior, smartphone Aura Light, especificaciones abiertas y Ley de 200L.
 * Restricción estricta: < 200 líneas (< 180L) y Protocolo PEAC.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const targetFiles = [
  'js/components/stage_unified.js',
  'js/components/stage_rubros_zone.js',
  'js/components/stage_value_zone.js',
  'js/showcase_v11/showcase_mockup.js',
  'js/showcase_v11/showcase_templates_l1.js',
  'js/showcase_v11/showcase_templates_l2.js',
  'js/showcase_v11/showcase_templates_l3.js',
  'js/showcase_v11/showcase_admin_preview.js',
  'js/showcase_v11/showcase_self_service_l2.js'
];

console.log('🔍 [ARGUS QA] Certificación TASK-053: Árbol Natural, Piel Clara y Especificaciones Visibles...\n');

let allPassed = true;

// COMPUERTA 1: Protocolo PEAC y Ley de 200L (< 180L)
console.log('📋 COMPUERTA 1: Protocolo PEAC y Ley de 200L (< 180L)');
targetFiles.forEach(relPath => {
  const fullPath = path.join(rootDir, relPath);
  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  const lineCount = lines.length;
  const headerOk = lines[0].trim().startsWith(`// Archivo: ${relPath}`);

  if (lineCount <= 180 && headerOk) {
    console.log(`  ✅ [PASS] ${relPath}: ${lineCount}L (< 180L) | PEAC válido.`);
  } else {
    console.error(`  ❌ [FAIL] ${relPath}: ${lineCount}L (máx 180L), Header: ${headerOk}`);
    allPassed = false;
  }
});

// COMPUERTA 2: Jerarquía de Control Superior (Cabecera)
console.log('\n🏛️ COMPUERTA 2: Jerarquía de Control Superior (Cabecera)');
const rubrosZoneCode = fs.readFileSync(path.join(rootDir, 'js/components/stage_rubros_zone.js'), 'utf8');
const cabeceraChecks = [
  { name: 'Paso 1: Selector de rubros generoso con emojis [ 💈, 🍖, 💅, 🎾, 🩺 ]', test: rubrosZoneCode.includes('💈') && rubrosZoneCode.includes('Barbería') && rubrosZoneCode.includes('Gastronomía') },
  { name: 'Paso 2: Título llano "Elegí el nivel de tu turnero:"', test: rubrosZoneCode.includes('Elegí el nivel de tu turnero:') },
  { name: 'Botón Nivel 1: Individual (Monousuario, zero backend)', test: rubrosZoneCode.includes('Nivel 1: Individual') && rubrosZoneCode.includes('Monousuario, zero backend') },
  { name: 'Botón Nivel 2: Con Turnos Online (Colisiones en vivo y Hash #TK)', test: rubrosZoneCode.includes('Nivel 2: Con Turnos Online') && rubrosZoneCode.includes('Colisiones en vivo y Hash #TK') },
  { name: 'Botón Nivel 3: Para Equipos (Multi-staff y cron recordatorios)', test: rubrosZoneCode.includes('Nivel 3: Para Equipos') && rubrosZoneCode.includes('Multi-staff y cron recordatorios') }
];
cabeceraChecks.forEach(c => {
  if (c.test) {
    console.log(`  ✅ [PASS] ${c.name}`);
  } else {
    console.error(`  ❌ [FAIL] ${c.name}`);
    allPassed = false;
  }
});

// COMPUERTA 3: Pantalla del Smartphone en Piel Clara (Aura Light)
console.log('\n📱 COMPUERTA 3: Pantalla del Smartphone en Piel Clara (Aura Light)');
const mockupCode = fs.readFileSync(path.join(rootDir, 'js/showcase_v11/showcase_mockup.js'), 'utf8');
const adminCode = fs.readFileSync(path.join(rootDir, 'js/showcase_v11/showcase_admin_preview.js'), 'utf8');

const smartphoneChecks = [
  { name: 'Chasis interior con piel clara bg-slate-50', test: mockupCode.includes('bg-slate-50') && !mockupCode.includes('bg-slate-950') },
  { name: 'Fotografía limpia sin badges sobrepuestos (badgeL1 eliminado)', test: !mockupCode.includes('badgeL1') },
  { name: 'Switch de vistas directo: [ Ver Turnero del Cliente ] | [ Ver Tu Panel de Dueño ]', test: mockupCode.includes('Ver Turnero del Cliente') && mockupCode.includes('Ver Tu Panel de Dueño') },
  { name: 'Trastienda /admin en piel clara bg-slate-50', test: adminCode.includes('bg-slate-50 text-slate-900') }
];
smartphoneChecks.forEach(c => {
  if (c.test) {
    console.log(`  ✅ [PASS] ${c.name}`);
  } else {
    console.error(`  ❌ [FAIL] ${c.name}`);
    allPassed = false;
  }
});

// COMPUERTA 4: Especificaciones Siempre Visibles (Chau Acordeón) y CTA Directo
console.log('\n🏛️ COMPUERTA 4: Especificaciones Siempre Visibles y CTA');
const valueZoneCode = fs.readFileSync(path.join(rootDir, 'js/components/stage_value_zone.js'), 'utf8');

const valueChecks = [
  { name: 'Desmonte total de acordeón (cero <details> o <summary>)', test: !valueZoneCode.includes('<details') && !valueZoneCode.includes('<summary') },
  { name: '3 Certezas Nivel 1 visibles (1 solo puesto, directo a WhatsApp, cero servidores)', test: valueZoneCode.includes('Para 1 solo puesto o profesional') && valueZoneCode.includes('Reserva web en 3 toques directo a WhatsApp') && valueZoneCode.includes('Cero costo de servidores ni mantenimiento') },
  { name: '3 Certezas Nivel 2 visibles (Bloqueo en vivo, Comprobante autogestión, Lista Negra/VIP)', test: valueZoneCode.includes('Bloqueo automático de turnos ocupados en tiempo real') && valueZoneCode.includes('Comprobante digital con enlace de autogestión') && valueZoneCode.includes('Panel con Lista Negra y Lista VIP') },
  { name: '3 Certezas Nivel 3 visibles (Agendas múltiples, Duración contigua, Barredora T-2hs)', test: valueZoneCode.includes('Agendas independientes para múltiples profesionales') && valueZoneCode.includes('Horarios contiguos calculados por duración de servicio') && valueZoneCode.includes('Barredora desatendida Cron T-2hs por WhatsApp') },
  { name: 'Botón CTA "Activar este Turnero por $1.000*"', test: valueZoneCode.includes('Activar este Turnero por $1.000*') },
  { name: 'Erradicación de "Precarga tu rubro y nivel"', test: !valueZoneCode.includes('Precarga tu rubro y nivel') },
  { name: 'Micro-aclaración legal preservada', test: valueZoneCode.includes('*Tarifa promocional mes de lanzamiento. Luego abono regular según nivel.') }
];
valueChecks.forEach(c => {
  if (c.test) {
    console.log(`  ✅ [PASS] ${c.name}`);
  } else {
    console.error(`  ❌ [FAIL] ${c.name}`);
    allPassed = false;
  }
});

console.log('\n-----------------------------------------------------------');
if (allPassed) {
  console.log('🏆 [CERTIFICACIÓN TASK-053 EXITOSA AL 100%]');
  console.log('Jerarquía de Árbol Natural, Piel Clara y Especificaciones Visibles certificadas.');
  process.exit(0);
} else {
  console.error('💥 [CERTIFICACIÓN TASK-053 FALLIDA]: Corregir discrepancias.');
  process.exit(1);
}

