// Global colour-variant map. Keyed by the product's stable `sku` (survives
// renames), so colours of one product stay linked no matter what a seller
// renames them to. Only multi-colour families are listed; anything not here has
// no siblings and shows no "other colours" section.
//
// To add a colour: give the product a sku and add a line here with the same
// `group` as its siblings.
export const SKU_GROUP = {
  // Compression Long Sleeve
  'nd-compression-longsleeve-white':   { group: 'compression-long-sleeve', color: 'White' },
  'nd-compression-longsleeve-black':   { group: 'compression-long-sleeve', color: 'Black' },
  'nd-compression-longsleeve-crimson': { group: 'compression-long-sleeve', color: 'Crimson' },

  // Wide-Leg Sweatpants
  'nd-wide-leg-sweatpants-tan':  { group: 'wide-leg-sweatpants', color: 'Tan' },
  'nd-wide-leg-sweatpants-grey': { group: 'wide-leg-sweatpants', color: 'Grey' },

  // Compression Quarter-Zip
  'tr-crimson-quarter-zip': { group: 'compression-quarter-zip', color: 'Crimson' },
  'tr-onyx-quarter-zip':    { group: 'compression-quarter-zip', color: 'Onyx' },

  // Sleeveless Training Tank
  'tr-training-tank':       { group: 'sleeveless-training-tank', color: 'Black' },
  'tr-white-training-tank': { group: 'sleeveless-training-tank', color: 'White' },

  // Leopard Seamless Set
  'nd-leopard-set-burgundy': { group: 'leopard-set', color: 'Burgundy' },
  'nd-leopard-set-sand':     { group: 'leopard-set', color: 'Sand' },
  'nd-leopard-set-charcoal': { group: 'leopard-set', color: 'Charcoal' },
  'nd-leopard-set-blush':    { group: 'leopard-set', color: 'Blush' },

  // Shredded Long-Sleeve Set
  'nd-shredded-ls-set-black': { group: 'shredded-long-sleeve-set', color: 'Black' },
  'nd-shredded-ls-set-pink':  { group: 'shredded-long-sleeve-set', color: 'Pink' },
};

// { group, color } for a product, or null if it isn't part of a colour family.
export function variantInfo(product) {
  for (const s of product?.skus || []) if (SKU_GROUP[s]) return SKU_GROUP[s];
  return null;
}

// Every product in the same colour family (including `product`), each tagged with
// its colour label. Empty when the product has no mapped siblings.
export function colorSiblings(product, all) {
  const info = variantInfo(product);
  if (!info) return [];
  return (all || [])
    .map((p) => { const i = variantInfo(p); return i && i.group === info.group ? { product: p, color: i.color } : null; })
    .filter(Boolean);
}
