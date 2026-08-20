"use client";

import { useEffect } from "react";

// The admin PWA's service worker used to register with the default (site-wide)
// scope instead of being scoped to /admin, so it silently took over every page,
// including the public storefront, for anyone who had ever opened /admin on that
// browser. Its fetch handler could also resolve to `undefined` on failure,
// producing "Failed to convert value to 'Response'" errors and broken page loads.
// This unregisters any leftover site-wide registration so those browsers recover.
export function SwScopeCleanup() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        if (registration.scope === `${location.origin}/`) {
          registration.unregister();
        }
      }
    });
  }, []);

  return null;
}
