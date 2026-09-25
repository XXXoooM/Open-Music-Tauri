import { useState } from 'react';
import { ListMusic, Plus, Play, Trash2 } from 'lucide-react';
import { useLibraryStore, type UserPlaylist } from '../../stores/libraryStore';
import { useNavigationStore } from '../../stores/navigationStore';
import { usePlayerStore } from '../../stores/playerStore';
import CreatePlaylistModal from './CreatePlaylistModal';

export default function PlaylistsView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const userPlaylists = useLibraryStore((s) => s.userPlaylists);
  const deletePlaylist = useLibraryStore((s) => s.deletePlaylist);
  const setSelectedPlaylistId = useNavigationStore((s) => s.setSelectedPlaylistId);
  const setActiveView = useNavigationStore((s) => s.setActiveView);
  const setPlaylistAndPlay = usePlayerStore((s) => s.setPlaylistAndPlay);

  const handleOpenDetail = (playlist: UserPlaylist) => {
    setSelectedPlaylistId(playlist.id);
    setActiveView('playlist-detail');
  };

  const handlePlayDirect = (e: React.MouseEvent, playlist: UserPlaylist) => {
    e.stopPropagation();
    if (playlist.tracks.length > 0) {
      setPlaylistAndPlay(playlist.tracks, 0);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('确定要删除此歌单吗？')) {
      deletePlaylist(id);
    }
  };

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto px-[32px] pb-[32px]">
      <div className="flex items-center justify-between mb-[20px] shrink-0">
        <span className="text-[13px] text-[var(--text-tertiary)]">
          共 {userPlaylists.length} 个歌单
        </span>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-[6px] px-[16px] py-[7px] rounded-full bg-[var(--text-primary)] text-[var(--material-card)] hover:opacity-90 transition-opacity font-medium text-[13px] cursor-pointer"
        >
          <Plus className="w-[14px] h-[14px]" />
          <span>新建 / 导入歌单</span>
        </button>
      </div>

      {userPlaylists.length === 0 ? (
        <div className="w-full flex-1 flex flex-col items-center justify-center gap-[16px] select-none py-[64px]">
          <ListMusic className="w-[64px] h-[64px] text-[var(--text-tertiary)]" />
          <span className="text-[16px] text-[var(--text-secondary)]">暂无歌单</span>
          <span className="text-[13px] text-[var(--text-tertiary)]">
            点击上方按钮，创建空白歌单或一键导入网易云歌单
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-[20px]">
          {userPlaylists.map((pl) => {
            const cover = pl.tracks[0]?.pic;
            return (
              <div
                key={pl.id}
                onClick={() => handleOpenDetail(pl)}
                className="group flex flex-col gap-[10px] cursor-pointer select-none"
              >
                <div className="relative aspect-square w-full rounded-[var(--radius-md)] overflow-hidden bg-[var(--hover)] shadow-sm">
                  {cover ? (
                    <img src={cover} alt={pl.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[var(--hover)] text-[var(--text-tertiary)]">
                      <ListMusic className="w-[40px] h-[40px]" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-[12px]">
                    {pl.tracks.length > 0 && (
                      <button
                        type="button"
                        onClick={(e) => handlePlayDirect(e, pl)}
                        className="w-[40px] h-[40px] rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform cursor-pointer shadow-md"
                      >
                        <Play className="w-[18px] h-[18px] fill-current ml-[2px]" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, pl.id)}
                      className="w-[36px] h-[36px] rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-[var(--accent)] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-[16px] h-[16px]" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="text-[14px] font-medium text-[var(--text-primary)] truncate group-hover:underline">
                    {pl.name}
                  </span>
                  <span className="text-[12px] text-[var(--text-secondary)]">
                    {pl.tracks.length} 首歌曲
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreatePlaylistModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
