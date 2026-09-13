import { useEffect } from 'react';
import { getPaletteSync } from 'colorthief';

/**
 * 纯字符串哈希色相计算（兜底轨道）
 * 移植自旧 app.js 核心逻辑，保证各曲目拥有唯一且稳定的调色板
 * @param trackKey 唯一键（曲目 ID 或 标题+歌手）
 */
function hashColor(trackKey: string): { gradient: string; accent: string } {
  let hash = 0;
  const str = trackKey || 'OpenMusic';
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  const accent = `hsl(${hue}, 85%, 55%)`;
  const gradient = `linear-gradient(135deg, hsl(${hue}, 70%, 40%) 0%, hsl(${
    (hue + 40) % 360
  }, 65%, 30%) 100%)`;
  return { gradient, accent };
}

/**
 * 从网络封面提取主色调及渐变（首选轨道）
 * @param coverUrl 封面图片地址
 */
function extractFromImage(
  coverUrl: string
): Promise<{ gradient: string; accent: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      try {
        const palette = getPaletteSync(img, { colorCount: 5 });
        if (!palette || palette.length === 0) {
          throw new Error('Empty palette extracted');
        }
        const colors = palette.slice(0, 3).map((c) => {
          const { r, g, b } = c.rgb();
          return `rgb(${r}, ${g}, ${b})`;
        });
        while (colors.length < 3) {
          colors.push(colors[0]);
        }
        const gradient = `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`;
        const { r, g, b } = palette[0].rgb();
        const accent = `rgb(${r}, ${g}, ${b})`;
        resolve({ gradient, accent });
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (err) => {
      reject(err);
    };

    img.src = coverUrl;
  });
}

/**
 * 动态主色双轨策略入口
 * 尝试 ColorThief 真实取色，遇到跨域、空地址或图片损坏静默降级为哈希计算
 */
async function extractDynamicColor(
  coverUrl: string,
  trackKey: string
): Promise<{ gradient: string; accent: string }> {
  if (!coverUrl) {
    return hashColor(trackKey);
  }

  try {
    return await extractFromImage(coverUrl);
  } catch (e) {
    console.warn('ColorThief extraction failed, falling back to hash color:', e);
    return hashColor(trackKey);
  }
}

/**
 * 动态主色 Hook
 * 监听曲目封面变化，提取并在根 DOM 上注入 --dynamic-gradient 与 --dynamic-accent CSS 变量
 * @param coverUrl 当前曲目的封面 URL（可能为空）
 * @param trackKey 用于哈希兜底的唯一字符串（通常传 track.id）
 */
export function useDynamicColor(coverUrl: string, trackKey: string): void {
  useEffect(() => {
    let cancelled = false;

    async function run(): Promise<void> {
      const result = await extractDynamicColor(coverUrl, trackKey);
      if (cancelled) return;
      document.documentElement.style.setProperty(
        '--dynamic-gradient',
        result.gradient
      );
      document.documentElement.style.setProperty(
        '--dynamic-accent',
        result.accent
      );
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [coverUrl, trackKey]);
}

