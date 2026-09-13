import { isTauri } from '../env';
import type { Store } from '@tauri-apps/plugin-store';

/** 存储键前缀，避免与宿主或其他应用产生命名空间冲突 */
const PREFIX = 'open-music:';

/** Tauri 桌面端使用的存储文件名 */
const SETTINGS_FILE = 'settings.json';

/**
 * 模块级缓存 Tauri Store 实例的 Promise，
 * 避免每次读写都重复调用 load 初始化文件句柄
 */
let storePromise: Promise<Store> | null = null;

function getStore(): Promise<Store> {
  if (!storePromise) {
    storePromise = import('@tauri-apps/plugin-store').then((m) =>
      m.load(SETTINGS_FILE)
    );
  }
  return storePromise;
}

/**
 * 跨平台统一持久化存储适配器
 * - Tauri 环境下自动桥接 @tauri-apps/plugin-store（JSON 文件持久化）
 * - Web 环境下自动桥接 window.localStorage（浏览器存储）
 */
export const storage = {
  /**
   * 读取存储值
   * - Tauri 端：从 settings.json 读取，键不存在时返回 null
   * - Web 端：从 localStorage 读取并解析 JSON，不存在或解析失败时返回 null
   */
  async get<T>(key: string): Promise<T | null> {
    const prefixedKey = `${PREFIX}${key}`;

    if (isTauri) {
      const store = await getStore();
      const val = await store.get<T>(prefixedKey);
      return val ?? null;
    }

    try {
      const raw = localStorage.getItem(prefixedKey);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },

  /**
   * 写入存储值
   * - Tauri 端：写入 settings.json 并立即保存到磁盘
   * - Web 端：序列化为 JSON 字符串后写入 localStorage
   */
  async set<T>(key: string, value: T): Promise<void> {
    const prefixedKey = `${PREFIX}${key}`;

    if (isTauri) {
      const store = await getStore();
      await store.set(prefixedKey, value);
      await store.save();
      return;
    }

    try {
      localStorage.setItem(prefixedKey, JSON.stringify(value));
    } catch (e) {
      console.warn('localStorage setItem failed:', e);
    }
  },

  /**
   * 删除存储项
   * - Tauri 端：从 settings.json 删除对应键并保存
   * - Web 端：从 localStorage 移除对应键
   */
  async remove(key: string): Promise<void> {
    const prefixedKey = `${PREFIX}${key}`;

    if (isTauri) {
      const store = await getStore();
      await store.delete(prefixedKey);
      await store.save();
      return;
    }

    try {
      localStorage.removeItem(prefixedKey);
    } catch (e) {
      console.warn('localStorage removeItem failed:', e);
    }
  },
};
