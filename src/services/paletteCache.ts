import type { ThemeColors } from '../utils/colorUtils';
import { getCacheItem, getCacheItemAsync, setCacheItem } from './cacheManager';

export interface CachedPalette {
  theme: ThemeColors;
  gradient: string;
}

/** 同步读取调色板 (L1 内存 0ms) */
export function getCachedPalette(coverUrl: string): CachedPalette | null {
  if (!coverUrl) return null;
  return getCacheItem<CachedPalette>(`palette_${coverUrl}`);
}

/** 异步读取调色板 (未命中内存时穿透至 IndexedDB) */
export async function getCachedPaletteAsync(coverUrl: string): Promise<CachedPalette | null> {
  if (!coverUrl) return null;
  return getCacheItemAsync<CachedPalette>(`palette_${coverUrl}`);
}

/** 写入封面取色调色板缓存 */
export function setCachedPalette(coverUrl: string, palette: CachedPalette): void {
  if (!coverUrl || !palette) return;
  setCacheItem(`palette_${coverUrl}`, palette);
}
