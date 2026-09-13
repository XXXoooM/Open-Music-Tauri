export interface SwitchProps {
  checked: boolean;
  onChange(checked: boolean): void;
  'aria-label': string;
}

export default function Switch({ checked, onChange, 'aria-label': ariaLabel }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className="w-[36px] h-[20px] rounded-[var(--radius-full)] relative p-[2px] cursor-pointer transition-colors duration-[var(--duration-hover)] ease-[var(--ease-apple)] shrink-0"
      style={{
        backgroundColor: checked ? 'var(--accent)' : 'var(--overlay-15)',
      }}
    >
      <span
        className="w-[16px] h-[16px] rounded-[var(--radius-full)] bg-[var(--text-primary)] absolute top-[2px] transition-[left] duration-[var(--duration-hover)] ease-[var(--ease-apple)] shadow-sm"
        style={{
          left: checked ? '18px' : '2px',
        }}
      />
    </button>
  );
}
