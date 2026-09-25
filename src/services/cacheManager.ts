/**
 * 全局统一多维缓存管理器 (Cache Manager)
 * 采用 L1 内存 LRU (0ms 同步) + L2 IndexedDB (海量异步持久化) 双层体系
 */
import { idbGet, idbSet, idbDel, idbClear, idbStats } from '../utils/idbStorage';

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

// 自动清理旧版 localStorage 残留，释放 Web/Tauri 配额
try {
  if (typeof localStorage !== 'undefined') {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(CACHE_PREFIX)) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  }
} catch {}

/** 同步读取 L1 内存缓存 (0ms) */
export function getCacheItem<T>(key: string): T | null {
  if (!key) return null;
  const fullKey = `${CACHE_PREFIX}${key}`;
  const now = Date.now();
  if (memoryCache.has(fullKey)) {
    const item = memoryCache.get(fullKey) as CacheEnvelope<T>;
    if (item.expireAt && item.expireAt < now) {
      memoryCache.delete(fullKey);
      void idbDel(fullKey);
      return null;
    }
    item.lastAccessed = now;
    memoryCache.delete(fullKey);
    memoryCache.set(fullKey, item as CacheEnvelope<unknown>);
    return item.value;
  }
  return null;
}

/** 异步读取缓存（L1 内存未命中时穿透查 L2 IndexedDB 并回填） */
export async function getCacheItemAsync<T>(key: string): Promise<T | null> {
  const memHit = getCacheItem<T>(key);
  if (memHit !== null) return memHit;
  const fullKey = `${CACHE_PREFIX}${key}`;
  const diskVal = await idbGet<T>(fullKey);
  if (diskVal !== null) {
    evictOldestMemory();
    memoryCache.set(fullKey, { value: diskVal, lastAccessed: Date.now() });
  }
  return diskVal;
}

/** 同步写入 L1 内存，并异步持久化至 L2 IndexedDB */
export function setCacheItem<T>(key: string, value: T, ttlMs?: number): void {
  if (!key || value === undefined || value === null) return;
  const fullKey = `${CACHE_PREFIX}${key}`;
  const now = Date.now();
  const expireAt = ttlMs && ttlMs > 0 ? now + ttlMs : undefined;
  evictOldestMemory();
  memoryCache.set(fullKey, { value, expireAt, lastAccessed: now });
  void idbSet(fullKey, value, expireAt);
}

/** 移除指定缓存项 */
export function removeCacheItem(key: string): void {
  const fullKey = `${CACHE_PREFIX}${key}`;
  memoryCache.delete(fullKey);
  void idbDel(fullKey);
}

/** 清空内存及 IndexedDB 缓存 */
export async function clearAllCaches(): Promise<void> {
  memoryCache.clear();
  await idbClear();
}

/** 异步获取持久化缓存统计（项数与大小） */
export async function getCacheStats(): Promise<{ count: number; sizeFormatted: string }> {
  return idbStats();
}
