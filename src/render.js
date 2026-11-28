/* Renders registry entries into bento tiles and full doc sections. */
import { $, $$, h, esc, dedent, hlHTML, hlJS, copy, catColor, kindColor, gsap, ScrollTrigger, reduced, components } from "./shell.js";

/* the showpieces featured in the home "headliners" section */
export const HIGHLIGHTS = ["keyboard", "filebox", "receipt-machine", "recorder", "clocks", "widget-board"];

/* ---------- bento tile ---------- */
export function tile(c, { href = `/docs.html#${c.id}`, sizes = true } = {}) {
  return h(`
    <a class="tile ${sizes && c.tile ? `tile--${c.tile}` : ""}" href="${href}" data-id="${c.id}" data-cat="${c.category}" style="--tile:var(--y-${c.color})">
      ${HIGHLIGHTS.includes(c.id) ? `<span class="tile__hot" aria-label="Highlight">HOT ✦</span>` : ""}
      <div class="tile__preview" inert>${c.mini}</div>
      <div class="tile__foot">
        <span class="tile__emoji">${c.emoji}</span><span class="tile__name">${c.name}</span>
        <span class="tile__cat">${c.category}</span><span class="tile__arrow" aria-hidden="true">→</span>
      </div>
    </a>`);
}

export function tileHover(tiles) {
  if (reduced) return;
  tiles.forEach((t) => {
    const kids = $(".tile__preview", t).children;
    t.addEventListener("pointerenter", () => {
      gsap.to(t, { y: -8, rotate: gsap.utils.random(-1.5, 1.5), boxShadow: "9px 9px 0 #111014", duration: 0.35, ease: "back.out(2)" });
      gsap.fromTo(kids, { scale: 1 }, { scale: 1.08, stagger: 0.05, duration: 0.25, yoyo: true, repeat: 1, ease: "power2.out" });
    });
    t.addEventListener("pointerleave", () => gsap.to(t, { y: 0, rotate: 0, boxShadow: "5px 5px 0 #111014", duration: 0.6, ease: "elastic.out(1, 0.5)" }));
  });
}

