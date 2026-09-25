import { useEffect } from 'react';
import type { Track } from '../types';
import { usePlayerStore } from '../stores/playerStore';

/**
 * MediaSession 系统媒体控制集成 Hook
 */
export function useMediaSession(track: Track | undefined, isPlaying: boolean): void {
  useEffect(() => {
    if (!track || typeof navigator === 'undefined' || !navigator.mediaSession) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.name,
      artist: track.artist,
      album: track.album ?? 'Open Music',
      artwork: track.pic ? [{ src: track.pic, sizes: '512x512', type: 'image/png' }] : [],
    });
  }, [track]);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.mediaSession) return;
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  }, [isPlaying]);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.mediaSession) return;
    const ms = navigator.mediaSession;
    ms.setActionHandler('play', () => usePlayerStore.getState().play());
    ms.setActionHandler('pause', () => usePlayerStore.getState().pause());
    ms.setActionHandler('nexttrack', () => usePlayerStore.getState().next());
    ms.setActionHandler('previoustrack', () => usePlayerStore.getState().prev());

    return () => {
      ['play', 'pause', 'nexttrack', 'previoustrack'].forEach((act) =>
        ms.setActionHandler(act as MediaSessionAction, null)
      );
    };
  }, []);
}
