import { useState, useEffect } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { TOPLISTS, fetchToplistFirstSongCover, type ToplistDef } from '../../services/neteaseApi';
import { getCachedPlaylist } from '../../services/playlistCache';
import { usePlayerStore } from '../../stores/playerStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useNavigationStore } from '../../stores/navigationStore';

export default function BrowseView() {
  const [covers, setCovers] = useState<Record<string, string>>({});
  const [playingId, setPlayingId] = useState<string | null>(null);

  const loadPlaylist = usePlayerStore((s) => s.loadPlaylist);
  const play = usePlayerStore((s) => s.play);
  const apiSource = useSettingsStore((s) => s.apiSource);
  const setPlaylistId = useSettingsStore((s) => s.setPlaylistId);
  const setSelectedPlaylistId = useNavigationStore((s) => s.setSelectedPlaylistId);
  const setActiveView = useNavigationStore((s) => s.setActiveView);

  useEffect(() => {
    let cancelled = false;

    // 1. 同步恢复已有缓存封面
    const initialCovers: Record<string, string> = {};
    TOPLISTS.forEach((item) => {
      const cachedTracks = getCachedPlaylist(item.id);
      if (cachedTracks?.[0]?.pic) {
        initialCovers[item.id] = cachedTracks[0].pic;
      }
    });
    setCovers(initialCovers);

    // 2. 异步补齐榜单第一首歌曲的专辑封面
    TOPLISTS.forEach((item) => {
      if (initialCovers[item.id]) return;
      void fetchToplistFirstSongCover(item.id).then((pic) => {
        if (!cancelled && pic) {
          setCovers((prev) => ({ ...prev, [item.id]: pic }));
        }
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleOpenDetail = (toplist: ToplistDef) => {
    setSelectedPlaylistId(toplist.id, 'browse');
    setActiveView('playlist-detail');
  };

  const handleDirectPlay = async (e: React.MouseEvent, toplist: ToplistDef) => {
    e.stopPropagation();
    try {
      setPlayingId(toplist.id);
      setPlaylistId(toplist.id);
      await loadPlaylist(toplist.id, apiSource);
      play();
    } finally {
      setPlayingId(null);
    }
  };

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto px-[32px] pb-[40px]">
      <div className="mb-[20px] shrink-0">
        <p className="text-[13px] text-[var(--text-secondary)]">
          网易云音乐官方精选榜单与热门推荐
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-[20px]">
        {TOPLISTS.map((item) => {
          const cover = covers[item.id];
          const isPlayingThis = playingId === item.id;

          return (
            <div
              key={item.id}
              onClick={() => handleOpenDetail(item)}
              className="group flex flex-col gap-[10px] cursor-pointer select-none"
            >
              <div
                className="relative aspect-square w-full rounded-[var(--radius-md)] overflow-hidden shadow-sm transition-transform duration-300"
                style={{ background: item.gradient }}
              >
                {cover && (
                  <img
                    src={cover}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}

                <span className="absolute top-[10px] left-[10px] z-10 px-[7px] py-[2px] rounded-[var(--radius-sm)] text-[10px] font-bold tracking-wider text-white bg-black/45 backdrop-blur-md uppercase">
                  {item.badge}
                </span>

                <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    aria-label={`直接播放 ${item.name}`}
                    disabled={isPlayingThis}
                    onClick={(e) => void handleDirectPlay(e, item)}
                    className="w-[42px] h-[42px] rounded-full bg-white text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer shadow-lg"
                  >
                    {isPlayingThis ? (
                      <Loader2 className="w-[18px] h-[18px] animate-spin" />
                    ) : (
                      <Play className="w-[18px] h-[18px] fill-current ml-[2px]" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col min-w-0">
                <span className="text-[14px] font-medium text-[var(--text-primary)] truncate group-hover:underline">
                  {item.name}
                </span>
                <span className="text-[12px] text-[var(--text-secondary)] truncate">
                  {item.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
