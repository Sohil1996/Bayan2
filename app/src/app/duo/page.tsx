'use client';
import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Avatar, BookCover, Button, Chip, TextField, Wordmark, cn } from '@bayan/ui';
import { api, type Suggestion } from '@/api';
import { BOOKS, BOOK_BY_ID, GLOBAL } from '@/content';
import { Backdrop } from '@/components/Backdrop';
import { SiteHeader } from '@/components/SiteHeader';
import { ChatView } from '@/components/chat/ChatView';
import { TalkingPill } from '@/components/book/TalkingPill';
import { newId, useChat } from '@/components/chat/useChat';
import { usePrefs } from '@/lib/prefs';

type Pick = { bookId: string; characterId: string };

/** Duo conversation across two books: pick two characters, a topic, then listen. */
function Duo() {
  const { t, p, lang } = usePrefs();
  const router = useRouter();
  const params = useSearchParams();
  const initial = (params.get('with') ?? '').split(',').filter(Boolean).map((s) => {
    const [bookId, characterId] = s.split(':');
    return { bookId, characterId };
  }).filter((x) => BOOK_BY_ID[x.bookId]?.[lang].characters[Number(x.characterId)]);
  const [picks, setPicks] = useState<Pick[]>(initial.slice(0, 2));
  const [book, setBook] = useState<string | null>(null);
  const [topic, setTopic] = useState('');
  const [started, setStarted] = useState(false);

  const withCast = useMemo(() => BOOKS.filter((b) => b[lang].characters.some((c) => !c.real)), [lang]);
  const char = (x: Pick) => {
    const c = BOOK_BY_ID[x.bookId][lang].characters[Number(x.characterId)];
    return { id: `${x.bookId}:${x.characterId}`, name: c.name, role: c.role, bio: c.bio, image: `/img/${c.img || 'ch-ph'}.jpg`, real: c.real };
  };
  const people = picks.map(char);
  const names = people.map((c) => c.name).join(p(' & ', ' و'));

  const chat = useChat({
    context: picks.length === 2 ? { kind: 'duo', a: picks[0], b: picks[1] } : { kind: 'general' },
  });

  const toggle = (x: Pick) => {
    const key = `${x.bookId}:${x.characterId}`;
    if (picks.some((y) => `${y.bookId}:${y.characterId}` === key)) setPicks(picks.filter((y) => `${y.bookId}:${y.characterId}` !== key));
    else setPicks([...picks, x].slice(-2));
  };

  const start = () => {
    setStarted(true);
    const intros = people.map((c) => ({ id: newId(), kind: 'bot' as const, speaker: c.id, name: c.name, image: c.image, text: p(`I’m ${c.name}, ${c.role}. ${c.bio}`, `أنا ${c.name}، ${c.role}. ${c.bio}`) }));
    chat.reset([{ id: newId(), kind: 'note', text: p(`Now talking with ${names}`, `تتحدث الآن مع ${names}`) }, ...intros], GLOBAL.duo.topics.slice(0, 3).map((x): Suggestion => ({ label: t(x.q) })));
    api.addEncounter({ kind: 'duo', names: people.map((c) => c.name), bookIds: picks.map((x) => x.bookId), characterIds: picks.map((x) => x.characterId), topic: topic || undefined });
    if (topic.trim()) setTimeout(() => chat.send(topic.trim()), 50);
  };

  const header = (
    <SiteHeader
      start={
        <button type="button" onClick={() => (started ? setStarted(false) : router.push('/'))} className="focus-ring inline-flex items-center gap-2 rounded-full pe-2 text-fg">
          <ArrowLeft size={16} className="rtl:-scale-x-100" aria-hidden="true" />
          <Wordmark size={18} lang={lang} className="max-sm:[&>span]:hidden" />
          <span className="sr-only">{t('Back')}</span>
        </button>
      }
    />
  );

  if (started && picks.length === 2)
    return (
      <div className="flex h-dvh flex-col overflow-hidden">
        <Backdrop variant="chat" />
        {header}
        <ChatView
          messages={chat.messages}
          suggestions={chat.suggestions}
          busy={chat.busy}
          error={chat.error}
          onSend={chat.send}
          onRegenerate={chat.regenerate}
          onFeedback={chat.feedback}
          placeholder={p(`Ask ${names} anything…`, `اسأل ${names} أي شيء…`)}
          top={<TalkingPill people={people} book="" onSwap={() => setPicks([...picks].reverse())} onEnd={() => setStarted(false)} />}
        />
      </div>
    );

  const b = book ? BOOK_BY_ID[book] : null;
  return (
    <div className="min-h-dvh pb-32">
      <Backdrop />
      {header}
      <main className="mx-auto max-w-[920px] px-5 pt-8">
        <p className="eyebrow">{t('NEW')}</p>
        <h1 className="mt-1 font-display text-display-lg text-fg-strong">
          {t('Duo')} <span className="text-gold light:text-gold-ink">{t('Conversation')}</span>
        </h1>
        <p className="mt-2 max-w-[60ch] text-sm text-fg-muted">{t('Bring two characters from different books together. Pick the pair, set a topic and listen.')}</p>

        <div className="surface-card mt-6 flex items-center gap-4 rounded-card p-4" aria-live="polite">
          {[0, 1].map((i) => {
            const c = people[i];
            return (
              <div key={i} className="flex min-w-0 flex-1 items-center gap-3">
                {c ? <Avatar src={c.image} name={c.name} size={44} ring decorative /> : <span className="grid size-11 shrink-0 place-items-center rounded-full border border-dashed border-line text-fg-subtle">{i + 1}</span>}
                <span className="min-w-0">
                  <b className="block truncate text-sm font-semibold text-fg-strong">{c ? c.name : p(`Character ${i + 1}`, `الشخصية ${i + 1}`)}</b>
                  {c && <small className="block truncate text-2xs text-fg-muted">{BOOK_BY_ID[picks[i].bookId][lang].title}</small>}
                </span>
              </div>
            );
          })}
        </div>

        <h2 className="mt-8 text-sm font-semibold text-fg-strong">{p('1. Choose a book', '١. اختر كتابًا')}</h2>
        <ul className="no-scrollbar mt-3 flex gap-3 overflow-x-auto pb-2">
          {withCast.map((x) => (
            <li key={x.id} className="shrink-0">
              <button type="button" aria-pressed={book === x.id} aria-label={x[lang].title} onClick={() => setBook(x.id)} className={cn('focus-ring block rounded-cover transition-transform hover:-translate-y-1', book === x.id && '-translate-y-1 ring-2 ring-gold ring-offset-2 ring-offset-bg')}>
                <BookCover src={`/img/b-${x.id}.jpg`} alt="" size="md" />
              </button>
            </li>
          ))}
        </ul>

        {b && (
          <>
            <h2 className="mt-6 text-sm font-semibold text-fg-strong">{p(`2. Pick characters from ${b.en.title}`, `٢. اختر شخصيات من «${b.ar.title}»`)}</h2>
            <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
              {b[lang].characters.map((c, i) => {
                if (c.real) return null;
                const on = picks.some((y) => y.bookId === b.id && y.characterId === String(i));
                return (
                  <button key={c.name} type="button" aria-pressed={on} onClick={() => toggle({ bookId: b.id, characterId: String(i) })} className="focus-ring relative flex cursor-pointer flex-col items-center gap-1.5 rounded-card p-2 text-center text-xs text-fg-muted hover:text-fg">
                    <Avatar src={`/img/${c.img || 'ch-ph'}.jpg`} name={c.name} size={52} decorative className={cn(on && 'border-2 !border-gold')} />
                    {on && <Check size={14} className="absolute end-3 top-2 rounded-full bg-gold p-0.5 text-[#0d0f17]" aria-hidden="true" />}
                    <span dir="auto" className="line-clamp-2">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        <h2 className="mt-8 text-sm font-semibold text-fg-strong">{p('3. Set a topic (optional)', '٣. حدّد موضوعًا (اختياري)')}</h2>
        <div role="group" aria-label={t('Topics')} className="mt-3 flex flex-wrap gap-2">
          {GLOBAL.duo.freeTopics.map((x) => (
            <Chip key={x.label} selected={topic === t(x.label)} onClick={() => setTopic(topic === t(x.label) ? '' : t(x.label))}>
              {t(x.label)}
            </Chip>
          ))}
        </div>
        <TextField className="mt-3" label={t('Topic')} hideLabel placeholder={p('Or write your own topic…', 'أو اكتب موضوعك…')} value={topic} onChange={(e) => setTopic(e.target.value)} />

        <Button variant="gold" size="lg" className="mt-8" disabled={picks.length < 2} iconEnd={<ArrowRight size={18} className="rtl:-scale-x-100" />} onClick={start}>
          {t('Start the conversation')}
        </Button>
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Duo />
    </Suspense>
  );
}
