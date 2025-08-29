// src/graph.js
import { getConfig } from './config.js';
import { createFacebookError, handleError, logError, FacebookTimeoutError } from './errors.js';

/**
 * Sleep utility for retry delays
 * @param {number} ms - Milliseconds to sleep
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Enhanced Facebook Graph API client with retry logic and better error handling
 * @param {string} endpoint - API endpoint (without version prefix)
 * @param {string} accessToken - Facebook access token
 * @param {string} [method='GET'] - HTTP method
 * @param {object} [params={}] - Query parameters or request body
 * @param {object} [options={}] - Additional options
 * @param {string} [options.version] - API version override
 * @param {number} [options.timeout] - Request timeout override
 * @param {number} [options.retryAttempts] - Retry attempts override
 * @param {number} [options.retryDelay] - Retry delay override
 * @returns {Promise<object>} Facebook API response
 */
export async function graphAPI(
  endpoint,
  accessToken,
  method = 'GET',
  params = {},
  options = {}
) {
  const config = getConfig();
  const {
    version = config.version,
    timeout = config.timeout,
    retryAttempts = config.retryAttempts,
    retryDelay = config.retryDelay
  } = options;

  const url = new URL(`https://graph.facebook.com/${version}/${endpoint}`);
  const isGet = method.toUpperCase() === 'GET';
  
  // For GET requests, add params to URL
  if (isGet && params && Object.keys(params).length > 0) {
    url.search = new URLSearchParams({
      access_token: accessToken,
      ...params,
    }).toString();
  }

  const requestOptions = {
    method,
    headers: {
      ...(isGet
        ? {}
        : {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          }),
    },
    ...(isGet ? {} : { body: JSON.stringify(params) }),
  };

  // Add timeout using AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  requestOptions.signal = controller.signal;

  let lastError;
  
  // Retry logic
  for (let attempt = 0; attempt <= retryAttempts; attempt++) {
    try {
      const response = await fetch(url.toString(), requestOptions);
      clearTimeout(timeoutId);
      
      const data = await response.json();

      if (!response.ok) {
        const fbError = createFacebookError(data.error, response.status);
        
        // Don't retry on auth errors or client errors (4xx except rate limiting)
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          throw fbError;
        }
        
        // Retry on server errors or rate limiting
        if (attempt < retryAttempts && (response.status >= 500 || response.status === 429)) {
          lastError = fbError;
          await sleep(retryDelay * Math.pow(2, attempt)); // Exponential backoff
          continue;
        }
        
        throw fbError;
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Handle AbortError (timeout)
      if (error.name === 'AbortError') {
        const timeoutError = new FacebookTimeoutError(
          `Request timed out after ${timeout}ms`,
          'REQUEST_TIMEOUT'
        );
        
        if (attempt < retryAttempts) {
          lastError = timeoutError;
          await sleep(retryDelay * Math.pow(2, attempt));
          continue;
        }
        
        throw timeoutError;
      }
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        if (attempt < retryAttempts) {
          lastError = error;
          await sleep(retryDelay * Math.pow(2, attempt));
          continue;
        }
      }
      
      // Don't retry on Facebook-specific errors that won't benefit from retry
      if (error.name === 'FacebookAuthError' || error.name === 'FacebookPermissionError') {
        throw error;
      }
      
      lastError = error;
      
      if (attempt < retryAttempts) {
        await sleep(retryDelay * Math.pow(2, attempt));
        continue;
      }
      
      break;
    }
  }
  
  // If we get here, all retries failed
  const processedError = handleError(
    lastError,
    `graphAPI(${endpoint})`,
    { endpoint, method, attempt: retryAttempts + 1 }
  );
  
  logError(processedError);
  throw processedError;
}

/**
 * Batch multiple Graph API requests
 * @param {Array} requests - Array of request objects
 * @param {string} accessToken - Facebook access token
 * @param {object} [options={}] - Additional options
 * @returns {Promise<Array>} Array of responses
 */
export async function batchGraphAPI(requests, accessToken, options = {}) {
  if (!Array.isArray(requests) || requests.length === 0) {
    throw new Error('Requests must be a non-empty array');
  }

  // Facebook allows max 50 requests per batch
  const batchSize = 50;
  const results = [];

  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    
    const batchParam = batch.map((req, index) => ({
      method: req.method || 'GET',
      relative_url: req.endpoint + (req.params ? `?${new URLSearchParams(req.params).toString()}` : ''),
      include_headers: false,
      name: req.name || `request_${i + index}`
    }));

    try {
      const response = await graphAPI(
        '',
        accessToken,
        'POST',
        { batch: JSON.stringify(batchParam) },
        options
      );

      results.push(...response);
    } catch (error) {
      throw handleError(error, 'batchGraphAPI', { batchSize: batch.length });
    }
  }

  return results;
}