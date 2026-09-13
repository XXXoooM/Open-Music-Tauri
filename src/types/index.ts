/**
 * 全局核心类型定义
 * Phase 2 状态层与数据流基石
 */

/**
 * 单首曲目信息
 * 对应网易云解析后的音轨数据
 */
export interface Track {
  /** 曲目唯一标识（网易云歌曲 ID 字符串） */
  id: string;
  /** 歌曲名称 */
  name: string;
  /** 艺术家/歌手名称 */
  artist: string;
  /** 音频播放直链 */
  url: string;
  /** 专辑封面图片 URL */
  pic: string;
  /** LRC 歌词文本或歌词直链 URL */
  lrc: string;
  /** 专辑名称（预留字段，API 可能缺省） */
  album?: string;
  /** 歌曲副标题/译名/别名（可选） */
  alias?: string;
  /** 音频总时长，单位为秒（预留字段，通常加载音频元数据后获取） */
  duration?: number;
}

export interface LyricWord {
  word: string;
  startTime: number;
  endTime: number;
}

/**
 * 解析后的单行歌词数据
 * 来自 parseLRC 的解析输出
 */
export interface LyricLine {
  /** 歌词对应的时间戳（单位：秒） */
  time: number;
  /** 歌词文本内容 */
  text: string;
  /** 翻译文本（可选，来自 AMLL 解析或双语 LRC） */
  translation?: string;
  /** 罗马音/假名注音文本（可选，来自 AMLL 解析） */
  romaji?: string;
  /** YRC 逐字歌词切分词汇数组（可选） */
  words?: LyricWord[];
  /** 原始 AMLL 歌词行数据（用于传递给 LyricPlayer） */
  _amllRaw?: unknown;
}

/**
 * 播放循环模式
 * - list-loop: 列表循环
 * - single-loop: 单曲循环
 * - shuffle: 随机播放
 */
export type PlayMode = 'list-loop' | 'single-loop' | 'shuffle';

/**
 * 音频解析 API 数据源服务提供方
 * - qijieya: 柒月 API 服务
 * - mikus: 初音 API 服务
 */
export type ApiSource = 'qijieya' | 'mikus';

/**
 * 用户个性化设置
 * 用于 settingsStore 持久化存储与跨平台同步
 */
export interface UserSettings {
  /** 音量大小，范围 0 到 1 */
  volume: number;
  /** 播放循环模式 */
  playMode: PlayMode;
  /** 当前选中的音频 API 数据源 */
  apiSource: ApiSource;
  /** 默认/当前加载的歌单 ID */
  playlistId: string;
}

/** 外观背景模式 */
export type BackgroundMode = 'gradient' | 'fluid' | 'solid' | 'blur';

/** 应用主题模式 */
export type Theme = 'system' | 'dark' | 'light';

/** 强调色来源 */
export type AccentSource = 'cover' | 'fixed';

/** 歌词显示字号 */
export type LyricFontSize = 'small' | 'medium' | 'large';

