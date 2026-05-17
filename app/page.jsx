'use client'
import React from "react";
import HeaderSlider from "@/components/HeaderSlider";
import HomeProducts from "@/components/HomeProducts";
import Banner from "@/components/Banner";
import NewsLetter from "@/components/NewsLetter";
import FeaturedProduct from "@/components/FeaturedProduct";
import HeroPage from "@/components/HeroPage";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Home = () => {
  return (
    <div className="bg-black min-h-screen">
      <Navbar/>
      <HeaderSlider />
      <div className="px-6 md:px-16 lg:px-32">
        <HomeProducts />
        <FeaturedProduct />
      </div>
      <HeroPage />
      <div className="px-6 md:px-16 lg:px-32">
        <Banner />
        <NewsLetter />
      </div>
      <Footer />
    </div>
  );
};

export default Home;


