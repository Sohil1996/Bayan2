'use client';
import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LayoutGrid, List } from 'lucide-react';
import { Chip, IconButton, SearchBar, cn } from '@bayan/ui';
import { BOOKS, CATEGORIES, type Lang } from '@/content';
import { PageShell, SidePage } from '@/components/PageShell';
import { BookTile } from '@/components/BookTile';
import { usePrefs } from '@/lib/prefs';

function BooksPage() {
  const { t, lang } = usePrefs();
  const params = useSearchParams();
  const router = useRouter();
  const [language, setLanguage] = useState<Lang | 'all'>('all');
  const [category, setCategory] = useState<string | null>(params.get('category'));
  const [q, setQ] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const list = useMemo(() => {
    const cat = CATEGORIES.find((c) => c.id === category);
    const s = q.trim().toLowerCase();
    return BOOKS.filter(
      (b) =>
        (language === 'all' || b.lang === language) &&
        (!cat || cat.books.includes(b.id)) &&
        (!s || [b.en.title, b.ar.title, b.en.author, b.ar.author].join(' ').toLowerCase().includes(s)),
    );
  }, [language, category, q]);

  const label = 'text-2xs font-semibold tracking-[0.14em] text-fg-subtle uppercase';
  const filters = (
    <div className="mt-6 flex flex-col gap-5 max-md:mt-4 max-md:flex-row max-md:gap-6 max-md:overflow-x-auto max-md:no-scrollbar">
      <div className="shrink-0">
        <p className={label}>{t('Language')}</p>
        <div role="group" aria-label={t('Language')} className="mt-2 flex flex-wrap gap-2 max-md:flex-nowrap">
          {(['all', 'en', 'ar'] as const).map((v) => (
            <Chip key={v} selected={language === v} onClick={() => setLanguage(v)} lang={v === 'ar' ? 'ar' : undefined}>
              {v === 'all' ? t('All') : v === 'en' ? t('English') : 'العربية'}
            </Chip>
          ))}
        </div>
      </div>
      <div className="shrink-0">
        <p className={label}>{t('Category')}</p>
        <div role="group" aria-label={t('Category')} className="mt-2 flex flex-wrap gap-2 max-md:flex-nowrap">
          {CATEGORIES.map((c) => (
            <Chip key={c.id} selected={category === c.id} onClick={() => setCategory(category === c.id ? null : c.id)}>
              {c[lang]}
            </Chip>
          ))}
        </div>
      </div>
      {(language !== 'all' || category || q) && (
        <button
          type="button"
          className="focus-ring w-fit shrink-0 text-sm text-gold-ink underline underline-offset-4"
          onClick={() => {
            setLanguage('all');
            setCategory(null);
            setQ('');
            router.replace('/books');
          }}
        >
          {t('Clear filters')}
        </button>
      )}
    </div>
  );

  return (
    <PageShell>
      <SidePage eyebrow={t('The Library')} title={t('Books')} description={t('Browse every book in the Bayan library. Filter by language and category, then open one to start a conversation.')} aside={filters}>
        <div className="flex items-center gap-2">
          <SearchBar tone="inline" label={t('Search books or authors')} placeholder={t('Search books or authors…')} onChange={(e) => setQ(e.target.value)} onSubmitValue={setQ} className="min-w-0 flex-1" />
          <div role="group" aria-label={t('View')} className="glass flex h-control items-center gap-0.5 rounded-full p-1">
            <IconButton size="sm" variant="ghost" aria-label={t('Grid view')} aria-pressed={view === 'grid'} onClick={() => setView('grid')} className={cn(view === 'grid' && 'bg-line-soft text-gold')}>
              <LayoutGrid size={15} />
            </IconButton>
            <IconButton size="sm" variant="ghost" aria-label={t('List view')} aria-pressed={view === 'list'} onClick={() => setView('list')} className={cn(view === 'list' && 'bg-line-soft text-gold')}>
              <List size={15} />
            </IconButton>
          </div>
        </div>
        <p aria-live="polite" className="mt-4 text-sm text-fg-muted">
          {list.length} {t(list.length === 1 ? 'book' : 'books')}
        </p>
        {list.length ? (
          <div className={cn('mt-3', view === 'grid' ? 'grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' : 'grid gap-2.5 lg:grid-cols-2')}>
            {list.map((b) => (
              <BookTile key={b.id} id={b.id} layout={view} />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-center text-fg-muted">{t('No books match these filters.')}</p>
        )}
      </SidePage>
    </PageShell>
  );
}

export default function Page() {
  return (
    <Suspense>
      <BooksPage />
    </Suspense>
  );
}
