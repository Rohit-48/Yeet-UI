/* ============================================
   YEET/UI — Field Recorder (+ Blueprint callouts)
   <div class="y-rec" data-recorder></div>
   ● records from the mic (MediaRecorder), ▶ plays it back through an analyser,
   so the waveform screen shows the real signal. No mic? It records a demo
   signal and plays a little synth tape loop instead.
   ============================================ */
import { sound, audioContext } from "./sound.js";

const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const DEMO_LEN = 9.6;
const R_MIN = 11, R_MAX = 29; // tape pack radius (empty → full), in reel-svg units

const ICON = {
  rew: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11.5 6v12L3 12zM21 6v12l-8.5-6z"/></svg>`,
  play: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15L19.5 12z"/></svg>`,
  pause: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h4.2v14H6zM13.8 5H18v14h-4.2z"/></svg>`,
  stop: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="1.5"/></svg>`,
};

/* ---------- reel artwork ---------- */
const pt = (r, deg) => { const a = (deg * Math.PI) / 180; return `${(Math.cos(a) * r).toFixed(2)} ${(Math.sin(a) * r).toFixed(2)}`; };
const sector = (r1, r2, a0, a1) => `M${pt(r1, a0)}L${pt(r2, a0)}A${r2} ${r2} 0 0 1 ${pt(r2, a1)}L${pt(r1, a1)}A${r1} ${r1} 0 0 0 ${pt(r1, a0)}Z`;
const reel = (cx) => `
  <g transform="translate(${cx} 38)">
    <circle class="pack" r="20" fill="#3b2a1d" stroke="#140e09" stroke-width="1"/>
    <g class="spin">
      <circle r="34" fill="rgba(226,221,210,.36)" stroke="rgba(255,255,255,.62)" stroke-width="1.2"/>
      <circle r="30.5" fill="none" stroke="rgba(255,255,255,.22)" stroke-width=".8"/>
      ${[0, 120, 240].map((a) => `<path d="${sector(12.5, 27, a + 14, a + 86)}" fill="rgba(12,14,17,.42)" stroke="rgba(255,255,255,.4)" stroke-width=".8"/>`).join("")}
      ${[0, 120, 240].map((a) => `<rect x="12" y="-2.2" width="6" height="4.4" rx="1.2" fill="#ff7a1a" transform="rotate(${a + 100})"/>`).join("")}
      <circle r="9.5" fill="#2c2f34" stroke="#6a6f76" stroke-width="2"/>
      <path d="M0-6.5V6.5M-5.6-3.2 5.6 3.2M-5.6 3.2 5.6-3.2" stroke="#a3a9b0" stroke-width="1.7" stroke-linecap="round"/>
    </g>
  </g>`;

function build(el) {
  const label = (el.dataset.label || "ARC-010").replace(/[<&]/g, "");
  el.innerHTML = `
    <div class="y-rec__handle" aria-hidden="true"><span class="y-rec__post y-rec__post--l"></span><span class="y-rec__post y-rec__post--r"></span><span class="y-rec__bar"></span></div>
    <div class="y-rec__body">
      <i class="y-rec__bump y-rec__bump--tl"></i><i class="y-rec__bump y-rec__bump--tr"></i><i class="y-rec__bump y-rec__bump--bl"></i><i class="y-rec__bump y-rec__bump--br"></i>
      <i class="y-rec__rail y-rec__rail--l"></i><i class="y-rec__rail y-rec__rail--r"></i>
      <b class="y-rec__screw"></b><b class="y-rec__screw"></b><b class="y-rec__screw"></b><b class="y-rec__screw"></b>
      <div class="y-rec__window">
        <svg class="y-rec__reels" viewBox="0 0 200 84" aria-hidden="true">
          ${reel(52)}${reel(148)}
          <path class="tape" fill="none" stroke="#3b2a1d" stroke-width="1.8"/>
          <circle cx="78" cy="75" r="3.2" fill="#a3a9b0" stroke="#2c2f34"/><circle cx="122" cy="75" r="3.2" fill="#a3a9b0" stroke="#2c2f34"/>
          <rect x="90" y="71" width="20" height="11" rx="2.5" fill="#2c2f34" stroke="#6a6f76" stroke-width="1.2"/>
        </svg>
      </div>
      <div class="y-rec__display">
        <canvas></canvas>
        <div class="y-rec__hud"><span class="y-rec__time">00:00</span><span class="y-rec__state" aria-live="polite">READY</span></div>
        <div class="y-rec__ticks" aria-hidden="true"><i></i><i></i><i></i></div>
      </div>
      <div class="y-rec__controls">
        <div class="y-rec__keys">
          <button type="button" class="y-rec__key" data-rec="rew" aria-label="Rewind">${ICON.rew}</button>
          <button type="button" class="y-rec__key" data-rec="play" aria-label="Play" aria-pressed="false">${ICON.play}</button>
          <button type="button" class="y-rec__key" data-rec="stop" aria-label="Stop">${ICON.stop}</button>
        </div>
        <button type="button" class="y-rec__record" data-rec="record" aria-label="Record" aria-pressed="false"></button>
      </div>
      <div class="y-rec__foot"><span class="y-rec__grille"></span><span class="y-rec__label">${label}</span><span class="y-rec__led"></span></div>
    </div>`;
}

const STATE_TEXT = { ready: "READY", recording: "● REC", playing: "▶ PLAY", paused: "❚❚ PAUSE", rewinding: "◀◀ REW" };
const SCALE = [0, 3, 5, 7, 10, 12, 15, 17];
const TUNE = [0, 2, 4, 2, 5, 4, 2, 1, 0, 2, 4, 6, 5, 4, 2, 4, 0, 2, 4, 2, 5, 4, 2, 1, 3, 2, 1, 0, 1, 2, 0, -1];

export function recorder(el) {
  if (el._rec) return el._rec;
  build(el);
  el.setAttribute("role", "group");
  if (!el.hasAttribute("aria-label")) el.setAttribute("aria-label", "Field recorder");

  const q = (s) => el.querySelector(s);
  const spins = [...el.querySelectorAll(".spin")], packs = [...el.querySelectorAll(".pack")], tape = q(".tape");
  const cv = q("canvas"), g = cv.getContext("2d"), timeEl = q(".y-rec__time"), stateEl = q(".y-rec__state");
  const btn = Object.fromEntries([...el.querySelectorAll("[data-rec]")].map((b) => [b.dataset.rec, b]));
  const maxSec = +el.dataset.max || 30;

  let mode = "ready", clip = null, pos = 0, speed = 0, target = 0;
  const angle = [0, 0];
  let ctx = null, analyser = null, buf = null, outGain = null;
  let stream = null, micSrc = null, mediaRec = null, chunks = [], recStart = 0;
  let audioEl = null, mediaSrc = null, synth = [], synthBus = null, playStart = 0, playFrom = 0;
  let raf = 0, last = 0, histT = 0, visible = true;

  // waveform history (seeded so the screen looks alive before anything plays)
  const hist = new Float32Array(64);
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  hist.forEach((_, i) => (hist[i] = 0.12 + 0.75 * Math.abs(Math.sin(i * 0.31) * Math.sin(i * 0.09 + 1.2)) * (0.55 + 0.45 * rnd())));

  const total = () => (mode === "recording" ? maxSec : clip ? clip.duration : DEMO_LEN);
  const progress = () => Math.min(1, Math.max(0, pos / total()));
  const sfx = (n) => sound.play(n);
  const fire = (name, detail = {}) => el.dispatchEvent(new CustomEvent(`recorder:${name}`, { detail: { mode, pos, clip, ...detail } }));

  function setMode(m, text) {
    mode = m;
    el.classList.toggle("is-recording", m === "recording");
    el.classList.toggle("is-playing", m === "playing");
    btn.play.setAttribute("aria-pressed", String(m === "playing"));
    btn.play.setAttribute("aria-label", m === "playing" ? "Pause" : "Play");
    btn.play.innerHTML = m === "playing" ? ICON.pause : ICON.play;
    btn.record.setAttribute("aria-pressed", String(m === "recording"));
    btn.record.setAttribute("aria-label", m === "recording" ? "Stop recording" : "Record");
    stateEl.textContent = text || STATE_TEXT[m];
    target = { recording: 1, playing: 1, rewinding: -8 }[m] || 0;
    fire(m);
    kick();
  }

  function ensureAudio() {
    ctx = audioContext();
    if (!ctx) return null;
    if (!analyser) {
      analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      buf = new Float32Array(analyser.fftSize);
      outGain = ctx.createGain();
      outGain.connect(ctx.destination);
    }
    return ctx;
  }

  /* ----- sources ----- */
  function stopSources() {
    if (audioEl) audioEl.pause();
    synth.forEach((n) => { try { n.stop(); } catch { /* already stopped */ } });
    synth = [];
    if (synthBus) { const b = synthBus; synthBus = null; setTimeout(() => b.disconnect(), 300); }
  }
  function startSynth(from) {
    if (!ensureAudio()) return;
    const step = DEMO_LEN / TUNE.length, t0 = ctx.currentTime + 0.03;
    const bus = (synthBus = ctx.createGain());
    bus.gain.value = 0.2;
    const warm = ctx.createBiquadFilter();
    warm.type = "lowpass"; warm.frequency.value = 2400;
    bus.connect(warm); warm.connect(analyser); warm.connect(outGain);
    const wow = ctx.createOscillator(), wowAmt = ctx.createGain(); // tape wow: slow pitch wobble
    wow.frequency.value = 0.7; wowAmt.gain.value = 9;
    wow.connect(wowAmt); wow.start(); synth.push(wow);
    TUNE.forEach((n, i) => {
      const at = i * step;
      if (n < 0 || at < from - 0.01) return;
      const t = t0 + at - from;
      const notes = [[220 * 2 ** (SCALE[n] / 12), "triangle", 1]];
      if (i % 4 === 0) notes.push([110 * 2 ** (SCALE[n % 3] / 12), "sine", 0.8]);
      notes.forEach(([f, type, v]) => {
        const o = ctx.createOscillator(), env = ctx.createGain();
        o.type = type; o.frequency.value = f;
        wowAmt.connect(o.detune);
        env.gain.setValueAtTime(0.0001, t);
        env.gain.exponentialRampToValueAtTime(v, t + 0.015);
        env.gain.exponentialRampToValueAtTime(0.0001, t + step * (type === "sine" ? 3.5 : 0.92));
        o.connect(env).connect(bus);
        o.start(t); o.stop(t + step * 4);
        synth.push(o);
      });
    });
  }

  /* ----- transport ----- */
  async function record() {
    if (mode === "recording") return stopRecording();
    stopSources();
    ensureAudio();
    sfx("pop");
    pos = 0;
    recStart = performance.now();
    setMode("recording", "MIC…");
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder || !ctx) throw new Error("no mic api");
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (mode !== "recording") { s.getTracks().forEach((t) => t.stop()); return; } // stopped while asking
      stream = s;
      micSrc = ctx.createMediaStreamSource(stream);
      micSrc.connect(analyser); // analyser only: never to the speakers (no feedback)
      chunks = [];
      mediaRec = new MediaRecorder(stream);
      mediaRec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      mediaRec.start();
      recStart = performance.now();
      setMode("recording");
    } catch {
      recStart = performance.now();
      setMode("recording", "● REC DEMO"); // no mic / permission denied: fake signal
    }
  }
  function stopRecording() {
    const len = Math.max(0.6, Math.min(maxSec, (performance.now() - recStart) / 1000));
    const rec = mediaRec;
    if (clip?.url) URL.revokeObjectURL(clip.url);
    clip = { duration: len, url: null, blob: null, demo: !rec };
    if (rec && rec.state !== "inactive") {
      const thisClip = clip;
      rec.onstop = () => {
        thisClip.blob = new Blob(chunks, { type: rec.mimeType || "audio/webm" });
        thisClip.url = URL.createObjectURL(thisClip.blob);
        fire("saved", { blob: thisClip.blob, url: thisClip.url, duration: len });
      };
      rec.stop();
    }
    if (stream) stream.getTracks().forEach((t) => t.stop());
    if (micSrc) micSrc.disconnect();
    stream = micSrc = mediaRec = null;
    sfx("thud");
    pos = len; // tape is at the end of the take; wind it back
    setMode("rewinding");
  }
  function play() {
    if (mode === "playing") return pause();
    if (mode === "recording") stopRecording();
    if (!ensureAudio()) return;
    sfx("tick");
    if (mode === "rewinding" || pos >= total() - 0.05) pos = 0;
    stopSources();
    if (clip?.url) {
      if (!audioEl || audioEl._url !== clip.url) {
        if (mediaSrc) mediaSrc.disconnect();
        audioEl = new Audio(clip.url);
        audioEl._url = clip.url;
        mediaSrc = ctx.createMediaElementSource(audioEl);
        mediaSrc.connect(analyser); mediaSrc.connect(outGain);
      }
      try { audioEl.currentTime = pos; } catch { /* not seekable yet */ }
      audioEl.play().catch(() => {});
    } else startSynth(pos);
    playStart = performance.now(); playFrom = pos;
    setMode("playing", clip?.url ? "▶ PLAY" : clip ? "▶ DEMO" : "▶ DEMO TAPE");
  }
  function pause() {
    if (mode !== "playing") return;
    stopSources();
    sfx("tick");
    setMode("paused");
  }
  function stop() {
    if (mode === "recording") return stopRecording();
    stopSources();
    if (mode !== "ready") sfx("tick");
    setMode("ready");
  }
  function rewind() {
    if (mode === "recording") return stopRecording();
    stopSources();
    if (pos <= 0.01) { sfx("bonk"); return setMode("ready", "AT START"); }
    sfx("swish");
    setMode("rewinding");
  }

  btn.record.addEventListener("click", record);
  btn.play.addEventListener("click", play);
  btn.stop.addEventListener("click", stop);
  btn.rew.addEventListener("click", rewind);

  /* ----- render loop (runs only while something moves) ----- */
  function kick() {
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
  }
  function level(t) {
    if (mode === "playing" && !clip?.url) { // demo tape: follow the tune's note envelopes
      const step = DEMO_LEN / TUNE.length, i = Math.floor(pos / step), ph = (pos % step) / step;
      if (TUNE[i] === undefined || TUNE[i] < 0) return 0.05;
      return (0.3 + 0.55 * Math.exp(-ph * 2.6)) * (0.75 + 0.25 * Math.random()) * (i % 4 === 0 ? 1 : 0.8);
    }
    if (mode === "playing" || (mode === "recording" && micSrc)) {
      analyser.getFloatTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
      return Math.min(1, Math.sqrt(sum / buf.length) * 5);
    }
    if (mode === "recording") return 0.15 + 0.7 * Math.abs(Math.sin(t * 2.3) * Math.sin(t * 5.1)) * (0.5 + 0.5 * Math.random());
    return -1; // not feeding
  }
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    // positions
    if (mode === "recording") {
      pos = (now - recStart) / 1000;
      if (pos >= maxSec) stopRecording();
    } else if (mode === "playing") {
      pos = audioEl && clip?.url && !audioEl.paused ? audioEl.currentTime : playFrom + (now - playStart) / 1000;
      if (pos >= total() || (audioEl && clip?.url && audioEl.ended)) { pos = total(); stopSources(); setMode("ready", "END"); }
    } else if (mode === "rewinding") {
      pos -= dt * Math.max(total() * 1.1, 3);
      if (pos <= 0) { pos = 0; sfx("thud"); setMode("ready"); }
    }
    // tape speed eases toward the target (motors spinning up / down)
    speed += (target - speed) * Math.min(1, dt * (reduced() ? 60 : 5));
    const p = progress();
    const rL = Math.sqrt(R_MIN ** 2 + (R_MAX ** 2 - R_MIN ** 2) * (1 - p));
    const rR = Math.sqrt(R_MIN ** 2 + (R_MAX ** 2 - R_MIN ** 2) * p);
    if (visible) {
      const lin = 70 * speed; // tape units / second
      angle[0] += ((lin / rL) * 180 / Math.PI) * dt;
      angle[1] += ((lin / rR) * 180 / Math.PI) * dt;
      spins[0].setAttribute("transform", `rotate(${angle[0] % 360})`);
      spins[1].setAttribute("transform", `rotate(${angle[1] % 360})`);
      packs[0].setAttribute("r", rL.toFixed(2));
      packs[1].setAttribute("r", rR.toFixed(2));
      tape.setAttribute("d", `M${(52 - rL * 0.42).toFixed(1)} ${(38 + rL * 0.9).toFixed(1)}L77 78.2H123L${(148 + rR * 0.42).toFixed(1)} ${(38 + rR * 0.9).toFixed(1)}`);
    }
    // waveform
    histT += dt;
    if (histT > 0.045) {
      histT = 0;
      const lv = level(now / 1000);
      if (lv >= 0) { hist.copyWithin(0, 1); hist[hist.length - 1] = Math.max(0.04, lv); }
    }
    const t = new Date(pos * 1000).toISOString().slice(14, 19);
    if (timeEl.textContent !== t) timeEl.textContent = t;
    if (visible) draw(now / 1000);
    const busy = mode === "recording" || mode === "playing" || mode === "rewinding" || Math.abs(speed) > 0.01;
    raf = busy ? requestAnimationFrame(frame) : 0;
  }

  const dpr = Math.min(2, window.devicePixelRatio || 1);
  function draw(t = 0) {
    const w = cv.width, h = cv.height;
    if (!w || !h) return;
    g.clearRect(0, 0, w, h);
    g.strokeStyle = "rgba(255,162,58,.13)";
    g.lineWidth = dpr;
    g.beginPath();
    for (let x = 0; x <= 12; x++) { g.moveTo((w / 12) * x, 0); g.lineTo((w / 12) * x, h); }
    g.moveTo(0, h * 0.58); g.lineTo(w, h * 0.58);
    g.stroke();
    const n = hist.length, bw = w / n, mid = h * 0.58, wobble = mode === "playing" || mode === "recording" ? t * 6 : 0;
    g.fillStyle = "#ffa23a";
    g.shadowColor = "#ff7a1a";
    g.shadowBlur = 7 * dpr;
    for (let i = 0; i < n; i++) {
      const shape = 0.55 + 0.45 * Math.abs(Math.sin(i * 1.7 + wobble));
      const bh = Math.max(2 * dpr, hist[i] * h * 0.66 * shape);
      g.fillRect(i * bw + bw * 0.2, mid - bh / 2, Math.max(dpr, bw * 0.6), bh);
    }
    g.shadowBlur = 0;
  }
  const fit = () => {
    const w = Math.round(cv.clientWidth * dpr), h = Math.round(cv.clientHeight * dpr);
    if (w && (cv.width !== w || cv.height !== h)) { cv.width = w; cv.height = h; draw(); }
  };
  if ("ResizeObserver" in window) new ResizeObserver(fit).observe(cv);
  if ("IntersectionObserver" in window) new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }).observe(el);
  fit();
  frame(performance.now()); // paint the reels + tape once

  return (el._rec = {
    record, play, pause, stop, rewind, el,
    get mode() { return mode; },
    get position() { return pos; },
    get clip() { return clip; },
  });
}

/* ---------- blueprint callout lines ---------- */
export function blueprint(el) {
  if (el._bp) return;
  el._bp = true;
  const stage = el.querySelector(".y-blueprint__stage");
  if (!stage) return;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "y-blueprint__lines");
  svg.setAttribute("aria-hidden", "true");
  stage.append(svg);
  const layout = () => {
    const sr = stage.getBoundingClientRect();
    let out = "";
    stage.querySelectorAll(".y-callout[data-target]").forEach((c) => {
      const tgt = stage.querySelector(c.dataset.target);
      if (!tgt) return;
      const tr = tgt.getBoundingClientRect(), lr = c.getBoundingClientRect();
      const tx = tr.left - sr.left + tr.width * (c.dataset.tx ?? 0.5), ty = tr.top - sr.top + tr.height * (c.dataset.ty ?? 0.5);
      const right = c.dataset.side === "right";
      const sx = (right ? lr.left : lr.right) - sr.left, sy = lr.bottom - sr.top;
      const ex = sx + (tx - sx) * 0.3;
      out += `<path d="M${sx.toFixed(1)} ${sy.toFixed(1)}H${ex.toFixed(1)}L${tx.toFixed(1)} ${ty.toFixed(1)}"/><circle cx="${tx.toFixed(1)}" cy="${ty.toFixed(1)}" r="3.2"/>`;
    });
    svg.innerHTML = out;
  };
  if ("ResizeObserver" in window) new ResizeObserver(layout).observe(stage);
  document.fonts?.ready.then(layout);
  layout();
}
