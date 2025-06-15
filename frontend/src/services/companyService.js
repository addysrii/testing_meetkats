// src/services/companyService.js
import api from './api';

// Helper function to normalize data (implement based on your needs)
const normalizeData = (data) => {
  // If you have a data normalization utility, import and use it
  // For now, we'll just return the data as-is
  return data;
};

const companyService = {
  // Get all companies
  getCompanies: async () => {
    try {
      const response = await api.get('/api/companies');
      return normalizeData(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get a specific company by ID
  getCompany: async (companyId) => {
    try {
      if (!companyId) {
        throw new Error('Company ID is required');
      }
      const response = await api.get(`/api/companies/${companyId}`);
      return normalizeData(response.data);
    } catch (error) {
      console.error(`Error fetching company ${companyId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Create a new company
  createCompany: async (data, files = {}) => {
    try {
      // Handle file uploads (logo and coverImage)
      const formData = new FormData();
      
      // Add company data
      Object.keys(data).forEach(key => {
        if (key !== 'logo' && key !== 'coverImage') {
          formData.append(key, data[key]);
        }
      });
      
      // Add logo if provided
      if (files.logo) {
        formData.append('logo', files.logo);
      }
      
      // Add cover image if provided
      if (files.coverImage) {
        formData.append('coverImage', files.coverImage);
      }
      
      const response = await api.post('/api/companies', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return normalizeData(response.data);
    } catch (error) {
      console.error('Error creating company:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update a company
  updateCompany: async (companyId, data, files = {}) => {
    try {
      if (!companyId) {
        throw new Error('Company ID is required');
      }
      
      // Handle file uploads (logo and coverImage)
      const formData = new FormData();
      
      // Add company data
      Object.keys(data).forEach(key => {
        if (key !== 'logo' && key !== 'coverImage') {
          formData.append(key, data[key]);
        }
      });
      
      // Add logo if provided
      if (files.logo) {
        formData.append('logo', files.logo);
      }
      
      // Add cover image if provided
      if (files.coverImage) {
        formData.append('coverImage', files.coverImage);
      }
      
      const response = await api.put(`/api/companies/${companyId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return normalizeData(response.data);
    } catch (error) {
      console.error(`Error updating company ${companyId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Delete a company
  deleteCompany: async (companyId) => {
    try {
      if (!companyId) {
        throw new Error('Company ID is required');
      }
      const response = await api.delete(`/api/companies/${companyId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting company ${companyId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Get companies owned/managed by current user
  getUserCompanies: async () => {
    try {
      const response = await api.get('/api/companies/my');
      return normalizeData(response.data);
    } catch (error) {
      console.error('Error fetching user companies:', error.response?.data || error.message);
      throw error;
    }
  },

  // Add an employee to a company
  addEmployee: async (companyId, employeeData) => {
    try {
      if (!companyId) {
        throw new Error('Company ID is required');
      }
      const response = await api.post(`/api/companies/${companyId}/employees`, employeeData);
      return normalizeData(response.data);
    } catch (error) {
      console.error(`Error adding employee to company ${companyId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Get employees of a company
  getEmployees: async (companyId) => {
    try {
      if (!companyId) {
        throw new Error('Company ID is required');
      }
      const response = await api.get(`/api/companies/${companyId}/employees`);
      return normalizeData(response.data);
    } catch (error) {
      console.error(`Error fetching employees for company ${companyId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Remove an employee from a company
  removeEmployee: async (companyId, employeeId) => {
    try {
      if (!companyId || !employeeId) {
        throw new Error('Company ID and Employee ID are required');
      }
      const response = await api.delete(`/api/companies/${companyId}/employees/${employeeId}`);
      return response.data;
    } catch (error) {
      console.error(`Error removing employee from company ${companyId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Verify an employee
  verifyEmployee: async (companyId, employeeId) => {
    try {
      if (!companyId || !employeeId) {
        throw new Error('Company ID and Employee ID are required');
      }
      const response = await api.put(`/api/companies/${companyId}/employees/${employeeId}/verify`);
      return response.data;
    } catch (error) {
      console.error(`Error verifying employee in company ${companyId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Update employee role
  updateEmployeeRole: async (companyId, userId, role) => {
    try {
      if (!companyId || !userId || !role) {
        throw new Error('Company ID, User ID, and Role are required');
      }
      const response = await api.put(`/api/companies/${companyId}/employees/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      console.error(`Error updating employee role:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Add an admin to a company
  addAdmin: async (companyId, userId) => {
    try {
      if (!companyId || !userId) {
        throw new Error('Company ID and User ID are required');
      }
      const response = await api.post(`/api/companies/${companyId}/admins/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error adding admin to company ${companyId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Remove an admin from a company
  removeAdmin: async (companyId, userId) => {
    try {
      if (!companyId || !userId) {
        throw new Error('Company ID and User ID are required');
      }
      const response = await api.delete(`/api/companies/${companyId}/admins/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error removing admin from company ${companyId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Follow a company
  followCompany: async (companyId) => {
    try {
      if (!companyId) {
        throw new Error('Company ID is required');
      }
      const response = await api.post(`/api/companies/${companyId}/follow`);
      return response.data;
    } catch (error) {
      console.error(`Error following company ${companyId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Unfollow a company
  unfollowCompany: async (companyId) => {
    try {
      if (!companyId) {
        throw new Error('Company ID is required');
      }
      const response = await api.delete(`/api/companies/${companyId}/follow`);
      return response.data;
    } catch (error) {
      console.error(`Error unfollowing company ${companyId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Get followed companies
  getFollowedCompanies: async () => {
    try {
      const response = await api.get('/api/companies/following');
      return normalizeData(response.data);
    } catch (error) {
      console.error('Error fetching followed companies:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get company followers
  getFollowers: async (companyId) => {
    try {
      if (!companyId) {
        throw new Error('Company ID is required');
      }
      const response = await api.get(`/api/companies/${companyId}/followers`);
      return normalizeData(response.data);
    } catch (error) {
      console.error(`Error fetching followers for company ${companyId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Create a company review
  createCompanyReview: async (companyId, reviewData) => {
    try {
      if (!companyId) {
        throw new Error('Company ID is required');
      }
      const response = await api.post(`/api/companies/${companyId}/reviews`, reviewData);
      return normalizeData(response.data);
    } catch (error) {
      console.error(`Error creating review for company ${companyId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Get company reviews
  getCompanyReviews: async (companyId) => {
    try {
      if (!companyId) {
        throw new Error('Company ID is required');
      }
      const response = await api.get(`/api/companies/${companyId}/reviews`);
      return normalizeData(response.data);
    } catch (error) {
      console.error(`Error fetching reviews for company ${companyId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Update company review
  updateCompanyReview: async (reviewId, reviewData) => {
    try {
      if (!reviewId) {
        throw new Error('Review ID is required');
      }
      const response = await api.put(`/api/companies/reviews/${reviewId}`, reviewData);
      return normalizeData(response.data);
    } catch (error) {
      console.error(`Error updating company review:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Delete company review
  deleteCompanyReview: async (reviewId) => {
    try {
      if (!reviewId) {
        throw new Error('Review ID is required');
      }
      const response = await api.delete(`/api/companies/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting company review:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Report salary at a company
  reportSalary: async (companyId, salaryData) => {
    try {
      if (!companyId) {
        throw new Error('Company ID is required');
      }
      const response = await api.post(`/api/companies/${companyId}/salaries`, salaryData);
      return response.data;
    } catch (error) {
      console.error(`Error reporting salary for company ${companyId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Get company salaries
  getCompanySalaries: async (companyId) => {
    try {
      if (!companyId) {
        throw new Error('Company ID is required');
      }
      const response = await api.get(`/api/companies/${companyId}/salaries`);
      return normalizeData(response.data);
    } catch (error) {
      console.error(`Error fetching salaries for company ${companyId}:`, error.response?.data || error.message);
      throw error;
    }
  },
  
  // Get all jobs for a specific company
  getCompanyJobs: async (companyId) => {
    try {
      if (!companyId) {
        throw new Error('Company ID is required');
      }
      const response = await api.get(`/api/companies/${companyId}/jobs`);
      return normalizeData(response.data);
    } catch (error) {
      console.error(`Error fetching jobs for company ${companyId}:`, error.response?.data || error.message);
      throw error;
    }
  }
};

export default companyService;