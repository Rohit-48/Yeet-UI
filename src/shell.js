/* ============================================
   Shared site shell: styles, helpers, page transitions,
   cursor, global search, footer. Every page imports this
   and calls initShell() after rendering its own content.
   ============================================ */
import "./styles/tokens.css";
import "./styles/components.css";
import "./styles/widgets.css";
import "./styles/site.css";
import "./styles/pages.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { yeet } from "./components.js";
import { components, colors } from "./registry.js";

gsap.registerPlugin(ScrollTrigger, Flip, Draggable, InertiaPlugin);

/* ---------- helpers ---------- */
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const h = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };
export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
export const catColor = { Actions: "lime", Forms: "blue", Display: "yellow", Navigation: "purple", Overlays: "pink", Feedback: "mint", Widgets: "orange" };
export const kindColor = { class: "lime", modifier: "yellow", element: "white", state: "pink", attribute: "mint", "css var": "orange", js: "purple" };
export const dedent = (str) => {
  const lines = str.replace(/^\n+|\s+$/g, "").split("\n");
  const min = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^\s*/)[0].length));
  return lines.map((l) => l.slice(min)).join("\n");
};
export const hlHTML = (code) => esc(code)
  .replace(/([\w-]+)="([^"]*)"/g, '<span class="a">$1</span>=<span class="s">"$2"</span>')
  .replace(/(&lt;\/?)([\w-]+)/g, '$1<span class="t">$2</span>')
  .replace(/(&lt;!--.*?--&gt;)/g, '<span class="c">$1</span>');
// one pass, so a token is only ever coloured once (sequential replaces used to re-match
// the quotes inside an already-inserted <span class="c">)
export const hlJS = (code) => esc(code).replace(
  /(\/\/[^\n]*)|("[^"\n]*")|\b(import|from|const|let|await|new|export|function|return)\b|\b(yeet)\b/g,
  (m, c, s, k, a) => (c ? `<span class="c">${c}</span>` : s ? `<span class="s">${s}</span>` : k ? `<span class="k">${k}</span>` : `<span class="a">${a}</span>`),
);
export const hlCSS = (code) => esc(code)
  .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="c">$1</span>')
  .replace(/(--[\w-]+)(?=\s*:)/g, '<span class="a">$1</span>')
  .replace(/:\s*([^;\n{]+);/g, ': <span class="s">$1</span>;');
export async function copy(text, label = "Copied! Go ship it.") {
  try { await navigator.clipboard.writeText(text); yeet.toast(label, { emoji: "📋", bg: "var(--y-lime)" }); }
  catch { yeet.toast("Clipboard said no 😭", { emoji: "🚫", bg: "var(--y-pink)" }); }
}
export function splitChars(node, cls = "char") {
  [...node.childNodes].forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      // chars are grouped per word (.wrd = nowrap) so lines only break between words
      const frag = document.createDocumentFragment();
      child.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) return frag.append(document.createTextNode(" "));
        const word = Object.assign(document.createElement("span"), { className: "wrd" });
        [...part].forEach((ch) => word.append(Object.assign(document.createElement("span"), { className: cls, textContent: ch })));
        frag.append(word);
      });
      child.replaceWith(frag);
    } else splitChars(child, cls);
  });
  return $$(`.${cls}`, node);
}
export function flash(el) {
  if (!el || reduced) return;
  gsap.fromTo(el, { backgroundColor: "rgba(198,255,61,1)", rotate: -2 },
    { backgroundColor: "rgba(198,255,61,0)", rotate: 0, duration: 1.4, ease: "power2.out", clearProps: "backgroundColor,transform" });
}
export { gsap, ScrollTrigger, Flip, Draggable, yeet, components, colors };

/* ---------- page transitions + first-visit boot loader ----------
   The curtain (.pt) and its critical CSS are inlined in every page, and the
   head script decides before first paint whether it starts closed:
   .pt-in   → arriving from another page (closed, lifts right away)
   .pt-boot → first visit this session (logo + real loading meter, then lifts) */
const pageNames = { "/": "home", "/components.html": "components", "/docs.html": "docs", "/tokens.html": "tokens", "/usage.html": "usage" };
const norm = (p) => (p.replace(/index\.html$/, "") || "/");
const nameFor = (path) => pageNames[norm(path)] || "yeet/ui";
const root = document.documentElement;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let navigating = false;

const prefetched = new Set([location.href]);
function prefetch(href) {
  if (prefetched.has(href)) return;
  prefetched.add(href);
  document.head.append(Object.assign(document.createElement("link"), { rel: "prefetch", href }));
}

