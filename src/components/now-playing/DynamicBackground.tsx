import { usePlayerStore } from '../../stores/playerStore';
import FluidCanvas from './FluidCanvas';

export default function DynamicBackground() {
  const track = usePlayerStore((s) => s.playlist[s.currentTrackIndex]);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const coverUrl = track?.pic ?? '';

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none select-none">
      {/* 1. 最底层 100% 实心基底色（彻底遮盖侧边栏与主窗口，杜绝透视） */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: 'var(--dynamic-bg-base, #081612)',
          transition: 'background-color 1.5s var(--ease-apple)',
        }}
      />

      {/* SVG 扰动滤镜 */}
      <svg width="0" height="0" className="absolute">
        <filter
          id="rnp-fluid-filter"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence type="fractalNoise" baseFrequency="0.005" numOctaves={1} seed={42} />
          <feDisplacementMap in="SourceGraphic" scale={400} />
        </filter>
      </svg>

      {/* 2. 双层高饱和绚丽渐变：底层常驻上一曲色，上层平滑 crossfade 淡入当前渐变 */}
      <div
        className="absolute inset-0"
        style={{
          background: 'var(--dynamic-gradient-prev, var(--dynamic-gradient))',
          filter: 'blur(70px)',
          opacity: 0.85,
          transform: 'scale(1.2)',
        }}
      />
      <div
        key={track?.id ?? 'default-grad'}
        className="background-crossfade absolute inset-0"
        style={{
          background: 'var(--dynamic-gradient)',
          filter: 'blur(70px)',
          transform: 'scale(1.2)',
        }}
      />

      {/* 3. 流体旋转画布层 */}
      <FluidCanvas coverUrl={coverUrl} isPlaying={isPlaying} />

      {/* 4. 柔和毛玻璃漫反射 */}
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: 'blur(64px)',
          WebkitBackdropFilter: 'blur(64px)',
        }}
      />

      {/* 5. 沉浸式压暗遮罩层 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: 'var(--dynamic-overlay)',
          transition: 'background-color 1s var(--ease-apple)',
        }}
      />

      {/* 6. 右侧与四角环境氛围柔光 */}
      <div
        className="absolute -right-[10%] -top-[10%] w-[50vw] h-[50vh] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, var(--dynamic-glow) 0%, transparent 70%)',
          filter: 'blur(50px)',
          opacity: 0.45,
        }}
      />
    </div>
  );
}
