/**
 * Refined Now Playing 色彩提取与规范化引擎
 * 算法对齐 solstice23/refined-now-playing-netease
 */

export type RGB = [number, number, number];

export function rgb2Hsl([r, g, b]: RGB): [number, number, number] {
  const [nr, ng, nb] = [r / 255, g / 255, b / 255];
  const max = Math.max(nr, ng, nb);
  const min = Math.min(nr, ng, nb);
  let [h, s] = [0, 0];
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === nr) h = (ng - nb) / d + (ng < nb ? 6 : 0);
    else if (max === ng) h = (nb - nr) / d + 2;
    else h = (nr - ng) / d + 4;
    h /= 6;
  }
  return [h, s, l];
}

export function hsl2Rgb([h, s, l]: [number, number, number]): RGB {
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    let nt = t < 0 ? t + 1 : t > 1 ? t - 1 : t;
    if (nt < 1 / 6) return p + (q - p) * 6 * nt;
    if (nt < 1 / 2) return q;
    if (nt < 2 / 3) return p + (q - p) * (2 / 3 - nt) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

export function normalizeColor([r, g, b]: RGB): RGB {
  if (Math.max(r, g, b) - Math.min(r, g, b) < 6) return [160, 160, 160];
  const mix = (a: number, b: number, p: number) => Math.round(a * (1 - p) + b * p);
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  let [cr, cg, cb] = [r, g, b];

  if (lum < 60) {
    const factor = 0.35 * (1 - lum / 60);
    [cr, cg, cb] = [mix(cr, 255, factor), mix(cg, 255, factor), mix(cb, 255, factor)];
  } else if (lum > 180) {
    const factor = 0.45 * ((lum - 180) / 76);
    [cr, cg, cb] = [mix(cr, 0, factor), mix(cg, 0, factor), mix(cb, 0, factor)];
  }

  let [h, s, l] = rgb2Hsl([cr, cg, cb]);
  s = Math.max(0.45, Math.min(0.85, s));
  l = Math.max(0.42, Math.min(0.68, l));
  return hsl2Rgb([h, s, l]);
}

export function calcLuminance([r, g, b]: RGB): number {
  const norm = [r, g, b].map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * norm[0] + 0.7152 * norm[1] + 0.0722 * norm[2];
}

export interface ThemeColors {
  accent: string;
  accentRgb: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  overlay: string;
  glow: string;
  bgBase: string;
  fluidFilter: string;
}

export function computeThemeColors(dominant: RGB): ThemeColors {
  const norm = normalizeColor(dominant);
  const [h, s] = rgb2Hsl(norm);

  const accentRgbStr = `${norm[0]}, ${norm[1]}, ${norm[2]}`;
  const accent = `rgb(${accentRgbStr})`;

  // 生成沉浸式深邃不透底基底色（完全杜绝下层 UI 透出）
  const darkBaseRgb = hsl2Rgb([h, Math.min(s * 0.7, 0.45), 0.07]);
  const bgBase = `rgb(${darkBaseRgb[0]}, ${darkBaseRgb[1]}, ${darkBaseRgb[2]})`;

  // Refined 核心视觉：纯粹白字配合微光，高饱和深邃背景
  const textPrimary = '#ffffff';
  const textSecondary = 'rgba(255, 255, 255, 0.65)';
  const textTertiary = 'rgba(255, 255, 255, 0.40)';
  const overlay = 'rgba(0, 0, 0, 0.28)';
  const glow = `rgba(${norm[0]}, ${norm[1]}, ${norm[2]}, 0.8)`;
  const fluidFilter = 'saturate(1.5) brightness(0.88)';

  return {
    accent,
    accentRgb: accentRgbStr,
    textPrimary,
    textSecondary,
    textTertiary,
    overlay,
    glow,
    bgBase,
    fluidFilter,
  };
}
