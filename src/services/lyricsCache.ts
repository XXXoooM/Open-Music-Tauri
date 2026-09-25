import type { LyricLine } from '../types';
import { getCacheItem, getCacheItemAsync, setCacheItem } from './cacheManager';

const CIRCUIT_BREAKER_DURATION_MS = 30_000;
let circuitBreakerUntil = 0;

export function tripCircuitBreaker(): void {
  circuitBreakerUntil = Date.now() + CIRCUIT_BREAKER_DURATION_MS;
  console.warn('[lyricsCache] Official lyric API tripped circuit breaker for 30s');
}

export function isCircuitBreakerTripped(): boolean {
  return Date.now() < circuitBreakerUntil;
}

/** 同步读取歌词 (L1 内存 0ms) */
export function getCachedLyrics(songId: string): LyricLine[] | null {
  if (!songId) return null;
  return getCacheItem<LyricLine[]>(`lyric_${songId}`);
}

/** 异步读取歌词 (未命中内存时穿透至 IndexedDB) */
export async function getCachedLyricsAsync(songId: string): Promise<LyricLine[] | null> {
  if (!songId) return null;
  return getCacheItemAsync<LyricLine[]>(`lyric_${songId}`);
}

/** 写入歌词缓存（同步内存 + 异步 IndexedDB） */
export function setCachedLyrics(songId: string, lines: LyricLine[]): void {
  if (!songId || !lines || lines.length === 0) return;
  setCacheItem(`lyric_${songId}`, lines);
}
