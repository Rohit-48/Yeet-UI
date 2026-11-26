/* ============================================
   YEET/UI — component behaviours (GSAP)
   import { yeet } from "./components.js"; yeet.init();
   ============================================ */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createSearch } from "./search.js";
import { sound } from "./sound.js";

gsap.registerPlugin(ScrollTrigger);

const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Toast ---------- */
function toast(message, { emoji = "✨", bg = "var(--y-white)", duration = 3 } = {}) {
  let toaster = document.querySelector(".y-toaster");
  if (!toaster) {
    toaster = Object.assign(document.createElement("div"), { className: "y-toaster" });
    toaster.setAttribute("aria-live", "polite");
    document.body.append(toaster);
  }
  const el = document.createElement("div");
  el.className = "y-toast";
  el.style.setProperty("--bg", bg);
  el.innerHTML = `<span class="y-toast__emoji"></span><span></span>`;
  el.children[0].textContent = emoji;
  el.children[1].textContent = message;
  toaster.append(el);

  gsap.timeline({ onComplete: () => el.remove() })
    .from(el, { x: "120%", rotate: 10, duration: 0.55, ease: "back.out(1.8)" })
    .to(el.children[0], { rotate: 20, scale: 1.3, duration: 0.12, yoyo: true, repeat: 3, ease: "sine.inOut" }, "-=0.1")
    .to(el, { x: "120%", opacity: 0, rotate: -6, duration: 0.4, ease: "back.in(1.6)" }, `+=${duration}`);
}

/* ---------- Magnetic ---------- */
function magnetic(el, strength = 0.35) {
  const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
  const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect();
    xTo((e.clientX - (r.left + r.width / 2)) * strength);
    yTo((e.clientY - (r.top + r.height / 2)) * strength);
  });
  el.addEventListener("pointerleave", () => {
    gsap.to(el, { x: 0, y: 0, duration: 1, ease: "elastic.out(1.1, 0.35)" });
  });
}

/* ---------- Tilt card ---------- */
function tilt(el, max = 12) {
  gsap.set(el, { transformPerspective: 800 });
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(el, { rotateY: px * max * 2, rotateX: -py * max * 2, scale: 1.03, duration: 0.4, ease: "power2.out" });
  });
  el.addEventListener("pointerleave", () => {
    gsap.to(el, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.9, ease: "elastic.out(1, 0.4)" });
  });
}

/* ---------- Tabs ---------- */
function tabs(root) {
  const tabsEls = $$(".y-tabs__tab", root);
  const panels = $$(".y-tabs__panel", root);
  const pill = root.querySelector(".y-tabs__pill");

  const movePill = (tab, instant) => {
    gsap.to(pill, {
      x: tab.offsetLeft, width: tab.offsetWidth,
      duration: instant ? 0 : 0.55, ease: "back.out(1.6)",
    });
  };
  const select = (i, instant = false) => {
    tabsEls.forEach((t, j) => {
      t.setAttribute("aria-selected", String(i === j));
      t.tabIndex = i === j ? 0 : -1;
    });
    panels.forEach((p, j) => (p.hidden = i !== j));
    movePill(tabsEls[i], instant);
    if (!instant) gsap.from(panels[i], { y: 14, opacity: 0, duration: 0.4, ease: "power3.out" });
  };

  tabsEls.forEach((t, i) => {
    t.addEventListener("click", () => select(i));
    t.addEventListener("keydown", (e) => {
      const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!dir) return;
      const next = (i + dir + tabsEls.length) % tabsEls.length;
      tabsEls[next].focus();
      select(next);
    });
  });
  const initial = Math.max(0, tabsEls.findIndex((t) => t.getAttribute("aria-selected") === "true"));
  select(initial, true);
  // fonts can shift widths after load
  document.fonts?.ready.then(() =>
    movePill(tabsEls.find((t) => t.getAttribute("aria-selected") === "true") || tabsEls[0], true));
}

/* ---------- Accordion ---------- */
function accordion(root) {
  const items = $$(".y-accordion__item", root);
  const close = (item) => {
    item.classList.remove("is-open");
    item.querySelector(".y-accordion__trigger").setAttribute("aria-expanded", "false");
    gsap.to(item.querySelector(".y-accordion__panel"), { height: 0, duration: 0.4, ease: "power3.inOut" });
  };
  items.forEach((item) => {
    item.querySelector(".y-accordion__trigger").addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");
      items.forEach((other) => other.classList.contains("is-open") && close(other));
      if (isOpen) return;
      item.classList.add("is-open");
      item.querySelector(".y-accordion__trigger").setAttribute("aria-expanded", "true");
      gsap.to(item.querySelector(".y-accordion__panel"), { height: "auto", duration: 0.5, ease: "power3.out" });
      gsap.from(item.querySelector(".y-accordion__inner"), { y: -10, opacity: 0, duration: 0.4, delay: 0.1 });
    });
  });
}

/* ---------- Modal ---------- */
let lastFocus = null;
function openModal(modal) {
  lastFocus = document.activeElement;
  modal.classList.add("is-open");
  document.body.style.overflow = "hidden";
  const dialog = modal.querySelector(".y-modal__dialog");
  gsap.timeline()
    .fromTo(modal.querySelector(".y-modal__backdrop"), { opacity: 0 }, { opacity: 1, duration: 0.3 })
    .fromTo(dialog, { y: 80, scale: 0.6, rotate: -8, opacity: 0 },
      { y: 0, scale: 1, rotate: 0, opacity: 1, duration: 0.6, ease: "back.out(1.7)" }, "<")
    .fromTo(modal.querySelector(".y-modal__emoji"), { scale: 0, rotate: -180 },
      { scale: 1, rotate: 0, duration: 0.7, ease: "elastic.out(1, 0.5)" }, "-=0.35");
  dialog.querySelector("button")?.focus();
}
function closeModal(modal) {
  if (!modal.classList.contains("is-open")) return;
  gsap.timeline({
    onComplete: () => {
      modal.classList.remove("is-open");
      document.body.style.overflow = "";
      lastFocus?.focus();
    },
  })
    .to(modal.querySelector(".y-modal__dialog"), { y: 40, scale: 0.85, rotate: 4, opacity: 0, duration: 0.3, ease: "back.in(1.5)" })
    .to(modal.querySelector(".y-modal__backdrop"), { opacity: 0, duration: 0.2 }, "-=0.1");
}

