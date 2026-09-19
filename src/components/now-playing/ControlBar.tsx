import { Heart } from 'lucide-react';
import { usePlayerStore } from '../../stores/playerStore';
import ProgressBar from './ProgressBar';

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export default function ControlBar() {
  const currentTrack = usePlayerStore((s) => s.playlist[s.currentTrackIndex]);
  const favoriteIds = usePlayerStore((s) => s.favoriteIds);
  const toggleFavorite = usePlayerStore((s) => s.toggleFavorite);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const progress = usePlayerStore((s) => s.progress);
  const duration = usePlayerStore((s) => s.duration);
  const remaining = Math.max(0, duration - progress);

  const isFav = currentTrack ? favoriteIds.includes(currentTrack.id) : false;

  return (
    <footer className="shrink-0 w-full select-none relative z-10">
      <div className="h-[76px] px-[48px] flex justify-between items-center">
        {/* 左：爱心收藏按钮 */}
        <button
          type="button"
          aria-label={isFav ? '取消收藏' : '收藏歌曲'}
          onClick={() => currentTrack && toggleFavorite(currentTrack.id)}
          className="cursor-pointer p-2 transition-transform hover:scale-110 active:scale-90 select-none"
          style={{
            color: isFav ? 'var(--accent)' : 'var(--dynamic-text-secondary)',
          }}
        >
          <Heart className={`w-[22px] h-[22px] ${isFav ? 'fill-current' : ''}`} />
        </button>

        {/* 中：纯粹实心浮动播放/暂停按钮 */}
        <button
          type="button"
          onClick={togglePlay}
          className="cursor-pointer p-2 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 text-[var(--dynamic-text-primary)]"
        >
          {isPlaying ? (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <rect x="5.5" y="4" width="4" height="16" rx="2" />
              <rect x="14.5" y="4" width="4" height="16" rx="2" />
            </svg>
          ) : (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" className="ml-[2px]">
              <path d="M7 4.8c0-1.2 1.3-2 2.3-1.4l11 6.6c1 0.6 1 2.1 0 2.7l-11 6.6c-1 0.6-2.3-0.1-2.3-1.4V4.8z" />
            </svg>
          )}
        </button>

        {/* 右：当前时间 / 剩余时间倒计时（例如 3:28 / -1:09） */}
        <span className="text-[13px] tabular-nums font-medium tracking-wider text-[var(--dynamic-text-tertiary)]">
          {formatTime(progress)} / -{formatTime(remaining)}
        </span>
      </div>

      {/* 贴底极细发光进度条 */}
      <ProgressBar />
    </footer>
  );
}
