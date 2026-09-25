import { invoke } from '@tauri-apps/api/core';
import type { Track } from '../types';

function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

interface RawDetailSong {
  id: number | string;
  duration?: number;
  dt?: number;
  album?: { name?: string };
}

/**
 * 批量异步补全曲目的歌曲时长 (dt) 与专辑名称 (album)
 */
export async function enrichTracksMetadata(tracks: Track[]): Promise<Track[]> {
  if (!tracks || tracks.length === 0) return tracks;
  const missingTracks = tracks.filter((t) => !t.duration || !t.album);
  if (missingTracks.length === 0) return tracks;

  // 最多批量补齐前 60 首
  const ids = missingTracks.slice(0, 60).map((t) => t.id).filter(Boolean);
  if (ids.length === 0) return tracks;

  try {
    const endpoint = `/api/song/detail?ids=[${ids.join(',')}]`;
    let raw: string;
    if (isTauri()) {
      raw = await invoke<string>('fetch_netease_get', { endpoint });
    } else {
      const res = await fetch(`/api/netease${endpoint}`);
      if (!res.ok) return tracks;
      raw = await res.text();
    }

    const json = JSON.parse(raw) as { songs?: RawDetailSong[] };
    if (!Array.isArray(json.songs)) return tracks;

    const detailMap = new Map<string, { duration?: number; album?: string }>();
    json.songs.forEach((s) => {
      const rawDur = s.duration || s.dt;
      const sec = rawDur ? Math.round(rawDur / 1000) : undefined;
      detailMap.set(String(s.id), {
        duration: sec && sec > 0 ? sec : undefined,
        album: s.album?.name,
      });
    });

    return tracks.map((t) => {
      const detail = detailMap.get(String(t.id));
      if (!detail) return t;
      return {
        ...t,
        duration: t.duration || detail.duration,
        album: t.album || detail.album,
      };
    });
  } catch (err) {
    console.warn('[metadataEnricher] Enrichment failed:', err);
    return tracks;
  }
}
