/* ============================================
   YEET/UI — widget behaviours: live clocks, dates, icons, counters
   One shared 1-second ticker drives every clock on the page, and only
   clocks that are on screen get updated.
   ============================================ */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- time in any IANA zone ---------- */
const fmts = new Map();
function formatter(tz) {
  const key = tz || "";
  if (!fmts.has(key)) {
    const opts = { hourCycle: "h23", weekday: "short", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric", timeZoneName: "shortOffset" };
    try { fmts.set(key, new Intl.DateTimeFormat("en-US", { ...opts, timeZone: tz || undefined })); }
    catch { console.warn(`[yeet] unknown time zone "${tz}", using local time`); fmts.set(key, new Intl.DateTimeFormat("en-US", opts)); }
  }
  return fmts.get(key);
}
/** { weekday, month, day, year, hour, minute, second, offset } for a zone. data-time="10:08:30" freezes the time. */
export function zoned(el, now = new Date()) {
  const p = {};
  for (const part of formatter(el.dataset.tz).formatToParts(now)) p[part.type] = part.value;
  const t = (el.dataset.time || "").split(":");
  const out = {
    weekday: p.weekday, month: p.month, day: +p.day, year: +p.year,
    hour: t[0] ? +t[0] : +p.hour % 24, minute: t[1] ? +t[1] : +p.minute, second: t[2] ? +t[2] : t[0] ? 0 : +p.second,
    offset: (p.timeZoneName || "GMT").replace(/^GMT/, "UTC ").replace(/UTC $/, "UTC +0").replace(/ ([+-])/, " $1"),
  };
  return out;
}

/* ---------- shared ticker ---------- */
const live = new Map(); // el -> { update(now, instant), visible }
let timer = 0;
const io = "IntersectionObserver" in window && new IntersectionObserver((entries) => entries.forEach((e) => {
  const c = live.get(e.target);
  if (!c) return;
  c.visible = e.isIntersecting;
  if (c.visible) c.update(new Date(), true);
}));
function tick() {
  const now = new Date();
  live.forEach((c, el) => {
    if (!el.isConnected) { live.delete(el); io && io.unobserve(el); return; }
    if (c.visible) c.update(now, false);
  });
  timer = live.size ? setTimeout(tick, 1000 - (Date.now() % 1000) + 8) : 0;
}
function register(el, update) {
  live.set(el, { update, visible: !io });
  if (io) io.observe(el); else update(new Date(), true);
  if (!timer) timer = setTimeout(tick, 1000 - (Date.now() % 1000) + 8);
}

/* ---------- icons ---------- */
const ray = (a, r1, r2, w = 2.6) => {
  const s = Math.sin((a * Math.PI) / 180), c = Math.cos((a * Math.PI) / 180);
  return `<line x1="${16 + s * r1}" y1="${16 - c * r1}" x2="${16 + s * r2}" y2="${16 - c * r2}" stroke="currentColor" stroke-width="${w}" stroke-linecap="round"/>`;
};
const CLOUD = "M9.5 26h14a6 6 0 0 0 .9-11.93 8 8 0 0 0-15.2 1.05A5.5 5.5 0 0 0 9.5 26z";
const horizon = (up) => `
  <path d="M7 22a9 9 0 0 1 18 0z" style="fill:var(--sun,#ff9f1a)"/>
  ${[-70, -40, 40, 70].map((a) => `<line x1="${16 + Math.sin(a * Math.PI / 180) * 11.5}" y1="${22 - Math.cos(a * Math.PI / 180) * 11.5}" x2="${16 + Math.sin(a * Math.PI / 180) * 14.5}" y2="${22 - Math.cos(a * Math.PI / 180) * 14.5}" style="stroke:var(--sun,#ff9f1a)" stroke-width="2.2" stroke-linecap="round"/>`).join("")}
  <path d="M16 ${up ? 10 : 2}V${up ? 2 : 10}M12.5 ${up ? 5.5 : 6.5}L16 ${up ? 2 : 10}l3.5 ${up ? 3.5 : -3.5}" fill="none" style="stroke:var(--sun,#ff9f1a)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M3 22.5h26M9 27h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>`;
export const ICONS = {
  sun: `<circle cx="16" cy="16" r="6.2" fill="currentColor"/>${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => ray(a, 10, 13.8)).join("")}`,
  cloud: `<path d="${CLOUD}" fill="currentColor"/>`,
  partly: `<g transform="translate(-3 -4) scale(.8)" style="color:#ffc21a"><circle cx="16" cy="16" r="6.2" fill="#ffc21a"/>${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => ray(a, 10, 13.8)).join("")}</g><path d="${CLOUD}" transform="translate(4 2) scale(.9)" fill="#6cc4ff" stroke="#fff" stroke-width="1.6"/>`,
  rain: `<path d="${CLOUD}" transform="translate(0 -5)" fill="currentColor"/><path d="M11 24l-1.5 4M16.5 24 15 28M22 24l-1.5 4" stroke="#5ec2ff" stroke-width="2.4" stroke-linecap="round"/>`,
  moon: `<path d="M20.5 4.5A11.5 11.5 0 1 0 27.5 21 9 9 0 0 1 20.5 4.5z" fill="currentColor"/>`,
  sunset: horizon(false),
  sunrise: horizon(true),
  nav: `<path d="M25.5 6.5 6 14.6l8.6 2.8 2.8 8.6z" fill="none" stroke="#2f6bff" stroke-width="2.8" stroke-linejoin="round"/>`,
};
function icon(el) {
  const svg = ICONS[el.dataset.wi];
  if (svg && !el.firstElementChild) el.innerHTML = `<svg viewBox="0 0 32 32" aria-hidden="true">${svg}</svg>`;
}

/* ---------- analog clock ---------- */
function dial({ numbers, label, date }) {
  let ticks = "";
  for (let i = 0; i < 60; i++) {
    if (i === 0) continue;
    const major = i % 5 === 0, a = (i * 6 * Math.PI) / 180, r2 = major ? 80 : 86;
    ticks += `<line x1="${(100 + Math.sin(a) * 94).toFixed(2)}" y1="${(100 - Math.cos(a) * 94).toFixed(2)}" x2="${(100 + Math.sin(a) * r2).toFixed(2)}" y2="${(100 - Math.cos(a) * r2).toFixed(2)}" stroke-width="${major ? 3.4 : 1.5}"/>`;
  }
  ticks += `<line x1="96" y1="6" x2="96" y2="20" stroke-width="3.4"/><line x1="104" y1="6" x2="104" y2="20" stroke-width="3.4"/>`; // double mark at 12
  const nums = numbers ? [[60, 100, 34], [15, 166, 100], [30, 100, 166], [45, 34, 100]].map(([n, x, y]) => `<text x="${x}" y="${y}">${n}</text>`).join("") : "";
  return `<svg viewBox="0 0 200 200" aria-hidden="true">
    <g class="ticks">${ticks}</g>${nums}
    ${label ? `<text class="lbl" x="100" y="${numbers ? 54 : 52}">${label.replace(/[<&]/g, "")}</text>` : ""}
    ${date ? `<g class="win"><rect x="66" y="120" width="68" height="28" rx="7"/><text x="100" y="134.5" data-win></text></g>` : ""}
    <rect class="hand hr" x="95" y="50" width="10" height="58" rx="5"/>
    <rect class="hand mn" x="96.5" y="20" width="7" height="88" rx="3.5"/>
    <line class="sec" x1="100" y1="122" x2="100" y2="16"/>
    <circle class="hub" cx="100" cy="100" r="6.5"/>
  </svg>`;
}
export function aclock(el) {
  if (el._aclock) return el._aclock;
  const d = el.dataset;
  el.setAttribute("role", "img");
  el.innerHTML = dial({ numbers: "numbers" in d, label: d.label, date: "date" in d });
  const [hr, mn, sec, win] = [".hr", ".mn", ".sec", "[data-win]"].map((s) => el.querySelector(s));
  gsap.set(sec, { svgOrigin: "100 100" });
  register(el, (now, instant) => {
    const t = zoned(el, now);
    hr.setAttribute("transform", `rotate(${(t.hour % 12) * 30 + t.minute * 0.5 + t.second / 120} 100 100)`);
    mn.setAttribute("transform", `rotate(${t.minute * 6 + t.second * 0.1} 100 100)`);
    if (instant || reduced() || d.time) gsap.set(sec, { rotation: t.second * 6 });
    else gsap.to(sec, { rotation: `${t.second * 6}_short`, duration: 0.45, ease: "elastic.out(1.4, 0.4)", overwrite: true });
    if (win) win.textContent = `${t.day} ${t.month.slice(0, 3)}`;
    el.setAttribute("aria-label", `${d.label || d.tz || "Local"} ${String(t.hour).padStart(2, "0")}:${String(t.minute).padStart(2, "0")}`);
  });
  return (el._aclock = { el });
}

/* ---------- text widgets (only touch the DOM when the text changes) ---------- */
function textWidget(el, render) {
  if (el._wtext) return;
  el._wtext = true;
  let last = "";
  register(el, (now) => {
    const html = render(zoned(el, now), el.dataset);
    if (html !== last) el.innerHTML = last = html;
  });
}
const two = (n) => String(n).padStart(2, "0");
const digital = (el) => textWidget(el, (t, d) => {
  const h = d.format === "12" ? ((t.hour + 11) % 12) + 1 : two(t.hour);
  return `${h}<span class="y-dclock__colon">:</span>${two(t.minute)}${d.format === "12" && "ampm" in d ? `<small style="font-size:.4em;margin-left:.15em">${t.hour < 12 ? "am" : "pm"}</small>` : ""}`;
});
const dday = (el) => textWidget(el, (t) => `${t.weekday}<br>${t.day}`);
const dbig = (el) => textWidget(el, (t) => `<span class="y-dbig__day">${t.day}</span><span class="y-dbig__rest"><span>${t.month}</span><span>${t.year}</span></span>`);
function wclock(el) {
  if (el._wclock) return;
  el._wclock = true;
  const d = el.dataset;
  const code = d.code || (d.tz || "local").split("/").pop().replace(/_/g, " ").slice(0, 3).toUpperCase();
  el.innerHTML = `<div class="y-wclock__txt"><b class="y-wclock__code">${code.replace(/[<&]/g, "")}</b><span class="y-wclock__meta" data-d></span><span class="y-wclock__meta" data-o></span></div>
    <div class="y-aclock ${d.hand ? `y-aclock--${d.hand}` : ""}" ${d.tz ? `data-tz="${d.tz}"` : ""} ${d.time ? `data-time="${d.time}"` : ""} ${d.label ? `data-label="${d.label}"` : ""}></div>`;
  const [dd, oo] = [el.querySelector("[data-d]"), el.querySelector("[data-o]")];
  aclock(el.querySelector(".y-aclock"));
  register(el, (now) => {
    const t = zoned(el, now);
    const txt = `${t.weekday}, ${t.month.slice(0, 3)} ${t.day}`;
    if (dd.textContent !== txt) dd.textContent = txt;
    if (oo.textContent !== t.offset) oo.textContent = t.offset;
  });
}

/* ---------- number that counts up when it scrolls in ---------- */
export function formatNum(v, { decimals = 0, sep = ".", dec = "," } = {}) {
  const [i, f] = Math.abs(v).toFixed(decimals).split(".");
  return (v < 0 ? "-" : "") + i.replace(/\B(?=(\d{3})+(?!\d))/g, sep) + (f ? dec + f : "");
}
function stat(el) {
  if (el._stat) return;
  el._stat = true;
  const d = el.dataset;
  const opts = { decimals: +(d.decimals || 0), sep: d.sep ?? ".", dec: d.dec ?? "," };
  const target = parseFloat(d.count);
  const unit = d.unit ? `<small style="font-size:.85em;margin-left:.2em">${d.unit.replace(/[<&]/g, "")}</small>` : "";
  const paint = (v) => (el.innerHTML = formatNum(v, opts) + unit);
  if (reduced() || isNaN(target)) return paint(target || 0);
  const o = { v: 0 };
  paint(0);
  gsap.to(o, { v: target, duration: 1.8, ease: "power3.out", onUpdate: () => paint(o.v), scrollTrigger: { trigger: el, start: "top 92%", once: true } });
}

/* ---------- board entrance ---------- */
function board(el) {
  if (el._board || reduced()) return;
  el._board = true;
  gsap.from(el.children, {
    y: 40, scale: 0.86, rotate: () => gsap.utils.random(-6, 6), autoAlpha: 0, duration: 0.8, ease: "back.out(1.8)",
    stagger: { each: 0.06, from: "start" }, clearProps: "transform,opacity,visibility",
    scrollTrigger: { trigger: el, start: "top 88%", once: true },
  });
}

export function widgets(root = document) {
  $$(".y-wi[data-wi]", root).forEach(icon);
  $$(".y-wclock", root).forEach(wclock);
  $$(".y-aclock", root).forEach(aclock);
  $$(".y-dclock", root).forEach(digital);
  $$(".y-dday", root).forEach(dday);
  $$(".y-dbig", root).forEach(dbig);
  $$(".y-stat[data-count]", root).forEach(stat);
  $$(".y-wind[data-deg] .y-wi", root).forEach((i) => (i.style.transform = `rotate(${parseFloat(i.closest(".y-wind").dataset.deg) || 0}deg)`));
  $$(".y-wgt-board", root).forEach(board);
}
