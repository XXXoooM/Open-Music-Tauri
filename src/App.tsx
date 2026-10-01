import { useEffect, useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import MainContent from './components/layout/MainContent';
import MiniPlayer from './components/layout/MiniPlayer';
import QueuePanel from './components/layout/QueuePanel';
import NowPlaying from './components/now-playing/NowPlaying';
import SettingsPanel from './components/settings/SettingsPanel';
import UpdateNotification from './components/updater/UpdateNotification';
import Toast from './components/ui/Toast';
import { useAudio } from './hooks/useAudio';
import { useDynamicColor } from './hooks/useDynamicColor';
import { useHotkeys } from './hooks/useHotkeys';
import { usePlayerStore } from './stores/playerStore';
import { useSettingsStore } from './stores/settingsStore';
import { useLibraryStore } from './stores/libraryStore';
import { useUpdaterStore } from './stores/updaterStore';

export default function App() {
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  // 1. 挂载音频引擎同步（全局一次）
  useAudio();

  // 2. 挂载音乐库持久化水合与静默检查更新
  useEffect(() => {
    void useLibraryStore.getState().loadLibrary();
    // 延迟 3 秒后台静默检查更新，不阻塞启动首屏渲染
    const timer = setTimeout(() => {
      void useUpdaterStore.getState().checkForUpdates(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // 3. 订阅当前播放曲目信息
  const currentTrack = usePlayerStore((s) => s.playlist[s.currentTrackIndex]);
  const coverUrl = currentTrack?.pic ?? '';
  const trackKey = currentTrack?.id ?? '';

  // 4. 挂载动态主题色 Hook
  useDynamicColor(coverUrl, trackKey);

  // 5. 首次歌单加载
  const isHydrated = useSettingsStore((s) => s.isHydrated);
  const playlistId = useSettingsStore((s) => s.playlistId);
  const apiSource = useSettingsStore((s) => s.apiSource);
  const loadPlaylist = usePlayerStore((s) => s.loadPlaylist);

  useEffect(() => {
    if (!isHydrated) return;
    void loadPlaylist(playlistId, apiSource);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated]);

  // 6. 挂载全局键盘快捷键
  useHotkeys({
    isNowPlayingOpen,
    isSettingsOpen,
    isQueueOpen,
    onCloseNowPlaying: () => setIsNowPlayingOpen(false),
    onCloseSettings: () => setIsSettingsOpen(false),
    onCloseQueue: () => setIsQueueOpen(false),
  });

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar onOpenSettings={() => setIsSettingsOpen(true)} />
        <MainContent />
      </div>

      <MiniPlayer
        isNowPlayingOpen={isNowPlayingOpen}
        onToggleNowPlaying={() => setIsNowPlayingOpen((prev) => !prev)}
        isQueueOpen={isQueueOpen}
        onToggleQueue={() => setIsQueueOpen((prev) => !prev)}
      />

      <QueuePanel isOpen={isQueueOpen} onClose={() => setIsQueueOpen(false)} />
      <NowPlaying isOpen={isNowPlayingOpen} onClose={() => setIsNowPlayingOpen(false)} />
      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* 右上角更新提示卡片与全局 Toast 提示 */}
      <UpdateNotification />
      <Toast />
    </div>
  );
}
