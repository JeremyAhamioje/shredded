'use client';
import { useState } from 'react';

// Front <-> back image switcher for the New Drop cards (plain-image path, i.e.
// SHOWCASE_FX off). Fixes the "back/front images are useless" problem:
//   • Desktop: hover reveals the back (or side, if there's no dedicated back).
//   • Mobile:  no hover exists, so an explicit "Back/Front" pill toggles it on tap.
// The pill stops propagation so it never triggers the card's navigate-on-click.
export default function FlipImage({ angles = {}, alt = '' }) {
  const front = angles.front || angles.side || angles.back;
  const back = angles.back || angles.side || null; // second angle to reveal
  const [hover, setHover] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const showingBack = !!back && (hover || flipped);

  return (
    <div
      className="relative w-full h-full"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={front}
        alt={alt}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-contain p-3 transition-opacity duration-500"
        style={{ opacity: showingBack ? 0 : 1 }}
      />
      {back && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={back}
          alt=""
          loading="lazy"
          aria-hidden
          className="absolute inset-0 w-full h-full object-contain p-3 transition-opacity duration-500"
          style={{ opacity: showingBack ? 1 : 0 }}
        />
      )}

      {back && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setFlipped((f) => !f); }}
          aria-label={showingBack ? 'Show front' : 'Show back'}
          className="absolute bottom-2 right-2 z-10 px-2.5 py-1 text-[10px] font-semibold tracking-widest uppercase bg-black/60 text-white border border-white/25 backdrop-blur-sm hover:bg-white hover:text-black transition-colors duration-300"
        >
          {showingBack ? 'Front' : 'Back'}
        </button>
      )}
    </div>
  );
}
