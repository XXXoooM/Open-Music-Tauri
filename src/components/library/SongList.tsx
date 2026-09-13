import { useMemo } from 'react';
import { AudioLines, Play, Music, SearchX, AlertCircle } from 'lucide-react';
import { usePlayerStore } from '../../stores/playerStore';

interface SongListProps {
  searchQuery?: string;
}

function formatTime(seconds: number | undefined): string {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return '--:--';
  return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
}

export default function SongList({ searchQuery = '' }: SongListProps) {
  const playlist = usePlayerStore((s) => s.playlist);
  const currentTrackIndex = usePlayerStore((s) => s.currentTrackIndex);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playAt = usePlayerStore((s) => s.playAt);
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
        const isCurrentTrack = realIndex === currentTrackIndex;

        return (
          <button
            key={`${track.id}-${realIndex >= 0 ? realIndex : index}`}
            type="button"
            onClick={() => playAt(realIndex >= 0 ? realIndex : index)}
            className={`w-full h-[56px] flex items-center gap-[16px] px-[12px] rounded-[var(--radius-sm)] text-left cursor-pointer transition-colors duration-[var(--duration-hover)] ease-[var(--ease-apple)] hover:bg-[rgba(255,255,255,0.05)] ${
              isCurrentTrack ? 'bg-[rgba(255,255,255,0.06)]' : ''
            }`}
          >
            <span
              className="w-[24px] shrink-0 flex items-center justify-center text-[13px] tabular-nums"
              style={{ color: isCurrentTrack ? 'var(--dynamic-accent)' : 'var(--text-tertiary)' }}
            >
              {isCurrentTrack ? (
                isPlaying ? <AudioLines className="w-[14px] h-[14px]" /> : <Play className="w-[14px] h-[14px] ml-[2px] fill-current" />
              ) : (
                index + 1
              )}
            </span>

            <div className="w-[40px] h-[40px] shrink-0 rounded-[var(--radius-sm)] overflow-hidden bg-[var(--hover)]">
              {track.pic && <img src={track.pic} alt={track.name} className="w-full h-full object-cover" draggable={false} />}
            </div>

            <div className="flex-1 min-w-0 flex flex-col gap-[2px]">
              <span className="text-[14px] font-medium truncate-1" style={{ color: isCurrentTrack ? 'var(--dynamic-accent)' : 'var(--text-primary)' }}>
                {track.name}
              </span>
              <span className="text-[13px] text-[var(--text-secondary)] truncate-1">{track.artist}</span>
            </div>

            <div className="w-[180px] shrink-0 text-[13px] text-[var(--text-secondary)] truncate-1">
              {track.album ?? '—'}
            </div>

            <span className="w-[48px] shrink-0 text-right text-[13px] text-[var(--text-tertiary)] tabular-nums">
              {formatTime(track.duration)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
