/* ============================================
   YEET/UI — Receipt machine (POS)
   <div class="y-pos" data-pos data-tray="#tray"></div>
   Add items with pos.add({ name, price, qty }) or <button data-pos-add="#pos" data-name data-price>,
   then PAY (or pos.checkout()): processing → approved → the receipt feeds out of the slot
   line by line with printer sounds. Click the receipt (or wait) to tear it off into the tray.
   ============================================ */
import gsap from "gsap";
import { sound } from "./sound.js";

const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const wait = (ms) => new Promise((r) => setTimeout(r, reduced() ? Math.min(ms, 120) : ms));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

const SVG = {
  back: `<svg viewBox="0 0 32 20" aria-hidden="true"><path d="M30 10H4M11 3 4 10l7 7"/></svg>`,
  finger: `<svg viewBox="0 0 24 30" aria-hidden="true"><path d="M5 9a7 7 0 0 1 14 0v6M3 14V10M21 18v-3M8 26c-2-3-3-6-3-11a7 7 0 0 1 1-3.5M9.5 11a3 3 0 0 1 5.5 1.5V17c0 3-1 6-2.5 8.5M12 13v4c0 3-.8 5.5-2 7.5M17.5 22c.5-1.5.5-3 .5-5"/></svg>`,
  batt: `<svg viewBox="0 0 26 14" aria-hidden="true"><rect x="1" y="1.5" width="21" height="11" rx="2.5"/><path d="M24.5 5v4"/><rect x="3.5" y="4" width="11" height="6" rx="1" fill="currentColor" stroke="none"/></svg>`,
  wifi: `<svg viewBox="0 0 22 16" aria-hidden="true"><path d="M1.5 5.5a14 14 0 0 1 19 0M4.8 9a9 9 0 0 1 12.4 0M8.2 12.4a4 4 0 0 1 5.6 0"/></svg>`,
};

