import type { NextConfig } from "next";

/**
 * Next.js is used ONLY as a static file server for the sandbox preview.
 *
 * The entire product is plain HTML/CSS/JS inside public/:
 *   - "/" is rewritten to public/index.html (beforeFiles rewrite below)
 *   - every other path (create.html, checkout.html, editor.html, js/*,
 *     assets/*, styles.css) is served straight from public/ by Next's
 *     built-in static file handling, before the App Router is ever consulted.
 *
 * To deploy without Next.js at all, copy the public/ folder to any static
 * host (nginx, Caddy, Netlify, S3...) and reproduce the security headers
 * below on that host — they are defined here once so dev matches production.
 */
const nextConfig: NextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return {
      beforeFiles: [{ source: "/", destination: "/index.html" }],
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          /* Content-Security-Policy:
             - script/style confined to self + inline (JSON-LD blocks & CSS vars)
             - styles/fonts loaded from Google Fonts only
             - images self/data/https (guests may paste https photo URLs)
             - iframes restricted to the map embed (OpenStreetMap)
             - frame-ancestors 'none' → clickjacking protection               */
          {
            key: "Content-Security-Policy",
            value: [
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
            ].join("; "),
          },
          /* Prevent MIME-type sniffing / script injection via uploads */
          { key: "X-Content-Type-Options", value: "nosniff" },
          /* Legacy clickjacking guard for older browsers */
          { key: "X-Frame-Options", value: "DENY" },
          /* Don't leak the full URL to third parties */
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          /* Disable browser features the product never uses */
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
          /* Force HTTPS in production (ignored on plain-http localhost) */
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
  },
};

export default nextConfig;
