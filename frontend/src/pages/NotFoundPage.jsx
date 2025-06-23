import React, { useState, useEffect } from 'react';
import { Home, ArrowLeft, RefreshCw, MapPin, Compass, Linkedin, Instagram, Twitter } from 'lucide-react';

const NotFoundPage = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleGoHome = () => {
    console.log('Navigate to home page');
    window.location.href = '/';
  };

  const handleGoBack = () => {
    console.log('Go back to previous page');
    window.history.back();
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleSocialMedia = (platform) => {
    const socialLinks = {
      linkedin: 'https://www.linkedin.com/company/meetkats/',
      instagram: 'https://www.instagram.com/meetkats?igsh=MmlvdXh0Zmp0cGJ6',
      twitter: 'https://x.com/MeetKatsOrg'
    };
    
    console.log(`Opening ${platform}: ${socialLinks[platform]}`);
    window.open(socialLinks[platform], '_blank');
  };

  // Floating elements animation
  const floatingElements = Array.from({ length: 6 }, (_, i) => (
    <div
      key={i}
      className={`absolute w-2 h-2 bg-green-200 rounded-full opacity-60 animate-bounce`}
      style={{
        left: `${20 + i * 15}%`,
        top: `${30 + (i % 3) * 20}%`,
        animationDelay: `${i * 0.5}s`,
        animationDuration: `${3 + i * 0.5}s`,
      }}
    />
  ));

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingElements}
        
        {/* Animated circles */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-green-100 rounded-full opacity-30 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-green-200 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-green-150 rounded-full opacity-25 animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Mouse follower */}
        <div
          className="absolute w-4 h-4 bg-green-300 rounded-full opacity-30 pointer-events-none transition-all duration-300 ease-out"
          style={{
            left: mousePosition.x - 8,
            top: mousePosition.y - 8,
            transform: 'scale(0.8)',
          }}
        />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className={`w-full max-w-2xl text-center transform transition-all duration-1000 ${
          isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          
          {/* Animated 404 */}
          <div className="mb-8 relative">
            <h1 className="text-9xl md:text-[12rem] font-bold text-transparent bg-gradient-to-r from-green-400 via-green-500 to-green-600 bg-clip-text animate-pulse select-none">
              404
            </h1>
            
            {/* Decorative elements around 404 */}
            <div className="absolute -top-4 -left-4 w-8 h-8 border-4 border-green-300 rounded-full animate-spin" />
            <div className="absolute -bottom-4 -right-4 w-6 h-6 border-4 border-green-400 rounded-full animate-spin" style={{ animationDirection: 'reverse' }} />
            
            {/* Floating compass */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Compass className="w-12 h-12 text-green-500 opacity-70 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-green-100 p-8 md:p-12 mb-8 transform hover:scale-[1.02] transition-all duration-300">
            
            {/* Lost Icon */}
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce">
              <MapPin className="w-10 h-10 text-white" />
            </div>

            {/* Title and Description */}
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Oops! Page Not Found
            </h2>
            <p className="text-lg text-gray-600 mb-2">
              Looks like you've wandered off the beaten path.
            </p>
            <p className="text-gray-500 mb-8">
              The page you're looking for doesn't exist or has been moved.
            </p>

            {/* Social Media Links */}
            <div className="mb-8">
              <p className="text-gray-600 mb-4 text-sm">Follow us on social media:</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => handleSocialMedia('linkedin')}
                  className="cursor-pointer group flex items-center justify-center w-12 h-12 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl transition-all duration-300 transform hover:scale-110 hover:rotate-6 shadow-md hover:shadow-lg"
                >
                  <Linkedin className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                </button>
                
                <button
                  onClick={() => handleSocialMedia('instagram')}
                  className="cursor-pointer group flex items-center justify-center w-12 h-12 bg-pink-100 hover:bg-pink-200 text-pink-600 rounded-xl transition-all duration-300 transform hover:scale-110 hover:rotate-6 shadow-md hover:shadow-lg"
                >
                  <Instagram className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                </button>
                
                <button
                  onClick={() => handleSocialMedia('twitter')}
                  className="cursor-pointer group flex items-center justify-center w-12 h-12 bg-sky-100 hover:bg-sky-200 text-sky-600 rounded-xl transition-all duration-300 transform hover:scale-110 hover:rotate-6 shadow-md hover:shadow-lg"
                >
                  <Twitter className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleGoHome}
                className="cursor-pointer group flex items-center gap-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold px-8 py-3 rounded-xl hover:from-green-600 hover:to-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
              >
                <Home className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
                Go Home
              </button>
              
              <button
                onClick={handleGoBack}
                className="cursor-pointer group flex items-center gap-3 bg-white/80 text-gray-700 font-semibold px-8 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                Go Back
              </button>
              
              <button
                onClick={handleRefresh}
                className="cursor-pointer group flex items-center gap-3 bg-green-100 text-green-700 font-semibold px-6 py-3 rounded-xl hover:bg-green-200 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                Refresh
              </button>
            </div>
          </div>

          {/* Helpful Links */}
          <div className="bg-green-50/80 backdrop-blur-sm rounded-2xl border border-green-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Maybe you're looking for:</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {[{name:'Home',url:"/landingpage"}, {name:'Network',url:"/network"}, {name:'Dashboard',url:"/dashboard"}, {name:'Events',url:"/events"}].map((link) => (
                <button
                  key={link.name}
                  onClick={() => window.location.href = link.url}
                  className="px-4 py-2 bg-white text-green-700 rounded-lg border border-green-200 hover:bg-green-100 hover:border-green-300 transition-all duration-200 transform hover:scale-105 text-sm font-medium"
                  style={{ animationDelay: `${0.1}s` }}
                >
                  {link.name}
                </button>
              ))}
            </div>
          </div>

          {/* Fun Message */}
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              🌱 Don't worry, even the best explorers sometimes take wrong turns!
            </p>
          </div>
          
          {/* Animated Wave */}
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-8 bg-green-400 rounded-full animate-pulse opacity-70"
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '1.5s',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;