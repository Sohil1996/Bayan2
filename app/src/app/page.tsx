'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeftRight, Plus } from 'lucide-react';
import { BookCover, Button, Chip, SearchBar, SuggestionChip, SuggestionRow, cn } from '@bayan/ui';
import { BOOK_BY_ID, CATEGORIES, GLOBAL } from '@/content';
import { PageShell } from '@/components/PageShell';
import { CATEGORY_ICON } from '@/components/categoryIcons';
import { usePrefs } from '@/lib/prefs';

/** Cycles through example questions, typing each one out (as the live hero does). */
function useTypedPrompt(prompts: string[]) {
  const [text, setText] = useState('');
  useEffect(() => {
    if (!prompts.length) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setText(prompts[0]);
      return;
    }
    let i = 0,
      n = 0,
      dir = 1,
      timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const p = prompts[i % prompts.length];
      n += dir;
      setText(p.slice(0, n));
      if (dir > 0 && n >= p.length) {
        dir = -1;
        timer = setTimeout(tick, 2200);
        return;
      }
      if (dir < 0 && n <= 0) {
        dir = 1;
        i++;
      }
      timer = setTimeout(tick, dir > 0 ? 55 : 22);
    };
    timer = setTimeout(tick, 400);
    return () => clearTimeout(timer);
  }, [prompts]);
  return text;
}

