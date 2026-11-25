// Archivo: scripts/verify_task113b_helpers.js
// Helpers estáticos, cliente CDP, higiene dist/, #funnel y suite móvil 375x667 (< 165L)

import fs from 'fs';
import path from 'path';
import http from 'http';
import { execSync } from 'child_process';

export const PORT_APP = 5174;
export const PORT_CDP = 9268;
export const BASE = `http://127.0.0.1:${PORT_APP}`;
export const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
export const EMOJI_RX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
export const LEGACY_RX = /Turnero Autónomo|Central Pro Multi-Box|Multi-Staff & Recursos|\bNivel [123]\b|font-mono/;

export const CHECK_FILES = [
  'vite.config.js', 'index.html', 'js/components/funnel.js', 'js/components/funnel_markup.js',
  'public/empezar.html', 'public/activar.html', 'public/css/empezar_mascot.css',
  'public/js/empezar_mascot_stage.js', 'public/js/empezar_mascot.js',
  'public/js/empezar_services_step.js', 'public/js/empezar_micro_steps.js',
  'public/js/empezar_tones.js', 'public/js/empezar_covers.js', 'public/js/empezar_checkout_ui.js',
  'public/js/empezar_color_extract.js', 'public/js/empezar_image_processor.js',
  'public/js/empezar_tagline_assist.js', 'public/js/empezar_slug_check.js',
  'public/js/empezar/empezar_state.js', 'public/js/empezar/empezar_media.js',
  'public/js/empezar/empezar_preview.js', 'public/js/empezar/empezar_steps.js',
  'public/js/empezar/empezar_submit.js', 'public/js/empezar/empezar_app.js',
  'public/js/activar/activar_data.js', 'public/js/activar/activar_app.js',
  'scripts/process_mascot_assets.js', 'scripts/verify_task113b_helpers.js', 'scripts/verify_task113b_empezar_wizard.js'
];

export const wait = (ms) => new Promise(r => setTimeout(r, ms));
export const reqJson = (u, m = 'GET') => new Promise((res, rej) => {
  const q = http.request(u, { method: m }, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d || '{}'))); });
  q.on('error', rej); q.end();
});

export class Cdp {
  constructor(ws) { this.ws = new WebSocket(ws); this.id = 0; this.pending = new Map(); this.errors = []; this.httpBad = []; }
  async connect() {
    await new Promise((r, j) => { this.ws.addEventListener('open', r, { once: true }); this.ws.addEventListener('error', j, { once: true }); });
    this.ws.addEventListener('message', ev => {
      const m = JSON.parse(ev.data);
      if (m.id && this.pending.has(m.id)) { const p = this.pending.get(m.id); this.pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); }
      else if (m.method === 'Runtime.exceptionThrown') this.errors.push(m.params?.exceptionDetails?.text || 'Exception');
      else if (m.method === 'Log.entryAdded' && m.params?.entry?.level === 'error') this.errors.push(m.params.entry.text);
      else if (m.method === 'Network.responseReceived' && m.params?.response?.url?.startsWith(BASE) && !m.params?.response?.url?.endsWith('/favicon.ico') && m.params?.response?.status >= 400) this.httpBad.push(`${m.params.response.status} ${m.params.response.url}`);
    });
    await this.send('Page.enable'); await this.send('Runtime.enable'); await this.send('Network.enable'); await this.send('Log.enable');
  }
  send(method, params = {}) { const id = ++this.id; return new Promise((res, rej) => { this.pending.set(id, { res, rej }); this.ws.send(JSON.stringify({ id, method, params })); }); }
  async goto(u) { await this.send('Page.navigate', { url: BASE + u }); await wait(750); }
  async evalJs(expr) { const r = await this.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text || 'Eval error'); return r.result?.value; }
  close() { try { this.ws.close(); } catch {} }
}

