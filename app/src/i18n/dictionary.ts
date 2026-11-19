/**
 * UI strings. English is the key; Arabic comes from ar.json (exported from the live site).
 * Unknown strings fall back to English, so a missing translation never breaks a screen.
 */
import ar from '../content/ar.json';
import type { Lang } from '../content';

const AR = ar as Record<string, string>;

export function translate(english: string, lang: Lang): string {
  if (lang !== 'ar') return english;
  return AR[english] ?? AR[english.trim()] ?? english;
}

/** Strings referenced in code that have no Arabic yet (dev aid). */
export const missing = new Set<string>();
export function t(english: string, lang: Lang): string {
  const out = translate(english, lang);
  if (lang === 'ar' && out === english && /[a-z]/i.test(english) && process.env.NODE_ENV !== 'production') missing.add(english);
  return out;
}
