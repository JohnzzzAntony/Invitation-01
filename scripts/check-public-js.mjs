/* check-public-js.mjs — syntax-check every browser script in public/js.

   public/ is plain browser JavaScript (IIFE modules, no imports/exports), so
   ESLint's Node-oriented config is switched off for it in eslint.config.mjs.
   This is the substitute: `node --check` parses each file and fails the run
   on a syntax error, which is the class of mistake a no-build product cannot
   catch any other way.

   Run:  bun run check:js                                                   */

import { readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, dirname, relative, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const JS_DIR = resolve(ROOT, 'public/js');

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return walk(full);
    return full.endsWith('.js') ? [full] : [];
  });
}

const files = walk(JS_DIR).sort();
let failed = 0;

for (const file of files) {
  const rel = relative(ROOT, file).replace(/\\/g, '/');
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
    console.log(`  ok    ${rel}`);
  } catch (err) {
    failed++;
    console.error(`  FAIL  ${rel}`);
    console.error(String(err.stderr || err.message).trim());
  }
}

console.log(`\n${files.length} file(s) checked, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
