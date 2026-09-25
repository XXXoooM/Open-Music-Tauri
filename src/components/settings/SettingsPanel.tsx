import { X } from 'lucide-react';
import SegmentedControl from '../ui/SegmentedControl';
import Switch from '../ui/Switch';
import Slider from '../ui/Slider';
import CacheSection from './CacheSection';
import { useSettingsStore } from '../../stores/settingsStore';

interface SettingsPanelProps {
  /** 是否展开显示 */
  isOpen: boolean;
  /** 关闭回调 */
  onClose(): void;
}

const BG_OPTIONS = [
  { value: 'gradient' as const, label: '渐变' },
  { value: 'fluid' as const, label: '流体' },
  { value: 'solid' as const, label: '纯色' },
  { value: 'blur' as const, label: '模糊' },
];

const THEME_OPTIONS = [
  { value: 'system' as const, label: '跟随系统' },
  { value: 'dark' as const, label: '深色' },
  { value: 'light' as const, label: '浅色' },
];

const FONT_OPTIONS = [
  { value: 'small' as const, label: '小' },
  { value: 'medium' as const, label: '中' },
  { value: 'large' as const, label: '大' },
];

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const store = useSettingsStore();

  return (
    <>
      {/* 点击遮罩关闭面板（仅打开时生效） */}
      {isOpen && (
        <div className="fixed inset-0" style={{ zIndex: 199 }} onClick={onClose} />
      )}

      <aside
        data-region="settings-panel"
        className={`fixed top-0 right-0 h-full w-[420px] flex flex-col overflow-hidden transition-transform duration-[var(--duration-panel)] ease-[var(--ease-apple)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          zIndex: 200,
          background: 'var(--material-content)',
          backdropFilter: 'blur(var(--blur-panel))',
          WebkitBackdropFilter: 'blur(var(--blur-panel))',
          borderTopLeftRadius: 'var(--radius-lg)',
          borderBottomLeftRadius: 'var(--radius-lg)',
          boxShadow: isOpen ? 'var(--shadow-panel)' : 'none',
        }}
      >
        {/* 顶部栏 56px */}
        <header className="h-[56px] px-[24px] flex items-center justify-between shrink-0">
          <h2 className="text-[17px] font-semibold text-[var(--text-primary)]">设置</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭设置"
            className="w-[28px] h-[28px] rounded-[var(--radius-sm)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)] transition-colors duration-[var(--duration-hover)] ease-[var(--ease-apple)] cursor-pointer"
          >
            <X className="w-[18px] h-[18px]" />
          </button>
        </header>

        {/* 可滚动内容区 */}
        <div className="flex-1 overflow-y-auto px-[24px] pb-[24px]">
          {/* 分区 1：外观 */}
          <section className="mb-[32px]">
            <h3 className="text-[13px] font-semibold text-[var(--text-tertiary)] uppercase tracking-[0.06em] mb-[12px]">外观</h3>
            <div className="flex flex-col">
              <div className="h-[44px] flex items-center justify-between">
                <span className="text-[14px] text-[var(--text-primary)]">背景模式</span>
                <SegmentedControl options={BG_OPTIONS} value={store.backgroundMode} onChange={store.setBackgroundMode} />
              </div>
              <div className="h-[44px] flex items-center justify-between">
                <span className="text-[14px] text-[var(--text-primary)]">主题</span>
                <SegmentedControl options={THEME_OPTIONS} value={store.theme} onChange={store.setTheme} />
              </div>
              <div className="h-[44px] flex items-center justify-between">
                <span className="text-[14px] text-[var(--text-primary)]">强调色来源</span>
                <span className="text-[13px] text-[var(--text-secondary)]">跟随封面</span>
              </div>
            </div>
          </section>

          {/* 分区 2：歌词 */}
          <section className="mb-[32px]">
            <h3 className="text-[13px] font-semibold text-[var(--text-tertiary)] uppercase tracking-[0.06em] mb-[12px]">歌词</h3>
            <div className="flex flex-col">
              <div className="h-[44px] flex items-center justify-between">
                <span className="text-[14px] text-[var(--text-primary)]">字号</span>
                <SegmentedControl options={FONT_OPTIONS} value={store.lyricFontSize} onChange={store.setLyricFontSize} />
              </div>
              <div className="h-[44px] flex items-center justify-between">
                <span className="text-[14px] text-[var(--text-primary)]">显示逐词高亮</span>
                <Switch checked={store.showWordHighlight} onChange={store.setShowWordHighlight} aria-label="显示逐词高亮" />
              </div>
              <div className="h-[44px] flex items-center justify-between">
                <span className="text-[14px] text-[var(--text-primary)]">隐藏无歌词歌曲的歌词区</span>
                <Switch checked={store.hideLyricsWhenEmpty} onChange={store.setHideLyricsWhenEmpty} aria-label="隐藏无歌词歌曲的歌词区" />
              </div>
            </div>
          </section>

          {/* 分区 3：播放 */}
          <section className="mb-[32px]">
            <h3 className="text-[13px] font-semibold text-[var(--text-tertiary)] uppercase tracking-[0.06em] mb-[12px]">播放</h3>
            <div className="flex flex-col">
              <div className="h-[44px] flex items-center justify-between">
                <span className="text-[14px] text-[var(--text-primary)]">淡入淡出</span>
                <Switch checked={store.crossfadeEnabled} onChange={store.setCrossfadeEnabled} aria-label="淡入淡出" />
              </div>
              <div className="h-[44px] flex items-center justify-between">
                <span className="text-[14px] text-[var(--text-primary)]">交叉淡入时长</span>
                <div className="flex items-center gap-[8px]">
                  <Slider value={store.crossfadeDuration} min={0} max={12} step={1} onChange={store.setCrossfadeDuration} aria-label="交叉淡入时长" />
                  <span className="text-[13px] text-[var(--text-secondary)] tabular-nums w-[24px] text-right">
                    {store.crossfadeDuration}s
                  </span>
                </div>
              </div>
              <div className="h-[44px] flex items-center justify-between">
                <span className="text-[14px] text-[var(--text-primary)]">无缝播放</span>
                <Switch checked={store.gaplessPlayback} onChange={store.setGaplessPlayback} aria-label="无缝播放" />
              </div>
            </div>
          </section>

          {/* 分区 4：缓存与存储 */}
          <CacheSection />
        </div>
      </aside>
    </>
  );
}
