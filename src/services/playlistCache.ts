import type { Track } from '../types';
import { getCacheItem, setCacheItem } from './cacheManager';

const PLAYLIST_TTL_MS = 24 * 60 * 60 * 1000; // 24小时过期

/**
 * 获取本地缓存的歌单列表
 */
export function getCachedPlaylist(playlistId: string): Track[] | null {
  if (!playlistId) return null;
  return getCacheItem<Track[]>(`playlist_${playlistId}`);
}

/**
 * 写入本地歌单缓存（带 24h TTL）
 */
export function setCachedPlaylist(playlistId: string, tracks: Track[]): void {
  if (!playlistId || !tracks || tracks.length === 0) return;
  setCacheItem(`playlist_${playlistId}`, tracks, PLAYLIST_TTL_MS);
}
