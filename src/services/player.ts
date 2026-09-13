/**
 * 音频事件名称联合类型
 */
export type PlayerEvent = 'timeupdate' | 'durationchange' | 'ended' | 'error';

/**
 * 音频事件对应载荷字典
 */
export interface PlayerEventMap {
  timeupdate: { currentTime: number; duration: number };
  durationchange: { duration: number };
  ended: void;
  error: unknown;
}

/**
 * 封装 HTMLAudioElement 的播放器引擎
 * 采用 Pub/Sub 模式解耦事件触发与业务订阅
 */
class WebPlayer {
  private readonly audio: HTMLAudioElement;
  private readonly events = new Map<PlayerEvent, Set<(data: unknown) => void>>();

  constructor() {
    this.audio = new Audio();
    this.bindEvents();
  }

  private bindEvents(): void {
    this.audio.addEventListener('timeupdate', () => {
      this.emit('timeupdate', {
        currentTime: this.audio.currentTime,
        duration: this.audio.duration || 0,
      });
    });

    this.audio.addEventListener('ended', () => {
      this.emit('ended', undefined);
    });

    this.audio.addEventListener('error', (e) => {
      this.emit('error', e);
    });

    this.audio.addEventListener('durationchange', () => {
      this.emit('durationchange', {
        duration: this.audio.duration || 0,
      });
    });
  }

  /**
   * 统一播放入口
   * - 传入新 url：换源并加载播放
   * - 传入 null 或相同 url：续播当前音频
   */
  play(url: string | null): Promise<void> {
    if (url && this.audio.src !== url) {
      this.audio.src = url;
      this.audio.load();
    }
    return this.audio.play();
  }

  pause(): void {
    this.audio.pause();
  }

  seek(time: number): void {
    this.audio.currentTime = Math.max(0, Number.isFinite(time) ? time : 0);
  }

  getCurrentTime(): number {
    return this.audio.currentTime;
  }

  getDuration(): number {
    return this.audio.duration || 0;
  }

  setVolume(vol: number): void {
    const clamped = Math.max(0, Math.min(1, Number.isFinite(vol) ? vol : 0.7));
    this.audio.volume = clamped;
  }

  getVolume(): number {
    return this.audio.volume;
  }

  isPlaying(): boolean {
    return !this.audio.paused;
  }

  on<K extends PlayerEvent>(
    event: K,
    callback: (data: PlayerEventMap[K]) => void
  ): void {
    let set = this.events.get(event);
    if (!set) {
      set = new Set();
      this.events.set(event, set);
    }
    set.add(callback as (data: unknown) => void);
  }

  off<K extends PlayerEvent>(
    event: K,
    callback: (data: PlayerEventMap[K]) => void
  ): void {
    const set = this.events.get(event);
    if (set) {
      set.delete(callback as (data: unknown) => void);
    }
  }

  private emit<K extends PlayerEvent>(event: K, data: PlayerEventMap[K]): void {
    const set = this.events.get(event);
    if (set) {
      set.forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in WebPlayer listener for "${event}":`, err);
        }
      });
    }
  }
}

/** 模块级单例实例 */
let instance: WebPlayer | null = null;

/**
 * 获取全局唯一的 WebPlayer 单例
 */
export function getPlayer(): WebPlayer {
  if (!instance) {
    instance = new WebPlayer();
  }
  return instance;
}
