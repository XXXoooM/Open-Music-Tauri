/**
 * 全局统一多维缓存管理器 (Cache Manager)
 * 支持 L1 内存 LRU + L2 本地持久化双层存储、TTL 过期及容量统计
 */
export const CACHE_PREFIX = 'om_cache_v3_';
const MAX_MEM_ENTRIES = 200;

interface CacheEnvelope<T> {
  value: T;
  expireAt?: number;
  lastAccessed: number;
}

const memoryCache = new Map<string, CacheEnvelope<unknown>>();

function evictOldestMemory(): void {
  if (memoryCache.size >= MAX_MEM_ENTRIES) {
    const oldestKey = memoryCache.keys().next().value;
    if (oldestKey) memoryCache.delete(oldestKey);
  }
}

function removeStorage(fullKey: string): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(fullKey);
  } catch {}
}

/** 读取缓存（先 L1 内存，未命中则查 L2 本地存储） */
export function getCacheItem<T>(key: string): T | null {
  if (!key) return null;
  const fullKey = `${CACHE_PREFIX}${key}`;
  const now = Date.now();

  if (memoryCache.has(fullKey)) {
    const item = memoryCache.get(fullKey) as CacheEnvelope<T>;
    if (item.expireAt && item.expireAt < now) {
      memoryCache.delete(fullKey);
      removeStorage(fullKey);
      return null;
    }
    item.lastAccessed = now;
    memoryCache.delete(fullKey);
    memoryCache.set(fullKey, item as CacheEnvelope<unknown>);
    return item.value;
  }

  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(fullKey);
      if (!raw) return null;
      const envelope = JSON.parse(raw) as CacheEnvelope<T>;
      if (envelope.expireAt && envelope.expireAt < now) {
        localStorage.removeItem(fullKey);
        return null;
      }
      envelope.lastAccessed = now;
      evictOldestMemory();
      memoryCache.set(fullKey, envelope as CacheEnvelope<unknown>);
      return envelope.value;
    }
  } catch {}
  return null;
}

/** 写入缓存（同步写入 L1 内存与 L2 本地持久化） */
export function setCacheItem<T>(key: string, value: T, ttlMs?: number): void {
  if (!key || value === undefined || value === null) return;
  const fullKey = `${CACHE_PREFIX}${key}`;
  const now = Date.now();
  const envelope: CacheEnvelope<T> = {
    value,
    expireAt: ttlMs && ttlMs > 0 ? now + ttlMs : undefined,
    lastAccessed: now,
  };
  evictOldestMemory();
  memoryCache.set(fullKey, envelope as CacheEnvelope<unknown>);
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(fullKey, JSON.stringify(envelope));
    }
  } catch {}
}

/** 移除指定缓存项 */
export function removeCacheItem(key: string): void {
  const fullKey = `${CACHE_PREFIX}${key}`;
  memoryCache.delete(fullKey);
  removeStorage(fullKey);
}

/** 清空所有属于本应用前缀的缓存 */
export function clearAllCaches(): void {
  memoryCache.clear();
  try {
    if (typeof localStorage !== 'undefined') {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(CACHE_PREFIX)) keysToRemove.push(k);
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    }
  } catch {}
}

/** 获取当前持久化缓存统计（条目数与大致大小） */
export function getCacheStats(): { count: number; sizeFormatted: string } {
  let count = 0;
  let totalBytes = 0;
  try {
    if (typeof localStorage !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(CACHE_PREFIX)) {
          count++;
          const val = localStorage.getItem(k);
          totalBytes += (k.length + (val ? val.length : 0)) * 2;
        }
      }
    }
  } catch {}
  const kb = totalBytes / 1024;
  const sizeFormatted = kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`;
  return { count, sizeFormatted };
}
