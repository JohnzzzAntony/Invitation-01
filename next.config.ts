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
 * host (nginx, Caddy, Netlify, S3...) — it is 100% self-contained.
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
};

export default nextConfig;
