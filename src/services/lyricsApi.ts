import {
  parseLrc,
  parseYrc,
  type LyricLine as AmllLyricLine,
} from '@applemusic-like-lyrics/lyric';
import type { LyricLine } from '../types';

const VKEYS_LYRIC_API = (songId: string): string =>
  `https://api.vkeys.cn/v2/music/netease/lyric?id=${songId}`;

/**
 * 解析歌词文本，自动检测格式
 * - 优先尝试 YRC（逐词格式）
 * - 失败则回退 LRC（逐行格式）
 * @param text 原始歌词文本
 * @returns 转换后的 LyricLine 数组（时间单位转换为秒，并保留 _amllRaw）
 */
export function parseLyrics(text: string): LyricLine[] {
  const tryParse = (
    parser: (t: string) => AmllLyricLine[]
  ): AmllLyricLine[] | null => {
    try {
      const parsed = parser(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // 忽略解析错误，尝试下一种格式
    }
    return null;
  };

  // 优先尝试 YRC（逐词），失败则回退 LRC（逐行）
  const amllLines = tryParse(parseYrc) ?? tryParse(parseLrc);

  if (!amllLines) {
    return [];
  }

  // 转换为项目内部的 LyricLine 格式
  return amllLines.map((line) => ({
    time: line.startTime / 1000, // 毫秒 → 秒
    text: line.words?.map((w) => w.word).join('') ?? '',
    translation: line.translatedLyric || undefined,
    romaji: line.romanLyric || undefined,
    words:
      line.words && line.words.length > 0
        ? line.words.map((w) => ({
            word: w.word,
            startTime: w.startTime / 1000,
            endTime: w.endTime / 1000,
          }))
        : undefined,
    // 保留原始 AMLL 行数据，供 LyricPlayer 使用
    _amllRaw: line,
  }));
}

/** 兼容旧版命名导出 */
export const parseLRC = parseLyrics;

let activeAbortController: AbortController | null = null;

/**
 * 根据网易云歌曲 ID 获取歌词
 * 优先解析 YRC 逐字歌词，降级 LRC 逐行歌词
 * 配备 8 秒超时与切歌自动中断保护
 */
export async function fetchLyrics(songId: string): Promise<LyricLine[]> {
  if (!songId) return [];

  if (activeAbortController) {
    activeAbortController.abort();
  }

  const controller = new AbortController();
  activeAbortController = controller;
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(VKEYS_LYRIC_API(songId), { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`VKeys API error: ${res.status}`);

    const json: unknown = await res.json();
    if (
      typeof json !== 'object' ||
      json === null ||
      !('code' in json) ||
      (json as { code: number }).code !== 200
    ) {
      throw new Error('VKeys API returned non-200 code');
    }

    const data = (json as { data?: { yrc?: string; lrc?: string } }).data;
    if (!data) throw new Error('VKeys API data missing');

    // 优先 YRC 逐字
    if (data.yrc && data.yrc.trim()) {
      const parsed = parseLyrics(data.yrc);
      if (parsed.length > 0) return parsed;
    }

    // 降级 LRC 逐行
    if (data.lrc && data.lrc.trim()) {
      const parsed = parseLyrics(data.lrc);
      if (parsed.length > 0) return parsed;
    }

    return [];
  } catch (e) {
    clearTimeout(timeoutId);
    if (e instanceof Error && e.name === 'AbortError') {
      return [];
    }
    console.warn('Lyrics fetch failed:', e);
    return [];
  } finally {
    if (activeAbortController === controller) {
      activeAbortController = null;
    }
  }
}
