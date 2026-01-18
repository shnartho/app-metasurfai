/**
 * Safe localStorage wrapper
 * Prevents crashes in private browsing mode or when storage is full
 */

const storage = {
  /**
   * Get item from localStorage
   * @param {string} key
   * @param {any} defaultValue - Value to return if key doesn't exist
   * @returns {any}
   */
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return item;
    } catch (error) {
      console.warn(`Error reading from localStorage (key: ${key}):`, error);
      return defaultValue;
    }
  },

  /**
   * Get and parse JSON from localStorage
   * @param {string} key
   * @param {any} defaultValue
   * @returns {any}
   */
  getJSON: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item);
    } catch (error) {
      console.warn(`Error parsing JSON from localStorage (key: ${key}):`, error);
      return defaultValue;
    }
  },

  /**
   * Set item in localStorage
   * @param {string} key
   * @param {any} value
   * @returns {boolean} - True if successful
   */
  set: (key, value) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn(`Error writing to localStorage (key: ${key}):`, error);
      return false;
    }
  },

  /**
   * Set JSON object in localStorage
   * @param {string} key
   * @param {any} value
   * @returns {boolean} - True if successful
   */
  setJSON: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Error writing JSON to localStorage (key: ${key}):`, error);
      return false;
    }
  },

  /**
   * Remove item from localStorage
   * @param {string} key
   * @returns {boolean} - True if successful
   */
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Error removing from localStorage (key: ${key}):`, error);
      return false;
    }
  },

  /**
   * Clear all localStorage
   * @returns {boolean} - True if successful
   */
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.warn('Error clearing localStorage:', error);
      return false;
    }
  },

  /**
   * Check if localStorage is available
   * @returns {boolean}
   */
  isAvailable: () => {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }
};

export default storage;
