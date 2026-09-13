/**
 * 运行环境判断
 *
 * 检测原理：
 * Tauri 2.0 运行时会向 WebView 的全局 window 对象注入 `__TAURI_INTERNALS__` 属性。
 * 使用 `'__TAURI_INTERNALS__' in window` 检测可精准识别 Tauri 2.0 桌面端环境。
 * 纯原生属性探测，无需引入 `@tauri-apps/api`，避免在 Web 端打包冗余的桌面端绑定代码。
 */
export const isTauri: boolean =
  typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

export const isWeb: boolean = !isTauri;
