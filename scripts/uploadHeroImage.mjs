// One-off: upload a local image to Cloudinary (quickcart/hero) and print the URL.
// Usage: node scripts/uploadHeroImage.mjs "<local path>" <publicId>
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

const file = process.argv[2];
const publicId = process.argv[3] || path.parse(file).name;
const res = await cloudinary.uploader.upload(file, {
  folder: 'quickcart/hero', public_id: publicId, overwrite: true, resource_type: 'image',
});
console.log(res.secure_url.replace('/upload/', '/upload/f_auto,q_auto:best/'));
