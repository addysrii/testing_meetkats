// src/services/customEventService.js
import api from './api';

/**
 * Service for managing custom event forms and submissions
 */
const customEventService = {
  /**
   * Create a new custom event form for an event
   * @param {string} eventId - The ID of the event
   * @param {Object} formData - The form data with title, description, sections, fields, and settings
   * @returns {Promise} - Promise resolving to the created form
   */
// Modify the createCustomForm function in customEventService.js
// src/services/customEventService.js
createCustomForm: async (eventId, formData) => {
  try {
    const response = await api.post(`/api/customevent/${eventId}/custom-form`, formData);
    return response.data;
  } catch (error) {
    console.error('Error creating custom form:', error.response?.data || error.message);
    throw error;
  }
},

/**
 * Update an existing custom event form
 * @param {string} eventId - The ID of the event
 * @param {string} formId - The ID of the form to update
 * @param {Object} formData - The updated form data
 * @returns {Promise} - Promise resolving to the updated form
 */
updateCustomForm: async (eventId, formId, formData) => {
  try {
    const response = await api.put(`/api/customevent/${eventId}/custom-form/${formId}`, formData);
    return response.data;
  } catch (error) {
    console.error('Error updating custom form:', error.response?.data || error.message);
    throw error;
  }
},

  /**
   * Get a custom event form for an event
   * @param {string} eventId - The ID of the event
   * @returns {Promise} - Promise resolving to the form
   */
  
  getCustomForm: async (eventId) => {
    try {
      const response = await api.get(`/api/customevent/${eventId}/custom-form`);
      
      if (response.headers.get('content-type')?.includes('application/json')) {
        return response.data;
      } else {
        const errorText = await response.text();
        throw new Error(`Invalid response format: ${errorText.substring(0, 100)}`);
      }
    } catch (error) {
      console.error('Error getting custom form:', error);
      throw new Error(error.response?.data?.error || 'Failed to load form data');
    }
  },
  /**
   * Delete a custom event form
   * @param {string} eventId - The ID of the event
   * @param {string} formId - The ID of the form to delete
   * @returns {Promise} - Promise resolving to the result
   */
  deleteCustomForm: async (eventId, formId) => {
    try {
      const response = await api.delete(`/api/customevent/${eventId}/custom-form/${formId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting custom form:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Submit a response to a custom event form
   * @param {string} eventId - The ID of the event
   * @param {Object} submissionData - The submission data with responses
   * @returns {Promise} - Promise resolving to the submission result
   */
  submitCustomForm: async (eventId, submissionData) => {
    try {
      const response = await api.post(`/api/customevent/${eventId}/custom-form/submit`, submissionData);
      return response.data;
    } catch (error) {
      console.error('Error submitting custom form:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Upload a file for a custom form field
   * @param {string} eventId - The ID of the event
   * @param {File} file - The file to upload
   * @param {string} fieldId - The ID of the field
   * @returns {Promise} - Promise resolving to the upload result
   */
  uploadFormFile: async (eventId, file, fieldId) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fieldId', fieldId);
      
      const response = await api.post(`/api/customevent/${eventId}/custom-form/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error uploading form file:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get all submissions for an event
   * @param {string} eventId - The ID of the event
   * @param {Object} params - Query parameters like status, page, limit
   * @returns {Promise} - Promise resolving to the submissions
   */
  getFormSubmissions: async (eventId, params = {}) => {
    try {
      const response = await api.get(`/api/customevent/${eventId}/custom-form/submissions`, { params });
      return response.data;
    } catch (error) {
      console.error('Error getting form submissions:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get a specific submission
   * @param {string} eventId - The ID of the event
   * @param {string} submissionId - The ID of the submission
   * @returns {Promise} - Promise resolving to the submission
   */
  getSubmission: async (eventId, submissionId) => {
    try {
      const response = await api.get(`/api/customevent/${eventId}/custom-form/submissions/${submissionId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting submission:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get the current user's submission
   * @param {string} eventId - The ID of the event
   * @returns {Promise} - Promise resolving to the user's submission
   */
  getMySubmission: async (eventId) => {
    try {
      const response = await api.get(`/api/customevent/${eventId}/custom-form/my-submission`);
      return response.data;
    } catch (error) {
      console.error('Error getting my submission:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Update a submission's status
   * @param {string} eventId - The ID of the event
   * @param {string} submissionId - The ID of the submission
   * @param {string} status - The new status ('approved', 'rejected', 'waitlisted')
   * @param {string} reviewNotes - Optional review notes
   * @returns {Promise} - Promise resolving to the updated submission
   */
  updateSubmissionStatus: async (eventId, submissionId, status, reviewNotes = '') => {
    try {
      const response = await api.put(
        `/api/customevent/${eventId}/custom-form/submissions/${submissionId}/status`, 
        { status, reviewNotes }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating submission status:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Delete a submission
   * @param {string} eventId - The ID of the event
   * @param {string} submissionId - The ID of the submission
   * @returns {Promise} - Promise resolving to the deletion result
   */
  deleteSubmission: async (eventId, submissionId) => {
    try {
      const response = await api.delete(`/api/customevent/${eventId}/custom-form/submissions/${submissionId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting submission:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default customEventService;