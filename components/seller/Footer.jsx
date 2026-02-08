import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="bg-black border-t border-gray-800 mt-20">
      <div className="flex md:flex-row flex-col-reverse items-center justify-between w-full px-6 md:px-16 lg:px-32 py-8 md:py-10">
        <div className="flex items-center gap-4 md:gap-6">
          <Image 
            className="hidden md:block w-32 md:w-40 brightness-0 invert" 
            src="https://res.cloudinary.com/dz6kxumoo/image/upload/v1769556059/WhatsApp_Image_2026-01-25_at_7.50.30_PM-removebg-preview_hgpu4b.png" 
            alt="Shredded logo"
            width={160}
            height={60}
          />
          <div className="hidden md:block h-8 w-px bg-gray-700"></div>
          <p className="py-4 text-center text-xs md:text-sm text-gray-400 tracking-wide">
            Copyright 2026 © Shredded. All Rights Reserved.
          </p>
        </div>
        <div className="flex items-center gap-5 mb-4 md:mb-0">
          <a 
            href="#" 
            className="hover:opacity-70 transition-opacity duration-300"
            aria-label="Facebook"
          >
            <Image 
              className="w-6 h-6 brightness-0 invert" 
              src={assets.facebook_icon} 
              alt="facebook_icon"
              width={24}
              height={24}
            />
          </a>
          <a 
            href="#" 
            className="hover:opacity-70 transition-opacity duration-300"
            aria-label="Twitter"
          >
            <Image 
              className="w-6 h-6 brightness-0 invert" 
              src={assets.twitter_icon} 
              alt="twitter_icon"
              width={24}
              height={24}
            />
          </a>
          <a 
            href="#" 
            className="hover:opacity-70 transition-opacity duration-300"
            aria-label="Instagram"
          >
            <Image 
              className="w-6 h-6 brightness-0 invert" 
              src={assets.instagram_icon} 
              alt="instagram_icon"
              width={24}
              height={24}
            />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;