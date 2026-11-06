// Archivo: scripts/verify_task059_admin_l1_complete_decontamination.js
// Test Suite de Verificación Automatizada: Descontaminación Total de Admin L1, Filtros, +Nueva Cita, Fix CSS Horarios y Semilla Demo
// Protocolo: Nexus OS v11.1 - Test-Driven Validation

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
  console.log('\n======================================================');
  console.log('--- TEST SUITE: TASK-059 DESCONTAMINACIÓN ADMIN L1 ---');
  console.log('======================================================\n');

  const engineBase = 'C:/Users/leola/Downloads/tucured-engine';
  const htmlPath = path.join(engineBase, 'public/admin_l1.html');
  const jsDir = path.join(engineBase, 'public/js/admin_l1');

  const filesToCheck = [
    { name: 'admin_l1.html', path: htmlPath },
    { name: 'admin_l1_auth.js', path: path.join(jsDir, 'admin_l1_auth.js') },
    { name: 'admin_l1_core.js', path: path.join(jsDir, 'admin_l1_core.js') },
    { name: 'admin_l1_agenda.js', path: path.join(jsDir, 'admin_l1_agenda.js') },
    { name: 'admin_l1_pricing.js', path: path.join(jsDir, 'admin_l1_pricing.js') },
    { name: 'admin_l1_config.js', path: path.join(jsDir, 'admin_l1_config.js') }
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

  console.log('\n2. COMPUERTA CERO RESIDUO / DESCONTAMINACIÓN LUCÍA JUÁREZ');
  filesToCheck.forEach(f => {
    if (fs.existsSync(f.path)) {
      const content = fs.readFileSync(f.path, 'utf8');
      const hasLucia = content.includes('Lucía') || content.includes('Lucia') || content.includes('Beauty Studio');
      assert(!hasLucia, `${f.name} está 100% libre de referencias residuales a Lucía Juárez`);
    }
  });

  console.log('\n3. COMPUERTA BRANDING NEUTRO & MONOGRAMA PB');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  assert(htmlContent.includes('Peluquería & Barbería Central'), 'admin_l1.html tiene título canónico Peluquería & Barbería Central');
  assert(htmlContent.includes('Cortes Clásicos, Fades y Cuidado de Barba'), 'admin_l1.html tiene slogan canónico');
  assert(htmlContent.includes('PB'), 'admin_l1.html tiene monograma estilizado PB');

  console.log('\n4. COMPUERTA AGENDA DE CITAS, FILTROS & BOTÓN +NUEVA CITA');
  assert(htmlContent.includes('+ Nueva Cita'), 'admin_l1.html renderiza botón destacado [+ Nueva Cita]');
  assert(htmlContent.includes('data-tfilter="hoy"'), 'admin_l1.html incluye filtro temporal Hoy');
  assert(htmlContent.includes('data-tfilter="semana"'), 'admin_l1.html incluye filtro temporal Esta Semana');
  assert(htmlContent.includes('data-sfilter="confirmado"'), 'admin_l1.html incluye filtro de estado Confirmados');
  assert(htmlContent.includes('inputSearchBooking'), 'admin_l1.html incluye input buscador de clientes');

  const agendaContent = fs.readFileSync(path.join(jsDir, 'admin_l1_agenda.js'), 'utf8');
  assert(agendaContent.includes('DEMO_SEED'), 'admin_l1_agenda.js define DEMO_SEED automática');
  assert(agendaContent.includes('#TK-'), 'admin_l1_agenda.js maneja tokens de cita #TK-');
  assert(agendaContent.includes('Martín Gómez'), 'admin_l1_agenda.js incluye cita demo de Martín Gómez');
  assert(agendaContent.includes('openNewBookingModal'), 'admin_l1_agenda.js expone modal openNewBookingModal');

  console.log('\n5. COMPUERTA CATÁLOGO & 5 SERVICIOS REALES');
  const pricingContent = fs.readFileSync(path.join(jsDir, 'admin_l1_pricing.js'), 'utf8');
  assert(pricingContent.includes('Corte Clásico'), 'admin_l1_pricing.js incluye servicio Corte Clásico ($8.000)');
  assert(pricingContent.includes('Corte Degradé / Fade'), 'admin_l1_pricing.js incluye servicio Corte Degradé / Fade ($10.000)');
  assert(pricingContent.includes('Corte + Barba'), 'admin_l1_pricing.js incluye servicio Corte + Barba ($14.000)');
  assert(pricingContent.includes('Barba Toalla Caliente'), 'admin_l1_pricing.js incluye servicio Barba Toalla Caliente ($6.000)');
  assert(pricingContent.includes('Coloración / Claritos'), 'admin_l1_pricing.js incluye servicio Coloración / Claritos ($22.000)');

  console.log('\n6. COMPUERTA HORARIOS 2 BLOQUES, FERIADOS & GATEWAY BAILEYS');
  const configContent = fs.readFileSync(path.join(jsDir, 'admin_l1_config.js'), 'utf8');
  assert(configContent.includes('min-w-[85px]'), 'admin_l1_config.js aplica ancho mínimo min-w-[85px] a inputs de horario');
  assert(configContent.includes('Mañana'), 'admin_l1_config.js renderiza bloque Mañana');
  assert(configContent.includes('Tarde'), 'admin_l1_config.js renderiza bloque Tarde');
  assert(configContent.includes('blockHolidays'), 'admin_l1_config.js persiste soporte de Feriados Oficiales');
  assert(configContent.includes('openBaileysModal'), 'admin_l1_config.js incluye función modal openBaileysModal con QR SVG');

  console.log('\n7. COMPUERTA HTTP ENDPOINT ACTIVO (:5005)');
  await new Promise((resolve) => {
    http.get('http://localhost:5005/admin_l1.html?slug=demo-peluqueria', (res) => {
      assert(res.statusCode === 200, `Endpoint /admin_l1.html responde HTTP 200 OK (${res.statusCode})`);
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        assert(body.includes('admin_l1_agenda.js'), 'Respuesta HTTP incluye script admin_l1_agenda.js');
        assert(body.includes('Peluquería & Barbería Central'), 'Respuesta HTTP renderiza Peluquería & Barbería Central');
        resolve();
      });
    }).on('error', (err) => {
      assert(false, `Endpoint /admin_l1.html accesible en puerto :5005 (${err.message})`);
      resolve();
    });
  });

  console.log('\n======================================================');
  console.log(`RESULTADO FINAL: ${passedTests}/${totalTests} PRUEBAS APROBADAS`);
  console.log('======================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTests();
