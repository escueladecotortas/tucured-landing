// Archivo: scripts/verify_task101_wa_welcome.js
// Compuerta QA [TASK-101]: Auditoría Estática, Redirects netlify.toml y Unit Tests BFF wa-welcome (< 195L)

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { handler, __resetRateLimits } from '../netlify/functions/wa-welcome.js';

const FILES = [
  'netlify.toml',
  'netlify/functions/wa-welcome.js',
  'js/components/funnel.js',
  'scripts/verify_task101_wa_welcome.js'
];

let pass = 0, fail = 0;
const ok = (c, m) => (c ? (pass++, console.log(`  [PASS] ${m}`)) : (fail++, console.error(`  [FAIL] ${m}`)));

function runStaticChecks() {
  console.log('\n=== 1. AUDITORÍA ESTÁTICA [TASK-101]: <200L, AST & REDIRECTS ===');
  for (const rel of FILES) {
    const abs = path.resolve(rel);
    const lines = fs.readFileSync(abs, 'utf8').split(/\r?\n/);
    ok(lines.length < 200 && /Archivo:/i.test(lines[0]), `${rel} (${lines.length}L < 200L + encabezado)`);
    if (rel.endsWith('.js')) {
      let ast = true;
      try { execSync(`node --check "${abs}"`, { stdio: 'pipe' }); } catch { ast = false; }
      ok(ast, `AST OK: ${rel}`);
    }
  }
  const toml = fs.readFileSync(path.resolve('netlify.toml'), 'utf8');
  const idxApi = toml.indexOf('from = "/api/*"'), idxWild = toml.indexOf('from = "/*"');
  ok(toml.includes('directory = "netlify/functions"'), 'netlify.toml define directory = "netlify/functions"');
  ok(idxApi !== -1 && idxWild !== -1 && idxApi < idxWild, 'netlify.toml ubica /api/* ANTES del catch-all /*');

  const funnelSrc = fs.readFileSync(path.resolve('js/components/funnel.js'), 'utf8');
  ok(funnelSrc.includes("fetch('/api/wa-welcome'"), 'js/components/funnel.js invoca POST /api/wa-welcome');
}

