'use client';
import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Wordmark } from '@bayan/ui';
import type { Suggestion } from '@/api';
import { GLOBAL, CATEGORIES } from '@/content';
import { Backdrop } from '@/components/Backdrop';
import { SiteHeader } from '@/components/SiteHeader';
import { ChatView } from '@/components/chat/ChatView';
import { useChat, type Msg } from '@/components/chat/useChat';
import { usePrefs } from '@/lib/prefs';

/** The librarian: open chat with no book selected, and the guided category flow. */
function Librarian() {
  const params = useSearchParams();
  const router = useRouter();
  const { t, lang } = usePrefs();
  const g = GLOBAL.generalChat.en;
  const intro: Msg = { id: 'intro', kind: 'bot', speaker: 'bayan', name: 'Bayan', image: null, text: t(g.intro) };
  const chips: Suggestion[] = g.chips.map((c) => ({ label: t(c) }));
  const chat = useChat({ context: { kind: 'general' }, initial: [intro], initialSuggestions: chips });
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const q = params.get('q');
    const cat = params.get('cat');
    if (cat && CATEGORIES.some((c) => c.id === cat)) {
      chat.reset([], []);
      chat.startCategory(cat);
    } else if (q) chat.send(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Backdrop variant="chat" />
      <SiteHeader
        start={
          <button type="button" onClick={() => router.push('/')} className="focus-ring inline-flex items-center gap-2 rounded-full pe-2 text-fg">
            <ArrowLeft size={16} className="rtl:-scale-x-100" aria-hidden="true" />
            <Wordmark size={18} lang={lang} className="max-sm:[&>span]:hidden" />
          <span className="sr-only">{t('Back')}</span>
          </button>
        }
      />
      <main className="flex min-h-0 flex-1 flex-col">
        <p className="pt-4 text-center text-2xs font-semibold tracking-[0.18em] text-gold-ink uppercase">{t(g.kick)}</p>
        <ChatView
          messages={chat.messages}
          suggestions={chat.suggestions}
          busy={chat.busy}
          error={chat.error}
          onSend={chat.send}
          onRegenerate={chat.regenerate}
          onFeedback={chat.feedback}
          onReset={() => chat.reset([intro], chips)}
          placeholder={t('Ask Bayan anything…')}
        />
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Librarian />
    </Suspense>
  );
}
