// Placeholder garment art for the New Drop showcase.
//
// These generate transparent (no-background) SVG silhouettes as data URIs so the
// WebGL showcase is fully demonstrable BEFORE any real photos exist. Each real
// product image (front / back / side) simply replaces the matching data URI with
// a Cloudinary URL once you run `node scripts/uploadNewDrop.mjs`.
//
// The art is intentionally simple: a tinted apparel silhouette + an angle label,
// distinct per angle so you can clearly see the front->back hover transition.

function clamp(n) { return Math.max(0, Math.min(255, Math.round(n))); }

// Lighten (amt>0) or darken (amt<0) a #rrggbb hex by a ratio.
export function shade(hex, amt) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const t = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  const to = (c) => clamp((t - c) * p + c);
  return `#${[to(r), to(g), to(b)].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

// Build a transparent 800x800 SVG of a garment silhouette, tinted `hex`,
// varied by `angle` ('front' | 'back' | 'side'), returned as a data URI.
export function garmentDataURI({ hex = '#2b2b2b', angle = 'front', label = '' } = {}) {
  const base = hex;
  const dark = shade(hex, -0.4);
  const light = shade(hex, 0.28);
  const gid = `g${Math.abs(hashCode(base + angle)) % 100000}`;
  const seam = shade(hex, -0.55);

  // Body + sleeves differ slightly per angle so the hover swap is obvious.
  let body;
  if (angle === 'side') {
    body = `
      <path d="M330 250 q-70 30 -78 120 l40 30 q18 -70 42 -96 l0 360 q0 24 24 24 l150 0 q24 0 24 -24 l0 -404 q-40 -40 -100 -40 q-70 0 -102 30 z"
            fill="url(#${gid})" stroke="${seam}" stroke-width="3"/>
      <path d="M356 250 q60 -18 120 6" fill="none" stroke="${seam}" stroke-width="4" opacity="0.5"/>`;
  } else if (angle === 'back') {
    body = `
      <path d="M300 240 l70 -30 q30 -14 60 -14 q30 0 60 14 l70 30 q60 26 70 118 l-46 34 q-14 -56 -40 -84 l0 396 q0 26 -26 26 l-236 0 q-26 0 -26 -26 l0 -396 q-26 28 -40 84 l-46 -34 q10 -92 70 -118 z"
            fill="url(#${gid})" stroke="${seam}" stroke-width="3"/>
      <line x1="400" y1="212" x2="400" y2="600" stroke="${seam}" stroke-width="4" opacity="0.45"/>
      <path d="M340 236 q60 -22 120 0" fill="none" stroke="${seam}" stroke-width="5" opacity="0.6"/>`;
  } else {
    // front
    body = `
      <path d="M300 240 l70 -30 q30 -14 60 -14 q30 0 60 14 l70 30 q60 26 70 118 l-46 34 q-14 -56 -40 -84 l0 396 q0 26 -26 26 l-236 0 q-26 0 -26 -26 l0 -396 q-26 28 -40 84 l-46 -34 q10 -92 70 -118 z"
            fill="url(#${gid})" stroke="${seam}" stroke-width="3"/>
      <path d="M362 202 q38 40 76 0 q-6 40 -38 40 q-32 0 -38 -40 z" fill="${dark}"/>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
    <defs>
      <linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${light}"/>
        <stop offset="0.5" stop-color="${base}"/>
        <stop offset="1" stop-color="${dark}"/>
      </linearGradient>
    </defs>
    ${body}
    <text x="400" y="700" text-anchor="middle" font-family="Arial, sans-serif" font-size="34"
          font-weight="700" letter-spacing="6" fill="#ffffff" opacity="0.72">${label.toUpperCase()}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return h;
}

// Convenience: build a {front, back, side?} angle set of placeholders for a colorway.
export function placeholderAngles(hex, { withSide = false } = {}) {
  const angles = {
    front: garmentDataURI({ hex, angle: 'front', label: 'front' }),
    back: garmentDataURI({ hex, angle: 'back', label: 'back' }),
  };
  if (withSide) angles.side = garmentDataURI({ hex, angle: 'side', label: 'side' });
  return angles;
}
