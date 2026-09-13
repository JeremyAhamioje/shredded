// ============================================================================
//  One-off: upload the "new products" cutouts to Cloudinary and APPEND them as
//  New Drop entries in assets/newDrop.js (non-destructive — existing products
//  with other slugs are kept; re-running replaces only these slugs).
//     node scripts/uploadNewProducts.mjs          # upload + write
//     node scripts/uploadNewProducts.mjs --dry     # no upload, show plan
// ============================================================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { v2 as cloudinary } from 'cloudinary';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'new products');
const OUT = path.join(ROOT, 'assets', 'newDrop.js');
const DRY = process.argv.includes('--dry');

function loadEnv() {
  for (const line of fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

// filename in "new products/"  ->  cloudinary public_id
const FILES = {
  'WhatsApp_Image_2026-09-13_at_01.14.28-removebg-preview.png':            'wide-leg-sweatpants__tan__front',
  'WhatsApp_Image_2026-09-13_at_01.14.28_-_Copy-removebg-preview.png':     'wide-leg-sweatpants__tan__back',
  'WhatsApp_Image_2026-09-13_at_01.14.34-removebg-preview.png':            'wide-leg-sweatpants__grey__front',
  'WhatsApp_Image_2026-09-13_at_01.14.34__3_-removebg-preview.png':        'shredded-ls-set__black__front',
  'WhatsApp_Image_2026-09-13_at_01.14.34__2_-removebg-preview.png':        'shredded-ls-set__black__back',
  'WhatsApp_Image_2026-09-13_at_01.14.34__4_-removebg-preview.png':        'flare-jumpsuit__black__front',
  'WhatsApp_Image_2026-09-13_at_01.14.34__4__-_Copy-removebg-preview.png': 'flare-jumpsuit__black__back',
  'WhatsApp_Image_2026-09-13_at_01.14.34__5_-removebg-preview.png':        'ribbed-ls-set__mauve__front',
  'WhatsApp_Image_2026-09-13_at_01.14.34__5__-_Copy-removebg-preview.png': 'ribbed-ls-set__mauve__back',
  'WhatsApp_Image_2026-09-13_at_01.14.34__6_-removebg-preview.png':        'contrast-shorts__black__front',
  'WhatsApp_Image_2026-09-13_at_01.14.34__6__-_Copy-removebg-preview.png': 'contrast-shorts__black__back',
  'WhatsApp_Image_2026-09-13_at_01.14.34__7_-removebg-preview.png':        'piped-set__red__front',
  'WhatsApp_Image_2026-09-13_at_01.14.34__7__-_Copy-removebg-preview.png': 'piped-set__red__back',
  'WhatsApp_Image_2026-09-13_at_01.14.34__8_-removebg-preview.png':        'leopard-set__burgundy__front',
  'WhatsApp_Image_2026-09-13_at_01.14.34__8__-_Copy-removebg-preview.png': 'leopard-set__burgundy__back',
};

// product definitions (angles reference the public_ids above)
const PRODUCTS = (U) => [
  { slug: 'wide-leg-sweatpants', name: 'Wide-Leg Sweatpants', description: 'Relaxed wide-leg sweatpants in heavyweight brushed fleece with embroidered crest.', price: 55000, offerPrice: 45000,
    colorways: [
      { name: 'Tan',  hex: '#c9a97e', angles: { front: U['wide-leg-sweatpants__tan__front'], back: U['wide-leg-sweatpants__tan__back'] } },
      { name: 'Grey', hex: '#b8bcc0', angles: { front: U['wide-leg-sweatpants__grey__front'] } },
    ] },
  { slug: 'shredded-ls-set', name: 'Shredded Long-Sleeve Set', description: 'Long-sleeve crop and high-waist legging set with keyhole detail.', price: 55000, offerPrice: 45000,
    colorways: [ { name: 'Black', hex: '#141414', angles: { front: U['shredded-ls-set__black__front'], back: U['shredded-ls-set__black__back'] } } ] },
  { slug: 'flare-jumpsuit', name: 'Flare Jumpsuit', description: 'Piped racerback flare jumpsuit with sculpting seams.', price: 55000, offerPrice: 45000,
    colorways: [ { name: 'Black', hex: '#141414', angles: { front: U['flare-jumpsuit__black__front'], back: U['flare-jumpsuit__black__back'] } } ] },
  { slug: 'ribbed-ls-set', name: 'Ribbed Long-Sleeve Set', description: 'Ribbed seamless bra, shrug and legging three-piece set.', price: 55000, offerPrice: 45000,
    colorways: [ { name: 'Mauve', hex: '#8e6b7e', angles: { front: U['ribbed-ls-set__mauve__front'], back: U['ribbed-ls-set__mauve__back'] } } ] },
  { slug: 'contrast-shorts', name: 'Contrast Shorts', description: 'Fleece shorts with contrast topstitching and circle logo.', price: 45000, offerPrice: 38000,
    colorways: [ { name: 'Black', hex: '#141414', angles: { front: U['contrast-shorts__black__front'], back: U['contrast-shorts__black__back'] } } ] },
  { slug: 'piped-set', name: 'Piped Two-Piece Set', description: 'Racerback bra and legging set with contrast piping.', price: 55000, offerPrice: 45000,
    colorways: [ { name: 'Red', hex: '#b11d2a', angles: { front: U['piped-set__red__front'], back: U['piped-set__red__back'] } } ] },
  { slug: 'leopard-set', name: 'Leopard Seamless Set', description: 'Leopard-print seamless racerback bra with contrast binding.', price: 55000, offerPrice: 45000,
    colorways: [ { name: 'Burgundy', hex: '#5c1a2b', angles: { front: U['leopard-set__burgundy__front'], back: U['leopard-set__burgundy__back'] } } ] },
];

function readCurrent() {
  const txt = fs.readFileSync(OUT, 'utf8');
  const meta = JSON.parse(txt.split('export const newDropMeta =')[1].split('export const newDrop =')[0].trim().replace(/;\s*$/, ''));
  const arr = JSON.parse(txt.split('export const newDrop =')[1].trim().replace(/;\s*$/, ''));
  return { meta, arr };
}

async function uploadOne(file, publicId) {
  const res = await cloudinary.uploader.upload(path.join(SRC, file), {
    folder: 'quickcart/newdrop', public_id: publicId, overwrite: true, invalidate: true, resource_type: 'image',
  });
  return res.secure_url;
}

async function main() {
  loadEnv();
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const U = {};
  for (const [file, pid] of Object.entries(FILES)) {
    if (!fs.existsSync(path.join(SRC, file))) { console.warn(`⚠  missing: ${file}`); continue; }
    if (DRY) { U[pid] = `https://res.cloudinary.com/<cloud>/image/upload/quickcart/newdrop/${pid}.png`; }
    else { process.stdout.write(`↑ ${pid} … `); U[pid] = await uploadOne(file, pid); console.log('done'); }
  }

  const newOnes = PRODUCTS(U);
  const newSlugs = new Set(newOnes.map((p) => p.slug));
  const { meta, arr } = readCurrent();
  const kept = arr.filter((p) => !newSlugs.has(p.slug)); // drop prior versions of these slugs
  const merged = [...kept, ...newOnes];

  if (DRY) {
    console.dir(newOnes.map((p) => ({ slug: p.slug, colorways: p.colorways.map((c) => `${c.name}[${Object.keys(c.angles).join(',')}]`) })), { depth: null });
    console.log('\n(dry run — nothing uploaded/written)');
    return;
  }

  const banner = '// AUTO-GENERATED by scripts/uploadNewProducts.mjs — edit the images, not this file.';
  fs.writeFileSync(OUT, `${banner}\nexport const newDropMeta = ${JSON.stringify(meta, null, 2)};\n\nexport const newDrop = ${JSON.stringify(merged, null, 2)};\n`);
  console.log(`\n✓ Wrote assets/newDrop.js — ${merged.length} products (${kept.length} kept + ${newOnes.length} new).`);
}

main().catch((e) => { console.error('\n✗ Failed:', e.message); process.exit(1); });
