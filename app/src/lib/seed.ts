/**
 * Demo content for a first visit, matching the live site's seed(): four past conversations,
 * five favourite books, three duo encounters and five saved summaries. Mock API only.
 */
import { BOOK_BY_ID, GLOBAL, type Lang } from '@/content';
import { usingMock } from '@/api';
import { read, write } from '@/api/mock/store';
import type { Conversation, Encounter } from '@/api/contract';

export function seedDemo(lang: Lang) {
  if (!usingMock || read<boolean>('seeded', false)) return;
  write('seeded', true);
  const D = 864e5;
  const n = Date.now();
  const iso = (ago: number) => new Date(n - D * ago).toISOString();
  const book = (k: string, i: number) => GLOBAL && BOOK_BY_ID[k]?.[lang].prompts[i];
  const convs: Conversation[] = [
    ['coffee', 6, 0.2],
    ['riyhist', 8, 1.5],
    ['jeddah', 6, 3],
    ['hajj', 4, 6],
  ]
    .filter(([k]) => BOOK_BY_ID[k as string])
    .map(([k, count, ago], i) => {
      const title = book(k as string, 0) ?? '';
      return {
        id: `seed-${i}`,
        title,
        context: { kind: 'book', bookId: k as string },
        bookId: k as string,
        messages: count as number,
        updated: iso(ago as number),
        thread: [
          { role: 'user', text: title },
          { role: 'assistant', text: BOOK_BY_ID[k as string][lang].chat.intro },
        ],
      };
    });
  if (!read<Conversation[]>('conversations', []).length) write('conversations', convs);
  if (!read<string[]>('favorites', []).length) write('favorites', ['coffee', 'riyhist', 'jeddah', 'abdulaziz', 'tawq'].filter((k) => BOOK_BY_ID[k]));
  if (!read<Encounter[]>('encounters', []).length) {
    const pairs: [string, string, string, string][] = [
      ['coffee', 'hajj', 'Hospitality and the journey', 'الضيافة والرحلة'],
      ['riyhist', 'jeddah', 'A tale of two cities', 'حكاية مدينتين'],
      ['gebelawi', 'tawq', 'Fate and belonging', 'القدر والانتماء'],
    ];
    write(
      'encounters',
      pairs
        .filter(([a, b]) => BOOK_BY_ID[a]?.en.characters.length && BOOK_BY_ID[b]?.en.characters.length)
        .map(([a, b, en, ar], i) => ({
          id: `seed-e${i}`,
          kind: 'duo',
          names: [BOOK_BY_ID[a][lang].characters[0].name, BOOK_BY_ID[b][lang].characters[0].name],
          bookIds: [a, b],
          characterIds: ['0', '0'],
          topic: lang === 'ar' ? ar : en,
          updated: iso(i + 1),
        })),
    );
  }
  if (!read<string[]>('summaries', []).length) write('summaries', ['coffee', 'riyhist', 'jeddah', 'hajj', 'gebelawi'].filter((k) => BOOK_BY_ID[k]));
}
