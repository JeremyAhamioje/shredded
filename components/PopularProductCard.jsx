'use client';
import React from 'react';
import { assets } from '@/assets/assets';
import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';
import WebGLHoverCard from '@/components/newdrop/WebGLHoverCard';
import { SHOWCASE_FX } from '@/components/newdrop/showcaseConfig';

// Same layout as ProductCard, but the image area uses the WebGL front->back hover.
// "Color agnostic": each product is a single colorway (no color buttons) — the
// hover still flips front->back using the product's stored image array.

const COLOR_HEX = {
  black: '#141414', onyx: '#141414', white: '#e9e6df', bone: '#e9e6df',
  crimson: '#8f1f24', maroon: '#5c1418', storm: '#1c2733',
};

// Seed order is [front, side?, back] — reconstruct the angle set for the shader.
function anglesFromImages(image = []) {
  const a = {};
  if (image[0]) a.front = image[0];
  if (image.length >= 3) { a.side = image[1]; a.back = image[2]; }
  else if (image.length === 2) { a.back = image[1]; }
  return a;
}

function hexFromName(name = '') {
  const key = name.split(' - ').pop().trim().toLowerCase();
  return COLOR_HEX[key] || '#6b7280';
}

const PopularProductCard = ({ product }) => {
  const { currency, router } = useAppContext();
  const angles = anglesFromImages(product.image);
  const hex = hexFromName(product.name);

  return (
    <div
      onClick={() => { router.push('/product/' + product._id); scrollTo(0, 0); }}
      className="flex flex-col items-start gap-1 max-w-[280px] w-full cursor-pointer group"
    >
      <div className={`relative bg-black w-full h-72 md:h-80 overflow-hidden transition-all duration-300 ${SHOWCASE_FX ? 'border border-gray-800 hover:border-gray-600' : ''}`}>
        <WebGLHoverCard angles={angles} hex={hex} />
        <button className="absolute top-3 right-3 z-10 bg-black/60 backdrop-blur-sm p-2 border border-gray-700 hover:bg-white hover:border-white transition-all duration-300 group/heart">
          <Image
            className="h-3.5 w-3.5 brightness-0 invert group-hover/heart:invert-0"
            src={assets.heart_icon}
            alt="heart_icon"
            width={14}
            height={14}
          />
        </button>
      </div>

      <div className="flex flex-col gap-1 w-full mt-3">
        <p className="text-sm md:text-base font-semibold tracking-wide uppercase text-white w-full truncate">
          {product.name}
        </p>
        <p className="w-full text-xs text-gray-400 max-sm:hidden truncate">
          {product.description}
        </p>

        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-gray-300">{4.5}</p>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, index) => (
              <Image
                key={index}
                className="h-3 w-3 brightness-0 invert"
                src={index < Math.floor(4) ? assets.star_icon : assets.star_dull_icon}
                alt="star_icon"
                width={12}
                height={12}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between w-full mt-2">
          <p className="text-lg md:text-xl font-bold text-white tracking-wide">
            {currency}{product.offerPrice}
          </p>
          <button className="max-sm:hidden px-5 py-2 text-white text-xs font-semibold tracking-wider uppercase border border-white hover:bg-white hover:text-black transition-all duration-300">
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopularProductCard;
