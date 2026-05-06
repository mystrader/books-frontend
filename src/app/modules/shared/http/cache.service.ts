import { Injectable } from '@angular/core';

type CacheEntry<T> = {
  data: T;
  timestamp: number;
  ttl: number;
};

@Injectable({ providedIn: 'root' })
export class CacheService {
  private readonly store = new Map<string, CacheEntry<unknown>>();
  private readonly queryIndex = new Map<string, Set<string>>();

  get<T>(key: string): T | null {
    const value = this.store.get(key);
    if (!value) return null;

    const isExpired = Date.now() - value.timestamp > value.ttl;
    if (isExpired) {
      this.store.delete(key);
      return null;
    }

    return value.data as T;
  }

  set<T>(key: string, data: T, ttl = 300_000, queryKeys: string[] = []): void {
    this.store.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });

    queryKeys.forEach((queryKey) => {
      if (!this.queryIndex.has(queryKey)) {
        this.queryIndex.set(queryKey, new Set<string>());
      }
      this.queryIndex.get(queryKey)?.add(key);
    });
  }

  invalidateQueries(queryKeys: string[]): void {
    queryKeys.forEach((queryKey) => {
      const cacheKeys = this.queryIndex.get(queryKey);
      if (!cacheKeys) return;

      cacheKeys.forEach((cacheKey) => this.store.delete(cacheKey));
      this.queryIndex.delete(queryKey);
    });
  }
}