async function runBffUnitTests() {
  console.log('\n=== 2. UNIT TESTS SANDBOX BFF wa-welcome.js (FETCH MOCKEADO) ===');
  const origFetch = globalThis.fetch;
  const origWarn = console.warn;
  const calls = [], warns = [];
  let mockResponder = async () => ({ ok: true, status: 200, json: async () => ({ success: true, messageId: 'mock-id' }) });

  globalThis.fetch = async (url, opts) => {
    const entry = { url, opts, body: JSON.parse(opts?.body || '{}') };
    calls.push(entry);
    return mockResponder(calls.length, entry);
  };
  console.warn = (...args) => warns.push(args.join(' '));

  const envKeys = ['WA_GATEWAY_URL', 'WA_GATEWAY_API_KEY', 'LEO_ALERT_PHONE', 'WA_ALERT_DELAY_MS', 'WA_RETRY_BACKOFF_MS'];
  const prevEnv = Object.fromEntries(envKeys.map(k => [k, process.env[k]]));

  try {
    const testKey = 'test-secret-key-at-least-32-chars-0001';
    process.env.WA_GATEWAY_URL = 'https://api.tucured.com.ar';
    process.env.WA_GATEWAY_API_KEY = testKey;
    process.env.LEO_ALERT_PHONE = '5493819998888';
    process.env.WA_ALERT_DELAY_MS = '10';
    process.env.WA_RETRY_BACKOFF_MS = '25';
    __resetRateLimits();

    const validPayload = {
      nombre: 'Barbería Central', ciudad: 'San Miguel de Tucumán', rubro: 'peluqueria', level: 'l2',
      horario: 'cortado', nombreTitular: 'Sofía', apellidoTitular: 'Mendoza', whatsapp: '3815554321',
      email: 'sofia@central.com', activarUrl: 'https://tucured.ar/activar.html?comercio=Barber%C3%ADa+Central'
    };

    // 1. GET -> 405
    const r405 = await handler({ httpMethod: 'GET', headers: { Origin: 'https://tucured.ar' } });
    ok(r405.statusCode === 405, 'Método GET devuelve 405');

    // 2. Origin externo -> 403
    const r403 = await handler({ httpMethod: 'POST', headers: { Origin: 'https://evil.test' }, body: JSON.stringify(validPayload) });
    ok(r403.statusCode === 403, 'Origin externo https://evil.test devuelve 403');

    // 3. Teléfono inválido -> 400
    const r400 = await handler({
      httpMethod: 'POST',
      headers: { Origin: 'https://tucured.ar', 'x-nf-client-connection-ip': '1.2.3.4' },
      body: JSON.stringify({ ...validPayload, whatsapp: '12345' })
    });
    ok(r400.statusCode === 400, 'Teléfono inválido devuelve 400');

    // 4. Sin WA_GATEWAY_API_KEY -> 503
    delete process.env.WA_GATEWAY_API_KEY;
    const r503 = await handler({
      httpMethod: 'POST',
      headers: { Origin: 'https://tucured.ar', 'x-nf-client-connection-ip': '1.2.3.4' },
      body: JSON.stringify(validPayload)
    });
    ok(r503.statusCode === 503 && JSON.parse(r503.body).reason === 'GATEWAY_NOT_CONFIGURED', 'Sin WA_GATEWAY_API_KEY devuelve 503 GATEWAY_NOT_CONFIGURED');
    process.env.WA_GATEWAY_API_KEY = testKey;

    // 5. Flujo feliz -> 200 + 2 mensajes ordenados + x-api-key + E.164
    calls.length = 0;
    const r200 = await handler({
      httpMethod: 'POST',
      headers: { Origin: 'https://tucured.ar', 'x-nf-client-connection-ip': '1.2.3.5' },
      body: JSON.stringify(validPayload)
    });
    const body200 = JSON.parse(r200.body);
    ok(r200.statusCode === 200 && body200.ok && body200.welcomeSent && body200.alertSent, 'Flujo feliz devuelve 200 { ok: true, welcomeSent: true, alertSent: true }');
    ok(calls.length === 2, `Se dispararon exactamente 2 llamadas al gateway (got=${calls.length})`);
    ok(
      calls[0]?.url === 'https://api.tucured.com.ar/api/wa/send'
      && calls[0]?.opts?.headers?.['x-api-key'] === testKey
      && calls[0]?.body?.phone === '5493815554321'
      && calls[0]?.body?.message.includes(validPayload.activarUrl)
      && calls[0]?.body?.message.includes('Sofía'),
      'Mensaje 1 normaliza a 5493815554321, envía x-api-key e incluye activarUrl y tono positivo'
    );
    ok(
      calls[1]?.body?.phone === '5493819998888'
      && calls[1]?.body?.message.includes('Barbería Central')
      && calls[1]?.body?.message.includes('https://wa.me/5493815554321'),
      'Mensaje 2 envía alerta interna a LEO_ALERT_PHONE con resumen y link wa.me'
    );

    // 6. Rate-limit anti-abuso: repetir mismo teléfono tras envío exitoso -> 429 sin invocar fetch
    const callsBefore = calls.length;
    const r429 = await handler({
      httpMethod: 'POST',
      headers: { Origin: 'https://tucured.ar', 'x-nf-client-connection-ip': '9.9.9.9' },
      body: JSON.stringify(validPayload)
    });
    ok(r429.statusCode === 429 && calls.length === callsBefore, 'Rate-limit por teléfono devuelve 429 sin invocar fetch');

    // 7. Recuperación ante 503 transitorio: 1er llamado 503, 2do 200 -> welcomeSent & alertSent true + log seguro
    __resetRateLimits();
    calls.length = 0; warns.length = 0;
    mockResponder = async (n) => (n === 1 ? { ok: false, status: 503 } : { ok: true, status: 200 });
    const rRetry = await handler({
      httpMethod: 'POST',
      headers: { Origin: 'https://tucured.ar', 'x-nf-client-connection-ip': '2.2.2.1' },
      body: JSON.stringify({ ...validPayload, whatsapp: '1140251745' })
    });
    const bodyRetry = JSON.parse(rRetry.body);
    ok(rRetry.statusCode === 200 && bodyRetry.welcomeSent && bodyRetry.alertSent && calls.length === 3,
      `Recuperación 503 transitorio: welcomeSent=true, alertSent=true tras retry (calls=${calls.length})`);
    const warnDump = warns.join('\n');
    ok(warnDump.includes('[WA_WELCOME_GW]') && !warnDump.includes(testKey) && !warnDump.includes('5491140251745'),
      'Logging estructurado [WA_WELCOME_GW] sin fuga de API key ni teléfono completo');

    // 8. Rollback de rate-limit por teléfono ante fallo persistente 503
    __resetRateLimits();
    calls.length = 0;
    mockResponder = async () => ({ ok: false, status: 503 });
    const rFail = await handler({
      httpMethod: 'POST',
      headers: { Origin: 'https://tucured.ar', 'x-nf-client-connection-ip': '3.3.3.1' },
      body: JSON.stringify({ ...validPayload, whatsapp: '3814440099' })
    });
    const bodyFail = JSON.parse(rFail.body);
    ok(rFail.statusCode === 200 && bodyFail.welcomeSent === false, 'Fallo persistente 503 devuelve welcomeSent=false');
    mockResponder = async () => ({ ok: true, status: 200 });
    const rAfterRollback = await handler({
      httpMethod: 'POST',
      headers: { Origin: 'https://tucured.ar', 'x-nf-client-connection-ip': '3.3.3.2' },
      body: JSON.stringify({ ...validPayload, whatsapp: '3814440099' })
    });
    const bodyAfter = JSON.parse(rAfterRollback.body);
    ok(rAfterRollback.statusCode === 200 && bodyAfter.welcomeSent === true,
      'Rollback de rate-limit: reintento inmediato con mismo teléfono (otra IP) NO devuelve 429');
  } finally {
    globalThis.fetch = origFetch;
    console.warn = origWarn;
    for (const [k, v] of Object.entries(prevEnv)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

async function main() {
  runStaticChecks();
  await runBffUnitTests();
  console.log(`\nRESULTADO FINAL [TASK-101 BFF]: ${pass}/${pass + fail} PASS | FAIL=${fail}`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch(err => { console.error(err); process.exit(1); });
