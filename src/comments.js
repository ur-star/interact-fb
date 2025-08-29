// src/comments.js
import { graphAPI } from './graph.js';
import { getConfig } from './config.js';
import { handleError } from './errors.js';
import { resolveAccessToken, assertString, assertPositiveInteger, assertObject } from './utils.js';

/**
 * Fetches comments from a Facebook post
 * @param {string} postId - Facebook post ID
 * @param {string} accessToken - Access token
 * @param {object} [options={}] - Query options
 * @returns {Promise<object>} Comments data
 */
export async function getComments(postId, accessToken, options = {}) {
  try {
    assertString(postId, 'postId');
    const config = getConfig();
    const {
      fields = 'id,message,created_time,from,like_count,comment_count',
      limit = 25,
      order = 'chronological',

      apiOptions = {}
    } = options;

    assertObject(options, 'options');
    assertPositiveInteger(limit, 'options.limit');



    const params = { fields, limit, order };
    
    return await graphAPI(
      `${postId}/comments`,
      await resolveAccessToken(accessToken),
      'GET',
      params,
      apiOptions
    );

  } catch (error) {
    throw handleError(error, 'getComments', { postId, options });
  }
}


/**
 * Fetches likes from a Facebook post
 * @param {string} postId - Facebook post ID
 * @param {string} accessToken - Access token
 * @param {object} [options={}] - Query options
 * @returns {Promise<object>} Likes data
 */
export async function getLikes(postId, accessToken, options = {}) {
  try {
    assertString(postId, 'postId');
    const config = getConfig();
    const {
      fields = 'id,name,pic_square',
      limit = 25,
      summary = true,

      apiOptions = {}
    } = options;

    assertObject(options, 'options');
    assertPositiveInteger(limit, 'options.limit');



    const params = { fields, limit };
    if (summary) params.summary = 'true';
    
    return await graphAPI(
      `${postId}/likes`,
      await resolveAccessToken(accessToken),
      'GET',
      params,
      apiOptions
    );

  } catch (error) {
    throw handleError(error, 'getLikes', { postId, options });
  }
}

/**
 * Fetches user's profile picture
 * @param {string} userId - Facebook user ID (default: 'me')
 * @param {string} accessToken - Access token
 * @param {object} [options={}] - Picture options
 * @returns {Promise<object>} Picture data
 */
export async function getPicture(userId = 'me', accessToken, options = {}) {
  try {
    const {
      width = 200,
      height = 200,
      type = 'normal',
      redirect = false,
      apiOptions = {}
    } = options;

    const params = { width, height, type, redirect };
    
    return await graphAPI(
      `${userId}/picture`,
      accessToken,
      'GET',
      params,
      apiOptions
    );

  } catch (error) {
    throw handleError(error, 'getPicture', { userId, options });
  }
}