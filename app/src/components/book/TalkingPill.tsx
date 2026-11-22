'use client';
import { ArrowLeftRight, X } from 'lucide-react';
import { Avatar, IconButton } from '@bayan/ui';
import type { CharacterDTO } from '@/api';
import { usePrefs } from '@/lib/prefs';

/** "Talking to …" pill at the top of a character or duo chat. */
export function TalkingPill({ people, book, onSwap, onEnd }: { people: CharacterDTO[]; book: string; onSwap?: () => void; onEnd: () => void }) {
  const { t, p } = usePrefs();
  const duo = people.length > 1;
  return (
    <div className="glass flex items-center gap-2.5 rounded-full py-1.5 ps-1.5 pe-1.5 animate-rise">
      <span className="flex">
        {people.map((c, i) => (
          <Avatar key={c.id} src={c.image} name={c.name} size={30} decorative className={i ? '-ms-2.5 border-2 border-bg' : ''} />
        ))}
      </span>
      <span className="min-w-0 pe-1 leading-tight">
        <small className="block text-[0.58rem] font-semibold tracking-[0.16em] text-gold-ink uppercase">{t('Talking to')}</small>
        <b dir="auto" className="block truncate font-display text-sm font-semibold text-fg-strong">{people.map((c) => c.name).join(p(' & ', ' و'))}</b>
        <small dir="auto" className="block truncate text-2xs text-fg-subtle">{duo ? t('Duo conversation') : `${people[0].role} · ${book}`}</small>
      </span>
      {duo && onSwap && (
        <IconButton size="sm" variant="ghost" aria-label={t('Swap order')} onClick={onSwap} className="border border-line">
          <ArrowLeftRight size={13} />
        </IconButton>
      )}
      <IconButton size="sm" variant="ghost" aria-label={t('End conversation')} onClick={onEnd} className="border border-line">
        <X size={13} />
      </IconButton>
    </div>
  );
}
