import React, { useState } from 'react';
import Sidebar from "../components/common/Navbar";
import { useAuth } from "../context/AuthContext";
import { FooterBlock } from "./BhoomiLandingPage/sections/FooterBlock";
import { categories, eventsData } from './eventsdb.js'; // Import categories and events data
const Category = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState('categories');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleCategoryClick = (categoryId) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedCategory(categoryId);
      setCurrentView('events');
      setIsTransitioning(false);
    }, 300);
  };

  const handleBackClick = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentView('categories');
      setSelectedCategory('');
      setIsTransitioning(false);
    }, 300);
  };


  const CategoryCard = ({ category, index }) => (
    <div
      className="group relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center cursor-pointer transition-all duration-500 ease-out border border-green-100/50 shadow-sm hover:shadow-xl hover:shadow-green-200/25 hover:-translate-y-2 hover:scale-105 hover:border-green-300/60 hover:bg-white/95 animate-fade-in-up"
      style={{
        animationDelay: `${index * 150}ms`,
        animationFillMode: 'both'
      }}
      onClick={() => handleCategoryClick(category.id)}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full rounded-2xl pointer-events-none"></div>

      {/* Icon */}
      <div className="mb-6 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
        <span className="text-5xl block filter drop-shadow-sm">
          {category.icon}
        </span>
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-green-800 mb-4 transition-colors duration-300 group-hover:text-green-900">
        {category.title}
      </h3>
      <p className="text-green-600/80 text-sm leading-relaxed transition-all duration-300 group-hover:text-green-700">
        {category.description}
      </p>

      {/* Hover indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-green-400 to-green-500 rounded-full opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:w-12"></div>
    </div>
  );

  const EventCard = ({ event, index }) => (
    <div
      className="group bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden border border-green-100/50 shadow-sm hover:shadow-xl hover:shadow-green-200/25 transition-all duration-500 ease-out cursor-pointer hover:-translate-y-1 hover:border-green-300/60 animate-fade-in-up"
      style={{
        animationDelay: `${index * 100}ms`,
        animationFillMode: 'both'
      }}
    >
      {/* Image container */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute top-3 left-3 bg-green-600/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg">
          {event.category}
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-bold text-green-800 mb-4 leading-tight group-hover:text-green-900 transition-colors duration-300">
          {event.title}
        </h3>

        {/* Event details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <span className="text-green-400">📅</span>
            <span className="font-medium">{event.date}</span>
            <span className="text-green-400 mx-2">•</span>
            <span className="text-green-400">⏰</span>
            <span className="font-medium">{event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <span className="text-green-400">📍</span>
            <span className="font-medium">{event.location}</span>
          </div>
        </div>

        <p className="text-green-600/80 text-sm leading-relaxed mb-5">
          {event.description}
        </p>

        <div className="flex justify-between items-center pt-4 border-t border-green-100">
          <div className="flex items-center gap-2 text-green-600 text-xs">
            <span className="text-green-400">👥</span>
            <span className="font-medium">{event.attendees}</span>
          </div>

          <button
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2.5 rounded-full font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-300/30 focus:outline-none focus:ring-2 focus:ring-green-400/50"
            onClick={() => window.open(`/events${event.redirectUrl}`, '_blank')}
          >
            View Event
          </button>
        </div>
      </div>
    </div>

  );

  const CategoriesPage = () => (
    <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
      <div className="text-center mb-12 animate-fade-in">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent mb-4 pb-4 animate-slide-in-down">
          Event Categories
        </h1>
        <p className="text-xl text-green-600/80 max-w-2xl mx-auto animate-slide-in-down" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
          Discover amazing events across different categories and connect with like-minded people
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, index) => (
          <CategoryCard key={category.id} category={category} index={index} />
        ))}
      </div>
    </div>
  );

  const EventsPage = () => {
    const events = eventsData[selectedCategory] || [];
    const categoryTitle = categories.find(cat => cat.id === selectedCategory)?.title || selectedCategory;

    return (
      <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent mb-4 pb-4 animate-slide-in-down">
            {categoryTitle} Events
          </h1>
          <p className="text-xl text-green-600/80 max-w-2xl mx-auto animate-slide-in-down" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
            Explore exciting {categoryTitle.toLowerCase()} events happening near you
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {events.length === 0 ? (
            <div className="col-span-full text-center py-16 animate-fade-in">
              <div className="text-6xl mb-4 opacity-50">🔍</div>
              <p className="text-green-600/60 text-lg mb-2">No events found in this category yet</p>
              <p className="text-green-500/60 text-sm">Check back soon for exciting updates!</p>
            </div>
          ) : (
            events.map((event, index) => (
              <EventCard key={index} event={event} index={index} />
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Sidebar user={user || {}} onLogout={logout} />
      <div className="mt-20 min-h-screen bg-gradient-to-br from-green-50/80 via-white to-green-50/60">
        {/* Custom CSS */}
        <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-in-down {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-slide-in-down {
          animation: slide-in-down 0.8s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>

        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Back Button */}
          {currentView === 'events' && (
            <button
              onClick={handleBackClick}
              className="fixed top-24 left-6 z-50 bg-white/90 backdrop-blur-sm border border-green-200 text-green-700 px-6 py-3 rounded-full font-medium transition-all duration-300 hover:bg-green-50 hover:text-green-800 hover:border-green-300 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400/50 animate-slide-in-down"
            >
              <span className="mr-2">←</span>
              Back to Categories
            </button>
          )}

          {/* Main Content */}
          {currentView === 'categories' ? <CategoriesPage /> : <EventsPage />}
        </div>
      </div>

      <FooterBlock />
    </>
  );
};

export default Category;