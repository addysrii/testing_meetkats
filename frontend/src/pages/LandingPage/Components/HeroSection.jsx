import React from 'react';

const HeroSection = () => {
  return (
    <div className="relative w-full h-[70vh] bg-cover bg-center flex items-center justify-center text-white text-center overflow-hidden">
      {/* Background Image - Using a concert/event image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
        }}
      ></div>
      
      {/* Gradient overlay to enhance text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60"></div>
      
      {/* Content container */}
      <div className="relative z-10 max-w-4xl mx-auto px-4">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-2 leading-tight">
          Your Inner Circle
        </h1>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
          Just Got Bigger.
        </h1>
        
        {/* Placeholder text in oval shape */}
        <div className="inline-block border-2 border-white rounded-full px-8 py-3">
          <p className="text-lg md:text-xl font-medium">
            eg line, or one line text goes here
          </p>
        </div>
      </div>
      
      {/* Additional visual elements to enhance the concert feel */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {/* Stage lighting effect */}
        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-b from-blue-500/20 to-transparent"></div>
        
        {/* Audience lighting effect */}
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-b from-orange-500/20 to-transparent"></div>
      </div>
    </div>
  );
};

export default HeroSection; 