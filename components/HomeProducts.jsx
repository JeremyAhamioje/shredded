'use client';
import React, { useEffect, useState } from "react";
import PopularProductCard from "./PopularProductCard";
import { useAppContext } from "@/context/AppContext";

const HomeProducts = () => {

  const { products, router } = useAppContext()
  const [picks, setPicks] = useState([]);

  // Show a few RANDOM products (each seeded colorway is its own product).
  // Shuffle on the client after mount to avoid SSR hydration mismatch.
  useEffect(() => {
    if (!products?.length) { setPicks([]); return; }
    const shuffled = [...products].sort(() => Math.random() - 0.5).slice(0, 5);
    setPicks(shuffled);
  }, [products]);

  if (!picks.length) return null;

  return (
    <div className="flex flex-col items-center pt-14">
      <p className="text-2xl font-medium text-left w-full">Popular products</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 flex-col items-center gap-6 mt-6 pb-14 w-full">
        {picks.map((product) => <PopularProductCard key={product._id} product={product} />)}
      </div>
      <button onClick={() => { router.push('/all-products') }} className="px-12 py-2.5 border rounded text-gray-500/70 hover:bg-slate-50/90 transition">
        See more
      </button>
    </div>
  );
};

export default HomeProducts;
