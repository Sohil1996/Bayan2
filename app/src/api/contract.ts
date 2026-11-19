/**
 * Bayan API contract.
 *
 * This file is the source of truth for what the frontend needs from the backend.
 * The app only talks to the `BayanApi` interface. Two implementations exist:
 *   - `mock/` runs entirely in the browser on the bundled content (today's behaviour).
 *   - `http.ts` calls a real backend at NEXT_PUBLIC_API_URL using the routes noted on each method.
 * docs/API.md describes the same contract for backend developers.
 */
import type { Lang } from '../content';

/* ------------------------------------------------------------------ books */

export interface BookSummary {
  id: string;
  /** Language the book is written in. */
  lang: Lang;
  title: string;
  author: string;
  blurb: string;
  cover: string;
  tags: string[];
}

export interface CharacterDTO {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  /** Real person: shown and described, never voiced in chat. */
  real: boolean;
}

export interface PlaceDTO {
  name: string;
  subtitle: string;
  description: string;
  image: string;
  /** Names of characters connected to this place. */
  characters: string[];
}

export interface EventDTO {
  title: string;
  description: string;
  characters: string[];
}

export interface BookDetail extends BookSummary {
  characters: CharacterDTO[];
  places: PlaceDTO[];
  timeline: EventDTO[];
  /** Suggested first questions for this book. */
  prompts: string[];
  chat: { kicker: string; intro: string; chips: string[] };
  hasReader: boolean;
}

export interface CategoryDTO {
  id: string;
  label: string;
  bookIds: string[];
}

export interface SummaryDTO {
  bookId: string;
  title: string;
  sections: { heading: string; body: string }[];
  /** Audio narration URL. Null in the mock (the browser reads it aloud). */
  audioUrl: string | null;
  minutes: number;
}

/* ------------------------------------------------------------------ chat */

export type ChatContext =
  | { kind: 'general' }
  | { kind: 'book'; bookId: string }
  | { kind: 'character'; bookId: string; characterId: string }
  | { kind: 'duo'; a: { bookId: string; characterId: string }; b: { bookId: string; characterId: string } };

/** Answers to the conversation setup questions (character and duo chats). */
export interface ChatSetup {
  answers: string[];
  /** 0 = short replies … 2 = long replies. */
  length?: 0 | 1 | 2;
}

/** State of the guided category flow ("help me pick from Heritage"). Opaque to the UI: send back what you received. */
export interface CategoryFlow {
  category: string;
  step: 0 | 1 | 2;
  answers: string[];
}

export interface ChatRequest {
  context: ChatContext;
  message: string;
  lang: Lang;
  /** Hide answers that give away the plot. */
  spoilerFree?: boolean;
  setup?: ChatSetup;
  flow?: CategoryFlow | null;
  conversationId?: string | null;
}

export interface ChatReplyMessage {
  /** Who speaks: 'bayan' or a character id. */
  speaker: string;
  speakerName: string;
  speakerImage: string | null;
  text: string;
}

/** A follow-up chip. Most chips just send their label; some open a book or start a character chat instead. */
export interface Suggestion {
  label: string;
  action?: { openBook?: string; talkTo?: { bookId: string; characterId: string } };
}

export interface ChatReply {
  conversationId: string;
  messages: ChatReplyMessage[];
  /** Follow-up suggestion chips. */
  suggestions: Suggestion[];
  /** Recommended book ids, shown as cards in their own block under the reply. */
  books?: string[];
  /** A summary was created and saved to the library. */
  summary?: { bookId: string };
  /** A guided question with fixed options (category flow). */
  ask?: { step: number; options: string[] };
  flow?: CategoryFlow | null;
  /** Card attached to an answer (e.g. "Talk to Lady Macbeth"). */
  card?: { image?: string; title?: string; subtitle?: string; action?: string; characterId?: string } | null;
  /** The answer was hidden because spoiler-free mode is on. */
  spoilerHidden?: boolean;
  /** Credits left after this message. */
  credits?: number;
}

export type FeedbackReason = 'inaccurate' | 'unhelpful' | 'spoiler' | 'offensive' | 'other' | string;

