import React, { useState, useEffect } from 'react';
import { MapPin, AlertTriangle } from 'lucide-react';

const LocationPermissionIcon = () => {
  const [permissionStatus, setPermissionStatus] = useState('checking');
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        if (!navigator.permissions) {
          // Fallback for browsers without Permissions API
          navigator.geolocation.getCurrentPosition(
            () => setPermissionStatus('granted'),
            (error) => {
              if (error.code === error.PERMISSION_DENIED) {
                setPermissionStatus('denied');
              } else {
                setPermissionStatus('unknown');
              }
            }
          );
          return;
        }

        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setPermissionStatus(permission.state);

        // Listen for changes to permission
        permission.onchange = () => {
          setPermissionStatus(permission.state);
        };
      } catch (error) {
        console.error('Error checking location permission:', error);
        setPermissionStatus('unknown');
      }
    };

    checkPermission();
  }, []);

  const requestPermission = () => {
    navigator.geolocation.getCurrentPosition(
      () => setPermissionStatus('granted'),
      (error) => {
        console.error('Geolocation error:', error);
        setPermissionStatus('denied');
      }
    );
  };

  return (
    <div className="relative inline-block">
      {permissionStatus === 'granted' ? (
        <div 
          className="flex items-center bg-green-100 text-green-800 p-2 rounded-lg"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <MapPin className="h-5 w-5 mr-2" />
          <span className="text-sm font-medium">Location enabled</span>
        </div>
      ) : permissionStatus === 'denied' ? (
        <div 
          className="flex items-center bg-red-100 text-red-800 p-2 rounded-lg cursor-pointer"
          onClick={() => window.open('about:preferences#privacy', '_blank')}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span className="text-sm font-medium">Location blocked</span>
        </div>
      ) : (
        <div 
          className="flex items-center bg-orange-100 text-orange-800 p-2 rounded-lg cursor-pointer"
          onClick={requestPermission}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <MapPin className="h-5 w-5 mr-2" />
          <span className="text-sm font-medium">Enable location</span>
        </div>
      )}

      {showTooltip && (
        <div className="absolute z-10 w-64 p-2 mt-2 text-sm text-white bg-gray-800 rounded-md shadow-lg">
          {permissionStatus === 'granted' ? (
            <p>Location sharing is active for nearby networking features</p>
          ) : permissionStatus === 'denied' ? (
            <p>Please enable location in your browser settings to use nearby networking features</p>
          ) : (
            <p>Enable location sharing to discover nearby networking opportunities</p>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationPermissionIcon;
