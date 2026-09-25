import { create } from 'zustand';
import type { Track, LyricLine, ApiSource } from '../types';
import { useSettingsStore } from './settingsStore';
import { fetchPlaylist, getFallbackPlaylist } from '../services/musicApi';
import { storage } from '../utils/storage';

/**
 * 播放器运行时状态与动作接口
 */
interface PlayerState {
  // 音乐数据
  playlist: Track[];
  currentTrackIndex: number;
  isLoadingPlaylist: boolean;
  playlistError: string | null;

  // 播放状态
  isPlaying: boolean;
  progress: number;
  duration: number;

  // 跳转请求信号（一次性消费）
  /** 一次性 seek 请求信号；非 null 表示请求 seek 到该秒数，useAudio 消费后要清空 */
  seekRequest: number | null;

  // 静音与音量状态
  isMuted: boolean;
  previousVolume: number;

  // 歌词
  lyrics: LyricLine[];
  currentLyricIndex: number;

  // 历史记录
  playbackHistory: number[];

  // 收藏歌曲 ID 集合
  favoriteIds: string[];

  // 动作
  loadPlaylist(playlistId: string, apiSource: ApiSource): Promise<void>;
  playAt(index: number, options?: { fromHistory?: boolean }): void;
  play(): void;
  pause(): void;
  togglePlay(): void;
  next(): void;
  prev(): void;
  handleTrackEnded(): void;
  requestSeek(seconds: number): void;
  clearSeekRequest(): void;
  setProgress(progress: number): void;
  setDuration(duration: number): void;
  setLyrics(lyrics: LyricLine[]): void;
  setCurrentLyricIndex(index: number): void;
  toggleMute(): void;
  toggleFavorite(id: string): void;
  isFavorite(id: string): boolean;
  loadFavorites(): Promise<void>;
  removeFromQueue(index: number): void;
  clearQueue(): void;
  enqueueTrack(track: Track): void;
  setPlaylistAndPlay(tracks: Track[], startIndex?: number): void;
}

