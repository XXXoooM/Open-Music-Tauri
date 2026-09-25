import { useEffect, useRef } from 'react';
import { ListPlus, ListEnd, Heart, Copy } from 'lucide-react';
import type { Track } from '../../types';
import { usePlayerStore } from '../../stores/playerStore';
import { useLibraryStore } from '../../stores/libraryStore';

interface SongActionMenuProps {
  track: Track;
  isOpen: boolean;
  onClose(): void;
}

/**
 * 歌曲行 Apple 风格气泡操作菜单
 */
export default function SongActionMenu({ track, isOpen, onClose }: SongActionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const enqueueTrack = usePlayerStore((s) => s.enqueueTrack);
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);
  const isFavorite = useLibraryStore((s) => s.isFavorite(track.id));

  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener('mousedown', handleOutside);
    return () => window.removeEventListener('mousedown', handleOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePlayNext = () => {
    const { playlist, currentTrackIndex } = usePlayerStore.getState();
    const nextList = [...playlist];
    nextList.splice(currentTrackIndex + 1, 0, track);
    usePlayerStore.setState({ playlist: nextList });
    onClose();
  };

  const handleEnqueue = () => {
    enqueueTrack(track);
    onClose();
  };

  const handleCopy = () => {
    void navigator.clipboard.writeText(`${track.name} - ${track.artist}`);
    onClose();
  };

  return (
    <div
      ref={menuRef}
      onClick={(e) => e.stopPropagation()}
      className="absolute right-0 top-[40px] z-50 w-[170px] py-[4px] rounded-[var(--radius-md)] border border-[var(--border)] shadow-[var(--shadow-panel)] text-[13px] text-[var(--text-primary)]"
      style={{
        background: 'var(--material-card)',
        backdropFilter: 'blur(var(--blur-panel))',
        WebkitBackdropFilter: 'blur(var(--blur-panel))',
      }}
    >
      <button
        type="button"
        onClick={handlePlayNext}
        className="flex items-center gap-[10px] w-full px-[12px] py-[8px] hover:bg-[var(--hover)] transition-colors cursor-pointer text-left"
      >
        <ListEnd className="w-[15px] h-[15px] text-[var(--text-secondary)]" />
        <span>下一首播放</span>
      </button>
      <button
        type="button"
        onClick={handleEnqueue}
        className="flex items-center gap-[10px] w-full px-[12px] py-[8px] hover:bg-[var(--hover)] transition-colors cursor-pointer text-left"
      >
        <ListPlus className="w-[15px] h-[15px] text-[var(--text-secondary)]" />
        <span>加入待播清单</span>
      </button>
      <button
        type="button"
        onClick={() => { toggleFavorite(track); onClose(); }}
        className="flex items-center gap-[10px] w-full px-[12px] py-[8px] hover:bg-[var(--hover)] transition-colors cursor-pointer text-left"
      >
        <Heart className={`w-[15px] h-[15px] ${isFavorite ? 'text-[var(--accent)] fill-current' : 'text-[var(--text-secondary)]'}`} />
        <span>{isFavorite ? '取消收藏' : '添加到收藏'}</span>
      </button>
      <div className="h-[1px] my-[4px] bg-[var(--border)]" />
      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center gap-[10px] w-full px-[12px] py-[8px] hover:bg-[var(--hover)] transition-colors cursor-pointer text-left"
      >
        <Copy className="w-[15px] h-[15px] text-[var(--text-secondary)]" />
        <span>复制歌曲信息</span>
      </button>
    </div>
  );
}
