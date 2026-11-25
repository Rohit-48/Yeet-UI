/* ============================================
   YEET/UI — global search palette (⌘K / Ctrl+K / "/")

   const search = yeet.search({
     items: [{ title, sub, emoji, color, group, keywords, featured, ...anything }],
     groupOrder: ["Pages", "Components"],
     onSelect: (item) => {},       // default: location.hash = item.href
     storageKey: "y-search",       // localStorage key for search history
   });
   search.open(); search.close();
   Any [data-search-open] element opens it.
   ============================================ */
import gsap from "gsap";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
export const searchShortcut = isMac ? "⌘K" : "Ctrl K";

function markMatch(text, words) {
  let out = esc(text);
  words.forEach((w) => {
    const i = out.toLowerCase().indexOf(esc(w).toLowerCase());
    // avoid matching inside an existing <mark> tag
    if (i < 0 || /<[^>]*$/.test(out.slice(0, i))) return;
    out = `${out.slice(0, i)}<mark>${out.slice(i, i + esc(w).length)}</mark>${out.slice(i + esc(w).length)}`;
  });
  return out;
}

function fuzzy(hay, needle) {
  let j = 0;
  for (let i = 0; i < hay.length && j < needle.length; i++) if (hay[i] === needle[j]) j++;
  return j === needle.length;
}

function scoreWord(item, w) {
  const t = item.title.toLowerCase();
  if (t === w) return 100;
  if (t.startsWith(w)) return 80;
  if (t.includes(" " + w) || t.includes("-" + w) || t.includes("/" + w)) return 65;
  if (t.includes(w)) return 50;
  if ((item.keywords || "").toLowerCase().includes(w)) return 30;
  if ((item.sub || "").toLowerCase().includes(w)) return 20;
  if (w.length > 2 && fuzzy(t, w)) return 10;
  return 0;
}

