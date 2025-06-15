import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ProfessionalSuggestionsSection = ({ suggestions, loading, onConnect, onFollow }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Get unique industries from suggestions
  const industries = [...new Set(suggestions.map(s => s.industry).filter(Boolean))];
  
  // Filter suggestions based on search and industry filter
  const filteredSuggestions = suggestions.filter(suggestion => {
    const matchesSearch = !searchTerm || 
      `${suggestion.firstName} ${suggestion.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (suggestion.headline && suggestion.headline.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesIndustry = !selectedIndustry || suggestion.industry === selectedIndustry;
    
    return matchesSearch && matchesIndustry;
  });

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                  <div className="ml-4 flex-1">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      {/* Filters and Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <div className="relative w-full md:w-80 mb-4 md:mb-0">
          <input
            type="text"
            placeholder="Search people..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {industries.length > 0 && (
            <select 
              value={selectedIndustry} 
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="border border-gray-300 rounded-md p-2 text-sm"
            >
              <option value="">All Industries</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          )}
          
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-500'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-500'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {filteredSuggestions.length === 0 ? (
        <div className="text-center py-8 border border-gray-200 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p className="text-gray-500">No professionals found</p>
          {searchTerm || selectedIndustry ? (
            <p className="text-gray-500 text-sm mt-1">Try changing your search criteria</p>
          ) : null}
        </div>
      ) : viewMode === 'grid' ? (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuggestions.map(suggestion => (
            <div key={suggestion._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center mb-4">
                <Link to={`/profile/${suggestion._id}`} className="mb-3">
                  {suggestion.profilePicture ? (
                    <img 
                      src={suggestion.profilePicture} 
                      alt={`${suggestion.firstName} ${suggestion.lastName}`}
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-xl font-semibold text-gray-600">
                        {suggestion.firstName?.charAt(0)}
                        {suggestion.lastName?.charAt(0)}
                      </span>
                    </div>
                  )}
                </Link>
                
                <Link to={`/profile/${suggestion._id}`} className="text-blue-600 hover:underline font-medium">
                  {suggestion.firstName} {suggestion.lastName}
                </Link>
                
                {suggestion.headline && (
                  <p className="text-sm text-gray-600 mt-1">{suggestion.headline}</p>
                )}
                
                {suggestion.industry && (
                  <span className="mt-2 inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                    {suggestion.industry}
                  </span>
                )}
              </div>
              
              <div className="flex justify-center space-x-3 mt-2">
                {suggestion.connectionStatus === 'connected' ? (
                  <span className="text-sm text-green-600 font-medium py-1.5">
                    ✓ Connected
                  </span>
                ) : suggestion.connectionStatus === 'pending' ? (
                  <span className="text-sm text-gray-500 py-1.5">
                    Request sent
                  </span>
                ) : (
                  <button
                    onClick={() => onConnect(suggestion._id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-1.5 px-3 rounded-full text-sm"
                  >
                    Connect
                  </button>
                )}
                
                <button
                  onClick={() => onFollow(suggestion._id)}
                  className={`text-sm py-1.5 px-3 rounded-full ${
                    suggestion.isFollowing 
                      ? 'bg-gray-200 text-gray-700' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {suggestion.isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
              
              {suggestion.mutualConnections > 0 && (
                <p className="text-xs text-gray-600 text-center mt-3">
                  {suggestion.mutualConnections} mutual connection{suggestion.mutualConnections !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        // List View
        <div className="space-y-4">
          {filteredSuggestions.map(suggestion => (
            <div key={suggestion._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <div className="flex items-start mb-4 sm:mb-0">
                  <Link to={`/profile/${suggestion._id}`} className="flex-shrink-0">
                    {suggestion.profilePicture ? (
                      <img 
                        src={suggestion.profilePicture} 
                        alt={`${suggestion.firstName} ${suggestion.lastName}`}
                        className="h-14 w-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-lg font-semibold text-gray-600">
                          {suggestion.firstName?.charAt(0)}
                          {suggestion.lastName?.charAt(0)}
                        </span>
                      </div>
                    )}
                  </Link>
                  
                  <div className="ml-4 flex-1">
                    <Link to={`/profile/${suggestion._id}`} className="text-blue-600 hover:underline font-medium">
                      {suggestion.firstName} {suggestion.lastName}
                    </Link>
                    
                    {suggestion.headline && (
                      <p className="text-sm text-gray-600 mt-0.5">{suggestion.headline}</p>
                    )}
                    
                    {suggestion.industry && (
                      <span className="mt-2 inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                        {suggestion.industry}
                      </span>
                    )}
                    
                    {suggestion.mutualConnections > 0 && (
                      <p className="text-xs text-gray-600 mt-1">
                        {suggestion.mutualConnections} mutual connection{suggestion.mutualConnections !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-3 sm:ml-auto">
                  {suggestion.connectionStatus === 'connected' ? (
                    <span className="text-sm text-green-600 font-medium py-1.5">
                      ✓ Connected
                    </span>
                  ) : suggestion.connectionStatus === 'pending' ? (
                    <span className="text-sm text-gray-500 py-1.5">
                      Request sent
                    </span>
                  ) : (
                    <button
                      onClick={() => onConnect(suggestion._id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-1.5 px-3 rounded-full text-sm"
                    >
                      Connect
                    </button>
                  )}
                  
                  <button
                    onClick={() => onFollow(suggestion._id)}
                    className={`text-sm py-1.5 px-3 rounded-full ${
                      suggestion.isFollowing 
                        ? 'bg-gray-200 text-gray-700' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {suggestion.isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {filteredSuggestions.length > 20 && (
        <div className="mt-6 text-center">
          <button className="text-blue-600 hover:text-blue-800 font-medium">
            Load more suggestions
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfessionalSuggestionsSection;