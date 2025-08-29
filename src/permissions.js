// src/permissions.js
import { graphAPI } from "./graph.js";
import { FacebookPermissionError, handleError, logError } from "./errors.js";
import { resolveAccessToken } from "./utils.js";


/**
 * Gets all granted permissions for the current user
 * @param {string} [accessToken] - Access token
 * @returns {Promise<Array>} Array of granted permission strings
 */
export async function getAllPermissions(accessToken = null) {
  try {
    const full = await fetchAllPermissions(accessToken);
    const data =
      full && full.permissions && Array.isArray(full.permissions.data)
        ? full.permissions.data
        : full && Array.isArray(full.data)
        ? full.data
        : [];
    return data
      .filter((perm) => perm.status === "granted")
      .map((perm) => perm.permission);
  } catch (error) {
    logError(error);
    throw error;
  }
}


/**
 * Gets all non-granted permissions for the current user
 * @param {string} [accessToken] - Access token
 * @returns {Promise<Array>} Array of required (not granted) permission strings
 */
export async function getAllRequiredPermissions(accessToken = null) {
  try {
    const full = await fetchAllPermissions(accessToken);
    const data =
      full && full.permissions && Array.isArray(full.permissions.data)
        ? full.permissions.data
        : full && Array.isArray(full.data)
        ? full.data
        : [];
    return data
      .filter((perm) => perm.status === "declined")
      .map((perm) => perm.permission);
  } catch (error) {
    logError(error);
    throw error;
  }
}


/**
 * Fetches all permissions using fields="permissions"
 * @param {string} [accessToken] - Access token
 * @returns {Promise<object>} Raw response containing permissions
 */
export async function fetchAllPermissions(accessToken = null) {
  try {
    const token = await resolveAccessToken(accessToken);
    // Use fields=permissions to fetch permissions as part of the user node
    const response = await graphAPI("me", token, "GET", {
      fields: "permissions",
    });
    if (!response || (!response.permissions && !response.data)) {
      throw new FacebookPermissionError(
        "Invalid response when fetching permissions",
        [],
        "INVALID_RESPONSE"
      );
    }
    return response;
  } catch (error) {
    const processedError = handleError(error, "fetchAllPermissions");
    logError(processedError);
    throw processedError;
  }
}


