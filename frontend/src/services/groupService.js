// src/services/groupService.js
import axios from 'axios';

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: 'https://your-api-url.com/api', // Replace with your actual API URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach auth token to every request
apiClient.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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

const groupService = {
  // Get all available groups
  getGroups: async () => {
    try {
      const response = await apiClient.get('/groups');
      return {
        ...response,
        data: normalizeData(response.data)
      };
    } catch (error) {
      console.error('Error fetching groups:', error);
      throw error;
    }
  },

  // Get user's groups
  getUserGroups: async () => {
    try {
      const response = await apiClient.get('/groups/my');
      return {
        ...response,
        data: normalizeData(response.data)
      };
    } catch (error) {
      console.error('Error fetching user groups:', error);
      throw error;
    }
  },

  // Get a specific group
  getGroup: async (groupId) => {
    try {
      const response = await apiClient.get(`/groups/${groupId}`);
      return {
        ...response,
        data: normalizeData(response.data)
      };
    } catch (error) {
      console.error(`Error fetching group ${groupId}:`, error);
      throw error;
    }
  },

  // Create a new group
  createGroup: async (formData) => {
    try {
      const response = await apiClient.post('/groups', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return {
        ...response,
        data: normalizeData(response.data)
      };
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  },

  // Update a group
  updateGroup: async (groupId, formData) => {
    try {
      const response = await apiClient.put(`/groups/${groupId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return {
        ...response,
        data: normalizeData(response.data)
      };
    } catch (error) {
      console.error(`Error updating group ${groupId}:`, error);
      throw error;
    }
  },

  // Delete a group
  deleteGroup: async (groupId) => {
    try {
      const response = await apiClient.delete(`/groups/${groupId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting group ${groupId}:`, error);
      throw error;
    }
  },

  // Get group posts
  getPosts: async (groupId) => {
    try {
      const response = await apiClient.get(`/groups/${groupId}/posts`);
      return {
        ...response,
        data: normalizeData(response.data)
      };
    } catch (error) {
      console.error(`Error fetching posts for group ${groupId}:`, error);
      throw error;
    }
  },

  // Create a post in a group
  createPost: async (groupId, formData) => {
    try {
      const response = await apiClient.post(`/groups/${groupId}/posts`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return {
        ...response,
        data: normalizeData(response.data)
      };
    } catch (error) {
      console.error(`Error creating post in group ${groupId}:`, error);
      throw error;
    }
  },

  // Get group members
  getMembers: async (groupId) => {
    try {
      const response = await apiClient.get(`/groups/${groupId}/members`);
      return {
        ...response,
        data: normalizeData(response.data)
      };
    } catch (error) {
      console.error(`Error fetching members for group ${groupId}:`, error);
      throw error;
    }
  },

  // Manage membership (join, leave, cancel request)
  manageMembership: async (groupId, data) => {
    try {
      const response = await apiClient.post(`/groups/${groupId}/membership`, data);
      return response.data;
    } catch (error) {
      console.error(`Error managing membership for group ${groupId}:`, error);
      throw error;
    }
  },

  // Update member role
  updateMemberRole: async (groupId, userId, role) => {
    try {
      const response = await apiClient.put(`/groups/${groupId}/members/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      console.error(`Error updating member role in group ${groupId}:`, error);
      throw error;
    }
  },

  // Remove a member from the group
  removeMember: async (groupId, userId) => {
    try {
      const response = await apiClient.delete(`/groups/${groupId}/members/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error removing member from group ${groupId}:`, error);
      throw error;
    }
  },

  // Get membership requests
  getMembershipRequests: async (groupId) => {
    try {
      const response = await apiClient.get(`/groups/${groupId}/membership-requests`);
      return {
        ...response,
        data: normalizeData(response.data)
      };
    } catch (error) {
      console.error(`Error fetching membership requests for group ${groupId}:`, error);
      throw error;
    }
  },

  // Respond to membership request
  respondToMembershipRequest: async (groupId, userId, accept) => {
    try {
      const response = await apiClient.put(`/groups/${groupId}/membership-requests/${userId}`, {
        accept
      });
      return response.data;
    } catch (error) {
      console.error(`Error responding to membership request in group ${groupId}:`, error);
      throw error;
    }
  },

  // Get group invites for current user
  getGroupInvites: async () => {
    try {
      const response = await apiClient.get('/groups/invites');
      return {
        ...response,
        data: normalizeData(response.data)
      };
    } catch (error) {
      console.error('Error fetching group invites:', error);
      throw error;
    }
  },

  // Invite user to a group
  inviteToGroup: async (groupId, userId) => {
    try {
      const response = await apiClient.post(`/groups/${groupId}/invite`, { userId });
      return response.data;
    } catch (error) {
      console.error(`Error inviting user to group ${groupId}:`, error);
      throw error;
    }
  }
};

export default groupService;