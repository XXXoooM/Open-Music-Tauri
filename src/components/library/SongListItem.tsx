import { useState } from 'react';
import { Heart, Play, MoreHorizontal } from 'lucide-react';
import type { Track } from '../../types';
import EqualizerIcon from '../ui/EqualizerIcon';
import SongActionMenu from './SongActionMenu';

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
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onPlay}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onPlay();
      }}
      className={`group relative w-full h-[56px] flex items-center gap-[16px] px-[12px] rounded-[var(--radius-sm)] text-left cursor-pointer select-none transition-colors duration-[var(--duration-hover)] ease-[var(--ease-apple)] ${
        isCurrent ? 'bg-[var(--active)] font-medium shadow-sm' : 'hover:bg-[var(--hover)]'
      }`}
    >
      {/* 序号或动态三柱均衡器 */}
      <span className="w-[24px] shrink-0 flex items-center justify-center text-[13px] tabular-nums text-[var(--text-tertiary)]">
        {isCurrent ? (
          <EqualizerIcon isPlaying={isPlaying} />
        ) : (
          <>
            <span className="group-hover:hidden">{index + 1}</span>
            <Play className="w-[13px] h-[13px] hidden group-hover:block text-[var(--text-primary)] fill-current ml-[2px]" />
          </>
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
        {track.album || '—'}
      </div>

      {/* 收藏按钮 */}
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
      <span className="w-[44px] shrink-0 text-right text-[13px] text-[var(--text-tertiary)] tabular-nums">
        {formatDuration(track.duration)}
      </span>

      {/* 更多操作按钮与气泡菜单 */}
      <div className="relative shrink-0">
        <button
          type="button"
          aria-label="更多操作"
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(!isMenuOpen);
          }}
          className={`p-1.5 rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)] transition-all cursor-pointer ${
            isMenuOpen ? 'opacity-100 bg-[var(--hover)]' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <MoreHorizontal className="w-[16px] h-[16px]" />
        </button>

        <SongActionMenu
          track={track}
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
        />
      </div>
    </div>
  );
}
