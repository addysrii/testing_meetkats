// src/services/securityService.js
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

const securityService = {
  // Get security activity logs
  getSecurityActivity: async (filters = {}) => {
    try {
      const response = await apiClient.get('/security/activity', { params: filters });
      return {
        ...response,
        data: normalizeData(response.data)
      };
    } catch (error) {
      console.error('Error fetching security activity:', error);
      throw error;
    }
  },

  // Get active sessions
  getActiveSessions: async () => {
    try {
      const response = await apiClient.get('/security/sessions');
      return {
        ...response,
        data: normalizeData(response.data)
      };
    } catch (error) {
      console.error('Error fetching active sessions:', error);
      throw error;
    }
  },

  // Terminate a specific session
  terminateSession: async (sessionId) => {
    try {
      const response = await apiClient.delete(`/security/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error(`Error terminating session ${sessionId}:`, error);
      throw error;
    }
  },

  // Terminate all sessions except current
  terminateAllSessions: async () => {
    try {
      const response = await apiClient.post('/security/sessions/terminate-all');
      return response.data;
    } catch (error) {
      console.error('Error terminating all sessions:', error);
      throw error;
    }
  },

  // Set up chat encryption
  setupChatEncryption: async (publicKey) => {
    try {
      const response = await apiClient.post('/security/chat-encryption/setup', { publicKey });
      return response.data;
    } catch (error) {
      console.error('Error setting up chat encryption:', error);
      throw error;
    }
  },

  // Get encryption status
  getEncryptionStatus: async () => {
    try {
      const response = await apiClient.get('/security/chat-encryption/status');
      return response.data;
    } catch (error) {
      console.error('Error fetching encryption status:', error);
      throw error;
    }
  },

  // Toggle encryption
  toggleEncryption: async (enabled) => {
    try {
      const response = await apiClient.put('/security/chat-encryption/toggle', { enabled });
      return response.data;
    } catch (error) {
      console.error('Error toggling encryption:', error);
      throw error;
    }
  },

  // Get user's public key
  getUserPublicKey: async (userId) => {
    try {
      const response = await apiClient.get(`/security/chat-encryption/public-key/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching public key for user ${userId}:`, error);
      throw error;
    }
  },

  // Report content
  reportContent: async (reportData) => {
    try {
      const response = await apiClient.post('/reports', reportData);
      return response.data;
    } catch (error) {
      console.error('Error reporting content:', error);
      throw error;
    }
  },

  // Check password strength
  checkPasswordStrength: async (password) => {
    try {
      const response = await apiClient.post('/security/check-password', { password });
      return response.data;
    } catch (error) {
      console.error('Error checking password strength:', error);
      throw error;
    }
  },

  // Submit feedback
  submitFeedback: async (feedbackData) => {
    try {
      const response = await apiClient.post('/feedback', feedbackData);
      return response.data;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  },

  // Get security login history
  getLoginHistory: async (filters = {}) => {
    try {
      const response = await apiClient.get('/security/login-history', { params: filters });
      return {
        ...response,
        data: normalizeData(response.data)
      };
    } catch (error) {
      console.error('Error fetching login history:', error);
      throw error;
    }
  },

  // Two-factor authentication

  // Setup 2FA
  setup2FA: async () => {
    try {
      const response = await apiClient.post('/auth/2fa/setup');
      return response.data;
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      throw error;
    }
  },

  // Verify 2FA setup with code
  verify2FA: async (code) => {
    try {
      const response = await apiClient.post('/auth/2fa/verify', { code });
      return response.data;
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      throw error;
    }
  },

  // Disable 2FA
  disable2FA: async (code) => {
    try {
      const response = await apiClient.post('/auth/2fa/disable', { code });
      return response.data;
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      throw error;
    }
  },

  // Get 2FA backup codes
  getBackupCodes: async () => {
    try {
      const response = await apiClient.get('/auth/2fa/backup-codes');
      return response.data;
    } catch (error) {
      console.error('Error fetching backup codes:', error);
      throw error;
    }
  },

  // Regenerate backup codes
  regenerateBackupCodes: async () => {
    try {
      const response = await apiClient.post('/auth/2fa/backup-codes/regenerate');
      return response.data;
    } catch (error) {
      console.error('Error regenerating backup codes:', error);
      throw error;
    }
  },

  // Admin Features (will only work for admin users)

  // Get all reports
  getReports: async (filters = {}) => {
    try {
      const response = await apiClient.get('/reports', { params: filters });
      return {
        ...response,
        data: normalizeData(response.data)
      };
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  },

  // Update report status
  updateReportStatus: async (reportId, status, notes) => {
    try {
      const response = await apiClient.put(`/reports/${reportId}/status`, { status, notes });
      return {
        ...response,
        data: normalizeData(response.data)
      };
    } catch (error) {
      console.error(`Error updating report ${reportId}:`, error);
      throw error;
    }
  },

  // Get moderation queue
  getModerationQueue: async (filters = {}) => {
    try {
      const response = await apiClient.get('/moderation/queue', { params: filters });
      return {
        ...response,
        data: normalizeData(response.data)
      };
    } catch (error) {
      console.error('Error fetching moderation queue:', error);
      throw error;
    }
  },

  // Moderate content
  moderateContent: async (contentType, contentId, action, reason) => {
    try {
      const response = await apiClient.put(`/moderation/content/${contentType}/${contentId}`, { action, reason });
      return response.data;
    } catch (error) {
      console.error(`Error moderating ${contentType} content:`, error);
      throw error;
    }
  },

  // Remove content
  removeContent: async (contentType, contentId, reason) => {
    try {
      const response = await apiClient.delete(`/moderation/content/${contentType}/${contentId}`, {
        data: { reason }
      });
      return response.data;
    } catch (error) {
      console.error(`Error removing ${contentType} content:`, error);
      throw error;
    }
  },

  // Warn user
  warnUser: async (userId, reason, contentReference) => {
    try {
      const response = await apiClient.post(`/moderation/users/${userId}/warn`, {
        reason,
        contentReference
      });
      return response.data;
    } catch (error) {
      console.error(`Error warning user ${userId}:`, error);
      throw error;
    }
  },

  // Restrict user
  restrictUser: async (userId, reason, duration, restrictions) => {
    try {
      const response = await apiClient.post(`/moderation/users/${userId}/restrict`, {
        reason,
        duration,
        restrictions
      });
      return response.data;
    } catch (error) {
      console.error(`Error restricting user ${userId}:`, error);
      throw error;
    }
  },

  // Block user
  blockUser: async (userId, reason, duration) => {
    try {
      const response = await apiClient.post(`/moderation/users/${userId}/block`, {
        reason,
        duration
      });
      return response.data;
    } catch (error) {
      console.error(`Error blocking user ${userId}:`, error);
      throw error;
    }
  },

  // Unblock user
  unblockUser: async (userId, notes) => {
    try {
      const response = await apiClient.post(`/moderation/users/${userId}/unblock`, {
        notes
      });
      return response.data;
    } catch (error) {
      console.error(`Error unblocking user ${userId}:`, error);
      throw error;
    }
  },

  // Get user moderation history
  getUserModerationHistory: async (userId) => {
    try {
      const response = await apiClient.get(`/moderation/users/${userId}/history`);
      return {
        ...response,
        data: normalizeData(response.data)
      };
    } catch (error) {
      console.error(`Error fetching moderation history for user ${userId}:`, error);
      throw error;
    }
  },

  // Get feedback list (admin only)
  getFeedbackList: async (filters = {}) => {
    try {
      const response = await apiClient.get('/feedback', { params: filters });
      return {
        ...response,
        data: normalizeData(response.data)
      };
    } catch (error) {
      console.error('Error fetching feedback list:', error);
      throw error;
    }
  },

  // Update feedback status (admin only)
  updateFeedbackStatus: async (feedbackId, status, response) => {
    try {
      const apiResponse = await apiClient.put(`/feedback/${feedbackId}/status`, {
        status,
        response
      });
      return {
        ...apiResponse,
        data: normalizeData(apiResponse.data)
      };
    } catch (error) {
      console.error(`Error updating feedback ${feedbackId}:`, error);
      throw error;
    }
  },

  // Webhook management (admin only)
  createWebhook: async (webhookData) => {
    try {
      const response = await apiClient.post('/webhooks', webhookData);
      return {
        ...response,
        data: normalizeData(response.data)
      };
    } catch (error) {
      console.error('Error creating webhook:', error);
      throw error;
    }
  },

  getWebhooks: async () => {
    try {
      const response = await apiClient.get('/webhooks');
      return {
        ...response,
        data: normalizeData(response.data)
      };
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      throw error;
    }
  },

  updateWebhook: async (webhookId, webhookData) => {
    try {
      const response = await apiClient.put(`/webhooks/${webhookId}`, webhookData);
      return {
        ...response,
        data: normalizeData(response.data)
      };
    } catch (error) {
      console.error(`Error updating webhook ${webhookId}:`, error);
      throw error;
    }
  },

  deleteWebhook: async (webhookId) => {
    try {
      const response = await apiClient.delete(`/webhooks/${webhookId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting webhook ${webhookId}:`, error);
      throw error;
    }
  },

  testWebhook: async (webhookId) => {
    try {
      const response = await apiClient.post(`/webhooks/${webhookId}/test`);
      return response.data;
    } catch (error) {
      console.error(`Error testing webhook ${webhookId}:`, error);
      throw error;
    }
  },

  getWebhookLogs: async (webhookId, params = {}) => {
    try {
      const response = await apiClient.get(`/webhooks/${webhookId}/logs`, { params });
      return {
        ...response,
        data: normalizeData(response.data)
      };
    } catch (error) {
      console.error(`Error fetching logs for webhook ${webhookId}:`, error);
      throw error;
    }
  }
};

export default securityService;