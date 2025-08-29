// src/errors.js

/**
 * Custom error classes for different types of Facebook API errors
 */

export class FacebookSDKError extends Error {
  constructor(message, code = 'SDK_ERROR') {
    super(message);
    this.name = 'FacebookSDKError';
    this.code = code;
  }
}

export class FacebookAuthError extends Error {
  constructor(message, code = 'AUTH_ERROR') {
    super(message);
    this.name = 'FacebookAuthError';
    this.code = code;
  }
}

export class FacebookAPIError extends Error {
  constructor(message, code = 'API_ERROR', statusCode = null, fbError = null) {
    super(message);
    this.name = 'FacebookAPIError';
    this.code = code;
    this.statusCode = statusCode;
    this.fbError = fbError;
  }
}

export class FacebookPermissionError extends Error {
  constructor(message, missingPermissions = [], code = 'PERMISSION_ERROR') {
    super(message);
    this.name = 'FacebookPermissionError';
    this.code = code;
    this.missingPermissions = missingPermissions;
  }
}

export class FacebookTimeoutError extends Error {
  constructor(message, code = 'TIMEOUT_ERROR') {
    super(message);
    this.name = 'FacebookTimeoutError';
    this.code = code;
  }
}

/**
 * Maps Facebook Graph API error codes to our custom error types
 */
const ERROR_CODE_MAP = {
  1: 'API_UNKNOWN',
  2: 'API_SERVICE',
  4: 'API_TOO_MANY_CALLS',
  10: 'PERMISSION_DENIED',
  100: 'API_PARAMETER',
  190: 'AUTH_TOKEN_INVALID',
  200: 'PERMISSION_DENIED',
  613: 'API_TOO_MANY_CALLS'
};

/**
 * Creates appropriate error instance based on Facebook API response
 * @param {object} fbError - Facebook error object
 * @param {number} statusCode - HTTP status code
 * @returns {Error} Appropriate error instance
 */
export function createFacebookError(fbError, statusCode = null) {
  if (!fbError) {
    return new FacebookAPIError('Unknown Facebook API error', 'API_UNKNOWN', statusCode);
  }

  const { message, code, error_subcode, type } = fbError;
  const mappedCode = ERROR_CODE_MAP[code] || 'API_ERROR';

  // Handle specific error types
  switch (code) {
    case 190: // Invalid token
    case 102: // Session key invalid
    case 459: // User session invalid
      return new FacebookAuthError(message, 'AUTH_TOKEN_INVALID');
    
    case 10: // Permission denied
    case 200: // Requires extended permission
      return new FacebookPermissionError(message, [], 'PERMISSION_DENIED');
    
    case 4: // Rate limiting
    case 613: // Rate limiting
      return new FacebookAPIError(message, 'API_RATE_LIMIT', statusCode, fbError);
    
    case 1: // Unknown error
    case 2: // Service error
      return new FacebookAPIError(message, mappedCode, statusCode, fbError);
    
    default:
      return new FacebookAPIError(message, mappedCode, statusCode, fbError);
  }
}

/**
 * Global error handler for consistent error processing
 * @param {Error} error - Original error
 * @param {string} context - Context where error occurred
 * @param {object} metadata - Additional error metadata
 * @returns {Error} Processed error
 */
export function handleError(error, context, metadata = {}) {
  // If it's already a Facebook error, just add context
  if (error instanceof FacebookSDKError || 
      error instanceof FacebookAuthError || 
      error instanceof FacebookAPIError || 
      error instanceof FacebookPermissionError ||
      error instanceof FacebookTimeoutError) {
    error.context = context;
    error.metadata = metadata;
    return error;
  }

  // Handle fetch/network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    const networkError = new FacebookAPIError(
      `Network error in ${context}: ${error.message}`,
      'NETWORK_ERROR'
    );
    networkError.context = context;
    networkError.metadata = metadata;
    return networkError;
  }

  // Handle timeout errors
  if (error.name === 'AbortError' || error.message.includes('timeout')) {
    const timeoutError = new FacebookTimeoutError(
      `Timeout error in ${context}: ${error.message}`,
      'TIMEOUT_ERROR'
    );
    timeoutError.context = context;
    timeoutError.metadata = metadata;
    return timeoutError;
  }

  // Generic error wrapper
  const genericError = new FacebookAPIError(
    `Error in ${context}: ${error.message}`,
    'GENERIC_ERROR'
  );
  genericError.originalError = error;
  genericError.context = context;
  genericError.metadata = metadata;
  return genericError;
}

/**
 * Logs errors in development mode
 * @param {Error} error - Error to log
 */
export function logError(error) {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔴 Facebook API Error: ${error.name}`);
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    if (error.context) console.error('Context:', error.context);
    if (error.metadata) console.error('Metadata:', error.metadata);
    if (error.fbError) console.error('Facebook Error:', error.fbError);
    console.error('Stack:', error.stack);
    console.groupEnd();
  }
}