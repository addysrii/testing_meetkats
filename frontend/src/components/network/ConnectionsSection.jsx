import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ConnectionsSection = ({ connections, loading, onCreateChat }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const navigate = useNavigate();

  // Handle message/chat creation
  const handleMessageClick = async (connection) => {
    try {
      // Try to create a new chat or get existing chat
      const chatResponse = await api.createChat(connection._id);
      
      // Verify chatResponse has an _id
      if (!chatResponse._id) {
        throw new Error('Invalid chat response');
      }
      
      // Navigate to the chat page with the new or existing chat
      navigate(`/chat/${chatResponse._id}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      
      // More descriptive error handling
      const errorMessage = error.response?.data?.error 
        || error.message 
        || 'Failed to start a conversation. Please try again.';
      
      // Optional: Use a toast or more user-friendly error display
      alert(errorMessage);
    }
  };
  // Filter connections based on search term
  const filteredConnections = connections.filter(connection => {
    const fullName = `${connection.firstName} ${connection.lastName}`.toLowerCase();
    const headline = connection.headline ? connection.headline.toLowerCase() : '';
    const query = searchTerm.toLowerCase();
    
    return fullName.includes(query) || headline.includes(query);
  });

  // Sort connections
  const sortedConnections = [...filteredConnections].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.connectedAt || b.createdAt) - new Date(a.connectedAt || a.createdAt);
    } else if (sortBy === 'name') {
      return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
    }
    return 0;
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
      {/* Search and Sort Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <div className="relative w-full md:w-96 mb-4 md:mb-0">
          <input
            type="text"
            placeholder="Search connections..."
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
        
        <div className="flex items-center">
          <label className="text-sm text-gray-600 mr-2">Sort by:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-md p-2 text-sm"
          >
            <option value="recent">Recently Added</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {connections.length === 0 ? (
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h3 className="text-xl font-medium text-gray-700 mb-2">No connections yet</h3>
          <p className="text-gray-500 mb-4">Start building your network by connecting with other professionals</p>
          <Link 
            to="/network/discover" 
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
          >
            Discover People
          </Link>
        </div>
      ) : sortedConnections.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No connections match your search</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedConnections.map(connection => (
              <div key={connection._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <Link to={`/profile/${connection._id}`} className="flex-shrink-0">
                    {connection.profilePicture ? (
                      <img 
                        src={connection.profilePicture} 
                        alt={`${connection.firstName} ${connection.lastName}`}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-lg font-semibold text-gray-600">
                          {connection.firstName?.charAt(0)}
                          {connection.lastName?.charAt(0)}
                        </span>
                      </div>
                    )}
                  </Link>
                  
                  <div className="ml-4 flex-1">
                    <Link to={`/profile/${connection._id}`} className="text-blue-600 hover:underline font-medium">
                      {connection.firstName} {connection.lastName}
                    </Link>
                    
                    {connection.headline && (
                      <p className="text-sm text-gray-600 mt-0.5">{connection.headline}</p>
                    )}
                    
                    <div className="mt-2 flex space-x-2">
                      <button
                        onClick={() => handleMessageClick(connection)}
                        className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium py-1 px-2 rounded-full flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                        </svg>
                        Message
                      </button>
                     
                     <button
                       className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium py-1 px-2 rounded-full flex items-center"
                       onClick={() => alert(`Profile options would appear here in a production app for ${connection.firstName}`)}
                     >
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                         <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                       </svg>
                       More
                     </button>
                   </div>
                 </div>
               </div>
             </div>
           ))}
         </div>
         
         {connections.length > 9 && (
           <div className="mt-6 text-center">
             <button className="text-blue-600 hover:text-blue-800 font-medium">
               Load more connections
             </button>
           </div>
         )}
       </>
     )}
   </div>
 );
};

export default ConnectionsSection;