import type { NextConfig } from "next";
import { SECURITY_HEADERS } from "./config/security-headers.mjs";

/**
 * Next.js is used ONLY as a static file server for local dev and preview.
 *
 * The entire product is plain HTML/CSS/JS inside public/:
 *   - "/" is rewritten to public/index.html (beforeFiles rewrite below)
 *   - every other path (create.html, checkout.html, editor.html, privacy.html,
 *     terms.html, js/*, assets/*, styles.css) is served straight from public/
 *     by Next's built-in static file handling, before the App Router is ever
 *     consulted.
 *
 * To deploy without Next.js, copy public/ to any static host. The response
 * headers below come from config/security-headers.mjs — the same module that
 * generates public/_headers, netlify.toml and vercel.json — so dev and
 * production stay identical. See docs/DEPLOY.md.
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
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
