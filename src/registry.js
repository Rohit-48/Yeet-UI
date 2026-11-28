/* ============================================
   Component registry — single source of truth for the showcase.
   Each entry renders: bento tile (mini), detail section (groups),
   code tab (groups' HTML + optional extra code) and API table.
   ============================================ */

import { folderHTML, CAT_SVG, PAW_SVG } from "./components.js";

export const categories = ["Actions", "Forms", "Display", "Navigation", "Overlays", "Feedback", "Widgets"];

export const components = [
  {
    id: "button", name: "Button", emoji: "🔘", category: "Actions", tile: "wide", color: "lime",
    desc: "Hard shadows that squish on press. Five moods, three sizes, loading + magnetic modes.",
    mini: `<button class="y-btn">Primary</button><button class="y-btn y-btn--pink">Pink</button><button class="y-btn y-btn--ink">Dark</button>`,
    groups: [
      { label: "Variants", html: `
<button class="y-btn">Primary</button>
<button class="y-btn y-btn--pink">Pink pop</button>
<button class="y-btn y-btn--blue">Electric</button>
<button class="y-btn y-btn--ink">Dark mode</button>
<button class="y-btn y-btn--ghost">Ghost</button>` },
      { label: "Sizes", html: `
<button class="y-btn y-btn--sm">Small</button>
<button class="y-btn">Default</button>
<button class="y-btn y-btn--lg">Large</button>` },
      { label: "States", html: `
<button class="y-btn y-btn--pink" data-loading-demo>Click to load</button>
<button class="y-btn is-loading">Loading</button>
<button class="y-btn" disabled>Disabled</button>` },
      { label: "Magnetic", hint: "move your cursor near it", html: `
<button class="y-btn y-btn--lg" data-magnetic>🧲 Come closer</button>` },
    ],
    api: [
      [".y-btn", "class", "Base button. Works on <button> and <a>."],
      [".y-btn--pink / --blue / --ink / --ghost", "modifier", "Color variants."],
      [".y-btn--sm / --lg", "modifier", "Size variants."],
      [".is-loading", "state", "Shows spinner, blocks clicks."],
      ["data-magnetic", "attribute", "Button drifts toward the cursor (GSAP)."],
      ["--bg", "css var", "Override background with any color."],
    ],
  },
  {
    id: "badge", name: "Badge & Chip", emoji: "🏷️", category: "Display", color: "yellow",
    desc: "Status labels and toggleable filter chips. Recolor anything with --bg.",
    mini: `<span class="y-badge y-badge--tilt" style="--bg:var(--y-pink)">Hot 🔥</span><span class="y-badge y-badge--dot" style="--bg:var(--y-mint)">Live</span>`,
    groups: [
      { label: "Badges", html: `
<span class="y-badge">New</span>
<span class="y-badge" style="--bg:var(--y-lime)">Shipped ✓</span>
<span class="y-badge" style="--bg:var(--y-ink);color:var(--y-lime)">Beta</span>` },
      { label: "Styles", html: `
<span class="y-badge y-badge--tilt" style="--bg:var(--y-pink)">Tilted 🔥</span>
<span class="y-badge y-badge--dot" style="--bg:var(--y-mint)">Live dot</span>` },
      { label: "Chips", hint: "click to toggle", html: `
<button class="y-badge y-chip" aria-pressed="true">#design</button>
<button class="y-badge y-chip" aria-pressed="false" style="--bg:var(--y-white)">#code</button>
<button class="y-badge y-chip" aria-pressed="false" style="--bg:var(--y-white)">#motion</button>` },
    ],
    api: [
      [".y-badge", "class", "Pill label."],
      [".y-badge--tilt", "modifier", "Rotated sticker look."],
      [".y-badge--dot", "modifier", "Pulsing status dot."],
      [".y-chip", "class", "Add to a badge <button> for toggle behaviour."],
      ["aria-pressed", "attribute", "Chip on/off state. Toggled by yeet.init()."],
    ],
  },
  {
    id: "card", name: "Card", emoji: "🃏", category: "Display", tile: "tall", color: "pink",
    desc: "Content containers with a 3D tilt on hover. Stickers optional, strongly encouraged.",
    mini: `<article class="y-card" style="padding:1rem;width:150px"><span class="y-card__emoji" style="font-size:1.8rem">🛸</span><h3 class="y-card__title" style="font-size:1rem">Tilt card</h3></article>`,
    groups: [
      { label: "Variants", hint: "hover them", layout: "grid", html: `
<article class="y-card" data-tilt>
  <span class="y-badge y-card__sticker" style="--bg:var(--y-lime)">NEW</span>
  <span class="y-card__emoji">🛸</span>
  <h3 class="y-card__title">Tilt card</h3>
  <p class="y-card__body">I follow your cursor around like it's my job.</p>
</article>
<article class="y-card" data-tilt style="--bg:var(--y-yellow)">
  <span class="y-card__emoji">🍋</span>
  <h3 class="y-card__title">Colored</h3>
  <p class="y-card__body" style="color:var(--y-ink)">One CSS variable swaps the vibe.</p>
</article>
<article class="y-card" data-tilt style="--bg:var(--y-ink);color:var(--y-paper);box-shadow:8px 8px 0 var(--y-pink)">
  <span class="y-badge y-card__sticker" style="--bg:var(--y-pink)">PRO</span>
  <span class="y-card__emoji">🌚</span>
  <h3 class="y-card__title">Dark</h3>
  <p class="y-card__body" style="color:#b7b1bf">Moody, mysterious, still slaps.</p>
</article>` },
    ],
    api: [
      [".y-card", "class", "Container with border + big shadow."],
      [".y-card__emoji / __title / __body", "element", "Content slots."],
      [".y-card__sticker", "element", "Badge pinned to the top-right corner."],
      ["data-tilt", "attribute", "3D tilt following the cursor (GSAP)."],
      ["--bg", "css var", "Card background."],
    ],
  },
  {
    id: "input", name: "Input", emoji: "⌨️", category: "Forms", tile: "wide", color: "blue",
    desc: "Text fields that pop forward on focus and shake on error. Try submitting an empty email.",
    mini: `<div class="y-field" style="width:220px"><span class="y-label">Email</span><input class="y-input" placeholder="you@slay.com" tabindex="-1" /></div>`,
    groups: [
      { label: "Field", html: `
<label class="y-field" style="width:280px">
  <span class="y-label">Your name</span>
  <input class="y-input" placeholder="bestie mcbestface" />
  <span class="y-hint">what should we call you?</span>
</label>` },
      { label: "Validation", hint: "submit it", layout: "block", html: `
<form class="demo-form" data-validate novalidate>
  <label class="y-field">
    <span class="y-label">Email</span>
    <input class="y-input" type="email" placeholder="you@slay.com" required />
    <span class="y-hint">we won't spam, pinky promise</span>
  </label>
  <button class="y-btn" type="submit">Send it 📨</button>
</form>` },
    ],
    api: [
      [".y-field", "class", "Wrapper: label + input + hint, stacked."],
      [".y-label / .y-input / .y-hint", "class", "Field parts."],
      [".is-error", "state", "On .y-field: red shadow, shake, red hint."],
      ["form[data-validate]", "attribute", "Validates required/email on submit and toasts the result."],
    ],
  },
  {
    id: "toggle", name: "Toggle", emoji: "🎚️", category: "Forms", color: "mint",
    desc: "A real checkbox underneath, so forms and keyboard just work. The thumb does a flip.",
    mini: `<label class="y-toggle"><input type="checkbox" checked tabindex="-1" /><span class="y-toggle__track"><span class="y-toggle__thumb"></span></span></label>`,
    groups: [
      { label: "States", html: `
<label class="y-toggle"><input type="checkbox" checked /><span class="y-toggle__track"><span class="y-toggle__thumb"></span></span>Notifications</label>
<label class="y-toggle"><input type="checkbox" /><span class="y-toggle__track"><span class="y-toggle__thumb"></span></span>Chaos mode</label>` },
    ],
    api: [
      [".y-toggle", "class", "Label wrapper. Put a checkbox inside."],
      [".y-toggle__track / __thumb", "element", "Visual switch, must follow the input."],
      ["checked", "attribute", "Native on/off state."],
    ],
  },
  {
    id: "checkbox", name: "Checkbox", emoji: "✅", category: "Forms", color: "pink",
    desc: "Chunky checkbox that tilts and pops a check mark in.",
    mini: `<label class="y-check"><input type="checkbox" checked tabindex="-1" /> Touch grass</label>`,
    groups: [
      { label: "States", html: `
<label class="y-check"><input type="checkbox" checked /> Touch grass</label>
<label class="y-check"><input type="checkbox" /> Hydrate</label>
<label class="y-check"><input type="checkbox" /> Log off at 6</label>` },
    ],
    api: [
      [".y-check", "class", "Label wrapper with a native checkbox inside."],
    ],
  },
  {
    id: "slider", name: "Slider", emoji: "🎛️", category: "Forms", color: "orange",
    desc: "Range input with a filled track and a squishy thumb.",
    mini: `<input class="y-range" type="range" value="65" style="--p:65%;width:200px" tabindex="-1" />`,
    groups: [
      { label: "Range", html: `
<label class="y-field" style="width:320px">
  <span class="y-label">Vibe level: <b data-range-out>70</b>%</span>
  <input class="y-range" type="range" min="0" max="100" value="70" data-range />
</label>` },
    ],
    api: [
      [".y-range", "class", "Styled input[type=range]."],
      ["data-range", "attribute", "Keeps the filled track (--p) in sync."],
      ["[data-range-out]", "attribute", "Element in the same .y-field that shows the value."],
    ],
  },
  {
    id: "tabs", name: "Tabs", emoji: "📑", category: "Navigation", tile: "wide", color: "purple",
    desc: "A pill indicator that springs between tabs. Arrow keys move between them.",
    mini: `<div class="y-tabs__list"><span class="y-tabs__pill" style="width:78px;transform:translateX(5px)"></span><span class="y-tabs__tab" style="color:var(--y-lime)">For you</span><span class="y-tabs__tab">Following</span></div>`,
    groups: [
      { label: "Default", layout: "block", html: `
<div class="y-tabs" data-tabs>
  <div class="y-tabs__list" role="tablist">
    <span class="y-tabs__pill"></span>
    <button class="y-tabs__tab" role="tab" aria-selected="true">For you</button>
    <button class="y-tabs__tab" role="tab" aria-selected="false">Following</button>
    <button class="y-tabs__tab" role="tab" aria-selected="false">Trending 🔥</button>
  </div>
  <div class="y-tabs__panel" role="tabpanel">✨ Curated just for you. The algorithm knows you too well.</div>
  <div class="y-tabs__panel" role="tabpanel" hidden>👯 Posts from your besties. Wholesome only.</div>
  <div class="y-tabs__panel" role="tabpanel" hidden>📈 What everyone's talking about rn.</div>
</div>` },
    ],
    api: [
      ["[data-tabs]", "attribute", "Root. Initialised by yeet.init()."],
      [".y-tabs__pill", "element", "Moving indicator, first child of the list."],
      [".y-tabs__tab", "element", "Tab button; aria-selected marks the active one."],
      [".y-tabs__panel", "element", "Panels, matched to tabs by order."],
    ],
  },
  {
    id: "accordion", name: "Accordion", emoji: "🪗", category: "Display", color: "yellow",
    desc: "GSAP height animation, one item open at a time.",
    mini: `<div class="y-accordion__item" style="width:220px"><span class="y-accordion__trigger" style="font-size:.85rem;padding:.6rem .8rem">Is it free? <span class="y-accordion__icon" style="width:22px;height:22px">+</span></span></div>`,
    groups: [
      { label: "Default", layout: "block", html: `
<div class="y-accordion" data-accordion>
  <div class="y-accordion__item">
    <button class="y-accordion__trigger" aria-expanded="false">Is it free? <span class="y-accordion__icon">+</span></button>
    <div class="y-accordion__panel"><div class="y-accordion__inner">Yep. It's our own library, use it on every site we ship.</div></div>
  </div>
  <div class="y-accordion__item">
    <button class="y-accordion__trigger" aria-expanded="false">Do I need a framework? <span class="y-accordion__icon">+</span></button>
    <div class="y-accordion__panel"><div class="y-accordion__inner">Nope. Plain HTML + CSS classes, GSAP for the motion.</div></div>
  </div>
  <div class="y-accordion__item">
    <button class="y-accordion__trigger" aria-expanded="false">Can I change the colors? <span class="y-accordion__icon">+</span></button>
    <div class="y-accordion__panel"><div class="y-accordion__inner">Edit tokens.css or override --bg per component.</div></div>
  </div>
</div>` },
    ],
    api: [
      ["[data-accordion]", "attribute", "Root. Initialised by yeet.init()."],
      [".y-accordion__item", "element", "Gets .is-open when expanded."],
      [".y-accordion__trigger / __panel / __inner", "element", "Header button, animated wrapper, padded content."],
    ],
  },
  {
    id: "modal", name: "Modal", emoji: "🪟", category: "Overlays", color: "blue",
    desc: "Bouncy entrance, blurred backdrop. Closes on Esc, backdrop click, or any [data-modal-close].",
    mini: `<div class="y-modal__dialog" style="padding:1rem;width:170px;box-shadow:5px 5px 0 var(--y-ink)"><span style="font-size:1.6rem">🥳</span><b style="display:block;font-family:var(--y-font-display)">Modal!</b></div>`,
    groups: [
      { label: "Trigger", html: `
<button class="y-btn y-btn--pink y-btn--lg" data-modal-open="demoModal">Open modal 🎉</button>` },
    ],
    extraCode: [{ lang: "html", label: "modal markup (end of <body>)", src: `
<div class="y-modal" id="demoModal" role="dialog" aria-modal="true">
  <div class="y-modal__backdrop" data-modal-close></div>
  <div class="y-modal__dialog">
    <span class="y-modal__emoji">🥳</span>
    <h3>You opened a modal!</h3>
    <p>Bouncy, blurry, and it closes when you hit Esc.</p>
    <div class="y-modal__actions">
      <button class="y-btn y-btn--ghost" data-modal-close>Nah</button>
      <button class="y-btn y-btn--pink" data-modal-close>Let's gooo</button>
    </div>
  </div>
</div>` }, { lang: "js", label: "or open it from JS", src: `yeet.openModal(document.getElementById("demoModal"));` }],
    api: [
      ["data-modal-open=\"id\"", "attribute", "On any element: opens the modal with that id."],
      ["data-modal-close", "attribute", "Inside the modal: closes it."],
      [".y-modal / __backdrop / __dialog", "element", "Structure."],
      ["yeet.openModal(el) / closeModal(el)", "js", "Programmatic control."],
    ],
  },
  {
    id: "toast", name: "Toast", emoji: "🍞", category: "Feedback", tile: "wide", color: "lime",
    desc: "Slides in, wiggles its emoji, leaves after 3s. Fire from HTML or JS.",
    mini: `<div class="y-toast" style="--bg:var(--y-lime);min-width:0"><span class="y-toast__emoji">✅</span>Saved! You ate that.</div>`,
    groups: [
      { label: "Types", hint: "click them", html: `
<button class="y-btn" data-toast="Saved! You ate that." data-toast-emoji="✅" data-toast-bg="var(--y-lime)">Success</button>
<button class="y-btn y-btn--pink" data-toast="Oop— something broke." data-toast-emoji="💀" data-toast-bg="var(--y-pink)">Error</button>
<button class="y-btn y-btn--blue" data-toast="New follower: @bestie" data-toast-emoji="👋" data-toast-bg="var(--y-white)">Info</button>` },
    ],
    extraCode: [{ lang: "js", label: "from JS", src: `yeet.toast("Saved! You ate that.", { emoji: "✅", bg: "var(--y-lime)", duration: 3 });` }],
    api: [
      ["data-toast", "attribute", "Message to show on click."],
      ["data-toast-emoji / data-toast-bg", "attribute", "Emoji and background color."],
      ["yeet.toast(msg, { emoji, bg, duration })", "js", "Programmatic toast. Creates .y-toaster if missing."],
    ],
  },
  {
    id: "avatar", name: "Avatar", emoji: "🧑‍🎤", category: "Display", color: "orange",
    desc: "Solo or stacked. Hover the stack and they jump.",
    mini: `<div class="y-avatar-stack"><span class="y-avatar" style="--bg:var(--y-pink)">🦄</span><span class="y-avatar" style="--bg:var(--y-lime)">🐸</span><span class="y-avatar" style="--bg:var(--y-blue)">👽</span></div>`,
    groups: [
      { label: "Single", html: `
<span class="y-avatar" style="--bg:var(--y-yellow)">😎</span>
<span class="y-avatar y-avatar--online" style="--bg:var(--y-mint)">🐱</span>` },
      { label: "Stack", hint: "hover", html: `
<div class="y-avatar-stack">
  <span class="y-avatar" style="--bg:var(--y-pink)">🦄</span>
  <span class="y-avatar" style="--bg:var(--y-lime)">🐸</span>
  <span class="y-avatar" style="--bg:var(--y-blue)">👽</span>
  <span class="y-avatar" style="--bg:var(--y-orange)">🦊</span>
  <span class="y-avatar" style="--bg:var(--y-ink);color:var(--y-lime);font-size:1rem">+9</span>
</div>` },
    ],
    api: [
      [".y-avatar", "class", "Circle with an emoji, initials or <img>."],
      [".y-avatar--online", "modifier", "Green status dot."],
      [".y-avatar-stack", "class", "Overlapping group with hover pop."],
    ],
  },
  {
    id: "progress", name: "Progress", emoji: "⏳", category: "Feedback", color: "mint",
    desc: "Striped, always moving. Fills when scrolled into view (data-progress) or set width yourself.",
    mini: `<div class="y-progress" style="width:200px"><div class="y-progress__bar" style="width:70%"></div></div>`,
    groups: [
      { label: "Colors", layout: "block", html: `
<div class="y-progress"><div class="y-progress__bar" data-progress="78"></div></div>
<div class="y-progress"><div class="y-progress__bar" data-progress="42" style="background:repeating-linear-gradient(-45deg,var(--y-pink) 0 12px,var(--y-purple) 12px 24px)"></div></div>` },
    ],
    api: [
      [".y-progress / __bar", "class", "Track and fill."],
      ["data-progress=\"0-100\"", "attribute", "Animates the bar to that % when it scrolls into view."],
    ],
  },
  {
    id: "tooltip", name: "Tooltip", emoji: "💬", category: "Overlays", color: "purple",
    desc: "Pure CSS with a springy scale-in. Shows on hover and keyboard focus.",
    mini: `<span class="y-tip"><span class="y-tip__bubble" style="opacity:1;scale:1;position:static;translate:none;display:inline-block">heyyy 👋</span></span>`,
    groups: [
      { label: "Default", hint: "hover", html: `
<span class="y-tip"><button class="y-btn y-btn--sm">Hover me</button><span class="y-tip__bubble">heyyy 👋</span></span>
<span class="y-tip"><button class="y-btn y-btn--sm y-btn--pink">And me</button><span class="y-tip__bubble">no thoughts, just vibes</span></span>` },
    ],
    api: [
      [".y-tip", "class", "Wrapper around the trigger."],
      [".y-tip__bubble", "element", "Bubble text, sits above the trigger."],
    ],
  },
  {
    id: "marquee", name: "Marquee", emoji: "🎞️", category: "Display", tile: "wide", color: "ink",
    desc: "Infinite GSAP ticker that speeds up when you scroll fast.",
    mini: `<div class="y-marquee" style="width:100%"><div class="y-marquee__track"><span class="y-marquee__item">drop ⚡</span><span class="y-marquee__item">drop ⚡</span><span class="y-marquee__item">drop ⚡</span><span class="y-marquee__item">drop ⚡</span></div></div>`,
    groups: [
      { label: "Directions", layout: "block", flush: true, html: `
<div class="y-marquee" data-marquee style="--bg:var(--y-lime);--fg:var(--y-ink)">
  <div class="y-marquee__track"><span class="y-marquee__item">limited drop ⚡</span><span class="y-marquee__item">free shipping ⚡</span></div>
</div>
<div class="y-marquee" data-marquee data-reverse>
  <div class="y-marquee__track"><span class="y-marquee__item">only 3 left ★</span><span class="y-marquee__item">no restocks ★</span></div>
</div>` },
    ],
    api: [
      ["[data-marquee]", "attribute", "Root. Content is cloned to loop seamlessly."],
      ["data-reverse", "attribute", "Scroll left-to-right."],
      ["data-speed", "attribute", "Seconds per loop (default 22)."],
      ["--bg / --fg", "css var", "Strip colors."],
    ],
  },
  {
    id: "search", name: "Search", emoji: "🔍", category: "Navigation", tile: "tall", color: "lime",
    desc: "Global ⌘K / Ctrl+K / \"/\" search in a square box. Fuzzy matching, grouped results, a highlight that slides between rows, and your top 3 searches saved on the device.",
    mini: `<div style="width:150px;aspect-ratio:1;background:var(--y-paper);border:var(--y-border);border-radius:18px;box-shadow:5px 5px 0 var(--y-ink);overflow:hidden;display:grid;grid-template-rows:auto 1fr"><div style="display:flex;gap:.4rem;align-items:center;padding:.5rem;border-bottom:var(--y-border);background:var(--y-white);font:800 .8rem var(--y-font-display)"><span class="y-cmdk__icon" style="width:24px;height:24px;border-radius:8px;font-size:.7rem;box-shadow:none">🔍</span>butt|</div><div style="padding:.45rem;display:grid;gap:.3rem;align-content:start"><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:.25rem"><span style="height:26px;background:var(--y-lime);border:2px solid var(--y-ink);border-radius:7px"></span><span style="height:26px;background:var(--y-pink);border:2px solid var(--y-ink);border-radius:7px"></span><span style="height:26px;background:var(--y-yellow);border:2px solid var(--y-ink);border-radius:7px"></span></div><span style="height:22px;background:var(--y-yellow);border:2px solid var(--y-ink);border-radius:7px"></span><span style="height:22px;border:2px dashed rgba(17,16,20,.2);border-radius:7px"></span></div></div>`,
    groups: [
      { label: "Triggers", hint: "or press ⌘K / Ctrl+K / \"/\"", html: `
<button class="y-btn y-btn--lg" data-search-open>🔍 Open search</button>
<button class="y-nav__search" data-search-open>🔍 Search <kbd data-search-kbd>⌘K</kbd></button>` },
    ],
    extraCode: [{ lang: "js", label: "set it up once per site", src: `
const search = yeet.search({
  items: [
    { title: "Pricing", sub: "Plans and FAQs", emoji: "💸", color: "var(--y-lime)", group: "Pages", href: "#pricing", featured: true },
    { title: "Blog", sub: "Latest drops", emoji: "📰", color: "var(--y-pink)", group: "Pages", href: "#blog", keywords: "news posts" },
  ],
  groupOrder: ["Pages"],
  storageKey: "my-site:searches",
  onSelect: (item) => (location.hash = item.href),
});` }],
    api: [
      ["yeet.search(options)", "js", "Creates the palette and binds ⌘K / Ctrl+K and \"/\". Returns { open, close, setItems }."],
      ["items[]", "js", "{ title, sub, emoji, color, group, keywords, featured }. Extra fields are passed back to onSelect."],
      ["featured", "js", "Show the item under \"Jump to\" when the box is empty."],
      ["storageKey", "js", "localStorage key for history. The top 3 searches by count (then most recent) show as cards."],
      ["[data-search-open]", "attribute", "Any element that should open the search."],
      ["[data-search-kbd]", "attribute", "Filled with ⌘K on Mac, Ctrl K elsewhere."],
      [".y-cmdk / __box / __item / __hl", "element", "Overlay, square box, result rows, sliding highlight."],
    ],
  },
  {
    id: "filebox", name: "Folder Box", emoji: "🗂️", category: "Display", tile: "wide", color: "yellow",
    desc: "A storage box of folder cards with a box cat. Click a folder to open it; the \"next →\" button on the box lifts the front folder out and drops it into the back, so the next one comes forward, on loop. Holds up to 12 folders. Add data-cat for the cat (eyes follow you, click it for a meow) and data-sound for synthesized swish / thud / pop sounds.",
    mini: `<div class="y-filebox" data-cat style="width:150px;margin:14px 0 0 30px;pointer-events:none">
      <div class="y-filebox__cat">${CAT_SVG}</div><div class="y-filebox__paw">${PAW_SVG}</div>
      <div class="y-filebox__back"></div>
      <div class="y-filebox__stack">
        <article class="y-folder" style="--c:#8ecbff;z-index:97;transform:translate(53px,-12px) rotate(2deg) scale(.95)"><span class="y-folder__tab"><b>Doc-04</b></span><div class="y-folder__body"></div></article>
        <article class="y-folder y-folder--dark" style="--c:var(--y-blue);z-index:98;transform:translate(35px,-8px) rotate(-1.5deg) scale(.96)"><span class="y-folder__tab"><b>Doc-03</b></span><div class="y-folder__body"></div></article>
        <article class="y-folder" style="--c:var(--y-pink);z-index:99;transform:translate(18px,-4px) rotate(2.5deg) scale(.98)"><span class="y-folder__tab"><b>Doc-02</b></span><div class="y-folder__body"></div></article>
        <article class="y-folder" style="--c:var(--y-orange);z-index:100;transform:rotate(-2deg)"><span class="y-folder__tab"><b>Doc-01</b></span><div class="y-folder__body"><span class="y-folder__label">Illustration</span></div></article>
      </div>
      <div class="y-filebox__front"><span class="y-filebox__handle"></span><span class="y-filebox__note">Portfolio</span></div>
    </div>`,
    groups: [
      { label: "Portfolio box", hint: "tap a folder to open it · \"next →\" on the box shuffles · ← → keys", layout: "block", html: `
<div style="display:flex;flex-wrap:wrap;gap:2rem;align-items:flex-end;padding-top:9rem">
  <div class="y-filebox" id="demoBox" data-filebox data-capacity="12" data-cat data-sound style="flex:1 1 280px">
    <div class="y-filebox__back"></div>
    <div class="y-filebox__stack">
      ${folderHTML({ doc: "Doc-01", label: "Illustration", note: "12 pieces", color: "var(--y-orange)", items: [
        { emoji: "🐙", title: "Octo Boba", meta: "Procreate · 2026", color: "var(--y-pink)" },
        { emoji: "🌵", title: "Desert Disco", meta: "Risograph print", color: "var(--y-lime)" },
        { emoji: "🍜", title: "Midnight Ramen", meta: "Gouache", color: "var(--y-yellow)" },
        { emoji: "🛸", title: "Lost & Found", meta: "Zine cover", color: "#8ecbff" },
      ] })}
      ${folderHTML({ doc: "Doc-02", label: "Graphic Design", note: "posters + type", color: "var(--y-pink)", items: [
        { emoji: "🎟️", title: "Gig Poster Series", meta: "6 posters · screenprint", color: "var(--y-orange)" },
        { emoji: "🔤", title: "Wobbly Grotesk", meta: "Custom display font", color: "var(--y-lime)" },
        { emoji: "🧃", title: "Juice Label", meta: "Packaging", color: "var(--y-mint)" },
      ] })}
      ${folderHTML({ doc: "Doc-03", label: "Personal Project", note: "cat comics", color: "var(--y-blue)", content: `
        <div class="y-fview__strip">
          <div style="--c:var(--y-orange)">${CAT_SVG}</div><div style="--c:var(--y-lime)">${CAT_SVG}</div><div style="--c:var(--y-pink)">${CAT_SVG}</div>
        </div>
        <p style="margin:.9rem 0 0;font-weight:600">Issue #3: the box cat finally gets its own folder. 🐾</p>` })}
      ${folderHTML({ doc: "Doc-04", label: "Art", note: "sketchbook", color: "#8ecbff", items: [
        { emoji: "🖍️", title: "Sketchbook vol. 4", meta: "86 pages", color: "var(--y-yellow)" },
        { emoji: "🖼️", title: "Oil Study", meta: "Still life", color: "var(--y-orange)" },
        { emoji: "🌙", title: "Night Walks", meta: "Ink + wash", color: "var(--y-purple)" },
      ] })}
    </div>
    <div class="y-filebox__front">
      <span class="y-filebox__handle"></span>
      <span class="y-filebox__note">Portfolio</span>
      <div class="y-filebox__meta"><span class="y-filebox__count">04 / 12</span><span class="y-filebox__slots"></span></div>
    </div>
    <span class="y-filebox__live" aria-live="polite"></span>
  </div>
  <div style="display:grid;gap:.75rem">
    <button class="y-btn y-btn--sm y-btn--ink" data-filebox-open="#demoBox">Open front 📂</button>
    <button class="y-btn y-btn--sm y-btn--pink" data-filebox-add="#demoBox">+ Add folder</button>
    <button class="y-btn y-btn--sm y-btn--ghost" data-filebox-remove="#demoBox">Take out front</button>
  </div>
</div>` },
      { label: "Blank template", hint: "copy this · replace every [ … ] with your content · open a folder to see its slots", layout: "block", html: `
<div style="padding-top:9rem">
  <div class="y-filebox" id="blankBox" data-filebox data-capacity="12">
    <div class="y-filebox__back"></div>
    <div class="y-filebox__stack">

      <!-- FOLDER 1 · copy this <article> once per folder (12 max) -->
      <article class="y-folder" style="--c:var(--y-lime)">
        <span class="y-folder__tab"><b>[Doc-01]</b></span>
        <div class="y-folder__body">
          <span class="y-folder__label">[Folder title]<small>[short note]</small></span>
          <span class="y-folder__paper"></span>
        </div>
        <span class="y-folder__open" aria-hidden="true">open ↗</span>
        <!-- everything inside <template> appears on the sheet when the folder opens -->
        <template class="y-folder__content">
          <ul class="y-fview__items">
            <li><span class="ico">[emoji]</span><span><b>[Item title]</b><small>[item details]</small></span></li>
            <li><span class="ico">[emoji]</span><span><b>[Item title]</b><small>[item details]</small></span></li>
          </ul>
          <p>[add text]</p>
        </template>
      </article>

      <!-- FOLDER 2 · free-form: paragraphs, images, links, anything -->
      <article class="y-folder" style="--c:var(--y-pink)">
        <span class="y-folder__tab"><b>[Doc-02]</b></span>
        <div class="y-folder__body">
          <span class="y-folder__label">[Folder title]<small>[short note]</small></span>
          <span class="y-folder__paper"></span>
        </div>
        <span class="y-folder__open" aria-hidden="true">open ↗</span>
        <template class="y-folder__content">
          <p>[add text]</p>
          <p>[add more text]</p>
          <p><a href="#">[link text]</a></p>
        </template>
      </article>

    </div>
    <div class="y-filebox__front">
      <span class="y-filebox__handle"></span>
      <span class="y-filebox__note">[Box title]</span>
      <div class="y-filebox__meta"><span class="y-filebox__count">02 / 12</span><span class="y-filebox__slots"></span></div>
    </div>
    <span class="y-filebox__live" aria-live="polite"></span>
  </div>
</div>` },
    ],
    extraCode: [{ lang: "js", label: "or build a folder in JS · replace every [ … ]", src: `
const box = yeet.filebox(document.querySelector("#blankBox"));

box.add({
  doc: "[Doc-03]",                 // little tab on top
  label: "[Folder title]",          // sticker on the folder
  note: "[short note]",             // small line under the title
  color: "var(--y-blue)",           // any CSS color
  items: [                          // a list on the sheet…
    { emoji: "[emoji]", title: "[Item title]", meta: "[item details]" },
  ],
  // …or free-form HTML instead of items:
  // content: "<p>[add text]</p>",
});` }, { lang: "js", label: "control it from JS", src: `
const box = yeet.filebox(document.querySelector("#demoBox"));
box.open();   // opens the front folder (box.close() to shut it)
box.next();   // front folder → back of the box
box.prev();   // back folder → front
box.add({ doc: "Doc-05", label: "Branding", note: "logos", color: "var(--y-lime)",
  items: [{ emoji: "🎨", title: "Logo set", meta: "3 directions" }] }); // null when full (12/12)
box.remove(); // takes out the front folder
box.size;     // how many are stored
box.el.addEventListener("filebox:change", (e) => console.log(e.detail.front, e.detail.size));` }],
    api: [
      ["[data-filebox]", "attribute", "Root. Clicking a folder opens it (one behind slides to the front first). Clicking the box itself does nothing. Enter / Space opens the front folder; → / ← shuffle."],
      [".y-filebox__next", "element", "The \"next →\" button on the box: brings the next folder forward (loops). Added automatically if your markup doesn't include one."],
      ["<template class=\"y-folder__content\">", "element", "What's inside a folder, shown on the sheet when it opens. Any HTML. folderHTML({ items }) builds a list for you."],
      ["data-capacity", "attribute", "Max folders the box holds. Default 12; extra markup is dropped, add() refuses with a shake + toast."],
      [".y-folder", "class", "A folder card. Use yeet.folderHTML({ doc, label, note, color, items | content }) to generate one."],
      [".y-folder__tab / __label / __paper", "element", "Doc tab, taped sticker label (with optional <small> note), lined paper peeking out."],
      ["--c", "css var", "Folder color. Add .y-folder--dark for dark colors."],
      [".y-filebox__note / __count / __slots", "element", "Sticky-note title, 04 / 12 counter, and the 12 storage dots (front one pops)."],
      ["data-cat", "attribute", "Adds the box cat: peeks from behind, eyes follow the cursor, blinks, watches folders, pats the box, gets shocked when full. Click it to meow."],
      ["data-sound", "attribute", "Synthesized sounds (Web Audio, no files): swish + thud on cycle, pop on add, bonk when full, meow. Adds a 🔊 mute toggle, remembered across visits."],
      ["yeet.filebox(el)", "js", "Returns { open, close, next, prev, add, remove, size, front, capacity }. Fires filebox:change, filebox:open, filebox:close."],
      ["yeet.sound", "js", "play(\"swish\" | \"thud\" | \"pop\" | \"bonk\" | \"meow\" | \"tick\"), muted = true/false, toggle()."],
    ],
  },
  {
    id: "navbar", name: "Navbar", emoji: "🧭", category: "Navigation", tile: "wide", color: "yellow",
    desc: "Floating pill nav: a blob that chases your cursor, rolling link text, a scroll-progress ring on the logo, glass mode + hide-on-scroll when fixed, and a circle-reveal mobile menu. The one at the top of this page is this.",
    mini: `<nav class="y-nav" style="width:100%"><span class="y-nav__mark" style="width:30px;height:30px">✦</span><div class="y-nav__links" style="margin:0 auto;display:flex"><span class="y-nav__blob" style="opacity:1;width:58px;transform:translateX(4px)"></span><span class="y-nav__link is-hot" style="font-size:.75rem">Shop</span><span class="y-nav__link" style="font-size:.75rem">Drops</span></div></nav>`,
    groups: [
      { label: "Default", hint: "hover the links", layout: "block", html: `
<nav class="y-nav" data-nav>
  <a class="y-nav__logo" href="#navbar">
    <span class="y-nav__mark">
      <svg class="y-nav__ring" viewBox="0 0 56 56"><circle class="bg" cx="28" cy="28" r="26" /><circle class="fg" cx="28" cy="28" r="26" pathLength="1" /></svg>
      <span class="y-nav__glyph">🛍️</span>
    </span>
    <span>brand<em>✦</em></span>
  </a>
  <div class="y-nav__links">
    <span class="y-nav__blob"></span>
    <a class="y-nav__link" href="#shop"><span>Shop</span></a>
    <a class="y-nav__link" href="#drops"><span>Drops</span></a>
    <a class="y-nav__link" href="#about"><span>About</span></a>
  </div>
  <div class="y-nav__actions">
    <a class="y-btn y-btn--sm y-btn--pink" href="#cart">Cart (2)</a>
  </div>
</nav>` },
      { label: "Scrolled", hint: "glass + pink shadow", layout: "block", html: `
<nav class="y-nav is-scrolled" data-nav>
  <a class="y-nav__logo" href="#navbar"><span class="y-nav__mark"><span class="y-nav__glyph">⚡</span></span><span>zap<em>/</em>co</span></a>
  <div class="y-nav__links">
    <span class="y-nav__blob"></span>
    <a class="y-nav__link" href="#work"><span>Work</span></a>
    <a class="y-nav__link" href="#lab"><span>Lab</span></a>
  </div>
  <div class="y-nav__actions"><a class="y-btn y-btn--sm y-btn--ink" href="#hire">Hire us</a></div>
</nav>` },
    ],
    extraCode: [{ lang: "html", label: "fixed page nav: add these", src: `
<header class="topbar">
  <nav class="y-nav" data-nav data-nav-fixed>
    <!-- logo + .y-nav__links as above; #hash links auto-highlight their section -->
    <div class="y-nav__actions">
      <button class="y-nav__burger" aria-label="Menu" aria-expanded="false" aria-controls="navSheet"><span></span><span></span></button>
    </div>
  </nav>
</header>
<div class="y-nav__sheet" id="navSheet">
  <a href="#home"><span>Home</span></a>
  <a href="#work"><span>Work</span></a>
  <small>tagline goes here</small>
</div>` }],
    api: [
      ["[data-nav]", "attribute", "Enables the sliding blob and scroll-spy for #hash links."],
      ["[data-nav-fixed]", "attribute", "Page nav: glass/compact after 40px, hides on scroll down, returns on scroll up."],
      [".y-nav__links / __link / __blob", "element", "Link group, rolling-text links, the moving highlight."],
      [".y-nav__mark / __ring / __glyph", "element", "Logo badge, scroll-progress ring (SVG), glyph that spins with scroll."],
      [".y-nav__burger + .y-nav__sheet", "element", "Mobile menu (under 860px). Burger's aria-controls names the sheet id."],
      [".is-scrolled", "state", "Compact glass look. Added automatically with data-nav-fixed."],
      ["yeet.nav(el)", "js", "Init a navbar added after page load."],
    ],
  },
  {
    id: "clocks", name: "Clocks", emoji: "🕰️", category: "Widgets", tile: "wide", color: "orange",
    desc: "Live analog, world and digital clocks for any time zone. Drop in an empty element with data-tz and yeet.init() draws the dial, ticks the second hand with a springy GSAP snap and keeps the date, weekday and UTC offset right. One shared ticker runs every clock, and off-screen clocks sleep.",
    mini: `<div style="display:flex;gap:10px;align-items:center">
      <div class="y-wgt" style="--u:50px"><div class="y-cell y-cell--big"><div class="y-aclock" data-numbers data-label="Amsterdam" data-tz="Europe/Amsterdam"></div></div></div>
      <div class="y-wgt" style="--u:50px"><div class="y-cell y-cell--w2 y-cell--white y-wclock" data-tz="America/New_York" data-code="NYC"></div><div class="y-cell y-cell--w2 y-cell--red y-dclock" data-tz="Europe/Amsterdam"></div></div>
    </div>`,
    groups: [
      { label: "Analog", hint: "data-tz = any IANA zone", html: `
<div class="y-wgt">
  <div class="y-cell y-cell--big">
    <div class="y-aclock" data-tz="Europe/Amsterdam" data-label="Amsterdam" data-numbers data-date></div>
  </div>
</div>
<div class="y-wgt">
  <div class="y-cell y-cell--red y-cell--round"><div class="y-aclock y-aclock--ink" data-tz="Europe/Amsterdam" data-label="AMS" data-numbers></div></div>
  <div class="y-cell y-cell--orange y-dday" data-tz="Europe/Amsterdam"></div>
  <div class="y-cell y-cell--w2 y-cell--blue y-stat" data-count="7398"></div>
</div>` },
      { label: "World clock", hint: "code · date · offset · mini dial", html: `
<div class="y-wgt">
  <div class="y-cell y-cell--w2 y-cell--white y-wclock" data-tz="America/New_York" data-code="NYC"></div>
  <div class="y-cell y-cell--w2 y-cell--red y-wclock" data-tz="America/New_York" data-code="NYC" data-hand="ink"></div>
</div>
<div class="y-wgt">
  <div class="y-cell y-cell--w2 y-cell--navy y-wclock" data-tz="Europe/Amsterdam" data-code="AMS" data-hand="red"></div>
  <div class="y-cell y-cell--w2 y-wclock" data-tz="Asia/Tokyo" data-code="TYO" data-hand="red"></div>
</div>` },
      { label: "Digital & dates", hint: "colon blinks · updates at midnight", html: `
<div class="y-wgt" style="--shell:#2f6bff">
  <div class="y-cell y-cell--w2 y-dclock"></div>
  <div class="y-cell y-cell--orange y-dday"></div>
  <div class="y-cell y-cell--navy y-cell--round y-temp">18°</div>
</div>
<div class="y-wgt" style="--shell:#d9d9d9">
  <div class="y-cell y-cell--w2 y-cell--red y-dclock" data-tz="Europe/London"></div>
  <div class="y-cell y-dday" data-tz="Europe/London"></div>
  <div class="y-cell y-cell--yellow y-cell--round y-temp">24°</div>
</div>
<div class="y-wgt">
  <div class="y-cell y-cell--w2 y-cell--white y-wclock" data-tz="America/New_York" data-code="NYC"></div>
  <div class="y-cell y-cell--w2 y-dbig"></div>
</div>` },
    ],
    extraCode: [{ lang: "js", label: "control it from JS", src: `
yeet.init();                        // draws every clock on the page
yeet.widgets(newEl);                // clocks added later
yeet.zoned(el);                     // { hour, minute, second, weekday, day, month, year, offset } for el's data-tz
yeet.aclock(document.querySelector("#myDial")); // one analog clock` }],
    api: [
      [".y-wgt / .y-wgt--wide", "class", "Widget shell: a 2×2 (or 4×2) grid of squares. Everything inside scales from --u."],
      ["--u", "css var", "Size of one grid square (default 84px). Set it on a widget or board to scale the whole thing."],
      ["--shell", "css var", "Shell color behind the cells (default near-black)."],
      [".y-cell", "class", "A cell. Spans: --w2 (2 wide), --h2 (2 tall), --big (2×2), --round (circle)."],
      [".y-cell--{color}", "modifier", "Cell colors: sky, orange, red, yellow, grey, white, steel, navy, blue, black, lime, pink, purple. Text color follows automatically. Or set --c and --ink yourself."],
      [".y-aclock", "class", "Analog clock. Add data-numbers (60/15/30/45), data-label, data-date (date window). .y-aclock--red / --ink change the hands, or set --hand."],
      [".y-wclock", "class", "World-clock cell: city code, weekday + date, UTC offset and a mini dial. data-code=\"NYC\", data-hand=\"red|ink\"."],
      [".y-dclock", "class", "Digital HH:MM with a blinking colon. data-format=\"12\" for 12-hour, add data-ampm to show am/pm."],
      [".y-dday / .y-dbig", "class", "Weekday + day (Mon 26) / big day + month + year."],
      ["data-tz", "attribute", "Any IANA time zone (\"Asia/Tokyo\"). Leave it off for the viewer's local time."],
      ["data-time=\"10:08:30\"", "attribute", "Freeze a clock at a set time (mockups, screenshots)."],
    ],
  },
  {
    id: "weather", name: "Weather", emoji: "⛅", category: "Widgets", color: "yellow",
    desc: "Weather cards, sunrise / sunset, wind and temperature dots in the same chunky widget style. Bring your own data from any weather API: write the numbers in, and the icons come from one attribute.",
    mini: `<div class="y-wgt" style="--u:50px"><div class="y-cell y-cell--big y-cell--yellow"><div class="y-wx__sky"><i class="y-wi" data-wi="sun"></i>Clear sky</div><div class="y-wx__temp">24<sup>°</sup></div><div class="y-wx__city">Los Angeles</div></div></div>`,
    groups: [
      { label: "Weather cards", html: `
<div class="y-wgt">
  <div class="y-cell y-cell--big y-cell--yellow">
    <div class="y-wx__sky"><i class="y-wi" data-wi="sun"></i>Clear sky</div>
    <div class="y-wx__temp">24<sup>°</sup></div>
    <div class="y-wx__city">Los Angeles</div>
  </div>
</div>
<div class="y-wgt">
  <div class="y-cell y-cell--big">
    <div class="y-wx__sky"><i class="y-wi" data-wi="partly"></i>Partly cloudy</div>
    <div class="y-wx__temp">23<sup>°</sup></div>
    <div class="y-wx__city">Hong Kong</div>
  </div>
</div>
<div class="y-wgt">
  <div class="y-cell y-cell--big y-cell--steel">
    <div class="y-wx__sky"><i class="y-wi" data-wi="cloud"></i>Overcast</div>
    <div class="y-wx__temp">16<sup>°</sup></div>
    <div class="y-wx__city">Bogotá</div>
  </div>
</div>` },
      { label: "Sun, wind & temp", hint: "data-deg turns the wind arrow", html: `
<div class="y-wgt">
  <div class="y-cell y-sun"><i class="y-wi" data-wi="sunset"></i><span class="y-sun__t">22:04</span></div>
  <div class="y-cell y-cell--orange y-sun"><i class="y-wi" data-wi="sunrise"></i><span class="y-sun__t">06:12</span></div>
  <div class="y-cell y-wind" data-deg="0"><i class="y-wi" data-wi="nav"></i><span class="y-wind__t">23 mp/h</span></div>
  <div class="y-cell y-cell--yellow y-cell--round y-temp">12°</div>
</div>
<div class="y-wgt">
  <div class="y-cell y-cell--navy y-wind" data-deg="120"><i class="y-wi" data-wi="nav"></i><span class="y-wind__t">42 km/h</span></div>
  <div class="y-cell y-cell--sky y-cell--round y-temp">22°</div>
  <div class="y-cell y-cell--pink y-sun"><i class="y-wi" data-wi="moon"></i><span class="y-sun__t">Night</span></div>
  <div class="y-cell y-cell--white y-sun"><i class="y-wi" data-wi="rain"></i><span class="y-sun__t">80%</span></div>
</div>` },
    ],
    extraCode: [{ lang: "js", label: "fill it from a weather API", src: `
const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=40.71&longitude=-74.01&current=temperature_2m");
const { current } = await res.json();
document.querySelector(".y-wx__temp").innerHTML = \`\${Math.round(current.temperature_2m)}<sup>°</sup>\`;` }],
    api: [
      [".y-wx__sky / __temp / __city", "element", "Condition line (icon + text), the big temperature (use <sup>° </sup>), and the place, pinned to the bottom."],
      [".y-wi[data-wi]", "element", "Icon, drawn by yeet.init(): sun, cloud, partly, rain, moon, sunrise, sunset, nav. Mono icons use the cell's text color."],
      [".y-sun", "class", "Icon on top, time underneath (.y-sun__t)."],
      [".y-wind[data-deg]", "class", "Wind arrow pointing data-deg degrees, speed in .y-wind__t. Wiggles on hover."],
      [".y-temp + .y-cell--round", "class", "Round temperature dot."],
      ["yeet.weatherIcons", "js", "The SVG paths, if you want the icons elsewhere."],
    ],
  },
  {
    id: "widget-board", name: "Widget Board", emoji: "🧩", category: "Widgets", tile: "wide", color: "blue",
    desc: "Mix clocks, weather and big counters into a home-screen style board. Small widgets take one slot, wide ones take two, and the board wraps to fit. Widgets fly in when it scrolls into view, numbers count up, and hovering lifts a widget onto a lime shadow.",
    mini: `<div class="y-wgt y-wgt--wide" style="--u:46px">
      <div class="y-cell y-cell--big y-cell--sky"><div class="y-wx__sky"><i class="y-wi" data-wi="partly"></i>Few clouds</div><div class="y-wx__temp">28<sup>°</sup></div><div class="y-wx__city">New York City</div></div>
      <div class="y-cell y-cell--orange y-dday" data-tz="America/New_York"></div>
      <div class="y-cell y-sun"><i class="y-wi" data-wi="sunset"></i><span class="y-sun__t">22:04</span></div>
      <div class="y-cell y-cell--w2 y-cell--red y-wclock" data-tz="America/New_York" data-code="NYC" data-hand="ink"></div>
    </div>`,
    groups: [
      { label: "Board", hint: "hover a widget · resize the window", layout: "block", html: `
<div class="y-wgt-board">
  <div class="y-wgt y-wgt--wide">
    <div class="y-cell y-cell--big y-cell--sky">
      <div class="y-wx__sky"><i class="y-wi" data-wi="partly"></i>Few clouds</div>
      <div class="y-wx__temp">28<sup>°</sup></div>
      <div class="y-wx__city">New York City</div>
    </div>
    <div class="y-cell y-cell--orange y-dday" data-tz="America/New_York"></div>
    <div class="y-cell y-sun"><i class="y-wi" data-wi="sunset"></i><span class="y-sun__t">22:04</span></div>
    <div class="y-cell y-cell--w2 y-cell--red y-wclock" data-tz="America/New_York" data-code="NYC" data-hand="ink"></div>
  </div>
  <div class="y-wgt">
    <div class="y-cell y-cell--w2 y-cell--white y-wclock" data-tz="America/New_York" data-code="NYC"></div>
    <div class="y-cell y-wind" data-deg="0"><i class="y-wi" data-wi="nav"></i><span class="y-wind__t">23 mp/h</span></div>
    <div class="y-cell y-cell--yellow y-cell--round y-temp">12°</div>
  </div>
  <div class="y-wgt">
    <div class="y-cell y-cell--big y-cell--yellow">
      <div class="y-wx__sky"><i class="y-wi" data-wi="sun"></i>Clear sky</div>
      <div class="y-wx__temp">24<sup>°</sup></div>
      <div class="y-wx__city">Los Angeles</div>
    </div>
  </div>
  <div class="y-wgt">
    <div class="y-cell y-cell--big"><div class="y-aclock" data-tz="Europe/Amsterdam" data-label="Amsterdam" data-numbers data-date></div></div>
  </div>
  <div class="y-wgt">
    <div class="y-cell y-cell--big">
      <div class="y-wx__sky"><i class="y-wi" data-wi="partly"></i>Partly cloudy</div>
      <div class="y-wx__temp">23<sup>°</sup></div>
      <div class="y-wx__city">Hong Kong</div>
    </div>
  </div>
  <div class="y-wgt">
    <div class="y-cell y-cell--w2 y-cell--orange y-stat y-stat--sm" data-count="7.6" data-decimals="1" data-unit="Km"></div>
    <div class="y-cell y-cell--w2 y-cell--red y-stat" data-count="10139"></div>
  </div>
  <div class="y-wgt">
    <div class="y-cell y-cell--w2 y-cell--navy y-wclock" data-tz="Europe/Amsterdam" data-code="AMS" data-hand="red"></div>
    <div class="y-cell y-cell--orange y-sun"><i class="y-wi" data-wi="sunset"></i><span class="y-sun__t">17:54</span></div>
    <div class="y-cell y-cell--sky y-cell--round y-temp">22°</div>
  </div>
  <div class="y-wgt" style="--shell:#2f6bff">
    <div class="y-cell y-cell--w2 y-dclock"></div>
    <div class="y-cell y-cell--orange y-dday"></div>
    <div class="y-cell y-cell--navy y-cell--round y-temp">18°</div>
  </div>
  <div class="y-wgt y-wgt--wide">
    <div class="y-cell y-cell--big y-cell--steel">
      <div class="y-wx__sky"><i class="y-wi" data-wi="cloud"></i>Overcast</div>
      <div class="y-wx__temp">16<sup>°</sup></div>
      <div class="y-wx__city">Bogotá</div>
    </div>
    <div class="y-cell"><div class="y-aclock" data-tz="America/Bogota" data-label="BOG"></div></div>
    <div class="y-cell y-sun"><i class="y-wi" data-wi="sunset"></i><span class="y-sun__t">17:54</span></div>
    <div class="y-cell y-cell--w2 y-stat" data-count="10139"></div>
  </div>
  <div class="y-wgt">
    <div class="y-cell y-cell--red y-cell--round"><div class="y-aclock y-aclock--ink" data-tz="Europe/Amsterdam" data-numbers data-label="AMS"></div></div>
    <div class="y-cell y-cell--orange y-dday" data-tz="Europe/Amsterdam"></div>
    <div class="y-cell y-cell--w2 y-cell--blue y-stat" data-count="7398"></div>
  </div>
  <div class="y-wgt">
    <div class="y-cell y-cell--w2 y-cell--white y-wclock" data-tz="America/New_York" data-code="NYC"></div>
    <div class="y-cell y-cell--w2 y-dbig" data-tz="America/New_York"></div>
  </div>
  <div class="y-wgt" style="--shell:#ff8a1f">
    <div class="y-cell y-cell--w2 y-cell--blue y-wclock" data-tz="Europe/Amsterdam" data-code="AMS"></div>
    <div class="y-cell y-cell--w2 y-stat" data-count="8647"></div>
  </div>
  <div class="y-wgt" style="--shell:#d9d9d9">
    <div class="y-cell y-cell--w2 y-cell--red y-dclock" data-tz="Europe/Amsterdam"></div>
    <div class="y-cell y-dday" data-tz="Europe/Amsterdam"></div>
    <div class="y-cell y-cell--yellow y-cell--round y-temp">24°</div>
  </div>
</div>` },
    ],
    api: [
      [".y-wgt-board", "class", "Responsive board. Small widgets take one slot, .y-wgt--wide takes two. --u scales with the screen (set it to override)."],
      [".y-stat[data-count]", "class", "Big number that counts up when it scrolls into view. data-decimals, data-sep (default \".\"), data-dec (default \",\"), data-unit (\"Km\"). .y-stat--sm for a smaller size."],
      ["yeet.formatNum(v, opts)", "js", "Same number formatting for your own code. opts = { decimals, sep, dec }: 10139 → \"10.139\"."],
      [".y-wgt:hover", "state", "Lifts and tilts onto a lime offset shadow."],
    ],
  },
  {
    id: "recorder", name: "Field Recorder", emoji: "📼", category: "Widgets", tile: "tall", color: "blue",
    desc: "A chunky tape recorder that actually records. Hit the orange button to record from the mic, ▶ to play it back, ◀◀ to rewind. The reels spin at real tape speed (the full reel turns slower), the amber screen draws the live waveform, and the tape winds from one reel to the other. No mic or permission denied? It records a demo signal and plays a lo-fi synth tape instead. Comes with a blueprint spec-sheet wrapper with auto-drawn callout lines.",
    mini: `<div class="y-rec" data-recorder style="--w:150px"></div>`,
    groups: [
      { label: "Recorder", hint: "● record (asks for the mic) · ▶ play · ◀◀ rewind", html: `
<div class="y-rec" data-recorder></div>
<div class="y-rec" data-recorder data-label="FX-02" style="--w:220px;--body:#cfd6dd;--body-hi:#eef2f5;--body-lo:#9ea9b4;--amber:#3d5afe;--glow:#8ea3ff"></div>` },
      { label: "Blueprint sheet", hint: "callout lines follow the targets on resize", layout: "block", html: `
<figure class="y-blueprint">
  <header class="y-blueprint__head">
    <h3 class="y-blueprint__title">Archive</h3>
    <p class="y-blueprint__sub">Field recorder</p>
    <i class="y-blueprint__planet"></i>
  </header>
  <div class="y-blueprint__stage">
    <div class="y-rec" data-recorder></div>
    <span class="y-callout" data-target=".y-rec__window" data-tx="0.25" style="left:0;top:16%">Data reels</span>
    <span class="y-callout" data-target=".y-rec__keys" data-tx="0.2" style="left:0;top:64%">Transport keys</span>
    <span class="y-callout" data-side="right" data-target=".y-rec__display" data-tx="0.85" style="right:0;top:40%">Waveform display</span>
    <span class="y-callout" data-side="right" data-target=".y-rec__record" style="right:0;top:72%">Record button</span>
  </div>
  <figcaption class="y-blueprint__foot">Explorer equipment / No. 010</figcaption>
</figure>` },
    ],
    extraCode: [{ lang: "js", label: "control it from JS", src: `
const rec = yeet.recorder(document.querySelector("[data-recorder]"));
rec.record();   // start (asks for mic) · call again to stop
rec.play();     // play / pause the take
rec.rewind();   // wind back to 00:00
rec.stop();
rec.mode;       // "ready" | "recording" | "playing" | "paused" | "rewinding"

// grab the recording (a webm/ogg Blob) when a take finishes
rec.el.addEventListener("recorder:saved", (e) => {
  const { blob, url, duration } = e.detail;
  upload(blob);  // or <a href={url} download>
});` }],
    api: [
      ["[data-recorder]", "attribute", "Root (.y-rec). Leave it empty: yeet.init() builds the handle, reels, screen and keys."],
      ["--w", "css var", "Device width (default 320px). Everything inside scales with it."],
      ["--body / --body-hi / --body-lo", "css var", "Casing colors (mid, highlight, shadow)."],
      ["--amber / --glow", "css var", "Record button + screen color."],
      ["data-label", "attribute", "Model text printed next to the grille (default ARC-010)."],
      ["data-max", "attribute", "Max seconds per take (default 30). Recording stops itself after that."],
      [".is-recording / .is-playing", "state", "Set on the root. Record button glows, LED blinks."],
      ["recorder:saved", "event", "Fired when a mic take is ready. detail = { blob, url, duration }. Also recorder:recording / playing / paused / rewinding / ready."],
      ["yeet.recorder(el)", "js", "Returns { record, play, pause, stop, rewind, mode, position, clip }."],
      [".y-blueprint", "class", "Blueprint spec sheet: __head (__title, __sub, __planet), __stage, __foot."],
      [".y-callout[data-target]", "element", "Label in the stage. A line is drawn from it to the target selector. data-side=\"right\", data-tx / data-ty (0-1) pick the spot on the target."],
    ],
  },
  {
    id: "receipt-machine", name: "Receipt Machine", emoji: "🧾", category: "Widgets", tile: "tall", color: "orange",
    desc: "A chunky POS terminal for checkout and receipt pages. Items beep onto the amber screen, PAY runs a fingerprint scan, cha-chings when approved, then the receipt feeds out of the slot line by line with thermal-printer sounds. Tap the receipt to tear it off into a tray (or it tears itself). The keypad works too: type an amount, # adds it, PAY charges it. All sounds are synthesized, no audio files.",
    mini: `<div class="y-pos" data-pos style="--w:150px"></div>`,
    groups: [
      { label: "Receipt page", hint: "add stuff → Checkout (or PAY / Enter on the machine) · tap the receipt to tear", layout: "block", html: `
<div class="y-checkout">
  <div class="y-cart" data-bag="#shopPos">
    <!-- your products: copy a line, change data-name / data-price (data-emoji, data-was optional) -->
    <h3 class="y-cart__title">your bag 🛍️</h3>
    <button class="y-cart__item" data-name="Oversized Hoodie" data-price="48" data-emoji="🧥"><span>🧥 Oversized Hoodie</span><b>$48</b></button>
    <button class="y-cart__item" data-name="Chunky Sneakers" data-price="120" data-emoji="👟"><span>👟 Chunky Sneakers</span><b>$120</b></button>
    <button class="y-cart__item" data-name="Bucket Hat" data-price="22.5" data-emoji="🧢"><span>🧢 Bucket Hat</span><b>$22.50</b></button>
    <button class="y-cart__item" data-name="Iced Oat Latte" data-price="6.25" data-emoji="🧋"><span>🧋 Iced Oat Latte</span><b>$6.25</b></button>
    <button class="y-btn y-btn--pink" data-pos-checkout="#shopPos" style="width:100%;margin-top:.5rem">Checkout →</button>
  </div>
  <div class="y-pos" id="shopPos" style="--w:320px" data-pos data-store="Yeet/Shop" data-tray="#receiptTray"></div>
  <div class="y-receipt-tray" id="receiptTray"></div>
</div>` },
      { label: "Café · tip on screen", hint: "PAY → pick a tip with 1 / 2 / 3 (0 = none) · kraft paper", layout: "block", html: `
<div class="y-checkout">
  <div class="y-cart" data-bag="#cafePos">
    <!-- your products: copy a line, change data-name / data-price (data-emoji, data-was optional) -->
    <h3 class="y-cart__title">order for Sam ☕</h3>
    <button class="y-cart__item" data-name="Iced Oat Latte" data-price="5.75" data-emoji="🧋"><span>🧋 Iced Oat Latte</span><b>$5.75</b></button>
    <button class="y-cart__item" data-name="Matcha Cloud" data-price="6.25" data-emoji="🍵"><span>🍵 Matcha Cloud</span><b>$6.25</b></button>
    <button class="y-cart__item" data-name="Almond Croissant" data-price="4.5" data-emoji="🥐"><span>🥐 Almond Croissant</span><b>$4.50</b></button>
    <button class="y-btn" data-pos-checkout="#cafePos" style="width:100%;margin-top:.5rem;--bg:#7a4a2a;color:#fbefe0">Pay →</button>
  </div>
  <div class="y-pos" id="cafePos" data-pos data-theme="cafe" data-tray="#cafeTray" style="--w:300px"></div>
  <div class="y-receipt-tray" id="cafeTray"></div>
</div>` },
      { label: "Restaurant · split the bill", hint: "tip prompt + split 2 ways on the receipt", layout: "block", html: `
<div class="y-checkout">
  <div class="y-cart" data-bag="#dinePos">
    <!-- your products: copy a line, change data-name / data-price (data-emoji, data-was optional) -->
    <h3 class="y-cart__title">table 12 🍜</h3>
    <button class="y-cart__item" data-name="Spicy Miso Ramen" data-price="17" data-emoji="🍜"><span>🍜 Spicy Miso Ramen</span><b>$17</b></button>
    <button class="y-cart__item" data-name="Gyoza (6)" data-price="9" data-emoji="🥟"><span>🥟 Gyoza (6)</span><b>$9</b></button>
    <button class="y-cart__item" data-name="Yuzu Soda" data-price="4.5" data-emoji="🍋"><span>🍋 Yuzu Soda</span><b>$4.50</b></button>
    <button class="y-btn" data-pos-checkout="#dinePos" style="width:100%;margin-top:.5rem;--bg:var(--y-pink)">Get the bill →</button>
  </div>
  <div class="y-pos" id="dinePos" data-pos data-theme="restaurant" data-split="2" data-tray="#dineTray" style="--w:300px"></div>
  <div class="y-receipt-tray" id="dineTray"></div>
</div>` },
      { label: "Grocery · member deals", hint: "unit prices + you-saved line (data-was on items)", layout: "block", html: `
<div class="y-checkout">
  <div class="y-cart" data-bag="#groPos">
    <!-- your products: copy a line, change data-name / data-price (data-emoji, data-was optional) -->
    <h3 class="y-cart__title">weekly shop 🛒</h3>
    <button class="y-cart__item" data-name="Avocado" data-price="1.25" data-was="1.75" data-emoji="🥑"><span>🥑 Avocado <s style="opacity:.5">$1.75</s></span><b>$1.25</b></button>
    <button class="y-cart__item" data-name="Sourdough" data-price="5.5" data-emoji="🍞"><span>🍞 Sourdough</span><b>$5.50</b></button>
    <button class="y-cart__item" data-name="Oat Milk 1L" data-price="2.99" data-was="3.49" data-emoji="🥛"><span>🥛 Oat Milk 1L <s style="opacity:.5">$3.49</s></span><b>$2.99</b></button>
    <button class="y-cart__item" data-name="Strawberries" data-price="3.8" data-emoji="🍓"><span>🍓 Strawberries</span><b>$3.80</b></button>
    <button class="y-btn" data-pos-checkout="#groPos" style="--bg:var(--y-lime);width:100%;margin-top:.5rem">Checkout →</button>
  </div>
  <div class="y-pos" id="groPos" data-pos data-theme="grocery" data-tray="#groTray" style="--w:300px"></div>
  <div class="y-receipt-tray" id="groTray"></div>
</div>` },
      { label: "Event tickets · stub + seats", hint: "prints a ticket: ADMIT n, seats, gate, perforation, QR-style code", layout: "block", html: `
<div class="y-checkout">
  <div class="y-cart" data-bag="#gigPos">
    <!-- your products: copy a line, change data-name / data-price (data-emoji, data-was optional) -->
    <h3 class="y-cart__title">Night Drive Tour 🎟️</h3>
    <button class="y-cart__item" data-name="General Admission" data-price="35" data-emoji="🎫"><span>🎫 General Admission</span><b>$35</b></button>
    <button class="y-cart__item" data-name="Front Row" data-price="80" data-emoji="🔥"><span>🔥 Front Row</span><b>$80</b></button>
    <button class="y-cart__item" data-name="Tour Tee" data-price="28" data-emoji="👕"><span>👕 Tour Tee</span><b>$28</b></button>
    <button class="y-btn" data-pos-checkout="#gigPos" style="--bg:var(--y-purple);color:#fff;width:100%;margin-top:.5rem">Get tickets →</button>
  </div>
  <div class="y-pos" id="gigPos" data-pos data-theme="ticket" data-tray="#gigTray" style="--w:300px"></div>
  <div class="y-receipt-tray" id="gigTray"></div>
</div>` },
      { label: "Static receipt", hint: "for order-confirmation pages · yeet.receiptHTML(data)", html: `
<div class="y-receipt-wrap" style="width:250px">
  <div class="y-receipt">
    <div class="y-receipt__head">
      <span class="y-receipt__store">✦ Yeet/Shop ✦</span>
      <span class="y-receipt__muted">2026-11-28 14:05 · #4242</span>
    </div>
    <hr>
    <div class="y-receipt__row"><span>2× Oversized Hoodie</span><span>$96.00</span></div>
    <div class="y-receipt__row"><span>Bucket Hat</span><span>$22.50</span></div>
    <hr>
    <div class="y-receipt__row y-receipt__total"><span>TOTAL</span><span>$127.98</span></div>
    <div class="y-receipt__row"><span>TAP · CONTACTLESS</span><span class="y-receipt__stamp">PAID</span></div>
    <div class="y-receipt__foot">thank u, bestie ♡</div>
  </div>
</div>` },
    ],
    extraCode: [{ lang: "js", label: "your own products from JS / an API", src: `
const bag = yeet.bag(document.querySelector("[data-bag]"));
const products = await fetch("/api/products").then((r) => r.json());
bag.setProducts(products.map((p) => ({
  name: p.title,          // shown in the bag + on the receipt
  price: p.price,         // number
  emoji: p.emoji,         // optional
  was: p.compareAtPrice,  // optional: prints MEMBER DEAL + YOU SAVED
})));` }, { lang: "js", label: "control it from JS", src: `
const pos = yeet.pos(document.querySelector("#shopPos"));
pos.add({ name: "Oversized Hoodie", price: 48, qty: 2 });
const receipt = await pos.checkout(); // resolves once the paper is out
pos.tear();     // rip it off (flies into data-tray if set)
pos.reprint();  // prints a COPY of the last receipt
pos.setQty("Oversized Hoodie", 3); // 0 removes the line
pos.remove("Bucket Hat");
pos.clear();    // empty the cart

pos.el.addEventListener("pos:printed", (e) => {
  console.log(e.detail.receipt); // { no, items, subtotal, tax, total, date, ... }
});

// render a receipt anywhere without the machine:
document.querySelector("#order").innerHTML = yeet.receiptHTML(receipt);` }],
    api: [
      ["[data-pos]", "attribute", "Root (.y-pos). Leave it empty: yeet.init() builds the screen, keypad, PAY key, fingerprint pad and paper slot."],
      ["data-tray", "attribute", "Selector of a .y-receipt-tray. Torn receipts fly into it and pile up (newest on top)."],
      ["data-theme", "attribute", "Use-case preset: cafe (latte casing, tip prompt, kraft paper), restaurant (black casing, tip + split bill), grocery (green, unit prices, member savings), ticket (purple, ADMIT n stub with seats + QR-style code). Leave off for the streetwear default."],
      ["data-tip=\"0.1,0.15,0.2\"", "attribute", "Ask for a tip on the screen after PAY: 1 / 2 / 3 pick, 0 = none, PAY = the middle one. data-tip=\"\" turns a preset's tip off."],
      ["data-split", "attribute", "Adds a SPLIT n WAYS line with the per-person amount."],
      ["data-was", "attribute", "On a data-pos-add button: the old price. Prints a MEMBER DEAL line and YOU SAVED total."],
      ["data-paper", "attribute", "Receipt paper: kraft or ticket (presets set it for you)."],
      ["data-store / data-address / data-footer", "attribute", "Text printed on the receipt."],
      ["data-currency / data-locale", "attribute", "Money format (default USD / en-US)."],
      ["data-tax", "attribute", "Tax rate, e.g. 0.08 (default). 0 hides the tax line."],
      ["data-auto-tear", "attribute", "Seconds before a printed receipt tears itself into the tray (default 2.2, 0 = wait for a tap)."],
      ["data-pos-add=\"#pos\"", "attribute", "On any button: adds data-name / data-price (/ data-qty) to that machine."],
      ["data-pos-checkout=\"#pos\"", "attribute", "On any button: starts checkout."],
      [".y-cart[data-bag=\"#pos\"]", "class", "Editable shopping bag tied to a machine. Your products are .y-cart__item buttons (data-name, data-price, optional data-emoji / data-was). Shoppers tap to add, then change qty with − / + or ✕ to remove; the machine total and receipt follow."],
      ["data-products='[…]'", "attribute", "On the bag: a JSON list of products to render instead of writing the buttons by hand."],
      ["yeet.bag(el, { products })", "js", "Same from JS. bag.setProducts([...]) swaps the catalog later (e.g. after a fetch)."],
      ["pos.setQty(name, n) / pos.remove(name)", "js", "Edit the cart from your own UI. Every change fires pos:change with { cart, subtotal }."],
      ["--w / --shell / --accent / --key", "css var", "Size, casing color, PAY key + brand color, key color."],
      ["Keyboard", "attribute", "With focus on the machine: digits type an amount, # adds it, Enter pays, Backspace deletes, Esc clears."],
      ["pos:add / checkout / printed / tear / clear", "event", "detail has the cart or the receipt object."],
      ["yeet.pos(el)", "js", "Returns { add, checkout, reprint, tear, clear, press, cart, subtotal, last }."],
      [".y-receipt / .y-receipt-wrap", "class", "Zig-zag paper receipt (wrap adds the shadow). Parts: __head, __store, __row, __total, __stamp, __barcode, __foot."],
      ["yeet.receiptHTML(data)", "js", "Builds receipt markup from { no, store, items, subtotal, tax, total, date, ... }."],
    ],
  },
  {
    id: "keyboard", name: "Keyboard", emoji: "⌨️", category: "Widgets", tile: "wide", color: "purple",
    desc: "A 65% mechanical keyboard that mirrors your real one: every key you press goes down on screen with a synthesized switch sound (thock, clicky or creamy). Tap the caps to type on touch screens, spin the knob for volume, and watch your WPM on the little display. Comes in four themes and works as an on-screen keyboard for any input, or as a typing test.",
    mini: `<div class="y-kbd" data-kbd style="--w:300px"></div>`,
    groups: [
      { label: "Board", hint: "type on your keyboard · click the caps · drag / scroll the knob", layout: "block", html: `
<div class="y-kbd" data-kbd></div>` },
      { label: "Themes", hint: "data-theme = retro · cyber (rgb ripples + underglow) · pastel", layout: "block", html: `
<div style="display:grid;grid-template-columns:minmax(0,1fr);gap:2.2rem;justify-items:center">
  <div class="y-kbd" data-kbd data-theme="retro" data-brand="office" data-sound="clicky" style="--w:640px"></div>
  <div class="y-kbd" data-kbd data-theme="cyber" data-brand="n30n" style="--w:640px"></div>
  <div class="y-kbd" data-kbd data-theme="pastel" data-brand="mochi" data-sound="creamy" style="--w:640px"></div>
</div>` },
      { label: "Use case · typing test", hint: "start typing the line · ↻ for a new one", layout: "block", html: `
<div style="max-width:760px;margin-inline:auto">
  <div class="y-kbd-test" data-kbd-test="#testKbd"></div>
  <div class="y-kbd" id="testKbd" data-kbd data-theme="cyber" data-brand="speed"></div>
</div>` },
      { label: "Use case · on-screen keyboard", hint: "tap the caps to type into the field (kiosks, touch screens, password-free search)", layout: "block", html: `
<div style="max-width:760px;margin-inline:auto;display:grid;grid-template-columns:minmax(0,1fr);gap:1rem">
  <label class="y-field"><span class="y-label">Search the drop</span>
    <input class="y-input" id="kbdField" placeholder="tap the keys below…" autocomplete="off" />
  </label>
  <div class="y-kbd" data-kbd data-target="#kbdField" data-theme="pastel" data-sound="creamy"></div>
</div>` },
    ],
    extraCode: [{ lang: "js", label: "control it from JS", src: `
const board = yeet.kbd(document.querySelector("[data-kbd]"));
board.setProfile("clicky");   // "thock" | "clicky" | "creamy"
board.setVolume(0.5);         // 0 – 1 (the knob does this too)
board.press("KeyA");          // press a key by its KeyboardEvent.code
board.text;                   // what's on the little display

board.el.addEventListener("kbd:type", (e) => {
  console.log(e.detail);      // { char: "a" } · { back: true } · { enter: true }
});

// typing test results
document.querySelector("[data-kbd-test]").addEventListener("kbd:result", (e) => {
  console.log(e.detail);      // { wpm, accuracy, seconds }
});` }],
    api: [
      ["[data-kbd]", "attribute", "Root (.y-kbd). Leave it empty: yeet.init() builds the case, display, sound switch, knob and 68 keys."],
      ["--w", "css var", "Board width (default 760px). Everything scales with it."],
      ["data-theme", "attribute", "retro (beige office), cyber (neon legends, RGB ripples, underglow), pastel (lilac candy). Default: yeet."],
      ["data-sound", "attribute", "Starting switch sound: thock (default), clicky, creamy. Also switchable on the board."],
      ["data-volume", "attribute", "Starting volume 0 – 1 (default 0.8). The knob: drag up/down, scroll, or arrow keys."],
      ["data-target=\"#input\"", "attribute", "Tapped keys type into that input / textarea (Shift is one-shot, Enter submits the form)."],
      ["data-rgb", "attribute", "RGB ripple on every press (on by default in cyber)."],
      ["data-brand", "attribute", "Badge text on the case."],
      ["kbd:type", "event", "Every typed character: { char } or { back: true } or { enter: true }."],
      ["[data-kbd-test=\"#board\"]", "attribute", "Typing test linked to a board: live WPM, accuracy, time; green when done. data-text sets your own line. Fires kbd:result."],
      ["--alpha / --mod / --acc1 / --acc2 / --space", "css var", "Keycap colors (and --alpha-ink, --mod-ink …) to make your own colorway."],
      ["yeet.kbd(el)", "js", "Returns { press, setProfile, setVolume, profile, volume, text, clear, destroy }."],
    ],
  },
];

export const colors = ["ink", "paper", "white", "lime", "pink", "blue", "orange", "purple", "yellow", "mint", "muted"];
