import { create } from 'zustand';

export type ActiveView =
  | 'browse'
  | 'search'
  | 'favorites'
  | 'recent'
  | 'playlists'
  | 'playlist-detail'
  | 'songs';

export type PlaylistSourceView = 'browse' | 'playlists';

interface NavigationState {
  activeView: ActiveView;
  selectedPlaylistId: string | null;
  playlistSourceView: PlaylistSourceView;
  globalSearchQuery: string;
  setActiveView: (view: ActiveView) => void;
  setSelectedPlaylistId: (id: string | null, source?: PlaylistSourceView) => void;
  setGlobalSearchQuery: (query: string) => void;
}

/**
 * 侧边栏与主工作区全局视图导航中枢
 */
export const useNavigationStore = create<NavigationState>((set) => ({
  activeView: 'browse',
  selectedPlaylistId: null,
  playlistSourceView: 'playlists',
  globalSearchQuery: '',
  setActiveView: (activeView) => set({ activeView }),
  setSelectedPlaylistId: (selectedPlaylistId, source = 'playlists') =>
    set({ selectedPlaylistId, playlistSourceView: source }),
  setGlobalSearchQuery: (globalSearchQuery) => set({ globalSearchQuery }),
}));
