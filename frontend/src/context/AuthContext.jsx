// frontend/src/context/AuthContext.jsx - Updated
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Initialize user state from localStorage immediately to prevent flicker
  const initialUserData = localStorage.getItem('@user_data');
  const [user, setUser] = useState(initialUserData ? JSON.parse(initialUserData) : null);
  const [token, setToken] = useState(localStorage.getItem('@auth_token'));
  const [loading, setLoading] = useState(true);
  const [isNewSignup, setIsNewSignup] = useState(false);
  const navigate = useNavigate();

  // Load user info when token changes or on initial mount
  useEffect(() => {
    const loadUserInfo = async () => {
      if (token) {
        try {
          // Set authorization header for API requests
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Try to get user data from localStorage first
          const userData = localStorage.getItem('@user_data');
          if (userData) {
            try {
              const parsedUserData = JSON.parse(userData);
              setUser(parsedUserData);
              console.log('User data loaded from localStorage:', parsedUserData);
            } catch (parseError) {
              console.error('Error parsing user data from localStorage:', parseError);
              await fetchUserDataFromToken();
            }
          } else {
            // No user data in localStorage, try to extract from token
            await fetchUserDataFromToken();
          }
        } catch (error) {
          console.error('Failed to load user info:', error);
          performLocalLogout();
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    // Helper function to fetch user data from token
    const fetchUserDataFromToken = async () => {
      try {
        // Extract user info from token
        const payload = authService.parseJwt(token);
        
        if (payload && payload.id) {
          // Create a basic user object from the token
          const basicUserData = {
            id: payload.id,
            email: payload.email || '',
            firstName: payload.firstName || '',
            lastName: payload.lastName || '',
            role: payload.role || 'user'
          };
          
          // Store this basic user data
          localStorage.setItem('@user_data', JSON.stringify(basicUserData));
          setUser(basicUserData);
          console.log('Basic user data extracted from token');
        } else {
          throw new Error('Invalid token payload');
        }
      } catch (error) {
        console.error('Error extracting user data from token:', error);
        throw error;
      }
    };

    loadUserInfo();
  }, [token]);
  
  const login = async (email, password) => {
    try {
      // Call authService.login with separate email and password parameters
      const response = await authService.login(email, password);
      
      // Get token from localStorage (set by authService)
      const currentToken = localStorage.getItem('@auth_token');
      setToken(currentToken);
      setUser(response.user);
      
      // Store user data in localStorage
      localStorage.setItem('@user_data', JSON.stringify(response.user));
      
      setIsNewSignup(false);
      return { token: currentToken, user: response.user };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (userData) => {
    try {
      // Use authService.signup which returns { user, source }
      const response = await authService.signup(userData);
      
      // Get token from localStorage (set by authService)
      const currentToken = localStorage.getItem('@auth_token');
      setToken(currentToken);
      setUser(response.user);
      
      // Store user data in localStorage
      localStorage.setItem('@user_data', JSON.stringify(response.user));
      
      // Determine if this is a new user based on the response
      const isNewUser = response.source === 'signup';
      setIsNewSignup(isNewUser);
      
      return isNewUser;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = (callServer = true) => {
    console.log('Logging out, callServer:', callServer);
    
    if (callServer) {
      // Use authService.logout which handles both server and local logout
      authService.logout().then(() => {
        performLocalLogout();
      }).catch(error => {
        console.error('Server logout error:', error);
        // Still clear state even if server logout fails
        performLocalLogout();
      });
    } else {
      // Skip server call, just do local logout
      performLocalLogout();
    }
  };

  const performLocalLogout = () => {
    // Clear all auth-related data
    localStorage.removeItem('@auth_token');
    localStorage.removeItem('@user_data');
    localStorage.removeItem('@refresh_token');
    
    // Reset state
    setToken(null);
    setUser(null);
    setIsNewSignup(false);
    
    // Clear authorization header
    delete api.defaults.headers.common['Authorization'];
    
    console.log('Local logout complete, redirecting to login');
    navigate('/login');
  };

  const updateUser = async (userData) => {
    try {
      // Update local user data through authService
      const updatedUser = await authService.updateLocalUserData(userData);
      setUser(updatedUser);
      
      // Update localStorage
      localStorage.setItem('@user_data', JSON.stringify(updatedUser));
      
      // When user updates profile, reset new signup flag
      if (isNewSignup) {
        setIsNewSignup(false);
      }
      
      return updatedUser;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  const handleAuthCallback = async (searchParams) => {
    console.log('Auth callback triggered', searchParams.toString());
    
    // Extract tokens from URL
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    const provider = searchParams.get('provider');
    const isNewUser = searchParams.get('new') === 'true';
    const error = searchParams.get('error');
    
    // Check for error
    if (error) {
      console.error('Auth error in callback params:', error);
      throw new Error(error);
    }
    
    console.log('Token from URL:', token ? 'Received' : 'None');
    console.log('Provider:', provider);
    console.log('Is new user:', isNewUser);
    
    if (!token) {
      console.error('No token found in URL parameters');
      throw new Error('No token found in URL parameters');
    }
    
    try {
      // Store tokens in localStorage
      localStorage.setItem('@auth_token', token);
      if (refreshToken) {
        localStorage.setItem('@refresh_token', refreshToken);
      }
      
      // Update token state
      setToken(token);
      
      // Set the auth header for subsequent requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Extract user info from token
      const payload = authService.parseJwt(token);
      console.log('User info from token:', payload);
      
      if (payload && payload.id) {
        // Create a basic user object from the token
        const basicUserData = {
          id: payload.id,
          email: payload.email || '',
          firstName: payload.firstName || payload.given_name || '',
          lastName: payload.lastName || payload.family_name || '',
          role: payload.role || 'user',
          provider: provider || null
        };
        
        // Store user data
        localStorage.setItem('@user_data', JSON.stringify(basicUserData));
        setUser(basicUserData);
        setIsNewSignup(isNewUser);
        
        // Determine redirect path based on whether it's a new user
        const redirectPath = isNewUser ? '/profile-setup' : '/dashboard';
        console.log(`Redirecting to: ${redirectPath}`);
        
        // Important: Force a slight delay to ensure state update before navigation
        await new Promise(resolve => setTimeout(resolve, 100));
        navigate(redirectPath);
        
        return { user: basicUserData, isNewUser };
      } else {
        console.warn('Could not extract user info from token, redirecting to login');
        throw new Error('Invalid token payload');
      }
    } catch (error) {
      console.error('Error in handleAuthCallback:', error);
      // Clear any partial auth data
      localStorage.removeItem('@auth_token');
      localStorage.removeItem('@refresh_token');
      localStorage.removeItem('@user_data');
      setToken(null);
      setUser(null);
      
      throw error;
    }
  };
  
  const sendPhoneVerification = async (phoneNumber) => {
    if (!user || !user.id) {
      throw new Error('User must be logged in to verify phone');
    }
    return authService.sendPhoneVerificationCode(user.id, phoneNumber);
  };

  const verifyPhone = async (phoneNumber, code) => {
    try {
      if (!user || !user.id) {
        throw new Error('User must be logged in to verify phone');
      }
      
      const response = await authService.verifyPhoneCode(user.id, code);
      
      // If verification successful, update user data
      if (response.success) {
        const updatedUserData = {
          ...user,
          phoneNumber,
          phoneVerified: true
        };
        
        await updateUser(updatedUserData);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const socialLogin = (provider) => {
    // Create a redirect URL back to your application
    const redirectUri = `${window.location.origin}/auth/callback`;
    
    // Get the API base URL
    const apiBaseUrl = 'https://new-backend-w86d.onrender.com';
    
    // Properly format the URL with query parameters - use proper encoding
    const oauthUrl = `${apiBaseUrl}/auth/${provider}?redirectTo=${encodeURIComponent(redirectUri)}`;
    
    console.log(`Redirecting to OAuth provider: ${oauthUrl}`);
    
    // Redirect the user to the OAuth URL
    window.location.href = oauthUrl;
  };
  
  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    updateUser,
    sendPhoneVerification,
    verifyPhone,
    socialLogin,
    handleAuthCallback,
    isNewSignup,
    setIsNewSignup
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