export function go(url) {
  const u = new URL(url, location.href);
  if (navigating) return;
  navigating = true;
  if (reduced) { location.href = u.href; return; }
  const name = nameFor(u.pathname);
  try { sessionStorage.setItem("yeet-pt", name); } catch { /* ignore */ }
  prefetch(u.href);
  $(".pt__name").textContent = name;
  root.classList.remove("pt-boot");
  gsap.killTweensOf(".pt, .pt__bar, .pt__label");
  // ~0.55s total, and navigation is kicked off just before it finishes
  gsap.timeline()
    .set(".pt", { visibility: "visible", pointerEvents: "auto" })
    .set(".pt__label", { opacity: 0 })
    .fromTo(".pt__bar", { scaleY: 0, transformOrigin: "50% 100%" }, { scaleY: 1, duration: 0.38, ease: "power3.inOut", stagger: 0.03 })
    .fromTo(".pt__label", { opacity: 0, y: 24, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.22, ease: "back.out(2)" }, "-=0.2")
    .add(() => (location.href = u.href), "-=0.05");
}

function lift(tl, resolve, position) {
  return tl
    .to(".pt__bar", { scaleY: 0, transformOrigin: "50% 0%", duration: 0.55, ease: "power4.inOut", stagger: { each: 0.04, from: "center" } }, position)
    .add(resolve, "<0.1") // page intros start while the bars are still lifting
    .add(() => { root.classList.remove("pt-in", "pt-boot"); gsap.set(".pt", { visibility: "hidden", pointerEvents: "none" }); });
}

function bootSequence(resolve) {
  const name = $(".pt__name");
  name.textContent = "";
  const chars = [..."yeet/ui"].map((ch) => name.appendChild(Object.assign(document.createElement("span"), { textContent: ch })));
  const meter = $(".pt__meter i"), pct = $(".pt__pct");
  const prog = { v: 0 };
  const show = () => { meter.style.transform = `scaleX(${prog.v})`; pct.textContent = `loading ${Math.round(prog.v * 100)}%`; };

  const intro = gsap.timeline()
    .from(".pt__mark", { scale: 0, rotate: -160, duration: 0.7, ease: "back.out(2.2)" })
    .from([".pt__meter", ".pt__pct"], { y: 16, opacity: 0, duration: 0.35, stagger: 0.06, ease: "power3.out" }, "-=0.45")
    .to(prog, { v: 0.85, duration: 1.1, ease: "power2.out", onUpdate: show }, "<");

  // the wordmark appears once its font is ready, so it never flashes in a fallback face
  const fonts = Promise.race([document.fonts?.ready ?? Promise.resolve(), wait(1200)]);
  fonts.then(() => {
    gsap.set(name, { opacity: 1 });
    intro.from(chars, { yPercent: 110, opacity: 0, rotate: 10, stagger: 0.035, duration: 0.5, ease: "back.out(2.2)" }, Math.max(intro.time(), 0.2));
  });

  // real readiness: fonts + decoded hero art, but never less than ~0.9s nor more than 2.6s
  const imgs = $$(".prop img, .ph__prop").map((i) => (i.decode ? i.decode().catch(() => {}) : null));
  const ready = Promise.race([Promise.all([fonts, ...imgs, wait(900)]), wait(2600)]);
  ready.then(() => {
    const out = gsap.timeline()
      .to(prog, { v: 1, duration: 0.3, ease: "power2.inOut", onUpdate: show })
      .to(".pt__spark", { rotation: 180, svgOrigin: "29 29", duration: 0.5, ease: "back.inOut(2)" }, "<")
      .to(".pt__label", { opacity: 0, scale: 0.9, y: -20, duration: 0.28, ease: "power2.in" }, "+=0.1");
    lift(out, resolve, "-=0.08");
  });
}

// starts the moment the shell module runs, not after the page finishes initialising
const revealed = new Promise((resolve) => {
  const covered = root.classList.contains("pt-in");
  const boot = root.classList.contains("pt-boot");
  try { sessionStorage.removeItem("yeet-pt"); sessionStorage.setItem("yeet-loaded", "1"); } catch { /* ignore */ }
  if (!covered || reduced) { root.classList.remove("pt-in", "pt-boot"); return resolve(); }
  gsap.set(".pt", { visibility: "visible" });
  gsap.set(".pt__bar", { scaleY: 1 });
  if (boot) return bootSequence(resolve);
  const tl = gsap.timeline().to(".pt__label", { opacity: 0, y: -24, scale: 0.92, duration: 0.2, ease: "power2.in" });
  lift(tl, resolve, 0.04); // lift starts almost immediately, label fades as it goes
});

