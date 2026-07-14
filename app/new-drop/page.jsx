'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import NewDropShowcase from '@/components/newdrop/NewDropShowcase';

export default function NewDropPage() {
  return (
    <div className="bg-black min-h-screen">
      <Navbar />
      <NewDropShowcase />
      <Footer />
    </div>
  );
}
