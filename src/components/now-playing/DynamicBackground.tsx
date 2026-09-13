import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../../stores/playerStore';

export default function DynamicBackground() {
  const track = usePlayerStore((s) => s.playlist[s.currentTrackIndex]);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const coverUrl = track?.pic ?? '';

  const c1 = useRef<HTMLCanvasElement>(null);
  const c2 = useRef<HTMLCanvasElement>(null);
  const c3 = useRef<HTMLCanvasElement>(null);
  const c4 = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!coverUrl) return;
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img;
      const hw = w / 2;
      const hh = h / 2;
      const list = [
        { ref: c1, sx: 0, sy: 0 },
        { ref: c2, sx: hw, sy: 0 },
        { ref: c3, sx: 0, sy: hh },
        { ref: c4, sx: hw, sy: hh },
      ];
      list.forEach(({ ref, sx, sy }) => {
        const ctx = ref.current?.getContext('2d');
        if (ctx) {
          ctx.filter = 'blur(6px)';
          ctx.drawImage(img, sx, sy, hw, hh, 0, 0, 100, 100);
        }
      });
    };
    img.src = coverUrl;
  }, [coverUrl]);

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

      {/* 2. 底层高饱和绚丽渐变 */}
      <div
        className="absolute inset-0"
        style={{
          background: 'var(--dynamic-gradient)',
          filter: 'blur(70px)',
          opacity: 0.85,
          transform: 'scale(1.2)',
          transition: 'background 1.5s var(--ease-apple)',
        }}
      />

      {/* 3. 流体旋转画布层 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`rnp-fluid-rect w-[max(115vw,115vh)] h-[max(115vw,115vh)] relative ${
            isPlaying ? '' : 'rnp-paused'
          }`}
          style={{
            filter: 'var(--dynamic-fluid-filter, saturate(1.5) brightness(0.88)) url(#rnp-fluid-filter)',
          }}
        >
          <canvas
            ref={c1}
            width={100}
            height={100}
            className="rnp-fluid-canvas absolute left-[10%] top-[10%] w-[60%] h-[60%] rounded-full opacity-90"
            style={{ animationDelay: '0s' }}
          />
          <canvas
            ref={c2}
            width={100}
            height={100}
            className="rnp-fluid-canvas absolute right-[10%] top-[10%] w-[60%] h-[60%] rounded-full opacity-90"
            style={{ animationDelay: '-5s' }}
          />
          <canvas
            ref={c3}
            width={100}
            height={100}
            className="rnp-fluid-canvas absolute left-[10%] bottom-[10%] w-[60%] h-[60%] rounded-full opacity-90"
            style={{ animationDelay: '-10s' }}
          />
          <canvas
            ref={c4}
            width={100}
            height={100}
            className="rnp-fluid-canvas absolute right-[10%] bottom-[10%] w-[60%] h-[60%] rounded-full opacity-90"
            style={{ animationDelay: '-15s' }}
          />
        </div>
      </div>

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
          backgroundColor: 'var(--dynamic-overlay, rgba(0, 0, 0, 0.28))',
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
