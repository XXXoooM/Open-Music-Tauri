import { useEffect, useRef } from 'react';

interface FluidCanvasProps {
  coverUrl: string;
  isPlaying: boolean;
}

export default function FluidCanvas({ coverUrl, isPlaying }: FluidCanvasProps) {
  const c1 = useRef<HTMLCanvasElement>(null);
  const c2 = useRef<HTMLCanvasElement>(null);
  const c3 = useRef<HTMLCanvasElement>(null);
  const c4 = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!coverUrl) return;
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img;
      const hw = w / 2;
      const hh = h / 2;
      const list = [
        { ref: c1, sx: 0, sy: 0 },
        { ref: c2, sx: hw, sy: 0 },
        { ref: c3, sx: 0, sy: hh },
        { ref: c4, sx: hw, sy: hh },
      ];
      list.forEach(({ ref, sx, sy }) => {
        const ctx = ref.current?.getContext('2d');
        if (ctx) {
          ctx.filter = 'blur(6px)';
          ctx.drawImage(img, sx, sy, hw, hh, 0, 0, 100, 100);
        }
      });
    };
    img.src = coverUrl;
  }, [coverUrl]);

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className={`rnp-fluid-rect w-[max(115vw,115vh)] h-[max(115vw,115vh)] relative ${
          isPlaying ? '' : 'rnp-paused'
        }`}
        style={{
          filter: 'var(--dynamic-fluid-filter, saturate(1.5) brightness(0.88)) url(#rnp-fluid-filter)',
        }}
      >
        <canvas
          ref={c1}
          width={100}
          height={100}
          className="rnp-fluid-canvas absolute left-[10%] top-[10%] w-[60%] h-[60%] rounded-full opacity-90"
          style={{ animationDelay: '0s' }}
        />
        <canvas
          ref={c2}
          width={100}
          height={100}
          className="rnp-fluid-canvas absolute right-[10%] top-[10%] w-[60%] h-[60%] rounded-full opacity-90"
          style={{ animationDelay: '-5s' }}
        />
        <canvas
          ref={c3}
          width={100}
          height={100}
          className="rnp-fluid-canvas absolute left-[10%] bottom-[10%] w-[60%] h-[60%] rounded-full opacity-90"
          style={{ animationDelay: '-10s' }}
        />
        <canvas
          ref={c4}
          width={100}
          height={100}
          className="rnp-fluid-canvas absolute right-[10%] bottom-[10%] w-[60%] h-[60%] rounded-full opacity-90"
          style={{ animationDelay: '-15s' }}
        />
      </div>
    </div>
  );
}
