import { useMemo } from 'react';
import { Music, SearchX, AlertCircle } from 'lucide-react';
import { usePlayerStore } from '../../stores/playerStore';
import { useLibraryStore } from '../../stores/libraryStore';
import SongListItem from './SongListItem';

interface SongListProps {
  searchQuery?: string;
}

export default function SongList({ searchQuery = '' }: SongListProps) {
  const playlist = usePlayerStore((s) => s.playlist);
  const currentTrackIndex = usePlayerStore((s) => s.currentTrackIndex);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playAt = usePlayerStore((s) => s.playAt);
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);
  const isFavorite = useLibraryStore((s) => s.isFavorite);
  const isLoadingPlaylist = usePlayerStore((s) => s.isLoadingPlaylist);
  const playlistError = usePlayerStore((s) => s.playlistError);

  const filteredPlaylist = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return playlist;
    return playlist.filter(
      (track) =>
        track.name.toLowerCase().includes(q) ||
        track.artist.toLowerCase().includes(q) ||
        (track.album?.toLowerCase().includes(q) ?? false)
    );
  }, [playlist, searchQuery]);

  if (isLoadingPlaylist) {
    return (
      <div className="flex flex-col gap-[2px] pb-[24px]">
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
    );
  }

  if (playlistError && playlist.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center gap-[16px] select-none py-[64px]">
        <AlertCircle className="w-[64px] h-[64px] text-[var(--accent)]" />
        <span className="text-[16px] text-[var(--text-secondary)]">{playlistError}</span>
        <span className="text-[13px] text-[var(--text-tertiary)]">请检查网络或歌单配置</span>
      </div>
    );
  }

  if (playlist.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-[16px] select-none py-[64px]">
        <Music className="w-[64px] h-[64px] text-[var(--text-tertiary)]" />
        <span className="text-[16px] text-[var(--text-secondary)]">音乐库为空</span>
        <span className="text-[13px] text-[var(--text-tertiary)]">请检查歌单配置或网络</span>
      </div>
    );
  }

  if (filteredPlaylist.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center gap-[16px] select-none py-[64px]">
        <SearchX className="w-[64px] h-[64px] text-[var(--text-tertiary)]" />
        <span className="text-[16px] text-[var(--text-secondary)]">没有找到匹配的歌曲</span>
        <span className="text-[13px] text-[var(--text-tertiary)]">试试其他关键词</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[2px] pb-[24px]">
      {filteredPlaylist.map((track, index) => {
        const realIndex = playlist.indexOf(track);
        const isCurrent = playlist[currentTrackIndex]
          ? String(playlist[currentTrackIndex]?.id) === String(track.id)
          : false;
        const targetIndex = realIndex >= 0 ? realIndex : index;

        return (
          <SongListItem
            key={`${track.id}-${targetIndex}`}
            track={track}
            index={index}
            isCurrent={isCurrent}
            isPlaying={isPlaying}
            isFavorite={isFavorite(track.id)}
            onPlay={() => playAt(targetIndex)}
            onToggleFavorite={() => toggleFavorite(track)}
          />
        );
      })}
    </div>
  );
}