export function runStaticAudit(ok) {
  console.log('\n=== 1. AUDITORÍA ESTÁTICA [TASK-113B]: <200L, AST, JSON 360 & HIGIENE DIST ===');
  for (const rel of CHECK_FILES) {
    const abs = path.resolve(rel), txt = fs.readFileSync(abs, 'utf8'), lines = txt.split(/\r?\n/);
    ok(lines.length < 200 && /Archivo:/i.test(lines[0]), `${rel} (${lines.length}L < 200L + encabezado)`);
    if (rel.endsWith('.js')) { let ast = true; try { execSync(`node --check "${abs}"`, { stdio: 'pipe' }); } catch { ast = false; } ok(ast, `AST OK: ${rel}`); }
    if (!rel.startsWith('scripts/')) ok(!LEGACY_RX.test(txt) && !EMOJI_RX.test(txt), `Limpio (0 legacy, 0 font-mono, 0 emojis): ${rel}`);
  }
  const pool = JSON.parse(fs.readFileSync(path.resolve('public/assets/data/taglines_pool.json'), 'utf8'));
  const all = new Set(); let validLen = true, hasEmoji = false;
  for (const r of ['peluqueria', 'estetica', 'gastronomia', 'deportes', 'salud', 'servicios']) {
    for (const t of ['cercano', 'boutique', 'agil', 'profesional']) {
      const arr = pool[r]?.[t] || []; if (arr.length < 15) validLen = false;
      for (const s of arr) { all.add(s); if (s.length > 95) validLen = false; if (EMOJI_RX.test(s)) hasEmoji = true; }
    }
  }
  ok(all.size >= 360 && validLen && !hasEmoji, `taglines_pool.json: ${all.size} frases únicas <= 95 chars, 0 emojis`);
  const distEmp = fs.readFileSync(path.resolve('dist/empezar.html'), 'utf8');
  ok(['name="alta-empezar-tucured"', 'name="comercio"', 'name="slug"', 'name="rubro"', 'name="bajada"', 'name="accent"', 'name="plan"', 'name="tono_voz"', 'name="cover_id"', 'name="servicios_iniciales"', 'name="asistencia_carga"', 'name="logo_file"', 'name="cover_file"'].every(f => distEmp.includes(f)), 'dist/empezar.html preserva formulario + servicios_iniciales + asistencia_carga');
  const expectedMascot = ['intro.webm', 'intro.webp', 'idle.webm', 'idle.webp', 'thinking.webm', 'thinking.webp', 'celebrate.webm', 'celebrate.webp', 'mascot_poster.webp'];
  ok(expectedMascot.every(f => fs.existsSync(path.resolve('dist/assets/mascot', f))) && !fs.existsSync(path.resolve('dist/assets/mascot/raw')), 'dist/assets/mascot contiene 9 assets finales y excluye raw/');
}

export async function runIndexFunnelCheck(cdp, ok) {
  console.log('\n=== 2. AUDITORÍA INDEX.HTML (#funnel LIMPIO -> /empezar.html) ===');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await cdp.goto('/');
  for (let t = 0; t < 50; t++) { if (await cdp.evalJs(`Boolean(document.getElementById('btn-funnel-launch'))`)) break; await wait(120); }
  const idx = await cdp.evalJs(`(() => {
    const f = document.getElementById('funnel'), launch = document.getElementById('btn-funnel-launch'), wa = document.getElementById('btn-funnel-wa');
    const oldForm = document.getElementById('tucured-funnel-form'), oldSvg = f?.querySelector('.tucu-mascot-svg');
    const media = document.getElementById('funnel-mascot-video') || document.getElementById('funnel-mascot-img');
    const src = media?.querySelector('source')?.getAttribute('src') || media?.getAttribute('src') || '';
    window.dispatchEvent(new CustomEvent('tucured:level-selected', { detail: { level: 'l3' } }));
    return { hasMedia: Boolean(media) && src.includes('/assets/mascot/idle.'), hasOldSvg: Boolean(oldSvg), launchText: launch?.innerText?.trim() || '', launchHref: launch?.getAttribute('href') || '', hasWa: Boolean(wa?.getAttribute('href')?.includes('wa.me/')), hasOldForm: Boolean(oldForm) };
  })()`);
  ok(idx.hasMedia && !idx.hasOldSvg && idx.launchText.includes('Crear mi App de turnos ahora') && idx.launchHref.includes('/empezar.html?plan=l3') && idx.hasWa && !idx.hasOldForm, 'index.html #funnel limpio con nueva mascota transparente (0 SVG viejo), CTA /empezar.html y 0 formulario legacy');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 667, deviceScaleFactor: 1, mobile: true });
  await wait(120);
  ok(!await cdp.evalJs(`document.documentElement.scrollWidth > window.innerWidth`), 'index.html móvil 375x667: 0 overflow horizontal');
}

