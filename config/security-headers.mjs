/* security-headers.mjs — the one definition of the site's response headers.
 *
 * Consumed by:
 *   next.config.ts                  → the dev/preview server
 *   scripts/gen-deploy-headers.mjs  → public/_headers, netlify.toml, vercel.json
 *
 * Change a header here and re-run `node scripts/gen-deploy-headers.mjs`, so
 * local dev and every static host stay in step. Editing the generated files
 * by hand will be overwritten.
 */

/* Content-Security-Policy, in parts so each rule can carry its reason.
   - script/style: self + inline only (JSON-LD blocks and CSS custom props);
     no third-party or eval'd code can run
   - style/font: Google Fonts is the only external origin
   - img: https allowed because owners may paste photo URLs into the editor
   - frame-src: the OpenStreetMap venue embed, nothing else
   - frame-ancestors 'none': clickjacking protection
   - object-src 'none': no plugin payloads                                   */
export const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: https:",
  "frame-src https://www.openstreetmap.org",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join('; ');

/** Applied to every response. `key`/`value` matches the Next.js headers() shape. */
export const SECURITY_HEADERS = [
  { key: 'Content-Security-Policy', value: CSP },
  /* Stop MIME-type sniffing */
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  /* Legacy clickjacking guard for browsers predating frame-ancestors */
  { key: 'X-Frame-Options', value: 'DENY' },
  /* Don't leak the full URL to third parties */
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  /* Switch off browser features the product never uses */
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  /* Force HTTPS in production (ignored on plain-http localhost) */
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
];
