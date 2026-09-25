import { useState, type ComponentType } from 'react';
import {
  Compass,
  Heart,
  Clock,
  ListMusic,
  Settings,
} from 'lucide-react';
import { useNavigationStore, type ActiveView } from '../../stores/navigationStore';

interface NavItem {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  view: ActiveView;
}

interface SidebarProps {
  onOpenSettings(): void;
}

const mainNavItems: NavItem[] = [
  { id: 'browse', label: '浏览', icon: Compass, view: 'browse' },
];

const libraryNavItems: NavItem[] = [
  { id: 'favorites', label: '收藏歌曲', icon: Heart, view: 'favorites' },
  { id: 'recent', label: '最近播放', icon: Clock, view: 'recent' },
  { id: 'playlists', label: '我的歌单', icon: ListMusic, view: 'playlists' },
];

export default function Sidebar({ onOpenSettings }: SidebarProps) {
  const activeView = useNavigationStore((s) => s.activeView);
  const setActiveView = useNavigationStore((s) => s.setActiveView);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;
    const isActive =
      item.view === activeView ||
      (item.view === 'playlists' && activeView === 'playlist-detail');
    const isHovered = hoveredId === item.id;

    const bg = isActive ? 'var(--active)' : isHovered ? 'var(--hover)' : undefined;
    const color = isActive || isHovered ? 'var(--text-primary)' : 'var(--text-secondary)';

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => setActiveView(item.view)}
        onMouseEnter={() => setHoveredId(item.id)}
        onMouseLeave={() => setHoveredId(null)}
        className="flex items-center w-full h-[36px] px-[10px] gap-[10px] rounded-[var(--radius-sm)] text-[14px] cursor-pointer select-none transition-colors duration-[var(--duration-hover)] ease-[var(--ease-apple)]"
        style={{ backgroundColor: bg, color, fontWeight: isActive ? 600 : 500 }}
      >
        <Icon className="w-[18px] h-[18px] shrink-0" />
        <span className="truncate">{item.label}</span>
      </button>
    );
  };

  return (
    <aside
      data-region="sidebar"
      className="relative w-[240px] shrink-0 h-full flex flex-col pt-[48px] px-[12px] pb-[16px] bg-[var(--material-sidebar)] backdrop-blur-[var(--blur-sidebar)]"
    >
      {/* 顶部拖拽区 */}
      <div className="absolute top-0 left-0 right-0 h-[48px] drag-region" />

      {/* Logo */}
      <div className="h-[56px] flex items-center shrink-0 pl-[16px]">
        <span className="text-[17px] font-semibold text-[var(--text-primary)] tracking-tight">
          Open-Music
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-[2px] mt-[4px]">
        {/* Group 1: Main */}
        <div className="flex flex-col gap-[2px]">
          {mainNavItems.map(renderItem)}
        </div>

        {/* Group 2: Library */}
        <div className="flex flex-col gap-[2px] mt-[16px]">
          <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-[0.06em] px-[10px] mb-[4px]">
            音乐库
          </span>
          {libraryNavItems.map(renderItem)}
        </div>
      </nav>

      {/* Settings Footer */}
      <div className="mt-auto pt-[8px]">
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex items-center w-full h-[36px] px-[10px] gap-[10px] rounded-[var(--radius-sm)] text-[14px] text-[var(--text-secondary)] hover:bg-[var(--hover)] hover:text-[var(--text-primary)] font-medium cursor-pointer select-none transition-colors duration-[var(--duration-hover)] ease-[var(--ease-apple)]"
        >
          <Settings className="w-[18px] h-[18px] shrink-0" />
          <span className="truncate">设置</span>
        </button>
      </div>
    </aside>
  );
}
