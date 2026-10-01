import { useEffect, useRef } from 'react';
import { ListPlus, ListEnd, Heart, Copy } from 'lucide-react';
import type { Track } from '../../types';
import { usePlayerStore } from '../../stores/playerStore';
import { useLibraryStore } from '../../stores/libraryStore';
import { useToastStore } from '../../stores/toastStore';

interface SongActionMenuProps {
  track: Track;
  isOpen: boolean;
  onClose(): void;
}

/**
 * 歌曲行 Apple 风格精美气泡操作菜单
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
    useToastStore.getState().showToast('已设为下一首播放', 'success');
    onClose();
  };

  const handleEnqueue = () => {
    enqueueTrack(track);
    useToastStore.getState().showToast('已加入待播清单', 'success');
    onClose();
  };

  const handleCopy = () => {
    void navigator.clipboard.writeText(`${track.name} - ${track.artist}`);
    useToastStore.getState().showToast('已复制歌曲信息', 'success');
    onClose();
  };

  return (
    <div
      ref={menuRef}
      onClick={(e) => e.stopPropagation()}
      className="absolute right-0 top-[38px] z-50 w-[184px] p-[6px] rounded-[10px] border border-white/10 select-none text-[13.5px]"
      style={{
        background: 'rgba(30, 30, 30, 0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
      }}
    >
      <button
        type="button"
        onClick={handlePlayNext}
        className="group/item flex items-center gap-[10px] w-full px-[12px] py-[8px] rounded-[6px] text-[var(--text-primary)] hover:bg-white/10 hover:text-[var(--accent)] transition-all duration-150 cursor-pointer text-left font-normal"
      >
        <ListEnd className="w-[16px] h-[16px] text-[var(--text-secondary)] group-hover/item:text-[var(--accent)] transition-colors shrink-0" strokeWidth={2} />
        <span>下一首播放</span>
      </button>

      <button
        type="button"
        onClick={handleEnqueue}
        className="group/item flex items-center gap-[10px] w-full px-[12px] py-[8px] rounded-[6px] text-[var(--text-primary)] hover:bg-white/10 hover:text-[var(--accent)] transition-all duration-150 cursor-pointer text-left font-normal"
      >
        <ListPlus className="w-[16px] h-[16px] text-[var(--text-secondary)] group-hover/item:text-[var(--accent)] transition-colors shrink-0" strokeWidth={2} />
        <span>加入待播清单</span>
      </button>

      <button
        type="button"
        onClick={() => { toggleFavorite(track); onClose(); }}
        className="group/item flex items-center gap-[10px] w-full px-[12px] py-[8px] rounded-[6px] text-[var(--text-primary)] hover:bg-white/10 hover:text-[var(--accent)] transition-all duration-150 cursor-pointer text-left font-normal"
      >
        <Heart
          className={`w-[16px] h-[16px] shrink-0 transition-colors ${
            isFavorite ? 'text-[var(--accent)] fill-current' : 'text-[var(--text-secondary)] group-hover/item:text-[var(--accent)]'
          }`}
          strokeWidth={2}
        />
        <span>{isFavorite ? '取消收藏' : '添加到收藏'}</span>
      </button>

      <div className="h-[1px] my-[5px] mx-[6px] bg-white/10" />

      <button
        type="button"
        onClick={handleCopy}
        className="group/item flex items-center gap-[10px] w-full px-[12px] py-[8px] rounded-[6px] text-[var(--text-primary)] hover:bg-white/10 hover:text-[var(--accent)] transition-all duration-150 cursor-pointer text-left font-normal"
      >
        <Copy className="w-[16px] h-[16px] text-[var(--text-secondary)] group-hover/item:text-[var(--accent)] transition-colors shrink-0" strokeWidth={2} />
        <span>复制歌曲信息</span>
      </button>
    </div>
  );
}
