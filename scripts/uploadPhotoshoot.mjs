// ============================================================================
//  Upload the background-removed studio photoshoot to Cloudinary
//  and regenerate assets/photoshoot.js
// ----------------------------------------------------------------------------
//  The cutouts in "new images no bg/" are already light (~9.6 MB total) and
//  fairly low-res, so we DON'T downscale — quality first. We keep alpha (PNG),
//  apply a light sharpen to counter the removebg softness, and deliver via
//  Cloudinary with f_auto,q_auto:best (auto WebP/AVIF-with-alpha per browser).
//
//  Groupings were hand-matched from a visual contact sheet:
//    • single-model cutouts -> trending product cards (WebGL cycle-on-hover)
//    • 2-person cutouts      -> banner imagery
//    • category tiles        -> one strong cutout per category
//
//  Usage:  node scripts/uploadPhotoshoot.mjs         (upload + write)
//          node scripts/uploadPhotoshoot.mjs --dry   (report plan only)
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'new images no bg');
const OUT = path.join(ROOT, 'assets', 'photoshoot.js');
const DRY = process.argv.includes('--dry');

// ---- curated catalog (keys are the IMG_#### stems; files resolved below) ----
// NOTE on a few groupings (indicated per the shoot review):
//  • muscle-tank (IMG_3095) is ITS OWN product — one-arm pose, no back shot.
//  • the two graphic tees (IMG_3094 / IMG_3108) are TWO different products.
//  • tapered-joggers pairs a GREY front (IMG_3100) with a BACK shot (IMG_3084) —
//    same product, different variant.
//  • cropped-jorts (IMG_3093) has NO back image in the shoot (front only).
const TRENDING = [
  // --- men's ---
  { slug: 'crimson-quarter-zip', name: 'Compression Quarter-Zip', tag: 'Crimson', gender: 'men', hex: '#8f1f24', price: 65, offerPrice: 52, ids: ['daf5a7b8-8df8-465e-b7f7-0ff3b3708649-removebg-preview (1).png', 'IMG_3081', 'IMG_3122'] },
  { slug: 'onyx-quarter-zip',    name: 'Compression Quarter-Zip', tag: 'Onyx',    gender: 'men', hex: '#141414', price: 65, offerPrice: 52, ids: ['IMG_3092', 'IMG_3102', 'IMG_3105'] },
  { slug: 'training-tank',       name: 'Sleeveless Training Tank', tag: 'Black',  gender: 'men', hex: '#141414', price: 40, offerPrice: 32, ids: ['IMG_3090', 'IMG_3088', 'IMG_3087'] },
  { slug: 'muscle-tank',         name: 'Sleeveless Muscle Tank',   tag: 'Black',  gender: 'men', hex: '#141414', price: 40, offerPrice: 32, ids: ['IMG_3095'] }, // own product: one-arm, no back
  { slug: 'white-training-tank', name: 'Sleeveless Training Tank', tag: 'White',  gender: 'men', hex: '#e9e6df', price: 40, offerPrice: 32, ids: ['IMG_3103'] }, // single
  { slug: 'shredded-tee',        name: 'Shredded Graphic Tee',     tag: 'White Print', gender: 'men', hex: '#141414', price: 45, offerPrice: 36, ids: ['IMG_3094'] },
  { slug: 'shredded-storm-tee',  name: 'Shredded Storm Tee',       tag: 'Blue Print',  gender: 'men', hex: '#1c2733', price: 45, offerPrice: 36, ids: ['IMG_3108'] },
  { slug: 'shredded-shorts',     name: 'Shredded Shorts',          tag: 'Black',  gender: 'men', hex: '#141414', price: 38, offerPrice: 30, ids: ['IMG_3107'] }, // single
  { slug: 'cropped-jorts',       name: 'Cropped Jorts',            tag: 'Sand',   gender: 'men', hex: '#c9b79c', price: 48, offerPrice: 39, ids: ['IMG_3093'] }, // single (no back shot)
  { slug: 'tapered-joggers',     name: 'Tapered Joggers',          tag: 'Grey',   gender: 'men', hex: '#6f7175', price: 55, offerPrice: 45, ids: ['IMG_3100', 'IMG_3084'] }, // grey front + back variant
  // --- women's ---
  { slug: 'leopard-set',         name: 'Leopard Seamless Set',     tag: 'Burgundy', gender: 'women', hex: '#5c1418', price: 70, offerPrice: 58, ids: ['IMG_3113', 'IMG_3115', 'IMG_3114'] },
  { slug: 'ribbed-ls-set',       name: 'Ribbed Long-Sleeve Set',   tag: 'Mauve',   gender: 'women', hex: '#7c4a52', price: 68, offerPrice: 55, ids: ['IMG_3099', 'IMG_3121'] },
  { slug: 'sculpt-bodysuit',     name: 'Sculpt Bodysuit',          tag: 'Blush',   gender: 'women', hex: '#d8b9b6', price: 75, offerPrice: 60, ids: ['IMG_3117', 'IMG_3104', 'IMG_3106'] },
  { slug: 'flare-jumpsuit',      name: 'Flare Jumpsuit',           tag: 'Black',   gender: 'women', hex: '#141414', price: 80, offerPrice: 64, ids: ['IMG_3110', 'IMG_3111'] },
  { slug: 'cropped-set',         name: 'Cropped Two-Piece Set',    tag: 'Black',   gender: 'women', hex: '#141414', price: 62, offerPrice: 50, ids: ['IMG_3118', 'IMG_3312'] }, // front + new second image
  { slug: 'piped-set',           name: 'Piped Two-Piece Set',      tag: 'Red',     gender: 'women', hex: '#8f1f24', price: 68, offerPrice: 55, ids: ['IMG_3109'] }, // single
];

