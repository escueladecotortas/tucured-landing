// Archivo: scripts/verify_task058_canonical_names_assets_dates.js
/**
 * 🧪 Test de Certificación QA: Nombres Canónicos Opción A, Assets WebP, Horarios Reales y Mockup Admin
 * Tarea: [TASK-058] (Nexus OS v11.1)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const landingRoot = path.resolve(__dirname, '..');

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

console.log('\n================================================================');
console.log('🛡️  SUITE DE VERIFICACIÓN QA: TASK-058 (NOMBRES, ASSETS, FECHAS & ADMIN)');
console.log('================================================================\n');

// 1. Verificación de Ley de 200L (< 180L) y Protocolo PEAC
const filesToCheck = [
  { p: path.join(landingRoot, 'js/components/stage_rubros_zone.js'), max: 180, header: '// Archivo: js/components/stage_rubros_zone.js' },
  { p: path.join(landingRoot, 'js/components/stage_value_zone.js'), max: 180, header: '// Archivo: js/components/stage_value_zone.js' },
  { p: path.join(landingRoot, 'js/showcase_v11/showcase_state.js'), max: 180, header: '// Archivo: js/showcase_v11/showcase_state.js' },
  { p: path.join(landingRoot, 'js/showcase_v11/showcase_templates_l1.js'), max: 180, header: '// Archivo: js/showcase_v11/showcase_templates_l1.js' },
  { p: path.join(landingRoot, 'js/showcase_v11/showcase_templates_l2.js'), max: 180, header: '// Archivo: js/showcase_v11/showcase_templates_l2.js' },
  { p: path.join(landingRoot, 'js/showcase_v11/showcase_templates_l3.js'), max: 180, header: '// Archivo: js/showcase_v11/showcase_templates_l3.js' },
  { p: path.join(landingRoot, 'js/showcase_v11/showcase_admin_preview.js'), max: 180, header: '// Archivo: js/showcase_v11/showcase_admin_preview.js' }
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
    assert(firstLine === f.header, `${rel} tiene cabecera PEAC válida`);
  }
});

// 2. Nombres Canónicos Opción A
console.log('\n📌 2. Terminología Canónica Opción A:');
const rubrosContent = fs.readFileSync(path.join(landingRoot, 'js/components/stage_rubros_zone.js'), 'utf8');
assert(rubrosContent.includes("name: 'Peluquería'"), "stage_rubros_zone.js usa 'Peluquería' en lugar de 'Barbería'");
assert(rubrosContent.includes("label: 'Autónomo'"), "stage_rubros_zone.js usa 'Autónomo'");
assert(rubrosContent.includes("label: 'Central Pro'"), "stage_rubros_zone.js usa 'Central Pro'");
assert(rubrosContent.includes("label: 'Multi-Equipo'"), "stage_rubros_zone.js usa 'Multi-Equipo'");
assert(rubrosContent.includes("scale-[1.02]"), "stage_rubros_zone.js mantiene escala 'scale-[1.02]'");

const stageValueContent = fs.readFileSync(path.join(landingRoot, 'js/components/stage_value_zone.js'), 'utf8');
assert(stageValueContent.includes('Nivel 1: Autónomo'), "stage_value_zone.js contiene 'Nivel 1: Autónomo'");
assert(stageValueContent.includes('Nivel 2: Central Pro'), "stage_value_zone.js contiene 'Nivel 2: Central Pro'");
assert(stageValueContent.includes('Nivel 3: Multi-Equipo'), "stage_value_zone.js contiene 'Nivel 3: Multi-Equipo'");

// 3. Conversión de Assets WebP
console.log('\n📌 3. Conversión de Assets Diurnos WebP:');
const gastroPath = path.join(landingRoot, 'public/assets/showcase/gastronomia.webp');
const deportesPath = path.join(landingRoot, 'public/assets/showcase/deportes.webp');
assert(fs.existsSync(gastroPath), 'gastronomia.webp existe en public/assets/showcase');
assert(fs.existsSync(deportesPath), 'deportes.webp existe en public/assets/showcase');
if (fs.existsSync(gastroPath)) {
  const sz = fs.statSync(gastroPath).size;
  assert(sz > 50000, `gastronomia.webp peso optimizado: ${(sz/1024).toFixed(1)} KB`);
}
if (fs.existsSync(deportesPath)) {
  const sz = fs.statSync(deportesPath).size;
  assert(sz > 50000, `deportes.webp peso optimizado: ${(sz/1024).toFixed(1)} KB`);
}

const stateContent = fs.readFileSync(path.join(landingRoot, 'js/showcase_v11/showcase_state.js'), 'utf8');
assert(stateContent.includes('/assets/showcase/gastronomia.webp'), 'showcase_state.js apunta a gastronomia.webp');
assert(stateContent.includes('/assets/showcase/deportes.webp'), 'showcase_state.js apunta a deportes.webp');

// 4. Lógica de Fechas, Domingo Cerrado y Horarios Pasados
console.log('\n📌 4. Motor de Fechas y Horarios Reales:');
const tplL1 = fs.readFileSync(path.join(landingRoot, 'js/showcase_v11/showcase_templates_l1.js'), 'utf8');
const tplL2 = fs.readFileSync(path.join(landingRoot, 'js/showcase_v11/showcase_templates_l2.js'), 'utf8');
const tplL3 = fs.readFileSync(path.join(landingRoot, 'js/showcase_v11/showcase_templates_l3.js'), 'utf8');

[
  { name: 'showcase_templates_l1.js', content: tplL1 },
  { name: 'showcase_templates_l2.js', content: tplL2 },
  { name: 'showcase_templates_l3.js', content: tplL3 }
].forEach(t => {
  assert(t.content.includes('Local cerrado los domingos'), `${t.name} contiene mensaje de 'Local cerrado los domingos'`);
  assert(t.content.includes('opacity-30 line-through pointer-events-none cursor-not-allowed border-dashed'), `${t.name} aplica estilo para horarios pasados`);
});

// 5. Mockup /admin en Smartphone
console.log('\n📌 5. Mockup /admin en Smartphone:');
const adminPrevContent = fs.readFileSync(path.join(landingRoot, 'js/showcase_v11/showcase_admin_preview.js'), 'utf8');
assert(!adminPrevContent.includes('HTML Listo'), "showcase_admin_preview.js no tiene 'HTML Listo'");
assert(!adminPrevContent.includes('Snippet'), "showcase_admin_preview.js no tiene 'Snippet'");
assert(!adminPrevContent.includes('0 (Offline)'), "showcase_admin_preview.js no tiene '0 (Offline)'");
assert(adminPrevContent.includes('6 Turnos'), "showcase_admin_preview.js muestra '6 Turnos'");
assert(adminPrevContent.includes('85%'), "showcase_admin_preview.js muestra '85%'");
assert(adminPrevContent.includes('Conectada'), "showcase_admin_preview.js muestra BBDD Conectada");
assert(adminPrevContent.includes('#TK-'), "showcase_admin_preview.js muestra códigos #TK-XXXX");

console.log('\n================================================================');
console.log(`📊 RESULTADO: ${passedTests}/${totalTests} pruebas pasadas.`);
if (passedTests === totalTests) {
  console.log('🎉 CERTIFICACIÓN QA EXITOSA (100% OK)');
  console.log('================================================================\n');
  process.exit(0);
} else {
  console.error('⚠️ ALGUNAS PRUEBAS FALLARON');
  console.log('================================================================\n');
  process.exit(1);
}
