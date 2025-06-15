// src/services/authService.js
import api from './api';

// Constants for localStorage keys
const AUTH_TOKEN_KEY = '@auth_token';
const REFRESH_TOKEN_KEY = '@refresh_token';
const USER_DATA_KEY = '@user_data';

const authService = {
  // Login with email and password
  login: async (email, password) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    try {
      // Check network connectivity first
      if (!navigator.onLine) {
        throw new Error('No internet connection available');
      }
      
      console.log(`Attempting login for: ${email}`);
      const response = await api.post('/auth/login', { email, password });
      
      if (!response.data || !response.data.token) {
        console.error('Invalid login response:', response.data);
        throw new Error('Invalid response from server');
      }
      
      const { token, refreshToken, user } = response.data;
      
      // Store authentication data
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      }
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
      
      // Set token for future API calls
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log('Login successful');
      return { user, source: 'login' };
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      
      // Handle specific error cases with clear messages
      if (!error.response) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data?.error || 'Invalid login information');
      } else if (error.response?.status === 429) {
        throw new Error('Too many login attempts. Please try again later.');
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else {
        throw new Error('Login failed. Please try again.');
      }
    }
  },
  
  // Register new user
  signup: async (userData) => {
    if (!userData || !userData.email || !userData.password) {
      throw new Error('Email and password are required for signup');
    }
    
    try {
      console.log(`Attempting signup for: ${userData.email}`);
      const response = await api.post('/auth/signup', userData);
      
      if (!response.data || !response.data.token) {
        console.error('Invalid signup response:', response.data);
        throw new Error('Invalid response from server');
      }
      
      const { token, refreshToken, user } = response.data;
      
      // Store authentication data
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      }
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
      
      // Set token for future API calls
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log('Signup successful');
      return { user, source: 'signup' };
    } catch (error) {
      console.error('Signup error:', error.response?.data || error.message);
      
      // Handle specific error cases
      if (!error.response) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      if (error.response?.status === 400 && (
        error.response?.data?.error?.includes('exists') || 
        error.response?.data?.error?.includes('already')
      )) {
        throw new Error('An account with this email already exists');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data?.error || 'Invalid signup information');
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else {
        throw new Error('Signup failed. Please try again.');
      }
    }
  },
  
  // Logout user
  logout: async () => {
    try {
      // Try to notify the server about logout
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      
      if (token) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          await api.post('/auth/logout');
          console.log('Server logout successful');
        } catch (logoutError) {
          console.error('Server logout error:', logoutError.response?.data || logoutError.message);
          // Continue with local logout even if server logout fails
        }
      }
      
      // Always clear local storage
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
      
      // Clear auth header
      delete api.defaults.headers.common['Authorization'];
      
      console.log('Local logout successful');
      return true;
    } catch (error) {
      console.error('Logout error:', error.message);
      
      // Try to remove tokens anyway in case of error
      try {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_DATA_KEY);
        delete api.defaults.headers.common['Authorization'];
      } catch (storageError) {
        console.error('Failed to clear storage during logout:', storageError.message);
      }
      
      throw error;
    }
  },
  
  // Parse JWT token to get user info
  parseJwt: (token) => {
    try {
      if (!token) return null;
      
      // JWT tokens are base64Url encoded, split by dots into header, payload, and signature
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;
      
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      
      // Using atob (base64 decoder) to decode the base64 string
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT token:', error);
      return null;
    }
  },
  
  // Check if user has valid authentication
  isAuthenticated: () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return false;
    
    try {
      // Check if token is expired
      const payload = authService.parseJwt(token);
      if (!payload || !payload.exp) return false;
      
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  },
  
  // Get current user data from localStorage
  getCurrentUser: () => {
    try {
      const userData = localStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Get user error:', error.message);
      return null;
    }
  },
  
  // Update the local user data
  // Update the local user data (continued)
  updateLocalUserData: (userData) => {
    try {
      if (!userData) {
        throw new Error('User data is required');
      }
      
      // Get existing data and merge with new data
      const existingData = localStorage.getItem(USER_DATA_KEY);
      const existingUserData = existingData ? JSON.parse(existingData) : {};
      const updatedUserData = { ...existingUserData, ...userData };
      
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUserData));
      return updatedUserData;
    } catch (error) {
      console.error('Update user data error:', error.message);
      throw error;
    }
  },
  
  // Send phone verification code
  sendPhoneVerificationCode: async (userId, phoneNumber) => {
    if (!userId || !phoneNumber) {
      throw new Error('User ID and phone number are required');
    }
    
    try {
      console.log(`Sending verification code to phone: ${phoneNumber} for user: ${userId}`);
      const response = await api.post('/auth/phone/send-code', { userId, phoneNumber });
      return response.data;
    } catch (error) {
      console.error('Send phone verification code error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Verify phone code
  verifyPhoneCode: async (userId, code) => {
    if (!userId || !code) {
      throw new Error('User ID and verification code are required');
    }
    
    try {
      console.log(`Verifying phone code: ${code} for user: ${userId}`);
      const response = await api.post('/auth/phone/verify', { userId, code });
      return response.data;
    } catch (error) {
      console.error('Verify phone code error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Refresh auth token
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      console.log('Attempting to refresh token');
      const response = await api.post('/auth/refresh-token', { refreshToken });
      
      if (!response.data || !response.data.token) {
        throw new Error('Invalid refresh token response');
      }
      
      const { token, refreshToken: newRefreshToken } = response.data;
      
      // Update tokens in storage
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      if (newRefreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
      }
      
      // Update auth header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log('Token refresh successful');
      return { token, refreshToken: newRefreshToken };
    } catch (error) {
      console.error('Refresh token error:', error.response?.data || error.message);
      
      // If refresh fails, clear tokens and force re-login
      if (error.response?.status === 401) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        delete api.defaults.headers.common['Authorization'];
      }
      
      throw error;
    }
  },
  
  // Process the OAuth callback parameters
  processOAuthCallback: (searchParams) => {
    try {
      // Extract parameters
      const token = searchParams.get('token');
      const refreshToken = searchParams.get('refreshToken');
      const provider = searchParams.get('provider');
      const isNewUser = searchParams.get('new') === 'true';
      
      if (!token) {
        return { success: false, error: 'No token provided' };
      }
      
      // Store tokens
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      }
      
      // Update auth header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Extract basic user data from token
      const payload = authService.parseJwt(token);
      if (!payload) {
        return { success: false, error: 'Invalid token format' };
      }
      
      // Construct basic user object
      const userData = {
        id: payload.id || payload.sub,
        email: payload.email || '',
        firstName: payload.firstName || payload.given_name || '',
        lastName: payload.lastName || payload.family_name || '',
        role: payload.role || 'user'
      };
      
      // Store user data
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
      
      return {
        success: true,
        token,
        refreshToken,
        user: userData,
        isNewUser,
        provider
      };
    } catch (error) {
      console.error('Error processing OAuth callback:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Setup API interceptor for token refresh
  setupTokenRefresh: () => {
    let isRefreshing = false;
    let refreshSubscribers = [];
      
    // Subscribe to token refresh
    const subscribeTokenRefresh = (callback) => {
      refreshSubscribers.push(callback);
    };
      
    // Notify subscribers that token has been refreshed
    const onTokenRefreshed = (token) => {
      refreshSubscribers.map(callback => callback(token));
      refreshSubscribers = [];
    };
      
    // Add request interceptor for 401 responses
    api.interceptors.response.use(
      response => response,
      async error => {
        // Return immediately if request was to the refresh token endpoint
        if (error.config.url.includes('/auth/refresh-token')) {
          return Promise.reject(error);
        }
          
        // Handle 401 responses (Unauthorized)
        if (error.response?.status === 401 && !error.config._retry) {
          if (!isRefreshing) {
            isRefreshing = true;
              
            try {
              // Try to refresh the token
              const { token } = await authService.refreshToken();
                
              // Update API headers with new token
              api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                
              // Update original request config
              error.config.headers['Authorization'] = `Bearer ${token}`;
              error.config._retry = true;
                
              // Notify subscribers with new token
              onTokenRefreshed(token);
                
              // Retry the original failed request
              return api(error.config);
            } catch (refreshError) {
              // Failed to refresh token, redirect to login
              console.error('Failed to refresh token:', refreshError);
                
              // Clear auth data
              localStorage.removeItem(AUTH_TOKEN_KEY);
              localStorage.removeItem(REFRESH_TOKEN_KEY);
              localStorage.removeItem(USER_DATA_KEY);
              delete api.defaults.headers.common['Authorization'];
                
              // Redirect to login (use window.location since we're outside React)
              window.location.href = '/login?session=expired';
                
              return Promise.reject(refreshError);
            } finally {
              isRefreshing = false;
            }
          } else {
            // If we're already refreshing, wait for the new token
            return new Promise(resolve => {
              subscribeTokenRefresh(token => {
                // Update request with new token
                error.config.headers['Authorization'] = `Bearer ${token}`;
                error.config._retry = true;
                  
                // Retry the original request
                resolve(api(error.config));
              });
            });
          }
        }
          
        // For all other errors, just pass through
        return Promise.reject(error);
      }
    );
  }
};

// Initialize token refresh interceptor
authService.setupTokenRefresh();

export default authService;