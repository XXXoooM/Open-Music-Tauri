import { useState, useRef, type MouseEvent as ReactMouseEvent, type TouchEvent as ReactTouchEvent } from 'react';
import { usePlayerStore } from '../../stores/playerStore';

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
}

export default function MiniPlayerProgress() {
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

  const getClientX = (ev: MouseEvent | TouchEvent): number => {
    if ('touches' in ev && ev.touches.length > 0) return ev.touches[0].clientX;
    if ('changedTouches' in ev && ev.changedTouches.length > 0) return ev.changedTouches[0].clientX;
    return (ev as MouseEvent).clientX;
  };

  const handleDragStart = (e: ReactMouseEvent<HTMLDivElement> | ReactTouchEvent<HTMLDivElement>) => {
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return;

    const calcPercent = (clientX: number) =>
      Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));

    setDragPercent(calcPercent(getClientX(e.nativeEvent)));

    const handleMove = (ev: MouseEvent | TouchEvent) => {
      setDragPercent(calcPercent(getClientX(ev)));
    };

    const handleEnd = (ev: MouseEvent | TouchEvent) => {
      const finalPercent = calcPercent(getClientX(ev));
      setDragPercent(null);
      if (duration > 0) {
        requestSeek(finalPercent * duration);
      }
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove, { passive: true });
    document.addEventListener('touchend', handleEnd);
  };

  const displayTime = dragPercent !== null && duration > 0
    ? dragPercent * duration
    : progress;

  return (
    <div className="w-full flex items-center gap-[8px]">
      <span className="w-[40px] text-right text-[11px] text-[var(--text-tertiary)] tabular-nums shrink-0 select-none">
        {formatTime(displayTime)}
      </span>

      <div
        ref={barRef}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        className="group relative flex-1 h-[16px] flex items-center cursor-pointer select-none"
      >
        <div className="w-full h-[2px] rounded-[var(--radius-full)] bg-[var(--overlay-15)] overflow-hidden">
          <div
            className="h-full bg-[var(--text-primary)] rounded-[var(--radius-full)] pointer-events-none"
            style={{ width: `${displayPercent}%` }}
          />
        </div>

        {/* 悬停或拖拽时的交互滑块 */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[8px] h-[8px] rounded-[var(--radius-full)] bg-[var(--text-primary)] shadow-sm pointer-events-none transition-opacity duration-[var(--duration-hover)] opacity-0 group-hover:opacity-100"
          style={{
            left: `${displayPercent}%`,
            opacity: dragPercent !== null ? 1 : undefined,
          }}
        />
      </div>

      <span className="w-[40px] text-left text-[11px] text-[var(--text-tertiary)] tabular-nums shrink-0 select-none">
        {formatTime(duration)}
      </span>
    </div>
  );
}
