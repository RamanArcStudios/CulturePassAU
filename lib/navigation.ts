import { Href, router } from 'expo-router';

/**
 * Prevents dead-end UX when a screen is opened from deep links/direct URLs
 * and there is no navigation history to pop.
 */
export function goBackOrReplace(fallback: Href) {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace(fallback);
}

