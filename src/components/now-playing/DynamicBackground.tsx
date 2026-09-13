import type { BackgroundMode } from '../../types';

export default function DynamicBackground() {
  // 预留背景模式（后续由设置面板驱动，当前默认固定为渐变模式）
  // TODO: Phase 4 接入 settingsStore 中的 backgroundMode 配置
  const mode: BackgroundMode = 'gradient';

  if (mode === 'gradient') {
    return (
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* 第 1 层：动态渐变主体 */}
        <div
          className="absolute inset-0"
          style={{
            background: 'var(--dynamic-gradient)',
            filter: 'blur(80px) saturate(1.6)',
            transform: 'scale(1.2)',
            opacity: 0.85,
            transition: 'background var(--duration-background) var(--ease-apple)',
          }}
        />
        {/* 第 2 层：径向暗角遮罩 */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.35) 100%)',
          }}
        />
      </div>
    );
  }

  return null;
}

