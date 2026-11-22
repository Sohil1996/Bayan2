'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw } from 'lucide-react';
import { AssistantMessage, Avatar, BookCard, Button, Composer, Dialog, IconButton, SuggestionChip, TypingIndicator, UserMessage, cn } from '@bayan/ui';
import { BOOK_BY_ID } from '@/content';
import type { Suggestion } from '@/api';
import { GLOBAL } from '@/content';
import { usePrefs } from '@/lib/prefs';
import type { Msg } from './useChat';
import { SummaryCard } from './SummaryCard';

export interface ChatViewProps {
  messages: Msg[];
  suggestions: Suggestion[];
  busy: boolean;
  error?: string | null;
  onSend: (text: string) => void;
  onRegenerate: (id: string) => void;
  onFeedback: (id: string, value: 'good' | 'bad', reason?: string, note?: string) => void;
  onTalkTo?: (characterId: string) => void;
  /** Clear the suggestions / start over button at the end of the chip row. */
  onReset?: () => void;
  placeholder: string;
  /** Rendered after the last message (setup card). */
  tail?: ReactNode;
  /** Rendered above the thread, centred (the "Talking to" pill). */
  top?: ReactNode;
  composerDisabled?: boolean;
  className?: string;
}

export function ChatView(p: ChatViewProps) {
  const { t, lang, favorites, toggleFavorite, user } = usePrefs();
  const router = useRouter();
  const end = useRef<HTMLDivElement>(null);
  const [bad, setBad] = useState<string | null>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, [p.messages.length, p.busy, p.tail]);

  const labels = { copy: t('Copy'), copied: t('Copied'), good: t('Good response'), bad: t('Bad response'), regenerate: t('Regenerate') };
  const pick = (s: Suggestion) => {
    if (s.action?.openBook) router.push(`/book/${s.action.openBook}`);
    else if (s.action?.talkTo && p.onTalkTo) p.onTalkTo(s.action.talkTo.characterId);
    else p.onSend(s.label);
  };
  const lastBot = [...p.messages].reverse().find((m) => m.kind === 'bot');

  return (
    <div className={cn('relative flex min-h-0 flex-1 flex-col', p.className)}>
      {p.top && <div className="pointer-events-none absolute inset-x-0 top-3 z-20 flex justify-center px-4 [&>*]:pointer-events-auto">{p.top}</div>}
      <div
        role="log"
        aria-live="polite"
        aria-label={t('Conversation')}
        className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pt-6 pb-4 [mask-image:linear-gradient(180deg,transparent,#000_24px,#000_calc(100%-24px),transparent)] sm:px-8"
      >
        <div className={cn('mx-auto flex max-w-[760px] flex-col gap-5', p.top && 'pt-14')}>
          {p.messages.map((m) => {
            if (m.kind === 'note')
              return (
                <p key={m.id} role="note" className="text-center text-xs font-medium text-gold-ink">
                  {m.text}
                </p>
              );
            if (m.kind === 'user')
              return (
                <div key={m.id} className="flex flex-col items-end animate-rise">
                  <UserMessage avatar={user ? user.name[0] : undefined}>{m.text}</UserMessage>
                  <time className="mt-0.5 pe-1 text-2xs text-fg-subtle" dateTime={new Date(m.at).toISOString()}>
                    {new Date(m.at).toLocaleTimeString(lang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US', { hour: 'numeric', minute: '2-digit' })}
                  </time>
                </div>
              );
            const isChar = m.speaker !== 'bayan';
            return (
              <div key={m.id} className="animate-rise">
                {isChar && <p className="mb-1 ms-12 text-2xs font-semibold tracking-[0.12em] text-gold-ink uppercase">{m.name}</p>}
                <AssistantMessage
                  avatar={isChar ? <Avatar src={m.image ?? undefined} name={m.name} size={36} decorative /> : undefined}
                  actionLabels={labels}
                  onCopy={() => navigator.clipboard?.writeText(m.text)}
                  onFeedback={(v) => (v === 'bad' ? setBad(m.id) : p.onFeedback(m.id, v))}
                  onRegenerate={m.id === lastBot?.id ? () => p.onRegenerate(m.id) : undefined}
                  attachments={<Attachments m={m} onSend={p.onSend} onTalkTo={p.onTalkTo} active={m.id === lastBot?.id && !p.busy} />}
                >
                  {m.text}
                </AssistantMessage>
              </div>
            );
          })}
          {p.busy && <TypingIndicator label={t('Bayan is typing')} />}
          {p.error && (
            <p role="alert" className="text-sm text-danger">
              {p.error}
            </p>
          )}
          {p.tail}
          <div ref={end} />
        </div>
      </div>

      <div className="mx-auto w-full max-w-[760px] px-4 pb-[max(16px,env(safe-area-inset-bottom))] sm:px-8">
        {p.suggestions.length > 0 && (
          <div role="group" aria-label={t('Suggestions')} className="no-scrollbar mb-3 flex items-center gap-2 overflow-x-auto">
            {p.suggestions.map((s) => (
              <SuggestionChip key={s.label} onClick={() => pick(s)}>
                {s.label}
              </SuggestionChip>
            ))}
            {p.onReset && (
              <IconButton size="sm" variant="ghost" aria-label={t('Start over')} onClick={p.onReset} className="ms-auto">
                <RotateCcw size={14} />
              </IconButton>
            )}
          </div>
        )}
        <Composer label={p.placeholder} placeholder={p.placeholder} sendLabel={t('Send')} attachLabel={t('More options')} onSend={p.onSend} disabled={p.composerDisabled} />
      </div>

      {bad && <FeedbackDialog
        open={!!bad}
        onClose={() => setBad(null)}
        onSubmit={(reason, note) => {
          if (bad) p.onFeedback(bad, 'bad', reason, note);
          setBad(null);
        }}
      />}
    </div>
  );

  function Attachments({ m, onSend, onTalkTo, active }: { m: Extract<Msg, { kind: 'bot' }>; onSend: (t: string) => void; onTalkTo?: (id: string) => void; active: boolean }) {
    return (
      <>
        {m.ask && (
          <div role="group" aria-label={t('Choose an answer')} className="flex max-w-[460px] flex-col gap-1.5">
            {m.ask.options.map((o, i) => (
              <button key={o} type="button" disabled={!active} onClick={() => onSend(o)} className="focus-ring surface-card flex cursor-pointer items-center gap-3 rounded-[14px] px-3 py-2.5 text-start text-sm text-fg hover:brightness-110 disabled:cursor-default disabled:opacity-60">
                <span className="grid size-6 shrink-0 place-items-center rounded-full border border-line text-2xs font-semibold text-fg-muted">{String.fromCharCode(65 + i)}</span>
                {o}
              </button>
            ))}
          </div>
        )}
        {m.books && m.books.length > 0 && (
          <section aria-label={t('Recommended books')} className="grid max-w-[620px] gap-2 sm:grid-cols-2">
            {m.books.filter((k) => BOOK_BY_ID[k]).map((k) => {
              const b = BOOK_BY_ID[k][lang];
              return (
                <BookCard
                  key={k}
                  book={{ id: k, title: b.title, author: b.author, cover: `/img/b-${k}.jpg`, tags: b.tags }}
                  favorite={favorites.includes(k)}
                  onFavoriteChange={() => toggleFavorite(k)}
                  favoriteLabels={{ add: t('Add to favorites'), remove: t('Remove from favorites') }}
                  onSelect={() => router.push(`/book/${k}`)}
                />
              );
            })}
          </section>
        )}
        {m.summary && <SummaryCard bookId={m.summary.bookId} />}
        {m.card && (m.card.title || m.card.image) && (
          <div className="surface-card flex max-w-[420px] items-center gap-3 rounded-card p-2.5">
            {m.card.image && <img src={m.card.image} alt="" className="size-14 shrink-0 rounded-thumb object-cover" />}
            <span className="min-w-0 flex-1">
              {m.card.title && <b className="block truncate text-sm font-semibold text-fg-strong">{m.card.title}</b>}
              {m.card.subtitle && <small className="line-clamp-2 text-xs text-fg-muted">{m.card.subtitle}</small>}
            </span>
            {m.card.characterId && onTalkTo && (
              <Button size="sm" variant="outline" onClick={() => onTalkTo(m.card!.characterId!)}>
                {m.card.action || t('Talk')}
              </Button>
            )}
          </div>
        )}
      </>
    );
  }
}

function FeedbackDialog({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (reason: string, note: string) => void }) {
  const { t, lang } = usePrefs();
  const [reason, setReason] = useState<string>('');
  const [note, setNote] = useState('');
  return (
    <Dialog
      open={open}
      onClose={onClose}
      closeLabel={t('Close')}
      title={t('What went wrong?')}
      description={t('Your feedback helps Bayan get better.')}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t('Cancel')}
          </Button>
          <Button variant="gold" disabled={!reason} onClick={() => onSubmit(reason, note)}>
            {t('Send feedback')}
          </Button>
        </>
      }
    >
      <div role="radiogroup" aria-label={t('Reason')} className="flex flex-wrap gap-2">
        {GLOBAL.feedbackReasons.map((r) => (
          <button key={r.id} type="button" role="radio" aria-checked={reason === r.id} onClick={() => setReason(r.id)} className={cn('focus-ring h-chip rounded-full border px-3 text-sm', reason === r.id ? 'surface-tab-on' : 'border-line text-fg-muted hover:text-fg')}>
            {r[lang]}
          </button>
        ))}
      </div>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} dir="auto" aria-label={t('Tell us more (optional)')} placeholder={t('Tell us more (optional)')} className="surface-field mt-4 h-24 w-full resize-none rounded-[16px] p-3 text-sm text-fg outline-none placeholder:text-fg-subtle" />
    </Dialog>
  );
}
