# Ever RSVP — Event Website Builder

A minimalist event-website builder where a customer picks one of **27 premium
designs** — 8 bespoke page layouts across 7 occasion types (weddings, birthdays,
anniversaries, housewarmings, baptisms & christenings, baby showers & kids, galas
& evening events) — pays once, and edits every word, photo and color of their
event site in a live editor.

**The product is 100% plain HTML / CSS / JavaScript.** No framework, no build step,
no database. Next.js exists only as the local dev/preview static file server.

---

## 1. The stack, plainly

| Layer | What is used | Where | Why |
|---|---|---|---|
| Frontend (the product) | HTML5 + CSS3 + vanilla JS (IIFE modules) | `public/` | Zero dependencies, loads anywhere, trivially deployable |
| Fonts | Google Fonts CDN (Cormorant Garamond, Playfair Display, Cinzel, Pacifico, Baloo 2, Lato, …) | `<link>` in each page | Elegant serif/sans/script pairings per layout, no files to host |
| Images | 21 static JPGs (20 site photos + OG share image) | `public/assets/` | AI-generated at build time, committed as files |
| Data storage | Browser `localStorage` | `public/js/*.js` | The editor saves the event state on the customer's device |
| Dev/preview server | Next.js 16 (`next dev`) | repo root | Only serves `public/` on port 3000 for the sandbox preview panel |
| Lint | ESLint 9 + eslint-config-next | `eslint.config.mjs` | Checks the tiny TypeScript server shell |
| Deploy target | Any static host | `public/` | Copy the folder to nginx / Caddy / Netlify / S3 — done |

**Dependencies:** `next`, `react`, `react-dom` (React is required internally by
Next.js itself — **no React code exists in the product**), plus dev-only
TypeScript/ESLint tooling. That's all.

---

## 2. File map (everything there is)

```
public/                     ← THE ENTIRE PRODUCT (deploy this folder)
├── index.html              Landing page (hero, features, designs, FAQ, demo modal)
├── create.html             Design gallery: 27 designs across 8 layouts + "Create your own design"
├── checkout.html           One-time $25 payment page (order summary + card form)
├── editor.html             The builder: left panel of controls + live preview
├── layouts-test.html       Internal QA harness: renders every layout × theme in one page.
│                           Not linked from the site, carries `noindex, nofollow`
├── styles.css              The whole design system (~3,400 lines, one file)
├── css/                    8 layout stylesheets — plain static assets, loaded after
│                           styles.css: ly-royal, ly-bloom, ly-fiesta, ly-play,
│                           ly-cinema, ly-nest, ly-lumen, ly-noir
├── robots.txt              Search-engine rules (funnel pages disallowed)
├── sitemap.xml             XML sitemap (indexable pages only)
├── assets/                 21 JPGs — 20 site photos + og-cover.jpg (social share)
└── js/                     14 vanilla-JS modules, each one job:
    ├── app.js              Shared UI: toast, mobile menu, reveal animations,
    │                       carousel, FAQ accordion, demo modal, footer year
    ├── templates.js        The v4 engine: layout registry (EVER_registerLayout /
    │                       EVER_findLayout), 27 built-in themes across 8 layouts
    │                       & 7 event types, custom-design CRUD (localStorage),
    │                       shared site renderer (EVER_renderSite) + mini
    │                       renderer (EVER_renderSiteMini) + site defaults +
    │                       state v1→v4 migration + countdowns
    ├── layouts/            8 layout modules (royal, bloom, fiesta, play, cinema,
    │                       nest, lumen, noir): each self-registers its section
    │                       structure, field specs and render()/mini() per the
    │                       frozen contract in docs/LAYOUT-SPEC.md (repo root)
    ├── designer.js         "Create your own design" modal: name, 5 colors,
    │                       name font, ornament style, live mini preview
    ├── create.js           Design-gallery page logic: render cards, filters,
    │                       custom cards, "use this design" → checkout
    ├── checkout.js         Order summary from selected design, card-form
    │                       validation, fake processing → editor
    └── editor.js           The builder: layout-agnostic sidebar generated from
                            each layout's field specs, live preview updates,
                            design tab (templates/fonts/colors/shape), reorder
                            & show/hide per section, autosave, publish overlay

src/app/                    ← Tiny server shell required by Next.js (2 files)
├── layout.tsx              Root layout (metadata only; users never see it)
└── page.tsx                Redirect fallback ("/" is rewritten to index.html)

docs/LAYOUT-SPEC.md         The frozen v4 layout contract: layout def shape,
                            SectionSpec/FieldSpec types, state v4 shape, CSS
                            namespacing rules, quality bar for new layouts
next.config.ts              1 rewrite: "/" → /index.html. That's the whole config.
package.json                3 runtime deps + dev tooling; scripts: dev/lint/build/start
tsconfig.json               Standard Next.js TypeScript options
eslint.config.mjs           Lints the server shell (public/ is plain browser JS)
Caddyfile                   Sandbox gateway (routes :81 → :3000) — infra, not product
.env                        Empty (nothing to configure)
```

