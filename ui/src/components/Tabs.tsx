import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface TabItem<T extends string> {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
  /** Content of the panel. Omit to use Tabs as a pure switcher and render panels yourself. */
  panel?: ReactNode;
}

export interface TabsProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Accessible name for the tab list. */
  label: string;
  /** Stretch tabs to share the width equally (book-chat column). */
  fill?: boolean;
  className?: string;
}

/**
 * Pill tabs with full keyboard support (arrow keys follow the reading direction, Home/End).
 * Used for the book-chat column (This book / Characters / Places / Timeline) and the profile.
 */
export function Tabs<T extends string>({ items, value, onChange, label, fill, className }: TabsProps<T>) {
  const base = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const idx = Math.max(0, items.findIndex((i) => i.value === value));

  const onKey = (e: KeyboardEvent) => {
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const next = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 } as Record<string, number>;
    let to = -1;
    if (e.key in next) to = (idx + next[e.key] + items.length) % items.length;
    if (e.key === 'Home') to = 0;
    if (e.key === 'End') to = items.length - 1;
    if (to < 0) return;
    e.preventDefault();
    onChange(items[to].value);
    refs.current[to]?.focus();
  };

  const active = items[idx];
  return (
    <div className={className}>
      <div role="tablist" aria-label={label} onKeyDown={onKey} className={cn('flex gap-2', fill && '[&>*]:flex-1')}>
        {items.map((it, i) => {
          const on = i === idx;
          return (
            <button
              key={it.value}
              ref={(el) => {
                refs.current[i] = el;
              }}
              id={`${base}-t-${it.value}`}
              role="tab"
              type="button"
              aria-selected={on}
              aria-controls={it.panel !== undefined ? `${base}-p-${it.value}` : undefined}
              tabIndex={on ? 0 : -1}
              onClick={() => onChange(it.value)}
              className={cn(
                'focus-ring inline-flex h-control cursor-pointer items-center justify-center gap-2.5 rounded-full border px-4 text-[0.90625rem] font-medium whitespace-nowrap transition-[box-shadow,background,color] duration-200 [&_svg]:size-[18px]',
                on ? 'surface-tab-on' : 'glass text-fg',
              )}
            >
              {it.icon}
              {it.label}
            </button>
          );
        })}
      </div>
      {active?.panel !== undefined && (
        <div role="tabpanel" id={`${base}-p-${active.value}`} aria-labelledby={`${base}-t-${active.value}`} tabIndex={0} className="mt-4 focus-ring rounded-card">
          {active.panel}
        </div>
      )}
    </div>
  );
}
