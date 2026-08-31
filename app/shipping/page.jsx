import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "Shipping & Delivery — Shredded Motion",
  description: "Where we deliver, delivery timelines and fees for Shredded Motion orders.",
};

export default function ShippingPage() {
  return (
    <div className="bg-black min-h-screen">
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 pt-20 pb-24">
        <div className="max-w-3xl">
          <p className="text-xs tracking-[0.35em] uppercase text-gray-500">Support</p>
          <h1 className="mt-3 text-3xl md:text-5xl font-bold uppercase tracking-wide text-white">
            Shipping &amp; Delivery
          </h1>
          <div className="w-24 h-1 bg-white mt-5" />
          <p className="mt-5 text-gray-500 text-sm">Last updated: August 2026</p>

          {/* quick summary */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { k: "Coverage", v: "Nationwide (Nigeria)" },
              { k: "Lagos", v: "1–3 business days" },
              { k: "Other states", v: "3–7 business days" },
            ].map((c) => (
              <div key={c.k} className="border border-gray-800 p-5">
                <p className="text-xs uppercase tracking-wider text-gray-500">{c.k}</p>
                <p className="mt-1 text-white font-semibold">{c.v}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 space-y-9 text-gray-300 leading-relaxed text-sm md:text-base">
            <section>
              <h2 className="text-white font-bold uppercase tracking-wide mb-2">Where we deliver</h2>
              <p>We currently deliver nationwide across Nigeria.</p>
            </section>

            <section>
              <h2 className="text-white font-bold uppercase tracking-wide mb-2">Order processing</h2>
              <p>Orders are processed and dispatched within
                <span className="text-white font-semibold"> 1–2 business days</span> after your payment is
                confirmed.</p>
            </section>

            <section>
              <h2 className="text-white font-bold uppercase tracking-wide mb-2">Delivery timelines</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li><span className="text-white">Lagos:</span> 1–3 business days from dispatch</li>
                <li><span className="text-white">Other states:</span> 3–7 business days from dispatch</li>
              </ul>
              <p className="mt-2 text-gray-400">Timelines are estimates and may vary during peak periods,
                public holidays, or due to courier delays outside our control.</p>
            </section>

            <section>
              <h2 className="text-white font-bold uppercase tracking-wide mb-2">Delivery fees</h2>
              <p>Delivery is <span className="text-white font-semibold">free on all orders within Nigeria</span>.
                Your order total at checkout is the final amount — no surprise shipping charges.</p>
            </section>

            <section>
              <h2 className="text-white font-bold uppercase tracking-wide mb-2">Order updates</h2>
              <p>You&apos;ll receive updates on your order status by email. If you have any questions about a
                delivery, reach us through the
                <Link href="/contact" className="text-white underline underline-offset-4 hover:text-gray-300"> Contact page</Link>.</p>
            </section>

            <section>
              <h2 className="text-white font-bold uppercase tracking-wide mb-2">Delivery address</h2>
              <p>Please make sure your delivery address and phone number are correct at checkout. We can&apos;t
                be responsible for delays or failed deliveries caused by incorrect or incomplete details.</p>
            </section>

            <section>
              <h2 className="text-white font-bold uppercase tracking-wide mb-2">Failed delivery attempts</h2>
              <p>If a delivery attempt fails because no one is available or the address is incorrect, our
                courier will attempt to contact you to reschedule.</p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
