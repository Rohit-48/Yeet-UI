import { $, $$, gsap, Flip, ScrollTrigger, reduced, splitChars, initShell, components, colors } from "../shell.js";
import { tile, tileHover } from "../render.js";

/* ---------- previews ---------- */
// 01 components: mini tiles that shuffle on hover
const pvc = $("#pvComponents");
const pick = components.slice(0, 8);
pick.forEach((c) => pvc.insertAdjacentHTML("beforeend", `<div class="pvc__t" style="--c:var(--y-${c.color === "ink" ? "white" : c.color})"><span>${c.emoji}</span>${c.name}</div>`));
const shuffle = () => {
  const items = $$(".pvc__t", pvc);
  const state = Flip.getState(items);
  gsap.utils.shuffle(items).forEach((n) => pvc.append(n));
  Flip.from(state, { duration: 0.7, ease: "back.inOut(1.4)", stagger: 0.03 });
};
$$("[data-count-components]").forEach((b) => (b.textContent = components.length));

// 03 tokens: fan of swatches
const fan = $("#pvFan");
const fanColors = ["pink", "orange", "yellow", "lime", "mint", "blue", "purple"];
fanColors.forEach((c) => fan.insertAdjacentHTML("beforeend", `<i style="--c:var(--y-${c})"></i>`));
const blades = $$("i", fan);
const fanTo = (spread) => gsap.to(blades, { rotate: (i) => (i - (blades.length - 1) / 2) * spread, duration: 0.7, ease: "back.out(1.7)", stagger: 0.02 });

// 04 usage: typing terminal
const term = $("#pvTerm");
const script = [
  ["$ ", "cp yeet-ui/src/{styles,*.js} ./ui", ""],
  ["$ ", "npm i gsap", "✓ added 1 package"],
  ["$ ", "echo 'yeet.init()' >> main.js", "✓ components armed"],
  ["$ ", "npm run dev", "✓ ready — it's giving ui ⚡"],
];
let typing;
function typeTerm() {
  typing?.kill();
  term.innerHTML = "";
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 2, onRepeat: () => (term.innerHTML = "") });
  script.forEach(([p, cmd, out]) => {
    const line = { n: 0 };
    let el;
    tl.add(() => { el = document.createElement("div"); el.innerHTML = `<span class="p">${p}</span><span class="cmd"></span><span class="caret"></span>`; term.append(el); });
    tl.to(line, { n: cmd.length, duration: cmd.length * 0.035, ease: "none", onUpdate: () => (el.querySelector(".cmd").textContent = cmd.slice(0, Math.round(line.n))) });
    tl.add(() => { el.querySelector(".caret")?.remove(); if (out) term.insertAdjacentHTML("beforeend", `<div class="ok">${out}</div>`); }, "+=0.25");
  });
  typing = tl;
}

/* ---------- reel ---------- */
const track = $("#reelTrack");
components.forEach((c) => track.append(tile(c, { sizes: false })));

/* ---------- shell (nav, search, footer, transitions) ---------- */
await initShell();
tileHover($$(".tile", track));

/* ---------- hero: split + intro ---------- */
$$("[data-split]").forEach((n) => splitChars(n));
$("#statComponents").dataset.count = components.length;
$$(".hero__stats b")[1].dataset.count = colors.length;

// The opening loader / page curtain lives in the shell; this runs the moment it starts lifting.
// One overlapping timeline (~1.3s) so everything lands together instead of queueing up.
const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
if (!reduced) {
  intro
    .from(".hero__mesh", { opacity: 0, scale: 0.8, duration: 1.6, ease: "power2.out" }, 0)
    .from(".hero__title .char", { yPercent: 105, rotate: 8, stagger: { each: 0.022, from: "start" }, duration: 1.1 }, 0.05)
    .from(".topbar", { yPercent: -160, duration: 0.9 }, 0.1)
    .from(".prop img", { scale: 0, rotate: -90, stagger: { each: 0.045, from: "random" }, duration: 1, ease: "back.out(1.9)" }, 0.15)
    .from(".hero__kicker", { scale: 0, rotate: -25, duration: 0.8, ease: "back.out(2.4)" }, 0.3)
    .from(".hero__sub", { y: 24, opacity: 0, duration: 0.9 }, 0.35)
    .from(".hero__ctas > *", { y: 24, opacity: 0, stagger: 0.08, duration: 0.9 }, 0.42)
    .from(".hero__stats .stat", { y: 24, opacity: 0, stagger: 0.07, duration: 0.9 }, 0.5);
}
$$("[data-count]").forEach((el) => {
  const obj = { v: 0 };
  intro.to(obj, { v: +el.dataset.count, duration: 1.4, ease: "power3.out", onUpdate: () => (el.textContent = Math.round(obj.v)) }, reduced ? 0 : 0.55);
});

