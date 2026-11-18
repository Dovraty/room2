# Prompt pack: editorial-brutalist template store UI

These prompts recreate the *style* of codeandchill.store: a warm off-white editorial layout with hard black borders, offset-shadow hover lifts, one red accent, and small, snappy motion. They don't copy that site's brand. Swap in your own name, logo and copy (`[BRAND]` below).

Use them in order: **Prompt 0** sets the design system, and each later prompt adds one piece. Paste Prompt 0 into every new chat so the AI keeps the same tokens.

---

## Prompt 0: Design system (paste this first, every time)

```
You are building a storefront for selling website templates. Use plain HTML, CSS and vanilla JS (no framework). Follow this design system exactly.

AESTHETIC
Editorial brutalism. Warm off-white "paper" background, near-black ink, ONE saturated red-orange accent. Square corners everywhere (border-radius: 0), except the inline like-pill. Heavy 2px black rules for borders. No gradients, no soft blurred shadows. Depth comes only from hard offset shadows like "3px 3px 0 var(--ink)". It should feel like a printed catalogue: dense, confident, tidy.

TOKENS (define on :root)
--paper: #f0eee9;  --surface: #fff;  --tray: #0000000d;
--ink: #201e1d;  --ink-70: #201e1db3;  --ink-50: #201e1da8;  --ink-25: #201e1d40;  --ink-12: #201e1d1f;
--accent: #ec3013;  --accent-soft: #ec30131f;  --accent-ink: #b8240c;
--buy-bg: #d42a0f;  --buy-fg: #fff;
--rule: 2px solid var(--ink);   --hairline: 1.5px solid var(--ink-25);
--space-1: .375rem; --space-2: .75rem; --space-3: 1.125rem; --space-4: 1.75rem; --space-5: 2.75rem; --space-6: 4.5rem;
--step-0: clamp(.95rem, .92rem + .15vw, 1.05rem);
--step-1: clamp(1.15rem, 1.05rem + .5vw, 1.45rem);
--step-2: clamp(1.5rem, 1.25rem + 1.2vw, 2.1rem);
--step-3: clamp(2rem, 1.4rem + 3vw, 3.6rem);
--page: 76rem (84rem at ≥84rem viewport, 94rem at ≥100rem);  --measure: 62ch;
--ease: cubic-bezier(.2,.7,.2,1);        /* default UI ease */
--ease-land: cubic-bezier(.22,1,.36,1);  /* overshoot-free "landing" ease */
--ease-scry: cubic-bezier(.55,.08,.4,.95); /* slow-in/slow-out for 3D reveals */
--beat: .32s;                             /* standard transition duration */

DARK THEME (via [data-theme="dark"] on <html>, and prefers-color-scheme when unset)
--paper: #171615; --surface: #201e1d; --tray: #ffffff0d; --ink: #f0eee9 (+ matching alpha steps);
--accent: #ff5c3d; --accent-soft: #ff5c3d29; --accent-ink: #ff7a5f; --buy-bg: #ff5c3d; --buy-fg: #171615.
Add an inline <head> script that reads the stored theme from localStorage and sets data-theme BEFORE first paint, so the page never flashes.

TYPE
Font: "Archivo" (variable, from Google Fonts), fallback "Helvetica Neue", system-ui. Mono: ui-monospace, "SF Mono", Menlo.
Headlines: weight 700, letter-spacing -0.035em, line-height ~1.02, text-wrap: balance.
Labels: 600 .75rem, uppercase, letter-spacing .06em, color var(--ink-50).
UI text (buttons, nav, chips): 600 .875rem.

PAGE WIDTH: .page { width: min(100% - 2.5rem, var(--page)); margin-inline: auto; }

MOTION RULES
Motion is short and functional, 160–520ms, never decorative loops (except skeleton pulse).
Every animation must be disabled under prefers-reduced-motion: reduce
(*, ::before, ::after { animation-duration: .001ms !important; transition-duration: .001ms !important; animation-iteration-count: 1 !important; }).
```

---

## Prompt 1: Sale bar and sticky header

