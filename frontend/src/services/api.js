// src/services/api.js
import axios from 'axios';

// Choose API URL based on environment
// const getApiUrl = () => {
//   console.log(`Environment: ${import.meta.env.MODE}`);
  
//   if (import.meta.env.MODE === 'development') {
//     return import.meta.env.VITE_DEV_API_URL || 'http://localhost:3000';
//   }

//   return import.meta.env.VITE_API_URL || 'https://new-backend-w86d.onrender.com';
// };

// const API_URL = getApiUrl();
const API_URL ='https://new-backend-w86d.onrender.com';
console.log(`API URL: ${API_URL}`);

// Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 60000, // 60 seconds
});

// Custom request methods
api.getData = async (url, params = {}) => {
  try {
    const response = await api.get(url, { params });
    return response.data;
  } catch (error) {
    console.error(`GET ${url} error:`, error.message);
    throw error;
  }
};

api.postData = async (url, data = {}, config = {}) => {
  try {
    const response = await api.post(url, data, config);
    return response.data;
  } catch (error) {
    console.error(`POST ${url} error:`, error.message);
    throw error;
  }
};

api.putData = async (url, data = {}, config = {}) => {
  try {
    const response = await api.put(url, data, config);
    return response.data;
  } catch (error) {
    console.error(`PUT ${url} error:`, error.message);
    throw error;
  }
};

api.deleteData = async (url, config = {}) => {
  try {
    const response = await api.delete(url, config);
    return response.data;
  } catch (error) {
    console.error(`DELETE ${url} error:`, error.message);
    throw error;
  }
};

api.patchData = async (url, data = {}, config = {}) => {
  try {
    const response = await api.patch(url, data, config);
    return response.data;
  } catch (error) {
    console.error(`PATCH ${url} error:`, error.message);
    throw error;
  }
};

// Test connection
export const testConnection = async () => {
  try {
    if (!navigator.onLine) {
      return {
        success: false,
        error: 'No internet connection',
        networkState: 'disconnected'
      };
    }

    const response = await axios.get(`${API_URL}/health`, {
      timeout: 10000,
      headers: {
        'Cache-Control': 'no-cache',
      },
    });

    return {
      success: response.status === 200,
      data: response.data,
      networkState: 'connected'
    };
  } catch (error) {
    if (error.response) {
      return {
        success: false,
        error: `Server error: ${error.response.status}`,
        details: error.response.data,
        networkState: 'connected-but-server-error'
      };
    }

    if (error.code === 'ECONNABORTED') {
      return {
        success: false,
        error: 'Connection timeout',
        networkState: 'timeout'
      };
    }

    return {
      success: false,
      error: error.message,
      networkState: 'unknown-error'
    };
  }
};

export const checkServerConnection = async () => {
  try {
    if (!navigator.onLine) {
      return {
        success: false,
        error: 'No internet connection'
      };
    }

    const response = await axios.get(`${API_URL}/health`, {
      timeout: 5000,
      headers: {
        'Cache-Control': 'no-cache',
      },
    });

    return {
      success: response.status === 200,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Interceptors
api.interceptors.request.use(
  async (config) => {
    try {
      if (config.headers['Content-Type'] === 'multipart/form-data') {
        config.timeout = 180000;
        delete config.headers['Content-Type'];
      }

      const token = localStorage.getItem('@auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      if (config.data instanceof FormData) {
        console.log('FormData contents:');
        for (let pair of config.data.entries()) {
          console.log(pair[0], pair[1]);
        }
      }

      return config;
    } catch (error) {
      return config;
    }
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.message === 'Network Error') {
      if (!navigator.onLine) {
        return Promise.reject(new Error('No internet connection.'));
      }

      const isServerUp = await checkServerConnection();
      if (!isServerUp.success) {
        return Promise.reject(new Error('Server is unreachable.'));
      }
    }

    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timed out.'));
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('@refresh_token');
        if (!refreshToken) throw new Error('No refresh token available');

        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken
        });

        const { token, refreshToken: newRefreshToken } = response.data;
        localStorage.setItem('@auth_token', token);
        if (newRefreshToken) {
          localStorage.setItem('@refresh_token', newRefreshToken);
        }

        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        error.isAuthError = true;
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
export { API_URL };