if (!reduced) {
  /* hero background parallax (see site.css .hero__bg) */
  const hero = $(".hero");
  const props = $$(".prop", hero);
  props.forEach((p, i) => {
    const d = +p.dataset.depth;
    gsap.to($("img", p), { y: gsap.utils.random(10, 22) * d, duration: gsap.utils.random(2, 3.2), yoyo: true, repeat: -1, ease: "sine.inOut", delay: i * 0.12 });
    p._mx = gsap.quickTo(p, "x", { duration: 1.1, ease: "power3.out" });
  });
  $$(".hero__mesh i").forEach((m) => gsap.to(m, {
    xPercent: () => gsap.utils.random(-18, 18), yPercent: () => gsap.utils.random(-14, 14), scale: () => gsap.utils.random(0.85, 1.2),
    duration: () => gsap.utils.random(6, 10), yoyo: true, repeat: -1, repeatRefresh: true, ease: "sine.inOut",
  }));
  const meshX = gsap.quickTo(".hero__mesh", "x", { duration: 1.6, ease: "power3.out" });
  const meshY = gsap.quickTo(".hero__mesh", "y", { duration: 1.6, ease: "power3.out" });
  hero.addEventListener("pointermove", (e) => {
    const px = e.clientX / innerWidth - 0.5, py = e.clientY / innerHeight - 0.5;
    props.forEach((p) => p._mx(px * 90 * +p.dataset.depth));
    meshX(px * -50); meshY(py * -40);
  });
  gsap.timeline({ scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.8 } })
    .to(".hero__bg", { opacity: 0, ease: "power1.in" }, 0) // opacity = GPU-only; the static mask still blends the bottom edge
    .to(".hero__mesh", { yPercent: 22, scale: 1.25, opacity: 0.3, ease: "none" }, 0)
    .to(props, {
      y: (i, el) => -innerHeight * 0.65 * el.dataset.depth,
      rotation: (i, el) => (i % 2 ? 1 : -1) * 70 * el.dataset.depth,
      scale: (i, el) => 1 + 0.25 * el.dataset.depth,
      ease: "none",
    }, 0)
    .to(".hero__title", { scale: 0.85, opacity: 0.2, y: -60, ease: "none" }, 0);

  /* previews: rise in + per-card hover life */
  gsap.from(".pv", { y: 90, rotate: (i) => (i % 2 ? 2 : -2), opacity: 0, stagger: 0.12, duration: 1, ease: "back.out(1.4)", clearProps: "transform,opacity", scrollTrigger: { trigger: ".pvgrid", start: "top 80%", once: true } });
  $$(".pv").forEach((card) => {
    card.addEventListener("pointerenter", () => gsap.to(card, { y: -8, rotate: gsap.utils.random(-1, 1), boxShadow: "12px 12px 0 #111014", duration: 0.4, ease: "back.out(2)" }));
    card.addEventListener("pointerleave", () => gsap.to(card, { y: 0, rotate: 0, boxShadow: "8px 8px 0 #111014", duration: 0.7, ease: "elastic.out(1, 0.5)" }));
  });
  $(".pv--components").addEventListener("pointerenter", shuffle);
  const pvcSeen = ScrollTrigger.create({ trigger: ".pv--components", start: "top bottom", end: "bottom top" });
  setInterval(() => !document.hidden && pvcSeen.isActive && shuffle(), 4200); // only while on screen

  const pvd = $(".pvd");
  const docsLoop = gsap.timeline({ repeat: -1, repeatDelay: 1.6, paused: true })
    .to(".pvd__pill", { x: 58, width: 46, duration: 0.5, ease: "back.out(1.7)" })
    .to(".pvd__preview", { opacity: 0, y: -10, duration: 0.3 }, "<")
    .fromTo(".pvd__code", { opacity: 0 }, { opacity: 1, duration: 0.3 }, "<0.1")
    .from(".pvd__code i", { scaleX: 0, transformOrigin: "0 50%", stagger: 0.07, duration: 0.4, ease: "power3.out" }, "<")
    .to({}, { duration: 1.6 })
    .to(".pvd__pill", { x: 0, width: 56, duration: 0.5, ease: "back.out(1.7)" })
    .to(".pvd__code", { opacity: 0, duration: 0.3 }, "<")
    .to(".pvd__preview", { opacity: 1, y: 0, duration: 0.3 }, "<0.1")
    .from(".pvd__preview > *", { scale: 0.6, stagger: 0.05, duration: 0.4, ease: "back.out(2.5)" }, "<");
  ScrollTrigger.create({ trigger: pvd, start: "top 90%", onEnter: () => docsLoop.play(), onLeaveBack: () => docsLoop.pause() });

  fanTo(9);
  $(".pv--tokens").addEventListener("pointerenter", () => fanTo(22));
  $(".pv--tokens").addEventListener("pointerleave", () => fanTo(9));
  ScrollTrigger.create({ trigger: term, start: "top 90%", once: true, onEnter: typeTerm });

  /* reel: pinned horizontal scroll on desktop */
  const mm = gsap.matchMedia();
  mm.add("(min-width: 901px)", () => {
    const distance = () => track.scrollWidth - innerWidth;
    gsap.to(track, {
      x: () => -distance(), ease: "none",
      scrollTrigger: { trigger: ".reel", start: "top top", end: () => `+=${distance()}`, pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 },
    });
  });
  gsap.from($$(".tile", track), { y: 80, opacity: 0, stagger: 0.05, duration: 0.8, ease: "back.out(1.5)", scrollTrigger: { trigger: ".reel", start: "top 75%", once: true } });
} else {
  fanTo(9);
  typeTerm();
}

/* pinned sections push later triggers down: re-sort and refresh once everything exists */
ScrollTrigger.sort();
ScrollTrigger.refresh();
