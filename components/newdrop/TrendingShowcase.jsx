'use client';
import Link from 'next/link';
import WebGLCycleCard from './WebGLCycleCard';
import { trending } from '@/assets/photoshoot';
import { useAppContext } from '@/context/AppContext';

// "Trending" — studio photoshoot cutouts in the WebGL showcase, cycling through
// each product's shots on hover. Sits directly under Featured Categories.
export default function TrendingShowcase() {
  const { currency } = useAppContext();
  if (!trending?.length) return null;

  return (
    <section className="relative w-full px-6 md:px-16 lg:px-32 pt-16 md:pt-20">
      <div className="flex items-end justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <p className="text-xs tracking-[0.35em] uppercase text-gray-500">Straight off the shoot</p>
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
          <Link key={p.slug} href={`/${p.gender}`} className="group flex flex-col items-start gap-1 w-full cursor-pointer">
            <div className="relative bg-black w-full h-72 md:h-80 overflow-hidden border border-gray-800 group-hover:border-gray-600 transition-all duration-300">
              <WebGLCycleCard images={p.images} hex={p.hex} />
            </div>
            <div className="flex flex-col gap-1 w-full mt-3">
              <p className="text-sm md:text-base font-semibold tracking-wide uppercase text-white w-full truncate">{p.name}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">{p.tag}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-lg md:text-xl font-bold text-white tracking-wide">{currency}{p.offerPrice}</p>
                <p className="text-sm text-gray-500 line-through">{currency}{p.price}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
