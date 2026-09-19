import { useState, useRef, type MouseEvent as ReactMouseEvent, type TouchEvent as ReactTouchEvent } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { usePlayerStore } from '../../stores/playerStore';
import { useSettingsStore } from '../../stores/settingsStore';

export default function MiniPlayerVolume() {
  const isMuted = usePlayerStore((s) => s.isMuted);
  const toggleMute = usePlayerStore((s) => s.toggleMute);
  const volume = useSettingsStore((s) => s.volume);
  const setVolume = useSettingsStore((s) => s.setVolume);

  const [isDragging, setIsDragging] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  const currentVolume = isMuted ? 0 : volume;
  const percent = Math.round(currentVolume * 100);

  const getClientX = (ev: MouseEvent | TouchEvent): number => {
    if ('touches' in ev && ev.touches.length > 0) return ev.touches[0].clientX;
    if ('changedTouches' in ev && ev.changedTouches.length > 0) return ev.changedTouches[0].clientX;
    return (ev as MouseEvent).clientX;
  };

  const handleStart = (e: ReactMouseEvent<HTMLDivElement> | ReactTouchEvent<HTMLDivElement>) => {
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return;

    setIsDragging(true);

    const updateVolume = (clientX: number) => {
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      if (isMuted) {
        usePlayerStore.setState({ isMuted: false });
      }
      setVolume(ratio);
    };

    updateVolume(getClientX(e.nativeEvent));

    const handleMove = (ev: MouseEvent | TouchEvent) => {
      updateVolume(getClientX(ev));
    };

    const handleEnd = () => {
      setIsDragging(false);
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
    <div className="flex items-center gap-[6px]">
      <button
        type="button"
        aria-label={isMuted ? '取消静音' : '静音'}
        onClick={toggleMute}
        className="cursor-pointer select-none transition-colors duration-[var(--duration-hover)] ease-[var(--ease-apple)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
        style={{
          color: isMuted ? 'var(--accent)' : undefined,
        }}
      >
        {isMuted || volume === 0 ? (
          <VolumeX className="w-[18px] h-[18px] shrink-0" />
        ) : (
          <Volume2 className="w-[18px] h-[18px] shrink-0" />
        )}
      </button>

      {/* 横向音量条 (72px) */}
      <div
        ref={barRef}
        role="slider"
        aria-label="音量调节"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        tabIndex={0}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        className="group/vol relative w-[72px] h-[16px] flex items-center cursor-pointer select-none"
      >
        <div className="w-full h-[2px] rounded-[var(--radius-full)] bg-[var(--overlay-15)] overflow-hidden">
          <div
            className="h-full bg-[var(--text-secondary)] rounded-[var(--radius-full)] pointer-events-none"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* 交互滑块 */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[8px] h-[8px] rounded-[var(--radius-full)] bg-[var(--text-primary)] shadow-sm pointer-events-none transition-opacity duration-[var(--duration-hover)] opacity-0 group-hover/vol:opacity-100"
          style={{
            left: `${percent}%`,
            opacity: isDragging ? 1 : undefined,
          }}
        />
      </div>
    </div>
  );
}
