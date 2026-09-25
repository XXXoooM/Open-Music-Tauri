import { useState, useEffect, useRef } from 'react';
import { Search, Play, Plus, Loader2, Music2 } from 'lucide-react';
import { searchSongs } from '../../services/neteaseApi';
import { usePlayerStore } from '../../stores/playerStore';
import { useSettingsStore } from '../../stores/settingsStore';
import type { Track } from '../../types';

const HOT_TAGS = ['周杰伦', '林俊杰', '陈奕迅', '陶喆', '王菲', 'Taylor Swift', '告五人', '许嵩'];

export default function SearchView() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);

  const apiSource = useSettingsStore((s) => s.apiSource);
  const setPlaylistAndPlay = usePlayerStore((s) => s.setPlaylistAndPlay);
  const enqueueTrack = usePlayerStore((s) => s.enqueueTrack);
  const searchTimer = useRef<number | null>(null);

  const executeSearch = async (keyword: string) => {
    const q = keyword.trim();
    if (!q) {
      setResults([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const tracks = await searchSongs(q, apiSource);
    setResults(tracks);
    setIsLoading(false);
  };

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
    if (!val.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    searchTimer.current = window.setTimeout(() => void executeSearch(val), 350);
  };

  useEffect(() => {
    return () => {
      if (searchTimer.current) window.clearTimeout(searchTimer.current);
    };
  }, []);

  const handleEnqueue = (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    enqueueTrack(track);
    setAddedId(track.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto px-[32px] pt-[24px] pb-[40px]">
      <header className="mb-[20px] shrink-0">
        <h1 className="text-[28px] font-bold text-[var(--text-primary)] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          搜索
        </h1>
        <div className="relative mt-[16px] max-w-[560px]">
          <Search className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[var(--text-tertiary)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="搜索歌曲、歌手、专辑..."
            autoFocus
            className="w-full h-[40px] pl-[42px] pr-[16px] rounded-[var(--radius-md)] text-[14px] text-[var(--text-primary)] outline-none bg-[var(--hover)] focus:bg-[var(--active)] border border-transparent focus:border-[var(--border)] transition-all duration-[var(--duration-hover)]"
          />
          {isLoading && <Loader2 className="absolute right-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[var(--text-tertiary)] animate-spin" />}
        </div>
      </header>

      {!query.trim() && (
        <div className="mt-[12px]">
          <h2 className="text-[13px] font-semibold text-[var(--text-tertiary)] uppercase tracking-[0.06em] mb-[12px]">热门搜索推荐</h2>
          <div className="flex flex-wrap gap-[8px]">
            {HOT_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => { setQuery(tag); void executeSearch(tag); }}
                className="px-[14px] py-[6px] rounded-full text-[13px] text-[var(--text-secondary)] bg-[var(--hover)] hover:text-[var(--text-primary)] hover:bg-[var(--active)] transition-colors cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="flex flex-col gap-[2px] mt-[8px]">
          {results.map((track, idx) => (
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
              <button
                type="button"
                title="加入待播清单"
                onClick={(e) => handleEnqueue(e, track)}
                className="opacity-0 group-hover:opacity-100 p-[8px] rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--active)] transition-all cursor-pointer"
              >
                {addedId === track.id ? <span className="text-[11px] text-[var(--dynamic-accent)]">已添加</span> : <Plus className="w-[16px] h-[16px]" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
