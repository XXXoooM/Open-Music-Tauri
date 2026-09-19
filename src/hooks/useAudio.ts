import { useEffect } from 'react';
import { getPlayer } from '../services/player';
import { fetchLyrics } from '../services/lyricsApi';
import { usePlayerStore } from '../stores/playerStore';
import { useSettingsStore } from '../stores/settingsStore';

/**
 * 音频核心驱动 Hook
 * 在应用顶层（App.tsx）调用一次，负责：
 * 1. 引擎 → Store 事件订阅（方向 1）
 * 2. Store → 引擎 意图驱动（方向 2）
 * 3. 消费 seekRequest 信号
 * 4. 音量同步与歌词切歌拉取
 * 5. MediaSession 系统媒体控制集成
 */
export function useAudio(): void {
  const playlist = usePlayerStore((s) => s.playlist);
  const currentTrackIndex = usePlayerStore((s) => s.currentTrackIndex);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const seekRequest = usePlayerStore((s) => s.seekRequest);
  const volume = useSettingsStore((s) => s.volume);

  // 切歌时加载歌词（根据曲目 ID 变化触发）
  const currentTrackId = usePlayerStore(
    (s) => s.playlist[s.currentTrackIndex]?.id
  );

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

  // 方向 1：引擎 → Store（副作用订阅，挂载时注册）
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

    // 单曲循环场景：音频 ended 后 seek(0) 重新拉起播放
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

  // MediaSession：同步元数据
  useEffect(() => {
    const track = playlist[currentTrackIndex];
    if (!track || typeof navigator === 'undefined' || !navigator.mediaSession) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.name,
      artist: track.artist,
      album: track.album ?? 'Open Music',
      artwork: track.pic ? [{ src: track.pic, sizes: '512x512', type: 'image/png' }] : [],
    });
  }, [playlist, currentTrackIndex]);

  // MediaSession：同步播放状态与控制
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
