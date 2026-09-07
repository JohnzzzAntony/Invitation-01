/* set-domain.mjs — point the site at your real domain.

   The repo ships with the reserved placeholder host `your-domain.example`
   (RFC 2606) in every canonical URL, Open Graph tag, JSON-LD @id, sitemap
   entry, robots.txt Sitemap line, contact address and demo "published URL".
   It is deliberately un-resolvable so a half-configured deploy fails loudly
   instead of publishing a dead canonical.

   Run:  node scripts/set-domain.mjs everrsvp.com
         node scripts/set-domain.mjs everrsvp.com --dry-run

   Pass a bare host (no scheme, no trailing slash). Idempotent: re-running
   with a new host also rewrites a previously-set one, because the current
   host is read back out of public/robots.txt.                              */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/* Every file that embeds the site host. Keep in sync with docs/DEPLOY.md. */
const FILES = [
  'public/index.html',
  'public/create.html',
  'public/editor.html',
  'public/js/editor.js',
  'public/robots.txt',
  'public/sitemap.xml',
];

const PLACEHOLDER = 'your-domain.example';

const [host, ...flags] = process.argv.slice(2);
const dryRun = flags.includes('--dry-run');

if (!host) {
  console.error('usage: node scripts/set-domain.mjs <host> [--dry-run]');
  console.error('   eg: node scripts/set-domain.mjs everrsvp.com');
  process.exit(1);
}
if (/^https?:\/\//.test(host) || host.includes('/')) {
  console.error(`error: pass a bare host, not a URL — got "${host}"`);
  process.exit(1);
}
if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i.test(host)) {
  console.error(`error: "${host}" is not a valid hostname`);
  process.exit(1);
}

/* Discover the host currently in the tree so this is re-runnable. */
const robots = readFileSync(resolve(ROOT, 'public/robots.txt'), 'utf8');
const found = robots.match(/^Sitemap:\s*https?:\/\/([^/\s]+)/m);
const current = found ? found[1] : PLACEHOLDER;

if (current === host) {
  console.log(`Already set to ${host} — nothing to do.`);
  process.exit(0);
}

let total = 0;
for (const rel of FILES) {
  const path = resolve(ROOT, rel);
  const before = readFileSync(path, 'utf8');
  const after = before.split(current).join(host);
  const hits = before.split(current).length - 1;
  if (hits === 0) continue;
  total += hits;
  if (!dryRun) writeFileSync(path, after);
  console.log(`${dryRun ? 'would update' : 'updated'}  ${rel}  (${hits})`);
}

console.log(
  `\n${dryRun ? 'Would replace' : 'Replaced'} ${total} occurrence(s): ${current} → ${host}`
);
if (total === 0) {
  console.warn(`warning: no occurrences of "${current}" found — check the tree`);
  process.exit(1);
}
