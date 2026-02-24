export type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

export interface CacheService {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T, ttlMs?: number): void;
  del(key: string): void;
  flush(): void;
}

/**
 * In-memory TTL cache with a Redis-like API shape so we can swap in Redis later.
 */
export class InMemoryTtlCache implements CacheService {
  private store = new Map<string, CacheEntry<unknown>>();
  constructor(private readonly defaultTtlMs = 60_000) {}

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs = this.defaultTtlMs): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  del(key: string): void {
    this.store.delete(key);
  }

  flush(): void {
    this.store.clear();
  }
}
