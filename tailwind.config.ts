import type { Config } from 'tailwindcss';

/**
 * Tailwind v4 采用 CSS-first 配置，
 * 绝大部分设计令牌已在 src/styles/tokens.css 的 @theme 中定义。
 *
 * 本文件仅保留：
 *  - content 路径（明确扫描范围）
 *  - 未来插件挂载位
 *
 * 不要在此处重复定义颜色/圆角/字体，避免与 tokens.css 冲突。
 */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  plugins: [],
} satisfies Config;