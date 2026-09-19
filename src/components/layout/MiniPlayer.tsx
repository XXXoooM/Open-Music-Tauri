import { Repeat, Repeat1, Shuffle, SkipBack, Play, Pause, SkipForward, Mic2, ListMusic } from 'lucide-react';
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

const MODE_MAP = {
  'list-loop': { next: 'single-loop' as const, label: '顺序循环', Icon: Repeat },
  'single-loop': { next: 'shuffle' as const, label: '单曲循环', Icon: Repeat1 },
  'shuffle': { next: 'list-loop' as const, label: '随机播放', Icon: Shuffle },
};

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

  const currentMode = MODE_MAP[playMode] ?? MODE_MAP['list-loop'];
  const ModeIcon = currentMode.Icon;

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
        <div className="flex items-center justify-center gap-[20px]">
          {/* 左侧 18px 预留位：保持播放按钮绝对居中对称（待办：待确定功能后填充） */}
          <div className="w-[18px] h-[18px] shrink-0 pointer-events-none" aria-hidden="true" />

          <button
            type="button"
            aria-label="上一首"
            onClick={prev}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer select-none transition-colors duration-[var(--duration-hover)] ease-[var(--ease-apple)]"
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
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer select-none transition-colors duration-[var(--duration-hover)] ease-[var(--ease-apple)]"
          >
            <SkipForward className="w-[18px] h-[18px] shrink-0" />
          </button>

          {/* 模式合一切换按钮（亮色层级提升，取消深灰色） */}
          <button
            type="button"
            aria-label={currentMode.label}
            title={currentMode.label}
            onClick={() => setPlayMode(currentMode.next)}
            className="cursor-pointer select-none transition-colors duration-[var(--duration-hover)] ease-[var(--ease-apple)] hover:text-[var(--text-primary)]"
            style={{
              color: playMode !== 'list-loop' ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            <ModeIcon className="w-[18px] h-[18px] shrink-0" />
          </button>
        </div>

        <MiniPlayerProgress />
      </div>

      {/* Right: 功能区 (30%，默认亮色提升，取消深灰色) */}
      <div data-mini-player-right className="w-[30%] min-w-0 flex items-center justify-end gap-[16px]">
        <button
          type="button"
          aria-label="歌词与全屏播放"
          onClick={onToggleNowPlaying}
          className="cursor-pointer select-none transition-colors duration-[var(--duration-hover)] ease-[var(--ease-apple)] hover:text-[var(--text-primary)]"
          style={{ color: isNowPlayingOpen ? 'var(--text-primary)' : 'var(--text-secondary)' }}
        >
          <Mic2 className="w-[18px] h-[18px] shrink-0" />
        </button>

        <MiniPlayerVolume />

        <button
          type="button"
          aria-label="待播清单"
          onClick={onToggleQueue}
          className="cursor-pointer select-none transition-colors duration-[var(--duration-hover)] ease-[var(--ease-apple)] hover:text-[var(--text-primary)]"
          style={{ color: isQueueOpen ? 'var(--text-primary)' : 'var(--text-secondary)' }}
        >
          <ListMusic className="w-[18px] h-[18px] shrink-0" />
        </button>
      </div>
    </footer>
  );
}
