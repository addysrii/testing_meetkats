// src/services/portfolioService.js
import api from './api';

/**
 * Utility function to normalize data by ensuring consistent id field
 * @param {Object|Array} data - The data to normalize
 * @returns {Object|Array} - Normalized data with consistent id field
 */
const normalizeData = (data) => {
  if (!data) return null;
  
  if (Array.isArray(data)) {
    return data.map(item => ({
      ...item,
      // Keep _id for backward compatibility but also provide id
      _id: item._id || item.id,
      id: item._id || item.id
    }));
  }
  
  return {
    ...data,
    // Keep _id for backward compatibility but also provide id
    _id: data._id || data.id,
    id: data._id || data.id
  };
};

/**
 * Utility function to create form data for file uploads
 * @param {Object} data - The data to include in form data
 * @param {string} fileField - The field name for the file
 * @param {File} file - The file to upload
 * @returns {FormData} - FormData object with all fields
 */
const createFormData = (data, fileField, file) => {
  const formData = new FormData();
  
  // Add regular data fields
  Object.keys(data).forEach(key => {
    formData.append(key, data[key]);
  });
  
  // Add file if provided
  if (file) {
    formData.append(fileField, file);
  }
  
  return formData;
};

/**
 * Utility function to handle multiple file uploads
 * @param {Object} data - The data to include in form data
 * @param {string} fileField - The base field name for the files
 * @param {Array<File>} files - The files to upload
 * @returns {FormData} - FormData object with all fields
 */
const createMultiFileFormData = (data, fileField, files) => {
  const formData = new FormData();
  
  // Add regular data fields
  Object.keys(data).forEach(key => {
    formData.append(key, data[key]);
  });
  
  // Add files if provided
  if (Array.isArray(files) && files.length > 0) {
    files.forEach((file, index) => {
      formData.append(`${fileField}[${index}]`, file);
    });
  }
  
  return formData;
};

/**
 * Standard error handler to provide consistent error logging
 * @param {Error} error - The error to handle
 * @param {string} operation - The operation that failed
 * @param {boolean} throwError - Whether to throw the error or return null
 * @returns {null|never} - Returns null or throws an error
 */
const handleError = (error, operation, throwError = true) => {
  console.error(`Error ${operation}:`, error.response?.data || error.message);
  
  // Provide detailed error logging
  if (error.response) {
    console.error('Server response:', error.response.data);
    console.error('Status code:', error.response.status);
  } else if (error.request) {
    console.error('No response received from server');
    console.warn('API might be unavailable, network issues or server down');
  }
  
  if (throwError) {
    throw error;
  }
  
  return null;
};

