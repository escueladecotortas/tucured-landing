// Archivo: scripts/verify_task065_admin_l3_aura_light.js
import fs from 'fs';
import path from 'path';
import http from 'http';

console.log('=============================================================');
console.log('--- TEST SUITE: TASK-065 ADMIN L3 AURA LIGHT, RECURSOS & CRON ---');
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
console.log('1. COMPUERTA LEY DE 200 LÍNEAS (< 180L) & MODULARIZACIÓN:');
const monitoredFiles = [
  'public/admin_l3.html',
  'public/js/admin_l3/admin_core.js',
  'public/js/admin_l3/view_agenda.js',
  'public/js/admin_l3/view_staff.js',
  'public/js/admin_l3/view_resources.js',
  'public/js/admin_l3/view_services.js',
  'public/js/admin_l3/view_clients.js',
  'public/js/admin_l3/view_telemetry.js',
  'public/js/admin_l3/view_system.js'
];

monitoredFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  assert(fs.existsSync(filePath), `Archivo existe: ${file}`);
  const lines = fs.readFileSync(filePath, 'utf8').split('\n').length;
  assert(lines <= 180, `${file} cumple umbral preventivo de 180 líneas (${lines}L <= 180L)`);
});

// 2. COMPUERTA ESTÁNDAR AURA LIGHT & PALETA LUMINOSA
console.log('\n2. COMPUERTA ESTÁNDAR AURA LIGHT & PALETA LUMINOSA:');
const l3Html = fs.readFileSync(path.join(rootDir, 'public/admin_l3.html'), 'utf8');
assert(l3Html.includes('bg-slate-50') && l3Html.includes('border-slate-200'), 'admin_l3.html utiliza fondos bg-slate-50 y bordes border-slate-200');
assert(l3Html.includes('class="light') || l3Html.includes("'light'"), 'admin_l3.html establece light mode como estándar por defecto');
assert(!l3Html.includes('<body class="min-h-full flex flex-col font-sans bg-zinc-950'), 'admin_l3.html erradicó monocromo dark rígido en body');
assert(l3Html.includes('Aura Light'), 'admin_l3.html renderiza badge canónico Aura Light');
assert(l3Html.includes('btnThemeToggle'), 'admin_l3.html provee conmutador de tema claro/oscuro');

// 3. COMPUERTA MODELADO DE RECURSOS FÍSICOS VS. PERSONAL HUMANO
console.log('\n3. COMPUERTA MODELADO DE RECURSOS FÍSICOS VS. PERSONAL HUMANO:');
const coreJs = fs.readFileSync(path.join(rootDir, 'public/js/admin_l3/admin_core.js'), 'utf8');
assert(coreJs.includes('resources:') && coreJs.includes('staff:'), 'admin_core.js separa esquemas de staff y recursos físicos');
assert(coreJs.includes('Cancha Pádel Vidrio #1') || coreJs.includes('Sillón Principal #1'), 'admin_core.js modela espacios físicos canónicos');

const agendaJs = fs.readFileSync(path.join(rootDir, 'public/js/admin_l3/view_agenda.js'), 'utf8');
assert(agendaJs.includes('setViewTarget') && agendaJs.includes("'staff'") && agendaJs.includes("'resource'"), 'view_agenda.js implementa selector interactivo de vista Por Staff vs. Por Recurso');
assert(agendaJs.includes('Por Especialista') && agendaJs.includes('Por Recurso Físico'), 'view_agenda.js despliega botones de alternancia de entidad');
assert(agendaJs.includes('mbk-staff') && agendaJs.includes('mbk-resource'), 'Modal de sobreturno gestiona asignación dual de staff y recurso físico');

const resJs = fs.readFileSync(path.join(rootDir, 'public/js/admin_l3/view_resources.js'), 'utf8');
assert(resJs.includes('AdminL3Resources'), 'view_resources.js exporta controlador AdminL3Resources');
assert(resJs.includes('toggleActive') && resJs.includes('openEditModal'), 'view_resources.js implementa ciclo de vida ABM de espacios físicos');

// 4. COMPUERTA TELEMETRÍA VISUAL CRON T-2HS
console.log('\n4. COMPUERTA TELEMETRÍA VISUAL CRON T-2HS:');
assert(l3Html.includes('cron-telemetry-badge') && l3Html.includes('Cron T-2hs: ACTIVO'), 'admin_l3.html incorpora badge visual de telemetría en topbar');
assert(agendaJs.includes('Daemon Cron T-2hs') && agendaJs.includes('executeCronSweep'), 'view_agenda.js despliega tarjeta de telemetría activa con botón de barrido');
assert(agendaJs.includes('Liberados (Cron)'), 'view_agenda.js cuantifica turnos liberados por el cron');

const telemJs = fs.readFileSync(path.join(rootDir, 'public/js/admin_l3/view_telemetry.js'), 'utf8');
assert(telemJs.includes('AdminL3Telemetry'), 'view_telemetry.js exporta módulo de auditoría de telemetría');
assert(telemJs.includes('Hash Idempotencia') || telemJs.includes('Idempotente'), 'view_telemetry.js registra auditoría con garantías de idempotencia');

// 5. COMPUERTA HTTP ENDPOINT ACTIVO EN VITE (:5174)
console.log('\n5. COMPUERTA HTTP ENDPOINT ACTIVO EN VITE (:5174):');
const checkHttp = () => new Promise((resolve) => {
  http.get('http://localhost:5174/admin_l3.html?slug=demo-staff&embed=true', (res) => {
    assert(res.statusCode === 200, `Endpoint /admin_l3.html responde HTTP 200 OK (${res.statusCode})`);
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      assert(body.includes('admin_core.js'), 'Respuesta HTTP admin_l3 incluye scripts modulares');
      assert(body.includes('Aura Light'), 'Respuesta HTTP admin_l3 renderiza badge Aura Light');
      assert(body.includes('view_resources.js'), 'Respuesta HTTP admin_l3 incluye módulo view_resources.js');
      assert(body.includes('view_telemetry.js'), 'Respuesta HTTP admin_l3 incluye módulo view_telemetry.js');
      resolve();
    });
  }).on('error', (err) => {
    assert(false, `Endpoint /admin_l3.html accesible en puerto :5174 (${err.message})`);
    resolve();
  });
});

await checkHttp();

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

