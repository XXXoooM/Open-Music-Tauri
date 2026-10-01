import { RefreshCw, ExternalLink, Music2 } from 'lucide-react';
import { useUpdaterStore } from '../../stores/updaterStore';

export default function AboutSection() {
  const isChecking = useUpdaterStore((s) => s.isChecking);
  const checkForUpdates = useUpdaterStore((s) => s.checkForUpdates);

  const handleOpenGitHub = () => {
    window.open('https://github.com/XXXoooM/Open-Music-Tauri', '_blank');
  };

  return (
    <section className="mb-[16px] pt-[8px] border-t border-[var(--border)]">
      <h3 className="text-[13px] font-semibold text-[var(--text-tertiary)] uppercase tracking-[0.06em] mb-[16px]">
        关于与更新
      </h3>

      <div className="flex flex-col gap-[14px]">
        <div className="flex items-center gap-[14px] p-[12px] rounded-[var(--radius-md)] bg-[var(--hover)]">
          <div className="w-[44px] h-[44px] rounded-[var(--radius-sm)] bg-[var(--dynamic-accent)] text-white flex items-center justify-center shadow-sm shrink-0">
            <Music2 className="w-[24px] h-[24px]" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-[8px]">
              <span className="text-[15px] font-bold text-[var(--text-primary)]">Open-Music</span>
              <span className="px-[6px] py-[1px] rounded-full text-[11px] font-semibold bg-[var(--active)] text-[var(--text-secondary)]">
                v0.1.7
              </span>
            </div>
            <span className="text-[12px] text-[var(--text-tertiary)] mt-[2px]">
              优雅沉浸的 Apple Music 风格桌面音乐播放器
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[14px] text-[var(--text-primary)]">软件版本检测</span>
          <button
            type="button"
            disabled={isChecking}
            onClick={() => void checkForUpdates(false)}
            className="flex items-center gap-[6px] px-[14px] py-[6px] rounded-full bg-[var(--hover)] hover:bg-[var(--active)] text-[13px] text-[var(--text-primary)] font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-[13px] h-[13px] ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? '正在检查...' : '检查更新'}</span>
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[14px] text-[var(--text-primary)]">开源主页</span>
          <button
            type="button"
            onClick={handleOpenGitHub}
            className="flex items-center gap-[4px] text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <span>GitHub 仓库</span>
            <ExternalLink className="w-[13px] h-[13px]" />
          </button>
        </div>
      </div>
    </section>
  );
}
