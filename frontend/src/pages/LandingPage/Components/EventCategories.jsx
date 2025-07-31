import React from 'react';

const categories = [
  {
    label: 'Comedy',
    icon: <span role="img" aria-label="Comedy" className="text-5xl">😂</span>,
  },
  {
    label: 'Concert',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g>
          <rect width="48" height="48" rx="24" fill="none"/>
          <path d="M32 14L20 34" stroke="#222" strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="20" cy="34" r="2.5" fill="#222"/>
          <circle cx="32" cy="14" r="2.5" fill="#222"/>
        </g>
      </svg>
    ),
  },
  {
    label: 'Festivals',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="24" cy="32" rx="10" ry="6" fill="#8B5CF6" />
        <path d="M24 32c0-4 4-7 4-11a4 4 0 10-8 0c0 4 4 7 4 11z" fill="#F59E42" />
        <ellipse cx="24" cy="32" rx="4" ry="2" fill="#FDE68A" />
      </svg>
    ),
  },
  {
    label: 'Technology',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="14" stroke="#222" strokeWidth="2.5" fill="#06b6d4" />
        <circle cx="24" cy="24" r="5" fill="#fff" stroke="#222" strokeWidth="2" />
        <path d="M24 10v4M24 34v4M10 24h4M34 24h4M16.93 16.93l2.83 2.83M28.24 28.24l2.83 2.83M16.93 31.07l2.83-2.83M28.24 19.76l2.83-2.83" stroke="#222" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'All Categories',
    icon: <span className="text-3xl font-bold">10 +</span>,
  },
];

const EventCategories = () => {
  return (
    <section className="w-full py-12 bg-white flex flex-col items-center">
      {/* Heading without green underline/curve */}
      <div className="relative mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-black text-left">
          Explore Events of Your Choice<span className="">........</span>
        </h2>
      </div>
      <div className="text-xs text-gray-500 mb-6">Little zoom on hover</div>
      {/* Categories Row */}
      <div className="flex flex-wrap justify-center gap-8 md:gap-12">
        {categories.map((cat, idx) => (
          <div
            key={cat.label}
            className="flex flex-col items-center"
          >
            <div
              className="w-32 h-32 md:w-36 md:h-36 bg-cyan-400 rounded-full flex items-center justify-center mb-3 transition-transform duration-200 hover:scale-110 shadow-lg cursor-pointer"
              tabIndex={0}
              aria-label={cat.label}
            >
              {cat.icon}
            </div>
            <span className="text-base md:text-lg font-semibold text-black text-center">
              {cat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default EventCategories; 