/* ---------- full doc section ---------- */
export function docSection(c, i) {
  const htmlCode = c.groups.map((g) => `<!-- ${g.label} -->\n${dedent(g.html)}`).join("\n\n");
  const blocks = [{ lang: "html", label: "html", src: htmlCode }, ...(c.extraCode || []).map((b) => ({ ...b, src: dedent(b.src) }))];
  const sec = h(`
    <section class="doc" id="${c.id}" data-cat="${c.category}">
      <header class="doc__head">
        <div class="doc__num" aria-hidden="true">${String(i + 1).padStart(2, "0")}</div>
        <div>
          <div class="doc__meta">
            <span class="y-badge" style="--bg:var(--y-${catColor[c.category]})">${c.category}</span>
            <small>${c.groups.length} ${c.groups.length === 1 ? "example" : "examples"} · ${c.api.length} props</small>
          </div>
          <h2 class="doc__title">${c.emoji} ${c.name}</h2>
          <p class="doc__desc">${c.desc}</p>
        </div>
      </header>
      <div class="stage">
        <div class="stage__toolbar">
          <div class="seg" role="tablist">
            <span class="seg__pill"></span>
            <button role="tab" aria-selected="true" data-view="preview">👀 Preview</button>
            <button role="tab" aria-selected="false" data-view="code">&lt;/&gt; Code</button>
          </div>
          <div class="stage__tools">
            <div class="bgs" aria-label="Preview background">
              ${["grid", "paper", "lime", "ink"].map((b, j) => `<button data-bg="${b}" aria-pressed="${j === 0}" title="${b} background"></button>`).join("")}
            </div>
            <button class="y-btn y-btn--sm" data-copy>Copy 📋</button>
          </div>
        </div>
        <div class="stage__body">
          <div class="stage__preview" data-bg="grid">
            ${c.groups.map((g, gi) => `
              <div class="vgroup ${g.flush ? "is-flush" : ""}" id="${c.id}-g${gi}">
                <div class="vgroup__label">${g.label}${g.hint ? `<i>${g.hint}</i>` : ""}</div>
                <div class="vgroup__items ${g.layout ? `is-${g.layout}` : ""}">${g.html}</div>
              </div>`).join("")}
          </div>
          <div class="stage__code">
            ${blocks.map((b, j) => `
              <div class="codeblock">
                <div class="codeblock__label"><span>${esc(b.label)}</span><button data-copy-block="${j}">copy</button></div>
                <pre><code>${b.lang === "js" ? hlJS(b.src) : hlHTML(b.src)}</code></pre>
              </div>`).join("")}
          </div>
        </div>
      </div>
      <div class="api" id="${c.id}-api">
        <h3>⚙️ API</h3>
        <div class="api__wrap"><table>
          <thead><tr><th>Name</th><th>Type</th><th>What it does</th></tr></thead>
          <tbody>${c.api.map(([name, kind, d]) => `
            <tr><td><code>${esc(name)}</code></td><td><span class="kind" style="--k:var(--y-${kindColor[kind] || "white"})">${kind}</span></td><td>${esc(d)}</td></tr>`).join("")}
          </tbody>
        </table></div>
      </div>
    </section>`);

  // preview / code switch
  const seg = $(".seg", sec), pill = $(".seg__pill", seg), body = $(".stage__body", sec);
  const preview = $(".stage__preview", sec), code = $(".stage__code", sec);
  const placePill = (btn, d = 0.5) => gsap.to(pill, { x: btn.offsetLeft - 4, width: btn.offsetWidth, duration: d, ease: "back.out(1.7)" });
  $$("button", seg).forEach((btn) => btn.addEventListener("click", () => {
    if (btn.getAttribute("aria-selected") === "true") return;
    $$("button", seg).forEach((b) => b.setAttribute("aria-selected", String(b === btn)));
    placePill(btn);
    const from = body.offsetHeight;
    const toCode = btn.dataset.view === "code";
    preview.style.display = toCode ? "none" : "";
    code.classList.toggle("is-on", toCode);
    gsap.fromTo(body, { height: from }, { height: "auto", duration: 0.5, ease: "power3.inOut", onComplete: () => ScrollTrigger.refresh() });
    gsap.from(toCode ? $$(".codeblock", code) : $$(".vgroup", preview), { y: 16, opacity: 0, stagger: 0.06, duration: 0.45, ease: "power3.out", clearProps: "all" });
  }));
  requestAnimationFrame(() => placePill($("button", seg), 0));
  document.fonts?.ready.then(() => placePill($('[aria-selected="true"]', seg), 0));

  $$(".bgs button", sec).forEach((b) => b.addEventListener("click", () => {
    $$(".bgs button", sec).forEach((o) => o.setAttribute("aria-pressed", String(o === b)));
    preview.dataset.bg = b.dataset.bg;
    gsap.fromTo(b, { scale: 0.6 }, { scale: 1, duration: 0.5, ease: "elastic.out(1.2, 0.4)" });
  }));
  $("[data-copy]", sec).addEventListener("click", () => copy(blocks[0].src));
  $$("[data-copy-block]", sec).forEach((b) => b.addEventListener("click", () => copy(blocks[+b.dataset.copyBlock].src)));
  return sec;
}

export function docReveal(sec) {
  if (reduced) return;
  const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: "top 80%", once: true } });
  tl.from($(".doc__num", sec), { yPercent: 60, rotate: -12, opacity: 0, duration: 0.8, ease: "back.out(2)" })
    .from($(".doc__head > div:last-child", sec).children, { x: -40, opacity: 0, stagger: 0.08, duration: 0.6, ease: "power4.out" }, "-=0.6")
    .from($(".stage", sec), { y: 70, rotate: 1.2, opacity: 0, duration: 0.9, ease: "back.out(1.3)", clearProps: "transform" }, "-=0.4")
    .from($$(".vgroup", sec), { x: 30, opacity: 0, stagger: 0.08, duration: 0.5, ease: "power3.out", clearProps: "all" }, "-=0.5");
  const rows = $$(".api tbody tr", sec);
  if (rows.length) gsap.from([$(".api h3", sec), ...rows], { y: 18, opacity: 0, stagger: 0.05, duration: 0.45, ease: "power3.out", clearProps: "all", scrollTrigger: { trigger: $(".api", sec), start: "top 88%", once: true } });
}

export { components };