export const usePlayerStore = create<PlayerState>()((set, get) => ({
  playlist: [],
  currentTrackIndex: 0,
  isLoadingPlaylist: false,
  playlistError: null,

  isPlaying: false,
  progress: 0,
  duration: 0,

  seekRequest: null,

  isMuted: false,
  previousVolume: 0.7,

  lyrics: [],
  currentLyricIndex: -1,

  playbackHistory: [],

  loadPlaylist: async (playlistId: string, apiSource: ApiSource): Promise<void> => {
    set({ isLoadingPlaylist: true, playlistError: null });

    // 第 1 层尝试：请求目标歌单
    try {
      const playlist = await fetchPlaylist(playlistId, apiSource);
      // 恢复上次播放索引
      const { trackIndex } = useSettingsStore.getState();
      const safeIndex =
        trackIndex >= 0 && trackIndex < playlist.length ? trackIndex : 0;
      set({
        playlist,
        currentTrackIndex: safeIndex,
        isLoadingPlaylist: false,
        playlistError: null,
      });
      useSettingsStore.getState().setLastValidPlaylistId(playlistId);
      useSettingsStore.getState().setPlaylistId(playlistId);
      return;
    } catch (primaryErr) {
      console.warn('Primary playlist fetch failed:', primaryErr);
    }

    // 第 2 层尝试：回退到上一有效歌单
    const { lastValidPlaylistId } = useSettingsStore.getState();
    if (lastValidPlaylistId && lastValidPlaylistId !== playlistId) {
      try {
        const playlist = await fetchPlaylist(lastValidPlaylistId, apiSource);
        // 同样恢复上次播放索引
        const { trackIndex } = useSettingsStore.getState();
        const safeIndex =
          trackIndex >= 0 && trackIndex < playlist.length ? trackIndex : 0;
        set({
          playlist,
          currentTrackIndex: safeIndex,
          isLoadingPlaylist: false,
          playlistError: '当前歌单加载失败，已回退至上一有效歌单',
        });
        useSettingsStore.getState().setPlaylistId(lastValidPlaylistId);
        return;
      } catch (fallbackErr) {
        console.warn('Fallback lastValidPlaylist fetch failed:', fallbackErr);
      }
    }

    // 第 3 层尝试：完全失败时加载内置离线兜底歌单
    const fallback = getFallbackPlaylist(apiSource);
    set({
      playlist: fallback,
      currentTrackIndex: 0,
      isLoadingPlaylist: false,
      playlistError: '歌单加载失败，已使用默认歌单',
    });
  },

  playAt: (index: number, options?: { fromHistory?: boolean }): void => {
    const { playlist, currentTrackIndex, playbackHistory } = get();
    if (playlist.length === 0) return;

    let trackIndex = Math.floor(index);
    if (!Number.isFinite(trackIndex) || trackIndex < 0 || trackIndex >= playlist.length) {
      trackIndex = 0;
    }

    // 记录历史（除非是从历史回退）
    let newHistory = playbackHistory;
    if (trackIndex !== currentTrackIndex && !options?.fromHistory) {
      newHistory = [...playbackHistory, currentTrackIndex];
      if (newHistory.length > 100) {
        newHistory = newHistory.slice(-100);
      }
    }

    set({
      currentTrackIndex: trackIndex,
      playbackHistory: newHistory,
      progress: 0,
      duration: 0,
      lyrics: [],
      currentLyricIndex: -1,
      isPlaying: true,
    });

    // 写入 settingsStore 进行索引持久化
    useSettingsStore.getState().setTrackIndex(trackIndex);
  },

  play: (): void => set({ isPlaying: true }),
  pause: (): void => set({ isPlaying: false }),
  togglePlay: (): void => set((s) => ({ isPlaying: !s.isPlaying })),

  next: (): void => {
    const { playlist, currentTrackIndex } = get();
    if (playlist.length === 0) return;

    const { playMode } = useSettingsStore.getState();
    let nextIndex: number;
    if (playMode === 'shuffle') {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      nextIndex = (currentTrackIndex + 1) % playlist.length;
    }
    get().playAt(nextIndex);
  },

  prev: (): void => {
    const { playlist, currentTrackIndex, playbackHistory } = get();
    if (playlist.length === 0) return;

    let prevIndex: number;
    if (playbackHistory.length > 0) {
      prevIndex = playbackHistory[playbackHistory.length - 1];
      if (prevIndex >= playlist.length) prevIndex = 0;
      set({ playbackHistory: playbackHistory.slice(0, -1) });
      get().playAt(prevIndex, { fromHistory: true });
      return;
    }

    const { playMode } = useSettingsStore.getState();
    if (playMode === 'shuffle') {
      prevIndex = Math.floor(Math.random() * playlist.length);
    } else {
      prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    }
    get().playAt(prevIndex);
  },

  handleTrackEnded: (): void => {
    const { playMode } = useSettingsStore.getState();
    if (playMode === 'single-loop') {
      // 单曲循环：发起 seek(0) 请求，useAudio 消费后会真正 seek
      set({ isPlaying: true });
      get().requestSeek(0);
      return;
    }
    get().next();
  },

  requestSeek: (seconds: number): void => {
    const safeSec = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
    set({ seekRequest: safeSec });
  },

  clearSeekRequest: (): void => set({ seekRequest: null }),

  setProgress: (progress: number): void => set({ progress }),
  setDuration: (duration: number): void => set({ duration }),
  setLyrics: (lyrics: LyricLine[]): void => set({ lyrics }),
  setCurrentLyricIndex: (index: number): void => set({ currentLyricIndex: index }),

  toggleMute: (): void => {
    const { isMuted, previousVolume } = get();
    const settings = useSettingsStore.getState();

    if (isMuted) {
      const restored = previousVolume > 0 ? previousVolume : 0.7;
      settings.setVolume(restored);
      set({ isMuted: false, previousVolume: restored });
    } else {
      const current = settings.volume;
      set({ isMuted: true, previousVolume: current > 0 ? current : 0.7 });
      settings.setVolume(0);
    }
  },

  favoriteIds: [],

  toggleFavorite: (id: string): void => {
    if (!id) return;
    const { favoriteIds } = get();
    const exists = favoriteIds.includes(id);
    const next = exists ? favoriteIds.filter((item) => item !== id) : [...favoriteIds, id];
    set({ favoriteIds: next });
    void storage.set('favoriteIds', next);
  },

  isFavorite: (id: string): boolean => {
    return !!id && get().favoriteIds.includes(id);
  },

  loadFavorites: async (): Promise<void> => {
    try {
      const saved = await storage.get<string[]>('favoriteIds');
      if (Array.isArray(saved)) {
        set({ favoriteIds: saved });
      }
    } catch (e) {
      console.warn('Failed to load favoriteIds from storage:', e);
    }
  },

  removeFromQueue: (index: number): void => {
    const { playlist, currentTrackIndex, playAt } = get();
    if (index < 0 || index >= playlist.length) return;
    if (playlist.length <= 1) {
      set({ playlist: [], currentTrackIndex: 0, isPlaying: false, progress: 0 });
      return;
    }
    const nextPlaylist = playlist.filter((_, i) => i !== index);
    if (index < currentTrackIndex) {
      set({ playlist: nextPlaylist, currentTrackIndex: currentTrackIndex - 1 });
    } else if (index === currentTrackIndex) {
      const nextIndex = Math.min(index, nextPlaylist.length - 1);
      set({ playlist: nextPlaylist, currentTrackIndex: nextIndex });
      playAt(nextIndex);
    } else {
      set({ playlist: nextPlaylist });
    }
  },

  clearQueue: (): void => {
    const { playlist, currentTrackIndex } = get();
    if (playlist.length <= 1) return;
    const nextPlaylist = playlist.slice(0, currentTrackIndex + 1);
    set({ playlist: nextPlaylist });
  },

  enqueueTrack: (track: Track): void => {
    const { playlist } = get();
    set({ playlist: [...playlist, track] });
  },

  setPlaylistAndPlay: (tracks: Track[], startIndex = 0): void => {
    if (tracks.length === 0) return;
    const safeIndex = startIndex >= 0 && startIndex < tracks.length ? startIndex : 0;
    set({
      playlist: tracks,
      currentTrackIndex: safeIndex,
      isPlaying: true,
      progress: 0,
      seekRequest: 0,
      playlistError: null,
    });
  },
}));

// 初始化时自动拉取持久化收藏清单
void usePlayerStore.getState().loadFavorites();
