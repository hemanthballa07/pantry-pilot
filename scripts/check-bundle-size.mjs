#!/usr/bin/env node
// Bundle-size budget guard (OQ-005).
//
// Fails (exit 1) when the INITIAL-ROUTE JS — the entry chunk plus its
// transitive STATIC imports — exceeds budget. Lazy route chunks (manifest
// `dynamicImports`) are excluded by design: they download on navigation, not
// on first paint, which is the whole point of the Phase 5 route-split.
//
// Pure Node, zero dependencies. Reads dist/.vite/manifest.json (requires
// build.manifest: true in vite.config.ts) and measures the real emitted files.
// Run after `vite build` — see the `size` / `build:check` npm scripts.

import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const MANIFEST = join(DIST, '.vite', 'manifest.json');

const MAX_RAW = 500 * 1024; // 500 kB raw
const MAX_GZIP = 150 * 1024; // 150 kB gzip

let manifest;
try {
  manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
} catch (err) {
  console.error(`✗ Could not read Vite manifest at ${MANIFEST}`);
  console.error('  Run `npm run build` first (build.manifest must be true in vite.config.ts).');
  console.error(`  ${err.message}`);
  process.exit(1);
}

// `imports`/`dynamicImports` reference other manifest KEYS, so walk by key.
const entryKeys = Object.entries(manifest)
  .filter(([, chunk]) => chunk.isEntry)
  .map(([key]) => key);

if (entryKeys.length === 0) {
  console.error('✗ No entry chunk (isEntry: true) found in the manifest.');
  process.exit(1);
}

const seen = new Set();
const initialFiles = new Set();
function walk(key) {
  if (seen.has(key)) return;
  seen.add(key);
  const chunk = manifest[key];
  if (!chunk) return;
  if (typeof chunk.file === 'string' && chunk.file.endsWith('.js')) {
    initialFiles.add(chunk.file);
  }
  for (const imp of chunk.imports ?? []) walk(imp);
  // dynamicImports intentionally NOT walked — those are the lazy route chunks.
}
for (const key of entryKeys) walk(key);

// Fail loud if the walk measured nothing: a manifest-shape change (e.g. a Vite
// upgrade) must never let the gate pass blind.
if (initialFiles.size === 0) {
  console.error('✗ Walked the manifest from the entry but found no initial JS files.');
  console.error('  The manifest shape may have changed — refusing to pass without measuring.');
  process.exit(1);
}

// Measured per emitted file: each asset is its own independently-gzipped HTTP
// response, so the per-file gzip sum models real transfer — and is conservative
// vs. one combined stream (it can only trip the gate earlier, never later).
let totalRaw = 0;
let totalGzip = 0;
const rows = [];
for (const file of [...initialFiles].sort()) {
  const buf = readFileSync(join(DIST, file));
  const raw = buf.length;
  const gz = gzipSync(buf).length;
  totalRaw += raw;
  totalGzip += gz;
  rows.push({ file, raw, gz });
}

const kb = (n) => (n / 1024).toFixed(1).padStart(7) + ' kB';

console.log(
  `\nInitial-route JS — ${initialFiles.size} file(s) (entry + static imports; lazy route chunks excluded):`,
);
for (const r of rows) console.log(`  ${kb(r.raw)} raw  ${kb(r.gz)} gz   ${r.file}`);
console.log('  ' + '-'.repeat(56));
console.log(`  ${kb(totalRaw)} raw  ${kb(totalGzip)} gz   TOTAL`);
console.log(`  budget:  ${kb(MAX_RAW)} raw  ${kb(MAX_GZIP)} gz\n`);

const overRaw = totalRaw > MAX_RAW;
const overGzip = totalGzip > MAX_GZIP;
if (overRaw || overGzip) {
  if (overRaw)
    console.error(`✗ initial raw JS ${kb(totalRaw).trim()} exceeds budget ${kb(MAX_RAW).trim()}`);
  if (overGzip)
    console.error(
      `✗ initial gzip JS ${kb(totalGzip).trim()} exceeds budget ${kb(MAX_GZIP).trim()}`,
    );
  process.exit(1);
}

console.log('✓ initial-route JS within budget\n');
