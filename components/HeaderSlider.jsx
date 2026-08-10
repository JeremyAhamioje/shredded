import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import HeroTiltGrid from "@/components/newdrop/HeroTiltGrid";


const HeaderSlider = () => {
  const sliderData = [
    {
      id: 1,
      title: "Shredded Motion",
      subtitle: "For the 1%",
      offer: "READY TO SHIP — PREMIUM COMPRESSION — NATIONWIDE DELIVERY",
      buttonText1: "SHOP NOW",
      buttonText2: "EXPLORE",
      imgSrc: "https://res.cloudinary.com/dz6kxumoo/image/upload/f_auto,q_auto:best/v1786317986/quickcart/hero/hero-slide1.png",
    },
    {
      id: 2,
      title: "Built Different",
      subtitle: "Shredded Motion",
      offer: "PERFORMANCE APPAREL FOR THE 1%",
      buttonText1: "SHOP NOW",
      buttonText2: "DISCOVER",
      imgSrc: "https://res.cloudinary.com/dz6kxumoo/image/upload/f_auto,q_auto:best/v1785119040/quickcart/photoshoot/IMG_3115.png",
    },
    {
      id: 3,
      title: "Own The Grind",
      subtitle: "For the 1%",
      offer: "STUDIO DROP — ENGINEERED COMPRESSION — NATIONWIDE DELIVERY",
      buttonText1: "SHOP NOW",
      buttonText2: "VIEW ALL",
      variant: "tiltgrid",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderData.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [sliderData.length]);

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="overflow-hidden relative w-full -mx-4 md:-mx-8 lg:-mx-12">
      <div
        className="flex transition-transform duration-1000 ease-in-out"
        style={{
          transform: `translateX(-${currentSlide * 100}%)`,
        }}
      >
        {sliderData.map((slide, index) => (
          <div
            key={slide.id}
            className="relative flex flex-col items-center justify-center bg-black text-white min-w-full h-[70vh] md:h-[85vh] overflow-hidden"
          >
            {/* Background */}
            <div className="absolute inset-0 z-0">
              {slide.variant === "tiltgrid" ? (
                <>
                  <HeroTiltGrid />
                  <div className="absolute inset-0 bg-black/60"></div>
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black"></div>
                </>
              ) : (
                <>
                  <Image
                    className="w-full h-full object-cover opacity-40"
                    src={slide.imgSrc}
                    alt={`Slide ${index + 1}`}
                    width={1920}
                    height={1080}
                    priority={index === 0}
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black"></div>
                </>
              )}
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 md:px-12 max-w-5xl">
              {/* Offer Banner */}
              <p className="text-[10px] md:text-xs tracking-[0.2em] text-gray-300 font-light uppercase mb-4 md:mb-6 border border-gray-600 px-4 py-2 bg-black/50">
                {slide.offer}
              </p>

              {/* Main Title */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-3 md:mb-4 tracking-tight leading-tight">
                {slide.title}
              </h1>

              {/* Subtitle */}
              <p className="text-xl md:text-2xl lg:text-3xl font-light tracking-wide text-gray-300 mb-8 md:mb-10">
                {slide.subtitle}
              </p>

              {/* Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 mt-4">
                <Link href="/all-products">
                  <button className="px-10 md:px-14 py-3 md:py-4 bg-white text-black font-semibold uppercase tracking-wider text-sm md:text-base hover:bg-gray-200 transition-all duration-300 border-2 border-white">
                    {slide.buttonText1}
                  </button>
                </Link>

                <Link href="/all-products">
                  <button className="group flex items-center gap-3 px-8 md:px-10 py-3 md:py-4 font-medium uppercase tracking-wider text-sm md:text-base border-2 border-white text-white hover:bg-white hover:text-black transition-all duration-300">
                    {slide.buttonText2}
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </Link>
              </div>
              </div>
                     

                     {/* Product Image Overlay (centered) — not for the tilt-grid slide */}
            {slide.variant !== "tiltgrid" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-[5] flex items-end justify-center h-[82%] md:h-[86%] w-full max-w-md md:max-w-lg lg:max-w-xl">
                {/* h-full + object-contain keeps the whole figure (incl. face) in
                    frame no matter the source aspect ratio; object-bottom anchors
                    the feet to the hero base. */}
                <Image
                  className="w-full h-full object-contain object-bottom opacity-90"
                  src={slide.imgSrc}
                  alt={`Product ${index + 1}`}
                  width={600}
                  height={800}
                  priority={index === 0}
                  unoptimized
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center justify-center gap-3 z-20">
        {sliderData.map((_, index) => (
          <button
            key={index}
            onClick={() => handleSlideChange(index)}
            className={`h-2 w-2 rounded-full cursor-pointer transition-all duration-300 ${
              currentSlide === index 
                ? "bg-white w-8" 
                : "bg-gray-500 hover:bg-gray-400"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default HeaderSlider;