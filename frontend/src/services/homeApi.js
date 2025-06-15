// src/services/homeApi.js
import api from './api';

// Fallback mock data for when the backend API fails
const FALLBACK_DATA = {
  userStats: {
    firstName: 'Guest',
    lastName: 'User',
    streak: 0,
    mkWallet: 250,
    rank: 'Newcomer',
    levelProgress: 10
  },
  portfolio: {
    projectsCount: 0,
    achievementsCount: 0,
    skillsCount: 0
  },
  network: {
    connectionsCount: 0,
    followersCount: 0,
    followingCount: 0
  },
  events: [],
  notifications: []
};

const homeApi = {
  /**
   * Get user dashboard stats (profile, streak, points, rank)
   */
  getUserStats: async () => {
    try {
      const response = await api.get('/api/me');
      
      // Format user data for easy consumption in the UI
      return {
        id: response.data._id,
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        username: response.data.username || '',
        profileImage: response.data.profileImage || null,
        headline: response.data.headline || '',
        // Use mkWallet for points as per your backend model (User.js)
        points: response.data.mkWallet || 0,
        // Use streak directly or default to 0
        streak: response.data.streak || 0,
        // Use rank directly or default to 'Newcomer'
        rank: response.data.rank || 'Newcomer', 
        // Default levelProgress to 0
        levelProgress: response.data.levelProgress || 0
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Return fallback data when API fails
      return FALLBACK_DATA.userStats;
    }
  },

  /**
   * Get portfolio summary data
   * This fetches projects and achievements counts
   */
  getPortfolioSummary: async () => {
    try {
      // Try portfolio summary endpoint first
      const response = await api.get('/api/portfolio/summarybb');
      return response.data;
    } catch (error) {
      console.error('Error fetching portfolio summary:', error);
      
      try {
        // Fallback: try to calculate from individual endpoints
        const projectsResponse = await api.get('/api/projects');
        const achievementsResponse = await api.get('/api/achievements');
        const skillsResponse = await api.get('/api/skills');
        
        return {
          projectsCount: projectsResponse.data?.length || 0,
          achievementsCount: achievementsResponse.data?.length || 0,
          skillsCount: skillsResponse.data?.length || 0
        };
      } catch (secondError) {
        console.error('Failed to fetch portfolio data:', secondError);
        return FALLBACK_DATA.portfolio;
      }
    }
  },

  /**
   * Get upcoming events
   * Uses the format shown in event.controller.js
   */
  getUpcomingEvents: async () => {
    try {
      const response = await api.get('/api/events', {
        params: {
          filter: 'upcoming',
          limit: 3
        }
      });
      
      // Format the response for the UI
      // Based on the response format from your event.controller.js
      if (response.data?.events) {
        return response.data.events.map(event => ({
          _id: event._id,
          title: event.title || event.name, // Support both title and name fields
          description: event.description || '',
          date: new Date(event.startDate || event.startDateTime),
          endDate: event.endDate || event.endDateTime ? new Date(event.endDate || event.endDateTime) : null,
          location: event.location,
          coverImage: event.coverImage?.url || null,
          attendeesCount: event.attendeeCounts?.going || 0,
          virtual: event.virtual || false,
          category: event.category || 'other'
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      return FALLBACK_DATA.events;
    }
  },

  /**
   * Get recent notifications
   * Based on notification.controller.js and the Notification schema
   */
  getRecentNotifications: async () => {
    try {
      const response = await api.get('/api/notifications', {
        params: {
          limit: 5
        }
      });
      
      // If the response is empty, return an empty array
      if (!response.data || !Array.isArray(response.data)) {
        return [];
      }
      
      // Format notifications for UI display
      return response.data.map(notification => {
        // Map notification types to UI types
        let type = notification.type;
        if (type.includes('connection')) type = 'connection';
        if (type.includes('like') || type.includes('react')) type = 'like';
        if (type.includes('comment')) type = 'comment';
        if (type.includes('mention')) type = 'mention';
        if (type.includes('achievement')) type = 'achievement';
        
        return {
          _id: notification._id,
          type,
          sender: notification.sender,
          content: notification.data?.text || notification.content || '',
          createdAt: notification.timestamp || notification.createdAt,
          read: notification.read || false
        };
      });
    } catch (error) {
      console.error('Error fetching recent notifications:', error);
      return FALLBACK_DATA.notifications;
    }
  },

  /**
   * Get user's connections count and network stats
   */
  getNetworkStats: async () => {
    try {
      // Updated to match the actual API route from your backend
      const connectionsResponse = await api.get('/api/network/connections');
      
      // Try to get followers/following counts - updated to match backend routes
      let followStats = {};
      try {
        const followersResponse = await api.get('/api/users/' + api.defaults.headers.common['userId'] + '/followers');
        const followingResponse = await api.get('/api/users/' + api.defaults.headers.common['userId'] + '/following');
        
        followStats = {
          followersCount: followersResponse.data?.pagination?.total || 0,
          followingCount: followingResponse.data?.pagination?.total || 0
        };
      } catch (followError) {
        console.error('Error fetching follow stats:', followError);
      }
      
      return {
        connectionsCount: connectionsResponse.data?.pagination?.total || 0,
        ...followStats
      };
    } catch (error) {
      console.error('Error fetching network stats:', error);
      
      // Try user profile as fallback
      try {
        const userResponse = await api.get('/api/me');
        return {
          connectionsCount: userResponse.data.connections?.length || 0,
          followersCount: userResponse.data.followersCount || 0,
          followingCount: userResponse.data.followingCount || 0
        };
      } catch (secondError) {
        return FALLBACK_DATA.network;
      }
    }
  },

  /**
   * Get unread notification count
   */
  getUnreadNotificationCount: async () => {
    try {
      const response = await api.get('/api/notifications/count');
      return response.data.count || 0;
    } catch (error) {
      console.error('Error fetching notification count:', error);
      
      // Try to manually count from notifications as fallback
      try {
        const notificationsResponse = await api.get('/api/notifications');
        if (Array.isArray(notificationsResponse.data)) {
          return notificationsResponse.data.filter(n => !n.read).length;
        }
        return 0;
      } catch (secondError) {
        return 0;
      }
    }
  },

  /**
   * Check in for streak
   */
  checkInStreak: async () => {
    try {
      // Try the dedicated streak endpoint
      const response = await api.post('/api/streaks/checkin');
      return response.data;
    } catch (error) {
      console.error('Error checking in for streak:', error);
      
      // Fall back to a generic response
      return { 
        success: false, 
        message: 'Could not check in. Please try again later.'
      };
    }
  },
  
  /**
   * Get recommended connections
   */
  getRecommendedConnections: async (limit = 3) => {
    try {
      const response = await api.get('/api/network/suggestions', {
        params: { limit }
      });
      
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching recommended connections:', error);
      return [];
    }
  },
  
  /**
   * Get nearby users
   */
  getNearbyUsers: async (limit = 3) => {
    try {
      const response = await api.get('/api/network/nearby', {
        params: { limit }
      });
      
      return response.data?.users || [];
    } catch (error) {
      console.error('Error fetching nearby users:', error);
      return [];
    }
  }
};

export default homeApi;