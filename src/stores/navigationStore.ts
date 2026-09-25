import { create } from 'zustand';

export type ActiveView =
  | 'browse'
  | 'search'
  | 'favorites'
  | 'recent'
  | 'playlists'
  | 'playlist-detail'
  | 'songs';

interface NavigationState {
  activeView: ActiveView;
  selectedPlaylistId: string | null;
  globalSearchQuery: string;
  setActiveView: (view: ActiveView) => void;
  setSelectedPlaylistId: (id: string | null) => void;
  setGlobalSearchQuery: (query: string) => void;
}

/**
 * 侧边栏与主工作区全局视图导航中枢
 */
export const useNavigationStore = create<NavigationState>((set) => ({
  activeView: 'browse',
  selectedPlaylistId: null,
  globalSearchQuery: '',
  setActiveView: (activeView) => set({ activeView }),
  setSelectedPlaylistId: (selectedPlaylistId) => set({ selectedPlaylistId }),
  setGlobalSearchQuery: (globalSearchQuery) => set({ globalSearchQuery }),
}));
