# Task 10-e — editor-rewriter — Work Record

## Deliverables (2 files)
1. `public/js/editor.js` — full rewrite (~560 lines, ES5 IIFE). Sidebar built 100% dynamically from the active layout's field specs.
2. `public/editor.html` — ONLY the static Basics `<details>` block replaced with `<div class="ed-body" id="basics-body"></div>`; tabs/design panel/canvas/publish overlay/toast/script tags untouched.

## How the dynamic sidebar works
- `state = window.EVER_loadSiteState(readJson('ever-rsvp-flow') || {})` — core owns migration (v1/v2/v3→v4), flow.design override, template existence.
- `layout = EVER_findLayout(state.layoutId)` (falls back to first registered if a layout file is missing — no crash).
- `buildBasics()`: one `.ed-field` per `layout.basics` FieldSpec bound to `state.basics` via dotted getVal/setVal; consecutive short text fields paired into `.ed-2col`.
- `buildGroups()`: one `<details class="ed-group">` per id in `state.order` (meta from `layout.sections`); summary label + up/down/eye tools (preventDefault+stopPropagation, `sec-off` class, aria-pressed, `ui.open[sid]` restored on rebuild); body = fields + list repeater (`list.k` array, item label/up/down/del, `"+ Add <label>"`, `blank()` factory, rebuild pattern).
- FieldSpec renderer types: text, textarea (rows=3), date, number (min/max), check, select (`f.options`), photo (EVER_PHOTOS select + paste-URL input), icon (EVER_ICONS with friendly labels incl. gift/cake/game/home/key/cross/star/moon/sun/leaf/baby/spark/glass), color. Blur `.ed-invalid` validation kept for keys ending `Url`.
- `refresh()`: `EVER_renderSite(state,{interactive:true})` → `#canvas`, `site.__wsData=state`, `EVER_bindSite`, `EVER_tickCountdowns` + 1s interval; autosave (350ms debounce) to `EVER_EVENT_KEY`; `flow.design` sync.
- `applyTemplate(t)`: same-layout switch keeps everything; cross-layout switch = `EVER_siteDefaults(t.id)` + deep-merge overlapping section keys + universal basics (nameA,nameB,date,time,venue,city,address,dress,phone,email) + keys in the new layout's basics specs (event-specific keys like birthday `name` / cinema `years` don't leak); design prefs (nameFont/bodyFont/accent/btnShape/spacing) carried; then buildSidebar+buildDesign+refresh.
- Publish slug (only layout-specific chain): `slugify(basics.title || name || nameA-nameB || family || child || host) || 'your-event'`.
- Ported verbatim: tabs, device toggle, Save toast, publish overlay + copy, badge, designer integration (`window.EVER_openDesigner({template,onSave})`, `__dsnOnSave`), accent/font/shape/spacing builders.

## Browser verification (agent-browser, 127.0.0.1:3000/editor.html)
- Clean boot → royal: 8 basics fields populated, 8 accordions with tools, preview + OSM map + RSVP render; console clean.
- Live edits: First partner → h1/monogram; eye hides/unhides Gallery; story reorder; milestone add/edit/remove; gallery photo add; all reflected in preview + storage.
- Design: 28 chips + custom design creation; Rose accent / Cinzel / pill / airy all live; emerald→navy keeps content + prefs.
- Multi-layout: `fiesta.js` landed mid-run — balloonpop switch rendered the real fiesta structure with fiesta sidebar ("Celebrant name/Age/Hosted by…", Hero/Meet the star/Party details/Party schedule/Games & fun/Wishes band/…); cinema via Golden Jubilee after reload (Years together editable). cinema→Emerald merge carried only universal/royal keys.
- Save toast; publish → `sophie-rohan.ever-rsvp.com` + Published badge; reload persists names/template/hidden section/slug; mobile + desktop frames screenshot-verified (1440px).
- `node --check` pass; `bun run lint` clean; dev.log clean.

## Notes for next agents (core-owned, not fixed here)
- `EVER_loadSiteState` boot result isn't persisted until the first edit — after a template-file upgrade lands, storage layoutId can lag the in-memory one until the user edits.
- designer.js (parallel update in flight): still 4 name fonts, saves customs with `layout:'royal'`; when it carries layout, `applyTemplate` already handles it.
- `ly-fiesta.css` / `ly-cinema.css` etc. still missing at time of writing — new-layout previews are structural until the CSS files land.
