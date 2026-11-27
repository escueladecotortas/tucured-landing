// Archivo: scripts/verify_bloque2b_helpers.js
// Helpers CDP, auditoría estática y compuerta Lumi Gate para Bloque 2B + Pulido B (< 150L)

import fs from 'fs';
import path from 'path';
import http from 'http';
import { execSync } from 'child_process';

export const BASE = 'http://127.0.0.1:5174';
export const PORT_CDP = 9286;
export const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));
export const reqJson = (u, m = 'GET') => new Promise((res, rej) => { const q = http.request(u, { method: m }, (r) => { let d = ''; r.on('data', (c) => d += c); r.on('end', () => res(JSON.parse(d || '{}'))); }); q.on('error', rej); q.end(); });

export class Cdp {
  constructor(ws) { this.ws = new WebSocket(ws); this.id = 0; this.pending = new Map(); this.errors = []; this.httpBad = []; }
  async connect() {
    await new Promise((r, j) => { this.ws.addEventListener('open', r, { once: true }); this.ws.addEventListener('error', j, { once: true }); });
    this.ws.addEventListener('message', (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && this.pending.has(m.id)) { const p = this.pending.get(m.id); this.pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); }
      else if (m.method === 'Runtime.exceptionThrown') this.errors.push(m.params?.exceptionDetails?.text || 'Exception');
      else if (m.method === 'Log.entryAdded' && m.params?.entry?.level === 'error') { const u = m.params.entry.url || ''; if ((!u || u.startsWith(BASE)) && !/mercadopago/i.test(m.params.entry.text)) this.errors.push(m.params.entry.text); }
      else if (m.method === 'Network.responseReceived' && m.params?.response?.url?.startsWith(BASE) && !m.params.response.url.endsWith('/favicon.ico') && m.params.response.status >= 400) this.httpBad.push(`${m.params.response.status} ${m.params.response.url}`);
    });
    await this.send('Page.enable'); await this.send('Runtime.enable'); await this.send('Network.enable'); await this.send('Log.enable');
    await this.send('Page.addScriptToEvaluateOnNewDocument', { source: "window.TUCU_ENGINE_URL='https://engine.tucured.com.ar';window.TUCU_SKIP_MODERATION=true;" });
  }
  send(method, params = {}) { const id = ++this.id; return new Promise((res, rej) => { this.pending.set(id, { res, rej }); this.ws.send(JSON.stringify({ id, method, params })); }); }
  async goto(u, ready = "document.readyState==='complete' && Boolean(document.getElementById('empezar-step-mount'))") {
    await this.send('Page.navigate', { url: BASE + u });
    for (let i = 0; i < 45; i++) { await wait(120); if (await this.evalJs(ready).catch(() => false)) break; }
    await wait(250);
  }
  async evalJs(e) { const r = await this.send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text || 'Eval error'); return r.result?.value; }
  close() { try { this.ws.close(); } catch {} }
}

export async function assertLumiVisible(cdp, label, minSize, ok) {
  let m = {};
  for (let i = 0; i < 14; i++) {
    m = await cdp.evalJs(`(()=>{const a=document.getElementById('tucu-mascot-actor'),h=document.getElementById('emp-header');if(!a||!h)return{ok:false};const r=a.getBoundingClientRect(),hb=h.getBoundingClientRect().bottom,cs=getComputedStyle(a),m=a.querySelector('.tucu-mascot-media.is-clip-active'),mcs=m?getComputedStyle(m):null,vw=window.innerWidth,vh=window.innerHeight,dimOk=r.width>=${minSize}&&r.height>=${minSize},stOk=cs.display!=='none'&&cs.visibility!=='hidden'&&parseFloat(cs.opacity)>0.9&&Boolean(mcs)&&mcs.display!=='none'&&mcs.visibility!=='hidden'&&parseFloat(mcs.opacity)>0.9,posOk=r.top>=hb-1&&r.left>=-1&&r.right<=vw+1&&r.bottom<=vh+1,medOk=Boolean(m&&(m.tagName==='VIDEO'?(m.readyState>=2&&m.videoWidth>0):(m.complete&&m.naturalWidth>0))),hit=(r.width>0&&r.height>0)?document.elementFromPoint(r.left+r.width/2,r.top+r.height/2):null,unocc=Boolean(hit&&(hit===a||a.contains(hit)));return{ok:dimOk&&stOk&&posOk&&medOk&&unocc,w:Math.round(r.width),h:Math.round(r.height),top:Math.round(r.top),hb:Math.round(hb),op:mcs?mcs.opacity:'0',medOk,unocc,posOk,clip:m?.dataset?.clipKey||'',tag:m?.tagName||''};})()`);
    if (m.ok) break;
    await wait(100);
  }
  ok(m.ok, `Lumi visible [${label}]: ${m.w}x${m.h} op=${m.op} mediaDecoded=${m.medOk} unoccluded=${m.unocc} top(${m.top})>=hb(${m.hb}) [${m.tag}:${m.clip}]`);
}

