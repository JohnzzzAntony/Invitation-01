/* ==========================================================================
   sync-seo.mjs — keep the JSON-LD design lists in step with the catalogue
   Reads THEMES out of public/js/templates.js and rewrites the itemListElement
   arrays in index.html and create.html, plus the "N designs across M layouts"
   phrasing wherever it appears. Run after changing THEMES or the layouts.

   Run:  node .zscripts/sync-seo.mjs
   ========================================================================== */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tplSrc = readFileSync(resolve(ROOT, 'public/js/templates.js'), 'utf8');

/* THEMES entries: { id: 'x', name: 'Y', event: 'z', layout: 'w', … } */
const themes = [...tplSrc.matchAll(/\{ id: '([a-z0-9-]+)', name: '([^']+)', event: '([a-z]+)', layout: '([a-z]+)'/g)]
  .map(([, id, name, event, layout]) => ({ id, name, event, layout }));

if (themes.length < 2) throw new Error('could not read THEMES from templates.js');

const layouts = [...new Set(themes.map((t) => t.layout))];
const N = themes.length;
const L = layouts.length;

const rows = themes.map((t, i) => {
  const pos = String(i + 1);
  const pad = pos.length === 1 ? '  ' : ' ';
  /* JSON-LD lives in a <script> block: its contents are NOT HTML-parsed, so
     an entity here would be read literally. Keep the plain character. */
  return `          { "@type": "ListItem", "position": ${pos},${pad}"name": "${t.name}" }`;
}).join(',\n');

let touched = 0;
for (const page of ['public/index.html', 'public/create.html']) {
  const path = resolve(ROOT, page);
  let s = readFileSync(path, 'utf8');
  const before = s;

  /* Only the design catalogue — the pages also carry a BreadcrumbList, which
     uses itemListElement for something else entirely. Anchor on "@type":
     "ItemList" and rewrite just that object's array. */
  s = s.replace(/("@type": "ItemList",[\s\S]*?"itemListElement": \[\n)[\s\S]*?(\n        \])/g,
    (m, head, tail) => head + rows + tail);
  s = s.replace(/("@type": "ItemList",[\s\S]*?)"numberOfItems": \d+/g,
    (m, head) => head + `"numberOfItems": ${N}`);
  /* Prose copy is deliberately NOT rewritten here — it describes the
     designs and needs a human eye. Grep for “layouts” after adding one. */

  if (s !== before) { writeFileSync(path, s); touched++; }
  console.log(page, s === before ? '(unchanged)' : 'updated');
}

console.log(`${N} designs across ${L} layouts; ${touched} file(s) rewritten`);
