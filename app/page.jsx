'use client'
import React from "react";
import HeaderSlider from "@/components/HeaderSlider";
import Banner from "@/components/Banner";
import NewsLetter from "@/components/NewsLetter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NewDropShowcase from "@/components/newdrop/NewDropShowcase";
import FeaturedCategories from "@/components/newdrop/FeaturedCategories";
import TrendingShowcase from "@/components/newdrop/TrendingShowcase";
import FollowSocials from "@/components/FollowSocials";

const Home = () => {
  return (
    <div className="bg-black min-h-screen">
      <Navbar/>
      <HeaderSlider />
      <TrendingShowcase />
      <FeaturedCategories />
      <NewDropShowcase limit={4} showViewAll />
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
