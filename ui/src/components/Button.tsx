import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';

export type ButtonVariant = 'primary' | 'gold' | 'glass' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * - `primary`: main action. Gold in dark, navy in light (send, continue).
   * - `gold`: gold in both themes (Sign in, Pay).
   * - `glass`: secondary action on imagery.
   * - `outline`: glowing gold outline (Read summary, Change characters).
   * - `ghost`: low-emphasis text action.
   * - `danger`: destructive (Sign out, Delete).
   */
  variant?: ButtonVariant;
  /** sm = 30px, md = 44px (minimum touch target), lg = 50px */
  size?: ButtonSize;
  /** Icon before the label. Placed at the start edge, so it follows RTL. */
  iconStart?: ReactNode;
  /** Icon after the label. */
  iconEnd?: ReactNode;
  /** Stretch to the container width. */
  block?: boolean;
  /** Shows a spinner, disables the button and sets aria-busy. */
  loading?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-fg shadow-primary hover:brightness-110',
  gold: 'bg-gold text-[#0d0f17] shadow-[0_8px_28px_rgb(235_193_122/0.3)] hover:brightness-105',
  glass: 'glass text-fg hover:brightness-110',
  outline: 'surface-outline-gold text-fg-strong hover:brightness-110',
  ghost: 'text-fg-muted hover:bg-line-soft hover:text-fg',
  danger: 'text-danger hover:bg-danger/10',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-chip gap-1.5 px-3 text-sm',
  md: 'h-control gap-3 px-[18px] text-md',
  lg: 'h-field gap-3 px-6 text-md',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', iconStart, iconEnd, block, loading, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'focus-ring inline-flex shrink-0 cursor-pointer select-none items-center justify-center rounded-full font-medium whitespace-nowrap transition-[filter,background-color,color,transform] duration-200 ease-out-soft active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        variant === 'gold' && 'font-semibold',
        block && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? <Spinner /> : iconStart}
      {children}
      {iconEnd}
    </button>
  );
});

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required: the accessible name (icon buttons have no visible text). */
  'aria-label': string;
  /** sm = 30px, md = 40px, lg = 44px. The app's header uses sm; chat actions use md/lg. */
  size?: 'sm' | 'md' | 'lg';
  variant?: 'glass' | 'primary' | 'ghost';
  /** Mirror the icon in RTL (use for arrows and chevrons, never for logos or media controls). */
  flipInRtl?: boolean;
  children: ReactNode;
}

const iconSizes = { sm: 'size-chip', md: 'size-10', lg: 'size-control' };

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { size = 'md', variant = 'glass', flipInRtl, className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'focus-ring inline-grid shrink-0 cursor-pointer place-items-center rounded-full transition-[filter,background-color,transform] duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50',
        iconSizes[size],
        variant === 'glass' && 'glass text-fg hover:brightness-110',
        variant === 'primary' && 'bg-primary text-primary-fg shadow-primary hover:brightness-110',
        variant === 'ghost' && 'text-fg-subtle hover:bg-line-soft hover:text-fg',
        flipInRtl && '[&_svg]:rtl:-scale-x-100',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
});

export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cn('size-4 animate-spin', className)} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
