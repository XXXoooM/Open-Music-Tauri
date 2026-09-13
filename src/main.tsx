import { createRoot } from 'react-dom/client';
import './styles/global.css';
import App from './App';
import { isWeb } from './env';
import { useSettingsStore } from './stores/settingsStore';

// Service Worker 注册（仅 Web 环境生效，Tauri 桌面端跳过）
if (isWeb && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((e: unknown) => {
      console.warn('SW registration failed:', e);
    });
  });
}

// 启动引导
async function bootstrap(): Promise<void> {
  // 1. 先 hydrate settingsStore（必须 await 完成后才能安全挂载 App）
  await useSettingsStore.getState().hydrate();

  // 2. 再渲染 App 根节点
  const container = document.getElementById('root');
  if (!container) throw new Error('#root not found');

  // 注意：Phase 2 调试音频与避免重复触发，暂不开启 StrictMode。Phase 4 打磨时再开启 StrictMode 检查副作用清理
  createRoot(container).render(<App />);
}

void bootstrap();
