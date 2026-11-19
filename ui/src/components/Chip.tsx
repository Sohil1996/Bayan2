import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Toggle state. Sets aria-pressed; omit for a plain action chip. */
  selected?: boolean;
  icon?: ReactNode;
}

/** Glass pill used for categories and filters (home categories, Books filters). */
export const Chip = forwardRef<HTMLButtonElement, ChipProps>(function Chip(
  { selected, icon, className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-pressed={selected === undefined ? undefined : selected}
      className={cn(
        'focus-ring inline-flex h-chip shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-[13px] text-sm font-medium whitespace-nowrap transition-[filter,box-shadow] duration-200',
        selected ? 'surface-tab-on border' : 'glass text-fg hover:brightness-110',
        '[&_svg]:size-[15px] [&_svg]:shrink-0',
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
});

/** Follow-up suggestion under an assistant message (gradient blue to gold edge). */
export const SuggestionChip = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(function SuggestionChip(
  { className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      dir="auto"
      className={cn(
        'focus-ring surface-suggestion inline-flex h-chip max-w-full shrink-0 cursor-pointer items-center rounded-full px-3 text-sm font-medium text-fg-strong transition-[filter] hover:brightness-110',
        className,
      )}
      {...rest}
    >
      <span className="truncate">{children}</span>
    </button>
  );
});

/** Small non-interactive label (genre, language). */
export function Tag({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      dir="auto"
      className={cn('inline-flex items-center rounded-full bg-tag px-2 py-px text-2xs font-medium text-tag-fg', className)}
      {...rest}
    />
  );
}
