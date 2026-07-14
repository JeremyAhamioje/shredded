'use client';
import { useState } from 'react';
import WebGLHoverCard from './WebGLHoverCard';
import { useAppContext } from '@/context/AppContext';

// One product "block": WebGL showcase canvas + color-dupe swatches + info.
export default function NewDropCard({ product }) {
  const { currency } = useAppContext();
  const [ci, setCi] = useState(0);
  const colorway = product.colorways[ci];

  return (
    <div className="group flex flex-col">
      {/* Showcase block — the tinted lighting/backdrop is drawn inside the canvas.
          The outer glow lets that colorway light spill past the frame.        */}
      <div
        className="relative aspect-[4/5] w-full overflow-hidden border border-gray-800 bg-black transition-all duration-500 group-hover:border-gray-600"
        style={{ boxShadow: `0 30px 80px -40px ${colorway.hex}, inset 0 0 60px -30px ${colorway.hex}` }}
      >
        <WebGLHoverCard angles={colorway.angles} hex={colorway.hex} />

        {product.offerPrice < product.price && (
          <span className="absolute top-3 right-3 bg-white text-black text-[10px] font-bold tracking-widest uppercase px-2 py-1">
            Drop
          </span>
        )}
      </div>

      {/* Color dupes */}
      <div className="mt-4 flex items-center gap-2">
        {product.colorways.map((c, i) => (
          <button
            key={c.name}
            onClick={() => setCi(i)}
            aria-label={c.name}
            title={c.name}
            className={`w-5 h-5 rounded-full border transition-all ${
              i === ci ? 'ring-2 ring-white ring-offset-2 ring-offset-black border-transparent' : 'border-white/25 hover:border-white/60'
            }`}
            style={{ backgroundColor: c.hex }}
          />
        ))}
        <span className="ml-1 text-[11px] tracking-wider uppercase text-gray-500">{colorway.name}</span>
      </div>

      {/* Info */}
      <div className="mt-2">
        <p className="text-sm md:text-base font-semibold tracking-wide uppercase text-white truncate">
          {product.name}
        </p>
        <p className="text-xs text-gray-500 truncate">{product.description}</p>
        <div className="mt-2 flex items-center gap-3">
          <span className="text-lg font-bold text-white">{currency}{product.offerPrice}</span>
          {product.offerPrice < product.price && (
            <span className="text-sm text-gray-600 line-through">{currency}{product.price}</span>
          )}
        </div>
      </div>
    </div>
  );
}
