import { reply } from '../src/api/mock/engine';
const cases: [any, string, 'en'|'ar'][] = [
  [{ kind: 'general' }, 'something about love and loneliness', 'en'],
  [{ kind: 'general' }, 'رشح لي كتاب عن الحب', 'ar'],
  [{ kind: 'book', bookId: 'macbeth' }, 'Who is Lady Macbeth?', 'en'],
  [{ kind: 'book', bookId: 'macbeth' }, 'recommend similar books', 'en'],
  [{ kind: 'character', bookId: 'macbeth', characterId: '1' }, 'What is love?', 'ar'],
];
for (const [context, message, lang] of cases) {
  const r = reply({ context, message, lang }, 'x');
  console.log(JSON.stringify({ message, text: r.messages.map(m => m.speakerName + ': ' + m.text.slice(0, 110)), books: r.books, chips: r.suggestions.map(s => s.label) }));
}
