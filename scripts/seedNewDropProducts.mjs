// ============================================================================
//  Seed the New Drop into MongoDB — one product PER COLORWAY (color-agnostic).
// ============================================================================
//  "Treat each color as a different product": each colorway of each New Drop
//  item becomes its own Product document, so it shows in the seller dashboard,
//  /all-products, product pages, and Popular products on the home page.
//
//  Idempotent: upserts by name, so re-running updates rather than duplicating.
//
//  Usage:
//     node scripts/seedNewDropProducts.mjs          # upsert all colorways
//     node scripts/seedNewDropProducts.mjs --clear   # remove them again
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CLEAR = process.argv.includes('--clear');

// --- tiny .env loader -------------------------------------------------------
function loadEnv() {
  const p = path.join(ROOT, '.env');
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

// --- read the generated New Drop data (ESM file -> parse the array) ---------
function readNewDrop() {
  const txt = fs.readFileSync(path.join(ROOT, 'assets', 'newDrop.js'), 'utf8');
  const after = txt.split('export const newDrop =')[1];
  if (!after) throw new Error('Could not find `export const newDrop =` in assets/newDrop.js');
  const json = after.trim().replace(/;\s*$/, '');
  return JSON.parse(json);
}

// map each product family to one of the store's existing categories
const CATEGORY = {
  'shredded-hoodie': 'Hoodie',
  'oversized-tee': 'Gymshirt',
  'compression-longsleeve': 'Compression',
  'compression-tee': 'Compression',
  'shredded-joggers': 'Jogger',
  'quarter-zip-longsleeve': 'Compression',
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

// flatten: product x colorway -> one seed doc
function buildDocs(newDrop) {
  const docs = [];
  for (const p of newDrop) {
    const category = CATEGORY[p.slug] || 'Gymwear';
    for (const c of p.colorways) {
      const images = ['front', 'side', 'back'].map((a) => c.angles[a]).filter(Boolean);
      docs.push({
        name: `${p.name} - ${c.name}`,
        description: p.description,
        price: p.price,
        offerPrice: p.offerPrice,
        image: images,
        category,
        date: Date.now(),
      });
    }
  }
  return docs;
}

async function main() {
  loadEnv();
  if (!process.env.MONGODB_URI) { console.error('✗ Missing MONGODB_URI in .env'); process.exit(1); }
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'quickcart' });
  console.log('✓ MongoDB connected (quickcart)');

  const newDrop = readNewDrop();
  const docs = buildDocs(newDrop);

  if (CLEAR) {
    const names = docs.map((d) => d.name);
    const res = await Product.deleteMany({ name: { $in: names } });
    console.log(`✓ Removed ${res.deletedCount} seeded product(s).`);
    await mongoose.disconnect();
    return;
  }

  let upserts = 0;
  for (const d of docs) {
    await Product.findOneAndUpdate(
      { name: d.name },
      { $set: d },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`  • ${d.name}  [${d.category}]  $${d.offerPrice}  (${d.image.length} img)`);
    upserts++;
  }
  const total = await Product.countDocuments();
  console.log(`\n✓ Upserted ${upserts} colorway product(s). Products in DB now: ${total}.`);
  await mongoose.disconnect();
}

main().catch((e) => { console.error('\n✗ Seed failed:', e.message); process.exit(1); });
