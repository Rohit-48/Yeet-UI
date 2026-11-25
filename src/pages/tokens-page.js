import { $, $$, h, gsap, reduced, copy, hlCSS, initShell, colors } from "../shell.js";
import tokensCss from "../styles/tokens.css?raw";

const css = getComputedStyle(document.documentElement);
const v = (name) => css.getPropertyValue(name).trim();
const roles = {
  ink: "text, borders, shadows", paper: "page background", white: "surfaces, cards", lime: "primary accent",
  pink: "hot accent, errors", blue: "links, electric", orange: "warm accent", purple: "secondary", yellow: "highlights",
  mint: "success, fresh", muted: "secondary text",
};
const dark = new Set(["ink", "blue", "purple", "muted"]);

/* ---------- colors ---------- */
const strip = $("#strip");
const grid = $("#swgrid");
colors.forEach((c) => {
  const hex = v(`--y-${c}`).toUpperCase();
  const fg = dark.has(c) ? "var(--y-paper)" : "var(--y-ink)";
  const s = h(`<button class="strip__c" style="--c:var(--y-${c});--fg:${fg}"><span>${c}</span></button>`);
  s.addEventListener("click", () => copy(`var(--y-${c})`, `var(--y-${c}) copied`));
  strip.append(s);

  const card = h(`
    <button class="sw" style="--c:var(--y-${c});--fg:${fg}">
      <span class="sw__chip"><b>Aa</b><i>${hex}</i></span>
      <span class="sw__meta"><code>--y-${c}</code><small>${roles[c] || ""}</small></span>
    </button>`);
  card.addEventListener("click", () => {
    copy(`var(--y-${c})`, `var(--y-${c}) copied`);
    gsap.fromTo(card, { rotate: -6, scale: 0.92 }, { rotate: 0, scale: 1, duration: 0.8, ease: "elastic.out(1.2, 0.4)" });
  });
  grid.append(card);
});
$$(".sw", grid).forEach((card) => {
  card.addEventListener("pointerenter", () => gsap.to(card, { y: -8, rotate: gsap.utils.random(-3, 3), duration: 0.35, ease: "back.out(2)" }));
  card.addEventListener("pointerleave", () => gsap.to(card, { y: 0, rotate: 0, duration: 0.6, ease: "elastic.out(1, 0.5)" }));
});

/* ---------- type scale ---------- */
const scale = [
  ["Mega", "clamp(3.6rem, 12vw, 10rem)", "800", "display"],
  ["H1", "4.8rem", "800", "display"],
  ["H2", "3.2rem", "800", "display"],
  ["H3", "1.8rem", "800", "display"],
  ["Body L", "1.2rem", "500", "body"],
  ["Body", "1rem", "500", "body"],
  ["Mono", ".85rem", "500", "mono"],
];
$("#scale").append(...scale.map(([name, size, w, f]) => h(`
  <div class="scale__row">
    <div class="scale__meta"><b>${name}</b><small>${size.startsWith("clamp") ? "fluid" : size} · ${w}</small></div>
    <div class="scale__sample" style="font:${w} min(${size}, 9vw)/1.05 var(--y-font-${f});letter-spacing:${f === "display" ? "-.035em" : "0"}">Main character energy</div>
  </div>`)));

/* ---------- radii + border ---------- */
const radii = [["--y-radius-sm", "sm"], ["--y-radius", "base"], ["--y-radius-lg", "lg"], ["--y-radius-pill", "pill"]];
const radiiEl = $("#radii");
radii.forEach(([t, n], i) => {
  const r = h(`<button class="rad" style="--r:var(${t});--c:var(--y-${["lime", "yellow", "pink", "mint"][i]})"><span class="rad__shape"></span><code>${t}</code><small>${v(t)} · ${n}</small></button>`);
  r.addEventListener("click", () => copy(`var(${t})`, `${t} copied`));
  radiiEl.append(r);
});
radiiEl.append(h(`<button class="rad rad--border"><span class="rad__shape"></span><code>--y-border</code><small>${v("--y-border")}</small></button>`));
$(".rad--border", radiiEl).addEventListener("click", () => copy("var(--y-border)", "--y-border copied"));

