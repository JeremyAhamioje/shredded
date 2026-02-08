
"use client"
import React from "react";
import { assets} from "@/assets/assets";
import Link from "next/link"
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";

const Navbar = () => {

  const { isSeller, router } = useAppContext();

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-32 py-2 md:py-3 bg-black border-b border-gray-800 text-white">
      <Image
      className="cursor-pointer w-28 md:w-32 brightness-0 invert"
      onClick={() => router.push('/')}
      src="https://res.cloudinary.com/dz6kxumoo/image/upload/v1769556059/WhatsApp_Image_2026-01-25_at_7.50.30_PM-removebg-preview_hgpu4b.png"
      alt="Shredded logo"
      width={128}
      height={48}
      priority
      />
      <div className="flex items-center gap-6 lg:gap-10 max-md:hidden">
      <Link 
        href="/" 
        className="text-xs font-medium tracking-wider uppercase hover:text-gray-400 transition-colors duration-300"
      >
        Home
      </Link>
      <Link 
        href="/all-products" 
        className="text-xs font-medium tracking-wider uppercase hover:text-gray-400 transition-colors duration-300"
      >
        Shop
      </Link>
      <Link 
        href="/" 
        className="text-xs font-medium tracking-wider uppercase hover:text-gray-400 transition-colors duration-300"
      >
        About Us
      </Link>
      <Link 
        href="/" 
        className="text-xs font-medium tracking-wider uppercase hover:text-gray-400 transition-colors duration-300"
      >
        Contact
      </Link>

      {isSeller && (
        <button 
        onClick={() => router.push('/seller')} 
        className="text-xs font-semibold tracking-wider uppercase border border-white px-4 py-1.5 hover:bg-white hover:text-black transition-all duration-300"
        >
        Seller Dashboard
        </button>
      )}

      </div>

      <ul className="hidden md:flex items-center gap-4">
      <button className="hover:opacity-70 transition-opacity">
        <Image 
        className="w-4 h-4 brightness-0 invert" 
        src={assets.search_icon} 
        alt="search icon"
        width={16}
        height={16}
        />
      </button>
      <button className="flex items-center gap-2 text-xs font-medium tracking-wider uppercase hover:text-gray-400 transition-colors duration-300">
        <Image 
        className="brightness-0 invert" 
        src={assets.user_icon} 
        alt="user icon"
        width={16}
        height={16}
        />
        Account
      </button>
      </ul>

      <div className="flex items-center md:hidden gap-2">
      {isSeller && (
        <button 
        onClick={() => router.push('/seller')} 
        className="text-xs font-semibold tracking-wider uppercase border border-white px-3 py-1 hover:bg-white hover:text-black transition-all duration-300"
        >
        Seller
        </button>
      )}
      <button className="flex items-center gap-2 text-xs font-medium tracking-wider uppercase hover:text-gray-400 transition-colors duration-300">
        <Image 
        className="brightness-0 invert" 
        src={assets.user_icon} 
        alt="user icon"
        width={16}
        height={16}
        />
        Account
      </button>
      </div>
    </nav>
    );
};

export default Navbar;