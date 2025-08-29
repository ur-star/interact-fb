// src/posts.js
import { graphAPI } from './graph.js';
import { getConfig } from './config.js';
import { handleError } from './errors.js';
import { resolveAccessToken, assertString, assertPositiveInteger, assertObject } from './utils.js';

/**
 * Fetches recent posts from a Facebook Page with enhanced options
 * @param {string} pageId - The Facebook Page ID
 * @param {string} pageAccessToken - Page access token
 * @param {object} [options={}] - Query options
 * @param {number} [options.limit=10] - Maximum number of posts to fetch
 * @param {string} [options.fields] - Comma-separated list of fields
 * @param {string} [options.since] - ISO date string to filter posts since
 * @param {string} [options.until] - ISO date string to filter posts until

 * @returns {Promise<object>} Facebook Graph API response containing posts
 */
export async function getPagePosts(pageId, pageAccessToken, options = {}) {
  try {
    assertString(pageId, 'pageId');
    const config = getConfig();

    const {
      limit = 10,
      fields = config.defaultFields.posts,
      since,
      until,

      apiOptions = {}
    } = options;

    assertObject(options, 'options');
    assertPositiveInteger(limit, 'options.limit');



    const params = { fields, limit };
    if (since) params.since = since;
    if (until) params.until = until;

    return await graphAPI(
      `${pageId}/posts`,
      pageAccessToken,
      'GET',
      params
    );

  } catch (error) {
    throw handleError(
      error,
      'getPagePosts',
      { pageId, options }
    );
  }
}


/**
 * Fetches detailed information about a specific post
 * @param {string} postId - Facebook post ID
 * @param {string} accessToken - Access token
 * @param {object} [options={}] - Query options
 * @returns {Promise<object>} Detailed post data
 */
export async function getPostDetails(postId, accessToken, options = {}) {
  try {
    assertString(postId, 'postId');
    const {
      fields = 'id,message,created_time,full_picture,attachments{media},shares,likes.summary(true),comments.summary(true)',

      apiOptions = {}
    } = options;

    assertObject(options, 'options');

    return await graphAPI(
      postId,
      await resolveAccessToken(accessToken),
      'GET',
      { fields }
    );

  } catch (error) {
    throw handleError(
      error,
      'getPostDetails',
      { postId, options }
    );
  }
}
