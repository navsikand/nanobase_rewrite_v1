/**
 * Token refresh and automatic renewal logic
 * Compatible with architecture document Issue 3 solution
 */

// Refresh token 1 hour before expiration (for 24h tokens)
const TOKEN_REFRESH_THRESHOLD = 60 * 60 * 1000; // 1 hour in milliseconds
let refreshPromise: Promise<string> | null = null;

/**
 * Get API base URL based on environment
 */
function getApiBaseUrl(): string {
  return process.env.NODE_ENV === 'production'
    ? 'https://api.nanobase.org'
    : 'http://localhost:3002';
}

/**
 * Decode JWT to get expiration time
 */
function getTokenExpiration(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000; // Convert to milliseconds
  } catch {
    return null;
  }
}

/**
 * Check if token needs refresh
 * Returns true if token will expire within TOKEN_REFRESH_THRESHOLD
 */
export function shouldRefreshToken(token: string): boolean {
  const expiration = getTokenExpiration(token);
  if (!expiration) return false;

  return Date.now() >= (expiration - TOKEN_REFRESH_THRESHOLD);
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const expiration = getTokenExpiration(token);
  if (!expiration) return true;

  return Date.now() >= expiration;
}

/**
 * Refresh access token using refresh token (from HttpOnly cookie)
 */
export async function refreshAccessToken(): Promise<string> {
  // Prevent multiple simultaneous refresh requests
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/v1/refresh`, {
        method: 'POST',
        credentials: 'include', // Send HttpOnly cookie with refresh token
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      const newAccessToken = data.accessToken;

      // Store new access token
      localStorage.setItem('token', newAccessToken);
      console.log('[TokenManager] Access token refreshed successfully');

      return newAccessToken;
    } catch (error) {
      console.error('[TokenManager] Token refresh failed:', error);
      // Clear tokens and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/sign-in';
      throw error;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Get valid token (refreshes if needed)
 * Returns null if no token or refresh fails
 */
export async function getValidToken(): Promise<string | null> {
  const token = localStorage.getItem('token');
  if (!token) return null;

  // Check if token is expired
  if (isTokenExpired(token)) {
    console.log('[TokenManager] Token expired, attempting refresh');
    try {
      return await refreshAccessToken();
    } catch {
      return null;
    }
  }

  // Check if token needs refresh soon
  if (shouldRefreshToken(token)) {
    console.log('[TokenManager] Token expiring soon, refreshing');
    try {
      return await refreshAccessToken();
    } catch {
      // If refresh fails but token not expired yet, return current token
      return token;
    }
  }

  return token;
}

/**
 * Decode token payload
 */
export function decodeToken(token: string): any {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}
