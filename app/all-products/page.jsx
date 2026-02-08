'use client'
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";

const AllProducts = () => {

    const { products } = useAppContext();

    return (
        <div className="bg-black min-h-screen">
            <Navbar />
            <div className="flex flex-col items-start px-6 md:px-16 lg:px-32">
                <div className="flex flex-col items-start pt-16 md:pt-20 w-full border-b border-gray-800 pb-6">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-wide uppercase text-white">
                        All Products
                    </h1>
                    <div className="w-24 h-1 bg-white mt-3"></div>
                    <p className="text-sm text-gray-400 mt-3 tracking-wider uppercase">
                        Explore Our Complete Collection
                    </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8 mt-12 pb-20 w-full">
                    {products.map((product, index) => <ProductCard key={index} product={product} />)}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default AllProducts;