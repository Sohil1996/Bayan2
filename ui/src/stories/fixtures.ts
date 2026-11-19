import type { StoryContext } from '@storybook/react-vite';
import type { Book } from '../components/Book';

/** Pick the English or Arabic string based on the Language toolbar. */
export const tr = (ctx: Pick<StoryContext, 'globals'>) => (en: string, ar: string) => (ctx.globals.dir === 'rtl' ? ar : en);

export const isRtl = (ctx: Pick<StoryContext, 'globals'>) => ctx.globals.dir === 'rtl';

type Bi = { en: string; ar: string };
const book = (id: string, t: Bi, a: Bi, tags: [Bi, Bi]) => ({ id, t, a, tags });

const BOOKS = [
  book('macbeth', { en: 'Macbeth', ar: 'ماكبث' }, { en: 'William Shakespeare', ar: 'وليم شكسبير' }, [{ en: 'Tragedy', ar: 'مأساة' }, { en: 'Classic', ar: 'كلاسيكي' }]),
  book('othello', { en: 'Othello', ar: 'عطيل' }, { en: 'William Shakespeare', ar: 'وليم شكسبير' }, [{ en: 'Tragedy', ar: 'مأساة' }, { en: 'Jealousy', ar: 'غيرة' }]),
  book('war', { en: 'War and Peace', ar: 'الحرب والسلام' }, { en: 'Leo Tolstoy', ar: 'ليو تولستوي' }, [{ en: 'Classic', ar: 'كلاسيكي' }, { en: 'History', ar: 'تاريخ' }]),
  book('coffee', { en: 'Saudi Coffee: The Culture of Hospitality', ar: 'القهوة السعودية: ثقافة الضيافة' }, { en: 'Maher Al Nammary', ar: 'ماهر النمري' }, [{ en: 'Heritage', ar: 'تراث' }, { en: 'Hospitality', ar: 'ضيافة' }]),
  book('riyhist', { en: 'The City of Riyadh Through History', ar: 'مدينة الرياض عبر أطوار التاريخ' }, { en: 'Hamad Al-Jasser', ar: 'حمد الجاسر' }, [{ en: 'Riyadh', ar: 'الرياض' }, { en: 'History', ar: 'تاريخ' }]),
  book('gebelawi', { en: 'أولاد حارتنا', ar: 'أولاد حارتنا' }, { en: 'Naguib Mahfouz', ar: 'نجيب محفوظ' }, [{ en: 'Arabic', ar: 'عربي' }, { en: 'Novel', ar: 'رواية' }]),
  book('season', { en: 'موسم صيد الغزلان', ar: 'موسم صيد الغزلان' }, { en: 'Ahmed Mourad', ar: 'أحمد مراد' }, [{ en: 'Arabic', ar: 'عربي' }, { en: 'Thriller', ar: 'تشويق' }]),
];

export const books = (ctx: Pick<StoryContext, 'globals'>): Book[] => {
  const ar = isRtl(ctx);
  return BOOKS.map((b) => ({
    id: b.id,
    title: ar ? b.t.ar : b.t.en,
    author: ar ? b.a.ar : b.a.en,
    cover: `./b-${b.id}.jpg`,
    tags: b.tags.map((x) => (ar ? x.ar : x.en)),
  }));
};

export const characters = (ctx: Pick<StoryContext, 'globals'>) => {
  const t = tr(ctx);
  return [
    { id: 'macbeth', name: t('Macbeth', 'ماكبث'), role: t('A general who wants the crown', 'قائد يطمع في العرش'), img: './ch-macbeth.jpg' },
    { id: 'ladymacbeth', name: t('Lady Macbeth', 'ليدي ماكبث'), role: t('His ambitious wife', 'زوجته الطموحة'), img: './ch-ladymacbeth.jpg' },
    { id: 'iago', name: t('Iago', 'إياغو'), role: t('Othello’s ensign', 'حامل راية عطيل'), img: './ch-iago.jpg' },
    { id: 'othello', name: t('Othello', 'عطيل'), role: t('The Moor of Venice', 'مغربي البندقية'), img: './ch-othello.jpg' },
  ];
};
