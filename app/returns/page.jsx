import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "Returns & Refunds — Shredded Motion",
  description: "How returns, exchanges and refunds work at Shredded Motion.",
};

export default function ReturnsPage() {
  return (
    <div className="bg-black min-h-screen">
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 pt-20 pb-24">
        <div className="max-w-3xl">
          <p className="text-xs tracking-[0.35em] uppercase text-gray-500">Support</p>
          <h1 className="mt-3 text-3xl md:text-5xl font-bold uppercase tracking-wide text-white">
            Returns &amp; Refunds
          </h1>
          <div className="w-24 h-1 bg-white mt-5" />
          <p className="mt-5 text-gray-500 text-sm">Last updated: August 2026</p>

          <div className="mt-10 space-y-9 text-gray-300 leading-relaxed text-sm md:text-base">
            <section>
              <h2 className="text-white font-bold uppercase tracking-wide mb-2">Our promise</h2>
              <p>We want you to feel unstoppable in your Shredded Motion gear. If something isn&apos;t
                right, we&apos;re here to make it right.</p>
            </section>

            <section>
              <h2 className="text-white font-bold uppercase tracking-wide mb-2">Return window</h2>
              <p>You may request a return within <span className="text-white font-semibold">7 days</span> of
                receiving your order.</p>
            </section>

            <section>
              <h2 className="text-white font-bold uppercase tracking-wide mb-2">Condition of items</h2>
              <p>Items must be unworn, unwashed, and returned with their original tags and packaging intact.
                For hygiene reasons, items that have been worn, washed, or altered after delivery cannot be
                accepted.</p>
            </section>

            <section>
              <h2 className="text-white font-bold uppercase tracking-wide mb-2">How to start a return</h2>
              <p>Reach out through our <Link href="/contact" className="text-white underline underline-offset-4 hover:text-gray-300">Contact page</Link> with
                your order number and the reason for your return within the 7-day window. We&apos;ll confirm the
                return address and next steps.</p>
            </section>

            <section>
              <h2 className="text-white font-bold uppercase tracking-wide mb-2">Refunds</h2>
              <p>Once we receive and inspect your return, we&apos;ll process your refund to your original
                <span className="text-white"> Paystack </span> payment method within
                <span className="text-white font-semibold"> 5–10 business days</span>. You&apos;ll receive an
                email confirmation once your refund has been issued.</p>
            </section>

            <section>
              <h2 className="text-white font-bold uppercase tracking-wide mb-2">Exchanges</h2>
              <p>Need a different size? We&apos;re happy to exchange your item, subject to availability. Follow
                the same steps above and let us know the size you&apos;d like.</p>
            </section>

            <section>
              <h2 className="text-white font-bold uppercase tracking-wide mb-2">Return shipping</h2>
              <p>Return shipping costs are covered by the customer, except where an item is faulty, damaged, or
                incorrect — in which case we cover the cost in full.</p>
            </section>

            <section>
              <h2 className="text-white font-bold uppercase tracking-wide mb-2">Damaged, defective or wrong items</h2>
              <p>If your order arrives damaged, or you received the wrong item, contact us within
                <span className="text-white font-semibold"> 48 hours</span> of delivery and we&apos;ll arrange a
                free replacement or a full refund.</p>
            </section>

            <section>
              <h2 className="text-white font-bold uppercase tracking-wide mb-2">Non-returnable items</h2>
              <p>Gift cards and items marked as final sale or clearance are not eligible for return or refund.</p>
            </section>

            <section>
              <h2 className="text-white font-bold uppercase tracking-wide mb-2">Questions?</h2>
              <p>Our team is happy to help — reach us any time through the
                <Link href="/contact" className="text-white underline underline-offset-4 hover:text-gray-300"> Contact page</Link>.</p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
