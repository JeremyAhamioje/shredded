'use client';
import Link from 'next/link';
import PopularProductCard from '@/components/PopularProductCard';
import { useAppContext } from '@/context/AppContext';

// Curated "selling fast" picks, by stable sku (survives renames). ~6 products.
const TRENDING_SKUS = [
  'nd-flare-jumpsuit-black',
  'nd-leopard-set-burgundy',        // "SHREDDED cheetah print set"
  'nd-piped-set-red',
  'nd-scrunch-romper-pink',
  'nd-shredded-ls-set-black',
  'nd-compression-longsleeve-white',
];

export default function TrendingNow() {
  const { products } = useAppContext();
  if (!products?.length) return null;

  // resolve each sku to a product, in order; fall back to the first products if unmatched
  const bySku = {};
  products.forEach((p) => (p.skus || []).forEach((s) => { bySku[s] = p; }));
  let items = TRENDING_SKUS.map((s) => bySku[s]).filter(Boolean);
  if (items.length < 6) {
    const have = new Set(items.map((p) => p._id));
    for (const p of products) { if (items.length >= 6) break; if (!have.has(p._id)) items.push(p); }
  }
  if (!items.length) return null;

  return (
    <section className="px-6 md:px-16 lg:px-32 pt-16 md:pt-20 pb-16 md:pb-24">
      <div className="flex items-end justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <p className="text-xs tracking-[0.35em] uppercase text-gray-500">Selling fast</p>
          <h2 className="mt-3 flex items-center gap-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-wide uppercase text-white">
            Trending <span className="fire-flicker text-3xl md:text-4xl">🔥</span>
          </h2>
          <div className="w-24 h-1 bg-white mt-3" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 md:gap-8 mt-12">
        {items.map((p) => (
          <div key={p._id} className="relative">
            <span className="fire-badge absolute top-3 left-3 z-20 pointer-events-none flex items-center gap-1 bg-black/75 border rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-400">
              <span className="fire-flicker leading-none">🔥</span> Hot
            </span>
            <PopularProductCard product={p} />
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-12">
        <Link href="/all-products"
          className="px-10 py-3 text-xs font-semibold tracking-widest uppercase border border-white text-white hover:bg-white hover:text-black transition-all duration-300">
          View all products
        </Link>
      </div>
    </section>
  );
}
