'use client';
import { useState } from 'react';
import { MapPin, Orbit, Waypoints, X } from 'lucide-react';
import { Chip, IconButton, SectionHeader, Tabs, Timeline } from '@bayan/ui';
import type { BookDetail } from '@/api';
import { usePrefs } from '@/lib/prefs';

/** Places and story timeline, filterable by character. Opens over the chat area. */
export function Universe({ book, initialTab, onClose }: { book: BookDetail; initialTab: 'loc' | 'time'; onClose: () => void }) {
  const { t, p } = usePrefs();
  const [tab, setTab] = useState(initialTab);
  const [who, setWho] = useState<string | null>(null);
  const cast = Array.from(new Set([...book.places, ...book.timeline].flatMap((x) => x.characters)));
  const places = book.places.filter((x) => !who || x.characters.includes(who));
  const events = book.timeline.filter((x) => !who || x.characters.includes(who));
  return (
    <section aria-labelledby="uni-t" className="no-scrollbar absolute inset-0 z-30 overflow-y-auto bg-bg/70 px-4 py-8 backdrop-blur-md animate-rise sm:px-8">
      <IconButton aria-label={t('Close')} onClick={onClose} className="absolute end-4 top-4">
        <X size={18} />
      </IconButton>
      <div className="mx-auto max-w-[760px] text-center">
        <Orbit className="mx-auto text-gold" size={28} aria-hidden="true" />
        <h2 id="uni-t" className="mt-3 font-display text-display-lg leading-tight text-fg-strong">{t('Explore the Universe')}</h2>
        <p className="mx-auto mt-2 max-w-[52ch] text-sm text-fg-muted">
          {p(`Discover the worlds, key places, and main events from ${book.title} and its neighbours.`, `اكتشف عالم «${book.title}» وأماكنه وأحداثه الرئيسية، وما يجاوره من كتب.`)}
        </p>
        <Tabs
          className="mx-auto mt-5 w-fit"
          label={t('Explore the Universe')}
          value={tab}
          onChange={setTab}
          items={[
            { value: 'loc', label: t('Locations'), icon: <MapPin /> },
            { value: 'time', label: t('Story Timeline'), icon: <Waypoints /> },
          ]}
        />
      </div>
      <div className="surface-panel mx-auto mt-6 max-w-[760px] rounded-panel p-5 text-start">
        <SectionHeader as="h3" title={t(tab === 'loc' ? 'Locations' : 'Story Timeline')} description={p(tab === 'loc' ? 'Explore the most meaningful places from these stories.' : 'Follow the key moments in the order they happen.', tab === 'loc' ? 'استكشف أهم الأماكن في هذه الحكايات.' : 'تابع اللحظات الرئيسية بترتيب وقوعها.')} />
        {cast.length > 0 && (
          <div role="group" aria-label={t('Filter by character')} className="mt-4 flex flex-wrap gap-2">
            <Chip selected={!who} onClick={() => setWho(null)}>
              {p('Everyone', 'الجميع')}
            </Chip>
            {cast.map((n) => (
              <Chip key={n} selected={who === n} onClick={() => setWho(who === n ? null : n)}>
                {n}
              </Chip>
            ))}
          </div>
        )}
        {tab === 'loc' ? (
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {places.map((x) => (
              <li key={x.name} className="group relative h-[150px] overflow-hidden rounded-card border border-line">
                <img src={x.image} alt="" className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <span className="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,rgb(0_0_0/0.8))]" />
                <span className="absolute inset-x-3 bottom-2.5 text-white">
                  <b dir="auto" className="block font-display text-base">{x.name}</b>
                  <small dir="auto" className="line-clamp-2 text-2xs opacity-85">{x.characters.join(' · ') || x.subtitle}</small>
                </span>
                <span className="sr-only">{x.description}</span>
              </li>
            ))}
          </ul>
        ) : (
          <Timeline className="mt-4" label={t('Story Timeline')} events={events.map((e, i) => ({ id: String(i), title: e.title, description: e.description, meta: e.characters.join(' · ') }))} />
        )}
      </div>
    </section>
  );
}
