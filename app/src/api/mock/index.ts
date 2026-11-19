/**
 * In-browser implementation of the Bayan API: content from src/content, user state in localStorage.
 * Behaviour mirrors the live site, including the demo wallet (120 credits, 1 per message).
 */
import { BOOKS, BOOK_BY_ID, EXPLORE, GLOBAL, type BookRecord, type Lang } from '../../content';
import summaries from '../../content/summaries.json';
import type {
  BayanApi, BookDetail, BookSummary, ChatReply, Conversation, ConversationListItem, Credits, Encounter, TopUpPlan, User,
} from '../contract';
import { categoryStep, reply } from './engine';
import { delay, now, read, uid, write } from './store';

const SUMS = summaries as Record<string, Record<Lang, { heading: string; body: string }[]>>;
const PLANS: TopUpPlan[] = [
  { credits: 100, price: 19, currency: 'SAR' },
  { credits: 250, price: 39, currency: 'SAR' },
  { credits: 600, price: 79, currency: 'SAR' },
];

function summary(b: BookRecord, lang: Lang): BookSummary {
  const l = b[lang];
  return { id: b.id, lang: b.lang, title: l.title, author: l.author, blurb: l.blurb, cover: `/img/b-${b.id}.jpg`, tags: l.tags };
}

function detail(b: BookRecord, lang: Lang): BookDetail {
  const l = b[lang];
  const names = (row: string[] | undefined) => row ?? [];
  return {
    ...summary(b, lang),
    characters: l.characters.map((c) => ({ id: String(c.i), name: c.name, role: c.role, bio: c.bio, image: `/img/${c.img || 'ch-ph'}.jpg`, real: c.real })),
    places: l.places.map((p, i) => ({ name: p.name, subtitle: p.sub, description: p.desc, image: `/img/${p.img || `b-${b.id}`}.jpg`, characters: names(b.who?.l[i]) })),
    timeline: l.timeline.map((e, i) => ({ title: e.title, description: e.desc, characters: names(b.who?.e[i]) })),
    prompts: l.prompts,
    chat: { kicker: l.chat.kicker, intro: l.chat.intro, chips: l.chat.chips },
    hasReader: !!l.reader?.length,
  };
}

function wallet(): Credits {
  const day = 864e5;
  const t = Date.now();
  return read<Credits>('credits', {
    balance: 120,
    usedThisMonth: 30,
    monthlyAllowance: 150,
    history: [
      { id: 'h1', label: 'top', amount: 150, date: new Date(t - day * 9).toISOString() },
      { id: 'h2', label: 'use', amount: -12, date: new Date(t - day * 9).toISOString() },
      { id: 'h3', label: 'use', amount: -10, date: new Date(t - day * 4).toISOString() },
      { id: 'h4', label: 'use', amount: -8, date: new Date(t - day).toISOString() },
    ],
  });
}

function spend(n = 1): number {
  const w = wallet();
  w.balance = Math.max(0, w.balance - n);
  w.usedThisMonth += n;
  write('credits', w);
  return w.balance;
}

function matches(b: BookRecord, q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  return [b.en.title, b.ar.title, b.en.author, b.ar.author, ...b.matchTags].join(' ').toLowerCase().includes(s);
}

