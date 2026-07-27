'use client';
import Image from 'next/image';
import Link from 'next/link';
import { featuredCategories } from '@/assets/photoshoot';

// Featured Categories — replaces the old placeholder "Featured Products".
// Transparent studio cutouts composited over a dark, spotlit tile.
export default function FeaturedCategories() {
  if (!featuredCategories?.length) return null;

  return (
    <div className="px-6 md:px-16 lg:px-32 mt-20 md:mt-28">
      <div className="flex flex-col items-center border-b border-gray-800 pb-6">
        <h2 className="text-3xl md:text-4xl font-bold tracking-wide uppercase text-white">Featured Categories</h2>
        <div className="w-32 h-1 bg-white mt-4" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 mt-12">
        {featuredCategories.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="relative group overflow-hidden border border-gray-800 hover:border-gray-600 transition-all duration-300 h-[420px] md:h-[520px] flex items-end"
          >
            {/* spotlight backdrop */}
            <div className="absolute inset-0" style={{ background: 'radial-gradient(62% 55% at 50% 38%, #1c1c1c, #050505 78%)' }} />
            <Image
              src={c.image}
              alt={c.label}
              fill
              unoptimized
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-contain object-bottom p-4 drop-shadow-[0_25px_35px_rgba(0,0,0,0.7)] group-hover:scale-[1.04] transition-transform duration-700"
            />
            {/* legibility gradient */}
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/60 to-transparent" />
            <div className="relative z-10 w-full p-6 md:p-8 text-center">
              <h3 className="font-bold text-xl md:text-2xl uppercase tracking-[0.15em] text-white mb-3">{c.label}</h3>
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-white border-b-2 border-white pb-1 group-hover:tracking-[0.2em] transition-all duration-300">
                View All
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
