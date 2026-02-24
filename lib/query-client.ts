import { fetch } from 'expo/fetch';
import { Platform } from 'react-native';
import { QueryClient, QueryFunction } from '@tanstack/react-query';

function normalizeBaseUrl(url: string): string {
  return url.endsWith('/') ? url : `${url}/`;
}

/**
 * Resolves API base URL for native and web runtime.
 * Priority order:
 *   1. EXPO_PUBLIC_API_URL (explicit, recommended for production)
 *   2. EXPO_PUBLIC_DOMAIN  (legacy Replit fallback)
 *   3. window.location.origin (web only)
 *   4. http://localhost:5000/ (local dev fallback)
 */
export function getApiUrl(): string {
  const explicit = process.env.EXPO_PUBLIC_API_URL;
  if (explicit) {
    return normalizeBaseUrl(explicit);
  }

  const host = process.env.EXPO_PUBLIC_DOMAIN;
  if (host) {
    return normalizeBaseUrl(`https://${host}`);
  }

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return normalizeBaseUrl(window.location.origin);
  }

  return 'http://localhost:5000/';
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  route: string,
  data?: unknown | undefined,
): Promise<Response> {
  const baseUrl = getApiUrl();
  const url = new URL(route, baseUrl);

  const res = await fetch(url.toString(), {
    method,
    headers: data ? { 'Content-Type': 'application/json' } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: 'include',
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = 'returnNull' | 'throw';
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const baseUrl = getApiUrl();
    const url = new URL(queryKey.join('/') as string, baseUrl);

    const res = await fetch(url.toString(), {
      credentials: 'include',
    });

    if (unauthorizedBehavior === 'returnNull' && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

/**
 * Determines whether a failed query should be retried.
 * Skips retry for client errors (4xx) that won't resolve on their own.
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= 2) return false;
  if (error instanceof Error) {
    const status = Number(error.message.split(':')[0]);
    if (status >= 400 && status < 500) return false;
  }
  return true;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: 'throw' }),
      staleTime: 60_000,
      gcTime: 300_000,
      refetchInterval: false,
      refetchOnWindowFocus: false,
      retry: shouldRetry,
    },
    mutations: {
      retry: 1,
    },
  },
});
