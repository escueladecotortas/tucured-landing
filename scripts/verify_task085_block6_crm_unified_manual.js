// Archivo: scripts/verify_task085_block6_crm_unified_manual.js
import fs from 'fs';
import path from 'path';
import http from 'http';
import crypto from 'crypto';
import { spawn, spawnSync } from 'child_process';

const PORT_APP = 5187, PORT_CDP = 9248, BASE = `http://127.0.0.1:${PORT_APP}`;
const ENGINE = 'C:\\Users\\leola\\Downloads\\tucured-engine';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

const PAIRS = [
  ['public/admin_l2.html', 'public/admin_l2.html'], ['public/admin_l3.html', 'public/admin_l3.html'],
  ['public/turnero.html', 'public/turnero.html'], ['public/js/admin_l2/admin_l2_crm.js', 'public/js/admin_l2/admin_l2_crm.js'],
  ['public/js/admin_shared/admin_contacts_parser.js', 'public/js/admin_shared/admin_contacts_parser.js'],
  ['public/js/admin_shared/admin_contacts_store.js', 'public/js/admin_shared/admin_contacts_store.js'],
  ['public/js/admin_shared/admin_contacts_manager.js', 'public/js/admin_shared/admin_contacts_manager.js'],
  ['public/js/admin_shared/turnero_app.js', 'public/js/admin_shared/turnero_app.js'],
  ['public/js/admin_shared/admin_manual_viewer.js', 'public/js/admin_shared/admin_manual_viewer.js'],
  ['public/js/admin_shared/admin_manual_data_l2.js', 'public/js/admin_shared/admin_manual_data_l2.js'],
  ['public/js/admin_shared/admin_manual_data_l3.js', 'public/js/admin_shared/admin_manual_data_l3.js'],
  ['js/showcase_v11/showcase_core.js', 'public/js/showcase_v11/showcase_core.js'],
  ['js/showcase_v11/showcase_mockup.js', 'public/js/showcase_v11/showcase_mockup.js']
];

let pass = 0, fail = 0;
const ok = (c, m) => (c ? (console.log(`  [PASS] ${m}`), pass++) : (console.error(`  [FAIL] ${m}`), fail++));
const wait = (ms = 200) => new Promise(r => setTimeout(r, ms));
const sha256 = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex').toUpperCase();
const reqJson = (u, m = 'GET') => new Promise((res, rej) => {
  const q = http.request(u, { method: m }, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d))); });
  q.on('error', rej); q.end();
});

class Cdp {
  constructor(ws) {
    this.ws = new WebSocket(ws); this.id = 1; this.p = new Map(); this.errors = []; this.httpFails = [];
    this.ws.addEventListener('message', ev => {
      const m = JSON.parse(ev.data);
      if (m.id && this.p.has(m.id)) { const x = this.p.get(m.id); this.p.delete(m.id); m.error ? x.rej(new Error(m.error.message)) : x.res(m.result); }
      else if (m.method === 'Runtime.exceptionThrown') this.errors.push(m.params.exceptionDetails.text);
      else if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error' && !(m.params.entry.url || '').includes('favicon')) this.errors.push(m.params.entry.text);
      else if (m.method === 'Network.responseReceived' && m.params.response.url.startsWith(BASE) && m.params.response.status >= 400 && !m.params.response.url.includes('favicon')) this.httpFails.push(`${m.params.response.status} ${m.params.response.url}`);
    });
  }
  async connect() { await new Promise((r, j) => { this.ws.addEventListener('open', r, { once: true }); this.ws.addEventListener('error', j, { once: true }); }); await this.send('Runtime.enable'); await this.send('Log.enable'); await this.send('Network.enable'); await this.send('Page.enable'); }
  send(method, params = {}) { const id = this.id++; return new Promise((res, rej) => { this.p.set(id, { res, rej }); this.ws.send(JSON.stringify({ id, method, params })); }); }
  async evalJs(expr) { const r = await this.send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result?.value; }
  async goto(u) { await this.send('Page.navigate', { url: BASE + u }); for (let i = 0; i < 40; i++) { await wait(100); const st = await this.evalJs('({r:document.readyState,h:location.href})').catch(() => null); if (st && st.h.startsWith(BASE) && st.r === 'complete') break; } await wait(350); }
  close() { this.ws.close(); }
}

