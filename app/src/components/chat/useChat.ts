'use client';
/**
 * Conversation state for every chat screen (librarian, book, character, duo).
 * Talks to the backend only through `api.chat`; the thread is saved to My Library after each reply.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { api, type CategoryFlow, type ChatContext, type ChatReply, type ChatSetup, type Suggestion } from '@/api';
import { usePrefs } from '@/lib/prefs';

export type Msg =
  | { id: string; kind: 'user'; text: string; at: number }
  | {
      id: string;
      kind: 'bot';
      speaker: string;
      name: string;
      image: string | null;
      text: string;
      books?: string[];
      summary?: { bookId: string };
      card?: ChatReply['card'];
      ask?: ChatReply['ask'];
      /** Index of the user message this reply answers (for regenerate). */
      replyTo?: number;
    }
  | { id: string; kind: 'note'; text: string };

let seq = 0;
const mid = () => `m${Date.now().toString(36)}${(seq++).toString(36)}`;

export interface UseChatOptions {
  context: ChatContext;
  spoilerFree?: boolean;
  setup?: ChatSetup;
  /** Opening messages shown before the reader says anything. */
  initial?: Msg[];
  initialSuggestions?: Suggestion[];
  /** Book the conversation belongs to (for My Library). */
  bookId?: string | null;
  conversationId?: string | null;
}

export function useChat(opts: UseChatOptions) {
  const { lang, refreshCredits, user } = usePrefs();
  const [messages, setMessages] = useState<Msg[]>(opts.initial ?? []);
  const [suggestions, setSuggestions] = useState<Suggestion[]>(opts.initialSuggestions ?? []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const flow = useRef<CategoryFlow | null>(null);
  const convId = useRef<string | null>(opts.conversationId ?? null);
  const live = useRef(opts);
  live.current = opts;
  const msgsRef = useRef(messages);
  msgsRef.current = messages;

  const persist = useCallback(
    (all: Msg[]) => {
      if (!convId.current || user?.preferences.rememberConversations === false) return;
      const users = all.filter((m) => m.kind === 'user');
      if (!users.length) return;
      api.saveConversation({
        id: convId.current,
        title: (users[0] as Extract<Msg, { kind: 'user' }>).text,
        context: live.current.context,
        bookId: live.current.bookId ?? null,
        messages: all.length,
        updated: new Date().toISOString(),
        thread: all
          .filter((m) => m.kind !== 'note')
          .map((m) =>
            m.kind === 'user'
              ? { role: 'user' as const, text: m.text }
              : { role: 'assistant' as const, speaker: (m as Extract<Msg, { kind: 'bot' }>).speaker, speakerName: (m as Extract<Msg, { kind: 'bot' }>).name, text: (m as Extract<Msg, { kind: 'bot' }>).text, books: (m as Extract<Msg, { kind: 'bot' }>).books, summary: (m as Extract<Msg, { kind: 'bot' }>).summary },
          ),
      });
    },
    [user],
  );

  const apply = useCallback(
    async (r: ChatReply, replyTo: number) => {
      convId.current = r.conversationId;
      flow.current = r.flow ?? null;
      for (let i = 0; i < r.messages.length; i++) {
        const m = r.messages[i];
        if (i > 0) {
          setBusy(true);
          await new Promise((res) => setTimeout(res, 900));
        }
        const last = i === r.messages.length - 1;
        const msg: Msg = {
          id: mid(),
          kind: 'bot',
          speaker: m.speaker,
          name: m.speakerName,
          image: m.speakerImage,
          text: m.text,
          replyTo,
          ...(last ? { books: r.books, summary: r.summary, card: r.card, ask: r.ask } : {}),
        };
        setMessages((cur) => {
          const next = [...cur, msg];
          if (last) persist(next);
          return next;
        });
      }
      setSuggestions(r.suggestions);
      refreshCredits();
    },
    [persist, refreshCredits],
  );

  const send = useCallback(
    async (text: string) => {
      const t = text.trim();
      if (!t || busy) return;
      setError(null);
      const userMsg: Msg = { id: mid(), kind: 'user', text: t, at: Date.now() };
      const replyTo = msgsRef.current.length;
      setMessages((cur) => [...cur, userMsg]);
      setSuggestions([]);
      setBusy(true);
      try {
        const o = live.current;
        const r = await api.chat({ context: o.context, message: t, lang, spoilerFree: o.spoilerFree, setup: o.setup, flow: flow.current, conversationId: convId.current });
        await apply(r, replyTo);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setBusy(false);
      }
    },
    [busy, lang, apply],
  );

  /** Ask again: drop the reply and resend the message it answered. */
  const regenerate = useCallback(
    async (msgId: string) => {
      const all = msgsRef.current;
      const i = all.findIndex((m) => m.id === msgId);
      const m = all[i];
      if (!m || m.kind !== 'bot' || m.replyTo == null || busy) return;
      const q = all[m.replyTo];
      if (!q || q.kind !== 'user') return;
      setMessages(all.filter((x) => !(x.kind === 'bot' && x.replyTo === m.replyTo)));
      setBusy(true);
      try {
        const o = live.current;
        const r = await api.chat({ context: o.context, message: q.text, lang, spoilerFree: o.spoilerFree, setup: o.setup, flow: null, conversationId: convId.current });
        await apply(r, m.replyTo);
      } finally {
        setBusy(false);
      }
    },
    [busy, lang, apply],
  );

  const feedback = useCallback((msgId: string, value: 'good' | 'bad', reason?: string, note?: string) => {
    const i = msgsRef.current.findIndex((m) => m.id === msgId);
    api.feedback({ conversationId: convId.current ?? 'none', messageIndex: i, value, reason, note });
  }, []);

  /** Start the guided category flow ("help me choose from Heritage"). */
  const startCategory = useCallback(
    async (category: string) => {
      setBusy(true);
      try {
        const r = await api.startCategory(category, lang);
        await apply(r, -1);
      } finally {
        setBusy(false);
      }
    },
    [lang, apply],
  );

  /** Add local messages (intros, notes) without calling the backend. */
  const push = useCallback((...m: Msg[]) => setMessages((cur) => [...cur, ...m]), []);
  const reset = useCallback((initial: Msg[] = [], sugg: Suggestion[] = []) => {
    setMessages(initial);
    setSuggestions(sugg);
    flow.current = null;
    convId.current = null;
  }, []);

  useEffect(() => {
    convId.current = opts.conversationId ?? convId.current;
  }, [opts.conversationId]);

  return { messages, suggestions, setSuggestions, busy, error, send, regenerate, feedback, startCategory, push, reset, conversationId: convId };
}

export const newId = mid;
