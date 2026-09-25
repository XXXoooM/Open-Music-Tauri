import { invoke } from '@tauri-apps/api/core';
import type { LyricLine } from '../types';
import {
  getCachedLyrics,
  setCachedLyrics,
  tripCircuitBreaker,
  isCircuitBreakerTripped,
} from './lyricsCache';
import { mergeLyrics, parseLyrics, type RawLyricsPayload } from './lyricsMerger';

export { parseLyrics };
export const parseLRC = parseLyrics;

const VKEYS_LYRIC_API = (id: string): string =>
  `https://api.vkeys.cn/v2/music/netease/lyric?id=${id}`;
const OFFICIAL_WEB_API = (id: string): string =>
  `/api/netease/api/song/lyric?id=${id}&lv=1&kv=1&tv=1&yv=1&rv=1`;

function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

let activeController: AbortController | null = null;

async function fetchFromOfficial(
  songId: string,
  signal: AbortSignal
): Promise<LyricLine[] | null> {
  if (isCircuitBreakerTripped()) return null;

  try {
    let rawJson: string;
    if (isTauri()) {
      rawJson = await invoke<string>('fetch_netease_lyrics', { songId });
    } else {
      const res = await fetch(OFFICIAL_WEB_API(songId), { signal });
      if (res.status === 429 || res.status === 403) {
        tripCircuitBreaker();
        return null;
      }
      if (!res.ok) return null;
      rawJson = await res.text();
    }

    if (signal.aborted) return null;
    const data = JSON.parse(rawJson) as {
      code?: number;
      yrc?: { lyric?: string };
      lrc?: { lyric?: string };
      tlyric?: { lyric?: string };
      romalrc?: { lyric?: string };
    };

    if (data.code !== 200) return null;

    const payload: RawLyricsPayload = {
      yrc: data.yrc?.lyric,
      lrc: data.lrc?.lyric,
      tlyric: data.tlyric?.lyric,
      romalrc: data.romalrc?.lyric,
    };

    const lines = mergeLyrics(payload);
    return lines.length > 0 ? lines : null;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') throw err;
    return null;
  }
}

async function fetchFromVKeys(
  songId: string,
  signal: AbortSignal
): Promise<LyricLine[] | null> {
  try {
    const res = await fetch(VKEYS_LYRIC_API(songId), { signal });
    if (!res.ok) return null;

    const json = (await res.json()) as {
      code?: number;
      data?: { yrc?: string; lrc?: string };
    };

    if (json.code !== 200 || !json.data) return null;

    const lines = mergeLyrics({ yrc: json.data.yrc, lrc: json.data.lrc });
    return lines.length > 0 ? lines : null;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') throw err;
    return null;
  }
}

/**
 * 获取指定歌曲的歌词
 * 级联体系：L1/L2 缓存 -> Tier 1 网易云原生接口 -> Tier 2 VKeys 代理 -> 兜底
 */
export async function fetchLyrics(songId: string): Promise<LyricLine[]> {
  if (!songId) return [];

  // 1. 缓存快查（命中则 0ms 瞬间返回）
  const cached = getCachedLyrics(songId);
  if (cached) return cached;

  // 2. 取消前序切歌在途请求
  if (activeController) activeController.abort();
  const controller = new AbortController();
  activeController = controller;
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    // 3. 一级拉取：网易官方原生源（带 YRC、翻译与罗马音）
    const officialLines = await fetchFromOfficial(songId, controller.signal);
    if (officialLines && officialLines.length > 0) {
      setCachedLyrics(songId, officialLines);
      return officialLines;
    }

    // 4. 二级降级：VKeys 代理源
    const fallbackLines = await fetchFromVKeys(songId, controller.signal);
    if (fallbackLines && fallbackLines.length > 0) {
      setCachedLyrics(songId, fallbackLines);
      return fallbackLines;
    }

    return [];
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') return [];
    console.warn('Lyrics fetch failed:', e);
    return [];
  } finally {
    clearTimeout(timeoutId);
    if (activeController === controller) activeController = null;
  }
}
