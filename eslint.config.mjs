import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/**
 * Lints the (tiny) TypeScript server shell: next.config.ts and src/app/*.
 *
 * public/** is deliberately ignored: it is plain browser JavaScript
 * (IIFE modules, no imports/exports) that is syntax-checked with
 * `node --check` and verified in a real browser — ESLint's Node-oriented
 * rules do not apply to it.
 */
const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "skills/**",
      ".zscripts/**",
      "mini-services/**",
      "upload/**",
      "public/**",
      /* Vendor source archive for the Muhibbi template (its CSS is compiled
         into public/css/mu.css by .zscripts/scope-css.mjs; none of its
         jQuery is shipped). Not our code — not ours to lint. */
      "Layouts/**",
    ],
  },
];

export default eslintConfig;
