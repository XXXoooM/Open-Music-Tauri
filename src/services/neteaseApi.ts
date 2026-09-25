import { invoke } from '@tauri-apps/api/core';
import type { Track, ApiSource } from '../types';
import { API_SOURCES } from './musicApiConfig';
import { getCacheItem, setCacheItem } from './cacheManager';

export interface ToplistDef {
  id: string;
  name: string;
  desc: string;
  badge: string;
  gradient: string;
}

export const TOPLISTS: readonly ToplistDef[] = [
  { id: '3778678', name: '热歌榜', desc: '全网最具热度流行单曲', badge: 'HOT', gradient: 'linear-gradient(135deg, #FF416C, #FF4B2B)' },
  { id: '3779629', name: '新歌榜', desc: '每日最新华语及全球新作', badge: 'NEW', gradient: 'linear-gradient(135deg, #2193b0, #6dd5ed)' },
  { id: '19723756', name: '飙升榜', desc: '近100首热度飙升最快歌曲', badge: 'TOP', gradient: 'linear-gradient(135deg, #11998e, #38ef7d)' },
  { id: '2884035', name: '原创榜', desc: '独立音乐与原创作者先锋', badge: 'PRO', gradient: 'linear-gradient(135deg, #8E2DE2, #4A00E0)' },
  { id: '71385702', name: 'ACG 榜', desc: '精选动漫二次元与游戏原声', badge: 'ACG', gradient: 'linear-gradient(135deg, #f857a6, #ff5858)' },
  { id: '991319590', name: '说唱榜', desc: '潮流说唱与节奏先锋律动', badge: 'RAP', gradient: 'linear-gradient(135deg, #f12711, #f5af19)' },
  { id: '1978921795', name: '电音榜', desc: '重低音与沉浸式现场俱乐部', badge: 'EDM', gradient: 'linear-gradient(135deg, #00c6ff, #0072ff)' },
  { id: '3778679', name: '经典榜', desc: '岁月沉淀的华语不朽金曲', badge: 'OLD', gradient: 'linear-gradient(135deg, #e65c00, #F9D423)' },
];

function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

async function fetchNeteaseApi(endpoint: string): Promise<string> {
  if (isTauri()) {
    return invoke<string>('fetch_netease_get', { endpoint });
  }
  const res = await fetch(`/api/netease${endpoint}`);
  if (!res.ok) throw new Error(`NetEase HTTP error: ${res.status}`);
  return res.text();
}

interface RawSong {
  id: number | string;
  name: string;
  ar?: Array<{ name: string }>;
  artists?: Array<{ name: string }>;
  al?: { name?: string; picUrl?: string };
  album?: { name?: string; picUrl?: string };
  dt?: number;
  duration?: number;
}

/**
 * 网易云在线单曲搜索（带 10 分钟缓存）
 */
export async function searchSongs(keyword: string, apiSource: ApiSource): Promise<Track[]> {
  const q = keyword.trim();
  if (!q) return [];
  const cacheKey = `search_${apiSource}_${q}`;
  const cached = getCacheItem<Track[]>(cacheKey);
  if (cached) return cached;

  try {
    const raw = await fetchNeteaseApi(
      `/api/cloudsearch/pc?s=${encodeURIComponent(q)}&type=1&offset=0&limit=30`
    );
    const json = JSON.parse(raw) as { result?: { songs?: RawSong[] } };
    const rawSongs = json.result?.songs || [];

    const tracks: Track[] = rawSongs.map((s) => {
      const songId = String(s.id);
      const artist = s.ar?.map((a) => a.name).join(' / ') || s.artists?.map((a) => a.name).join(' / ') || '未知歌手';
      const album = s.al?.name || s.album?.name || '未知专辑';
      const rawPic = s.al?.picUrl || s.album?.picUrl || '';
      const pic = rawPic ? (rawPic.includes('?') ? rawPic : `${rawPic}?param=500y500`) : '';
      const rawDur = s.dt || s.duration;
      const sec = rawDur ? (rawDur > 10000 ? Math.round(rawDur / 1000) : Math.round(rawDur)) : undefined;
      return {
        id: songId,
        name: s.name || '未知歌名',
        artist,
        album,
        pic,
        duration: sec && sec > 0 ? sec : undefined,
        url: API_SOURCES[apiSource].buildUrl('url', songId),
        lrc: API_SOURCES[apiSource].buildUrl('lrc', songId),
      };
    });

    if (tracks.length > 0) setCacheItem(cacheKey, tracks, 10 * 60 * 1000);
    return tracks;
  } catch (err) {
    console.warn('[neteaseApi] Search failed:', err);
    return [];
  }
}
