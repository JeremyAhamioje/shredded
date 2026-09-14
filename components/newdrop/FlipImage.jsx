'use client';
import { useState } from 'react';

// Front <-> back/side image switcher for the New Drop cards (plain-image path,
// i.e. SHOWCASE_FX off).
//   • Default shows the FRONT (rest) image.
//   • Desktop: hover reveals the other angle. Mobile: the pill toggles it on tap.
//   • The pill is a caption for the angle CURRENTLY shown (Front / Side / Back),
//     so it always matches the visible image.
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function FlipImage({ angles = {}, alt = '' }) {
  // rest = front if present; reveal = back, else side (the other angle to flip to)
  const restKey = angles.front ? 'front' : angles.side ? 'side' : 'back';
  const revealKey = angles.back && restKey !== 'back'
    ? 'back'
    : angles.side && restKey !== 'side'
    ? 'side'
    : null;
  const restImg = angles[restKey];
  const revealImg = revealKey ? angles[revealKey] : null;

  const [hover, setHover] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const showingReveal = !!revealImg && (hover || flipped);
  const currentKey = showingReveal ? revealKey : restKey;

  return (
    <div
      className="relative w-full h-full"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={restImg}
        alt={alt}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-contain p-3 transition-opacity duration-500"
        style={{ opacity: showingReveal ? 0 : 1 }}
      />
      {revealImg && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={revealImg}
          alt=""
          loading="lazy"
          aria-hidden
          className="absolute inset-0 w-full h-full object-contain p-3 transition-opacity duration-500"
          style={{ opacity: showingReveal ? 1 : 0 }}
        />
      )}

      {revealImg && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setFlipped((f) => !f); }}
          aria-label={`Showing ${currentKey} — tap to flip`}
          className="absolute bottom-2 right-2 z-10 px-2.5 py-1 text-[10px] font-semibold tracking-widest uppercase bg-black/60 text-white border border-white/25 backdrop-blur-sm hover:bg-white hover:text-black transition-colors duration-300"
        >
          {cap(currentKey)}
        </button>
      )}
    </div>
  );
}
