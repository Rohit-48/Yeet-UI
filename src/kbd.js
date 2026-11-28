/* ============================================
   YEET/UI — Mechanical keyboard (65%)
   <div class="y-kbd" data-kbd></div>                 yeet.init() builds it
   · mirrors your real keyboard (keys go down, switch sounds play)
   · click / tap keys to type (into the little display, or data-target="#input")
   · knob = volume, THOCK / CLICK / CREAM switch = sound profile
   · themes: data-theme="retro | cyber | pastel"   (default: yeet)
   ============================================ */
import gsap from "gsap";
import { sound } from "./sound.js";

const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

/* ---------- layout: [label, code(s), width(u), shifted, kind] ---------- */
const L = (chars, codes, shifted = "") => chars.split("").map((c, i) => [c, codes[i], 1, shifted[i] || ""]);
const letters = (s) => s.split("").map((c) => [c.toUpperCase(), `Key${c.toUpperCase()}`, 1, ""]);
const ROWS = [
  [["Esc", "Escape Backquote", 1, "~", "acc1"], ...L("1234567890-=", ["Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0", "Minus", "Equal"], "!@#$%^&*()_+"), ["⌫", "Backspace", 2, "", "mod"], ["Del", "Delete", 1, "", "mod"]],
  [["Tab", "Tab", 1.5, "", "mod"], ...letters("qwertyuiop"), ["[", "BracketLeft", 1, "{"], ["]", "BracketRight", 1, "}"], ["\\", "Backslash", 1.5, "|"], ["PgUp", "PageUp", 1, "", "mod"]],
  [["Caps", "CapsLock", 1.75, "", "mod"], ...letters("asdfghjkl"), [";", "Semicolon", 1, ":"], ["'", "Quote", 1, '"'], ["Enter", "Enter NumpadEnter", 2.25, "", "acc2"], ["PgDn", "PageDown", 1, "", "mod"]],
  [["Shift", "ShiftLeft", 2.25, "", "mod"], ...letters("zxcvbnm"), [",", "Comma", 1, "<"], [".", "Period", 1, ">"], ["/", "Slash", 1, "?"], ["Shift", "ShiftRight", 1.75, "", "mod"], ["↑", "ArrowUp", 1, "", "mod"], ["End", "End", 1, "", "mod"]],
  [["Ctrl", "ControlLeft", 1.25, "", "mod"], ["⌘", "MetaLeft OSLeft", 1.25, "", "mod"], ["Alt", "AltLeft", 1.25, "", "mod"], ["", "Space", 6.25, "", "space"], ["Alt", "AltRight", 1, "", "mod"], ["Fn", "Fn", 1, "", "mod"], ["Ctrl", "ControlRight", 1, "", "mod"], ["←", "ArrowLeft", 1, "", "mod"], ["↓", "ArrowDown", 1, "", "mod"], ["→", "ArrowRight", 1, "", "mod"]],
];
const PROFILES = ["thock", "clicky", "creamy"];
const PROFILE_LABEL = { thock: "THOCK", clicky: "CLICK", creamy: "CREAM" };

function build(el, d) {
  const rows = ROWS.map((row) => row.map(([label, codes, w, shifted, kind = "alpha"]) => {
    const name = label === "" ? "Space" : label === "⌫" ? "Backspace" : label;
    return `<button type="button" class="y-kbd__key y-kbd__key--${kind}" style="--s:${Math.round(w * 4)}" data-codes="${codes}" data-label="${esc(label)}" tabindex="-1" aria-label="${esc(name)}">
      <span class="y-kbd__legend">${shifted ? `<small>${esc(shifted)}</small>` : ""}${esc(label)}</span></button>`;
  }).join("")).join("");
  el.innerHTML = `
    <div class="y-kbd__case">
      <div class="y-kbd__bar">
        <div class="y-kbd__screen" aria-live="off"><span class="y-kbd__text"></span><i class="y-kbd__caret"></i><span class="y-kbd__stats"><b class="y-kbd__caps" title="Caps lock"></b><span class="y-kbd__wpm">0 WPM</span></span></div>
        <div class="y-kbd__switch" role="radiogroup" aria-label="Switch sound">
          ${PROFILES.map((p) => `<button type="button" role="radio" data-profile="${p}" aria-checked="false">${PROFILE_LABEL[p]}</button>`).join("")}
        </div>
        <span class="y-kbd__badge">${esc(d.brand || "yeet")}<small>65</small></span>
        <div class="y-kbd__knob" role="slider" tabindex="0" aria-label="Volume" aria-valuemin="0" aria-valuemax="100"><i></i></div>
      </div>
      <div class="y-kbd__plate">${rows}</div>
    </div>`;
}

