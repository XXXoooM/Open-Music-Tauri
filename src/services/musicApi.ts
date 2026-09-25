import type { Track, ApiSource } from '../types';
import { API_SOURCES } from './musicApiConfig';
import {
  getCachedPlaylist,
  getCachedPlaylistAsync,
  setCachedPlaylist,
} from './playlistCache';
import { enrichTracksMetadata } from './metadataEnricher';

export { API_SOURCES };
export { getFallbackPlaylist } from './fallbackPlaylist';

/** URL 归一化处理 */
export function normalizeUrl(path: string, apiSource: ApiSource): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const currentBase = API_SOURCES[apiSource].baseUrl;
  const apiOrigin = new URL(currentBase).origin;
  if (path.startsWith('/')) return apiOrigin + path;
  return currentBase + (currentBase.endsWith('/') ? '' : '/') + path;
}

/** 歌单 ID 解析提取 */
export function parsePlaylistId(input: string): string | null {
  const trimmed = input.trim();
  if (/^\d+$/.test(trimmed)) return trimmed;
  const queryMatch = trimmed.match(/[?&]id=(\d+)/);
  if (queryMatch) return queryMatch[1];
  const pathMatch = trimmed.match(/\/(playlist|toplist|album)\/(\d+)/);
  if (pathMatch) return pathMatch[2];
  const fallbackMatch = trimmed.match(/\b(\d{5,12})\b/);
  if (fallbackMatch) return fallbackMatch[1];
  return null;
}

interface RawApiTrack {
  id?: string | number;
  song_id?: string | number;
  name?: string;
  title?: string;
  artist?: string;
  author?: string;
  album?: string;
  al?: { name?: string };
  dt?: number;
  duration?: number;
  url?: string;
  pic?: string;
  lrc?: string;
}

function extractTrackId(track: RawApiTrack): string {
  if (track.id !== undefined && track.id !== null && String(track.id).trim() !== '') {
    return String(track.id);
  }
  if (track.song_id !== undefined && track.song_id !== null && String(track.song_id).trim() !== '') {
    return String(track.song_id);
  }
  if (track.url) {
    const match = track.url.match(/id=(\d+)/);
    if (match?.[1]) return match[1];
    return track.url;
  }
  return '';
}

/**
 * 从远程 API 拉取指定歌单的曲目列表（带时长补齐与本地缓存）
 */
export async function fetchPlaylist(
  playlistId: string,
  apiSource: ApiSource
): Promise<Track[]> {
  const cached = getCachedPlaylist(playlistId) ?? (await getCachedPlaylistAsync(playlistId));
  try {
    const apiUrl = API_SOURCES[apiSource].buildUrl('playlist', playlistId);
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('API server returned error code');

    const data: unknown = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      const rawTracks = data as RawApiTrack[];
      const tracks = rawTracks.map((track) => {
        const rawDur = track.dt || track.duration;
        const durSec = rawDur ? (rawDur > 10000 ? Math.round(rawDur / 1000) : Math.round(rawDur)) : undefined;
        return {
          id: extractTrackId(track),
          name: track.name || track.title || '未知歌名',
          artist: track.artist || track.author || '未知歌手',
          album: track.album || track.al?.name || '',
          duration: durSec && durSec > 0 ? durSec : undefined,
          url: normalizeUrl(track.url || '', apiSource),
          pic: normalizeUrl(track.pic || '', apiSource),
          lrc: normalizeUrl(track.lrc || '', apiSource),
        };
      });

      // 异步尝试补齐可能缺失的时长与专辑
      const enriched = await enrichTracksMetadata(tracks);
      setCachedPlaylist(playlistId, enriched);
      return enriched;
    }
    throw new Error('API returned empty playlist');
  } catch (err) {
    if (cached && cached.length > 0) {
      console.warn('[musicApi] Fetch failed, returning cached playlist:', err);
      return cached;
    }
    throw err;
  }
}
