'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WebGLCycleCard from './WebGLCycleCard';
import { trending } from '@/assets/photoshoot';
import { useAppContext } from '@/context/AppContext';

// Isolated per-gender collection page — renders the studio-shoot products for
// one gender in the WebGL cycle-on-hover cards. Each card routes to its seeded
// DB product (product page -> cart -> checkout), matched by "<name> - <tag>".
export default function ShopCollection({ gender, title }) {
  const { currency, products } = useAppContext();
  const items = trending.filter((p) => p.gender === gender);
  const idByName = useMemo(() => {
    const m = {};
    (products || []).forEach((d) => { m[d.name] = d._id; });
    return m;
  }, [products]);
  const hrefFor = (p) => {
    const id = idByName[`${p.name} - ${p.tag}`];
    return id ? `/product/${id}` : '#';
  };

  return (
    <div className="bg-black min-h-screen">
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32">
        <div className="pt-16 md:pt-20 border-b border-gray-800 pb-6">
          <p className="text-xs tracking-[0.35em] uppercase text-gray-500">The Collection</p>
          <h1 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-wide uppercase text-white">{title}</h1>
          <div className="w-24 h-1 bg-white mt-3" />
          <p className="mt-3 text-sm text-gray-400 tracking-wider uppercase">{items.length} pieces</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12 mt-12 pb-20">
          {items.map((p) => (
            <Link key={p.slug} href={hrefFor(p)} className="group flex flex-col items-start gap-1 w-full cursor-pointer">
              <div className="relative bg-black w-full h-72 md:h-80 overflow-hidden border border-gray-800 group-hover:border-gray-600 transition-all duration-300">
                <WebGLCycleCard images={p.images} hex={p.hex} />
              </div>
              <div className="flex flex-col gap-1 w-full mt-3">
                <p className="text-sm md:text-base font-semibold tracking-wide uppercase text-white truncate">{p.name}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{p.tag}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-lg md:text-xl font-bold text-white">{currency}{p.offerPrice}</p>
                  <p className="text-sm text-gray-500 line-through">{currency}{p.price}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
