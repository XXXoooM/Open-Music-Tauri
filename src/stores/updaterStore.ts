import { create } from 'zustand';
import { check, type Update } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { isTauri } from '../env';
import { useToastStore } from './toastStore';

export interface UpdaterState {
  isChecking: boolean;
  isDownloading: boolean;
  isDownloaded: boolean;
  updateAvailable: boolean;
  newVersion: string | null;
  releaseNotes: string | null;
  downloadProgress: number;
  activeUpdate: Update | null;

  checkForUpdates: (silent?: boolean) => Promise<void>;
  downloadAndInstall: () => Promise<void>;
  dismissUpdate: () => void;
}

export const useUpdaterStore = create<UpdaterState>((set, get) => ({
  isChecking: false,
  isDownloading: false,
  isDownloaded: false,
  updateAvailable: false,
  newVersion: null,
  releaseNotes: null,
  downloadProgress: 0,
  activeUpdate: null,

  checkForUpdates: async (silent = false) => {
    if (!isTauri) {
      if (!silent) useToastStore.getState().showToast('Web 预览模式不支持客户端自动更新', 'info');
      return;
    }
    set({ isChecking: true });
    try {
      const update = await check();
      if (update?.available) {
        set({
          updateAvailable: true,
          newVersion: update.version,
          releaseNotes: update.body || null,
          activeUpdate: update,
          isChecking: false,
        });
      } else {
        set({ updateAvailable: false, activeUpdate: null, isChecking: false });
        if (!silent) useToastStore.getState().showToast('当前已是最新版本 (v0.1.5)', 'success');
      }
    } catch (err) {
      console.warn('[Updater] check failed:', err);
      set({ isChecking: false });
      if (!silent) useToastStore.getState().showToast('检查更新失败，请检查网络连接', 'warning');
    }
  },

  downloadAndInstall: async () => {
    const { activeUpdate } = get();
    if (!activeUpdate) return;
    set({ isDownloading: true, downloadProgress: 0 });

    try {
      let downloadedBytes = 0;
      let totalBytes = 0;

      await activeUpdate.downloadAndInstall((event) => {
        if (event.event === 'Started') {
          totalBytes = event.data.contentLength ?? 0;
        } else if (event.event === 'Progress') {
          downloadedBytes += event.data.chunkLength;
          if (totalBytes > 0) {
            set({ downloadProgress: Math.min(100, Math.round((downloadedBytes / totalBytes) * 100)) });
          }
        } else if (event.event === 'Finished') {
          set({ isDownloaded: true, downloadProgress: 100 });
        }
      });

      useToastStore.getState().showToast('更新包下载完成，正在重启应用...', 'success');
      await relaunch();
    } catch (err) {
      console.error('[Updater] download/install failed:', err);
      useToastStore.getState().showToast('更新下载或安装失败', 'warning');
      set({ isDownloading: false });
    }
  },

  dismissUpdate: () => set({ updateAvailable: false }),
}));
