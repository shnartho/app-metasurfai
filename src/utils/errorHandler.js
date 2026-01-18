/**
 * Centralized Error Handling
 * Provides consistent error messages and logging
 */

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(message, statusCode = null, data = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Parse error from API response
 * @param {any} error
 * @returns {string}
 */
export const parseErrorMessage = (error) => {
  // Handle different error formats
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (error?.error) {
    return error.error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Log error to console (can be extended to send to monitoring service)
 * @param {string} context
 * @param {any} error
 */
export const logError = (context, error) => {
  console.error(`[${context}]`, error);
  
  // TODO: Send to monitoring service (e.g., Sentry)
  // if (window.Sentry) {
  //   window.Sentry.captureException(error, { tags: { context } });
  // }
};

/**
 * Handle API errors consistently
 * @param {any} error
 * @param {string} context
 * @returns {string} - User-friendly error message
 */
export const handleApiError = (error, context = 'API') => {
  logError(context, error);
  
  // Map specific error codes to user-friendly messages
  const errorMap = {
    401: 'Your session has expired. Please log in again.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    429: 'Too many requests. Please try again later.',
    500: 'Server error. Please try again later.',
    503: 'Service temporarily unavailable. Please try again later.',
  };
  
  // Check for status code
  if (error?.statusCode && errorMap[error.statusCode]) {
    return errorMap[error.statusCode];
  }
  
  // Check for network errors
  if (error?.message?.includes('fetch') || error?.message?.includes('network')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  // Return parsed error message or default
  return parseErrorMessage(error);
};

/**
 * Retry failed requests with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Initial delay in ms
 * @returns {Promise}
 */
export const retryWithBackoff = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on auth errors or client errors
      if (error?.statusCode && (error.statusCode === 401 || error.statusCode === 403 || error.statusCode < 500)) {
        throw error;
      }
      
      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
};

/**
 * Validate form and return first error message
 * @param {object} validationResult
 * @returns {string|null}
 */
export const getFirstValidationError = (validationResult) => {
  if (!validationResult || validationResult.isValid) {
    return null;
  }
  
  const errors = validationResult.errors;
  
  if (typeof errors === 'object' && errors !== null) {
    const firstKey = Object.keys(errors)[0];
    return errors[firstKey];
  }
  
  if (Array.isArray(errors) && errors.length > 0) {
    return errors[0];
  }
  
  return 'Validation failed';
};

export default {
  ApiError,
  parseErrorMessage,
  logError,
  handleApiError,
  retryWithBackoff,
  getFirstValidationError,
};