function runStatic() {
  console.log('\n=== 1. AUDITORÍA ESTÁTICA BLOQUE 6 (<=180L, AST, 0 INDIGO/EMOJI, SHA-256) ===');
  for (const [rel, engRel] of PAIRS) {
    const src = path.resolve(rel), eng = path.join(ENGINE, engRel);
    const txt = fs.readFileSync(src, 'utf8'), lines = txt.split(/\r?\n/);
    ok(lines.length <= 180 && /Archivo:/i.test(lines[0]), `${rel} (${lines.length}L <= 180L)`);
    if (rel.endsWith('.js')) ok(spawnSync('node', ['--check', src]).status === 0, `AST OK: ${rel}`);
    if (!rel.includes('showcase_v11')) ok(!/\bindigo\b/i.test(txt) && !EMOJI_RE.test(txt), `Sin indigo/emojis: ${rel}`);
    ok(fs.existsSync(eng) && sha256(src) === sha256(eng), `Paridad SHA-256: ${rel}`);
  }
}

async function testManualLayout(cdp, url, lvl, navExpr, vpLabel) {
  await cdp.goto(url);
  await cdp.evalJs(`sessionStorage.setItem('tucu_admin_auth','1'); location.reload();`);
  await wait(450);
  const res = await cdp.evalJs(`(() => {
    ${navExpr}
    const noAside = !document.getElementById('manual-aside-${lvl}');
    const navCls = document.getElementById('manual-nav-${lvl}')?.className || '';
    const art1 = document.querySelectorAll('#manual-content-${lvl} article').length;
    const t1 = document.querySelector('#manual-content-${lvl} article h3')?.innerText || '';
    document.querySelector('[data-manual-next="${lvl}"]')?.click();
    const t2 = document.querySelector('#manual-content-${lvl} article h3')?.innerText || '';
    document.querySelector('[data-manual-prev="${lvl}"]')?.click();
    const tBack = document.querySelector('#manual-content-${lvl} article h3')?.innerText || '';
    const inp = document.getElementById('manual-search-input-${lvl}');
    inp.value = 'feriados'; inp.dispatchEvent(new Event('input', { bubbles: true }));
    const marks = document.querySelectorAll('#manual-content-${lvl} mark').length;
    const noOverflow = document.documentElement.scrollWidth <= window.innerWidth + 1;
    return { noAside, navHoriz: navCls.includes('flex-wrap'), art1, changed: t1 !== t2, backed: tBack === t1, marks, noOverflow };
  })()`);
  ok(res.noAside && res.navHoriz && res.art1 === 1 && res.changed && res.backed && res.marks > 0 && res.noOverflow, `Manual ${vpLabel} ${lvl.toUpperCase()}: fullWidth=${res.noAside}, pills=${res.navHoriz}, foco=1 (${res.art1}), next/prev=${res.changed}/${res.backed}, marks=${res.marks}, noOverflow=${res.noOverflow}`);
}

