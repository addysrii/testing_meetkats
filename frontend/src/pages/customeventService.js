// src/services/customEventService.js
import api from './api';

const customEventService = {
  // Create a custom event form for an event
  createCustomForm: async (eventId, formData) => {
    try {
      const response = await api.postData(`/api/customevent/${eventId}/custom-form`, formData);
      return response;
    } catch (error) {
      console.error('Create custom form error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get a custom event form for an event
  getCustomForm: async (eventId) => {
    try {
      const response = await api.getData(`/api/customevent/${eventId}/custom-form`);
      return response;
    } catch (error) {
      console.error('Get custom form error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update a custom event form
  updateCustomForm: async (eventId, formId, formData) => {
    try {
      const response = await api.putData(`/api/customevent/${eventId}/custom-form/${formId}`, formData);
      return response;
    } catch (error) {
      console.error('Update custom form error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Delete a custom event form
  deleteCustomForm: async (eventId, formId) => {
    try {
      const response = await api.deleteData(`/api/customevent/${eventId}/custom-form/${formId}`);
      return response;
    } catch (error) {
      console.error('Delete custom form error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Submit a response to a custom form
  submitCustomForm: async (eventId, formData) => {
    try {
      const response = await api.postData(`/api/customevent/${eventId}/custom-form/submit`, formData);
      return response;
    } catch (error) {
      console.error('Submit custom form error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Upload a file for a custom form field
  uploadFormFile: async (eventId, file, fieldId) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fieldId', fieldId);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      const response = await api.postData(`/api/customevent/${eventId}/custom-form/upload`, formData, config);
      return response;
    } catch (error) {
      console.error('Upload form file error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get all submissions for an event
  getFormSubmissions: async (eventId, query = {}) => {
    try {
      const response = await api.getData(`/api/customevent/${eventId}/custom-form/submissions`, query);
      return response;
    } catch (error) {
      console.error('Get form submissions error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get a user's own submission
  getMySubmission: async (eventId) => {
    try {
      const response = await api.getData(`/api/customevent/${eventId}/custom-form/my-submission`);
      return response;
    } catch (error) {
      console.error('Get my submission error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get a specific submission
  getSubmission: async (eventId, submissionId) => {
    try {
      const response = await api.getData(`/api/customevent/${eventId}/custom-form/submissions/${submissionId}`);
      return response;
    } catch (error) {
      console.error('Get submission error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update submission status (approve/reject/waitlist)
  updateSubmissionStatus: async (eventId, submissionId, status, reviewNotes) => {
    try {
      const response = await api.putData(
        `/api/customevent/${eventId}/custom-form/submissions/${submissionId}/status`,
        { status, reviewNotes }
      );
      return response;
    } catch (error) {
      console.error('Update submission status error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Delete a submission
  deleteSubmission: async (eventId, submissionId) => {
    try {
      const response = await api.deleteData(`/api/customevent/${eventId}/custom-form/submissions/${submissionId}`);
      return response;
    } catch (error) {
      console.error('Delete submission error:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default customEventService;