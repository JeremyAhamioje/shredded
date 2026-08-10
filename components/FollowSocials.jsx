'use client';
import Link from 'next/link';

const SOCIAL_URL = 'https://linktr.ee/shreddedmotion';

const shots = [
  'https://res.cloudinary.com/dz6kxumoo/image/upload/f_auto,q_auto:good/v1786321607/quickcart/social/IMG_3322.jpg',
  'https://res.cloudinary.com/dz6kxumoo/image/upload/f_auto,q_auto:good/v1786321609/quickcart/social/IMG_3321.jpg',
  'https://res.cloudinary.com/dz6kxumoo/image/upload/f_auto,q_auto:good/v1786321609/quickcart/social/IMG_3320.jpg',
  'https://res.cloudinary.com/dz6kxumoo/image/upload/f_auto,q_auto:good/v1786321610/quickcart/social/IMG_3325.jpg',
  'https://res.cloudinary.com/dz6kxumoo/image/upload/f_auto,q_auto:good/v1786321611/quickcart/social/IMG_3323.jpg',
];

const IgIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
       strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5.5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

const Heart = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 21s-7.5-4.9-10-9.2C.4 8.9 1.7 5.3 5 4.6c2-.4 3.9.6 4.9 2.2C10.9 5.2 12.8 4.2 14.8 4.6c3.3.7 4.6 4.3 3 7.2C19.5 16.1 12 21 12 21z" />
  </svg>
);

// playful, static like counts per tile
const likes = ['2.4k', '1.8k', '3.1k', '947', '1.2k'];

export default function FollowSocials() {
  return (
    <section className="relative w-full px-6 md:px-16 lg:px-32 py-20 md:py-28 bg-black">
      {/* header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-gray-800 pb-6">
        <div>
          <p className="text-xs tracking-[0.35em] uppercase text-gray-500">@shreddedmotion</p>
          <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold tracking-wide uppercase text-white">
            Follow The Movement
          </h2>
          <div className="w-24 h-1 bg-white mt-3" />
          <p className="mt-4 max-w-md text-sm text-gray-400">
            Tag <span className="text-white">@shreddedmotion</span> to get featured. One link — every platform.
          </p>
        </div>
        <Link
          href={SOCIAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center justify-center gap-2 px-7 py-3 text-xs font-semibold tracking-widest uppercase bg-white text-black hover:bg-gray-200 transition-all duration-300"
        >
          <IgIcon className="w-4 h-4" /> Follow Us
        </Link>
      </div>

      {/* feed grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-10">
        {shots.map((src, i) => (
          <Link
            key={i}
            href={SOCIAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow Shredded Motion"
            className={`group relative block overflow-hidden bg-black aspect-[3/5] ${i === 4 ? 'max-md:hidden' : ''}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt="Shredded Motion community"
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            />
            {/* hover overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/0 group-hover:bg-black/55 transition-colors duration-300">
              <IgIcon className="w-8 h-8 text-white opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300" />
              <span className="text-[11px] tracking-[0.2em] uppercase text-white opacity-0 group-hover:opacity-100 transition-all duration-300 delay-75">
                @shreddedmotion
              </span>
            </div>

            {/* likes — a red heart badge that pops in and out on a staggered loop */}
            <div
              className="like-badge absolute bottom-3 left-3 z-20 flex items-center gap-1.5 pointer-events-none"
              style={{ animationDelay: `${i * 0.9}s` }}
            >
              <Heart className="w-4 h-4 text-red-500 drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]" />
              <span className="text-xs font-semibold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">{likes[i]}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
