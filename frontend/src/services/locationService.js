// src/services/locationService.js
import networkService from './networkService';

// Time between periodic location updates (in ms)
const LOCATION_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Track active watchers
let watchId = null;
let intervalId = null;
let lastPosition = null;

const locationService = {
  // Start tracking location in the browser
  startLocationTracking: async () => {
    try {
      // Check if geolocation is available
      if (!navigator.geolocation) {
        console.log('Geolocation is not supported by this browser');
        return { success: false, error: 'Geolocation not supported' };
      }

      // Get initial position
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          lastPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };

          // Send initial location update
          try {
            await networkService.updateLocation(
              position.coords.latitude,
              position.coords.longitude,
              false
            );
            
            console.log('Initial location update sent:', lastPosition);
          } catch (error) {
            console.error('Error sending initial location update:', error);
          }
        },
        (error) => {
          console.error('Error getting initial position:', error);
        },
        {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 60000
        }
      );

      // Start watching position
      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          // Only update if position changed significantly
          const newPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };

          // Calculate distance between positions
          if (lastPosition && 
              locationService.calculateDistance(
                lastPosition.latitude, 
                lastPosition.longitude,
                newPosition.latitude, 
                newPosition.longitude
              ) < 100) {
            // Less than 100 meters difference, don't update
            return;
          }

          lastPosition = newPosition;
          
          // Send position to server
          try {
            await networkService.updateLocation(
              position.coords.latitude,
              position.coords.longitude,
              false
            );
            
            console.log('Location update sent:', newPosition);
          } catch (error) {
            console.error('Error sending location update:', error);
          }
        },
        (error) => {
          console.error('Watch position error:', error);
        },
        {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 60000
        }
      );

      // Set up interval for periodic updates
      intervalId = setInterval(async () => {
        try {
          // Get current position
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              // Send position to server
              await networkService.updateLocation(
                position.coords.latitude,
                position.coords.longitude,
                true // Check for nearby users on interval
              );
              
              console.log('Periodic location update sent');
            },
            (error) => {
              console.error('Periodic position error:', error);
            },
            {
              enableHighAccuracy: false,
              timeout: 15000,
              maximumAge: 60000
            }
          );
        } catch (error) {
          console.error('Error in periodic location update:', error);
        }
      }, LOCATION_UPDATE_INTERVAL);

      console.log('Location tracking started');
      
      return { success: true };
    } catch (error) {
      console.error('Error starting location tracking:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Stop tracking location
  stopLocationTracking: async () => {
    try {
      // Clear watch
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
      
      // Clear interval
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
      
      console.log('Location tracking stopped');
      
      return { success: true };
    } catch (error) {
      console.error('Error stopping location tracking:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Get current location
  getCurrentLocation: async () => {
    return new Promise((resolve) => {
      // Check if geolocation is available
      if (!navigator.geolocation) {
        console.log('Geolocation is not supported by this browser');
        resolve({ success: false, error: 'Geolocation not supported' });
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            success: true,
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            }
          });
        },
        (error) => {
          console.error('Error getting current location:', error);
          resolve({ success: false, error: error.message });
        },
        {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 60000
        }
      );
    });
  },
  
  // Check permissions (in browser this is done via the permission API)
  checkLocationPermissions: async () => {
    if (!navigator.geolocation) {
      return {
        foreground: false,
        background: false,
        error: 'Geolocation not supported'
      };
    }
    
    try {
      // Check if permission API is available
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        
        return {
          foreground: permission.state === 'granted',
          background: false, // Browser can't do true background tracking
          foregroundStatus: permission.state,
          backgroundStatus: 'denied' // Always denied in browser context
        };
      }
      
      // Fallback for browsers without Permission API
      return {
        foreground: true, // Assume permission is granted
        background: false,
        foregroundStatus: 'unknown',
        backgroundStatus: 'denied'
      };
    } catch (error) {
      console.error('Error checking location permissions:', error);
      return {
        foreground: false,
        background: false,
        error: error.message
      };
    }
  },
  
  // Helper function to calculate distance between coordinates in meters
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180; 
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }
};

export default locationService;