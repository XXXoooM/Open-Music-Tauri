import { useState, useEffect, useRef } from 'react';
import { Play, Plus, Loader2, Music2, Heart, Search } from 'lucide-react';
import { searchSongs } from '../../services/neteaseApi';
import { usePlayerStore } from '../../stores/playerStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useNavigationStore } from '../../stores/navigationStore';
import { useLibraryStore } from '../../stores/libraryStore';
import type { Track } from '../../types';

const HOT_TAGS = ['周杰伦', '林俊杰', '陈奕迅', '陶喆', '王菲', 'Taylor Swift', '告五人', '许嵩'];

export default function SearchView() {
  const globalSearchQuery = useNavigationStore((s) => s.globalSearchQuery);
  const setGlobalSearchQuery = useNavigationStore((s) => s.setGlobalSearchQuery);
  const [results, setResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);

  const apiSource = useSettingsStore((s) => s.apiSource);
  const setPlaylistAndPlay = usePlayerStore((s) => s.setPlaylistAndPlay);
  const enqueueTrack = usePlayerStore((s) => s.enqueueTrack);
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);
  const isFavorite = useLibraryStore((s) => s.isFavorite);
  const searchTimer = useRef<number | null>(null);

  useEffect(() => {
    const q = globalSearchQuery.trim();
    if (!q) {
      setResults([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(async () => {
      const tracks = await searchSongs(q, apiSource);
      setResults(tracks);
      setIsLoading(false);
    }, 350);

    return () => {
      if (searchTimer.current) window.clearTimeout(searchTimer.current);
    };
  }, [globalSearchQuery, apiSource]);

  const handleEnqueue = (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    enqueueTrack(track);
    setAddedId(track.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto px-[32px] pb-[40px]">
      {!globalSearchQuery.trim() ? (
        <div className="flex flex-col gap-[16px] pt-[8px]">
          <span className="text-[13px] font-semibold text-[var(--text-tertiary)] uppercase tracking-[0.06em]">
            热门搜索推荐
          </span>
          <div className="flex flex-wrap gap-[8px]">
            {HOT_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setGlobalSearchQuery(tag)}
                className="px-[14px] py-[6px] rounded-full text-[13px] text-[var(--text-secondary)] bg-[var(--hover)] hover:text-[var(--text-primary)] hover:bg-[var(--active)] transition-colors cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="flex flex-col items-center justify-center gap-[12px] py-[64px] text-[var(--text-tertiary)] select-none">
            <Search className="w-[48px] h-[48px] stroke-[1.5]" />
            <span className="text-[14px]">输入歌曲名、歌手或专辑开始全网搜索</span>
          </div>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-[64px] gap-[8px] text-[var(--text-secondary)]">
          <Loader2 className="w-[20px] h-[20px] animate-spin" />
          <span className="text-[14px]">正在搜索 “{globalSearchQuery}”...</span>
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-[64px] gap-[12px] text-[var(--text-secondary)]">
          <span className="text-[15px]">未找到与 “{globalSearchQuery}” 相关的歌曲</span>
          <span className="text-[13px] text-[var(--text-tertiary)]">试试其他关键词或艺术家姓名</span>
        </div>
      ) : (
        <div className="flex flex-col gap-[2px]">
          <span className="text-[13px] text-[var(--text-tertiary)] mb-[10px]">
            找到 {results.length} 首与 “{globalSearchQuery}” 相关的歌曲
          </span>
          {results.map((track, idx) => {
            const fav = isFavorite(track.id);
            return (
              <div
                key={`${track.id}_${idx}`}
                onClick={() => setPlaylistAndPlay(results, idx)}
                className="group flex items-center justify-between h-[52px] px-[12px] rounded-[var(--radius-md)] hover:bg-[var(--hover)] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-[12px] min-w-0">
                  <div className="relative w-[38px] h-[38px] rounded-[var(--radius-sm)] overflow-hidden shrink-0 bg-[var(--hover)]">
                    {track.pic ? (
                      <img src={track.pic} alt={track.name} className="w-full h-full object-cover" />
                    ) : (
                      <Music2 className="w-[18px] h-[18px] m-auto text-[var(--text-tertiary)]" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Play className="w-[14px] h-[14px] text-white fill-current ml-[1px]" />
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[14px] font-medium text-[var(--text-primary)] truncate">{track.name}</span>
                    <span className="text-[12px] text-[var(--text-secondary)] truncate">{track.artist} · {track.album}</span>
                  </div>
                </div>

                <div className="flex items-center gap-[6px]">
                  <button
                    type="button"
                    title={fav ? '取消收藏' : '收藏'}
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(track); }}
                    className={`p-[8px] rounded-[var(--radius-sm)] transition-all cursor-pointer ${
                      fav ? 'text-[var(--accent)]' : 'opacity-0 group-hover:opacity-100 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Heart className={`w-[16px] h-[16px] ${fav ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    type="button"
                    title="加入待播清单"
                    onClick={(e) => handleEnqueue(e, track)}
                    className="opacity-0 group-hover:opacity-100 p-[8px] rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--active)] transition-all cursor-pointer"
                  >
                    {addedId === track.id ? <span className="text-[11px] text-[var(--dynamic-accent)]">已添加</span> : <Plus className="w-[16px] h-[16px]" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
