// src/utils.js
import { FacebookSDKError, FacebookPermissionError } from './errors.js';

let cachedAccessToken = null;
let cachedExpiresAtMs = 0;
let inFlightTokenPromise = null;

/**
 * Resolves an access token or throws a descriptive error.
 * Accepts either a string token or null to auto-resolve via FB SDK when available.
 * @param {string|null|undefined} maybeToken
 * @param {Array} [missingContext=[]] - Permissions for context on errors
 * @returns {Promise<string>} access token
 */
export async function resolveAccessToken(maybeToken, missingContext = [], options = {}) {
  const { useCache = true, forceRefresh = false } = options;

  if (typeof maybeToken === 'string' && maybeToken.trim().length > 0) {
    return maybeToken;
  }

  const now = Date.now();
  if (useCache && !forceRefresh && cachedAccessToken && cachedExpiresAtMs > now + 5000) {
    return cachedAccessToken;
  }

  if (inFlightTokenPromise && !forceRefresh) {
    return inFlightTokenPromise;
  }

  if (typeof FB !== 'undefined' && typeof FB.getLoginStatus === 'function') {
    inFlightTokenPromise = new Promise((resolve, reject) => {
      FB.getLoginStatus((status) => {
        try {
          if (status && status.status === 'connected' && status.authResponse?.accessToken) {
            const token = status.authResponse.accessToken;
            const expiresInSec = status.authResponse.expiresIn;
            cachedAccessToken = token;
            cachedExpiresAtMs = expiresInSec ? now + expiresInSec * 1000 : now + 60 * 60 * 1000;
            return resolve(token);
          }
          return reject(new FacebookPermissionError(
            'User not logged in. Cannot proceed without an access token.',
            missingContext,
            'NOT_LOGGED_IN'
          ));
        } catch (e) {
          return reject(e);
        }
      });
    }).finally(() => {
      inFlightTokenPromise = null;
    });
    return inFlightTokenPromise;
  }

  throw new FacebookSDKError(
    'No access token provided and Facebook SDK not available.',
    'NO_TOKEN'
  );
}

export function setAccessToken(token, expiresInSeconds) {
  cachedAccessToken = typeof token === 'string' ? token : null;
  const now = Date.now();
  cachedExpiresAtMs = cachedAccessToken
    ? (expiresInSeconds ? now + expiresInSeconds * 1000 : now + 60 * 60 * 1000)
    : 0;
}

export function clearAccessToken() {
  cachedAccessToken = null;
  cachedExpiresAtMs = 0;
  inFlightTokenPromise = null;
}

export function getCachedAccessToken() {
  const now = Date.now();
  if (cachedAccessToken && cachedExpiresAtMs > now + 5000) {
    return cachedAccessToken;
  }
  return null;
}

/**
 * Validates that a value is a non-empty string.
 * @param {any} value
 * @param {string} name
 */
export function assertString(value, name) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new TypeError(`${name} must be a non-empty string`);
  }
}

/**
 * Validates that a value is a positive integer.
 * @param {any} value
 * @param {string} name
 */
export function assertPositiveInteger(value, name) {
  if (value == null) return; // optional
  if (!Number.isInteger(value) || value <= 0) {
    throw new TypeError(`${name} must be a positive integer`);
  }
}

/**
 * Ensures object options are of type object.
 * @param {any} value
 * @param {string} name
 */
export function assertObject(value, name) {
  if (value == null) return; // optional
  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError(`${name} must be an object`);
  }
}


