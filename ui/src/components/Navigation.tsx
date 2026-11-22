import type { HTMLAttributes, ReactNode } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { cn } from '../lib/cn';
import { Wordmark } from './Brand';

export interface DockItem {
  id: string;
  label: string;
  icon: ReactNode;
  href?: string;
}

export interface DockProps extends HTMLAttributes<HTMLElement> {
  /** Usually 4 items: Home, Explore | Books, My Library. The centre button sits between items 2 and 3. */
  items: DockItem[];
  activeId: string;
  onNavigate?: (id: string) => void;
  /** Centre action (new chat). */
  centerLabel?: string;
  onCenter?: () => void;
  /** Accessible name of the navigation landmark. */
  label?: string;
  /** Fixed to the bottom of the viewport (default) or static (for docs). */
  fixed?: boolean;
}

/** Bottom navigation dock with the gold centre action. */
export function Dock({ items, activeId, onNavigate, centerLabel = 'New conversation', onCenter, label = 'Primary', fixed = true, className, ...rest }: DockProps) {
  const half = Math.ceil(items.length / 2);
  const item = (it: DockItem) => {
    const on = it.id === activeId;
    const cls = cn(
      'focus-ring flex h-[50px] min-w-[56px] flex-col items-center justify-center gap-[5px] rounded-full px-2 text-2xs leading-none font-medium text-dock-fg transition-opacity [&_svg]:size-5',
      on ? 'opacity-100' : 'opacity-70 hover:opacity-100',
    );
    const inner = (
      <>
        {it.icon}
        <span className={cn('whitespace-nowrap', on && 'underline decoration-gold decoration-2 underline-offset-[5px]')}>{it.label}</span>
      </>
    );
    return it.href ? (
      <a key={it.id} href={it.href} aria-current={on ? 'page' : undefined} className={cls} onClick={() => onNavigate?.(it.id)}>
        {inner}
      </a>
    ) : (
      <button key={it.id} type="button" aria-current={on ? 'page' : undefined} className={cn(cls, 'cursor-pointer')} onClick={() => onNavigate?.(it.id)}>
        {inner}
      </button>
    );
  };
  return (
    <nav
      aria-label={label}
      className={cn(
        'glass z-40 flex h-[52px] items-center gap-1 rounded-full px-2',
        fixed && 'fixed bottom-[max(16px,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2',
        className,
      )}
      {...rest}
    >
      {items.slice(0, half).map(item)}
      <button
        type="button"
        aria-label={centerLabel}
        onClick={onCenter}
        className="focus-ring mx-1 grid size-11 cursor-pointer place-items-center rounded-full bg-gold text-[#0e1220] shadow-[0_0_24px_rgb(235_193_122/0.55)] transition-[filter] hover:brightness-110"
      >
        <Sparkles size={20} aria-hidden="true" />
      </button>
      {items.slice(half).map(item)}
    </nav>
  );
}

export interface AppHeaderProps extends HTMLAttributes<HTMLElement> {
  /** Actions at the end edge (language, theme, favourites, profile). */
  actions?: ReactNode;
  /** Replace the logo with a back pill (book chat). */
  back?: { label: string; onClick: () => void };
  /** Custom start content (overrides logo/back). */
  start?: ReactNode;
}

/** Top bar: logo (or back) at the start, glass actions at the end. */
export function AppHeader({ actions, back, start, className, ...rest }: AppHeaderProps) {
  return (
    <header className={cn('flex h-16 items-center justify-between gap-4 px-5 md:px-8', className)} {...rest}>
      <div className="flex min-w-0 items-center">
        {start ??
          (back ? (
            <button
              type="button"
              onClick={back.onClick}
              className="focus-ring glass inline-flex h-chip cursor-pointer items-center gap-1.5 rounded-full ps-2 pe-3.5 text-sm font-medium text-fg"
            >
              <ArrowLeft size={16} className="rtl:-scale-x-100" aria-hidden="true" />
              {back.label}
            </button>
          ) : (
            <a href="/" className="focus-ring rounded-md">
              <Wordmark />
            </a>
          ))}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
