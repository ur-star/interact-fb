// src/initFacebookSDK.js
import { getConfig } from "./config.js";
import { FacebookSDKError, handleError, logError } from "./errors.js";

let sdkLoadPromise = null;
let isSDKInitialized = false;

/**
 * Initializes the Facebook SDK with enhanced configuration options
 * @param {string} appId - Your Facebook App ID
 * @param {object} [options={}] - Optional settings
 * @param {string} [options.version] - FB Graph API version (defaults to config)
 * @param {number} [options.timeoutMs] - Timeout in milliseconds (defaults to config)
 * @param {boolean} [options.cookie=true] - Enable cookie support
 * @param {boolean} [options.xfbml=false] - Enable XFBML parsing
 * @param {string} [options.locale='en_US'] - SDK locale
 * @param {boolean} [options.frictionlessRequests=false] - Enable frictionless requests
 * @param {boolean} [options.autoLogAppEvents=true] - Enable automatic app event logging
 * @param {string} [options.status='connected'] - Check login status on init
 * @param {boolean} [options.forceReload=false] - Force reload SDK even if already loaded
 * @returns {Promise<object>} Resolves with SDK info when FB SDK is ready
 */
export function initFacebookSdk(appId, options = {}) {
  // If already initialized and not forcing reload, return existing promise
  if (sdkLoadPromise && !options.forceReload) {
    return sdkLoadPromise;
  }

  const config = getConfig();
  const {
    version = config.version,
    timeoutMs = config.timeout,
    cookie = true,
    xfbml = false,
    locale = "en_US",
    frictionlessRequests = false,
    autoLogAppEvents = true,
    status = false,
    forceReload = false,
  } = options;

  // Validate appId
  if (!appId || typeof appId !== "string") {
    const error = new FacebookSDKError(
      "Facebook App ID is required and must be a string",
      "INVALID_APP_ID"
    );
    logError(error);
    return Promise.reject(error);
  }

  sdkLoadPromise = new Promise((resolve, reject) => {
    // Check if SDK is already loaded and initialized
    if (
      !forceReload &&
      window.FB &&
      typeof window.FB.init === "function" &&
      isSDKInitialized
    ) {
      return resolve({
        sdk: "already_loaded",
        version: window.FB.options?.version || version,
        appId: window.FB.options?.appId || appId,
      });
    }

    const timeout = setTimeout(() => {
      const timeoutError = new FacebookSDKError(
        `Facebook SDK load timed out after ${timeoutMs}ms`,
        "SDK_LOAD_TIMEOUT"
      );
      logError(timeoutError);
      reject(timeoutError);
    }, timeoutMs);

    const clearTimeoutAndResolve = (result) => {
      clearTimeout(timeout);
      isSDKInitialized = true;
      resolve(result);
    };

    const clearTimeoutAndReject = (error) => {
      clearTimeout(timeout);
      const processedError = handleError(error, "initFacebookSdk", {
        appId,
        options,
      });
      logError(processedError);
      reject(processedError);
    };

    // Set up the async init callback BEFORE loading the script
    // This must be set globally before the SDK script loads
    window.fbAsyncInit = function () {
      try {
        const initOptions = {
          appId,
          cookie,
          xfbml,
          version,
          frictionlessRequests,
          autoLogAppEvents,
          status,
        };

        FB.init(initOptions);

        // Store options for reference
        FB.options = initOptions;

        // Verify SDK is working
        if (typeof FB.getLoginStatus === "function") {
          clearTimeoutAndResolve({
            sdk: "initialized",
            version,
            appId,
            options: initOptions,
          });
        } else {
          clearTimeoutAndReject(
            new FacebookSDKError(
              "Facebook SDK loaded but methods are not available",
              "SDK_METHODS_UNAVAILABLE"
            )
          );
        }
      } catch (error) {
        clearTimeoutAndReject(
          new FacebookSDKError(
            `Facebook SDK initialization failed: ${error.message}`,
            "SDK_INIT_FAILED"
          )
        );
      }
    };

    // Load the SDK script if not already present
    const existingScript = document.getElementById("facebook-jssdk");

    if (existingScript && !forceReload) {
      // Script exists, check if FB is available and trigger init
      if (window.FB && typeof window.FB.init === "function") {
        // SDK is loaded, trigger our init function
        window.fbAsyncInit();
      } else {
        // Script exists but SDK not ready, wait for it
        // The existing script will call fbAsyncInit when ready
      }
      return;
    }

    // Remove existing script if force reload
    if (existingScript && forceReload) {
      existingScript.remove();
    }

    // Create and load new script
    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = `https://connect.facebook.net/${locale}/sdk.js`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      // Script loaded successfully, fbAsyncInit should be called automatically
    };

    script.onerror = (event) => {
      clearTimeoutAndReject(
        new FacebookSDKError(
          "Failed to load Facebook SDK script. Check your internet connection and try again.",
          "SDK_SCRIPT_LOAD_FAILED"
        )
      );
    };

    // Insert script into DOM
    const firstScript = document.getElementsByTagName("script")[0];
    if (firstScript) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }
  });

  return sdkLoadPromise;
}

