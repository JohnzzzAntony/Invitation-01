# Deploying Ever RSVP

The product is `public/` — plain HTML, CSS and JavaScript with no build step.
Deploying means putting that folder on a static host. Next.js is the local dev
server only and is **not** needed in production.

---

## 1. Set your domain (required)

The repo ships with the reserved placeholder host `your-domain.example`
(RFC 2606). It is deliberately un-resolvable, so a half-configured deploy
breaks loudly instead of publishing dead canonical URLs to Google.

```bash
node scripts/set-domain.mjs everrsvp.com
```

That rewrites all 24 occurrences across the six files that embed the host:

| File | What it contains |
|---|---|
| `public/index.html` | canonical, Open Graph, Twitter card, JSON-LD `@id`s |
| `public/create.html` | canonical, Open Graph, BreadcrumbList |
| `public/privacy.html` | canonical, Open Graph, contact address |
| `public/terms.html` | canonical, Open Graph, contact address |
| `public/editor.html` | the published-URL preview shown after checkout |
| `public/js/editor.js` | the same preview, rendered from the event slug |
| `public/robots.txt` | `Sitemap:` line |
| `public/sitemap.xml` | every `<loc>` |

Preview without writing anything:

```bash
node scripts/set-domain.mjs everrsvp.com --dry-run
```

The script is re-runnable: it reads the current host back out of `robots.txt`,
so changing domains later works the same way.

Also update the contact address `hello@…` if it should differ from your domain.

## 2. Check before you ship

```bash
bun run check
```

Runs ESLint over the TypeScript shell and `node --check` over all 17 browser
scripts in `public/js/`. There is no test suite — the product has no build
step and no server logic; syntax checking plus a browser pass is the whole
verification story.

## 3. Publish `public/`

### Netlify / Cloudflare Pages

`netlify.toml` and `public/_headers` are committed and already correct.
Publish directory `public`, build command empty. Drag-and-drop works too.

### Vercel

`vercel.json` is committed. Set the output directory to `public` and leave the
framework preset as "Other".

### nginx

```nginx
server {
    root /var/www/ever-rsvp;      # the contents of public/
    index index.html;
    error_page 404 /404.html;

    # Reproduce the headers from public/_headers here — see §4.
}
```

### Any other host

Copy `public/` to the document root. Point `/` at `index.html` and the 404
handler at `404.html`.

## 4. Security headers

Defined **once** in `config/security-headers.mjs`. Three consumers read it:

- `next.config.ts` — local dev, so dev matches production
- `public/_headers` — Netlify, Cloudflare Pages
- `netlify.toml`, `vercel.json` — the respective platforms

The last three are generated. After changing a header:

```bash
node scripts/gen-deploy-headers.mjs
```

If your host is not one of the above, copy the header list out of
`public/_headers` into its config by hand. Shipping without them costs you
clickjacking, MIME-sniffing and mixed-content protection.

The Content-Security-Policy blocks all third-party scripts. Adding analytics
or a chat widget means adding its origin to `script-src` in
`config/security-headers.mjs` and regenerating — it will silently fail to load
otherwise.

## 5. Payments

`public/js/checkout.js` is a **front-end demo**: it validates the card with a
Luhn checksum, waits on a `setTimeout`, and unlocks the builder. It takes no
money.

To go live, replace that `setTimeout` with a redirect to a hosted payment page
(Stripe Checkout, Paddle, Lemon Squeezy). Card details then never touch your
origin and you stay in PCI scope SAQ-A. The form structure and validation are
already in place; only the submit handler changes.

Until that is done, do not present the site as taking real payments.

## 6. After going live

- Submit `sitemap.xml` in Google Search Console
- Verify headers landed: `curl -I https://your-domain/` should show all seven
- Check the OG card renders — paste the URL into the Facebook Sharing Debugger
- Confirm `/404.html` is served for a missing path, not the host's default

---

## What is *not* deployed

| Path | Why it stays behind |
|---|---|
| `vendor/muhibbi-template/` | Source archive the generators read from — 7.6 MB, never served |
| `scripts/` | Build-time generators |
| `config/` | Header definitions, consumed at build time |
| `src/`, `next.config.ts`, `tsconfig.json` | The dev-server shell |
| `public/layouts-test.html` | Internal QA harness. Unlinked, `noindex`, and disallowed in `robots.txt` — harmless if it ships, but you can delete it from the deployed copy |
