// src/services/nearbyUsersService.js
import api from './api';

// Helper function to normalize MongoDB _id to id for frontend
const normalizeData = (data) => {
  if (!data) return null;
  
  if (Array.isArray(data)) {
    return data.map(item => ({
      id: item._id || item.id,
      ...item,
    }));
  }
  
  return {
    id: data._id || data.id,
    ...data
  };
};

const nearbyUsersService = {
  // Get nearby users based on current location and filters
  getNearbyUsers: async (params = {}) => {
    try {
      console.log('Calling getNearbyUsers API with params:', params);
      
      // Validate location data before making the API call
      if (!params.latitude || !params.longitude) {
        console.error('Missing latitude or longitude in params');
        throw new Error('Location coordinates are required');
      }
      
      const response = await api.get('/api/nearby-users', { 
        params,
        timeout: 10000 // 10 second timeout
      });
      
      console.log('Nearby users API response status:', response.status);
      
      return {
        ...response.data,
        users: normalizeData(response.data.users || [])
      };
    } catch (error) {
      console.error('Error fetching nearby users:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update user's current location
  updateLocation: async (latitude, longitude, checkNearbyUsers = false) => {
    try {
      console.log('Updating location:', { latitude, longitude, checkNearbyUsers });
      
      // Validate coordinates
      if (!latitude || !longitude || isNaN(parseFloat(latitude)) || isNaN(parseFloat(longitude))) {
        console.error('Invalid or missing coordinates');
        throw new Error('Valid coordinates are required');
      }
      
      const response = await api.put('/api/nearby-users/location', {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        checkNearbyUsers
      });
      
      return response.data;
    } catch (error) {
      console.error('Error updating location:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update user's location in batch mode (for background updates)
  batchLocationUpdate: async (locationHistory) => {
    try {
      if (!locationHistory || !Array.isArray(locationHistory) || locationHistory.length === 0) {
        throw new Error('Valid location history array is required');
      }
      
      const response = await api.post('/api/nearby-users/location/batch', {
        locations: locationHistory
      });
      
      return response.data;
    } catch (error) {
      console.error('Error updating location in batch:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update user's location in background mode
  backgroundLocationUpdate: async (latitude, longitude, timestamp) => {
    try {
      if (!latitude || !longitude) {
        throw new Error('Valid coordinates are required');
      }
      
      const response = await api.post('/api/nearby-users/location/background', {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        timestamp: timestamp || new Date().toISOString()
      });
      
      return response.data;
    } catch (error) {
      console.error('Error updating background location:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get user's notification preferences for nearby users
  getNearbyNotificationPreferences: async () => {
    try {
      const response = await api.get('/api/nearby-users/notification-preferences');
      return response.data;
    } catch (error) {
      console.error('Error fetching nearby notification preferences:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update user's notification preferences for nearby users
  updateNearbyNotificationPreferences: async (preferences) => {
    try {
      if (!preferences) {
        throw new Error('Preferences object is required');
      }
      
      const response = await api.put('/api/nearby-users/notification-preferences', preferences);
      return response.data;
    } catch (error) {
      console.error('Error updating nearby notification preferences:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get available filters for nearby users
  getAvailableFilters: async () => {
    try {
      const response = await api.get('/api/nearby-users/filters');
      return response.data;
    } catch (error) {
      console.error('Error fetching nearby user filters:', error.response?.data || error.message);
      throw error;
    }
  },

  // Test nearby user notification
  testNearbyNotification: async () => {
    try {
      const response = await api.post('/api/nearby-users/notifications/test');
      return response.data;
    } catch (error) {
      console.error('Error testing nearby notifications:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Request connection with another user
  requestConnection: async (userId) => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      const response = await api.post('/api/connections/requests', { userId });
      return response.data;
    } catch (error) {
      console.error('Error sending connection request:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Calculate distance between two coordinates in kilometers
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1); 
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    
    return distance;
  }
};

// Helper function to convert degrees to radians
function deg2rad(deg) {
  return deg * (Math.PI/180);
}

export default nearbyUsersService;