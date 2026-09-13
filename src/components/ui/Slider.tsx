import { useRef, type MouseEvent as ReactMouseEvent, type TouchEvent as ReactTouchEvent } from 'react';

export interface SliderProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange(value: number): void;
  'aria-label': string;
}

export default function Slider({
  value,
  min,
  max,
  step,
  onChange,
  'aria-label': ariaLabel,
}: SliderProps) {
  const barRef = useRef<HTMLDivElement>(null);

  const percent =
    max > min ? Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100)) : 0;

  const updateFromClientX = (clientX: number) => {
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const raw = min + ratio * (max - min);
    const stepped = Math.round((raw - min) / step) * step + min;
    const clamped = Math.max(min, Math.min(max, stepped));
    onChange(clamped);
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

  const handleStart = (e: ReactMouseEvent<HTMLDivElement> | ReactTouchEvent<HTMLDivElement>) => {
    updateFromClientX(getClientX(e.nativeEvent));

    const handleMove = (ev: MouseEvent | TouchEvent) => {
      updateFromClientX(getClientX(ev));
    };

    const handleEnd = () => {
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

  return (
    <div
      ref={barRef}
      role="slider"
      aria-label={ariaLabel}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      tabIndex={0}
      onMouseDown={handleStart}
      onTouchStart={handleStart}
      className="w-[120px] h-[20px] relative flex items-center cursor-pointer select-none"
    >
      {/* 轨道 */}
      <div
        className="h-[2px] w-full rounded-[var(--radius-full)] overflow-hidden"
        style={{ backgroundColor: 'var(--overlay-15)' }}
      >
        <div
          className="h-full bg-[var(--text-primary)] rounded-[var(--radius-full)]"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* 拖拽滑块柄 */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[12px] h-[12px] rounded-[var(--radius-full)] bg-[var(--text-primary)] shadow-sm pointer-events-none"
        style={{ left: `${percent}%` }}
      />
    </div>
  );
}
