import type { ThemeColors } from '../utils/colorUtils';
import { getCacheItem, setCacheItem } from './cacheManager';

export interface CachedPalette {
  theme: ThemeColors;
  gradient: string;
}

/**
 * 获取封面 URL 对应的调色板缓存（0ms 秒级切色，免去 Canvas 重算）
 */
export function getCachedPalette(coverUrl: string): CachedPalette | null {
  if (!coverUrl) return null;
  return getCacheItem<CachedPalette>(`palette_${coverUrl}`);
}

/**
 * 写入封面取色调色板缓存
 */
export function setCachedPalette(coverUrl: string, palette: CachedPalette): void {
  if (!coverUrl || !palette) return;
  setCacheItem(`palette_${coverUrl}`, palette);
}
