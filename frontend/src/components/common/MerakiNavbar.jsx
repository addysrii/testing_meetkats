import React, { useState } from 'react';
import { Search, ChevronDown, Menu } from 'lucide-react';

const MerakiNavbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    // Add search functionality here
  };

  const handleLocationSelect = (location) => {
    console.log('Selected location:', location);
    setIsLocationOpen(false);
  };

  const handleSignIn = () => {
    console.log('Sign in clicked');
    // Add sign in functionality here
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center space-x-2">
                {/* Logo with four stylized human figures */}
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                </div>
                <span className="text-xl font-bold text-gray-900">Meraki</span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for Plays, Sports, Activities, Hackathons and Comedy shows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>
          </div>

          {/* Right side navigation */}
          <div className="flex items-center space-x-4">
            {/* Location Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLocationOpen(!isLocationOpen)}
                className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 focus:outline-none"
              >
                <span>Select Location</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {isLocationOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <button
                      onClick={() => handleLocationSelect('Mumbai')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Mumbai
                    </button>
                    <button
                      onClick={() => handleLocationSelect('Delhi')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Delhi
                    </button>
                    <button
                      onClick={() => handleLocationSelect('Bangalore')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Bangalore
                    </button>
                    <button
                      onClick={() => handleLocationSelect('Chennai')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Chennai
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sign In Button */}
            <button
              onClick={handleSignIn}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Sign in
            </button>

            {/* Hamburger Menu */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              <a href="#" className="block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                Home
              </a>
              <a href="#" className="block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                Events
              </a>
              <a href="#" className="block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                About
              </a>
              <a href="#" className="block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                Contact
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default MerakiNavbar; 