import { useState, useRef, useEffect, type MouseEvent as ReactMouseEvent } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { usePlayerStore } from '../../stores/playerStore';
import { useSettingsStore } from '../../stores/settingsStore';

export default function MiniPlayerVolume() {
  const isMuted = usePlayerStore((s) => s.isMuted);
  const toggleMute = usePlayerStore((s) => s.toggleMute);
  const volume = useSettingsStore((s) => s.volume);
  const setVolume = useSettingsStore((s) => s.setVolume);

  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const currentVolume = isMuted ? 0 : volume;
  const percent = Math.round(currentVolume * 100);

  const handleMouseEnter = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (isDragging) return;
    closeTimerRef.current = window.setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const handleTrackStart = (e: ReactMouseEvent<HTMLDivElement>) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.height <= 0) return;

    setIsDragging(true);

    const updateFromY = (clientY: number) => {
      const ratio = Math.max(0, Math.min(1, (rect.bottom - clientY) / rect.height));
      if (isMuted) {
        usePlayerStore.setState({ isMuted: false });
      }
      setVolume(ratio);
    };

    updateFromY(e.clientY);

    const handleMove = (ev: MouseEvent) => {
      updateFromY(ev.clientY);
    };

    const handleEnd = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
  };

  return (
    <div
      className="relative flex items-center justify-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 竖向音量气泡浮层 */}
      {(isOpen || isDragging) && (
        <div
          className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-[38px] py-[12px] flex flex-col items-center gap-[10px] rounded-[var(--radius-md)] bg-[var(--material-sidebar)] backdrop-blur-[var(--blur-panel)] shadow-xl z-[var(--z-panel)] select-none"
          style={{ border: '0.5px solid var(--border-subtle)' }}
        >
          {/* 百分比数字 */}
          <span className="text-[10px] text-[var(--text-tertiary)] tabular-nums select-none leading-none">
            {percent}
          </span>

          {/* 竖向滑轨容器 (热区 16px 宽，80px 高) */}
          <div
            ref={trackRef}
            role="slider"
            aria-label="音量调节"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            tabIndex={0}
            onMouseDown={handleTrackStart}
            className="group/track relative w-[16px] h-[80px] flex items-center justify-center cursor-pointer"
          >
            {/* 轨道 */}
            <div className="w-[3px] h-full rounded-[var(--radius-full)] bg-[var(--overlay-15)] relative overflow-hidden">
              <div
                className="w-full bg-[var(--text-primary)] rounded-[var(--radius-full)] absolute bottom-0 pointer-events-none"
                style={{ height: `${percent}%` }}
              />
            </div>

            {/* 滑块小圆点 */}
            <div
              className="absolute left-1/2 -translate-x-1/2 translate-y-1/2 w-[8px] h-[8px] rounded-[var(--radius-full)] bg-[var(--text-primary)] shadow-sm pointer-events-none transition-opacity duration-[var(--duration-hover)] opacity-0 group-hover/track:opacity-100"
              style={{
                bottom: `${percent}%`,
                opacity: isDragging ? 1 : undefined,
              }}
            />
          </div>

          {/* 鼠标移动过渡连接桥，防止移向气泡时意外失去焦点 */}
          <div className="absolute inset-x-0 -bottom-[14px] h-[14px]" />
        </div>
      )}

      {/* 音量图标主按钮（强调色已取消） */}
      <button
        type="button"
        aria-label={isMuted ? '取消静音' : '静音'}
        onClick={toggleMute}
        className="cursor-pointer select-none transition-colors duration-[var(--duration-hover)] ease-[var(--ease-apple)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
      >
        {isMuted || volume === 0 ? (
          <VolumeX className="w-[18px] h-[18px] shrink-0" />
        ) : (
          <Volume2 className="w-[18px] h-[18px] shrink-0" />
        )}
      </button>
    </div>
  );
}
