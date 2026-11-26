/* ============================================
   YEET/UI — tiny synthesized sound kit (Web Audio, no files)
   import { sound } from "./sound.js";
   sound.play("swish" | "thud" | "pop" | "meow" | "bonk" | "tick")
   sound.muted = true   // persisted in localStorage
   Audio only starts after a user gesture (browser autoplay rules).
   ============================================ */
const KEY = "yeet-sound";
let ctx = null;
let master = null;
let noiseBuf = null;

function audio() {
  if (ctx) return ctx.state === "suspended" ? (ctx.resume(), ctx) : ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.32;
  master.connect(ctx.destination);
  // 1s of white noise, reused for paper / thump textures
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return ctx;
}

const env = (g, t, peak, attack, decay) => {
  g.gain.cancelScheduledValues(t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
};
function noise(t, dur) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  src.start(t, Math.random() * 0.5, dur + 0.05);
  return src;
}
function osc(type, t, dur) {
  const o = ctx.createOscillator();
  o.type = type;
  o.start(t);
  o.stop(t + dur + 0.05);
  return o;
}

const voices = {
  // paper sliding out of a folder: band-passed noise sweeping up
  swish(t) {
    const n = noise(t, 0.32), f = ctx.createBiquadFilter(), g = ctx.createGain();
    f.type = "bandpass"; f.Q.value = 1.4;
    f.frequency.setValueAtTime(700, t);
    f.frequency.exponentialRampToValueAtTime(3600, t + 0.22);
    env(g, t, 0.55, 0.04, 0.26);
    n.connect(f).connect(g).connect(master);
  },
  // folder landing in the box: low sine drop + a muffled tap
  thud(t) {
    const o = osc("sine", t, 0.18), g = ctx.createGain();
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(55, t + 0.16);
    env(g, t, 0.7, 0.005, 0.17);
    o.connect(g).connect(master);
    const n = noise(t, 0.08), f = ctx.createBiquadFilter(), g2 = ctx.createGain();
    f.type = "lowpass"; f.frequency.value = 900;
    env(g2, t, 0.25, 0.003, 0.07);
    n.connect(f).connect(g2).connect(master);
  },
  // something new arrives
  pop(t) {
    const o = osc("sine", t, 0.14), g = ctx.createGain();
    o.frequency.setValueAtTime(520, t);
    o.frequency.exponentialRampToValueAtTime(1250, t + 0.09);
    env(g, t, 0.5, 0.005, 0.13);
    o.connect(g).connect(master);
  },
  // "nope": two short buzzy blips
  bonk(t) {
    [0, 0.11].forEach((dt) => {
      const o = osc("square", t + dt, 0.09), f = ctx.createBiquadFilter(), g = ctx.createGain();
      o.frequency.value = 170 - dt * 200;
      f.type = "lowpass"; f.frequency.value = 1100;
      env(g, t + dt, 0.28, 0.004, 0.08);
      o.connect(f).connect(g).connect(master);
    });
  },
  // tiny UI tick
  tick(t) {
    const o = osc("triangle", t, 0.05), g = ctx.createGain();
    o.frequency.value = 1800;
    env(g, t, 0.18, 0.002, 0.04);
    o.connect(g).connect(master);
  },
  // meow: a pitch glide up then down through two "vowel" formants, with a little vibrato
  meow(t, { pitch = 1 } = {}) {
    const dur = 0.62;
    const o = osc("sawtooth", t, dur), g = ctx.createGain();
    const base = 480 * pitch;
    o.frequency.setValueAtTime(base, t);
    o.frequency.linearRampToValueAtTime(base * 1.75, t + 0.18);
    o.frequency.linearRampToValueAtTime(base * 1.45, t + 0.38);
    o.frequency.exponentialRampToValueAtTime(base * 0.95, t + dur);
    const lfo = osc("sine", t, dur), lfoGain = ctx.createGain();
    lfo.frequency.value = 7; lfoGain.gain.value = 14 * pitch;
    lfo.connect(lfoGain).connect(o.frequency);
    // formants: "m" → "eee" → "ow"
    const f1 = ctx.createBiquadFilter(), f2 = ctx.createBiquadFilter();
    f1.type = f2.type = "bandpass"; f1.Q.value = 6; f2.Q.value = 8;
    f1.frequency.setValueAtTime(700, t); f1.frequency.linearRampToValueAtTime(1100, t + 0.2); f1.frequency.linearRampToValueAtTime(650, t + dur);
    f2.frequency.setValueAtTime(1800, t); f2.frequency.linearRampToValueAtTime(2600, t + 0.2); f2.frequency.linearRampToValueAtTime(1300, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.9, t + 0.06);
    g.gain.setValueAtTime(0.9, t + dur - 0.22);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const mix = ctx.createGain(); mix.gain.value = 0.5;
    o.connect(f1).connect(g); o.connect(f2).connect(g);
    g.connect(mix).connect(master);
  },
};

export const sound = {
  get muted() { try { return localStorage.getItem(KEY) === "off"; } catch { return false; } },
  set muted(v) { try { localStorage.setItem(KEY, v ? "off" : "on"); } catch { /* ignore */ } document.dispatchEvent(new CustomEvent("yeet:sound", { detail: { muted: !!v } })); },
  toggle() { this.muted = !this.muted; if (!this.muted) this.play("tick"); return !this.muted; },
  play(name, opts) {
    if (this.muted || !voices[name]) return;
    const c = audio();
    if (!c) return;
    voices[name](c.currentTime + 0.005, opts);
  },
  /** play after a delay in seconds (keeps sounds in sync with animations) */
  at(delay, name, opts) { setTimeout(() => this.play(name, opts), Math.max(0, delay * 1000)); },
};
