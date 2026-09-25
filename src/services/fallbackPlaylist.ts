import type { Track, ApiSource } from '../types';
import { API_SOURCES } from './musicApiConfig';

interface FallbackTrackMetadata {
  name: string;
  artist: string;
  id: string;
  picId: string;
}

const FALLBACK_PLAYLIST_METADATA: readonly FallbackTrackMetadata[] = [
  { name: '你若成风', artist: '许嵩/莫诗旎', id: '167929', picId: '109951172188951978' },
  { name: '雅俗共赏', artist: '许嵩', id: '411214279', picId: '3431575794705764' },
  { name: '走马', artist: '陈粒', id: '30431367', picId: '7721870161993398' },
  { name: '美人鱼', artist: '林俊杰', id: '108931', picId: '109951171891430447' },
  { name: '情歌', artist: '梁静茹', id: '254059', picId: '109951168163257789' },
];

/** 获取离线/错误兜底歌单列表 */
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
