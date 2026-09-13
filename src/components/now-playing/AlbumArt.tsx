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
    <div className="relative shrink-0 select-none">
      {/* 真实封面镜像光晕（高饱和环境漫反射，零生硬黑阴影） */}
      {track.pic && !imgError && (
        <div
          className="absolute inset-0 rounded-[14px] pointer-events-none transition-all duration-700"
          style={{
            backgroundImage: `url(${track.pic})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'saturate(1.5) brightness(1.1) blur(24px)',
            opacity: 0.7,
            transform: 'translateY(4%) scale(0.96)',
          }}
        />
      )}

      {/* 封面主体 */}
      <div
        data-album-art
        className="artwork-fade-in relative w-[clamp(190px,28vh,270px)] h-[clamp(190px,28vh,270px)] rounded-[14px] overflow-hidden shrink-0"
      >
        {!track.pic || imgError ? (
          <div className="w-full h-full flex items-center justify-center bg-[var(--hover)]">
            <Music className="w-[48px] h-[48px] text-[var(--text-tertiary)]" />
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
    </div>
  );
}

export default function AlbumArt() {
  const track = usePlayerStore((s) => s.playlist[s.currentTrackIndex]);

  if (!track) {
    return (
      <div
        data-album-art
        className="w-[clamp(190px,28vh,270px)] h-[clamp(190px,28vh,270px)] rounded-[14px] bg-[var(--hover)] shrink-0"
      />
    );
  }

  return <ArtworkView key={track.id} track={track} />;
}
