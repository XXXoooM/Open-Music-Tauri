import { Minus, Square, X } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { isTauri } from '../../env';

export default function WindowControls() {
  if (!isTauri) return null;

  const handleMinimize = () => {
    void getCurrentWindow().minimize();
  };

  const handleToggleMaximize = () => {
    void getCurrentWindow().toggleMaximize();
  };

  const handleClose = () => {
    void getCurrentWindow().close();
  };

  return (
    <div className="flex items-center gap-[2px] no-drag ml-[8px]">
      <button
        type="button"
        title="最小化"
        aria-label="最小化"
        onClick={handleMinimize}
        className="w-[32px] h-[32px] rounded-[var(--radius-sm)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)] transition-colors cursor-pointer"
      >
        <Minus className="w-[14px] h-[14px]" />
      </button>

      <button
        type="button"
        title="最大化 / 还原"
        aria-label="最大化"
        onClick={handleToggleMaximize}
        className="w-[32px] h-[32px] rounded-[var(--radius-sm)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)] transition-colors cursor-pointer"
      >
        <Square className="w-[12px] h-[12px]" />
      </button>

      <button
        type="button"
        title="关闭应用"
        aria-label="关闭"
        onClick={handleClose}
        className="w-[32px] h-[32px] rounded-[var(--radius-sm)] flex items-center justify-center text-[var(--text-secondary)] hover:text-white hover:bg-[#e81123] transition-colors cursor-pointer"
      >
        <X className="w-[14px] h-[14px]" />
      </button>
    </div>
  );
}
