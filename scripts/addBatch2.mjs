// One-off: process the 2026-09-22 batch —
//   • replace Shredded Long-Sleeve Set - Pink's photo
//   • new product: Shredded Scrunch Romper - Pink
//   • new colours: Flare Jumpsuit - Red (shoes removed), Shredded LS Set - Blush
// Idempotent by sku / name.
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
cloudinary.config({ cloud_name: env.CLOUDINARY_CLOUD_NAME, api_key: env.CLOUDINARY_API_KEY, api_secret: env.CLOUDINARY_API_SECRET });

const upload = async (file, publicId) => {
  const src = path.join(DL, file);
  if (!fs.existsSync(src)) throw new Error(`missing file: ${file}`);
  const r = await cloudinary.uploader.upload(src, { folder: 'quickcart/products', public_id: publicId, overwrite: true, invalidate: true });
  return r.secure_url;
};
const withTransform = (url, t) => url.replace('/upload/', `/upload/${t}/`);

const productSchema = new mongoose.Schema({
  name: String, skus: { type: [String], default: undefined }, description: String,
  price: Number, offerPrice: Number, image: Array, category: String, date: Number,
}, { timestamps: true });
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

await mongoose.connect(env.MONGODB_URI, { dbName: 'quickcart' });

const priceOf = async (sku) => {
  const d = await Product.findOne({ skus: sku }, { price: 1, offerPrice: 1 }).lean();
  return d ? { price: d.price, offerPrice: d.offerPrice } : { price: 55000, offerPrice: 45000 };
};
const create = async (doc) => {
  if (doc.skus && await Product.findOne({ skus: doc.skus[0] }).lean()) { console.log(`  ↷ exists: ${doc.name}`); return; }
  await Product.create({ ...doc, date: Date.now() });
  console.log(`  + ${doc.name}`);
};

// 1) REPLACE Shredded Long-Sleeve Set - Pink photo
{
  const url = await upload('WhatsApp_Image_2026-09-22_at_20.13.43-removebg-preview (1).png', 'shredded-ls-set-pink');
  const r = await Product.updateOne({ skus: 'nd-shredded-ls-set-pink' }, { $set: { image: [url] } });
  console.log(`  ~ replaced Pink LS Set photo (matched ${r.matchedCount})`);
}

// 2) NEW: Flare Jumpsuit - Red (remove shoes)
{
  const raw = await upload('IMG_2088.JPG-removebg-preview.png', 'flare-jumpsuit-red');
  const img = withTransform(raw, 'e_gen_remove:prompt_shoes;multiple_true');
  const { price, offerPrice } = await priceOf('nd-flare-jumpsuit-black');
  await create({ name: 'Flare Jumpsuit - Red', skus: ['nd-flare-jumpsuit-red'], category: 'Gymwear',
    price, offerPrice, image: [img], description: 'Piped racerback flare jumpsuit with sculpting seams.' });
}

// 3) NEW colour: Shredded Long-Sleeve Set - Blush
{
  const front = await upload('WhatsApp_Image_2026-09-22_at_20.38.44-removebg-preview.png', 'shredded-ls-set-blush-a');
  const back = await upload('WhatsApp_Image_2026-09-22_at_20.38.43__2_-removebg-preview.png', 'shredded-ls-set-blush-b');
  const { price, offerPrice } = await priceOf('nd-shredded-ls-set-black');
  await create({ name: 'Shredded Long-Sleeve Set - Blush', skus: ['nd-shredded-ls-set-blush'], category: 'Gymwear',
    price, offerPrice, image: [front, back], description: 'Long-sleeve crop and high-waist legging set with keyhole detail.' });
}

// 4) NEW product: Shredded Scrunch Romper - Pink
{
  const front = await upload('WhatsApp_Image_2026-09-22_at_20.38.43__1_-removebg-preview.png', 'scrunch-romper-pink-front');
  const back = await upload('WhatsApp_Image_2026-09-22_at_20.38.42-removebg-preview.png', 'scrunch-romper-pink-back');
  await create({ name: 'Shredded Scrunch Romper - Pink', skus: ['nd-scrunch-romper-pink'], category: 'Gymwear',
    price: 55000, offerPrice: 48000, image: [front, back], description: 'Sleeveless scrunch-back zip romper in seamless stretch fabric.' });
}

// 5) REPLACE Shredded Shorts photo
{
  const url = await upload('WhatsApp_Image_2026-09-22_at_20.47.28-removebg-preview.png', 'shredded-shorts-black');
  const r = await Product.updateOne({ skus: 'tr-shredded-shorts' }, { $set: { image: [url] } });
  console.log(`  ~ replaced Shredded Shorts photo (matched ${r.matchedCount})`);
}

console.log(`\n\u2713 done. Products now: ${await Product.countDocuments()}.`);
await mongoose.disconnect();
