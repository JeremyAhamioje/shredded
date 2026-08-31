import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import Link from "next/link";

const SOCIAL_URL = "https://linktr.ee/shreddedmotion";

const links = [
  { label: "Shop", href: "/all-products" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Shipping & Delivery", href: "/shipping" },
  { label: "Returns & Refunds", href: "/returns" },
];

const Footer = () => {
  return (
    <footer className="bg-black border-t border-gray-800 mt-20">
      <div className="px-6 md:px-16 lg:px-32 py-10">
        {/* top: logo + nav + socials */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-gray-800 pb-8">
          <Image
            className="w-32 md:w-40 brightness-0 invert"
            src="https://res.cloudinary.com/dz6kxumoo/image/upload/v1769556059/WhatsApp_Image_2026-01-25_at_7.50.30_PM-removebg-preview_hgpu4b.png"
            alt="Shredded Motion logo"
            width={160}
            height={60}
          />

          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs md:text-sm uppercase tracking-wider text-gray-400">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-white transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            {[
              { icon: assets.facebook_icon, label: "Facebook" },
              { icon: assets.twitter_icon, label: "Twitter" },
              { icon: assets.instagram_icon, label: "Instagram" },
            ].map((s) => (
              <a
                key={s.label}
                href={SOCIAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-70 transition-opacity duration-300"
                aria-label={s.label}
              >
                <Image className="w-6 h-6 brightness-0 invert" src={s.icon} alt={`${s.label} icon`} width={24} height={24} />
              </a>
            ))}
          </div>
        </div>

        {/* bottom: copyright + payment trust */}
        <div className="pt-6 flex flex-col-reverse md:flex-row items-center justify-between gap-3">
          <p className="text-xs md:text-sm text-gray-400 tracking-wide">
            Copyright 2026 © Shredded Motion. All Rights Reserved.
          </p>
          <p className="text-xs uppercase tracking-wider text-gray-500">
            Secure payments powered by Paystack
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
