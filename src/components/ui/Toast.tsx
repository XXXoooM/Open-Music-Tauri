import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useToastStore, type ToastMessage } from '../../stores/toastStore';

export default function Toast() {
  const toasts = useToastStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-[96px] left-1/2 -translate-x-1/2 z-[300] flex flex-col items-center gap-[8px] pointer-events-none select-none">
      {toasts.map((toast: ToastMessage) => (
        <div
          key={toast.id}
          className="flex items-center gap-[8px] px-[14px] py-[8px] rounded-full border border-[var(--border)] shadow-[var(--shadow-panel)] text-[13px] text-[var(--text-primary)] font-medium transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 pointer-events-auto"
          style={{
            background: 'var(--material-card)',
            backdropFilter: 'blur(var(--blur-panel))',
            WebkitBackdropFilter: 'blur(var(--blur-panel))',
          }}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-[15px] h-[15px] text-[var(--dynamic-accent)] shrink-0" />}
          {toast.type === 'warning' && <AlertCircle className="w-[15px] h-[15px] text-[var(--accent)] shrink-0" />}
          {toast.type === 'info' && <Info className="w-[15px] h-[15px] text-[var(--text-secondary)] shrink-0" />}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
