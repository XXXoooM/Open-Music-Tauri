import { useEffect } from 'react';
import { getPlayer } from '../services/player';
import { fetchLyrics, prefetchLyrics } from '../services/lyricsApi';
import { usePlayerStore } from '../stores/playerStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useMediaSession } from './useMediaSession';

/**
 * 音频核心驱动 Hook
 * 在应用顶层（App.tsx）调用一次，负责引擎与 Store 双向同步、歌词切歌拉取与下一首预取
 */
export function useAudio(): void {
  const playlist = usePlayerStore((s) => s.playlist);
  const currentTrackIndex = usePlayerStore((s) => s.currentTrackIndex);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const seekRequest = usePlayerStore((s) => s.seekRequest);
  const progress = usePlayerStore((s) => s.progress);
  const playMode = useSettingsStore((s) => s.playMode);
  const volume = useSettingsStore((s) => s.volume);

  const currentTrackId = usePlayerStore((s) => s.playlist[s.currentTrackIndex]?.id);

  // 切歌时加载歌词
  useEffect(() => {
    if (!currentTrackId) {
      usePlayerStore.getState().setLyrics([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      const lines = await fetchLyrics(currentTrackId);
      if (cancelled) return;
      usePlayerStore.getState().setLyrics(lines);
    })();
    return () => {
      cancelled = true;
    };
  }, [currentTrackId]);

  // 播放超 15 秒且非单曲循环时，静默预取下一首歌词与音频流
  const isPastPrefetchThreshold = progress > 15;
  useEffect(() => {
    if (isPastPrefetchThreshold && playlist.length > 1 && playMode !== 'single-loop') {
      const nextIndex = (currentTrackIndex + 1) % playlist.length;
      const nextTrack = playlist[nextIndex];
      if (nextTrack?.id) void prefetchLyrics(nextTrack.id);
      if (nextTrack?.url) getPlayer().preload(nextTrack.url);
    }
  }, [isPastPrefetchThreshold, currentTrackIndex, playlist, playMode]);

  // 方向 1：引擎 → Store 事件订阅
  useEffect(() => {
    const player = getPlayer();
    const onTime = (d: { currentTime: number }) => usePlayerStore.getState().setProgress(d.currentTime);
    const onDuration = (d: { duration: number }) => usePlayerStore.getState().setDuration(d.duration);
    const onEnded = () => usePlayerStore.getState().handleTrackEnded();
    const onError = (err: unknown) => {
      console.error('Audio playback error:', err);
      setTimeout(() => usePlayerStore.getState().next(), 2000);
    };

    player.on('timeupdate', onTime);
    player.on('durationchange', onDuration);
    player.on('ended', onEnded);
    player.on('error', onError);

    return () => {
      player.off('timeupdate', onTime);
      player.off('durationchange', onDuration);
      player.off('ended', onEnded);
      player.off('error', onError);
    };
  }, []);

  // 方向 2：Store → 引擎（播放/切歌意图驱动）
  const currentTrackUrl = playlist[currentTrackIndex]?.url ?? null;
  useEffect(() => {
    const player = getPlayer();
    if (isPlaying) {
      const result = player.play(currentTrackUrl);
      if (result && typeof result.catch === 'function') {
        result.catch((e: unknown) => {
          console.warn('Play blocked by browser autoplay policy:', e);
          usePlayerStore.getState().pause();
        });
      }
    } else {
      player.pause();
    }
  }, [currentTrackUrl, isPlaying]);

  // 方向 2：Store → 引擎（一次性 seek 信号消费）
  useEffect(() => {
    if (seekRequest === null) return;
    const player = getPlayer();
    player.seek(seekRequest);

    const state = usePlayerStore.getState();
    if (state.isPlaying && !player.isPlaying()) {
      const track = state.playlist[state.currentTrackIndex];
      const result = player.play(track?.url ?? null);
      if (result && typeof result.catch === 'function') {
        result.catch((e: unknown) => console.warn('Replay after seek blocked:', e));
      }
    }
    usePlayerStore.getState().clearSeekRequest();
  }, [seekRequest]);

  // 音量同步：SettingsStore → 引擎
  useEffect(() => {
    getPlayer().setVolume(volume);
  }, [volume]);

  // MediaSession 媒体控制集成
  useMediaSession(playlist[currentTrackIndex], isPlaying);
}