```
Using the design system above, build the top of the page:

1. Announcement bar: full-width, background var(--buy-bg), white text, centered, 600 .75rem uppercase, letter-spacing .06em, ~32px tall. Text: "FLAT SALE · 30% OFF".

2. Sticky header: position: sticky; top: 0; z-index: 40;
   background: color-mix(in srgb, var(--paper) 88%, transparent); backdrop-filter: blur(10px); border-bottom: var(--rule).
   Inner layout: CSS grid, columns "1fr auto 1fr", min-height 4rem.
   - Left: logo. A code-bracket mark "<·‿·>" in the accent colour (brackets forming a smiley face) + wordmark "[BRAND]" in 700 weight, with a small connective word in accent colour and lighter weight between two bold words. Hover: opacity .75.
   - Center: nav links (New, Bundles, Components, Templates, FAQ). 600 .875rem, color var(--ink-70) → var(--ink) on hover.
     ANIMATED UNDERLINE: each link has ::after, 2px tall, currentColor, positioned bottom .2rem, left/right .75rem,
     transform: scaleX(0); transform-origin: right; transition: transform .45s var(--ease-land).
     On hover/current page: scaleX(1) with transform-origin: left, so the line wipes in from the left and exits to the right.
   - Right: a search field (2px ink border, white surface, round black icon circle on the left, placeholder "Search templates & components", a small "⌘K" key hint box on the right), then two 44px square icon buttons with 2px borders: theme toggle (moon/sun) and cart.
   THEME TOGGLE ANIMATION: when the icon swaps, the new glyph plays
   @keyframes glyph-spin { 0% { opacity: 0; transform: rotate(-150deg) scale(.5) } } over .52s var(--ease-land).
   CART COUNT BADGE: when the count changes, re-trigger
   @keyframes count-pop { 0% { transform: scale(.4) } 55% { transform: scale(1.3) } 100% { transform: scale(1) } } .42s var(--ease-land).
   On mobile, the nav becomes a horizontally scrollable row with hidden scrollbar.
```

---

## Prompt 2: Hero section

```
Build a two-column hero (stacks on mobile) inside .page, generous top padding (~var(--space-6)).

LEFT column:
- H1 "Animated templates for client sites". The last two words are in var(--accent). font-size clamp(2.25rem, 1.4rem + 2.6vw, 3.5rem), weight 700, letter-spacing -0.035em, line-height 1.02.
- Lead paragraph in var(--ink-70), ~1.35rem: "Plain HTML, CSS and JavaScript — no framework, no account. Open the folder, change what you like, ship it."
- Two buttons:
  .btn base: min-height 3rem, padding 0 var(--space-3), border var(--rule), font 600 .875rem, square corners,
  transition: transform var(--beat) var(--ease), background var(--beat) var(--ease), color var(--beat) var(--ease).
  :hover → translateY(-2px); :active → translateY(0).
  .btn--fill: ink background, paper text; hover → accent background + accent border.
  .btn--ghost: transparent; hover → var(--accent-soft) background.
  Labels: "Browse 195 templates" (fill), "Browse 76 components" (ghost).
- "Popular:" label + row of chips. Chip: 1.5px solid var(--ink-25) border, 600 .8125rem, padding .375rem .625rem; hover → border var(--ink); pressed → ink bg, paper text. Transition background/color/border-color over var(--beat).
- Trust list: small (.8rem) items each prefixed with a red ✓ check: "14-day refund", "Secure checkout", "Free updates for life", "Unlimited client projects". Wrap with gaps.

RIGHT column: a "featured preview" figure.
- 2px ink border. Top bar (figcaption): white surface, border-bottom var(--rule), padding .75rem 1rem, "<strong>Verdin</strong> · template" on the left and an uppercase underlined "SEE IT →" label link on the right.
- Below it a 16:9 video "reel" (see Prompt 4) showing a looping screen recording of a template.
```

---

## Prompt 3: Product card grid with hover lift

```
Build a section "Most wanted this week" with a header row: H2 (700, var(--step-2)) on the left, uppercase underlined "ALL TEMPLATES →" link on the right.
Below it a 2-column grid (1 column on mobile), gap var(--space-3).

Each item is a .card-shell (position: relative; display: grid) containing:
  a) <a class="card"> — the whole card is one link. border: var(--rule); background: var(--surface);
     transition: transform var(--beat) var(--ease), box-shadow var(--beat) var(--ease).
     - .card__flag (optional): absolutely positioned top-left, buy-red background, white 600 .625rem uppercase text, letter-spacing .06em, padding .25rem .5rem. e.g. "7 PEOPLE PICKED IT THIS WEEK".
     - .reel (16:9 looping preview video, Prompt 4), with border-bottom var(--rule).
     - .card__body (padding var(--space-3)):
        Row 1: product name (600, 1.05rem) left; price cluster right: "$91" bold, "$130" struck-through in ink-50, and a "−30%" tag (600 .688rem, color accent-ink, background accent-soft, padding .2em .45em).
        Row 2: one-line tagline in ink-70.
        Row 3: meta labels in uppercase .75rem letter-spaced: "167 KB · 1 DEP · LAYOUT · 5.3K VIEWS".
  b) .card__actions: absolutely positioned top-right (top/right .5rem), two 40px square buttons with var(--rule) border and white surface: a heart (like) and a cart-plus (add to cart).
  c) An inline like count at bottom-right of the body: small heart + number ("♡ 30") or "♡ LIKE".

HOVER LIFT (the signature interaction):
  .card-shell:hover > .card, .card:focus-visible { transform: translate(-3px,-3px); box-shadow: 3px 3px 0 var(--ink); }
  The overlay buttons (b) and inline like (c) must ALSO translate(-3px,-3px) on .card-shell:hover (and on .card-shell:has(> .card:focus-visible)) with the same transition, so they move together with the card instead of staying behind.

Cart button states: hover → ink background, paper icon; data-in-cart="true" → accent background & border, white icon.
Like button: when aria-pressed="true", heart fills with accent and plays
  @keyframes like-pop { 50% { transform: scale(1.3) } } over .32s var(--ease) (only under prefers-reduced-motion: no-preference).

Generate 6 sample products with made-up names (short invented two-syllable names) and SaaS dashboard-style taglines.
```

