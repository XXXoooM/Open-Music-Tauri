import { Heart, Play, Pause } from "lucide-react";
import { usePlayerStore } from "../../stores/playerStore";
import ProgressBar from "./ProgressBar";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export default function ControlBar() {
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const progress = usePlayerStore((s) => s.progress);
  const duration = usePlayerStore((s) => s.duration);

  return (
    <footer className="shrink-0 w-full select-none">
      <div className="h-[72px] px-[64px] flex justify-between items-center">
        {/* 左：Heart 图标按钮 */}
        <button
          type="button"
          className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-[var(--duration-hover)] ease-[var(--ease-apple)] cursor-pointer p-1"
        >
          <Heart className="w-[22px] h-[22px]" />
        </button>

        {/* 中：播放/暂停按钮 */}
        <button
          type="button"
          onClick={togglePlay}
          className="text-[var(--text-primary)] cursor-pointer flex items-center justify-center p-1"
        >
          {isPlaying ? (
            <Pause className="w-[32px] h-[32px]" />
          ) : (
            <Play className="w-[32px] h-[32px] ml-[2px]" />
          )}
        </button>

        {/* 右：时间显示 */}
        <span className="text-[13px] text-[var(--text-secondary)] tabular-nums">
          {formatTime(progress)} / {formatTime(duration)}
        </span>
      </div>

      {/* 紧贴窗口底边的 2px 进度线 */}
      <ProgressBar />
    </footer>
  );
}
