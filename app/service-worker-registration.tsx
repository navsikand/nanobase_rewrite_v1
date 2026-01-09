"use client";

import { useEffect } from "react";

/**
 * Phase 2.3: Service Worker Registration
 * Registers the service worker and checks for updates periodically
 * 
 * SECURITY NOTE: Consider clearing service worker caches on logout to prevent
 * data leakage between different users on the same device.
 * Implement this in your logout handler:
 * 
 * if ('serviceWorker' in navigator) {
 *   caches.keys().then(names => {
 *     names.forEach(name => caches.delete(name));
 *   });
 * }
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator && typeof window !== "undefined") {
      let updateInterval: NodeJS.Timeout | undefined;

      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          console.log("Service Worker registered:", registration);

          // Check for updates periodically (every minute)
          updateInterval = setInterval(() => {
            registration.update();
          }, 60000);
        })
        .catch((error) => {
          console.log("Service Worker registration failed:", error);
        });

      // Cleanup: clear interval when component unmounts
      return () => {
        if (updateInterval) {
          clearInterval(updateInterval);
        }
      };
    }
  }, []);

  return null;
}