export async function runMobile(cdp, ok) {
  console.log('\n=== 4. E2E MÓVIL 375x667 (10 MICRO-PANTALLAS 0 OVERFLOW + BARRA FLOTANTE) ===');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 667, deviceScaleFactor: 1, mobile: true });
  await cdp.goto('/empezar.html?plan=l1&rubro=peluqueria');
  for (let t = 0; t < 25; t++) { if (await cdp.evalJs(`Boolean(document.getElementById('btn-open-mobile-preview'))`)) break; await wait(120); }
  const mob = await cdp.evalJs(`(async () => {
    const w = (ms=55) => new Promise(r => setTimeout(r, ms));
    localStorage.removeItem('tucu_empezar_draft_v2');
    const origFetch = window.fetch;
    window.fetch = async (url, opts = {}) => {
      const u = String(url);
      if (u.includes('/api/portal/check-slug/')) return new Response(JSON.stringify({ ok: true, slug: u.split('/').pop(), available: true, reason: null, suggestions: [] }), { status: 200 });
      return origFetch(url, opts);
    };
    const overflows = [];
    const chk = (step) => { if (document.documentElement.scrollWidth > window.innerWidth) overflows.push(step); };
    chk(1);
    const biz = document.getElementById('emp-comercio'); biz.value = 'Don Julio'; biz.dispatchEvent(new Event('input', { bubbles: true }));
    document.getElementById('btn-emp-next').click(); await w(); chk(2);
    document.getElementById('btn-emp-next').click(); await w(); chk(3);
    document.getElementById('btn-emp-next').click(); await w(); chk(4);
    document.getElementById('btn-emp-next').click(); await w(); chk(5);
    document.getElementById('btn-emp-next').click(); await w(); chk(6);
    const dir = document.getElementById('emp-direccion'); dir.value = '25 de Mayo 480'; dir.dispatchEvent(new Event('input', { bubbles: true }));
    document.getElementById('btn-emp-next').click(); await w(); chk(7);
    document.getElementById('btn-emp-next').click(); await w(); chk(8);
    const sl = document.getElementById('emp-slug'); sl.value = 'don-julio-barber'; sl.dispatchEvent(new Event('input', { bubbles: true })); await w(460);
    document.getElementById('btn-emp-next').click(); await w(); chk(9);
    const setV = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
    setV('emp-first', 'Julio'); setV('emp-last', 'Sosa'); setV('emp-whatsapp', '3815554321'); setV('emp-email', 'julio@barber.ar');
    document.getElementById('btn-emp-next').click(); await w(); chk(10);
    const bar = document.getElementById('emp-mobile-floating-bar'), btn = document.getElementById('btn-open-mobile-preview'), barRect = bar.getBoundingClientRect();
    btn.click(); await w(90); const drawerVid = Boolean(document.querySelector('#empezar-mobile-preview-mount #preview-cover-video'));
    document.getElementById('btn-close-mobile-preview').click(); await w();
    return { overflows, barFixedBottom: getComputedStyle(bar).position === 'fixed' && barRect.bottom <= 668 && barRect.height > 40, btnText: btn.innerText.trim(), drawerVid };
  })()`);
  ok(mob.overflows.length === 0 && mob.barFixedBottom && mob.btnText === 'Ver cómo queda mi App' && mob.drawerVid, `Móvil 375x667: 0 overflow en 10 pasos (bad=${mob.overflows.join(',')}), barra "Ver cómo queda mi App" y video OK`);
}
