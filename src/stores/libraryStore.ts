import { create } from 'zustand';
import type { Track } from '../types';
import { storage } from '../utils/storage';
import { usePlayerStore } from './playerStore';

export const MAX_RECENT_TRACKS = 200;

export interface UserPlaylist {
  id: string;
  name: string;
  desc?: string;
  tracks: Track[];
  createdAt: number;
}

interface LibraryState {
  favoriteTracks: Track[];
  recentTracks: Track[];
  userPlaylists: UserPlaylist[];

  toggleFavorite: (track: Track) => void;
  isFavorite: (trackId: string) => boolean;
  addRecentTrack: (track: Track) => void;
  clearRecentTracks: () => void;
  createPlaylist: (name: string, desc?: string) => UserPlaylist;
  importPlaylist: (name: string, tracks: Track[], desc?: string) => UserPlaylist;
  deletePlaylist: (playlistId: string) => void;
  addTrackToPlaylist: (playlistId: string, track: Track) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  loadLibrary: () => Promise<void>;
}

export const useLibraryStore = create<LibraryState>()((set, get) => ({
  favoriteTracks: [],
  recentTracks: [],
  userPlaylists: [],

  isFavorite: (trackId: string): boolean => {
    return get().favoriteTracks.some((t) => t.id === trackId);
  },

  toggleFavorite: (track: Track): void => {
    if (!track?.id) return;
    const { favoriteTracks } = get();
    const exists = favoriteTracks.some((t) => t.id === track.id);
    const next = exists
      ? favoriteTracks.filter((t) => t.id !== track.id)
      : [track, ...favoriteTracks];

    set({ favoriteTracks: next });
    usePlayerStore.setState({ favoriteIds: next.map((t) => t.id) });
    void storage.set('favoriteTracks', next);
    void storage.set('favoriteIds', next.map((t) => t.id));
  },

  addRecentTrack: (track: Track): void => {
    if (!track?.id) return;
    const { recentTracks } = get();
    const filtered = recentTracks.filter((t) => t.id !== track.id);
    const next = [track, ...filtered].slice(0, MAX_RECENT_TRACKS);
    set({ recentTracks: next });
    void storage.set('recentTracks', next);
  },

  clearRecentTracks: (): void => {
    set({ recentTracks: [] });
    void storage.set('recentTracks', []);
  },

  createPlaylist: (name: string, desc?: string): UserPlaylist => {
    const newPl: UserPlaylist = {
      id: `pl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim() || '新建歌单',
      desc: desc?.trim(),
      tracks: [],
      createdAt: Date.now(),
    };
    const next = [newPl, ...get().userPlaylists];
    set({ userPlaylists: next });
    void storage.set('userPlaylists', next);
    return newPl;
  },

  importPlaylist: (name: string, tracks: Track[], desc?: string): UserPlaylist => {
    const newPl: UserPlaylist = {
      id: `pl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim() || '导入歌单',
      desc: desc?.trim(),
      tracks,
      createdAt: Date.now(),
    };
    const next = [newPl, ...get().userPlaylists];
    set({ userPlaylists: next });
    void storage.set('userPlaylists', next);
    return newPl;
  },

  deletePlaylist: (playlistId: string): void => {
    const next = get().userPlaylists.filter((p) => p.id !== playlistId);
    set({ userPlaylists: next });
    void storage.set('userPlaylists', next);
  },

  addTrackToPlaylist: (playlistId: string, track: Track): void => {
    const next = get().userPlaylists.map((p) => {
      if (p.id !== playlistId) return p;
      if (p.tracks.some((t) => t.id === track.id)) return p;
      return { ...p, tracks: [...p.tracks, track] };
    });
    set({ userPlaylists: next });
    void storage.set('userPlaylists', next);
  },

  removeTrackFromPlaylist: (playlistId: string, trackId: string): void => {
    const next = get().userPlaylists.map((p) => {
      if (p.id !== playlistId) return p;
      return { ...p, tracks: p.tracks.filter((t) => t.id !== trackId) };
    });
    set({ userPlaylists: next });
    void storage.set('userPlaylists', next);
  },

  loadLibrary: async (): Promise<void> => {
    try {
      const [favs, recents, pls] = await Promise.all([
        storage.get<Track[]>('favoriteTracks'),
        storage.get<Track[]>('recentTracks'),
        storage.get<UserPlaylist[]>('userPlaylists'),
      ]);
      if (Array.isArray(favs)) {
        set({ favoriteTracks: favs });
        usePlayerStore.setState({ favoriteIds: favs.map((t) => t.id) });
      }
      if (Array.isArray(recents)) {
        set({ recentTracks: recents.slice(0, MAX_RECENT_TRACKS) });
      }
      if (Array.isArray(pls)) {
        set({ userPlaylists: pls });
      }
    } catch (e) {
      console.warn('[libraryStore] Failed to load library data:', e);
    }
  },
}));
