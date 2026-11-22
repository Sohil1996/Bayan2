'use client';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { Button } from '@bayan/ui';
import { PageShell, SidePage } from '@/components/PageShell';
import { BookTile } from '@/components/BookTile';
import { usePrefs } from '@/lib/prefs';

export default function Favorites() {
  const { t, favorites, ready } = usePrefs();
  const router = useRouter();
  const n = favorites.length;
  return (
    <PageShell>
      <SidePage eyebrow={t('Your Saved Books')} title={t('Favorites')} description={n ? `${n} ${t(n === 1 ? 'saved book' : 'saved books')}` : t('Books you save with the heart will appear here.')}>
        {ready && !n && (
          <div className="flex flex-col items-center py-20 text-center">
            <Heart size={30} className="text-gold" aria-hidden="true" />
            <h2 className="mt-3 font-display text-display-sm text-gold-ink">{t('No favorites yet')}</h2>
            <p className="mt-1 text-sm text-fg-muted">{t('Tap the heart on any book to keep it here.')}</p>
            <Button variant="gold" className="mt-5" onClick={() => router.push('/books')}>
              {t('Browse books')}
            </Button>
          </div>
        )}
        {n > 0 && (
          <div className="grid grid-cols-3 gap-x-3 gap-y-6 pt-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {favorites.map((id) => (
              <BookTile key={id} id={id} />
            ))}
          </div>
        )}
      </SidePage>
    </PageShell>
  );
}
