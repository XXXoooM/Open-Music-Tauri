import { Search, X } from 'lucide-react';
import { useNavigationStore, type ActiveView } from '../../stores/navigationStore';

const VIEW_TITLES: Record<ActiveView, string> = {
  browse: '浏览',
  search: '搜索',
  favorites: '收藏歌曲',
  recent: '最近播放',
  playlists: '我的歌单',
  'playlist-detail': '歌单详情',
  songs: '歌曲',
};

export default function TopSearchHeader() {
  const activeView = useNavigationStore((s) => s.activeView);
  const setActiveView = useNavigationStore((s) => s.setActiveView);
  const globalSearchQuery = useNavigationStore((s) => s.globalSearchQuery);
  const setGlobalSearchQuery = useNavigationStore((s) => s.setGlobalSearchQuery);

  const handleSearchChange = (val: string) => {
    setGlobalSearchQuery(val);
    if (val.trim() && activeView !== 'search') {
      setActiveView('search');
    }
  };

  const handleClear = () => {
    setGlobalSearchQuery('');
  };

  return (
    <header className="shrink-0 flex items-center justify-between px-[32px] pt-[20px] pb-[16px]">
      <h1
        className="text-[26px] font-bold text-[var(--text-primary)] tracking-tight select-none"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {VIEW_TITLES[activeView] || '音乐库'}
      </h1>

      <div className="relative w-[280px]">
        <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-[var(--text-tertiary)] pointer-events-none" />
        <input
          type="text"
          value={globalSearchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="搜索音乐、歌手、歌单..."
          className="w-full h-[34px] pl-[34px] pr-[30px] rounded-full text-[13px] text-[var(--text-primary)] outline-none bg-[var(--hover)] focus:bg-[var(--active)] border border-transparent focus:border-[var(--border)] transition-all duration-[var(--duration-hover)]"
        />
        {globalSearchQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-[8px] top-1/2 -translate-y-1/2 p-[4px] rounded-full text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <X className="w-[13px] h-[13px]" />
          </button>
        )}
      </div>
    </header>
  );
}
