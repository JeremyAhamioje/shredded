'use client';
import React from "react";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { useClerk, UserButton } from "@clerk/nextjs";

// Crisp line icons replacing the old raster PNGs — they inherit the nav's white text.
const Icon = ({ children, className = "w-5 h-5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);
const SearchIcon = (p) => (<Icon {...p}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></Icon>);
const CartIcon = (p) => (<Icon {...p}><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /><path d="M2 3h3l2.2 11.3a1.6 1.6 0 0 0 1.6 1.3h8.5a1.6 1.6 0 0 0 1.6-1.3L22 7H6" /></Icon>);
const BagIcon = (p) => (<Icon {...p}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></Icon>);
const UserIcon = (p) => (<Icon {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></Icon>);
const HomeIcon = (p) => (<Icon {...p}><path d="M3 9.5 12 3l9 6.5V20a1.5 1.5 0 0 1-1.5 1.5h-4V14H8.5v7.5h-4A1.5 1.5 0 0 1 3 20z" /></Icon>);
const TagIcon = (p) => (<Icon {...p}><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2.5 12.5A2 2 0 0 1 2 11.1V4a2 2 0 0 1 2-2h7.1a2 2 0 0 1 1.4.6l8.1 8.1a2 2 0 0 1 0 2.7z" /><circle cx="7.5" cy="7.5" r="1.3" /></Icon>);

const Navbar = () => {
  const { isSeller, router, user, getCartCount } = useAppContext();
  const { openSignIn } = useClerk();

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-32 py-2 md:py-3 bg-black border-b border-gray-800 text-white">
      {/* Logo */}
      {true && (
        <Image
          className="cursor-pointer w-28 md:w-32 brightness-0 invert"
          onClick={() => router.push("/")}
          src="https://res.cloudinary.com/dz6kxumoo/image/upload/v1769556059/WhatsApp_Image_2026-01-25_at_7.50.30_PM-removebg-preview_hgpu4b.png"
          alt="Shredded logo"
          width={128}
          height={48}
          priority
        />
      )}

      {/* Desktop Links */}
      <div className="flex items-center gap-6 lg:gap-10 max-md:hidden">
        <Link
          href="/"
          className="text-xs font-medium tracking-wider uppercase hover:text-gray-400 transition-colors duration-300"
        >
          Home
        </Link>
        <Link
          href="/new-drop"
          className="text-xs font-medium tracking-wider uppercase text-white hover:text-gray-400 transition-colors duration-300"
        >
          New Drop
        </Link>
        <Link
          href="/all-products"
          className="text-xs font-medium tracking-wider uppercase hover:text-gray-400 transition-colors duration-300"
        >
          Shop
        </Link>
        <Link
          href="/about"
          className="text-xs font-medium tracking-wider uppercase hover:text-gray-400 transition-colors duration-300"
        >
          About Us
        </Link>
        <Link
          href="/contact"
          className="text-xs font-medium tracking-wider uppercase hover:text-gray-400 transition-colors duration-300"
        >
          Contact
        </Link>

        {isSeller && (
          <button
            onClick={() => router.push("/seller")}
            className="text-xs font-semibold tracking-wider uppercase border border-white px-4 py-1.5 hover:bg-white hover:text-black transition-all duration-300"
          >
            Seller Dashboard
          </button>
        )}
      </div>

      {/* Desktop Icons & User */}
      <ul className="hidden md:flex items-center gap-4">
        {/* Search Icon */}
        <button className="hover:opacity-70 transition-opacity" aria-label="Search">
          <SearchIcon />
        </button>

        {user ? (
          <div className="flex items-center gap-2">
            {/* Cart */}
            <button
              className="relative hover:opacity-70 transition-opacity"
              aria-label="Cart"
              onClick={() => router.push("/cart")}
            >
              <CartIcon />
              {getCartCount() > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                  {getCartCount() > 9 ? "9+" : getCartCount()}
                </span>
              )}
            </button>

            {/* Bag / Orders */}
            <button
              className="hover:opacity-70 transition-opacity"
              aria-label="My orders"
              onClick={() => router.push("/my-orders")}
            >
              <BagIcon />
            </button>

            {/* UserButton */}
            <div className="hover:opacity-70 transition-opacity flex items-center">
              <UserButton />
            </div>
          </div>
        ) : (
          <button
            onClick={openSignIn}
            className="flex items-center gap-2 text-xs font-medium tracking-wider uppercase hover:text-gray-400 transition-colors duration-300"
          >
            <UserIcon className="w-4 h-4" />
            Account
          </button>
        )}
      </ul>

      {/* Mobile */}
      <div className="flex items-center md:hidden gap-2">
        {/* Home Button */}
        <button
          onClick={() => router.push("/")}
          className="hover:opacity-70 transition-opacity"
          aria-label="Home"
        >
          <HomeIcon />
        </button>

        {/* Products Button */}
        <button
          onClick={() => router.push("/all-products")}
          className="hover:opacity-70 transition-opacity"
          aria-label="Products"
        >
          <TagIcon />
        </button>

        {isSeller && (
          <button
            onClick={() => router.push("/seller")}
            className="text-xs font-semibold tracking-wider uppercase border border-white px-3 py-1 hover:bg-white hover:text-black transition-all duration-300"
          >
            Seller
          </button>
        )}
        {user ? (
          <div className="flex items-center gap-2">
            {/* Cart */}
            <button
              className="relative hover:opacity-70 transition-opacity"
              aria-label="Cart"
              onClick={() => router.push("/cart")}
            >
              <CartIcon />
              {getCartCount() > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                  {getCartCount() > 9 ? "9+" : getCartCount()}
                </span>
              )}
            </button>

            {/* Bag / Orders */}
            <button
              className="hover:opacity-70 transition-opacity"
              aria-label="My orders"
              onClick={() => router.push("/my-orders")}
            >
              <BagIcon />
            </button>

            {/* UserButton */}
            <div className="hover:opacity-70 transition-opacity flex items-center">
              <UserButton />
            </div>
          </div>
        ) : (
          <button
            onClick={openSignIn}
            className="flex items-center gap-2 text-xs font-medium tracking-wider uppercase hover:text-gray-400 transition-colors duration-300"
          >
            <UserIcon className="w-4 h-4" />
            Account
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;