function interceptLinks() {
  const internal = (a) => a && a.origin === location.origin && !a.hasAttribute("download") && (!a.target || a.target === "_self") && norm(a.pathname) !== norm(location.pathname);
  // warm the next page as soon as you show intent
  const warm = (e) => { const a = e.target.closest?.("a[href]"); if (internal(a)) prefetch(a.href.split("#")[0]); };
  document.addEventListener("pointerover", warm, { passive: true });
  document.addEventListener("focusin", warm);
  document.addEventListener("touchstart", warm, { passive: true });
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (!internal(a)) return; // same page (#hash) or external → browser default
    e.preventDefault();
    go(a.href);
  });
  // coming back via bfcache: make sure the curtain is open and links work again
  window.addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    navigating = false;
    gsap.killTweensOf(".pt, .pt__bar, .pt__label");
    gsap.set(".pt__bar", { scaleY: 0 });
    gsap.set(".pt__label", { opacity: 0 });
    gsap.set(".pt", { visibility: "hidden", pointerEvents: "none" });
    root.classList.remove("pt-in", "pt-boot");
  });
}

/* ---------- cursor ---------- */
function cursor() {
  const c = $(".cursor");
  if (!c) return;
  const cx = gsap.quickTo(c, "x", { duration: 0.35, ease: "power3.out" });
  const cy = gsap.quickTo(c, "y", { duration: 0.35, ease: "power3.out" });
  window.addEventListener("pointermove", (e) => { cx(e.clientX); cy(e.clientY); });
  document.documentElement.addEventListener("pointerleave", () => gsap.to(c, { opacity: 0, scale: 0, duration: 0.25 }));
  document.documentElement.addEventListener("pointerenter", () => gsap.to(c, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }));
  let wasHot = false;
  document.addEventListener("pointerover", (e) => {
    const hot = !!e.target.closest("button, a, input, label, [data-tilt], .ft__sticker");
    if (hot === wasHot) return; // only animate when the state actually flips
    wasHot = hot;
    gsap.to(c, { scale: hot ? 3 : 1, backgroundColor: hot ? "#c6ff3d" : "#ff4fd8", duration: 0.3, ease: "back.out(2)", overwrite: "auto" });
  });
}

/* ---------- global search ---------- */
let beforeJump = null;
export const onBeforeJump = (fn) => (beforeJump = fn);

