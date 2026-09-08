# Invitara — Event Website Builder

A minimalist event-invitation builder. A customer picks one of **27 premium
designs** — 10 bespoke page layouts across 7 occasion types (weddings,
birthdays, anniversaries, housewarmings, baptisms, baby showers, galas) —
chooses a plan, customises every word, photo and colour in a live editor, pays
once, then publishes and shares a link their guests can RSVP through.

**Discover → pick one design → choose a plan → customise → preview → pay →
publish → share.** Three plans from **AED 29**; the total is the design's price
plus the plan, paid once per invitation.

**The product is 100% plain HTML / CSS / JavaScript.** No framework, no build
step, no database, no server. Next.js is only the local dev server.

---

## Quick start

```bash
bun install
bun run dev      # http://localhost:3000
```

| Command | What it does |
|---|---|
| `bun run dev` | Dev server on :3000, serving `public/` with production headers |
| `bun run check` | ESLint on the TS shell + `node --check` on all browser scripts |
| `bun run build` | Production build of the Next.js wrapper (optional) |
| `bun run domain <host>` | Replace the placeholder domain before going live |
| `bun run gen:headers` | Regenerate `_headers` / `netlify.toml` / `vercel.json` |

## Where things are

```
public/      ← THE PRODUCT. Deploy this folder to any static host.
config/      Response-header definitions (one source of truth)
scripts/     Build-time generators — never deployed
vendor/      Source archive for the generators — never deployed
src/app/     Two-file Next.js shell (no React in the product)
docs/        The documentation below
```

## Documentation

| Document | Read it when |
|---|---|
| **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** | You want to understand how the thing works — module map, CSS namespacing, data model, security posture |
| **[docs/LAYOUT-SPEC.md](docs/LAYOUT-SPEC.md)** | You are adding or changing a layout. This contract is frozen — implement against it |
| **[docs/DEPLOY.md](docs/DEPLOY.md)** | You are going live. Start here; step 1 is required |

## Before you deploy

Three things, all covered in [docs/DEPLOY.md](docs/DEPLOY.md):

1. **Set your domain.** The repo ships with the reserved placeholder
   `your-domain.example`, which does not resolve on purpose — run
   `bun run domain yourdomain.com`.
2. **Wire real payments.** `checkout.js` is a front-end demo that takes no
   money. Replace its `setTimeout` with a redirect to a hosted payment page.
3. **Carry the security headers over** if your host is not Netlify, Cloudflare
   Pages or Vercel — they are already configured for those three.

## The trade-off, stated plainly

There is no server, so there are no accounts, no cross-device sync and no
server-side RSVP aggregation. An event lives in `localStorage` in one browser
on one device; clearing site data erases it and nobody can restore it.

In exchange: nothing to operate, nothing to breach, no personal data leaving
the customer's machine, and a deliverable that is a folder. The site's copy,
its [privacy policy](public/privacy.html) and its
[terms](public/terms.html) all say this out loud rather than implying
otherwise.
