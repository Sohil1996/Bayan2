'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Headphones, Pause, Play, SkipBack, SkipForward, X } from 'lucide-react';
import { BookCover, Button, IconButton, cn } from '@bayan/ui';
import { api, type SummaryDTO } from '@/api';
import { BOOK_BY_ID } from '@/content';
import { usePrefs } from '@/lib/prefs';

function useSummary(bookId: string | null) {
  const { lang } = usePrefs();
  const [s, setS] = useState<SummaryDTO | null>(null);
  useEffect(() => {
    if (bookId) api.getSummary(bookId, lang).then(setS);
  }, [bookId, lang]);
  return s;
}

/** Summary attached under a reply: title, opening lines, "View more" and "Listen". */
export function SummaryCard({ bookId }: { bookId: string }) {
  const { t } = usePrefs();
  const s = useSummary(bookId);
  const [open, setOpen] = useState<'read' | 'listen' | null>(null);
  if (!s) return null;
  const first = s.sections[0];
  return (
    <>
      <div className="surface-card flex max-w-[560px] gap-3.5 rounded-card p-3">
        <BookCover src={`/img/b-${bookId}.jpg`} alt="" size="sm" />
        <div className="min-w-0 flex-1">
          <b dir="auto" className="block text-sm font-semibold text-gold-ink">
            {s.title} — {t('Summary')}
          </b>
          <p className="mt-1 text-xs font-semibold text-fg-strong">{first?.heading}</p>
          <p dir="auto" className="line-clamp-2 text-xs text-fg-muted">{first?.body}</p>
          <div className="mt-2 flex gap-2">
            <Button size="sm" variant="ghost" className="!px-2 text-gold-ink" onClick={() => setOpen('read')}>
              {t('View more')}
            </Button>
            <Button size="sm" variant="glass" iconStart={<Headphones size={14} />} onClick={() => setOpen('listen')}>
              {t('Listen')}
            </Button>
          </div>
        </div>
      </div>
      {open === 'read' && <SummaryReader bookId={bookId} onClose={() => setOpen(null)} onListen={() => setOpen('listen')} />}
      {open === 'listen' && <ListenPlayer bookId={bookId} onClose={() => setOpen(null)} />}
    </>
  );
}

function Overlay({ label, onClose, children, className }: { label: string; onClose: () => void; children: React.ReactNode; className?: string }) {
  const { t } = usePrefs();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', esc);
      document.body.style.overflow = '';
      prev?.focus();
    };
  }, [onClose]);
  return createPortal(
    <div ref={ref} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} className={cn('fixed inset-0 z-[60] overflow-y-auto bg-[var(--by-dialog-bg)] outline-none backdrop-blur-xl animate-rise', className)}>
      <IconButton aria-label={t('Close')} onClick={onClose} className="fixed end-4 top-4 z-10">
        <X size={18} />
      </IconButton>
      {children}
    </div>,
    document.body,
  );
}

/** Full summary, section by section. */
export function SummaryReader({ bookId, onClose, onListen }: { bookId: string; onClose: () => void; onListen?: () => void }) {
  const { t, lang } = usePrefs();
  const s = useSummary(bookId);
  const b = BOOK_BY_ID[bookId][lang];
  return (
    <Overlay label={`${b.title} — ${t('Summary')}`} onClose={onClose}>
      <article className="mx-auto max-w-[680px] px-6 py-16">
        <div className="flex items-center gap-4">
          <BookCover src={`/img/b-${bookId}.jpg`} alt="" size="md" />
          <div>
            <p className="eyebrow">{t('Summary')}</p>
            <h2 dir="auto" className="mt-1 font-display text-display-md text-fg-strong">{b.title}</h2>
            <p className="text-sm text-fg-muted">{b.author}</p>
            {s && (
              <p className="mt-1 text-xs text-fg-subtle">
                {s.minutes} {t('min read')}
              </p>
            )}
          </div>
        </div>
        {onListen && (
          <Button variant="outline" size="sm" className="mt-6" iconStart={<Headphones size={14} />} onClick={onListen}>
            {t('Listen')}
          </Button>
        )}
        {s?.sections.map((sec) => (
          <section key={sec.heading} className="mt-8">
            <h3 className="font-display text-display-sm text-gold-ink">{sec.heading}</h3>
            <p dir="auto" className="mt-2 text-base leading-[1.75] whitespace-pre-line text-fg">{sec.body}</p>
          </section>
        ))}
      </article>
    </Overlay>
  );
}

/**
 * Full-screen audio player. Plays `audioUrl` when the backend provides one,
 * otherwise reads the summary aloud with the browser's speech engine.
 */
export function ListenPlayer({ bookId, onClose }: { bookId: string; onClose: () => void }) {
  const { t, lang } = usePrefs();
  const s = useSummary(bookId);
  const b = BOOK_BY_ID[bookId][lang];
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => () => {
    if (canSpeak) speechSynthesis.cancel();
  }, [canSpeak]);

  useEffect(() => {
    if (!s || !playing || !canSpeak) return;
    speechSynthesis.cancel();
    const sec = s.sections[i];
    const u = new SpeechSynthesisUtterance(`${sec.heading}. ${sec.body}`);
    u.lang = lang === 'ar' ? 'ar-SA' : 'en-GB';
    u.rate = 0.98;
    u.onend = () => {
      if (i < s.sections.length - 1) setI(i + 1);
      else setPlaying(false);
    };
    speechSynthesis.speak(u);
    return () => {
      u.onend = null;
    };
  }, [s, i, playing, lang, canSpeak]);

  const toggle = () => {
    if (playing && canSpeak) speechSynthesis.cancel();
    setPlaying(!playing);
  };
  const n = s?.sections.length ?? 1;

  return (
    <Overlay label={`${t('Listen')}: ${b.title}`} onClose={onClose} className="grid place-items-center">
      <div className="flex w-full max-w-[420px] flex-col items-center px-6 py-16 text-center">
        <BookCover src={`/img/b-${bookId}.jpg`} alt="" size="xl" className="shadow-[0_30px_70px_rgb(0_0_0/0.5)]" />
        <h2 dir="auto" className="mt-8 font-display text-display-md text-fg-strong">{b.title}</h2>
        <p className="text-sm text-fg-muted">{b.author}</p>
        <p aria-live="polite" className="mt-5 min-h-5 text-sm font-medium text-gold-ink">{s?.sections[i]?.heading}</p>
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-line-soft" role="progressbar" aria-valuemin={0} aria-valuemax={n} aria-valuenow={i + 1} aria-label={t('Progress')}>
          <span className="block h-full rounded-full bg-gold transition-[width]" style={{ width: `${((i + (playing ? 0.5 : 0)) / n) * 100}%` }} />
        </div>
        <div className="mt-6 flex items-center gap-5">
          <IconButton aria-label={t('Previous section')} onClick={() => setI(Math.max(0, i - 1))} flipInRtl>
            <SkipBack size={18} />
          </IconButton>
          <IconButton variant="primary" size="lg" aria-label={playing ? t('Pause') : t('Play')} onClick={toggle} className="!size-16">
            {playing ? <Pause size={26} /> : <Play size={26} className="ms-0.5" />}
          </IconButton>
          <IconButton aria-label={t('Next section')} onClick={() => setI(Math.min(n - 1, i + 1))} flipInRtl>
            <SkipForward size={18} />
          </IconButton>
        </div>
        {!canSpeak && <p className="mt-4 text-xs text-fg-subtle">{t('Audio is not available in this browser.')}</p>}
      </div>
    </Overlay>
  );
}

export { Overlay };