/* ---------- receipt markup (also exported for static order pages) ---------- */
function barcode(seed) {
  let s = seed * 9301 + 49297, x = 0, stops = [];
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  while (x < 100) {
    const bar = 0.6 + r() * 1.6, gap = 0.5 + r() * 1.4;
    stops.push(`#1d1c20 ${x.toFixed(2)}% ${(x + bar).toFixed(2)}%`, `transparent ${(x + bar).toFixed(2)}% ${(x + bar + gap).toFixed(2)}%`);
    x += bar + gap;
  }
  return `linear-gradient(90deg, ${stops.join(", ")})`;
}
function qr(seed) { // decorative QR-style block (not a scannable code)
  let s = seed;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const N = 21, finder = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7" fill="none" stroke="#1d1c20" stroke-width="1"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3"/>`;
  let cells = "";
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const inFinder = (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12);
    if (!inFinder && r() > 0.52) cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
  }
  return `<svg class="y-receipt__qr" viewBox="-1 -1 23 23" aria-hidden="true" fill="#1d1c20" shape-rendering="crispEdges">${finder(0.5, 0.5)}${finder(13.5, 0.5)}${finder(0.5, 13.5)}${cells}</svg>`;
}
export function receiptHTML(r) {
  const money = new Intl.NumberFormat(r.locale || "en-US", { style: "currency", currency: r.currency || "USD" });
  const when = r.date instanceof Date ? r.date : new Date(r.date || Date.now());
  const pad = (n) => String(n).padStart(2, "0");
  const day = `${when.getFullYear()}-${pad(when.getMonth() + 1)}-${pad(when.getDate())}`, time = `${pad(when.getHours())}:${pad(when.getMinutes())}`;
  const fill = (v) => String(v).replace("{no}", r.no).replace("{short}", String(r.no).slice(-3)).replace("{name}", r.name || "friend");
  const ticket = r.paper === "ticket";
  const row = (a, b, cls = "") => `<div class="y-receipt__row ${cls}"><span>${a}</span><span>${b}</span></div>`;
  const items = (r.items || []).map((it) => {
    const qty = it.qty || 1, line = it.price * qty;
    let out = row(`${!r.units && qty > 1 ? `${qty}× ` : ""}${esc(it.name)}`, money.format(line));
    if (r.units && qty > 1) out += row(`<span class="y-receipt__muted">&nbsp;&nbsp;${qty} × ${money.format(it.price)}</span>`, "", "y-receipt__sub");
    if (it.was > it.price) out += row(`<span class="y-receipt__save">&nbsp;&nbsp;MEMBER DEAL</span>`, `<span class="y-receipt__save">-${money.format((it.was - it.price) * qty)}</span>`, "y-receipt__sub");
    return out;
  }).join("");
  const meta = (r.meta || []).map(([k, v]) => `<span><small>${esc(k)}</small><b>${esc(fill(v))}</b></span>`).join("");
  const seats = ticket ? `<span><small>SEAT${r.seats.length > 1 ? "S" : ""}</small><b>${r.seats.join(" · ")}</b></span>` : "";
  return `<div class="y-receipt-wrap"><div class="y-receipt ${r.paper ? `y-receipt--${r.paper}` : ""}" role="document" aria-label="Receipt ${esc(r.no)}">
    <div class="y-receipt__head">
      <span class="y-receipt__store">${ticket ? "" : "✦ "}${esc(r.store || "Store")}${ticket ? "" : " ✦"}</span>
      ${ticket ? `<span class="y-receipt__admit">ADMIT ${(r.items || []).reduce((s, it) => s + (it.qty || 1), 0)}</span>` : ""}
      ${r.address ? `<span class="y-receipt__muted">${esc(fill(r.address))}</span><br>` : ""}
      <span class="y-receipt__muted">${day}  ${time} · #${esc(r.no)}</span>
      ${r.copy ? `<br><b>— COPY —</b>` : ""}
    </div>
    ${meta || seats ? `<div class="y-receipt__meta">${meta}${seats}</div>` : ""}
    <hr>
    ${items}
    <hr>
    ${row("SUBTOTAL", money.format(r.subtotal))}
    ${r.saved ? row(`<span class="y-receipt__save">YOU SAVED</span>`, `<span class="y-receipt__save">${money.format(r.saved)}</span>`) : ""}
    ${r.tax ? row(`TAX ${+(r.taxRate * 100).toFixed(2)}%`, money.format(r.tax)) : ""}
    ${r.tipRate !== undefined ? row(r.tipRate ? `TIP ${Math.round(r.tipRate * 100)}%` : "TIP", r.tipRate ? money.format(r.tipAmt) : "—") : ""}
    ${row("TOTAL", money.format(r.total), "y-receipt__total")}
    ${r.split > 1 ? row(`SPLIT ${r.split} WAYS`, `${money.format(r.total / r.split)} each`, "y-receipt__split") : ""}
    <hr>
    ${row(esc(r.method || "TAP · CONTACTLESS"), `<span class="y-receipt__stamp">PAID</span>`)}
    ${ticket ? `<div class="y-receipt__perf" aria-hidden="true"></div>${qr(parseInt(r.no, 10) || 7)}` : `<div class="y-receipt__barcode" style="background:${barcode(parseInt(String(r.no).replace(/\D/g, ""), 10) || 7)}"></div>`}
    <div class="y-receipt__foot"><span class="y-receipt__muted">${esc(String(r.no).padStart(10, "0"))}</span><br>${esc(r.footer || "thank u ♡")}</div>
  </div></div>`;
}

