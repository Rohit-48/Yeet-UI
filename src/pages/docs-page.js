import { $, $$, h, gsap, ScrollTrigger, reduced, catColor, initShell, onBeforeJump, components } from "../shell.js";
import { docSection, docReveal } from "../render.js";
import { categories } from "../registry.js";

const library = $("#library");
const sideNav = $("#sideNav");
const scroller = $(".side__scroll");
const pill = $(".side__pill");
const search = $("#search");
const D = reduced ? 0 : 1; // duration multiplier

/* ================= sidebar markup ================= */
const ordered = categories.flatMap((cat) => components.filter((c) => c.category === cat));
categories.forEach((cat) => {
  const items = components.filter((c) => c.category === cat);
  if (!items.length) return;
  const col = `var(--y-${catColor[cat]})`;
  const group = h(`
    <div class="side__group" data-cat="${cat}">
      <button class="side__gh" type="button" aria-expanded="true">
        <i class="side__dot" style="--c:${col}"></i>${cat}<span class="side__n">${items.length}</span><span class="side__chev">▾</span>
      </button>
      <div class="side__items"></div>
    </div>`);
  const list = $(".side__items", group);
  items.forEach((c) => {
    list.append(h(`
      <a class="side__link" href="#${c.id}" data-id="${c.id}">
        <span class="side__ico" style="--c:${col}">${c.emoji}</span><span class="side__label">${c.name}</span>
      </a>`));
    list.append(h(`
      <div class="side__subs" data-for="${c.id}"><div class="side__subs-inner">
        ${c.groups.map((g, gi) => `<a class="side__sub" href="#${c.id}-g${gi}">${g.label}</a>`).join("")}
        <a class="side__sub" href="#${c.id}-api">API</a>
      </div></div>`));
  });
  sideNav.append(group);
});
sideNav.append(h(`<p class="empty">Nothing matches 👀<br/><small>Esc to clear</small></p>`));
$("#sideTotal").textContent = String(components.length).padStart(2, "0");

/* ================= doc sections ================= */
const sections = ordered.map((c, i) => docSection(c, i)); // same order + numbering as the sidebar
library.append(...sections);

/* ================= active state: sliding pill + sub-links + counter ================= */
let activeId = null;
const linkFor = (id) => $(`.side__link[data-id="${id}"]`, sideNav);

// quickTo "chases" a moving target: calling it again mid-flight just retargets smoothly
const pillY = gsap.quickTo(pill, "y", { duration: 0.4 * D || 0.001, ease: "power3.out" });
const pillH = gsap.quickTo(pill, "height", { duration: 0.4 * D || 0.001, ease: "power3.out" });

function placePill(instant = false) {
  const link = activeId && linkFor(activeId);
  const visible = link && link.offsetParent && !link.closest(".is-hidden") && $(".side__items", link.closest(".side__group")).offsetHeight > 0;
  if (!visible) return gsap.to(pill, { opacity: 0, duration: 0.2 * D, overwrite: "auto" });
  const y = link.getBoundingClientRect().top - sideNav.getBoundingClientRect().top;
  const h = link.offsetHeight;
  if (instant || gsap.getProperty(pill, "opacity") < 0.5) {
    gsap.set(pill, { y, height: h });
    pillY(y, y); pillH(h, h); // sync quickTo's internal start values
  } else {
    pillY(y); pillH(h);
  }
  gsap.to(pill, { opacity: 1, duration: 0.2 * D, overwrite: "auto" });
}
// keep the pill glued while sub-lists / groups animate open or shut
const follow = () => placePill();

