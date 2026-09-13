import { create } from 'zustand';
import { storage } from '../utils/storage';
import type {
  PlayMode,
  ApiSource,
  BackgroundMode,
  Theme,
  AccentSource,
  LyricFontSize,
} from '../types';

/**
 * 设置状态接口声明
 */
interface SettingsState {
  // 核心播放与歌单配置
  volume: number;
  playMode: PlayMode;
  apiSource: ApiSource;
  playlistId: string;
  lastValidPlaylistId: string;
  trackIndex: number;
  isHydrated: boolean;

  // 外观设置
  backgroundMode: BackgroundMode;
  theme: Theme;
  accentSource: AccentSource;

  // 歌词设置
  lyricFontSize: LyricFontSize;
  showWordHighlight: boolean;
  hideLyricsWhenEmpty: boolean;

  // 播放高级设置
  crossfadeEnabled: boolean;
  crossfadeDuration: number;
  gaplessPlayback: boolean;

  // 基础动作
  setVolume(vol: number): void;
  setPlayMode(mode: PlayMode): void;
  setApiSource(source: ApiSource): void;
  setPlaylistId(id: string): void;
  setLastValidPlaylistId(id: string): void;
  setTrackIndex(index: number): void;

  // 扩展动作
  setBackgroundMode(mode: BackgroundMode): void;
  setTheme(theme: Theme): void;
  setAccentSource(source: AccentSource): void;
  setLyricFontSize(size: LyricFontSize): void;
  setShowWordHighlight(show: boolean): void;
  setHideLyricsWhenEmpty(hide: boolean): void;
  setCrossfadeEnabled(enabled: boolean): void;
  setCrossfadeDuration(duration: number): void;
  setGaplessPlayback(enabled: boolean): void;

  /** 从持久化存储加载所有设置 */
  hydrate(): Promise<void>;
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  volume: 0.7,
  playMode: 'list-loop',
  apiSource: 'qijieya',
  playlistId: '17910751956',
  lastValidPlaylistId: '17910751956',
  trackIndex: 0,
  isHydrated: false,

  backgroundMode: 'gradient',
  theme: 'system',
  accentSource: 'cover',

  lyricFontSize: 'medium',
  showWordHighlight: true,
  hideLyricsWhenEmpty: false,

  crossfadeEnabled: false,
  crossfadeDuration: 0,
  gaplessPlayback: false,

  setVolume: (vol: number): void => {
    const clamped = Math.max(0, Math.min(1, Number.isFinite(vol) ? vol : 0.7));
    set({ volume: clamped });
    void storage.set('volume', clamped);
  },

  setPlayMode: (mode: PlayMode): void => {
    set({ playMode: mode });
    void storage.set('playMode', mode);
  },

  setApiSource: (source: ApiSource): void => {
    set({ apiSource: source });
    void storage.set('apiSource', source);
  },

  setPlaylistId: (id: string): void => {
    const trimmed = id.trim();
    set({ playlistId: trimmed });
    void storage.set('playlistId', trimmed);
  },

  setLastValidPlaylistId: (id: string): void => {
    const trimmed = id.trim();
    if (!trimmed) return;
    set({ lastValidPlaylistId: trimmed });
    void storage.set('lastValidPlaylistId', trimmed);
  },

  setTrackIndex: (index: number): void => {
    const safeIndex = Math.max(0, Math.floor(Number.isFinite(index) ? index : 0));
    set({ trackIndex: safeIndex });
    void storage.set('trackIndex', safeIndex);
  },

  setBackgroundMode: (mode: BackgroundMode): void => {
    set({ backgroundMode: mode });
    void storage.set('backgroundMode', mode);
  },

  setTheme: (theme: Theme): void => {
    set({ theme });
    void storage.set('theme', theme);
  },

  setAccentSource: (source: AccentSource): void => {
    set({ accentSource: source });
    void storage.set('accentSource', source);
  },

  setLyricFontSize: (size: LyricFontSize): void => {
    set({ lyricFontSize: size });
    void storage.set('lyricFontSize', size);
  },

  setShowWordHighlight: (show: boolean): void => {
    set({ showWordHighlight: show });
    void storage.set('showWordHighlight', show);
  },

  setHideLyricsWhenEmpty: (hide: boolean): void => {
    set({ hideLyricsWhenEmpty: hide });
    void storage.set('hideLyricsWhenEmpty', hide);
  },

  setCrossfadeEnabled: (enabled: boolean): void => {
    set({ crossfadeEnabled: enabled });
    void storage.set('crossfadeEnabled', enabled);
  },

  setCrossfadeDuration: (duration: number): void => {
    const clamped = Math.max(0, Math.min(12, Number.isFinite(duration) ? duration : 0));
    set({ crossfadeDuration: clamped });
    void storage.set('crossfadeDuration', clamped);
  },

