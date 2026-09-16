// Deterministic, rename-proof identifiers linking the static showcase cards
// (New Drop / Trending) to their seeded DB products. Used by the components,
// the seed scripts, and the backfill so they all agree.
export const slugify = (s) =>
  String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// New Drop: one card per product colorway (+ optional sleeve/style variant).
export const newDropSku = (productSlug, colorName, variant) =>
  `nd-${productSlug}-${slugify(colorName)}${variant ? '-' + slugify(variant) : ''}`;

// Trending: one card per photoshoot product.
export const trendingSku = (productSlug) => `tr-${productSlug}`;