function search() {
  const docs = "/docs.html";
  const items = [
    { title: "Home", sub: "Hero, previews, the vibe", emoji: "🏠", color: "var(--y-white)", group: "Pages", href: "/" },
    { title: "Components", sub: "The full lineup, filterable", emoji: "🍱", color: "var(--y-yellow)", group: "Pages", href: "/components.html", keywords: "overview lineup gallery", featured: true },
    { title: "Docs", sub: "Every component with code + API", emoji: "📚", color: "var(--y-blue)", group: "Pages", href: docs, keywords: "documentation api", featured: true },
    { title: "Tokens", sub: "Colors, type, radius, shadows, motion", emoji: "🎨", color: "var(--y-orange)", group: "Pages", href: "/tokens.html", keywords: "design tokens foundations", featured: true },
    { title: "Usage", sub: "Install, theme remix, recipes, FAQ", emoji: "🧩", color: "var(--y-mint)", group: "Pages", href: "/usage.html", keywords: "install setup getting started theme react", featured: true },
    ...components.map((c) => ({
      title: c.name, sub: `${c.category} · ${c.desc}`, emoji: c.emoji, color: `var(--y-${catColor[c.category]})`,
      group: "Components", href: `${docs}#${c.id}`,
      keywords: `${c.id} ${c.category} ${c.groups.map((g) => g.label).join(" ")} ${c.api.map((a) => a[0]).join(" ")}`,
    })),
    ...components.flatMap((c) => c.api.map(([name, kind, d]) => ({
      title: name, sub: `${c.emoji} ${c.name} · ${kind} · ${d}`, emoji: "⚙️", color: `var(--y-${kindColor[kind] || "white"})`,
      group: "Props & classes", href: `${docs}#${c.id}-api`, keywords: `${c.name} ${kind}`,
    }))),
    ...colors.map((c) => ({ title: `--y-${c}`, sub: "Color token", emoji: "", color: `var(--y-${c})`, group: "Tokens", href: `/tokens.html#colors`, keywords: `${c} color colour` })),
    { title: "Typography", sub: "Bricolage Grotesque, Space Grotesk, JetBrains Mono", emoji: "🔤", color: "var(--y-paper)", group: "Tokens", href: "/tokens.html#type", keywords: "font type" },
    { title: "Radius & borders", sub: "--y-radius-sm … --y-radius-pill, --y-border", emoji: "⬜", color: "var(--y-paper)", group: "Tokens", href: "/tokens.html#shape", keywords: "radius border round" },
    { title: "Shadows", sub: "--y-shadow-sm / --y-shadow / --y-shadow-lg", emoji: "🌘", color: "var(--y-paper)", group: "Tokens", href: "/tokens.html#shadows", keywords: "shadow" },
    { title: "Motion", sub: "--y-ease-bounce, --y-ease-out + GSAP eases", emoji: "🌀", color: "var(--y-paper)", group: "Tokens", href: "/tokens.html#motion", keywords: "ease easing animation" },
    { title: "Theme remix", sub: "Build your own theme overrides", emoji: "🎛️", color: "var(--y-pink)", group: "Usage", href: "/usage.html#remix", keywords: "theme customize override colors" },
    { title: "Install in 4 steps", sub: "Copy files, link CSS, init JS", emoji: "🪜", color: "var(--y-lime)", group: "Usage", href: "/usage.html#steps", keywords: "install setup" },
    { title: "Framework recipes", sub: "React, Vue, plain HTML", emoji: "🍳", color: "var(--y-yellow)", group: "Usage", href: "/usage.html#recipes", keywords: "react vue svelte next" },
    { title: "FAQ", sub: "Questions, answered", emoji: "❓", color: "var(--y-white)", group: "Usage", href: "/usage.html#faq", keywords: "help questions" },
  ];
  yeet.search({
    items,
    groupOrder: ["Pages", "Components", "Props & classes", "Tokens", "Usage"],
    storageKey: "yeet-ui:searches",
    onSelect: (item) => {
      const u = new URL(item.href, location.href);
      if (norm(u.pathname) !== norm(location.pathname)) return go(u.href);
      if (!u.hash) return window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      beforeJump?.(u.hash);
      jumpTo(u.hash);
    },
  });
}

export function jumpTo(hash) {
  const target = hash && document.querySelector(hash);
  if (!target) return;
  history.replaceState(null, "", hash);
  target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  setTimeout(() => flash(target.matches(".doc") ? $(".doc__title", target) : target.querySelector("h2, h3") || target), reduced ? 0 : 700);
}

/* ---------- footer ---------- */
const moods = ["perfect time to ship.", "touch grass, then deploy.", "your css is valid & so are you.", "hydrate. then refactor.", "main character hours.", "zero bugs (we hope).", "vibes: immaculate."];

