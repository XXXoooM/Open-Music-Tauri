import { Heart, AudioLines, Play } from 'lucide-react';
import type { Track } from '../../types';

interface SongListItemProps {
  track: Track;
  index: number;
  isCurrent: boolean;
  isPlaying: boolean;
  isFavorite: boolean;
  onPlay(): void;
  onToggleFavorite(): void;
}

function formatDuration(seconds?: number): string {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return '--:--';
  return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
}

export default function SongListItem({
  track,
  index,
  isCurrent,
  isPlaying,
  isFavorite,
  onPlay,
  onToggleFavorite,
}: SongListItemProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onPlay}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onPlay();
      }}
      className={`group w-full h-[56px] flex items-center gap-[16px] px-[12px] rounded-[var(--radius-sm)] text-left cursor-pointer select-none transition-colors duration-[var(--duration-hover)] ease-[var(--ease-apple)] hover:bg-[var(--hover)] ${
        isCurrent ? 'bg-[var(--active)]' : ''
      }`}
    >
      {/* 序号或播放动效 */}
      <span
        className="w-[24px] shrink-0 flex items-center justify-center text-[13px] tabular-nums"
        style={{ color: isCurrent ? 'var(--dynamic-accent)' : 'var(--text-tertiary)' }}
      >
        {isCurrent ? (
          isPlaying ? (
            <AudioLines className="w-[14px] h-[14px]" />
          ) : (
            <Play className="w-[14px] h-[14px] ml-[2px] fill-current" />
          )
        ) : (
          index + 1
        )}
      </span>

      {/* 封面缩略图 */}
      <div className="w-[40px] h-[40px] shrink-0 rounded-[var(--radius-sm)] overflow-hidden bg-[var(--hover)]">
        {track.pic ? (
          <img src={track.pic} alt={track.name} className="w-full h-full object-cover" draggable={false} />
        ) : null}
      </div>

      {/* 歌名与歌手 */}
      <div className="flex-1 min-w-0 flex flex-col gap-[2px]">
        <span
          className="text-[14px] font-medium truncate-1"
          style={{ color: isCurrent ? 'var(--dynamic-accent)' : 'var(--text-primary)' }}
        >
          {track.name}
        </span>
        <span className="text-[13px] text-[var(--text-secondary)] truncate-1">{track.artist}</span>
      </div>

      {/* 专辑名称 */}
      <div className="w-[180px] shrink-0 text-[13px] text-[var(--text-secondary)] truncate-1">
        {track.album ?? '—'}
      </div>

      {/* 悬停浮现 / 已收藏常驻 Heart 按钮 */}
      <button
        type="button"
        aria-label={isFavorite ? '取消收藏' : '收藏'}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        className={`p-1.5 rounded-[var(--radius-sm)] cursor-pointer transition-all duration-[var(--duration-hover)] ${
          isFavorite
            ? 'text-[var(--accent)] opacity-100'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] opacity-0 group-hover:opacity-100'
        }`}
      >
        <Heart className={`w-[16px] h-[16px] ${isFavorite ? 'fill-current' : ''}`} />
      </button>

      {/* 时长 */}
      <span className="w-[48px] shrink-0 text-right text-[13px] text-[var(--text-tertiary)] tabular-nums">
        {formatDuration(track.duration)}
      </span>
    </div>
  );
}
