'use client';
import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Avatar, BayanGlyph, cn } from '@bayan/ui';
import type { CharacterDTO } from '@/api';
import { usePrefs } from '@/lib/prefs';

/** Vertical rail: Bayan, then the cast. Selecting one or two characters starts a character or duo chat. */
export function CharacterRail({ characters, selected, onBayan, onPick, layout = 'rail' }: { characters: CharacterDTO[]; selected: string[]; onBayan: () => void; onPick: (id: string) => void; layout?: 'rail' | 'grid' }) {
  const { t } = usePrefs();
  const [all, setAll] = useState(false);
  const shown = all || layout === 'grid' ? characters : characters.slice(0, 6);
  const bayanOn = selected.length === 0;
  const item = 'focus-ring flex w-[72px] cursor-pointer flex-col items-center gap-1.5 rounded-xl py-1 text-center text-2xs leading-tight text-fg-muted transition-colors hover:text-fg';
  return (
    <nav aria-label={t('Characters')} className={cn(layout === 'rail' ? 'flex flex-col items-center gap-3' : 'grid grid-cols-4 gap-3')}>
      <button type="button" aria-pressed={bayanOn} onClick={onBayan} className={item}>
        <span className={cn('grid size-11 place-items-center rounded-full border text-fg-strong transition-shadow', bayanOn ? 'border-gold shadow-[0_0_18px_rgb(235_193_122/0.5)]' : 'border-line')}>
          <BayanGlyph size={22} />
        </span>
        Bayan
      </button>
      {shown.map((c) => {
        const on = selected.includes(c.id);
        return (
          <button key={c.id} type="button" aria-pressed={on} onClick={() => onPick(c.id)} className={cn(item, on && 'text-fg-strong')} title={c.real ? t('Learn about this person') : undefined}>
            <Avatar src={c.image} name={c.name} size={on ? 44 : 36} decorative className={cn('transition-all', on && 'border-2 !border-gold shadow-[0_0_18px_rgb(235_193_122/0.5)]')} />
            <span dir="auto" className="line-clamp-2">{c.name}</span>
          </button>
        );
      })}
      {layout === 'rail' && characters.length > 6 && !all && (
        <button type="button" onClick={() => setAll(true)} className={item}>
          <span className="glass grid size-9 place-items-center rounded-full">
            <MoreHorizontal size={16} aria-hidden="true" />
          </span>
          {t('More')}
        </button>
      )}
    </nav>
  );
}
