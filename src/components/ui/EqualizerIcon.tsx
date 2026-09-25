interface EqualizerIconProps {
  isPlaying?: boolean;
}

/**
 * Apple Music 原生三柱律动跳跃波形指示器
 */
export default function EqualizerIcon({ isPlaying = true }: EqualizerIconProps) {
  return (
    <div
      aria-label="正在播放"
      className="flex items-end justify-center gap-[2px] w-[14px] h-[14px] overflow-hidden"
    >
      <span
        className={`w-[2.5px] rounded-full bg-[var(--dynamic-accent)] transition-all ${
          isPlaying ? 'animate-eq-1' : 'h-[5px]'
        }`}
      />
      <span
        className={`w-[2.5px] rounded-full bg-[var(--dynamic-accent)] transition-all ${
          isPlaying ? 'animate-eq-2' : 'h-[11px]'
        }`}
      />
      <span
        className={`w-[2.5px] rounded-full bg-[var(--dynamic-accent)] transition-all ${
          isPlaying ? 'animate-eq-3' : 'h-[7px]'
        }`}
      />
    </div>
  );
}
