import type { HTMLAttributes, MouseEvent, ReactNode } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '../lib/cn';
import { Tag } from './Chip';

export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  tags?: string[];
}

export interface BookCoverProps extends HTMLAttributes<HTMLImageElement> {
  src: string;
  /** Book title, used as alt text. Pass '' when the title is already visible next to it. */
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const coverW = { xs: 32, sm: 44, md: 66, lg: 120, xl: 180 };

/** Book cover with a 2:3 ratio and a soft drop shadow. */
export function BookCover({ src, alt, size = 'md', className, ...rest }: BookCoverProps) {
  const w = coverW[size];
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      width={w}
      height={Math.round(w * 1.5)}
      className={cn(
        'aspect-[2/3] shrink-0 object-cover shadow-[0_6px_14px_rgb(0_0_0/0.35)]',
        size === 'xs' || size === 'sm' || size === 'md' ? 'rounded-cover' : 'rounded-thumb',
        className,
      )}
      style={{ width: w }}
      {...rest}
    />
  );
}

export interface FavoriteButtonProps {
  on: boolean;
  onToggle: (on: boolean) => void;
  /** Labels for the two states (localise these). */
  labels?: { add: string; remove: string };
  className?: string;
}

/** Heart toggle used on every book card. */
export function FavoriteButton({ on, onToggle, labels = { add: 'Add to favorites', remove: 'Remove from favorites' }, className }: FavoriteButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? labels.remove : labels.add}
      onClick={(e: MouseEvent) => {
        e.stopPropagation();
        onToggle(!on);
      }}
      className={cn(
        'focus-ring grid size-[30px] shrink-0 cursor-pointer place-items-center rounded-full border border-white/22 bg-[rgb(8_10_15/0.6)] text-white/85 backdrop-blur-[8px] transition-colors hover:text-white light:border-fg/18 light:bg-white/80 light:text-[#4a4e5c]',
        on && 'text-gold light:text-[#b0412f]',
        className,
      )}
    >
      <Heart size={15} fill={on ? 'currentColor' : 'none'} aria-hidden="true" />
    </button>
  );
}

export interface BookCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  book: Book;
  favorite?: boolean;
  onFavoriteChange?: (on: boolean) => void;
  onSelect?: (book: Book) => void;
  /** Max tags to show (the app shows 2). */
  maxTags?: number;
  favoriteLabels?: FavoriteButtonProps['labels'];
}

/**
 * Compact recommendation card: cover, title, author, up to 2 tags, heart.
 * Shown in its own message block, never inside a text bubble.
 */
export function BookCard({ book, favorite = false, onFavoriteChange, onSelect, maxTags = 2, favoriteLabels, className, ...rest }: BookCardProps) {
  return (
    <div className={cn('surface-card relative flex min-h-[88px] items-center gap-3 rounded-card px-3 py-2.5 transition-[filter] hover:brightness-110', className)} {...rest}>
      <BookCover src={book.cover} alt="" size="sm" />
      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={() => onSelect?.(book)}
          className="focus-ring block w-full cursor-pointer text-left after:absolute after:inset-0 after:rounded-card rtl:text-right"
        >
          <b dir="auto" className="block truncate text-base leading-[1.35] font-semibold text-fg-strong [unicode-bidi:plaintext]">
            {book.title}
          </b>
          <small dir="auto" className="block truncate text-sm text-fg-muted [unicode-bidi:plaintext]">
            {book.author}
          </small>
        </button>
        {book.tags && book.tags.length > 0 && (
          <span className="mt-1.5 flex flex-wrap gap-1.5">
            <Tag>{book.tags.slice(0, maxTags).join(' · ')}</Tag>
          </span>
        )}
      </div>
      {onFavoriteChange && <FavoriteButton on={favorite} onToggle={onFavoriteChange} labels={favoriteLabels} className="relative z-10 self-start" />}
    </div>
  );
}

/** Vertical list of book cards with an accessible name. */
export function BookList({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <section aria-label={label} className={cn('flex flex-col gap-2', className)}>
      {children}
    </section>
  );
}
