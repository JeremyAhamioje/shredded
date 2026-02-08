"use client"
import { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useParams } from "next/navigation";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";
import React from "react";

const Product = () => {

    const { id } = useParams();

    const { products, router, addToCart } = useAppContext()

    const [mainImage, setMainImage] = useState(null);
    const [productData, setProductData] = useState(null);

    const fetchProductData = async () => {
        const product = products.find(product => product._id === id);
        setProductData(product);
    }

    useEffect(() => {
        fetchProductData();
    }, [id, products.length])

    return productData ? (
        <div className="bg-black min-h-screen">
            <Navbar />
            <div className="px-6 md:px-16 lg:px-32 pt-14 space-y-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
                    <div className="px-5 lg:px-16 xl:px-20">
                        <div className="overflow-hidden bg-black mb-4 border border-gray-800 hover:border-gray-600 transition-colors duration-300">
                            <Image
                                src={mainImage || productData.image[0]}
                                alt={productData.name}
                                className="w-full h-auto object-cover"
                                width={1280}
                                height={720}
                            />
                        </div>

                        <div className="grid grid-cols-4 gap-3">
                            {productData.image.map((image, index) => (
                                <div
                                    key={index}
                                    onClick={() => setMainImage(image)}
                                    className={`cursor-pointer overflow-hidden bg-black border transition-all duration-300 ${
                                        mainImage === image || (!mainImage && index === 0)
                                            ? 'border-white'
                                            : 'border-gray-800 hover:border-gray-600'
                                    }`}
                                >
                                    <Image
                                        src={image}
                                        alt={`${productData.name} view ${index + 1}`}
                                        className="w-full h-auto object-cover"
                                        width={1280}
                                        height={720}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col text-white">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-wide uppercase mb-6">
                            {productData.name}
                        </h1>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-0.5">
                                <Image className="h-4 w-4 brightness-0 invert" src={assets.star_icon} alt="star_icon" width={16} height={16} />
                                <Image className="h-4 w-4 brightness-0 invert" src={assets.star_icon} alt="star_icon" width={16} height={16} />
                                <Image className="h-4 w-4 brightness-0 invert" src={assets.star_icon} alt="star_icon" width={16} height={16} />
                                <Image className="h-4 w-4 brightness-0 invert" src={assets.star_icon} alt="star_icon" width={16} height={16} />
                                <Image
                                    className="h-4 w-4 brightness-0 invert opacity-40"
                                    src={assets.star_dull_icon}
                                    alt="star_dull_icon"
                                    width={16}
                                    height={16}
                                />
                            </div>
                            <p className="text-gray-300">(4.5)</p>
                        </div>
                        <p className="text-gray-400 mt-5 leading-relaxed text-sm md:text-base">
                            {productData.description}
                        </p>
                        <p className="text-4xl font-bold mt-8 tracking-wide">
                            ${productData.offerPrice}
                            <span className="text-lg font-normal text-gray-500 line-through ml-3">
                                ${productData.price}
                            </span>
                        </p>
                        <hr className="border-gray-800 my-8" />
                        <div className="overflow-x-auto">
                            <table className="table-auto border-collapse w-full max-w-md">
                                <tbody className="space-y-2">
                                    <tr className="border-b border-gray-800">
                                        <td className="text-gray-400 font-medium py-3 pr-8 uppercase tracking-wider text-sm">Brand</td>
                                        <td className="text-white py-3">Generic</td>
                                    </tr>
                                    <tr className="border-b border-gray-800">
                                        <td className="text-gray-400 font-medium py-3 pr-8 uppercase tracking-wider text-sm">Color</td>
                                        <td className="text-white py-3">Multi</td>
                                    </tr>
                                    <tr className="border-b border-gray-800">
                                        <td className="text-gray-400 font-medium py-3 pr-8 uppercase tracking-wider text-sm">Category</td>
                                        <td className="text-white py-3">
                                            {productData.category}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="flex items-center mt-12 gap-4">
                            <button 
                                onClick={() => addToCart(productData._id)} 
                                className="w-full py-4 bg-transparent border-2 border-white text-white font-semibold uppercase tracking-wider text-sm hover:bg-white hover:text-black transition-all duration-300"
                            >
                                Add to Cart
                            </button>
                            <button 
                                onClick={() => { addToCart(productData._id); router.push('/cart') }} 
                                className="w-full py-4 bg-white text-black font-semibold uppercase tracking-wider text-sm hover:bg-gray-200 transition-all duration-300"
                            >
                                Buy Now
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-center border-t border-gray-800 pt-16">
                    <div className="flex flex-col items-center mb-4">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-wide uppercase text-white">
                            Featured <span className="font-bold">Products</span>
                        </h2>
                        <div className="w-32 h-1 bg-white mt-4"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8 mt-12 pb-14 w-full">
                        {products.slice(0, 5).map((product, index) => <ProductCard key={index} product={product} />)}
                    </div>
                    <button className="px-10 py-3 mb-16 border-2 border-white text-white font-semibold uppercase tracking-wider text-sm hover:bg-white hover:text-black transition-all duration-300">
                        See More
                    </button>
                </div>
            </div>
            <Footer />
        </div>
    ) : <Loading />
};

export default Product;