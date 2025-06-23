import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Check, 
  X, 
  RefreshCw, 
  UserPlus, 
  Users, 
  MessageCircle,
  Calendar,
  Building2,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import networkService from '../services/networkService';

const ConnectionRequestPage = () => {
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingIds, setProcessingIds] = useState(new Set());
  const [successMessage, setSuccessMessage] = useState('');

  // Function to fetch connection requests
  const fetchConnectionRequests = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching incoming connection requests...');
      const response = await networkService.getConnectionRequests('pending', 'incoming');
      console.log('Connection requests response:', response);
      
      // Extract requests from response
      const requests = response?.requests || [];
      setConnectionRequests(requests);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching connection requests:', err);
      setLoading(false);
      setError('Failed to load connection requests');
      setConnectionRequests([]);
    }
  };

  useEffect(() => {
    fetchConnectionRequests();
  }, []);

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleAccept = async (requestId) => {
    try {
      setProcessingIds(prev => new Set([...prev, requestId]));
      console.log('Accepting connection request:', requestId);
      
      await networkService.acceptConnection(requestId);
      
      // Remove from list after successful acceptance
      setConnectionRequests(prev => prev.filter(req => req._id !== requestId));
      showSuccessMessage('Connection request accepted successfully!');
      
      setProcessingIds(prev => {
        const updated = new Set([...prev]);
        updated.delete(requestId);
        return updated;
      });
    } catch (err) {
      console.error('Error accepting connection:', err);
      setError('Failed to accept connection request');
      setProcessingIds(prev => {
        const updated = new Set([...prev]);
        updated.delete(requestId);
        return updated;
      });
    }
  };

  const handleDecline = async (requestId) => {
    try {
      setProcessingIds(prev => new Set([...prev, requestId]));
      console.log('Declining connection request:', requestId);
      
      await networkService.declineConnection(requestId);
      
      // Remove from list after successful decline
      setConnectionRequests(prev => prev.filter(req => req._id !== requestId));
      showSuccessMessage('Connection request declined.');
      
      setProcessingIds(prev => {
        const updated = new Set([...prev]);
        updated.delete(requestId);
        return updated;
      });
    } catch (err) {
      console.error('Error declining connection:', err);
      setError('Failed to decline connection request');
      setProcessingIds(prev => {
        const updated = new Set([...prev]);
        updated.delete(requestId);
        return updated;
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getSenderInfo = (request) => {
    // Handle different response structures
    const sender = request.sender || request.requester || request;
    return {
      id: sender._id || sender.id,
      firstName: sender.firstName || sender.first_name || 'Unknown',
      lastName: sender.lastName || sender.last_name || 'User',
      headline: sender.headline || sender.title || '',
      company: sender.company || sender.organization || '',
      profilePicture: sender.profilePicture || sender.avatar || sender.profile_picture || '/default-avatar.png',
      mutualConnections: sender.mutualConnections || 0
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/network" 
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 transition-colors duration-200 font-medium mb-4"
          >
            <ChevronLeft size={20} className="mr-1" />
            Back to Network
          </Link>
          
          <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-white bg-opacity-20 p-3 rounded-xl mr-4">
                    <UserPlus className="text-white" size={24} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      Connection Requests
                    </h1>
                    {!loading && (
                      <p className="text-emerald-100 mt-1">
                        {connectionRequests.length} {connectionRequests.length === 1 ? 'request' : 'requests'} pending
                      </p>
                    )}
                  </div>
                </div>
                <button 
                  onClick={fetchConnectionRequests} 
                  disabled={loading}
                  className="p-3 bg-white bg-opacity-20 rounded-xl hover:bg-opacity-30 transition-all duration-200 disabled:opacity-50"
                  title="Refresh requests"
                >
                  <RefreshCw size={20} className={loading ? "animate-spin text-white" : "text-white"} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center">
            <CheckCircle2 className="text-green-600 mr-3" size={20} />
            <span className="text-green-800">{successMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center">
            <AlertCircle className="text-red-600 mr-3" size={20} />
            <span className="text-red-800">{error}</span>
            <button 
              onClick={() => setError('')}
              className="ml-auto text-red-600 hover:text-red-700"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-12 text-center">
            <Loader2 className="animate-spin text-emerald-600 mx-auto mb-4" size={32} />
            <p className="text-gray-600">Loading connection requests...</p>
          </div>
        ) : connectionRequests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-12 text-center">
            <div className="bg-emerald-50 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Users className="text-emerald-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Pending Requests
            </h3>
            <p className="text-gray-600 mb-6">
              You don't have any pending connection requests at the moment.
            </p>
            <Link 
              to="/network/suggested" 
              className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors duration-200 font-medium"
            >
              <UserPlus className="mr-2" size={18} />
              Find People to Connect
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {connectionRequests.map((request) => {
              const sender = getSenderInfo(request);
              const isProcessing = processingIds.has(request._id);
              
              return (
                <div 
                  key={request._id} 
                  className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="relative">
                          <img 
                            src={sender.profilePicture} 
                            alt={`${sender.firstName} ${sender.lastName}`}
                            className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-100"
                            onError={(e) => {
                              e.target.src = '/default-avatar.png';
                            }}
                          />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white"></div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                <Link 
                                  to={`/profile/${sender.id}`} 
                                  className="hover:text-emerald-600 transition-colors duration-200"
                                >
                                  {sender.firstName} {sender.lastName}
                                </Link>
                              </h3>
                              
                              {sender.headline && (
                                <p className="text-gray-600 mt-1 flex items-center">
                                  <span className="truncate">{sender.headline}</span>
                                </p>
                              )}
                              
                              {sender.company && (
                                <p className="text-gray-500 text-sm mt-1 flex items-center">
                                  <Building2 className="mr-1" size={14} />
                                  {sender.company}
                                </p>
                              )}
                              
                              <div className="flex items-center space-x-4 mt-2">
                                {sender.mutualConnections > 0 && (
                                  <span className="text-sm text-emerald-600 flex items-center">
                                    <Users className="mr-1" size={14} />
                                    {sender.mutualConnections} mutual
                                  </span>
                                )}
                                
                                <span className="text-sm text-gray-500 flex items-center">
                                  <Calendar className="mr-1" size={14} />
                                  {formatDate(request.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {request.message && (
                            <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                              <div className="flex items-start">
                                <MessageCircle className="text-emerald-600 mr-2 flex-shrink-0" size={16} />
                                <p className="text-gray-700 text-sm leading-relaxed">
                                  "{request.message}"
                                </p>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex space-x-3 mt-6">
                            <button
                              onClick={() => handleAccept(request._id)}
                              disabled={isProcessing}
                              className="flex-1 flex justify-center items-center px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                            >
                              {isProcessing ? (
                                <Loader2 size={18} className="animate-spin mr-2" />
                              ) : (
                                <Check size={18} className="mr-2" />
                              )}
                              Accept
                            </button>
                            
                            <button
                              onClick={() => handleDecline(request._id)}
                              disabled={isProcessing}
                              className="flex-1 flex justify-center items-center px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                            >
                              {isProcessing ? (
                                <Loader2 size={18} className="animate-spin mr-2" />
                              ) : (
                                <X size={18} className="mr-2" />
                              )}
                              Decline
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionRequestPage;