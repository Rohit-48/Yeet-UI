/* ============================================
   Component registry — single source of truth for the showcase.
   Each entry renders: bento tile (mini), detail section (groups),
   code tab (groups' HTML + optional extra code) and API table.
   ============================================ */

export const categories = ["Actions", "Forms", "Display", "Navigation", "Overlays", "Feedback"];

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
];

export const colors = ["ink", "paper", "white", "lime", "pink", "blue", "orange", "purple", "yellow", "mint", "muted"];