function setActive(id) {
  if (id === activeId) return;
  const prev = activeId;
  activeId = id;
  $$(".side__link", sideNav).forEach((l) => l.classList.toggle("is-active", l.dataset.id === id));
  // collapse old sub-list, expand new one
  if (prev) gsap.to(`.side__subs[data-for="${prev}"]`, { height: 0, duration: 0.35 * D, ease: "power3.inOut", onUpdate: follow });
  gsap.to(`.side__subs[data-for="${id}"]`, { height: "auto", duration: 0.45 * D, ease: "power3.out", onUpdate: follow, onComplete: follow });
  // make sure its group is open
  const group = linkFor(id)?.closest(".side__group");
  if (group && $(".side__gh", group).getAttribute("aria-expanded") === "false") toggleGroup(group, true);
  placePill();

  // counter + name
  const idx = ordered.findIndex((c) => c.id === id);
  const now = $("#sideNow"), name = $("#sideName");
  const next = String(idx + 1).padStart(2, "0");
  if (now.textContent !== next) {
    gsap.timeline()
      .to([now, name], { yPercent: -60, opacity: 0, duration: 0.15 * D, ease: "power2.in" })
      .add(() => { now.textContent = next; name.textContent = ordered[idx].name; })
      .fromTo([now, name], { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.35 * D, ease: "back.out(2)" });
  }
  // keep the active link in view inside the sidebar
  const link = linkFor(id);
  if (link) {
    const lr = link.getBoundingClientRect(), sr = scroller.getBoundingClientRect();
    if (lr.top < sr.top + 30 || lr.bottom > sr.bottom - 60) {
      scroller.scrollTo({ top: scroller.scrollTop + (lr.top - sr.top) - sr.height / 3, behavior: reduced ? "auto" : "smooth" });
    }
  }
}

function toggleGroup(group, open) {
  const btn = $(".side__gh", group);
  const items = $(".side__items", group);
  const isOpen = btn.getAttribute("aria-expanded") === "true";
  open ??= !isOpen;
  if (open === isOpen) return;
  btn.setAttribute("aria-expanded", String(open));
  gsap.to(items, { height: open ? "auto" : 0, duration: 0.4 * D, ease: "power3.inOut", onUpdate: follow, onComplete: follow });
  if (open) gsap.from($$(".side__link:not(.is-hidden)", items), { x: -14, opacity: 0, stagger: 0.03, duration: 0.3 * D, ease: "power2.out", clearProps: "all" });
}
$$(".side__gh", sideNav).forEach((btn) => btn.addEventListener("click", () => toggleGroup(btn.closest(".side__group"))));

sections.forEach((sec) => ScrollTrigger.create({
  trigger: sec, start: "top 45%", end: "bottom 45%",
  onToggle: ({ isActive }) => isActive && setActive(sec.id),
}));

// sub-link scroll-spy (examples + API)
$$(".side__sub", sideNav).forEach((sub) => {
  const target = $(sub.getAttribute("href"));
  if (!target) return;
  ScrollTrigger.create({ trigger: target, start: "top 55%", end: "bottom 55%", toggleClass: { targets: sub, className: "is-on" } });
});

// reading progress across all docs
gsap.to("#sideBar", { scaleX: 1, ease: "none", scrollTrigger: { trigger: library, start: "top 40%", end: "bottom bottom", scrub: 0.4 } });

/* ================= filter ================= */
function filter() {
  const q = search.value.trim().toLowerCase();
  let any = false;
  components.forEach((c) => {
    const ok = !q || `${c.name} ${c.category} ${c.desc}`.toLowerCase().includes(q);
    any ||= ok;
    $(`#${c.id}`).classList.toggle("is-hidden", !ok);
    linkFor(c.id).classList.toggle("is-hidden", !ok);
  });
  $$(".side__group", sideNav).forEach((g) => {
    const has = $$(".side__link:not(.is-hidden)", g).length;
    g.classList.toggle("is-hidden", !has);
    if (q && has) toggleGroup(g, true); // reveal matches inside collapsed groups
    $(".side__n", g).textContent = q ? `${has}` : `${$$(".side__link", g).length}`;
  });
  $(".empty", sideNav).classList.toggle("is-on", !any);
  ScrollTrigger.refresh();
  requestAnimationFrame(() => placePill(true));
}
search.addEventListener("input", filter);
search.addEventListener("keydown", (e) => e.key === "Escape" && ((search.value = ""), filter(), search.blur()));
onBeforeJump((hash) => { if (document.querySelector(hash)?.closest(".is-hidden")) { search.value = ""; filter(); } });

await initShell();
sections.forEach(docReveal);
if (!activeId) setActive(ordered[0].id);
document.fonts?.ready.then(() => placePill(true));

if (!reduced) {
  gsap.from(".side__card", { x: -40, opacity: 0, duration: 0.8, ease: "back.out(1.5)", delay: 0.2, clearProps: "transform,opacity" });
  gsap.from(".side__group", { y: 16, opacity: 0, stagger: 0.06, duration: 0.5, ease: "power3.out", delay: 0.35, clearProps: "all" });
}
