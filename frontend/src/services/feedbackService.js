// src/services/feedbackService.js
import api from './api';

const feedbackService = {
  // Submit user feedback
  submitFeedback: async (feedbackData) => {
    try {
      const response = await api.post('/api/feedback', feedbackData);
      return response.data;
    } catch (error) {
      console.error('Error submitting feedback:', error.response?.data || error.message);
      throw error;
    }
  },

  // Submit bug report
  submitBugReport: async (bugData, screenshotFile = null) => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add bug data
      Object.keys(bugData).forEach(key => {
        formData.append(key, bugData[key]);
      });
      
      // Add screenshot if provided - web browser version
      if (screenshotFile) {
        formData.append('screenshot', screenshotFile);
      }
      
      const response = await api.post('/api/feedback/bug-report', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error submitting bug report:', error.response?.data || error.message);
      throw error;
    }
  },

  // Submit feature request
  submitFeatureRequest: async (featureData) => {
    try {
      const response = await api.post('/api/feedback/feature-request', featureData);
      return response.data;
    } catch (error) {
      console.error('Error submitting feature request:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get user's submitted feedback
  getUserFeedback: async () => {
    try {
      const response = await api.get('/api/feedback/my');
      return response.data;
    } catch (error) {
      console.error('Error fetching user feedback:', error.response?.data || error.message);
      throw error;
    }
  },

  // Report content
  reportContent: async (reportData, evidenceFiles = []) => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add report data
      Object.keys(reportData).forEach(key => {
        formData.append(key, reportData[key]);
      });
      
      // Add evidence files if provided - web browser version
      if (evidenceFiles && evidenceFiles.length > 0) {
        evidenceFiles.forEach((file, index) => {
          formData.append(`evidence_${index}`, file);
        });
      }
      
      const response = await api.post('/api/reports', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error reporting content:', error.response?.data || error.message);
      throw error;
    }
  },

  // Submit app rating
  submitAppRating: async (rating, comment = '') => {
    try {
      const response = await api.post('/api/feedback/app-rating', { rating, comment });
      return response.data;
    } catch (error) {
      console.error('Error submitting app rating:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get FAQs
  getFAQs: async (category = null) => {
    try {
      const params = category ? { category } : {};
      const response = await api.get('/api/faqs', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching FAQs:', error.response?.data || error.message);
      throw error;
    }
  },

  // Contact support
  contactSupport: async (supportData) => {
    try {
      const response = await api.post('/api/support/contact', supportData);
      return response.data;
    } catch (error) {
      console.error('Error contacting support:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get support ticket status
  getSupportTicket: async (ticketId) => {
    try {
      const response = await api.get(`/api/support/tickets/${ticketId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching support ticket ${ticketId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Get all user's support tickets
  getUserSupportTickets: async () => {
    try {
      const response = await api.get('/api/support/tickets');
      return response.data;
    } catch (error) {
      console.error('Error fetching user support tickets:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default feedbackService;