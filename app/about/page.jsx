'use client'
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";

// Real gymwear imagery reused from the homepage's Featured Products.
const HERO_IMG = "https://res.cloudinary.com/dz6kxumoo/image/upload/v1769724056/Gemini_Generated_Image_u8v12eu8v12eu8v1_u420fn.png";
const MISSION_IMG = "https://res.cloudinary.com/dz6kxumoo/image/upload/v1769721795/Gemini_Generated_Image_6guo1d6guo1d6guo_rvpaf1.png";

const stats = [
    { value: "10K+", label: "Happy Customers" },
    { value: "500+", label: "Products Shipped" },
    { value: "4.9★", label: "Average Rating" },
    { value: "3+", label: "Years in Business" },
];

const values = [
    {
        title: "Performance First",
        desc: "Every piece is engineered for maximum range of motion, breathability, and durability under pressure.",
    },
    {
        title: "Built for Athletes",
        desc: "Designed by people who train. Cut for bodies that move. No compromise between style and function.",
    },
    {
        title: "Community Driven",
        desc: "We grow with our community. Your feedback shapes every new drop we put into the world.",
    },
];

export default function AboutPage() {
    const { router } = useAppContext();

    return (
        <div className="bg-black min-h-screen">
            <Navbar />

            {/* Hero */}
            <section className="px-6 md:px-16 lg:px-32 pt-20 pb-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-[0.35em] mb-4">Our Story</p>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-wide text-white leading-tight">
                        Built to Perform.
                        <br />Made to Last.
                    </h1>
                    <div className="w-24 h-1 bg-white mt-6" />
                    <p className="mt-6 text-gray-400 text-sm md:text-base leading-relaxed max-w-lg">
                        Shredded Gymwear was born in the gym and built for the grind. We create performance
                        apparel that keeps up with your hardest sessions — because your gear should never be
                        what holds you back.
                    </p>
                    <button
                        onClick={() => router.push("/all-products")}
                        className="mt-8 bg-white text-black px-8 py-3 uppercase text-sm font-semibold tracking-wider hover:bg-gray-200 transition-colors"
                    >
                        Shop the Collection
                    </button>
                </div>
                <div className="relative overflow-hidden border border-gray-800">
                    <Image
                        src={HERO_IMG}
                        alt="Shredded athlete"
                        className="w-full h-[420px] md:h-[520px] object-cover"
                        width={800}
                        height={1000}
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
            </section>

            {/* Stats */}
            <section className="border-t border-b border-gray-800 py-12 px-6 md:px-16 lg:px-32">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {stats.map((s) => (
                        <div key={s.label}>
                            <p className="text-3xl md:text-4xl font-bold text-white">{s.value}</p>
                            <p className="text-gray-400 text-sm mt-1 uppercase tracking-wider">{s.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Values */}
            <section className="px-6 md:px-16 lg:px-32 py-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-wide text-white">
                        What We Stand For
                    </h2>
                    <div className="w-16 h-1 bg-white mx-auto mt-4" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {values.map((v) => (
                        <div key={v.title} className="border border-gray-800 p-8 hover:border-gray-600 transition-colors">
                            <div className="w-8 h-1 bg-white mb-6" />
                            <h3 className="text-white font-bold uppercase tracking-wide mb-3">{v.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{v.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Mission */}
            <section className="px-6 md:px-16 lg:px-32 pb-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="overflow-hidden border border-gray-800 order-2 md:order-1">
                    <Image
                        src={MISSION_IMG}
                        alt="Behind the brand"
                        className="w-full h-[420px] md:h-[520px] object-cover"
                        width={800}
                        height={1000}
                    />
                </div>
                <div className="order-1 md:order-2">
                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-[0.35em] mb-4">Our Mission</p>
                    <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-wide text-white leading-tight">
                        Gear That Matches <br />Your Grind
                    </h2>
                    <div className="w-24 h-1 bg-white mt-6" />
                    <p className="mt-6 text-gray-400 text-sm leading-relaxed">
                        We don't make clothes for the sidelines. Every stitch, seam, and fabric choice is
                        intentional — tested under real training conditions so you can push harder, recover
                        faster, and look the part while doing it.
                    </p>
                    <p className="mt-4 text-gray-400 text-sm leading-relaxed">
                        From compression shirts to shredded joggers, our range is built around one idea:
                        your performance is the product.
                    </p>
                </div>
            </section>

            <Footer />
        </div>
    );
}
