// src/services/chatService.js
import api from './api';

// Helper function to normalize data (assuming this function exists in your web utils)
const normalizeData = (data) => {
  // If you have a data normalization utility, import and use it
  // For now, we'll just return the data as-is
  return data;
};

// Helper function to create FormData for file uploads
const createFormData = (data, fileKey, file) => {
  const formData = new FormData();
  
  // Add the text fields
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      formData.append(key, data[key]);
    }
  }
  
  // Add the file
  if (file) {
    formData.append(fileKey, file);
  }
  
  return formData;
};

const chatService = {
  // Get all chats for current user
  getChats: async () => {
    try {
      const response = await api.get('/api/chats');
      return normalizeData(response.data);
    } catch (error) {
      console.error('Get chats error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Get specific chat by ID
  getChat: async (chatId) => {
    try {
      if (!chatId) {
        throw new Error('Chat ID is required');
      }
      const response = await api.get(`/api/chats/${chatId}`);
      return normalizeData(response.data);
    } catch (error) {
      console.error('Get chat error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Create new chat
  createChat: async (data) => {
    try {
      const response = await api.post('/api/chats', data);
      return normalizeData(response.data);
    } catch (error) {
      console.error('Create chat error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Get messages for a chat
  getMessages: async (chatId, params = {}) => {
    try {
      if (!chatId) {
        throw new Error('Chat ID is required');
      }
      const response = await api.get(`/api/chats/${chatId}/messages`, { params });
      return normalizeData(response.data);
    } catch (error) {
      console.error('Get messages error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Send message in a chat
  sendMessage: async (chatId, data, media = null) => {
    try {
      if (!chatId) {
        throw new Error('Chat ID is required');
      }
      
      let response;
      
      if (media) {
        // Create FormData for file upload
        const formData = createFormData(data, 'media', media);
        
        // Send with media
        response = await api.post(`/api/chats/${chatId}/messages`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Send text-only message
        response = await api.post(`/api/chats/${chatId}/messages`, data);
      }
      
      return normalizeData(response.data);
    } catch (error) {
      console.error('Send message error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Update a message
  updateMessage: async (messageId, text) => {
    try {
      if (!messageId) {
        throw new Error('Message ID is required');
      }
      
      const response = await api.put(`/api/messages/${messageId}`, { text });
      return normalizeData(response.data);
    } catch (error) {
      console.error('Update message error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Delete a message
  deleteMessage: async (chatId, messageId, deleteForEveryone = false) => {
    try {
      if (!chatId || !messageId) {
        throw new Error('Chat ID and Message ID are required');
      }
      const response = await api.delete(
        `/api/chats/${chatId}/messages/${messageId}`,
        { params: { deleteForEveryone } }
      );
      return response.data;
    } catch (error) {
      console.error('Delete message error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Mark message as read
  markMessageAsRead: async (messageId) => {
    try {
      if (!messageId) {
        throw new Error('Message ID is required');
      }
      const response = await api.post(`/api/messages/${messageId}/read`);
      return response.data;
    } catch (error) {
      console.error('Mark read error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Add participant to chat
  addParticipant: async (chatId, userId) => {
    try {
      if (!chatId || !userId) {
        throw new Error('Chat ID and User ID are required');
      }
      const response = await api.post(`/api/chats/${chatId}/participants`, { userId });
      return normalizeData(response.data);
    } catch (error) {
      console.error('Add participant error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Remove participant from chat
  removeParticipant: async (chatId, userId) => {
    try {
      if (!chatId || !userId) {
        throw new Error('Chat ID and User ID are required');
      }
      const response = await api.delete(`/api/chats/${chatId}/participants/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Remove participant error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update chat details
  updateChat: async (chatId, data) => {
    try {
      if (!chatId) {
        throw new Error('Chat ID is required');
      }
      const response = await api.put(`/api/chats/${chatId}`, data);
      return normalizeData(response.data);
    } catch (error) {
      console.error('Update chat error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Delete chat
  deleteChat: async (chatId) => {
    try {
      if (!chatId) {
        throw new Error('Chat ID is required');
      }
      const response = await api.delete(`/api/chats/${chatId}`);
      return response.data;
    } catch (error) {
      console.error('Delete chat error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Setup end-to-end encryption for a chat
  setupChatEncryption: async (chatId, publicKey) => {
    try {
      if (!chatId || !publicKey) {
        throw new Error('Chat ID and public key are required');
      }
      const response = await api.post(`/api/chats/${chatId}/encrypt`, { publicKey });
      return response.data;
    } catch (error) {
      console.error('Setup encryption error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Set message retention period
  setMessageRetention: async (chatId, retentionPeriod) => {
    try {
      if (!chatId) {
        throw new Error('Chat ID is required');
      }
      const response = await api.put(`/api/chats/${chatId}/retention`, { retentionPeriod });
      return response.data;
    } catch (error) {
      console.error('Set message retention error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Set media access controls
  setMediaAccessControls: async (chatId, controls) => {
    try {
      if (!chatId) {
        throw new Error('Chat ID is required');
      }
      const response = await api.put(`/api/chats/${chatId}/media-controls`, controls);
      return response.data;
    } catch (error) {
      console.error('Set media controls error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get chat audit log
  getChatAuditLog: async (chatId) => {
    try {
      if (!chatId) {
        throw new Error('Chat ID is required');
      }
      const response = await api.get(`/api/chats/${chatId}/audit-log`);
      return normalizeData(response.data);
    } catch (error) {
      console.error('Get audit log error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Create self-destructing message
  createSelfDestructMessage: async (chatId, messageData) => {
    try {
      if (!chatId) {
        throw new Error('Chat ID is required');
      }
      const response = await api.post(`/api/chats/${chatId}/self-destruct`, messageData);
      return normalizeData(response.data);
    } catch (error) {
      console.error('Create self-destruct message error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Report security issue in chat
  reportSecurityIssue: async (chatId, issueData) => {
    try {
      if (!chatId) {
        throw new Error('Chat ID is required');
      }
      const response = await api.post(`/api/chats/${chatId}/report`, issueData);
      return response.data;
    } catch (error) {
      console.error('Report security issue error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Run security scan on chat
  runSecurityScan: async (chatId) => {
    try {
      if (!chatId) {
        throw new Error('Chat ID is required');
      }
      const response = await api.post(`/api/chats/${chatId}/security-scan`);
      return response.data;
    } catch (error) {
      console.error('Run security scan error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Secure file upload to chat
  secureFileUpload: async (chatId, file, metadata = {}) => {
    try {
      if (!chatId || !file) {
        throw new Error('Chat ID and file are required');
      }
      
      const formData = createFormData(metadata, 'file', file);
      
      const response = await api.post(`/api/chats/${chatId}/uploads`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return normalizeData(response.data);
    } catch (error) {
      console.error('Secure file upload error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Exchange encryption keys
  exchangeEncryptionKeys: async (chatId, keyData) => {
    try {
      if (!chatId) {
        throw new Error('Chat ID is required');
      }
      const response = await api.post(`/api/chats/${chatId}/keys/exchange`, keyData);
      return response.data;
    } catch (error) {
      console.error('Exchange encryption keys error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Set auto expiration for messages
  setAutoExpiration: async (chatId, expirationSettings) => {
    try {
      if (!chatId) {
        throw new Error('Chat ID is required');
      }
      const response = await api.post(`/api/chats/${chatId}/auto-expiration`, expirationSettings);
      return response.data;
    } catch (error) {
      console.error('Set auto expiration error:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default chatService;