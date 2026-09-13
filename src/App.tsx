import { useEffect, useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import MainContent from './components/layout/MainContent';
import MiniPlayer from './components/layout/MiniPlayer';
import NowPlaying from './components/now-playing/NowPlaying';
import SettingsPanel from './components/settings/SettingsPanel';
import { useAudio } from './hooks/useAudio';
import { useDynamicColor } from './hooks/useDynamicColor';
import { useHotkeys } from './hooks/useHotkeys';
import { usePlayerStore } from './stores/playerStore';
import { useSettingsStore } from './stores/settingsStore';

export default function App() {
  // 全屏 NowPlaying 展开状态
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);

  // 设置面板展开状态
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 1. 挂载音频引擎同步（全局一次）
  useAudio();

  // 2. 订阅当前播放曲目信息
  const currentTrack = usePlayerStore(
    (s) => s.playlist[s.currentTrackIndex]
  );
  const coverUrl = currentTrack?.pic ?? '';
  const trackKey = currentTrack?.id ?? '';

  // 3. 挂载动态主题色 Hook（随封面变动）
  useDynamicColor(coverUrl, trackKey);

  // 4. 首次歌单加载
  const isHydrated = useSettingsStore((s) => s.isHydrated);
  const playlistId = useSettingsStore((s) => s.playlistId);
  const apiSource = useSettingsStore((s) => s.apiSource);
  const loadPlaylist = usePlayerStore((s) => s.loadPlaylist);

  useEffect(() => {
    if (!isHydrated) return;
    void loadPlaylist(playlistId, apiSource);
    // 依赖项仅为 [isHydrated]：确保仅在设置水合完成后触发一次初始歌单拉取；
    // 后续歌单 ID 变动由用户在设置界面主动操作触发，避免输入过程被频繁重载
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated]);

  // 5. 挂载全局键盘快捷键
  useHotkeys({
    isNowPlayingOpen,
    isSettingsOpen,
    onCloseNowPlaying: () => setIsNowPlayingOpen(false),
    onCloseSettings: () => setIsSettingsOpen(false),
  });

  // 6. 三段式布局骨架
  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      {/* Upper Area: Sidebar + MainContent */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar */}
        <Sidebar onOpenSettings={() => setIsSettingsOpen(true)} />

        {/* MainContent */}
        <MainContent />
      </div>

      {/* MiniPlayer */}
      <MiniPlayer onOpenNowPlaying={() => setIsNowPlayingOpen(true)} />

      {/* 全屏 NowPlaying 播放页 */}
      <NowPlaying
        isOpen={isNowPlayingOpen}
        onClose={() => setIsNowPlayingOpen(false)}
      />

      {/* 设置抽屉面板 */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
