import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import Link from "next/link";


const Banner = () => {
  return (
    <div className="relative flex flex-col md:flex-row items-center justify-between py-16 md:py-20 bg-black my-20 md:my-28 overflow-hidden border border-gray-800">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          className="w-full h-full object-cover opacity-20"
          src="https://res.cloudinary.com/dz6kxumoo/image/upload/v1769555516/gemini-2.5-flash-image_Generate_an_image_which_is_an_exact_replica_of_the_hoodie_image_attached_the_one-0_pfiljw.jpg"
          alt="Background"
          width={1920}
          height={600}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black"></div>
      </div>

      {/* Left Product Image */}
        <div className="relative z-10 md:pl-12 lg:pl-20">
          <Image
            className="w-48 md:w-56 lg:w-64 opacity-90"
            src="https://res.cloudinary.com/dz6kxumoo/image/upload/v1769555478/Gemini_Generated_Image_ysmi1pysmi1pysmi_wbz8y2.png"
            alt="Featured Product"
            width={300}
            height={400}
          />
        </div>

        {/* Center Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-4 px-6 md:px-8 py-8 md:py-0">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold max-w-md uppercase tracking-wide text-white leading-tight">
            Elevate Your Style
          </h2>
          <p className="max-w-md text-sm md:text-base text-gray-300 leading-relaxed">
            Premium athletic wear designed for those who refuse to blend in—bold designs for unstoppable performance
          </p>
          <a href="/all-products" className="group flex items-center justify-center gap-2 px-10 py-3 bg-white text-black font-semibold uppercase tracking-wider text-sm hover:bg-gray-200 transition-all duration-300 mt-4">
            Shop Now
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>

        {/* Right Product Image */}
      <div className="relative z-10 md:pr-12 lg:pr-20 mt-8 md:mt-0">
        <Image
          className="w-48 md:w-56 lg:w-64 opacity-90"
          src="https://res.cloudinary.com/dz6kxumoo/image/upload/v1769555456/Gemini_Generated_Image_sl4jdosl4jdosl4j-removebg-preview_lgcdts.png"
          alt="Featured Product"
          width={300}
          height={400}
        />
      </div>
    </div>
  );
};

export default Banner;