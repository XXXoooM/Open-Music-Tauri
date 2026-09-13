import { useEffect } from 'react';
import { ChevronDown, Minus, Square, X, User, Disc } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { isTauri } from '../../env';
import { usePlayerStore } from '../../stores/playerStore';
import AlbumArt from './AlbumArt';
import ControlBar from './ControlBar';
import DynamicBackground from './DynamicBackground';
import LyricsView from './LyricsView';

interface NowPlayingProps {
  isOpen: boolean;
  onClose(): void;
}

export default function NowPlaying({ isOpen, onClose }: NowPlayingProps) {
  const track = usePlayerStore((s) => s.playlist[s.currentTrackIndex]);
  const subtitle = track?.alias || (track?.album && track.album !== track.name ? track.album : undefined);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <div
      data-region="now-playing"
      className={`fixed inset-0 flex flex-col justify-between select-none overflow-hidden transition-[opacity,transform,filter] duration-[var(--duration-page)] ease-[var(--ease-apple)] ${
        isOpen ? 'opacity-100 scale-100 blur-0 pointer-events-auto' : 'opacity-0 scale-100 blur-[8px] pointer-events-none'
      }`}
      style={{ zIndex: 100, backgroundColor: 'var(--dynamic-bg-base, #081612)' }}
    >
      <DynamicBackground />

      {/* 极简顶栏 */}
      <header className="h-[56px] px-[32px] flex items-center justify-between shrink-0 drag-region z-10">
        <button
          type="button"
          onClick={onClose}
          className="no-drag p-1.5 cursor-pointer text-white/70 hover:text-white transition-opacity"
        >
          <ChevronDown className="w-[24px] h-[24px]" />
        </button>

        {isTauri && (
          <div className="no-drag flex items-center gap-[10px]">
            <button
              type="button"
              onClick={() => void getCurrentWindow().minimize()}
              className="w-[26px] h-[26px] rounded-[var(--radius-sm)] flex items-center justify-center cursor-pointer text-white/60 hover:text-white transition-opacity"
            >
              <Minus className="w-[14px] h-[14px]" />
            </button>
            <button
              type="button"
              onClick={() => void getCurrentWindow().toggleMaximize()}
              className="w-[26px] h-[26px] rounded-[var(--radius-sm)] flex items-center justify-center cursor-pointer text-white/60 hover:text-white transition-opacity"
            >
              <Square className="w-[13px] h-[13px]" />
            </button>
            <button
              type="button"
              onClick={() => void getCurrentWindow().close()}
              className="w-[26px] h-[26px] rounded-[var(--radius-sm)] flex items-center justify-center cursor-pointer text-white/60 hover:text-white hover:text-[rgb(255,69,58)] transition-all"
            >
              <X className="w-[14px] h-[14px]" />
            </button>
          </div>
        )}
      </header>

      {/* 主内容区（50% / 50% 对等分割，歌词起于 50vw 正中线） */}
      <main data-now-playing-main className="flex-1 flex items-center min-h-0 w-full overflow-hidden">
        <section className="w-1/2 h-full flex flex-col items-start justify-center pl-[clamp(48px,6vw,96px)] pr-[clamp(24px,3vw,48px)]">
          <AlbumArt />

          <div className="mt-[24px] max-w-full">
            <h1
              className="font-bold truncate leading-tight tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(36px, 3.6vw, 48px)',
              }}
            >
              {track?.name ?? '未在播放'}
            </h1>

            {subtitle && (
              <p className="text-[17px] mt-[6px] truncate font-medium text-white/65">
                {subtitle}
              </p>
            )}

            <div className="mt-[12px] flex flex-col gap-[6px]">
              <div className="flex items-center text-[13px] tracking-wide truncate text-white/45">
                <User className="w-[13px] h-[13px] mr-[7px] shrink-0 opacity-70" />
                <span className="truncate">{track?.artist ?? '未知歌手'}</span>
              </div>

              {track?.album && (
                <div className="flex items-center text-[13px] tracking-wide truncate text-white/45">
                  <Disc className="w-[13px] h-[13px] mr-[7px] shrink-0 opacity-70" />
                  <span className="truncate">{track.album}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        <section
          className="w-1/2 h-full overflow-hidden relative pl-[clamp(24px,3vw,48px)] pr-[clamp(48px,6vw,96px)]"
          style={{ height: 'calc(100vh - 160px)' }}
        >
          <LyricsView />
        </section>
      </main>

      <ControlBar />
    </div>
  );
}