/* ------------------------------------------------------------------ account and library */

export interface User {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatar?: string | null;
  joined: string;
  topics: string[];
  preferences: { rememberConversations: boolean; useFeedback: boolean; saveSummaries: boolean };
}

export interface ConversationListItem {
  id: string;
  title: string;
  context: ChatContext;
  bookId: string | null;
  messages: number;
  updated: string;
}

export interface StoredMessage {
  role: 'user' | 'assistant';
  speaker?: string;
  speakerName?: string;
  text: string;
  books?: string[];
  summary?: { bookId: string };
}

export interface Conversation extends ConversationListItem {
  thread: StoredMessage[];
}

export interface Encounter {
  id: string;
  kind: 'character' | 'duo';
  names: string[];
  bookIds: string[];
  characterIds?: string[];
  topic?: string;
  /** Conversation this encounter happened in, if any. */
  conversationId?: string;
  updated: string;
}

export interface Credits {
  balance: number;
  usedThisMonth: number;
  monthlyAllowance: number;
  history: { id: string; label: string; amount: number; date: string }[];
}

export interface TopUpPlan {
  credits: number;
  price: number;
  currency: 'SAR';
}

export interface ExploreFeed {
  media: { title: string; kind: string; by: string; image: string }[];
  clubs: { title: string; members: string; question: string; image: string }[];
  more: { title: string; description: string }[];
}

/* ------------------------------------------------------------------ the interface */

export interface BayanApi {
  /** GET /books?lang=&category=&q= */
  listBooks(lang: Lang, opts?: { category?: string; q?: string; language?: Lang }): Promise<BookSummary[]>;
  /** GET /books/:id?lang= */
  getBook(id: string, lang: Lang): Promise<BookDetail>;
  /** GET /categories?lang= */
  listCategories(lang: Lang): Promise<CategoryDTO[]>;
  /** GET /featured?lang=  (home book picker order) */
  featured(lang: Lang): Promise<BookSummary[]>;
  /** GET /books/:id/summary?lang= */
  getSummary(bookId: string, lang: Lang): Promise<SummaryDTO>;
  /** GET /explore?lang= */
  explore(lang: Lang): Promise<ExploreFeed>;

  /** POST /chat */
  chat(req: ChatRequest): Promise<ChatReply>;
  /** POST /chat/start-category  → first guided question for a category */
  startCategory(category: string, lang: Lang): Promise<ChatReply>;
  /** POST /chat/feedback */
  feedback(input: { conversationId: string; messageIndex: number; value: 'good' | 'bad'; reason?: FeedbackReason; note?: string }): Promise<void>;

  /** POST /auth/signin, /auth/signup, /auth/signout, GET /me, PATCH /me */
  signIn(email: string, password: string): Promise<User>;
  signUp(name: string, email: string, password: string): Promise<User>;
  signOut(): Promise<void>;
  me(): Promise<User | null>;
  updateMe(patch: Partial<Omit<User, 'id' | 'joined'>>): Promise<User>;
  changePassword(current: string, next: string): Promise<void>;

  /** GET/PUT/DELETE /me/favorites/:bookId */
  favorites(): Promise<string[]>;
  setFavorite(bookId: string, on: boolean): Promise<string[]>;

  /** GET /me/conversations, GET /me/conversations/:id, PUT, DELETE */
  conversations(): Promise<ConversationListItem[]>;
  getConversation(id: string): Promise<Conversation | null>;
  saveConversation(c: Conversation): Promise<void>;
  deleteConversation(id: string): Promise<void>;

  /** GET /me/summaries, DELETE /me/summaries/:bookId */
  summaries(): Promise<string[]>;
  removeSummary(bookId: string): Promise<void>;

  /** GET /me/encounters */
  encounters(): Promise<Encounter[]>;
  addEncounter(e: Omit<Encounter, 'id' | 'updated'>): Promise<void>;

  /** GET /me/credits, GET /credits/plans, POST /me/credits/top-up (payment via gateway) */
  credits(): Promise<Credits>;
  topUpPlans(): Promise<TopUpPlan[]>;
  topUp(plan: TopUpPlan): Promise<Credits>;
}
