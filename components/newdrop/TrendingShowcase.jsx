'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import WebGLCycleCard from './WebGLCycleCard';
import { SHOWCASE_FX } from './showcaseConfig';
import { trending } from '@/assets/photoshoot';
import { useAppContext } from '@/context/AppContext';

// "Trending" — studio photoshoot cutouts in the WebGL showcase, cycling through
// each product's shots on hover. Sits directly under Featured Categories.
// Each card routes to its seeded DB product (product page -> cart -> checkout),
// matched by "<name> - <tag>"; falls back to the gender page until DB loads.
export default function TrendingShowcase() {
  const { currency, products } = useAppContext();
  const idByName = useMemo(() => {
    const m = {};
    (products || []).forEach((d) => { m[d.name] = d._id; });
    return m;
  }, [products]);
  const hrefFor = (p) => {
    const id = idByName[`${p.name} - ${p.tag}`];
    return id ? `/product/${id}` : `/${p.gender}`;
  };
  if (!trending?.length) return null;

  return (
    <section className="relative w-full px-6 md:px-16 lg:px-32 pt-16 md:pt-20">
      <div className="flex items-end justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <p className="text-xs tracking-[0.35em] uppercase text-gray-500">Fresh off the rack</p>
          <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-wide uppercase text-white">Trending</h2>
          <div className="w-24 h-1 bg-white mt-3" />
        </div>
        <Link href="/all-products"
          className="max-sm:hidden shrink-0 px-6 py-2.5 text-xs font-semibold tracking-widest uppercase border border-white text-white hover:bg-white hover:text-black transition-all duration-300">
          Shop all
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12 mt-12 pb-16 md:pb-24">
        {trending.map((p) => (
          <Link key={p.slug} href={hrefFor(p)} className="group flex flex-col items-start gap-1 w-full cursor-pointer">
            <div className={`relative bg-black w-full h-72 md:h-80 overflow-hidden transition-all duration-300 ${
              SHOWCASE_FX ? 'border border-gray-800 group-hover:border-gray-600' : ''
            }`}>
              <WebGLCycleCard images={p.images} hex={p.hex} />
            </div>
            <div className="flex flex-col gap-1 w-full mt-3">
              <p className="text-sm md:text-base font-semibold tracking-wide uppercase text-white w-full truncate">{p.name}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">{p.tag}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-lg md:text-xl font-bold text-white tracking-wide">{currency}{p.offerPrice.toLocaleString()}</p>
                <p className="text-sm text-red-500 line-through">{currency}{p.price.toLocaleString()}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
