import React from 'react';

const DiscountBanner = () => {
  return (
    <div className="w-full bg-cyan-400 py-4 px-4 flex items-center justify-between text-white text-left">
      <div className="flex flex-col md:flex-row md:items-end md:space-x-2">
        <span className="text-3xl md:text-5xl font-bold leading-none">upto <span className="text-white">10%</span> <span className="text-lg font-normal align-top">off</span></span>
        <span className="text-2xl md:text-3xl font-semibold ml-2">ON EVERY TICKET</span>
        <span className="text-xs md:text-sm font-light ml-2 mt-1 md:mt-0">T&C Apply*</span>
      </div>
      <div className="flex-shrink-0 ml-4">
        {/* Placeholder for logo */}
        <img
          src="/src/assets/MeetKats.jpg"
          alt="MeetKats Logo"
          className="w-12 h-12 rounded-md object-cover border-2 border-white shadow"
        />
      </div>
    </div>
  );
};

export default DiscountBanner; 