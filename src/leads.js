// src/leads.js
import { graphAPI } from "./graph.js";
import { getConfig } from "./config.js";
import { handleError } from "./errors.js";
import { resolveAccessToken, assertString, assertPositiveInteger, assertObject } from './utils.js';

/**
 * Fetches leads from a specific lead generation form
 * @param {string} formId - Lead generation form ID
 * @param {string} accessToken - Page access token with leads_retrieval permission
 * @param {object} [options={}] - Query options
 * @param {string} [options.fields] - Comma-separated fields to request
 * @param {number} [options.limit=25] - Maximum number of leads to fetch
 * @param {string} [options.after] - Cursor for pagination
 * @param {string} [options.since] - ISO date string to filter leads since
 * @param {string} [options.until] - ISO date string to filter leads until

 * @param {object} [options.apiOptions] - Additional Graph API options
 * @returns {Promise<object>} Facebook response containing leads
 */
export async function getLeads(formId, accessToken, options = {}) {
  try {
    assertString(formId, 'formId');
    const config = getConfig();
    const {
      fields = config.defaultFields.leads,
      limit = 25,
      after,
      since,
      until,

      apiOptions = {},
    } = options;

    assertObject(options, 'options');
    assertPositiveInteger(limit, 'options.limit');



    // Build query parameters
    const params = { fields, limit };
    if (after) params.after = after;
    if (since) params.since = since;
    if (until) params.until = until;

    const leadsData = await graphAPI(
      `${formId}/leads`,
      await resolveAccessToken(accessToken),
      "GET",
      params,
      apiOptions
    );

    return leadsData;
  } catch (error) {
    throw handleError(error, "getLeads", { formId, options });


  }
}

/**
 * Fetches all leads from a form with automatic pagination
 * @param {string} formId - Lead generation form ID
 * @param {string} accessToken - Page access token
 * @param {object} [options={}] - Query options
 * @param {number} [options.maxLeads] - Maximum total leads to fetch (prevents infinite loops)
 * @returns {Promise<Array>} Array of all leads
 */
export async function getAllLeads(formId, accessToken, options = {}) {
  try {
    assertString(formId, 'formId');
    const { maxLeads = 10000, ...otherOptions } = options;

    assertObject(options, 'options');
    assertPositiveInteger(maxLeads, 'options.maxLeads');

    const allLeads = [];
    let hasNextPage = true;
    let after = options.after;
    let fetchedCount = 0;

    while (hasNextPage && fetchedCount < maxLeads) {
      const response = await getLeads(formId, accessToken, {
        ...otherOptions,
        after,
        limit: Math.min(100, maxLeads - fetchedCount), // Facebook max is 100

      });

      if (response.data && response.data.length > 0) {
        allLeads.push(...response.data);
        fetchedCount += response.data.length;
      }

      // Check for next page
      if (
        response.paging &&
        response.paging.next &&
        response.paging.cursors?.after &&
        fetchedCount < maxLeads
      ) {
        after = response.paging.cursors.after;
      } else {
        hasNextPage = false;
      }
    }

    return allLeads;
  } catch (error) {
    throw handleError(error, "getAllLeads", {
      formId,
      options,
    });


  }
}

/**
 * Fetches leads from multiple forms
 * @param {Array} formIds - Array of form IDs
 * @param {string} accessToken - Page access token
 * @param {object} [options={}] - Query options
 * @param {boolean} [options.parallel=true] - Whether to fetch forms in parallel
 * @returns {Promise<object>} Object with formId as keys and leads as values
 */
export async function getLeadsFromMultipleForms(
  formIds,
  accessToken,
  options = {}
) {
  try {
    if (!Array.isArray(formIds) || formIds.length === 0) {
      throw new TypeError("formIds must be a non-empty array");
    }

    const { parallel = true, ...otherOptions } = options;

    const results = {};



    if (parallel) {
      // Process forms concurrently
      const promises = formIds.map(async (formId) => {
        try {
          const leads = await getLeads(formId, accessToken, {
            ...otherOptions,
    
          });
          return { formId, leads, success: true };
        } catch (error) {
          return { formId, error: error.message, success: false };
        }
      });

      const responses = await Promise.all(promises);

      responses.forEach(({ formId, leads, error, success }) => {
        results[formId] = success ? leads : { error };
      });
    } else {
      // Process forms sequentially
      for (const formId of formIds) {
        try {
          const leads = await getLeads(formId, accessToken, {
            ...otherOptions,
    
          });
          results[formId] = leads;
        } catch (error) {
          results[formId] = { error: error.message };
        }
      }
    }

    return results;
  } catch (error) {
    throw handleError(error, "getLeadsFromMultipleForms", {
      formIds,
      options,
    });


  }
}

/**
 * Fetches recent leads from a form (last 24 hours by default)
 * @param {string} formId - Lead generation form ID
 * @param {string} accessToken - Page access token
 * @param {object} [options={}] - Query options
 * @param {number} [options.hours=24] - Number of hours to look back
 * @returns {Promise<object>} Recent leads
 */
export async function getRecentLeads(formId, accessToken, options = {}) {
  try {
    assertString(formId, 'formId');
    const { hours = 24, ...otherOptions } = options;

    assertObject(options, 'options');
    assertPositiveInteger(hours, 'options.hours');

    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

    return await getLeads(formId, accessToken, {
      ...otherOptions,
      since,
    });
  } catch (error) {
    throw handleError(error, "getRecentLeads", {
      formId,
      options,
    });


  }
}

/**
 * Gets lead statistics for a form
 * @param {string} formId - Lead generation form ID
 * @param {string} accessToken - Page access token
 * @param {object} [options={}] - Query options
 * @returns {Promise<object>} Lead statistics
 */
export async function getLeadStats(formId, accessToken, options = {}) {
  try {
    // Get form details first
    const formDetails = await graphAPI(formId, accessToken, "GET", {
      fields: "leads_count,expired_leads_count,created_time,status",
    });

    // Get recent leads for additional stats
    const recentLeads = await getRecentLeads(formId, accessToken, {
      ...options,
      hours: 24,
      limit: 1000,
    });

    const stats = {
      formId,
      totalLeads: formDetails.leads_count || 0,
      expiredLeads: formDetails.expired_leads_count || 0,
      formStatus: formDetails.status,
      formCreated: formDetails.created_time,
      leadsLast24Hours: recentLeads.data ? recentLeads.data.length : 0,
      activeLeads:
        (formDetails.leads_count || 0) - (formDetails.expired_leads_count || 0),
    };

    return stats;
  } catch (error) {
    throw handleError(error, "getLeadStats", {
      formId,
      options,
    });


  }
}
