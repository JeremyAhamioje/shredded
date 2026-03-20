import React from "react";
import { assets } from "@/assets/assets";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { useClerk, UserButton } from "@clerk/nextjs";

const Navbar = () => {
  const { isSeller, router, user } = useAppContext();
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
        {assets.search_icon && (
          <button className="hover:opacity-70 transition-opacity">
            <Image
              className="w-4 h-4 brightness-0 invert"
              src={assets.search_icon}
              alt="search icon"
              width={16}
              height={16}
            />
          </button>
        )}

        {user ? (
          <div className="flex items-center gap-2">
            {/* Cart */}
            {assets.cart_icon && (
              <button
                className="hover:opacity-70 transition-opacity"
                aria-label="Cart"
                onClick={() => router.push("/cart")}
              >
                <Image
                  className="w-4 h-4 brightness-0 invert"
                  src={assets.cart_icon}
                  alt="cart icon"
                  width={16}
                  height={16}
                />
              </button>
            )}

            {/* Bag / Orders */}
            {assets.bag_icon && (
              <button
                className="hover:opacity-70 transition-opacity"
                aria-label="My orders"
                onClick={() => router.push("/my-orders")}
              >
                <Image
                  className="w-5 h-5 brightness-0 invert"
                  src={assets.bag_icon}
                  alt="bag icon"
                  width={16}
                  height={16}
                />
              </button>
            )}

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
            {assets.user_icon && (
              <Image
                className="brightness-0 invert"
                src={assets.user_icon}
                alt="user icon"
                width={16}
                height={16}
              />
            )}
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
          <svg className="w-5 h-5 brightness-0 invert" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
        </button>

        {/* Products Button */}
        <button
          onClick={() => router.push("/all-products")}
          className="hover:opacity-70 transition-opacity"
          aria-label="Products"
        >
          {assets.shop_icon && (
            <Image
              className="w-4 h-4 brightness-0 invert"
              src={assets.shop_icon}
              alt="shop icon"
              width={20}
              height={20}
            />
          )}
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
            {assets.cart_icon && (
              <button
                className="hover:opacity-70 transition-opacity"
                aria-label="Cart"
                onClick={() => router.push("/cart")}
              >
                <Image
                  className="w-4 h-4 brightness-0 invert"
                  src={assets.cart_icon}
                  alt="cart icon"
                  width={16}
                  height={16}
                />
              </button>
            )}

            {/* Bag / Orders */}
            {assets.bag_icon && (
              <button
                className="hover:opacity-70 transition-opacity"
                aria-label="My orders"
                onClick={() => router.push("/my-orders")}
              >
                <Image
                  className="w-5 h-5 brightness-0 invert"
                  src={assets.bag_icon}
                  alt="bag icon"
                  width={16}
                  height={16}
                />
              </button>
            )}

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
            {assets.user_icon && (
              <Image
                className="brightness-0 invert"
                src={assets.user_icon}
                alt="user icon"
                width={16}
                height={16}
              />
            )}
            Account
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;