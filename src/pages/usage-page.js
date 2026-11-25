import { $, $$, h, gsap, reduced, copy, hlHTML, hlJS, hlCSS, initShell } from "../shell.js";

/* ---------- static code blocks: highlight + copy ---------- */
$$(".codeblock[data-code]").forEach((block) => {
  const code = $("code", block);
  const src = code.textContent;
  const lang = block.dataset.code;
  code.innerHTML = lang === "js" ? hlJS(src) : lang === "html" ? hlHTML(src) : src.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  $("[data-copy-code]", block)?.addEventListener("click", () => copy(src));
});

/* ---------- theme remix ---------- */
const accents = ["#c6ff3d", "#3dffc5", "#ffe14d", "#ff7a1a", "#8ecbff", "#ffd1e8", "#ffffff"];
const pops = ["#ff4fd8", "#9b5cff", "#3d5afe", "#ff5470", "#ff7a1a", "#3dffc5"];
const defaults = { accent: accents[0], pop: pops[0], r: 16, s: 5, b: 2.5 };
const state = { ...defaults };
const preview = $("#remixPreview");

function swatches(el, list, key) {
  list.forEach((c) => {
    const b = h(`<button type="button" class="ctl__sw" style="--c:${c}" aria-label="${c}" aria-pressed="${c === state[key]}"></button>`);
    b.addEventListener("click", () => { state[key] = c; sync(); gsap.fromTo(b, { scale: 0.6 }, { scale: 1, duration: 0.6, ease: "elastic.out(1.3, 0.4)" }); });
    el.append(b);
  });
}
swatches($("#accents"), accents, "accent");
swatches($("#pops"), pops, "pop");

const rIn = $("#rIn"), sIn = $("#sIn"), bIn = $("#bIn");
[rIn, sIn, bIn].forEach((i) => i.addEventListener("input", () => { state.r = +rIn.value; state.s = +sIn.value; state.b = +bIn.value; sync(false); }));

function vars() {
  const { accent, pop, r, s, b } = state;
  const px = (n) => `${Math.round(n * 10) / 10}px`;
  return {
    "--y-lime": accent, "--y-pink": pop,
    "--y-radius-sm": px(r * 0.6), "--y-radius": px(r), "--y-radius-lg": px(r * 1.75),
    "--y-border": `${b}px solid var(--y-ink)`,
    "--y-shadow-sm": `${px(s * 0.6)} ${px(s * 0.6)} 0 var(--y-ink)`,
    "--y-shadow": `${px(s)} ${px(s)} 0 var(--y-ink)`,
    "--y-shadow-lg": `${px(s * 1.6)} ${px(s * 1.6)} 0 var(--y-ink)`,
  };
}
function sync(pulse = true) {
  const v = vars();
  Object.entries(v).forEach(([k, val]) => preview.style.setProperty(k, val));
  rIn.value = state.r; sIn.value = state.s; bIn.value = state.b;
  [rIn, sIn, bIn].forEach((i) => i.style.setProperty("--p", `${((i.value - i.min) / (i.max - i.min)) * 100}%`));
  $("#rOut").textContent = `${state.r}px`; $("#sOut").textContent = `${state.s}px`; $("#bOut").textContent = `${state.b}px`;
  $$("#accents .ctl__sw").forEach((b) => b.setAttribute("aria-pressed", String(b.style.getPropertyValue("--c") === state.accent)));
  $$("#pops .ctl__sw").forEach((b) => b.setAttribute("aria-pressed", String(b.style.getPropertyValue("--c") === state.pop)));
  const css = `/* client theme: paste after tokens.css */\n:root {\n${Object.entries(v).map(([k, val]) => `  ${k}: ${val};`).join("\n")}\n}`;
  $("#themeCode").innerHTML = hlCSS(css);
  $("#themeCode")._src = css;
  if (pulse && !reduced) gsap.fromTo(preview.children, { y: 0 }, { y: -6, duration: 0.15, yoyo: true, repeat: 1, stagger: 0.04, ease: "power2.out" });
}
$("#copyTheme").addEventListener("click", () => copy($("#themeCode")._src, "Theme copied"));
$("#randomize").addEventListener("click", () => {
  Object.assign(state, {
    accent: gsap.utils.random(accents), pop: gsap.utils.random(pops),
    r: gsap.utils.random(0, 32, 2), s: gsap.utils.random(0, 12, 1), b: gsap.utils.random(1, 5, 0.5),
  });
  sync();
  if (!reduced) gsap.fromTo("#randomize", { rotate: -25 }, { rotate: 0, duration: 0.7, ease: "elastic.out(1.2, 0.4)" });
});
$("#resetTheme").addEventListener("click", () => { Object.assign(state, defaults); sync(); });
sync(false);

await initShell();

if (!reduced) {
  // timeline line draws as you scroll; step bubbles pop when reached
  gsap.fromTo(".steps__line i", { scaleY: 0 }, { scaleY: 1, ease: "none", transformOrigin: "50% 0%", scrollTrigger: { trigger: ".steps", start: "top 60%", end: "bottom 60%", scrub: 0.5 } });
  $$(".step").forEach((step) => {
    gsap.timeline({ scrollTrigger: { trigger: step, start: "top 70%", once: true } })
      .from($(".step__n", step), { scale: 0, rotate: -180, duration: 0.8, ease: "back.out(2.5)" })
      .from($(".step__body", step), { x: 60, opacity: 0, duration: 0.7, ease: "power4.out" }, "-=0.5")
      .from($$(".codeblock, .tree, .step__live", step), { y: 30, opacity: 0, stagger: 0.1, duration: 0.6, ease: "back.out(1.5)" }, "-=0.4");
  });
  $$(".rule").forEach((r) => {
    r.addEventListener("pointerenter", () => gsap.to(r, { rotate: r.classList.contains("rule--do") ? -1.5 : 1.5, y: -6, duration: 0.3, ease: "back.out(2)" }));
    r.addEventListener("pointerleave", () => gsap.to(r, { rotate: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.5)" }));
  });
}