function build(el, cfg) {
  const key = (k, extra = "") => `<button type="button" class="y-pos__key" data-key="${k}" aria-label="${k === "*" ? "Clear entry" : k === "#" ? "Add amount to cart" : k}" ${extra}>${k}</button>`;
  el.innerHTML = `
    <div class="y-pos__device">
      <div class="y-pos__lid">
        <div class="y-pos__head" aria-hidden="true"><span class="y-pos__brand">${esc(cfg.brand)}<small>POS-01</small></span><span class="y-pos__cam"><i></i><b></b></span></div>
        <div class="y-pos__lcd" role="status" aria-live="polite">
          <div class="y-pos__row"><span class="y-pos__date"></span><span class="y-pos__icons">${SVG.batt}${SVG.wifi}</span></div>
          <div class="y-pos__row"><span class="y-pos__label">TOTAL:</span><span class="y-pos__cur">${esc(cfg.currency)}</span></div>
          <span class="y-pos__amt">0.00</span>
          <span class="y-pos__delta"></span>
          <span class="y-pos__status">READY</span>
        </div>
        <div class="y-pos__strip" aria-hidden="true"><span class="y-pos__vents"></span><span class="y-pos__barcode"></span></div>
      </div>
      <div class="y-pos__hinge" aria-hidden="true"></div>
      <div class="y-pos__base">
        <div class="y-pos__top" aria-hidden="true">
          <div class="y-pos__apps">
            <span class="y-pos__app" style="background:#2f7bff">$</span><span class="y-pos__app" style="background:#1fb35c">✦</span>
            <span class="y-pos__app" style="background:#18191c">◎</span><span class="y-pos__app" style="background:#e6326e">♥</span>
            <i class="y-pos__led" data-c="y"></i><i class="y-pos__led" data-c="w"></i><i class="y-pos__led" data-c="b"></i><i class="y-pos__led is-on" data-c="g"></i>
          </div>
          <span class="y-pos__roll"></span>
        </div>
        <div class="y-pos__pad">
          ${["1", "2", "3"].map((k) => key(k)).join("")}
          <button type="button" class="y-pos__key y-pos__key--dark" data-key="back" aria-label="Delete digit" style="grid-column:4;grid-row:1">${SVG.back}</button>
          ${["4", "5", "6", "7", "8", "9", "*", "0", "#"].map((k) => key(k)).join("")}
          <button type="button" class="y-pos__key y-pos__key--pay" data-key="pay" aria-label="Pay and print receipt">PAY<span>ENTER</span></button>
          <button type="button" class="y-pos__finger" data-key="pay" aria-label="Confirm with fingerprint">${SVG.finger}</button>
        </div>
        <div class="y-pos__pedals">
          <button type="button" class="y-pos__pedal" data-key="clear" aria-label="Clear cart"><b></b><small>CLEAR</small></button>
          <button type="button" class="y-pos__pedal" data-key="reprint" aria-label="Reprint last receipt"><b></b><small>REPRINT</small></button>
          <button type="button" class="y-pos__pedal" data-key="mute" aria-label="Sound" aria-pressed="false"><b></b><small>SOUND</small></button>
        </div>
        <div class="y-pos__foot" aria-hidden="true"><span class="y-pos__slot"></span><span class="y-pos__port">USB-C</span><span class="y-pos__dot"></span></div>
      </div>
    </div>
    <div class="y-pos__paper" title="Tear off"></div>
    <span class="y-pos__tear" aria-hidden="true">✂ tap the receipt to tear</span>`;
}

let receiptNo = 4200 + Math.floor(Math.random() * 600);

/* ---------- use-case presets: data-theme="cafe | restaurant | grocery | ticket" ---------- */
export const THEMES = {
  cafe: {
    brand: "brew", store: "Bean There", address: "Counter 2 · order up in ~4 min", tax: 0.05, paper: "kraft",
    tip: [0.1, 0.15, 0.2], method: "PHONE WALLET", footer: "your oat latte is brewing ☕",
    meta: [["ORDER", "A-{short}"], ["NAME", "{name}"]], name: "Sam",
  },
  restaurant: {
    brand: "dine", store: "Noodle Club", address: "Table 12 · Server: Mika", tax: 0.0875,
    tip: [0.15, 0.18, 0.22], split: 2, method: "CARD · CHIP", footer: "come back hungry 🍜",
    meta: [["TABLE", "12"], ["GUESTS", "2"], ["SERVER", "Mika"]],
  },
  grocery: {
    brand: "fresh", store: "Fresh Mart", address: "Aisle-free since 2026", tax: 0, units: true,
    method: "DEBIT · TAP", footer: "bring your tote next time 🥬", meta: [["MEMBER", "•••• 2207"]],
  },
  ticket: {
    brand: "gig", store: "Night Drive Tour", address: "Warehouse 9 · Doors 19:00", tax: 0, paper: "ticket",
    method: "TAP · CONTACTLESS", footer: "show this at the door 🎟️", meta: [["GATE", "B"], ["DOORS", "19:00"]],
  },
};

