// Archivo: js/utils/sound_fx.js
/**
 * 🔊 Tucu Red Web V2 - Retroalimentación Sensorial Nativa (Haptics & Web Audio API)
 * Sonido mecánico seco de 650Hz y vibración háptica de 12ms. Cero archivos de audio externos.
 * Restricción estricta: < 60 líneas.
 */

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx && typeof window !== 'undefined') {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function triggerHaptic(duration = 12) {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function' && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) {
      navigator.vibrate(duration);
    }
  } catch (_) {}
}

export function playClickSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, ctx.currentTime);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.045);
  } catch (_) {}
}

export function triggerSensoryFeedback() {
  triggerHaptic(12);
  playClickSound();
}

