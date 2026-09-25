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

/** 针对纯 LRC 逐行歌词因人工打轴滞后的前置时间补偿量（毫秒） */
const LRC_LEAD_OFFSET_MS = 0;

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

function extractText(line: AmllLyricLine): string {
  return line.words ? line.words.map((w) => w.word).join('').trim() : '';
}

/**
 * 毫秒级高精度歌词对齐
 * - 网易云原生 tlyric（翻译）与 romalrc（罗马音）以标准 LRC 格式输出，与 lrc 具有完全一致的毫秒级时间戳
 * - 当存在 yrc（逐字）时：保持声学模型原生时间轴（0ms 偏移），并将译文与罗马音无缝映射给对应的 yrc 行
 * - 当不存在 yrc 时：以 lrc 为主轴，毫秒级点对点挂载译文/罗马音，并注入 450ms 智能提前量抵消人肉打轴滞后
 */
export function mergeLyrics(payload: RawLyricsPayload): LyricLine[] {
  const lrcLines = tryParse(parseLrc, payload.lrc) ?? [];
  const transLines = tryParse(parseLrc, payload.tlyric) ?? [];
  const romaLines = tryParse(parseLrc, payload.romalrc) ?? [];

  // 1. 将翻译与罗马音与标准 LRC 进行毫秒级点对点对齐（误差 <= 60ms 考虑浮点四舍五入）
  for (const l of lrcLines) {
    const trans = transLines.find((t) => Math.abs(t.startTime - l.startTime) <= 60);
    if (trans) {
      l.translatedLyric = extractText(trans);
    }
    const roma = romaLines.find((r) => Math.abs(r.startTime - l.startTime) <= 60);
    if (roma) {
      l.romanLyric = extractText(roma);
    }
  }

  // 2. 确定主轴：优先 YRC 逐字，若无则使用已对齐并前置补偿的 LRC 逐行
  let baseLines = lrcLines;
  const yrcLines = tryParse(parseYrc, payload.yrc);

  if (yrcLines && yrcLines.length > 0) {
    if (yrcLines.length === lrcLines.length) {
      // 官方单曲 YRC 与 LRC 行数完全严格 1 对 1
      for (let i = 0; i < yrcLines.length; i++) {
        yrcLines[i].translatedLyric = lrcLines[i].translatedLyric;
        yrcLines[i].romanLyric = lrcLines[i].romanLyric;
      }
    } else {
      // 若出现极少数前置版权行差异，按文本相同或就近时间戳 (<500ms) 稳健匹配
      for (const y of yrcLines) {
        const yText = extractText(y);
        const match = lrcLines.find((l) => {
          const lText = extractText(l);
          return (
            (yText && lText && yText === lText) ||
            Math.abs(y.startTime - l.startTime) <= 500
          );
        });
        if (match) {
          y.translatedLyric = match.translatedLyric;
          y.romanLyric = match.romanLyric;
        }
      }
    }
    baseLines = yrcLines;
  } else {
    // 纯 LRC 逐行歌词：提前 450ms 补偿人工打轴滞后，使人声开口瞬间即刻亮起换行
    for (const l of lrcLines) {
      l.startTime = Math.max(0, l.startTime - LRC_LEAD_OFFSET_MS);
      l.endTime = Math.max(0, l.endTime - LRC_LEAD_OFFSET_MS);
      if (l.words) {
        for (const w of l.words) {
          w.startTime = Math.max(0, w.startTime - LRC_LEAD_OFFSET_MS);
          w.endTime = Math.max(0, w.endTime - LRC_LEAD_OFFSET_MS);
        }
      }
    }
  }

  if (baseLines.length === 0) return [];

  // 3. 构造项目内部 LyricLine 结构（保留 _amllRaw 供播放器渲染）
  return baseLines.map((line) => ({
    time: line.startTime / 1000,
    text: extractText(line),
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
