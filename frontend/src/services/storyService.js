// src/services/storyService.js
import api from './api';
// import { normalizeData } from '../utils/dataUtils';
// Helper function to normalize MongoDB _id to id for frontend
const normalizeData = (data) => {
    // If no data or error response, return empty array
    if (!data || data.status === 'error') {
      return [];
    }
    
    // Check all possible locations where posts could be
    if (data.status === 'success' && data.data && Array.isArray(data.data.posts)) {
      // Standard format: { status: 'success', data: { posts: [...] } }
      return data.data.posts;
    } 
    else if (Array.isArray(data)) {
      // Direct array format
      return data;
    } 
    else if (data.data && Array.isArray(data.data)) {
      // Data property contains array: { data: [...] }
      return data.data;
    } 
    else if (data.posts && Array.isArray(data.posts)) {
      // Direct posts property: { posts: [...] }
      return data.posts;
    }
    
    // Return empty array if no recognized format
    return [];
  };
  

const storyService = {
  // Create new story
  createStory: async (storyData, mediaFile) => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add story data (privacy, caption, etc)
      Object.keys(storyData).forEach(key => {
        formData.append(key, storyData[key]);
      });
      
      // Add media file if provided - using standard web file objects
      if (mediaFile) {
        formData.append('media', mediaFile);
      }
      
      const response = await api.post('/api/stories', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      return normalizeData(response.data);
    } catch (error) {
      console.error('Error creating story:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get stories feed
  getStories: async (params = {}) => {
    try {
      const response = await api.get('/api/stories', { params });
      return normalizeData(response.data);
    } catch (error) {
      console.error('Error fetching stories:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get specific story
  getStory: async (storyId) => {
    try {
      const response = await api.get(`/api/stories/${storyId}`);
      return normalizeData(response.data);
    } catch (error) {
      console.error(`Error fetching story ${storyId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Delete a story
  deleteStory: async (storyId) => {
    try {
      const response = await api.delete(`/api/stories/${storyId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting story ${storyId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // View a story
  viewStory: async (storyId) => {
    try {
      const response = await api.post(`/api/stories/${storyId}/view`);
      return response.data;
    } catch (error) {
      console.error(`Error marking story ${storyId} as viewed:`, error.response?.data || error.message);
      // Fail silently for view tracking
      return { success: false };
    }
  },

  // React to a story
  reactToStory: async (storyId, reaction) => {
    try {
      const response = await api.post(`/api/stories/${storyId}/react`, { reaction });
      return response.data;
    } catch (error) {
      console.error(`Error reacting to story ${storyId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Reply to a story
  replyToStory: async (storyId, reply) => {
    try {
      const response = await api.post(`/api/stories/${storyId}/reply`, { reply });
      return response.data;
    } catch (error) {
      console.error(`Error replying to story ${storyId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Create a highlight collection
  createHighlight: async (highlightData, coverImage = null) => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add highlight data
      Object.keys(highlightData).forEach(key => {
        if (key === 'stories' && Array.isArray(highlightData.stories)) {
          formData.append('stories', JSON.stringify(highlightData.stories));
        } else {
          formData.append(key, highlightData[key]);
        }
      });
      
      // Add cover image if provided - using standard web file objects
      if (coverImage) {
        formData.append('coverImage', coverImage);
      }
      
      const response = await api.post('/api/highlights', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      return normalizeData(response.data);
    } catch (error) {
      console.error('Error creating highlight:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get user's highlight collections
  getHighlights: async (userId = null) => {
    try {
      const params = userId ? { userId } : {};
      const response = await api.get('/api/highlights', { params });
      return normalizeData(response.data);
    } catch (error) {
      console.error('Error fetching highlights:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get a specific highlight collection
  getHighlight: async (highlightId) => {
    try {
      const response = await api.get(`/api/highlights/${highlightId}`);
      return normalizeData(response.data);
    } catch (error) {
      console.error(`Error fetching highlight ${highlightId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Update a highlight collection
  updateHighlight: async (highlightId, updateData, coverImage = null) => {
    try {
      let response;
      
      if (coverImage) {
        // Create FormData for file upload
        const formData = new FormData();
        
        // Add update data
        Object.keys(updateData).forEach(key => {
          if (key === 'stories' && Array.isArray(updateData.stories)) {
            formData.append('stories', JSON.stringify(updateData.stories));
          } else {
            formData.append(key, updateData[key]);
          }
        });
        
        // Add cover image - using standard web file objects
        formData.append('coverImage', coverImage);
        
        response = await api.put(`/api/highlights/${highlightId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
      } else {
        // No file upload needed
        response = await api.put(`/api/highlights/${highlightId}`, updateData);
      }
      
      return normalizeData(response.data);
    } catch (error) {
      console.error(`Error updating highlight ${highlightId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Delete a highlight collection
  deleteHighlight: async (highlightId) => {
    try {
      const response = await api.delete(`/api/highlights/${highlightId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting highlight ${highlightId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Add story to highlight
  addStoryToHighlight: async (highlightId, storyId) => {
    try {
      const response = await api.post(`/api/highlights/${highlightId}/stories/${storyId}`);
      return response.data;
    } catch (error) {
      console.error(`Error adding story to highlight:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Remove story from highlight
  removeStoryFromHighlight: async (highlightId, storyId) => {
    try {
      const response = await api.delete(`/api/highlights/${highlightId}/stories/${storyId}`);
      return response.data;
    } catch (error) {
      console.error(`Error removing story from highlight:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Close friends management
  getCloseFriends: async () => {
    try {
      const response = await api.get('/api/close-friends');
      return normalizeData(response.data);
    } catch (error) {
      console.error('Error fetching close friends:', error.response?.data || error.message);
      throw error;
    }
  },

  // Add user to close friends
  addCloseFriend: async (userId) => {
    try {
      const response = await api.post(`/api/close-friends/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error adding close friend:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Remove user from close friends
  removeCloseFriend: async (userId) => {
    try {
      const response = await api.delete(`/api/close-friends/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error removing close friend:`, error.response?.data || error.message);
      throw error;
    }
  }
};

export default storyService;