// One-off: upload the social/lifestyle shots to Cloudinary (quickcart/social)
// and print a JS array of delivery URLs to paste into the FollowSocials section.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { v2 as cloudinary } from 'cloudinary';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const line of fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const files = ['IMG_3322', 'IMG_3321', 'IMG_3320', 'IMG_3325', 'IMG_3323'];
const SRC = path.join(ROOT, 'new images no bg');
const urls = [];
for (const f of files) {
  const res = await cloudinary.uploader.upload(path.join(SRC, `${f}.jpg`), {
    folder: 'quickcart/social', public_id: f, overwrite: true, resource_type: 'image',
  });
  urls.push(res.secure_url.replace('/upload/', '/upload/f_auto,q_auto:good/'));
  console.log('  ↑', f);
}
console.log('\n' + JSON.stringify(urls, null, 2));