---

## Prompt 4: Video "reel" previews (lazy, autoplay in view)

```
Create a reusable .reel component for template previews:
- Markup: <div class="reel" data-shape="wide|tall"><video class="reel__video" muted loop playsinline disablepictureinpicture preload="none" poster="..."><source src="..." type="video/mp4"></video></div>
- CSS: .reel { position: relative; overflow: hidden; background: var(--tray); aspect-ratio: 16/9 } ; [data-shape="tall"] → 9/16.
  .reel__video { width:100%; height:100%; object-fit: cover; display:block; background: var(--tray) }.
- JS (vanilla):
  1. Lazy-load: an IntersectionObserver with rootMargin "120px" sets the poster/src only when the reel approaches the viewport, then disconnects.
  2. Play/pause: a second IntersectionObserver with threshold .5 calls video.play() (catch and ignore rejections) when ≥50% visible and pause() when not, so only on-screen reels use CPU.
  3. If prefers-reduced-motion: reduce, never autoplay. Instead show a .reel__play overlay: a semi-transparent paper wash (color-mix(in srgb, var(--paper) 72%, transparent)) with a centred 3rem square play button (var(--rule) border, white surface) that turns accent on hover. Clicking it plays the video.
  4. Detect the poster's natural aspect ratio on load and set data-shape to "wide" or "tall" automatically.
- Use placeholder videos (or a CSS-animated mock dashboard inside the reel) if no real recordings exist.
```

---

## Prompt 5: Bundle cards, "What you get" panel, featured grid

```
Add three more home sections, all using the existing tokens:

1. BUNDLES: a 4-column grid (2 on tablet, 1 on mobile). Each bundle card: var(--rule) border, white surface, a dark 16:9 thumbnail strip on top, then title (700, 1.1rem), a 2-line description in ink-70 (clamped with -webkit-line-clamp: 2), and a price row: "$9,757" bold, struck old price, "−25%" accent-soft tag. Same hover lift as product cards (translate(-3px,-3px) + 3px 3px 0 ink shadow).
   Titles: "Every template", "All dashboards", "Login & sign-up forms", "Shop templates".

2. "WHAT YOU GET" panel: full page width, background var(--tray) (subtle grey wash), border-top var(--rule), padding var(--space-4).
   An uppercase label "WHAT YOU GET", then a paragraph (max-width ~ 34rem, step-1, ink-70) explaining that each product is a small folder of plain HTML/CSS/JS with a README and a Vite setup — no account needed.

3. "FEATURED" section: uppercase label left, "ALL 195 →" link right, then the same 2-column product card grid from Prompt 3.

Section rhythm: margin-block var(--space-6) between sections.
```

---

## Prompt 6: ⌘K command palette (3D "flip-down" reveal)

```
Add a command palette opened by ⌘K / Ctrl+K or by clicking the header search field.

- Backdrop: position fixed, inset 0, z-index 60, background color-mix(in srgb, var(--ink) 32%, transparent),
  display grid, justify-items center, align-content start, padding-top clamp(1rem, 8vh, 6rem).
  Animation: @keyframes fade { 0% { opacity: 0 } } .16s var(--ease).
- Panel: width min(100%, 34rem), var(--rule) border, white surface, transform-origin: 50% 0 (top edge).
  SIGNATURE ANIMATION — it swings down like a hinged sign:
  @keyframes palette-turn {
    0%   { opacity: 0; transform: perspective(1400px) rotateX(-62deg); }
    35%  { opacity: 1; }
    100% { transform: perspective(1400px) rotateX(0deg); }
  }
  animation: palette-turn .42s var(--ease-scry);
- Top bar: large borderless input (500 1rem, padding var(--space-3)) + a close "×" button that rotates 90° on hover (transition transform .26s var(--ease-land)).
- Results list: max-height min(24rem, 50vh), scrollable, grouped with small uppercase group labels ("Templates", "Components", "Bundles"). Items are flex rows with name left and price/kind right; the active item (arrow keys) gets background var(--accent-soft). Enter navigates; Esc closes; focus is trapped inside while open and restored to the trigger on close.
- Filter the items live as the user types (case-insensitive substring).
```

