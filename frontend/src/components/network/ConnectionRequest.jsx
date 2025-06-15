import React from 'react';
import { Link } from 'react-router-dom';

const ConnectionRequestsSection = ({ requests, loading, onAccept, onDecline }) => {
  // Format time since request was sent
  const formatTimeSince = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);
    
    if (diffSeconds < 60) return 'just now';
    
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start">
                  <div className="h-14 w-14 bg-gray-200 rounded-full"></div>
                  <div className="ml-4 flex-1">
                    <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="flex space-x-3">
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                    </div>
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
      <h2 className="text-xl font-semibold mb-6">
        Connection Requests
        {requests.length > 0 && (
          <span className="ml-2 text-sm font-medium bg-blue-100 text-blue-600 py-0.5 px-2 rounded-full">
            {requests.length}
          </span>
        )}
      </h2>

      {requests.length === 0 ? (
        <div className="text-center py-8 border border-gray-200 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p className="text-gray-500">No pending connection requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(request => (
            <div key={request._id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex flex-col md:flex-row md:items-center">
                <div className="flex items-start mb-4 md:mb-0">
                  <Link to={`/profile/${request._id}`} className="flex-shrink-0">
                    {request.profilePicture ? (
                      <img 
                        src={request.profilePicture} 
                        alt={`${request.firstName} ${request.lastName}`}
                        className="h-14 w-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-lg font-semibold text-gray-600">
                          {request.firstName?.charAt(0)}
                          {request.lastName?.charAt(0)}
                        </span>
                      </div>
                    )}
                  </Link>
                  
                  <div className="ml-4 flex-1">
                    <Link to={`/profile/${request._id}`} className="text-blue-600 hover:underline font-medium">
                      {request.firstName} {request.lastName}
                    </Link>
                    
                    {request.headline && (
                      <p className="text-sm text-gray-600 mt-0.5">{request.headline}</p>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimeSince(request.requestedAt || request.createdAt)}
                    </p>
                    
                    {request.mutualConnections > 0 && (
                      <p className="text-xs text-gray-600 mt-1">
                        {request.mutualConnections} mutual connection{request.mutualConnections !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-3 md:ml-auto">
                  <button
                    onClick={() => onAccept(request._id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
                  >
                    Accept
                  </button>
                  
                  <button
                    onClick={() => onDecline(request._id)}
                    className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded border border-gray-300"
                  >
                    Decline
                  </button>
                </div>
              </div>
              
              {request.message && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
                  <p className="text-gray-700">{request.message}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConnectionRequestsSection;