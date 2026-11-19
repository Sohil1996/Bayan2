/**
 * Mock chat engine: a faithful port of the reply logic in the current Bayan site
 * (cvAnswer, cvRecs, cfStep, duoLine…), so the React app behaves exactly like
 * production while the real AI backend is built. Replace with HTTP calls by
 * setting NEXT_PUBLIC_API_URL (see ../http.ts).
 */
import { BOOKS, BOOK_BY_ID, GLOBAL, type BookRecord, type Lang } from '../../content';
import { translate } from '../../i18n/dictionary';
import type { CategoryFlow, ChatReply, ChatRequest, ChatSetup, Suggestion } from '../contract';

const RECRX = /recommend|suggest|similar|something (like|else)|another book|other books|what (else )?(should|can) i read|books? (like|about)|رشح|اقتر|كتب|مثل/i;
const SUMRX = /summar|لخّ?ص|ملخص|تلخيص/i;
const SPOILER = /murder|kill|dies|death|dead|ending|ends |ghost|suicide|betray|fall[s]? |قتل|موت|نهاية|ينتهي/i;
const STOP = new Set(GLOBAL.stopWords);
const CATEGORY_AR: Record<string, string> = {
  philosophy: 'التراث', arabic: 'الأدب العربي', science: 'العمارة', history: 'التاريخ',
  fiction: 'الروايات', poetry: 'الكلاسيكيات', growth: 'المعرفة', classics: 'السِّيَر',
};

const L = (b: BookRecord, lang: Lang) => b[lang];
const pick = (lang: Lang, en: string, ar: string) => (lang === 'ar' ? ar : en);
const tokens = (low: string, min = 3) => low.split(/[^\wء-ي]+/).filter((x) => x.length >= min && !STOP.has(x));
const hay = (b: BookRecord) => `${b.rawTitle} ${b.rawAuthor} ${b.rawBlurb}`.toLowerCase();
/** Wrap a title so it keeps its direction inside the other language (FSI … PDI). */
const iso = (t: string) => `⁨${t}⁩`;

/** Books similar to `k` and/or matching the words in `low` (cvRecs). */
export function recommend(k: string | null, low: string): string[] {
  const base = k ? BOOK_BY_ID[k] : null;
  const toks = tokens(low);
  return BOOKS.filter((b) => b.id !== k)
    .map((b) => {
      let s = 0;
      if (base) {
        b.matchTags.forEach((g) => base.matchTags.includes(g) && (s += 2));
        if (b.lang === base.lang) s += 1;
      }
      toks.forEach((w) => {
        if (b.matchTags.join(' ').toLowerCase().includes(w)) s += 8;
        if (hay(b).includes(w)) s += 10;
      });
      return [b.id, s] as const;
    })
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map((x) => x[0]);
}

const askAbout = (b: BookRecord, lang: Lang): Suggestion[] => [
  { label: pick(lang, `Ask about ${b.en.title}`, `حدّثني عن «${b.ar.title}»`), action: { openBook: b.id } },
  { label: pick(lang, 'Show me something shorter', 'اقترح كتابًا أقصر') },
];

const chips = (list: string[]): Suggestion[] => list.map((label) => ({ label }));

/** General librarian chat (no book selected). */
function general(text: string, lang: Lang): Omit<ChatReply, 'conversationId' | 'messages'> & { text: string } {
  const low = text.toLowerCase();
  const toks = tokens(low);
  const scored = BOOKS.map((b) => {
    let s = 0;
    toks.forEach((x) => {
      if (b.matchTags.join(' ').includes(x)) s += 2;
      if (`${b.rawTitle} ${b.rawAuthor}`.toLowerCase().includes(x)) s += 3;
    });
    return [b.id, s] as const;
  }).sort((a, b) => b[1] - a[1]);
  const k = scored[0][1] > 0 ? scored[0][0] : 'coffee';
  const b = BOOK_BY_ID[k];
  const books = [k, ...recommend(k, low).filter((x) => x !== k)].slice(0, 4);
  const t =
    lang === 'ar'
      ? `إليك بعض الكتب التي أقترح أن تبدأ بها. اختياري الأول: «${b.ar.title}». ${b.ar.blurb}`
      : `Here are a few books I’d start with. First pick: “${iso(b.en.title)}” by ${b.en.author}. ${b.en.blurb}`;
  return { text: t, suggestions: askAbout(b, lang), books };
}

/** Guided "help me choose from this category" flow (cfStep). */
export function categoryStep(flow: CategoryFlow, answer: string | null, lang: Lang): Omit<ChatReply, 'conversationId' | 'messages'> & { text: string } {
  const cat = GLOBAL.categories.find((c) => c.id === flow.category) ?? GLOBAL.categories[0];
  if (flow.step === 0) {
    return {
      text: pick(lang, `Happy to help you explore ${cat.en.toLowerCase()}. Before I recommend anything, what are you in the mood for?`, `يسعدني أن أساعدك في استكشاف ${CATEGORY_AR[cat.id] ?? 'هذا التصنيف'}. قبل أن أقترح شيئاً، ما الذي تميل إليه الآن؟`),
      suggestions: [],
      ask: { step: 1, options: cat.questions.map((q) => q[lang]) },
      flow: { ...flow, step: 1 },
    };
  }
  if (flow.step === 1) {
    return {
      text: pick(lang, 'Good. How much time do you have for it?', 'جميل. كم من الوقت لديك لها؟'),
      suggestions: [],
      ask: { step: 2, options: GLOBAL.categoryTimeQuestion.map((q) => q[lang]) },
      flow: { ...flow, step: 2, answers: [...flow.answers, answer ?? ''] },
    };
  }
  const answers = [...flow.answers, answer ?? ''];
  const pool = cat.books.filter((k) => BOOK_BY_ID[k]);
  const toks = answers.join(' ').toLowerCase().split(/[^\wء-ي]+/).filter((x) => x.length > 3);
  const time = answers[1] ?? '';
  const ranked = pool
    .map((k) => {
      const b = BOOK_BY_ID[k];
      const h = `${b.rawTitle} ${b.rawAuthor} ${b.matchTags.join(' ')} ${b.rawBlurb}`.toLowerCase();
      let s = 0;
      toks.forEach((x) => h.includes(x) && (s += 2));
      if (/short|quick|سريع|قصير/.test(time) && b.matchTags.includes('short')) s += 3;
      if (/epic|ملحمة/i.test(time) && (b.matchTags.includes('epic') || b.matchTags.includes('russian'))) s += 3;
      return [k, s] as const;
    })
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map((x) => x[0]);
  const f = BOOK_BY_ID[ranked[0]];
  const by = (a: string) => (/collection/i.test(a) ? ` (from the ${a})` : ` by ${a}`);
  const byAr = (a: string) => (/^من /.test(a) ? `، ${a}` : `، تأليف ${a}`);
  return {
    text: pick(lang, `Based on what you told me, I’d start with “${iso(f.en.title)}”${by(f.en.author)}. ${f.en.blurb} Here are a few more that fit.`, `بناءً على ما أخبرتني به، أقترح أن تبدأ بـ«${f.ar.title}»${byAr(f.ar.author)}. وهذه خيارات أخرى تناسبك.`),
    suggestions: askAbout(f, lang),
    books: ranked,
    flow: null,
  };
}

/** Book chat (cvAnswer with a book in context). */
function book(b: BookRecord, text: string, lang: Lang, spoilerFree: boolean): Omit<ChatReply, 'conversationId' | 'messages'> & { text: string } {
  const lb = L(b, lang);
  const low = text.toLowerCase();
  const bookChips = chips(lb.chat.chips);

  const real = lb.characters.find((c) => c.real && text.includes(c.name));
  if (real) {
    return {
      text: real.about ?? real.bio,
      suggestions: lb.characters.filter((c) => c.name !== real.name).slice(0, 2).map((c) => ({ label: pick(lang, `Tell me about ${c.name}`, `حدّثني عن ${c.name}`) })),
    };
  }
  if (SUMRX.test(text)) {
    return {
      text: pick(lang, `Done. I summarized “${iso(lb.title)}” and added it to your library.`, `تم تلخيص «${lb.title}». أضفته إلى مكتبتك.`),
      suggestions: bookChips,
      summary: { bookId: b.id },
    };
  }
  if (RECRX.test(text) && !/^(talk to|تحدث مع)/i.test(text)) {
    return {
      text: pick(lang, `Here are books from the library that fit what you asked, alongside “${iso(lb.title)}”.`, `إليك كتبًا من المكتبة تناسب ما طلبت، وتكمل حديثنا عن «${lb.title}».`),
      suggestions: bookChips,
      books: recommend(b.id, low),
    };
  }
  for (const q of lb.chat.qa) {
    const re = new RegExp(q.match.re, q.match.flags);
    if (re.test(low) || re.test(text)) {
      if (spoilerFree && SPOILER.test(q.answer)) {
        return {
          text: pick(lang, 'That answer gives away part of the story, so I’m keeping it hidden. Ask me about the characters, the setting or the themes instead.', 'هذا الجواب يكشف أحداثاً من القصة، لذلك أبقيه مخفياً. اسألني عن الشخصيات أو المكان أو الأفكار.'),
          suggestions: bookChips,
          spoilerHidden: true,
        };
      }
      const ch = q.card?.t ? lb.characters.find((c) => c.name === q.card!.t) : undefined;
      return {
        text: q.answer,
        suggestions: chips(q.followups),
        card: q.card
          ? { image: q.card.img ? `/img/${q.card.img}.jpg` : undefined, title: q.card.t, subtitle: q.card.s, action: q.card.b, characterId: ch ? String(ch.i) : undefined }
          : null,
      };
    }
  }
  return {
    text: pick(lang, `${lb.blurb} Ask me about a character, a scene or a theme and I’ll go deeper.`, `${lb.blurb} اسألني عن شخصية أو مشهد أو فكرة وسأتعمّق أكثر.`),
    suggestions: bookChips,
  };
}

