import { Clock, Play, Trash2 } from 'lucide-react';
import { useLibraryStore } from '../../stores/libraryStore';
import { usePlayerStore } from '../../stores/playerStore';
import SongListItem from './SongListItem';

export default function RecentView() {
  const recentTracks = useLibraryStore((s) => s.recentTracks);
  const clearRecentTracks = useLibraryStore((s) => s.clearRecentTracks);
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);
  const isFavorite = useLibraryStore((s) => s.isFavorite);

  const playlist = usePlayerStore((s) => s.playlist);
  const currentTrackIndex = usePlayerStore((s) => s.currentTrackIndex);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const setPlaylistAndPlay = usePlayerStore((s) => s.setPlaylistAndPlay);

  const currentTrack = playlist[currentTrackIndex];

  if (recentTracks.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-[16px] select-none py-[64px]">
        <Clock className="w-[64px] h-[64px] text-[var(--text-tertiary)]" />
        <span className="text-[16px] text-[var(--text-secondary)]">暂无最近播放</span>
        <span className="text-[13px] text-[var(--text-tertiary)]">
          播放过的歌曲将自动记录在这里（最多保留 200 首）
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto px-[32px] pb-[32px]">
      <div className="flex items-center justify-between mb-[16px] shrink-0">
        <span className="text-[13px] text-[var(--text-tertiary)]">
          共 {recentTracks.length} 首歌曲（上限 200 首）
        </span>
        <div className="flex items-center gap-[10px]">
          <button
            type="button"
            onClick={clearRecentTracks}
            className="flex items-center gap-[6px] px-[12px] py-[6px] rounded-full text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)] transition-colors cursor-pointer"
          >
            <Trash2 className="w-[14px] h-[14px]" />
            <span>清空记录</span>
          </button>
          <button
            type="button"
            onClick={() => setPlaylistAndPlay(recentTracks, 0)}
            className="flex items-center gap-[6px] px-[16px] py-[7px] rounded-full bg-[var(--text-primary)] text-[var(--material-card)] hover:opacity-90 transition-opacity font-medium text-[13px] cursor-pointer"
          >
            <Play className="w-[14px] h-[14px] fill-current" />
            <span>播放全部</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-[2px]">
        {recentTracks.map((track, idx) => (
          <SongListItem
            key={`${track.id}-${idx}`}
            track={track}
            index={idx}
            isCurrent={currentTrack ? String(currentTrack.id) === String(track.id) : false}
            isPlaying={isPlaying}
            isFavorite={isFavorite(track.id)}
            onPlay={() => setPlaylistAndPlay(recentTracks, idx)}
            onToggleFavorite={() => toggleFavorite(track)}
          />
        ))}
      </div>
    </div>
  );
}