export default function Home() {
  const { t, lang } = usePrefs();
  const router = useRouter();
  const [recommend, setRecommend] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [slide, setSlide] = useState(1);
  const prompts = useMemo(() => (picked ? BOOK_BY_ID[picked][lang].prompts : GLOBAL.heroPrompts[lang]), [picked, lang]);
  const typed = useTypedPrompt(prompts);
  const featured = GLOBAL.featured.filter((k) => BOOK_BY_ID[k]);
  const cats = CATEGORIES;

  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % cats.length), 6000);
    return () => clearInterval(id);
  }, [cats.length]);

  const ask = (q: string) => router.push(picked ? `/book/${picked}?q=${encodeURIComponent(q)}` : `/chat?q=${encodeURIComponent(q)}`);
  const cat = cats[slide];

  return (
    <PageShell header={{ recommend: { on: recommend, onChange: (v) => { setRecommend(v); if (!v) setPicked(null); } } }}>
      <section className="flex min-h-[calc(100dvh-64px)] flex-col items-center justify-center px-5 pb-24 text-center">
        <p className="eyebrow flex items-center gap-3 before:h-px before:w-6 before:bg-line after:h-px after:w-6 after:bg-line">{t('Your AI cultural librarian')}</p>
        <h1 className="mt-5 font-display text-[2.4rem] leading-[1.1] text-fg-strong sm:text-display-xl">
          {t('Where shall we')} <em className="text-gold light:text-gold-ink rtl:not-italic">{t('wander')}</em> {t('today?')}
        </h1>

        <SearchBar
          key={picked ?? 'all'}
          label={picked ? `${t('Ask about')} ${BOOK_BY_ID[picked][lang].title}` : t('Ask the Librarian')}
          submitLabel={t('Ask')}
          placeholder={typed}
          onSubmitValue={ask}
          className="mt-9 w-full max-w-[600px]"
        />

        {recommend && (
          <div className="mt-6 w-full max-w-[760px] animate-rise">
            <ul aria-label={t('Recommended books')} className="no-scrollbar flex gap-3 overflow-x-auto px-1 py-2 sm:justify-center">
              {featured.slice(0, 8).map((k) => {
                const b = BOOK_BY_ID[k][lang];
                const on = picked === k;
                return (
                  <li key={k} className="shrink-0">
                    <button
                      type="button"
                      aria-pressed={on}
                      aria-label={`${t('Ask about')} ${b.title}`}
                      onClick={() => setPicked(on ? null : k)}
                      className={cn('focus-ring block rounded-cover transition-transform duration-300 ease-out-soft hover:-translate-y-1', on && '-translate-y-1.5 ring-2 ring-gold ring-offset-2 ring-offset-bg')}
                    >
                      <BookCover src={`/img/b-${k}.jpg`} alt="" size="md" />
                    </button>
                  </li>
                );
              })}
              <li className="shrink-0">
                <Link href="/books" className="focus-ring glass grid h-[99px] w-[66px] place-items-center rounded-cover text-fg-muted" aria-label={t('Pick another book')}>
                  <Plus size={22} />
                </Link>
              </li>
            </ul>
          </div>
        )}

        {picked ? (
          <SuggestionRow label={t('Suggested questions')} className="mt-5 max-w-[760px] justify-center">
            {BOOK_BY_ID[picked][lang].prompts.map((q) => (
              <SuggestionChip key={q} onClick={() => ask(q)}>
                {q}
              </SuggestionChip>
            ))}
          </SuggestionRow>
        ) : (
          <div role="group" aria-label={t('Categories')} className="mt-6 flex max-w-[780px] flex-wrap justify-center gap-2">
            {cats.map((c) => (
              <Chip key={c.id} icon={CATEGORY_ICON[c.id]} onClick={() => router.push(`/chat?cat=${c.id}`)}>
                {c[lang]}
              </Chip>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="popular" className="relative">
        <div className="mx-auto grid max-w-[1440px] items-center gap-8 px-5 md:px-[18px] lg:grid-cols-[1fr_480px]">
          <div className="min-w-0">
            <h2 id="popular" className="font-display text-[1.75rem] tracking-wide text-fg-strong uppercase">
              {t('Popular')} <span className="text-blue">{t('reads.')}</span>
            </h2>
            <ul className="no-scrollbar mt-6 flex gap-4 overflow-x-auto pb-3">
              {featured.map((k) => (
                <li key={k} className="shrink-0">
                  <Link href={`/book/${k}`} className="focus-ring block rounded-cover transition-transform hover:-translate-y-1" aria-label={BOOK_BY_ID[k][lang].title}>
                    <BookCover src={`/img/b-${k}.jpg`} alt="" size="md" className="!w-[70px]" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <Link
            href={`/books?category=${cat.id}`}
            className="focus-ring group relative flex h-[178px] items-end overflow-hidden rounded-[28px] border border-line p-6 lg:-me-[18px] lg:rounded-e-none"
          >
            <img src={`/img/cat-${cat.id}.jpg`} alt="" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <span className="absolute inset-0 bg-[linear-gradient(90deg,rgb(0_0_0/0.55),transparent)] rtl:bg-[linear-gradient(270deg,rgb(0_0_0/0.55),transparent)]" />
            <span className="relative text-white">
              <small className="text-xs tracking-[0.2em]" aria-hidden="true">
                {String(slide + 1).padStart(2, '0')} / {String(cats.length).padStart(2, '0')}
              </small>
              <b className="block font-display text-[1.9rem] leading-tight font-normal uppercase">{cat[lang]}</b>
              <span className="text-sm text-gold-soft">{t('Browse categories')}</span>
            </span>
          </Link>
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-[1312px] px-5 md:px-8">
        <div className="surface-card flex flex-col items-start gap-6 rounded-[32px] p-7 sm:flex-row sm:items-center sm:p-8">
          <span className="relative inline-flex shrink-0 items-center">
            <img src="/img/p-lady-macbeth.jpg" alt="" className="size-16 rounded-full border-2 border-blue/60 object-cover" />
            <span className="z-10 -mx-2 grid size-8 place-items-center rounded-full border border-line bg-bg text-gold">
              <ArrowLeftRight size={14} aria-hidden="true" />
            </span>
            <img src="/img/p-ibn-sina.jpg" alt="" className="size-16 rounded-full border-2 border-gold object-cover" />
          </span>
          <div className="flex-1">
            <p className="text-2xs font-semibold tracking-[0.2em] text-gold-ink">{t('NEW')}</p>
            <h2 className="mt-1 font-display text-[1.9rem] leading-tight text-fg-strong">
              {t('Duo')} <span className="text-gold light:text-gold-ink">{t('Conversation')}</span>
            </h2>
            <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-fg-muted">{t('Bring two characters from different books together. Pick the pair, set a topic and listen.')}</p>
          </div>
          <Button variant="outline" iconEnd={<ArrowRight size={16} className="rtl:-scale-x-100" />} onClick={() => router.push('/duo')}>
            {t('Start a duo')}
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
