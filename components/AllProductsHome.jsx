'use client';
import PopularProductCard from '@/components/PopularProductCard';
import { useAppContext } from '@/context/AppContext';

// Full catalogue on the home page (replaces the old curated Trending section).
export default function AllProductsHome() {
  const { products } = useAppContext();
  if (!products?.length) return null;

  return (
    <section className="px-6 md:px-16 lg:px-32 pt-16 md:pt-20">
      <div className="border-b border-gray-800 pb-6">
        <p className="text-xs tracking-[0.35em] uppercase text-gray-500">The full collection</p>
        <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-wide uppercase text-white">All Products</h2>
        <div className="w-24 h-1 bg-white mt-3" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8 mt-12 pb-16 md:pb-24">
        {products.map((p) => <PopularProductCard key={p._id} product={p} />)}
      </div>
    </section>
  );
}
