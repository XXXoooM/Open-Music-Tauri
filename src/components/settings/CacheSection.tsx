import { useState, useEffect } from 'react';
import { getCacheStats, clearAllCaches } from '../../services/cacheManager';

export default function CacheSection() {
  const [stats, setStats] = useState<{ count: number; sizeFormatted: string }>({
    count: 0,
    sizeFormatted: '0 KB',
  });
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const s = await getCacheStats();
      if (!cancelled) setStats(s);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleClear = async () => {
    await clearAllCaches();
    setStats({ count: 0, sizeFormatted: '0 KB' });
    setCleared(true);
    setTimeout(() => setCleared(false), 2000);
  };

  return (
    <section className="mb-[32px]">
      <h3 className="text-[13px] font-semibold text-[var(--text-tertiary)] uppercase tracking-[0.06em] mb-[12px]">
        缓存与存储 (IndexedDB)
      </h3>
      <div className="flex flex-col gap-[10px]">
        <div className="h-[44px] flex items-center justify-between">
          <span className="text-[14px] text-[var(--text-primary)]">当前缓存占用</span>
          <span className="text-[13px] text-[var(--text-secondary)] tabular-nums">
            {stats.count} 项 ({stats.sizeFormatted})
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[var(--text-tertiary)]">包含歌词、歌单及封面色板</span>
          <button
            type="button"
            onClick={() => void handleClear()}
            className="px-[12px] py-[6px] text-[13px] font-medium rounded-[var(--radius-sm)] border border-[var(--border)] text-[var(--text-primary)] bg-[var(--hover)] hover:bg-[var(--active)] transition-colors duration-[var(--duration-hover)] cursor-pointer"
          >
            {cleared ? '已清空' : '清空缓存'}
          </button>
        </div>
      </div>
    </section>
  );
}