const portfolioService = {
  // User profile methods
  getUserInfo: async () => {
    try {
      const response = await api.get('/api/me');
      return normalizeData(response.data);
    } catch (error) {
      return handleError(error, 'fetching user info', false) || {
        _id: 'temp-user-id',
        username: 'User',
        email: '',
        avatar: ''
      };
    }
  },
  
  getProfile: async (userId) => {
    try {
      const response = await api.get(`/api/users/${userId}/profile`);
      return normalizeData(response.data);
    } catch (error) {
      return handleError(error, `fetching profile for user ${userId}`, false) || {
        user: { _id: userId },
        portfolio: { projects: [], achievements: [] }
      };
    }
  },

  // Get portfolio summary
  getPortfolioSummary: async (userId = null) => {
    try {
      const url = userId ? `/api/portfolio/summary?userId=${userId}` : '/api/portfolio/summary';
      
      const response = await api.get(url);
      
      if (!response.data) {
        throw new Error('Empty response received from server');
      }
      
      return normalizeData(response.data);
    } catch (error) {
      // If API is unavailable, we can return a minimal structure so the UI doesn't break
      if (!error.response || error.message === 'Network Error') {
        console.warn('API not available, returning empty portfolio summary structure');
        return {
          user: null,
          stats: {
            projects: { total: 0, public: 0, collaborations: 0 },
            achievements: { total: 0, public: 0, endorsed: 0 },
            streaks: { active: 0, completed: 0, totalCheckIns: 0 },
            recommendations: 0
          },
          skills: [],
          recentProjects: [],
          recentAchievements: [],
          activeStreaks: [],
          recommendations: []
        };
      }
      
      // For other types of errors, propagate them up
      return handleError(error, 'fetching portfolio summary');
    }
  },

  // Get projects
  getProjects: async (userId) => {
    try {
      const url = userId ? `/api/projects?userId=${userId}` : '/api/projects';
      const response = await api.get(url);
      return normalizeData(response.data);
    } catch (error) {
      return handleError(error, 'fetching projects', false) || [];
    }
  },
  
  // Get a single project
  getProject: async (projectId) => {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      const response = await api.get(`/api/projects/${projectId}`);
      return normalizeData(response.data);
    } catch (error) {
      return handleError(error, `fetching project ${projectId}`);
    }
  },
  
  // Create a new project with improved file upload handling
  createProject: async (projectData, attachments = []) => {
    try {
      let response;
      
      // Check if we have valid attachments
      const validAttachments = Array.isArray(attachments) ? attachments.filter(Boolean) : [];
      
      if (validAttachments.length > 0) {
        try {
          // Create FormData for file uploads - with enhanced error handling
          const formData = createMultiFileFormData(projectData, 'attachments', validAttachments);
          
          // Make the request with progress tracking
          response = await api.post('/api/projects', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
              // Calculate and log upload progress
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / (progressEvent.total || 1)
              );
              console.log(`Upload progress: ${percentCompleted}%`);
            },
            // Extended timeout for large files
            timeout: 120000, // 2 minutes
          });
        } catch (uploadError) {
          console.error('File upload error:', uploadError.message);
          
          // If it's a timeout error, provide a clearer message
          if (uploadError.code === 'ECONNABORTED') {
            throw new Error('The upload timed out. Please try with fewer or smaller files.');
          }
          
          // If it's a network error, check connection and retry with text only
          if (uploadError.message === 'Network Error') {
            console.log('Network error during file upload. Attempting text-only submission...');
            
            // Try submitting without files as fallback
            const textOnlyData = { ...projectData, filesSkipped: true };
            response = await api.post('/api/projects', textOnlyData);
            
            // If we get here, the text-only submission worked
            console.log('Text-only submission successful');
            
            // Return with a warning
            return {
              ...normalizeData(response.data),
              warning: 'Project was created without files due to network issues. Please try uploading files later.'
            };
          }
          
          // If it's another error, rethrow
          throw uploadError;
        }
      } else {
        // No attachments, regular request
        response = await api.post('/api/projects', projectData);
      }
      
      // Validate response
      if (!response || !response.data) {
        throw new Error('Invalid response received from server');
      }
      
      return normalizeData(response.data);
    } catch (error) {
      return handleError(error, 'creating project');
    }
  },
  
  // Update a project
  updateProject: async (projectId, projectData, attachments = []) => {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      
      let response;
      
      if (attachments && attachments.length > 0) {
        // Create enhanced FormData for file uploads
        const formData = createMultiFileFormData(projectData, 'attachments', attachments);
        
        // Send request with attachments
        response = await api.put(`/api/projects/${projectId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Send request without attachments
        response = await api.put(`/api/projects/${projectId}`, projectData);
      }
      
      return normalizeData(response.data);
    } catch (error) {
      return handleError(error, `updating project ${projectId}`);
    }
  },
  
  // Delete a project
  deleteProject: async (projectId) => {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      await api.delete(`/api/projects/${projectId}`);
      return true;
    } catch (error) {
      return handleError(error, `deleting project ${projectId}`);
    }
  },
  
  // Create an achievement with enhanced error handling
  createAchievement: async (achievementData, image = null) => {
    try {
      let response;
      
      if (image) {
        // Create FormData for image upload
        const formData = createFormData(achievementData, 'image', image);
        
        // Send request with image
        response = await api.post('/api/achievements', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Send request without image
        response = await api.post('/api/achievements', achievementData);
      }
      
      // Validate the response
      if (!response.data) {
        throw new Error('Empty response received from server');
      }
      
      return normalizeData(response.data);
    } catch (error) {
      return handleError(error, 'creating achievement');
    }
  },
  
  // Get achievements
  getAchievements: async (userId) => {
    try {
      const url = userId ? `/api/achievements?userId=${userId}` : '/api/achievements';
      const response = await api.get(url);
      return normalizeData(response.data);
    } catch (error) {
      return handleError(error, 'fetching achievements', false) || [];
    }
  },
  
  // Get a single achievement
  getAchievement: async (achievementId) => {
    try {
      if (!achievementId) {
        throw new Error('Achievement ID is required');
      }
      const response = await api.get(`/api/achievements/${achievementId}`);
      return normalizeData(response.data);
    } catch (error) {
      return handleError(error, `fetching achievement ${achievementId}`);
    }
  },
  
  // Update an achievement
  updateAchievement: async (achievementId, achievementData, image = null) => {
    try {
      if (!achievementId) {
        throw new Error('Achievement ID is required');
      }
      
      let response;
      
      if (image) {
        // Create enhanced FormData for image upload
        const formData = createFormData(achievementData, 'image', image);
        
        // Send request with image
        response = await api.put(`/api/achievements/${achievementId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Send request without image
        response = await api.put(`/api/achievements/${achievementId}`, achievementData);
      }
      
      return normalizeData(response.data);
    } catch (error) {
      return handleError(error, `updating achievement ${achievementId}`);
    }
  },
  
  // Delete an achievement
  deleteAchievement: async (achievementId) => {
    try {
      if (!achievementId) {
        throw new Error('Achievement ID is required');
      }
      await api.delete(`/api/achievements/${achievementId}`);
      return true;
    } catch (error) {
      return handleError(error, `deleting achievement ${achievementId}`);
    }
  },
  
  // Endorse an achievement
  endorseAchievement: async (achievementId) => {
    try {
      if (!achievementId) {
        throw new Error('Achievement ID is required');
      }
      const response = await api.post(`/api/achievements/${achievementId}/endorse`);
      return normalizeData(response.data);
    } catch (error) {
      return handleError(error, `endorsing achievement ${achievementId}`);
    }
  },
  
  // Streaks related methods
getUserStreaks: async (userId, options = {}) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Build query string
    const queryParams = new URLSearchParams({ userId });
    if (options.limit) {
      queryParams.append('limit', options.limit);
    }

    const url = `/api/streaks?${queryParams.toString()}`;

    const response = await api.get(url);
    return normalizeData(response.data);
  } catch (error) {
    return handleError(error, `fetching streaks for user ${userId}`, false) || { items: [] };
  }
},

  
  createStreak: async (streakData) => {
    try {
      const response = await api.post('/api/streaks', streakData);
      return normalizeData(response.data);
    } catch (error) {
      return handleError(error, 'creating streak');
    }
  },
  
  // Get streaks
  getStreaks: async () => {
    try {
      const response = await api.get('/api/streaks');
      return normalizeData(response.data);
    } catch (error) {
      return handleError(error, 'fetching streaks', false) || [];
    }
  },
  
  // Get a single streak
  getStreak: async (streakId) => {
    try {
      if (!streakId) {
        throw new Error('Streak ID is required');
      }
      const response = await api.get(`/api/streaks/${streakId}`);
      return normalizeData(response.data);
    } catch (error) {
      return handleError(error, `fetching streak ${streakId}`);
    }
  },
  
  // Update a streak
  updateStreak: async (streakId, streakData) => {
    try {
      if (!streakId) {
        throw new Error('Streak ID is required');
      }
      const response = await api.put(`/api/streaks/${streakId}`, streakData);
      return normalizeData(response.data);
    } catch (error) {
      return handleError(error, `updating streak ${streakId}`);
    }
  },
  
  // Delete a streak
  deleteStreak: async (streakId) => {
    try {
      if (!streakId) {
        throw new Error('Streak ID is required');
      }
      await api.delete(`/api/streaks/${streakId}`);
      return true;
    } catch (error) {
      return handleError(error, `deleting streak ${streakId}`);
    }
  },
  
  // Check in to a streak
  checkInToStreak: async (streakId, evidence = null) => {
    try {
      if (!streakId) {
        throw new Error('Streak ID is required');
      }
      
      let response;
      
      if (evidence) {
        // Create FormData for evidence upload
        const formData = createFormData({}, 'evidence', evidence);
        
        // Send request with evidence
        response = await api.post(`/api/streaks/${streakId}/checkin`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Send request without evidence
        response = await api.post(`/api/streaks/${streakId}/checkin`);
      }
      
      return normalizeData(response.data);
    } catch (error) {
      return handleError(error, `checking in to streak ${streakId}`);
    }
  },
  
  // Support someone's streak
  supportStreak: async (streakId) => {
    try {
      if (!streakId) {
        throw new Error('Streak ID is required');
      }
      const response = await api.post(`/api/streaks/${streakId}/support`);
      return normalizeData(response.data);
    } catch (error) {
      return handleError(error, `supporting streak ${streakId}`);
    }
  },
  
  // Add a skill
  addSkill: async (skillData) => {
    try {
      const response = await api.post('/api/skills', skillData);
      return normalizeData(response.data);
    } catch (error) {
      return handleError(error, 'adding skill');
    }
  },
  
  // Get skills
  getSkills: async () => {
    try {
      const response = await api.get('/api/skills');
      return normalizeData(response.data);
    } catch (error) {
      return handleError(error, 'fetching skills', false) || [];
    }
  },
  
  // Get user skills
  getUserSkills: async (userId) => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      const response = await api.get(`/api/users/${userId}/skills`);
      return normalizeData(response.data);
    } catch (error) {
      return handleError(error, `fetching skills for user ${userId}`, false) || [];
    }
  },
  
  // Remove a skill
  removeSkill: async (skillId) => {
    try {
      if (!skillId) {
        throw new Error('Skill ID is required');
      }
      await api.delete(`/api/skills/${skillId}`);
      return true;
    } catch (error) {
      return handleError(error, `removing skill ${skillId}`);
    }
  },
  
  // Endorse a skill
  endorseSkill: async (userId, skillName) => {
    try {
      if (!userId || !skillName) {
        throw new Error('User ID and skill name are required');
      }
      const response = await api.post(`/api/users/${userId}/skills/${encodeURIComponent(skillName)}/endorse`);
      return normalizeData(response.data);
    } catch (error) {
      return handleError(error, `endorsing skill`);
    }
  },
  
  // Remove skill endorsement
  removeEndorsement: async (skillId) => {
    try {
      if (!skillId) {
        throw new Error('Skill ID is required');
      }
      const response = await api.delete(`/api/skills/${skillId}/endorse`);
      return normalizeData(response.data);
    } catch (error) {
      return handleError(error, `removing skill endorsement`);
    }
  },
  
  // Create a recommendation
  createRecommendation: async (userId, recommendationData) => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      const response = await api.post(`/api/users/${userId}/recommendations`, recommendationData);
      return normalizeData(response.data);
    } catch (error) {
      return handleError(error, 'creating recommendation');
    }
  },
  
  // Get received recommendations
  getReceivedRecommendations: async () => {
    try {
      const response = await api.get('/api/recommendations/received');
      return normalizeData(response.data);
    } catch (error) {
      return handleError(error, 'fetching received recommendations', false) || [];
    }
  },
  
  // Get given recommendations
  getGivenRecommendations: async () => {
    try {
      const response = await api.get('/api/recommendations/given');
      return normalizeData(response.data);
    } catch (error) {
      return handleError(error, 'fetching given recommendations', false) || [];
    }
  },
  
  // Update a recommendation
  updateRecommendation: async (recommendationId, recommendationData) => {
    try {
      if (!recommendationId) {
        throw new Error('Recommendation ID is required');
      }
      const response = await api.put(`/api/recommendations/${recommendationId}`, recommendationData);
      return normalizeData(response.data);
    } catch (error) {
      return handleError(error, `updating recommendation ${recommendationId}`);
    }
  },
  
  // Delete a recommendation
  deleteRecommendation: async (recommendationId) => {
    try {
      if (!recommendationId) {
        throw new Error('Recommendation ID is required');
      }
      await api.delete(`/api/recommendations/${recommendationId}`);
      return true;
    } catch (error) {
      return handleError(error, `deleting recommendation ${recommendationId}`);
    }
  }
};

export default portfolioService;