import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';

import { CacheService } from './cache.service';

type CacheOptions = {
  queryKeys?: string[];
  ttl?: number;
};

type MutationOptions = {
  invalidateQueries?: string[];
};

@Injectable({ providedIn: 'root' })
export class HttpClientService {
  private readonly apiBaseUrl = 'http://localhost:8000';

  constructor(
    private readonly http: HttpClient,
    private readonly cache: CacheService
  ) {}

  get<T>(
    url: string,
    options?: { params?: HttpParams },
    cacheOptions?: CacheOptions
  ): Observable<T> {
    const fullUrl = this.buildUrl(url);
    const cacheKey = this.buildCacheKey(fullUrl, options?.params);

    if (cacheOptions) {
      const cached = this.cache.get<T>(cacheKey);
      if (cached) return of(cached);
    }

    return this.http.get<T>(fullUrl, options).pipe(
      tap((data) => {
        if (!cacheOptions) return;
        this.cache.set(cacheKey, data, cacheOptions.ttl, cacheOptions.queryKeys);
      })
    );
  }

  post<T>(
    url: string,
    body: unknown,
    mutationOptions?: MutationOptions
  ): Observable<T> {
    return this.http.post<T>(this.buildUrl(url), body).pipe(
      tap(() => this.applyInvalidation(mutationOptions))
    );
  }

  put<T>(
    url: string,
    body: unknown,
    mutationOptions?: MutationOptions
  ): Observable<T> {
    return this.http.put<T>(this.buildUrl(url), body).pipe(
      tap(() => this.applyInvalidation(mutationOptions))
    );
  }

  delete<T>(url: string, mutationOptions?: MutationOptions): Observable<T> {
    return this.http.delete<T>(this.buildUrl(url)).pipe(
      tap(() => this.applyInvalidation(mutationOptions))
    );
  }

  private applyInvalidation(mutationOptions?: MutationOptions): void {
    if (!mutationOptions?.invalidateQueries?.length) return;
    this.cache.invalidateQueries(mutationOptions.invalidateQueries);
  }

  private buildUrl(url: string): string {
    if (url.startsWith('http')) return url;
    return `${this.apiBaseUrl}${url}`;
  }

  private buildCacheKey(url: string, params?: HttpParams): string {
    return `${url}?${params?.toString() ?? ''}`;
  }
}
