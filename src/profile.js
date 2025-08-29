// src/profile.js
import { graphAPI } from './graph.js';
import { getConfig } from './config.js';
import { handleError } from './errors.js';
import { resolveAccessToken, assertObject } from './utils.js';

/**
 * Fetches the current user's Facebook profile with configurable fields
 * @param {string} accessToken - Facebook access token
 * @param {string|object} [options] - Fields string or options object
 * @param {string} [options.fields] - Comma-separated fields to request

 * @param {object} [options.apiOptions] - Additional options for Graph API call
 * @returns {Promise<object>} Facebook user profile data
 */
export async function getProfile(accessToken, options = {}) {
  try {
    const config = getConfig();
    
    // Handle backward compatibility - if options is a string, treat it as fields
    let settings;
    if (typeof options === 'string') {
      settings = { fields: options };
    } else {
      settings = options;
    }

    const {
      fields = config.defaultFields.profile,
      apiOptions = {}
    } = settings;

    // Validate options
    assertObject(settings, 'options');



    // Fetch profile data
    const profileData = await graphAPI(
      'me',
      await resolveAccessToken(accessToken),
      'GET',
      { fields },
      apiOptions
    );

    return profileData;

  } catch (error) {
    throw handleError(
      error,
      'getProfile',
      { fields: options.fields || options }
    );
  }
}

/**
 * Fetches user's profile picture with customizable options
 * @param {string} accessToken - Facebook access token
 * @param {object} [options={}] - Picture options
 * @param {number} [options.width=200] - Picture width
 * @param {number} [options.height=200] - Picture height
 * @param {string} [options.type='normal'] - Picture type (small, normal, large, square)
 * @param {boolean} [options.redirect=false] - Whether to redirect to picture URL
 * @returns {Promise<object>} Picture data with URL and dimensions
 */
export async function getProfilePicture(accessToken, options = {}) {
  try {
    const {
      width = 200,
      height = 200,
      type = 'normal',
      redirect = false
    } = options;

    const params = {
      width,
      height,
      type,
      redirect
    };

    const pictureData = await graphAPI(
      'me/picture',
      accessToken,
      'GET',
      params
    );

    return pictureData;

  } catch (error) {
    throw handleError(
      error,
      'getProfilePicture',
      { options }
    );
  }
}

/**
 * Fetches basic user info (id, name) - minimal permissions required
 * @param {string} accessToken - Facebook access token
 * @returns {Promise<object>} Basic user info
 */
export async function getBasicProfile(accessToken) {
  return await getProfile(accessToken, {
    fields: 'id,name'
  });
}

