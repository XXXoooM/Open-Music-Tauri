import type { Track, ApiSource } from '../types';

/**
 * 音频 API 源配置字典
 */
export const API_SOURCES: Record<
  ApiSource,
  {
    baseUrl: string;
    buildUrl: (type: string, id: string) => string;
  }
> = {
  qijieya: {
    baseUrl: 'https://api.qijieya.cn/meting/',
    buildUrl: (type: string, id: string): string =>
      `https://api.qijieya.cn/meting/?type=${type}&id=${id}`,
  },
  mikus: {
    baseUrl: 'https://meting.mikus.ink/api',
    buildUrl: (type: string, id: string): string =>
      `https://meting.mikus.ink/api?server=netease&type=${type}&id=${id}`,
  },
};

/**
 * 兜底歌单元数据项
 */
interface FallbackTrackMetadata {
  name: string;
  artist: string;
  id: string;
  picId: string;
}

/**
 * 离线 / API 失败时的兜底歌单元数据
 */
const FALLBACK_PLAYLIST_METADATA: readonly FallbackTrackMetadata[] = [
  { name: '你若成风', artist: '许嵩/莫诗旎', id: '167929', picId: '109951172188951978' },
  { name: '雅俗共赏', artist: '许嵩', id: '411214279', picId: '3431575794705764' },
  { name: '走马', artist: '陈粒', id: '30431367', picId: '7721870161993398' },
  { name: '美人鱼', artist: '林俊杰', id: '108931', picId: '109951171891430447' },
  { name: '情歌', artist: '梁静茹', id: '254059', picId: '109951168163257789' },
];

/**
 * 获取离线/错误兜底歌单列表
 * @param apiSource 当前使用的音频数据源
 * @returns 完整的 Track 数组
 */
export function getFallbackPlaylist(apiSource: ApiSource): Track[] {
  return FALLBACK_PLAYLIST_METADATA.map((track) => ({
    id: track.id,
    name: track.name,
    artist: track.artist,
    url: API_SOURCES[apiSource].buildUrl('url', track.id),
    pic: API_SOURCES[apiSource].buildUrl('pic', track.picId),
    lrc: API_SOURCES[apiSource].buildUrl('lrc', track.id),
  }));
}

/**
 * URL 归一化处理
 * 确保相对路径补齐当前数据源的主机与协议前缀
 * @param path 待归一化的原始路径或链接
 * @param apiSource 当前使用的音频数据源
 * @returns 完整的绝对 URL
 */
export function normalizeUrl(path: string, apiSource: ApiSource): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const currentBase = API_SOURCES[apiSource].baseUrl;
  const apiOrigin = new URL(currentBase).origin;
  if (path.startsWith('/')) {
    return apiOrigin + path;
  }
  return currentBase + (currentBase.endsWith('/') ? '' : '/') + path;
}

/**
 * 歌单 ID 解析提取
 * 从输入的纯数字、URL、分享文本中提取标准化歌单 ID
 * @param input 用户输入的原始字符串
 * @returns 提取出的数字 ID 字符串，未匹配则返回 null
 */
export function parsePlaylistId(input: string): string | null {
  const trimmed = input.trim();
  // 1. 纯数字
  if (/^\d+$/.test(trimmed)) return trimmed;
  // 2. query 参数 id=xxxx
  const queryMatch = trimmed.match(/[?&]id=(\d+)/);
  if (queryMatch) return queryMatch[1];
  // 3. /playlist/xxxx 或 /toplist/xxxx 或 /album/xxxx
  const pathMatch = trimmed.match(/\/(playlist|toplist|album)\/(\d+)/);
  if (pathMatch) return pathMatch[2];
  // 4. 兜底：任意 5-12 位数字
  const fallbackMatch = trimmed.match(/\b(\d{5,12})\b/);
  if (fallbackMatch) return fallbackMatch[1];
  return null;
}

/**
 * API 返回的单曲原始数据类型声明
 */
interface RawApiTrack {
  id?: string | number;
  song_id?: string | number;
  name?: string;
  title?: string;
  artist?: string;
  author?: string;
  url?: string;
  pic?: string;
  lrc?: string;
}

/**
 * 根据优先级提取曲目的唯一 ID
 */
function extractTrackId(track: RawApiTrack): string {
  if (track.id !== undefined && track.id !== null && String(track.id).trim() !== '') {
    return String(track.id);
  }
  if (track.song_id !== undefined && track.song_id !== null && String(track.song_id).trim() !== '') {
    return String(track.song_id);
  }
  if (track.url) {
    const match = track.url.match(/id=(\d+)/);
    if (match?.[1]) {
      return match[1];
    }
    return track.url;
  }
  return '';
}

/**
 * 从远程 API 拉取指定歌单的曲目列表
 * @param playlistId 歌单 ID
 * @param apiSource 音频数据源
 * @returns 解析并归一化后的曲目数组
 * @throws 接口返回非 200 响应码或空数据时抛出 Error
 */
export async function fetchPlaylist(
  playlistId: string,
  apiSource: ApiSource
): Promise<Track[]> {
  const apiUrl = API_SOURCES[apiSource].buildUrl('playlist', playlistId);
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error('API server returned error code');
  }

  const data: unknown = await response.json();
  if (Array.isArray(data) && data.length > 0) {
    const rawTracks = data as RawApiTrack[];
    return rawTracks.map((track) => ({
      id: extractTrackId(track),
      name: track.name || track.title || '未知歌名',
      artist: track.artist || track.author || '未知歌手',
      url: normalizeUrl(track.url || '', apiSource),
      pic: normalizeUrl(track.pic || '', apiSource),
      lrc: normalizeUrl(track.lrc || '', apiSource),
    }));
  }

  throw new Error('API returned empty playlist');
}