  setGaplessPlayback: (enabled: boolean): void => {
    set({ gaplessPlayback: enabled });
    void storage.set('gaplessPlayback', enabled);
  },

  hydrate: async (): Promise<void> => {
    const [
      rawVolume,
      rawPlayMode,
      rawApiSource,
      rawPlaylistId,
      rawLastValidPlaylistId,
      rawTrackIndex,
      rawBackgroundMode,
      rawTheme,
      rawAccentSource,
      rawLyricFontSize,
      rawShowWordHighlight,
      rawHideLyricsWhenEmpty,
      rawCrossfadeEnabled,
      rawCrossfadeDuration,
      rawGaplessPlayback,
    ] = await Promise.all([
      storage.get<number>('volume'),
      storage.get<PlayMode>('playMode'),
      storage.get<ApiSource>('apiSource'),
      storage.get<string>('playlistId'),
      storage.get<string>('lastValidPlaylistId'),
      storage.get<number>('trackIndex'),
      storage.get<BackgroundMode>('backgroundMode'),
      storage.get<Theme>('theme'),
      storage.get<AccentSource>('accentSource'),
      storage.get<LyricFontSize>('lyricFontSize'),
      storage.get<boolean>('showWordHighlight'),
      storage.get<boolean>('hideLyricsWhenEmpty'),
      storage.get<boolean>('crossfadeEnabled'),
      storage.get<number>('crossfadeDuration'),
      storage.get<boolean>('gaplessPlayback'),
    ]);

    const volume =
      typeof rawVolume === 'number' && Number.isFinite(rawVolume) && rawVolume >= 0 && rawVolume <= 1
        ? rawVolume
        : 0.7;

    const playMode: PlayMode =
      rawPlayMode === 'list-loop' || rawPlayMode === 'single-loop' || rawPlayMode === 'shuffle'
        ? rawPlayMode
        : 'list-loop';

    const apiSource: ApiSource =
      rawApiSource === 'qijieya' || rawApiSource === 'mikus' ? rawApiSource : 'qijieya';

    const playlistId =
      typeof rawPlaylistId === 'string' && rawPlaylistId.trim().length > 0
        ? rawPlaylistId.trim()
        : '17910751956';

    const lastValidPlaylistId =
      typeof rawLastValidPlaylistId === 'string' && rawLastValidPlaylistId.trim().length > 0
        ? rawLastValidPlaylistId.trim()
        : '17910751956';

    const trackIndex =
      typeof rawTrackIndex === 'number' && Number.isInteger(rawTrackIndex) && rawTrackIndex >= 0
        ? rawTrackIndex
        : 0;

    const backgroundMode: BackgroundMode =
      rawBackgroundMode === 'gradient' ||
      rawBackgroundMode === 'fluid' ||
      rawBackgroundMode === 'solid' ||
      rawBackgroundMode === 'blur'
        ? rawBackgroundMode
        : 'gradient';

    const theme: Theme =
      rawTheme === 'system' || rawTheme === 'dark' || rawTheme === 'light'
        ? rawTheme
        : 'system';

    const accentSource: AccentSource =
      rawAccentSource === 'cover' || rawAccentSource === 'fixed'
        ? rawAccentSource
        : 'cover';

    const lyricFontSize: LyricFontSize =
      rawLyricFontSize === 'small' || rawLyricFontSize === 'medium' || rawLyricFontSize === 'large'
        ? rawLyricFontSize
        : 'medium';

    const showWordHighlight =
      typeof rawShowWordHighlight === 'boolean' ? rawShowWordHighlight : true;

    const hideLyricsWhenEmpty =
      typeof rawHideLyricsWhenEmpty === 'boolean' ? rawHideLyricsWhenEmpty : false;

    const crossfadeEnabled =
      typeof rawCrossfadeEnabled === 'boolean' ? rawCrossfadeEnabled : false;

    const crossfadeDuration =
      typeof rawCrossfadeDuration === 'number' && Number.isFinite(rawCrossfadeDuration)
        ? Math.max(0, Math.min(12, rawCrossfadeDuration))
        : 0;

    const gaplessPlayback =
      typeof rawGaplessPlayback === 'boolean' ? rawGaplessPlayback : false;

    set({
      volume,
      playMode,
      apiSource,
      playlistId,
      lastValidPlaylistId,
      trackIndex,
      backgroundMode,
      theme,
      accentSource,
      lyricFontSize,
      showWordHighlight,
      hideLyricsWhenEmpty,
      crossfadeEnabled,
      crossfadeDuration,
      gaplessPlayback,
      isHydrated: true,
    });
  },
}));
