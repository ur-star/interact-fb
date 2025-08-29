Excellent suggestion! Adding more detail about `options`, `apiOptions`, and a clearer breakdown of error types will make the README even more helpful.

Here's the updated version with those additions:

---

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

## 🧩 Understanding `options` and `apiOptions`

Many functions in `interact-fb` accept an `options` object, and within that, you might see an `apiOptions` property. Here's the distinction:

*   **`options` (Function-specific):** This object contains parameters specific to the `interact-fb` function you're calling. These often control:
    *   **`fields`**: Which Graph API fields to request (e.g., `'id,name,email,picture'`). `interact-fb` provides sensible `DEFAULT.fields` for many functions, but you can override them here.
    *   **`limit`**: The number of items to return in a single API call (for paginated endpoints).
    *   **`since` / `until`**: Time-based filtering for posts or leads.
    *   **Library-specific behaviors**: Like `parallel` for fetching from multiple sources, or `maxLeads` for `getAllLeads`.

    **Example `options` for `getProfile`:**
    ```javascript
    const profile = await getProfile(accessToken, {
      fields: 'id,name,email,birthday', // Request specific fields
      // No other library-specific options for getProfile
    });
    ```

    **Example `options` for `getPagePosts`:**
    ```javascript
    const posts = await getPagePosts(pageId, pageAccessToken, {
      limit: 5, // Get only 5 posts
      since: '2023-01-01', // Posts published after this date
      fields: 'id,message,created_time,shares', // Specific post fields
    });
    ```

*   **`apiOptions` (Direct Graph API Parameters):** This is an object nested *inside* the main `options` object. Any key-value pairs you put in `apiOptions` are passed directly as query parameters to the underlying Facebook Graph API endpoint. This gives you maximum flexibility to use any Graph API parameter that `interact-fb` might not have a dedicated `option` for.

    **Example `apiOptions`:**
    ```javascript
    const posts = await getPagePosts(pageId, pageAccessToken, {
      limit: 10,
      apiOptions: {
        // 'filter' is a direct Graph API parameter for posts, not a top-level interact-fb option
        filter: 'app_created',
        // Request specific locale for messages (another direct API param)
        locale: 'es_LA',
      },
    });
    ```
    This would make an API call similar to `/{page-id}/posts?limit=10&filter=app_created&locale=es_LA`.

In summary:
*   Use top-level `options` for common, library-defined parameters.
*   Use `apiOptions` to pass any arbitrary, additional parameters directly to the Facebook Graph API.

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

`interact-fb` throws custom, descriptive error types for better error management. All custom errors extend from a base `InteractFBCustomError` for easy identification.

### Error Types Explained:

1.  **`FacebookSDKError`**
    *   **Meaning:** An error occurred during the initialization or operation of the Facebook JavaScript SDK itself. This often happens if the SDK fails to load, or if there's an issue with the `FB.init()` call.
    *   **Example Scenarios:** SDK script failed to download, `FB.init` failed, `initFacebookSdk` couldn't complete.
    *   **Action:** Check your `appId`, network connection, and browser environment.

2.  **`FacebookAuthError`**
    *   **Meaning:** An issue related to user authentication or the validity of an access token. This indicates a problem with the user's login status or the credentials being used.
    *   **Example Scenarios:** User denied login, access token is expired, invalid, or revoked.
    *   **Action:** Prompt the user to log in again via `loginWithFacebook()`, or ensure the access token you're providing is valid.

3.  **`FacebookAPIError`**
    *   **Meaning:** A general error returned directly by the Facebook Graph API, not specifically related to authentication or permissions. This could be due to malformed requests, invalid parameters, or issues with the requested resource.
    *   **Example Scenarios:** Requesting a non-existent post ID, providing an incorrect Graph API endpoint, Facebook's servers returning an internal error.
    *   **Action:** Review your function call parameters, the Graph API documentation for the endpoint you're hitting, and the error message for specific details.

4.  **`FacebookPermissionError`**
    *   **Meaning:** The Graph API request failed because the provided access token does not have the necessary permissions (scopes) to access the requested data or perform the requested action.
    *   **Example Scenarios:** Trying to get a user's email without the `email` permission, attempting to read page posts without `pages_read_engagement`, attempting to retrieve leads without `leads_retrieval`.
    *   **Action:** Use `loginWithFacebook()` to re-prompt the user to grant the required permissions, or check the token's current permissions with `hasPermissions()` or `getAllPermissions()`.

5.  **`FacebookTimeoutError`**
    *   **Meaning:** An API request took longer than the configured `timeout` duration and was aborted.
    *   **Example Scenarios:** Slow network conditions, Facebook's API taking an unusually long time to respond, or querying a very large dataset.
    *   **Action:** Increase the `timeout` value in `setConfig()`, optimize your Graph API queries (e.g., request fewer fields or a smaller `limit`), or handle the timeout gracefully.

### Consistent Error Handling Example:

```javascript
import {
  loginWithFacebook,
  getProfile,
  FacebookAuthError,
  FacebookPermissionError,
  FacebookAPIError,
  logError // For consistent logging
} from 'interact-fb';

async function getUserData() {
  try {
    // Attempt to log in and get necessary permissions
    await loginWithFacebook(['public_profile', 'email']);

    // Fetch the user profile
    const profile = await getProfile();
    console.log("User Profile:", profile);

  } catch (error) {
    if (error instanceof FacebookAuthError) {
      console.error('Authentication Error: Please log in again.', error.message);
      // Display a "Login with Facebook" button to the user
    } else if (error instanceof FacebookPermissionError) {
      console.error('Permission Error: Missing required access. Please grant permissions.', error.message);
      // Guide the user on which permissions are needed
    } else if (error instanceof FacebookAPIError) {
      console.error('Facebook API Error: Something went wrong with the request.', error.message);
      // Log the full error for debugging
      logError(error);
    } else {
      console.error('An unexpected error occurred:', error);
      logError(error);
    }
  }
}

getUserData();
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