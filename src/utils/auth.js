/**
 * Authentication utilities
 * JWT token handling and validation
 */

/**
 * Decode JWT token (without verification)
 * @param {string} token
 * @returns {object|null}
 */
export const decodeToken = (token) => {
  try {
    if (!token) return null;
    
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    console.warn('Error decoding token:', error);
    return null;
  }
};

/**
 * Check if JWT token is expired
 * @param {string} token
 * @returns {boolean}
 */
export const isTokenExpired = (token) => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  } catch (error) {
    console.warn('Error checking token expiration:', error);
    return true;
  }
};

/**
 * Get time until token expires (in seconds)
 * @param {string} token
 * @returns {number|null}
 */
export const getTokenExpiresIn = (token) => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return null;
    
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp - now;
  } catch (error) {
    return null;
  }
};

/**
 * Logout user and clear auth data
 * @param {Function} storageRemove - Storage remove function
 */
export const logout = (storageRemove) => {
  if (storageRemove) {
    storageRemove('authToken');
    storageRemove('userProfile');
  }
  window.location.reload();
};

export default {
  decodeToken,
  isTokenExpired,
  getTokenExpiresIn,
  logout
};