export function runStaticAudit(ok) {
  console.log('\n=== 1. AUDITORÍA ESTÁTICA (<200L, AST, TEMPORALES .WEBP, DIST LIMPIO) ===');
  const files = [
    'js/components/funnel.js', 'js/components/funnel_markup.js', 'public/css/empezar_mascot.css',
    'public/js/empezar_specialty_data.js', 'public/js/empezar_phrases_bank.js', 'public/js/empezar_terms_modal.js',
    'public/js/empezar_mascot_stage.js', 'public/js/empezar_mascot.js', 'public/js/empezar_lumi_advisor.js',
    'public/js/empezar_preview_styles.js', 'public/js/empezar/empezar_preview.js', 'public/js/empezar/empezar_state.js',
    'public/js/empezar_color_extract.js', 'public/js/empezar_covers.js', 'public/js/empezar_tagline_assist.js',
    'public/js/empezar_tones.js', 'public/js/activar/activar_data.js', 'public/js/activar/activar_app.js',
    'public/js/empezar/empezar_media.js', 'public/js/empezar_services_step.js', 'public/js/empezar_micro_steps.js',
    'public/js/empezar_checkout_ui.js', 'public/js/empezar_mp_brick.js', 'public/js/empezar_step11.js',
    'public/js/empezar/empezar_steps.js', 'public/js/empezar/empezar_submit.js', 'public/js/empezar/empezar_events.js',
    'public/js/empezar/empezar_app.js', 'public/empezar.html', 'netlify/functions/wa-welcome.js',
    'scripts/verify_bloque2b_helpers.js', 'scripts/verify_bloque2b_empezar.js'
  ];
  const badLen = [], badAst = [];
  for (const rel of files) {
    const abs = path.resolve(rel), lines = fs.readFileSync(abs, 'utf8').split(/\r?\n/);
    if (lines.length >= 200 || !/Archivo:/i.test(lines[0])) badLen.push(`${rel}:${lines.length}L`);
    if (rel.endsWith('.js')) { try { execSync(`node --check "${abs}"`, { stdio: 'pipe' }); } catch { badAst.push(rel); } }
  }
  ok(badLen.length === 0, `Todos los archivos <200L y con cabecera Archivo (${files.length}; fallos=${badLen.join(',') || '0'})`);
  ok(badAst.length === 0, `AST node --check OK (fallos=${badAst.join(',') || '0'})`);
  const tempFiles = fs.existsSync('dist/assets/covers/temp') ? fs.readdirSync('dist/assets/covers/temp') : [];
  const tempSizesOk = tempFiles.length === 5 && tempFiles.every((f) => f.endsWith('.webp') && fs.statSync(path.join('dist/assets/covers/temp', f)).size <= 90 * 1024);
  const distMascot = fs.existsSync('dist/assets/mascot') ? fs.readdirSync('dist/assets/mascot') : [];
  ok(tempSizesOk && distMascot.length === 13 && !fs.existsSync('dist/assets/mascot/raw') && !fs.existsSync('dist/lab') && !fs.existsSync('dist/lab_portadas.html'), 'dist/ limpio: 5 temporales .webp <=90KB, 13 Lumi, sin raw/lab');
}