/* ---------- Marquee ---------- */
/* All marquees share ONE scroll-velocity reader + ONE ticker that eases their speed,
   instead of each creating fresh tweens on every scroll event. Off-screen ones pause. */
const marquees = new Set();
let boostTarget = 1, boost = 1, velocityReader = null;
function ensureMarqueeEngine() {
  if (velocityReader) return;
  velocityReader = ScrollTrigger.create({
    start: 0, end: "max",
    onUpdate: (self) => (boostTarget = 1 + Math.min(Math.abs(self.getVelocity()) / 300, 5)),
  });
  gsap.ticker.add(() => {
    boost += (boostTarget - boost) * 0.12;   // ease toward target
    boostTarget += (1 - boostTarget) * 0.06; // and decay back to normal speed
    if (Math.abs(boost - 1) < 0.002 && boostTarget === 1) return;
    marquees.forEach((t) => t.isActive() && t.timeScale(boost));
  });
}
function marquee(el) {
  const track = el.querySelector(".y-marquee__track");
  const items = [...track.children];
  // repeat content until it is at least 2x the viewport, then duplicate once for a seamless loop
  for (let i = 0; i < 10 && track.scrollWidth > 0 && track.scrollWidth < window.innerWidth * 1.2; i++) {
    items.forEach((n) => track.append(n.cloneNode(true)));
  }
  [...track.children].forEach((n) => track.append(n.cloneNode(true)));
  track.style.willChange = "transform";
  const dir = el.hasAttribute("data-reverse") ? 1 : -1;
  const tween = gsap.fromTo(track,
    { xPercent: dir === -1 ? 0 : -50 },
    { xPercent: dir === -1 ? -50 : 0, duration: Number(el.dataset.speed) || 22, ease: "none", repeat: -1 });
  if (reduced()) return tween.pause();
  marquees.add(tween);
  ensureMarqueeEngine();
  // only run while on screen
  ScrollTrigger.create({ trigger: el, start: "top bottom", end: "bottom top", onToggle: ({ isActive }) => (isActive ? tween.play() : tween.pause()) });
}

/* ---------- Navbar ----------
   [data-nav]           sliding hover blob + scroll-spy on #hash links
   [data-nav-fixed]     compact glass mode after scrolling, hides on scroll down
   .y-nav__ring         scroll-progress ring around the logo mark
   .y-nav__burger       opens the sheet named by aria-controls (mobile) */
