/* ==========================================================================
   extract-sections.mjs — reference extractor (development aid, not shipped)
   Pulls the body sections out of each downloaded Muhibbi home page, drops the
   site header/footer/scripts, collapses whitespace and keeps only the first
   two of each repeated sibling block, so a whole page fits in a short file.
   Output: vendor/muhibbi-template/demo/_sections/<page>.txt
   ========================================================================== */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEMO = resolve(ROOT, 'vendor/muhibbi-template/demo');
const OUT = resolve(DEMO, '_sections');
mkdirSync(OUT, { recursive: true });

const pages = ['index', 'index-2', 'index-3', 'index-4', 'index-5',
  'index-6', 'index-7', 'index-8', 'index-9', 'index-10'];

for (const p of pages) {
  let s = readFileSync(resolve(DEMO, p + '.html'), 'utf8');

  /* body only: from the end of the site header to the footer */
  const hEnd = s.indexOf('<!-- end of header -->');
  const fStart = s.search(/<footer/);
  s = s.slice(hEnd > 0 ? hEnd + 22 : 0, fStart > 0 ? fStart : s.length);

  s = s.replace(/<!--[\s\S]*?-->/g, '');          /* comments */
  s = s.replace(/\s+data-wow-[a-z]+="[^"]*"/g, ''); /* WOW noise */
  s = s.replace(/\s+data-swiper-parallax="[^"]*"/g, '');
  s = s.replace(/\bwow\s+fadeIn[A-Za-z]*\b/g, '');
  s = s.replace(/\bpoort-text poort-in-right\b/g, '');
  s = s.replace(/class="\s*"/g, '');
  s = s.replace(/[ \t]*\n[ \t]*/g, '\n').replace(/\n{2,}/g, '\n');

  /* collapse repeated sibling blocks: if the same opening tag+class repeats
     more than twice in a row at the same nesting, keep two and note the rest */
  const lines = s.split('\n');
  const out = [];
  let runKey = null, runCount = 0;
  for (const line of lines) {
    const key = (line.match(/^<(\w+)[^>]*class="([^"]*)"/) || [])[0] || null;
    if (key && key === runKey) {
      runCount++;
      if (runCount > 2) { if (runCount === 3) out.push('   … (repeats)'); continue; }
    } else { runKey = key; runCount = 1; }
    out.push(line);
  }

  writeFileSync(resolve(OUT, p + '.txt'), out.join('\n'));
  console.log(p, out.length, 'lines');
}