Deleted legacy: a full early React/Next/Prisma build (`src/components`, `src/lib`,
`src/app/api`, `prisma/`, `db/`, Tailwind/shadcn configs, ~45 npm packages, 1.2 GB
of node_modules) — none of it was used by the current product.

---

## 3. How a page works (the pattern)

Every page is a standalone HTML file that loads `styles.css` and 2–4 JS modules
at the end of `<body>`:

```html
<link rel="stylesheet" href="styles.css" />
<link rel="stylesheet" href="css/ly-*.css" />  <!-- all 8 layout stylesheets -->
<script src="js/templates.js"></script>   <!-- v4 engine first -->
<script src="js/layouts/*.js"></script>   <!-- then the 8 layout modules -->
<script src="js/designer.js"></script>
<script src="js/app.js"></script>
<script src="js/editor.js"></script>      <!-- page logic last -->
```

Each JS module is an IIFE: private by default, publishing a tiny API on `window`
(`EVER_renderSite`, `EVER_findTemplate`, …). No bundler, no imports, no build.

### The user journey

```
index.html ──Get started──► create.html ──pick a design──► checkout.html
                             │            (or "Create          │  pay $25
                             │             your own")         ▼
                             └───────────────► editor.html ◄──┘
                                              edit everything live
                                              Save → localStorage
```

### Data model (localStorage keys)

| Key | Shape | Purpose |
|---|---|---|
| `ever-rsvp-event` | `{v:4, layoutId, templateId, nameFont, bodyFont, accent, btnShape, spacing, basics, sections, order}` | The whole event site content + design state |
| `ever-rsvp-selected-design` | template id | What the user picked on create.html |
| `ever-rsvp-flow` | `"paid"` etc. | Checkout step flag |
| `ever-rsvp-custom-tpl` | `[{id, name, colors, fonts, ornament}]` | User-created designs |

All `JSON.parse` calls are wrapped in `try/catch` and fall back to defaults, so a
corrupt/missing key can never break a page.

### One engine, eight structures

The old "one format, many palettes" model is gone: since engine v4, every design
belongs to a **layout** — a genuinely different page structure with its own
section list, editor field specs, defaults and CSS file. 27 themes cover 7
occasion types across 8 layouts:

| Layout | Occasion | Page structure (highlights) | Designs |
|---|---|---|---|
| `royal` — Classic Wedding | Wedding (4) | Monogram hero, countdown & details, our story, gallery, events, venue & map, RSVP | Emerald & Gold, Royal Maroon, Blush Rose, Midnight Navy |
| `bloom` — Garden Wedding | Wedding (4) | Details band, welcome note, day schedule on a vine, photo mosaic, garden footer | Sage Garden, Champagne Ivory, Lavender Mist, Marigold Saffron |
| `fiesta` — Birthday Party | Birthday (5) | Meet the star, party details, schedule, games & fun, wishes band | Balloon Pop, Neon Eighteen, Golden Sixteen, Tropical Fiesta, Golden Fifty |
| `cinema` — Cinematic Anniversary | Anniversary (3) | Celebration stats, love story, vow-renewal evening, gallery stills | Golden Jubilee, Silver Years, Ruby Romance |
| `nest` — Housewarming | Housewarming (3) | Welcome note, open-house countdown, numbered room tour, big visit & map panel | New Keys, Cottage Welcome, Modern Hearth |
| `lumen` — Baptism & Christening | Baptism & Christening (3) | Ceremony & reception panels, godparents cards, photo strip, blessings & wishes | Little Lamb, Sky of Grace, Ivory & Gold Cross |
| `play` — Baby Shower & Kids | Baby Shower & Kids (3) | Details bubbles, guest book, games & treats | Teddy Hug, Sunshine Sprinkle, Little Star |
| `noir` — Gala & Formal Evening | Gala & Evening (2) | Marquee hero, programme, evening menu, dress code, gallery | Midnight Gala, Velvet Rope |

`templates.js` holds the themes and the shared renderers; each
`js/layouts/*.js` module registers its structure and `render()`/`mini()`
functions. Switching a design within the same layout re-themes the content
instantly; switching across layouts rebuilds the page structure — and the
editor sidebar — from the new layout's field specs, carrying over universal
details (names, date, venue, contacts).

---

## 4. Commands

```bash
bun run dev     # dev server on :3000 (serves public/)
bun run lint    # eslint on the server shell
bun run build   # production build of the Next.js wrapper (optional)
bun run start   # serve the production build
```

## 5. Deploying live

**Recommended (zero server):** copy `public/` to any static host.
- nginx: `root /var/www/ever-rsvp;` + `index index.html;`
- Netlify/Vercel/GitHub Pages: drag-and-drop the folder
- Add the rewrite `/ → /index.html` if your host needs an explicit index rule

