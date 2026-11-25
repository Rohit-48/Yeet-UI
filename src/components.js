/* ============================================
   YEET/UI — component behaviours (GSAP)
   import { yeet } from "./components.js"; yeet.init();
   ============================================ */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createSearch } from "./search.js";

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

/* ---------- init ---------- */
function init(root = document) {
  $$("[data-magnetic]", root).forEach((el) => magnetic(el));
  $$("[data-tilt]", root).forEach((el) => tilt(el));
  $$("[data-tabs]", root).forEach(tabs);
  $$("[data-accordion]", root).forEach(accordion);
  $$("[data-marquee]", root).forEach(marquee);
  $$("[data-nav]", root).forEach(nav);

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

export const yeet = { init, toast, openModal, closeModal, magnetic, tilt, nav, search: createSearch };
window.yeet = yeet;
