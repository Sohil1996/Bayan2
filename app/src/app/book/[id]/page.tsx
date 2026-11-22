'use client';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, BookOpen, EyeOff } from 'lucide-react';
import { Avatar, BookCover, Button, FavoriteButton, IconButton, Switch } from '@bayan/ui';
import { api, type BookDetail, type ChatContext, type ChatSetup, type Suggestion } from '@/api';
import { BOOK_BY_ID, GLOBAL } from '@/content';
import { Backdrop } from '@/components/Backdrop';
import { SiteHeader } from '@/components/SiteHeader';
import { Sheet } from '@/components/Sheet';
import { ChatView } from '@/components/chat/ChatView';
import { newId, useChat, type Msg } from '@/components/chat/useChat';
import { BookColumn } from '@/components/book/BookColumn';
import { CharacterRail } from '@/components/book/CharacterRail';
import { SetupCard } from '@/components/book/SetupCard';
import { TalkingPill } from '@/components/book/TalkingPill';
import { Universe } from '@/components/book/Universe';
import { Reader } from '@/components/book/Reader';
import { usePrefs } from '@/lib/prefs';

function BookChat() {
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const router = useRouter();
  const { t, p, lang, favorites, toggleFavorite } = usePrefs();
  const [book, setBook] = useState<BookDetail | null>(null);

  useEffect(() => {
    if (!BOOK_BY_ID[id]) return router.replace('/books');
    api.getBook(id, lang).then(setBook);
  }, [id, lang, router]);

  if (!book) return <Backdrop variant="chat" />;
  return <Chat key={`${id}-${lang}`} book={book} firstQuestion={params.get('q')} conversation={params.get('conv')} talk={params.get('talk')} onToggleFav={() => toggleFavorite(book.id)} fav={favorites.includes(book.id)} t={t} p={p} />;
}

interface ChatProps {
  book: BookDetail;
  firstQuestion: string | null;
  conversation: string | null;
  talk: string | null;
  fav: boolean;
  onToggleFav: () => void;
  t: (s: string) => string;
  p: (en: string, ar: string) => string;
}

