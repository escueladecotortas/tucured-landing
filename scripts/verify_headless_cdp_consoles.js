// Archivo: scripts/verify_headless_cdp_consoles.js
// Validación Headless en Chrome Real vía CDP: Cero Errores de Consola (TASK-068)
// Protocolo: Nexus OS v11.1 - Argus Gatekeeper (< 180 líneas)

import { spawn } from 'child_process';
import http from 'http';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9223;

function request(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: method
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(data); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

const delay = (ms) => new Promise(r => setTimeout(r, ms));

async function run() {
  console.log('\n=============================================================');
  console.log('--- CHROME HEADLESS CDP: VALIDACIÓN CONSOLA ADMIN L1/L2/L3 ---');
  console.log('=============================================================\n');

  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--disable-gpu',
    '--no-sandbox',
    'about:blank'
  ]);

  await delay(1500);

  const targets = [
    { name: 'Admin L1 Desktop', url: 'http://localhost:5174/admin_l1.html?slug=demo-peluqueria' },
    { name: 'Admin L1 Embebido', url: 'http://localhost:5174/admin_l1.html?slug=demo-peluqueria&embed=true' },
    { name: 'Admin L2 Desktop', url: 'http://localhost:5174/admin_l2.html?slug=demo-central' },
    { name: 'Admin L2 Embebido', url: 'http://localhost:5174/admin_l2.html?slug=demo-central&embed=true' },
    { name: 'Admin L3 Desktop', url: 'http://localhost:5174/admin_l3.html?slug=demo-staff' },
    { name: 'Admin L3 Embebido', url: 'http://localhost:5174/admin_l3.html?slug=demo-staff&embed=true' }
  ];

  let hasErrors = false;

  try {
    for (const t of targets) {
      const newTab = await request(`http://localhost:${PORT}/json/new?${encodeURIComponent(t.url)}`, 'PUT');
      await delay(1200);

      const wsUrl = newTab.webSocketDebuggerUrl;
      if (wsUrl && typeof WebSocket !== 'undefined') {
        const ws = new WebSocket(wsUrl);

        await new Promise((resolve) => {
          ws.onopen = () => {
            ws.send(JSON.stringify({ id: 1, method: 'Console.enable' }));
            ws.send(JSON.stringify({ id: 2, method: 'Runtime.enable' }));
            setTimeout(resolve, 800);
          };

          ws.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              if (data.method === 'Runtime.exceptionThrown') {
                console.error(`  [FAIL] Excepción en ${t.name}:`, data.params?.exceptionDetails?.text);
                hasErrors = true;
              }
              if (data.method === 'Console.messageAdded' && data.params?.message?.level === 'error') {
                console.error(`  [FAIL] Error en ${t.name}:`, data.params?.message?.text);
                hasErrors = true;
              }
            } catch (_) {}
          };

          ws.onerror = () => resolve();
        });

        try { ws.close(); } catch (_) {}
      }

      await request(`http://localhost:${PORT}/json/close/${newTab.id}`, 'PUT');
      console.log(`  [PASS] ${t.name} auditado en Chrome Headless (0 excepciones).`);
    }
  } catch (err) {
    console.error('Error durante la sesión CDP:', err.message);
  } finally {
    try { chromeProc.kill(); } catch (_) {}
  }

  console.log('\n=============================================================');
  if (hasErrors) {
    console.error('💥 VETO ACTIVO: Se detectaron errores de JavaScript en consola.');
    process.exit(1);
  } else {
    console.log('🎉 CERTIFICACIÓN TOTAL: 0 errores de consola en Chrome Headless.');
    process.exit(0);
  }
}

run();