export function createSearch({
  items = [], groupOrder = [], onSelect, storageKey = "y-search",
  placeholder = "Search components, props, tokens…", limit = 40,
} = {}) {
  /* ---------- DOM ---------- */
  const tpl = document.createElement("template");
  tpl.innerHTML = `
    <div class="y-cmdk" role="dialog" aria-modal="true" aria-label="Search">
      <div class="y-cmdk__backdrop"></div>
      <div class="y-cmdk__box">
        <div class="y-cmdk__head">
          <span class="y-cmdk__icon" aria-hidden="true">🔍</span>
          <input class="y-cmdk__input" type="text" placeholder="${esc(placeholder)}" autocomplete="off" spellcheck="false"
            role="combobox" aria-expanded="true" aria-controls="y-cmdk-list" aria-autocomplete="list" />
          <button class="y-cmdk__esc" type="button" aria-label="Close search">esc</button>
        </div>
        <div class="y-cmdk__body">
          <div class="y-cmdk__list" id="y-cmdk-list" role="listbox">
            <span class="y-cmdk__hl" aria-hidden="true"></span>
            <div class="y-cmdk__content"></div>
          </div>
        </div>
        <div class="y-cmdk__foot">
          <span><kbd>↑</kbd><kbd>↓</kbd>move</span>
          <span><kbd>↵</kbd>open</span>
          <span><kbd>esc</kbd>close</span>
          <span class="y-cmdk__count"></span>
        </div>
      </div>
    </div>`;
  const root = tpl.content.firstElementChild;
  document.body.append(root);
  const box = root.querySelector(".y-cmdk__box");
  const input = root.querySelector(".y-cmdk__input");
  const body = root.querySelector(".y-cmdk__body");
  const content = root.querySelector(".y-cmdk__content");
  const hl = root.querySelector(".y-cmdk__hl");
  const count = root.querySelector(".y-cmdk__count");

  /* ---------- history (top searches) ---------- */
  const load = () => { try { return JSON.parse(localStorage.getItem(storageKey)) || []; } catch { return []; } };
  const save = (list) => { try { localStorage.setItem(storageKey, JSON.stringify(list.slice(0, 30))); } catch { /* private mode */ } };
  const top3 = () => load().sort((a, b) => b.n - a.n || b.t - a.t).slice(0, 3);
  const record = (q) => {
    q = q.trim();
    if (!q) return;
    const list = load();
    const hit = list.find((r) => r.q.toLowerCase() === q.toLowerCase());
    if (hit) { hit.n++; hit.t = Date.now(); hit.q = q; } else list.unshift({ q, n: 1, t: Date.now() });
    save(list);
  };
  const forget = (q) => save(load().filter((r) => r.q !== q));

  /* ---------- rendering ---------- */
  let rows = [];
  let active = -1;
  let isOpen = false;
  let lastFocus = null;

  const itemRow = (item, words) => `
    <div class="y-cmdk__item" role="option" aria-selected="false">
      <span class="y-cmdk__emoji" style="--c:${item.color || "var(--y-white)"}">${item.emoji || ""}</span>
      <span class="y-cmdk__text"><b>${markMatch(item.title, words)}</b>${item.sub ? `<small>${markMatch(item.sub, words)}</small>` : ""}</span>
      <span class="y-cmdk__go" aria-hidden="true">↵</span>
    </div>`;

  function render() {
    const q = input.value.trim().toLowerCase();
    const words = q.split(/\s+/).filter(Boolean);
    let html = "";
    const actions = [];

    if (!words.length) {
      const top = top3();
      const palette = ["var(--y-lime)", "var(--y-pink)", "var(--y-yellow)"];
      html += `<div class="y-cmdk__group"><span>🔥 Your top searches</span>${top.length ? `<button type="button" data-clear>clear</button>` : ""}</div>`;
      html += `<div class="y-cmdk__top">`;
      html += top.length
        ? top.map((r, i) => `
          <button type="button" class="y-cmdk__topcard" style="--c:${palette[i]}" data-top="${i}">
            <span class="rank">#${i + 1}</span><b>${esc(r.q)}</b><small>searched ${r.n}×</small>
            <span class="y-cmdk__remove" role="button" aria-label="Remove ${esc(r.q)}" data-remove="${i}">✕</span>
          </button>`).join("")
        : `<div class="y-cmdk__topempty">No searches yet. Type something 👀</div>`;
      html += `</div>`;
      top.forEach((r) => actions.push({ kind: "top", q: r.q }));

      const featured = items.filter((it) => it.featured);
      if (featured.length) {
        html += `<div class="y-cmdk__group"><span>⚡ Jump to</span></div>`;
        featured.forEach((it) => { html += itemRow(it, []); actions.push({ kind: "item", item: it }); });
      }
      count.textContent = "";
    } else {
      const scored = items
        .map((it) => {
          const s = words.map((w) => scoreWord(it, w));
          return { it, score: s.every((x) => x > 0) ? s.reduce((a, b) => a + b, 0) : 0 };
        })
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      if (!scored.length) {
        html = `<div class="y-cmdk__empty"><span>🫠</span><b>No matches for “${esc(input.value.trim())}”</b><small>Try “button”, “modal” or “pink”.</small></div>`;
        count.textContent = "0 results";
      } else {
        const groups = [...new Set([...groupOrder, ...scored.map((r) => r.it.group || "Results")])];
        groups.forEach((g) => {
          const inGroup = scored.filter((r) => (r.it.group || "Results") === g);
          if (!inGroup.length) return;
          html += `<div class="y-cmdk__group"><span>${esc(g)}</span><span>${inGroup.length}</span></div>`;
          inGroup.forEach(({ it }) => { html += itemRow(it, words); actions.push({ kind: "item", item: it }); });
        });
        count.textContent = `${scored.length} result${scored.length === 1 ? "" : "s"}`;
      }
    }

    content.innerHTML = html;
    const els = [...content.querySelectorAll(".y-cmdk__topcard, .y-cmdk__item")];
    rows = els.map((el, i) => ({ el, ...actions[i] }));
    rows.forEach((r, i) => {
      r.el.id = `y-cmdk-opt-${i}`;
      r.el.addEventListener("pointermove", () => active !== i && setActive(i));
      r.el.addEventListener("click", (e) => {
        const rm = e.target.closest("[data-remove]");
        if (rm) { e.stopPropagation(); forget(r.q); render(); input.focus(); return; }
        choose(i);
      });
    });
    content.querySelector("[data-clear]")?.addEventListener("click", () => { save([]); render(); input.focus(); });

    // entrance
    if (!reduced()) {
      gsap.fromTo(content.querySelectorAll(".y-cmdk__group, .y-cmdk__topcard, .y-cmdk__topempty, .y-cmdk__item"),
        { y: 12, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.025, duration: 0.35, ease: "power3.out", overwrite: true });
      const blob = content.querySelector(".y-cmdk__empty span");
      if (blob) gsap.fromTo(blob, { rotate: -20, scale: 0.5 }, { rotate: 0, scale: 1, duration: 0.8, ease: "elastic.out(1.2, 0.4)" });
    }
    active = -1;
    // with an empty query, start on the first "Jump to" item rather than a top card
    const firstItem = rows.findIndex((r) => r.kind === "item");
    setActive(words.length ? 0 : Math.max(firstItem, 0), true);
  }

  function setActive(i, instant = false) {
    if (!rows.length) { gsap.to(hl, { opacity: 0, duration: 0.15 }); input.removeAttribute("aria-activedescendant"); active = -1; return; }
    active = (i + rows.length) % rows.length;
    rows.forEach((r, j) => {
      r.el.classList.toggle("is-active", j === active);
      r.el.setAttribute("aria-selected", String(j === active));
    });
    const el = rows[active].el;
    input.setAttribute("aria-activedescendant", el.id);
    if (rows[active].kind === "top") {
      gsap.to(hl, { opacity: 0, duration: 0.15 });
    } else {
      const shown = gsap.getProperty(hl, "opacity") > 0.5;
      gsap.to(hl, { y: el.offsetTop, height: el.offsetHeight, opacity: 1, duration: instant || !shown ? 0 : 0.32, ease: "power3.out" });
      if (!shown && !instant) gsap.fromTo(hl, { scaleX: 0.9 }, { scaleX: 1, duration: 0.4, ease: "back.out(2)" });
    }
    el.scrollIntoView({ block: "nearest" });
  }

  function choose(i) {
    const r = rows[i];
    if (!r) return;
    if (r.kind === "top") {
      input.value = r.q;
      render();
      input.focus();
      gsap.fromTo(input, { x: -6 }, { x: 0, duration: 0.5, ease: "elastic.out(1.5, 0.3)" });
      return;
    }
    record(input.value.trim() || r.item.title);
    gsap.fromTo(r.el, { scale: 0.96 }, { scale: 1, duration: 0.2 });
    close(() => (onSelect ? onSelect(r.item) : r.item.href && (location.hash = r.item.href)));
  }

  /* ---------- open / close ---------- */
  function open() {
    if (isOpen) return;
    isOpen = true;
    lastFocus = document.activeElement;
    root.classList.add("is-open");
    document.body.style.overflow = "hidden";
    input.value = "";
    render();
    input.focus();
    if (reduced()) return;
    gsap.timeline()
      .fromTo(root.querySelector(".y-cmdk__backdrop"), { opacity: 0 }, { opacity: 1, duration: 0.25 })
      .fromTo(box, { y: 50, scale: 0.82, rotate: -4, opacity: 0 }, { y: 0, scale: 1, rotate: 0, opacity: 1, duration: 0.6, ease: "back.out(1.6)" }, "<")
      .fromTo(root.querySelector(".y-cmdk__icon"), { rotate: -90, scale: 0 }, { rotate: 0, scale: 1, duration: 0.7, ease: "elastic.out(1.2, 0.45)" }, "-=0.4");
  }

  function close(after) {
    if (!isOpen) return;
    isOpen = false;
    const done = () => {
      root.classList.remove("is-open");
      document.body.style.overflow = "";
      if (typeof after === "function") after();
      else lastFocus?.focus?.();
    };
    if (reduced()) return done();
    gsap.timeline({ onComplete: done })
      .to(box, { y: 30, scale: 0.9, rotate: 3, opacity: 0, duration: 0.25, ease: "power3.in" })
      .to(root.querySelector(".y-cmdk__backdrop"), { opacity: 0, duration: 0.2 }, "-=0.1");
  }

  /* ---------- events ---------- */
  input.addEventListener("input", render);
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(active + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(active - 1); }
    else if (e.key === "Enter") { e.preventDefault(); choose(active); }
    else if (e.key === "Escape") { e.preventDefault(); input.value ? (input.value = "", render()) : close(); }
    else if (e.key === "Tab") { e.preventDefault(); setActive(active + (e.shiftKey ? -1 : 1)); }
  });
  root.querySelector(".y-cmdk__backdrop").addEventListener("click", () => close());
  root.querySelector(".y-cmdk__esc").addEventListener("click", () => close());
  document.addEventListener("keydown", (e) => {
    const typing = /input|textarea|select/i.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); isOpen ? close() : open(); }
    else if (e.key === "/" && !typing && !isOpen) { e.preventDefault(); open(); }
  });
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-search-open]")) { e.preventDefault(); open(); }
  });
  document.querySelectorAll("[data-search-kbd]").forEach((k) => (k.textContent = searchShortcut));

  return { open, close, setItems: (next) => { items = next; if (isOpen) render(); }, el: root };
}