/* ---------------------------------------------------------------- characters */

type Topic = 'ambition' | 'love' | 'trust' | 'fate';

export function topicOf(t: string): Topic {
  const l = t.toLowerCase();
  if (/طموح|سلطة|تاج|عرش/.test(l)) return 'ambition';
  if (/حب|قلب|زواج|عشق/.test(l)) return 'love';
  if (/ثق|خيان|صدق|صديق|وفاء/.test(l)) return 'trust';
  if (/ambiti|power|crown|king|throne|want|dream|succe/.test(l)) return 'ambition';
  if (/love|heart|marri|wife|husband|romanc/.test(l)) return 'love';
  if (/trust|friend|betray|honest|lie|loyal/.test(l)) return 'trust';
  return 'fate';
}

const lineKey = (englishName: string) => englishName.toLowerCase().replace(/[^a-z]/g, '');

export interface Speaker {
  bookId: string;
  characterId: string;
  name: string;
  image: string | null;
}

export function speaker(bookId: string, characterId: string, lang: Lang): Speaker {
  const b = BOOK_BY_ID[bookId];
  const c = b[lang].characters[Number(characterId)];
  return { bookId, characterId, name: c.name, image: c.img ? `/img/${c.img}.jpg` : '/img/ch-ph.jpg' };
}

/** First words of a character when the chat opens (duoIntro). */
export function characterIntro(bookId: string, characterId: string, lang: Lang): string {
  const c = BOOK_BY_ID[bookId][lang].characters[Number(characterId)];
  return lang === 'ar' ? `أنا ${c.name}، ${c.role}. ${c.bio}` : `I’m ${c.name}, ${c.role}. ${c.bio}`;
}

/** A character's reply (duoLine). `n` counts how often this topic came up, so lines alternate. */
export function characterLine(bookId: string, characterId: string, text: string, n: number, lang: Lang, setup?: ChatSetup): string {
  const b = BOOK_BY_ID[bookId];
  const idx = Number(characterId);
  const english = b.rawCharacters[idx] ?? '';
  const lines = GLOBAL.duo.lines[lineKey(english)];
  const topic = topicOf(text);
  let out: string;
  if (lines) {
    const en = lines[topic][n % 2];
    out = lang === 'ar' ? translate(en, 'ar') : en;
  } else {
    const c = b[lang].characters[idx];
    out = lang === 'ar' ? `${c.bio} اسألني عن الحكاية.` : `${c.bio} Ask me more about the story.`;
  }
  if (setup?.length === 0) {
    const m = /^(.+?[.!؟?])(\s|$)/.exec(out);
    if (m && m[1].length > 30) out = m[1];
  }
  return out;
}

/* ---------------------------------------------------------------- entry point */

const topicCount = new Map<string, number>();

export function reply(req: ChatRequest, conversationId: string): ChatReply {
  const { context: ctx, message, lang } = req;
  const bayan = { speaker: 'bayan', speakerName: 'Bayan', speakerImage: null };

  if (ctx.kind === 'general') {
    const r = req.flow ? categoryStep(req.flow, message, lang) : general(message, lang);
    const { text, ...rest } = r;
    return { conversationId, messages: [{ ...bayan, text }], ...rest };
  }
  if (ctx.kind === 'book') {
    const { text, ...rest } = book(BOOK_BY_ID[ctx.bookId], message, lang, !!req.spoilerFree);
    return { conversationId, messages: [{ ...bayan, text }], ...rest };
  }
  const people = ctx.kind === 'character' ? [{ bookId: ctx.bookId, characterId: ctx.characterId }] : [ctx.a, ctx.b];
  const topic = topicOf(message);
  const key = `${conversationId}:${topic}`;
  const n = topicCount.get(key) ?? 0;
  topicCount.set(key, n + 1);
  return {
    conversationId,
    messages: people.map((p) => {
      const s = speaker(p.bookId, p.characterId, lang);
      return { speaker: `${p.bookId}:${p.characterId}`, speakerName: s.name, speakerImage: s.image, text: characterLine(p.bookId, p.characterId, message, n, lang, req.setup) };
    }),
    suggestions: GLOBAL.duo.topics.slice(n % 2 ? 4 : 0, n % 2 ? 7 : 3).map((t) => ({ label: lang === 'ar' ? translate(t.q, 'ar') : t.q })),
  };
}
