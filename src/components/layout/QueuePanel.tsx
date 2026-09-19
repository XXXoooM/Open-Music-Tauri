import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { usePlayerStore } from '../../stores/playerStore';
import QueueItem from './QueueItem';

interface QueuePanelProps {
  isOpen: boolean;
  onClose(): void;
}

export default function QueuePanel({ isOpen, onClose }: QueuePanelProps) {
  const playlist = usePlayerStore((s) => s.playlist);
  const currentTrackIndex = usePlayerStore((s) => s.currentTrackIndex);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playAt = usePlayerStore((s) => s.playAt);
  const removeFromQueue = usePlayerStore((s) => s.removeFromQueue);
  const clearQueue = usePlayerStore((s) => s.clearQueue);

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const currentTrack = playlist[currentTrackIndex];
  const upcomingTracks = playlist.slice(currentTrackIndex + 1);

  return (
    <div
      ref={panelRef}
      className={`fixed bottom-[80px] right-[16px] w-[340px] max-h-[480px] flex flex-col rounded-[var(--radius-lg)] overflow-hidden shadow-2xl z-[var(--z-panel)] select-none bg-[var(--material-sidebar)] backdrop-blur-[var(--blur-panel)] transition-[opacity,transform] duration-[var(--duration-fast)] ease-[var(--ease-apple)] ${
        isOpen
          ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
          : 'opacity-0 translate-y-[8px] scale-[0.96] pointer-events-none'
      }`}
      style={{ border: '0.5px solid var(--border-subtle)' }}
    >
      {/* 头部标题与关闭按钮 */}
      <header className="flex items-center justify-between px-[16px] py-[12px] border-b border-[var(--border-subtle)] shrink-0">
        <div className="flex items-baseline gap-[8px]">
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">待播清单</h2>
          <span className="text-[12px] text-[var(--text-tertiary)]">{playlist.length} 首歌曲</span>
        </div>
        <button
          type="button"
          aria-label="关闭待播清单"
          onClick={onClose}
          className="p-1 rounded-[var(--radius-sm)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)] transition-colors cursor-pointer"
        >
          <X className="w-[16px] h-[16px]" />
        </button>
      </header>

      {/* 滚动分组内容区 */}
      <div className="flex-1 overflow-y-auto p-[8px]">
        {/* 1. 正在播放 */}
        {currentTrack && (
          <section className="mb-[12px]">
            <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-[0.06em] px-[8px] mb-[4px] block">
              正在播放
            </span>
            <QueueItem
              track={currentTrack}
              isCurrent={true}
              isPlaying={isPlaying}
              onPlay={() => playAt(currentTrackIndex)}
            />
          </section>
        )}

        {/* 2. 接下来播放 */}
        <section>
          <div className="flex items-center justify-between px-[8px] mb-[4px]">
            <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-[0.06em]">
              接下来播放 {upcomingTracks.length > 0 && `(${upcomingTracks.length})`}
            </span>
            {upcomingTracks.length > 0 && (
              <button
                type="button"
                onClick={clearQueue}
                className="text-[11px] text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors cursor-pointer"
              >
                清空
              </button>
            )}
          </div>

          {upcomingTracks.length > 0 ? (
            <div className="space-y-[2px]">
              {upcomingTracks.map((track, i) => {
                const actualIndex = currentTrackIndex + 1 + i;
                return (
                  <QueueItem
                    key={`${track.id}-${actualIndex}`}
                    track={track}
                    isCurrent={false}
                    isPlaying={false}
                    onPlay={() => playAt(actualIndex)}
                    onRemove={() => removeFromQueue(actualIndex)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="py-[20px] text-center text-[12px] text-[var(--text-tertiary)]">
              队列中暂无后续歌曲
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
