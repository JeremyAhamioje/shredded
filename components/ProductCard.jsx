import React from 'react'
import { assets } from '@/assets/assets'
import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';

const ProductCard = ({ product }) => {

    const { currency, router } = useAppContext()

    return (
        <div
            onClick={() => { router.push('/product/' + product._id); scrollTo(0, 0) }}
            className="flex flex-col items-start gap-1 max-w-[280px] w-full cursor-pointer group"
        >
            <div className="cursor-pointer relative bg-black w-full h-72 md:h-80 flex items-center justify-center overflow-hidden border border-gray-800 hover:border-gray-600 transition-all duration-300">
                <Image
                    src={product.image[0]}
                    alt={product.name}
                    className="group-hover:scale-110 transition-transform duration-500 object-cover w-full h-full"
                    width={800}
                    height={800}
                />
                <button className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm p-2 border border-gray-700 hover:bg-white hover:border-white transition-all duration-300 group/heart">
                    <Image
                        className="h-3.5 w-3.5 brightness-0 invert group-hover/heart:invert-0"
                        src={assets.heart_icon}
                        alt="heart_icon"
                        width={14}
                        height={14}
                    />
                </button>
            </div>

            <div className="flex flex-col gap-1 w-full mt-3">
                <p className="text-sm md:text-base font-semibold tracking-wide uppercase text-white w-full truncate">
                    {product.name}
                </p>
                <p className="w-full text-xs text-gray-400 max-sm:hidden truncate">
                    {product.description}
                </p>
                
                <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-300">{4.5}</p>
                    <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <Image
                                key={index}
                                className="h-3 w-3 brightness-0 invert"
                                src={
                                    index < Math.floor(4)
                                        ? assets.star_icon
                                        : assets.star_dull_icon
                                }
                                alt="star_icon"
                                width={12}
                                height={12}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between w-full mt-2">
                    <p className="text-lg md:text-xl font-bold text-white tracking-wide">
                        {currency}{product.offerPrice}
                    </p>
                    <button className="max-sm:hidden px-5 py-2 text-white text-xs font-semibold tracking-wider uppercase border border-white hover:bg-white hover:text-black transition-all duration-300">
                        Buy Now
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ProductCard