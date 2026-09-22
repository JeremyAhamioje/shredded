'use client';
import Link from 'next/link';
import Image from 'next/image';
import PopularProductCard from '@/components/PopularProductCard';
import { useAppContext } from '@/context/AppContext';

const PROMO_IMG_SKU = 'nd-leopard-set-burgundy';              // full-body model on the card
const FEATURED_SKUS = ['nd-flare-jumpsuit-red', 'tr-onyx-quarter-zip']; // 2 cards beside it

export default function PromoBanner() {
  const { products } = useAppContext();
  if (!products?.length) return null;

  const bySku = {};
  products.forEach((p) => (p.skus || []).forEach((s) => { bySku[s] = p; }));
  const featured = FEATURED_SKUS.map((s) => bySku[s]).filter(Boolean);
  const promoImg = bySku[PROMO_IMG_SKU]?.image?.[0] || featured[0]?.image?.[0] || products[0].image[0];

  return (
    <section className="px-6 md:px-16 lg:px-32 py-12 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Promo card */}
        <div className="relative overflow-hidden rounded-xl p-8 min-h-[400px] flex flex-col bg-gradient-to-br from-red-600 via-rose-700 to-red-900">
          <div className="pointer-events-none absolute -right-10 -top-10 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
          <p className="text-white/80 text-xs font-bold uppercase tracking-[0.3em]">Limited offer</p>
          <h3 className="mt-2 text-3xl md:text-4xl font-extrabold text-white leading-tight uppercase">Shredded<br />Season Sale</h3>
          <p className="mt-3 text-5xl font-black text-white leading-none">Up to 30%<span className="block text-xl font-bold tracking-widest">OFF</span></p>
          <div className="flex-1 flex items-end justify-center py-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <Image src={promoImg} alt="" width={240} height={240} unoptimized
              className="max-h-48 w-auto object-contain drop-shadow-2xl" />
          </div>
          <Link href="/all-products"
            className="block text-center bg-white text-red-700 font-bold uppercase tracking-widest text-sm px-8 py-3 rounded-full hover:bg-gray-100 transition-colors">
            Check now
          </Link>
          <p className="mt-3 text-center text-white/60 text-xs">Hurry — limited offer</p>
        </div>

        {/* Featured products */}
        {featured.map((p) => <PopularProductCard key={p._id} product={p} />)}
      </div>
    </section>
  );
}
