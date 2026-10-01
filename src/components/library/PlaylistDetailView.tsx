import { useState, useEffect } from 'react';
import { ChevronLeft, Play, ListMusic } from 'lucide-react';
import { useLibraryStore } from '../../stores/libraryStore';
import { useNavigationStore } from '../../stores/navigationStore';
import { usePlayerStore } from '../../stores/playerStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { TOPLISTS } from '../../services/neteaseApi';
import { fetchPlaylist } from '../../services/musicApi';
import { getCachedPlaylist } from '../../services/playlistCache';
import type { Track } from '../../types';
import SongListItem from './SongListItem';

export default function PlaylistDetailView() {
  const selectedPlaylistId = useNavigationStore((s) => s.selectedPlaylistId);
  const playlistSourceView = useNavigationStore((s) => s.playlistSourceView);
  const setActiveView = useNavigationStore((s) => s.setActiveView);
  const userPlaylists = useLibraryStore((s) => s.userPlaylists);
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);
  const isFavorite = useLibraryStore((s) => s.isFavorite);
  const apiSource = useSettingsStore((s) => s.apiSource);

  const playlist = usePlayerStore((s) => s.playlist);
  const currentTrackIndex = usePlayerStore((s) => s.currentTrackIndex);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const setPlaylistAndPlay = usePlayerStore((s) => s.setPlaylistAndPlay);

  const [remoteTracks, setRemoteTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const currentTrack = playlist[currentTrackIndex];
  const userPl = userPlaylists.find((p) => p.id === selectedPlaylistId);
  const toplist = TOPLISTS.find((t) => t.id === selectedPlaylistId);

  useEffect(() => {
    if (userPl || !selectedPlaylistId) return;
    const cached = getCachedPlaylist(selectedPlaylistId);
    if (cached?.length) {
      setRemoteTracks(cached);
      return;
    }
    setIsLoading(true);
    void fetchPlaylist(selectedPlaylistId, apiSource)
      .then((tracks) => setRemoteTracks(tracks))
      .catch((e) => console.warn('[PlaylistDetailView] fetch failed:', e))
      .finally(() => setIsLoading(false));
  }, [selectedPlaylistId, userPl, apiSource]);

  const isFromBrowse = playlistSourceView === 'browse' || (!userPl && Boolean(toplist));
  const title = userPl?.name || toplist?.name || '歌单详情';
  const desc = userPl?.desc || toplist?.desc;
  const tracks = userPl ? userPl.tracks : remoteTracks;
  const cover = tracks[0]?.pic;

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto px-[32px] pb-[32px]">
      <button
        type="button"
        onClick={() => setActiveView(isFromBrowse ? 'browse' : 'playlists')}
        className="self-start flex items-center gap-[4px] mb-[16px] text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
      >
        <ChevronLeft className="w-[16px] h-[16px]" />
        <span>{isFromBrowse ? '返回浏览' : '返回我的歌单'}</span>
      </button>

      <div className="flex items-center gap-[24px] mb-[28px] shrink-0">
        <div
          className="w-[140px] h-[140px] rounded-[var(--radius-lg)] overflow-hidden shrink-0 shadow-md relative"
          style={{ background: toplist?.gradient || 'var(--hover)' }}
        >
          {cover ? (
            <img src={cover} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--text-tertiary)]">
              <ListMusic className="w-[50px] h-[50px]" />
            </div>
          )}
          {toplist && (
            <span className="absolute top-[8px] left-[8px] px-[6px] py-[1.5px] rounded-[var(--radius-sm)] text-[9px] font-bold text-white bg-black/45 backdrop-blur-md uppercase">
              {toplist.badge}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-[6px] min-w-0">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
            {toplist ? '官方榜单' : '歌单'}
          </span>
          <h2 className="text-[26px] font-bold text-[var(--text-primary)] truncate">{title}</h2>
          {desc && <p className="text-[13px] text-[var(--text-secondary)] line-clamp-2">{desc}</p>}
          <div className="flex items-center gap-[16px] mt-[6px]">
            <span className="text-[13px] text-[var(--text-tertiary)]">
              {isLoading ? '加载中...' : `共 ${tracks.length} 首歌曲`}
            </span>
            {tracks.length > 0 && !isLoading && (
              <button
                type="button"
                onClick={() => setPlaylistAndPlay(tracks, 0)}
                className="flex items-center gap-[6px] px-[18px] py-[6px] rounded-full bg-[var(--text-primary)] text-[var(--material-card)] hover:opacity-90 font-medium text-[13px] cursor-pointer"
              >
                <Play className="w-[14px] h-[14px] fill-current" />
                <span>播放全部</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-[2px]">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="w-full h-[56px] flex items-center gap-[16px] px-[12px]">
              <div className="w-[24px] h-[14px] rounded-[var(--radius-sm)] skeleton" />
              <div className="w-[40px] h-[40px] shrink-0 rounded-[var(--radius-sm)] skeleton" />
              <div className="flex-1 flex flex-col gap-[6px]">
                <div className="w-[180px] h-[14px] rounded-[var(--radius-sm)] skeleton" />
                <div className="w-[120px] h-[12px] rounded-[var(--radius-sm)] skeleton" />
              </div>
              <div className="w-[180px] h-[13px] rounded-[var(--radius-sm)] skeleton" />
              <div className="w-[36px] h-[13px] rounded-[var(--radius-sm)] skeleton" />
            </div>
          ))}
        </div>
      ) : tracks.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center gap-[12px] py-[48px] select-none">
          <span className="text-[15px] text-[var(--text-secondary)]">歌单内暂无歌曲</span>
          <span className="text-[13px] text-[var(--text-tertiary)]">请检查网络或重新刷新</span>
        </div>
      ) : (
        <div className="flex flex-col gap-[2px]">
          {tracks.map((track, idx) => (
            <SongListItem
              key={`${track.id}-${idx}`}
              track={track}
              index={idx}
              isCurrent={currentTrack ? String(currentTrack.id) === String(track.id) : false}
              isPlaying={isPlaying}
              isFavorite={isFavorite(track.id)}
              onPlay={() => setPlaylistAndPlay(tracks, idx)}
              onToggleFavorite={() => toggleFavorite(track)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