function Chat({ book, firstQuestion, conversation, talk, fav, onToggleFav, t, p }: ChatProps) {
  const router = useRouter();
  const { lang } = usePrefs();
  const [spoilerFree, setSpoilerFree] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [setup, setSetup] = useState<ChatSetup | undefined>();
  const [pendingSetup, setPendingSetup] = useState<string[] | null>(null);
  const [universe, setUniverse] = useState<'loc' | 'time' | null>(null);
  const [reader, setReader] = useState(false);
  const [sheet, setSheet] = useState<'book' | 'cast' | null>(null);

  const byId = useMemo(() => Object.fromEntries(book.characters.map((c) => [c.id, c])), [book]);
  const people = selected.map((s) => byId[s]).filter(Boolean);
  const names = people.map((c) => c.name).join(p(' & ', ' و'));

  const context: ChatContext = useMemo(() => {
    if (selected.length === 1) return { kind: 'character', bookId: book.id, characterId: selected[0] };
    if (selected.length === 2) return { kind: 'duo', a: { bookId: book.id, characterId: selected[0] }, b: { bookId: book.id, characterId: selected[1] } };
    return { kind: 'book', bookId: book.id };
  }, [selected, book.id]);

  const bookChips: Suggestion[] = useMemo(() => [{ label: t('Summarize this book') }, ...book.chat.chips.map((label) => ({ label }))], [book, t]);
  const intro: Msg = { id: 'intro', kind: 'bot', speaker: 'bayan', name: 'Bayan', image: null, text: book.chat.intro };

  const chat = useChat({ context, spoilerFree, setup, initial: [intro], initialSuggestions: bookChips, bookId: book.id });
  const duoTopics = useCallback((): Suggestion[] => GLOBAL.duo.topics.slice(0, 3).map((x) => ({ label: t(x.q) })), [t]);

  // Restore a saved conversation, ask the question from the home page, or open a character.
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (conversation) {
      api.getConversation(conversation).then((c) => {
        if (!c) return;
        chat.reset(
          c.thread.map((m) =>
            m.role === 'user'
              ? { id: newId(), kind: 'user', text: m.text, at: Date.parse(c.updated) }
              : { id: newId(), kind: 'bot', speaker: m.speaker ?? 'bayan', name: m.speakerName ?? 'Bayan', image: null, text: m.text, books: m.books, summary: m.summary },
          ),
          bookChips,
        );
        chat.conversationId.current = c.id;
      });
    } else if (firstQuestion) chat.send(firstQuestion);
    else if (talk && byId[talk]) pick(talk);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const backToBayan = () => {
    if (!selected.length) return;
    setSelected([]);
    setPendingSetup(null);
    chat.push({ id: newId(), kind: 'note', text: t('Back with Bayan') });
    chat.setSuggestions(bookChips);
  };

  const introduce = (ids: string[], added: string) => {
    const c = byId[added];
    chat.push({ id: newId(), kind: 'bot', speaker: `${book.id}:${c.id}`, name: c.name, image: c.image, text: p(`I’m ${c.name}, ${c.role}. ${c.bio}`, `أنا ${c.name}، ${c.role}. ${c.bio}`) });
    chat.setSuggestions(duoTopics());
    api.addEncounter({ kind: ids.length > 1 ? 'duo' : 'character', names: ids.map((i) => byId[i].name), bookIds: ids.map(() => book.id), characterIds: ids, conversationId: chat.conversationId.current ?? undefined });
  };

  function pick(cid: string) {
    const c = byId[cid];
    if (!c) return;
    setSheet(null);
    setUniverse(null);
    if (c.real) {
      // Real people are described by Bayan, never voiced.
      if (selected.length) backToBayan();
      chat.send(p(`Tell me about ${c.name}`, `حدّثني عن ${c.name}`));
      return;
    }
    let next: string[];
    let added: string | null = null;
    if (selected.includes(cid)) next = selected.filter((x) => x !== cid);
    else {
      added = cid;
      next = [...selected, cid].slice(-2);
    }
    if (!next.length) return backToBayan();
    setSelected(next);
    const label = next.map((x) => byId[x].name).join(p(' & ', ' و'));
    if (added) {
      chat.push({ id: newId(), kind: 'note', text: p(`Now talking with ${label}`, `تتحدث الآن مع ${label}`) });
      setPendingSetup(next);
      chat.setSuggestions([]);
    }
  }

  const finishSetup = (answers: string[], length: 0 | 1 | 2) => {
    const ids = pendingSetup ?? selected;
    setSetup({ answers, length });
    setPendingSetup(null);
    introduce(ids, ids[ids.length - 1]);
  };

  const send = (text: string) => {
    if (pendingSetup) finishSetup([], 1);
    chat.send(text);
  };

  const spoiler = (
    <span className="glass inline-flex h-chip items-center rounded-full ps-2.5 pe-1.5">
      <EyeOff size={13} className="me-1.5 text-fg-muted" aria-hidden="true" />
      <Switch label={t('Spoiler free')} checked={spoilerFree} onChange={(e) => setSpoilerFree(e.target.checked)} className="flex-row-reverse text-xs [&>span:first-child]:scale-[0.8] max-sm:[&>span:last-child]:sr-only" />
    </span>
  );

  const placeholder = selected.length ? p(`Ask ${names} anything…`, `اسأل ${names} أي شيء…`) : t('Ask Bayan anything…');

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Backdrop variant="chat" />
      <SiteHeader
        className="max-lg:hidden"
        extra={spoiler}
        start={
          <button type="button" onClick={() => router.push('/')} className="focus-ring glass inline-flex h-chip items-center gap-1.5 rounded-full ps-2.5 pe-3.5 text-sm font-medium text-fg">
            <ArrowLeft size={16} className="rtl:-scale-x-100" aria-hidden="true" />
            <span>{t('Back')}</span>
          </button>
        }
      />

      {/* Phone app bar */}
      <div className="flex flex-col gap-2 border-b border-line-soft bg-bg/50 px-3 pt-[max(10px,env(safe-area-inset-top))] pb-2.5 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-2.5">
          <IconButton size="sm" aria-label={t('Back')} onClick={() => router.back()} flipInRtl>
            <ArrowLeft size={16} />
          </IconButton>
          <BookCover src={book.cover} alt="" size="xs" />
          <span className="min-w-0 flex-1 leading-tight">
            <b dir="auto" className="block truncate text-sm font-semibold text-fg-strong">{book.title}</b>
            <small dir="auto" className="block truncate text-2xs text-fg-muted">{book.author}</small>
          </span>
          <FavoriteButton on={fav} onToggle={onToggleFav} labels={{ add: t('Add to favorites'), remove: t('Remove from favorites') }} />
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="glass" className="flex-1" iconStart={<BookOpen size={14} />} onClick={() => setSheet('book')}>
            {t('This book')}
          </Button>
          <Button size="sm" variant="glass" className="flex-1" iconStart={people[0] ? <Avatar src={people[0].image} name={people[0].name} size={18} decorative /> : <Avatar src={book.characters[0]?.image} name="" size={18} decorative />} onClick={() => setSheet('cast')}>
            {t('Characters')}
          </Button>
          {spoiler}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] lg:grid-cols-[320px_minmax(0,1fr)_96px]">
        <aside aria-label={book.title} className="no-scrollbar surface-panel overflow-y-auto !rounded-none !border-y-0 !border-s-0 p-5 max-lg:hidden">
          <BookColumn book={book} onRead={() => setReader(true)} onUniverse={setUniverse} />
        </aside>

        <div className="relative flex min-h-0 min-w-0 flex-col">
          <ChatView
            messages={chat.messages}
            suggestions={chat.suggestions}
            busy={chat.busy}
            error={chat.error}
            onSend={send}
            onRegenerate={chat.regenerate}
            onFeedback={chat.feedback}
            onTalkTo={pick}
            onReset={() => chat.setSuggestions(selected.length ? duoTopics() : bookChips)}
            placeholder={placeholder}
            top={people.length ? <TalkingPill people={people} book={book.title} onSwap={() => setSelected([...selected].reverse())} onEnd={backToBayan} /> : undefined}
            tail={pendingSetup ? <SetupCard key={pendingSetup.join()} names={pendingSetup.map((x) => byId[x].name).join(p(' & ', ' و'))} duo={pendingSetup.length > 1} onDone={finishSetup} /> : undefined}
          />
          {universe && <Universe book={book} initialTab={universe} onClose={() => setUniverse(null)} />}
        </div>

        <aside className="no-scrollbar overflow-y-auto border-s border-line-soft py-5 max-lg:hidden">
          <CharacterRail characters={book.characters} selected={selected} onBayan={backToBayan} onPick={pick} />
        </aside>
      </div>

      {sheet === 'book' && (
        <Sheet title={book.title} onClose={() => setSheet(null)}>
          <BookColumn
            book={book}
            onRead={() => {
              setSheet(null);
              setReader(true);
            }}
            onUniverse={(tab) => {
              setSheet(null);
              setUniverse(tab);
            }}
          />
        </Sheet>
      )}
      {sheet === 'cast' && (
        <Sheet title={t('Characters')} onClose={() => setSheet(null)}>
          <CharacterRail layout="grid" characters={book.characters} selected={selected} onBayan={() => { backToBayan(); setSheet(null); }} onPick={pick} />
        </Sheet>
      )}
      {reader && (
        <Reader
          bookId={book.id}
          onClose={() => setReader(false)}
          onAsk={(q) => {
            setReader(false);
            send(q);
          }}
        />
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <BookChat />
    </Suspense>
  );
}
