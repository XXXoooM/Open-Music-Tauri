import { ChevronLeft, Play, ListMusic } from 'lucide-react';
import { useLibraryStore } from '../../stores/libraryStore';
import { useNavigationStore } from '../../stores/navigationStore';
import { usePlayerStore } from '../../stores/playerStore';
import SongListItem from './SongListItem';

export default function PlaylistDetailView() {
  const selectedPlaylistId = useNavigationStore((s) => s.selectedPlaylistId);
  const setActiveView = useNavigationStore((s) => s.setActiveView);
  const userPlaylists = useLibraryStore((s) => s.userPlaylists);
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);
  const isFavorite = useLibraryStore((s) => s.isFavorite);

  const playlist = usePlayerStore((s) => s.playlist);
  const currentTrackIndex = usePlayerStore((s) => s.currentTrackIndex);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const setPlaylistAndPlay = usePlayerStore((s) => s.setPlaylistAndPlay);

  const currentTrack = playlist[currentTrackIndex];
  const currentPl = userPlaylists.find((p) => p.id === selectedPlaylistId);

  if (!currentPl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-[12px] py-[64px]">
        <span className="text-[15px] text-[var(--text-secondary)]">未找到歌单</span>
        <button
          type="button"
          onClick={() => setActiveView('playlists')}
          className="text-[13px] text-[var(--dynamic-accent)] hover:underline cursor-pointer"
        >
          返回我的歌单
        </button>
      </div>
    );
  }

  const cover = currentPl.tracks[0]?.pic;

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto px-[32px] pb-[32px]">
      <button
        type="button"
        onClick={() => setActiveView('playlists')}
        className="self-start flex items-center gap-[4px] mb-[16px] text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
      >
        <ChevronLeft className="w-[16px] h-[16px]" />
        <span>返回我的歌单</span>
      </button>

      <div className="flex items-center gap-[24px] mb-[28px] shrink-0">
        <div className="w-[140px] h-[140px] rounded-[var(--radius-lg)] overflow-hidden shrink-0 bg-[var(--hover)] shadow-md">
          {cover ? (
            <img src={cover} alt={currentPl.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--text-tertiary)]">
              <ListMusic className="w-[50px] h-[50px]" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-[6px] min-w-0">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">歌单</span>
          <h2 className="text-[26px] font-bold text-[var(--text-primary)] truncate">{currentPl.name}</h2>
          {currentPl.desc && <p className="text-[13px] text-[var(--text-secondary)] line-clamp-2">{currentPl.desc}</p>}
          <div className="flex items-center gap-[16px] mt-[6px]">
            <span className="text-[13px] text-[var(--text-tertiary)]">{currentPl.tracks.length} 首歌曲</span>
            {currentPl.tracks.length > 0 && (
              <button
                type="button"
                onClick={() => setPlaylistAndPlay(currentPl.tracks, 0)}
                className="flex items-center gap-[6px] px-[18px] py-[6px] rounded-full bg-[var(--text-primary)] text-[var(--material-card)] hover:opacity-90 font-medium text-[13px] cursor-pointer"
              >
                <Play className="w-[14px] h-[14px] fill-current" />
                <span>播放全部</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {currentPl.tracks.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center gap-[12px] py-[48px] select-none">
          <span className="text-[15px] text-[var(--text-secondary)]">歌单内暂无歌曲</span>
          <span className="text-[13px] text-[var(--text-tertiary)]">在浏览或搜索时可添加歌曲至此歌单</span>
        </div>
      ) : (
        <div className="flex flex-col gap-[2px]">
          {currentPl.tracks.map((track, idx) => (
            <SongListItem
              key={`${track.id}-${idx}`}
              track={track}
              index={idx}
              isCurrent={currentTrack ? String(currentTrack.id) === String(track.id) : false}
              isPlaying={isPlaying}
              isFavorite={isFavorite(track.id)}
              onPlay={() => setPlaylistAndPlay(currentPl.tracks, idx)}
              onToggleFavorite={() => toggleFavorite(track)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
