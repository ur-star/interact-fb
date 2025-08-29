// src/config.js

/**
 * Default configuration for the Facebook SDK and API calls
 */
export const DEFAULT_CONFIG = {
  version: 'v23.0',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
  defaultFields: {
    profile: 'id,name,email,picture',
    pages: 'id,name,access_token,category,tasks',
    posts: 'id,message,created_time,full_picture,attachments{media},shares,likes.summary(true),comments.summary(true)',
    leadForms: 'id,name,status,leads_count,created_time',
    leads: 'id,created_time,field_data'
  },
  defaultPermissions: {
    basic: ['public_profile', 'email'],
    pages: ['pages_show_list', 'pages_read_engagement'],
    leads: ['leads_retrieval'],
    posts: ['pages_read_engagement']
  }
};

/**
 * Global configuration object
 */
let globalConfig = { ...DEFAULT_CONFIG };

/**
 * Updates global configuration
 * @param {object} newConfig - Configuration updates
 */
export function setConfig(newConfig) {
  globalConfig = { ...globalConfig, ...newConfig };
}

/**
 * Gets current configuration
 * @returns {object} Current configuration
 */
export function getConfig() {
  return { ...globalConfig };
}

/**
 * Resets configuration to defaults
 */
export function resetConfig() {
  globalConfig = { ...DEFAULT_CONFIG };
}