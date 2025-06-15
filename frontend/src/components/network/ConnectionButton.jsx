import React, { useState } from 'react';
import api from '../../services/api';
import { FaUserPlus, FaUserCheck, FaUserClock, FaUserMinus, FaCheck, FaTimes, FaEllipsisH } from 'react-icons/fa';

const ConnectionButton = ({ userId, initialStatus, onStatusChange }) => {
  const [status, setStatus] = useState(initialStatus || {});
  const [loading, setLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  
  const handleConnect = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      await api.sendConnectionRequest(userId);
      
      // Update local state
      setStatus({ ...status, isPending: true });
      if (onStatusChange) {
        onStatusChange({ ...status, isPending: true });
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAccept = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      await api.acceptConnection(userId);
      
      // Update local state
      setStatus({ ...status, isPending: false, isConnected: true });
      if (onStatusChange) {
        onStatusChange({ ...status, isPending: false, isConnected: true });
      }
    } catch (error) {
      console.error('Error accepting connection:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDecline = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      await api.declineConnection(userId);
      
      // Update local state
      setStatus({ ...status, isPending: false });
      if (onStatusChange) {
        onStatusChange({ ...status, isPending: false });
      }
    } catch (error) {
      console.error('Error declining connection:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemove = async () => {
    if (loading) return;
    
    if (!window.confirm("Are you sure you want to remove this connection?")) return;
    
    setLoading(true);
    try {
      // Assuming there's an API method to remove connections
      await api.removeConnection(userId);
      
      // Update local state
      setStatus({ ...status, isConnected: false });
      if (onStatusChange) {
        onStatusChange({ ...status, isConnected: false });
      }
    } catch (error) {
      console.error('Error removing connection:', error);
    } finally {
      setLoading(false);
      setShowOptions(false);
    }
  };
  
  const handleFollow = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await api.followUser(userId);
      
      // Update local state based on the response
      setStatus({ 
        ...status, 
        isFollowing: response.following,
      });
      
      if (onStatusChange) {
        onStatusChange({ 
          ...status, 
          isFollowing: response.following,
        });
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Render based on the current status with the user
  if (status.isConnected) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center"
          disabled={loading}
        >
          <FaUserCheck className="mr-2" />
          Connected
          <FaEllipsisH className="ml-2" />
        </button>
        
        {showOptions && (
          <div className="absolute mt-1 w-48 right-0 bg-white rounded-md shadow-lg z-10 border">
            <div className="py-1">
              <button
                onClick={handleRemove}
                className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100"
              >
                Remove Connection
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  if (status.isPending) {
    return (
      <button
        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg flex items-center cursor-default"
        disabled={true}
      >
        <FaUserClock className="mr-2" />
        Pending
      </button>
    );
  }
  
  if (status.pendingYourApproval) {
    return (
      <div className="flex space-x-2">
        <button
          onClick={handleAccept}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing
            </span>
          ) : (
            <>
              <FaCheck className="mr-2" />
              Accept
            </>
          )}
        </button>
        
        <button
          onClick={handleDecline}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center"
          disabled={loading}
        >
          <FaTimes className="mr-2" />
          Decline
        </button>
      </div>
    );
  }
  
  // Default: not connected
  return (
    <div className="flex space-x-2">
      <button
        onClick={handleConnect}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Connecting
          </span>
        ) : (
          <>
            <FaUserPlus className="mr-2" />
            Connect
          </>
        )}
      </button>
      
      {status.isFollowing ? (
        <button
          onClick={handleFollow}
          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center"
          disabled={loading}
        >
          Following
        </button>
      ) : (
        <button
          onClick={handleFollow}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center"
          disabled={loading}
        >
          Follow
        </button>
      )}
    </div>
  );
};

export default ConnectionButton;