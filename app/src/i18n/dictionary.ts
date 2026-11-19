/**
 * UI strings. English is the key; Arabic comes from ar.json (exported from the live site).
 * Unknown strings fall back to English, so a missing translation never breaks a screen.
 */
import ar from '../content/ar.json';
/** Strings the React app adds that the live site never had. Keep this list short. */
import appAr from './app-ar.json';
/** Arabic pairs written inline in the live site's code (harvested from it). */
import inlineAr from './live-inline-ar.json';
import type { Lang } from '../content';

const AR = { ...(appAr as Record<string, string>), ...(inlineAr as Record<string, string>), ...(ar as Record<string, string>) };
const AR_LOWER: Record<string, string> = Object.fromEntries(Object.entries(AR).map(([k, v]) => [k.trim().toLowerCase(), v]));

export function translate(english: string, lang: Lang): string {
  if (lang !== 'ar') return english;
  return AR[english] ?? AR[english.trim()] ?? AR_LOWER[english.trim().toLowerCase()] ?? english;
}

/** Strings referenced in code that have no Arabic yet (dev aid). */
export const missing = new Set<string>();
export function t(english: string, lang: Lang): string {
  const out = translate(english, lang);
  if (lang === 'ar' && out === english && /[a-z]/i.test(english) && process.env.NODE_ENV !== 'production') missing.add(english);
  return out;
}
