# Interact FB

A robust, developer-friendly client for Facebook Graph API. Works in modern browsers with the Facebook JS SDK and in Node.js when you provide an access token.

- Easy token handling: pass a token or let the SDK resolve it automatically
- Strong error handling: consistent custom error classes and retry logic
- Sensible defaults with opt-in overrides

## Installation

```bash
npm install interact-fb
```


## Quick start

```javascript
import { initFacebookSdk, getProfile } from 'interact-fb';

await initFacebookSdk('YOUR_APP_ID');
const me = await getProfile();
console.log(me); // { id, name, email?, picture?, ... }
```

If you already have an access token (e.g., server-side), pass it explicitly to any function instead of relying on the SDK.

```javascript
import { getPages } from 'interact-fb';

const pages = await getPages('USER_ACCESS_TOKEN');
```

## Which function to use when

- You are building a browser app and need the FB SDK: use `initFacebookSdk`, then `getSDKStatus` or `isSDKReady`/`waitForSDK`.
- You need the user to log in and grant permissions: use `loginWithFacebook` (pass scopes you need).
- You just want to know if a user is logged in or get their token: use `isLoggedIn` and `getAccessToken`.
- You need the current user's profile:
  - Basic info only: `getBasicProfile`
  - Custom fields: `getProfile({ fields: 'id,name,email,picture' })`
  - Profile picture: `getProfilePicture`
- You need the pages a user manages or info about a page:
  - List managed pages: `getPages`
  - Get one page by id from managed list: `getManagedPage`
  - Check whether a user manages a page: `managesPage`
  - Fetch public page info: `getPageInfo`
  - Pages with extra counts (insights-like fields): `getPagesWithInsights`
- You are working with posts and engagement:
  - Recent page posts: `getPagePosts`
  - Full post details: `getPostDetails`
  - Post comments: `getPostComments` (or shortcut `getComments`)
  - Post likes: `getPostLikes` (or shortcut `getLikes`)
  - Posts with embedded comments/likes in one call: `getPagePostsWithEngagement`
- You are working with lead forms:
  - List lead forms for a page: `getLeadForms`
  - Only active forms: `getActiveLeadForms`
  - Form details (questions, counts): `getLeadFormDetails`
  - Forms across multiple pages: `getLeadFormsFromMultiplePages`
  - Quick counts/summary: `getLeadFormStats`
- You are working with leads:
  - Fetch page-by-page: `getLeads`
  - Fetch all (auto-pagination): `getAllLeads`
  - Fetch from many forms: `getLeadsFromMultipleForms`
  - Recent leads window: `getRecentLeads({ hours })`
  - Developer-friendly shape (flatten field_data): `getFormattedLeads`
  - Export to CSV: `getLeadsAsCSV`
  - Computed stats: `getLeadStats`
- You need to handle permissions:
  - Proactively request during login: use `loginWithFacebook(scopes)`
  - Inspect current scopes if needed: `getAllRequiredPermissions`, `getAllPermissions`, `fetchAllPermissions`
  - If an API call fails with PERMISSION_DENIED, prompt the user to re-login with required scopes
- You need maximum control over the Graph API:
  - Single request: `graphAPI`
  - Many requests together: `batchGraphAPI`

Notes:
- In the browser, if you don’t pass a token, functions auto-resolve it from the SDK (user must be logged in).
- On the server, always pass a user or page token explicitly.

## Errors
All functions may throw custom error types:
- FacebookSDKError
- FacebookAuthError
- FacebookAPIError
- FacebookPermissionError
- FacebookTimeoutError

Errors are automatically logged to console in development mode only after all retry attempts fail. You can also import `handleError` and `logError` for consistent processing.

## Configuration
```javascript
import { setConfig, getConfig, resetConfig, DEFAULT_CONFIG } from 'interact-fb';

setConfig({ version: 'v23.0', timeout: 15000 });
```
Config defaults include:
- version, timeout, retryAttempts, retryDelay
- defaultFields: profile, pages, posts, leadForms, leads
- defaultPermissions: basic, pages, leads, posts

## SDK Initialization
### initFacebookSdk(appId, options?)
Initializes the FB JS SDK in the browser.
- Returns: Promise<{ sdk: 'initialized'|'already_loaded', version, appId, options }>
- Throws: FacebookSDKError on load/init failures

```javascript
await initFacebookSdk('APP_ID', { xfbml: true, locale: 'en_US' });
```

### getSDKStatus()
- Returns: { isReady, version, appId, options } | null

## Auth
### loginWithFacebook(scope?, options?)
Prompts login via the SDK. `scope` can be string or string[].
- Returns: Promise<{ accessToken, expiresIn, userID, grantedScopes[], deniedScopes[], status }>
- Throws: FacebookSDKError, FacebookAuthError

### logoutFromFacebook()
- Returns: Promise<any>

### getLoginStatus()
- Returns: Promise<{ status: 'connected'|'not_authorized'|'unknown', authResponse? }>

### isLoggedIn(), getAccessToken()
- Returns: Promise<boolean> or Promise<string|null>

