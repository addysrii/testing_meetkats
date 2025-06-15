// src/services/searchService.js
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

const searchService = {
  // Search for users
  searchUsers: async (query, filters = {}, page = 1, limit = 20) => {
    try {
      const response = await api.get('/api/search/users', {
        params: { query, ...filters, page, limit }
      });
      return {
        ...response.data,
        results: normalizeData(response.data.results)
      };
    } catch (error) {
      console.error('Error searching users:', error.response?.data || error.message);
      throw error;
    }
  },

  // Search for posts
  searchPosts: async (query, filters = {}, page = 1, limit = 20) => {
    try {
      const response = await api.get('/api/search/posts', {
        params: { query, ...filters, page, limit }
      });
      return {
        ...response.data,
        results: normalizeData(response.data.results)
      };
    } catch (error) {
      console.error('Error searching posts:', error.response?.data || error.message);
      throw error;
    }
  },

  // Search for jobs
  searchJobs: async (query, filters = {}, page = 1, limit = 20) => {
    try {
      const response = await api.get('/api/search/jobs', {
        params: { query, ...filters, page, limit }
      });
      return {
        ...response.data,
        results: normalizeData(response.data.results)
      };
    } catch (error) {
      console.error('Error searching jobs:', error.response?.data || error.message);
      throw error;
    }
  },

  // Search for companies
  searchCompanies: async (query, filters = {}, page = 1, limit = 20) => {
    try {
      const response = await api.get('/api/search/companies', {
        params: { query, ...filters, page, limit }
      });
      return {
        ...response.data,
        results: normalizeData(response.data.results)
      };
    } catch (error) {
      console.error('Error searching companies:', error.response?.data || error.message);
      throw error;
    }
  },

  // Search for groups
  searchGroups: async (query, filters = {}, page = 1, limit = 20) => {
    try {
      const response = await api.get('/api/search/groups', {
        params: { query, ...filters, page, limit }
      });
      return {
        ...response.data,
        results: normalizeData(response.data.results)
      };
    } catch (error) {
      console.error('Error searching groups:', error.response?.data || error.message);
      throw error;
    }
  },

  // Search for events
  searchEvents: async (query, filters = {}, page = 1, limit = 20) => {
    try {
      const response = await api.get('/api/search/events', {
        params: { query, ...filters, page, limit }
      });
      return {
        ...response.data,
        results: normalizeData(response.data.results)
      };
    } catch (error) {
      console.error('Error searching events:', error.response?.data || error.message);
      throw error;
    }
  },

  // Search across all content types
  searchAll: async (query, page = 1, limit = 20) => {
    try {
      const response = await api.get('/api/search/all', {
        params: { query, page, limit }
      });
      
      // Normalize all result arrays
      const normalized = {};
      for (const key in response.data) {
        if (Array.isArray(response.data[key])) {
          normalized[key] = normalizeData(response.data[key]);
        } else {
          normalized[key] = response.data[key];
        }
      }
      
      return normalized;
    } catch (error) {
      console.error('Error searching all content:', error.response?.data || error.message);
      throw error;
    }
  },

  // Search for hashtags
  searchHashtags: async (query, page = 1, limit = 20) => {
    try {
      const response = await api.get('/api/search/tags', {
        params: { query, page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching hashtags:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get recent searches
  getRecentSearches: async () => {
    try {
      const response = await api.get('/api/search/recent');
      return response.data;
    } catch (error) {
      console.error('Error fetching recent searches:', error.response?.data || error.message);
      throw error;
    }
  },

  // Clear recent searches
  clearRecentSearches: async () => {
    try {
      const response = await api.delete('/api/search/recent');
      return response.data;
    } catch (error) {
      console.error('Error clearing recent searches:', error.response?.data || error.message);
      throw error;
    }
  },

  // Toggle following a hashtag
  toggleFollowHashtag: async (tag) => {
    try {
      const response = await api.post(`/api/hashtags/${tag}/follow`);
      return response.data;
    } catch (error) {
      console.error(`Error toggling follow for hashtag ${tag}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Get followed hashtags
  getFollowedHashtags: async () => {
    try {
      const response = await api.get('/api/hashtags/followed');
      return response.data;
    } catch (error) {
      console.error('Error fetching followed hashtags:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get trending hashtags
  getTrendingHashtags: async () => {
    try {
      const response = await api.get('/api/hashtags/trending');
      return response.data;
    } catch (error) {
      console.error('Error fetching trending hashtags:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get hashtag details
  getHashtagDetails: async (tag) => {
    try {
      const response = await api.get(`/api/hashtags/${tag}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching details for hashtag ${tag}:`, error.response?.data || error.message);
      throw error;
    }
  }
};

export default searchService;