import { useState } from 'react';
import { Music } from 'lucide-react';
import { usePlayerStore } from '../../stores/playerStore';
import type { Track } from '../../types';

interface ArtworkViewProps {
  track: Track;
}

function ArtworkView({ track }: ArtworkViewProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      data-album-art
      className="artwork-fade-in w-[min(38vh,360px)] h-[min(38vh,360px)] rounded-[var(--radius-lg)] overflow-hidden shrink-0 select-none"
      style={{
        boxShadow:
          '0 24px 72px rgba(0, 0, 0, 0.5), 0 0 120px var(--dynamic-accent)',
      }}
    >
      {!track.pic || imgError ? (
        <div className="w-full h-full flex items-center justify-center bg-[var(--hover)]">
          <Music className="w-[64px] h-[64px] text-[var(--text-tertiary)]" />
        </div>
      ) : (
        <img
          src={track.pic}
          alt={track.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
          draggable={false}
        />
      )}
    </div>
  );
}

export default function AlbumArt() {
  const track = usePlayerStore((s) => s.playlist[s.currentTrackIndex]);

  if (!track) {
    return (
      <div
        data-album-art
        className="w-[min(38vh,360px)] h-[min(38vh,360px)] rounded-[var(--radius-lg)] bg-[var(--hover)] shrink-0"
      />
    );
  }

  return <ArtworkView key={track.id} track={track} />;
}
