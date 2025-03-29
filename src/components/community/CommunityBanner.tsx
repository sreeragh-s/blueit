
import React from "react";

interface CommunityBannerProps {
  name: string;
  bannerImage?: string;
}

const CommunityBanner = ({ name, bannerImage }: CommunityBannerProps) => {
  return (
    <div 
      className="h-40 md:h-60 w-full bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bannerImage || "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"})` }}
    >
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 flex flex-col">
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          c/{name}
        </h1>
        <p className="text-white/80 text-sm mt-1">
          {/* Placeholder for future member count or other community stats */}
        </p>
      </div>
    </div>
  );
};

export default CommunityBanner;
