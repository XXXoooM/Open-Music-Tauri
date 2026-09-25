import { useState } from 'react';
import { LayoutGrid, ArrowUpDown, Search } from 'lucide-react';
import SongList from '../library/SongList';
import BrowseView from '../browse/BrowseView';
import SearchView from '../search/SearchView';
import { useNavigationStore } from '../../stores/navigationStore';

export default function MainContent() {
  const activeView = useNavigationStore((s) => s.activeView);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (activeView === 'browse') {
    return (
      <main
        data-region="main-content"
        className="flex-1 min-w-0 h-full flex flex-col overflow-hidden"
        style={{ background: 'var(--material-content)' }}
      >
        <BrowseView />
      </main>
    );
  }

  if (activeView === 'search') {
    return (
      <main
        data-region="main-content"
        className="flex-1 min-w-0 h-full flex flex-col overflow-hidden"
        style={{ background: 'var(--material-content)' }}
      >
        <SearchView />
      </main>
    );
  }

  return (
    <main
      data-region="main-content"
      className="flex-1 min-w-0 h-full flex flex-col overflow-hidden"
      style={{ background: 'var(--material-content)' }}
    >
      <header className="shrink-0 flex items-center justify-between px-[32px] pt-[24px] pb-[16px]">
        <h1
          className="text-[28px] font-bold text-[var(--text-primary)] tracking-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          歌曲
        </h1>
        <div className="flex items-center gap-[4px]">
          <button
            type="button"
            aria-label="视图切换"
            className="flex items-center justify-center p-[8px] rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)] cursor-pointer select-none transition-colors duration-[var(--duration-hover)] ease-[var(--ease-apple)]"
          >
            <LayoutGrid className="w-[20px] h-[20px] shrink-0" />
          </button>
          <button
            type="button"
            aria-label="排序"
            className="flex items-center justify-center p-[8px] rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)] cursor-pointer select-none transition-colors duration-[var(--duration-hover)] ease-[var(--ease-apple)]"
          >
            <ArrowUpDown className="w-[20px] h-[20px] shrink-0" />
          </button>
          <button
            type="button"
            aria-label="搜索"
            onClick={() => {
              if (isSearchOpen) setSearchQuery('');
              setIsSearchOpen(!isSearchOpen);
            }}
            className="flex items-center justify-center p-[8px] rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)] cursor-pointer select-none transition-colors duration-[var(--duration-hover)] ease-[var(--ease-apple)]"
          >
            <Search className="w-[20px] h-[20px] shrink-0" />
          </button>
        </div>
      </header>

      {isSearchOpen && (
        <div className="shrink-0 px-[32px] pb-[16px]">
          <div className="relative">
            <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[var(--text-tertiary)] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="在当前播放列表中过滤..."
              autoFocus
              className="w-full h-[36px] pl-[36px] pr-[12px] rounded-[var(--radius-md)] text-[14px] text-[var(--text-primary)] outline-none bg-[var(--hover)] transition-colors duration-[var(--duration-hover)] ease-[var(--ease-apple)]"
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-[32px] pb-[24px]">
        <SongList searchQuery={searchQuery} />
      </div>
    </main>
  );
}
