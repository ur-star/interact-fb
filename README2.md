# Interact FB

**A robust and developer-friendly JavaScript client for the Facebook Graph API.**

`interact-fb` simplifies your interactions with the Facebook Graph API, providing a consistent and powerful way to fetch data, manage pages, and retrieve leads. It works seamlessly in both modern browsers (with the Facebook JS SDK) and Node.js environments (when you provide an access token).

---

## ✨ Key Features

*   **Easy Token Handling:** Automatically resolves access tokens from the Facebook SDK in browsers, or explicitly pass tokens for server-side operations.
*   **Strong Error Handling:** Custom error classes (`FacebookSDKError`, `FacebookAPIError`, etc.) and built-in retry logic ensure robust and predictable error management.
*   **Sensible Defaults:** Get started quickly with intelligent default fields and permissions, with the flexibility to override them as needed.
*   **Comprehensive Coverage:** Dedicated functions for profiles, pages, posts, comments, likes, lead forms, and leads.
*   **Batching & Paginating:** Efficiently make multiple API calls or automatically paginate through large datasets.

---

## 🚀 Installation

```bash
npm install interact-fb
```

---

## ⚡ Quick Start

### 🌐 Browser App (with Facebook SDK)

```javascript
import { initFacebookSdk, getProfile } from 'interact-fb';

// 1. Initialize the Facebook SDK
await initFacebookSdk('YOUR_APP_ID');

// 2. Get the current user's profile (requires user to be logged in via SDK)
const me = await getProfile();
console.log(me);
// Expected output: { id, name, email?, picture?, ... }
```

### 💻 Server-side (with an explicit Access Token)

If you already have a user or page access token (e.g., from a database or a previous OAuth flow), you can use `interact-fb` directly without the SDK.

```javascript
import { getPages } from 'interact-fb';

const USER_ACCESS_TOKEN = 'YOUR_USER_OR_PAGE_ACCESS_TOKEN';

// Get pages managed by the user
const pages = await getPages(USER_ACCESS_TOKEN);
console.log(pages);
// Expected output: { data: [{ id, name, access_token, ... }], paging? }
```

---

## 📖 Which function should I use?

`interact-fb` provides specialized functions for common Graph API tasks. Here's a guide:

### SDK & Auth 🔒

*   `initFacebookSdk(appId, options?)`: Initialize the Facebook JavaScript SDK.
*   `loginWithFacebook(scopes?, options?)`: Prompt the user to log in and grant permissions.
*   `logoutFromFacebook()`: Log the user out.
*   `isLoggedIn()`, `getAccessToken()`: Check login status or get the current access token.
*   `getLoginStatus()`, `getSDKStatus()`: Get detailed SDK/login state.

### User Profile 👤

*   `getBasicProfile(accessToken?)`: Fetch basic `id` and `name`.
*   `getProfile(accessToken?, options?)`: Fetch custom profile fields (`id,name,email,picture` etc.).
*   `getProfilePicture(accessToken?, options?)`: Get the user's profile picture.

### Pages 🏢

*   `getPages(accessToken?, options?)`: List pages the user manages.
*   `getManagedPage(pageId, accessToken?, options?)`: Get a specific managed page.
*   `managesPage(pageId, accessToken?)`: Check if the user manages a specific page.
*   `getPageInfo(pageId, accessToken?, options?)`: Get public information about any page.
*   `getPagesWithInsights(accessToken?, options?)`: Fetch pages including insight-like fields.

### Posts & Engagement 💬❤️

*   `getPagePosts(pageId, pageAccessToken?, options?)`: Get recent posts from a page.
*   `getPostDetails(postId, accessToken?, options?)`: Get full details for a specific post.
*   `getPostComments(postId, accessToken?, options?)`, `getComments()`: Fetch comments for a post.
*   `getPostLikes(postId, accessToken?, options?)`, `getLikes()`: Fetch likes for a post.
*   `getPagePostsWithEngagement(pageId, pageAccessToken?, options?)`: Get posts with embedded comments and likes in one call.

### Lead Forms 📝

*   `getLeadForms(pageId, accessToken?, options?)`: List lead forms for a page.
*   `getActiveLeadForms(pageId, accessToken?, options?)`: Get only active lead forms.
*   `getLeadFormDetails(formId, accessToken?, options?)`: Get questions and counts for a form.
*   `getLeadFormsFromMultiplePages(pageIds, accessToken?, options?)`: Fetch forms from several pages efficiently.
*   `getLeadFormStats(formId, accessToken?, options?)`: Quick summary stats for a form.

