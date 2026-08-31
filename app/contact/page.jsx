'use client'
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { assets } from "@/assets/assets";
import toast from "react-hot-toast";
import axios from "@/lib/axios";

const contactDetails = [
    {
        label: "Email",
        value: "support@shreddedgymwear.com",
        icon: (
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
    },
    {
        label: "Phone",
        value: "+234 800 000 0000",
        icon: (
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
        ),
    },
    {
        label: "Location",
        value: "Lagos, Nigeria",
        icon: (
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
    },
    {
        label: "Hours",
        value: "Mon – Sat, 9am – 6pm WAT",
        icon: (
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
];

export default function ContactPage() {
    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.post("/api/contact", form);
            if (data.success) {
                toast.success("Message sent! We'll get back to you soon.");
                setForm({ name: "", email: "", subject: "", message: "" });
            } else {
                toast.error(data.message || "Something went wrong.");
            }
        } catch {
            toast.error("Could not send message. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-black min-h-screen">
            <Navbar />

            {/* Header */}
            <section className="px-6 md:px-16 lg:px-32 pt-20 pb-12 border-b border-gray-800">
                <p className="text-white text-xs font-semibold uppercase tracking-widest mb-3">Get in Touch</p>
                <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-wide text-white">
                    Contact Us
                </h1>
                <div className="w-16 h-1 bg-white mt-4" />
                <p className="mt-6 text-gray-400 text-sm max-w-xl leading-relaxed">
                    Have a question about an order, sizing, or a collaboration? We're here. Drop us a message
                    and we'll get back to you within 24 hours.
                </p>
            </section>

            {/* Main content */}
            <section className="px-6 md:px-16 lg:px-32 py-16 grid grid-cols-1 lg:grid-cols-2 gap-16">

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <h2 className="text-white font-semibold uppercase tracking-wide text-lg mb-6">Send a Message</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1.5">Name</label>
                            <input
                                name="name"
                                type="text"
                                required
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Your name"
                                className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-600 px-4 py-3 outline-none focus:border-white transition-colors text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1.5">Email</label>
                            <input
                                name="email"
                                type="email"
                                required
                                value={form.email}
                                onChange={handleChange}
                                placeholder="your@email.com"
                                className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-600 px-4 py-3 outline-none focus:border-white transition-colors text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1.5">Subject</label>
                        <input
                            name="subject"
                            type="text"
                            required
                            value={form.subject}
                            onChange={handleChange}
                            placeholder="What's this about?"
                            className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-600 px-4 py-3 outline-none focus:border-white transition-colors text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1.5">Message</label>
                        <textarea
                            name="message"
                            required
                            rows={6}
                            value={form.message}
                            onChange={handleChange}
                            placeholder="Tell us what's on your mind..."
                            className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-600 px-4 py-3 outline-none focus:border-white transition-colors text-sm resize-none"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black py-3 uppercase text-sm font-semibold tracking-wider hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        {loading ? "Sending..." : "Send Message"}
                    </button>
                </form>

                {/* Info */}
                <div className="flex flex-col gap-10">
                    <div>
                        <h2 className="text-white font-semibold uppercase tracking-wide text-lg mb-6">Contact Info</h2>
                        <div className="space-y-5">
                            {contactDetails.map((item) => (
                                <div key={item.label} className="flex items-start gap-4">
                                    <div className="mt-0.5">{item.icon}</div>
                                    <div>
                                        <p className="text-gray-500 text-xs uppercase tracking-wider">{item.label}</p>
                                        <p className="text-white text-sm mt-0.5">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border border-gray-800 overflow-hidden">
                        <Image
                            src={assets.my_location_image}
                            alt="Our location"
                            className="w-full h-auto"
                            width={600}
                            height={400}
                        />
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
