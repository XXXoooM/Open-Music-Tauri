import { useEffect, useRef } from 'react';
import { X, Play } from 'lucide-react';
import { usePlayerStore } from '../../stores/playerStore';

interface QueuePanelProps {
  isOpen: boolean;
  onClose(): void;
}

function formatDuration(sec?: number): string {
  if (sec === undefined || !Number.isFinite(sec) || sec <= 0) return '--:--';
  return `${Math.floor(sec / 60)}:${Math.floor(sec % 60).toString().padStart(2, '0')}`;
}

export default function QueuePanel({ isOpen, onClose }: QueuePanelProps) {
  const playlist = usePlayerStore((s) => s.playlist);
  const currentTrackIndex = usePlayerStore((s) => s.currentTrackIndex);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playAt = usePlayerStore((s) => s.playAt);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="fixed bottom-[80px] right-[16px] w-[340px] max-h-[480px] flex flex-col rounded-[var(--radius-lg)] overflow-hidden shadow-2xl z-[var(--z-panel)] select-none bg-[var(--material-sidebar)] backdrop-blur-[var(--blur-panel)]"
      style={{ border: '0.5px solid var(--border-subtle)' }}
    >
      {/* 头部标题与关闭按钮 */}
      <div className="flex items-center justify-between px-[16px] py-[12px] border-b border-[var(--border-subtle)] shrink-0">
        <div className="flex items-baseline gap-[8px]">
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">待播清单</h2>
          <span className="text-[12px] text-[var(--text-tertiary)]">{playlist.length} 首歌曲</span>
        </div>
        <button
          type="button"
          aria-label="关闭待播清单"
          onClick={onClose}
          className="p-1 rounded-[var(--radius-sm)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)] transition-colors cursor-pointer"
        >
          <X className="w-[16px] h-[16px]" />
        </button>
      </div>

      {/* 歌曲列表滚动区 */}
      <div className="flex-1 overflow-y-auto p-[8px] space-y-[4px]">
        {playlist.map((track, idx) => {
          const isCurrent = idx === currentTrackIndex;
          return (
            <button
              key={`${track.id}-${idx}`}
              type="button"
              onClick={() => playAt(idx)}
              className="w-full flex items-center gap-[10px] p-[6px] rounded-[var(--radius-sm)] text-left cursor-pointer transition-colors group"
              style={{
                backgroundColor: isCurrent ? 'var(--hover)' : undefined,
              }}
            >
              {/* 封面缩略图 */}
              <div className="relative w-[36px] h-[36px] rounded-[var(--radius-sm)] overflow-hidden bg-[var(--hover)] shrink-0">
                {track.pic ? (
                  <img src={track.pic} alt={track.name} className="w-full h-full object-cover" />
                ) : null}
                {isCurrent && isPlaying && (
                  <div className="absolute inset-0 bg-[var(--dynamic-overlay)] flex items-center justify-center">
                    <Play className="w-[14px] h-[14px] text-[var(--accent)] fill-current" />
                  </div>
                )}
              </div>

              {/* 歌曲与歌手信息 */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-[13px] font-medium truncate"
                  style={{ color: isCurrent ? 'var(--accent)' : 'var(--text-primary)' }}
                >
                  {track.name}
                </p>
                <p className="text-[11px] text-[var(--text-secondary)] truncate">
                  {track.artist}
                </p>
              </div>

              {/* 时长 */}
              <span className="text-[11px] text-[var(--text-tertiary)] tabular-nums shrink-0">
                {formatDuration(track.duration)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