export function pos(el, opts = {}) {
  if (el._pos) return el._pos;
  const d = el.dataset;
  const fromData = {};
  ["brand", "store", "address", "currency", "locale", "footer", "method", "tray", "paper"].forEach((k) => d[k] !== undefined && (fromData[k] = d[k]));
  ["tax", "autoTear", "split"].forEach((k) => d[k] !== undefined && (fromData[k] = +d[k]));
  if (d.tip !== undefined) fromData.tip = d.tip ? d.tip.split(",").map(Number) : null;
  const cfg = {
    brand: "yeet", store: "Yeet/Shop", address: "404 Vibe St · Unit 7", currency: "USD", locale: "en-US", tax: 0.08,
    footer: "thank u, bestie ♡", method: "TAP · CONTACTLESS", tray: null, autoTear: 2.2,
    ...(THEMES[d.theme] || {}), ...fromData, ...opts,
  };
  if (d.theme) el.classList.add(`y-pos--${d.theme}`);
  build(el, cfg);
  el.setAttribute("role", "group");
  if (!el.hasAttribute("aria-label")) el.setAttribute("aria-label", "Receipt machine");

  const q = (s) => el.querySelector(s);
  const lcd = q(".y-pos__lcd"), amtEl = q(".y-pos__amt"), deltaEl = q(".y-pos__delta"), statusEl = q(".y-pos__status"), labelEl = q(".y-pos__label"), dateEl = q(".y-pos__date");
  const paper = q(".y-pos__paper"), muteBtn = q('[data-key="mute"]');
  const num = new Intl.NumberFormat(cfg.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  let cart = [], entry = "", busy = false, last = null, shown = 0, tearTimer = 0, tipResolve = null;

  const emit = (name, detail) => el.dispatchEvent(new CustomEvent(`pos:${name}`, { detail }));
  const subtotal = () => cart.reduce((s, it) => s + it.price * it.qty, 0);
  const status = (t) => (statusEl.textContent = t);
  const syncMute = () => muteBtn.setAttribute("aria-pressed", String(!sound.muted));

  function showAmount(v, { label = "TOTAL:", delta = "" } = {}) {
    labelEl.textContent = label;
    deltaEl.textContent = delta;
    const o = { v: shown };
    gsap.to(o, { v, duration: reduced() ? 0 : 0.45, ease: "power2.out", overwrite: true, onUpdate: () => (amtEl.textContent = num.format(o.v)) });
    shown = v;
  }
  function clock() {
    const n = new Date(), p = (x) => String(x).padStart(2, "0");
    dateEl.textContent = `${n.getFullYear()}/${p(n.getMonth() + 1)}/${p(n.getDate())} ${p(n.getHours())}:${p(n.getMinutes())}`;
  }
  clock();
  setInterval(clock, 15000);
  syncMute();

  /* ----- cart ----- */
  function add(item) {
    if (busy) return null;
    const price = +item.price;
    if (!item.name || !isFinite(price)) return null;
    const qty = Math.max(1, +item.qty || 1);
    const hit = cart.find((it) => it.name === item.name && it.price === price);
    if (hit) hit.qty += qty; else cart.push({ name: String(item.name), price, qty, ...(+item.was > price ? { was: +item.was } : {}) });
    sound.play("beep");
    entry = "";
    showAmount(subtotal(), { delta: `+${num.format(price * qty)}` });
    status(`${cart.reduce((s, it) => s + it.qty, 0)} ITEM(S) · ${String(item.name).toUpperCase().slice(0, 16)}`);
    emit("add", { item: { ...item, price, qty }, cart: [...cart], subtotal: subtotal() });
    changed();
    return cart;
  }
  const money = new Intl.NumberFormat(cfg.locale, { style: "currency", currency: cfg.currency });
  const changed = () => emit("change", { cart: cart.map((it) => ({ ...it })), subtotal: subtotal(), busy });
  /** change a line's quantity (0 removes it) */
  function setQty(name, qty) {
    if (busy) return null;
    const it = cart.find((i) => i.name === name);
    if (!it) return null;
    qty = Math.max(0, Math.floor(+qty || 0));
    if (qty > it.qty) sound.play("beep"); else sound.play("tick");
    if (qty) it.qty = qty; else cart = cart.filter((i) => i !== it);
    showAmount(subtotal(), { delta: "" });
    status(qty ? `${it.name.toUpperCase().slice(0, 14)} ×${qty}` : `REMOVED ${it.name.toUpperCase().slice(0, 12)}`);
    changed();
    return cart;
  }
  const remove = (name) => setQty(name, 0);
  function clear() {
    if (busy) return;
    cart = []; entry = "";
    sound.play("tick");
    showAmount(0, { delta: "" });
    status("CLEARED");
    emit("clear", {});
    changed();
  }
  function shake() {
    lcd.classList.remove("is-shake");
    void lcd.offsetWidth;
    lcd.classList.add("is-shake");
    sound.play("bonk");
  }

  /* ----- keypad ----- */
  function press(k) {
    if (tipResolve) return tipResolve(k);
    if (busy) return;
    if (/^\d$/.test(k)) {
      if (entry.length >= 7) return shake();
      entry = (entry + k).replace(/^0+/, "");
      sound.play("beep", { pitch: 0.9 + +k * 0.02 });
      showAmount(+(entry || 0) / 100, { label: "AMOUNT:", delta: cart.length ? `CART ${num.format(subtotal())}` : "" });
      status("# = ADD · PAY = CHARGE");
    } else if (k === "back") {
      entry = entry.slice(0, -1);
      sound.play("tick");
      showAmount(entry ? +entry / 100 : subtotal(), { label: entry ? "AMOUNT:" : "TOTAL:" });
    } else if (k === "*") {
      entry = "";
      sound.play("tick");
      showAmount(subtotal(), {});
      status("READY");
    } else if (k === "#") {
      if (!entry) return shake();
      add({ name: "Custom amount", price: +entry / 100 });
    } else if (k === "pay") checkout();
    else if (k === "clear") clear();
    else if (k === "reprint") reprint();
    else if (k === "mute") { sound.toggle(); syncMute(); }
  }
  el.addEventListener("click", (e) => {
    const b = e.target.closest("[data-key]");
    if (b && el.contains(b)) press(b.dataset.key);
  });
  el.addEventListener("keydown", (e) => {
    const map = { Backspace: "back", Enter: "pay", Escape: "*", "*": "*", "#": "#", "+": "#" };
    const k = /^\d$/.test(e.key) ? e.key : map[e.key];
    if (!k || e.metaKey || e.ctrlKey) return;
    // let Enter/Space on a focused button act as a normal click
    if (e.key === "Enter" && e.target.closest("button")) return;
    e.preventDefault();
    press(k);
    const btn = el.querySelector(`[data-key="${k}"]`);
    if (btn) { btn.classList.add("is-down"); setTimeout(() => btn.classList.remove("is-down"), 110); }
  });

  /* ----- paper ----- */
  function feed(r) {
    clearTimeout(tearTimer);
    if (paper.firstElementChild) tear(true);
    paper.innerHTML = receiptHTML(r);
    const wrap = paper.firstElementChild;
    const H = wrap.offsetHeight;
    el.classList.add("is-printing");
    return new Promise((done) => {
      const finish = () => {
        el.classList.remove("is-printing");
        el.classList.add("has-paper");
        done();
      };
      if (reduced()) { gsap.set(paper, { height: H }); return finish(); }
      const lh = 15, steps = Math.ceil(H / lh), tl = gsap.timeline({ onComplete: finish });
      for (let i = 1; i <= steps; i++) {
        tl.to(paper, { height: Math.min(H, i * lh), duration: 0.045, ease: "none" });
        tl.call(() => sound.play("print"));
        tl.to({}, { duration: 0.02 + (i % 5 === 0 ? 0.05 : 0) }); // stepper rhythm
      }
      tl.to(paper, { height: H + 6, duration: 0.12, ease: "power2.out" }).to(paper, { height: H, duration: 0.25, ease: "back.out(3)" });
    });
  }
  function tear(silent = false) {
    clearTimeout(tearTimer);
    const wrap = paper.firstElementChild;
    if (!wrap || el.classList.contains("is-printing")) return;
    el.classList.remove("has-paper");
    if (!silent) sound.play("tear");
    const tray = cfg.tray && document.querySelector(cfg.tray);
    if (tray && !silent) {
      const from = wrap.getBoundingClientRect();
      tray.prepend(wrap);
      gsap.set(paper, { height: 0 });
      const to = wrap.getBoundingClientRect();
      if (!reduced()) {
        gsap.timeline({ onComplete: () => gsap.set(wrap, { clearProps: "transform" }) })
          .fromTo(wrap, { x: from.left - to.left, y: from.top - to.top }, { x: 0, y: 0, duration: 0.85, ease: "power3.inOut" })
          .to(wrap, { rotation: -14, duration: 0.42, yoyo: true, repeat: 1, ease: "sine.inOut" }, 0);
      }
      [...tray.children].slice(+tray.dataset.max || 8).forEach((n) => n.remove());
    } else if (!silent && !reduced()) {
      gsap.to(wrap, { y: 80, rotation: 10, autoAlpha: 0, duration: 0.55, ease: "power2.in", onComplete: () => { paper.innerHTML = ""; gsap.set(paper, { height: 0 }); } });
    } else {
      paper.innerHTML = "";
      gsap.set(paper, { height: 0 });
    }
    if (!busy) { showAmount(subtotal(), { delta: "" }); status("READY"); }
    emit("tear", { receipt: last, tray: tray || null });
  }
  paper.addEventListener("click", () => tear());

  /* ----- checkout ----- */
  const round = (v) => Math.round(v * 100) / 100;
  // tip prompt on the screen: 1-3 pick a preset, 0 = no tip, PAY = the middle one
  function askTip(base) {
    return new Promise((resolve) => {
      const opts = cfg.tip, def = opts[Math.floor(opts.length / 2)];
      showAmount(base, { label: "ADD TIP?", delta: opts.map((t, i) => `${i + 1}·${Math.round(t * 100)}%`).join("  ") });
      status(`0 = NONE · PAY = ${Math.round(def * 100)}%`);
      el.classList.add("is-asking");
      const timer = setTimeout(() => done(0), 12000);
      function done(rate) {
        clearTimeout(timer);
        tipResolve = null;
        el.classList.remove("is-asking");
        sound.play("beep", { pitch: 1.25 });
        resolve(rate);
      }
      tipResolve = (k) => {
        if (k === "pay") done(def);
        else if (k === "0") done(0);
        else if (/^\d$/.test(k) && opts[+k - 1] !== undefined) done(opts[+k - 1]);
        else shake();
      };
    });
  }
  function seatsFor(n) {
    const rowL = "ABCDEFGHJKLM"[Math.floor(Math.random() * 12)], start = 1 + Math.floor(Math.random() * 20);
    return Array.from({ length: Math.min(n, 8) }, (_, i) => `${rowL}${start + i}`);
  }

  async function checkout() {
    if (busy) return null;
    if (!cart.length && entry) add({ name: "Custom amount", price: +entry / 100 });
    if (!cart.length) { status("CART IS EMPTY"); shake(); return null; }
    busy = true;
    changed();
    el.classList.add("is-busy", "is-scanning");
    status("PROCESSING…");
    sound.play("beep");
    emit("checkout", { cart: [...cart] });
    await wait(1100);
    el.classList.remove("is-scanning");
    const sub = subtotal(), tax = round(sub * cfg.tax);
    const saved = round(cart.reduce((s, it) => s + (it.was > it.price ? (it.was - it.price) * it.qty : 0), 0));
    let tipRate, tipAmt = 0;
    if (cfg.tip?.length) {
      el.classList.remove("is-busy");
      tipRate = await askTip(sub + tax);
      tipAmt = round(sub * tipRate);
      el.classList.add("is-busy");
    }
    const count = cart.reduce((s, it) => s + it.qty, 0);
    const r = {
      no: String(++receiptNo), date: new Date(), items: cart.map((it) => ({ ...it })),
      subtotal: sub, taxRate: cfg.tax, tax, saved, tipRate, tipAmt, total: round(sub + tax + tipAmt), split: cfg.split || 1,
      store: cfg.store, address: cfg.address, footer: cfg.footer, method: cfg.method, currency: cfg.currency, locale: cfg.locale,
      paper: cfg.paper, meta: cfg.meta, units: cfg.units, name: cfg.name, seats: cfg.paper === "ticket" ? seatsFor(count) : undefined,
    };
    last = r;
    showAmount(r.total, { label: "PAID:", delta: `-${num.format(r.total)}` });
    status("APPROVED ✓");
    sound.play("chaching");
    await wait(650);
    el.classList.remove("is-busy");
    status("PRINTING…");
    await feed(r);
    cart = []; entry = "";
    busy = false;
    changed();
    status("THANK U ♡");
    emit("printed", { receipt: r });
    if (cfg.autoTear > 0 && cfg.tray) tearTimer = setTimeout(() => tear(), cfg.autoTear * 1000);
    return r;
  }
  async function reprint() {
    if (busy) return;
    if (!last) { status("NOTHING TO REPRINT"); return shake(); }
    busy = true;
    status("PRINTING COPY…");
    await feed({ ...last, copy: true });
    busy = false;
    status("READY");
    if (cfg.autoTear > 0 && cfg.tray) tearTimer = setTimeout(() => tear(), cfg.autoTear * 1000);
  }

  return (el._pos = {
    add, setQty, remove, clear, checkout, reprint, tear, press, el,
    format: (v) => money.format(v),
    get busy() { return busy; },
    get cart() { return cart.map((it) => ({ ...it })); },
    get subtotal() { return subtotal(); },
    get last() { return last; },
  });
}

/* ============================================
   Shopping bag: your products + an editable "in your bag" list, synced with a machine
   <div class="y-cart" data-bag="#pos">
     <button class="y-cart__item" data-name="Hoodie" data-price="48" data-emoji="🧥">…</button>
   </div>
   or build the products from data: yeet.bag(el, { products: [{ name, price, was?, emoji? }] })
   ============================================ */
export function productHTML(p) {
  const was = +p.was > +p.price ? ` data-was="${+p.was}"` : "";
  const price = (v) => `$${(+v).toFixed(+v % 1 ? 2 : 0)}`;
  return `<button type="button" class="y-cart__item" data-name="${esc(p.name)}" data-price="${+p.price}"${was}${p.emoji ? ` data-emoji="${esc(p.emoji)}"` : ""}>
    <span>${p.emoji ? `${esc(p.emoji)} ` : ""}${esc(p.name)}${was ? ` <s>${price(p.was)}</s>` : ""}</span><b>${price(p.price)}</b></button>`;
}

export function bag(el, opts = {}) {
  if (el._bag) {
    if (opts.products) el._bag.setProducts(opts.products);
    return el._bag;
  }
  const machineEl = document.querySelector(opts.pos || el.dataset.bag);
  if (!machineEl) { console.warn("[yeet] bag: no machine found for", el.dataset.bag); return null; }
  const m = pos(machineEl);
  const emojiOf = new Map();

  // products from JS or a JSON attribute replace the ones written in HTML
  function setProducts(products) {
    el.querySelectorAll(".y-cart__item").forEach((b) => b.parentNode.removeChild(b));
    const anchor = el.querySelector(".y-bag, [data-pos-checkout]");
    const html = products.map(productHTML).join("");
    if (anchor) anchor.insertAdjacentHTML("beforebegin", html); else el.insertAdjacentHTML("beforeend", html);
  }
  if (opts.products) setProducts(opts.products);
  else if (el.dataset.products) { try { setProducts(JSON.parse(el.dataset.products)); } catch { console.warn("[yeet] bag: data-products is not valid JSON"); } }

  // the editable list
  let box = el.querySelector(".y-bag");
  if (!box) {
    box = document.createElement("div");
    box.className = "y-bag";
    const checkoutBtn = el.querySelector("[data-pos-checkout]");
    if (checkoutBtn) checkoutBtn.before(box); else el.append(box);
  }
  box.innerHTML = `<div class="y-bag__head"><span>in your bag</span><b class="y-bag__count">0</b></div>
    <ul class="y-bag__lines" aria-live="polite"></ul>
    <p class="y-bag__empty">bag's empty · tap a product to add it</p>
    <div class="y-bag__sum"><span>subtotal</span><b>${m.format(0)}</b></div>`;
  const ul = box.querySelector(".y-bag__lines"), countEl = box.querySelector(".y-bag__count"), sumEl = box.querySelector(".y-bag__sum b");

  // one click handler, so products added later just work
  el.addEventListener("click", (e) => {
    const p = e.target.closest(".y-cart__item");
    if (p && el.contains(p) && !p.hasAttribute("data-pos-add")) {
      if (p.dataset.emoji) emojiOf.set(p.dataset.name, p.dataset.emoji);
      if (m.add({ name: p.dataset.name, price: p.dataset.price, was: p.dataset.was, qty: p.dataset.qty }) && !reduced()) {
        gsap.fromTo(p, { scale: 0.95 }, { scale: 1, duration: 0.4, ease: "back.out(3)" });
      }
      return;
    }
    const line = e.target.closest(".y-bag__line");
    if (!line) return;
    const name = line.dataset.name, cur = +line.dataset.qty;
    if (e.target.closest("[data-bag-inc]")) m.setQty(name, cur + 1);
    else if (e.target.closest("[data-bag-dec]")) m.setQty(name, cur - 1);
    else if (e.target.closest("[data-bag-remove]")) m.setQty(name, 0);
  });

  function lineHTML(it) {
    const n = esc(it.name), emoji = emojiOf.get(it.name) || "";
    return `<span class="y-bag__name">${emoji ? `${esc(emoji)} ` : ""}${n}</span>
      <span class="y-bag__qty">
        <button type="button" data-bag-dec aria-label="One less ${n}">−</button>
        <output>${it.qty}</output>
        <button type="button" data-bag-inc aria-label="One more ${n}">+</button>
      </span>
      <b class="y-bag__price">${m.format(it.price * it.qty)}</b>
      <button type="button" class="y-bag__x" data-bag-remove aria-label="Remove ${n}">✕</button>`;
  }
  const drop = (li) => li.parentNode && li.parentNode.removeChild(li);
  function render({ cart, subtotal, busy }) {
    box.classList.toggle("is-empty", !cart.length);
    box.classList.toggle("is-locked", !!busy);
    el.querySelectorAll(".y-cart__item").forEach((b) => {
      const it = cart.find((c) => c.name === b.dataset.name);
      if (it) b.dataset.inBag = it.qty; else delete b.dataset.inBag;
    });
    countEl.textContent = cart.reduce((s, it) => s + it.qty, 0);
    sumEl.textContent = m.format(subtotal);
    const seen = new Set();
    cart.forEach((it) => {
      seen.add(it.name);
      let li = [...ul.children].find((x) => x.dataset.name === it.name && !x.classList.contains("is-leaving"));
      if (!li) {
        li = document.createElement("li");
        li.className = "y-bag__line";
        li.dataset.name = it.name;
        li.dataset.qty = it.qty;
        li.innerHTML = lineHTML(it);
        ul.append(li);
        if (!reduced()) gsap.from(li, { height: 0, opacity: 0, x: -16, duration: 0.35, ease: "back.out(1.6)", clearProps: "all" });
      } else if (+li.dataset.qty !== it.qty) {
        li.dataset.qty = it.qty;
        li.querySelector("output").textContent = it.qty;
        li.querySelector(".y-bag__price").textContent = m.format(it.price * it.qty);
        if (!reduced()) gsap.fromTo(li.querySelector("output"), { scale: 1.5 }, { scale: 1, duration: 0.35, ease: "back.out(3)" });
      }
    });
    [...ul.children].forEach((li) => {
      if (seen.has(li.dataset.name) || li.classList.contains("is-leaving")) return;
      li.classList.add("is-leaving");
      if (reduced()) return drop(li);
      gsap.to(li, { height: 0, opacity: 0, x: 24, paddingTop: 0, paddingBottom: 0, marginTop: 0, duration: 0.3, ease: "power2.in", onComplete: () => drop(li) });
    });
  }
  machineEl.addEventListener("pos:change", (e) => render(e.detail));
  render({ cart: m.cart, subtotal: m.subtotal, busy: m.busy });

  return (el._bag = {
    el, machine: m, setProducts,
    get items() { return m.cart; },
  });
}
