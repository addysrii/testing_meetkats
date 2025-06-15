import React from 'react';
import { UserPlus, User, UserCheck, Eye, Heart, MapPin } from 'lucide-react';

const UserCard = ({ user, onConnect, onFollow, onViewProfile, theme = 'orange' }) => {
  // Check if we should show 'Connect' or 'Pending'
  const isPending = user.isPending || user.connectionStatus === 'pending';
  
  // Enhanced logging for debugging connection status
  console.log(`UserCard for ${user.firstName} ${user.lastName} (${user._id}):`, {
    isPending,
    connectionStatus: user.connectionStatus,
    explicitIsPending: user.isPending
  });
  
  // Helper function to safely format location data
  const formatLocation = (location) => {
    // Empty or null location
    if (!location) return null;
    
    // Handle GeoJSON location objects
    if (typeof location === 'object') {
      // If it's a GeoJSON Point
      if (location.type === 'Point' && location.coordinates) {
        return <span><MapPin className="h-3 w-3 inline mr-1" /> Location available</span>;
      }
      
      // If it has a name property
      if (location.name) {
        return <span><MapPin className="h-3 w-3 inline mr-1" /> {location.name}</span>;
      }
      
      // If it has an address property
      if (location.address) {
        return <span><MapPin className="h-3 w-3 inline mr-1" /> {location.address}</span>;
      }
      
      // Other types of location objects
      return <span><MapPin className="h-3 w-3 inline mr-1" /> Location available</span>;
    }
    
    // Handle string locations
    if (typeof location === 'string' && location.trim() !== '') {
      return <span><MapPin className="h-3 w-3 inline mr-1" /> {location}</span>;
    }
    
    // Default (no location info)
    return null;
  };
  
  // Get profile photo, handling different property names
  const profilePhoto = user.profilePhoto || user.profileImage || '/default-avatar.png';
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* User info section */}
      <div className="p-4">
        <div className="flex items-center mb-3">
          <img 
            src={profilePhoto}
            alt={`${user.firstName} ${user.lastName}`}
            className="h-12 w-12 rounded-full object-cover mr-3"
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = '/default-avatar.png';
            }}
          />
          <div>
            <h3 className="font-semibold text-gray-800">{user.firstName} {user.lastName}</h3>
            <p className="text-sm text-gray-600">{user.headline || user.profession || 'Professional'}</p>
          </div>
        </div>
        
        {/* User details */}
        <p className="text-sm text-gray-700 mb-2">{user.industry || 'Industry not specified'}</p>
        
        {/* Safe location rendering */}
        {user.location && (
          <p className="text-sm text-gray-600 mb-3">
            {formatLocation(user.location)}
          </p>
        )}
        
        {/* Skills or interests */}
        {user.skills && user.skills.length > 0 && (
          <div className="flex flex-wrap mb-3">
            {user.skills.slice(0, 3).map((skill, index) => (
              <span 
                key={index}
                className={`text-xs mr-2 mb-1 px-2 py-1 rounded-full bg-${theme}-100 text-${theme}-700`}
              >
                {skill}
              </span>
            ))}
            {user.skills.length > 3 && (
              <span className={`text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700`}>
                +{user.skills.length - 3} more
              </span>
            )}
          </div>
        )}
        
        {/* Mutual connections if any */}
        {user.mutualConnections > 0 && (
          <p className="text-xs text-gray-600 mb-2">
            {user.mutualConnections} mutual connection{user.mutualConnections !== 1 ? 's' : ''}
          </p>
        )}
      </div>
      
      {/* Actions */}
      <div className="bg-gray-50 p-3 border-t border-gray-200 flex flex-wrap gap-2">
        <button
          onClick={onViewProfile}
          className={`flex-1 px-3 py-1.5 text-sm border border-${theme}-500 text-${theme}-600 rounded-md hover:bg-${theme}-50 transition`}
        >
          <Eye className="h-4 w-4 inline mr-1" />
          View Profile
        </button>
        
        {/* If user is pending, show Pending instead of Connect */}
        <button
          onClick={isPending ? undefined : onConnect}
          disabled={isPending}
          className={`flex-1 px-3 py-1.5 text-sm ${
            isPending 
              ? 'bg-gray-300 text-gray-600 cursor-default' 
              : `bg-${theme}-500 text-white hover:bg-${theme}-600`
          } rounded-md transition`}
          data-testid={isPending ? "pending-button" : "connect-button"}
        >
          {isPending ? (
            <>
              <UserCheck className="h-4 w-4 inline mr-1" />
              Pending
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 inline mr-1" />
              Connect
            </>
          )}
        </button>
        
        <button
          onClick={onFollow}
          className={`px-3 py-1.5 text-sm ${
            user.isFollowing 
              ? `bg-${theme}-100 text-${theme}-700 border border-${theme}-300` 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          } rounded-md transition`}
        >
          <Heart className="h-4 w-4 inline mr-1" fill={user.isFollowing ? "currentColor" : "none"} />
          {user.isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>
    </div>
  );
};

export default UserCard;