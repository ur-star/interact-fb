// src/pages.js
import { graphAPI } from "./graph.js";
import { getConfig } from "./config.js";
import { handleError } from "./errors.js";
import {
  resolveAccessToken,
  assertString,
  assertPositiveInteger,
  assertObject,
} from "./utils.js";

/**
 * Fetches Facebook Pages the user manages with enhanced options
 * @param {string} accessToken - User's access token
 * @param {object} [options={}] - Query options
 * @param {string} [options.fields] - Comma-separated fields to request
 * @param {number} [options.limit] - Maximum number of pages to fetch

 * @returns {Promise<object>} List of pages and associated access tokens
 */
export async function getPages(accessToken, options = {}) {
  try {
    const config = getConfig();
    const {
      fields = config.defaultFields.pages,
      limit,
      apiOptions = {},
    } = options;

    assertObject(options, "options");
    if (limit != null) assertPositiveInteger(limit, "options.limit");



    // Build query parameters
    const params = { fields };
    if (limit) params.limit = limit;

    return await graphAPI(
      "me/accounts",
      await resolveAccessToken(accessToken),
      "GET",
      params
    );

  } catch (error) {
    throw handleError(error, "getPages", { options });
  }
}

/**
 * Fetches detailed information about a specific page
 * @param {string} pageId - Facebook Page ID
 * @param {string} accessToken - Access token (user or page token)
 * @param {object} [options={}] - Query options
 * @returns {Promise<object>} Detailed page information
 */
export async function getPageInfo(pageId, accessToken, options = {}) {
  try {
    const {
      fields = "id,name,category,about,description,website,phone,emails,location,hours,fan_count,followers_count,checkins,were_here_count,talking_about_count,engagement",
      apiOptions = {},
    } = options;



    return await graphAPI(pageId, accessToken, "GET", { fields }, apiOptions);
  } catch (error) {
    throw handleError(error, "getPageInfo", {
      pageId,
      options,
    });
  }
}


/**
 * Gets a specific page by ID from user's managed pages
 * @param {string} pageId - Facebook Page ID to find
 * @param {string} accessToken - User's access token
 * @param {object} [options={}] - Query options
 * @returns {Promise<object|null>} Page data or null if not found
 */
export async function getManagedPage(pageId, accessToken, options = {}) {
  try {
    const pagesResponse = await getPages(accessToken, options);

    if (!pagesResponse.data) {
      return null;
    }

    const page = pagesResponse.data.find((p) => p.id === pageId);
    return page || null;
  } catch (error) {
    throw handleError(error, "getManagedPage", {
      pageId,
      options,
    });
  }
}

/**
 * Checks if user manages a specific page
 * @param {string} pageId - Facebook Page ID to check
 * @param {string} accessToken - User's access token
 * @returns {Promise<boolean>} Whether user manages the page
 */
export async function managesPage(pageId, accessToken) {
  try {
    const page = await getManagedPage(pageId, accessToken, {
      fields: "id"
    });
    return page !== null;
  } catch (error) {

    return false;
  }
}
