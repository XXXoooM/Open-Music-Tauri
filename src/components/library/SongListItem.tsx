import { Heart, ListEnd } from 'lucide-react';
import type { Track } from '../../types';
import EqualizerIcon from '../ui/EqualizerIcon';
import { usePlayerStore } from '../../stores/playerStore';
import { useToastStore } from '../../stores/toastStore';

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
  const handlePlayNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const { playlist, currentTrackIndex } = usePlayerStore.getState();
    const nextList = [...playlist];
    nextList.splice(currentTrackIndex + 1, 0, track);
    usePlayerStore.setState({ playlist: nextList });
    useToastStore.getState().showToast('已设为下一首播放', 'success');
  };

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
      {/* 序号：纯数字序号，当前播放时显示跳动音浪 */}
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
        title={isFavorite ? '取消收藏' : '添加到收藏'}
        aria-label={isFavorite ? '取消收藏' : '收藏'}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        className={`p-1.5 rounded-[var(--radius-sm)] cursor-pointer transition-colors ${
          isFavorite
            ? 'text-[var(--accent)] opacity-100'
            : 'text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--hover)] opacity-0 group-hover:opacity-100'
        }`}
      >
        <Heart className={`w-[16px] h-[16px] ${isFavorite ? 'fill-current' : ''}`} strokeWidth={2} />
      </button>

      {/* 时长 */}
      <span className="w-[44px] shrink-0 text-right text-[13px] text-[var(--text-tertiary)] tabular-nums">
        {formatDuration(track.duration)}
      </span>

      {/* 下一首播放按钮（原更多操作位置，悬停浮现） */}
      <button
        type="button"
        title="下一首播放"
        aria-label="下一首播放"
        onClick={handlePlayNext}
        className="p-1.5 rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--hover)] transition-colors cursor-pointer opacity-0 group-hover:opacity-100 shrink-0"
      >
        <ListEnd className="w-[16px] h-[16px]" strokeWidth={2} />
      </button>
    </div>
  );
}
