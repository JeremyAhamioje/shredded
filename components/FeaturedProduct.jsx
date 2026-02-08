import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import Link from "next/link";
const products = [
  {
    id: 1,
    image: "https://res.cloudinary.com/dz6kxumoo/image/upload/v1769721795/Gemini_Generated_Image_6guo1d6guo1d6guo_rvpaf1.png",
    title: "Forge Your Strength",
    description: "Premium athletic wear designed for warriors who push beyond limits.",
  },
  {
    id: 2,
    image: "https://res.cloudinary.com/dz6kxumoo/image/upload/v1769724056/Gemini_Generated_Image_u8v12eu8v12eu8v1_u420fn.png",
    title: "Embrace The Darkness",
    description: "Bold designs that reflect your inner power and uncompromising style.",
  },
  {
    id: 3,
    image: "https://res.cloudinary.com/dz6kxumoo/image/upload/v1769723839/Gemini_Generated_Image_a4j1ova4j1ova4j1_1_qa9s6k.png",
    title: "Unleash Your Legacy",
    description: "Exclusive collections for those who dare to stand out and dominate.",
  },
];

const FeaturedProduct = () => {
  return (
    <div className="mt-20 md:mt-28">
      <div className="flex flex-col items-center border-b border-gray-800 pb-6">
        <h2 className="text-3xl md:text-4xl font-bold tracking-wide uppercase text-white">
          Featured Products
        </h2>
        <div className="w-32 h-1 bg-white mt-4"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mt-12 md:px-0">
        {products.map(({ id, image, title, description }) => (
          <div key={id} className="relative group overflow-hidden bg-black border border-gray-800 hover:border-gray-600 transition-all duration-300">
            <div className="relative h-[400px] md:h-[500px] overflow-hidden">
              <Image
                src={image}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                width={800}
                height={1000}
                priority={id === 1}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white transform group-hover:-translate-y-2 transition-transform duration-300">
              <h3 className="font-bold text-xl md:text-2xl uppercase tracking-wide mb-3">
                {title}
              </h3>
              <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-5 max-w-sm">
                {description}
              </p>
              <Link href="/all-products">
                <button className="flex items-center gap-2 bg-white text-black px-6 py-2.5 font-semibold uppercase tracking-wider text-sm hover:bg-gray-200 transition-all duration-300 group/button">
                  Shop Now 
                  <span className="group-hover/button:translate-x-1 transition-transform">→</span>
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


export default FeaturedProduct;