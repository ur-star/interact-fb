// src/forms.js
import { graphAPI } from './graph.js';
import { getConfig } from './config.js';
import { handleError } from './errors.js';
import { resolveAccessToken, assertString, assertPositiveInteger, assertObject } from './utils.js';

/**
 * Fetches lead generation forms for a Facebook Page with enhanced options
 * @param {string} pageId - Facebook Page ID
 * @param {string} accessToken - Page access token
 * @param {object} [options={}] - Query options
 * @param {string} [options.fields] - Comma-separated fields to request
 * @param {number} [options.limit] - Maximum number of forms to fetch
 * @param {string} [options.status] - Filter by form status ('ACTIVE', 'ARCHIVED', 'DRAFT')

 * @returns {Promise<object>} Facebook response containing lead forms
 */
export async function getLeadForms(pageId, accessToken, options = {}) {
  try {
    assertString(pageId, 'pageId');
    const config = getConfig();
    const {
      fields = config.defaultFields.leadForms,
      limit,
      status,

      apiOptions = {}
    } = options;

    assertObject(options, 'options');
    if (limit != null) assertPositiveInteger(limit, 'options.limit');



    // Build query parameters
    const params = { fields };
    if (limit) params.limit = limit;
    if (status) params.status = status;

    return await graphAPI(
      `${pageId}/leadgen_forms`,
      await resolveAccessToken(accessToken),
      'GET',
      params,
      apiOptions
    );

  } catch (error) {
    throw handleError(
      error,
      'getLeadForms',
      { pageId, options }
    );


  }
}

/**
 * Fetches detailed information about a specific lead form
 * @param {string} formId - Lead generation form ID
 * @param {string} accessToken - Page access token
 * @param {object} [options={}] - Query options
 * @returns {Promise<object>} Detailed form information
 */
export async function getLeadFormDetails(formId, accessToken, options = {}) {
  try {
    const {
      fields = 'id,name,status,leads_count,created_time,questions,privacy_policy_url,follow_up_action_url,expired_leads_count,page',

      apiOptions = {}
    } = options;

    assertString(formId, 'formId');
    assertObject(options, 'options');



    return await graphAPI(
      formId,
      await resolveAccessToken(accessToken),
      'GET',
      { fields },
      apiOptions
    );

  } catch (error) {
    throw handleError(
      error,
      'getLeadFormDetails',
      { formId, options }
    );


  }
}

/**
 * Fetches only active lead forms for a page
 * @param {string} pageId - Facebook Page ID
 * @param {string} accessToken - Page access token
 * @param {object} [options={}] - Query options
 * @returns {Promise<object>} Active lead forms
 */
export async function getActiveLeadForms(pageId, accessToken, options = {}) {
  return await getLeadForms(pageId, accessToken, {
    ...options,
    status: 'ACTIVE'
  });
}

/**
 * Fetches lead forms from multiple pages
 * @param {Array} pageIds - Array of Facebook Page IDs
 * @param {string} accessToken - Access token
 * @param {object} [options={}] - Query options
 * @returns {Promise<object>} Object with pageId as keys and forms as values
 */
export async function getLeadFormsFromMultiplePages(pageIds, accessToken, options = {}) {
  try {
    if (!Array.isArray(pageIds) || pageIds.length === 0) {
      throw new Error('pageIds must be a non-empty array');
    }

    const results = {};

    // Process pages concurrently
    const promises = pageIds.map(async (pageId) => {
      try {
        const forms = await getLeadForms(pageId, accessToken, {
          ...options,

        });
        return { pageId, forms, success: true };
      } catch (error) {
        return { pageId, error: error.message, success: false };
      }
    });

    const responses = await Promise.all(promises);
    
    responses.forEach(({ pageId, forms, error, success }) => {
      results[pageId] = success ? forms : { error };
    });

    return results;

  } catch (error) {
    throw handleError(
      error,
      'getLeadFormsFromMultiplePages',
      { pageIds, options }
    );


  }
}

/**
 * Gets lead form statistics
 * @param {string} formId - Lead generation form ID
 * @param {string} accessToken - Page access token
 * @param {object} [options={}] - Query options
 * @returns {Promise<object>} Form statistics
 */
export async function getLeadFormStats(formId, accessToken, options = {}) {
  try {
    const {
      fields = 'leads_count,expired_leads_count,created_time,status',

      apiOptions = {}
    } = options;



    return await graphAPI(
      formId,
      accessToken,
      'GET',
      { fields },
      apiOptions
    );

  } catch (error) {
    throw handleError(
      error,
      'getLeadFormStats',
      { formId, options }
    );


  }
}