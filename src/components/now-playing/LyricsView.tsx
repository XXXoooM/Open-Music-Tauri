import { useMemo } from 'react';
import { LyricPlayer } from '@applemusic-like-lyrics/react';
import type { LyricLine as AmllLyricLine } from '@applemusic-like-lyrics/core';
import '@applemusic-like-lyrics/core/style.css';
import { usePlayerStore } from '../../stores/playerStore';

export default function LyricsView() {
  const lyrics = usePlayerStore((s) => s.lyrics);
  const progress = usePlayerStore((s) => s.progress);

  const amllLyricLines = useMemo(
    () =>
      lyrics
        .map((l) => l._amllRaw as AmllLyricLine | undefined)
        .filter((l): l is AmllLyricLine => l != null),
    [lyrics]
  );

  if (lyrics.length === 0 || amllLyricLines.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center select-none">
        <span className="text-[18px] text-[var(--text-tertiary)]">
          纯音乐，请欣赏
        </span>
      </div>
    );
  }

  const currentTimeMs = Math.floor(progress * 1000);

  return (
    <div
      className="w-full overflow-hidden select-none"
      style={{ height: '100%' }} // ← 关键：不依赖 h-full，直接给 100%
    >
      <LyricPlayer
        lyricLines={amllLyricLines}
        currentTime={currentTimeMs}
        style={{ width: '100%', height: '100%' }} // ← 关键：显式给 AMLL 高度
      />
    </div>
  );
}

