import React from "react";
import Image from "next/image";

const HeroPage = () => {
  return (
    <div className="relative w-full min-h-[90vh] md:min-h-screen my-20 md:my-28 border border-gray-800 bg-black flex items-center justify-center overflow-hidden">
      <Image
        src="https://res.cloudinary.com/dz6kxumoo/image/upload/v1770311356/Gemini_Generated_Image_qtn0icqtn0icqtn0_hshmbi.png"
        alt="Shredded Hero"
        className="w-full h-full object-contain"
        width={1920}
        height={1080}
        priority
      />
    </div>
  );
};

export default HeroPage;