## Graph API
### graphAPI(endpoint, accessToken, method='GET', params={}, options={})
Low-level client with retries and timeouts.
- Returns: Promise<any> (raw Graph response)
- Throws: FacebookAPIError and friends

### batchGraphAPI(requests, accessToken, options?)
- Returns: Promise<Array<any>>

## Profile
### getProfile(accessToken?, options?)
Fetches current user profile.
- Options: { fields=DEFAULT.profile, apiOptions }
- Returns: Promise<object>

### getBasicProfile(accessToken?)
- Returns: Promise<{ id, name }>

### getProfilePicture(accessToken, options?)
Fetches `me/picture`.
- Options: { width=200, height=200, type='normal', redirect=false }
- Returns: Promise<object> (picture metadata or URL depending on params)

## Pages
### getPages(accessToken?, options?)
Fetches pages the user manages.
- Options: { fields=DEFAULT.pages, limit?, apiOptions }
- Returns: Promise<{ data: Array<{ id, name, access_token, ... }>, paging? }>

### getPageInfo(pageId, accessToken, options?)
- Options: { fields, apiOptions }
- Returns: Promise<object>

### getManagedPage(pageId, accessToken, options?)
- Returns: Promise<object|null>

### managesPage(pageId, accessToken)
- Returns: Promise<boolean>

## Posts
### getPagePosts(pageId, pageAccessToken?, options?)
- Options: { limit=10, fields=DEFAULT.posts, since?, until?, apiOptions }
- Returns: Promise<{ data: Array<Post>, paging? }>

### getPostDetails(postId, accessToken?, options?)
- Options: { fields, apiOptions }
- Returns: Promise<object>

## Comments (shortcuts)
### getComments(postId, accessToken?, options?)
- Same as getPostComments

### getLikes(postId, accessToken?, options?)
- Same as getPostLikes

## Lead Forms
### getLeadForms(pageId, accessToken?, options?)
- Options: { fields=DEFAULT.leadForms, limit?, status?, apiOptions }
- Returns: Promise<{ data: Array<LeadForm>, paging? }>

### getLeadFormDetails(formId, accessToken?, options?)
- Options: { fields, apiOptions }
- Returns: Promise<object>

### getActiveLeadForms(pageId, accessToken?, options?)
- Returns: Promise<{ data: Array<LeadForm>, paging? }>

### getLeadFormsFromMultiplePages(pageIds, accessToken?, options?)
- Options: { parallel=true, ...getLeadForms options }
- Returns: Promise<Record<pageId, forms|{error}>>

### getLeadFormStats(formId, accessToken?, options?)
- Returns: Promise<{ leads_count, expired_leads_count, created_time, status }>

## Leads
### getLeads(formId, accessToken?, options?)
- Options: { fields=DEFAULT.leads, limit=25, after?, since?, until?, apiOptions }
- Returns: Promise<{ data: Array<Lead>, paging? }>

### getAllLeads(formId, accessToken?, options?)
Auto-paginates until all fetched or `maxLeads` reached.
- Options: { maxLeads=10000, ...getLeads options }
- Returns: Promise<Array<Lead>>

### getLeadsFromMultipleForms(formIds, accessToken?, options?)
- Options: { parallel=true, ...getLeads options }
- Returns: Promise<Record<formId, leads|{error}>>

### getRecentLeads(formId, accessToken?, options?)
- Options: { hours=24, ...getLeads options }
- Returns: Promise<{ data: Array<Lead>, paging? }>

### getLeadStats(formId, accessToken?, options?)
- Returns: Promise<{ formId, totalLeads, expiredLeads, formStatus, formCreated, leadsLast24Hours, activeLeads }>

## Permissions

### getAllRequirePermissions(requiredPermissions, accessToken?)
Throws if any required permission is missing. Use this for explicit permission validation when needed.
- Returns: Promise<void>

### fetchAllPermissions(accessToken?)
Fetches `me?fields=permissions`.
- Returns: Promise<{ permissions: { data: Array<{ permission, status }> } } | { data: Array<{ permission, status }> }>

### getAllPermissions(accessToken?)
- Returns: Promise<string[]> (granted permissions only)

## Token handling and caching
This package can automatically resolve tokens from the FB SDK in the browser and caches them to avoid repeated lookups.

- `resolveAccessToken(maybeToken, missingContext?, { useCache=true, forceRefresh=false })`: resolves a token (returns input if provided) and caches SDK tokens with their expiry. In-flight lookups are deduplicated.
- `setAccessToken(token, expiresInSeconds?)`: manually seed the cache (useful on server after login flow). If no expiry is provided, defaults to 1 hour.
- `clearAccessToken()`: clears the cache and any in-flight resolution.
- `getCachedAccessToken()`: returns the cached token if valid, otherwise null.

Recommendations:
- Browser: you can rely on auto-resolution; functions will request a token from the SDK once and reuse it.
- Server: always pass a user/page token explicitly, or pre-seed with `setAccessToken` per request scope.

## Notes
- If you do not pass an access token, the SDK must be loaded in the browser and the user must be logged in.
- On servers, always pass a token explicitly.
- Pay attentions to scopes that you pass in as fields. (eg. {fields:"id,name,status,leads_count,created_time"})
## License
MIT
