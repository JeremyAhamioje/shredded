import React from "react";

const NewsLetter = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6 pt-16 pb-20 border-t border-gray-800 mt-20">
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold uppercase tracking-wide text-white">
        Join The Movement
      </h2>
      <p className="text-sm md:text-base text-gray-400 pb-4 max-w-xl leading-relaxed">
        Subscribe now and get exclusive access to new drops, special offers, and 20% off your first order
      </p>
      <div className="flex items-center justify-between max-w-2xl w-full md:h-14 h-12 border border-gray-700 hover:border-gray-500 transition-colors duration-300">
        <input
          className="bg-black text-white placeholder:text-gray-500 h-full outline-none w-full px-4 md:px-6 text-sm md:text-base"
          type="email"
          placeholder="ENTER YOUR EMAIL"
        />
        <button className="md:px-12 px-8 h-full text-black bg-white font-semibold uppercase tracking-wider text-sm hover:bg-gray-200 transition-colors duration-300 whitespace-nowrap">
          Subscribe
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-4">
        By subscribing, you agree to our Privacy Policy and Terms of Service
      </p>
    </div>
  );
};

export default NewsLetter;