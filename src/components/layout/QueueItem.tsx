import { X, Play, AudioLines } from 'lucide-react';
import type { Track } from '../../types';

interface QueueItemProps {
  track: Track;
  isCurrent: boolean;
  isPlaying: boolean;
  onPlay(): void;
  onRemove?(): void;
}

function formatDuration(sec?: number): string {
  if (sec === undefined || !Number.isFinite(sec) || sec <= 0) return '--:--';
  return `${Math.floor(sec / 60)}:${Math.floor(sec % 60).toString().padStart(2, '0')}`;
}

export default function QueueItem({
  track,
  isCurrent,
  isPlaying,
  onPlay,
  onRemove,
}: QueueItemProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onPlay}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onPlay();
      }}
      className={`group w-full h-[46px] flex items-center gap-[10px] px-[8px] rounded-[var(--radius-sm)] text-left cursor-pointer select-none transition-colors duration-[var(--duration-hover)] ease-[var(--ease-apple)] hover:bg-[var(--hover)] ${
        isCurrent ? 'bg-[var(--active)]' : ''
      }`}
    >
      {/* 封面缩略图 */}
      <div className="relative w-[34px] h-[34px] rounded-[var(--radius-sm)] overflow-hidden bg-[var(--hover)] shrink-0">
        {track.pic ? (
          <img src={track.pic} alt={track.name} className="w-full h-full object-cover" draggable={false} />
        ) : null}
        {isCurrent && (
          <div className="absolute inset-0 bg-[var(--dynamic-overlay)] flex items-center justify-center">
            {isPlaying ? (
              <AudioLines className="w-[14px] h-[14px] text-[var(--accent)]" />
            ) : (
              <Play className="w-[14px] h-[14px] ml-[2px] text-[var(--accent)] fill-current" />
            )}
          </div>
        )}
      </div>

      {/* 歌曲与歌手 */}
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

      {/* 悬停操作 / 时长显示 */}
      <div className="shrink-0 flex items-center justify-end w-[44px]">
        {onRemove && (
          <button
            type="button"
            aria-label="移出待播清单"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1 rounded-[var(--radius-sm)] text-[var(--text-tertiary)] hover:text-[var(--accent)] hover:bg-[var(--hover)] transition-colors hidden group-hover:flex items-center justify-center cursor-pointer"
          >
            <X className="w-[13px] h-[13px]" />
          </button>
        )}
        <span className={`text-[11px] text-[var(--text-tertiary)] tabular-nums ${onRemove ? 'group-hover:hidden' : ''}`}>
          {formatDuration(track.duration)}
        </span>
      </div>
    </div>
  );
}
