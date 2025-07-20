import React, { useState } from 'react';
import Sidebar from "../components/common/Navbar";
import { useAuth } from "../context/AuthContext";
import { FooterBlock } from "./BhoomiLandingPage/sections/FooterBlock";
import {categories, eventsData} from './eventsdb.js'; // Import categories and events data
const Category = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState('categories');
  const [selectedCategory, setSelectedCategory] = useState('');
  

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentView('events');
  };

  const handleBackClick = () => {
    setCurrentView('categories');
    setSelectedCategory('');
  };

  const CategoryCard = ({ category, index }) => (
    <div
      className="bg-white bg-opacity-80 rounded-3xl p-10 text-center cursor-pointer transition-all duration-300 ease-out border-2 border-transparent backdrop-blur-sm relative overflow-hidden hover:-translate-y-3 hover:scale-105 hover:shadow-xl hover:shadow-green-300/20 hover:border-green-400 hover:bg-opacity-95 group animate-pulse"
      style={{
        animationDelay: `${index * 0.1}s`,
        animationDuration: '0.6s',
        animationFillMode: 'both',
        animationName: 'fadeInUp'
      }}
      onClick={() => handleCategoryClick(category.id)}
    >
      <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-green-300/10 to-transparent transition-all duration-500 group-hover:left-full"></div>
      <span className="text-6xl mb-5 block transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
        {category.icon}
      </span>
      <h3 className="text-2xl font-bold text-green-800 mb-4 transition-colors duration-300">
        {category.title}
      </h3>
      <p className="text-green-700 opacity-80 leading-relaxed transition-opacity duration-300 group-hover:opacity-100">
        {category.description}
      </p>
    </div>
  );

  const EventCard = ({ event, index }) => (
    <div
      className="bg-white bg-opacity-95 rounded-3xl overflow-hidden border-2 border-transparent transition-all duration-300 ease-out cursor-pointer shadow-lg shadow-black/8 hover:-translate-y-2 hover:shadow-xl hover:shadow-green-300/15 hover:border-green-400 animate-pulse"
      style={{
        animationDelay: `${index * 0.1}s`,
        animationDuration: '0.6s',
        animationFillMode: 'both',
        animationName: 'fadeInUp'
      }}
    >
      <div className="relative w-full h-48 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute top-3 left-3 bg-green-800 bg-opacity-90 text-white px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm">
          {event.category}
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-green-800 mb-4 leading-tight">
          {event.title}
        </h3>

        <div className="flex gap-5 mb-3 flex-wrap">
          <div className="text-green-400 font-semibold text-sm flex items-center gap-1.5">
            <span className="text-xs opacity-80">📅</span>
            {event.date}
          </div>
          <div className="text-green-600 font-medium text-sm flex items-center gap-1.5">
            <span className="text-xs opacity-80">⏰</span>
            {event.time}
          </div>
        </div>

        <div className="text-green-700 text-sm mb-4 flex items-center gap-1.5 font-medium">
          <span className="text-xs opacity-80">📍</span>
          {event.location}
        </div>

        <p className="text-green-600 leading-relaxed text-sm mb-5">
          {event.description}
        </p>

        <div className="flex justify-between items-center pt-4 border-t border-green-300/20">
          <div className="text-green-700 text-xs font-medium flex items-center gap-1.5">
            <span className="text-xs opacity-80">👥</span>
            {event.attendees}
          </div>

          <div className="flex gap-2.5">
            <button
              className="bg-gradient-to-br from-green-400 to-green-600 text-white border-none px-5 py-2 rounded-full font-semibold cursor-pointer transition-all duration-300 text-base hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-300/40"
              onClick={() => window.open(event.redirectUrl, '_blank')}
            >
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const CategoriesPage = () => (
    <div className="animate-pulse" style={{ animationName: 'fadeIn', animationDuration: '0.5s' }}>
      <div className="text-center mb-10">
        <h1 className="text-5xl text-green-800 mb-2.5 animate-pulse" style={{
          textShadow: '2px 2px 4px rgba(45, 90, 45, 0.1)',
          animationName: 'fadeInDown',
          animationDuration: '0.8s'
        }}>
          Event Categories
        </h1>
        <p className="text-xl text-green-700 opacity-80 animate-pulse" style={{
          animationDelay: '0.2s',
          animationName: 'fadeInDown',
          animationDuration: '0.8s'
        }}>
          Discover amazing events across different categories
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
        {categories.map((category, index) => (
          <CategoryCard key={category.id} category={category} index={index} />
        ))}
      </div>
    </div>
  );

  const EventsPage = () => {
    const events = eventsData[selectedCategory] || [];

    return (
      <div className="animate-pulse" style={{ animationName: 'fadeIn', animationDuration: '0.5s' }}>
        <div className="text-center mb-10">
          <h1 className="text-5xl text-green-800 mb-2.5 animate-pulse" style={{
            textShadow: '2px 2px 4px rgba(45, 90, 45, 0.1)',
            animationName: 'fadeInDown',
            animationDuration: '0.8s'
          }}>
            {selectedCategory} Events
          </h1>
          <p className="text-xl text-green-700 opacity-80 animate-pulse" style={{
            animationDelay: '0.2s',
            animationName: 'fadeInDown',
            animationDuration: '0.8s'
          }}>
            Discover amazing {selectedCategory.toLowerCase()} events
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mt-8">
          {events.length === 0 ? (
            <div className="text-center text-green-700 italic mt-12 text-lg col-span-full">
              No events found in this category yet. Check back soon!
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
      <div className="min-h-screen bg-gradient-to-br mt-10 from-green-50 to-green-100 text-green-900">
        <style jsx>{`
                    @keyframes fadeInDown {
                        from {
                            opacity: 0;
                            transform: translateY(-30px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    @keyframes fadeInUp {
                        from {
                            opacity: 0;
                            transform: translateY(30px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                        }
                        to {
                            opacity: 1;
                        }
                    }
                `}</style>

        <div className="max-w-7xl mx-auto p-5">
          {/* Back Button */}
          {currentView === 'events' && (
            <button
              onClick={handleBackClick}
              className="cursor-pointer fixed top-24 left-5 z-50 bg-green-100 bg-opacity-50 border-2 border-green-300 text-green-800 px-5 py-2 rounded-full font-semibold transition-all duration-300 hover:bg-green-300 hover:text-white hover:-translate-y-1 hover:shadow-lg backdrop-blur-sm"
            >
              ← Back to Categories
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