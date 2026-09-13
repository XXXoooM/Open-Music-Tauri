import { useEffect } from "react";
import { ChevronDown, Minus, Square, X } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { isTauri } from "../../env";
import { usePlayerStore } from "../../stores/playerStore";
import AlbumArt from "./AlbumArt";
import ControlBar from "./ControlBar";
import DynamicBackground from "./DynamicBackground";
import LyricsView from "./LyricsView";

interface NowPlayingProps {
  /** 是否展开显示 */
  isOpen: boolean;
  /** 关闭回调 */
  onClose(): void;
}

export default function NowPlaying({ isOpen, onClose }: NowPlayingProps) {
  const track = usePlayerStore((s) => s.playlist[s.currentTrackIndex]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <div
      data-region="now-playing"
      className={`fixed inset-0 flex flex-col justify-between select-none overflow-hidden transition-[opacity,transform,filter] duration-[var(--duration-page)] ease-[var(--ease-apple)] ${
        isOpen
          ? "opacity-100 scale-100 blur-0 pointer-events-auto"
          : "opacity-0 scale-100 blur-[8px] pointer-events-none"
      }`}
      style={{
        zIndex: 100,
        backgroundColor: "var(--now-playing-base)",
      }}
    >
      {/* 动态背景层 */}
      <DynamicBackground />

      {/* 顶部栏 64px */}
      <header className="h-[64px] px-[24px] flex items-center justify-between shrink-0 drag-region">
        <button
          type="button"
          onClick={onClose}
          className="no-drag p-1 text-[var(--text-primary)] cursor-pointer"
        >
          <ChevronDown className="w-[24px] h-[24px]" />
        </button>

        {isTauri && (
          <div className="no-drag flex items-center gap-[8px]">
            <button
              type="button"
              onClick={() => void getCurrentWindow().minimize()}
              className="w-[24px] h-[24px] rounded-[var(--radius-sm)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--hover)] hover:text-[var(--text-primary)] transition-colors duration-[var(--duration-hover)] ease-[var(--ease-apple)] cursor-pointer"
            >
              <Minus className="w-[14px] h-[14px]" />
            </button>
            <button
              type="button"
              onClick={() => void getCurrentWindow().toggleMaximize()}
              className="w-[24px] h-[24px] rounded-[var(--radius-sm)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--hover)] hover:text-[var(--text-primary)] transition-colors duration-[var(--duration-hover)] ease-[var(--ease-apple)] cursor-pointer"
            >
              <Square className="w-[14px] h-[14px]" />
            </button>
            <button
              type="button"
              onClick={() => void getCurrentWindow().close()}
              className="w-[24px] h-[24px] rounded-[var(--radius-sm)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[rgba(255,59,48,0.8)] hover:text-[var(--text-primary)] transition-colors duration-[var(--duration-hover)] ease-[var(--ease-apple)] cursor-pointer"
            >
              <X className="w-[14px] h-[14px]" />
            </button>
          </div>
        )}
      </header>

      {/* 主内容区（左右分栏 40% vs 60%） */}
      <main data-now-playing-main className="flex-1 flex items-center px-[64px] gap-[64px] min-h-0">
        {/* 左区 40%：封面与歌曲信息 */}
        <section className="w-[40%] flex flex-col items-start justify-center">
          <AlbumArt />
          <div className="mt-[40px] max-w-full">
            <h1
              className="text-[32px] font-bold text-[var(--text-primary)] truncate leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {track?.name ?? "未在播放"}
            </h1>
            <p className="text-[18px] mt-[12px] text-[var(--text-secondary)] truncate">
              {track?.artist ?? ""}
            </p>
            {track?.album && (
              <p className="text-[14px] mt-[6px] text-[var(--text-tertiary)] truncate">
                {track.album}
              </p>
            )}
          </div>
        </section>

        {/* 右区 60%：歌词 */}
        <section className="w-[60%] h-[60vh] overflow-hidden">
          <LyricsView />
        </section>
      </main>

      {/* 底部控制栏与贴底进度线 */}
      <ControlBar />
    </div>
  );
}
