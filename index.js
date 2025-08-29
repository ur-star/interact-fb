// index.js

// Configuration
export { setConfig, getConfig, resetConfig, DEFAULT_CONFIG } from './src/config.js';

// Error handling
export {
  FacebookSDKError,
  FacebookAuthError,
  FacebookAPIError,
  FacebookPermissionError,
  FacebookTimeoutError,
  createFacebookError,
  handleError,
  logError
} from './src/errors.js';

// Utilities (token caching and validation)
export {
  resolveAccessToken,
  setAccessToken,
  clearAccessToken,
  getCachedAccessToken,
  assertString,
  assertPositiveInteger,
  assertObject
} from './src/utils.js';

// Core API
export { graphAPI, batchGraphAPI } from './src/graph.js';

// SDK Initialization
export { initFacebookSdk,getSDKStatus } from './src/initFacebookSDK.js';

// Authentication
export {
  loginWithFacebook,
  logoutFromFacebook,
  getLoginStatus,
  isLoggedIn,
  getAccessToken
} from './src/auth.js';

// Profile Management
export {
  getProfile,
  getProfilePicture,
  getBasicProfile,
} from './src/profile.js';

// Pages Management
export {
  getPages,
  getPageInfo,
  getManagedPage,
  managesPage
} from './src/pages.js';

// Posts Management
export {
  getPagePosts,
  getPostDetails,
} from './src/posts.js';

// Lead Forms Management
export {
  getLeadForms,
  getLeadFormDetails,
  getActiveLeadForms,
  getLeadFormsFromMultiplePages,
  getLeadFormStats
} from './src/forms.js';

// Leads Management
export {
  getLeads,
  getAllLeads,
  getLeadsFromMultipleForms,
  getLeadStats,
  getRecentLeads
} from './src/leads.js';

// Comments Management
export { getComments,getLikes } from './src/comments.js';



// Permissions Management
export {
  getAllPermissions,
  fetchAllPermissions,
  getAllRequiredPermissions
} from './src/permissions.js';

// Convenience exports with legacy names for backward compatibility
export { getProfile as fetchUserProfile } from './src/profile.js';
export { getPages as fetchUserPages } from './src/pages.js';
export { getPagePosts as fetchPagePosts } from './src/posts.js';
export { getLeadForms as fetchPageLeadForms } from './src/forms.js';
export { getLeads as fetchFormLeads } from './src/leads.js';
export { getComments as fetchPostComments } from './src/comments.js';