function nav(el) {
  const links = $$(".y-nav__link", el);
  const blob = el.querySelector(".y-nav__blob");
  // the link for the page we're on (multi-page sites) is the resting spot for the blob
  const norm = (p) => p.replace(/index\.html$/, "").replace(/\/$/, "") || "/";
  const pageLink = links.find((l) => !l.hash && l.origin === location.origin && norm(l.pathname) === norm(location.pathname)) || null;
  let active = pageLink;
  let hovering = null;

  const moveBlob = (link) => {
    links.forEach((l) => l.classList.toggle("is-hot", l === link));
    if (!blob) return;
    if (!link) return gsap.to(blob, { opacity: 0, scale: 0.7, duration: 0.3, ease: "power2.in" });
    const shown = gsap.getProperty(blob, "opacity") > 0.5;
    if (!shown) gsap.set(blob, { x: link.offsetLeft, width: link.offsetWidth });
    gsap.to(blob, { x: link.offsetLeft, width: link.offsetWidth, opacity: 1, scale: 1, duration: 0.55, ease: "back.out(1.6)" });
  };
  links.forEach((l) => l.addEventListener("pointerenter", () => { hovering = l; moveBlob(l); }));
  links[0]?.parentElement.addEventListener("pointerleave", () => { hovering = null; moveBlob(active); });
  if (pageLink) {
    requestAnimationFrame(() => moveBlob(pageLink));
    document.fonts?.ready.then(() => !hovering && moveBlob(active));
  }

  // scroll spy
  // sections may nest (e.g. #tokens inside #library): the last active link in DOM order wins
  const sheetLinks = [];
  const spies = [];
  links.forEach((link) => {
    const target = link.hash && link.hash.length > 1 && document.querySelector(link.hash);
    if (!target) return;
    spies.push([link, ScrollTrigger.create({
      trigger: target, start: "top 50%", end: "bottom 50%",
      onToggle: () => {
        active = spies.filter(([, st]) => st.isActive).map(([l]) => l).pop() || pageLink;
        if (!hovering) moveBlob(active);
        sheetLinks.forEach((a) => a.classList.toggle("is-active", !!active && a.href === active.href));
      },
    })]);
  });

  // logo: progress ring + spinning glyph + hover pop
  const ringFg = el.querySelector(".y-nav__ring .fg");
  const glyph = el.querySelector(".y-nav__glyph");
  const scrub = { start: 0, end: "max", scrub: 0.6 };
  if (ringFg) gsap.fromTo(ringFg, { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "none", scrollTrigger: scrub });
  if (glyph && !reduced()) gsap.to(glyph, { rotation: 720, ease: "none", scrollTrigger: { ...scrub } });
  const logo = el.querySelector(".y-nav__logo");
  logo?.addEventListener("pointerenter", () => {
    gsap.fromTo(logo.querySelector(".y-nav__mark"), { scale: 0.8 }, { scale: 1, duration: 0.8, ease: "elastic.out(1.3, 0.35)" });
    gsap.fromTo(logo.querySelector("em"), { rotate: 0 }, { rotate: 360, duration: 0.6, ease: "back.out(1.7)" });
  });

  // mobile sheet
  const burger = el.querySelector(".y-nav__burger");
  const sheet = burger && document.getElementById(burger.getAttribute("aria-controls"));
  let sheetOpen = false;
  let sheetTl;
  if (sheet) {
    const [l1, l2] = burger.children;
    gsap.set(l1, { y: -4 }); gsap.set(l2, { y: 4 });
    sheetLinks.push(...$$("a", sheet));
    sheetLinks.forEach((a) => a.classList.toggle("is-active", !!pageLink && a.href === pageLink.href));
    const open = () => {
      sheetOpen = true;
      const r = burger.getBoundingClientRect();
      const x = r.left + r.width / 2, y = r.top + r.height / 2;
      const R = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      sheet.classList.add("is-open");
      burger.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      sheetTl = gsap.timeline()
        .fromTo(sheet, { clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${R}px at ${x}px ${y}px)`, duration: 0.75, ease: "power4.inOut" })
        .fromTo(sheetLinks.map((a) => a.firstElementChild || a), { yPercent: 110, rotate: 6 }, { yPercent: 0, rotate: 0, stagger: 0.06, duration: 0.7, ease: "power4.out" }, "-=0.35")
        .fromTo(sheet.querySelector("small"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 }, "-=0.4");
      gsap.to(l1, { y: 0, rotate: 45, duration: 0.45, ease: "back.out(2)" });
      gsap.to(l2, { y: 0, rotate: -45, duration: 0.45, ease: "back.out(2)" });
    };
    const close = () => {
      if (!sheetOpen) return;
      sheetOpen = false;
      burger.setAttribute("aria-expanded", "false");
      sheetTl.eventCallback("onReverseComplete", () => {
        sheet.classList.remove("is-open");
        document.body.style.overflow = "";
      });
      sheetTl.timeScale(1.7).reverse();
      gsap.to(l1, { y: -4, rotate: 0, duration: 0.4, ease: "back.out(2)" });
      gsap.to(l2, { y: 4, rotate: 0, duration: 0.4, ease: "back.out(2)" });
    };
    burger.addEventListener("click", () => (sheetOpen ? close() : open()));
    sheetLinks.forEach((a) => a.addEventListener("click", close));
    document.addEventListener("keydown", (e) => e.key === "Escape" && close());
  }

  // fixed-page behaviour: glass/compact + hide on scroll down
  if (el.hasAttribute("data-nav-fixed")) {
    const bar = el.closest("header") || el;
    let hidden = false;
    ScrollTrigger.create({
      start: 0, end: "max",
      onUpdate: (self) => {
        const y = self.scroll();
        el.classList.toggle("is-scrolled", y > 40);
        const hide = self.direction === 1 && y > 400 && !sheetOpen;
        if (hide !== hidden) {
          hidden = hide;
          document.documentElement.classList.toggle("nav-hidden", hide); // lets sticky sub-navs move up
          gsap.to(bar, { yPercent: hide ? -170 : 0, duration: hide ? 0.4 : 0.6, ease: hide ? "power3.in" : "back.out(1.5)", overwrite: "auto" });
        }
      },
    });
  }
}

/* ---------- Folder Box ----------
   A storage box of folder cards (max 12 by default, data-capacity to change).
   Click / Enter / → brings the next folder to the front (loops), ← goes back.
   yeet.filebox(el) → { next, prev, add({ doc, label, note, color }), remove, size, capacity } */
const FOLDER_COLORS = ["var(--y-orange)", "var(--y-pink)", "var(--y-blue)", "#8ecbff", "var(--y-lime)", "var(--y-purple)", "var(--y-mint)", "var(--y-yellow)"];
const DARK_COLORS = new Set(["var(--y-blue)", "var(--y-purple)"]);

/** items: [{ emoji, title, meta, color }] → a list; or pass `content` (any HTML) for custom insides */
export function folderItemsHTML(items = []) {
  return `<ul class="y-fview__items">${items.map((it) => `
    <li><span class="ico" style="--c:${it.color || "var(--y-yellow)"}">${it.emoji || "📄"}</span><span><b>${it.title}</b>${it.meta ? `<small>${it.meta}</small>` : ""}</span></li>`).join("")}
  </ul>`;
}
export function folderHTML({ doc = "Doc", label = "Untitled", note = "", color = FOLDER_COLORS[0], items, content } = {}) {
  const dark = DARK_COLORS.has(color) ? " y-folder--dark" : "";
  const inside = content || (items?.length ? folderItemsHTML(items) : "");
  return `<article class="y-folder${dark}" style="--c:${color}">
    <span class="y-folder__tab"><b>${doc}</b></span>
    <div class="y-folder__body"><span class="y-folder__label">${label}${note ? `<small>${note}</small>` : ""}</span><span class="y-folder__paper"></span></div>
    <span class="y-folder__open" aria-hidden="true">open ↗</span>${inside ? `
    <template class="y-folder__content">${inside}</template>` : ""}
  </article>`;
}

/** Wraps "[placeholder]" text in <span class="y-slot"> so unfilled template slots stand out.
    Your real content (no square brackets) is left untouched. */
export function markSlots(root) {
  const re = /(\[[^\]\n]{1,40}\])/;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (re.test(n.nodeValue) && !n.parentElement?.closest(".y-slot, code, pre, script, style, textarea") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((n) => {
    const frag = document.createDocumentFragment();
    n.nodeValue.split(re).forEach((part) => {
      if (!part) return;
      frag.append(re.test(part) && part.startsWith("[") ? Object.assign(document.createElement("span"), { className: "y-slot", textContent: part }) : part);
    });
    n.replaceWith(frag);
  });
  return root;
}

/* ---------- opened folder view ----------
   The folder flies out of the box to the centre (FLIP from the card's rect), its
   cover swings open like a real folder, and the sheet inside shows the folder's
   <template class="y-folder__content">. Close reverses it back into its slot. */
function openFolderView(card, { sfx = () => {}, onClose } = {}) {
  const rm = reduced();
  const color = card.style.getPropertyValue("--c") || "var(--y-orange)";
  const doc = card.querySelector(".y-folder__tab b")?.textContent || "";
  const labelEl = card.querySelector(".y-folder__label");
  const label = labelEl?.firstChild?.textContent?.trim() || "Folder";
  const note = labelEl?.querySelector("small")?.textContent || "";
  const tpl = card.querySelector("template.y-folder__content");
  const single = window.innerWidth < 760;

  const view = document.createElement("div");
  view.className = `y-fview${single ? " is-single" : ""}`;
  view.setAttribute("role", "dialog");
  view.setAttribute("aria-modal", "true");
  view.setAttribute("aria-label", `${doc} ${label}`);
  view.innerHTML = `
    <div class="y-fview__backdrop"></div>
    <div class="y-fview__spread">
      <div class="y-fview__page" style="--c:${color}">
        <span class="y-fview__tab"><b>${doc}</b></span>
        <div class="y-fview__body">
          <div class="y-fview__sheet">
            <div class="y-fview__head"><small>${doc}</small><h3>${label}</h3>${note ? `<p>${note}</p>` : ""}</div>
            <div class="y-fview__content"></div>
          </div>
        </div>
        <div class="y-fview__cover">
          <div class="y-fview__face y-fview__face--front"><span class="y-fview__sticker">${label}</span></div>
          <div class="y-fview__face y-fview__face--back"><span>${doc}</span><b>${label}</b><div class="y-fview__stamp">selected<br/>project</div></div>
        </div>
        <button class="y-fview__close" type="button" aria-label="Close folder">✕</button>
      </div>
    </div>`;
  const body = view.querySelector(".y-fview__content");
  if (tpl) body.append(tpl.content.cloneNode(true));
  else body.innerHTML = `<div class="y-fview__empty"><span>👀</span>This folder is empty… for now.<small>Put your content in a <code>&lt;template class="y-folder__content"&gt;</code> inside the folder.</small></div>`;
  markSlots(view);
  document.body.append(view);
  document.body.style.overflow = "hidden";

  const page = view.querySelector(".y-fview__page");
  const cover = view.querySelector(".y-fview__cover");
  const backdrop = view.querySelector(".y-fview__backdrop");
  const closeBtn = view.querySelector(".y-fview__close");
  const lastFocus = document.activeElement;

  // FLIP: start the big folder exactly where the little card is
  const fromCard = () => {
    const a = card.getBoundingClientRect(), b = page.getBoundingClientRect();
    return { x: a.left - b.left, y: a.top - b.top, scaleX: a.width / b.width, scaleY: a.height / b.height, rotation: gsap.getProperty(card, "rotation") || 0 };
  };
  const openAngle = single ? -112 : -180;
  const contentItems = () => view.querySelectorAll(".y-fview__head > *, .y-fview__content > *, .y-fview__items li");

  card.style.visibility = "hidden";
  sfx("swish");
  if (rm) {
    gsap.set(cover, { rotationY: openAngle, opacity: single ? 0 : 1 });
  } else {
    gsap.timeline()
      .fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.35 }, 0)
      .fromTo(page, fromCard(), { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, duration: 0.6, ease: "power3.inOut" }, 0)
      .to(cover, { rotationY: openAngle, duration: 0.75, ease: "power3.inOut", onStart: () => sfx("pop") }, 0.5)
      .to(cover, single ? { opacity: 0, duration: 0.2 } : {}, single ? 1.05 : 0.5)
      .fromTo(contentItems(), { y: 14, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 0.4, ease: "power3.out" }, 0.85)
      .fromTo(closeBtn, { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: 0.5, ease: "back.out(2.5)" }, 0.9);
  }
  closeBtn.focus({ preventScroll: true });

  let closing = false;
  function close() {
    if (closing) return;
    closing = true;
    document.removeEventListener("keydown", onKey, true);
    const done = () => {
      view.remove();
      card.style.visibility = "";
      document.body.style.overflow = "";
      lastFocus?.focus?.({ preventScroll: true });
      onClose?.();
    };
    if (rm) return done();
    gsap.timeline({ onComplete: done })
      .to(closeBtn, { scale: 0, duration: 0.2, ease: "power2.in" }, 0)
      .to(cover, { opacity: 1, duration: 0.15 }, 0)
      .to(cover, { rotationY: 0, duration: 0.5, ease: "power3.inOut" }, 0.05)
      .to(page, { ...fromCard(), duration: 0.5, ease: "power3.inOut", onStart: () => sfx("swish") }, 0.5)
      .to(backdrop, { opacity: 0, duration: 0.35 }, 0.6)
      .add(() => sfx("thud"), 0.95);
  }
  function onKey(e) {
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); }
    else if (e.key === "Tab") { // keep focus inside the open folder
      const f = [...view.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])')];
      const i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length]?.focus();
    }
  }
  document.addEventListener("keydown", onKey, true);
  backdrop.addEventListener("click", close);
  closeBtn.addEventListener("click", close);
  return { close, el: view };
}

/* ---------- box cat (data-cat) ---------- */
export const CAT_SVG = `<svg viewBox="0 0 120 110" aria-hidden="true">
  <g class="cat-ear cat-ear--l"><path d="M16 52 L22 8 L52 32 Z" fill="#111014" stroke="#111014" stroke-width="4" stroke-linejoin="round"/><path d="M24 40 L26 20 L42 33 Z" fill="#ff8ad8"/></g>
  <g class="cat-ear cat-ear--r"><path d="M104 52 L98 8 L68 32 Z" fill="#111014" stroke="#111014" stroke-width="4" stroke-linejoin="round"/><path d="M96 40 L94 20 L78 33 Z" fill="#ff8ad8"/></g>
  <ellipse cx="60" cy="64" rx="47" ry="40" fill="#111014"/>
  <ellipse cx="44" cy="44" rx="10" ry="5" fill="#fff" opacity=".12" transform="rotate(-25 44 44)"/>
  <g class="cat-eye"><circle cx="41" cy="60" r="13" fill="#fff"/><g class="cat-pupil"><circle cx="41" cy="61" r="7.5" fill="#111014"/><circle cx="44" cy="57.5" r="2.6" fill="#fff"/></g></g>
  <g class="cat-eye"><circle cx="79" cy="60" r="13" fill="#fff"/><g class="cat-pupil"><circle cx="79" cy="61" r="7.5" fill="#111014"/><circle cx="82" cy="57.5" r="2.6" fill="#fff"/></g></g>
  <ellipse cx="30" cy="80" rx="6.5" ry="4" fill="#ff8ad8" opacity=".55"/><ellipse cx="90" cy="80" rx="6.5" ry="4" fill="#ff8ad8" opacity=".55"/>
  <path d="M56 75 Q60 72 64 75 Q62 80 60 80 Q58 80 56 75 Z" fill="#ff8ad8"/>
  <path d="M53 84 Q56.5 88 60 84 Q63.5 88 67 84" fill="none" stroke="#ff8ad8" stroke-width="2.2" stroke-linecap="round"/>
  <g stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".85"><path d="M22 77 L4 73"/><path d="M22 82 L5 84"/><path d="M98 77 L116 73"/><path d="M98 82 L115 84"/></g>
</svg>`;
export const PAW_SVG = `<svg viewBox="0 0 44 30" aria-hidden="true"><path d="M4 26 Q2 6 22 4 Q42 6 40 26 Z" fill="#111014"/><g stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".9"><path d="M15 10 L15 17"/><path d="M22 8 L22 16"/><path d="M29 10 L29 17"/></g></svg>`;

function boxCat(el, sfx) {
  const noop = { look() {}, happy() {}, shock() {} };
  if (!el.hasAttribute("data-cat")) return noop;
  let wrap = el.querySelector(".y-filebox__cat");
  if (!wrap) {
    wrap = Object.assign(document.createElement("div"), { className: "y-filebox__cat", innerHTML: CAT_SVG });
    el.append(wrap, Object.assign(document.createElement("div"), { className: "y-filebox__paw", innerHTML: PAW_SVG }));
  }
  const paw = el.querySelector(".y-filebox__paw");
  const pupils = $$(".cat-pupil", wrap), eyes = $$(".cat-eye", wrap), ears = $$(".cat-ear", wrap);
  const rm = reduced();

  // eyes follow the pointer (only while the box is on screen)
  const toX = pupils.map((p) => gsap.quickTo(p, "x", { duration: 0.25, ease: "power3.out" }));
  const toY = pupils.map((p) => gsap.quickTo(p, "y", { duration: 0.25, ease: "power3.out" }));
  const gaze = (dx, dy) => pupils.forEach((_, i) => { toX[i](dx); toY[i](dy); });
  let lockUntil = 0, raf = 0, mx = 0, my = 0;
  const onMove = (e) => {
    mx = e.clientX; my = e.clientY;
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      if (performance.now() < lockUntil) return;
      const r = wrap.getBoundingClientRect();
      const dx = mx - (r.left + r.width / 2), dy = my - (r.top + r.height * 0.55);
      const d = Math.hypot(dx, dy) || 1, m = Math.min(4.5, d / 40);
      gaze((dx / d) * m, (dy / d) * m);
    });
  };
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) window.addEventListener("pointermove", onMove, { passive: true });
      else window.removeEventListener("pointermove", onMove);
    }).observe(el);
  }

  const twitch = () => gsap.fromTo(ears, { rotation: 0 }, { keyframes: { rotation: [-12, 8, -4, 0] }, transformOrigin: "50% 100%", duration: 0.45, stagger: 0.08, ease: "none" });
  const pat = () => gsap.timeline()
    .to(paw, { yPercent: -45, duration: 0.11, ease: "power2.out" })
    .to(paw, { yPercent: 0, duration: 0.2, ease: "bounce.out" })
    .to(paw, { yPercent: -30, duration: 0.1, ease: "power2.out" })
    .to(paw, { yPercent: 0, duration: 0.2, ease: "bounce.out" });

  if (!rm) {
    gsap.to(wrap, { yPercent: -3, duration: 1.8, yoyo: true, repeat: -1, ease: "sine.inOut" }); // breathing
    const blink = () => {
      gsap.to(eyes, { scaleY: 0.08, transformOrigin: "50% 50%", duration: 0.07, yoyo: true, repeat: 1, ease: "power1.in" });
      gsap.delayedCall(gsap.utils.random(2.2, 5.5), blink);
    };
    gsap.delayedCall(1.5, blink);
  }

  // clicking the cat: meow + head tilt + a little heart (doesn't cycle the box)
  wrap.addEventListener("click", (e) => {
    e.stopPropagation();
    sfx("meow", 0, { pitch: gsap.utils.random(0.92, 1.12) });
    if (rm) return;
    gsap.timeline().to(wrap, { rotation: -12, duration: 0.18, ease: "power2.out" }).to(wrap, { rotation: 0, duration: 0.8, ease: "elastic.out(1.2, 0.35)" });
    twitch();
    const heart = Object.assign(document.createElement("span"), { className: "y-filebox__heart", textContent: gsap.utils.random(["❤", "💖", "💕"]) });
    heart.style.left = `${wrap.offsetLeft + wrap.offsetWidth * 0.55}px`;
    heart.style.top = `${wrap.offsetTop}px`;
    el.append(heart);
    gsap.fromTo(heart, { y: 0, scale: 0.4, opacity: 1, rotation: -15 }, { y: -el.clientWidth * 0.12, scale: 1.2, opacity: 0, rotation: 15, duration: 1, ease: "power2.out", onComplete: () => heart.remove() });
  });
  wrap.addEventListener("pointerenter", () => !rm && twitch());

  return {
    // watches the front folder lift out, then pats the box
    look() {
      if (rm) return;
      lockUntil = performance.now() + 750;
      gaze(3.5, -4.5);
      gsap.timeline().to(wrap, { rotation: 7, duration: 0.25, ease: "power2.out" }).to(wrap, { rotation: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
      gsap.delayedCall(0.55, pat);
    },
    happy() {
      if (rm) return;
      gsap.timeline().to(wrap, { yPercent: -16, duration: 0.2, ease: "power2.out" }).to(wrap, { yPercent: 0, duration: 0.7, ease: "bounce.out" });
      twitch();
    },
    shock() {
      if (rm) return;
      lockUntil = performance.now() + 900;
      gaze(0, 0);
      gsap.timeline()
        .to(eyes, { scale: 1.3, transformOrigin: "50% 50%", duration: 0.15, ease: "back.out(3)" }, 0)
        .to(ears[0], { rotation: -28, transformOrigin: "50% 100%", duration: 0.15 }, 0)
        .to(ears[1], { rotation: 28, transformOrigin: "50% 100%", duration: 0.15 }, 0)
        .fromTo(wrap, { x: 0 }, { keyframes: { x: [-4, 4, -3, 3, 0] }, duration: 0.35, ease: "none" }, 0)
        .to([...eyes, ...ears], { scale: 1, rotation: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" }, 0.85);
    },
  };
}

function filebox(el) {
  if (el._filebox) return el._filebox;
  const capacity = Number(el.dataset.capacity) || 12;
  const stack = el.querySelector(".y-filebox__stack");
  let order = [...stack.querySelectorAll(".y-folder")];
  if (order.length > capacity) {
    console.warn(`[yeet] filebox holds ${capacity} folders max; dropping ${order.length - capacity}.`);
    order.splice(capacity).forEach((c) => c.remove());
  }
  const originals = () => [...stack.querySelectorAll(".y-folder")]; // DOM order = storage order for the slot dots
  const slotsEl = el.querySelector(".y-filebox__slots");
  const countEl = el.querySelector(".y-filebox__count");
  const live = el.querySelector(".y-filebox__live");
  if (slotsEl) slotsEl.innerHTML = "<i></i>".repeat(capacity);
  el.tabIndex = 0;
  el.setAttribute("role", "group"); // not a button any more: it contains its own buttons
  markSlots(el); // highlight any unfilled [placeholder] labels on the box and folders
  el.setAttribute("aria-roledescription", "folder box");

  // sound (data-sound) + a mute toggle next to the counter
  const sfx = el.hasAttribute("data-sound") ? (name, delay = 0, opts) => sound.at(delay, name, opts) : () => {};
  if (el.hasAttribute("data-sound") && countEl && !el.querySelector(".y-filebox__mute")) {
    const row = Object.assign(document.createElement("span"), { className: "y-filebox__row" });
    const mute = Object.assign(document.createElement("button"), { type: "button", className: "y-filebox__mute" });
    const sync = () => { mute.textContent = sound.muted ? "🔇" : "🔊"; mute.setAttribute("aria-pressed", String(sound.muted)); mute.setAttribute("aria-label", sound.muted ? "Unmute box sounds" : "Mute box sounds"); };
    mute.addEventListener("click", (e) => { e.stopPropagation(); sound.toggle(); });
    mute.addEventListener("keydown", (e) => e.stopPropagation());
    document.addEventListener("yeet:sound", sync);
    sync();
    countEl.before(row);
    row.append(mute, countEl);
  }
  const cat = boxCat(el, sfx);

  // built-in "next" button stuck on the box (added automatically if the markup doesn't have one)
  let nextBtn = el.querySelector(".y-filebox__next");
  if (!nextBtn) {
    nextBtn = Object.assign(document.createElement("button"), { type: "button", className: "y-filebox__next", innerHTML: 'next <span aria-hidden="true">→</span>' });
    (el.querySelector(".y-filebox__front") || el).append(nextBtn);
  }
  nextBtn.setAttribute("aria-label", "Next folder");
  nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (view) return;
    next();
    const arrow = nextBtn.querySelector("span");
    if (arrow && !reduced()) gsap.fromTo(arrow, { x: 0 }, { x: 5, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out" });
  });
  nextBtn.addEventListener("keydown", (e) => e.stopPropagation()); // Enter on the button = next, not "open"

  const DEPTH = 4; // visible fan depth; deeper folders wait behind the last slot
  const slot = (i) => {
    const W = el.clientWidth, k = Math.min(i, DEPTH);
    return { x: k * W * 0.112, y: -k * W * 0.026 - (i > DEPTH ? 2 : 0), rotation: [-2, 2.5, -1.5, 2, -1][k], scale: 1 - k * 0.018 };
  };
  const labelOf = (c) => `${c.querySelector(".y-folder__tab b")?.textContent || ""} ${c.querySelector(".y-folder__label")?.firstChild?.textContent || ""}`.trim();
  function update() {
    const all = originals();
    if (countEl) countEl.textContent = `${String(order.length).padStart(2, "0")} / ${capacity}`;
    if (slotsEl) [...slotsEl.children].forEach((dot, j) => {
      const card = all[j];
      dot.classList.toggle("is-on", !!card);
      dot.classList.toggle("is-front", !!card && card === order[0]);
      dot.style.setProperty("--c", card ? card.style.getPropertyValue("--c") : "");
    });
    order.forEach((c, i) => { c.style.zIndex = 100 - i; c.setAttribute("aria-hidden", String(i !== 0)); c.classList.toggle("is-front", i === 0); });
    el.setAttribute("aria-label", order.length ? `Folder box, ${order.length} of ${capacity}. Front: ${labelOf(order[0])}. Enter opens it, arrow keys shuffle.` : "Empty folder box");
    if (live && order[0]) live.textContent = labelOf(order[0]);
    el.dispatchEvent(new CustomEvent("filebox:change", { detail: { front: order[0], size: order.length, capacity } }));
  }
  function layout(animate = false) {
    order.forEach((c, i) => (animate ? gsap.to(c, { ...slot(i), duration: 0.55, ease: "back.out(1.5)", overwrite: "auto" }) : gsap.set(c, slot(i))));
    update();
  }

  let busy = null;
  const finish = () => busy?.progress(1); // rapid clicks: snap the running shuffle, then start the next
  const D = () => (reduced() ? 0 : 1);
  function next() {
    if (order.length < 2) return nudge();
    finish();
    const front = order.shift();
    order.push(front);
    const W = el.clientWidth, back = slot(order.length - 1);
    front.style.zIndex = 200; // stays on top while it lifts out of the box
    busy = gsap.timeline({ onComplete: () => (busy = null) })
      .to(front, { y: -W * 0.44, rotation: -9, scale: 1.02, duration: 0.3 * D(), ease: "power2.out" })
      .add(update) // now it's the last in order → lowest z-index, so it drops in behind everyone
      .to(front, { ...back, duration: 0.5 * D(), ease: "power3.inOut" });
    order.slice(0, -1).forEach((c, i) => busy.to(c, { ...slot(i), duration: 0.55 * D(), ease: "back.out(1.6)" }, 0.16 * D() + i * 0.03 * D()));
    sfx("swish");
    sfx("thud", 0.74 * D()); // lands at the back of the box
    cat.look();
    return order[0];
  }
  function prev() {
    if (order.length < 2) return nudge();
    finish();
    const back = order.pop();
    order.unshift(back);
    const W = el.clientWidth, s0 = slot(0);
    busy = gsap.timeline({ onComplete: () => (busy = null) })
      .to(back, { y: -W * 0.5, rotation: 8, duration: 0.32 * D(), ease: "power2.out" })
      .add(update)
      .to(back, { ...s0, duration: 0.5 * D(), ease: "back.out(1.4)" });
    order.slice(1).forEach((c, i) => busy.to(c, { ...slot(i + 1), duration: 0.5 * D(), ease: "power3.out" }, 0.12 * D()));
    sfx("swish");
    sfx("thud", 0.7 * D());
    cat.look();
    return order[0];
  }
  function nudge() {
    sfx("tick");
    if (!reduced()) gsap.fromTo(el, { rotation: 0 }, { keyframes: { rotation: [-2, 2, -1, 0] }, duration: 0.4, ease: "none" });
  }
  function add(data = {}) {
    if (order.length >= capacity) {
      if (!reduced()) gsap.fromTo(el, { x: 0 }, { keyframes: { x: [-10, 10, -6, 6, 0] }, duration: 0.4, ease: "none" });
      toast(`Box is full (${capacity}/${capacity}) 📦`, { emoji: "🙅", bg: "var(--y-pink)" });
      sfx("bonk");
      sfx("meow", 0.25, { pitch: 0.78 }); // grumpy
      cat.shock();
      return null;
    }
    finish();
    const n = originals().length + 1;
    const card = document.createElement("template");
    card.innerHTML = folderHTML({
      doc: data.doc || `Doc-${String(n).padStart(2, "0")}`,
      label: data.label || "New folder", note: data.note || "",
      color: data.color || FOLDER_COLORS[(n - 1) % FOLDER_COLORS.length],
    }).trim();
    const node = card.content.firstElementChild;
    stack.append(node);
    order.unshift(node); // new folders land in front
    const W = el.clientWidth;
    gsap.set(node, { ...slot(0), y: -W * 0.75, rotation: -14, opacity: 0 });
    update();
    gsap.to(node, { y: slot(0).y, rotation: slot(0).rotation, opacity: 1, duration: 0.7 * D(), ease: "bounce.out" });
    order.slice(1).forEach((c, i) => gsap.to(c, { ...slot(i + 1), duration: 0.5 * D(), ease: "power3.out" }));
    sfx("pop");
    sfx("thud", 0.42 * D()); // first bounce
    cat.happy();
    return node;
  }
  function remove() {
    if (!order.length) return null;
    finish();
    const front = order.shift();
    const W = el.clientWidth;
    gsap.to(front, { y: -W * 0.6, x: `+=${W * 0.3}`, rotation: 25, opacity: 0, duration: 0.45 * D(), ease: "power2.in", onComplete: () => { front.remove(); update(); } });
    order.forEach((c, i) => gsap.to(c, { ...slot(i), duration: 0.5 * D(), ease: "back.out(1.5)" }));
    update();
    sfx("swish");
    cat.look();
    return front;
  }

  // pull a folder that's peeking out behind straight to the front
  function bringToFront(card, then) {
    const i = order.indexOf(card);
    if (i <= 0) return then?.();
    finish();
    order = [...order.slice(i), ...order.slice(0, i)];
    const W = el.clientWidth;
    card.style.zIndex = 200;
    busy = gsap.timeline({ onComplete: () => { busy = null; then?.(); } })
      .to(card, { y: -W * 0.46, rotation: 6, duration: 0.3 * D(), ease: "power2.out" })
      .add(update)
      .to(card, { ...slot(0), duration: 0.5 * D(), ease: "back.out(1.4)" });
    order.slice(1).forEach((c, j) => busy.to(c, { ...slot(j + 1), duration: 0.5 * D(), ease: "power3.out" }, 0.12 * D()));
    sfx("swish");
    sfx("thud", 0.7 * D());
    cat.look();
  }

  let view = null;
  function open() {
    const card = order[0];
    if (!card || view) return null;
    finish();
    el.dispatchEvent(new CustomEvent("filebox:open", { detail: { folder: card } }));
    view = openFolderView(card, {
      sfx,
      onClose: () => { view = null; el.dispatchEvent(new CustomEvent("filebox:close", { detail: { folder: card } })); cat.look(); },
    });
    return view;
  }
  const close = () => view?.close();

  // Opening only happens on a folder: the front one opens straight away, one peeking out
  // behind slides to the front first, then opens. Clicking the box itself does nothing;
  // shuffling is the "next" button (or the arrow keys).
  el.addEventListener("click", (e) => {
    if (view || busy) return;
    const card = e.target.closest(".y-folder");
    if (!card || !order.includes(card)) return;
    if (card === order[0]) return open();
    bringToFront(card, open);
  });
  el.addEventListener("keydown", (e) => {
    if (view) return;
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
    else if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); next(); }
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); prev(); }
  });
  // front folder peeks up a little on hover
  el.addEventListener("pointerenter", () => !busy && order[0] && gsap.to(order[0], { y: slot(0).y - el.clientWidth * 0.03, duration: 0.3, ease: "power2.out" }));
  el.addEventListener("pointerleave", () => !busy && order[0] && gsap.to(order[0], { y: slot(0).y, duration: 0.4, ease: "back.out(2)" }));
  if ("ResizeObserver" in window) new ResizeObserver(() => !busy && layout(false)).observe(el);
  layout(false);

  return (el._filebox = { next, prev, open, close, add, remove, get size() { return order.length; }, get front() { return order[0]; }, capacity, el });
}

/* ---------- init ---------- */
function init(root = document) {
  $$("[data-magnetic]", root).forEach((el) => magnetic(el));
  $$("[data-tilt]", root).forEach((el) => tilt(el));
  $$("[data-tabs]", root).forEach(tabs);
  $$("[data-accordion]", root).forEach(accordion);
  $$("[data-marquee]", root).forEach(marquee);
  $$("[data-nav]", root).forEach(nav);
  $$("[data-filebox]", root).forEach(filebox);
  // demo helpers: <button data-filebox-add="#box"> / data-filebox-remove / data-filebox-next
  const presets = [["Branding", "logos + type"], ["Motion", "gsap studies"], ["3D", "blender bits"], ["UX Audit", "client work"], ["Photos", "film scans"], ["Zines", "print"], ["Web", "sites"], ["Sketches", "napkin ideas"]];
  $$("[data-filebox-add]", root).forEach((b) => b.addEventListener("click", () => {
    const box = filebox(document.querySelector(b.dataset.fileboxAdd));
    const [label, note] = presets[box.size % presets.length];
    box.add({ label, note });
  }));
  $$("[data-filebox-remove]", root).forEach((b) => b.addEventListener("click", () => filebox(document.querySelector(b.dataset.fileboxRemove)).remove()));
  $$("[data-filebox-next]", root).forEach((b) => b.addEventListener("click", () => filebox(document.querySelector(b.dataset.fileboxNext)).next()));
  $$("[data-filebox-open]", root).forEach((b) => b.addEventListener("click", () => filebox(document.querySelector(b.dataset.fileboxOpen)).open()));

  // modals
  $$("[data-modal-open]", root).forEach((btn) =>
    btn.addEventListener("click", () => openModal(document.getElementById(btn.dataset.modalOpen))));
  $$(".y-modal", root).forEach((modal) => {
    $$("[data-modal-close]", modal).forEach((b) => b.addEventListener("click", () => closeModal(modal)));
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") $$(".y-modal.is-open").forEach(closeModal);
  });

  // declarative toasts
  $$("[data-toast]", root).forEach((btn) =>
    btn.addEventListener("click", () =>
      toast(btn.dataset.toast, { emoji: btn.dataset.toastEmoji, bg: btn.dataset.toastBg })));

  // chips
  $$(".y-chip:not([data-manual])", root).forEach((chip) =>
    chip.addEventListener("click", () => {
      chip.setAttribute("aria-pressed", String(chip.getAttribute("aria-pressed") !== "true"));
      gsap.fromTo(chip, { scale: 0.8 }, { scale: 1, duration: 0.5, ease: "elastic.out(1.2, 0.4)" });
    }));

  // range fill + output
  $$("[data-range]", root).forEach((r) => {
    const out = r.closest(".y-field")?.querySelector("[data-range-out]");
    const sync = () => {
      r.style.setProperty("--p", `${((r.value - r.min) / (r.max - r.min)) * 100}%`);
      if (out) out.textContent = r.value;
    };
    r.addEventListener("input", sync);
    sync();
  });

  // loading buttons (demo)
  $$("[data-loading-demo]", root).forEach((btn) =>
    btn.addEventListener("click", () => {
      const label = btn.textContent;
      btn.classList.add("is-loading");
      btn.textContent = "Cooking";
      setTimeout(() => {
        btn.classList.remove("is-loading");
        btn.textContent = label;
        toast("It's done. Chef's kiss.", { emoji: "👨‍🍳", bg: "var(--y-lime)" });
      }, 1600);
    }));

  // form validation
  $$("form[data-validate]", root).forEach((form) =>
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let ok = true;
      $$(".y-input", form).forEach((input) => {
        const field = input.closest(".y-field");
        field.classList.remove("is-error");
        if (!input.checkValidity() || (input.required && !input.value.trim())) {
          void field.offsetWidth; // restart shake
          field.classList.add("is-error");
          ok = false;
        }
      });
      toast(ok ? "Sent! Check your inbox." : "That email is giving… fake.",
        ok ? { emoji: "📬", bg: "var(--y-lime)" } : { emoji: "🙅", bg: "var(--y-pink)" });
    }));

  // progress bars fill on view
  $$("[data-progress]", root).forEach((bar) =>
    gsap.to(bar, {
      width: `${bar.dataset.progress}%`, duration: 1.6, ease: "power3.out",
      scrollTrigger: { trigger: bar, start: "top 85%" },
    }));
}

export const yeet = { init, toast, openModal, closeModal, magnetic, tilt, nav, filebox, folderHTML, folderItemsHTML, markSlots, sound, search: createSearch };
window.yeet = yeet;
