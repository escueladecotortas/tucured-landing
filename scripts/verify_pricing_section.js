// Archivo: scripts/verify_pricing_section.js
/**
 * 🧪 Test-Driven Validation Script - TASK-039 (Argus QA)
 * Valida la Ley de 200L, Protocolo PEAC, Contenido de Precios ($1.000 Mes 1) y Conexión Reactiva a #funnel.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const filesToAudit = [
  { path: 'js/components/pricing.js', maxLines: 200, commentPrefix: '// Archivo: js/components/pricing.js' },
  { path: 'src/components/PricingSection.js', maxLines: 200, commentPrefix: '// Archivo: src/components/PricingSection.js' },
  { path: 'js/components/funnel.js', maxLines: 200, commentPrefix: '// Archivo: js/components/funnel.js' },
  { path: 'js/main.js', maxLines: 200, commentPrefix: '// Archivo: js/main.js' },
  { path: 'js/components/navbar.js', maxLines: 200, commentPrefix: '// Archivo: js/components/navbar.js' },
  { path: 'index.html', maxLines: 200, commentPrefix: '<!-- Archivo: index.html -->' }
];

console.log('🔍 [ARGUS QA] Iniciando Certificación de Sección de Precios y Conexión de Niveles...\n');

let allPassed = true;

// 1. Protocolo PEAC y Ley de 200 Líneas
console.log('📋 COMPUERTA 1: Protocolo PEAC y Ley de 200 Líneas');
filesToAudit.forEach(file => {
  const fullPath = path.join(rootDir, file.path);
  if (!fs.existsSync(fullPath)) {
    console.error(`  ❌ [FAIL] Archivo inexistente: ${file.path}`);
    allPassed = false;
    return;
  }
  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  const lineCount = lines.length;
  const firstLine = lines[0].trim();
  const validHeader = firstLine === file.commentPrefix;

  if (lineCount <= file.maxLines && validHeader) {
    const alert180 = lineCount > 180 ? '⚠️ (Alerta preventia >180L)' : '';
    console.log(`  ✅ [PASS] ${file.path}: ${lineCount} líneas (< ${file.maxLines}) ${alert180} | Cabecera PEAC válida.`);
    if (lineCount > 180) allPassed = false;
  } else {
    console.error(`  ❌ [FAIL] ${file.path}: ${lineCount} líneas (máx ${file.maxLines}) | Cabecera válida: ${validHeader}`);
    allPassed = false;
  }
});

// 2. Especificaciones de UI/UX y Contenido de Precios (@Atenea)
console.log('\n🎨 COMPUERTA 2: Especificaciones de UI/UX y Contenido (@Atenea)');
const pricingCode = fs.readFileSync(path.join(rootDir, 'js/components/pricing.js'), 'utf8');

const contentChecks = [
  { name: 'Gancho $1.000 ARS (Mes 1 - Lanzamiento) en 3 planes', test: (pricingCode.match(/\$1\.000 ARS/g) || []).length >= 3 },
  { name: 'Abono regular Nivel 1 ($18.000 ARS / mes)', test: pricingCode.includes('$18.000 ARS / mes') },
  { name: 'Abono regular Nivel 2 ($32.000 ARS / mes)', test: pricingCode.includes('$32.000 ARS / mes') },
  { name: 'Abono regular Nivel 3 ($58.000 ARS / mes)', test: pricingCode.includes('$58.000 ARS / mes') },
  { name: 'Mención 0% comisiones en las 3 tarjetas', test: (pricingCode.match(/0% comisiones/g) || []).length >= 3 },
  { name: 'Badge Nivel 1: "Solución Completa para Emprendedores"', test: pricingCode.includes('Solución Completa para Emprendedores') },
  { name: 'Badge Nivel 2 (Destacado): "Más Elegido por Negocios"', test: pricingCode.includes('Más Elegido por Negocios') && pricingCode.includes('isFeatured: true') },
  { name: 'Badge Nivel 3: "Equipos y Complejos"', test: pricingCode.includes('Equipos y Complejos') },
  { name: 'Features clave Nivel 1 (Reserva 3 toques, TK comprobante, Seña alias/CBU, Baileys, Biométrico)', test:
      pricingCode.includes('Reserva web en 3 toques') &&
      pricingCode.includes('#TK-') &&
      pricingCode.includes('alias/CBU copiable') &&
      pricingCode.includes('Baileys') &&
      pricingCode.includes('Panel móvil biométrico')
  },
  { name: 'Features clave Nivel 2 (Todo N1, CRM Lista Negra/Blanca, KPIs en vivo, Bloqueo de franjas, Feriados)', test:
      pricingCode.includes('Todo lo de Nivel 1 incluido') &&
      pricingCode.includes('Lista Negra') &&
      pricingCode.includes('Tablero de KPIs en vivo') &&
      pricingCode.includes('Bloqueo manual quirúrgico') &&
      pricingCode.includes('Feriados flexibles')
  },
  { name: 'Features clave Nivel 3 (Todo N1 y N2, Selector profesional/cancha, Recurso físico, Comisiones staff, Multi-sucursal)', test:
      pricingCode.includes('Todo lo de Nivel 1 y Nivel 2 incluido') &&
      pricingCode.includes('Selector de profesional / cancha') &&
      pricingCode.includes('Control de recurso físico') &&
      pricingCode.includes('liquidación de comisiones por staff') &&
      pricingCode.includes('Soporte multi-sucursal')
  },
  { name: 'CTAs de selección claros: "Elegir Nivel 1", "Elegir Nivel 2", "Elegir Nivel 3"', test:
      pricingCode.includes('Elegir Nivel 1') &&
      pricingCode.includes('Elegir Nivel 2') &&
      pricingCode.includes('Elegir Nivel 3')
  }
];

contentChecks.forEach(c => {
  if (c.test) {
    console.log(`  ✅ [PASS] ${c.name}`);
  } else {
    console.error(`  ❌ [FAIL] ${c.name}`);
    allPassed = false;
  }
});

// 3. Lógica de Interacción y Conexión Reactiva (@Codi)
console.log('\n⚡ COMPUERTA 3: Conexión Reactiva con Embudo (#funnel) (@Codi)');
const funnelCode = fs.readFileSync(path.join(rootDir, 'js/components/funnel.js'), 'utf8');
const mainCode = fs.readFileSync(path.join(rootDir, 'js/main.js'), 'utf8');
const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

const interactionChecks = [
  { name: 'PricingSection emite evento CustomEvent "tucured:level-selected"', test: pricingCode.includes('tucured:level-selected') },
  { name: 'PricingSection ejecuta scroll fluido hacia #funnel / #app-funnel', test: pricingCode.includes('scrollIntoView') && pricingCode.includes('funnel') },
  { name: 'Funnel normaliza niveles (ej: 1, 2, 3 o l1, l2, l3) sin requerir segundo clic', test: funnelCode.includes("raw.startsWith('l') ? raw : `l${raw}`") },
  { name: 'Punto de montaje #app-pricing en index.html antes del embudo', test: indexHtml.includes('<div id="app-pricing"></div>') },
  { name: 'Montaje de renderPricing en js/main.js', test: mainCode.includes("renderPricing('app-pricing')") },
  { name: 'Wrapper modular exportado en src/components/PricingSection.js', test: fs.existsSync(path.join(rootDir, 'src/components/PricingSection.js')) }
];

interactionChecks.forEach(c => {
  if (c.test) {
    console.log(`  ✅ [PASS] ${c.name}`);
  } else {
    console.error(`  ❌ [FAIL] ${c.name}`);
    allPassed = false;
  }
});

if (allPassed) {
  console.log('\n🎯 [ARGUS QA] Veredicto: CERTIFICACIÓN APROBADA (Cero Veto). Cumplimiento 100% PEAC, 200L y CRO.');
  process.exit(0);
} else {
  console.error('\n🚫 [ARGUS QA] Veredicto: VETO ACTIVO. Corregir incidencias detectadas.');
  process.exit(1);
}

