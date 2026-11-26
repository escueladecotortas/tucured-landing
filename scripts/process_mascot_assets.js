// Archivo: scripts/process_mascot_assets.js
// Pipeline Chroma Key sin halo verde (VP9 alpha .webm + .webp animado + mascot_poster.webp) (< 170L)

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const RAW_DIR = path.resolve('public/assets/mascot/raw');
const OUT_DIR = path.resolve('public/assets/mascot');
const SCRATCH_DIR = 'C:\\Users\\leola\\.gemini\\antigravity\\brain\\3a38f661-b627-406d-b0e2-ac8fa5459cf9\\scratch';

const CLIPS = [
  { id: 'intro', src: '01_intro_logo.mp4', loop: 1, isWide: true, webpFps: 10, webpQ: 58 },
  { id: 'idle', src: '02_idle.mp4', loop: 0, isWide: false, webpFps: 12, webpQ: 60 },
  { id: 'thinking', src: '03_thinking.mp4', loop: 0, isWide: false, webpFps: 12, webpQ: 60 },
  { id: 'celebrate', src: '04_celebrate.mp4', loop: 1, isWide: false, webpFps: 12, webpQ: 60 },
  { id: 'wink', src: '05_wink.mp4', loop: 1, isWide: false, webpFps: 12, webpQ: 60 },
  { id: 'advisor', src: '06_advisor.mp4', loop: 0, isWide: false, webpFps: 12, webpQ: 60 }
];

function runFfmpeg(args) {
  execFileSync('ffmpeg', ['-y', '-v', 'error', ...args], { stdio: 'pipe' });
}

function probeFile(filePath) {
  const out = execFileSync('ffprobe', [
    '-v', 'error', '-c:v', filePath.endsWith('.webm') ? 'libvpx-vp9' : 'webp',
    '-select_streams', 'v:0',
    '-show_entries', 'stream=codec_name,width,height,pix_fmt,r_frame_rate,duration:stream_tags=alpha_mode',
    '-of', 'json', filePath
  ], { encoding: 'utf8' });
  return JSON.parse(out).streams?.[0] || {};
}

function detectChromaHex(srcPath, isImage = false) {
  const args = isImage ? [] : ['-ss', '0.5'];
  args.push('-i', srcPath, '-frames:v', '1', '-vf', 'crop=16:16:8:8,scale=1:1', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-');
  const buf = execFileSync('ffmpeg', ['-v', 'error', ...args], { stdio: ['ignore', 'pipe', 'pipe'] });
  return [...buf].slice(0, 3).map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function buildFilter(hex, isWide) {
  const key = `colorkey=0x${hex}:0.26:0.08,despill=type=green:mix=0.5:expand=0,format=rgba,lutrgb=a='if(lt(val\\,16)\\,0\\,val)'`;
  if (isWide) return `${key},scale=560:315:flags=lanczos,format=yuva420p`;
  return `crop=860:720:210:0,${key},pad=860:860:0:70:0x00000000,scale=360:360:flags=lanczos,format=yuva420p`;
}

function processClip(clip) {
  const srcPath = path.join(RAW_DIR, clip.src);
  if (!fs.existsSync(srcPath)) throw new Error(`Falta clip crudo: ${srcPath}`);
  const hex = detectChromaHex(srcPath);
  const vf = buildFilter(hex, clip.isWide);

  const webmPath = path.join(OUT_DIR, `${clip.id}.webm`);
  runFfmpeg([
    '-i', srcPath, '-vf', `${vf},fps=24`,
    '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-auto-alt-ref', '0',
    '-crf', clip.isWide ? '33' : '31', '-b:v', '0', '-an', webmPath
  ]);

  const webpPath = path.join(OUT_DIR, `${clip.id}.webp`);
  const webpVf = vf.replace(',format=yuva420p', '') + `,fps=${clip.webpFps},format=rgba`;
  runFfmpeg([
    '-i', srcPath, '-vf', webpVf,
    '-c:v', 'libwebp_anim', '-lossless', '0', '-q:v', String(clip.webpQ),
    '-compression_level', '3', '-loop', String(clip.loop), '-an', webpPath
  ]);

  return { hex, webmPath, webpPath };
}

function processPoster() {
  const srcPath = path.join(RAW_DIR, 'mascot_verde_16x9.png');
  if (!fs.existsSync(srcPath)) throw new Error(`Falta imagen base: ${srcPath}`);
  const hex = detectChromaHex(srcPath, true);
  const posterPath = path.join(OUT_DIR, 'mascot_poster.webp');
  const vf = `crop=860:720:210:0,colorkey=0x${hex}:0.24:0.06,despill=type=green:mix=0.5:expand=0,format=rgba,pad=860:860:0:70:0x00000000,scale=360:360:flags=lanczos`;
  runFfmpeg(['-i', srcPath, '-frames:v', '1', '-vf', vf, '-c:v', 'libwebp', '-lossless', '0', '-q:v', '82', posterPath]);
  return { hex, posterPath };
}

function compositeSample(mediaPath, timeSec, outName) {
  fs.mkdirSync(SCRATCH_DIR, { recursive: true });
  const outPng = path.join(SCRATCH_DIR, outName);
  const args = timeSec === null ? ['-i', mediaPath] : ['-c:v', 'libvpx-vp9', '-i', mediaPath, '-ss', String(timeSec)];
  runFfmpeg([...args, '-frames:v', '1', '-filter_complex', 'color=c=0xFAF8F5:s=600x400[bg];[bg][0:v]overlay=(W-w)/2:(H-h)/2:shortest=1', outPng]);
  return outPng;
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const onlyIds = new Set(process.argv.slice(2).filter(Boolean));
  const selected = onlyIds.size ? CLIPS.filter(c => onlyIds.has(c.id)) : CLIPS;
  if (!selected.length) throw new Error('Sin clips coincidentes.');

  console.log('\n=== PIPELINE CHROMA KEY MASCOTA TUCURED ===');
  const summary = [], checks = [];

  for (const clip of selected) {
    const { hex, webmPath, webpPath } = processClip(clip);
    const sWebm = probeFile(webmPath);
    summary.push({
      file: `${clip.id}.webm`, chroma: `#${hex}`, dims: `${sWebm.width}x${sWebm.height}`,
      pix_fmt: sWebm.pix_fmt, alpha: sWebm.tags?.alpha_mode || '1', kb: Number((fs.statSync(webmPath).size / 1024).toFixed(1))
    });
    summary.push({
      file: `${clip.id}.webp`, chroma: `#${hex}`, dims: clip.isWide ? '560x315' : '360x360',
      pix_fmt: 'rgba_anim', alpha: '1', kb: Number((fs.statSync(webpPath).size / 1024).toFixed(1))
    });
    checks.push(compositeSample(webmPath, clip.id === 'intro' ? 0.25 : 1.5, `check_${clip.id}.png`));
  }

  if (!onlyIds.size || onlyIds.has('poster')) {
    const { hex: pHex, posterPath } = processPoster();
    const sPoster = probeFile(posterPath);
    summary.push({
      file: 'mascot_poster.webp', chroma: `#${pHex}`, dims: `${sPoster.width}x${sPoster.height}`,
      pix_fmt: sPoster.pix_fmt, alpha: '1', kb: Number((fs.statSync(posterPath).size / 1024).toFixed(1))
    });
    checks.push(compositeSample(posterPath, null, 'check_poster.png'));
  }

  console.table(summary);
  console.log('Muestras compuestas sobre #FAF8F5:', checks);
}

main();
