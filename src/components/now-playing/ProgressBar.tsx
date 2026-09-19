import { useState, useRef, type MouseEvent as ReactMouseEvent, type TouchEvent as ReactTouchEvent } from 'react';
import { usePlayerStore } from '../../stores/playerStore';

export default function ProgressBar() {
  const progress = usePlayerStore((s) => s.progress);
  const duration = usePlayerStore((s) => s.duration);
  const requestSeek = usePlayerStore((s) => s.requestSeek);

  const [dragPercent, setDragPercent] = useState<number | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const displayPercent =
    dragPercent !== null
      ? dragPercent * 100
      : duration > 0
        ? (progress / duration) * 100
        : 0;

  const handleDragStart = (e: ReactMouseEvent<HTMLDivElement> | ReactTouchEvent<HTMLDivElement>) => {
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect) return;

    const updatePercent = (clientX: number) => {
      const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      setDragPercent(percent);
    };

    const getClientX = (ev: MouseEvent | TouchEvent): number => {
      if ('touches' in ev && ev.touches.length > 0) {
        return ev.touches[0].clientX;
      }
      if ('changedTouches' in ev && ev.changedTouches.length > 0) {
        return ev.changedTouches[0].clientX;
      }
      return (ev as MouseEvent).clientX;
    };

    const handleMove = (ev: MouseEvent | TouchEvent) => {
      updatePercent(getClientX(ev));
    };

    const handleEnd = (ev: MouseEvent | TouchEvent) => {
      const finalPercent = Math.max(0, Math.min(1, (getClientX(ev) - rect.left) / rect.width));
      setDragPercent(null);
      if (duration > 0) {
        requestSeek(finalPercent * duration);
      }

      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };

    updatePercent(getClientX(e.nativeEvent));

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove, { passive: true });
    document.addEventListener('touchend', handleEnd);
  };

  return (
    <div
      ref={barRef}
      className="relative w-full h-[2px] select-none"
      style={{ backgroundColor: 'var(--overlay-15)' }}
    >
      {/* 实际播放进度条 */}
      <div
        className="h-full pointer-events-none transition-all duration-75"
        style={{
          width: `${displayPercent}%`,
          backgroundColor: 'var(--dynamic-accent, var(--text-primary))',
        }}
      />

      {/* 12px 高的透明拖拽点击热区 */}
      <div
        className="absolute inset-x-0 -top-[5px] -bottom-[5px] cursor-pointer"
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      />
    </div>
  );
}
