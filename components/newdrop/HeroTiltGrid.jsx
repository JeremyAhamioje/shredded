'use client';
import Image from 'next/image';
import { trending, photoBanners } from '@/assets/photoshoot';

// Skewed, drifting grid of the studio cutouts — used as hero slide 3's backdrop.
// Deterministic order (no random) so SSR/CSR markup matches.
const pool = [...trending.flatMap((p) => p.images), ...Object.values(photoBanners)];

function buildRows(rows, per) {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: per }, (_, i) => pool[(r * per + i) % pool.length])
  );
}
const ROWS = buildRows(4, 8);

function Tile({ src }) {
  return (
    <div
      className="relative w-36 h-48 md:w-48 md:h-60 shrink-0 rounded-lg overflow-hidden border border-white/10"
      style={{ background: 'radial-gradient(65% 60% at 50% 42%, #242424, #0b0b0b 80%)' }}
    >
      <Image src={src} alt="" fill unoptimized sizes="200px" className="object-contain object-bottom p-2" />
    </div>
  );
}

function Row({ imgs, reverse, dur }) {
  const doubled = [...imgs, ...imgs]; // duplicate for a seamless -50% loop
  return (
    <div
      className="flex gap-4 w-max"
      style={{ animation: `htg-marq ${dur}s linear infinite`, animationDirection: reverse ? 'reverse' : 'normal' }}
    >
      {doubled.map((src, i) => <Tile key={i} src={src} />)}
    </div>
  );
}

export default function HeroTiltGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <div
        className="absolute left-1/2 top-1/2 flex flex-col gap-4"
        style={{ transform: 'translate(-50%,-50%) rotate(-8deg)' }}
      >
        {ROWS.map((r, i) => <Row key={i} imgs={r} reverse={i % 2 === 1} dur={48 + i * 7} />)}
      </div>
      <style>{`@keyframes htg-marq { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}