export function kbd(el) {
  if (el._kbd) return el._kbd;
  const d = el.dataset;
  build(el, d);
  if (d.theme) el.classList.add(`y-kbd--${d.theme}`);
  el.setAttribute("role", "group");
  if (!el.hasAttribute("aria-label")) el.setAttribute("aria-label", "Keyboard");

  const q = (s) => el.querySelector(s);
  const plate = q(".y-kbd__plate"), textEl = q(".y-kbd__text"), wpmEl = q(".y-kbd__wpm"), capsEl = q(".y-kbd__caps"), knob = q(".y-kbd__knob");
  const keys = [...el.querySelectorAll(".y-kbd__key")];
  const byCode = new Map();
  keys.forEach((k) => k.dataset.codes.split(" ").forEach((c) => byCode.set(c, k)));
  const target = () => (d.target ? document.querySelector(d.target) : null);

  let profile = PROFILES.includes(d.sound) ? d.sound : "thock";
  let vol = d.volume !== undefined ? Math.min(1, Math.max(0, +d.volume)) : 0.8;
  let caps = false, shiftOnce = false, visible = true, text = "";
  const stamps = []; // typing timestamps for the rolling WPM
  const rgb = "rgb" in d || d.theme === "cyber";

  /* ----- sound profile switch + knob ----- */
  const setProfile = (p) => {
    profile = p;
    el.querySelectorAll("[data-profile]").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.profile === p)));
  };
  setProfile(profile);
  el.querySelector(".y-kbd__switch").addEventListener("click", (e) => {
    const b = e.target.closest("[data-profile]");
    if (!b) return;
    setProfile(b.dataset.profile);
    sound.play("key", { profile, vol });
  });
  const setVol = (v, ping = false) => {
    vol = Math.min(1, Math.max(0, Math.round(v * 100) / 100));
    knob.style.setProperty("--turn", `${-135 + vol * 270}deg`);
    knob.setAttribute("aria-valuenow", Math.round(vol * 100));
    knob.setAttribute("aria-valuetext", vol ? `${Math.round(vol * 100)}%` : "muted");
    if (ping) sound.play("key", { profile, vol });
  };
  setVol(vol);
  knob.addEventListener("wheel", (e) => { e.preventDefault(); setVol(vol - Math.sign(e.deltaY) * 0.05, true); }, { passive: false });
  knob.addEventListener("keydown", (e) => {
    const step = { ArrowUp: 0.05, ArrowRight: 0.05, ArrowDown: -0.05, ArrowLeft: -0.05 }[e.key];
    if (step) { e.preventDefault(); e.stopPropagation(); setVol(vol + step, true); }
  });
  knob.addEventListener("pointerdown", (e) => {
    knob.setPointerCapture(e.pointerId);
    const y0 = e.clientY, v0 = vol;
    let last = 0;
    const move = (ev) => {
      setVol(v0 + (y0 - ev.clientY) / 150);
      if (performance.now() - last > 70) { last = performance.now(); sound.play("tick"); }
    };
    const up = () => { knob.removeEventListener("pointermove", move); knob.removeEventListener("pointerup", up); sound.play("key", { profile, vol }); };
    knob.addEventListener("pointermove", move);
    knob.addEventListener("pointerup", up);
  });

  /* ----- display ----- */
  function paint() {
    textEl.textContent = text.replace(/\n/g, " ↵ ").slice(-32);
    capsEl.classList.toggle("is-on", caps);
  }
  function tickWpm() {
    const now = performance.now();
    while (stamps.length && now - stamps[0] > 8000) stamps.shift();
    const wpm = stamps.length < 2 ? 0 : Math.round((stamps.length / 5) / (Math.max(2000, now - stamps[0]) / 60000));
    wpmEl.textContent = `${wpm} WPM`;
  }
  setInterval(tickWpm, 500);
  paint();

  /* ----- what a key produces ----- */
  function charFor(key, shifted) {
    const label = key.dataset.label, small = key.querySelector("small")?.textContent;
    if (/^[A-Z]$/.test(label)) return shifted !== caps ? label : label.toLowerCase();
    if (label === "" ) return " ";
    if (label.length === 1 && !"←↑→↓⌘⌫".includes(label)) return shifted && small ? small : label;
    return null;
  }
  function emit(detail) {
    el.dispatchEvent(new CustomEvent("kbd:type", { detail }));
  }
  function type(key, shifted, { virtual }) {
    const label = key.dataset.label;
    const t = target();
    let out = null;
    if (label === "⌫") { text = text.slice(0, -1); emit({ back: true }); if (virtual && t) edit(t, "back"); }
    else if (label === "Enter") { text += "\n"; emit({ enter: true, char: "\n" }); if (virtual && t) edit(t, "\n"); }
    else if (label === "Tab") { out = "  "; }
    else if (label === "Caps") { caps = !caps; }
    else out = charFor(key, shifted);
    if (out) {
      text += out;
      stamps.push(performance.now());
      emit({ char: out });
      if (virtual && t) edit(t, out);
    }
    if (text.length > 400) text = text.slice(-200);
    paint();
  }
  function edit(t, what) { // type into the target field from on-screen clicks
    if (!("value" in t)) return;
    const s = t.selectionStart ?? t.value.length, e = t.selectionEnd ?? t.value.length;
    if (what === "back") {
      if (s === e && s > 0) t.setRangeText("", s - 1, e, "end"); else t.setRangeText("", s, e, "end");
    } else if (what === "\n" && t.tagName !== "TEXTAREA") {
      t.form?.requestSubmit?.();
      return;
    } else t.setRangeText(what, s, e, "end");
    t.dispatchEvent(new Event("input", { bubbles: true }));
  }

  /* ----- press visuals + sound ----- */
  function ripple(key) {
    if (!rgb || reduced()) return;
    const pr = plate.getBoundingClientRect(), kr = key.getBoundingClientRect();
    const r = document.createElement("i");
    r.className = "y-kbd__ripple";
    r.style.left = `${kr.left - pr.left + kr.width / 2}px`;
    r.style.top = `${kr.top - pr.top + kr.height / 2}px`;
    r.style.setProperty("--h", `${(keys.indexOf(key) * 17) % 360}`);
    plate.prepend(r);
    gsap.fromTo(r, { scale: 0, opacity: 0.95 }, { scale: 1, opacity: 0, duration: 0.9, ease: "power2.out", onComplete: () => r.parentNode && r.parentNode.removeChild(r) });
  }
  function down(key, { virtual = false, shifted = false, repeat = false } = {}) {
    key.classList.add("is-down");
    if (!repeat) {
      sound.play("key", { profile, vol, big: key.classList.contains("y-kbd__key--space") || key.dataset.label === "Enter" || key.dataset.label === "⌫" });
      ripple(key);
    }
    return { virtual, shifted };
  }
  function up(key) {
    if (!key.classList.contains("is-down")) return;
    key.classList.remove("is-down");
    sound.play("key", { profile, vol, up: true, big: key.classList.contains("y-kbd__key--space") });
  }

  // on-screen: pointer / touch
  plate.addEventListener("pointerdown", (e) => {
    const key = e.target.closest(".y-kbd__key");
    if (!key) return;
    e.preventDefault(); // keep focus in the target field
    const label = key.dataset.label;
    down(key, { virtual: true });
    if (label === "Shift") { shiftOnce = !shiftOnce; el.classList.toggle("is-shifted", shiftOnce); }
    else {
      type(key, shiftOnce, { virtual: true });
      if (shiftOnce && label !== "Caps") { shiftOnce = false; el.classList.remove("is-shifted"); }
    }
    const release = () => { up(key); window.removeEventListener("pointerup", release); window.removeEventListener("pointercancel", release); };
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
  });

  // physical keyboard mirror (only while the board is on screen)
  const io = "IntersectionObserver" in window && new IntersectionObserver(([en]) => (visible = en.isIntersecting));
  if (io) io.observe(el);
  const foreignField = (t) => t && t !== target() && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
  function onDown(e) {
    if (!el.isConnected) return cleanup();
    if (!visible) return;
    const key = byCode.get(e.code);
    if (!key) return;
    down(key, { repeat: e.repeat });
    if (e.code === "CapsLock") { caps = e.getModifierState?.("CapsLock") ?? !caps; paint(); return; }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    // typing in some other field? just animate. Typing in our own target? the browser types, we track.
    if (foreignField(document.activeElement)) return;
    if (e.code === "Backquote" && !e.shiftKey) return; // Esc key doubles as `; don't print it
    if (e.code === "Escape") return;
    type(key, e.shiftKey, { virtual: false });
  }
  function onUp(e) {
    const key = byCode.get(e.code);
    if (key) up(key);
  }
  const blur = () => keys.forEach((k) => k.classList.remove("is-down"));
  document.addEventListener("keydown", onDown);
  document.addEventListener("keyup", onUp);
  window.addEventListener("blur", blur);
  function cleanup() {
    document.removeEventListener("keydown", onDown);
    document.removeEventListener("keyup", onUp);
    window.removeEventListener("blur", blur);
  }

  return (el._kbd = {
    el, press: (code) => { const k = byCode.get(code); if (k) { down(k, { virtual: true }); type(k, false, { virtual: true }); setTimeout(() => up(k), 90); } },
    setProfile, setVolume: (v) => setVol(v),
    get profile() { return profile; }, get volume() { return vol; },
    get text() { return text; }, clear() { text = ""; paint(); },
    destroy: cleanup,
  });
}

