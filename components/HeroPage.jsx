import React from "react";
import Image from "next/image";
import Link from "next/link";

// "New Arrivals" banner: a bordered box, text + CTA on the LEFT, image on the RIGHT.
const HeroPage = () => {
  return (
    <section className="mx-6 md:mx-16 lg:mx-32 my-16 md:my-24 border border-gray-800 overflow-hidden bg-black">
      <div className="grid md:grid-cols-2">
        {/* LEFT: text + button (not over the image) */}
        <div className="order-2 md:order-1 flex flex-col justify-center gap-4 p-8 md:p-14">
          <p className="text-[11px] md:text-xs tracking-[0.35em] uppercase text-gray-500">
            Limited orders · Shipping in 1–3 days
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-wide uppercase text-white leading-tight">
            New Arrivals
          </h2>
          <p className="text-sm text-gray-400 max-w-sm">
            Fresh cuts from the SS26 drop — engineered fits and gothic graphics, shot in the round.
          </p>
          <Link
            href="/new-drop"
            className="mt-2 inline-flex w-fit items-center gap-2 px-8 py-3 bg-white text-black text-xs font-semibold tracking-widest uppercase hover:bg-gray-200 transition-colors duration-300"
          >
            Shop the drop
            <span aria-hidden>→</span>
          </Link>
        </div>

        {/* RIGHT: image */}
        <div className="order-1 md:order-2 relative min-h-[280px] md:min-h-[460px] border-b md:border-b-0 md:border-l border-gray-800">
          <Image
            src="https://res.cloudinary.com/dz6kxumoo/image/upload/v1770311356/Gemini_Generated_Image_qtn0icqtn0icqtn0_hshmbi.png"
            alt="Shredded New Arrivals"
            fill
            unoptimized
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
      </div>
    </section>
  );
};

export default HeroPage;
