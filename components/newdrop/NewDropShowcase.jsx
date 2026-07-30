'use client';
import Link from 'next/link';
import NewDropCard from './NewDropCard';
import { SHOWCASE_FX } from './showcaseConfig';
import { newDrop, newDropMeta } from '@/assets/newDrop';

// The New Drop section. Used full on /new-drop, and as a teaser on the home page
// (pass `limit` to cap products and `showViewAll` to append a "View all" CTA).
export default function NewDropShowcase({ limit, showViewAll = false }) {
  const items = typeof limit === 'number' ? newDrop.slice(0, limit) : newDrop;
  const Heading = showViewAll ? 'h2' : 'h1'; // teaser is a section (h2); full page is h1

  return (
    <section className="relative w-full">
      {/* ambient stage glow behind the grid */}
      {SHOWCASE_FX && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-24 h-[600px] w-[900px] -translate-x-1/2 rounded-full opacity-40 blur-[120px]"
               style={{ background: 'radial-gradient(closest-side, rgba(120,120,130,0.35), transparent)' }} />
        </div>
      )}

      <div className="relative px-6 md:px-16 lg:px-32">
        <div className="pt-16 md:pt-20 border-b border-gray-800 pb-6">
          <p className="text-xs tracking-[0.35em] uppercase text-gray-500">{newDropMeta.tagline}</p>
          <Heading className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-wide uppercase text-white">
            {newDropMeta.title}
          </Heading>
          <div className="w-24 h-1 bg-white mt-3" />
          <p className="mt-3 max-w-md text-sm text-gray-400">{newDropMeta.blurb}</p>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 ${showViewAll ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-x-8 gap-y-14 mt-12 ${showViewAll ? 'pb-10' : 'pb-16 md:pb-24'}`}>
          {items.map((product) => (
            <NewDropCard key={product.slug} product={product} />
          ))}
        </div>

        {showViewAll && (
          <div className="flex justify-center pb-16 md:pb-24">
            <Link
              href="/new-drop"
              className="px-10 py-3 text-xs font-semibold tracking-widest uppercase border border-white text-white hover:bg-white hover:text-black transition-all duration-300"
            >
              View all
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