---

## Prompt 7: Cart drawer and toast

```
1. CART DRAWER: clicking the cart icon opens a right-side drawer.
   Backdrop same as the palette (ink at 32%, fade .16s). Drawer: width min(100%, 28rem), full height, background var(--paper), border-left var(--rule).
   @keyframes slide-in { 0% { transform: translate(100%) } } .24s var(--ease).
   Contents: header "Your cart" + close button, line items (thumb, name, price, remove), subtotal, and a full-width BUY button:
   background var(--buy-bg), color var(--buy-fg), var(--rule) border; hover → box-shadow: 3px 3px 0 var(--ink) and translate(-2px,-2px); active → no shadow.

2. TOAST: when an item is added, show a toast bottom-right.
   var(--rule) border, white surface, hard shadow 6px 6px 0 var(--ink).
   @keyframes toast-in { 0% { opacity: 0; transform: translateY(12px) } } .26s var(--ease).
   A 3px accent progress bar along the bottom shrinks to zero over the toast's lifetime (4s):
   @keyframes toast-timer { 100% { transform: scaleX(0) } } linear forwards, transform-origin: left.
   Pause the timer (animation-play-state: paused) while hovered. Under reduced motion: no slide, hide the timer bar.

Clicking "add to cart" on a card must: flip that card's cart button to the in-cart accent state, bump the header count with count-pop, and show the toast.
```

---

## Prompt 8: Loading skeleton and page transitions

```
1. BOOT SKELETON: before content loads, render a .boot grid: a brand row (a 10px accent square + bold brand name) and a grid of placeholder tiles
   (grid-template-columns: repeat(auto-fill, minmax(min(100%, 17rem), 1fr))). Each tile: background var(--tray), border var(--hairline),
   animation: boot-pulse 1.2s var(--ease) infinite alternate; with @keyframes boot-pulse { 100% { opacity: .45 } }.

2. PAGE TRANSITIONS: when navigating from a product card to its detail page, use the View Transitions API
   (document.startViewTransition, or @view-transition { navigation: auto } for multi-page sites).
   Give the card's .reel and the detail page's hero video the same view-transition-name: product-stage so the preview morphs into place.
   ::view-transition-old(product-stage), ::view-transition-new(product-stage) { animation-duration: .42s; animation-timing-function: var(--ease); object-fit: cover; height: 100% }
   Only enable this inside @media (prefers-reduced-motion: no-preference). Fall back to an instant navigation where unsupported.

3. Small reveals (dropdowns, hints) use @keyframes rise { 0% { opacity: 0; transform: translateY(-8px) } } over var(--beat) var(--ease).
```

---

## One-shot version (if you want a single prompt)

```
Build a single-page storefront for website templates in plain HTML/CSS/vanilla JS with an "editorial brutalist" look:
warm paper background #f0eee9, ink #201e1d, one red accent #ec3013, white card surfaces, square corners, 2px solid ink borders,
and NO soft shadows. Depth comes only from hard offset shadows (3px 3px 0 ink). Font: Archivo (700 for headlines, tight -0.035em tracking;
600 uppercase .06em-tracked micro-labels). Include a dark theme (#171615 paper, #f0eee9 ink, #ff5c3d accent) with no flash on load.

Sections: red sale bar → sticky blurred header (logo, nav with wipe-in underlines, search with ⌘K hint, theme + cart square buttons)
→ two-column hero (big headline with accent words, lead, fill + ghost buttons that lift 2px on hover, chips, ✓ trust list, framed looping video preview)
→ "Most wanted" 2-col product cards (red corner flag, 16:9 looping video, name, $now / struck $was / −30% tag, uppercase meta, overlay like + cart buttons)
→ 4 bundle cards → grey "What you get" panel → featured grid → footer.

Motion (all with ease cubic-bezier(.2,.7,.2,1), 160–520ms, all disabled under prefers-reduced-motion):
- Cards: hover → translate(-3px,-3px) + 3px 3px 0 ink shadow; overlay buttons move with the card.
- Nav underline: scaleX 0→1, origin swaps left/right, .45s cubic-bezier(.22,1,.36,1).
- Like: heart fills accent and pops scale 1.3 at 50%.
- Cart count: pops .4→1.3→1. Theme icon: spins in from -150deg, scale .5.
- ⌘K palette swings down from its top edge: perspective(1400px) rotateX(-62deg) → 0 over .42s cubic-bezier(.55,.08,.4,.95), backdrop fades in .16s.
- Cart drawer slides in from the right (.24s); toast rises 12px with a shrinking 3px accent timer bar; close icons rotate 90° on hover.
- Videos lazy-load near the viewport and only play while ≥50% visible.
- Skeleton tiles pulse opacity 1→.45; card→detail uses a View Transition named "product-stage".
Use invented product names and placeholder media.
```
