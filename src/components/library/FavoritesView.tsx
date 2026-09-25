import { Heart, Play } from 'lucide-react';
import { useLibraryStore } from '../../stores/libraryStore';
import { usePlayerStore } from '../../stores/playerStore';
import SongListItem from './SongListItem';

export default function FavoritesView() {
  const favoriteTracks = useLibraryStore((s) => s.favoriteTracks);
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);
  const isFavorite = useLibraryStore((s) => s.isFavorite);

  const playlist = usePlayerStore((s) => s.playlist);
  const currentTrackIndex = usePlayerStore((s) => s.currentTrackIndex);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const setPlaylistAndPlay = usePlayerStore((s) => s.setPlaylistAndPlay);

  const currentTrack = playlist[currentTrackIndex];

  if (favoriteTracks.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-[16px] select-none py-[64px]">
        <Heart className="w-[64px] h-[64px] text-[var(--text-tertiary)]" />
        <span className="text-[16px] text-[var(--text-secondary)]">暂无收藏歌曲</span>
        <span className="text-[13px] text-[var(--text-tertiary)]">点击歌曲列表中的爱心按钮即可收藏</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto px-[32px] pb-[32px]">
      <div className="flex items-center justify-between mb-[16px] shrink-0">
        <span className="text-[13px] text-[var(--text-tertiary)]">
          共 {favoriteTracks.length} 首歌曲
        </span>
        <button
          type="button"
          onClick={() => setPlaylistAndPlay(favoriteTracks, 0)}
          className="flex items-center gap-[6px] px-[16px] py-[7px] rounded-full bg-[var(--text-primary)] text-[var(--material-card)] hover:opacity-90 transition-opacity font-medium text-[13px] cursor-pointer"
        >
          <Play className="w-[14px] h-[14px] fill-current" />
          <span>播放全部</span>
        </button>
      </div>

      <div className="flex flex-col gap-[2px]">
        {favoriteTracks.map((track, idx) => (
          <SongListItem
            key={`${track.id}-${idx}`}
            track={track}
            index={idx}
            isCurrent={currentTrack ? String(currentTrack.id) === String(track.id) : false}
            isPlaying={isPlaying}
            isFavorite={isFavorite(track.id)}
            onPlay={() => setPlaylistAndPlay(favoriteTracks, idx)}
            onToggleFavorite={() => toggleFavorite(track)}
          />
        ))}
      </div>
    </div>
  );
}