export const mockApi: BayanApi = {
  async listBooks(lang, opts = {}) {
    const cat = opts.category ? GLOBAL.categories.find((c) => c.id === opts.category) : null;
    return BOOKS.filter((b) => (!cat || cat.books.includes(b.id)) && (!opts.language || b.lang === opts.language) && matches(b, opts.q ?? '')).map((b) => summary(b, lang));
  },
  async getBook(id, lang) {
    const b = BOOK_BY_ID[id];
    if (!b) throw new Error(`Unknown book ${id}`);
    return detail(b, lang);
  },
  async listCategories(lang) {
    return GLOBAL.categories.map((c) => ({ id: c.id, label: c[lang], bookIds: c.books.filter((k) => BOOK_BY_ID[k]) }));
  },
  async featured(lang) {
    return GLOBAL.featured.filter((k) => BOOK_BY_ID[k]).map((k) => summary(BOOK_BY_ID[k], lang));
  },
  async getSummary(bookId, lang) {
    const b = BOOK_BY_ID[bookId];
    const sections = SUMS[bookId]?.[lang] ?? [];
    const words = sections.reduce((n, s) => n + s.body.split(/\s+/).length, 0);
    return { bookId, title: b[lang].title, sections, audioUrl: null, minutes: Math.max(2, Math.round(words / 160)) };
  },
  async explore(lang) {
    const p = (x: { en: string; ar: string | null }) => (lang === 'ar' ? x.ar ?? x.en : x.en);
    return {
      media: EXPLORE.media.map((m) => ({ title: p(m.title), kind: p(m.kind), by: p(m.by), image: m.image })),
      clubs: EXPLORE.clubs.map((c) => ({ title: p(c.title), members: p(c.members), question: p(c.question), image: c.image })),
      more: EXPLORE.more.map((m) => ({ title: p(m.title), description: p(m.desc) })),
    };
  },

  async chat(req) {
    await delay(450);
    const id = req.conversationId || uid();
    const r: ChatReply = reply(req, id);
    if (r.summary) {
      const s = read<string[]>('summaries', []);
      if (!s.includes(r.summary.bookId)) write('summaries', [r.summary.bookId, ...s]);
    }
    r.credits = spend(1);
    return r;
  },
  async startCategory(category, lang) {
    await delay(300);
    const { text, ...rest } = categoryStep({ category, step: 0, answers: [] }, null, lang);
    return { conversationId: uid(), messages: [{ speaker: 'bayan', speakerName: 'Bayan', speakerImage: null, text }], ...rest };
  },
  async feedback(input) {
    const all = read<unknown[]>('feedback', []);
    write('feedback', [...all, { ...input, at: now() }]);
  },

  async signIn(email) {
    const u = read<User | null>('user', null) ?? newUser(email.split('@')[0], email);
    write('user', u);
    write('signedIn', true);
    return u;
  },
  async signUp(name, email) {
    const u = newUser(name, email);
    write('user', u);
    write('signedIn', true);
    return u;
  },
  async signOut() {
    write('signedIn', false);
  },
  async me() {
    return read<boolean>('signedIn', false) ? read<User | null>('user', null) : null;
  },
  async updateMe(patch) {
    const u = { ...(read<User | null>('user', null) ?? newUser('Reader', '')), ...patch };
    write('user', u);
    return u;
  },
  async changePassword(current, next) {
    if (!current || next.length < 8) throw new Error('Password must be at least 8 characters.');
  },

  async favorites() {
    return read<string[]>('favorites', []);
  },
  async setFavorite(bookId, on) {
    const f = read<string[]>('favorites', []).filter((x) => x !== bookId);
    const out = on ? [bookId, ...f] : f;
    write('favorites', out);
    return out;
  },

  async conversations() {
    return read<Conversation[]>('conversations', []).map(({ thread: _t, ...rest }) => rest as ConversationListItem);
  },
  async getConversation(id) {
    return read<Conversation[]>('conversations', []).find((c) => c.id === id) ?? null;
  },
  async saveConversation(c) {
    const all = read<Conversation[]>('conversations', []).filter((x) => x.id !== c.id);
    write('conversations', [{ ...c, updated: now(), messages: c.thread.length }, ...all].slice(0, 100));
  },
  async deleteConversation(id) {
    write('conversations', read<Conversation[]>('conversations', []).filter((x) => x.id !== id));
  },

  async summaries() {
    return read<string[]>('summaries', []);
  },
  async removeSummary(bookId) {
    write('summaries', read<string[]>('summaries', []).filter((x) => x !== bookId));
  },

  async encounters() {
    return read<Encounter[]>('encounters', []);
  },
  async addEncounter(e) {
    const key = (x: Pick<Encounter, 'names'>) => [...x.names].sort().join('|');
    const all = read<Encounter[]>('encounters', []).filter((x) => key(x) !== key(e));
    write('encounters', [{ ...e, id: uid(), updated: now() }, ...all].slice(0, 50));
  },

  async credits() {
    return wallet();
  },
  async topUpPlans() {
    return PLANS;
  },
  async topUp(plan) {
    await delay(600);
    const w = wallet();
    w.balance += plan.credits;
    w.history = [{ id: uid(), label: 'top', amount: plan.credits, date: now() }, ...w.history];
    write('credits', w);
    return w;
  },
};

function newUser(name: string, email: string): User {
  return {
    id: uid(), name, email, joined: now(), topics: [],
    preferences: { rememberConversations: true, useFeedback: true, saveSummaries: true },
  };
}
