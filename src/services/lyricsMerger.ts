import {
  parseLrc,
  parseYrc,
  type LyricLine as AmllLyricLine,
} from '@applemusic-like-lyrics/lyric';
import type { LyricLine } from '../types';

export interface RawLyricsPayload {
  yrc?: string;
  lrc?: string;
  tlyric?: string;
  romalrc?: string;
}

function tryParse(
  parser: (t: string) => AmllLyricLine[],
  text?: string
): AmllLyricLine[] | null {
  if (!text || !text.trim()) return null;
  try {
    const parsed = parser(text);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // 忽略特定格式解析错误
  }
  return null;
}

/**
 * 将翻译或罗马音逐行时间戳（LRC 格式）智能模糊对齐至主歌词行（YRC/LRC）
 */
function alignSubLyrics(
  baseLines: AmllLyricLine[],
  subText: string | undefined,
  field: 'translatedLyric' | 'romanLyric'
): void {
  const subLines = tryParse(parseLrc, subText);
  if (!subLines || subLines.length === 0) return;

  let subIdx = 0;
  for (const base of baseLines) {
    const baseText = base.words ? base.words.map((w) => w.word).join('').trim() : '';
    // 跳过开头过早出现的元数据署名行（作词/作曲等无需对齐译文）
    if (
      base.startTime < 3500 &&
      (baseText.includes('作词') || baseText.includes('作曲') || baseText.includes('编曲'))
    ) {
      continue;
    }

    let bestSub: AmllLyricLine | null = null;
    let bestDiff = 2000; // 最大允许 2.0s 误差窗口

    for (let i = subIdx; i < subLines.length; i++) {
      const sub = subLines[i];
      const diff = Math.abs(sub.startTime - base.startTime);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestSub = sub;
        subIdx = i;
      } else if (sub.startTime > base.startTime + 2000) {
        break;
      }
    }

    if (bestSub) {
      const text = bestSub.words ? bestSub.words.map((w) => w.word).join('') : '';
      base[field] = text;
    }
  }
}

/**
 * 将官方原生多轨歌词格式化对齐并转为应用 LyricLine 格式
 */
export function mergeLyrics(payload: RawLyricsPayload): LyricLine[] {
  // 1. 优先尝试逐字 YRC，降级逐行 LRC
  const amllLines =
    tryParse(parseYrc, payload.yrc) ?? tryParse(parseLrc, payload.lrc);

  if (!amllLines) return [];

  // 2. 注入翻译与罗马音（如果有）
  alignSubLyrics(amllLines, payload.tlyric, 'translatedLyric');
  alignSubLyrics(amllLines, payload.romalrc, 'romanLyric');

  // 3. 构造项目内部 LyricLine 结构
  return amllLines.map((line) => ({
    time: line.startTime / 1000,
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
    _amllRaw: line,
  }));
}

/**
 * 兼容单文本解析入口
 */
export function parseLyrics(text: string): LyricLine[] {
  return mergeLyrics({ yrc: text, lrc: text });
}
