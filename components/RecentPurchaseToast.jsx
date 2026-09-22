'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';

// Rotating FOMO / social-proof popup (sample activity — like ProveSource/Fomo).
const NAMES = ['Chris', 'Chidi', 'Amaka', 'Tunde', 'Emeka', 'Ngozi', 'Bola', 'Ifeanyi',
  'Zainab', 'Musa', 'David', 'Blessing', 'Kelechi', 'Aisha', 'Sofia', 'Daniel', 'Halima', 'Obi'];
const CITIES = ['Lagos', 'Kano', 'Abuja', 'Port Harcourt', 'Ibadan', 'Enugu', 'Benin City', 'Uyo', 'Jos', 'Kaduna'];
// Promotion products the toast features (nice model shots), by stable sku.
const TOAST_SKUS = ['tr-muscle-tank', 'nd-flare-jumpsuit-red', 'tr-onyx-quarter-zip',
  'nd-scrunch-romper-pink', 'tr-shredded-tee', 'nd-piped-set-red', 'nd-leopard-set-sand', 'nd-shredded-ls-set-blush'];
const pick = (a) => a[Math.floor(Math.random() * a.length)];

export default function RecentPurchaseToast() {
  const { products } = useAppContext();
  const [entry, setEntry] = useState(null);
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed || !products?.length) return;
    const bySku = {};
    products.forEach((p) => (p.skus || []).forEach((s) => { bySku[s] = p; }));
    const pool = TOAST_SKUS.map((s) => bySku[s]).filter(Boolean);
    if (!pool.length) return;

    let tHide, tNext, cancelled = false;
    const cycle = () => {
      if (cancelled) return;
      setEntry({ name: pick(NAMES), city: pick(CITIES), product: pick(pool) });
      setShow(true);
      tHide = setTimeout(() => setShow(false), 5500);        // visible ~5.5s
      tNext = setTimeout(cycle, 5500 + 7000);                // gap ~7s, then repeat
    };
    const tStart = setTimeout(cycle, 4000);                   // first after 4s
    return () => { cancelled = true; [tStart, tHide, tNext].forEach(clearTimeout); };
  }, [products, dismissed]);

  if (dismissed || !entry) return null;
  const { name, city, product } = entry;

  return (
    <div className={`fixed bottom-4 left-4 z-50 w-[19rem] max-w-[calc(100vw-2rem)] transition-all duration-500 ${
      show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
    }`}>
      <div className="flex items-start gap-3 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-3">
        <Link href={`/product/${product._id}`} className="w-14 h-14 shrink-0 bg-gray-800 rounded overflow-hidden">
          <Image src={product.image[0]} alt={product.name} width={56} height={56} unoptimized
            className="w-full h-full object-contain" />
        </Link>
        <div className="min-w-0 text-xs text-gray-300 leading-snug">
          <p>
            🛍️ <span className="font-semibold text-white">{name}</span> recently bought{' '}
            <Link href={`/product/${product._id}`} className="font-medium text-white underline underline-offset-2 hover:text-gray-200">
              {product.name}
            </Link>
          </p>
          <p className="text-gray-500 mt-0.5">from {city}, Nigeria 🇳🇬</p>
          <Link href={`/product/${product._id}`} className="inline-block mt-1 text-red-400 hover:text-red-300 font-medium">
            View product
          </Link>
        </div>
        <button onClick={() => setDismissed(true)} aria-label="Dismiss"
          className="shrink-0 text-gray-500 hover:text-white leading-none text-sm">✕</button>
      </div>
    </div>
  );
}
