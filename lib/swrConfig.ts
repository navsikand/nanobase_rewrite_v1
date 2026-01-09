import { SWRConfiguration } from 'swr';

/**
 * Phase 2.1: SWR Configuration Optimization
 * Global configuration for SWR to reduce API calls and improve caching
 */
export const defaultSWRConfig: SWRConfiguration = {
  // Request deduplication: within 2 seconds, same URL reuses cached data
  dedupingInterval: 2000,

  // Revalidation intervals
  revalidateOnFocus: false,        // Don't refetch when tab regains focus
  revalidateOnReconnect: true,     // Do refetch when network reconnects
  focusThrottleInterval: 300000,   // If enabled, throttle to 5 minutes
  refreshInterval: 0,              // Don't auto-refresh (manual or manual trigger only)

  // Error handling
  shouldRetryOnError: true,
  errorRetryCount: 3,
  errorRetryInterval: 5000,

  // Custom fetcher with error handling and timeout
  fetcher: async (url: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const error = new Error('API request failed');
        (error as any).status = res.status;
        (error as any).info = await res.json().catch(() => ({}));
        throw error;
      }

      return res.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  },
};
