// src/utils/dataUtils.js

/**
 * Normalize data from API response
 * @param {any} data - Data to normalize
 * @returns {any} - Normalized data
 */
export const normalizeData = (data) => {
    // If it's an array, normalize each item
    if (Array.isArray(data)) {
      return data.map(item => normalizeItem(item));
    }
    // If it's an object, normalize it
    else if (data && typeof data === 'object') {
      return normalizeItem(data);
    }
    // Otherwise, return as is
    return data;
  };
  
  /**
   * Normalize a single item
   * @param {Object} item - Item to normalize
   * @returns {Object} - Normalized item
   */
  const normalizeItem = (item) => {
    // Convert _id to id if it exists
    if (item._id && !item.id) {
      item.id = item._id;
    }
    
    // Handle nested objects or arrays
    Object.keys(item).forEach(key => {
      if (item[key] && typeof item[key] === 'object') {
        item[key] = normalizeData(item[key]);
      }
    });
    
    return item;
  };
  
  /**
   * Create FormData for single file upload
   * @param {Object} data - The data object to include in FormData
   * @param {string} fileField - The name of the file field
   * @param {Object} file - The file object to upload
   * @returns {FormData} - FormData object with data and file
   */
  export const createFormData = (data, fileField, file) => {
    const formData = new FormData();
    
    // Add non-file fields to FormData
    Object.keys(data).forEach(key => {
      // Handle arrays and objects by stringifying them
      if (typeof data[key] === 'object' && data[key] !== null) {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    });
    
    // Add file if provided
    if (file) {
      // Handle React Native image picker format
      if (file.uri) {
        const fileObj = {
          uri: file.uri,
          type: file.type || 'image/jpeg', // Default to jpeg if type is missing
          name: file.fileName || file.name || 'file.jpg' // Default name if fileName is missing
        };
        formData.append(fileField, fileObj);
      } else {
        // Handle standard file object
        formData.append(fileField, file);
      }
    }
    
    return formData;
  };
  
  
  export const createMultiFileFormData = (data, filesField, files) => {
    const formData = new FormData();
    
    // Add non-file fields to FormData
    Object.keys(data).forEach(key => {
      // Handle arrays and objects by stringifying them
      if (typeof data[key] === 'object' && data[key] !== null) {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    });
    
    // Add files if provided
    if (files && files.length > 0) {
      files.forEach((file, index) => {
        try {
          // Check if file exists and has required properties
          if (!file || !file.uri) {
            console.warn(`File at index ${index} is invalid:`, file);
            return; // Skip this file
          }
          
          // Convert HEIC files to JPEG if applicable
          const fileExtension = file.uri.split('.').pop().toLowerCase();
          const fileName = file.fileName || file.name || `file-${index}.${fileExtension}`;
          const mimeType = getMimeType(fileName, file.type || file.mimeType);
          
          // Create file object for FormData
          const fileObj = {
            uri: file.uri,
            type: mimeType,
            name: fileName
          };
          
          // Log file details for debugging
          console.log(`Attaching file: ${fileName}, type: ${mimeType}, size: ${file.fileSize || 'unknown'}`);
          
          // Append to form data
          formData.append(filesField, fileObj);
        } catch (error) {
          console.error(`Error processing file at index ${index}:`, error);
          // Continue with other files rather than failing completely
        }
      });
    }
    
    return formData;
  };
  
  /**
   * Get the correct MIME type for a file
   * @param {string} fileName - The name of the file
   * @param {string} defaultType - Default MIME type if none can be determined
   * @returns {string} - The MIME type
   */
  const getMimeType = (fileName, defaultType = 'application/octet-stream') => {
    if (!fileName) return defaultType;
    
    const extension = fileName.split('.').pop().toLowerCase();
    
    const mimeTypes = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'heic': 'image/heic',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'txt': 'text/plain',
      'zip': 'application/zip',
      'mp4': 'video/mp4',
      'mp3': 'audio/mpeg'
    };
    
    return mimeTypes[extension] || defaultType;
  };
  
  /**
   * Safely get file name from URI
   * @param {string} uri - File URI
   * @returns {string} - File name
   */
  export const getFileNameFromUri = (uri) => {
    if (!uri) return 'file';
    
    // Try to extract file name from URI
    try {
      // Remove query parameters if any
      const purePath = uri.split('?')[0];
      // Get the last segment as file name
      return purePath.split('/').pop();
    } catch (e) {
      console.error('Error extracting filename from URI:', e);
      return 'file';
    }
  };
  
  /**
   * Validate API response
   * @param {Object} response - API response object
   * @returns {Object} - Validated response
   * @throws {Error} - If response is invalid
   */
  export const validateResponse = (response) => {
    if (!response) {
      throw new Error('Empty response received');
    }
    
    if (!response.data) {
      throw new Error('Empty data in response');
    }
    
    return response;
  };
  
  /**
   * Format error message from API error
   * @param {Error} error - Error object
   * @returns {string} - Formatted error message
   */
  export const formatErrorMessage = (error) => {
    if (error.response && error.response.data && error.response.data.error) {
      return error.response.data.error;
    }
    
    if (error.message) {
      return error.message;
    }
    
    return 'An unknown error occurred';
  };
  
  /**
   * Log detailed error information
   * @param {Error} error - Error object
   * @param {string} context - Context description for the error
   */
  export const logDetailedError = (error, context) => {
    console.error(`${context}:`, error);
    
    if (error.response) {
      console.error('Server response:', error.response.data);
      console.error('Status code:', error.response.status);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received. Request:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    
    console.error('Error stack:', error.stack);
  };