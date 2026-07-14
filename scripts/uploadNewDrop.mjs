// ============================================================================
//  Upload the New Drop images to Cloudinary + regenerate assets/newDrop.js
// ============================================================================
//  Usage:
//     node scripts/uploadNewDrop.mjs           # upload + write data file
//     node scripts/uploadNewDrop.mjs --dry     # parse only, no upload/write
//
//  Put your (background-free) images in  newdrop-src/  named:
//
//        <slug>__<colorway>__<angle>.png
//
//     slug      = product id, e.g.  shadow-compression-tee
//     colorway  = color key,  e.g.  onyx
//     angle     = front | back | side
//
//  e.g.  shadow-compression-tee__onyx__front.png
//        shadow-compression-tee__onyx__back.png
//        shadow-compression-tee__ember__front.png   (a color dupe)
//        apex-training-hoodie__slate__side.png       (adds a side angle)
//
//  Optional  newdrop-src/manifest.json  supplies names / prices / hex colors
//  (see newdrop-src/README.md). Anything missing is auto-derived.
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { v2 as cloudinary } from 'cloudinary';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'newdrop-src');
const OUT = path.join(ROOT, 'assets', 'newDrop.js');
const DRY = process.argv.includes('--dry');
const ANGLES = ['front', 'side', 'back'];

