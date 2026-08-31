// Probe the shared Atlas `quickcart` DB: list users newest-first.
// Run before + after a live signup to prove the Clerk->Inngest->Mongo sync.
import { readFileSync } from 'fs';
import mongoose from 'mongoose';

// minimal .env reader (project uses Next's loader, no dotenv installed)
const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const uri = env.MONGODB_URI;
if (!uri) { console.error('No MONGODB_URI in .env'); process.exit(1); }

await mongoose.connect(uri, { dbName: 'quickcart' });
const users = mongoose.connection.collection('users');

const total = await users.countDocuments();
const rows = await users.find({}, { projection: { email: 1, name: 1, createdAt: 1 } })
  .sort({ createdAt: -1 }).limit(10).toArray();

console.log(`\nusers in quickcart: ${total}`);
console.log('most recent (up to 10):');
for (const u of rows) {
  const when = u.createdAt ? new Date(u.createdAt).toISOString() : '(no createdAt)';
  console.log(`  ${when}  ${u.email || '(no email)'}  ${u.name || ''}  [${u._id}]`);
}
await mongoose.disconnect();
