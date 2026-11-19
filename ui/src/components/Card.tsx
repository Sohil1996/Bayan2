import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '../lib/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * - `card`: translucent card with thin gold (dark) / navy (light) edge. Lists, recommendations.
   * - `panel`: frosted panel for forms and dialogs (sign-in card).
   * - `glass`: lighter glass, for floating bars.
   */
  surface?: 'card' | 'panel' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const pads = { none: '', sm: 'p-2.5', md: 'p-5', lg: 'p-[34px]' };

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card({ surface = 'card', padding = 'sm', className, ...rest }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        surface === 'card' && 'surface-card rounded-card',
        surface === 'panel' && 'surface-panel rounded-panel',
        surface === 'glass' && 'glass rounded-card',
        pads[padding],
        className,
      )}
      {...rest}
    />
  );
});

export interface ListItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'title'> {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Image URL for the thumbnail (cover, place photo or portrait). */
  image?: string;
  /** Round thumbnail for people. */
  round?: boolean;
  /** Custom leading element instead of an image. */
  leading?: ReactNode;
  /** Trailing element; defaults to a chevron that mirrors in RTL. */
  trailing?: ReactNode;
}

/**
 * The standard list row of the app: places, characters, books in a duo, saved items.
 * 86px tall with a 66px thumbnail. The whole row is one button.
 */
export const ListItem = forwardRef<HTMLButtonElement, ListItemProps>(function ListItem(
  { title, subtitle, image, round, leading, trailing, className, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'focus-ring surface-card flex min-h-[86px] w-full cursor-pointer items-center gap-3.5 rounded-card p-2.5 text-start transition-[filter,transform] duration-200 hover:brightness-110 active:scale-[0.99]',
        className,
      )}
      {...rest}
    >
      {leading ??
        (image && (
          <img src={image} alt="" loading="lazy" className={cn('size-[66px] shrink-0 object-cover', round ? 'rounded-full' : 'rounded-thumb')} />
        ))}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <b dir="auto" className="truncate text-left text-base font-semibold text-fg-strong [unicode-bidi:plaintext] rtl:text-right">
          {title}
        </b>
        {subtitle && (
          <small dir="auto" className="line-clamp-2 text-left text-sm text-fg-muted [unicode-bidi:plaintext] rtl:text-right">
            {subtitle}
          </small>
        )}
      </span>
      {trailing ?? <ChevronRight size={18} className="shrink-0 text-fg-subtle rtl:-scale-x-100" aria-hidden="true" />}
    </button>
  );
});