// --- tiny .env loader (no dependency) --------------------------------------
function loadEnv() {
  const p = path.join(ROOT, '.env');
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const titleCase = (s) => s.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

function readManifest() {
  const p = path.join(SRC, 'manifest.json');
  if (!fs.existsSync(p)) return { meta: {}, products: {} };
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (e) { console.error('⚠  manifest.json is not valid JSON:', e.message); return { meta: {}, products: {} }; }
}

// --- collect + parse image files -------------------------------------------
function collect() {
  if (!fs.existsSync(SRC)) {
    console.error(`✗ Folder not found: ${SRC}\n  Create it and add your images (see the header of this script).`);
    process.exit(1);
  }
  const files = fs.readdirSync(SRC).filter((f) => /\.(png|webp|jpe?g)$/i.test(f));
  const parsed = [];
  for (const file of files) {
    const base = file.replace(/\.(png|webp|jpe?g)$/i, '');
    const parts = base.split('__');
    if (parts.length !== 3) {
      console.warn(`⚠  skipping "${file}" — expected <slug>__<colorway>__<angle>`);
      continue;
    }
    const [slug, colorway, angleRaw] = parts;
    const angle = angleRaw.toLowerCase();
    if (!ANGLES.includes(angle)) {
      console.warn(`⚠  skipping "${file}" — angle must be one of ${ANGLES.join(' / ')}`);
      continue;
    }
    parsed.push({ file, slug, colorway, angle });
  }
  if (!parsed.length) { console.error('✗ No valid images found in newdrop-src/.'); process.exit(1); }
  return parsed;
}

const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Build straight from a hand-matched mapping.json (no filename convention needed).
// Uploads each referenced image once (cached by filename) and swaps in the URL.
async function buildFromMapping(mapping) {
  const cache = new Map(); // filename -> url
  const upload = async (file, publicId) => {
    if (cache.has(file)) return cache.get(file);
    if (!fs.existsSync(path.join(SRC, file))) {
      console.warn(`⚠  missing file referenced in mapping: ${file}`);
      return null;
    }
    let url;
    if (DRY) url = `https://res.cloudinary.com/<cloud>/image/upload/quickcart/newdrop/${publicId}.png`;
    else { process.stdout.write(`↑ ${file} … `); url = await uploadOne(file, publicId); console.log('done'); }
    cache.set(file, url);
    return url;
  };

  const products = [];
  for (const p of mapping.products || []) {
    const colorways = [];
    for (const cw of p.colorways || []) {
      const angles = {};
      for (const a of ANGLES) {
        if (cw.angles && cw.angles[a]) {
          const pid = `${p.slug}__${slugify(cw.name)}__${a}`;
          const url = await upload(cw.angles[a], pid);
          if (url) angles[a] = url;
        }
      }
      if (!angles.front && !angles.back && !angles.side) continue;
      colorways.push({ name: cw.name, hex: cw.hex || '#888888', angles });
    }
    if (colorways.length) {
      products.push({
        slug: p.slug,
        name: p.name || titleCase(p.slug),
        description: p.description || 'New drop piece.',
        price: p.price ?? 0,
        offerPrice: p.offerPrice ?? p.price ?? 0,
        colorways,
      });
    }
  }
  return products;
}

async function uploadOne(file, publicId) {
  const res = await cloudinary.uploader.upload(path.join(SRC, file), {
    folder: 'quickcart/newdrop',
    public_id: publicId,
    overwrite: true,
    invalidate: true,
    resource_type: 'image',
  });
  return res.secure_url;
}

// --- build the nested product structure ------------------------------------
async function build(parsed, manifest) {
  const bySlug = new Map();
  for (const item of parsed) {
    if (!bySlug.has(item.slug)) bySlug.set(item.slug, new Map());
    const cw = bySlug.get(item.slug);
    if (!cw.has(item.colorway)) cw.set(item.colorway, {});
    const publicId = `${item.slug}__${item.colorway}__${item.angle}`;
    let url;
    if (DRY) { url = `https://res.cloudinary.com/<cloud>/image/upload/quickcart/newdrop/${publicId}.png`; }
    else {
      process.stdout.write(`↑ ${item.file} … `);
      url = await uploadOne(item.file, publicId);
      console.log('done');
    }
    cw.get(item.colorway)[item.angle] = url;
  }

  const products = [];
  for (const [slug, colorways] of bySlug) {
    const pm = manifest.products?.[slug] || {};
    // colorway order: manifest key order first, then any extras alphabetically
    const cwKeys = Object.keys(pm.colorways || {});
    const extra = [...colorways.keys()].filter((k) => !cwKeys.includes(k)).sort();
    const orderedCw = [...cwKeys.filter((k) => colorways.has(k)), ...extra];

    products.push({
      order: pm.order ?? 999,
      slug,
      name: pm.name || titleCase(slug),
      description: pm.description || 'New drop piece.',
      price: pm.price ?? 0,
      offerPrice: pm.offerPrice ?? pm.price ?? 0,
      colorways: orderedCw.map((ck) => {
        const cm = pm.colorways?.[ck] || {};
        // matched angle set, in front/side/back order
        const angles = {};
        for (const a of ANGLES) if (colorways.get(ck)[a]) angles[a] = colorways.get(ck)[a];
        if (!angles.front) console.warn(`⚠  ${slug}/${ck} has no FRONT image — hover will start on ${Object.keys(angles)[0]}`);
        if (!angles.back) console.warn(`⚠  ${slug}/${ck} has no BACK image — nothing to reveal on hover`);
        return { name: cm.name || titleCase(ck), hex: cm.hex || '#888888', angles };
      }),
    });
  }
  products.sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
  products.forEach((p) => delete p.order);
  return products;
}

function writeDataFile(products, manifest) {
  const meta = {
    title: manifest.meta?.title || 'New Drop',
    tagline: manifest.meta?.tagline || 'New Release',
    blurb: manifest.meta?.blurb || 'Hover any piece to see the back.',
  };
  const banner = '// AUTO-GENERATED by scripts/uploadNewDrop.mjs — edit the images/manifest, not this file.';
  const body =
`${banner}
export const newDropMeta = ${JSON.stringify(meta, null, 2)};

export const newDrop = ${JSON.stringify(products, null, 2)};
`;
  fs.writeFileSync(OUT, body);
  console.log(`\n✓ Wrote ${path.relative(ROOT, OUT)} — ${products.length} product(s).`);
}

function configCloudinary() {
  for (const k of ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']) {
    if (!process.env[k]) { console.error(`✗ Missing ${k} in .env`); process.exit(1); }
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

async function main() {
  loadEnv();

  // Preferred path: a hand-matched mapping.json (no filename convention needed).
  const mappingPath = path.join(SRC, 'mapping.json');
  if (fs.existsSync(mappingPath)) {
    const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
    if (!DRY) configCloudinary();
    console.log(`${DRY ? '(dry run) ' : ''}Using mapping.json — ${mapping.products?.length || 0} product(s)`);
    const products = await buildFromMapping(mapping);
    if (DRY) {
      console.dir(products.map((p) => ({ slug: p.slug, colorways: p.colorways.map((c) => `${c.name}[${Object.keys(c.angles).join(',')}]`) })), { depth: null });
      console.log('\n(dry run — nothing uploaded, data file not written)');
      return;
    }
    writeDataFile(products, { meta: mapping.meta || {} });
    return;
  }

  // Fallback path: parse <slug>__<colorway>__<angle> filenames.
  const manifest = readManifest();
  const parsed = collect();
  if (!DRY) configCloudinary();

  console.log(`${DRY ? '(dry run) ' : ''}Found ${parsed.length} image(s) in newdrop-src/`);
  const products = await build(parsed, manifest);
  if (DRY) {
    console.log('\nParsed structure:');
    console.dir(products.map((p) => ({ slug: p.slug, colorways: p.colorways.map((c) => `${c.name}[${Object.keys(c.angles).join(',')}]`) })), { depth: null });
    console.log('\n(dry run — nothing uploaded, data file not written)');
    return;
  }
  writeDataFile(products, manifest);
}

main().catch((e) => { console.error('\n✗ Failed:', e.message); process.exit(1); });
