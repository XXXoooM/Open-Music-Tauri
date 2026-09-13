import { Shuffle, SkipBack, Play, Pause, SkipForward, Repeat, Mic2, Volume2, VolumeX, ListMusic } from 'lucide-react';
import { usePlayerStore } from '../../stores/playerStore';
import { useSettingsStore } from '../../stores/settingsStore';

interface MiniPlayerProps {
  /** 点击封面时打开全屏播放页 */
  onOpenNowPlaying(): void;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
}

export default function MiniPlayer({ onOpenNowPlaying }: MiniPlayerProps) {
  const track = usePlayerStore((s) => s.playlist[s.currentTrackIndex]);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const progress = usePlayerStore((s) => s.progress);
  const duration = usePlayerStore((s) => s.duration);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const isMuted = usePlayerStore((s) => s.isMuted);
  const toggleMute = usePlayerStore((s) => s.toggleMute);
  const playMode = useSettingsStore((s) => s.playMode);
  const setPlayMode = useSettingsStore((s) => s.setPlayMode);

  return (
    <footer
      data-region="mini-player"
      className="w-full h-[72px] shrink-0 px-[16px] flex items-center justify-between bg-[var(--material-player)] backdrop-blur-[var(--blur-player)]"
      style={{ borderTop: '0.5px solid var(--border-subtle)' }}
    >
      {/* Left: Info Area (30%) */}
      <div data-mini-player-left className="w-[30%] min-w-0 flex items-center gap-[12px]">
        <button
          type="button"
          onClick={onOpenNowPlaying}
          className="w-[48px] h-[48px] shrink-0 rounded-[var(--radius-sm)] overflow-hidden bg-[var(--hover)] cursor-pointer hover:opacity-90 transition-opacity duration-[var(--duration-hover)] ease-[var(--ease-apple)]"
        >
          {track?.pic ? <img src={track.pic} alt={track.name} className="w-full h-full object-cover" draggable={false} /> : null}
        </button>

        <button type="button" onClick={onOpenNowPlaying} className="flex flex-col min-w-0 gap-[2px] text-left cursor-pointer">
          <span className="text-[14px] font-medium text-[var(--text-primary)] truncate-1 select-none">
            {track?.name ?? '未在播放'}
          </span>
          <span className="text-[12px] text-[var(--text-secondary)] truncate-1 select-none">
            {track?.artist ?? '请选择歌曲'}
          </span>
        </button>
      </div>

      {/* Center: Controls & Progress (40%) */}
      <div data-mini-player-center className="w-[40%] min-w-0 flex flex-col items-center justify-center gap-[2px]">
        {/* Buttons Group */}
        <div className="flex items-center justify-center gap-[20px]">
          <button
            type="button"
            aria-label="随机播放"
            onClick={() => setPlayMode(playMode === 'shuffle' ? 'list-loop' : 'shuffle')}
            className="cursor-pointer select-none transition-colors duration-[var(--duration-hover)] ease-[var(--ease-apple)] hover:text-[var(--text-secondary)]"
            style={{
              color: playMode === 'shuffle' ? 'var(--accent)' : 'var(--text-tertiary)',
            }}
          >
            <Shuffle className="w-[18px] h-[18px] shrink-0" />
          </button>
          <button type="button" aria-label="上一首" onClick={prev} className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] cursor-pointer select-none transition-colors duration-[var(--duration-hover)] ease-[var(--ease-apple)]">
            <SkipBack className="w-[18px] h-[18px] shrink-0" />
          </button>
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? '暂停' : '播放'}
            className="w-[44px] h-[44px] rounded-[var(--radius-full)] shrink-0 flex items-center justify-center cursor-pointer select-none transition-colors duration-[var(--duration-hover)] ease-[var(--ease-apple)]"
            style={{
              backgroundColor: isPlaying ? 'var(--text-primary)' : 'rgba(255, 255, 255, 0.15)',
              // 播放态图标色为黑色，DESIGN.md 6.6 明确规定
              // （后续可考虑在 tokens.css 中定义 --color-icon-on-light）
              color: isPlaying ? '#000' : 'var(--text-secondary)',
            }}
          >
            {isPlaying ? <Pause className="w-[20px] h-[20px]" /> : <Play className="w-[20px] h-[20px] ml-[2px] fill-current" />}
          </button>
          <button type="button" aria-label="下一首" onClick={next} className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] cursor-pointer select-none transition-colors duration-[var(--duration-hover)] ease-[var(--ease-apple)]">
            <SkipForward className="w-[18px] h-[18px] shrink-0" />
          </button>
          <button
            type="button"
            aria-label="循环播放"
            onClick={() => setPlayMode(playMode === 'list-loop' ? 'single-loop' : 'list-loop')}
            className="cursor-pointer select-none transition-colors duration-[var(--duration-hover)] ease-[var(--ease-apple)] hover:text-[var(--text-secondary)]"
            style={{
              color: playMode === 'list-loop' || playMode === 'single-loop'
                ? 'var(--accent)'
                : 'var(--text-tertiary)',
            }}
          >
            <Repeat className="w-[18px] h-[18px] shrink-0" />
          </button>
        </div>

        {/* Progress Bar & Time */}
        <div className="w-full flex items-center gap-[8px]">
          <span className="w-[40px] text-right text-[11px] text-[var(--text-tertiary)] tabular-nums shrink-0 select-none">
            {formatTime(progress)}
          </span>
          <div className="flex-1 h-[2px] rounded-[var(--radius-full)] bg-[rgba(255,255,255,0.15)] overflow-hidden">
            <div
              className="h-full bg-[var(--text-primary)] rounded-[var(--radius-full)]"
              style={{ width: duration > 0 ? `${(progress / duration) * 100}%` : '0%' }}
            />
          </div>
          <span className="w-[40px] text-left text-[11px] text-[var(--text-tertiary)] tabular-nums shrink-0 select-none">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Right: Function Icons (30%) */}
      <div data-mini-player-right className="w-[30%] min-w-0 flex items-center justify-end gap-[16px]">
        <button type="button" aria-label="歌词" className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] cursor-pointer select-none transition-colors duration-[var(--duration-hover)] ease-[var(--ease-apple)]">
          <Mic2 className="w-[18px] h-[18px] shrink-0" />
        </button>
        <button
          type="button"
          aria-label={isMuted ? '取消静音' : '静音'}
          onClick={toggleMute}
          className="cursor-pointer select-none transition-colors duration-[var(--duration-hover)] ease-[var(--ease-apple)]"
          style={{
            color: isMuted ? 'var(--text-tertiary)' : 'var(--text-secondary)',
          }}
        >
          {isMuted ? <VolumeX className="w-[18px] h-[18px] shrink-0" /> : <Volume2 className="w-[18px] h-[18px] shrink-0" />}
        </button>
        <button type="button" aria-label="播放队列" className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] cursor-pointer select-none transition-colors duration-[var(--duration-hover)] ease-[var(--ease-apple)]">
          <ListMusic className="w-[18px] h-[18px] shrink-0" />
        </button>
      </div>
    </footer>
  );
}