/* ============================================
   Typing test bound to a keyboard
   <div class="y-kbd-test" data-kbd-test="#board" data-text="optional custom sentence"></div>
   ============================================ */
const LINES = [
  "no thoughts just vibes and a very clean keyboard",
  "ship it on friday they said it will be fine they said",
  "the quick brown fox has a better setup than you",
  "touch grass then come back and type faster",
  "main character energy but make it sixty five percent",
];
export function kbdTest(el) {
  if (el._kt) return el._kt;
  const board = document.querySelector(el.dataset.kbdTest);
  if (!board) return null;
  const k = kbd(board);
  let line = "", pos = 0, errors = 0, start = 0, done = false, n = 0;
  el.innerHTML = `<div class="y-kbd-test__line" aria-live="off"></div>
    <div class="y-kbd-test__bar"><span class="y-kbd-test__stat" data-wpm>0 <small>WPM</small></span><span class="y-kbd-test__stat" data-acc>100% <small>ACC</small></span><span class="y-kbd-test__stat" data-time>0.0 <small>SEC</small></span>
    <button type="button" class="y-btn y-btn--sm" data-restart>↻ new line</button></div>`;
  const lineEl = el.querySelector(".y-kbd-test__line"), wpmEl = el.querySelector("[data-wpm]"), accEl = el.querySelector("[data-acc]"), timeEl = el.querySelector("[data-time]");
  function reset() {
    line = el.dataset.text || LINES[n++ % LINES.length];
    pos = 0; errors = 0; start = 0; done = false;
    el.classList.remove("is-done");
    lineEl.innerHTML = [...line].map((c) => `<span>${c === " " ? "&nbsp;" : esc(c)}</span>`).join("");
    lineEl.firstElementChild?.classList.add("is-next");
    stats();
  }
  function stats() {
    const secs = start ? (performance.now() - start) / 1000 : 0;
    const correct = [...lineEl.children].filter((s) => s.classList.contains("is-ok")).length;
    wpmEl.firstChild.textContent = `${secs > 0.5 ? Math.round((correct / 5) / (secs / 60)) : 0} `;
    accEl.firstChild.textContent = `${pos ? Math.max(0, Math.round(((pos - errors) / pos) * 100)) : 100}% `;
    timeEl.firstChild.textContent = `${secs.toFixed(1)} `;
  }
  setInterval(() => start && !done && stats(), 200);
  board.addEventListener("kbd:type", (e) => {
    if (done) return;
    const spans = lineEl.children;
    if (e.detail.back) {
      if (!pos) return;
      pos--;
      if (spans[pos].classList.contains("is-bad")) errors = Math.max(0, errors - 1);
      spans[pos].classList.remove("is-ok", "is-bad");
    } else if (e.detail.char && e.detail.char !== "\n") {
      if (!start) start = performance.now();
      const ok = e.detail.char === line[pos];
      spans[pos].classList.add(ok ? "is-ok" : "is-bad");
      if (!ok) { errors++; gsap.fromTo(spans[pos], { y: -3 }, { y: 0, duration: 0.25, ease: "back.out(4)" }); }
      pos++;
    } else return;
    [...spans].forEach((s, i) => s.classList.toggle("is-next", i === pos));
    if (pos >= line.length) {
      done = true;
      stats();
      el.classList.add("is-done");
      sound.play("chaching");
      el.dispatchEvent(new CustomEvent("kbd:result", { detail: { wpm: parseInt(wpmEl.textContent, 10), accuracy: parseInt(accEl.textContent, 10), seconds: parseFloat(timeEl.textContent) } }));
    } else stats();
  });
  el.querySelector("[data-restart]").addEventListener("click", () => { reset(); k.clear(); });
  reset();
  return (el._kt = { reset, el });
}
