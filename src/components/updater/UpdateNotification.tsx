import { Sparkles, X, Download } from 'lucide-react';
import { useUpdaterStore } from '../../stores/updaterStore';

export default function UpdateNotification() {
  const updateAvailable = useUpdaterStore((s) => s.updateAvailable);
  const newVersion = useUpdaterStore((s) => s.newVersion);
  const releaseNotes = useUpdaterStore((s) => s.releaseNotes);
  const isDownloading = useUpdaterStore((s) => s.isDownloading);
  const downloadProgress = useUpdaterStore((s) => s.downloadProgress);
  const downloadAndInstall = useUpdaterStore((s) => s.downloadAndInstall);
  const dismissUpdate = useUpdaterStore((s) => s.dismissUpdate);

  if (!updateAvailable) return null;

  return (
    <div
      className="fixed top-[20px] right-[24px] z-[250] w-[340px] rounded-[var(--radius-lg)] border border-[var(--border)] shadow-[var(--shadow-modal)] p-[18px] flex flex-col gap-[12px] text-[var(--text-primary)] animate-in fade-in slide-in-from-top-3 duration-300"
      style={{
        background: 'var(--material-card)',
        backdropFilter: 'blur(var(--blur-panel))',
        WebkitBackdropFilter: 'blur(var(--blur-panel))',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[8px]">
          <div className="w-[28px] h-[28px] rounded-full bg-[var(--dynamic-accent)]/20 text-[var(--dynamic-accent)] flex items-center justify-center shrink-0">
            <Sparkles className="w-[15px] h-[15px]" />
          </div>
          <span className="text-[14px] font-semibold">发现新版本 {newVersion}</span>
        </div>
        {!isDownloading && (
          <button
            type="button"
            onClick={dismissUpdate}
            className="p-[4px] rounded-full text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <X className="w-[14px] h-[14px]" />
          </button>
        )}
      </div>

      {releaseNotes && (
        <p className="text-[12px] text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
          {releaseNotes}
        </p>
      )}

      {isDownloading ? (
        <div className="flex flex-col gap-[6px] mt-[2px]">
          <div className="flex justify-between text-[11px] text-[var(--text-tertiary)] tabular-nums">
            <span>正在下载更新...</span>
            <span>{downloadProgress}%</span>
          </div>
          <div className="w-full h-[4px] rounded-full bg-[var(--hover)] overflow-hidden">
            <div
              className="h-full bg-[var(--dynamic-accent)] transition-all duration-200"
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="flex justify-end gap-[8px] mt-[4px]">
          <button
            type="button"
            onClick={dismissUpdate}
            className="px-[12px] py-[5px] rounded-full text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)] transition-colors cursor-pointer"
          >
            稍后提醒
          </button>
          <button
            type="button"
            onClick={() => void downloadAndInstall()}
            className="flex items-center gap-[5px] px-[16px] py-[5px] rounded-full bg-[var(--text-primary)] text-[var(--material-card)] font-medium text-[12px] hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
          >
            <Download className="w-[13px] h-[13px]" />
            <span>立即更新并重启</span>
          </button>
        </div>
      )}
    </div>
  );
}
