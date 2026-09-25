import { useState } from 'react';
import { X, Loader2, Plus, Download } from 'lucide-react';
import { useLibraryStore } from '../../stores/libraryStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { parsePlaylistId, fetchPlaylist } from '../../services/musicApi';

interface ModalProps {
  isOpen: boolean;
  onClose(): void;
}

export default function CreatePlaylistModal({ isOpen, onClose }: ModalProps) {
  const [mode, setMode] = useState<'create' | 'import'>('create');
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [importInput, setImportInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const apiSource = useSettingsStore((s) => s.apiSource);
  const createPlaylist = useLibraryStore((s) => s.createPlaylist);
  const importPlaylist = useLibraryStore((s) => s.importPlaylist);

  if (!isOpen) return null;

  const handleCreate = () => {
    if (!name.trim()) return setErrorMsg('请输入歌单名称');
    createPlaylist(name.trim(), desc.trim());
    onClose();
  };

  const handleImport = async () => {
    const id = parsePlaylistId(importInput);
    if (!id) return setErrorMsg('请输入正确的网易云歌单链接或纯数字 ID');
    setIsLoading(true);
    setErrorMsg('');
    try {
      const tracks = await fetchPlaylist(id, apiSource);
      if (!tracks?.length) throw new Error('歌单为空');
      const title = name.trim() || `网易云歌单 (${id})`;
      importPlaylist(title, tracks, `从网易云导入，共 ${tracks.length} 首歌曲`);
      onClose();
    } catch {
      setErrorMsg('导入歌单失败，请检查网络或歌单 ID 是否有效');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-[20px] bg-black/60 backdrop-blur-[var(--blur-panel)]">
      <div onClick={(e) => e.stopPropagation()} className="w-[400px] max-w-full rounded-[var(--radius-lg)] border border-[var(--border)] shadow-[var(--shadow-modal)] p-[20px] flex flex-col gap-[14px] text-[var(--text-primary)]" style={{ background: 'var(--material-card)' }}>
        <div className="flex items-center justify-between">
          <div className="flex gap-[6px]">
            <button type="button" onClick={() => { setMode('create'); setErrorMsg(''); }} className={`flex items-center gap-[4px] px-[10px] py-[5px] rounded-full text-[12px] font-medium cursor-pointer ${mode === 'create' ? 'bg-[var(--text-primary)] text-[var(--material-card)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
              <Plus className="w-[13px] h-[13px]" /><span>新建歌单</span>
            </button>
            <button type="button" onClick={() => { setMode('import'); setErrorMsg(''); }} className={`flex items-center gap-[4px] px-[10px] py-[5px] rounded-full text-[12px] font-medium cursor-pointer ${mode === 'import' ? 'bg-[var(--text-primary)] text-[var(--material-card)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
              <Download className="w-[13px] h-[13px]" /><span>导入歌单</span>
            </button>
          </div>
          <button type="button" onClick={onClose} className="p-[4px] rounded-full text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"><X className="w-[15px] h-[15px]" /></button>
        </div>

        <div className="flex flex-col gap-[10px]">
          <div>
            <label className="text-[12px] text-[var(--text-secondary)] mb-[4px] block">歌单名称</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={mode === 'create' ? '如：我的心动歌单' : '留空则使用默认歌单名'} className="w-full h-[34px] px-[10px] rounded-[var(--radius-sm)] text-[13px] text-[var(--text-primary)] outline-none bg-[var(--hover)] focus:bg-[var(--active)] border border-transparent focus:border-[var(--border)]" />
          </div>
          {mode === 'create' ? (
            <div>
              <label className="text-[12px] text-[var(--text-secondary)] mb-[4px] block">简介（可选）</label>
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="为你的歌单写一段简介..." rows={2} className="w-full px-[10px] py-[6px] rounded-[var(--radius-sm)] text-[13px] text-[var(--text-primary)] outline-none bg-[var(--hover)] focus:bg-[var(--active)] border border-transparent focus:border-[var(--border)] resize-none" />
            </div>
          ) : (
            <div>
              <label className="text-[12px] text-[var(--text-secondary)] mb-[4px] block">网易云歌单链接或 ID</label>
              <input type="text" value={importInput} onChange={(e) => setImportInput(e.target.value)} placeholder="如 3778678 或网易云分享链接" className="w-full h-[34px] px-[10px] rounded-[var(--radius-sm)] text-[13px] text-[var(--text-primary)] outline-none bg-[var(--hover)] focus:bg-[var(--active)] border border-transparent focus:border-[var(--border)]" />
            </div>
          )}
          {errorMsg && <p className="text-[12px] text-[var(--accent)]">{errorMsg}</p>}
        </div>

        <div className="flex justify-end gap-[8px] mt-[2px]">
          <button type="button" onClick={onClose} className="px-[12px] py-[5px] rounded-full text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)] cursor-pointer">取消</button>
          <button type="button" disabled={isLoading} onClick={mode === 'create' ? handleCreate : handleImport} className="flex items-center gap-[4px] px-[16px] py-[5px] rounded-full bg-[var(--text-primary)] text-[var(--material-card)] font-medium text-[12px] hover:opacity-90 disabled:opacity-50 cursor-pointer">
            {isLoading && <Loader2 className="w-[12px] h-[12px] animate-spin" />}
            <span>{mode === 'create' ? '立即创建' : '开始导入'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
