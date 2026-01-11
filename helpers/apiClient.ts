/**
 * API Client with CSRF token, automatic token refresh, and credentials support
 * Handles cross-origin requests to api.nanobase.org
 */

import { getValidToken, isTokenExpired } from "@/lib/token-manager";

export const apiRoot =
  process.env.NODE_ENV === "production"
    ? "https://api.nanobase.org/api/v1"
    : "http://localhost:3002/api/v1";

let csrfToken: string | null = null;

/**
 * Fetch CSRF token from the server
 * This should be called before making any POST/PUT/DELETE requests
 */
export async function fetchCSRFToken(): Promise<string> {
  try {
    // Make a GET request to any endpoint to receive CSRF token
    const response = await fetch(`${apiRoot}/auth/status`, {
      method: "GET",
      credentials: "include", // Important: send/receive cookies
    });

    // Get token from response header
    const token = response.headers.get("x-csrf-token");

    if (token) {
      csrfToken = token;
      return token;
    }

    throw new Error("CSRF token not received from server");
  } catch (error) {
    console.error("Failed to fetch CSRF token:", error);
    throw error;
  }
}

/**
 * Get the current CSRF token, fetching it if necessary
 */
async function getCSRFToken(): Promise<string> {
  if (!csrfToken) {
    return await fetchCSRFToken();
  }
  return csrfToken;
}

interface ApiRequestOptions extends RequestInit {
  skipCSRF?: boolean;
  skipAuth?: boolean;
}

/**
 * Make an API request with proper CSRF token, automatic token refresh, and credentials
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { skipCSRF = false, skipAuth = false, ...fetchOptions } = options;

  // Build headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };

  // Add auth token if available and not skipped (auto-refresh if needed)
  if (!skipAuth) {
    const token = await getValidToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  // Add CSRF token for state-changing requests
  const method = fetchOptions.method?.toUpperCase() || "GET";
  if (!skipCSRF && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    try {
      const token = await getCSRFToken();
      headers["X-CSRF-Token"] = token;
    } catch (error) {
      console.error("Failed to get CSRF token, retrying...", error);
      // Retry fetching CSRF token
      csrfToken = null;
      const token = await getCSRFToken();
      headers["X-CSRF-Token"] = token;
    }
  }

  // Make request with credentials
  const response = await fetch(`${apiRoot}${endpoint}`, {
    ...fetchOptions,
    headers,
    credentials: "include", // Always include credentials for cookies
  });

  // If CSRF token is invalid (403), retry with fresh token
  if (response.status === 403 && !skipCSRF) {
    const errorText = await response.text();
    if (errorText.includes("CSRF")) {
      console.log("CSRF token invalid, fetching new token and retrying...");
      csrfToken = null;
      const newToken = await getCSRFToken();
      headers["X-CSRF-Token"] = newToken;

      // Retry the request
      const retryResponse = await fetch(`${apiRoot}${endpoint}`, {
        ...fetchOptions,
        headers,
        credentials: "include",
      });

      if (!retryResponse.ok) {
        const errorData = await retryResponse.json().catch(() => ({}));
        throw new Error(errorData.message || `API request failed: ${retryResponse.statusText}`);
      }

      return await retryResponse.json();
    }
  }

  // Handle 401 Unauthorized with token refresh retry
  if (response.status === 401 && !skipAuth) {
    console.log('[API] Got 401, attempting token refresh and retry');
    try {
      const newToken = await getValidToken();
      if (newToken) {
        headers["Authorization"] = `Bearer ${newToken}`;

        // Retry request with new token
        const retryResponse = await fetch(`${apiRoot}${endpoint}`, {
          ...fetchOptions,
          headers,
          credentials: "include",
        });

        if (retryResponse.ok) {
          // Update CSRF token from response header if present
          const newCsrfToken = retryResponse.headers.get("x-csrf-token");
          if (newCsrfToken) {
            csrfToken = newCsrfToken;
          }

          return await retryResponse.json();
        }

        // If retry still fails with 401, redirect to login
        if (retryResponse.status === 401) {
          console.error('[API] Token refresh retry failed, redirecting to login');
          localStorage.removeItem('token');
          window.location.href = '/sign-in';
          throw new Error('Session expired. Please log in again.');
        }

        const errorData = await retryResponse.json().catch(() => ({}));
        throw new Error(errorData.message || `API request failed: ${retryResponse.statusText}`);
      }
    } catch (refreshError) {
      console.error('[API] Token refresh failed:', refreshError);
      localStorage.removeItem('token');
      window.location.href = '/sign-in';
      throw refreshError;
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API request failed: ${response.statusText}`);
  }

  // Update CSRF token from response header if present
  const newToken = response.headers.get("x-csrf-token");
  if (newToken) {
    csrfToken = newToken;
  }

  return await response.json();
}

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
  get: <T = any>(endpoint: string, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: "GET" }),

  post: <T = any>(endpoint: string, data?: any, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    }),

  put: <T = any>(endpoint: string, data?: any, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    }),

  patch: <T = any>(endpoint: string, data?: any, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: <T = any>(endpoint: string, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: "DELETE" }),
};
