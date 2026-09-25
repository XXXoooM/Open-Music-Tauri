import { create } from 'zustand';

export type ActiveView = 'songs' | 'browse' | 'search';

interface NavigationState {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

/**
 * 侧边栏与主工作区全局视图导航中枢
 */
export const useNavigationStore = create<NavigationState>((set) => ({
  activeView: 'songs',
  setActiveView: (activeView) => set({ activeView }),
}));
