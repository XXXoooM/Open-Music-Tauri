import { useEffect } from 'react';
import { getPaletteSync } from 'colorthief';
import {
  computeThemeColors,
  hsl2Rgb,
  normalizeColor,
  type RGB,
  type ThemeColors,
} from '../utils/colorUtils';

function hashColor(trackKey: string): ThemeColors {
  let hash = 0;
  const str = trackKey || 'OpenMusic';
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = (Math.abs(hash) % 360) / 360;
  const rgb = hsl2Rgb([hue, 0.65, 0.5]);
  return computeThemeColors(rgb);
}

function extractFromImage(coverUrl: string): Promise<{ theme: ThemeColors; gradient: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      try {
        const palette = getPaletteSync(img, { colorCount: 6 });
        if (!palette || palette.length === 0) throw new Error('Empty palette');

        const rgbs: RGB[] = palette.map((c) => {
          const { r, g, b } = c.rgb();
          return [r, g, b];
        });

        const theme = computeThemeColors(rgbs[0]);
        const gradStops = rgbs.slice(0, 4).map((c) => {
          const [nr, ng, nb] = normalizeColor(c);
          return `rgb(${nr}, ${ng}, ${nb})`;
        });
        while (gradStops.length < 4) gradStops.push(gradStops[0]);

        const gradient = `linear-gradient(-45deg, ${gradStops.join(', ')})`;
        resolve({ theme, gradient });
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (err) => reject(err);
    img.src = coverUrl;
  });
}

export function useDynamicColor(coverUrl: string, trackKey: string): void {
  useEffect(() => {
    let cancelled = false;

    async function run(): Promise<void> {
      let theme: ThemeColors;
      let gradient: string;

      try {
        if (!coverUrl) throw new Error('No cover url');
        const res = await extractFromImage(coverUrl);
        theme = res.theme;
        gradient = res.gradient;
      } catch {
        theme = hashColor(trackKey);
        gradient = `linear-gradient(-45deg, ${theme.accent}, ${theme.bgBase})`;
      }

      if (cancelled) return;
      const root = document.documentElement;
      root.style.setProperty('--dynamic-accent', theme.accent);
      root.style.setProperty('--dynamic-accent-rgb', theme.accentRgb);
      root.style.setProperty('--dynamic-text-primary', theme.textPrimary);
      root.style.setProperty('--dynamic-text-secondary', theme.textSecondary);
      root.style.setProperty('--dynamic-text-tertiary', theme.textTertiary);
      root.style.setProperty('--dynamic-overlay', theme.overlay);
      root.style.setProperty('--dynamic-glow', theme.glow);
      root.style.setProperty('--dynamic-bg-base', theme.bgBase);
      root.style.setProperty('--dynamic-gradient', gradient);
      root.style.setProperty('--dynamic-is-dark', '1');
      root.style.setProperty('--dynamic-fluid-filter', theme.fluidFilter);
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [coverUrl, trackKey]);
}
