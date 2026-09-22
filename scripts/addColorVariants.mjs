// One-off: upload the 4 new colour-variant photos to Cloudinary and insert them
// as products (linked to their family via a stable sku). Idempotent by sku.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DL = 'C:/Users/jenni/Downloads';
const env = Object.fromEntries(
  fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split('\n').map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME, api_key: env.CLOUDINARY_API_KEY, api_secret: env.CLOUDINARY_API_SECRET,
});

const LEOPARD = { price: 53000, offerPrice: 46000, category: 'Gymwear' };
const NEW = [
  { file: 'WhatsApp_Image_2026-09-22_at_19.46.37-removebg-preview.png', sku: 'nd-leopard-set-sand',
    name: 'Leopard Seamless Set - Sand', ...LEOPARD, description: 'Leopard Seamless Set in Sand. Women\u2019s studio drop \u2014 engineered fit, premium performance fabric.' },
  { file: 'IMG_1421-removebg-preview.png', sku: 'nd-leopard-set-charcoal',
    name: 'Leopard Seamless Set - Charcoal', ...LEOPARD, description: 'Leopard Seamless Set in Charcoal. Women\u2019s studio drop \u2014 engineered fit, premium performance fabric.' },
  { file: 'IMG_3369-removebg-preview.png', sku: 'nd-leopard-set-blush',
    name: 'Leopard Seamless Set - Blush', ...LEOPARD, description: 'Leopard Seamless Set in Blush. Women\u2019s studio drop \u2014 engineered fit, premium performance fabric.' },
  { file: 'WhatsApp_Image_2026-09-22_at_13.07.22-removebg-preview.png', sku: 'nd-shredded-ls-set-pink',
    name: 'Shredded Long-Sleeve Set - Pink', price: 63000, offerPrice: 60000, category: 'Gymwear',
    description: 'Long-sleeve crop and high-waist short set with keyhole detail.' },
];

const productSchema = new mongoose.Schema({
  name: String, skus: { type: [String], default: undefined }, description: String,
  price: Number, offerPrice: Number, image: Array, category: String, date: Number,
}, { timestamps: true });
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

await mongoose.connect(env.MONGODB_URI, { dbName: 'quickcart' });
let added = 0, skipped = 0;
for (const p of NEW) {
  if (await Product.findOne({ skus: p.sku }).lean()) { console.log(`  ↷ exists: ${p.name}`); skipped++; continue; }
  const src = path.join(DL, p.file);
  if (!fs.existsSync(src)) { console.warn(`  ⚠ missing file: ${p.file}`); continue; }
  process.stdout.write(`  ↑ ${p.name} … `);
  const res = await cloudinary.uploader.upload(src, { folder: 'quickcart/products', public_id: p.sku, overwrite: true, invalidate: true });
  await Product.create({
    name: p.name, skus: [p.sku], description: p.description, price: p.price, offerPrice: p.offerPrice,
    image: [res.secure_url], category: p.category, date: Date.now(),
  });
  console.log('added'); added++;
}
console.log(`\n\u2713 added ${added}, skipped ${skipped}. Products now: ${await Product.countDocuments()}.`);
await mongoose.disconnect();
