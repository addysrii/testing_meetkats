// src/services/notificationService.js
import api from './api';

// Utility function to normalize data - if you have a dedicated one, import it instead
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

// Cache keys
const CACHE_KEYS = {
  UNREAD_COUNT: 'notification_unread_count',
  NOTIFICATIONS: 'notifications_data',
  PUSH_TOKEN: 'push_notification_token',
};

const notificationService = {
  // Get all notifications with caching
  getNotifications: async (page = 1, limit = 20, filter = 'all') => {
    try {
      const response = await api.get('/api/notifications', {
        params: { page, limit, filter }
      });
      
      const normalizedData = normalizeData(response.data);
      
      // Cache the notifications data
      try {
        localStorage.setItem(CACHE_KEYS.NOTIFICATIONS, JSON.stringify(normalizedData));
      } catch (cacheError) {
        console.warn('Failed to cache notifications:', cacheError);
      }
      
      return normalizedData;
    } catch (error) {
      console.error('Error fetching notifications:', error.response?.data || error.message);
      
      // Try to get cached data if API call fails
      try {
        const cachedData = localStorage.getItem(CACHE_KEYS.NOTIFICATIONS);
        if (cachedData) {
          return JSON.parse(cachedData);
        }
      } catch (cacheError) {
        console.error('Error retrieving cached notifications:', cacheError);
      }
      
      throw error;
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      if (!notificationId) {
        throw new Error('Notification ID is required');
      }
      const response = await api.put(`/api/notifications/${notificationId}/read`);
      
      // Update cached unread count
      try {
        const cachedCount = localStorage.getItem(CACHE_KEYS.UNREAD_COUNT);
        if (cachedCount && parseInt(cachedCount) > 0) {
          localStorage.setItem(CACHE_KEYS.UNREAD_COUNT, String(parseInt(cachedCount) - 1));
        }
      } catch (cacheError) {
        console.warn('Failed to update cached unread count:', cacheError);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error.response?.data || error.message);
      throw error;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const response = await api.put('/api/notifications/read-all');
      
      // Update cached unread count
      try {
        localStorage.setItem(CACHE_KEYS.UNREAD_COUNT, '0');
      } catch (cacheError) {
        console.warn('Failed to update cached unread count:', cacheError);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error.response?.data || error.message);
      throw error;
    }
  },

  // Delete a notification
  deleteNotification: async (notificationId) => {
    try {
      if (!notificationId) {
        throw new Error('Notification ID is required');
      }
      const response = await api.delete(`/api/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get unread notification count with caching
  getUnreadCount: async () => {
    try {
      const response = await api.get('/api/notifications/count');
      const count = response.data.count || 0;
      
      // Cache the count
      try {
        localStorage.setItem(CACHE_KEYS.UNREAD_COUNT, String(count));
      } catch (cacheError) {
        console.warn('Failed to cache unread count:', cacheError);
      }
      
      return count;
    } catch (error) {
      console.error('Error fetching unread notification count:', error.response?.data || error.message);
      
      // Try to get cached count if API call fails
      try {
        const cachedCount = localStorage.getItem(CACHE_KEYS.UNREAD_COUNT);
        if (cachedCount) {
          return parseInt(cachedCount);
        }
      } catch (cacheError) {
        console.error('Error retrieving cached unread count:', cacheError);
      }
      
      return 0; // Default to 0 if everything fails
    }
  },

  // Register push notification token with caching (for web push notifications)
  registerPushToken: async (token, deviceType = 'web', deviceName = 'Web Browser') => {
    try {
      if (!token) {
        throw new Error('Push token is required');
      }
      
      // Cache the token first
      try {
        localStorage.setItem(CACHE_KEYS.PUSH_TOKEN, token);
      } catch (cacheError) {
        console.warn('Failed to cache push token:', cacheError);
      }
      
      const response = await api.post('/api/notifications/push/register', {
        token,
        deviceType,
        deviceName
      });
      return response.data;
    } catch (error) {
      console.error('Error registering push token:', error.response?.data || error.message);
      throw error;
    }
  },

  // Unregister push notification token
  unregisterPushToken: async (token) => {
    try {
      if (!token) {
        // Try to get token from cache if not provided
        try {
          const cachedToken = localStorage.getItem(CACHE_KEYS.PUSH_TOKEN);
          if (cachedToken) {
            token = cachedToken;
          } else {
            throw new Error('Push token is required');
          }
        } catch (cacheError) {
          console.error('Error retrieving cached token:', cacheError);
          throw new Error('Push token is required');
        }
      }
      
      // Remove from cache
      try {
        localStorage.removeItem(CACHE_KEYS.PUSH_TOKEN);
      } catch (cacheError) {
        console.warn('Failed to remove cached push token:', cacheError);
      }
      
      const response = await api.delete('/api/notifications/push/unregister', {
        data: { token }
      });
      return response.data;
    } catch (error) {
      console.error('Error unregistering push token:', error.response?.data || error.message);
      throw error;
    }
  },

  // Alternative method for registering token (supports old API endpoint)
  registerPushTokenAlt: async (token, deviceInfo) => {
    try {
      if (!token) {
        throw new Error('Push token is required');
      }
      
      // Cache the token first
      try {
        localStorage.setItem(CACHE_KEYS.PUSH_TOKEN, token);
      } catch (cacheError) {
        console.warn('Failed to cache push token:', cacheError);
      }
      
      const response = await api.post('/api/push-token', {
        token,
        ...deviceInfo
      });
      return response.data;
    } catch (error) {
      console.error('Error registering push token (alt):', error.response?.data || error.message);
      throw error;
    }
  },

  // Test push notification
  testPushNotification: async () => {
    try {
      const response = await api.post('/api/notifications/push/test');
      return response.data;
    } catch (error) {
      console.error('Error testing push notification:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update notification settings
  updateNotificationSettings: async (settings) => {
    try {
      const response = await api.put('/api/notification-settings', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating notification settings:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get Do Not Disturb settings
  getDoNotDisturbSettings: async () => {
    try {
      const response = await api.get('/api/notifications/dnd');
      return response.data;
    } catch (error) {
      console.error('Error fetching DND settings:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update Do Not Disturb settings
  updateDoNotDisturbSettings: async (settings) => {
    try {
      const response = await api.put('/api/notifications/dnd', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating DND settings:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get subscribed topics
  getSubscribedTopics: async () => {
    try {
      const response = await api.get('/api/notifications/topics');
      return response.data;
    } catch (error) {
      console.error('Error fetching subscribed topics:', error.response?.data || error.message);
      throw error;
    }
  },

  // Subscribe to topic
  subscribeToTopic: async (topic) => {
    try {
      if (!topic) {
        throw new Error('Topic is required');
      }
      const response = await api.post(`/api/notifications/topics/${topic}/subscribe`);
      return response.data;
    } catch (error) {
      console.error('Error subscribing to topic:', error.response?.data || error.message);
      throw error;
    }
  },

  // Unsubscribe from topic
  unsubscribeFromTopic: async (topic) => {
    try {
      if (!topic) {
        throw new Error('Topic is required');
      }
      const response = await api.delete(`/api/notifications/topics/${topic}/unsubscribe`);
      return response.data;
    } catch (error) {
      console.error('Error unsubscribing from topic:', error.response?.data || error.message);
      throw error;
    }
  },

  // Web Push API specific methods for browser notifications
  
  // Request notification permission for web
  requestNotificationPermission: async () => {
    try {
      // Check if the browser supports notifications
      if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return { granted: false, error: 'Browser does not support notifications' };
      }
      
      // Check if permission is already granted
      if (Notification.permission === 'granted') {
        return { granted: true };
      }
      
      // Request permission
      const permission = await Notification.requestPermission();
      return { granted: permission === 'granted' };
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return { granted: false, error: error.message };
    }
  },
  
  // Check notification permission
  checkNotificationPermission: () => {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  },
  
  // Display a notification (for testing)
  displayNotification: async (title, options = {}) => {
    try {
      if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return false;
      }
      
      if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          return false;
        }
      }
      
      const notification = new Notification(title, options);
      return true;
    } catch (error) {
      console.error('Error displaying notification:', error);
      return false;
    }
  }
};

export default notificationService;