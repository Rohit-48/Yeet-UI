import { $, $$, h, gsap, Flip, ScrollTrigger, reduced, initShell, components } from "../shell.js";
import { tile, tileHover } from "../render.js";
import { categories } from "../registry.js";

const bento = $("#bento");
const filters = $("#filters");
const input = $("#filter");
const count = $("#count");
const empty = $("#cempty");

$("[data-total]").textContent = components.length;
$("[data-cats]").textContent = categories.length;

["All", ...categories].forEach((c, i) => {
  const n = c === "All" ? components.length : components.filter((x) => x.category === c).length;
  filters.append(h(`<button class="y-badge y-chip" data-manual data-filter="${c}" aria-pressed="${i === 0}">${c} <small class="chip-n">${n}</small></button>`));
});
components.forEach((c) => bento.append(tile(c)));

let cat = "All";
function apply(animate = true) {
  const tiles = $$(".tile", bento);
  const state = Flip.getState(tiles);
  const q = input.value.trim().toLowerCase();
  let shown = 0;
  tiles.forEach((t) => {
    const c = components.find((x) => x.id === t.dataset.id);
    const ok = (cat === "All" || c.category === cat) && (!q || `${c.name} ${c.category} ${c.desc}`.toLowerCase().includes(q));
    t.classList.toggle("is-hidden", !ok);
    shown += ok;
  });
  count.textContent = `${shown}/${components.length}`;
  empty.hidden = shown > 0;
  if (animate && !reduced) {
    Flip.from(state, {
      duration: 0.6, ease: "power3.inOut", absolute: true, nested: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.7, duration: 0.3 }),
    });
    if (!shown) gsap.fromTo("#cempty span", { rotate: -25, scale: 0.4 }, { rotate: 0, scale: 1, duration: 0.8, ease: "elastic.out(1.2, 0.4)" });
  }
  ScrollTrigger.refresh();
}
$$("[data-filter]", filters).forEach((chip) => chip.addEventListener("click", () => {
  cat = chip.dataset.filter;
  $$("[data-filter]", filters).forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
  gsap.fromTo(chip, { scale: 0.85 }, { scale: 1, duration: 0.5, ease: "elastic.out(1.2, 0.4)" });
  apply();
}));
input.addEventListener("input", () => apply());
input.addEventListener("keydown", (e) => e.key === "Escape" && ((input.value = ""), apply()));
$("#reset").addEventListener("click", () => { input.value = ""; $('[data-filter="All"]', filters).click(); });
apply(false);

await initShell();
tileHover($$(".tile", bento));

if (!reduced) {
  gsap.from(".cbar > *", { y: 30, opacity: 0, stagger: 0.1, duration: 0.6, ease: "back.out(1.6)", delay: 0.4 });
  ScrollTrigger.batch(".tile", {
    start: "top 92%", once: true,
    onEnter: (els) => gsap.from(els, { y: 80, rotate: () => gsap.utils.random(-6, 6), scale: 0.9, opacity: 0, stagger: 0.06, duration: 0.8, ease: "back.out(1.5)", clearProps: "transform,opacity" }),
  });
}
