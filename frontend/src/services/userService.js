// src/services/userService.js
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

// Helper function to create form data for file uploads
const createFormData = (data, fileField, file) => {
  const formData = new FormData();
  
  // Add all the text fields
  Object.keys(data).forEach(key => {
    formData.append(key, data[key]);
  });
  
  // Add the file if provided
  if (file) {
    formData.append(fileField, file);
  }
  
  return formData;
};

const userService = {
  // Get current user profile
  getCurrentUser: async () => {
    try {
      const response = await api.get('/api/me');
      console.log("response is",normalizeData(response.data))
      return normalizeData(response.data);
      console.log("response is",normalizeData(response.data))
    } catch (error) {
      console.error('Error fetching current user:', error.response?.data || error.message);
      throw error;
    }
  },
  
  getConnections: async () => {
    try {
      const response = await api.get('/api/connections');
      // Make sure we have valid data before processing
      if (!response || !response.data) {
        console.warn('Invalid response from connections API');
        return [];
      }
      
      const normalizedData = normalizeData(response.data);
      // Ensure we're returning an array
      return Array.isArray(normalizedData) ? normalizedData : [];
    } catch (error) {
      console.error('Error fetching connections:', error.response?.data || error.message);
      return [];
    }
  },
  
  // Get user stats (projects, connections, achievements counts)
  getUserStats: async (userId) => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      const response = await api.get(`/api/users/${userId}/stats`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user stats for ID ${userId}:`, error.response?.data || error.message);
      
      // Return default stats to avoid breaking the UI
      console.warn('API not available or error occurred, using default stats');
      return {
        projectCount: 0,
        connectionCount: 0,
        achievementCount: 0
      };
    }
  },
  
  // Get user education information
  getUserEducation: async (userId) => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      const response = await api.get(`/api/users/${userId}/education`);
      return normalizeData(response.data);
    } catch (error) {
      console.error(`Error fetching education for user ${userId}:`, error.response?.data || error.message);
      
      // Return empty array to avoid breaking the UI
      return [];
    }
  },
  
  // Get user profile by ID
  getUserProfile: async (userId) => {
    try {
      // Check if userId is a valid MongoDB ObjectId (24 hex chars)
      if (!userId || typeof userId !== 'string' || !userId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error('Invalid user ID format');
      }
      
      const response = await api.get(`/api/users/${userId}/profile`);
      
      // Format the location if it's an object (GeoJSON)
      const userData = normalizeData(response.data);
      if (userData.location && typeof userData.location === 'object') {
        // Handle GeoJSON Point format
        if (userData.location.type === 'Point' && Array.isArray(userData.location.coordinates)) {
          userData.formattedLocation = `${userData.location.coordinates[1]}, ${userData.location.coordinates[0]}`;
        } else {
          // Handle other object formats
          userData.formattedLocation = JSON.stringify(userData.location).replace(/[{}"]/g, '');
        }
      }
      
      return userData;
    } catch (error) {
      console.error(`Error fetching user profile for ID ${userId}:`, error.response?.data || error.message);
      
      // Check if the error is related to profile visibility (403 Forbidden)
      if (error.response && error.response.status === 403) {
        // Return a special object indicating the profile is private
        return {
          isPrivate: true,
          message: error.response.data?.message || 'This profile is private or has restricted visibility.',
          userId: userId
        };
      }
      
      throw error;
    }
  },
  
  // Update user profile
  updateProfile: async (profileData, profileImage) => {
    try {
      let response;
      
      if (profileImage) {
        // If there's an image, use the utility function to create FormData
        const formData = createFormData(profileData, 'profileImage', profileImage);
        
        response = await api.put('/api/profile', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // If no image, send JSON
        response = await api.put('/api/profile', profileData);
      }
      
      return normalizeData(response.data);
    } catch (error) {
      console.error('Error updating profile:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Delete user account
  deleteAccount: async () => {
    try {
      const response = await api.delete('/api/account');
      return response.data;
    } catch (error) {
      console.error('Error deleting account:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Profile views
  recordProfileView: async (userId) => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      const response = await api.post('/api/profile-views', { userId });
      return response.data;
    } catch (error) {
      console.error('Error recording profile view:', error.response?.data || error.message);
      throw error;
    }
  },
  
  getProfileViewers: async () => {
    try {
      const response = await api.get('/api/profile-views/viewers');
      return normalizeData(response.data);
    } catch (error) {
      console.error('Error fetching profile viewers:', error.response?.data || error.message);
      throw error;
    }
  },
  
  getProfileViewAnalytics: async () => {
    try {
      const response = await api.get('/api/profile-views/analytics');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile view analytics:', error.response?.data || error.message);
      throw error;
    }
  },
  
  getProfileViewActivity: async () => {
    try {
      const response = await api.get('/api/profile-views/activity');
      return normalizeData(response.data);
    } catch (error) {
      console.error('Error fetching profile view activity:', error.response?.data || error.message);
      throw error;
    }
  },
  
  updateProfileViewPrivacy: async (privacySettings) => {
    try {
      const response = await api.put('/api/settings/profile-view-privacy', privacySettings);
      return response.data;
    } catch (error) {
      console.error('Error updating profile view privacy:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // User settings
  getSettings: async () => {
    try {
      const response = await api.get('/api/settings');
      return response.data;
    } catch (error) {
      console.error('Error fetching settings:', error.response?.data || error.message);
      
      // For demo purposes, return mock data if API is not available
      console.warn('API not available, using mock data for settings');
      return {
        account: {
          email: 'user@example.com',
          phone: '+1 (555) 123-4567',
          language: 'English',
          timezone: 'UTC-5 (Eastern Time)',
        },
        notifications: {
          push: true,
          email: true,
          sms: false,
          inApp: true,
        },
        privacy: {
          profileVisibility: 'public',
          showEmail: false,
          showPhone: false,
          allowMessages: true,
          allowTagging: true,
        },
        security: {
          twoFactorEnabled: false,
          loginNotifications: true,
          activeDevices: 2,
        },
        theme: {
          darkMode: false,
          accentColor: 'default',
        }
      };
    }
  },
  
  updateSettings: async (settingsData) => {
    try {
      const response = await api.put('/api/settings', settingsData);
      return response.data;
    } catch (error) {
      console.error('Error updating settings:', error.response?.data || error.message);
      throw error;
    }
  },
  
  updatePrivacySettings: async (privacySettings) => {
    try {
      const response = await api.put('/api/privacy-settings', privacySettings);
      return response.data;
    } catch (error) {
      console.error('Error updating privacy settings:', error.response?.data || error.message);
      throw error;
    }
  },
  
  updateNotificationSettings: async (notificationSettings) => {
    try {
      const response = await api.put('/api/notification-settings', notificationSettings);
      return response.data;
    } catch (error) {
      console.error('Error updating notification settings:', error.response?.data || error.message);
      throw error;
    }
  },
  
  updateAppSettings: async (appSettings) => {
    try {
      const response = await api.put('/api/app-settings', appSettings);
      return response.data;
    } catch (error) {
      console.error('Error updating app settings:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Follow status
  getFollowStatus: async (userId) => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      const response = await api.get(`/api/users/${userId}/follow-status`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching follow status for user ${userId}:`, error.response?.data || error.message);
      // Return a default value to avoid breaking the UI
      return { isFollowing: false };
    }
  },
  
  // Connection management
  removeConnection: async (userId) => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      const response = await api.delete(`/api/connections/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing connection:', error.response?.data || error.message);
      throw error;
    }
  },
  
  getPortfolioSummary: async (userId = null) => {
    try {
      const url = userId ? `/api/portfolio/summary?userId=${userId}` : '/api/portfolio/summary';
      
      const response = await api.get(url);
      
      if (!response.data) {
        throw new Error('Empty response received from server');
      }
      
      return normalizeData(response.data);
    } catch (error) {
      console.error('Error fetching portfolio summary:', error.response?.data || error.message);
      
      // Provide detailed error logging
      if (error.response) {
        console.error('Server response:', error.response.data);
        console.error('Status code:', error.response.status);
      } else if (error.request) {
        console.error('No response received from server');
        console.warn('API might be unavailable, network issues or server down');
      }
      
      // If API is unavailable, we can return a minimal structure so the UI doesn't break
      if (!error.response || error.message === 'Network Error') {
        console.warn('API not available, returning empty portfolio summary structure');
        return {
          user: null,
          stats: {
            projects: { total: 0, public: 0, collaborations: 0 },
            achievements: { total: 0, public: 0, endorsed: 0 },
            streaks: { active: 0, completed: 0, totalCheckIns: 0 },
            recommendations: 0
          },
          skills: [],
          recentProjects: [],
          recentAchievements: [],
          activeStreaks: [],
          recommendations: []
        };
      }
      
      // For other types of errors, propagate them up
      throw error;
    }
  },

  cancelConnectionRequest: async (userId) => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      const response = await api.delete(`/api/connections/requests/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error canceling connection request:', error.response?.data || error.message);
      throw error;
    }
  },
  
  requestConnection: async (userId, message = '') => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      const response = await api.post(`/api/connections/requests`, { userId, message });
      return response.data;
    } catch (error) {
      console.error('Error requesting connection:', error.response?.data || error.message);
      throw error;
    }
  },
  
  toggleFollow: async (userId) => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      const response = await api.post(`/api/users/${userId}/follow`);
      return response.data;
    } catch (error) {
      console.error('Error toggling follow status:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // User posts
  getUserPosts: async (userId) => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      const response = await api.get(`/api/users/${userId}/posts`);
      return normalizeData(response.data);
    } catch (error) {
      console.error(`Error fetching posts for user ${userId}:`, error.response?.data || error.message);
      // Return empty array to avoid breaking the UI
      return [];
    }
  },
  
  // Calendar integrations
  connectCalendar: async (calendarData) => {
    try {
      const response = await api.post('/api/integrations/calendar/connect', calendarData);
      return response.data;
    } catch (error) {
      console.error('Error connecting calendar:', error.response?.data || error.message);
      throw error;
    }
  },
  
  disconnectCalendar: async () => {
    try {
      const response = await api.delete('/api/integrations/calendar/disconnect');
      return response.data;
    } catch (error) {
      console.error('Error disconnecting calendar:', error.response?.data || error.message);
      throw error;
    }
  },
  
  getCalendarEvents: async (startDate, endDate) => {
    try {
      const response = await api.get('/api/integrations/calendar/events', {
        params: { startDate, endDate }
      });
      return normalizeData(response.data);
    } catch (error) {
      console.error('Error fetching calendar events:', error.response?.data || error.message);
      throw error;
    }
  },
  
  syncCalendarEvents: async () => {
    try {
      const response = await api.post('/api/integrations/calendar/sync');
      return response.data;
    } catch (error) {
      console.error('Error syncing calendar events:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Social media integrations
  connectSocialAccount: async (socialData) => {
    try {
      const response = await api.post('/api/integrations/social/connect', socialData);
      return response.data;
    } catch (error) {
      console.error('Error connecting social account:', error.response?.data || error.message);
      throw error;
    }
  },
  
  disconnectSocialAccount: async (socialType) => {
    try {
      if (!socialType) {
        throw new Error('Social account type is required');
      }
      const response = await api.delete('/api/integrations/social/disconnect', {
        data: { type: socialType }
      });
      return response.data;
    } catch (error) {
      console.error('Error disconnecting social account:', error.response?.data || error.message);
      throw error;
    }
  },
  
  getSocialAccounts: async () => {
    try {
      const response = await api.get('/api/integrations/social/accounts');
      return normalizeData(response.data);
    } catch (error) {
      console.error('Error fetching social accounts:', error.response?.data || error.message);
      throw error;
    }
  },
  
  shareToSocial: async (shareData) => {
    try {
      const response = await api.post('/api/integrations/social/share', shareData);
      return response.data;
    } catch (error) {
      console.error('Error sharing to social media:', error.response?.data || error.message);
      throw error;
    }
  },
  
  getShareHistory: async () => {
    try {
      const response = await api.get('/api/integrations/social/shares');
      return normalizeData(response.data);
    } catch (error) {
      console.error('Error fetching share history:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Push notification tokens
  addNotificationToken: async (token, deviceInfo) => {
    try {
      if (!token) {
        throw new Error('Notification token is required');
      }
      const response = await api.post('/api/notification-tokens', {
        token,
        deviceInfo
      });
      return response.data;
    } catch (error) {
      console.error('Error adding notification token:', error.response?.data || error.message);
      throw error;
    }
  },
  
  removeNotificationToken: async (token) => {
    try {
      if (!token) {
        throw new Error('Notification token is required');
      }
      const response = await api.delete(`/api/notification-tokens/${token}`);
      return response.data;
    } catch (error) {
      console.error('Error removing notification token:', error.response?.data || error.message);
      throw error;
    }
  },
  
  getNotificationTokens: async () => {
    try {
      const response = await api.get('/api/notification-tokens');
      return normalizeData(response.data);
    } catch (error) {
      console.error('Error fetching notification tokens:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Data export
  exportUserData: async () => {
    try {
      const response = await api.get('/api/export-data');
      return response.data;
    } catch (error) {
      console.error('Error exporting user data:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default userService;