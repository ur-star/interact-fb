// src/auth.js
import { getConfig } from './config.js';
import { FacebookSDKError, FacebookAuthError, handleError, logError } from './errors.js';

/**
 * Prompts user to log in with Facebook with configurable permissions
 * @param {string|Array} [scope] - Requested FB permissions (string or array)
 * @param {object} [options={}] - Additional login options
 * @param {boolean} [options.rerequest=false] - Re-request declined permissions
 * @param {string} [options.auth_type] - Auth type ('rerequest' for declined permissions)
 * @param {boolean} [options.return_scopes=true] - Return granted/declined scopes
 * @returns {Promise<object>} - Enhanced authentication response with user info
 */
export async function loginWithFacebook(scope, options = {}) {
  const config = getConfig();
  
  // Handle scope parameter - can be string, array, or use default
  let scopeString;
  if (Array.isArray(scope)) {
    scopeString = scope.join(',');
  } else if (typeof scope === 'string') {
    scopeString = scope;
  } else if (typeof scope === 'object' && scope !== null) {
    // If first parameter is options object
    options = scope;
    scopeString = config.defaultPermissions.basic.join(',');
  } else {
    scopeString = config.defaultPermissions.basic.join(',');
  }

  const {
    rerequest = false,
    auth_type,
    return_scopes = true
  } = options;

  return new Promise((resolve, reject) => {
    if (typeof FB === 'undefined' || !FB.login) {
      const sdkError = new FacebookSDKError(
        'Facebook SDK not loaded. Call initFacebookSdk() first.',
        'SDK_NOT_LOADED'
      );
      logError(sdkError);
      return reject(sdkError);
    }

    const loginOptions = {
      scope: scopeString,
      return_scopes,
      ...(rerequest && { auth_type: 'rerequest' }),
      ...(auth_type && { auth_type })
    };

    FB.login(
      (response) => {
        try {
          if (response.authResponse) {
            // Enhanced response with additional info
            const enhancedResponse = {
              ...response.authResponse,
              grantedScopes: response.grantedScopes || [],
              deniedScopes: response.deniedScopes || [],
              status: response.status
            };
            resolve(enhancedResponse);
          } else {
            const authError = new FacebookAuthError(
              response.status === 'not_authorized' 
                ? 'User denied app authorization'
                : 'User cancelled login or authentication failed',
              response.status === 'not_authorized' ? 'AUTH_DENIED' : 'AUTH_CANCELLED'
            );
            authError.fbResponse = response;
            logError(authError);
            reject(authError);
          }
        } catch (error) {
          const processedError = handleError(
            error, 
            'loginWithFacebook', 
            { scope: scopeString, options: loginOptions }
          );
          logError(processedError);
          reject(processedError);
        }
      },
      loginOptions
    );
  });
}

/**
 * Logs out the current user
 * @returns {Promise<void>}
 */
export function logoutFromFacebook() {
  return new Promise((resolve, reject) => {
    if (typeof FB === 'undefined' || !FB.logout) {
      const sdkError = new FacebookSDKError(
        'Facebook SDK not loaded. Call initFacebookSdk() first.',
        'SDK_NOT_LOADED'
      );
      logError(sdkError);
      return reject(sdkError);
    }

    FB.logout((response) => {
      try {
        resolve(response);
      } catch (error) {
        const processedError = handleError(error, 'logoutFromFacebook');
        logError(processedError);
        reject(processedError);
      }
    });
  });
}

/**
 * Gets current login status
 * @returns {Promise<object>} Login status response
 */
export function getLoginStatus() {
  return new Promise((resolve, reject) => {
    if (typeof FB === 'undefined' || !FB.getLoginStatus) {
      const sdkError = new FacebookSDKError(
        'Facebook SDK not loaded. Call initFacebookSdk() first.',
        'SDK_NOT_LOADED'
      );
      logError(sdkError);
      return reject(sdkError);
    }

    FB.getLoginStatus((response) => {
      try {
        resolve(response);
      } catch (error) {
        const processedError = handleError(error, 'getLoginStatus');
        logError(processedError);
        reject(processedError);
      }
    });
  });
}

/**
 * Convenience method to check if user is logged in
 * @returns {Promise<boolean>} Whether user is logged in
 */
export async function isLoggedIn() {
  try {
    const status = await getLoginStatus();
    return status.status === 'connected';
  } catch (error) {
    logError(error);
    return false;
  }
}

/**
 * Gets current access token if user is logged in
 * @returns {Promise<string|null>} Access token or null
 */
export async function getAccessToken() {
  try {
    const status = await getLoginStatus();
    return status.status === 'connected' ? status.authResponse.accessToken : null;
  } catch (error) {
    logError(error);
    return null;
  }
}