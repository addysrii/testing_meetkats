import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Check, X, RefreshCw, UserPlus } from 'lucide-react';
import api from '../services/api';

const ConnectionRequestPage = () => {
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingIds, setProcessingIds] = useState(new Set());

  // Function to fetch connection requests
  const fetchConnectionRequests = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching connection requests...');
      const response = await api.getConnectionRequests();
      console.log('Connection requests response:', response);
      
      // Set connection requests directly as the dashboard does
      setConnectionRequests(response || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching connection requests:', err);
      setLoading(false);
      setError('Failed to load connection requests');
      
      // For development only - remove in production
      const mockData = [
        {
          _id: 'req1',
          firstName: 'Jane',
          lastName: 'Smith',
          headline: 'Senior Developer at Tech Co',
          company: 'Tech Co',
          profilePicture: 'https://randomuser.me/api/portraits/women/44.jpg',
          mutualConnections: 3
        },
        {
          _id: 'req2',
          firstName: 'Michael',
          lastName: 'Johnson',
          headline: 'Product Manager',
          company: 'Innovation Inc',
          profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg',
          mutualConnections: 5,
          message: 'We worked together on the marketing project. Would love to connect!'
        },
        {
          _id: 'req3',
          firstName: 'Sarah',
          lastName: 'Williams',
          headline: 'UX Designer',
          company: 'Design Studio',
          profilePicture: 'https://randomuser.me/api/portraits/women/68.jpg',
          mutualConnections: 2,
          message: 'I saw your portfolio and was really impressed with your work.'
        }
      ];
      setConnectionRequests(mockData);
    }
  };

  useEffect(() => {
    fetchConnectionRequests();
  }, []);

  const handleAccept = async (userId) => {
    try {
      setProcessingIds(prev => new Set([...prev, userId]));
      console.log('Accepting connection request from:', userId);
      await api.acceptConnection(userId);
      setConnectionRequests(prev => prev.filter(req => req._id !== userId));
      setProcessingIds(prev => {
        const updated = new Set([...prev]);
        updated.delete(userId);
        return updated;
      });
    } catch (err) {
      console.error('Error accepting connection:', err);
      // For demo/dev purposes - remove in production
      setConnectionRequests(prev => prev.filter(req => req._id !== userId));
      setProcessingIds(prev => {
        const updated = new Set([...prev]);
        updated.delete(userId);
        return updated;
      });
    }
  };

  const handleDecline = async (userId) => {
    try {
      setProcessingIds(prev => new Set([...prev, userId]));
      console.log('Declining connection request from:', userId);
      await api.declineConnection(userId);
      setConnectionRequests(prev => prev.filter(req => req._id !== userId));
      setProcessingIds(prev => {
        const updated = new Set([...prev]);
        updated.delete(userId);
        return updated;
      });
    } catch (err) {
      console.error('Error declining connection:', err);
      // For demo/dev purposes - remove in production
      setConnectionRequests(prev => prev.filter(req => req._id !== userId));
      setProcessingIds(prev => {
        const updated = new Set([...prev]);
        updated.delete(userId);
        return updated;
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/network" className="text-blue-600 hover:underline flex items-center">
          <ChevronLeft size={16} className="mr-1" /> Back to Network
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold flex items-center">
              <UserPlus className="mr-2" size={20} />
              Connection Requests
            </h1>
            {!loading && (
              <p className="text-sm text-blue-100 mt-1">
                {connectionRequests.length} {connectionRequests.length === 1 ? 'request' : 'requests'} pending
              </p>
            )}
          </div>
          <button 
            onClick={fetchConnectionRequests} 
            disabled={loading}
            className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition"
            title="Refresh requests"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p>Loading connection requests...</p>
        </div>
      ) : error && connectionRequests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <button 
            onClick={fetchConnectionRequests} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center mx-auto"
          >
            <RefreshCw size={16} className="mr-2" />
            Try Again
          </button>
        </div>
      ) : connectionRequests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="mb-2">You don't have any pending connection requests at the moment.</p>
          <Link 
            to="/discover" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-block"
          >
            Find People to Connect
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {connectionRequests.map((request) => (
            <div key={request._id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4">
                <div className="flex items-start">
                  <img 
                    src={request.profilePicture || '/default-avatar.png'} 
                    alt={`${request.firstName} ${request.lastName}`}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="font-semibold">
                      <Link to={`/profile/${request._id}`} className="hover:text-blue-600">
                        {request.firstName} {request.lastName}
                      </Link>
                    </h3>
                    {request.headline && (
                      <p className="text-sm text-gray-600">{request.headline}</p>
                    )}
                    {request.company && (
                      <p className="text-sm text-gray-600">{request.company}</p>
                    )}
                    {request.mutualConnections > 0 && (
                      <p className="text-xs text-gray-500">
                        {request.mutualConnections} mutual connection{request.mutualConnections !== 1 ? 's' : ''}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Sent {formatDate(request.createdAt)}
                    </p>
                  </div>
                </div>

                {request.message && (
                  <div className="mt-3 p-3 bg-gray-50 rounded text-sm border border-gray-100">
                    <p>{request.message}</p>
                  </div>
                )}

                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => handleAccept(request._id)}
                    disabled={processingIds.has(request._id)}
                    className="flex-1 flex justify-center items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check size={16} className="mr-1" />
                    Accept
                  </button>
                  <button
                    onClick={() => handleDecline(request._id)}
                    disabled={processingIds.has(request._id)}
                    className="flex-1 flex justify-center items-center px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X size={16} className="mr-1" />
                    Decline
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConnectionRequestPage;
