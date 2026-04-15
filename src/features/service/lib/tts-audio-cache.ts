import type { ApiPhilosopher } from "@/features/service/api/chat-api";

const MAX_CACHE_ITEMS = 100;
const MAX_CACHE_BYTES = 25 * 1024 * 1024;

const ttsBlobCache = new Map<string, Blob>();
let cachedBytes = 0;

function makeKey(philosopherId: ApiPhilosopher, text: string): string {
  return `${philosopherId}::${text.trim()}`;
}

function touchEntry(cacheKey: string, value: Blob): void {
  ttsBlobCache.delete(cacheKey);
  ttsBlobCache.set(cacheKey, value);
}

function evictIfNeeded(): void {
  while (ttsBlobCache.size > MAX_CACHE_ITEMS || cachedBytes > MAX_CACHE_BYTES) {
    const oldestEntry = ttsBlobCache.entries().next().value;
    if (!oldestEntry) {
      return;
    }
    const [oldestKey, oldestBlob] = oldestEntry;
    ttsBlobCache.delete(oldestKey);
    cachedBytes -= oldestBlob.size;
  }
}

export function getCachedTtsBlob(philosopherId: ApiPhilosopher, text: string): Blob | null {
  const cacheKey = makeKey(philosopherId, text);
  const cachedBlob = ttsBlobCache.get(cacheKey);
  if (!cachedBlob) {
    return null;
  }
  touchEntry(cacheKey, cachedBlob);
  return cachedBlob;
}

export function setCachedTtsBlob(philosopherId: ApiPhilosopher, text: string, blob: Blob): void {
  const cacheKey = makeKey(philosopherId, text);
  const existingBlob = ttsBlobCache.get(cacheKey);
  if (existingBlob) {
    cachedBytes -= existingBlob.size;
  }

  ttsBlobCache.set(cacheKey, blob);
  cachedBytes += blob.size;
  evictIfNeeded();
}
