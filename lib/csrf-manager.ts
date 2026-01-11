/**
 * CSRF Token Management
 *
 * The backend uses double-submit cookie pattern:
 * - Sets token in httpOnly cookie (csrf_token)
 * - Also sends token in x-csrf-token response header
 * - Clients must send token back in X-CSRF-Token request header
 */

const CSRF_STORAGE_KEY = 'csrf_token';

/**
 * Get API base URL
 */
function getApiBaseUrl(): string {
  return process.env.NODE_ENV === 'production'
    ? 'https://api.nanobase.org'
    : 'http://localhost:3002';
}

/**
 * Fetch CSRF token from server
 * Makes a simple GET request to trigger token generation
 */
export async function fetchCSRFToken(): Promise<string | null> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/v1/public/health`, {
      method: 'GET',
      credentials: 'include', // Important: send/receive cookies
    });

    // Token is in response header
    const token = response.headers.get('x-csrf-token');

    if (token) {
      localStorage.setItem(CSRF_STORAGE_KEY, token);
      console.log('[CSRF] Token fetched and stored');
      return token;
    }

    return null;
  } catch (error) {
    console.error('[CSRF] Failed to fetch token:', error);
    return null;
  }
}

/**
 * Get stored CSRF token
 */
export function getCSRFToken(): string | null {
  return localStorage.getItem(CSRF_STORAGE_KEY);
}

/**
 * Clear CSRF token (on logout)
 */
export function clearCSRFToken(): void {
  localStorage.removeItem(CSRF_STORAGE_KEY);
}

/**
 * Update CSRF token from response headers
 * Call this after login or when backend regenerates token
 */
export function updateCSRFTokenFromResponse(response: Response): void {
  const token = response.headers.get('x-csrf-token');
  if (token) {
    localStorage.setItem(CSRF_STORAGE_KEY, token);
    console.log('[CSRF] Token updated from response');
  }
}

/**
 * Ensure CSRF token is available
 * Fetches if not present
 */
export async function ensureCSRFToken(): Promise<string | null> {
  let token = getCSRFToken();

  if (!token) {
    token = await fetchCSRFToken();
  }

  return token;
}
