
/**
 * Email validation
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  // Supports standard domains (.com, .org), country codes (.uk, .ca), and multi-level (.co.uk, .com.au)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/;
  return emailRegex.test(email);
};

/**
 * Password validation
 * @param {string} password
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const errors = [];
  
  if (password.length < minLength) {
    errors.push(`At least ${minLength} characters required`);
  }
  if (!hasUpperCase) {
    errors.push('At least one uppercase letter required');
  }
  if (!hasLowerCase) {
    errors.push('At least one lowercase letter required');
  }
  if (!hasNumbers) {
    errors.push('At least one number required');
  }
  if (!hasSpecialChar) {
    errors.push('At least one special character required');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * URL validation
 * @param {string} url
 * @returns {boolean}
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Sanitize string input (basic XSS prevention)
 * @param {string} input
 * @returns {string}
 */
export const sanitizeString = (input) => {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .trim();
};

/**
 * Validate ad form data
 * @param {object} data
 * @returns {{ isValid: boolean, errors: object }}
 */
export const validateAdForm = (data) => {
  const errors = {};
  
  if (!data.title || data.title.trim().length === 0) {
    errors.title = 'Title is required';
  } else if (data.title.length > 100) {
    errors.title = 'Title must be less than 100 characters';
  }
  
  if (!data.description || data.description.trim().length === 0) {
    errors.description = 'Description is required';
  } else if (data.description.length > 500) {
    errors.description = 'Description must be less than 500 characters';
  }
  
  if (!data.image_url || !isValidUrl(data.image_url)) {
    errors.image_url = 'Valid image URL is required';
  }
  
  if (!data.region || data.region.trim().length === 0) {
    errors.region = 'Region is required';
  }
  
  if (data.budget !== undefined && data.budget < 0) {
    errors.budget = 'Budget must be a positive number';
  }
  
  if (data.reward_per_view !== undefined && data.reward_per_view < 0) {
    errors.reward_per_view = 'Reward per view must be a positive number';
  }
  
  if (data.redirection_link && data.redirection_link.trim() && !isValidUrl(data.redirection_link)) {
    errors.redirection_link = 'Valid URL is required for redirection link';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate login form
 * @param {object} data
 * @returns {{ isValid: boolean, errors: object }}
 */
export const validateLoginForm = (data) => {
  const errors = {};
  
  if (!data.email || data.email.trim().length === 0) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Invalid email address';
  }
  
  if (!data.password || data.password.length === 0) {
    errors.password = 'Password is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate signup form
 * @param {object} data
 * @returns {{ isValid: boolean, errors: object }}
 */
export const validateSignupForm = (data) => {
  const errors = {};
  
  if (!data.email || data.email.trim().length === 0) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Invalid email address';
  }
  
  if (!data.password || data.password.length === 0) {
    errors.password = 'Password is required';
  } else {
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors.join(', ');
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate number input
 * @param {any} value
 * @param {object} options
 * @returns {boolean}
 */
export const isValidNumber = (value, options = {}) => {
  const { min, max, allowFloat = true } = options;
  
  const num = Number(value);
  
  if (isNaN(num)) {
    return false;
  }
  
  if (!allowFloat && !Number.isInteger(num)) {
    return false;
  }
  
  if (min !== undefined && num < min) {
    return false;
  }
  
  if (max !== undefined && num > max) {
    return false;
  }
  
  return true;
};

/**
 * Validate file upload
 * @param {File} file
 * @param {object} options
 * @returns {{ isValid: boolean, error: string|null }}
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  } = options;
  
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }
  
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    return { isValid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: `File type must be one of: ${allowedTypes.join(', ')}` };
  }
  
  return { isValid: true, error: null };
};

export default {
  isValidEmail,
  validatePassword,
  isValidUrl,
  sanitizeString,
  validateAdForm,
  validateLoginForm,
  validateSignupForm,
  isValidNumber,
  validateFile,
};