### Leads 📥

*   `getLeads(formId, accessToken?, options?)`: Fetch leads for a specific form.
*   `getAllLeads(formId, accessToken?, options?)`: Auto-paginate to fetch all leads from a form.
*   `getLeadsFromMultipleForms(formIds, accessToken?, options?)`: Fetch leads from multiple forms.
*   `getRecentLeads(formId, accessToken?, options?)`: Get leads from the last N hours.
*   `getFormattedLeads(formId, accessToken?, options?)`: Get leads with `field_data` flattened for easier use.
*   `getLeadsAsCSV(formId, accessToken?, options?)`: Export leads as a CSV string.
*   `getLeadStats(formId, accessToken?, options?)`: Get computed lead statistics.

### Permissions ✅

*   `hasPermissions(requiredPermissions, accessToken?)`: Check if specific permissions are granted.
*   `requirePermissions(requiredPermissions, accessToken?)`: Throws an error if required permissions are missing.
*   `fetchAllPermissions(accessToken?)`, `getAllPermissions(accessToken?)`: Fetch all granted permissions.

### Low-level Graph API Control ⚙️

*   `graphAPI(endpoint, accessToken, method='GET', params={}, options={})`: Make a single, direct Graph API call.
*   `batchGraphAPI(requests, accessToken, options?)`: Send multiple Graph API requests in one batch.

---

## ⚙️ Configuration

You can customize global settings like API version, timeouts, and retry logic.

```javascript
import { setConfig, getConfig, resetConfig, DEFAULT_CONFIG } from 'interact-fb';

// Set a custom Graph API version and timeout
setConfig({ version: 'v18.0', timeout: 15000 });

// View current config
console.log(getConfig());

// Reset to library defaults
resetConfig();
```

**Default configuration includes:**
*   `version`, `timeout`, `retryAttempts`, `retryDelay`
*   `defaultFields`: sensible default fields for profiles, pages, posts, lead forms, and leads.
*   `defaultPermissions`: common permissions like `public_profile`, `pages_show_list`, `leads_retrieval`, etc.

---

## ⚠️ Error Handling

`interact-fb` throws custom, descriptive error types for better error management:

*   `FacebookSDKError`: Issues with the Facebook JavaScript SDK.
*   `FacebookAuthError`: Problems with user authentication or access tokens.
*   `FacebookAPIError`: General Graph API errors (e.g., invalid parameters).
*   `FacebookPermissionError`: Missing or declined Facebook permissions.
*   `FacebookTimeoutError`: API requests timing out.

Errors are automatically logged to the console in `development` mode after all retry attempts fail. You can also import `handleError` and `logError` for consistent custom error processing.

```javascript
import { loginWithFacebook, FacebookAuthError } from 'interact-fb';

try {
  await loginWithFacebook(['email', 'public_profile']);
} catch (error) {
  if (error instanceof FacebookAuthError) {
    console.error('Login failed due to authentication issue:', error.message);
    // Prompt user to try again or explain permission requirements
  } else {
    console.error('An unexpected error occurred:', error);
  }
}
```

---

## 🔑 Access Token Handling & Caching

`interact-fb` intelligently handles access tokens to streamline your workflow:

*   **Auto-resolution (Browser):** In the browser, if no token is passed, functions will automatically attempt to resolve it from the Facebook SDK (if the user is logged in). This token is then cached with its expiry for efficient reuse.
*   **Explicit Tokens (Server/Node.js):** Always pass user or page access tokens explicitly to functions when running in a Node.js environment.
*   **Caching Utilities:**
    *   `resolveAccessToken(maybeToken, missingContext?, { useCache, forceRefresh })`: The internal method used to resolve and cache tokens.
    *   `setAccessToken(token, expiresInSeconds?)`: Manually add an access token to the cache.
    *   `clearAccessToken()`: Clear the cached token.
    *   `getCachedAccessToken()`: Retrieve the current valid cached token.

**Recommendations:**
*   **Browser Apps:** You can often rely on functions to auto-resolve tokens after `initFacebookSdk` and user login.
*   **Server Apps:** Always pass the appropriate user or page access token explicitly to each function call. If managing multiple user sessions, ensure tokens are correctly scoped per request.

---

## 📄 License

MIT

---
