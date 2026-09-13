import { useState } from 'react';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  options: readonly SegmentedOption<T>[] | SegmentedOption<T>[];
  value: T;
  onChange(value: T): void;
}

export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const [hoveredValue, setHoveredValue] = useState<T | null>(null);

  return (
    <div
      role="radiogroup"
      className="inline-flex items-center h-[28px] p-[2px] rounded-[var(--radius-sm)] bg-[var(--hover)] select-none shrink-0"
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        const isHovered = hoveredValue === option.value;

        // 显示优先级：选中 > 悬停 > 默认
        const bg = isSelected
          ? 'var(--overlay-15)'
          : isHovered
            ? 'var(--hover)'
            : undefined;
        const color =
          isSelected || isHovered ? 'var(--text-primary)' : 'var(--text-secondary)';

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option.value)}
            onMouseEnter={() => setHoveredValue(option.value)}
            onMouseLeave={() => setHoveredValue(null)}
            className="px-[10px] h-full flex items-center justify-center text-[12px] rounded-[var(--radius-sm)] cursor-pointer transition-colors duration-[var(--duration-hover)] ease-[var(--ease-apple)]"
            style={{
              backgroundColor: bg,
              color,
              fontWeight: isSelected ? 500 : 400,
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
