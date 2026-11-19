'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Clock, FileText, MessageCircle, Play, Plus, Users } from 'lucide-react';
import { AvatarPair, Avatar, BookCover, Button, IconButton, SearchBar } from '@bayan/ui';
import { api, type ConversationListItem, type Encounter } from '@/api';
import { BOOK_BY_ID } from '@/content';
import { PageShell, SidePage } from '@/components/PageShell';
import { BookTile } from '@/components/BookTile';
import { MoreMenu } from '@/components/MoreMenu';
import { ListenPlayer, SummaryReader } from '@/components/chat/SummaryCard';
import { usePrefs } from '@/lib/prefs';

export default function Library() {
  const { t, p, lang, favorites } = usePrefs();
  const router = useRouter();
  const [convs, setConvs] = useState<ConversationListItem[]>([]);
  const [encs, setEncs] = useState<Encounter[]>([]);
  const [sums, setSums] = useState<string[]>([]);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<{ kind: 'read' | 'listen'; id: string } | null>(null);

  const load = useCallback(() => {
    api.conversations().then(setConvs);
    api.encounters().then(setEncs);
    api.summaries().then(setSums);
  }, []);
  useEffect(load, [load]);

  const s = q.trim().toLowerCase();
  const match = (...xs: (string | undefined)[]) => !s || xs.join(' ').toLowerCase().includes(s);
  const date = (iso: string) => new Date(iso).toLocaleDateString(lang === 'ar' ? 'ar-SA-u-nu-latn-ca-gregory' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const bookTitle = (id: string | null) => (id && BOOK_BY_ID[id] ? BOOK_BY_ID[id][lang].title : '');

  const C = useMemo(() => convs.filter((c) => match(c.title, bookTitle(c.bookId))), [convs, s, lang]); // eslint-disable-line react-hooks/exhaustive-deps
  const E = useMemo(() => encs.filter((e) => match(...e.names, e.topic)), [encs, s]); // eslint-disable-line react-hooks/exhaustive-deps
  const S = useMemo(() => sums.filter((k) => BOOK_BY_ID[k] && match(BOOK_BY_ID[k][lang].title)), [sums, s, lang]); // eslint-disable-line react-hooks/exhaustive-deps
  const F = favorites.filter((k) => BOOK_BY_ID[k] && match(BOOK_BY_ID[k][lang].title, BOOK_BY_ID[k][lang].author));

  const head = (icon: React.ReactNode, title: string) => (
    <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-fg-strong [&_svg]:size-4 [&_svg]:text-gold">
      {icon}
      {title}
    </h2>
  );
  const empty = (text: string) => <p className="surface-card rounded-card p-4 text-sm text-fg-muted">{text}</p>;
  const card = 'surface-card relative flex items-center gap-3 rounded-card p-2.5 transition-[filter] hover:brightness-110';

  const openEncounter = (e: Encounter) => {
    const ids = e.characterIds ?? [];
    if (e.bookIds.length === 2 && e.bookIds[0] !== e.bookIds[1]) router.push(`/duo?with=${e.bookIds.map((b, i) => `${b}:${ids[i] ?? 0}`).join(',')}`);
    else if (e.conversationId) router.push(`/book/${e.bookIds[0]}?conv=${e.conversationId}`);
    else router.push(`/book/${e.bookIds[0]}?talk=${ids[0] ?? 0}`);
  };

  return (
    <PageShell>
      <SidePage eyebrow={t('Your Personal Library')} title={t('My Library')} description={t('All your saved books, conversations, and character encounters in one place.')}>
        <SearchBar tone="inline" label={t('Search your books, conversations and encounters…')} placeholder={t('Search your books, conversations and encounters…')} onChange={(e) => setQ(e.target.value)} onSubmitValue={setQ} />

        <section className="mt-6">
          {head(<MessageCircle />, t('My Conversations'))}
          {C.length ? (
            <div className="grid grid-cols-[minmax(0,1fr)] gap-2.5 lg:grid-cols-2">
              {C.slice(0, 6).map((c) => (
                <div key={c.id} className={card}>
                  {c.bookId ? <img src={`/img/b-${c.bookId}.jpg`} alt="" className="h-[52px] w-[60px] shrink-0 rounded-thumb object-cover" /> : <span className="grid h-[52px] w-[60px] shrink-0 place-items-center rounded-thumb border border-line text-gold"><BookOpen size={20} /></span>}
                  <Link href={c.bookId ? `/book/${c.bookId}?conv=${c.id}` : '/chat'} className="focus-ring min-w-0 flex-1 after:absolute after:inset-0 after:rounded-card">
                    <b dir="auto" className="line-clamp-2 text-sm font-semibold text-fg-strong">{c.title}</b>
                    <small dir="auto" className="block truncate text-2xs text-fg-muted">
                      {t('A conversation with Bayan')}
                      {c.bookId && ` · ${bookTitle(c.bookId)}`}
                    </small>
                    <small className="mt-0.5 flex items-center gap-1 text-2xs text-fg-subtle">
                      <MessageCircle size={11} aria-hidden="true" /> {c.messages} {t('messages')} · {date(c.updated)}
                    </small>
                  </Link>
                  <MoreMenu label={c.title} items={[{ label: t('Delete'), danger: true, onClick: () => api.deleteConversation(c.id).then(load) }]} />
                </div>
              ))}
            </div>
          ) : (
            empty(t('Your conversations with Bayan will appear here.'))
          )}
        </section>

        <section className="mt-8">
          {head(<Users />, t('Character Encounters'))}
          {E.length ? (
            <div className="grid grid-cols-[minmax(0,1fr)] gap-2.5 lg:grid-cols-3">
              {E.slice(0, 6).map((e) => {
                const img = (i: number) => {
                  const c = BOOK_BY_ID[e.bookIds[i]]?.[lang].characters[Number(e.characterIds?.[i] ?? 0)];
                  return c?.img ? `/img/${c.img}.jpg` : undefined;
                };
                return (
                  <div key={e.id} className={card}>
                    {e.names.length > 1 ? <AvatarPair a={{ name: e.names[0], src: img(0) }} b={{ name: e.names[1], src: img(1) }} size={34} /> : <Avatar name={e.names[0]} src={img(0)} size={34} decorative />}
                    <button type="button" onClick={() => openEncounter(e)} className="focus-ring min-w-0 flex-1 text-start after:absolute after:inset-0 after:rounded-card">
                      <b dir="auto" className="block truncate text-sm font-semibold text-fg-strong">{e.names.join(p(' & ', ' و'))}</b>
                      {e.topic && <small dir="auto" className="block truncate text-2xs text-fg-muted">{p('On', 'عن')} {e.topic}</small>}
                      <small className="text-2xs text-fg-subtle">{date(e.updated)}</small>
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            empty(t('Start a Duo Conversation or talk to a character and it will appear here.'))
          )}
        </section>

        <section className="mt-8">
          {head(<FileText />, t('Book Summaries'))}
          {S.length ? (
            <div className="grid grid-cols-[minmax(0,1fr)] gap-2.5 lg:grid-cols-2">
              {S.slice(0, 4).map((k) => {
                const b = BOOK_BY_ID[k][lang];
                return (
                  <div key={k} className="surface-card flex gap-3 rounded-card p-3">
                    <BookCover src={`/img/b-${k}.jpg`} alt="" size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <b dir="auto" className="line-clamp-1 flex-1 text-sm font-semibold text-fg-strong">{b.title}</b>
                        <MoreMenu label={b.title} items={[{ label: t('Remove'), danger: true, onClick: () => api.removeSummary(k).then(load) }]} />
                      </div>
                      <p dir="auto" className="line-clamp-2 text-xs text-fg-muted">{b.blurb}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <small className="flex flex-1 items-center gap-1 text-2xs text-fg-subtle">
                          <Clock size={11} aria-hidden="true" /> {t('2 min read')}
                        </small>
                        <Button size="sm" variant="outline" onClick={() => setOpen({ kind: 'read', id: k })}>
                          {t('Read summary')}
                        </Button>
                        <IconButton size="sm" variant="primary" aria-label={`${t('Play summary')}: ${b.title}`} onClick={() => setOpen({ kind: 'listen', id: k })}>
                          <Play size={14} fill="currentColor" />
                        </IconButton>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            empty(t('Ask Bayan to summarize a book and it will be saved here.'))
          )}
        </section>

        <section className="mt-8">
          {head(<BookOpen />, t('Favorite Books'))}
          <div className="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 lg:grid-cols-6">
            {F.slice(0, 6).map((k) => (
              <BookTile key={k} id={k} />
            ))}
            <Link href="/books" className="focus-ring glass flex aspect-[2/3] flex-col items-center justify-center gap-2 rounded-thumb text-sm text-fg-muted">
              <Plus size={24} aria-hidden="true" />
              {t('Add Books')}
            </Link>
          </div>
        </section>
      </SidePage>
      {open?.kind === 'read' && <SummaryReader bookId={open.id} onClose={() => setOpen(null)} onListen={() => setOpen({ kind: 'listen', id: open.id })} />}
      {open?.kind === 'listen' && <ListenPlayer bookId={open.id} onClose={() => setOpen(null)} />}
    </PageShell>
  );
}