The extra `css/ly-*.css` stylesheets and `js/layouts/*.js` modules are plain
static assets — they ship with the same copy of `public/`. Still zero-build:
no bundler, no transpile, nothing to compile. (Leave `layouts-test.html` out
of any public nav if you prefer; it is unlinked and `noindex`.)

The Next.js wrapper is **not** needed in production — it exists only so this
sandbox's preview panel (port 3000) can serve the site.

---

## 6. SEO (built in)

Every page carries unique, keyword-targeted metadata:

| Page | Title | Indexable |
|---|---|---|
| `index.html` | "27 Event Website Templates with Online RSVP \| Ever RSVP" | ✅ canonical `https://everrsvp.com/` |
| `create.html` | "27 Event Website Templates for Every Occasion \| Ever RSVP" | ✅ canonical `.../create.html` |
| `checkout.html` | "Secure checkout" | ❌ `noindex, nofollow` (funnel page) |
| `editor.html` | "Website builder" | ❌ `noindex, nofollow` (app page) |

Included on the indexable pages:

- **Meta**: unique title + description (~150 chars) + keywords, `robots` with
  `max-image-preview:large`, canonical URL, `theme-color`
- **Open Graph + Twitter cards** with a designed share image
  (`assets/og-cover.jpg`, 1440×736) — controls how links preview on
  Facebook/WhatsApp/LinkedIn/X
- **JSON-LD structured data**:
  - `index.html` → `Organization`, `WebSite`, `Product` with `$25 Offer` +
    `aggregateRating`, a `FAQPage` mirroring the on-page FAQ (rich
    result / FAQ-snippet eligibility), and an `ItemList` of all 27 design names
  - `create.html` → `BreadcrumbList` + `ItemList` of all 27 design names
- **Crawl**: `robots.txt` (allows content, disallows funnel pages, sitemap
  ref) and `sitemap.xml` (indexable pages with priorities)
- **Core Web Vitals**: hero image `fetchpriority="high"`, below-fold images
  `loading="lazy"`, `font-display:swap` via Google Fonts, no render-blocking
  scripts (all JS is at `</body>`), ~2 MB total page weight

**Before going live:** replace the placeholder domain `https://everrsvp.com`
(canonical, OG URLs, sitemap, robots) with your real domain — it appears in
4 files: both HTML heads, `robots.txt`, `sitemap.xml`. Then submit the
sitemap in Google Search Console.

## 7. Security (built in)

**Server headers** (defined once in `next.config.ts`; reproduce on your
production host if not using Next.js):

| Header | Protection |
|---|---|
| `Content-Security-Policy` | Scripts confined to self/inline — no third-party or eval'd code; iframes restricted to OpenStreetMap (the map embed); `frame-ancestors 'none'` blocks clickjacking; `object-src 'none'` blocks plugin payloads |
| `X-Frame-Options: DENY` | Legacy clickjacking guard |
| `X-Content-Type-Options: nosniff` | Stops MIME-sniffing attacks |
| `Referrer-Policy: strict-origin-when-cross-origin` | No full-URL leakage to third parties |
| `Permissions-Policy` | Camera/mic/geolocation/payment/USB disabled |
| `Strict-Transport-Security` | Forces HTTPS in production (HSTS, 2y, preload) |

**Application hardening** (all user-editable content):

- Every user string rendered through `esc()` (HTML-entity escaping) — no
  raw `innerHTML` interpolation of user data anywhere
- `safeUrl()` scheme whitelist on every owner-typed link: only
  `https://` / `http://` / in-page anchors survive — `javascript:` and
  `data:` URLs are dropped before reaching `href` or the map `<iframe>`
  (double-enforced: renderer + editor field validation with visual warning)
- External links carry `rel="noopener noreferrer"` (tab-nabbing protection)
- Map iframe carries `referrerpolicy="no-referrer"`

**Payment privacy & validation:**

- **Card data is never persisted** — not to localStorage, cookies or any
  server. Only the generated order number survives the checkout
- Full **Luhn checksum validation** on the card number, plus expiry/CVC
  format checks
- Input `maxlength` + `inputmode="numeric"` on all card fields,
  correct `autocomplete` tokens (cc-number/cc-exp/cc-csc)

> **Going live with real payments:** this checkout is a front-end demo.
> Wire it to a hosted payment page (e.g. Stripe Checkout redirect) — card
> data then never touches your origin at all and you stay out of PCI scope
> (SAQ-A). The form structure is ready; replace the `setTimeout` in
> `checkout.js` with a redirect to your provider's hosted session.

**Data storage:** all content lives in the browser's `localStorage` — there
is no server database, no accounts, and no personal data leaves the device.
All `JSON.parse` calls are try/catch-wrapped and fall back to safe defaults.
