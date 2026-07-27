// ============================================================================
//  Seed the studio photoshoot (assets/photoshoot.js `trending`) into MongoDB
//  so each product becomes a real Product with an _id and plugs into the
//  existing product page -> cart -> Paystack checkout flow.
//
//  Idempotent: upserts by name ("<name> - <tag>"), so re-running updates rather
//  than duplicating. Run this AFTER scripts/uploadPhotoshoot.mjs.
//
//  Usage:
//     node scripts/seedPhotoshoot.mjs           # upsert all products
//     node scripts/seedPhotoshoot.mjs --clear    # remove them again
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CLEAR = process.argv.includes('--clear');

function loadEnv() {
  const p = path.join(ROOT, '.env');
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

// pull the `trending` array out of the generated ESM data file
function readTrending() {
  const txt = fs.readFileSync(path.join(ROOT, 'assets', 'photoshoot.js'), 'utf8');
  const after = txt.split('export const trending =')[1];
  if (!after) throw new Error('Could not find `export const trending =` in assets/photoshoot.js');
  const json = after.split('export const')[0].trim().replace(/;\s*$/, '');
  return JSON.parse(json);
}

// map each product to one of the store's existing categories
const CATEGORY = {
  'crimson-quarter-zip': 'Compression', 'onyx-quarter-zip': 'Compression',
  'training-tank': 'Compression', 'muscle-tank': 'Compression', 'white-training-tank': 'Compression',
  'shredded-tee': 'Gymshirt', 'shredded-storm-tee': 'Gymshirt',
  'shredded-shorts': 'Jogger', 'cropped-jorts': 'Jogger', 'tapered-joggers': 'Jogger',
  'leopard-set': 'Gymwear', 'ribbed-ls-set': 'Gymwear', 'sculpt-bodysuit': 'Gymwear',
  'flare-jumpsuit': 'Gymwear', 'cropped-set': 'Gymwear', 'piped-set': 'Gymwear',
};

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  offerPrice: { type: Number, required: true },
  image: { type: Array, required: true },
  category: { type: String, required: true },
  date: { type: Number, required: true },
}, { timestamps: true });
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

function buildDocs(trending) {
  return trending.map((p) => ({
    name: `${p.name} - ${p.tag}`,
    description: `${p.name} in ${p.tag}. ${p.gender === 'women' ? "Women's" : "Men's"} studio drop — engineered fit, premium performance fabric.`,
    price: p.price,
    offerPrice: p.offerPrice,
    image: p.images,
    category: CATEGORY[p.slug] || 'Gymwear',
    date: Date.now(),
  }));
}

async function main() {
  loadEnv();
  if (!process.env.MONGODB_URI) { console.error('✗ Missing MONGODB_URI in .env'); process.exit(1); }
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'quickcart' });
  console.log('✓ MongoDB connected (quickcart)');

  const docs = buildDocs(readTrending());

  if (CLEAR) {
    const res = await Product.deleteMany({ name: { $in: docs.map((d) => d.name) } });
    console.log(`✓ Removed ${res.deletedCount} seeded product(s).`);
    await mongoose.disconnect();
    return;
  }

  let n = 0;
  for (const d of docs) {
    await Product.findOneAndUpdate({ name: d.name }, { $set: d }, { upsert: true, new: true, setDefaultsOnInsert: true });
    console.log(`  • ${d.name}  [${d.category}]  $${d.offerPrice}  (${d.image.length} img)`);
    n++;
  }
  console.log(`\n✓ Upserted ${n} product(s). Products in DB now: ${await Product.countDocuments()}.`);
  await mongoose.disconnect();
}

main().catch((e) => { console.error('\n✗ Seed failed:', e.message); process.exit(1); });
