import { useState } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { TOPLISTS, type ToplistDef } from '../../services/neteaseApi';
import { usePlayerStore } from '../../stores/playerStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useNavigationStore } from '../../stores/navigationStore';

export default function BrowseView() {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const loadPlaylist = usePlayerStore((s) => s.loadPlaylist);
  const play = usePlayerStore((s) => s.play);
  const apiSource = useSettingsStore((s) => s.apiSource);
  const setPlaylistId = useSettingsStore((s) => s.setPlaylistId);
  const setActiveView = useNavigationStore((s) => s.setActiveView);

  const handleSelectToplist = async (toplist: ToplistDef) => {
    try {
      setLoadingId(toplist.id);
      setPlaylistId(toplist.id);
      await loadPlaylist(toplist.id, apiSource);
      play();
      setActiveView('songs');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto px-[32px] pt-[24px] pb-[40px]">
      <header className="mb-[24px] shrink-0">
        <h1
          className="text-[28px] font-bold text-[var(--text-primary)] tracking-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          探索与排行榜
        </h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-[4px]">
          网易云音乐官方精选榜单与热门推荐
        </p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[20px]">
        {TOPLISTS.map((item) => {
          const isLoading = loadingId === item.id;
          return (
            <div
              key={item.id}
              onClick={() => !isLoading && void handleSelectToplist(item)}
              className="group relative h-[160px] rounded-[var(--radius-lg)] p-[16px] flex flex-col justify-between cursor-pointer select-none overflow-hidden transition-transform duration-[var(--duration-hover)] hover:scale-[1.02] shadow-[var(--shadow-card)]"
              style={{ background: item.gradient }}
            >
              <div className="flex items-center justify-between z-10">
                <span className="px-[8px] py-[2px] rounded-[var(--radius-sm)] text-[10px] font-bold tracking-wider text-white bg-black/25 backdrop-blur-sm uppercase">
                  {item.badge}
                </span>
                <button
                  type="button"
                  aria-label={`播放 ${item.name}`}
                  className="w-[36px] h-[36px] rounded-full bg-white/90 text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--duration-hover)] shadow-md"
                >
                  {isLoading ? (
                    <Loader2 className="w-[18px] h-[18px] animate-spin" />
                  ) : (
                    <Play className="w-[18px] h-[18px] fill-current ml-[2px]" />
                  )}
                </button>
              </div>

              <div className="z-10">
                <h3 className="text-[19px] font-bold text-white drop-shadow-sm">{item.name}</h3>
                <p className="text-[12px] text-white/80 mt-[2px] line-clamp-1">{item.desc}</p>
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
