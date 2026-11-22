'use client';
/**
 * App-wide state: language, theme, signed-in user, favourites and credits.
 * Everything reads and writes through `api`, so it works the same with the mock or a real backend.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, type Credits, type User } from '@/api';
import type { Lang } from '@/content';
import { t as translate } from '@/i18n/dictionary';
import { seedDemo } from './seed';

export type Theme = 'dark' | 'light';

interface Prefs {
  lang: Lang;
  dir: 'ltr' | 'rtl';
  theme: Theme;
  setLang: (l: Lang) => void;
  setTheme: (t: Theme) => void;
  /** Translate an English UI string into the current language. */
  t: (english: string) => string;
  /** Pick between two strings by language. */
  p: (en: string, ar: string) => string;
  ready: boolean;
  user: User | null;
  setUser: (u: User | null) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  credits: Credits | null;
  refreshCredits: () => void;
}

const Ctx = createContext<Prefs | null>(null);

function readLS(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function writeLS(key: string, v: string) {
  try {
    localStorage.setItem(key, v);
  } catch {
    /* private mode */
  }
}

export function Providers({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');
  const [theme, setThemeState] = useState<Theme>('dark');
  const [ready, setReady] = useState(false);
  /** True once the saved language and theme are known (first client effect). */
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [credits, setCredits] = useState<Credits | null>(null);

  useEffect(() => {
    const l = readLS('bayan-lang') === 'ar' ? 'ar' : 'en';
    const th = readLS('bayan-theme') === 'light' ? 'light' : 'dark';
    setLangState(l);
    setThemeState(th);
    setMounted(true);
    seedDemo(l);
    Promise.all([api.me(), api.favorites(), api.credits()]).then(([u, f, c]) => {
      setUser(u);
      setFavorites(f);
      setCredits(c);
      setReady(true);
    });
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    writeLS('bayan-lang', l);
    const d = document.documentElement;
    d.lang = l;
    d.dir = l === 'ar' ? 'rtl' : 'ltr';
  }, []);

  const setTheme = useCallback((th: Theme) => {
    setThemeState(th);
    writeLS('bayan-theme', th);
    document.documentElement.dataset.theme = th;
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((cur) => {
      const on = !cur.includes(id);
      api.setFavorite(id, on);
      return on ? [id, ...cur] : cur.filter((x) => x !== id);
    });
  }, []);

  const refreshCredits = useCallback(() => {
    api.credits().then(setCredits);
  }, []);

  const value = useMemo<Prefs>(
    () => ({
      lang,
      dir: lang === 'ar' ? 'rtl' : 'ltr',
      theme,
      setLang,
      setTheme,
      t: (s) => translate(s, lang),
      p: (en, ar) => (lang === 'ar' ? ar : en),
      ready,
      user,
      setUser,
      favorites,
      toggleFavorite,
      credits,
      refreshCredits,
    }),
    [lang, theme, setLang, setTheme, ready, user, favorites, toggleFavorite, credits, refreshCredits],
  );

  // Pages render after the language is known, so nothing is fetched or shown in the wrong
  // language. (To server-render localized pages later, store the language in a cookie and
  // read it in the root layout instead.)
  return <Ctx.Provider value={value}>{mounted ? children : null}</Ctx.Provider>;
}

export function usePrefs(): Prefs {
  const v = useContext(Ctx);
  if (!v) throw new Error('usePrefs must be used inside <Providers>');
  return v;
}
