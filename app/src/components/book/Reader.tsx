'use client';
import { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button, SearchBar } from '@bayan/ui';
import { BOOK_BY_ID } from '@/content';
import { usePrefs } from '@/lib/prefs';
import { Overlay } from '../chat/SummaryCard';

/** Read & Reflect: passages from the book, with a box to ask Bayan about what you just read. */
export function Reader({ bookId, onClose, onAsk }: { bookId: string; onClose: () => void; onAsk: (q: string) => void }) {
  const { t, lang } = usePrefs();
  const b = BOOK_BY_ID[bookId][lang];
  const passages = b.reader ?? BOOK_BY_ID[bookId].en.reader ?? [];
  const [i, setI] = useState(0);
  const cur = passages[i];
  if (!cur) return null;
  return (
    <Overlay label={`${t('Read & Reflect')}: ${b.title}`} onClose={onClose}>
      <article className="mx-auto flex min-h-full max-w-[680px] flex-col px-6 pt-16 pb-10">
        <p className="eyebrow">{b.title}</p>
        <p className="mt-1 text-xs text-fg-subtle">
          {i + 1} / {passages.length}
        </p>
        <h2 dir="auto" className="mt-4 font-display text-display-lg leading-tight text-fg-strong">{cur.title}</h2>
        <p dir="auto" className="mt-6 flex-1 font-display text-[1.2rem] leading-[1.9] whitespace-pre-line text-fg">{cur.text}</p>
        <div className="mt-8 flex justify-between gap-3">
          <Button variant="glass" iconStart={<ArrowLeft size={16} className="rtl:-scale-x-100" />} disabled={i === 0} onClick={() => setI(i - 1)}>
            {t('Previous')}
          </Button>
          <Button variant="glass" iconEnd={<ArrowRight size={16} className="rtl:-scale-x-100" />} disabled={i === passages.length - 1} onClick={() => setI(i + 1)}>
            {t('Next')}
          </Button>
        </div>
        <SearchBar className="mt-6" label={t('Ask Bayan about this book')} placeholder={t('Ask Bayan about this book…')} submitLabel={t('Ask')} onSubmitValue={(q) => onAsk(q)} />
      </article>
    </Overlay>
  );
}
