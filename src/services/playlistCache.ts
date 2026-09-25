import type { Track } from '../types';
import { getCacheItem, getCacheItemAsync, setCacheItem } from './cacheManager';

const PLAYLIST_TTL_MS = 24 * 60 * 60 * 1000; // 24小时过期

/** 同步获取歌单 (L1 内存 0ms) */
export function getCachedPlaylist(playlistId: string): Track[] | null {
  if (!playlistId) return null;
  return getCacheItem<Track[]>(`playlist_${playlistId}`);
}

/** 异步获取歌单 (未命中内存时穿透至 IndexedDB) */
export async function getCachedPlaylistAsync(playlistId: string): Promise<Track[] | null> {
  if (!playlistId) return null;
  return getCacheItemAsync<Track[]>(`playlist_${playlistId}`);
}

/** 写入歌单缓存（带 24h TTL） */
export function setCachedPlaylist(playlistId: string, tracks: Track[]): void {
  if (!playlistId || !tracks || tracks.length === 0) return;
  setCacheItem(`playlist_${playlistId}`, tracks, PLAYLIST_TTL_MS);
}