function footer() {
  const ft = $(".ft");
  if (!ft) return;

  // clock + mood
  const clock = $("[data-clock]", ft), mood = $("[data-mood]", ft);
  const tick = () => (clock.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  tick(); setInterval(tick, 10000);
  let m = Math.floor(Math.random() * moods.length);
  mood.textContent = moods[m];
  $("[data-vibe]", ft).addEventListener("click", (e) => {
    m = (m + 1 + Math.floor(Math.random() * (moods.length - 1))) % moods.length;
    gsap.timeline()
      .to(mood, { y: -14, opacity: 0, duration: 0.18, ease: "power2.in" })
      .add(() => (mood.textContent = moods[m]))
      .fromTo(mood, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "back.out(2)" });
    gsap.fromTo(e.currentTarget, { rotate: -20 }, { rotate: 0, duration: 0.6, ease: "elastic.out(1.2, 0.4)" });
  });

  // headline: letters ripple away from the cursor
  const chars = splitChars($("[data-wave]", ft), "wch");
  if (!reduced) {
    const setters = chars.map((c) => ({ c, cx: 0, cy: 0, y: gsap.quickTo(c, "y", { duration: 0.5, ease: "power3.out" }), r: gsap.quickTo(c, "rotate", { duration: 0.5, ease: "power3.out" }) }));
    const cta = $(".ft__cta", ft);
    // measure letter centres once per hover (relative to the block), not on every mouse move
    let box = null, raf = 0, px = 0, py = 0;
    cta.addEventListener("pointerenter", () => {
      box = cta.getBoundingClientRect();
      setters.forEach((s) => {
        const b = s.c.getBoundingClientRect();
        s.cx = b.left - box.left + b.width / 2 - (gsap.getProperty(s.c, "x") || 0);
        s.cy = b.top - box.top + b.height / 2 - (gsap.getProperty(s.c, "y") || 0);
      });
    });
    cta.addEventListener("pointermove", (e) => {
      if (!box) return;
      const r0 = cta.getBoundingClientRect(); // one read per move (handles scrolling while hovering)
      px = e.clientX - r0.left; py = e.clientY - r0.top;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        setters.forEach(({ cx, cy, y, r }) => {
          const dx = px - cx, dy = py - cy;
          const f = Math.max(0, 1 - Math.hypot(dx, dy) / 180);
          y(-f * 34); r(f * (dx > 0 ? -14 : 14));
        });
      });
    });
    cta.addEventListener("pointerleave", () => { box = null; setters.forEach(({ y, r }) => { y(0); r(0); }); });
  }

  // giant wordmark: letters rise in, then hop on hover
  const word = $("[data-word]", ft);
  const letters = splitChars(word, "wl");
  const palette = ["#c6ff3d", "#ff4fd8", "#ffe14d", "#3dffc5", "#9b5cff", "#ff7a1a"];
  letters.forEach((l, i) => l.addEventListener("pointerenter", () => {
    gsap.timeline()
      .to(l, { yPercent: -18, rotate: gsap.utils.random(-12, 12), color: palette[i % palette.length], duration: 0.25, ease: "power2.out" })
      .to(l, { yPercent: 0, rotate: 0, duration: 0.9, ease: "elastic.out(1.2, 0.35)" })
      .to(l, { color: "#c6ff3d", duration: 0.6 }, "-=0.4");
  }));

  // sticker playground: drop in with a bounce, then drag + throw
  const play = $("[data-playground]", ft);
  const stickers = $$(".ft__sticker", play);
  stickers.forEach((s) => gsap.set(s, { bottom: gsap.utils.random(0, 70), rotate: gsap.utils.random(-25, 25) }));
  let z = 10;
  Draggable.create(stickers, {
    type: "x,y", bounds: play, inertia: true, edgeResistance: 0.75,
    onPress() { this.target.style.zIndex = ++z; gsap.to(this.target, { scale: 1.12, duration: 0.2 }); },
    onRelease() { gsap.to(this.target, { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.4)" }); },
    onDrag() { gsap.to(this.target, { rotate: gsap.utils.clamp(-35, 35, this.deltaX * 3), duration: 0.3 }); },
  });

  // rocket back to top
  $("[data-rocket]", ft).addEventListener("click", (e) => {
    const r = $("span", e.currentTarget);
    if (reduced) return window.scrollTo(0, 0);
    gsap.timeline()
      .to(r, { x: -3, duration: 0.05, repeat: 5, yoyo: true })
      .to(r, { y: -window.innerHeight, rotate: -25, duration: 0.8, ease: "power3.in" })
      .add(() => window.scrollTo({ top: 0, behavior: "smooth" }), "-=0.3")
      .set(r, { y: 40, rotate: 0 })
      .to(r, { y: 0, duration: 0.6, ease: "back.out(2)", delay: 0.6 });
  });

  if (reduced) return;
  gsap.from(chars, { yPercent: 110, opacity: 0, rotate: 12, stagger: 0.015, duration: 0.7, ease: "power4.out", scrollTrigger: { trigger: ft, start: "top 70%", once: true } });
  gsap.from($$(".ft__cols > div, .ft__btns > *", ft), { y: 40, opacity: 0, stagger: 0.08, duration: 0.7, ease: "back.out(1.6)", scrollTrigger: { trigger: ".ft__cols", start: "top 90%", once: true } });
  gsap.from(stickers, {
    y: -600, opacity: 0, rotate: () => gsap.utils.random(-180, 180), stagger: { each: 0.07, from: "random" }, duration: 1.3, ease: "bounce.out",
    scrollTrigger: { trigger: play, start: "top 85%", once: true },
  });
  gsap.from(letters, { yPercent: 100, stagger: 0.05, ease: "none", scrollTrigger: { trigger: word, start: "top bottom", end: "bottom bottom", scrub: 0.6 } });
  // wordmark squashes with scroll speed
  const skew = gsap.quickTo(word, "skewX", { duration: 0.4, ease: "power3.out" });
  ScrollTrigger.create({ trigger: ft, start: "top bottom", end: "bottom bottom", onUpdate: (self) => skew(gsap.utils.clamp(-14, 14, self.getVelocity() / -120)) });
  ScrollTrigger.addEventListener("scrollEnd", () => skew(0));
}

/* ---------- section reveals (any page) ---------- */
function reveals() {
  if (reduced) return;
  $$("[data-reveal]").forEach((el) => gsap.from(el.dataset.reveal === "stagger" ? el.children : el, {
    y: 50, opacity: 0, stagger: 0.08, duration: 0.8, ease: "power4.out", clearProps: "transform,opacity",
    scrollTrigger: { trigger: el, start: "top 85%", once: true },
  }));
}

/* ---------- page header (shared by inner pages) ---------- */
function pageHead() {
  const head = $(".ph");
  if (!head || reduced) return;
  const chars = splitChars($(".ph__title", head));
  gsap.timeline() // runs right as the curtain starts lifting (initShell awaits the reveal)
    .from($$(".ph__eyebrow, .ph__crumbs", head), { y: 20, opacity: 0, duration: 0.5 })
    .from(chars, { yPercent: 120, rotate: 12, stagger: 0.03, duration: 0.8, ease: "power4.out" }, "-=0.3")
    .from($$(".ph__sub, .ph__meta > *", head), { y: 24, opacity: 0, stagger: 0.07, duration: 0.6, ease: "back.out(1.6)" }, "-=0.5")
    .from($$(".ph__prop", head), { scale: 0, rotate: -120, stagger: 0.1, duration: 0.9, ease: "back.out(2)" }, "-=0.7");
  $$(".ph__prop", head).forEach((p, i) => {
    gsap.to(p, { y: "+=16", duration: 2.2 + i * 0.4, yoyo: true, repeat: -1, ease: "sine.inOut" });
    gsap.to(p, { yPercent: -60 * (i + 1), rotate: (i % 2 ? 1 : -1) * 40, ease: "none", scrollTrigger: { trigger: head, start: "top top", end: "bottom top", scrub: 0.6 } });
  });
}

/* ---------- sticky in-page sub navigation (.subnav) ---------- */
function subnav() {
  const nav = $(".subnav");
  if (!nav) return;
  const pill = $(".subnav__pill", nav);
  const links = $$("a", nav);
  const move = (a) => {
    links.forEach((l) => l.classList.toggle("is-active", l === a));
    gsap.to(pill, { x: a.offsetLeft, width: a.offsetWidth, opacity: 1, duration: reduced ? 0 : 0.5, ease: "back.out(1.6)" });
    // keep the active chip visible on narrow screens
    const inner = $(".subnav__inner", nav);
    inner.scrollTo({ left: a.offsetLeft - inner.clientWidth / 2 + a.offsetWidth / 2, behavior: reduced ? "auto" : "smooth" });
  };
  links.forEach((a) => {
    const sec = $(a.hash);
    if (!sec) return;
    ScrollTrigger.create({ trigger: sec, start: "top 40%", end: "bottom 40%", onToggle: ({ isActive }) => isActive && move(a) });
  });
  ScrollTrigger.create({ trigger: nav, start: "top 92px", endTrigger: "footer", end: "top bottom", toggleClass: { targets: nav, className: "is-stuck" } });
  // get out of the way once the footer takes over
  ScrollTrigger.create({ trigger: "footer", start: "top 40%", end: "bottom top", toggleClass: { targets: nav, className: "is-gone" } });
}

/* ---------- tab title + favicon: swap when you leave, welcome you back ---------- */
function tabVibes() {
  const icon = document.querySelector('link[rel="icon"][type="image/svg+xml"]');
  const title = document.title;
  const away = ["come back bestie 🥺", "psst… your components miss you", "we're still here ✦", "don't leave us on read 💀"];
  let backTimer;
  document.addEventListener("visibilitychange", () => {
    clearTimeout(backTimer);
    if (document.hidden) {
      document.title = away[Math.floor(Math.random() * away.length)];
      if (icon) icon.href = "/favicon-away.svg";
    } else {
      document.title = "you're back! ✦";
      if (icon) icon.href = "/favicon.svg";
      backTimer = setTimeout(() => (document.title = title), 1600);
    }
  });
}

/* ---------- init ---------- */
export async function initShell() {
  interceptLinks();
  yeet.init();
  cursor();
  search();
  footer();
  reveals();
  subnav();
  tabVibes();
  window.addEventListener("load", () => ScrollTrigger.refresh());
  await revealed;
  pageHead();
  if (location.hash) setTimeout(() => jumpTo(location.hash), 150);
}
