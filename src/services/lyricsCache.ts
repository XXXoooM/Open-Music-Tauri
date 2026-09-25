import type { LyricLine } from '../types';
import { getCacheItem, setCacheItem } from './cacheManager';

const CIRCUIT_BREAKER_DURATION_MS = 30_000;

// 熔断时间戳：当收到 429/403 时记录冷却时间
let circuitBreakerUntil = 0;

/**
 * 触发官方源熔断（30秒内直接跳过官方源，路由至二级降级源）
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

/**
 * 从统一缓存体系中读取歌词（L1 内存 -> L2 本地存储）
 */
export function getCachedLyrics(songId: string): LyricLine[] | null {
  if (!songId) return null;
  return getCacheItem<LyricLine[]>(`lyric_${songId}`);
}

/**
 * 写入统一歌词缓存（静态不可变数据，永久存储直至用户手动清理）
 */
export function setCachedLyrics(songId: string, lines: LyricLine[]): void {
  if (!songId || !lines || lines.length === 0) return;
  setCacheItem(`lyric_${songId}`, lines);
}
