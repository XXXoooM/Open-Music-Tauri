import { useState } from 'react';
import { Heart, MoreHorizontal } from 'lucide-react';
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
      {/* 序号：只显示纯序号，当前播放时显示跳动音浪，彻底删除播放键 */}
      <span className="w-[28px] shrink-0 flex items-center justify-center text-[13px] tabular-nums text-[var(--text-tertiary)]">
        {isCurrent ? <EqualizerIcon isPlaying={isPlaying} /> : <span>{index + 1}</span>}
      </span>

      {/* 封面缩略图 */}
      <div className="w-[40px] h-[40px] shrink-0 rounded-[var(--radius-sm)] overflow-hidden bg-[var(--hover)]">
        {track.pic ? (
          <img src={track.pic} alt={track.name} className="w-full h-full object-cover" draggable={false} />
        ) : null}
      </div>

      {/* 歌名与歌手 */}
      <div className="w-[38%] min-w-0 flex flex-col gap-[2px]">
        <span
          className="text-[14px] font-medium truncate-1"
          style={{ color: isCurrent ? 'var(--dynamic-accent)' : 'var(--text-primary)' }}
        >
          {track.name}
        </span>
        <span className="text-[13px] text-[var(--text-secondary)] truncate-1">{track.artist}</span>
      </div>

      {/* 专辑名称：自适应撑开中间空间，消除视觉断裂 */}
      <div className="flex-1 min-w-0 text-[13px] text-[var(--text-secondary)] truncate-1 pr-[16px]">
        {track.album || '—'}
      </div>

      {/* 右侧区域：悬停浮现的操作按钮 + 紧贴最右侧的时长 */}
      <div className="flex items-center gap-[10px] shrink-0 justify-end">
        {/* 爱心与更多操作：仅悬停或菜单展开时显示 */}
        <div
          className={`flex items-center gap-[4px] transition-opacity duration-150 ${
            isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <button
            type="button"
            aria-label={isFavorite ? '取消收藏' : '收藏'}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className={`p-1.5 rounded-[var(--radius-sm)] cursor-pointer transition-colors ${
              isFavorite
                ? 'text-[var(--accent)] hover:opacity-80'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)]'
            }`}
          >
            <Heart className={`w-[16px] h-[16px] ${isFavorite ? 'fill-current' : ''}`} strokeWidth={2} />
          </button>

          <div className="relative">
            <button
              type="button"
              aria-label="更多操作"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className={`p-1.5 rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)] transition-colors cursor-pointer ${
                isMenuOpen ? 'text-[var(--text-primary)] bg-[var(--hover)]' : ''
              }`}
            >
              <MoreHorizontal className="w-[16px] h-[16px]" strokeWidth={2} />
            </button>

            <SongActionMenu
              track={track}
              isOpen={isMenuOpen}
              onClose={() => setIsMenuOpen(false)}
            />
          </div>
        </div>

        {/* 时长：紧贴最右侧 */}
        <span className="w-[44px] shrink-0 text-right text-[13px] text-[var(--text-tertiary)] tabular-nums">
          {formatDuration(track.duration)}
        </span>
      </div>
    </div>
  );
}
