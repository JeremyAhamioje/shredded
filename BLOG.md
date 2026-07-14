# Building QuickCart — Architecture, Decisions, and the Why Behind the How

QuickCart is a full-stack gymwear e-commerce platform built with Next.js. This post walks through every significant architectural decision made during the build — what was chosen, what was rejected, and the reasoning that drove each call.

---

## The Stack at a Glance

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Database | MongoDB (via Mongoose) |
| Auth | Clerk |
| Payments | Paystack |
| Image hosting | Cloudinary |
| Background jobs | Inngest |
| Deployment target | Vercel (edge-compatible) |

---

## 1. Next.js App Router — One Codebase, No Separate Backend

The first decision was whether to build a separate backend API (Express, Fastify, etc.) or colocate everything inside Next.js.

We went with Next.js App Router and its Route Handlers. Every API endpoint lives inside `app/api/` alongside the frontend pages. The reasons:

- **Zero context-switching.** Product, order, cart, and payment logic all live in the same repo with shared models and config.
- **Edge-friendly by default.** Middleware runs at the edge via Vercel; individual routes can opt into Node.js when needed (e.g. for Cloudinary's stream API).
- **No CORS headaches.** Frontend and API are the same origin.

The trade-off: a monolith is harder to scale individual services independently. For an e-commerce store at this stage that is a non-issue — premature separation would just add operational complexity.

---

## 2. MongoDB — Documents Match How E-Commerce Data Actually Looks

A relational database would have served the basic order/product/user tables fine. MongoDB was chosen because:

- **Product catalogues are variable.** Different categories carry different attributes. A document store handles this without nullable columns or EAV hacks.
- **Cart is a bag, not a table.** The user's cart is stored as a plain JSON object (`{ productId: quantity }`) directly on the User document. No join table, no cart session ID — just read and write one document.
- **Mongoose gives us schema validation without sacrificing flexibility.** We get typed models and middleware hooks while keeping the ability to embed related data when it makes sense.

### Connection Singleton

```js
let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "quickcart" });
  isConnected = true;
};
```

Every Route Handler calls `connectDB()` before touching the database. The singleton flag prevents opening a new connection on every serverless function cold-start — a common performance pitfall in Next.js + MongoDB setups.

---

## 3. Clerk — Auth as a Service, Not a Feature

Writing auth from scratch (JWT issuance, session management, password hashing, refresh tokens) is weeks of work that adds no business value. Clerk handles all of it.

### The User ID Decision

Clerk assigns every user a unique ID like `user_2abc...`. Rather than generating a separate MongoDB `_id` and maintaining a mapping table, the Clerk user ID **is** the MongoDB `_id`:

```js
const userSchema = new mongoose.Schema({
  _id: { type: String }, // Clerk user ID
  email: String,
  name: String,
  cartItems: { type: Object, default: {} },
}, { _id: false });
```

Setting `_id: false` tells Mongoose not to auto-generate an ObjectId. Every query that needs the current user can just pass `userId` from `getAuth(request)` straight into `findById()` — no join, no lookup.

### Role-Based Seller Access

Rather than a roles table, seller authorization lives inside Clerk's user metadata:

```js
const authSeller = async (userId) => {
  const user = await clerkClient().users.getUser(userId);
  return user.publicMetadata.role === 'seller';
};
```

To make someone a seller you set `publicMetadata.role = 'seller'` in the Clerk dashboard. No database migration, no code deployment — it takes ten seconds and works immediately.

### Middleware Route Protection

`middleware.ts` uses Clerk's `clerkMiddleware` to protect every route by default, with an explicit allowlist of public routes:

```ts
const isPublicRoute = createRouteMatcher([
  '/',
  '/all-products',
  '/product/(.*)',
  '/api/product/list',
  '/api/paystack/webhook', // Paystack has no Clerk token
  '/api/inngest',
  ...
])
```

The Paystack webhook and Inngest endpoint are explicitly public because external services call them — they carry their own verification (HMAC signature and Inngest signing key respectively).

---

## 4. Paystack — Payment Integration for African Markets

Paystack was chosen over Stripe because it has first-class support for Nigerian payment methods (cards, bank transfer, USSD) and significantly simpler onboarding for Nigerian businesses.

### The Dual-Confirmation Pattern

Payment confirmation uses two independent paths:

```
User pays → Paystack → Webhook hits /api/paystack/webhook (server-to-server, immediate)
                    → Frontend polls /api/paystack/verify  (user-facing, on return)
```

**Why both?** Webhooks are reliable but async — they can arrive seconds after the user lands on the success page. The frontend verify call gives the user immediate feedback. The verify endpoint checks `order.isPaid` first and short-circuits if the webhook already handled it, so neither path processes the payment twice.

### Webhook Security

Every webhook call from Paystack is verified with an HMAC-SHA512 signature before touching the database:

```js
const hash = crypto
  .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
  .update(body)
  .digest("hex");

if (hash !== signature) return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
```

Paystack's secret key is never exposed to the frontend — it only lives in server-side environment variables.

### Always Return 200 to Webhooks

```js
// Always 200 — if we return an error Paystack retries for hours
return NextResponse.json({ message: "ok" }, { status: 200 });
```

If the webhook handler returns a non-200, Paystack will retry the event repeatedly for several hours. The `try/catch` handles internal errors; the outer response always tells Paystack the event was received.

---

## 5. Cloudinary — Images Don't Belong in a Database

Storing binary image data in MongoDB is an antipattern — it bloats the database, slows queries, and bypasses CDN caching. Cloudinary handles image storage and delivery.

The upload flow on the seller dashboard:

1. Seller submits a product form with up to 4 images.
2. The Next.js Route Handler reads each file from `FormData`.
3. Each file is piped to Cloudinary via an upload stream.
4. Cloudinary returns a `secure_url` (a permanent CDN URL).
5. Only the URLs are saved to MongoDB.

```js
const stream = cloudinary.uploader.upload_stream(
  { folder: "quickcart" },
  (error, result) => resolve(result.secure_url)
);
stream.end(buffer);
```

All four uploads run in parallel via `Promise.all`, so product creation takes roughly as long as the slowest single upload rather than the sum of all four.

---

## 6. Inngest — Background Jobs Without a Queue Server

Post-payment processing (order confirmation triggers, analytics events) shouldn't block the HTTP response. Typically this means running a message queue (Redis + BullMQ, SQS, etc.). Inngest gives us durable background functions without managing any queue infrastructure.

### Clerk ↔ MongoDB User Sync

Clerk manages auth but MongoDB needs a copy of user data for order relations and cart storage. Inngest bridges them:

```
Clerk webhook → Inngest event (clerk/user.created)
             → syncUserCreation function → creates User in MongoDB

Clerk webhook → Inngest event (clerk/user.updated)
             → syncUserUpdation function → updates User in MongoDB

Clerk webhook → Inngest event (clerk/user.deleted)
             → syncUserDeletion function → deletes User from MongoDB
```

This keeps MongoDB's user collection in sync with Clerk without any cron jobs or polling. If MongoDB is briefly unavailable, Inngest retries automatically.

### Post-Payment Events

After a successful payment (from either the webhook or the verify endpoint), an `order/created` event is sent to Inngest:

```js
await inngest.send({
  name: "order/created",
  data: { orderId, userId, amount },
});
```

Any downstream logic (fulfilment triggers, loyalty points, analytics) can listen to this event without touching the payment flow.

---

## 7. Data Model Decisions

### Cart as a User Sub-Document

The cart is stored as a plain object on the User document:

```
cartItems: { "productId_abc": 2, "productId_def": 1 }
```

**Trade-offs accepted:**
- No cart history or abandoned cart analytics (acceptable for v1).
- Cart is wiped on successful payment by setting `cartItems: {}` on the User.
- No separate cart collection means one fewer database round-trip on every page load.

### Order Schema

```js
{
  userId: String,           // Clerk user ID (FK to User._id)
  items: [{ product, quantity }],
  amount: Number,
  address: ObjectId,        // ref to Address document
  status: String,           // "Order Placed" → "Payment Confirmed" → ...
  isPaid: Boolean,
  paystackReference: String // Paystack's unique transaction ID
}
```

`paystackReference` is stored on order creation (before payment) so the webhook can find the right order with a single query: `Order.findOne({ paystackReference: reference })`. Without this, the webhook would have no way to correlate an incoming payment to an order.

---

## 8. Local Development — ngrok for Webhook Testing

Paystack webhooks are server-to-server calls — they need a publicly reachable URL. During development, ngrok tunnels the local server to the internet.

ngrok shows a browser warning page for tunnelled traffic by default. A one-liner in `middleware.ts` suppresses it:

```ts
response.headers.set('ngrok-skip-browser-warning', 'true')
```

This header is added to every response. In production, ngrok isn't in the picture so the header is simply ignored.

---

## 9. What Would Change at Scale

The current architecture handles a growing storefront well. If the product ever needed to scale significantly, the first changes would be:

- **Cart in Redis** instead of MongoDB — reads are faster and there is no risk of cart updates conflicting with User document writes.
- **Search via Algolia or Typesense** — MongoDB's text indexes are good; a dedicated search service is better for faceted filtering across large catalogues.
- **Image transforms on-demand via Cloudinary's URL API** — the current setup uploads originals; Cloudinary can serve resized/optimised variants without re-uploading.
- **Order events to a real message queue** — Inngest is excellent for low-to-medium throughput; at very high order volume a dedicated queue (SQS, Pub/Sub) with dedicated workers gives more control over concurrency.

---

## Summary

| Decision | Chosen | Why |
|---|---|---|
| Framework | Next.js App Router | Colocated API + frontend, one deployment |
| Database | MongoDB | Flexible schema, embedded cart, no join table for roles |
| User ID strategy | Clerk ID as MongoDB `_id` | Eliminates mapping table, simplifies queries |
| Auth | Clerk | Weeks of implementation time saved, roles via metadata |
| Payments | Paystack | Nigerian market fit, simple onboarding |
| Payment confirmation | Webhook + frontend verify | Reliability (webhook) + UX (immediate verify) |
| Image storage | Cloudinary | CDN delivery, no binary blobs in MongoDB |
| Background jobs | Inngest | No queue infrastructure, automatic retries, Clerk sync |
| Seller auth | Clerk publicMetadata | Zero-code role changes, no DB migration |
