# newdrop-src — drop your New Drop images here

This folder is the **staging area** for the New Drop showcase. Put your
background-free product images here, run one command, and they get uploaded to
Cloudinary and wired into the site automatically.

## 1. Name your images

```
<slug>__<colorway>__<angle>.png
```

- **slug** — the product id, same for every image of that product
  (e.g. `shadow-compression-tee`)
- **colorway** — the color key; repeat a slug with different colorways for
  "color dupes" (e.g. `onyx`, `ember`)
- **angle** — one of `front`, `back`, or `side`
- separator is a **double underscore** `__`
- transparent **PNG** (or WebP) — no background

### Example

```
shadow-compression-tee__onyx__front.png
shadow-compression-tee__onyx__back.png
shadow-compression-tee__ember__front.png     ← same product, another color
shadow-compression-tee__ember__back.png
apex-training-hoodie__slate__front.png
apex-training-hoodie__slate__side.png         ← optional 3rd angle
apex-training-hoodie__slate__back.png
```

**Pairing is automatic:** the card rests on `front` and reveals `back` on hover.
A `side` image (if present) adds an angle dot under the card. Every colorway
should have at least a `front` and a `back`.

## 2. (Optional) manifest.json — names, prices, colors

Without it, names/prices are auto-derived and colorway swatches default to grey.
Copy `manifest.example.json` → `manifest.json` and fill in what you have. The
`hex` of each colorway also tints that block's showcase lighting.

## 3. Upload

```bash
node scripts/uploadNewDrop.mjs --dry    # preview what will be parsed
node scripts/uploadNewDrop.mjs          # upload to Cloudinary + regenerate data
```

This regenerates `assets/newDrop.js` with real Cloudinary URLs. Refresh
`/new-drop` and you're live.

> The image files here don't need to be committed (they live on Cloudinary after
> upload) — only `manifest.json` matters for reproducing a build.
