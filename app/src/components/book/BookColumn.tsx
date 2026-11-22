'use client';
import { useState } from 'react';
import { ArrowRight, BookOpen, ChevronRight, MapPin, Waypoints } from 'lucide-react';
import { BookCover, Button, Divider, FavoriteButton, SectionHeader, Tabs } from '@bayan/ui';
import type { BookDetail } from '@/api';
import { usePrefs } from '@/lib/prefs';

/** The book's column: cover and actions, then a preview of its universe. */
export function BookColumn({ book, onRead, onUniverse }: { book: BookDetail; onRead: () => void; onUniverse: (tab: 'loc' | 'time') => void }) {
  const { t, p, favorites, toggleFavorite } = usePrefs();
  const [tab, setTab] = useState<'loc' | 'time'>('loc');
  const hasUni = book.places.length > 0 || book.timeline.length > 0;
  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-4">
        <BookCover src={book.cover} alt="" size="lg" className="!w-[104px]" />
        <div className="min-w-0 flex-1 pt-1">
          <div className="flex items-start gap-2">
            <h1 dir="auto" className="flex-1 font-display text-display-md leading-tight text-fg-strong [unicode-bidi:plaintext]">{book.title}</h1>
            <FavoriteButton on={favorites.includes(book.id)} onToggle={() => toggleFavorite(book.id)} labels={{ add: t('Add to favorites'), remove: t('Remove from favorites') }} />
          </div>
          <p dir="auto" className="mt-1 font-display text-sm text-fg-muted">{book.author}</p>
          {book.hasReader && (
            <Button variant="outline" size="sm" className="mt-3 !h-9 !px-4" iconStart={<BookOpen size={15} />} iconEnd={<ArrowRight size={14} className="rtl:-scale-x-100" />} onClick={onRead}>
              {t('Read & Reflect')}
            </Button>
          )}
        </div>
      </div>
      {hasUni && (
        <>
          <Divider />
          <SectionHeader title={t('Explore the Universe')} description={p(`Discover the world of ${book.title}`, `اكتشف عالم ${book.title}`)} />
          <Tabs
            label={t('Explore the Universe')}
            value={tab}
            onChange={setTab}
            fill
            items={[
              { value: 'loc', label: t('Locations'), icon: <MapPin /> },
              { value: 'time', label: t('Story Timeline'), icon: <Waypoints /> },
            ]}
          />
          <ul className="flex flex-col gap-2">
            {(tab === 'loc' ? book.places : book.timeline).slice(0, 3).map((x, i) => {
              const place = 'subtitle' in x;
              return (
                <li key={'name' in x ? x.name : x.title}>
                  <button type="button" onClick={() => onUniverse(tab)} className="focus-ring surface-card flex w-full cursor-pointer items-center gap-3 rounded-card p-2 text-start hover:brightness-110">
                    {place ? (
                      <img src={(x as { image: string }).image} alt="" className="h-[52px] w-[60px] shrink-0 rounded-thumb object-cover" />
                    ) : (
                      <span className="grid size-[52px] shrink-0 place-items-center rounded-thumb border border-gold/40 font-display text-display-sm text-gold">{i + 1}</span>
                    )}
                    <span className="min-w-0 flex-1">
                      <b dir="auto" className="block truncate font-display text-sm font-semibold text-fg-strong">{'name' in x ? x.name : x.title}</b>
                      <small dir="auto" className="block truncate text-2xs text-fg-muted">{place ? (x as { subtitle: string }).subtitle : (x as { description: string }).description}</small>
                    </span>
                    <span className="grid size-7 shrink-0 place-items-center rounded-full border border-line text-fg-muted">
                      <ChevronRight size={14} className="rtl:-scale-x-100" aria-hidden="true" />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <button type="button" onClick={() => onUniverse(tab)} className="focus-ring mx-auto inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium text-fg">
            {t(tab === 'loc' ? 'View all locations' : 'View full timeline')}
            <ArrowRight size={14} className="rtl:-scale-x-100" aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  );
}
