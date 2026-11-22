'use client';
import Link from 'next/link';
import { BookCover, FavoriteButton, cn } from '@bayan/ui';
import { BOOK_BY_ID } from '@/content';
import { usePrefs } from '@/lib/prefs';

/** Cover with a heart, title and author underneath (Books grid, favourites). */
export function BookTile({ id, layout = 'grid' }: { id: string; layout?: 'grid' | 'list' }) {
  const { lang, t, favorites, toggleFavorite } = usePrefs();
  const b = BOOK_BY_ID[id];
  if (!b) return null;
  const l = b[lang];
  const fav = favorites.includes(id);
  const heart = <FavoriteButton on={fav} onToggle={() => toggleFavorite(id)} labels={{ add: t('Add to favorites'), remove: t('Remove from favorites') }} className="relative z-10" />;
  if (layout === 'list')
    return (
      <div className="surface-card relative flex items-center gap-3.5 rounded-card p-2.5 transition-[filter] hover:brightness-110">
        <BookCover src={`/img/b-${id}.jpg`} alt="" size="sm" />
        <Link href={`/book/${id}`} className="focus-ring min-w-0 flex-1 after:absolute after:inset-0 after:rounded-card">
          <b dir="auto" className="block truncate text-base font-semibold text-fg-strong [unicode-bidi:plaintext]">{l.title}</b>
          <small dir="auto" className="block truncate text-sm text-fg-muted [unicode-bidi:plaintext]">{l.author}</small>
          <small dir="auto" className="mt-0.5 line-clamp-1 text-xs text-fg-subtle">{l.blurb}</small>
        </Link>
        {heart}
      </div>
    );
  return (
    <div className="group relative">
      <div className="relative">
        <Link href={`/book/${id}`} className="focus-ring block rounded-thumb" aria-label={l.title}>
          <img src={`/img/b-${id}.jpg`} alt="" loading="lazy" className="aspect-[2/3] w-full rounded-thumb object-cover shadow-[0_10px_24px_rgb(0_0_0/0.35)] transition-transform duration-300 ease-out-soft group-hover:-translate-y-1" />
        </Link>
        <span className="absolute end-2 top-2">{heart}</span>
      </div>
      <p dir="auto" className={cn('mt-2 line-clamp-2 text-sm leading-snug font-semibold text-fg-strong [unicode-bidi:plaintext]', b.lang !== lang && 'text-start')}>{l.title}</p>
      <p dir="auto" className="truncate text-2xs text-fg-subtle [unicode-bidi:plaintext]">{l.author}</p>
    </div>
  );
}
