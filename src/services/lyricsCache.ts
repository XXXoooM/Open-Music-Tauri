import type { LyricLine } from '../types';

const MAX_CACHE_SIZE = 100;
const PERSIST_KEY_PREFIX = 'open_music_lyric_v3_';
const CIRCUIT_BREAKER_DURATION_MS = 30_000;

// L1: 内存 LRU 缓存
const memoryCache = new Map<string, LyricLine[]>();

// 熔断时间戳：当收到 429/403 时记录冷却时间
let circuitBreakerUntil = 0;

/**
 * 触发官方源熔断（30秒内直接跳过官方源）
 */
export function tripCircuitBreaker(): void {
  circuitBreakerUntil = Date.now() + CIRCUIT_BREAKER_DURATION_MS;
  console.warn('[lyricsCache] Official lyric API tripped circuit breaker for 30s');
}

/**
 * 检查官方源当前是否处于熔断冷却期
 */
export function isCircuitBreakerTripped(): boolean {
  return Date.now() < circuitBreakerUntil;
}

function setMemoryCache(songId: string, lines: LyricLine[]): void {
  if (memoryCache.has(songId)) {
    memoryCache.delete(songId);
  } else if (memoryCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = memoryCache.keys().next().value;
    if (oldestKey) memoryCache.delete(oldestKey);
  }
  memoryCache.set(songId, lines);
}

/**
 * 从缓存中读取歌词（L1 内存 -> L2 本地存储）
 */
export function getCachedLyrics(songId: string): LyricLine[] | null {
  if (!songId) return null;

  // L1 内存命中：移动至 Map 尾部维持 LRU
  if (memoryCache.has(songId)) {
    const lines = memoryCache.get(songId)!;
    memoryCache.delete(songId);
    memoryCache.set(songId, lines);
    return lines;
  }

  // L2 本地存储降级读取
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(`${PERSIST_KEY_PREFIX}${songId}`);
      if (stored) {
        const parsed = JSON.parse(stored) as LyricLine[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMemoryCache(songId, parsed);
          return parsed;
        }
      }
    }
  } catch {
    // 忽略持久化解析异常
  }

  return null;
}

/**
 * 写入 L1 内存缓存并同步持久化
 */
export function setCachedLyrics(songId: string, lines: LyricLine[]): void {
  if (!songId || lines.length === 0) return;
  setMemoryCache(songId, lines);

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`${PERSIST_KEY_PREFIX}${songId}`, JSON.stringify(lines));
    }
  } catch {
    // 本地存储满或受限时静默跳过
  }
}
