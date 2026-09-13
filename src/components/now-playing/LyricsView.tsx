import { useEffect, useMemo, useState } from 'react';
import { LyricPlayer } from '@applemusic-like-lyrics/react';
import {
  DomLyricPlayer,
  type LyricLine as AmllLyricLine,
} from '@applemusic-like-lyrics/core';
import '@applemusic-like-lyrics/core/style.css';
import { usePlayerStore } from '../../stores/playerStore';
import { getPlayer } from '../../services/player';

interface LyricGroupItem {
  renderStyles: () => void;
  blur: number;
  opacity: number;
  posY: { getCurrentPosition(): number };
  element: HTMLElement;
}

/**
 * 自定义 RefinedLyricPlayer：
 * 继承 AMLL 核心 DOM 渲染器，重写行样式渲染函数，
 * 将默认过于浓重生硬的 3~5px 糊影重塑为 Refined Now Playing 的轻柔渐进微景深（0.8~1.8px），
 * 保证非激活歌词在具有通透景深感的同时清晰可读。
 */
class RefinedLyricPlayer extends DomLyricPlayer {
  override setLyricLines(lines: AmllLyricLine[], initialTime = 0) {
    super.setLyricLines(lines, initialTime);
    const groups = (this as unknown as { currentLyricGroups?: LyricGroupItem[] })
      .currentLyricGroups;

    if (!groups) return;
    for (const group of groups) {
      group.renderStyles = function () {
        const y = this.posY.getCurrentPosition().toFixed(1);
        this.element.style.transform = `translateY(${y}px)`;
        this.element.style.opacity = this.opacity.toString();
        // 优雅微景深：激活行 0 模糊；邻近行 0.8~1.8px 细腻光学景深，与 Refined 完美对齐
        const softBlur = this.blur > 0 ? (0.35 + this.blur * 0.28).toFixed(2) : '0';
        this.element.style.filter = `blur(${softBlur}px)`;
      };
    }
  }
}

export default function LyricsView() {
  const lyrics = usePlayerStore((s) => s.lyrics);
  const progress = usePlayerStore((s) => s.progress);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const requestSeek = usePlayerStore((s) => s.requestSeek);

  const [currentTimeMs, setCurrentTimeMs] = useState(() => Math.floor(progress * 1000));

  // 高精度播放进度同步：正在播放时使用 rAF 采样原生音频引擎毫秒时间，使 YRC 逐字擦除动画达到 60/120fps 极致丝滑
  useEffect(() => {
    if (!isPlaying) {
      setCurrentTimeMs(Math.floor(progress * 1000));
      return;
    }
    let rafId: number;
    const tick = () => {
      const sec = getPlayer().getCurrentTime();
      setCurrentTimeMs(Math.floor(sec * 1000));
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, progress]);

  const amllLyricLines = useMemo(
    () =>
      lyrics
        .map((l) => l._amllRaw as AmllLyricLine | undefined)
        .filter((l): l is AmllLyricLine => l != null),
    [lyrics]
  );

  if (lyrics.length === 0 || amllLyricLines.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center select-none">
        <span className="text-[18px] text-white/40">
          纯音乐，请欣赏
        </span>
      </div>
    );
  }

  return (
    <div
      className="w-full h-full relative overflow-hidden select-none"
      style={{
        maskImage:
          'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)',
      }}
    >
      <LyricPlayer
        lyricPlayer={RefinedLyricPlayer}
        lyricLines={amllLyricLines}
        currentTime={currentTimeMs}
        playing={isPlaying}
        enableSpring={true}
        enableBlur={true}
        enableScale={true}
        alignPosition={0.48}
        alignAnchor="center"
        wordFadeWidth={0.5}
        onLyricLineClick={(e) => {
          const line = lyrics[e.lineIndex];
          if (line) {
            requestSeek(line.time);
          }
        }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
