// One-time: stamp a stable `sku` onto the seeded New Drop + Trending products so
// the homepage cards link by sku instead of name (survives renames). Matches
// existing docs by their CURRENT name and sets ONLY sku — prices/images untouched.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { newDropSku, trendingSku } from '../lib/sku.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const env = Object.fromEntries(
  readFileSync(path.join(ROOT, '.env'), 'utf8').split('\n').map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);

const nd = JSON.parse(readFileSync(path.join(ROOT, 'assets', 'newDrop.js'), 'utf8')
  .split('export const newDrop =')[1].trim().replace(/;\s*$/, ''));
const trending = JSON.parse(readFileSync(path.join(ROOT, 'assets', 'photoshoot.js'), 'utf8')
  .split('export const trending =')[1].split(/\nexport /)[0].trim().replace(/;\s*$/, ''));

// [name, sku] pairs
const pairs = [];
for (const p of nd) for (const c of p.colorways) {
  const name = c.variant ? `${p.name} (${c.variant}) - ${c.name}` : `${p.name} - ${c.name}`;
  pairs.push([name, newDropSku(p.slug, c.name, c.variant)]);
}
for (const p of trending) pairs.push([`${p.name} - ${p.tag}`, trendingSku(p.slug)]);

await mongoose.connect(env.MONGODB_URI, { dbName: 'quickcart' });
const col = mongoose.connection.collection('products');
let set = 0, missing = 0;
for (const [name, sku] of pairs) {
  // add the alias (product may already carry another showcase's sku); drop the
  // old singular `sku` field from the first pass.
  const r = await col.updateOne({ name }, { $addToSet: { skus: sku }, $unset: { sku: '' } });
  if (r.matchedCount) { set++; }
  else { missing++; console.log(`  ⚠ no product named: ${name}`); }
}
console.log(`\n✓ sku added to ${set} product(s)${missing ? `, ${missing} name(s) not found` : ''}.`);
await mongoose.disconnect();