/**
 * Checks if Facebook SDK is loaded and initialized
 * @returns {boolean} Whether SDK is ready to use
 */
export function isSDKReady() {
  return !!(
    window.FB &&
    typeof window.FB.init === "function" &&
    typeof window.FB.login === "function" &&
    isSDKInitialized
  );
}

/**
 * Gets current SDK status and configuration
 * @returns {object|null} SDK status or null if not loaded
 */
export function getSDKStatus() {
  if (!isSDKReady()) {
    return null;
  }

  return {
    isReady: true,
    version: window.FB.options?.version || "unknown",
    appId: window.FB.options?.appId || "unknown",
    options: window.FB.options || {},
  };
}

/**
 * Waits for SDK to be ready with timeout
 * @param {number} [timeoutMs=5000] - Timeout in milliseconds
 * @returns {Promise<boolean>} Resolves to true when ready, rejects on timeout
 */
export function waitForSDK(timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    if (isSDKReady()) {
      return resolve(true);
    }

    const timeout = setTimeout(() => {
      reject(
        new FacebookSDKError(
          `SDK not ready after ${timeoutMs}ms`,
          "SDK_WAIT_TIMEOUT"
        )
      );
    }, timeoutMs);

    const checkReady = () => {
      if (isSDKReady()) {
        clearTimeout(timeout);
        resolve(true);
      } else {
        setTimeout(checkReady, 100);
      }
    };

    checkReady();
  });
}

/**
 * Reinitializes the Facebook SDK (useful for app ID changes)
 * @param {string} appId - New Facebook App ID
 * @param {object} [options={}] - Initialization options
 * @returns {Promise<object>} SDK initialization result
 */
export function reinitializeSDK(appId, options = {}) {
  // Reset state
  sdkLoadPromise = null;
  isSDKInitialized = false;

  // Force reload
  return initFacebookSdk(appId, { ...options, forceReload: true });
}

/**
 * Preloads Facebook SDK without initializing (useful for performance)
 * @param {string} [locale='en_US'] - SDK locale
 * @returns {Promise<void>} Resolves when script is loaded
 */
export function preloadSDK(locale = "en_US") {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (document.getElementById("facebook-jssdk")) {
      return resolve();
    }

    const script = document.createElement("script");
    script.id = "facebook-jssdk-preload";
    script.src = `https://connect.facebook.net/${locale}/sdk.js`;
    script.async = true;
    script.defer = true;

    script.onload = () => resolve();
    script.onerror = () =>
      reject(
        new FacebookSDKError(
          "Failed to preload Facebook SDK",
          "SDK_PRELOAD_FAILED"
        )
      );

    document.head.appendChild(script);
  });
}
