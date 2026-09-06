# Ever RSVP — Event Website Builder

A minimalist event-website builder (weddings, parties, celebrations) where a customer
picks a design, pays once, and edits every word, photo and color of their event site
in a live editor.

**The product is 100% plain HTML / CSS / JavaScript.** No framework, no build step,
no database. Next.js exists only as the local dev/preview static file server.

---

## 1. The stack, plainly

| Layer | What is used | Where | Why |
|---|---|---|---|
| Frontend (the product) | HTML5 + CSS3 + vanilla JS (IIFE modules) | `public/` | Zero dependencies, loads anywhere, trivially deployable |
| Fonts | Google Fonts CDN (Cormorant Garamond, Lato) | `<link>` in each page | Elegant serif/sans pairing, no files to host |
| Images | 9 static JPGs | `public/assets/` | AI-generated at build time, committed as files |
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
├── create.html             Design gallery: 8 designs + "Create your own design"
├── checkout.html           One-time $25 payment page (order summary + card form)
├── editor.html             The builder: left panel of controls + live preview
├── styles.css              The whole design system (~3,900 lines, one file)
├── robots.txt              Search-engine rules
├── assets/                 9 JPG photos used by the designs
└── js/                     6 vanilla-JS modules, each one job:
    ├── app.js              Shared UI: toast, mobile menu, reveal animations,
    │                       carousel, FAQ accordion, demo modal, footer year
    ├── templates.js        The design engine: 8 built-in designs of ONE common
    │                       format, custom-design CRUD (localStorage), the full
    │                       site renderer (EVER_renderSite) + mini renderer
    │                       (EVER_renderSiteMini) + sample content + countdowns
    ├── designer.js         "Create your own design" modal: name, 5 colors,
    │                       name font, ornament style, live mini preview
    ├── create.js           Design-gallery page logic: render cards, filters,
    │                       custom cards, "use this design" → checkout
    ├── checkout.js         Order summary from selected design, card-form
    │                       validation, fake processing → editor
    └── editor.js           The builder: loads/saves state, renders every
                            section's field controls, live preview updates,
                            design tab (templates/fonts/colors/shape), reorder
                            & show/hide per section, autosave, publish overlay

src/app/                    ← Tiny server shell required by Next.js (2 files)
├── layout.tsx              Root layout (metadata only; users never see it)
└── page.tsx                Redirect fallback ("/" is rewritten to index.html)

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
<script src="js/templates.js"></script>   <!-- shared engine first -->
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
| `ever-rsvp-event` | `{v:3, templateId, nameFont, bodyFont, accent, btnShape, spacing, basics, sections, order}` | The whole event site content + design state |
| `ever-rsvp-selected-design` | template id | What the user picked on create.html |
| `ever-rsvp-flow` | `"paid"` etc. | Checkout step flag |
| `ever-rsvp-custom-tpl` | `[{id, name, colors, fonts, ornament}]` | User-created designs |

All `JSON.parse` calls are wrapped in `try/catch` and fall back to defaults, so a
corrupt/missing key can never break a page.

### One format, many designs

All 8 built-in designs (and any user-created design) share the exact same page
format — Hero → Countdown & details → Our story → Gallery → Events → Venue & map
→ RSVP → Contact footer. A design is just a **theme**: a color palette, a name
font, and an ornament style. `templates.js` holds the themes and the single
renderer; switching a design re-renders the same content in the new theme.

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

The Next.js wrapper is **not** needed in production — it exists only so this
sandbox's preview panel (port 3000) can serve the site.
