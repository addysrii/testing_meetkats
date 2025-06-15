import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const NearbyProfessionals = ({ user }) => {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [distance, setDistance] = useState(10); // Default 10km radius
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(false);

  // Get user's current location
  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setCurrentLocation({ latitude, longitude });
            setLocationError(false);
          },
          (error) => {
            console.error('Geolocation error:', error);
            setLocationError(true);
            setError('Could not get your location. Please enable location services.');
            setLoading(false);
          },
          { 
            enableHighAccuracy: true, 
            timeout: 15000, // Increased timeout to 15 seconds
            maximumAge: 0 
          }
        );
      } else {
        setLocationError(true);
        setError('Geolocation is not supported by your browser');
        setLoading(false);
      }
    };

    getUserLocation();
  }, []);

  // Function to fetch nearby professionals - using useCallback to avoid recreating this function
  // Fixed fetchNearbyProfessionals function with better error handling and fallback options
  const fetchNearbyProfessionals = useCallback(async (loc, dist) => {
    if (!loc) return;
    
    try {
      setLoading(true);
      
      let professionals = [];
      
      // First attempt: Try using the dedicated getNearbyProfessionals function
      try {
        if (typeof api.getNearbyProfessionals === 'function') {
          console.log('Using api.getNearbyProfessionals function');
          professionals = await api.getNearbyProfessionals(dist, loc.latitude, loc.longitude);
        } else {
          throw new Error('getNearbyProfessionals function not available');
        }
      } catch (primaryError) {
        console.error('Error with primary API method:', primaryError);
        
        // Second attempt: Try direct API call with axios
        try {
          console.log('Falling back to direct API call for nearby professionals');
          const params = { 
            distance: dist,
            latitude: loc.latitude,
            longitude: loc.longitude
          };
          
          // Make sure we're using the API instance correctly
          const response = await api.get('/api/network/nearby', { params });
          
          // Extract professionals data from response
          professionals = Array.isArray(response.data) 
            ? response.data 
            : Array.isArray(response.data?.data) 
              ? response.data.data 
              : Array.isArray(response.data?.professionals)
                ? response.data.professionals
                : [];
                
          console.log('Received professionals data:', professionals);
        } catch (fallbackError) {
          console.error('Error with fallback API method:', fallbackError);
          throw fallbackError; // Re-throw to be caught by the outer catch
        }
      }
            
      // Process professionals to ensure safe values and formatting
      const processedProfessionals = professionals.map(prof => {
        // Format distance to prevent errors
        let formattedDistance = 'nearby';
        let distanceValue = null;
        
        try {
          if (typeof prof.distance === 'number' && !isNaN(prof.distance)) {
            distanceValue = prof.distance;
            formattedDistance = prof.distance < 1 
              ? `${(prof.distance * 1000).toFixed(0)}m away` 
              : `${prof.distance.toFixed(1)}km away`;
          } else if (typeof prof.distance === 'string') {
            const parsedDist = parseFloat(prof.distance);
            if (!isNaN(parsedDist)) {
              distanceValue = parsedDist;
              formattedDistance = parsedDist < 1 
                ? `${(parsedDist * 1000).toFixed(0)}m away` 
                : `${parsedDist.toFixed(1)}km away`;
            }
          }
        } catch (distError) {
          console.error('Error formatting distance:', distError);
        }
        
        return {
          ...prof,
          // Ensure required properties exist
          _id: prof._id || prof.id || `temp-${Date.now()}-${Math.random()}`,
          firstName: prof.firstName || '',
          lastName: prof.lastName || '',
          connectionStatus: prof.connectionStatus || 'none',
          formattedDistance,
          distance: distanceValue
        };
      });
      
      setProfessionals(processedProfessionals);
      setError(null);
      
      // Update location separately
      try {
        if (typeof api.updateLocation === 'function') {
          await api.updateLocation(loc.latitude, loc.longitude);
          console.log('Location updated successfully');
        } else {
          console.log('updateLocation function not available');
        }
      } catch (locationError) {
        console.log('Location update failed, but professionals were fetched', locationError);
      }
    } catch (error) {
      console.error('Error in fetchNearbyProfessionals:', error);
      setError('Failed to load nearby professionals. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch nearby professionals when location is available
  useEffect(() => {
    if (currentLocation) {
      fetchNearbyProfessionals(currentLocation, distance);
    }
  }, [currentLocation, distance, fetchNearbyProfessionals]);

  // Distance range handler
  const handleDistanceChange = (event) => {
    const newDistance = parseInt(event.target.value, 10);
    setDistance(newDistance);
    if (currentLocation) {
      fetchNearbyProfessionals(currentLocation, newDistance);
    }
  };

  // Calculate positions for professionals inside the oval
  const positionProfiles = useCallback(() => {
    const maxVisible = Math.min(professionals.length, 8); // Show max 8 profiles
    const profiles = [];
    
    for (let i = 0; i < maxVisible; i++) {
      const professional = professionals[i];
      
      // Use a golden ratio based spiral to position profiles
      const theta = i * 2.4; // Golden angle in radians
      const radius = Math.min(16, 5 + 2.5 * Math.sqrt(i)); // Adjust radius based on index
      
      // Convert polar to cartesian coordinates (0,0 is center)
      const x = radius * Math.cos(theta);
      const y = radius * Math.sin(theta) * 0.6; // Multiply by 0.6 to account for oval shape
      
      // Convert to percentage (center is 50%, 50%)
      const xPercent = 50 + x;
      const yPercent = 50 + y;
      
      profiles.push({
        ...professional,
        position: { x: xPercent, y: yPercent }
      });
    }
    
    return profiles;
  }, [professionals]);

  // Send connection request
  const handleConnect = async (userId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (!userId) {
        console.error('No user ID provided');
        return;
      }
      
      console.log('Sending connection request to user:', userId);
      
      // Fix: Use the correct function name - sendConnectionRequest instead of endConnectionRequest
      // Check if either function exists and use the available one
      if (typeof api.sendConnectionRequest === 'function') {
        await api.sendConnectionRequest(userId);
      } else if (typeof api.endConnectionRequest === 'function') {
        await api.endConnectionRequest(userId);
      } else {
        // Fallback to direct API call if neither function is available
        await api.post('/api/connections/request', { targetUserId: userId });
      }
      
      // Update the list to show "Pending" for this user
      setProfessionals(prev => 
        prev.map(p => 
          p._id === userId ? { ...p, connectionStatus: 'pending' } : p
        )
      );
    } catch (error) {
      console.error('Error sending connection request:', error);
      // Check the specific error message or status
      if (error.response) {
        console.error('Server response:', error.response.data);
      }
    }
  };

  // Get initials from name
  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  // Retry getting location
  const retryLocation = () => {
    setLoading(true);
    setLocationError(false);
    setError(null);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
        },
        (error) => {
          console.error('Geolocation retry failed:', error);
          setLocationError(true);
          setError('Still unable to get your location. Please check your device settings.');
          setLoading(false);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 15000,
          maximumAge: 0 
        }
      );
    }
  };

  // Loading state
  if (loading && !professionals.length) {
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Scanning for Professionals</h3>
          <div className="animate-pulse">
            <div className="h-2 w-16 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Looking for professionals near you...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Scanning for Professionals</h3>
        </div>
        <div className="p-6 flex flex-col items-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-1">Location Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={retryLocation}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const positionedProfiles = positionProfiles();

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Professionals Nearby</h3>
        <div className="flex items-center space-x-2">
          <label htmlFor="distance" className="text-sm text-gray-500">
            {distance} km
          </label>
          <input
            id="distance"
            type="range"
            min="1"
            max="50"
            value={distance}
            onChange={handleDistanceChange}
            className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
        </div>
      </div>

      {professionals.length === 0 ? (
        <div className="text-center py-8 px-4">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No professionals found</h3>
          <p className="text-gray-600 max-w-sm mx-auto">Try increasing the search radius or check back later when more professionals are in your area.</p>
          <button 
            onClick={() => fetchNearbyProfessionals(currentLocation, distance)}
            className="mt-4 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      ) : (
        <div className="p-6 flex flex-col items-center">
          {/* Main orange oval with profiles inside */}
          <div className="relative w-72 h-44 mb-6">
            {/* Orange oval background with gradient */}
            <div className="absolute inset-0" style={{ 
              background: 'linear-gradient(135deg, #FF7A45 0%, #FF4D00 100%)', 
              borderRadius: '50%',
              boxShadow: '0 4px 14px rgba(255, 122, 69, 0.4)'
            }}>
              {/* Inner white rings */}
              <div className="absolute inset-3" style={{ 
                border: '1px solid rgba(255, 255, 255, 0.3)', 
                borderRadius: '50%'
              }}></div>
              <div className="absolute inset-6" style={{ 
                border: '1px solid rgba(255, 255, 255, 0.15)', 
                borderRadius: '50%'
              }}></div>
              
              {/* Pulse animation in the center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-4 w-4 bg-white rounded-full opacity-75 animate-ping"></div>
                <div className="h-3 w-3 bg-white rounded-full absolute"></div>
              </div>
            </div>
            
            {/* Profiles inside the oval */}
            {positionedProfiles.map((professional) => (
              <div 
                key={professional._id}
                className="absolute w-12 h-12 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-110"
                style={{ 
                  left: `${professional.position.x}%`, 
                  top: `${professional.position.y}%`,
                  zIndex: 10
                }}
              >
                <Link to={`/profile/${professional._id}`} className="block relative">
                  <div className="h-12 w-12 rounded-full overflow-hidden bg-white border-2 border-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                    {professional.profilePicture ? (
                      <img
                        src={professional.profilePicture}
                        alt={`${professional.firstName} ${professional.lastName}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-700">
                        <span className="font-semibold">
                          {getInitials(professional.firstName, professional.lastName)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Tooltip with name */}
                  <div className="absolute opacity-0 group-hover:opacity-100 -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap pointer-events-none transition-opacity duration-200">
                    {professional.firstName} {professional.lastName}
                  </div>
                  
                  {/* Connection status indicator */}
                  <div className="absolute -bottom-1 right-0 transform translate-x-1/4">
                    {professional.connectionStatus === 'connected' ? (
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-500 ring-2 ring-white text-xs font-medium text-white shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    ) : professional.connectionStatus === 'pending' ? (
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 ring-2 ring-white text-xs font-medium text-white shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 102 0V6zm-1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                      </span>
                    ) : (
                      <button
                        onClick={(e) => handleConnect(professional._id, e)}
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 ring-2 ring-white text-xs font-medium text-white shadow-sm hover:bg-blue-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
          
          {/* Status text and professionals count */}
          <div className="text-center mt-2 mb-4">
            <div className="text-sm text-gray-500 mb-1">Network scanning active</div>
            <div className="text-lg font-medium text-gray-900">
              {professionals.length} professional{professionals.length !== 1 ? 's' : ''} nearby
            </div>
          </div>
          
          {/* List of professionals (mobile-friendly view) */}
          <div className="w-full mt-2 border-t border-gray-100 pt-4 md:hidden">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Quick Connect</h4>
            <div className="space-y-2">
              {professionals.slice(0, 3).map((professional) => (
                <Link 
                  key={professional._id} 
                  to={`/profile/${professional._id}`}
                  className="flex items-center p-2 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                    {professional.profilePicture ? (
                      <img
                        src={professional.profilePicture}
                        alt={`${professional.firstName} ${professional.lastName}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gray-100">
                        <span className="font-semibold text-gray-700">
                          {getInitials(professional.firstName, professional.lastName)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {professional.firstName} {professional.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {professional.headline || professional.title || 'Professional'}
                    </p>
                  </div>
                  {professional.connectionStatus === 'connected' ? (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Connected
                    </span>
                  ) : professional.connectionStatus === 'pending' ? (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  ) : (
                    <button
                      onClick={(e) => handleConnect(professional._id, e)}
                      className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                    >
                      Connect
                    </button>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
        <Link 
          to="/network/nearby"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          View nearby map
        </Link>
        <Link 
          to="/network/recommendations" 
          className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          All professionals
        </Link>
      </div>
    </div>
  );
};

export default NearbyProfessionals;
