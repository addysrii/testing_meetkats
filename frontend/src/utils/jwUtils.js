// src/utils/jwtUtils.js

/**
 * Parse a JWT token to extract its payload
 * @param {string} token - The JWT token to parse
 * @returns {object|null} The decoded payload or null if invalid
 */
export const parseJwt = (token) => {
    try {
      // JWT tokens are base64Url encoded, split by dots into header, payload, and signature
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT token:', error);
      return null;
    }
  };
  
  /**
   * Check if a JWT token is expired
   * @param {string} token - The JWT token to check
   * @returns {boolean} True if token is expired or invalid, false otherwise
   */
  export const isTokenExpired = (token) => {
    if (!token) return true;
    
    try {
      const payload = parseJwt(token);
      if (!payload || !payload.exp) return true;
      
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  };
  
  /**
   * Extract user information from a JWT token
   * @param {string} token - The JWT token to extract info from
   * @returns {object|null} User information or null if invalid
   */
  export const extractUserFromToken = (token) => {
    if (!token) return null;
    
    try {
      const payload = parseJwt(token);
      if (!payload) return null;
      
      // Common fields in JWT tokens
      return {
        id: payload.id || payload.sub || payload.userId,
        email: payload.email,
        name: payload.name || payload.username || payload.email?.split('@')[0],
        roles: payload.roles || [],
        exp: payload.exp
      };
    } catch (error) {
      console.error('Error extracting user from token:', error);
      return null;
    }
  };
  
  export default {
    parseJwt,
    isTokenExpired,
    extractUserFromToken
  };