'use client';
import WebGLHoverCard from './WebGLHoverCard';
import FlipImage from './FlipImage';
import { SHOWCASE_FX } from './showcaseConfig';
import { useAppContext } from '@/context/AppContext';

// One flat variant = one card (each color, and each sleeve variant, is its own
// product — matching how they're seeded in the DB). `item` is built by
// NewDropShowcase from assets/newDrop.js.
export default function NewDropCard({ item }) {
  const { currency, products, router } = useAppContext();

  // Matched DB product — the single source of truth for id + price, so seller
  // edits (incl. renames) show here. Link by stable sku; fall back to name for
  // any product seeded before sku existed.
  const match = (products || []).find((d) => d.skus?.includes(item.sku))
    || (products || []).find((d) => d.name === item.dbName);
  const offerPrice = match?.offerPrice ?? item.offerPrice;
  const price = match?.price ?? item.price;

  // Display name from the DB so renames show here. Split "<name> - <color>" back
  // into the card's title + colorway lines; fall back to the static values.
  let titleName = item.productName;
  let subLabel = item.colorway;
  if (match?.name) {
    const i = match.name.lastIndexOf(' - ');
    if (i > 0) { titleName = match.name.slice(0, i); subLabel = match.name.slice(i + 3); }
    else { titleName = match.name; subLabel = ''; }
  }
  const subtitle = [subLabel, item.variant].filter(Boolean).join(' · ');

  const go = () => {
    router.push(match ? `/product/${match._id}` : '/all-products');
    scrollTo(0, 0);
  };

  const onSale = offerPrice < price;

  return (
    <div className="group flex flex-col">
      <div
        onClick={go}
        className={`relative aspect-[4/5] w-full overflow-hidden bg-black cursor-pointer transition-all duration-500 ${
          SHOWCASE_FX ? 'border border-gray-800 group-hover:border-gray-600' : ''
        }`}
        style={SHOWCASE_FX ? { boxShadow: `0 30px 80px -40px ${item.hex}, inset 0 0 60px -30px ${item.hex}` } : undefined}
      >
        {SHOWCASE_FX
          ? <WebGLHoverCard angles={item.angles} hex={item.hex} />
          : <FlipImage angles={item.angles} alt={`${item.productName} — ${item.colorway}`} />}

        {/* sleeve/style variant, e.g. "One Arm" */}
        {item.variant && (
          <span className="absolute top-3 left-3 z-10 bg-white text-black text-[10px] font-bold tracking-widest uppercase px-2 py-1">
            {item.variant}
          </span>
        )}
        {onSale && (
          <span className="absolute top-3 right-3 z-10 bg-black/70 text-white text-[10px] font-bold tracking-widest uppercase px-2 py-1 border border-white/25">
            Drop
          </span>
        )}
      </div>

      {/* Info */}
      <div className="mt-3 cursor-pointer" onClick={go}>
        <p className="text-sm md:text-base font-semibold tracking-wide uppercase text-white truncate">
          {titleName}
        </p>
        {subtitle && (
          <p className="text-[11px] tracking-wider uppercase text-gray-500 truncate">
            {subtitle}
          </p>
        )}
        <div className="mt-2 flex items-center gap-3">
          <span className="text-lg font-bold text-white">{currency}{offerPrice.toLocaleString()}</span>
          {onSale && (
            <span className="text-sm text-red-500 line-through">{currency}{price.toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}
