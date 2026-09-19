import { useEffect } from 'react';
import { usePlayerStore } from '../stores/playerStore';
import { useSettingsStore } from '../stores/settingsStore';

interface UseHotkeysOptions {
  /** 当前是否有 UI 面板打开（用于 Esc 的处理优先级） */
  isNowPlayingOpen: boolean;
  isSettingsOpen: boolean;
  isQueueOpen?: boolean;
  onCloseNowPlaying(): void;
  onCloseSettings(): void;
  onCloseQueue?(): void;
}

/**
 * 全局键盘快捷键 Hook
 * 处理播放控制、音量调节、循环模式与浮层关闭
 */
export function useHotkeys(options: UseHotkeysOptions): void {
  const { isNowPlayingOpen, isSettingsOpen, isQueueOpen, onCloseNowPlaying, onCloseSettings, onCloseQueue } = options;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 规则 1：输入框聚焦时不触发
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      // 规则 2：带修饰键时不触发
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      // 规则 3：Esc 优先关闭最上层 UI
      if (e.code === 'Escape') {
        if (isQueueOpen && onCloseQueue) {
          e.preventDefault();
          onCloseQueue();
          return;
        }
        if (isNowPlayingOpen) {
          e.preventDefault();
          onCloseNowPlaying();
          return;
        }
        if (isSettingsOpen) {
          e.preventDefault();
          onCloseSettings();
          return;
        }
        return;
      }

      // 从 store 读实时数据
      const player = usePlayerStore.getState();
      const settings = useSettingsStore.getState();

      // 无歌单时不响应播放控制类快捷键
      const hasPlaylist = player.playlist.length > 0;

      switch (e.code) {
        case 'Space': {
          if (!hasPlaylist) return;
          e.preventDefault();
          player.togglePlay();
          break;
        }

        case 'ArrowRight': {
          if (!hasPlaylist) return;
          e.preventDefault();
          const duration = player.duration || 0;
          const next = Math.min(duration, player.progress + 5);
          player.requestSeek(next);
          break;
        }

        case 'ArrowLeft': {
          if (!hasPlaylist) return;
          e.preventDefault();
          const prev = Math.max(0, player.progress - 5);
          player.requestSeek(prev);
          break;
        }

        case 'ArrowUp': {
          e.preventDefault();
          const up = Math.min(1, settings.volume + 0.05);
          settings.setVolume(up);
          break;
        }

        case 'ArrowDown': {
          e.preventDefault();
          const down = Math.max(0, settings.volume - 0.05);
          settings.setVolume(down);
          break;
        }

        case 'KeyM': {
          e.preventDefault();
          player.toggleMute();
          break;
        }

        case 'KeyL': {
          e.preventDefault();
          const mode = settings.playMode;
          // list-loop ↔ single-loop
          const next = mode === 'single-loop' ? 'list-loop' : 'single-loop';
          settings.setPlayMode(next);
          break;
        }

        case 'KeyS': {
          e.preventDefault();
          const mode = settings.playMode;
          // shuffle ↔ list-loop
          const next = mode === 'shuffle' ? 'list-loop' : 'shuffle';
          settings.setPlayMode(next);
          break;
        }

        case 'KeyF': {
          if (!hasPlaylist) return;
          e.preventDefault();
          const track = player.playlist[player.currentTrackIndex];
          if (track?.id) {
            player.toggleFavorite(track.id);
          }
          break;
        }

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNowPlayingOpen, isSettingsOpen, isQueueOpen, onCloseNowPlaying, onCloseSettings, onCloseQueue]);
}