// 2-person cutouts -> banners
const BANNERS = { elevate: 'IMG_3097', alt: 'IMG_3096' };

// Featured Categories tiles (all transparent cutouts, composited on a dark tile).
const CATEGORIES = [
  { label: "Women's", href: '/women', id: 'IMG_3117' },
  { label: "Men's",   href: '/men',   id: 'IMG_3092' },
];

// --- tiny .env loader -------------------------------------------------------
function loadEnv() {
  const p = path.join(ROOT, '.env');
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

// deliver as best-quality auto format (keeps alpha via webp/avif)
const optimize = (url) => url.replace('/upload/', '/upload/f_auto,q_auto:best/');

// resolve an IMG_#### stem to the actual (deduped) filename in SRC
const allFiles = fs.existsSync(SRC) ? fs.readdirSync(SRC) : [];
function resolveFile(id) {
  if (allFiles.includes(id)) return id; // id given as a full filename
  const cands = [
    `${id}-removebg-preview.png`,
    `${id}_1-removebg-preview.png`,
    `${id}-removebg-preview (1).png`,
  ];
  for (const c of cands) if (allFiles.includes(c)) return c;
  return allFiles.find((f) => f.startsWith(id + '-') || f.startsWith(id + '_')) || null;
}

// clean, stable Cloudinary public_id: IMG_#### stays as-is; full filenames get
// their -removebg-preview suffix stripped and sanitized.
function publicIdFor(id, file) {
  if (/^IMG_\d+$/.test(id)) return id;
  return path.parse(file).name
    .replace(/-removebg-preview.*$/, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

const cache = new Map(); // id -> optimized url

async function uploadId(id) {
  if (cache.has(id)) return cache.get(id);
  const file = resolveFile(id);
  if (!file) { console.warn(`⚠  no file for ${id}`); return null; }
  const pid = publicIdFor(id, file);

  // native resolution, keep alpha, no sharpen (sharpening distorted faces)
  const buf = await sharp(path.join(SRC, file))
    .png({ compressionLevel: 9 })
    .toBuffer();

  if (DRY) {
    console.log(`   ${id} <- ${file} (${(buf.length / 1024).toFixed(0)} KB)`);
    const url = `https://res.cloudinary.com/<cloud>/image/upload/f_auto,q_auto:best/quickcart/photoshoot/${pid}.png`;
    cache.set(id, url); return url;
  }

  const url = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'quickcart/photoshoot', public_id: pid, overwrite: true, resource_type: 'image' },
      (err, res) => (err ? reject(err) : resolve(res.secure_url))
    );
    stream.end(buf);
  });
  const opt = optimize(url);
  cache.set(id, opt);
  process.stdout.write(`   ↑ ${id} (${(buf.length / 1024).toFixed(0)} KB)\n`);
  return opt;
}

async function main() {
  loadEnv();
  if (!fs.existsSync(SRC)) { console.error(`✗ Folder not found: ${SRC}`); process.exit(1); }
  if (!DRY) {
    for (const k of ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']) {
      if (!process.env[k]) { console.error(`✗ Missing ${k} in .env`); process.exit(1); }
    }
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  console.log(`${DRY ? '(dry) ' : ''}Trending products:`);
  const trending = [];
  for (const p of TRENDING) {
    const images = [];
    for (const id of p.ids) { const u = await uploadId(id); if (u) images.push(u); }
    if (images.length) trending.push({ slug: p.slug, name: p.name, tag: p.tag, gender: p.gender, hex: p.hex, price: p.price, offerPrice: p.offerPrice, images });
  }

  console.log(`${DRY ? '(dry) ' : ''}Banners:`);
  const banners = {};
  for (const [k, id] of Object.entries(BANNERS)) { const u = await uploadId(id); if (u) banners[k] = u; }

  console.log(`${DRY ? '(dry) ' : ''}Categories:`);
  const categories = [];
  for (const c of CATEGORIES) {
    const image = c.id ? await uploadId(c.id) : optimize(c.cloud);
    categories.push({ label: c.label, href: c.href, image });
  }

  const head = '// AUTO-GENERATED by scripts/uploadPhotoshoot.mjs — do not edit by hand.';
  const body = `${head}
export const trending = ${JSON.stringify(trending, null, 2)};

export const photoBanners = ${JSON.stringify(banners, null, 2)};

export const featuredCategories = ${JSON.stringify(categories, null, 2)};
`;
  if (DRY) { console.log('\n(dry run — nothing uploaded, data file not written)'); return; }
  fs.writeFileSync(OUT, body);
  console.log(`\n✓ Wrote ${path.relative(ROOT, OUT)} — ${trending.length} trending, ${Object.keys(banners).length} banners, ${categories.length} categories.`);
}

main().catch((e) => { console.error('\n✗ Failed:', e.message); process.exit(1); });
