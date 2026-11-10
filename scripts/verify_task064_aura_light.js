// Archivo: scripts/verify_task064_aura_light.js
// Test Suite de Verificación Automatizada: UI/UX Aura Light Admin L1 & L2 (TASK-064)
// Protocolo: Nexus OS v11.1 - Test-Driven Validation & Argus Gatekeeper

import fs from 'fs';
import path from 'path';
import http from 'http';

let totalTests = 0;
let passedTests = 0;

function assert(condition, description) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${description}`);
  } else {
    console.error(`  [FAIL] ${description}`);
  }
}

async function runTests() {
  console.log('\n=============================================================');
  console.log('--- TEST SUITE: TASK-064 UI/UX AURA LIGHT ADMIN L1 & L2 ---');
  console.log('=============================================================\n');

  const baseDir = process.cwd();
  const filesToCheck = [
    { name: 'public/admin_l1.html', path: path.join(baseDir, 'public/admin_l1.html') },
    { name: 'public/admin_l2.html', path: path.join(baseDir, 'public/admin_l2.html') },
    { name: 'public/js/admin_l1/admin_l1_core.js', path: path.join(baseDir, 'public/js/admin_l1/admin_l1_core.js') },
    { name: 'public/js/admin_l1/admin_l1_agenda.js', path: path.join(baseDir, 'public/js/admin_l1/admin_l1_agenda.js') },
    { name: 'public/js/admin_l1/admin_l1_auth.js', path: path.join(baseDir, 'public/js/admin_l1/admin_l1_auth.js') },
    { name: 'public/js/admin_l1/admin_l1_pricing.js', path: path.join(baseDir, 'public/js/admin_l1/admin_l1_pricing.js') },
    { name: 'public/js/admin_l1/admin_l1_config.js', path: path.join(baseDir, 'public/js/admin_l1/admin_l1_config.js') },
    { name: 'public/js/admin_l2/admin_l2_core.js', path: path.join(baseDir, 'public/js/admin_l2/admin_l2_core.js') },
    { name: 'public/js/admin_l2/admin_l2_calendar.js', path: path.join(baseDir, 'public/js/admin_l2/admin_l2_calendar.js') },
    { name: 'public/js/admin_l2/admin_l2_crm.js', path: path.join(baseDir, 'public/js/admin_l2/admin_l2_crm.js') },
    { name: 'public/js/admin_l2/admin_l2_schedule.js', path: path.join(baseDir, 'public/js/admin_l2/admin_l2_schedule.js') },
    { name: 'public/js/admin_l2/admin_l2_config.js', path: path.join(baseDir, 'public/js/admin_l2/admin_l2_config.js') }
  ];

  console.log('1. COMPUERTA LEY DE 200 LÍNEAS (< 180L UMBRAL PREVENTIVO)');
  filesToCheck.forEach(f => {
    assert(fs.existsSync(f.path), `Archivo existe: ${f.name}`);
    if (fs.existsSync(f.path)) {
      const content = fs.readFileSync(f.path, 'utf8');
      const lines = content.split('\n').length;
      assert(lines <= 180, `${f.name} cumple umbral preventivo de 180 líneas (${lines}L <= 180L)`);
    }
  });

  console.log('\n2. COMPUERTA ESTÁNDAR AURA LIGHT & PALETA LUMINOSA');
  const l1Html = fs.readFileSync(path.join(baseDir, 'public/admin_l1.html'), 'utf8');
  const l2Html = fs.readFileSync(path.join(baseDir, 'public/admin_l2.html'), 'utf8');

  assert(l1Html.includes('bg-slate-50') && l1Html.includes('border-slate-200'), 'admin_l1.html utiliza fondos bg-slate-50 y bordes border-slate-200');
  assert(l2Html.includes('bg-slate-50') && l2Html.includes('border-slate-200'), 'admin_l2.html utiliza fondos bg-slate-50 y bordes border-slate-200');
  assert(!l1Html.includes('class="dark"') && l1Html.includes("'light'"), 'admin_l1.html establece light mode como tema por defecto');
  assert(!l2Html.includes('class="h-full bg-zinc-950') && l2Html.includes("'light'"), 'admin_l2.html erradicó monocromo dark rígido y adopta Aura Light');

  console.log('\n3. COMPUERTA MODULARIZACIÓN & JERARQUÍA L2');
  assert(l2Html.includes('admin_l2_core.js'), 'admin_l2.html importa admin_l2_core.js');
  assert(l2Html.includes('admin_l2_calendar.js'), 'admin_l2.html importa admin_l2_calendar.js');
  assert(l2Html.includes('admin_l2_crm.js'), 'admin_l2.html importa admin_l2_crm.js');
  assert(l2Html.includes('admin_l2_schedule.js'), 'admin_l2.html importa admin_l2_schedule.js');
  assert(l2Html.includes('admin_l2_config.js'), 'admin_l2.html importa admin_l2_config.js');

  const l2Cal = fs.readFileSync(path.join(baseDir, 'public/js/admin_l2/admin_l2_calendar.js'), 'utf8');
  assert(l2Cal.includes('TK-8492'), 'admin_l2_calendar.js preserva seed demo TK-8492');
  assert(l2Cal.includes('metric-confirmed-count'), 'admin_l2_calendar.js calcula métricas operativas');

  const l2Crm = fs.readFileSync(path.join(baseDir, 'public/js/admin_l2/admin_l2_crm.js'), 'utf8');
  assert(l2Crm.includes('tucu_l2_whitelist') && l2Crm.includes('tucu_l2_blacklist'), 'admin_l2_crm.js preserva persistencia de Lista Blanca y Negra');

  console.log('\n4. COMPUERTA HTTP ENDPOINTS ACTIVOS EN SERVIDOR VITE (:5174)');
  await new Promise((resolve) => {
    http.get('http://localhost:5174/admin_l1.html?slug=demo-peluqueria&embed=true', (res) => {
      assert(res.statusCode === 200, `Endpoint /admin_l1.html responde HTTP 200 OK (${res.statusCode})`);
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        assert(body.includes('admin_l1_agenda.js'), 'Respuesta HTTP admin_l1 incluye scripts modulares');
        resolve();
      });
    }).on('error', (err) => {
      assert(false, `Endpoint /admin_l1.html accesible en puerto :5174 (${err.message})`);
      resolve();
    });
  });

  await new Promise((resolve) => {
    http.get('http://localhost:5174/admin_l2.html?slug=demo-central&embed=true', (res) => {
      assert(res.statusCode === 200, `Endpoint /admin_l2.html responde HTTP 200 OK (${res.statusCode})`);
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        assert(body.includes('admin_l2_core.js'), 'Respuesta HTTP admin_l2 incluye scripts modulares');
        assert(body.includes('Aura Light'), 'Respuesta HTTP admin_l2 renderiza badge Aura Light');
        resolve();
      });
    }).on('error', (err) => {
      assert(false, `Endpoint /admin_l2.html accesible en puerto :5174 (${err.message})`);
      resolve();
    });
  });

  console.log('\n=============================================================');
  console.log(`RESULTADO FINAL: ${passedTests}/${totalTests} PRUEBAS APROBADAS`);
  console.log('=============================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTests();

