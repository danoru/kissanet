/**
 * A tiny procedural ambience synth built on the Web Audio API — no audio files,
 * no licensing. Two beds mixed under one master gain:
 *
 *   • crackle — a warm vinyl-surface hiss plus sparse, randomly-timed pops
 *     (the constant bed; the room is never truly silent once sound is on)
 *   • rain    — band-passed noise with a slow "waves" LFO and a low rumble,
 *     gated by the weather toggle (ramped in/out so there's no click)
 *
 * Everything is generated from a single looping white-noise buffer. Kept
 * deliberately quiet — this sits *under* whatever record is playing.
 */

export type AmbientEngine = {
  resume: () => Promise<void>;
  suspend: () => void;
  setMaster: (v: number) => void;
  setRain: (on: boolean) => void;
  dispose: () => void;
};

type Ctor = typeof AudioContext;

function makeNoiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

function loopNoise(ctx: AudioContext, buf: AudioBuffer): AudioBufferSourceNode {
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  return src;
}

/** Build the whole graph, or return null if Web Audio isn't available. */
export function createAmbientEngine(): AmbientEngine | null {
  if (typeof window === "undefined") return null;
  const AC: Ctor | undefined =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: Ctor }).webkitAudioContext;
  if (!AC) return null;

  let ctx: AudioContext;
  try {
    ctx = new AC();
  } catch {
    return null;
  }

  const noise = makeNoiseBuffer(ctx, 2.5);

  // master → speakers
  const master = ctx.createGain();
  master.gain.value = 0.0001;
  master.connect(ctx.destination);

  // ---- crackle bed: warm hiss ----
  const hiss = loopNoise(ctx, noise);
  const hissHP = ctx.createBiquadFilter();
  hissHP.type = "highpass";
  hissHP.frequency.value = 1000;
  const hissLP = ctx.createBiquadFilter();
  hissLP.type = "lowpass";
  hissLP.frequency.value = 7000;
  const hissGain = ctx.createGain();
  hissGain.gain.value = 0.014;
  hiss.connect(hissHP).connect(hissLP).connect(hissGain).connect(master);

  // ---- rain bus (weather-gated) ----
  const rainBus = ctx.createGain();
  rainBus.gain.value = 0; // off until setRain(true)
  rainBus.connect(master);

  // rain body: band-passed noise with a slow "waves" LFO
  const rain = loopNoise(ctx, noise);
  const rainHP = ctx.createBiquadFilter();
  rainHP.type = "highpass";
  rainHP.frequency.value = 900;
  const rainBP = ctx.createBiquadFilter();
  rainBP.type = "bandpass";
  rainBP.frequency.value = 2800;
  rainBP.Q.value = 0.4;
  const rainWave = ctx.createGain();
  rainWave.gain.value = 0.7;
  rain.connect(rainHP).connect(rainBP).connect(rainWave).connect(rainBus);

  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.13;
  const lfoDepth = ctx.createGain();
  lfoDepth.gain.value = 0.22;
  lfo.connect(lfoDepth).connect(rainWave.gain); // gentle swell 0.48–0.92

  // rain rumble: low bed so it isn't all hiss
  const rumble = loopNoise(ctx, noise);
  const rumbleLP = ctx.createBiquadFilter();
  rumbleLP.type = "lowpass";
  rumbleLP.frequency.value = 380;
  const rumbleGain = ctx.createGain();
  rumbleGain.gain.value = 0.5;
  rumble.connect(rumbleLP).connect(rumbleGain).connect(rainBus);

  // start the continuous sources (silent until gains open / context resumes)
  hiss.start();
  rain.start();
  rumble.start();
  lfo.start();

  // ---- crackle pops: scheduled bursts for the vinyl-dust texture ----
  let popTimer: ReturnType<typeof setInterval> | null = null;
  const WINDOW = 0.2; // seconds scheduled per tick

  function pop(when: number) {
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 900 + Math.random() * 2600;
    bp.Q.value = 0.7;
    const g = ctx.createGain();
    src.connect(bp).connect(g).connect(master);
    const amp = 0.02 + Math.random() * 0.05;
    const dur = 0.015 + Math.random() * 0.035;
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(amp, when + 0.001);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    const offset = Math.random() * (noise.duration - 0.1);
    src.start(when, offset, dur + 0.02);
    src.stop(when + dur + 0.03);
  }

  function scheduleTick() {
    if (ctx.state !== "running") return;
    const now = ctx.currentTime;
    // ~2–5 pops per second, jittered across the window
    const n = Math.random() < 0.5 ? 0 : 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < n; i++) pop(now + Math.random() * WINDOW);
  }

  function startPops() {
    if (popTimer) return;
    popTimer = setInterval(scheduleTick, WINDOW * 1000);
  }
  function stopPops() {
    if (popTimer) clearInterval(popTimer);
    popTimer = null;
  }

  return {
    async resume() {
      if (ctx.state === "suspended") {
        try {
          await ctx.resume();
        } catch {
          /* blocked until a real gesture — the gesture listener retries */
        }
      }
      startPops();
    },
    suspend() {
      stopPops();
      // fade the master down, then park the context to save CPU
      const now = ctx.currentTime;
      master.gain.setTargetAtTime(0.0001, now, 0.15);
      window.setTimeout(() => {
        if (ctx.state === "running") ctx.suspend().catch(() => {});
      }, 400);
    },
    setMaster(v: number) {
      const target = Math.max(0.0001, Math.min(1, v));
      master.gain.setTargetAtTime(target, ctx.currentTime, 0.1);
    },
    setRain(on: boolean) {
      rainBus.gain.setTargetAtTime(on ? 0.12 : 0.0001, ctx.currentTime, 0.4);
    },
    dispose() {
      stopPops();
      try {
        hiss.stop();
        rain.stop();
        rumble.stop();
        lfo.stop();
      } catch {
        /* already stopped */
      }
      ctx.close().catch(() => {});
    },
  };
}
