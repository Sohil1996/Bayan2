'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, Star, Trophy, Users, Layers } from 'lucide-react';
import { SearchBar, SectionHeader } from '@bayan/ui';
import { api, type ExploreFeed } from '@/api';
import { PageShell, SidePage } from '@/components/PageShell';
import { usePrefs } from '@/lib/prefs';

export default function Explore() {
  const { t, lang } = usePrefs();
  const router = useRouter();
  const [feed, setFeed] = useState<ExploreFeed | null>(null);
  useEffect(() => {
    api.explore(lang).then(setFeed);
  }, [lang]);
  const moreIcons = [<Sparkles key="a" />, <Star key="b" />, <Trophy key="c" />];

  return (
    <PageShell>
      <SidePage eyebrow={t('Your Creative Space')} title={t('Explore')} description={t('A creative and social space for literary minds. Discover media, ideas, and conversations from Bayan and the community.')}>
        <SearchBar tone="inline" label={t('Ask Bayan about media, book clubs, or ideas…')} placeholder={t('Ask Bayan about media, book clubs, or ideas…')} onSubmitValue={(q) => router.push(`/chat?q=${encodeURIComponent(q)}`)} />
        {feed && (
          <>
            <section className="mt-7">
              <SectionHeader as="h2" title={t('Featured Media')} description={t('Curated creations from Bayan and the community.')} className="[&>div]:items-center" />
              <ul tabIndex={0} aria-label={t('Featured Media')} className="focus-ring no-scrollbar mt-4 flex snap-x gap-3 overflow-x-auto rounded-[22px] pb-2">
                {feed.media.map((m) => (
                  <li key={m.title} className="relative h-[200px] w-[min(380px,78vw)] shrink-0 snap-start overflow-hidden rounded-[22px] first:w-[min(380px,78vw)] [&:not(:first-child)]:w-[200px]">
                    <img src={`/${m.image}`} alt="" className="absolute inset-0 size-full object-cover" />
                    <span className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgb(0_0_0/0.75))]" />
                    <span className="glass absolute start-3 top-3 rounded-full px-2.5 py-1 text-2xs font-medium text-white">{m.by}</span>
                    <span className="absolute inset-x-4 bottom-3 text-white">
                      <b dir="auto" className="block text-sm font-semibold">{m.title}</b>
                      <small className="text-2xs opacity-80">{m.kind}</small>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
            <section className="mt-8">
              <SectionHeader as="h2" icon={<Users />} title={t('Book Clubs')} description={t('Join discussions, share insights, and explore books together.')} />
              <div className="mt-4 grid gap-3 lg:grid-cols-3">
                {feed.clubs.map((c) => (
                  <article key={c.title} className="surface-card flex gap-3.5 rounded-card p-3">
                    <img src={`/${c.image}`} alt="" className="h-[86px] w-[62px] shrink-0 rounded-cover object-cover" />
                    <div className="min-w-0">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-tag px-2 py-0.5 text-2xs font-medium text-tag-fg">
                        <i className="size-1.5 rounded-full bg-blue" aria-hidden="true" />
                        {t('Active')}
                      </span>
                      <h3 dir="auto" className="mt-1 text-base font-semibold text-fg-strong">{c.title}</h3>
                      <p className="text-xs text-fg-muted">{c.members}</p>
                      <p dir="auto" className="mt-1 text-sm text-fg-muted">{c.question}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
            <section className="mt-8">
              <SectionHeader as="h2" icon={<Layers />} title={t('More to Explore')} />
              <div className="mt-4 grid gap-3 lg:grid-cols-3">
                {feed.more.map((m, i) => (
                  <button key={m.title} type="button" onClick={() => router.push('/chat')} className="focus-ring surface-card flex cursor-pointer items-center gap-3 rounded-card p-4 text-start hover:brightness-110">
                    <span className="text-gold [&_svg]:size-5">{moreIcons[i % 3]}</span>
                    <span className="min-w-0 flex-1">
                      <b className="block text-sm font-semibold text-fg-strong">{m.title}</b>
                      <small className="text-xs text-fg-muted">{m.description}</small>
                    </span>
                    <ArrowRight size={16} className="text-fg-subtle rtl:-scale-x-100" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </section>
          </>
        )}
      </SidePage>
    </PageShell>
  );
}
