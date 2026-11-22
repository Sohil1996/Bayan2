/**
 * Typed access to Bayan's content.
 *
 * The JSON files were exported from the live app (bayan2.vercel.app), with every
 * Arabic and English string exactly as users see it today. In production this
 * content comes from the API (see src/api/contract.ts); the mock API reads it
 * from here.
 */
import booksJson from './books.json';
import globalJson from './global.json';
import exploreJson from './explore.json';

export type Lang = 'en' | 'ar';
export type Bi = { en: string; ar: string | null };

export interface RegexSpec {
  re: string;
  flags: string;
}

export interface Character {
  /** Position in the book's cast; stable id within a book. */
  i: number;
  name: string;
  role: string;
  bio: string;
  /** Image name in /img without extension, e.g. "ch-macbeth". */
  img: string | null;
  /** Real historical person: the guide describes them, they are never voiced. */
  real: boolean;
  /** Third-person description for real people. */
  about: string | null;
}

export interface Place {
  name: string;
  sub: string;
  img: string | null;
  desc: string;
}

export interface TimelineEvent {
  title: string;
  desc: string;
  img: string | null;
}

export interface QaEntry {
  match: RegexSpec;
  answer: string;
  followups: string[];
  /** Optional card shown under the answer (a character to talk to, a place). */
  card: { img?: string; t?: string; s?: string; b?: string } | null;
}

export interface LocalizedBook {
  title: string;
  author: string;
  blurb: string;
  tags: string[];
  characters: Character[];
  places: Place[];
  timeline: TimelineEvent[];
  /** Questions suggested on the home page when the book is selected. */
  prompts: string[];
  chat: { kicker: string; intro: string; chips: string[]; qa: QaEntry[] };
  about: string | null;
  /** Reader passages (Read & Reflect), when available. */
  reader: { title: string; text: string }[] | null;
}

export interface BookRecord {
  id: string;
  /** Language the book is written in. */
  lang: Lang;
  cover: string;
  hasSummary: boolean;
  /** Raw tags used for matching and recommendations (mixed languages). */
  matchTags: string[];
  rawTitle: string;
  rawAuthor: string;
  rawBlurb: string;
  /** Who appears where: c = cast, l = per place, e = per event (English names). */
  who: { c: string[]; l: string[][]; e: string[][] } | null;
  rawCharacters: string[];
  en: LocalizedBook;
  ar: LocalizedBook;
}

export const BOOKS = booksJson as unknown as BookRecord[];
export const BOOK_BY_ID: Record<string, BookRecord> = Object.fromEntries(BOOKS.map((b) => [b.id, b]));

export interface Category {
  id: string;
  en: string;
  ar: string;
  books: string[];
  questions: { en: string; ar: string }[];
}

export interface GlobalContent {
  featured: string[];
  categories: Category[];
  categoryTimeQuestion: { en: string; ar: string }[];
  heroPrompts: { en: string[]; ar: string[] };
  generalChat: { en: { kick: string; intro: string; chips: string[] } };
  feedbackReasons: { id: string; en: string; ar: string }[];
  duo: {
    lines: Record<string, Record<'ambition' | 'love' | 'trust' | 'fate', [string, string]>>;
    topics: { q: string; topic: string }[];
    setup: Record<Lang, { one: [string, string[]][]; two: [string, string[]][]; tone: [string, string[]]; len: [string, string[]] }>;
    freeTopics: { label: string; topic: string }[];
  };
  profile: {
    sections: Record<string, [string, string]>;
    preferenceTypes: { id: string; en: string; ar: string }[];
    styleSuggestions: { en: string; ar: string }[];
  };
  stopWords: string[];
}

export const GLOBAL = globalJson as unknown as GlobalContent;
const ORDER = ['philosophy', 'arabic', 'science', 'history', 'fiction', 'poetry', 'growth', 'classics'];
/** Categories in display order. */
export const CATEGORIES = [...GLOBAL.categories].sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));

export interface ExploreContent {
  media: { title: Bi; kind: Bi; by: Bi; image: string }[];
  clubs: { title: Bi; members: Bi; question: Bi; image: string }[];
  more: { title: Bi; desc: Bi }[];
}
export const EXPLORE = exploreJson as unknown as ExploreContent;

export const img = (name: string | null | undefined, fallback = 'ch-ph') => `/img/${name || fallback}.jpg`;
export const cover = (id: string) => `/img/b-${id}.jpg`;
