'use client'
import React from "react";
import HeaderSlider from "@/components/HeaderSlider";
import Banner from "@/components/Banner";
import NewsLetter from "@/components/NewsLetter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NewDropShowcase from "@/components/newdrop/NewDropShowcase";
import FeaturedCategories from "@/components/newdrop/FeaturedCategories";
import AllProductsHome from "@/components/AllProductsHome";
import TrendingNow from "@/components/TrendingNow";
import FollowSocials from "@/components/FollowSocials";

const Home = () => {
  return (
    <div className="bg-black min-h-screen">
      <Navbar/>
      <HeaderSlider />
      <TrendingNow />
      <NewDropShowcase limit={8} showViewAll />
      <FeaturedCategories />
      <AllProductsHome />
      <FollowSocials />
      <div className="px-6 md:px-16 lg:px-32">
        <Banner />
        <NewsLetter />
      </div>
      <Footer />
    </div>
  );
};

export default Home;
