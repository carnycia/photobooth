// Enhanced Web Audio API sound synthesizer for camera beeps and shutter clicks
// 100% offline, zero latency, tuned specifically for mobile speakers & iOS Safari

let audioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Crucial for iOS Safari: Call synchronously on user click/touch event
 * to unlock Web Audio playback for subsequent asynchronous code.
 */
export function unlockAudio() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    // Play a 1-sample silent buffer to firmly unlock the audio output pipeline on iOS
    const silentBuf = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = silentBuf;
    src.connect(ctx.destination);
    src.start(0);
  } catch (err) {
    console.warn("Audio unlock error:", err);
  }
}

/**
 * Play a clear, loud countdown beep (tuned with harmonics to be audible on phone speakers)
 * @param count - The countdown number (3, 2, or 1)
 */
export function playCountdownBeep(count: number) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;
    const isLast = count === 1;

    // Pitch: higher on 1 to signal the snap is next
    const baseFreq = isLast ? 1200 : 880;
    const duration = isLast ? 0.16 : 0.11;

    // Primary Tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(baseFreq, now);

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.7, now + 0.015);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    // Harmonic Tone (adds crispness for small smartphone speakers)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(baseFreq * 2, now);

    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.linearRampToValueAtTime(0.25, now + 0.015);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  } catch (e) {
    console.warn("Countdown beep error:", e);
  }
}

/**
 * Play an unmistakable, loud, multi-stage mechanical camera shutter sound
 * Combines mechanical curtain snap, mirror slap, and low punch.
 */
export function playShutterSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;

    // Stage 1: Mirror flip & curtain open (immediate)
    playMechanicalSnap(ctx, now, 2400, 500, 0.06, 0.85);
    playThump(ctx, now, 150, 40, 0.07, 0.7);

    // Stage 2: Curtain closing & spring slap (60ms later)
    playMechanicalSnap(ctx, now + 0.065, 1800, 300, 0.08, 0.95);
    playThump(ctx, now + 0.065, 120, 35, 0.08, 0.6);

    // Stage 3: Secondary metallic latch echo (120ms later)
    playMechanicalSnap(ctx, now + 0.13, 1200, 600, 0.04, 0.35);
  } catch (e) {
    console.warn("Shutter sound error:", e);
  }
}

function playMechanicalSnap(
  ctx: AudioContext,
  startTime: number,
  startFreq: number,
  endFreq: number,
  duration: number,
  volume: number
) {
  // Pitch-drop click oscillator
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(startFreq, startTime);
  osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), startTime + duration);

  oscGain.gain.setValueAtTime(volume * 0.45, startTime);
  oscGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.connect(oscGain);
  oscGain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration);

  // Noise burst (for textured mechanical friction sound)
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp((-i / bufferSize) * 3);
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime((startFreq + endFreq) / 2, startTime);
  filter.Q.setValueAtTime(2.0, startTime);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(volume * 0.8, startTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(ctx.destination);

  noise.start(startTime);
  noise.stop(startTime + duration);
}

function playThump(
  ctx: AudioContext,
  startTime: number,
  startFreq: number,
  endFreq: number,
  duration: number,
  volume: number
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(startFreq, startTime);
  osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), startTime + duration);

  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

/**
 * Trigger vibration / haptic feedback
 * - Uses navigator.vibrate if supported (Android, desktop browsers)
 * - Also dispatches iOS haptic element tick for Safari
 */
export function triggerHapticVibration() {
  if (typeof window === "undefined") return;

  // 1. Web Vibration API (Android Chrome, Firefox, etc.)
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      navigator.vibrate([100, 40, 100]);
    } catch {
      // Ignore vibration errors
    }
  }

  // 2. iOS Safari switch toggle haptic trick
  // Toggling an iOS-styled switch input inside a transient user gesture triggers taptic engine on iOS 17.4+
  try {
    const el = document.getElementById("ios-haptic-trigger") as HTMLInputElement | null;
    if (el) {
      el.checked = !el.checked;
    }
  } catch {
    // Ignore
  }
}
