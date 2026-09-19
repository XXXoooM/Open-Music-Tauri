import { Shuffle, SkipBack, Play, Pause, SkipForward, Repeat, Mic2, ListMusic } from 'lucide-react';
import { usePlayerStore } from '../../stores/playerStore';
import { useSettingsStore } from '../../stores/settingsStore';
import MiniPlayerProgress from './MiniPlayerProgress';
import MiniPlayerVolume from './MiniPlayerVolume';

interface MiniPlayerProps {
  isNowPlayingOpen: boolean;
  onToggleNowPlaying(): void;
  isQueueOpen: boolean;
  onToggleQueue(): void;
}

export default function MiniPlayer({
  isNowPlayingOpen,
  onToggleNowPlaying,
  isQueueOpen,
  onToggleQueue,
}: MiniPlayerProps) {
  const track = usePlayerStore((s) => s.playlist[s.currentTrackIndex]);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const playMode = useSettingsStore((s) => s.playMode);
  const setPlayMode = useSettingsStore((s) => s.setPlayMode);

  return (
    <footer
      data-region="mini-player"
      className="w-full h-[72px] shrink-0 px-[16px] flex items-center justify-between bg-[var(--material-player)] backdrop-blur-[var(--blur-player)]"
      style={{ borderTop: '0.5px solid var(--border-subtle)' }}
    >
      {/* Left: 统一信息点击区 (30%) */}
      <button
        type="button"
        onClick={onToggleNowPlaying}
        aria-label="打开播放详情"
        className="w-[30%] min-w-0 flex items-center gap-[12px] text-left cursor-pointer group select-none p-[4px] -ml-[4px] rounded-[var(--radius-md)] hover:bg-[var(--hover)] transition-colors duration-[var(--duration-hover)]"
      >
        <div className="w-[48px] h-[48px] shrink-0 rounded-[var(--radius-sm)] overflow-hidden bg-[var(--hover)] group-hover:opacity-90 transition-opacity duration-[var(--duration-hover)] ease-[var(--ease-apple)]">
          {track?.pic ? (
            <img src={track.pic} alt={track.name} className="w-full h-full object-cover" draggable={false} />
          ) : null}
        </div>

        <div className="flex flex-col min-w-0 gap-[2px]">
          <span className="text-[14px] font-medium text-[var(--text-primary)] truncate-1">
            {track?.name ?? '未在播放'}
          </span>
          <span className="text-[12px] text-[var(--text-secondary)] truncate-1">
            {track?.artist ?? '请选择歌曲'}
          </span>
        </div>
      </button>

      {/* Center: 控制按钮群与交互进度条 (40%) */}
      <div data-mini-player-center className="w-[40%] min-w-0 flex flex-col items-center justify-center gap-[2px]">
        {/* 控制按钮群 */}
        <div className="flex items-center justify-center gap-[20px]">
          <button
            type="button"
            aria-label="随机播放"
            onClick={() => setPlayMode(playMode === 'shuffle' ? 'list-loop' : 'shuffle')}
            className="cursor-pointer select-none transition-colors duration-[var(--duration-hover)] ease-[var(--ease-apple)] hover:text-[var(--text-secondary)]"
            style={{ color: playMode === 'shuffle' ? 'var(--accent)' : 'var(--text-tertiary)' }}
          >
            <Shuffle className="w-[18px] h-[18px] shrink-0" />
          </button>

          <button
            type="button"
            aria-label="上一首"
            onClick={prev}
            className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] cursor-pointer select-none transition-colors duration-[var(--duration-hover)] ease-[var(--ease-apple)]"
          >
            <SkipBack className="w-[18px] h-[18px] shrink-0" />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? '暂停' : '播放'}
            className="w-[44px] h-[44px] rounded-[var(--radius-full)] shrink-0 flex items-center justify-center cursor-pointer select-none transition-colors duration-[var(--duration-hover)] ease-[var(--ease-apple)]"
            style={{
              backgroundColor: isPlaying ? 'var(--text-primary)' : 'var(--overlay-15)',
              color: isPlaying ? '#000' : 'var(--text-secondary)',
            }}
          >
            {isPlaying ? <Pause className="w-[20px] h-[20px]" /> : <Play className="w-[20px] h-[20px] ml-[2px] fill-current" />}
          </button>

          <button
            type="button"
            aria-label="下一首"
            onClick={next}
            className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] cursor-pointer select-none transition-colors duration-[var(--duration-hover)] ease-[var(--ease-apple)]"
          >
            <SkipForward className="w-[18px] h-[18px] shrink-0" />
          </button>

          <button
            type="button"
            aria-label="循环播放"
            onClick={() => setPlayMode(playMode === 'list-loop' ? 'single-loop' : 'list-loop')}
            className="cursor-pointer select-none transition-colors duration-[var(--duration-hover)] ease-[var(--ease-apple)] hover:text-[var(--text-secondary)]"
            style={{
              color: playMode === 'list-loop' || playMode === 'single-loop' ? 'var(--accent)' : 'var(--text-tertiary)',
            }}
          >
            <Repeat className="w-[18px] h-[18px] shrink-0" />
          </button>
        </div>

        {/* 交互进度条子组件 */}
        <MiniPlayerProgress />
      </div>

      {/* Right: 功能区 (30%) */}
      <div data-mini-player-right className="w-[30%] min-w-0 flex items-center justify-end gap-[16px]">
        <button
          type="button"
          aria-label="歌词与全屏播放"
          onClick={onToggleNowPlaying}
          className="cursor-pointer select-none transition-colors duration-[var(--duration-hover)] ease-[var(--ease-apple)] hover:text-[var(--text-secondary)]"
          style={{ color: isNowPlayingOpen ? 'var(--accent)' : 'var(--text-tertiary)' }}
        >
          <Mic2 className="w-[18px] h-[18px] shrink-0" />
        </button>

        <MiniPlayerVolume />

        <button
          type="button"
          aria-label="待播清单"
          onClick={onToggleQueue}
          className="cursor-pointer select-none transition-colors duration-[var(--duration-hover)] ease-[var(--ease-apple)] hover:text-[var(--text-secondary)]"
          style={{ color: isQueueOpen ? 'var(--accent)' : 'var(--text-tertiary)' }}
        >
          <ListMusic className="w-[18px] h-[18px] shrink-0" />
        </button>
      </div>
    </footer>
  );
}
