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

/**
 * Fetches pages owned by the user (pages where user has MANAGE task)
 * @param {string} accessToken - User's access token
 * @param {object} [options={}] - Query options
 * @param {string} [options.fields] - Comma-separated fields to request
 * @param {number} [options.limit] - Maximum number of pages to fetch
 * @returns {Promise<object>} List of owned pages and associated access tokens
 */
export async function fetchOwnedPages(accessToken, options = {}) {
  try {
    const config = getConfig();
    const {
      fields = config.defaultFields.pages,
      limit,
      apiOptions = {},
    } = options;

    assertObject(options, "options");
    if (limit != null) assertPositiveInteger(limit, "options.limit");

    // Build query parameters - ensure tasks field is included
    const fieldsWithTasks = fields.includes('tasks') ? fields : `${fields},tasks`;
    const params = { fields: fieldsWithTasks };
    if (limit) params.limit = limit;

    const response = await graphAPI(
      "me/accounts",
      await resolveAccessToken(accessToken),
      "GET",
      params,
      apiOptions
    );

    // Filter pages where user has MANAGE task (typically owned pages)
    if (response.data) {
      response.data = response.data.filter(page => 
        page.tasks && page.tasks.includes('MANAGE')
      );
    }

    return response;
  } catch (error) {
    throw handleError(error, "fetchOwnedPages", { options });
  }
}

/**
 * Fetches client pages (pages where user has ADVERTISE task but not MANAGE)
 * @param {string} accessToken - User's access token
 * @param {object} [options={}] - Query options
 * @param {string} [options.fields] - Comma-separated fields to request
 * @param {number} [options.limit] - Maximum number of pages to fetch
 * @returns {Promise<object>} List of client pages and associated access tokens
 */
export async function fetchClientPages(accessToken, options = {}) {
  try {
    const config = getConfig();
    const {
      fields = config.defaultFields.pages,
      limit,
      apiOptions = {},
    } = options;

    assertObject(options, "options");
    if (limit != null) assertPositiveInteger(limit, "options.limit");

    // Build query parameters - ensure tasks field is included
    const fieldsWithTasks = fields.includes('tasks') ? fields : `${fields},tasks`;
    const params = { fields: fieldsWithTasks };
    if (limit) params.limit = limit;

    const response = await graphAPI(
      "me/accounts",
      await resolveAccessToken(accessToken),
      "GET",
      params,
      apiOptions
    );

    // Filter pages where user has ADVERTISE task but not MANAGE (client pages)
    if (response.data) {
      response.data = response.data.filter(page => 
        page.tasks && 
        page.tasks.includes('ADVERTISE') && 
        !page.tasks.includes('MANAGE')
      );
    }

    return response;
  } catch (error) {
    throw handleError(error, "fetchClientPages", { options });
  }
}

/**
 * Fetches pages managed by the user (all pages with any management task)
 * @param {string} accessToken - User's access token
 * @param {object} [options={}] - Query options
 * @param {string} [options.fields] - Comma-separated fields to request
 * @param {number} [options.limit] - Maximum number of pages to fetch
 * @returns {Promise<object>} List of managed pages and associated access tokens
 */
export async function fetchManagedPages(accessToken, options = {}) {
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
      params,
      apiOptions
    );
  } catch (error) {
    throw handleError(error, "fetchManagedPages", { options });
  }
}

/**
 * Fetches all pages (owned, managed, or task-based) associated with the user
 * This combines all pages the user has access to regardless of task type
 * @param {string} accessToken - User's access token
 * @param {object} [options={}] - Query options
 * @param {string} [options.fields] - Comma-separated fields to request
 * @param {number} [options.limit] - Maximum number of pages to fetch per type
 * @param {boolean} [options.deduplicate=true] - Whether to deduplicate pages across types
 * @returns {Promise<object>} Combined list of all pages with type indicators
 */
export async function fetchAllPages(accessToken, options = {}) {
  try {
    const {
      fields,
      limit,
      deduplicate = true,
      apiOptions = {},
    } = options;

    assertObject(options, "options");
    if (limit != null) assertPositiveInteger(limit, "options.limit");

    // Fetch all page types in parallel
    const [ownedPages, clientPages, managedPages] = await Promise.all([
      fetchOwnedPages(accessToken, { fields, limit, apiOptions }).catch(() => ({ data: [] })),
      fetchClientPages(accessToken, { fields, limit, apiOptions }).catch(() => ({ data: [] })),
      fetchManagedPages(accessToken, { fields, limit, apiOptions }).catch(() => ({ data: [] })),
    ]);

    // Combine all pages
    const allPages = [];
    const pageMap = new Map(); // For deduplication by page ID

    // Process owned pages
    if (ownedPages.data) {
      ownedPages.data.forEach(page => {
        if (deduplicate && pageMap.has(page.id)) {
          const existing = pageMap.get(page.id);
          existing.pageType = existing.pageType.includes('owned') 
            ? existing.pageType 
            : [...existing.pageType, 'owned'];
        } else {
          const pageWithType = { ...page, pageType: ['owned'] };
          allPages.push(pageWithType);
          if (deduplicate) pageMap.set(page.id, pageWithType);
        }
      });
    }

    // Process client pages
    if (clientPages.data) {
      clientPages.data.forEach(page => {
        if (deduplicate && pageMap.has(page.id)) {
          const existing = pageMap.get(page.id);
          existing.pageType = existing.pageType.includes('client') 
            ? existing.pageType 
            : [...existing.pageType, 'client'];
        } else {
          const pageWithType = { ...page, pageType: ['client'] };
          allPages.push(pageWithType);
          if (deduplicate) pageMap.set(page.id, pageWithType);
        }
      });
    }

    // Process managed pages (add any that weren't already added)
    if (managedPages.data) {
      managedPages.data.forEach(page => {
        if (deduplicate && pageMap.has(page.id)) {
          const existing = pageMap.get(page.id);
          if (!existing.pageType || !existing.pageType.includes('managed')) {
            existing.pageType = existing.pageType || [];
            if (!existing.pageType.includes('managed')) {
              existing.pageType = [...existing.pageType, 'managed'];
            }
          }
        } else {
          const pageWithType = { ...page, pageType: ['managed'] };
          allPages.push(pageWithType);
          if (deduplicate) pageMap.set(page.id, pageWithType);
        }
      });
    }

    // If not deduplicating, return all pages as-is
    const finalPages = deduplicate ? Array.from(pageMap.values()) : allPages;

    return {
      data: finalPages,
      summary: {
        total: finalPages.length,
        owned: ownedPages.data?.length || 0,
        client: clientPages.data?.length || 0,
        managed: managedPages.data?.length || 0,
      },
      paging: managedPages.paging || null,
    };
  } catch (error) {
    throw handleError(error, "fetchAllPages", { options });
  }
}