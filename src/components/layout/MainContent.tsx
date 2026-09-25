import BrowseView from '../browse/BrowseView';
import SearchView from '../search/SearchView';
import FavoritesView from '../library/FavoritesView';
import RecentView from '../library/RecentView';
import PlaylistsView from '../library/PlaylistsView';
import PlaylistDetailView from '../library/PlaylistDetailView';
import SongList from '../library/SongList';
import TopSearchHeader from './TopSearchHeader';
import { useNavigationStore } from '../../stores/navigationStore';

export default function MainContent() {
  const activeView = useNavigationStore((s) => s.activeView);

  const renderCurrentView = () => {
    switch (activeView) {
      case 'browse':
        return <BrowseView />;
      case 'search':
        return <SearchView />;
      case 'favorites':
        return <FavoritesView />;
      case 'recent':
        return <RecentView />;
      case 'playlists':
        return <PlaylistsView />;
      case 'playlist-detail':
        return <PlaylistDetailView />;
      case 'songs':
      default:
        return (
          <div className="flex-1 overflow-y-auto px-[32px] pb-[24px]">
            <SongList />
          </div>
        );
    }
  };

  return (
    <main
      data-region="main-content"
      className="flex-1 min-w-0 h-full flex flex-col overflow-hidden"
      style={{ background: 'var(--material-content)' }}
    >
      <TopSearchHeader />
      <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">
        {renderCurrentView()}
      </div>
    </main>
  );
}