/* ---------- shadows ---------- */
const sh = $("#shadows-grid");
[["--y-shadow-sm", "sm", "lime"], ["--y-shadow", "base", "yellow"], ["--y-shadow-lg", "lg", "pink"]].forEach(([t, n, c]) => {
  const b = h(`<button class="shd" style="--s:var(${t});--c:var(--y-${c})"><b>${n}</b><code>${t}</code><small>${v(t)}</small></button>`);
  b.addEventListener("click", () => copy(`var(${t})`, `${t} copied`));
  sh.append(b);
});

/* ---------- motion ---------- */
const eases = [
  ["--y-ease-bounce", v("--y-ease-bounce"), "css"],
  ["--y-ease-out", v("--y-ease-out"), "css"],
  ["back.out(1.7)", "GSAP · overshoot pops", "gsap"],
  ["elastic.out(1, 0.4)", "GSAP · springy wobble", "gsap"],
  ["bounce.out", "GSAP · dropped ball", "gsap"],
  ["power4.out", "GSAP · fast then smooth", "gsap"],
];
const easesEl = $("#eases");
const rows = eases.map(([name, desc, kind], i) => {
  const row = h(`
    <button class="ease" type="button">
      <span class="ease__meta"><code>${name}</code><small>${desc}</small></span>
      <span class="ease__track"><i class="ease__ball" style="--c:var(--y-${["lime", "pink", "yellow", "mint", "orange", "blue"][i]})"></i></span>
    </button>`);
  const ball = $(".ease__ball", row);
  let out = false;
  row._play = () => {
    out = !out;
    const dist = $(".ease__track", row).clientWidth - ball.offsetWidth - 8;
    if (reduced) return gsap.set(ball, { x: out ? dist : 0 });
    if (kind === "css") {
      gsap.set(ball, { clearProps: "transform" });
      ball.style.transition = `transform 1s var(${name})`;
      ball.style.transform = `translateX(${out ? dist : 0}px)`;
    } else {
      gsap.to(ball, { x: out ? dist : 0, rotate: out ? 360 : 0, duration: 1.2, ease: name });
    }
  };
  row.addEventListener("click", row._play);
  easesEl.append(row);
  return row;
});
$("#playAll").addEventListener("click", () => rows.forEach((r, i) => setTimeout(r._play, i * 90)));

/* ---------- file ---------- */
$("#tokensFile").innerHTML = hlCSS(tokensCss.trim());
$("#copyTokens").addEventListener("click", () => copy(tokensCss, "tokens.css copied"));
$("[data-copy-file]").addEventListener("click", () => copy(tokensCss, "tokens.css copied"));

await initShell();

if (!reduced) {
  gsap.from(".strip__c", { scaleY: 0, transformOrigin: "50% 100%", stagger: 0.05, duration: 0.7, ease: "back.out(2)", scrollTrigger: { trigger: "#strip", start: "top 85%", once: true } });
  gsap.from(".sw", { y: 60, opacity: 0, rotate: () => gsap.utils.random(-8, 8), stagger: 0.05, duration: 0.7, ease: "back.out(1.6)", clearProps: "opacity", scrollTrigger: { trigger: "#swgrid", start: "top 85%", once: true } });
  gsap.from(".scale__row", { x: -60, opacity: 0, stagger: 0.07, duration: 0.7, ease: "power4.out", scrollTrigger: { trigger: "#scale", start: "top 85%", once: true } });
  gsap.from(".rad__shape", { scale: 0, rotate: -90, stagger: 0.08, duration: 0.8, ease: "back.out(2)", scrollTrigger: { trigger: "#radii", start: "top 85%", once: true } });
  gsap.from(".ease", { y: 30, opacity: 0, stagger: 0.06, duration: 0.6, ease: "power3.out", scrollTrigger: { trigger: "#eases", start: "top 85%", once: true, onEnter: () => setTimeout(() => $("#playAll").click(), 700) } });
}
