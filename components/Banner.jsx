import React from "react";
import Image from "next/image";
import { photoBanners } from "@/assets/photoshoot";

// "Elevate Your Style" — real 2-person studio cutout on a dark spotlit stage.
const Banner = () => {
  return (
    <div className="relative flex flex-col md:flex-row items-center justify-between bg-black my-20 md:my-28 overflow-hidden border border-gray-800 min-h-[420px]">
      {/* dark stage + spotlight */}
      <div className="absolute inset-0 z-0" style={{ background: "radial-gradient(70% 80% at 72% 45%, #1b1b1b, #050505 80%)" }} />
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-black via-black/70 to-transparent" />

      {/* Copy */}
      <div className="relative z-10 flex-1 flex flex-col items-center md:items-start text-center md:text-left space-y-4 px-6 md:pl-16 lg:pl-24 py-10 md:py-0">
        <p className="text-xs tracking-[0.35em] uppercase text-gray-400">New Season</p>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold max-w-md uppercase tracking-wide text-white leading-tight">
          Elevate Your Style
        </h2>
        <p className="max-w-md text-sm md:text-base text-gray-300 leading-relaxed">
          Premium athletic wear designed for those who refuse to blend in — bold designs for unstoppable performance.
        </p>
        <a href="/all-products" className="group flex items-center gap-2 px-10 py-3 bg-white text-black font-semibold uppercase tracking-wider text-sm hover:bg-gray-200 transition-all duration-300 mt-2">
          Shop Now
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </a>
      </div>

      {/* 2-person cutout */}
      <div className="relative z-10 w-full md:w-1/2 h-[360px] md:h-[460px] md:self-end">
        <Image
          src={photoBanners.elevate}
          alt="Shredded athletes"
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain object-bottom drop-shadow-[0_25px_40px_rgba(0,0,0,0.8)]"
        />
      </div>
    </div>
  );
};

export default Banner;