async function main() {
  runStatic();
  const preview = spawn('node', [path.resolve('node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORT_APP), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
  const userDataDir = path.resolve('.tmp-cdp-085-b6'); try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  try {
    for (let i = 0; i < 30; i++) { try { await new Promise((r, j) => { const q = http.get(BASE + '/', res => { res.resume(); r(); }); q.on('error', j); }); break; } catch { await wait(200); } }
    let targets = [];
    for (let i = 0; i < 30; i++) { try { targets = await reqJson(`http://127.0.0.1:${PORT_CDP}/json/list`); if (targets.some(t => t.type === 'page')) break; } catch {} await wait(200); }
    const tab = targets.find(t => t.type === 'page') || await reqJson(`http://127.0.0.1:${PORT_CDP}/json/new?about:blank`, 'PUT');
    const cdp = new Cdp(tab.webSocketDebuggerUrl);
    await cdp.connect();
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });

    console.log('\n=== 2. CONSOLA L2: CRM UNIFICADO, EMAIL/CUMPLEAÑOS, BLOQUEO Y RESTAURACIÓN ===');
    await cdp.goto('/admin_l2.html?rubro=estetica');
    await cdp.evalJs(`localStorage.clear(); sessionStorage.setItem('tucu_admin_auth','1'); location.reload();`);
    await wait(450);
    const l2Crm = await cdp.evalJs(`(async () => {
      document.getElementById('main-view-btn-crm')?.click();
      const crmTxt = document.getElementById('l2-contacts-mount')?.innerText || '';
      const commercialHdr = crmTxt.includes('Clientes y Contactos') && crmTxt.includes('Gestioná tu base de clientes, datos de contacto y promociones.') && !crmTxt.includes('Normalización E.164');
      const noTodos = !document.querySelector('[data-ct-filter="all"]');
      const activeDef = document.querySelector('[data-ct-filter="active"]')?.classList.contains('is-active');
      const noDup = !document.getElementById('crm-tab-whitelist') && !document.getElementById('crm-tab-blacklist') && !document.body.innerText.includes('Gobernanza VIP');
      const noAddr = !document.getElementById('ct-address-l2');
      document.getElementById('btn-contacts-new-l2')?.click();
      document.getElementById('ct-name-l2').value = 'Sofía Bloque6';
      document.getElementById('ct-phone-l2').value = '3815998877';
      document.getElementById('ct-email-l2').value = 'sofia@tucured.ar';
      document.getElementById('ct-birthday-l2').value = '1994-05-12';
      document.getElementById('btn-ct-save-l2')?.click();
      const listTxt = document.getElementById('contacts-list-l2')?.innerText || '';
      const stored = JSON.parse(localStorage.getItem('tucu_l2_contacts_estetica') || '[]').find(x => x.name === 'Sofía Bloque6');
      const schemaOk = Boolean(stored && stored.phoneE164 === '+5493815998877' && stored.email === 'sofia@tucured.ar' && stored.birthday === '1994-05-12' && 'isRestricted' in stored && 'deletedAt' in stored && 'createdAt' in stored && 'updatedAt' in stored);
      document.querySelector('[data-ct-restrict="+5493815998877"]')?.click();
      const isRest = JSON.parse(localStorage.getItem('tucu_l2_contacts_estetica') || '[]').find(x => x.phoneE164 === '+5493815998877')?.isRestricted === true;
      window.AdminShell.confirmAsync = async () => true;
      await AdminContactsManager.deleteContact('l2', '+5493815998877');
      document.querySelector('[data-ct-filter="archived"]')?.click();
      const hasRestore = !!document.querySelector('[data-ct-restore="+5493815998877"]');
      document.querySelector('[data-ct-restore="+5493815998877"]')?.click();
      const restored = JSON.parse(localStorage.getItem('tucu_l2_contacts_estetica') || '[]').find(x => x.phoneE164 === '+5493815998877')?.deletedAt === null;
      return { commercialHdr, noTodos, activeDef, noDup, noAddr, hasEmailBday: listTxt.includes('sofia@tucured.ar') && listTxt.includes('1994-05-12'), schemaOk, isRest, hasRestore, restored };
    })()`);
    ok(l2Crm.commercialHdr && l2Crm.noTodos && l2Crm.activeDef, 'L2 copy comercial, sin píldora Todos y Activos seleccionado por defecto');
    ok(l2Crm.noDup && l2Crm.noAddr, 'L2 sin bloque duplicado VIP/Lista Blanca ni campo Dirección');
    ok(l2Crm.hasEmailBday && l2Crm.schemaOk, 'L2 alta cliente con Email, Cumpleaños y esquema Firestore-ready');
    ok(l2Crm.isRest && l2Crm.hasRestore && l2Crm.restored, 'L2 bloqueo Restringido, filtro Archivados y Restaurar en 1 clic');

    console.log('\n=== 3. CRUCE DE BLOQUEO EN TURNERO & SHOWROOM + DESBLOQUEO ===');
    await cdp.goto('/turnero.html?level=l2&rubro=estetica');
    const turneroBlocked = await cdp.evalJs(`(() => {
      TucuTurneroApp.goStep(3);
      document.getElementById('inp-client-name').value = 'Sofía Bloque6';
      document.getElementById('inp-client-phone').value = '3815998877';
      document.getElementById('btn-confirm-booking')?.click();
      return { msg: document.getElementById('turnero-restricted-notice')?.innerText || '', stillStep3: !!document.getElementById('turnero-confirm-form') };
    })()`);
    ok(turneroBlocked.stillStep3 && turneroBlocked.msg.includes('comunicate directamente con el local'), `Turnero bloquea teléfono restringido con aviso cordial`);

    await cdp.goto('/index.html');
    const showBlocked = await cdp.evalJs(`(() => {
      ShowcaseCore.selectLevel('l2'); ShowcaseCore.selectRubro('estetica');
      ShowcaseCore.updateClientData('clientPhone', '3815998877');
      ShowcaseCore.selectStep(3); ShowcaseCore.confirmBooking();
      return { msg: document.getElementById('showroom-restricted-notice')?.innerText || '', step: ShowcaseCore.getState().currentStep };
    })()`);
    ok(showBlocked.step === 3 && showBlocked.msg.includes('comunicate directamente con el local'), 'Showroom bloquea teléfono restringido con aviso cordial');

    await cdp.goto('/admin_l2.html?rubro=estetica');
    await cdp.evalJs(`document.getElementById('main-view-btn-crm')?.click(); document.querySelector('[data-ct-filter="restricted"]')?.click(); document.querySelector('[data-ct-restrict="+5493815998877"]')?.click();`);
    await cdp.goto('/turnero.html?level=l2&rubro=estetica');
    const turneroUnblocked = await cdp.evalJs(`(() => {
      TucuTurneroApp.goStep(3);
      document.getElementById('inp-client-name').value = 'Sofía Bloque6';
      document.getElementById('inp-client-phone').value = '3815998877';
      document.getElementById('btn-confirm-booking')?.click();
      return !!document.getElementById('ticket-code-badge');
    })()`);
    ok(turneroUnblocked, 'Desbloqueo en L2 permite reservar normalmente en Turnero');

    console.log('\n=== 4. CONSOLA L3: PARIDAD DIRECTORIO UNIFICADO & MANUALES DESKTOP L1/L2/L3 ===');
    await cdp.goto('/admin_l3.html?rubro=peluqueria_estetica');
    await cdp.evalJs(`sessionStorage.setItem('tucu_admin_auth','1'); location.reload();`);
    await wait(450);
    const l3Crm = await cdp.evalJs(`(async () => {
      document.querySelector('[data-tab="clients"]')?.click();
      const noAddr = !document.getElementById('ct-address-l3');
      document.getElementById('btn-contacts-new-l3')?.click();
      document.getElementById('ct-name-l3').value = 'Lucas L3';
      document.getElementById('ct-phone-l3').value = '3815223344';
      document.getElementById('ct-email-l3').value = 'lucas@tucured.ar';
      document.getElementById('ct-birthday-l3').value = '1991-09-20';
      document.getElementById('btn-ct-save-l3')?.click();
      document.querySelector('[data-ct-restrict="+5493815223344"]')?.click();
      window.AdminShell.confirmAsync = async () => true;
      await AdminContactsManager.deleteContact('l3', '+5493815223344');
      document.querySelector('[data-ct-filter="archived"]')?.click();
      document.querySelector('[data-ct-restore="+5493815223344"]')?.click();
      const rec = JSON.parse(localStorage.getItem('tucu_l3_contacts_peluqueria_estetica') || '[]').find(x => x.phoneE164 === '+5493815223344');
      return { noAddr, ok: Boolean(rec && rec.email === 'lucas@tucured.ar' && rec.birthday === '1991-09-20' && rec.isRestricted && rec.deletedAt === null) };
    })()`);
    ok(l3Crm.noAddr && l3Crm.ok, 'L3 Contactos & CRM paridad completa (email, birthday, bloqueo y restauración)');

    await testManualLayout(cdp, '/admin_l1.html', 'l1', `document.getElementById('main-view-btn-manual')?.click();`, '1280x800');
    await testManualLayout(cdp, '/admin_l2.html', 'l2', `document.getElementById('main-view-btn-manual')?.click();`, '1280x800');
    await testManualLayout(cdp, '/admin_l3.html', 'l3', `document.querySelector('[data-tab="manual"]')?.click();`, '1280x800');
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 667, deviceScaleFactor: 2, mobile: true });
    await testManualLayout(cdp, '/admin_l1.html', 'l1', `document.getElementById('main-view-btn-manual')?.click();`, '375x667');
    await testManualLayout(cdp, '/admin_l2.html', 'l2', `document.getElementById('main-view-btn-manual')?.click();`, '375x667');
    await testManualLayout(cdp, '/admin_l3.html', 'l3', `document.querySelector('[data-tab="manual"]')?.click();`, '375x667');
    ok(cdp.errors.length === 0 && cdp.httpFails.length === 0, `0 errores JS y 0 HTTP>=400 (errors=${cdp.errors.length}, http=${cdp.httpFails.length})`);
    cdp.close();
  } finally {
    try { chrome.kill('SIGKILL'); } catch {}
    try { preview.kill('SIGKILL'); } catch {}
    await wait(300);
    try { fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  }

  console.log(`\nRESULTADO BLOQUE 6: ${pass}/${pass + fail} PASS | FAIL=${fail}\n`);
  process.exit(fail > 0 ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
